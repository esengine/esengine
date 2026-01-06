/**
 * @zh Vector2 蓝图节点
 * @en Vector2 Blueprint Nodes
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import { Vector2 } from '../Vector2';

interface VectorContext {
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
}

// Make Vector2
export const MakeVector2Template: BlueprintNodeTemplate = {
    type: 'MakeVector2',
    title: 'Make Vector2',
    category: 'math',
    description: 'Creates a Vector2 from X and Y',
    keywords: ['make', 'create', 'vector', 'vector2'],
    menuPath: ['Math', 'Vector', 'Make Vector2'],
    isPure: true,
    inputs: [
        { name: 'x', displayName: 'X', type: 'float', defaultValue: 0 },
        { name: 'y', displayName: 'Y', type: 'float', defaultValue: 0 }
    ],
    outputs: [
        { name: 'vector', displayName: 'Vector', type: 'vector2' }
    ],
    color: '#2196F3'
};

export class MakeVector2Executor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const x = Number(ctx.evaluateInput(node.id, 'x', 0));
        const y = Number(ctx.evaluateInput(node.id, 'y', 0));
        return { outputs: { vector: new Vector2(x, y) } };
    }
}

// Break Vector2
export const BreakVector2Template: BlueprintNodeTemplate = {
    type: 'BreakVector2',
    title: 'Break Vector2',
    category: 'math',
    description: 'Breaks a Vector2 into X and Y',
    keywords: ['break', 'split', 'vector', 'vector2'],
    menuPath: ['Math', 'Vector', 'Break Vector2'],
    isPure: true,
    inputs: [
        { name: 'vector', displayName: 'Vector', type: 'vector2' }
    ],
    outputs: [
        { name: 'x', displayName: 'X', type: 'float' },
        { name: 'y', displayName: 'Y', type: 'float' }
    ],
    color: '#2196F3'
};

export class BreakVector2Executor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const vector = ctx.evaluateInput(node.id, 'vector', Vector2.ZERO) as Vector2;
        return { outputs: { x: vector?.x ?? 0, y: vector?.y ?? 0 } };
    }
}

// Vector2 Add
export const Vector2AddTemplate: BlueprintNodeTemplate = {
    type: 'Vector2Add',
    title: 'Vector2 +',
    category: 'math',
    description: 'Adds two vectors',
    keywords: ['add', 'plus', 'vector'],
    menuPath: ['Math', 'Vector', 'Add'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'vector2' },
        { name: 'b', displayName: 'B', type: 'vector2' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'vector2' }
    ],
    color: '#2196F3'
};

export class Vector2AddExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const a = ctx.evaluateInput(node.id, 'a', Vector2.ZERO) as Vector2;
        const b = ctx.evaluateInput(node.id, 'b', Vector2.ZERO) as Vector2;
        return { outputs: { result: Vector2.add(a ?? Vector2.ZERO, b ?? Vector2.ZERO) } };
    }
}

// Vector2 Subtract
export const Vector2SubtractTemplate: BlueprintNodeTemplate = {
    type: 'Vector2Subtract',
    title: 'Vector2 -',
    category: 'math',
    description: 'Subtracts B from A',
    keywords: ['subtract', 'minus', 'vector'],
    menuPath: ['Math', 'Vector', 'Subtract'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'vector2' },
        { name: 'b', displayName: 'B', type: 'vector2' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'vector2' }
    ],
    color: '#2196F3'
};

export class Vector2SubtractExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const a = ctx.evaluateInput(node.id, 'a', Vector2.ZERO) as Vector2;
        const b = ctx.evaluateInput(node.id, 'b', Vector2.ZERO) as Vector2;
        return { outputs: { result: Vector2.subtract(a ?? Vector2.ZERO, b ?? Vector2.ZERO) } };
    }
}

// Vector2 Scale
export const Vector2ScaleTemplate: BlueprintNodeTemplate = {
    type: 'Vector2Scale',
    title: 'Vector2 *',
    category: 'math',
    description: 'Scales a vector by a scalar',
    keywords: ['scale', 'multiply', 'vector'],
    menuPath: ['Math', 'Vector', 'Scale'],
    isPure: true,
    inputs: [
        { name: 'vector', displayName: 'Vector', type: 'vector2' },
        { name: 'scalar', displayName: 'Scalar', type: 'float', defaultValue: 1 }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'vector2' }
    ],
    color: '#2196F3'
};

export class Vector2ScaleExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const vector = ctx.evaluateInput(node.id, 'vector', Vector2.ZERO) as Vector2;
        const scalar = Number(ctx.evaluateInput(node.id, 'scalar', 1));
        return { outputs: { result: Vector2.multiply(vector ?? Vector2.ZERO, scalar) } };
    }
}

// Vector2 Length
export const Vector2LengthTemplate: BlueprintNodeTemplate = {
    type: 'Vector2Length',
    title: 'Vector2 Length',
    category: 'math',
    description: 'Gets the length of a vector',
    keywords: ['length', 'magnitude', 'vector'],
    menuPath: ['Math', 'Vector', 'Length'],
    isPure: true,
    inputs: [
        { name: 'vector', displayName: 'Vector', type: 'vector2' }
    ],
    outputs: [
        { name: 'length', displayName: 'Length', type: 'float' }
    ],
    color: '#2196F3'
};

export class Vector2LengthExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const vector = ctx.evaluateInput(node.id, 'vector', Vector2.ZERO) as Vector2;
        return { outputs: { length: (vector ?? Vector2.ZERO).length } };
    }
}

// Vector2 Normalize
export const Vector2NormalizeTemplate: BlueprintNodeTemplate = {
    type: 'Vector2Normalize',
    title: 'Vector2 Normalize',
    category: 'math',
    description: 'Normalizes a vector to unit length',
    keywords: ['normalize', 'unit', 'vector'],
    menuPath: ['Math', 'Vector', 'Normalize'],
    isPure: true,
    inputs: [
        { name: 'vector', displayName: 'Vector', type: 'vector2' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'vector2' }
    ],
    color: '#2196F3'
};

export class Vector2NormalizeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const vector = ctx.evaluateInput(node.id, 'vector', Vector2.ZERO) as Vector2;
        return { outputs: { result: (vector ?? Vector2.ZERO).normalized() } };
    }
}

// Vector2 Dot
export const Vector2DotTemplate: BlueprintNodeTemplate = {
    type: 'Vector2Dot',
    title: 'Vector2 Dot',
    category: 'math',
    description: 'Calculates dot product',
    keywords: ['dot', 'product', 'vector'],
    menuPath: ['Math', 'Vector', 'Dot Product'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'vector2' },
        { name: 'b', displayName: 'B', type: 'vector2' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'float' }
    ],
    color: '#2196F3'
};

export class Vector2DotExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const a = ctx.evaluateInput(node.id, 'a', Vector2.ZERO) as Vector2;
        const b = ctx.evaluateInput(node.id, 'b', Vector2.ZERO) as Vector2;
        return { outputs: { result: Vector2.dot(a ?? Vector2.ZERO, b ?? Vector2.ZERO) } };
    }
}

// Vector2 Cross
export const Vector2CrossTemplate: BlueprintNodeTemplate = {
    type: 'Vector2Cross',
    title: 'Vector2 Cross',
    category: 'math',
    description: '2D cross product (returns scalar)',
    keywords: ['cross', 'product', 'vector'],
    menuPath: ['Math', 'Vector', 'Cross Product'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'vector2' },
        { name: 'b', displayName: 'B', type: 'vector2' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'float' }
    ],
    color: '#2196F3'
};

export class Vector2CrossExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const a = ctx.evaluateInput(node.id, 'a', Vector2.ZERO) as Vector2;
        const b = ctx.evaluateInput(node.id, 'b', Vector2.ZERO) as Vector2;
        return { outputs: { result: Vector2.cross(a ?? Vector2.ZERO, b ?? Vector2.ZERO) } };
    }
}

// Vector2 Distance
export const Vector2DistanceTemplate: BlueprintNodeTemplate = {
    type: 'Vector2Distance',
    title: 'Vector2 Distance',
    category: 'math',
    description: 'Distance between two points',
    keywords: ['distance', 'length', 'vector'],
    menuPath: ['Math', 'Vector', 'Distance'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'vector2' },
        { name: 'b', displayName: 'B', type: 'vector2' }
    ],
    outputs: [
        { name: 'distance', displayName: 'Distance', type: 'float' }
    ],
    color: '#2196F3'
};

export class Vector2DistanceExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const a = ctx.evaluateInput(node.id, 'a', Vector2.ZERO) as Vector2;
        const b = ctx.evaluateInput(node.id, 'b', Vector2.ZERO) as Vector2;
        return { outputs: { distance: Vector2.distance(a ?? Vector2.ZERO, b ?? Vector2.ZERO) } };
    }
}

// Vector2 Lerp
export const Vector2LerpTemplate: BlueprintNodeTemplate = {
    type: 'Vector2Lerp',
    title: 'Vector2 Lerp',
    category: 'math',
    description: 'Linear interpolation between two vectors',
    keywords: ['lerp', 'interpolate', 'vector'],
    menuPath: ['Math', 'Vector', 'Lerp'],
    isPure: true,
    inputs: [
        { name: 'a', displayName: 'A', type: 'vector2' },
        { name: 'b', displayName: 'B', type: 'vector2' },
        { name: 't', displayName: 'T', type: 'float', defaultValue: 0.5 }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'vector2' }
    ],
    color: '#2196F3'
};

export class Vector2LerpExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const a = ctx.evaluateInput(node.id, 'a', Vector2.ZERO) as Vector2;
        const b = ctx.evaluateInput(node.id, 'b', Vector2.ZERO) as Vector2;
        const t = Number(ctx.evaluateInput(node.id, 't', 0.5));
        return { outputs: { result: Vector2.lerp(a ?? Vector2.ZERO, b ?? Vector2.ZERO, t) } };
    }
}

// Vector2 Rotate
export const Vector2RotateTemplate: BlueprintNodeTemplate = {
    type: 'Vector2Rotate',
    title: 'Vector2 Rotate',
    category: 'math',
    description: 'Rotates a vector by angle (radians)',
    keywords: ['rotate', 'turn', 'vector'],
    menuPath: ['Math', 'Vector', 'Rotate'],
    isPure: true,
    inputs: [
        { name: 'vector', displayName: 'Vector', type: 'vector2' },
        { name: 'angle', displayName: 'Angle (rad)', type: 'float', defaultValue: 0 }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'vector2' }
    ],
    color: '#2196F3'
};

export class Vector2RotateExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const vector = ctx.evaluateInput(node.id, 'vector', Vector2.ZERO) as Vector2;
        const angle = Number(ctx.evaluateInput(node.id, 'angle', 0));
        return { outputs: { result: (vector ?? Vector2.ZERO).rotated(angle) } };
    }
}

// Vector2 From Angle
export const Vector2FromAngleTemplate: BlueprintNodeTemplate = {
    type: 'Vector2FromAngle',
    title: 'Vector2 From Angle',
    category: 'math',
    description: 'Creates unit vector from angle (radians)',
    keywords: ['from', 'angle', 'direction', 'vector'],
    menuPath: ['Math', 'Vector', 'From Angle'],
    isPure: true,
    inputs: [
        { name: 'angle', displayName: 'Angle (rad)', type: 'float', defaultValue: 0 }
    ],
    outputs: [
        { name: 'vector', displayName: 'Vector', type: 'vector2' }
    ],
    color: '#2196F3'
};

export class Vector2FromAngleExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as VectorContext;
        const angle = Number(ctx.evaluateInput(node.id, 'angle', 0));
        return { outputs: { vector: Vector2.fromAngle(angle) } };
    }
}

// Node definitions collection
export const VectorNodeDefinitions = [
    { template: MakeVector2Template, executor: new MakeVector2Executor() },
    { template: BreakVector2Template, executor: new BreakVector2Executor() },
    { template: Vector2AddTemplate, executor: new Vector2AddExecutor() },
    { template: Vector2SubtractTemplate, executor: new Vector2SubtractExecutor() },
    { template: Vector2ScaleTemplate, executor: new Vector2ScaleExecutor() },
    { template: Vector2LengthTemplate, executor: new Vector2LengthExecutor() },
    { template: Vector2NormalizeTemplate, executor: new Vector2NormalizeExecutor() },
    { template: Vector2DotTemplate, executor: new Vector2DotExecutor() },
    { template: Vector2CrossTemplate, executor: new Vector2CrossExecutor() },
    { template: Vector2DistanceTemplate, executor: new Vector2DistanceExecutor() },
    { template: Vector2LerpTemplate, executor: new Vector2LerpExecutor() },
    { template: Vector2RotateTemplate, executor: new Vector2RotateExecutor() },
    { template: Vector2FromAngleTemplate, executor: new Vector2FromAngleExecutor() }
];
