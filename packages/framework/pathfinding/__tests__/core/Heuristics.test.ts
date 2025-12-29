import { describe, it, expect } from 'vitest';
import {
    manhattanDistance,
    euclideanDistance,
    chebyshevDistance,
    octileDistance,
    createPoint
} from '../../src/core/IPathfinding';

describe('Heuristic Functions', () => {
    // =========================================================================
    // Manhattan Distance
    // =========================================================================

    describe('manhattanDistance', () => {
        it('should return 0 for same point', () => {
            const p = createPoint(5, 5);
            expect(manhattanDistance(p, p)).toBe(0);
        });

        it('should calculate horizontal distance', () => {
            const a = createPoint(0, 0);
            const b = createPoint(5, 0);
            expect(manhattanDistance(a, b)).toBe(5);
        });

        it('should calculate vertical distance', () => {
            const a = createPoint(0, 0);
            const b = createPoint(0, 5);
            expect(manhattanDistance(a, b)).toBe(5);
        });

        it('should calculate diagonal distance', () => {
            const a = createPoint(0, 0);
            const b = createPoint(3, 4);
            expect(manhattanDistance(a, b)).toBe(7); // |3| + |4| = 7
        });

        it('should handle negative coordinates', () => {
            const a = createPoint(-2, -3);
            const b = createPoint(2, 3);
            expect(manhattanDistance(a, b)).toBe(10); // |4| + |6| = 10
        });

        it('should be symmetric', () => {
            const a = createPoint(1, 2);
            const b = createPoint(4, 6);
            expect(manhattanDistance(a, b)).toBe(manhattanDistance(b, a));
        });
    });

    // =========================================================================
    // Euclidean Distance
    // =========================================================================

    describe('euclideanDistance', () => {
        it('should return 0 for same point', () => {
            const p = createPoint(5, 5);
            expect(euclideanDistance(p, p)).toBe(0);
        });

        it('should calculate horizontal distance', () => {
            const a = createPoint(0, 0);
            const b = createPoint(5, 0);
            expect(euclideanDistance(a, b)).toBe(5);
        });

        it('should calculate vertical distance', () => {
            const a = createPoint(0, 0);
            const b = createPoint(0, 5);
            expect(euclideanDistance(a, b)).toBe(5);
        });

        it('should calculate 3-4-5 triangle', () => {
            const a = createPoint(0, 0);
            const b = createPoint(3, 4);
            expect(euclideanDistance(a, b)).toBe(5);
        });

        it('should calculate diagonal distance', () => {
            const a = createPoint(0, 0);
            const b = createPoint(1, 1);
            expect(euclideanDistance(a, b)).toBeCloseTo(Math.SQRT2, 10);
        });

        it('should handle negative coordinates', () => {
            const a = createPoint(-3, -4);
            const b = createPoint(0, 0);
            expect(euclideanDistance(a, b)).toBe(5);
        });

        it('should be symmetric', () => {
            const a = createPoint(1, 2);
            const b = createPoint(4, 6);
            expect(euclideanDistance(a, b)).toBeCloseTo(euclideanDistance(b, a), 10);
        });
    });

    // =========================================================================
    // Chebyshev Distance
    // =========================================================================

    describe('chebyshevDistance', () => {
        it('should return 0 for same point', () => {
            const p = createPoint(5, 5);
            expect(chebyshevDistance(p, p)).toBe(0);
        });

        it('should calculate horizontal distance', () => {
            const a = createPoint(0, 0);
            const b = createPoint(5, 0);
            expect(chebyshevDistance(a, b)).toBe(5);
        });

        it('should calculate vertical distance', () => {
            const a = createPoint(0, 0);
            const b = createPoint(0, 5);
            expect(chebyshevDistance(a, b)).toBe(5);
        });

        it('should calculate diagonal as max of dx, dy', () => {
            const a = createPoint(0, 0);
            const b = createPoint(3, 4);
            expect(chebyshevDistance(a, b)).toBe(4); // max(3, 4) = 4
        });

        it('should return same value for equal dx and dy', () => {
            const a = createPoint(0, 0);
            const b = createPoint(5, 5);
            expect(chebyshevDistance(a, b)).toBe(5);
        });

        it('should be symmetric', () => {
            const a = createPoint(1, 2);
            const b = createPoint(4, 6);
            expect(chebyshevDistance(a, b)).toBe(chebyshevDistance(b, a));
        });
    });

    // =========================================================================
    // Octile Distance
    // =========================================================================

    describe('octileDistance', () => {
        it('should return 0 for same point', () => {
            const p = createPoint(5, 5);
            expect(octileDistance(p, p)).toBe(0);
        });

        it('should calculate horizontal distance', () => {
            const a = createPoint(0, 0);
            const b = createPoint(5, 0);
            expect(octileDistance(a, b)).toBe(5);
        });

        it('should calculate vertical distance', () => {
            const a = createPoint(0, 0);
            const b = createPoint(0, 5);
            expect(octileDistance(a, b)).toBe(5);
        });

        it('should calculate pure diagonal distance', () => {
            const a = createPoint(0, 0);
            const b = createPoint(5, 5);
            // 5 diagonal moves = 5 * sqrt(2)
            expect(octileDistance(a, b)).toBeCloseTo(5 * Math.SQRT2, 10);
        });

        it('should calculate mixed diagonal and straight', () => {
            const a = createPoint(0, 0);
            const b = createPoint(3, 5);
            // 3 diagonal + 2 straight = 3*sqrt(2) + 2
            const expected = 3 * Math.SQRT2 + 2;
            expect(octileDistance(a, b)).toBeCloseTo(expected, 10);
        });

        it('should be symmetric', () => {
            const a = createPoint(1, 2);
            const b = createPoint(4, 6);
            expect(octileDistance(a, b)).toBeCloseTo(octileDistance(b, a), 10);
        });

        it('should be between Manhattan and Euclidean for diagonal', () => {
            const a = createPoint(0, 0);
            const b = createPoint(3, 4);

            const manhattan = manhattanDistance(a, b);
            const euclidean = euclideanDistance(a, b);
            const octile = octileDistance(a, b);

            expect(octile).toBeLessThan(manhattan);
            expect(octile).toBeGreaterThan(euclidean);
        });
    });

    // =========================================================================
    // createPoint
    // =========================================================================

    describe('createPoint', () => {
        it('should create point with correct coordinates', () => {
            const p = createPoint(3, 4);
            expect(p.x).toBe(3);
            expect(p.y).toBe(4);
        });

        it('should handle negative coordinates', () => {
            const p = createPoint(-5, -10);
            expect(p.x).toBe(-5);
            expect(p.y).toBe(-10);
        });

        it('should handle decimal coordinates', () => {
            const p = createPoint(3.5, 4.7);
            expect(p.x).toBe(3.5);
            expect(p.y).toBe(4.7);
        });
    });
});
