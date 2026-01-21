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
    // 统一导航系统
    NavigationAgentComponent,
    NavigationSystem,
    NavigationState,
    ORCAConfigComponent,

    // 适配器工厂（便捷导出）
    createNavMeshPathPlanner,
    createAStarPlanner,
    createJPSPlanner,
    createHPAPlanner,
    createORCAAvoidance,
    createDefaultCollisionResolver,
    createFlowController
} from '@esengine/pathfinding/ecs';

export type {
    INavigationSystemConfig
} from '@esengine/pathfinding/ecs';

// =============================================================================
// Pathfinding Adapters - 导航适配器类（可插拔架构）
// =============================================================================

export {
    // 适配器类
    NavMeshPathPlannerAdapter,
    GridPathfinderAdapter,
    ORCALocalAvoidanceAdapter,
    CollisionResolverAdapter,
    FlowController,

    // 常量
    DEFAULT_ORCA_PARAMS,
    PassPermission,
    DEFAULT_FLOW_CONTROLLER_CONFIG
} from '@esengine/pathfinding';

export type {
    IORCAParams,
    IPathPlanner,
    IPathPlanResult,
    ILocalAvoidance,
    IAvoidanceAgentData,
    IAvoidanceResult,
    ICollisionResolver,
    IFlowController,
    IFlowAgentData,
    IFlowControlResult,
    IFlowControllerConfig,
    ICongestionZone
} from '@esengine/pathfinding';

// =============================================================================
// Network - 网络同步
// =============================================================================

export {
    // 组件
    NetworkIdentity,
    NetworkTransform,

    // 插值和预测工具（状态同步）
    lerp,
    lerpAngle,
    smoothDamp,
    SnapshotBuffer,
    createSnapshotBuffer,
    TransformInterpolator,
    HermiteTransformInterpolator,
    createTransformInterpolator,
    createHermiteTransformInterpolator,
    ClientPrediction,
    createClientPrediction,

    // 定点数同步（帧同步 / Lockstep）
    FixedTransformState,
    FixedTransformStateWithVelocity,
    createZeroFixedTransformState,
    createZeroFixedTransformStateWithVelocity,
    FixedTransformInterpolator,
    FixedHermiteTransformInterpolator,
    createFixedTransformInterpolator,
    createFixedHermiteTransformInterpolator,
    // 定点数快照缓冲区和预测
    FixedSnapshotBuffer,
    createFixedSnapshotBuffer,
    FixedClientPrediction,
    createFixedClientPrediction,
    createFixedMovementPredictor,
    createFixedMovementPositionExtractor,
} from '@esengine/network';

export type {
    IStateSnapshot,
    ITransformState,
    ITransformStateWithVelocity,
    ISnapshotBuffer,
    ISnapshotBufferConfig,
    IInterpolator,
    IExtrapolator,
    ClientPredictionConfig,
    // 定点数帧同步类型
    IFixedStateSnapshot,
    IFixedSnapshotBufferConfig,
    IFixedInterpolationResult,
    IFixedInputSnapshot,
    IFixedPredictedState,
    IFixedPredictor,
    FixedClientPredictionConfig,
    IFixedMovementInput,
    IFixedMovementState,
} from '@esengine/network';
