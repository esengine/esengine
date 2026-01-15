/**
 * @zh ORCA 避让算法求解器
 * @en ORCA Avoidance Algorithm Solver
 *
 * @zh 实现 Optimal Reciprocal Collision Avoidance 算法
 * @en Implements Optimal Reciprocal Collision Avoidance algorithm
 *
 * @zh 基于论文 "Reciprocal n-body Collision Avoidance" (van den Berg et al., 2011)
 * @en Based on paper "Reciprocal n-body Collision Avoidance" (van den Berg et al., 2011)
 */

import { Vector2, type IVector2 } from '@esengine/ecs-framework-math';
import type {
    IAvoidanceAgent,
    IObstacle,
    IORCALine,
    IORCASolver,
    IORCASolverConfig
} from './ILocalAvoidance';
import { DEFAULT_ORCA_CONFIG } from './ILocalAvoidance';
import { solveORCALinearProgram } from './LinearProgram';

// =============================================================================
// 常量 | Constants
// =============================================================================

const EPSILON = 0.00001;

// 使用 Vector2 静态方法
const { cross, dot, lengthSq, len } = Vector2;

/**
 * @zh 归一化向量（返回普通对象以避免创建 Vector2 实例）
 * @en Normalize vector (returns plain object to avoid creating Vector2 instance)
 */
function normalize(v: IVector2): IVector2 {
    const length = len(v);
    if (length < EPSILON) {
        return { x: 0, y: 0 };
    }
    return { x: v.x / length, y: v.y / length };
}

// =============================================================================
// ORCA 求解器 | ORCA Solver
// =============================================================================

/**
 * @zh ORCA 求解器
 * @en ORCA Solver
 *
 * @zh 计算代理的最优避让速度
 * @en Computes optimal avoidance velocity for agents
 */
export class ORCASolver implements IORCASolver {
    private readonly config: Required<IORCASolverConfig>;

    constructor(config: IORCASolverConfig = {}) {
        this.config = { ...DEFAULT_ORCA_CONFIG, ...config };
    }

    /**
     * @zh 计算代理的新速度
     * @en Compute new velocity for agent
     */
    computeNewVelocity(
        agent: IAvoidanceAgent,
        neighbors: readonly IAvoidanceAgent[],
        obstacles: readonly IObstacle[],
        deltaTime: number
    ): IVector2 {
        const orcaLines: IORCALine[] = [];

        // 1. 为静态障碍物生成 ORCA 约束线
        const numObstLines = this.createObstacleORCALines(agent, obstacles, orcaLines);

        // 2. 为邻近代理生成 ORCA 约束线
        this.createAgentORCALines(agent, neighbors, deltaTime, orcaLines);

        // 3. 使用线性规划求解最优速度
        const result = solveORCALinearProgram(
            orcaLines,
            numObstLines,
            agent.maxSpeed,
            agent.preferredVelocity
        );

        return result;
    }

    /**
     * @zh 为邻近代理创建 ORCA 约束线
     * @en Create ORCA constraint lines for neighbor agents
     */
    private createAgentORCALines(
        agent: IAvoidanceAgent,
        neighbors: readonly IAvoidanceAgent[],
        deltaTime: number,
        orcaLines: IORCALine[]
    ): void {
        const invTimeHorizon = 1.0 / agent.timeHorizon;

        for (const neighbor of neighbors) {
            if (neighbor.id === agent.id) continue;

            // 相对位置
            const relativePosition: IVector2 = {
                x: neighbor.position.x - agent.position.x,
                y: neighbor.position.y - agent.position.y
            };

            // 相对速度
            const relativeVelocity: IVector2 = {
                x: agent.velocity.x - neighbor.velocity.x,
                y: agent.velocity.y - neighbor.velocity.y
            };

            const distSq = lengthSq(relativePosition);
            const combinedRadius = agent.radius + neighbor.radius;
            const combinedRadiusSq = combinedRadius * combinedRadius;

            const line: IORCALine = {
                point: { x: 0, y: 0 },
                direction: { x: 0, y: 0 }
            };

            let u: IVector2;

            if (distSq > combinedRadiusSq) {
                // 没有碰撞
                // 相对速度在速度障碍外的投影
                const w: IVector2 = {
                    x: relativeVelocity.x - invTimeHorizon * relativePosition.x,
                    y: relativeVelocity.y - invTimeHorizon * relativePosition.y
                };

                const wLengthSq = lengthSq(w);
                const dotProduct1 = dot(w, relativePosition);

                if (dotProduct1 < 0 && dotProduct1 * dotProduct1 > combinedRadiusSq * wLengthSq) {
                    // 投影到截断圆上
                    const wLength = Math.sqrt(wLengthSq);
                    const unitW = normalize(w);

                    line.direction = { x: unitW.y, y: -unitW.x };

                    u = {
                        x: (combinedRadius * invTimeHorizon - wLength) * unitW.x,
                        y: (combinedRadius * invTimeHorizon - wLength) * unitW.y
                    };
                } else {
                    // 投影到圆锥腿上
                    const leg = Math.sqrt(distSq - combinedRadiusSq);

                    if (cross(relativePosition, w) > 0) {
                        // 投影到左腿
                        line.direction = {
                            x: (relativePosition.x * leg - relativePosition.y * combinedRadius) / distSq,
                            y: (relativePosition.x * combinedRadius + relativePosition.y * leg) / distSq
                        };
                    } else {
                        // 投影到右腿
                        line.direction = {
                            x: -(relativePosition.x * leg + relativePosition.y * combinedRadius) / distSq,
                            y: -(-relativePosition.x * combinedRadius + relativePosition.y * leg) / distSq
                        };
                    }

                    const dotProduct2 = dot(relativeVelocity, line.direction);
                    u = {
                        x: dotProduct2 * line.direction.x - relativeVelocity.x,
                        y: dotProduct2 * line.direction.y - relativeVelocity.y
                    };
                }
            } else {
                // 已经碰撞，需要在这一帧内分离
                const invTimeStep = 1.0 / deltaTime;

                // 碰撞时的相对速度
                const w: IVector2 = {
                    x: relativeVelocity.x - invTimeStep * relativePosition.x,
                    y: relativeVelocity.y - invTimeStep * relativePosition.y
                };

                const wLength = len(w);
                const unitW = wLength > EPSILON ? normalize(w) : { x: 0, y: 0 };

                line.direction = { x: unitW.y, y: -unitW.x };

                u = {
                    x: (combinedRadius * invTimeStep - wLength) * unitW.x,
                    y: (combinedRadius * invTimeStep - wLength) * unitW.y
                };
            }

            // ORCA 线：各承担一半避让责任
            line.point = {
                x: agent.velocity.x + 0.5 * u.x,
                y: agent.velocity.y + 0.5 * u.y
            };

            orcaLines.push(line);
        }
    }

    /**
     * @zh 为静态障碍物创建 ORCA 约束线
     * @en Create ORCA constraint lines for static obstacles
     *
     * @returns @zh 障碍物约束线数量 @en Number of obstacle constraint lines
     */
    private createObstacleORCALines(
        agent: IAvoidanceAgent,
        obstacles: readonly IObstacle[],
        orcaLines: IORCALine[]
    ): number {
        const invTimeHorizonObst = 1.0 / agent.timeHorizonObst;
        let numObstLines = 0;

        for (const obstacle of obstacles) {
            const vertices = obstacle.vertices;
            if (vertices.length < 2) continue;

            for (let i = 0; i < vertices.length; i++) {
                const v1 = vertices[i]!;
                const v2 = vertices[(i + 1) % vertices.length]!;

                // 计算代理到障碍物边的相对位置
                const relativePosition1: IVector2 = {
                    x: v1.x - agent.position.x,
                    y: v1.y - agent.position.y
                };
                const relativePosition2: IVector2 = {
                    x: v2.x - agent.position.x,
                    y: v2.y - agent.position.y
                };

                // 检查代理是否已经在障碍物边的内侧
                const obstacleDirection: IVector2 = {
                    x: v2.x - v1.x,
                    y: v2.y - v1.y
                };
                const obstacleLength = len(obstacleDirection);
                if (obstacleLength < EPSILON) continue;

                const unitObstacleDir = normalize(obstacleDirection);

                // 障碍物边的左法线（指向外侧）
                const leftNormal: IVector2 = {
                    x: -unitObstacleDir.y,
                    y: unitObstacleDir.x
                };

                // 检查代理是否在障碍物边的可见侧
                const dot1 = dot(relativePosition1, leftNormal);
                if (dot1 < 0) continue;

                // 计算代理到边的距离
                const projLength = dot(relativePosition1, unitObstacleDir);
                let closestPoint: IVector2;
                let distSq: number;

                if (projLength < 0) {
                    // 最近点是 v1
                    closestPoint = relativePosition1;
                    distSq = lengthSq(relativePosition1);
                } else if (projLength > obstacleLength) {
                    // 最近点是 v2
                    closestPoint = relativePosition2;
                    distSq = lengthSq(relativePosition2);
                } else {
                    // 最近点在边上
                    closestPoint = {
                        x: relativePosition1.x - projLength * unitObstacleDir.x,
                        y: relativePosition1.y - projLength * unitObstacleDir.y
                    };
                    distSq = lengthSq(closestPoint);
                }

                const dist = Math.sqrt(distSq);
                if (dist > agent.neighborDist) continue;

                const line: IORCALine = {
                    point: { x: 0, y: 0 },
                    direction: { x: 0, y: 0 }
                };

                if (dist < agent.radius) {
                    // 已经在障碍物内，立即推开
                    const pushDir = dist > EPSILON ? normalize(closestPoint) : leftNormal;
                    line.direction = { x: pushDir.y, y: -pushDir.x };
                    line.point = {
                        x: agent.velocity.x + (agent.radius - dist) * pushDir.x / this.config.timeStep,
                        y: agent.velocity.y + (agent.radius - dist) * pushDir.y / this.config.timeStep
                    };
                } else {
                    // 正常避让
                    const closestDir = normalize(closestPoint);
                    line.direction = { x: -closestDir.y, y: closestDir.x };

                    const wLength = dist * invTimeHorizonObst - agent.radius * invTimeHorizonObst;
                    line.point = {
                        x: agent.velocity.x + wLength * closestDir.x,
                        y: agent.velocity.y + wLength * closestDir.y
                    };
                }

                orcaLines.push(line);
                numObstLines++;
            }
        }

        return numObstLines;
    }
}

/**
 * @zh 创建 ORCA 求解器
 * @en Create ORCA solver
 */
export function createORCASolver(config?: IORCASolverConfig): ORCASolver {
    return new ORCASolver(config);
}
