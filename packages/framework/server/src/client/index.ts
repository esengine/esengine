/**
 * @zh 游戏客户端 SDK — 浏览器和 Node.js 通用
 * @en Game Client SDK — Works in browser and Node.js
 *
 * @zh 封装 RpcClient，提供房间管理、消息收发、断线重连等便捷 API。
 * 只依赖 @esengine/rpc（浏览器安全），不引入任何 Node.js 模块。
 *
 * @en Wraps RpcClient with room management, messaging, reconnection APIs.
 * Depends only on @esengine/rpc (browser-safe), no Node.js modules.
 *
 * @example
 * ```typescript
 * import { createGameClient } from '@esengine/server/client';
 *
 * const client = await createGameClient('ws://localhost:3000');
 * await client.joinRoom('game', { map: 'desert' });
 *
 * client.onRoomMessage<{ text: string }>('Chat', (data) => {
 *     console.log(data.text);
 * });
 *
 * client.sendToRoom('Chat', { text: 'Hello!' });
 * ```
 */

import { RpcClient, type WebSocketFactory } from '@esengine/rpc/client';
import { rpc } from '@esengine/rpc';

// =============================================================================
// 内部协议 | Internal Protocol
// =============================================================================

const serverProtocol = rpc.define({
    api: {
        JoinRoom: rpc.api(),
        LeaveRoom: rpc.api(),
        ReconnectRoom: rpc.api(),
        ListRooms: rpc.api(),
        GetRoomInfo: rpc.api(),
        Authenticate: rpc.api()
    },
    msg: {
        RoomMessage: rpc.msg(),
        $redirect: rpc.msg()
    }
});

type ServerProtocol = typeof serverProtocol;

// =============================================================================
// 类型 | Types
// =============================================================================

/** @zh 连接状态 @en Connection state */
export type GameClientState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

/** @zh 房间信息 @en Room info */
export interface RoomInfo {
    roomId: string;
    playerCount: number;
    maxPlayers: number;
    locked: boolean;
    metadata: Record<string, unknown>;
}

/** @zh 房间详细信息 @en Room detailed info */
export interface RoomInfoDetail extends RoomInfo {
    players: Array<{ id: string }>;
}

/** @zh 加入房间结果 @en Join room result */
export interface JoinRoomResult {
    roomId: string;
    playerId: string;
    sessionToken: string;
}

/** @zh 认证结果 @en Authentication result */
export interface AuthResult {
    success: boolean;
    user?: unknown;
    error?: string;
}

/** @zh GameClient 配置 @en GameClient options */
export interface GameClientOptions {
    /** @zh API 调用超时（毫秒） @en API call timeout in ms @defaultValue 30000 */
    timeout?: number;
    /** @zh 断线后自动重连（含恢复房间） @en Auto reconnect (including room rejoin) @defaultValue true */
    autoReconnect?: boolean;
    /** @zh 重连间隔（毫秒） @en Reconnect interval in ms @defaultValue 3000 */
    reconnectInterval?: number;
    /** @zh 最大重连次数（0=无限） @en Max reconnect attempts (0=infinite) @defaultValue 5 */
    maxReconnectAttempts?: number;
    /** @zh 自定义 WebSocket 工厂 @en Custom WebSocket factory */
    webSocketFactory?: WebSocketFactory;
    /** @zh 连接查询参数（如 token） @en Connection query params */
    query?: Record<string, string>;
}

/** @zh 取消订阅函数 @en Unsubscribe function */
export type Unsubscribe = () => void;

// =============================================================================
// GameClient
// =============================================================================

/**
 * @zh 游戏客户端
 * @en Game Client
 *
 * @zh 面向游戏开发者的高层客户端，自动处理 RoomMessage 协议包装、
 * sessionToken 管理和断线重连。
 * @en High-level client for game developers, auto-handles RoomMessage protocol
 * wrapping, sessionToken management and reconnection.
 */
export class GameClient {
    private _rpc!: RpcClient<ServerProtocol>;
    private _state: GameClientState = 'disconnected';
    private _roomId: string | null = null;
    private _playerId: string | null = null;
    private _sessionToken: string | null = null;
    private _reconnectAttempts = 0;
    private _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private _intentionalDisconnect = false;

    private readonly _url: string;
    private readonly _timeout: number;
    private readonly _autoReconnect: boolean;
    private readonly _reconnectInterval: number;
    private readonly _maxReconnectAttempts: number;
    private readonly _webSocketFactory?: WebSocketFactory;
    private readonly _query?: Record<string, string>;

    private readonly _connectedHandlers = new Set<() => void>();
    private readonly _disconnectedHandlers = new Set<(reason?: string) => void>();
    private readonly _reconnectingHandlers = new Set<(attempt: number) => void>();
    private readonly _reconnectedHandlers = new Set<() => void>();
    private readonly _roomMsgHandlers = new Map<string, Set<(data: unknown) => void>>();

    constructor(url: string, options: GameClientOptions = {}) {
        this._url = url;
        this._timeout = options.timeout ?? 30000;
        this._autoReconnect = options.autoReconnect ?? true;
        this._reconnectInterval = options.reconnectInterval ?? 3000;
        this._maxReconnectAttempts = options.maxReconnectAttempts ?? 5;
        this._webSocketFactory = options.webSocketFactory;
        this._query = options.query;
        this._rpc = this._buildRpc();
    }

    // ========================================================================
    // 属性 | Properties
    // ========================================================================

    get state(): GameClientState { return this._state; }
    get isConnected(): boolean { return this._state === 'connected'; }
    get roomId(): string | null { return this._roomId; }
    get playerId(): string | null { return this._playerId; }
    get sessionToken(): string | null { return this._sessionToken; }

    /** @zh 底层 RPC 客户端（用于自定义 API 调用） @en Underlying RPC client (for custom API calls) */
    get rpc(): RpcClient<ServerProtocol> { return this._rpc; }

    // ========================================================================
    // 连接 | Connection
    // ========================================================================

    async connect(): Promise<this> {
        this._state = 'connecting';
        this._intentionalDisconnect = false;
        await this._rpc.connect();
        return this;
    }

    disconnect(): void {
        this._intentionalDisconnect = true;
        this._clearReconnectTimer();
        this._rpc.disconnect();
        this._state = 'disconnected';
    }

    // ========================================================================
    // 认证 | Authentication
    // ========================================================================

    async authenticate(token: string): Promise<AuthResult> {
        return this._rpc.call('Authenticate', { token }) as Promise<AuthResult>;
    }

    // ========================================================================
    // 房间操作 | Room Operations
    // ========================================================================

    async joinRoom(type: string, options?: Record<string, unknown>, playerData?: Record<string, unknown>): Promise<JoinRoomResult> {
        const result = await this._rpc.call('JoinRoom', { roomType: type, options, playerData }) as JoinRoomResult;
        this._applyJoinResult(result);
        return result;
    }

    async joinRoomById(roomId: string, playerData?: Record<string, unknown>): Promise<JoinRoomResult> {
        const result = await this._rpc.call('JoinRoom', { roomId, playerData }) as JoinRoomResult;
        this._applyJoinResult(result);
        return result;
    }

    async leaveRoom(): Promise<void> {
        await this._rpc.call('LeaveRoom', {});
        this._roomId = null;
        this._playerId = null;
    }

    async reconnectRoom(sessionToken?: string): Promise<JoinRoomResult> {
        const token = sessionToken ?? this._sessionToken;
        if (!token) {
            throw new Error('No session token available | 没有可用的会话令牌');
        }
        const result = await this._rpc.call('ReconnectRoom', { sessionToken: token }) as JoinRoomResult;
        this._applyJoinResult(result);
        return result;
    }

    async listRooms(type?: string): Promise<RoomInfo[]> {
        const result = await this._rpc.call('ListRooms', { type }) as { rooms: RoomInfo[] };
        return result.rooms;
    }

    async getRoomInfo(roomId: string): Promise<RoomInfoDetail> {
        return this._rpc.call('GetRoomInfo', { roomId }) as Promise<RoomInfoDetail>;
    }

    // ========================================================================
    // 消息 | Messaging
    // ========================================================================

    sendToRoom(type: string, data: unknown): void {
        this._rpc.send('RoomMessage', { type, data });
    }

    onRoomMessage<T = unknown>(type: string, handler: (data: T) => void): Unsubscribe {
        let handlers = this._roomMsgHandlers.get(type);
        if (!handlers) {
            handlers = new Set();
            this._roomMsgHandlers.set(type, handlers);
        }
        const wrapped = handler as (data: unknown) => void;
        handlers.add(wrapped);
        return () => { handlers!.delete(wrapped); };
    }

    waitForRoomMessage<T = unknown>(type: string, timeout?: number): Promise<T> {
        const ms = timeout ?? this._timeout;
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                unsub();
                reject(new Error(`Timeout waiting for '${type}' | 等待 '${type}' 超时`));
            }, ms);
            const unsub = this.onRoomMessage<T>(type, (data) => {
                clearTimeout(timer);
                unsub();
                resolve(data);
            });
        });
    }

    // ========================================================================
    // 连接事件 | Connection Events
    // ========================================================================

    onConnected(handler: () => void): Unsubscribe {
        this._connectedHandlers.add(handler);
        return () => { this._connectedHandlers.delete(handler); };
    }

    onDisconnected(handler: (reason?: string) => void): Unsubscribe {
        this._disconnectedHandlers.add(handler);
        return () => { this._disconnectedHandlers.delete(handler); };
    }

    onReconnecting(handler: (attempt: number) => void): Unsubscribe {
        this._reconnectingHandlers.add(handler);
        return () => { this._reconnectingHandlers.delete(handler); };
    }

    onReconnected(handler: () => void): Unsubscribe {
        this._reconnectedHandlers.add(handler);
        return () => { this._reconnectedHandlers.delete(handler); };
    }

    // ========================================================================
    // 私有 | Private
    // ========================================================================

    private _buildRpc(): RpcClient<ServerProtocol> {
        let url = this._url;
        if (this._query) {
            const qs = new URLSearchParams(this._query).toString();
            url += (url.includes('?') ? '&' : '?') + qs;
        }

        const client = new RpcClient(serverProtocol, url, {
            timeout: this._timeout,
            autoReconnect: false,
            webSocketFactory: this._webSocketFactory,
            onConnect: () => this._onRpcConnect(),
            onDisconnect: (reason) => this._onRpcDisconnect(reason),
        });

        client.on('RoomMessage', (raw: unknown) => {
            const msg = raw as { type?: string; data?: unknown } | null;
            if (msg?.type) {
                const handlers = this._roomMsgHandlers.get(msg.type);
                if (handlers) {
                    for (const h of handlers) {
                        try { h(msg.data); } catch { /* handler error */ }
                    }
                }
            }
        });

        return client;
    }

    private _applyJoinResult(result: JoinRoomResult): void {
        this._roomId = result.roomId;
        this._playerId = result.playerId;
        if (result.sessionToken) {
            this._sessionToken = result.sessionToken;
        }
    }

    private _onRpcConnect(): void {
        this._state = 'connected';
        this._reconnectAttempts = 0;
        for (const h of this._connectedHandlers) { try { h(); } catch { /* */ } }
    }

    private _onRpcDisconnect(reason?: string): void {
        if (this._intentionalDisconnect) {
            this._state = 'disconnected';
            return;
        }
        this._state = 'disconnected';
        for (const h of this._disconnectedHandlers) { try { h(reason); } catch { /* */ } }
        if (this._autoReconnect) {
            this._scheduleReconnect();
        }
    }

    private _scheduleReconnect(): void {
        if (this._maxReconnectAttempts > 0 && this._reconnectAttempts >= this._maxReconnectAttempts) {
            return;
        }
        this._reconnectAttempts++;
        this._state = 'reconnecting';
        for (const h of this._reconnectingHandlers) { try { h(this._reconnectAttempts); } catch { /* */ } }

        this._reconnectTimer = setTimeout(async () => {
            try {
                this._rpc = this._buildRpc();
                await this._rpc.connect();
                if (this._sessionToken) {
                    try {
                        const result = await this._rpc.call('ReconnectRoom', { sessionToken: this._sessionToken }) as JoinRoomResult;
                        this._applyJoinResult(result);
                    } catch {
                        this._roomId = null;
                        this._playerId = null;
                        this._sessionToken = null;
                    }
                }
                for (const h of this._reconnectedHandlers) { try { h(); } catch { /* */ } }
            } catch {
                this._scheduleReconnect();
            }
        }, this._reconnectInterval);
    }

    private _clearReconnectTimer(): void {
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
    }
}

// =============================================================================
// 工厂 | Factory
// =============================================================================

/**
 * @zh 创建并连接 GameClient
 * @en Create and connect GameClient
 */
export async function createGameClient(url: string, options?: GameClientOptions): Promise<GameClient> {
    const client = new GameClient(url, options);
    await client.connect();
    return client;
}
