---
title: "统一导航系统"
description: "将路径规划、局部避让、流量控制和碰撞解决集成在一起的高级导航系统"
---

## 概述

`NavigationSystem` 是一个统一的高级导航系统，将多个导航模块集成在一起：

```
路径规划 → 流量控制 → 局部避让 → 碰撞解决
   ↓          ↓          ↓          ↓
 A*/NavMesh  排队机制    ORCA避让   穿墙修正
```

**主要特性**：
- 可插拔的算法架构（路径规划、避让、碰撞解决）
- 静态/动态障碍物分离处理
- 时间切片寻路（大规模代理场景）
- 流量控制和排队管理

### 核心架构：主次分明

NavigationSystem 采用 **主次分明** 的架构设计：

| 模块 | 角色 | 职责 |
|------|------|------|
| **路径规划器** (A*/NavMesh) | 主导 | 计算绕过 **静态障碍物** 的全局路径 |
| **局部避让** (ORCA) | 辅助 | 处理 **动态障碍物** 和代理间避让 |
| **碰撞解决器** | 保底 | 防止穿墙，处理所有障碍物 |

这种设计确保：
- A*/NavMesh 负责全局路径规划，绕过墙壁、建筑等静态障碍物
- ORCA 只处理移动中的动态障碍物（如其他 NPC、玩家），不会干扰主路径
- 碰撞解决器作为最后防线，确保代理不会穿透任何障碍物

## 快速开始

```typescript
import {
    NavigationSystem,
    NavigationAgentComponent,
    createNavMeshPathPlanner,
    createAStarPlanner,
    createORCAAvoidance,
    createFlowController,
    createDefaultCollisionResolver
} from '@esengine/pathfinding/ecs';

// 创建导航系统
const navSystem = new NavigationSystem({
    enablePathPlanning: true,
    enableLocalAvoidance: true,
    enableFlowControl: false,
    enableCollisionResolution: true
});

// 设置路径规划器（二选一）
// 方式1：NavMesh（适合复杂多边形地形）
navSystem.setPathPlanner(createNavMeshPathPlanner(navMesh));

// 方式2：A*（适合网格地图）
navSystem.setPathPlanner(createAStarPlanner(gridMap, undefined, { cellSize: 20 }));

// 设置局部避让
navSystem.setLocalAvoidance(createORCAAvoidance({
    defaultTimeHorizon: 2.0,
    defaultTimeHorizonObst: 1.0  // 动态障碍物时间视野
}));

// 设置碰撞解决器
navSystem.setCollisionResolver(createDefaultCollisionResolver());

// 添加到场景
scene.addSystem(navSystem);
```

## 静态与动态障碍物

### 障碍物分类

NavigationSystem 将障碍物分为两类：

| 类型 | 示例 | 处理方 | API |
|------|------|--------|-----|
| **静态障碍物** | 墙壁、建筑、地形 | 路径规划器绕开 | `addStaticObstacle()` |
| **动态障碍物** | 移动平台、可破坏物 | ORCA 实时避让 | `addDynamicObstacle()` |

### API 用法

```typescript
// 添加静态障碍物（墙壁）- 路径规划会绕开它
navSystem.addStaticObstacle({
    vertices: [
        { x: 100, y: 50 },
        { x: 200, y: 50 },
        { x: 200, y: 70 },
        { x: 100, y: 70 }
    ]
});

// 添加动态障碍物（移动平台）- ORCA 会实时避让
navSystem.addDynamicObstacle({
    vertices: [
        { x: 300, y: 100 },
        { x: 350, y: 100 },
        { x: 350, y: 150 },
        { x: 300, y: 150 }
    ]
});

// 获取障碍物列表
const staticObs = navSystem.getStaticObstacles();
const dynamicObs = navSystem.getDynamicObstacles();

// 清除障碍物
navSystem.clearStaticObstacles();
navSystem.clearDynamicObstacles();
```

### 架构流程图

```
代理设置目标
     ↓
┌─────────────────────────────────────────────────────────┐
│  路径规划器 (A*/NavMesh)                                │
│  输入：起点、终点、staticObstacles                      │
│  输出：全局路径点列表                                    │
└─────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────┐
│  流量控制器 (可选)                                       │
│  检测拥堵、管理排队                                      │
└─────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────┐
│  局部避让 (ORCA)                                        │
│  输入：期望速度、邻居代理、dynamicObstacles             │
│  输出：安全的新速度                                      │
└─────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────┐
│  碰撞解决器                                              │
│  输入：新位置、staticObstacles + dynamicObstacles       │
│  输出：修正后的最终位置（防止穿墙）                      │
└─────────────────────────────────────────────────────────┘
     ↓
代理移动到新位置
```

## 导航代理组件

每个需要导航的实体都应添加 `NavigationAgentComponent`：

```typescript
const entity = scene.createEntity('Agent');
const nav = entity.addComponent(new NavigationAgentComponent());

// 配置代理参数
nav.radius = 0.5;             // 碰撞半径
nav.maxSpeed = 5.0;           // 最大速度
nav.acceleration = 10.0;      // 加速度
nav.waypointThreshold = 0.5;  // 到达路径点的距离阈值
nav.arrivalThreshold = 0.3;   // 到达目标的距离阈值

// 设置初始位置
nav.setPosition(startX, startY);

// 设置目标
nav.setDestination(targetX, targetY);

// 检查状态
if (nav.hasArrived()) {
    console.log('到达目标！');
}

// 停止导航
nav.stop();
```

### waypointThreshold 参数

`waypointThreshold` 控制代理何时前进到下一个路径点：

```typescript
// 推荐值：代理半径的 2 倍，最小 15
nav.waypointThreshold = Math.max(nav.radius * 2, 15);
```

**设置过大的问题**：
- 代理会过早切换到下一个路径点
- 在拐角处，代理可能瞄准墙后的路径点，导致与 ORCA 避障冲突
- 表现为代理在拐角处反复转向、打转

**设置过小的问题**：
- 代理移动不够平滑
- 可能在路径点处停顿

## 路径规划器适配器

### NavMesh 路径规划器

适用于复杂多边形地形：

```typescript
import { createNavMeshPathPlanner } from '@esengine/pathfinding/ecs';

const planner = createNavMeshPathPlanner(navMesh, {
    agentRadius: 10  // 代理半径，用于路径平滑
});

navSystem.setPathPlanner(planner);
```

### 网格路径规划器

适用于基于网格的地图，支持 A*、JPS、HPA*：

```typescript
import {
    createAStarPlanner,
    createJPSPlanner,
    createHPAPlanner
} from '@esengine/pathfinding/ecs';

// A* 寻路器
const astarPlanner = createAStarPlanner(gridMap, undefined, {
    cellSize: 20  // 网格单元大小（像素）
});

// JPS 寻路器（均匀代价网格，比 A* 快 10-100 倍）
const jpsPlanner = createJPSPlanner(gridMap, undefined, {
    cellSize: 20
});

// HPA* 寻路器（超大地图 1000x1000+）
const hpaPlanner = createHPAPlanner(gridMap, { clusterSize: 16 }, undefined, {
    cellSize: 20
});
```

### cellSize 坐标转换

当你的游戏使用像素坐标而网格使用单元格坐标时，`cellSize` 参数会自动处理转换：

```typescript
// 假设网格是 30x20 单元格，每个单元格 20x20 像素
// 游戏世界大小为 600x400 像素
const gridMap = createGridMap(30, 20);
const planner = createAStarPlanner(gridMap, undefined, { cellSize: 20 });

// 现在可以直接使用像素坐标
// 内部会自动转换：(480, 300) → 网格(24, 15) → 像素(490, 310)
nav.setDestination(480, 300);
```

**转换规则**：
- 像素 → 网格：`Math.floor(pixel / cellSize)`
- 网格 → 像素：`grid * cellSize + cellSize * 0.5`（返回单元格中心）

### 时间切片寻路（大规模代理）

对于大规模代理场景（100+），可以使用增量寻路器将计算分散到多帧：

```typescript
import {
    NavigationSystem,
    createIncrementalAStarPlanner
} from '@esengine/pathfinding/ecs';
import { createGridMap } from '@esengine/pathfinding';

const gridMap = createGridMap(200, 200);

// 创建增量寻路器
const planner = createIncrementalAStarPlanner(gridMap, undefined, {
    cellSize: 20
});

// 启用时间切片
const navSystem = new NavigationSystem({
    enableTimeSlicing: true,     // 启用时间切片
    iterationsBudget: 1000,      // 每帧总迭代预算
    maxAgentsPerFrame: 10,       // 每帧最大处理代理数
    maxIterationsPerAgent: 200   // 每代理每帧最大迭代数
});

navSystem.setPathPlanner(planner);
```

**工作原理**：
- 系统自动检测 `IIncrementalPathPlanner` 并启用增量模式
- 每帧按优先级分配迭代预算给各代理
- 寻路计算分散到多帧，避免卡顿
- 代理可通过 `priority` 属性设置优先级（数字越小越优先）

**代理优先级**：

```typescript
const nav = entity.addComponent(new NavigationAgentComponent());
nav.priority = 10;  // 高优先级，优先分配迭代预算

// 检查寻路状态
if (nav.isComputingPath) {
    console.log(`寻路进度: ${(nav.pathProgress * 100).toFixed(0)}%`);
}
```

## 完整示例

```typescript
import { Scene } from '@esengine/ecs-framework';
import {
    NavigationSystem,
    NavigationAgentComponent,
    createAStarPlanner,
    createORCAAvoidance,
    createDefaultCollisionResolver
} from '@esengine/pathfinding/ecs';
import { createGridMap } from '@esengine/pathfinding';

// 创建场景
const scene = new Scene();

// 创建网格地图
const gridMap = createGridMap(30, 20);
gridMap.setRectWalkable(10, 5, 5, 10, false);  // 添加障碍区域

// 创建导航系统
const navSystem = new NavigationSystem({
    enablePathPlanning: true,
    enableLocalAvoidance: true,
    enableCollisionResolution: true
});

// 配置模块
navSystem.setPathPlanner(createAStarPlanner(gridMap, undefined, { cellSize: 20 }));
navSystem.setLocalAvoidance(createORCAAvoidance());
navSystem.setCollisionResolver(createDefaultCollisionResolver());

// 添加静态障碍物（墙壁）
navSystem.addStaticObstacle({
    vertices: [
        { x: 200, y: 100 },
        { x: 300, y: 100 },
        { x: 300, y: 300 },
        { x: 200, y: 300 }
    ]
});

scene.addSystem(navSystem);

// 创建代理
for (let i = 0; i < 10; i++) {
    const entity = scene.createEntity(`Agent-${i}`);
    const nav = entity.addComponent(new NavigationAgentComponent());

    // 设置初始位置
    nav.setPosition(50 + Math.random() * 100, 150 + Math.random() * 100);
    nav.radius = 0.5;
    nav.maxSpeed = 5.0;
    nav.waypointThreshold = 0.5;

    // 设置目标（另一侧）
    nav.setDestination(500, 200);
}
```

## API 参考

### NavigationSystem 构造选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enablePathPlanning` | `boolean` | `true` | 启用路径规划 |
| `enableLocalAvoidance` | `boolean` | `true` | 启用局部避让 |
| `enableFlowControl` | `boolean` | `true` | 启用流量控制 |
| `enableCollisionResolution` | `boolean` | `true` | 启用碰撞解决 |
| `enableTimeSlicing` | `boolean` | `false` | 启用时间切片寻路 |
| `iterationsBudget` | `number` | `1000` | 每帧总迭代预算 |
| `maxAgentsPerFrame` | `number` | `10` | 每帧最大处理代理数 |
| `maxIterationsPerAgent` | `number` | `200` | 每代理每帧最大迭代数 |

### NavigationSystem 方法

| 方法 | 说明 |
|------|------|
| `setPathPlanner(planner)` | 设置路径规划器 |
| `getPathPlanner()` | 获取当前路径规划器 |
| `setLocalAvoidance(avoidance)` | 设置局部避让模块 |
| `getLocalAvoidance()` | 获取当前局部避让模块 |
| `setFlowController(controller)` | 设置流量控制器 |
| `getFlowController()` | 获取当前流量控制器 |
| `setCollisionResolver(resolver)` | 设置碰撞解决器 |
| `getCollisionResolver()` | 获取当前碰撞解决器 |
| `addStaticObstacle(obstacle)` | 添加静态障碍物 |
| `addDynamicObstacle(obstacle)` | 添加动态障碍物 |
| `clearStaticObstacles()` | 清除所有静态障碍物 |
| `clearDynamicObstacles()` | 清除所有动态障碍物 |
| `clearObstacles()` | 清除所有障碍物（静态和动态）|
| `getStaticObstacles()` | 获取静态障碍物列表 |
| `getDynamicObstacles()` | 获取动态障碍物列表 |

### NavigationAgentComponent 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `IVector2` | `{x:0,y:0}` | 当前位置 |
| `velocity` | `IVector2` | `{x:0,y:0}` | 当前速度 |
| `radius` | `number` | `0.5` | 碰撞半径 |
| `maxSpeed` | `number` | `5.0` | 最大速度 |
| `acceleration` | `number` | `10.0` | 加速度 |
| `waypointThreshold` | `number` | `0.5` | 路径点到达阈值 |
| `arrivalThreshold` | `number` | `0.3` | 目标到达阈值 |
| `repathInterval` | `number` | `0.5` | 路径重计算间隔(秒) |
| `enabled` | `boolean` | `true` | 是否启用导航 |
| `autoRepath` | `boolean` | `true` | 是否自动重新计算被阻挡的路径 |
| `smoothSteering` | `boolean` | `true` | 是否启用平滑转向 |
| `priority` | `number` | `50` | 优先级（数字越小越优先）|
| `isComputingPath` | `boolean` | `false` | 是否正在计算路径 |
| `pathProgress` | `number` | `0` | 寻路进度 (0-1) |

### NavigationAgentComponent 方法

| 方法 | 说明 |
|------|------|
| `setPosition(x, y)` | 设置当前位置 |
| `setDestination(x, y)` | 设置目标位置 |
| `stop()` | 停止导航 |
| `hasArrived()` | 是否到达目标 |
| `isBlocked()` | 路径是否被阻挡 |
| `isUnreachable()` | 目标是否无法到达 |
| `getCurrentWaypoint()` | 获取当前路径点 |
| `getDistanceToDestination()` | 获取到目标的距离 |
| `getCurrentSpeed()` | 获取当前速度大小 |

## 调试技巧

### 可视化路径

```typescript
// 在渲染循环中绘制路径
if (nav.path.length > 0) {
    ctx.beginPath();
    ctx.moveTo(nav.path[0].x, nav.path[0].y);
    for (let i = 1; i < nav.path.length; i++) {
        ctx.lineTo(nav.path[i].x, nav.path[i].y);
    }
    ctx.strokeStyle = 'blue';
    ctx.stroke();
}
```

### 常见问题排查

**问题：代理在拐角处打转**
- 检查 `waypointThreshold` 是否过大
- 推荐值：`Math.max(radius * 2, 15)`

**问题：代理无法到达目标**
- 检查目标位置是否在可行走区域
- 检查静态障碍物是否正确设置
- 使用 `planner.isWalkable(x, y)` 验证

**问题：代理穿透障碍物**
- 确保 `enableCollisionResolution: true`
- 检查障碍物顶点顺序（应为逆时针 CCW）
- 使用 `Polygon.ensureCCW()` 自动修正

## 在线演示

查看 [导航系统交互式演示](/examples/navigation-system-demo/) 体验完整功能。
