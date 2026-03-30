import { Entity } from '../../Entity';
import { Component } from '../../Component';
import { IScene } from '../../IScene';
import { ComponentType, ComponentStorageManager } from '../ComponentStorage';
import { HierarchySystem } from '../../Systems/HierarchySystem';

/**
 * @zh 实体构建器 - 提供流式 API 创建和配置实体
 * @en Entity builder - provides fluent API for creating and configuring entities
 *
 * @example
 * ```typescript
 * const entity = new EntityBuilder(scene, storageManager)
 *     .named('Player')
 *     .tagged(1)
 *     .with(new PositionComponent())
 *     .with(new HealthComponent(100))
 *     .spawn();
 * ```
 */
export class EntityBuilder {
    private entity: Entity;
    private scene: IScene;
    private storageManager: ComponentStorageManager;

    constructor(scene: IScene, storageManager: ComponentStorageManager) {
        this.scene = scene;
        this.storageManager = storageManager;
        const id = scene.identifierPool.checkOut();
        this.entity = new Entity('', id);
        this.entity.scene = this.scene;
    }

    /**
     * @zh 设置实体名称
     * @en Set entity name
     *
     * @param name - @zh 实体名称 @en Entity name
     * @returns @zh 实体构建器 @en Entity builder
     */
    public named(name: string): EntityBuilder {
        this.entity.name = name;
        return this;
    }

    /**
     * @zh 设置实体标签
     * @en Set entity tag
     *
     * @param tag - @zh 标签值 @en Tag value
     * @returns @zh 实体构建器 @en Entity builder
     */
    public tagged(tag: number): EntityBuilder {
        this.entity.tag = tag;
        return this;
    }

    /**
     * @zh 添加组件
     * @en Add component
     *
     * @param component - @zh 组件实例 @en Component instance
     * @returns @zh 实体构建器 @en Entity builder
     */
    public with<T extends Component>(component: T): EntityBuilder {
        this.entity.addComponent(component);
        return this;
    }

    /**
     * @zh 添加多个组件
     * @en Add multiple components
     *
     * @param components - @zh 组件数组 @en Component array
     * @returns @zh 实体构建器 @en Entity builder
     */
    public withComponents(...components: Component[]): EntityBuilder {
        for (const component of components) {
            this.entity.addComponent(component);
        }
        return this;
    }

    /**
     * @zh 条件性添加组件
     * @en Conditionally add component
     *
     * @param condition - @zh 条件 @en Condition
     * @param component - @zh 组件实例 @en Component instance
     * @returns @zh 实体构建器 @en Entity builder
     */
    public withIf<T extends Component>(condition: boolean, component: T): EntityBuilder {
        if (condition) {
            this.entity.addComponent(component);
        }
        return this;
    }

    /**
     * @zh 使用工厂函数创建并添加组件
     * @en Create and add component using factory function
     *
     * @param factory - @zh 组件工厂函数 @en Component factory function
     * @returns @zh 实体构建器 @en Entity builder
     */
    public withFactory<T extends Component>(factory: () => T): EntityBuilder {
        const component = factory();
        this.entity.addComponent(component);
        return this;
    }

    /**
     * @zh 配置组件属性
     * @en Configure component properties
     *
     * @param componentType - @zh 组件类型 @en Component type
     * @param configurator - @zh 配置函数 @en Configurator function
     * @returns @zh 实体构建器 @en Entity builder
     */
    public configure<T extends Component>(
        componentType: ComponentType<T>,
        configurator: (component: T) => void
    ): EntityBuilder {
        const component = this.entity.getComponent(componentType);
        if (component) {
            configurator(component);
        }
        return this;
    }

    /**
     * @zh 设置实体为启用状态
     * @en Set entity enabled state
     *
     * @param enabled - @zh 是否启用 @en Whether enabled
     * @returns @zh 实体构建器 @en Entity builder
     */
    public enabled(enabled: boolean = true): EntityBuilder {
        this.entity.enabled = enabled;
        return this;
    }

    /**
     * @zh 设置实体为活跃状态
     * @en Set entity active state
     *
     * @param active - @zh 是否活跃 @en Whether active
     * @returns @zh 实体构建器 @en Entity builder
     */
    public active(active: boolean = true): EntityBuilder {
        this.entity.active = active;
        return this;
    }

    /**
     * @zh 添加子实体
     * @en Add child entity
     *
     * @param childBuilder - @zh 子实体构建器 @en Child entity builder
     * @returns @zh 实体构建器 @en Entity builder
     */
    public withChild(childBuilder: EntityBuilder): EntityBuilder {
        const child = childBuilder.build();
        const hierarchySystem = this.scene.getSystem(HierarchySystem);
        hierarchySystem?.setParent(child, this.entity);
        return this;
    }

    /**
     * @zh 批量添加子实体
     * @en Add multiple child entities
     *
     * @param childBuilders - @zh 子实体构建器数组 @en Child entity builder array
     * @returns @zh 实体构建器 @en Entity builder
     */
    public withChildren(...childBuilders: EntityBuilder[]): EntityBuilder {
        const hierarchySystem = this.scene.getSystem(HierarchySystem);
        for (const childBuilder of childBuilders) {
            const child = childBuilder.build();
            hierarchySystem?.setParent(child, this.entity);
        }
        return this;
    }

    /**
     * @zh 使用工厂函数创建子实体
     * @en Create child entity using factory function
     *
     * @param childFactory - @zh 子实体工厂函数 @en Child entity factory function
     * @returns @zh 实体构建器 @en Entity builder
     */
    public withChildFactory(childFactory: (parent: Entity) => EntityBuilder): EntityBuilder {
        const childBuilder = childFactory(this.entity);
        const child = childBuilder.build();
        const hierarchySystem = this.scene.getSystem(HierarchySystem);
        hierarchySystem?.setParent(child, this.entity);
        return this;
    }

    /**
     * @zh 条件性添加子实体
     * @en Conditionally add child entity
     *
     * @param condition - @zh 条件 @en Condition
     * @param childBuilder - @zh 子实体构建器 @en Child entity builder
     * @returns @zh 实体构建器 @en Entity builder
     */
    public withChildIf(condition: boolean, childBuilder: EntityBuilder): EntityBuilder {
        if (condition) {
            const child = childBuilder.build();
            const hierarchySystem = this.scene.getSystem(HierarchySystem);
            hierarchySystem?.setParent(child, this.entity);
        }
        return this;
    }

    /**
     * @zh 构建并返回实体
     * @en Build and return the entity
     *
     * @returns @zh 构建的实体 @en The built entity
     */
    public build(): Entity {
        return this.entity;
    }

    /**
     * @zh 构建实体并添加到场景
     * @en Build entity and add to scene
     *
     * @returns @zh 构建的实体 @en The built entity
     */
    public spawn(): Entity {
        this.scene.addEntity(this.entity);
        return this.entity;
    }

    /**
     * @zh 克隆当前构建器，创建一个拥有相同组件配置的新实体
     * @en Clone current builder, creating a new entity with the same component configuration
     *
     * @returns @zh 新的实体构建器 @en A new entity builder
     */
    public clone(): EntityBuilder {
        const newBuilder = new EntityBuilder(this.scene, this.storageManager);
        newBuilder.entity.name = this.entity.name;
        newBuilder.entity.tag = this.entity.tag;
        newBuilder.entity.enabled = this.entity.enabled;
        newBuilder.entity.active = this.entity.active;

        for (const component of this.entity.components) {
            const ComponentClass = component.constructor as ComponentType<Component>;
            const cloned = new ComponentClass();
            Object.assign(cloned, component);
            newBuilder.entity.addComponent(cloned);
        }

        return newBuilder;
    }
}
