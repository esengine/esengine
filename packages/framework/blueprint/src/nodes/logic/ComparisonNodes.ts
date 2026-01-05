/**
 * @zh 比较运算节点
 * @en Comparison Operation Nodes
 */

import { BlueprintNodeTemplate, BlueprintNode } from '../../types/nodes';
import { ExecutionContext, ExecutionResult } from '../../runtime/ExecutionContext';
import { INodeExecutor, RegisterNode } from '../../runtime/NodeRegistry';

// ============================================================================
// Equal Node (等于节点)
// ============================================================================

export const EqualTemplate: BlueprintNodeTemplate = {
    type: 'Equal',
    title: 'Equal',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns true if A equals B (如果 A 等于 B 则返回 true)',
    keywords: ['equal', '==', 'same', 'compare', 'logic'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'any', displayName: 'A' },
        { name: 'b', type: 'any', displayName: 'B' }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Result' }
    ]
};

@RegisterNode(EqualTemplate)
export class EqualExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = context.evaluateInput(node.id, 'a', null);
        const b = context.evaluateInput(node.id, 'b', null);
        return { outputs: { result: a === b } };
    }
}

// ============================================================================
// Not Equal Node (不等于节点)
// ============================================================================

export const NotEqualTemplate: BlueprintNodeTemplate = {
    type: 'NotEqual',
    title: 'Not Equal',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns true if A does not equal B (如果 A 不等于 B 则返回 true)',
    keywords: ['not', 'equal', '!=', 'different', 'compare', 'logic'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'any', displayName: 'A' },
        { name: 'b', type: 'any', displayName: 'B' }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Result' }
    ]
};

@RegisterNode(NotEqualTemplate)
export class NotEqualExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = context.evaluateInput(node.id, 'a', null);
        const b = context.evaluateInput(node.id, 'b', null);
        return { outputs: { result: a !== b } };
    }
}

// ============================================================================
// Greater Than Node (大于节点)
// ============================================================================

export const GreaterThanTemplate: BlueprintNodeTemplate = {
    type: 'GreaterThan',
    title: 'Greater Than',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns true if A is greater than B (如果 A 大于 B 则返回 true)',
    keywords: ['greater', 'than', '>', 'compare', 'logic'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Result' }
    ]
};

@RegisterNode(GreaterThanTemplate)
export class GreaterThanExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 0));
        return { outputs: { result: a > b } };
    }
}

// ============================================================================
// Greater Than Or Equal Node (大于等于节点)
// ============================================================================

export const GreaterThanOrEqualTemplate: BlueprintNodeTemplate = {
    type: 'GreaterThanOrEqual',
    title: 'Greater Or Equal',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns true if A is greater than or equal to B (如果 A 大于等于 B 则返回 true)',
    keywords: ['greater', 'equal', '>=', 'compare', 'logic'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Result' }
    ]
};

@RegisterNode(GreaterThanOrEqualTemplate)
export class GreaterThanOrEqualExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 0));
        return { outputs: { result: a >= b } };
    }
}

// ============================================================================
// Less Than Node (小于节点)
// ============================================================================

export const LessThanTemplate: BlueprintNodeTemplate = {
    type: 'LessThan',
    title: 'Less Than',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns true if A is less than B (如果 A 小于 B 则返回 true)',
    keywords: ['less', 'than', '<', 'compare', 'logic'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Result' }
    ]
};

@RegisterNode(LessThanTemplate)
export class LessThanExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 0));
        return { outputs: { result: a < b } };
    }
}

// ============================================================================
// Less Than Or Equal Node (小于等于节点)
// ============================================================================

export const LessThanOrEqualTemplate: BlueprintNodeTemplate = {
    type: 'LessThanOrEqual',
    title: 'Less Or Equal',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns true if A is less than or equal to B (如果 A 小于等于 B 则返回 true)',
    keywords: ['less', 'equal', '<=', 'compare', 'logic'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Result' }
    ]
};

@RegisterNode(LessThanOrEqualTemplate)
export class LessThanOrEqualExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 0));
        return { outputs: { result: a <= b } };
    }
}

// ============================================================================
// And Node (逻辑与节点)
// ============================================================================

export const AndTemplate: BlueprintNodeTemplate = {
    type: 'And',
    title: 'AND',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns true if both A and B are true (如果 A 和 B 都为 true 则返回 true)',
    keywords: ['and', '&&', 'both', 'logic'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'bool', displayName: 'A', defaultValue: false },
        { name: 'b', type: 'bool', displayName: 'B', defaultValue: false }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Result' }
    ]
};

@RegisterNode(AndTemplate)
export class AndExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Boolean(context.evaluateInput(node.id, 'a', false));
        const b = Boolean(context.evaluateInput(node.id, 'b', false));
        return { outputs: { result: a && b } };
    }
}

// ============================================================================
// Or Node (逻辑或节点)
// ============================================================================

export const OrTemplate: BlueprintNodeTemplate = {
    type: 'Or',
    title: 'OR',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns true if either A or B is true (如果 A 或 B 为 true 则返回 true)',
    keywords: ['or', '||', 'either', 'logic'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'bool', displayName: 'A', defaultValue: false },
        { name: 'b', type: 'bool', displayName: 'B', defaultValue: false }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Result' }
    ]
};

@RegisterNode(OrTemplate)
export class OrExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Boolean(context.evaluateInput(node.id, 'a', false));
        const b = Boolean(context.evaluateInput(node.id, 'b', false));
        return { outputs: { result: a || b } };
    }
}

// ============================================================================
// Not Node (逻辑非节点)
// ============================================================================

export const NotTemplate: BlueprintNodeTemplate = {
    type: 'Not',
    title: 'NOT',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns the opposite boolean value (返回相反的布尔值)',
    keywords: ['not', '!', 'negate', 'invert', 'logic'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'bool', displayName: 'Value', defaultValue: false }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Result' }
    ]
};

@RegisterNode(NotTemplate)
export class NotExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Boolean(context.evaluateInput(node.id, 'value', false));
        return { outputs: { result: !value } };
    }
}

// ============================================================================
// XOR Node (异或节点)
// ============================================================================

export const XorTemplate: BlueprintNodeTemplate = {
    type: 'Xor',
    title: 'XOR',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns true if exactly one of A or B is true (如果 A 和 B 中恰好有一个为 true 则返回 true)',
    keywords: ['xor', 'exclusive', 'or', 'logic'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'bool', displayName: 'A', defaultValue: false },
        { name: 'b', type: 'bool', displayName: 'B', defaultValue: false }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Result' }
    ]
};

@RegisterNode(XorTemplate)
export class XorExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Boolean(context.evaluateInput(node.id, 'a', false));
        const b = Boolean(context.evaluateInput(node.id, 'b', false));
        return { outputs: { result: (a || b) && !(a && b) } };
    }
}

// ============================================================================
// NAND Node (与非节点)
// ============================================================================

export const NandTemplate: BlueprintNodeTemplate = {
    type: 'Nand',
    title: 'NAND',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns true if not both A and B are true (如果 A 和 B 不都为 true 则返回 true)',
    keywords: ['nand', 'not', 'and', 'logic'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'bool', displayName: 'A', defaultValue: false },
        { name: 'b', type: 'bool', displayName: 'B', defaultValue: false }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Result' }
    ]
};

@RegisterNode(NandTemplate)
export class NandExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Boolean(context.evaluateInput(node.id, 'a', false));
        const b = Boolean(context.evaluateInput(node.id, 'b', false));
        return { outputs: { result: !(a && b) } };
    }
}

// ============================================================================
// In Range Node (范围检查节点)
// ============================================================================

export const InRangeTemplate: BlueprintNodeTemplate = {
    type: 'InRange',
    title: 'In Range',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns true if value is between min and max (如果值在 min 和 max 之间则返回 true)',
    keywords: ['range', 'between', 'check', 'logic'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 0 },
        { name: 'min', type: 'float', displayName: 'Min', defaultValue: 0 },
        { name: 'max', type: 'float', displayName: 'Max', defaultValue: 1 },
        { name: 'inclusive', type: 'bool', displayName: 'Inclusive', defaultValue: true }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Result' }
    ]
};

@RegisterNode(InRangeTemplate)
export class InRangeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 0));
        const min = Number(context.evaluateInput(node.id, 'min', 0));
        const max = Number(context.evaluateInput(node.id, 'max', 1));
        const inclusive = Boolean(context.evaluateInput(node.id, 'inclusive', true));

        const result = inclusive
            ? value >= min && value <= max
            : value > min && value < max;

        return { outputs: { result } };
    }
}

// ============================================================================
// Is Null Node (空值检查节点)
// ============================================================================

export const IsNullTemplate: BlueprintNodeTemplate = {
    type: 'IsNull',
    title: 'Is Null',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns true if the value is null or undefined (如果值为 null 或 undefined 则返回 true)',
    keywords: ['null', 'undefined', 'empty', 'check', 'logic'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'any', displayName: 'Value' }
    ],
    outputs: [
        { name: 'result', type: 'bool', displayName: 'Is Null' }
    ]
};

@RegisterNode(IsNullTemplate)
export class IsNullExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = context.evaluateInput(node.id, 'value', null);
        return { outputs: { result: value == null } };
    }
}

// ============================================================================
// Select Node (选择节点)
// ============================================================================

export const SelectTemplate: BlueprintNodeTemplate = {
    type: 'Select',
    title: 'Select',
    category: 'logic',
    color: '#9C27B0',
    description: 'Returns A if condition is true, otherwise returns B (如果条件为 true 返回 A，否则返回 B)',
    keywords: ['select', 'choose', 'ternary', '?:', 'logic'],
    isPure: true,
    inputs: [
        { name: 'condition', type: 'bool', displayName: 'Condition', defaultValue: false },
        { name: 'a', type: 'any', displayName: 'A (True)' },
        { name: 'b', type: 'any', displayName: 'B (False)' }
    ],
    outputs: [
        { name: 'result', type: 'any', displayName: 'Result' }
    ]
};

@RegisterNode(SelectTemplate)
export class SelectExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const condition = Boolean(context.evaluateInput(node.id, 'condition', false));
        const a = context.evaluateInput(node.id, 'a', null);
        const b = context.evaluateInput(node.id, 'b', null);
        return { outputs: { result: condition ? a : b } };
    }
}
