/**
 * @zh 令牌桶速率限制策略
 * @en Token bucket rate limit strategy
 */

import type { IRateLimitStrategy, RateLimitResult, StrategyConfig } from '../types.js';

/**
 * @zh 令牌桶状态
 * @en Token bucket state
 */
interface BucketState {
    /**
     * @zh 当前令牌数
     * @en Current token count
     */
    tokens: number;

    /**
     * @zh 上次更新时间
     * @en Last update time
     */
    lastUpdate: number;
}

/**
 * @zh 令牌桶速率限制策略
 * @en Token bucket rate limit strategy
 *
 * @zh 令牌桶算法允许突发流量，同时保持长期速率限制。
 * 令牌以固定速率添加到桶中，每个请求消耗一个或多个令牌。
 * @en Token bucket algorithm allows burst traffic while maintaining long-term rate limit.
 * Tokens are added to the bucket at a fixed rate, each request consumes one or more tokens.
 *
 * @example
 * ```typescript
 * const strategy = new TokenBucketStrategy({
 *     rate: 10,      // 10 tokens per second
 *     capacity: 20   // bucket can hold 20 tokens max
 * });
 *
 * const result = strategy.consume('player-123');
 * if (result.allowed) {
 *     // Process message
 * }
 * ```
 */
export class TokenBucketStrategy implements IRateLimitStrategy {
    readonly name = 'token-bucket';

    private _rate: number;
    private _capacity: number;
    private _buckets: Map<string, BucketState> = new Map();

    /**
     * @zh 创建令牌桶策略
     * @en Create token bucket strategy
     *
     * @param config - @zh 配置 @en Configuration
     * @param config.rate - @zh 每秒添加的令牌数 @en Tokens added per second
     * @param config.capacity - @zh 桶容量（最大令牌数）@en Bucket capacity (max tokens)
     */
    constructor(config: StrategyConfig) {
        this._rate = config.rate;
        this._capacity = config.capacity;
    }

    /**
     * @zh 尝试消费令牌
     * @en Try to consume tokens
     */
    consume(key: string, cost: number = 1): RateLimitResult {
        const now = Date.now();
        const bucket = this._getOrCreateBucket(key, now);

        this._refillBucket(bucket, now);

        if (bucket.tokens >= cost) {
            bucket.tokens -= cost;
            return {
                allowed: true,
                remaining: Math.floor(bucket.tokens),
                resetAt: now + Math.ceil((this._capacity - bucket.tokens) / this._rate * 1000)
            };
        }

        const tokensNeeded = cost - bucket.tokens;
        const retryAfter = Math.ceil(tokensNeeded / this._rate * 1000);

        return {
            allowed: false,
            remaining: 0,
            resetAt: now + retryAfter,
            retryAfter
        };
    }

    /**
     * @zh 获取当前状态
     * @en Get current status
     */
    getStatus(key: string): RateLimitResult {
        const now = Date.now();
        const bucket = this._buckets.get(key);

        if (!bucket) {
            return {
                allowed: true,
                remaining: this._capacity,
                resetAt: now
            };
        }

        this._refillBucket(bucket, now);

        return {
            allowed: bucket.tokens >= 1,
            remaining: Math.floor(bucket.tokens),
            resetAt: now + Math.ceil((this._capacity - bucket.tokens) / this._rate * 1000)
        };
    }

    /**
     * @zh 重置指定键
     * @en Reset specified key
     */
    reset(key: string): void {
        this._buckets.delete(key);
    }

    /**
     * @zh 清理所有记录
     * @en Clean up all records
     */
    cleanup(): void {
        const now = Date.now();
        const expireThreshold = 60000;

        for (const [key, bucket] of this._buckets) {
            if (now - bucket.lastUpdate > expireThreshold && bucket.tokens >= this._capacity) {
                this._buckets.delete(key);
            }
        }
    }

    /**
     * @zh 获取或创建桶
     * @en Get or create bucket
     */
    private _getOrCreateBucket(key: string, now: number): BucketState {
        let bucket = this._buckets.get(key);

        if (!bucket) {
            bucket = {
                tokens: this._capacity,
                lastUpdate: now
            };
            this._buckets.set(key, bucket);
        }

        return bucket;
    }

    /**
     * @zh 补充令牌
     * @en Refill tokens
     */
    private _refillBucket(bucket: BucketState, now: number): void {
        const elapsed = now - bucket.lastUpdate;
        const tokensToAdd = (elapsed / 1000) * this._rate;

        bucket.tokens = Math.min(this._capacity, bucket.tokens + tokensToAdd);
        bucket.lastUpdate = now;
    }
}

/**
 * @zh 创建令牌桶策略
 * @en Create token bucket strategy
 *
 * @example
 * ```typescript
 * const strategy = createTokenBucketStrategy({
 *     rate: 10,
 *     capacity: 20
 * });
 * ```
 */
export function createTokenBucketStrategy(config: StrategyConfig): TokenBucketStrategy {
    return new TokenBucketStrategy(config);
}
