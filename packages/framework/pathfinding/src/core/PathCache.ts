/**
 * @zh 路径缓存模块
 * @en Path Cache Module
 *
 * @zh 缓存已计算的路径，避免重复计算相同起点终点的路径
 * @en Cache computed paths to avoid recalculating paths with the same start and end points
 */

import type { IPoint, IPathResult } from './IPathfinding';

// =============================================================================
// 内部类型 | Internal Types
// =============================================================================

/**
 * @zh 缓存条目
 * @en Cache entry
 */
interface ICacheEntry {
    result: IPathResult;
    timestamp: number;
    mapVersion: number;
}

/**
 * @zh 缓存配置
 * @en Cache configuration
 */
export interface IPathCacheConfig {
    /**
     * @zh 最大缓存条目数
     * @en Maximum number of cache entries
     */
    maxEntries: number;

    /**
     * @zh 缓存过期时间（毫秒），0 表示不过期
     * @en Cache expiration time in milliseconds, 0 means no expiration
     */
    ttlMs: number;

    /**
     * @zh 是否启用近似匹配（在一定范围内的起点/终点视为相同）
     * @en Whether to enable approximate matching (start/end within range considered same)
     */
    enableApproximateMatch: boolean;

    /**
     * @zh 近似匹配范围
     * @en Approximate matching range
     */
    approximateRange: number;
}

/**
 * @zh 默认缓存配置
 * @en Default cache configuration
 */
export const DEFAULT_PATH_CACHE_CONFIG: IPathCacheConfig = {
    maxEntries: 1000,
    ttlMs: 5000,
    enableApproximateMatch: false,
    approximateRange: 2
};

// =============================================================================
// 路径缓存 | Path Cache
// =============================================================================

/**
 * @zh 路径缓存
 * @en Path Cache
 *
 * @zh 缓存已计算的路径，支持 LRU 淘汰策略和 TTL 过期
 * @en Cache computed paths with LRU eviction and TTL expiration
 *
 * @example
 * ```typescript
 * const cache = new PathCache({ maxEntries: 500 });
 * const cached = cache.get(0, 0, 10, 10, mapVersion);
 * if (!cached) {
 *     const result = pathfinder.findPath(0, 0, 10, 10);
 *     cache.set(0, 0, 10, 10, result, mapVersion);
 * }
 * ```
 */
export class PathCache {
    private readonly config: IPathCacheConfig;
    private readonly cache: Map<string, ICacheEntry>;
    private readonly accessOrder: string[];

    constructor(config: Partial<IPathCacheConfig> = {}) {
        this.config = { ...DEFAULT_PATH_CACHE_CONFIG, ...config };
        this.cache = new Map();
        this.accessOrder = [];
    }

    /**
     * @zh 获取缓存的路径
     * @en Get cached path
     *
     * @param startX - @zh 起点 X 坐标 @en Start X coordinate
     * @param startY - @zh 起点 Y 坐标 @en Start Y coordinate
     * @param endX - @zh 终点 X 坐标 @en End X coordinate
     * @param endY - @zh 终点 Y 坐标 @en End Y coordinate
     * @param mapVersion - @zh 地图版本号 @en Map version number
     * @returns @zh 缓存的路径结果或 null @en Cached path result or null
     */
    get(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        mapVersion: number
    ): IPathResult | null {
        const key = this.generateKey(startX, startY, endX, endY);
        const entry = this.cache.get(key);

        if (!entry) {
            if (this.config.enableApproximateMatch) {
                return this.getApproximate(startX, startY, endX, endY, mapVersion);
            }
            return null;
        }

        if (!this.isValid(entry, mapVersion)) {
            this.cache.delete(key);
            this.removeFromAccessOrder(key);
            return null;
        }

        this.updateAccessOrder(key);
        return entry.result;
    }

    /**
     * @zh 设置缓存路径
     * @en Set cached path
     *
     * @param startX - @zh 起点 X 坐标 @en Start X coordinate
     * @param startY - @zh 起点 Y 坐标 @en Start Y coordinate
     * @param endX - @zh 终点 X 坐标 @en End X coordinate
     * @param endY - @zh 终点 Y 坐标 @en End Y coordinate
     * @param result - @zh 路径结果 @en Path result
     * @param mapVersion - @zh 地图版本号 @en Map version number
     */
    set(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        result: IPathResult,
        mapVersion: number
    ): void {
        if (this.cache.size >= this.config.maxEntries) {
            this.evictLRU();
        }

        const key = this.generateKey(startX, startY, endX, endY);
        const entry: ICacheEntry = {
            result,
            timestamp: Date.now(),
            mapVersion
        };

        this.cache.set(key, entry);
        this.updateAccessOrder(key);
    }

    /**
     * @zh 使所有缓存失效
     * @en Invalidate all cache
     */
    invalidateAll(): void {
        this.cache.clear();
        this.accessOrder.length = 0;
    }

    /**
     * @zh 使指定区域的缓存失效
     * @en Invalidate cache for specified region
     *
     * @param minX - @zh 最小 X 坐标 @en Minimum X coordinate
     * @param minY - @zh 最小 Y 坐标 @en Minimum Y coordinate
     * @param maxX - @zh 最大 X 坐标 @en Maximum X coordinate
     * @param maxY - @zh 最大 Y 坐标 @en Maximum Y coordinate
     */
    invalidateRegion(minX: number, minY: number, maxX: number, maxY: number): void {
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache) {
            const path = entry.result.path;
            if (path.length === 0) continue;

            for (const point of path) {
                if (point.x >= minX && point.x <= maxX &&
                    point.y >= minY && point.y <= maxY) {
                    keysToDelete.push(key);
                    break;
                }
            }
        }

        for (const key of keysToDelete) {
            this.cache.delete(key);
            this.removeFromAccessOrder(key);
        }
    }

    /**
     * @zh 获取缓存统计信息
     * @en Get cache statistics
     */
    getStats(): { size: number; maxSize: number; hitRate?: number } {
        return {
            size: this.cache.size,
            maxSize: this.config.maxEntries
        };
    }

    /**
     * @zh 清理过期条目
     * @en Clean up expired entries
     */
    cleanup(): void {
        if (this.config.ttlMs === 0) return;

        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache) {
            if (now - entry.timestamp > this.config.ttlMs) {
                keysToDelete.push(key);
            }
        }

        for (const key of keysToDelete) {
            this.cache.delete(key);
            this.removeFromAccessOrder(key);
        }
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    private generateKey(startX: number, startY: number, endX: number, endY: number): string {
        return `${startX},${startY}->${endX},${endY}`;
    }

    private isValid(entry: ICacheEntry, mapVersion: number): boolean {
        if (entry.mapVersion !== mapVersion) {
            return false;
        }

        if (this.config.ttlMs > 0) {
            const age = Date.now() - entry.timestamp;
            if (age > this.config.ttlMs) {
                return false;
            }
        }

        return true;
    }

    private getApproximate(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        mapVersion: number
    ): IPathResult | null {
        const range = this.config.approximateRange;

        for (let sx = startX - range; sx <= startX + range; sx++) {
            for (let sy = startY - range; sy <= startY + range; sy++) {
                for (let ex = endX - range; ex <= endX + range; ex++) {
                    for (let ey = endY - range; ey <= endY + range; ey++) {
                        const key = this.generateKey(sx, sy, ex, ey);
                        const entry = this.cache.get(key);
                        if (entry && this.isValid(entry, mapVersion)) {
                            this.updateAccessOrder(key);
                            return this.adjustPathForApproximate(
                                entry.result,
                                startX, startY, endX, endY
                            );
                        }
                    }
                }
            }
        }

        return null;
    }

    private adjustPathForApproximate(
        result: IPathResult,
        newStartX: number,
        newStartY: number,
        newEndX: number,
        newEndY: number
    ): IPathResult {
        if (result.path.length === 0) {
            return result;
        }

        const newPath: IPoint[] = [];
        const oldStart = result.path[0];
        const oldEnd = result.path[result.path.length - 1];

        if (newStartX !== oldStart.x || newStartY !== oldStart.y) {
            newPath.push({ x: newStartX, y: newStartY });
        }

        newPath.push(...result.path);

        if (newEndX !== oldEnd.x || newEndY !== oldEnd.y) {
            newPath.push({ x: newEndX, y: newEndY });
        }

        return {
            ...result,
            path: newPath
        };
    }

    private updateAccessOrder(key: string): void {
        this.removeFromAccessOrder(key);
        this.accessOrder.push(key);
    }

    private removeFromAccessOrder(key: string): void {
        const index = this.accessOrder.indexOf(key);
        if (index !== -1) {
            this.accessOrder.splice(index, 1);
        }
    }

    private evictLRU(): void {
        const lruKey = this.accessOrder.shift();
        if (lruKey) {
            this.cache.delete(lruKey);
        }
    }
}

// =============================================================================
// 工厂函数 | Factory Function
// =============================================================================

/**
 * @zh 创建路径缓存
 * @en Create path cache
 *
 * @param config - @zh 缓存配置 @en Cache configuration
 * @returns @zh 路径缓存实例 @en Path cache instance
 */
export function createPathCache(config?: Partial<IPathCacheConfig>): PathCache {
    return new PathCache(config);
}
