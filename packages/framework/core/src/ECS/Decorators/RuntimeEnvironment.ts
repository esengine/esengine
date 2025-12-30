/**
 * @zh 运行时环境装饰器
 * @en Runtime Environment Decorators
 *
 * @zh 提供 @ServerOnly 和 @ClientOnly 装饰器，用于标记只在特定环境执行的方法
 * @en Provides @ServerOnly and @ClientOnly decorators to mark methods that only execute in specific environments
 */

import type { EntitySystem } from '../Systems/EntitySystem';

/**
 * @zh 服务端专用方法装饰器
 * @en Server-only method decorator
 *
 * @zh 被装饰的方法只会在服务端环境执行（scene.isServer === true）。
 * 在客户端或单机模式下，方法调用会被静默跳过。
 *
 * @en Decorated methods only execute in server environment (scene.isServer === true).
 * In client or standalone mode, method calls are silently skipped.
 *
 * @example
 * ```typescript
 * class CollectibleSpawnSystem extends EntitySystem {
 *     @ServerOnly()
 *     private checkCollections(players: readonly Entity[]): void {
 *         // 只在服务端执行收集检测
 *         // Only check collections on server
 *         for (const entity of this.scene.entities.buffer) {
 *             // ...
 *         }
 *     }
 * }
 * ```
 */
export function ServerOnly(): MethodDecorator {
    return function <T>(
        _target: object,
        _propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<T>
    ): TypedPropertyDescriptor<T> | void {
        const originalMethod = descriptor.value as unknown as (...args: unknown[]) => unknown;

        if (typeof originalMethod !== 'function') {
            throw new Error(`@ServerOnly can only be applied to methods, not ${typeof originalMethod}`);
        }

        descriptor.value = function (this: EntitySystem, ...args: unknown[]): unknown {
            if (!this.scene?.isServer) {
                return undefined;
            }
            return originalMethod.apply(this, args);
        } as unknown as T;

        return descriptor;
    };
}

/**
 * @zh 客户端专用方法装饰器
 * @en Client-only method decorator
 *
 * @zh 被装饰的方法只会在客户端环境执行（scene.isClient === true）。
 * 在服务端或单机模式下，方法调用会被静默跳过。
 *
 * @en Decorated methods only execute in client environment (scene.isClient === true).
 * In server or standalone mode, method calls are silently skipped.
 *
 * @example
 * ```typescript
 * class RenderSystem extends EntitySystem {
 *     @ClientOnly()
 *     private updateVisuals(): void {
 *         // 只在客户端执行渲染逻辑
 *         // Only update visuals on client
 *     }
 * }
 * ```
 */
export function ClientOnly(): MethodDecorator {
    return function <T>(
        _target: object,
        _propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<T>
    ): TypedPropertyDescriptor<T> | void {
        const originalMethod = descriptor.value as unknown as (...args: unknown[]) => unknown;

        if (typeof originalMethod !== 'function') {
            throw new Error(`@ClientOnly can only be applied to methods, not ${typeof originalMethod}`);
        }

        descriptor.value = function (this: EntitySystem, ...args: unknown[]): unknown {
            if (!this.scene?.isClient) {
                return undefined;
            }
            return originalMethod.apply(this, args);
        } as unknown as T;

        return descriptor;
    };
}

/**
 * @zh 非客户端环境方法装饰器
 * @en Non-client method decorator
 *
 * @zh 被装饰的方法在服务端和单机模式下执行，但不在客户端执行。
 * 用于需要在服务端和单机都运行，但客户端跳过的逻辑。
 *
 * @en Decorated methods execute in server and standalone mode, but not on client.
 * Used for logic that should run on server and standalone, but skip on client.
 *
 * @example
 * ```typescript
 * class SpawnSystem extends EntitySystem {
 *     @NotClient()
 *     private spawnEntities(): void {
 *         // 服务端和单机模式执行，客户端跳过
 *         // Execute on server and standalone, skip on client
 *     }
 * }
 * ```
 */
export function NotClient(): MethodDecorator {
    return function <T>(
        _target: object,
        _propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<T>
    ): TypedPropertyDescriptor<T> | void {
        const originalMethod = descriptor.value as unknown as (...args: unknown[]) => unknown;

        if (typeof originalMethod !== 'function') {
            throw new Error(`@NotClient can only be applied to methods, not ${typeof originalMethod}`);
        }

        descriptor.value = function (this: EntitySystem, ...args: unknown[]): unknown {
            if (this.scene?.isClient) {
                return undefined;
            }
            return originalMethod.apply(this, args);
        } as unknown as T;

        return descriptor;
    };
}

/**
 * @zh 非服务端环境方法装饰器
 * @en Non-server method decorator
 *
 * @zh 被装饰的方法在客户端和单机模式下执行，但不在服务端执行。
 * 用于需要在客户端和单机都运行，但服务端跳过的逻辑（如渲染、音效）。
 *
 * @en Decorated methods execute in client and standalone mode, but not on server.
 * Used for logic that should run on client and standalone, but skip on server (like rendering, audio).
 *
 * @example
 * ```typescript
 * class AudioSystem extends EntitySystem {
 *     @NotServer()
 *     private playSound(): void {
 *         // 客户端和单机模式执行，服务端跳过
 *         // Execute on client and standalone, skip on server
 *     }
 * }
 * ```
 */
export function NotServer(): MethodDecorator {
    return function <T>(
        _target: object,
        _propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<T>
    ): TypedPropertyDescriptor<T> | void {
        const originalMethod = descriptor.value as unknown as (...args: unknown[]) => unknown;

        if (typeof originalMethod !== 'function') {
            throw new Error(`@NotServer can only be applied to methods, not ${typeof originalMethod}`);
        }

        descriptor.value = function (this: EntitySystem, ...args: unknown[]): unknown {
            if (this.scene?.isServer) {
                return undefined;
            }
            return originalMethod.apply(this, args);
        } as unknown as T;

        return descriptor;
    };
}
