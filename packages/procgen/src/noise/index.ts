/**
 * @zh 噪声函数模块
 * @en Noise Functions Module
 */

export { PerlinNoise, createPerlinNoise } from './PerlinNoise';
export { SimplexNoise, createSimplexNoise } from './SimplexNoise';
export { WorleyNoise, createWorleyNoise } from './WorleyNoise';
export type { DistanceFunction } from './WorleyNoise';
export { FBM, createFBM } from './FBM';
export type { INoise2D, INoise3D, FBMConfig } from './FBM';
