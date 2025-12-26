/**
 * @zh 服务器端类型定义
 * @en Server-side type definitions
 */

import type { IIntent } from '../intent/IntentTypes';
import type { IGameState, LogEntry } from '../vm/ServerExecutionContext';
import type { CPUStats } from '../vm/CPULimiter';

// =============================================================================
// 玩家会话类型 | Player Session Types
// =============================================================================

/**
 * @zh 玩家执行结果
 * @en Player execution result
 *
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 */
export interface PlayerTickResult<TIntent extends IIntent = IIntent> {
    /**
     * @zh 玩家 ID
     * @en Player ID
     */
    readonly playerId: string;

    /**
     * @zh 是否执行成功
     * @en Whether execution succeeded
     */
    readonly success: boolean;

    /**
     * @zh CPU 使用统计
     * @en CPU usage statistics
     */
    readonly cpu: CPUStats;

    /**
     * @zh 收集的意图列表
     * @en Collected intents list
     */
    readonly intents: readonly TIntent[];

    /**
     * @zh 日志列表
     * @en Log list
     */
    readonly logs: readonly LogEntry[];

    /**
     * @zh 错误列表
     * @en Error list
     */
    readonly errors: readonly string[];

    /**
     * @zh 更新后的 Memory
     * @en Updated Memory
     */
    readonly memory: Record<string, unknown>;
}

// =============================================================================
// Tick 调度类型 | Tick Scheduler Types
// =============================================================================

/**
 * @zh Tick 执行结果
 * @en Tick execution result
 *
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 */
export interface TickExecutionResult<TIntent extends IIntent = IIntent> {
    /**
     * @zh 当前 tick
     * @en Current tick
     */
    readonly tick: number;

    /**
     * @zh 执行耗时（毫秒）
     * @en Execution duration (milliseconds)
     */
    readonly duration: number;

    /**
     * @zh 所有玩家的执行结果
     * @en All players' execution results
     */
    readonly playerResults: ReadonlyMap<string, PlayerTickResult<TIntent>>;

    /**
     * @zh 所有收集的意图（合并后）
     * @en All collected intents (merged)
     */
    readonly allIntents: readonly TIntent[];

    /**
     * @zh 成功执行的玩家数
     * @en Number of successfully executed players
     */
    readonly successCount: number;

    /**
     * @zh 执行失败的玩家数
     * @en Number of failed players
     */
    readonly failureCount: number;
}

// =============================================================================
// 意图处理类型 | Intent Processing Types
// =============================================================================

/**
 * @zh 意图处理结果
 * @en Intent processing result
 *
 * @typeParam TGameState - @zh 游戏状态类型 @en Game state type
 */
export interface IntentProcessingResult<TGameState extends IGameState = IGameState> {
    /**
     * @zh 更新后的游戏状态
     * @en Updated game state
     */
    readonly gameState: TGameState;

    /**
     * @zh 处理的意图数量
     * @en Number of processed intents
     */
    readonly processedCount: number;

    /**
     * @zh 被拒绝的意图数量
     * @en Number of rejected intents
     */
    readonly rejectedCount: number;

    /**
     * @zh 处理错误
     * @en Processing errors
     */
    readonly errors: readonly string[];
}

// =============================================================================
// 游戏循环类型 | Game Loop Types
// =============================================================================

/**
 * @zh 游戏循环配置
 * @en Game loop configuration
 */
export interface GameLoopConfig {
    /**
     * @zh Tick 间隔（毫秒）
     * @en Tick interval (milliseconds)
     *
     * @default 1000
     */
    readonly tickInterval?: number;

    /**
     * @zh 最大追赶 tick 数（如果落后太多）
     * @en Maximum catch-up ticks (if falling behind)
     *
     * @default 5
     */
    readonly maxCatchUpTicks?: number;

    /**
     * @zh 是否在 tick 之间保存 Memory
     * @en Whether to save Memory between ticks
     *
     * @default true
     */
    readonly autoSaveMemory?: boolean;

    /**
     * @zh Memory 保存间隔（tick 数）
     * @en Memory save interval (in ticks)
     *
     * @default 10
     */
    readonly memorySaveInterval?: number;
}

/**
 * @zh 游戏循环状态
 * @en Game loop state
 */
export type GameLoopState = 'idle' | 'running' | 'paused' | 'stopping';

/**
 * @zh 游戏循环事件
 * @en Game loop events
 */
export interface GameLoopEvents<
    TGameState extends IGameState = IGameState,
    TIntent extends IIntent = IIntent
> {
    /**
     * @zh Tick 开始前
     * @en Before tick starts
     */
    onTickStart?: (tick: number) => void | Promise<void>;

    /**
     * @zh 玩家蓝图执行完成后
     * @en After player blueprints executed
     */
    onPlayersExecuted?: (result: TickExecutionResult<TIntent>) => void | Promise<void>;

    /**
     * @zh 意图处理完成后
     * @en After intents processed
     */
    onIntentsProcessed?: (result: IntentProcessingResult<TGameState>) => void | Promise<void>;

    /**
     * @zh Tick 结束后
     * @en After tick ends
     */
    onTickEnd?: (tick: number, gameState: TGameState) => void | Promise<void>;

    /**
     * @zh 发生错误时
     * @en When error occurs
     */
    onError?: (error: Error, tick: number) => void | Promise<void>;
}
