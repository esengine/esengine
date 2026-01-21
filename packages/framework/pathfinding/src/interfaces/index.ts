/**
 * @zh 导航接口模块
 * @en Navigation Interfaces Module
 *
 * @zh 定义可插拔导航架构的统一接口
 * @en Defines unified interfaces for pluggable navigation architecture
 */

// =============================================================================
// 路径规划器 | Path Planner
// =============================================================================

export type {
    IVector2,
    IPathPlanResult,
    IPathPlanOptions,
    IPathPlanner,
    IIncrementalPathPlanner,
    IIncrementalPathRequest,
    IPathProgress
} from './IPathPlanner';
export { EMPTY_PLAN_RESULT, PathPlanState, isIncrementalPlanner } from './IPathPlanner';

// =============================================================================
// 局部避让 | Local Avoidance
// =============================================================================

export type {
    IAvoidanceAgentData,
    IObstacleData,
    IAvoidanceResult,
    ILocalAvoidance
} from './ILocalAvoidance';

// =============================================================================
// 碰撞解决器 | Collision Resolver
// =============================================================================

export type { ICollisionResult, ICollisionResolver } from './ICollisionResolver';
export { EMPTY_COLLISION_RESULT } from './ICollisionResolver';

// =============================================================================
// 流量控制器 | Flow Controller
// =============================================================================

export type {
    ICongestionZone,
    IFlowAgentData,
    IFlowControlResult,
    IFlowControllerConfig,
    IFlowController
} from './IFlowController';
export { PassPermission, DEFAULT_FLOW_CONTROLLER_CONFIG } from './IFlowController';
