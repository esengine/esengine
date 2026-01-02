/**
 * @zh ECS 房间基类
 * @en ECS Room base class
 */

import {
    Core,
    Scene,
    World,
    Entity,
    EntitySystem,
    type Component,
    // Sync
    SyncOperation,
    SYNC_METADATA,
    CHANGE_TRACKER,
    type SyncMetadata,
    type ChangeTracker,
    encodeSnapshot,
    encodeSpawn,
    encodeDespawn,
    initChangeTracker,
    // Network Entity
    NETWORK_ENTITY_METADATA,
    type NetworkEntityMetadata,
    // Events
    ECSEventType
} from '@esengine/ecs-framework';

import { Room, type RoomOptions } from '../room/Room.js';
import type { Player } from '../room/Player.js';

// =============================================================================
// Types | 类型定义
// =============================================================================

/**
 * @zh ECS 房间配置
 * @en ECS room configuration
 */
export interface ECSRoomConfig {
    /**
     * @zh 状态同步间隔（毫秒）
     * @en State sync interval in milliseconds
     */
    syncInterval: number;

    /**
     * @zh 是否启用增量同步
     * @en Whether to enable delta sync
     */
    enableDeltaSync: boolean;

    /**
     * @zh 是否启用自动网络实体广播（基于 @NetworkEntity 装饰器）
     * @en Whether to enable automatic network entity broadcasting (based on @NetworkEntity decorator)
     * @default true
     */
    enableAutoNetworkEntity: boolean;
}

const DEFAULT_ECS_CONFIG: ECSRoomConfig = {
    syncInterval: 50, // 20 Hz
    enableDeltaSync: true,
    enableAutoNetworkEntity: true
};

/**
 * @zh 网络实体标识组件
 * @en Network entity identity component
 */
const NETWORK_ENTITY_OWNER = Symbol('NetworkEntityOwner');

// =============================================================================
// ECSRoom | ECS 房间
// =============================================================================

/**
 * @zh ECS 房间基类，带有 ECS World 支持和自动状态同步
 * @en ECS Room base class with ECS World support and automatic state synchronization
 *
 * @example
 * ```typescript
 * // 服务端启动
 * Core.create();
 * setInterval(() => Core.update(1/60), 16);
 *
 * // 定义房间
 * class GameRoom extends ECSRoom {
 *     onCreate() {
 *         this.addSystem(new PhysicsSystem());
 *     }
 *
 *     onJoin(player: Player) {
 *         const entity = this.createPlayerEntity(player.id);
 *         entity.addComponent(new PlayerComponent());
 *     }
 * }
 * ```
 */
export abstract class ECSRoom<TState = any, TPlayerData = Record<string, unknown>> extends Room<TState, TPlayerData> {
    /**
     * @zh ECS World（由 Core.worldManager 管理）
     * @en ECS World (managed by Core.worldManager)
     */
    protected readonly world: World;

    /**
     * @zh World 在 WorldManager 中的 ID
     * @en World ID in WorldManager
     */
    protected readonly worldId: string;

    /**
     * @zh 房间的主场景
     * @en Room's main scene
     */
    protected readonly scene: Scene;

    /**
     * @zh ECS 配置
     * @en ECS configuration
     */
    protected readonly ecsConfig: ECSRoomConfig;

    /**
     * @zh 玩家 ID 到实体的映射
     * @en Player ID to Entity mapping
     */
    private readonly _playerEntities: Map<string, Entity> = new Map();

    /**
     * @zh 网络实体映射（实体 ID -> prefabType）
     * @en Network entity mapping (entity ID -> prefabType)
     */
    private readonly _networkEntities: Map<number, string> = new Map();

    /**
     * @zh 上次同步时间
     * @en Last sync time
     */
    private _lastSyncTime: number = 0;

    constructor(ecsConfig?: Partial<ECSRoomConfig>) {
        super();

        // Check Core initialization
        if (!Core.worldManager) {
            throw new Error(
                'ECSRoom requires Core.create() to be called first. ' +
                'Ensure Core is initialized before creating ECSRoom instances.'
            );
        }

        this.ecsConfig = { ...DEFAULT_ECS_CONFIG, ...ecsConfig };

        this.worldId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        this.world = Core.worldManager.createWorld(this.worldId);
        this.scene = this.world.createScene('game');
        this.world.setSceneActive('game', true);
        this.world.start();

        // 设置自动网络实体广播
        if (this.ecsConfig.enableAutoNetworkEntity) {
            this._setupAutoNetworkEntity();
        }
    }

    /**
     * @zh 设置自动网络实体广播
     * @en Setup automatic network entity broadcasting
     */
    private _setupAutoNetworkEntity(): void {
        // 监听组件添加事件，自动广播 spawn
        this.scene.eventSystem.on(ECSEventType.COMPONENT_ADDED, (event: any) => {
            const { entity, component } = event;
            const metadata: NetworkEntityMetadata | undefined =
                (component.constructor as any)[NETWORK_ENTITY_METADATA];

            if (metadata?.autoSpawn) {
                // 避免重复广播同一实体
                if (!this._networkEntities.has(entity.id)) {
                    this._networkEntities.set(entity.id, metadata.prefabType);
                    this.broadcastSpawn(entity, metadata.prefabType);
                }
            }

            // 记录需要自动 despawn 的实体
            if (metadata?.autoDespawn && !this._networkEntities.has(entity.id)) {
                this._networkEntities.set(entity.id, metadata.prefabType);
            }
        });

        // 监听实体销毁事件，自动广播 despawn
        this.scene.eventSystem.on(ECSEventType.ENTITY_DESTROYED, (event: any) => {
            const { entityId } = event;
            if (this._networkEntities.has(entityId)) {
                const despawnData = encodeDespawn(entityId);
                this.broadcastBinary(despawnData);
                this._networkEntities.delete(entityId);
            }
        });
    }

    // =========================================================================
    // Scene Management | 场景管理
    // =========================================================================

    /**
     * @zh 添加系统到场景
     * @en Add system to scene
     */
    protected addSystem(system: EntitySystem): void {
        this.scene.addSystem(system);
    }

    /**
     * @zh 创建实体
     * @en Create entity
     */
    protected createEntity(name?: string): Entity {
        return this.scene.createEntity(name ?? `entity_${Date.now()}`);
    }

    /**
     * @zh 为玩家创建实体
     * @en Create entity for player
     *
     * @param playerId - @zh 玩家 ID @en Player ID
     * @param name - @zh 实体名称 @en Entity name
     * @returns @zh 创建的实体 @en Created entity
     */
    protected createPlayerEntity(playerId: string, name?: string): Entity {
        const entityName = name ?? `player_${playerId}`;
        const entity = this.scene.createEntity(entityName);
        (entity as any)[NETWORK_ENTITY_OWNER] = playerId;
        this._playerEntities.set(playerId, entity);
        return entity;
    }

    /**
     * @zh 获取玩家的实体
     * @en Get player's entity
     */
    protected getPlayerEntity(playerId: string): Entity | undefined {
        return this._playerEntities.get(playerId);
    }

    /**
     * @zh 销毁玩家的实体
     * @en Destroy player's entity
     */
    protected destroyPlayerEntity(playerId: string): void {
        const entity = this._playerEntities.get(playerId);
        if (entity) {
            const despawnData = encodeDespawn(entity.id);
            this.broadcastBinary(despawnData);
            entity.destroy();
            this._playerEntities.delete(playerId);
        }
    }

    // =========================================================================
    // State Sync | 状态同步
    // =========================================================================

    /**
     * @zh 广播二进制数据
     * @en Broadcast binary data
     */
    protected broadcastBinary(data: Uint8Array): void {
        for (const player of this.players) {
            this.sendBinary(player, data);
        }
    }

    /**
     * @zh 发送二进制数据给指定玩家
     * @en Send binary data to specific player
     *
     * @zh 使用原生 WebSocket 二进制帧发送，效率更高
     * @en Uses native WebSocket binary frames, more efficient
     */
    protected sendBinary(player: Player<TPlayerData>, data: Uint8Array): void {
        player.sendBinary(data);
    }

    /**
     * @zh 发送完整状态给玩家（用于玩家刚加入时）
     * @en Send full state to player (for when player just joined)
     */
    protected sendFullState(player: Player<TPlayerData>): void {
        const entities = this._getSyncEntities();
        if (entities.length === 0) return;

        for (const entity of entities) {
            this._initComponentTrackers(entity);
        }

        const data = encodeSnapshot(entities, SyncOperation.FULL);
        this.sendBinary(player, data);
    }

    /**
     * @zh 广播实体生成
     * @en Broadcast entity spawn
     */
    protected broadcastSpawn(entity: Entity, prefabType?: string): void {
        this._initComponentTrackers(entity);
        const data = encodeSpawn(entity, prefabType);
        this.broadcastBinary(data);
    }

    /**
     * @zh 广播增量状态更新
     * @en Broadcast delta state update
     */
    protected broadcastDelta(): void {
        const entities = this._getSyncEntities();
        const changedEntities = entities.filter((entity) => this._hasChanges(entity));

        if (changedEntities.length === 0) return;

        const data = encodeSnapshot(changedEntities, SyncOperation.DELTA);
        this.broadcastBinary(data);
        this._clearChangeTrackers(changedEntities);
    }

    // =========================================================================
    // Lifecycle Overrides | 生命周期重载
    // =========================================================================

    /**
     * @zh 游戏循环，处理状态同步
     * @en Game tick, handles state sync
     */
    override onTick(_dt: number): void {
        if (this.ecsConfig.enableDeltaSync) {
            const now = Date.now();
            if (now - this._lastSyncTime >= this.ecsConfig.syncInterval) {
                this._lastSyncTime = now;
                this.broadcastDelta();
            }
        }
    }

    /**
     * @zh 玩家离开时自动销毁其实体
     * @en Auto destroy player entity when leaving
     */
    override async onLeave(player: Player<TPlayerData>, reason?: string): Promise<void> {
        this.destroyPlayerEntity(player.id);
    }

    /**
     * @zh 房间销毁时从 WorldManager 移除 World
     * @en Remove World from WorldManager when room is disposed
     */
    override onDispose(): void {
        this._playerEntities.clear();
        Core.worldManager.removeWorld(this.worldId);
    }

    // =========================================================================
    // Internal | 内部方法
    // =========================================================================

    private _getSyncEntities(): Entity[] {
        const entities: Entity[] = [];
        for (const entity of this.scene.entities.buffer) {
            if (this._hasSyncComponents(entity)) {
                entities.push(entity);
            }
        }
        return entities;
    }

    private _hasSyncComponents(entity: Entity): boolean {
        for (const component of entity.components) {
            const metadata: SyncMetadata | undefined = (component.constructor as any)[SYNC_METADATA];
            if (metadata && metadata.fields.length > 0) {
                return true;
            }
        }
        return false;
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

    private _initComponentTrackers(entity: Entity): void {
        for (const component of entity.components) {
            const metadata: SyncMetadata | undefined = (component.constructor as any)[SYNC_METADATA];
            if (metadata && metadata.fields.length > 0) {
                initChangeTracker(component);
            }
        }
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
}
