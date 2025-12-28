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
     * @zh 帧序号
     * @en Frame number
     */
    frame: number

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
    netId: number
    pos?: { x: number; y: number }
    rot?: number
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
    },
})

/**
 * @zh 游戏协议类型
 * @en Game protocol type
 */
export type GameProtocol = typeof gameProtocol
