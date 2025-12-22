/**
 * FGUI Texture Manager
 *
 * Manages texture loading for FairyGUI.
 * Uses the global IAssetFileLoader for platform-agnostic asset loading.
 *
 * FGUI 纹理管理器
 * 使用全局 IAssetFileLoader 进行平台无关的资产加载
 */

import { getGlobalAssetFileLoader } from '@esengine/asset-system';

/**
 * Texture service interface for engine integration
 * 引擎集成的纹理服务接口
 */
export interface ITextureService {
    /**
     * Load texture from URL/path (e.g., Blob URL)
     * 从 URL/路径加载纹理（如 Blob URL）
     *
     * @param url - URL to load texture from (Blob URL, HTTP URL, etc.)
     * @returns Engine texture ID (may be 0 if async loading)
     */
    loadTextureByPath(url: string): number;

    /**
     * Get texture ID if already loaded
     * 获取已加载的纹理 ID
     *
     * @param url - URL to check
     * @returns Texture ID or undefined if not loaded
     */
    getTextureIdByPath?(url: string): number | undefined;
}

/** Global texture service instance | 全局纹理服务实例 */
let globalTextureService: ITextureService | null = null;

/**
 * Set global texture service
 * 设置全局纹理服务
 */
export function setGlobalTextureService(service: ITextureService | null): void {
    globalTextureService = service;
}

/**
 * Get global texture service
 * 获取全局纹理服务
 */
export function getGlobalTextureService(): ITextureService | null {
    return globalTextureService;
}

/**
 * Texture entry with loading state
 * 带加载状态的纹理条目
 */
interface TextureEntry {
    /** Engine texture ID (0 = not loaded) | 引擎纹理 ID */
    textureId: number;
    /** Loading state | 加载状态 */
    state: 'pending' | 'loading' | 'loaded' | 'error';
    /** Load promise | 加载 Promise */
    promise?: Promise<number>;
}

/**
 * FGUITextureManager
 *
 * Centralized texture management for FairyGUI.
 * Handles loading, caching, and resolution of textures.
 *
 * FairyGUI 的集中纹理管理
 * 处理纹理的加载、缓存和解析
 */
export class FGUITextureManager {
    private static _instance: FGUITextureManager | null = null;

    /** Texture cache: asset path -> texture entry | 纹理缓存 */
    private _cache: Map<string, TextureEntry> = new Map();

    private constructor() {}

    /**
     * Get singleton instance
     * 获取单例实例
     */
    public static getInstance(): FGUITextureManager {
        if (!FGUITextureManager._instance) {
            FGUITextureManager._instance = new FGUITextureManager();
        }
        return FGUITextureManager._instance;
    }

    /**
     * Resolve texture path to engine texture ID
     * 解析纹理路径为引擎纹理 ID
     *
     * This is the main API for FGUIRenderDataProvider.
     * Returns 0 if texture is not yet loaded, triggering async load.
     *
     * @param texturePath - Relative asset path (e.g., "assets/ui/Bag_atlas0.png")
     * @returns Engine texture ID or 0 if pending
     */
    public resolveTexture(texturePath: string): number {
        const entry = this._cache.get(texturePath);

        if (entry) {
            if (entry.state === 'loaded') {
                return entry.textureId;
            }
            // Still loading or error, return 0
            return 0;
        }

        // Start loading
        this._loadTexture(texturePath);
        return 0;
    }

    /**
     * Check if texture is loaded
     * 检查纹理是否已加载
     */
    public isTextureLoaded(texturePath: string): boolean {
        const entry = this._cache.get(texturePath);
        return entry?.state === 'loaded';
    }

    /**
     * Get texture ID if loaded
     * 获取已加载的纹理 ID
     */
    public getTextureId(texturePath: string): number | undefined {
        const entry = this._cache.get(texturePath);
        return entry?.state === 'loaded' ? entry.textureId : undefined;
    }

    /**
     * Preload textures
     * 预加载纹理
     */
    public async preloadTextures(texturePaths: string[]): Promise<void> {
        const promises: Promise<number>[] = [];

        for (const path of texturePaths) {
            const entry = this._cache.get(path);
            if (!entry) {
                promises.push(this._loadTexture(path));
            } else if (entry.promise) {
                promises.push(entry.promise);
            }
        }

        await Promise.all(promises);
    }

    /**
     * Clear texture cache
     * 清除纹理缓存
     */
    public clear(): void {
        this._cache.clear();
    }

    /**
     * Load a single texture
     * 加载单个纹理
     */
    private _loadTexture(texturePath: string): Promise<number> {
        const entry: TextureEntry = {
            textureId: 0,
            state: 'loading'
        };

        entry.promise = this._doLoadTexture(texturePath, entry);
        this._cache.set(texturePath, entry);

        return entry.promise;
    }

    /**
     * Internal texture loading implementation
     * 内部纹理加载实现
     */
    private async _doLoadTexture(texturePath: string, entry: TextureEntry): Promise<number> {
        const assetLoader = getGlobalAssetFileLoader();
        const textureService = getGlobalTextureService();

        if (!assetLoader) {
            console.error('[FGUITextureManager] No global asset file loader available');
            entry.state = 'error';
            return 0;
        }

        if (!textureService) {
            console.error('[FGUITextureManager] No texture service available');
            entry.state = 'error';
            return 0;
        }

        try {
            // Load image via global asset file loader
            // The image.src will be a usable URL (Blob URL in editor, HTTP URL in browser)
            // 通过全局资产文件加载器加载图片
            // image.src 是可用的 URL（编辑器中是 Blob URL，浏览器中是 HTTP URL）
            const image = await assetLoader.loadImage(texturePath);

            // Use the image's src URL to load texture in engine
            // 使用图片的 src URL 在引擎中加载纹理
            const textureId = textureService.loadTextureByPath(image.src);

            if (textureId > 0) {
                entry.textureId = textureId;
                entry.state = 'loaded';
            } else {
                entry.state = 'error';
                console.error(`[FGUITextureManager] Failed to create texture: ${texturePath}`);
            }

            return entry.textureId;
        } catch (err) {
            entry.state = 'error';
            console.error(`[FGUITextureManager] Failed to load texture: ${texturePath}`, err);
            return 0;
        }
    }
}

/**
 * Get global FGUI texture manager instance
 * 获取全局 FGUI 纹理管理器实例
 */
export function getFGUITextureManager(): FGUITextureManager {
    return FGUITextureManager.getInstance();
}

/**
 * Special texture key for white pixel (used for Graph rendering)
 * 白色像素的特殊纹理键（用于 Graph 渲染）
 */
export const WHITE_PIXEL_TEXTURE_KEY = '__fgui_white_pixel__';

/**
 * Create texture resolver function for FGUIRenderDataProvider
 * 创建 FGUIRenderDataProvider 的纹理解析函数
 */
export function createTextureResolver(): (textureId: string | number) => number {
    const manager = getFGUITextureManager();

    return (textureId: string | number): number => {
        if (typeof textureId === 'number') {
            return textureId;
        }

        // Handle special white pixel texture for Graph rendering
        // Engine texture ID 0 is the default white texture
        // 处理用于 Graph 渲染的特殊白色像素纹理
        // 引擎纹理 ID 0 是默认的白色纹理
        if (textureId === WHITE_PIXEL_TEXTURE_KEY) {
            return 0;
        }

        return manager.resolveTexture(textureId);
    };
}
