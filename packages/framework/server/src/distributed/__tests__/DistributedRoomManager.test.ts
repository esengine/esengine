/**
 * @zh DistributedRoomManager 单元测试
 * @en DistributedRoomManager unit tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DistributedRoomManager } from '../DistributedRoomManager.js';
import { MemoryAdapter } from '../adapters/MemoryAdapter.js';
import { Room } from '../../room/Room.js';

class TestRoom extends Room {
    maxPlayers = 4;
}

describe('DistributedRoomManager', () => {
    let adapter: MemoryAdapter;
    let manager: DistributedRoomManager;
    const mockSendFn = vi.fn();

    beforeEach(async () => {
        vi.clearAllMocks();
        adapter = new MemoryAdapter({ enableTtlCheck: false });

        manager = new DistributedRoomManager(adapter, {
            serverId: 'server-1',
            serverAddress: 'localhost',
            serverPort: 3000,
            heartbeatInterval: 60000, // 长间隔避免测试中触发
            snapshotInterval: 0 // 禁用自动快照
        }, mockSendFn);

        manager.define('test', TestRoom);
        await manager.start();
    });

    afterEach(async () => {
        await manager.stop(false);
    });

    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    describe('lifecycle', () => {
        it('should start and register server', async () => {
            const servers = await adapter.getServers();
            expect(servers).toHaveLength(1);
            expect(servers[0].serverId).toBe('server-1');
            expect(servers[0].status).toBe('online');
        });

        it('should stop and unregister server', async () => {
            await manager.stop(false);

            const servers = await adapter.getServers();
            expect(servers).toHaveLength(0);
        });

        it('should expose serverId and config', () => {
            expect(manager.serverId).toBe('server-1');
            expect(manager.config.serverAddress).toBe('localhost');
            expect(manager.config.serverPort).toBe(3000);
        });
    });

    // =========================================================================
    // 房间操作 | Room Operations
    // =========================================================================

    describe('room operations', () => {
        it('should create room and register to distributed system', async () => {
            const room = await manager.create('test');

            expect(room).toBeDefined();
            expect(room?.id).toBeDefined();

            const registration = await adapter.getRoom(room!.id);
            expect(registration).toBeDefined();
            expect(registration?.roomType).toBe('test');
            expect(registration?.serverId).toBe('server-1');
        });

        it('should update room count on server after creating room', async () => {
            await manager.create('test');
            await manager.create('test');

            const server = await adapter.getServer('server-1');
            expect(server?.roomCount).toBe(2);
        });

        it('should unregister room from distributed system on dispose', async () => {
            const room = await manager.create('test');
            const roomId = room!.id;

            room!.dispose();

            // 等待异步注销完成 | Wait for async unregister
            await new Promise(r => setTimeout(r, 50));

            const registration = await adapter.getRoom(roomId);
            expect(registration).toBeNull();
        });

        it('should update player count in distributed registration', async () => {
            const mockConn = { send: vi.fn() };
            const result = await manager.joinOrCreate('test', 'player-1', mockConn);

            expect(result).toBeDefined();

            const registration = await adapter.getRoom(result!.room.id);
            expect(registration?.playerCount).toBe(1);
        });
    });

    // =========================================================================
    // 分布式路由 | Distributed Routing
    // =========================================================================

    describe('distributed routing', () => {
        it('should route to local room', async () => {
            const room = await manager.create('test');

            const result = await manager.route({ roomId: room!.id, playerId: 'p1' });

            expect(result.type).toBe('local');
            expect(result.roomId).toBe(room!.id);
        });

        it('should return unavailable for non-existent room', async () => {
            const result = await manager.route({ roomId: 'non-existent', playerId: 'p1' });

            expect(result.type).toBe('unavailable');
        });

        it('should return create when no available room exists', async () => {
            const result = await manager.route({ roomType: 'test', playerId: 'p1' });

            expect(result.type).toBe('create');
        });

        it('should return local for available local room', async () => {
            const room = await manager.create('test');

            const result = await manager.route({ roomType: 'test', playerId: 'p1' });

            expect(result.type).toBe('local');
            expect(result.roomId).toBe(room!.id);
        });

        it('should return redirect for room on another server', async () => {
            // 直接在适配器中注册另一个服务器的房间 | Register room from another server directly
            await adapter.registerServer({
                serverId: 'server-2',
                address: 'other-host',
                port: 3001,
                roomCount: 1,
                playerCount: 0,
                capacity: 100,
                status: 'online',
                lastHeartbeat: Date.now()
            });

            await adapter.registerRoom({
                roomId: 'remote-room-1',
                roomType: 'test',
                serverId: 'server-2',
                serverAddress: 'other-host:3001',
                playerCount: 0,
                maxPlayers: 4,
                isLocked: false,
                metadata: {},
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            const result = await manager.route({ roomType: 'test', playerId: 'p1' });

            expect(result.type).toBe('redirect');
            expect(result.serverAddress).toBe('other-host:3001');
            expect(result.roomId).toBe('remote-room-1');
        });
    });

    // =========================================================================
    // 分布式加入创建 | Distributed Join/Create
    // =========================================================================

    describe('joinOrCreateDistributed', () => {
        it('should create room locally when none exists', async () => {
            const mockConn = { send: vi.fn() };
            const result = await manager.joinOrCreateDistributed('test', 'player-1', mockConn);

            expect(result).not.toBeNull();
            expect('room' in result!).toBe(true);
            if ('room' in result!) {
                expect(result.room).toBeDefined();
                expect(result.player.id).toBe('player-1');
            }
        });

        it('should join existing local room', async () => {
            const room = await manager.create('test');
            const mockConn = { send: vi.fn() };

            const result = await manager.joinOrCreateDistributed('test', 'player-1', mockConn);

            expect(result).not.toBeNull();
            expect('room' in result!).toBe(true);
            if ('room' in result!) {
                expect(result.room.id).toBe(room!.id);
            }
        });

        it('should return redirect for remote room', async () => {
            await adapter.registerServer({
                serverId: 'server-2',
                address: 'remote',
                port: 3001,
                roomCount: 1,
                playerCount: 0,
                capacity: 100,
                status: 'online',
                lastHeartbeat: Date.now()
            });

            await adapter.registerRoom({
                roomId: 'remote-room',
                roomType: 'test',
                serverId: 'server-2',
                serverAddress: 'remote:3001',
                playerCount: 0,
                maxPlayers: 4,
                isLocked: false,
                metadata: {},
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            const mockConn = { send: vi.fn() };
            const result = await manager.joinOrCreateDistributed('test', 'player-1', mockConn);

            expect(result).not.toBeNull();
            expect('redirect' in result!).toBe(true);
            if ('redirect' in result!) {
                expect(result.redirect).toBe('remote:3001');
            }
        });
    });

    // =========================================================================
    // 状态快照 | State Snapshots
    // =========================================================================

    describe('snapshots', () => {
        it('should save room snapshot', async () => {
            const room = await manager.create('test', { state: { score: 100 } });

            await manager.saveSnapshot(room!.id);

            const snapshot = await adapter.loadSnapshot(room!.id);
            expect(snapshot).toBeDefined();
            expect(snapshot?.roomId).toBe(room!.id);
            expect(snapshot?.roomType).toBe('test');
        });

        it('should restore room from snapshot', async () => {
            // 手动创建快照 | Manually create snapshot
            await adapter.saveSnapshot({
                roomId: 'restored-room',
                roomType: 'test',
                state: { score: 500 },
                players: [],
                version: 1,
                timestamp: Date.now()
            });

            const restored = await manager.restoreFromSnapshot('restored-room');

            expect(restored).toBe(true);

            const room = manager.getRoom('restored-room');
            expect(room).toBeDefined();
        });

        it('should return false when snapshot not found', async () => {
            const restored = await manager.restoreFromSnapshot('non-existent');
            expect(restored).toBe(false);
        });
    });

    // =========================================================================
    // 跨服务器通信 | Cross-Server Communication
    // =========================================================================

    describe('cross-server communication', () => {
        it('should send message to remote room', async () => {
            const handler = vi.fn();
            await adapter.subscribe('room:message', handler);

            await adapter.registerRoom({
                roomId: 'remote-room',
                roomType: 'test',
                serverId: 'server-2',
                serverAddress: 'remote:3001',
                playerCount: 1,
                maxPlayers: 4,
                isLocked: false,
                metadata: {},
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            await manager.sendToRemoteRoom('remote-room', 'chat', { text: 'hello' }, 'player-1');

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'room:message',
                    roomId: 'remote-room',
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
    // 查询方法 | Query Methods
    // =========================================================================

    describe('query methods', () => {
        it('should get all servers', async () => {
            await adapter.registerServer({
                serverId: 'server-2',
                address: 'other',
                port: 3001,
                roomCount: 0,
                playerCount: 0,
                capacity: 100,
                status: 'online',
                lastHeartbeat: Date.now()
            });

            const servers = await manager.getServers();
            expect(servers).toHaveLength(2);
        });

        it('should query distributed rooms', async () => {
            await manager.create('test');

            await adapter.registerRoom({
                roomId: 'remote-room',
                roomType: 'test',
                serverId: 'server-2',
                serverAddress: 'remote:3001',
                playerCount: 0,
                maxPlayers: 4,
                isLocked: false,
                metadata: {},
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            const rooms = await manager.queryDistributedRooms({ roomType: 'test' });
            expect(rooms).toHaveLength(2);
        });
    });

    // =========================================================================
    // 事件订阅 | Event Subscription
    // =========================================================================

    describe('event subscription', () => {
        it('should handle room messages for local rooms', async () => {
            const room = await manager.create('test');
            const handleSpy = vi.spyOn(room!, '_handleMessage');

            await adapter.publish({
                type: 'room:message',
                serverId: 'server-2',
                roomId: room!.id,
                payload: {
                    messageType: 'test',
                    data: { foo: 'bar' },
                    playerId: 'player-1'
                },
                timestamp: Date.now()
            });

            expect(handleSpy).toHaveBeenCalledWith('test', { foo: 'bar' }, 'player-1');
        });
    });

    // =========================================================================
    // 优雅关闭 | Graceful Shutdown
    // =========================================================================

    describe('graceful shutdown', () => {
        it('should mark server as draining on graceful stop', async () => {
            const statusHandler = vi.fn();

            // 创建新的管理器用于此测试 | Create new manager for this test
            const newAdapter = new MemoryAdapter({ enableTtlCheck: false });
            const newManager = new DistributedRoomManager(newAdapter, {
                serverId: 'graceful-server',
                serverAddress: 'localhost',
                serverPort: 3002,
                heartbeatInterval: 60000,
                snapshotInterval: 0
            }, mockSendFn);

            newManager.define('test', TestRoom);
            await newManager.start();

            // 监听状态变化 | Watch for status changes
            // 由于我们在 stop(true) 中调用 updateServer，可以检查最终状态
            await newManager.stop(true);

            // 验证服务器已注销 | Verify server is unregistered
            const server = await newAdapter.getServer('graceful-server');
            expect(server).toBeNull();
        });

        it('should save all snapshots on graceful stop', async () => {
            const newAdapter = new MemoryAdapter({ enableTtlCheck: false });
            const newManager = new DistributedRoomManager(newAdapter, {
                serverId: 'snapshot-server',
                serverAddress: 'localhost',
                serverPort: 3003,
                heartbeatInterval: 60000,
                snapshotInterval: 0
            }, mockSendFn);

            newManager.define('test', TestRoom);
            await newManager.start();

            // 创建房间 | Create rooms
            const room1 = await newManager.create('test');
            const room2 = await newManager.create('test');

            await newManager.stop(true);

            // 验证快照已保存 | Verify snapshots are saved
            const snapshot1 = await newAdapter.loadSnapshot(room1!.id);
            const snapshot2 = await newAdapter.loadSnapshot(room2!.id);

            expect(snapshot1).toBeDefined();
            expect(snapshot2).toBeDefined();
        });
    });
});
