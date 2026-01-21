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

export type { INavPolygon, IPortal, IDynamicObstacle, ObstacleType } from './navmesh';

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
    createCombinedSmoother,
    RadiusAwarePathSmoother,
    CombinedRadiusAwareSmoother,
    createRadiusAwareSmoother,
    createCombinedRadiusAwareSmoother
} from './smoothing';

export type { IRadiusAwareSmootherConfig } from './smoothing';

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
    ISpatialIndex,
    ICollisionResult,
    ICollisionResolverConfig
} from './avoidance';

export {
    DEFAULT_ORCA_CONFIG,
    DEFAULT_AGENT_PARAMS,
    DEFAULT_COLLISION_CONFIG,
    EMPTY_COLLISION,
    ORCASolver,
    createORCASolver,
    KDTree,
    createKDTree,
    solveORCALinearProgram,
    CollisionResolver,
    createCollisionResolver
} from './avoidance';

// =============================================================================
// Navigation Interfaces | 导航接口（可插拔架构）
// =============================================================================

export type {
    IVector2 as INavVector2,
    IPathPlanResult,
    IPathPlanOptions,
    IPathPlanner,
    IIncrementalPathPlanner,
    IIncrementalPathRequest,
    IPathProgress as INavPathProgress,
    IAvoidanceAgentData,
    IObstacleData,
    IAvoidanceResult,
    ILocalAvoidance,
    ICollisionResult as INavCollisionResult,
    ICollisionResolver,
    ICongestionZone,
    IFlowAgentData,
    IFlowControlResult,
    IFlowControllerConfig,
    IFlowController
} from './interfaces';

export {
    EMPTY_PLAN_RESULT,
    EMPTY_COLLISION_RESULT,
    PassPermission,
    DEFAULT_FLOW_CONTROLLER_CONFIG,
    PathPlanState,
    isIncrementalPlanner
} from './interfaces';

// =============================================================================
// Navigation Adapters | 导航适配器（算法桥接）
// =============================================================================

export {
    NavMeshPathPlannerAdapter,
    createNavMeshPathPlanner,
    GridPathfinderAdapter,
    createAStarPlanner,
    createJPSPlanner,
    createHPAPlanner,
    IncrementalGridPathPlannerAdapter,
    createIncrementalAStarPlanner,
    ORCALocalAvoidanceAdapter,
    createORCAAvoidance,
    DEFAULT_ORCA_PARAMS,
    CollisionResolverAdapter,
    createDefaultCollisionResolver,
    FlowController,
    createFlowController
} from './adapters';

export type {
    IORCAParams,
    IGridPathfinderAdapterConfig,
    IIncrementalGridPathPlannerConfig
} from './adapters';

// =============================================================================
// Sub-path Exports | 子路径导出
// =============================================================================
// ECS Components & Systems: import from '@esengine/pathfinding/ecs'
// Blueprint Nodes: import from '@esengine/pathfinding/nodes'
// Adapters: import from '@esengine/pathfinding/adapters'
// Interfaces: import from '@esengine/pathfinding/interfaces'
