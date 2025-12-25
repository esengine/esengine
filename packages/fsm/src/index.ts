/**
 * @zh @esengine/fsm - 有限状态机
 * @en @esengine/fsm - Finite State Machine
 *
 * @zh 提供通用状态机功能，用于角色/AI 状态管理
 * @en Provides generic state machine for character/AI state management
 */

// =============================================================================
// 接口和类型 | Interfaces and Types
// =============================================================================

export type {
    StateConfig,
    TransitionConfig,
    TransitionCondition,
    StateChangeEvent,
    StateChangeListener,
    IStateMachine
} from './IStateMachine';

// =============================================================================
// 实现 | Implementations
// =============================================================================

export type { StateMachineOptions } from './StateMachine';
export { StateMachine, createStateMachine } from './StateMachine';

// =============================================================================
// 服务令牌 | Service Tokens
// =============================================================================

export { StateMachineToken } from './tokens';

// =============================================================================
// 蓝图节点 | Blueprint Nodes
// =============================================================================

export {
    // Templates
    GetCurrentStateTemplate,
    TransitionToTemplate,
    CanTransitionTemplate,
    IsInStateTemplate,
    WasInStateTemplate,
    GetStateDurationTemplate,
    EvaluateTransitionsTemplate,
    ResetStateMachineTemplate,
    // Executors
    GetCurrentStateExecutor,
    TransitionToExecutor,
    CanTransitionExecutor,
    IsInStateExecutor,
    WasInStateExecutor,
    GetStateDurationExecutor,
    EvaluateTransitionsExecutor,
    ResetStateMachineExecutor,
    // Collection
    StateMachineNodeDefinitions
} from './nodes';
