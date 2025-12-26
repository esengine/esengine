import { GComponent } from '../core/GComponent';
import { GObject } from '../core/GObject';
import { GImage } from './GImage';
import { EProgressTitleType, EObjectPropID, EFillMethod } from '../core/FieldTypes';
import type { ByteBuffer } from '../utils/ByteBuffer';

/**
 * GProgressBar
 *
 * Progress bar component.
 *
 * 进度条组件
 */
export class GProgressBar extends GComponent {
    private _min: number = 0;
    private _max: number = 100;
    private _value: number = 50;
    private _titleType: EProgressTitleType = EProgressTitleType.Percent;
    private _reverse: boolean = false;

    private _titleObject: GObject | null = null;
    private _aniObject: GObject | null = null;
    private _barObjectH: GObject | null = null;
    private _barObjectV: GObject | null = null;
    private _barMaxWidth: number = 0;
    private _barMaxHeight: number = 0;
    private _barMaxWidthDelta: number = 0;
    private _barMaxHeightDelta: number = 0;
    private _barStartX: number = 0;
    private _barStartY: number = 0;

    constructor() {
        super();
    }

    /**
     * Get/set title type
     * 获取/设置标题类型
     */
    public get titleType(): EProgressTitleType {
        return this._titleType;
    }

    public set titleType(value: EProgressTitleType) {
        if (this._titleType !== value) {
            this._titleType = value;
            this.update(this._value);
        }
    }

    /**
     * Get/set minimum value
     * 获取/设置最小值
     */
    public get min(): number {
        return this._min;
    }

    public set min(value: number) {
        if (this._min !== value) {
            this._min = value;
            this.update(this._value);
        }
    }

    /**
     * Get/set maximum value
     * 获取/设置最大值
     */
    public get max(): number {
        return this._max;
    }

    public set max(value: number) {
        if (this._max !== value) {
            this._max = value;
            this.update(this._value);
        }
    }

    /**
     * Get/set current value
     * 获取/设置当前值
     */
    public get value(): number {
        return this._value;
    }

    public set value(value: number) {
        if (this._value !== value) {
            this._value = value;
            this.update(value);
        }
    }

    /**
     * Update progress bar display
     * 更新进度条显示
     */
    public update(newValue: number): void {
        let percent = this.clamp01((newValue - this._min) / (this._max - this._min));

        if (this._titleObject) {
            switch (this._titleType) {
                case EProgressTitleType.Percent:
                    this._titleObject.text = Math.floor(percent * 100) + '%';
                    break;
                case EProgressTitleType.ValueAndMax:
                    this._titleObject.text =
                        Math.floor(newValue) + '/' + Math.floor(this._max);
                    break;
                case EProgressTitleType.Value:
                    this._titleObject.text = '' + Math.floor(newValue);
                    break;
                case EProgressTitleType.Max:
                    this._titleObject.text = '' + Math.floor(this._max);
                    break;
            }
        }

        const fullWidth = this.width - this._barMaxWidthDelta;
        const fullHeight = this.height - this._barMaxHeightDelta;

        if (!this._reverse) {
            if (this._barObjectH) {
                if (!this.setFillAmount(this._barObjectH, percent)) {
                    this._barObjectH.width = Math.round(fullWidth * percent);
                }
            }
            if (this._barObjectV) {
                if (!this.setFillAmount(this._barObjectV, percent)) {
                    this._barObjectV.height = Math.round(fullHeight * percent);
                }
            }
        } else {
            if (this._barObjectH) {
                if (!this.setFillAmount(this._barObjectH, 1 - percent)) {
                    this._barObjectH.width = Math.round(fullWidth * percent);
                    this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
                }
            }
            if (this._barObjectV) {
                if (!this.setFillAmount(this._barObjectV, 1 - percent)) {
                    this._barObjectV.height = Math.round(fullHeight * percent);
                    this._barObjectV.y =
                        this._barStartY + (fullHeight - this._barObjectV.height);
                }
            }
        }

        if (this._aniObject) {
            this._aniObject.setProp(EObjectPropID.Frame, Math.floor(percent * 100));
        }
    }

    private setFillAmount(bar: GObject, percent: number): boolean {
        if (bar instanceof GImage && bar.fillMethod !== EFillMethod.None) {
            bar.fillAmount = percent;
            return true;
        }
        return false;
    }

    private clamp01(value: number): number {
        if (value < 0) return 0;
        if (value > 1) return 1;
        return value;
    }

    protected constructExtension(buffer: ByteBuffer): void {
        buffer.seek(0, 6);

        this._titleType = buffer.readByte();
        this._reverse = buffer.readBool();

        this._titleObject = this.getChild('title');
        this._barObjectH = this.getChild('bar');
        this._barObjectV = this.getChild('bar_v');
        this._aniObject = this.getChild('ani');

        if (this._barObjectH) {
            this._barMaxWidth = this._barObjectH.width;
            this._barMaxWidthDelta = this.width - this._barMaxWidth;
            this._barStartX = this._barObjectH.x;
        }
        if (this._barObjectV) {
            this._barMaxHeight = this._barObjectV.height;
            this._barMaxHeightDelta = this.height - this._barMaxHeight;
            this._barStartY = this._barObjectV.y;
        }
    }

    protected handleSizeChanged(): void {
        super.handleSizeChanged();

        if (this._barObjectH) {
            this._barMaxWidth = this.width - this._barMaxWidthDelta;
        }
        if (this._barObjectV) {
            this._barMaxHeight = this.height - this._barMaxHeightDelta;
        }
        if (!this._underConstruct) {
            this.update(this._value);
        }
    }

    public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_afterAdd(buffer, beginPos);

        if (!buffer.seek(beginPos, 6)) {
            this.update(this._value);
            return;
        }

        if (buffer.readByte() !== this.packageItem?.objectType) {
            this.update(this._value);
            return;
        }

        this._value = buffer.getInt32();
        this._max = buffer.getInt32();
        if (buffer.version >= 2) {
            this._min = buffer.getInt32();
        }

        this.update(this._value);
    }
}
