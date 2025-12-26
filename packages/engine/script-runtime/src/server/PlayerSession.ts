/**
 * @zh 玩家会话
 * @en Player Session
 *
 * @zh 封装单个玩家的 VM 实例、蓝图和 Memory 状态
 * @en Encapsulates a single player's VM instance, blueprint and Memory state
 */

import type { BlueprintAsset } from '@esengine/blueprint';
import type { IIntent, IntentKeyExtractor } from '../intent/IntentTypes';
import type { IGameState } from '../vm/ServerExecutionContext';
import type { CPULimiterConfig } from '../vm/CPULimiter';
import { ServerBlueprintVM } from '../vm/ServerBlueprintVM';
import type { PlayerTickResult } from './types';

/**
 * @zh 玩家会话配置
 * @en Player session configuration
 *
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 */
export interface PlayerSessionConfig<TIntent extends IIntent = IIntent> {
    /**
     * @zh CPU 限制配置
     * @en CPU limit configuration
     */
    readonly cpuConfig?: Partial<CPULimiterConfig>;

    /**
     * @zh 意图键提取器
     * @en Intent key extractor
     */
    readonly intentKeyExtractor?: IntentKeyExtractor<TIntent>;

    /**
     * @zh 调试模式
     * @en Debug mode
     */
    readonly debug?: boolean;
}

/**
 * @zh 玩家会话状态
 * @en Player session state
 */
export type PlayerSessionState = 'active' | 'suspended' | 'error';

/**
 * @zh 玩家会话
 * @en Player Session
 *
 * @zh 管理单个玩家的蓝图执行环境
 * @en Manages a single player's blueprint execution environment
 *
 * @typeParam TGameState - @zh 游戏状态类型 @en Game state type
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 *
 * @example
 * ```typescript
 * const session = new PlayerSession<MyGameState, MyIntent>(
 *     'player1',
 *     playerBlueprint,
 *     { cpuConfig: { maxCpuTime: 50 } }
 * );
 *
 * const result = session.executeTick(gameState);
 * ```
 */
export class PlayerSession<
    TGameState extends IGameState = IGameState,
    TIntent extends IIntent = IIntent
> {
    private readonly _playerId: string;
    private readonly _vm: ServerBlueprintVM<TGameState, TIntent>;
    private _memory: Record<string, unknown>;
    private _state: PlayerSessionState = 'active';
    private _lastError: string | null = null;
    private _totalCpuUsed: number = 0;
    private _ticksExecuted: number = 0;

    /**
     * @param playerId - @zh 玩家 ID @en Player ID
     * @param blueprint - @zh 蓝图资产 @en Blueprint asset
     * @param config - @zh 配置选项 @en Configuration options
     */
    constructor(
        playerId: string,
        blueprint: BlueprintAsset,
        config: PlayerSessionConfig<TIntent> = {}
    ) {
        this._playerId = playerId;
        this._memory = {};
        this._vm = new ServerBlueprintVM<TGameState, TIntent>(playerId, blueprint, {
            cpuConfig: config.cpuConfig,
            intentKeyExtractor: config.intentKeyExtractor,
            debug: config.debug
        });
    }

    // =========================================================================
    // 属性 | Properties
    // =========================================================================

    /**
     * @zh 获取玩家 ID
     * @en Get player ID
     */
    get playerId(): string {
        return this._playerId;
    }

    /**
     * @zh 获取会话状态
     * @en Get session state
     */
    get state(): PlayerSessionState {
        return this._state;
    }

    /**
     * @zh 获取最后一次错误
     * @en Get last error
     */
    get lastError(): string | null {
        return this._lastError;
    }

    /**
     * @zh 获取累计 CPU 使用时间
     * @en Get total CPU time used
     */
    get totalCpuUsed(): number {
        return this._totalCpuUsed;
    }

    /**
     * @zh 获取已执行的 tick 数
     * @en Get number of ticks executed
     */
    get ticksExecuted(): number {
        return this._ticksExecuted;
    }

    /**
     * @zh 获取当前 Memory
     * @en Get current Memory
     */
    get memory(): Readonly<Record<string, unknown>> {
        return this._memory;
    }

    /**
     * @zh 获取底层 VM 实例
     * @en Get underlying VM instance
     */
    get vm(): ServerBlueprintVM<TGameState, TIntent> {
        return this._vm;
    }

    // =========================================================================
    // Memory 管理 | Memory Management
    // =========================================================================

    /**
     * @zh 设置 Memory
     * @en Set Memory
     */
    setMemory(memory: Record<string, unknown>): void {
        this._memory = { ...memory };
    }

    /**
     * @zh 更新 Memory（合并）
     * @en Update Memory (merge)
     */
    updateMemory(updates: Record<string, unknown>): void {
        this._memory = { ...this._memory, ...updates };
    }

    /**
     * @zh 清空 Memory
     * @en Clear Memory
     */
    clearMemory(): void {
        this._memory = {};
    }

    // =========================================================================
    // 执行 | Execution
    // =========================================================================

    /**
     * @zh 执行一个 tick
     * @en Execute one tick
     *
     * @param gameState - @zh 当前游戏状态 @en Current game state
     * @returns @zh 执行结果 @en Execution result
     */
    executeTick(gameState: TGameState): PlayerTickResult<TIntent> {
        if (this._state === 'suspended') {
            return this._createSkippedResult('Session is suspended');
        }

        try {
            const result = this._vm.executeTick(gameState, this._memory);

            this._memory = result.memory;
            this._totalCpuUsed += result.cpu.used;
            this._ticksExecuted++;

            if (!result.success && result.errors.length > 0) {
                this._lastError = result.errors[0];
            }

            return {
                playerId: this._playerId,
                success: result.success,
                cpu: result.cpu,
                intents: result.intents,
                logs: result.logs,
                errors: result.errors,
                memory: result.memory
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this._state = 'error';
            this._lastError = errorMessage;

            return this._createSkippedResult(errorMessage);
        }
    }

    // =========================================================================
    // 状态管理 | State Management
    // =========================================================================

    /**
     * @zh 暂停会话
     * @en Suspend session
     */
    suspend(): void {
        this._state = 'suspended';
    }

    /**
     * @zh 恢复会话
     * @en Resume session
     */
    resume(): void {
        if (this._state === 'suspended') {
            this._state = 'active';
        }
    }

    /**
     * @zh 重置会话
     * @en Reset session
     */
    reset(): void {
        this._vm.reset();
        this._state = 'active';
        this._lastError = null;
        this._totalCpuUsed = 0;
        this._ticksExecuted = 0;
    }

    /**
     * @zh 从错误状态恢复
     * @en Recover from error state
     */
    recover(): void {
        if (this._state === 'error') {
            this._vm.reset();
            this._state = 'active';
            this._lastError = null;
        }
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    private _createSkippedResult(error: string): PlayerTickResult<TIntent> {
        return {
            playerId: this._playerId,
            success: false,
            cpu: { used: 0, limit: 0, bucket: 0, steps: 0, maxSteps: 0, exceeded: false },
            intents: [],
            logs: [],
            errors: [error],
            memory: this._memory
        };
    }
}
