/**
 * @zh 速率限制上下文
 * @en Rate limit context
 */

import type {
    IRateLimitContext,
    IRateLimitStrategy,
    RateLimitResult,
    MessageRateLimitConfig
} from './types.js';

/**
 * @zh 速率限制上下文
 * @en Rate limit context
 *
 * @zh 管理单个玩家的速率限制状态，支持全局限制和按消息类型限制
 * @en Manages rate limit status for a single player, supports global and per-message-type limits
 *
 * @example
 * ```typescript
 * const context = new RateLimitContext('player-123', globalStrategy);
 *
 * // Check global rate limit
 * const result = context.consume();
 *
 * // Check per-message rate limit
 * const tradeResult = context.consume('Trade', 1);
 * ```
 */
export class RateLimitContext implements IRateLimitContext {
    private _key: string;
    private _globalStrategy: IRateLimitStrategy;
    private _messageStrategies: Map<string, IRateLimitStrategy> = new Map();
    private _consecutiveLimitCount: number = 0;

    /**
     * @zh 创建速率限制上下文
     * @en Create rate limit context
     *
     * @param key - @zh 限流键（通常是玩家ID）@en Rate limit key (usually player ID)
     * @param globalStrategy - @zh 全局限流策略 @en Global rate limit strategy
     */
    constructor(key: string, globalStrategy: IRateLimitStrategy) {
        this._key = key;
        this._globalStrategy = globalStrategy;
    }

    /**
     * @zh 获取连续被限流次数
     * @en Get consecutive limit count
     */
    get consecutiveLimitCount(): number {
        return this._consecutiveLimitCount;
    }

    /**
     * @zh 检查是否允许（不消费）
     * @en Check if allowed (without consuming)
     */
    check(messageType?: string): RateLimitResult {
        if (messageType && this._messageStrategies.has(messageType)) {
            return this._messageStrategies.get(messageType)!.getStatus(this._key);
        }

        return this._globalStrategy.getStatus(this._key);
    }

    /**
     * @zh 消费配额
     * @en Consume quota
     */
    consume(messageType?: string, cost: number = 1): RateLimitResult {
        let result: RateLimitResult;

        if (messageType && this._messageStrategies.has(messageType)) {
            result = this._messageStrategies.get(messageType)!.consume(this._key, cost);
        } else {
            result = this._globalStrategy.consume(this._key, cost);
        }

        if (result.allowed) {
            this._consecutiveLimitCount = 0;
        } else {
            this._consecutiveLimitCount++;
        }

        return result;
    }

    /**
     * @zh 重置限流状态
     * @en Reset rate limit status
     */
    reset(messageType?: string): void {
        if (messageType) {
            if (this._messageStrategies.has(messageType)) {
                this._messageStrategies.get(messageType)!.reset(this._key);
            }
        } else {
            this._globalStrategy.reset(this._key);
            for (const strategy of this._messageStrategies.values()) {
                strategy.reset(this._key);
            }
        }
    }

    /**
     * @zh 重置连续限流计数
     * @en Reset consecutive limit count
     */
    resetConsecutiveCount(): void {
        this._consecutiveLimitCount = 0;
    }

    /**
     * @zh 为特定消息类型设置独立的限流策略
     * @en Set independent rate limit strategy for specific message type
     *
     * @param messageType - @zh 消息类型 @en Message type
     * @param strategy - @zh 限流策略 @en Rate limit strategy
     */
    setMessageStrategy(messageType: string, strategy: IRateLimitStrategy): void {
        this._messageStrategies.set(messageType, strategy);
    }

    /**
     * @zh 移除特定消息类型的限流策略
     * @en Remove rate limit strategy for specific message type
     *
     * @param messageType - @zh 消息类型 @en Message type
     */
    removeMessageStrategy(messageType: string): void {
        this._messageStrategies.delete(messageType);
    }

    /**
     * @zh 检查是否有特定消息类型的限流策略
     * @en Check if has rate limit strategy for specific message type
     *
     * @param messageType - @zh 消息类型 @en Message type
     */
    hasMessageStrategy(messageType: string): boolean {
        return this._messageStrategies.has(messageType);
    }
}
