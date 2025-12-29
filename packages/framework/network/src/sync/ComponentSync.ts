/**
 * @zh 组件同步系统
 * @en Component Sync System
 *
 * @zh 基于 @sync 装饰器的组件状态同步，与 ecs-framework 的 Sync 模块集成
 * @en Component state synchronization based on @sync decorator, integrated with ecs-framework Sync module
 */

import {
    EntitySystem,
    Matcher,
    type Entity,
    // Sync types
    SyncOperation,
    SYNC_METADATA,
    CHANGE_TRACKER,
    type SyncMetadata,
    type ChangeTracker,
    // Encoding
    encodeSnapshot,
    encodeSpawn,
    encodeDespawn,
    decodeSnapshot,
    decodeSpawn,
    processDespawn,
    registerSyncComponent,
    type DecodeSnapshotResult,
    type DecodeSpawnResult,
} from '@esengine/ecs-framework';

import { NetworkIdentity } from '../components/NetworkIdentity';

// =============================================================================
// Types | 类型定义
// =============================================================================

/**
 * @zh 组件同步事件类型
 * @en Component sync event type
 */
export type ComponentSyncEventType =
    | 'entitySpawned'
    | 'entityDespawned'
    | 'stateUpdated';

/**
 * @zh 组件同步事件
 * @en Component sync event
 */
export interface ComponentSyncEvent {
    type: ComponentSyncEventType;
    entityId: number;
    prefabType?: string;
}

/**
 * @zh 组件同步事件监听器
 * @en Component sync event listener
 */
export type ComponentSyncEventListener = (event: ComponentSyncEvent) => void;

/**
 * @zh 组件同步配置
 * @en Component sync configuration
 */
export interface ComponentSyncConfig {
    /**
     * @zh 是否启用增量同步
     * @en Whether to enable delta sync
     */
    enableDeltaSync: boolean;

    /**
     * @zh 同步间隔（毫秒）
     * @en Sync interval in milliseconds
     */
    syncInterval: number;
}

const DEFAULT_CONFIG: ComponentSyncConfig = {
    enableDeltaSync: true,
    syncInterval: 50, // 20 Hz
};

// =============================================================================
// ComponentSyncSystem | 组件同步系统
// =============================================================================

/**
 * @zh 组件同步系统
 * @en Component sync system
 *
 * @zh 基于 @sync 装饰器自动同步组件状态
 * @en Automatically syncs component state based on @sync decorator
 *
 * @example
 * ```typescript
 * // Server-side: broadcast state
 * const syncSystem = scene.getSystem(ComponentSyncSystem);
 * const data = syncSystem.encodeAllEntities(false); // delta
 * broadcast(data);
 *
 * // Client-side: receive state
 * const syncSystem = scene.getSystem(ComponentSyncSystem);
 * syncSystem.applySnapshot(data);
 * ```
 */
export class ComponentSyncSystem extends EntitySystem {
    private readonly _config: ComponentSyncConfig;
    private readonly _syncEntityMap: Map<number, Entity> = new Map();
    private readonly _syncListeners: Set<ComponentSyncEventListener> = new Set();
    private _lastSyncTime: number = 0;
    private _isServer: boolean = false;

    constructor(config?: Partial<ComponentSyncConfig>, isServer: boolean = false) {
        super(Matcher.all(NetworkIdentity));
        this._config = { ...DEFAULT_CONFIG, ...config };
        this._isServer = isServer;
    }

    /**
     * @zh 设置是否为服务端模式
     * @en Set whether in server mode
     */
    public set isServer(value: boolean) {
        this._isServer = value;
    }

    /**
     * @zh 获取是否为服务端模式
     * @en Get whether in server mode
     */
    public get isServer(): boolean {
        return this._isServer;
    }

    /**
     * @zh 获取配置
     * @en Get configuration
     */
    public get config(): Readonly<ComponentSyncConfig> {
        return this._config;
    }

    /**
     * @zh 添加同步事件监听器
     * @en Add sync event listener
     */
    public addSyncListener(listener: ComponentSyncEventListener): void {
        this._syncListeners.add(listener);
    }

    /**
     * @zh 移除同步事件监听器
     * @en Remove sync event listener
     */
    public removeSyncListener(listener: ComponentSyncEventListener): void {
        this._syncListeners.delete(listener);
    }

    /**
     * @zh 注册同步组件类型
     * @en Register sync component type
     *
     * @zh 客户端需要调用此方法注册所有需要同步的组件类型
     * @en Client needs to call this to register all component types to be synced
     */
    public registerComponent<T extends new () => any>(componentClass: T): void {
        const metadata: SyncMetadata | undefined = (componentClass as any)[SYNC_METADATA];
        if (metadata) {
            registerSyncComponent(metadata.typeId, componentClass as any);
        }
    }

    // =========================================================================
    // Server-side: Encoding | 服务端：编码
    // =========================================================================

    /**
     * @zh 编码所有实体状态
     * @en Encode all entities state
     *
     * @param fullSync - @zh 是否完整同步（首次连接时使用）@en Whether to do full sync (for initial connection)
     * @returns @zh 编码后的二进制数据 @en Encoded binary data
     */
    public encodeAllEntities(fullSync: boolean = false): Uint8Array {
        const entities = this.getMatchingEntities();
        const operation = fullSync ? SyncOperation.FULL : SyncOperation.DELTA;

        const data = encodeSnapshot(entities, operation);

        // Clear change trackers after encoding delta
        if (!fullSync) {
            this._clearChangeTrackers(entities);
        }

        return data;
    }

    /**
     * @zh 编码有变更的实体
     * @en Encode entities with changes
     *
     * @returns @zh 编码后的二进制数据，如果没有变更返回 null @en Encoded binary data, or null if no changes
     */
    public encodeDelta(): Uint8Array | null {
        const entities = this.getMatchingEntities();
        const changedEntities = entities.filter(entity => this._hasChanges(entity));

        if (changedEntities.length === 0) {
            return null;
        }

        const data = encodeSnapshot(changedEntities, SyncOperation.DELTA);
        this._clearChangeTrackers(changedEntities);

        return data;
    }

    /**
     * @zh 编码实体生成消息
     * @en Encode entity spawn message
     */
    public encodeSpawn(entity: Entity, prefabType?: string): Uint8Array {
        return encodeSpawn(entity, prefabType);
    }

    /**
     * @zh 编码实体销毁消息
     * @en Encode entity despawn message
     */
    public encodeDespawn(entityId: number): Uint8Array {
        return encodeDespawn(entityId);
    }

    // =========================================================================
    // Client-side: Decoding | 客户端：解码
    // =========================================================================

    /**
     * @zh 应用状态快照
     * @en Apply state snapshot
     *
     * @param data - @zh 二进制数据 @en Binary data
     * @returns @zh 解码结果 @en Decode result
     */
    public applySnapshot(data: Uint8Array): DecodeSnapshotResult {
        if (!this.scene) {
            throw new Error('ComponentSyncSystem not attached to a scene');
        }

        const result = decodeSnapshot(this.scene, data, this._syncEntityMap);

        // Emit events
        for (const entityResult of result.entities) {
            if (entityResult.isNew) {
                this._emitEvent({
                    type: 'entitySpawned',
                    entityId: entityResult.entityId,
                });
            } else {
                this._emitEvent({
                    type: 'stateUpdated',
                    entityId: entityResult.entityId,
                });
            }
        }

        return result;
    }

    /**
     * @zh 应用实体生成消息
     * @en Apply entity spawn message
     *
     * @param data - @zh 二进制数据 @en Binary data
     * @returns @zh 解码结果，如果不是 SPAWN 消息返回 null @en Decode result, or null if not a SPAWN message
     */
    public applySpawn(data: Uint8Array): DecodeSpawnResult | null {
        if (!this.scene) {
            throw new Error('ComponentSyncSystem not attached to a scene');
        }

        const result = decodeSpawn(this.scene, data, this._syncEntityMap);

        if (result) {
            this._emitEvent({
                type: 'entitySpawned',
                entityId: result.entity.id,
                prefabType: result.prefabType,
            });
        }

        return result;
    }

    /**
     * @zh 应用实体销毁消息
     * @en Apply entity despawn message
     *
     * @param data - @zh 二进制数据 @en Binary data
     * @returns @zh 销毁的实体 ID 列表 @en List of despawned entity IDs
     */
    public applyDespawn(data: Uint8Array): number[] {
        if (!this.scene) {
            throw new Error('ComponentSyncSystem not attached to a scene');
        }

        const entityIds = processDespawn(this.scene, data, this._syncEntityMap);

        for (const entityId of entityIds) {
            this._emitEvent({
                type: 'entityDespawned',
                entityId,
            });
        }

        return entityIds;
    }

    // =========================================================================
    // Entity Management | 实体管理
    // =========================================================================

    /**
     * @zh 通过网络 ID 获取实体
     * @en Get entity by network ID
     */
    public getEntityById(entityId: number): Entity | undefined {
        return this._syncEntityMap.get(entityId);
    }

    /**
     * @zh 获取所有匹配的实体
     * @en Get all matching entities
     */
    public getMatchingEntities(): Entity[] {
        return this.entities.slice();
    }

    // =========================================================================
    // Internal | 内部方法
    // =========================================================================

    protected override process(entities: readonly Entity[]): void {
        // Server mode: auto-sync at interval
        if (this._isServer && this._config.enableDeltaSync) {
            const now = Date.now();
            if (now - this._lastSyncTime >= this._config.syncInterval) {
                // Note: actual broadcast should be done by the user
                // This just updates the sync time
                this._lastSyncTime = now;
            }
        }

        // Update entity ID map
        for (const entity of entities) {
            const identity = entity.getComponent(NetworkIdentity);
            if (identity) {
                this._syncEntityMap.set(entity.id, entity);
            }
        }
    }

    private _hasChanges(entity: Entity): boolean {
        for (const component of entity.components) {
            const tracker = (component as any)[CHANGE_TRACKER] as ChangeTracker | undefined;
            if (tracker?.hasChanges()) {
                return true;
            }
        }
        return false;
    }

    private _clearChangeTrackers(entities: Entity[]): void {
        for (const entity of entities) {
            for (const component of entity.components) {
                const tracker = (component as any)[CHANGE_TRACKER] as ChangeTracker | undefined;
                if (tracker) {
                    tracker.clear();
                }
            }
        }
    }

    private _emitEvent(event: ComponentSyncEvent): void {
        for (const listener of this._syncListeners) {
            try {
                listener(event);
            } catch (error) {
                console.error('ComponentSyncSystem: event listener error:', error);
            }
        }
    }

    protected override onDestroy(): void {
        this._syncEntityMap.clear();
        this._syncListeners.clear();
    }
}

/**
 * @zh 创建组件同步系统
 * @en Create component sync system
 */
export function createComponentSyncSystem(
    config?: Partial<ComponentSyncConfig>,
    isServer: boolean = false
): ComponentSyncSystem {
    return new ComponentSyncSystem(config, isServer);
}
