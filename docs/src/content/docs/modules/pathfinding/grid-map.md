---
title: "网格地图 API"
description: "网格操作和 A* 寻路"
---

## createGridMap

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

## 地图操作

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

## A* 寻路器

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

## 方向常量

```typescript
import { DIRECTIONS_4, DIRECTIONS_8 } from '@esengine/pathfinding';

// 4方向（上下左右）
DIRECTIONS_4 // [{ dx: 0, dy: -1 }, { dx: 1, dy: 0 }, ...]

// 8方向（含对角线）
DIRECTIONS_8 // [{ dx: 0, dy: -1 }, { dx: 1, dy: -1 }, ...]
```

## 启发式函数

```typescript
import { manhattanDistance, octileDistance } from '@esengine/pathfinding';

// 自定义启发式
const grid = createGridMap(20, 20, {
    heuristic: manhattanDistance // 使用曼哈顿距离
});
```

## 路径规划器适配器

当与 `NavigationSystem` 集成时，使用路径规划器适配器工厂函数：

### createAStarPlanner

```typescript
import { createAStarPlanner } from '@esengine/pathfinding/ecs';

const planner = createAStarPlanner(
    gridMap,           // 网格地图
    pathfindingOptions, // 寻路选项（可选）
    { cellSize: 20 }   // 适配器配置
);

navSystem.setPathPlanner(planner);
```

### createJPSPlanner

JPS（Jump Point Search）适用于均匀代价的网格地图，比 A* 快 10-100 倍：

```typescript
import { createJPSPlanner } from '@esengine/pathfinding/ecs';

const planner = createJPSPlanner(gridMap, undefined, { cellSize: 20 });
```

### createHPAPlanner

HPA*（Hierarchical Pathfinding A*）适用于超大地图（1000x1000+）：

```typescript
import { createHPAPlanner } from '@esengine/pathfinding/ecs';

const planner = createHPAPlanner(
    gridMap,
    { clusterSize: 16 },  // HPA* 配置
    undefined,
    { cellSize: 20 }      // 适配器配置
);
```

### cellSize 坐标转换

`cellSize` 参数用于像素坐标与网格坐标之间的转换：

```typescript
// 假设游戏世界 600x400 像素，网格 30x20 单元格
// 每个单元格 20x20 像素
const gridMap = createGridMap(30, 20);
const planner = createAStarPlanner(gridMap, undefined, { cellSize: 20 });

// 可以直接使用像素坐标
// 输入 (480, 300) → 转换为网格 (24, 15) → 输出像素 (490, 310)
const result = planner.findPath(
    { x: 50, y: 50 },    // 起点（像素）
    { x: 480, y: 300 }   // 终点（像素）
);

// 返回的路径点也是像素坐标（单元格中心）
console.log(result.path);
// [{ x: 30, y: 30 }, { x: 50, y: 50 }, ..., { x: 490, y: 310 }]
```

**转换规则**：
- 像素 → 网格：`Math.floor(pixel / cellSize)`
- 网格 → 像素：
  - 当 `cellSize > 1` 时：`grid * cellSize + cellSize * 0.5`（返回单元格中心）
  - 当 `cellSize = 1` 时：`grid`（直接返回网格坐标，无偏移）

**alignToCenter 选项**：

可以通过 `alignToCenter` 显式控制是否返回单元格中心：

```typescript
// 禁用中心对齐（返回单元格左上角）
const planner = createAStarPlanner(gridMap, undefined, {
    cellSize: 20,
    alignToCenter: false
});
```

**不设置 cellSize（默认值 1）**：
- 输入坐标直接作为网格索引使用
- 输出坐标也是整数网格坐标（无 0.5 偏移）
- 适用于游戏逻辑已经使用网格坐标的情况
