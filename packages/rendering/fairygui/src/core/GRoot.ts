import { GComponent } from './GComponent';
import { GObject } from './GObject';
import { Stage } from './Stage';
import { Timer } from './Timer';
import { FGUIEvents, IInputEventData } from '../events/Events';
import type { IRenderCollector } from '../render/IRenderCollector';

/**
 * GRoot
 *
 * Root container for all UI elements.
 * Manages focus, popups, tooltips, and input dispatch.
 *
 * 所有 UI 元素的根容器，管理焦点、弹出窗口、提示和输入分发
 */
export class GRoot extends GComponent {
    private static _inst: GRoot | null = null;

    private _focus: GObject | null = null;
    private _tooltipWin: GObject | null = null;
    private _defaultTooltipWin: GObject | null = null;

    private _popupStack: GObject[] = [];
    private _justClosedPopups: GObject[] = [];
    private _modalLayer: GObject | null = null;
    private _modalWaitPane: GObject | null = null;

    private _inputProcessor: InputProcessor;

    constructor() {
        super();

        this._inputProcessor = new InputProcessor(this);

        // Set this as stage root so children receive addedToStage events
        // 将自己设置为舞台根，这样子对象才能收到 addedToStage 事件
        if (this.displayObject) {
            this.displayObject.setStage(this.displayObject);
        }

        // Bind to stage events
        const stage = Stage.inst;
        stage.on('mousedown', this.onStageMouseDown, this);
        stage.on('mouseup', this.onStageMouseUp, this);
        stage.on('mousemove', this.onStageMouseMove, this);
        stage.on('wheel', this.onStageWheel, this);
        stage.on('resize', this.onStageResize, this);

        // Set initial size
        this.setSize(stage.designWidth, stage.designHeight);
    }

    /**
     * Get singleton instance
     * 获取单例实例
     */
    public static get inst(): GRoot {
        if (!GRoot._inst) {
            GRoot._inst = new GRoot();
        }
        return GRoot._inst;
    }

    /**
     * Create a new GRoot (for multi-window support)
     * 创建新的 GRoot（支持多窗口）
     */
    public static create(): GRoot {
        return new GRoot();
    }

    // Focus management | 焦点管理

    /**
     * Get focused object
     * 获取当前焦点对象
     */
    public get focus(): GObject | null {
        return this._focus;
    }

    /**
     * Set focused object
     * 设置焦点对象
     */
    public set focus(value: GObject | null) {
        if (this._focus !== value) {
            const oldFocus = this._focus;
            this._focus = value;

            if (oldFocus) {
                oldFocus.emit(FGUIEvents.FOCUS_OUT);
            }
            if (this._focus) {
                this._focus.emit(FGUIEvents.FOCUS_IN);
            }
        }
    }

    // Popup management | 弹出窗口管理

    /**
     * Show popup at position
     * 在指定位置显示弹出窗口
     */
    public showPopup(popup: GObject, target?: GObject, dir?: number): void {
        if (this._popupStack.indexOf(popup) === -1) {
            this._popupStack.push(popup);
        }

        this.addChild(popup);
        this.adjustModalLayer();

        if (target) {
            const pos = target.localToGlobal(0, 0);
            popup.setXY(pos.x, pos.y + target.height);
        }

        popup.visible = true;
    }

    /**
     * Toggle popup visibility
     * 切换弹出窗口可见性
     */
    public togglePopup(popup: GObject, target?: GObject, dir?: number): void {
        if (this._justClosedPopups.indexOf(popup) !== -1) {
            return;
        }

        if (popup.parent === this && popup.visible) {
            this.hidePopup(popup);
        } else {
            this.showPopup(popup, target, dir);
        }
    }

    /**
     * Hide popup
     * 隐藏弹出窗口
     */
    public hidePopup(popup?: GObject): void {
        if (popup) {
            const index = this._popupStack.indexOf(popup);
            if (index !== -1) {
                this._popupStack.splice(index, 1);
                this.closePopup(popup);
            }
        } else {
            // Hide all popups
            for (const p of this._popupStack) {
                this.closePopup(p);
            }
            this._popupStack.length = 0;
        }
    }

    private closePopup(popup: GObject): void {
        popup.visible = false;
        this._justClosedPopups.push(popup);

        Timer.inst.callLater(this, () => {
            const index = this._justClosedPopups.indexOf(popup);
            if (index !== -1) {
                this._justClosedPopups.splice(index, 1);
            }
        });
    }

    /**
     * Check if popup is showing
     * 检查弹出窗口是否正在显示
     */
    public hasAnyPopup(): boolean {
        return this._popupStack.length > 0;
    }

    // Modal management | 模态管理

    private adjustModalLayer(): void {
        // Adjust modal layer position and visibility
        if (this._modalLayer) {
            let hasModal = false;
            for (let i = this._popupStack.length - 1; i >= 0; i--) {
                // Check if popup is modal
            }
            this._modalLayer.visible = hasModal;
        }
    }

    /**
     * Show modal wait
     * 显示模态等待
     */
    public showModalWait(msg?: string): void {
        if (this._modalWaitPane) {
            this.addChild(this._modalWaitPane);
            this._modalWaitPane.visible = true;
        }
    }

    /**
     * Close modal wait
     * 关闭模态等待
     */
    public closeModalWait(): void {
        if (this._modalWaitPane) {
            this._modalWaitPane.visible = false;
            this._modalWaitPane.removeFromParent();
        }
    }

    // Tooltip management | 提示管理

    /**
     * Show tooltip
     * 显示提示
     */
    public showTooltips(msg: string): void {
        if (!this._defaultTooltipWin) return;

        this._tooltipWin = this._defaultTooltipWin;
        this._tooltipWin.text = msg;
        this.showTooltipsWin(this._tooltipWin);
    }

    /**
     * Show custom tooltip window
     * 显示自定义提示窗口
     */
    public showTooltipsWin(tooltipWin: GObject, position?: { x: number; y: number }): void {
        this._tooltipWin = tooltipWin;
        this.addChild(tooltipWin);

        if (position) {
            tooltipWin.setXY(position.x, position.y);
        } else {
            const stage = Stage.inst;
            tooltipWin.setXY(stage.mouseX + 10, stage.mouseY + 20);
        }
    }

    /**
     * Hide tooltip
     * 隐藏提示
     */
    public hideTooltips(): void {
        if (this._tooltipWin) {
            this._tooltipWin.removeFromParent();
            this._tooltipWin = null;
        }
    }

    // Input handling | 输入处理

    private onStageMouseDown(data: IInputEventData): void {
        this._inputProcessor.onMouseDown(data);

        // Close popups if clicking outside
        if (this._popupStack.length > 0) {
            const hit = this.hitTest(data.stageX, data.stageY);
            if (!hit || !this.isAncestorOf(hit, this._popupStack[this._popupStack.length - 1])) {
                this.hidePopup();
            }
        }

        this.hideTooltips();
    }

    private onStageMouseUp(data: IInputEventData): void {
        this._inputProcessor.onMouseUp(data);
    }

    private onStageMouseMove(data: IInputEventData): void {
        this._inputProcessor.onMouseMove(data);
    }

    private onStageWheel(data: IInputEventData): void {
        this._inputProcessor.onMouseWheel(data);
    }

    private onStageResize(): void {
        const stage = Stage.inst;
        this.setSize(stage.designWidth, stage.designHeight);
    }

    private isAncestorOf(obj: GObject, ancestor: GObject): boolean {
        let p: GObject | null = obj;
        while (p) {
            if (p === ancestor) return true;
            p = p.parent;
        }
        return false;
    }

    /**
     * Hit test at position
     * 位置碰撞检测
     */
    public hitTest(stageX: number, stageY: number): GObject | null {
        return this._inputProcessor.hitTest(stageX, stageY);
    }

    // Drag and drop | 拖放

    /**
     * Start dragging a source object
     * 开始拖拽源对象
     */
    public startDragSource(source: GObject): void {
        GObject.draggingObject = source;
    }

    /**
     * Stop dragging
     * 停止拖拽
     */
    public stopDragSource(): void {
        GObject.draggingObject = null;
    }

    // Window management | 窗口管理

    /**
     * Show window
     * 显示窗口
     */
    public showWindow(win: GObject): void {
        this.addChild(win);
        this.adjustModalLayer();
    }

    /**
     * Hide window immediately
     * 立即隐藏窗口
     */
    public hideWindowImmediately(win: GObject): void {
        if (win.parent === this) {
            this.removeChild(win);
        }
        this.adjustModalLayer();
    }

    /**
     * Bring window to front
     * 将窗口置于最前
     */
    public bringToFront(win: GObject): void {
        const cnt = this.numChildren;
        let i: number;
        if (this._modalLayer && this._modalLayer.parent === this) {
            i = this.getChildIndex(this._modalLayer);
        } else {
            i = cnt - 1;
        }

        const index = this.getChildIndex(win);
        if (index < i) {
            this.setChildIndex(win, i);
        }
    }

    /**
     * Get top window
     * 获取最上层窗口
     */
    public getTopWindow(): GObject | null {
        const cnt = this.numChildren;
        for (let i = cnt - 1; i >= 0; i--) {
            const child = this.getChildAt(i);
            if (child !== this._modalLayer) {
                return child;
            }
        }
        return null;
    }

    // Update | 更新

    /**
     * Update GRoot (called each frame by ECS system)
     * 更新 GRoot（每帧由 ECS 系统调用）
     */
    public update(): void {
        // Update timers
        // Update transitions
        // Update scroll panes
    }

    // Disposal | 销毁

    public dispose(): void {
        const stage = Stage.inst;
        stage.off('mousedown', this.onStageMouseDown);
        stage.off('mouseup', this.onStageMouseUp);
        stage.off('mousemove', this.onStageMouseMove);
        stage.off('wheel', this.onStageWheel);
        stage.off('resize', this.onStageResize);

        this._inputProcessor.dispose();

        if (GRoot._inst === this) {
            GRoot._inst = null;
        }

        super.dispose();
    }

    // Render | 渲染

    public collectRenderData(collector: IRenderCollector): void {
        super.collectRenderData(collector);
    }
}

/**
 * InputProcessor
 *
 * Handles input event processing and dispatching.
 *
 * 处理输入事件的处理和分发
 */
class InputProcessor {
    private _root: GRoot;
    private _touchTarget: GObject | null = null;
    private _rollOverTarget: GObject | null = null;

    constructor(root: GRoot) {
        this._root = root;
    }

    public hitTest(stageX: number, stageY: number): GObject | null {
        return this.hitTestInChildren(this._root, stageX, stageY);
    }

    private hitTestInChildren(container: GComponent, stageX: number, stageY: number): GObject | null {
        const count = container.numChildren;
        for (let i = count - 1; i >= 0; i--) {
            const child = container.getChildAt(i);
            if (!child.visible || !child.touchable) continue;

            const local = child.globalToLocal(stageX, stageY);
            if (local.x >= 0 && local.x < child.width && local.y >= 0 && local.y < child.height) {
                if (child instanceof GComponent) {
                    const deeper = this.hitTestInChildren(child, stageX, stageY);
                    if (deeper) return deeper;
                }
                return child;
            }
        }
        return null;
    }

    public onMouseDown(data: IInputEventData): void {
        this._touchTarget = this.hitTest(data.stageX, data.stageY);
        if (this._touchTarget) {
            this._root.focus = this._touchTarget;
            this._touchTarget.emit(FGUIEvents.TOUCH_BEGIN, data);
        }
    }

    public onMouseUp(data: IInputEventData): void {
        if (this._touchTarget) {
            const target = this.hitTest(data.stageX, data.stageY);
            this._touchTarget.emit(FGUIEvents.TOUCH_END, data);

            if (target === this._touchTarget) {
                this._touchTarget.emit(FGUIEvents.CLICK, data);
            }

            this._touchTarget = null;
        }
    }

    public onMouseMove(data: IInputEventData): void {
        const target = this.hitTest(data.stageX, data.stageY);

        // Handle roll over/out
        if (target !== this._rollOverTarget) {
            if (this._rollOverTarget) {
                this._rollOverTarget.emit(FGUIEvents.ROLL_OUT, data);
            }
            this._rollOverTarget = target;
            if (this._rollOverTarget) {
                this._rollOverTarget.emit(FGUIEvents.ROLL_OVER, data);
            }
        }

        // Handle touch move
        if (this._touchTarget) {
            this._touchTarget.emit(FGUIEvents.TOUCH_MOVE, data);
        }
    }

    public onMouseWheel(data: IInputEventData): void {
        const target = this.hitTest(data.stageX, data.stageY);
        if (target) {
            target.emit('wheel', data);
        }
    }

    public dispose(): void {
        this._touchTarget = null;
        this._rollOverTarget = null;
    }
}
