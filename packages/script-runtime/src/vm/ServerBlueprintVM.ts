/**
 * @zh 服务器端蓝图虚拟机
 * @en Server-side Blueprint Virtual Machine
 *
 * @zh 在服务器端执行玩家蓝图，支持 CPU 限制和意图收集
 * @en Executes player blueprints on server with CPU limiting and intent collection
 */

import type {
    BlueprintAsset,
    BlueprintNode,
    BlueprintConnection
} from '@esengine/blueprint';
import { NodeRegistry } from '@esengine/blueprint';

import { ServerExecutionContext, type IGameState, type LogEntry } from './ServerExecutionContext';
import { CPULimiter, type CPULimiterConfig, type CPUStats } from './CPULimiter';
import { IntentCollector } from '../intent/IntentCollector';
import type { IIntent, IntentKeyExtractor } from '../intent/IntentTypes';

/**
 * @zh 服务器 VM 配置
 * @en Server VM configuration
 *
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 */
export interface ServerVMConfig<TIntent extends IIntent = IIntent> {
    /**
     * @zh CPU 限制配置
     * @en CPU limit configuration
     */
    cpuConfig?: Partial<CPULimiterConfig>;

    /**
     * @zh 调试模式
     * @en Debug mode
     */
    debug?: boolean;

    /**
     * @zh 意图键提取器
     * @en Intent key extractor
     */
    intentKeyExtractor?: IntentKeyExtractor<TIntent>;
}

/**
 * @zh Tick 执行结果
 * @en Tick execution result
 *
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 */
export interface TickResult<TIntent extends IIntent = IIntent> {
    /**
     * @zh 是否执行成功
     * @en Whether execution succeeded
     */
    success: boolean;

    /**
     * @zh CPU 使用统计
     * @en CPU usage statistics
     */
    cpu: CPUStats;

    /**
     * @zh 收集的意图列表
     * @en Collected intents list
     */
    intents: TIntent[];

    /**
     * @zh 日志列表
     * @en Log list
     */
    logs: LogEntry[];

    /**
     * @zh 错误列表
     * @en Error list
     */
    errors: string[];

    /**
     * @zh 更新后的 Memory
     * @en Updated Memory
     */
    memory: Record<string, unknown>;
}

/**
 * @zh 待处理的延迟执行
 * @en Pending delayed execution
 */
interface PendingExecution {
    nodeId: string;
    execPin: string;
    resumeTick: number;
}

/**
 * @zh 节点执行结果
 * @en Node execution result
 */
interface ExecutionResult {
    nextExec?: string | null;
    outputs?: Record<string, unknown>;
    yield?: boolean;
    delay?: number;
    error?: string;
}

/**
 * @zh 服务器端蓝图虚拟机
 * @en Server-side Blueprint Virtual Machine
 *
 * @zh 专为服务器端设计的蓝图执行引擎，支持：
 * @en Blueprint execution engine designed for server-side, supporting:
 *
 * @zh - CPU 时间和步数限制
 * @en - CPU time and step limiting
 *
 * @zh - 意图收集（不直接执行操作）
 * @en - Intent collection (no direct execution)
 *
 * @zh - Memory 持久化
 * @en - Memory persistence
 *
 * @typeParam TGameState - @zh 游戏状态类型 @en Game state type
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 *
 * @example
 * ```typescript
 * // 游戏项目中定义类型 | Define types in game project
 * interface MyGameState extends IGameState {
 *     units: Map<string, IUnit>;
 * }
 *
 * interface MyIntent extends IIntent {
 *     readonly type: 'unit.move' | 'unit.attack';
 *     unitId: string;
 * }
 *
 * // 创建 VM | Create VM
 * const vm = new ServerBlueprintVM<MyGameState, MyIntent>('player1', blueprint, {
 *     intentKeyExtractor: (intent) => `${intent.type}:${intent.unitId}`
 * });
 *
 * // 每个 tick 执行 | Execute each tick
 * const result = vm.executeTick(gameState, playerMemory);
 * ```
 */
export class ServerBlueprintVM<
    TGameState extends IGameState = IGameState,
    TIntent extends IIntent = IIntent
> {
    /**
     * @zh 玩家 ID
     * @en Player ID
     */
    private readonly _playerId: string;

    /**
     * @zh 蓝图资产
     * @en Blueprint asset
     */
    private readonly _blueprint: BlueprintAsset;

    /**
     * @zh 执行上下文
     * @en Execution context
     */
    private readonly _context: ServerExecutionContext<TGameState, TIntent>;

    /**
     * @zh CPU 限制器
     * @en CPU limiter
     */
    private readonly _cpuLimiter: CPULimiter;

    /**
     * @zh 意图收集器
     * @en Intent collector
     */
    private readonly _intentCollector: IntentCollector<TIntent>;

    /**
     * @zh 事件节点缓存
     * @en Event nodes cache
     */
    private readonly _eventNodes: Map<string, BlueprintNode[]> = new Map();

    /**
     * @zh 连接查找表（按源）
     * @en Connection lookup (by source)
     */
    private readonly _connectionsBySource: Map<string, BlueprintConnection[]> = new Map();

    /**
     * @zh 连接查找表（按目标）
     * @en Connection lookup (by target)
     */
    private readonly _connectionsByTarget: Map<string, BlueprintConnection[]> = new Map();

    /**
     * @zh 待处理的延迟执行
     * @en Pending delayed executions
     */
    private _pendingExecutions: PendingExecution[] = [];

    /**
     * @zh 当前 tick
     * @en Current tick
     */
    private _currentTick: number = 0;

    /**
     * @zh 调试模式
     * @en Debug mode
     */
    private readonly _debug: boolean;

    /**
     * @zh 错误列表
     * @en Error list
     */
    private _errors: string[] = [];

    constructor(
        playerId: string,
        blueprint: BlueprintAsset,
        config: ServerVMConfig<TIntent> = {}
    ) {
        this._playerId = playerId;
        this._blueprint = blueprint;
        this._debug = config.debug ?? false;

        this._context = new ServerExecutionContext<TGameState, TIntent>(blueprint, playerId);

        this._cpuLimiter = new CPULimiter(playerId, config.cpuConfig);

        this._intentCollector = new IntentCollector<TIntent>(playerId, {
            keyExtractor: config.intentKeyExtractor
        });

        this._context.setCPULimiter(this._cpuLimiter);
        this._context.setIntentCollector(this._intentCollector);

        this._buildLookupTables();
        this._cacheEventNodes();
    }

    /**
     * @zh 获取玩家 ID
     * @en Get player ID
     */
    get playerId(): string {
        return this._playerId;
    }

    /**
     * @zh 获取执行上下文
     * @en Get execution context
     */
    get context(): ServerExecutionContext<TGameState, TIntent> {
        return this._context;
    }

    /**
     * @zh 获取 CPU 限制器
     * @en Get CPU limiter
     */
    get cpuLimiter(): CPULimiter {
        return this._cpuLimiter;
    }

    /**
     * @zh 获取意图收集器
     * @en Get intent collector
     */
    get intentCollector(): IntentCollector<TIntent> {
        return this._intentCollector;
    }

    /**
     * @zh 构建连接查找表
     * @en Build connection lookup tables
     */
    private _buildLookupTables(): void {
        for (const conn of this._blueprint.connections) {
            const sourceKey = `${conn.fromNodeId}.${conn.fromPin}`;
            if (!this._connectionsBySource.has(sourceKey)) {
                this._connectionsBySource.set(sourceKey, []);
            }
            this._connectionsBySource.get(sourceKey)!.push(conn);

            const targetKey = `${conn.toNodeId}.${conn.toPin}`;
            if (!this._connectionsByTarget.has(targetKey)) {
                this._connectionsByTarget.set(targetKey, []);
            }
            this._connectionsByTarget.get(targetKey)!.push(conn);
        }
    }

    /**
     * @zh 缓存事件节点
     * @en Cache event nodes
     */
    private _cacheEventNodes(): void {
        for (const node of this._blueprint.nodes) {
            if (node.type.startsWith('Event')) {
                const eventType = node.type;
                if (!this._eventNodes.has(eventType)) {
                    this._eventNodes.set(eventType, []);
                }
                this._eventNodes.get(eventType)!.push(node);
            }
        }
    }

    /**
     * @zh 执行一个游戏 tick
     * @en Execute one game tick
     *
     * @param gameState - @zh 当前游戏状态 @en Current game state
     * @param memory - @zh 玩家 Memory @en Player Memory
     * @returns @zh Tick 执行结果 @en Tick execution result
     */
    executeTick(gameState: TGameState, memory: Record<string, unknown> = {}): TickResult<TIntent> {
        this._currentTick = gameState.tick;
        this._errors = [];

        this._intentCollector.clear();
        this._intentCollector.setTick(this._currentTick);
        this._context.clearLogs();
        this._context.clearOutputCache();

        this._context.setGameState(gameState);
        this._context.setMemory(memory);

        this._cpuLimiter.start();

        try {
            this._processPendingExecutions();
            this._triggerEvent('EventTick');
        } catch (error) {
            this._errors.push(`Execution error: ${error}`);
        }

        this._cpuLimiter.end();
        this._cpuLimiter.recoverBucket();

        return {
            success: this._errors.length === 0,
            cpu: this._cpuLimiter.getStats(),
            intents: this._intentCollector.getIntents(),
            logs: this._context.getLogs(),
            errors: this._errors,
            memory: this._context.getMemory()
        };
    }

    /**
     * @zh 触发事件
     * @en Trigger event
     */
    private _triggerEvent(eventType: string, data?: Record<string, unknown>): void {
        const eventNodes = this._eventNodes.get(eventType);
        if (!eventNodes) return;

        for (const node of eventNodes) {
            if (!this._context.checkCPU()) {
                this._errors.push('CPU limit exceeded');
                return;
            }
            this._executeFromNode(node, 'exec', data);
        }
    }

    /**
     * @zh 从节点开始执行
     * @en Execute from node
     */
    private _executeFromNode(
        startNode: BlueprintNode,
        startPin: string,
        eventData?: Record<string, unknown>
    ): void {
        if (eventData) {
            this._context.setOutputs(startNode.id, eventData);
        }

        let currentNodeId: string | null = startNode.id;
        let currentPin: string = startPin;

        while (currentNodeId) {
            if (!this._context.checkCPU()) {
                this._errors.push('CPU limit exceeded during execution');
                return;
            }

            const connections = this._getConnectionsFromPin(currentNodeId, currentPin);

            if (connections.length === 0) {
                break;
            }

            const nextConn = connections[0];
            const result = this._executeNode(nextConn.toNodeId);

            if (result.error) {
                this._errors.push(`Node ${nextConn.toNodeId}: ${result.error}`);
                break;
            }

            if (result.delay && result.delay > 0) {
                this._pendingExecutions.push({
                    nodeId: nextConn.toNodeId,
                    execPin: result.nextExec ?? 'exec',
                    resumeTick: this._currentTick + Math.ceil(result.delay)
                });
                break;
            }

            if (result.yield) {
                break;
            }

            if (result.nextExec === null) {
                break;
            }

            currentNodeId = nextConn.toNodeId;
            currentPin = result.nextExec ?? 'exec';
        }
    }

    /**
     * @zh 执行单个节点
     * @en Execute single node
     */
    private _executeNode(nodeId: string): ExecutionResult {
        const node = this._getNode(nodeId);
        if (!node) {
            return { error: `Node not found: ${nodeId}` };
        }

        const executor = NodeRegistry.instance.getExecutor(node.type);
        if (!executor) {
            return { error: `No executor for node type: ${node.type}` };
        }

        try {
            if (this._debug) {
                console.log(`[ServerVM] Executing: ${node.type} (${nodeId})`);
            }

            const compatContext = this._createCompatibleContext() as unknown as Parameters<typeof executor.execute>[1];

            const result = executor.execute(node, compatContext);

            if (result.outputs) {
                this._context.setOutputs(nodeId, result.outputs);
            }

            return result;
        } catch (error) {
            return { error: `Execution error: ${error}` };
        }
    }

    /**
     * @zh 创建与 Blueprint 兼容的执行上下文
     * @en Create Blueprint-compatible execution context
     */
    private _createCompatibleContext(): {
        blueprint: BlueprintAsset;
        deltaTime: number;
        time: number;
        getNode: (id: string) => BlueprintNode | undefined;
        getConnectionsToPin: (nodeId: string, pinName: string) => BlueprintConnection[];
        getConnectionsFromPin: (nodeId: string, pinName: string) => BlueprintConnection[];
        evaluateInput: (nodeId: string, pinName: string, defaultValue?: unknown) => unknown;
        setOutputs: (nodeId: string, outputs: Record<string, unknown>) => void;
        getOutputs: (nodeId: string) => Record<string, unknown> | undefined;
        getVariable: (name: string) => unknown;
        setVariable: (name: string, value: unknown) => void;
        intentCollector: IntentCollector<TIntent>;
        gameState: TGameState | null;
        playerId: string;
        memory: Record<string, unknown>;
        log: (message: string) => void;
        warn: (message: string) => void;
        error: (message: string) => void;
    } {
        return {
            blueprint: this._blueprint,
            deltaTime: this._context.deltaTime,
            time: this._context.time,
            getNode: (id: string) => this._getNode(id),
            getConnectionsToPin: (nodeId: string, pinName: string) =>
                this._getConnectionsToPin(nodeId, pinName),
            getConnectionsFromPin: (nodeId: string, pinName: string) =>
                this._getConnectionsFromPin(nodeId, pinName),
            evaluateInput: (nodeId: string, pinName: string, defaultValue?: unknown) =>
                this._evaluateInput(nodeId, pinName, defaultValue),
            setOutputs: (nodeId: string, outputs: Record<string, unknown>) =>
                this._context.setOutputs(nodeId, outputs),
            getOutputs: (nodeId: string) => this._context.getOutputs(nodeId),
            getVariable: (name: string) => this._context.getVariable(name),
            setVariable: (name: string, value: unknown) => this._context.setVariable(name, value),
            intentCollector: this._intentCollector,
            gameState: this._context.getGameState(),
            playerId: this._playerId,
            memory: this._context.getMemory(),
            log: (message: string) => this._context.log(message),
            warn: (message: string) => this._context.warn(message),
            error: (message: string) => this._context.error(message)
        };
    }

    /**
     * @zh 处理待处理的延迟执行
     * @en Process pending delayed executions
     */
    private _processPendingExecutions(): void {
        const stillPending: PendingExecution[] = [];

        for (const pending of this._pendingExecutions) {
            if (this._currentTick >= pending.resumeTick) {
                const node = this._getNode(pending.nodeId);
                if (node) {
                    this._executeFromNode(node, pending.execPin);
                }
            } else {
                stillPending.push(pending);
            }
        }

        this._pendingExecutions = stillPending;
    }

    /**
     * @zh 获取节点
     * @en Get node
     */
    private _getNode(nodeId: string): BlueprintNode | undefined {
        return this._blueprint.nodes.find(n => n.id === nodeId);
    }

    /**
     * @zh 获取从源引脚的连接
     * @en Get connections from source pin
     */
    private _getConnectionsFromPin(nodeId: string, pinName: string): BlueprintConnection[] {
        return this._connectionsBySource.get(`${nodeId}.${pinName}`) ?? [];
    }

    /**
     * @zh 获取到目标引脚的连接
     * @en Get connections to target pin
     */
    private _getConnectionsToPin(nodeId: string, pinName: string): BlueprintConnection[] {
        return this._connectionsByTarget.get(`${nodeId}.${pinName}`) ?? [];
    }

    /**
     * @zh 计算输入引脚值
     * @en Evaluate input pin value
     */
    private _evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown {
        const connections = this._getConnectionsToPin(nodeId, pinName);

        if (connections.length === 0) {
            const node = this._getNode(nodeId);
            return node?.data[pinName] ?? defaultValue;
        }

        const conn = connections[0];
        const cachedOutputs = this._context.getOutputs(conn.fromNodeId);

        if (cachedOutputs && conn.fromPin in cachedOutputs) {
            return cachedOutputs[conn.fromPin];
        }

        return defaultValue;
    }

    /**
     * @zh 获取实例变量
     * @en Get instance variables
     */
    getInstanceVariables(): Map<string, unknown> {
        return this._context.getInstanceVariables();
    }

    /**
     * @zh 设置实例变量
     * @en Set instance variables
     */
    setInstanceVariables(variables: Map<string, unknown>): void {
        this._context.setInstanceVariables(variables);
    }

    /**
     * @zh 重置 VM
     * @en Reset VM
     */
    reset(): void {
        this._pendingExecutions = [];
        this._currentTick = 0;
        this._errors = [];
        this._cpuLimiter.reset();
        this._intentCollector.clear();
        this._context.clearOutputCache();
        this._context.clearLogs();
    }
}
