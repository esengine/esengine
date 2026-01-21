/**
 * @zh 寻路 ECS 模块
 * @en Pathfinding ECS Module
 */

// =============================================================================
// 导航系统 | Navigation System
// =============================================================================

export { NavigationAgentComponent, NavigationState } from './NavigationAgentComponent';
export { NavigationSystem } from './NavigationSystem';
export type { INavigationSystemConfig } from './NavigationSystem';
export { ORCAConfigComponent } from './ORCAConfigComponent';

// =============================================================================
// 路径规划器适配器 | Path Planner Adapters
// =============================================================================

export {
    NavMeshPathPlannerAdapter,
    createNavMeshPathPlanner
} from '../adapters/NavMeshPathPlannerAdapter';

export {
    GridPathfinderAdapter,
    createAStarPlanner,
    createJPSPlanner,
    createHPAPlanner
} from '../adapters/GridPathfinderAdapter';
export type { IGridPathfinderAdapterConfig } from '../adapters/GridPathfinderAdapter';

export {
    IncrementalGridPathPlannerAdapter,
    createIncrementalAStarPlanner
} from '../adapters/IncrementalGridPathPlannerAdapter';
export type { IIncrementalGridPathPlannerConfig } from '../adapters/IncrementalGridPathPlannerAdapter';

// =============================================================================
// 局部避让适配器 | Local Avoidance Adapters
// =============================================================================

export {
    ORCALocalAvoidanceAdapter,
    createORCAAvoidance,
    DEFAULT_ORCA_PARAMS
} from '../adapters/ORCALocalAvoidanceAdapter';
export type { IORCAParams } from '../adapters/ORCALocalAvoidanceAdapter';

// =============================================================================
// 碰撞解决器适配器 | Collision Resolver Adapters
// =============================================================================

export {
    CollisionResolverAdapter,
    createDefaultCollisionResolver
} from '../adapters/CollisionResolverAdapter';

// =============================================================================
// 流量控制器 | Flow Controller
// =============================================================================

export { FlowController, createFlowController } from '../adapters/FlowController';
export { PassPermission, DEFAULT_FLOW_CONTROLLER_CONFIG } from '../interfaces/IFlowController';
export type {
    IFlowController,
    IFlowAgentData,
    IFlowControlResult,
    IFlowControllerConfig,
    ICongestionZone
} from '../interfaces/IFlowController';

