/**
 * @zh 状态增量压缩
 * @en State Delta Compression
 *
 * @zh 通过只发送变化的字段来减少网络带宽
 * @en Reduces network bandwidth by only sending changed fields
 */

import type { EntitySyncState, SyncData } from '../protocol'

// =============================================================================
// Types | 类型定义
// =============================================================================

/**
 * @zh 增量类型标志
 * @en Delta type flags
 */
export const DeltaFlags = {
    NONE: 0,
    POSITION: 1 << 0,
    ROTATION: 1 << 1,
    VELOCITY: 1 << 2,
    ANGULAR_VELOCITY: 1 << 3,
    CUSTOM: 1 << 4,
} as const

/**
 * @zh 增量状态（只包含变化的字段）
 * @en Delta state (only contains changed fields)
 */
export interface EntityDeltaState {
    /**
     * @zh 网络标识
     * @en Network identity
     */
    netId: number

    /**
     * @zh 变化标志
     * @en Change flags
     */
    flags: number

    /**
     * @zh 位置（如果变化）
     * @en Position (if changed)
     */
    pos?: { x: number; y: number }

    /**
     * @zh 旋转（如果变化）
     * @en Rotation (if changed)
     */
    rot?: number

    /**
     * @zh 速度（如果变化）
     * @en Velocity (if changed)
     */
    vel?: { x: number; y: number }

    /**
     * @zh 角速度（如果变化）
     * @en Angular velocity (if changed)
     */
    angVel?: number

    /**
     * @zh 自定义数据（如果变化）
     * @en Custom data (if changed)
     */
    custom?: Record<string, unknown>
}

/**
 * @zh 增量同步数据
 * @en Delta sync data
 */
export interface DeltaSyncData {
    /**
     * @zh 帧号
     * @en Frame number
     */
    frame: number

    /**
     * @zh 时间戳
     * @en Timestamp
     */
    timestamp: number

    /**
     * @zh 已确认的输入序列号
     * @en Acknowledged input sequence
     */
    ackSeq?: number

    /**
     * @zh 增量实体状态
     * @en Delta entity states
     */
    entities: EntityDeltaState[]

    /**
     * @zh 是否为完整快照
     * @en Whether this is a full snapshot
     */
    isFullSnapshot?: boolean
}

/**
 * @zh 增量压缩配置
 * @en Delta compression configuration
 */
export interface DeltaCompressionConfig {
    /**
     * @zh 位置变化阈值
     * @en Position change threshold
     */
    positionThreshold: number

    /**
     * @zh 旋转变化阈值（弧度）
     * @en Rotation change threshold (radians)
     */
    rotationThreshold: number

    /**
     * @zh 速度变化阈值
     * @en Velocity change threshold
     */
    velocityThreshold: number

    /**
     * @zh 强制完整快照间隔（帧数）
     * @en Forced full snapshot interval (frames)
     */
    fullSnapshotInterval: number
}

const DEFAULT_CONFIG: DeltaCompressionConfig = {
    positionThreshold: 0.01,
    rotationThreshold: 0.001,
    velocityThreshold: 0.1,
    fullSnapshotInterval: 60,
}

// =============================================================================
// StateDeltaCompressor | 状态增量压缩器
// =============================================================================

/**
 * @zh 状态增量压缩器
 * @en State delta compressor
 *
 * @zh 追踪实体状态变化，生成增量更新
 * @en Tracks entity state changes and generates delta updates
 */
export class StateDeltaCompressor {
    private readonly _config: DeltaCompressionConfig
    private readonly _lastStates: Map<number, EntitySyncState> = new Map()
    private _frameCounter: number = 0

    constructor(config?: Partial<DeltaCompressionConfig>) {
        this._config = { ...DEFAULT_CONFIG, ...config }
    }

    /**
     * @zh 获取配置
     * @en Get configuration
     */
    get config(): Readonly<DeltaCompressionConfig> {
        return this._config
    }

    /**
     * @zh 压缩同步数据为增量格式
     * @en Compress sync data to delta format
     */
    compress(data: SyncData): DeltaSyncData {
        this._frameCounter++

        const isFullSnapshot = this._frameCounter % this._config.fullSnapshotInterval === 0
        const deltaEntities: EntityDeltaState[] = []

        for (const entity of data.entities) {
            const lastState = this._lastStates.get(entity.netId)

            if (isFullSnapshot || !lastState) {
                // Send full state
                deltaEntities.push(this._createFullDelta(entity))
            } else {
                // Calculate delta
                const delta = this._calculateDelta(lastState, entity)
                if (delta) {
                    deltaEntities.push(delta)
                }
            }

            // Update last state
            this._lastStates.set(entity.netId, { ...entity })
        }

        return {
            frame: data.frame,
            timestamp: data.timestamp,
            ackSeq: data.ackSeq,
            entities: deltaEntities,
            isFullSnapshot,
        }
    }

    /**
     * @zh 解压增量数据为完整同步数据
     * @en Decompress delta data to full sync data
     */
    decompress(data: DeltaSyncData): SyncData {
        const entities: EntitySyncState[] = []

        for (const delta of data.entities) {
            const lastState = this._lastStates.get(delta.netId)
            const fullState = this._applyDelta(lastState, delta)
            entities.push(fullState)

            // Update last state
            this._lastStates.set(delta.netId, fullState)
        }

        return {
            frame: data.frame,
            timestamp: data.timestamp,
            ackSeq: data.ackSeq,
            entities,
        }
    }

    /**
     * @zh 移除实体状态
     * @en Remove entity state
     */
    removeEntity(netId: number): void {
        this._lastStates.delete(netId)
    }

    /**
     * @zh 清除所有状态
     * @en Clear all states
     */
    clear(): void {
        this._lastStates.clear()
        this._frameCounter = 0
    }

    /**
     * @zh 强制下一次发送完整快照
     * @en Force next send to be a full snapshot
     */
    forceFullSnapshot(): void {
        this._frameCounter = this._config.fullSnapshotInterval - 1
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    private _createFullDelta(entity: EntitySyncState): EntityDeltaState {
        let flags = 0

        if (entity.pos) flags |= DeltaFlags.POSITION
        if (entity.rot !== undefined) flags |= DeltaFlags.ROTATION
        if (entity.vel) flags |= DeltaFlags.VELOCITY
        if (entity.angVel !== undefined) flags |= DeltaFlags.ANGULAR_VELOCITY
        if (entity.custom) flags |= DeltaFlags.CUSTOM

        return {
            netId: entity.netId,
            flags,
            pos: entity.pos,
            rot: entity.rot,
            vel: entity.vel,
            angVel: entity.angVel,
            custom: entity.custom,
        }
    }

    private _calculateDelta(
        lastState: EntitySyncState,
        currentState: EntitySyncState
    ): EntityDeltaState | null {
        let flags = 0
        const delta: EntityDeltaState = {
            netId: currentState.netId,
            flags: 0,
        }

        // Check position change
        if (currentState.pos) {
            const posChanged = !lastState.pos ||
                Math.abs(currentState.pos.x - lastState.pos.x) > this._config.positionThreshold ||
                Math.abs(currentState.pos.y - lastState.pos.y) > this._config.positionThreshold

            if (posChanged) {
                flags |= DeltaFlags.POSITION
                delta.pos = currentState.pos
            }
        }

        // Check rotation change
        if (currentState.rot !== undefined) {
            const rotChanged = lastState.rot === undefined ||
                Math.abs(currentState.rot - lastState.rot) > this._config.rotationThreshold

            if (rotChanged) {
                flags |= DeltaFlags.ROTATION
                delta.rot = currentState.rot
            }
        }

        // Check velocity change
        if (currentState.vel) {
            const velChanged = !lastState.vel ||
                Math.abs(currentState.vel.x - lastState.vel.x) > this._config.velocityThreshold ||
                Math.abs(currentState.vel.y - lastState.vel.y) > this._config.velocityThreshold

            if (velChanged) {
                flags |= DeltaFlags.VELOCITY
                delta.vel = currentState.vel
            }
        }

        // Check angular velocity change
        if (currentState.angVel !== undefined) {
            const angVelChanged = lastState.angVel === undefined ||
                Math.abs(currentState.angVel - lastState.angVel) > this._config.velocityThreshold

            if (angVelChanged) {
                flags |= DeltaFlags.ANGULAR_VELOCITY
                delta.angVel = currentState.angVel
            }
        }

        // Check custom data change (simple reference comparison)
        if (currentState.custom) {
            const customChanged = !this._customDataEqual(lastState.custom, currentState.custom)

            if (customChanged) {
                flags |= DeltaFlags.CUSTOM
                delta.custom = currentState.custom
            }
        }

        // Return null if no changes
        if (flags === 0) {
            return null
        }

        delta.flags = flags
        return delta
    }

    private _applyDelta(
        lastState: EntitySyncState | undefined,
        delta: EntityDeltaState
    ): EntitySyncState {
        const state: EntitySyncState = {
            netId: delta.netId,
        }

        // Apply position
        if (delta.flags & DeltaFlags.POSITION) {
            state.pos = delta.pos
        } else if (lastState?.pos) {
            state.pos = lastState.pos
        }

        // Apply rotation
        if (delta.flags & DeltaFlags.ROTATION) {
            state.rot = delta.rot
        } else if (lastState?.rot !== undefined) {
            state.rot = lastState.rot
        }

        // Apply velocity
        if (delta.flags & DeltaFlags.VELOCITY) {
            state.vel = delta.vel
        } else if (lastState?.vel) {
            state.vel = lastState.vel
        }

        // Apply angular velocity
        if (delta.flags & DeltaFlags.ANGULAR_VELOCITY) {
            state.angVel = delta.angVel
        } else if (lastState?.angVel !== undefined) {
            state.angVel = lastState.angVel
        }

        // Apply custom data
        if (delta.flags & DeltaFlags.CUSTOM) {
            state.custom = delta.custom
        } else if (lastState?.custom) {
            state.custom = lastState.custom
        }

        return state
    }

    private _customDataEqual(
        a: Record<string, unknown> | undefined,
        b: Record<string, unknown> | undefined
    ): boolean {
        if (a === b) return true
        if (!a || !b) return false

        const keysA = Object.keys(a)
        const keysB = Object.keys(b)

        if (keysA.length !== keysB.length) return false

        for (const key of keysA) {
            if (a[key] !== b[key]) return false
        }

        return true
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建状态增量压缩器
 * @en Create state delta compressor
 */
export function createStateDeltaCompressor(
    config?: Partial<DeltaCompressionConfig>
): StateDeltaCompressor {
    return new StateDeltaCompressor(config)
}
