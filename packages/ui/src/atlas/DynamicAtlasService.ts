/**
 * Dynamic Atlas Service
 * 动态图集服务
 *
 * Provides automatic texture atlasing for UI elements.
 * 为 UI 元素提供自动纹理图集功能。
 */

import {
    DynamicAtlasManager,
    getDynamicAtlasManager,
    setDynamicAtlasManager,
    type IAtlasEngineBridge,
    type AtlasEntry,
    type DynamicAtlasConfig
} from './DynamicAtlasManager';

/**
 * Texture info for atlas
 * 图集纹理信息
 */
export interface TextureInfo {
    /** Texture GUID | 纹理 GUID */
    guid: string;
    /** Texture URL/path | 纹理 URL/路径 */
    url: string;
    /** Texture width | 纹理宽度 */
    width: number;
    /** Texture height | 纹理高度 */
    height: number;
}

/**
 * Loading state for a texture
 * 纹理加载状态
 */
type TextureLoadState = 'pending' | 'loading' | 'ready' | 'failed' | 'too-large';

/**
 * Dynamic Atlas Service
 * 动态图集服务
 *
 * Manages automatic texture loading and atlasing for UI.
 * 管理 UI 的自动纹理加载和图集化。
 *
 * @example
 * ```typescript
 * // Initialize with engine bridge
 * const service = new DynamicAtlasService(bridge);
 * service.initialize();
 *
 * // Add texture to atlas (async)
 * await service.addTextureFromUrl('texture-guid', 'assets/button.png');
 *
 * // Check if texture is in atlas
 * const entry = service.getAtlasEntry('texture-guid');
 * if (entry) {
 *     // Use atlas texture ID and remapped UV
 * }
 * ```
 */
export class DynamicAtlasService {
    /** Engine bridge for texture operations | 纹理操作的引擎桥接 */
    private bridge: IAtlasEngineBridge;

    /** Atlas manager instance | 图集管理器实例 */
    private atlasManager: DynamicAtlasManager;

    /** Loading states for textures | 纹理加载状态 */
    private loadStates = new Map<string, TextureLoadState>();

    /** Pending load promises | 待处理的加载 Promise */
    private loadPromises = new Map<string, Promise<AtlasEntry | null>>();

    /** Maximum texture size for atlasing (default: 512) | 可加入图集的最大纹理尺寸 */
    private maxTextureSize: number;

    /** Whether the service has been initialized | 服务是否已初始化 */
    private initialized = false;

    /** Canvas for pixel extraction | 用于提取像素的 Canvas */
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;

    /**
     * Create a new dynamic atlas service
     * 创建新的动态图集服务
     *
     * @param bridge - Engine bridge for texture operations | 纹理操作的引擎桥接
     * @param config - Configuration options | 配置选项
     */
    constructor(bridge: IAtlasEngineBridge, config: DynamicAtlasConfig = {}) {
        this.bridge = bridge;
        this.maxTextureSize = config.maxTextureSize ?? 512;
        this.atlasManager = new DynamicAtlasManager(bridge, config);
    }

    /**
     * Initialize the service
     * 初始化服务
     */
    initialize(): void {
        if (this.initialized) return;

        // Set as global atlas manager
        // 设置为全局图集管理器
        setDynamicAtlasManager(this.atlasManager);

        // Create canvas for pixel extraction
        // 创建用于提取像素的 canvas
        if (typeof document !== 'undefined') {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        }

        this.initialized = true;
    }

    /**
     * Add texture to atlas from URL
     * 从 URL 将纹理添加到图集
     *
     * @param textureGuid - Unique identifier for the texture | 纹理的唯一标识符
     * @param url - URL to load the texture from | 加载纹理的 URL
     * @returns Atlas entry if added, null if too large or failed | 如果添加成功返回图集条目，太大或失败返回 null
     */
    async addTextureFromUrl(textureGuid: string, url: string): Promise<AtlasEntry | null> {
        // Check if already processed | 检查是否已处理
        const existingEntry = this.atlasManager.getEntry(textureGuid);
        if (existingEntry) {
            return existingEntry;
        }

        // Check if already loading | 检查是否正在加载
        const existingPromise = this.loadPromises.get(textureGuid);
        if (existingPromise) {
            return existingPromise;
        }

        // Check state | 检查状态
        const state = this.loadStates.get(textureGuid);
        if (state === 'failed' || state === 'too-large') {
            return null;
        }

        // Start loading | 开始加载
        const promise = this.loadAndAddTexture(textureGuid, url);
        this.loadPromises.set(textureGuid, promise);

        try {
            const result = await promise;
            return result;
        } finally {
            this.loadPromises.delete(textureGuid);
        }
    }

    /**
     * Load texture and add to atlas
     * 加载纹理并添加到图集
     */
    private async loadAndAddTexture(textureGuid: string, url: string): Promise<AtlasEntry | null> {
        this.loadStates.set(textureGuid, 'loading');

        try {
            // Load image | 加载图像
            const image = await this.loadImage(url);

            // Check if too large | 检查是否太大
            if (image.width > this.maxTextureSize || image.height > this.maxTextureSize) {
                this.loadStates.set(textureGuid, 'too-large');
                return null;
            }

            // Extract pixel data | 提取像素数据
            const pixels = this.extractPixels(image);
            if (!pixels) {
                this.loadStates.set(textureGuid, 'failed');
                return null;
            }

            // Add to atlas | 添加到图集
            const entry = this.atlasManager.addTexture(textureGuid, pixels, image.width, image.height);

            if (entry) {
                this.loadStates.set(textureGuid, 'ready');
            } else {
                // Atlas might be full | 图集可能已满
                this.loadStates.set(textureGuid, 'failed');
            }

            return entry;
        } catch (error) {
            console.error(`[DynamicAtlasService] Failed to load texture: ${url}`, error);
            this.loadStates.set(textureGuid, 'failed');
            return null;
        }
    }

    /**
     * Load image from URL
     * 从 URL 加载图像
     */
    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous'; // Enable CORS

            image.onload = () => resolve(image);
            image.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));

            image.src = url;
        });
    }

    /**
     * Extract RGBA pixel data from image
     * 从图像提取 RGBA 像素数据
     */
    private extractPixels(image: HTMLImageElement): Uint8Array | null {
        if (!this.canvas || !this.ctx) {
            console.error('[DynamicAtlasService] Canvas not available');
            return null;
        }

        const width = image.width;
        const height = image.height;

        // Resize canvas | 调整 canvas 大小
        this.canvas.width = width;
        this.canvas.height = height;

        // Draw image | 绘制图像
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.drawImage(image, 0, 0);

        // Get pixel data | 获取像素数据
        try {
            const imageData = this.ctx.getImageData(0, 0, width, height);
            return new Uint8Array(imageData.data);
        } catch (e) {
            console.error('[DynamicAtlasService] Failed to get image data (CORS?)', e);
            return null;
        }
    }

    /**
     * Add multiple textures to atlas
     * 批量添加纹理到图集
     *
     * @param textures - Array of texture info | 纹理信息数组
     * @returns Map of GUID to atlas entry | GUID 到图集条目的映射
     */
    async addTexturesBatch(textures: TextureInfo[]): Promise<Map<string, AtlasEntry | null>> {
        const results = new Map<string, AtlasEntry | null>();

        // Load all textures in parallel | 并行加载所有纹理
        const promises = textures.map(async (tex) => {
            const entry = await this.addTextureFromUrl(tex.guid, tex.url);
            results.set(tex.guid, entry);
        });

        await Promise.all(promises);
        return results;
    }

    /**
     * Check if a texture is in the atlas
     * 检查纹理是否在图集中
     */
    hasTexture(textureGuid: string): boolean {
        return this.atlasManager.hasTexture(textureGuid);
    }

    /**
     * Get atlas entry for a texture
     * 获取纹理的图集条目
     */
    getAtlasEntry(textureGuid: string): AtlasEntry | undefined {
        return this.atlasManager.getEntry(textureGuid);
    }

    /**
     * Get loading state for a texture
     * 获取纹理的加载状态
     */
    getLoadState(textureGuid: string): TextureLoadState | undefined {
        return this.loadStates.get(textureGuid);
    }

    /**
     * Get atlas statistics
     * 获取图集统计信息
     */
    getStats(): {
        pageCount: number;
        textureCount: number;
        averageOccupancy: number;
        loadingCount: number;
        failedCount: number;
    } {
        const atlasStats = this.atlasManager.getStats();
        let loadingCount = 0;
        let failedCount = 0;

        for (const state of this.loadStates.values()) {
            if (state === 'loading' || state === 'pending') {
                loadingCount++;
            } else if (state === 'failed') {
                failedCount++;
            }
        }

        return {
            ...atlasStats,
            loadingCount,
            failedCount
        };
    }

    /**
     * Get detailed info for each atlas page (for debugging/visualization)
     * 获取每个图集页面的详细信息（用于调试/可视化）
     */
    getPageDetails(): Array<{
        pageIndex: number;
        textureId: number;
        width: number;
        height: number;
        occupancy: number;
        entries: Array<{
            guid: string;
            entry: {
                atlasId: number;
                region: { x: number; y: number; width: number; height: number };
                originalWidth: number;
                originalHeight: number;
                uv: [number, number, number, number];
            };
        }>;
    }> {
        return this.atlasManager.getPageDetails();
    }

    /**
     * Clear all atlas data
     * 清除所有图集数据
     */
    clear(): void {
        this.atlasManager.clear();
        this.loadStates.clear();
        this.loadPromises.clear();
    }

    /**
     * Dispose the service
     * 释放服务资源
     */
    dispose(): void {
        this.clear();
        this.canvas = null;
        this.ctx = null;
        this.initialized = false;

        // Clear global reference if it's us | 如果是我们则清除全局引用
        if (getDynamicAtlasManager() === this.atlasManager) {
            setDynamicAtlasManager(null);
        }
    }
}

// Global service instance | 全局服务实例
let globalAtlasService: DynamicAtlasService | null = null;

// GUID to path mapping for texture resolution
// 用于纹理解析的 GUID 到路径映射
const guidToPathMap = new Map<string, string>();

/**
 * Register a texture GUID to path mapping
 * 注册纹理 GUID 到路径的映射
 *
 * Call this when loading textures to enable automatic atlas integration.
 * 在加载纹理时调用此函数以启用自动图集集成。
 *
 * @param textureGuid - Texture GUID | 纹理 GUID
 * @param path - Texture URL/path | 纹理 URL/路径
 */
export function registerTexturePathMapping(textureGuid: string, path: string): void {
    guidToPathMap.set(textureGuid, path);
}

/**
 * Get the path for a texture GUID
 * 获取纹理 GUID 的路径
 *
 * @param textureGuid - Texture GUID | 纹理 GUID
 * @returns Texture path or undefined | 纹理路径或 undefined
 */
export function getTexturePathByGuid(textureGuid: string): string | undefined {
    return guidToPathMap.get(textureGuid);
}

/**
 * Clear all texture path mappings
 * 清除所有纹理路径映射
 */
export function clearTexturePathMappings(): void {
    guidToPathMap.clear();
}

/**
 * Get the global dynamic atlas service
 * 获取全局动态图集服务
 */
export function getDynamicAtlasService(): DynamicAtlasService | null {
    return globalAtlasService;
}

/**
 * Set the global dynamic atlas service
 * 设置全局动态图集服务
 */
export function setDynamicAtlasService(service: DynamicAtlasService | null): void {
    globalAtlasService = service;
}

/**
 * Initialize the global dynamic atlas service
 * 初始化全局动态图集服务
 *
 * If the service is already initialized, returns the existing instance.
 * 如果服务已初始化，则返回现有实例。
 *
 * @param bridge - Engine bridge for texture operations | 纹理操作的引擎桥接
 * @param config - Configuration options | 配置选项
 * @returns The initialized service | 初始化的服务
 */
export function initializeDynamicAtlasService(
    bridge: IAtlasEngineBridge,
    config?: DynamicAtlasConfig
): DynamicAtlasService {
    // If already initialized, return existing service
    // 如果已初始化，返回现有服务
    if (globalAtlasService) {
        return globalAtlasService;
    }

    // Create and initialize new service | 创建并初始化新服务
    globalAtlasService = new DynamicAtlasService(bridge, config);
    globalAtlasService.initialize();

    return globalAtlasService;
}

/**
 * Reinitialize the global dynamic atlas service with new config
 * 使用新配置重新初始化全局动态图集服务
 *
 * This will dispose the existing service and create a new one.
 * Warning: All existing atlas data will be cleared!
 * 这将释放现有服务并创建新服务。
 * 警告：所有现有图集数据将被清除！
 *
 * @param bridge - Engine bridge for texture operations | 纹理操作的引擎桥接
 * @param config - New configuration options | 新的配置选项
 * @returns The reinitialized service | 重新初始化的服务
 */
export function reinitializeDynamicAtlasService(
    bridge: IAtlasEngineBridge,
    config?: DynamicAtlasConfig
): DynamicAtlasService {
    // Dispose existing service if any
    // 如果存在则释放现有服务
    if (globalAtlasService) {
        globalAtlasService.dispose();
        globalAtlasService = null;
    }

    // Create and initialize new service with new config
    // 使用新配置创建并初始化新服务
    globalAtlasService = new DynamicAtlasService(bridge, config);
    globalAtlasService.initialize();

    return globalAtlasService;
}
