/**
 * @zh 定时器蓝图节点
 * @en Timer Blueprint Nodes
 *
 * @zh 提供定时器和冷却功能的蓝图节点
 * @en Provides blueprint nodes for timer and cooldown functionality
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import type { ITimerService } from '../ITimerService';

// =============================================================================
// 执行上下文接口 | Execution Context Interface
// =============================================================================

/**
 * @zh 定时器上下文
 * @en Timer context
 */
interface TimerContext {
    timerService: ITimerService;
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
    setOutputs(nodeId: string, outputs: Record<string, unknown>): void;
}

// =============================================================================
// StartCooldown 节点 | StartCooldown Node
// =============================================================================

/**
 * @zh StartCooldown 节点模板
 * @en StartCooldown node template
 */
export const StartCooldownTemplate: BlueprintNodeTemplate = {
    type: 'StartCooldown',
    title: 'Start Cooldown',
    category: 'time',
    description: 'Start a cooldown timer / 开始冷却计时',
    keywords: ['timer', 'cooldown', 'start', 'delay'],
    menuPath: ['Timer', 'Start Cooldown'],
    isPure: false,
    inputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'id',
            displayName: 'Cooldown ID',
            type: 'string',
            defaultValue: ''
        },
        {
            name: 'duration',
            displayName: 'Duration (ms)',
            type: 'float',
            defaultValue: 1000
        }
    ],
    outputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        }
    ],
    color: '#00bcd4'
};

/**
 * @zh StartCooldown 节点执行器
 * @en StartCooldown node executor
 */
export class StartCooldownExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as TimerContext;
        const id = ctx.evaluateInput(node.id, 'id', '') as string;
        const duration = ctx.evaluateInput(node.id, 'duration', 1000) as number;

        if (id && ctx.timerService) {
            ctx.timerService.startCooldown(id, duration);
        }

        return {
            outputs: {},
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// IsCooldownReady 节点 | IsCooldownReady Node
// =============================================================================

/**
 * @zh IsCooldownReady 节点模板
 * @en IsCooldownReady node template
 */
export const IsCooldownReadyTemplate: BlueprintNodeTemplate = {
    type: 'IsCooldownReady',
    title: 'Is Cooldown Ready',
    category: 'time',
    description: 'Check if cooldown is ready / 检查冷却是否就绪',
    keywords: ['timer', 'cooldown', 'ready', 'check'],
    menuPath: ['Timer', 'Is Cooldown Ready'],
    isPure: true,
    inputs: [
        {
            name: 'id',
            displayName: 'Cooldown ID',
            type: 'string',
            defaultValue: ''
        }
    ],
    outputs: [
        {
            name: 'isReady',
            displayName: 'Is Ready',
            type: 'bool'
        },
        {
            name: 'isOnCooldown',
            displayName: 'Is On Cooldown',
            type: 'bool'
        }
    ],
    color: '#00bcd4'
};

/**
 * @zh IsCooldownReady 节点执行器
 * @en IsCooldownReady node executor
 */
export class IsCooldownReadyExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as TimerContext;
        const id = ctx.evaluateInput(node.id, 'id', '') as string;

        const isReady = id ? ctx.timerService?.isCooldownReady(id) ?? true : true;
        const isOnCooldown = !isReady;

        return {
            outputs: {
                isReady,
                isOnCooldown
            }
        };
    }
}

// =============================================================================
// GetCooldownProgress 节点 | GetCooldownProgress Node
// =============================================================================

/**
 * @zh GetCooldownProgress 节点模板
 * @en GetCooldownProgress node template
 */
export const GetCooldownProgressTemplate: BlueprintNodeTemplate = {
    type: 'GetCooldownProgress',
    title: 'Get Cooldown Progress',
    category: 'time',
    description: 'Get cooldown progress (0-1) / 获取冷却进度 (0-1)',
    keywords: ['timer', 'cooldown', 'progress', 'remaining'],
    menuPath: ['Timer', 'Get Cooldown Progress'],
    isPure: true,
    inputs: [
        {
            name: 'id',
            displayName: 'Cooldown ID',
            type: 'string',
            defaultValue: ''
        }
    ],
    outputs: [
        {
            name: 'progress',
            displayName: 'Progress',
            type: 'float'
        },
        {
            name: 'remaining',
            displayName: 'Remaining (ms)',
            type: 'float'
        },
        {
            name: 'isReady',
            displayName: 'Is Ready',
            type: 'bool'
        }
    ],
    color: '#00bcd4'
};

/**
 * @zh GetCooldownProgress 节点执行器
 * @en GetCooldownProgress node executor
 */
export class GetCooldownProgressExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as TimerContext;
        const id = ctx.evaluateInput(node.id, 'id', '') as string;

        const progress = id ? ctx.timerService?.getCooldownProgress(id) ?? 1 : 1;
        const remaining = id ? ctx.timerService?.getCooldownRemaining(id) ?? 0 : 0;
        const isReady = remaining <= 0;

        return {
            outputs: {
                progress,
                remaining,
                isReady
            }
        };
    }
}

// =============================================================================
// ResetCooldown 节点 | ResetCooldown Node
// =============================================================================

/**
 * @zh ResetCooldown 节点模板
 * @en ResetCooldown node template
 */
export const ResetCooldownTemplate: BlueprintNodeTemplate = {
    type: 'ResetCooldown',
    title: 'Reset Cooldown',
    category: 'time',
    description: 'Reset a cooldown (make it ready) / 重置冷却（使其就绪）',
    keywords: ['timer', 'cooldown', 'reset', 'clear'],
    menuPath: ['Timer', 'Reset Cooldown'],
    isPure: false,
    inputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'id',
            displayName: 'Cooldown ID',
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
    color: '#00bcd4'
};

/**
 * @zh ResetCooldown 节点执行器
 * @en ResetCooldown node executor
 */
export class ResetCooldownExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as TimerContext;
        const id = ctx.evaluateInput(node.id, 'id', '') as string;

        if (id && ctx.timerService) {
            ctx.timerService.resetCooldown(id);
        }

        return {
            outputs: {},
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// GetCooldownInfo 节点 | GetCooldownInfo Node
// =============================================================================

/**
 * @zh GetCooldownInfo 节点模板
 * @en GetCooldownInfo node template
 */
export const GetCooldownInfoTemplate: BlueprintNodeTemplate = {
    type: 'GetCooldownInfo',
    title: 'Get Cooldown Info',
    category: 'time',
    description: 'Get detailed cooldown information / 获取详细冷却信息',
    keywords: ['timer', 'cooldown', 'info', 'details'],
    menuPath: ['Timer', 'Get Cooldown Info'],
    isPure: true,
    inputs: [
        {
            name: 'id',
            displayName: 'Cooldown ID',
            type: 'string',
            defaultValue: ''
        }
    ],
    outputs: [
        {
            name: 'exists',
            displayName: 'Exists',
            type: 'bool'
        },
        {
            name: 'duration',
            displayName: 'Duration (ms)',
            type: 'float'
        },
        {
            name: 'remaining',
            displayName: 'Remaining (ms)',
            type: 'float'
        },
        {
            name: 'progress',
            displayName: 'Progress',
            type: 'float'
        },
        {
            name: 'isReady',
            displayName: 'Is Ready',
            type: 'bool'
        }
    ],
    color: '#00bcd4'
};

/**
 * @zh GetCooldownInfo 节点执行器
 * @en GetCooldownInfo node executor
 */
export class GetCooldownInfoExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as TimerContext;
        const id = ctx.evaluateInput(node.id, 'id', '') as string;

        const info = id ? ctx.timerService?.getCooldownInfo(id) : null;

        return {
            outputs: {
                exists: info !== null,
                duration: info?.duration ?? 0,
                remaining: info?.remaining ?? 0,
                progress: info?.progress ?? 1,
                isReady: info?.isReady ?? true
            }
        };
    }
}

// =============================================================================
// HasTimer 节点 | HasTimer Node
// =============================================================================

/**
 * @zh HasTimer 节点模板
 * @en HasTimer node template
 */
export const HasTimerTemplate: BlueprintNodeTemplate = {
    type: 'HasTimer',
    title: 'Has Timer',
    category: 'time',
    description: 'Check if a timer exists / 检查定时器是否存在',
    keywords: ['timer', 'exists', 'check', 'has'],
    menuPath: ['Timer', 'Has Timer'],
    isPure: true,
    inputs: [
        {
            name: 'id',
            displayName: 'Timer ID',
            type: 'string',
            defaultValue: ''
        }
    ],
    outputs: [
        {
            name: 'exists',
            displayName: 'Exists',
            type: 'bool'
        }
    ],
    color: '#00bcd4'
};

/**
 * @zh HasTimer 节点执行器
 * @en HasTimer node executor
 */
export class HasTimerExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as TimerContext;
        const id = ctx.evaluateInput(node.id, 'id', '') as string;

        const exists = id ? ctx.timerService?.hasTimer(id) ?? false : false;

        return {
            outputs: {
                exists
            }
        };
    }
}

// =============================================================================
// CancelTimer 节点 | CancelTimer Node
// =============================================================================

/**
 * @zh CancelTimer 节点模板
 * @en CancelTimer node template
 */
export const CancelTimerTemplate: BlueprintNodeTemplate = {
    type: 'CancelTimer',
    title: 'Cancel Timer',
    category: 'time',
    description: 'Cancel a timer by ID / 通过 ID 取消定时器',
    keywords: ['timer', 'cancel', 'stop', 'clear'],
    menuPath: ['Timer', 'Cancel Timer'],
    isPure: false,
    inputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'id',
            displayName: 'Timer ID',
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
    color: '#00bcd4'
};

/**
 * @zh CancelTimer 节点执行器
 * @en CancelTimer node executor
 */
export class CancelTimerExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as TimerContext;
        const id = ctx.evaluateInput(node.id, 'id', '') as string;

        if (id && ctx.timerService) {
            ctx.timerService.cancelById(id);
        }

        return {
            outputs: {},
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// GetTimerRemaining 节点 | GetTimerRemaining Node
// =============================================================================

/**
 * @zh GetTimerRemaining 节点模板
 * @en GetTimerRemaining node template
 */
export const GetTimerRemainingTemplate: BlueprintNodeTemplate = {
    type: 'GetTimerRemaining',
    title: 'Get Timer Remaining',
    category: 'time',
    description: 'Get remaining time for a timer / 获取定时器剩余时间',
    keywords: ['timer', 'remaining', 'time', 'left'],
    menuPath: ['Timer', 'Get Timer Remaining'],
    isPure: true,
    inputs: [
        {
            name: 'id',
            displayName: 'Timer ID',
            type: 'string',
            defaultValue: ''
        }
    ],
    outputs: [
        {
            name: 'remaining',
            displayName: 'Remaining (ms)',
            type: 'float'
        },
        {
            name: 'exists',
            displayName: 'Exists',
            type: 'bool'
        }
    ],
    color: '#00bcd4'
};

/**
 * @zh GetTimerRemaining 节点执行器
 * @en GetTimerRemaining node executor
 */
export class GetTimerRemainingExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as TimerContext;
        const id = ctx.evaluateInput(node.id, 'id', '') as string;

        const info = id ? ctx.timerService?.getTimerInfo(id) : null;

        return {
            outputs: {
                remaining: info?.remaining ?? 0,
                exists: info !== null
            }
        };
    }
}

// =============================================================================
// 节点定义集合 | Node Definition Collection
// =============================================================================

/**
 * @zh 定时器节点定义
 * @en Timer node definitions
 */
export const TimerNodeDefinitions = [
    { template: StartCooldownTemplate, executor: new StartCooldownExecutor() },
    { template: IsCooldownReadyTemplate, executor: new IsCooldownReadyExecutor() },
    { template: GetCooldownProgressTemplate, executor: new GetCooldownProgressExecutor() },
    { template: ResetCooldownTemplate, executor: new ResetCooldownExecutor() },
    { template: GetCooldownInfoTemplate, executor: new GetCooldownInfoExecutor() },
    { template: HasTimerTemplate, executor: new HasTimerExecutor() },
    { template: CancelTimerTemplate, executor: new CancelTimerExecutor() },
    { template: GetTimerRemainingTemplate, executor: new GetTimerRemainingExecutor() }
];
