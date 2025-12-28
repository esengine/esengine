import { EntitySystem, Matcher, Time, type Entity } from '@esengine/ecs-framework'
import { NetworkIdentity } from '../components/NetworkIdentity'
import { NetworkTransform } from '../components/NetworkTransform'

/**
 * @zh 同步消息接口
 * @en Sync message interface
 */
export interface SyncMessage {
    entities: Array<{
        netId: number
        pos?: { x: number; y: number }
        rot?: number
    }>
}

/**
 * @zh 网络同步系统
 * @en Network sync system
 *
 * @zh 处理网络实体的状态同步和插值
 * @en Handles state synchronization and interpolation for networked entities
 */
export class NetworkSyncSystem extends EntitySystem {
    private _netIdToEntity: Map<number, number> = new Map()

    constructor() {
        super(Matcher.all(NetworkIdentity, NetworkTransform))
    }

    /**
     * @zh 处理同步消息
     * @en Handle sync message
     */
    handleSync(msg: SyncMessage): void {
        for (const state of msg.entities) {
            const entityId = this._netIdToEntity.get(state.netId)
            if (entityId === undefined) continue

            const entity = this.scene?.findEntityById(entityId)
            if (!entity) continue

            const transform = entity.getComponent(NetworkTransform)
            if (transform && state.pos) {
                transform.setTarget(state.pos.x, state.pos.y, state.rot ?? 0)
            }
        }
    }

    protected override process(entities: readonly Entity[]): void {
        const deltaTime = Time.deltaTime

        for (const entity of entities) {
            const transform = this.requireComponent(entity, NetworkTransform)
            const identity = this.requireComponent(entity, NetworkIdentity)

            if (!identity.bHasAuthority && transform.bInterpolate) {
                this._interpolate(transform, deltaTime)
            }
        }
    }

    /**
     * @zh 注册网络实体
     * @en Register network entity
     */
    registerEntity(netId: number, entityId: number): void {
        this._netIdToEntity.set(netId, entityId)
    }

    /**
     * @zh 注销网络实体
     * @en Unregister network entity
     */
    unregisterEntity(netId: number): void {
        this._netIdToEntity.delete(netId)
    }

    /**
     * @zh 根据网络 ID 获取实体 ID
     * @en Get entity ID by network ID
     */
    getEntityId(netId: number): number | undefined {
        return this._netIdToEntity.get(netId)
    }

    private _interpolate(transform: NetworkTransform, deltaTime: number): void {
        const t = Math.min(1, transform.lerpSpeed * deltaTime)

        transform.currentX += (transform.targetX - transform.currentX) * t
        transform.currentY += (transform.targetY - transform.currentY) * t

        let angleDiff = transform.targetRotation - transform.currentRotation
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
        transform.currentRotation += angleDiff * t
    }

    protected override onDestroy(): void {
        this._netIdToEntity.clear()
    }
}
