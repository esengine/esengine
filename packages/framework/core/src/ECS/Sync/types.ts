/**
 * @zh 网络同步类型定义
 * @en Network synchronization type definitions
 */

/**
 * @zh 支持的同步数据类型
 * @en Supported sync data types
 */
export type SyncType =
    | 'boolean'
    | 'int8'
    | 'uint8'
    | 'int16'
    | 'uint16'
    | 'int32'
    | 'uint32'
    | 'float32'
    | 'float64'
    | 'string';

/**
 * @zh 同步字段元数据
 * @en Sync field metadata
 */
export interface SyncFieldMetadata {
    /**
     * @zh 字段索引（用于二进制编码）
     * @en Field index (for binary encoding)
     */
    index: number;

    /**
     * @zh 字段名称
     * @en Field name
     */
    name: string;

    /**
     * @zh 字段类型
     * @en Field type
     */
    type: SyncType;
}

/**
 * @zh 组件同步元数据
 * @en Component sync metadata
 */
export interface SyncMetadata {
    /**
     * @zh 组件类型 ID
     * @en Component type ID
     */
    typeId: string;

    /**
     * @zh 同步字段列表（按索引排序）
     * @en Sync fields list (sorted by index)
     */
    fields: SyncFieldMetadata[];

    /**
     * @zh 字段名到索引的映射
     * @en Field name to index mapping
     */
    fieldIndexMap: Map<string, number>;
}

/**
 * @zh 同步操作类型
 * @en Sync operation type
 */
export enum SyncOperation {
    /**
     * @zh 完整快照
     * @en Full snapshot
     */
    FULL = 0,

    /**
     * @zh 增量更新
     * @en Delta update
     */
    DELTA = 1,

    /**
     * @zh 实体生成
     * @en Entity spawn
     */
    SPAWN = 2,

    /**
     * @zh 实体销毁
     * @en Entity despawn
     */
    DESPAWN = 3,
}

/**
 * @zh 各类型的字节大小
 * @en Byte size for each type
 */
export const TYPE_SIZES: Record<SyncType, number> = {
    boolean: 1,
    int8: 1,
    uint8: 1,
    int16: 2,
    uint16: 2,
    int32: 4,
    uint32: 4,
    float32: 4,
    float64: 8,
    string: -1, // 动态长度 | dynamic length
};

/**
 * @zh 同步元数据的 Symbol 键
 * @en Symbol key for sync metadata
 */
export const SYNC_METADATA = Symbol('SyncMetadata');

/**
 * @zh 变更追踪器的 Symbol 键
 * @en Symbol key for change tracker
 */
export const CHANGE_TRACKER = Symbol('ChangeTracker');
