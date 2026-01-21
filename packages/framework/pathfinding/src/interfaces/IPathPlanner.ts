/**
 * @zh 路径规划器接口
 * @en Path Planner Interface
 *
 * @zh 统一的全局寻路接口，支持 NavMesh、A*、JPS、HPA*、Flow Field 等算法
 * @en Unified global pathfinding interface, supports NavMesh, A*, JPS, HPA*, Flow Field, etc.
 */

/**
 * @zh 2D 向量
 * @en 2D Vector
 */
export interface IVector2 {
    x: number;
    y: number;
}

/**
 * @zh 路径规划结果
 * @en Path planning result
 */
export interface IPathPlanResult {
    /**
     * @zh 是否找到路径
     * @en Whether path was found
     */
    readonly found: boolean;

    /**
     * @zh 路径点列表（世界坐标）
     * @en List of path points (world coordinates)
     */
    readonly path: readonly IVector2[];

    /**
     * @zh 路径总代价
     * @en Total path cost
     */
    readonly cost: number;

    /**
     * @zh 搜索的节点数（用于性能监控）
     * @en Number of nodes searched (for performance monitoring)
     */
    readonly nodesSearched: number;
}

/**
 * @zh 空路径结果
 * @en Empty path result
 */
export const EMPTY_PLAN_RESULT: IPathPlanResult = {
    found: false,
    path: [],
    cost: 0,
    nodesSearched: 0
};

/**
 * @zh 路径规划选项
 * @en Path planning options
 */
export interface IPathPlanOptions {
    /**
     * @zh 代理半径，用于生成考虑碰撞的路径
     * @en Agent radius, used to generate collision-aware paths
     *
     * @zh 如果指定，路径规划器会确保生成的路径与障碍物保持足够距离
     * @en If specified, the path planner will ensure the generated path maintains sufficient distance from obstacles
     */
    agentRadius?: number;
}

/**
 * @zh 路径规划器接口
 * @en Path planner interface
 *
 * @zh 统一的全局寻路接口，支持 NavMesh、A*、JPS、HPA*、Flow Field 等算法
 * @en Unified global pathfinding interface, supports NavMesh, A*, JPS, HPA*, Flow Field, etc.
 *
 * @example
 * ```typescript
 * // 使用 NavMesh 规划器
 * const planner = createNavMeshPathPlanner(navMesh);
 * const result = planner.findPath({ x: 0, y: 0 }, { x: 100, y: 100 });
 *
 * // 使用带半径的路径规划
 * const result = planner.findPath({ x: 0, y: 0 }, { x: 100, y: 100 }, { agentRadius: 0.5 });
 *
 * // 使用 A* 规划器
 * const planner = createAStarPlanner(gridMap);
 * const result = planner.findPath({ x: 0, y: 0 }, { x: 50, y: 50 });
 * ```
 */
export interface IPathPlanner {
    /**
     * @zh 规划器类型标识
     * @en Planner type identifier
     */
    readonly type: string;

    /**
     * @zh 查找从起点到终点的路径
     * @en Find path from start to end
     *
     * @param start - @zh 起点世界坐标 @en Start world position
     * @param end - @zh 终点世界坐标 @en End world position
     * @param options - @zh 路径规划选项 @en Path planning options
     * @returns @zh 路径规划结果 @en Path planning result
     */
    findPath(start: IVector2, end: IVector2, options?: IPathPlanOptions): IPathPlanResult;

    /**
     * @zh 检查位置是否可通行
     * @en Check if position is walkable
     *
     * @param position - @zh 要检查的位置 @en Position to check
     * @returns @zh 是否可通行 @en Whether walkable
     */
    isWalkable(position: IVector2): boolean;

    /**
     * @zh 获取最近的可通行位置
     * @en Get nearest walkable position
     *
     * @param position - @zh 参考位置 @en Reference position
     * @returns @zh 最近的可通行位置，如果找不到则返回 null @en Nearest walkable position, or null if not found
     */
    getNearestWalkable(position: IVector2): IVector2 | null;

    /**
     * @zh 清理内部状态（用于重用）
     * @en Clear internal state (for reuse)
     */
    clear(): void;

    /**
     * @zh 释放资源
     * @en Dispose resources
     */
    dispose(): void;
}

// =============================================================================
// 增量路径规划器 | Incremental Path Planner
// =============================================================================

/**
 * @zh 寻路状态
 * @en Pathfinding state
 */
export enum PathPlanState {
    /**
     * @zh 空闲
     * @en Idle
     */
    Idle = 'idle',

    /**
     * @zh 进行中
     * @en In progress
     */
    InProgress = 'in_progress',

    /**
     * @zh 已完成
     * @en Completed
     */
    Completed = 'completed',

    /**
     * @zh 失败
     * @en Failed
     */
    Failed = 'failed',

    /**
     * @zh 已取消
     * @en Cancelled
     */
    Cancelled = 'cancelled'
}

/**
 * @zh 增量寻路请求
 * @en Incremental pathfinding request
 */
export interface IIncrementalPathRequest {
    /**
     * @zh 请求 ID
     * @en Request ID
     */
    readonly id: number;

    /**
     * @zh 当前状态
     * @en Current state
     */
    readonly state: PathPlanState;
}

/**
 * @zh 寻路进度信息
 * @en Pathfinding progress info
 */
export interface IPathProgress {
    /**
     * @zh 当前状态
     * @en Current state
     */
    readonly state: PathPlanState;

    /**
     * @zh 估计进度 (0-1)
     * @en Estimated progress (0-1)
     */
    readonly estimatedProgress: number;

    /**
     * @zh 本次步进搜索的节点数
     * @en Nodes searched in this step
     */
    readonly nodesSearched: number;

    /**
     * @zh 累计搜索的节点数
     * @en Total nodes searched
     */
    readonly totalNodesSearched: number;
}

/**
 * @zh 增量路径规划器接口
 * @en Incremental path planner interface
 *
 * @zh 支持时间切片的路径规划器，可以将寻路计算分散到多帧执行
 * @en Path planner with time slicing support, can spread pathfinding computation across multiple frames
 *
 * @example
 * ```typescript
 * const planner = createIncrementalAStarPlanner(gridMap);
 *
 * // 请求路径
 * const request = planner.requestPath({ x: 0, y: 0 }, { x: 100, y: 100 });
 *
 * // 每帧执行一定数量的迭代
 * while (true) {
 *     const progress = planner.step(request.id, 100); // 每帧 100 次迭代
 *     if (progress.state === PathPlanState.Completed) {
 *         const result = planner.getResult(request.id);
 *         break;
 *     }
 *     if (progress.state === PathPlanState.Failed) {
 *         break;
 *     }
 *     await nextFrame();
 * }
 *
 * planner.cleanup(request.id);
 * ```
 */
export interface IIncrementalPathPlanner extends IPathPlanner {
    /**
     * @zh 是否支持增量计算
     * @en Whether supports incremental computation
     */
    readonly supportsIncremental: true;

    /**
     * @zh 请求路径（异步开始）
     * @en Request path (async start)
     *
     * @param start - @zh 起点 @en Start position
     * @param end - @zh 终点 @en End position
     * @param options - @zh 选项 @en Options
     * @returns @zh 请求对象 @en Request object
     */
    requestPath(start: IVector2, end: IVector2, options?: IPathPlanOptions): IIncrementalPathRequest;

    /**
     * @zh 执行指定次数的迭代
     * @en Execute specified number of iterations
     *
     * @param requestId - @zh 请求 ID @en Request ID
     * @param iterations - @zh 迭代次数 @en Number of iterations
     * @returns @zh 进度信息 @en Progress info
     */
    step(requestId: number, iterations: number): IPathProgress;

    /**
     * @zh 获取结果
     * @en Get result
     *
     * @param requestId - @zh 请求 ID @en Request ID
     * @returns @zh 结果，如果未完成或不存在返回 null @en Result, null if not completed or not found
     */
    getResult(requestId: number): IPathPlanResult | null;

    /**
     * @zh 取消请求
     * @en Cancel request
     *
     * @param requestId - @zh 请求 ID @en Request ID
     */
    cancel(requestId: number): void;

    /**
     * @zh 清理请求（释放资源）
     * @en Cleanup request (release resources)
     *
     * @param requestId - @zh 请求 ID @en Request ID
     */
    cleanup(requestId: number): void;

    /**
     * @zh 获取活跃请求数量
     * @en Get active request count
     */
    getActiveRequestCount(): number;
}

/**
 * @zh 类型守卫：检查是否为增量路径规划器
 * @en Type guard: check if is incremental path planner
 */
export function isIncrementalPlanner(planner: IPathPlanner): planner is IIncrementalPathPlanner {
    return 'supportsIncremental' in planner && (planner as IIncrementalPathPlanner).supportsIncremental === true;
}
