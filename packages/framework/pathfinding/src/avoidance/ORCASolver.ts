/**
 * @zh ORCA 避让算法求解器
 * @en ORCA Avoidance Algorithm Solver
 *
 * @zh 实现最优互惠碰撞避免（ORCA）算法，用于多代理局部避让
 * @en Implements Optimal Reciprocal Collision Avoidance (ORCA) algorithm for multi-agent local avoidance
 */

import { Vector2, type IVector2 } from '@esengine/ecs-framework-math';
import type {
    IAvoidanceAgent,
    IObstacle,
    IObstacleVertex,
    IORCALine,
    IORCASolver,
    IORCASolverConfig
} from './ILocalAvoidance';
import { DEFAULT_ORCA_CONFIG } from './ILocalAvoidance';
import { solveORCALinearProgram, type IORCALPResult } from './LinearProgram';
import { buildObstacleVertices } from './ObstacleBuilder';

/**
 * @zh 数值精度阈值
 * @en Numerical precision threshold
 */
const EPSILON = 0.00001;

const { det, dot, lengthSq, len } = Vector2;

/**
 * @zh 向量归一化
 * @en Normalize vector
 */
function normalize(v: IVector2): IVector2 {
    const length = len(v);
    if (length < EPSILON) {
        return { x: 0, y: 0 };
    }
    return { x: v.x / length, y: v.y / length };
}

/**
 * @zh ORCA 求解器实现
 * @en ORCA Solver implementation
 *
 * @zh 实现最优互惠碰撞避免算法，计算代理的安全速度
 * @en Implements Optimal Reciprocal Collision Avoidance algorithm to compute safe velocities for agents
 */
export class ORCASolver implements IORCASolver {
    private readonly config: Required<IORCASolverConfig>;

    constructor(config: IORCASolverConfig = {}) {
        this.config = { ...DEFAULT_ORCA_CONFIG, ...config };
    }

    /**
     * @zh 计算代理的新速度
     * @en Compute new velocity for agent
     *
     * @param agent - @zh 当前代理 @en Current agent
     * @param neighbors - @zh 邻近代理列表 @en List of neighboring agents
     * @param obstacles - @zh 障碍物列表 @en List of obstacles
     * @param deltaTime - @zh 时间步长 @en Time step
     * @returns @zh 计算得到的新速度 @en Computed new velocity
     */
    computeNewVelocity(
        agent: IAvoidanceAgent,
        neighbors: readonly IAvoidanceAgent[],
        obstacles: readonly IObstacle[],
        deltaTime: number
    ): IVector2 {
        const result = this.computeNewVelocityWithResult(agent, neighbors, obstacles, deltaTime);
        return result.velocity;
    }

    /**
     * @zh 计算代理的新速度（带完整结果）
     * @en Compute new velocity for agent (with full result)
     *
     * @param agent - @zh 当前代理 @en Current agent
     * @param neighbors - @zh 邻近代理列表 @en List of neighboring agents
     * @param obstacles - @zh 障碍物列表 @en List of obstacles
     * @param deltaTime - @zh 时间步长 @en Time step
     * @returns @zh 完整求解结果 @en Full solve result
     */
    computeNewVelocityWithResult(
        agent: IAvoidanceAgent,
        neighbors: readonly IAvoidanceAgent[],
        obstacles: readonly IObstacle[],
        deltaTime: number
    ): IORCALPResult & { numLines: number } {
        const orcaLines: IORCALine[] = [];

        const obstacleVertices = buildObstacleVertices(obstacles, {
            yAxisDown: this.config.yAxisDown
        });
        const numObstLines = this.createObstacleORCALines(agent, obstacleVertices, orcaLines);
        this.createAgentORCALines(agent, neighbors, deltaTime, orcaLines);

        const result = solveORCALinearProgram(
            orcaLines,
            numObstLines,
            agent.maxSpeed,
            agent.preferredVelocity
        );

        return {
            ...result,
            numLines: orcaLines.length
        };
    }

    /**
     * @zh 创建代理间的 ORCA 约束线
     * @en Create ORCA constraint lines for agent-agent avoidance
     */
    private createAgentORCALines(
        agent: IAvoidanceAgent,
        neighbors: readonly IAvoidanceAgent[],
        deltaTime: number,
        orcaLines: IORCALine[]
    ): void {
        const invTimeHorizon = 1.0 / agent.timeHorizon;

        for (const other of neighbors) {
            if (other.id === agent.id) continue;

            const relativePosition: IVector2 = {
                x: other.position.x - agent.position.x,
                y: other.position.y - agent.position.y
            };

            const relativeVelocity: IVector2 = {
                x: agent.velocity.x - other.velocity.x,
                y: agent.velocity.y - other.velocity.y
            };

            const distSq = lengthSq(relativePosition);
            const combinedRadius = agent.radius + other.radius;
            const combinedRadiusSq = combinedRadius * combinedRadius;

            const line: IORCALine = {
                point: { x: 0, y: 0 },
                direction: { x: 0, y: 0 }
            };

            let u: IVector2;

            if (distSq > combinedRadiusSq) {
                // @zh 无碰撞情况
                // @en No collision case
                const w: IVector2 = {
                    x: relativeVelocity.x - invTimeHorizon * relativePosition.x,
                    y: relativeVelocity.y - invTimeHorizon * relativePosition.y
                };

                const wLengthSq = lengthSq(w);
                const dotProduct1 = dot(w, relativePosition);

                if (dotProduct1 < 0 && dotProduct1 * dotProduct1 > combinedRadiusSq * wLengthSq) {
                    // @zh 投影到截止圆
                    // @en Project on cut-off circle
                    const wLength = Math.sqrt(wLengthSq);
                    const unitW = normalize(w);

                    line.direction = { x: unitW.y, y: -unitW.x };
                    u = {
                        x: (combinedRadius * invTimeHorizon - wLength) * unitW.x,
                        y: (combinedRadius * invTimeHorizon - wLength) * unitW.y
                    };
                } else {
                    // @zh 投影到腿部
                    // @en Project on legs
                    const leg = Math.sqrt(distSq - combinedRadiusSq);

                    if (det(relativePosition, w) > 0) {
                        line.direction = {
                            x: (relativePosition.x * leg - relativePosition.y * combinedRadius) / distSq,
                            y: (relativePosition.x * combinedRadius + relativePosition.y * leg) / distSq
                        };
                    } else {
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
                // @zh 碰撞情况
                // @en Collision case
                const invTimeStep = 1.0 / deltaTime;

                const w: IVector2 = {
                    x: relativeVelocity.x - invTimeStep * relativePosition.x,
                    y: relativeVelocity.y - invTimeStep * relativePosition.y
                };

                const wLength = len(w);
                const unitW = wLength > EPSILON
                    ? { x: w.x / wLength, y: w.y / wLength }
                    : { x: 1, y: 0 };

                line.direction = { x: unitW.y, y: -unitW.x };
                u = {
                    x: (combinedRadius * invTimeStep - wLength) * unitW.x,
                    y: (combinedRadius * invTimeStep - wLength) * unitW.y
                };
            }

            line.point = {
                x: agent.velocity.x + 0.5 * u.x,
                y: agent.velocity.y + 0.5 * u.y
            };

            orcaLines.push(line);
        }
    }

    /**
     * @zh 创建障碍物的 ORCA 约束线
     * @en Create ORCA constraint lines for obstacle avoidance
     */
    private createObstacleORCALines(
        agent: IAvoidanceAgent,
        obstacleVertices: IObstacleVertex[],
        orcaLines: IORCALine[]
    ): number {
        const invTimeHorizonObst = 1.0 / agent.timeHorizonObst;
        const radiusSq = agent.radius * agent.radius;
        let numObstLines = 0;

        for (const obstacle1 of obstacleVertices) {
            const obstacle2 = obstacle1.next;

            const relativePosition1: IVector2 = {
                x: obstacle1.point.x - agent.position.x,
                y: obstacle1.point.y - agent.position.y
            };
            const relativePosition2: IVector2 = {
                x: obstacle2.point.x - agent.position.x,
                y: obstacle2.point.y - agent.position.y
            };

            // @zh 跳过代理位于内侧的边（对于 CCW 多边形，内侧在左边）
            // @en Skip edges where agent is on interior side (for CCW polygons, interior is on left)
            const obstacleVector: IVector2 = {
                x: obstacle2.point.x - obstacle1.point.x,
                y: obstacle2.point.y - obstacle1.point.y
            };
            const signedDistToEdge = det(obstacleVector, relativePosition1);

            if (signedDistToEdge < -EPSILON) {
                continue;
            }

            // @zh 检查是否已被现有 ORCA 线覆盖
            // @en Check if already covered by existing ORCA lines
            let alreadyCovered = false;
            for (const existingLine of orcaLines) {
                const scaledRelPos1: IVector2 = {
                    x: invTimeHorizonObst * relativePosition1.x - existingLine.point.x,
                    y: invTimeHorizonObst * relativePosition1.y - existingLine.point.y
                };
                const scaledRelPos2: IVector2 = {
                    x: invTimeHorizonObst * relativePosition2.x - existingLine.point.x,
                    y: invTimeHorizonObst * relativePosition2.y - existingLine.point.y
                };

                if (det(scaledRelPos1, existingLine.direction) - invTimeHorizonObst * agent.radius >= -EPSILON &&
                    det(scaledRelPos2, existingLine.direction) - invTimeHorizonObst * agent.radius >= -EPSILON) {
                    alreadyCovered = true;
                    break;
                }
            }

            if (alreadyCovered) {
                continue;
            }

            const distSq1 = lengthSq(relativePosition1);
            const distSq2 = lengthSq(relativePosition2);
            const obstacleVectorSq = lengthSq(obstacleVector);

            const s = obstacleVectorSq > EPSILON
                ? -dot(relativePosition1, obstacleVector) / obstacleVectorSq
                : 0;

            const distSqLineToEdge = lengthSq({
                x: -relativePosition1.x - s * obstacleVector.x,
                y: -relativePosition1.y - s * obstacleVector.y
            });

            const line: IORCALine = {
                point: { x: 0, y: 0 },
                direction: { x: 0, y: 0 }
            };

            // @zh 与左顶点碰撞
            // @en Collision with left vertex
            if (s < 0 && distSq1 <= radiusSq) {
                if (obstacle1.isConvex) {
                    line.point = { x: 0, y: 0 };
                    line.direction = normalize({ x: -relativePosition1.y, y: relativePosition1.x });
                    orcaLines.push(line);
                    numObstLines++;
                }
                continue;
            }

            // @zh 与右顶点碰撞
            // @en Collision with right vertex
            if (s > 1 && distSq2 <= radiusSq) {
                if (obstacle2.isConvex && det(relativePosition2, obstacle2.direction) >= 0) {
                    line.point = { x: 0, y: 0 };
                    line.direction = normalize({ x: -relativePosition2.y, y: relativePosition2.x });
                    orcaLines.push(line);
                    numObstLines++;
                }
                continue;
            }

            // @zh 与边碰撞
            // @en Collision with edge segment
            if (s >= 0 && s <= 1 && distSqLineToEdge <= radiusSq) {
                line.point = { x: 0, y: 0 };
                line.direction = { x: -obstacle1.direction.x, y: -obstacle1.direction.y };
                orcaLines.push(line);
                numObstLines++;
                continue;
            }

            // @zh 无碰撞 - 计算腿部方向
            // @en No collision - compute leg directions
            let obs1 = obstacle1;
            let obs2 = obstacle2;
            let leftLegDirection: IVector2;
            let rightLegDirection: IVector2;

            if (s < 0 && distSqLineToEdge <= radiusSq) {
                // @zh 从左顶点斜视
                // @en Obliquely viewed from left vertex
                if (!obstacle1.isConvex) continue;
                obs2 = obstacle1;

                const leg1 = Math.sqrt(Math.max(0, distSq1 - radiusSq));
                leftLegDirection = {
                    x: (relativePosition1.x * leg1 - relativePosition1.y * agent.radius) / distSq1,
                    y: (relativePosition1.x * agent.radius + relativePosition1.y * leg1) / distSq1
                };
                rightLegDirection = {
                    x: (relativePosition1.x * leg1 + relativePosition1.y * agent.radius) / distSq1,
                    y: (-relativePosition1.x * agent.radius + relativePosition1.y * leg1) / distSq1
                };
            } else if (s > 1 && distSqLineToEdge <= radiusSq) {
                // @zh 从右顶点斜视
                // @en Obliquely viewed from right vertex
                if (!obstacle2.isConvex) continue;
                obs1 = obstacle2;

                const leg2 = Math.sqrt(Math.max(0, distSq2 - radiusSq));
                leftLegDirection = {
                    x: (relativePosition2.x * leg2 - relativePosition2.y * agent.radius) / distSq2,
                    y: (relativePosition2.x * agent.radius + relativePosition2.y * leg2) / distSq2
                };
                rightLegDirection = {
                    x: (relativePosition2.x * leg2 + relativePosition2.y * agent.radius) / distSq2,
                    y: (-relativePosition2.x * agent.radius + relativePosition2.y * leg2) / distSq2
                };
            } else {
                // @zh 正常情况
                // @en Normal case
                if (obstacle1.isConvex) {
                    const leg1 = Math.sqrt(Math.max(0, distSq1 - radiusSq));
                    leftLegDirection = {
                        x: (relativePosition1.x * leg1 - relativePosition1.y * agent.radius) / distSq1,
                        y: (relativePosition1.x * agent.radius + relativePosition1.y * leg1) / distSq1
                    };
                } else {
                    leftLegDirection = { x: -obstacle1.direction.x, y: -obstacle1.direction.y };
                }

                if (obstacle2.isConvex) {
                    const leg2 = Math.sqrt(Math.max(0, distSq2 - radiusSq));
                    rightLegDirection = {
                        x: (relativePosition2.x * leg2 + relativePosition2.y * agent.radius) / distSq2,
                        y: (-relativePosition2.x * agent.radius + relativePosition2.y * leg2) / distSq2
                    };
                } else {
                    rightLegDirection = { x: obstacle1.direction.x, y: obstacle1.direction.y };
                }
            }

            // @zh 检查外部腿
            // @en Check for foreign legs
            const leftNeighbor = obs1.previous;
            let isLeftLegForeign = false;
            let isRightLegForeign = false;

            if (obs1.isConvex) {
                const negLeftNeighborDir = { x: -leftNeighbor.direction.x, y: -leftNeighbor.direction.y };
                if (det(leftLegDirection, negLeftNeighborDir) >= 0) {
                    leftLegDirection = negLeftNeighborDir;
                    isLeftLegForeign = true;
                }
            }

            if (obs2.isConvex) {
                if (det(rightLegDirection, obs2.direction) <= 0) {
                    rightLegDirection = { x: obs2.direction.x, y: obs2.direction.y };
                    isRightLegForeign = true;
                }
            }

            // @zh 计算截止中心点
            // @en Compute cut-off centers
            const leftCutoff: IVector2 = {
                x: invTimeHorizonObst * (obs1.point.x - agent.position.x),
                y: invTimeHorizonObst * (obs1.point.y - agent.position.y)
            };
            const rightCutoff: IVector2 = {
                x: invTimeHorizonObst * (obs2.point.x - agent.position.x),
                y: invTimeHorizonObst * (obs2.point.y - agent.position.y)
            };
            const cutoffVector: IVector2 = {
                x: rightCutoff.x - leftCutoff.x,
                y: rightCutoff.y - leftCutoff.y
            };

            const sameVertex = obs1 === obs2;
            const cutoffVectorSq = lengthSq(cutoffVector);
            const t = sameVertex
                ? 0.5
                : (cutoffVectorSq > EPSILON
                    ? dot({ x: agent.velocity.x - leftCutoff.x, y: agent.velocity.y - leftCutoff.y }, cutoffVector) / cutoffVectorSq
                    : 0.5);

            const tLeft = dot({ x: agent.velocity.x - leftCutoff.x, y: agent.velocity.y - leftCutoff.y }, leftLegDirection);
            const tRight = dot({ x: agent.velocity.x - rightCutoff.x, y: agent.velocity.y - rightCutoff.y }, rightLegDirection);

            // @zh 投影到左截止圆
            // @en Project on left cut-off circle
            if ((t < 0 && tLeft < 0) || (sameVertex && tLeft < 0 && tRight < 0)) {
                const unitW = normalize({ x: agent.velocity.x - leftCutoff.x, y: agent.velocity.y - leftCutoff.y });
                line.direction = { x: unitW.y, y: -unitW.x };
                line.point = {
                    x: leftCutoff.x + agent.radius * invTimeHorizonObst * unitW.x,
                    y: leftCutoff.y + agent.radius * invTimeHorizonObst * unitW.y
                };
                orcaLines.push(line);
                numObstLines++;
                continue;
            }

            // @zh 投影到右截止圆
            // @en Project on right cut-off circle
            if (t > 1 && tRight < 0) {
                const unitW = normalize({ x: agent.velocity.x - rightCutoff.x, y: agent.velocity.y - rightCutoff.y });
                line.direction = { x: unitW.y, y: -unitW.x };
                line.point = {
                    x: rightCutoff.x + agent.radius * invTimeHorizonObst * unitW.x,
                    y: rightCutoff.y + agent.radius * invTimeHorizonObst * unitW.y
                };
                orcaLines.push(line);
                numObstLines++;
                continue;
            }

            // @zh 计算投影距离
            // @en Compute projection distances
            const distSqCutoff = (t < 0 || t > 1 || sameVertex)
                ? Infinity
                : lengthSq({
                    x: agent.velocity.x - (leftCutoff.x + t * cutoffVector.x),
                    y: agent.velocity.y - (leftCutoff.y + t * cutoffVector.y)
                });

            const distSqLeft = tLeft < 0
                ? Infinity
                : lengthSq({
                    x: agent.velocity.x - (leftCutoff.x + tLeft * leftLegDirection.x),
                    y: agent.velocity.y - (leftCutoff.y + tLeft * leftLegDirection.y)
                });

            const distSqRight = tRight < 0
                ? Infinity
                : lengthSq({
                    x: agent.velocity.x - (rightCutoff.x + tRight * rightLegDirection.x),
                    y: agent.velocity.y - (rightCutoff.y + tRight * rightLegDirection.y)
                });

            // @zh 投影到截止线
            // @en Project on cut-off line
            if (distSqCutoff <= distSqLeft && distSqCutoff <= distSqRight) {
                line.direction = { x: -obs1.direction.x, y: -obs1.direction.y };
                line.point = {
                    x: leftCutoff.x + agent.radius * invTimeHorizonObst * (-line.direction.y),
                    y: leftCutoff.y + agent.radius * invTimeHorizonObst * line.direction.x
                };
                orcaLines.push(line);
                numObstLines++;
                continue;
            }

            // @zh 投影到左腿
            // @en Project on left leg
            if (distSqLeft <= distSqRight) {
                if (isLeftLegForeign) {
                    continue;
                }

                line.direction = { x: leftLegDirection.x, y: leftLegDirection.y };
                line.point = {
                    x: leftCutoff.x + agent.radius * invTimeHorizonObst * (-line.direction.y),
                    y: leftCutoff.y + agent.radius * invTimeHorizonObst * line.direction.x
                };
                orcaLines.push(line);
                numObstLines++;
                continue;
            }

            // @zh 投影到右腿
            // @en Project on right leg
            if (isRightLegForeign) {
                continue;
            }

            line.direction = { x: -rightLegDirection.x, y: -rightLegDirection.y };
            line.point = {
                x: rightCutoff.x + agent.radius * invTimeHorizonObst * (-line.direction.y),
                y: rightCutoff.y + agent.radius * invTimeHorizonObst * line.direction.x
            };
            orcaLines.push(line);
            numObstLines++;
        }

        return numObstLines;
    }
}

/**
 * @zh 创建 ORCA 求解器
 * @en Create ORCA solver
 *
 * @param config - @zh 可选配置参数 @en Optional configuration parameters
 * @returns @zh ORCA 求解器实例 @en ORCA solver instance
 */
export function createORCASolver(config?: IORCASolverConfig): ORCASolver {
    return new ORCASolver(config);
}
