/**
 * @zh Memory 操作节点
 * @en Memory Operation Nodes
 *
 * @zh 提供玩家持久化数据的读写能力
 * @en Provides read/write access to player persistent data
 */

import type { BlueprintNodeTemplate, BlueprintNode } from '@esengine/blueprint';
import type { INodeExecutor, ExecutionResult } from '@esengine/blueprint';

// =============================================================================
// 扩展的执行上下文接口 | Extended Execution Context Interface
// =============================================================================

/**
 * @zh 服务器端执行上下文接口（用于节点）
 * @en Server-side execution context interface (for nodes)
 */
interface ServerContext {
    memory: Record<string, unknown>;
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
    setOutputs(nodeId: string, outputs: Record<string, unknown>): void;
}

// =============================================================================
// GetMemory Node | 获取 Memory 节点
// =============================================================================

/**
 * @zh 获取 Memory 节点模板
 * @en Get Memory node template
 */
export const GetMemoryTemplate: BlueprintNodeTemplate = {
    type: 'GetMemory',
    title: 'Get Memory',
    category: 'variable',
    description: 'Get a value from player Memory / 从玩家 Memory 获取值',
    keywords: ['memory', 'get', 'read', 'load', 'data'],
    menuPath: ['Memory', 'Get Memory'],
    isPure: true,
    inputs: [
        {
            name: 'key',
            displayName: 'Key',
            type: 'string',
            defaultValue: ''
        },
        {
            name: 'defaultValue',
            displayName: 'Default',
            type: 'any',
            defaultValue: null
        }
    ],
    outputs: [
        {
            name: 'value',
            displayName: 'Value',
            type: 'any'
        }
    ],
    color: '#8b5a8b'
};

/**
 * @zh 获取 Memory 节点执行器
 * @en Get Memory node executor
 */
export class GetMemoryExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ServerContext;
        const key = ctx.evaluateInput(node.id, 'key', '') as string;
        const defaultValue = ctx.evaluateInput(node.id, 'defaultValue', null);

        const value = ctx.memory[key] ?? defaultValue;

        return {
            outputs: { value }
        };
    }
}

// =============================================================================
// SetMemory Node | 设置 Memory 节点
// =============================================================================

/**
 * @zh 设置 Memory 节点模板
 * @en Set Memory node template
 */
export const SetMemoryTemplate: BlueprintNodeTemplate = {
    type: 'SetMemory',
    title: 'Set Memory',
    category: 'variable',
    description: 'Set a value in player Memory / 在玩家 Memory 中设置值',
    keywords: ['memory', 'set', 'write', 'save', 'data'],
    menuPath: ['Memory', 'Set Memory'],
    inputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'key',
            displayName: 'Key',
            type: 'string',
            defaultValue: ''
        },
        {
            name: 'value',
            displayName: 'Value',
            type: 'any',
            defaultValue: null
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
 * @zh 设置 Memory 节点执行器
 * @en Set Memory node executor
 */
export class SetMemoryExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ServerContext;
        const key = ctx.evaluateInput(node.id, 'key', '') as string;
        const value = ctx.evaluateInput(node.id, 'value', null);

        if (key) {
            ctx.memory[key] = value;
        }

        return {
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// HasMemoryKey Node | 检查 Memory 键节点
// =============================================================================

/**
 * @zh 检查 Memory 键节点模板
 * @en Has Memory Key node template
 */
export const HasMemoryKeyTemplate: BlueprintNodeTemplate = {
    type: 'HasMemoryKey',
    title: 'Has Memory Key',
    category: 'variable',
    description: 'Check if a key exists in Memory / 检查 Memory 中是否存在某个键',
    keywords: ['memory', 'has', 'exists', 'check', 'key'],
    menuPath: ['Memory', 'Has Key'],
    isPure: true,
    inputs: [
        {
            name: 'key',
            displayName: 'Key',
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
    color: '#8b5a8b'
};

/**
 * @zh 检查 Memory 键节点执行器
 * @en Has Memory Key node executor
 */
export class HasMemoryKeyExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ServerContext;
        const key = ctx.evaluateInput(node.id, 'key', '') as string;

        const exists = key in ctx.memory;

        return {
            outputs: { exists }
        };
    }
}

// =============================================================================
// DeleteMemory Node | 删除 Memory 节点
// =============================================================================

/**
 * @zh 删除 Memory 节点模板
 * @en Delete Memory node template
 */
export const DeleteMemoryTemplate: BlueprintNodeTemplate = {
    type: 'DeleteMemory',
    title: 'Delete Memory',
    category: 'variable',
    description: 'Delete a key from Memory / 从 Memory 中删除键',
    keywords: ['memory', 'delete', 'remove', 'clear', 'key'],
    menuPath: ['Memory', 'Delete'],
    inputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'key',
            displayName: 'Key',
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
 * @zh 删除 Memory 节点执行器
 * @en Delete Memory node executor
 */
export class DeleteMemoryExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ServerContext;
        const key = ctx.evaluateInput(node.id, 'key', '') as string;

        if (key) {
            delete ctx.memory[key];
        }

        return {
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// 节点定义集合 | Node Definition Collection
// =============================================================================

/**
 * @zh Memory 节点定义
 * @en Memory node definitions
 */
export const MemoryNodeDefinitions = [
    { template: GetMemoryTemplate, executor: new GetMemoryExecutor() },
    { template: SetMemoryTemplate, executor: new SetMemoryExecutor() },
    { template: HasMemoryKeyTemplate, executor: new HasMemoryKeyExecutor() },
    { template: DeleteMemoryTemplate, executor: new DeleteMemoryExecutor() }
];
