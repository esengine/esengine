/**
 * Service identifier type
 * 服务标识类型
 */
export type ServiceIdentifier<T = unknown> = abstract new (...args: never[]) => T;

/**
 * Service factory function
 * 服务工厂函数
 */
export type ServiceFactory<T> = (container: ServiceContainer) => T;

/**
 * Service lifecycle
 * 服务生命周期
 */
export const enum EServiceLifecycle {
    /** Single instance shared across all resolutions | 单例模式 */
    Singleton = 'singleton',
    /** New instance per resolution | 每次解析创建新实例 */
    Transient = 'transient'
}

/**
 * Service registration info
 * 服务注册信息
 */
interface ServiceRegistration<T = unknown> {
    factory: ServiceFactory<T>;
    lifecycle: EServiceLifecycle;
    instance?: T;
}

/**
 * ServiceContainer
 *
 * Lightweight dependency injection container for FairyGUI.
 *
 * 轻量级依赖注入容器
 *
 * Features:
 * - Singleton and transient lifecycles
 * - Factory-based registration
 * - Type-safe resolution
 * - Circular dependency detection
 *
 * @example
 * ```typescript
 * const container = new ServiceContainer();
 *
 * // Register singleton
 * container.registerSingleton(AudioService, () => new AudioService());
 *
 * // Register with dependencies
 * container.registerSingleton(UIManager, (c) => new UIManager(
 *     c.resolve(AudioService)
 * ));
 *
 * // Resolve
 * const uiManager = container.resolve(UIManager);
 * ```
 */
export class ServiceContainer {
    private _registrations: Map<ServiceIdentifier, ServiceRegistration> = new Map();
    private _resolving: Set<ServiceIdentifier> = new Set();
    private _disposed: boolean = false;

    /**
     * Register a singleton service
     * 注册单例服务
     */
    public registerSingleton<T>(
        identifier: ServiceIdentifier<T>,
        factory: ServiceFactory<T>
    ): this {
        this.checkDisposed();
        this._registrations.set(identifier, {
            factory,
            lifecycle: EServiceLifecycle.Singleton
        });
        return this;
    }

    /**
     * Register a singleton instance directly
     * 直接注册单例实例
     */
    public registerInstance<T>(identifier: ServiceIdentifier<T>, instance: T): this {
        this.checkDisposed();
        this._registrations.set(identifier, {
            factory: () => instance,
            lifecycle: EServiceLifecycle.Singleton,
            instance
        });
        return this;
    }

    /**
     * Register a transient service (new instance per resolution)
     * 注册瞬时服务（每次解析创建新实例）
     */
    public registerTransient<T>(
        identifier: ServiceIdentifier<T>,
        factory: ServiceFactory<T>
    ): this {
        this.checkDisposed();
        this._registrations.set(identifier, {
            factory,
            lifecycle: EServiceLifecycle.Transient
        });
        return this;
    }

    /**
     * Resolve a service
     * 解析服务
     */
    public resolve<T>(identifier: ServiceIdentifier<T>): T {
        this.checkDisposed();

        const registration = this._registrations.get(identifier);
        if (!registration) {
            throw new Error(`Service not registered: ${identifier.name}`);
        }

        // Check for circular dependency
        if (this._resolving.has(identifier)) {
            throw new Error(`Circular dependency detected: ${identifier.name}`);
        }

        // Return cached singleton if available
        if (registration.lifecycle === EServiceLifecycle.Singleton && registration.instance !== undefined) {
            return registration.instance as T;
        }

        // Resolve
        this._resolving.add(identifier);
        try {
            const instance = registration.factory(this) as T;

            if (registration.lifecycle === EServiceLifecycle.Singleton) {
                registration.instance = instance;
            }

            return instance;
        } finally {
            this._resolving.delete(identifier);
        }
    }

    /**
     * Try to resolve a service, returns null if not found
     * 尝试解析服务，未找到时返回 null
     */
    public tryResolve<T>(identifier: ServiceIdentifier<T>): T | null {
        if (!this._registrations.has(identifier)) {
            return null;
        }
        return this.resolve(identifier);
    }

    /**
     * Check if a service is registered
     * 检查服务是否已注册
     */
    public isRegistered<T>(identifier: ServiceIdentifier<T>): boolean {
        return this._registrations.has(identifier);
    }

    /**
     * Unregister a service
     * 取消注册服务
     */
    public unregister<T>(identifier: ServiceIdentifier<T>): boolean {
        const registration = this._registrations.get(identifier);
        if (registration) {
            // Dispose singleton if it has dispose method
            if (registration.instance && typeof (registration.instance as IDisposable).dispose === 'function') {
                (registration.instance as IDisposable).dispose();
            }
            this._registrations.delete(identifier);
            return true;
        }
        return false;
    }

    /**
     * Create a child container that inherits registrations
     * 创建继承注册的子容器
     */
    public createChild(): ServiceContainer {
        const child = new ServiceContainer();
        // Copy registrations (singletons are shared)
        for (const [id, reg] of this._registrations) {
            child._registrations.set(id, { ...reg });
        }
        return child;
    }

    /**
     * Dispose the container and all singleton instances
     * 销毁容器和所有单例实例
     */
    public dispose(): void {
        if (this._disposed) return;

        for (const registration of this._registrations.values()) {
            if (registration.instance && typeof (registration.instance as IDisposable).dispose === 'function') {
                (registration.instance as IDisposable).dispose();
            }
        }

        this._registrations.clear();
        this._resolving.clear();
        this._disposed = true;
    }

    private checkDisposed(): void {
        if (this._disposed) {
            throw new Error('ServiceContainer has been disposed');
        }
    }
}

/**
 * Disposable interface
 * 可销毁接口
 */
interface IDisposable {
    dispose(): void;
}

/**
 * Global service container instance
 * 全局服务容器实例
 */
let _globalContainer: ServiceContainer | null = null;

/**
 * Get global service container
 * 获取全局服务容器
 */
export function getGlobalContainer(): ServiceContainer {
    if (!_globalContainer) {
        _globalContainer = new ServiceContainer();
    }
    return _globalContainer;
}

/**
 * Set global service container
 * 设置全局服务容器
 */
export function setGlobalContainer(container: ServiceContainer): void {
    _globalContainer = container;
}

/**
 * Inject decorator marker (for future decorator support)
 * 注入装饰器标记（用于未来装饰器支持）
 */
export function Inject<T>(identifier: ServiceIdentifier<T>): PropertyDecorator {
    return (_target: object, _propertyKey: string | symbol) => {
        // Store metadata for future use
        // This is a placeholder for decorator-based injection
        void identifier;
    };
}
