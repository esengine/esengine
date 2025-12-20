import { GObject } from './GObject';
import { GRoot } from './GRoot';
import { GLoader } from '../widgets/GLoader';
import { Stage } from './Stage';
import { FGUIEvents } from '../events/Events';
import { EAlignType, EVertAlignType } from './FieldTypes';

/**
 * DragDropManager
 *
 * Manages drag and drop operations with visual feedback.
 *
 * 管理带有视觉反馈的拖放操作
 *
 * Features:
 * - Visual drag agent with icon
 * - Source data carrying
 * - Drop target detection
 * - Singleton pattern
 *
 * @example
 * ```typescript
 * // Start drag operation
 * DragDropManager.inst.startDrag(sourceObj, 'ui://pkg/icon', myData);
 *
 * // Listen for drop on target
 * targetObj.on(FGUIEvents.DROP, (data) => {
 *     console.log('Dropped:', data);
 * });
 *
 * // Cancel drag
 * DragDropManager.inst.cancel();
 * ```
 */
export class DragDropManager {
    private static _inst: DragDropManager | null = null;

    private _agent: GLoader;
    private _sourceData: any = null;

    /**
     * Get singleton instance
     * 获取单例实例
     */
    public static get inst(): DragDropManager {
        if (!DragDropManager._inst) {
            DragDropManager._inst = new DragDropManager();
        }
        return DragDropManager._inst;
    }

    constructor() {
        this._agent = new GLoader();
        this._agent.draggable = true;
        this._agent.touchable = false; // Important: prevent interference with drop detection
        this._agent.setSize(100, 100);
        this._agent.setPivot(0.5, 0.5, true);
        this._agent.align = EAlignType.Center;
        this._agent.verticalAlign = EVertAlignType.Middle;
        this._agent.sortingOrder = 1000000;
        this._agent.on(FGUIEvents.DRAG_END, this.onDragEnd, this);
    }

    /**
     * Get drag agent object
     * 获取拖拽代理对象
     */
    public get dragAgent(): GObject {
        return this._agent;
    }

    /**
     * Check if currently dragging
     * 检查是否正在拖拽
     */
    public get dragging(): boolean {
        return this._agent.parent !== null;
    }

    /**
     * Start a drag operation
     * 开始拖拽操作
     *
     * @param source - Source object initiating drag | 发起拖拽的源对象
     * @param icon - Icon URL for drag agent | 拖拽代理的图标 URL
     * @param sourceData - Data to carry during drag | 拖拽期间携带的数据
     * @param touchId - Touch point ID for multi-touch | 多点触控的触摸点 ID
     */
    public startDrag(source: GObject, icon: string, sourceData?: any, touchId?: number): void {
        if (this._agent.parent) {
            return;
        }

        this._sourceData = sourceData;
        this._agent.url = icon;

        GRoot.inst.addChild(this._agent);

        const stage = Stage.inst;
        const pt = GRoot.inst.globalToLocal(stage.mouseX, stage.mouseY);
        this._agent.setXY(pt.x, pt.y);
        this._agent.startDrag(touchId);
    }

    /**
     * Cancel current drag operation
     * 取消当前拖拽操作
     */
    public cancel(): void {
        if (this._agent.parent) {
            this._agent.stopDrag();
            GRoot.inst.removeChild(this._agent);
            this._sourceData = null;
        }
    }

    private onDragEnd(): void {
        if (!this._agent.parent) {
            // Already cancelled
            return;
        }

        GRoot.inst.removeChild(this._agent);

        const sourceData = this._sourceData;
        this._sourceData = null;

        // Find drop target
        const stage = Stage.inst;
        const target = GRoot.inst.hitTest(stage.mouseX, stage.mouseY);

        if (target) {
            // Walk up the display list to find a drop handler
            let obj: GObject | null = target;
            while (obj) {
                if (obj.hasListener(FGUIEvents.DROP)) {
                    obj.emit(FGUIEvents.DROP, sourceData);
                    return;
                }
                obj = obj.parent;
            }
        }
    }
}
