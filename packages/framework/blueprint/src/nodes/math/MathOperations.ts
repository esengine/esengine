/**
 * Math Operation Nodes - Basic arithmetic operations
 * 数学运算节点 - 基础算术运算
 */

import { BlueprintNodeTemplate, BlueprintNode } from '../../types/nodes';
import { ExecutionContext, ExecutionResult } from '../../runtime/ExecutionContext';
import { INodeExecutor, RegisterNode } from '../../runtime/NodeRegistry';

// Add Node (加法节点)
export const AddTemplate: BlueprintNodeTemplate = {
    type: 'Add',
    title: 'Add',
    category: 'math',
    color: '#4CAF50',
    description: 'Adds two numbers together (将两个数字相加)',
    keywords: ['add', 'plus', 'sum', '+', 'math'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(AddTemplate)
export class AddExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 0));
        return { outputs: { result: a + b } };
    }
}

// Subtract Node (减法节点)
export const SubtractTemplate: BlueprintNodeTemplate = {
    type: 'Subtract',
    title: 'Subtract',
    category: 'math',
    color: '#4CAF50',
    description: 'Subtracts B from A (从 A 减去 B)',
    keywords: ['subtract', 'minus', '-', 'math'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(SubtractTemplate)
export class SubtractExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 0));
        return { outputs: { result: a - b } };
    }
}

// Multiply Node (乘法节点)
export const MultiplyTemplate: BlueprintNodeTemplate = {
    type: 'Multiply',
    title: 'Multiply',
    category: 'math',
    color: '#4CAF50',
    description: 'Multiplies two numbers (将两个数字相乘)',
    keywords: ['multiply', 'times', '*', 'math'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 1 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(MultiplyTemplate)
export class MultiplyExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 1));
        return { outputs: { result: a * b } };
    }
}

// Divide Node (除法节点)
export const DivideTemplate: BlueprintNodeTemplate = {
    type: 'Divide',
    title: 'Divide',
    category: 'math',
    color: '#4CAF50',
    description: 'Divides A by B (A 除以 B)',
    keywords: ['divide', '/', 'math'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 1 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(DivideTemplate)
export class DivideExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 1));

        // Prevent division by zero (防止除零)
        if (b === 0) {
            return { outputs: { result: 0 } };
        }

        return { outputs: { result: a / b } };
    }
}

// ============================================================================
// Modulo Node (取模节点)
// ============================================================================

export const ModuloTemplate: BlueprintNodeTemplate = {
    type: 'Modulo',
    title: 'Modulo',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the remainder of A divided by B (返回 A 除以 B 的余数)',
    keywords: ['modulo', 'mod', 'remainder', '%', 'math'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 1 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(ModuloTemplate)
export class ModuloExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 1));
        if (b === 0) return { outputs: { result: 0 } };
        return { outputs: { result: a % b } };
    }
}

// ============================================================================
// Absolute Value Node (绝对值节点)
// ============================================================================

export const AbsTemplate: BlueprintNodeTemplate = {
    type: 'Abs',
    title: 'Absolute',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the absolute value (返回绝对值)',
    keywords: ['abs', 'absolute', 'math'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(AbsTemplate)
export class AbsExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 0));
        return { outputs: { result: Math.abs(value) } };
    }
}

// ============================================================================
// Min Node (最小值节点)
// ============================================================================

export const MinTemplate: BlueprintNodeTemplate = {
    type: 'Min',
    title: 'Min',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the smaller of two values (返回两个值中较小的一个)',
    keywords: ['min', 'minimum', 'smaller', 'math'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(MinTemplate)
export class MinExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 0));
        return { outputs: { result: Math.min(a, b) } };
    }
}

// ============================================================================
// Max Node (最大值节点)
// ============================================================================

export const MaxTemplate: BlueprintNodeTemplate = {
    type: 'Max',
    title: 'Max',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the larger of two values (返回两个值中较大的一个)',
    keywords: ['max', 'maximum', 'larger', 'math'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(MaxTemplate)
export class MaxExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 0));
        return { outputs: { result: Math.max(a, b) } };
    }
}

// ============================================================================
// Clamp Node (限制范围节点)
// ============================================================================

export const ClampTemplate: BlueprintNodeTemplate = {
    type: 'Clamp',
    title: 'Clamp',
    category: 'math',
    color: '#4CAF50',
    description: 'Clamps a value between min and max (将值限制在最小和最大之间)',
    keywords: ['clamp', 'limit', 'range', 'bound', 'math'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 0 },
        { name: 'min', type: 'float', displayName: 'Min', defaultValue: 0 },
        { name: 'max', type: 'float', displayName: 'Max', defaultValue: 1 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(ClampTemplate)
export class ClampExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 0));
        const min = Number(context.evaluateInput(node.id, 'min', 0));
        const max = Number(context.evaluateInput(node.id, 'max', 1));
        return { outputs: { result: Math.max(min, Math.min(max, value)) } };
    }
}

// ============================================================================
// Lerp Node (线性插值节点)
// ============================================================================

export const LerpTemplate: BlueprintNodeTemplate = {
    type: 'Lerp',
    title: 'Lerp',
    category: 'math',
    color: '#4CAF50',
    description: 'Linear interpolation between A and B (A 和 B 之间的线性插值)',
    keywords: ['lerp', 'interpolate', 'blend', 'mix', 'math'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 1 },
        { name: 't', type: 'float', displayName: 'Alpha', defaultValue: 0.5 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(LerpTemplate)
export class LerpExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 1));
        const t = Number(context.evaluateInput(node.id, 't', 0.5));
        return { outputs: { result: a + (b - a) * t } };
    }
}

// ============================================================================
// Random Range Node (随机范围节点)
// ============================================================================

export const RandomRangeTemplate: BlueprintNodeTemplate = {
    type: 'RandomRange',
    title: 'Random Range',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns a random number between min and max (返回 min 和 max 之间的随机数)',
    keywords: ['random', 'range', 'rand', 'math'],
    isPure: true,
    inputs: [
        { name: 'min', type: 'float', displayName: 'Min', defaultValue: 0 },
        { name: 'max', type: 'float', displayName: 'Max', defaultValue: 1 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(RandomRangeTemplate)
export class RandomRangeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const min = Number(context.evaluateInput(node.id, 'min', 0));
        const max = Number(context.evaluateInput(node.id, 'max', 1));
        return { outputs: { result: min + Math.random() * (max - min) } };
    }
}

// ============================================================================
// Random Integer Node (随机整数节点)
// ============================================================================

export const RandomIntTemplate: BlueprintNodeTemplate = {
    type: 'RandomInt',
    title: 'Random Integer',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns a random integer between min and max inclusive (返回 min 和 max 之间的随机整数，包含边界)',
    keywords: ['random', 'int', 'integer', 'rand', 'math'],
    isPure: true,
    inputs: [
        { name: 'min', type: 'int', displayName: 'Min', defaultValue: 0 },
        { name: 'max', type: 'int', displayName: 'Max', defaultValue: 10 }
    ],
    outputs: [
        { name: 'result', type: 'int', displayName: 'Result' }
    ]
};

@RegisterNode(RandomIntTemplate)
export class RandomIntExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const min = Math.floor(Number(context.evaluateInput(node.id, 'min', 0)));
        const max = Math.floor(Number(context.evaluateInput(node.id, 'max', 10)));
        return { outputs: { result: Math.floor(min + Math.random() * (max - min + 1)) } };
    }
}

// ============================================================================
// Power Node (幂运算节点)
// ============================================================================

export const PowerTemplate: BlueprintNodeTemplate = {
    type: 'Power',
    title: 'Power',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns base raised to the power of exponent (返回底数的指数次幂)',
    keywords: ['power', 'pow', 'exponent', '^', 'math'],
    isPure: true,
    inputs: [
        { name: 'base', type: 'float', displayName: 'Base', defaultValue: 2 },
        { name: 'exponent', type: 'float', displayName: 'Exponent', defaultValue: 2 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(PowerTemplate)
export class PowerExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const base = Number(context.evaluateInput(node.id, 'base', 2));
        const exponent = Number(context.evaluateInput(node.id, 'exponent', 2));
        return { outputs: { result: Math.pow(base, exponent) } };
    }
}

// ============================================================================
// Square Root Node (平方根节点)
// ============================================================================

export const SqrtTemplate: BlueprintNodeTemplate = {
    type: 'Sqrt',
    title: 'Square Root',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the square root (返回平方根)',
    keywords: ['sqrt', 'square', 'root', 'math'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 4 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(SqrtTemplate)
export class SqrtExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 4));
        return { outputs: { result: Math.sqrt(Math.abs(value)) } };
    }
}

// ============================================================================
// Floor Node (向下取整节点)
// ============================================================================

export const FloorTemplate: BlueprintNodeTemplate = {
    type: 'Floor',
    title: 'Floor',
    category: 'math',
    color: '#4CAF50',
    description: 'Rounds down to the nearest integer (向下取整)',
    keywords: ['floor', 'round', 'down', 'int', 'math'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'int', displayName: 'Result' }
    ]
};

@RegisterNode(FloorTemplate)
export class FloorExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 0));
        return { outputs: { result: Math.floor(value) } };
    }
}

// ============================================================================
// Ceil Node (向上取整节点)
// ============================================================================

export const CeilTemplate: BlueprintNodeTemplate = {
    type: 'Ceil',
    title: 'Ceil',
    category: 'math',
    color: '#4CAF50',
    description: 'Rounds up to the nearest integer (向上取整)',
    keywords: ['ceil', 'ceiling', 'round', 'up', 'int', 'math'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'int', displayName: 'Result' }
    ]
};

@RegisterNode(CeilTemplate)
export class CeilExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 0));
        return { outputs: { result: Math.ceil(value) } };
    }
}

// ============================================================================
// Round Node (四舍五入节点)
// ============================================================================

export const RoundTemplate: BlueprintNodeTemplate = {
    type: 'Round',
    title: 'Round',
    category: 'math',
    color: '#4CAF50',
    description: 'Rounds to the nearest integer (四舍五入到最近的整数)',
    keywords: ['round', 'int', 'math'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'int', displayName: 'Result' }
    ]
};

@RegisterNode(RoundTemplate)
export class RoundExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 0));
        return { outputs: { result: Math.round(value) } };
    }
}

// ============================================================================
// Negate Node (取反节点)
// ============================================================================

export const NegateTemplate: BlueprintNodeTemplate = {
    type: 'Negate',
    title: 'Negate',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the negative of a value (返回值的负数)',
    keywords: ['negate', 'negative', 'minus', '-', 'math'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(NegateTemplate)
export class NegateExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 0));
        return { outputs: { result: -value } };
    }
}

// ============================================================================
// Sign Node (符号节点)
// ============================================================================

export const SignTemplate: BlueprintNodeTemplate = {
    type: 'Sign',
    title: 'Sign',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns -1, 0, or 1 based on the sign of the value (根据值的符号返回 -1、0 或 1)',
    keywords: ['sign', 'positive', 'negative', 'math'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'int', displayName: 'Result' }
    ]
};

@RegisterNode(SignTemplate)
export class SignExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 0));
        return { outputs: { result: Math.sign(value) } };
    }
}
