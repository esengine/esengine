/**
 * @zh 增量寻路蓝图节点
 * @en Incremental Pathfinding Blueprint Nodes
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import type { IPoint } from '../core/IPathfinding';
import type { IIncrementalPathfinder, IPathProgress, IIncrementalPathResult } from '../core/IIncrementalPathfinding';
import { PathfindingState } from '../core/IIncrementalPathfinding';

// =============================================================================
// 执行上下文接口 | Execution Context Interface
// =============================================================================

/**
 * @zh 增量寻路上下文接口
 * @en Incremental pathfinding context interface
 */
interface IncrementalPathfindingContext {
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
    setOutputs(nodeId: string, outputs: Record<string, unknown>): void;

    getPathfinder(): IIncrementalPathfinder | null;
    requestPath(startX: number, startY: number, endX: number, endY: number, priority?: number): number;
    stepPath(requestId: number, maxIterations: number): IPathProgress;
    getPathResult(requestId: number): IIncrementalPathResult | null;
    getPathProgress(requestId: number): IPathProgress | null;
    cancelPath(requestId: number): void;
    setObstacle(x: number, y: number, blocked: boolean): void;
}

// =============================================================================
// RequestPathAsync 节点 | RequestPathAsync Node
// =============================================================================

/**
 * @zh 请求异步寻路节点模板
 * @en Request async pathfinding node template
 */
export const RequestPathAsyncTemplate: BlueprintNodeTemplate = {
    type: 'RequestPathAsync',
    title: 'Request Path (Async)',
    category: 'custom',
    description: 'Request incremental pathfinding / 请求增量寻路',
    keywords: ['path', 'pathfinding', 'async', 'incremental', 'request'],
    menuPath: ['Pathfinding', 'Incremental', 'Request Path (Async)'],
    inputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'startX', displayName: 'Start X', type: 'float' },
        { name: 'startY', displayName: 'Start Y', type: 'float' },
        { name: 'endX', displayName: 'End X', type: 'float' },
        { name: 'endY', displayName: 'End Y', type: 'float' },
        { name: 'priority', displayName: 'Priority', type: 'int' }
    ],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'requestId', displayName: 'Request ID', type: 'int' }
    ],
    color: '#4caf50'
};

/**
 * @zh 请求异步寻路执行器
 * @en Request async pathfinding executor
 */
export class RequestPathAsyncExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as IncrementalPathfindingContext;
        const startX = ctx.evaluateInput(node.id, 'startX', 0) as number;
        const startY = ctx.evaluateInput(node.id, 'startY', 0) as number;
        const endX = ctx.evaluateInput(node.id, 'endX', 0) as number;
        const endY = ctx.evaluateInput(node.id, 'endY', 0) as number;
        const priority = ctx.evaluateInput(node.id, 'priority', 50) as number;

        const requestId = ctx.requestPath(startX, startY, endX, endY, priority);

        return {
            outputs: { requestId },
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// StepPath 节点 | StepPath Node
// =============================================================================

/**
 * @zh 推进寻路一步节点模板
 * @en Step pathfinding node template
 */
export const StepPathTemplate: BlueprintNodeTemplate = {
    type: 'StepPath',
    title: 'Step Path',
    category: 'custom',
    description: 'Execute one step of pathfinding / 执行一步寻路',
    keywords: ['path', 'pathfinding', 'step', 'iterate', 'incremental'],
    menuPath: ['Pathfinding', 'Incremental', 'Step Path'],
    inputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'requestId', displayName: 'Request ID', type: 'int' },
        { name: 'maxIterations', displayName: 'Max Iterations', type: 'int' }
    ],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'state', displayName: 'State', type: 'string' },
        { name: 'progress', displayName: 'Progress', type: 'float' },
        { name: 'nodesSearched', displayName: 'Nodes Searched', type: 'int' }
    ],
    color: '#4caf50'
};

/**
 * @zh 推进寻路一步执行器
 * @en Step pathfinding executor
 */
export class StepPathExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as IncrementalPathfindingContext;
        const requestId = ctx.evaluateInput(node.id, 'requestId', -1) as number;
        const maxIterations = ctx.evaluateInput(node.id, 'maxIterations', 100) as number;

        const progress = ctx.stepPath(requestId, maxIterations);

        return {
            outputs: {
                state: progress.state,
                progress: progress.estimatedProgress,
                nodesSearched: progress.nodesSearched
            },
            nextExec: 'exec'
        };
    }
}

// =============================================================================
// GetPathProgress 节点 | GetPathProgress Node
// =============================================================================

/**
 * @zh 获取寻路进度节点模板
 * @en Get path progress node template
 */
export const GetPathProgressTemplate: BlueprintNodeTemplate = {
    type: 'GetPathProgress',
    title: 'Get Path Progress',
    category: 'custom',
    description: 'Get incremental pathfinding progress / 获取增量寻路进度',
    keywords: ['path', 'progress', 'status', 'state'],
    menuPath: ['Pathfinding', 'Incremental', 'Get Path Progress'],
    isPure: true,
    inputs: [
        { name: 'requestId', displayName: 'Request ID', type: 'int' }
    ],
    outputs: [
        { name: 'state', displayName: 'State', type: 'string' },
        { name: 'progress', displayName: 'Progress (0-1)', type: 'float' },
        { name: 'nodesSearched', displayName: 'Nodes Searched', type: 'int' },
        { name: 'isComplete', displayName: 'Is Complete', type: 'bool' },
        { name: 'isInProgress', displayName: 'Is In Progress', type: 'bool' }
    ],
    color: '#4caf50'
};

/**
 * @zh 获取寻路进度执行器
 * @en Get path progress executor
 */
export class GetPathProgressExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as IncrementalPathfindingContext;
        const requestId = ctx.evaluateInput(node.id, 'requestId', -1) as number;

        const progress = ctx.getPathProgress(requestId);

        if (!progress) {
            return {
                outputs: {
                    state: PathfindingState.Idle,
                    progress: 0,
                    nodesSearched: 0,
                    isComplete: false,
                    isInProgress: false
                }
            };
        }

        return {
            outputs: {
                state: progress.state,
                progress: progress.estimatedProgress,
                nodesSearched: progress.nodesSearched,
                isComplete: progress.state === PathfindingState.Completed,
                isInProgress: progress.state === PathfindingState.InProgress
            }
        };
    }
}

// =============================================================================
// GetPathResult 节点 | GetPathResult Node
// =============================================================================

/**
 * @zh 获取寻路结果节点模板
 * @en Get path result node template
 */
export const GetPathResultTemplate: BlueprintNodeTemplate = {
    type: 'GetPathResult',
    title: 'Get Path Result',
    category: 'custom',
    description: 'Get completed path result / 获取已完成的寻路结果',
    keywords: ['path', 'result', 'get', 'output'],
    menuPath: ['Pathfinding', 'Incremental', 'Get Path Result'],
    isPure: true,
    inputs: [
        { name: 'requestId', displayName: 'Request ID', type: 'int' }
    ],
    outputs: [
        { name: 'found', displayName: 'Found', type: 'bool' },
        { name: 'path', displayName: 'Path', type: 'array' },
        { name: 'cost', displayName: 'Cost', type: 'float' },
        { name: 'framesUsed', displayName: 'Frames Used', type: 'int' }
    ],
    color: '#4caf50'
};

/**
 * @zh 获取寻路结果执行器
 * @en Get path result executor
 */
export class GetPathResultExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as IncrementalPathfindingContext;
        const requestId = ctx.evaluateInput(node.id, 'requestId', -1) as number;

        const result = ctx.getPathResult(requestId);

        if (!result) {
            return {
                outputs: {
                    found: false,
                    path: [],
                    cost: 0,
                    framesUsed: 0
                }
            };
        }

        return {
            outputs: {
                found: result.found,
                path: result.path,
                cost: result.cost,
                framesUsed: result.framesUsed
            }
        };
    }
}

// =============================================================================
// CancelPath 节点 | CancelPath Node
// =============================================================================

/**
 * @zh 取消寻路节点模板
 * @en Cancel path node template
 */
export const CancelPathTemplate: BlueprintNodeTemplate = {
    type: 'CancelPath',
    title: 'Cancel Path',
    category: 'custom',
    description: 'Cancel ongoing pathfinding / 取消正在进行的寻路',
    keywords: ['path', 'cancel', 'stop', 'abort'],
    menuPath: ['Pathfinding', 'Incremental', 'Cancel Path'],
    inputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'requestId', displayName: 'Request ID', type: 'int' }
    ],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' }
    ],
    color: '#f44336'
};

/**
 * @zh 取消寻路执行器
 * @en Cancel path executor
 */
export class CancelPathExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as IncrementalPathfindingContext;
        const requestId = ctx.evaluateInput(node.id, 'requestId', -1) as number;

        ctx.cancelPath(requestId);

        return { nextExec: 'exec' };
    }
}

// =============================================================================
// SetObstacle 节点 | SetObstacle Node
// =============================================================================

/**
 * @zh 设置障碍物节点模板
 * @en Set obstacle node template
 */
export const SetObstacleTemplate: BlueprintNodeTemplate = {
    type: 'SetObstacle',
    title: 'Set Obstacle',
    category: 'custom',
    description: 'Set or remove obstacle / 设置或移除障碍物',
    keywords: ['obstacle', 'block', 'walkable', 'terrain'],
    menuPath: ['Pathfinding', 'Incremental', 'Set Obstacle'],
    inputs: [
        { name: 'exec', displayName: '', type: 'exec' },
        { name: 'x', displayName: 'X', type: 'int' },
        { name: 'y', displayName: 'Y', type: 'int' },
        { name: 'blocked', displayName: 'Blocked', type: 'bool' }
    ],
    outputs: [
        { name: 'exec', displayName: '', type: 'exec' }
    ],
    color: '#ff9800'
};

/**
 * @zh 设置障碍物执行器
 * @en Set obstacle executor
 */
export class SetObstacleExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as IncrementalPathfindingContext;
        const x = ctx.evaluateInput(node.id, 'x', 0) as number;
        const y = ctx.evaluateInput(node.id, 'y', 0) as number;
        const blocked = ctx.evaluateInput(node.id, 'blocked', true) as boolean;

        ctx.setObstacle(x, y, blocked);

        return { nextExec: 'exec' };
    }
}

// =============================================================================
// IsPathComplete 节点 | IsPathComplete Node
// =============================================================================

/**
 * @zh 检查路径是否完成节点模板
 * @en Check if path is complete node template
 */
export const IsPathCompleteTemplate: BlueprintNodeTemplate = {
    type: 'IsPathComplete',
    title: 'Is Path Complete',
    category: 'custom',
    description: 'Check if pathfinding is complete / 检查寻路是否完成',
    keywords: ['path', 'complete', 'done', 'finished'],
    menuPath: ['Pathfinding', 'Incremental', 'Is Path Complete'],
    isPure: true,
    inputs: [
        { name: 'requestId', displayName: 'Request ID', type: 'int' }
    ],
    outputs: [
        { name: 'isComplete', displayName: 'Is Complete', type: 'bool' },
        { name: 'found', displayName: 'Found', type: 'bool' }
    ],
    color: '#4caf50'
};

/**
 * @zh 检查路径是否完成执行器
 * @en Check if path is complete executor
 */
export class IsPathCompleteExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as IncrementalPathfindingContext;
        const requestId = ctx.evaluateInput(node.id, 'requestId', -1) as number;

        const progress = ctx.getPathProgress(requestId);
        const isComplete = progress?.state === PathfindingState.Completed ||
                          progress?.state === PathfindingState.Failed;

        const result = ctx.getPathResult(requestId);
        const found = result?.found ?? false;

        return {
            outputs: {
                isComplete,
                found
            }
        };
    }
}

// =============================================================================
// 节点定义集合 | Node Definitions Collection
// =============================================================================

/**
 * @zh 增量寻路节点定义集合
 * @en Incremental pathfinding node definitions collection
 */
export const IncrementalPathfindingNodeDefinitions = {
    templates: [
        RequestPathAsyncTemplate,
        StepPathTemplate,
        GetPathProgressTemplate,
        GetPathResultTemplate,
        CancelPathTemplate,
        SetObstacleTemplate,
        IsPathCompleteTemplate
    ],
    executors: new Map<string, INodeExecutor>([
        ['RequestPathAsync', new RequestPathAsyncExecutor()],
        ['StepPath', new StepPathExecutor()],
        ['GetPathProgress', new GetPathProgressExecutor()],
        ['GetPathResult', new GetPathResultExecutor()],
        ['CancelPath', new CancelPathExecutor()],
        ['SetObstacle', new SetObstacleExecutor()],
        ['IsPathComplete', new IsPathCompleteExecutor()]
    ])
};
