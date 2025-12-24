import type { PluginPackageInfo, PluginConfig, PluginLoadConfig } from './PluginLoader';

export interface ProjectConfig {
    name: string;
    version: string;
    plugins: Record<string, PluginConfig>;
}

/**
 * @zh 扩展的插件包信息（包含依赖）
 * @en Extended plugin package info (with dependencies)
 */
export interface ExtendedPluginPackageInfo extends PluginPackageInfo {
    /**
     * @zh 依赖的包 ID 列表
     * @en List of dependency package IDs
     */
    dependencies?: string[];
}

/**
 * @zh 内置引擎插件的包信息（包含依赖关系）
 * @en Built-in engine plugin package info (with dependencies)
 *
 * @zh 依赖顺序很重要，确保插件按正确顺序加载
 * @en Dependency order matters, ensures plugins load in correct order
 */
export const BUILTIN_PLUGIN_PACKAGES: Record<string, ExtendedPluginPackageInfo> = {
    '@esengine/engine-core': {
        plugin: true,
        pluginExport: 'EnginePlugin',
        category: 'core',
        isEnginePlugin: true,
        dependencies: []
    },
    '@esengine/camera': {
        plugin: true,
        pluginExport: 'CameraPlugin',
        category: 'core',
        isEnginePlugin: true,
        dependencies: ['@esengine/engine-core']
    },
    '@esengine/sprite': {
        plugin: true,
        pluginExport: 'SpritePlugin',
        category: 'rendering',
        isEnginePlugin: true,
        dependencies: ['@esengine/engine-core']
    },
    '@esengine/audio': {
        plugin: true,
        pluginExport: 'AudioPlugin',
        category: 'audio',
        isEnginePlugin: true,
        dependencies: ['@esengine/engine-core']
    },
    '@esengine/ui': {
        plugin: true,
        pluginExport: 'UIPlugin',
        category: 'ui',
        dependencies: ['@esengine/engine-core', '@esengine/sprite']
    },
    '@esengine/fairygui': {
        plugin: true,
        pluginExport: 'FGUIPlugin',
        category: 'ui',
        dependencies: ['@esengine/engine-core', '@esengine/sprite']
    },
    '@esengine/tilemap': {
        plugin: true,
        pluginExport: 'TilemapPlugin',
        category: 'tilemap',
        dependencies: ['@esengine/engine-core', '@esengine/sprite']
    },
    '@esengine/behavior-tree': {
        plugin: true,
        pluginExport: 'BehaviorTreePlugin',
        category: 'ai',
        dependencies: ['@esengine/engine-core']
    },
    '@esengine/physics-rapier2d': {
        plugin: true,
        pluginExport: 'PhysicsPlugin',
        category: 'physics',
        dependencies: ['@esengine/engine-core']
    },
    '@esengine/particle': {
        plugin: true,
        pluginExport: 'ParticlePlugin',
        category: 'rendering',
        dependencies: ['@esengine/engine-core', '@esengine/sprite']
    }
};

/**
 * @zh 将项目配置转换为 UnifiedPluginLoader 配置
 * @en Convert project config to UnifiedPluginLoader config
 *
 * @param config - @zh 项目配置 @en Project config
 * @param packageInfoMap - @zh 包信息映射 @en Package info map
 * @returns @zh 插件加载配置列表 @en Plugin load config list
 */
export function convertToPluginLoadConfigs(
    config: ProjectConfig,
    packageInfoMap: Record<string, ExtendedPluginPackageInfo> = BUILTIN_PLUGIN_PACKAGES
): PluginLoadConfig[] {
    const result: PluginLoadConfig[] = [];

    for (const [packageId, pluginConfig] of Object.entries(config.plugins)) {
        const packageInfo = packageInfoMap[packageId];
        if (!packageInfo) {
            console.warn(`[ProjectConfig] No package info for ${packageId}, skipping`);
            continue;
        }

        result.push({
            packageId,
            enabled: pluginConfig.enabled,
            sourceType: 'npm',
            exportName: packageInfo.pluginExport,
            dependencies: packageInfo.dependencies,
            options: pluginConfig.options
        });
    }

    return result;
}

/**
 * @zh 创建默认项目配置
 * @en Create default project config
 */
export function createDefaultProjectConfig(): ProjectConfig {
    return {
        name: 'New Project',
        version: '1.0.0',
        plugins: {
            '@esengine/engine-core': { enabled: true },
            '@esengine/camera': { enabled: true },
            '@esengine/sprite': { enabled: true },
            '@esengine/audio': { enabled: true },
            '@esengine/ui': { enabled: true },
            '@esengine/particle': { enabled: false },
            '@esengine/fairygui': { enabled: false },
            '@esengine/tilemap': { enabled: false },
            '@esengine/behavior-tree': { enabled: false },
            '@esengine/physics-rapier2d': { enabled: false }
        }
    };
}

/**
 * 合并用户配置与默认配置
 */
export function mergeProjectConfig(
    userConfig: Partial<ProjectConfig>
): ProjectConfig {
    const defaultConfig = createDefaultProjectConfig();

    return {
        name: userConfig.name || defaultConfig.name,
        version: userConfig.version || defaultConfig.version,
        plugins: {
            ...defaultConfig.plugins,
            ...userConfig.plugins
        }
    };
}

/**
 * 从编辑器的 enabledPlugins 列表创建项目配置
 * Create project config from editor's enabledPlugins list
 *
 * @param enabledPlugins - 启用的插件 ID 列表 / List of enabled plugin IDs
 */
export function createProjectConfigFromEnabledList(
    enabledPlugins: string[]
): ProjectConfig {
    const defaultConfig = createDefaultProjectConfig();

    // 先禁用所有非核心插件
    // First disable all non-core plugins
    const plugins: Record<string, PluginConfig> = {};

    for (const id of Object.keys(defaultConfig.plugins)) {
        const packageInfo = BUILTIN_PLUGIN_PACKAGES[id];
        // 核心插件始终启用
        // Core plugins are always enabled
        if (packageInfo?.isEnginePlugin) {
            plugins[id] = { enabled: true };
        } else {
            plugins[id] = { enabled: enabledPlugins.includes(id) };
        }
    }

    return {
        ...defaultConfig,
        plugins
    };
}
