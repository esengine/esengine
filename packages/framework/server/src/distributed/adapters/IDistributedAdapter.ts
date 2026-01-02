/**
 * @zh 分布式适配器接口
 * @en Distributed adapter interface
 *
 * @zh 定义分布式房间系统的存储和通信层抽象
 * @en Defines the storage and communication layer abstraction for distributed room system
 */

import type {
    ServerRegistration,
    RoomRegistration,
    RoomQuery,
    RoomSnapshot,
    DistributedEvent,
    DistributedEventType,
    DistributedEventHandler,
    Unsubscribe
} from '../types.js';

/**
 * @zh 分布式适配器接口
 * @en Distributed adapter interface
 *
 * @zh 所有分布式后端（Redis、消息队列等）都需要实现此接口
 * @en All distributed backends (Redis, message queue, etc.) must implement this interface
 */
export interface IDistributedAdapter {
    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    /**
     * @zh 连接到分布式后端
     * @en Connect to distributed backend
     */
    connect(): Promise<void>;

    /**
     * @zh 断开连接
     * @en Disconnect from backend
     */
    disconnect(): Promise<void>;

    /**
     * @zh 检查是否已连接
     * @en Check if connected
     */
    isConnected(): boolean;

    // =========================================================================
    // 服务器注册 | Server Registry
    // =========================================================================

    /**
     * @zh 注册服务器
     * @en Register server
     *
     * @param server - 服务器注册信息 | Server registration info
     */
    registerServer(server: ServerRegistration): Promise<void>;

    /**
     * @zh 注销服务器
     * @en Unregister server
     *
     * @param serverId - 服务器 ID | Server ID
     */
    unregisterServer(serverId: string): Promise<void>;

    /**
     * @zh 更新服务器心跳
     * @en Update server heartbeat
     *
     * @param serverId - 服务器 ID | Server ID
     */
    heartbeat(serverId: string): Promise<void>;

    /**
     * @zh 获取所有在线服务器
     * @en Get all online servers
     */
    getServers(): Promise<ServerRegistration[]>;

    /**
     * @zh 获取指定服务器
     * @en Get specific server
     *
     * @param serverId - 服务器 ID | Server ID
     */
    getServer(serverId: string): Promise<ServerRegistration | null>;

    /**
     * @zh 更新服务器信息
     * @en Update server info
     *
     * @param serverId - 服务器 ID | Server ID
     * @param updates - 更新内容 | Updates
     */
    updateServer(serverId: string, updates: Partial<ServerRegistration>): Promise<void>;

    // =========================================================================
    // 房间注册 | Room Registry
    // =========================================================================

    /**
     * @zh 注册房间
     * @en Register room
     *
     * @param room - 房间注册信息 | Room registration info
     */
    registerRoom(room: RoomRegistration): Promise<void>;

    /**
     * @zh 注销房间
     * @en Unregister room
     *
     * @param roomId - 房间 ID | Room ID
     */
    unregisterRoom(roomId: string): Promise<void>;

    /**
     * @zh 更新房间信息
     * @en Update room info
     *
     * @param roomId - 房间 ID | Room ID
     * @param updates - 更新内容 | Updates
     */
    updateRoom(roomId: string, updates: Partial<RoomRegistration>): Promise<void>;

    /**
     * @zh 获取房间信息
     * @en Get room info
     *
     * @param roomId - 房间 ID | Room ID
     */
    getRoom(roomId: string): Promise<RoomRegistration | null>;

    /**
     * @zh 查询房间列表
     * @en Query room list
     *
     * @param query - 查询条件 | Query criteria
     */
    queryRooms(query: RoomQuery): Promise<RoomRegistration[]>;

    /**
     * @zh 获取指定类型的可用房间（用于 joinOrCreate）
     * @en Get available room of type (for joinOrCreate)
     *
     * @param roomType - 房间类型 | Room type
     */
    findAvailableRoom(roomType: string): Promise<RoomRegistration | null>;

    /**
     * @zh 获取服务器的所有房间
     * @en Get all rooms of a server
     *
     * @param serverId - 服务器 ID | Server ID
     */
    getRoomsByServer(serverId: string): Promise<RoomRegistration[]>;

    // =========================================================================
    // 房间状态 | Room State
    // =========================================================================

    /**
     * @zh 保存房间状态快照
     * @en Save room state snapshot
     *
     * @param snapshot - 状态快照 | State snapshot
     */
    saveSnapshot(snapshot: RoomSnapshot): Promise<void>;

    /**
     * @zh 加载房间状态快照
     * @en Load room state snapshot
     *
     * @param roomId - 房间 ID | Room ID
     */
    loadSnapshot(roomId: string): Promise<RoomSnapshot | null>;

    /**
     * @zh 删除房间状态
     * @en Delete room state
     *
     * @param roomId - 房间 ID | Room ID
     */
    deleteSnapshot(roomId: string): Promise<void>;

    // =========================================================================
    // 发布/订阅 | Pub/Sub
    // =========================================================================

    /**
     * @zh 发布事件
     * @en Publish event
     *
     * @param event - 分布式事件 | Distributed event
     */
    publish(event: DistributedEvent): Promise<void>;

    /**
     * @zh 订阅事件
     * @en Subscribe to events
     *
     * @param pattern - 事件类型模式（支持 '*' 通配符） | Event type pattern (supports '*' wildcard)
     * @param handler - 事件处理器 | Event handler
     * @returns 取消订阅函数 | Unsubscribe function
     */
    subscribe(
        pattern: DistributedEventType | '*',
        handler: DistributedEventHandler
    ): Promise<Unsubscribe>;

    /**
     * @zh 向特定房间发送消息（跨服务器）
     * @en Send message to specific room (cross-server)
     *
     * @param roomId - 房间 ID | Room ID
     * @param messageType - 消息类型 | Message type
     * @param data - 消息数据 | Message data
     * @param playerId - 发送者玩家 ID（可选） | Sender player ID (optional)
     */
    sendToRoom(roomId: string, messageType: string, data: unknown, playerId?: string): Promise<void>;

    // =========================================================================
    // 分布式锁 | Distributed Lock
    // =========================================================================

    /**
     * @zh 获取分布式锁
     * @en Acquire distributed lock
     *
     * @param key - 锁的键名 | Lock key
     * @param ttlMs - 锁的生存时间（毫秒） | Lock TTL (ms)
     * @returns 是否成功获取锁 | Whether lock was acquired
     */
    acquireLock(key: string, ttlMs: number): Promise<boolean>;

    /**
     * @zh 释放分布式锁
     * @en Release distributed lock
     *
     * @param key - 锁的键名 | Lock key
     */
    releaseLock(key: string): Promise<void>;

    /**
     * @zh 扩展锁的生存时间
     * @en Extend lock TTL
     *
     * @param key - 锁的键名 | Lock key
     * @param ttlMs - 新的生存时间（毫秒） | New TTL (ms)
     * @returns 是否成功扩展 | Whether extension was successful
     */
    extendLock(key: string, ttlMs: number): Promise<boolean>;
}
