/**
 * @zh 内存分布式适配器
 * @en Memory distributed adapter
 *
 * @zh 用于单机模式和测试的内存实现。所有数据存储在进程内存中。
 * @en In-memory implementation for single-server mode and testing. All data stored in process memory.
 */

import type { IDistributedAdapter } from './IDistributedAdapter.js';
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
 * @zh 内存适配器配置
 * @en Memory adapter configuration
 */
export interface MemoryAdapterConfig {
    /**
     * @zh 服务器 TTL（毫秒），超时后视为离线
     * @en Server TTL (ms), considered offline after timeout
     * @default 15000
     */
    serverTtl?: number;

    /**
     * @zh 是否启用 TTL 检查
     * @en Whether to enable TTL check
     * @default true
     */
    enableTtlCheck?: boolean;

    /**
     * @zh TTL 检查间隔（毫秒）
     * @en TTL check interval (ms)
     * @default 5000
     */
    ttlCheckInterval?: number;
}

/**
 * @zh 内存分布式适配器
 * @en Memory distributed adapter
 */
export class MemoryAdapter implements IDistributedAdapter {
    private readonly _config: Required<MemoryAdapterConfig>;
    private _connected = false;

    // 存储
    private readonly _servers = new Map<string, ServerRegistration>();
    private readonly _rooms = new Map<string, RoomRegistration>();
    private readonly _snapshots = new Map<string, RoomSnapshot>();
    private readonly _locks = new Map<string, { owner: string; expireAt: number }>();

    // 事件订阅
    private readonly _subscribers = new Map<string, Set<DistributedEventHandler>>();
    private _subscriberId = 0;

    // TTL 检查定时器
    private _ttlCheckTimer: ReturnType<typeof setInterval> | null = null;

    constructor(config: MemoryAdapterConfig = {}) {
        this._config = {
            serverTtl: 15000,
            enableTtlCheck: true,
            ttlCheckInterval: 5000,
            ...config
        };
    }

    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    async connect(): Promise<void> {
        if (this._connected) return;

        this._connected = true;

        if (this._config.enableTtlCheck) {
            this._ttlCheckTimer = setInterval(
                () => this._checkServerTtl(),
                this._config.ttlCheckInterval
            );
        }
    }

    async disconnect(): Promise<void> {
        if (!this._connected) return;

        if (this._ttlCheckTimer) {
            clearInterval(this._ttlCheckTimer);
            this._ttlCheckTimer = null;
        }

        this._connected = false;
        this._servers.clear();
        this._rooms.clear();
        this._snapshots.clear();
        this._locks.clear();
        this._subscribers.clear();
    }

    isConnected(): boolean {
        return this._connected;
    }

    // =========================================================================
    // 服务器注册 | Server Registry
    // =========================================================================

    async registerServer(server: ServerRegistration): Promise<void> {
        this._ensureConnected();
        this._servers.set(server.serverId, { ...server, lastHeartbeat: Date.now() });

        await this.publish({
            type: 'server:online',
            serverId: server.serverId,
            payload: server,
            timestamp: Date.now()
        });
    }

    async unregisterServer(serverId: string): Promise<void> {
        this._ensureConnected();
        const server = this._servers.get(serverId);
        if (!server) return;

        this._servers.delete(serverId);

        // 清理该服务器的所有房间
        for (const [roomId, room] of this._rooms) {
            if (room.serverId === serverId) {
                this._rooms.delete(roomId);
            }
        }

        await this.publish({
            type: 'server:offline',
            serverId,
            payload: { serverId },
            timestamp: Date.now()
        });
    }

    async heartbeat(serverId: string): Promise<void> {
        this._ensureConnected();
        const server = this._servers.get(serverId);
        if (server) {
            server.lastHeartbeat = Date.now();
        }
    }

    async getServers(): Promise<ServerRegistration[]> {
        this._ensureConnected();
        return Array.from(this._servers.values()).filter(s => s.status === 'online');
    }

    async getServer(serverId: string): Promise<ServerRegistration | null> {
        this._ensureConnected();
        return this._servers.get(serverId) ?? null;
    }

    async updateServer(serverId: string, updates: Partial<ServerRegistration>): Promise<void> {
        this._ensureConnected();
        const server = this._servers.get(serverId);
        if (server) {
            Object.assign(server, updates);
        }
    }

    // =========================================================================
    // 房间注册 | Room Registry
    // =========================================================================

    async registerRoom(room: RoomRegistration): Promise<void> {
        this._ensureConnected();
        this._rooms.set(room.roomId, { ...room });

        // 更新服务器的房间计数
        const server = this._servers.get(room.serverId);
        if (server) {
            server.roomCount = this._countRoomsByServer(room.serverId);
        }

        await this.publish({
            type: 'room:created',
            serverId: room.serverId,
            roomId: room.roomId,
            payload: { roomType: room.roomType },
            timestamp: Date.now()
        });
    }

    async unregisterRoom(roomId: string): Promise<void> {
        this._ensureConnected();
        const room = this._rooms.get(roomId);
        if (!room) return;

        this._rooms.delete(roomId);
        this._snapshots.delete(roomId);

        // 更新服务器的房间计数
        const server = this._servers.get(room.serverId);
        if (server) {
            server.roomCount = this._countRoomsByServer(room.serverId);
        }

        await this.publish({
            type: 'room:disposed',
            serverId: room.serverId,
            roomId,
            payload: {},
            timestamp: Date.now()
        });
    }

    async updateRoom(roomId: string, updates: Partial<RoomRegistration>): Promise<void> {
        this._ensureConnected();
        const room = this._rooms.get(roomId);
        if (!room) return;

        Object.assign(room, updates, { updatedAt: Date.now() });

        await this.publish({
            type: 'room:updated',
            serverId: room.serverId,
            roomId,
            payload: updates,
            timestamp: Date.now()
        });
    }

    async getRoom(roomId: string): Promise<RoomRegistration | null> {
        this._ensureConnected();
        return this._rooms.get(roomId) ?? null;
    }

    async queryRooms(query: RoomQuery): Promise<RoomRegistration[]> {
        this._ensureConnected();

        let results = Array.from(this._rooms.values());

        // 按类型过滤
        if (query.roomType) {
            results = results.filter(r => r.roomType === query.roomType);
        }

        // 按空位过滤
        if (query.hasSpace) {
            results = results.filter(r => r.playerCount < r.maxPlayers);
        }

        // 按锁定状态过滤
        if (query.notLocked) {
            results = results.filter(r => !r.isLocked);
        }

        // 按元数据过滤
        if (query.metadata) {
            results = results.filter(r => {
                for (const [key, value] of Object.entries(query.metadata!)) {
                    if (r.metadata[key] !== value) {
                        return false;
                    }
                }
                return true;
            });
        }

        // 分页
        if (query.offset) {
            results = results.slice(query.offset);
        }
        if (query.limit) {
            results = results.slice(0, query.limit);
        }

        return results;
    }

    async findAvailableRoom(roomType: string): Promise<RoomRegistration | null> {
        const rooms = await this.queryRooms({
            roomType,
            hasSpace: true,
            notLocked: true,
            limit: 1
        });
        return rooms[0] ?? null;
    }

    async getRoomsByServer(serverId: string): Promise<RoomRegistration[]> {
        this._ensureConnected();
        return Array.from(this._rooms.values()).filter(r => r.serverId === serverId);
    }

    // =========================================================================
    // 房间状态 | Room State
    // =========================================================================

    async saveSnapshot(snapshot: RoomSnapshot): Promise<void> {
        this._ensureConnected();
        this._snapshots.set(snapshot.roomId, { ...snapshot });
    }

    async loadSnapshot(roomId: string): Promise<RoomSnapshot | null> {
        this._ensureConnected();
        return this._snapshots.get(roomId) ?? null;
    }

    async deleteSnapshot(roomId: string): Promise<void> {
        this._ensureConnected();
        this._snapshots.delete(roomId);
    }

    // =========================================================================
    // 发布/订阅 | Pub/Sub
    // =========================================================================

    async publish(event: DistributedEvent): Promise<void> {
        this._ensureConnected();

        // 通知所有匹配的订阅者
        const wildcardHandlers = this._subscribers.get('*') ?? new Set();
        const typeHandlers = this._subscribers.get(event.type) ?? new Set();

        for (const handler of wildcardHandlers) {
            try {
                handler(event);
            } catch (error) {
                console.error('Event handler error:', error);
            }
        }

        for (const handler of typeHandlers) {
            try {
                handler(event);
            } catch (error) {
                console.error('Event handler error:', error);
            }
        }
    }

    async subscribe(
        pattern: DistributedEventType | '*',
        handler: DistributedEventHandler
    ): Promise<Unsubscribe> {
        this._ensureConnected();

        if (!this._subscribers.has(pattern)) {
            this._subscribers.set(pattern, new Set());
        }

        this._subscribers.get(pattern)!.add(handler);

        return () => {
            const handlers = this._subscribers.get(pattern);
            if (handlers) {
                handlers.delete(handler);
                if (handlers.size === 0) {
                    this._subscribers.delete(pattern);
                }
            }
        };
    }

    async sendToRoom(
        roomId: string,
        messageType: string,
        data: unknown,
        playerId?: string
    ): Promise<void> {
        this._ensureConnected();

        const room = this._rooms.get(roomId);
        if (!room) return;

        await this.publish({
            type: 'room:message',
            serverId: room.serverId,
            roomId,
            payload: { messageType, data, playerId },
            timestamp: Date.now()
        });
    }

    // =========================================================================
    // 分布式锁 | Distributed Lock
    // =========================================================================

    async acquireLock(key: string, ttlMs: number): Promise<boolean> {
        this._ensureConnected();

        const now = Date.now();
        const existing = this._locks.get(key);

        // 检查锁是否已过期
        if (existing && existing.expireAt > now) {
            return false;
        }

        // 获取锁
        const owner = `lock_${++this._subscriberId}`;
        this._locks.set(key, { owner, expireAt: now + ttlMs });

        return true;
    }

    async releaseLock(key: string): Promise<void> {
        this._ensureConnected();
        this._locks.delete(key);
    }

    async extendLock(key: string, ttlMs: number): Promise<boolean> {
        this._ensureConnected();

        const lock = this._locks.get(key);
        if (!lock) return false;

        lock.expireAt = Date.now() + ttlMs;
        return true;
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    private _ensureConnected(): void {
        if (!this._connected) {
            throw new Error('MemoryAdapter is not connected');
        }
    }

    private _countRoomsByServer(serverId: string): number {
        let count = 0;
        for (const room of this._rooms.values()) {
            if (room.serverId === serverId) {
                count++;
            }
        }
        return count;
    }

    private async _checkServerTtl(): Promise<void> {
        const now = Date.now();
        const expiredServers: string[] = [];

        for (const [serverId, server] of this._servers) {
            if (server.status === 'online' && now - server.lastHeartbeat > this._config.serverTtl) {
                server.status = 'offline';
                expiredServers.push(serverId);
            }
        }

        // 发布服务器离线事件
        for (const serverId of expiredServers) {
            await this.publish({
                type: 'server:offline',
                serverId,
                payload: { serverId, reason: 'heartbeat_timeout' },
                timestamp: now
            });
        }
    }

    // =========================================================================
    // 测试辅助方法 | Test Helper Methods
    // =========================================================================

    /**
     * @zh 清除所有数据（仅用于测试）
     * @en Clear all data (for testing only)
     */
    _clear(): void {
        this._servers.clear();
        this._rooms.clear();
        this._snapshots.clear();
        this._locks.clear();
    }

    /**
     * @zh 获取内部状态（仅用于测试）
     * @en Get internal state (for testing only)
     */
    _getState(): {
        servers: Map<string, ServerRegistration>;
        rooms: Map<string, RoomRegistration>;
        snapshots: Map<string, RoomSnapshot>;
    } {
        return {
            servers: this._servers,
            rooms: this._rooms,
            snapshots: this._snapshots
        };
    }
}
