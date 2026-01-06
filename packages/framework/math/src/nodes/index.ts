/**
 * @zh 数学库蓝图节点
 * @en Math Library Blueprint Nodes
 *
 * @zh 导出所有数学相关的蓝图节点
 * @en Exports all math-related blueprint nodes
 */

export * from './VectorNodes';
export * from './FixedNodes';
export * from './FixedVectorNodes';
export * from './ColorNodes';

// Re-export node definition collections
import { VectorNodeDefinitions } from './VectorNodes';
import { FixedNodeDefinitions } from './FixedNodes';
import { FixedVectorNodeDefinitions } from './FixedVectorNodes';
import { ColorNodeDefinitions } from './ColorNodes';

/**
 * @zh 所有数学库蓝图节点定义
 * @en All math library blueprint node definitions
 */
export const MathNodeDefinitions = [
    ...VectorNodeDefinitions,
    ...FixedNodeDefinitions,
    ...FixedVectorNodeDefinitions,
    ...ColorNodeDefinitions
];
