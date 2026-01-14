import { describe, it, expect, beforeEach } from 'vitest';
import { JPSPathfinder, createJPSPathfinder } from '../../src/core/JPSPathfinder';
import { AStarPathfinder } from '../../src/core/AStarPathfinder';
import { GridMap } from '../../src/grid/GridMap';

describe('JPSPathfinder', () => {
    let grid: GridMap;
    let jps: JPSPathfinder;

    beforeEach(() => {
        grid = new GridMap(50, 50);
        jps = new JPSPathfinder(grid);
    });

    // =========================================================================
    // 基础功能测试 | Basic Functionality Tests
    // =========================================================================

    describe('basic pathfinding', () => {
        it('should find path on empty grid', () => {
            const result = jps.findPath(0, 0, 49, 49);

            expect(result.found).toBe(true);
            expect(result.path.length).toBeGreaterThan(0);
            expect(result.path[0]).toEqual({ x: 0, y: 0 });
            expect(result.path[result.path.length - 1]).toEqual({ x: 49, y: 49 });
        });

        it('should return same position for start equals end', () => {
            const result = jps.findPath(10, 10, 10, 10);

            expect(result.found).toBe(true);
            expect(result.path).toEqual([{ x: 10, y: 10 }]);
            expect(result.cost).toBe(0);
        });

        it('should return empty result for unwalkable start', () => {
            grid.setWalkable(0, 0, false);
            const result = jps.findPath(0, 0, 10, 10);

            expect(result.found).toBe(false);
            expect(result.path).toEqual([]);
        });

        it('should return empty result for unwalkable end', () => {
            grid.setWalkable(49, 49, false);
            const result = jps.findPath(0, 0, 49, 49);

            expect(result.found).toBe(false);
            expect(result.path).toEqual([]);
        });

        it('should handle straight horizontal path', () => {
            const result = jps.findPath(0, 25, 49, 25);

            expect(result.found).toBe(true);
            expect(result.path.length).toBe(50);
            for (const point of result.path) {
                expect(point.y).toBe(25);
            }
        });

        it('should handle straight vertical path', () => {
            const result = jps.findPath(25, 0, 25, 49);

            expect(result.found).toBe(true);
            expect(result.path.length).toBe(50);
            for (const point of result.path) {
                expect(point.x).toBe(25);
            }
        });

        it('should handle diagonal path', () => {
            const result = jps.findPath(0, 0, 20, 20);

            expect(result.found).toBe(true);
            expect(result.path[0]).toEqual({ x: 0, y: 0 });
            expect(result.path[result.path.length - 1]).toEqual({ x: 20, y: 20 });
        });
    });

    // =========================================================================
    // 障碍物测试 | Obstacle Tests
    // =========================================================================

    describe('obstacle avoidance', () => {
        it('should navigate around simple obstacle', () => {
            // Create a wall
            for (let y = 10; y < 40; y++) {
                grid.setWalkable(25, y, false);
            }

            const result = jps.findPath(10, 25, 40, 25);

            expect(result.found).toBe(true);
            // Path should go around the wall
            for (const point of result.path) {
                expect(grid.isWalkable(point.x, point.y)).toBe(true);
            }
        });

        it('should find path through maze', () => {
            // Create a simple maze pattern
            for (let i = 0; i < 40; i++) {
                if (i % 10 !== 9) {
                    grid.setWalkable(10, i, false);
                }
            }
            for (let i = 10; i < 50; i++) {
                if (i % 10 !== 0) {
                    grid.setWalkable(20, i, false);
                }
            }
            for (let i = 0; i < 40; i++) {
                if (i % 10 !== 9) {
                    grid.setWalkable(30, i, false);
                }
            }

            const result = jps.findPath(5, 25, 45, 25);

            expect(result.found).toBe(true);
        });

        it('should return no path when completely blocked', () => {
            // Create a complete wall
            for (let y = 0; y < 50; y++) {
                grid.setWalkable(25, y, false);
            }

            const result = jps.findPath(10, 25, 40, 25);

            expect(result.found).toBe(false);
        });

        it('should handle corner obstacles', () => {
            // Block corner but leave path
            grid.setWalkable(24, 24, false);
            grid.setWalkable(25, 24, false);
            grid.setWalkable(24, 25, false);

            const result = jps.findPath(23, 23, 26, 26);

            expect(result.found).toBe(true);
        });
    });

    // =========================================================================
    // 与 A* 比较测试 | Comparison with A* Tests
    // =========================================================================

    describe('comparison with A*', () => {
        it('should find path when A* finds path', () => {
            const astar = new AStarPathfinder(grid);

            // Add some obstacles
            for (let i = 10; i < 40; i++) {
                grid.setWalkable(25, i, false);
            }

            const jpsResult = jps.findPath(5, 25, 45, 25);
            const astarResult = astar.findPath(5, 25, 45, 25);

            expect(jpsResult.found).toBe(astarResult.found);
        });

        it('should find optimal path (same cost as A*)', () => {
            const astar = new AStarPathfinder(grid);

            // Test on open grid
            const jpsResult = jps.findPath(0, 0, 30, 30);
            const astarResult = astar.findPath(0, 0, 30, 30);

            expect(jpsResult.found).toBe(true);
            expect(astarResult.found).toBe(true);
            // JPS should find optimal path (same cost)
            expect(Math.abs(jpsResult.cost - astarResult.cost)).toBeLessThan(0.001);
        });

        it('should search fewer nodes than A* on open terrain', () => {
            const astar = new AStarPathfinder(grid);

            const jpsResult = jps.findPath(0, 0, 49, 49);
            const astarResult = astar.findPath(0, 0, 49, 49);

            expect(jpsResult.found).toBe(true);
            expect(astarResult.found).toBe(true);
            // JPS should search fewer nodes on open terrain
            expect(jpsResult.nodesSearched).toBeLessThan(astarResult.nodesSearched);
        });

        it('should produce valid interpolated path', () => {
            const result = jps.findPath(0, 0, 30, 20);

            expect(result.found).toBe(true);
            // Check that path is continuous (each step is adjacent)
            for (let i = 1; i < result.path.length; i++) {
                const prev = result.path[i - 1];
                const curr = result.path[i];
                const dx = Math.abs(curr.x - prev.x);
                const dy = Math.abs(curr.y - prev.y);
                // Each step should be at most 1 in each direction
                expect(dx).toBeLessThanOrEqual(1);
                expect(dy).toBeLessThanOrEqual(1);
                // At least one direction should change
                expect(dx + dy).toBeGreaterThan(0);
            }
        });
    });

    // =========================================================================
    // 选项测试 | Options Tests
    // =========================================================================

    describe('pathfinding options', () => {
        it('should respect maxNodes limit', () => {
            const result = jps.findPath(0, 0, 49, 49, { maxNodes: 10 });

            // With very limited nodes, might not find path
            expect(result.nodesSearched).toBeLessThanOrEqual(10);
        });

        it('should use heuristic weight', () => {
            const result1 = jps.findPath(0, 0, 30, 30, { heuristicWeight: 1.0 });
            const result2 = jps.findPath(0, 0, 30, 30, { heuristicWeight: 2.0 });

            expect(result1.found).toBe(true);
            expect(result2.found).toBe(true);
            // Higher weight might search fewer nodes but potentially suboptimal path
            expect(result2.nodesSearched).toBeLessThanOrEqual(result1.nodesSearched);
        });
    });

    // =========================================================================
    // 边界情况测试 | Edge Case Tests
    // =========================================================================

    describe('edge cases', () => {
        it('should handle path along boundary', () => {
            const result = jps.findPath(0, 0, 49, 0);

            expect(result.found).toBe(true);
            expect(result.path.length).toBe(50);
        });

        it('should handle narrow corridor', () => {
            // Create narrow corridor
            for (let x = 10; x < 40; x++) {
                for (let y = 0; y < 50; y++) {
                    if (y !== 25) {
                        grid.setWalkable(x, y, false);
                    }
                }
            }

            const result = jps.findPath(5, 25, 45, 25);

            expect(result.found).toBe(true);
        });

        it('should handle single cell gap', () => {
            // Create wall with single cell gap
            for (let y = 0; y < 50; y++) {
                if (y !== 25) {
                    grid.setWalkable(25, y, false);
                }
            }

            const result = jps.findPath(10, 25, 40, 25);

            expect(result.found).toBe(true);
            // Path must pass through the gap
            const throughGap = result.path.some(p => p.x === 25 && p.y === 25);
            expect(throughGap).toBe(true);
        });

        it('should clear state properly', () => {
            jps.findPath(0, 0, 49, 49);
            jps.clear();

            // Should still work after clear
            const result = jps.findPath(0, 0, 10, 10);
            expect(result.found).toBe(true);
        });
    });

    // =========================================================================
    // 工厂函数测试 | Factory Function Tests
    // =========================================================================

    describe('factory function', () => {
        it('should create pathfinder with createJPSPathfinder', () => {
            const pathfinder = createJPSPathfinder(grid);

            expect(pathfinder).toBeInstanceOf(JPSPathfinder);

            const result = pathfinder.findPath(0, 0, 20, 20);
            expect(result.found).toBe(true);
        });
    });

    // =========================================================================
    // 大地图测试 | Large Map Tests
    // =========================================================================

    describe('large map performance', () => {
        it('should handle 200x200 grid efficiently', () => {
            const largeGrid = new GridMap(200, 200);
            const largeJps = new JPSPathfinder(largeGrid);

            const start = performance.now();
            const result = largeJps.findPath(0, 0, 199, 199);
            const time = performance.now() - start;

            expect(result.found).toBe(true);
            // Should complete quickly on open terrain
            expect(time).toBeLessThan(50); // 50ms max
        });

        it('should search fewer nodes than A* on large open terrain', () => {
            const largeGrid = new GridMap(200, 200);
            const largeJps = new JPSPathfinder(largeGrid);
            const largeAstar = new AStarPathfinder(largeGrid);

            // Warmup runs to eliminate JIT compilation effects
            largeJps.findPath(0, 0, 50, 50);
            largeAstar.findPath(0, 0, 50, 50);

            const jpsResult = largeJps.findPath(0, 0, 199, 199);
            const astarResult = largeAstar.findPath(0, 0, 199, 199);

            expect(jpsResult.found).toBe(true);
            expect(astarResult.found).toBe(true);

            // JPS should search significantly fewer nodes on open terrain
            // This is the main advantage of JPS
            expect(jpsResult.nodesSearched).toBeLessThan(astarResult.nodesSearched / 5);

            // Both should find optimal paths
            expect(Math.abs(jpsResult.cost - astarResult.cost)).toBeLessThan(0.001);
        });
    });

    // =========================================================================
    // 路径连续性测试 | Path Continuity Tests
    // =========================================================================

    describe('path continuity', () => {
        it('should produce continuous path for all directions', () => {
            const testCases = [
                { start: { x: 0, y: 0 }, end: { x: 30, y: 0 } },   // horizontal
                { start: { x: 0, y: 0 }, end: { x: 0, y: 30 } },   // vertical
                { start: { x: 0, y: 0 }, end: { x: 30, y: 30 } },  // diagonal
                { start: { x: 30, y: 0 }, end: { x: 0, y: 30 } },  // anti-diagonal
                { start: { x: 10, y: 5 }, end: { x: 40, y: 35 } }, // mixed
            ];

            for (const { start, end } of testCases) {
                const result = jps.findPath(start.x, start.y, end.x, end.y);
                expect(result.found).toBe(true);

                // Verify continuity
                for (let i = 1; i < result.path.length; i++) {
                    const prev = result.path[i - 1];
                    const curr = result.path[i];
                    const dx = Math.abs(curr.x - prev.x);
                    const dy = Math.abs(curr.y - prev.y);
                    expect(dx).toBeLessThanOrEqual(1);
                    expect(dy).toBeLessThanOrEqual(1);
                    expect(dx + dy).toBeGreaterThan(0);
                }
            }
        });
    });
});
