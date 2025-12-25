/**
 * @zh 空间查询蓝图节点
 * @en Spatial Query Blueprint Nodes
 *
 * @zh 提供空间查询功能的蓝图节点
 * @en Provides blueprint nodes for spatial query functionality
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import type { ISpatialQuery, IBounds } from '../ISpatialQuery';

// =============================================================================
// 执行上下文接口 | Execution Context Interface
// =============================================================================

/**
 * @zh 空间查询上下文
 * @en Spatial query context
 */
interface SpatialContext {
    spatialQuery: ISpatialQuery<unknown>;
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
    setOutputs(nodeId: string, outputs: Record<string, unknown>): void;
}

// =============================================================================
// FindInRadius 节点 | FindInRadius Node
// =============================================================================

/**
 * @zh FindInRadius 节点模板
 * @en FindInRadius node template
 */
export const FindInRadiusTemplate: BlueprintNodeTemplate = {
    type: 'FindInRadius',
    title: 'Find In Radius',
    category: 'entity',
    description: 'Find all objects within radius / 查找半径内的所有对象',
    keywords: ['spatial', 'find', 'radius', 'range', 'query'],
    menuPath: ['Spatial', 'Find In Radius'],
    isPure: true,
    inputs: [
        {
            name: 'centerX',
            displayName: 'Center X',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'centerY',
            displayName: 'Center Y',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'radius',
            displayName: 'Radius',
            type: 'float',
            defaultValue: 100
        }
    ],
    outputs: [
        {
            name: 'results',
            displayName: 'Results',
            type: 'array'
        },
        {
            name: 'count',
            displayName: 'Count',
            type: 'int'
        }
    ],
    color: '#4a9eff'
};

/**
 * @zh FindInRadius 节点执行器
 * @en FindInRadius node executor
 */
export class FindInRadiusExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as SpatialContext;
        const centerX = ctx.evaluateInput(node.id, 'centerX', 0) as number;
        const centerY = ctx.evaluateInput(node.id, 'centerY', 0) as number;
        const radius = ctx.evaluateInput(node.id, 'radius', 100) as number;

        const results = ctx.spatialQuery?.findInRadius({ x: centerX, y: centerY }, radius) ?? [];

        return {
            outputs: {
                results,
                count: results.length
            }
        };
    }
}

// =============================================================================
// FindInRect 节点 | FindInRect Node
// =============================================================================

/**
 * @zh FindInRect 节点模板
 * @en FindInRect node template
 */
export const FindInRectTemplate: BlueprintNodeTemplate = {
    type: 'FindInRect',
    title: 'Find In Rect',
    category: 'entity',
    description: 'Find all objects within rectangle / 查找矩形区域内的所有对象',
    keywords: ['spatial', 'find', 'rect', 'rectangle', 'area', 'query'],
    menuPath: ['Spatial', 'Find In Rect'],
    isPure: true,
    inputs: [
        {
            name: 'minX',
            displayName: 'Min X',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'minY',
            displayName: 'Min Y',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'maxX',
            displayName: 'Max X',
            type: 'float',
            defaultValue: 100
        },
        {
            name: 'maxY',
            displayName: 'Max Y',
            type: 'float',
            defaultValue: 100
        }
    ],
    outputs: [
        {
            name: 'results',
            displayName: 'Results',
            type: 'array'
        },
        {
            name: 'count',
            displayName: 'Count',
            type: 'int'
        }
    ],
    color: '#4a9eff'
};

/**
 * @zh FindInRect 节点执行器
 * @en FindInRect node executor
 */
export class FindInRectExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as SpatialContext;
        const minX = ctx.evaluateInput(node.id, 'minX', 0) as number;
        const minY = ctx.evaluateInput(node.id, 'minY', 0) as number;
        const maxX = ctx.evaluateInput(node.id, 'maxX', 100) as number;
        const maxY = ctx.evaluateInput(node.id, 'maxY', 100) as number;

        const bounds: IBounds = { minX, minY, maxX, maxY };
        const results = ctx.spatialQuery?.findInRect(bounds) ?? [];

        return {
            outputs: {
                results,
                count: results.length
            }
        };
    }
}

// =============================================================================
// FindNearest 节点 | FindNearest Node
// =============================================================================

/**
 * @zh FindNearest 节点模板
 * @en FindNearest node template
 */
export const FindNearestTemplate: BlueprintNodeTemplate = {
    type: 'FindNearest',
    title: 'Find Nearest',
    category: 'entity',
    description: 'Find nearest object to a point / 查找距离点最近的对象',
    keywords: ['spatial', 'find', 'nearest', 'closest', 'query'],
    menuPath: ['Spatial', 'Find Nearest'],
    isPure: true,
    inputs: [
        {
            name: 'centerX',
            displayName: 'Center X',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'centerY',
            displayName: 'Center Y',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'maxDistance',
            displayName: 'Max Distance',
            type: 'float',
            defaultValue: 1000
        }
    ],
    outputs: [
        {
            name: 'result',
            displayName: 'Result',
            type: 'any'
        },
        {
            name: 'found',
            displayName: 'Found',
            type: 'bool'
        }
    ],
    color: '#4a9eff'
};

/**
 * @zh FindNearest 节点执行器
 * @en FindNearest node executor
 */
export class FindNearestExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as SpatialContext;
        const centerX = ctx.evaluateInput(node.id, 'centerX', 0) as number;
        const centerY = ctx.evaluateInput(node.id, 'centerY', 0) as number;
        const maxDistance = ctx.evaluateInput(node.id, 'maxDistance', 1000) as number;

        const result = ctx.spatialQuery?.findNearest({ x: centerX, y: centerY }, maxDistance) ?? null;

        return {
            outputs: {
                result,
                found: result !== null
            }
        };
    }
}

// =============================================================================
// FindKNearest 节点 | FindKNearest Node
// =============================================================================

/**
 * @zh FindKNearest 节点模板
 * @en FindKNearest node template
 */
export const FindKNearestTemplate: BlueprintNodeTemplate = {
    type: 'FindKNearest',
    title: 'Find K Nearest',
    category: 'entity',
    description: 'Find K nearest objects to a point / 查找距离点最近的 K 个对象',
    keywords: ['spatial', 'find', 'nearest', 'k', 'query'],
    menuPath: ['Spatial', 'Find K Nearest'],
    isPure: true,
    inputs: [
        {
            name: 'centerX',
            displayName: 'Center X',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'centerY',
            displayName: 'Center Y',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'k',
            displayName: 'K',
            type: 'int',
            defaultValue: 5
        },
        {
            name: 'maxDistance',
            displayName: 'Max Distance',
            type: 'float',
            defaultValue: 1000
        }
    ],
    outputs: [
        {
            name: 'results',
            displayName: 'Results',
            type: 'array'
        },
        {
            name: 'count',
            displayName: 'Count',
            type: 'int'
        }
    ],
    color: '#4a9eff'
};

/**
 * @zh FindKNearest 节点执行器
 * @en FindKNearest node executor
 */
export class FindKNearestExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as SpatialContext;
        const centerX = ctx.evaluateInput(node.id, 'centerX', 0) as number;
        const centerY = ctx.evaluateInput(node.id, 'centerY', 0) as number;
        const k = ctx.evaluateInput(node.id, 'k', 5) as number;
        const maxDistance = ctx.evaluateInput(node.id, 'maxDistance', 1000) as number;

        const results = ctx.spatialQuery?.findKNearest({ x: centerX, y: centerY }, k, maxDistance) ?? [];

        return {
            outputs: {
                results,
                count: results.length
            }
        };
    }
}

// =============================================================================
// Raycast 节点 | Raycast Node
// =============================================================================

/**
 * @zh Raycast 节点模板
 * @en Raycast node template
 */
export const RaycastTemplate: BlueprintNodeTemplate = {
    type: 'Raycast',
    title: 'Raycast',
    category: 'entity',
    description: 'Cast a ray and get all hits / 发射射线并获取所有命中',
    keywords: ['spatial', 'raycast', 'ray', 'hit', 'query'],
    menuPath: ['Spatial', 'Raycast'],
    isPure: true,
    inputs: [
        {
            name: 'originX',
            displayName: 'Origin X',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'originY',
            displayName: 'Origin Y',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'directionX',
            displayName: 'Direction X',
            type: 'float',
            defaultValue: 1
        },
        {
            name: 'directionY',
            displayName: 'Direction Y',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'maxDistance',
            displayName: 'Max Distance',
            type: 'float',
            defaultValue: 1000
        }
    ],
    outputs: [
        {
            name: 'hits',
            displayName: 'Hits',
            type: 'array'
        },
        {
            name: 'hitCount',
            displayName: 'Hit Count',
            type: 'int'
        },
        {
            name: 'hasHit',
            displayName: 'Has Hit',
            type: 'bool'
        }
    ],
    color: '#4a9eff'
};

/**
 * @zh Raycast 节点执行器
 * @en Raycast node executor
 */
export class RaycastExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as SpatialContext;
        const originX = ctx.evaluateInput(node.id, 'originX', 0) as number;
        const originY = ctx.evaluateInput(node.id, 'originY', 0) as number;
        const directionX = ctx.evaluateInput(node.id, 'directionX', 1) as number;
        const directionY = ctx.evaluateInput(node.id, 'directionY', 0) as number;
        const maxDistance = ctx.evaluateInput(node.id, 'maxDistance', 1000) as number;

        const hits = ctx.spatialQuery?.raycast(
            { x: originX, y: originY },
            { x: directionX, y: directionY },
            maxDistance
        ) ?? [];

        return {
            outputs: {
                hits,
                hitCount: hits.length,
                hasHit: hits.length > 0
            }
        };
    }
}

/**
 * @zh RaycastFirst 节点模板
 * @en RaycastFirst node template
 */
export const RaycastFirstTemplate: BlueprintNodeTemplate = {
    type: 'RaycastFirst',
    title: 'Raycast First',
    category: 'entity',
    description: 'Cast a ray and get first hit / 发射射线并获取第一个命中',
    keywords: ['spatial', 'raycast', 'ray', 'first', 'hit', 'query'],
    menuPath: ['Spatial', 'Raycast First'],
    isPure: true,
    inputs: [
        {
            name: 'originX',
            displayName: 'Origin X',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'originY',
            displayName: 'Origin Y',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'directionX',
            displayName: 'Direction X',
            type: 'float',
            defaultValue: 1
        },
        {
            name: 'directionY',
            displayName: 'Direction Y',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'maxDistance',
            displayName: 'Max Distance',
            type: 'float',
            defaultValue: 1000
        }
    ],
    outputs: [
        {
            name: 'hit',
            displayName: 'Hit',
            type: 'object'
        },
        {
            name: 'target',
            displayName: 'Target',
            type: 'any'
        },
        {
            name: 'hitPointX',
            displayName: 'Hit Point X',
            type: 'float'
        },
        {
            name: 'hitPointY',
            displayName: 'Hit Point Y',
            type: 'float'
        },
        {
            name: 'distance',
            displayName: 'Distance',
            type: 'float'
        },
        {
            name: 'hasHit',
            displayName: 'Has Hit',
            type: 'bool'
        }
    ],
    color: '#4a9eff'
};

/**
 * @zh RaycastFirst 节点执行器
 * @en RaycastFirst node executor
 */
export class RaycastFirstExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as SpatialContext;
        const originX = ctx.evaluateInput(node.id, 'originX', 0) as number;
        const originY = ctx.evaluateInput(node.id, 'originY', 0) as number;
        const directionX = ctx.evaluateInput(node.id, 'directionX', 1) as number;
        const directionY = ctx.evaluateInput(node.id, 'directionY', 0) as number;
        const maxDistance = ctx.evaluateInput(node.id, 'maxDistance', 1000) as number;

        const hit = ctx.spatialQuery?.raycastFirst(
            { x: originX, y: originY },
            { x: directionX, y: directionY },
            maxDistance
        ) ?? null;

        return {
            outputs: {
                hit,
                target: hit?.target ?? null,
                hitPointX: hit?.point.x ?? 0,
                hitPointY: hit?.point.y ?? 0,
                distance: hit?.distance ?? 0,
                hasHit: hit !== null
            }
        };
    }
}

// =============================================================================
// 节点定义集合 | Node Definition Collection
// =============================================================================

/**
 * @zh 空间查询节点定义
 * @en Spatial query node definitions
 */
export const SpatialQueryNodeDefinitions = [
    { template: FindInRadiusTemplate, executor: new FindInRadiusExecutor() },
    { template: FindInRectTemplate, executor: new FindInRectExecutor() },
    { template: FindNearestTemplate, executor: new FindNearestExecutor() },
    { template: FindKNearestTemplate, executor: new FindKNearestExecutor() },
    { template: RaycastTemplate, executor: new RaycastExecutor() },
    { template: RaycastFirstTemplate, executor: new RaycastFirstExecutor() }
];
