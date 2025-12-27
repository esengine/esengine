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
