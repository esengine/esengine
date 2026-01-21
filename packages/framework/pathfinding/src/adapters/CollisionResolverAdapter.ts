/**
 * @zh 碰撞解决器适配器
 * @en Collision Resolver Adapter
 *
 * @zh 将现有 CollisionResolver 适配到 ICollisionResolver 接口
 * @en Adapts existing CollisionResolver to ICollisionResolver interface
 */

import type { ICollisionResolver, ICollisionResult } from '../interfaces/ICollisionResolver';
import type { IObstacleData } from '../interfaces/ILocalAvoidance';
import type { IVector2 } from '../interfaces/IPathPlanner';
import {
    CollisionResolver,
    createCollisionResolver,
    type ICollisionResolverConfig
} from '../avoidance/CollisionResolver';
import { EMPTY_COLLISION_RESULT } from '../interfaces/ICollisionResolver';

/**
 * @zh 碰撞解决器适配器
 * @en Collision resolver adapter
 *
 * @example
 * ```typescript
 * const resolver = createDefaultCollisionResolver();
 * navSystem.setCollisionResolver(resolver);
 * ```
 */
export class CollisionResolverAdapter implements ICollisionResolver {
    readonly type = 'default';

    private resolver: CollisionResolver;

    constructor(config?: ICollisionResolverConfig) {
        this.resolver = createCollisionResolver(config);
    }

    detectCollision(
        position: IVector2,
        radius: number,
        obstacles: readonly IObstacleData[]
    ): ICollisionResult {
        if (obstacles.length === 0) {
            return EMPTY_COLLISION_RESULT;
        }

        const result = this.resolver.detectCollisions(
            position,
            radius,
            obstacles.map(o => ({ vertices: o.vertices.map(v => ({ x: v.x, y: v.y })) }))
        );

        return {
            collided: result.collided,
            penetration: result.penetration,
            normal: { x: result.normal.x, y: result.normal.y },
            closestPoint: { x: result.closestPoint.x, y: result.closestPoint.y }
        };
    }

    resolveCollision(
        position: IVector2,
        radius: number,
        obstacles: readonly IObstacleData[]
    ): IVector2 {
        if (obstacles.length === 0) {
            return { x: position.x, y: position.y };
        }

        const resolved = this.resolver.resolveCollision(
            position,
            radius,
            obstacles.map(o => ({ vertices: o.vertices.map(v => ({ x: v.x, y: v.y })) }))
        );

        return { x: resolved.x, y: resolved.y };
    }

    validateVelocity(
        position: IVector2,
        velocity: IVector2,
        radius: number,
        obstacles: readonly IObstacleData[],
        deltaTime: number
    ): IVector2 {
        if (obstacles.length === 0) {
            return { x: velocity.x, y: velocity.y };
        }

        const result = this.resolver.validateVelocity(
            position,
            velocity,
            radius,
            obstacles.map(o => ({ vertices: o.vertices.map(v => ({ x: v.x, y: v.y })) })),
            deltaTime
        );

        return { x: result.x, y: result.y };
    }

    detectAgentCollision(
        posA: IVector2,
        radiusA: number,
        posB: IVector2,
        radiusB: number
    ): ICollisionResult {
        const result = this.resolver.detectAgentCollision(posA, radiusA, posB, radiusB);

        return {
            collided: result.collided,
            penetration: result.penetration,
            normal: { x: result.normal.x, y: result.normal.y },
            closestPoint: { x: result.closestPoint.x, y: result.closestPoint.y }
        };
    }

    dispose(): void {
        // No resources to dispose
    }
}

/**
 * @zh 创建默认碰撞解决器
 * @en Create default collision resolver
 *
 * @param config - @zh 配置 @en Configuration
 * @returns @zh 碰撞解决器 @en Collision resolver
 *
 * @example
 * ```typescript
 * const resolver = createDefaultCollisionResolver();
 * navSystem.setCollisionResolver(resolver);
 *
 * // 自定义配置
 * const resolver = createDefaultCollisionResolver({
 *     responseFactor: 1.0,
 *     safetyMargin: 0.01
 * });
 * ```
 */
export function createDefaultCollisionResolver(config?: ICollisionResolverConfig): ICollisionResolver {
    return new CollisionResolverAdapter(config);
}
