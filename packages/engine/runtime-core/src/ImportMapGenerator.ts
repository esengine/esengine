/**
 * @zh ImportMap 生成器
 * @en ImportMap Generator
 *
 * @zh 提供统一的 ImportMap 生成逻辑，供编辑器预览和构建共用
 * @en Provides unified ImportMap generation logic for editor preview and build
 */

import type { ModuleManifest } from './PluginManager';
import {
    extractShortId,
    getPackageName as getPackageNameFromId,
    topologicalSort,
    type IDependable
} from './utils/DependencyUtils';

/**
 * @zh ImportMap 生成模式
 * @en ImportMap generation mode
 */
export type ImportMapMode =
    | 'development'  // 开发模式：每个模块单独文件
    | 'production'   // 生产模式：核心模块打包，插件分离
    | 'single-bundle'; // 单文件模式：所有模块打包到一个文件

/**
 * @zh ImportMap 生成配置
 * @en ImportMap generation configuration
 */
export interface ImportMapConfig {
    /**
     * @zh 生成模式
     * @en Generation mode
     */
    mode: ImportMapMode;

    /**
     * @zh 基础路径（用于构造相对 URL）
     * @en Base path (for constructing relative URLs)
     */
    basePath?: string;

    /**
     * @zh 核心模块列表
     * @en List of core modules
     */
    coreModules: ModuleManifest[];

    /**
     * @zh 插件模块列表
     * @en List of plugin modules
     */
    pluginModules?: ModuleManifest[];

    /**
     * @zh 自定义路径生成器（可选）
     * @en Custom path generator (optional)
     */
    pathGenerator?: (module: ModuleManifest, isCore: boolean) => string;
}

/**
 * @zh ImportMap 条目
 * @en ImportMap entry
 */
export interface ImportMapEntry {
    /**
     * @zh 包名（如 @esengine/ecs-framework）
     * @en Package name (e.g., @esengine/ecs-framework)
     */
    packageName: string;

    /**
     * @zh 模块路径（相对 URL）
     * @en Module path (relative URL)
     */
    path: string;

    /**
     * @zh 模块 ID（如 core）
     * @en Module ID (e.g., core)
     */
    moduleId: string;

    /**
     * @zh 是否为核心模块
     * @en Whether it's a core module
     */
    isCore: boolean;
}

/**
 * @zh 生成 ImportMap
 * @en Generate ImportMap
 */
export function generateImportMap(config: ImportMapConfig): Record<string, string> {
    const imports: Record<string, string> = {};
    const basePath = config.basePath || '.';

    // 根据模式选择路径生成策略
    const getModulePath = config.pathGenerator || ((module: ModuleManifest, isCore: boolean) => {
        switch (config.mode) {
            case 'development':
                // 开发模式：每个模块单独文件
                return `${basePath}/libs/${module.id}/${module.id}.js`;

            case 'production':
                // 生产模式：核心模块打包，插件分离
                if (isCore) {
                    return `${basePath}/libs/esengine.core.js`;
                }
                return `${basePath}/libs/plugins/${module.id}.js`;

            case 'single-bundle':
                // 单文件模式：所有模块打包
                return `${basePath}/libs/esengine.bundle.js`;
        }
    });

    // 处理核心模块
    for (const module of config.coreModules) {
        if (module.name) {
            imports[module.name] = getModulePath(module, true);
        }
    }

    // 处理插件模块
    if (config.pluginModules) {
        for (const module of config.pluginModules) {
            if (module.name) {
                imports[module.name] = getModulePath(module, false);
            }

            // 处理外部依赖
            if (module.externalDependencies) {
                for (const dep of module.externalDependencies) {
                    if (!imports[dep]) {
                        const depId = extractModuleId(dep);
                        imports[dep] = `${basePath}/libs/${config.mode === 'development' ? `${depId}/${depId}` : `plugins/${depId}`}.js`;
                    }
                }
            }
        }
    }

    return imports;
}

/**
 * @zh 生成 ImportMap 条目列表
 * @en Generate ImportMap entry list
 */
export function generateImportMapEntries(config: ImportMapConfig): ImportMapEntry[] {
    const entries: ImportMapEntry[] = [];
    const importMap = generateImportMap(config);

    for (const [packageName, path] of Object.entries(importMap)) {
        const moduleId = extractModuleId(packageName);
        const isCore = config.coreModules.some(m => m.name === packageName);

        entries.push({
            packageName,
            path,
            moduleId,
            isCore
        });
    }

    return entries;
}

/**
 * @zh 生成 ImportMap HTML 脚本标签
 * @en Generate ImportMap HTML script tag
 *
 * @param imports - @zh ImportMap 对象 @en ImportMap object
 * @param indent - @zh 缩进空格数 @en Number of indent spaces
 */
export function generateImportMapScript(imports: Record<string, string>, indent = 4): string {
    const indentStr = ' '.repeat(indent);
    const json = JSON.stringify({ imports }, null, 2)
        .split('\n')
        .map((line, i) => i === 0 ? line : indentStr + line)
        .join('\n');

    return `<script type="importmap">
${indentStr}${json}
${indentStr}</script>`;
}

/**
 * @zh 从包名提取模块 ID
 * @en Extract module ID from package name
 *
 * @zh 重新导出自 DependencyUtils（保持向后兼容）
 * @en Re-exported from DependencyUtils (for backward compatibility)
 *
 * @example
 * extractModuleId('@esengine/ecs-framework') // 'core'
 * extractModuleId('@esengine/sprite') // 'sprite'
 */
export const extractModuleId = extractShortId;

/**
 * @zh 从模块 ID 获取包名
 * @en Get package name from module ID
 *
 * @zh 重新导出自 DependencyUtils（保持向后兼容）
 * @en Re-exported from DependencyUtils (for backward compatibility)
 *
 * @example
 * getPackageName('core') // '@esengine/ecs-framework'
 * getPackageName('sprite') // '@esengine/sprite'
 */
export const getPackageName = getPackageNameFromId;

/**
 * @zh 收集模块的外部依赖
 * @en Collect external dependencies of modules
 */
export function collectExternalDependencies(modules: ModuleManifest[]): Set<string> {
    const deps = new Set<string>();

    for (const module of modules) {
        if (module.externalDependencies) {
            for (const dep of module.externalDependencies) {
                deps.add(dep);
            }
        }
    }

    return deps;
}

/**
 * @zh 按依赖排序模块（拓扑排序）
 * @en Sort modules by dependencies (topological sort)
 *
 * @zh 使用统一的 DependencyUtils.topologicalSort
 * @en Uses unified DependencyUtils.topologicalSort
 */
export function sortModulesByDependencies<T extends IDependable>(
    modules: T[]
): T[] {
    const result = topologicalSort(modules, { algorithm: 'dfs' });
    return result.sorted;
}
