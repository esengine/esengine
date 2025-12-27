---
title: "实际示例"
description: "游戏移动、动态障碍物、分层寻路"
---

## 游戏角色移动

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

        // 平滑路径
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

## 动态障碍物

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

## 不同地形代价

```typescript
// 设置不同地形的移动代价
const grid = createGridMap(50, 50);

// 普通地面 - 代价 1（默认）
// 沙地 - 代价 2
for (let y = 10; y < 20; y++) {
    for (let x = 0; x < 50; x++) {
        grid.setCost(x, y, 2);
    }
}

// 沼泽 - 代价 4
for (let y = 30; y < 35; y++) {
    for (let x = 20; x < 30; x++) {
        grid.setCost(x, y, 4);
    }
}

// 寻路时会自动考虑地形代价
const result = pathfinder.findPath(0, 0, 49, 49);
```

## 分层寻路

对于大型地图，使用层级化寻路：

```typescript
class HierarchicalPathfinding {
    private coarseGrid: GridMap;  // 粗粒度网格
    private fineGrid: GridMap;    // 细粒度网格
    private coarsePathfinder: AStarPathfinder;
    private finePathfinder: AStarPathfinder;
    private cellSize = 10;

    findPath(from: IPoint, to: IPoint): IPoint[] {
        // 1. 在粗粒度网格上寻路
        const coarseFrom = this.toCoarse(from);
        const coarseTo = this.toCoarse(to);
        const coarseResult = this.coarsePathfinder.findPath(
            coarseFrom.x, coarseFrom.y,
            coarseTo.x, coarseTo.y
        );

        if (!coarseResult.found) {
            return [];
        }

        // 2. 在每个粗粒度单元内进行细粒度寻路
        const finePath: IPoint[] = [];
        // ... 详细实现略
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

## 性能优化

1. **限制搜索范围**
   ```typescript
   pathfinder.findPath(x1, y1, x2, y2, { maxNodes: 1000 });
   ```

2. **使用启发式权重**
   ```typescript
   // 权重 > 1 会更快但可能不是最优路径
   pathfinder.findPath(x1, y1, x2, y2, { heuristicWeight: 1.5 });
   ```

3. **复用寻路器实例**
   ```typescript
   // 创建一次，多次使用
   const pathfinder = createAStarPathfinder(grid);
   ```

4. **使用导航网格**
   - 对于复杂地形，NavMesh 比网格寻路更高效
   - 多边形数量远少于网格单元格数量

5. **选择合适的启发式**
   - 4方向移动用 `manhattanDistance`
   - 8方向移动用 `octileDistance`（默认）
