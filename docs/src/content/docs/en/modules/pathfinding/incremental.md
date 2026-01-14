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

### ECS Integration Example

> **Note**: ECS components and systems should be imported from `@esengine/pathfinding/ecs`.
>
> ```typescript
> import { PathfindingAgentComponent, PathfindingSystem } from '@esengine/pathfinding/ecs';
> ```

```typescript
class PathfindingSystem extends EntitySystem {
    private pathfinder: IncrementalAStarPathfinder;

    constructor(grid: GridMap) {
        super();
        this.pathfinder = createIncrementalAStarPathfinder(grid);
    }

    protected getMatcher() {
        return Matcher.allOf(PathfindingAgent, Transform);
    }

    protected process(entities: readonly Entity[]) {
        const budget = 2000;
        const iterPerEntity = Math.floor(budget / entities.length);

        for (const entity of entities) {
            const agent = entity.get(PathfindingAgent);
            if (!agent.requestId) continue;

            const progress = this.pathfinder.step(agent.requestId, iterPerEntity);

            if (progress.state === PathfindingState.Completed) {
                agent.path = this.pathfinder.getResult(agent.requestId)?.path ?? [];
                this.pathfinder.cleanup(agent.requestId);
                agent.requestId = undefined;
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
