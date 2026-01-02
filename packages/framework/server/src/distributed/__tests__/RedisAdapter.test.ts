/**
 * @zh RedisAdapter 单元测试
 * @en RedisAdapter unit tests
 *
 * @zh 使用 Mock Redis 客户端进行测试
 * @en Uses Mock Redis client for testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RedisAdapter } from '../adapters/RedisAdapter.js';
import type { RedisClient } from '../adapters/RedisAdapter.js';
import type { ServerRegistration, RoomRegistration, DistributedEvent } from '../types.js';

// 共享状态，用于模拟 Redis Pub/Sub
const sharedStore = new Map<string, string>();
const sharedSets = new Map<string, Set<string>>();
const sharedHashes = new Map<string, Map<string, string>>();
const sharedExpireTimes = new Map<string, number>();
const sharedPubSubHandlers = new Map<string, Set<(channel: string, message: string) => void>>();

function clearSharedState(): void {
    sharedStore.clear();
    sharedSets.clear();
    sharedHashes.clear();
    sharedExpireTimes.clear();
    sharedPubSubHandlers.clear();
}

/**
 * @zh 创建 Mock Redis 客户端
 * @en Create Mock Redis client
 */
function createMockRedisClient(): RedisClient {
    const eventHandlers = new Map<string, Set<(...args: unknown[]) => void>>();

    const mockClient: RedisClient = {
        // 基础操作
        get: vi.fn(async (key: string) => sharedStore.get(key) ?? null),
        set: vi.fn(async (key: string, value: string, ...args: (string | number)[]) => {
            // 处理 NX 选项
            if (args.includes('NX') && sharedStore.has(key)) {
                return null;
            }
            sharedStore.set(key, value);
            // 处理 EX 选项
            const exIndex = args.indexOf('EX');
            if (exIndex !== -1 && typeof args[exIndex + 1] === 'number') {
                sharedExpireTimes.set(key, Date.now() + (args[exIndex + 1] as number) * 1000);
            }
            return 'OK';
        }),
        del: vi.fn(async (...keys: string[]) => {
            let count = 0;
            for (const key of keys) {
                if (sharedStore.delete(key) || sharedHashes.delete(key) || sharedSets.delete(key)) {
                    count++;
                }
            }
            return count;
        }),
        expire: vi.fn(async (key: string, seconds: number) => {
            if (sharedStore.has(key) || sharedHashes.has(key)) {
                sharedExpireTimes.set(key, Date.now() + seconds * 1000);
                return 1;
            }
            return 0;
        }),
        ttl: vi.fn(async (key: string) => {
            const expire = sharedExpireTimes.get(key);
            if (!expire) return -1;
            const remaining = Math.ceil((expire - Date.now()) / 1000);
            return remaining > 0 ? remaining : -2;
        }),

        // Hash 操作
        hget: vi.fn(async (key: string, field: string) => {
            return sharedHashes.get(key)?.get(field) ?? null;
        }),
        hset: vi.fn(async (key: string, ...args: (string | number | Buffer)[]) => {
            if (!sharedHashes.has(key)) {
                sharedHashes.set(key, new Map());
            }
            const hash = sharedHashes.get(key)!;
            let added = 0;
            for (let i = 0; i < args.length; i += 2) {
                const field = String(args[i]);
                const value = String(args[i + 1]);
                if (!hash.has(field)) added++;
                hash.set(field, value);
            }
            return added;
        }),
        hdel: vi.fn(async (key: string, ...fields: string[]) => {
            const hash = sharedHashes.get(key);
            if (!hash) return 0;
            let count = 0;
            for (const field of fields) {
                if (hash.delete(field)) count++;
            }
            return count;
        }),
        hgetall: vi.fn(async (key: string) => {
            const hash = sharedHashes.get(key);
            if (!hash) return {};
            const result: Record<string, string> = {};
            for (const [k, v] of hash) {
                result[k] = v;
            }
            return result;
        }),
        hmset: vi.fn(async (key: string, ...args: (string | number | Buffer)[]) => {
            if (!sharedHashes.has(key)) {
                sharedHashes.set(key, new Map());
            }
            const hash = sharedHashes.get(key)!;
            for (let i = 0; i < args.length; i += 2) {
                hash.set(String(args[i]), String(args[i + 1]));
            }
            return 'OK';
        }),

        // Set 操作
        sadd: vi.fn(async (key: string, ...members: string[]) => {
            if (!sharedSets.has(key)) {
                sharedSets.set(key, new Set());
            }
            const set = sharedSets.get(key)!;
            let added = 0;
            for (const member of members) {
                if (!set.has(member)) {
                    set.add(member);
                    added++;
                }
            }
            return added;
        }),
        srem: vi.fn(async (key: string, ...members: string[]) => {
            const set = sharedSets.get(key);
            if (!set) return 0;
            let removed = 0;
            for (const member of members) {
                if (set.delete(member)) removed++;
            }
            return removed;
        }),
        smembers: vi.fn(async (key: string) => {
            return Array.from(sharedSets.get(key) ?? []);
        }),

        // Pub/Sub - 使用共享的处理器集合
        publish: vi.fn(async (channel: string, message: string) => {
            const handlers = sharedPubSubHandlers.get(channel);
            if (handlers) {
                for (const handler of handlers) {
                    handler(channel, message);
                }
            }
            return handlers?.size ?? 0;
        }),
        subscribe: vi.fn(async (channel: string) => {
            // 注册 message 事件处理器到共享的 pub/sub 处理器
            const messageHandlers = eventHandlers.get('message');
            if (messageHandlers) {
                if (!sharedPubSubHandlers.has(channel)) {
                    sharedPubSubHandlers.set(channel, new Set());
                }
                for (const handler of messageHandlers) {
                    sharedPubSubHandlers.get(channel)!.add(handler as (channel: string, message: string) => void);
                }
            }
            return 1;
        }),
        psubscribe: vi.fn(async () => 1),
        unsubscribe: vi.fn(async (channel: string) => {
            sharedPubSubHandlers.delete(channel);
            return 1;
        }),
        punsubscribe: vi.fn(async () => 1),

        // 事件
        on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
            if (!eventHandlers.has(event)) {
                eventHandlers.set(event, new Set());
            }
            eventHandlers.get(event)!.add(callback);
        }),
        off: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
            eventHandlers.get(event)?.delete(callback);
        }),

        // Lua 脚本
        eval: vi.fn(async (script: string, numkeys: number, ...args: (string | number)[]) => {
            const key = String(args[0]);
            const token = String(args[1]);

            // 释放锁脚本
            if (script.includes('redis.call("del"')) {
                if (sharedStore.get(key) === token) {
                    sharedStore.delete(key);
                    return 1;
                }
                return 0;
            }

            // 扩展锁脚本
            if (script.includes('redis.call("pexpire"')) {
                if (sharedStore.get(key) === token) {
                    const ttlMs = Number(args[2]);
                    sharedExpireTimes.set(key, Date.now() + ttlMs);
                    return 1;
                }
                return 0;
            }

            return 0;
        }),

        // 连接
        duplicate: vi.fn(() => createMockRedisClient()),
        quit: vi.fn(async () => 'OK'),
        disconnect: vi.fn()
    };

    return mockClient;
}

describe('RedisAdapter', () => {
    let adapter: RedisAdapter;
    let mockClient: RedisClient;

    beforeEach(async () => {
        clearSharedState();
        mockClient = createMockRedisClient();
        adapter = new RedisAdapter({
            factory: () => mockClient,
            prefix: 'test:'
        });
        await adapter.connect();
    });

    afterEach(async () => {
        await adapter.disconnect();
    });

    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    describe('lifecycle', () => {
        it('should connect and disconnect', async () => {
            const newAdapter = new RedisAdapter({
                factory: () => createMockRedisClient()
            });
            expect(newAdapter.isConnected()).toBe(false);

            await newAdapter.connect();
            expect(newAdapter.isConnected()).toBe(true);

            await newAdapter.disconnect();
            expect(newAdapter.isConnected()).toBe(false);
        });

        it('should not throw on double connect', async () => {
            await adapter.connect();
            expect(adapter.isConnected()).toBe(true);
        });

        it('should not throw on double disconnect', async () => {
            await adapter.disconnect();
            await adapter.disconnect();
            expect(adapter.isConnected()).toBe(false);
        });
    });

    // =========================================================================
    // 服务器注册 | Server Registry
    // =========================================================================

    describe('server registry', () => {
        const createServer = (id: string): ServerRegistration => ({
            serverId: id,
            address: 'localhost',
            port: 3000,
            roomCount: 0,
            playerCount: 0,
            capacity: 100,
            status: 'online',
            lastHeartbeat: Date.now()
        });

        it('should register and get server', async () => {
            const server = createServer('server-1');
            await adapter.registerServer(server);

            const result = await adapter.getServer('server-1');
            expect(result).toBeDefined();
            expect(result?.serverId).toBe('server-1');
            expect(result?.address).toBe('localhost');
            expect(result?.port).toBe(3000);
        });

        it('should get all online servers', async () => {
            await adapter.registerServer(createServer('server-1'));
            await adapter.registerServer(createServer('server-2'));

            const servers = await adapter.getServers();
            expect(servers).toHaveLength(2);
        });

        it('should unregister server', async () => {
            await adapter.registerServer(createServer('server-1'));
            await adapter.unregisterServer('server-1');

            const result = await adapter.getServer('server-1');
            expect(result).toBeNull();
        });

        it('should update server heartbeat', async () => {
            const server = createServer('server-1');
            await adapter.registerServer(server);

            await new Promise(r => setTimeout(r, 10));
            await adapter.heartbeat('server-1');

            const result = await adapter.getServer('server-1');
            expect(result?.lastHeartbeat).toBeGreaterThan(server.lastHeartbeat);
        });

        it('should update server info', async () => {
            await adapter.registerServer(createServer('server-1'));
            await adapter.updateServer('server-1', { roomCount: 5, playerCount: 10 });

            const result = await adapter.getServer('server-1');
            expect(result?.roomCount).toBe(5);
            expect(result?.playerCount).toBe(10);
        });

        it('should publish draining event when status changes', async () => {
            await adapter.registerServer(createServer('server-1'));

            const handler = vi.fn();
            await adapter.subscribe('server:draining', handler);

            await adapter.updateServer('server-1', { status: 'draining' });

            expect(handler).toHaveBeenCalled();
        });
    });

    // =========================================================================
    // 房间注册 | Room Registry
    // =========================================================================

    describe('room registry', () => {
        const createRoom = (id: string, serverId = 'server-1'): RoomRegistration => ({
            roomId: id,
            roomType: 'game',
            serverId,
            serverAddress: 'localhost:3000',
            playerCount: 0,
            maxPlayers: 4,
            isLocked: false,
            metadata: {},
            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        beforeEach(async () => {
            await adapter.registerServer({
                serverId: 'server-1',
                address: 'localhost',
                port: 3000,
                roomCount: 0,
                playerCount: 0,
                capacity: 100,
                status: 'online',
                lastHeartbeat: Date.now()
            });
        });

        it('should register and get room', async () => {
            const room = createRoom('room-1');
            await adapter.registerRoom(room);

            const result = await adapter.getRoom('room-1');
            expect(result).toBeDefined();
            expect(result?.roomId).toBe('room-1');
            expect(result?.roomType).toBe('game');
        });

        it('should unregister room', async () => {
            await adapter.registerRoom(createRoom('room-1'));
            await adapter.unregisterRoom('room-1');

            const result = await adapter.getRoom('room-1');
            expect(result).toBeNull();
        });

        it('should update room info', async () => {
            await adapter.registerRoom(createRoom('room-1'));
            await adapter.updateRoom('room-1', { playerCount: 2, isLocked: true });

            const result = await adapter.getRoom('room-1');
            expect(result?.playerCount).toBe(2);
            expect(result?.isLocked).toBe(true);
        });

        it('should query rooms by type', async () => {
            await adapter.registerRoom(createRoom('room-1'));
            await adapter.registerRoom({ ...createRoom('room-2'), roomType: 'lobby' });

            const games = await adapter.queryRooms({ roomType: 'game' });
            expect(games).toHaveLength(1);
            expect(games[0].roomId).toBe('room-1');
        });

        it('should query rooms with space', async () => {
            await adapter.registerRoom(createRoom('room-1'));
            await adapter.registerRoom({ ...createRoom('room-2'), playerCount: 4 });

            const available = await adapter.queryRooms({ hasSpace: true });
            expect(available).toHaveLength(1);
            expect(available[0].roomId).toBe('room-1');
        });

        it('should query unlocked rooms', async () => {
            await adapter.registerRoom(createRoom('room-1'));
            await adapter.registerRoom({ ...createRoom('room-2'), isLocked: true });

            const unlocked = await adapter.queryRooms({ notLocked: true });
            expect(unlocked).toHaveLength(1);
            expect(unlocked[0].roomId).toBe('room-1');
        });

        it('should support pagination', async () => {
            await adapter.registerRoom(createRoom('room-1'));
            await adapter.registerRoom(createRoom('room-2'));
            await adapter.registerRoom(createRoom('room-3'));

            const page1 = await adapter.queryRooms({ limit: 2 });
            expect(page1).toHaveLength(2);

            const page2 = await adapter.queryRooms({ offset: 2, limit: 2 });
            expect(page2).toHaveLength(1);
        });

        it('should find available room', async () => {
            await adapter.registerRoom({ ...createRoom('room-1'), playerCount: 4 }); // full
            await adapter.registerRoom({ ...createRoom('room-2'), isLocked: true }); // locked
            await adapter.registerRoom(createRoom('room-3')); // available

            const available = await adapter.findAvailableRoom('game');
            expect(available?.roomId).toBe('room-3');
        });

        it('should get rooms by server', async () => {
            await adapter.registerServer({
                serverId: 'server-2',
                address: 'localhost',
                port: 3001,
                roomCount: 0,
                playerCount: 0,
                capacity: 100,
                status: 'online',
                lastHeartbeat: Date.now()
            });

            await adapter.registerRoom(createRoom('room-1', 'server-1'));
            await adapter.registerRoom(createRoom('room-2', 'server-2'));

            const server1Rooms = await adapter.getRoomsByServer('server-1');
            expect(server1Rooms).toHaveLength(1);
            expect(server1Rooms[0].roomId).toBe('room-1');
        });

        it('should publish lock/unlock events', async () => {
            await adapter.registerRoom(createRoom('room-1'));

            const lockHandler = vi.fn();
            const unlockHandler = vi.fn();
            await adapter.subscribe('room:locked', lockHandler);
            await adapter.subscribe('room:unlocked', unlockHandler);

            await adapter.updateRoom('room-1', { isLocked: true });
            expect(lockHandler).toHaveBeenCalled();

            await adapter.updateRoom('room-1', { isLocked: false });
            expect(unlockHandler).toHaveBeenCalled();
        });
    });

    // =========================================================================
    // 快照 | Snapshots
    // =========================================================================

    describe('snapshots', () => {
        it('should save and load snapshot', async () => {
            const snapshot = {
                roomId: 'room-1',
                roomType: 'game',
                state: { score: 100 },
                players: [{ id: 'player-1', data: { name: 'Alice' } }],
                version: 1,
                timestamp: Date.now()
            };

            await adapter.saveSnapshot(snapshot);
            const result = await adapter.loadSnapshot('room-1');

            expect(result).toEqual(snapshot);
        });

        it('should return null for non-existent snapshot', async () => {
            const result = await adapter.loadSnapshot('non-existent');
            expect(result).toBeNull();
        });

        it('should delete snapshot', async () => {
            await adapter.saveSnapshot({
                roomId: 'room-1',
                roomType: 'game',
                state: {},
                players: [],
                version: 1,
                timestamp: Date.now()
            });

            await adapter.deleteSnapshot('room-1');
            const result = await adapter.loadSnapshot('room-1');
            expect(result).toBeNull();
        });
    });

    // =========================================================================
    // 发布/订阅 | Pub/Sub
    // =========================================================================

    describe('pub/sub', () => {
        it('should publish and subscribe to events', async () => {
            const handler = vi.fn();
            await adapter.subscribe('room:created', handler);

            const event: DistributedEvent = {
                type: 'room:created',
                serverId: 'server-1',
                roomId: 'room-1',
                payload: { roomType: 'game' },
                timestamp: Date.now()
            };

            await adapter.publish(event);

            expect(handler).toHaveBeenCalledWith(event);
        });

        it('should support wildcard subscription', async () => {
            const handler = vi.fn();
            await adapter.subscribe('*', handler);

            await adapter.publish({
                type: 'room:created',
                serverId: 'server-1',
                payload: {},
                timestamp: Date.now()
            });

            await adapter.publish({
                type: 'server:online',
                serverId: 'server-1',
                payload: {},
                timestamp: Date.now()
            });

            expect(handler).toHaveBeenCalledTimes(2);
        });

        it('should unsubscribe correctly', async () => {
            const handler = vi.fn();
            const unsub = await adapter.subscribe('room:created', handler);

            unsub();

            await adapter.publish({
                type: 'room:created',
                serverId: 'server-1',
                payload: {},
                timestamp: Date.now()
            });

            expect(handler).not.toHaveBeenCalled();
        });

        it('should send to room', async () => {
            await adapter.registerServer({
                serverId: 'server-1',
                address: 'localhost',
                port: 3000,
                roomCount: 0,
                playerCount: 0,
                capacity: 100,
                status: 'online',
                lastHeartbeat: Date.now()
            });

            await adapter.registerRoom({
                roomId: 'room-1',
                roomType: 'game',
                serverId: 'server-1',
                serverAddress: 'localhost:3000',
                playerCount: 0,
                maxPlayers: 4,
                isLocked: false,
                metadata: {},
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            const handler = vi.fn();
            await adapter.subscribe('room:message', handler);

            await adapter.sendToRoom('room-1', 'chat', { text: 'hello' }, 'player-1');

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'room:message',
                    roomId: 'room-1',
                    payload: {
                        messageType: 'chat',
                        data: { text: 'hello' },
                        playerId: 'player-1'
                    }
                })
            );
        });
    });

    // =========================================================================
    // 分布式锁 | Distributed Locks
    // =========================================================================

    describe('distributed locks', () => {
        it('should acquire and release lock', async () => {
            const acquired = await adapter.acquireLock('test-lock', 5000);
            expect(acquired).toBe(true);

            await adapter.releaseLock('test-lock');

            const acquiredAgain = await adapter.acquireLock('test-lock', 5000);
            expect(acquiredAgain).toBe(true);
        });

        it('should fail to acquire held lock', async () => {
            await adapter.acquireLock('test-lock', 5000);

            const acquiredAgain = await adapter.acquireLock('test-lock', 5000);
            expect(acquiredAgain).toBe(false);
        });

        it('should extend lock', async () => {
            await adapter.acquireLock('test-lock', 100);

            const extended = await adapter.extendLock('test-lock', 5000);
            expect(extended).toBe(true);
        });

        it('should fail to extend non-existent lock', async () => {
            const extended = await adapter.extendLock('non-existent', 5000);
            expect(extended).toBe(false);
        });

        it('should fail to release lock without token', async () => {
            // 没有获取锁就释放，应该什么都不做
            await adapter.releaseLock('test-lock');

            // 仍然可以获取锁
            const acquired = await adapter.acquireLock('test-lock', 5000);
            expect(acquired).toBe(true);
        });
    });

    // =========================================================================
    // 错误处理 | Error Handling
    // =========================================================================

    describe('error handling', () => {
        it('should throw when not connected', async () => {
            const disconnected = new RedisAdapter({
                factory: () => createMockRedisClient()
            });

            await expect(disconnected.registerServer({} as ServerRegistration))
                .rejects.toThrow('RedisAdapter is not connected');
        });
    });

    // =========================================================================
    // 配置 | Configuration
    // =========================================================================

    describe('configuration', () => {
        it('should use default prefix', async () => {
            const testMockClient = createMockRedisClient();
            const defaultAdapter = new RedisAdapter({
                factory: () => testMockClient
            });
            await defaultAdapter.connect();

            await defaultAdapter.registerServer({
                serverId: 'server-1',
                address: 'localhost',
                port: 3000,
                roomCount: 0,
                playerCount: 0,
                capacity: 100,
                status: 'online',
                lastHeartbeat: Date.now()
            });

            // hmset 应该被调用，key 应该包含默认前缀 'dist:'
            expect(testMockClient.hmset).toHaveBeenCalled();

            await defaultAdapter.disconnect();
        });

        it('should use custom prefix', async () => {
            const testMockClient = createMockRedisClient();
            const customAdapter = new RedisAdapter({
                factory: () => testMockClient,
                prefix: 'game:'
            });
            await customAdapter.connect();

            await customAdapter.registerServer({
                serverId: 'server-1',
                address: 'localhost',
                port: 3000,
                roomCount: 0,
                playerCount: 0,
                capacity: 100,
                status: 'online',
                lastHeartbeat: Date.now()
            });

            // hmset 应该被调用
            expect(testMockClient.hmset).toHaveBeenCalled();

            await customAdapter.disconnect();
        });
    });
});
