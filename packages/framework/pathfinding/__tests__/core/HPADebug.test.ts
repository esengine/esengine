/**
 * HPA* 调试测试
 */
import { describe, it, expect } from 'vitest';
import { HPAPathfinder } from '../../src/core/HPAPathfinder';
import { AStarPathfinder } from '../../src/core/AStarPathfinder';
import { GridMap } from '../../src/grid/GridMap';

describe('HPA* Debug', () => {
    it('should produce straight path on open map', () => {
        // 创建一个无障碍的 200x200 地图
        const map = new GridMap(200, 200, { allowDiagonal: true });

        console.log('\n=== Open Map Path Test (should be nearly straight) ===');

        // A* 基准 - 直线路径
        const astar = new AStarPathfinder(map);
        const astarResult = astar.findPath(10, 100, 190, 100, { maxNodes: 100000 });
        console.log(`A* path length: ${astarResult.path.length}, cost: ${astarResult.cost.toFixed(2)}`);

        // HPA* - 应该也接近直线
        const hpa = new HPAPathfinder(map, {
            clusterSize: 40,
            maxEntranceWidth: 16,  // 默认值
            entranceStrategy: 'end'
        });
        hpa.preprocess();
        const stats = hpa.getStats();
        console.log(`Clusters: ${stats.clusters}, Entrances: ${stats.entrances}, Nodes: ${stats.abstractNodes}`);

        const hpaResult = hpa.findPath(10, 100, 190, 100, { maxNodes: 100000 });
        console.log(`HPA* path length: ${hpaResult.path.length}, cost: ${hpaResult.cost.toFixed(2)}`);

        // 打印路径的关键点
        console.log('\nHPA* path sample points (should stay near y=100):');
        for (let i = 0; i < hpaResult.path.length; i += Math.max(1, Math.floor(hpaResult.path.length / 10))) {
            const p = hpaResult.path[i];
            const yDeviation = Math.abs(p.y - 100);
            console.log(`  [${i}]: (${p.x}, ${p.y}) - y deviation: ${yDeviation}`);
        }

        const ratio = hpaResult.path.length / astarResult.path.length;
        console.log(`\nHPA*/A* ratio: ${ratio.toFixed(3)}`);

        // 检查 y 偏差 - 开放地图上应该几乎是直线
        let maxYDeviation = 0;
        for (const p of hpaResult.path) {
            maxYDeviation = Math.max(maxYDeviation, Math.abs(p.y - 100));
        }
        console.log(`Max Y deviation from straight line: ${maxYDeviation}`);

        expect(astarResult.found).toBe(true);
        expect(hpaResult.found).toBe(true);
        // 路径不应该偏离太多
        expect(maxYDeviation).toBeLessThan(50);  // 允许一些偏差，因为要经过入口节点
    });

    it('should find path on simple 1000x1000 map', () => {
        const map = new GridMap(1000, 1000, { allowDiagonal: true });

        // 无障碍
        const hpa = new HPAPathfinder(map, { clusterSize: 100 });

        console.log('\n--- Preprocessing ---');
        const t0 = performance.now();
        hpa.preprocess();
        console.log(`Prep time: ${(performance.now() - t0).toFixed(2)}ms`);

        const stats = hpa.getStats();
        console.log(`Clusters: ${stats.clusters}`);
        console.log(`Abstract nodes: ${stats.abstractNodes}`);
        console.log(`Cache size: ${stats.cacheSize}`);

        console.log('\n--- A* ---');
        const astar = new AStarPathfinder(map);
        const t1 = performance.now();
        const astarResult = astar.findPath(10, 10, 990, 990, { maxNodes: 2000000 });
        console.log(`A* time: ${(performance.now() - t1).toFixed(2)}ms`);
        console.log(`A* found: ${astarResult.found}, path: ${astarResult.path.length}`);

        console.log('\n--- HPA* ---');
        const t2 = performance.now();
        const hpaResult = hpa.findPath(10, 10, 990, 990, { maxNodes: 2000000 });
        console.log(`HPA* time: ${(performance.now() - t2).toFixed(2)}ms`);
        console.log(`HPA* found: ${hpaResult.found}, path: ${hpaResult.path.length}`);

        expect(astarResult.found).toBe(true);
        expect(hpaResult.found).toBe(true);

        // 路径应该差不多
        if (hpaResult.found && astarResult.found) {
            const ratio = hpaResult.path.length / astarResult.path.length;
            console.log(`Path ratio: ${ratio.toFixed(2)}`);
            expect(ratio).toBeGreaterThan(0.8);
            expect(ratio).toBeLessThan(1.5);
        }
    });

    it('should produce diagonal path similar to A* (demo scenario)', () => {
        // 模拟 demo 场景：100x65 地图，15% 障碍物，对角线路径
        const map = new GridMap(100, 65, { allowDiagonal: true });

        // 随机障碍（固定种子）
        const seed = 12345;
        let rng = seed;
        const random = () => {
            rng = (rng * 1103515245 + 12345) & 0x7fffffff;
            return rng / 0x7fffffff;
        };

        const obstacleRate = 0.15;
        for (let y = 0; y < 65; y++) {
            for (let x = 0; x < 100; x++) {
                if (random() < obstacleRate) {
                    map.setWalkable(x, y, false);
                }
            }
        }

        // 清除起点终点区域
        const clearRadius = 3;
        const startPos = { x: 5, y: 5 };
        const endPos = { x: 94, y: 59 };

        for (let dy = -clearRadius; dy <= clearRadius; dy++) {
            for (let dx = -clearRadius; dx <= clearRadius; dx++) {
                const x1 = startPos.x + dx, y1 = startPos.y + dy;
                const x2 = endPos.x + dx, y2 = endPos.y + dy;
                if (x1 >= 0 && x1 < 100 && y1 >= 0 && y1 < 65) {
                    map.setWalkable(x1, y1, true);
                }
                if (x2 >= 0 && x2 < 100 && y2 >= 0 && y2 < 65) {
                    map.setWalkable(x2, y2, true);
                }
            }
        }

        console.log('\n=== Demo Scenario Test (diagonal with obstacles) ===');

        // A* 基准
        const astar = new AStarPathfinder(map);
        const astarResult = astar.findPath(startPos.x, startPos.y, endPos.x, endPos.y, { maxNodes: 100000 });
        console.log(`A* path length: ${astarResult.path.length}, cost: ${astarResult.cost.toFixed(2)}`);

        // HPA* - 使用 demo 相同的配置
        const hpa = new HPAPathfinder(map, {
            clusterSize: 20,  // demo 默认值
            maxEntranceWidth: 16,
            entranceStrategy: 'end'
        });
        hpa.preprocess();
        const stats = hpa.getStats();
        console.log(`Clusters: ${stats.clusters}, Entrances: ${stats.entrances}, Nodes: ${stats.abstractNodes}`);

        const hpaResult = hpa.findPath(startPos.x, startPos.y, endPos.x, endPos.y, { maxNodes: 100000 });
        console.log(`HPA* path length: ${hpaResult.path.length}, cost: ${hpaResult.cost.toFixed(2)}`);

        // 打印路径差异
        console.log('\nPath comparison:');
        console.log(`  A* start: (${astarResult.path[0]?.x}, ${astarResult.path[0]?.y})`);
        console.log(`  A* end: (${astarResult.path[astarResult.path.length - 1]?.x}, ${astarResult.path[astarResult.path.length - 1]?.y})`);
        console.log(`  HPA* start: (${hpaResult.path[0]?.x}, ${hpaResult.path[0]?.y})`);
        console.log(`  HPA* end: (${hpaResult.path[hpaResult.path.length - 1]?.x}, ${hpaResult.path[hpaResult.path.length - 1]?.y})`);

        // 对比路径偏差
        let maxDeviation = 0;

        console.log('\nHPA* path sample points:');
        for (let i = 0; i < hpaResult.path.length; i += Math.max(1, Math.floor(hpaResult.path.length / 10))) {
            const p = hpaResult.path[i];
            // 计算到理想对角线的偏差
            const idealY = startPos.y + (endPos.y - startPos.y) * (p.x - startPos.x) / (endPos.x - startPos.x);
            const deviation = Math.abs(p.y - idealY);
            maxDeviation = Math.max(maxDeviation, deviation);
            console.log(`  [${i}]: (${p.x}, ${p.y}) - ideal y: ${idealY.toFixed(1)}, deviation: ${deviation.toFixed(1)}`);
        }

        const ratio = hpaResult.path.length / astarResult.path.length;
        console.log(`\nHPA*/A* path length ratio: ${ratio.toFixed(3)}`);
        console.log(`Max deviation from ideal diagonal: ${maxDeviation.toFixed(1)}`);

        expect(astarResult.found).toBe(true);
        expect(hpaResult.found).toBe(true);
        // 路径长度不应该偏差太多
        expect(ratio).toBeLessThan(1.5);
    });
});
