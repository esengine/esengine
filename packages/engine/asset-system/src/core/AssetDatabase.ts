/**
 * Asset database for managing asset metadata
 * 用于管理资产元数据的资产数据库
 */

import {
    AssetGUID,
    AssetType,
    IAssetMetadata,
    IAssetCatalogEntry
} from '../types/AssetTypes';

/**
 * 纹理 Sprite 信息（从 meta 文件的 importSettings 读取）
 * Texture sprite info (read from meta file's importSettings)
 */
export interface ITextureSpriteInfo {
    /**
     * 九宫格切片边距 [top, right, bottom, left]
     * Nine-patch slice border
     */
    sliceBorder?: [number, number, number, number];
    /**
     * Sprite 锚点 [x, y]（0-1 归一化）
     * Sprite pivot point (0-1 normalized)
     */
    pivot?: [number, number];
    /**
     * 纹理宽度（可选，需要纹理已加载）
     * Texture width (optional, requires texture to be loaded)
     */
    width?: number;
    /**
     * 纹理高度（可选，需要纹理已加载）
     * Texture height (optional, requires texture to be loaded)
     */
    height?: number;
}

/**
 * Sprite settings in import settings
 * 导入设置中的 Sprite 设置
 */
interface ISpriteSettings {
    sliceBorder?: [number, number, number, number];
    pivot?: [number, number];
    pixelsPerUnit?: number;
    /** Texture width (from import settings) | 纹理宽度（来自导入设置） */
    width?: number;
    /** Texture height (from import settings) | 纹理高度（来自导入设置） */
    height?: number;
}

/**
 * Asset database implementation
 * 资产数据库实现
 */
export class AssetDatabase {
    private readonly _metadata = new Map<AssetGUID, IAssetMetadata>();
    private readonly _pathToGuid = new Map<string, AssetGUID>();
    private readonly _typeToGuids = new Map<AssetType, Set<AssetGUID>>();
    private readonly _labelToGuids = new Map<string, Set<AssetGUID>>();
    private readonly _dependencies = new Map<AssetGUID, Set<AssetGUID>>();
    private readonly _dependents = new Map<AssetGUID, Set<AssetGUID>>();

    /** Project root path for resolving relative paths. | 项目根路径，用于解析相对路径。 */
    private _projectRoot: string | null = null;

    /**
     * Set project root path.
     * 设置项目根路径。
     *
     * @param path - Absolute path to project root. | 项目根目录的绝对路径。
     */
    setProjectRoot(path: string): void {
        this._projectRoot = path;
    }

    /**
     * Get project root path.
     * 获取项目根路径。
     */
    getProjectRoot(): string | null {
        return this._projectRoot;
    }

    /**
     * Resolve relative path to absolute path.
     * 将相对路径解析为绝对路径。
     *
     * @param relativePath - Relative asset path (e.g., "assets/texture.png"). | 相对资产路径。
     * @returns Absolute file system path. | 绝对文件系统路径。
     */
    resolveAbsolutePath(relativePath: string): string {
        // Already absolute path (Windows or Unix).
        // 已经是绝对路径。
        if (relativePath.match(/^[a-zA-Z]:/) || relativePath.startsWith('/')) {
            return relativePath;
        }

        // No project root set, return as-is.
        // 未设置项目根路径，原样返回。
        if (!this._projectRoot) {
            return relativePath;
        }

        // Join with project root.
        // 与项目根路径拼接。
        const separator = this._projectRoot.includes('\\') ? '\\' : '/';
        const normalizedPath = relativePath.replace(/[/\\]/g, separator);
        return `${this._projectRoot}${separator}${normalizedPath}`;
    }

    /**
     * Convert absolute path to relative path.
     * 将绝对路径转换为相对路径。
     *
     * @param absolutePath - Absolute file system path. | 绝对文件系统路径。
     * @returns Relative asset path, or null if not under project root. | 相对资产路径。
     */
    toRelativePath(absolutePath: string): string | null {
        if (!this._projectRoot) {
            return null;
        }

        const normalizedAbs = absolutePath.replace(/\\/g, '/');
        const normalizedRoot = this._projectRoot.replace(/\\/g, '/');

        if (normalizedAbs.startsWith(normalizedRoot)) {
            return normalizedAbs.substring(normalizedRoot.length + 1);
        }

        return null;
    }

    /**
     * Add asset to database
     * 添加资产到数据库
     */
    addAsset(metadata: IAssetMetadata): void {
        const { guid, path, type, labels, dependencies } = metadata;

        // 存储元数据 / Store metadata
        this._metadata.set(guid, metadata);
        this._pathToGuid.set(path, guid);

        // 按类型索引 / Index by type
        if (!this._typeToGuids.has(type)) {
            this._typeToGuids.set(type, new Set());
        }
        this._typeToGuids.get(type)!.add(guid);

        // 按标签索引 / Index by labels
        labels.forEach((label) => {
            if (!this._labelToGuids.has(label)) {
                this._labelToGuids.set(label, new Set());
            }
            this._labelToGuids.get(label)!.add(guid);
        });

        // 建立依赖关系 / Establish dependencies
        this.updateDependencies(guid, dependencies);
    }

    /**
     * Remove asset from database
     * 从数据库移除资产
     */
    removeAsset(guid: AssetGUID): void {
        const metadata = this._metadata.get(guid);
        if (!metadata) return;

        // 清理元数据 / Clean up metadata
        this._metadata.delete(guid);
        this._pathToGuid.delete(metadata.path);

        // 清理类型索引 / Clean up type index
        const typeSet = this._typeToGuids.get(metadata.type);
        if (typeSet) {
            typeSet.delete(guid);
            if (typeSet.size === 0) {
                this._typeToGuids.delete(metadata.type);
            }
        }

        // 清理标签索引 / Clean up label indices
        metadata.labels.forEach((label) => {
            const labelSet = this._labelToGuids.get(label);
            if (labelSet) {
                labelSet.delete(guid);
                if (labelSet.size === 0) {
                    this._labelToGuids.delete(label);
                }
            }
        });

        // 清理依赖关系 / Clean up dependencies
        this.clearDependencies(guid);
    }

    /**
     * Update asset metadata
     * 更新资产元数据
     */
    updateAsset(guid: AssetGUID, updates: Partial<IAssetMetadata>): void {
        const metadata = this._metadata.get(guid);
        if (!metadata) return;

        // 如果路径改变，更新索引 / Update index if path changed
        if (updates.path && updates.path !== metadata.path) {
            this._pathToGuid.delete(metadata.path);
            this._pathToGuid.set(updates.path, guid);
        }

        // 如果类型改变，更新索引 / Update index if type changed
        if (updates.type && updates.type !== metadata.type) {
            const oldTypeSet = this._typeToGuids.get(metadata.type);
            if (oldTypeSet) {
                oldTypeSet.delete(guid);
            }

            if (!this._typeToGuids.has(updates.type)) {
                this._typeToGuids.set(updates.type, new Set());
            }
            this._typeToGuids.get(updates.type)!.add(guid);
        }

        // 如果依赖改变，更新关系 / Update relations if dependencies changed
        if (updates.dependencies) {
            this.updateDependencies(guid, updates.dependencies);
        }

        // 合并更新 / Merge updates
        Object.assign(metadata, updates);
        metadata.lastModified = Date.now();
        metadata.version++;
    }

    /**
     * Get asset metadata
     * 获取资产元数据
     */
    getMetadata(guid: AssetGUID): IAssetMetadata | undefined {
        return this._metadata.get(guid);
    }

    /**
     * Get metadata by path
     * 通过路径获取元数据
     */
    getMetadataByPath(path: string): IAssetMetadata | undefined {
        const guid = this._pathToGuid.get(path);
        return guid ? this._metadata.get(guid) : undefined;
    }

    /**
     * Get texture sprite info from metadata
     * 从元数据获取纹理 Sprite 信息
     *
     * Extracts spriteSettings from importSettings if available.
     * 如果可用，从 importSettings 提取 spriteSettings。
     *
     * @param guid - Texture asset GUID | 纹理资产 GUID
     * @returns Sprite info or undefined if not found/not a texture | Sprite 信息或未找到/非纹理则为 undefined
     */
    getTextureSpriteInfo(guid: AssetGUID): ITextureSpriteInfo | undefined {
        const metadata = this._metadata.get(guid);
        if (!metadata) return undefined;

        // Check if it's a texture asset
        // 检查是否是纹理资产
        if (metadata.type !== AssetType.Texture) return undefined;

        // Extract spriteSettings from importSettings
        // 从 importSettings 提取 spriteSettings
        const importSettings = metadata.importSettings as Record<string, unknown> | undefined;
        const spriteSettings = importSettings?.spriteSettings as ISpriteSettings | undefined;

        if (!spriteSettings) return undefined;

        return {
            sliceBorder: spriteSettings.sliceBorder,
            pivot: spriteSettings.pivot,
            // Include dimensions from import settings if available
            // 如果可用，包含来自导入设置的尺寸
            width: spriteSettings.width,
            height: spriteSettings.height
        };
    }

    /**
     * Find assets by type
     * 按类型查找资产
     */
    findAssetsByType(type: AssetType): AssetGUID[] {
        const guids = this._typeToGuids.get(type);
        return guids ? Array.from(guids) : [];
    }

    /**
     * Find assets by label
     * 按标签查找资产
     */
    findAssetsByLabel(label: string): AssetGUID[] {
        const guids = this._labelToGuids.get(label);
        return guids ? Array.from(guids) : [];
    }

    /**
     * Find assets by multiple labels (AND operation)
     * 按多个标签查找资产（AND操作）
     */
    findAssetsByLabels(labels: string[]): AssetGUID[] {
        if (labels.length === 0) return [];

        let result: Set<AssetGUID> | null = null;

        for (const label of labels) {
            const labelGuids = this._labelToGuids.get(label);
            if (!labelGuids || labelGuids.size === 0) return [];

            if (!result) {
                result = new Set(labelGuids);
            } else {
                // 交集 / Intersection
                const intersection = new Set<AssetGUID>();
                labelGuids.forEach((guid) => {
                    if (result!.has(guid)) {
                        intersection.add(guid);
                    }
                });
                result = intersection;
            }
        }

        return result ? Array.from(result) : [];
    }

    /**
     * Search assets by query
     * 通过查询搜索资产
     */
    searchAssets(query: {
        name?: string;
        type?: AssetType;
        labels?: string[];
        path?: string;
    }): AssetGUID[] {
        let results = Array.from(this._metadata.keys());

        // 按名称过滤 / Filter by name
        if (query.name) {
            const nameLower = query.name.toLowerCase();
            results = results.filter((guid) => {
                const metadata = this._metadata.get(guid)!;
                return metadata.name.toLowerCase().includes(nameLower);
            });
        }

        // 按类型过滤 / Filter by type
        if (query.type) {
            const typeGuids = this._typeToGuids.get(query.type);
            if (!typeGuids) return [];
            results = results.filter((guid) => typeGuids.has(guid));
        }

        // 按标签过滤 / Filter by labels
        if (query.labels && query.labels.length > 0) {
            const labelResults = this.findAssetsByLabels(query.labels);
            const labelSet = new Set(labelResults);
            results = results.filter((guid) => labelSet.has(guid));
        }

        // 按路径过滤 / Filter by path
        if (query.path) {
            const pathLower = query.path.toLowerCase();
            results = results.filter((guid) => {
                const metadata = this._metadata.get(guid)!;
                return metadata.path.toLowerCase().includes(pathLower);
            });
        }

        return results;
    }

    /**
     * Get asset dependencies
     * 获取资产依赖
     */
    getDependencies(guid: AssetGUID): AssetGUID[] {
        const deps = this._dependencies.get(guid);
        return deps ? Array.from(deps) : [];
    }

    /**
     * Get asset dependents (assets that depend on this one)
     * 获取资产的依赖者（依赖此资产的其他资产）
     */
    getDependents(guid: AssetGUID): AssetGUID[] {
        const deps = this._dependents.get(guid);
        return deps ? Array.from(deps) : [];
    }

    /**
     * Get all dependencies recursively
     * 递归获取所有依赖
     */
    getAllDependencies(guid: AssetGUID, visited = new Set<AssetGUID>()): AssetGUID[] {
        if (visited.has(guid)) return [];
        visited.add(guid);

        const result: AssetGUID[] = [];
        const directDeps = this.getDependencies(guid);

        for (const dep of directDeps) {
            result.push(dep);
            const transitiveDeps = this.getAllDependencies(dep, visited);
            result.push(...transitiveDeps);
        }

        return result;
    }

    /**
     * Check for circular dependencies
     * 检查循环依赖
     */
    hasCircularDependency(guid: AssetGUID): boolean {
        const visited = new Set<AssetGUID>();
        const recursionStack = new Set<AssetGUID>();

        const checkCycle = (current: AssetGUID): boolean => {
            visited.add(current);
            recursionStack.add(current);

            const deps = this.getDependencies(current);
            for (const dep of deps) {
                if (!visited.has(dep)) {
                    if (checkCycle(dep)) return true;
                } else if (recursionStack.has(dep)) {
                    return true;
                }
            }

            recursionStack.delete(current);
            return false;
        };

        return checkCycle(guid);
    }

    /**
     * Update dependencies
     * 更新依赖关系
     */
    private updateDependencies(guid: AssetGUID, newDependencies: AssetGUID[]): void {
        // 清除旧的依赖关系 / Clear old dependencies
        this.clearDependencies(guid);

        // 建立新的依赖关系 / Establish new dependencies
        if (newDependencies.length > 0) {
            this._dependencies.set(guid, new Set(newDependencies));

            // 更新被依赖关系 / Update dependent relations
            newDependencies.forEach((dep) => {
                if (!this._dependents.has(dep)) {
                    this._dependents.set(dep, new Set());
                }
                this._dependents.get(dep)!.add(guid);
            });
        }
    }

    /**
     * Clear dependencies
     * 清除依赖关系
     */
    private clearDependencies(guid: AssetGUID): void {
        // 清除依赖 / Clear dependencies
        const deps = this._dependencies.get(guid);
        if (deps) {
            deps.forEach((dep) => {
                const dependents = this._dependents.get(dep);
                if (dependents) {
                    dependents.delete(guid);
                    if (dependents.size === 0) {
                        this._dependents.delete(dep);
                    }
                }
            });
            this._dependencies.delete(guid);
        }

        // 清除被依赖 / Clear dependents
        const dependents = this._dependents.get(guid);
        if (dependents) {
            dependents.forEach((dependent) => {
                const dependencies = this._dependencies.get(dependent);
                if (dependencies) {
                    dependencies.delete(guid);
                    if (dependencies.size === 0) {
                        this._dependencies.delete(dependent);
                    }
                }
            });
            this._dependents.delete(guid);
        }
    }

    /**
     * Get database statistics
     * 获取数据库统计
     */
    getStatistics(): {
        totalAssets: number;
        assetsByType: Map<AssetType, number>;
        totalDependencies: number;
        assetsWithDependencies: number;
        circularDependencies: number;
        } {
        const assetsByType = new Map<AssetType, number>();
        this._typeToGuids.forEach((guids, type) => {
            assetsByType.set(type, guids.size);
        });

        let circularDependencies = 0;
        this._metadata.forEach((_, guid) => {
            if (this.hasCircularDependency(guid)) {
                circularDependencies++;
            }
        });

        return {
            totalAssets: this._metadata.size,
            assetsByType,
            totalDependencies: Array.from(this._dependencies.values()).reduce(
                (sum, deps) => sum + deps.size,
                0
            ),
            assetsWithDependencies: this._dependencies.size,
            circularDependencies
        };
    }

    /**
     * Export to catalog entries
     * 导出为目录条目
     */
    exportToCatalog(): IAssetCatalogEntry[] {
        const entries: IAssetCatalogEntry[] = [];

        this._metadata.forEach((metadata) => {
            entries.push({
                guid: metadata.guid,
                path: metadata.path,
                type: metadata.type,
                size: metadata.size,
                hash: metadata.hash
            });
        });

        return entries;
    }

    /**
     * Clear database
     * 清空数据库
     */
    clear(): void {
        this._metadata.clear();
        this._pathToGuid.clear();
        this._typeToGuids.clear();
        this._labelToGuids.clear();
        this._dependencies.clear();
        this._dependents.clear();
    }
}
