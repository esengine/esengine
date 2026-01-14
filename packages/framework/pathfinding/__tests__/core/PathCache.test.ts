import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PathCache, createPathCache, DEFAULT_PATH_CACHE_CONFIG } from '../../src/core/PathCache';
import type { IPathResult } from '../../src/core/IPathfinding';

describe('PathCache', () => {
    let cache: PathCache;

    const mockPathResult: IPathResult = {
        found: true,
        path: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 }
        ],
        cost: 4.24,
        nodesSearched: 10
    };

    beforeEach(() => {
        cache = new PathCache();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // =========================================================================
    // 基础功能测试 | Basic Functionality Tests
    // =========================================================================

    describe('basic operations', () => {
        it('should store and retrieve path', () => {
            cache.set(0, 0, 10, 10, mockPathResult, 1);
            const result = cache.get(0, 0, 10, 10, 1);

            expect(result).toEqual(mockPathResult);
        });

        it('should return null for non-existent path', () => {
            const result = cache.get(0, 0, 10, 10, 1);

            expect(result).toBeNull();
        });

        it('should handle different start/end coordinates', () => {
            cache.set(0, 0, 10, 10, mockPathResult, 1);
            cache.set(5, 5, 15, 15, { ...mockPathResult, cost: 10 }, 1);

            expect(cache.get(0, 0, 10, 10, 1)?.cost).toBe(4.24);
            expect(cache.get(5, 5, 15, 15, 1)?.cost).toBe(10);
        });

        it('should overwrite existing entry', () => {
            cache.set(0, 0, 10, 10, mockPathResult, 1);
            cache.set(0, 0, 10, 10, { ...mockPathResult, cost: 100 }, 1);

            const result = cache.get(0, 0, 10, 10, 1);
            expect(result?.cost).toBe(100);
        });
    });

    // =========================================================================
    // 地图版本测试 | Map Version Tests
    // =========================================================================

    describe('map version handling', () => {
        it('should invalidate cache on map version change', () => {
            cache.set(0, 0, 10, 10, mockPathResult, 1);

            const resultV1 = cache.get(0, 0, 10, 10, 1);
            expect(resultV1).toEqual(mockPathResult);

            const resultV2 = cache.get(0, 0, 10, 10, 2);
            expect(resultV2).toBeNull();
        });

        it('should keep cache valid for same version', () => {
            cache.set(0, 0, 10, 10, mockPathResult, 5);

            expect(cache.get(0, 0, 10, 10, 5)).toEqual(mockPathResult);
            expect(cache.get(0, 0, 10, 10, 5)).toEqual(mockPathResult);
        });
    });

    // =========================================================================
    // TTL 过期测试 | TTL Expiration Tests
    // =========================================================================

    describe('TTL expiration', () => {
        it('should expire cache after TTL', () => {
            const cacheWithTTL = new PathCache({ ttlMs: 1000 });
            cacheWithTTL.set(0, 0, 10, 10, mockPathResult, 1);

            expect(cacheWithTTL.get(0, 0, 10, 10, 1)).toEqual(mockPathResult);

            vi.advanceTimersByTime(1500);

            expect(cacheWithTTL.get(0, 0, 10, 10, 1)).toBeNull();
        });

        it('should keep cache valid before TTL', () => {
            const cacheWithTTL = new PathCache({ ttlMs: 1000 });
            cacheWithTTL.set(0, 0, 10, 10, mockPathResult, 1);

            vi.advanceTimersByTime(500);

            expect(cacheWithTTL.get(0, 0, 10, 10, 1)).toEqual(mockPathResult);
        });

        it('should not expire when TTL is 0', () => {
            const cacheNoTTL = new PathCache({ ttlMs: 0 });
            cacheNoTTL.set(0, 0, 10, 10, mockPathResult, 1);

            vi.advanceTimersByTime(100000);

            expect(cacheNoTTL.get(0, 0, 10, 10, 1)).toEqual(mockPathResult);
        });

        it('should cleanup expired entries', () => {
            const cacheWithTTL = new PathCache({ ttlMs: 1000 });
            cacheWithTTL.set(0, 0, 10, 10, mockPathResult, 1);
            cacheWithTTL.set(5, 5, 15, 15, mockPathResult, 1);

            expect(cacheWithTTL.getStats().size).toBe(2);

            vi.advanceTimersByTime(1500);
            cacheWithTTL.cleanup();

            expect(cacheWithTTL.getStats().size).toBe(0);
        });
    });

    // =========================================================================
    // LRU 淘汰测试 | LRU Eviction Tests
    // =========================================================================

    describe('LRU eviction', () => {
        it('should evict LRU entry when max entries reached', () => {
            const smallCache = new PathCache({ maxEntries: 3, ttlMs: 0 });

            smallCache.set(0, 0, 1, 1, mockPathResult, 1);
            smallCache.set(0, 0, 2, 2, mockPathResult, 1);
            smallCache.set(0, 0, 3, 3, mockPathResult, 1);

            expect(smallCache.getStats().size).toBe(3);

            smallCache.set(0, 0, 4, 4, mockPathResult, 1);

            expect(smallCache.getStats().size).toBe(3);
            expect(smallCache.get(0, 0, 1, 1, 1)).toBeNull();
            expect(smallCache.get(0, 0, 4, 4, 1)).toEqual(mockPathResult);
        });

        it('should update access order on get', () => {
            const smallCache = new PathCache({ maxEntries: 3, ttlMs: 0 });

            smallCache.set(0, 0, 1, 1, mockPathResult, 1);
            smallCache.set(0, 0, 2, 2, mockPathResult, 1);
            smallCache.set(0, 0, 3, 3, mockPathResult, 1);

            smallCache.get(0, 0, 1, 1, 1);

            smallCache.set(0, 0, 4, 4, mockPathResult, 1);

            expect(smallCache.get(0, 0, 1, 1, 1)).toEqual(mockPathResult);
            expect(smallCache.get(0, 0, 2, 2, 1)).toBeNull();
        });
    });

    // =========================================================================
    // 区域失效测试 | Region Invalidation Tests
    // =========================================================================

    describe('region invalidation', () => {
        it('should invalidate paths passing through region', () => {
            const pathThrough = {
                found: true,
                path: [
                    { x: 0, y: 0 },
                    { x: 5, y: 5 },
                    { x: 10, y: 10 }
                ],
                cost: 10,
                nodesSearched: 5
            };

            const pathAround = {
                found: true,
                path: [
                    { x: 0, y: 0 },
                    { x: 0, y: 10 },
                    { x: 10, y: 10 }
                ],
                cost: 20,
                nodesSearched: 10
            };

            cache.set(0, 0, 10, 10, pathThrough, 1);
            cache.set(0, 0, 20, 20, pathAround, 1);

            cache.invalidateRegion(4, 4, 6, 6);

            expect(cache.get(0, 0, 10, 10, 1)).toBeNull();
            expect(cache.get(0, 0, 20, 20, 1)).toEqual(pathAround);
        });

        it('should handle empty paths in region invalidation', () => {
            const emptyPath = {
                found: false,
                path: [],
                cost: 0,
                nodesSearched: 100
            };

            cache.set(0, 0, 10, 10, emptyPath, 1);
            cache.invalidateRegion(0, 0, 10, 10);

            expect(cache.get(0, 0, 10, 10, 1)).toEqual(emptyPath);
        });
    });

    // =========================================================================
    // 全部失效测试 | Invalidate All Tests
    // =========================================================================

    describe('invalidate all', () => {
        it('should clear all entries', () => {
            cache.set(0, 0, 10, 10, mockPathResult, 1);
            cache.set(5, 5, 15, 15, mockPathResult, 1);
            cache.set(10, 10, 20, 20, mockPathResult, 1);

            expect(cache.getStats().size).toBe(3);

            cache.invalidateAll();

            expect(cache.getStats().size).toBe(0);
            expect(cache.get(0, 0, 10, 10, 1)).toBeNull();
        });
    });

    // =========================================================================
    // 近似匹配测试 | Approximate Matching Tests
    // =========================================================================

    describe('approximate matching', () => {
        it('should find approximate match when enabled', () => {
            const approxCache = new PathCache({
                enableApproximateMatch: true,
                approximateRange: 2,
                ttlMs: 0
            });

            approxCache.set(10, 10, 20, 20, mockPathResult, 1);

            const result = approxCache.get(11, 11, 21, 21, 1);
            expect(result).not.toBeNull();
            expect(result?.found).toBe(true);
        });

        it('should not find match outside range', () => {
            const approxCache = new PathCache({
                enableApproximateMatch: true,
                approximateRange: 2,
                ttlMs: 0
            });

            approxCache.set(10, 10, 20, 20, mockPathResult, 1);

            const result = approxCache.get(15, 15, 25, 25, 1);
            expect(result).toBeNull();
        });

        it('should not use approximate matching when disabled', () => {
            const exactCache = new PathCache({
                enableApproximateMatch: false,
                ttlMs: 0
            });

            exactCache.set(10, 10, 20, 20, mockPathResult, 1);

            const result = exactCache.get(11, 11, 21, 21, 1);
            expect(result).toBeNull();
        });
    });

    // =========================================================================
    // 统计信息测试 | Statistics Tests
    // =========================================================================

    describe('statistics', () => {
        it('should return correct stats', () => {
            const customCache = new PathCache({ maxEntries: 500 });

            expect(customCache.getStats()).toEqual({
                size: 0,
                maxSize: 500
            });

            customCache.set(0, 0, 10, 10, mockPathResult, 1);
            customCache.set(5, 5, 15, 15, mockPathResult, 1);

            expect(customCache.getStats()).toEqual({
                size: 2,
                maxSize: 500
            });
        });
    });

    // =========================================================================
    // 工厂函数测试 | Factory Function Tests
    // =========================================================================

    describe('factory function', () => {
        it('should create cache with createPathCache', () => {
            const factoryCache = createPathCache({ maxEntries: 100 });

            expect(factoryCache).toBeInstanceOf(PathCache);
            expect(factoryCache.getStats().maxSize).toBe(100);
        });

        it('should use defaults with no config', () => {
            const defaultCache = createPathCache();

            expect(defaultCache.getStats().maxSize).toBe(DEFAULT_PATH_CACHE_CONFIG.maxEntries);
        });
    });

    // =========================================================================
    // 默认配置测试 | Default Config Tests
    // =========================================================================

    describe('default config', () => {
        it('should have reasonable defaults', () => {
            expect(DEFAULT_PATH_CACHE_CONFIG.maxEntries).toBe(1000);
            expect(DEFAULT_PATH_CACHE_CONFIG.ttlMs).toBe(5000);
            expect(DEFAULT_PATH_CACHE_CONFIG.enableApproximateMatch).toBe(false);
            expect(DEFAULT_PATH_CACHE_CONFIG.approximateRange).toBe(2);
        });
    });
});
