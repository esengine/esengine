import { describe, it, expect, beforeEach } from 'vitest';
import { AStarPathfinder } from '../../src/core/AStarPathfinder';
import { GridMap } from '../../src/grid/GridMap';

describe('AStarPathfinder', () => {
    let grid: GridMap;
    let pathfinder: AStarPathfinder;

    beforeEach(() => {
        grid = new GridMap(10, 10);
        pathfinder = new AStarPathfinder(grid);
    });

    // =========================================================================
    // Basic Pathfinding
    // =========================================================================

    describe('basic pathfinding', () => {
        it('should find path between adjacent nodes', () => {
            const result = pathfinder.findPath(0, 0, 1, 0);
            expect(result.found).toBe(true);
            expect(result.path.length).toBe(2);
            expect(result.path[0]).toEqual({ x: 0, y: 0 });
            expect(result.path[1]).toEqual({ x: 1, y: 0 });
        });

        it('should return start position for same start and end', () => {
            const result = pathfinder.findPath(5, 5, 5, 5);
            expect(result.found).toBe(true);
            expect(result.path.length).toBe(1);
            expect(result.path[0]).toEqual({ x: 5, y: 5 });
            expect(result.cost).toBe(0);
        });

        it('should find diagonal path', () => {
            const result = pathfinder.findPath(0, 0, 5, 5);
            expect(result.found).toBe(true);
            expect(result.path.length).toBeGreaterThan(1);
            expect(result.path[0]).toEqual({ x: 0, y: 0 });
            expect(result.path[result.path.length - 1]).toEqual({ x: 5, y: 5 });
        });

        it('should find path across grid', () => {
            const result = pathfinder.findPath(0, 0, 9, 9);
            expect(result.found).toBe(true);
            expect(result.path[0]).toEqual({ x: 0, y: 0 });
            expect(result.path[result.path.length - 1]).toEqual({ x: 9, y: 9 });
        });
    });

    // =========================================================================
    // Obstacles
    // =========================================================================

    describe('obstacles', () => {
        it('should find path around single obstacle', () => {
            grid.setWalkable(5, 5, false);
            const result = pathfinder.findPath(4, 5, 6, 5);
            expect(result.found).toBe(true);
            expect(result.path.length).toBeGreaterThan(2);
        });

        it('should find path around wall', () => {
            // Create vertical wall
            for (let y = 2; y <= 7; y++) {
                grid.setWalkable(5, y, false);
            }

            const result = pathfinder.findPath(3, 5, 7, 5);
            expect(result.found).toBe(true);
            // Path should go around the wall
            expect(result.path.every(p => p.x !== 5 || p.y < 2 || p.y > 7)).toBe(true);
        });

        it('should return empty path when blocked', () => {
            // Block completely around start
            grid.setWalkable(1, 0, false);
            grid.setWalkable(0, 1, false);
            grid.setWalkable(1, 1, false);

            const result = pathfinder.findPath(0, 0, 9, 9);
            expect(result.found).toBe(false);
            expect(result.path.length).toBe(0);
        });

        it('should return empty path when start is blocked', () => {
            grid.setWalkable(0, 0, false);
            const result = pathfinder.findPath(0, 0, 5, 5);
            expect(result.found).toBe(false);
        });

        it('should return empty path when end is blocked', () => {
            grid.setWalkable(5, 5, false);
            const result = pathfinder.findPath(0, 0, 5, 5);
            expect(result.found).toBe(false);
        });
    });

    // =========================================================================
    // Out of Bounds
    // =========================================================================

    describe('out of bounds', () => {
        it('should return empty path for out of bounds start', () => {
            const result = pathfinder.findPath(-1, 0, 5, 5);
            expect(result.found).toBe(false);
        });

        it('should return empty path for out of bounds end', () => {
            const result = pathfinder.findPath(0, 0, 100, 100);
            expect(result.found).toBe(false);
        });
    });

    // =========================================================================
    // Cost Calculation
    // =========================================================================

    describe('cost calculation', () => {
        it('should calculate correct cost for straight path', () => {
            const grid4 = new GridMap(10, 10, { allowDiagonal: false });
            const pathfinder4 = new AStarPathfinder(grid4);

            const result = pathfinder4.findPath(0, 0, 5, 0);
            expect(result.found).toBe(true);
            expect(result.cost).toBe(5);
        });

        it('should prefer lower cost paths', () => {
            // Create high cost area
            for (let y = 0; y < 10; y++) {
                grid.setCost(5, y, 10);
            }

            const result = pathfinder.findPath(4, 5, 6, 5);
            // Should go around the high cost column if possible
            expect(result.found).toBe(true);
        });
    });

    // =========================================================================
    // Options
    // =========================================================================

    describe('options', () => {
        it('should respect maxNodes limit', () => {
            // Large grid with path
            const largeGrid = new GridMap(100, 100);
            const largePF = new AStarPathfinder(largeGrid);

            const result = largePF.findPath(0, 0, 99, 99, { maxNodes: 10 });
            // Should fail due to node limit
            expect(result.nodesSearched).toBeLessThanOrEqual(10);
        });

        it('should use heuristic weight', () => {
            const result1 = pathfinder.findPath(0, 0, 9, 9, { heuristicWeight: 1.0 });
            const result2 = pathfinder.findPath(0, 0, 9, 9, { heuristicWeight: 2.0 });

            expect(result1.found).toBe(true);
            expect(result2.found).toBe(true);
            // Higher weight may search fewer nodes but may not be optimal
            expect(result2.nodesSearched).toBeLessThanOrEqual(result1.nodesSearched);
        });
    });

    // =========================================================================
    // Clear
    // =========================================================================

    describe('clear', () => {
        it('should allow reuse after clear', () => {
            const result1 = pathfinder.findPath(0, 0, 5, 5);
            expect(result1.found).toBe(true);

            pathfinder.clear();

            const result2 = pathfinder.findPath(0, 0, 9, 9);
            expect(result2.found).toBe(true);
        });
    });

    // =========================================================================
    // Maze
    // =========================================================================

    describe('maze solving', () => {
        it('should solve simple maze', () => {
            const mazeStr = `
..........
.########.
..........
.########.
..........
.########.
..........
.########.
..........
..........`.trim();

            grid.loadFromString(mazeStr);

            const result = pathfinder.findPath(0, 0, 9, 9);
            expect(result.found).toBe(true);
            // Path should not pass through walls
            for (const point of result.path) {
                expect(grid.isWalkable(point.x, point.y)).toBe(true);
            }
        });
    });

    // =========================================================================
    // Path Quality
    // =========================================================================

    describe('path quality', () => {
        it('should find shortest path in open area', () => {
            const result = pathfinder.findPath(0, 0, 3, 0);
            expect(result.found).toBe(true);
            // Straight line should be 4 points
            expect(result.path.length).toBe(4);
        });

        it('should find optimal diagonal path', () => {
            const result = pathfinder.findPath(0, 0, 3, 3);
            expect(result.found).toBe(true);
            // Pure diagonal should be 4 points
            expect(result.path.length).toBe(4);
        });
    });

    // =========================================================================
    // Nodes Searched
    // =========================================================================

    describe('nodesSearched', () => {
        it('should track nodes searched', () => {
            const result = pathfinder.findPath(0, 0, 9, 9);
            expect(result.nodesSearched).toBeGreaterThan(0);
        });

        it('should search only 1 node for same position', () => {
            const result = pathfinder.findPath(5, 5, 5, 5);
            expect(result.nodesSearched).toBe(1);
        });
    });
});
