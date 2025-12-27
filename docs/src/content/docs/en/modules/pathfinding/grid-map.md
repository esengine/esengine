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
