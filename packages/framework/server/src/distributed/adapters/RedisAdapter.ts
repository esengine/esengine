/**
 * @zh Redis 分布式适配器
 * @en Redis distributed adapter
 *
 * @zh 基于 Redis 的分布式房间适配器，支持 Pub/Sub、分布式锁和状态持久化
 * @en Redis-based distributed room adapter with Pub/Sub, distributed lock and state persistence
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
 * @zh Redis 客户端接口（兼容 ioredis）
 * @en Redis client interface (compatible with ioredis)
 */
export interface RedisClient {
    // 基础操作
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ...args: (string | number)[]): Promise<string | null>;
    del(...keys: string[]): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    ttl(key: string): Promise<number>;

    // Hash 操作
    hget(key: string, field: string): Promise<string | null>;
    hset(key: string, ...args: (string | number | Buffer)[]): Promise<number>;
    hdel(key: string, ...fields: string[]): Promise<number>;
    hgetall(key: string): Promise<Record<string, string>>;
    hmset(key: string, ...args: (string | number | Buffer)[]): Promise<'OK'>;

    // Set 操作
    sadd(key: string, ...members: string[]): Promise<number>;
    srem(key: string, ...members: string[]): Promise<number>;
    smembers(key: string): Promise<string[]>;

    // Pub/Sub
    publish(channel: string, message: string): Promise<number>;
    subscribe(channel: string): Promise<number>;
    psubscribe(pattern: string): Promise<number>;
    unsubscribe(...channels: string[]): Promise<number>;
    punsubscribe(...patterns: string[]): Promise<number>;

    // 事件（重载支持 message 事件的类型安全）
    on(event: 'message', callback: (channel: string, message: string) => void): void;
    on(event: 'pmessage', callback: (pattern: string, channel: string, message: string) => void): void;
    on(event: string, callback: (...args: unknown[]) => void): void;
    off(event: 'message', callback: (channel: string, message: string) => void): void;
    off(event: 'pmessage', callback: (pattern: string, channel: string, message: string) => void): void;
    off(event: string, callback: (...args: unknown[]) => void): void;

    // Lua 脚本
    eval(script: string, numkeys: number, ...args: (string | number)[]): Promise<unknown>;

    // 连接
    duplicate(): RedisClient;
    quit(): Promise<'OK'>;
    disconnect(): void;
}

/**
 * @zh Redis 连接工厂
 * @en Redis connection factory
 */
export type RedisClientFactory = () => RedisClient | Promise<RedisClient>;

/**
 * @zh Redis 适配器配置
 * @en Redis adapter configuration
 */
export interface RedisAdapterConfig {
    /**
     * @zh Redis 客户端工厂（惰性连接）
     * @en Redis client factory (lazy connection)
     *
     * @example
     * ```typescript
     * import Redis from 'ioredis'
     * const adapter = new RedisAdapter({
     *     factory: () => new Redis('redis://localhost:6379')
     * })
     * ```
     */
    factory: RedisClientFactory;

    /**
     * @zh 键前缀
     * @en Key prefix
     * @default 'dist:'
     */
    prefix?: string;

    /**
     * @zh 服务器 TTL（秒）
     * @en Server TTL (seconds)
     * @default 30
     */
    serverTtl?: number;

    /**
     * @zh 房间 TTL（秒），0 = 永不过期
     * @en Room TTL (seconds), 0 = never expire
     * @default 0
     */
    roomTtl?: number;

    /**
     * @zh 快照 TTL（秒）
     * @en Snapshot TTL (seconds)
     * @default 86400 (24 hours)
     */
    snapshotTtl?: number;

    /**
     * @zh Pub/Sub 频道名
     * @en Pub/Sub channel name
     * @default 'distributed:events'
     */
    channel?: string;
}

// Lua 脚本：安全释放锁
const RELEASE_LOCK_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
`;

// Lua 脚本：扩展锁 TTL
const EXTEND_LOCK_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("pexpire", KEYS[1], ARGV[2])
else
    return 0
end
`;

/**
 * @zh Redis 分布式适配器
 * @en Redis distributed adapter
 *
 * @example
 * ```typescript
 * import Redis from 'ioredis'
 * import { RedisAdapter, DistributedRoomManager } from '@esengine/server'
 *
 * const adapter = new RedisAdapter({
 *     factory: () => new Redis('redis://localhost:6379'),
 *     prefix: 'game:'
 * })
 *
 * const manager = new DistributedRoomManager(adapter, {
 *     serverId: 'server-1',
 *     serverAddress: 'localhost',
 *     serverPort: 3000
 * }, sendFn)
 *
 * await manager.start()
 * ```
 */
export class RedisAdapter implements IDistributedAdapter {
    private readonly _config: Required<RedisAdapterConfig>;
    private _client: RedisClient | null = null;
    private _subscriber: RedisClient | null = null;
    private _connected = false;

    // 锁的 owner token（用于安全释放）
    private readonly _lockTokens = new Map<string, string>();

    // 事件处理器
    private readonly _handlers = new Map<string, Set<DistributedEventHandler>>();
    private _messageHandler: ((channel: string, message: string) => void) | null = null;

    constructor(config: RedisAdapterConfig) {
        this._config = {
            prefix: 'dist:',
            serverTtl: 30,
            roomTtl: 0,
            snapshotTtl: 86400,
            channel: 'distributed:events',
            ...config,
            factory: config.factory
        };
    }

    // =========================================================================
    // Key 生成器 | Key Generators
    // =========================================================================

    private _key(type: string, id?: string): string {
        return id
            ? `${this._config.prefix}${type}:${id}`
            : `${this._config.prefix}${type}`;
    }

    private _serverKey(serverId: string): string {
        return this._key('server', serverId);
    }

    private _roomKey(roomId: string): string {
        return this._key('room', roomId);
    }

    private _snapshotKey(roomId: string): string {
        return this._key('snapshot', roomId);
    }

    private _lockKey(key: string): string {
        return this._key('lock', key);
    }

    private _serversSetKey(): string {
        return this._key('servers');
    }

    private _roomsSetKey(): string {
        return this._key('rooms');
    }

    private _serverRoomsKey(serverId: string): string {
        return this._key('server-rooms', serverId);
    }

    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    async connect(): Promise<void> {
        if (this._connected) return;

        // 创建主客户端
        this._client = await this._config.factory();

        // 创建订阅专用客户端
        this._subscriber = this._client.duplicate();

        // 设置消息处理器
        this._messageHandler = (channel: string, message: string) => {
            if (channel !== this._config.channel) return;

            try {
                const event: DistributedEvent = JSON.parse(message);
                this._dispatchEvent(event);
            } catch (error) {
                console.error('[RedisAdapter] Failed to parse event:', error);
            }
        };

        this._subscriber.on('message', this._messageHandler);
        await this._subscriber.subscribe(this._config.channel);

        this._connected = true;
    }

    async disconnect(): Promise<void> {
        if (!this._connected) return;

        // 清理订阅
        if (this._subscriber) {
            if (this._messageHandler) {
                this._subscriber.off('message', this._messageHandler);
            }
            await this._subscriber.unsubscribe(this._config.channel);
            this._subscriber.disconnect();
            this._subscriber = null;
        }

        // 关闭主客户端
        if (this._client) {
            await this._client.quit();
            this._client = null;
        }

        this._handlers.clear();
        this._lockTokens.clear();
        this._connected = false;
    }

    isConnected(): boolean {
        return this._connected;
    }

    private _ensureConnected(): RedisClient {
        if (!this._connected || !this._client) {
            throw new Error('RedisAdapter is not connected');
        }
        return this._client;
    }

    // =========================================================================
    // 服务器注册 | Server Registry
    // =========================================================================

    async registerServer(server: ServerRegistration): Promise<void> {
        const client = this._ensureConnected();
        const key = this._serverKey(server.serverId);

        // 存储服务器信息
        await client.hmset(
            key,
            'serverId', server.serverId,
            'address', server.address,
            'port', String(server.port),
            'roomCount', String(server.roomCount),
            'playerCount', String(server.playerCount),
            'capacity', String(server.capacity),
            'status', server.status,
            'lastHeartbeat', String(Date.now()),
            'metadata', JSON.stringify(server.metadata ?? {})
        );

        // 设置 TTL
        await client.expire(key, this._config.serverTtl);

        // 添加到服务器集合
        await client.sadd(this._serversSetKey(), server.serverId);

        // 发布事件
        await this.publish({
            type: 'server:online',
            serverId: server.serverId,
            payload: server,
            timestamp: Date.now()
        });
    }

    async unregisterServer(serverId: string): Promise<void> {
        const client = this._ensureConnected();
        const key = this._serverKey(serverId);

        // 删除服务器信息
        await client.del(key);

        // 从服务器集合移除
        await client.srem(this._serversSetKey(), serverId);

        // 删除该服务器的所有房间
        const roomIds = await client.smembers(this._serverRoomsKey(serverId));
        for (const roomId of roomIds) {
            await this.unregisterRoom(roomId);
        }
        await client.del(this._serverRoomsKey(serverId));

        // 发布事件
        await this.publish({
            type: 'server:offline',
            serverId,
            payload: { serverId },
            timestamp: Date.now()
        });
    }

    async heartbeat(serverId: string): Promise<void> {
        const client = this._ensureConnected();
        const key = this._serverKey(serverId);

        // 更新心跳时间并刷新 TTL
        await client.hset(key, 'lastHeartbeat', String(Date.now()));
        await client.expire(key, this._config.serverTtl);
    }

    async getServers(): Promise<ServerRegistration[]> {
        const client = this._ensureConnected();
        const serverIds = await client.smembers(this._serversSetKey());

        const servers: ServerRegistration[] = [];
        for (const serverId of serverIds) {
            const server = await this.getServer(serverId);
            if (server && server.status === 'online') {
                servers.push(server);
            }
        }

        return servers;
    }

    async getServer(serverId: string): Promise<ServerRegistration | null> {
        const client = this._ensureConnected();
        const key = this._serverKey(serverId);
        const data = await client.hgetall(key);

        if (!data || !data.serverId) return null;

        return {
            serverId: data.serverId,
            address: data.address,
            port: parseInt(data.port, 10),
            roomCount: parseInt(data.roomCount, 10),
            playerCount: parseInt(data.playerCount, 10),
            capacity: parseInt(data.capacity, 10),
            status: data.status as ServerRegistration['status'],
            lastHeartbeat: parseInt(data.lastHeartbeat, 10),
            metadata: data.metadata ? JSON.parse(data.metadata) : {}
        };
    }

    async updateServer(serverId: string, updates: Partial<ServerRegistration>): Promise<void> {
        const client = this._ensureConnected();
        const key = this._serverKey(serverId);

        const args: (string | number)[] = [];
        if (updates.address !== undefined) args.push('address', updates.address);
        if (updates.port !== undefined) args.push('port', String(updates.port));
        if (updates.roomCount !== undefined) args.push('roomCount', String(updates.roomCount));
        if (updates.playerCount !== undefined) args.push('playerCount', String(updates.playerCount));
        if (updates.capacity !== undefined) args.push('capacity', String(updates.capacity));
        if (updates.status !== undefined) args.push('status', updates.status);
        if (updates.metadata !== undefined) args.push('metadata', JSON.stringify(updates.metadata));

        if (args.length > 0) {
            await client.hmset(key, ...args);
        }

        // 如果是 draining 状态，发布事件
        if (updates.status === 'draining') {
            await this.publish({
                type: 'server:draining',
                serverId,
                payload: { serverId },
                timestamp: Date.now()
            });
        }
    }

    // =========================================================================
    // 房间注册 | Room Registry
    // =========================================================================

    async registerRoom(room: RoomRegistration): Promise<void> {
        const client = this._ensureConnected();
        const key = this._roomKey(room.roomId);

        // 存储房间信息
        await client.hmset(
            key,
            'roomId', room.roomId,
            'roomType', room.roomType,
            'serverId', room.serverId,
            'serverAddress', room.serverAddress,
            'playerCount', String(room.playerCount),
            'maxPlayers', String(room.maxPlayers),
            'isLocked', room.isLocked ? '1' : '0',
            'metadata', JSON.stringify(room.metadata),
            'createdAt', String(room.createdAt),
            'updatedAt', String(room.updatedAt)
        );

        // 设置 TTL（如果配置了）
        if (this._config.roomTtl > 0) {
            await client.expire(key, this._config.roomTtl);
        }

        // 添加到房间集合
        await client.sadd(this._roomsSetKey(), room.roomId);

        // 添加到服务器的房间列表
        await client.sadd(this._serverRoomsKey(room.serverId), room.roomId);

        // 更新服务器房间计数
        const roomCount = (await client.smembers(this._serverRoomsKey(room.serverId))).length;
        await client.hset(this._serverKey(room.serverId), 'roomCount', String(roomCount));

        // 发布事件
        await this.publish({
            type: 'room:created',
            serverId: room.serverId,
            roomId: room.roomId,
            payload: { roomType: room.roomType },
            timestamp: Date.now()
        });
    }

    async unregisterRoom(roomId: string): Promise<void> {
        const client = this._ensureConnected();
        const room = await this.getRoom(roomId);
        if (!room) return;

        const key = this._roomKey(roomId);

        // 删除房间信息
        await client.del(key);

        // 从房间集合移除
        await client.srem(this._roomsSetKey(), roomId);

        // 从服务器的房间列表移除
        await client.srem(this._serverRoomsKey(room.serverId), roomId);

        // 更新服务器房间计数
        const roomCount = (await client.smembers(this._serverRoomsKey(room.serverId))).length;
        await client.hset(this._serverKey(room.serverId), 'roomCount', String(roomCount));

        // 删除快照
        await this.deleteSnapshot(roomId);

        // 发布事件
        await this.publish({
            type: 'room:disposed',
            serverId: room.serverId,
            roomId,
            payload: {},
            timestamp: Date.now()
        });
    }

    async updateRoom(roomId: string, updates: Partial<RoomRegistration>): Promise<void> {
        const client = this._ensureConnected();
        const room = await this.getRoom(roomId);
        if (!room) return;

        const key = this._roomKey(roomId);
        const args: (string | number)[] = [];

        if (updates.playerCount !== undefined) args.push('playerCount', String(updates.playerCount));
        if (updates.maxPlayers !== undefined) args.push('maxPlayers', String(updates.maxPlayers));
        if (updates.isLocked !== undefined) args.push('isLocked', updates.isLocked ? '1' : '0');
        if (updates.metadata !== undefined) args.push('metadata', JSON.stringify(updates.metadata));
        args.push('updatedAt', String(Date.now()));

        if (args.length > 0) {
            await client.hmset(key, ...args);
        }

        // 发布更新事件
        await this.publish({
            type: 'room:updated',
            serverId: room.serverId,
            roomId,
            payload: updates,
            timestamp: Date.now()
        });

        // 如果锁定状态变化，发布专门事件
        if (updates.isLocked !== undefined) {
            await this.publish({
                type: updates.isLocked ? 'room:locked' : 'room:unlocked',
                serverId: room.serverId,
                roomId,
                payload: {},
                timestamp: Date.now()
            });
        }
    }

    async getRoom(roomId: string): Promise<RoomRegistration | null> {
        const client = this._ensureConnected();
        const key = this._roomKey(roomId);
        const data = await client.hgetall(key);

        if (!data || !data.roomId) return null;

        return {
            roomId: data.roomId,
            roomType: data.roomType,
            serverId: data.serverId,
            serverAddress: data.serverAddress,
            playerCount: parseInt(data.playerCount, 10),
            maxPlayers: parseInt(data.maxPlayers, 10),
            isLocked: data.isLocked === '1',
            metadata: data.metadata ? JSON.parse(data.metadata) : {},
            createdAt: parseInt(data.createdAt, 10),
            updatedAt: parseInt(data.updatedAt, 10)
        };
    }

    async queryRooms(query: RoomQuery): Promise<RoomRegistration[]> {
        const client = this._ensureConnected();
        const roomIds = await client.smembers(this._roomsSetKey());

        let results: RoomRegistration[] = [];

        // 获取所有房间
        for (const roomId of roomIds) {
            const room = await this.getRoom(roomId);
            if (room) results.push(room);
        }

        // 过滤
        if (query.roomType) {
            results = results.filter(r => r.roomType === query.roomType);
        }
        if (query.hasSpace) {
            results = results.filter(r => r.playerCount < r.maxPlayers);
        }
        if (query.notLocked) {
            results = results.filter(r => !r.isLocked);
        }
        if (query.metadata) {
            results = results.filter(r => {
                for (const [key, value] of Object.entries(query.metadata!)) {
                    if (r.metadata[key] !== value) return false;
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
        const client = this._ensureConnected();
        const roomIds = await client.smembers(this._serverRoomsKey(serverId));

        const rooms: RoomRegistration[] = [];
        for (const roomId of roomIds) {
            const room = await this.getRoom(roomId);
            if (room) rooms.push(room);
        }

        return rooms;
    }

    // =========================================================================
    // 房间状态 | Room State
    // =========================================================================

    async saveSnapshot(snapshot: RoomSnapshot): Promise<void> {
        const client = this._ensureConnected();
        const key = this._snapshotKey(snapshot.roomId);

        await client.set(key, JSON.stringify(snapshot));
        await client.expire(key, this._config.snapshotTtl);
    }

    async loadSnapshot(roomId: string): Promise<RoomSnapshot | null> {
        const client = this._ensureConnected();
        const key = this._snapshotKey(roomId);
        const data = await client.get(key);

        return data ? JSON.parse(data) : null;
    }

    async deleteSnapshot(roomId: string): Promise<void> {
        const client = this._ensureConnected();
        const key = this._snapshotKey(roomId);
        await client.del(key);
    }

    // =========================================================================
    // 发布/订阅 | Pub/Sub
    // =========================================================================

    async publish(event: DistributedEvent): Promise<void> {
        const client = this._ensureConnected();
        await client.publish(this._config.channel, JSON.stringify(event));
    }

    async subscribe(
        pattern: DistributedEventType | '*',
        handler: DistributedEventHandler
    ): Promise<Unsubscribe> {
        if (!this._handlers.has(pattern)) {
            this._handlers.set(pattern, new Set());
        }
        this._handlers.get(pattern)!.add(handler);

        return () => {
            const handlers = this._handlers.get(pattern);
            if (handlers) {
                handlers.delete(handler);
                if (handlers.size === 0) {
                    this._handlers.delete(pattern);
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
        const room = await this.getRoom(roomId);
        if (!room) return;

        await this.publish({
            type: 'room:message',
            serverId: room.serverId,
            roomId,
            payload: { messageType, data, playerId },
            timestamp: Date.now()
        });
    }

    private _dispatchEvent(event: DistributedEvent): void {
        // 通知通配符订阅者
        const wildcardHandlers = this._handlers.get('*');
        if (wildcardHandlers) {
            for (const handler of wildcardHandlers) {
                try {
                    handler(event);
                } catch (error) {
                    console.error('[RedisAdapter] Event handler error:', error);
                }
            }
        }

        // 通知类型匹配的订阅者
        const typeHandlers = this._handlers.get(event.type);
        if (typeHandlers) {
            for (const handler of typeHandlers) {
                try {
                    handler(event);
                } catch (error) {
                    console.error('[RedisAdapter] Event handler error:', error);
                }
            }
        }
    }

    // =========================================================================
    // 分布式锁 | Distributed Lock
    // =========================================================================

    async acquireLock(key: string, ttlMs: number): Promise<boolean> {
        const client = this._ensureConnected();
        const lockKey = this._lockKey(key);
        const token = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const ttlSeconds = Math.ceil(ttlMs / 1000);

        const result = await client.set(lockKey, token, 'NX', 'EX', ttlSeconds);

        if (result === 'OK') {
            this._lockTokens.set(key, token);
            return true;
        }

        return false;
    }

    async releaseLock(key: string): Promise<void> {
        const client = this._ensureConnected();
        const lockKey = this._lockKey(key);
        const token = this._lockTokens.get(key);

        if (!token) return;

        await client.eval(RELEASE_LOCK_SCRIPT, 1, lockKey, token);
        this._lockTokens.delete(key);
    }

    async extendLock(key: string, ttlMs: number): Promise<boolean> {
        const client = this._ensureConnected();
        const lockKey = this._lockKey(key);
        const token = this._lockTokens.get(key);

        if (!token) return false;

        const result = await client.eval(EXTEND_LOCK_SCRIPT, 1, lockKey, token, String(ttlMs));
        return result === 1;
    }
}

/**
 * @zh 创建 Redis 适配器
 * @en Create Redis adapter
 */
export function createRedisAdapter(config: RedisAdapterConfig): RedisAdapter {
    return new RedisAdapter(config);
}
