/**
 * @zh 房间速率限制 Mixin
 * @en Room rate limit mixin
 */

import type { Player, Room } from '../../room/index.js';
import { RateLimitContext } from '../context.js';
import { getRateLimitMetadata, RATE_LIMIT_METADATA_KEY } from '../decorators/rateLimit.js';
import { FixedWindowStrategy } from '../strategies/FixedWindow.js';
import { SlidingWindowStrategy } from '../strategies/SlidingWindow.js';
import { TokenBucketStrategy } from '../strategies/TokenBucket.js';
import type {
    IRateLimitContext,
    IRateLimitStrategy,
    RateLimitConfig,
    RateLimitMetadata,
    RateLimitResult
} from '../types.js';

/**
 * @zh 玩家速率限制上下文存储
 * @en Player rate limit context storage
 */
const PLAYER_RATE_LIMIT_CONTEXT = Symbol('playerRateLimitContext');

/**
 * @zh 带速率限制的玩家
 * @en Player with rate limit
 */
export interface RateLimitedPlayer<TData = Record<string, unknown>> extends Player<TData> {
    /**
     * @zh 速率限制上下文
     * @en Rate limit context
     */
    readonly rateLimit: IRateLimitContext;
}

/**
 * @zh 带速率限制的房间接口
 * @en Room with rate limit interface
 */
export interface IRateLimitRoom {
    /**
     * @zh 获取玩家的速率限制上下文
     * @en Get rate limit context for player
     */
    getRateLimitContext(player: Player): IRateLimitContext | null;

    /**
     * @zh 全局速率限制策略
     * @en Global rate limit strategy
     */
    readonly rateLimitStrategy: IRateLimitStrategy;

    /**
     * @zh 速率限制钩子（被限流时调用）
     * @en Rate limit hook (called when rate limited)
     */
    onRateLimited?(player: Player, messageType: string, result: RateLimitResult): void;
}

/**
 * @zh 速率限制房间构造器类型
 * @en Rate limit room constructor type
 */
export type RateLimitRoomClass = new (...args: any[]) => Room & IRateLimitRoom;

/**
 * @zh 创建策略实例
 * @en Create strategy instance
 */
function createStrategy(config: RateLimitConfig): IRateLimitStrategy {
    const rate = config.messagesPerSecond ?? 10;
    const capacity = config.burstSize ?? rate * 2;

    switch (config.strategy) {
        case 'sliding-window':
            return new SlidingWindowStrategy({ rate, capacity });
        case 'fixed-window':
            return new FixedWindowStrategy({ rate, capacity });
        case 'token-bucket':
        default:
            return new TokenBucketStrategy({ rate, capacity });
    }
}

/**
 * @zh 获取玩家的速率限制上下文
 * @en Get rate limit context for player
 */
export function getPlayerRateLimitContext(player: Player): IRateLimitContext | null {
    const data = player as unknown as Record<symbol, unknown>;
    return (data[PLAYER_RATE_LIMIT_CONTEXT] as IRateLimitContext) ?? null;
}

/**
 * @zh 设置玩家的速率限制上下文
 * @en Set rate limit context for player
 */
function setPlayerRateLimitContext(player: Player, context: IRateLimitContext): void {
    const data = player as unknown as Record<symbol, unknown>;
    data[PLAYER_RATE_LIMIT_CONTEXT] = context;

    Object.defineProperty(player, 'rateLimit', {
        get: () => data[PLAYER_RATE_LIMIT_CONTEXT],
        enumerable: true,
        configurable: false
    });
}

/**
 * @zh 抽象构造器类型
 * @en Abstract constructor type
 */
type AbstractConstructor<T = object> = abstract new (...args: any[]) => T;

/**
 * @zh 可混入的 Room 构造器类型（支持抽象和具体类）
 * @en Mixable Room constructor type (supports both abstract and concrete classes)
 */
type RoomConstructor = AbstractConstructor<Room>;

// ============================================================================
// Mixin 类型辅助函数 | Mixin Type Helpers
// ============================================================================
// TypeScript 的 mixin 模式存在类型系统限制：
// 1. ES6 class 语法不支持 `extends` 抽象类型参数
// 2. 泛型类型参数无法直接用于 class extends 子句
// 以下辅助函数封装了必要的类型转换，使 mixin 实现更清晰
//
// TypeScript mixin pattern has type system limitations:
// 1. ES6 class syntax doesn't support `extends` with abstract type parameters
// 2. Generic type parameters cannot be used directly in class extends clause
// The following helpers encapsulate necessary type casts for cleaner mixin implementation
// ============================================================================

/**
 * @zh 将抽象 Room 构造器转换为可继承的具体构造器
 * @en Convert abstract Room constructor to extendable concrete constructor
 */
function toExtendable<T extends RoomConstructor>(Base: T): new (...args: any[]) => Room {
    return Base as unknown as new (...args: any[]) => Room;
}

/**
 * @zh 将 mixin 类转换为正确的返回类型
 * @en Cast mixin class to correct return type
 */
function toMixinResult<TBase extends RoomConstructor, TInterface>(
    MixinClass: AbstractConstructor<any>
): TBase & AbstractConstructor<TInterface> {
    return MixinClass as unknown as TBase & AbstractConstructor<TInterface>;
}

/**
 * @zh 包装房间类添加速率限制功能
 * @en Wrap room class with rate limit functionality
 *
 * @zh 使用 mixin 模式为房间添加速率限制，在消息处理前验证速率限制
 * @en Uses mixin pattern to add rate limit to room, validates rate before processing messages
 *
 * @example
 * ```typescript
 * import { Room, onMessage } from '@esengine/server';
 * import { withRateLimit } from '@esengine/server/ratelimit';
 *
 * class GameRoom extends withRateLimit(Room, {
 *     messagesPerSecond: 10,
 *     burstSize: 20,
 *     onLimited: (player, type, result) => {
 *         player.send('Error', {
 *             code: 'RATE_LIMITED',
 *             retryAfter: result.retryAfter
 *         });
 *     }
 * }) {
 *     @onMessage('Move')
 *     handleMove(data: { x: number, y: number }, player: Player) {
 *         // Protected by rate limit
 *     }
 * }
 * ```
 *
 * @example
 * // Combine with auth
 * ```typescript
 * class GameRoom extends withRateLimit(
 *     withRoomAuth(Room, { requireAuth: true }),
 *     { messagesPerSecond: 10 }
 * ) {
 *     // Both auth and rate limit active
 * }
 * ```
 */
export function withRateLimit<TBase extends RoomConstructor>(
    Base: TBase,
    config: RateLimitConfig = {}
): TBase & AbstractConstructor<IRateLimitRoom> {
    const {
        messagesPerSecond = 10,
        burstSize = 20,
        strategy = 'token-bucket',
        onLimited,
        disconnectOnLimit = false,
        maxConsecutiveLimits = 0,
        getKey = (player: Player) => player.id,
        cleanupInterval = 60000
    } = config;

    const BaseRoom = toExtendable(Base);

    abstract class RateLimitRoom extends BaseRoom implements IRateLimitRoom {
        private _rateLimitStrategy: IRateLimitStrategy;
        private _playerContexts: WeakMap<Player, RateLimitContext> = new WeakMap();
        private _cleanupTimer: ReturnType<typeof setInterval> | null = null;
        private _messageStrategies: Map<string, IRateLimitStrategy> = new Map();

        constructor(...args: any[]) {
            super(...args);
            this._rateLimitStrategy = createStrategy({
                messagesPerSecond,
                burstSize,
                strategy
            });

            this._startCleanup();
            this._initMessageStrategies();
        }

        /**
         * @zh 全局速率限制策略
         * @en Global rate limit strategy
         */
        get rateLimitStrategy(): IRateLimitStrategy {
            return this._rateLimitStrategy;
        }

        /**
         * @zh 速率限制钩子（可覆盖）
         * @en Rate limit hook (can be overridden)
         */
        onRateLimited?(player: Player, messageType: string, result: RateLimitResult): void;

        /**
         * @zh 获取玩家的速率限制上下文
         * @en Get rate limit context for player
         */
        getRateLimitContext(player: Player): IRateLimitContext | null {
            return this._playerContexts.get(player) ?? null;
        }

        /**
         * @internal
         * @zh 重写消息处理以添加速率限制检查
         * @en Override message handling to add rate limit check
         */
        _handleMessage(type: string, data: unknown, playerId: string): void {
            const player = this.getPlayer(playerId);
            if (!player) return;

            let context = this._playerContexts.get(player);
            if (!context) {
                context = this._createPlayerContext(player);
            }

            const metadata = this._getMessageMetadata(type);

            if (metadata?.exempt) {
                super._handleMessage(type, data, playerId);
                return;
            }

            const cost = metadata?.config?.cost ?? 1;
            let result: RateLimitResult;

            if (metadata?.config && (metadata.config.messagesPerSecond || metadata.config.burstSize)) {
                if (!context.hasMessageStrategy(type)) {
                    const msgStrategy = createStrategy({
                        messagesPerSecond: metadata.config.messagesPerSecond ?? messagesPerSecond,
                        burstSize: metadata.config.burstSize ?? burstSize,
                        strategy
                    });
                    context.setMessageStrategy(type, msgStrategy);
                }
                result = context.consume(type, cost);
            } else {
                result = context.consume(undefined, cost);
            }

            if (!result.allowed) {
                this._handleRateLimited(player, type, result, context);
                return;
            }

            super._handleMessage(type, data, playerId);
        }

        /**
         * @internal
         * @zh 重写 _addPlayer 以初始化速率限制上下文
         * @en Override _addPlayer to initialize rate limit context
         */
        async _addPlayer(id: string, conn: any): Promise<Player | null> {
            const player = await super._addPlayer(id, conn);
            if (player) {
                this._createPlayerContext(player);
            }
            return player;
        }

        /**
         * @internal
         * @zh 重写 _removePlayer 以清理速率限制上下文
         * @en Override _removePlayer to cleanup rate limit context
         */
        async _removePlayer(id: string, reason?: string): Promise<void> {
            const player = this.getPlayer(id);
            if (player) {
                const context = this._playerContexts.get(player);
                if (context) {
                    context.reset();
                }
                this._playerContexts.delete(player);
            }
            await super._removePlayer(id, reason);
        }

        /**
         * @zh 重写 dispose 以清理定时器
         * @en Override dispose to cleanup timer
         */
        dispose(): void {
            this._stopCleanup();
            super.dispose();
        }

        /**
         * @zh 创建玩家的速率限制上下文
         * @en Create rate limit context for player
         */
        private _createPlayerContext(player: Player): RateLimitContext {
            const key = getKey(player);
            const context = new RateLimitContext(key, this._rateLimitStrategy);
            this._playerContexts.set(player, context);
            setPlayerRateLimitContext(player, context);
            return context;
        }

        /**
         * @zh 处理被限流的情况
         * @en Handle rate limited situation
         */
        private _handleRateLimited(
            player: Player,
            messageType: string,
            result: RateLimitResult,
            context: RateLimitContext
        ): void {
            if (this.onRateLimited) {
                this.onRateLimited(player, messageType, result);
            }

            onLimited?.(player, messageType, result);

            if (disconnectOnLimit) {
                this.kick(player as any, 'rate_limited');
                return;
            }

            if (maxConsecutiveLimits > 0 && context.consecutiveLimitCount >= maxConsecutiveLimits) {
                this.kick(player as any, 'too_many_rate_limits');
            }
        }

        /**
         * @zh 获取消息的元数据
         * @en Get message metadata
         */
        private _getMessageMetadata(type: string): RateLimitMetadata | undefined {
            return getRateLimitMetadata(this.constructor.prototype, type);
        }

        /**
         * @zh 初始化消息策略（从装饰器元数据）
         * @en Initialize message strategies (from decorator metadata)
         */
        private _initMessageStrategies(): void {
            const metadataMap = (this.constructor.prototype as any)[RATE_LIMIT_METADATA_KEY];
            if (metadataMap instanceof Map) {
                for (const [msgType, metadata] of metadataMap) {
                    if (metadata.config && (metadata.config.messagesPerSecond || metadata.config.burstSize)) {
                        const msgStrategy = createStrategy({
                            messagesPerSecond: metadata.config.messagesPerSecond ?? messagesPerSecond,
                            burstSize: metadata.config.burstSize ?? burstSize,
                            strategy
                        });
                        this._messageStrategies.set(msgType, msgStrategy);
                    }
                }
            }
        }

        /**
         * @zh 开始清理定时器
         * @en Start cleanup timer
         */
        private _startCleanup(): void {
            if (cleanupInterval > 0) {
                this._cleanupTimer = setInterval(() => {
                    this._rateLimitStrategy.cleanup();
                    for (const strategy of this._messageStrategies.values()) {
                        strategy.cleanup();
                    }
                }, cleanupInterval);
            }
        }

        /**
         * @zh 停止清理定时器
         * @en Stop cleanup timer
         */
        private _stopCleanup(): void {
            if (this._cleanupTimer) {
                clearInterval(this._cleanupTimer);
                this._cleanupTimer = null;
            }
        }
    }

    return toMixinResult<TBase, IRateLimitRoom>(RateLimitRoom);
}
