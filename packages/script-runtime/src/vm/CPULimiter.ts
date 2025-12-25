/**
 * @zh CPU 限制器
 * @en CPU Limiter
 *
 * @zh 限制蓝图执行的 CPU 时间和执行步数
 * @en Limits CPU time and execution steps for blueprint execution
 */

/**
 * @zh CPU 限制器配置
 * @en CPU limiter configuration
 */
export interface CPULimiterConfig {
    /**
     * @zh 每 tick 的 CPU 时间限制（毫秒）
     * @en CPU time limit per tick (milliseconds)
     */
    cpuLimitMs: number;

    /**
     * @zh 每 tick 的最大执行步数
     * @en Maximum execution steps per tick
     */
    maxSteps: number;

    /**
     * @zh CPU 桶最大值
     * @en CPU bucket maximum
     */
    bucketMax: number;

    /**
     * @zh 每 tick 恢复的 CPU 量
     * @en CPU amount recovered per tick
     */
    bucketRecovery: number;
}

/**
 * @zh 默认 CPU 限制配置
 * @en Default CPU limit configuration
 */
export const DEFAULT_CPU_CONFIG: CPULimiterConfig = {
    cpuLimitMs: 100,        // 100ms per tick
    maxSteps: 10000,        // 10000 steps per tick
    bucketMax: 10000,       // 10000ms max bucket
    bucketRecovery: 100     // 100ms per tick recovery
};

/**
 * @zh CPU 使用统计
 * @en CPU usage statistics
 */
export interface CPUStats {
    /**
     * @zh 已使用的 CPU 时间（毫秒）
     * @en Used CPU time (milliseconds)
     */
    used: number;

    /**
     * @zh CPU 限制（毫秒）
     * @en CPU limit (milliseconds)
     */
    limit: number;

    /**
     * @zh 已执行的步数
     * @en Executed steps
     */
    steps: number;

    /**
     * @zh 最大步数
     * @en Maximum steps
     */
    maxSteps: number;

    /**
     * @zh 当前桶值
     * @en Current bucket value
     */
    bucket: number;

    /**
     * @zh 是否超出限制
     * @en Whether exceeded limit
     */
    exceeded: boolean;
}

/**
 * @zh CPU 限制器
 * @en CPU Limiter
 *
 * @zh 用于限制玩家蓝图的执行资源，类似 Screeps 的 CPU 系统
 * @en Used to limit player blueprint execution resources, similar to Screeps CPU system
 *
 * @example
 * ```typescript
 * const limiter = new CPULimiter('player1', config);
 *
 * // 开始执行 | Start execution
 * limiter.start();
 *
 * // 在执行节点时检查 | Check during node execution
 * if (limiter.checkStep()) {
 *     // 继续执行 | Continue execution
 * } else {
 *     // 超出限制，停止执行 | Exceeded limit, stop execution
 * }
 *
 * // 结束执行 | End execution
 * limiter.end();
 * console.log(`Used: ${limiter.getUsed()}ms`);
 * ```
 */
export class CPULimiter {
    /**
     * @zh 玩家 ID
     * @en Player ID
     */
    private readonly _playerId: string;

    /**
     * @zh 配置
     * @en Configuration
     */
    private readonly _config: CPULimiterConfig;

    /**
     * @zh 开始时间
     * @en Start time
     */
    private _startTime: number = 0;

    /**
     * @zh 已使用的 CPU 时间
     * @en Used CPU time
     */
    private _usedCpu: number = 0;

    /**
     * @zh 已执行的步数
     * @en Executed steps
     */
    private _steps: number = 0;

    /**
     * @zh CPU 桶（累积的 CPU 配额）
     * @en CPU bucket (accumulated CPU quota)
     */
    private _bucket: number;

    /**
     * @zh 是否正在执行
     * @en Whether currently executing
     */
    private _isRunning: boolean = false;

    /**
     * @zh 是否超出限制
     * @en Whether exceeded limit
     */
    private _exceeded: boolean = false;

    constructor(playerId: string, config: Partial<CPULimiterConfig> = {}) {
        this._playerId = playerId;
        this._config = { ...DEFAULT_CPU_CONFIG, ...config };
        this._bucket = this._config.bucketMax;
    }

    /**
     * @zh 获取玩家 ID
     * @en Get player ID
     */
    get playerId(): string {
        return this._playerId;
    }

    /**
     * @zh 获取当前 CPU 桶值
     * @en Get current CPU bucket value
     */
    get bucket(): number {
        return this._bucket;
    }

    /**
     * @zh 获取 CPU 限制
     * @en Get CPU limit
     */
    get limit(): number {
        return this._config.cpuLimitMs;
    }

    /**
     * @zh 是否超出限制
     * @en Whether exceeded limit
     */
    get exceeded(): boolean {
        return this._exceeded;
    }

    /**
     * @zh 开始计时
     * @en Start timing
     */
    start(): void {
        this._startTime = performance.now();
        this._usedCpu = 0;
        this._steps = 0;
        this._exceeded = false;
        this._isRunning = true;
    }

    /**
     * @zh 结束计时并更新桶
     * @en End timing and update bucket
     */
    end(): void {
        if (!this._isRunning) return;

        this._usedCpu = performance.now() - this._startTime;
        this._isRunning = false;

        // 从桶中扣除使用的 CPU | Deduct used CPU from bucket
        this._bucket -= this._usedCpu;
        if (this._bucket < 0) {
            this._bucket = 0;
        }
    }

    /**
     * @zh 获取已使用的 CPU 时间
     * @en Get used CPU time
     */
    getUsed(): number {
        if (this._isRunning) {
            return performance.now() - this._startTime;
        }
        return this._usedCpu;
    }

    /**
     * @zh 获取已执行的步数
     * @en Get executed steps
     */
    getSteps(): number {
        return this._steps;
    }

    /**
     * @zh 检查是否可以继续执行一步
     * @en Check if can continue executing one step
     *
     * @returns @zh true 如果可以继续，false 如果超出限制 @en true if can continue, false if exceeded
     */
    checkStep(): boolean {
        this._steps++;

        // 检查步数限制 | Check step limit
        if (this._steps > this._config.maxSteps) {
            this._exceeded = true;
            return false;
        }

        // 检查 CPU 时间限制 | Check CPU time limit
        const currentTime = performance.now() - this._startTime;
        const effectiveLimit = Math.min(this._config.cpuLimitMs, this._bucket);

        if (currentTime > effectiveLimit) {
            this._exceeded = true;
            return false;
        }

        return true;
    }

    /**
     * @zh 每 tick 恢复桶
     * @en Recover bucket per tick
     */
    recoverBucket(): void {
        this._bucket += this._config.bucketRecovery;
        if (this._bucket > this._config.bucketMax) {
            this._bucket = this._config.bucketMax;
        }
    }

    /**
     * @zh 获取 CPU 统计信息
     * @en Get CPU statistics
     */
    getStats(): CPUStats {
        return {
            used: this.getUsed(),
            limit: this._config.cpuLimitMs,
            steps: this._steps,
            maxSteps: this._config.maxSteps,
            bucket: this._bucket,
            exceeded: this._exceeded
        };
    }

    /**
     * @zh 重置限制器（用于测试）
     * @en Reset limiter (for testing)
     */
    reset(): void {
        this._startTime = 0;
        this._usedCpu = 0;
        this._steps = 0;
        this._exceeded = false;
        this._isRunning = false;
        this._bucket = this._config.bucketMax;
    }
}
