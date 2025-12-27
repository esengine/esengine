---
title: "Pathfinding System"
---

`@esengine/pathfinding` provides a complete 2D pathfinding solution including A* algorithm, grid maps, navigation meshes, and path smoothing.

## Installation

```bash
npm install @esengine/pathfinding
```

## Quick Start

### Grid Map Pathfinding

```typescript
import { createGridMap, createAStarPathfinder } from '@esengine/pathfinding';

// Create 20x20 grid
const grid = createGridMap(20, 20);

// Set obstacles
grid.setWalkable(5, 5, false);
grid.setWalkable(5, 6, false);

// Create pathfinder
const pathfinder = createAStarPathfinder(grid);

// Find path
const result = pathfinder.findPath(0, 0, 15, 15);

if (result.found) {
    console.log('Path found!');
    console.log('Path:', result.path);
    console.log('Cost:', result.cost);
}
```

### NavMesh Pathfinding

```typescript
import { createNavMesh } from '@esengine/pathfinding';

const navmesh = createNavMesh();

// Add polygon areas
navmesh.addPolygon([
    { x: 0, y: 0 }, { x: 10, y: 0 },
    { x: 10, y: 10 }, { x: 0, y: 10 }
]);

navmesh.addPolygon([
    { x: 10, y: 0 }, { x: 20, y: 0 },
    { x: 20, y: 10 }, { x: 10, y: 10 }
]);

// Auto-build connections
navmesh.build();

// Find path
const result = navmesh.findPath(1, 1, 18, 8);
```

## Core Concepts

### IPathResult

```typescript
interface IPathResult {
    readonly found: boolean;        // Path found
    readonly path: readonly IPoint[];// Path points
    readonly cost: number;          // Total cost
    readonly nodesSearched: number; // Nodes searched
}
```

### IPathfindingOptions

```typescript
interface IPathfindingOptions {
    maxNodes?: number;        // Max search nodes (default 10000)
    heuristicWeight?: number; // Heuristic weight (>1 faster but may be suboptimal)
    allowDiagonal?: boolean;  // Allow diagonal movement (default true)
    avoidCorners?: boolean;   // Avoid corner cutting (default true)
}
```

## Heuristic Functions

| Function | Use Case | Description |
|----------|----------|-------------|
| `manhattanDistance` | 4-directional | Manhattan distance |
| `euclideanDistance` | Any direction | Euclidean distance |
| `chebyshevDistance` | 8-directional | Diagonal cost = 1 |
| `octileDistance` | 8-directional | Diagonal cost = √2 (default) |

## Grid Map API

### createGridMap

```typescript
function createGridMap(
    width: number,
    height: number,
    options?: IGridMapOptions
): GridMap
```

**Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `allowDiagonal` | `boolean` | `true` | Allow diagonal movement |
| `diagonalCost` | `number` | `√2` | Diagonal movement cost |
| `avoidCorners` | `boolean` | `true` | Avoid corner cutting |
| `heuristic` | `HeuristicFunction` | `octileDistance` | Heuristic function |

### Map Operations

```typescript
// Check/set walkability
grid.isWalkable(x, y);
grid.setWalkable(x, y, false);

// Set movement cost (e.g., swamp, sand)
grid.setCost(x, y, 2);

// Set rectangle region
grid.setRectWalkable(0, 0, 5, 5, false);

// Load from array (0=walkable, non-0=blocked)
grid.loadFromArray([
    [0, 0, 0, 1, 0],
    [0, 1, 0, 1, 0]
]);

// Load from string (.=walkable, #=blocked)
grid.loadFromString(`
.....
.#.#.
`);

// Export and reset
console.log(grid.toString());
grid.reset();
```

## A* Pathfinder API

```typescript
const pathfinder = createAStarPathfinder(grid);

const result = pathfinder.findPath(
    startX, startY,
    endX, endY,
    { maxNodes: 5000, heuristicWeight: 1.5 }
);

// Pathfinder is reusable
pathfinder.findPath(0, 0, 10, 10);
pathfinder.findPath(5, 5, 15, 15);
```

## NavMesh API

```typescript
const navmesh = createNavMesh();

// Add convex polygons
const id1 = navmesh.addPolygon(vertices1);
const id2 = navmesh.addPolygon(vertices2);

// Auto-detect shared edges
navmesh.build();

// Or manually set connections
navmesh.setConnection(id1, id2, {
    left: { x: 10, y: 0 },
    right: { x: 10, y: 10 }
});

// Query and pathfind
const polygon = navmesh.findPolygonAt(5, 5);
navmesh.isWalkable(5, 5);
const result = navmesh.findPath(1, 1, 18, 8);
```

## Path Smoothing

### Line of Sight Smoothing

Remove unnecessary waypoints:

```typescript
import { createLineOfSightSmoother } from '@esengine/pathfinding';

const smoother = createLineOfSightSmoother();
const smoothedPath = smoother.smooth(result.path, grid);
```

### Curve Smoothing

Catmull-Rom spline:

```typescript
import { createCatmullRomSmoother } from '@esengine/pathfinding';

const smoother = createCatmullRomSmoother(5, 0.5);
const curvedPath = smoother.smooth(result.path, grid);
```

### Combined Smoothing

```typescript
import { createCombinedSmoother } from '@esengine/pathfinding';

const smoother = createCombinedSmoother(5, 0.5);
const finalPath = smoother.smooth(result.path, grid);
```

### Line of Sight Functions

```typescript
import { bresenhamLineOfSight, raycastLineOfSight } from '@esengine/pathfinding';

const hasLOS = bresenhamLineOfSight(x1, y1, x2, y2, grid);
const hasLOS2 = raycastLineOfSight(x1, y1, x2, y2, grid, 0.5);
```

## Practical Examples

### Dynamic Obstacles

```typescript
class DynamicPathfinding {
    private grid: GridMap;
    private pathfinder: AStarPathfinder;
    private dynamicObstacles: Set<string> = new Set();

    addDynamicObstacle(x: number, y: number): void {
        this.dynamicObstacles.add(`${x},${y}`);
        this.grid.setWalkable(x, y, false);
    }

    removeDynamicObstacle(x: number, y: number): void {
        this.dynamicObstacles.delete(`${x},${y}`);
        this.grid.setWalkable(x, y, true);
    }
}
```

### Terrain Costs

```typescript
const grid = createGridMap(50, 50);

// Normal ground - cost 1 (default)
// Sand - cost 2
for (let y = 10; y < 20; y++) {
    for (let x = 0; x < 50; x++) {
        grid.setCost(x, y, 2);
    }
}

// Swamp - cost 4
for (let y = 30; y < 35; y++) {
    for (let x = 20; x < 30; x++) {
        grid.setCost(x, y, 4);
    }
}
```

## Blueprint Nodes

- `FindPath` - Find path
- `FindPathSmooth` - Find and smooth path
- `IsWalkable` - Check walkability
- `GetPathLength` - Get path point count
- `GetPathDistance` - Get total path distance
- `GetPathPoint` - Get specific path point
- `MoveAlongPath` - Move along path
- `HasLineOfSight` - Check line of sight

## Performance Tips

1. **Limit search range**: `{ maxNodes: 1000 }`
2. **Use heuristic weight**: `{ heuristicWeight: 1.5 }` (faster but may not be optimal)
3. **Reuse pathfinder instances**
4. **Use NavMesh for complex terrain**
5. **Choose appropriate heuristic for movement type**

## Grid vs NavMesh

| Feature | GridMap | NavMesh |
|---------|---------|---------|
| Use Case | Regular tile maps | Complex polygon terrain |
| Memory | Higher (width × height) | Lower (polygon count) |
| Precision | Grid-aligned | Continuous coordinates |
| Dynamic Updates | Easy | Requires rebuild |
| Setup Complexity | Simple | More complex |
