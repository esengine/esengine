---
title: "Path Smoothing"
description: "Line of sight simplification and curve smoothing"
---

## Line of Sight Simplification

Remove unnecessary intermediate points:

```typescript
import { createLineOfSightSmoother } from '@esengine/pathfinding';

const smoother = createLineOfSightSmoother();
const smoothedPath = smoother.smooth(result.path, grid);

// Original path: [(0,0), (1,1), (2,2), (3,3), (4,4)]
// Simplified:    [(0,0), (4,4)]
```

## Curve Smoothing

Using Catmull-Rom splines:

```typescript
import { createCatmullRomSmoother } from '@esengine/pathfinding';

const smoother = createCatmullRomSmoother(
    5,   // segments - interpolation points per segment
    0.5  // tension - (0-1)
);

const curvedPath = smoother.smooth(result.path, grid);
```

## Combined Smoothing

Simplify first, then curve smooth:

```typescript
import { createCombinedSmoother } from '@esengine/pathfinding';

const smoother = createCombinedSmoother(5, 0.5);
const finalPath = smoother.smooth(result.path, grid);
```

## Line of Sight Functions

```typescript
import { bresenhamLineOfSight, raycastLineOfSight } from '@esengine/pathfinding';

// Bresenham algorithm (fast, grid-aligned)
const hasLOS = bresenhamLineOfSight(x1, y1, x2, y2, grid);

// Raycast (precise, supports floating point coordinates)
const hasLOS = raycastLineOfSight(x1, y1, x2, y2, grid, 0.5);
```

## Blueprint Nodes

- `FindPath` - Find path
- `FindPathSmooth` - Find and smooth path
- `IsWalkable` - Check if position is walkable
- `GetPathLength` - Get number of path points
- `GetPathDistance` - Get total path distance
- `GetPathPoint` - Get point at index
- `MoveAlongPath` - Move along path
- `HasLineOfSight` - Check line of sight
