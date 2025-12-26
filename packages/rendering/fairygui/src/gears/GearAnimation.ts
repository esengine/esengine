import { GearBase } from './GearBase';
import { EObjectPropID } from '../core/FieldTypes';
import type { GObject } from '../core/GObject';

/**
 * Animation value for GearAnimation
 * GearAnimation 的动画值
 */
interface IAnimationValue {
    playing: boolean;
    frame: number;
}

/**
 * GearAnimation
 *
 * Controls object animation state based on controller state.
 * 根据控制器状态控制对象动画状态
 */
export class GearAnimation extends GearBase {
    private _storage: Map<string, IAnimationValue> = new Map();
    private _default: IAnimationValue = { playing: true, frame: 0 };

    constructor(owner: GObject) {
        super(owner);
    }

    protected init(): void {
        this._default = {
            playing: (this.owner.getProp(EObjectPropID.Playing) as boolean) ?? true,
            frame: (this.owner.getProp(EObjectPropID.Frame) as number) ?? 0
        };
        this._storage.clear();
    }

    public apply(): void {
        if (!this._controller) return;

        const gv = this._storage.get(this._controller.selectedPageId) ?? this._default;

        this.owner._gearLocked = true;
        this.owner.setProp(EObjectPropID.Playing, gv.playing);
        this.owner.setProp(EObjectPropID.Frame, gv.frame);
        this.owner._gearLocked = false;
    }

    public updateState(): void {
        if (!this._controller) return;

        const gv: IAnimationValue = {
            playing: (this.owner.getProp(EObjectPropID.Playing) as boolean) ?? true,
            frame: (this.owner.getProp(EObjectPropID.Frame) as number) ?? 0
        };

        this._storage.set(this._controller.selectedPageId, gv);
    }

    /**
     * Add status
     * 添加状态
     */
    public addStatus(pageId: string | null, playing: boolean, frame: number): void {
        if (pageId === null) {
            this._default.playing = playing;
            this._default.frame = frame;
        } else {
            this._storage.set(pageId, { playing, frame });
        }
    }
}
