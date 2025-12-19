/**
 * Bin Packing Algorithm for Dynamic Atlas
 * 动态图集的矩形打包算法
 *
 * Implements the MaxRects algorithm for efficiently packing rectangles
 * into a larger texture atlas.
 * 实现 MaxRects 算法，高效地将矩形打包到更大的纹理图集中。
 */

/**
 * A rectangle region within the atlas
 * 图集内的矩形区域
 */
export interface PackedRect {
    /** X position in atlas | 图集中的X位置 */
    x: number;
    /** Y position in atlas | 图集中的Y位置 */
    y: number;
    /** Width of the packed rectangle | 打包矩形的宽度 */
    width: number;
    /** Height of the packed rectangle | 打包矩形的高度 */
    height: number;
}

/**
 * MaxRects Bin Packer
 * MaxRects 矩形打包器
 *
 * Uses the MaxRects algorithm with Best Short Side Fit heuristic
 * to pack rectangles into a fixed-size bin (atlas texture).
 * 使用带有最佳短边适配启发式的 MaxRects 算法
 * 将矩形打包到固定大小的容器（图集纹理）中。
 */
export class BinPacker {
    /** Atlas width | 图集宽度 */
    private readonly binWidth: number;
    /** Atlas height | 图集高度 */
    private readonly binHeight: number;
    /** Padding between packed rectangles | 打包矩形之间的间距 */
    private readonly padding: number;

    /**
     * List of free rectangles available for packing
     * 可用于打包的空闲矩形列表
     */
    private freeRects: PackedRect[];

    /**
     * Create a new bin packer
     * 创建新的矩形打包器
     *
     * @param width - Bin width (atlas texture width) | 容器宽度（图集纹理宽度）
     * @param height - Bin height (atlas texture height) | 容器高度（图集纹理高度）
     * @param padding - Padding between packed rectangles (default: 1) | 矩形之间的间距（默认：1）
     */
    constructor(width: number, height: number, padding: number = 1) {
        this.binWidth = width;
        this.binHeight = height;
        this.padding = padding;

        // Start with one free rectangle covering the entire bin
        // 从覆盖整个容器的一个空闲矩形开始
        this.freeRects = [{ x: 0, y: 0, width, height }];
    }

    /**
     * Pack a rectangle into the atlas
     * 将矩形打包到图集中
     *
     * @param width - Rectangle width | 矩形宽度
     * @param height - Rectangle height | 矩形高度
     * @returns Packed position, or null if no space available | 打包位置，如果没有可用空间则返回 null
     */
    pack(width: number, height: number): PackedRect | null {
        // Add padding | 添加间距
        const paddedWidth = width + this.padding;
        const paddedHeight = height + this.padding;

        // Find best position using Best Short Side Fit
        // 使用最佳短边适配查找最佳位置
        const bestNode = this.findBestPosition(paddedWidth, paddedHeight);

        if (!bestNode) {
            return null; // No space available | 没有可用空间
        }

        // Place the rectangle | 放置矩形
        const packedRect: PackedRect = {
            x: bestNode.x,
            y: bestNode.y,
            width,
            height
        };

        // Split free rectangles | 分割空闲矩形
        this.splitFreeRects(bestNode.x, bestNode.y, paddedWidth, paddedHeight);

        // Remove redundant free rectangles | 移除冗余的空闲矩形
        this.pruneFreeRects();

        return packedRect;
    }

    /**
     * Find the best position for a rectangle using Best Short Side Fit
     * 使用最佳短边适配查找矩形的最佳位置
     */
    private findBestPosition(width: number, height: number): PackedRect | null {
        let bestNode: PackedRect | null = null;
        let bestShortSideFit = Infinity;
        let bestLongSideFit = Infinity;

        for (const freeRect of this.freeRects) {
            // Check if rectangle fits | 检查矩形是否适合
            if (width <= freeRect.width && height <= freeRect.height) {
                const leftoverHoriz = Math.abs(freeRect.width - width);
                const leftoverVert = Math.abs(freeRect.height - height);
                const shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                const longSideFit = Math.max(leftoverHoriz, leftoverVert);

                if (shortSideFit < bestShortSideFit ||
                    (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
                    bestNode = {
                        x: freeRect.x,
                        y: freeRect.y,
                        width,
                        height
                    };
                    bestShortSideFit = shortSideFit;
                    bestLongSideFit = longSideFit;
                }
            }
        }

        return bestNode;
    }

    /**
     * Split free rectangles after placing a new rectangle
     * 放置新矩形后分割空闲矩形
     */
    private splitFreeRects(x: number, y: number, width: number, height: number): void {
        const newFreeRects: PackedRect[] = [];
        const usedRect: PackedRect = { x, y, width, height };

        for (const freeRect of this.freeRects) {
            // Check if the used rectangle intersects with this free rectangle
            // 检查已使用矩形是否与此空闲矩形相交
            if (!this.intersects(usedRect, freeRect)) {
                newFreeRects.push(freeRect);
                continue;
            }

            // Split the free rectangle into up to 4 new rectangles
            // 将空闲矩形分割成最多4个新矩形

            // Left piece | 左侧部分
            if (usedRect.x > freeRect.x) {
                newFreeRects.push({
                    x: freeRect.x,
                    y: freeRect.y,
                    width: usedRect.x - freeRect.x,
                    height: freeRect.height
                });
            }

            // Right piece | 右侧部分
            if (usedRect.x + usedRect.width < freeRect.x + freeRect.width) {
                newFreeRects.push({
                    x: usedRect.x + usedRect.width,
                    y: freeRect.y,
                    width: freeRect.x + freeRect.width - usedRect.x - usedRect.width,
                    height: freeRect.height
                });
            }

            // Bottom piece | 底部部分
            if (usedRect.y > freeRect.y) {
                newFreeRects.push({
                    x: freeRect.x,
                    y: freeRect.y,
                    width: freeRect.width,
                    height: usedRect.y - freeRect.y
                });
            }

            // Top piece | 顶部部分
            if (usedRect.y + usedRect.height < freeRect.y + freeRect.height) {
                newFreeRects.push({
                    x: freeRect.x,
                    y: usedRect.y + usedRect.height,
                    width: freeRect.width,
                    height: freeRect.y + freeRect.height - usedRect.y - usedRect.height
                });
            }
        }

        this.freeRects = newFreeRects;
    }

    /**
     * Remove redundant free rectangles (those contained within others)
     * 移除冗余的空闲矩形（被其他矩形包含的）
     */
    private pruneFreeRects(): void {
        const pruned: PackedRect[] = [];

        for (let i = 0; i < this.freeRects.length; i++) {
            let isContained = false;

            for (let j = 0; j < this.freeRects.length; j++) {
                if (i !== j && this.contains(this.freeRects[j], this.freeRects[i])) {
                    isContained = true;
                    break;
                }
            }

            if (!isContained) {
                pruned.push(this.freeRects[i]);
            }
        }

        this.freeRects = pruned;
    }

    /**
     * Check if two rectangles intersect
     * 检查两个矩形是否相交
     */
    private intersects(a: PackedRect, b: PackedRect): boolean {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    /**
     * Check if rectangle a contains rectangle b
     * 检查矩形 a 是否包含矩形 b
     */
    private contains(a: PackedRect, b: PackedRect): boolean {
        return a.x <= b.x &&
               a.y <= b.y &&
               a.x + a.width >= b.x + b.width &&
               a.y + a.height >= b.y + b.height;
    }

    /**
     * Get the current occupancy ratio of the bin
     * 获取容器的当前占用率
     */
    getOccupancy(): number {
        let usedArea = this.binWidth * this.binHeight;

        for (const freeRect of this.freeRects) {
            usedArea -= freeRect.width * freeRect.height;
        }

        return usedArea / (this.binWidth * this.binHeight);
    }

    /**
     * Check if the bin is full (no more space for small allocations)
     * 检查容器是否已满（没有更多空间用于小分配）
     */
    isFull(): boolean {
        // Consider full if we can't fit a 16x16 texture
        // 如果无法容纳 16x16 纹理，则认为已满
        return this.freeRects.length === 0 ||
               this.freeRects.every(r => r.width < 16 || r.height < 16);
    }

    /**
     * Reset the packer to initial state
     * 将打包器重置为初始状态
     */
    reset(): void {
        this.freeRects = [{ x: 0, y: 0, width: this.binWidth, height: this.binHeight }];
    }
}
