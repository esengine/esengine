/**
 * @zh RPC 核心类型定义
 * @en RPC Core Type Definitions
 */

// ============ Protocol Types ============

/**
 * @zh API 定义标记
 * @en API definition marker
 */
export interface ApiDef<TInput = unknown, TOutput = unknown> {
    readonly _type: 'api'
    readonly _input: TInput
    readonly _output: TOutput
}

/**
 * @zh 消息定义标记
 * @en Message definition marker
 */
export interface MsgDef<TData = unknown> {
    readonly _type: 'msg'
    readonly _data: TData
}

/**
 * @zh 协议定义
 * @en Protocol definition
 */
export interface ProtocolDef {
    readonly api: Record<string, ApiDef<any, any>>
    readonly msg: Record<string, MsgDef<any>>
}

// ============ Type Inference ============

/**
 * @zh 提取 API 输入类型
 * @en Extract API input type
 */
export type ApiInput<T> = T extends ApiDef<infer I, any> ? I : never

/**
 * @zh 提取 API 输出类型
 * @en Extract API output type
 */
export type ApiOutput<T> = T extends ApiDef<any, infer O> ? O : never

/**
 * @zh 提取消息数据类型
 * @en Extract message data type
 */
export type MsgData<T> = T extends MsgDef<infer D> ? D : never

/**
 * @zh 提取协议中所有 API 名称
 * @en Extract all API names from protocol
 */
export type ApiNames<P extends ProtocolDef> = keyof P['api'] & string

/**
 * @zh 提取协议中所有消息名称
 * @en Extract all message names from protocol
 */
export type MsgNames<P extends ProtocolDef> = keyof P['msg'] & string

// ============ Connection Types ============

/**
 * @zh 连接状态
 * @en Connection status
 */
export type ConnectionStatus = 'connecting' | 'open' | 'closing' | 'closed'

/**
 * @zh 连接接口
 * @en Connection interface
 */
export interface Connection<TData = unknown> {
    /**
     * @zh 连接唯一标识
     * @en Connection unique identifier
     */
    readonly id: string

    /**
     * @zh 客户端 IP 地址
     * @en Client IP address
     */
    readonly ip: string

    /**
     * @zh 连接状态
     * @en Connection status
     */
    readonly status: ConnectionStatus

    /**
     * @zh 用户自定义数据
     * @en User-defined data
     */
    data: TData

    /**
     * @zh 关闭连接
     * @en Close connection
     */
    close(reason?: string): void
}

// ============ Packet Types ============

/**
 * @zh 数据包类型
 * @en Packet types
 */
export const PacketType = {
    ApiRequest: 0,
    ApiResponse: 1,
    ApiError: 2,
    Message: 3,
    Heartbeat: 9,
} as const

export type PacketType = typeof PacketType[keyof typeof PacketType]

/**
 * @zh API 请求包
 * @en API request packet
 */
export type ApiRequestPacket = [
    type: typeof PacketType.ApiRequest,
    id: number,
    path: string,
    data: unknown
]

/**
 * @zh API 响应包（成功）
 * @en API response packet (success)
 */
export type ApiResponsePacket = [
    type: typeof PacketType.ApiResponse,
    id: number,
    data: unknown
]

/**
 * @zh API 错误包
 * @en API error packet
 */
export type ApiErrorPacket = [
    type: typeof PacketType.ApiError,
    id: number,
    code: string,
    message: string
]

/**
 * @zh 消息包
 * @en Message packet
 */
export type MessagePacket = [
    type: typeof PacketType.Message,
    path: string,
    data: unknown
]

/**
 * @zh 心跳包
 * @en Heartbeat packet
 */
export type HeartbeatPacket = [type: typeof PacketType.Heartbeat]

/**
 * @zh 所有数据包类型
 * @en All packet types
 */
export type Packet =
    | ApiRequestPacket
    | ApiResponsePacket
    | ApiErrorPacket
    | MessagePacket
    | HeartbeatPacket

// ============ Error Types ============

/**
 * @zh RPC 错误
 * @en RPC Error
 */
export class RpcError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly details?: unknown
    ) {
        super(message)
        this.name = 'RpcError'
    }
}

/**
 * @zh 预定义错误码
 * @en Predefined error codes
 */
export const ErrorCode = {
    INVALID_REQUEST: 'INVALID_REQUEST',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    TIMEOUT: 'TIMEOUT',
    CONNECTION_CLOSED: 'CONNECTION_CLOSED',
} as const

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode]
