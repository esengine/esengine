import { GComponent } from '../core/GComponent';
import { GObject } from '../core/GObject';
import { FGUIEvents } from '../events/Events';
import { EProgressTitleType } from '../core/FieldTypes';
import { Point } from '../utils/MathTypes';
import type { ByteBuffer } from '../utils/ByteBuffer';

/**
 * GSlider
 *
 * Slider component with draggable grip.
 *
 * 滑动条组件，支持拖动手柄
 */
export class GSlider extends GComponent {
    private _min: number = 0;
    private _max: number = 100;
    private _value: number = 50;
    private _titleType: EProgressTitleType = EProgressTitleType.Percent;
    private _reverse: boolean = false;
    private _wholeNumbers: boolean = false;

    private _titleObject: GObject | null = null;
    private _barObjectH: GObject | null = null;
    private _barObjectV: GObject | null = null;
    private _barMaxWidth: number = 0;
    private _barMaxHeight: number = 0;
    private _barMaxWidthDelta: number = 0;
    private _barMaxHeightDelta: number = 0;
    private _gripObject: GObject | null = null;
    private _clickPos: Point = new Point();
    private _clickPercent: number = 0;
    private _barStartX: number = 0;
    private _barStartY: number = 0;

    /** Allow click on bar to change value | 允许点击条改变值 */
    public changeOnClick: boolean = true;

    /** Allow dragging | 允许拖动 */
    public canDrag: boolean = true;

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
        this._titleType = value;
    }

    /**
     * Get/set whole numbers mode
     * 获取/设置整数模式
     */
    public get wholeNumbers(): boolean {
        return this._wholeNumbers;
    }

    public set wholeNumbers(value: boolean) {
        if (this._wholeNumbers !== value) {
            this._wholeNumbers = value;
            this.update();
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
            this.update();
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
            this.update();
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
            this.update();
        }
    }

    /**
     * Update slider display
     * 更新滑动条显示
     */
    public update(): void {
        this.updateWithPercent(
            (this._value - this._min) / (this._max - this._min),
            false
        );
    }

    private updateWithPercent(percent: number, bEmitEvent: boolean): void {
        percent = this.clamp01(percent);

        if (bEmitEvent) {
            let newValue = this.clamp(
                this._min + (this._max - this._min) * percent,
                this._min,
                this._max
            );
            if (this._wholeNumbers) {
                newValue = Math.round(newValue);
                percent = this.clamp01((newValue - this._min) / (this._max - this._min));
            }

            if (newValue !== this._value) {
                this._value = newValue;
                this.emit(FGUIEvents.STATE_CHANGED);
            }
        }

        if (this._titleObject) {
            switch (this._titleType) {
                case EProgressTitleType.Percent:
                    this._titleObject.text = Math.floor(percent * 100) + '%';
                    break;
                case EProgressTitleType.ValueAndMax:
                    this._titleObject.text = this._value + '/' + this._max;
                    break;
                case EProgressTitleType.Value:
                    this._titleObject.text = '' + this._value;
                    break;
                case EProgressTitleType.Max:
                    this._titleObject.text = '' + this._max;
                    break;
            }
        }

        const fullWidth = this.width - this._barMaxWidthDelta;
        const fullHeight = this.height - this._barMaxHeightDelta;

        if (!this._reverse) {
            if (this._barObjectH) {
                this._barObjectH.width = Math.round(fullWidth * percent);
            }
            if (this._barObjectV) {
                this._barObjectV.height = Math.round(fullHeight * percent);
            }
        } else {
            if (this._barObjectH) {
                this._barObjectH.width = Math.round(fullWidth * percent);
                this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
            }
            if (this._barObjectV) {
                this._barObjectV.height = Math.round(fullHeight * percent);
                this._barObjectV.y =
                    this._barStartY + (fullHeight - this._barObjectV.height);
            }
        }
    }

    private clamp01(value: number): number {
        if (value < 0) return 0;
        if (value > 1) return 1;
        return value;
    }

    private clamp(value: number, min: number, max: number): number {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    protected constructExtension(buffer: ByteBuffer): void {
        buffer.seek(0, 6);

        this._titleType = buffer.readByte();
        this._reverse = buffer.readBool();
        if (buffer.version >= 2) {
            this._wholeNumbers = buffer.readBool();
            this.changeOnClick = buffer.readBool();
        }

        this._titleObject = this.getChild('title');
        this._barObjectH = this.getChild('bar');
        this._barObjectV = this.getChild('bar_v');
        this._gripObject = this.getChild('grip');

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
        if (this._gripObject) {
            this._gripObject.on(FGUIEvents.TOUCH_BEGIN, this.handleGripTouchBegin, this);
        }

        this.on(FGUIEvents.TOUCH_BEGIN, this.handleBarTouchBegin, this);
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
            this.update();
        }
    }

    public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_afterAdd(buffer, beginPos);

        if (!buffer.seek(beginPos, 6)) {
            this.update();
            return;
        }

        if (buffer.readByte() !== this.packageItem?.objectType) {
            this.update();
            return;
        }

        this._value = buffer.getInt32();
        this._max = buffer.getInt32();
        if (buffer.version >= 2) {
            this._min = buffer.getInt32();
        }

        this.update();
    }

    private handleGripTouchBegin(evt: any): void {
        this.canDrag = true;
        if (evt.stopPropagation) {
            evt.stopPropagation();
        }

        this._clickPos = this.globalToLocal(evt.stageX || 0, evt.stageY || 0);
        this._clickPercent = this.clamp01(
            (this._value - this._min) / (this._max - this._min)
        );

        this.root?.on(FGUIEvents.TOUCH_MOVE, this.handleGripTouchMove, this);
        this.root?.on(FGUIEvents.TOUCH_END, this.handleGripTouchEnd, this);
    }

    private handleGripTouchMove(evt: any): void {
        if (!this.canDrag) {
            return;
        }

        const pt = this.globalToLocal(evt.stageX || 0, evt.stageY || 0);
        let deltaX = pt.x - this._clickPos.x;
        let deltaY = pt.y - this._clickPos.y;
        if (this._reverse) {
            deltaX = -deltaX;
            deltaY = -deltaY;
        }

        let percent: number;
        if (this._barObjectH) {
            percent = this._clickPercent + deltaX / this._barMaxWidth;
        } else {
            percent = this._clickPercent + deltaY / this._barMaxHeight;
        }
        this.updateWithPercent(percent, true);
    }

    private handleGripTouchEnd(): void {
        this.root?.off(FGUIEvents.TOUCH_MOVE, this.handleGripTouchMove, this);
        this.root?.off(FGUIEvents.TOUCH_END, this.handleGripTouchEnd, this);
    }

    private handleBarTouchBegin(evt: any): void {
        if (!this.changeOnClick || !this._gripObject) {
            return;
        }

        const pt = this._gripObject.globalToLocal(evt.stageX || 0, evt.stageY || 0);
        let percent = this.clamp01((this._value - this._min) / (this._max - this._min));
        let delta: number = 0;
        if (this._barObjectH) {
            delta = pt.x / this._barMaxWidth;
        }
        if (this._barObjectV) {
            delta = pt.y / this._barMaxHeight;
        }
        if (this._reverse) {
            percent -= delta;
        } else {
            percent += delta;
        }
        this.updateWithPercent(percent, true);
    }
}
