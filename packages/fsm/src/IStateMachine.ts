/**
 * @zh 状态机接口
 * @en State Machine Interface
 *
 * @zh 提供有限状态机的核心接口
 * @en Provides core interfaces for finite state machine
 */

// =============================================================================
// 状态配置 | State Configuration
// =============================================================================

/**
 * @zh 状态配置
 * @en State configuration
 */
export interface StateConfig<TState extends string = string, TContext = unknown> {
    /**
     * @zh 状态名称
     * @en State name
     */
    readonly name: TState;

    /**
     * @zh 进入状态时的回调
     * @en Callback when entering state
     */
    onEnter?: (context: TContext, from: TState | null) => void;

    /**
     * @zh 退出状态时的回调
     * @en Callback when exiting state
     */
    onExit?: (context: TContext, to: TState) => void;

    /**
     * @zh 状态更新回调
     * @en State update callback
     */
    onUpdate?: (context: TContext, deltaTime: number) => void;

    /**
     * @zh 状态标签
     * @en State tags
     */
    tags?: string[];

    /**
     * @zh 状态元数据
     * @en State metadata
     */
    metadata?: Record<string, unknown>;
}

// =============================================================================
// 转换配置 | Transition Configuration
// =============================================================================

/**
 * @zh 转换条件函数
 * @en Transition condition function
 */
export type TransitionCondition<TContext = unknown> = (context: TContext) => boolean;

/**
 * @zh 转换配置
 * @en Transition configuration
 */
export interface TransitionConfig<TState extends string = string, TContext = unknown> {
    /**
     * @zh 源状态
     * @en Source state
     */
    readonly from: TState;

    /**
     * @zh 目标状态
     * @en Target state
     */
    readonly to: TState;

    /**
     * @zh 转换条件
     * @en Transition condition
     */
    condition?: TransitionCondition<TContext>;

    /**
     * @zh 转换优先级（数字越大优先级越高）
     * @en Transition priority (higher number = higher priority)
     */
    priority?: number;

    /**
     * @zh 转换名称（用于调试）
     * @en Transition name (for debugging)
     */
    name?: string;
}

// =============================================================================
// 状态机事件 | State Machine Events
// =============================================================================

/**
 * @zh 状态变更事件
 * @en State change event
 */
export interface StateChangeEvent<TState extends string = string> {
    /**
     * @zh 之前的状态
     * @en Previous state
     */
    readonly from: TState | null;

    /**
     * @zh 当前状态
     * @en Current state
     */
    readonly to: TState;

    /**
     * @zh 时间戳
     * @en Timestamp
     */
    readonly timestamp: number;
}

/**
 * @zh 状态变更监听器
 * @en State change listener
 */
export type StateChangeListener<TState extends string = string> = (
    event: StateChangeEvent<TState>
) => void;

// =============================================================================
// 状态机接口 | State Machine Interface
// =============================================================================

/**
 * @zh 状态机接口
 * @en State machine interface
 *
 * @zh 通用有限状态机，用于角色/AI 状态管理
 * @en Generic finite state machine for character/AI state management
 *
 * @example
 * ```typescript
 * type PlayerState = 'idle' | 'walk' | 'run' | 'jump' | 'attack';
 *
 * const fsm = createStateMachine<PlayerState>('idle');
 *
 * fsm.defineState('idle', {
 *     onEnter: () => console.log('Entering idle'),
 *     onExit: () => console.log('Exiting idle')
 * });
 *
 * fsm.defineTransition('idle', 'walk', () => isMoving);
 * fsm.defineTransition('walk', 'run', () => isRunning);
 *
 * fsm.transition('walk'); // 手动转换
 * fsm.evaluateTransitions(); // 自动评估条件
 * ```
 */
export interface IStateMachine<TState extends string = string, TContext = unknown> {
    /**
     * @zh 当前状态
     * @en Current state
     */
    readonly current: TState;

    /**
     * @zh 之前的状态
     * @en Previous state
     */
    readonly previous: TState | null;

    /**
     * @zh 状态机上下文
     * @en State machine context
     */
    readonly context: TContext;

    /**
     * @zh 是否正在转换中
     * @en Whether a transition is in progress
     */
    readonly isTransitioning: boolean;

    /**
     * @zh 当前状态持续时间（毫秒）
     * @en Current state duration in milliseconds
     */
    readonly currentStateDuration: number;

    // =========================================================================
    // 状态定义 | State Definition
    // =========================================================================

    /**
     * @zh 定义状态
     * @en Define state
     *
     * @param state - @zh 状态名称 @en State name
     * @param config - @zh 状态配置 @en State configuration
     */
    defineState(state: TState, config?: Partial<StateConfig<TState, TContext>>): void;

    /**
     * @zh 检查状态是否已定义
     * @en Check if state is defined
     *
     * @param state - @zh 状态名称 @en State name
     */
    hasState(state: TState): boolean;

    /**
     * @zh 获取状态配置
     * @en Get state configuration
     *
     * @param state - @zh 状态名称 @en State name
     */
    getStateConfig(state: TState): StateConfig<TState, TContext> | undefined;

    /**
     * @zh 获取所有定义的状态
     * @en Get all defined states
     */
    getStates(): TState[];

    // =========================================================================
    // 转换定义 | Transition Definition
    // =========================================================================

    /**
     * @zh 定义转换
     * @en Define transition
     *
     * @param from - @zh 源状态 @en Source state
     * @param to - @zh 目标状态 @en Target state
     * @param condition - @zh 转换条件 @en Transition condition
     * @param priority - @zh 优先级 @en Priority
     */
    defineTransition(
        from: TState,
        to: TState,
        condition?: TransitionCondition<TContext>,
        priority?: number
    ): void;

    /**
     * @zh 移除转换
     * @en Remove transition
     *
     * @param from - @zh 源状态 @en Source state
     * @param to - @zh 目标状态 @en Target state
     */
    removeTransition(from: TState, to: TState): void;

    /**
     * @zh 获取从指定状态可用的转换
     * @en Get available transitions from state
     *
     * @param from - @zh 源状态 @en Source state
     */
    getTransitionsFrom(from: TState): TransitionConfig<TState, TContext>[];

    // =========================================================================
    // 转换操作 | Transition Operations
    // =========================================================================

    /**
     * @zh 检查是否可以转换到目标状态
     * @en Check if can transition to target state
     *
     * @param to - @zh 目标状态 @en Target state
     */
    canTransition(to: TState): boolean;

    /**
     * @zh 转换到目标状态
     * @en Transition to target state
     *
     * @param to - @zh 目标状态 @en Target state
     * @param force - @zh 强制转换（忽略条件）@en Force transition (ignore condition)
     * @returns @zh 是否成功 @en Whether successful
     */
    transition(to: TState, force?: boolean): boolean;

    /**
     * @zh 评估并执行满足条件的转换
     * @en Evaluate and execute transitions that meet conditions
     *
     * @returns @zh 是否发生转换 @en Whether a transition occurred
     */
    evaluateTransitions(): boolean;

    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    /**
     * @zh 更新状态机
     * @en Update state machine
     *
     * @param deltaTime - @zh 增量时间（毫秒）@en Delta time in milliseconds
     */
    update(deltaTime: number): void;

    /**
     * @zh 重置状态机到初始状态
     * @en Reset state machine to initial state
     *
     * @param initialState - @zh 初始状态 @en Initial state
     */
    reset(initialState?: TState): void;

    // =========================================================================
    // 事件监听 | Event Listening
    // =========================================================================

    /**
     * @zh 监听状态进入事件
     * @en Listen to state enter event
     *
     * @param state - @zh 状态名称 @en State name
     * @param callback - @zh 回调函数 @en Callback function
     */
    onEnter(state: TState, callback: (from: TState | null) => void): () => void;

    /**
     * @zh 监听状态退出事件
     * @en Listen to state exit event
     *
     * @param state - @zh 状态名称 @en State name
     * @param callback - @zh 回调函数 @en Callback function
     */
    onExit(state: TState, callback: (to: TState) => void): () => void;

    /**
     * @zh 监听任意状态变更
     * @en Listen to any state change
     *
     * @param callback - @zh 回调函数 @en Callback function
     */
    onChange(callback: StateChangeListener<TState>): () => void;

    // =========================================================================
    // 调试 | Debug
    // =========================================================================

    /**
     * @zh 获取状态历史
     * @en Get state history
     */
    getHistory(): StateChangeEvent<TState>[];

    /**
     * @zh 清除历史
     * @en Clear history
     */
    clearHistory(): void;
}
