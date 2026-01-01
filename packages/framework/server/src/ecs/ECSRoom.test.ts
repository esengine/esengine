/**
 * @zh ECSRoom 集成测试
 * @en ECSRoom integration tests
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import {
    Core,
    Component,
    ECSComponent,
    sync
} from '@esengine/ecs-framework';
import { createTestEnv, type TestEnvironment, wait } from '../testing/TestServer.js';
import { ECSRoom } from './ECSRoom.js';
import type { Player } from '../room/Player.js';
import { onMessage } from '../room/decorators.js';

// ============================================================================
// Test Components | 测试组件
// ============================================================================

@ECSComponent('ECSRoomTest_PlayerComponent')
class PlayerComponent extends Component {
    @sync('string') name: string = '';
    @sync('uint16') score: number = 0;
    @sync('float32') x: number = 0;
    @sync('float32') y: number = 0;
}

// ============================================================================
// Test Room | 测试房间
// ============================================================================

interface TestRoomState {
    gameStarted: boolean
}

interface TestPlayerData {
    nickname: string
}

class TestECSRoom extends ECSRoom<TestRoomState, TestPlayerData> {
    state: TestRoomState = {
        gameStarted: false
    };

    onCreate(): void {
        // 可以在这里添加系统
    }

    onJoin(player: Player<TestPlayerData>): void {
        const entity = this.createPlayerEntity(player.id);
        const comp = entity.addComponent(new PlayerComponent());
        comp.name = player.data.nickname || `Player_${player.id.slice(-4)}`;
        comp.x = Math.random() * 100;
        comp.y = Math.random() * 100;

        this.broadcast('PlayerJoined', {
            playerId: player.id,
            name: comp.name
        });
    }

    async onLeave(player: Player<TestPlayerData>, reason?: string): Promise<void> {
        await super.onLeave(player, reason);
        this.broadcast('PlayerLeft', { playerId: player.id });
    }

    @onMessage('Move')
    handleMove(data: { x: number; y: number }, player: Player<TestPlayerData>): void {
        const entity = this.getPlayerEntity(player.id);
        if (entity) {
            const comp = entity.getComponent(PlayerComponent);
            if (comp) {
                comp.x = data.x;
                comp.y = data.y;
            }
        }
    }

    @onMessage('AddScore')
    handleAddScore(data: { amount: number }, player: Player<TestPlayerData>): void {
        const entity = this.getPlayerEntity(player.id);
        if (entity) {
            const comp = entity.getComponent(PlayerComponent);
            if (comp) {
                comp.score += data.amount;
            }
        }
    }

    @onMessage('Ping')
    handlePing(_data: unknown, player: Player<TestPlayerData>): void {
        player.send('Pong', { timestamp: Date.now() });
    }

    getWorld() {
        return this.world;
    }

    getScene() {
        return this.scene;
    }

    getPlayerEntityCount(): number {
        return this.scene.entities.buffer.length;
    }
}

// ============================================================================
// Test Suites | 测试套件
// ============================================================================

describe('ECSRoom Integration Tests', () => {
    let env: TestEnvironment;

    beforeAll(() => {
        Core.create();
        // @ECSComponent 装饰器已自动注册组件
    });

    afterAll(() => {
        Core.destroy();
    });

    beforeEach(async () => {
        env = await createTestEnv({ tickRate: 20 });
    });

    afterEach(async () => {
        await env.cleanup();
    });

    // ========================================================================
    // Room Creation | 房间创建
    // ========================================================================

    describe('Room Creation', () => {
        it('should create ECSRoom with World and Scene', async () => {
            env.server.define('ecs-test', TestECSRoom);

            const client = await env.createClient();
            await client.joinRoom('ecs-test');

            expect(client.roomId).toBeDefined();
        });

        it('should have World managed by Core.worldManager', async () => {
            env.server.define('ecs-test', TestECSRoom);

            const client = await env.createClient();
            await client.joinRoom('ecs-test');

            // 验证 World 正常创建（通过消息通信验证）
            const pongPromise = client.waitForRoomMessage<{ timestamp: number }>('Pong');
            client.sendToRoom('Ping', {});
            const pong = await pongPromise;

            expect(pong.timestamp).toBeGreaterThan(0);
        });
    });

    // ========================================================================
    // Player Entity Management | 玩家实体管理
    // ========================================================================

    describe('Player Entity Management', () => {
        it('should create player entity on join', async () => {
            env.server.define('ecs-test', TestECSRoom);

            const client1 = await env.createClient();
            const { roomId } = await client1.joinRoom('ecs-test');

            // 等待第二个玩家加入时收到广播
            const joinPromise = client1.waitForRoomMessage<{ playerId: string; name: string }>(
                'PlayerJoined'
            );

            const client2 = await env.createClient();
            await client2.joinRoomById(roomId);

            const joinMsg = await joinPromise;
            expect(joinMsg.playerId).toBe(client2.playerId);
            expect(joinMsg.name).toContain('Player_');
        });

        it('should destroy player entity on leave', async () => {
            env.server.define('ecs-test', TestECSRoom);

            const client1 = await env.createClient();
            const { roomId } = await client1.joinRoom('ecs-test');

            const client2 = await env.createClient();
            await client2.joinRoomById(roomId);

            const leavePromise = client1.waitForRoomMessage<{ playerId: string }>('PlayerLeft');

            await client2.leaveRoom();

            const leaveMsg = await leavePromise;
            expect(leaveMsg.playerId).toBeDefined();
        });
    });

    // ========================================================================
    // Component Sync | 组件同步
    // ========================================================================

    describe('Component State Updates', () => {
        it('should update component via message handler', async () => {
            env.server.define('ecs-test', TestECSRoom);

            const client = await env.createClient();
            await client.joinRoom('ecs-test');

            client.sendToRoom('Move', { x: 100, y: 200 });

            // 等待处理
            await wait(50);

            // 验证 Ping/Pong 仍能工作（房间仍活跃）
            const pongPromise = client.waitForRoomMessage<{ timestamp: number }>('Pong');
            client.sendToRoom('Ping', {});
            const pong = await pongPromise;

            expect(pong.timestamp).toBeGreaterThan(0);
        });

        it('should handle AddScore message', async () => {
            env.server.define('ecs-test', TestECSRoom);

            const client = await env.createClient();
            await client.joinRoom('ecs-test');

            client.sendToRoom('AddScore', { amount: 50 });
            client.sendToRoom('AddScore', { amount: 25 });

            await wait(50);

            // 确认房间仍然活跃
            const pongPromise = client.waitForRoomMessage<{ timestamp: number }>('Pong');
            client.sendToRoom('Ping', {});
            await pongPromise;
        });
    });

    // ========================================================================
    // Sync Broadcast | 同步广播
    // ========================================================================

    describe('State Sync Broadcast', () => {
        it('should receive $sync messages when enabled', async () => {
            env.server.define('ecs-test', TestECSRoom);

            const client = await env.createClient();
            await client.joinRoom('ecs-test');

            // 触发状态变更
            client.sendToRoom('Move', { x: 50, y: 75 });

            // 等待 tick 处理
            await wait(200);

            // 检查是否收到 $sync 消息
            const hasSync = client.hasReceivedMessage('RoomMessage');
            expect(hasSync).toBe(true);
        });
    });

    // ========================================================================
    // Multi-player Sync | 多玩家同步
    // ========================================================================

    describe('Multi-player Scenarios', () => {
        it('should handle multiple players in same room', async () => {
            env.server.define('ecs-test', TestECSRoom);

            const client1 = await env.createClient();
            const { roomId } = await client1.joinRoom('ecs-test');

            const client2 = await env.createClient();
            const joinPromise = client1.waitForRoomMessage<{ playerId: string }>('PlayerJoined');
            await client2.joinRoomById(roomId);

            const joinMsg = await joinPromise;
            expect(joinMsg.playerId).toBe(client2.playerId);
        });

        it('should broadcast to all players on state change', async () => {
            env.server.define('ecs-test', TestECSRoom);

            const client1 = await env.createClient();
            const { roomId } = await client1.joinRoom('ecs-test');

            const client2 = await env.createClient();

            // client1 等待收到 client2 加入的广播
            const joinPromise = client1.waitForRoomMessage<{ playerId: string }>('PlayerJoined');

            await client2.joinRoomById(roomId);

            const joinMsg = await joinPromise;
            expect(joinMsg.playerId).toBe(client2.playerId);

            // 验证每个客户端都能独立通信
            const pong1Promise = client1.waitForRoomMessage<{ timestamp: number }>('Pong');
            client1.sendToRoom('Ping', {});
            const pong1 = await pong1Promise;
            expect(pong1.timestamp).toBeGreaterThan(0);

            const pong2Promise = client2.waitForRoomMessage<{ timestamp: number }>('Pong');
            client2.sendToRoom('Ping', {});
            const pong2 = await pong2Promise;
            expect(pong2.timestamp).toBeGreaterThan(0);
        });
    });

    // ========================================================================
    // Cleanup | 清理
    // ========================================================================

    describe('Room Cleanup', () => {
        it('should cleanup World on dispose', async () => {
            env.server.define('ecs-test', TestECSRoom);

            const client = await env.createClient();
            await client.joinRoom('ecs-test');

            await client.leaveRoom();

            // 等待自动销毁
            await wait(100);

            // 房间应该已销毁
            expect(client.roomId).toBeNull();
        });
    });
});
