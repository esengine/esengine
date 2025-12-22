import { GObject } from '../core/GObject';
import { GComponent } from '../core/GComponent';
import { GObjectPool } from '../core/GObjectPool';
import { MovieClip, type IFrame } from '../display/MovieClip';
import { Container } from '../display/Container';
import type { ISpriteTexture } from '../display/Image';
import { UIPackage } from '../package/UIPackage';
import { getUIConfig } from '../core/UIConfig';
import {
    ELoaderFillType,
    EAlignType,
    EVertAlignType,
    EPackageItemType,
    EObjectPropID,
    EFillMethod
} from '../core/FieldTypes';
import { Rectangle } from '../utils/MathTypes';
import type { ByteBuffer } from '../utils/ByteBuffer';
import type { PackageItem } from '../package/PackageItem';

/**
 * GLoader
 *
 * Content loader component for loading images, movie clips, and components.
 * Supports various fill modes, alignment, and automatic sizing.
 *
 * 内容加载器组件，用于加载图像、动画和组件
 * 支持多种填充模式、对齐方式和自动尺寸
 *
 * Features:
 * - Load images from package or external URL
 * - Load movie clips (animations)
 * - Load components as content
 * - Multiple fill modes (none, scale, fit, etc.)
 * - Alignment control
 * - Error sign display
 */
export class GLoader extends GObject {
    private _url: string = '';
    private _align: EAlignType = EAlignType.Left;
    private _valign: EVertAlignType = EVertAlignType.Top;
    private _autoSize: boolean = false;
    private _fill: ELoaderFillType = ELoaderFillType.None;
    private _shrinkOnly: boolean = false;
    private _useResize: boolean = false;
    private _showErrorSign: boolean = true;
    private _contentItem: PackageItem | null = null;
    private _content!: MovieClip;
    private _errorSign: GObject | null = null;
    private _content2: GComponent | null = null;
    private _updatingLayout: boolean = false;

    private static _errorSignPool: GObjectPool = new GObjectPool();

    constructor() {
        super();
    }

    protected createDisplayObject(): void {
        this._displayObject = new Container();
        this._displayObject.gOwner = this;
        this._displayObject.touchable = true;

        this._content = new MovieClip();
        this._displayObject.addChild(this._content);
    }

    public dispose(): void {
        if (!this._contentItem && this._content?.texture) {
            this.freeExternal(this._content.texture);
        }

        if (this._content2) {
            this._content2.dispose();
            this._content2 = null;
        }

        super.dispose();
    }

    /**
     * Get/set resource URL
     * 获取/设置资源 URL
     */
    public get url(): string {
        return this._url;
    }

    public set url(value: string) {
        if (this._url === value) return;

        this._url = value;
        this.loadContent();
        this.updateGear(7);
    }

    /**
     * Icon alias for url
     * URL 的图标别名
     */
    public get icon(): string {
        return this._url;
    }

    public set icon(value: string) {
        this.url = value;
    }

    /**
     * Get/set horizontal alignment
     * 获取/设置水平对齐
     */
    public get align(): EAlignType {
        return this._align;
    }

    public set align(value: EAlignType) {
        if (this._align !== value) {
            this._align = value;
            this.updateLayout();
        }
    }

    /**
     * Get/set vertical alignment
     * 获取/设置垂直对齐
     */
    public get verticalAlign(): EVertAlignType {
        return this._valign;
    }

    public set verticalAlign(value: EVertAlignType) {
        if (this._valign !== value) {
            this._valign = value;
            this.updateLayout();
        }
    }

    /**
     * Get/set fill type
     * 获取/设置填充类型
     */
    public get fill(): ELoaderFillType {
        return this._fill;
    }

    public set fill(value: ELoaderFillType) {
        if (this._fill !== value) {
            this._fill = value;
            this.updateLayout();
        }
    }

    /**
     * Get/set shrink only mode
     * 获取/设置仅缩小模式
     */
    public get shrinkOnly(): boolean {
        return this._shrinkOnly;
    }

    public set shrinkOnly(value: boolean) {
        if (this._shrinkOnly !== value) {
            this._shrinkOnly = value;
            this.updateLayout();
        }
    }

    /**
     * Get/set use resize mode
     * 获取/设置使用 resize 模式
     */
    public get useResize(): boolean {
        return this._useResize;
    }

    public set useResize(value: boolean) {
        if (this._useResize !== value) {
            this._useResize = value;
            this.updateLayout();
        }
    }

    /**
     * Get/set auto size mode
     * 获取/设置自动尺寸模式
     */
    public get autoSize(): boolean {
        return this._autoSize;
    }

    public set autoSize(value: boolean) {
        if (this._autoSize !== value) {
            this._autoSize = value;
            this.updateLayout();
        }
    }

    /**
     * Get/set playing state (for movie clips)
     * 获取/设置播放状态（用于动画）
     */
    public get playing(): boolean {
        return this._content?.playing ?? false;
    }

    public set playing(value: boolean) {
        if (this._content && this._content.playing !== value) {
            this._content.playing = value;
            this.updateGear(5);
        }
    }

    /**
     * Get/set current frame (for movie clips)
     * 获取/设置当前帧（用于动画）
     */
    public get frame(): number {
        return this._content?.frame ?? 0;
    }

    public set frame(value: number) {
        if (this._content && this._content.frame !== value) {
            this._content.frame = value;
            this.updateGear(5);
        }
    }

    /**
     * Get/set color tint
     * 获取/设置颜色着色
     */
    public get color(): string {
        return this._content?.color ?? '#FFFFFF';
    }

    public set color(value: string) {
        if (this._content && this._content.color !== value) {
            this._content.color = value;
            this.updateGear(4);
        }
    }

    /**
     * Get/set fill method
     * 获取/设置填充方法
     */
    public get fillMethod(): EFillMethod {
        return this._content?.fillMethod ?? EFillMethod.None;
    }

    public set fillMethod(value: EFillMethod) {
        if (this._content) {
            this._content.fillMethod = value;
        }
    }

    /**
     * Get/set fill origin
     * 获取/设置填充起点
     */
    public get fillOrigin(): number {
        return this._content?.fillOrigin ?? 0;
    }

    public set fillOrigin(value: number) {
        if (this._content) {
            this._content.fillOrigin = value;
        }
    }

    /**
     * Get/set fill clockwise
     * 获取/设置顺时针填充
     */
    public get fillClockwise(): boolean {
        return this._content?.fillClockwise ?? true;
    }

    public set fillClockwise(value: boolean) {
        if (this._content) {
            this._content.fillClockwise = value;
        }
    }

    /**
     * Get/set fill amount
     * 获取/设置填充量
     */
    public get fillAmount(): number {
        return this._content?.fillAmount ?? 1;
    }

    public set fillAmount(value: number) {
        if (this._content) {
            this._content.fillAmount = value;
        }
    }

    /**
     * Get/set show error sign
     * 获取/设置显示错误标志
     */
    public get showErrorSign(): boolean {
        return this._showErrorSign;
    }

    public set showErrorSign(value: boolean) {
        this._showErrorSign = value;
    }

    /**
     * Get internal content (MovieClip)
     * 获取内部内容（MovieClip）
     */
    public get content(): MovieClip {
        return this._content;
    }

    /**
     * Get component content (when loading component)
     * 获取组件内容（当加载组件时）
     */
    public get component(): GComponent | null {
        return this._content2;
    }

    /**
     * Load content based on URL
     * 根据 URL 加载内容
     */
    protected loadContent(): void {
        this.clearContent();

        if (!this._url) return;

        if (this._url.startsWith('ui://')) {
            this.loadFromPackage(this._url);
        } else {
            this.loadExternal();
        }
    }

    /**
     * Load content from package
     * 从包加载内容
     */
    protected loadFromPackage(itemURL: string): void {
        this._contentItem = UIPackage.getItemByURL(itemURL);

        if (this._contentItem) {
            // Get branch and high resolution versions
            const branchItem = this._contentItem.getBranch();
            this.sourceWidth = branchItem.width;
            this.sourceHeight = branchItem.height;

            const hiResItem = branchItem.getHighResolution();
            hiResItem.load();

            if (this._autoSize) {
                this.setSize(this.sourceWidth, this.sourceHeight);
            }

            if (hiResItem.type === EPackageItemType.Image) {
                if (!hiResItem.texture) {
                    this.setErrorState();
                } else {
                    this._content.texture = hiResItem.texture;
                    this._content.scale9Grid = hiResItem.scale9Grid
                        ? new Rectangle(
                              hiResItem.scale9Grid.x,
                              hiResItem.scale9Grid.y,
                              hiResItem.scale9Grid.width,
                              hiResItem.scale9Grid.height
                          )
                        : null;
                    this._content.scaleByTile = hiResItem.scaleByTile || false;
                    this._content.tileGridIndice = hiResItem.tileGridIndice || 0;
                    this.sourceWidth = hiResItem.width;
                    this.sourceHeight = hiResItem.height;
                    this.updateLayout();
                }
            } else if (hiResItem.type === EPackageItemType.MovieClip) {
                this.sourceWidth = hiResItem.width;
                this.sourceHeight = hiResItem.height;
                this._content.interval = hiResItem.interval || 0;
                this._content.swing = hiResItem.swing || false;
                this._content.repeatDelay = hiResItem.repeatDelay || 0;
                this._content.frames = hiResItem.frames || [];
                this.updateLayout();
            } else if (hiResItem.type === EPackageItemType.Component) {
                const obj = UIPackage.createObjectFromURL(itemURL);
                if (!obj) {
                    this.setErrorState();
                } else if (!(obj instanceof GComponent)) {
                    obj.dispose();
                    this.setErrorState();
                } else {
                    this._content2 = obj;
                    if (this._displayObject && this._content2.displayObject) {
                        this._displayObject.addChild(this._content2.displayObject);
                    }
                    this.updateLayout();
                }
            } else {
                this.setErrorState();
            }
        } else {
            this.setErrorState();
        }
    }

    /**
     * Load external resource (to be overridden)
     * 加载外部资源（可重写）
     */
    protected loadExternal(): void {
        // Default implementation: load image via fetch
        this.loadExternalImage(this._url);
    }

    /**
     * Load external image
     * 加载外部图像
     */
    protected async loadExternalImage(url: string): Promise<void> {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const bitmap = await createImageBitmap(blob);

            // Create texture ID from URL
            this.onExternalLoadSuccess(url, bitmap.width, bitmap.height);
        } catch (error) {
            console.error(`Failed to load external image: ${url}`, error);
            this.onExternalLoadFailed();
        }
    }

    /**
     * Free external resource
     * 释放外部资源
     */
    protected freeExternal(_texture: string | number | ISpriteTexture | null): void {
        // Override in subclass if needed
    }

    /**
     * Called when external resource loaded successfully
     * 外部资源加载成功时调用
     */
    protected onExternalLoadSuccess(textureId: string | number, width: number, height: number): void {
        this._content.texture = textureId;
        this._content.scale9Grid = null;
        this._content.scaleByTile = false;
        this.sourceWidth = width;
        this.sourceHeight = height;
        this.updateLayout();
    }

    /**
     * Called when external resource failed to load
     * 外部资源加载失败时调用
     */
    protected onExternalLoadFailed(): void {
        this.setErrorState();
    }

    /**
     * Set error state and show error sign
     * 设置错误状态并显示错误标志
     */
    private setErrorState(): void {
        if (!this._showErrorSign) return;

        if (!this._errorSign) {
            const errorSignUrl = getUIConfig('loaderErrorSign');
            if (errorSignUrl) {
                this._errorSign = GLoader._errorSignPool.getObject(errorSignUrl);
            }
        }

        if (this._errorSign) {
            this._errorSign.setSize(this.width, this.height);
            if (this._displayObject && this._errorSign.displayObject) {
                this._displayObject.addChild(this._errorSign.displayObject);
            }
        }
    }

    /**
     * Clear error state
     * 清除错误状态
     */
    private clearErrorState(): void {
        if (this._errorSign) {
            if (this._displayObject && this._errorSign.displayObject) {
                this._displayObject.removeChild(this._errorSign.displayObject);
            }
            GLoader._errorSignPool.returnObject(this._errorSign);
            this._errorSign = null;
        }
    }

    /**
     * Update content layout
     * 更新内容布局
     */
    protected updateLayout(): void {
        if (!this._content) return;

        if (!this._content2 && !this._content.texture && !this._content.frames?.length) {
            if (this._autoSize) {
                this._updatingLayout = true;
                this.setSize(50, 30);
                this._updatingLayout = false;
            }
            return;
        }

        let cw = this.sourceWidth;
        let ch = this.sourceHeight;

        if (this._autoSize) {
            this._updatingLayout = true;
            if (cw === 0) cw = 50;
            if (ch === 0) ch = 30;
            this.setSize(cw, ch);
            this._updatingLayout = false;

            if (cw === this._width && ch === this._height) {
                if (this._content2) {
                    this._content2.setXY(0, 0);
                    if (this._useResize) {
                        this._content2.setSize(cw, ch);
                    } else {
                        this._content2.setScale(1, 1);
                    }
                } else {
                    this._content.width = cw;
                    this._content.height = ch;
                    this._content.x = 0;
                    this._content.y = 0;
                }
                return;
            }
        }

        let sx = 1;
        let sy = 1;

        if (this._fill !== ELoaderFillType.None) {
            sx = this.width / this.sourceWidth;
            sy = this.height / this.sourceHeight;

            if (sx !== 1 || sy !== 1) {
                if (this._fill === ELoaderFillType.ScaleMatchHeight) {
                    sx = sy;
                } else if (this._fill === ELoaderFillType.ScaleMatchWidth) {
                    sy = sx;
                } else if (this._fill === ELoaderFillType.Scale) {
                    if (sx > sy) sx = sy;
                    else sy = sx;
                } else if (this._fill === ELoaderFillType.ScaleNoBorder) {
                    if (sx > sy) sy = sx;
                    else sx = sy;
                }

                if (this._shrinkOnly) {
                    if (sx > 1) sx = 1;
                    if (sy > 1) sy = 1;
                }

                cw = this.sourceWidth * sx;
                ch = this.sourceHeight * sy;
            }
        }

        if (this._content2) {
            if (this._useResize) {
                this._content2.setSize(cw, ch);
            } else {
                this._content2.setScale(sx, sy);
            }
        } else {
            this._content.width = cw;
            this._content.height = ch;
        }

        // Calculate position based on alignment
        let nx = 0;
        let ny = 0;

        if (this._align === EAlignType.Center) {
            nx = Math.floor((this.width - cw) / 2);
        } else if (this._align === EAlignType.Right) {
            nx = this.width - cw;
        }

        if (this._valign === EVertAlignType.Middle) {
            ny = Math.floor((this.height - ch) / 2);
        } else if (this._valign === EVertAlignType.Bottom) {
            ny = this.height - ch;
        }

        if (this._content2) {
            this._content2.setXY(nx, ny);
        } else {
            this._content.x = nx;
            this._content.y = ny;
        }
    }

    /**
     * Clear content
     * 清除内容
     */
    private clearContent(): void {
        this.clearErrorState();

        if (this._content) {
            if (!this._contentItem && this._content.texture) {
                this.freeExternal(this._content.texture);
            }
            this._content.texture = null;
            this._content.frames = [];
        }

        if (this._content2) {
            this._content2.dispose();
            this._content2 = null;
        }

        this._contentItem = null;
    }

    protected handleSizeChanged(): void {
        super.handleSizeChanged();

        if (!this._updatingLayout) {
            this.updateLayout();
        }
    }

    public getProp(index: number): any {
        switch (index) {
            case EObjectPropID.Color:
                return this.color;
            case EObjectPropID.Playing:
                return this.playing;
            case EObjectPropID.Frame:
                return this.frame;
            case EObjectPropID.TimeScale:
                return this._content?.timeScale ?? 1;
            default:
                return super.getProp(index);
        }
    }

    public setProp(index: number, value: any): void {
        switch (index) {
            case EObjectPropID.Color:
                this.color = value;
                break;
            case EObjectPropID.Playing:
                this.playing = value;
                break;
            case EObjectPropID.Frame:
                this.frame = value;
                break;
            case EObjectPropID.TimeScale:
                if (this._content) {
                    this._content.timeScale = value;
                }
                break;
            case EObjectPropID.DeltaTime:
                if (this._content) {
                    this._content.advance(value);
                }
                break;
            default:
                super.setProp(index, value);
                break;
        }
    }

    public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_beforeAdd(buffer, beginPos);

        buffer.seek(beginPos, 5);

        this._url = buffer.readS();

        const alignValue = buffer.readByte();
        this._align =
            alignValue === 0 ? EAlignType.Left : alignValue === 1 ? EAlignType.Center : EAlignType.Right;

        const valignValue = buffer.readByte();
        this._valign =
            valignValue === 0 ? EVertAlignType.Top : valignValue === 1 ? EVertAlignType.Middle : EVertAlignType.Bottom;

        this._fill = buffer.readByte();
        this._shrinkOnly = buffer.readBool();
        this._autoSize = buffer.readBool();
        this._showErrorSign = buffer.readBool();

        const playingValue = buffer.readBool();
        const frameValue = buffer.getInt32();
        if (this._content) {
            this._content.playing = playingValue;
            this._content.frame = frameValue;
        }

        if (buffer.readBool()) {
            this.color = buffer.readS();
        }

        const fillMethodValue = buffer.readByte();
        if (this._content) {
            this._content.fillMethod = fillMethodValue;
            if (this._content.fillMethod !== EFillMethod.None) {
                this._content.fillOrigin = buffer.readByte();
                this._content.fillClockwise = buffer.readBool();
                this._content.fillAmount = buffer.getFloat32();
            }
        } else if (fillMethodValue !== EFillMethod.None) {
            // Skip bytes if _content not ready
            buffer.readByte();  // fillOrigin
            buffer.readBool();  // fillClockwise
            buffer.getFloat32(); // fillAmount
        }

        if (buffer.version >= 7) {
            this._useResize = buffer.readBool();
        }

        if (this._url) {
            this.loadContent();
        }
    }
}
