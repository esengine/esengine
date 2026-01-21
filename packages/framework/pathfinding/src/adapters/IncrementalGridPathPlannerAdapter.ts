/**
 * @zh 增量网格寻路器适配器
 * @en Incremental Grid Pathfinder Adapter
 *
 * @zh 将 IncrementalAStarPathfinder 适配到 IIncrementalPathPlanner 接口
 * @en Adapts IncrementalAStarPathfinder to IIncrementalPathPlanner interface
 */

import type {
    IIncrementalPathPlanner,
    IIncrementalPathRequest,
    IPathProgress,
    IPathPlanResult,
    IPathPlanOptions,
    IVector2,
    PathPlanState
} from '../interfaces/IPathPlanner';
import { EMPTY_PLAN_RESULT } from '../interfaces/IPathPlanner';
import { PathPlanState as PlanState } from '../interfaces/IPathPlanner';
import type { IPathfindingMap, IPathfindingOptions } from '../core/IPathfinding';
import { IncrementalAStarPathfinder, type IIncrementalPathfinderConfig } from '../core/IncrementalAStarPathfinder';
import { PathfindingState } from '../core/IIncrementalPathfinding';

/**
 * @zh 增量网格寻路器适配器配置
 * @en Incremental grid pathfinder adapter configuration
 */
export interface IIncrementalGridPathPlannerConfig extends IIncrementalPathfinderConfig {
    /**
     * @zh 网格单元格大小（像素），用于坐标转换
     * @en Grid cell size (pixels), used for coordinate conversion
     *
     * @default 1 (no conversion)
     */
    cellSize?: number;
}

/**
 * @zh 将 PathfindingState 转换为 PathPlanState
 * @en Convert PathfindingState to PathPlanState
 */
function toPathPlanState(state: PathfindingState): PathPlanState {
    switch (state) {
        case PathfindingState.Idle:
            return PlanState.Idle;
        case PathfindingState.InProgress:
            return PlanState.InProgress;
        case PathfindingState.Completed:
            return PlanState.Completed;
        case PathfindingState.Failed:
            return PlanState.Failed;
        case PathfindingState.Cancelled:
            return PlanState.Cancelled;
        default:
            return PlanState.Idle;
    }
}

/**
 * @zh 增量网格寻路器适配器
 * @en Incremental grid pathfinder adapter
 *
 * @zh 将 IncrementalAStarPathfinder 适配到 IIncrementalPathPlanner 接口，支持时间切片
 * @en Adapts IncrementalAStarPathfinder to IIncrementalPathPlanner interface, supports time slicing
 *
 * @example
 * ```typescript
 * const gridMap = createGridMap(100, 100);
 * const planner = createIncrementalAStarPlanner(gridMap, { cellSize: 20 });
 *
 * // 请求路径（像素坐标）
 * const request = planner.requestPath({ x: 100, y: 100 }, { x: 500, y: 300 });
 *
 * // 每帧执行一定数量的迭代
 * const progress = planner.step(request.id, 100);
 * if (progress.state === PathPlanState.Completed) {
 *     const result = planner.getResult(request.id);
 *     // result.path 是像素坐标
 * }
 * ```
 */
export class IncrementalGridPathPlannerAdapter implements IIncrementalPathPlanner {
    readonly type: string = 'incremental-astar';
    readonly supportsIncremental: true = true;

    private readonly pathfinder: IncrementalAStarPathfinder;
    private readonly map: IPathfindingMap;
    private readonly options?: IPathfindingOptions;
    private readonly cellSize: number;

    /**
     * @zh 活跃请求 ID 集合（用于跟踪）
     * @en Active request IDs set (for tracking)
     */
    private readonly activeRequests: Set<number> = new Set();

    /**
     * @zh 每个请求的累计搜索节点数
     * @en Accumulated searched nodes per request
     */
    private readonly requestTotalNodes: Map<number, number> = new Map();

    constructor(
        map: IPathfindingMap,
        options?: IPathfindingOptions,
        config?: IIncrementalGridPathPlannerConfig
    ) {
        this.map = map;
        this.options = options;
        this.cellSize = config?.cellSize ?? 1;
        this.pathfinder = new IncrementalAStarPathfinder(map, config);
    }

    /**
     * @zh 像素坐标转网格坐标
     * @en Convert pixel coordinate to grid coordinate
     */
    private toGridCoord(pixel: number): number {
        return Math.floor(pixel / this.cellSize);
    }

    /**
     * @zh 网格坐标转像素坐标（单元格中心）
     * @en Convert grid coordinate to pixel coordinate (cell center)
     */
    private toPixelCoord(grid: number): number {
        return grid * this.cellSize + this.cellSize * 0.5;
    }

    // =========================================================================
    // IPathPlanner 基础接口 | IPathPlanner Base Interface
    // =========================================================================

    findPath(start: IVector2, end: IVector2, options?: IPathPlanOptions): IPathPlanResult {
        const startGridX = this.toGridCoord(start.x);
        const startGridY = this.toGridCoord(start.y);
        const endGridX = this.toGridCoord(end.x);
        const endGridY = this.toGridCoord(end.y);

        // 使用同步方式：请求 → 完全执行 → 获取结果
        const request = this.pathfinder.requestPath(
            startGridX,
            startGridY,
            endGridX,
            endGridY,
            this.options
        );

        // 执行足够多的迭代以完成
        let progress = this.pathfinder.step(request.id, 100000);
        while (progress.state === PathfindingState.InProgress) {
            progress = this.pathfinder.step(request.id, 100000);
        }

        const result = this.pathfinder.getResult(request.id);
        this.pathfinder.cleanup(request.id);

        if (!result || !result.found) {
            return EMPTY_PLAN_RESULT;
        }

        return {
            found: true,
            path: result.path.map(p => ({
                x: this.toPixelCoord(p.x),
                y: this.toPixelCoord(p.y)
            })),
            cost: result.cost,
            nodesSearched: result.nodesSearched
        };
    }

    isWalkable(position: IVector2): boolean {
        return this.map.isWalkable(
            this.toGridCoord(position.x),
            this.toGridCoord(position.y)
        );
    }

    getNearestWalkable(position: IVector2): IVector2 | null {
        const x = this.toGridCoord(position.x);
        const y = this.toGridCoord(position.y);

        if (this.map.isWalkable(x, y)) {
            return {
                x: this.toPixelCoord(x),
                y: this.toPixelCoord(y)
            };
        }

        for (let radius = 1; radius <= 10; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        if (this.map.isWalkable(x + dx, y + dy)) {
                            return {
                                x: this.toPixelCoord(x + dx),
                                y: this.toPixelCoord(y + dy)
                            };
                        }
                    }
                }
            }
        }

        return null;
    }

    clear(): void {
        this.pathfinder.clear();
        this.activeRequests.clear();
        this.requestTotalNodes.clear();
    }

    dispose(): void {
        this.pathfinder.clear();
        this.activeRequests.clear();
        this.requestTotalNodes.clear();
    }

    // =========================================================================
    // IIncrementalPathPlanner 增量接口 | IIncrementalPathPlanner Incremental Interface
    // =========================================================================

    requestPath(start: IVector2, end: IVector2, options?: IPathPlanOptions): IIncrementalPathRequest {
        const startGridX = this.toGridCoord(start.x);
        const startGridY = this.toGridCoord(start.y);
        const endGridX = this.toGridCoord(end.x);
        const endGridY = this.toGridCoord(end.y);

        const request = this.pathfinder.requestPath(
            startGridX,
            startGridY,
            endGridX,
            endGridY,
            this.options
        );

        this.activeRequests.add(request.id);
        this.requestTotalNodes.set(request.id, 0);

        return {
            id: request.id,
            state: PlanState.InProgress
        };
    }

    step(requestId: number, iterations: number): IPathProgress {
        const progress = this.pathfinder.step(requestId, iterations);

        // Track total nodes searched across all steps
        const prevTotal = this.requestTotalNodes.get(requestId) ?? 0;
        const newTotal = prevTotal + progress.nodesSearched;
        this.requestTotalNodes.set(requestId, newTotal);

        return {
            state: toPathPlanState(progress.state),
            estimatedProgress: progress.estimatedProgress,
            nodesSearched: progress.nodesSearched,
            totalNodesSearched: newTotal
        };
    }

    getResult(requestId: number): IPathPlanResult | null {
        const result = this.pathfinder.getResult(requestId);

        if (!result) {
            return null;
        }

        if (!result.found) {
            return EMPTY_PLAN_RESULT;
        }

        return {
            found: true,
            path: result.path.map(p => ({
                x: this.toPixelCoord(p.x),
                y: this.toPixelCoord(p.y)
            })),
            cost: result.cost,
            nodesSearched: result.nodesSearched
        };
    }

    cancel(requestId: number): void {
        this.pathfinder.cancel(requestId);
    }

    cleanup(requestId: number): void {
        this.pathfinder.cleanup(requestId);
        this.activeRequests.delete(requestId);
        this.requestTotalNodes.delete(requestId);
    }

    getActiveRequestCount(): number {
        return this.activeRequests.size;
    }
}

/**
 * @zh 创建增量 A* 路径规划器
 * @en Create incremental A* path planner
 *
 * @zh 支持时间切片的 A* 路径规划器，可以将寻路计算分散到多帧执行
 * @en A* path planner with time slicing support, can spread pathfinding computation across multiple frames
 *
 * @param map - @zh 寻路地图 @en Pathfinding map
 * @param options - @zh 寻路选项 @en Pathfinding options
 * @param config - @zh 适配器配置（包含 cellSize 和缓存配置）@en Adapter config (includes cellSize and cache config)
 * @returns @zh 增量路径规划器 @en Incremental path planner
 *
 * @example
 * ```typescript
 * const gridMap = createGridMap(100, 100);
 * const planner = createIncrementalAStarPlanner(gridMap, undefined, {
 *     cellSize: 20,
 *     enableCache: true
 * });
 *
 * // 与 NavigationSystem 集成
 * navSystem.setPathPlanner(planner);
 *
 * // 启用时间切片（NavigationSystem 会自动检测）
 * const navSystem = new NavigationSystem({
 *     enableTimeSlicing: true,
 *     iterationsBudget: 1000,
 *     maxAgentsPerFrame: 10
 * });
 * ```
 */
export function createIncrementalAStarPlanner(
    map: IPathfindingMap,
    options?: IPathfindingOptions,
    config?: IIncrementalGridPathPlannerConfig
): IIncrementalPathPlanner {
    return new IncrementalGridPathPlannerAdapter(map, options, config);
}
