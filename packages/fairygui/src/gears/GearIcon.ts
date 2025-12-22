import { GearBase } from './GearBase';
import type { GObject } from '../core/GObject';

/**
 * GearIcon
 *
 * Controls object icon based on controller state.
 * 根据控制器状态控制对象图标
 */
export class GearIcon extends GearBase {
    private _storage: Map<string, string> = new Map();
    private _default: string = '';

    constructor(owner: GObject) {
        super(owner);
    }

    protected init(): void {
        this._default = this.owner.icon ?? '';
        this._storage.clear();
    }

    public apply(): void {
        if (!this._controller) return;

        const icon = this._storage.get(this._controller.selectedPageId) ?? this._default;

        this.owner._gearLocked = true;
        this.owner.icon = icon;
        this.owner._gearLocked = false;
    }

    public updateState(): void {
        if (!this._controller) return;
        this._storage.set(this._controller.selectedPageId, this.owner.icon ?? '');
    }

    /**
     * Add status
     * 添加状态
     */
    public addStatus(pageId: string | null, icon: string): void {
        if (pageId === null) {
            this._default = icon;
        } else {
            this._storage.set(pageId, icon);
        }
    }
}
