/**
 * @zh 网络实体装饰器
 * @en Network entity decorator
 *
 * @zh 提供 @NetworkEntity 装饰器，用于标记需要自动广播生成/销毁的组件
 * @en Provides @NetworkEntity decorator to mark components for automatic spawn/despawn broadcasting
 */

/**
 * @zh 网络实体元数据的 Symbol 键
 * @en Symbol key for network entity metadata
 */
export const NETWORK_ENTITY_METADATA = Symbol('NetworkEntityMetadata');

/**
 * @zh 网络实体元数据
 * @en Network entity metadata
 */
export interface NetworkEntityMetadata {
    /**
     * @zh 预制体类型名称（用于客户端重建实体）
     * @en Prefab type name (used by client to reconstruct entity)
     */
    prefabType: string;

    /**
     * @zh 是否自动广播生成
     * @en Whether to auto-broadcast spawn
     * @default true
     */
    autoSpawn: boolean;

    /**
     * @zh 是否自动广播销毁
     * @en Whether to auto-broadcast despawn
     * @default true
     */
    autoDespawn: boolean;
}

/**
 * @zh 网络实体装饰器配置选项
 * @en Network entity decorator options
 */
export interface NetworkEntityOptions {
    /**
     * @zh 是否自动广播生成
     * @en Whether to auto-broadcast spawn
     * @default true
     */
    autoSpawn?: boolean;

    /**
     * @zh 是否自动广播销毁
     * @en Whether to auto-broadcast despawn
     * @default true
     */
    autoDespawn?: boolean;
}

/**
 * @zh 网络实体装饰器
 * @en Network entity decorator
 *
 * @zh 标记组件类为网络实体。当包含此组件的实体被创建或销毁时，
 * ECSRoom 会自动广播相应的 spawn/despawn 消息给所有客户端。
 * @en Marks a component class as a network entity. When an entity containing
 * this component is created or destroyed, ECSRoom will automatically broadcast
 * the corresponding spawn/despawn messages to all clients.
 *
 * @param prefabType - @zh 预制体类型名称 @en Prefab type name
 * @param options - @zh 可选配置 @en Optional configuration
 *
 * @example
 * ```typescript
 * import { Component, ECSComponent, NetworkEntity, sync } from '@esengine/ecs-framework';
 *
 * @ECSComponent('Enemy')
 * @NetworkEntity('Enemy')
 * class EnemyComponent extends Component {
 *     @sync('float32') x: number = 0;
 *     @sync('float32') y: number = 0;
 *     @sync('uint16') health: number = 100;
 * }
 *
 * // 当添加此组件到实体时，ECSRoom 会自动广播 spawn
 * const enemy = scene.createEntity('Enemy');
 * enemy.addComponent(new EnemyComponent()); // 自动广播给所有客户端
 *
 * // 当实体销毁时，自动广播 despawn
 * enemy.destroy(); // 自动广播给所有客户端
 * ```
 *
 * @example
 * ```typescript
 * // 只自动广播生成，销毁由手动控制
 * @ECSComponent('Bullet')
 * @NetworkEntity('Bullet', { autoDespawn: false })
 * class BulletComponent extends Component {
 *     @sync('float32') x: number = 0;
 *     @sync('float32') y: number = 0;
 * }
 * ```
 */
export function NetworkEntity(prefabType: string, options?: NetworkEntityOptions) {
    return function <T extends new (...args: any[]) => any>(target: T): T {
        const metadata: NetworkEntityMetadata = {
            prefabType,
            autoSpawn: options?.autoSpawn ?? true,
            autoDespawn: options?.autoDespawn ?? true,
        };

        (target as any)[NETWORK_ENTITY_METADATA] = metadata;

        return target;
    };
}

/**
 * @zh 获取组件类的网络实体元数据
 * @en Get network entity metadata for a component class
 *
 * @param componentClass - @zh 组件类或组件实例 @en Component class or instance
 * @returns @zh 网络实体元数据，如果不存在则返回 null @en Network entity metadata, or null if not exists
 */
export function getNetworkEntityMetadata(componentClass: any): NetworkEntityMetadata | null {
    if (!componentClass) {
        return null;
    }

    const constructor = typeof componentClass === 'function'
        ? componentClass
        : componentClass.constructor;

    return constructor[NETWORK_ENTITY_METADATA] || null;
}

/**
 * @zh 检查组件是否标记为网络实体
 * @en Check if a component is marked as a network entity
 *
 * @param component - @zh 组件类或组件实例 @en Component class or instance
 * @returns @zh 如果是网络实体返回 true @en Returns true if is a network entity
 */
export function isNetworkEntity(component: any): boolean {
    return getNetworkEntityMetadata(component) !== null;
}
