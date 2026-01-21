---
title: "Local Avoidance (ORCA)"
description: "Multi-agent collision avoidance algorithm for runtime dynamic obstacle avoidance"
---

## Overview

The local avoidance system is based on the **ORCA (Optimal Reciprocal Collision Avoidance)** algorithm, designed to solve real-time collision avoidance between multiple moving agents (such as monsters, NPCs).

ORCA is an improved version of RVO (Reciprocal Velocity Obstacles) and is widely used in games and simulations.

### Features

- Efficient multi-agent collision avoidance
- Support for static and dynamic obstacles
- KD-Tree based spatial indexing for accelerated neighbor queries
- Seamless integration with NavigationSystem
- Configurable avoidance parameters

## Integration with NavigationSystem (Recommended)

Use ORCA avoidance through `NavigationSystem`'s pluggable architecture:

### 1. Create Navigation System

```typescript
import {
    NavigationSystem,
    NavigationAgentComponent,
    ORCAConfigComponent,  // Optional: for per-agent ORCA customization
    createNavMeshPathPlanner,
    createORCAAvoidance,
    createDefaultCollisionResolver
} from '@esengine/pathfinding/ecs';

// Create pluggable navigation system
const navSystem = new NavigationSystem({
    enablePathPlanning: true,
    enableLocalAvoidance: true,      // Enable ORCA avoidance
    enableCollisionResolution: true
});

// Set path planner
navSystem.setPathPlanner(createNavMeshPathPlanner(navMesh));

// Set ORCA local avoidance
navSystem.setLocalAvoidance(createORCAAvoidance({
    defaultTimeHorizon: 2.0,
    defaultTimeHorizonObst: 1.0,
    timeStep: 1/60
}));

// Set collision resolver
navSystem.setCollisionResolver(createDefaultCollisionResolver());

scene.addSystem(navSystem);
```

### 2. Create Navigation Agents

```typescript
// Add component to each entity that needs avoidance
const agentEntity = scene.createEntity('Agent');
const agent = agentEntity.addComponent(new NavigationAgentComponent());

// Core navigation parameters
agent.radius = 0.5;           // Agent radius
agent.maxSpeed = 5;           // Maximum speed

// Optional: Add ORCA config to customize avoidance parameters
const orcaConfig = agentEntity.addComponent(new ORCAConfigComponent());
orcaConfig.neighborDist = 10;      // Neighbor search distance
orcaConfig.maxNeighbors = 10;      // Maximum number of neighbors
orcaConfig.timeHorizon = 2;        // Time horizon (agents)
orcaConfig.timeHorizonObst = 1;    // Time horizon (obstacles)

// Set destination
agent.setDestination(100, 100);
```

### 3. Add Obstacles

```typescript
import { Polygon } from '@esengine/ecs-framework-math';

// Static obstacles (path planner routes around)
navSystem.addStaticObstacle({
    vertices: Polygon.ensureCCW([
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 },
        { x: 100, y: 200 }
    ], true)  // Use true for Canvas coordinate system
});

// Dynamic obstacles (ORCA real-time avoidance)
navSystem.addDynamicObstacle({
    vertices: [{ x: 300, y: 100 }, { x: 350, y: 100 }, { x: 350, y: 150 }, { x: 300, y: 150 }]
});

// Clear all dynamic obstacles
navSystem.clearDynamicObstacles();
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

### Agent Parameters (NavigationAgentComponent)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `radius` | 0.5 | Agent collision radius |
| `maxSpeed` | 5.0 | Maximum movement speed |
| `enabled` | true | Whether navigation is enabled |

### ORCA Parameters (ORCAConfigComponent)

Optional component to customize ORCA avoidance parameters per agent:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `neighborDist` | 15.0 | Neighbor search distance |
| `maxNeighbors` | 10 | Maximum number of neighbors |
| `timeHorizon` | 2.0 | Prediction time for other agents |
| `timeHorizonObst` | 1.0 | Prediction time for obstacles |

### Solver Configuration (IORCASolverConfig)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `defaultTimeHorizon` | 2.0 | Default agent time horizon |
| `defaultTimeHorizonObst` | 1.0 | Default obstacle time horizon |
| `timeStep` | 1/60 | Simulation time step |
| `epsilon` | 0.00001 | Numerical precision threshold |
| `yAxisDown` | false | Whether using Y-axis down coordinate system (like Canvas) |

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

## Flow Controller

When multiple agents converge in narrow areas (corridors, doorways), ORCA may fail to find a feasible velocity solution. The flow controller solves this through queuing mechanisms:

### Why Use a Flow Controller?

ORCA algorithm may produce undesirable behavior in these scenarios:

- **Narrow passages**: Multiple agents trying to pass simultaneously, too many ORCA constraints lead to no feasible solution
- **Intersections**: Agents moving towards each other may cause "deadlock" or repeated jittering
- **Doorway congestion**: Large numbers of agents gathering at entrances, blocking each other

The flow controller addresses these issues by detecting congestion zones and managing passage order.

### Basic Usage

```typescript
import {
    NavigationSystem,
    createFlowController,
    PassPermission
} from '@esengine/pathfinding/ecs';

// Create navigation system
const navSystem = new NavigationSystem({
    enableFlowControl: true  // Enable flow control
});

// Create flow controller
const flowController = createFlowController({
    detectionRadius: 3.0,         // Detection radius: how close agents are grouped
    minAgentsForCongestion: 3,    // Minimum agents to trigger congestion detection
    defaultCapacity: 2,           // Default zone capacity: agents that can pass simultaneously
    waitPointDistance: 1.5        // Wait point distance: spacing when queuing
});

// Set flow controller
navSystem.setFlowController(flowController);

// Add static congestion zone (like a doorway)
const doorZoneId = flowController.addStaticZone(
    { x: 50, y: 50 },  // Center point
    5.0,               // Radius
    1                  // Capacity (only 1 agent can pass at a time)
);

// Remove at runtime
flowController.removeStaticZone(doorZoneId);
```

### Pass Permissions

The flow controller returns one of three permissions for each agent:

| Permission | Description | Handling |
|------------|-------------|----------|
| `Proceed` | Normal passage | Execute ORCA avoidance |
| `Wait` | Queue and wait | Move to wait position and stop |
| `Yield` | Slow down and yield | Reduce speed, execute ORCA |

### Configuration Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `detectionRadius` | 3.0 | Detection radius, determines how close agents are grouped |
| `minAgentsForCongestion` | 3 | Minimum agents to trigger congestion detection |
| `defaultCapacity` | 2 | Default zone capacity: agents allowed to pass simultaneously |
| `waitPointDistance` | 1.5 | Distance from congestion zone edge for wait points |
| `yieldSpeedMultiplier` | 0.3 | Speed multiplier when yielding (0-1) |

## NavigationSystem Processing Pipeline

```
1. Path Planning → 2. Flow Control → 3. Local Avoidance → 4. Collision Resolution
        ↓                ↓                  ↓                    ↓
   Compute path    Check permission   Compute avoidance    Validate & correct
(static obstacles)                   (dynamic obstacles)   (all obstacles)
```

**Architecture Note**: NavigationSystem separates obstacles into static and dynamic:
- **Static obstacles**: Handled by path planner (A*/NavMesh), computes global paths around them
- **Dynamic obstacles**: Handled by ORCA, real-time avoidance for moving obstacles

## Performance Optimization Tips

1. **Adjust `neighborDist`**: Reducing search distance lowers neighbor query overhead
2. **Limit `maxNeighbors`**: Usually 5-10 neighbors is sufficient
3. **Use spatial partitioning**: KD-Tree is built-in, automatically optimizes for large agent counts
4. **Reduce obstacle vertices**: Simplify static obstacle geometry
5. **Enable flow control**: Use flow controller in narrow passage scenarios to avoid ORCA failures

## Interactive Demo

Check out the [NavigationSystem Demo](/en/examples/navigation-system-demo/) to experience ORCA local avoidance combined with other navigation features.
