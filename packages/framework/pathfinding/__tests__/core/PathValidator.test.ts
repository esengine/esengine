import { describe, it, expect, beforeEach } from 'vitest';
import {
    PathValidator,
    ObstacleChangeManager,
    createPathValidator,
    createObstacleChangeManager
} from '../../src/core/PathValidator';
import { GridMap } from '../../src/grid/GridMap';
import type { IPoint } from '../../src/core/IPathfinding';

describe('PathValidator', () => {
    let grid: GridMap;
    let validator: PathValidator;

    beforeEach(() => {
        grid = new GridMap(10, 10);
        validator = new PathValidator();
    });

    // =========================================================================
    // Basic Validation
    // =========================================================================

    describe('basic validation', () => {
        it('should validate empty path', () => {
            const result = validator.validatePath([], 0, 0, grid);
            expect(result.valid).toBe(true);
            expect(result.invalidIndex).toBe(-1);
        });

        it('should validate single point path', () => {
            const path: IPoint[] = [{ x: 5, y: 5 }];
            const result = validator.validatePath(path, 0, 1, grid);

            expect(result.valid).toBe(true);
            expect(result.invalidIndex).toBe(-1);
        });

        it('should validate straight line path', () => {
            const path: IPoint[] = [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 0 }
            ];
            const result = validator.validatePath(path, 0, path.length, grid);

            expect(result.valid).toBe(true);
        });

        it('should validate diagonal path', () => {
            const path: IPoint[] = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 3 }
            ];
            const result = validator.validatePath(path, 0, path.length, grid);

            expect(result.valid).toBe(true);
        });
    });

    // =========================================================================
    // Invalid Path Detection
    // =========================================================================

    describe('invalid path detection', () => {
        it('should detect blocked point in path', () => {
            grid.setWalkable(2, 0, false);

            const path: IPoint[] = [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 0 }
            ];
            const result = validator.validatePath(path, 0, path.length, grid);

            expect(result.valid).toBe(false);
            expect(result.invalidIndex).toBe(2);
        });

        it('should detect blocked start point', () => {
            grid.setWalkable(0, 0, false);

            const path: IPoint[] = [
                { x: 0, y: 0 },
                { x: 1, y: 0 }
            ];
            const result = validator.validatePath(path, 0, path.length, grid);

            expect(result.valid).toBe(false);
            expect(result.invalidIndex).toBe(0);
        });

        it('should detect blocked end point', () => {
            grid.setWalkable(3, 0, false);

            const path: IPoint[] = [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 0 }
            ];
            const result = validator.validatePath(path, 0, path.length, grid);

            expect(result.valid).toBe(false);
            expect(result.invalidIndex).toBe(3);
        });

        it('should detect obstacle between path points', () => {
            grid.setWalkable(1, 0, false);

            const path: IPoint[] = [
                { x: 0, y: 0 },
                { x: 2, y: 0 }
            ];
            const result = validator.validatePath(path, 0, path.length, grid);

            expect(result.valid).toBe(false);
            expect(result.invalidIndex).toBe(1);
        });
    });

    // =========================================================================
    // Partial Validation
    // =========================================================================

    describe('partial validation', () => {
        it('should validate only specified range', () => {
            grid.setWalkable(4, 0, false);

            const path: IPoint[] = [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 0 },
                { x: 4, y: 0 }
            ];

            // Validate only first 3 points
            const result = validator.validatePath(path, 0, 3, grid);
            expect(result.valid).toBe(true);
        });

        it('should validate from middle of path', () => {
            grid.setWalkable(0, 0, false);

            const path: IPoint[] = [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 0 }
            ];

            // Start from index 1
            const result = validator.validatePath(path, 1, path.length, grid);
            expect(result.valid).toBe(true);
        });

        it('should handle out of bounds end index', () => {
            const path: IPoint[] = [
                { x: 0, y: 0 },
                { x: 1, y: 0 }
            ];

            // End index exceeds path length
            const result = validator.validatePath(path, 0, 100, grid);
            expect(result.valid).toBe(true);
        });
    });

    // =========================================================================
    // Line of Sight
    // =========================================================================

    describe('line of sight checking', () => {
        it('should detect obstacle blocking line of sight', () => {
            grid.setWalkable(2, 2, false);

            const path: IPoint[] = [
                { x: 0, y: 0 },
                { x: 4, y: 4 }
            ];
            const result = validator.validatePath(path, 0, path.length, grid);

            expect(result.valid).toBe(false);
        });

        it('should pass when line of sight is clear', () => {
            const path: IPoint[] = [
                { x: 0, y: 0 },
                { x: 4, y: 4 }
            ];
            const result = validator.validatePath(path, 0, path.length, grid);

            expect(result.valid).toBe(true);
        });

        it('should detect vertical obstacle', () => {
            grid.setWalkable(2, 1, false);
            grid.setWalkable(2, 2, false);
            grid.setWalkable(2, 3, false);

            const path: IPoint[] = [
                { x: 0, y: 2 },
                { x: 4, y: 2 }
            ];
            const result = validator.validatePath(path, 0, path.length, grid);

            expect(result.valid).toBe(false);
        });
    });

    // =========================================================================
    // Factory Function
    // =========================================================================

    describe('createPathValidator', () => {
        it('should create valid validator instance', () => {
            const v = createPathValidator();
            const path: IPoint[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
            const result = v.validatePath(path, 0, path.length, grid);

            expect(result.valid).toBe(true);
        });
    });
});

describe('ObstacleChangeManager', () => {
    let manager: ObstacleChangeManager;

    beforeEach(() => {
        manager = new ObstacleChangeManager();
    });

    // =========================================================================
    // Record Changes
    // =========================================================================

    describe('recordChange', () => {
        it('should record single change', () => {
            manager.recordChange(5, 10, true);

            expect(manager.hasChanges()).toBe(true);
            const changes = manager.getChanges();
            expect(changes.length).toBe(1);
            expect(changes[0].x).toBe(5);
            expect(changes[0].y).toBe(10);
            expect(changes[0].wasWalkable).toBe(true);
        });

        it('should record multiple changes', () => {
            manager.recordChange(0, 0, true);
            manager.recordChange(1, 1, false);
            manager.recordChange(2, 2, true);

            expect(manager.getChanges().length).toBe(3);
        });

        it('should overwrite change at same position', () => {
            manager.recordChange(5, 5, true);
            manager.recordChange(5, 5, false);

            const changes = manager.getChanges();
            expect(changes.length).toBe(1);
            expect(changes[0].wasWalkable).toBe(false);
        });

        it('should record timestamp', () => {
            const before = Date.now();
            manager.recordChange(0, 0, true);
            const after = Date.now();

            const change = manager.getChanges()[0];
            expect(change.timestamp).toBeGreaterThanOrEqual(before);
            expect(change.timestamp).toBeLessThanOrEqual(after);
        });
    });

    // =========================================================================
    // Affected Region
    // =========================================================================

    describe('getAffectedRegion', () => {
        it('should return null when no changes', () => {
            expect(manager.getAffectedRegion()).toBeNull();
        });

        it('should return single point region for single change', () => {
            manager.recordChange(5, 7, true);

            const region = manager.getAffectedRegion();
            expect(region).toEqual({ minX: 5, minY: 7, maxX: 5, maxY: 7 });
        });

        it('should return bounding box for multiple changes', () => {
            manager.recordChange(2, 3, true);
            manager.recordChange(8, 1, false);
            manager.recordChange(5, 9, true);

            const region = manager.getAffectedRegion();
            expect(region).toEqual({ minX: 2, minY: 1, maxX: 8, maxY: 9 });
        });
    });

    // =========================================================================
    // Has Changes
    // =========================================================================

    describe('hasChanges', () => {
        it('should return false initially', () => {
            expect(manager.hasChanges()).toBe(false);
        });

        it('should return true after recording change', () => {
            manager.recordChange(0, 0, true);
            expect(manager.hasChanges()).toBe(true);
        });

        it('should return false after flush', () => {
            manager.recordChange(0, 0, true);
            manager.flush();
            expect(manager.hasChanges()).toBe(false);
        });
    });

    // =========================================================================
    // Epoch
    // =========================================================================

    describe('epoch', () => {
        it('should start at 0', () => {
            expect(manager.getEpoch()).toBe(0);
        });

        it('should increment on flush', () => {
            manager.recordChange(0, 0, true);
            manager.flush();
            expect(manager.getEpoch()).toBe(1);

            manager.recordChange(1, 1, true);
            manager.flush();
            expect(manager.getEpoch()).toBe(2);
        });

        it('should reset to 0 on clear', () => {
            manager.flush();
            manager.flush();
            expect(manager.getEpoch()).toBe(2);

            manager.clear();
            expect(manager.getEpoch()).toBe(0);
        });
    });

    // =========================================================================
    // Flush
    // =========================================================================

    describe('flush', () => {
        it('should clear all changes', () => {
            manager.recordChange(0, 0, true);
            manager.recordChange(1, 1, false);

            manager.flush();

            expect(manager.hasChanges()).toBe(false);
            expect(manager.getChanges().length).toBe(0);
        });

        it('should increment epoch', () => {
            const beforeEpoch = manager.getEpoch();
            manager.flush();
            expect(manager.getEpoch()).toBe(beforeEpoch + 1);
        });
    });

    // =========================================================================
    // Clear
    // =========================================================================

    describe('clear', () => {
        it('should clear changes and reset epoch', () => {
            manager.recordChange(0, 0, true);
            manager.flush();
            manager.recordChange(1, 1, false);

            manager.clear();

            expect(manager.hasChanges()).toBe(false);
            expect(manager.getEpoch()).toBe(0);
        });
    });

    // =========================================================================
    // Factory Function
    // =========================================================================

    describe('createObstacleChangeManager', () => {
        it('should create valid manager instance', () => {
            const m = createObstacleChangeManager();
            m.recordChange(5, 5, true);
            expect(m.hasChanges()).toBe(true);
        });
    });
});
