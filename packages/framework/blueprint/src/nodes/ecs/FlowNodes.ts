/**
 * @zh 流程控制节点
 * @en Flow Control Nodes
 *
 * @zh 提供蓝图中的流程控制支持（分支、循环等）
 * @en Provides flow control in blueprint (branch, loop, etc.)
 */

import { BlueprintNodeTemplate, BlueprintNode } from '../../types/nodes';
import { ExecutionContext, ExecutionResult } from '../../runtime/ExecutionContext';
import { INodeExecutor, RegisterNode } from '../../runtime/NodeRegistry';

// ============================================================================
// Branch | 分支
// ============================================================================

export const BranchTemplate: BlueprintNodeTemplate = {
    type: 'Flow_Branch',
    title: 'Branch',
    category: 'flow',
    color: '#4a4a4a',
    description: 'Executes one of two paths based on a condition (根据条件执行两条路径之一)',
    keywords: ['if', 'branch', 'condition', 'switch', 'else'],
    menuPath: ['Flow', 'Branch'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'condition', type: 'bool', displayName: 'Condition', defaultValue: false }
    ],
    outputs: [
        { name: 'true', type: 'exec', displayName: 'True' },
        { name: 'false', type: 'exec', displayName: 'False' }
    ]
};

@RegisterNode(BranchTemplate)
export class BranchExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const condition = context.evaluateInput(node.id, 'condition', false) as boolean;
        return { nextExec: condition ? 'true' : 'false' };
    }
}

// ============================================================================
// Sequence | 序列
// ============================================================================

export const SequenceTemplate: BlueprintNodeTemplate = {
    type: 'Flow_Sequence',
    title: 'Sequence',
    category: 'flow',
    color: '#4a4a4a',
    description: 'Executes multiple outputs in order (按顺序执行多个输出)',
    keywords: ['sequence', 'order', 'serial', 'chain'],
    menuPath: ['Flow', 'Sequence'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' }
    ],
    outputs: [
        { name: 'then0', type: 'exec', displayName: 'Then 0' },
        { name: 'then1', type: 'exec', displayName: 'Then 1' },
        { name: 'then2', type: 'exec', displayName: 'Then 2' },
        { name: 'then3', type: 'exec', displayName: 'Then 3' }
    ]
};

@RegisterNode(SequenceTemplate)
export class SequenceExecutor implements INodeExecutor {
    private currentIndex = 0;

    execute(_node: BlueprintNode, _context: ExecutionContext): ExecutionResult {
        const outputs = ['then0', 'then1', 'then2', 'then3'];
        const nextPin = outputs[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % outputs.length;

        if (this.currentIndex === 0) {
            return { nextExec: null };
        }

        return { nextExec: nextPin };
    }
}

// ============================================================================
// Do Once | 只执行一次
// ============================================================================

export const DoOnceTemplate: BlueprintNodeTemplate = {
    type: 'Flow_DoOnce',
    title: 'Do Once',
    category: 'flow',
    color: '#4a4a4a',
    description: 'Executes the output only once, subsequent calls are ignored (只执行一次，后续调用被忽略)',
    keywords: ['once', 'single', 'first', 'one'],
    menuPath: ['Flow', 'Do Once'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'reset', type: 'exec', displayName: 'Reset' }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: '' }
    ]
};

@RegisterNode(DoOnceTemplate)
export class DoOnceExecutor implements INodeExecutor {
    private executed = false;

    execute(node: BlueprintNode, _context: ExecutionContext): ExecutionResult {
        const inputPin = node.data._lastInputPin as string | undefined;

        if (inputPin === 'reset') {
            this.executed = false;
            return { nextExec: null };
        }

        if (this.executed) {
            return { nextExec: null };
        }

        this.executed = true;
        return { nextExec: 'exec' };
    }
}

// ============================================================================
// Flip Flop | 触发器
// ============================================================================

export const FlipFlopTemplate: BlueprintNodeTemplate = {
    type: 'Flow_FlipFlop',
    title: 'Flip Flop',
    category: 'flow',
    color: '#4a4a4a',
    description: 'Alternates between two outputs on each execution (每次执行时在两个输出之间交替)',
    keywords: ['flip', 'flop', 'toggle', 'alternate', 'switch'],
    menuPath: ['Flow', 'Flip Flop'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' }
    ],
    outputs: [
        { name: 'a', type: 'exec', displayName: 'A' },
        { name: 'b', type: 'exec', displayName: 'B' },
        { name: 'isA', type: 'bool', displayName: 'Is A' }
    ]
};

@RegisterNode(FlipFlopTemplate)
export class FlipFlopExecutor implements INodeExecutor {
    private isA = true;

    execute(_node: BlueprintNode, _context: ExecutionContext): ExecutionResult {
        const currentIsA = this.isA;
        this.isA = !this.isA;

        return {
            outputs: { isA: currentIsA },
            nextExec: currentIsA ? 'a' : 'b'
        };
    }
}

// ============================================================================
// Gate | 门
// ============================================================================

export const GateTemplate: BlueprintNodeTemplate = {
    type: 'Flow_Gate',
    title: 'Gate',
    category: 'flow',
    color: '#4a4a4a',
    description: 'Controls execution flow with open/close state (通过开/关状态控制执行流)',
    keywords: ['gate', 'open', 'close', 'block', 'allow'],
    menuPath: ['Flow', 'Gate'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: 'Enter' },
        { name: 'open', type: 'exec', displayName: 'Open' },
        { name: 'close', type: 'exec', displayName: 'Close' },
        { name: 'toggle', type: 'exec', displayName: 'Toggle' },
        { name: 'startOpen', type: 'bool', displayName: 'Start Open', defaultValue: true }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: 'Exit' }
    ]
};

@RegisterNode(GateTemplate)
export class GateExecutor implements INodeExecutor {
    private isOpen: boolean | null = null;

    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        if (this.isOpen === null) {
            this.isOpen = context.evaluateInput(node.id, 'startOpen', true) as boolean;
        }

        const inputPin = node.data._lastInputPin as string | undefined;

        switch (inputPin) {
            case 'open':
                this.isOpen = true;
                return { nextExec: null };
            case 'close':
                this.isOpen = false;
                return { nextExec: null };
            case 'toggle':
                this.isOpen = !this.isOpen;
                return { nextExec: null };
            default:
                return { nextExec: this.isOpen ? 'exec' : null };
        }
    }
}

// ============================================================================
// For Loop | For 循环
// ============================================================================

export const ForLoopTemplate: BlueprintNodeTemplate = {
    type: 'Flow_ForLoop',
    title: 'For Loop',
    category: 'flow',
    color: '#4a4a4a',
    description: 'Executes the loop body for each index in range (对范围内的每个索引执行循环体)',
    keywords: ['for', 'loop', 'iterate', 'repeat', 'count'],
    menuPath: ['Flow', 'For Loop'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'start', type: 'int', displayName: 'Start', defaultValue: 0 },
        { name: 'end', type: 'int', displayName: 'End', defaultValue: 10 }
    ],
    outputs: [
        { name: 'loopBody', type: 'exec', displayName: 'Loop Body' },
        { name: 'completed', type: 'exec', displayName: 'Completed' },
        { name: 'index', type: 'int', displayName: 'Index' }
    ]
};

@RegisterNode(ForLoopTemplate)
export class ForLoopExecutor implements INodeExecutor {
    private currentIndex = 0;
    private endIndex = 0;
    private isRunning = false;

    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        if (!this.isRunning) {
            this.currentIndex = context.evaluateInput(node.id, 'start', 0) as number;
            this.endIndex = context.evaluateInput(node.id, 'end', 10) as number;
            this.isRunning = true;
        }

        if (this.currentIndex < this.endIndex) {
            const index = this.currentIndex;
            this.currentIndex++;

            return {
                outputs: { index },
                nextExec: 'loopBody'
            };
        }

        this.isRunning = false;
        return {
            outputs: { index: this.endIndex },
            nextExec: 'completed'
        };
    }
}

// ============================================================================
// While Loop | While 循环
// ============================================================================

export const WhileLoopTemplate: BlueprintNodeTemplate = {
    type: 'Flow_WhileLoop',
    title: 'While Loop',
    category: 'flow',
    color: '#4a4a4a',
    description: 'Executes the loop body while condition is true (当条件为真时执行循环体)',
    keywords: ['while', 'loop', 'repeat', 'condition'],
    menuPath: ['Flow', 'While Loop'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'condition', type: 'bool', displayName: 'Condition', defaultValue: true }
    ],
    outputs: [
        { name: 'loopBody', type: 'exec', displayName: 'Loop Body' },
        { name: 'completed', type: 'exec', displayName: 'Completed' }
    ]
};

@RegisterNode(WhileLoopTemplate)
export class WhileLoopExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const condition = context.evaluateInput(node.id, 'condition', true) as boolean;

        if (condition) {
            return { nextExec: 'loopBody' };
        }

        return { nextExec: 'completed' };
    }
}
