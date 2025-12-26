import { EventDispatcher } from '../events/EventDispatcher';
import { IInputEventData, createInputEventData } from '../events/Events';

/**
 * Stage
 *
 * Represents the root container and manages input events.
 *
 * 表示根容器并管理输入事件
 */
export class Stage extends EventDispatcher {
    private static _inst: Stage | null = null;

    /** Stage width | 舞台宽度 */
    public width: number = 800;

    /** Stage height | 舞台高度 */
    public height: number = 600;

    /** Current mouse/touch X position | 当前鼠标/触摸 X 坐标 */
    public mouseX: number = 0;

    /** Current mouse/touch Y position | 当前鼠标/触摸 Y 坐标 */
    public mouseY: number = 0;

    /** Design width | 设计宽度 */
    public designWidth: number = 1920;

    /** Design height | 设计高度 */
    public designHeight: number = 1080;

    /** Scale mode | 缩放模式 */
    public scaleMode: EScaleMode = EScaleMode.ShowAll;

    /** Align mode | 对齐模式 */
    public alignH: EAlignMode = EAlignMode.Center;
    public alignV: EAlignMode = EAlignMode.Middle;

    /** Is touch/pointer down | 是否按下 */
    public isTouchDown: boolean = false;

    /** Current touch ID | 当前触摸 ID */
    public touchId: number = 0;

    private _canvas: HTMLCanvasElement | null = null;
    private _inputData: IInputEventData;
    private _scaleX: number = 1;
    private _scaleY: number = 1;
    private _offsetX: number = 0;
    private _offsetY: number = 0;

    private constructor() {
        super();
        this._inputData = createInputEventData();
    }

    /**
     * Get singleton instance
     * 获取单例实例
     */
    public static get inst(): Stage {
        if (!Stage._inst) {
            Stage._inst = new Stage();
        }
        return Stage._inst;
    }

    /**
     * Bind stage to a canvas element
     * 绑定舞台到画布元素
     *
     * @param canvas HTMLCanvasElement to bind | 要绑定的画布元素
     */
    public bindToCanvas(canvas: HTMLCanvasElement): void {
        if (this._canvas) {
            this.unbindCanvas();
        }

        this._canvas = canvas;
        this.updateSize();
        this.bindEvents();
    }

    /**
     * Unbind from current canvas
     * 解绑当前画布
     */
    public unbindCanvas(): void {
        if (!this._canvas) return;

        this._canvas.removeEventListener('mousedown', this.handleMouseDown);
        this._canvas.removeEventListener('mouseup', this.handleMouseUp);
        this._canvas.removeEventListener('mousemove', this.handleMouseMove);
        this._canvas.removeEventListener('wheel', this.handleWheel);
        this._canvas.removeEventListener('touchstart', this.handleTouchStart);
        this._canvas.removeEventListener('touchend', this.handleTouchEnd);
        this._canvas.removeEventListener('touchmove', this.handleTouchMove);
        this._canvas.removeEventListener('touchcancel', this.handleTouchEnd);

        this._canvas = null;
    }

    /**
     * Update stage size from canvas
     * 从画布更新舞台尺寸
     */
    public updateSize(): void {
        if (!this._canvas) return;

        this.width = this._canvas.width;
        this.height = this._canvas.height;

        this.updateScale();
        this.emit('resize', { width: this.width, height: this.height });
    }

    /**
     * Set design size
     * 设置设计尺寸
     */
    public setDesignSize(width: number, height: number): void {
        this.designWidth = width;
        this.designHeight = height;
        this.updateScale();
    }

    private updateScale(): void {
        const scaleX = this.width / this.designWidth;
        const scaleY = this.height / this.designHeight;

        switch (this.scaleMode) {
            case EScaleMode.ShowAll:
                this._scaleX = this._scaleY = Math.min(scaleX, scaleY);
                break;
            case EScaleMode.NoBorder:
                this._scaleX = this._scaleY = Math.max(scaleX, scaleY);
                break;
            case EScaleMode.ExactFit:
                this._scaleX = scaleX;
                this._scaleY = scaleY;
                break;
            case EScaleMode.FixedWidth:
                this._scaleX = this._scaleY = scaleX;
                break;
            case EScaleMode.FixedHeight:
                this._scaleX = this._scaleY = scaleY;
                break;
            case EScaleMode.NoScale:
            default:
                this._scaleX = this._scaleY = 1;
                break;
        }

        const actualWidth = this.designWidth * this._scaleX;
        const actualHeight = this.designHeight * this._scaleY;

        switch (this.alignH) {
            case EAlignMode.Left:
                this._offsetX = 0;
                break;
            case EAlignMode.Right:
                this._offsetX = this.width - actualWidth;
                break;
            case EAlignMode.Center:
            default:
                this._offsetX = (this.width - actualWidth) / 2;
                break;
        }

        switch (this.alignV) {
            case EAlignMode.Top:
                this._offsetY = 0;
                break;
            case EAlignMode.Bottom:
                this._offsetY = this.height - actualHeight;
                break;
            case EAlignMode.Middle:
            default:
                this._offsetY = (this.height - actualHeight) / 2;
                break;
        }
    }

    /**
     * Convert screen coordinates to stage coordinates
     * 将屏幕坐标转换为舞台坐标
     */
    public screenToStage(screenX: number, screenY: number): { x: number; y: number } {
        return {
            x: (screenX - this._offsetX) / this._scaleX,
            y: (screenY - this._offsetY) / this._scaleY
        };
    }

    /**
     * Convert stage coordinates to screen coordinates
     * 将舞台坐标转换为屏幕坐标
     */
    public stageToScreen(stageX: number, stageY: number): { x: number; y: number } {
        return {
            x: stageX * this._scaleX + this._offsetX,
            y: stageY * this._scaleY + this._offsetY
        };
    }

    private bindEvents(): void {
        if (!this._canvas) return;

        this._canvas.addEventListener('mousedown', this.handleMouseDown);
        this._canvas.addEventListener('mouseup', this.handleMouseUp);
        this._canvas.addEventListener('mousemove', this.handleMouseMove);
        this._canvas.addEventListener('wheel', this.handleWheel);
        this._canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this._canvas.addEventListener('touchend', this.handleTouchEnd);
        this._canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this._canvas.addEventListener('touchcancel', this.handleTouchEnd);
    }

    private getCanvasPosition(e: MouseEvent | Touch): { x: number; y: number } {
        if (!this._canvas) return { x: 0, y: 0 };

        const rect = this._canvas.getBoundingClientRect();
        const scaleX = this._canvas.width / rect.width;
        const scaleY = this._canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    private updateInputData(e: MouseEvent | Touch, type: string): void {
        const pos = this.getCanvasPosition(e);
        const stagePos = this.screenToStage(pos.x, pos.y);

        this._inputData.stageX = stagePos.x;
        this._inputData.stageY = stagePos.y;
        this.mouseX = stagePos.x;
        this.mouseY = stagePos.y;

        if (e instanceof MouseEvent) {
            this._inputData.button = e.button;
            this._inputData.ctrlKey = e.ctrlKey;
            this._inputData.shiftKey = e.shiftKey;
            this._inputData.altKey = e.altKey;
            this._inputData.nativeEvent = e;
        } else {
            this._inputData.touchId = e.identifier;
            this.touchId = e.identifier;
        }
    }

    private handleMouseDown = (e: MouseEvent): void => {
        this.updateInputData(e, 'mousedown');
        this.isTouchDown = true;
        this._inputData.touchId = 0;
        this.emit('mousedown', this._inputData);
    };

    private handleMouseUp = (e: MouseEvent): void => {
        this.updateInputData(e, 'mouseup');
        this.isTouchDown = false;
        this.emit('mouseup', this._inputData);
    };

    private handleMouseMove = (e: MouseEvent): void => {
        this.updateInputData(e, 'mousemove');
        this.emit('mousemove', this._inputData);
    };

    private handleWheel = (e: WheelEvent): void => {
        this.updateInputData(e, 'wheel');
        this._inputData.wheelDelta = e.deltaY;
        this._inputData.nativeEvent = e;
        this.emit('wheel', this._inputData);
    };

    private handleTouchStart = (e: TouchEvent): void => {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.updateInputData(touch, 'touchstart');
            this.isTouchDown = true;
            this.emit('mousedown', this._inputData);
        }
    };

    private handleTouchEnd = (e: TouchEvent): void => {
        if (e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            this.updateInputData(touch, 'touchend');
            this.isTouchDown = false;
            this.emit('mouseup', this._inputData);
        }
    };

    private handleTouchMove = (e: TouchEvent): void => {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.updateInputData(touch, 'touchmove');
            this.emit('mousemove', this._inputData);
        }
    };

    public get scaleX(): number {
        return this._scaleX;
    }

    public get scaleY(): number {
        return this._scaleY;
    }

    public get offsetX(): number {
        return this._offsetX;
    }

    public get offsetY(): number {
        return this._offsetY;
    }
}

/**
 * Scale mode enum
 * 缩放模式枚举
 */
export const enum EScaleMode {
    /** No scaling | 不缩放 */
    NoScale = 'noscale',
    /** Show all content (letterbox) | 显示全部内容（黑边） */
    ShowAll = 'showall',
    /** Fill screen, clip content | 填充屏幕，裁剪内容 */
    NoBorder = 'noborder',
    /** Stretch to fit | 拉伸适应 */
    ExactFit = 'exactfit',
    /** Fixed width, height scales | 固定宽度，高度缩放 */
    FixedWidth = 'fixedwidth',
    /** Fixed height, width scales | 固定高度，宽度缩放 */
    FixedHeight = 'fixedheight'
}

/**
 * Align mode enum
 * 对齐模式枚举
 */
export const enum EAlignMode {
    Left = 'left',
    Center = 'center',
    Right = 'right',
    Top = 'top',
    Middle = 'middle',
    Bottom = 'bottom'
}
