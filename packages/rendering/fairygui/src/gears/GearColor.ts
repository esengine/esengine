import { GearBase } from './GearBase';
import { EObjectPropID } from '../core/FieldTypes';
import type { GObject } from '../core/GObject';

/**
 * Color value for GearColor
 * GearColor 的颜色值
 */
interface IColorValue {
    color: number | null;
    strokeColor: number | null;
}

/**
 * GearColor
 *
 * Controls object color and stroke color based on controller state.
 * 根据控制器状态控制对象颜色和描边颜色
 */
export class GearColor extends GearBase {
    private _storage: Map<string, IColorValue> = new Map();
    private _default: IColorValue = { color: null, strokeColor: null };

    constructor(owner: GObject) {
        super(owner);
    }

    protected init(): void {
        this._default = {
            color: this.owner.getProp(EObjectPropID.Color) as number | null,
            strokeColor: this.owner.getProp(EObjectPropID.OutlineColor) as number | null
        };
        this._storage.clear();
    }

    public apply(): void {
        if (!this._controller) return;

        const gv = this._storage.get(this._controller.selectedPageId) ?? this._default;

        this.owner._gearLocked = true;
        if (gv.color !== null) {
            this.owner.setProp(EObjectPropID.Color, gv.color);
        }
        if (gv.strokeColor !== null) {
            this.owner.setProp(EObjectPropID.OutlineColor, gv.strokeColor);
        }
        this.owner._gearLocked = false;
    }

    public updateState(): void {
        if (!this._controller) return;

        const gv: IColorValue = {
            color: this.owner.getProp(EObjectPropID.Color) as number | null,
            strokeColor: this.owner.getProp(EObjectPropID.OutlineColor) as number | null
        };

        this._storage.set(this._controller.selectedPageId, gv);
    }

    /**
     * Add status from buffer
     * 从缓冲区添加状态
     */
    public addStatus(pageId: string | null, color: number | null, strokeColor: number | null): void {
        if (pageId === null) {
            this._default.color = color;
            this._default.strokeColor = strokeColor;
        } else {
            this._storage.set(pageId, { color, strokeColor });
        }
    }
}
