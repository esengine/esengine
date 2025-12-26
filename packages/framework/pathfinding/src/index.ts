/**
 * @esengine/pathfinding
 *
 * @zh 寻路系统
 * @en Pathfinding System
 *
 * @zh 提供 A* 寻路、网格地图、导航网格和路径平滑
 * @en Provides A* pathfinding, grid map, NavMesh and path smoothing
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
// Blueprint Nodes | 蓝图节点
// =============================================================================

export {
    // Templates
    FindPathTemplate,
    FindPathSmoothTemplate,
    IsWalkableTemplate,
    GetPathLengthTemplate,
    GetPathDistanceTemplate,
    GetPathPointTemplate,
    MoveAlongPathTemplate,
    HasLineOfSightTemplate,
    // Executors
    FindPathExecutor,
    FindPathSmoothExecutor,
    IsWalkableExecutor,
    GetPathLengthExecutor,
    GetPathDistanceExecutor,
    GetPathPointExecutor,
    MoveAlongPathExecutor,
    HasLineOfSightExecutor,
    // Collection
    PathfindingNodeDefinitions
} from './nodes';
