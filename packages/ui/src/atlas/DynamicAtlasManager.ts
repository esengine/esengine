/**
 * Dynamic Atlas Manager
 * 动态图集管理器
 *
 * Manages runtime texture atlasing to enable batching of UI elements
 * that use different source textures.
 * 管理运行时纹理图集，以启用使用不同源纹理的 UI 元素的合批。
 */

import { BinPacker, PackedRect } from './BinPacker';

/**
 * Atlas expansion strategy
 * 图集扩展策略
 */
export enum AtlasExpansionStrategy {
    /**
     * Dynamic expansion: Start small, expand pages when full (has rebuild cost)
     * 动态扩展：从小尺寸开始，页面满时扩展（有重建开销）
     */
    Dynamic = 'dynamic',
    /**
     * Fixed size: Use fixed page size, create new pages when full (no rebuild)
     * 固定大小：使用固定页面大小，满时创建新页面（无重建）
     */
    Fixed = 'fixed'
}

/**
 * Stored texture data for rebuild during expansion
 * 存储的纹理数据，用于扩展时重建
 */
interface StoredTexture {
    guid: string;
    pixels: Uint8Array;
    width: number;
    height: number;
}

/**
 * Atlas entry storing the mapping from original texture to atlas region
 * 图集条目，存储从原始纹理到图集区域的映射
 */
export interface AtlasEntry {
    /** Atlas texture ID | 图集纹理ID */
    atlasId: number;
    /** Position in atlas | 图集中的位置 */
    region: PackedRect;
    /** Original texture width | 原始纹理宽度 */
    originalWidth: number;
    /** Original texture height | 原始纹理高度 */
    originalHeight: number;
    /** UV coordinates in atlas [u0, v0, u1, v1] | 图集中的UV坐标 */
    uv: [number, number, number, number];
}

/**
 * A single atlas texture with its packer
 * 单个图集纹理及其打包器
 */
interface AtlasPage {
    /** GPU texture ID | GPU纹理ID */
    textureId: number;
    /** Bin packer for this page | 此页面的矩形打包器 */
    packer: BinPacker;
    /** Atlas width | 图集宽度 */
    width: number;
    /** Atlas height | 图集高度 */
    height: number;
}

/**
 * Engine bridge interface for texture operations
 * 纹理操作的引擎桥接接口
 */
export interface IAtlasEngineBridge {
    /** Create a blank texture | 创建空白纹理 */
    createBlankTexture(width: number, height: number): number;
    /** Update a region of a texture | 更新纹理区域 */
    updateTextureRegion(
        id: number,
        x: number,
        y: number,
        width: number,
        height: number,
        pixels: Uint8Array
    ): void;
}

/**
 * Configuration for the dynamic atlas manager
 * 动态图集管理器配置
 */
export interface DynamicAtlasConfig {
    /**
     * Expansion strategy (default: Fixed)
     * 扩展策略（默认：固定）
     *
     * - Dynamic: Start small (initialPageSize), expand when full. Better memory efficiency but has rebuild cost.
     * - Fixed: Use fixedPageSize directly, create new pages when full. No rebuild cost but uses more memory initially.
     *
     * - 动态：从小尺寸开始（initialPageSize），满时扩展。内存效率更高但有重建开销。
     * - 固定：直接使用 fixedPageSize，满时创建新页面。无重建开销但初始内存占用更大。
     */
    expansionStrategy?: AtlasExpansionStrategy;
    /** Initial atlas page size for dynamic mode (default: 256) | 动态模式的初始页面大小（默认：256） */
    initialPageSize?: number;
    /** Fixed atlas page size for fixed mode (default: 1024) | 固定模式的页面大小（默认：1024） */
    fixedPageSize?: number;
    /** Maximum atlas page size (default: 2048) | 最大图集页面大小（默认：2048） */
    maxPageSize?: number;
    /** Maximum number of atlas pages (default: 4) | 最大图集页数（默认：4） */
    maxPages?: number;
    /** Maximum individual texture size to atlas (default: 512) | 可加入图集的最大单个纹理尺寸（默认：512） */
    maxTextureSize?: number;
    /** Padding between textures (default: 1) | 纹理之间的间距（默认：1） */
    padding?: number;
}

/**
 * Dynamic Atlas Manager
 * 动态图集管理器
 *
 * Automatically packs individual textures into larger atlas textures
 * at runtime to enable draw call batching.
 * 在运行时自动将单个纹理打包到更大的图集纹理中，以启用绘制调用合批。
 *
 * @example
 * ```typescript
 * const manager = new DynamicAtlasManager(bridge);
 *
 * // Add texture to atlas
 * const entry = await manager.addTexture('texture-guid', imageData, 64, 64);
 *
 * // Use atlas texture ID and remapped UV for rendering
 * const atlasTextureId = entry.atlasId;
 * const atlasUV = entry.uv;
 * ```
 */
export class DynamicAtlasManager {
    /** Engine bridge for texture operations | 纹理操作的引擎桥接 */
    private bridge: IAtlasEngineBridge;

    /** Atlas configuration | 图集配置 */
    private config: {
        expansionStrategy: AtlasExpansionStrategy;
        initialPageSize: number;
        fixedPageSize: number;
        maxPageSize: number;
        maxPages: number;
        maxTextureSize: number;
        padding: number;
    };

    /** Atlas pages | 图集页面 */
    private pages: AtlasPage[] = [];

    /** Mapping from texture GUID to atlas entry | 纹理GUID到图集条目的映射 */
    private entries: Map<string, AtlasEntry> = new Map();

    /** Stored textures for rebuild during expansion (only used in Dynamic mode) */
    /** 存储的纹理数据，用于扩展时重建（仅在动态模式下使用） */
    private storedTextures: Map<string, StoredTexture> = new Map();

    /** Whether the manager has been initialized | 管理器是否已初始化 */
    private initialized = false;

    /**
     * Create a new dynamic atlas manager
     * 创建新的动态图集管理器
     *
     * @param bridge - Engine bridge for texture operations | 纹理操作的引擎桥接
     * @param config - Configuration options | 配置选项
     */
    constructor(bridge: IAtlasEngineBridge, config: DynamicAtlasConfig = {}) {
        this.bridge = bridge;
        this.config = {
            expansionStrategy: config.expansionStrategy ?? AtlasExpansionStrategy.Fixed,
            initialPageSize: config.initialPageSize ?? 256,
            fixedPageSize: config.fixedPageSize ?? 1024,
            maxPageSize: config.maxPageSize ?? 2048,
            maxPages: config.maxPages ?? 4,
            maxTextureSize: config.maxTextureSize ?? 512,
            padding: config.padding ?? 1
        };
    }

    /**
     * Initialize the atlas manager (creates first atlas page)
     * 初始化图集管理器（创建第一个图集页面）
     */
    initialize(): void {
        if (this.initialized) return;

        // Choose initial page size based on strategy
        // 根据策略选择初始页面大小
        const initialSize = this.config.expansionStrategy === AtlasExpansionStrategy.Dynamic
            ? this.config.initialPageSize
            : this.config.fixedPageSize;

        console.log('[DynamicAtlasManager] Initializing with:', {
            strategy: this.config.expansionStrategy,
            initialPageSize: this.config.initialPageSize,
            fixedPageSize: this.config.fixedPageSize,
            selectedSize: initialSize
        });

        this.createNewPage(initialSize);
        this.initialized = true;
    }

    /**
     * Check if a texture is already in the atlas
     * 检查纹理是否已在图集中
     *
     * @param textureGuid - Texture GUID | 纹理GUID
     */
    hasTexture(textureGuid: string): boolean {
        return this.entries.has(textureGuid);
    }

    /**
     * Get atlas entry for a texture
     * 获取纹理的图集条目
     *
     * @param textureGuid - Texture GUID | 纹理GUID
     */
    getEntry(textureGuid: string): AtlasEntry | undefined {
        return this.entries.get(textureGuid);
    }

    /**
     * Add a texture to the atlas
     * 将纹理添加到图集
     *
     * @param textureGuid - Unique identifier for this texture | 此纹理的唯一标识符
     * @param pixels - RGBA pixel data | RGBA像素数据
     * @param width - Texture width | 纹理宽度
     * @param height - Texture height | 纹理高度
     * @returns Atlas entry with UV mapping, or null if texture too large | 带UV映射的图集条目，如果纹理太大则返回null
     */
    addTexture(
        textureGuid: string,
        pixels: Uint8Array,
        width: number,
        height: number
    ): AtlasEntry | null {
        // Check if already added | 检查是否已添加
        const existing = this.entries.get(textureGuid);
        if (existing) {
            return existing;
        }

        // Check if texture is too large for atlasing
        // 检查纹理是否太大无法加入图集
        if (width > this.config.maxTextureSize || height > this.config.maxTextureSize) {
            return null; // Too large, should use original texture | 太大，应使用原始纹理
        }

        // Ensure initialized | 确保已初始化
        if (!this.initialized) {
            this.initialize();
        }

        // Store texture data for potential rebuild (only in Dynamic mode)
        // 存储纹理数据用于可能的重建（仅在动态模式下）
        if (this.config.expansionStrategy === AtlasExpansionStrategy.Dynamic) {
            this.storedTextures.set(textureGuid, {
                guid: textureGuid,
                pixels: new Uint8Array(pixels), // Clone to avoid external mutation
                width,
                height
            });
        }

        // Try to pack into existing pages
        // 尝试打包到现有页面
        for (const page of this.pages) {
            const region = page.packer.pack(width, height);
            if (region) {
                // Upload to atlas texture | 上传到图集纹理
                this.bridge.updateTextureRegion(
                    page.textureId,
                    region.x,
                    region.y,
                    width,
                    height,
                    pixels
                );

                // Calculate UV coordinates | 计算UV坐标
                const entry = this.createEntry(page, region, width, height);
                this.entries.set(textureGuid, entry);
                return entry;
            }
        }

        // No space in existing pages
        // 现有页面没有空间
        if (this.config.expansionStrategy === AtlasExpansionStrategy.Dynamic) {
            // Dynamic mode: Try to expand existing page first
            // 动态模式：先尝试扩展现有页面
            const expanded = this.tryExpandPage(0); // Try to expand first page
            if (expanded) {
                // Page expanded, try to pack again
                // 页面已扩展，再次尝试打包
                const page = this.pages[0];
                const region = page.packer.pack(width, height);
                if (region) {
                    this.bridge.updateTextureRegion(
                        page.textureId,
                        region.x,
                        region.y,
                        width,
                        height,
                        pixels
                    );
                    const entry = this.createEntry(page, region, width, height);
                    this.entries.set(textureGuid, entry);
                    return entry;
                }
            }
        }

        // Create new page if allowed
        // 如果允许则创建新页面
        if (this.pages.length < this.config.maxPages) {
            // Calculate page size based on strategy
            // 根据策略计算页面大小
            let newPageSize: number;
            if (this.config.expansionStrategy === AtlasExpansionStrategy.Fixed) {
                newPageSize = this.config.fixedPageSize;
            } else {
                // Dynamic mode: start with initial size for new page
                // 动态模式：新页面从初始大小开始
                newPageSize = this.config.initialPageSize;
                while (newPageSize < Math.max(width, height) + this.config.padding * 2) {
                    newPageSize *= 2;
                    if (newPageSize > this.config.maxPageSize) {
                        newPageSize = this.config.maxPageSize;
                        break;
                    }
                }
            }

            const page = this.createNewPage(newPageSize);
            const region = page.packer.pack(width, height);

            if (region) {
                this.bridge.updateTextureRegion(
                    page.textureId,
                    region.x,
                    region.y,
                    width,
                    height,
                    pixels
                );

                const entry = this.createEntry(page, region, width, height);
                this.entries.set(textureGuid, entry);
                return entry;
            }
        }

        // Could not fit texture (all pages full or texture too large)
        // 无法容纳纹理（所有页面已满或纹理太大）
        return null;
    }

    /**
     * Try to expand a page to a larger size (Dynamic mode only)
     * 尝试将页面扩展到更大尺寸（仅动态模式）
     *
     * @param pageIndex - Index of the page to expand | 要扩展的页面索引
     * @returns True if expansion succeeded | 如果扩展成功返回true
     */
    private tryExpandPage(pageIndex: number): boolean {
        const page = this.pages[pageIndex];
        if (!page) return false;

        // Check if already at max size
        // 检查是否已达到最大尺寸
        if (page.width >= this.config.maxPageSize) {
            return false;
        }

        // Calculate new size (double the current size)
        // 计算新尺寸（当前尺寸的两倍）
        const newSize = Math.min(page.width * 2, this.config.maxPageSize);

        // Create new texture
        // 创建新纹理
        const newTextureId = this.bridge.createBlankTexture(newSize, newSize);

        // Create new packer
        // 创建新打包器
        const newPacker = new BinPacker(newSize, newSize, this.config.padding);

        // Collect all textures from this page
        // 收集此页面的所有纹理
        const texturesInPage: StoredTexture[] = [];
        for (const [guid, entry] of this.entries) {
            if (entry.atlasId === page.textureId) {
                const stored = this.storedTextures.get(guid);
                if (stored) {
                    texturesInPage.push(stored);
                }
            }
        }

        // Sort by size (larger first for better packing)
        // 按大小排序（大的优先以获得更好的打包效果）
        texturesInPage.sort((a, b) => (b.width * b.height) - (a.width * a.height));

        // Repack all textures into the new larger page
        // 将所有纹理重新打包到新的更大页面
        const newEntries = new Map<string, AtlasEntry>();
        for (const tex of texturesInPage) {
            const region = newPacker.pack(tex.width, tex.height);
            if (!region) {
                // Failed to repack (shouldn't happen if new size is larger)
                // 重新打包失败（如果新尺寸更大则不应发生）
                return false;
            }

            // Upload texture to new atlas
            // 将纹理上传到新图集
            this.bridge.updateTextureRegion(
                newTextureId,
                region.x,
                region.y,
                tex.width,
                tex.height,
                tex.pixels
            );

            // Calculate new UV coordinates
            // 计算新的UV坐标
            const u0 = region.x / newSize;
            const v0 = region.y / newSize;
            const u1 = (region.x + region.width) / newSize;
            const v1 = (region.y + region.height) / newSize;

            newEntries.set(tex.guid, {
                atlasId: newTextureId,
                region,
                originalWidth: tex.width,
                originalHeight: tex.height,
                uv: [u0, v0, u1, v1]
            });
        }

        // Update page
        // 更新页面
        page.textureId = newTextureId;
        page.packer = newPacker;
        page.width = newSize;
        page.height = newSize;

        // Update entries
        // 更新条目
        for (const [guid, entry] of newEntries) {
            this.entries.set(guid, entry);
        }

        return true;
    }

    /**
     * Create a new atlas page
     * 创建新的图集页面
     *
     * @param size - Page size (default: initialPageSize) | 页面大小（默认：initialPageSize）
     */
    private createNewPage(size?: number): AtlasPage {
        const pageSize = size ?? this.config.initialPageSize;
        const textureId = this.bridge.createBlankTexture(pageSize, pageSize);

        const page: AtlasPage = {
            textureId,
            packer: new BinPacker(pageSize, pageSize, this.config.padding),
            width: pageSize,
            height: pageSize
        };

        this.pages.push(page);
        return page;
    }

    /**
     * Create an atlas entry with UV coordinates
     * 创建带UV坐标的图集条目
     */
    private createEntry(
        page: AtlasPage,
        region: PackedRect,
        originalWidth: number,
        originalHeight: number
    ): AtlasEntry {
        // Calculate normalized UV coordinates | 计算归一化UV坐标
        const u0 = region.x / page.width;
        const v0 = region.y / page.height;
        const u1 = (region.x + region.width) / page.width;
        const v1 = (region.y + region.height) / page.height;

        return {
            atlasId: page.textureId,
            region,
            originalWidth,
            originalHeight,
            uv: [u0, v0, u1, v1]
        };
    }

    /**
     * Remap UV coordinates from original texture space to atlas space
     * 将UV坐标从原始纹理空间重映射到图集空间
     *
     * @param entry - Atlas entry | 图集条目
     * @param originalU0 - Original U0 | 原始U0
     * @param originalV0 - Original V0 | 原始V0
     * @param originalU1 - Original U1 | 原始U1
     * @param originalV1 - Original V1 | 原始V1
     * @returns Remapped UV coordinates [u0, v0, u1, v1] | 重映射的UV坐标
     */
    remapUV(
        entry: AtlasEntry,
        originalU0: number,
        originalV0: number,
        originalU1: number,
        originalV1: number
    ): [number, number, number, number] {
        const [atlasU0, atlasV0, atlasU1, atlasV1] = entry.uv;

        // Calculate the UV range in atlas space | 计算图集空间中的UV范围
        const atlasURange = atlasU1 - atlasU0;
        const atlasVRange = atlasV1 - atlasV0;

        // Remap original UVs to atlas space | 将原始UV重映射到图集空间
        const u0 = atlasU0 + originalU0 * atlasURange;
        const v0 = atlasV0 + originalV0 * atlasVRange;
        const u1 = atlasU0 + originalU1 * atlasURange;
        const v1 = atlasV0 + originalV1 * atlasVRange;

        return [u0, v0, u1, v1];
    }

    /**
     * Get all atlas texture IDs
     * 获取所有图集纹理ID
     */
    getAtlasTextureIds(): number[] {
        return this.pages.map(p => p.textureId);
    }

    /**
     * Get statistics about atlas usage
     * 获取图集使用统计信息
     */
    getStats(): {
        pageCount: number;
        textureCount: number;
        averageOccupancy: number;
    } {
        const occupancies = this.pages.map(p => p.packer.getOccupancy());
        const avgOccupancy = occupancies.length > 0
            ? occupancies.reduce((a, b) => a + b, 0) / occupancies.length
            : 0;

        return {
            pageCount: this.pages.length,
            textureCount: this.entries.size,
            averageOccupancy: avgOccupancy
        };
    }

    /**
     * Get all atlas entries with their GUID
     * 获取所有图集条目及其 GUID
     */
    getAllEntries(): Array<{ guid: string; entry: AtlasEntry }> {
        const result: Array<{ guid: string; entry: AtlasEntry }> = [];
        for (const [guid, entry] of this.entries) {
            result.push({ guid, entry });
        }
        return result;
    }

    /**
     * Get detailed info for each atlas page
     * 获取每个图集页面的详细信息
     */
    getPageDetails(): Array<{
        pageIndex: number;
        textureId: number;
        width: number;
        height: number;
        occupancy: number;
        entries: Array<{ guid: string; entry: AtlasEntry }>;
    }> {
        return this.pages.map((page, index) => {
            // Find all entries in this page
            // 查找此页面中的所有条目
            const pageEntries: Array<{ guid: string; entry: AtlasEntry }> = [];
            for (const [guid, entry] of this.entries) {
                if (entry.atlasId === page.textureId) {
                    pageEntries.push({ guid, entry });
                }
            }

            return {
                pageIndex: index,
                textureId: page.textureId,
                width: page.width,
                height: page.height,
                occupancy: page.packer.getOccupancy(),
                entries: pageEntries
            };
        });
    }

    /**
     * Clear all atlas data and reset
     * 清除所有图集数据并重置
     *
     * Note: This does NOT delete GPU textures. Call this when switching scenes
     * or when textures are no longer needed.
     * 注意：这不会删除GPU纹理。在切换场景或不再需要纹理时调用此方法。
     */
    clear(): void {
        this.entries.clear();
        this.storedTextures.clear();
        this.pages = [];
        this.initialized = false;
    }

    /**
     * Get current expansion strategy
     * 获取当前扩展策略
     */
    getExpansionStrategy(): AtlasExpansionStrategy {
        return this.config.expansionStrategy;
    }
}

// Singleton instance for global access
// 单例实例用于全局访问
let globalAtlasManager: DynamicAtlasManager | null = null;

/**
 * Get the global dynamic atlas manager instance
 * 获取全局动态图集管理器实例
 *
 * @param bridge - Engine bridge (required on first call) | 引擎桥接（首次调用时必需）
 */
export function getDynamicAtlasManager(bridge?: IAtlasEngineBridge): DynamicAtlasManager | null {
    if (!globalAtlasManager && bridge) {
        globalAtlasManager = new DynamicAtlasManager(bridge);
    }
    return globalAtlasManager;
}

/**
 * Set the global dynamic atlas manager instance
 * 设置全局动态图集管理器实例
 */
export function setDynamicAtlasManager(manager: DynamicAtlasManager | null): void {
    globalAtlasManager = manager;
}
