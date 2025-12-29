/**
 * @zh 速率限制类型定义
 * @en Rate limit type definitions
 */

import type { Player } from '../room/Player.js';

/**
 * @zh 速率限制结果
 * @en Rate limit result
 */
export interface RateLimitResult {
    /**
     * @zh 是否允许
     * @en Whether allowed
     */
    allowed: boolean;

    /**
     * @zh 剩余配额
     * @en Remaining quota
     */
    remaining: number;

    /**
     * @zh 配额重置时间（毫秒时间戳）
     * @en Quota reset time (milliseconds timestamp)
     */
    resetAt: number;

    /**
     * @zh 重试等待时间（毫秒），仅在被限流时返回
     * @en Retry after time (milliseconds), only returned when rate limited
     */
    retryAfter?: number;
}

/**
 * @zh 速率限制策略接口
 * @en Rate limit strategy interface
 */
export interface IRateLimitStrategy {
    /**
     * @zh 策略名称
     * @en Strategy name
     */
    readonly name: string;

    /**
     * @zh 尝试消费配额
     * @en Try to consume quota
     *
     * @param key - @zh 限流键（通常是玩家ID或连接ID）@en Rate limit key (usually player ID or connection ID)
     * @param cost - @zh 消费数量（默认1）@en Consumption amount (default 1)
     * @returns @zh 限流结果 @en Rate limit result
     */
    consume(key: string, cost?: number): RateLimitResult;

    /**
     * @zh 获取当前状态（不消费）
     * @en Get current status (without consuming)
     *
     * @param key - @zh 限流键 @en Rate limit key
     * @returns @zh 限流结果 @en Rate limit result
     */
    getStatus(key: string): RateLimitResult;

    /**
     * @zh 重置指定键的限流状态
     * @en Reset rate limit status for specified key
     *
     * @param key - @zh 限流键 @en Rate limit key
     */
    reset(key: string): void;

    /**
     * @zh 清理所有过期的限流记录
     * @en Clean up all expired rate limit records
     */
    cleanup(): void;
}

/**
 * @zh 速率限制策略类型
 * @en Rate limit strategy type
 */
export type RateLimitStrategyType = 'token-bucket' | 'sliding-window' | 'fixed-window';

/**
 * @zh 速率限制配置
 * @en Rate limit configuration
 */
export interface RateLimitConfig {
    /**
     * @zh 每秒允许的消息数
     * @en Messages allowed per second
     * @defaultValue 10
     */
    messagesPerSecond?: number;

    /**
     * @zh 突发容量（令牌桶大小）
     * @en Burst capacity (token bucket size)
     * @defaultValue 20
     */
    burstSize?: number;

    /**
     * @zh 限流策略
     * @en Rate limit strategy
     * @defaultValue 'token-bucket'
     */
    strategy?: RateLimitStrategyType;

    /**
     * @zh 被限流时的回调
     * @en Callback when rate limited
     */
    onLimited?: (player: Player, messageType: string, result: RateLimitResult) => void;

    /**
     * @zh 是否在限流时断开连接
     * @en Whether to disconnect when rate limited
     * @defaultValue false
     */
    disconnectOnLimit?: boolean;

    /**
     * @zh 连续被限流多少次后断开连接（0 表示不断开）
     * @en Disconnect after how many consecutive rate limits (0 means never)
     * @defaultValue 0
     */
    maxConsecutiveLimits?: number;

    /**
     * @zh 获取限流键的函数（默认使用玩家ID）
     * @en Function to get rate limit key (default uses player ID)
     */
    getKey?: (player: Player) => string;

    /**
     * @zh 清理间隔（毫秒）
     * @en Cleanup interval (milliseconds)
     * @defaultValue 60000
     */
    cleanupInterval?: number;
}

/**
 * @zh 单个消息的速率限制配置
 * @en Rate limit configuration for individual message
 */
export interface MessageRateLimitConfig {
    /**
     * @zh 每秒允许的消息数
     * @en Messages allowed per second
     */
    messagesPerSecond?: number;

    /**
     * @zh 突发容量
     * @en Burst capacity
     */
    burstSize?: number;

    /**
     * @zh 消费的令牌数（默认1）
     * @en Tokens to consume (default 1)
     */
    cost?: number;
}

/**
 * @zh 速率限制元数据
 * @en Rate limit metadata
 */
export interface RateLimitMetadata {
    /**
     * @zh 是否启用速率限制
     * @en Whether rate limit is enabled
     */
    enabled: boolean;

    /**
     * @zh 是否豁免速率限制
     * @en Whether exempt from rate limit
     */
    exempt?: boolean;

    /**
     * @zh 自定义配置
     * @en Custom configuration
     */
    config?: MessageRateLimitConfig;
}

/**
 * @zh 速率限制上下文接口
 * @en Rate limit context interface
 */
export interface IRateLimitContext {
    /**
     * @zh 检查是否允许（不消费）
     * @en Check if allowed (without consuming)
     */
    check(messageType?: string): RateLimitResult;

    /**
     * @zh 消费配额
     * @en Consume quota
     */
    consume(messageType?: string, cost?: number): RateLimitResult;

    /**
     * @zh 重置限流状态
     * @en Reset rate limit status
     */
    reset(messageType?: string): void;

    /**
     * @zh 获取连续被限流次数
     * @en Get consecutive limit count
     */
    readonly consecutiveLimitCount: number;

    /**
     * @zh 重置连续限流计数
     * @en Reset consecutive limit count
     */
    resetConsecutiveCount(): void;
}

/**
 * @zh 带速率限制的 Room 接口
 * @en Room interface with rate limit
 */
export interface RateLimitedRoom {
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
}

/**
 * @zh 速率限制策略配置
 * @en Rate limit strategy configuration
 */
export interface StrategyConfig {
    /**
     * @zh 每秒允许的请求数
     * @en Requests allowed per second
     */
    rate: number;

    /**
     * @zh 容量/窗口大小
     * @en Capacity/window size
     */
    capacity: number;
}
