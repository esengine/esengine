---
title: "Unified Navigation System"
description: "A high-level navigation system that integrates path planning, local avoidance, flow control, and collision resolution"
---

## Overview

`NavigationSystem` is a unified high-level navigation system that integrates multiple navigation modules:

```
Path Planning → Flow Control → Local Avoidance → Collision Resolution
      ↓              ↓              ↓                   ↓
  A*/NavMesh     Queueing        ORCA            Wall Penetration Fix
```

**Key Features**:
- Pluggable algorithm architecture (path planning, avoidance, collision resolution)
- Separate handling of static/dynamic obstacles
- Time-sliced pathfinding (for large-scale agent scenarios)
- Flow control and queue management

### Core Architecture: Clear Primary/Secondary Roles

NavigationSystem adopts a **clear primary/secondary** architecture design:

| Module | Role | Responsibility |
|--------|------|----------------|
| **Path Planner** (A*/NavMesh) | Primary | Calculate global paths around **static obstacles** |
| **Local Avoidance** (ORCA) | Secondary | Handle **dynamic obstacles** and agent-to-agent avoidance |
| **Collision Resolver** | Fallback | Prevent wall penetration, handle all obstacles |

This design ensures:
- A*/NavMesh is responsible for global path planning around walls, buildings, and other static obstacles
- ORCA only handles moving dynamic obstacles (like other NPCs, players), without interfering with the main path
- Collision resolver serves as the last line of defense, ensuring agents don't penetrate any obstacles

## Quick Start

```typescript
import {
    NavigationSystem,
    NavigationAgentComponent,
    createNavMeshPathPlanner,
    createAStarPlanner,
    createORCAAvoidance,
    createFlowController,
    createDefaultCollisionResolver
} from '@esengine/pathfinding/ecs';

// Create navigation system
const navSystem = new NavigationSystem({
    enablePathPlanning: true,
    enableLocalAvoidance: true,
    enableFlowControl: false,
    enableCollisionResolution: true
});

// Set path planner (choose one)
// Option 1: NavMesh (for complex polygon terrain)
navSystem.setPathPlanner(createNavMeshPathPlanner(navMesh));

// Option 2: A* (for grid maps)
navSystem.setPathPlanner(createAStarPlanner(gridMap, undefined, { cellSize: 20 }));

// Set local avoidance
navSystem.setLocalAvoidance(createORCAAvoidance({
    defaultTimeHorizon: 2.0,
    defaultTimeHorizonObst: 1.0  // Time horizon for dynamic obstacles
}));

// Set collision resolver
navSystem.setCollisionResolver(createDefaultCollisionResolver());

// Add to scene
scene.addSystem(navSystem);
```

## Static vs Dynamic Obstacles

### Obstacle Classification

NavigationSystem classifies obstacles into two types:

| Type | Examples | Handled By | API |
|------|----------|------------|-----|
| **Static Obstacles** | Walls, buildings, terrain | Path planner routes around | `addStaticObstacle()` |
| **Dynamic Obstacles** | Moving platforms, destructibles | ORCA real-time avoidance | `addDynamicObstacle()` |

### API Usage

```typescript
// Add static obstacle (wall) - path planner will route around it
navSystem.addStaticObstacle({
    vertices: [
        { x: 100, y: 50 },
        { x: 200, y: 50 },
        { x: 200, y: 70 },
        { x: 100, y: 70 }
    ]
});

// Add dynamic obstacle (moving platform) - ORCA will avoid in real-time
navSystem.addDynamicObstacle({
    vertices: [
        { x: 300, y: 100 },
        { x: 350, y: 100 },
        { x: 350, y: 150 },
        { x: 300, y: 150 }
    ]
});

// Get obstacle lists
const staticObs = navSystem.getStaticObstacles();
const dynamicObs = navSystem.getDynamicObstacles();

// Clear obstacles
navSystem.clearStaticObstacles();
navSystem.clearDynamicObstacles();
```

### Architecture Flow Chart

```
Agent sets destination
        ↓
┌─────────────────────────────────────────────────────────┐
│  Path Planner (A*/NavMesh)                              │
│  Input: start, end, staticObstacles                     │
│  Output: global waypoint list                           │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│  Flow Controller (optional)                             │
│  Detect congestion, manage queuing                      │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│  Local Avoidance (ORCA)                                 │
│  Input: preferred velocity, neighbor agents,            │
│         dynamicObstacles                                │
│  Output: safe new velocity                              │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│  Collision Resolver                                     │
│  Input: new position, staticObstacles + dynamicObstacles│
│  Output: corrected final position (prevent penetration) │
└─────────────────────────────────────────────────────────┘
        ↓
Agent moves to new position
```

## Navigation Agent Component

Each entity that needs navigation should have `NavigationAgentComponent`:

```typescript
import { ORCAConfigComponent } from '@esengine/pathfinding/ecs';

const entity = scene.createEntity('Agent');
const nav = entity.addComponent(new NavigationAgentComponent());

// Configure agent parameters
nav.radius = 0.5;              // Collision radius
nav.maxSpeed = 5.0;            // Maximum speed
nav.waypointThreshold = 0.5;   // Distance threshold for reaching waypoint

// Optional: Add ORCA config for custom avoidance parameters
const orcaConfig = entity.addComponent(new ORCAConfigComponent());
orcaConfig.neighborDist = 15.0;    // Neighbor search distance
orcaConfig.maxNeighbors = 10;      // Maximum neighbors
orcaConfig.timeHorizon = 2.0;      // Agent time horizon
orcaConfig.timeHorizonObst = 1.0;  // Obstacle time horizon

// Set destination
nav.setDestination(targetX, targetY);

// Check status
if (nav.hasArrived()) {
    console.log('Reached destination!');
}

// Stop navigation
nav.stop();
```

### waypointThreshold Parameter

`waypointThreshold` controls when an agent advances to the next waypoint:

```typescript
// Recommended: 2x agent radius, minimum 15
nav.waypointThreshold = Math.max(nav.radius * 2, 15);
```

**Problems with too large value**:
- Agent switches to next waypoint too early
- At corners, agent may aim at waypoints behind walls, conflicting with ORCA avoidance
- Results in agent repeatedly turning around at corners

**Problems with too small value**:
- Agent movement not smooth enough
- May pause at waypoints

## Path Planner Adapters

### NavMesh Path Planner

For complex polygon terrain:

```typescript
import { createNavMeshPathPlanner } from '@esengine/pathfinding/ecs';

const planner = createNavMeshPathPlanner(navMesh, {
    agentRadius: 10  // Agent radius for path smoothing
});

navSystem.setPathPlanner(planner);
```

### Grid Path Planners

For grid-based maps, supports A*, JPS, HPA*:

```typescript
import {
    createAStarPlanner,
    createJPSPlanner,
    createHPAPlanner
} from '@esengine/pathfinding/ecs';

// A* pathfinder
const astarPlanner = createAStarPlanner(gridMap, undefined, {
    cellSize: 20  // Grid cell size (pixels)
});

// JPS pathfinder (uniform-cost grids, 10-100x faster than A*)
const jpsPlanner = createJPSPlanner(gridMap, undefined, {
    cellSize: 20
});

// HPA* pathfinder (very large maps 1000x1000+)
const hpaPlanner = createHPAPlanner(gridMap, { clusterSize: 16 }, undefined, {
    cellSize: 20
});
```

### cellSize Coordinate Conversion

When your game uses pixel coordinates while the grid uses cell coordinates, the `cellSize` parameter handles the conversion automatically:

```typescript
// Assume grid is 30x20 cells, each cell 20x20 pixels
// Game world size is 600x400 pixels
const gridMap = createGridMap(30, 20);
const planner = createAStarPlanner(gridMap, undefined, { cellSize: 20 });

// Now you can use pixel coordinates directly
// Internally converts: (480, 300) → grid(24, 15) → pixels(490, 310)
nav.setDestination(480, 300);
```

**Conversion rules**:
- Pixel → Grid: `Math.floor(pixel / cellSize)`
- Grid → Pixel:
  - When `cellSize > 1`: `grid * cellSize + cellSize * 0.5` (returns cell center)
  - When `cellSize = 1`: `grid` (returns grid coordinate directly)

**alignToCenter option**:

You can explicitly control whether to return cell center using `alignToCenter`:

```typescript
// Default behavior: align to center when cellSize > 1, no alignment when cellSize = 1
const planner1 = createAStarPlanner(gridMap, undefined, { cellSize: 20 });  // alignToCenter = true

// Explicitly disable center alignment (returns cell top-left corner)
const planner2 = createAStarPlanner(gridMap, undefined, {
    cellSize: 20,
    alignToCenter: false
});

// Explicitly enable center alignment (returns 0.5, 1.5, 2.5... even when cellSize = 1)
const planner3 = createAStarPlanner(gridMap, undefined, {
    cellSize: 1,
    alignToCenter: true
});
```

### Time-Sliced Pathfinding (Large-Scale Agents)

For large-scale agent scenarios (100+), you can use incremental pathfinding to spread computation across multiple frames:

```typescript
import {
    NavigationSystem,
    createIncrementalAStarPlanner
} from '@esengine/pathfinding/ecs';
import { createGridMap } from '@esengine/pathfinding';

const gridMap = createGridMap(200, 200);

// Create incremental pathfinder
const planner = createIncrementalAStarPlanner(gridMap, undefined, {
    cellSize: 20
});

// Enable time slicing
const navSystem = new NavigationSystem({
    enableTimeSlicing: true,     // Enable time slicing
    iterationsBudget: 1000,      // Total iterations per frame
    maxAgentsPerFrame: 10,       // Max agents to process per frame
    maxIterationsPerAgent: 200   // Max iterations per agent per frame
});

navSystem.setPathPlanner(planner);
```

**How it works**:
- System auto-detects `IIncrementalPathPlanner` and enables incremental mode
- Iteration budget is allocated to agents by priority each frame
- Pathfinding computation is spread across frames to avoid stuttering
- Agents can set priority via `priority` property (lower number = higher priority)

**Agent Priority**:

```typescript
const nav = entity.addComponent(new NavigationAgentComponent());
nav.priority = 10;  // High priority, gets iteration budget first

// Check pathfinding status
if (nav.isComputingPath) {
    console.log(`Pathfinding progress: ${(nav.pathProgress * 100).toFixed(0)}%`);
}
```

## Complete Example

```typescript
import { Scene } from '@esengine/ecs-framework';
import {
    NavigationSystem,
    NavigationAgentComponent,
    createAStarPlanner,
    createORCAAvoidance,
    createDefaultCollisionResolver
} from '@esengine/pathfinding/ecs';
import { createGridMap } from '@esengine/pathfinding';

// Create scene
const scene = new Scene();

// Create grid map
const gridMap = createGridMap(30, 20);
gridMap.setRectWalkable(10, 5, 5, 10, false);  // Add obstacle area

// Create navigation system
const navSystem = new NavigationSystem({
    enablePathPlanning: true,
    enableLocalAvoidance: true,
    enableCollisionResolution: true
});

// Configure modules
navSystem.setPathPlanner(createAStarPlanner(gridMap, undefined, { cellSize: 20 }));
navSystem.setLocalAvoidance(createORCAAvoidance());
navSystem.setCollisionResolver(createDefaultCollisionResolver());

// Add static obstacle (wall)
navSystem.addStaticObstacle({
    vertices: [
        { x: 200, y: 100 },
        { x: 300, y: 100 },
        { x: 300, y: 300 },
        { x: 200, y: 300 }
    ]
});

scene.addSystem(navSystem);

// Create agents
for (let i = 0; i < 10; i++) {
    const entity = scene.createEntity(`Agent-${i}`);
    const nav = entity.addComponent(new NavigationAgentComponent());

    // Set initial position
    nav.setPosition(50 + Math.random() * 100, 150 + Math.random() * 100);
    nav.radius = 0.5;
    nav.maxSpeed = 5.0;
    nav.waypointThreshold = 0.5;

    // Set destination (other side)
    nav.setDestination(500, 200);
}
```

## API Reference

### NavigationSystem Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enablePathPlanning` | `boolean` | `true` | Enable path planning |
| `enableLocalAvoidance` | `boolean` | `true` | Enable local avoidance |
| `enableFlowControl` | `boolean` | `true` | Enable flow control |
| `enableCollisionResolution` | `boolean` | `true` | Enable collision resolution |
| `enableTimeSlicing` | `boolean` | `false` | Enable time-sliced pathfinding |
| `iterationsBudget` | `number` | `1000` | Total iterations per frame |
| `maxAgentsPerFrame` | `number` | `10` | Max agents to process per frame |
| `maxIterationsPerAgent` | `number` | `200` | Max iterations per agent per frame |

### NavigationSystem Methods

| Method | Description |
|--------|-------------|
| `setPathPlanner(planner)` | Set path planner |
| `getPathPlanner()` | Get current path planner |
| `setLocalAvoidance(avoidance)` | Set local avoidance module |
| `getLocalAvoidance()` | Get current local avoidance module |
| `setFlowController(controller)` | Set flow controller |
| `getFlowController()` | Get current flow controller |
| `setCollisionResolver(resolver)` | Set collision resolver |
| `getCollisionResolver()` | Get current collision resolver |
| `addStaticObstacle(obstacle)` | Add static obstacle |
| `addDynamicObstacle(obstacle)` | Add dynamic obstacle |
| `clearStaticObstacles()` | Clear all static obstacles |
| `clearDynamicObstacles()` | Clear all dynamic obstacles |
| `clearObstacles()` | Clear all obstacles (static and dynamic) |
| `getStaticObstacles()` | Get static obstacle list |
| `getDynamicObstacles()` | Get dynamic obstacle list |

### NavigationAgentComponent Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `position` | `IVector2` | `{x:0,y:0}` | Current position |
| `velocity` | `IVector2` | `{x:0,y:0}` | Current velocity |
| `radius` | `number` | `0.5` | Collision radius |
| `maxSpeed` | `number` | `5.0` | Maximum speed |
| `acceleration` | `number` | `10.0` | Acceleration |
| `waypointThreshold` | `number` | `0.5` | Waypoint arrival threshold |
| `arrivalThreshold` | `number` | `0.3` | Destination arrival threshold |
| `repathInterval` | `number` | `0.5` | Path recalculation interval (seconds) |
| `enabled` | `boolean` | `true` | Whether navigation is enabled |
| `autoRepath` | `boolean` | `true` | Whether to auto repath when blocked |
| `smoothSteering` | `boolean` | `true` | Whether to enable smooth steering |
| `priority` | `number` | `50` | Priority (lower = higher priority) |
| `isComputingPath` | `boolean` | `false` | Whether computing path |
| `pathProgress` | `number` | `0` | Pathfinding progress (0-1) |

### NavigationAgentComponent Methods

| Method | Description |
|--------|-------------|
| `setPosition(x, y)` | Set current position |
| `setDestination(x, y)` | Set target position |
| `stop()` | Stop navigation |
| `hasArrived()` | Check if arrived at destination |
| `isBlocked()` | Check if path is blocked |
| `isUnreachable()` | Check if destination is unreachable |
| `getCurrentWaypoint()` | Get current waypoint |
| `getDistanceToDestination()` | Get distance to destination |
| `getCurrentSpeed()` | Get current speed magnitude |

### ORCAConfigComponent Properties (Optional)

Use `ORCAConfigComponent` to customize ORCA parameters per agent:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `neighborDist` | `number` | `15.0` | Neighbor detection distance |
| `maxNeighbors` | `number` | `10` | Maximum neighbors |
| `timeHorizon` | `number` | `2.0` | Agent time horizon |
| `timeHorizonObst` | `number` | `1.0` | Obstacle time horizon |

## Debugging Tips

### Visualize Path

```typescript
// Draw path in render loop
if (nav.path.length > 0) {
    ctx.beginPath();
    ctx.moveTo(nav.path[0].x, nav.path[0].y);
    for (let i = 1; i < nav.path.length; i++) {
        ctx.lineTo(nav.path[i].x, nav.path[i].y);
    }
    ctx.strokeStyle = 'blue';
    ctx.stroke();
}
```

### Common Issues

**Issue: Agent circles around at corners**
- Check if `waypointThreshold` is too large
- Recommended: `Math.max(radius * 2, 15)`

**Issue: Agent cannot reach destination**
- Check if destination is in walkable area
- Check if static obstacles are set correctly
- Use `planner.isWalkable(x, y)` to verify

**Issue: Agent penetrates obstacles**
- Ensure `enableCollisionResolution: true`
- Check obstacle vertex order (should be CCW)
- Use `Polygon.ensureCCW()` for auto-correction

## Live Demo

Check out the [Navigation System Interactive Demo](/en/examples/navigation-system-demo/) to experience the full functionality.
