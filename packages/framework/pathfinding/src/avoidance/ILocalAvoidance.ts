/**
 * @zh ORCA 局部避让接口定义
 * @en ORCA Local Avoidance Interface Definitions
 */

import type { IVector2 } from '@esengine/ecs-framework-math';

export type { IVector2 };

/**
 * @zh ORCA 约束线（半平面）
 * @en ORCA constraint line (half-plane)
 *
 * @zh 约束线定义了一个半平面，代理的速度必须在允许的一侧
 * @en A constraint line defines a half-plane, agent's velocity must be on the allowed side
 */
export interface IORCALine {
    /**
     * @zh 线上的一点
     * @en A point on the line
     */
    point: IVector2;

    /**
     * @zh 线的方向向量（单位向量，允许区域在左侧）
     * @en Direction vector of the line (unit vector, allowed region is on the left)
     */
    direction: IVector2;
}

// =============================================================================
// 代理数据 | Agent Data
// =============================================================================

/**
 * @zh 避让代理数据
 * @en Avoidance agent data
 *
 * @zh 包含计算 ORCA 所需的所有代理信息
 * @en Contains all agent information needed for ORCA computation
 */
export interface IAvoidanceAgent {
    /**
     * @zh 代理唯一标识
     * @en Unique identifier for the agent
     */
    id: number;

    /**
     * @zh 当前位置
     * @en Current position
     */
    position: IVector2;

    /**
     * @zh 当前速度
     * @en Current velocity
     */
    velocity: IVector2;

    /**
     * @zh 首选速度（通常指向目标方向）
     * @en Preferred velocity (usually towards target)
     */
    preferredVelocity: IVector2;

    /**
     * @zh 代理半径
     * @en Agent radius
     */
    radius: number;

    /**
     * @zh 最大速度
     * @en Maximum speed
     */
    maxSpeed: number;

    /**
     * @zh 邻居检测距离
     * @en Neighbor detection distance
     */
    neighborDist: number;

    /**
     * @zh 最大邻居数量
     * @en Maximum number of neighbors to consider
     */
    maxNeighbors: number;

    /**
     * @zh 代理避让时间视野（秒）
     * @en Time horizon for agent avoidance (seconds)
     *
     * @zh 更大的值会让代理更早开始避让
     * @en Larger values make agents start avoiding earlier
     */
    timeHorizon: number;

    /**
     * @zh 障碍物避让时间视野（秒）
     * @en Time horizon for obstacle avoidance (seconds)
     */
    timeHorizonObst: number;
}

// =============================================================================
// 障碍物 | Obstacles
// =============================================================================

/**
 * @zh 静态障碍物顶点
 * @en Static obstacle vertex
 */
export interface IObstacleVertex {
    /**
     * @zh 顶点位置
     * @en Vertex position
     */
    point: IVector2;

    /**
     * @zh 下一个顶点（构成障碍物边）
     * @en Next vertex (forms obstacle edge)
     */
    next: IObstacleVertex | null;

    /**
     * @zh 前一个顶点
     * @en Previous vertex
     */
    prev: IObstacleVertex | null;

    /**
     * @zh 边的单位方向向量（指向下一个顶点）
     * @en Unit direction vector of edge (towards next vertex)
     */
    direction: IVector2;

    /**
     * @zh 是否为凸顶点
     * @en Whether this is a convex vertex
     */
    isConvex: boolean;
}

/**
 * @zh 静态障碍物（多边形）
 * @en Static obstacle (polygon)
 *
 * @zh 顶点按逆时针顺序排列
 * @en Vertices are ordered counter-clockwise
 */
export interface IObstacle {
    /**
     * @zh 顶点列表（逆时针顺序）
     * @en Vertex list (counter-clockwise order)
     */
    vertices: IVector2[];
}

// =============================================================================
// 求解器接口 | Solver Interface
// =============================================================================

/**
 * @zh ORCA 求解器配置
 * @en ORCA solver configuration
 */
export interface IORCASolverConfig {
    /**
     * @zh 默认时间视野（代理）
     * @en Default time horizon for agents
     */
    defaultTimeHorizon?: number;

    /**
     * @zh 默认时间视野（障碍物）
     * @en Default time horizon for obstacles
     */
    defaultTimeHorizonObst?: number;

    /**
     * @zh 时间步长（用于碰撞响应）
     * @en Time step (for collision response)
     */
    timeStep?: number;

    /**
     * @zh 数值精度阈值
     * @en Numerical precision threshold
     */
    epsilon?: number;
}

/**
 * @zh ORCA 求解结果
 * @en ORCA solve result
 */
export interface IORCAResult {
    /**
     * @zh 计算得到的新速度
     * @en Computed new velocity
     */
    velocity: IVector2;

    /**
     * @zh 是否找到可行解
     * @en Whether a feasible solution was found
     */
    feasible: boolean;

    /**
     * @zh 生成的 ORCA 约束线数量
     * @en Number of ORCA lines generated
     */
    numLines: number;
}

/**
 * @zh ORCA 求解器接口
 * @en ORCA solver interface
 */
export interface IORCASolver {
    /**
     * @zh 计算代理的新速度
     * @en Compute new velocity for agent
     *
     * @param agent - @zh 当前代理 @en Current agent
     * @param neighbors - @zh 邻近代理列表 @en List of neighbor agents
     * @param obstacles - @zh 静态障碍物列表 @en List of static obstacles
     * @param deltaTime - @zh 时间步长 @en Time step
     * @returns @zh 新速度 @en New velocity
     */
    computeNewVelocity(
        agent: IAvoidanceAgent,
        neighbors: readonly IAvoidanceAgent[],
        obstacles: readonly IObstacle[],
        deltaTime: number
    ): IVector2;
}

// =============================================================================
// 空间索引接口 | Spatial Index Interface
// =============================================================================

/**
 * @zh 邻居查询结果
 * @en Neighbor query result
 */
export interface INeighborResult {
    /**
     * @zh 代理数据
     * @en Agent data
     */
    agent: IAvoidanceAgent;

    /**
     * @zh 距离的平方
     * @en Squared distance
     */
    distanceSq: number;
}

/**
 * @zh 空间索引接口（用于快速邻居查询）
 * @en Spatial index interface (for fast neighbor queries)
 */
export interface ISpatialIndex {
    /**
     * @zh 构建空间索引
     * @en Build spatial index
     *
     * @param agents - @zh 代理列表 @en List of agents
     */
    build(agents: readonly IAvoidanceAgent[]): void;

    /**
     * @zh 查询指定范围内的邻居
     * @en Query neighbors within specified range
     *
     * @param position - @zh 查询位置 @en Query position
     * @param radius - @zh 查询半径 @en Query radius
     * @param maxResults - @zh 最大返回数量 @en Maximum number of results
     * @param excludeId - @zh 排除的代理 ID @en Agent ID to exclude
     * @returns @zh 邻居列表（按距离排序）@en List of neighbors (sorted by distance)
     */
    queryNeighbors(
        position: IVector2,
        radius: number,
        maxResults: number,
        excludeId?: number
    ): INeighborResult[];

    /**
     * @zh 清空索引
     * @en Clear the index
     */
    clear(): void;
}

// =============================================================================
// 默认配置 | Default Configuration
// =============================================================================

/**
 * @zh 默认 ORCA 求解器配置
 * @en Default ORCA solver configuration
 */
export const DEFAULT_ORCA_CONFIG: Required<IORCASolverConfig> = {
    defaultTimeHorizon: 2.0,
    defaultTimeHorizonObst: 1.0,
    timeStep: 1 / 60,
    epsilon: 0.00001
};

/**
 * @zh 默认代理参数
 * @en Default agent parameters
 */
export const DEFAULT_AGENT_PARAMS = {
    radius: 0.5,
    maxSpeed: 5.0,
    neighborDist: 15.0,
    maxNeighbors: 10,
    timeHorizon: 2.0,
    timeHorizonObst: 1.0
};
