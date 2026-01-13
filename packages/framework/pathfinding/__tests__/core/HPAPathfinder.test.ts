/**
 * @zh HPA* 分层寻路算法测试
 * @en HPA* Hierarchical Pathfinding Algorithm Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HPAPathfinder, createHPAPathfinder, DEFAULT_HPA_CONFIG } from '../../src/core/HPAPathfinder';
import { GridMap } from '../../src/grid/GridMap';
import { AStarPathfinder } from '../../src/core/AStarPathfinder';

describe('HPAPathfinder', () => {
    let map: GridMap;
    let pathfinder: HPAPathfinder;

    beforeEach(() => {
        map = new GridMap(50, 50, { allowDiagonal: true });
        pathfinder = new HPAPathfinder(map, { clusterSize: 10 });
    });

    // =========================================================================
    // 基础功能测试 | Basic Functionality Tests
    // =========================================================================

    describe('Preprocessing', () => {
        it('should preprocess map into clusters', () => {
            pathfinder.preprocess();
            const stats = pathfinder.getStats();

            expect(stats.clusters).toBe(25);
            expect(stats.entrances).toBeGreaterThan(0);
            expect(stats.abstractNodes).toBeGreaterThan(0);
        });

        it('should auto-preprocess on first findPath call', () => {
            const result = pathfinder.findPath(0, 0, 49, 49);

            expect(result.found).toBe(true);
            const stats = pathfinder.getStats();
            expect(stats.clusters).toBe(25);
        });

        it('should respect custom cluster size', () => {
            const smallClusterPathfinder = new HPAPathfinder(map, { clusterSize: 5 });
            smallClusterPathfinder.preprocess();
            const stats = smallClusterPathfinder.getStats();

            expect(stats.clusters).toBe(100);
        });

        it('should create entrances between adjacent clusters', () => {
            pathfinder.preprocess();
            const stats = pathfinder.getStats();

            expect(stats.entrances).toBeGreaterThan(0);
        });
    });

    // =========================================================================
    // 路径查找测试 | Path Finding Tests
    // =========================================================================

    describe('Path Finding', () => {
        it('should find path within same cluster', () => {
            const result = pathfinder.findPath(1, 1, 8, 8);

            expect(result.found).toBe(true);
            expect(result.path.length).toBeGreaterThan(0);
            expect(result.path[0]).toEqual({ x: 1, y: 1 });
            expect(result.path[result.path.length - 1]).toEqual({ x: 8, y: 8 });
        });

        it('should find path across clusters', () => {
            const result = pathfinder.findPath(0, 0, 49, 49);

            expect(result.found).toBe(true);
            expect(result.path.length).toBeGreaterThan(0);
            expect(result.path[0]).toEqual({ x: 0, y: 0 });
            expect(result.path[result.path.length - 1]).toEqual({ x: 49, y: 49 });
        });

        it('should find path to adjacent cell', () => {
            const result = pathfinder.findPath(25, 25, 26, 26);

            expect(result.found).toBe(true);
            expect(result.path.length).toBe(2);
        });

        it('should return same point path for identical start and end', () => {
            const result = pathfinder.findPath(25, 25, 25, 25);

            expect(result.found).toBe(true);
            expect(result.path.length).toBe(1);
            expect(result.path[0]).toEqual({ x: 25, y: 25 });
            expect(result.cost).toBe(0);
        });

        it('should fail for unwalkable start', () => {
            map.setWalkable(0, 0, false);
            const result = pathfinder.findPath(0, 0, 49, 49);

            expect(result.found).toBe(false);
        });

        it('should fail for unwalkable end', () => {
            map.setWalkable(49, 49, false);
            const result = pathfinder.findPath(0, 0, 49, 49);

            expect(result.found).toBe(false);
        });

        it('should find path around obstacles', () => {
            for (let i = 10; i < 40; i++) {
                map.setWalkable(25, i, false);
            }

            const result = pathfinder.findPath(20, 25, 30, 25);

            expect(result.found).toBe(true);
            expect(result.path.length).toBeGreaterThan(10);
        });
    });

    // =========================================================================
    // 路径质量测试 | Path Quality Tests
    // =========================================================================

    describe('Path Quality', () => {
        it('should find valid continuous path', () => {
            const result = pathfinder.findPath(0, 0, 49, 49);

            expect(result.found).toBe(true);

            for (let i = 1; i < result.path.length; i++) {
                const dx = Math.abs(result.path[i].x - result.path[i - 1].x);
                const dy = Math.abs(result.path[i].y - result.path[i - 1].y);
                expect(dx).toBeLessThanOrEqual(1);
                expect(dy).toBeLessThanOrEqual(1);
                expect(dx + dy).toBeGreaterThan(0);
            }
        });

        it('should have all path points walkable', () => {
            const result = pathfinder.findPath(0, 0, 49, 49);

            expect(result.found).toBe(true);
            for (const point of result.path) {
                expect(map.isWalkable(point.x, point.y)).toBe(true);
            }
        });

        it('should produce similar path cost to A*', () => {
            const astarPathfinder = new AStarPathfinder(map);

            const hpaResult = pathfinder.findPath(0, 0, 49, 49);
            const astarResult = astarPathfinder.findPath(0, 0, 49, 49);

            expect(hpaResult.found).toBe(true);
            expect(astarResult.found).toBe(true);

            const costRatio = hpaResult.cost / astarResult.cost;
            expect(costRatio).toBeGreaterThanOrEqual(0.9);
            expect(costRatio).toBeLessThanOrEqual(1.5);
        });
    });

    // =========================================================================
    // 障碍物和动态更新测试 | Obstacles and Dynamic Update Tests
    // =========================================================================

    describe('Obstacles and Dynamic Updates', () => {
        it('should handle wall obstacles', () => {
            for (let x = 0; x < 50; x++) {
                if (x !== 25) {
                    map.setWalkable(x, 25, false);
                }
            }

            const result = pathfinder.findPath(10, 10, 10, 40);

            expect(result.found).toBe(true);
            expect(result.path.some(p => p.x === 25 && p.y === 25)).toBe(true);
        });

        it('should handle maze-like obstacles', () => {
            for (let x = 5; x < 45; x++) {
                map.setWalkable(x, 15, false);
                map.setWalkable(x, 35, false);
            }
            for (let y = 15; y < 35; y++) {
                map.setWalkable(5, y, false);
                map.setWalkable(45, y, false);
            }
            map.setWalkable(25, 15, true);
            map.setWalkable(25, 35, true);

            const result = pathfinder.findPath(25, 10, 25, 40);

            expect(result.found).toBe(true);
        });

        it('should invalidate on region change', () => {
            pathfinder.preprocess();
            const beforeStats = pathfinder.getStats();
            expect(beforeStats.cacheSize).toBeGreaterThanOrEqual(0);

            pathfinder.notifyRegionChange(0, 0, 10, 10);
            pathfinder.preprocess();

            const afterStats = pathfinder.getStats();
            expect(afterStats.clusters).toBe(25);
        });

        it('should detect obstacle changes via notifyRegionChange', () => {
            pathfinder.preprocess();
            const statsBefore = pathfinder.getStats();
            expect(statsBefore.clusters).toBe(25);

            map.setWalkable(25, 25, false);
            pathfinder.notifyRegionChange(25, 25, 26, 26);

            const result = pathfinder.findPath(20, 20, 30, 30);
            expect(result.found).toBe(true);
        });
    });

    // =========================================================================
    // 清理和状态测试 | Clear and State Tests
    // =========================================================================

    describe('Clear and State', () => {
        it('should clear all state', () => {
            pathfinder.preprocess();
            expect(pathfinder.getStats().clusters).toBe(25);

            pathfinder.clear();
            const stats = pathfinder.getStats();

            expect(stats.clusters).toBe(0);
            expect(stats.entrances).toBe(0);
            expect(stats.abstractNodes).toBe(0);
            expect(stats.cacheSize).toBe(0);
        });

        it('should repreprocess after clear', () => {
            pathfinder.preprocess();
            pathfinder.clear();

            const result = pathfinder.findPath(0, 0, 49, 49);

            expect(result.found).toBe(true);
            expect(pathfinder.getStats().clusters).toBe(25);
        });
    });

    // =========================================================================
    // 配置测试 | Configuration Tests
    // =========================================================================

    describe('Configuration', () => {
        it('should use default config values', () => {
            expect(DEFAULT_HPA_CONFIG.clusterSize).toBe(10);
            expect(DEFAULT_HPA_CONFIG.maxEntranceWidth).toBe(6);
            expect(DEFAULT_HPA_CONFIG.cacheInternalPaths).toBe(true);
        });

        it('should allow custom max entrance width', () => {
            const customPathfinder = new HPAPathfinder(map, {
                clusterSize: 10,
                maxEntranceWidth: 3
            });
            customPathfinder.preprocess();

            const stats = customPathfinder.getStats();
            expect(stats.entrances).toBeGreaterThan(0);
        });

        it('should work without internal path caching', () => {
            const noCachePathfinder = new HPAPathfinder(map, {
                clusterSize: 10,
                cacheInternalPaths: false
            });

            const result = noCachePathfinder.findPath(0, 0, 49, 49);

            expect(result.found).toBe(true);
            expect(noCachePathfinder.getStats().cacheSize).toBe(0);
        });
    });

    // =========================================================================
    // 工厂函数测试 | Factory Function Tests
    // =========================================================================

    describe('Factory Function', () => {
        it('should create pathfinder via factory', () => {
            const factoryPathfinder = createHPAPathfinder(map, { clusterSize: 5 });

            const result = factoryPathfinder.findPath(0, 0, 49, 49);

            expect(result.found).toBe(true);
            expect(factoryPathfinder.getStats().clusters).toBe(100);
        });

        it('should work with default config', () => {
            const factoryPathfinder = createHPAPathfinder(map);

            const result = factoryPathfinder.findPath(0, 0, 25, 25);

            expect(result.found).toBe(true);
        });
    });

    // =========================================================================
    // 边界情况测试 | Edge Cases
    // =========================================================================

    describe('Edge Cases', () => {
        it('should handle small map (smaller than cluster size)', () => {
            const smallMap = new GridMap(8, 8);
            const smallPathfinder = new HPAPathfinder(smallMap, { clusterSize: 10 });

            const result = smallPathfinder.findPath(0, 0, 7, 7);

            expect(result.found).toBe(true);
            expect(smallPathfinder.getStats().clusters).toBe(1);
        });

        it('should handle very large cluster size', () => {
            const largeClusterPathfinder = new HPAPathfinder(map, { clusterSize: 100 });

            const result = largeClusterPathfinder.findPath(0, 0, 49, 49);

            expect(result.found).toBe(true);
            expect(largeClusterPathfinder.getStats().clusters).toBe(1);
        });

        it('should find path along map edges', () => {
            const result1 = pathfinder.findPath(0, 0, 49, 0);
            const result2 = pathfinder.findPath(0, 0, 0, 49);

            expect(result1.found).toBe(true);
            expect(result2.found).toBe(true);
        });

        it('should handle completely blocked start or end', () => {
            map.setWalkable(10, 10, false);

            pathfinder.clear();
            const result = pathfinder.findPath(10, 10, 40, 40);

            expect(result.found).toBe(false);
        });

        it('should handle cluster with partial obstacles', () => {
            for (let x = 15; x < 35; x++) {
                map.setWalkable(x, 20, false);
            }
            map.setWalkable(25, 20, true);

            const result = pathfinder.findPath(25, 15, 25, 25);

            expect(result.found).toBe(true);
        });
    });
});
