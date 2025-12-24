import { EntitySystem, Matcher, Time, type Entity } from '@esengine/ecs-framework';
import type { MsgSync } from '@esengine/network-protocols';
import { NetworkIdentity } from '../components/NetworkIdentity';
import { NetworkTransform } from '../components/NetworkTransform';
import type { NetworkService } from '../services/NetworkService';

/**
 * 网络同步系统
 * Network sync system
 *
 * 处理网络实体的状态同步和插值。
 * Handles state synchronization and interpolation for networked entities.
 */
export class NetworkSyncSystem extends EntitySystem {
    private _networkService: NetworkService;
    private _netIdToEntity: Map<number, number> = new Map();

    constructor(networkService: NetworkService) {
        super(Matcher.all(NetworkIdentity, NetworkTransform));
        this._networkService = networkService;
    }

    protected override onInitialize(): void {
        this._networkService.setCallbacks({
            onSync: this._handleSync.bind(this)
        });
    }

    /**
     * 处理实体列表
     * Process entities
     */
    protected override process(entities: readonly Entity[]): void {
        const deltaTime = Time.deltaTime;

        for (const entity of entities) {
            const transform = this.requireComponent(entity, NetworkTransform);
            const identity = this.requireComponent(entity, NetworkIdentity);

            // 只有非本地玩家需要插值
            // Only non-local players need interpolation
            if (!identity.bHasAuthority && transform.bInterpolate) {
                this._interpolate(transform, deltaTime);
            }
        }
    }

    /**
     * 注册网络实体
     * Register network entity
     */
    public registerEntity(netId: number, entityId: number): void {
        this._netIdToEntity.set(netId, entityId);
    }

    /**
     * 注销网络实体
     * Unregister network entity
     */
    public unregisterEntity(netId: number): void {
        this._netIdToEntity.delete(netId);
    }

    /**
     * 根据网络 ID 获取实体 ID
     * Get entity ID by network ID
     */
    public getEntityId(netId: number): number | undefined {
        return this._netIdToEntity.get(netId);
    }

    private _handleSync(msg: MsgSync): void {
        for (const state of msg.entities) {
            const entityId = this._netIdToEntity.get(state.netId);
            if (entityId === undefined) continue;

            const entity = this.scene?.findEntityById(entityId);
            if (!entity) continue;

            const transform = entity.getComponent(NetworkTransform);
            if (transform && state.pos) {
                transform.setTarget(state.pos.x, state.pos.y, state.rot);
            }
        }
    }

    private _interpolate(transform: NetworkTransform, deltaTime: number): void {
        const t = Math.min(1, transform.lerpSpeed * deltaTime);

        transform.currentX += (transform.targetX - transform.currentX) * t;
        transform.currentY += (transform.targetY - transform.currentY) * t;

        // 角度插值需要处理环绕
        // Angle interpolation needs to handle wrap-around
        let angleDiff = transform.targetRotation - transform.currentRotation;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        transform.currentRotation += angleDiff * t;
    }

    protected override onDestroy(): void {
        this._netIdToEntity.clear();
    }
}
