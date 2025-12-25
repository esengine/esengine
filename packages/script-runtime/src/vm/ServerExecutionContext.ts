/**
 * @zh 服务器端执行上下文
 * @en Server-side Execution Context
 *
 * @zh 扩展 Blueprint 的 ExecutionContext，添加服务器端特性
 * @en Extends Blueprint's ExecutionContext with server-side features
 */

import type { BlueprintAsset } from '@esengine/blueprint';
import type { IIntent } from '../intent/IntentTypes';
import type { IIntentCollector } from '../intent/IntentCollector';
import type { CPULimiter } from './CPULimiter';

// =============================================================================
// 基础游戏状态接口 | Base Game State Interface
// =============================================================================

/**
 * @zh 基础游戏状态接口（引擎级别）
 * @en Base game state interface (engine level)
 *
 * @zh 引擎只定义最基础的时间信息，具体的游戏状态由游戏项目扩展
 * @en Engine only defines basic timing info, specific game state is extended by game projects
 *
 * @example
 * ```typescript
 * // 游戏项目中扩展游戏状态 | Extend game state in game project
 * interface MyGameState extends IGameState {
 *     units: Map<string, IUnitState>;
 *     buildings: Map<string, IBuildingState>;
 * }
 * ```
 */
export interface IGameState {
    /**
     * @zh 当前 tick
     * @en Current tick
     */
    tick: number;

    /**
     * @zh 自上次 tick 的时间间隔
     * @en Time interval since last tick
     */
    deltaTime: number;
}

// =============================================================================
// 日志接口 | Log Interface
// =============================================================================

/**
 * @zh 日志条目
 * @en Log entry
 */
export interface LogEntry {
    level: 'log' | 'warn' | 'error';
    message: string;
    timestamp: number;
    tick: number;
}

// =============================================================================
// 服务器执行上下文 | Server Execution Context
// =============================================================================

/**
 * @zh 服务器端执行上下文
 * @en Server-side Execution Context
 *
 * @zh 提供蓝图执行时访问游戏状态和收集意图的能力
 * @en Provides ability to access game state and collect intents during blueprint execution
 *
 * @typeParam TGameState - @zh 游戏状态类型，由游戏项目定义 @en Game state type, defined by game project
 * @typeParam TIntent - @zh 意图类型，由游戏项目定义 @en Intent type, defined by game project
 *
 * @example
 * ```typescript
 * // 游戏项目中定义具体类型 | Define specific types in game project
 * interface MyGameState extends IGameState {
 *     units: Map<string, IUnit>;
 *     resources: Map<string, IResource>;
 * }
 *
 * interface MyIntent extends IIntent {
 *     readonly type: 'unit.move' | 'unit.attack';
 *     unitId: string;
 * }
 *
 * // 创建上下文 | Create context
 * const context = new ServerExecutionContext<MyGameState, MyIntent>(blueprint, 'player1');
 * ```
 */
export class ServerExecutionContext<
    TGameState extends IGameState = IGameState,
    TIntent extends IIntent = IIntent
> {
    /**
     * @zh 蓝图资产
     * @en Blueprint asset
     */
    readonly blueprint: BlueprintAsset;

    /**
     * @zh 玩家 ID
     * @en Player ID
     */
    readonly playerId: string;

    /**
     * @zh 当前游戏状态
     * @en Current game state
     */
    private _gameState: TGameState | null = null;

    /**
     * @zh 意图收集器
     * @en Intent collector
     */
    private _intentCollector: IIntentCollector<TIntent> | null = null;

    /**
     * @zh CPU 限制器
     * @en CPU limiter
     */
    private _cpuLimiter: CPULimiter | null = null;

    /**
     * @zh 玩家持久化数据（Memory）
     * @en Player persistent data (Memory)
     */
    private _memory: Record<string, unknown> = {};

    /**
     * @zh 日志列表
     * @en Log list
     */
    private _logs: LogEntry[] = [];

    /**
     * @zh 帧增量时间
     * @en Frame delta time
     */
    deltaTime: number = 0;

    /**
     * @zh 自开始以来的总时间
     * @en Total time since start
     */
    time: number = 0;

    /**
     * @zh 节点输出缓存
     * @en Node output cache
     */
    private _outputCache: Map<string, Record<string, unknown>> = new Map();

    /**
     * @zh 实例变量
     * @en Instance variables
     */
    private _instanceVariables: Map<string, unknown> = new Map();

    /**
     * @zh 局部变量
     * @en Local variables
     */
    private _localVariables: Map<string, unknown> = new Map();

    /**
     * @zh 全局变量（所有玩家共享）
     * @en Global variables (shared by all players)
     */
    private static _globalVariables: Map<string, unknown> = new Map();

    constructor(blueprint: BlueprintAsset, playerId: string) {
        this.blueprint = blueprint;
        this.playerId = playerId;

        for (const variable of blueprint.variables) {
            if (variable.scope === 'instance') {
                this._instanceVariables.set(variable.name, variable.defaultValue);
            }
        }
    }

    // =========================================================================
    // 游戏状态访问 | Game State Access
    // =========================================================================

    /**
     * @zh 设置当前游戏状态
     * @en Set current game state
     */
    setGameState(state: TGameState): void {
        this._gameState = state;
        this.deltaTime = state.deltaTime;
    }

    /**
     * @zh 获取当前游戏状态
     * @en Get current game state
     */
    getGameState(): TGameState | null {
        return this._gameState;
    }

    /**
     * @zh 获取当前 tick
     * @en Get current tick
     */
    getTick(): number {
        return this._gameState?.tick ?? 0;
    }

    // =========================================================================
    // 意图收集 | Intent Collection
    // =========================================================================

    /**
     * @zh 设置意图收集器
     * @en Set intent collector
     */
    setIntentCollector(collector: IIntentCollector<TIntent>): void {
        this._intentCollector = collector;
    }

    /**
     * @zh 获取意图收集器
     * @en Get intent collector
     */
    get intentCollector(): IIntentCollector<TIntent> | null {
        return this._intentCollector;
    }

    // =========================================================================
    // CPU 限制 | CPU Limiting
    // =========================================================================

    /**
     * @zh 设置 CPU 限制器
     * @en Set CPU limiter
     */
    setCPULimiter(limiter: CPULimiter): void {
        this._cpuLimiter = limiter;
    }

    /**
     * @zh 获取 CPU 限制器
     * @en Get CPU limiter
     */
    get cpuLimiter(): CPULimiter | null {
        return this._cpuLimiter;
    }

    /**
     * @zh 检查是否可以继续执行
     * @en Check if can continue execution
     */
    checkCPU(): boolean {
        return this._cpuLimiter?.checkStep() ?? true;
    }

    // =========================================================================
    // Memory 访问 | Memory Access
    // =========================================================================

    /**
     * @zh 设置玩家 Memory
     * @en Set player Memory
     */
    setMemory(memory: Record<string, unknown>): void {
        this._memory = memory;
    }

    /**
     * @zh 获取玩家 Memory
     * @en Get player Memory
     */
    getMemory(): Record<string, unknown> {
        return this._memory;
    }

    /**
     * @zh 获取 Memory 中的值
     * @en Get value from Memory
     */
    getMemoryValue<T>(key: string): T | undefined {
        return this._memory[key] as T | undefined;
    }

    /**
     * @zh 设置 Memory 中的值
     * @en Set value in Memory
     */
    setMemoryValue(key: string, value: unknown): void {
        this._memory[key] = value;
    }

    // =========================================================================
    // 日志 | Logging
    // =========================================================================

    /**
     * @zh 添加日志
     * @en Add log
     */
    log(message: string): void {
        this._logs.push({
            level: 'log',
            message,
            timestamp: Date.now(),
            tick: this.getTick()
        });
    }

    /**
     * @zh 添加警告
     * @en Add warning
     */
    warn(message: string): void {
        this._logs.push({
            level: 'warn',
            message,
            timestamp: Date.now(),
            tick: this.getTick()
        });
    }

    /**
     * @zh 添加错误
     * @en Add error
     */
    error(message: string): void {
        this._logs.push({
            level: 'error',
            message,
            timestamp: Date.now(),
            tick: this.getTick()
        });
    }

    /**
     * @zh 获取日志列表
     * @en Get log list
     */
    getLogs(): LogEntry[] {
        return [...this._logs];
    }

    /**
     * @zh 清除日志
     * @en Clear logs
     */
    clearLogs(): void {
        this._logs = [];
    }

    // =========================================================================
    // 变量管理 | Variable Management
    // =========================================================================

    /**
     * @zh 获取变量值
     * @en Get variable value
     */
    getVariable(name: string): unknown {
        if (this._localVariables.has(name)) {
            return this._localVariables.get(name);
        }
        if (this._instanceVariables.has(name)) {
            return this._instanceVariables.get(name);
        }
        if (ServerExecutionContext._globalVariables.has(name)) {
            return ServerExecutionContext._globalVariables.get(name);
        }

        const varDef = this.blueprint.variables.find(v => v.name === name);
        return varDef?.defaultValue;
    }

    /**
     * @zh 设置变量值
     * @en Set variable value
     */
    setVariable(name: string, value: unknown): void {
        const varDef = this.blueprint.variables.find(v => v.name === name);

        if (!varDef) {
            this._localVariables.set(name, value);
            return;
        }

        switch (varDef.scope) {
            case 'local':
                this._localVariables.set(name, value);
                break;
            case 'instance':
                this._instanceVariables.set(name, value);
                break;
            case 'global':
                ServerExecutionContext._globalVariables.set(name, value);
                break;
        }
    }

    /**
     * @zh 获取实例变量
     * @en Get instance variables
     */
    getInstanceVariables(): Map<string, unknown> {
        return new Map(this._instanceVariables);
    }

    /**
     * @zh 设置实例变量
     * @en Set instance variables
     */
    setInstanceVariables(variables: Map<string, unknown>): void {
        this._instanceVariables = new Map(variables);
    }

    // =========================================================================
    // 输出缓存 | Output Cache
    // =========================================================================

    /**
     * @zh 设置节点输出
     * @en Set node outputs
     */
    setOutputs(nodeId: string, outputs: Record<string, unknown>): void {
        this._outputCache.set(nodeId, outputs);
    }

    /**
     * @zh 获取节点输出
     * @en Get node outputs
     */
    getOutputs(nodeId: string): Record<string, unknown> | undefined {
        return this._outputCache.get(nodeId);
    }

    /**
     * @zh 清除输出缓存
     * @en Clear output cache
     */
    clearOutputCache(): void {
        this._outputCache.clear();
        this._localVariables.clear();
    }

    /**
     * @zh 清除全局变量
     * @en Clear global variables
     */
    static clearGlobalVariables(): void {
        ServerExecutionContext._globalVariables.clear();
    }
}
