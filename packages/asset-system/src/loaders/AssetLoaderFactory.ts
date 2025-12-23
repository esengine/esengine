/**
 * Asset loader factory implementation
 * 资产加载器工厂实现
 */

import { AssetType } from '../types/AssetTypes';
import { IAssetLoader, IAssetLoaderFactory } from '../interfaces/IAssetLoader';
import { TextureLoader } from './TextureLoader';
import { JsonLoader } from './JsonLoader';
import { TextLoader } from './TextLoader';
import { BinaryLoader } from './BinaryLoader';
import { AudioLoader } from './AudioLoader';
import { PrefabLoader } from './PrefabLoader';
import { GLTFLoader } from './GLTFLoader';
import { OBJLoader } from './OBJLoader';
import { FBXLoader } from './FBXLoader';

/**
 * Asset loader factory
 * 资产加载器工厂
 *
 * Supports multiple loaders per asset type (selected by file extension).
 * 支持每种资产类型的多个加载器（按文件扩展名选择）。
 */
export class AssetLoaderFactory implements IAssetLoaderFactory {
    private readonly _loaders = new Map<AssetType, IAssetLoader>();

    /** Extension -> Loader map for precise loader selection */
    /** 扩展名 -> 加载器映射，用于精确选择加载器 */
    private readonly _extensionLoaders = new Map<string, IAssetLoader>();

    constructor() {
        // 注册默认加载器 / Register default loaders
        this.registerDefaultLoaders();
    }

    /**
     * Register default loaders
     * 注册默认加载器
     */
    private registerDefaultLoaders(): void {
        // 纹理加载器 / Texture loader
        this._loaders.set(AssetType.Texture, new TextureLoader());

        // JSON加载器 / JSON loader
        this._loaders.set(AssetType.Json, new JsonLoader());

        // 文本加载器 / Text loader
        this._loaders.set(AssetType.Text, new TextLoader());

        // 二进制加载器 / Binary loader
        this._loaders.set(AssetType.Binary, new BinaryLoader());

        // 音频加载器 / Audio loader
        this._loaders.set(AssetType.Audio, new AudioLoader());

        // 预制体加载器 / Prefab loader
        this._loaders.set(AssetType.Prefab, new PrefabLoader());

        // 3D模型加载器 / 3D Model loaders
        // Default is GLTF, but OBJ and FBX are also supported
        // 默认是 GLTF，但也支持 OBJ 和 FBX
        const gltfLoader = new GLTFLoader();
        const objLoader = new OBJLoader();
        const fbxLoader = new FBXLoader();

        this._loaders.set(AssetType.Model3D, gltfLoader);

        // Register extension-specific loaders
        // 注册特定扩展名的加载器
        this.registerExtensionLoader('.gltf', gltfLoader);
        this.registerExtensionLoader('.glb', gltfLoader);
        this.registerExtensionLoader('.obj', objLoader);
        this.registerExtensionLoader('.fbx', fbxLoader);

        // 注：Shader 和 Material 加载器由 material-system 模块注册
        // Note: Shader and Material loaders are registered by material-system module
    }

    /**
     * Register a loader for a specific file extension
     * 为特定文件扩展名注册加载器
     */
    registerExtensionLoader(extension: string, loader: IAssetLoader): void {
        const ext = extension.toLowerCase().startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
        this._extensionLoaders.set(ext, loader);
    }

    /**
     * Create loader for specific asset type
     * 为特定资产类型创建加载器
     */
    createLoader(type: AssetType): IAssetLoader | null {
        return this._loaders.get(type) || null;
    }

    /**
     * Create loader for a specific file path (selects by extension)
     * 为特定文件路径创建加载器（按扩展名选择）
     *
     * This method is preferred over createLoader() when multiple loaders
     * support the same asset type (e.g., Model3D with GLTF/OBJ/FBX).
     * 当多个加载器支持相同资产类型时（如 Model3D 的 GLTF/OBJ/FBX），
     * 优先使用此方法而非 createLoader()。
     */
    createLoaderForPath(path: string): IAssetLoader | null {
        const lastDot = path.lastIndexOf('.');
        if (lastDot !== -1) {
            const ext = path.substring(lastDot).toLowerCase();

            // First try extension-specific loader
            // 首先尝试特定扩展名的加载器
            const extLoader = this._extensionLoaders.get(ext);
            if (extLoader) {
                return extLoader;
            }
        }

        // Fall back to type-based lookup
        // 回退到基于类型的查找
        const type = this.getAssetTypeByPath(path);
        if (type) {
            return this.createLoader(type);
        }

        return null;
    }

    /**
     * Register custom loader
     * 注册自定义加载器
     */
    registerLoader(type: AssetType, loader: IAssetLoader): void {
        this._loaders.set(type, loader);
    }

    /**
     * Unregister loader
     * 注销加载器
     */
    unregisterLoader(type: AssetType): void {
        this._loaders.delete(type);
    }

    /**
     * Check if loader exists for type
     * 检查类型是否有加载器
     */
    hasLoader(type: AssetType): boolean {
        return this._loaders.has(type);
    }

    /**
     * Get asset type by file extension
     * 根据文件扩展名获取资产类型
     *
     * @param extension - File extension including dot (e.g., '.btree', '.png')
     * @returns Asset type if a loader supports this extension, null otherwise
     */
    getAssetTypeByExtension(extension: string): AssetType | null {
        const ext = extension.toLowerCase();

        // Check extension-specific loaders first
        // 首先检查特定扩展名的加载器
        const extLoader = this._extensionLoaders.get(ext);
        if (extLoader) {
            return extLoader.supportedType;
        }

        // Fall back to type-based loaders
        // 回退到基于类型的加载器
        for (const [type, loader] of this._loaders) {
            if (loader.supportedExtensions.some(e => e.toLowerCase() === ext)) {
                return type;
            }
        }
        return null;
    }

    /**
     * Get asset type by file path
     * 根据文件路径获取资产类型
     *
     * Checks for compound extensions (like .tilemap.json) first, then simple extensions
     *
     * @param path - File path
     * @returns Asset type if a loader supports this file, null otherwise
     */
    getAssetTypeByPath(path: string): AssetType | null {
        const lowerPath = path.toLowerCase();

        // First check compound extensions (e.g., .tilemap.json)
        for (const [type, loader] of this._loaders) {
            for (const ext of loader.supportedExtensions) {
                if (ext.includes('.') && ext.split('.').length > 2) {
                    // This is a compound extension like .tilemap.json
                    if (lowerPath.endsWith(ext.toLowerCase())) {
                        return type;
                    }
                }
            }
        }

        // Then check simple extensions
        const lastDot = path.lastIndexOf('.');
        if (lastDot !== -1) {
            const ext = path.substring(lastDot).toLowerCase();
            return this.getAssetTypeByExtension(ext);
        }

        return null;
    }

    /**
     * Get all registered loaders
     * 获取所有注册的加载器
     */
    getRegisteredTypes(): AssetType[] {
        return Array.from(this._loaders.keys());
    }

    /**
     * Clear all loaders
     * 清空所有加载器
     */
    clear(): void {
        this._loaders.clear();
    }

    /**
     * Get all supported file extensions from all registered loaders.
     * 获取所有注册加载器支持的文件扩展名。
     *
     * @returns Array of extension patterns (e.g., ['*.png', '*.jpg', '*.particle'])
     */
    getAllSupportedExtensions(): string[] {
        const extensions = new Set<string>();

        // From type-based loaders
        // 从基于类型的加载器
        for (const loader of this._loaders.values()) {
            for (const ext of loader.supportedExtensions) {
                const cleanExt = ext.startsWith('.') ? ext.substring(1) : ext;
                extensions.add(`*.${cleanExt}`);
            }
        }

        // From extension-specific loaders
        // 从特定扩展名的加载器
        for (const ext of this._extensionLoaders.keys()) {
            const cleanExt = ext.startsWith('.') ? ext.substring(1) : ext;
            extensions.add(`*.${cleanExt}`);
        }

        return Array.from(extensions);
    }

    /**
     * Get extension to type mapping for all registered loaders.
     * 获取所有注册加载器的扩展名到类型的映射。
     *
     * @returns Map of extension (without dot) to asset type string
     */
    getExtensionTypeMap(): Record<string, string> {
        const map: Record<string, string> = {};

        // From type-based loaders
        // 从基于类型的加载器
        for (const [type, loader] of this._loaders) {
            for (const ext of loader.supportedExtensions) {
                const cleanExt = ext.startsWith('.') ? ext.substring(1) : ext;
                map[cleanExt.toLowerCase()] = type;
            }
        }

        // From extension-specific loaders
        // 从特定扩展名的加载器
        for (const [ext, loader] of this._extensionLoaders) {
            const cleanExt = ext.startsWith('.') ? ext.substring(1) : ext;
            map[cleanExt.toLowerCase()] = loader.supportedType;
        }

        return map;
    }
}
