/**
 * @zh MemoryAdapter 单元测试
 * @en MemoryAdapter unit tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryAdapter } from '../adapters/MemoryAdapter.js';
import type { ServerRegistration, RoomRegistration, DistributedEvent } from '../types.js';

describe('MemoryAdapter', () => {
    let adapter: MemoryAdapter;

    beforeEach(async () => {
        adapter = new MemoryAdapter({ enableTtlCheck: false });
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
            const newAdapter = new MemoryAdapter();
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
        });

        it('should get all online servers', async () => {
            await adapter.registerServer(createServer('server-1'));
            await adapter.registerServer(createServer('server-2'));

            const servers = await adapter.getServers();
            expect(servers).toHaveLength(2);
        });

        it('should filter out offline servers', async () => {
            const server1 = createServer('server-1');
            const server2 = { ...createServer('server-2'), status: 'offline' as const };

            await adapter.registerServer(server1);
            await adapter.registerServer(server2);

            const servers = await adapter.getServers();
            expect(servers).toHaveLength(1);
            expect(servers[0].serverId).toBe('server-1');
        });

        it('should unregister server and cleanup rooms', async () => {
            const server = createServer('server-1');
            await adapter.registerServer(server);

            const room: RoomRegistration = {
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
            };
            await adapter.registerRoom(room);

            await adapter.unregisterServer('server-1');

            const serverResult = await adapter.getServer('server-1');
            expect(serverResult).toBeNull();

            const roomResult = await adapter.getRoom('room-1');
            expect(roomResult).toBeNull();
        });

        it('should update server heartbeat', async () => {
            const server = createServer('server-1');
            await adapter.registerServer(server);

            const before = (await adapter.getServer('server-1'))?.lastHeartbeat;
            await new Promise(r => setTimeout(r, 10));
            await adapter.heartbeat('server-1');
            const after = (await adapter.getServer('server-1'))?.lastHeartbeat;

            expect(after).toBeGreaterThan(before!);
        });

        it('should update server info', async () => {
            const server = createServer('server-1');
            await adapter.registerServer(server);

            await adapter.updateServer('server-1', { roomCount: 5, playerCount: 10 });

            const result = await adapter.getServer('server-1');
            expect(result?.roomCount).toBe(5);
            expect(result?.playerCount).toBe(10);
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
        });

        it('should update server room count on register', async () => {
            await adapter.registerRoom(createRoom('room-1'));
            await adapter.registerRoom(createRoom('room-2'));

            const server = await adapter.getServer('server-1');
            expect(server?.roomCount).toBe(2);
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

        it('should query rooms by metadata', async () => {
            await adapter.registerRoom({ ...createRoom('room-1'), metadata: { map: 'forest' } });
            await adapter.registerRoom({ ...createRoom('room-2'), metadata: { map: 'desert' } });

            const forest = await adapter.queryRooms({ metadata: { map: 'forest' } });
            expect(forest).toHaveLength(1);
            expect(forest[0].roomId).toBe('room-1');
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

        it('should return null when no available room', async () => {
            await adapter.registerRoom({ ...createRoom('room-1'), playerCount: 4 });

            const available = await adapter.findAvailableRoom('game');
            expect(available).toBeNull();
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

        it('should handle errors in handlers gracefully', async () => {
            const errorHandler = vi.fn(() => { throw new Error('Test error'); });
            const normalHandler = vi.fn();

            await adapter.subscribe('room:created', errorHandler);
            await adapter.subscribe('room:created', normalHandler);

            await adapter.publish({
                type: 'room:created',
                serverId: 'server-1',
                payload: {},
                timestamp: Date.now()
            });

            expect(errorHandler).toHaveBeenCalled();
            expect(normalHandler).toHaveBeenCalled();
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

        it('should acquire expired lock', async () => {
            await adapter.acquireLock('test-lock', 1);
            await new Promise(r => setTimeout(r, 10));

            const acquired = await adapter.acquireLock('test-lock', 5000);
            expect(acquired).toBe(true);
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
    });

    // =========================================================================
    // TTL 检查 | TTL Check
    // =========================================================================

    describe('TTL check', () => {
        it('should mark server offline after TTL expires', async () => {
            const ttlAdapter = new MemoryAdapter({
                serverTtl: 50,
                ttlCheckInterval: 20,
                enableTtlCheck: true
            });
            await ttlAdapter.connect();

            const handler = vi.fn();
            await ttlAdapter.subscribe('server:offline', handler);

            await ttlAdapter.registerServer({
                serverId: 'server-1',
                address: 'localhost',
                port: 3000,
                roomCount: 0,
                playerCount: 0,
                capacity: 100,
                status: 'online',
                lastHeartbeat: Date.now()
            });

            await new Promise(r => setTimeout(r, 100));

            expect(handler).toHaveBeenCalled();
            const server = await ttlAdapter.getServer('server-1');
            expect(server?.status).toBe('offline');

            await ttlAdapter.disconnect();
        });
    });

    // =========================================================================
    // 测试辅助方法 | Test Helper Methods
    // =========================================================================

    describe('test helpers', () => {
        it('should clear all data', async () => {
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

            adapter._clear();

            const servers = await adapter.getServers();
            expect(servers).toHaveLength(0);
        });

        it('should expose internal state for testing', () => {
            const state = adapter._getState();
            expect(state.servers).toBeDefined();
            expect(state.rooms).toBeDefined();
            expect(state.snapshots).toBeDefined();
        });
    });

    // =========================================================================
    // 错误处理 | Error Handling
    // =========================================================================

    describe('error handling', () => {
        it('should throw when not connected', async () => {
            const disconnected = new MemoryAdapter();

            await expect(disconnected.registerServer({} as ServerRegistration))
                .rejects.toThrow('MemoryAdapter is not connected');
        });
    });
});
