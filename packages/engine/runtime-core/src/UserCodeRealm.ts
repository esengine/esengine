/**
 * @zh 用户代码隔离域
 * @en User Code Realm
 *
 * @zh 提供用户代码（组件、系统、服务）与引擎核心的隔离。
 * @en Provides isolation between user code (components, systems, services) and engine core.
 *
 * @zh 设计目标 | Design goals:
 * @en
 * 1. 隔离注册 - 用户组件/系统不污染引擎核心注册表
 * 2. 干净卸载 - 切换项目或热更新时可完全清理用户代码
 * 3. 类型安全 - 使用 ServiceToken 提供类型安全的服务访问
 * 4. 热更新友好 - 支持组件/系统的原地更新
 */

import type { Component, EntitySystem, IScene } from '@esengine/ecs-framework';
import {
    ComponentRegistry,
    GlobalComponentRegistry,
    PluginServiceRegistry,
    createServiceToken,
    type ServiceToken
} from '@esengine/ecs-framework';
import { createLogger } from '@esengine/ecs-framework';

const logger = createLogger('UserCodeRealm');

/**
 * @zh 用户代码隔离域配置
 * @en User Code Realm configuration
 */
export interface UserCodeRealmConfig {
    /**
     * @zh 是否启用热更新模式
     * @en Whether to enable hot reload mode
     * @default true
     */
    hotReloadEnabled?: boolean;

    /**
     * @zh 是否在初始化时从全局注册表继承组件
     * @en Whether to inherit components from global registry on initialization
     * @default true
     */
    inheritGlobalComponents?: boolean;
}

/**
 * @zh 已注册的用户系统信息
 * @en Registered user system info
 */
export interface UserSystemInfo {
    /**
     * @zh 系统名称
     * @en System name
     */
    name: string;

    /**
     * @zh 系统类
     * @en System class
     */
    systemClass: new (...args: unknown[]) => EntitySystem;

    /**
     * @zh 系统实例
     * @en System instance
     */
    instance: EntitySystem;

    /**
     * @zh 系统所属场景
     * @en Scene the system belongs to
     */
    scene: IScene;

    /**
     * @zh 更新顺序
     * @en Update order
     */
    updateOrder: number;
}

/**
 * @zh 已注册的用户组件信息
 * @en Registered user component info
 */
export interface UserComponentInfo {
    /**
     * @zh 组件名称
     * @en Component name
     */
    name: string;

    /**
     * @zh 组件类
     * @en Component class
     */
    componentClass: new (...args: unknown[]) => Component;

    /**
     * @zh 分配的位索引
     * @en Allocated bit index
     */
    bitIndex: number;
}

/**
 * @zh 用户代码隔离域
 * @en User Code Realm
 *
 * @zh 管理用户定义的组件、系统和服务，提供与引擎核心的隔离。
 * @en Manages user-defined components, systems, and services with isolation from engine core.
 *
 * @example
 * ```typescript
 * const realm = new UserCodeRealm();
 *
 * // 注册用户组件 | Register user component
 * realm.registerComponent(MyComponent);
 *
 * // 创建用户系统实例 | Create user system instance
 * const system = realm.createSystem(MySystem, scene);
 *
 * // 注册用户服务 | Register user service
 * realm.registerService(MyServiceToken, myServiceInstance);
 *
 * // 清理所有用户代码 | Clean up all user code
 * realm.dispose();
 * ```
 */
export class UserCodeRealm {
    /**
     * @zh 用户组件注册表
     * @en User component registry
     */
    private _componentRegistry: ComponentRegistry;

    /**
     * @zh 用户服务注册表
     * @en User service registry
     */
    private _serviceRegistry: PluginServiceRegistry;

    /**
     * @zh 已注册的用户系统
     * @en Registered user systems
     */
    private _systems: UserSystemInfo[] = [];

    /**
     * @zh 已注册的用户组件信息
     * @en Registered user component info
     */
    private _components: Map<string, UserComponentInfo> = new Map();

    /**
     * @zh 配置
     * @en Configuration
     */
    private _config: Required<UserCodeRealmConfig>;

    /**
     * @zh 是否已释放
     * @en Whether disposed
     */
    private _disposed = false;

    /**
     * @zh 创建用户代码隔离域
     * @en Create user code realm
     *
     * @param config - @zh 配置选项 @en Configuration options
     */
    constructor(config?: UserCodeRealmConfig) {
        this._config = {
            hotReloadEnabled: config?.hotReloadEnabled ?? true,
            inheritGlobalComponents: config?.inheritGlobalComponents ?? true
        };

        this._componentRegistry = new ComponentRegistry();
        this._serviceRegistry = new PluginServiceRegistry();

        if (this._config.hotReloadEnabled) {
            this._componentRegistry.enableHotReload();
        }

        if (this._config.inheritGlobalComponents) {
            this._componentRegistry.cloneFrom(GlobalComponentRegistry);
        }

        logger.debug('UserCodeRealm created', {
            hotReloadEnabled: this._config.hotReloadEnabled,
            inheritGlobalComponents: this._config.inheritGlobalComponents
        });
    }

    // ============================================================================
    // 组件管理 | Component Management
    // ============================================================================

    /**
     * @zh 注册用户组件类
     * @en Register user component class
     *
     * @param componentClass - @zh 组件类 @en Component class
     * @returns @zh 分配的位索引 @en Allocated bit index
     */
    registerComponent<T extends Component>(
        componentClass: new (...args: unknown[]) => T
    ): number {
        this._ensureNotDisposed();

        const name = componentClass.name;
        const bitIndex = this._componentRegistry.register(componentClass as any);

        // 同时注册到全局注册表（用于序列化/反序列化）
        // Also register to global registry (for serialization/deserialization)
        try {
            GlobalComponentRegistry.register(componentClass as any);
        } catch {
            // 已注册则忽略 | Ignore if already registered
        }

        this._components.set(name, {
            name,
            componentClass,
            bitIndex
        });

        logger.debug(`Component registered: ${name}`, { bitIndex });

        return bitIndex;
    }

    /**
     * @zh 注销用户组件
     * @en Unregister user component
     *
     * @param componentName - @zh 组件名称 @en Component name
     */
    unregisterComponent(componentName: string): void {
        this._ensureNotDisposed();

        this._componentRegistry.unregister(componentName);
        this._components.delete(componentName);

        logger.debug(`Component unregistered: ${componentName}`);
    }

    /**
     * @zh 获取用户组件类
     * @en Get user component class
     *
     * @param componentName - @zh 组件名称 @en Component name
     * @returns @zh 组件类或 undefined @en Component class or undefined
     */
    getComponent(componentName: string): UserComponentInfo | undefined {
        return this._components.get(componentName);
    }

    /**
     * @zh 获取所有已注册的用户组件
     * @en Get all registered user components
     */
    getAllComponents(): UserComponentInfo[] {
        return Array.from(this._components.values());
    }

    /**
     * @zh 获取用户组件注册表
     * @en Get user component registry
     */
    get componentRegistry(): ComponentRegistry {
        return this._componentRegistry;
    }

    // ============================================================================
    // 系统管理 | System Management
    // ============================================================================

    /**
     * @zh 创建并注册用户系统
     * @en Create and register user system
     *
     * @param systemClass - @zh 系统类 @en System class
     * @param scene - @zh 目标场景 @en Target scene
     * @param updateOrder - @zh 更新顺序 @en Update order
     * @returns @zh 创建的系统实例 @en Created system instance
     */
    createSystem<T extends EntitySystem>(
        systemClass: new (...args: unknown[]) => T,
        scene: IScene,
        updateOrder = 0
    ): T {
        this._ensureNotDisposed();

        const instance = new systemClass();
        const name = systemClass.name;

        // 设置系统属性 | Set system properties
        if ('updateOrder' in instance) {
            (instance as any).updateOrder = updateOrder;
        }

        // 添加到场景 | Add to scene
        scene.addSystem(instance);

        // 记录系统信息 | Record system info
        this._systems.push({
            name,
            systemClass,
            instance,
            scene,
            updateOrder
        });

        logger.debug(`System created: ${name}`, { updateOrder });

        return instance;
    }

    /**
     * @zh 移除用户系统
     * @en Remove user system
     *
     * @param system - @zh 系统实例 @en System instance
     */
    removeSystem(system: EntitySystem): void {
        this._ensureNotDisposed();

        const index = this._systems.findIndex(s => s.instance === system);
        if (index !== -1) {
            const info = this._systems[index];

            // 从场景移除 | Remove from scene
            try {
                info.scene.removeSystem(system);
            } catch (err) {
                logger.warn(`Failed to remove system from scene: ${info.name}`, err);
            }

            this._systems.splice(index, 1);
            logger.debug(`System removed: ${info.name}`);
        }
    }

    /**
     * @zh 移除场景的所有用户系统
     * @en Remove all user systems from a scene
     *
     * @param scene - @zh 目标场景 @en Target scene
     */
    removeSystemsFromScene(scene: IScene): void {
        this._ensureNotDisposed();

        const toRemove = this._systems.filter(s => s.scene === scene);

        for (const info of toRemove) {
            try {
                scene.removeSystem(info.instance);
            } catch (err) {
                logger.warn(`Failed to remove system from scene: ${info.name}`, err);
            }
        }

        this._systems = this._systems.filter(s => s.scene !== scene);

        logger.debug(`Removed ${toRemove.length} systems from scene`);
    }

    /**
     * @zh 获取所有用户系统
     * @en Get all user systems
     */
    getAllSystems(): UserSystemInfo[] {
        return [...this._systems];
    }

    /**
     * @zh 获取场景的用户系统
     * @en Get user systems of a scene
     *
     * @param scene - @zh 目标场景 @en Target scene
     */
    getSystemsForScene(scene: IScene): UserSystemInfo[] {
        return this._systems.filter(s => s.scene === scene);
    }

    // ============================================================================
    // 服务管理 | Service Management
    // ============================================================================

    /**
     * @zh 注册用户服务
     * @en Register user service
     *
     * @param token - @zh 服务令牌 @en Service token
     * @param service - @zh 服务实例 @en Service instance
     */
    registerService<T>(token: ServiceToken<T>, service: T): void {
        this._ensureNotDisposed();
        this._serviceRegistry.register(token, service);
        logger.debug(`Service registered: ${token.name}`);
    }

    /**
     * @zh 获取用户服务
     * @en Get user service
     *
     * @param token - @zh 服务令牌 @en Service token
     * @returns @zh 服务实例或 undefined @en Service instance or undefined
     */
    getService<T>(token: ServiceToken<T>): T | undefined {
        return this._serviceRegistry.get(token);
    }

    /**
     * @zh 获取用户服务（必需）
     * @en Get user service (required)
     *
     * @param token - @zh 服务令牌 @en Service token
     * @throws @zh 如果服务未注册 @en If service not registered
     */
    requireService<T>(token: ServiceToken<T>): T {
        return this._serviceRegistry.require(token);
    }

    /**
     * @zh 检查服务是否已注册
     * @en Check if service is registered
     *
     * @param token - @zh 服务令牌 @en Service token
     */
    hasService<T>(token: ServiceToken<T>): boolean {
        return this._serviceRegistry.has(token);
    }

    /**
     * @zh 注销用户服务
     * @en Unregister user service
     *
     * @param token - @zh 服务令牌 @en Service token
     */
    unregisterService<T>(token: ServiceToken<T>): boolean {
        const result = this._serviceRegistry.unregister(token);
        if (result) {
            logger.debug(`Service unregistered: ${token.name}`);
        }
        return result;
    }

    /**
     * @zh 获取用户服务注册表
     * @en Get user service registry
     */
    get serviceRegistry(): PluginServiceRegistry {
        return this._serviceRegistry;
    }

    // ============================================================================
    // 热更新 | Hot Reload
    // ============================================================================

    /**
     * @zh 热更新组件类
     * @en Hot reload component class
     *
     * @zh 更新已注册组件的类定义，保持位索引不变。
     * @en Update registered component class definition while keeping bit index unchanged.
     *
     * @param componentClass - @zh 新的组件类 @en New component class
     * @returns @zh 是否成功更新 @en Whether update succeeded
     */
    hotReloadComponent<T extends Component>(
        componentClass: new (...args: unknown[]) => T
    ): boolean {
        this._ensureNotDisposed();

        if (!this._config.hotReloadEnabled) {
            logger.warn('Hot reload is disabled');
            return false;
        }

        const name = componentClass.name;
        const existing = this._components.get(name);

        if (!existing) {
            // 新组件，直接注册 | New component, register directly
            this.registerComponent(componentClass);
            return true;
        }

        // 复用位索引，更新类引用 | Reuse bit index, update class reference
        const bitIndex = this._componentRegistry.register(componentClass as any);
        this._components.set(name, {
            name,
            componentClass,
            bitIndex
        });

        // 更新全局注册表 | Update global registry
        try {
            GlobalComponentRegistry.register(componentClass as any);
        } catch {
            // 忽略 | Ignore
        }

        logger.debug(`Component hot reloaded: ${name}`, { bitIndex });
        return true;
    }

    /**
     * @zh 热更新系统
     * @en Hot reload systems
     *
     * @zh 移除旧系统实例，创建新系统实例。
     * @en Remove old system instances and create new ones.
     *
     * @param systemClasses - @zh 新的系统类列表 @en New system class list
     * @param scene - @zh 目标场景 @en Target scene
     * @returns @zh 新创建的系统实例 @en Newly created system instances
     */
    hotReloadSystems<T extends EntitySystem>(
        systemClasses: Array<new (...args: unknown[]) => T>,
        scene: IScene
    ): T[] {
        this._ensureNotDisposed();

        // 移除场景的旧系统 | Remove old systems from scene
        this.removeSystemsFromScene(scene);

        // 创建新系统 | Create new systems
        const newSystems: T[] = [];
        for (const systemClass of systemClasses) {
            const metadata = (systemClass as any).__systemMetadata__;
            const updateOrder = metadata?.updateOrder ?? 0;

            const system = this.createSystem(systemClass, scene, updateOrder);
            newSystems.push(system);
        }

        logger.info(`Hot reloaded ${newSystems.length} systems`);
        return newSystems;
    }

    // ============================================================================
    // 生命周期 | Lifecycle
    // ============================================================================

    /**
     * @zh 重置隔离域
     * @en Reset the realm
     *
     * @zh 清除所有用户组件、系统和服务，但不释放隔离域。
     * @en Clear all user components, systems, and services without disposing the realm.
     */
    reset(): void {
        this._ensureNotDisposed();

        // 移除所有系统 | Remove all systems
        for (const info of this._systems) {
            try {
                info.scene.removeSystem(info.instance);
            } catch {
                // 忽略错误 | Ignore errors
            }
        }
        this._systems = [];

        // 清除组件记录（不重置注册表，保持引擎组件）
        // Clear component records (don't reset registry, keep engine components)
        this._components.clear();

        // 清除服务 | Clear services
        this._serviceRegistry.clear();

        logger.info('UserCodeRealm reset');
    }

    /**
     * @zh 释放隔离域
     * @en Dispose the realm
     *
     * @zh 完全清理所有资源。释放后隔离域不可再使用。
     * @en Completely clean up all resources. Realm cannot be used after disposal.
     */
    dispose(): void {
        if (this._disposed) {
            return;
        }

        // 移除所有系统 | Remove all systems
        for (const info of this._systems) {
            try {
                info.scene.removeSystem(info.instance);
            } catch {
                // 忽略错误 | Ignore errors
            }
        }
        this._systems = [];

        // 清除组件 | Clear components
        this._components.clear();
        this._componentRegistry.reset();

        // 清除服务 | Clear services
        this._serviceRegistry.dispose();

        this._disposed = true;
        logger.info('UserCodeRealm disposed');
    }

    /**
     * @zh 检查是否已释放
     * @en Check if disposed
     */
    get isDisposed(): boolean {
        return this._disposed;
    }

    // ============================================================================
    // 私有方法 | Private Methods
    // ============================================================================

    /**
     * @zh 确保未释放
     * @en Ensure not disposed
     */
    private _ensureNotDisposed(): void {
        if (this._disposed) {
            throw new Error('UserCodeRealm has been disposed');
        }
    }
}

/**
 * @zh 用户代码隔离域服务令牌
 * @en User Code Realm service token
 */
export const UserCodeRealmToken = createServiceToken<UserCodeRealm>('userCodeRealm');
