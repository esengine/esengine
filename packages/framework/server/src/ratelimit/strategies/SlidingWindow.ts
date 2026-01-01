/**
 * @zh 滑动窗口速率限制策略
 * @en Sliding window rate limit strategy
 */

import type { IRateLimitStrategy, RateLimitResult, StrategyConfig } from '../types.js';

/**
 * @zh 滑动窗口状态
 * @en Sliding window state
 */
interface WindowState {
    /**
     * @zh 请求时间戳列表
     * @en Request timestamp list
     */
    timestamps: number[];
}

/**
 * @zh 滑动窗口速率限制策略
 * @en Sliding window rate limit strategy
 *
 * @zh 滑动窗口算法精确跟踪时间窗口内的请求数。
 * 比固定窗口更精确，但内存开销稍大。
 * @en Sliding window algorithm precisely tracks requests within a time window.
 * More accurate than fixed window, but with slightly higher memory overhead.
 *
 * @example
 * ```typescript
 * const strategy = new SlidingWindowStrategy({
 *     rate: 10,       // 10 requests per second
 *     capacity: 10    // window size (same as rate for 1-second window)
 * });
 *
 * const result = strategy.consume('player-123');
 * if (result.allowed) {
 *     // Process message
 * }
 * ```
 */
export class SlidingWindowStrategy implements IRateLimitStrategy {
    readonly name = 'sliding-window';

    private _rate: number;
    private _capacity: number;
    private _windowMs: number;
    private _windows: Map<string, WindowState> = new Map();

    /**
     * @zh 创建滑动窗口策略
     * @en Create sliding window strategy
     *
     * @param config - @zh 配置 @en Configuration
     * @param config.rate - @zh 每秒允许的请求数 @en Requests allowed per second
     * @param config.capacity - @zh 窗口容量 @en Window capacity
     */
    constructor(config: StrategyConfig) {
        this._rate = config.rate;
        this._capacity = config.capacity;
        this._windowMs = 1000;
    }

    /**
     * @zh 尝试消费配额
     * @en Try to consume quota
     */
    consume(key: string, cost: number = 1): RateLimitResult {
        const now = Date.now();
        const window = this._getOrCreateWindow(key);

        this._cleanExpiredTimestamps(window, now);

        const currentCount = window.timestamps.length;

        if (currentCount + cost <= this._capacity) {
            for (let i = 0; i < cost; i++) {
                window.timestamps.push(now);
            }

            return {
                allowed: true,
                remaining: this._capacity - window.timestamps.length,
                resetAt: this._getResetAt(window, now)
            };
        }

        const oldestTimestamp = window.timestamps[0] || now;
        const retryAfter = Math.max(0, oldestTimestamp + this._windowMs - now);

        return {
            allowed: false,
            remaining: 0,
            resetAt: oldestTimestamp + this._windowMs,
            retryAfter
        };
    }

    /**
     * @zh 获取当前状态
     * @en Get current status
     */
    getStatus(key: string): RateLimitResult {
        const now = Date.now();
        const window = this._windows.get(key);

        if (!window) {
            return {
                allowed: true,
                remaining: this._capacity,
                resetAt: now + this._windowMs
            };
        }

        this._cleanExpiredTimestamps(window, now);

        const remaining = Math.max(0, this._capacity - window.timestamps.length);

        return {
            allowed: remaining > 0,
            remaining,
            resetAt: this._getResetAt(window, now)
        };
    }

    /**
     * @zh 重置指定键
     * @en Reset specified key
     */
    reset(key: string): void {
        this._windows.delete(key);
    }

    /**
     * @zh 清理所有过期记录
     * @en Clean up all expired records
     */
    cleanup(): void {
        const now = Date.now();

        for (const [key, window] of this._windows) {
            this._cleanExpiredTimestamps(window, now);

            if (window.timestamps.length === 0) {
                this._windows.delete(key);
            }
        }
    }

    /**
     * @zh 获取或创建窗口
     * @en Get or create window
     */
    private _getOrCreateWindow(key: string): WindowState {
        let window = this._windows.get(key);

        if (!window) {
            window = { timestamps: [] };
            this._windows.set(key, window);
        }

        return window;
    }

    /**
     * @zh 清理过期的时间戳
     * @en Clean expired timestamps
     */
    private _cleanExpiredTimestamps(window: WindowState, now: number): void {
        const cutoff = now - this._windowMs;
        window.timestamps = window.timestamps.filter((ts) => ts > cutoff);
    }

    /**
     * @zh 获取重置时间
     * @en Get reset time
     */
    private _getResetAt(window: WindowState, now: number): number {
        if (window.timestamps.length === 0) {
            return now + this._windowMs;
        }

        return window.timestamps[0] + this._windowMs;
    }
}

/**
 * @zh 创建滑动窗口策略
 * @en Create sliding window strategy
 *
 * @example
 * ```typescript
 * const strategy = createSlidingWindowStrategy({
 *     rate: 10,
 *     capacity: 10
 * });
 * ```
 */
export function createSlidingWindowStrategy(config: StrategyConfig): SlidingWindowStrategy {
    return new SlidingWindowStrategy(config);
}
