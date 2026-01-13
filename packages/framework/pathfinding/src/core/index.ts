/**
 * @zh 寻路核心模块
 * @en Pathfinding Core Module
 */

// 基础接口和类型 | Basic Interfaces and Types
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
} from './IPathfinding';

export {
    createPoint,
    EMPTY_PATH_RESULT,
    DEFAULT_PATHFINDING_OPTIONS,
    manhattanDistance,
    euclideanDistance,
    chebyshevDistance,
    octileDistance
} from './IPathfinding';

// 增量寻路接口和类型 | Incremental Pathfinding Interfaces and Types
export type {
    IPathRequest,
    IPathProgress,
    IIncrementalPathResult,
    IIncrementalPathfinder,
    IIncrementalPathfindingOptions,
    IPathValidator,
    IPathValidationResult,
    IReplanningConfig
} from './IIncrementalPathfinding';

export {
    PathfindingState,
    DEFAULT_REPLANNING_CONFIG,
    EMPTY_PROGRESS
} from './IIncrementalPathfinding';

// 数据结构 | Data Structures
export { BinaryHeap } from './BinaryHeap';

// 同步 A* 寻路器 | Synchronous A* Pathfinder
export { AStarPathfinder, createAStarPathfinder } from './AStarPathfinder';

// 增量 A* 寻路器 | Incremental A* Pathfinder
export {
    IncrementalAStarPathfinder,
    createIncrementalAStarPathfinder
} from './IncrementalAStarPathfinder';

// 路径验证器 | Path Validator
export {
    PathValidator,
    ObstacleChangeManager,
    createPathValidator,
    createObstacleChangeManager
} from './PathValidator';

export type {
    IObstacleChange,
    IChangeRegion
} from './PathValidator';

// JPS 寻路器 | JPS Pathfinder
export { JPSPathfinder, createJPSPathfinder } from './JPSPathfinder';
