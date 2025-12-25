/**
 * @esengine/procgen
 *
 * @zh 程序化生成工具包
 * @en Procedural Generation Toolkit
 *
 * @zh 提供噪声函数、随机工具和蓝图节点
 * @en Provides noise functions, random utilities, and blueprint nodes
 */

// =============================================================================
// Noise Functions | 噪声函数
// =============================================================================

export {
    PerlinNoise,
    createPerlinNoise,
    SimplexNoise,
    createSimplexNoise,
    WorleyNoise,
    createWorleyNoise,
    FBM,
    createFBM
} from './noise';

export type {
    DistanceFunction,
    INoise2D,
    INoise3D,
    FBMConfig
} from './noise';

// =============================================================================
// Random Utilities | 随机工具
// =============================================================================

export {
    SeededRandom,
    createSeededRandom,
    WeightedRandom,
    weightedPick,
    weightedPickFromMap,
    createWeightedRandom,
    shuffle,
    shuffleCopy,
    pickOne,
    sample,
    sampleWithReplacement,
    randomIntegers,
    weightedSample
} from './random';

export type { WeightedItem } from './random';

// =============================================================================
// Blueprint Nodes | 蓝图节点
// =============================================================================

export {
    // Templates
    SampleNoise2DTemplate,
    SampleFBMTemplate,
    SeededRandomTemplate,
    SeededRandomIntTemplate,
    WeightedPickTemplate,
    ShuffleArrayTemplate,
    PickRandomTemplate,
    SampleArrayTemplate,
    RandomPointInCircleTemplate,
    // Executors
    SampleNoise2DExecutor,
    SampleFBMExecutor,
    SeededRandomExecutor,
    SeededRandomIntExecutor,
    WeightedPickExecutor,
    ShuffleArrayExecutor,
    PickRandomExecutor,
    SampleArrayExecutor,
    RandomPointInCircleExecutor,
    // Collection
    ProcGenNodeDefinitions
} from './nodes';
