/**
 * @zh 适配器模块
 * @en Adapters Module
 *
 * @zh 将现有算法实现适配到统一接口
 * @en Adapts existing algorithm implementations to unified interfaces
 */

// =============================================================================
// 路径规划器适配器 | Path Planner Adapters
// =============================================================================

export {
    NavMeshPathPlannerAdapter,
    createNavMeshPathPlanner
} from './NavMeshPathPlannerAdapter';

export {
    GridPathfinderAdapter,
    createAStarPlanner,
    createJPSPlanner,
    createHPAPlanner
} from './GridPathfinderAdapter';
export type { IGridPathfinderAdapterConfig } from './GridPathfinderAdapter';

export {
    IncrementalGridPathPlannerAdapter,
    createIncrementalAStarPlanner
} from './IncrementalGridPathPlannerAdapter';
export type { IIncrementalGridPathPlannerConfig } from './IncrementalGridPathPlannerAdapter';

// =============================================================================
// 局部避让适配器 | Local Avoidance Adapters
// =============================================================================

export {
    ORCALocalAvoidanceAdapter,
    createORCAAvoidance,
    DEFAULT_ORCA_PARAMS
} from './ORCALocalAvoidanceAdapter';
export type { IORCAParams } from './ORCALocalAvoidanceAdapter';

// =============================================================================
// 碰撞解决器适配器 | Collision Resolver Adapters
// =============================================================================

export {
    CollisionResolverAdapter,
    createDefaultCollisionResolver
} from './CollisionResolverAdapter';

// =============================================================================
// 流量控制器 | Flow Controller
// =============================================================================

export {
    FlowController,
    createFlowController
} from './FlowController';
