---
title: "Grid Map API"
description: "Grid operations and A* pathfinder"
---

## createGridMap

```typescript
function createGridMap(
    width: number,
    height: number,
    options?: IGridMapOptions
): GridMap
```

**Configuration Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `allowDiagonal` | `boolean` | `true` | Allow diagonal movement |
| `diagonalCost` | `number` | `√2` | Diagonal movement cost |
| `avoidCorners` | `boolean` | `true` | Avoid corner cutting |
| `heuristic` | `HeuristicFunction` | `octileDistance` | Heuristic function |

## Map Operations

```typescript
// Check/set walkability
grid.isWalkable(x, y);
grid.setWalkable(x, y, false);

// Set movement cost (e.g., swamp, sand)
grid.setCost(x, y, 2); // Cost of 2 (default 1)

// Set rectangular area
grid.setRectWalkable(0, 0, 5, 5, false);

// Load from array (0=walkable, non-0=obstacle)
grid.loadFromArray([
    [0, 0, 0, 1, 0],
    [0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0]
]);

// Load from string (.=walkable, #=obstacle)
grid.loadFromString(`
.....
.#.#.
.#...
`);

// Export as string
console.log(grid.toString());

// Reset all nodes to walkable
grid.reset();
```

## A* Pathfinder

### createAStarPathfinder

```typescript
function createAStarPathfinder(map: IPathfindingMap): AStarPathfinder
```

### findPath

```typescript
const result = pathfinder.findPath(
    startX, startY,
    endX, endY,
    {
        maxNodes: 5000,       // Limit search nodes
        heuristicWeight: 1.5  // Faster but may not be optimal
    }
);
```

### Reusing Pathfinder

```typescript
// Pathfinder is reusable, clears state automatically
pathfinder.findPath(0, 0, 10, 10);
pathfinder.findPath(5, 5, 15, 15);

// Manual clear (optional)
pathfinder.clear();
```

## Direction Constants

```typescript
import { DIRECTIONS_4, DIRECTIONS_8 } from '@esengine/pathfinding';

// 4 directions (up, down, left, right)
DIRECTIONS_4 // [{ dx: 0, dy: -1 }, { dx: 1, dy: 0 }, ...]

// 8 directions (includes diagonals)
DIRECTIONS_8 // [{ dx: 0, dy: -1 }, { dx: 1, dy: -1 }, ...]
```

## Heuristic Functions

```typescript
import { manhattanDistance, octileDistance } from '@esengine/pathfinding';

// Custom heuristic
const grid = createGridMap(20, 20, {
    heuristic: manhattanDistance // Use Manhattan distance
});
```

## Path Planner Adapters

When integrating with `NavigationSystem`, use path planner adapter factory functions:

### createAStarPlanner

```typescript
import { createAStarPlanner } from '@esengine/pathfinding/ecs';

const planner = createAStarPlanner(
    gridMap,           // Grid map
    pathfindingOptions, // Pathfinding options (optional)
    { cellSize: 20 }   // Adapter config
);

navSystem.setPathPlanner(planner);
```

### createJPSPlanner

JPS (Jump Point Search) is optimized for uniform-cost grids, 10-100x faster than A*:

```typescript
import { createJPSPlanner } from '@esengine/pathfinding/ecs';

const planner = createJPSPlanner(gridMap, undefined, { cellSize: 20 });
```

### createHPAPlanner

HPA* (Hierarchical Pathfinding A*) is optimized for very large maps (1000x1000+):

```typescript
import { createHPAPlanner } from '@esengine/pathfinding/ecs';

const planner = createHPAPlanner(
    gridMap,
    { clusterSize: 16 },  // HPA* config
    undefined,
    { cellSize: 20 }      // Adapter config
);
```

### cellSize Coordinate Conversion

The `cellSize` parameter handles conversion between pixel and grid coordinates:

```typescript
// Assume game world is 600x400 pixels, grid is 30x20 cells
// Each cell is 20x20 pixels
const gridMap = createGridMap(30, 20);
const planner = createAStarPlanner(gridMap, undefined, { cellSize: 20 });

// You can use pixel coordinates directly
// Input (480, 300) → converts to grid (24, 15) → output pixels (490, 310)
const result = planner.findPath(
    { x: 50, y: 50 },    // Start (pixels)
    { x: 480, y: 300 }   // End (pixels)
);

// Returned path points are also pixel coordinates (cell centers)
console.log(result.path);
// [{ x: 30, y: 30 }, { x: 50, y: 50 }, ..., { x: 490, y: 310 }]
```

**Conversion rules**:
- Pixel → Grid: `Math.floor(pixel / cellSize)`
- Grid → Pixel: `grid * cellSize + cellSize * 0.5` (returns cell center)

**Without cellSize (default value 1)**:
- Input coordinates are used directly as grid indices
- Suitable when game logic already uses grid coordinates
