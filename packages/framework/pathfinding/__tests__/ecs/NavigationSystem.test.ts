/**
 * @zh NavigationSystem 测试用例
 * @en NavigationSystem Test Cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    NavigationSystem,
    NavigationAgentComponent,
    NavigationState,
    ORCAConfigComponent
} from '../../src/ecs';
import {
    createNavMeshPathPlanner,
    createAStarPlanner,
    createORCAAvoidance,
    createDefaultCollisionResolver
} from '../../src/adapters';
import { createNavMesh } from '../../src/navmesh';
import { createGridMap } from '../../src/grid';
import type { IPathPlanner, ILocalAvoidance, ICollisionResolver } from '../../src/interfaces';
import type { IVector2 } from '../../src/interfaces/IPathPlanner';

// =============================================================================
// Mock Entity and Scene for testing
// =============================================================================

class MockEntity {
    id: number;
    private components = new Map<any, any>();

    constructor(id: number) {
        this.id = id;
    }

    addComponent<T>(component: T): T {
        const constructor = (component as any).constructor;
        this.components.set(constructor, component);
        return component;
    }

    getComponent<T>(type: new (...args: any[]) => T): T | null {
        return this.components.get(type) || null;
    }

    hasComponent<T>(type: new (...args: any[]) => T): boolean {
        return this.components.has(type);
    }
}

// =============================================================================
// Test Suites
// =============================================================================

describe('NavigationSystem', () => {
    let system: NavigationSystem;

    beforeEach(() => {
        system = new NavigationSystem();
    });

    describe('algorithm setters and getters', () => {
        it('should set and get path planner', () => {
            expect(system.getPathPlanner()).toBeNull();

            const navMesh = createNavMesh();
            navMesh.addPolygon([
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ]);
            navMesh.build();

            const planner = createNavMeshPathPlanner(navMesh);
            system.setPathPlanner(planner);

            expect(system.getPathPlanner()).toBe(planner);
            expect(system.getPathPlanner()?.type).toBe('navmesh');
        });

        it('should set and get local avoidance', () => {
            expect(system.getLocalAvoidance()).toBeNull();

            const avoidance = createORCAAvoidance();
            system.setLocalAvoidance(avoidance);

            expect(system.getLocalAvoidance()).toBe(avoidance);
            expect(system.getLocalAvoidance()?.type).toBe('orca');
        });

        it('should set and get collision resolver', () => {
            expect(system.getCollisionResolver()).toBeNull();

            const resolver = createDefaultCollisionResolver();
            system.setCollisionResolver(resolver);

            expect(system.getCollisionResolver()).toBe(resolver);
            expect(system.getCollisionResolver()?.type).toBe('default');
        });

        it('should allow null to disable algorithms', () => {
            const avoidance = createORCAAvoidance();
            system.setLocalAvoidance(avoidance);
            expect(system.getLocalAvoidance()).not.toBeNull();

            system.setLocalAvoidance(null);
            expect(system.getLocalAvoidance()).toBeNull();
        });

        it('should dispose previous algorithm when setting new one', () => {
            const avoidance1 = createORCAAvoidance();
            const disposeSpy = vi.spyOn(avoidance1, 'dispose');

            system.setLocalAvoidance(avoidance1);
            system.setLocalAvoidance(createORCAAvoidance());

            expect(disposeSpy).toHaveBeenCalled();
        });
    });

    describe('obstacle management', () => {
        it('should add and get obstacles', () => {
            expect(system.getObstacles().length).toBe(0);

            const obstacle = {
                vertices: [
                    { x: 10, y: 10 },
                    { x: 20, y: 10 },
                    { x: 20, y: 20 },
                    { x: 10, y: 20 }
                ]
            };

            system.addStaticObstacle(obstacle);
            expect(system.getObstacles().length).toBe(1);
            expect(system.getObstacles()[0]).toBe(obstacle);
        });

        it('should clear obstacles', () => {
            system.addStaticObstacle({ vertices: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }] });
            system.addDynamicObstacle({ vertices: [{ x: 20, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 10 }] });

            expect(system.getObstacles().length).toBe(2);

            system.clearObstacles();
            expect(system.getObstacles().length).toBe(0);
        });

        it('should set obstacles list', () => {
            const obstacles = [
                { vertices: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }] },
                { vertices: [{ x: 20, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 10 }] }
            ];

            system.setStaticObstacles(obstacles);
            expect(system.getObstacles().length).toBe(2);
        });
    });

    describe('configuration', () => {
        it('should use default configuration', () => {
            const system = new NavigationSystem();
            // Default should have all stages enabled
            expect(system).toBeDefined();
        });

        it('should accept custom configuration', () => {
            const system = new NavigationSystem({
                timeStep: 1 / 30,
                enablePathPlanning: false,
                enableLocalAvoidance: true,
                enableCollisionResolution: false
            });
            expect(system).toBeDefined();
        });
    });
});

describe('NavigationAgentComponent', () => {
    let agent: NavigationAgentComponent;

    beforeEach(() => {
        agent = new NavigationAgentComponent();
    });

    describe('initialization', () => {
        it('should have default values', () => {
            expect(agent.radius).toBe(0.5);
            expect(agent.maxSpeed).toBe(5.0);
            expect(agent.acceleration).toBe(10.0);
            expect(agent.waypointThreshold).toBe(0.5);
            expect(agent.arrivalThreshold).toBe(0.3);
            expect(agent.enabled).toBe(true);
            expect(agent.state).toBe(NavigationState.Idle);
        });

        it('should have zero position and velocity', () => {
            expect(agent.position.x).toBe(0);
            expect(agent.position.y).toBe(0);
            expect(agent.velocity.x).toBe(0);
            expect(agent.velocity.y).toBe(0);
        });
    });

    describe('setPosition', () => {
        it('should set position correctly', () => {
            agent.setPosition(10, 20);
            expect(agent.position.x).toBe(10);
            expect(agent.position.y).toBe(20);
        });
    });

    describe('setDestination', () => {
        it('should set destination and change state to Navigating', () => {
            agent.setDestination(100, 200);

            expect(agent.destination).not.toBeNull();
            expect(agent.destination!.x).toBe(100);
            expect(agent.destination!.y).toBe(200);
            expect(agent.state).toBe(NavigationState.Navigating);
        });

        it('should clear path when setting new destination', () => {
            agent.path = [{ x: 1, y: 1 }, { x: 2, y: 2 }];
            agent.currentWaypointIndex = 1;

            agent.setDestination(100, 200);

            expect(agent.path.length).toBe(0);
            expect(agent.currentWaypointIndex).toBe(0);
        });

        it('should reset lastRepathTime', () => {
            agent.lastRepathTime = 100;
            agent.setDestination(100, 200);
            expect(agent.lastRepathTime).toBe(0);
        });
    });

    describe('stop', () => {
        it('should clear destination and reset state', () => {
            agent.setDestination(100, 200);
            agent.velocity = { x: 5, y: 5 };
            agent.path = [{ x: 50, y: 50 }];

            agent.stop();

            expect(agent.destination).toBeNull();
            expect(agent.state).toBe(NavigationState.Idle);
            expect(agent.path.length).toBe(0);
            expect(agent.velocity.x).toBe(0);
            expect(agent.velocity.y).toBe(0);
        });
    });

    describe('getCurrentWaypoint', () => {
        it('should return null when no path', () => {
            expect(agent.getCurrentWaypoint()).toBeNull();
        });

        it('should return current waypoint', () => {
            agent.path = [{ x: 10, y: 10 }, { x: 20, y: 20 }, { x: 30, y: 30 }];
            agent.currentWaypointIndex = 1;

            const waypoint = agent.getCurrentWaypoint();
            expect(waypoint).not.toBeNull();
            expect(waypoint!.x).toBe(20);
            expect(waypoint!.y).toBe(20);
        });

        it('should return null when past all waypoints', () => {
            agent.path = [{ x: 10, y: 10 }];
            agent.currentWaypointIndex = 1;

            expect(agent.getCurrentWaypoint()).toBeNull();
        });
    });

    describe('getDistanceToDestination', () => {
        it('should return Infinity when no destination', () => {
            expect(agent.getDistanceToDestination()).toBe(Infinity);
        });

        it('should calculate distance correctly', () => {
            agent.setPosition(0, 0);
            agent.setDestination(3, 4);

            expect(agent.getDistanceToDestination()).toBe(5);
        });
    });

    describe('getCurrentSpeed', () => {
        it('should return 0 when stationary', () => {
            expect(agent.getCurrentSpeed()).toBe(0);
        });

        it('should calculate speed correctly', () => {
            agent.velocity = { x: 3, y: 4 };
            expect(agent.getCurrentSpeed()).toBe(5);
        });
    });

    describe('state checks', () => {
        it('should check hasArrived', () => {
            expect(agent.hasArrived()).toBe(false);
            agent.state = NavigationState.Arrived;
            expect(agent.hasArrived()).toBe(true);
        });

        it('should check isBlocked', () => {
            expect(agent.isBlocked()).toBe(false);
            agent.state = NavigationState.Blocked;
            expect(agent.isBlocked()).toBe(true);
        });

        it('should check isUnreachable', () => {
            expect(agent.isUnreachable()).toBe(false);
            agent.state = NavigationState.Unreachable;
            expect(agent.isUnreachable()).toBe(true);
        });
    });

    describe('reset', () => {
        it('should reset all state', () => {
            agent.setPosition(10, 20);
            agent.setDestination(100, 200);
            agent.velocity = { x: 5, y: 5 };
            agent.state = NavigationState.Navigating;
            agent.path = [{ x: 50, y: 50 }];
            agent.lastRepathTime = 100;

            agent.reset();

            expect(agent.position.x).toBe(0);
            expect(agent.position.y).toBe(0);
            expect(agent.velocity.x).toBe(0);
            expect(agent.velocity.y).toBe(0);
            expect(agent.destination).toBeNull();
            expect(agent.state).toBe(NavigationState.Idle);
            expect(agent.path.length).toBe(0);
            expect(agent.lastRepathTime).toBe(0);
        });
    });
});

describe('ORCAConfigComponent', () => {
    it('should have default values', () => {
        const config = new ORCAConfigComponent();

        expect(config.neighborDist).toBe(15.0);
        expect(config.maxNeighbors).toBe(10);
        expect(config.timeHorizon).toBe(2.0);
        expect(config.timeHorizonObst).toBe(1.0);
    });

    it('should allow modification of values', () => {
        const config = new ORCAConfigComponent();

        config.neighborDist = 20.0;
        config.maxNeighbors = 15;
        config.timeHorizon = 3.0;
        config.timeHorizonObst = 1.5;

        expect(config.neighborDist).toBe(20.0);
        expect(config.maxNeighbors).toBe(15);
        expect(config.timeHorizon).toBe(3.0);
        expect(config.timeHorizonObst).toBe(1.5);
    });
});

describe('Path Planner Adapters', () => {
    describe('NavMeshPathPlannerAdapter', () => {
        it('should find path on simple NavMesh', () => {
            const navMesh = createNavMesh();
            navMesh.addPolygon([
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ]);
            navMesh.build();

            const planner = createNavMeshPathPlanner(navMesh);

            expect(planner.type).toBe('navmesh');

            const result = planner.findPath({ x: 10, y: 10 }, { x: 90, y: 90 });
            expect(result.found).toBe(true);
            expect(result.path.length).toBeGreaterThan(0);
        });

        it('should check walkability', () => {
            const navMesh = createNavMesh();
            navMesh.addPolygon([
                { x: 0, y: 0 },
                { x: 50, y: 0 },
                { x: 50, y: 50 },
                { x: 0, y: 50 }
            ]);
            navMesh.build();

            const planner = createNavMeshPathPlanner(navMesh);

            expect(planner.isWalkable({ x: 25, y: 25 })).toBe(true);
            expect(planner.isWalkable({ x: 100, y: 100 })).toBe(false);
        });

        it('should find nearest walkable position', () => {
            const navMesh = createNavMesh();
            navMesh.addPolygon([
                { x: 0, y: 0 },
                { x: 50, y: 0 },
                { x: 50, y: 50 },
                { x: 0, y: 50 }
            ]);
            navMesh.build();

            const planner = createNavMeshPathPlanner(navMesh);

            // Point inside polygon
            const inside = planner.getNearestWalkable({ x: 25, y: 25 });
            expect(inside).not.toBeNull();
            expect(inside!.x).toBe(25);
            expect(inside!.y).toBe(25);

            // Point outside - should find polygon center
            const outside = planner.getNearestWalkable({ x: 100, y: 100 });
            expect(outside).not.toBeNull();
        });
    });

    describe('GridPathfinderAdapter', () => {
        it('should find path with A* planner', () => {
            const gridMap = createGridMap(20, 20);
            const planner = createAStarPlanner(gridMap);

            expect(planner.type).toBe('astar');

            const result = planner.findPath({ x: 0, y: 0 }, { x: 19, y: 19 });
            expect(result.found).toBe(true);
            expect(result.path.length).toBeGreaterThan(0);
        });

        it('should check walkability', () => {
            const gridMap = createGridMap(10, 10);
            gridMap.setWalkable(5, 5, false);

            const planner = createAStarPlanner(gridMap);

            expect(planner.isWalkable({ x: 0, y: 0 })).toBe(true);
            expect(planner.isWalkable({ x: 5, y: 5 })).toBe(false);
        });

        it('should find nearest walkable position', () => {
            const gridMap = createGridMap(10, 10);
            gridMap.setWalkable(5, 5, false);
            gridMap.setWalkable(5, 6, false);
            gridMap.setWalkable(6, 5, false);
            gridMap.setWalkable(6, 6, false);

            const planner = createAStarPlanner(gridMap);

            const nearest = planner.getNearestWalkable({ x: 5, y: 5 });
            expect(nearest).not.toBeNull();
            // Should find a walkable cell nearby
            expect(planner.isWalkable(nearest!)).toBe(true);
        });
    });
});

describe('Local Avoidance Adapters', () => {
    describe('ORCALocalAvoidanceAdapter', () => {
        it('should compute avoidance velocity', () => {
            const avoidance = createORCAAvoidance();

            expect(avoidance.type).toBe('orca');

            const agent = {
                id: 1,
                position: { x: 0, y: 0 },
                velocity: { x: 1, y: 0 },
                preferredVelocity: { x: 1, y: 0 },
                radius: 0.5,
                maxSpeed: 2.0
            };

            const result = avoidance.computeAvoidanceVelocity(agent, [], [], 1 / 60);

            expect(result.feasible).toBe(true);
            expect(result.velocity).toBeDefined();
        });

        it('should compute batch avoidance', () => {
            const avoidance = createORCAAvoidance();

            const agents = [
                {
                    id: 1,
                    position: { x: 0, y: 0 },
                    velocity: { x: 1, y: 0 },
                    preferredVelocity: { x: 1, y: 0 },
                    radius: 0.5,
                    maxSpeed: 2.0
                },
                {
                    id: 2,
                    position: { x: 10, y: 0 },
                    velocity: { x: -1, y: 0 },
                    preferredVelocity: { x: -1, y: 0 },
                    radius: 0.5,
                    maxSpeed: 2.0
                }
            ];

            const results = avoidance.computeBatchAvoidance(agents, [], 1 / 60);

            expect(results.size).toBe(2);
            expect(results.get(1)).toBeDefined();
            expect(results.get(2)).toBeDefined();
        });

        it('should allow setting default params', () => {
            const avoidance = createORCAAvoidance();

            avoidance.setDefaultParams({
                timeHorizon: 5.0,
                neighborDist: 20.0
            });

            const params = avoidance.getDefaultParams();
            expect(params.timeHorizon).toBe(5.0);
            expect(params.neighborDist).toBe(20.0);
        });
    });
});

describe('Collision Resolver Adapters', () => {
    describe('CollisionResolverAdapter', () => {
        it('should detect collision', () => {
            const resolver = createDefaultCollisionResolver();

            expect(resolver.type).toBe('default');

            const obstacle = {
                vertices: [
                    { x: 0, y: 0 },
                    { x: 10, y: 0 },
                    { x: 10, y: 10 },
                    { x: 0, y: 10 }
                ]
            };

            // Position inside obstacle
            const collision = resolver.detectCollision({ x: 5, y: 5 }, 0.5, [obstacle]);
            expect(collision.collided).toBe(true);
        });

        it('should resolve collision', () => {
            const resolver = createDefaultCollisionResolver();

            const obstacle = {
                vertices: [
                    { x: 0, y: 0 },
                    { x: 10, y: 0 },
                    { x: 10, y: 10 },
                    { x: 0, y: 10 }
                ]
            };

            // Position inside obstacle
            const resolved = resolver.resolveCollision({ x: 5, y: 5 }, 0.5, [obstacle]);

            // Should be pushed outside
            const collision = resolver.detectCollision(resolved, 0.5, [obstacle]);
            expect(collision.collided).toBe(false);
        });

        it('should validate velocity', () => {
            const resolver = createDefaultCollisionResolver();

            const obstacle = {
                vertices: [
                    { x: 5, y: 0 },
                    { x: 15, y: 0 },
                    { x: 15, y: 10 },
                    { x: 5, y: 10 }
                ]
            };

            // Moving towards obstacle
            const safeVelocity = resolver.validateVelocity(
                { x: 0, y: 5 },
                { x: 10, y: 0 },
                0.5,
                [obstacle],
                1 / 60
            );

            expect(safeVelocity).toBeDefined();
        });

        it('should detect agent collision', () => {
            const resolver = createDefaultCollisionResolver();

            // Two overlapping agents
            const collision = resolver.detectAgentCollision(
                { x: 0, y: 0 }, 1.0,
                { x: 1, y: 0 }, 1.0
            );

            expect(collision.collided).toBe(true);
            expect(collision.penetration).toBeGreaterThan(0);
        });
    });
});

describe('Integration Tests', () => {
    it('should work with NavMesh + ORCA + CollisionResolver', () => {
        // Create NavMesh
        const navMesh = createNavMesh();
        navMesh.addPolygon([
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 }
        ]);
        navMesh.build();

        // Create system with all algorithms
        const system = new NavigationSystem();
        system.setPathPlanner(createNavMeshPathPlanner(navMesh));
        system.setLocalAvoidance(createORCAAvoidance());
        system.setCollisionResolver(createDefaultCollisionResolver());

        expect(system.getPathPlanner()?.type).toBe('navmesh');
        expect(system.getLocalAvoidance()?.type).toBe('orca');
        expect(system.getCollisionResolver()?.type).toBe('default');
    });

    it('should work with A* only (no avoidance)', () => {
        const gridMap = createGridMap(50, 50);

        const system = new NavigationSystem({
            enableLocalAvoidance: false,
            enableCollisionResolution: false
        });
        system.setPathPlanner(createAStarPlanner(gridMap));

        expect(system.getPathPlanner()?.type).toBe('astar');
        expect(system.getLocalAvoidance()).toBeNull();
        expect(system.getCollisionResolver()).toBeNull();
    });

    it('should work with ORCA only (no pathfinding)', () => {
        const system = new NavigationSystem({
            enablePathPlanning: false
        });
        system.setLocalAvoidance(createORCAAvoidance());
        system.setCollisionResolver(createDefaultCollisionResolver());

        expect(system.getPathPlanner()).toBeNull();
        expect(system.getLocalAvoidance()?.type).toBe('orca');
    });

    it('should allow runtime algorithm switching', () => {
        const navMesh = createNavMesh();
        navMesh.addPolygon([
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 }
        ]);
        navMesh.build();

        const gridMap = createGridMap(100, 100);

        const system = new NavigationSystem();

        // Start with NavMesh
        system.setPathPlanner(createNavMeshPathPlanner(navMesh));
        expect(system.getPathPlanner()?.type).toBe('navmesh');

        // Switch to A*
        system.setPathPlanner(createAStarPlanner(gridMap));
        expect(system.getPathPlanner()?.type).toBe('astar');

        // Disable pathfinding
        system.setPathPlanner(null);
        expect(system.getPathPlanner()).toBeNull();
    });
});
