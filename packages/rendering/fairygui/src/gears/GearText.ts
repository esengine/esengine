import { GearBase } from './GearBase';
import { EObjectPropID } from '../core/FieldTypes';
import type { GObject } from '../core/GObject';

/**
 * GearText
 *
 * Controls object text content based on controller state.
 * 根据控制器状态控制对象文本内容
 */
export class GearText extends GearBase {
    private _storage: Map<string, string> = new Map();
    private _default: string = '';

    constructor(owner: GObject) {
        super(owner);
    }

    protected init(): void {
        this._default = this.owner.text ?? '';
        this._storage.clear();
    }

    public apply(): void {
        if (!this._controller) return;

        const text = this._storage.get(this._controller.selectedPageId) ?? this._default;

        this.owner._gearLocked = true;
        this.owner.text = text;
        this.owner._gearLocked = false;
    }

    public updateState(): void {
        if (!this._controller) return;
        this._storage.set(this._controller.selectedPageId, this.owner.text ?? '');
    }

    /**
     * Add status
     * 添加状态
     */
    public addStatus(pageId: string | null, text: string): void {
        if (pageId === null) {
            this._default = text;
        } else {
            this._storage.set(pageId, text);
        }
    }
}
