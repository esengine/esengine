---
title: "寻路系统 (Pathfinding)"
description: "完整的 2D 寻路解决方案，支持增量寻路和多种高级算法"
---

`@esengine/pathfinding` 提供了完整的 2D 寻路解决方案，支持多种算法和场景：

- **基础 A\* 算法** - 通用寻路算法
- **GridPathfinder** - 高性能网格寻路器，支持多种模式
- **JPS (Jump Point Search)** - 开放地图加速
- **HPA\* (分层寻路)** - 超大地图优化
- **增量寻路** - 时间切片执行，不阻塞主线程
- **路径缓存** - 重复查询加速

## 安装

```bash
npm install @esengine/pathfinding
```

## 入口点

包提供了三个独立入口点，按需引入：

```typescript
// 核心寻路（无外部依赖，除了 math）
import { AStarPathfinder, GridPathfinder, JPSPathfinder } from '@esengine/pathfinding';

// ECS 组件和系统（需要 @esengine/ecs-framework）
import { PathfindingSystem, PathfindingAgentComponent } from '@esengine/pathfinding/ecs';

// 蓝图节点（需要 @esengine/blueprint）
import { FindPathTemplate, RequestPathAsyncTemplate } from '@esengine/pathfinding/nodes';
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

### 核心接口

```typescript
interface IPoint {
    readonly x: number;
    readonly y: number;
}

interface IPathResult {
    readonly found: boolean;       // 是否找到路径
    readonly path: readonly IPoint[]; // 路径点列表
    readonly cost: number;         // 路径总代价
    readonly nodesSearched: number; // 搜索的节点数
}

interface IPathfindingOptions {
    maxNodes?: number;        // 最大搜索节点数（默认 10000）
    heuristicWeight?: number; // 启发式权重（>1 更快但可能非最优）
    allowDiagonal?: boolean;  // 是否允许对角移动（默认 true）
    avoidCorners?: boolean;   // 是否避免穿角（默认 true）
}
```

### 启发式函数

| 函数 | 适用场景 | 说明 |
|------|----------|------|
| `manhattanDistance` | 4方向移动 | 曼哈顿距离 |
| `euclideanDistance` | 任意方向 | 欧几里得距离 |
| `chebyshevDistance` | 8方向移动 | 切比雪夫距离 |
| `octileDistance` | 8方向移动 | 八角距离（默认） |

### 网格 vs 导航网格

| 特性 | GridMap | NavMesh |
|------|---------|---------|
| 适用场景 | 规则瓦片地图 | 复杂多边形地形 |
| 内存占用 | 较高 (width × height) | 较低 (多边形数) |
| 精度 | 网格对齐 | 连续坐标 |
| 动态修改 | 容易 | 需要重建 |

## 文档导航

- [网格地图 API](./grid-map) - 网格操作和 A* 寻路
- [高级寻路算法](./advanced-algorithms) - GridPathfinder、JPS、HPA* 详解
- [增量寻路](./incremental) - 时间切片和动态重规划
- [导航网格 API](./navmesh) - NavMesh 构建和查询
- [路径平滑](./smoothing) - 视线简化和曲线平滑
- [实际示例](./examples) - 游戏移动、动态障碍物、分层寻路
