/**
 * @zh 寻路系统蓝图节点
 * @en Pathfinding System Blueprint Nodes
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import type { IPathResult, IPoint } from '../core/IPathfinding';

// =============================================================================
// 执行上下文接口 | Execution Context Interface
// =============================================================================

interface PathfindingContext {
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
    setOutputs(nodeId: string, outputs: Record<string, unknown>): void;
    findPath(startX: number, startY: number, endX: number, endY: number): IPathResult;
    findPathSmooth(startX: number, startY: number, endX: number, endY: number): IPathResult;
    isWalkable(x: number, y: number): boolean;
    getPathDistance(path: IPoint[]): number;
}

// =============================================================================
// FindPath 节点 | FindPath Node
// =============================================================================

export const FindPathTemplate: BlueprintNodeTemplate = {
    type: 'FindPath',
    title: 'Find Path',
    category: 'custom',
    description: 'Find path from start to end / 从起点到终点寻路',
    keywords: ['path', 'pathfinding', 'astar', 'navigate', 'route'],
    menuPath: ['Pathfinding', 'Find Path'],
    inputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'startX', displayName: 'Start X', type: 'float' },
        { name: 'startY', displayName: 'Start Y', type: 'float' },
        { name: 'endX', displayName: 'End X', type: 'float' },
        { name: 'endY', displayName: 'End Y', type: 'float' }
    ],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'found', displayName: 'Found', type: 'bool' },
        { name: 'path', displayName: 'Path', type: 'array' },
        { name: 'cost', displayName: 'Cost', type: 'float' }
    ],
    color: '#4caf50'
};

export class FindPathExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as PathfindingContext;
        const startX = ctx.evaluateInput(node.id, 'startX', 0) as number;
        const startY = ctx.evaluateInput(node.id, 'startY', 0) as number;
        const endX = ctx.evaluateInput(node.id, 'endX', 0) as number;
        const endY = ctx.evaluateInput(node.id, 'endY', 0) as number;

        const result = ctx.findPath(startX, startY, endX, endY);

        return {
            outputs: {
                found: result.found,
                path: result.path,
                cost: result.cost
            },
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// FindPathSmooth 节点 | FindPathSmooth Node
// =============================================================================

export const FindPathSmoothTemplate: BlueprintNodeTemplate = {
    type: 'FindPathSmooth',
    title: 'Find Path (Smooth)',
    category: 'custom',
    description: 'Find path with smoothing / 寻路并平滑路径',
    keywords: ['path', 'pathfinding', 'smooth', 'navigate'],
    menuPath: ['Pathfinding', 'Find Path (Smooth)'],
    inputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'startX', displayName: 'Start X', type: 'float' },
        { name: 'startY', displayName: 'Start Y', type: 'float' },
        { name: 'endX', displayName: 'End X', type: 'float' },
        { name: 'endY', displayName: 'End Y', type: 'float' }
    ],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'found', displayName: 'Found', type: 'bool' },
        { name: 'path', displayName: 'Path', type: 'array' },
        { name: 'cost', displayName: 'Cost', type: 'float' }
    ],
    color: '#4caf50'
};

export class FindPathSmoothExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as PathfindingContext;
        const startX = ctx.evaluateInput(node.id, 'startX', 0) as number;
        const startY = ctx.evaluateInput(node.id, 'startY', 0) as number;
        const endX = ctx.evaluateInput(node.id, 'endX', 0) as number;
        const endY = ctx.evaluateInput(node.id, 'endY', 0) as number;

        const result = ctx.findPathSmooth(startX, startY, endX, endY);

        return {
            outputs: {
                found: result.found,
                path: result.path,
                cost: result.cost
            },
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// IsWalkable 节点 | IsWalkable Node
// =============================================================================

export const IsWalkableTemplate: BlueprintNodeTemplate = {
    type: 'IsWalkable',
    title: 'Is Walkable',
    category: 'custom',
    description: 'Check if position is walkable / 检查位置是否可通行',
    keywords: ['walkable', 'obstacle', 'blocked', 'terrain'],
    menuPath: ['Pathfinding', 'Is Walkable'],
    isPure: true,
    inputs: [
        { name: 'x', displayName: 'X', type: 'float' },
        { name: 'y', displayName: 'Y', type: 'float' }
    ],
    outputs: [
        { name: 'walkable', displayName: 'Walkable', type: 'bool' }
    ],
    color: '#4caf50'
};

export class IsWalkableExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as PathfindingContext;
        const x = ctx.evaluateInput(node.id, 'x', 0) as number;
        const y = ctx.evaluateInput(node.id, 'y', 0) as number;

        const walkable = ctx.isWalkable(x, y);

        return { outputs: { walkable } };
    }
}

// =============================================================================
// GetPathLength 节点 | GetPathLength Node
// =============================================================================

export const GetPathLengthTemplate: BlueprintNodeTemplate = {
    type: 'GetPathLength',
    title: 'Get Path Length',
    category: 'custom',
    description: 'Get the number of points in path / 获取路径点数量',
    keywords: ['path', 'length', 'count', 'waypoints'],
    menuPath: ['Pathfinding', 'Get Path Length'],
    isPure: true,
    inputs: [
        { name: 'path', displayName: 'Path', type: 'array' }
    ],
    outputs: [
        { name: 'length', displayName: 'Length', type: 'int' }
    ],
    color: '#4caf50'
};

export class GetPathLengthExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as PathfindingContext;
        const path = ctx.evaluateInput(node.id, 'path', []) as IPoint[];

        return { outputs: { length: path.length } };
    }
}

// =============================================================================
// GetPathDistance 节点 | GetPathDistance Node
// =============================================================================

export const GetPathDistanceTemplate: BlueprintNodeTemplate = {
    type: 'GetPathDistance',
    title: 'Get Path Distance',
    category: 'custom',
    description: 'Get total path distance / 获取路径总距离',
    keywords: ['path', 'distance', 'length', 'travel'],
    menuPath: ['Pathfinding', 'Get Path Distance'],
    isPure: true,
    inputs: [
        { name: 'path', displayName: 'Path', type: 'array' }
    ],
    outputs: [
        { name: 'distance', displayName: 'Distance', type: 'float' }
    ],
    color: '#4caf50'
};

export class GetPathDistanceExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as PathfindingContext;
        const path = ctx.evaluateInput(node.id, 'path', []) as IPoint[];

        const distance = ctx.getPathDistance(path);

        return { outputs: { distance } };
    }
}

// =============================================================================
// GetPathPoint 节点 | GetPathPoint Node
// =============================================================================

export const GetPathPointTemplate: BlueprintNodeTemplate = {
    type: 'GetPathPoint',
    title: 'Get Path Point',
    category: 'custom',
    description: 'Get point at index in path / 获取路径中指定索引的点',
    keywords: ['path', 'point', 'waypoint', 'index'],
    menuPath: ['Pathfinding', 'Get Path Point'],
    isPure: true,
    inputs: [
        { name: 'path', displayName: 'Path', type: 'array' },
        { name: 'index', displayName: 'Index', type: 'int' }
    ],
    outputs: [
        { name: 'x', displayName: 'X', type: 'float' },
        { name: 'y', displayName: 'Y', type: 'float' },
        { name: 'valid', displayName: 'Valid', type: 'bool' }
    ],
    color: '#4caf50'
};

export class GetPathPointExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as PathfindingContext;
        const path = ctx.evaluateInput(node.id, 'path', []) as IPoint[];
        const index = ctx.evaluateInput(node.id, 'index', 0) as number;

        if (index >= 0 && index < path.length) {
            return {
                outputs: {
                    x: path[index].x,
                    y: path[index].y,
                    valid: true
                }
            };
        }

        return {
            outputs: {
                x: 0,
                y: 0,
                valid: false
            }
        };
    }
}

// =============================================================================
// MoveAlongPath 节点 | MoveAlongPath Node
// =============================================================================

export const MoveAlongPathTemplate: BlueprintNodeTemplate = {
    type: 'MoveAlongPath',
    title: 'Move Along Path',
    category: 'custom',
    description: 'Get position along path at progress / 获取路径上指定进度的位置',
    keywords: ['path', 'move', 'lerp', 'progress', 'interpolate'],
    menuPath: ['Pathfinding', 'Move Along Path'],
    isPure: true,
    inputs: [
        { name: 'path', displayName: 'Path', type: 'array' },
        { name: 'progress', displayName: 'Progress (0-1)', type: 'float' }
    ],
    outputs: [
        { name: 'x', displayName: 'X', type: 'float' },
        { name: 'y', displayName: 'Y', type: 'float' }
    ],
    color: '#4caf50'
};

export class MoveAlongPathExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as PathfindingContext;
        const path = ctx.evaluateInput(node.id, 'path', []) as IPoint[];
        let progress = ctx.evaluateInput(node.id, 'progress', 0) as number;

        if (path.length === 0) {
            return { outputs: { x: 0, y: 0 } };
        }

        if (path.length === 1) {
            return { outputs: { x: path[0].x, y: path[0].y } };
        }

        // Clamp progress
        progress = Math.max(0, Math.min(1, progress));

        // Calculate total distance
        let totalDistance = 0;
        const segmentDistances: number[] = [];

        for (let i = 1; i < path.length; i++) {
            const dx = path[i].x - path[i - 1].x;
            const dy = path[i].y - path[i - 1].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            segmentDistances.push(dist);
            totalDistance += dist;
        }

        if (totalDistance === 0) {
            return { outputs: { x: path[0].x, y: path[0].y } };
        }

        // Find the segment and position
        const targetDistance = progress * totalDistance;
        let accumulatedDistance = 0;

        for (let i = 0; i < segmentDistances.length; i++) {
            const segmentDist = segmentDistances[i];

            if (accumulatedDistance + segmentDist >= targetDistance) {
                const segmentProgress = (targetDistance - accumulatedDistance) / segmentDist;
                const x = path[i].x + (path[i + 1].x - path[i].x) * segmentProgress;
                const y = path[i].y + (path[i + 1].y - path[i].y) * segmentProgress;
                return { outputs: { x, y } };
            }

            accumulatedDistance += segmentDist;
        }

        // Return last point
        const last = path[path.length - 1];
        return { outputs: { x: last.x, y: last.y } };
    }
}

// =============================================================================
// HasLineOfSight 节点 | HasLineOfSight Node
// =============================================================================

export const HasLineOfSightTemplate: BlueprintNodeTemplate = {
    type: 'HasLineOfSight',
    title: 'Has Line of Sight',
    category: 'custom',
    description: 'Check if there is a clear line between two points / 检查两点之间是否有清晰的视线',
    keywords: ['line', 'sight', 'los', 'visibility', 'raycast'],
    menuPath: ['Pathfinding', 'Has Line of Sight'],
    isPure: true,
    inputs: [
        { name: 'startX', displayName: 'Start X', type: 'float' },
        { name: 'startY', displayName: 'Start Y', type: 'float' },
        { name: 'endX', displayName: 'End X', type: 'float' },
        { name: 'endY', displayName: 'End Y', type: 'float' }
    ],
    outputs: [
        { name: 'hasLOS', displayName: 'Has LOS', type: 'bool' }
    ],
    color: '#4caf50'
};

export class HasLineOfSightExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as PathfindingContext & {
            hasLineOfSight?(x1: number, y1: number, x2: number, y2: number): boolean;
        };

        const startX = ctx.evaluateInput(node.id, 'startX', 0) as number;
        const startY = ctx.evaluateInput(node.id, 'startY', 0) as number;
        const endX = ctx.evaluateInput(node.id, 'endX', 0) as number;
        const endY = ctx.evaluateInput(node.id, 'endY', 0) as number;

        const hasLOS = ctx.hasLineOfSight?.(startX, startY, endX, endY) ?? true;

        return { outputs: { hasLOS } };
    }
}

// =============================================================================
// 节点定义集合 | Node Definition Collection
// =============================================================================

export const PathfindingNodeDefinitions = {
    templates: [
        FindPathTemplate,
        FindPathSmoothTemplate,
        IsWalkableTemplate,
        GetPathLengthTemplate,
        GetPathDistanceTemplate,
        GetPathPointTemplate,
        MoveAlongPathTemplate,
        HasLineOfSightTemplate
    ],
    executors: new Map<string, INodeExecutor>([
        ['FindPath', new FindPathExecutor()],
        ['FindPathSmooth', new FindPathSmoothExecutor()],
        ['IsWalkable', new IsWalkableExecutor()],
        ['GetPathLength', new GetPathLengthExecutor()],
        ['GetPathDistance', new GetPathDistanceExecutor()],
        ['GetPathPoint', new GetPathPointExecutor()],
        ['MoveAlongPath', new MoveAlongPathExecutor()],
        ['HasLineOfSight', new HasLineOfSightExecutor()]
    ])
};
