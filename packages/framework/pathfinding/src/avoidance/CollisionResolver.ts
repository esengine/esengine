/**
 * @zh 碰撞解决器
 * @en Collision Resolver
 *
 * @zh 提供位置级别的硬碰撞检测和解决，作为 ORCA 的补充保护层
 * @en Provides position-level hard collision detection and resolution as a supplementary protection layer for ORCA
 */

import type { IVector2 } from '@esengine/ecs-framework-math';
import type { IObstacle } from './ILocalAvoidance';

const EPSILON = 0.00001;

// =============================================================================
// 碰撞检测结果 | Collision Detection Result
// =============================================================================

/**
 * @zh 碰撞检测结果
 * @en Collision detection result
 */
export interface ICollisionResult {
    /**
     * @zh 是否发生碰撞
     * @en Whether collision occurred
     */
    collided: boolean;

    /**
     * @zh 穿透深度
     * @en Penetration depth
     */
    penetration: number;

    /**
     * @zh 碰撞法线（从障碍物指向代理）
     * @en Collision normal (pointing from obstacle to agent)
     */
    normal: IVector2;

    /**
     * @zh 最近点
     * @en Closest point on obstacle
     */
    closestPoint: IVector2;
}

/**
 * @zh 空碰撞结果
 * @en Empty collision result
 */
export const EMPTY_COLLISION: ICollisionResult = {
    collided: false,
    penetration: 0,
    normal: { x: 0, y: 0 },
    closestPoint: { x: 0, y: 0 }
};

// =============================================================================
// 几何工具函数 | Geometry Utilities
// =============================================================================

/**
 * @zh 计算点到线段的最近点
 * @en Calculate closest point on line segment to a point
 */
function closestPointOnSegment(
    point: IVector2,
    segStart: IVector2,
    segEnd: IVector2
): IVector2 {
    const dx = segEnd.x - segStart.x;
    const dy = segEnd.y - segStart.y;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq < EPSILON) {
        return { x: segStart.x, y: segStart.y };
    }

    const t = Math.max(0, Math.min(1,
        ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSq
    ));

    return {
        x: segStart.x + t * dx,
        y: segStart.y + t * dy
    };
}

/**
 * @zh 检查点是否在多边形内（射线法）
 * @en Check if point is inside polygon (ray casting)
 */
function isPointInPolygon(point: IVector2, vertices: readonly IVector2[]): boolean {
    let inside = false;
    const n = vertices.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = vertices[i]!.x;
        const yi = vertices[i]!.y;
        const xj = vertices[j]!.x;
        const yj = vertices[j]!.y;

        if (
            yi > point.y !== yj > point.y &&
            point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
        ) {
            inside = !inside;
        }
    }

    return inside;
}

/**
 * @zh 计算点到多边形的最近点和距离
 * @en Calculate closest point on polygon and distance to point
 */
function closestPointOnPolygon(
    point: IVector2,
    vertices: readonly IVector2[]
): { point: IVector2; distanceSq: number; edgeIndex: number } {
    let minDistSq = Infinity;
    let closestPt: IVector2 = { x: 0, y: 0 };
    let closestEdge = 0;

    for (let i = 0; i < vertices.length; i++) {
        const j = (i + 1) % vertices.length;
        const closest = closestPointOnSegment(point, vertices[i]!, vertices[j]!);
        const dx = point.x - closest.x;
        const dy = point.y - closest.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDistSq) {
            minDistSq = distSq;
            closestPt = closest;
            closestEdge = i;
        }
    }

    return { point: closestPt, distanceSq: minDistSq, edgeIndex: closestEdge };
}

// =============================================================================
// 碰撞解决器 | Collision Resolver
// =============================================================================

/**
 * @zh 碰撞解决器配置
 * @en Collision resolver configuration
 */
export interface ICollisionResolverConfig {
    /**
     * @zh 碰撞响应系数（0-1，1 表示完全推出）
     * @en Collision response factor (0-1, 1 means fully push out)
     */
    responseFactor?: number;

    /**
     * @zh 安全边距（额外距离）
     * @en Safety margin (extra distance)
     */
    safetyMargin?: number;
}

/**
 * @zh 默认配置
 * @en Default configuration
 */
export const DEFAULT_COLLISION_CONFIG: Required<ICollisionResolverConfig> = {
    responseFactor: 1.0,
    safetyMargin: 0.01
};

/**
 * @zh 碰撞解决器
 * @en Collision Resolver
 *
 * @zh 提供位置级别的硬碰撞检测和解决
 * @en Provides position-level hard collision detection and resolution
 */
export class CollisionResolver {
    private readonly config: Required<ICollisionResolverConfig>;

    constructor(config: ICollisionResolverConfig = {}) {
        this.config = { ...DEFAULT_COLLISION_CONFIG, ...config };
    }

    /**
     * @zh 检测圆与单个障碍物的碰撞
     * @en Detect collision between circle and single obstacle
     *
     * @param position - @zh 圆心位置 @en Circle center position
     * @param radius - @zh 圆半径 @en Circle radius
     * @param obstacle - @zh 障碍物 @en Obstacle
     * @returns @zh 碰撞结果 @en Collision result
     */
    detectCollision(
        position: IVector2,
        radius: number,
        obstacle: IObstacle
    ): ICollisionResult {
        const vertices = obstacle.vertices;
        if (vertices.length < 3) {
            return EMPTY_COLLISION;
        }

        const isInside = isPointInPolygon(position, vertices);
        const closest = closestPointOnPolygon(position, vertices);
        const distance = Math.sqrt(closest.distanceSq);

        let penetration: number;
        let normalX: number;
        let normalY: number;

        if (isInside) {
            penetration = radius + distance;
            const dx = closest.point.x - position.x;
            const dy = closest.point.y - position.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > EPSILON) {
                normalX = dx / len;
                normalY = dy / len;
            } else {
                normalX = 1;
                normalY = 0;
            }
        } else if (distance < radius) {
            penetration = radius - distance;
            const dx = position.x - closest.point.x;
            const dy = position.y - closest.point.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > EPSILON) {
                normalX = dx / len;
                normalY = dy / len;
            } else {
                normalX = 1;
                normalY = 0;
            }
        } else {
            return EMPTY_COLLISION;
        }

        return {
            collided: true,
            penetration,
            normal: { x: normalX, y: normalY },
            closestPoint: closest.point
        };
    }

    /**
     * @zh 检测圆与所有障碍物的碰撞
     * @en Detect collision between circle and all obstacles
     *
     * @param position - @zh 圆心位置 @en Circle center position
     * @param radius - @zh 圆半径 @en Circle radius
     * @param obstacles - @zh 障碍物列表 @en List of obstacles
     * @returns @zh 最严重的碰撞结果 @en Most severe collision result
     */
    detectCollisions(
        position: IVector2,
        radius: number,
        obstacles: readonly IObstacle[]
    ): ICollisionResult {
        let worstCollision = EMPTY_COLLISION;
        let maxPenetration = 0;

        for (const obstacle of obstacles) {
            const collision = this.detectCollision(position, radius, obstacle);
            if (collision.collided && collision.penetration > maxPenetration) {
                maxPenetration = collision.penetration;
                worstCollision = collision;
            }
        }

        return worstCollision;
    }

    /**
     * @zh 解决碰撞，返回修正后的位置
     * @en Resolve collision, return corrected position
     *
     * @param position - @zh 当前位置 @en Current position
     * @param radius - @zh 半径 @en Radius
     * @param obstacles - @zh 障碍物列表 @en List of obstacles
     * @returns @zh 修正后的位置 @en Corrected position
     */
    resolveCollision(
        position: IVector2,
        radius: number,
        obstacles: readonly IObstacle[]
    ): IVector2 {
        const result = { x: position.x, y: position.y };
        const maxIterations = 4;

        for (let iter = 0; iter < maxIterations; iter++) {
            const collision = this.detectCollisions(result, radius, obstacles);

            if (!collision.collided) {
                break;
            }

            const pushDistance = (collision.penetration + this.config.safetyMargin) * this.config.responseFactor;
            result.x += collision.normal.x * pushDistance;
            result.y += collision.normal.y * pushDistance;
        }

        return result;
    }

    /**
     * @zh 验证速度是否会导致碰撞，返回安全速度
     * @en Validate velocity won't cause collision, return safe velocity
     *
     * @param position - @zh 当前位置 @en Current position
     * @param velocity - @zh 目标速度 @en Target velocity
     * @param radius - @zh 半径 @en Radius
     * @param obstacles - @zh 障碍物列表 @en List of obstacles
     * @param deltaTime - @zh 时间步长 @en Time step
     * @returns @zh 安全速度 @en Safe velocity
     */
    validateVelocity(
        position: IVector2,
        velocity: IVector2,
        radius: number,
        obstacles: readonly IObstacle[],
        deltaTime: number
    ): IVector2 {
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        if (speed < EPSILON) {
            return velocity;
        }

        const newPos = {
            x: position.x + velocity.x * deltaTime,
            y: position.y + velocity.y * deltaTime
        };

        const collision = this.detectCollisions(newPos, radius, obstacles);

        if (!collision.collided) {
            return velocity;
        }

        const dotProduct = velocity.x * collision.normal.x + velocity.y * collision.normal.y;

        if (dotProduct >= 0) {
            return velocity;
        }

        // 移除朝向障碍物的速度分量，沿障碍物边缘滑动
        const slideVelocity = {
            x: velocity.x - dotProduct * collision.normal.x,
            y: velocity.y - dotProduct * collision.normal.y
        };

        // 检查滑动速度是否太小（几乎垂直撞向障碍物）
        const slideSpeed = Math.sqrt(slideVelocity.x * slideVelocity.x + slideVelocity.y * slideVelocity.y);
        if (slideSpeed < speed * 0.1) {
            // 速度几乎完全朝向障碍物角落，选择沿障碍物边缘滑动的方向
            // 计算垂直于法线的两个方向
            const perpDir1 = { x: -collision.normal.y, y: collision.normal.x };
            const perpDir2 = { x: collision.normal.y, y: -collision.normal.x };

            // 选择与原速度方向夹角较小的方向（点积较大）
            const dot1 = velocity.x * perpDir1.x + velocity.y * perpDir1.y;
            const dot2 = velocity.x * perpDir2.x + velocity.y * perpDir2.y;
            const chosenDir = dot1 >= dot2 ? perpDir1 : perpDir2;

            // 返回沿障碍物边缘的速度，保持原速度大小
            return {
                x: chosenDir.x * speed,
                y: chosenDir.y * speed
            };
        }

        return slideVelocity;
    }

    /**
     * @zh 检测两个代理之间的碰撞
     * @en Detect collision between two agents
     *
     * @param posA - @zh 代理 A 位置 @en Agent A position
     * @param radiusA - @zh 代理 A 半径 @en Agent A radius
     * @param posB - @zh 代理 B 位置 @en Agent B position
     * @param radiusB - @zh 代理 B 半径 @en Agent B radius
     * @returns @zh 碰撞结果 @en Collision result
     */
    detectAgentCollision(
        posA: IVector2,
        radiusA: number,
        posB: IVector2,
        radiusB: number
    ): ICollisionResult {
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const distSq = dx * dx + dy * dy;
        const combinedRadius = radiusA + radiusB;

        if (distSq >= combinedRadius * combinedRadius) {
            return EMPTY_COLLISION;
        }

        const distance = Math.sqrt(distSq);
        const penetration = combinedRadius - distance;

        let normalX: number, normalY: number;
        if (distance > EPSILON) {
            normalX = -dx / distance;
            normalY = -dy / distance;
        } else {
            normalX = 1;
            normalY = 0;
        }

        return {
            collided: true,
            penetration,
            normal: { x: normalX, y: normalY },
            closestPoint: {
                x: posA.x + normalX * radiusA,
                y: posA.y + normalY * radiusA
            }
        };
    }

    /**
     * @zh 解决代理之间的碰撞
     * @en Resolve collision between agents
     *
     * @param posA - @zh 代理 A 位置 @en Agent A position
     * @param radiusA - @zh 代理 A 半径 @en Agent A radius
     * @param posB - @zh 代理 B 位置 @en Agent B position
     * @param radiusB - @zh 代理 B 半径 @en Agent B radius
     * @returns @zh 修正后的位置 [A, B] @en Corrected positions [A, B]
     */
    resolveAgentCollision(
        posA: IVector2,
        radiusA: number,
        posB: IVector2,
        radiusB: number
    ): [IVector2, IVector2] {
        const collision = this.detectAgentCollision(posA, radiusA, posB, radiusB);

        if (!collision.collided) {
            return [posA, posB];
        }

        const halfPush = (collision.penetration + this.config.safetyMargin) * 0.5 * this.config.responseFactor;

        return [
            {
                x: posA.x + collision.normal.x * halfPush,
                y: posA.y + collision.normal.y * halfPush
            },
            {
                x: posB.x - collision.normal.x * halfPush,
                y: posB.y - collision.normal.y * halfPush
            }
        ];
    }
}

/**
 * @zh 创建碰撞解决器
 * @en Create collision resolver
 */
export function createCollisionResolver(config?: ICollisionResolverConfig): CollisionResolver {
    return new CollisionResolver(config);
}
