---
title: "Local Avoidance (ORCA)"
description: "Multi-agent collision avoidance algorithm for runtime dynamic obstacle avoidance"
---

## Overview

The local avoidance system is based on the **ORCA (Optimal Reciprocal Collision Avoidance)** algorithm, designed to solve real-time collision avoidance between multiple moving agents (such as monsters, NPCs).

ORCA is an improved version of RVO (Reciprocal Velocity Obstacles) and is widely used in games and simulations.

### Features

- Efficient multi-agent collision avoidance
- Support for static obstacles
- KD-Tree based spatial indexing for accelerated neighbor queries
- Seamless integration with ECS framework
- Configurable avoidance parameters

## Basic Usage

### 1. Create Avoidance World

```typescript
import { AvoidanceWorldComponent } from '@esengine/pathfinding/ecs';
import { Polygon } from '@esengine/ecs-framework-math';

// Create avoidance world entity in the scene
const worldEntity = scene.createEntity('AvoidanceWorld');
const world = worldEntity.addComponent(new AvoidanceWorldComponent());

// Optional: Add static obstacles (like walls)
// Note: Obstacle vertices must be in counter-clockwise (CCW) order
world.addRectObstacle(0, 0, 100, 10);  // Rectangular obstacle
world.addObstacle({
    // Use Polygon.ensureCCW to ensure correct order
    // Y-down coordinate system (like Canvas) needs true
    vertices: Polygon.ensureCCW([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
    ], true)  // Use true for Canvas coordinate system
});
```

### 2. Create Avoidance Agents

```typescript
import { AvoidanceAgentComponent } from '@esengine/pathfinding/ecs';

// Add component to each entity that needs avoidance
const agentEntity = scene.createEntity('Agent');
const agent = agentEntity.addComponent(new AvoidanceAgentComponent());

// Configure agent parameters
agent.radius = 0.5;           // Agent radius
agent.maxSpeed = 5;           // Maximum speed
agent.neighborDist = 10;      // Neighbor search distance
agent.maxNeighbors = 10;      // Maximum number of neighbors
agent.timeHorizon = 2;        // Time horizon (agents)
agent.timeHorizonObst = 1;    // Time horizon (obstacles)
```

### 3. Add System

```typescript
import { LocalAvoidanceSystem } from '@esengine/pathfinding/ecs';

// Add local avoidance system
scene.addSystem(new LocalAvoidanceSystem());
```

### 4. Set Preferred Velocity

```typescript
// Update agent's preferred velocity each frame (uses agent's current position)
agent.setPreferredVelocityTowards(targetX, targetY);

// Or specify current position
agent.setPreferredVelocityTowards(targetX, targetY, currentX, currentY);

// Or set directly
agent.preferredVelocityX = 3;
agent.preferredVelocityY = 2;

// Other useful methods
agent.stop();              // Stop the agent
agent.applyNewVelocity();  // Manually apply ORCA computed new velocity
```

## Direct ORCA Solver Usage

If not using the ECS system, you can use the ORCA solver directly:

```typescript
import {
    createORCASolver,
    createKDTree,
    type IAvoidanceAgent,
    type IObstacle
} from '@esengine/pathfinding';
import { Polygon } from '@esengine/ecs-framework-math';

// Create solver and spatial index
const solver = createORCASolver({
    defaultTimeHorizon: 2,
    defaultTimeHorizonObst: 1,
    timeStep: 1/60
});

const kdTree = createKDTree();

// Define agent data
const agents: IAvoidanceAgent[] = [
    {
        id: 1,
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 0 },
        preferredVelocity: { x: 1, y: 0 },
        radius: 0.5,
        maxSpeed: 5,
        neighborDist: 10,
        maxNeighbors: 10,
        timeHorizon: 2,
        timeHorizonObst: 1
    },
    // ... more agents
];

// Define obstacles (vertices must be in CCW order)
const obstacles: IObstacle[] = [
    {
        // Use Polygon.ensureCCW to ensure correct vertex order
        // Use false for Y-up coordinate system, true for Y-down (like Canvas)
        vertices: Polygon.ensureCCW([
            { x: 100, y: 100 },
            { x: 200, y: 100 },
            { x: 200, y: 200 },
            { x: 100, y: 200 }
        ], false)
    }
];

// Build KD-Tree
kdTree.build(agents);

// Other KD-Tree methods
kdTree.clear();              // Clear the index
console.log(kdTree.agentCount); // Get agent count

// Compute new velocity for each agent
for (const agent of agents) {
    // Query neighbors (returns INeighborResult[])
    const neighborResults = kdTree.queryNeighbors(
        agent.position,
        agent.neighborDist,
        agent.maxNeighbors,
        agent.id
    );

    // Extract neighbor agents
    const neighborAgents = neighborResults.map(r => r.agent);

    // Compute new velocity
    const newVelocity = solver.computeNewVelocity(
        agent,
        neighborAgents,
        obstacles,
        deltaTime
    );

    // Apply new velocity
    agent.velocity = newVelocity;
}
```

## Configuration Parameters

### Agent Parameters (AvoidanceAgentComponent)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `radius` | 0.5 | Agent collision radius |
| `maxSpeed` | 5.0 | Maximum movement speed |
| `neighborDist` | 15.0 | Neighbor search distance |
| `maxNeighbors` | 10 | Maximum number of neighbors |
| `timeHorizon` | 2.0 | Prediction time for other agents |
| `timeHorizonObst` | 1.0 | Prediction time for obstacles |
| `enabled` | true | Whether avoidance is enabled |
| `autoApplyVelocity` | true | Whether to auto-apply computed new velocity |

### Agent Methods (AvoidanceAgentComponent)

| Method | Description |
|--------|-------------|
| `setPosition(x, y)` | Set agent position |
| `setVelocity(x, y)` | Set current velocity |
| `setPreferredVelocity(x, y)` | Set preferred velocity |
| `setPreferredVelocityTowards(targetX, targetY, currentX?, currentY?)` | Set preferred velocity towards target |
| `applyNewVelocity()` | Manually apply ORCA computed new velocity |
| `getNewSpeed()` | Get magnitude of new velocity (scalar) |
| `getCurrentSpeed()` | Get magnitude of current velocity (scalar) |
| `stop()` | Stop the agent (zero all velocities) |
| `reset()` | Reset all component state |

### World Parameters (AvoidanceWorldComponent)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `defaultTimeHorizon` | 2.0 | Default agent time horizon |
| `defaultTimeHorizonObst` | 1.0 | Default obstacle time horizon |
| `timeStep` | 1/60 | Simulation time step |

### World Methods (AvoidanceWorldComponent)

| Method | Description |
|--------|-------------|
| `addObstacle(obstacle)` | Add static obstacle (vertices must be CCW order) |
| `addRectObstacle(x, y, width, height)` | Add rectangular obstacle |
| `clearObstacles()` | Remove all obstacles |
| `resetStats()` | Reset statistics |
| `getConfig()` | Get ORCA configuration object |

### Solver Configuration (IORCASolverConfig)

Configuration parameters when using ORCA solver directly:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `defaultTimeHorizon` | 2.0 | Default agent time horizon |
| `defaultTimeHorizonObst` | 1.0 | Default obstacle time horizon |
| `timeStep` | 1/60 | Simulation time step |
| `epsilon` | 0.00001 | Numerical precision threshold |

## Integration with Pathfinding

ORCA can work with the pathfinding system for complete navigation:

```typescript
import {
    PathfindingAgentComponent,
    PathfindingSystem,
    AvoidanceAgentComponent,
    LocalAvoidanceSystem
} from '@esengine/pathfinding/ecs';

// Add both components to the same entity
const entity = scene.createEntity('NavigatingAgent');
entity.addComponent(new PathfindingAgentComponent());
entity.addComponent(new AvoidanceAgentComponent());

// Pathfinding calculates paths, local avoidance handles dynamic obstacles
scene.addSystem(new PathfindingSystem());
scene.addSystem(new LocalAvoidanceSystem());
```

## ORCA Algorithm Principle

ORCA is based on the "velocity obstacle" concept:

1. **Velocity Obstacle (VO)**: Given two agents, the velocity obstacle is the set of all velocities that would lead to a collision

2. **ORCA Constraint Lines**: For each pair of agents, compute a half-plane constraint line where both agents share equal responsibility for avoidance

3. **Linear Programming**: Within the feasible region of all constraint lines, find the new velocity closest to the preferred velocity

```
    Preferred ●
    velocity   \
                \  ORCA constraint line
    ═════════════╳═════════════
                /
               ●  Optimal new velocity
```

## Performance Optimization Tips

1. **Adjust `neighborDist`**: Reducing search distance lowers neighbor query overhead
2. **Limit `maxNeighbors`**: Usually 5-10 neighbors is sufficient
3. **Use spatial partitioning**: KD-Tree is built-in, automatically optimizes for large agent counts
4. **Reduce obstacle vertices**: Simplify static obstacle geometry

## Statistics

Get runtime statistics:

```typescript
const world = entity.getComponent(AvoidanceWorldComponent);

// Get statistics
console.log('Agent count:', world.agentCount);
console.log('Processed this frame:', world.agentsProcessedThisFrame);
console.log('Compute time:', world.computeTimeMs, 'ms');
```
