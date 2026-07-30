/**
 * Blueprint Virtual Machine - Executes blueprint graphs
 * 蓝图虚拟机 - 执行蓝图图
 */

import { type Entity, type IScene, createLogger } from '@esengine/ecs-framework';
import { BlueprintNode } from '../types/nodes';
import { BlueprintAsset } from '../types/blueprint';
import { ExecutionContext, ExecutionResult } from './ExecutionContext';
import { NodeRegistry } from './NodeRegistry';

const vmLogger = createLogger('BlueprintVM');

/**
 * Pending execution frame (for delayed/async execution)
 * 待处理的执行帧（用于延迟/异步执行）
 */
interface PendingExecution {
    nodeId: string;
    execPin: string;
    resumeTime: number;
}

/**
 * Event trigger types
 * 事件触发类型
 */
export type EventType =
    | 'BeginPlay'
    | 'Tick'
    | 'EndPlay'
    | 'Collision'
    | 'TriggerEnter'
    | 'TriggerExit'
    | 'Custom';

/**
 * Blueprint Virtual Machine
 * 蓝图虚拟机
 */
export class BlueprintVM {
    /** Execution context (执行上下文) */
    private _context: ExecutionContext;

    /** Pending executions (delayed nodes) (待处理的执行) */
    private _pendingExecutions: PendingExecution[] = [];

    /** Event node cache by type (按类型缓存的事件节点) */
    private _eventNodes: Map<string, BlueprintNode[]> = new Map();

    /** Whether the VM is running (VM 是否运行中) */
    private _isRunning: boolean = false;

    /** Current execution time (当前执行时间) */
    private _currentTime: number = 0;

    /** Maximum execution steps per frame (每帧最大执行步骤) */
    private _maxStepsPerFrame: number = 1000;

    /** Steps used by the flow currently running (当前执行流已消耗的步数) */
    private _steps: number = 0;

    /** Maximum exec fan-out nesting depth (exec 扇出的最大嵌套深度) */
    private _maxExecDepth: number = 200;

    /** Maximum pending executions (最大待处理执行数) */
    private _maxPendingExecutions: number = 10000;

    /** Debug mode (调试模式) */
    debug: boolean = false;

    /** Nodes currently being pull-evaluated (cycle guard) (正在按需求值的节点，用于防环) */
    private _pullEvaluating: Set<string> = new Set();

    constructor(
        blueprint: BlueprintAsset,
        entity: Entity | null = null,
        scene: IScene | null = null,
        self: object | null = null
    ) {
        this._context = new ExecutionContext(blueprint, entity, scene, self);
        this._context.setNodeEvaluator((nodeId) => this._pullEvaluateNode(nodeId));
        this._cacheEventNodes();
    }

    get context(): ExecutionContext {
        return this._context;
    }

    get isRunning(): boolean {
        return this._isRunning;
    }

    /**
     * Cache event nodes by type for quick lookup
     * 按类型缓存事件节点以便快速查找
     */
    private _cacheEventNodes(): void {
        for (const node of this._context.blueprint.nodes) {
            // Event nodes start with "Event"
            // 事件节点以 "Event" 开头
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
     * Start the VM
     * 启动 VM
     */
    start(): void {
        this._isRunning = true;
        this._currentTime = 0;

        // Stateful nodes (Do Once, Gate, ...) start fresh on every run
        // 有状态节点（Do Once、Gate 等）每次运行都从初始状态开始
        this._context.clearNodeStates();

        // Trigger BeginPlay event
        // 触发 BeginPlay 事件
        this.triggerEvent('EventBeginPlay');
    }

    /**
     * Stop the VM
     * 停止 VM
     */
    stop(): void {
        this.triggerEvent('EventEndPlay');

        this._isRunning = false;
        this._pendingExecutions = [];
    }

    /**
     * @zh 释放资源
     * @en Dispose resources
     */
    dispose(): void {
        this.stop();
        this._pendingExecutions.length = 0;
        this._eventNodes.clear();
        this._context = null!;
    }

    /**
     * Pause the VM
     * 暂停 VM
     */
    pause(): void {
        this._isRunning = false;
    }

    /**
     * Resume the VM
     * 恢复 VM
     */
    resume(): void {
        this._isRunning = true;
    }

    /**
     * Update the VM (called every frame)
     * 更新 VM（每帧调用）
     */
    tick(deltaTime: number): void {
        if (!this._isRunning) return;

        this._currentTime += deltaTime;
        this._context.deltaTime = deltaTime;
        this._context.time = this._currentTime;

        // Process pending delayed executions
        // 处理待处理的延迟执行
        this._processPendingExecutions();

        // Trigger Tick event
        // 触发 Tick 事件
        this.triggerEvent('EventTick');
    }

    /**
     * Trigger an event by type
     * 按类型触发事件
     */
    triggerEvent(eventType: string, data?: Record<string, unknown>): void {
        const eventNodes = this._eventNodes.get(eventType);
        if (!eventNodes) return;

        for (const node of eventNodes) {
            this._executeFromNode(node, 'exec', data);
        }
    }

    /**
     * Trigger a custom event by name
     * 按名称触发自定义事件
     */
    triggerCustomEvent(eventName: string, data?: Record<string, unknown>): void {
        const eventNodes = this._eventNodes.get('EventCustom');
        if (!eventNodes) return;

        for (const node of eventNodes) {
            if (node.data.eventName === eventName) {
                this._executeFromNode(node, 'exec', data);
            }
        }
    }

    /**
     * Execute from a starting node
     * 从起始节点执行
     */
    private _executeFromNode(
        startNode: BlueprintNode,
        startPin: string,
        eventData?: Record<string, unknown>
    ): void {
        // Clear output cache for new execution
        // 为新执行清除输出缓存
        this._context.clearOutputCache();

        // Set event data as node outputs
        // 设置事件数据为节点输出
        if (eventData) {
            this._context.setOutputs(startNode.id, eventData);
        }

        // Follow execution chain. The step budget is scoped to this flow, so a node
        // that synchronously triggers another event doesn't eat this flow's budget.
        // 跟随执行链。步数预算属于本次执行流，节点内同步触发其它事件不会占用本流预算。
        const outerSteps = this._steps;
        this._steps = 0;

        try {
            this._followExecPin(startNode.id, startPin, 0);

            if (this._steps >= this._maxStepsPerFrame) {
                vmLogger.warn('Execution exceeded maximum steps, possible infinite loop');
            }
        } finally {
            this._steps = outerSteps;
        }
    }

    /**
     * Follow every connection on an exec output pin, in connection order
     * 按连线顺序跟随 exec 输出引脚上的所有连线
     *
     * @zh 每个分支跑完整条下游链后才进入下一个分支，所以把一个 exec 输出引脚扇出到
     *     N 个节点等价于 Sequence —— 编辑器允许这么连，运行时就必须全部执行。
     * @en Each branch runs its whole downstream chain before the next branch starts,
     *     so fanning one exec output pin out to N nodes behaves like a Sequence — the
     *     editor lets you wire it that way, so the runtime must execute all of them.
     */
    private _followExecPin(nodeId: string, pin: string, depth: number): void {
        const connections = this._context.getConnectionsFromPin(nodeId, pin);
        if (connections.length === 0) return;

        if (depth >= this._maxExecDepth) {
            vmLogger.warn(`Exec nesting exceeded ${this._maxExecDepth} at ${nodeId}.${pin}, stopping branch`);
            return;
        }

        for (const conn of connections) {
            this._runExecBranch(conn.toNodeId, conn.toPin, depth);
        }
    }

    /**
     * Run one exec branch: execute the node, then follow its next pin
     * 执行一个分支：执行节点后跟随它的下一个引脚
     *
     * @zh 线性链（每个引脚只有一条连线）用循环走，长链只占一层调用栈；
     *     只在遇到扇出时才递归。
     * @en Linear chains (one connection per pin) are walked iteratively so a long chain
     *     costs a single stack frame; recursion only happens at fan-out points.
     */
    private _runExecBranch(nodeId: string, entryPin: string, depth: number): void {
        let currentNodeId = nodeId;
        let currentEntryPin = entryPin;

        for (;;) {
            if (this._steps >= this._maxStepsPerFrame) return;
            this._steps++;

            const result = this._executeNode(currentNodeId, currentEntryPin);

            if (result.error) {
                // Stop this branch only — sibling branches are independent
                // 只中断当前分支 —— 兄弟分支相互独立
                vmLogger.error(`Error in node ${currentNodeId}: ${result.error}`);
                return;
            }

            if (result.delay && result.delay > 0) {
                // Schedule delayed execution
                // 安排延迟执行
                if (this._pendingExecutions.length < this._maxPendingExecutions) {
                    this._pendingExecutions.push({
                        nodeId: currentNodeId,
                        execPin: result.nextExec ?? 'exec',
                        resumeTime: this._currentTime + result.delay
                    });
                }
                return;
            }

            if (result.yield) {
                // Yield execution until next frame
                // 暂停执行直到下一帧
                return;
            }

            // Multiple output pins (Sequence): run each in order
            // 多个输出引脚（Sequence）：按顺序各跑一遍
            if (result.nextExecs) {
                for (const nextPin of result.nextExecs) {
                    this._followExecPin(currentNodeId, nextPin, depth + 1);
                }
                return;
            }

            if (result.nextExec === null) {
                // Explicitly stop execution
                // 显式停止执行
                return;
            }

            const nextPin = result.nextExec ?? 'exec';
            const nextConns = this._context.getConnectionsFromPin(currentNodeId, nextPin);
            if (nextConns.length === 0) return;

            if (nextConns.length > 1) {
                // Fan-out: recurse so each branch completes before the next starts
                // 扇出：递归，保证每个分支跑完再进入下一个
                this._followExecPin(currentNodeId, nextPin, depth + 1);
                return;
            }

            // Continue to next node
            // 继续到下一个节点
            currentNodeId = nextConns[0].toNodeId;
            currentEntryPin = nextConns[0].toPin;
        }
    }

    /**
     * Execute a single node
     * 执行单个节点
     *
     * @param entryPin - Exec input pin the node was entered through (节点被进入的 exec 输入引脚)
     */
    private _executeNode(nodeId: string, entryPin?: string): ExecutionResult {
        const node = this._context.getNode(nodeId);
        if (!node) {
            return { error: `Node not found: ${nodeId}` };
        }

        const executor = NodeRegistry.instance.getExecutor(node.type);
        if (!executor) {
            return { error: `No executor for node type: ${node.type}` };
        }

        try {
            if (this.debug) {
                vmLogger.debug(`Executing: ${node.type} (${nodeId})`);
            }

            // Record which exec input the node was entered through, so nodes with
            // several exec inputs (Gate, Do Once) can tell their pins apart
            // 记录节点从哪个 exec 输入引脚进入，供有多个 exec 输入的节点（Gate、Do Once）区分
            if (entryPin !== undefined) {
                node.data._lastInputPin = entryPin;
            }

            const result = executor.execute(node, this._context);

            // Cache outputs
            // 缓存输出
            if (result.outputs) {
                this._context.setOutputs(nodeId, result.outputs);
            }

            return result;
        } catch (error) {
            return { error: `Execution error: ${error}` };
        }
    }

    /**
     * @zh 按需求值一个纯数据节点，使其输出可供下游读取(拉取式数据流)
     * @en Lazily evaluate a pure data node so its outputs are available to consumers (pull-based data flow)
     */
    private _pullEvaluateNode(nodeId: string): void {
        // Already produced outputs this execution — nothing to do
        // 本次执行已产出输出 — 无需处理
        if (this._context.getOutputs(nodeId)) return;

        // Cycle guard (环检测)
        if (this._pullEvaluating.has(nodeId)) return;

        const node = this._context.getNode(nodeId);
        if (!node) return;

        // Only pure (side-effect-free) nodes may be evaluated out of exec order.
        // 仅对纯节点(无副作用)做乱序求值，避免误触发带执行流的节点。
        const template = NodeRegistry.instance.getTemplate(node.type);
        if (!template?.isPure) return;

        const executor = NodeRegistry.instance.getExecutor(node.type);
        if (!executor) return;

        this._pullEvaluating.add(nodeId);
        try {
            const result = executor.execute(node, this._context);
            if (result.outputs) {
                this._context.setOutputs(nodeId, result.outputs);
            }
        } catch (error) {
            vmLogger.error(`Error pull-evaluating node ${nodeId}: ${error}`);
        } finally {
            this._pullEvaluating.delete(nodeId);
        }
    }

    /**
     * Process pending delayed executions
     * 处理待处理的延迟执行
     */
    private _processPendingExecutions(): void {
        const stillPending: PendingExecution[] = [];

        for (const pending of this._pendingExecutions) {
            if (this._currentTime >= pending.resumeTime) {
                // Resume execution
                // 恢复执行
                const node = this._context.getNode(pending.nodeId);
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
     * Get instance variables for serialization
     * 获取实例变量用于序列化
     */
    getInstanceVariables(): Map<string, unknown> {
        return this._context.getInstanceVariables();
    }

    /**
     * Set instance variables from serialization
     * 从序列化设置实例变量
     */
    setInstanceVariables(variables: Map<string, unknown>): void {
        this._context.setInstanceVariables(variables);
    }
}
