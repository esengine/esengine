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
export abstract class Room<TState = any, TPlayerData = Record<string, unknown>> {
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
     * @zh 玩家离开时调用
     * @en Called when player leaves
     */
    onLeave(player: Player<TPlayerData>, reason?: string): void | Promise<void> {}

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
     */
    broadcast<T>(type: string, data: T): void {
        for (const player of this._players.values()) {
            player.send(type, data);
        }
    }

    /**
     * @zh 广播消息给除指定玩家外的所有玩家
     * @en Broadcast message to all players except one
     */
    broadcastExcept<T>(except: Player<TPlayerData>, type: string, data: T): void {
        for (const player of this._players.values()) {
            if (player.id !== except.id) {
                player.send(type, data);
            }
        }
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
    async _addPlayer(id: string, conn: any): Promise<Player<TPlayerData> | null> {
        if (this._locked || this.isFull || this._disposed) {
            return null;
        }

        const player = new Player<TPlayerData>({
            id,
            roomId: this._id,
            conn,
            sendFn: this._sendFn!,
            sendBinaryFn: this._sendBinaryFn ?? undefined,
            leaveFn: (p, reason) => this._removePlayer(p.id, reason)
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

        this._players.delete(id);
        await this.onLeave(player, reason);

        if (this.autoDispose && this._players.size === 0) {
            this.dispose();
        }
    }

    /**
     * @internal
     */
    _handleMessage(type: string, data: unknown, playerId: string): void {
        const player = this._players.get(playerId);
        if (!player) return;

        const handlers = (this.constructor as any)[MESSAGE_HANDLERS] as MessageHandlerMeta[] | undefined;
        if (handlers) {
            for (const handler of handlers) {
                if (handler.type === type) {
                    const method = (this as any)[handler.method];
                    if (typeof method === 'function') {
                        method.call(this, data, player);
                    }
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
