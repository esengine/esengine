import { describe, it, expect, beforeEach } from 'vitest';
import { IncrementalAStarPathfinder, createIncrementalAStarPathfinder } from '../../src/core/IncrementalAStarPathfinder';
import { PathfindingState } from '../../src/core/IIncrementalPathfinding';
import { GridMap } from '../../src/grid/GridMap';

describe('IncrementalAStarPathfinder', () => {
    let grid: GridMap;
    let pathfinder: IncrementalAStarPathfinder;

    beforeEach(() => {
        grid = new GridMap(10, 10);
        pathfinder = new IncrementalAStarPathfinder(grid);
    });

    // =========================================================================
    // Request Path
    // =========================================================================

    describe('requestPath', () => {
        it('should return request with unique ID', () => {
            const request1 = pathfinder.requestPath(0, 0, 5, 5);
            const request2 = pathfinder.requestPath(0, 0, 9, 9);

            expect(request1.id).not.toBe(request2.id);
        });

        it('should store request coordinates', () => {
            const request = pathfinder.requestPath(1, 2, 8, 9);

            expect(request.startX).toBe(1);
            expect(request.startY).toBe(2);
            expect(request.endX).toBe(8);
            expect(request.endY).toBe(9);
        });

        it('should set default priority', () => {
            const request = pathfinder.requestPath(0, 0, 5, 5);
            expect(request.priority).toBe(50);
        });

        it('should accept custom priority', () => {
            const request = pathfinder.requestPath(0, 0, 5, 5, { priority: 10 });
            expect(request.priority).toBe(10);
        });

        it('should immediately complete for same start and end', () => {
            const request = pathfinder.requestPath(5, 5, 5, 5);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.Completed);

            const result = pathfinder.getResult(request.id);
            expect(result?.found).toBe(true);
            expect(result?.path.length).toBe(1);
            expect(result?.path[0]).toEqual({ x: 5, y: 5 });
        });

        it('should immediately fail for blocked start', () => {
            grid.setWalkable(0, 0, false);
            const request = pathfinder.requestPath(0, 0, 5, 5);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.Failed);
        });

        it('should immediately fail for blocked end', () => {
            grid.setWalkable(5, 5, false);
            const request = pathfinder.requestPath(0, 0, 5, 5);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.Failed);
        });

        it('should immediately fail for out of bounds', () => {
            const request = pathfinder.requestPath(-1, 0, 5, 5);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.Failed);
        });
    });

    // =========================================================================
    // Step - Time Slicing
    // =========================================================================

    describe('step (time slicing)', () => {
        it('should start with InProgress state', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.InProgress);
        });

        it('should complete path with enough iterations', () => {
            const request = pathfinder.requestPath(0, 0, 5, 5);
            const progress = pathfinder.step(request.id, 1000);

            expect(progress.state).toBe(PathfindingState.Completed);
        });

        it('should stay InProgress with limited iterations', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            const progress = pathfinder.step(request.id, 1);

            expect(progress.state).toBe(PathfindingState.InProgress);
        });

        it('should complete over multiple steps', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            let progress = pathfinder.step(request.id, 5);
            let steps = 1;

            while (progress.state === PathfindingState.InProgress && steps < 100) {
                progress = pathfinder.step(request.id, 5);
                steps++;
            }

            expect(progress.state).toBe(PathfindingState.Completed);
            expect(steps).toBeGreaterThan(1);
        });

        it('should track nodes searched', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            const progress = pathfinder.step(request.id, 10);

            expect(progress.nodesSearched).toBeGreaterThan(0);
            expect(progress.nodesSearched).toBeLessThanOrEqual(10);
        });

        it('should track open list size', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            const progress = pathfinder.step(request.id, 5);

            expect(progress.openListSize).toBeGreaterThanOrEqual(0);
        });

        it('should estimate progress', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);

            const progress1 = pathfinder.step(request.id, 5);
            const progress2 = pathfinder.step(request.id, 10);

            if (progress2.state === PathfindingState.InProgress) {
                expect(progress2.estimatedProgress).toBeGreaterThanOrEqual(progress1.estimatedProgress);
            }
        });

        it('should return empty progress for invalid request', () => {
            const progress = pathfinder.step(99999, 100);

            expect(progress.state).toBe(PathfindingState.Idle);
            expect(progress.nodesSearched).toBe(0);
        });

        it('should not progress already completed request', () => {
            const request = pathfinder.requestPath(0, 0, 5, 5);
            pathfinder.step(request.id, 1000);

            const progress = pathfinder.step(request.id, 1000);
            expect(progress.state).toBe(PathfindingState.Completed);
        });
    });

    // =========================================================================
    // Get Result
    // =========================================================================

    describe('getResult', () => {
        it('should return null before completion', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            pathfinder.step(request.id, 1);

            const result = pathfinder.getResult(request.id);
            expect(result).toBeNull();
        });

        it('should return path after completion', () => {
            const request = pathfinder.requestPath(0, 0, 5, 5);
            pathfinder.step(request.id, 1000);

            const result = pathfinder.getResult(request.id);
            expect(result?.found).toBe(true);
            expect(result?.path.length).toBeGreaterThan(0);
            expect(result?.path[0]).toEqual({ x: 0, y: 0 });
            expect(result?.path[result.path.length - 1]).toEqual({ x: 5, y: 5 });
        });

        it('should return found: false when no path exists', () => {
            // Block completely around start
            grid.setWalkable(1, 0, false);
            grid.setWalkable(0, 1, false);
            grid.setWalkable(1, 1, false);

            const request = pathfinder.requestPath(0, 0, 9, 9);
            pathfinder.step(request.id, 1000);

            const result = pathfinder.getResult(request.id);
            expect(result?.found).toBe(false);
        });

        it('should include cost in result', () => {
            const request = pathfinder.requestPath(0, 0, 3, 0);
            pathfinder.step(request.id, 1000);

            const result = pathfinder.getResult(request.id);
            expect(result?.cost).toBeGreaterThan(0);
        });

        it('should include framesUsed in result', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);

            // Use very limited iterations to ensure multiple frames
            pathfinder.step(request.id, 2);
            pathfinder.step(request.id, 2);
            pathfinder.step(request.id, 2);
            pathfinder.step(request.id, 1000);

            const result = pathfinder.getResult(request.id);
            // Should have used at least 4 frames (4 step calls)
            expect(result?.framesUsed).toBeGreaterThanOrEqual(4);
        });

        it('should return null for invalid request', () => {
            const result = pathfinder.getResult(99999);
            expect(result).toBeNull();
        });
    });

    // =========================================================================
    // Pause and Resume
    // =========================================================================

    describe('pause and resume', () => {
        it('should pause in-progress request', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            pathfinder.step(request.id, 5);

            pathfinder.pause(request.id);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.Paused);
        });

        it('should not progress when paused', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            pathfinder.step(request.id, 5);

            pathfinder.pause(request.id);
            const progress1 = pathfinder.getProgress(request.id);

            pathfinder.step(request.id, 100);
            const progress2 = pathfinder.getProgress(request.id);

            expect(progress2?.nodesSearched).toBe(progress1?.nodesSearched);
        });

        it('should resume paused request', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            pathfinder.step(request.id, 5);
            pathfinder.pause(request.id);

            pathfinder.resume(request.id);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.InProgress);
        });

        it('should continue from where it left off after resume', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            pathfinder.step(request.id, 5);
            const progressBefore = pathfinder.getProgress(request.id);

            pathfinder.pause(request.id);
            pathfinder.resume(request.id);
            pathfinder.step(request.id, 5);
            const progressAfter = pathfinder.getProgress(request.id);

            expect(progressAfter?.nodesSearched).toBeGreaterThan(progressBefore?.nodesSearched ?? 0);
        });

        it('should ignore pause for completed request', () => {
            const request = pathfinder.requestPath(0, 0, 5, 5);
            pathfinder.step(request.id, 1000);

            pathfinder.pause(request.id);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.Completed);
        });

        it('should ignore resume for non-paused request', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            pathfinder.step(request.id, 5);

            pathfinder.resume(request.id);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.InProgress);
        });
    });

    // =========================================================================
    // Cancel
    // =========================================================================

    describe('cancel', () => {
        it('should cancel in-progress request', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            pathfinder.step(request.id, 5);

            pathfinder.cancel(request.id);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.Cancelled);
        });

        it('should cancel paused request', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            pathfinder.step(request.id, 5);
            pathfinder.pause(request.id);

            pathfinder.cancel(request.id);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.Cancelled);
        });

        it('should not cancel completed request', () => {
            const request = pathfinder.requestPath(0, 0, 5, 5);
            pathfinder.step(request.id, 1000);

            pathfinder.cancel(request.id);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.Completed);
        });

        it('should return empty result after cancel', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            pathfinder.step(request.id, 5);
            pathfinder.cancel(request.id);

            const result = pathfinder.getResult(request.id);
            expect(result?.found).toBe(false);
        });
    });

    // =========================================================================
    // Cleanup
    // =========================================================================

    describe('cleanup', () => {
        it('should remove request after cleanup', () => {
            const request = pathfinder.requestPath(0, 0, 5, 5);
            pathfinder.step(request.id, 1000);

            pathfinder.cleanup(request.id);

            const progress = pathfinder.getProgress(request.id);
            expect(progress).toBeNull();
        });

        it('should allow same ID to be reused after cleanup', () => {
            const request1 = pathfinder.requestPath(0, 0, 5, 5);
            pathfinder.step(request1.id, 1000);
            pathfinder.cleanup(request1.id);

            const request2 = pathfinder.requestPath(0, 0, 9, 9);
            expect(request2.id).toBeGreaterThanOrEqual(0);
        });
    });

    // =========================================================================
    // Clear All
    // =========================================================================

    describe('clear', () => {
        it('should clear all requests', () => {
            const request1 = pathfinder.requestPath(0, 0, 5, 5);
            const request2 = pathfinder.requestPath(0, 0, 9, 9);

            pathfinder.clear();

            expect(pathfinder.getProgress(request1.id)).toBeNull();
            expect(pathfinder.getProgress(request2.id)).toBeNull();
        });
    });

    // =========================================================================
    // Obstacle Change Notifications
    // =========================================================================

    describe('obstacle change notifications', () => {
        it('should mark affected session', () => {
            // Use a larger grid to ensure search takes time
            const largeGrid = new GridMap(30, 30);
            const largePF = new IncrementalAStarPathfinder(largeGrid);

            const request = largePF.requestPath(0, 0, 29, 29);
            // Only step a few iterations to keep search in progress
            largePF.step(request.id, 5);

            // The region includes cells near the start that will be explored
            largePF.notifyObstacleChange(0, 0, 3, 3);

            expect(largePF.isAffectedByChange(request.id)).toBe(true);
        });

        it('should not mark unaffected session', () => {
            const request = pathfinder.requestPath(0, 0, 2, 2);
            pathfinder.step(request.id, 10);

            pathfinder.notifyObstacleChange(8, 8, 9, 9);

            expect(pathfinder.isAffectedByChange(request.id)).toBe(false);
        });

        it('should clear change flag', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            pathfinder.step(request.id, 10);

            pathfinder.notifyObstacleChange(4, 4, 6, 6);
            pathfinder.clearChangeFlag(request.id);

            expect(pathfinder.isAffectedByChange(request.id)).toBe(false);
        });

        it('should mark session when start is in affected region', () => {
            const request = pathfinder.requestPath(5, 5, 9, 9);
            pathfinder.step(request.id, 1);

            pathfinder.notifyObstacleChange(4, 4, 6, 6);

            expect(pathfinder.isAffectedByChange(request.id)).toBe(true);
        });

        it('should mark session when end is in affected region', () => {
            const request = pathfinder.requestPath(0, 0, 5, 5);
            pathfinder.step(request.id, 1);

            pathfinder.notifyObstacleChange(4, 4, 6, 6);

            expect(pathfinder.isAffectedByChange(request.id)).toBe(true);
        });

        it('should not mark completed session', () => {
            const request = pathfinder.requestPath(0, 0, 3, 3);
            pathfinder.step(request.id, 1000);

            pathfinder.notifyObstacleChange(1, 1, 2, 2);

            expect(pathfinder.isAffectedByChange(request.id)).toBe(false);
        });
    });

    // =========================================================================
    // Multiple Concurrent Requests
    // =========================================================================

    describe('multiple concurrent requests', () => {
        it('should handle multiple requests independently', () => {
            const request1 = pathfinder.requestPath(0, 0, 5, 5);
            const request2 = pathfinder.requestPath(9, 9, 5, 5);

            pathfinder.step(request1.id, 1000);
            pathfinder.step(request2.id, 1000);

            const progress1 = pathfinder.getProgress(request1.id);
            const progress2 = pathfinder.getProgress(request2.id);

            expect(progress1?.state).toBe(PathfindingState.Completed);
            expect(progress2?.state).toBe(PathfindingState.Completed);
        });

        it('should step each request independently', () => {
            const request1 = pathfinder.requestPath(0, 0, 9, 9);
            const request2 = pathfinder.requestPath(9, 0, 0, 9);

            pathfinder.step(request1.id, 5);
            const progress1After = pathfinder.getProgress(request1.id);

            pathfinder.step(request2.id, 10);
            const progress2After = pathfinder.getProgress(request2.id);

            expect(progress1After?.nodesSearched).toBeLessThanOrEqual(5);
            expect(progress2After?.nodesSearched).toBeLessThanOrEqual(10);
        });

        it('should pause and resume independently', () => {
            const request1 = pathfinder.requestPath(0, 0, 9, 9);
            const request2 = pathfinder.requestPath(9, 0, 0, 9);

            pathfinder.step(request1.id, 5);
            pathfinder.step(request2.id, 5);

            pathfinder.pause(request1.id);

            expect(pathfinder.getProgress(request1.id)?.state).toBe(PathfindingState.Paused);
            expect(pathfinder.getProgress(request2.id)?.state).toBe(PathfindingState.InProgress);
        });
    });

    // =========================================================================
    // Path Quality
    // =========================================================================

    describe('path quality', () => {
        it('should find valid path avoiding obstacles', () => {
            grid.setWalkable(5, 5, false);

            const request = pathfinder.requestPath(4, 5, 6, 5);
            pathfinder.step(request.id, 1000);

            const result = pathfinder.getResult(request.id);
            expect(result?.found).toBe(true);

            for (const point of result!.path) {
                expect(grid.isWalkable(point.x, point.y)).toBe(true);
            }
        });

        it('should find path around wall', () => {
            for (let y = 2; y <= 7; y++) {
                grid.setWalkable(5, y, false);
            }

            const request = pathfinder.requestPath(3, 5, 7, 5);
            pathfinder.step(request.id, 1000);

            const result = pathfinder.getResult(request.id);
            expect(result?.found).toBe(true);

            for (const point of result!.path) {
                expect(grid.isWalkable(point.x, point.y)).toBe(true);
            }
        });

        it('should return correct start and end points', () => {
            const request = pathfinder.requestPath(1, 2, 8, 7);
            pathfinder.step(request.id, 1000);

            const result = pathfinder.getResult(request.id);
            expect(result?.path[0]).toEqual({ x: 1, y: 2 });
            expect(result?.path[result.path.length - 1]).toEqual({ x: 8, y: 7 });
        });
    });

    // =========================================================================
    // MaxNodes Option
    // =========================================================================

    describe('maxNodes option', () => {
        it('should fail when exceeding maxNodes', () => {
            const largeGrid = new GridMap(50, 50);
            const largePF = new IncrementalAStarPathfinder(largeGrid);

            const request = largePF.requestPath(0, 0, 49, 49, { maxNodes: 10 });
            largePF.step(request.id, 1000);

            const progress = largePF.getProgress(request.id);
            expect(progress?.state).toBe(PathfindingState.Failed);
        });
    });

    // =========================================================================
    // Factory Function
    // =========================================================================

    describe('createIncrementalAStarPathfinder', () => {
        it('should create a valid pathfinder instance', () => {
            const pf = createIncrementalAStarPathfinder(grid);

            const request = pf.requestPath(0, 0, 5, 5);
            pf.step(request.id, 1000);

            const result = pf.getResult(request.id);
            expect(result?.found).toBe(true);
        });
    });

    // =========================================================================
    // Edge Cases
    // =========================================================================

    describe('edge cases', () => {
        it('should handle 1x1 grid', () => {
            const tinyGrid = new GridMap(1, 1);
            const tinyPF = new IncrementalAStarPathfinder(tinyGrid);

            const request = tinyPF.requestPath(0, 0, 0, 0);
            const progress = tinyPF.getProgress(request.id);

            expect(progress?.state).toBe(PathfindingState.Completed);
        });

        it('should handle adjacent cells', () => {
            const request = pathfinder.requestPath(0, 0, 1, 0);
            pathfinder.step(request.id, 1000);

            const result = pathfinder.getResult(request.id);
            expect(result?.found).toBe(true);
            expect(result?.path.length).toBe(2);
        });

        it('should handle diagonal adjacent cells', () => {
            const request = pathfinder.requestPath(0, 0, 1, 1);
            pathfinder.step(request.id, 1000);

            const result = pathfinder.getResult(request.id);
            expect(result?.found).toBe(true);
            expect(result?.path.length).toBe(2);
        });

        it('should handle corner to corner', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            pathfinder.step(request.id, 1000);

            const result = pathfinder.getResult(request.id);
            expect(result?.found).toBe(true);
        });

        it('should handle stepping with 0 iterations', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            const progress = pathfinder.step(request.id, 0);

            expect(progress.state).toBe(PathfindingState.InProgress);
            expect(progress.nodesSearched).toBe(0);
        });
    });

    // =========================================================================
    // Progress Estimation
    // =========================================================================

    describe('progress estimation', () => {
        it('should return 0 progress at start', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);
            const progress = pathfinder.getProgress(request.id);

            expect(progress?.estimatedProgress).toBe(0);
        });

        it('should return 1 progress when completed', () => {
            const request = pathfinder.requestPath(0, 0, 5, 5);
            pathfinder.step(request.id, 1000);

            const progress = pathfinder.getProgress(request.id);
            expect(progress?.estimatedProgress).toBe(1);
        });

        it('should increase progress as search advances', () => {
            const request = pathfinder.requestPath(0, 0, 9, 9);

            pathfinder.step(request.id, 5);
            const progress1 = pathfinder.getProgress(request.id);

            pathfinder.step(request.id, 20);
            const progress2 = pathfinder.getProgress(request.id);

            if (progress2?.state === PathfindingState.InProgress) {
                expect(progress2.estimatedProgress).toBeGreaterThanOrEqual(progress1?.estimatedProgress ?? 0);
            }
        });
    });
});
