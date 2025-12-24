import { EntitySystem, Entity, type Scene, Matcher } from '@esengine/ecs-framework';
import type { MsgSpawn, MsgDespawn } from '@esengine/network-protocols';
import { NetworkIdentity } from '../components/NetworkIdentity';
import { NetworkTransform } from '../components/NetworkTransform';
import type { NetworkService } from '../services/NetworkService';
import type { NetworkSyncSystem } from './NetworkSyncSystem';

/**
 * 预制体工厂函数类型
 * Prefab factory function type
 */
export type PrefabFactory = (scene: Scene, spawn: MsgSpawn) => Entity;

/**
 * 网络生成系统
 * Network spawn system
 *
 * 处理网络实体的生成和销毁。
 * Handles spawning and despawning of networked entities.
 */
export class NetworkSpawnSystem extends EntitySystem {
    private _networkService: NetworkService;
    private _syncSystem: NetworkSyncSystem;
    private _prefabFactories: Map<string, PrefabFactory> = new Map();

    constructor(networkService: NetworkService, syncSystem: NetworkSyncSystem) {
        // 不查询任何实体，此系统只响应网络消息
        // Don't query any entities, this system only responds to network messages
        super(Matcher.nothing());
        this._networkService = networkService;
        this._syncSystem = syncSystem;
    }

    protected override onInitialize(): void {
        this._networkService.setCallbacks({
            onSpawn: this._handleSpawn.bind(this),
            onDespawn: this._handleDespawn.bind(this)
        });
    }

    /**
     * 注册预制体工厂
     * Register prefab factory
     */
    public registerPrefab(prefabType: string, factory: PrefabFactory): void {
        this._prefabFactories.set(prefabType, factory);
    }

    /**
     * 注销预制体工厂
     * Unregister prefab factory
     */
    public unregisterPrefab(prefabType: string): void {
        this._prefabFactories.delete(prefabType);
    }

    private _handleSpawn(msg: MsgSpawn): void {
        if (!this.scene) return;

        const factory = this._prefabFactories.get(msg.prefab);
        if (!factory) {
            this.logger.warn(`Unknown prefab: ${msg.prefab}`);
            return;
        }

        const entity = factory(this.scene, msg);

        // 添加网络组件
        // Add network components
        const identity = entity.addComponent(new NetworkIdentity());
        identity.netId = msg.netId;
        identity.ownerId = msg.ownerId;
        identity.prefabType = msg.prefab;
        identity.bHasAuthority = msg.ownerId === this._networkService.clientId;
        identity.bIsLocalPlayer = identity.bHasAuthority;

        const transform = entity.addComponent(new NetworkTransform());
        transform.setTarget(msg.pos.x, msg.pos.y, msg.rot);
        transform.snap();

        // 注册到同步系统
        // Register to sync system
        this._syncSystem.registerEntity(msg.netId, entity.id);
    }

    private _handleDespawn(msg: MsgDespawn): void {
        const entityId = this._syncSystem.getEntityId(msg.netId);
        if (entityId === undefined) return;

        const entity = this.scene?.findEntityById(entityId);
        if (entity) {
            entity.destroy();
        }

        this._syncSystem.unregisterEntity(msg.netId);
    }

    protected override onDestroy(): void {
        this._prefabFactories.clear();
    }
}
