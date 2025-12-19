/**
 * High-performance render batcher using Structure of Arrays (SoA) pattern.
 * 使用结构数组 (SoA) 模式的高性能渲染批处理器。
 *
 * Optimizations:
 * 优化：
 * - Pre-allocated typed arrays to avoid per-frame GC
 *   预分配类型数组以避免每帧 GC
 * - SoA layout for cache-friendly access
 *   SoA 布局提供缓存友好的访问
 * - Object pool for SpriteRenderData when interface compatibility is needed
 *   当需要接口兼容性时使用 SpriteRenderData 对象池
 */

import type { SpriteRenderData, MaterialOverrides } from '../types';

/**
 * Default maximum sprites per batch.
 * 默认每批次最大精灵数。
 */
const DEFAULT_MAX_SPRITES = 10000;

/**
 * High-performance render batcher with SoA storage.
 * 使用 SoA 存储的高性能渲染批处理器。
 *
 * @example
 * ```typescript
 * const batcher = new RenderBatcher(10000);
 *
 * // Add sprites using SoA API (fastest) | 使用 SoA API 添加精灵（最快）
 * batcher.addSpriteSoA(x, y, rot, sx, sy, ox, oy, texId, u0, v0, u1, v1, color, matId);
 *
 * // Or use object API for compatibility | 或使用对象 API 以保持兼容性
 * batcher.addSprite(spriteData);
 *
 * // Get typed arrays for submission | 获取类型数组用于提交
 * const { transforms, textureIds, uvs, colors, materialIds, count } = batcher.getBuffers();
 *
 * // At end of frame | 帧结束时
 * batcher.clear();
 * ```
 */
export class RenderBatcher {
    // ===== SoA Buffers (pre-allocated) =====
    // ===== SoA 缓冲区（预分配）=====

    /** Transform data: [x, y, rotation, scaleX, scaleY, originX, originY] per sprite */
    private _transforms: Float32Array;

    /** Texture IDs | 纹理 ID */
    private _textureIds: Uint32Array;

    /** UV coordinates: [u0, v0, u1, v1] per sprite */
    private _uvs: Float32Array;

    /** Packed RGBA colors | 打包的 RGBA 颜色 */
    private _colors: Uint32Array;

    /** Material IDs | 材质 ID */
    private _materialIds: Uint32Array;

    /** Current sprite count | 当前精灵数量 */
    private _count: number = 0;

    /** Maximum sprites capacity | 最大精灵容量 */
    private _capacity: number;

    // ===== Object Pool for SpriteRenderData compatibility =====
    // ===== SpriteRenderData 对象池用于兼容性 =====

    /** Pool of reusable SpriteRenderData objects | 可复用的 SpriteRenderData 对象池 */
    private _spritePool: SpriteRenderData[] = [];

    /** Current pool index | 当前池索引 */
    private _poolIndex: number = 0;

    // ===== Material Overrides Storage =====
    // ===== 材质覆盖存储 =====

    /** Material overrides by sprite index | 按精灵索引存储的材质覆盖 */
    private _materialOverrides: Map<number, MaterialOverrides> = new Map();

    /** Clip rects by sprite index | 按精灵索引存储的裁剪矩形 */
    private _clipRects: Map<number, { x: number; y: number; width: number; height: number }> = new Map();

    /**
     * Create a new render batcher with pre-allocated buffers.
     * 创建具有预分配缓冲区的新渲染批处理器。
     *
     * @param capacity - Maximum sprites (default: 10000) | 最大精灵数（默认：10000）
     */
    constructor(capacity: number = DEFAULT_MAX_SPRITES) {
        this._capacity = capacity;

        // Pre-allocate all buffers | 预分配所有缓冲区
        this._transforms = new Float32Array(capacity * 7);
        this._textureIds = new Uint32Array(capacity);
        this._uvs = new Float32Array(capacity * 4);
        this._colors = new Uint32Array(capacity);
        this._materialIds = new Uint32Array(capacity);

        // Pre-populate object pool | 预填充对象池
        this._initPool();
    }

    /**
     * Initialize the object pool with reusable objects.
     * 使用可复用对象初始化对象池。
     */
    private _initPool(): void {
        // Create a smaller initial pool, expand on demand
        // 创建较小的初始池，按需扩展
        const initialPoolSize = Math.min(1000, this._capacity);
        for (let i = 0; i < initialPoolSize; i++) {
            this._spritePool.push(this._createSpriteData());
        }
    }

    /**
     * Create a new SpriteRenderData object.
     * 创建新的 SpriteRenderData 对象。
     */
    private _createSpriteData(): SpriteRenderData {
        return {
            x: 0,
            y: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            originX: 0.5,
            originY: 0.5,
            textureId: 0,
            uv: [0, 0, 1, 1],
            color: 0xFFFFFFFF,
            materialId: 0
        };
    }

    /**
     * Get a SpriteRenderData object from pool.
     * 从池中获取 SpriteRenderData 对象。
     */
    private _getFromPool(): SpriteRenderData {
        if (this._poolIndex >= this._spritePool.length) {
            // Expand pool | 扩展池
            this._spritePool.push(this._createSpriteData());
        }
        return this._spritePool[this._poolIndex++];
    }

    // ===== High-Performance SoA API =====
    // ===== 高性能 SoA API =====

    /**
     * Add a sprite using direct SoA parameters (fastest method).
     * 使用直接 SoA 参数添加精灵（最快方法）。
     *
     * @returns Sprite index for additional data (overrides, clipRect) | 精灵索引用于附加数据
     */
    addSpriteSoA(
        x: number,
        y: number,
        rotation: number,
        scaleX: number,
        scaleY: number,
        originX: number,
        originY: number,
        textureId: number,
        u0: number,
        v0: number,
        u1: number,
        v1: number,
        color: number,
        materialId: number = 0
    ): number {
        if (this._count >= this._capacity) {
            console.warn('RenderBatcher capacity exceeded | RenderBatcher 容量已满');
            return -1;
        }

        const i = this._count;
        const tOffset = i * 7;
        const uvOffset = i * 4;

        // Write transform data | 写入变换数据
        this._transforms[tOffset] = x;
        this._transforms[tOffset + 1] = y;
        this._transforms[tOffset + 2] = rotation;
        this._transforms[tOffset + 3] = scaleX;
        this._transforms[tOffset + 4] = scaleY;
        this._transforms[tOffset + 5] = originX;
        this._transforms[tOffset + 6] = originY;

        // Write texture ID | 写入纹理 ID
        this._textureIds[i] = textureId;

        // Write UV coordinates | 写入 UV 坐标
        this._uvs[uvOffset] = u0;
        this._uvs[uvOffset + 1] = v0;
        this._uvs[uvOffset + 2] = u1;
        this._uvs[uvOffset + 3] = v1;

        // Write color and material | 写入颜色和材质
        this._colors[i] = color;
        this._materialIds[i] = materialId;

        this._count++;
        return i;
    }

    /**
     * Set material overrides for a sprite.
     * 为精灵设置材质覆盖。
     *
     * @param index - Sprite index from addSpriteSoA | 来自 addSpriteSoA 的精灵索引
     * @param overrides - Material overrides | 材质覆盖
     */
    setMaterialOverrides(index: number, overrides: MaterialOverrides): void {
        if (index >= 0 && index < this._count) {
            this._materialOverrides.set(index, overrides);
        }
    }

    /**
     * Set clip rect for a sprite.
     * 为精灵设置裁剪矩形。
     *
     * @param index - Sprite index from addSpriteSoA | 来自 addSpriteSoA 的精灵索引
     * @param clipRect - Clip rectangle | 裁剪矩形
     */
    setClipRect(index: number, clipRect: { x: number; y: number; width: number; height: number }): void {
        if (index >= 0 && index < this._count) {
            this._clipRects.set(index, clipRect);
        }
    }

    // ===== Object API (for compatibility) =====
    // ===== 对象 API（用于兼容性）=====

    /**
     * Add a sprite using SpriteRenderData object.
     * 使用 SpriteRenderData 对象添加精灵。
     *
     * This method is kept for backward compatibility but internally uses SoA storage.
     * 此方法保留用于向后兼容，但内部使用 SoA 存储。
     *
     * @param sprite - Sprite render data | 精灵渲染数据
     */
    addSprite(sprite: SpriteRenderData): void {
        const index = this.addSpriteSoA(
            sprite.x,
            sprite.y,
            sprite.rotation,
            sprite.scaleX,
            sprite.scaleY,
            sprite.originX,
            sprite.originY,
            sprite.textureId,
            sprite.uv[0],
            sprite.uv[1],
            sprite.uv[2],
            sprite.uv[3],
            sprite.color,
            sprite.materialId ?? 0
        );

        // Store optional data | 存储可选数据
        if (index >= 0) {
            if (sprite.materialOverrides) {
                this._materialOverrides.set(index, sprite.materialOverrides);
            }
            if (sprite.clipRect) {
                this._clipRects.set(index, sprite.clipRect);
            }
        }
    }

    /**
     * Add multiple sprites.
     * 添加多个精灵。
     *
     * @param sprites - Array of sprite render data | 精灵渲染数据数组
     */
    addSprites(sprites: SpriteRenderData[]): void {
        for (let i = 0; i < sprites.length; i++) {
            this.addSprite(sprites[i]);
        }
    }

    // ===== Buffer Access =====
    // ===== 缓冲区访问 =====

    /**
     * Get raw typed array buffers for direct submission to engine.
     * 获取原始类型数组缓冲区以直接提交到引擎。
     *
     * Returns subarray views (zero-copy) for only the used portion.
     * 返回仅已使用部分的 subarray 视图（零拷贝）。
     */
    getBuffers(): {
        transforms: Float32Array;
        textureIds: Uint32Array;
        uvs: Float32Array;
        colors: Uint32Array;
        materialIds: Uint32Array;
        count: number;
    } {
        return {
            transforms: this._transforms.subarray(0, this._count * 7),
            textureIds: this._textureIds.subarray(0, this._count),
            uvs: this._uvs.subarray(0, this._count * 4),
            colors: this._colors.subarray(0, this._count),
            materialIds: this._materialIds.subarray(0, this._count),
            count: this._count
        };
    }

    /**
     * Get sprites as SpriteRenderData array (for legacy compatibility).
     * 获取精灵作为 SpriteRenderData 数组（用于旧版兼容性）。
     *
     * Uses object pool to avoid allocations.
     * 使用对象池以避免分配。
     *
     * @returns Array of sprites from pool | 来自池的精灵数组
     */
    getSprites(): SpriteRenderData[] {
        // Reset pool index to reuse objects | 重置池索引以复用对象
        this._poolIndex = 0;

        const result: SpriteRenderData[] = [];
        for (let i = 0; i < this._count; i++) {
            const sprite = this._getFromPool();
            const tOffset = i * 7;
            const uvOffset = i * 4;

            // Fill from SoA buffers | 从 SoA 缓冲区填充
            sprite.x = this._transforms[tOffset];
            sprite.y = this._transforms[tOffset + 1];
            sprite.rotation = this._transforms[tOffset + 2];
            sprite.scaleX = this._transforms[tOffset + 3];
            sprite.scaleY = this._transforms[tOffset + 4];
            sprite.originX = this._transforms[tOffset + 5];
            sprite.originY = this._transforms[tOffset + 6];

            sprite.textureId = this._textureIds[i];

            sprite.uv[0] = this._uvs[uvOffset];
            sprite.uv[1] = this._uvs[uvOffset + 1];
            sprite.uv[2] = this._uvs[uvOffset + 2];
            sprite.uv[3] = this._uvs[uvOffset + 3];

            sprite.color = this._colors[i];
            sprite.materialId = this._materialIds[i];

            // Attach optional data | 附加可选数据
            sprite.materialOverrides = this._materialOverrides.get(i);
            sprite.clipRect = this._clipRects.get(i);

            result.push(sprite);
        }

        return result;
    }

    // ===== State =====
    // ===== 状态 =====

    /**
     * Get sprite count.
     * 获取精灵数量。
     */
    get count(): number {
        return this._count;
    }

    /**
     * Get capacity.
     * 获取容量。
     */
    get capacity(): number {
        return this._capacity;
    }

    /**
     * Check if batch is empty.
     * 检查批处理是否为空。
     */
    get isEmpty(): boolean {
        return this._count === 0;
    }

    /**
     * Clear all sprites from the batch.
     * 清除批处理中的所有精灵。
     *
     * Does NOT deallocate buffers - they are reused next frame.
     * 不会释放缓冲区 - 它们在下一帧被复用。
     */
    clear(): void {
        this._count = 0;
        this._poolIndex = 0;
        this._materialOverrides.clear();
        this._clipRects.clear();
    }

    /**
     * Check if material overrides exist for any sprite.
     * 检查是否有任何精灵存在材质覆盖。
     */
    hasMaterialOverrides(): boolean {
        return this._materialOverrides.size > 0;
    }

    /**
     * Get material overrides for a sprite index.
     * 获取精灵索引的材质覆盖。
     */
    getMaterialOverrides(index: number): MaterialOverrides | undefined {
        return this._materialOverrides.get(index);
    }

    /**
     * Check if clip rects exist for any sprite.
     * 检查是否有任何精灵存在裁剪矩形。
     */
    hasClipRects(): boolean {
        return this._clipRects.size > 0;
    }

    /**
     * Get clip rect for a sprite index.
     * 获取精灵索引的裁剪矩形。
     */
    getClipRect(index: number): { x: number; y: number; width: number; height: number } | undefined {
        return this._clipRects.get(index);
    }
}
