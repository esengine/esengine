/**
 * ESEngine Demo Bundle
 *
 * 浏览器可用的 ESEngine 核心库 bundle
 * 包含 ECS 框架、数学库、寻路和避让系统
 */

// =============================================================================
// ECS Core - 核心 ECS 框架
// =============================================================================

export {
    // Core 单例
    Core,
    ServiceContainer,
    ServiceLifetime,

    // ECS 核心类
    Entity,
    Component,
    Scene,
    World,
    SceneManager,
    WorldManager,

    // 系统类
    EntitySystem,
    ProcessingSystem,
    PassiveSystem,
    IntervalSystem,

    // 查询和匹配
    Matcher,

    // 时间
    Time,

    // 装饰器
    ECSComponent,
    ECSSystem,

    // 事件
    Emitter,

    // 日志
    Logger,
    createLogger,
    LogLevel,

    // 工具
    GlobalManager,
    TimerManager,
    Timer
} from '@esengine/ecs-framework';

// =============================================================================
// Math - 数学库
// =============================================================================

export {
    // 向量
    Vector2,
    Vector3,

    // 矩阵
    Matrix3,

    // 几何形状
    Rectangle,
    Circle,
    Polygon,

    // 定点数（帧同步）
    Fixed32,
    FixedVector2,
    FixedMath,

    // 工具
    MathUtils,
    Color
} from '@esengine/ecs-framework-math';

export type {
    IVector2,
    IVector3,
    RGBA,
    HSL
} from '@esengine/ecs-framework-math';

// =============================================================================
// Pathfinding - 寻路
// =============================================================================

export {
    // 网格地图
    GridMap,
    createGridMap,

    // 寻路器
    AStarPathfinder,
    createAStarPathfinder,
    GridPathfinder,
    JPSPathfinder,
    HPAPathfinder,

    // 增量寻路
    IncrementalAStarPathfinder,

    // 导航网格
    NavMesh,
    createNavMesh,

    // 路径平滑
    createLineOfSightSmoother,
    createCatmullRomSmoother,
    createCombinedSmoother,

    // 启发式函数
    manhattanDistance,
    euclideanDistance,
    chebyshevDistance,
    octileDistance
} from '@esengine/pathfinding';

// =============================================================================
// Avoidance - ORCA 局部避让
// =============================================================================

export {
    // ORCA 核心
    ORCASolver,
    createORCASolver,

    // 空间索引
    KDTree,
    createKDTree,

    // 线性规划
    solveORCALinearProgram,

    // 默认配置
    DEFAULT_ORCA_CONFIG,
    DEFAULT_AGENT_PARAMS
} from '@esengine/pathfinding/avoidance';

export type {
    IAvoidanceAgent,
    IObstacle,
    IORCASolverConfig,
    IORCALine,
    INeighborResult
} from '@esengine/pathfinding/avoidance';

// =============================================================================
// Pathfinding ECS - 寻路 ECS 组件和系统
// =============================================================================

export {
    // 寻路组件
    PathfindingAgentComponent,
    PathfindingMapComponent,
    PathfindingSystem,

    // 避让组件
    AvoidanceAgentComponent,
    AvoidanceWorldComponent,
    LocalAvoidanceSystem
} from '@esengine/pathfinding/ecs';
