/**
 * @zh 游戏网络协议定义
 * @en Game Network Protocol Definition
 *
 * @zh 定义客户端与服务器之间的通信协议
 * @en Defines the communication protocol between client and server
 */

import { rpc } from '@esengine/rpc'

// ============================================================================
// Message Types | 消息类型
// ============================================================================

/**
 * @zh 玩家输入
 * @en Player input
 */
export interface PlayerInput {
    /**
     * @zh 输入序列号（用于客户端预测）
     * @en Input sequence number (for client prediction)
     */
    seq: number

    /**
     * @zh 帧序号
     * @en Frame number
     */
    frame: number

    /**
     * @zh 客户端时间戳
     * @en Client timestamp
     */
    timestamp: number

    /**
     * @zh 移动方向
     * @en Move direction
     */
    moveDir?: { x: number; y: number }

    /**
     * @zh 动作列表
     * @en Action list
     */
    actions?: string[]
}

/**
 * @zh 实体同步状态
 * @en Entity sync state
 */
export interface EntitySyncState {
    /**
     * @zh 网络实体 ID
     * @en Network entity ID
     */
    netId: number

    /**
     * @zh 位置
     * @en Position
     */
    pos?: { x: number; y: number }

    /**
     * @zh 旋转角度
     * @en Rotation angle
     */
    rot?: number

    /**
     * @zh 速度（用于外推）
     * @en Velocity (for extrapolation)
     */
    vel?: { x: number; y: number }

    /**
     * @zh 角速度
     * @en Angular velocity
     */
    angVel?: number

    /**
     * @zh 自定义数据
     * @en Custom data
     */
    custom?: Record<string, unknown>
}

/**
 * @zh 同步消息
 * @en Sync message
 */
export interface SyncData {
    /**
     * @zh 服务器帧号
     * @en Server frame number
     */
    frame: number

    /**
     * @zh 服务器时间戳（用于插值）
     * @en Server timestamp (for interpolation)
     */
    timestamp: number

    /**
     * @zh 已确认的输入序列号（用于客户端预测校正）
     * @en Acknowledged input sequence (for client prediction reconciliation)
     */
    ackSeq?: number

    /**
     * @zh 实体状态列表
     * @en Entity state list
     */
    entities: EntitySyncState[]
}

/**
 * @zh 生成消息
 * @en Spawn message
 */
export interface SpawnData {
    netId: number
    ownerId: number
    prefab: string
    pos: { x: number; y: number }
    rot?: number
}

/**
 * @zh 销毁消息
 * @en Despawn message
 */
export interface DespawnData {
    netId: number
}

/**
 * @zh 完整状态快照（用于重连）
 * @en Full state snapshot (for reconnection)
 */
export interface FullStateData {
    /**
     * @zh 服务器帧号
     * @en Server frame number
     */
    frame: number

    /**
     * @zh 服务器时间戳
     * @en Server timestamp
     */
    timestamp: number

    /**
     * @zh 所有实体状态
     * @en All entity states
     */
    entities: Array<SpawnData & { state?: EntitySyncState }>
}

// ============================================================================
// API Types | API 类型
// ============================================================================

/**
 * @zh 加入房间请求
 * @en Join room request
 */
export interface JoinRequest {
    playerName: string
    roomId?: string
}

/**
 * @zh 加入房间响应
 * @en Join room response
 */
export interface JoinResponse {
    playerId: number
    roomId: string
}

/**
 * @zh 重连请求
 * @en Reconnect request
 */
export interface ReconnectRequest {
    /**
     * @zh 之前的玩家 ID
     * @en Previous player ID
     */
    playerId: number

    /**
     * @zh 房间 ID
     * @en Room ID
     */
    roomId: string

    /**
     * @zh 重连令牌
     * @en Reconnection token
     */
    token: string
}

/**
 * @zh 重连响应
 * @en Reconnect response
 */
export interface ReconnectResponse {
    /**
     * @zh 是否成功
     * @en Whether successful
     */
    success: boolean

    /**
     * @zh 完整状态（成功时）
     * @en Full state (when successful)
     */
    state?: FullStateData

    /**
     * @zh 错误信息（失败时）
     * @en Error message (when failed)
     */
    error?: string
}

// ============================================================================
// Protocol Definition | 协议定义
// ============================================================================

/**
 * @zh 默认游戏网络协议
 * @en Default game network protocol
 *
 * @example
 * ```typescript
 * // 使用默认协议
 * const service = new NetworkService(gameProtocol)
 *
 * // 或者扩展协议
 * const customProtocol = rpc.define({
 *     api: {
 *         ...gameProtocol.api,
 *         customApi: rpc.api<CustomInput, CustomOutput>(),
 *     },
 *     msg: {
 *         ...gameProtocol.msg,
 *         customMsg: rpc.msg<CustomData>(),
 *     },
 * })
 * ```
 */
export const gameProtocol = rpc.define({
    api: {
        /**
         * @zh 加入房间
         * @en Join room
         */
        join: rpc.api<JoinRequest, JoinResponse>(),

        /**
         * @zh 离开房间
         * @en Leave room
         */
        leave: rpc.api<void, void>(),

        /**
         * @zh 重连
         * @en Reconnect
         */
        reconnect: rpc.api<ReconnectRequest, ReconnectResponse>(),
    },
    msg: {
        /**
         * @zh 玩家输入
         * @en Player input
         */
        input: rpc.msg<PlayerInput>(),

        /**
         * @zh 状态同步
         * @en State sync
         */
        sync: rpc.msg<SyncData>(),

        /**
         * @zh 实体生成
         * @en Entity spawn
         */
        spawn: rpc.msg<SpawnData>(),

        /**
         * @zh 实体销毁
         * @en Entity despawn
         */
        despawn: rpc.msg<DespawnData>(),

        /**
         * @zh 完整状态快照
         * @en Full state snapshot
         */
        fullState: rpc.msg<FullStateData>(),
    },
})

/**
 * @zh 游戏协议类型
 * @en Game protocol type
 */
export type GameProtocol = typeof gameProtocol
