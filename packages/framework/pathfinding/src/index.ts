/**
 * @esengine/pathfinding
 *
 * @zh 寻路系统
 * @en Pathfinding System
 *
 * @zh 提供 A* 寻路、增量寻路、网格地图、导航网格和路径平滑
 * @en Provides A* pathfinding, incremental pathfinding, grid map, NavMesh and path smoothing
 */

// =============================================================================
// Core | 核心
// =============================================================================

export type {
    IPoint,
    IPathNode,
    IPathResult,
    IPathfindingMap,
    IPathfinder,
    IPathSmoother,
    IPathfindingOptions,
    HeuristicFunction,
    LineOfSightCheck
} from './core';

export {
    createPoint,
    EMPTY_PATH_RESULT,
    DEFAULT_PATHFINDING_OPTIONS,
    manhattanDistance,
    euclideanDistance,
    chebyshevDistance,
    octileDistance,
    BinaryHeap,
    IndexedBinaryHeap,
    AStarPathfinder,
    createAStarPathfinder,
    GridPathfinder,
    createGridPathfinder,
    JPSPathfinder,
    createJPSPathfinder,
    HPAPathfinder,
    createHPAPathfinder,
    DEFAULT_HPA_CONFIG,
    PathCache,
    createPathCache,
    DEFAULT_PATH_CACHE_CONFIG
} from './core';

export type {
    IHeapIndexable,
    GridPathfinderMode,
    IGridPathfinderConfig,
    IPathCacheConfig,
    IHPAConfig
} from './core';

// =============================================================================
// Incremental Pathfinding | 增量寻路
// =============================================================================

export type {
    IPathRequest,
    IPathProgress,
    IIncrementalPathResult,
    IIncrementalPathfinder,
    IIncrementalPathfindingOptions,
    IIncrementalPathfinderConfig,
    IPathValidator,
    IPathValidationResult,
    IReplanningConfig,
    IObstacleChange,
    IChangeRegion
} from './core';

export {
    PathfindingState,
    DEFAULT_REPLANNING_CONFIG,
    EMPTY_PROGRESS,
    IncrementalAStarPathfinder,
    createIncrementalAStarPathfinder,
    PathValidator,
    ObstacleChangeManager,
    createPathValidator,
    createObstacleChangeManager
} from './core';

// =============================================================================
// Grid | 网格地图
// =============================================================================

export type { IGridMapOptions } from './grid';

export {
    GridNode,
    GridMap,
    createGridMap,
    DIRECTIONS_4,
    DIRECTIONS_8,
    DEFAULT_GRID_OPTIONS
} from './grid';

// =============================================================================
// NavMesh | 导航网格
// =============================================================================

export type { INavPolygon, IPortal } from './navmesh';

export { NavMesh, createNavMesh } from './navmesh';

// =============================================================================
// Smoothing | 路径平滑
// =============================================================================

export {
    bresenhamLineOfSight,
    raycastLineOfSight,
    LineOfSightSmoother,
    CatmullRomSmoother,
    CombinedSmoother,
    createLineOfSightSmoother,
    createCatmullRomSmoother,
    createCombinedSmoother
} from './smoothing';

// =============================================================================
// Local Avoidance (ORCA) | 局部避让
// =============================================================================

export type {
    IVector2,
    IORCALine,
    IAvoidanceAgent,
    IObstacle,
    IORCASolverConfig,
    IORCAResult,
    IORCASolver,
    INeighborResult,
    ISpatialIndex
} from './avoidance';

export {
    DEFAULT_ORCA_CONFIG,
    DEFAULT_AGENT_PARAMS,
    ORCASolver,
    createORCASolver,
    KDTree,
    createKDTree,
    solveORCALinearProgram
} from './avoidance';

// =============================================================================
// Sub-path Exports | 子路径导出
// =============================================================================
// ECS Components & Systems: import from '@esengine/pathfinding/ecs'
// Blueprint Nodes: import from '@esengine/pathfinding/nodes'
// Avoidance: import from '@esengine/pathfinding/avoidance'
