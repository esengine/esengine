/**
 * @zh 数据库驱动核心类型定义
 * @en Database driver core type definitions
 */

// =============================================================================
// 连接状态 | Connection State
// =============================================================================

/**
 * @zh 连接状态
 * @en Connection state
 */
export type ConnectionState =
    | 'disconnected'  // 未连接 | Not connected
    | 'connecting'    // 连接中 | Connecting
    | 'connected'     // 已连接 | Connected
    | 'disconnecting' // 断开中 | Disconnecting
    | 'error'         // 错误 | Error

// =============================================================================
// 基础连接接口 | Base Connection Interface
// =============================================================================

/**
 * @zh 数据库连接基础接口
 * @en Base database connection interface
 */
export interface IConnection {
    /**
     * @zh 连接唯一标识
     * @en Connection unique identifier
     */
    readonly id: string

    /**
     * @zh 当前连接状态
     * @en Current connection state
     */
    readonly state: ConnectionState

    /**
     * @zh 建立连接
     * @en Establish connection
     */
    connect(): Promise<void>

    /**
     * @zh 断开连接
     * @en Disconnect
     */
    disconnect(): Promise<void>

    /**
     * @zh 检查是否已连接
     * @en Check if connected
     */
    isConnected(): boolean

    /**
     * @zh 健康检查
     * @en Health check
     */
    ping(): Promise<boolean>
}

// =============================================================================
// 连接事件 | Connection Events
// =============================================================================

/**
 * @zh 连接事件类型
 * @en Connection event types
 */
export type ConnectionEventType =
    | 'connected'
    | 'disconnected'
    | 'error'
    | 'reconnecting'
    | 'reconnected'

/**
 * @zh 连接事件监听器
 * @en Connection event listener
 */
export type ConnectionEventListener = (event: ConnectionEvent) => void

/**
 * @zh 连接事件
 * @en Connection event
 */
export interface ConnectionEvent {
    /**
     * @zh 事件类型
     * @en Event type
     */
    type: ConnectionEventType

    /**
     * @zh 连接 ID
     * @en Connection ID
     */
    connectionId: string

    /**
     * @zh 时间戳
     * @en Timestamp
     */
    timestamp: number

    /**
     * @zh 错误信息（如果有）
     * @en Error message (if any)
     */
    error?: Error
}

/**
 * @zh 可监听事件的连接接口
 * @en Connection interface with event support
 */
export interface IEventableConnection extends IConnection {
    /**
     * @zh 添加事件监听
     * @en Add event listener
     */
    on(event: ConnectionEventType, listener: ConnectionEventListener): void

    /**
     * @zh 移除事件监听
     * @en Remove event listener
     */
    off(event: ConnectionEventType, listener: ConnectionEventListener): void

    /**
     * @zh 一次性事件监听
     * @en One-time event listener
     */
    once(event: ConnectionEventType, listener: ConnectionEventListener): void
}

// =============================================================================
// 连接池配置 | Connection Pool Configuration
// =============================================================================

/**
 * @zh 连接池配置
 * @en Connection pool configuration
 */
export interface PoolConfig {
    /**
     * @zh 最小连接数
     * @en Minimum connections
     */
    minSize?: number

    /**
     * @zh 最大连接数
     * @en Maximum connections
     */
    maxSize?: number

    /**
     * @zh 获取连接超时时间（毫秒）
     * @en Acquire connection timeout in milliseconds
     */
    acquireTimeout?: number

    /**
     * @zh 空闲连接超时时间（毫秒）
     * @en Idle connection timeout in milliseconds
     */
    idleTimeout?: number

    /**
     * @zh 连接最大生存时间（毫秒）
     * @en Maximum connection lifetime in milliseconds
     */
    maxLifetime?: number
}

// =============================================================================
// 数据库特定配置 | Database Specific Configuration
// =============================================================================

/**
 * @zh MongoDB 连接配置
 * @en MongoDB connection configuration
 */
export interface MongoConnectionConfig {
    /**
     * @zh 连接字符串
     * @en Connection string
     *
     * @example "mongodb://localhost:27017"
     * @example "mongodb+srv://user:pass@cluster.mongodb.net"
     */
    uri: string

    /**
     * @zh 数据库名称
     * @en Database name
     */
    database: string

    /**
     * @zh 连接池配置
     * @en Pool configuration
     */
    pool?: PoolConfig

    /**
     * @zh 自动重连
     * @en Auto reconnect
     */
    autoReconnect?: boolean

    /**
     * @zh 重连间隔（毫秒）
     * @en Reconnect interval in milliseconds
     */
    reconnectInterval?: number

    /**
     * @zh 最大重连次数
     * @en Maximum reconnect attempts
     */
    maxReconnectAttempts?: number
}

/**
 * @zh Redis 连接配置
 * @en Redis connection configuration
 */
export interface RedisConnectionConfig {
    /**
     * @zh 主机地址
     * @en Host address
     */
    host?: string

    /**
     * @zh 端口
     * @en Port
     */
    port?: number

    /**
     * @zh 密码
     * @en Password
     */
    password?: string

    /**
     * @zh 数据库索引
     * @en Database index
     */
    db?: number

    /**
     * @zh 连接字符串（优先于其他配置）
     * @en Connection URL (takes precedence over other options)
     */
    url?: string

    /**
     * @zh 键前缀
     * @en Key prefix
     */
    keyPrefix?: string

    /**
     * @zh 自动重连
     * @en Auto reconnect
     */
    autoReconnect?: boolean
}

// =============================================================================
// 错误类型 | Error Types
// =============================================================================

/**
 * @zh 数据库错误代码
 * @en Database error codes
 */
export type DatabaseErrorCode =
    | 'CONNECTION_FAILED'
    | 'CONNECTION_TIMEOUT'
    | 'CONNECTION_CLOSED'
    | 'AUTHENTICATION_FAILED'
    | 'POOL_EXHAUSTED'
    | 'QUERY_FAILED'
    | 'DUPLICATE_KEY'
    | 'NOT_FOUND'
    | 'VALIDATION_ERROR'
    | 'UNKNOWN'

/**
 * @zh 数据库错误
 * @en Database error
 */
export class DatabaseError extends Error {
    constructor(
        message: string,
        public readonly code: DatabaseErrorCode,
        public readonly cause?: Error
    ) {
        super(message)
        this.name = 'DatabaseError'
    }
}

/**
 * @zh 连接错误
 * @en Connection error
 */
export class ConnectionError extends DatabaseError {
    constructor(message: string, code: DatabaseErrorCode = 'CONNECTION_FAILED', cause?: Error) {
        super(message, code, cause)
        this.name = 'ConnectionError'
    }
}

/**
 * @zh 重复键错误
 * @en Duplicate key error
 */
export class DuplicateKeyError extends DatabaseError {
    constructor(
        message: string,
        public readonly key: string,
        cause?: Error
    ) {
        super(message, 'DUPLICATE_KEY', cause)
        this.name = 'DuplicateKeyError'
    }
}
