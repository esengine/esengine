/**
 * @zh ORCA 局部避让模块
 * @en ORCA Local Avoidance Module
 *
 * @zh 提供基于 ORCA 算法的多代理局部避让功能
 * @en Provides multi-agent local avoidance based on ORCA algorithm
 */

// =============================================================================
// 接口和类型 | Interfaces and Types
// =============================================================================

export type {
    IVector2,
    IORCALine,
    IAvoidanceAgent,
    IObstacleVertex,
    IObstacle,
    IORCASolverConfig,
    IORCAResult,
    IORCASolver,
    INeighborResult,
    ISpatialIndex
} from './ILocalAvoidance';

export {
    DEFAULT_ORCA_CONFIG,
    DEFAULT_AGENT_PARAMS
} from './ILocalAvoidance';

// =============================================================================
// 核心算法 | Core Algorithm
// =============================================================================

export {
    ORCASolver,
    createORCASolver
} from './ORCASolver';

export {
    linearProgram2,
    linearProgram3,
    solveORCALinearProgram
} from './LinearProgram';

export {
    createObstacleVertices,
    buildObstacleVertices,
    ensureCCW
} from './ObstacleBuilder';

// =============================================================================
// 空间索引 | Spatial Index
// =============================================================================

export {
    KDTree,
    createKDTree
} from './KDTree';
