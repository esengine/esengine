/**
 * @zh 组件变更追踪器
 * @en Component change tracker
 *
 * @zh 用于追踪 @sync 标记字段的变更，支持增量同步
 * @en Tracks changes to @sync marked fields for delta synchronization
 */
export class ChangeTracker {
    /**
     * @zh 脏字段索引集合
     * @en Set of dirty field indices
     */
    private _dirtyFields: Set<number> = new Set();

    /**
     * @zh 是否有任何变更
     * @en Whether there are any changes
     */
    private _hasChanges: boolean = false;

    /**
     * @zh 上次同步的时间戳
     * @en Last sync timestamp
     */
    private _lastSyncTime: number = 0;

    /**
     * @zh 标记字段为脏
     * @en Mark field as dirty
     *
     * @param fieldIndex - @zh 字段索引 @en Field index
     */
    public setDirty(fieldIndex: number): void {
        this._dirtyFields.add(fieldIndex);
        this._hasChanges = true;
    }

    /**
     * @zh 检查是否有变更
     * @en Check if there are any changes
     */
    public hasChanges(): boolean {
        return this._hasChanges;
    }

    /**
     * @zh 检查特定字段是否脏
     * @en Check if a specific field is dirty
     *
     * @param fieldIndex - @zh 字段索引 @en Field index
     */
    public isDirty(fieldIndex: number): boolean {
        return this._dirtyFields.has(fieldIndex);
    }

    /**
     * @zh 获取所有脏字段索引
     * @en Get all dirty field indices
     */
    public getDirtyFields(): number[] {
        return Array.from(this._dirtyFields);
    }

    /**
     * @zh 获取脏字段数量
     * @en Get number of dirty fields
     */
    public getDirtyCount(): number {
        return this._dirtyFields.size;
    }

    /**
     * @zh 清除所有变更标记
     * @en Clear all change marks
     */
    public clear(): void {
        this._dirtyFields.clear();
        this._hasChanges = false;
        this._lastSyncTime = Date.now();
    }

    /**
     * @zh 清除特定字段的变更标记
     * @en Clear change mark for a specific field
     *
     * @param fieldIndex - @zh 字段索引 @en Field index
     */
    public clearField(fieldIndex: number): void {
        this._dirtyFields.delete(fieldIndex);
        if (this._dirtyFields.size === 0) {
            this._hasChanges = false;
        }
    }

    /**
     * @zh 获取上次同步时间
     * @en Get last sync time
     */
    public get lastSyncTime(): number {
        return this._lastSyncTime;
    }

    /**
     * @zh 标记所有字段为脏（用于首次同步）
     * @en Mark all fields as dirty (for initial sync)
     *
     * @param fieldCount - @zh 字段数量 @en Field count
     */
    public markAllDirty(fieldCount: number): void {
        for (let i = 0; i < fieldCount; i++) {
            this._dirtyFields.add(i);
        }
        this._hasChanges = fieldCount > 0;
    }

    /**
     * @zh 重置追踪器
     * @en Reset tracker
     */
    public reset(): void {
        this._dirtyFields.clear();
        this._hasChanges = false;
        this._lastSyncTime = 0;
    }
}
