/**
 * @zh 游戏主循环
 * @en Game Main Loop
 *
 * @zh 协调玩家蓝图执行、意图处理和状态更新
 * @en Coordinates player blueprint execution, intent processing, and state updates
 */

import type { IIntent } from '../intent/IntentTypes';
import type { IGameState } from '../vm/ServerExecutionContext';
import type { IMemoryStore } from '../persistence/IMemoryStore';
import type { TickScheduler } from './TickScheduler';
import type { IIntentProcessor } from './IIntentProcessor';
import type {
    GameLoopConfig,
    GameLoopState,
    GameLoopEvents,
    TickExecutionResult,
    IntentProcessingResult
} from './types';

/**
 * @zh 默认游戏循环配置
 * @en Default game loop configuration
 */
export const DEFAULT_GAME_LOOP_CONFIG: Required<GameLoopConfig> = {
    tickInterval: 1000,
    maxCatchUpTicks: 5,
    autoSaveMemory: true,
    memorySaveInterval: 10
};

/**
 * @zh 游戏循环统计
 * @en Game loop statistics
 */
export interface GameLoopStats {
    readonly currentTick: number;
    readonly state: GameLoopState;
    readonly totalTicksProcessed: number;
    readonly averageTickDuration: number;
    readonly lastTickDuration: number;
    readonly skippedTicks: number;
}

/**
 * @zh 游戏主循环
 * @en Game Main Loop
 *
 * @zh 完整的游戏循环实现，协调各组件工作
 * @en Complete game loop implementation, coordinating all components
 *
 * @typeParam TGameState - @zh 游戏状态类型 @en Game state type
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 *
 * @example
 * ```typescript
 * const gameLoop = new GameLoop<MyGameState, MyIntent>({
 *     scheduler,
 *     intentProcessor,
 *     memoryStore,
 *     getGameState: () => gameWorld.getState(),
 *     updateGameState: (state) => gameWorld.setState(state),
 *     config: { tickInterval: 1000 }
 * });
 *
 * // 启动游戏循环
 * await gameLoop.start();
 *
 * // 稍后停止
 * await gameLoop.stop();
 * ```
 */
export class GameLoop<
    TGameState extends IGameState = IGameState,
    TIntent extends IIntent = IIntent
> {
    private readonly _scheduler: TickScheduler<TGameState, TIntent>;
    private readonly _intentProcessor: IIntentProcessor<TGameState, TIntent>;
    private readonly _memoryStore: IMemoryStore | null;
    private readonly _getGameState: () => TGameState;
    private readonly _updateGameState: (state: TGameState) => void;
    private readonly _config: Required<GameLoopConfig>;
    private readonly _events: GameLoopEvents<TGameState, TIntent>;

    private _state: GameLoopState = 'idle';
    private _currentTick: number = 0;
    private _timerId: ReturnType<typeof setTimeout> | null = null;
    private _lastTickTime: number = 0;
    private _totalTicksProcessed: number = 0;
    private _totalTickDuration: number = 0;
    private _lastTickDuration: number = 0;
    private _skippedTicks: number = 0;
    private _ticksSinceLastSave: number = 0;

    constructor(options: {
        scheduler: TickScheduler<TGameState, TIntent>;
        intentProcessor: IIntentProcessor<TGameState, TIntent>;
        memoryStore?: IMemoryStore;
        getGameState: () => TGameState;
        updateGameState: (state: TGameState) => void;
        config?: GameLoopConfig;
        events?: GameLoopEvents<TGameState, TIntent>;
    }) {
        this._scheduler = options.scheduler;
        this._intentProcessor = options.intentProcessor;
        this._memoryStore = options.memoryStore ?? null;
        this._getGameState = options.getGameState;
        this._updateGameState = options.updateGameState;
        this._config = { ...DEFAULT_GAME_LOOP_CONFIG, ...options.config };
        this._events = options.events ?? {};
    }

    // =========================================================================
    // 属性 | Properties
    // =========================================================================

    /**
     * @zh 获取当前状态
     * @en Get current state
     */
    get state(): GameLoopState {
        return this._state;
    }

    /**
     * @zh 获取当前 tick
     * @en Get current tick
     */
    get currentTick(): number {
        return this._currentTick;
    }

    /**
     * @zh 获取调度器
     * @en Get scheduler
     */
    get scheduler(): TickScheduler<TGameState, TIntent> {
        return this._scheduler;
    }

    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    /**
     * @zh 启动游戏循环
     * @en Start game loop
     *
     * @param startTick - @zh 起始 tick（可选）@en Starting tick (optional)
     */
    async start(startTick?: number): Promise<void> {
        if (this._state === 'running') {
            return;
        }

        if (startTick !== undefined) {
            this._currentTick = startTick;
        }

        this._state = 'running';
        this._lastTickTime = performance.now();

        this._scheduleNextTick();
    }

    /**
     * @zh 停止游戏循环
     * @en Stop game loop
     */
    async stop(): Promise<void> {
        if (this._state !== 'running' && this._state !== 'paused') {
            return;
        }

        this._state = 'stopping';

        if (this._timerId !== null) {
            clearTimeout(this._timerId);
            this._timerId = null;
        }

        if (this._config.autoSaveMemory && this._memoryStore) {
            await this._saveAllMemory();
        }

        this._state = 'idle';
    }

    /**
     * @zh 暂停游戏循环
     * @en Pause game loop
     */
    pause(): void {
        if (this._state === 'running') {
            this._state = 'paused';
            if (this._timerId !== null) {
                clearTimeout(this._timerId);
                this._timerId = null;
            }
        }
    }

    /**
     * @zh 恢复游戏循环
     * @en Resume game loop
     */
    resume(): void {
        if (this._state === 'paused') {
            this._state = 'running';
            this._lastTickTime = performance.now();
            this._scheduleNextTick();
        }
    }

    // =========================================================================
    // 手动执行 | Manual Execution
    // =========================================================================

    /**
     * @zh 手动执行单个 tick
     * @en Manually execute a single tick
     *
     * @zh 用于测试或单步调试
     * @en For testing or step-by-step debugging
     */
    async executeSingleTick(): Promise<{
        playerResults: TickExecutionResult<TIntent>;
        intentResults: IntentProcessingResult<TGameState>;
    }> {
        const gameState = this._getGameState();
        const stateWithTick = this._withTick(gameState, this._currentTick);

        await this._events.onTickStart?.(this._currentTick);

        const playerResults = this._scheduler.executeTick(stateWithTick);
        await this._events.onPlayersExecuted?.(playerResults);

        const intentResults = this._intentProcessor.process(stateWithTick, playerResults.allIntents);
        await this._events.onIntentsProcessed?.(intentResults);

        this._updateGameState(intentResults.gameState);

        await this._events.onTickEnd?.(this._currentTick, intentResults.gameState);

        this._currentTick++;

        return { playerResults, intentResults };
    }

    // =========================================================================
    // 统计 | Statistics
    // =========================================================================

    /**
     * @zh 获取统计信息
     * @en Get statistics
     */
    getStats(): GameLoopStats {
        return {
            currentTick: this._currentTick,
            state: this._state,
            totalTicksProcessed: this._totalTicksProcessed,
            averageTickDuration: this._totalTicksProcessed > 0
                ? this._totalTickDuration / this._totalTicksProcessed
                : 0,
            lastTickDuration: this._lastTickDuration,
            skippedTicks: this._skippedTicks
        };
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    private _scheduleNextTick(): void {
        if (this._state !== 'running') {
            return;
        }

        const now = performance.now();
        const elapsed = now - this._lastTickTime;
        const delay = Math.max(0, this._config.tickInterval - elapsed);

        this._timerId = setTimeout(() => {
            this._runTick().catch(error => {
                this._events.onError?.(error, this._currentTick);
            });
        }, delay);
    }

    private async _runTick(): Promise<void> {
        if (this._state !== 'running') {
            return;
        }

        const tickStartTime = performance.now();

        try {
            await this.executeSingleTick();

            this._lastTickDuration = performance.now() - tickStartTime;
            this._totalTickDuration += this._lastTickDuration;
            this._totalTicksProcessed++;

            this._ticksSinceLastSave++;
            if (
                this._config.autoSaveMemory &&
                this._memoryStore &&
                this._ticksSinceLastSave >= this._config.memorySaveInterval
            ) {
                await this._saveAllMemory();
                this._ticksSinceLastSave = 0;
            }

            this._handleCatchUp(tickStartTime);

        } catch (error) {
            await this._events.onError?.(
                error instanceof Error ? error : new Error(String(error)),
                this._currentTick
            );
        }

        this._lastTickTime = performance.now();
        this._scheduleNextTick();
    }

    private _handleCatchUp(tickStartTime: number): void {
        const tickEndTime = performance.now();
        const tickDuration = tickEndTime - tickStartTime;

        if (tickDuration > this._config.tickInterval) {
            const missedTicks = Math.floor(tickDuration / this._config.tickInterval);
            const ticksToSkip = Math.min(missedTicks, this._config.maxCatchUpTicks);

            if (ticksToSkip > 0) {
                this._skippedTicks += ticksToSkip;
                this._currentTick += ticksToSkip;
            }
        }
    }

    private async _saveAllMemory(): Promise<void> {
        if (!this._memoryStore) return;

        const entries: Array<{ playerId: string; memory: Record<string, unknown> }> = [];

        for (const playerId of this._scheduler.playerIds) {
            const memory = this._scheduler.getPlayerMemory(playerId);
            if (memory) {
                entries.push({ playerId, memory: memory as Record<string, unknown> });
            }
        }

        if (entries.length > 0) {
            await this._memoryStore.savePlayerMemoryBatch(entries);
        }
    }

    private _withTick(state: TGameState, tick: number): TGameState {
        return {
            ...state,
            tick,
            deltaTime: this._config.tickInterval / 1000
        };
    }
}
