import { TimerManager } from './Utils/Timers/TimerManager';
import { ITimer } from './Utils/Timers/ITimer';
import { Timer } from './Utils/Timers/Timer';
import { Time } from './Utils/Time';
import { PerformanceMonitor } from './Utils/PerformanceMonitor';
import { PoolManager } from './Utils/Pool/PoolManager';
import { DebugManager } from './Utils/Debug';
import { ICoreConfig, IECSDebugConfig } from './Types';
import { createLogger } from './Utils/Logger';
import { SceneManager } from './ECS/SceneManager';
import { IScene } from './ECS/IScene';
import { ServiceContainer } from './Core/ServiceContainer';
import { PluginManager } from './Core/PluginManager';
import { PluginServiceRegistry } from './Core/PluginServiceRegistry';
import { IPlugin } from './Core/Plugin';
import { WorldManager } from './ECS/WorldManager';
import { DebugConfigService } from './Utils/Debug/DebugConfigService';
import { createInstance } from './Core/DI/Decorators';

/**
 * @zh 游戏引擎核心类
 * @en Game engine core class
 *
 * @zh 职责：
 * - 提供全局服务（Timer、Performance、Pool等）
 * - 管理场景生命周期（内置SceneManager）
 * - 管理全局管理器的生命周期
 * - 提供统一的游戏循环更新入口
 * @en Responsibilities:
 * - Provide global services (Timer, Performance, Pool, etc.)
 * - Manage scene lifecycle (built-in SceneManager)
 * - Manage global manager lifecycles
 * - Provide unified game loop update entry
 *
 * @example
 * ```typescript
 * // @zh 初始化并设置场景 | @en Initialize and set scene
 * Core.create({ debug: true });
 * Core.setScene(new GameScene());
 *
 * // @zh 游戏循环（自动更新全局服务和场景）| @en Game loop (auto-updates global services and scene)
 * function gameLoop(deltaTime: number) {
 *     Core.update(deltaTime);
 * }
 *
 * // @zh 使用定时器 | @en Use timer
 * Core.schedule(1.0, false, null, (timer) => {
 *     console.log("Executed after 1 second");
 * });
 *
 * // @zh 切换场景 | @en Switch scene
 * Core.loadScene(new MenuScene());  // @zh 延迟切换 | @en Deferred switch
 * Core.setScene(new GameScene());   // @zh 立即切换 | @en Immediate switch
 *
 * // @zh 获取当前场景 | @en Get current scene
 * const currentScene = Core.scene;
 * ```
 */
export class Core {
    /**
     * @zh 游戏暂停状态，当设置为true时，游戏循环将暂停执行
     * @en Game paused state, when set to true, game loop will pause execution
     */
    public static paused = false;

    /**
     * @zh 全局核心实例，可能为null表示Core尚未初始化或已被销毁
     * @en Global core instance, null means Core is not initialized or destroyed
     */
    private static _instance: Core | null = null;

    /**
     * @zh Core专用日志器
     * @en Core logger
     */
    private static readonly _logger = createLogger('Core');

    /**
     * @zh 调试模式标志，在调试模式下会启用额外的性能监控和错误检查
     * @en Debug mode flag, enables additional performance monitoring and error checking in debug mode
     */
    public readonly debug: boolean;

    /**
     * @zh 服务容器，管理所有服务的注册、解析和生命周期
     * @en Service container for managing registration, resolution, and lifecycle of all services
     */
    private _serviceContainer: ServiceContainer;

    private _timerManager: TimerManager;
    private _performanceMonitor: PerformanceMonitor;
    private _poolManager: PoolManager;
    private _debugManager?: DebugManager;

    /**
     * @zh 场景管理器，管理当前场景的生命周期
     * @en Scene manager for managing current scene lifecycle
     */
    private _sceneManager: SceneManager;

    /**
     * @zh World管理器，管理多个独立的World实例（可选）
     * @en World manager for managing multiple independent World instances (optional)
     */
    private _worldManager: WorldManager;

    /**
     * @zh 插件管理器，管理所有插件的生命周期
     * @en Plugin manager for managing all plugin lifecycles
     */
    private _pluginManager: PluginManager;

    /**
     * @zh 插件服务注册表，基于 ServiceToken 的类型安全服务注册表
     * @en Plugin service registry, type-safe service registry based on ServiceToken
     */
    private _pluginServiceRegistry: PluginServiceRegistry;

    /**
     * @zh Core配置
     * @en Core configuration
     */
    private _config: ICoreConfig;

    /**
     * @zh 创建核心实例
     * @en Create core instance
     *
     * @param config - @zh Core配置对象 @en Core configuration object
     */
    private constructor(config: ICoreConfig = {}) {
        Core._instance = this;
        this._config = { debug: true, ...config };
        this._serviceContainer = new ServiceContainer();

        this._timerManager = new TimerManager();
        this._serviceContainer.registerInstance(TimerManager, this._timerManager);

        this._performanceMonitor = new PerformanceMonitor();
        this._serviceContainer.registerInstance(PerformanceMonitor, this._performanceMonitor);
        if (this._config.debug) {
            this._performanceMonitor.enable();
        }

        this._poolManager = new PoolManager();
        this._serviceContainer.registerInstance(PoolManager, this._poolManager);

        this._sceneManager = new SceneManager(this._performanceMonitor);
        this._serviceContainer.registerInstance(SceneManager, this._sceneManager);
        this._sceneManager.setSceneChangedCallback(() => this._debugManager?.onSceneChanged());

        this._worldManager = new WorldManager({ debug: !!this._config.debug, ...this._config.worldManagerConfig });
        this._serviceContainer.registerInstance(WorldManager, this._worldManager);

        this._pluginManager = new PluginManager();
        this._pluginManager.initialize(this, this._serviceContainer);
        this._serviceContainer.registerInstance(PluginManager, this._pluginManager);

        this._pluginServiceRegistry = new PluginServiceRegistry();
        this._serviceContainer.registerInstance(PluginServiceRegistry, this._pluginServiceRegistry);

        this.debug = this._config.debug ?? true;

        if (this._config.debugConfig?.enabled) {
            const configService = new DebugConfigService();
            configService.setConfig(this._config.debugConfig);
            this._serviceContainer.registerInstance(DebugConfigService, configService);
            this._serviceContainer.registerSingleton(DebugManager, (c) => createInstance(DebugManager, c));
            this._debugManager = this._serviceContainer.resolve(DebugManager);
            this._debugManager.onInitialize();
        }

        this.initialize();
    }

    /**
     * @zh 获取核心实例
     * @en Get core instance
     *
     * @returns @zh 全局核心实例 @en Global core instance
     */
    public static get Instance() {
        return this._instance;
    }

    /**
     * @zh 获取服务容器
     * @en Get service container
     *
     * @zh 用于注册和解析自定义服务。
     * @en Used for registering and resolving custom services.
     *
     * @returns @zh 服务容器实例 @en Service container instance
     * @throws @zh 如果Core实例未创建 @en If Core instance is not created
     *
     * @example
     * ```typescript
     * // @zh 注册自定义服务 | @en Register custom service
     * Core.services.registerSingleton(MyService);
     *
     * // @zh 解析服务 | @en Resolve service
     * const myService = Core.services.resolve(MyService);
     * ```
     */
    public static get services(): ServiceContainer {
        if (!this._instance) {
            throw new Error('Core instance not created, call Core.create() first | Core实例未创建，请先调用Core.create()');
        }
        return this._instance._serviceContainer;
    }

    /**
     * @zh 获取插件服务注册表
     * @en Get plugin service registry
     *
     * @zh 用于基于 ServiceToken 的类型安全服务注册和获取。
     * @en For type-safe service registration and retrieval based on ServiceToken.
     *
     * @returns @zh PluginServiceRegistry 实例 @en PluginServiceRegistry instance
     * @throws @zh 如果 Core 实例未创建 @en If Core instance is not created
     *
     * @example
     * ```typescript
     * import { createServiceToken } from '@esengine/ecs-framework';
     *
     * // @zh 定义服务令牌 | @en Define service token
     * const MyServiceToken = createServiceToken<IMyService>('myService');
     *
     * // @zh 注册服务 | @en Register service
     * Core.pluginServices.register(MyServiceToken, myServiceInstance);
     *
     * // @zh 获取服务（可选）| @en Get service (optional)
     * const service = Core.pluginServices.get(MyServiceToken);
     *
     * // @zh 获取服务（必需，不存在则抛异常）| @en Get service (required, throws if not found)
     * const service = Core.pluginServices.require(MyServiceToken);
     * ```
     */
    public static get pluginServices(): PluginServiceRegistry {
        if (!this._instance) {
            throw new Error('Core instance not created, call Core.create() first | Core实例未创建，请先调用Core.create()');
        }
        return this._instance._pluginServiceRegistry;
    }

    /**
     * @zh 获取World管理器
     * @en Get World manager
     *
     * @zh 用于管理多个独立的World实例（高级用户）。
     * @en For managing multiple independent World instances (advanced users).
     *
     * @returns @zh WorldManager实例 @en WorldManager instance
     * @throws @zh 如果Core实例未创建 @en If Core instance is not created
     *
     * @example
     * ```typescript
     * // @zh 创建多个游戏房间 | @en Create multiple game rooms
     * const wm = Core.worldManager;
     * const room1 = wm.createWorld('room_001');
     * room1.createScene('game', new GameScene());
     * room1.start();
     * ```
     */
    public static get worldManager(): WorldManager {
        if (!this._instance) {
            throw new Error('Core instance not created, call Core.create() first | Core实例未创建，请先调用Core.create()');
        }
        return this._instance._worldManager;
    }

    /**
     * @zh 创建Core实例
     * @en Create Core instance
     *
     * @zh 如果实例已存在，则返回现有实例。
     * @en If instance already exists, returns the existing instance.
     *
     * @param config - @zh Core配置，也可以直接传入boolean表示debug模式（向后兼容） @en Core config, can also pass boolean for debug mode (backward compatible)
     * @returns @zh Core实例 @en Core instance
     *
     * @example
     * ```typescript
     * // @zh 方式1：使用配置对象 | @en Method 1: Use config object
     * Core.create({
     *     debug: true,
     *     debugConfig: {
     *         enabled: true,
     *         websocketUrl: 'ws://localhost:9229'
     *     }
     * });
     *
     * // @zh 方式2：简单模式（向后兼容）| @en Method 2: Simple mode (backward compatible)
     * Core.create(true);  // debug = true
     * ```
     */
    public static create(config: ICoreConfig | boolean = true): Core {
        if (this._instance == null) {
            // 向后兼容：如果传入boolean，转换为配置对象
            const coreConfig: ICoreConfig = typeof config === 'boolean'
                ? { debug: config }
                : config;
            this._instance = new Core(coreConfig);
        } else {
            this._logger.warn('Core实例已创建，返回现有实例');
        }
        return this._instance;
    }

    /**
     * @zh 设置当前场景
     * @en Set current scene
     *
     * @param scene - @zh 要设置的场景 @en The scene to set
     * @returns @zh 设置的场景实例 @en The scene instance that was set
     *
     * @example
     * ```typescript
     * Core.create({ debug: true });
     *
     * // @zh 创建并设置场景 | @en Create and set scene
     * const gameScene = new GameScene();
     * Core.setScene(gameScene);
     * ```
     */
    public static setScene<T extends IScene>(scene: T): T {
        if (!this._instance) {
            Core._logger.warn('Core实例未创建，请先调用Core.create()');
            throw new Error('Core实例未创建');
        }

        return this._instance._sceneManager.setScene(scene);
    }

    /**
     * @zh 获取当前场景
     * @en Get current scene
     *
     * @returns @zh 当前场景，如果没有场景则返回null @en Current scene, or null if no scene
     */
    public static get scene(): IScene | null {
        if (!this._instance) {
            return null;
        }
        return this._instance._sceneManager.currentScene;
    }

    /**
     * @zh 获取ECS流式API
     * @en Get ECS fluent API
     *
     * @returns @zh ECS API实例，如果当前没有场景则返回null @en ECS API instance, or null if no scene
     *
     * @example
     * ```typescript
     * // @zh 使用流式API创建实体 | @en Create entity with fluent API
     * const player = Core.ecsAPI?.createEntity('Player')
     *     .addComponent(Position, 100, 100)
     *     .addComponent(Velocity, 50, 0);
     *
     * // @zh 查询实体 | @en Query entities
     * const enemies = Core.ecsAPI?.query(Enemy, Transform);
     *
     * // @zh 发射事件 | @en Emit event
     * Core.ecsAPI?.emit('game:start', { level: 1 });
     * ```
     */
    public static get ecsAPI() {
        if (!this._instance) {
            return null;
        }
        return this._instance._sceneManager.api;
    }

    /**
     * @zh 延迟加载场景（下一帧切换）
     * @en Load scene with delay (switch on next frame)
     *
     * @param scene - @zh 要加载的场景 @en The scene to load
     *
     * @example
     * ```typescript
     * // @zh 延迟切换场景（在下一帧生效）| @en Deferred scene switch (takes effect next frame)
     * Core.loadScene(new MenuScene());
     * ```
     */
    public static loadScene<T extends IScene>(scene: T): void {
        if (!this._instance) {
            Core._logger.warn('Core实例未创建，请先调用Core.create()');
            return;
        }

        this._instance._sceneManager.loadScene(scene);
    }

    /**
     * @zh 更新游戏逻辑
     * @en Update game logic
     *
     * @zh 此方法应该在游戏引擎的更新循环中调用。会自动更新全局服务和当前场景。
     * @en This method should be called in the game engine's update loop. Automatically updates global services and current scene.
     *
     * @param deltaTime - @zh 外部引擎提供的帧时间间隔（秒）@en Frame delta time in seconds from external engine
     *
     * @example
     * ```typescript
     * // @zh 初始化 | @en Initialize
     * Core.create({ debug: true });
     * Core.setScene(new GameScene());
     *
     * // @zh Laya引擎集成 | @en Laya engine integration
     * Laya.timer.frameLoop(1, this, () => {
     *     const deltaTime = Laya.timer.delta / 1000;
     *     Core.update(deltaTime);
     * });
     *
     * // @zh Cocos Creator集成 | @en Cocos Creator integration
     * update(deltaTime: number) {
     *     Core.update(deltaTime);
     * }
     * ```
     */
    public static update(deltaTime: number): void {
        if (!this._instance) {
            Core._logger.warn('Core实例未创建，请先调用Core.create()');
            return;
        }

        this._instance.updateInternal(deltaTime);
    }


    /**
     * @zh 调度定时器
     * @en Schedule a timer
     *
     * @zh 创建一个定时器，在指定时间后执行回调函数。
     * @en Create a timer that executes a callback after the specified time.
     *
     * @param timeInSeconds - @zh 延迟时间（秒）@en Delay time in seconds
     * @param repeats - @zh 是否重复执行，默认为false @en Whether to repeat, defaults to false
     * @param context - @zh 回调函数的上下文 @en Context for the callback
     * @param onTime - @zh 定时器触发时的回调函数 @en Callback when timer fires
     * @returns @zh 创建的定时器实例 @en The created timer instance
     * @throws @zh 如果Core实例未创建或onTime回调未提供 @en If Core instance not created or onTime not provided
     *
     * @example
     * ```typescript
     * // @zh 一次性定时器 | @en One-time timer
     * Core.schedule(1.0, false, null, (timer) => {
     *     console.log("Executed after 1 second");
     * });
     *
     * // @zh 重复定时器 | @en Repeating timer
     * Core.schedule(0.5, true, null, (timer) => {
     *     console.log("Executed every 0.5 seconds");
     * });
     * ```
     */
    public static schedule<TContext = unknown>(timeInSeconds: number, repeats: boolean = false, context?: TContext, onTime?: (timer: ITimer<TContext>) => void): Timer<TContext> {
        if (!this._instance) {
            throw new Error('Core实例未创建，请先调用Core.create()');
        }
        if (!onTime) {
            throw new Error('onTime callback is required');
        }
        return this._instance._timerManager.schedule(timeInSeconds, repeats, context as TContext, onTime);
    }

    /**
     * @zh 启用调试功能
     * @en Enable debug features
     *
     * @param config - @zh 调试配置 @en Debug configuration
     */
    public static enableDebug(config: IECSDebugConfig): void {
        if (!this._instance) {
            Core._logger.warn('Core实例未创建，请先调用Core.create()');
            return;
        }

        if (this._instance._debugManager) {
            this._instance._debugManager.updateConfig(config);
        } else {
            const configService = new DebugConfigService();
            configService.setConfig(config);
            this._instance._serviceContainer.registerInstance(DebugConfigService, configService);

            this._instance._serviceContainer.registerSingleton(DebugManager, (c) =>
                createInstance(DebugManager, c)
            );

            this._instance._debugManager = this._instance._serviceContainer.resolve(DebugManager);
            this._instance._debugManager.onInitialize();
        }

        // 更新Core配置
        this._instance._config.debugConfig = config;
    }

    /**
     * @zh 禁用调试功能
     * @en Disable debug features
     */
    public static disableDebug(): void {
        if (!this._instance) return;

        if (this._instance._debugManager) {
            this._instance._debugManager.stop();
            delete this._instance._debugManager;
        }

        // 更新Core配置
        if (this._instance._config.debugConfig) {
            this._instance._config.debugConfig.enabled = false;
        }
    }

    /**
     * @zh 获取调试数据
     * @en Get debug data
     *
     * @returns @zh 当前调试数据，如果调试未启用则返回null @en Current debug data, or null if debug is disabled
     */
    public static getDebugData(): unknown {
        if (!this._instance?._debugManager) {
            return null;
        }

        return this._instance._debugManager.getDebugData();
    }

    /**
     * @zh 检查调试是否启用
     * @en Check if debug is enabled
     *
     * @returns @zh 调试状态 @en Debug status
     */
    public static get isDebugEnabled(): boolean {
        return this._instance?._config.debugConfig?.enabled || false;
    }

    /**
     * @zh 获取性能监视器实例
     * @en Get performance monitor instance
     *
     * @returns @zh 性能监视器，如果Core未初始化则返回null @en Performance monitor, or null if Core not initialized
     */
    public static get performanceMonitor(): PerformanceMonitor | null {
        return this._instance?._performanceMonitor || null;
    }

    /**
     * @zh 安装插件
     * @en Install plugin
     *
     * @param plugin - @zh 插件实例 @en Plugin instance
     * @throws @zh 如果Core实例未创建或插件安装失败 @en If Core instance not created or plugin installation fails
     *
     * @example
     * ```typescript
     * Core.create({ debug: true });
     *
     * // @zh 安装插件 | @en Install plugin
     * await Core.installPlugin(new MyPlugin());
     * ```
     */
    public static async installPlugin(plugin: IPlugin): Promise<void> {
        if (!this._instance) {
            throw new Error('Core实例未创建，请先调用Core.create()');
        }

        await this._instance._pluginManager.install(plugin);
    }

    /**
     * @zh 卸载插件
     * @en Uninstall plugin
     *
     * @param name - @zh 插件名称 @en Plugin name
     * @throws @zh 如果Core实例未创建或插件卸载失败 @en If Core instance not created or plugin uninstallation fails
     *
     * @example
     * ```typescript
     * await Core.uninstallPlugin('my-plugin');
     * ```
     */
    public static async uninstallPlugin(name: string): Promise<void> {
        if (!this._instance) {
            throw new Error('Core实例未创建，请先调用Core.create()');
        }

        await this._instance._pluginManager.uninstall(name);
    }

    /**
     * @zh 获取插件实例
     * @en Get plugin instance
     *
     * @param name - @zh 插件名称 @en Plugin name
     * @returns @zh 插件实例，如果未安装则返回undefined @en Plugin instance, or undefined if not installed
     *
     * @example
     * ```typescript
     * const myPlugin = Core.getPlugin('my-plugin');
     * if (myPlugin) {
     *     console.log(myPlugin.version);
     * }
     * ```
     */
    public static getPlugin(name: string): IPlugin | undefined {
        if (!this._instance) {
            return undefined;
        }

        return this._instance._pluginManager.getPlugin(name);
    }

    /**
     * @zh 检查插件是否已安装
     * @en Check if plugin is installed
     *
     * @param name - @zh 插件名称 @en Plugin name
     * @returns @zh 是否已安装 @en Whether installed
     *
     * @example
     * ```typescript
     * if (Core.isPluginInstalled('my-plugin')) {
     *     console.log('Plugin is installed');
     * }
     * ```
     */
    public static isPluginInstalled(name: string): boolean {
        if (!this._instance) {
            return false;
        }

        return this._instance._pluginManager.isInstalled(name);
    }

    /**
     * @zh 初始化核心系统
     * @en Initialize core system
     *
     * @zh 执行核心系统的初始化逻辑。
     * @en Execute core system initialization logic.
     */
    protected initialize() {
        // 核心系统初始化
        Core._logger.info('Core initialized', {
            debug: this.debug,
            debugEnabled: this._config.debugConfig?.enabled || false
        });
    }

    /**
     * @zh 内部更新方法
     * @en Internal update method
     *
     * @param deltaTime - @zh 帧时间间隔（秒）@en Frame delta time in seconds
     */
    private updateInternal(deltaTime: number): void {
        if (Core.paused) return;

        const frameStartTime = this._performanceMonitor.startMonitoring('Core.update');

        Time.update(deltaTime);
        this._performanceMonitor.updateFPS?.(Time.deltaTime);

        const servicesStartTime = this._performanceMonitor.startMonitoring('Services.update');
        this._serviceContainer.updateAll(deltaTime);
        this._performanceMonitor.endMonitoring('Services.update', servicesStartTime, this._serviceContainer.getUpdatableCount());

        this._poolManager.update();
        this._sceneManager.update();
        this._worldManager.updateAll();

        this._performanceMonitor.endMonitoring('Core.update', frameStartTime);
    }

    /**
     * @zh 销毁Core实例
     * @en Destroy Core instance
     *
     * @zh 清理所有资源，通常在应用程序关闭时调用。
     * @en Clean up all resources, typically called when the application closes.
     */
    public static destroy(): void {
        if (!this._instance) return;

        this._instance._debugManager?.stop();
        this._instance._serviceContainer.clear();
        Core._logger.info('Core destroyed');
        this._instance = null;
    }
}
