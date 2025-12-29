/**
 * @zh 速率限制模块
 * @en Rate limit module
 *
 * @zh 提供可插拔的速率限制系统，支持多种限流算法
 * @en Provides pluggable rate limit system with multiple algorithms
 *
 * @example
 * ```typescript
 * import { Room, onMessage } from '@esengine/server';
 * import {
 *     withRateLimit,
 *     rateLimit,
 *     noRateLimit
 * } from '@esengine/server/ratelimit';
 *
 * class GameRoom extends withRateLimit(Room, {
 *     messagesPerSecond: 10,
 *     burstSize: 20,
 *     strategy: 'token-bucket',
 *     onLimited: (player, type, result) => {
 *         player.send('Error', {
 *             code: 'RATE_LIMITED',
 *             retryAfter: result.retryAfter
 *         });
 *     }
 * }) {
 *     @onMessage('Move')
 *     handleMove(data: { x: number, y: number }, player: Player) {
 *         // Protected by default rate limit
 *     }
 *
 *     @rateLimit({ messagesPerSecond: 1 })
 *     @onMessage('Trade')
 *     handleTrade(data: TradeData, player: Player) {
 *         // Stricter rate limit for trading
 *     }
 *
 *     @noRateLimit()
 *     @onMessage('Heartbeat')
 *     handleHeartbeat(data: any, player: Player) {
 *         // No rate limit for heartbeat
 *     }
 * }
 * ```
 */

// Types
export type {
    RateLimitResult,
    IRateLimitStrategy,
    RateLimitStrategyType,
    RateLimitConfig,
    MessageRateLimitConfig,
    RateLimitMetadata,
    IRateLimitContext,
    RateLimitedRoom,
    StrategyConfig
} from './types.js';

// Strategies
export {
    TokenBucketStrategy,
    createTokenBucketStrategy,
    SlidingWindowStrategy,
    createSlidingWindowStrategy,
    FixedWindowStrategy,
    createFixedWindowStrategy
} from './strategies/index.js';

// Context
export { RateLimitContext } from './context.js';

// Mixin
export {
    withRateLimit,
    getPlayerRateLimitContext,
    type RateLimitedPlayer,
    type IRateLimitRoom,
    type RateLimitRoomClass
} from './mixin/index.js';

// Decorators
export {
    rateLimit,
    noRateLimit,
    rateLimitMessage,
    noRateLimitMessage,
    getRateLimitMetadata,
    RATE_LIMIT_METADATA_KEY
} from './decorators/index.js';
