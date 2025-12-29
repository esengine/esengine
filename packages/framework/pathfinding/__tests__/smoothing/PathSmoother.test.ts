import { describe, it, expect, beforeEach } from 'vitest';
import {
    bresenhamLineOfSight,
    raycastLineOfSight,
    LineOfSightSmoother,
    CatmullRomSmoother,
    CombinedSmoother
} from '../../src/smoothing/PathSmoother';
import { GridMap } from '../../src/grid/GridMap';
import { createPoint, type IPoint } from '../../src/core/IPathfinding';

describe('Line of Sight Functions', () => {
    let grid: GridMap;

    beforeEach(() => {
        grid = new GridMap(10, 10);
    });

    // =========================================================================
    // bresenhamLineOfSight
    // =========================================================================

    describe('bresenhamLineOfSight', () => {
        it('should return true for clear line', () => {
            expect(bresenhamLineOfSight(0, 0, 5, 5, grid)).toBe(true);
        });

        it('should return true for same point', () => {
            expect(bresenhamLineOfSight(5, 5, 5, 5, grid)).toBe(true);
        });

        it('should return true for horizontal line', () => {
            expect(bresenhamLineOfSight(0, 5, 9, 5, grid)).toBe(true);
        });

        it('should return true for vertical line', () => {
            expect(bresenhamLineOfSight(5, 0, 5, 9, grid)).toBe(true);
        });

        it('should return false when blocked', () => {
            grid.setWalkable(5, 5, false);
            expect(bresenhamLineOfSight(0, 0, 9, 9, grid)).toBe(false);
        });

        it('should return false when start is blocked', () => {
            grid.setWalkable(0, 0, false);
            expect(bresenhamLineOfSight(0, 0, 5, 5, grid)).toBe(false);
        });

        it('should return false when end is blocked', () => {
            grid.setWalkable(5, 5, false);
            expect(bresenhamLineOfSight(0, 0, 5, 5, grid)).toBe(false);
        });

        it('should detect obstacle in middle', () => {
            grid.setWalkable(3, 3, false);
            expect(bresenhamLineOfSight(0, 0, 6, 6, grid)).toBe(false);
        });
    });

    // =========================================================================
    // raycastLineOfSight
    // =========================================================================

    describe('raycastLineOfSight', () => {
        it('should return true for clear line', () => {
            expect(raycastLineOfSight(0, 0, 5, 5, grid)).toBe(true);
        });

        it('should return true for same point', () => {
            expect(raycastLineOfSight(5, 5, 5, 5, grid)).toBe(true);
        });

        it('should return false when blocked', () => {
            grid.setWalkable(5, 5, false);
            expect(raycastLineOfSight(0, 0, 9, 9, grid)).toBe(false);
        });

        it('should work with custom step size', () => {
            expect(raycastLineOfSight(0, 0, 5, 5, grid, 0.1)).toBe(true);
            grid.setWalkable(2, 2, false);
            expect(raycastLineOfSight(0, 0, 5, 5, grid, 0.1)).toBe(false);
        });
    });
});

describe('LineOfSightSmoother', () => {
    let grid: GridMap;
    let smoother: LineOfSightSmoother;

    beforeEach(() => {
        grid = new GridMap(20, 20);
        smoother = new LineOfSightSmoother();
    });

    it('should return same path for 2 or fewer points', () => {
        const path1: IPoint[] = [createPoint(0, 0)];
        expect(smoother.smooth(path1, grid)).toEqual(path1);

        const path2: IPoint[] = [createPoint(0, 0), createPoint(5, 5)];
        expect(smoother.smooth(path2, grid)).toEqual(path2);
    });

    it('should remove unnecessary waypoints on straight line', () => {
        const path: IPoint[] = [
            createPoint(0, 0),
            createPoint(1, 0),
            createPoint(2, 0),
            createPoint(3, 0),
            createPoint(4, 0),
            createPoint(5, 0)
        ];

        const result = smoother.smooth(path, grid);
        expect(result.length).toBe(2);
        expect(result[0]).toEqual(createPoint(0, 0));
        expect(result[1]).toEqual(createPoint(5, 0));
    });

    it('should remove unnecessary waypoints on diagonal', () => {
        const path: IPoint[] = [
            createPoint(0, 0),
            createPoint(1, 1),
            createPoint(2, 2),
            createPoint(3, 3),
            createPoint(4, 4),
            createPoint(5, 5)
        ];

        const result = smoother.smooth(path, grid);
        expect(result.length).toBe(2);
        expect(result[0]).toEqual(createPoint(0, 0));
        expect(result[1]).toEqual(createPoint(5, 5));
    });

    it('should keep waypoints around obstacles', () => {
        // Create obstacle
        grid.setWalkable(5, 5, false);

        const path: IPoint[] = [
            createPoint(0, 0),
            createPoint(4, 5),
            createPoint(6, 5),
            createPoint(10, 10)
        ];

        const result = smoother.smooth(path, grid);
        // Should keep at least start, one waypoint near obstacle, and end
        expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('should use custom line of sight function', () => {
        const customLOS = (x1: number, y1: number, x2: number, y2: number) => {
            // Always blocked
            return false;
        };

        const customSmoother = new LineOfSightSmoother(customLOS);
        const path: IPoint[] = [
            createPoint(0, 0),
            createPoint(1, 1),
            createPoint(2, 2)
        ];

        const result = customSmoother.smooth(path, grid);
        // Should not simplify because LOS always fails
        expect(result).toEqual(path);
    });
});

describe('CatmullRomSmoother', () => {
    let grid: GridMap;
    let smoother: CatmullRomSmoother;

    beforeEach(() => {
        grid = new GridMap(20, 20);
        smoother = new CatmullRomSmoother(5, 0.5);
    });

    it('should return same path for 2 or fewer points', () => {
        const path1: IPoint[] = [createPoint(0, 0)];
        expect(smoother.smooth(path1, grid)).toEqual(path1);

        const path2: IPoint[] = [createPoint(0, 0), createPoint(5, 5)];
        expect(smoother.smooth(path2, grid)).toEqual(path2);
    });

    it('should add interpolation points', () => {
        const path: IPoint[] = [
            createPoint(0, 0),
            createPoint(5, 0),
            createPoint(10, 0)
        ];

        const result = smoother.smooth(path, grid);
        // Should have more points due to interpolation
        expect(result.length).toBeGreaterThan(path.length);
    });

    it('should preserve start and end points', () => {
        const path: IPoint[] = [
            createPoint(0, 0),
            createPoint(5, 5),
            createPoint(10, 0)
        ];

        const result = smoother.smooth(path, grid);
        expect(result[0].x).toBeCloseTo(0, 1);
        expect(result[0].y).toBeCloseTo(0, 1);
        expect(result[result.length - 1]).toEqual(createPoint(10, 0));
    });

    it('should create smooth curve', () => {
        const path: IPoint[] = [
            createPoint(0, 0),
            createPoint(5, 5),
            createPoint(10, 0)
        ];

        const result = smoother.smooth(path, grid);

        // Check that middle points are near the original waypoint
        const middlePoints = result.filter(p =>
            Math.abs(p.x - 5) < 2 && Math.abs(p.y - 5) < 2
        );
        expect(middlePoints.length).toBeGreaterThan(0);
    });

    it('should work with different segment counts', () => {
        const smootherLow = new CatmullRomSmoother(2);
        const smootherHigh = new CatmullRomSmoother(10);

        const path: IPoint[] = [
            createPoint(0, 0),
            createPoint(5, 5),
            createPoint(10, 0)
        ];

        const resultLow = smootherLow.smooth(path, grid);
        const resultHigh = smootherHigh.smooth(path, grid);

        expect(resultHigh.length).toBeGreaterThan(resultLow.length);
    });
});

describe('CombinedSmoother', () => {
    let grid: GridMap;
    let smoother: CombinedSmoother;

    beforeEach(() => {
        grid = new GridMap(20, 20);
        smoother = new CombinedSmoother(5, 0.5);
    });

    it('should first simplify then curve smooth', () => {
        // Path with redundant points
        const path: IPoint[] = [
            createPoint(0, 0),
            createPoint(1, 0),
            createPoint(2, 0),
            createPoint(3, 0),
            createPoint(4, 0),
            createPoint(5, 0),
            createPoint(6, 3),
            createPoint(7, 6),
            createPoint(8, 6),
            createPoint(9, 6),
            createPoint(10, 6)
        ];

        const result = smoother.smooth(path, grid);

        // Should have smoothed the path
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].x).toBeCloseTo(0, 1);
        expect(result[result.length - 1]).toEqual(createPoint(10, 6));
    });

    it('should handle simple path', () => {
        const path: IPoint[] = [
            createPoint(0, 0),
            createPoint(10, 10)
        ];

        const result = smoother.smooth(path, grid);
        expect(result.length).toBe(2);
    });
});
