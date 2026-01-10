/**
 * @zh 资源服务 - 统一的资源加载和缓存管理
 * @en Asset Service - Unified asset loading and cache management
 *
 * 使用 ccesengine 自身的资源加载系统，编辑器只负责：
 * 1. 扫描项目文件，建立 UUID 索引
 * 2. 注册自定义 downloader 处理本地文件
 * 3. 调用引擎的 loadAny() 加载资源
 *
 * Uses ccesengine's own asset loading system. Editor only handles:
 * 1. Scanning project files, building UUID index
 * 2. Registering custom downloader for local files
 * 3. Calling engine's loadAny() to load assets
 */

import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import type { Unsubscribe } from './types';
import type { IEngineAdapter } from './EngineAdapter';
import type { Asset, AssetManager } from 'cc';
import { getEngineAdapter } from './EngineAdapter';


/**
 * @zh 资源类型
 * @en Asset type
 */
export type AssetType =
    | 'image'
    | 'texture'
    | 'spriteFrame'
    | 'material'
    | 'prefab'
    | 'scene'
    | 'font'
    | 'audio'
    | 'other';

/**
 * @zh 资源信息
 * @en Asset information
 */
export interface AssetInfo {
    uuid: string;
    type: AssetType;
    sourcePath: string;
    metaPath: string;
    isBuiltin: boolean;
    subAssets: Map<string, SubAssetInfo>;
}

/**
 * @zh 子资源信息
 * @en Sub-asset information
 */
export interface SubAssetInfo {
    uuid: string;
    type: 'texture' | 'spriteFrame' | 'textureCube' | 'textureCubeFace';
    parentUuid: string;
    id: string;
    importer: string;
    userData?: Record<string, unknown>;
}

/**
 * @zh 资源加载结果
 * @en Asset load result
 */
export interface AssetLoadResult {
    success: boolean;
    loadedCount: number;
    failedCount: number;
    totalDurationMs: number;
    failures: AssetLoadFailure[];
}

/**
 * @zh 资源加载失败信息
 * @en Asset load failure info
 */
export interface AssetLoadFailure {
    uuid: string;
    error: string;
    type: 'not-found' | 'parse-error' | 'load-error';
}

/**
 * @zh 资源统计
 * @en Asset statistics
 */
export interface AssetStats {
    totalIndexed: number;
    totalLoaded: number;
    byType: Record<AssetType, number>;
}

/**
 * @zh .meta 文件结构
 * @en .meta file structure
 */
interface MetaFile {
    ver: string;
    importer: string;
    imported: boolean;
    uuid: string;
    files: string[];
    subMetas: Record<string, MetaSubAsset>;
    userData?: {
        type?: string;
        hasAlpha?: boolean;
        redirect?: string;
    };
}

interface MetaSubAsset {
    importer: string;
    uuid: string;
    displayName?: string;
    id?: string;
    name?: string;
    userData?: Record<string, unknown>;
    ver?: string;
    imported?: boolean;
    files?: string[];
    subMetas?: Record<string, MetaSubAsset>;
}

interface DirectoryEntry {
    name: string;
    path: string;
    is_dir: boolean;
}


/**
 * @zh 资源服务接口
 * @en Asset service interface
 */
export interface IAssetService {
    initialize(): Promise<void>;

    // Project Management
    setProjectPath(projectPath: string): Promise<void>;
    getProjectPath(): string | null;

    // Single-Pass Loading
    loadSceneAssets(sceneData: unknown): Promise<AssetLoadResult>;
    loadAsset(uuid: string): Promise<Asset | null>;

    // Cache Management
    getAsset(uuid: string): Asset | null;
    hasAsset(uuid: string): boolean;
    releaseAsset(uuid: string): void;
    releaseSceneAssets(sceneId: string): void;
    clearCache(): void;

    // Asset Info
    getAssetInfo(uuid: string): AssetInfo | SubAssetInfo | null;
    getAssetPath(uuid: string): string | null;

    getStats(): AssetStats;

    onAssetLoaded(callback: (uuid: string, asset: Asset) => void): Unsubscribe;
    onAssetReleased(callback: (uuid: string) => void): Unsubscribe;
}


/**
 * @zh 资源服务实现
 * @en Asset service implementation
 */
class AssetServiceImpl implements IAssetService {
    private _adapter: IEngineAdapter;
    private _projectPath: string | null = null;
    private _initialized = false;

    // Asset indices
    private _assetIndex: Map<string, AssetInfo> = new Map();
    private _subAssetIndex: Map<string, SubAssetInfo> = new Map();
    private _uuidToPath: Map<string, string> = new Map();

    // Scene asset tracking
    private _sceneAssets: Map<string, Set<string>> = new Map();

    private _isScanning = false;
    private _builtinAssetsScanned = false;

    private _loadedCallbacks: Array<(uuid: string, asset: Asset) => void> = [];
    private _releasedCallbacks: Array<(uuid: string) => void> = [];

    constructor() {
        this._adapter = getEngineAdapter();
    }


    /**
     * @zh 初始化资源服务，注册自定义下载器
     * @en Initialize asset service, register custom downloaders
     */
    async initialize(): Promise<void> {
        if (this._initialized) return;

        const cc = this._adapter.getCC();
        if (!cc?.assetManager) {
            return;
        }

        this.registerDownloaders(cc.assetManager);
        this._initialized = true;
    }

    /**
     * @zh 注册自定义下载器处理本地文件
     * @en Register custom downloaders for local files
     */
    private registerDownloaders(assetManager: AssetManager): void {
        const downloader = assetManager.downloader;

        // Helper to check if URL is a local filesystem path
        const isLocalPath = (url: string): boolean => {
            // Windows paths (C:\, D:\, etc.)
            if (/^[A-Za-z]:[\\/]/.test(url)) return true;
            // Tauri asset protocol
            if (url.startsWith('asset://') || url.includes('asset.localhost')) return false;
            // Web server relative paths
            if (url.startsWith('/ccesengine/') || url.startsWith('/engine-assets/') || url.startsWith('/assets/') || url.startsWith('/@')) return false;
            // HTTP/HTTPS URLs
            if (url.startsWith('http://') || url.startsWith('https://')) return false;
            // Unix absolute paths that are actual filesystem paths
            if (url.startsWith('/') && !url.startsWith('//')) return true;
            return false;
        };

        // 图片文件：通过 Tauri 或 fetch 加载
        const imageHandler = (
            url: string,
            options: Record<string, unknown>,
            onComplete: (err: Error | null, data?: HTMLImageElement) => void
        ) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => onComplete(null, img);
            img.onerror = () => onComplete(new Error(`Failed to load image: ${url}`));

            // Convert local filesystem paths to Tauri asset URLs
            if (isLocalPath(url)) {
                img.src = convertFileSrc(url);
            } else {
                img.src = url;
            }
        };

        // 注册图片格式处理器
        downloader.register('.png', imageHandler);
        downloader.register('.jpg', imageHandler);
        downloader.register('.jpeg', imageHandler);
        downloader.register('.webp', imageHandler);

        // JSON 文件：场景、预制体等
        const jsonHandler = async (
            url: string,
            options: Record<string, unknown>,
            onComplete: (err: Error | null, data?: unknown) => void
        ) => {
            try {
                let content: string;

                if (isLocalPath(url)) {
                    // Local filesystem file via Tauri
                    content = await invoke<string>('read_file_content', { path: url });
                } else {
                    // Web server or remote resource via fetch
                    const response = await fetch(url);
                    content = await response.text();
                }

                const data = JSON.parse(content);
                onComplete(null, data);
            } catch (err) {
                onComplete(err instanceof Error ? err : new Error(String(err)));
            }
        };

        downloader.register('.json', jsonHandler);

        // 二进制文件
        const binaryHandler = async (
            url: string,
            options: Record<string, unknown>,
            onComplete: (err: Error | null, data?: ArrayBuffer) => void
        ) => {
            try {
                if (isLocalPath(url)) {
                    const bytes = await invoke<number[]>('read_file_bytes', { path: url });
                    onComplete(null, new Uint8Array(bytes).buffer);
                } else {
                    const response = await fetch(url);
                    const buffer = await response.arrayBuffer();
                    onComplete(null, buffer);
                }
            } catch (err) {
                onComplete(err instanceof Error ? err : new Error(String(err)));
            }
        };

        downloader.register('.bin', binaryHandler);

    }

    // Project Management

    async setProjectPath(projectPath: string): Promise<void> {
        if (this._projectPath === projectPath && this._assetIndex.size > 0) {
            return;
        }

        this._projectPath = projectPath;
        this._assetIndex.clear();
        this._subAssetIndex.clear();
        this._uuidToPath.clear();
        this._sceneAssets.clear();

        await this.scanAssetsFolder();
    }

    getProjectPath(): string | null {
        return this._projectPath;
    }

    // Single-Pass Loading

    /**
     * @zh 加载场景所需的所有资源（单次通过）
     * @en Load all assets needed by scene (single-pass)
     */
    async loadSceneAssets(sceneData: unknown): Promise<AssetLoadResult> {
        const startTime = performance.now();
        const failures: AssetLoadFailure[] = [];
        let loadedCount = 0;

        // Ensure initialized
        await this.initialize();

        // Step 1: Extract all UUID dependencies from scene data
        const dependencies = this.extractDependencies(sceneData);

        // Step 2: Load assets using engine's loadAny
        for (const uuid of dependencies) {
            try {
                const asset = await this.loadAsset(uuid);
                if (asset) {
                    loadedCount++;
                } else {
                    failures.push({
                        uuid,
                        error: 'Asset not found in index',
                        type: 'not-found',
                    });
                }
            } catch (error) {
                failures.push({
                    uuid,
                    error: error instanceof Error ? error.message : String(error),
                    type: 'load-error',
                });
            }
        }

        const duration = performance.now() - startTime;

        return {
            success: failures.length === 0,
            loadedCount,
            failedCount: failures.length,
            totalDurationMs: duration,
            failures,
        };
    }

    /**
     * @zh 加载单个资源
     * @en Load single asset
     *
     * 根据资源类型使用不同的加载方法：
     * - 图片资源：使用 loadRemote 并指定扩展名
     * - JSON 资源：使用 loadAny
     * - 子资源：加载父资源后从缓存获取
     */
    async loadAsset(uuid: string): Promise<Asset | null> {
        const cc = this._adapter.getCC();
        if (!cc?.assetManager) {
            return null;
        }

        // Check if already loaded in engine cache
        const existingAsset = cc.assetManager.assets.get(uuid) as Asset | undefined;
        if (existingAsset) {
            return existingAsset;
        }

        // Check if this is a sub-asset (format: parentUuid@subId)
        if (uuid.includes('@')) {
            return this.loadSubAsset(uuid);
        }

        // Get asset path from index
        const assetPath = this.getAssetPath(uuid);
        if (!assetPath) {
            return null;
        }

        // Determine the correct URL
        const isLocal = this.isLocalFilePath(assetPath);
        const url = isLocal ? convertFileSrc(assetPath) : assetPath;

        // Get file extension for type detection
        const ext = this.getFileExtension(assetPath);

        // For image assets, use loadRemote with explicit ext option
        if (this.isImageExtension(ext)) {
            return this.loadImageAsset(url, uuid, ext);
        }

        // For other assets, use loadAny
        return new Promise((resolve) => {
            cc.assetManager.loadAny(
                { url, uuid, ext },
                (err: Error | null, asset: Asset) => {
                    if (err) {
                        resolve(null);
                        return;
                    }

                    if (asset && !asset._uuid) {
                        asset._uuid = uuid;
                    }

                    this.notifyLoaded(uuid, asset);
                    resolve(asset);
                }
            );
        });
    }

    /**
     * @zh 加载图片资源
     * @en Load image asset
     */
    private async loadImageAsset(url: string, uuid: string, ext: string): Promise<Asset | null> {
        const cc = this._adapter.getCC();
        if (!cc?.assetManager) return null;

        return new Promise((resolve) => {
            cc.assetManager.loadRemote(
                url,
                { ext },
                (err: Error | null, asset: Asset) => {
                    if (err) {
                        resolve(null);
                        return;
                    }

                    if (asset && !asset._uuid) {
                        asset._uuid = uuid;
                    }

                    // Add reference to prevent auto-release during scene load
                    asset.addRef();
                    cc.assetManager.assets.add(uuid, asset);
                    this.notifyLoaded(uuid, asset);
                    resolve(asset);
                }
            );
        });
    }

    /**
     * @zh 加载子资源（如 SpriteFrame, TextureCube）
     * @en Load sub-asset (like SpriteFrame, TextureCube)
     *
     * 子资源 UUID 格式: parentUuid@subId 或 parentUuid@subId@subSubId
     * 先加载父资源，然后从中获取子资源
     */
    private async loadSubAsset(uuid: string): Promise<Asset | null> {
        const cc = this._adapter.getCC();
        if (!cc?.assetManager) return null;

        // Check if already in engine cache
        const existing = cc.assetManager.assets.get(uuid) as Asset | undefined;
        if (existing) return existing;

        // Get sub-asset info
        const subInfo = this._subAssetIndex.get(uuid);
        if (!subInfo) {
            return null;
        }

        // Handle TextureCube and TextureCubeFace specially - create default placeholder
        // These don't need parent asset loading since HDR files need special import
        if (subInfo.type === 'textureCube' || subInfo.type === 'textureCubeFace') {
            return this.createDefaultTextureCube(uuid, subInfo);
        }

        // Load parent asset first for other types
        const parentAsset = await this.loadAsset(subInfo.parentUuid);
        if (!parentAsset) {
            return null;
        }

        // Handle different sub-asset types
        switch (subInfo.type) {
            case 'spriteFrame':
                return this.createSpriteFrameFromTexture(parentAsset, uuid, subInfo);

            case 'texture':
                // For texture sub-assets, the parent texture can be used directly
                // or we may need to create a Texture2D wrapper
                return this.createTextureFromImage(parentAsset, uuid, subInfo);

            default:
                return null;
        }
    }

    /**
     * @zh 从纹理创建 SpriteFrame
     * @en Create SpriteFrame from texture
     *
     * SpriteFrame 需要 Texture2D，不是 ImageAsset。
     * 正确的链: ImageAsset → Texture2D.image → SpriteFrame.texture
     */
    private createSpriteFrameFromTexture(
        parentAsset: Asset,
        uuid: string,
        subInfo: SubAssetInfo
    ): Asset | null {
        const cc = this._adapter.getCC();
        if (!cc?.SpriteFrame || !cc?.Texture2D) return null;

        try {
            let texture2D: Asset;
            const parentClassName = parentAsset.constructor.name;

            if (parentClassName === 'Texture2D') {
                texture2D = parentAsset;
            } else if (parentClassName === 'ImageAsset') {
                // Check if Texture2D already exists in cache
                const textureUuid = `${subInfo.parentUuid}@texture`;
                const existingTexture = cc.assetManager.assets.get(textureUuid) as Asset | undefined;

                if (existingTexture) {
                    // Reuse existing Texture2D
                    texture2D = existingTexture;
                } else {
                    // Create new Texture2D from ImageAsset
                    const Texture2D = cc.Texture2D;
                    texture2D = new Texture2D();
                    (texture2D as unknown as { image: unknown }).image = parentAsset;

                    // Register texture with reference to prevent auto-release
                    texture2D._uuid = textureUuid;
                    texture2D.addRef();
                    cc.assetManager.assets.add(textureUuid, texture2D);
                }
            } else {
                return null;
            }

            // Create SpriteFrame with the Texture2D
            const SpriteFrame = cc.SpriteFrame;
            const sf = new SpriteFrame();
            sf._uuid = uuid;
            sf.texture = texture2D as unknown as typeof sf.texture;

            // Register SpriteFrame with reference to prevent auto-release
            sf.addRef();
            cc.assetManager.assets.add(uuid, sf);
            this.notifyLoaded(uuid, sf);
            return sf;
        } catch (err) {
            return null;
        }
    }

    /**
     * @zh 创建默认的 TextureCube（用于 Skybox 占位）
     * @en Create default TextureCube (placeholder for Skybox)
     *
     * TextureCube 用于环境贴图、天空盒等。
     * 由于 HDR 文件需要特殊导入处理，我们创建一个默认的占位纹理。
     * 参考 ccesengine 的 BuiltinResMgr 实现。
     */
    private createDefaultTextureCube(uuid: string, subInfo: SubAssetInfo): Asset | null {
        const cc = this._adapter.getCC();
        if (!cc) return null;

        // Check if already in cache
        const existing = cc.assetManager?.assets?.get(uuid) as Asset | undefined;
        if (existing) return existing;

        try {
            // Get TextureCube and ImageAsset classes from cc
            const TextureCube = (cc as unknown as Record<string, unknown>).TextureCube as {
                new(): Asset & {
                    _uuid: string;
                    image: unknown;
                    setMipFilter?(filter: number): void;
                };
            };
            const ImageAsset = (cc as unknown as Record<string, unknown>).ImageAsset as {
                new(source: unknown): unknown;
            };

            if (!TextureCube || !ImageAsset) {
                return null;
            }

            // Create a simple 2x2 grey image source (like ccesengine's builtinResMgr)
            const size = 2;
            const numChannels = 4;
            const greyValue = new Uint8Array(size * size * numChannels);
            for (let i = 0; i < size * size; i++) {
                const offset = i * numChannels;
                greyValue[offset] = 128;     // R
                greyValue[offset + 1] = 128; // G
                greyValue[offset + 2] = 128; // B
                greyValue[offset + 3] = 255; // A
            }

            const imageSource = {
                width: size,
                height: size,
                _data: greyValue,
                _compressed: false,
                format: 35, // PixelFormat.RGBA8888
            };

            // Create 6 ImageAssets for cube faces
            const frontImg = new ImageAsset(imageSource);
            const backImg = new ImageAsset(imageSource);
            const leftImg = new ImageAsset(imageSource);
            const rightImg = new ImageAsset(imageSource);
            const topImg = new ImageAsset(imageSource);
            const bottomImg = new ImageAsset(imageSource);

            // Create TextureCube
            const textureCube = new TextureCube();
            textureCube._uuid = uuid;

            // Set mip filter if available (NEAREST = 0)
            if (textureCube.setMipFilter) {
                textureCube.setMipFilter(0);
            }

            // Set the 6 faces
            textureCube.image = {
                front: frontImg,
                back: backImg,
                left: leftImg,
                right: rightImg,
                top: topImg,
                bottom: bottomImg,
            };

            // Add reference to prevent auto-release during scene load
            textureCube.addRef();
            cc.assetManager?.assets?.add(uuid, textureCube);

            this.notifyLoaded(uuid, textureCube);
            return textureCube;
        } catch (err) {
            return null;
        }
    }

    /**
     * @zh 从父资源创建 Texture2D
     * @en Create Texture2D from parent asset
     */
    private createTextureFromImage(
        parentAsset: Asset,
        uuid: string,
        subInfo: SubAssetInfo
    ): Asset | null {
        const cc = this._adapter.getCC();
        if (!cc?.Texture2D) return null;

        try {
            // If parent is already a Texture2D, use it directly
            if (parentAsset.constructor.name === 'Texture2D') {
                cc.assetManager.assets.add(uuid, parentAsset);
                return parentAsset;
            }

            // If parent is an ImageAsset, create Texture2D from it
            const Texture2D = cc.Texture2D;
            const tex = new Texture2D();
            tex._uuid = uuid;

            // Try to set image
            if ('image' in tex && parentAsset) {
                (tex as unknown as { image: unknown }).image = parentAsset;
            }

            // Register in asset cache
            cc.assetManager.assets.add(uuid, tex);
            this.notifyLoaded(uuid, tex);
            return tex;
        } catch (err) {
            return null;
        }
    }

    /**
     * @zh 获取文件扩展名
     * @en Get file extension
     */
    private getFileExtension(path: string): string {
        const match = path.match(/\.([^./?#]+)(?:[?#]|$)/);
        return match && match[1] ? `.${match[1].toLowerCase()}` : '';
    }

    /**
     * @zh 检查是否为图片扩展名
     * @en Check if extension is for image
     */
    private isImageExtension(ext: string): boolean {
        return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'].includes(ext.toLowerCase());
    }

    /**
     * @zh 判断路径是否为本地文件系统路径
     * @en Check if path is a local filesystem path
     *
     * Web server paths like "/ccesengine/..." should NOT be converted.
     * Local paths like "C:\..." or "/home/..." need convertFileSrc().
     */
    private isLocalFilePath(path: string): boolean {
        // Windows absolute path (e.g., C:\, D:\)
        if (/^[A-Za-z]:[\\/]/.test(path)) {
            return true;
        }

        // Unix absolute path that's NOT a web server path
        // Web paths start with /ccesengine/, /engine-assets/, /assets/, etc.
        if (path.startsWith('/')) {
            // These are web server paths, not local files
            const webServerPrefixes = ['/ccesengine/', '/engine-assets/', '/assets/', '/@'];
            return !webServerPrefixes.some(prefix => path.startsWith(prefix));
        }

        return false;
    }

    // Cache Management

    getAsset(uuid: string): Asset | null {
        const cc = this._adapter.getCC();
        return (cc?.assetManager?.assets?.get(uuid) as Asset) ?? null;
    }

    hasAsset(uuid: string): boolean {
        const cc = this._adapter.getCC();
        return cc?.assetManager?.assets?.has?.(uuid) ?? false;
    }

    releaseAsset(uuid: string): void {
        const cc = this._adapter.getCC();
        const asset = cc?.assetManager?.assets?.get(uuid) as Asset | undefined;
        if (asset) {
            cc?.assetManager?.releaseAsset(asset);
            this.notifyReleased(uuid);
        }
    }

    releaseSceneAssets(sceneId: string): void {
        const assets = this._sceneAssets.get(sceneId);
        if (assets) {
            for (const uuid of assets) {
                this.releaseAsset(uuid);
            }
            this._sceneAssets.delete(sceneId);
        }
    }

    clearCache(): void {
        const cc = this._adapter.getCC();
        if (cc?.assetManager) {
            cc.assetManager.releaseAll();
        }
        this._sceneAssets.clear();
    }

    // Asset Info

    getAssetInfo(uuid: string): AssetInfo | SubAssetInfo | null {
        return this._assetIndex.get(uuid) ?? this._subAssetIndex.get(uuid) ?? null;
    }

    /**
     * @zh 根据 UUID 获取资源路径
     * @en Get asset path by UUID
     */
    getAssetPath(uuid: string): string | null {
        // Direct lookup
        const directPath = this._uuidToPath.get(uuid);
        if (directPath) return directPath;

        // Check main asset index
        const assetInfo = this._assetIndex.get(uuid);
        if (assetInfo) return assetInfo.sourcePath;

        // Check sub-asset index, return parent path
        const subInfo = this._subAssetIndex.get(uuid);
        if (subInfo) {
            const parentInfo = this._assetIndex.get(subInfo.parentUuid);
            if (parentInfo) return parentInfo.sourcePath;
        }

        return null;
    }


    getStats(): AssetStats {
        const byType: Record<AssetType, number> = {
            image: 0,
            texture: 0,
            spriteFrame: 0,
            material: 0,
            prefab: 0,
            scene: 0,
            font: 0,
            audio: 0,
            other: 0,
        };

        for (const info of this._assetIndex.values()) {
            byType[info.type]++;
        }

        const cc = this._adapter.getCC();
        const loadedCount = cc?.assetManager?.assets?.count ?? 0;

        return {
            totalIndexed: this._assetIndex.size + this._subAssetIndex.size,
            totalLoaded: loadedCount,
            byType,
        };
    }


    onAssetLoaded(callback: (uuid: string, asset: Asset) => void): Unsubscribe {
        this._loadedCallbacks.push(callback);
        return () => {
            const index = this._loadedCallbacks.indexOf(callback);
            if (index >= 0) this._loadedCallbacks.splice(index, 1);
        };
    }

    onAssetReleased(callback: (uuid: string) => void): Unsubscribe {
        this._releasedCallbacks.push(callback);
        return () => {
            const index = this._releasedCallbacks.indexOf(callback);
            if (index >= 0) this._releasedCallbacks.splice(index, 1);
        };
    }

    // Private: Dependency Extraction

    /**
     * @zh 从场景数据提取所有 UUID 依赖
     * @en Extract all UUID dependencies from scene data
     */
    private extractDependencies(sceneData: unknown): Set<string> {
        const dependencies = new Set<string>();

        const traverse = (obj: unknown) => {
            if (!obj || typeof obj !== 'object') return;

            if (Array.isArray(obj)) {
                for (const item of obj) {
                    traverse(item);
                }
                return;
            }

            const record = obj as Record<string, unknown>;

            // Check for __uuid__ reference
            if (typeof record.__uuid__ === 'string') {
                dependencies.add(record.__uuid__);
            }

            // Recurse into object properties
            for (const value of Object.values(record)) {
                traverse(value);
            }
        };

        traverse(sceneData);
        return dependencies;
    }

    // Private: Scanning

    private async scanAssetsFolder(): Promise<void> {
        if (!this._projectPath || this._isScanning) return;

        this._isScanning = true;
        const assetsPath = `${this._projectPath}/assets`;

        try {
            await this.scanDirectory(assetsPath);

            if (!this._builtinAssetsScanned) {
                await this.scanBuiltinAssets();
                this._builtinAssetsScanned = true;
            }

        } catch (error) {
            console.error('[AssetService] Failed to scan assets:', error);
        } finally {
            this._isScanning = false;
        }
    }

    private async scanDirectory(dirPath: string): Promise<void> {
        let entries: DirectoryEntry[];
        try {
            entries = await invoke<DirectoryEntry[]>('list_directory', { path: dirPath });
        } catch {
            return;
        }

        for (const entry of entries) {
            if (entry.is_dir) {
                await this.scanDirectory(entry.path);
            } else if (entry.name.endsWith('.meta')) {
                await this.parseMetaFile(entry.path, false);
            }
        }
    }

    private async scanBuiltinAssets(): Promise<void> {
        // Scan ccesengine default UI assets
        const defaultUIAssets = [
            'default_btn_disabled.png', 'default_btn_normal.png', 'default_btn_pressed.png',
            'default_editbox_bg.png', 'default_panel.png', 'default_progressbar.png',
            'default_progressbar_bg.png', 'default_sprite.png', 'default_sprite_splash.png',
        ];

        for (const assetName of defaultUIAssets) {
            const metaUrl = `/ccesengine/assets/default_ui/${assetName}.meta`;
            const sourcePath = `/ccesengine/assets/default_ui/${assetName}`;

            try {
                const response = await fetch(metaUrl);
                if (response.ok) {
                    const meta = await response.json() as MetaFile;
                    this.indexMetaFile(meta, sourcePath, metaUrl, true);
                }
            } catch {
                // Silently ignore
            }
        }

        // Scan engine editor assets (skybox, etc.)
        await this.scanEngineEditorAssets();
    }

    /**
     * @zh 扫描引擎编辑器资源（从 /engine-assets/ 端点）
     * @en Scan engine editor assets (from /engine-assets/ endpoint)
     */
    private async scanEngineEditorAssets(): Promise<void> {
        // Known engine editor asset directories and files
        const engineAssets = [
            { dir: 'default_skybox', files: ['default_skybox.hdr', 'default_skybox.png'] },
        ];

        let scannedCount = 0;
        let failedCount = 0;


        for (const { dir, files } of engineAssets) {
            for (const fileName of files) {
                const metaUrl = `/engine-assets/${dir}/${fileName}.meta`;
                const sourcePath = `/engine-assets/${dir}/${fileName}`;

                try {
                    const response = await fetch(metaUrl);
                    if (response.ok) {
                        const meta = await response.json() as MetaFile;
                        this.indexMetaFile(meta, sourcePath, metaUrl, true);
                        scannedCount++;

                        // Log sub-assets found
                        if (meta.subMetas) {
                            const subCount = Object.keys(meta.subMetas).length;
                        }
                    } else {
                        failedCount++;
                    }
                } catch (err) {
                    failedCount++;
                }
            }
        }

    }

    private async parseMetaFile(metaPath: string, isBuiltin: boolean): Promise<void> {
        try {
            const content = await invoke<string>('read_file_content', { path: metaPath });
            const meta = JSON.parse(content) as MetaFile;
            const sourcePath = metaPath.replace(/\.meta$/, '');
            this.indexMetaFile(meta, sourcePath, metaPath, isBuiltin);
        } catch {
            // Silently ignore parse errors
        }
    }

    private indexMetaFile(meta: MetaFile, sourcePath: string, metaPath: string, isBuiltin: boolean): void {
        const assetType = this.getAssetType(meta.importer);

        const assetInfo: AssetInfo = {
            uuid: meta.uuid,
            type: assetType,
            sourcePath,
            metaPath,
            isBuiltin,
            subAssets: new Map(),
        };

        // Register UUID to path mapping
        this._uuidToPath.set(meta.uuid, sourcePath);

        // Index sub-assets recursively
        if (meta.subMetas) {
            this.indexSubMetas(meta.subMetas, meta.uuid, sourcePath, assetInfo.subAssets);
        }

        this._assetIndex.set(meta.uuid, assetInfo);
    }

    /**
     * @zh 递归索引子资源元数据
     * @en Recursively index sub-asset metadata
     */
    private indexSubMetas(
        subMetas: Record<string, MetaSubAsset>,
        parentUuid: string,
        sourcePath: string,
        subAssetsMap: Map<string, SubAssetInfo>
    ): void {
        for (const [id, subMeta] of Object.entries(subMetas)) {
            const subType = this.getSubAssetType(subMeta.importer);

            const subInfo: SubAssetInfo = {
                uuid: subMeta.uuid,
                type: subType,
                parentUuid: parentUuid,
                id,
                importer: subMeta.importer,
                userData: subMeta.userData,
            };

            subAssetsMap.set(id, subInfo);

            // Index by full UUID from .meta file
            this._subAssetIndex.set(subMeta.uuid, subInfo);
            this._uuidToPath.set(subMeta.uuid, sourcePath);

            // Also index by combined format (parentUuid@subId) used in scene files
            const combinedUuid = `${parentUuid}@${id}`;
            this._subAssetIndex.set(combinedUuid, subInfo);
            this._uuidToPath.set(combinedUuid, sourcePath);

            // Recursively index nested sub-assets (e.g., TextureCube faces)
            if (subMeta.subMetas && Object.keys(subMeta.subMetas).length > 0) {
                this.indexSubMetas(subMeta.subMetas, subMeta.uuid, sourcePath, subAssetsMap);
            }
        }
    }

    /**
     * @zh 获取子资源类型
     * @en Get sub-asset type
     */
    private getSubAssetType(importer: string): SubAssetInfo['type'] {
        switch (importer) {
            case 'sprite-frame':
                return 'spriteFrame';
            case 'erp-texture-cube':
            case 'texture-cube':
                return 'textureCube';
            case 'texture-cube-face':
                return 'textureCubeFace';
            default:
                return 'texture';
        }
    }

    // Private: Helpers

    private getAssetType(importer: string): AssetType {
        switch (importer) {
            case 'image': return 'image';
            case 'texture': return 'texture';
            case 'sprite-frame': return 'spriteFrame';
            case 'material': return 'material';
            case 'prefab': return 'prefab';
            case 'scene': return 'scene';
            default: return 'other';
        }
    }

    private notifyLoaded(uuid: string, asset: Asset): void {
        for (const cb of this._loadedCallbacks) {
            cb(uuid, asset);
        }
    }

    private notifyReleased(uuid: string): void {
        for (const cb of this._releasedCallbacks) {
            cb(uuid);
        }
    }
}


let instance: AssetServiceImpl | null = null;

/**
 * @zh 获取资源服务单例
 * @en Get asset service singleton
 */
export function getAssetService(): IAssetService {
    if (!instance) {
        instance = new AssetServiceImpl();
    }
    return instance;
}

/**
 * @zh 重置资源服务（仅用于测试）
 * @en Reset asset service (for testing only)
 */
export function resetAssetService(): void {
    instance = null;
}
