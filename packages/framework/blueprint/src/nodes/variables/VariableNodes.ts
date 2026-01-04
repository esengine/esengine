/**
 * @zh 变量节点 - 读取和设置蓝图变量
 * @en Variable Nodes - Get and set blueprint variables
 */

import { BlueprintNodeTemplate, BlueprintNode } from '../../types/nodes';
import { ExecutionContext, ExecutionResult } from '../../runtime/ExecutionContext';
import { INodeExecutor, RegisterNode } from '../../runtime/NodeRegistry';

// ============================================================================
// Get Variable | 获取变量
// ============================================================================

export const GetVariableTemplate: BlueprintNodeTemplate = {
    type: 'GetVariable',
    title: 'Get Variable',
    category: 'variable',
    color: '#4a9c6d',
    isPure: true,
    description: 'Gets the value of a variable (获取变量的值)',
    keywords: ['variable', 'get', 'read', 'value'],
    menuPath: ['Variable', 'Get Variable'],
    inputs: [
        { name: 'variableName', type: 'string', displayName: 'Variable Name', defaultValue: '' }
    ],
    outputs: [
        { name: 'value', type: 'any', displayName: 'Value' }
    ]
};

@RegisterNode(GetVariableTemplate)
export class GetVariableExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const variableName = context.evaluateInput(node.id, 'variableName', '') as string;

        if (!variableName) {
            return { outputs: { value: null } };
        }

        const value = context.getVariable(variableName);
        return { outputs: { value } };
    }
}

// ============================================================================
// Set Variable | 设置变量
// ============================================================================

export const SetVariableTemplate: BlueprintNodeTemplate = {
    type: 'SetVariable',
    title: 'Set Variable',
    category: 'variable',
    color: '#4a9c6d',
    description: 'Sets the value of a variable (设置变量的值)',
    keywords: ['variable', 'set', 'write', 'assign', 'value'],
    menuPath: ['Variable', 'Set Variable'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'variableName', type: 'string', displayName: 'Variable Name', defaultValue: '' },
        { name: 'value', type: 'any', displayName: 'Value' }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'value', type: 'any', displayName: 'Value' }
    ]
};

@RegisterNode(SetVariableTemplate)
export class SetVariableExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const variableName = context.evaluateInput(node.id, 'variableName', '') as string;
        const value = context.evaluateInput(node.id, 'value', null);

        if (!variableName) {
            return { outputs: { value: null }, nextExec: 'exec' };
        }

        context.setVariable(variableName, value);
        return { outputs: { value }, nextExec: 'exec' };
    }
}

// ============================================================================
// Get Variable By Name (typed variants) | 按名称获取变量（类型变体）
// ============================================================================

export const GetBoolVariableTemplate: BlueprintNodeTemplate = {
    type: 'GetBoolVariable',
    title: 'Get Bool',
    category: 'variable',
    color: '#8b1e3f',
    isPure: true,
    description: 'Gets a boolean variable (获取布尔变量)',
    keywords: ['variable', 'get', 'bool', 'boolean'],
    menuPath: ['Variable', 'Get Bool'],
    inputs: [
        { name: 'variableName', type: 'string', displayName: 'Variable Name', defaultValue: '' }
    ],
    outputs: [
        { name: 'value', type: 'bool', displayName: 'Value' }
    ]
};

@RegisterNode(GetBoolVariableTemplate)
export class GetBoolVariableExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const variableName = context.evaluateInput(node.id, 'variableName', '') as string;
        const value = context.getVariable(variableName);
        return { outputs: { value: Boolean(value) } };
    }
}

export const GetFloatVariableTemplate: BlueprintNodeTemplate = {
    type: 'GetFloatVariable',
    title: 'Get Float',
    category: 'variable',
    color: '#39c5bb',
    isPure: true,
    description: 'Gets a float variable (获取浮点变量)',
    keywords: ['variable', 'get', 'float', 'number'],
    menuPath: ['Variable', 'Get Float'],
    inputs: [
        { name: 'variableName', type: 'string', displayName: 'Variable Name', defaultValue: '' }
    ],
    outputs: [
        { name: 'value', type: 'float', displayName: 'Value' }
    ]
};

@RegisterNode(GetFloatVariableTemplate)
export class GetFloatVariableExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const variableName = context.evaluateInput(node.id, 'variableName', '') as string;
        const value = context.getVariable(variableName);
        return { outputs: { value: Number(value) || 0 } };
    }
}

export const GetIntVariableTemplate: BlueprintNodeTemplate = {
    type: 'GetIntVariable',
    title: 'Get Int',
    category: 'variable',
    color: '#1c8b8b',
    isPure: true,
    description: 'Gets an integer variable (获取整数变量)',
    keywords: ['variable', 'get', 'int', 'integer', 'number'],
    menuPath: ['Variable', 'Get Int'],
    inputs: [
        { name: 'variableName', type: 'string', displayName: 'Variable Name', defaultValue: '' }
    ],
    outputs: [
        { name: 'value', type: 'int', displayName: 'Value' }
    ]
};

@RegisterNode(GetIntVariableTemplate)
export class GetIntVariableExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const variableName = context.evaluateInput(node.id, 'variableName', '') as string;
        const value = context.getVariable(variableName);
        return { outputs: { value: Math.floor(Number(value) || 0) } };
    }
}

export const GetStringVariableTemplate: BlueprintNodeTemplate = {
    type: 'GetStringVariable',
    title: 'Get String',
    category: 'variable',
    color: '#e91e8c',
    isPure: true,
    description: 'Gets a string variable (获取字符串变量)',
    keywords: ['variable', 'get', 'string', 'text'],
    menuPath: ['Variable', 'Get String'],
    inputs: [
        { name: 'variableName', type: 'string', displayName: 'Variable Name', defaultValue: '' }
    ],
    outputs: [
        { name: 'value', type: 'string', displayName: 'Value' }
    ]
};

@RegisterNode(GetStringVariableTemplate)
export class GetStringVariableExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const variableName = context.evaluateInput(node.id, 'variableName', '') as string;
        const value = context.getVariable(variableName);
        return { outputs: { value: String(value ?? '') } };
    }
}
