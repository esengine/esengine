import { describe, it, expect, beforeEach } from 'vitest';
import { GridMap, GridNode, DIRECTIONS_4, DIRECTIONS_8 } from '../../src/grid/GridMap';

describe('GridMap', () => {
    let grid: GridMap;

    beforeEach(() => {
        grid = new GridMap(10, 10);
    });

    // =========================================================================
    // Construction
    // =========================================================================

    describe('construction', () => {
        it('should create grid with correct dimensions', () => {
            expect(grid.width).toBe(10);
            expect(grid.height).toBe(10);
        });

        it('should have all nodes walkable by default', () => {
            for (let y = 0; y < 10; y++) {
                for (let x = 0; x < 10; x++) {
                    expect(grid.isWalkable(x, y)).toBe(true);
                }
            }
        });

        it('should create small grid', () => {
            const small = new GridMap(1, 1);
            expect(small.width).toBe(1);
            expect(small.height).toBe(1);
            expect(small.getNodeAt(0, 0)).not.toBeNull();
        });
    });

    // =========================================================================
    // Node Access
    // =========================================================================

    describe('getNodeAt', () => {
        it('should return node at valid position', () => {
            const node = grid.getNodeAt(5, 5);
            expect(node).not.toBeNull();
            expect(node?.position.x).toBe(5);
            expect(node?.position.y).toBe(5);
        });

        it('should return null for out of bounds', () => {
            expect(grid.getNodeAt(-1, 0)).toBeNull();
            expect(grid.getNodeAt(0, -1)).toBeNull();
            expect(grid.getNodeAt(10, 0)).toBeNull();
            expect(grid.getNodeAt(0, 10)).toBeNull();
        });

        it('should return node with correct id', () => {
            const node = grid.getNodeAt(3, 4);
            expect(node?.id).toBe('3,4');
        });
    });

    // =========================================================================
    // Walkability
    // =========================================================================

    describe('walkability', () => {
        it('should set and get walkability', () => {
            grid.setWalkable(5, 5, false);
            expect(grid.isWalkable(5, 5)).toBe(false);

            grid.setWalkable(5, 5, true);
            expect(grid.isWalkable(5, 5)).toBe(true);
        });

        it('should return false for out of bounds', () => {
            expect(grid.isWalkable(-1, 0)).toBe(false);
            expect(grid.isWalkable(100, 100)).toBe(false);
        });

        it('should handle setWalkable on invalid position gracefully', () => {
            grid.setWalkable(-1, -1, false); // Should not throw
        });
    });

    // =========================================================================
    // Cost
    // =========================================================================

    describe('cost', () => {
        it('should set and get cost', () => {
            grid.setCost(5, 5, 2.5);
            const node = grid.getNodeAt(5, 5);
            expect(node?.cost).toBe(2.5);
        });

        it('should default cost to 1', () => {
            const node = grid.getNodeAt(5, 5);
            expect(node?.cost).toBe(1);
        });
    });

    // =========================================================================
    // Neighbors (8-direction)
    // =========================================================================

    describe('getNeighbors (8-direction)', () => {
        it('should return 8 neighbors for center node', () => {
            const node = grid.getNodeAt(5, 5)!;
            const neighbors = grid.getNeighbors(node);
            expect(neighbors.length).toBe(8);
        });

        it('should return 3 neighbors for corner', () => {
            const node = grid.getNodeAt(0, 0)!;
            const neighbors = grid.getNeighbors(node);
            expect(neighbors.length).toBe(3);
        });

        it('should return 5 neighbors for edge', () => {
            const node = grid.getNodeAt(5, 0)!;
            const neighbors = grid.getNeighbors(node);
            expect(neighbors.length).toBe(5);
        });

        it('should not include blocked neighbors', () => {
            grid.setWalkable(6, 5, false);
            const node = grid.getNodeAt(5, 5)!;
            const neighbors = grid.getNeighbors(node);
            // 8 - 1 blocked - 2 diagonals (corner cutting) = 5
            expect(neighbors.length).toBe(5);
            expect(neighbors.find(n => n.x === 6 && n.y === 5)).toBeUndefined();
        });

        it('should avoid corner cutting by default', () => {
            // Block horizontal neighbor
            grid.setWalkable(6, 5, false);
            const node = grid.getNodeAt(5, 5)!;
            const neighbors = grid.getNeighbors(node);

            // Should not include diagonal (6,4) and (6,6) due to corner cutting
            expect(neighbors.find(n => n.x === 6 && n.y === 4)).toBeUndefined();
            expect(neighbors.find(n => n.x === 6 && n.y === 6)).toBeUndefined();
        });
    });

    // =========================================================================
    // Neighbors (4-direction)
    // =========================================================================

    describe('getNeighbors (4-direction)', () => {
        let grid4: GridMap;

        beforeEach(() => {
            grid4 = new GridMap(10, 10, { allowDiagonal: false });
        });

        it('should return 4 neighbors for center node', () => {
            const node = grid4.getNodeAt(5, 5)!;
            const neighbors = grid4.getNeighbors(node);
            expect(neighbors.length).toBe(4);
        });

        it('should return 2 neighbors for corner', () => {
            const node = grid4.getNodeAt(0, 0)!;
            const neighbors = grid4.getNeighbors(node);
            expect(neighbors.length).toBe(2);
        });

        it('should return 3 neighbors for edge', () => {
            const node = grid4.getNodeAt(5, 0)!;
            const neighbors = grid4.getNeighbors(node);
            expect(neighbors.length).toBe(3);
        });
    });

    // =========================================================================
    // Movement Cost
    // =========================================================================

    describe('getMovementCost', () => {
        it('should return 1 for cardinal movement', () => {
            const from = grid.getNodeAt(5, 5)!;
            const to = grid.getNodeAt(6, 5)!;
            expect(grid.getMovementCost(from, to)).toBe(1);
        });

        it('should return sqrt(2) for diagonal movement', () => {
            const from = grid.getNodeAt(5, 5)!;
            const to = grid.getNodeAt(6, 6)!;
            expect(grid.getMovementCost(from, to)).toBeCloseTo(Math.SQRT2, 10);
        });

        it('should factor in destination cost', () => {
            grid.setCost(6, 5, 2);
            const from = grid.getNodeAt(5, 5)!;
            const to = grid.getNodeAt(6, 5)!;
            expect(grid.getMovementCost(from, to)).toBe(2);
        });
    });

    // =========================================================================
    // Load from Array
    // =========================================================================

    describe('loadFromArray', () => {
        it('should load walkability from 2D array', () => {
            const data = [
                [0, 0, 1],
                [0, 1, 0],
                [1, 0, 0]
            ];
            const small = new GridMap(3, 3);
            small.loadFromArray(data);

            expect(small.isWalkable(0, 0)).toBe(true);
            expect(small.isWalkable(2, 0)).toBe(false);
            expect(small.isWalkable(1, 1)).toBe(false);
            expect(small.isWalkable(0, 2)).toBe(false);
        });

        it('should handle partial data', () => {
            const data = [[0, 1]];
            grid.loadFromArray(data);
            expect(grid.isWalkable(0, 0)).toBe(true);
            expect(grid.isWalkable(1, 0)).toBe(false);
        });
    });

    // =========================================================================
    // Load from String
    // =========================================================================

    describe('loadFromString', () => {
        it('should load walkability from string', () => {
            const mapStr = `
..#
.#.
#..`.trim();

            const small = new GridMap(3, 3);
            small.loadFromString(mapStr);

            expect(small.isWalkable(0, 0)).toBe(true);
            expect(small.isWalkable(2, 0)).toBe(false);
            expect(small.isWalkable(1, 1)).toBe(false);
            expect(small.isWalkable(0, 2)).toBe(false);
        });
    });

    // =========================================================================
    // toString
    // =========================================================================

    describe('toString', () => {
        it('should export grid as string', () => {
            const small = new GridMap(3, 2);
            small.setWalkable(1, 0, false);

            const expected = '.#.\n...\n';
            expect(small.toString()).toBe(expected);
        });
    });

    // =========================================================================
    // Reset
    // =========================================================================

    describe('reset', () => {
        it('should reset all nodes to walkable', () => {
            grid.setWalkable(5, 5, false);
            grid.setCost(3, 3, 5);
            grid.reset();

            expect(grid.isWalkable(5, 5)).toBe(true);
            expect(grid.getNodeAt(3, 3)?.cost).toBe(1);
        });
    });

    // =========================================================================
    // setRectWalkable
    // =========================================================================

    describe('setRectWalkable', () => {
        it('should set rectangle region walkability', () => {
            grid.setRectWalkable(2, 2, 3, 3, false);

            for (let y = 2; y < 5; y++) {
                for (let x = 2; x < 5; x++) {
                    expect(grid.isWalkable(x, y)).toBe(false);
                }
            }

            // Outside should still be walkable
            expect(grid.isWalkable(1, 2)).toBe(true);
            expect(grid.isWalkable(5, 2)).toBe(true);
        });
    });

    // =========================================================================
    // Bounds Checking
    // =========================================================================

    describe('isInBounds', () => {
        it('should return true for valid coordinates', () => {
            expect(grid.isInBounds(0, 0)).toBe(true);
            expect(grid.isInBounds(9, 9)).toBe(true);
            expect(grid.isInBounds(5, 5)).toBe(true);
        });

        it('should return false for invalid coordinates', () => {
            expect(grid.isInBounds(-1, 0)).toBe(false);
            expect(grid.isInBounds(0, -1)).toBe(false);
            expect(grid.isInBounds(10, 0)).toBe(false);
            expect(grid.isInBounds(0, 10)).toBe(false);
        });
    });
});

describe('GridNode', () => {
    it('should create node with correct properties', () => {
        const node = new GridNode(3, 4, true, 2);
        expect(node.x).toBe(3);
        expect(node.y).toBe(4);
        expect(node.walkable).toBe(true);
        expect(node.cost).toBe(2);
        expect(node.id).toBe('3,4');
        expect(node.position.x).toBe(3);
        expect(node.position.y).toBe(4);
    });

    it('should default to walkable with cost 1', () => {
        const node = new GridNode(0, 0);
        expect(node.walkable).toBe(true);
        expect(node.cost).toBe(1);
    });
});

describe('Direction Constants', () => {
    it('DIRECTIONS_4 should have 4 cardinal directions', () => {
        expect(DIRECTIONS_4.length).toBe(4);
    });

    it('DIRECTIONS_8 should have 8 directions', () => {
        expect(DIRECTIONS_8.length).toBe(8);
    });
});
