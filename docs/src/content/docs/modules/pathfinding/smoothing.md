---
title: "路径平滑"
description: "视线简化和曲线平滑"
---

## 视线简化

移除不必要的中间点：

```typescript
import { createLineOfSightSmoother } from '@esengine/pathfinding';

const smoother = createLineOfSightSmoother();
const smoothedPath = smoother.smooth(result.path, grid);

// 原路径: [(0,0), (1,1), (2,2), (3,3), (4,4)]
// 简化后: [(0,0), (4,4)]
```

## 曲线平滑

使用 Catmull-Rom 样条曲线：

```typescript
import { createCatmullRomSmoother } from '@esengine/pathfinding';

const smoother = createCatmullRomSmoother(
    5,   // segments - 每段插值点数
    0.5  // tension - 张力 (0-1)
);

const curvedPath = smoother.smooth(result.path, grid);
```

## 组合平滑

先简化再曲线平滑：

```typescript
import { createCombinedSmoother } from '@esengine/pathfinding';

const smoother = createCombinedSmoother(5, 0.5);
const finalPath = smoother.smooth(result.path, grid);
```

## 视线检测函数

```typescript
import { bresenhamLineOfSight, raycastLineOfSight } from '@esengine/pathfinding';

// Bresenham 算法（快速，网格对齐）
const hasLOS = bresenhamLineOfSight(x1, y1, x2, y2, grid);

// 射线投射（精确，支持浮点坐标）
const hasLOS = raycastLineOfSight(x1, y1, x2, y2, grid, 0.5);
```

## 蓝图节点

- `FindPath` - 查找路径
- `FindPathSmooth` - 查找并平滑路径
- `IsWalkable` - 检查位置是否可通行
- `GetPathLength` - 获取路径点数
- `GetPathDistance` - 获取路径总距离
- `GetPathPoint` - 获取路径上的指定点
- `MoveAlongPath` - 沿路径移动
- `HasLineOfSight` - 检查视线
