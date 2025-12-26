import { GearBase } from './GearBase';
import type { GObject } from '../core/GObject';

/**
 * GearDisplay
 *
 * Controls object visibility based on controller state.
 * 根据控制器状态控制对象可见性
 */
export class GearDisplay extends GearBase {
    /** Pages where object is visible | 对象可见的页面列表 */
    public pages: string[] = [];

    private _visible: number = 0;
    private _displayLockToken: number = 1;

    constructor(owner: GObject) {
        super(owner);
    }

    protected init(): void {
        this.pages = [];
    }

    public apply(): void {
        this._displayLockToken++;
        if (this._displayLockToken === 0) {
            this._displayLockToken = 1;
        }

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
        // GearDisplay doesn't need to save state
    }

    /**
     * Add display lock
     * 添加显示锁
     */
    public addLock(): number {
        this._visible++;
        return this._displayLockToken;
    }

    /**
     * Release display lock
     * 释放显示锁
     */
    public releaseLock(token: number): void {
        if (token === this._displayLockToken) {
            this._visible--;
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
