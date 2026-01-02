/**
 * @zh 分布式房间管理器
 * @en Distributed room manager
 *
 * @zh 继承 RoomManager，添加分布式功能支持。包括跨服务器房间注册、
 * 玩家路由、状态同步和故障转移。
 * @en Extends RoomManager with distributed features. Includes cross-server room
 * registration, player routing, state synchronization, and failover.
 */

import { RoomManager } from '../room/RoomManager.js';
import { Room, type RoomOptions } from '../room/Room.js';
import type { Player } from '../room/Player.js';
import type { IDistributedAdapter } from './adapters/IDistributedAdapter.js';
import type {
    DistributedRoomManagerConfig,
    RoomRegistration,
    RoutingResult,
    RoutingRequest,
    ServerRegistration,
    DistributedEvent,
    Unsubscribe
} from './types.js';
import { createLogger } from '../logger.js';

const logger = createLogger('DistributedRoom');

/**
 * @zh 分布式房间管理器配置（内部使用）
 * @en Distributed room manager configuration (internal use)
 */
interface InternalConfig extends Required<Omit<DistributedRoomManagerConfig, 'metadata'>> {
    metadata: Record<string, unknown>;
}

/**
 * @zh 分布式房间管理器
 * @en Distributed room manager
 *
 * @zh 扩展基础 RoomManager，添加以下功能：
 * - 服务器注册和心跳
 * - 跨服务器房间注册
 * - 玩家路由和重定向
 * - 状态快照和恢复
 * - 分布式锁防止竞态
 * @en Extends base RoomManager with:
 * - Server registration and heartbeat
 * - Cross-server room registration
 * - Player routing and redirection
 * - State snapshots and recovery
 * - Distributed locks to prevent race conditions
 */
export class DistributedRoomManager extends RoomManager {
    private readonly _adapter: IDistributedAdapter;
    private readonly _config: InternalConfig;
    private readonly _serverId: string;

    private _heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private _snapshotTimer: ReturnType<typeof setInterval> | null = null;
    private _subscriptions: Unsubscribe[] = [];
    private _isShuttingDown = false;

    /**
     * @zh 创建分布式房间管理器
     * @en Create distributed room manager
     *
     * @param adapter - 分布式适配器 | Distributed adapter
     * @param config - 配置 | Configuration
     * @param sendFn - 消息发送函数 | Message send function
     * @param sendBinaryFn - 二进制发送函数 | Binary send function
     */
    constructor(
        adapter: IDistributedAdapter,
        config: DistributedRoomManagerConfig,
        sendFn: (conn: any, type: string, data: unknown) => void,
        sendBinaryFn?: (conn: any, data: Uint8Array) => void
    ) {
        super(sendFn, sendBinaryFn);

        this._adapter = adapter;
        this._serverId = config.serverId;

        this._config = {
            serverId: config.serverId,
            serverAddress: config.serverAddress,
            serverPort: config.serverPort,
            heartbeatInterval: config.heartbeatInterval ?? 5000,
            snapshotInterval: config.snapshotInterval ?? 30000,
            migrationTimeout: config.migrationTimeout ?? 10000,
            enableFailover: config.enableFailover ?? true,
            capacity: config.capacity ?? 100,
            metadata: config.metadata ?? {}
        };
    }

    /**
     * @zh 获取服务器 ID
     * @en Get server ID
     */
    get serverId(): string {
        return this._serverId;
    }

    /**
     * @zh 获取分布式适配器
     * @en Get distributed adapter
     */
    get adapter(): IDistributedAdapter {
        return this._adapter;
    }

    /**
     * @zh 获取配置
     * @en Get configuration
     */
    get config(): Readonly<InternalConfig> {
        return this._config;
    }

    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    /**
     * @zh 启动分布式房间管理器
     * @en Start distributed room manager
     */
    async start(): Promise<void> {
        if (!this._adapter.isConnected()) {
            await this._adapter.connect();
        }

        // 注册服务器 | Register server
        await this._registerServer();

        // 订阅事件 | Subscribe to events
        await this._subscribeToEvents();

        // 启动心跳 | Start heartbeat
        this._startHeartbeat();

        // 启动快照（如果启用）| Start snapshots (if enabled)
        if (this._config.snapshotInterval > 0) {
            this._startSnapshotTimer();
        }

        logger.info(`Distributed room manager started: ${this._serverId}`);
    }

    /**
     * @zh 停止分布式房间管理器
     * @en Stop distributed room manager
     *
     * @param graceful - 是否优雅关闭（等待玩家退出）| Whether to gracefully shutdown (wait for players)
     */
    async stop(graceful = true): Promise<void> {
        this._isShuttingDown = true;

        // 停止定时器 | Stop timers
        if (this._heartbeatTimer) {
            clearInterval(this._heartbeatTimer);
            this._heartbeatTimer = null;
        }

        if (this._snapshotTimer) {
            clearInterval(this._snapshotTimer);
            this._snapshotTimer = null;
        }

        // 取消订阅 | Unsubscribe
        for (const unsub of this._subscriptions) {
            unsub();
        }
        this._subscriptions = [];

        if (graceful) {
            // 标记为 draining，停止接收新玩家 | Mark as draining, stop accepting new players
            await this._adapter.updateServer(this._serverId, { status: 'draining' });

            // 保存所有房间状态快照 | Save all room state snapshots
            await this._saveAllSnapshots();
        }

        // 注销服务器 | Unregister server
        await this._adapter.unregisterServer(this._serverId);

        logger.info(`Distributed room manager stopped: ${this._serverId}`);
    }

    // =========================================================================
    // 房间操作覆盖 | Room Operation Overrides
    // =========================================================================

    /**
     * @zh 房间创建后注册到分布式系统
     * @en Register room to distributed system after creation
     */
    protected override async _onRoomCreated(name: string, room: Room): Promise<void> {
        const registration: RoomRegistration = {
            roomId: room.id,
            roomType: name,
            serverId: this._serverId,
            serverAddress: `${this._config.serverAddress}:${this._config.serverPort}`,
            playerCount: room.players.length,
            maxPlayers: room.maxPlayers,
            isLocked: room.isLocked,
            metadata: {},
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await this._adapter.registerRoom(registration);
        logger.debug(`Registered room: ${room.id}`);
    }

    /**
     * @zh 房间销毁时从分布式系统注销
     * @en Unregister room from distributed system when disposed
     */
    protected override _onRoomDisposed(roomId: string): void {
        super._onRoomDisposed(roomId);

        // 异步注销房间 | Async unregister room
        this._adapter.unregisterRoom(roomId).catch(err => {
            logger.error(`Failed to unregister room ${roomId}:`, err);
        });

        // 删除快照 | Delete snapshot
        this._adapter.deleteSnapshot(roomId).catch(err => {
            logger.error(`Failed to delete snapshot for ${roomId}:`, err);
        });
    }

    /**
     * @zh 玩家加入后更新分布式房间信息
     * @en Update distributed room info after player joins
     */
    protected override _onPlayerJoined(playerId: string, roomId: string, player: Player): void {
        super._onPlayerJoined(playerId, roomId, player);

        const room = this._rooms.get(roomId);
        if (room) {
            this._adapter.updateRoom(roomId, {
                playerCount: room.players.length,
                updatedAt: Date.now()
            }).catch(err => {
                logger.error(`Failed to update room ${roomId}:`, err);
            });
        }
    }

    /**
     * @zh 玩家离开后更新分布式房间信息
     * @en Update distributed room info after player leaves
     */
    protected override _onPlayerLeft(playerId: string, roomId: string): void {
        super._onPlayerLeft(playerId, roomId);

        const room = this._rooms.get(roomId);
        if (room) {
            this._adapter.updateRoom(roomId, {
                playerCount: room.players.length,
                updatedAt: Date.now()
            }).catch(err => {
                logger.error(`Failed to update room ${roomId}:`, err);
            });
        }
    }

    // =========================================================================
    // 分布式路由 | Distributed Routing
    // =========================================================================

    /**
     * @zh 路由玩家到合适的房间/服务器
     * @en Route player to appropriate room/server
     *
     * @param request - 路由请求 | Routing request
     * @returns 路由结果 | Routing result
     */
    async route(request: RoutingRequest): Promise<RoutingResult> {
        // 如果指定了房间 ID，直接查找 | If room ID specified, look it up directly
        if (request.roomId) {
            return this._routeToRoom(request.roomId);
        }

        // 按类型查找可用房间 | Find available room by type
        if (request.roomType) {
            return this._routeByType(request.roomType, request.query);
        }

        return { type: 'unavailable', reason: 'No room type or room ID specified' };
    }

    /**
     * @zh 加入或创建房间（分布式版本）
     * @en Join or create room (distributed version)
     *
     * @zh 此方法会：
     * 1. 先在分布式注册表中查找可用房间
     * 2. 如果找到其他服务器的房间，返回重定向
     * 3. 如果找到本地房间或需要创建，在本地处理
     * @en This method will:
     * 1. First search for available room in distributed registry
     * 2. If room found on another server, return redirect
     * 3. If local room found or creation needed, handle locally
     */
    async joinOrCreateDistributed(
        name: string,
        playerId: string,
        conn: any,
        options?: RoomOptions
    ): Promise<{ room: Room; player: Player } | { redirect: string } | null> {
        // 使用分布式锁防止竞态条件 | Use distributed lock to prevent race conditions
        const lockKey = `joinOrCreate:${name}`;
        const locked = await this._adapter.acquireLock(lockKey, 5000);

        if (!locked) {
            // 等待一小段时间后重试 | Wait and retry
            await this._sleep(100);
            return this.joinOrCreateDistributed(name, playerId, conn, options);
        }

        try {
            // 先在分布式注册表中查找 | First search in distributed registry
            const availableRoom = await this._adapter.findAvailableRoom(name);

            if (availableRoom) {
                // 检查是否在本地服务器 | Check if on local server
                if (availableRoom.serverId === this._serverId) {
                    // 本地房间 | Local room
                    return super.joinOrCreate(name, playerId, conn, options);
                } else {
                    // 其他服务器，返回重定向 | Other server, return redirect
                    return { redirect: availableRoom.serverAddress };
                }
            }

            // 没有可用房间，在本地创建 | No available room, create locally
            return super.joinOrCreate(name, playerId, conn, options);
        } finally {
            await this._adapter.releaseLock(lockKey);
        }
    }

    // =========================================================================
    // 状态管理 | State Management
    // =========================================================================

    /**
     * @zh 保存房间状态快照
     * @en Save room state snapshot
     *
     * @param roomId - 房间 ID | Room ID
     */
    async saveSnapshot(roomId: string): Promise<void> {
        const room = this._rooms.get(roomId);
        if (!room) return;

        const def = this._getDefinitionByRoom(room);
        if (!def) return;

        const snapshot = {
            roomId: room.id,
            roomType: def.name,
            state: room.state ?? {},
            players: room.players.map(p => ({
                id: p.id,
                data: p.data ?? {}
            })),
            version: Date.now(),
            timestamp: Date.now()
        };

        await this._adapter.saveSnapshot(snapshot);
        logger.debug(`Saved snapshot for room: ${roomId}`);
    }

    /**
     * @zh 从快照恢复房间
     * @en Restore room from snapshot
     *
     * @param roomId - 房间 ID | Room ID
     * @returns 是否成功恢复 | Whether restore was successful
     */
    async restoreFromSnapshot(roomId: string): Promise<boolean> {
        const snapshot = await this._adapter.loadSnapshot(roomId);
        if (!snapshot) return false;

        // 创建房间实例 | Create room instance
        const room = await this._createRoomInstance(
            snapshot.roomType,
            { state: snapshot.state },
            snapshot.roomId
        );

        if (!room) return false;

        // 注册到分布式系统 | Register to distributed system
        await this._onRoomCreated(snapshot.roomType, room);

        logger.info(`Restored room from snapshot: ${roomId}`);
        return true;
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    /**
     * @zh 注册服务器到分布式系统
     * @en Register server to distributed system
     */
    private async _registerServer(): Promise<void> {
        const registration: ServerRegistration = {
            serverId: this._serverId,
            address: this._config.serverAddress,
            port: this._config.serverPort,
            roomCount: this._rooms.size,
            playerCount: this._countTotalPlayers(),
            capacity: this._config.capacity,
            status: 'online',
            lastHeartbeat: Date.now(),
            metadata: this._config.metadata
        };

        await this._adapter.registerServer(registration);
    }

    /**
     * @zh 订阅分布式事件
     * @en Subscribe to distributed events
     */
    private async _subscribeToEvents(): Promise<void> {
        // 订阅服务器离线事件以触发故障转移 | Subscribe to server offline for failover
        if (this._config.enableFailover) {
            const unsub = await this._adapter.subscribe('server:offline', (event) => {
                this._handleServerOffline(event);
            });
            this._subscriptions.push(unsub);
        }

        // 订阅房间消息事件 | Subscribe to room message events
        const roomMsgUnsub = await this._adapter.subscribe('room:message', (event) => {
            this._handleRoomMessage(event);
        });
        this._subscriptions.push(roomMsgUnsub);
    }

    /**
     * @zh 启动心跳定时器
     * @en Start heartbeat timer
     */
    private _startHeartbeat(): void {
        this._heartbeatTimer = setInterval(async () => {
            try {
                await this._adapter.heartbeat(this._serverId);
                await this._adapter.updateServer(this._serverId, {
                    roomCount: this._rooms.size,
                    playerCount: this._countTotalPlayers()
                });
            } catch (err) {
                logger.error('Heartbeat failed:', err);
            }
        }, this._config.heartbeatInterval);
    }

    /**
     * @zh 启动快照定时器
     * @en Start snapshot timer
     */
    private _startSnapshotTimer(): void {
        this._snapshotTimer = setInterval(async () => {
            await this._saveAllSnapshots();
        }, this._config.snapshotInterval);
    }

    /**
     * @zh 保存所有房间快照
     * @en Save all room snapshots
     */
    private async _saveAllSnapshots(): Promise<void> {
        const promises: Promise<void>[] = [];
        for (const roomId of this._rooms.keys()) {
            promises.push(this.saveSnapshot(roomId));
        }
        await Promise.allSettled(promises);
    }

    /**
     * @zh 路由到指定房间
     * @en Route to specific room
     */
    private async _routeToRoom(roomId: string): Promise<RoutingResult> {
        // 先检查本地 | Check local first
        if (this._rooms.has(roomId)) {
            return { type: 'local', roomId };
        }

        // 从分布式注册表查询 | Query from distributed registry
        const registration = await this._adapter.getRoom(roomId);
        if (!registration) {
            return { type: 'unavailable', reason: 'Room not found' };
        }

        if (registration.serverId === this._serverId) {
            return { type: 'local', roomId };
        }

        return {
            type: 'redirect',
            serverAddress: registration.serverAddress,
            roomId
        };
    }

    /**
     * @zh 按类型路由
     * @en Route by type
     */
    private async _routeByType(
        roomType: string,
        _query?: RoutingRequest['query']
    ): Promise<RoutingResult> {
        const availableRoom = await this._adapter.findAvailableRoom(roomType);

        if (!availableRoom) {
            // 没有可用房间，需要创建 | No available room, need to create
            return { type: 'create', roomId: undefined };
        }

        if (availableRoom.serverId === this._serverId) {
            return { type: 'local', roomId: availableRoom.roomId };
        }

        return {
            type: 'redirect',
            serverAddress: availableRoom.serverAddress,
            roomId: availableRoom.roomId
        };
    }

    /**
     * @zh 处理服务器离线事件
     * @en Handle server offline event
     */
    private _handleServerOffline(event: DistributedEvent): void {
        if (this._isShuttingDown) return;
        if (!this._config.enableFailover) return;

        const offlineServerId = event.serverId;
        if (offlineServerId === this._serverId) return;

        logger.info(`Server offline detected: ${offlineServerId}`);

        this._tryRecoverRoomsFromServer(offlineServerId).catch(err => {
            logger.error(`Failed to recover rooms from ${offlineServerId}:`, err);
        });
    }

    /**
     * @zh 尝试从离线服务器恢复房间
     * @en Try to recover rooms from offline server
     */
    private async _tryRecoverRoomsFromServer(offlineServerId: string): Promise<void> {
        // 检查是否有容量接收更多房间
        if (this._rooms.size >= this._config.capacity) {
            logger.warn(`Cannot recover rooms: server at capacity (${this._rooms.size}/${this._config.capacity})`);
            return;
        }

        // 查询该服务器上的所有房间
        const rooms = await this._adapter.queryRooms({ serverId: offlineServerId });
        if (rooms.length === 0) {
            logger.info(`No rooms to recover from ${offlineServerId}`);
            return;
        }

        logger.info(`Attempting to recover ${rooms.length} rooms from ${offlineServerId}`);

        for (const roomReg of rooms) {
            // 检查容量
            if (this._rooms.size >= this._config.capacity) {
                logger.warn('Reached capacity during recovery, stopping');
                break;
            }

            // 尝试获取恢复锁，防止多个服务器同时恢复同一房间
            const lockKey = `failover:${roomReg.roomId}`;
            const acquired = await this._adapter.acquireLock(lockKey, this._config.migrationTimeout);

            if (!acquired) {
                continue;
            }

            try {
                // 从快照恢复房间
                const success = await this.restoreFromSnapshot(roomReg.roomId);
                if (success) {
                    logger.info(`Successfully recovered room ${roomReg.roomId}`);
                    // 发布恢复事件
                    await this._adapter.publish({
                        type: 'room:migrated',
                        serverId: this._serverId,
                        roomId: roomReg.roomId,
                        payload: {
                            fromServer: offlineServerId,
                            toServer: this._serverId
                        },
                        timestamp: Date.now()
                    });
                }
            } finally {
                await this._adapter.releaseLock(lockKey);
            }
        }
    }

    /**
     * @zh 处理跨服务器房间消息
     * @en Handle cross-server room message
     */
    private _handleRoomMessage(event: DistributedEvent): void {
        if (!event.roomId) return;

        const room = this._rooms.get(event.roomId);
        if (!room) return;

        const payload = event.payload as { messageType: string; data: unknown; playerId?: string };
        if (payload.playerId) {
            room._handleMessage(payload.messageType, payload.data, payload.playerId);
        }
    }

    /**
     * @zh 统计总玩家数
     * @en Count total players
     */
    private _countTotalPlayers(): number {
        let count = 0;
        for (const room of this._rooms.values()) {
            count += room.players.length;
        }
        return count;
    }

    /**
     * @zh 根据房间实例获取定义
     * @en Get definition by room instance
     */
    private _getDefinitionByRoom(room: Room): { name: string } | null {
        for (const [name, def] of this._definitions) {
            if (room instanceof def.roomClass) {
                return { name };
            }
        }
        return null;
    }

    /**
     * @zh 休眠指定时间
     * @en Sleep for specified time
     */
    private _sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * @zh 向其他服务器的房间发送消息
     * @en Send message to room on another server
     *
     * @param roomId - 房间 ID | Room ID
     * @param messageType - 消息类型 | Message type
     * @param data - 消息数据 | Message data
     * @param playerId - 发送者玩家 ID（可选）| Sender player ID (optional)
     */
    async sendToRemoteRoom(
        roomId: string,
        messageType: string,
        data: unknown,
        playerId?: string
    ): Promise<void> {
        await this._adapter.sendToRoom(roomId, messageType, data, playerId);
    }

    /**
     * @zh 获取所有在线服务器
     * @en Get all online servers
     */
    async getServers(): Promise<ServerRegistration[]> {
        return this._adapter.getServers();
    }

    /**
     * @zh 查询分布式房间
     * @en Query distributed rooms
     */
    async queryDistributedRooms(query: {
        roomType?: string;
        hasSpace?: boolean;
        notLocked?: boolean;
        metadata?: Record<string, unknown>;
        limit?: number;
    }): Promise<RoomRegistration[]> {
        return this._adapter.queryRooms(query);
    }
}
