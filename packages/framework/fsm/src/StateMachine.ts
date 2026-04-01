/**
 * @zh 状态机实现
 * @en State Machine Implementation
 *
 * @zh 提供有限状态机的默认实现
 * @en Provides default implementation for finite state machine
 */

import type {
    IStateMachine,
    StateConfig,
    TransitionConfig,
    TransitionCondition,
    StateChangeEvent,
    StateChangeListener
} from './IStateMachine';

// =============================================================================
// 状态机配置 | State Machine Configuration
// =============================================================================

/**
 * @zh 状态机配置选项
 * @en State machine configuration options
 */
export interface StateMachineOptions<TContext = unknown> {
    /**
     * @zh 上下文对象
     * @en Context object
     */
    context?: TContext;

    /**
     * @zh 最大历史记录数量
     * @en Maximum history size
     */
    maxHistorySize?: number;

    /**
     * @zh 是否启用历史记录
     * @en Whether to enable history
     */
    enableHistory?: boolean;
}

// =============================================================================
// 状态机实现 | State Machine Implementation
// =============================================================================

/**
 * @zh 状态机实现
 * @en State machine implementation
 */
export class StateMachine<TState extends string = string, TContext = unknown>
    implements IStateMachine<TState, TContext>
{
    private _current: TState;
    private _previous: TState | null = null;
    private _context: TContext;
    private _isTransitioning = false;
    private _stateElapsed = 0;

    private readonly _states: Map<TState, StateConfig<TState, TContext>> = new Map();
    private readonly _transitions: Map<TState, TransitionConfig<TState, TContext>[]> = new Map();

    private readonly _enterListeners: Map<TState, Set<(from: TState | null) => void>> = new Map();
    private readonly _exitListeners: Map<TState, Set<(to: TState) => void>> = new Map();
    private readonly _changeListeners: Set<StateChangeListener<TState>> = new Set();

    private _history: StateChangeEvent<TState>[] = [];
    private readonly _maxHistorySize: number;
    private readonly _enableHistory: boolean;

    constructor(initialState: TState, options: StateMachineOptions<TContext> = {}) {
        this._current = initialState;
        this._context = (options.context ?? {}) as TContext;
        this._maxHistorySize = options.maxHistorySize ?? 100;
        this._enableHistory = options.enableHistory ?? true;

        this.defineState(initialState);
    }

    // =========================================================================
    // 属性 | Properties
    // =========================================================================

    get current(): TState {
        return this._current;
    }

    get previous(): TState | null {
        return this._previous;
    }

    get context(): TContext {
        return this._context;
    }

    get isTransitioning(): boolean {
        return this._isTransitioning;
    }

    /**
     * @zh 当前状态持续时间（毫秒，基于 update() 累积的 deltaTime）
     * @en Current state duration in ms (accumulated from deltaTime in update())
     */
    get currentStateDuration(): number {
        return this._stateElapsed;
    }

    // =========================================================================
    // 状态定义 | State Definition
    // =========================================================================

    defineState(state: TState, config?: Partial<StateConfig<TState, TContext>>): void {
        const stateConfig: StateConfig<TState, TContext> = {
            name: state,
            ...config
        };
        this._states.set(state, stateConfig);
    }

    hasState(state: TState): boolean {
        return this._states.has(state);
    }

    getStateConfig(state: TState): Readonly<StateConfig<TState, TContext>> | undefined {
        return this._states.get(state);
    }

    getStates(): TState[] {
        return Array.from(this._states.keys());
    }

    // =========================================================================
    // 转换定义 | Transition Definition
    // =========================================================================

    defineTransition(
        from: TState,
        to: TState,
        condition?: TransitionCondition<TContext>,
        priority = 0
    ): void {
        if (!this._transitions.has(from)) {
            this._transitions.set(from, []);
        }

        const transitions = this._transitions.get(from)!;

        const existingIndex = transitions.findIndex(t => t.to === to);
        if (existingIndex >= 0) {
            transitions.splice(existingIndex, 1);
        }

        transitions.push({ from, to, condition, priority });
        transitions.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    }

    removeTransition(from: TState, to: TState): void {
        const transitions = this._transitions.get(from);
        if (transitions) {
            const index = transitions.findIndex(t => t.to === to);
            if (index >= 0) {
                transitions.splice(index, 1);
            }
        }
    }

    getTransitionsFrom(from: TState): ReadonlyArray<TransitionConfig<TState, TContext>> {
        return [...(this._transitions.get(from) ?? [])];
    }

    // =========================================================================
    // 转换操作 | Transition Operations
    // =========================================================================

    canTransition(to: TState): boolean {
        if (this._isTransitioning) {
            return false;
        }

        if (this._current === to) {
            return false;
        }

        const transitions = this._transitions.get(this._current);

        // 未定义任何转换规则 → 允许自由转换
        if (!transitions || transitions.length === 0) {
            return true;
        }

        // 已定义转换规则 → 必须有匹配的规则
        const transition = transitions.find(t => t.to === to);
        if (!transition) {
            return false;
        }

        if (transition.condition) {
            return transition.condition(this._context);
        }

        return true;
    }

    transition(to: TState, force = false): boolean {
        if (this._isTransitioning) {
            console.warn('StateMachine: Cannot transition while already transitioning');
            return false;
        }

        if (this._current === to) {
            return false;
        }

        if (!force && !this.canTransition(to)) {
            return false;
        }

        this._performTransition(to);
        return true;
    }

    evaluateTransitions(): boolean {
        if (this._isTransitioning) {
            return false;
        }

        const transitions = this._transitions.get(this._current);
        if (!transitions || transitions.length === 0) {
            return false;
        }

        for (const transition of transitions) {
            // 无条件的转换不参与自动评估，只能通过 transition() 手动触发
            if (transition.condition && transition.condition(this._context)) {
                this._performTransition(transition.to);
                return true;
            }
        }

        return false;
    }

    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    update(deltaTime: number): void {
        this._stateElapsed += deltaTime;

        const config = this._states.get(this._current);
        if (config?.onUpdate) {
            try {
                config.onUpdate(this._context, deltaTime);
            } catch (error) {
                console.error(`StateMachine: Error in onUpdate for state '${this._current}':`, error);
            }
        }
    }

    reset(initialState?: TState): void {
        const targetState = initialState ?? this._current;

        this._previous = null;
        this._current = targetState;
        this._stateElapsed = 0;
        this._isTransitioning = false;

        this.clearHistory();
        this._fireEnterCallbacks(targetState, null);
    }

    /**
     * @zh 销毁状态机，释放所有监听器引用
     * @en Dispose state machine, release all listener references
     */
    dispose(): void {
        this._enterListeners.clear();
        this._exitListeners.clear();
        this._changeListeners.clear();
        this._history = [];
    }

    // =========================================================================
    // 事件监听 | Event Listening
    // =========================================================================

    onEnter(state: TState, callback: (from: TState | null) => void): () => void {
        if (!this._enterListeners.has(state)) {
            this._enterListeners.set(state, new Set());
        }
        this._enterListeners.get(state)!.add(callback);

        return () => {
            this._enterListeners.get(state)?.delete(callback);
        };
    }

    onExit(state: TState, callback: (to: TState) => void): () => void {
        if (!this._exitListeners.has(state)) {
            this._exitListeners.set(state, new Set());
        }
        this._exitListeners.get(state)!.add(callback);

        return () => {
            this._exitListeners.get(state)?.delete(callback);
        };
    }

    onChange(callback: StateChangeListener<TState>): () => void {
        this._changeListeners.add(callback);

        return () => {
            this._changeListeners.delete(callback);
        };
    }

    // =========================================================================
    // 调试 | Debug
    // =========================================================================

    getHistory(): ReadonlyArray<StateChangeEvent<TState>> {
        return [...this._history];
    }

    clearHistory(): void {
        this._history = [];
    }

    getDebugInfo(): {
        current: TState;
        previous: TState | null;
        duration: number;
        stateCount: number;
        transitionCount: number;
        historySize: number;
    } {
        let transitionCount = 0;
        for (const transitions of this._transitions.values()) {
            transitionCount += transitions.length;
        }

        return {
            current: this._current,
            previous: this._previous,
            duration: this.currentStateDuration,
            stateCount: this._states.size,
            transitionCount,
            historySize: this._history.length
        };
    }

    // =========================================================================
    // 内部方法 | Internal
    // =========================================================================

    private _performTransition(to: TState): void {
        this._isTransitioning = true;

        const from = this._current;

        this._fireExitCallbacks(from, to);

        this._previous = from;
        this._current = to;
        this._stateElapsed = 0;

        // 变更监听器独立于历史开关触发
        const event: StateChangeEvent<TState> = {
            from,
            to,
            timestamp: Date.now()
        };

        if (this._enableHistory) {
            this._history.push(event);
            if (this._history.length > this._maxHistorySize) {
                this._history.shift();
            }
        }

        for (const listener of this._changeListeners) {
            try {
                listener(event);
            } catch (error) {
                console.error('StateMachine: Error in change listener:', error);
            }
        }

        this._fireEnterCallbacks(to, from);

        this._isTransitioning = false;
    }

    private _fireEnterCallbacks(state: TState, from: TState | null): void {
        const config = this._states.get(state);
        if (config?.onEnter) {
            try {
                config.onEnter(this._context, from);
            } catch (error) {
                console.error(`StateMachine: Error in onEnter for state '${state}':`, error);
            }
        }

        const listeners = this._enterListeners.get(state);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(from);
                } catch (error) {
                    console.error(`StateMachine: Error in enter listener for state '${state}':`, error);
                }
            }
        }
    }

    private _fireExitCallbacks(state: TState, to: TState): void {
        const config = this._states.get(state);
        if (config?.onExit) {
            try {
                config.onExit(this._context, to);
            } catch (error) {
                console.error(`StateMachine: Error in onExit for state '${state}':`, error);
            }
        }

        const listeners = this._exitListeners.get(state);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(to);
                } catch (error) {
                    console.error(`StateMachine: Error in exit listener for state '${state}':`, error);
                }
            }
        }
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建状态机
 * @en Create state machine
 *
 * @param initialState - @zh 初始状态 @en Initial state
 * @param options - @zh 配置选项 @en Configuration options
 * @returns @zh 状态机实例 @en State machine instance
 *
 * @example
 * ```typescript
 * type PlayerState = 'idle' | 'walk' | 'run';
 *
 * const fsm = createStateMachine<PlayerState>('idle');
 * fsm.defineState('idle', { onEnter: () => playIdleAnim() });
 * fsm.defineState('walk', { onEnter: () => playWalkAnim() });
 * fsm.defineTransition('idle', 'walk', () => isMoving);
 *
 * // 手动转换
 * fsm.transition('walk');
 *
 * // 自动评估
 * fsm.evaluateTransitions();
 * ```
 */
export function createStateMachine<TState extends string = string, TContext = unknown>(
    initialState: TState,
    options?: StateMachineOptions<TContext>
): IStateMachine<TState, TContext> {
    return new StateMachine<TState, TContext>(initialState, options);
}
