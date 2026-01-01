/**
 * @zh 房间测试示例
 * @en Room test examples
 *
 * @zh 这个文件展示了如何使用测试工具进行服务器测试
 * @en This file demonstrates how to use testing utilities for server testing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEnv, type TestEnvironment, wait } from './TestServer.js';
import { MockRoom, BroadcastRoom } from './MockRoom.js';
import { Room, onMessage, type Player } from '../room/index.js';

// ============================================================================
// Custom Room for Testing | 自定义测试房间
// ============================================================================

interface GameState {
    players: Map<string, { x: number; y: number }>
    scores: Map<string, number>
}

class GameRoom extends Room<GameState> {
    maxPlayers = 4;

    state: GameState = {
        players: new Map(),
        scores: new Map()
    };

    onJoin(player: Player): void {
        this.state.players.set(player.id, { x: 0, y: 0 });
        this.state.scores.set(player.id, 0);
        this.broadcast('PlayerJoined', {
            playerId: player.id,
            playerCount: this.state.players.size
        });
    }

    onLeave(player: Player): void {
        this.state.players.delete(player.id);
        this.state.scores.delete(player.id);
        this.broadcast('PlayerLeft', {
            playerId: player.id,
            playerCount: this.state.players.size
        });
    }

    @onMessage('Move')
    handleMove(data: { x: number; y: number }, player: Player): void {
        const pos = this.state.players.get(player.id);
        if (pos) {
            pos.x = data.x;
            pos.y = data.y;
            this.broadcast('PlayerMoved', {
                playerId: player.id,
                x: data.x,
                y: data.y
            });
        }
    }

    @onMessage('Score')
    handleScore(data: { points: number }, player: Player): void {
        const current = this.state.scores.get(player.id) ?? 0;
        this.state.scores.set(player.id, current + data.points);
        player.send('ScoreUpdated', {
            score: this.state.scores.get(player.id)
        });
    }
}

// ============================================================================
// Test Suites | 测试套件
// ============================================================================

describe('Room Integration Tests', () => {
    let env: TestEnvironment;

    beforeEach(async () => {
        env = await createTestEnv();
    });

    afterEach(async () => {
        await env.cleanup();
    });

    // ========================================================================
    // Basic Tests | 基础测试
    // ========================================================================

    describe('Basic Room Operations', () => {
        it('should create and join room', async () => {
            env.server.define('game', GameRoom);

            const client = await env.createClient();
            const result = await client.joinRoom('game');

            expect(result.roomId).toBeDefined();
            expect(result.playerId).toBeDefined();
            expect(client.roomId).toBe(result.roomId);
        });

        it('should leave room', async () => {
            env.server.define('game', GameRoom);

            const client = await env.createClient();
            await client.joinRoom('game');

            await client.leaveRoom();

            expect(client.roomId).toBeNull();
        });

        it('should join existing room by id', async () => {
            env.server.define('game', GameRoom);

            const client1 = await env.createClient();
            const { roomId } = await client1.joinRoom('game');

            const client2 = await env.createClient();
            const result = await client2.joinRoomById(roomId);

            expect(result.roomId).toBe(roomId);
        });
    });

    // ========================================================================
    // Message Tests | 消息测试
    // ========================================================================

    describe('Room Messages', () => {
        it('should receive room messages', async () => {
            env.server.define('game', GameRoom);

            const client = await env.createClient();
            await client.joinRoom('game');

            const movePromise = client.waitForRoomMessage('PlayerMoved');
            client.sendToRoom('Move', { x: 100, y: 200 });

            const msg = await movePromise;
            expect(msg).toEqual({
                playerId: client.playerId,
                x: 100,
                y: 200
            });
        });

        it('should receive broadcast messages', async () => {
            env.server.define('game', GameRoom);

            const [client1, client2] = await env.createClients(2);

            const { roomId } = await client1.joinRoom('game');
            await client2.joinRoomById(roomId);

            // client1 等待收到 client2 的移动消息
            const movePromise = client1.waitForRoomMessage('PlayerMoved');
            client2.sendToRoom('Move', { x: 50, y: 75 });

            const msg = await movePromise;
            expect(msg).toMatchObject({
                playerId: client2.playerId,
                x: 50,
                y: 75
            });
        });

        it('should handle player join/leave broadcasts', async () => {
            env.server.define('broadcast', BroadcastRoom);

            const client1 = await env.createClient();
            const { roomId } = await client1.joinRoom('broadcast');

            // 等待 client2 加入的广播
            const joinPromise = client1.waitForRoomMessage<{ id: string }>('PlayerJoined');

            const client2 = await env.createClient();
            const client2Result = await client2.joinRoomById(roomId);

            const joinMsg = await joinPromise;
            expect(joinMsg).toMatchObject({ id: client2Result.playerId });

            // 等待 client2 离开的广播
            const leavePromise = client1.waitForRoomMessage<{ id: string }>('PlayerLeft');
            const client2PlayerId = client2.playerId; // 保存 playerId
            await client2.leaveRoom();

            const leaveMsg = await leavePromise;
            expect(leaveMsg).toMatchObject({ id: client2PlayerId });
        });
    });

    // ========================================================================
    // MockRoom Tests | 模拟房间测试
    // ========================================================================

    describe('MockRoom', () => {
        it('should record messages', async () => {
            env.server.define('mock', MockRoom);

            const client = await env.createClient();
            await client.joinRoom('mock');

            // 使用 Echo 消息，因为它是明确定义的
            const echoPromise = client.waitForRoomMessage('EchoReply');
            client.sendToRoom('Echo', { value: 123 });
            await echoPromise;

            expect(client.hasReceivedMessage('RoomMessage')).toBe(true);
        });

        it('should handle echo', async () => {
            env.server.define('mock', MockRoom);

            const client = await env.createClient();
            await client.joinRoom('mock');

            const echoPromise = client.waitForRoomMessage('EchoReply');
            client.sendToRoom('Echo', { message: 'hello' });

            const reply = await echoPromise;
            expect(reply).toEqual({ message: 'hello' });
        });

        it('should handle ping/pong', async () => {
            env.server.define('mock', MockRoom);

            const client = await env.createClient();
            await client.joinRoom('mock');

            const pongPromise = client.waitForRoomMessage<{ timestamp: number }>('Pong');
            client.sendToRoom('Ping', {});

            const pong = await pongPromise;
            expect(pong.timestamp).toBeGreaterThan(0);
        });
    });

    // ========================================================================
    // Multiple Clients Tests | 多客户端测试
    // ========================================================================

    describe('Multiple Clients', () => {
        it('should handle multiple clients in same room', async () => {
            env.server.define('game', GameRoom);

            const clients = await env.createClients(3);
            const { roomId } = await clients[0].joinRoom('game');

            for (let i = 1; i < clients.length; i++) {
                await clients[i].joinRoomById(roomId);
            }

            // 所有客户端都应该能收到消息
            const promises = clients.map((c) => c.waitForRoomMessage('PlayerMoved'));

            clients[0].sendToRoom('Move', { x: 1, y: 2 });

            const results = await Promise.all(promises);
            for (const result of results) {
                expect(result).toMatchObject({ x: 1, y: 2 });
            }
        });

        it('should handle concurrent room operations', async () => {
            env.server.define('game', GameRoom);

            const clients = await env.createClients(4); // maxPlayers = 4

            // 顺序加入房间（避免并发创建多个房间）
            const { roomId } = await clients[0].joinRoom('game');

            // 其余客户端加入同一房间
            const results = await Promise.all(
                clients.slice(1).map((c) => c.joinRoomById(roomId))
            );

            // 验证所有客户端都在同一房间
            for (const result of results) {
                expect(result.roomId).toBe(roomId);
            }
        });
    });

    // ========================================================================
    // Error Handling Tests | 错误处理测试
    // ========================================================================

    describe('Error Handling', () => {
        it('should reject joining non-existent room type', async () => {
            const client = await env.createClient();

            await expect(client.joinRoom('nonexistent')).rejects.toThrow();
        });

        it('should handle client disconnect gracefully', async () => {
            env.server.define('game', GameRoom);

            const client1 = await env.createClient();
            const { roomId } = await client1.joinRoom('game');

            const client2 = await env.createClient();
            await client2.joinRoomById(roomId);

            // 等待 client2 离开的广播
            const leavePromise = client1.waitForRoomMessage('PlayerLeft');

            // 强制断开 client2
            await client2.disconnect();

            // client1 应该收到离开消息
            const msg = await leavePromise;
            expect(msg).toBeDefined();
        });
    });

    // ========================================================================
    // Assertion Helpers Tests | 断言辅助测试
    // ========================================================================

    describe('TestClient Assertions', () => {
        it('should track received messages', async () => {
            env.server.define('mock', MockRoom);

            const client = await env.createClient();
            await client.joinRoom('mock');

            // 发送多条消息
            client.sendToRoom('Test', { n: 1 });
            client.sendToRoom('Test', { n: 2 });
            client.sendToRoom('Test', { n: 3 });

            // 等待消息处理
            await wait(100);

            expect(client.getMessageCount()).toBeGreaterThan(0);
            expect(client.hasReceivedMessage('RoomMessage')).toBe(true);
        });

        it('should get messages of specific type', async () => {
            env.server.define('mock', MockRoom);

            const client = await env.createClient();
            await client.joinRoom('mock');

            client.sendToRoom('Ping', {});
            await client.waitForRoomMessage('Pong');

            const pongs = client.getMessagesOfType('RoomMessage');
            expect(pongs.length).toBeGreaterThan(0);
        });

        it('should clear message history', async () => {
            env.server.define('mock', MockRoom);

            const client = await env.createClient();
            await client.joinRoom('mock');

            client.sendToRoom('Test', {});
            await wait(50);

            expect(client.getMessageCount()).toBeGreaterThan(0);

            client.clearMessages();

            expect(client.getMessageCount()).toBe(0);
        });
    });
});
