/**
 * @zh FixedVector2 定点向量蓝图节点
 * @en FixedVector2 Blueprint Nodes
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import { FixedVector2 } from '../FixedVector2';
import { Fixed32 } from '../Fixed32';

interface FixedVectorContext {
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
}

// Make FixedVector2
export const MakeFixedVector2Template: BlueprintNodeTemplate = {
    type: 'MakeFixedVector2',
    title: 'Make FixedVector2',
    category: 'math',
    description: 'Creates FixedVector2 from floats',
    keywords: ['make', 'create', 'fixed', 'vector', 'deterministic'],
    menuPath: ['Math', 'Fixed Vector', 'Make FixedVector2'],
    isPure: true,
    inputs: [
        { name: 'x', displayName: 'X', type: 'float', defaultValue: 0 },
        { name: 'y', displayName: 'Y', type: 'float', defaultValue: 0 }
    ],
    outputs: [
        { name: 'vector', displayName: 'Vector', type: 'object' }
    ],
    color: '#673AB7'
};

export class MakeFixedVector2Executor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedVectorContext;
        const x = Number(ctx.evaluateInput(node.id, 'x', 0));
        const y = Number(ctx.evaluateInput(node.id, 'y', 0));
        return { outputs: { vector: FixedVector2.from(x, y) } };
    }
}

// Break FixedVector2
export const BreakFixedVector2Template: BlueprintNodeTemplate = {
    type: 'BreakFixedVector2',
    title: 'Break FixedVector2',
    category: 'math',
    description: 'Breaks FixedVector2 into X and Y floats',
    keywords: ['break', 'split', 'fixed', 'vector'],
    menuPath: ['Math', 'Fixed Vector', 'Break FixedVector2'],
    isPure: true,
    inputs: [
        { name: 'vector', displayName: 'Vector', type: 'object' }
    ],
    outputs: [
        { name: 'x', displayName: 'X', type: 'float' },
        { name: 'y', displayName: 'Y', type: 'float' }
    ],
    color: '#673AB7'
};

export class BreakFixedVector2Executor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedVectorContext;
        const vector = ctx.evaluateInput(node.id, 'vector', FixedVector2.ZERO) as FixedVector2;
        const v = vector ?? FixedVector2.ZERO;
        return { outputs: { x: v.x.toNumber(), y: v.y.toNumber() } };
    }
}

// FixedVector2 Add
export const FixedVector2AddTemplate: BlueprintNodeTemplate = {
    type: 'FixedVector2Add',
    title: 'FixedVector2 +',
    category: 'math',
    description: 'Adds two fixed vectors',
    keywords: ['fixed', 'vector', 'add', '+'],
    menuPath: ['Math', 'Fixed Vector', 'Add'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#673AB7'
};

export class FixedVector2AddExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedVectorContext;
        const a = ctx.evaluateInput(node.id, 'a', FixedVector2.ZERO) as FixedVector2;
        const b = ctx.evaluateInput(node.id, 'b', FixedVector2.ZERO) as FixedVector2;
        return { outputs: { result: (a ?? FixedVector2.ZERO).add(b ?? FixedVector2.ZERO) } };
    }
}

// FixedVector2 Subtract
export const FixedVector2SubtractTemplate: BlueprintNodeTemplate = {
    type: 'FixedVector2Subtract',
    title: 'FixedVector2 -',
    category: 'math',
    description: 'Subtracts B from A',
    keywords: ['fixed', 'vector', 'subtract', '-'],
    menuPath: ['Math', 'Fixed Vector', 'Subtract'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#673AB7'
};

export class FixedVector2SubtractExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedVectorContext;
        const a = ctx.evaluateInput(node.id, 'a', FixedVector2.ZERO) as FixedVector2;
        const b = ctx.evaluateInput(node.id, 'b', FixedVector2.ZERO) as FixedVector2;
        return { outputs: { result: (a ?? FixedVector2.ZERO).sub(b ?? FixedVector2.ZERO) } };
    }
}

// FixedVector2 Scale
export const FixedVector2ScaleTemplate: BlueprintNodeTemplate = {
    type: 'FixedVector2Scale',
    title: 'FixedVector2 *',
    category: 'math',
    description: 'Scales vector by Fixed32 scalar',
    keywords: ['fixed', 'vector', 'scale', '*'],
    menuPath: ['Math', 'Fixed Vector', 'Scale'],
    isPure: true,
    inputs: [
        { name: 'vector', displayName: 'Vector', type: 'object' },
        { name: 'scalar', displayName: 'Scalar', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#673AB7'
};

export class FixedVector2ScaleExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedVectorContext;
        const vector = ctx.evaluateInput(node.id, 'vector', FixedVector2.ZERO) as FixedVector2;
        const scalar = ctx.evaluateInput(node.id, 'scalar', Fixed32.ONE) as Fixed32;
        return { outputs: { result: (vector ?? FixedVector2.ZERO).mul(scalar ?? Fixed32.ONE) } };
    }
}

// FixedVector2 Negate
export const FixedVector2NegateTemplate: BlueprintNodeTemplate = {
    type: 'FixedVector2Negate',
    title: 'FixedVector2 Negate',
    category: 'math',
    description: 'Negates a fixed vector',
    keywords: ['fixed', 'vector', 'negate', '-'],
    menuPath: ['Math', 'Fixed Vector', 'Negate'],
    isPure: true,
    inputs: [
        { name: 'vector', displayName: 'Vector', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#673AB7'
};

export class FixedVector2NegateExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedVectorContext;
        const vector = ctx.evaluateInput(node.id, 'vector', FixedVector2.ZERO) as FixedVector2;
        return { outputs: { result: (vector ?? FixedVector2.ZERO).neg() } };
    }
}

// FixedVector2 Length
export const FixedVector2LengthTemplate: BlueprintNodeTemplate = {
    type: 'FixedVector2Length',
    title: 'FixedVector2 Length',
    category: 'math',
    description: 'Gets the length of a fixed vector',
    keywords: ['fixed', 'vector', 'length', 'magnitude'],
    menuPath: ['Math', 'Fixed Vector', 'Length'],
    isPure: true,
    inputs: [
        { name: 'vector', displayName: 'Vector', type: 'object' }
    ],
    outputs: [
        { name: 'length', displayName: 'Length', type: 'object' }
    ],
    color: '#673AB7'
};

export class FixedVector2LengthExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedVectorContext;
        const vector = ctx.evaluateInput(node.id, 'vector', FixedVector2.ZERO) as FixedVector2;
        return { outputs: { length: (vector ?? FixedVector2.ZERO).length() } };
    }
}

// FixedVector2 Normalize
export const FixedVector2NormalizeTemplate: BlueprintNodeTemplate = {
    type: 'FixedVector2Normalize',
    title: 'FixedVector2 Normalize',
    category: 'math',
    description: 'Normalizes a fixed vector',
    keywords: ['fixed', 'vector', 'normalize', 'unit'],
    menuPath: ['Math', 'Fixed Vector', 'Normalize'],
    isPure: true,
    inputs: [
        { name: 'vector', displayName: 'Vector', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#673AB7'
};

export class FixedVector2NormalizeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedVectorContext;
        const vector = ctx.evaluateInput(node.id, 'vector', FixedVector2.ZERO) as FixedVector2;
        return { outputs: { result: (vector ?? FixedVector2.ZERO).normalize() } };
    }
}

// FixedVector2 Dot
export const FixedVector2DotTemplate: BlueprintNodeTemplate = {
    type: 'FixedVector2Dot',
    title: 'FixedVector2 Dot',
    category: 'math',
    description: 'Calculates dot product',
    keywords: ['fixed', 'vector', 'dot', 'product'],
    menuPath: ['Math', 'Fixed Vector', 'Dot Product'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#673AB7'
};

export class FixedVector2DotExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedVectorContext;
        const a = ctx.evaluateInput(node.id, 'a', FixedVector2.ZERO) as FixedVector2;
        const b = ctx.evaluateInput(node.id, 'b', FixedVector2.ZERO) as FixedVector2;
        return { outputs: { result: FixedVector2.dot(a ?? FixedVector2.ZERO, b ?? FixedVector2.ZERO) } };
    }
}

// FixedVector2 Cross
export const FixedVector2CrossTemplate: BlueprintNodeTemplate = {
    type: 'FixedVector2Cross',
    title: 'FixedVector2 Cross',
    category: 'math',
    description: '2D cross product (returns Fixed32)',
    keywords: ['fixed', 'vector', 'cross', 'product'],
    menuPath: ['Math', 'Fixed Vector', 'Cross Product'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#673AB7'
};

export class FixedVector2CrossExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedVectorContext;
        const a = ctx.evaluateInput(node.id, 'a', FixedVector2.ZERO) as FixedVector2;
        const b = ctx.evaluateInput(node.id, 'b', FixedVector2.ZERO) as FixedVector2;
        return { outputs: { result: FixedVector2.cross(a ?? FixedVector2.ZERO, b ?? FixedVector2.ZERO) } };
    }
}

// FixedVector2 Distance
export const FixedVector2DistanceTemplate: BlueprintNodeTemplate = {
    type: 'FixedVector2Distance',
    title: 'FixedVector2 Distance',
    category: 'math',
    description: 'Distance between two points',
    keywords: ['fixed', 'vector', 'distance'],
    menuPath: ['Math', 'Fixed Vector', 'Distance'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' }
    ],
    outputs: [
        { name: 'distance', displayName: 'Distance', type: 'object' }
    ],
    color: '#673AB7'
};

export class FixedVector2DistanceExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedVectorContext;
        const a = ctx.evaluateInput(node.id, 'a', FixedVector2.ZERO) as FixedVector2;
        const b = ctx.evaluateInput(node.id, 'b', FixedVector2.ZERO) as FixedVector2;
        return { outputs: { distance: FixedVector2.distance(a ?? FixedVector2.ZERO, b ?? FixedVector2.ZERO) } };
    }
}

// FixedVector2 Lerp
export const FixedVector2LerpTemplate: BlueprintNodeTemplate = {
    type: 'FixedVector2Lerp',
    title: 'FixedVector2 Lerp',
    category: 'math',
    description: 'Linear interpolation between two vectors',
    keywords: ['fixed', 'vector', 'lerp', 'interpolate'],
    menuPath: ['Math', 'Fixed Vector', 'Lerp'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'object' },
        { name: 'b', displayName: 'B', type: 'object' },
        { name: 't', displayName: 'T', type: 'object' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'object' }
    ],
    color: '#673AB7'
};

export class FixedVector2LerpExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as FixedVectorContext;
        const a = ctx.evaluateInput(node.id, 'a', FixedVector2.ZERO) as FixedVector2;
        const b = ctx.evaluateInput(node.id, 'b', FixedVector2.ZERO) as FixedVector2;
        const t = ctx.evaluateInput(node.id, 't', Fixed32.HALF) as Fixed32;
        return { outputs: { result: FixedVector2.lerp(a ?? FixedVector2.ZERO, b ?? FixedVector2.ZERO, t ?? Fixed32.HALF) } };
    }
}

// Node definitions collection
export const FixedVectorNodeDefinitions = [
    { template: MakeFixedVector2Template, executor: new MakeFixedVector2Executor() },
    { template: BreakFixedVector2Template, executor: new BreakFixedVector2Executor() },
    { template: FixedVector2AddTemplate, executor: new FixedVector2AddExecutor() },
    { template: FixedVector2SubtractTemplate, executor: new FixedVector2SubtractExecutor() },
    { template: FixedVector2ScaleTemplate, executor: new FixedVector2ScaleExecutor() },
    { template: FixedVector2NegateTemplate, executor: new FixedVector2NegateExecutor() },
    { template: FixedVector2LengthTemplate, executor: new FixedVector2LengthExecutor() },
    { template: FixedVector2NormalizeTemplate, executor: new FixedVector2NormalizeExecutor() },
    { template: FixedVector2DotTemplate, executor: new FixedVector2DotExecutor() },
    { template: FixedVector2CrossTemplate, executor: new FixedVector2CrossExecutor() },
    { template: FixedVector2DistanceTemplate, executor: new FixedVector2DistanceExecutor() },
    { template: FixedVector2LerpTemplate, executor: new FixedVector2LerpExecutor() }
];
