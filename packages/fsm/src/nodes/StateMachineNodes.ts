/**
 * @zh 状态机蓝图节点
 * @en State Machine Blueprint Nodes
 *
 * @zh 提供状态机功能的蓝图节点
 * @en Provides blueprint nodes for state machine functionality
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import type { IStateMachine } from '../IStateMachine';

// =============================================================================
// 执行上下文接口 | Execution Context Interface
// =============================================================================

/**
 * @zh 状态机上下文
 * @en State machine context
 */
interface FSMContext {
    stateMachine: IStateMachine<string, unknown>;
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
    setOutputs(nodeId: string, outputs: Record<string, unknown>): void;
}

// =============================================================================
// GetCurrentState 节点 | GetCurrentState Node
// =============================================================================

/**
 * @zh GetCurrentState 节点模板
 * @en GetCurrentState node template
 */
export const GetCurrentStateTemplate: BlueprintNodeTemplate = {
    type: 'GetCurrentState',
    title: 'Get Current State',
    category: 'logic',
    description: 'Get current state of the state machine / 获取状态机当前状态',
    keywords: ['fsm', 'state', 'current', 'get'],
    menuPath: ['State Machine', 'Get Current State'],
    isPure: true,
    inputs: [],
    outputs: [
        {
            name: 'state',
            displayName: 'State',
            type: 'string'
        },
        {
            name: 'previous',
            displayName: 'Previous',
            type: 'string'
        },
        {
            name: 'duration',
            displayName: 'Duration (ms)',
            type: 'float'
        }
    ],
    color: '#8b5a8b'
};

/**
 * @zh GetCurrentState 节点执行器
 * @en GetCurrentState node executor
 */
export class GetCurrentStateExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FSMContext;
        const fsm = ctx.stateMachine;

        return {
            outputs: {
                state: fsm?.current ?? '',
                previous: fsm?.previous ?? '',
                duration: fsm?.currentStateDuration ?? 0
            }
        };
    }
}

// =============================================================================
// TransitionTo 节点 | TransitionTo Node
// =============================================================================

/**
 * @zh TransitionTo 节点模板
 * @en TransitionTo node template
 */
export const TransitionToTemplate: BlueprintNodeTemplate = {
    type: 'TransitionTo',
    title: 'Transition To',
    category: 'logic',
    description: 'Transition to a new state / 转换到新状态',
    keywords: ['fsm', 'state', 'transition', 'change'],
    menuPath: ['State Machine', 'Transition To'],
    isPure: false,
    inputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'state',
            displayName: 'Target State',
            type: 'string',
            defaultValue: ''
        },
        {
            name: 'force',
            displayName: 'Force',
            type: 'bool',
            defaultValue: false
        }
    ],
    outputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'success',
            displayName: 'Success',
            type: 'bool'
        }
    ],
    color: '#8b5a8b'
};

/**
 * @zh TransitionTo 节点执行器
 * @en TransitionTo node executor
 */
export class TransitionToExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FSMContext;
        const state = ctx.evaluateInput(node.id, 'state', '') as string;
        const force = ctx.evaluateInput(node.id, 'force', false) as boolean;

        let success = false;
        if (state && ctx.stateMachine) {
            success = ctx.stateMachine.transition(state, force);
        }

        return {
            outputs: {
                success
            },
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// CanTransition 节点 | CanTransition Node
// =============================================================================

/**
 * @zh CanTransition 节点模板
 * @en CanTransition node template
 */
export const CanTransitionTemplate: BlueprintNodeTemplate = {
    type: 'CanTransition',
    title: 'Can Transition',
    category: 'logic',
    description: 'Check if can transition to state / 检查是否可以转换到状态',
    keywords: ['fsm', 'state', 'transition', 'can', 'check'],
    menuPath: ['State Machine', 'Can Transition'],
    isPure: true,
    inputs: [
        {
            name: 'state',
            displayName: 'Target State',
            type: 'string',
            defaultValue: ''
        }
    ],
    outputs: [
        {
            name: 'canTransition',
            displayName: 'Can Transition',
            type: 'bool'
        }
    ],
    color: '#8b5a8b'
};

/**
 * @zh CanTransition 节点执行器
 * @en CanTransition node executor
 */
export class CanTransitionExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FSMContext;
        const state = ctx.evaluateInput(node.id, 'state', '') as string;

        const canTransition = state ? ctx.stateMachine?.canTransition(state) ?? false : false;

        return {
            outputs: {
                canTransition
            }
        };
    }
}

// =============================================================================
// IsInState 节点 | IsInState Node
// =============================================================================

/**
 * @zh IsInState 节点模板
 * @en IsInState node template
 */
export const IsInStateTemplate: BlueprintNodeTemplate = {
    type: 'IsInState',
    title: 'Is In State',
    category: 'logic',
    description: 'Check if currently in a specific state / 检查是否处于特定状态',
    keywords: ['fsm', 'state', 'is', 'check', 'current'],
    menuPath: ['State Machine', 'Is In State'],
    isPure: true,
    inputs: [
        {
            name: 'state',
            displayName: 'State',
            type: 'string',
            defaultValue: ''
        }
    ],
    outputs: [
        {
            name: 'isInState',
            displayName: 'Is In State',
            type: 'bool'
        }
    ],
    color: '#8b5a8b'
};

/**
 * @zh IsInState 节点执行器
 * @en IsInState node executor
 */
export class IsInStateExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FSMContext;
        const state = ctx.evaluateInput(node.id, 'state', '') as string;

        const isInState = state ? ctx.stateMachine?.current === state : false;

        return {
            outputs: {
                isInState
            }
        };
    }
}

// =============================================================================
// WasInState 节点 | WasInState Node
// =============================================================================

/**
 * @zh WasInState 节点模板
 * @en WasInState node template
 */
export const WasInStateTemplate: BlueprintNodeTemplate = {
    type: 'WasInState',
    title: 'Was In State',
    category: 'logic',
    description: 'Check if was previously in a specific state / 检查之前是否处于特定状态',
    keywords: ['fsm', 'state', 'was', 'previous', 'check'],
    menuPath: ['State Machine', 'Was In State'],
    isPure: true,
    inputs: [
        {
            name: 'state',
            displayName: 'State',
            type: 'string',
            defaultValue: ''
        }
    ],
    outputs: [
        {
            name: 'wasInState',
            displayName: 'Was In State',
            type: 'bool'
        }
    ],
    color: '#8b5a8b'
};

/**
 * @zh WasInState 节点执行器
 * @en WasInState node executor
 */
export class WasInStateExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FSMContext;
        const state = ctx.evaluateInput(node.id, 'state', '') as string;

        const wasInState = state ? ctx.stateMachine?.previous === state : false;

        return {
            outputs: {
                wasInState
            }
        };
    }
}

// =============================================================================
// GetStateDuration 节点 | GetStateDuration Node
// =============================================================================

/**
 * @zh GetStateDuration 节点模板
 * @en GetStateDuration node template
 */
export const GetStateDurationTemplate: BlueprintNodeTemplate = {
    type: 'GetStateDuration',
    title: 'Get State Duration',
    category: 'logic',
    description: 'Get how long current state has been active / 获取当前状态持续时间',
    keywords: ['fsm', 'state', 'duration', 'time'],
    menuPath: ['State Machine', 'Get State Duration'],
    isPure: true,
    inputs: [],
    outputs: [
        {
            name: 'duration',
            displayName: 'Duration (ms)',
            type: 'float'
        },
        {
            name: 'seconds',
            displayName: 'Seconds',
            type: 'float'
        }
    ],
    color: '#8b5a8b'
};

/**
 * @zh GetStateDuration 节点执行器
 * @en GetStateDuration node executor
 */
export class GetStateDurationExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FSMContext;
        const duration = ctx.stateMachine?.currentStateDuration ?? 0;

        return {
            outputs: {
                duration,
                seconds: duration / 1000
            }
        };
    }
}

// =============================================================================
// EvaluateTransitions 节点 | EvaluateTransitions Node
// =============================================================================

/**
 * @zh EvaluateTransitions 节点模板
 * @en EvaluateTransitions node template
 */
export const EvaluateTransitionsTemplate: BlueprintNodeTemplate = {
    type: 'EvaluateTransitions',
    title: 'Evaluate Transitions',
    category: 'logic',
    description: 'Evaluate and execute automatic transitions / 评估并执行自动转换',
    keywords: ['fsm', 'state', 'transition', 'evaluate', 'auto'],
    menuPath: ['State Machine', 'Evaluate Transitions'],
    isPure: false,
    inputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        }
    ],
    outputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'transitioned',
            displayName: 'Transitioned',
            type: 'bool'
        }
    ],
    color: '#8b5a8b'
};

/**
 * @zh EvaluateTransitions 节点执行器
 * @en EvaluateTransitions node executor
 */
export class EvaluateTransitionsExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FSMContext;
        const transitioned = ctx.stateMachine?.evaluateTransitions() ?? false;

        return {
            outputs: {
                transitioned
            },
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// ResetStateMachine 节点 | ResetStateMachine Node
// =============================================================================

/**
 * @zh ResetStateMachine 节点模板
 * @en ResetStateMachine node template
 */
export const ResetStateMachineTemplate: BlueprintNodeTemplate = {
    type: 'ResetStateMachine',
    title: 'Reset State Machine',
    category: 'logic',
    description: 'Reset state machine to initial state / 重置状态机到初始状态',
    keywords: ['fsm', 'state', 'reset', 'initial'],
    menuPath: ['State Machine', 'Reset'],
    isPure: false,
    inputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'state',
            displayName: 'Initial State',
            type: 'string',
            defaultValue: ''
        }
    ],
    outputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        }
    ],
    color: '#8b5a8b'
};

/**
 * @zh ResetStateMachine 节点执行器
 * @en ResetStateMachine node executor
 */
export class ResetStateMachineExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FSMContext;
        const state = ctx.evaluateInput(node.id, 'state', '') as string;

        if (ctx.stateMachine) {
            ctx.stateMachine.reset(state || undefined);
        }

        return {
            outputs: {},
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// 节点定义集合 | Node Definition Collection
// =============================================================================

/**
 * @zh 状态机节点定义
 * @en State machine node definitions
 */
export const StateMachineNodeDefinitions = [
    { template: GetCurrentStateTemplate, executor: new GetCurrentStateExecutor() },
    { template: TransitionToTemplate, executor: new TransitionToExecutor() },
    { template: CanTransitionTemplate, executor: new CanTransitionExecutor() },
    { template: IsInStateTemplate, executor: new IsInStateExecutor() },
    { template: WasInStateTemplate, executor: new WasInStateExecutor() },
    { template: GetStateDurationTemplate, executor: new GetStateDurationExecutor() },
    { template: EvaluateTransitionsTemplate, executor: new EvaluateTransitionsExecutor() },
    { template: ResetStateMachineTemplate, executor: new ResetStateMachineExecutor() }
];
