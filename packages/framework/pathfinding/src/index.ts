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
    AStarPathfinder,
    createAStarPathfinder
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
// ECS Components & Systems | ECS 组件和系统
// =============================================================================

export {
    PathfindingAgentComponent,
    PathfindingMapComponent,
    PathfindingSystem
} from './ecs';

export type { PathfindingMapType } from './ecs';

// =============================================================================
// Blueprint Nodes | 蓝图节点
// =============================================================================

export {
    // Basic Templates
    FindPathTemplate,
    FindPathSmoothTemplate,
    IsWalkableTemplate,
    GetPathLengthTemplate,
    GetPathDistanceTemplate,
    GetPathPointTemplate,
    MoveAlongPathTemplate,
    HasLineOfSightTemplate,
    // Basic Executors
    FindPathExecutor,
    FindPathSmoothExecutor,
    IsWalkableExecutor,
    GetPathLengthExecutor,
    GetPathDistanceExecutor,
    GetPathPointExecutor,
    MoveAlongPathExecutor,
    HasLineOfSightExecutor,
    // Basic Collection
    PathfindingNodeDefinitions,
    // Incremental Templates
    RequestPathAsyncTemplate,
    StepPathTemplate,
    GetPathProgressTemplate,
    GetPathResultTemplate,
    CancelPathTemplate,
    SetObstacleTemplate,
    IsPathCompleteTemplate,
    // Incremental Executors
    RequestPathAsyncExecutor,
    StepPathExecutor,
    GetPathProgressExecutor,
    GetPathResultExecutor,
    CancelPathExecutor,
    SetObstacleExecutor,
    IsPathCompleteExecutor,
    // Incremental Collection
    IncrementalPathfindingNodeDefinitions
} from './nodes';
