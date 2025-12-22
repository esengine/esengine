import { GObject } from '../core/GObject';
import { Image } from '../display/Image';
import { Rectangle } from '../utils/MathTypes';
import { EFlipType, EFillMethod, EObjectPropID } from '../core/FieldTypes';
import type { ByteBuffer } from '../utils/ByteBuffer';
import type { PackageItem } from '../package/PackageItem';

/**
 * GImage
 *
 * Image display object for FairyGUI.
 *
 * FairyGUI 图像显示对象
 */
export class GImage extends GObject {
    private _image!: Image;
    private _flip: EFlipType = EFlipType.None;
    private _contentItem: PackageItem | null = null;

    constructor() {
        super();
        // Ensure _image is initialized - super() calls createDisplayObject() but
        // class field initializers run after super(), which may cause issues
        this.ensureImage();
    }

    private ensureImage(): void {
        if (!this._image) {
            this.createDisplayObject();
        }
    }

    /**
     * Get the internal image display object
     * 获取内部图像显示对象
     */
    public get image(): Image {
        return this._image;
    }

    /**
     * Get/set color tint
     * 获取/设置颜色着色
     */
    public get color(): string {
        return this._image.color;
    }

    public set color(value: string) {
        if (this._image && this._image.color !== value) {
            this._image.color = value;
            this.updateGear(4);
        }
    }

    /**
     * Get/set flip type
     * 获取/设置翻转类型
     */
    public get flip(): EFlipType {
        return this._flip;
    }

    public set flip(value: EFlipType) {
        if (this._flip !== value) {
            this._flip = value;

            let sx = 1;
            let sy = 1;
            if (this._flip === EFlipType.Horizontal || this._flip === EFlipType.Both) {
                sx = -1;
            }
            if (this._flip === EFlipType.Vertical || this._flip === EFlipType.Both) {
                sy = -1;
            }
            this.setScale(sx, sy);
            this.handleXYChanged();
        }
    }

    /**
     * Get/set fill method
     * 获取/设置填充方法
     */
    public get fillMethod(): EFillMethod {
        return this._image.fillMethod;
    }

    public set fillMethod(value: EFillMethod) {
        if (this._image) {
            this._image.fillMethod = value;
        }
    }

    /**
     * Get/set fill origin
     * 获取/设置填充起点
     */
    public get fillOrigin(): number {
        return this._image.fillOrigin;
    }

    public set fillOrigin(value: number) {
        if (this._image) {
            this._image.fillOrigin = value;
        }
    }

    /**
     * Get/set fill clockwise
     * 获取/设置填充顺时针方向
     */
    public get fillClockwise(): boolean {
        return this._image.fillClockwise;
    }

    public set fillClockwise(value: boolean) {
        if (this._image) {
            this._image.fillClockwise = value;
        }
    }

    /**
     * Get/set fill amount (0-1)
     * 获取/设置填充量（0-1）
     */
    public get fillAmount(): number {
        return this._image.fillAmount;
    }

    public set fillAmount(value: number) {
        if (this._image) {
            this._image.fillAmount = value;
        }
    }

    protected createDisplayObject(): void {
        this._displayObject = this._image = new Image();
        this._image.touchable = false;
        this._displayObject.gOwner = this;
    }

    /**
     * Construct from package resource
     * 从包资源构建
     */
    public constructFromResource(): void {
        if (!this.packageItem) return;

        this.ensureImage();

        this._contentItem = this.packageItem;

        this.sourceWidth = this._contentItem.width;
        this.sourceHeight = this._contentItem.height;
        this.initWidth = this.sourceWidth;
        this.initHeight = this.sourceHeight;

        this._image.scale9Grid = this._contentItem.scale9Grid
            ? new Rectangle(
                  this._contentItem.scale9Grid.x,
                  this._contentItem.scale9Grid.y,
                  this._contentItem.scale9Grid.width,
                  this._contentItem.scale9Grid.height
              )
            : null;
        this._image.scaleByTile = this._contentItem.scaleByTile;
        this._image.tileGridIndice = this._contentItem.tileGridIndice;

        // Load texture from package (this decodes the sprite info)
        if (this._contentItem.owner) {
            this._contentItem.owner.getItemAsset(this._contentItem);
        }
        this._image.texture = this._contentItem.texture;

        this.setSize(this.sourceWidth, this.sourceHeight);
    }

    protected handleXYChanged(): void {
        super.handleXYChanged();

        if (this._flip !== EFlipType.None) {
            if (this.scaleX === -1 && this._image) {
                this._image.x += this.width;
            }
            if (this.scaleY === -1 && this._image) {
                this._image.y += this.height;
            }
        }
    }

    public getProp(index: number): any {
        if (index === EObjectPropID.Color) {
            return this.color;
        }
        return super.getProp(index);
    }

    public setProp(index: number, value: any): void {
        if (index === EObjectPropID.Color) {
            this.color = value;
        } else {
            super.setProp(index, value);
        }
    }

    public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_beforeAdd(buffer, beginPos);

        buffer.seek(beginPos, 5);

        if (buffer.readBool()) {
            this.color = buffer.readS();
        }
        this.flip = buffer.readByte();

        const fillMethodValue = buffer.readByte();
        if (this._image) {
            this._image.fillMethod = fillMethodValue;
            if (this._image.fillMethod !== EFillMethod.None) {
                this._image.fillOrigin = buffer.readByte();
                this._image.fillClockwise = buffer.readBool();
                this._image.fillAmount = buffer.getFloat32();
            }
        } else if (fillMethodValue !== EFillMethod.None) {
            // Skip bytes if _image not ready
            buffer.readByte();  // fillOrigin
            buffer.readBool();  // fillClockwise
            buffer.getFloat32(); // fillAmount
        }
    }
}
