import { ERelationType } from '../core/FieldTypes';
import type { GObject } from '../core/GObject';
import { FGUIEvents } from '../events/Events';

/**
 * Relation definition
 * 关联定义
 */
interface RelationDef {
    relationType: ERelationType;
    usePercent: boolean;
    percent: number;
}

/**
 * RelationItem
 *
 * Represents a single relation constraint between two objects.
 *
 * 表示两个对象之间的单个关联约束
 */
export class RelationItem {
    /** Owner object | 所有者对象 */
    public readonly owner: GObject;

    private _target: GObject | null = null;
    private _relations: RelationDef[] = [];

    private _targetX: number = 0;
    private _targetY: number = 0;
    private _targetWidth: number = 0;
    private _targetHeight: number = 0;

    constructor(owner: GObject) {
        this.owner = owner;
    }

    /**
     * Get target object
     * 获取目标对象
     */
    public get target(): GObject | null {
        return this._target;
    }

    /**
     * Set target object
     * 设置目标对象
     */
    public set target(value: GObject | null) {
        if (this._target !== value) {
            if (this._target) {
                this.releaseRefTarget(this._target);
            }
            this._target = value;
            if (this._target) {
                this.addRefTarget(this._target);
            }
        }
    }

    /**
     * Add a relation
     * 添加关联
     */
    public add(relationType: ERelationType, bUsePercent: boolean): void {
        if (relationType === ERelationType.Size) {
            this.add(ERelationType.Width, bUsePercent);
            this.add(ERelationType.Height, bUsePercent);
            return;
        }

        const existing = this._relations.find(r => r.relationType === relationType);
        if (existing) {
            existing.usePercent = bUsePercent;
        } else {
            this._relations.push({
                relationType,
                usePercent: bUsePercent,
                percent: 0
            });
        }

        this.internalAdd(relationType, bUsePercent);
    }

    /**
     * Internal add relation (used by Relations.setup)
     * 内部添加关联（由 Relations.setup 使用）
     */
    public internalAdd(relationType: ERelationType, bUsePercent: boolean): void {
        // Add the relation definition if it doesn't exist
        let def = this._relations.find(r => r.relationType === relationType);
        if (!def) {
            def = {
                relationType,
                usePercent: bUsePercent,
                percent: 0
            };
            this._relations.push(def);
        } else {
            def.usePercent = bUsePercent;
        }

        if (!this._target) return;

        // Calculate initial percent if needed
        if (bUsePercent) {
            switch (relationType) {
                case ERelationType.LeftLeft:
                case ERelationType.LeftCenter:
                case ERelationType.LeftRight:
                case ERelationType.CenterCenter:
                case ERelationType.RightLeft:
                case ERelationType.RightCenter:
                case ERelationType.RightRight:
                    if (this._targetWidth > 0) {
                        def.percent = this.owner.x / this._targetWidth;
                    }
                    break;

                case ERelationType.TopTop:
                case ERelationType.TopMiddle:
                case ERelationType.TopBottom:
                case ERelationType.MiddleMiddle:
                case ERelationType.BottomTop:
                case ERelationType.BottomMiddle:
                case ERelationType.BottomBottom:
                    if (this._targetHeight > 0) {
                        def.percent = this.owner.y / this._targetHeight;
                    }
                    break;

                case ERelationType.Width:
                    if (this._targetWidth > 0) {
                        def.percent = this.owner.width / this._targetWidth;
                    }
                    break;

                case ERelationType.Height:
                    if (this._targetHeight > 0) {
                        def.percent = this.owner.height / this._targetHeight;
                    }
                    break;
            }
        }
    }

    /**
     * Remove a relation
     * 移除关联
     */
    public remove(relationType: ERelationType): void {
        if (relationType === ERelationType.Size) {
            this.remove(ERelationType.Width);
            this.remove(ERelationType.Height);
            return;
        }

        const index = this._relations.findIndex(r => r.relationType === relationType);
        if (index !== -1) {
            this._relations.splice(index, 1);
        }
    }

    /**
     * Check if empty
     * 检查是否为空
     */
    public isEmpty(): boolean {
        return this._relations.length === 0;
    }

    /**
     * Copy from another item
     * 从另一个项复制
     */
    public copyFrom(source: RelationItem): void {
        this.target = source.target;
        this._relations = source._relations.map(r => ({ ...r }));
    }

    private addRefTarget(target: GObject): void {
        if (!target) return;

        target.on(FGUIEvents.XY_CHANGED, this.onTargetXYChanged, this);
        target.on(FGUIEvents.SIZE_CHANGED, this.onTargetSizeChanged, this);

        this._targetX = target.x;
        this._targetY = target.y;
        this._targetWidth = target.width;
        this._targetHeight = target.height;
    }

    private releaseRefTarget(target: GObject): void {
        if (!target) return;

        target.off(FGUIEvents.XY_CHANGED, this.onTargetXYChanged);
        target.off(FGUIEvents.SIZE_CHANGED, this.onTargetSizeChanged);
    }

    private onTargetXYChanged(): void {
        if (!this._target || this.owner._gearLocked) return;

        const ox = this._targetX;
        const oy = this._targetY;
        this._targetX = this._target.x;
        this._targetY = this._target.y;

        this.applyOnXYChanged(this._targetX - ox, this._targetY - oy);
    }

    private onTargetSizeChanged(): void {
        if (!this._target || this.owner._gearLocked) return;

        const ow = this._targetWidth;
        const oh = this._targetHeight;
        this._targetWidth = this._target.width;
        this._targetHeight = this._target.height;

        this.applyOnSizeChanged(this._targetWidth - ow, this._targetHeight - oh);
    }

    /**
     * Apply relations when target position changed
     * 当目标位置改变时应用关联
     */
    public applyOnXYChanged(dx: number, dy: number): void {
        for (const def of this._relations) {
            switch (def.relationType) {
                case ERelationType.LeftLeft:
                case ERelationType.LeftCenter:
                case ERelationType.LeftRight:
                case ERelationType.CenterCenter:
                case ERelationType.RightLeft:
                case ERelationType.RightCenter:
                case ERelationType.RightRight:
                    this.owner.x += dx;
                    break;

                case ERelationType.TopTop:
                case ERelationType.TopMiddle:
                case ERelationType.TopBottom:
                case ERelationType.MiddleMiddle:
                case ERelationType.BottomTop:
                case ERelationType.BottomMiddle:
                case ERelationType.BottomBottom:
                    this.owner.y += dy;
                    break;
            }
        }
    }

    /**
     * Apply relations when target size changed
     * 当目标尺寸改变时应用关联
     */
    public applyOnSizeChanged(dWidth: number, dHeight: number): void {
        if (!this._target) return;

        let ox = this.owner.x;
        let oy = this.owner.y;

        for (const def of this._relations) {
            switch (def.relationType) {
                case ERelationType.LeftLeft:
                    // No change needed
                    break;

                case ERelationType.LeftCenter:
                    ox = this._target.width / 2 + (ox - this._targetWidth / 2);
                    break;

                case ERelationType.LeftRight:
                    ox = this._target.width + (ox - this._targetWidth);
                    break;

                case ERelationType.CenterCenter:
                    ox = this._target.width / 2 + (ox + this.owner.width / 2 - this._targetWidth / 2) - this.owner.width / 2;
                    break;

                case ERelationType.RightLeft:
                    ox = ox + this.owner.width - this._target.width / 2 + (this._targetWidth / 2 - this.owner.width);
                    break;

                case ERelationType.RightCenter:
                    ox = this._target.width / 2 + (ox + this.owner.width - this._targetWidth / 2) - this.owner.width;
                    break;

                case ERelationType.RightRight:
                    ox = this._target.width + (ox + this.owner.width - this._targetWidth) - this.owner.width;
                    break;

                case ERelationType.TopTop:
                    // No change needed
                    break;

                case ERelationType.TopMiddle:
                    oy = this._target.height / 2 + (oy - this._targetHeight / 2);
                    break;

                case ERelationType.TopBottom:
                    oy = this._target.height + (oy - this._targetHeight);
                    break;

                case ERelationType.MiddleMiddle:
                    oy = this._target.height / 2 + (oy + this.owner.height / 2 - this._targetHeight / 2) - this.owner.height / 2;
                    break;

                case ERelationType.BottomTop:
                    oy = oy + this.owner.height - this._target.height / 2 + (this._targetHeight / 2 - this.owner.height);
                    break;

                case ERelationType.BottomMiddle:
                    oy = this._target.height / 2 + (oy + this.owner.height - this._targetHeight / 2) - this.owner.height;
                    break;

                case ERelationType.BottomBottom:
                    oy = this._target.height + (oy + this.owner.height - this._targetHeight) - this.owner.height;
                    break;

                case ERelationType.Width:
                    if (def.usePercent) {
                        this.owner.width = this._target.width * def.percent;
                    } else {
                        this.owner.width += dWidth;
                    }
                    break;

                case ERelationType.Height:
                    if (def.usePercent) {
                        this.owner.height = this._target.height * def.percent;
                    } else {
                        this.owner.height += dHeight;
                    }
                    break;
            }
        }

        if (ox !== this.owner.x || oy !== this.owner.y) {
            this.owner.setXY(ox, oy);
        }
    }

    /**
     * Apply relations when owner resized
     * 当所有者尺寸改变时应用关联
     */
    public applyOnSelfResized(dWidth: number, dHeight: number, bApplyPivot: boolean): void {
        if (!this._target) return;

        for (const def of this._relations) {
            switch (def.relationType) {
                case ERelationType.CenterCenter:
                    this.owner.x -= dWidth / 2;
                    break;

                case ERelationType.RightCenter:
                case ERelationType.RightLeft:
                case ERelationType.RightRight:
                    this.owner.x -= dWidth;
                    break;

                case ERelationType.MiddleMiddle:
                    this.owner.y -= dHeight / 2;
                    break;

                case ERelationType.BottomMiddle:
                case ERelationType.BottomTop:
                case ERelationType.BottomBottom:
                    this.owner.y -= dHeight;
                    break;
            }
        }
    }

    /**
     * Dispose
     * 销毁
     */
    public dispose(): void {
        if (this._target) {
            this.releaseRefTarget(this._target);
            this._target = null;
        }
        this._relations.length = 0;
    }
}
