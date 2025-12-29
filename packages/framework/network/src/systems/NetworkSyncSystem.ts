/**
 * @zh 网络同步系统
 * @en Network Sync System
 *
 * @zh 处理网络实体的状态同步、快照缓冲和插值
 * @en Handles state synchronization, snapshot buffering, and interpolation for networked entities
 */

import { EntitySystem, Matcher, Time, type Entity } from '@esengine/ecs-framework'
import { NetworkIdentity } from '../components/NetworkIdentity'
import { NetworkTransform } from '../components/NetworkTransform'
import type { SyncData, EntitySyncState } from '../protocol'
import {
    SnapshotBuffer,
    createSnapshotBuffer,
    TransformInterpolator,
    createTransformInterpolator,
    type ITransformState,
    type ITransformStateWithVelocity,
    type IStateSnapshot,
} from '../sync'

// =============================================================================
// Types | 类型定义
// =============================================================================

/**
 * @zh 同步消息接口（兼容旧版）
 * @en Sync message interface (for backwards compatibility)
 */
export interface SyncMessage {
    entities: Array<{
        netId: number
        pos?: { x: number; y: number }
        rot?: number
    }>
}

/**
 * @zh 实体快照数据
 * @en Entity snapshot data
 */
interface EntitySnapshotData {
    buffer: SnapshotBuffer<ITransformStateWithVelocity>
    lastServerTime: number
}

/**
 * @zh 同步系统配置
 * @en Sync system configuration
 */
export interface NetworkSyncConfig {
    /**
     * @zh 快照缓冲区大小
     * @en Snapshot buffer size
     */
    bufferSize: number

    /**
     * @zh 插值延迟（毫秒）
     * @en Interpolation delay in milliseconds
     */
    interpolationDelay: number

    /**
     * @zh 是否启用外推
     * @en Whether to enable extrapolation
     */
    enableExtrapolation: boolean

    /**
     * @zh 最大外推时间（毫秒）
     * @en Maximum extrapolation time in milliseconds
     */
    maxExtrapolationTime: number

    /**
     * @zh 使用赫尔米特插值（更平滑）
     * @en Use Hermite interpolation (smoother)
     */
    useHermiteInterpolation: boolean
}

const DEFAULT_CONFIG: NetworkSyncConfig = {
    bufferSize: 30,
    interpolationDelay: 100,
    enableExtrapolation: true,
    maxExtrapolationTime: 200,
    useHermiteInterpolation: false,
}

// =============================================================================
// NetworkSyncSystem | 网络同步系统
// =============================================================================

/**
 * @zh 网络同步系统
 * @en Network sync system
 *
 * @zh 处理网络实体的状态同步和插值，支持快照缓冲、平滑插值和外推
 * @en Handles state synchronization and interpolation for networked entities,
 *     supports snapshot buffering, smooth interpolation, and extrapolation
 */
export class NetworkSyncSystem extends EntitySystem {
    private readonly _netIdToEntity: Map<number, number> = new Map()
    private readonly _entitySnapshots: Map<number, EntitySnapshotData> = new Map()
    private readonly _interpolator: TransformInterpolator
    private readonly _config: NetworkSyncConfig

    private _serverTimeOffset: number = 0
    private _lastSyncTime: number = 0
    private _renderTime: number = 0

    constructor(config?: Partial<NetworkSyncConfig>) {
        super(Matcher.all(NetworkIdentity, NetworkTransform))
        this._config = { ...DEFAULT_CONFIG, ...config }
        this._interpolator = createTransformInterpolator()
    }

    /**
     * @zh 获取配置
     * @en Get configuration
     */
    get config(): Readonly<NetworkSyncConfig> {
        return this._config
    }

    /**
     * @zh 获取服务器时间偏移
     * @en Get server time offset
     */
    get serverTimeOffset(): number {
        return this._serverTimeOffset
    }

    /**
     * @zh 获取当前渲染时间
     * @en Get current render time
     */
    get renderTime(): number {
        return this._renderTime
    }

    /**
     * @zh 处理同步消息（新版，带时间戳）
     * @en Handle sync message (new version with timestamp)
     */
    handleSyncData(data: SyncData): void {
        const serverTime = data.timestamp

        // Update server time offset
        const clientTime = Date.now()
        this._serverTimeOffset = serverTime - clientTime
        this._lastSyncTime = clientTime

        for (const state of data.entities) {
            this._processEntityState(state, serverTime)
        }
    }

    /**
     * @zh 处理同步消息（兼容旧版）
     * @en Handle sync message (backwards compatible)
     */
    handleSync(msg: SyncMessage): void {
        const now = Date.now()
        for (const state of msg.entities) {
            const entityId = this._netIdToEntity.get(state.netId)
            if (entityId === undefined) continue

            const entity = this.scene?.findEntityById(entityId)
            if (!entity) continue

            const transform = entity.getComponent(NetworkTransform)
            if (transform && state.pos) {
                transform.setTarget(state.pos.x, state.pos.y, state.rot ?? 0)
            }

            // Also add to snapshot buffer for interpolation
            this._processEntityState({
                netId: state.netId,
                pos: state.pos,
                rot: state.rot,
            }, now)
        }
    }

    private _processEntityState(state: EntitySyncState, serverTime: number): void {
        const entityId = this._netIdToEntity.get(state.netId)
        if (entityId === undefined) return

        // Get or create snapshot buffer
        let snapshotData = this._entitySnapshots.get(state.netId)
        if (!snapshotData) {
            snapshotData = {
                buffer: createSnapshotBuffer<ITransformStateWithVelocity>(
                    this._config.bufferSize,
                    this._config.interpolationDelay
                ),
                lastServerTime: 0,
            }
            this._entitySnapshots.set(state.netId, snapshotData)
        }

        // Create snapshot
        const transformState: ITransformStateWithVelocity = {
            x: state.pos?.x ?? 0,
            y: state.pos?.y ?? 0,
            rotation: state.rot ?? 0,
            velocityX: state.vel?.x ?? 0,
            velocityY: state.vel?.y ?? 0,
            angularVelocity: state.angVel ?? 0,
        }

        const snapshot: IStateSnapshot<ITransformStateWithVelocity> = {
            timestamp: serverTime,
            state: transformState,
        }

        snapshotData.buffer.push(snapshot)
        snapshotData.lastServerTime = serverTime
    }

    protected override process(entities: readonly Entity[]): void {
        const deltaTime = Time.deltaTime
        const clientTime = Date.now()

        // Calculate render time (current time adjusted for server offset)
        this._renderTime = clientTime + this._serverTimeOffset

        for (const entity of entities) {
            const transform = this.requireComponent(entity, NetworkTransform)
            const identity = this.requireComponent(entity, NetworkIdentity)

            // Skip entities with authority (local player handles their own movement)
            if (identity.bHasAuthority) continue

            if (transform.bInterpolate) {
                this._interpolateEntity(identity.netId, transform, deltaTime)
            }
        }
    }

    private _interpolateEntity(
        netId: number,
        transform: NetworkTransform,
        deltaTime: number
    ): void {
        const snapshotData = this._entitySnapshots.get(netId)

        if (snapshotData && snapshotData.buffer.size >= 2) {
            // Use snapshot buffer for interpolation
            const result = snapshotData.buffer.getInterpolationSnapshots(this._renderTime)

            if (result) {
                const [prev, next, t] = result
                const interpolated = this._interpolator.interpolate(prev.state, next.state, t)

                transform.currentX = interpolated.x
                transform.currentY = interpolated.y
                transform.currentRotation = interpolated.rotation

                // Update target for compatibility
                transform.targetX = next.state.x
                transform.targetY = next.state.y
                transform.targetRotation = next.state.rotation
                return
            }

            // Extrapolation if enabled and we have velocity data
            if (this._config.enableExtrapolation) {
                const latest = snapshotData.buffer.getLatest()
                if (latest) {
                    const timeSinceLastSnapshot = this._renderTime - latest.timestamp
                    if (timeSinceLastSnapshot > 0 && timeSinceLastSnapshot < this._config.maxExtrapolationTime) {
                        const extrapolated = this._interpolator.extrapolate(
                            latest.state,
                            timeSinceLastSnapshot / 1000
                        )
                        transform.currentX = extrapolated.x
                        transform.currentY = extrapolated.y
                        transform.currentRotation = extrapolated.rotation
                        return
                    }
                }
            }
        }

        // Fallback: simple lerp towards target
        this._simpleLerp(transform, deltaTime)
    }

    private _simpleLerp(transform: NetworkTransform, deltaTime: number): void {
        const t = Math.min(1, transform.lerpSpeed * deltaTime)

        transform.currentX += (transform.targetX - transform.currentX) * t
        transform.currentY += (transform.targetY - transform.currentY) * t

        let angleDiff = transform.targetRotation - transform.currentRotation
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
        transform.currentRotation += angleDiff * t
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
        this._entitySnapshots.delete(netId)
    }

    /**
     * @zh 根据网络 ID 获取实体 ID
     * @en Get entity ID by network ID
     */
    getEntityId(netId: number): number | undefined {
        return this._netIdToEntity.get(netId)
    }

    /**
     * @zh 获取实体的快照缓冲区
     * @en Get entity's snapshot buffer
     */
    getSnapshotBuffer(netId: number): SnapshotBuffer<ITransformStateWithVelocity> | undefined {
        return this._entitySnapshots.get(netId)?.buffer
    }

    /**
     * @zh 清空所有快照缓冲
     * @en Clear all snapshot buffers
     */
    clearSnapshots(): void {
        for (const data of this._entitySnapshots.values()) {
            data.buffer.clear()
        }
    }

    protected override onDestroy(): void {
        this._netIdToEntity.clear()
        this._entitySnapshots.clear()
    }
}
