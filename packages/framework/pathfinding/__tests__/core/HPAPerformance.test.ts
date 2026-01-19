/**
 * HPA* 性能测试
 */

import { describe, it, expect } from 'vitest';
import { HPAPathfinder } from '../../src/core/HPAPathfinder';
import { AStarPathfinder } from '../../src/core/AStarPathfinder';
import { GridMap } from '../../src/grid/GridMap';

describe('HPA* Performance', () => {
    it('should compare HPA* vs A* on huge map (1000x650)', () => {
        const width = 1000;
        const height = 650;
        const map = new GridMap(width, height, { allowDiagonal: true });

        // 生成 15% 障碍物
        const obstacleRate = 0.15;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.random() < obstacleRate) {
                    map.setWalkable(x, y, false);
                }
            }
        }

        // 确保起点终点可走
        const startX = 10, startY = 10;
        const endX = width - 10, endY = height - 10;
        map.setWalkable(startX, startY, true);
        map.setWalkable(endX, endY, true);

        console.log(`\nMap size: ${width}x${height} = ${(width * height / 1000).toFixed(0)}K cells`);

        // 增大 maxNodes 限制
        const opts = { maxNodes: width * height };

        // A* 测试
        const astar = new AStarPathfinder(map);
        const astarStart = performance.now();
        const astarResult = astar.findPath(startX, startY, endX, endY, opts);
        const astarTime = performance.now() - astarStart;

        console.log(`A*: ${astarTime.toFixed(2)}ms, nodes: ${astarResult.nodesSearched}, path: ${astarResult.path.length}`);

        // HPA* 测试 - 使用默认配置 (clusterSize=32)
        const hpa = new HPAPathfinder(map);

        const prepStart = performance.now();
        hpa.preprocess();
        const prepTime = performance.now() - prepStart;

        const stats = hpa.getStats();
        console.log(`HPA* prep: ${prepTime.toFixed(2)}ms, clusters: ${stats.clusters}, nodes: ${stats.abstractNodes}, cache: ${stats.cacheSize}`);

        // 多次查询测试（第一次会有缓存开销）
        const hpaStart = performance.now();
        const hpaResult = hpa.findPath(startX, startY, endX, endY, opts);
        const hpaTime = performance.now() - hpaStart;

        // 第二次查询（可能更快）
        const hpaStart2 = performance.now();
        const hpaResult2 = hpa.findPath(startX, startY, endX, endY, opts);
        const hpaTime2 = performance.now() - hpaStart2;

        console.log(`HPA* find: ${hpaTime.toFixed(2)}ms (2nd: ${hpaTime2.toFixed(2)}ms), nodes: ${hpaResult.nodesSearched}, path: ${hpaResult.path.length}`);
        console.log(`Speedup: ${(astarTime / hpaTime).toFixed(2)}x (query only)`);

        expect(astarResult.found).toBe(true);
        expect(hpaResult.found).toBe(true);
    });

    it('should test cluster internal path caching overhead', () => {
        const width = 100;
        const height = 100;
        const map = new GridMap(width, height, { allowDiagonal: true });

        const hpa = new HPAPathfinder(map, { clusterSize: 20 });

        const prepStart = performance.now();
        hpa.preprocess();
        const prepTime = performance.now() - prepStart;

        const stats = hpa.getStats();
        console.log(`\n100x100 map prep: ${prepTime.toFixed(2)}ms`);
        console.log(`Clusters: ${stats.clusters}, Abstract nodes: ${stats.abstractNodes}, Cache size: ${stats.cacheSize}`);

        // 每个 cluster 的入口对数量
        const nodesPerCluster = stats.abstractNodes / stats.clusters;
        const pairsPerCluster = (nodesPerCluster * (nodesPerCluster - 1)) / 2;
        console.log(`Avg nodes/cluster: ${nodesPerCluster.toFixed(1)}, pairs/cluster: ${pairsPerCluster.toFixed(1)}`);
    });
});
