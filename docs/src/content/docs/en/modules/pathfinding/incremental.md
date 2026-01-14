---
title: "Incremental Pathfinding"
description: "Time-sliced execution with pause/resume and dynamic replanning support"
---

Incremental Pathfinding allows spreading pathfinding computation across multiple frames, avoiding main thread blocking. Ideal for scenarios with many agents pathfinding simultaneously.

## Key Features

- **Time-slicing** - Execute limited iterations per frame
- **Pause/Resume** - Suspend and resume search at any time
- **Dynamic Replanning** - Handle obstacle changes automatically
- **Path Caching** - Optional result caching

## Basic Usage

```typescript
import {
    createIncrementalAStarPathfinder,
    PathfindingState,
    GridMap
} from '@esengine/pathfinding';

const grid = new GridMap(200, 200);
const pathfinder = createIncrementalAStarPathfinder(grid);

// 1. Request path (non-blocking)
const request = pathfinder.requestPath(0, 0, 199, 199);
console.log('Request ID:', request.id);

// 2. Execute iterations each frame
function gameLoop() {
    const progress = pathfinder.step(request.id, 100); // 100 iterations per frame

    console.log('Progress:', (progress.estimatedProgress * 100).toFixed(1) + '%');

    if (progress.state === PathfindingState.Completed) {
        const result = pathfinder.getResult(request.id);
        console.log('Path found!', result?.path);
        pathfinder.cleanup(request.id); // Clean up resources
    } else if (progress.state === PathfindingState.InProgress) {
        requestAnimationFrame(gameLoop);
    } else {
        console.log('Failed or cancelled');
    }
}

gameLoop();
```

## State Management

### PathfindingState Enum

| State | Description |
|-------|-------------|
| `Idle` | Idle, not started |
| `InProgress` | Search in progress |
| `Paused` | Paused |
| `Completed` | Search complete, path found |
| `Failed` | Search complete, no path found |
| `Cancelled` | Cancelled |

### Pause and Resume

```typescript
const request = pathfinder.requestPath(0, 0, 199, 199);

// Execute some steps
pathfinder.step(request.id, 500);

// Pause
pathfinder.pause(request.id);
console.log(pathfinder.getProgress(request.id)?.state); // 'paused'

// Resume
pathfinder.resume(request.id);
pathfinder.step(request.id, 500); // Continue execution
```

### Cancel Request

```typescript
const request = pathfinder.requestPath(0, 0, 199, 199);

// Don't need this path anymore
pathfinder.cancel(request.id);

// Clean up resources
pathfinder.cleanup(request.id);
```

## Multi-Agent Management

### Priority Queue Pattern

```typescript
class PathfindingManager {
    private pathfinder: IncrementalAStarPathfinder;
    private requests: Map<number, { id: number; priority: number; entityId: string }>;
    private budgetPerFrame = 2000; // Total iterations budget per frame

    requestPath(entityId: string, sx: number, sy: number, ex: number, ey: number, priority = 50) {
        const request = this.pathfinder.requestPath(sx, sy, ex, ey);
        this.requests.set(request.id, { id: request.id, priority, entityId });
        return request.id;
    }

    update() {
        // Sort by priority
        const sorted = [...this.requests.values()].sort((a, b) => b.priority - a.priority);

        let budget = this.budgetPerFrame;
        const iterPerAgent = Math.max(10, Math.floor(budget / sorted.length));

        for (const req of sorted) {
            if (budget <= 0) break;

            const progress = this.pathfinder.getProgress(req.id);
            if (!progress || progress.state !== PathfindingState.InProgress) continue;

            this.pathfinder.step(req.id, iterPerAgent);
            budget -= iterPerAgent;
        }
    }
}
```

## ECS Integration

The package provides complete ECS components and systems for direct use in the ECS framework.

```typescript
import {
    PathfindingAgentComponent,
    PathfindingMapComponent,
    PathfindingSystem
} from '@esengine/pathfinding/ecs';
```

### PathfindingMapComponent

Map component attached to scene entity, manages map and pathfinder instances.

```typescript
// Create map entity
const mapEntity = scene.createEntity('PathfindingMap');
const mapComp = mapEntity.addComponent(new PathfindingMapComponent());

// Configure map
mapComp.width = 100;               // Map width
mapComp.height = 100;              // Map height
mapComp.allowDiagonal = true;      // Allow diagonal movement
mapComp.avoidCorners = true;       // Avoid corner cutting

// Configure system parameters
mapComp.maxAgentsPerFrame = 10;    // Max agents processed per frame
mapComp.iterationsBudget = 2000;   // Total iteration budget per frame

// Configure cache
mapComp.enableCache = true;        // Enable path caching
mapComp.cacheMaxEntries = 1000;    // Max cache entries
mapComp.cacheTtlMs = 5000;         // Cache TTL in milliseconds

// Configure path smoothing
mapComp.enableSmoothing = true;    // Enable path smoothing
mapComp.smoothingType = 'los';     // 'los' | 'catmullrom' | 'combined'

// Dynamically modify obstacles
mapComp.setWalkable(10, 10, false);  // Set single cell unwalkable
mapComp.setRectWalkable(20, 20, 5, 5, false);  // Set rectangular area
```

### PathfindingAgentComponent

Agent component attached to entities that need pathfinding.

```typescript
// Create agent entity
const agentEntity = scene.createEntity('Agent');
const agent = agentEntity.addComponent(new PathfindingAgentComponent());

// Set current position
agent.x = 10;
agent.y = 10;

// Configure parameters
agent.priority = 50;                 // Priority (lower = higher priority)
agent.maxIterationsPerFrame = 100;   // Max iterations per frame
agent.enableDynamicReplan = true;    // Enable dynamic replanning
agent.lookaheadDistance = 5;         // Lookahead distance for obstacle detection
agent.validationInterval = 10;       // Path validation interval (frames)

// Request pathfinding
agent.requestPathTo(50, 50);

// Listen for completion
agent.onPathComplete = (found, path) => {
    if (found) {
        console.log('Path found, length:', path.length);
    } else {
        console.log('No path found');
    }
};

// Listen for progress
agent.onPathProgress = (progress) => {
    console.log('Progress:', (progress * 100).toFixed(1) + '%');
};
```

**Common agent methods:**

```typescript
// Get next waypoint
const waypoint = agent.getNextWaypoint();
if (waypoint) {
    // Move to waypoint.x, waypoint.y
}

// Advance to next waypoint when reached
agent.advanceWaypoint();

// Check state
agent.isSearching();      // Is pathfinding in progress
agent.hasValidPath();     // Has valid path
agent.isPathComplete();   // Reached destination

// Cancel pathfinding
agent.cancelPath();

// Get info
agent.getRemainingWaypointCount();  // Remaining waypoints
agent.getPathLength();              // Total path length
agent.state;                        // Current state
agent.progress;                     // Pathfinding progress (0-1)
```

### PathfindingSystem

Pathfinding system that automatically processes all agent requests.

```typescript
// Add system to scene
scene.addSystem(new PathfindingSystem());
```

The system automatically:
- Processes agents by priority
- Executes time-slicing within frame budget
- Validates path validity and auto-replans
- Applies path smoothing

### Complete Example

```typescript
import { Scene, Entity } from '@esengine/ecs-framework';
import {
    PathfindingAgentComponent,
    PathfindingMapComponent,
    PathfindingSystem
} from '@esengine/pathfinding/ecs';

// Initialize scene
const scene = new Scene();
scene.addSystem(new PathfindingSystem());

// Create map
const mapEntity = scene.createEntity('Map');
const mapComp = mapEntity.addComponent(new PathfindingMapComponent());
mapComp.width = 100;
mapComp.height = 100;
mapComp.iterationsBudget = 2000;

// Add some obstacles
mapComp.setRectWalkable(40, 40, 20, 20, false);

// Create multiple agents
for (let i = 0; i < 10; i++) {
    const agent = scene.createEntity(`Agent${i}`);
    const pathAgent = agent.addComponent(new PathfindingAgentComponent());

    // Random start position
    pathAgent.x = Math.floor(Math.random() * 30);
    pathAgent.y = Math.floor(Math.random() * 30);

    // Request path to random destination
    pathAgent.requestPathTo(
        70 + Math.floor(Math.random() * 20),
        70 + Math.floor(Math.random() * 20)
    );

    pathAgent.onPathComplete = (found) => {
        console.log(`Agent${i} pathfinding ${found ? 'succeeded' : 'failed'}`);
    };
}

// In game loop, scene automatically calls PathfindingSystem to process all agents
```

### Custom System Example

For more control, you can create a custom system:

```typescript
class CustomPathfindingSystem extends EntitySystem {
    private pathfinder: IncrementalAStarPathfinder;

    constructor(grid: GridMap) {
        super(Matcher.all(PathfindingAgentComponent));
        this.pathfinder = createIncrementalAStarPathfinder(grid);
    }

    protected process(entities: readonly Entity[]) {
        const budget = 2000;
        const iterPerEntity = Math.floor(budget / entities.length);

        for (const entity of entities) {
            const agent = entity.getComponent(PathfindingAgentComponent);
            if (!agent || !agent.currentRequestId) continue;

            const progress = this.pathfinder.step(agent.currentRequestId, iterPerEntity);

            if (progress.state === PathfindingState.Completed) {
                agent.path = this.pathfinder.getResult(agent.currentRequestId)?.path ?? [];
                this.pathfinder.cleanup(agent.currentRequestId);
                agent.currentRequestId = -1;
            }
        }
    }
}
```

## Dynamic Replanning

### Obstacle Change Notification

```typescript
const pathfinder = createIncrementalAStarPathfinder(grid);

// Create pathfinding request
const request = pathfinder.requestPath(0, 0, 99, 99);
pathfinder.step(request.id, 500);

// Dynamically add obstacle
grid.setWalkable(50, 50, false);

// Notify pathfinder of obstacle change region
pathfinder.notifyObstacleChange(45, 45, 55, 55);

// Continue execution - check if request is affected
if (pathfinder.isAffectedByChange(request.id)) {
    console.log('Path may be affected by obstacle change');
    // Can choose to cancel and re-request, or continue
    pathfinder.clearChangeFlag(request.id); // Clear the flag
}
```

### Path Validator

```typescript
import { createPathValidator } from '@esengine/pathfinding';

const validator = createPathValidator(grid);

// Validate existing path
const path = result.path;
const validation = validator.validate(path);

if (!validation.valid) {
    console.log('Path blocked at index:', validation.blockedIndex);
    console.log('Blocked point:', validation.blockedPoint);
    // Need to re-pathfind
}
```

## Path Caching

Enable caching to significantly improve repeated query performance:

```typescript
const pathfinder = createIncrementalAStarPathfinder(grid, {
    enableCache: true,
    cacheConfig: {
        maxEntries: 1000,  // Max cache entries
        ttlMs: 60000,      // TTL 60 seconds
    }
});

// First request - actual computation
const req1 = pathfinder.requestPath(0, 0, 99, 99);
pathfinder.step(req1.id, 10000);

// Second identical request - returns from cache
const req2 = pathfinder.requestPath(0, 0, 99, 99);
pathfinder.step(req2.id, 10000); // Completes immediately

// View cache statistics
const stats = pathfinder.getCacheStats();
console.log('Hit rate:', (stats.hitRate * 100).toFixed(1) + '%');
```

## Configuration Options

```typescript
interface IIncrementalPathfinderConfig {
    maxNodes?: number;        // Max search nodes, default 10000
    heuristicWeight?: number; // Heuristic weight, default 1.0
    enableCache?: boolean;    // Enable caching, default false
    cacheConfig?: IPathCacheConfig; // Cache configuration
}

const pathfinder = createIncrementalAStarPathfinder(grid, {
    maxNodes: 50000,
    heuristicWeight: 1.2,
    enableCache: true,
    cacheConfig: {
        maxEntries: 500,
        ttlMs: 30000
    }
});
```

## Performance Tuning

### Iteration Count Selection

| Scenario | Suggested Iterations/Frame | Notes |
|----------|---------------------------|-------|
| Single agent | 500-2000 | Complete in 1-2 frames |
| 10 agents | 2000 total | ~200 each |
| 100 agents | 2000-5000 total | ~20-50 each |
| 1000 agents | 5000-10000 total | Batch processing |

### Frame Time Budget

```typescript
class AdaptivePathfinding {
    private targetFrameTime = 2; // Target 2ms per frame
    private iterationsPerStep = 100;

    step(requestId: number) {
        const start = performance.now();
        this.pathfinder.step(requestId, this.iterationsPerStep);
        const elapsed = performance.now() - start;

        // Adaptive iteration adjustment
        if (elapsed < this.targetFrameTime * 0.8) {
            this.iterationsPerStep = Math.min(1000, this.iterationsPerStep + 10);
        } else if (elapsed > this.targetFrameTime) {
            this.iterationsPerStep = Math.max(10, this.iterationsPerStep - 20);
        }
    }
}
```

## Complete Example

### Agent Movement in Games

```typescript
class Agent {
    x: number;
    y: number;
    path: IPoint[] = [];
    pathIndex = 0;
    requestId?: number;

    private pathfinder: IncrementalAStarPathfinder;

    moveTo(targetX: number, targetY: number) {
        // Cancel previous request
        if (this.requestId !== undefined) {
            this.pathfinder.cancel(this.requestId);
            this.pathfinder.cleanup(this.requestId);
        }

        // Request new path
        const request = this.pathfinder.requestPath(
            Math.floor(this.x),
            Math.floor(this.y),
            targetX,
            targetY
        );
        this.requestId = request.id;
        this.pathIndex = 0;
    }

    update(dt: number) {
        // Handle pathfinding
        if (this.requestId !== undefined) {
            const progress = this.pathfinder.step(this.requestId, 100);

            if (progress.state === PathfindingState.Completed) {
                const result = this.pathfinder.getResult(this.requestId);
                this.path = result?.path ?? [];
                this.pathfinder.cleanup(this.requestId);
                this.requestId = undefined;
            }
        }

        // Move along path
        if (this.path.length > 0 && this.pathIndex < this.path.length) {
            const target = this.path[this.pathIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.1) {
                this.pathIndex++;
            } else {
                const speed = 5 * dt;
                this.x += (dx / dist) * speed;
                this.y += (dy / dist) * speed;
            }
        }
    }
}
```

## Related Documentation

- [Advanced Algorithms](./advanced-algorithms) - GridPathfinder, JPS, HPA*
- [Grid Map API](./grid-map) - GridMap operations
- [Examples](./examples) - More usage examples
