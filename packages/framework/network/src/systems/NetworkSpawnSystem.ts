import { EntitySystem, Entity, type Scene, Matcher } from '@esengine/ecs-framework'
import { NetworkIdentity } from '../components/NetworkIdentity'
import { NetworkTransform } from '../components/NetworkTransform'
import type { NetworkSyncSystem } from './NetworkSyncSystem'

/**
 * @zh 生成消息接口
 * @en Spawn message interface
 */
export interface SpawnMessage {
    netId: number
    ownerId: number
    prefab: string
    pos: { x: number; y: number }
    rot?: number
}

/**
 * @zh 销毁消息接口
 * @en Despawn message interface
 */
export interface DespawnMessage {
    netId: number
}

/**
 * @zh 预制体工厂函数类型
 * @en Prefab factory function type
 */
export type PrefabFactory = (scene: Scene, spawn: SpawnMessage) => Entity

/**
 * @zh 网络生成系统
 * @en Network spawn system
 *
 * @zh 处理网络实体的生成和销毁
 * @en Handles spawning and despawning of networked entities
 */
export class NetworkSpawnSystem extends EntitySystem {
    private _syncSystem: NetworkSyncSystem
    private _prefabFactories: Map<string, PrefabFactory> = new Map()
    private _localPlayerId: number = 0

    constructor(syncSystem: NetworkSyncSystem) {
        super(Matcher.nothing())
        this._syncSystem = syncSystem
    }

    /**
     * @zh 设置本地玩家 ID
     * @en Set local player ID
     */
    setLocalPlayerId(id: number): void {
        this._localPlayerId = id
    }

    /**
     * @zh 处理生成消息
     * @en Handle spawn message
     */
    handleSpawn(msg: SpawnMessage): Entity | null {
        if (!this.scene) return null

        const factory = this._prefabFactories.get(msg.prefab)
        if (!factory) {
            this.logger.warn(`Unknown prefab: ${msg.prefab}`)
            return null
        }

        const entity = factory(this.scene, msg)

        const identity = entity.addComponent(new NetworkIdentity())
        identity.netId = msg.netId
        identity.ownerId = msg.ownerId
        identity.prefabType = msg.prefab
        identity.bHasAuthority = msg.ownerId === this._localPlayerId
        identity.bIsLocalPlayer = identity.bHasAuthority

        const transform = entity.addComponent(new NetworkTransform())
        transform.setTarget(msg.pos.x, msg.pos.y, msg.rot ?? 0)
        transform.snap()

        this._syncSystem.registerEntity(msg.netId, entity.id)

        return entity
    }

    /**
     * @zh 处理销毁消息
     * @en Handle despawn message
     */
    handleDespawn(msg: DespawnMessage): void {
        const entityId = this._syncSystem.getEntityId(msg.netId)
        if (entityId === undefined) return

        const entity = this.scene?.findEntityById(entityId)
        if (entity) {
            entity.destroy()
        }

        this._syncSystem.unregisterEntity(msg.netId)
    }

    /**
     * @zh 注册预制体工厂
     * @en Register prefab factory
     */
    registerPrefab(prefabType: string, factory: PrefabFactory): void {
        this._prefabFactories.set(prefabType, factory)
    }

    /**
     * @zh 注销预制体工厂
     * @en Unregister prefab factory
     */
    unregisterPrefab(prefabType: string): void {
        this._prefabFactories.delete(prefabType)
    }

    protected override onDestroy(): void {
        this._prefabFactories.clear()
    }
}
