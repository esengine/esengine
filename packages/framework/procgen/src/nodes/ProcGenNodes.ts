/**
 * @zh 程序化生成蓝图节点
 * @en Procedural Generation Blueprint Nodes
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import { PerlinNoise } from '../noise/PerlinNoise';
import { SimplexNoise } from '../noise/SimplexNoise';
import { WorleyNoise } from '../noise/WorleyNoise';
import { FBM } from '../noise/FBM';
import { SeededRandom } from '../random/SeededRandom';
import { weightedPick } from '../random/WeightedRandom';
import type { WeightedItem } from '../random/WeightedRandom';
import { shuffle, pickOne, sample } from '../random/Shuffle';

// =============================================================================
// 噪声缓存 | Noise Cache
// =============================================================================

const noiseCache = new Map<string, PerlinNoise | SimplexNoise | WorleyNoise>();
const rngCache = new Map<number, SeededRandom>();

function getPerlinNoise(seed: number): PerlinNoise {
    const key = `perlin_${seed}`;
    if (!noiseCache.has(key)) {
        noiseCache.set(key, new PerlinNoise(seed));
    }
    return noiseCache.get(key) as PerlinNoise;
}

function getSimplexNoise(seed: number): SimplexNoise {
    const key = `simplex_${seed}`;
    if (!noiseCache.has(key)) {
        noiseCache.set(key, new SimplexNoise(seed));
    }
    return noiseCache.get(key) as SimplexNoise;
}

function getWorleyNoise(seed: number): WorleyNoise {
    const key = `worley_${seed}`;
    if (!noiseCache.has(key)) {
        noiseCache.set(key, new WorleyNoise(seed));
    }
    return noiseCache.get(key) as WorleyNoise;
}

function getSeededRandom(seed: number): SeededRandom {
    if (!rngCache.has(seed)) {
        rngCache.set(seed, new SeededRandom(seed));
    }
    return rngCache.get(seed)!;
}

// =============================================================================
// 执行上下文接口 | Execution Context Interface
// =============================================================================

interface ProcGenContext {
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
    setOutputs(nodeId: string, outputs: Record<string, unknown>): void;
}

// =============================================================================
// SampleNoise2D 节点 | SampleNoise2D Node
// =============================================================================

export const SampleNoise2DTemplate: BlueprintNodeTemplate = {
    type: 'SampleNoise2D',
    title: 'Sample Noise 2D',
    category: 'math',
    description: 'Sample 2D noise at coordinates / 在坐标处采样 2D 噪声',
    keywords: ['noise', 'perlin', 'simplex', 'random', 'procedural'],
    menuPath: ['Procedural', 'Noise', 'Sample Noise 2D'],
    isPure: true,
    inputs: [
        { name: 'x', displayName: 'X', type: 'float' },
        { name: 'y', displayName: 'Y', type: 'float' },
        { name: 'seed', displayName: 'Seed', type: 'int' },
        { name: 'noiseType', displayName: 'Type', type: 'string' }
    ],
    outputs: [
        { name: 'value', displayName: 'Value', type: 'float' }
    ],
    color: '#9c27b0'
};

export class SampleNoise2DExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ProcGenContext;
        const x = ctx.evaluateInput(node.id, 'x', 0) as number;
        const y = ctx.evaluateInput(node.id, 'y', 0) as number;
        const seed = ctx.evaluateInput(node.id, 'seed', 0) as number;
        const noiseType = ctx.evaluateInput(node.id, 'noiseType', 'perlin') as string;

        let value = 0;
        switch (noiseType.toLowerCase()) {
            case 'simplex':
                value = getSimplexNoise(seed).noise2D(x, y);
                break;
            case 'worley':
                value = getWorleyNoise(seed).noise2D(x, y);
                break;
            case 'perlin':
            default:
                value = getPerlinNoise(seed).noise2D(x, y);
                break;
        }

        return { outputs: { value } };
    }
}

// =============================================================================
// SampleFBM 节点 | SampleFBM Node
// =============================================================================

export const SampleFBMTemplate: BlueprintNodeTemplate = {
    type: 'SampleFBM',
    title: 'Sample FBM',
    category: 'math',
    description: 'Sample Fractal Brownian Motion noise / 采样分形布朗运动噪声',
    keywords: ['noise', 'fbm', 'fractal', 'octave', 'terrain'],
    menuPath: ['Procedural', 'Noise', 'Sample FBM'],
    isPure: true,
    inputs: [
        { name: 'x', displayName: 'X', type: 'float' },
        { name: 'y', displayName: 'Y', type: 'float' },
        { name: 'seed', displayName: 'Seed', type: 'int' },
        { name: 'octaves', displayName: 'Octaves', type: 'int' },
        { name: 'frequency', displayName: 'Frequency', type: 'float' },
        { name: 'persistence', displayName: 'Persistence', type: 'float' }
    ],
    outputs: [
        { name: 'value', displayName: 'Value', type: 'float' }
    ],
    color: '#9c27b0'
};

export class SampleFBMExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ProcGenContext;
        const x = ctx.evaluateInput(node.id, 'x', 0) as number;
        const y = ctx.evaluateInput(node.id, 'y', 0) as number;
        const seed = ctx.evaluateInput(node.id, 'seed', 0) as number;
        const octaves = ctx.evaluateInput(node.id, 'octaves', 6) as number;
        const frequency = ctx.evaluateInput(node.id, 'frequency', 1) as number;
        const persistence = ctx.evaluateInput(node.id, 'persistence', 0.5) as number;

        const noise = getPerlinNoise(seed);
        const fbm = new FBM(noise, { octaves, frequency, persistence });
        const value = fbm.noise2D(x, y);

        return { outputs: { value } };
    }
}

// =============================================================================
// SeededRandom 节点 | SeededRandom Node
// =============================================================================

export const SeededRandomTemplate: BlueprintNodeTemplate = {
    type: 'SeededRandom',
    title: 'Seeded Random',
    category: 'math',
    description: 'Generate deterministic random number / 生成确定性随机数',
    keywords: ['random', 'seed', 'deterministic', 'procedural'],
    menuPath: ['Procedural', 'Random', 'Seeded Random'],
    isPure: true,
    inputs: [
        { name: 'seed', displayName: 'Seed', type: 'int' },
        { name: 'index', displayName: 'Index', type: 'int' }
    ],
    outputs: [
        { name: 'value', displayName: 'Value', type: 'float' }
    ],
    color: '#9c27b0'
};

export class SeededRandomExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ProcGenContext;
        const seed = ctx.evaluateInput(node.id, 'seed', 0) as number;
        const index = ctx.evaluateInput(node.id, 'index', 0) as number;

        // Create deterministic value from seed and index
        const rng = new SeededRandom(seed + index * 12345);
        const value = rng.next();

        return { outputs: { value } };
    }
}

// =============================================================================
// SeededRandomInt 节点 | SeededRandomInt Node
// =============================================================================

export const SeededRandomIntTemplate: BlueprintNodeTemplate = {
    type: 'SeededRandomInt',
    title: 'Seeded Random Int',
    category: 'math',
    description: 'Generate deterministic random integer / 生成确定性随机整数',
    keywords: ['random', 'seed', 'integer', 'deterministic'],
    menuPath: ['Procedural', 'Random', 'Seeded Random Int'],
    isPure: true,
    inputs: [
        { name: 'seed', displayName: 'Seed', type: 'int' },
        { name: 'index', displayName: 'Index', type: 'int' },
        { name: 'min', displayName: 'Min', type: 'int' },
        { name: 'max', displayName: 'Max', type: 'int' }
    ],
    outputs: [
        { name: 'value', displayName: 'Value', type: 'int' }
    ],
    color: '#9c27b0'
};

export class SeededRandomIntExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ProcGenContext;
        const seed = ctx.evaluateInput(node.id, 'seed', 0) as number;
        const index = ctx.evaluateInput(node.id, 'index', 0) as number;
        const min = ctx.evaluateInput(node.id, 'min', 0) as number;
        const max = ctx.evaluateInput(node.id, 'max', 100) as number;

        const rng = new SeededRandom(seed + index * 12345);
        const value = rng.nextInt(min, max);

        return { outputs: { value } };
    }
}

// =============================================================================
// WeightedPick 节点 | WeightedPick Node
// =============================================================================

export const WeightedPickTemplate: BlueprintNodeTemplate = {
    type: 'WeightedPick',
    title: 'Weighted Pick',
    category: 'math',
    description: 'Pick from weighted options / 从加权选项中选择',
    keywords: ['random', 'weight', 'pick', 'select', 'loot'],
    menuPath: ['Procedural', 'Random', 'Weighted Pick'],
    isPure: true,
    inputs: [
        { name: 'seed', displayName: 'Seed', type: 'int' },
        { name: 'index', displayName: 'Index', type: 'int' },
        { name: 'items', displayName: 'Items', type: 'array' },
        { name: 'weights', displayName: 'Weights', type: 'array' }
    ],
    outputs: [
        { name: 'value', displayName: 'Value', type: 'any' },
        { name: 'selectedIndex', displayName: 'Index', type: 'int' }
    ],
    color: '#9c27b0'
};

export class WeightedPickExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ProcGenContext;
        const seed = ctx.evaluateInput(node.id, 'seed', 0) as number;
        const index = ctx.evaluateInput(node.id, 'index', 0) as number;
        const items = ctx.evaluateInput(node.id, 'items', []) as unknown[];
        const weights = ctx.evaluateInput(node.id, 'weights', []) as number[];

        if (items.length === 0) {
            return { outputs: { value: null, selectedIndex: -1 } };
        }

        const rng = new SeededRandom(seed + index * 12345);

        // Build weighted items
        const weightedItems: WeightedItem<{ value: unknown; index: number }>[] = items.map((item, i) => ({
            value: { value: item, index: i },
            weight: weights[i] ?? 1
        }));

        const result = weightedPick(weightedItems, rng);

        return { outputs: { value: result.value, selectedIndex: result.index } };
    }
}

// =============================================================================
// ShuffleArray 节点 | ShuffleArray Node
// =============================================================================

export const ShuffleArrayTemplate: BlueprintNodeTemplate = {
    type: 'ShuffleArray',
    title: 'Shuffle Array',
    category: 'math',
    description: 'Shuffle array with seed / 使用种子洗牌数组',
    keywords: ['random', 'shuffle', 'array', 'order'],
    menuPath: ['Procedural', 'Random', 'Shuffle Array'],
    isPure: true,
    inputs: [
        { name: 'seed', displayName: 'Seed', type: 'int' },
        { name: 'array', displayName: 'Array', type: 'array' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'array' }
    ],
    color: '#9c27b0'
};

export class ShuffleArrayExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ProcGenContext;
        const seed = ctx.evaluateInput(node.id, 'seed', 0) as number;
        const array = ctx.evaluateInput(node.id, 'array', []) as unknown[];

        const rng = new SeededRandom(seed);
        const result = shuffle([...array], rng);

        return { outputs: { result } };
    }
}

// =============================================================================
// PickRandom 节点 | PickRandom Node
// =============================================================================

export const PickRandomTemplate: BlueprintNodeTemplate = {
    type: 'PickRandom',
    title: 'Pick Random',
    category: 'math',
    description: 'Pick random element from array / 从数组中随机选择元素',
    keywords: ['random', 'pick', 'array', 'select'],
    menuPath: ['Procedural', 'Random', 'Pick Random'],
    isPure: true,
    inputs: [
        { name: 'seed', displayName: 'Seed', type: 'int' },
        { name: 'index', displayName: 'Index', type: 'int' },
        { name: 'array', displayName: 'Array', type: 'array' }
    ],
    outputs: [
        { name: 'value', displayName: 'Value', type: 'any' }
    ],
    color: '#9c27b0'
};

export class PickRandomExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ProcGenContext;
        const seed = ctx.evaluateInput(node.id, 'seed', 0) as number;
        const index = ctx.evaluateInput(node.id, 'index', 0) as number;
        const array = ctx.evaluateInput(node.id, 'array', []) as unknown[];

        if (array.length === 0) {
            return { outputs: { value: null } };
        }

        const rng = new SeededRandom(seed + index * 12345);
        const value = pickOne(array, rng);

        return { outputs: { value } };
    }
}

// =============================================================================
// SampleArray 节点 | SampleArray Node
// =============================================================================

export const SampleArrayTemplate: BlueprintNodeTemplate = {
    type: 'SampleArray',
    title: 'Sample Array',
    category: 'math',
    description: 'Sample N unique elements from array / 从数组中采样 N 个不重复元素',
    keywords: ['random', 'sample', 'array', 'unique'],
    menuPath: ['Procedural', 'Random', 'Sample Array'],
    isPure: true,
    inputs: [
        { name: 'seed', displayName: 'Seed', type: 'int' },
        { name: 'array', displayName: 'Array', type: 'array' },
        { name: 'count', displayName: 'Count', type: 'int' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'array' }
    ],
    color: '#9c27b0'
};

export class SampleArrayExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ProcGenContext;
        const seed = ctx.evaluateInput(node.id, 'seed', 0) as number;
        const array = ctx.evaluateInput(node.id, 'array', []) as unknown[];
        const count = ctx.evaluateInput(node.id, 'count', 1) as number;

        if (array.length === 0 || count <= 0) {
            return { outputs: { result: [] } };
        }

        const rng = new SeededRandom(seed);
        const actualCount = Math.min(count, array.length);
        const result = sample(array, actualCount, rng);

        return { outputs: { result } };
    }
}

// =============================================================================
// RandomPointInCircle 节点 | RandomPointInCircle Node
// =============================================================================

export const RandomPointInCircleTemplate: BlueprintNodeTemplate = {
    type: 'RandomPointInCircle',
    title: 'Random Point In Circle',
    category: 'math',
    description: 'Generate random point inside circle / 在圆内生成随机点',
    keywords: ['random', 'point', 'circle', 'position'],
    menuPath: ['Procedural', 'Random', 'Random Point In Circle'],
    isPure: true,
    inputs: [
        { name: 'seed', displayName: 'Seed', type: 'int' },
        { name: 'index', displayName: 'Index', type: 'int' },
        { name: 'centerX', displayName: 'Center X', type: 'float' },
        { name: 'centerY', displayName: 'Center Y', type: 'float' },
        { name: 'radius', displayName: 'Radius', type: 'float' }
    ],
    outputs: [
        { name: 'x', displayName: 'X', type: 'float' },
        { name: 'y', displayName: 'Y', type: 'float' }
    ],
    color: '#9c27b0'
};

export class RandomPointInCircleExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ProcGenContext;
        const seed = ctx.evaluateInput(node.id, 'seed', 0) as number;
        const index = ctx.evaluateInput(node.id, 'index', 0) as number;
        const centerX = ctx.evaluateInput(node.id, 'centerX', 0) as number;
        const centerY = ctx.evaluateInput(node.id, 'centerY', 0) as number;
        const radius = ctx.evaluateInput(node.id, 'radius', 1) as number;

        const rng = new SeededRandom(seed + index * 12345);
        const point = rng.nextPointInCircle(radius);

        return {
            outputs: {
                x: centerX + point.x,
                y: centerY + point.y
            }
        };
    }
}

// =============================================================================
// 节点定义集合 | Node Definition Collection
// =============================================================================

export const ProcGenNodeDefinitions = {
    templates: [
        SampleNoise2DTemplate,
        SampleFBMTemplate,
        SeededRandomTemplate,
        SeededRandomIntTemplate,
        WeightedPickTemplate,
        ShuffleArrayTemplate,
        PickRandomTemplate,
        SampleArrayTemplate,
        RandomPointInCircleTemplate
    ],
    executors: new Map<string, INodeExecutor>([
        ['SampleNoise2D', new SampleNoise2DExecutor()],
        ['SampleFBM', new SampleFBMExecutor()],
        ['SeededRandom', new SeededRandomExecutor()],
        ['SeededRandomInt', new SeededRandomIntExecutor()],
        ['WeightedPick', new WeightedPickExecutor()],
        ['ShuffleArray', new ShuffleArrayExecutor()],
        ['PickRandom', new PickRandomExecutor()],
        ['SampleArray', new SampleArrayExecutor()],
        ['RandomPointInCircle', new RandomPointInCircleExecutor()]
    ])
};
