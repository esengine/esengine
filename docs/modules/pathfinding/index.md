# 寻路系统 (Pathfinding)

`@esengine/pathfinding` 提供了完整的 2D 寻路解决方案，包括 A* 算法、网格地图、导航网格和路径平滑。

## 安装

```bash
npm install @esengine/pathfinding
```

## 快速开始

### 网格地图寻路

```typescript
import { createGridMap, createAStarPathfinder } from '@esengine/pathfinding';

// 创建 20x20 的网格地图
const grid = createGridMap(20, 20);

// 设置障碍物
grid.setWalkable(5, 5, false);
grid.setWalkable(5, 6, false);
grid.setWalkable(5, 7, false);

// 创建寻路器
const pathfinder = createAStarPathfinder(grid);

// 查找路径
const result = pathfinder.findPath(0, 0, 15, 15);

if (result.found) {
    console.log('找到路径！');
    console.log('路径点:', result.path);
    console.log('总代价:', result.cost);
    console.log('搜索节点数:', result.nodesSearched);
}
```

### 导航网格寻路

```typescript
import { createNavMesh } from '@esengine/pathfinding';

// 创建导航网格
const navmesh = createNavMesh();

// 添加多边形区域
navmesh.addPolygon([
    { x: 0, y: 0 }, { x: 10, y: 0 },
    { x: 10, y: 10 }, { x: 0, y: 10 }
]);

navmesh.addPolygon([
    { x: 10, y: 0 }, { x: 20, y: 0 },
    { x: 20, y: 10 }, { x: 10, y: 10 }
]);

// 自动建立连接
navmesh.build();

// 寻路
const result = navmesh.findPath(1, 1, 18, 8);
```

## 核心概念

### IPoint - 坐标点

```typescript
interface IPoint {
    readonly x: number;
    readonly y: number;
}
```

### IPathResult - 寻路结果

```typescript
interface IPathResult {
    readonly found: boolean;       // 是否找到路径
    readonly path: readonly IPoint[]; // 路径点列表
    readonly cost: number;         // 路径总代价
    readonly nodesSearched: number; // 搜索的节点数
}
```

### IPathfindingOptions - 寻路配置

```typescript
interface IPathfindingOptions {
    maxNodes?: number;        // 最大搜索节点数（默认 10000）
    heuristicWeight?: number; // 启发式权重（>1 更快但可能非最优）
    allowDiagonal?: boolean;  // 是否允许对角移动（默认 true）
    avoidCorners?: boolean;   // 是否避免穿角（默认 true）
}
```

## 启发式函数

模块提供了四种启发式函数：

| 函数 | 适用场景 | 说明 |
|------|----------|------|
| `manhattanDistance` | 4方向移动 | 曼哈顿距离，只考虑水平/垂直 |
| `euclideanDistance` | 任意方向 | 欧几里得距离，直线距离 |
| `chebyshevDistance` | 8方向移动 | 切比雪夫距离，对角线代价为 1 |
| `octileDistance` | 8方向移动 | 八角距离，对角线代价为 √2（默认） |

```typescript
import { manhattanDistance, octileDistance } from '@esengine/pathfinding';

// 自定义启发式
const grid = createGridMap(20, 20, {
    heuristic: manhattanDistance // 使用曼哈顿距离
});
```

## 网格地图 API

### createGridMap

```typescript
function createGridMap(
    width: number,
    height: number,
    options?: IGridMapOptions
): GridMap
```

**配置选项：**

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `allowDiagonal` | `boolean` | `true` | 允许对角移动 |
| `diagonalCost` | `number` | `√2` | 对角移动代价 |
| `avoidCorners` | `boolean` | `true` | 避免穿角 |
| `heuristic` | `HeuristicFunction` | `octileDistance` | 启发式函数 |

### 地图操作

```typescript
// 检查/设置可通行性
grid.isWalkable(x, y);
grid.setWalkable(x, y, false);

// 设置移动代价（如沼泽、沙地）
grid.setCost(x, y, 2); // 代价为 2（默认 1）

// 设置矩形区域
grid.setRectWalkable(0, 0, 5, 5, false);

// 从数组加载（0=可通行，非0=障碍）
grid.loadFromArray([
    [0, 0, 0, 1, 0],
    [0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0]
]);

// 从字符串加载（.=可通行，#=障碍）
grid.loadFromString(`
.....
.#.#.
.#...
`);

// 导出为字符串
console.log(grid.toString());

// 重置所有节点为可通行
grid.reset();
```

### 方向常量

```typescript
import { DIRECTIONS_4, DIRECTIONS_8 } from '@esengine/pathfinding';

// 4方向（上下左右）
DIRECTIONS_4 // [{ dx: 0, dy: -1 }, { dx: 1, dy: 0 }, ...]

// 8方向（含对角线）
DIRECTIONS_8 // [{ dx: 0, dy: -1 }, { dx: 1, dy: -1 }, ...]
```

## A* 寻路器 API

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
        maxNodes: 5000,       // 限制搜索节点数
        heuristicWeight: 1.5  // 加速但可能非最优
    }
);
```

### 重用寻路器

```typescript
// 寻路器可重用，内部会自动清理状态
pathfinder.findPath(0, 0, 10, 10);
pathfinder.findPath(5, 5, 15, 15);

// 手动清理（可选）
pathfinder.clear();
```

## 导航网格 API

### createNavMesh

```typescript
function createNavMesh(): NavMesh
```

### 构建导航网格

```typescript
const navmesh = createNavMesh();

// 添加凸多边形
const id1 = navmesh.addPolygon([
    { x: 0, y: 0 }, { x: 10, y: 0 },
    { x: 10, y: 10 }, { x: 0, y: 10 }
]);

const id2 = navmesh.addPolygon([
    { x: 10, y: 0 }, { x: 20, y: 0 },
    { x: 20, y: 10 }, { x: 10, y: 10 }
]);

// 方式1：自动检测共享边并建立连接
navmesh.build();

// 方式2：手动设置连接
navmesh.setConnection(id1, id2, {
    left: { x: 10, y: 0 },
    right: { x: 10, y: 10 }
});
```

### 查询和寻路

```typescript
// 查找包含点的多边形
const polygon = navmesh.findPolygonAt(5, 5);

// 检查位置是否可通行
navmesh.isWalkable(5, 5);

// 寻路（内部使用漏斗算法优化路径）
const result = navmesh.findPath(1, 1, 18, 8);
```

## 路径平滑 API

### 视线简化

移除不必要的中间点：

```typescript
import { createLineOfSightSmoother } from '@esengine/pathfinding';

const smoother = createLineOfSightSmoother();
const smoothedPath = smoother.smooth(result.path, grid);

// 原路径: [(0,0), (1,1), (2,2), (3,3), (4,4)]
// 简化后: [(0,0), (4,4)]
```

### 曲线平滑

使用 Catmull-Rom 样条曲线：

```typescript
import { createCatmullRomSmoother } from '@esengine/pathfinding';

const smoother = createCatmullRomSmoother(
    5,   // segments - 每段插值点数
    0.5  // tension - 张力 (0-1)
);

const curvedPath = smoother.smooth(result.path, grid);
```

### 组合平滑

先简化再曲线平滑：

```typescript
import { createCombinedSmoother } from '@esengine/pathfinding';

const smoother = createCombinedSmoother(5, 0.5);
const finalPath = smoother.smooth(result.path, grid);
```

### 视线检测函数

```typescript
import { bresenhamLineOfSight, raycastLineOfSight } from '@esengine/pathfinding';

// Bresenham 算法（快速，网格对齐）
const hasLOS = bresenhamLineOfSight(x1, y1, x2, y2, grid);

// 射线投射（精确，支持浮点坐标）
const hasLOS = raycastLineOfSight(x1, y1, x2, y2, grid, 0.5);
```

## 实际示例

### 游戏角色移动

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

### 动态障碍物

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

### 不同地形代价

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

### 分层寻路

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

## 蓝图节点

Pathfinding 模块提供了可视化脚本支持的蓝图节点：

- `FindPath` - 查找路径
- `FindPathSmooth` - 查找并平滑路径
- `IsWalkable` - 检查位置是否可通行
- `GetPathLength` - 获取路径点数
- `GetPathDistance` - 获取路径总距离
- `GetPathPoint` - 获取路径上的指定点
- `MoveAlongPath` - 沿路径移动
- `HasLineOfSight` - 检查视线

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

## 网格 vs 导航网格

| 特性 | GridMap | NavMesh |
|------|---------|---------|
| 适用场景 | 规则瓦片地图 | 复杂多边形地形 |
| 内存占用 | 较高 (width × height) | 较低 (多边形数) |
| 精度 | 网格对齐 | 连续坐标 |
| 动态修改 | 容易 | 需要重建 |
| 设置复杂度 | 简单 | 较复杂 |
