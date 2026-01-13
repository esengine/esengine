import { describe, it, expect } from 'vitest';
import { IncrementalAStarPathfinder } from '../../src/core/IncrementalAStarPathfinder';
import { AStarPathfinder } from '../../src/core/AStarPathfinder';
import { FastAStarPathfinder } from '../../src/core/FastAStarPathfinder';
import { JPSPathfinder } from '../../src/core/JPSPathfinder';
import { HPAPathfinder } from '../../src/core/HPAPathfinder';
import { GridMap } from '../../src/grid/GridMap';
import { PathfindingState } from '../../src/core/IIncrementalPathfinding';

describe('Pathfinding Performance Benchmark', () => {
    // =========================================================================
    // 基准测试 - 同步 vs 增量
    // =========================================================================

    it('benchmark: sync vs incremental on 100x100 grid', () => {
        const grid = new GridMap(100, 100);
        const syncPF = new AStarPathfinder(grid);
        const incPF = new IncrementalAStarPathfinder(grid);

        // 添加一些障碍物
        for (let i = 20; i < 80; i++) {
            grid.setWalkable(50, i, false);
        }

        const iterations = 100;

        // 同步寻路
        const syncStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            syncPF.findPath(0, 0, 99, 99);
        }
        const syncTime = performance.now() - syncStart;

        // 增量寻路（一次性完成）
        const incStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            const req = incPF.requestPath(0, 0, 99, 99);
            incPF.step(req.id, 10000);
            incPF.cleanup(req.id);
        }
        const incTime = performance.now() - incStart;

        const syncPerPath = syncTime / iterations;
        const incPerPath = incTime / iterations;
        const overhead = ((incTime / syncTime) - 1) * 100;

        console.log('\n=== 100x100 Grid Benchmark (' + iterations + ' paths) ===');
        console.log('Sync A*:        ' + syncTime.toFixed(2) + 'ms (' + syncPerPath.toFixed(3) + 'ms/path)');
        console.log('Incremental A*: ' + incTime.toFixed(2) + 'ms (' + incPerPath.toFixed(3) + 'ms/path)');
        console.log('Overhead:       ' + overhead.toFixed(1) + '%');

        expect(true).toBe(true);
    });

    it('benchmark: A* vs FastA* performance', () => {
        const grid = new GridMap(200, 200);
        const astar = new AStarPathfinder(grid);
        const fastAstar = new FastAStarPathfinder(grid);

        for (let i = 40; i < 160; i++) {
            grid.setWalkable(100, i, false);
        }

        const iterations = 100;

        // Regular A*
        const astarStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            astar.findPath(0, 0, 199, 199);
        }
        const astarTime = performance.now() - astarStart;

        // Fast A*
        const fastStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            fastAstar.findPath(0, 0, 199, 199);
        }
        const fastTime = performance.now() - fastStart;

        const speedup = astarTime / fastTime;

        console.log('\n=== A* vs FastA* (200x200, ' + iterations + ' paths) ===');
        console.log('A*:      ' + astarTime.toFixed(2) + 'ms (' + (astarTime / iterations).toFixed(3) + 'ms/path)');
        console.log('FastA*:  ' + fastTime.toFixed(2) + 'ms (' + (fastTime / iterations).toFixed(3) + 'ms/path)');
        console.log('Speedup: ' + speedup.toFixed(2) + 'x');

        expect(speedup).toBeGreaterThan(1);
    });

    it('benchmark: FastA* on large maps', () => {
        const sizes = [500, 1000];

        console.log('\n=== FastA* Large Map Performance ===');
        console.log('Size\t\tTime\t\tNodes\t\tPath Length');

        for (const size of sizes) {
            const grid = new GridMap(size, size);
            const fastAstar = new FastAStarPathfinder(grid);

            const start = performance.now();
            const result = fastAstar.findPath(0, 0, size - 1, size - 1);
            const time = performance.now() - start;

            console.log(size + 'x' + size + '\t\t' + time.toFixed(2) + 'ms\t\t' + result.nodesSearched + '\t\t' + result.path.length);
            expect(result.found).toBe(true);
        }
    });

    it('benchmark: large map 500x500 (open)', () => {
        const grid = new GridMap(500, 500);
        const incPF = new IncrementalAStarPathfinder(grid);

        // 无障碍物的大地图测试
        const start = performance.now();
        const req = incPF.requestPath(0, 0, 499, 499);
        incPF.step(req.id, 100000);
        const time = performance.now() - start;

        const result = incPF.getResult(req.id);
        console.log('\n=== 500x500 Grid Single Path (Open) ===');
        console.log('Time:           ' + time.toFixed(2) + 'ms');
        console.log('Nodes searched: ' + result?.nodesSearched);
        console.log('Path length:    ' + result?.path.length);
        console.log('Found:          ' + result?.found);

        expect(result?.found).toBe(true);
    });

    it('benchmark: time-sliced execution simulation', () => {
        const grid = new GridMap(200, 200);
        const incPF = new IncrementalAStarPathfinder(grid);

        // 模拟每帧 100 次迭代
        const iterationsPerFrame = 100;
        const req = incPF.requestPath(0, 0, 199, 199);

        let frames = 0;
        let totalTime = 0;
        let maxFrameTime = 0;

        while (frames < 1000) {
            const frameStart = performance.now();
            const progress = incPF.step(req.id, iterationsPerFrame);
            const frameTime = performance.now() - frameStart;

            totalTime += frameTime;
            maxFrameTime = Math.max(maxFrameTime, frameTime);
            frames++;

            if (progress.state !== PathfindingState.InProgress) break;
        }

        const result = incPF.getResult(req.id);
        const avgFrameTime = totalTime / frames;

        console.log('\n=== Time-Sliced Execution (' + iterationsPerFrame + ' iter/frame) ===');
        console.log('Total frames:   ' + frames);
        console.log('Total time:     ' + totalTime.toFixed(2) + 'ms');
        console.log('Avg frame time: ' + avgFrameTime.toFixed(3) + 'ms');
        console.log('Max frame time: ' + maxFrameTime.toFixed(3) + 'ms');
        console.log('Path found:     ' + result?.found);

        // 每帧应该 < 2ms（60fps 下有 16.67ms 预算）
        expect(avgFrameTime).toBeLessThan(2);
    });

    it('benchmark: multiple concurrent agents', () => {
        const grid = new GridMap(100, 100);
        const incPF = new IncrementalAStarPathfinder(grid);

        const agentCount = 100;
        const requests: number[] = [];

        // 创建多个代理请求
        for (let i = 0; i < agentCount; i++) {
            const startX = Math.floor(Math.random() * 50);
            const startY = Math.floor(Math.random() * 100);
            const endX = 50 + Math.floor(Math.random() * 50);
            const endY = Math.floor(Math.random() * 100);
            const req = incPF.requestPath(startX, startY, endX, endY);
            requests.push(req.id);
        }

        // 模拟帧循环，每帧总预算 1000 迭代
        const budgetPerFrame = 1000;
        const iterPerAgent = Math.floor(budgetPerFrame / agentCount);

        let frames = 0;
        let completed = 0;
        const start = performance.now();

        while (completed < agentCount && frames < 500) {
            completed = 0;
            for (const reqId of requests) {
                const progress = incPF.getProgress(reqId);
                if (progress && progress.state === PathfindingState.InProgress) {
                    incPF.step(reqId, iterPerAgent);
                }
                const updatedProgress = incPF.getProgress(reqId);
                if (updatedProgress?.state === PathfindingState.Completed ||
                    updatedProgress?.state === PathfindingState.Failed) {
                    completed++;
                }
            }
            frames++;
        }

        const totalTime = performance.now() - start;
        const avgFrameTime = totalTime / frames;

        console.log('\n=== ' + agentCount + ' Concurrent Agents ===');
        console.log('Frames to complete all: ' + frames);
        console.log('Total time:            ' + totalTime.toFixed(2) + 'ms');
        console.log('Avg time/frame:        ' + avgFrameTime.toFixed(3) + 'ms');
        console.log('Agents completed:      ' + completed + '/' + agentCount);

        expect(completed).toBe(agentCount);
    });

    it('benchmark: stress test 1000 agents on 200x200', () => {
        const grid = new GridMap(200, 200);
        const incPF = new IncrementalAStarPathfinder(grid);

        // 添加随机障碍物
        for (let i = 0; i < 2000; i++) {
            const x = Math.floor(Math.random() * 200);
            const y = Math.floor(Math.random() * 200);
            if (x > 5 && y > 5 && x < 195 && y < 195) {
                grid.setWalkable(x, y, false);
            }
        }

        const agentCount = 1000;
        const requests: number[] = [];

        // 创建大量代理
        const createStart = performance.now();
        for (let i = 0; i < agentCount; i++) {
            const startX = Math.floor(Math.random() * 10);
            const startY = Math.floor(Math.random() * 200);
            const endX = 190 + Math.floor(Math.random() * 10);
            const endY = Math.floor(Math.random() * 200);
            const req = incPF.requestPath(startX, startY, endX, endY);
            requests.push(req.id);
        }
        const createTime = performance.now() - createStart;

        // 每帧预算 2000 迭代
        const budgetPerFrame = 2000;
        let frames = 0;
        let completed = 0;
        const processStart = performance.now();

        while (completed < agentCount && frames < 2000) {
            let budget = budgetPerFrame;
            completed = 0;

            for (const reqId of requests) {
                const progress = incPF.getProgress(reqId);
                if (!progress) continue;

                if (progress.state === PathfindingState.Completed ||
                    progress.state === PathfindingState.Failed) {
                    completed++;
                    continue;
                }

                if (progress.state === PathfindingState.InProgress && budget > 0) {
                    const iterForThis = Math.min(50, budget);
                    incPF.step(reqId, iterForThis);
                    budget -= iterForThis;
                }
            }
            frames++;
        }

        const processTime = performance.now() - processStart;
        const avgFrameTime = processTime / frames;

        console.log('\n=== STRESS TEST: ' + agentCount + ' Agents on 200x200 ===');
        console.log('Request creation:  ' + createTime.toFixed(2) + 'ms');
        console.log('Frames to complete: ' + frames);
        console.log('Process time:      ' + processTime.toFixed(2) + 'ms');
        console.log('Avg time/frame:    ' + avgFrameTime.toFixed(3) + 'ms');
        console.log('Agents completed:  ' + completed + '/' + agentCount);

        // 应该在合理帧数内完成
        expect(frames).toBeLessThan(2000);
    });

    // =========================================================================
    // JPS vs A* 性能对比
    // =========================================================================

    it('benchmark: JPS vs A* on open terrain', () => {
        const grid = new GridMap(300, 300);
        const astar = new AStarPathfinder(grid);
        const jps = new JPSPathfinder(grid);

        // Warmup
        astar.findPath(0, 0, 50, 50);
        jps.findPath(0, 0, 50, 50);

        const iterations = 50;

        // A* benchmark
        const astarStart = performance.now();
        let astarNodes = 0;
        for (let i = 0; i < iterations; i++) {
            const result = astar.findPath(0, 0, 299, 299);
            astarNodes += result.nodesSearched;
        }
        const astarTime = performance.now() - astarStart;

        // JPS benchmark
        const jpsStart = performance.now();
        let jpsNodes = 0;
        for (let i = 0; i < iterations; i++) {
            const result = jps.findPath(0, 0, 299, 299);
            jpsNodes += result.nodesSearched;
        }
        const jpsTime = performance.now() - jpsStart;

        const speedup = astarTime / jpsTime;
        const nodeReduction = astarNodes / jpsNodes;

        console.log('\n=== JPS vs A* on 300x300 Open Grid (' + iterations + ' iterations) ===');
        console.log('A*:    ' + astarTime.toFixed(2) + 'ms (' + (astarNodes / iterations).toFixed(0) + ' nodes/path)');
        console.log('JPS:   ' + jpsTime.toFixed(2) + 'ms (' + (jpsNodes / iterations).toFixed(0) + ' nodes/path)');
        console.log('Speedup:        ' + speedup.toFixed(2) + 'x');
        console.log('Node reduction: ' + nodeReduction.toFixed(2) + 'x');

        // JPS should search far fewer nodes
        expect(nodeReduction).toBeGreaterThan(10);
    });

    it('benchmark: JPS vs A* with obstacles', () => {
        const grid = new GridMap(200, 200);

        // Create scattered obstacles (10% density - lower to ensure paths exist)
        for (let i = 0; i < 4000; i++) {
            const x = Math.floor(Math.random() * 200);
            const y = Math.floor(Math.random() * 200);
            // Keep corners clear
            if (x > 20 && x < 180 && y > 20 && y < 180) {
                grid.setWalkable(x, y, false);
            }
        }

        const astar = new AStarPathfinder(grid);
        const jps = new JPSPathfinder(grid);

        const iterations = 20;
        let astarNodes = 0;
        let jpsNodes = 0;

        // A* benchmark
        const astarStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            const result = astar.findPath(5, 5, 195, 195);
            astarNodes += result.nodesSearched;
        }
        const astarTime = performance.now() - astarStart;

        // JPS benchmark
        const jpsStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            const result = jps.findPath(5, 5, 195, 195);
            jpsNodes += result.nodesSearched;
        }
        const jpsTime = performance.now() - jpsStart;

        console.log('\n=== JPS vs A* on 200x200 with Obstacles (' + iterations + ' iterations) ===');
        console.log('A*:    ' + astarTime.toFixed(2) + 'ms (' + (astarNodes / iterations).toFixed(0) + ' nodes/path)');
        console.log('JPS:   ' + jpsTime.toFixed(2) + 'ms (' + (jpsNodes / iterations).toFixed(0) + ' nodes/path)');

        if (astarNodes > 0 && jpsNodes > 0) {
            const nodeReduction = astarNodes / jpsNodes;
            console.log('Node reduction: ' + nodeReduction.toFixed(2) + 'x');
            // With obstacles, JPS should still search fewer nodes
            expect(jpsNodes).toBeLessThan(astarNodes);
        }

        expect(true).toBe(true);
    });

    it('benchmark: JPS scaling test', () => {
        const sizes = [100, 200, 300, 400];
        console.log('\n=== JPS Scaling Test (Open Terrain) ===');
        console.log('Size\t\tA* Time\t\tJPS Time\tSpeedup\t\tNode Ratio');

        for (const size of sizes) {
            const grid = new GridMap(size, size);
            const astar = new AStarPathfinder(grid);
            const jps = new JPSPathfinder(grid);

            // Warmup
            astar.findPath(0, 0, 10, 10);
            jps.findPath(0, 0, 10, 10);

            const astarStart = performance.now();
            const astarResult = astar.findPath(0, 0, size - 1, size - 1);
            const astarTime = performance.now() - astarStart;

            const jpsStart = performance.now();
            const jpsResult = jps.findPath(0, 0, size - 1, size - 1);
            const jpsTime = performance.now() - jpsStart;

            const speedup = astarTime / jpsTime;
            const nodeRatio = astarResult.nodesSearched / jpsResult.nodesSearched;

            console.log(
                size + 'x' + size + '\t\t' +
                astarTime.toFixed(2) + 'ms\t\t' +
                jpsTime.toFixed(2) + 'ms\t\t' +
                speedup.toFixed(2) + 'x\t\t' +
                nodeRatio.toFixed(1) + 'x'
            );

            expect(jpsResult.found).toBe(astarResult.found);
        }

        expect(true).toBe(true);
    });

    // =========================================================================
    // 缓存性能测试
    // =========================================================================

    it('benchmark: cache vs no-cache performance', () => {
        const grid = new GridMap(100, 100);

        // Add some obstacles
        for (let i = 20; i < 80; i++) {
            grid.setWalkable(50, i, false);
        }

        // Without cache
        const noCachePF = new IncrementalAStarPathfinder(grid);

        // With cache
        const cachedPF = new IncrementalAStarPathfinder(grid, {
            enableCache: true,
            cacheConfig: { maxEntries: 500, ttlMs: 0 }
        });

        const iterations = 100;
        const uniquePaths = 10;

        // Generate unique path endpoints
        const endpoints: Array<{ sx: number; sy: number; ex: number; ey: number }> = [];
        for (let i = 0; i < uniquePaths; i++) {
            endpoints.push({
                sx: i * 3,
                sy: i * 5,
                ex: 99 - i * 2,
                ey: 99 - i * 3
            });
        }

        // Test without cache
        const noCacheStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            const ep = endpoints[i % uniquePaths];
            const req = noCachePF.requestPath(ep.sx, ep.sy, ep.ex, ep.ey);
            noCachePF.step(req.id, 10000);
            noCachePF.cleanup(req.id);
        }
        const noCacheTime = performance.now() - noCacheStart;

        // Test with cache
        const cacheStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            const ep = endpoints[i % uniquePaths];
            const req = cachedPF.requestPath(ep.sx, ep.sy, ep.ex, ep.ey);
            cachedPF.step(req.id, 10000);
            cachedPF.cleanup(req.id);
        }
        const cacheTime = performance.now() - cacheStart;

        const stats = cachedPF.getCacheStats();
        const speedup = noCacheTime / cacheTime;

        console.log('\n=== Cache Performance (' + iterations + ' requests, ' + uniquePaths + ' unique paths) ===');
        console.log('No cache:    ' + noCacheTime.toFixed(2) + 'ms');
        console.log('With cache:  ' + cacheTime.toFixed(2) + 'ms');
        console.log('Speedup:     ' + speedup.toFixed(2) + 'x');
        console.log('Cache hits:  ' + stats.hits + ' (' + (stats.hitRate * 100).toFixed(1) + '%)');
        console.log('Cache misses: ' + stats.misses);

        // With repeated paths, cache should provide significant speedup
        expect(speedup).toBeGreaterThan(1.5);
        expect(stats.hitRate).toBeGreaterThan(0.8);
    });

    it('benchmark: cache with many agents requesting same destination', () => {
        const grid = new GridMap(100, 100);
        const cachedPF = new IncrementalAStarPathfinder(grid, {
            enableCache: true,
            cacheConfig: { maxEntries: 1000, ttlMs: 0 }
        });

        const agentCount = 50;
        const targetX = 99;
        const targetY = 99;

        // All agents go to the same destination from different starting points
        const start = performance.now();
        for (let i = 0; i < agentCount; i++) {
            const startX = i % 10;
            const startY = Math.floor(i / 10) * 5;
            const req = cachedPF.requestPath(startX, startY, targetX, targetY);
            cachedPF.step(req.id, 10000);
            cachedPF.cleanup(req.id);
        }
        const time1 = performance.now() - start;

        // Request same paths again (should hit cache)
        const start2 = performance.now();
        for (let i = 0; i < agentCount; i++) {
            const startX = i % 10;
            const startY = Math.floor(i / 10) * 5;
            const req = cachedPF.requestPath(startX, startY, targetX, targetY);
            cachedPF.step(req.id, 10000);
            cachedPF.cleanup(req.id);
        }
        const time2 = performance.now() - start2;

        const stats = cachedPF.getCacheStats();
        const speedup = time1 / time2;

        console.log('\n=== Many Agents Same Destination (' + agentCount + ' agents x 2 rounds) ===');
        console.log('First round (cold cache):  ' + time1.toFixed(2) + 'ms');
        console.log('Second round (warm cache): ' + time2.toFixed(2) + 'ms');
        console.log('Speedup:                   ' + speedup.toFixed(2) + 'x');
        console.log('Cache stats:               ' + stats.hits + ' hits, ' + stats.misses + ' misses');

        // Second round should be much faster
        expect(time2).toBeLessThan(time1 / 2);
    });

    // =========================================================================
    // HPA* 分层寻路性能测试
    // =========================================================================

    it('benchmark: HPA* repeated queries (best case scenario)', () => {
        const size = 300;
        const grid = new GridMap(size, size);

        // Add 10% scattered obstacles
        for (let i = 0; i < size * size * 0.1; i++) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            if (x > 30 && x < size - 30 && y > 30 && y < size - 30) {
                grid.setWalkable(x, y, false);
            }
        }

        const astar = new AStarPathfinder(grid);
        const hpa = new HPAPathfinder(grid, { clusterSize: 30 });

        // Preprocess HPA*
        const preStart = performance.now();
        hpa.preprocess();
        const preTime = performance.now() - preStart;

        // Define 5 fixed path requests (simulating repeated game queries)
        const paths = [
            { sx: 10, sy: 10, ex: 290, ey: 290 },
            { sx: 10, sy: 290, ex: 290, ey: 10 },
            { sx: 150, sy: 10, ex: 150, ey: 290 },
            { sx: 10, sy: 150, ex: 290, ey: 150 },
            { sx: 50, sy: 50, ex: 250, ey: 250 }
        ];

        const rounds = 10;

        // A* benchmark (each path repeated)
        const astarStart = performance.now();
        for (let r = 0; r < rounds; r++) {
            for (const p of paths) {
                astar.findPath(p.sx, p.sy, p.ex, p.ey);
            }
        }
        const astarTime = performance.now() - astarStart;

        // HPA* benchmark (each path repeated - benefits from internal cache)
        const hpaStart = performance.now();
        for (let r = 0; r < rounds; r++) {
            for (const p of paths) {
                hpa.findPath(p.sx, p.sy, p.ex, p.ey);
            }
        }
        const hpaTime = performance.now() - hpaStart;

        const totalHpaTime = preTime + hpaTime;
        const searchSpeedup = astarTime / hpaTime;
        const totalSpeedup = astarTime / totalHpaTime;

        console.log('\n=== HPA* Repeated Queries (300x300, 50 queries) ===');
        console.log('A* time:         ' + astarTime.toFixed(2) + 'ms');
        console.log('HPA* preprocess: ' + preTime.toFixed(2) + 'ms');
        console.log('HPA* search:     ' + hpaTime.toFixed(2) + 'ms');
        console.log('Speedup (search): ' + searchSpeedup.toFixed(2) + 'x');
        console.log('Speedup (total):  ' + totalSpeedup.toFixed(2) + 'x');

        expect(true).toBe(true);
    });

    it('benchmark: HPA* preprocess time by cluster size', () => {
        const grid = new GridMap(200, 200);
        const clusterSizes = [10, 20, 40];

        console.log('\n=== HPA* Preprocess Time by Cluster Size (200x200) ===');
        console.log('Cluster\t\tPreprocess\tClusters\tEntrances\tNodes');

        for (const clusterSize of clusterSizes) {
            const hpa = new HPAPathfinder(grid, { clusterSize });

            const start = performance.now();
            hpa.preprocess();
            const preprocessTime = performance.now() - start;

            const stats = hpa.getStats();

            console.log(
                clusterSize + 'x' + clusterSize + '\t\t' +
                preprocessTime.toFixed(2) + 'ms\t\t' +
                stats.clusters + '\t\t' +
                stats.entrances + '\t\t' +
                stats.abstractNodes
            );
        }

        expect(true).toBe(true);
    });

    it('benchmark: HPA* repeated paths (amortized preprocess)', () => {
        const grid = new GridMap(200, 200);

        // Add scattered obstacles
        for (let i = 0; i < 4000; i++) {
            const x = Math.floor(Math.random() * 200);
            const y = Math.floor(Math.random() * 200);
            if (x > 20 && x < 180 && y > 20 && y < 180) {
                grid.setWalkable(x, y, false);
            }
        }

        const astar = new AStarPathfinder(grid);
        const hpa = new HPAPathfinder(grid, { clusterSize: 20 });

        // HPA* preprocess
        const preStart = performance.now();
        hpa.preprocess();
        const preTime = performance.now() - preStart;

        const iterations = 10;

        // Generate random paths
        const paths: Array<{ sx: number; sy: number; ex: number; ey: number }> = [];
        for (let i = 0; i < iterations; i++) {
            paths.push({
                sx: 5 + Math.floor(Math.random() * 15),
                sy: 5 + Math.floor(Math.random() * 15),
                ex: 180 + Math.floor(Math.random() * 15),
                ey: 180 + Math.floor(Math.random() * 15)
            });
        }

        // A* benchmark
        const astarStart = performance.now();
        let astarFound = 0;
        for (const p of paths) {
            const result = astar.findPath(p.sx, p.sy, p.ex, p.ey);
            if (result.found) astarFound++;
        }
        const astarTime = performance.now() - astarStart;

        // HPA* benchmark
        const hpaStart = performance.now();
        let hpaFound = 0;
        for (const p of paths) {
            const result = hpa.findPath(p.sx, p.sy, p.ex, p.ey);
            if (result.found) hpaFound++;
        }
        const hpaTime = performance.now() - hpaStart;

        const totalHpaTime = preTime + hpaTime;
        const hpaOnlySpeedup = astarTime / hpaTime;
        const totalSpeedup = astarTime / totalHpaTime;

        console.log('\n=== HPA* Repeated Paths (200x200 with obstacles, ' + iterations + ' paths) ===');
        console.log('A* total:       ' + astarTime.toFixed(2) + 'ms (' + astarFound + ' found)');
        console.log('HPA* preprocess: ' + preTime.toFixed(2) + 'ms');
        console.log('HPA* search:    ' + hpaTime.toFixed(2) + 'ms (' + hpaFound + ' found)');
        console.log('HPA* total:     ' + totalHpaTime.toFixed(2) + 'ms');
        console.log('Speedup (search only): ' + hpaOnlySpeedup.toFixed(2) + 'x');
        console.log('Speedup (incl. preprocess): ' + totalSpeedup.toFixed(2) + 'x');

        expect(true).toBe(true);
    });
});
