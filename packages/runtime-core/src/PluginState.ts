/**
 * @zh 插件生命周期状态
 * @en Plugin Lifecycle State
 *
 * @zh 提供统一的插件状态定义，确保运行时和编辑器使用一致的状态机。
 * @en Provides unified plugin state definition, ensuring runtime and editor use consistent state machine.
 *
 * @zh 状态转换图 | State Transition Diagram:
 * ```
 *                    ┌──────────────────────────────────────────┐
 *                    │                                          │
 *                    ▼                                          │
 *     ┌──────────┐  load   ┌─────────┐  init   ┌────────────┐  │
 *     │ Unloaded │ ──────► │ Loading │ ──────► │Initializing│  │
 *     └──────────┘         └─────────┘         └────────────┘  │
 *           ▲                   │                    │          │
 *           │                   │ fail               │ success  │
 *           │                   ▼                    ▼          │
 *           │              ┌─────────┐         ┌─────────┐      │
 *           │              │  Error  │◄────────│  Active │      │
 *           │              └─────────┘  error  └─────────┘      │
 *           │                   │                    │          │
 *           │                   │ retry              │ disable  │
 *           │                   ▼                    ▼          │
 *           │              ┌─────────┐         ┌──────────┐     │
 *           └──────────────│ Loading │◄────────│ Disabled │─────┘
 *                 unload   └─────────┘  enable └──────────┘
 * ```
 */

// ============================================================================
// 插件状态 | Plugin State
// ============================================================================

/**
 * @zh 插件生命周期状态
 * @en Plugin lifecycle state
 *
 * @zh 统一定义，供 runtime-core 和 editor-core 共用
 * @en Unified definition for both runtime-core and editor-core
 */
export enum PluginLifecycleState {
    /**
     * @zh 未加载 - 初始状态
     * @en Unloaded - initial state
     */
    Unloaded = 'unloaded',

    /**
     * @zh 加载中 - 正在加载插件代码
     * @en Loading - loading plugin code
     */
    Loading = 'loading',

    /**
     * @zh 初始化中 - 正在执行初始化逻辑
     * @en Initializing - executing initialization logic
     */
    Initializing = 'initializing',

    /**
     * @zh 活动中 - 插件正常运行
     * @en Active - plugin running normally
     */
    Active = 'active',

    /**
     * @zh 错误 - 加载或运行时出错
     * @en Error - error during loading or runtime
     */
    Error = 'error',

    /**
     * @zh 已禁用 - 用户主动禁用
     * @en Disabled - user disabled
     */
    Disabled = 'disabled'
}

/**
 * @zh 插件状态（简化别名，向后兼容）
 * @en Plugin state (simplified alias for backward compatibility)
 */
export type PluginState =
    | 'unloaded'
    | 'loading'
    | 'initializing'
    | 'active'
    | 'error'
    | 'disabled';

// ============================================================================
// 状态转换 | State Transitions
// ============================================================================

/**
 * @zh 有效的状态转换
 * @en Valid state transitions
 */
export const VALID_STATE_TRANSITIONS: Record<PluginState, PluginState[]> = {
    unloaded: ['loading'],
    loading: ['initializing', 'error', 'unloaded'],
    initializing: ['active', 'error'],
    active: ['disabled', 'error', 'unloaded'],
    error: ['loading', 'unloaded'],
    disabled: ['loading', 'unloaded']
};

/**
 * @zh 检查状态转换是否有效
 * @en Check if state transition is valid
 *
 * @param from - @zh 当前状态 @en Current state
 * @param to - @zh 目标状态 @en Target state
 * @returns @zh 是否允许转换 @en Whether transition is allowed
 */
export function isValidStateTransition(from: PluginState, to: PluginState): boolean {
    return VALID_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * @zh 检查插件是否可操作
 * @en Check if plugin is operable
 */
export function isPluginOperable(state: PluginState): boolean {
    return state === 'active' || state === 'disabled';
}

/**
 * @zh 检查插件是否正在加载
 * @en Check if plugin is loading
 */
export function isPluginLoading(state: PluginState): boolean {
    return state === 'loading' || state === 'initializing';
}

/**
 * @zh 检查插件是否可用
 * @en Check if plugin is available
 */
export function isPluginAvailable(state: PluginState): boolean {
    return state === 'active';
}

// ============================================================================
// 状态转换事件 | State Transition Events
// ============================================================================

/**
 * @zh 状态转换事件
 * @en State transition event
 */
export interface PluginStateChangeEvent {
    /**
     * @zh 插件 ID
     * @en Plugin ID
     */
    pluginId: string;

    /**
     * @zh 之前的状态
     * @en Previous state
     */
    previousState: PluginState;

    /**
     * @zh 当前状态
     * @en Current state
     */
    currentState: PluginState;

    /**
     * @zh 错误信息（如果有）
     * @en Error message (if any)
     */
    error?: Error;

    /**
     * @zh 时间戳
     * @en Timestamp
     */
    timestamp: number;
}

/**
 * @zh 状态变更监听器
 * @en State change listener
 */
export type PluginStateChangeListener = (event: PluginStateChangeEvent) => void;
