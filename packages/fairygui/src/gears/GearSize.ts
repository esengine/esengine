import { GearBase } from './GearBase';
import { GTween } from '../tween/GTween';
import type { GTweener } from '../tween/GTweener';
import type { GObject } from '../core/GObject';

/**
 * Size value for GearSize
 * GearSize 的尺寸值
 */
interface ISizeValue {
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
}

/**
 * GearSize
 *
 * Controls object size and scale based on controller state.
 * 根据控制器状态控制对象尺寸和缩放
 */
export class GearSize extends GearBase {
    private _storage: Map<string, ISizeValue> = new Map();
    private _default: ISizeValue = { width: 0, height: 0, scaleX: 1, scaleY: 1 };
    private _tweener: GTweener | null = null;

    constructor(owner: GObject) {
        super(owner);
    }

    protected init(): void {
        this._default = {
            width: this.owner.width,
            height: this.owner.height,
            scaleX: this.owner.scaleX,
            scaleY: this.owner.scaleY
        };
        this._storage.clear();
    }

    public apply(): void {
        if (!this._controller) return;

        const gv = this._storage.get(this._controller.selectedPageId) ?? this._default;

        if (this.tweenConfig?.tween && this.owner.onStage) {
            if (this._tweener) {
                if (
                    this._tweener.endValue.x !== gv.width ||
                    this._tweener.endValue.y !== gv.height ||
                    this._tweener.endValue.z !== gv.scaleX ||
                    this._tweener.endValue.w !== gv.scaleY
                ) {
                    this._tweener.kill();
                    this._tweener = null;
                } else {
                    return;
                }
            }

            const ow = this.owner.width;
            const oh = this.owner.height;
            const osx = this.owner.scaleX;
            const osy = this.owner.scaleY;

            if (ow !== gv.width || oh !== gv.height || osx !== gv.scaleX || osy !== gv.scaleY) {
                this._tweener = GTween.to4(
                    ow,
                    oh,
                    osx,
                    osy,
                    gv.width,
                    gv.height,
                    gv.scaleX,
                    gv.scaleY,
                    this.tweenConfig.duration
                )
                    .setDelay(this.tweenConfig.delay)
                    .setEase(this.tweenConfig.easeType)
                    .setTarget(this, 'size')
                    .onUpdate((tweener) => {
                        this.owner._gearLocked = true;
                        this.owner.setSize(tweener.value.x, tweener.value.y);
                        this.owner.setScale(tweener.value.z, tweener.value.w);
                        this.owner._gearLocked = false;
                    })
                    .onComplete(() => {
                        this._tweener = null;
                    });
            }
        } else {
            this.owner._gearLocked = true;
            this.owner.setSize(gv.width, gv.height);
            this.owner.setScale(gv.scaleX, gv.scaleY);
            this.owner._gearLocked = false;
        }
    }

    public updateState(): void {
        if (!this._controller) return;

        const gv: ISizeValue = {
            width: this.owner.width,
            height: this.owner.height,
            scaleX: this.owner.scaleX,
            scaleY: this.owner.scaleY
        };

        this._storage.set(this._controller.selectedPageId, gv);
    }

    /**
     * Update size from relation changes
     * 从关联变更中更新尺寸
     */
    public updateFromRelations(dWidth: number, dHeight: number): void {
        if (!this._controller) return;

        for (const gv of this._storage.values()) {
            gv.width += dWidth;
            gv.height += dHeight;
        }
        this._default.width += dWidth;
        this._default.height += dHeight;

        this.updateState();
    }

    /**
     * Add status from buffer
     * 从缓冲区添加状态
     */
    public addStatus(
        pageId: string | null,
        width: number,
        height: number,
        scaleX: number,
        scaleY: number
    ): void {
        if (pageId === null) {
            this._default.width = width;
            this._default.height = height;
            this._default.scaleX = scaleX;
            this._default.scaleY = scaleY;
        } else {
            this._storage.set(pageId, { width, height, scaleX, scaleY });
        }
    }
}
