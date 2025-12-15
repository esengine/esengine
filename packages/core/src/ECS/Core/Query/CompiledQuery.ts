/**
 * 编译查询
 *
 * 预编译的查询执行计划，避免每次查询时重复构建匹配条件。
 * 提供便捷的迭代方法和变更检测支持。
 *
 * Compiled Query.
 * Pre-compiled query execution plan that avoids repeated condition building.
 * Provides convenient iteration methods and change detection support.
 *
 * @example
 * ```typescript
 * class MovementSystem extends EntitySystem {
 *     private _query: CompiledQuery<[typeof Position, typeof Velocity]>;
 *
 *     onInitialize(): void {
 *         this._query = this.scene.querySystem.compile(Position, Velocity);
 *     }
 *
 *     update(): void {
 *         this._query.forEach((entity, pos, vel) => {
 *             pos.x += vel.x * this.deltaTime;
 *             pos.y += vel.y * this.deltaTime;
 *         });
 *     }
 * }
 * ```
 */

import { Entity } from '../../Entity';
import { Component } from '../../Component';
import { ComponentType } from '../ComponentStorage';
import { QuerySystem } from '../QuerySystem';

/**
 * 组件实例类型提取
 *
 * Extract component instance types from component type tuple.
 */
export type InstanceTypes<T extends ComponentType[]> = {
    [K in keyof T]: T[K] extends ComponentType<infer C> ? C : never;
};

/**
 * 编译查询类
 *
 * Compiled query class.
 */
export class CompiledQuery<T extends ComponentType[] = ComponentType[]> {
    /**
     * 查询的组件类型列表
     *
     * Component types for this query.
     */
    private readonly _componentTypes: T;

    /**
     * 查询系统引用
     *
     * Reference to query system.
     */
    private readonly _querySystem: QuerySystem;

    /**
     * 上次查询的版本号（用于缓存失效检测）
     *
     * Last query version (for cache invalidation detection).
     */
    private _lastVersion: number = -1;

    /**
     * 缓存的实体列表
     *
     * Cached entity list.
     */
    private _cachedEntities: readonly Entity[] = [];

    /**
     * 创建编译查询
     *
     * Create compiled query.
     *
     * @param querySystem 查询系统引用 | Query system reference
     * @param componentTypes 组件类型列表 | Component type list
     */
    constructor(querySystem: QuerySystem, ...componentTypes: T) {
        this._querySystem = querySystem;
        this._componentTypes = componentTypes;
    }

    /**
     * 获取组件类型列表
     *
     * Get component type list.
     */
    public get componentTypes(): readonly ComponentType[] {
        return this._componentTypes;
    }

    /**
     * 获取匹配的实体列表
     *
     * Get matching entity list.
     */
    public get entities(): readonly Entity[] {
        this._refreshCache();
        return this._cachedEntities;
    }

    /**
     * 获取匹配的实体数量
     *
     * Get matching entity count.
     */
    public get count(): number {
        return this.entities.length;
    }

    /**
     * 刷新缓存
     *
     * Refresh cache if needed.
     */
    private _refreshCache(): void {
        const currentVersion = this._querySystem.version;
        if (this._lastVersion !== currentVersion) {
            const result = this._querySystem.queryAll(...this._componentTypes);
            this._cachedEntities = result.entities;
            this._lastVersion = currentVersion;
        }
    }

    /**
     * 遍历所有匹配的实体及其组件
     *
     * Iterate all matching entities with their components.
     *
     * @param callback 回调函数，接收实体和组件实例 | Callback receiving entity and component instances
     *
     * @example
     * ```typescript
     * query.forEach((entity, position, velocity) => {
     *     position.x += velocity.x * deltaTime;
     * });
     * ```
     */
    public forEach(
        callback: (entity: Entity, ...components: InstanceTypes<T>) => void
    ): void {
        const entities = this.entities;
        const componentTypes = this._componentTypes;
        const typeCount = componentTypes.length;

        for (let i = 0, len = entities.length; i < len; i++) {
            const entity = entities[i]!;
            const components: Component[] = new Array(typeCount);

            // 获取所有组件
            for (let j = 0; j < typeCount; j++) {
                const component = entity.getComponent(componentTypes[j]!);
                if (!component) {
                    // 组件不存在，跳过这个实体
                    continue;
                }
                components[j] = component;
            }

            // 调用回调
            callback(entity, ...(components as InstanceTypes<T>));
        }
    }

    /**
     * 遍历自指定 epoch 以来发生变更的实体
     *
     * Iterate entities with components changed since specified epoch.
     *
     * @param sinceEpoch 检查点 epoch | Checkpoint epoch
     * @param callback 回调函数 | Callback function
     *
     * @example
     * ```typescript
     * class PhysicsSystem extends EntitySystem {
     *     private _lastEpoch = 0;
     *
     *     update(): void {
     *         this._query.forEachChanged(this._lastEpoch, (entity, pos, vel) => {
     *             // 只处理变更的实体
     *         });
     *         this._lastEpoch = this.scene.epochManager.current;
     *     }
     * }
     * ```
     */
    public forEachChanged(
        sinceEpoch: number,
        callback: (entity: Entity, ...components: InstanceTypes<T>) => void
    ): void {
        const entities = this.entities;
        const componentTypes = this._componentTypes;
        const typeCount = componentTypes.length;

        for (let i = 0, len = entities.length; i < len; i++) {
            const entity = entities[i]!;
            const components: Component[] = new Array(typeCount);
            let hasChanged = false;

            // 获取所有组件并检查变更
            for (let j = 0; j < typeCount; j++) {
                const component = entity.getComponent(componentTypes[j]!);
                if (!component) {
                    continue;
                }
                components[j] = component;

                if (component.lastWriteEpoch > sinceEpoch) {
                    hasChanged = true;
                }
            }

            // 只在有变更时调用回调
            if (hasChanged) {
                callback(entity, ...(components as InstanceTypes<T>));
            }
        }
    }

    /**
     * 获取第一个匹配的实体及其组件
     *
     * Get first matching entity with its components.
     *
     * @returns 实体和组件元组，或 null | Entity and components tuple, or null
     */
    public first(): [Entity, ...InstanceTypes<T>] | null {
        const entities = this.entities;
        if (entities.length === 0) {
            return null;
        }

        const entity = entities[0]!;
        const components: Component[] = [];

        for (const type of this._componentTypes) {
            const component = entity.getComponent(type);
            if (!component) {
                return null;
            }
            components.push(component);
        }

        return [entity, ...(components as InstanceTypes<T>)];
    }

    /**
     * 转换为数组
     *
     * Convert to array.
     *
     * @returns 实体和组件元组数组 | Array of entity and components tuples
     */
    public toArray(): Array<[Entity, ...InstanceTypes<T>]> {
        const result: Array<[Entity, ...InstanceTypes<T>]> = [];

        this.forEach((entity, ...components) => {
            result.push([entity, ...components]);
        });

        return result;
    }

    /**
     * 映射转换
     *
     * Map transformation.
     *
     * @param callback 转换函数 | Transform function
     * @returns 转换结果数组 | Array of transform results
     */
    public map<R>(
        callback: (entity: Entity, ...components: InstanceTypes<T>) => R
    ): R[] {
        const result: R[] = [];

        this.forEach((entity, ...components) => {
            result.push(callback(entity, ...components));
        });

        return result;
    }

    /**
     * 过滤实体
     *
     * Filter entities.
     *
     * @param predicate 过滤条件 | Filter predicate
     * @returns 过滤后的实体数组 | Filtered entity array
     */
    public filter(
        predicate: (entity: Entity, ...components: InstanceTypes<T>) => boolean
    ): Entity[] {
        const result: Entity[] = [];

        this.forEach((entity, ...components) => {
            if (predicate(entity, ...components)) {
                result.push(entity);
            }
        });

        return result;
    }

    /**
     * 查找满足条件的实体
     *
     * Find entity matching predicate.
     *
     * @param predicate 查找条件 | Find predicate
     * @returns 找到的实体或 undefined | Found entity or undefined
     */
    public find(
        predicate: (entity: Entity, ...components: InstanceTypes<T>) => boolean
    ): Entity | undefined {
        const entities = this.entities;
        const componentTypes = this._componentTypes;
        const typeCount = componentTypes.length;

        for (let i = 0, len = entities.length; i < len; i++) {
            const entity = entities[i]!;
            const components: Component[] = new Array(typeCount);

            for (let j = 0; j < typeCount; j++) {
                const component = entity.getComponent(componentTypes[j]!);
                if (!component) {
                    continue;
                }
                components[j] = component;
            }

            if (predicate(entity, ...(components as InstanceTypes<T>))) {
                return entity;
            }
        }

        return undefined;
    }

    /**
     * 检查是否有任何实体匹配
     *
     * Check if any entity matches.
     */
    public any(): boolean {
        return this.count > 0;
    }

    /**
     * 检查是否没有实体匹配
     *
     * Check if no entity matches.
     */
    public empty(): boolean {
        return this.count === 0;
    }
}
