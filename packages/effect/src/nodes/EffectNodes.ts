/**
 * @zh 效果系统蓝图节点
 * @en Effect System Blueprint Nodes
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import type { EffectContainer } from '../core/EffectContainer';
import type { IEffectDefinition, IEffectInstance, EffectEventType } from '../core/IEffect';

// =============================================================================
// 执行上下文接口 | Execution Context Interface
// =============================================================================

interface EffectContext {
    entity: {
        getComponent<T>(type: new (...args: unknown[]) => T): T | null;
    };
    getEffectContainer(): EffectContainer | null;
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
    setOutputs(nodeId: string, outputs: Record<string, unknown>): void;
    triggerOutput(nodeId: string, pinName: string): void;
}

// =============================================================================
// ApplyEffect 节点 | ApplyEffect Node
// =============================================================================

export const ApplyEffectTemplate: BlueprintNodeTemplate = {
    type: 'ApplyEffect',
    title: 'Apply Effect',
    category: 'custom',
    description: 'Apply an effect to target / 对目标应用效果',
    keywords: ['effect', 'buff', 'debuff', 'apply', 'status'],
    menuPath: ['Effect', 'Apply Effect'],
    inputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'effectTypeId', displayName: 'Effect Type', type: 'string' },
        { name: 'duration', displayName: 'Duration', type: 'float' },
        { name: 'sourceId', displayName: 'Source ID', type: 'string' }
    ],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'success', displayName: 'Success', type: 'bool' },
        { name: 'instanceId', displayName: 'Instance ID', type: 'string' }
    ],
    color: '#e91e63'
};

export class ApplyEffectExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as EffectContext;
        const effectTypeId = ctx.evaluateInput(node.id, 'effectTypeId', '') as string;
        const duration = ctx.evaluateInput(node.id, 'duration', 0) as number;
        const sourceId = ctx.evaluateInput(node.id, 'sourceId', '') as string;

        const container = ctx.getEffectContainer();
        if (!container || !effectTypeId) {
            return {
                outputs: { success: false, instanceId: '' },
                nextExec: 'exec'
            };
        }

        // Create a basic effect definition
        const definition: IEffectDefinition = {
            typeId: effectTypeId,
            displayName: effectTypeId,
            tags: [],
            duration: duration > 0
                ? { type: 'timed', duration, remainingTime: duration }
                : { type: 'permanent' },
            stacking: { rule: 'refresh' }
        };

        const instance = container.apply(definition, sourceId || undefined);

        return {
            outputs: {
                success: instance !== null,
                instanceId: instance?.instanceId ?? ''
            },
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// RemoveEffect 节点 | RemoveEffect Node
// =============================================================================

export const RemoveEffectTemplate: BlueprintNodeTemplate = {
    type: 'RemoveEffect',
    title: 'Remove Effect',
    category: 'custom',
    description: 'Remove effect from target / 从目标移除效果',
    keywords: ['effect', 'remove', 'clear', 'dispel'],
    menuPath: ['Effect', 'Remove Effect'],
    inputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'effectTypeId', displayName: 'Effect Type', type: 'string' }
    ],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'removed', displayName: 'Removed', type: 'int' }
    ],
    color: '#e91e63'
};

export class RemoveEffectExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as EffectContext;
        const effectTypeId = ctx.evaluateInput(node.id, 'effectTypeId', '') as string;

        const container = ctx.getEffectContainer();
        if (!container || !effectTypeId) {
            return { outputs: { removed: 0 }, nextExec: 'exec' };
        }

        const removed = container.removeByType(effectTypeId);

        return { outputs: { removed }, nextExec: 'exec' };
    }
}

// =============================================================================
// RemoveEffectByTag 节点 | RemoveEffectByTag Node
// =============================================================================

export const RemoveEffectByTagTemplate: BlueprintNodeTemplate = {
    type: 'RemoveEffectByTag',
    title: 'Remove Effect By Tag',
    category: 'custom',
    description: 'Remove effects with specific tag / 移除带有指定标签的效果',
    keywords: ['effect', 'remove', 'tag', 'dispel'],
    menuPath: ['Effect', 'Remove Effect By Tag'],
    inputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'tag', displayName: 'Tag', type: 'string' }
    ],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'removed', displayName: 'Removed', type: 'int' }
    ],
    color: '#e91e63'
};

export class RemoveEffectByTagExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as EffectContext;
        const tag = ctx.evaluateInput(node.id, 'tag', '') as string;

        const container = ctx.getEffectContainer();
        if (!container || !tag) {
            return { outputs: { removed: 0 }, nextExec: 'exec' };
        }

        const removed = container.removeByTag(tag);

        return { outputs: { removed }, nextExec: 'exec' };
    }
}

// =============================================================================
// HasEffect 节点 | HasEffect Node
// =============================================================================

export const HasEffectTemplate: BlueprintNodeTemplate = {
    type: 'HasEffect',
    title: 'Has Effect',
    category: 'custom',
    description: 'Check if target has effect / 检查目标是否有效果',
    keywords: ['effect', 'check', 'has', 'status'],
    menuPath: ['Effect', 'Has Effect'],
    isPure: true,
    inputs: [
        { name: 'effectTypeId', displayName: 'Effect Type', type: 'string' }
    ],
    outputs: [
        { name: 'hasEffect', displayName: 'Has Effect', type: 'bool' }
    ],
    color: '#e91e63'
};

export class HasEffectExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as EffectContext;
        const effectTypeId = ctx.evaluateInput(node.id, 'effectTypeId', '') as string;

        const container = ctx.getEffectContainer();
        if (!container || !effectTypeId) {
            return { outputs: { hasEffect: false } };
        }

        const hasEffect = container.hasType(effectTypeId);

        return { outputs: { hasEffect } };
    }
}

// =============================================================================
// HasEffectTag 节点 | HasEffectTag Node
// =============================================================================

export const HasEffectTagTemplate: BlueprintNodeTemplate = {
    type: 'HasEffectTag',
    title: 'Has Effect Tag',
    category: 'custom',
    description: 'Check if target has effect with tag / 检查目标是否有带标签的效果',
    keywords: ['effect', 'check', 'tag', 'status'],
    menuPath: ['Effect', 'Has Effect Tag'],
    isPure: true,
    inputs: [
        { name: 'tag', displayName: 'Tag', type: 'string' }
    ],
    outputs: [
        { name: 'hasTag', displayName: 'Has Tag', type: 'bool' }
    ],
    color: '#e91e63'
};

export class HasEffectTagExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as EffectContext;
        const tag = ctx.evaluateInput(node.id, 'tag', '') as string;

        const container = ctx.getEffectContainer();
        if (!container || !tag) {
            return { outputs: { hasTag: false } };
        }

        const hasTag = container.hasTag(tag);

        return { outputs: { hasTag } };
    }
}

// =============================================================================
// GetEffectStacks 节点 | GetEffectStacks Node
// =============================================================================

export const GetEffectStacksTemplate: BlueprintNodeTemplate = {
    type: 'GetEffectStacks',
    title: 'Get Effect Stacks',
    category: 'custom',
    description: 'Get effect stack count / 获取效果叠加层数',
    keywords: ['effect', 'stacks', 'count', 'layers'],
    menuPath: ['Effect', 'Get Effect Stacks'],
    isPure: true,
    inputs: [
        { name: 'effectTypeId', displayName: 'Effect Type', type: 'string' }
    ],
    outputs: [
        { name: 'stacks', displayName: 'Stacks', type: 'int' }
    ],
    color: '#e91e63'
};

export class GetEffectStacksExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as EffectContext;
        const effectTypeId = ctx.evaluateInput(node.id, 'effectTypeId', '') as string;

        const container = ctx.getEffectContainer();
        if (!container || !effectTypeId) {
            return { outputs: { stacks: 0 } };
        }

        const stacks = container.getStacks(effectTypeId);

        return { outputs: { stacks } };
    }
}

// =============================================================================
// GetEffectRemainingTime 节点 | GetEffectRemainingTime Node
// =============================================================================

export const GetEffectRemainingTimeTemplate: BlueprintNodeTemplate = {
    type: 'GetEffectRemainingTime',
    title: 'Get Effect Remaining Time',
    category: 'custom',
    description: 'Get remaining time of effect / 获取效果剩余时间',
    keywords: ['effect', 'time', 'remaining', 'duration'],
    menuPath: ['Effect', 'Get Effect Remaining Time'],
    isPure: true,
    inputs: [
        { name: 'effectTypeId', displayName: 'Effect Type', type: 'string' }
    ],
    outputs: [
        { name: 'remainingTime', displayName: 'Remaining Time', type: 'float' },
        { name: 'hasEffect', displayName: 'Has Effect', type: 'bool' }
    ],
    color: '#e91e63'
};

export class GetEffectRemainingTimeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as EffectContext;
        const effectTypeId = ctx.evaluateInput(node.id, 'effectTypeId', '') as string;

        const container = ctx.getEffectContainer();
        if (!container || !effectTypeId) {
            return { outputs: { remainingTime: 0, hasEffect: false } };
        }

        const effects = container.getByType(effectTypeId);
        if (effects.length === 0) {
            return { outputs: { remainingTime: 0, hasEffect: false } };
        }

        // Return max remaining time among all instances
        const remainingTime = Math.max(...effects.map(e => e.remainingTime));

        return { outputs: { remainingTime, hasEffect: true } };
    }
}

// =============================================================================
// GetEffectCount 节点 | GetEffectCount Node
// =============================================================================

export const GetEffectCountTemplate: BlueprintNodeTemplate = {
    type: 'GetEffectCount',
    title: 'Get Effect Count',
    category: 'custom',
    description: 'Get total effect count / 获取效果总数',
    keywords: ['effect', 'count', 'total'],
    menuPath: ['Effect', 'Get Effect Count'],
    isPure: true,
    inputs: [],
    outputs: [
        { name: 'count', displayName: 'Count', type: 'int' }
    ],
    color: '#e91e63'
};

export class GetEffectCountExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as EffectContext;
        const container = ctx.getEffectContainer();

        return { outputs: { count: container?.count ?? 0 } };
    }
}

// =============================================================================
// ClearAllEffects 节点 | ClearAllEffects Node
// =============================================================================

export const ClearAllEffectsTemplate: BlueprintNodeTemplate = {
    type: 'ClearAllEffects',
    title: 'Clear All Effects',
    category: 'custom',
    description: 'Remove all effects from target / 移除目标所有效果',
    keywords: ['effect', 'clear', 'remove', 'all'],
    menuPath: ['Effect', 'Clear All Effects'],
    inputs: [
        { name: 'exec', displayName: '', type: 'exec' }
    ],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' }
    ],
    color: '#e91e63'
};

export class ClearAllEffectsExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as EffectContext;
        const container = ctx.getEffectContainer();
        container?.removeAll();

        return { nextExec: 'exec' };
    }
}

// =============================================================================
// OnEffectApplied 事件节点 | OnEffectApplied Event Node
// =============================================================================

export const OnEffectAppliedTemplate: BlueprintNodeTemplate = {
    type: 'OnEffectApplied',
    title: 'On Effect Applied',
    category: 'event',
    description: 'Triggered when effect is applied / 效果应用时触发',
    keywords: ['effect', 'event', 'applied', 'add'],
    menuPath: ['Effect', 'Events', 'On Effect Applied'],
    inputs: [],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'effectTypeId', displayName: 'Effect Type', type: 'string' },
        { name: 'instanceId', displayName: 'Instance ID', type: 'string' },
        { name: 'stacks', displayName: 'Stacks', type: 'int' }
    ],
    color: '#ff5722'
};

export class OnEffectAppliedExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        return { nextExec: 'exec' };
    }
}

// =============================================================================
// OnEffectRemoved 事件节点 | OnEffectRemoved Event Node
// =============================================================================

export const OnEffectRemovedTemplate: BlueprintNodeTemplate = {
    type: 'OnEffectRemoved',
    title: 'On Effect Removed',
    category: 'event',
    description: 'Triggered when effect is removed / 效果移除时触发',
    keywords: ['effect', 'event', 'removed', 'expire'],
    menuPath: ['Effect', 'Events', 'On Effect Removed'],
    inputs: [],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'effectTypeId', displayName: 'Effect Type', type: 'string' },
        { name: 'instanceId', displayName: 'Instance ID', type: 'string' }
    ],
    color: '#ff5722'
};

export class OnEffectRemovedExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        return { nextExec: 'exec' };
    }
}

// =============================================================================
// OnEffectTick 事件节点 | OnEffectTick Event Node
// =============================================================================

export const OnEffectTickTemplate: BlueprintNodeTemplate = {
    type: 'OnEffectTick',
    title: 'On Effect Tick',
    category: 'event',
    description: 'Triggered on effect periodic tick / 效果周期触发时调用',
    keywords: ['effect', 'event', 'tick', 'periodic'],
    menuPath: ['Effect', 'Events', 'On Effect Tick'],
    inputs: [],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'effectTypeId', displayName: 'Effect Type', type: 'string' },
        { name: 'instanceId', displayName: 'Instance ID', type: 'string' },
        { name: 'stacks', displayName: 'Stacks', type: 'int' }
    ],
    color: '#ff5722'
};

export class OnEffectTickExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        return { nextExec: 'exec' };
    }
}

// =============================================================================
// 节点定义集合 | Node Definition Collection
// =============================================================================

export const EffectNodeDefinitions = {
    templates: [
        ApplyEffectTemplate,
        RemoveEffectTemplate,
        RemoveEffectByTagTemplate,
        HasEffectTemplate,
        HasEffectTagTemplate,
        GetEffectStacksTemplate,
        GetEffectRemainingTimeTemplate,
        GetEffectCountTemplate,
        ClearAllEffectsTemplate,
        OnEffectAppliedTemplate,
        OnEffectRemovedTemplate,
        OnEffectTickTemplate
    ],
    executors: new Map<string, INodeExecutor>([
        ['ApplyEffect', new ApplyEffectExecutor()],
        ['RemoveEffect', new RemoveEffectExecutor()],
        ['RemoveEffectByTag', new RemoveEffectByTagExecutor()],
        ['HasEffect', new HasEffectExecutor()],
        ['HasEffectTag', new HasEffectTagExecutor()],
        ['GetEffectStacks', new GetEffectStacksExecutor()],
        ['GetEffectRemainingTime', new GetEffectRemainingTimeExecutor()],
        ['GetEffectCount', new GetEffectCountExecutor()],
        ['ClearAllEffects', new ClearAllEffectsExecutor()],
        ['OnEffectApplied', new OnEffectAppliedExecutor()],
        ['OnEffectRemoved', new OnEffectRemovedExecutor()],
        ['OnEffectTick', new OnEffectTickExecutor()]
    ])
};
