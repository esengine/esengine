import { GearBase } from './GearBase';
import type { GObject } from '../core/GObject';

/**
 * GearDisplay2
 *
 * Advanced display control that combines multiple controllers.
 * 高级显示控制，组合多个控制器
 */
export class GearDisplay2 extends GearBase {
    /** Pages where object is visible | 对象可见的页面列表 */
    public pages: string[] = [];

    /** Condition: 0=AND, 1=OR | 条件：0=与，1=或 */
    public condition: number = 0;

    private _visible: number = 0;

    constructor(owner: GObject) {
        super(owner);
    }

    protected init(): void {
        this.pages = [];
    }

    public apply(): void {
        if (
            this.pages.length === 0 ||
            (this._controller && this.pages.indexOf(this._controller.selectedPageId) !== -1)
        ) {
            this._visible = 1;
        } else {
            this._visible = 0;
        }
    }

    public updateState(): void {
        // GearDisplay2 doesn't need to save state
    }

    /**
     * Evaluate visibility with condition
     * 根据条件评估可见性
     */
    public evaluate(bConnected: boolean): boolean {
        if (this._controller === null) {
            return true;
        }

        if (this.condition === 0) {
            // AND condition
            return bConnected && this._visible > 0;
        } else {
            // OR condition
            return bConnected || this._visible > 0;
        }
    }

    /**
     * Check if object should be visible
     * 检查对象是否应该可见
     */
    public override get connected(): boolean {
        return this._controller === null || this._visible > 0;
    }
}
