import { Component } from './Component';
import { ComponentType, GlobalComponentRegistry } from './Core/ComponentStorage';
import { EEntityLifecyclePolicy } from './Core/EntityLifecyclePolicy';
import { BitMask64Utils, BitMask64Data } from './Utils/BigIntCompatibility';
import { createLogger } from '../Utils/Logger';
import { getComponentInstanceTypeName, getComponentTypeName } from './Decorators';
import { generateGUID } from '../Utils/GUID';
import type { IScene } from './IScene';
import { EntityHandle, NULL_HANDLE } from './Core/EntityHandle';
import { ECSEventType } from './CoreEvents';

/**
 * @zh 比较两个实体的优先级
 * @en Compare priority of two entities
 *
 * @param a - @zh 第一个实体 @en First entity
 * @param b - @zh 第二个实体 @en Second entity
 * @returns @zh 比较结果：负数表示a优先级更高，正数表示b优先级更高，0表示相等
 *          @en Comparison result: negative means a has higher priority, positive means b has higher priority, 0 means equal
 */
export function compareEntities(a: Entity, b: Entity): number {
    return a.updateOrder - b.updateOrder || a.id - b.id;
}

/**
 * @zh 游戏实体类
 * @en Game entity class
 *
 * @zh ECS架构中的实体（Entity），作为组件的容器。
 * 实体本身不包含游戏逻辑，所有功能都通过组件来实现。
 * 层级关系通过 HierarchyComponent 和 HierarchySystem 管理，
 * 而非 Entity 内置属性，符合 ECS 组合原则。
 * @en Entity in ECS architecture, serves as a container for components.
 * Entity itself contains no game logic, all functionality is implemented through components.
 * Hierarchy relationships are managed by HierarchyComponent and HierarchySystem,
 * not built-in Entity properties, following ECS composition principles.
 *
 * @example
 * ```typescript
 * // @zh 创建实体 | @en Create entity
 * const entity = scene.createEntity("Player");
 *
 * // @zh 添加组件 | @en Add component
 * const healthComponent = entity.addComponent(new HealthComponent(100));
 *
 * // @zh 获取组件 | @en Get component
 * const health = entity.getComponent(HealthComponent);
 *
 * // @zh 层级关系使用 HierarchySystem | @en Use HierarchySystem for hierarchy
 * const hierarchySystem = scene.getSystem(HierarchySystem);
 * hierarchySystem.setParent(childEntity, parentEntity);
 * ```
 */
export class Entity {
    /**
     * @zh Entity专用日志器
     * @en Entity logger
     */
    private static _logger = createLogger('Entity');

    /**
     * @zh 实体名称
     * @en Entity name
     */
    public name: string;

    /**
     * @zh 实体唯一标识符（运行时ID），用于快速查找
     * @en Unique entity identifier (runtime ID) for fast lookups
     */
    public readonly id: number;

    /**
     * @zh 持久化唯一标识符（GUID）
     * @en Persistent unique identifier (GUID)
     *
     * @zh 用于序列化/反序列化时保持实体引用一致性，在场景保存和加载时保持不变
     * @en Used to maintain entity reference consistency during serialization/deserialization, remains stable across save/load cycles
     */
    public readonly persistentId: string;

    /**
     * @zh 轻量级实体句柄
     * @en Lightweight entity handle
     *
     * @zh 数值类型的实体标识符，包含索引和代数信息。
     * 用于高性能场景下替代对象引用，支持 Archetype 存储等优化。
     * @en Numeric identifier containing index and generation.
     * Used for high-performance scenarios instead of object references,
     * supports Archetype storage optimizations.
     */
    private _handle: EntityHandle = NULL_HANDLE;

    /**
     * @zh 所属场景引用
     * @en Reference to the owning scene
     */
    public scene: IScene | null = null;

    /**
     * @zh 销毁状态标志
     * @en Destroyed state flag
     */
    private _isDestroyed: boolean = false;

    /**
     * @zh 激活状态
     * @en Active state
     */
    private _active: boolean = true;

    /**
     * @zh 实体标签，用于分类和查询
     * @en Entity tag for categorization and querying
     */
    private _tag: number = 0;

    /**
     * @zh 启用状态
     * @en Enabled state
     */
    private _enabled: boolean = true;

    /**
     * @zh 更新顺序
     * @en Update order
     */
    private _updateOrder: number = 0;

    /**
     * @zh 组件位掩码，用于快速 hasComponent 检查
     * @en Component bitmask for fast hasComponent checks
     */
    private _componentMask: BitMask64Data = BitMask64Utils.clone(BitMask64Utils.ZERO);

    /**
     * @zh 懒加载的组件数组缓存
     * @en Lazy-loaded component array cache
     */
    private _componentCache: Component[] | null = null;

    /**
     * @zh 生命周期策略，控制实体在场景切换时的行为
     * @en Lifecycle policy controlling entity behavior during scene transitions
     */
    private _lifecyclePolicy: EEntityLifecyclePolicy = EEntityLifecyclePolicy.SceneLocal;

    /**
     * @zh 构造函数
     * @en Constructor
     *
     * @param name - @zh 实体名称 @en Entity name
     * @param id - @zh 实体唯一标识符（运行时ID）@en Unique entity identifier (runtime ID)
     * @param persistentId - @zh 持久化标识符（可选，用于反序列化时恢复）@en Persistent identifier (optional, for deserialization)
     */
    constructor(name: string, id: number, persistentId?: string) {
        this.name = name;
        this.id = id;
        this.persistentId = persistentId ?? generateGUID();
    }

    /**
     * @zh 获取生命周期策略
     * @en Get lifecycle policy
     */
    public get lifecyclePolicy(): EEntityLifecyclePolicy {
        return this._lifecyclePolicy;
    }

    /**
     * @zh 检查实体是否为持久化实体（跨场景保留）
     * @en Check if entity is persistent (survives scene transitions)
     */
    public get isPersistent(): boolean {
        return this._lifecyclePolicy === EEntityLifecyclePolicy.Persistent;
    }

    /**
     * @zh 获取实体句柄
     * @en Get entity handle
     *
     * @zh 返回轻量级数值句柄，用于高性能场景。如果实体尚未分配句柄，返回 NULL_HANDLE。
     * @en Returns lightweight numeric handle for high-performance scenarios. Returns NULL_HANDLE if entity has no handle assigned.
     */
    public get handle(): EntityHandle {
        return this._handle;
    }

    /**
     * @zh 设置实体句柄（内部使用）
     * @en Set entity handle (internal use)
     *
     * @zh 此方法供 Scene 在创建实体时调用
     * @en Called by Scene when creating entities
     *
     * @internal
     */
    public setHandle(handle: EntityHandle): void {
        this._handle = handle;
    }

    /**
     * @zh 设置实体为持久化（跨场景保留）
     * @en Mark entity as persistent (survives scene transitions)
     *
     * @zh 标记后的实体在场景切换时不会被销毁，会自动迁移到新场景
     * @en Persistent entities are automatically migrated to the new scene
     *
     * @returns @zh this，支持链式调用 @en Returns this for chaining
     *
     * @example
     * ```typescript
     * const player = scene.createEntity('Player')
     *     .setPersistent()
     *     .addComponent(new PlayerComponent());
     * ```
     */
    public setPersistent(): this {
        this._lifecyclePolicy = EEntityLifecyclePolicy.Persistent;
        return this;
    }

    /**
     * @zh 设置实体为场景本地（随场景销毁），恢复默认行为
     * @en Mark entity as scene-local (destroyed with scene), restores default behavior
     *
     * @returns @zh this，支持链式调用 @en Returns this for chaining
     */
    public setSceneLocal(): this {
        this._lifecyclePolicy = EEntityLifecyclePolicy.SceneLocal;
        return this;
    }

    /**
     * @zh 获取销毁状态
     * @en Get destroyed state
     *
     * @returns @zh 如果实体已被销毁则返回true @en Returns true if entity has been destroyed
     */
    public get isDestroyed(): boolean {
        return this._isDestroyed;
    }

    /**
     * @zh 设置销毁状态（内部使用）
     * @en Set destroyed state (internal use)
     *
     * @zh 此方法供Scene和批量操作使用，以提高性能。不应在普通业务逻辑中调用，应使用destroy()方法
     * @en Used by Scene and batch operations for performance. Should not be called in normal business logic, use destroy() instead
     *
     * @internal
     */
    public setDestroyedState(destroyed: boolean): void {
        this._isDestroyed = destroyed;
    }

    /**
     * @zh 获取组件数组（懒加载）
     * @en Get component array (lazy-loaded)
     *
     * @returns @zh 只读的组件数组 @en Readonly component array
     */
    public get components(): readonly Component[] {
        if (this._componentCache === null) {
            this._rebuildComponentCache();
        }
        return this._componentCache!;
    }

    /**
     * @zh 从存储重建组件缓存
     * @en Rebuild component cache from storage
     */
    private _rebuildComponentCache(): void {
        const components: Component[] = [];

        if (!this.scene?.componentStorageManager) {
            this._componentCache = components;
            return;
        }

        const mask = this._componentMask;
        const registry = this.scene.componentRegistry;
        const maxBitIndex = registry.getRegisteredCount();

        for (let bitIndex = 0; bitIndex < maxBitIndex; bitIndex++) {
            if (BitMask64Utils.getBit(mask, bitIndex)) {
                const componentType = registry.getTypeByBitIndex(bitIndex);
                if (componentType) {
                    const component = this.scene.componentStorageManager.getComponent(this.id, componentType);

                    if (component) {
                        components.push(component);
                    }
                }
            }
        }

        this._componentCache = components;
    }

    /**
     * 获取活跃状态
     *
     * @returns 如果实体处于活跃状态则返回true
     */
    public get active(): boolean {
        return this._active;
    }

    /**
     * 设置活跃状态
     *
     * @param value - 新的活跃状态
     */
    public set active(value: boolean) {
        if (this._active !== value) {
            this._active = value;
            this.onActiveChanged();
        }
    }

    /**
     * @zh 获取实体标签
     * @en Get entity tag
     *
     * @returns @zh 实体的数字标签 @en Entity's numeric tag
     */
    public get tag(): number {
        return this._tag;
    }

    /**
     * @zh 设置实体标签
     * @en Set entity tag
     *
     * @param value - @zh 新的标签值 @en New tag value
     */
    public set tag(value: number) {
        this._tag = value;
    }

    /**
     * @zh 获取启用状态
     * @en Get enabled state
     *
     * @returns @zh 如果实体已启用则返回true @en Returns true if entity is enabled
     */
    public get enabled(): boolean {
        return this._enabled;
    }

    /**
     * @zh 设置启用状态
     * @en Set enabled state
     *
     * @param value - @zh 新的启用状态 @en New enabled state
     */
    public set enabled(value: boolean) {
        this._enabled = value;
    }

    /**
     * @zh 获取更新顺序
     * @en Get update order
     *
     * @returns @zh 实体的更新顺序值 @en Entity's update order value
     */
    public get updateOrder(): number {
        return this._updateOrder;
    }

    /**
     * @zh 设置更新顺序
     * @en Set update order
     *
     * @param value - @zh 新的更新顺序值 @en New update order value
     */
    public set updateOrder(value: number) {
        this._updateOrder = value;
    }

    /**
     * @zh 获取组件位掩码
     * @en Get component bitmask
     *
     * @returns @zh 实体的组件位掩码 @en Entity's component bitmask
     */
    public get componentMask(): BitMask64Data {
        return this._componentMask;
    }

    /**
     * @zh 创建并添加组件
     * @en Create and add component
     *
     * @param componentType - @zh 组件类型构造函数 @en Component type constructor
     * @param args - @zh 组件构造函数参数 @en Component constructor arguments
     * @returns @zh 创建的组件实例 @en Created component instance
     *
     * @example
     * ```typescript
     * const position = entity.createComponent(Position, 100, 200);
     * const health = entity.createComponent(Health, 100);
     * ```
     */
    public createComponent<T extends Component>(
        componentType: ComponentType<T>,
        ...args: ConstructorParameters<ComponentType<T>>
    ): T {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const component = new componentType(...args);
        return this.addComponent(component);
    }

    private addComponentInternal<T extends Component>(component: T): T {
        const componentType = component.constructor as ComponentType<T>;
        const registry = this.scene?.componentRegistry ?? GlobalComponentRegistry;
        const componentMask = registry.getBitMask(componentType);
        BitMask64Utils.orInPlace(this._componentMask, componentMask);
        this._componentCache = null;
        return component;
    }

    private notifyQuerySystems(changedComponentType?: ComponentType): void {
        if (!this.scene?.querySystem) return;

        this.scene.querySystem.updateEntity(this);
        this.scene.clearSystemEntityCaches();
        this.scene.notifyEntityComponentChanged?.(this, changedComponentType);
    }

    /**
     * @zh 添加组件到实体
     * @en Add component to entity
     *
     * @param component - @zh 要添加的组件实例 @en Component instance to add
     * @returns @zh 添加的组件实例 @en Added component instance
     * @throws @zh 如果实体已存在该类型的组件 @en If entity already has this component type
     *
     * @example
     * ```typescript
     * const position = new Position(100, 200);
     * entity.addComponent(position);
     * ```
     */
    public addComponent<T extends Component>(component: T): T {
        const componentType = component.constructor as ComponentType<T>;

        if (!this.scene) {
            throw new Error(
                'Entity must be added to Scene before adding components. Use scene.createEntity() instead of new Entity()'
            );
        }

        if (!this.scene.componentStorageManager) {
            throw new Error('Scene does not have componentStorageManager');
        }

        if (this.hasComponent(componentType)) {
            throw new Error(`Entity ${this.name} already has component ${getComponentTypeName(componentType)}`);
        }

        this.addComponentInternal(component);

        this.scene.componentStorageManager.addComponent(this.id, component);

        component.entityId = this.id;
        this.scene.referenceTracker?.registerEntityScene(this.id, this.scene);

        if (this.scene.isEditorMode) {
            this.scene.queueDeferredComponentCallback(() => component.onAddedToEntity());
        } else {
            component.onAddedToEntity();
        }

        if (this.scene.eventSystem) {
            this.scene.eventSystem.emitSync(ECSEventType.COMPONENT_ADDED, {
                timestamp: Date.now(),
                source: 'Entity',
                entity: this,
                entityId: this.id,
                entityName: this.name,
                entityTag: this.tag?.toString(),
                componentType: getComponentTypeName(componentType),
                component: component
            });
        }

        this.notifyQuerySystems(componentType);

        return component;
    }

    /**
     * @zh 获取指定类型的组件
     * @en Get component of specified type
     *
     * @param type - @zh 组件类型构造函数 @en Component type constructor
     * @returns @zh 组件实例，如果不存在则返回null @en Component instance, or null if not found
     *
     * @example
     * ```typescript
     * const position = entity.getComponent(Position);
     * if (position) {
     *     position.x += 10;
     *     position.y += 20;
     * }
     * ```
     */
    public getComponent<T extends Component>(type: ComponentType<T>): T | null {
        // 快速检查：位掩码
        if (!this.hasComponent(type)) {
            return null;
        }

        // 从Scene存储获取
        if (!this.scene?.componentStorageManager) {
            return null;
        }

        const component = this.scene.componentStorageManager.getComponent(this.id, type);
        return component as T | null;
    }

    /**
     * @zh 检查实体是否拥有指定类型的组件
     * @en Check if entity has component of specified type
     *
     * @param type - @zh 组件类型构造函数 @en Component type constructor
     * @returns @zh 如果实体拥有该组件返回true @en Returns true if entity has the component
     *
     * @example
     * ```typescript
     * if (entity.hasComponent(Position)) {
     *     const position = entity.getComponent(Position)!;
     *     position.x += 10;
     * }
     * ```
     */
    public hasComponent<T extends Component>(type: ComponentType<T>): boolean {
        const registry = this.scene?.componentRegistry ?? GlobalComponentRegistry;
        if (!registry.isRegistered(type)) {
            return false;
        }

        const mask = registry.getBitMask(type);
        return BitMask64Utils.hasAny(this._componentMask, mask);
    }

    /**
     * @zh 获取或创建指定类型的组件
     * @en Get or create component of specified type
     *
     * @zh 如果组件已存在则返回现有组件，否则创建新组件并添加到实体
     * @en Returns existing component if present, otherwise creates and adds new component
     *
     * @param type - @zh 组件类型构造函数 @en Component type constructor
     * @param args - @zh 组件构造函数参数（仅在创建新组件时使用）@en Constructor arguments (only used when creating new component)
     * @returns @zh 组件实例 @en Component instance
     *
     * @example
     * ```typescript
     * // @zh 确保实体拥有Position组件 | @en Ensure entity has Position component
     * const position = entity.getOrCreateComponent(Position, 0, 0);
     * position.x = 100;
     * ```
     */
    public getOrCreateComponent<T extends Component>(
        type: ComponentType<T>,
        ...args: ConstructorParameters<ComponentType<T>>
    ): T {
        let component = this.getComponent(type);
        if (!component) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            component = this.createComponent(type, ...args);
        }
        return component;
    }

    /**
     * @zh 标记组件为已修改
     * @en Mark component(s) as modified
     *
     * @zh 便捷方法，自动从场景获取当前 epoch 并标记组件。用于帧级变更检测系统。
     * @en Convenience method that auto-gets epoch from scene and marks components. Used for frame-level change detection system.
     *
     * @param components - @zh 要标记的组件 @en Components to mark
     *
     * @example
     * ```typescript
     * const pos = entity.getComponent(Position)!;
     * pos.x = 100;
     * entity.markDirty(pos);
     *
     * // @zh 或者标记多个组件 | @en Or mark multiple components
     * entity.markDirty(pos, vel);
     * ```
     */
    public markDirty(...components: Component[]): void {
        if (!this.scene) {
            return;
        }

        const epoch = this.scene.epochManager.current;
        for (const component of components) {
            component.markDirty(epoch);
        }
    }

    /**
     * @zh 移除指定的组件
     * @en Remove specified component
     *
     * @param component - @zh 要移除的组件实例 @en Component instance to remove
     */
    public removeComponent(component: Component): void {
        const componentType = component.constructor as ComponentType;
        const registry = this.scene?.componentRegistry ?? GlobalComponentRegistry;

        if (!registry.isRegistered(componentType)) {
            return;
        }

        const bitIndex = registry.getBitIndex(componentType);
        BitMask64Utils.clearBit(this._componentMask, bitIndex);
        this._componentCache = null;

        this.scene?.componentStorageManager?.removeComponent(this.id, componentType);
        this.scene?.referenceTracker?.clearComponentReferences(component);

        component.onRemovedFromEntity?.();
        component.entityId = null;

        if (this.scene?.eventSystem) {
            this.scene.eventSystem.emitSync(ECSEventType.COMPONENT_REMOVED, {
                timestamp: Date.now(),
                source: 'Entity',
                entityId: this.id,
                entityName: this.name,
                entityTag: this.tag?.toString(),
                componentType: getComponentTypeName(componentType),
                component: component
            });
        }

        this.notifyQuerySystems(componentType);
    }

    /**
     * @zh 移除指定类型的组件
     * @en Remove component by type
     *
     * @param type - @zh 组件类型 @en Component type
     * @returns @zh 被移除的组件实例或null @en Removed component instance or null
     */
    public removeComponentByType<T extends Component>(type: ComponentType<T>): T | null {
        const component = this.getComponent(type);
        if (component) {
            this.removeComponent(component);
            return component;
        }
        return null;
    }

    /**
     * @zh 移除所有组件
     * @en Remove all components
     */
    public removeAllComponents(): void {
        const componentsToRemove = [...this.components];
        BitMask64Utils.clear(this._componentMask);
        this._componentCache = null;

        for (const component of componentsToRemove) {
            const componentType = component.constructor as ComponentType;
            this.scene?.componentStorageManager?.removeComponent(this.id, componentType);
            component.onRemovedFromEntity();
        }

        this.notifyQuerySystems();
    }

    /**
     * @zh 批量添加组件
     * @en Add multiple components
     *
     * @param components - @zh 要添加的组件数组 @en Array of components to add
     * @returns @zh 添加的组件数组 @en Array of added components
     */
    public addComponents<T extends Component>(components: T[]): T[] {
        const addedComponents: T[] = [];

        for (const component of components) {
            try {
                addedComponents.push(this.addComponent(component));
            } catch (error) {
                Entity._logger.warn(`添加组件失败 ${getComponentInstanceTypeName(component)}:`, error);
            }
        }

        return addedComponents;
    }

    /**
     * 批量移除组件类型
     *
     * @param componentTypes - 要移除的组件类型数组
     * @returns 被移除的组件数组
     */
    public removeComponentsByTypes<T extends Component>(componentTypes: ComponentType<T>[]): (T | null)[] {
        const removedComponents: (T | null)[] = [];

        for (const componentType of componentTypes) {
            removedComponents.push(this.removeComponentByType(componentType));
        }

        return removedComponents;
    }

    /**
     * 获取所有指定类型的组件
     *
     * @param type - 组件类型
     * @returns 组件实例数组
     */
    public getComponents<T extends Component>(type: ComponentType<T>): T[] {
        const result: T[] = [];

        for (const component of this.components) {
            if (component instanceof type) {
                result.push(component as T);
            }
        }

        return result;
    }

    /**
     * 获取指定基类的组件（支持继承查找）
     *
     * 与 getComponent() 不同，此方法使用 instanceof 检查，支持子类查找。
     * 性能比位掩码查询稍慢，但支持继承层次结构。
     *
     * @param baseType - 组件基类类型
     * @returns 第一个匹配的组件实例，如果不存在则返回 null
     *
     * @example
     * ```typescript
     * // 查找 CompositeNodeComponent 或其子类
     * const composite = entity.getComponentByType(CompositeNodeComponent);
     * if (composite) {
     *     // composite 可能是 SequenceNode, SelectorNode 等
     * }
     * ```
     */
    public getComponentByType<T extends Component>(baseType: ComponentType<T>): T | null {
        for (const component of this.components) {
            if (component instanceof baseType) {
                return component as T;
            }
        }
        return null;
    }

    /**
     * @zh 活跃状态改变时的回调
     * @en Callback when active state changes
     *
     * @zh 通过事件系统发出 ENTITY_ENABLED 或 ENTITY_DISABLED 事件，
     * 组件可以通过监听这些事件来响应实体状态变化。
     * @en Emits ENTITY_ENABLED or ENTITY_DISABLED event through the event system.
     * Components can listen to these events to respond to entity state changes.
     */
    private onActiveChanged(): void {
        if (this.scene?.eventSystem) {
            const eventType = this._active
                ? ECSEventType.ENTITY_ENABLED
                : ECSEventType.ENTITY_DISABLED;

            this.scene.eventSystem.emitSync(eventType, {
                entity: this,
                scene: this.scene,
            });
        }
    }

    /**
     * @zh 销毁实体
     * @en Destroy entity
     *
     * @zh 移除所有组件并标记为已销毁。层级关系的清理由 HierarchySystem 处理。
     * @en Removes all components and marks as destroyed. Hierarchy cleanup is handled by HierarchySystem.
     */
    public destroy(): void {
        if (this._isDestroyed) {
            return;
        }

        this._isDestroyed = true;

        // 在清理之前发出销毁事件（组件仍然可访问）
        if (this.scene?.eventSystem) {
            this.scene.eventSystem.emitSync(ECSEventType.ENTITY_DESTROYED, {
                entity: this,
                entityId: this.id,
                scene: this.scene,
            });
        }

        if (this.scene && this.scene.referenceTracker) {
            this.scene.referenceTracker.clearReferencesTo(this.id);
            this.scene.referenceTracker.unregisterEntityScene(this.id);
        }

        this.removeAllComponents();

        if (this.scene) {
            if (this.scene.querySystem) {
                this.scene.querySystem.removeEntity(this);
            }

            if (this.scene.entities) {
                this.scene.entities.remove(this);
            }
        }
    }

    /**
     * @zh 比较实体优先级
     * @en Compare entity priority
     *
     * @param other - @zh 另一个实体 @en Another entity
     * @returns @zh 比较结果 @en Comparison result
     */
    public compareTo(other: Entity): number {
        return compareEntities(this, other);
    }

    /**
     * 获取实体的字符串表示
     *
     * @returns 实体的字符串描述
     */
    public toString(): string {
        return `Entity[${this.name}:${this.id}:${this.persistentId.slice(0, 8)}]`;
    }

    /**
     * 获取实体的调试信息（包含组件缓存信息）
     *
     * @returns 包含实体详细信息的对象
     */
    public getDebugInfo(): {
        name: string;
        id: number;
        persistentId: string;
        enabled: boolean;
        active: boolean;
        destroyed: boolean;
        componentCount: number;
        componentTypes: string[];
        componentMask: string;
        cacheBuilt: boolean;
    } {
        return {
            name: this.name,
            id: this.id,
            persistentId: this.persistentId,
            enabled: this._enabled,
            active: this._active,
            destroyed: this._isDestroyed,
            componentCount: this.components.length,
            componentTypes: this.components.map((c) => getComponentInstanceTypeName(c)),
            componentMask: BitMask64Utils.toString(this._componentMask, 2),
            cacheBuilt: this._componentCache !== null
        };
    }
}
