/**
 * @zh 插件加载器
 * @en Plugin Loader
 *
 * @zh 提供统一的插件加载机制，支持：
 * - 动态 ESM 导入
 * - 依赖拓扑排序
 * - 加载状态追踪
 * - 错误隔离
 *
 * @en Provides unified plugin loading with:
 * - Dynamic ESM imports
 * - Dependency topological sorting
 * - Load state tracking
 * - Error isolation
 */

import { createLogger } from '@esengine/ecs-framework';
import type { IRuntimePlugin, ModuleManifest } from './PluginManager';
import { runtimePluginManager } from './PluginManager';
import {
    topologicalSort,
    validateDependencies as validateDeps,
    resolveDependencyId,
    type IDependable
} from './utils/DependencyUtils';

const logger = createLogger('PluginLoader');

// ============================================================================
// 类型定义 | Types
// ============================================================================

/**
 * @zh 插件加载状态
 * @en Plugin load state
 */
export type PluginLoadState =
    | 'pending'   // 等待加载
    | 'loading'   // 加载中
    | 'loaded'    // 已加载
    | 'failed'    // 加载失败
    | 'missing';  // 依赖缺失

/**
 * @zh 插件源类型
 * @en Plugin source type
 */
export type PluginSourceType = 'npm' | 'local' | 'static';

/**
 * @zh 插件包信息
 * @en Plugin package info
 */
export interface PluginPackageInfo {
    plugin: boolean;
    pluginExport: string;
    category?: string;
    isEnginePlugin?: boolean;
    dependencies?: string[];
}

/**
 * @zh 插件配置
 * @en Plugin configuration
 */
export interface PluginConfig {
    enabled: boolean;
    options?: Record<string, unknown>;
}

/**
 * @zh 项目插件配置
 * @en Project plugin configuration
 */
export interface ProjectPluginConfig {
    plugins: Record<string, PluginConfig>;
}

/**
 * @zh 插件加载配置
 * @en Plugin load configuration
 */
export interface PluginLoadConfig {
    packageId: string;
    enabled: boolean;
    sourceType: PluginSourceType;
    exportName?: string;
    dependencies?: string[];
    options?: Record<string, unknown>;
    localPath?: string;
}

/**
 * @zh 插件加载信息
 * @en Plugin load info
 */
export interface PluginLoadInfo {
    packageId: string;
    state: PluginLoadState;
    plugin?: IRuntimePlugin;
    error?: string;
    missingDeps?: string[];
    loadTime?: number;
}

/**
 * @zh 加载器配置
 * @en Loader configuration
 */
export interface PluginLoaderConfig {
    plugins: PluginLoadConfig[];
    timeout?: number;
    continueOnFailure?: boolean;
    localLoader?: (path: string) => Promise<string>;
    localExecutor?: (code: string, id: string) => Promise<IRuntimePlugin | null>;
}

// ============================================================================
// 插件加载器 | Plugin Loader
// ============================================================================

/**
 * @zh 插件加载器
 * @en Plugin Loader
 *
 * @example
 * ```typescript
 * const loader = new PluginLoader({
 *     plugins: [
 *         { packageId: '@esengine/sprite', enabled: true, sourceType: 'npm' }
 *     ]
 * });
 * await loader.loadAll();
 * ```
 */
export class PluginLoader {
    private _config: Required<PluginLoaderConfig>;
    private _loaded = new Map<string, PluginLoadInfo>();
    private _loading = false;

    constructor(config: PluginLoaderConfig) {
        this._config = {
            plugins: config.plugins,
            timeout: config.timeout ?? 30000,
            continueOnFailure: config.continueOnFailure ?? true,
            localLoader: config.localLoader ?? (async () => ''),
            localExecutor: config.localExecutor ?? (async () => null)
        };
    }

    /**
     * @zh 加载所有启用的插件
     * @en Load all enabled plugins
     */
    async loadAll(): Promise<Map<string, PluginLoadInfo>> {
        if (this._loading) {
            throw new Error('Loading already in progress');
        }

        this._loading = true;
        const start = Date.now();

        try {
            const enabled = this._config.plugins.filter(p => p.enabled);

            // 验证依赖
            const missing = this._validateDependencies(enabled);
            for (const [id, deps] of missing) {
                this._loaded.set(id, {
                    packageId: id,
                    state: 'missing',
                    missingDeps: deps,
                    error: `Missing: ${deps.join(', ')}`
                });
            }

            // 过滤有效插件并排序
            const valid = enabled.filter(p => !missing.has(p.packageId));
            const sorted = this._sortByDependencies(valid);

            // 串行加载
            for (const plugin of sorted) {
                await this._loadOne(plugin);
            }

            const time = Date.now() - start;
            const loadedCount = this.getLoaded().length;
            logger.info(`Loaded ${loadedCount}/${enabled.length} plugins in ${time}ms`);

            return this._loaded;
        } finally {
            this._loading = false;
        }
    }

    /**
     * @zh 获取已加载插件
     * @en Get loaded plugins
     */
    getLoaded(): PluginLoadInfo[] {
        return [...this._loaded.values()].filter(p => p.state === 'loaded');
    }

    /**
     * @zh 获取失败的插件
     * @en Get failed plugins
     */
    getFailed(): PluginLoadInfo[] {
        return [...this._loaded.values()].filter(
            p => p.state === 'failed' || p.state === 'missing'
        );
    }

    /**
     * @zh 获取插件信息
     * @en Get plugin info
     */
    get(packageId: string): PluginLoadInfo | undefined {
        return this._loaded.get(packageId);
    }

    /**
     * @zh 重置
     * @en Reset
     */
    reset(): void {
        this._loaded.clear();
    }

    // ========== 私有方法 ==========

    private async _loadOne(config: PluginLoadConfig): Promise<void> {
        const info: PluginLoadInfo = {
            packageId: config.packageId,
            state: 'loading'
        };
        this._loaded.set(config.packageId, info);
        const start = Date.now();

        try {
            let plugin: IRuntimePlugin | null = null;

            switch (config.sourceType) {
                case 'npm':
                    plugin = await this._loadNpm(config);
                    break;
                case 'local':
                    plugin = await this._loadLocal(config);
                    break;
                case 'static':
                    logger.warn(`Static plugin ${config.packageId} should be pre-registered`);
                    break;
            }

            if (plugin) {
                info.plugin = plugin;
                info.state = 'loaded';
                info.loadTime = Date.now() - start;
                runtimePluginManager.register(plugin);
                logger.debug(`Loaded: ${config.packageId} (${info.loadTime}ms)`);
            } else {
                throw new Error('Plugin export not found');
            }
        } catch (error) {
            info.state = 'failed';
            info.error = error instanceof Error ? error.message : String(error);
            info.loadTime = Date.now() - start;
            logger.error(`Failed: ${config.packageId} - ${info.error}`);

            if (!this._config.continueOnFailure) {
                throw error;
            }
        }
    }

    private async _loadNpm(config: PluginLoadConfig): Promise<IRuntimePlugin | null> {
        const module = await import(/* @vite-ignore */ config.packageId);
        const exportName = config.exportName || 'default';
        const plugin = module[exportName] as IRuntimePlugin;
        return plugin?.manifest ? plugin : null;
    }

    private async _loadLocal(config: PluginLoadConfig): Promise<IRuntimePlugin | null> {
        if (!config.localPath) {
            throw new Error('Local path not specified');
        }
        const code = await this._config.localLoader(config.localPath);
        return this._config.localExecutor(code, config.packageId);
    }

    private _sortByDependencies(plugins: PluginLoadConfig[]): PluginLoadConfig[] {
        const items: IDependable[] = plugins.map(p => ({
            id: p.packageId,
            dependencies: p.dependencies
        }));
        const map = new Map(plugins.map(p => [p.packageId, p]));

        const result = topologicalSort(items, { resolveId: resolveDependencyId });
        if (result.hasCycles) {
            throw new Error(`Circular dependency: ${result.cycleIds?.join(', ')}`);
        }

        return result.sorted.map(item => map.get(item.id)!);
    }

    private _validateDependencies(plugins: PluginLoadConfig[]): Map<string, string[]> {
        const enabledIds = new Set(plugins.map(p => p.packageId));
        const missing = new Map<string, string[]>();

        for (const plugin of plugins) {
            const deps = plugin.dependencies || [];
            const missingDeps = deps
                .map(d => resolveDependencyId(d))
                .filter(d => !enabledIds.has(d));

            if (missingDeps.length > 0) {
                missing.set(plugin.packageId, missingDeps);
            }
        }

        return missing;
    }
}

// ============================================================================
// 便捷函数 | Convenience Functions
// ============================================================================

/** @zh 已加载插件缓存 @en Loaded plugins cache */
const loadedCache = new Map<string, IRuntimePlugin>();

/**
 * @zh 加载单个插件
 * @en Load single plugin
 */
export async function loadPlugin(
    packageId: string,
    info: PluginPackageInfo
): Promise<IRuntimePlugin | null> {
    if (loadedCache.has(packageId)) {
        return loadedCache.get(packageId)!;
    }

    try {
        const module = await import(/* @vite-ignore */ packageId);
        const plugin = module[info.pluginExport || 'default'] as IRuntimePlugin;

        if (!plugin?.manifest) {
            logger.warn(`Invalid plugin: ${packageId}`);
            return null;
        }

        loadedCache.set(packageId, plugin);
        return plugin;
    } catch (error) {
        logger.error(`Failed to load ${packageId}:`, error);
        return null;
    }
}

/**
 * @zh 加载启用的插件（简化 API）
 * @en Load enabled plugins (simplified API)
 */
export async function loadEnabledPlugins(
    config: ProjectPluginConfig,
    packageInfoMap: Record<string, PluginPackageInfo>
): Promise<void> {
    const plugins: PluginLoadConfig[] = [];

    for (const [id, cfg] of Object.entries(config.plugins)) {
        if (!cfg.enabled) continue;
        const info = packageInfoMap[id];
        if (!info) {
            logger.warn(`No package info for ${id}`);
            continue;
        }

        plugins.push({
            packageId: id,
            enabled: true,
            sourceType: 'npm',
            exportName: info.pluginExport,
            dependencies: info.dependencies
        });
    }

    const loader = new PluginLoader({ plugins });
    await loader.loadAll();
}

/**
 * @zh 注册静态插件
 * @en Register static plugin
 */
export function registerStaticPlugin(plugin: IRuntimePlugin): void {
    runtimePluginManager.register(plugin);
}

/**
 * @zh 获取已加载插件
 * @en Get loaded plugins
 */
export function getLoadedPlugins(): IRuntimePlugin[] {
    return [...loadedCache.values()];
}

/**
 * @zh 重置加载器
 * @en Reset loader
 */
export function resetPluginLoader(): void {
    loadedCache.clear();
}
