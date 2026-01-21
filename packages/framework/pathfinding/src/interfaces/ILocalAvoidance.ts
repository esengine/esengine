/**
 * @zh 局部避让接口
 * @en Local Avoidance Interface
 *
 * @zh 统一的局部避让接口，支持 ORCA、RVO、Steering Behaviors 等算法
 * @en Unified local avoidance interface, supports ORCA, RVO, Steering Behaviors, etc.
 */

import type { IVector2 } from './IPathPlanner';

/**
 * @zh 避让代理数据（算法无关）
 * @en Avoidance agent data (algorithm-agnostic)
 */
export interface IAvoidanceAgentData {
    /**
     * @zh 代理唯一标识
     * @en Unique agent identifier
     */
    readonly id: number;

    /**
     * @zh 当前位置
     * @en Current position
     */
    readonly position: IVector2;

    /**
     * @zh 当前速度
     * @en Current velocity
     */
    readonly velocity: IVector2;

    /**
     * @zh 首选速度（通常指向路径下一点）
     * @en Preferred velocity (usually towards next path point)
     */
    readonly preferredVelocity: IVector2;

    /**
     * @zh 代理半径
     * @en Agent radius
     */
    readonly radius: number;

    /**
     * @zh 最大速度
     * @en Maximum speed
     */
    readonly maxSpeed: number;
}

/**
 * @zh 静态障碍物数据
 * @en Static obstacle data
 */
export interface IObstacleData {
    /**
     * @zh 障碍物顶点（逆时针顺序）
     * @en Obstacle vertices (counter-clockwise order)
     */
    readonly vertices: readonly IVector2[];
}

/**
 * @zh 局部避让计算结果
 * @en Local avoidance computation result
 */
export interface IAvoidanceResult {
    /**
     * @zh 计算得到的新速度
     * @en Computed new velocity
     */
    readonly velocity: IVector2;

    /**
     * @zh 是否找到可行解
     * @en Whether a feasible solution was found
     */
    readonly feasible: boolean;
}

/**
 * @zh 局部避让接口
 * @en Local avoidance interface
 *
 * @zh 统一的局部避让接口，支持 ORCA、RVO、Steering Behaviors 等算法
 * @en Unified local avoidance interface, supports ORCA, RVO, Steering Behaviors, etc.
 *
 * @example
 * ```typescript
 * // 使用 ORCA 避让
 * const avoidance = createORCAAvoidance();
 * const result = avoidance.computeAvoidanceVelocity(
 *     agent, neighbors, obstacles, deltaTime
 * );
 *
 * // 批量计算
 * const results = avoidance.computeBatchAvoidance(agents, obstacles, deltaTime);
 * ```
 */
export interface ILocalAvoidance {
    /**
     * @zh 避让算法类型标识
     * @en Avoidance algorithm type identifier
     */
    readonly type: string;

    /**
     * @zh 计算代理的避让速度
     * @en Compute avoidance velocity for agent
     *
     * @param agent - @zh 当前代理数据 @en Current agent data
     * @param neighbors - @zh 邻近代理列表 @en List of neighboring agents
     * @param obstacles - @zh 静态障碍物列表 @en List of static obstacles
     * @param deltaTime - @zh 时间步长 @en Time step
     * @returns @zh 避让计算结果 @en Avoidance computation result
     */
    computeAvoidanceVelocity(
        agent: IAvoidanceAgentData,
        neighbors: readonly IAvoidanceAgentData[],
        obstacles: readonly IObstacleData[],
        deltaTime: number
    ): IAvoidanceResult;

    /**
     * @zh 批量计算多个代理的避让速度（性能优化）
     * @en Batch compute avoidance velocities for multiple agents (performance optimization)
     *
     * @param agents - @zh 代理列表 @en List of agents
     * @param obstacles - @zh 静态障碍物列表 @en List of static obstacles
     * @param deltaTime - @zh 时间步长 @en Time step
     * @returns @zh 每个代理的避让结果（按 ID 索引）@en Avoidance results for each agent (indexed by ID)
     */
    computeBatchAvoidance(
        agents: readonly IAvoidanceAgentData[],
        obstacles: readonly IObstacleData[],
        deltaTime: number
    ): Map<number, IAvoidanceResult>;

    /**
     * @zh 释放资源
     * @en Dispose resources
     */
    dispose(): void;
}
