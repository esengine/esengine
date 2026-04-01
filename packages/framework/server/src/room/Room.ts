/**
 * @zh 房间基类
 * @en Room base class
 */

import { Player } from './Player.js';

/**
 * @zh 房间配置
 * @en Room options
 */
export interface RoomOptions {
    [key: string]: unknown
}

/**
 * @zh 消息处理器元数据
 * @en Message handler metadata
 */
interface MessageHandlerMeta {
    type: string
    method: string
}

/**
 * @zh 消息处理器存储 key
 * @en Message handler storage key
 */
const MESSAGE_HANDLERS = Symbol('messageHandlers');

/**
 * @zh 房间基类
 * @en Room base class
 *
 * @example
 * ```typescript
 * class GameRoom extends Room {
 *     maxPlayers = 4
 *     tickRate = 20
 *
 *     onJoin(player: Player) {
 *         this.broadcast('Joined', { id: player.id })
 *     }
 *
 *     @onMessage('Move')
 *     handleMove(data: { x: number, y: number }, player: Player) {
 *         // handle move
 *     }
 * }
 * ```
 */
export abstract class Room<TState = unknown, TPlayerData = Record<string, unknown>> {
    // ========================================================================
    // 配置 | Configuration
    // ========================================================================

    /**
     * @zh 最大玩家数
     * @en Maximum players
     */
    maxPlayers = 16;

    /**
     * @zh Tick 速率（每秒），0 = 不自动 tick
     * @en Tick rate (per second), 0 = no auto tick
     */
    tickRate = 0;

    /**
     * @zh 空房间自动销毁
     * @en Auto dispose when empty
     */
    autoDispose = true;

    /**
     * @zh 房间元数据（在 ListRooms 中可见）
     * @en Room metadata (visible in ListRooms)
     *
     * @zh 在 onCreate 中设置，客户端可通过 ListRooms/GetRoomInfo 查看
     * @en Set in onCreate, clients can view via ListRooms/GetRoomInfo
     *
     * @example
     * ```typescript
     * onCreate(options) {
     *     this.metadata = { mapName: 'desert', gameMode: 'capture_flag' };
     * }
     * ```
     */
    metadata: Record<string, unknown> = {};

    /**
     * @zh 断线重连宽限期（毫秒），0 = 禁用重连
     * @en Reconnection grace period (ms), 0 = disabled
     *
     * @zh 玩家断线后在此时间内可以重连恢复状态，超时后才真正移除
     * @en Disconnected players can reconnect within this time, removed after timeout
     */
    reconnectGracePeriod = 0;

    // ========================================================================
    // 状态 | State
    // ========================================================================

    /**
     * @zh 房间状态
     * @en Room state
     */
    state: TState = {} as TState;

    // ========================================================================
    // 内部属性 | Internal properties
    // ========================================================================

    private _id: string = '';
    private _players: Map<string, Player<TPlayerData>> = new Map();
    private _disconnectedPlayers: Map<string, { player: Player<TPlayerData>; timer: ReturnType<typeof setTimeout> }> = new Map();
    private _locked = false;
    private _disposed = false;
    private _tickInterval: ReturnType<typeof setInterval> | null = null;
    private _lastTickTime = 0;
    private _broadcastFn: ((type: string, data: unknown) => void) | null = null;
    private _sendFn: ((conn: any, type: string, data: unknown) => void) | null = null;
    private _sendBinaryFn: ((conn: any, data: Uint8Array) => void) | null = null;
    private _disposeFn: (() => void) | null = null;

    // ========================================================================
    // 只读属性 | Readonly properties
    // ========================================================================

    /**
     * @zh 房间 ID
     * @en Room ID
     */
    get id(): string {
        return this._id;
    }

    /**
     * @zh 所有玩家
     * @en All players
     */
    get players(): ReadonlyArray<Player<TPlayerData>> {
        return Array.from(this._players.values());
    }

    /**
     * @zh 玩家数量
     * @en Player count
     */
    get playerCount(): number {
        return this._players.size;
    }

    /**
     * @zh 是否已满
     * @en Is full
     */
    get isFull(): boolean {
        return this._players.size >= this.maxPlayers;
    }

    /**
     * @zh 是否已锁定
     * @en Is locked
     */
    get isLocked(): boolean {
        return this._locked;
    }

    /**
     * @zh 是否已销毁
     * @en Is disposed
     */
    get isDisposed(): boolean {
        return this._disposed;
    }

    // ========================================================================
    // 生命周期 | Lifecycle
    // ========================================================================

    /**
     * @zh 房间创建时调用
     * @en Called when room is created
     */
    onCreate(options?: RoomOptions): void | Promise<void> {}

    /**
     * @zh 玩家加入时调用
     * @en Called when player joins
     */
    onJoin(player: Player<TPlayerData>): void | Promise<void> {}

    /**
     * @zh 玩家离开时调用（真正移除，非断线）
     * @en Called when player truly leaves (not just disconnected)
     */
    onLeave(player: Player<TPlayerData>, reason?: string): void | Promise<void> {}

    /**
     * @zh 玩家断线时调用（重连宽限期内）
     * @en Called when player disconnects (within reconnect grace period)
     *
     * @zh 仅在 reconnectGracePeriod > 0 时触发。玩家尚未被移除，可在宽限期内重连。
     * @en Only fires when reconnectGracePeriod > 0. Player is not yet removed, can reconnect within grace period.
     */
    onPlayerDisconnected(player: Player<TPlayerData>): void | Promise<void> {}

    /**
     * @zh 玩家重连时调用
     * @en Called when player reconnects
     */
    onPlayerReconnected(player: Player<TPlayerData>): void | Promise<void> {}

    /**
     * @zh 游戏循环
     * @en Game tick
     */
    onTick(dt: number): void {}

    /**
     * @zh 房间销毁时调用
     * @en Called when room is disposed
     */
    onDispose(): void | Promise<void> {}

    // ========================================================================
    // 公共方法 | Public methods
    // ========================================================================

    /**
     * @zh 广播消息给所有玩家
     * @en Broadcast message to all players
     *
     * @param type - @zh 消息类型 @en Message type
     * @param data - @zh 消息数据 @en Message data
     * @param options - @zh 广播选项 @en Broadcast options
     * @param options.exclude - @zh 排除的玩家（单个或数组）@en Player(s) to exclude
     *
     * @example
     * ```typescript
     * // @zh 广播给所有人 @en Broadcast to all
     * this.broadcast('Chat', { text: 'hello' });
     *
     * // @zh 排除发送者 @en Exclude sender
     * this.broadcast('Move', data, { exclude: player });
     *
     * // @zh 排除多个玩家 @en Exclude multiple
     * this.broadcast('Event', data, { exclude: [p1, p2] });
     * ```
     */
    broadcast<T>(type: string, data: T, options?: {
        exclude?: Player<TPlayerData> | Player<TPlayerData>[];
    }): void {
        if (!options?.exclude) {
            for (const player of this._players.values()) {
                player.send(type, data);
            }
            return;
        }

        const excluded = Array.isArray(options.exclude) ? options.exclude : [options.exclude];
        const excludeIds = new Set(excluded.map(p => p.id));

        for (const player of this._players.values()) {
            if (!excludeIds.has(player.id)) {
                player.send(type, data);
            }
        }
    }

    /**
     * @zh 广播消息给除指定玩家外的所有玩家
     * @en Broadcast message to all players except one
     *
     * @deprecated @zh 请使用 broadcast(type, data, { exclude: player }) 代替
     * @deprecated @en Use broadcast(type, data, { exclude: player }) instead
     */
    broadcastExcept<T>(except: Player<TPlayerData>, type: string, data: T): void {
        this.broadcast(type, data, { exclude: except });
    }

    /**
     * @zh 获取玩家
     * @en Get player by id
     */
    getPlayer(id: string): Player<TPlayerData> | undefined {
        return this._players.get(id);
    }

    /**
     * @zh 踢出玩家
     * @en Kick player
     */
    kick(player: Player<TPlayerData>, reason?: string): void {
        player.leave(reason ?? 'kicked');
    }

    /**
     * @zh 锁定房间
     * @en Lock room
     */
    lock(): void {
        this._locked = true;
    }

    /**
     * @zh 解锁房间
     * @en Unlock room
     */
    unlock(): void {
        this._locked = false;
    }

    /**
     * @zh 手动销毁房间
     * @en Manually dispose room
     */
    dispose(): void {
        if (this._disposed) return;
        this._disposed = true;

        this._stopTick();

        for (const { timer } of this._disconnectedPlayers.values()) {
            clearTimeout(timer);
        }
        this._disconnectedPlayers.clear();

        for (const player of this._players.values()) {
            player.leave('room_disposed');
        }
        this._players.clear();

        this.onDispose();
        this._disposeFn?.();
    }

    // ========================================================================
    // 内部方法 | Internal methods
    // ========================================================================

    /**
     * @internal
     */
    _init(options: {
        id: string
        sendFn: (conn: any, type: string, data: unknown) => void
        sendBinaryFn?: (conn: any, data: Uint8Array) => void
        broadcastFn: (type: string, data: unknown) => void
        disposeFn: () => void
    }): void {
        this._id = options.id;
        this._sendFn = options.sendFn;
        this._sendBinaryFn = options.sendBinaryFn ?? null;
        this._broadcastFn = options.broadcastFn;
        this._disposeFn = options.disposeFn;
    }

    /**
     * @internal
     */
    async _create(options?: RoomOptions): Promise<void> {
        await this.onCreate(options);
        this._startTick();
    }

    /**
     * @internal
     */
    async _addPlayer(id: string, conn: any, playerData?: Record<string, unknown>): Promise<Player<TPlayerData> | null> {
        if (this._locked || this.isFull || this._disposed) {
            return null;
        }

        const player = new Player<TPlayerData>({
            id,
            roomId: this._id,
            conn,
            sendFn: this._sendFn!,
            sendBinaryFn: this._sendBinaryFn ?? undefined,
            leaveFn: (p, reason) => this._removePlayer(p.id, reason),
            initialData: playerData as TPlayerData | undefined
        });

        this._players.set(id, player);
        await this.onJoin(player);

        return player;
    }

    /**
     * @internal
     */
    async _removePlayer(id: string, reason?: string): Promise<void> {
        const player = this._players.get(id);
        if (!player) return;

        // 断线 + 有宽限期 → 进入断线等待，不立即移除
        if (reason === 'disconnected' && this.reconnectGracePeriod > 0) {
            player._setDisconnected();
            const timer = setTimeout(() => {
                this._finalRemovePlayer(id, 'reconnect_timeout');
            }, this.reconnectGracePeriod);

            this._disconnectedPlayers.set(player.sessionToken, { player, timer });
            await this.onPlayerDisconnected(player);
            return;
        }

        this._finalRemovePlayer(id, reason);
    }

    /**
     * @zh 最终移除玩家（宽限期后或主动离开）
     * @en Final player removal (after grace period or voluntary leave)
     * @internal
     */
    private async _finalRemovePlayer(id: string, reason?: string): Promise<void> {
        const player = this._players.get(id);
        if (!player) return;

        this._players.delete(id);

        this._disconnectedPlayers.delete(player.sessionToken);

        await this.onLeave(player, reason);

        if (this.autoDispose && this._players.size === 0 && this._disconnectedPlayers.size === 0) {
            this.dispose();
        }
    }

    /**
     * @zh 重连玩家
     * @en Reconnect a player
     * @internal
     */
    async _reconnectPlayer(sessionToken: string, newConnId: string, conn: any): Promise<Player<TPlayerData> | null> {
        const entry = this._disconnectedPlayers.get(sessionToken);
        if (!entry) return null;

        clearTimeout(entry.timer);
        this._disconnectedPlayers.delete(sessionToken);

        const { player } = entry;
        const oldId = player.id;

        player._setConnection(conn, this._sendFn!, this._sendBinaryFn ?? undefined);

        if (oldId !== newConnId) {
            this._players.delete(oldId);
            (player as { id: string }).id = newConnId;
            this._players.set(newConnId, player);
        }

        await this.onPlayerReconnected(player);
        return player;
    }

    /**
     * @internal
     */
    _handleMessage(type: string, data: unknown, playerId: string): void {
        const player = this._players.get(playerId);
        if (!player) return;

        const handlers = getMessageHandlers(this.constructor);
        for (const handler of handlers) {
            if (handler.type === type) {
                const method = this[handler.method as keyof this];
                if (typeof method === 'function') {
                    (method as (data: unknown, player: Player<TPlayerData>) => void).call(this, data, player);
                }
            }
        }
    }

    private _startTick(): void {
        if (this.tickRate <= 0) return;

        this._lastTickTime = performance.now();
        this._tickInterval = setInterval(() => {
            const now = performance.now();
            const dt = (now - this._lastTickTime) / 1000;
            this._lastTickTime = now;
            this.onTick(dt);
        }, 1000 / this.tickRate);
    }

    private _stopTick(): void {
        if (this._tickInterval) {
            clearInterval(this._tickInterval);
            this._tickInterval = null;
        }
    }
}

/**
 * @zh 获取消息处理器元数据
 * @en Get message handler metadata
 */
export function getMessageHandlers(target: any): MessageHandlerMeta[] {
    return target[MESSAGE_HANDLERS] || [];
}

/**
 * @zh 注册消息处理器元数据
 * @en Register message handler metadata
 */
export function registerMessageHandler(target: any, type: string, method: string): void {
    if (!target[MESSAGE_HANDLERS]) {
        target[MESSAGE_HANDLERS] = [];
    }
    target[MESSAGE_HANDLERS].push({ type, method });
}
