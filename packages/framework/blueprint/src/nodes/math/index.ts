/**
 * Math Nodes - Mathematical operation nodes
 * 数学节点 - 数学运算节点
 */

export * from './MathOperations';
export * from './VectorNodes';
export * from './FixedNodes';
export * from './FixedVectorNodes';
export * from './ColorNodes';

import { VectorNodeDefinitions } from './VectorNodes';
import { FixedNodeDefinitions } from './FixedNodes';
import { FixedVectorNodeDefinitions } from './FixedVectorNodes';
import { ColorNodeDefinitions } from './ColorNodes';

/**
 * @zh 数学库蓝图节点定义集合（Vector / Fixed / Color）
 * @en Math library blueprint node definitions (Vector / Fixed / Color)
 */
export const MathLibraryNodeDefinitions = [
    ...VectorNodeDefinitions,
    ...FixedNodeDefinitions,
    ...FixedVectorNodeDefinitions,
    ...ColorNodeDefinitions
];
