/**
 * Engine integration for asset system
 * 资产系统的引擎集成
 */

import { AssetManager } from '../core/AssetManager';
import { AssetGUID, AssetType } from '../types/AssetTypes';
import { ITextureAsset, IAudioAsset, IJsonAsset } from '../interfaces/IAssetLoader';
import { PathResolutionService, type IPathResolutionService } from '../services/PathResolutionService';

/**
 * Texture engine bridge interface (for asset system)
 * 纹理引擎桥接接口（用于资产系统）
 */
export interface ITextureEngineBridge {
    /**
     * Load texture to GPU
     * 加载纹理到GPU
     */
    loadTexture(id: number, url: string): Promise<void>;

    /**
     * Load multiple textures
     * 批量加载纹理
     */
    loadTextures(requests: Array<{ id: number; url: string }>): Promise<void>;

    /**
     * Unload texture from GPU
     * 从GPU卸载纹理
     */
    unloadTexture(id: number): void;

    /**
     * Get or load texture by path.
     * 按路径获取或加载纹理。
     *
     * This is the preferred method for getting texture IDs.
     * The Rust engine is the single source of truth for texture ID allocation.
     * 这是获取纹理 ID 的首选方法。
     * Rust 引擎是纹理 ID 分配的唯一事实来源。
     *
     * @param path Image path/URL | 图片路径/URL
     * @returns Texture ID allocated by Rust engine | Rust 引擎分配的纹理 ID
     */
    getOrLoadTextureByPath?(path: string): number;

    /**
     * Clear the texture path cache (optional).
     * 清除纹理路径缓存（可选）。
     *
     * This should be called when restoring scene snapshots to ensure
     * textures are reloaded with correct IDs.
     * 在恢复场景快照时应调用此方法，以确保纹理使用正确的ID重新加载。
     */
    clearTexturePathCache?(): void;

    /**
     * Clear all textures and reset state (optional).
     * 清除所有纹理并重置状态（可选）。
     */
    clearAllTextures?(): void;

    // ===== Texture State API =====
    // ===== 纹理状态 API =====

    /**
     * Get texture loading state.
     * 获取纹理加载状态。
     *
     * @param id Texture ID | 纹理 ID
     * @returns State string: 'loading', 'ready', or 'failed:reason' | 状态字符串
     */
    getTextureState?(id: number): string;

    /**
     * Check if texture is ready for rendering.
     * 检查纹理是否已就绪可渲染。
     *
     * @param id Texture ID | 纹理 ID
     * @returns true if texture data is loaded | 纹理数据已加载则返回 true
     */
    isTextureReady?(id: number): boolean;

    /**
     * Get count of textures currently loading.
     * 获取当前正在加载的纹理数量。
     *
     * @returns Number of textures in 'loading' state | 处于加载状态的纹理数量
     */
    getTextureLoadingCount?(): number;

    /**
     * Load texture asynchronously with Promise.
     * 使用 Promise 异步加载纹理。
     *
     * Unlike loadTexture which returns immediately, this method
     * waits until the texture is actually loaded and ready.
     * 与 loadTexture 立即返回不同，此方法会等待纹理实际加载完成。
     *
     * @param id Texture ID | 纹理 ID
     * @param url Image URL | 图片 URL
     * @returns Promise that resolves when texture is ready | 纹理就绪时解析的 Promise
     */
    loadTextureAsync?(id: number, url: string): Promise<void>;

    /**
     * Get texture info by path.
     * 通过路径获取纹理信息。
     *
     * This is the primary API for getting texture dimensions.
     * The Rust engine is the single source of truth for texture dimensions.
     * 这是获取纹理尺寸的主要 API。
     * Rust 引擎是纹理尺寸的唯一事实来源。
     *
     * @param path Image path/URL | 图片路径/URL
     * @returns Texture info or null if not loaded | 纹理信息或未加载则为 null
     */
    getTextureInfoByPath?(path: string): { width: number; height: number } | null;
}

/**
 * Audio asset with runtime ID
 * 带运行时 ID 的音频资产
 */
interface AudioAssetEntry {
    id: number;
    asset: IAudioAsset;
    path: string;
}

/**
 * Data asset with runtime ID
 * 带运行时 ID 的数据资产
 */
interface DataAssetEntry {
    id: number;
    data: unknown;
    path: string;
}

/**
 * Texture load callback type
 * 纹理加载回调类型
 */
export type TextureLoadCallback = (guid: string, path: string, textureId: number) => void;

/**
 * Asset system engine integration
 * 资产系统引擎集成
 */
/**
 * Texture sprite info (nine-patch border, pivot, etc.)
 * 纹理 Sprite 信息（九宫格边距、锚点等）
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
     * 纹理宽度
     * Texture width
     */
    width: number;
    /**
     * 纹理高度
     * Texture height
     */
    height: number;
}

export class EngineIntegration {
    private _assetManager: AssetManager;
    private _engineBridge?: ITextureEngineBridge;
    private _pathResolver: IPathResolutionService;
    private _textureIdMap = new Map<AssetGUID, number>();
    private _pathToTextureId = new Map<string, number>();

    // 路径稳定 ID 缓存（跨 Play/Stop 循环保持稳定）
    // Path-stable ID cache (persists across Play/Stop cycles)
    private static _pathIdCache = new Map<string, number>();

    // 纹理 Sprite 信息缓存（全局静态，可供渲染系统访问）
    // Texture sprite info cache (global static, accessible by render systems)
    private static _textureSpriteInfoCache = new Map<AssetGUID, ITextureSpriteInfo>();

    // 纹理加载回调（用于动态图集集成等）
    // Texture load callback (for dynamic atlas integration, etc.)
    private static _textureLoadCallbacks: TextureLoadCallback[] = [];

    /**
     * Register a callback to be called when textures are loaded
     * 注册纹理加载时调用的回调
     *
     * This can be used for dynamic atlas integration.
     * 可用于动态图集集成。
     *
     * @param callback - Callback function | 回调函数
     */
    static onTextureLoad(callback: TextureLoadCallback): void {
        if (!EngineIntegration._textureLoadCallbacks.includes(callback)) {
            EngineIntegration._textureLoadCallbacks.push(callback);
        }
    }

    /**
     * Remove a texture load callback
     * 移除纹理加载回调
     */
    static removeTextureLoadCallback(callback: TextureLoadCallback): void {
        const index = EngineIntegration._textureLoadCallbacks.indexOf(callback);
        if (index >= 0) {
            EngineIntegration._textureLoadCallbacks.splice(index, 1);
        }
    }

    /**
     * Notify all callbacks of a texture load
     * 通知所有回调纹理已加载
     */
    private static notifyTextureLoad(guid: string, path: string, textureId: number): void {
        for (const callback of EngineIntegration._textureLoadCallbacks) {
            try {
                callback(guid, path, textureId);
            } catch (e) {
                console.error('[EngineIntegration] Error in texture load callback:', e);
            }
        }
    }

    // Audio resource mappings | 音频资源映射
    private _audioIdMap = new Map<AssetGUID, number>();
    private _pathToAudioId = new Map<string, number>();
    private _audioAssets = new Map<number, AudioAssetEntry>();
    private static _nextAudioId = 1;

    // Data resource mappings | 数据资源映射
    private _dataIdMap = new Map<AssetGUID, number>();
    private _pathToDataId = new Map<string, number>();
    private _dataAssets = new Map<number, DataAssetEntry>();
    private static _nextDataId = 1;

    /**
     * 根据路径生成稳定的 ID（使用 FNV-1a hash）
     * Generate stable ID from path (using FNV-1a hash)
     *
     * 相同路径永远返回相同 ID，即使在 clearTextureMappings 后
     * Same path always returns same ID, even after clearTextureMappings
     *
     * @param path 资源路径 | Resource path
     * @param type 资源类型 | Resource type
     * @returns 稳定的运行时 ID | Stable runtime ID
     */
    private static getStableIdForPath(path: string, type: 'texture' | 'audio'): number {
        const cacheKey = `${type}:${path}`;
        const cached = EngineIntegration._pathIdCache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }

        // FNV-1a hash 算法 | FNV-1a hash algorithm
        let hash = 2166136261; // FNV offset basis
        for (let i = 0; i < path.length; i++) {
            hash ^= path.charCodeAt(i);
            hash = Math.imul(hash, 16777619); // FNV prime
            hash = hash >>> 0; // Keep as uint32
        }

        // 确保 ID > 0（0 保留给默认纹理）
        // Ensure ID > 0 (0 is reserved for default texture)
        const id = (hash % 0x7FFFFFFF) + 1;
        EngineIntegration._pathIdCache.set(cacheKey, id);
        return id;
    }

    constructor(assetManager: AssetManager, engineBridge?: ITextureEngineBridge, pathResolver?: IPathResolutionService) {
        this._assetManager = assetManager;
        this._engineBridge = engineBridge;
        this._pathResolver = pathResolver ?? new PathResolutionService();
    }

    /**
     * Set path resolver
     * 设置路径解析器
     */
    setPathResolver(resolver: IPathResolutionService): void {
        this._pathResolver = resolver;
    }

    /**
     * Set engine bridge
     * 设置引擎桥接
     */
    setEngineBridge(bridge: ITextureEngineBridge): void {
        this._engineBridge = bridge;
    }

    /**
     * Load texture for component
     * 为组件加载纹理
     *
     * 使用路径稳定 ID 确保相同路径在 Play/Stop 循环后返回相同 ID。
     * 这样组件保存的 textureId 在恢复场景后仍然有效。
     *
     * Uses path-stable ID to ensure same path returns same ID across Play/Stop cycles.
     * This ensures component's saved textureId remains valid after scene restore.
     *
     * AssetManager 内部会处理路径解析，这里只需传入原始路径。
     * AssetManager handles path resolution internally, just pass the original path here.
     */
    async loadTextureForComponent(texturePath: string): Promise<number> {
        // 生成路径稳定 ID（相同路径永远返回相同 ID）
        // Generate path-stable ID (same path always returns same ID)
        const stableId = EngineIntegration.getStableIdForPath(texturePath, 'texture');

        // 检查是否已加载到 GPU
        // Check if already loaded to GPU
        const existingId = this._pathToTextureId.get(texturePath);
        if (existingId === stableId) {
            return stableId; // 已加载，直接返回 | Already loaded, return directly
        }

        // 解析路径为引擎可用的 URL
        // Resolve path to engine-compatible URL
        const engineUrl = this._pathResolver.catalogToRuntime(texturePath);

        // 使用稳定 ID 加载纹理到 GPU
        // Load texture to GPU with stable ID
        if (this._engineBridge) {
            // 优先使用异步加载（支持加载状态追踪）
            // Prefer async loading (supports loading state tracking)
            if (this._engineBridge.loadTextureAsync) {
                await this._engineBridge.loadTextureAsync(stableId, engineUrl);
            } else {
                await this._engineBridge.loadTexture(stableId, engineUrl);
            }
        }

        // 缓存映射
        // Cache mapping
        this._pathToTextureId.set(texturePath, stableId);

        return stableId;
    }

    /**
     * Load texture by GUID
     * 通过GUID加载纹理
     *
     * 使用路径稳定 ID 确保相同路径在 Play/Stop 循环后返回相同 ID。
     * Uses path-stable ID to ensure same path returns same ID across Play/Stop cycles.
     */
    async loadTextureByGuid(guid: AssetGUID): Promise<number> {
        // 检查是否已有纹理ID / Check if texture ID exists
        const existingId = this._textureIdMap.get(guid);
        if (existingId) {
            return existingId;
        }

        // 通过资产系统加载获取元数据和路径 / Load through asset system to get metadata and path
        const result = await this._assetManager.loadAsset<ITextureAsset>(guid);
        const metadata = result.metadata;
        const assetPath = metadata.path;
        const textureAsset = result.asset;

        // 缓存 sprite 信息（九宫格边距等）到静态缓存
        // Cache sprite info (slice border, etc.) to static cache
        EngineIntegration._textureSpriteInfoCache.set(guid, {
            sliceBorder: textureAsset.sliceBorder,
            pivot: textureAsset.pivot,
            width: textureAsset.width,
            height: textureAsset.height
        });

        // 生成路径稳定 ID
        // Generate path-stable ID
        const stableId = EngineIntegration.getStableIdForPath(assetPath, 'texture');

        // 检查是否已加载到 GPU
        // Check if already loaded to GPU
        if (this._pathToTextureId.get(assetPath) === stableId) {
            this._textureIdMap.set(guid, stableId);
            return stableId;
        }

        // 解析路径为引擎可用的 URL
        // Resolve path to engine-compatible URL
        const engineUrl = this._pathResolver.catalogToRuntime(assetPath);

        // 使用稳定 ID 加载纹理到 GPU
        // Load texture to GPU with stable ID
        if (this._engineBridge) {
            if (this._engineBridge.loadTextureAsync) {
                await this._engineBridge.loadTextureAsync(stableId, engineUrl);
            } else {
                await this._engineBridge.loadTexture(stableId, engineUrl);
            }
        }

        // 缓存映射 / Cache mapping
        this._textureIdMap.set(guid, stableId);
        this._pathToTextureId.set(assetPath, stableId);

        // 通知回调（用于动态图集等）
        // Notify callbacks (for dynamic atlas, etc.)
        EngineIntegration.notifyTextureLoad(guid, engineUrl, stableId);

        return stableId;
    }

    /**
     * Get texture sprite info by GUID (static method for render system access)
     * 通过 GUID 获取纹理 Sprite 信息（静态方法，供渲染系统访问）
     *
     * Returns cached sprite info including nine-patch slice border.
     * Must call loadTextureByGuid first to populate the cache.
     * 返回缓存的 sprite 信息，包括九宫格边距。
     * 必须先调用 loadTextureByGuid 来填充缓存。
     *
     * @param guid - Texture asset GUID | 纹理资产 GUID
     * @returns Sprite info or undefined if not loaded | Sprite 信息或未加载则为 undefined
     */
    static getTextureSpriteInfo(guid: AssetGUID): ITextureSpriteInfo | undefined {
        return EngineIntegration._textureSpriteInfoCache.get(guid);
    }

    /**
     * Clear texture sprite info cache
     * 清除纹理 Sprite 信息缓存
     */
    static clearTextureSpriteInfoCache(): void {
        EngineIntegration._textureSpriteInfoCache.clear();
    }

    /**
     * Batch load textures
     * 批量加载纹理
     */
    async loadTexturesBatch(paths: string[]): Promise<Map<string, number>> {
        const results = new Map<string, number>();

        // 收集需要加载的纹理 / Collect textures to load
        const toLoad: string[] = [];
        for (const path of paths) {
            const existingId = this._pathToTextureId.get(path);
            if (existingId) {
                results.set(path, existingId);
            } else {
                toLoad.push(path);
            }
        }

        if (toLoad.length === 0) {
            return results;
        }

        // 并行加载所有纹理 / Load all textures in parallel
        const loadPromises = toLoad.map(async (path) => {
            try {
                const id = await this.loadTextureForComponent(path);
                results.set(path, id);
            } catch (error) {
                console.error(`Failed to load texture: ${path}`, error);
                results.set(path, 0); // 使用默认纹理ID / Use default texture ID
            }
        });

        await Promise.all(loadPromises);
        return results;
    }

    /**
     * 批量加载资源（通用方法，支持 IResourceLoader 接口）
     * Load resources in batch (generic method for IResourceLoader interface)
     *
     * @param paths 资源路径数组 / Array of resource paths
     * @param type 资源类型 / Resource type
     * @returns 路径到运行时 ID 的映射 / Map of paths to runtime IDs
     */
    async loadResourcesBatch(paths: string[], type: 'texture' | 'audio' | 'font' | 'data'): Promise<Map<string, number>> {
        switch (type) {
            case 'texture':
                return this.loadTexturesBatch(paths);
            case 'audio':
                return this.loadAudioBatch(paths);
            case 'data':
                return this.loadDataBatch(paths);
            case 'font':
                // 字体资源暂未实现 / Font resources not yet implemented
                console.warn('[EngineIntegration] Font resource loading not yet implemented');
                return new Map();
            default:
                console.warn(`[EngineIntegration] Unknown resource type '${type}'`);
                return new Map();
        }
    }

    // ============= Audio Resource Methods =============
    // ============= 音频资源方法 =============

    /**
     * Load audio for component
     * 为组件加载音频
     *
     * @param audioPath 音频文件路径 / Audio file path
     * @returns 运行时音频 ID / Runtime audio ID
     */
    async loadAudioForComponent(audioPath: string): Promise<number> {
        // 检查缓存 / Check cache
        const existingId = this._pathToAudioId.get(audioPath);
        if (existingId) {
            return existingId;
        }

        // 通过资产系统加载 / Load through asset system
        const result = await this._assetManager.loadAssetByPath<IAudioAsset>(audioPath);
        const audioAsset = result.asset;

        // 分配运行时 ID / Assign runtime ID
        const audioId = EngineIntegration._nextAudioId++;

        // 缓存映射 / Cache mapping
        this._pathToAudioId.set(audioPath, audioId);
        this._audioAssets.set(audioId, {
            id: audioId,
            asset: audioAsset,
            path: audioPath
        });

        return audioId;
    }

    /**
     * Batch load audio files
     * 批量加载音频文件
     */
    async loadAudioBatch(paths: string[]): Promise<Map<string, number>> {
        const results = new Map<string, number>();

        // 收集需要加载的音频 / Collect audio to load
        const toLoad: string[] = [];
        for (const path of paths) {
            const existingId = this._pathToAudioId.get(path);
            if (existingId) {
                results.set(path, existingId);
            } else {
                toLoad.push(path);
            }
        }

        if (toLoad.length === 0) {
            return results;
        }

        // 并行加载所有音频 / Load all audio in parallel
        const loadPromises = toLoad.map(async (path) => {
            try {
                const id = await this.loadAudioForComponent(path);
                results.set(path, id);
            } catch (error) {
                console.error(`Failed to load audio: ${path}`, error);
                results.set(path, 0);
            }
        });

        await Promise.all(loadPromises);
        return results;
    }

    /**
     * Get audio asset by ID
     * 通过 ID 获取音频资产
     */
    getAudioAsset(audioId: number): IAudioAsset | null {
        const entry = this._audioAssets.get(audioId);
        return entry?.asset || null;
    }

    /**
     * Get audio ID for path
     * 获取路径的音频 ID
     */
    getAudioId(path: string): number | null {
        return this._pathToAudioId.get(path) || null;
    }

    /**
     * Unload audio
     * 卸载音频
     */
    unloadAudio(audioId: number): void {
        const entry = this._audioAssets.get(audioId);
        if (entry) {
            this._pathToAudioId.delete(entry.path);
            this._audioAssets.delete(audioId);

            // 从 GUID 映射中清理 / Clean up GUID mapping
            for (const [guid, id] of this._audioIdMap.entries()) {
                if (id === audioId) {
                    this._audioIdMap.delete(guid);
                    this._assetManager.unloadAsset(guid);
                    break;
                }
            }
        }
    }

    // ============= Data Resource Methods =============
    // ============= 数据资源方法 =============

    /**
     * Load data (JSON) for component
     * 为组件加载数据（JSON）
     *
     * @param dataPath 数据文件路径 / Data file path
     * @returns 运行时数据 ID / Runtime data ID
     */
    async loadDataForComponent(dataPath: string): Promise<number> {
        // 检查缓存 / Check cache
        const existingId = this._pathToDataId.get(dataPath);
        if (existingId) {
            return existingId;
        }

        // 通过资产系统加载 / Load through asset system
        const result = await this._assetManager.loadAssetByPath<IJsonAsset>(dataPath);
        const jsonAsset = result.asset;

        // 分配运行时 ID / Assign runtime ID
        const dataId = EngineIntegration._nextDataId++;

        // 缓存映射 / Cache mapping
        this._pathToDataId.set(dataPath, dataId);
        this._dataAssets.set(dataId, {
            id: dataId,
            data: jsonAsset.data,
            path: dataPath
        });

        return dataId;
    }

    /**
     * Batch load data files
     * 批量加载数据文件
     */
    async loadDataBatch(paths: string[]): Promise<Map<string, number>> {
        const results = new Map<string, number>();

        // 收集需要加载的数据 / Collect data to load
        const toLoad: string[] = [];
        for (const path of paths) {
            const existingId = this._pathToDataId.get(path);
            if (existingId) {
                results.set(path, existingId);
            } else {
                toLoad.push(path);
            }
        }

        if (toLoad.length === 0) {
            return results;
        }

        // 并行加载所有数据 / Load all data in parallel
        const loadPromises = toLoad.map(async (path) => {
            try {
                const id = await this.loadDataForComponent(path);
                results.set(path, id);
            } catch (error) {
                console.error(`Failed to load data: ${path}`, error);
                results.set(path, 0);
            }
        });

        await Promise.all(loadPromises);
        return results;
    }

    /**
     * Get data by ID
     * 通过 ID 获取数据
     */
    getData<T = unknown>(dataId: number): T | null {
        const entry = this._dataAssets.get(dataId);
        return (entry?.data as T) || null;
    }

    /**
     * Get data ID for path
     * 获取路径的数据 ID
     */
    getDataId(path: string): number | null {
        return this._pathToDataId.get(path) || null;
    }

    /**
     * Unload data
     * 卸载数据
     */
    unloadData(dataId: number): void {
        const entry = this._dataAssets.get(dataId);
        if (entry) {
            this._pathToDataId.delete(entry.path);
            this._dataAssets.delete(dataId);

            // 从 GUID 映射中清理 / Clean up GUID mapping
            for (const [guid, id] of this._dataIdMap.entries()) {
                if (id === dataId) {
                    this._dataIdMap.delete(guid);
                    this._assetManager.unloadAsset(guid);
                    break;
                }
            }
        }
    }

    /**
     * Unload texture
     * 卸载纹理
     */
    unloadTexture(textureId: number): void {
        // 从引擎卸载 / Unload from engine
        if (this._engineBridge) {
            this._engineBridge.unloadTexture(textureId);
        }

        // 清理映射 / Clean up mappings
        for (const [path, id] of this._pathToTextureId.entries()) {
            if (id === textureId) {
                this._pathToTextureId.delete(path);
                break;
            }
        }

        for (const [guid, id] of this._textureIdMap.entries()) {
            if (id === textureId) {
                this._textureIdMap.delete(guid);
                // 也从资产管理器卸载 / Also unload from asset manager
                this._assetManager.unloadAsset(guid);
                break;
            }
        }
    }

    /**
     * Get texture ID for path
     * 获取路径的纹理ID
     */
    getTextureId(path: string): number | null {
        return this._pathToTextureId.get(path) || null;
    }

    /**
     * Preload textures for scene
     * 为场景预加载纹理
     */
    async preloadSceneTextures(texturePaths: string[]): Promise<void> {
        await this.loadTexturesBatch(texturePaths);
    }

    /**
     * Clear all texture mappings (for scene switching)
     * 清空所有纹理映射（用于场景切换）
     *
     * 注意：使用路径稳定 ID 后，不应在 Play/Stop 循环中调用此方法。
     * 此方法仅用于场景切换时释放旧场景的纹理资源。
     *
     * NOTE: With path-stable IDs, this should NOT be called during Play/Stop cycle.
     * This method is only for releasing old scene's texture resources during scene switching.
     *
     * _pathIdCache 不会被清除，确保相同路径始终返回相同 ID。
     * _pathIdCache is NOT cleared, ensuring same path always returns same ID.
     */
    clearTextureMappings(): void {
        // 1. 清除加载状态映射（不清除 _pathIdCache）
        // Clear load state mappings (NOT clearing _pathIdCache)
        this._textureIdMap.clear();
        this._pathToTextureId.clear();

        // 2. 清除 Rust 引擎的 GPU 纹理资源
        // Clear Rust engine's GPU texture resources
        if (this._engineBridge?.clearAllTextures) {
            this._engineBridge.clearAllTextures();
        }

        // 3. 清除 AssetManager 中的纹理资产缓存
        // Clear texture asset cache in AssetManager
        this._assetManager.unloadAssetsByType(AssetType.Texture, true);

        // 注意：不再重置 TextureLoader 的 ID 计数器，因为现在使用路径稳定 ID
        // NOTE: No longer reset TextureLoader's ID counter as we now use path-stable IDs
    }

    /**
     * Clear all audio mappings
     * 清空所有音频映射
     */
    clearAudioMappings(): void {
        this._audioIdMap.clear();
        this._pathToAudioId.clear();
        this._audioAssets.clear();
    }

    /**
     * Clear all data mappings
     * 清空所有数据映射
     */
    clearDataMappings(): void {
        this._dataIdMap.clear();
        this._pathToDataId.clear();
        this._dataAssets.clear();
    }

    /**
     * Clear all resource mappings
     * 清空所有资源映射
     */
    clearAllMappings(): void {
        this.clearTextureMappings();
        this.clearAudioMappings();
        this.clearDataMappings();
    }

    /**
     * Get statistics
     * 获取统计信息
     */
    getStatistics(): {
        loadedTextures: number;
        loadedAudio: number;
        loadedData: number;
        } {
        return {
            loadedTextures: this._pathToTextureId.size,
            loadedAudio: this._audioAssets.size,
            loadedData: this._dataAssets.size
        };
    }
}
