import { GearBase } from './GearBase';
import { GTween } from '../tween/GTween';
import type { GTweener } from '../tween/GTweener';
import type { GObject } from '../core/GObject';

/**
 * Position value for GearXY
 * GearXY 的位置值
 */
interface IPositionValue {
    x: number;
    y: number;
    px: number;
    py: number;
}

/**
 * GearXY
 *
 * Controls object position based on controller state.
 * 根据控制器状态控制对象位置
 */
export class GearXY extends GearBase {
    /** Use percent positions | 使用百分比位置 */
    public positionsInPercent: boolean = false;

    private _storage: Map<string, IPositionValue> = new Map();
    private _default: IPositionValue = { x: 0, y: 0, px: 0, py: 0 };
    private _tweener: GTweener | null = null;

    constructor(owner: GObject) {
        super(owner);
    }

    protected init(): void {
        const parent = this.owner.parent;
        this._default = {
            x: this.owner.x,
            y: this.owner.y,
            px: parent ? this.owner.x / parent.width : 0,
            py: parent ? this.owner.y / parent.height : 0
        };
        this._storage.clear();
    }

    public apply(): void {
        if (!this._controller) return;

        const gv = this._storage.get(this._controller.selectedPageId) ?? this._default;
        const parent = this.owner.parent;

        let ex: number;
        let ey: number;

        if (this.positionsInPercent && parent) {
            ex = gv.px * parent.width;
            ey = gv.py * parent.height;
        } else {
            ex = gv.x;
            ey = gv.y;
        }

        if (this.tweenConfig?.tween && this.owner.onStage) {
            if (this._tweener) {
                if (this._tweener.endValue.x !== ex || this._tweener.endValue.y !== ey) {
                    this._tweener.kill();
                    this._tweener = null;
                } else {
                    return;
                }
            }

            const ox = this.owner.x;
            const oy = this.owner.y;
            if (ox !== ex || oy !== ey) {
                this._tweener = GTween.to2(ox, oy, ex, ey, this.tweenConfig.duration)
                    .setDelay(this.tweenConfig.delay)
                    .setEase(this.tweenConfig.easeType)
                    .setTarget(this, 'xy')
                    .onUpdate((tweener) => {
                        this.owner._gearLocked = true;
                        this.owner.setXY(tweener.value.x, tweener.value.y);
                        this.owner._gearLocked = false;
                    })
                    .onComplete(() => {
                        this._tweener = null;
                    });
            }
        } else {
            this.owner._gearLocked = true;
            this.owner.setXY(ex, ey);
            this.owner._gearLocked = false;
        }
    }

    public updateState(): void {
        if (!this._controller) return;

        const parent = this.owner.parent;
        const gv: IPositionValue = {
            x: this.owner.x,
            y: this.owner.y,
            px: parent ? this.owner.x / parent.width : 0,
            py: parent ? this.owner.y / parent.height : 0
        };

        this._storage.set(this._controller.selectedPageId, gv);
    }

    /**
     * Update positions from relation changes
     * 从关联变更中更新位置
     */
    public updateFromRelations(dx: number, dy: number): void {
        if (!this._controller || this.positionsInPercent) return;

        for (const gv of this._storage.values()) {
            gv.x += dx;
            gv.y += dy;
        }
        this._default.x += dx;
        this._default.y += dy;

        this.updateState();
    }

    /**
     * Add status from buffer
     * 从缓冲区添加状态
     */
    public addStatus(pageId: string | null, x: number, y: number): void {
        if (pageId === null) {
            this._default.x = x;
            this._default.y = y;
        } else {
            const gv = this._storage.get(pageId) ?? { x: 0, y: 0, px: 0, py: 0 };
            gv.x = x;
            gv.y = y;
            this._storage.set(pageId, gv);
        }
    }

    /**
     * Add extended status (percent values)
     * 添加扩展状态（百分比值）
     */
    public addExtStatus(pageId: string | null, px: number, py: number): void {
        if (pageId === null) {
            this._default.px = px;
            this._default.py = py;
        } else {
            const gv = this._storage.get(pageId);
            if (gv) {
                gv.px = px;
                gv.py = py;
            }
        }
    }
}
