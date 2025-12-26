import { GObject } from '../core/GObject';
import { MovieClip, type IFrame } from '../display/MovieClip';
import { EFlipType, EObjectPropID } from '../core/FieldTypes';
import type { ByteBuffer } from '../utils/ByteBuffer';
import type { PackageItem } from '../package/PackageItem';

/**
 * GMovieClip
 *
 * Movie clip display object for FairyGUI animations.
 *
 * FairyGUI 动画显示对象
 */
export class GMovieClip extends GObject {
    private _movieClip!: MovieClip;
    private _flip: EFlipType = EFlipType.None;
    private _contentItem: PackageItem | null = null;

    constructor() {
        super();
        this.ensureMovieClip();
    }

    private ensureMovieClip(): void {
        if (!this._movieClip) {
            this.createDisplayObject();
        }
    }

    /**
     * Get the internal movie clip display object
     * 获取内部动画显示对象
     */
    public get movieClip(): MovieClip {
        return this._movieClip;
    }

    /**
     * Get/set playing state
     * 获取/设置播放状态
     */
    public get playing(): boolean {
        return this._movieClip.playing;
    }

    public set playing(value: boolean) {
        if (this._movieClip && this._movieClip.playing !== value) {
            this._movieClip.playing = value;
            this.updateGear(5);
        }
    }

    /**
     * Get/set current frame
     * 获取/设置当前帧
     */
    public get frame(): number {
        return this._movieClip.frame;
    }

    public set frame(value: number) {
        if (this._movieClip && this._movieClip.frame !== value) {
            this._movieClip.frame = value;
            this.updateGear(5);
        }
    }

    /**
     * Get/set color tint
     * 获取/设置颜色着色
     */
    public get color(): string {
        return this._movieClip.color;
    }

    public set color(value: string) {
        if (this._movieClip) {
            this._movieClip.color = value;
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
     * Get/set time scale
     * 获取/设置时间缩放
     */
    public get timeScale(): number {
        return this._movieClip.timeScale;
    }

    public set timeScale(value: number) {
        if (this._movieClip) {
            this._movieClip.timeScale = value;
        }
    }

    /**
     * Rewind to beginning
     * 回到开始
     */
    public rewind(): void {
        this._movieClip.rewind();
    }

    /**
     * Sync status with another movie clip
     * 同步状态
     */
    public syncStatus(anotherMc: GMovieClip): void {
        this._movieClip.syncStatus(anotherMc._movieClip);
    }

    /**
     * Advance by time
     * 按时间前进
     */
    public advance(time: number): void {
        this._movieClip.advance(time);
    }

    /**
     * Set play settings
     * 设置播放设置
     */
    public setPlaySettings(
        start: number = 0,
        end: number = -1,
        times: number = 0,
        endAt: number = -1,
        endCallback?: () => void
    ): void {
        this._movieClip.setPlaySettings(start, end, times, endAt, endCallback);
    }

    protected createDisplayObject(): void {
        this._displayObject = this._movieClip = new MovieClip();
        this._displayObject.gOwner = this;
    }

    /**
     * Construct from package resource
     * 从包资源构建
     */
    public constructFromResource(): void {
        if (!this.packageItem) return;

        this.ensureMovieClip();

        this._contentItem = this.packageItem;

        this.sourceWidth = this._contentItem.width;
        this.sourceHeight = this._contentItem.height;
        this.initWidth = this.sourceWidth;
        this.initHeight = this.sourceHeight;

        // Load frames from package
        if (this._contentItem.owner) {
            this._contentItem.owner.getItemAsset(this._contentItem);
        }

        if (this._contentItem.frames) {
            this._movieClip.interval = this._contentItem.interval;
            this._movieClip.swing = this._contentItem.swing;
            this._movieClip.repeatDelay = this._contentItem.repeatDelay;
            this._movieClip.frames = this._contentItem.frames as IFrame[];
        }

        this.setSize(this.sourceWidth, this.sourceHeight);
    }

    protected handleXYChanged(): void {
        super.handleXYChanged();

        if (this._flip !== EFlipType.None) {
            if (this.scaleX === -1 && this._movieClip) {
                this._movieClip.x += this.width;
            }
            if (this.scaleY === -1 && this._movieClip) {
                this._movieClip.y += this.height;
            }
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
                return this.timeScale;
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
                this.timeScale = value;
                break;
            default:
                super.setProp(index, value);
                break;
        }
    }

    public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_beforeAdd(buffer, beginPos);

        buffer.seek(beginPos, 5);

        if (buffer.readBool()) {
            this.color = buffer.readS();
        }
        this.flip = buffer.readByte();

        const frameValue = buffer.getInt32();
        const playingValue = buffer.readBool();
        if (this._movieClip) {
            this._movieClip.frame = frameValue;
            this._movieClip.playing = playingValue;
        }
    }
}
