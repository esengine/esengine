import { ERelationType } from '../core/FieldTypes';
import type { GObject } from '../core/GObject';
import { RelationItem } from './RelationItem';

/**
 * Relations
 *
 * Manages constraint-based layout relationships between UI objects.
 *
 * 管理 UI 对象之间的约束布局关系
 */
export class Relations {
    /** Owner object | 所有者对象 */
    public readonly owner: GObject;

    /** Size dirty flag | 尺寸脏标记 */
    public sizeDirty: boolean = false;

    private _items: RelationItem[] = [];

    constructor(owner: GObject) {
        this.owner = owner;
    }

    /**
     * Add a relation
     * 添加关联
     */
    public add(target: GObject, relationType: ERelationType, bUsePercent: boolean = false): void {
        let item: RelationItem | null = null;

        for (const existing of this._items) {
            if (existing.target === target) {
                item = existing;
                break;
            }
        }

        if (!item) {
            item = new RelationItem(this.owner);
            item.target = target;
            this._items.push(item);
        }

        item.add(relationType, bUsePercent);
    }

    /**
     * Remove a relation
     * 移除关联
     */
    public remove(target: GObject, relationType: ERelationType = ERelationType.Size): void {
        for (let i = this._items.length - 1; i >= 0; i--) {
            const item = this._items[i];
            if (item.target === target) {
                item.remove(relationType);
                if (item.isEmpty()) {
                    this._items.splice(i, 1);
                }
                break;
            }
        }
    }

    /**
     * Check if target has any relations
     * 检查目标是否有任何关联
     */
    public contains(target: GObject): boolean {
        return this._items.some(item => item.target === target);
    }

    /**
     * Clear relations with a target
     * 清除与目标的所有关联
     */
    public clearFor(target: GObject): void {
        for (let i = this._items.length - 1; i >= 0; i--) {
            if (this._items[i].target === target) {
                this._items.splice(i, 1);
            }
        }
    }

    /**
     * Clear all relations
     * 清除所有关联
     */
    public clearAll(): void {
        for (const item of this._items) {
            item.dispose();
        }
        this._items.length = 0;
    }

    /**
     * Copy relations from another object
     * 从另一个对象复制关联
     */
    public copyFrom(source: Relations): void {
        this.clearAll();
        for (const item of source._items) {
            const newItem = new RelationItem(this.owner);
            newItem.copyFrom(item);
            this._items.push(newItem);
        }
    }

    /**
     * Called when owner size changed
     * 当所有者尺寸改变时调用
     */
    public onOwnerSizeChanged(dWidth: number, dHeight: number, bApplyPivot: boolean): void {
        for (const item of this._items) {
            item.applyOnSelfResized(dWidth, dHeight, bApplyPivot);
        }
    }

    /**
     * Ensure relations size is correct
     * 确保关联尺寸正确
     */
    public ensureRelationsSizeCorrect(): void {
        if (!this.sizeDirty) return;

        this.sizeDirty = false;

        for (const item of this._items) {
            item.target?.ensureSizeCorrect();
        }
    }

    /**
     * Get items count
     * 获取项目数量
     */
    public get count(): number {
        return this._items.length;
    }

    /**
     * Dispose
     * 销毁
     */
    public dispose(): void {
        this.clearAll();
    }
}
