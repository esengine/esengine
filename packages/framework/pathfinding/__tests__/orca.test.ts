/**
 * @zh ORCA 算法测试
 * @en ORCA Algorithm Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createORCASolver, createKDTree, type IAvoidanceAgent, type IObstacle } from '../src/avoidance';
import { solveORCALinearProgram } from '../src/avoidance/LinearProgram';
import type { IORCALine } from '../src/avoidance/ILocalAvoidance';

// =============================================================================
// Helper Functions
// =============================================================================

function createAgent(
    id: number,
    x: number,
    y: number,
    vx: number = 0,
    vy: number = 0,
    pvx: number = 0,
    pvy: number = 0
): IAvoidanceAgent {
    return {
        id,
        position: { x, y },
        velocity: { x: vx, y: vy },
        preferredVelocity: { x: pvx, y: pvy },
        radius: 1,
        maxSpeed: 2,
        neighborDist: 10,
        maxNeighbors: 10,
        timeHorizon: 2,
        timeHorizonObst: 1
    };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function velocityMagnitude(v: { x: number; y: number }): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

// =============================================================================
// Linear Program Tests
// =============================================================================

describe('LinearProgram', () => {
    it('should return preferred velocity when no constraints', () => {
        const lines: IORCALine[] = [];
        const result = solveORCALinearProgram(lines, 0, 5, { x: 3, y: 0 });

        expect(result.x).toBeCloseTo(3, 5);
        expect(result.y).toBeCloseTo(0, 5);
    });

    it('should clamp to maxSpeed when preferred velocity exceeds it', () => {
        const lines: IORCALine[] = [];
        const result = solveORCALinearProgram(lines, 0, 2, { x: 10, y: 0 });

        expect(velocityMagnitude(result)).toBeCloseTo(2, 5);
        expect(result.x).toBeCloseTo(2, 5);
        expect(result.y).toBeCloseTo(0, 5);
    });

    it('should satisfy single constraint line', () => {
        const lines: IORCALine[] = [
            {
                point: { x: 0, y: 0 },
                direction: { x: 1, y: 0 }
            }
        ];

        const result = solveORCALinearProgram(lines, 0, 5, { x: 0, y: -1 });
        expect(result.y).toBeGreaterThanOrEqual(-0.0001);
    });

    it('should find intersection of two constraints', () => {
        const lines: IORCALine[] = [
            {
                point: { x: 0, y: 0 },
                direction: { x: 1, y: 0 }
            },
            {
                point: { x: 0, y: 0 },
                direction: { x: 0, y: -1 }
            }
        ];

        const result = solveORCALinearProgram(lines, 0, 5, { x: -1, y: -1 });

        expect(result.x).toBeGreaterThanOrEqual(-0.0001);
        expect(result.y).toBeGreaterThanOrEqual(-0.0001);
    });
});

// =============================================================================
// KDTree Tests
// =============================================================================

describe('KDTree', () => {
    it('should return empty array for empty tree', () => {
        const kdTree = createKDTree();
        kdTree.build([]);

        const results = kdTree.queryNeighbors({ x: 0, y: 0 }, 10, 10);
        expect(results).toHaveLength(0);
    });

    it('should find nearby agents', () => {
        const kdTree = createKDTree();
        const agents = [
            createAgent(1, 0, 0),
            createAgent(2, 1, 0),
            createAgent(3, 10, 10),
        ];
        kdTree.build(agents);

        const results = kdTree.queryNeighbors({ x: 0, y: 0 }, 5, 10);

        expect(results.length).toBe(2);
        expect(results.map(r => r.agent.id).sort()).toEqual([1, 2]);
    });

    it('should exclude specified agent id', () => {
        const kdTree = createKDTree();
        const agents = [
            createAgent(1, 0, 0),
            createAgent(2, 1, 0),
        ];
        kdTree.build(agents);

        const results = kdTree.queryNeighbors({ x: 0, y: 0 }, 5, 10, 1);

        expect(results.length).toBe(1);
        expect(results[0].agent.id).toBe(2);
    });

    it('should respect maxResults limit', () => {
        const kdTree = createKDTree();
        const agents = [];
        for (let i = 0; i < 20; i++) {
            agents.push(createAgent(i, i * 0.1, 0));
        }
        kdTree.build(agents);

        const results = kdTree.queryNeighbors({ x: 0, y: 0 }, 100, 5);

        expect(results.length).toBe(5);
    });
});

// =============================================================================
// ORCA Solver Tests
// =============================================================================

describe('ORCASolver', () => {
    let solver: ReturnType<typeof createORCASolver>;

    beforeEach(() => {
        solver = createORCASolver({
            defaultTimeHorizon: 2,
            defaultTimeHorizonObst: 1,
            timeStep: 1 / 60
        });
    });

    describe('No Neighbors', () => {
        it('should return preferred velocity when alone', () => {
            const agent = createAgent(1, 0, 0, 0, 0, 1, 0);
            const result = solver.computeNewVelocity(agent, [], [], 1 / 60);

            expect(result.x).toBeCloseTo(1, 5);
            expect(result.y).toBeCloseTo(0, 5);
        });

        it('should clamp to maxSpeed', () => {
            const agent = createAgent(1, 0, 0, 0, 0, 10, 0);
            agent.maxSpeed = 2;
            const result = solver.computeNewVelocity(agent, [], [], 1 / 60);

            expect(velocityMagnitude(result)).toBeCloseTo(2, 4);
        });
    });

    describe('Two Agents Head-On', () => {
        it('should avoid collision when moving towards each other', () => {
            const agent1 = createAgent(1, 0, 0, 1, 0, 1, 0);
            const agent2 = createAgent(2, 5, 0, -1, 0, -1, 0);

            const result1 = solver.computeNewVelocity(agent1, [agent2], [], 1 / 60);
            const result2 = solver.computeNewVelocity(agent2, [agent1], [], 1 / 60);

            expect(Math.abs(result1.x)).toBeLessThan(1);
            expect(Math.abs(result2.x)).toBeLessThan(1);
        });

        it('should not collide after several simulation steps', () => {
            const agent1 = createAgent(1, 0, 0, 0, 0, 1, 0);
            const agent2 = createAgent(2, 10, 0, 0, 0, -1, 0);
            agent1.maxSpeed = 1;
            agent2.maxSpeed = 1;

            const dt = 1 / 60;
            const minAllowedDist = agent1.radius + agent2.radius;

            for (let i = 0; i < 300; i++) {
                const v1 = solver.computeNewVelocity(agent1, [agent2], [], dt);
                const v2 = solver.computeNewVelocity(agent2, [agent1], [], dt);

                agent1.velocity = v1;
                agent2.velocity = v2;

                agent1.position.x += v1.x * dt;
                agent1.position.y += v1.y * dt;
                agent2.position.x += v2.x * dt;
                agent2.position.y += v2.y * dt;

                const dist = distance(agent1.position, agent2.position);
                expect(dist).toBeGreaterThan(minAllowedDist * 0.9);
            }
        });
    });

    describe('Multiple Agents', () => {
        it('should handle circular arrangement', () => {
            const agents: IAvoidanceAgent[] = [];
            const centerX = 0, centerY = 0;
            const radius = 5;

            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                const pvx = -Math.cos(angle);
                const pvy = -Math.sin(angle);

                agents.push({
                    id: i,
                    position: { x, y },
                    velocity: { x: pvx, y: pvy },
                    preferredVelocity: { x: pvx, y: pvy },
                    radius: 0.5,
                    maxSpeed: 1,
                    neighborDist: 15,
                    maxNeighbors: 10,
                    timeHorizon: 2,
                    timeHorizonObst: 1
                });
            }

            const dt = 1 / 60;
            const minAllowedDist = agents[0].radius * 2;

            for (let step = 0; step < 180; step++) {
                const newVelocities: { x: number; y: number }[] = [];

                for (const agent of agents) {
                    const neighbors = agents.filter(a => a.id !== agent.id);
                    const v = solver.computeNewVelocity(agent, neighbors, [], dt);
                    newVelocities.push(v);
                }

                for (let i = 0; i < agents.length; i++) {
                    agents[i].velocity = newVelocities[i];
                    agents[i].position.x += newVelocities[i].x * dt;
                    agents[i].position.y += newVelocities[i].y * dt;
                }

                for (let i = 0; i < agents.length; i++) {
                    for (let j = i + 1; j < agents.length; j++) {
                        const dist = distance(agents[i].position, agents[j].position);
                        expect(dist).toBeGreaterThan(minAllowedDist * 0.8);
                    }
                }
            }
        });
    });

    describe('Obstacle Avoidance', () => {
        it('should avoid rectangular obstacle', () => {
            const agent = createAgent(1, 0, 0, 1, 0, 1, 0);
            agent.maxSpeed = 2;
            agent.neighborDist = 10;
            agent.timeHorizonObst = 3;

            const obstacle: IObstacle = {
                vertices: [
                    { x: 2, y: -2 },
                    { x: 2.5, y: -2 },
                    { x: 2.5, y: 2 },
                    { x: 2, y: 2 }
                ]
            };

            const dt = 1 / 60;

            for (let step = 0; step < 180; step++) {
                const v = solver.computeNewVelocity(agent, [], [obstacle], dt);

                agent.velocity = v;
                agent.position.x += v.x * dt;
                agent.position.y += v.y * dt;

                agent.preferredVelocity = { x: 1, y: 0 };
            }

            expect(agent.position.x).toBeGreaterThan(0);
            expect(agent.position.x).toBeLessThan(2);
        });

        it('should avoid wall obstacle', () => {
            const { Polygon } = require('@esengine/ecs-framework-math');

            const solver = createORCASolver({
                defaultTimeHorizon: 2,
                defaultTimeHorizonObst: 5,
                timeStep: 1 / 60
            });

            const wallVertices = Polygon.ensureCCW([
                { x: 0, y: 100 },
                { x: 400, y: 100 },
                { x: 400, y: 110 },
                { x: 0, y: 110 }
            ], false);

            const obstacles: IObstacle[] = [{ vertices: wallVertices }];

            const agent: IAvoidanceAgent = {
                id: 1,
                position: { x: 200, y: 200 },
                velocity: { x: 0, y: -64 },
                preferredVelocity: { x: 0, y: -64 },
                radius: 12,
                maxSpeed: 80,
                neighborDist: 100,
                maxNeighbors: 8,
                timeHorizon: 1.5,
                timeHorizonObst: 5
            };

            const dt = 1 / 60;

            for (let frame = 0; frame < 60; frame++) {
                const newVel = solver.computeNewVelocity(agent, [], obstacles, dt);
                agent.velocity = newVel;
                agent.position.x += agent.velocity.x * dt;
                agent.position.y += agent.velocity.y * dt;
            }

            expect(agent.position.y).toBeGreaterThan(100);
        });
    });
});
