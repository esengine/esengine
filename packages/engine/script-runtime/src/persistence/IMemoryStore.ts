/**
 * @zh Memory 存储接口
 * @en Memory Store Interface
 *
 * @zh 定义玩家 Memory 和世界状态的持久化接口
 * @en Defines persistence interface for player Memory and world state
 */

/**
 * @zh 玩家 Memory 类型
 * @en Player Memory type
 */
export type PlayerMemory = Record<string, unknown>;

/**
 * @zh 世界状态类型
 * @en World state type
 */
export interface WorldState {
    /**
     * @zh 当前 tick
     * @en Current tick
     */
    tick: number;

    /**
     * @zh 上次保存时间
     * @en Last save time
     */
    lastSaveTime: number;

    /**
     * @zh 实体状态
     * @en Entity states
     */
    entities: Record<string, unknown>;

    /**
     * @zh 房间状态
     * @en Room states
     */
    rooms: Record<string, unknown>;
}

/**
 * @zh Memory 存储接口
 * @en Memory store interface
 */
export interface IMemoryStore {
    /**
     * @zh 加载玩家 Memory
     * @en Load player Memory
     *
     * @param playerId - @zh 玩家 ID @en Player ID
     * @returns @zh 玩家 Memory @en Player Memory
     */
    loadPlayerMemory(playerId: string): Promise<PlayerMemory>;

    /**
     * @zh 保存玩家 Memory
     * @en Save player Memory
     *
     * @param playerId - @zh 玩家 ID @en Player ID
     * @param memory - @zh Memory 数据 @en Memory data
     */
    savePlayerMemory(playerId: string, memory: PlayerMemory): Promise<void>;

    /**
     * @zh 批量保存玩家 Memory
     * @en Batch save player Memory
     *
     * @param entries - @zh Memory 条目列表 @en Memory entry list
     */
    savePlayerMemoryBatch(entries: Array<{ playerId: string; memory: PlayerMemory }>): Promise<void>;

    /**
     * @zh 删除玩家 Memory
     * @en Delete player Memory
     *
     * @param playerId - @zh 玩家 ID @en Player ID
     */
    deletePlayerMemory(playerId: string): Promise<void>;

    /**
     * @zh 获取所有玩家 ID
     * @en Get all player IDs
     */
    getAllPlayerIds(): Promise<string[]>;

    /**
     * @zh 加载世界状态
     * @en Load world state
     */
    loadWorldState(): Promise<WorldState | null>;

    /**
     * @zh 保存世界状态
     * @en Save world state
     */
    saveWorldState(state: WorldState): Promise<void>;

    /**
     * @zh 获取存储统计信息
     * @en Get storage statistics
     */
    getStats(): Promise<MemoryStoreStats>;
}

/**
 * @zh 存储统计信息
 * @en Storage statistics
 */
export interface MemoryStoreStats {
    /**
     * @zh 玩家数量
     * @en Player count
     */
    playerCount: number;

    /**
     * @zh 总存储大小（字节）
     * @en Total storage size (bytes)
     */
    totalSize: number;

    /**
     * @zh 上次保存时间
     * @en Last save time
     */
    lastSaveTime: number;
}
