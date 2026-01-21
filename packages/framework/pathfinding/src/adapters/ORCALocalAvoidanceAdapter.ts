/**
 * @zh ORCA 局部避让适配器
 * @en ORCA Local Avoidance Adapter
 *
 * @zh 将现有 ORCA 求解器适配到 ILocalAvoidance 接口
 * @en Adapts existing ORCA solver to ILocalAvoidance interface
 */

import type {
    ILocalAvoidance,
    IAvoidanceAgentData,
    IObstacleData,
    IAvoidanceResult
} from '../interfaces/ILocalAvoidance';
import { ORCASolver, createORCASolver } from '../avoidance/ORCASolver';
import { KDTree, createKDTree } from '../avoidance/KDTree';
import type { IAvoidanceAgent, IORCASolverConfig, IObstacle } from '../avoidance/ILocalAvoidance';

/**
 * @zh ORCA 默认参数
 * @en ORCA default parameters
 */
export interface IORCAParams {
    /**
     * @zh 邻居检测距离
     * @en Neighbor detection distance
     */
    neighborDist: number;

    /**
     * @zh 最大邻居数量
     * @en Maximum number of neighbors
     */
    maxNeighbors: number;

    /**
     * @zh 代理避让时间视野
     * @en Time horizon for agent avoidance
     */
    timeHorizon: number;

    /**
     * @zh 障碍物避让时间视野
     * @en Time horizon for obstacle avoidance
     */
    timeHorizonObst: number;
}

/**
 * @zh ORCA 默认参数值
 * @en ORCA default parameter values
 */
export const DEFAULT_ORCA_PARAMS: IORCAParams = {
    neighborDist: 15.0,
    maxNeighbors: 10,
    timeHorizon: 2.0,
    timeHorizonObst: 1.0
};

/**
 * @zh ORCA 局部避让适配器
 * @en ORCA local avoidance adapter
 *
 * @example
 * ```typescript
 * const avoidance = createORCAAvoidance();
 * navSystem.setLocalAvoidance(avoidance);
 *
 * // 自定义参数
 * const avoidance = createORCAAvoidance({
 *     timeStep: 1/60
 * });
 * avoidance.setDefaultParams({ timeHorizon: 3.0 });
 * ```
 */
export class ORCALocalAvoidanceAdapter implements ILocalAvoidance {
    readonly type = 'orca';

    private solver: ORCASolver;
    private kdTree: KDTree;
    private defaultParams: IORCAParams;

    constructor(config?: IORCASolverConfig) {
        this.solver = createORCASolver(config);
        this.kdTree = createKDTree();
        this.defaultParams = { ...DEFAULT_ORCA_PARAMS };
    }

    /**
     * @zh 设置默认 ORCA 参数
     * @en Set default ORCA parameters
     *
     * @param params - @zh 参数 @en Parameters
     */
    setDefaultParams(params: Partial<IORCAParams>): void {
        Object.assign(this.defaultParams, params);
    }

    /**
     * @zh 获取默认 ORCA 参数
     * @en Get default ORCA parameters
     */
    getDefaultParams(): Readonly<IORCAParams> {
        return this.defaultParams;
    }

    computeAvoidanceVelocity(
        agent: IAvoidanceAgentData,
        neighbors: readonly IAvoidanceAgentData[],
        obstacles: readonly IObstacleData[],
        deltaTime: number
    ): IAvoidanceResult {
        const orcaAgent = this.toORCAAgent(agent);
        const orcaNeighbors = neighbors.map(n => this.toORCAAgent(n));
        const orcaObstacles = obstacles.map(o => this.toORCAObstacle(o));

        const result = this.solver.computeNewVelocityWithResult(
            orcaAgent,
            orcaNeighbors,
            orcaObstacles,
            deltaTime
        );

        return {
            velocity: result.velocity,
            feasible: result.feasible
        };
    }

    computeBatchAvoidance(
        agents: readonly IAvoidanceAgentData[],
        obstacles: readonly IObstacleData[],
        deltaTime: number
    ): Map<number, IAvoidanceResult> {
        const results = new Map<number, IAvoidanceResult>();
        const orcaAgents = agents.map(a => this.toORCAAgent(a));
        const orcaObstacles = obstacles.map(o => this.toORCAObstacle(o));

        this.kdTree.build(orcaAgents);

        for (let i = 0; i < agents.length; i++) {
            const agent = orcaAgents[i]!;

            const neighborResults = this.kdTree.queryNeighbors(
                agent.position,
                agent.neighborDist,
                agent.maxNeighbors,
                agent.id
            );

            const result = this.solver.computeNewVelocityWithResult(
                agent,
                neighborResults.map(r => r.agent),
                orcaObstacles,
                deltaTime
            );

            results.set(agents[i]!.id, {
                velocity: result.velocity,
                feasible: result.feasible
            });
        }

        return results;
    }

    dispose(): void {
        this.kdTree.clear();
    }

    private toORCAAgent(agent: IAvoidanceAgentData): IAvoidanceAgent {
        return {
            id: agent.id,
            position: { x: agent.position.x, y: agent.position.y },
            velocity: { x: agent.velocity.x, y: agent.velocity.y },
            preferredVelocity: { x: agent.preferredVelocity.x, y: agent.preferredVelocity.y },
            radius: agent.radius,
            maxSpeed: agent.maxSpeed,
            neighborDist: this.defaultParams.neighborDist,
            maxNeighbors: this.defaultParams.maxNeighbors,
            timeHorizon: this.defaultParams.timeHorizon,
            timeHorizonObst: this.defaultParams.timeHorizonObst
        };
    }

    private toORCAObstacle(obstacle: IObstacleData): IObstacle {
        return {
            vertices: obstacle.vertices.map(v => ({ x: v.x, y: v.y }))
        };
    }
}

/**
 * @zh 创建 ORCA 局部避让
 * @en Create ORCA local avoidance
 *
 * @param config - @zh ORCA 求解器配置 @en ORCA solver configuration
 * @returns @zh 局部避让实例 @en Local avoidance instance
 *
 * @example
 * ```typescript
 * const avoidance = createORCAAvoidance();
 * navSystem.setLocalAvoidance(avoidance);
 * ```
 */
export function createORCAAvoidance(config?: IORCASolverConfig): ORCALocalAvoidanceAdapter {
    return new ORCALocalAvoidanceAdapter(config);
}
