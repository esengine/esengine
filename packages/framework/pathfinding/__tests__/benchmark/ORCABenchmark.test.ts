/**
 * @zh ORCA 局部避让性能基准测试
 * @en ORCA Local Avoidance Performance Benchmark
 */

import { describe, it, expect } from 'vitest';
import { createORCASolver, createKDTree, type IAvoidanceAgent, type IObstacle } from '../../src/avoidance';

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
        radius: 0.5,
        maxSpeed: 2,
        neighborDist: 15,
        maxNeighbors: 10,
        timeHorizon: 2,
        timeHorizonObst: 1
    };
}

function createRandomAgents(count: number, areaSize: number): IAvoidanceAgent[] {
    const agents: IAvoidanceAgent[] = [];
    for (let i = 0; i < count; i++) {
        const x = Math.random() * areaSize;
        const y = Math.random() * areaSize;
        const targetX = Math.random() * areaSize;
        const targetY = Math.random() * areaSize;
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pvx = dist > 0 ? (dx / dist) * 2 : 0;
        const pvy = dist > 0 ? (dy / dist) * 2 : 0;
        agents.push(createAgent(i, x, y, pvx, pvy, pvx, pvy));
    }
    return agents;
}

function createCircularAgents(count: number, radius: number): IAvoidanceAgent[] {
    const agents: IAvoidanceAgent[] = [];
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const pvx = -Math.cos(angle);
        const pvy = -Math.sin(angle);
        agents.push({
            id: i,
            position: { x, y },
            velocity: { x: pvx, y: pvy },
            preferredVelocity: { x: pvx, y: pvy },
            radius: 0.5,
            maxSpeed: 2,
            neighborDist: radius * 2,
            maxNeighbors: count - 1,
            timeHorizon: 2,
            timeHorizonObst: 1
        });
    }
    return agents;
}

function createRectObstacle(x: number, y: number, width: number, height: number): IObstacle {
    const x2 = x + width;
    const y2 = y + height;
    return {
        vertices: [
            { x, y },
            { x: x2, y },
            { x: x2, y: y2 },
            { x, y: y2 }
        ]
    };
}

// =============================================================================
// Benchmark Tests
// =============================================================================

describe('ORCA Performance Benchmark', () => {
    // =========================================================================
    // KDTree Performance
    // =========================================================================

    it('benchmark: KDTree build performance', () => {
        const kdTree = createKDTree();
        const agentCounts = [100, 500, 1000, 2000];

        console.log('\n=== KDTree Build Performance ===');
        console.log('Agents\t\tBuild Time\tPer Agent');

        for (const count of agentCounts) {
            const agents = createRandomAgents(count, 100);

            const iterations = 100;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                kdTree.build(agents);
            }
            const time = performance.now() - start;

            const avgTime = time / iterations;
            const perAgent = avgTime / count * 1000;

            console.log(
                count + '\t\t' +
                avgTime.toFixed(3) + 'ms\t\t' +
                perAgent.toFixed(3) + 'μs'
            );
        }

        expect(true).toBe(true);
    });

    it('benchmark: KDTree query performance', () => {
        const kdTree = createKDTree();
        const agents = createRandomAgents(1000, 100);
        kdTree.build(agents);

        const queryRanges = [5, 10, 15, 20];

        console.log('\n=== KDTree Query Performance (1000 agents) ===');
        console.log('Range\t\tTime/Query\tAvg Neighbors');

        for (const range of queryRanges) {
            const iterations = 1000;
            let totalNeighbors = 0;

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                const results = kdTree.queryNeighbors(
                    { x: Math.random() * 100, y: Math.random() * 100 },
                    range,
                    20
                );
                totalNeighbors += results.length;
            }
            const time = performance.now() - start;

            const avgTime = time / iterations * 1000;
            const avgNeighbors = totalNeighbors / iterations;

            console.log(
                range + '\t\t' +
                avgTime.toFixed(2) + 'μs\t\t' +
                avgNeighbors.toFixed(1)
            );
        }

        expect(true).toBe(true);
    });

    // =========================================================================
    // ORCA Solver Performance
    // =========================================================================

    it('benchmark: single agent velocity computation', () => {
        const solver = createORCASolver({
            defaultTimeHorizon: 2,
            defaultTimeHorizonObst: 1,
            timeStep: 1 / 60
        });

        const agent = createAgent(0, 50, 50, 1, 0, 1, 0);
        const dt = 1 / 60;

        const iterations = 10000;
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            solver.computeNewVelocity(agent, [], [], dt);
        }
        const time = performance.now() - start;

        const perCompute = time / iterations * 1000;

        console.log('\n=== Single Agent Velocity Computation ===');
        console.log('Iterations: ' + iterations);
        console.log('Total time: ' + time.toFixed(2) + 'ms');
        console.log('Per compute: ' + perCompute.toFixed(3) + 'μs');

        expect(perCompute).toBeLessThan(10);
    });

    it('benchmark: velocity computation with neighbors', () => {
        const solver = createORCASolver({
            defaultTimeHorizon: 2,
            defaultTimeHorizonObst: 1,
            timeStep: 1 / 60
        });

        const neighborCounts = [1, 5, 10, 20];
        const dt = 1 / 60;

        console.log('\n=== Velocity Computation with Neighbors ===');
        console.log('Neighbors\tTime/Compute\tOverhead');

        let baseTime = 0;
        for (const neighborCount of neighborCounts) {
            const agent = createAgent(0, 50, 50, 1, 0, 1, 0);
            const neighbors: IAvoidanceAgent[] = [];
            for (let i = 0; i < neighborCount; i++) {
                const angle = (i / neighborCount) * Math.PI * 2;
                neighbors.push(createAgent(
                    i + 1,
                    50 + Math.cos(angle) * 5,
                    50 + Math.sin(angle) * 5,
                    -Math.cos(angle),
                    -Math.sin(angle),
                    -Math.cos(angle),
                    -Math.sin(angle)
                ));
            }

            const iterations = 5000;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                solver.computeNewVelocity(agent, neighbors, [], dt);
            }
            const time = performance.now() - start;

            const perCompute = time / iterations * 1000;
            if (neighborCount === 1) {
                baseTime = perCompute;
            }
            const overhead = neighborCount === 1 ? 1 : perCompute / baseTime;

            console.log(
                neighborCount + '\t\t' +
                perCompute.toFixed(2) + 'μs\t\t' +
                overhead.toFixed(2) + 'x'
            );
        }

        expect(true).toBe(true);
    });

    it('benchmark: velocity computation with obstacles', () => {
        const solver = createORCASolver({
            defaultTimeHorizon: 2,
            defaultTimeHorizonObst: 2,
            timeStep: 1 / 60
        });

        const obstacleCounts = [1, 5, 10, 20];
        const dt = 1 / 60;

        console.log('\n=== Velocity Computation with Obstacles ===');
        console.log('Obstacles\tTime/Compute');

        for (const obstacleCount of obstacleCounts) {
            const agent = createAgent(0, 50, 50, 1, 0, 1, 0);
            const obstacles: IObstacle[] = [];
            for (let i = 0; i < obstacleCount; i++) {
                obstacles.push(createRectObstacle(
                    45 + (i % 5) * 2,
                    45 + Math.floor(i / 5) * 2,
                    1,
                    1
                ));
            }

            const iterations = 3000;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                solver.computeNewVelocity(agent, [], obstacles, dt);
            }
            const time = performance.now() - start;

            const perCompute = time / iterations * 1000;

            console.log(
                obstacleCount + '\t\t' +
                perCompute.toFixed(2) + 'μs'
            );
        }

        expect(true).toBe(true);
    });

    // =========================================================================
    // Multi-Agent Simulation Performance
    // =========================================================================

    it('benchmark: multi-agent simulation scaling', () => {
        const agentCounts = [50, 100, 200, 500];
        const dt = 1 / 60;
        const simulationFrames = 60;

        console.log('\n=== Multi-Agent Simulation Scaling ===');
        console.log('Agents\t\tFrame Time\tTotal Time\tPer Agent');

        for (const agentCount of agentCounts) {
            const solver = createORCASolver({
                defaultTimeHorizon: 2,
                defaultTimeHorizonObst: 1,
                timeStep: dt
            });
            const kdTree = createKDTree();

            const agents = createCircularAgents(agentCount, 20);

            const start = performance.now();

            for (let frame = 0; frame < simulationFrames; frame++) {
                kdTree.build(agents);

                const newVelocities: Array<{ x: number; y: number }> = [];
                for (const agent of agents) {
                    const neighborResults = kdTree.queryNeighbors(
                        agent.position,
                        agent.neighborDist,
                        agent.maxNeighbors,
                        agent.id
                    );
                    const neighbors = neighborResults.map(r => r.agent);
                    const newVel = solver.computeNewVelocity(agent, neighbors, [], dt);
                    newVelocities.push(newVel);
                }

                for (let i = 0; i < agents.length; i++) {
                    agents[i].velocity = newVelocities[i];
                    agents[i].position.x += newVelocities[i].x * dt;
                    agents[i].position.y += newVelocities[i].y * dt;
                }
            }

            const totalTime = performance.now() - start;
            const frameTime = totalTime / simulationFrames;
            const perAgent = frameTime / agentCount * 1000;

            console.log(
                agentCount + '\t\t' +
                frameTime.toFixed(2) + 'ms\t\t' +
                totalTime.toFixed(2) + 'ms\t\t' +
                perAgent.toFixed(2) + 'μs'
            );

            // At 60 FPS we have ~16.67ms budget
            if (agentCount <= 200) {
                expect(frameTime).toBeLessThan(16.67);
            }
        }
    });

    it('benchmark: dense crowd simulation', () => {
        const solver = createORCASolver({
            defaultTimeHorizon: 2,
            defaultTimeHorizonObst: 1,
            timeStep: 1 / 60
        });
        const kdTree = createKDTree();

        const agentCount = 100;
        const areaSize = 20;
        const agents = createRandomAgents(agentCount, areaSize);

        const dt = 1 / 60;
        const simulationFrames = 120;

        console.log('\n=== Dense Crowd Simulation (100 agents in 20x20 area) ===');

        let totalFrameTime = 0;
        let maxFrameTime = 0;
        let minFrameTime = Infinity;

        for (let frame = 0; frame < simulationFrames; frame++) {
            const frameStart = performance.now();

            kdTree.build(agents);

            const newVelocities: Array<{ x: number; y: number }> = [];
            for (const agent of agents) {
                const neighborResults = kdTree.queryNeighbors(
                    agent.position,
                    agent.neighborDist,
                    agent.maxNeighbors,
                    agent.id
                );
                const neighbors = neighborResults.map(r => r.agent);
                const newVel = solver.computeNewVelocity(agent, neighbors, [], dt);
                newVelocities.push(newVel);
            }

            for (let i = 0; i < agents.length; i++) {
                agents[i].velocity = newVelocities[i];
                agents[i].position.x += newVelocities[i].x * dt;
                agents[i].position.y += newVelocities[i].y * dt;
            }

            const frameTime = performance.now() - frameStart;
            totalFrameTime += frameTime;
            maxFrameTime = Math.max(maxFrameTime, frameTime);
            minFrameTime = Math.min(minFrameTime, frameTime);
        }

        const avgFrameTime = totalFrameTime / simulationFrames;

        console.log('Frames:         ' + simulationFrames);
        console.log('Avg frame time: ' + avgFrameTime.toFixed(3) + 'ms');
        console.log('Min frame time: ' + minFrameTime.toFixed(3) + 'ms');
        console.log('Max frame time: ' + maxFrameTime.toFixed(3) + 'ms');
        console.log('Total time:     ' + totalFrameTime.toFixed(2) + 'ms');

        expect(avgFrameTime).toBeLessThan(16.67);
    });

    it('benchmark: simulation with obstacles', () => {
        const solver = createORCASolver({
            defaultTimeHorizon: 2,
            defaultTimeHorizonObst: 2,
            timeStep: 1 / 60
        });
        const kdTree = createKDTree();

        const agentCount = 50;
        const agents = createRandomAgents(agentCount, 100);

        const obstacles: IObstacle[] = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if ((i + j) % 3 === 0) {
                    obstacles.push(createRectObstacle(
                        10 + i * 8,
                        10 + j * 8,
                        4,
                        4
                    ));
                }
            }
        }

        const dt = 1 / 60;
        const simulationFrames = 60;

        console.log('\n=== Simulation with Obstacles (50 agents, ~33 obstacles) ===');

        const start = performance.now();

        for (let frame = 0; frame < simulationFrames; frame++) {
            kdTree.build(agents);

            const newVelocities: Array<{ x: number; y: number }> = [];
            for (const agent of agents) {
                const neighborResults = kdTree.queryNeighbors(
                    agent.position,
                    agent.neighborDist,
                    agent.maxNeighbors,
                    agent.id
                );
                const neighbors = neighborResults.map(r => r.agent);
                const newVel = solver.computeNewVelocity(agent, neighbors, obstacles, dt);
                newVelocities.push(newVel);
            }

            for (let i = 0; i < agents.length; i++) {
                agents[i].velocity = newVelocities[i];
                agents[i].position.x += newVelocities[i].x * dt;
                agents[i].position.y += newVelocities[i].y * dt;
            }
        }

        const totalTime = performance.now() - start;
        const avgFrameTime = totalTime / simulationFrames;

        console.log('Frames:         ' + simulationFrames);
        console.log('Total time:     ' + totalTime.toFixed(2) + 'ms');
        console.log('Avg frame time: ' + avgFrameTime.toFixed(3) + 'ms');
        console.log('Obstacles:      ' + obstacles.length);

        expect(avgFrameTime).toBeLessThan(16.67);
    });

    // =========================================================================
    // Stress Test
    // =========================================================================

    it('benchmark: stress test - 1000 agents', () => {
        const solver = createORCASolver({
            defaultTimeHorizon: 1.5,
            defaultTimeHorizonObst: 1,
            timeStep: 1 / 60
        });
        const kdTree = createKDTree();

        const agentCount = 1000;
        const agents = createRandomAgents(agentCount, 200);

        for (const agent of agents) {
            agent.maxNeighbors = 8;
            agent.neighborDist = 10;
        }

        const dt = 1 / 60;
        const simulationFrames = 30;

        console.log('\n=== STRESS TEST: 1000 Agents ===');

        let totalFrameTime = 0;
        let maxFrameTime = 0;

        for (let frame = 0; frame < simulationFrames; frame++) {
            const frameStart = performance.now();

            kdTree.build(agents);

            const newVelocities: Array<{ x: number; y: number }> = [];
            for (const agent of agents) {
                const neighborResults = kdTree.queryNeighbors(
                    agent.position,
                    agent.neighborDist,
                    agent.maxNeighbors,
                    agent.id
                );
                const neighbors = neighborResults.map(r => r.agent);
                const newVel = solver.computeNewVelocity(agent, neighbors, [], dt);
                newVelocities.push(newVel);
            }

            for (let i = 0; i < agents.length; i++) {
                agents[i].velocity = newVelocities[i];
                agents[i].position.x += newVelocities[i].x * dt;
                agents[i].position.y += newVelocities[i].y * dt;
            }

            const frameTime = performance.now() - frameStart;
            totalFrameTime += frameTime;
            maxFrameTime = Math.max(maxFrameTime, frameTime);
        }

        const avgFrameTime = totalFrameTime / simulationFrames;
        const perAgentTime = avgFrameTime / agentCount * 1000;

        console.log('Frames:          ' + simulationFrames);
        console.log('Avg frame time:  ' + avgFrameTime.toFixed(2) + 'ms');
        console.log('Max frame time:  ' + maxFrameTime.toFixed(2) + 'ms');
        console.log('Per agent:       ' + perAgentTime.toFixed(2) + 'μs');
        console.log('Theoretical FPS: ' + (1000 / avgFrameTime).toFixed(1));

        expect(true).toBe(true);
    });

    it('benchmark: circular swap scenario', () => {
        const solver = createORCASolver({
            defaultTimeHorizon: 2,
            defaultTimeHorizonObst: 1,
            timeStep: 1 / 60
        });
        const kdTree = createKDTree();

        const agentCount = 8;
        const radius = 10;
        const agents = createCircularAgents(agentCount, radius);

        const dt = 1 / 60;
        const simulationFrames = 300;

        console.log('\n=== Circular Swap Scenario (' + agentCount + ' agents) ===');

        let collisions = 0;
        const minDist = agents[0].radius * 2;

        const start = performance.now();

        for (let frame = 0; frame < simulationFrames; frame++) {
            kdTree.build(agents);

            const newVelocities: Array<{ x: number; y: number }> = [];
            for (const agent of agents) {
                const neighborResults = kdTree.queryNeighbors(
                    agent.position,
                    agent.neighborDist,
                    agent.maxNeighbors,
                    agent.id
                );
                const neighbors = neighborResults.map(r => r.agent);
                const newVel = solver.computeNewVelocity(agent, neighbors, [], dt);
                newVelocities.push(newVel);
            }

            for (let i = 0; i < agents.length; i++) {
                agents[i].velocity = newVelocities[i];
                agents[i].position.x += newVelocities[i].x * dt;
                agents[i].position.y += newVelocities[i].y * dt;
            }

            for (let i = 0; i < agents.length; i++) {
                for (let j = i + 1; j < agents.length; j++) {
                    const dx = agents[i].position.x - agents[j].position.x;
                    const dy = agents[i].position.y - agents[j].position.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < minDist * 0.9) {
                        collisions++;
                    }
                }
            }
        }

        const totalTime = performance.now() - start;
        const avgFrameTime = totalTime / simulationFrames;

        console.log('Frames:         ' + simulationFrames);
        console.log('Total time:     ' + totalTime.toFixed(2) + 'ms');
        console.log('Avg frame time: ' + avgFrameTime.toFixed(3) + 'ms');
        console.log('Collisions:     ' + collisions);

        expect(collisions).toBe(0);
    });

    // =========================================================================
    // Comparison Tests
    // =========================================================================

    it('benchmark: frame time breakdown', () => {
        const solver = createORCASolver({
            defaultTimeHorizon: 2,
            defaultTimeHorizonObst: 1,
            timeStep: 1 / 60
        });
        const kdTree = createKDTree();

        const agentCount = 200;
        const agents = createRandomAgents(agentCount, 100);
        const dt = 1 / 60;
        const iterations = 100;

        let kdTreeBuildTime = 0;
        let kdTreeQueryTime = 0;
        let orcaSolveTime = 0;
        let positionUpdateTime = 0;

        for (let iter = 0; iter < iterations; iter++) {
            const buildStart = performance.now();
            kdTree.build(agents);
            kdTreeBuildTime += performance.now() - buildStart;

            const newVelocities: Array<{ x: number; y: number }> = [];

            for (const agent of agents) {
                const queryStart = performance.now();
                const neighborResults = kdTree.queryNeighbors(
                    agent.position,
                    agent.neighborDist,
                    agent.maxNeighbors,
                    agent.id
                );
                kdTreeQueryTime += performance.now() - queryStart;

                const neighbors = neighborResults.map(r => r.agent);

                const solveStart = performance.now();
                const newVel = solver.computeNewVelocity(agent, neighbors, [], dt);
                orcaSolveTime += performance.now() - solveStart;

                newVelocities.push(newVel);
            }

            const updateStart = performance.now();
            for (let i = 0; i < agents.length; i++) {
                agents[i].velocity = newVelocities[i];
                agents[i].position.x += newVelocities[i].x * dt;
                agents[i].position.y += newVelocities[i].y * dt;
            }
            positionUpdateTime += performance.now() - updateStart;
        }

        const totalTime = kdTreeBuildTime + kdTreeQueryTime + orcaSolveTime + positionUpdateTime;

        console.log('\n=== Frame Time Breakdown (' + agentCount + ' agents, ' + iterations + ' frames) ===');
        console.log('KDTree build:    ' + (kdTreeBuildTime / iterations).toFixed(3) + 'ms (' + (kdTreeBuildTime / totalTime * 100).toFixed(1) + '%)');
        console.log('KDTree query:    ' + (kdTreeQueryTime / iterations).toFixed(3) + 'ms (' + (kdTreeQueryTime / totalTime * 100).toFixed(1) + '%)');
        console.log('ORCA solve:      ' + (orcaSolveTime / iterations).toFixed(3) + 'ms (' + (orcaSolveTime / totalTime * 100).toFixed(1) + '%)');
        console.log('Position update: ' + (positionUpdateTime / iterations).toFixed(3) + 'ms (' + (positionUpdateTime / totalTime * 100).toFixed(1) + '%)');
        console.log('Total per frame: ' + (totalTime / iterations).toFixed(3) + 'ms');

        expect(true).toBe(true);
    });
});
