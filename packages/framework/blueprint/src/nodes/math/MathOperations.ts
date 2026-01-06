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

// ============================================================================
// Wrap Node (循环限制节点)
// ============================================================================

export const WrapTemplate: BlueprintNodeTemplate = {
    type: 'Wrap',
    title: 'Wrap',
    category: 'math',
    color: '#4CAF50',
    description: 'Wraps value to stay within min and max range (将值循环限制在范围内)',
    keywords: ['wrap', 'loop', 'cycle', 'range', 'math'],
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

@RegisterNode(WrapTemplate)
export class WrapExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 0));
        const min = Number(context.evaluateInput(node.id, 'min', 0));
        const max = Number(context.evaluateInput(node.id, 'max', 1));
        const range = max - min;
        if (range <= 0) return { outputs: { result: min } };
        const wrapped = ((value - min) % range + range) % range + min;
        return { outputs: { result: wrapped } };
    }
}

// ============================================================================
// Sin Node (正弦节点)
// ============================================================================

export const SinTemplate: BlueprintNodeTemplate = {
    type: 'Sin',
    title: 'Sin',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the sine of angle in radians (返回弧度角的正弦值)',
    keywords: ['sin', 'sine', 'trig', 'math'],
    isPure: true,
    inputs: [
        { name: 'radians', type: 'float', displayName: 'Radians', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(SinTemplate)
export class SinExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const radians = Number(context.evaluateInput(node.id, 'radians', 0));
        return { outputs: { result: Math.sin(radians) } };
    }
}

// ============================================================================
// Cos Node (余弦节点)
// ============================================================================

export const CosTemplate: BlueprintNodeTemplate = {
    type: 'Cos',
    title: 'Cos',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the cosine of angle in radians (返回弧度角的余弦值)',
    keywords: ['cos', 'cosine', 'trig', 'math'],
    isPure: true,
    inputs: [
        { name: 'radians', type: 'float', displayName: 'Radians', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(CosTemplate)
export class CosExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const radians = Number(context.evaluateInput(node.id, 'radians', 0));
        return { outputs: { result: Math.cos(radians) } };
    }
}

// ============================================================================
// Tan Node (正切节点)
// ============================================================================

export const TanTemplate: BlueprintNodeTemplate = {
    type: 'Tan',
    title: 'Tan',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the tangent of angle in radians (返回弧度角的正切值)',
    keywords: ['tan', 'tangent', 'trig', 'math'],
    isPure: true,
    inputs: [
        { name: 'radians', type: 'float', displayName: 'Radians', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Result' }
    ]
};

@RegisterNode(TanTemplate)
export class TanExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const radians = Number(context.evaluateInput(node.id, 'radians', 0));
        return { outputs: { result: Math.tan(radians) } };
    }
}

// ============================================================================
// Asin Node (反正弦节点)
// ============================================================================

export const AsinTemplate: BlueprintNodeTemplate = {
    type: 'Asin',
    title: 'Asin',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the arc sine in radians (返回反正弦值，单位为弧度)',
    keywords: ['asin', 'arc', 'sine', 'inverse', 'trig', 'math'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Radians' }
    ]
};

@RegisterNode(AsinTemplate)
export class AsinExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 0));
        return { outputs: { result: Math.asin(Math.max(-1, Math.min(1, value))) } };
    }
}

// ============================================================================
// Acos Node (反余弦节点)
// ============================================================================

export const AcosTemplate: BlueprintNodeTemplate = {
    type: 'Acos',
    title: 'Acos',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the arc cosine in radians (返回反余弦值，单位为弧度)',
    keywords: ['acos', 'arc', 'cosine', 'inverse', 'trig', 'math'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Radians' }
    ]
};

@RegisterNode(AcosTemplate)
export class AcosExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 0));
        return { outputs: { result: Math.acos(Math.max(-1, Math.min(1, value))) } };
    }
}

// ============================================================================
// Atan Node (反正切节点)
// ============================================================================

export const AtanTemplate: BlueprintNodeTemplate = {
    type: 'Atan',
    title: 'Atan',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the arc tangent in radians (返回反正切值，单位为弧度)',
    keywords: ['atan', 'arc', 'tangent', 'inverse', 'trig', 'math'],
    isPure: true,
    inputs: [
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Radians' }
    ]
};

@RegisterNode(AtanTemplate)
export class AtanExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = Number(context.evaluateInput(node.id, 'value', 0));
        return { outputs: { result: Math.atan(value) } };
    }
}

// ============================================================================
// Atan2 Node (两参数反正切节点)
// ============================================================================

export const Atan2Template: BlueprintNodeTemplate = {
    type: 'Atan2',
    title: 'Atan2',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the angle in radians between the positive X axis and the point (x, y) (返回点(x,y)与正X轴之间的弧度角)',
    keywords: ['atan2', 'angle', 'direction', 'trig', 'math'],
    isPure: true,
    inputs: [
        { name: 'y', type: 'float', displayName: 'Y', defaultValue: 0 },
        { name: 'x', type: 'float', displayName: 'X', defaultValue: 1 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Radians' }
    ]
};

@RegisterNode(Atan2Template)
export class Atan2Executor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const y = Number(context.evaluateInput(node.id, 'y', 0));
        const x = Number(context.evaluateInput(node.id, 'x', 1));
        return { outputs: { result: Math.atan2(y, x) } };
    }
}

// ============================================================================
// Degrees to Radians Node (角度转弧度节点)
// ============================================================================

export const DegToRadTemplate: BlueprintNodeTemplate = {
    type: 'DegToRad',
    title: 'Degrees to Radians',
    category: 'math',
    color: '#4CAF50',
    description: 'Converts degrees to radians (将角度转换为弧度)',
    keywords: ['degrees', 'radians', 'convert', 'angle', 'math'],
    isPure: true,
    inputs: [
        { name: 'degrees', type: 'float', displayName: 'Degrees', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Radians' }
    ]
};

@RegisterNode(DegToRadTemplate)
export class DegToRadExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const degrees = Number(context.evaluateInput(node.id, 'degrees', 0));
        return { outputs: { result: degrees * (Math.PI / 180) } };
    }
}

// ============================================================================
// Radians to Degrees Node (弧度转角度节点)
// ============================================================================

export const RadToDegTemplate: BlueprintNodeTemplate = {
    type: 'RadToDeg',
    title: 'Radians to Degrees',
    category: 'math',
    color: '#4CAF50',
    description: 'Converts radians to degrees (将弧度转换为角度)',
    keywords: ['radians', 'degrees', 'convert', 'angle', 'math'],
    isPure: true,
    inputs: [
        { name: 'radians', type: 'float', displayName: 'Radians', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Degrees' }
    ]
};

@RegisterNode(RadToDegTemplate)
export class RadToDegExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const radians = Number(context.evaluateInput(node.id, 'radians', 0));
        return { outputs: { result: radians * (180 / Math.PI) } };
    }
}

// ============================================================================
// Inverse Lerp Node (反向线性插值节点)
// ============================================================================

export const InverseLerpTemplate: BlueprintNodeTemplate = {
    type: 'InverseLerp',
    title: 'Inverse Lerp',
    category: 'math',
    color: '#4CAF50',
    description: 'Returns the percentage of Value between A and B (返回值在 A 和 B 之间的百分比位置)',
    keywords: ['inverse', 'lerp', 'percentage', 'ratio', 'math'],
    isPure: true,
    inputs: [
        { name: 'a', type: 'float', displayName: 'A', defaultValue: 0 },
        { name: 'b', type: 'float', displayName: 'B', defaultValue: 1 },
        { name: 'value', type: 'float', displayName: 'Value', defaultValue: 0.5 }
    ],
    outputs: [
        { name: 'result', type: 'float', displayName: 'Alpha (0-1)' }
    ]
};

@RegisterNode(InverseLerpTemplate)
export class InverseLerpExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const a = Number(context.evaluateInput(node.id, 'a', 0));
        const b = Number(context.evaluateInput(node.id, 'b', 1));
        const value = Number(context.evaluateInput(node.id, 'value', 0.5));
        if (b === a) return { outputs: { result: 0 } };
        return { outputs: { result: (value - a) / (b - a) } };
    }
}
