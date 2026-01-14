import { describe, it, expect } from 'vitest';
import { IncrementalAStarPathfinder } from '../../src/core/IncrementalAStarPathfinder';
import { AStarPathfinder } from '../../src/core/AStarPathfinder';
import { GridMap } from '../../src/grid/GridMap';
import { PathfindingState } from '../../src/core/IIncrementalPathfinding';

/**
 * 压力测试和随机化测试
 * 用于发现潜在的边界情况和竞态条件
 */
describe('IncrementalAStarPathfinder Stress Tests', () => {
    // =========================================================================
    // 随机路径测试
    // =========================================================================

    describe('randomized path testing', () => {
        it('should find same results as sync A* for 100 random paths', () => {
            const grid = new GridMap(50, 50);
            const syncPF = new AStarPathfinder(grid);
            const incPF = new IncrementalAStarPathfinder(grid);

            // 添加随机障碍物 (约20%覆盖率)
            const seed = 12345;
            let random = seed;
            const nextRandom = () => {
                random = (random * 1103515245 + 12345) & 0x7fffffff;
                return random / 0x7fffffff;
            };

            for (let i = 0; i < 500; i++) {
                const x = Math.floor(nextRandom() * 50);
                const y = Math.floor(nextRandom() * 50);
                // 保护起点和终点区域
                if (x > 2 && y > 2 && x < 47 && y < 47) {
                    grid.setWalkable(x, y, false);
                }
            }

            let matchCount = 0;
            let failCount = 0;

            for (let i = 0; i < 100; i++) {
                const startX = Math.floor(nextRandom() * 10);
                const startY = Math.floor(nextRandom() * 10);
                const endX = 40 + Math.floor(nextRandom() * 10);
                const endY = 40 + Math.floor(nextRandom() * 10);

                // 确保起点终点可通行
                grid.setWalkable(startX, startY, true);
                grid.setWalkable(endX, endY, true);

                const syncResult = syncPF.findPath(startX, startY, endX, endY);
                const req = incPF.requestPath(startX, startY, endX, endY);
                incPF.step(req.id, 100000);
                const incResult = incPF.getResult(req.id);

                if (syncResult.found === incResult?.found) {
                    if (syncResult.found) {
                        // 比较路径长度（可能有多条等长路径）
                        if (syncResult.path.length === incResult.path.length) {
                            matchCount++;
                        } else {
                            // 路径长度不同但都找到了，可能是等代价的不同路径
                            const costDiff = Math.abs(syncResult.cost - (incResult?.cost ?? 0));
                            expect(costDiff).toBeLessThan(0.01);
                            matchCount++;
                        }
                    } else {
                        matchCount++;
                    }
                } else {
                    failCount++;
                    console.log(`Mismatch at (${startX},${startY}) -> (${endX},${endY})`);
                    console.log(`Sync found: ${syncResult.found}, Inc found: ${incResult?.found}`);
                }

                incPF.cleanup(req.id);
            }

            console.log(`\n=== Random Path Test ===`);
            console.log(`Matches: ${matchCount}/100`);
            console.log(`Failures: ${failCount}/100`);

            expect(failCount).toBe(0);
        });

        it('should handle random step sizes consistently', () => {
            const grid = new GridMap(30, 30);
            const incPF = new IncrementalAStarPathfinder(grid);

            // 基准结果
            const baseReq = incPF.requestPath(0, 0, 29, 29);
            incPF.step(baseReq.id, 100000);
            const baseResult = incPF.getResult(baseReq.id);
            incPF.cleanup(baseReq.id);

            // 使用随机步长
            for (let trial = 0; trial < 10; trial++) {
                const req = incPF.requestPath(0, 0, 29, 29);
                let progress = incPF.getProgress(req.id);

                while (progress?.state === PathfindingState.InProgress) {
                    const stepSize = 1 + Math.floor(Math.random() * 50);
                    incPF.step(req.id, stepSize);
                    progress = incPF.getProgress(req.id);
                }

                const result = incPF.getResult(req.id);
                expect(result?.found).toBe(baseResult?.found);
                expect(result?.path.length).toBe(baseResult?.path.length);
                incPF.cleanup(req.id);
            }
        });
    });

    // =========================================================================
    // 极端情况测试
    // =========================================================================

    describe('extreme cases', () => {
        it('should handle very long narrow path', () => {
            const grid = new GridMap(1000, 3);

            // 只有中间一行可通行
            for (let x = 0; x < 1000; x++) {
                grid.setWalkable(x, 0, false);
                grid.setWalkable(x, 2, false);
            }

            const incPF = new IncrementalAStarPathfinder(grid);
            const req = incPF.requestPath(0, 1, 999, 1);

            let totalSteps = 0;
            let progress = incPF.step(req.id, 100);
            totalSteps++;

            while (progress.state === PathfindingState.InProgress) {
                progress = incPF.step(req.id, 100);
                totalSteps++;
            }

            const result = incPF.getResult(req.id);

            console.log(`\n=== Long Narrow Path ===`);
            console.log(`Path length: ${result?.path.length}`);
            console.log(`Steps needed: ${totalSteps}`);

            expect(result?.found).toBe(true);
            expect(result?.path.length).toBe(1000);
        });

        it('should handle dense obstacle field', () => {
            const grid = new GridMap(50, 50);

            // 创建密集但可通行的障碍物场景
            for (let x = 0; x < 50; x++) {
                for (let y = 0; y < 50; y++) {
                    // 棋盘格模式，保证对角线可通行
                    if ((x + y) % 2 === 0 && x > 0 && y > 0 && x < 49 && y < 49) {
                        grid.setWalkable(x, y, false);
                    }
                }
            }

            const incPF = new IncrementalAStarPathfinder(grid);
            const req = incPF.requestPath(0, 0, 49, 49);
            incPF.step(req.id, 100000);
            const result = incPF.getResult(req.id);

            expect(result?.found).toBe(true);

            // 验证路径不穿过障碍物
            for (const p of result!.path) {
                expect(grid.isWalkable(p.x, p.y)).toBe(true);
            }
        });

        it('should handle many small isolated regions', () => {
            const grid = new GridMap(100, 100);

            // 创建网格状墙壁，形成多个独立区域
            for (let x = 10; x < 90; x += 10) {
                for (let y = 0; y < 100; y++) {
                    if (y % 10 !== 5) { // 每10格留一个缺口
                        grid.setWalkable(x, y, false);
                    }
                }
            }

            const incPF = new IncrementalAStarPathfinder(grid);
            const req = incPF.requestPath(5, 5, 95, 95);
            incPF.step(req.id, 100000);
            const result = incPF.getResult(req.id);

            expect(result?.found).toBe(true);
        });

        it('should handle worst case - no path exists', () => {
            const grid = new GridMap(100, 100);

            // 完全隔离起点 - 形成封闭矩形
            // 顶部墙
            for (let x = 0; x <= 15; x++) {
                grid.setWalkable(x, 15, false);
            }
            // 右侧墙
            for (let y = 0; y <= 15; y++) {
                grid.setWalkable(15, y, false);
            }

            const incPF = new IncrementalAStarPathfinder(grid);
            const start = performance.now();
            const req = incPF.requestPath(5, 5, 95, 95);
            incPF.step(req.id, 100000);
            const time = performance.now() - start;

            const result = incPF.getResult(req.id);
            const progress = incPF.getProgress(req.id);

            console.log(`\n=== No Path Case ===`);
            console.log(`Time: ${time.toFixed(2)}ms`);
            console.log(`Nodes searched: ${progress?.nodesSearched}`);
            console.log(`State: ${progress?.state}`);

            expect(result?.found).toBe(false);
        });
    });

    // =========================================================================
    // 并发正确性测试
    // =========================================================================

    describe('concurrent correctness', () => {
        it('should maintain isolation between 50 concurrent requests', () => {
            const grid = new GridMap(30, 30);
            const incPF = new IncrementalAStarPathfinder(grid);

            // 创建50个不同的请求
            const requests: Array<{
                id: number;
                start: { x: number; y: number };
                end: { x: number; y: number };
            }> = [];

            for (let i = 0; i < 50; i++) {
                const startX = i % 10;
                const startY = Math.floor(i / 10);
                const endX = 20 + (i % 10);
                const endY = 20 + Math.floor(i / 10);

                const req = incPF.requestPath(startX, startY, endX, endY);
                requests.push({
                    id: req.id,
                    start: { x: startX, y: startY },
                    end: { x: endX, y: endY }
                });
            }

            // 随机顺序处理
            const shuffled = [...requests].sort(() => Math.random() - 0.5);

            for (const req of shuffled) {
                incPF.step(req.id, 10);
            }

            // 完成所有请求
            for (const req of requests) {
                incPF.step(req.id, 10000);
            }

            // 验证每个请求的结果
            for (const req of requests) {
                const result = incPF.getResult(req.id);
                expect(result?.found).toBe(true);
                expect(result?.path[0]).toEqual(req.start);
                expect(result?.path[result.path.length - 1]).toEqual(req.end);
            }
        });

        it('should handle rapid request/cleanup cycles', () => {
            const grid = new GridMap(20, 20);
            const incPF = new IncrementalAStarPathfinder(grid);

            for (let cycle = 0; cycle < 100; cycle++) {
                const req = incPF.requestPath(0, 0, 19, 19);
                incPF.step(req.id, 100);
                incPF.cleanup(req.id);
            }

            // 创建一个新请求确保系统正常
            const finalReq = incPF.requestPath(0, 0, 19, 19);
            incPF.step(finalReq.id, 10000);
            const result = incPF.getResult(finalReq.id);

            expect(result?.found).toBe(true);
        });

        it('should handle pause/resume/cancel chaos', () => {
            const grid = new GridMap(30, 30);
            const incPF = new IncrementalAStarPathfinder(grid);

            const requests: number[] = [];
            for (let i = 0; i < 20; i++) {
                const req = incPF.requestPath(0, i, 29, i);
                requests.push(req.id);
            }

            // 随机操作
            for (let op = 0; op < 100; op++) {
                const reqIdx = Math.floor(Math.random() * requests.length);
                const reqId = requests[reqIdx];
                const action = Math.floor(Math.random() * 4);

                switch (action) {
                    case 0:
                        incPF.step(reqId, 10);
                        break;
                    case 1:
                        incPF.pause(reqId);
                        break;
                    case 2:
                        incPF.resume(reqId);
                        break;
                    case 3:
                        // 小概率取消
                        if (Math.random() < 0.1) {
                            incPF.cancel(reqId);
                        }
                        break;
                }
            }

            // 完成所有未取消的请求
            for (const reqId of requests) {
                const progress = incPF.getProgress(reqId);
                if (progress && progress.state !== PathfindingState.Cancelled) {
                    incPF.resume(reqId);
                    incPF.step(reqId, 10000);
                }
            }

            // 验证结果一致性
            for (let i = 0; i < requests.length; i++) {
                const result = incPF.getResult(requests[i]);
                if (result?.found) {
                    expect(result.path[0].y).toBe(i);
                    expect(result.path[result.path.length - 1].y).toBe(i);
                }
            }
        });
    });

    // =========================================================================
    // 障碍物变化测试
    // =========================================================================

    describe('obstacle change handling', () => {
        it('should correctly flag affected sessions', () => {
            // 使用更大的地图确保搜索不会立即完成
            const grid = new GridMap(200, 200);
            const incPF = new IncrementalAStarPathfinder(grid);

            // 创建长路径请求
            const req1 = incPF.requestPath(0, 0, 199, 199);

            // 只步进少量迭代，确保请求还在进行中
            incPF.step(req1.id, 10);

            // 验证请求还在进行中
            const progress = incPF.getProgress(req1.id);
            expect(progress?.state).toBe(PathfindingState.InProgress);

            // 在起点区域添加障碍物
            incPF.notifyObstacleChange(0, 0, 5, 5);

            // 验证标记 - 起点 (0,0) 在障碍物区域内
            const affected = incPF.isAffectedByChange(req1.id);

            console.log(`\n=== Obstacle Change Flags ===`);
            console.log(`Request state: ${progress?.state}`);
            console.log(`Request affected: ${affected}`);

            expect(affected).toBe(true);
        });

        it('should clear change flags correctly', () => {
            const grid = new GridMap(30, 30);
            const incPF = new IncrementalAStarPathfinder(grid);

            const req = incPF.requestPath(0, 0, 29, 29);
            incPF.step(req.id, 20);

            incPF.notifyObstacleChange(10, 10, 20, 20);
            expect(incPF.isAffectedByChange(req.id)).toBe(true);

            incPF.clearChangeFlag(req.id);
            expect(incPF.isAffectedByChange(req.id)).toBe(false);

            // 新的变化通知
            incPF.notifyObstacleChange(5, 5, 8, 8);
            expect(incPF.isAffectedByChange(req.id)).toBe(true);
        });
    });

    // =========================================================================
    // 内存泄漏检测
    // =========================================================================

    describe('memory management', () => {
        it('should not leak memory after cleanup', () => {
            const grid = new GridMap(50, 50);
            const incPF = new IncrementalAStarPathfinder(grid);

            // 创建大量请求并清理
            for (let i = 0; i < 1000; i++) {
                const req = incPF.requestPath(
                    Math.floor(Math.random() * 25),
                    Math.floor(Math.random() * 50),
                    25 + Math.floor(Math.random() * 25),
                    Math.floor(Math.random() * 50)
                );
                incPF.step(req.id, 100);
                incPF.cleanup(req.id);
            }

            // 应该能正常创建新请求
            const finalReq = incPF.requestPath(0, 0, 49, 49);
            incPF.step(finalReq.id, 10000);
            const result = incPF.getResult(finalReq.id);

            expect(result?.found).toBe(true);
        });

        it('should clear all state correctly', () => {
            const grid = new GridMap(30, 30);
            const incPF = new IncrementalAStarPathfinder(grid);

            // 创建多个请求
            const requests: number[] = [];
            for (let i = 0; i < 10; i++) {
                const req = incPF.requestPath(0, 0, 29, 29);
                requests.push(req.id);
                incPF.step(req.id, 50);
            }

            // 清除所有
            incPF.clear();

            // 验证所有请求都被清除
            for (const reqId of requests) {
                expect(incPF.getProgress(reqId)).toBeNull();
                expect(incPF.getResult(reqId)).toBeNull();
            }
        });
    });
});
