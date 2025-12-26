/**
 * @zh 定时器服务实现
 * @en Timer Service Implementation
 *
 * @zh 提供定时器调度和冷却管理的默认实现
 * @en Provides default implementation for timer scheduling and cooldown management
 */

import type {
    ITimerService,
    TimerHandle,
    TimerInfo,
    TimerCallback,
    CooldownInfo
} from './ITimerService';

// =============================================================================
// 内部类型 | Internal Types
// =============================================================================

/**
 * @zh 内部定时器数据
 * @en Internal timer data
 */
interface InternalTimer {
    id: string;
    callback: TimerCallback;
    remaining: number;
    repeating: boolean;
    interval: number;
    cancelled: boolean;
}

/**
 * @zh 内部冷却数据
 * @en Internal cooldown data
 */
interface InternalCooldown {
    id: string;
    duration: number;
    remaining: number;
}

// =============================================================================
// 定时器句柄实现 | Timer Handle Implementation
// =============================================================================

/**
 * @zh 定时器句柄实现
 * @en Timer handle implementation
 */
class TimerHandleImpl implements TimerHandle {
    private timer: InternalTimer;

    constructor(timer: InternalTimer) {
        this.timer = timer;
    }

    get id(): string {
        return this.timer.id;
    }

    get isValid(): boolean {
        return !this.timer.cancelled;
    }

    cancel(): void {
        this.timer.cancelled = true;
    }
}

// =============================================================================
// 定时器服务实现 | Timer Service Implementation
// =============================================================================

/**
 * @zh 定时器服务配置
 * @en Timer service configuration
 */
export interface TimerServiceConfig {
    /**
     * @zh 最大定时器数量（0 表示无限制）
     * @en Maximum number of timers (0 for unlimited)
     */
    maxTimers?: number;

    /**
     * @zh 最大冷却数量（0 表示无限制）
     * @en Maximum number of cooldowns (0 for unlimited)
     */
    maxCooldowns?: number;
}

/**
 * @zh 定时器服务实现
 * @en Timer service implementation
 *
 * @example
 * ```typescript
 * const timerService = new TimerService();
 *
 * // 一次性定时器 | One-time timer
 * const handle = timerService.schedule('myTimer', 1000, () => {
 *     console.log('Timer fired!');
 * });
 *
 * // 重复定时器 | Repeating timer
 * timerService.scheduleRepeating('heartbeat', 100, () => {
 *     console.log('Tick');
 * });
 *
 * // 冷却系统 | Cooldown system
 * timerService.startCooldown('skill_fireball', 5000);
 * if (timerService.isCooldownReady('skill_fireball')) {
 *     // 可以使用技能 | Can use skill
 * }
 *
 * // 每帧更新 | Update each frame
 * timerService.update(deltaTime);
 * ```
 */
export class TimerService implements ITimerService {
    private timers: Map<string, InternalTimer> = new Map();
    private cooldowns: Map<string, InternalCooldown> = new Map();
    private config: Required<TimerServiceConfig>;

    constructor(config: TimerServiceConfig = {}) {
        this.config = {
            maxTimers: config.maxTimers ?? 0,
            maxCooldowns: config.maxCooldowns ?? 0
        };
    }

    // =========================================================================
    // 定时器 API | Timer API
    // =========================================================================

    schedule(id: string, delay: number, callback: TimerCallback): TimerHandle {
        this.cancelById(id);

        if (this.config.maxTimers > 0 && this.timers.size >= this.config.maxTimers) {
            throw new Error(`Maximum timer limit reached: ${this.config.maxTimers}`);
        }

        const timer: InternalTimer = {
            id,
            callback,
            remaining: Math.max(0, delay),
            repeating: false,
            interval: 0,
            cancelled: false
        };

        this.timers.set(id, timer);
        return new TimerHandleImpl(timer);
    }

    scheduleRepeating(
        id: string,
        interval: number,
        callback: TimerCallback,
        immediate = false
    ): TimerHandle {
        this.cancelById(id);

        if (this.config.maxTimers > 0 && this.timers.size >= this.config.maxTimers) {
            throw new Error(`Maximum timer limit reached: ${this.config.maxTimers}`);
        }

        const safeInterval = Math.max(1, interval);

        const timer: InternalTimer = {
            id,
            callback,
            remaining: immediate ? 0 : safeInterval,
            repeating: true,
            interval: safeInterval,
            cancelled: false
        };

        this.timers.set(id, timer);
        return new TimerHandleImpl(timer);
    }

    cancel(handle: TimerHandle): void {
        handle.cancel();
        this.timers.delete(handle.id);
    }

    cancelById(id: string): void {
        const timer = this.timers.get(id);
        if (timer) {
            timer.cancelled = true;
            this.timers.delete(id);
        }
    }

    hasTimer(id: string): boolean {
        const timer = this.timers.get(id);
        return timer !== undefined && !timer.cancelled;
    }

    getTimerInfo(id: string): TimerInfo | null {
        const timer = this.timers.get(id);
        if (!timer || timer.cancelled) {
            return null;
        }

        return {
            id: timer.id,
            remaining: timer.remaining,
            repeating: timer.repeating,
            interval: timer.repeating ? timer.interval : undefined
        };
    }

    // =========================================================================
    // 冷却 API | Cooldown API
    // =========================================================================

    startCooldown(id: string, duration: number): void {
        if (this.config.maxCooldowns > 0 && !this.cooldowns.has(id)) {
            if (this.cooldowns.size >= this.config.maxCooldowns) {
                throw new Error(`Maximum cooldown limit reached: ${this.config.maxCooldowns}`);
            }
        }

        const safeDuration = Math.max(0, duration);

        this.cooldowns.set(id, {
            id,
            duration: safeDuration,
            remaining: safeDuration
        });
    }

    isOnCooldown(id: string): boolean {
        const cooldown = this.cooldowns.get(id);
        return cooldown !== undefined && cooldown.remaining > 0;
    }

    isCooldownReady(id: string): boolean {
        return !this.isOnCooldown(id);
    }

    getCooldownRemaining(id: string): number {
        const cooldown = this.cooldowns.get(id);
        return cooldown ? Math.max(0, cooldown.remaining) : 0;
    }

    getCooldownProgress(id: string): number {
        const cooldown = this.cooldowns.get(id);
        if (!cooldown || cooldown.duration <= 0) {
            return 1;
        }

        const elapsed = cooldown.duration - cooldown.remaining;
        return Math.min(1, Math.max(0, elapsed / cooldown.duration));
    }

    getCooldownInfo(id: string): CooldownInfo | null {
        const cooldown = this.cooldowns.get(id);
        if (!cooldown) {
            return null;
        }

        const remaining = Math.max(0, cooldown.remaining);
        const progress = cooldown.duration > 0
            ? Math.min(1, (cooldown.duration - remaining) / cooldown.duration)
            : 1;

        return {
            id: cooldown.id,
            duration: cooldown.duration,
            remaining,
            progress,
            isReady: remaining <= 0
        };
    }

    resetCooldown(id: string): void {
        this.cooldowns.delete(id);
    }

    clearAllCooldowns(): void {
        this.cooldowns.clear();
    }

    // =========================================================================
    // 更新 | Update
    // =========================================================================

    update(deltaTime: number): void {
        if (deltaTime <= 0) {
            return;
        }

        this.updateTimers(deltaTime);
        this.updateCooldowns(deltaTime);
    }

    private updateTimers(deltaTime: number): void {
        const toRemove: string[] = [];

        for (const [id, timer] of this.timers) {
            if (timer.cancelled) {
                toRemove.push(id);
                continue;
            }

            timer.remaining -= deltaTime;

            if (timer.remaining <= 0) {
                try {
                    timer.callback();
                } catch (error) {
                    console.error(`Timer callback error [${id}]:`, error);
                }

                if (timer.repeating && !timer.cancelled) {
                    timer.remaining += timer.interval;
                    if (timer.remaining < 0) {
                        timer.remaining = timer.interval;
                    }
                } else {
                    timer.cancelled = true;
                    toRemove.push(id);
                }
            }
        }

        for (const id of toRemove) {
            this.timers.delete(id);
        }
    }

    private updateCooldowns(deltaTime: number): void {
        const toRemove: string[] = [];

        for (const [id, cooldown] of this.cooldowns) {
            cooldown.remaining -= deltaTime;

            if (cooldown.remaining <= 0) {
                toRemove.push(id);
            }
        }

        for (const id of toRemove) {
            this.cooldowns.delete(id);
        }
    }

    clear(): void {
        for (const timer of this.timers.values()) {
            timer.cancelled = true;
        }
        this.timers.clear();
        this.cooldowns.clear();
    }

    // =========================================================================
    // 调试 | Debug
    // =========================================================================

    /**
     * @zh 获取活跃定时器数量
     * @en Get active timer count
     */
    get activeTimerCount(): number {
        return this.timers.size;
    }

    /**
     * @zh 获取活跃冷却数量
     * @en Get active cooldown count
     */
    get activeCooldownCount(): number {
        return this.cooldowns.size;
    }

    /**
     * @zh 获取所有活跃定时器 ID
     * @en Get all active timer IDs
     */
    getActiveTimerIds(): string[] {
        return Array.from(this.timers.keys());
    }

    /**
     * @zh 获取所有活跃冷却 ID
     * @en Get all active cooldown IDs
     */
    getActiveCooldownIds(): string[] {
        return Array.from(this.cooldowns.keys());
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建定时器服务
 * @en Create timer service
 *
 * @param config - @zh 配置选项 @en Configuration options
 * @returns @zh 定时器服务实例 @en Timer service instance
 */
export function createTimerService(config?: TimerServiceConfig): ITimerService {
    return new TimerService(config);
}
