/**
 * @zh 模拟房间
 * @en Mock room for testing
 */

import { Room, onMessage, type Player } from '../room/index.js';

/**
 * @zh 模拟房间状态
 * @en Mock room state
 */
export interface MockRoomState {
    messages: Array<{ type: string; data: unknown; playerId: string }>
    joinCount: number
    leaveCount: number
}

/**
 * @zh 模拟房间
 * @en Mock room for testing
 *
 * @zh 记录所有事件和消息，用于测试断言
 * @en Records all events and messages for test assertions
 *
 * @example
 * ```typescript
 * const env = await createTestEnv()
 * env.server.define('mock', MockRoom)
 *
 * const client = await env.createClient()
 * await client.joinRoom('mock')
 *
 * client.sendToRoom('Test', { value: 123 })
 * await wait(50)
 *
 * // MockRoom 会广播收到的消息
 * const msg = client.getLastMessage('RoomMessage')
 * ```
 */
export class MockRoom extends Room<MockRoomState> {
    state: MockRoomState = {
        messages: [],
        joinCount: 0,
        leaveCount: 0
    };

    onCreate(): void {
        // 房间创建
    }

    onJoin(player: Player): void {
        this.state.joinCount++;
        this.broadcast('PlayerJoined', {
            playerId: player.id,
            joinCount: this.state.joinCount
        });
    }

    onLeave(player: Player): void {
        this.state.leaveCount++;
        this.broadcast('PlayerLeft', {
            playerId: player.id,
            leaveCount: this.state.leaveCount
        });
    }

    @onMessage('*')
    handleAnyMessage(data: unknown, player: Player, type: string): void {
        this.state.messages.push({
            type,
            data,
            playerId: player.id
        });

        // 回显消息给所有玩家
        this.broadcast('MessageReceived', {
            type,
            data,
            from: player.id
        });
    }

    @onMessage('Echo')
    handleEcho(data: unknown, player: Player): void {
        // 只回复给发送者
        player.send('EchoReply', data);
    }

    @onMessage('Broadcast')
    handleBroadcast(data: unknown, _player: Player): void {
        this.broadcast('BroadcastMessage', data);
    }

    @onMessage('Ping')
    handlePing(_data: unknown, player: Player): void {
        player.send('Pong', { timestamp: Date.now() });
    }
}

/**
 * @zh 简单回显房间
 * @en Simple echo room
 *
 * @zh 将收到的任何消息回显给发送者
 * @en Echoes any received message back to sender
 */
export class EchoRoom extends Room {
    @onMessage('*')
    handleAnyMessage(data: unknown, player: Player, type: string): void {
        player.send(type, data);
    }
}

/**
 * @zh 广播房间
 * @en Broadcast room
 *
 * @zh 将收到的任何消息广播给所有玩家
 * @en Broadcasts any received message to all players
 */
export class BroadcastRoom extends Room {
    onJoin(player: Player): void {
        this.broadcast('PlayerJoined', { id: player.id });
    }

    onLeave(player: Player): void {
        this.broadcast('PlayerLeft', { id: player.id });
    }

    @onMessage('*')
    handleAnyMessage(data: unknown, player: Player, type: string): void {
        this.broadcast(type, { from: player.id, data });
    }
}
