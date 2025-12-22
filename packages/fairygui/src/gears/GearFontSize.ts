import { GearBase } from './GearBase';
import { EObjectPropID } from '../core/FieldTypes';
import type { GObject } from '../core/GObject';

/**
 * GearFontSize
 *
 * Controls object font size based on controller state.
 * 根据控制器状态控制对象字体大小
 */
export class GearFontSize extends GearBase {
    private _storage: Map<string, number> = new Map();
    private _default: number = 12;

    constructor(owner: GObject) {
        super(owner);
    }

    protected init(): void {
        this._default = (this.owner.getProp(EObjectPropID.FontSize) as number) ?? 12;
        this._storage.clear();
    }

    public apply(): void {
        if (!this._controller) return;

        const fontSize = this._storage.get(this._controller.selectedPageId) ?? this._default;

        this.owner._gearLocked = true;
        this.owner.setProp(EObjectPropID.FontSize, fontSize);
        this.owner._gearLocked = false;
    }

    public updateState(): void {
        if (!this._controller) return;
        this._storage.set(
            this._controller.selectedPageId,
            (this.owner.getProp(EObjectPropID.FontSize) as number) ?? 12
        );
    }

    /**
     * Add status
     * 添加状态
     */
    public addStatus(pageId: string | null, fontSize: number): void {
        if (pageId === null) {
            this._default = fontSize;
        } else {
            this._storage.set(pageId, fontSize);
        }
    }
}
