/**
 * @zh Tick 调度器
 * @en Tick Scheduler
 *
 * @zh 管理所有玩家会话的执行调度
 * @en Manages execution scheduling for all player sessions
 */

import type { BlueprintAsset } from '@esengine/blueprint';
import type { IIntent, IntentKeyExtractor } from '../intent/IntentTypes';
import type { IGameState } from '../vm/ServerExecutionContext';
import type { CPULimiterConfig } from '../vm/CPULimiter';
import { PlayerSession, type PlayerSessionConfig } from './PlayerSession';
import type { TickExecutionResult, PlayerTickResult } from './types';

/**
 * @zh 调度器配置
 * @en Scheduler configuration
 *
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 */
export interface TickSchedulerConfig<TIntent extends IIntent = IIntent> {
    /**
     * @zh 默认 CPU 配置
     * @en Default CPU configuration
     */
    readonly defaultCpuConfig?: Partial<CPULimiterConfig>;

    /**
     * @zh 默认意图键提取器
     * @en Default intent key extractor
     */
    readonly defaultIntentKeyExtractor?: IntentKeyExtractor<TIntent>;

    /**
     * @zh 是否并行执行玩家蓝图
     * @en Whether to execute player blueprints in parallel
     *
     * @default false
     */
    readonly parallel?: boolean;

    /**
     * @zh 调试模式
     * @en Debug mode
     */
    readonly debug?: boolean;
}

/**
 * @zh Tick 调度器
 * @en Tick Scheduler
 *
 * @zh 负责管理玩家会话并在每个 tick 执行所有玩家的蓝图
 * @en Responsible for managing player sessions and executing all player blueprints each tick
 *
 * @typeParam TGameState - @zh 游戏状态类型 @en Game state type
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 *
 * @example
 * ```typescript
 * const scheduler = new TickScheduler<MyGameState, MyIntent>({
 *     defaultCpuConfig: { maxCpuTime: 50 },
 *     defaultIntentKeyExtractor: (i) => `${i.type}:${i.unitId}`
 * });
 *
 * // 添加玩家
 * scheduler.addPlayer('player1', blueprint1);
 * scheduler.addPlayer('player2', blueprint2);
 *
 * // 执行 tick
 * const result = scheduler.executeTick(gameState);
 * ```
 */
export class TickScheduler<
    TGameState extends IGameState = IGameState,
    TIntent extends IIntent = IIntent
> {
    private readonly _sessions: Map<string, PlayerSession<TGameState, TIntent>> = new Map();
    private readonly _config: TickSchedulerConfig<TIntent>;

    constructor(config: TickSchedulerConfig<TIntent> = {}) {
        this._config = config;
    }

    // =========================================================================
    // 属性 | Properties
    // =========================================================================

    /**
     * @zh 获取玩家数量
     * @en Get player count
     */
    get playerCount(): number {
        return this._sessions.size;
    }

    /**
     * @zh 获取所有玩家 ID
     * @en Get all player IDs
     */
    get playerIds(): string[] {
        return Array.from(this._sessions.keys());
    }

    // =========================================================================
    // 玩家管理 | Player Management
    // =========================================================================

    /**
     * @zh 添加玩家
     * @en Add player
     *
     * @param playerId - @zh 玩家 ID @en Player ID
     * @param blueprint - @zh 蓝图资产 @en Blueprint asset
     * @param config - @zh 会话配置（可选，覆盖默认配置）@en Session config (optional, overrides defaults)
     * @returns @zh 创建的会话 @en Created session
     */
    addPlayer(
        playerId: string,
        blueprint: BlueprintAsset,
        config?: PlayerSessionConfig<TIntent>
    ): PlayerSession<TGameState, TIntent> {
        if (this._sessions.has(playerId)) {
            throw new Error(`Player ${playerId} already exists`);
        }

        const sessionConfig: PlayerSessionConfig<TIntent> = {
            cpuConfig: config?.cpuConfig ?? this._config.defaultCpuConfig,
            intentKeyExtractor: config?.intentKeyExtractor ?? this._config.defaultIntentKeyExtractor,
            debug: config?.debug ?? this._config.debug
        };

        const session = new PlayerSession<TGameState, TIntent>(playerId, blueprint, sessionConfig);
        this._sessions.set(playerId, session);
        return session;
    }

    /**
     * @zh 移除玩家
     * @en Remove player
     *
     * @param playerId - @zh 玩家 ID @en Player ID
     * @returns @zh 是否成功移除 @en Whether removed successfully
     */
    removePlayer(playerId: string): boolean {
        return this._sessions.delete(playerId);
    }

    /**
     * @zh 获取玩家会话
     * @en Get player session
     *
     * @param playerId - @zh 玩家 ID @en Player ID
     * @returns @zh 玩家会话（如果存在）@en Player session (if exists)
     */
    getSession(playerId: string): PlayerSession<TGameState, TIntent> | undefined {
        return this._sessions.get(playerId);
    }

    /**
     * @zh 检查玩家是否存在
     * @en Check if player exists
     */
    hasPlayer(playerId: string): boolean {
        return this._sessions.has(playerId);
    }

    /**
     * @zh 更新玩家蓝图
     * @en Update player blueprint
     *
     * @param playerId - @zh 玩家 ID @en Player ID
     * @param blueprint - @zh 新蓝图资产 @en New blueprint asset
     */
    updatePlayerBlueprint(
        playerId: string,
        blueprint: BlueprintAsset,
        config?: PlayerSessionConfig<TIntent>
    ): void {
        const existingSession = this._sessions.get(playerId);
        const memory = existingSession?.memory ?? {};

        this._sessions.delete(playerId);
        const newSession = this.addPlayer(playerId, blueprint, config);
        newSession.setMemory(memory as Record<string, unknown>);
    }

    // =========================================================================
    // Memory 管理 | Memory Management
    // =========================================================================

    /**
     * @zh 设置玩家 Memory
     * @en Set player Memory
     */
    setPlayerMemory(playerId: string, memory: Record<string, unknown>): void {
        const session = this._sessions.get(playerId);
        if (session) {
            session.setMemory(memory);
        }
    }

    /**
     * @zh 获取玩家 Memory
     * @en Get player Memory
     */
    getPlayerMemory(playerId: string): Readonly<Record<string, unknown>> | undefined {
        return this._sessions.get(playerId)?.memory;
    }

    /**
     * @zh 获取所有玩家的 Memory
     * @en Get all players' Memory
     */
    getAllMemories(): Map<string, Readonly<Record<string, unknown>>> {
        const result = new Map<string, Readonly<Record<string, unknown>>>();
        for (const [playerId, session] of this._sessions) {
            result.set(playerId, session.memory);
        }
        return result;
    }

    // =========================================================================
    // 执行 | Execution
    // =========================================================================

    /**
     * @zh 执行一个 tick
     * @en Execute one tick
     *
     * @param gameState - @zh 当前游戏状态 @en Current game state
     * @returns @zh Tick 执行结果 @en Tick execution result
     */
    executeTick(gameState: TGameState): TickExecutionResult<TIntent> {
        const startTime = performance.now();
        const playerResults = new Map<string, PlayerTickResult<TIntent>>();
        const allIntents: TIntent[] = [];
        let successCount = 0;
        let failureCount = 0;

        for (const [playerId, session] of this._sessions) {
            if (session.state === 'active') {
                const result = session.executeTick(gameState);
                playerResults.set(playerId, result);

                if (result.success) {
                    successCount++;
                    allIntents.push(...result.intents);
                } else {
                    failureCount++;
                }
            }
        }

        const duration = performance.now() - startTime;

        return {
            tick: gameState.tick,
            duration,
            playerResults,
            allIntents,
            successCount,
            failureCount
        };
    }

    /**
     * @zh 为指定玩家构建游戏状态视图
     * @en Build game state view for specified player
     *
     * @zh 由游戏项目实现，用于过滤玩家可见的游戏状态
     * @en Implemented by game project, used to filter player-visible game state
     */
    buildPlayerView?(gameState: TGameState, playerId: string): TGameState;

    /**
     * @zh 使用玩家视图执行 tick
     * @en Execute tick with player views
     *
     * @zh 如果提供了 buildPlayerView，则为每个玩家构建独立视图
     * @en If buildPlayerView is provided, builds independent view for each player
     */
    executeTickWithViews(
        gameState: TGameState,
        buildView: (gameState: TGameState, playerId: string) => TGameState
    ): TickExecutionResult<TIntent> {
        const startTime = performance.now();
        const playerResults = new Map<string, PlayerTickResult<TIntent>>();
        const allIntents: TIntent[] = [];
        let successCount = 0;
        let failureCount = 0;

        for (const [playerId, session] of this._sessions) {
            if (session.state === 'active') {
                const playerView = buildView(gameState, playerId);
                const result = session.executeTick(playerView);
                playerResults.set(playerId, result);

                if (result.success) {
                    successCount++;
                    allIntents.push(...result.intents);
                } else {
                    failureCount++;
                }
            }
        }

        const duration = performance.now() - startTime;

        return {
            tick: gameState.tick,
            duration,
            playerResults,
            allIntents,
            successCount,
            failureCount
        };
    }

    // =========================================================================
    // 状态管理 | State Management
    // =========================================================================

    /**
     * @zh 暂停所有玩家
     * @en Suspend all players
     */
    suspendAll(): void {
        for (const session of this._sessions.values()) {
            session.suspend();
        }
    }

    /**
     * @zh 恢复所有玩家
     * @en Resume all players
     */
    resumeAll(): void {
        for (const session of this._sessions.values()) {
            session.resume();
        }
    }

    /**
     * @zh 重置所有玩家
     * @en Reset all players
     */
    resetAll(): void {
        for (const session of this._sessions.values()) {
            session.reset();
        }
    }

    /**
     * @zh 清空所有玩家
     * @en Clear all players
     */
    clear(): void {
        this._sessions.clear();
    }

    // =========================================================================
    // 统计 | Statistics
    // =========================================================================

    /**
     * @zh 获取调度器统计信息
     * @en Get scheduler statistics
     */
    getStats(): SchedulerStats {
        let totalCpuUsed = 0;
        let totalTicksExecuted = 0;
        let activeCount = 0;
        let suspendedCount = 0;
        let errorCount = 0;

        for (const session of this._sessions.values()) {
            totalCpuUsed += session.totalCpuUsed;
            totalTicksExecuted += session.ticksExecuted;

            switch (session.state) {
                case 'active':
                    activeCount++;
                    break;
                case 'suspended':
                    suspendedCount++;
                    break;
                case 'error':
                    errorCount++;
                    break;
            }
        }

        return {
            playerCount: this._sessions.size,
            activeCount,
            suspendedCount,
            errorCount,
            totalCpuUsed,
            totalTicksExecuted,
            averageCpuPerPlayer: this._sessions.size > 0 ? totalCpuUsed / this._sessions.size : 0
        };
    }
}

/**
 * @zh 调度器统计信息
 * @en Scheduler statistics
 */
export interface SchedulerStats {
    readonly playerCount: number;
    readonly activeCount: number;
    readonly suspendedCount: number;
    readonly errorCount: number;
    readonly totalCpuUsed: number;
    readonly totalTicksExecuted: number;
    readonly averageCpuPerPlayer: number;
}
