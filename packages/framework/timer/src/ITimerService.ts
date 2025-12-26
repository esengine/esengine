/**
 * @zh 定时器服务接口
 * @en Timer Service Interfaces
 *
 * @zh 提供定时器和冷却系统的核心接口
 * @en Provides core interfaces for timer and cooldown systems
 */

// =============================================================================
// 定时器句柄 | Timer Handle
// =============================================================================

/**
 * @zh 定时器句柄，用于取消定时器
 * @en Timer handle for cancelling timers
 */
export interface TimerHandle {
    /**
     * @zh 定时器 ID
     * @en Timer ID
     */
    readonly id: string;

    /**
     * @zh 是否有效（未被取消）
     * @en Whether the timer is still valid (not cancelled)
     */
    readonly isValid: boolean;

    /**
     * @zh 取消定时器
     * @en Cancel the timer
     */
    cancel(): void;
}

// =============================================================================
// 定时器信息 | Timer Info
// =============================================================================

/**
 * @zh 定时器信息
 * @en Timer information
 */
export interface TimerInfo {
    /**
     * @zh 定时器 ID
     * @en Timer ID
     */
    readonly id: string;

    /**
     * @zh 剩余时间（毫秒）
     * @en Remaining time in milliseconds
     */
    readonly remaining: number;

    /**
     * @zh 是否重复执行
     * @en Whether the timer repeats
     */
    readonly repeating: boolean;

    /**
     * @zh 间隔时间（毫秒，仅重复定时器）
     * @en Interval in milliseconds (only for repeating timers)
     */
    readonly interval?: number;
}

// =============================================================================
// 冷却信息 | Cooldown Info
// =============================================================================

/**
 * @zh 冷却信息
 * @en Cooldown information
 */
export interface CooldownInfo {
    /**
     * @zh 冷却 ID
     * @en Cooldown ID
     */
    readonly id: string;

    /**
     * @zh 总持续时间（毫秒）
     * @en Total duration in milliseconds
     */
    readonly duration: number;

    /**
     * @zh 剩余时间（毫秒）
     * @en Remaining time in milliseconds
     */
    readonly remaining: number;

    /**
     * @zh 进度（0-1，0 表示刚开始，1 表示结束）
     * @en Progress from 0 to 1 (0 = just started, 1 = finished)
     */
    readonly progress: number;

    /**
     * @zh 是否已就绪（冷却完成）
     * @en Whether the cooldown is ready (finished)
     */
    readonly isReady: boolean;
}

// =============================================================================
// 定时器回调 | Timer Callbacks
// =============================================================================

/**
 * @zh 定时器回调函数
 * @en Timer callback function
 */
export type TimerCallback = () => void;

/**
 * @zh 带时间参数的定时器回调
 * @en Timer callback with time parameter
 */
export type TimerCallbackWithTime = (deltaTime: number) => void;

// =============================================================================
// 定时器服务接口 | Timer Service Interface
// =============================================================================

/**
 * @zh 定时器服务接口
 * @en Timer service interface
 *
 * @zh 提供定时器调度和冷却管理功能
 * @en Provides timer scheduling and cooldown management
 */
export interface ITimerService {
    // =========================================================================
    // 定时器 API | Timer API
    // =========================================================================

    /**
     * @zh 调度一次性定时器
     * @en Schedule a one-time timer
     *
     * @param id - @zh 定时器标识 @en Timer identifier
     * @param delay - @zh 延迟时间（毫秒）@en Delay in milliseconds
     * @param callback - @zh 回调函数 @en Callback function
     * @returns @zh 定时器句柄 @en Timer handle
     */
    schedule(id: string, delay: number, callback: TimerCallback): TimerHandle;

    /**
     * @zh 调度重复定时器
     * @en Schedule a repeating timer
     *
     * @param id - @zh 定时器标识 @en Timer identifier
     * @param interval - @zh 间隔时间（毫秒）@en Interval in milliseconds
     * @param callback - @zh 回调函数 @en Callback function
     * @param immediate - @zh 是否立即执行一次 @en Whether to execute immediately
     * @returns @zh 定时器句柄 @en Timer handle
     */
    scheduleRepeating(
        id: string,
        interval: number,
        callback: TimerCallback,
        immediate?: boolean
    ): TimerHandle;

    /**
     * @zh 取消定时器
     * @en Cancel a timer
     *
     * @param handle - @zh 定时器句柄 @en Timer handle
     */
    cancel(handle: TimerHandle): void;

    /**
     * @zh 通过 ID 取消定时器
     * @en Cancel timer by ID
     *
     * @param id - @zh 定时器标识 @en Timer identifier
     */
    cancelById(id: string): void;

    /**
     * @zh 检查定时器是否存在
     * @en Check if a timer exists
     *
     * @param id - @zh 定时器标识 @en Timer identifier
     * @returns @zh 是否存在 @en Whether the timer exists
     */
    hasTimer(id: string): boolean;

    /**
     * @zh 获取定时器信息
     * @en Get timer information
     *
     * @param id - @zh 定时器标识 @en Timer identifier
     * @returns @zh 定时器信息或 null @en Timer info or null
     */
    getTimerInfo(id: string): TimerInfo | null;

    // =========================================================================
    // 冷却 API | Cooldown API
    // =========================================================================

    /**
     * @zh 开始冷却
     * @en Start a cooldown
     *
     * @param id - @zh 冷却标识 @en Cooldown identifier
     * @param duration - @zh 持续时间（毫秒）@en Duration in milliseconds
     */
    startCooldown(id: string, duration: number): void;

    /**
     * @zh 检查是否在冷却中
     * @en Check if on cooldown
     *
     * @param id - @zh 冷却标识 @en Cooldown identifier
     * @returns @zh 是否在冷却中 @en Whether on cooldown
     */
    isOnCooldown(id: string): boolean;

    /**
     * @zh 检查冷却是否就绪
     * @en Check if cooldown is ready
     *
     * @param id - @zh 冷却标识 @en Cooldown identifier
     * @returns @zh 是否已就绪 @en Whether ready
     */
    isCooldownReady(id: string): boolean;

    /**
     * @zh 获取剩余冷却时间
     * @en Get remaining cooldown time
     *
     * @param id - @zh 冷却标识 @en Cooldown identifier
     * @returns @zh 剩余时间（毫秒），0 表示无冷却 @en Remaining time in ms, 0 if no cooldown
     */
    getCooldownRemaining(id: string): number;

    /**
     * @zh 获取冷却进度
     * @en Get cooldown progress
     *
     * @param id - @zh 冷却标识 @en Cooldown identifier
     * @returns @zh 进度（0-1），1 表示完成或无冷却 @en Progress 0-1, 1 if done or no cooldown
     */
    getCooldownProgress(id: string): number;

    /**
     * @zh 获取冷却信息
     * @en Get cooldown information
     *
     * @param id - @zh 冷却标识 @en Cooldown identifier
     * @returns @zh 冷却信息或 null @en Cooldown info or null
     */
    getCooldownInfo(id: string): CooldownInfo | null;

    /**
     * @zh 重置冷却
     * @en Reset a cooldown
     *
     * @param id - @zh 冷却标识 @en Cooldown identifier
     */
    resetCooldown(id: string): void;

    /**
     * @zh 清除所有冷却
     * @en Clear all cooldowns
     */
    clearAllCooldowns(): void;

    // =========================================================================
    // 更新 | Update
    // =========================================================================

    /**
     * @zh 更新定时器服务
     * @en Update timer service
     *
     * @param deltaTime - @zh 距上次更新的时间（毫秒）@en Time since last update in ms
     */
    update(deltaTime: number): void;

    /**
     * @zh 清除所有定时器和冷却
     * @en Clear all timers and cooldowns
     */
    clear(): void;
}
