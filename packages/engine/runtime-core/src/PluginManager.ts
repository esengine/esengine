/**
 * @zh 运行时插件管理器
 * @en Runtime Plugin Manager
 *
 * @zh 提供插件生命周期管理的核心实现。
 * @en Provides core implementation for plugin lifecycle management.
 *
 * @zh 设计原则 | Design principles:
 * @en
 * 1. 最小依赖 - 只依赖 ecs-framework 和 engine-core
 * 2. 状态跟踪 - 详细的插件状态用于调试和 UI
 * 3. 依赖验证 - 确保加载顺序正确
 * 4. 错误隔离 - 单个插件失败不影响其他
 */

import { GlobalComponentRegistry, ServiceContainer, createLogger } from '@esengine/ecs-framework';
import type { IScene } from '@esengine/ecs-framework';
import type { IRuntimePlugin, IRuntimeModule, SystemContext, ModuleManifest } from '@esengine/engine-core';
import {
    topologicalSort,
    resolveDependencyId,
    getReverseDependencies,
    type IDependable
} from './utils/DependencyUtils';
import type { PluginState } from './PluginState';

export type { IRuntimePlugin, IRuntimeModule, SystemContext, ModuleManifest };

const logger = createLogger('PluginManager');

// ============================================================================
// 类型定义 | Type Definitions
// ============================================================================

// PluginState 从 ./PluginState 重新导出
// PluginState is re-exported from ./PluginState

/**
 * @zh 已注册的插件信息
 * @en Registered plugin info
 */
export interface RegisteredPluginInfo {
    /**
     * @zh 插件实例
     * @en Plugin instance
     */
    plugin: IRuntimePlugin;

    /**
     * @zh 插件状态
     * @en Plugin state
     */
    state: PluginState;

    /**
     * @zh 是否启用
     * @en Whether enabled
     */
    enabled: boolean;

    /**
     * @zh 错误信息
     * @en Error message
     */
    error?: Error;

    /**
     * @zh 注册时间
     * @en Registration time
     */
    registeredAt: number;

    /**
     * @zh 激活时间
     * @en Activation time
     */
    activatedAt?: number;

    /**
     * @zh 创建的系统实例（用于清理）
     * @en Created system instances (for cleanup)
     */
    systemInstances?: any[];
}

/**
 * @zh 插件配置
 * @en Plugin configuration
 */
export interface RuntimePluginConfig {
    /**
     * @zh 启用的插件 ID 列表
     * @en Enabled plugin ID list
     */
    enabledPlugins: string[];
}

// ============================================================================
// RuntimePluginManager
// ============================================================================

/**
 * @zh 运行时插件管理器
 * @en Runtime Plugin Manager
 *
 * @zh 管理运行时插件的注册、初始化和生命周期。
 * @en Manages registration, initialization, and lifecycle of runtime plugins.
 */
export class RuntimePluginManager {
    private _plugins = new Map<string, RegisteredPluginInfo>();
    private _initialized = false;
    private _currentScene: IScene | null = null;
    private _currentContext: SystemContext | null = null;

    // ============================================================================
    // 注册 | Registration
    // ============================================================================

    /**
     * @zh 注册插件
     * @en Register plugin
     *
     * @param plugin - @zh 插件实例 @en Plugin instance
     */
    register(plugin: IRuntimePlugin): void {
        if (!plugin?.manifest?.id) {
            logger.error('Cannot register plugin: invalid manifest');
            return;
        }

        const id = plugin.manifest.id;

        if (this._plugins.has(id)) {
            logger.warn(`Plugin ${id} is already registered, skipping`);
            return;
        }

        const enabled = plugin.manifest.isCore === true ||
                       plugin.manifest.isEngineModule === true ||
                       plugin.manifest.defaultEnabled !== false;

        this._plugins.set(id, {
            plugin,
            state: 'loading', // 已加载但未初始化
            enabled,
            registeredAt: Date.now()
        });

        logger.debug(`Plugin registered: ${id}`, {
            enabled,
            isCore: plugin.manifest.isCore,
            isEngineModule: plugin.manifest.isEngineModule
        });
    }

    /**
     * @zh 批量注册插件
     * @en Register multiple plugins
     *
     * @param plugins - @zh 插件列表 @en Plugin list
     */
    registerMany(plugins: IRuntimePlugin[]): void {
        for (const plugin of plugins) {
            this.register(plugin);
        }
    }

    // ============================================================================
    // 启用/禁用 | Enable/Disable
    // ============================================================================

    /**
     * @zh 启用插件
     * @en Enable plugin
     *
     * @param pluginId - @zh 插件 ID @en Plugin ID
     * @returns @zh 是否成功 @en Whether successful
     */
    enable(pluginId: string): boolean {
        const info = this._plugins.get(pluginId);
        if (!info) {
            logger.error(`Plugin ${pluginId} not found`);
            return false;
        }

        if (info.plugin.manifest.isCore) {
            logger.warn(`Core plugin ${pluginId} is always enabled`);
            return true;
        }

        // 检查依赖 | Check dependencies
        const deps = info.plugin.manifest.dependencies || [];
        for (const dep of deps) {
            const depId = resolveDependencyId(dep);
            const depInfo = this._plugins.get(depId);
            if (!depInfo?.enabled) {
                logger.error(`Cannot enable ${pluginId}: dependency ${dep} is not enabled`);
                return false;
            }
        }

        info.enabled = true;
        logger.info(`Plugin enabled: ${pluginId}`);
        return true;
    }

    /**
     * @zh 禁用插件
     * @en Disable plugin
     *
     * @param pluginId - @zh 插件 ID @en Plugin ID
     * @returns @zh 是否成功 @en Whether successful
     */
    disable(pluginId: string): boolean {
        const info = this._plugins.get(pluginId);
        if (!info) {
            logger.error(`Plugin ${pluginId} not found`);
            return false;
        }

        if (info.plugin.manifest.isCore) {
            logger.warn(`Core plugin ${pluginId} cannot be disabled`);
            return false;
        }

        // 检查是否有其他插件依赖此插件（使用统一工具）
        // Check if other plugins depend on this (using unified util)
        const reverseDeps = this._getReverseDependencies(pluginId);
        const enabledReverseDeps = Array.from(reverseDeps).filter(
            id => this._plugins.get(id)?.enabled
        );
        if (enabledReverseDeps.length > 0) {
            logger.error(`Cannot disable ${pluginId}: plugins ${enabledReverseDeps.join(', ')} depend on it`);
            return false;
        }

        // 清理系统实例 | Cleanup system instances
        if (info.systemInstances && this._currentScene) {
            for (const system of info.systemInstances) {
                try {
                    this._currentScene.removeSystem(system);
                } catch (e) {
                    logger.warn(`Failed to remove system from ${pluginId}:`, e);
                }
            }
            info.systemInstances = [];
        }

        info.enabled = false;
        info.state = 'disabled';
        logger.info(`Plugin disabled: ${pluginId}`);
        return true;
    }

    /**
     * @zh 检查插件是否启用
     * @en Check if plugin is enabled
     */
    isEnabled(pluginId: string): boolean {
        return this._plugins.get(pluginId)?.enabled ?? false;
    }

    /**
     * @zh 加载配置
     * @en Load configuration
     *
     * @param config - @zh 插件配置 @en Plugin configuration
     */
    loadConfig(config: RuntimePluginConfig): void {
        const { enabledPlugins } = config;

        for (const [id, info] of this._plugins) {
            if (info.plugin.manifest.isCore || info.plugin.manifest.isEngineModule) {
                info.enabled = true;
                continue;
            }

            const shouldEnable = enabledPlugins.includes(id) ||
                                info.plugin.manifest.defaultEnabled === true;
            info.enabled = shouldEnable;
        }

        logger.info('Plugin configuration loaded', {
            enabled: Array.from(this._plugins.values()).filter(p => p.enabled).length,
            total: this._plugins.size
        });
    }

    // ============================================================================
    // 初始化 | Initialization
    // ============================================================================

    /**
     * @zh 初始化所有启用的插件
     * @en Initialize all enabled plugins
     *
     * @param services - @zh 服务容器 @en Service container
     */
    async initializeRuntime(services: ServiceContainer): Promise<void> {
        if (this._initialized) {
            logger.warn('Runtime already initialized');
            return;
        }

        const startTime = Date.now();
        const sortedPlugins = this._topologicalSort();

        // Phase 1: 注册组件 | Register components
        for (const pluginId of sortedPlugins) {
            const info = this._plugins.get(pluginId);
            if (!info?.enabled) continue;

            const mod = info.plugin.runtimeModule;
            if (mod?.registerComponents) {
                try {
                    info.state = 'initializing';
                    mod.registerComponents(GlobalComponentRegistry);
                    logger.debug(`Components registered for: ${pluginId}`);
                } catch (e) {
                    logger.error(`Failed to register components for ${pluginId}:`, e);
                    info.state = 'error';
                    info.error = e as Error;
                }
            }
        }

        // Phase 2: 注册服务 | Register services
        for (const pluginId of sortedPlugins) {
            const info = this._plugins.get(pluginId);
            if (!info?.enabled || info.state === 'error') continue;

            const mod = info.plugin.runtimeModule;
            if (mod?.registerServices) {
                try {
                    mod.registerServices(services);
                    logger.debug(`Services registered for: ${pluginId}`);
                } catch (e) {
                    logger.error(`Failed to register services for ${pluginId}:`, e);
                    info.state = 'error';
                    info.error = e as Error;
                }
            }
        }

        // Phase 3: 初始化回调 | Initialize callbacks
        for (const pluginId of sortedPlugins) {
            const info = this._plugins.get(pluginId);
            if (!info?.enabled || info.state === 'error') continue;

            const mod = info.plugin.runtimeModule;
            if (mod?.onInitialize) {
                try {
                    await mod.onInitialize();
                    info.state = 'active';
                    info.activatedAt = Date.now();
                    logger.debug(`Initialized: ${pluginId}`);
                } catch (e) {
                    logger.error(`Failed to initialize ${pluginId}:`, e);
                    info.state = 'error';
                    info.error = e as Error;
                }
            } else {
                info.state = 'active';
                info.activatedAt = Date.now();
            }
        }

        this._initialized = true;

        const duration = Date.now() - startTime;
        const activeCount = Array.from(this._plugins.values())
            .filter(p => p.state === 'active').length;

        logger.info(`Runtime initialized | 运行时初始化完成`, {
            active: activeCount,
            total: this._plugins.size,
            duration: `${duration}ms`
        });
    }

    /**
     * @zh 为场景创建系统
     * @en Create systems for scene
     *
     * @param scene - @zh 场景 @en Scene
     * @param context - @zh 系统上下文 @en System context
     */
    createSystemsForScene(scene: IScene, context: SystemContext): void {
        this._currentScene = scene;
        this._currentContext = context;

        const sortedPlugins = this._topologicalSort();

        // Phase 1: 创建系统 | Create systems
        for (const pluginId of sortedPlugins) {
            const info = this._plugins.get(pluginId);
            if (!info?.enabled || info.state === 'error') continue;

            const mod = info.plugin.runtimeModule;
            if (mod?.createSystems) {
                try {
                    const systemsBefore = scene.systems.length;
                    mod.createSystems(scene, context);

                    // 跟踪创建的系统 | Track created systems
                    const systemsAfter = scene.systems;
                    info.systemInstances = [];
                    for (let i = systemsBefore; i < systemsAfter.length; i++) {
                        info.systemInstances.push(systemsAfter[i]);
                    }

                    logger.debug(`Systems created for: ${pluginId}`, {
                        count: info.systemInstances.length
                    });
                } catch (e) {
                    logger.error(`Failed to create systems for ${pluginId}:`, e);
                    info.state = 'error';
                    info.error = e as Error;
                }
            }
        }

        // Phase 2: 系统创建后回调 | Post-creation callbacks
        for (const pluginId of sortedPlugins) {
            const info = this._plugins.get(pluginId);
            if (!info?.enabled || info.state === 'error') continue;

            const mod = info.plugin.runtimeModule;
            if (mod?.onSystemsCreated) {
                try {
                    mod.onSystemsCreated(scene, context);
                    logger.debug(`Systems wired for: ${pluginId}`);
                } catch (e) {
                    logger.error(`Failed to wire systems for ${pluginId}:`, e);
                }
            }
        }

        logger.info('Systems created for scene | 场景系统创建完成');
    }

    // ============================================================================
    // 查询 | Query
    // ============================================================================

    /**
     * @zh 获取插件
     * @en Get plugin
     */
    getPlugin(id: string): IRuntimePlugin | undefined {
        return this._plugins.get(id)?.plugin;
    }

    /**
     * @zh 获取插件信息
     * @en Get plugin info
     */
    getPluginInfo(id: string): RegisteredPluginInfo | undefined {
        return this._plugins.get(id);
    }

    /**
     * @zh 获取所有插件
     * @en Get all plugins
     */
    getPlugins(): IRuntimePlugin[] {
        return Array.from(this._plugins.values()).map(p => p.plugin);
    }

    /**
     * @zh 获取所有启用的插件
     * @en Get all enabled plugins
     */
    getEnabledPlugins(): IRuntimePlugin[] {
        return Array.from(this._plugins.values())
            .filter(p => p.enabled)
            .map(p => p.plugin);
    }

    /**
     * @zh 获取插件状态
     * @en Get plugin state
     */
    getState(pluginId: string): PluginState | undefined {
        return this._plugins.get(pluginId)?.state;
    }

    /**
     * @zh 获取失败的插件
     * @en Get failed plugins
     */
    getFailedPlugins(): Array<{ id: string; error: Error }> {
        const failed: Array<{ id: string; error: Error }> = [];
        for (const [id, info] of this._plugins) {
            if (info.state === 'error' && info.error) {
                failed.push({ id, error: info.error });
            }
        }
        return failed;
    }

    /**
     * @zh 是否已初始化
     * @en Whether initialized
     */
    get initialized(): boolean {
        return this._initialized;
    }

    // ============================================================================
    // 生命周期 | Lifecycle
    // ============================================================================

    /**
     * @zh 清理场景系统
     * @en Clear scene systems
     */
    clearSceneSystems(): void {
        for (const [pluginId, info] of this._plugins) {
            if (!info.enabled) continue;

            const mod = info.plugin.runtimeModule;
            if (mod?.onDestroy) {
                try {
                    mod.onDestroy();
                } catch (e) {
                    logger.error(`Error in ${pluginId}.onDestroy:`, e);
                }
            }

            info.systemInstances = [];
        }

        this._currentScene = null;
        this._currentContext = null;
        logger.debug('Scene systems cleared');
    }

    /**
     * @zh 重置管理器
     * @en Reset manager
     */
    reset(): void {
        this.clearSceneSystems();
        this._plugins.clear();
        this._initialized = false;
        logger.info('PluginManager reset');
    }

    // ============================================================================
    // 私有方法 | Private Methods
    // ============================================================================

    /**
     * @zh 拓扑排序（使用统一的 DependencyUtils）
     * @en Topological sort (using unified DependencyUtils)
     */
    private _topologicalSort(): string[] {
        // 转换为 IDependable 格式
        const items: IDependable[] = Array.from(this._plugins.entries()).map(
            ([id, info]) => ({
                id,
                dependencies: info.plugin.manifest.dependencies
            })
        );

        const result = topologicalSort(items, {
            algorithm: 'dfs',
            resolveId: resolveDependencyId
        });

        if (result.hasCycles) {
            logger.warn(`Circular dependencies detected: ${result.cycleIds?.join(', ')}`);
        }

        return result.sorted.map(item => item.id);
    }

    /**
     * @zh 获取反向依赖（使用统一的 DependencyUtils）
     * @en Get reverse dependencies (using unified DependencyUtils)
     */
    private _getReverseDependencies(pluginId: string): Set<string> {
        const items: IDependable[] = Array.from(this._plugins.entries()).map(
            ([id, info]) => ({
                id,
                dependencies: info.plugin.manifest.dependencies
            })
        );

        return getReverseDependencies(pluginId, items, {
            resolveId: resolveDependencyId
        });
    }
}

/**
 * @zh 全局运行时插件管理器实例
 * @en Global runtime plugin manager instance
 */
export const runtimePluginManager = new RuntimePluginManager();
