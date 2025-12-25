/**
 * @zh 日志节点
 * @en Log Nodes
 *
 * @zh 提供日志记录能力
 * @en Provides logging capabilities
 */

import type { BlueprintNodeTemplate, BlueprintNode } from '@esengine/blueprint';
import type { INodeExecutor, ExecutionResult } from '@esengine/blueprint';

// =============================================================================
// 扩展的执行上下文接口 | Extended Execution Context Interface
// =============================================================================

interface ServerContext {
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
    log: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
}

// =============================================================================
// Log Node | 日志节点
// =============================================================================

/**
 * @zh 日志节点模板
 * @en Log node template
 */
export const LogTemplate: BlueprintNodeTemplate = {
    type: 'Log',
    title: 'Log',
    category: 'debug',
    description: 'Log a message / 记录日志消息',
    keywords: ['log', 'print', 'debug', 'console'],
    menuPath: ['Debug', 'Log'],
    inputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'message',
            displayName: 'Message',
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
    color: '#5a5a5a'
};

/**
 * @zh 日志节点执行器
 * @en Log node executor
 */
export class LogExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ServerContext;
        const message = ctx.evaluateInput(node.id, 'message', '') as string;

        ctx.log(String(message));

        return {
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// Warn Node | 警告节点
// =============================================================================

/**
 * @zh 警告节点模板
 * @en Warn node template
 */
export const WarnTemplate: BlueprintNodeTemplate = {
    type: 'Warn',
    title: 'Warn',
    category: 'debug',
    description: 'Log a warning message / 记录警告消息',
    keywords: ['warn', 'warning', 'debug', 'console'],
    menuPath: ['Debug', 'Warn'],
    inputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'message',
            displayName: 'Message',
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
    color: '#8b8b1e'
};

/**
 * @zh 警告节点执行器
 * @en Warn node executor
 */
export class WarnExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ServerContext;
        const message = ctx.evaluateInput(node.id, 'message', '') as string;

        ctx.warn(String(message));

        return {
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// Error Node | 错误节点
// =============================================================================

/**
 * @zh 错误节点模板
 * @en Error node template
 */
export const ErrorTemplate: BlueprintNodeTemplate = {
    type: 'Error',
    title: 'Error',
    category: 'debug',
    description: 'Log an error message / 记录错误消息',
    keywords: ['error', 'debug', 'console'],
    menuPath: ['Debug', 'Error'],
    inputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'message',
            displayName: 'Message',
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
    color: '#8b1e1e'
};

/**
 * @zh 错误节点执行器
 * @en Error node executor
 */
export class ErrorExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ServerContext;
        const message = ctx.evaluateInput(node.id, 'message', '') as string;

        ctx.error(String(message));

        return {
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// 节点定义集合 | Node Definition Collection
// =============================================================================

/**
 * @zh 日志节点定义
 * @en Log node definitions
 */
export const LogNodeDefinitions = [
    { template: LogTemplate, executor: new LogExecutor() },
    { template: WarnTemplate, executor: new WarnExecutor() },
    { template: ErrorTemplate, executor: new ErrorExecutor() }
];
