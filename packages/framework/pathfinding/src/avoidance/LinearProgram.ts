/**
 * @zh 2D 线性规划求解器
 * @en 2D Linear Programming Solver
 *
 * @zh 用于 ORCA 算法中的速度优化求解
 * @en Used for velocity optimization in ORCA algorithm
 */

import { Vector2, type IVector2 } from '@esengine/ecs-framework-math';
import type { IORCALine } from './ILocalAvoidance';

// =============================================================================
// 常量 | Constants
// =============================================================================

/**
 * @zh 数值精度阈值
 * @en Numerical precision threshold
 */
const EPSILON = 0.00001;

const { dot, det, lengthSq } = Vector2;

// =============================================================================
// 线性规划求解 | Linear Programming Solver
// =============================================================================

/**
 * @zh 1D 线性规划
 * @en 1D Linear Programming
 *
 * @zh 在一条线上找到满足约束的最优点
 * @en Find optimal point on a line that satisfies constraints
 *
 * @param lines - @zh 约束线列表 @en List of constraint lines
 * @param lineNo - @zh 当前处理的线索引 @en Index of current line being processed
 * @param radius - @zh 最大速度（圆盘半径）@en Maximum speed (disk radius)
 * @param optVelocity - @zh 首选速度 @en Preferred velocity
 * @param directionOpt - @zh 是否优化方向 @en Whether to optimize direction
 * @param result - @zh 结果向量（输出）@en Result vector (output)
 * @returns @zh 是否找到可行解 @en Whether a feasible solution was found
 */
function linearProgram1(
    lines: readonly IORCALine[],
    lineNo: number,
    radius: number,
    optVelocity: IVector2,
    directionOpt: boolean,
    result: Vector2
): boolean {
    const line = lines[lineNo]!;
    const dotProduct = dot(line.point, line.direction);
    const discriminant = dotProduct * dotProduct + radius * radius - lengthSq(line.point);

    if (discriminant < 0) {
        return false;
    }

    const sqrtDiscriminant = Math.sqrt(discriminant);
    let tLeft = -dotProduct - sqrtDiscriminant;
    let tRight = -dotProduct + sqrtDiscriminant;

    for (let i = 0; i < lineNo; i++) {
        const constraint = lines[i]!;
        const denominator = det(line.direction, constraint.direction);
        const numerator = det(constraint.direction, {
            x: line.point.x - constraint.point.x,
            y: line.point.y - constraint.point.y
        });

        if (Math.abs(denominator) <= EPSILON) {
            if (numerator < 0) {
                return false;
            }
            continue;
        }

        const t = numerator / denominator;

        if (denominator >= 0) {
            tRight = Math.min(tRight, t);
        } else {
            tLeft = Math.max(tLeft, t);
        }

        if (tLeft > tRight) {
            return false;
        }
    }

    let t: number;
    if (directionOpt) {
        if (dot(optVelocity, line.direction) > 0) {
            t = tRight;
        } else {
            t = tLeft;
        }
    } else {
        t = dot(line.direction, {
            x: optVelocity.x - line.point.x,
            y: optVelocity.y - line.point.y
        });

        if (t < tLeft) {
            t = tLeft;
        } else if (t > tRight) {
            t = tRight;
        }
    }

    result.x = line.point.x + t * line.direction.x;
    result.y = line.point.y + t * line.direction.y;

    return true;
}

/**
 * @zh 2D 线性规划
 * @en 2D Linear Programming
 *
 * @zh 在多个半平面约束下找到最优速度
 * @en Find optimal velocity under multiple half-plane constraints
 *
 * @param lines - @zh 约束线列表 @en List of constraint lines
 * @param radius - @zh 最大速度（圆盘半径）@en Maximum speed (disk radius)
 * @param optVelocity - @zh 首选速度 @en Preferred velocity
 * @param directionOpt - @zh 是否优化方向 @en Whether to optimize direction
 * @param result - @zh 结果向量（输出）@en Result vector (output)
 * @returns @zh 第一个失败的约束索引，如果成功则返回 lines.length @en Index of first failed constraint, or lines.length if successful
 */
export function linearProgram2(
    lines: readonly IORCALine[],
    radius: number,
    optVelocity: IVector2,
    directionOpt: boolean,
    result: Vector2
): number {
    if (directionOpt) {
        result.x = optVelocity.x * radius;
        result.y = optVelocity.y * radius;
    } else if (lengthSq(optVelocity) > radius * radius) {
        const len = Math.sqrt(lengthSq(optVelocity));
        result.x = optVelocity.x / len * radius;
        result.y = optVelocity.y / len * radius;
    } else {
        result.x = optVelocity.x;
        result.y = optVelocity.y;
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const detVal = det(line.direction, { x: line.point.x - result.x, y: line.point.y - result.y });
        if (detVal > 0) {
            const tempResult = result.clone();
            if (!linearProgram1(lines, i, radius, optVelocity, directionOpt, result)) {
                result.copy(tempResult);
                return i;
            }
        }
    }

    return lines.length;
}

/**
 * @zh 3D 线性规划（回退方案）
 * @en 3D Linear Programming (fallback)
 *
 * @zh 当 2D 线性规划失败时，使用此方法找到最小穿透的速度
 * @en When 2D LP fails, use this to find velocity with minimum penetration
 *
 * @param lines - @zh 约束线列表 @en List of constraint lines
 * @param numObstLines - @zh 障碍物约束线数量 @en Number of obstacle constraint lines
 * @param beginLine - @zh 开始处理的线索引 @en Index of line to start processing
 * @param radius - @zh 最大速度 @en Maximum speed
 * @param result - @zh 结果向量（输入/输出）@en Result vector (input/output)
 */
export function linearProgram3(
    lines: IORCALine[],
    numObstLines: number,
    beginLine: number,
    radius: number,
    result: Vector2
): void {
    let distance = 0;

    for (let i = beginLine; i < lines.length; i++) {
        const line = lines[i]!;
        if (det(line.direction, { x: line.point.x - result.x, y: line.point.y - result.y }) > distance) {
            const projLines: IORCALine[] = [];

            for (let j = 0; j < numObstLines; j++) {
                projLines.push(lines[j]!);
            }

            for (let j = numObstLines; j < i; j++) {
                const line1 = lines[j]!;
                const line2 = lines[i]!;

                let newLine: IORCALine;
                const determinant = det(line1.direction, line2.direction);

                if (Math.abs(determinant) <= EPSILON) {
                    if (dot(line1.direction, line2.direction) > 0) {
                        continue;
                    }

                    newLine = {
                        point: {
                            x: 0.5 * (line1.point.x + line2.point.x),
                            y: 0.5 * (line1.point.y + line2.point.y)
                        },
                        direction: { x: 0, y: 0 }
                    };
                } else {
                    const diff = {
                        x: line1.point.x - line2.point.x,
                        y: line1.point.y - line2.point.y
                    };
                    const t = det(line2.direction, diff) / determinant;

                    newLine = {
                        point: {
                            x: line1.point.x + t * line1.direction.x,
                            y: line1.point.y + t * line1.direction.y
                        },
                        direction: { x: 0, y: 0 }
                    };
                }

                const dirDiff = {
                    x: line1.direction.x - line2.direction.x,
                    y: line1.direction.y - line2.direction.y
                };
                const dirLen = Math.sqrt(lengthSq(dirDiff));
                if (dirLen > EPSILON) {
                    newLine.direction.x = dirDiff.x / dirLen;
                    newLine.direction.y = dirDiff.y / dirLen;
                }

                projLines.push(newLine);
            }

            const tempResult = result.clone();
            const optVelocity = { x: -lines[i]!.direction.y, y: lines[i]!.direction.x };

            if (linearProgram2(projLines, radius, optVelocity, true, result) < projLines.length) {
                result.copy(tempResult);
            }

            distance = det(lines[i]!.direction, {
                x: lines[i]!.point.x - result.x,
                y: lines[i]!.point.y - result.y
            });
        }
    }
}

/**
 * @zh 求解 ORCA 线性规划
 * @en Solve ORCA Linear Programming
 *
 * @zh 综合使用 2D 和 3D 线性规划求解最优速度
 * @en Use both 2D and 3D LP to solve for optimal velocity
 *
 * @param lines - @zh ORCA 约束线列表 @en List of ORCA constraint lines
 * @param numObstLines - @zh 障碍物约束线数量（优先级更高）@en Number of obstacle lines (higher priority)
 * @param maxSpeed - @zh 最大速度 @en Maximum speed
 * @param preferredVelocity - @zh 首选速度 @en Preferred velocity
 * @returns @zh 计算得到的新速度 @en Computed new velocity
 */
export function solveORCALinearProgram(
    lines: IORCALine[],
    numObstLines: number,
    maxSpeed: number,
    preferredVelocity: IVector2
): Vector2 {
    const result = new Vector2();

    const lineFail = linearProgram2(lines, maxSpeed, preferredVelocity, false, result);

    if (lineFail < lines.length) {
        linearProgram3(lines, numObstLines, lineFail, maxSpeed, result);
    }

    return result;
}
