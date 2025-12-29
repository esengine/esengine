import { describe, it, expect, beforeEach } from 'vitest';
import { NavMesh, createNavMesh } from '../../src/navmesh/NavMesh';
import { createPoint } from '../../src/core/IPathfinding';

describe('NavMesh', () => {
    let navmesh: NavMesh;

    beforeEach(() => {
        navmesh = new NavMesh();
    });

    // =========================================================================
    // Polygon Management
    // =========================================================================

    describe('polygon management', () => {
        it('should add polygon and return id', () => {
            const id = navmesh.addPolygon([
                createPoint(0, 0),
                createPoint(10, 0),
                createPoint(10, 10),
                createPoint(0, 10)
            ]);

            expect(id).toBe(0);
            expect(navmesh.polygonCount).toBe(1);
        });

        it('should add multiple polygons with incremental ids', () => {
            const id1 = navmesh.addPolygon([
                createPoint(0, 0),
                createPoint(10, 0),
                createPoint(5, 10)
            ]);

            const id2 = navmesh.addPolygon([
                createPoint(10, 0),
                createPoint(20, 0),
                createPoint(15, 10)
            ]);

            expect(id1).toBe(0);
            expect(id2).toBe(1);
            expect(navmesh.polygonCount).toBe(2);
        });

        it('should get all polygons', () => {
            navmesh.addPolygon([
                createPoint(0, 0),
                createPoint(10, 0),
                createPoint(5, 10)
            ]);

            navmesh.addPolygon([
                createPoint(10, 0),
                createPoint(20, 0),
                createPoint(15, 10)
            ]);

            const polygons = navmesh.getPolygons();
            expect(polygons.length).toBe(2);
        });

        it('should clear all polygons', () => {
            navmesh.addPolygon([
                createPoint(0, 0),
                createPoint(10, 0),
                createPoint(5, 10)
            ]);

            navmesh.clear();
            expect(navmesh.polygonCount).toBe(0);
        });
    });

    // =========================================================================
    // Point in Polygon
    // =========================================================================

    describe('findPolygonAt', () => {
        beforeEach(() => {
            // Square from (0,0) to (10,10)
            navmesh.addPolygon([
                createPoint(0, 0),
                createPoint(10, 0),
                createPoint(10, 10),
                createPoint(0, 10)
            ]);
        });

        it('should find polygon containing point', () => {
            const polygon = navmesh.findPolygonAt(5, 5);
            expect(polygon).not.toBeNull();
            expect(polygon?.id).toBe(0);
        });

        it('should return null for point outside', () => {
            expect(navmesh.findPolygonAt(-1, 5)).toBeNull();
            expect(navmesh.findPolygonAt(15, 5)).toBeNull();
        });

        it('should handle point on edge', () => {
            const polygon = navmesh.findPolygonAt(0, 5);
            // Edge behavior may vary, but should not crash
            expect(polygon === null || polygon.id === 0).toBe(true);
        });
    });

    // =========================================================================
    // Walkability
    // =========================================================================

    describe('isWalkable', () => {
        beforeEach(() => {
            navmesh.addPolygon([
                createPoint(0, 0),
                createPoint(10, 0),
                createPoint(10, 10),
                createPoint(0, 10)
            ]);
        });

        it('should return true for point in polygon', () => {
            expect(navmesh.isWalkable(5, 5)).toBe(true);
        });

        it('should return false for point outside', () => {
            expect(navmesh.isWalkable(15, 5)).toBe(false);
        });
    });

    // =========================================================================
    // Connections
    // =========================================================================

    describe('connections', () => {
        it('should manually set connection between polygons', () => {
            // Two adjacent squares
            const id1 = navmesh.addPolygon([
                createPoint(0, 0),
                createPoint(10, 0),
                createPoint(10, 10),
                createPoint(0, 10)
            ]);

            const id2 = navmesh.addPolygon([
                createPoint(10, 0),
                createPoint(20, 0),
                createPoint(20, 10),
                createPoint(10, 10)
            ]);

            navmesh.setConnection(id1, id2, {
                left: createPoint(10, 0),
                right: createPoint(10, 10)
            });

            const polygons = navmesh.getPolygons();
            const poly1 = polygons.find(p => p.id === id1);

            expect(poly1?.neighbors).toContain(id2);
        });

        it('should auto-detect shared edges with build()', () => {
            // Two adjacent squares sharing edge at x=10
            navmesh.addPolygon([
                createPoint(0, 0),
                createPoint(10, 0),
                createPoint(10, 10),
                createPoint(0, 10)
            ]);

            navmesh.addPolygon([
                createPoint(10, 0),
                createPoint(20, 0),
                createPoint(20, 10),
                createPoint(10, 10)
            ]);

            navmesh.build();

            const polygons = navmesh.getPolygons();
            expect(polygons[0].neighbors).toContain(1);
            expect(polygons[1].neighbors).toContain(0);
        });
    });

    // =========================================================================
    // Pathfinding
    // =========================================================================

    describe('findPath', () => {
        beforeEach(() => {
            // Create 3 connected squares
            navmesh.addPolygon([
                createPoint(0, 0),
                createPoint(10, 0),
                createPoint(10, 10),
                createPoint(0, 10)
            ]);

            navmesh.addPolygon([
                createPoint(10, 0),
                createPoint(20, 0),
                createPoint(20, 10),
                createPoint(10, 10)
            ]);

            navmesh.addPolygon([
                createPoint(20, 0),
                createPoint(30, 0),
                createPoint(30, 10),
                createPoint(20, 10)
            ]);

            navmesh.build();
        });

        it('should find path within same polygon', () => {
            const result = navmesh.findPath(1, 1, 8, 8);
            expect(result.found).toBe(true);
            expect(result.path.length).toBe(2);
            expect(result.path[0]).toEqual(createPoint(1, 1));
            expect(result.path[1]).toEqual(createPoint(8, 8));
        });

        it('should find path across polygons', () => {
            const result = navmesh.findPath(5, 5, 25, 5);
            expect(result.found).toBe(true);
            expect(result.path.length).toBeGreaterThanOrEqual(2);
            expect(result.path[0]).toEqual(createPoint(5, 5));
            expect(result.path[result.path.length - 1]).toEqual(createPoint(25, 5));
        });

        it('should return empty path when start is outside', () => {
            const result = navmesh.findPath(-5, 5, 15, 5);
            expect(result.found).toBe(false);
        });

        it('should return empty path when end is outside', () => {
            const result = navmesh.findPath(5, 5, 50, 5);
            expect(result.found).toBe(false);
        });

        it('should calculate path cost', () => {
            const result = navmesh.findPath(5, 5, 25, 5);
            expect(result.found).toBe(true);
            expect(result.cost).toBeGreaterThan(0);
        });

        it('should track nodes searched', () => {
            const result = navmesh.findPath(5, 5, 25, 5);
            expect(result.nodesSearched).toBeGreaterThan(0);
        });
    });

    // =========================================================================
    // IPathfindingMap Interface
    // =========================================================================

    describe('IPathfindingMap interface', () => {
        beforeEach(() => {
            // Two adjacent squares with shared edge at x=10
            const id1 = navmesh.addPolygon([
                createPoint(0, 0),
                createPoint(10, 0),
                createPoint(10, 10),
                createPoint(0, 10)
            ]);

            const id2 = navmesh.addPolygon([
                createPoint(10, 0),
                createPoint(20, 0),
                createPoint(20, 10),
                createPoint(10, 10)
            ]);

            // Manual connection to ensure proper setup
            navmesh.setConnection(id1, id2, {
                left: createPoint(10, 0),
                right: createPoint(10, 10)
            });
        });

        it('should return node at position', () => {
            const node = navmesh.getNodeAt(5, 5);
            expect(node).not.toBeNull();
            expect(node?.id).toBe(0);
        });

        it('should return null for position outside', () => {
            const node = navmesh.getNodeAt(50, 50);
            expect(node).toBeNull();
        });

        it('should get neighbors from polygon directly', () => {
            // NavMeshNode holds a reference to the original polygon,
            // so we check via the polygons map which is updated by setConnection
            const polygons = navmesh.getPolygons();
            const poly0 = polygons.find(p => p.id === 0);
            expect(poly0).toBeDefined();
            expect(poly0!.neighbors).toContain(1);
        });

        it('should calculate heuristic', () => {
            const a = createPoint(0, 0);
            const b = createPoint(3, 4);
            expect(navmesh.heuristic(a, b)).toBe(5); // Euclidean
        });

        it('should calculate movement cost', () => {
            const node1 = navmesh.getNodeAt(5, 5)!;
            const node2 = navmesh.getNodeAt(15, 5)!;
            const cost = navmesh.getMovementCost(node1, node2);
            expect(cost).toBeGreaterThan(0);
        });
    });

    // =========================================================================
    // Complex Scenarios
    // =========================================================================

    describe('complex scenarios', () => {
        it('should handle L-shaped navmesh with manual connections', () => {
            // Horizontal part
            const id1 = navmesh.addPolygon([
                createPoint(0, 0),
                createPoint(30, 0),
                createPoint(30, 10),
                createPoint(0, 10)
            ]);

            // Vertical part (shares partial edge, needs manual connection)
            const id2 = navmesh.addPolygon([
                createPoint(0, 10),
                createPoint(10, 10),
                createPoint(10, 30),
                createPoint(0, 30)
            ]);

            // Manual connection since edges don't match exactly
            navmesh.setConnection(id1, id2, {
                left: createPoint(0, 10),
                right: createPoint(10, 10)
            });

            const result = navmesh.findPath(25, 5, 5, 25);
            expect(result.found).toBe(true);
        });

        it('should handle disconnected areas', () => {
            // Area 1
            navmesh.addPolygon([
                createPoint(0, 0),
                createPoint(10, 0),
                createPoint(10, 10),
                createPoint(0, 10)
            ]);

            // Area 2 (disconnected)
            navmesh.addPolygon([
                createPoint(50, 50),
                createPoint(60, 50),
                createPoint(60, 60),
                createPoint(50, 60)
            ]);

            navmesh.build();

            const result = navmesh.findPath(5, 5, 55, 55);
            expect(result.found).toBe(false);
        });
    });

    // =========================================================================
    // Factory Function
    // =========================================================================

    describe('createNavMesh', () => {
        it('should create empty navmesh', () => {
            const nm = createNavMesh();
            expect(nm).toBeInstanceOf(NavMesh);
            expect(nm.polygonCount).toBe(0);
        });
    });
});
