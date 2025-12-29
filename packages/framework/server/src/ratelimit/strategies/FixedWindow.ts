/**
 * @zh 固定窗口速率限制策略
 * @en Fixed window rate limit strategy
 */

import type { IRateLimitStrategy, RateLimitResult, StrategyConfig } from '../types.js';

/**
 * @zh 固定窗口状态
 * @en Fixed window state
 */
interface WindowState {
    /**
     * @zh 当前窗口计数
     * @en Current window count
     */
    count: number;

    /**
     * @zh 窗口开始时间
     * @en Window start time
     */
    windowStart: number;
}

/**
 * @zh 固定窗口速率限制策略
 * @en Fixed window rate limit strategy
 *
 * @zh 固定窗口算法将时间划分为固定长度的窗口，在每个窗口内计数请求。
 * 实现简单，内存开销小，但在窗口边界可能有两倍突发的问题。
 * @en Fixed window algorithm divides time into fixed-length windows and counts requests in each window.
 * Simple to implement with low memory overhead, but may have 2x burst issue at window boundaries.
 *
 * @example
 * ```typescript
 * const strategy = new FixedWindowStrategy({
 *     rate: 10,       // 10 requests per second
 *     capacity: 10    // same as rate for 1-second window
 * });
 *
 * const result = strategy.consume('player-123');
 * if (result.allowed) {
 *     // Process message
 * }
 * ```
 */
export class FixedWindowStrategy implements IRateLimitStrategy {
    readonly name = 'fixed-window';

    private _rate: number;
    private _capacity: number;
    private _windowMs: number;
    private _windows: Map<string, WindowState> = new Map();

    /**
     * @zh 创建固定窗口策略
     * @en Create fixed window strategy
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
        const window = this._getOrCreateWindow(key, now);

        this._maybeResetWindow(window, now);

        if (window.count + cost <= this._capacity) {
            window.count += cost;

            return {
                allowed: true,
                remaining: this._capacity - window.count,
                resetAt: window.windowStart + this._windowMs
            };
        }

        const retryAfter = window.windowStart + this._windowMs - now;

        return {
            allowed: false,
            remaining: 0,
            resetAt: window.windowStart + this._windowMs,
            retryAfter: Math.max(0, retryAfter)
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
                resetAt: this._getWindowStart(now) + this._windowMs
            };
        }

        this._maybeResetWindow(window, now);

        const remaining = Math.max(0, this._capacity - window.count);

        return {
            allowed: remaining > 0,
            remaining,
            resetAt: window.windowStart + this._windowMs
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
        const currentWindowStart = this._getWindowStart(now);

        for (const [key, window] of this._windows) {
            if (window.windowStart < currentWindowStart - this._windowMs) {
                this._windows.delete(key);
            }
        }
    }

    /**
     * @zh 获取或创建窗口
     * @en Get or create window
     */
    private _getOrCreateWindow(key: string, now: number): WindowState {
        let window = this._windows.get(key);

        if (!window) {
            window = {
                count: 0,
                windowStart: this._getWindowStart(now)
            };
            this._windows.set(key, window);
        }

        return window;
    }

    /**
     * @zh 如果需要则重置窗口
     * @en Reset window if needed
     */
    private _maybeResetWindow(window: WindowState, now: number): void {
        const currentWindowStart = this._getWindowStart(now);

        if (window.windowStart < currentWindowStart) {
            window.count = 0;
            window.windowStart = currentWindowStart;
        }
    }

    /**
     * @zh 获取窗口开始时间
     * @en Get window start time
     */
    private _getWindowStart(now: number): number {
        return Math.floor(now / this._windowMs) * this._windowMs;
    }
}

/**
 * @zh 创建固定窗口策略
 * @en Create fixed window strategy
 *
 * @example
 * ```typescript
 * const strategy = createFixedWindowStrategy({
 *     rate: 10,
 *     capacity: 10
 * });
 * ```
 */
export function createFixedWindowStrategy(config: StrategyConfig): FixedWindowStrategy {
    return new FixedWindowStrategy(config);
}
