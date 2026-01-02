/**
 * @zh 分布式房间支持类型定义
 * @en Distributed room support type definitions
 */

// =============================================================================
// 服务器注册 | Server Registration
// =============================================================================

/**
 * @zh 服务器状态
 * @en Server status
 */
export type ServerStatus = 'online' | 'draining' | 'offline';

/**
 * @zh 服务器注册信息
 * @en Server registration info
 */
export interface ServerRegistration {
    /**
     * @zh 服务器唯一标识
     * @en Server unique identifier
     */
    serverId: string;

    /**
     * @zh 服务器地址（供客户端连接）
     * @en Server address (for client connection)
     */
    address: string;

    /**
     * @zh 服务器端口
     * @en Server port
     */
    port: number;

    /**
     * @zh 当前房间数量
     * @en Current room count
     */
    roomCount: number;

    /**
     * @zh 当前玩家数量
     * @en Current player count
     */
    playerCount: number;

    /**
     * @zh 服务器容量（最大房间数）
     * @en Server capacity (max rooms)
     */
    capacity: number;

    /**
     * @zh 服务器状态
     * @en Server status
     */
    status: ServerStatus;

    /**
     * @zh 最后心跳时间戳
     * @en Last heartbeat timestamp
     */
    lastHeartbeat: number;

    /**
     * @zh 服务器元数据
     * @en Server metadata
     */
    metadata?: Record<string, unknown>;
}

// =============================================================================
// 房间注册 | Room Registration
// =============================================================================

/**
 * @zh 房间注册信息
 * @en Room registration info
 */
export interface RoomRegistration {
    /**
     * @zh 房间唯一标识
     * @en Room unique identifier
     */
    roomId: string;

    /**
     * @zh 房间类型名称
     * @en Room type name
     */
    roomType: string;

    /**
     * @zh 所在服务器 ID
     * @en Host server ID
     */
    serverId: string;

    /**
     * @zh 服务器地址
     * @en Server address
     */
    serverAddress: string;

    /**
     * @zh 当前玩家数量
     * @en Current player count
     */
    playerCount: number;

    /**
     * @zh 最大玩家数量
     * @en Max player count
     */
    maxPlayers: number;

    /**
     * @zh 房间是否已锁定
     * @en Whether room is locked
     */
    isLocked: boolean;

    /**
     * @zh 房间元数据（标签、自定义属性等）
     * @en Room metadata (tags, custom properties, etc.)
     */
    metadata: Record<string, unknown>;

    /**
     * @zh 创建时间戳
     * @en Creation timestamp
     */
    createdAt: number;

    /**
     * @zh 更新时间戳
     * @en Update timestamp
     */
    updatedAt: number;
}

/**
 * @zh 房间查询条件
 * @en Room query criteria
 */
export interface RoomQuery {
    /**
     * @zh 房间类型
     * @en Room type
     */
    roomType?: string;

    /**
     * @zh 服务器 ID（查询特定服务器上的房间）
     * @en Server ID (query rooms on specific server)
     */
    serverId?: string;

    /**
     * @zh 是否有空位
     * @en Whether has available space
     */
    hasSpace?: boolean;

    /**
     * @zh 是否未锁定
     * @en Whether not locked
     */
    notLocked?: boolean;

    /**
     * @zh 元数据过滤
     * @en Metadata filter
     */
    metadata?: Record<string, unknown>;

    /**
     * @zh 返回数量限制
     * @en Result limit
     */
    limit?: number;

    /**
     * @zh 偏移量（分页）
     * @en Offset (pagination)
     */
    offset?: number;
}

// =============================================================================
// 房间状态快照 | Room State Snapshot
// =============================================================================

/**
 * @zh 玩家快照
 * @en Player snapshot
 */
export interface PlayerSnapshot {
    /**
     * @zh 玩家 ID
     * @en Player ID
     */
    id: string;

    /**
     * @zh 玩家数据
     * @en Player data
     */
    data: Record<string, unknown>;
}

/**
 * @zh 房间状态快照
 * @en Room state snapshot
 */
export interface RoomSnapshot<TState = unknown> {
    /**
     * @zh 房间 ID
     * @en Room ID
     */
    roomId: string;

    /**
     * @zh 房间类型
     * @en Room type
     */
    roomType: string;

    /**
     * @zh 房间状态
     * @en Room state
     */
    state: TState;

    /**
     * @zh 玩家列表
     * @en Player list
     */
    players: PlayerSnapshot[];

    /**
     * @zh 快照版本号
     * @en Snapshot version
     */
    version: number;

    /**
     * @zh 快照时间戳
     * @en Snapshot timestamp
     */
    timestamp: number;
}

// =============================================================================
// 分布式事件 | Distributed Events
// =============================================================================

/**
 * @zh 分布式事件类型
 * @en Distributed event types
 */
export type DistributedEventType =
    | 'room:created'
    | 'room:disposed'
    | 'room:updated'
    | 'room:locked'
    | 'room:unlocked'
    | 'room:message'
    | 'room:migrated'
    | 'player:joined'
    | 'player:left'
    | 'server:online'
    | 'server:offline'
    | 'server:draining';

/**
 * @zh 分布式事件
 * @en Distributed event
 */
export interface DistributedEvent<T = unknown> {
    /**
     * @zh 事件类型
     * @en Event type
     */
    type: DistributedEventType;

    /**
     * @zh 发送方服务器 ID
     * @en Sender server ID
     */
    serverId: string;

    /**
     * @zh 相关房间 ID（可选）
     * @en Related room ID (optional)
     */
    roomId?: string;

    /**
     * @zh 事件载荷
     * @en Event payload
     */
    payload: T;

    /**
     * @zh 事件时间戳
     * @en Event timestamp
     */
    timestamp: number;
}

/**
 * @zh 事件处理器
 * @en Event handler
 */
export type DistributedEventHandler<T = unknown> = (event: DistributedEvent<T>) => void;

/**
 * @zh 取消订阅函数
 * @en Unsubscribe function
 */
export type Unsubscribe = () => void;

// =============================================================================
// 分布式配置 | Distributed Configuration
// =============================================================================

/**
 * @zh 分布式房间管理器配置
 * @en Distributed room manager configuration
 */
export interface DistributedRoomManagerConfig {
    /**
     * @zh 服务器 ID（唯一标识）
     * @en Server ID (unique identifier)
     */
    serverId: string;

    /**
     * @zh 服务器公开地址（供客户端连接）
     * @en Server public address (for client connection)
     */
    serverAddress: string;

    /**
     * @zh 服务器端口
     * @en Server port
     */
    serverPort: number;

    /**
     * @zh 心跳间隔（毫秒）
     * @en Heartbeat interval (ms)
     * @default 5000
     */
    heartbeatInterval?: number;

    /**
     * @zh 状态快照间隔（毫秒），0 = 禁用
     * @en State snapshot interval (ms), 0 = disabled
     * @default 30000
     */
    snapshotInterval?: number;

    /**
     * @zh 房间迁移超时（毫秒）
     * @en Room migration timeout (ms)
     * @default 10000
     */
    migrationTimeout?: number;

    /**
     * @zh 是否启用自动故障转移
     * @en Whether to enable automatic failover
     * @default true
     */
    enableFailover?: boolean;

    /**
     * @zh 服务器容量（最大房间数）
     * @en Server capacity (max rooms)
     * @default 100
     */
    capacity?: number;

    /**
     * @zh 服务器元数据
     * @en Server metadata
     */
    metadata?: Record<string, unknown>;
}

/**
 * @zh 服务器分布式配置（用于 createServer）
 * @en Server distributed configuration (for createServer)
 */
export interface DistributedConfig extends Omit<DistributedRoomManagerConfig, 'serverPort'> {
    /**
     * @zh 是否启用分布式模式
     * @en Whether to enable distributed mode
     * @default false
     */
    enabled: boolean;

    /**
     * @zh 分布式适配器（可选，默认使用 MemoryAdapter）
     * @en Distributed adapter (optional, defaults to MemoryAdapter)
     */
    adapter?: import('./adapters/IDistributedAdapter.js').IDistributedAdapter;

    /**
     * @zh 服务器端口（可选，默认使用服务器配置的端口）
     * @en Server port (optional, defaults to server config port)
     */
    serverPort?: number;
}

// =============================================================================
// 路由 | Routing
// =============================================================================

/**
 * @zh 路由结果类型
 * @en Routing result type
 */
export type RoutingResultType = 'local' | 'redirect' | 'create' | 'unavailable';

/**
 * @zh 路由结果
 * @en Routing result
 */
export interface RoutingResult {
    /**
     * @zh 路由类型
     * @en Routing type
     */
    type: RoutingResultType;

    /**
     * @zh 目标服务器地址（redirect 时）
     * @en Target server address (for redirect)
     */
    serverAddress?: string;

    /**
     * @zh 目标房间 ID
     * @en Target room ID
     */
    roomId?: string;

    /**
     * @zh 错误信息（unavailable 时）
     * @en Error message (for unavailable)
     */
    reason?: string;
}

/**
 * @zh 路由请求
 * @en Routing request
 */
export interface RoutingRequest {
    /**
     * @zh 玩家 ID
     * @en Player ID
     */
    playerId: string;

    /**
     * @zh 房间类型（joinOrCreate 时）
     * @en Room type (for joinOrCreate)
     */
    roomType?: string;

    /**
     * @zh 房间 ID（joinById 时）
     * @en Room ID (for joinById)
     */
    roomId?: string;

    /**
     * @zh 首选服务器 ID
     * @en Preferred server ID
     */
    preferredServerId?: string;

    /**
     * @zh 房间查询条件
     * @en Room query criteria
     */
    query?: RoomQuery;
}
