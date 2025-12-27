---
title: "Examples"
description: "Game movement, dynamic obstacles, hierarchical pathfinding"
---

## Game Character Movement

```typescript
class MovementSystem {
    private grid: GridMap;
    private pathfinder: AStarPathfinder;
    private smoother: CombinedSmoother;

    constructor(width: number, height: number) {
        this.grid = createGridMap(width, height);
        this.pathfinder = createAStarPathfinder(this.grid);
        this.smoother = createCombinedSmoother();
    }

    findPath(from: IPoint, to: IPoint): IPoint[] | null {
        const result = this.pathfinder.findPath(
            from.x, from.y,
            to.x, to.y
        );

        if (!result.found) {
            return null;
        }

        // Smooth path
        return this.smoother.smooth(result.path, this.grid);
    }

    setObstacle(x: number, y: number): void {
        this.grid.setWalkable(x, y, false);
    }

    setTerrain(x: number, y: number, cost: number): void {
        this.grid.setCost(x, y, cost);
    }
}
```

## Dynamic Obstacles

```typescript
class DynamicPathfinding {
    private grid: GridMap;
    private pathfinder: AStarPathfinder;
    private dynamicObstacles: Set<string> = new Set();

    addDynamicObstacle(x: number, y: number): void {
        const key = `${x},${y}`;
        if (!this.dynamicObstacles.has(key)) {
            this.dynamicObstacles.add(key);
            this.grid.setWalkable(x, y, false);
        }
    }

    removeDynamicObstacle(x: number, y: number): void {
        const key = `${x},${y}`;
        if (this.dynamicObstacles.has(key)) {
            this.dynamicObstacles.delete(key);
            this.grid.setWalkable(x, y, true);
        }
    }

    findPath(from: IPoint, to: IPoint): IPathResult {
        return this.pathfinder.findPath(from.x, from.y, to.x, to.y);
    }
}
```

## Different Terrain Costs

```typescript
// Set different terrain movement costs
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

// Pathfinding automatically considers terrain costs
const result = pathfinder.findPath(0, 0, 49, 49);
```

## Hierarchical Pathfinding

For large maps, use hierarchical pathfinding:

```typescript
class HierarchicalPathfinding {
    private coarseGrid: GridMap;  // Coarse grid
    private fineGrid: GridMap;    // Fine grid
    private coarsePathfinder: AStarPathfinder;
    private finePathfinder: AStarPathfinder;
    private cellSize = 10;

    findPath(from: IPoint, to: IPoint): IPoint[] {
        // 1. Pathfind on coarse grid
        const coarseFrom = this.toCoarse(from);
        const coarseTo = this.toCoarse(to);
        const coarseResult = this.coarsePathfinder.findPath(
            coarseFrom.x, coarseFrom.y,
            coarseTo.x, coarseTo.y
        );

        if (!coarseResult.found) {
            return [];
        }

        // 2. Fine pathfind within each coarse cell
        const finePath: IPoint[] = [];
        // ... detailed implementation
        return finePath;
    }

    private toCoarse(p: IPoint): IPoint {
        return {
            x: Math.floor(p.x / this.cellSize),
            y: Math.floor(p.y / this.cellSize)
        };
    }
}
```

## Performance Optimization

1. **Limit Search Range**
   ```typescript
   pathfinder.findPath(x1, y1, x2, y2, { maxNodes: 1000 });
   ```

2. **Use Heuristic Weight**
   ```typescript
   // Weight > 1 is faster but may not be optimal
   pathfinder.findPath(x1, y1, x2, y2, { heuristicWeight: 1.5 });
   ```

3. **Reuse Pathfinder Instance**
   ```typescript
   // Create once, use many times
   const pathfinder = createAStarPathfinder(grid);
   ```

4. **Use Navigation Mesh**
   - For complex terrain, NavMesh is more efficient than grid pathfinding
   - Polygon count is much less than grid cell count

5. **Choose Appropriate Heuristic**
   - 4-direction movement: use `manhattanDistance`
   - 8-direction movement: use `octileDistance` (default)
