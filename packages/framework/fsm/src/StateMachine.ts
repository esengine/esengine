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
    private _stateStartTime = 0;

    private states: Map<TState, StateConfig<TState, TContext>> = new Map();
    private transitions: Map<TState, TransitionConfig<TState, TContext>[]> = new Map();

    private enterListeners: Map<TState, Set<(from: TState | null) => void>> = new Map();
    private exitListeners: Map<TState, Set<(to: TState) => void>> = new Map();
    private changeListeners: Set<StateChangeListener<TState>> = new Set();

    private history: StateChangeEvent<TState>[] = [];
    private maxHistorySize: number;
    private enableHistory: boolean;

    constructor(initialState: TState, options: StateMachineOptions<TContext> = {}) {
        this._current = initialState;
        this._context = (options.context ?? {}) as TContext;
        this.maxHistorySize = options.maxHistorySize ?? 100;
        this.enableHistory = options.enableHistory ?? true;
        this._stateStartTime = Date.now();

        // Auto-define initial state if not defined
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

    get currentStateDuration(): number {
        return Date.now() - this._stateStartTime;
    }

    // =========================================================================
    // 状态定义 | State Definition
    // =========================================================================

    defineState(state: TState, config?: Partial<StateConfig<TState, TContext>>): void {
        const stateConfig: StateConfig<TState, TContext> = {
            name: state,
            ...config
        };
        this.states.set(state, stateConfig);
    }

    hasState(state: TState): boolean {
        return this.states.has(state);
    }

    getStateConfig(state: TState): StateConfig<TState, TContext> | undefined {
        return this.states.get(state);
    }

    getStates(): TState[] {
        return Array.from(this.states.keys());
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
        if (!this.transitions.has(from)) {
            this.transitions.set(from, []);
        }

        const transitions = this.transitions.get(from)!;

        // Remove existing transition with same from/to
        const existingIndex = transitions.findIndex(t => t.to === to);
        if (existingIndex >= 0) {
            transitions.splice(existingIndex, 1);
        }

        transitions.push({
            from,
            to,
            condition,
            priority
        });

        // Sort by priority (descending)
        transitions.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    }

    removeTransition(from: TState, to: TState): void {
        const transitions = this.transitions.get(from);
        if (transitions) {
            const index = transitions.findIndex(t => t.to === to);
            if (index >= 0) {
                transitions.splice(index, 1);
            }
        }
    }

    getTransitionsFrom(from: TState): TransitionConfig<TState, TContext>[] {
        return this.transitions.get(from) ?? [];
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

        const transitions = this.transitions.get(this._current);
        if (!transitions) {
            return true; // Allow if no restrictions defined
        }

        const transition = transitions.find(t => t.to === to);
        if (!transition) {
            return true; // Allow if no specific transition defined
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

        this.performTransition(to);
        return true;
    }

    evaluateTransitions(): boolean {
        if (this._isTransitioning) {
            return false;
        }

        const transitions = this.transitions.get(this._current);
        if (!transitions || transitions.length === 0) {
            return false;
        }

        for (const transition of transitions) {
            if (!transition.condition || transition.condition(this._context)) {
                this.performTransition(transition.to);
                return true;
            }
        }

        return false;
    }

    private performTransition(to: TState): void {
        this._isTransitioning = true;

        const from = this._current;

        // Exit current state
        const currentConfig = this.states.get(from);
        if (currentConfig?.onExit) {
            try {
                currentConfig.onExit(this._context, to);
            } catch (error) {
                console.error(`StateMachine: Error in onExit for state '${from}':`, error);
            }
        }

        // Notify exit listeners
        const exitListeners = this.exitListeners.get(from);
        if (exitListeners) {
            for (const listener of exitListeners) {
                try {
                    listener(to);
                } catch (error) {
                    console.error(`StateMachine: Error in exit listener for state '${from}':`, error);
                }
            }
        }

        // Update state
        this._previous = from;
        this._current = to;
        this._stateStartTime = Date.now();

        // Record history
        if (this.enableHistory) {
            const event: StateChangeEvent<TState> = {
                from,
                to,
                timestamp: this._stateStartTime
            };
            this.history.push(event);

            if (this.history.length > this.maxHistorySize) {
                this.history.shift();
            }

            // Notify change listeners
            for (const listener of this.changeListeners) {
                try {
                    listener(event);
                } catch (error) {
                    console.error('StateMachine: Error in change listener:', error);
                }
            }
        }

        // Enter new state
        const newConfig = this.states.get(to);
        if (newConfig?.onEnter) {
            try {
                newConfig.onEnter(this._context, from);
            } catch (error) {
                console.error(`StateMachine: Error in onEnter for state '${to}':`, error);
            }
        }

        // Notify enter listeners
        const enterListeners = this.enterListeners.get(to);
        if (enterListeners) {
            for (const listener of enterListeners) {
                try {
                    listener(from);
                } catch (error) {
                    console.error(`StateMachine: Error in enter listener for state '${to}':`, error);
                }
            }
        }

        this._isTransitioning = false;
    }

    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    update(deltaTime: number): void {
        const config = this.states.get(this._current);
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
        this._stateStartTime = Date.now();
        this._isTransitioning = false;

        this.clearHistory();
    }

    // =========================================================================
    // 事件监听 | Event Listening
    // =========================================================================

    onEnter(state: TState, callback: (from: TState | null) => void): () => void {
        if (!this.enterListeners.has(state)) {
            this.enterListeners.set(state, new Set());
        }
        this.enterListeners.get(state)!.add(callback);

        return () => {
            this.enterListeners.get(state)?.delete(callback);
        };
    }

    onExit(state: TState, callback: (to: TState) => void): () => void {
        if (!this.exitListeners.has(state)) {
            this.exitListeners.set(state, new Set());
        }
        this.exitListeners.get(state)!.add(callback);

        return () => {
            this.exitListeners.get(state)?.delete(callback);
        };
    }

    onChange(callback: StateChangeListener<TState>): () => void {
        this.changeListeners.add(callback);

        return () => {
            this.changeListeners.delete(callback);
        };
    }

    // =========================================================================
    // 调试 | Debug
    // =========================================================================

    getHistory(): StateChangeEvent<TState>[] {
        return [...this.history];
    }

    clearHistory(): void {
        this.history = [];
    }

    /**
     * @zh 获取状态机的调试信息
     * @en Get debug info for the state machine
     */
    getDebugInfo(): {
        current: TState;
        previous: TState | null;
        duration: number;
        stateCount: number;
        transitionCount: number;
        historySize: number;
    } {
        let transitionCount = 0;
        for (const transitions of this.transitions.values()) {
            transitionCount += transitions.length;
        }

        return {
            current: this._current,
            previous: this._previous,
            duration: this.currentStateDuration,
            stateCount: this.states.size,
            transitionCount,
            historySize: this.history.length
        };
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
 */
export function createStateMachine<TState extends string = string, TContext = unknown>(
    initialState: TState,
    options?: StateMachineOptions<TContext>
): IStateMachine<TState, TContext> {
    return new StateMachine<TState, TContext>(initialState, options);
}
