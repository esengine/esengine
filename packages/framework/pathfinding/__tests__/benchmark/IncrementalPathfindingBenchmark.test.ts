import { describe, it, expect } from 'vitest';
import { IncrementalAStarPathfinder } from '../../src/core/IncrementalAStarPathfinder';
import { AStarPathfinder } from '../../src/core/AStarPathfinder';
import { JPSPathfinder } from '../../src/core/JPSPathfinder';
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
});
