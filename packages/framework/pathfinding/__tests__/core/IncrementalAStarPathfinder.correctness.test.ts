import { describe, it, expect, beforeEach } from 'vitest';
import { IncrementalAStarPathfinder } from '../../src/core/IncrementalAStarPathfinder';
import { AStarPathfinder } from '../../src/core/AStarPathfinder';
import { GridMap } from '../../src/grid/GridMap';
import { PathfindingState } from '../../src/core/IIncrementalPathfinding';
import type { IPoint } from '../../src/core/IPathfinding';

/**
 * 增量寻路正确性测试
 * 验证增量寻路与同步寻路产生相同的结果
 */
describe('IncrementalAStarPathfinder Correctness', () => {
    // =========================================================================
    // 与同步 A* 结果对比
    // =========================================================================

    describe('comparison with sync A*', () => {
        it('should find same path as sync A* on simple grid', () => {
            const grid = new GridMap(10, 10);
            const syncPF = new AStarPathfinder(grid);
            const incPF = new IncrementalAStarPathfinder(grid);

            const syncResult = syncPF.findPath(0, 0, 9, 9);
            const req = incPF.requestPath(0, 0, 9, 9);
            incPF.step(req.id, 10000);
            const incResult = incPF.getResult(req.id);

            expect(incResult?.found).toBe(syncResult.found);
            expect(incResult?.path.length).toBe(syncResult.path.length);
            expect(incResult?.path[0]).toEqual(syncResult.path[0]);
            expect(incResult?.path[incResult.path.length - 1]).toEqual(
                syncResult.path[syncResult.path.length - 1]
            );
        });

        it('should find same path with obstacles', () => {
            const grid = new GridMap(20, 20);

            // 创建障碍墙
            for (let y = 5; y < 15; y++) {
                grid.setWalkable(10, y, false);
            }

            const syncPF = new AStarPathfinder(grid);
            const incPF = new IncrementalAStarPathfinder(grid);

            const syncResult = syncPF.findPath(5, 10, 15, 10);
            const req = incPF.requestPath(5, 10, 15, 10);
            incPF.step(req.id, 10000);
            const incResult = incPF.getResult(req.id);

            expect(incResult?.found).toBe(syncResult.found);
            expect(incResult?.path.length).toBe(syncResult.path.length);

            // 验证路径代价相同
            expect(Math.abs((incResult?.cost ?? 0) - syncResult.cost)).toBeLessThan(0.01);
        });

        it('should find same path in maze', () => {
            const grid = new GridMap(15, 15);
            const mazeStr = `
...............
.#############.
.#...........#.
.#.#########.#.
.#.#.......#.#.
.#.#.#####.#.#.
.#.#.#...#.#.#.
.#.#.#.#.#.#.#.
.#.#...#...#.#.
.#.#########.#.
.#...........#.
.#############.
...............
...............
...............`.trim();

            grid.loadFromString(mazeStr);

            const syncPF = new AStarPathfinder(grid);
            const incPF = new IncrementalAStarPathfinder(grid);

            const syncResult = syncPF.findPath(0, 0, 14, 12);
            const req = incPF.requestPath(0, 0, 14, 12);
            incPF.step(req.id, 10000);
            const incResult = incPF.getResult(req.id);

            expect(incResult?.found).toBe(syncResult.found);
            if (syncResult.found) {
                expect(incResult?.path.length).toBe(syncResult.path.length);
            }
        });

        it('should both fail when no path exists', () => {
            const grid = new GridMap(10, 10);

            // 完全封闭起点
            grid.setWalkable(1, 0, false);
            grid.setWalkable(0, 1, false);
            grid.setWalkable(1, 1, false);

            const syncPF = new AStarPathfinder(grid);
            const incPF = new IncrementalAStarPathfinder(grid);

            const syncResult = syncPF.findPath(0, 0, 9, 9);
            const req = incPF.requestPath(0, 0, 9, 9);
            incPF.step(req.id, 10000);
            const incResult = incPF.getResult(req.id);

            expect(incResult?.found).toBe(false);
            expect(syncResult.found).toBe(false);
        });

        it('should produce consistent results across multiple grid sizes', () => {
            const sizes = [5, 10, 20, 50, 100];

            for (const size of sizes) {
                const grid = new GridMap(size, size);
                const syncPF = new AStarPathfinder(grid);
                const incPF = new IncrementalAStarPathfinder(grid);

                const syncResult = syncPF.findPath(0, 0, size - 1, size - 1);
                const req = incPF.requestPath(0, 0, size - 1, size - 1);
                incPF.step(req.id, 100000);
                const incResult = incPF.getResult(req.id);

                expect(incResult?.found).toBe(syncResult.found);
                expect(incResult?.path.length).toBe(syncResult.path.length);
            }
        });
    });

    // =========================================================================
    // 路径有效性验证
    // =========================================================================

    describe('path validity', () => {
        it('should produce continuous path (no teleporting)', () => {
            const grid = new GridMap(20, 20);
            const incPF = new IncrementalAStarPathfinder(grid);

            const req = incPF.requestPath(0, 0, 19, 19);
            incPF.step(req.id, 10000);
            const result = incPF.getResult(req.id);

            expect(result?.found).toBe(true);

            // 验证路径连续性
            for (let i = 1; i < result!.path.length; i++) {
                const prev = result!.path[i - 1];
                const curr = result!.path[i];
                const dx = Math.abs(curr.x - prev.x);
                const dy = Math.abs(curr.y - prev.y);

                // 相邻点距离不应超过1（包括对角线）
                expect(dx).toBeLessThanOrEqual(1);
                expect(dy).toBeLessThanOrEqual(1);
                expect(dx + dy).toBeGreaterThan(0); // 不能是同一点
            }
        });

        it('should not pass through obstacles', () => {
            const grid = new GridMap(20, 20);

            // 创建障碍物
            for (let i = 5; i < 15; i++) {
                grid.setWalkable(10, i, false);
            }

            const incPF = new IncrementalAStarPathfinder(grid);
            const req = incPF.requestPath(5, 10, 15, 10);
            incPF.step(req.id, 10000);
            const result = incPF.getResult(req.id);

            expect(result?.found).toBe(true);

            // 验证路径上所有点都是可通行的
            for (const point of result!.path) {
                expect(grid.isWalkable(point.x, point.y)).toBe(true);
            }
        });

        it('should start and end at correct positions', () => {
            const grid = new GridMap(30, 30);
            const incPF = new IncrementalAStarPathfinder(grid);

            const testCases = [
                { start: { x: 0, y: 0 }, end: { x: 29, y: 29 } },
                { start: { x: 15, y: 0 }, end: { x: 15, y: 29 } },
                { start: { x: 0, y: 15 }, end: { x: 29, y: 15 } },
                { start: { x: 5, y: 5 }, end: { x: 25, y: 25 } },
            ];

            for (const tc of testCases) {
                const req = incPF.requestPath(tc.start.x, tc.start.y, tc.end.x, tc.end.y);
                incPF.step(req.id, 10000);
                const result = incPF.getResult(req.id);

                expect(result?.found).toBe(true);
                expect(result?.path[0]).toEqual(tc.start);
                expect(result?.path[result.path.length - 1]).toEqual(tc.end);

                incPF.cleanup(req.id);
            }
        });
    });

    // =========================================================================
    // 时间切片一致性
    // =========================================================================

    describe('time slicing consistency', () => {
        it('should produce same result regardless of step size', () => {
            const grid = new GridMap(50, 50);

            // 添加一些障碍
            for (let i = 10; i < 40; i++) {
                grid.setWalkable(25, i, false);
            }

            // 一次性完成
            const incPF1 = new IncrementalAStarPathfinder(grid);
            const req1 = incPF1.requestPath(10, 25, 40, 25);
            incPF1.step(req1.id, 100000);
            const result1 = incPF1.getResult(req1.id);

            // 每次1个迭代
            const incPF2 = new IncrementalAStarPathfinder(grid);
            const req2 = incPF2.requestPath(10, 25, 40, 25);
            let progress2 = incPF2.step(req2.id, 1);
            while (progress2.state === PathfindingState.InProgress) {
                progress2 = incPF2.step(req2.id, 1);
            }
            const result2 = incPF2.getResult(req2.id);

            // 每次10个迭代
            const incPF3 = new IncrementalAStarPathfinder(grid);
            const req3 = incPF3.requestPath(10, 25, 40, 25);
            let progress3 = incPF3.step(req3.id, 10);
            while (progress3.state === PathfindingState.InProgress) {
                progress3 = incPF3.step(req3.id, 10);
            }
            const result3 = incPF3.getResult(req3.id);

            expect(result1?.found).toBe(result2?.found);
            expect(result1?.found).toBe(result3?.found);
            expect(result1?.path.length).toBe(result2?.path.length);
            expect(result1?.path.length).toBe(result3?.path.length);

            // 路径应该完全相同
            for (let i = 0; i < result1!.path.length; i++) {
                expect(result1!.path[i]).toEqual(result2!.path[i]);
                expect(result1!.path[i]).toEqual(result3!.path[i]);
            }
        });

        it('should preserve state correctly after pause/resume', () => {
            const grid = new GridMap(100, 100);
            const incPF = new IncrementalAStarPathfinder(grid);

            // 正常完成
            const req1 = incPF.requestPath(0, 0, 99, 99);
            incPF.step(req1.id, 100000);
            const result1 = incPF.getResult(req1.id);
            incPF.cleanup(req1.id);

            // 带暂停/恢复
            const req2 = incPF.requestPath(0, 0, 99, 99);
            incPF.step(req2.id, 10);
            incPF.pause(req2.id);
            incPF.resume(req2.id);
            incPF.step(req2.id, 10);
            incPF.pause(req2.id);
            incPF.resume(req2.id);
            incPF.step(req2.id, 100000);
            const result2 = incPF.getResult(req2.id);

            expect(result1?.found).toBe(result2?.found);
            expect(result1?.path.length).toBe(result2?.path.length);
        });
    });

    // =========================================================================
    // 边界情况
    // =========================================================================

    describe('edge cases', () => {
        it('should handle 1x1 grid', () => {
            const grid = new GridMap(1, 1);
            const incPF = new IncrementalAStarPathfinder(grid);

            const req = incPF.requestPath(0, 0, 0, 0);
            const result = incPF.getResult(req.id);

            expect(result?.found).toBe(true);
            expect(result?.path.length).toBe(1);
        });

        it('should handle narrow corridor', () => {
            const grid = new GridMap(100, 3);

            // 只留中间一行可通行
            for (let x = 0; x < 100; x++) {
                grid.setWalkable(x, 0, false);
                grid.setWalkable(x, 2, false);
            }

            const incPF = new IncrementalAStarPathfinder(grid);
            const req = incPF.requestPath(0, 1, 99, 1);
            incPF.step(req.id, 10000);
            const result = incPF.getResult(req.id);

            expect(result?.found).toBe(true);
            expect(result?.path.length).toBe(100);

            // 所有点都应该在 y=1
            for (const p of result!.path) {
                expect(p.y).toBe(1);
            }
        });

        it('should handle spiral maze', () => {
            const size = 21;
            const grid = new GridMap(size, size);

            // 创建螺旋迷宫
            let left = 0, right = size - 1, top = 0, bottom = size - 1;
            let layer = 0;

            while (left < right && top < bottom) {
                // 根据层数决定是否留开口
                const hasGap = layer % 2 === 0;

                // Top wall
                for (let x = left; x <= right; x++) {
                    if (hasGap && x === right) continue;
                    if (top > 0) grid.setWalkable(x, top, false);
                }
                top++;

                // Right wall
                for (let y = top; y <= bottom; y++) {
                    if (hasGap && y === bottom) continue;
                    grid.setWalkable(right, y, false);
                }
                right--;

                // Bottom wall
                for (let x = right; x >= left; x--) {
                    if (!hasGap && x === left) continue;
                    grid.setWalkable(x, bottom, false);
                }
                bottom--;

                // Left wall
                for (let y = bottom; y >= top; y--) {
                    if (!hasGap && y === top) continue;
                    grid.setWalkable(left, y, false);
                }
                left++;

                layer++;
            }

            // 确保起点和终点可通行
            grid.setWalkable(0, 0, true);
            grid.setWalkable(size - 1, size - 1, true);

            const incPF = new IncrementalAStarPathfinder(grid);
            const req = incPF.requestPath(0, 0, size - 1, size - 1);
            incPF.step(req.id, 100000);
            const result = incPF.getResult(req.id);

            // 应该找到路径或正确报告无路径
            if (result?.found) {
                // 验证路径有效
                for (const p of result.path) {
                    expect(grid.isWalkable(p.x, p.y)).toBe(true);
                }
            }
        });

        it('should handle adjacent blocked cells correctly', () => {
            const grid = new GridMap(5, 5);

            // 在对角线上放置障碍物
            grid.setWalkable(1, 1, false);
            grid.setWalkable(2, 2, false);
            grid.setWalkable(3, 3, false);

            const incPF = new IncrementalAStarPathfinder(grid);
            const req = incPF.requestPath(0, 0, 4, 4);
            incPF.step(req.id, 10000);
            const result = incPF.getResult(req.id);

            expect(result?.found).toBe(true);

            // 路径不应该穿过障碍物
            for (const p of result!.path) {
                expect(grid.isWalkable(p.x, p.y)).toBe(true);
            }
        });
    });

    // =========================================================================
    // 多请求正确性
    // =========================================================================

    describe('multiple requests correctness', () => {
        it('should handle interleaved requests correctly', () => {
            const grid = new GridMap(20, 20);
            const incPF = new IncrementalAStarPathfinder(grid);

            // 创建多个请求
            const req1 = incPF.requestPath(0, 0, 19, 19);
            const req2 = incPF.requestPath(0, 19, 19, 0);
            const req3 = incPF.requestPath(10, 0, 10, 19);

            // 交替步进
            for (let i = 0; i < 100; i++) {
                incPF.step(req1.id, 5);
                incPF.step(req2.id, 5);
                incPF.step(req3.id, 5);
            }

            const result1 = incPF.getResult(req1.id);
            const result2 = incPF.getResult(req2.id);
            const result3 = incPF.getResult(req3.id);

            expect(result1?.found).toBe(true);
            expect(result2?.found).toBe(true);
            expect(result3?.found).toBe(true);

            expect(result1?.path[0]).toEqual({ x: 0, y: 0 });
            expect(result1?.path[result1.path.length - 1]).toEqual({ x: 19, y: 19 });

            expect(result2?.path[0]).toEqual({ x: 0, y: 19 });
            expect(result2?.path[result2.path.length - 1]).toEqual({ x: 19, y: 0 });

            expect(result3?.path[0]).toEqual({ x: 10, y: 0 });
            expect(result3?.path[result3.path.length - 1]).toEqual({ x: 10, y: 19 });
        });

        it('should not interfere between requests', () => {
            const grid = new GridMap(30, 30);

            // 为不同请求创建不同的障碍物场景
            const incPF = new IncrementalAStarPathfinder(grid);

            const requests: number[] = [];
            const expectedLengths: number[] = [];

            // 多个从不同起点到相同终点的请求
            for (let i = 0; i < 10; i++) {
                const req = incPF.requestPath(i, 0, 15, 15);
                requests.push(req.id);
            }

            // 全部完成
            for (const reqId of requests) {
                incPF.step(reqId, 10000);
            }

            // 验证每个请求都有正确的起点
            for (let i = 0; i < requests.length; i++) {
                const result = incPF.getResult(requests[i]);
                expect(result?.found).toBe(true);
                expect(result?.path[0]).toEqual({ x: i, y: 0 });
                expect(result?.path[result.path.length - 1]).toEqual({ x: 15, y: 15 });
            }
        });
    });

    // =========================================================================
    // 非对角线移动测试
    // =========================================================================

    describe('4-directional movement', () => {
        it('should work correctly with 4-directional grid', () => {
            const grid = new GridMap(10, 10, { allowDiagonal: false });
            const syncPF = new AStarPathfinder(grid);
            const incPF = new IncrementalAStarPathfinder(grid);

            const syncResult = syncPF.findPath(0, 0, 9, 9);
            const req = incPF.requestPath(0, 0, 9, 9);
            incPF.step(req.id, 10000);
            const incResult = incPF.getResult(req.id);

            expect(incResult?.found).toBe(syncResult.found);
            expect(incResult?.path.length).toBe(syncResult.path.length);

            // 验证没有对角线移动
            for (let i = 1; i < incResult!.path.length; i++) {
                const prev = incResult!.path[i - 1];
                const curr = incResult!.path[i];
                const dx = Math.abs(curr.x - prev.x);
                const dy = Math.abs(curr.y - prev.y);

                // 只能水平或垂直移动
                expect(dx + dy).toBe(1);
            }
        });
    });

    // =========================================================================
    // 代价计算测试
    // =========================================================================

    describe('cost calculation', () => {
        it('should calculate correct path cost', () => {
            const grid = new GridMap(10, 10, { allowDiagonal: false });
            const incPF = new IncrementalAStarPathfinder(grid);

            // 直线路径
            const req = incPF.requestPath(0, 0, 5, 0);
            incPF.step(req.id, 10000);
            const result = incPF.getResult(req.id);

            expect(result?.found).toBe(true);
            expect(result?.cost).toBe(5); // 5步，每步代价1
        });

        it('should respect custom cell costs', () => {
            const grid = new GridMap(10, 10, { allowDiagonal: false });

            // 设置高代价区域
            for (let x = 3; x < 7; x++) {
                for (let y = 0; y < 10; y++) {
                    grid.setCost(x, y, 10);
                }
            }

            const incPF = new IncrementalAStarPathfinder(grid);
            const req = incPF.requestPath(0, 5, 9, 5);
            incPF.step(req.id, 10000);
            const result = incPF.getResult(req.id);

            expect(result?.found).toBe(true);

            // 路径应该尽量绕过高代价区域或最小化通过
            // 验证路径代价是合理的
            expect(result?.cost).toBeGreaterThan(9); // 至少9步
        });
    });
});
