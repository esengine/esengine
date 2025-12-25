/**
 * @zh 寻路系统核心接口
 * @en Pathfinding System Core Interfaces
 */

// =============================================================================
// 基础类型 | Basic Types
// =============================================================================

/**
 * @zh 2D 坐标点
 * @en 2D coordinate point
 */
export interface IPoint {
    readonly x: number;
    readonly y: number;
}

/**
 * @zh 创建点
 * @en Create a point
 */
export function createPoint(x: number, y: number): IPoint {
    return { x, y };
}

/**
 * @zh 路径节点
 * @en Path node
 */
export interface IPathNode {
    /** @zh 节点唯一标识 @en Unique node identifier */
    readonly id: string | number;
    /** @zh 节点位置 @en Node position */
    readonly position: IPoint;
    /** @zh 移动代价 @en Movement cost */
    readonly cost: number;
    /** @zh 是否可通行 @en Is walkable */
    readonly walkable: boolean;
}

/**
 * @zh 路径结果
 * @en Path result
 */
export interface IPathResult {
    /** @zh 是否找到路径 @en Whether path was found */
    readonly found: boolean;
    /** @zh 路径点列表 @en List of path points */
    readonly path: readonly IPoint[];
    /** @zh 路径总代价 @en Total path cost */
    readonly cost: number;
    /** @zh 搜索的节点数 @en Number of nodes searched */
    readonly nodesSearched: number;
}

/**
 * @zh 空路径结果
 * @en Empty path result
 */
export const EMPTY_PATH_RESULT: IPathResult = {
    found: false,
    path: [],
    cost: 0,
    nodesSearched: 0
};

// =============================================================================
// 地图接口 | Map Interface
// =============================================================================

/**
 * @zh 寻路地图接口
 * @en Pathfinding map interface
 */
export interface IPathfindingMap {
    /**
     * @zh 获取节点的邻居
     * @en Get neighbors of a node
     */
    getNeighbors(node: IPathNode): IPathNode[];

    /**
     * @zh 获取指定位置的节点
     * @en Get node at position
     */
    getNodeAt(x: number, y: number): IPathNode | null;

    /**
     * @zh 计算两点间的启发式距离
     * @en Calculate heuristic distance between two points
     */
    heuristic(a: IPoint, b: IPoint): number;

    /**
     * @zh 计算两个邻居节点间的移动代价
     * @en Calculate movement cost between two neighbor nodes
     */
    getMovementCost(from: IPathNode, to: IPathNode): number;

    /**
     * @zh 检查位置是否可通行
     * @en Check if position is walkable
     */
    isWalkable(x: number, y: number): boolean;
}

// =============================================================================
// 启发式函数 | Heuristic Functions
// =============================================================================

/**
 * @zh 启发式函数类型
 * @en Heuristic function type
 */
export type HeuristicFunction = (a: IPoint, b: IPoint) => number;

/**
 * @zh 曼哈顿距离（4方向移动）
 * @en Manhattan distance (4-directional movement)
 */
export function manhattanDistance(a: IPoint, b: IPoint): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * @zh 欧几里得距离（任意方向移动）
 * @en Euclidean distance (any direction movement)
 */
export function euclideanDistance(a: IPoint, b: IPoint): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * @zh 切比雪夫距离（8方向移动）
 * @en Chebyshev distance (8-directional movement)
 */
export function chebyshevDistance(a: IPoint, b: IPoint): number {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

/**
 * @zh 八角距离（8方向移动，对角线代价为 √2）
 * @en Octile distance (8-directional, diagonal cost √2)
 */
export function octileDistance(a: IPoint, b: IPoint): number {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    const D = 1;
    const D2 = Math.SQRT2;
    return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
}

// =============================================================================
// 寻路器接口 | Pathfinder Interface
// =============================================================================

/**
 * @zh 寻路配置
 * @en Pathfinding options
 */
export interface IPathfindingOptions {
    /** @zh 最大搜索节点数 @en Maximum nodes to search */
    maxNodes?: number;
    /** @zh 启发式权重 (>1 更快但可能非最优) @en Heuristic weight (>1 faster but may be suboptimal) */
    heuristicWeight?: number;
    /** @zh 是否允许对角移动 @en Allow diagonal movement */
    allowDiagonal?: boolean;
    /** @zh 是否避免穿角 @en Avoid corner cutting */
    avoidCorners?: boolean;
}

/**
 * @zh 默认寻路配置
 * @en Default pathfinding options
 */
export const DEFAULT_PATHFINDING_OPTIONS: Required<IPathfindingOptions> = {
    maxNodes: 10000,
    heuristicWeight: 1.0,
    allowDiagonal: true,
    avoidCorners: true
};

/**
 * @zh 寻路器接口
 * @en Pathfinder interface
 */
export interface IPathfinder {
    /**
     * @zh 查找路径
     * @en Find path
     */
    findPath(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        options?: IPathfindingOptions
    ): IPathResult;

    /**
     * @zh 清理状态（用于重用）
     * @en Clear state (for reuse)
     */
    clear(): void;
}

// =============================================================================
// 路径平滑接口 | Path Smoothing Interface
// =============================================================================

/**
 * @zh 路径平滑器接口
 * @en Path smoother interface
 */
export interface IPathSmoother {
    /**
     * @zh 平滑路径
     * @en Smooth path
     */
    smooth(path: readonly IPoint[], map: IPathfindingMap): IPoint[];
}

/**
 * @zh 视线检测函数类型
 * @en Line of sight check function type
 */
export type LineOfSightCheck = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    map: IPathfindingMap
) => boolean;
