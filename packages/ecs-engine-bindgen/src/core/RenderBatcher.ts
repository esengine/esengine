/**
 * Render batcher for collecting sprite data.
 * 用于收集精灵数据的渲染批处理器。
 */

import type { SpriteRenderData } from '../types';

/**
 * Collects and sorts sprite render data for batch submission.
 * 收集和排序精灵渲染数据用于批量提交。
 *
 * This class is used to collect sprites during the ECS update loop
 * and then submit them all at once to the engine.
 * 此类用于在ECS更新循环中收集精灵，然后一次性提交到引擎。
 *
 * @example
 * ```typescript
 * const batcher = new RenderBatcher();
 *
 * // During ECS update | 在ECS更新期间
 * batcher.addSprite({
 *     x: 100, y: 200,
 *     rotation: 0,
 *     scaleX: 1, scaleY: 1,
 *     originX: 0.5, originY: 0.5,
 *     textureId: 1,
 *     uv: [0, 0, 1, 1],
 *     color: 0xFFFFFFFF
 * });
 *
 * // At end of frame | 在帧结束时
 * bridge.submitSprites(batcher.getSprites());
 * batcher.clear();
 * ```
 */
export class RenderBatcher {
    private sprites: SpriteRenderData[] = [];

    /**
     * Create a new render batcher.
     * 创建新的渲染批处理器。
     *
     * Sprites are stored in insertion order. The caller is responsible
     * for adding sprites in the correct render order (back-to-front for 2D).
     * 精灵按插入顺序存储。调用者负责以正确的渲染顺序添加精灵（2D 中从后到前）。
     */
    constructor() {}

    /**
     * Add a sprite to the batch.
     * 将精灵添加到批处理。
     *
     * @param sprite - Sprite render data | 精灵渲染数据
     */
    addSprite(sprite: SpriteRenderData): void {
        this.sprites.push(sprite);
    }

    /**
     * Add multiple sprites to the batch.
     * 将多个精灵添加到批处理。
     *
     * @param sprites - Array of sprite render data | 精灵渲染数据数组
     */
    addSprites(sprites: SpriteRenderData[]): void {
        this.sprites.push(...sprites);
    }

    /**
     * Get all sprites in the batch.
     * 获取批处理中的所有精灵。
     *
     * Sprites are returned in insertion order to preserve z-ordering.
     * The rendering system is responsible for sorting sprites before adding them.
     * 精灵按插入顺序返回以保持 z 顺序。
     * 渲染系统负责在添加精灵前对其进行排序。
     *
     * @returns Array of sprites in insertion order | 按插入顺序排列的精灵数组
     */
    getSprites(): SpriteRenderData[] {
        // NOTE: Previously sorted by materialId/textureId for batching optimization,
        // but this broke z-ordering for UI elements where render order is critical.
        // Sprites should be added in the correct render order by the caller.
        // 注意：之前按 materialId/textureId 排序以优化批处理，
        // 但这破坏了 UI 元素的 z 排序，而 UI 的渲染顺序至关重要。
        // 调用者应该以正确的渲染顺序添加精灵。
        return this.sprites;
    }

    /**
     * Get sprite count.
     * 获取精灵数量。
     */
    get count(): number {
        return this.sprites.length;
    }

    /**
     * Clear all sprites from the batch.
     * 清除批处理中的所有精灵。
     */
    clear(): void {
        this.sprites.length = 0;
    }

    /**
     * Check if batch is empty.
     * 检查批处理是否为空。
     */
    get isEmpty(): boolean {
        return this.sprites.length === 0;
    }
}
