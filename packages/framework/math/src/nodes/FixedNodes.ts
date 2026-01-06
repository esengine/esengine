/**
 * @zh Fixed32 定点数蓝图节点
 * @en Fixed32 Blueprint Nodes
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import { Fixed32 } from '../Fixed32';

interface FixedContext {
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
}

// Make Fixed32 from float
export const Fixed32FromTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32From',
    title: 'Fixed32 From Float',
    category: 'math',
    description: 'Creates Fixed32 from float',
    keywords: ['fixed', 'fixed32', 'from', 'create', 'deterministic'],
    menuPath: ['Math', 'Fixed', 'From Float'],
    isPure: true,
    inputs: [
        { name: 'value', displayName: 'Value', type: 'float', defaultValue: 0 }
    ],
    outputs: [
        { name: 'fixed', displayName: 'Fixed32', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32FromExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const value = Number(ctx.evaluateInput(node.id, 'value', 0));
        return { outputs: { fixed: Fixed32.from(value) } };
    }
}

// Make Fixed32 from int
export const Fixed32FromIntTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32FromInt',
    title: 'Fixed32 From Int',
    category: 'math',
    description: 'Creates Fixed32 from integer (no precision loss)',
    keywords: ['fixed', 'fixed32', 'from', 'int', 'integer'],
    menuPath: ['Math', 'Fixed', 'From Int'],
    isPure: true,
    inputs: [
        { name: 'value', displayName: 'Value', type: 'int', defaultValue: 0 }
    ],
    outputs: [
        { name: 'fixed', displayName: 'Fixed32', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32FromIntExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const value = Math.floor(Number(ctx.evaluateInput(node.id, 'value', 0)));
        return { outputs: { fixed: Fixed32.fromInt(value) } };
    }
}

// Fixed32 to float
export const Fixed32ToFloatTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32ToFloat',
    title: 'Fixed32 To Float',
    category: 'math',
    description: 'Converts Fixed32 to float',
    keywords: ['fixed', 'fixed32', 'to', 'float', 'convert'],
    menuPath: ['Math', 'Fixed', 'To Float'],
    isPure: true,
    inputs: [
        { name: 'fixed', displayName: 'Fixed32', type: 'object' }
    ],
    outputs: [
        { name: 'value', displayName: 'Value', type: 'float' }
    ],
    color: '#9C27B0'
};

export class Fixed32ToFloatExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const fixed = ctx.evaluateInput(node.id, 'fixed', Fixed32.ZERO) as Fixed32;
        return { outputs: { value: fixed?.toNumber() ?? 0 } };
    }
}

// Fixed32 to int
export const Fixed32ToIntTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32ToInt',
    title: 'Fixed32 To Int',
    category: 'math',
    description: 'Converts Fixed32 to integer (floor)',
    keywords: ['fixed', 'fixed32', 'to', 'int', 'integer'],
    menuPath: ['Math', 'Fixed', 'To Int'],
    isPure: true,
    inputs: [
        { name: 'fixed', displayName: 'Fixed32', type: 'object' }
    ],
    outputs: [
        { name: 'value', displayName: 'Value', type: 'int' }
    ],
    color: '#9C27B0'
};

export class Fixed32ToIntExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const fixed = ctx.evaluateInput(node.id, 'fixed', Fixed32.ZERO) as Fixed32;
        return { outputs: { value: fixed?.toInt() ?? 0 } };
    }
}

// Fixed32 Add
export const Fixed32AddTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Add',
    title: 'Fixed32 +',
    category: 'math',
    description: 'Adds two Fixed32 values',
    keywords: ['fixed', 'add', 'plus', '+'],
    menuPath: ['Math', 'Fixed', 'Add'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32AddExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const a = ctx.evaluateInput(node.id, 'a', Fixed32.ZERO) as Fixed32;
        const b = ctx.evaluateInput(node.id, 'b', Fixed32.ZERO) as Fixed32;
        return { outputs: { result: (a ?? Fixed32.ZERO).add(b ?? Fixed32.ZERO) } };
    }
}

// Fixed32 Subtract
export const Fixed32SubtractTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Subtract',
    title: 'Fixed32 -',
    category: 'math',
    description: 'Subtracts B from A',
    keywords: ['fixed', 'subtract', 'minus', '-'],
    menuPath: ['Math', 'Fixed', 'Subtract'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32SubtractExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const a = ctx.evaluateInput(node.id, 'a', Fixed32.ZERO) as Fixed32;
        const b = ctx.evaluateInput(node.id, 'b', Fixed32.ZERO) as Fixed32;
        return { outputs: { result: (a ?? Fixed32.ZERO).sub(b ?? Fixed32.ZERO) } };
    }
}

// Fixed32 Multiply
export const Fixed32MultiplyTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Multiply',
    title: 'Fixed32 *',
    category: 'math',
    description: 'Multiplies two Fixed32 values',
    keywords: ['fixed', 'multiply', 'times', '*'],
    menuPath: ['Math', 'Fixed', 'Multiply'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32MultiplyExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const a = ctx.evaluateInput(node.id, 'a', Fixed32.ONE) as Fixed32;
        const b = ctx.evaluateInput(node.id, 'b', Fixed32.ONE) as Fixed32;
        return { outputs: { result: (a ?? Fixed32.ONE).mul(b ?? Fixed32.ONE) } };
    }
}

// Fixed32 Divide
export const Fixed32DivideTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Divide',
    title: 'Fixed32 /',
    category: 'math',
    description: 'Divides A by B',
    keywords: ['fixed', 'divide', '/'],
    menuPath: ['Math', 'Fixed', 'Divide'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32DivideExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const a = ctx.evaluateInput(node.id, 'a', Fixed32.ZERO) as Fixed32;
        const b = ctx.evaluateInput(node.id, 'b', Fixed32.ONE) as Fixed32;
        const divisor = b ?? Fixed32.ONE;
        if (divisor.isZero()) {
            return { outputs: { result: Fixed32.ZERO } };
        }
        return { outputs: { result: (a ?? Fixed32.ZERO).div(divisor) } };
    }
}

// Fixed32 Negate
export const Fixed32NegateTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Negate',
    title: 'Fixed32 Negate',
    category: 'math',
    description: 'Negates a Fixed32 value',
    keywords: ['fixed', 'negate', '-'],
    menuPath: ['Math', 'Fixed', 'Negate'],
    isPure: true,
    inputs: [
        { name: 'value', displayName: 'Value', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32NegateExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const value = ctx.evaluateInput(node.id, 'value', Fixed32.ZERO) as Fixed32;
        return { outputs: { result: (value ?? Fixed32.ZERO).neg() } };
    }
}

// Fixed32 Abs
export const Fixed32AbsTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Abs',
    title: 'Fixed32 Abs',
    category: 'math',
    description: 'Absolute value of Fixed32',
    keywords: ['fixed', 'abs', 'absolute'],
    menuPath: ['Math', 'Fixed', 'Abs'],
    isPure: true,
    inputs: [
        { name: 'value', displayName: 'Value', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32AbsExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const value = ctx.evaluateInput(node.id, 'value', Fixed32.ZERO) as Fixed32;
        return { outputs: { result: (value ?? Fixed32.ZERO).abs() } };
    }
}

// Fixed32 Sqrt
export const Fixed32SqrtTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Sqrt',
    title: 'Fixed32 Sqrt',
    category: 'math',
    description: 'Square root (deterministic)',
    keywords: ['fixed', 'sqrt', 'square', 'root'],
    menuPath: ['Math', 'Fixed', 'Sqrt'],
    isPure: true,
    inputs: [
        { name: 'value', displayName: 'Value', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32SqrtExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const value = ctx.evaluateInput(node.id, 'value', Fixed32.ZERO) as Fixed32;
        return { outputs: { result: Fixed32.sqrt(value ?? Fixed32.ZERO) } };
    }
}

// Fixed32 Floor
export const Fixed32FloorTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Floor',
    title: 'Fixed32 Floor',
    category: 'math',
    description: 'Floor of Fixed32',
    keywords: ['fixed', 'floor', 'round', 'down'],
    menuPath: ['Math', 'Fixed', 'Floor'],
    isPure: true,
    inputs: [
        { name: 'value', displayName: 'Value', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32FloorExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const value = ctx.evaluateInput(node.id, 'value', Fixed32.ZERO) as Fixed32;
        return { outputs: { result: Fixed32.floor(value ?? Fixed32.ZERO) } };
    }
}

// Fixed32 Ceil
export const Fixed32CeilTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Ceil',
    title: 'Fixed32 Ceil',
    category: 'math',
    description: 'Ceiling of Fixed32',
    keywords: ['fixed', 'ceil', 'ceiling', 'round', 'up'],
    menuPath: ['Math', 'Fixed', 'Ceil'],
    isPure: true,
    inputs: [
        { name: 'value', displayName: 'Value', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32CeilExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const value = ctx.evaluateInput(node.id, 'value', Fixed32.ZERO) as Fixed32;
        return { outputs: { result: Fixed32.ceil(value ?? Fixed32.ZERO) } };
    }
}

// Fixed32 Round
export const Fixed32RoundTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Round',
    title: 'Fixed32 Round',
    category: 'math',
    description: 'Rounds Fixed32 to nearest integer',
    keywords: ['fixed', 'round'],
    menuPath: ['Math', 'Fixed', 'Round'],
    isPure: true,
    inputs: [
        { name: 'value', displayName: 'Value', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32RoundExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const value = ctx.evaluateInput(node.id, 'value', Fixed32.ZERO) as Fixed32;
        return { outputs: { result: Fixed32.round(value ?? Fixed32.ZERO) } };
    }
}

// Fixed32 Sign
export const Fixed32SignTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Sign',
    title: 'Fixed32 Sign',
    category: 'math',
    description: 'Sign of Fixed32 (-1, 0, or 1)',
    keywords: ['fixed', 'sign'],
    menuPath: ['Math', 'Fixed', 'Sign'],
    isPure: true,
    inputs: [
        { name: 'value', displayName: 'Value', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32SignExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const value = ctx.evaluateInput(node.id, 'value', Fixed32.ZERO) as Fixed32;
        return { outputs: { result: Fixed32.sign(value ?? Fixed32.ZERO) } };
    }
}

// Fixed32 Min
export const Fixed32MinTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Min',
    title: 'Fixed32 Min',
    category: 'math',
    description: 'Minimum of two Fixed32 values',
    keywords: ['fixed', 'min', 'minimum'],
    menuPath: ['Math', 'Fixed', 'Min'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32MinExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const a = ctx.evaluateInput(node.id, 'a', Fixed32.ZERO) as Fixed32;
        const b = ctx.evaluateInput(node.id, 'b', Fixed32.ZERO) as Fixed32;
        return { outputs: { result: Fixed32.min(a ?? Fixed32.ZERO, b ?? Fixed32.ZERO) } };
    }
}

// Fixed32 Max
export const Fixed32MaxTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Max',
    title: 'Fixed32 Max',
    category: 'math',
    description: 'Maximum of two Fixed32 values',
    keywords: ['fixed', 'max', 'maximum'],
    menuPath: ['Math', 'Fixed', 'Max'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32MaxExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const a = ctx.evaluateInput(node.id, 'a', Fixed32.ZERO) as Fixed32;
        const b = ctx.evaluateInput(node.id, 'b', Fixed32.ZERO) as Fixed32;
        return { outputs: { result: Fixed32.max(a ?? Fixed32.ZERO, b ?? Fixed32.ZERO) } };
    }
}

// Fixed32 Clamp
export const Fixed32ClampTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Clamp',
    title: 'Fixed32 Clamp',
    category: 'math',
    description: 'Clamps Fixed32 to range',
    keywords: ['fixed', 'clamp', 'limit', 'range'],
    menuPath: ['Math', 'Fixed', 'Clamp'],
    isPure: true,
    inputs: [
        { name: 'value', displayName: 'Value', type: 'object' },
        { name: 'min', displayName: 'Min', type: 'object' },
        { name: 'max', displayName: 'Max', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32ClampExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const value = ctx.evaluateInput(node.id, 'value', Fixed32.ZERO) as Fixed32;
        const min = ctx.evaluateInput(node.id, 'min', Fixed32.ZERO) as Fixed32;
        const max = ctx.evaluateInput(node.id, 'max', Fixed32.ONE) as Fixed32;
        return { outputs: { result: Fixed32.clamp(value ?? Fixed32.ZERO, min ?? Fixed32.ZERO, max ?? Fixed32.ONE) } };
    }
}

// Fixed32 Lerp
export const Fixed32LerpTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Lerp',
    title: 'Fixed32 Lerp',
    category: 'math',
    description: 'Linear interpolation between A and B',
    keywords: ['fixed', 'lerp', 'interpolate', 'blend'],
    menuPath: ['Math', 'Fixed', 'Lerp'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' },
        { name: 't', displayName: 'T', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32LerpExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const a = ctx.evaluateInput(node.id, 'a', Fixed32.ZERO) as Fixed32;
        const b = ctx.evaluateInput(node.id, 'b', Fixed32.ONE) as Fixed32;
        const t = ctx.evaluateInput(node.id, 't', Fixed32.HALF) as Fixed32;
        return { outputs: { result: Fixed32.lerp(a ?? Fixed32.ZERO, b ?? Fixed32.ONE, t ?? Fixed32.HALF) } };
    }
}

// Fixed32 Compare
export const Fixed32CompareTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Compare',
    title: 'Fixed32 Compare',
    category: 'math',
    description: 'Compares two Fixed32 values',
    keywords: ['fixed', 'compare', 'equal', 'less', 'greater'],
    menuPath: ['Math', 'Fixed', 'Compare'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' }
    ],
    outputs: [
        { name: 'equal', displayName: 'A == B', type: 'bool' },
        { name: 'less', displayName: 'A < B', type: 'bool' },
        { name: 'greater', displayName: 'A > B', type: 'bool' }
    ],
    color: '#9C27B0'
};

export class Fixed32CompareExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const a = ctx.evaluateInput(node.id, 'a', Fixed32.ZERO) as Fixed32;
        const b = ctx.evaluateInput(node.id, 'b', Fixed32.ZERO) as Fixed32;
        const aVal = a ?? Fixed32.ZERO;
        const bVal = b ?? Fixed32.ZERO;
        return {
            outputs: {
                equal: aVal.eq(bVal),
                less: aVal.lt(bVal),
                greater: aVal.gt(bVal)
            }
        };
    }
}

// Fixed32 IsZero
export const Fixed32IsZeroTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32IsZero',
    title: 'Fixed32 Is Zero',
    category: 'math',
    description: 'Checks if Fixed32 is zero, positive, or negative',
    keywords: ['fixed', 'zero', 'check'],
    menuPath: ['Math', 'Fixed', 'Is Zero'],
    isPure: true,
    inputs: [
        { name: 'value', displayName: 'Value', type: 'object' }
    ],
    outputs: [
        { name: 'isZero', displayName: 'Is Zero', type: 'bool' },
        { name: 'isPositive', displayName: 'Is Positive', type: 'bool' },
        { name: 'isNegative', displayName: 'Is Negative', type: 'bool' }
    ],
    color: '#9C27B0'
};

export class Fixed32IsZeroExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedContext;
        const value = ctx.evaluateInput(node.id, 'value', Fixed32.ZERO) as Fixed32;
        const val = value ?? Fixed32.ZERO;
        return {
            outputs: {
                isZero: val.isZero(),
                isPositive: val.isPositive(),
                isNegative: val.isNegative()
            }
        };
    }
}

// Fixed32 Constants
export const Fixed32ConstantsTemplate: BlueprintNodeTemplate = {
    type: 'Fixed32Constants',
    title: 'Fixed32 Constants',
    category: 'math',
    description: 'Common Fixed32 constants',
    keywords: ['fixed', 'constant', 'pi', 'zero', 'one'],
    menuPath: ['Math', 'Fixed', 'Constants'],
    isPure: true,
    inputs: [],
    outputs: [
        { name: 'zero', displayName: '0', type: 'object' },
        { name: 'one', displayName: '1', type: 'object' },
        { name: 'half', displayName: '0.5', type: 'object' },
        { name: 'pi', displayName: 'PI', type: 'object' },
        { name: 'twoPi', displayName: '2PI', type: 'object' }
    ],
    color: '#9C27B0'
};

export class Fixed32ConstantsExecutor implements INodeExecutor {
    execute(): ExecutionResult {
        return {
            outputs: {
                zero: Fixed32.ZERO,
                one: Fixed32.ONE,
                half: Fixed32.HALF,
                pi: Fixed32.PI,
                twoPi: Fixed32.TWO_PI
            }
        };
    }
}

// Node definitions collection
export const FixedNodeDefinitions = [
    { template: Fixed32FromTemplate, executor: new Fixed32FromExecutor() },
    { template: Fixed32FromIntTemplate, executor: new Fixed32FromIntExecutor() },
    { template: Fixed32ToFloatTemplate, executor: new Fixed32ToFloatExecutor() },
    { template: Fixed32ToIntTemplate, executor: new Fixed32ToIntExecutor() },
    { template: Fixed32AddTemplate, executor: new Fixed32AddExecutor() },
    { template: Fixed32SubtractTemplate, executor: new Fixed32SubtractExecutor() },
    { template: Fixed32MultiplyTemplate, executor: new Fixed32MultiplyExecutor() },
    { template: Fixed32DivideTemplate, executor: new Fixed32DivideExecutor() },
    { template: Fixed32NegateTemplate, executor: new Fixed32NegateExecutor() },
    { template: Fixed32AbsTemplate, executor: new Fixed32AbsExecutor() },
    { template: Fixed32SqrtTemplate, executor: new Fixed32SqrtExecutor() },
    { template: Fixed32FloorTemplate, executor: new Fixed32FloorExecutor() },
    { template: Fixed32CeilTemplate, executor: new Fixed32CeilExecutor() },
    { template: Fixed32RoundTemplate, executor: new Fixed32RoundExecutor() },
    { template: Fixed32SignTemplate, executor: new Fixed32SignExecutor() },
    { template: Fixed32MinTemplate, executor: new Fixed32MinExecutor() },
    { template: Fixed32MaxTemplate, executor: new Fixed32MaxExecutor() },
    { template: Fixed32ClampTemplate, executor: new Fixed32ClampExecutor() },
    { template: Fixed32LerpTemplate, executor: new Fixed32LerpExecutor() },
    { template: Fixed32CompareTemplate, executor: new Fixed32CompareExecutor() },
    { template: Fixed32IsZeroTemplate, executor: new Fixed32IsZeroExecutor() },
    { template: Fixed32ConstantsTemplate, executor: new Fixed32ConstantsExecutor() }
];
