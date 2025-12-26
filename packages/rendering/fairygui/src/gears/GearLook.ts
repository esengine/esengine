import { GearBase } from './GearBase';
import { GTween } from '../tween/GTween';
import type { GTweener } from '../tween/GTweener';
import type { GObject } from '../core/GObject';

/**
 * Look value for GearLook
 * GearLook 的外观值
 */
interface ILookValue {
    alpha: number;
    rotation: number;
    grayed: boolean;
    touchable: boolean;
}

/**
 * GearLook
 *
 * Controls object appearance (alpha, rotation, grayed, touchable) based on controller state.
 * 根据控制器状态控制对象外观（透明度、旋转、灰度、可触摸）
 */
export class GearLook extends GearBase {
    private _storage: Map<string, ILookValue> = new Map();
    private _default: ILookValue = { alpha: 1, rotation: 0, grayed: false, touchable: true };
    private _tweener: GTweener | null = null;

    constructor(owner: GObject) {
        super(owner);
    }

    protected init(): void {
        this._default = {
            alpha: this.owner.alpha,
            rotation: this.owner.rotation,
            grayed: this.owner.grayed,
            touchable: this.owner.touchable
        };
        this._storage.clear();
    }

    public apply(): void {
        if (!this._controller) return;

        const gv = this._storage.get(this._controller.selectedPageId) ?? this._default;

        // grayed and touchable cannot be tweened, apply immediately
        this.owner._gearLocked = true;
        this.owner.grayed = gv.grayed;
        this.owner.touchable = gv.touchable;
        this.owner._gearLocked = false;

        if (this.tweenConfig?.tween && this.owner.onStage) {
            if (this._tweener) {
                if (this._tweener.endValue.x !== gv.alpha || this._tweener.endValue.y !== gv.rotation) {
                    this._tweener.kill();
                    this._tweener = null;
                } else {
                    return;
                }
            }

            const oa = this.owner.alpha;
            const or = this.owner.rotation;

            if (oa !== gv.alpha || or !== gv.rotation) {
                this._tweener = GTween.to2(oa, or, gv.alpha, gv.rotation, this.tweenConfig.duration)
                    .setDelay(this.tweenConfig.delay)
                    .setEase(this.tweenConfig.easeType)
                    .setTarget(this, 'look')
                    .onUpdate((tweener) => {
                        this.owner._gearLocked = true;
                        this.owner.alpha = tweener.value.x;
                        this.owner.rotation = tweener.value.y;
                        this.owner._gearLocked = false;
                    })
                    .onComplete(() => {
                        this._tweener = null;
                    });
            }
        } else {
            this.owner._gearLocked = true;
            this.owner.alpha = gv.alpha;
            this.owner.rotation = gv.rotation;
            this.owner._gearLocked = false;
        }
    }

    public updateState(): void {
        if (!this._controller) return;

        const gv: ILookValue = {
            alpha: this.owner.alpha,
            rotation: this.owner.rotation,
            grayed: this.owner.grayed,
            touchable: this.owner.touchable
        };

        this._storage.set(this._controller.selectedPageId, gv);
    }

    /**
     * Add status from buffer
     * 从缓冲区添加状态
     */
    public addStatus(
        pageId: string | null,
        alpha: number,
        rotation: number,
        grayed: boolean,
        touchable: boolean
    ): void {
        if (pageId === null) {
            this._default.alpha = alpha;
            this._default.rotation = rotation;
            this._default.grayed = grayed;
            this._default.touchable = touchable;
        } else {
            this._storage.set(pageId, { alpha, rotation, grayed, touchable });
        }
    }
}
