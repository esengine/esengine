/**
 * Execution Context - Runtime context for blueprint execution
 * 执行上下文 - 蓝图执行的运行时上下文
 */

import type { Entity, IScene, Component } from '@esengine/ecs-framework';
import { BlueprintNode, BlueprintConnection } from '../types/nodes';
import { BlueprintAsset } from '../types/blueprint';
import { getRegisteredBlueprintComponents } from '../registry/BlueprintDecorators';

/**
 * Result of node execution
 * 节点执行的结果
 */
export interface ExecutionResult {
    /**
     * Next exec pin to follow (null to stop, undefined to continue default)
     * 下一个要执行的引脚（null 停止，undefined 继续默认）
     */
    nextExec?: string | null;

    /**
     * Exec pins to follow in order, each running its whole chain before the next
     * (takes precedence over `nextExec`; used by Sequence)
     * 按顺序执行的多个引脚，每个引脚的整条链跑完再进入下一个
     * （优先于 `nextExec`；Sequence 使用）
     */
    nextExecs?: string[];

    /**
     * Output values by pin name
     * 按引脚名称的输出值
     */
    outputs?: Record<string, unknown>;

    /**
     * Whether to yield execution (for async operations)
     * 是否暂停执行（用于异步操作）
     */
    yield?: boolean;

    /**
     * Delay before continuing (in seconds)
     * 继续前的延迟（秒）
     */
    delay?: number;

    /**
     * Error message if execution failed
     * 执行失败时的错误消息
     */
    error?: string;
}

/**
 * Execution context provides access to runtime services
 * 执行上下文提供对运行时服务的访问
 */
export class ExecutionContext {
    /** Current blueprint asset (当前蓝图资产) */
    readonly blueprint: BlueprintAsset;

    /** Owner entity (所有者实体) — null for non-ECS hosts */
    readonly entity: Entity | null;

    /** Current scene (当前场景) — null for non-ECS hosts */
    readonly scene: IScene | null;

    /**
     * @zh 蓝图所绑定的宿主实例；组件方法/属性节点在未显式连线时默认作用于它
     * @en Host/owner instance the blueprint is bound to; component method/property
     *     nodes target this by default when their `component` input is unconnected
     */
    self: object | null = null;

    /** Frame delta time (帧增量时间) */
    deltaTime: number = 0;

    /** Total time since start (开始以来的总时间) */
    time: number = 0;

    /** Instance variables (实例变量) */
    private _instanceVariables: Map<string, unknown> = new Map();

    /** Local variables (per-execution) (局部变量，每次执行) */
    private _localVariables: Map<string, unknown> = new Map();

    /** Global variables (shared) (全局变量，共享) */
    private static _globalVariables: Map<string, unknown> = new Map();

    /** Component class registry (组件类注册表) */
    private static _componentRegistry: Map<string, new () => Component> = new Map();

    /** Node output cache for current execution (当前执行的节点输出缓存) */
    private _outputCache: Map<string, Record<string, unknown>> = new Map();

    /** Persistent per-node executor state (每个节点的持久化执行器状态) */
    private _nodeStates: Map<string, unknown> = new Map();

    /** Connection lookup by target (按目标的连接查找) */
    private _connectionsByTarget: Map<string, BlueprintConnection[]> = new Map();

    /** Connection lookup by source (按源的连接查找) */
    private _connectionsBySource: Map<string, BlueprintConnection[]> = new Map();
    /** Node lookup by ID (按ID的节点查找) */
    private _nodesById: Map<string, BlueprintNode> = new Map();

    /** Lazy evaluator for pure source nodes, injected by the VM (由 VM 注入的纯节点按需求值器) */
    private _nodeEvaluator: ((nodeId: string) => void) | null = null;

    constructor(
        blueprint: BlueprintAsset,
        entity: Entity | null = null,
        scene: IScene | null = null,
        self: object | null = null
    ) {
        this.blueprint = blueprint;
        this.entity = entity;
        this.scene = scene;
        this.self = self;

        // Initialize instance variables with defaults
        // 使用默认值初始化实例变量
        for (const variable of blueprint.variables) {
            if (variable.scope === 'instance') {
                this._instanceVariables.set(variable.name, variable.defaultValue);
            }
        }

        // Build lookup maps
        // 构建查找映射
        for (const node of blueprint.nodes) {
            this._nodesById.set(node.id, node);
        }
        this._buildConnectionMaps();
    }

    private _buildConnectionMaps(): void {
        for (const conn of this.blueprint.connections) {
            // By target
            const targetKey = `${conn.toNodeId}.${conn.toPin}`;
            if (!this._connectionsByTarget.has(targetKey)) {
                this._connectionsByTarget.set(targetKey, []);
            }
            this._connectionsByTarget.get(targetKey)!.push(conn);

            // By source
            const sourceKey = `${conn.fromNodeId}.${conn.fromPin}`;
            if (!this._connectionsBySource.has(sourceKey)) {
                this._connectionsBySource.set(sourceKey, []);
            }
            this._connectionsBySource.get(sourceKey)!.push(conn);
        }
    }

    /**
     * Get a node by ID
     * 通过ID获取节点
     */
    getNode(nodeId: string): BlueprintNode | undefined {
        return this._nodesById.get(nodeId);
    }

    /**
     * Get connections to a target pin
     * 获取到目标引脚的连接
     */
    getConnectionsToPin(nodeId: string, pinName: string): BlueprintConnection[] {
        return this._connectionsByTarget.get(`${nodeId}.${pinName}`) ?? [];
    }

    /**
     * Get connections from a source pin
     * 获取从源引脚的连接
     */
    getConnectionsFromPin(nodeId: string, pinName: string): BlueprintConnection[] {
        return this._connectionsBySource.get(`${nodeId}.${pinName}`) ?? [];
    }

    /**
     * Evaluate an input pin value (follows connections or uses default)
     * 计算输入引脚值（跟随连接或使用默认值）
     */
    /**
     * @zh 注入用于按需求值(纯)源节点的回调，由 BlueprintVM 设置
     * @en Set the callback used to lazily evaluate (pure) source nodes on demand (injected by BlueprintVM)
     */
    setNodeEvaluator(evaluator: (nodeId: string) => void): void {
        this._nodeEvaluator = evaluator;
    }

    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown {
        const connections = this.getConnectionsToPin(nodeId, pinName);

        if (connections.length === 0) {
            // Use default from node data or provided default
            // 使用节点数据的默认值或提供的默认值
            const node = this.getNode(nodeId);
            return node?.data[pinName] ?? defaultValue;
        }

        // Get value from connected output
        // 从连接的输出获取值
        const conn = connections[0];
        let cachedOutputs = this._outputCache.get(conn.fromNodeId);

        // Lazy (pull) evaluation: if the source node hasn't produced this output yet,
        // ask the VM to evaluate it on demand. Only pure (side-effect-free) nodes are
        // pull-evaluated, so data-flow through Get/property/math nodes works correctly.
        // 惰性(拉取)求值：源节点尚未产出该输出时，按需让 VM 求值(仅对纯节点生效)，
        // 使 Get/属性/数学 等数据节点的连线能真正把值传下去。
        if ((!cachedOutputs || !(conn.fromPin in cachedOutputs)) && this._nodeEvaluator) {
            this._nodeEvaluator(conn.fromNodeId);
            cachedOutputs = this._outputCache.get(conn.fromNodeId);
        }

        if (cachedOutputs && conn.fromPin in cachedOutputs) {
            return cachedOutputs[conn.fromPin];
        }

        return defaultValue;
    }

    /**
     * Set output values for a node (cached for current execution)
     * 设置节点的输出值（为当前执行缓存）
     */
    setOutputs(nodeId: string, outputs: Record<string, unknown>): void {
        this._outputCache.set(nodeId, outputs);
    }

    /**
     * Get cached outputs for a node
     * 获取节点的缓存输出
     */
    getOutputs(nodeId: string): Record<string, unknown> | undefined {
        return this._outputCache.get(nodeId);
    }

    /**
     * Clear output cache (call at start of new execution)
     * 清除输出缓存（在新执行开始时调用）
     */
    clearOutputCache(): void {
        this._outputCache.clear();
        this._localVariables.clear();
    }

    /**
     * Get (or lazily create) persistent state for a stateful node
     * 获取（或惰性创建）有状态节点的持久化状态
     *
     * @zh 执行器按类型注册为一个共享实例（见 `RegisterNode`），所以需要跨执行保留的
     *     状态必须按节点 id 存在上下文里；放在执行器字段上会被同类型的所有节点、
     *     所有蓝图实例共用。状态不随 `clearOutputCache` 清除。
     * @en Executors are registered as one shared instance per type (see `RegisterNode`),
     *     so state that must survive across executions belongs here, keyed by node id —
     *     an executor field would be shared by every node of that type in every
     *     blueprint instance. Not cleared by `clearOutputCache`.
     */
    getNodeState<T>(nodeId: string, create: () => T): T {
        let state = this._nodeStates.get(nodeId) as T | undefined;
        if (state === undefined) {
            state = create();
            this._nodeStates.set(nodeId, state);
        }
        return state;
    }

    /**
     * Clear all per-node state (call when the blueprint restarts)
     * 清除所有节点状态（蓝图重新启动时调用）
     */
    clearNodeStates(): void {
        this._nodeStates.clear();
    }

    /**
     * Get a variable value
     * 获取变量值
     */
    getVariable(name: string): unknown {
        // Check local first, then instance, then global
        // 先检查局部，然后实例，然后全局
        if (this._localVariables.has(name)) {
            return this._localVariables.get(name);
        }
        if (this._instanceVariables.has(name)) {
            return this._instanceVariables.get(name);
        }
        if (ExecutionContext._globalVariables.has(name)) {
            return ExecutionContext._globalVariables.get(name);
        }

        // Return default from variable definition
        // 返回变量定义的默认值
        const varDef = this.blueprint.variables.find(v => v.name === name);
        return varDef?.defaultValue;
    }

    /**
     * Set a variable value
     * 设置变量值
     */
    setVariable(name: string, value: unknown): void {
        const varDef = this.blueprint.variables.find(v => v.name === name);

        if (!varDef) {
            // Treat unknown variables as local
            // 将未知变量视为局部变量
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
                ExecutionContext._globalVariables.set(name, value);
                break;
        }
    }

    /**
     * Get all instance variables (for serialization)
     * 获取所有实例变量（用于序列化）
     */
    getInstanceVariables(): Map<string, unknown> {
        return new Map(this._instanceVariables);
    }

    /**
     * Set instance variables (for deserialization)
     * 设置实例变量（用于反序列化）
     */
    setInstanceVariables(variables: Map<string, unknown>): void {
        this._instanceVariables = new Map(variables);
    }

    /**
     * Clear global variables (for scene reset)
     * 清除全局变量（用于场景重置）
     */
    static clearGlobalVariables(): void {
        ExecutionContext._globalVariables.clear();
    }

    /**
     * Get a component class by name
     * 通过名称获取组件类
     *
     * @zh 首先检查 @BlueprintExpose 装饰的组件，然后检查手动注册的组件
     * @en First checks @BlueprintExpose decorated components, then manually registered ones
     */
    getComponentClass(typeName: string): (new () => Component) | undefined {
        // First check registered blueprint components
        const blueprintComponents = getRegisteredBlueprintComponents();
        for (const [componentClass, metadata] of blueprintComponents) {
            if (metadata.componentName === typeName ||
                componentClass.name === typeName) {
                return componentClass as new () => Component;
            }
        }

        // Then check manual registry
        return ExecutionContext._componentRegistry.get(typeName);
    }

    /**
     * Register a component class for dynamic creation
     * 注册组件类以支持动态创建
     */
    static registerComponentClass(typeName: string, componentClass: new () => Component): void {
        ExecutionContext._componentRegistry.set(typeName, componentClass);
    }

    /**
     * Unregister a component class
     * 取消注册组件类
     */
    static unregisterComponentClass(typeName: string): void {
        ExecutionContext._componentRegistry.delete(typeName);
    }

    /**
     * Get all registered component classes
     * 获取所有已注册的组件类
     */
    static getRegisteredComponentClasses(): Map<string, new () => Component> {
        return new Map(ExecutionContext._componentRegistry);
    }
}
