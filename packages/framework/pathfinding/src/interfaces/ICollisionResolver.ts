/**
 * @zh 碰撞解决器接口
 * @en Collision Resolver Interface
 *
 * @zh 提供位置级别的硬碰撞检测和解决
 * @en Provides position-level hard collision detection and resolution
 */

import type { IVector2 } from './IPathPlanner';
import type { IObstacleData } from './ILocalAvoidance';

/**
 * @zh 碰撞检测结果
 * @en Collision detection result
 */
export interface ICollisionResult {
    /**
     * @zh 是否发生碰撞
     * @en Whether collision occurred
     */
    readonly collided: boolean;

    /**
     * @zh 穿透深度
     * @en Penetration depth
     */
    readonly penetration: number;

    /**
     * @zh 碰撞法线（从障碍物指向代理）
     * @en Collision normal (pointing from obstacle to agent)
     */
    readonly normal: IVector2;

    /**
     * @zh 障碍物上的最近点
     * @en Closest point on obstacle
     */
    readonly closestPoint: IVector2;
}

/**
 * @zh 空碰撞结果
 * @en Empty collision result
 */
export const EMPTY_COLLISION_RESULT: ICollisionResult = {
    collided: false,
    penetration: 0,
    normal: { x: 0, y: 0 },
    closestPoint: { x: 0, y: 0 }
};

/**
 * @zh 碰撞解决器接口
 * @en Collision resolver interface
 *
 * @zh 提供位置级别的硬碰撞检测和解决，作为避让算法失效时的安全保护层
 * @en Provides position-level hard collision detection and resolution, as safety layer when avoidance fails
 *
 * @example
 * ```typescript
 * const resolver = createDefaultCollisionResolver();
 *
 * // 检测碰撞
 * const collision = resolver.detectCollision(position, radius, obstacles);
 * if (collision.collided) {
 *     // 解决碰撞
 *     const newPos = resolver.resolveCollision(position, radius, obstacles);
 * }
 *
 * // 验证速度
 * const safeVelocity = resolver.validateVelocity(
 *     position, velocity, radius, obstacles, deltaTime
 * );
 * ```
 */
export interface ICollisionResolver {
    /**
     * @zh 解决器类型标识
     * @en Resolver type identifier
     */
    readonly type: string;

    /**
     * @zh 检测圆与障碍物的碰撞
     * @en Detect collision between circle and obstacles
     *
     * @param position - @zh 圆心位置 @en Circle center position
     * @param radius - @zh 圆半径 @en Circle radius
     * @param obstacles - @zh 障碍物列表 @en List of obstacles
     * @returns @zh 最严重的碰撞结果 @en Most severe collision result
     */
    detectCollision(
        position: IVector2,
        radius: number,
        obstacles: readonly IObstacleData[]
    ): ICollisionResult;

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
        obstacles: readonly IObstacleData[]
    ): IVector2;

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
        obstacles: readonly IObstacleData[],
        deltaTime: number
    ): IVector2;

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
    ): ICollisionResult;

    /**
     * @zh 释放资源
     * @en Dispose resources
     */
    dispose(): void;
}
