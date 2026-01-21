---
title: "局部避让 (ORCA)"
description: "多代理碰撞避让算法，用于处理运行时的动态障碍物避让"
---

## 概述

局部避让系统基于 **ORCA (Optimal Reciprocal Collision Avoidance)** 算法实现，用于解决多个移动代理（如怪物、NPC）之间的实时碰撞避让问题。

ORCA 是 RVO (Reciprocal Velocity Obstacles) 的改进版本，被广泛应用于游戏和仿真领域。

### 特性

- 高效的多代理碰撞避让
- 支持静态和动态障碍物
- 基于 KD-Tree 的空间索引加速邻居查询
- 与 NavigationSystem 无缝集成
- 可配置的避让参数

## 与 NavigationSystem 集成（推荐）

通过 `NavigationSystem` 的可插拔架构使用 ORCA 避让：

### 1. 创建导航系统

```typescript
import {
    NavigationSystem,
    NavigationAgentComponent,
    ORCAConfigComponent,  // 可选：用于自定义每个代理的 ORCA 参数
    createNavMeshPathPlanner,
    createORCAAvoidance,
    createDefaultCollisionResolver
} from '@esengine/pathfinding/ecs';

// 创建可插拔的导航系统
const navSystem = new NavigationSystem({
    enablePathPlanning: true,
    enableLocalAvoidance: true,      // 启用 ORCA 避让
    enableCollisionResolution: true
});

// 设置寻路器
navSystem.setPathPlanner(createNavMeshPathPlanner(navMesh));

// 设置 ORCA 局部避让
navSystem.setLocalAvoidance(createORCAAvoidance({
    defaultTimeHorizon: 2.0,
    defaultTimeHorizonObst: 1.0,
    timeStep: 1/60
}));

// 设置碰撞解决器
navSystem.setCollisionResolver(createDefaultCollisionResolver());

scene.addSystem(navSystem);
```

### 2. 创建导航代理

```typescript
// 为每个需要避让的实体添加组件
const agentEntity = scene.createEntity('Agent');
const agent = agentEntity.addComponent(new NavigationAgentComponent());

// 核心导航参数
agent.radius = 0.5;           // 代理半径
agent.maxSpeed = 5;           // 最大速度

// 可选：添加 ORCA 配置组件自定义避让参数
const orcaConfig = agentEntity.addComponent(new ORCAConfigComponent());
orcaConfig.neighborDist = 10;      // 邻居搜索距离
orcaConfig.maxNeighbors = 10;      // 最大邻居数量
orcaConfig.timeHorizon = 2;        // 时间视野（代理）
orcaConfig.timeHorizonObst = 1;    // 时间视野（障碍物）

// 设置目标位置
agent.setDestination(100, 100);
```

### 3. 添加障碍物

```typescript
import { Polygon } from '@esengine/ecs-framework-math';

// 静态障碍物（路径规划器绕开）
navSystem.addStaticObstacle({
    vertices: Polygon.ensureCCW([
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 },
        { x: 100, y: 200 }
    ], true)  // Canvas 坐标系用 true
});

// 动态障碍物（ORCA 实时避让）
navSystem.addDynamicObstacle({
    vertices: [{ x: 300, y: 100 }, { x: 350, y: 100 }, { x: 350, y: 150 }, { x: 300, y: 150 }]
});

// 清除所有动态障碍物
navSystem.clearDynamicObstacles();
```

## 直接使用 ORCA 求解器

如果不使用 ECS 系统，可以直接使用 ORCA 求解器：

```typescript
import {
    createORCASolver,
    createKDTree,
    type IAvoidanceAgent,
    type IObstacle
} from '@esengine/pathfinding';
import { Polygon } from '@esengine/ecs-framework-math';

// 创建求解器和空间索引
const solver = createORCASolver({
    defaultTimeHorizon: 2,
    defaultTimeHorizonObst: 1,
    timeStep: 1/60
});

const kdTree = createKDTree();

// 定义代理数据
const agents: IAvoidanceAgent[] = [
    {
        id: 1,
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 0 },
        preferredVelocity: { x: 1, y: 0 },
        radius: 0.5,
        maxSpeed: 5,
        neighborDist: 10,
        maxNeighbors: 10,
        timeHorizon: 2,
        timeHorizonObst: 1
    },
    // ... 更多代理
];

// 定义障碍物（顶点必须按 CCW 顺序）
const obstacles: IObstacle[] = [
    {
        // 使用 Polygon.ensureCCW 确保正确的顶点顺序
        // Y 轴向上坐标系用 false，Y 轴向下（如 Canvas）用 true
        vertices: Polygon.ensureCCW([
            { x: 100, y: 100 },
            { x: 200, y: 100 },
            { x: 200, y: 200 },
            { x: 100, y: 200 }
        ], false)
    }
];

// 构建 KD-Tree
kdTree.build(agents);

// 为每个代理计算新速度
for (const agent of agents) {
    // 查询邻居（返回 INeighborResult[]）
    const neighborResults = kdTree.queryNeighbors(
        agent.position,
        agent.neighborDist,
        agent.maxNeighbors,
        agent.id
    );

    // 提取邻居代理
    const neighborAgents = neighborResults.map(r => r.agent);

    // 计算新速度
    const newVelocity = solver.computeNewVelocity(
        agent,
        neighborAgents,
        obstacles,
        deltaTime
    );

    // 应用新速度
    agent.velocity = newVelocity;
}
```

## 配置参数说明

### 代理参数 (NavigationAgentComponent)

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `radius` | 0.5 | 代理碰撞半径 |
| `maxSpeed` | 5.0 | 最大移动速度 |
| `enabled` | true | 是否启用导航 |

### ORCA 参数 (ORCAConfigComponent)

可选组件，用于自定义每个代理的 ORCA 避让参数：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `neighborDist` | 15.0 | 邻居搜索距离 |
| `maxNeighbors` | 10 | 最大邻居数量 |
| `timeHorizon` | 2.0 | 对其他代理的预测时间 |
| `timeHorizonObst` | 1.0 | 对障碍物的预测时间 |

### 求解器配置 (IORCASolverConfig)

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `defaultTimeHorizon` | 2.0 | 默认代理时间视野 |
| `defaultTimeHorizonObst` | 1.0 | 默认障碍物时间视野 |
| `timeStep` | 1/60 | 仿真时间步长 |
| `epsilon` | 0.00001 | 数值精度阈值 |
| `yAxisDown` | false | 是否使用 Y 轴向下坐标系（如 Canvas） |

## ORCA 算法原理

ORCA 基于"速度障碍"概念：

1. **速度障碍 (Velocity Obstacle)**：给定两个代理，速度障碍是会导致碰撞的所有速度集合

2. **ORCA 约束线**：对于每对代理，计算一条半平面约束线，使双方各承担一半避让责任

3. **线性规划**：在所有约束线的可行区域内，找到最接近期望速度的新速度

```
    期望速度 ●
             \
              \  ORCA 约束线
    ═══════════╳═════════════
              /
             ●  最优新速度
```

## 流量控制器

当多个代理在狭窄区域（如走廊、门口）相遇时，ORCA 可能无法找到可行的速度解。流量控制器通过排队机制解决这一问题：

### 为什么需要流量控制器？

在以下场景中，ORCA 算法可能会产生不理想的行为：

- **狭窄通道**：多个代理试图同时通过，ORCA 约束过多导致无可行解
- **交叉路口**：代理相向而行，可能出现"死锁"或反复抖动
- **门口拥堵**：大量代理聚集在入口处，互相阻挡

流量控制器通过检测拥堵区域并管理通行顺序来解决这些问题。

### 基本用法

```typescript
import {
    NavigationSystem,
    createFlowController,
    PassPermission
} from '@esengine/pathfinding/ecs';

// 创建导航系统
const navSystem = new NavigationSystem({
    enableFlowControl: true  // 启用流量控制
});

// 创建流量控制器
const flowController = createFlowController({
    detectionRadius: 3.0,         // 检测半径：多近的代理算作一组
    minAgentsForCongestion: 3,    // 最小代理数：多少个代理触发拥堵检测
    defaultCapacity: 2,           // 默认容量：同时允许多少代理通过
    waitPointDistance: 1.5        // 等待点距离：排队时的间隔
});

// 设置流量控制器
navSystem.setFlowController(flowController);

// 添加静态拥堵区域（如门口）
const doorZoneId = flowController.addStaticZone(
    { x: 50, y: 50 },  // 中心点
    5.0,               // 半径
    1                  // 容量（一次只允许 1 个代理通过）
);

// 运行时移除
flowController.removeStaticZone(doorZoneId);
```

### 通行权限

流量控制器为每个代理返回三种权限之一：

| 权限 | 说明 | 处理方式 |
|------|------|----------|
| `Proceed` | 正常通行 | 执行 ORCA 避让 |
| `Wait` | 排队等待 | 移动到等待位置并停止 |
| `Yield` | 减速让行 | 降低速度，执行 ORCA |

### 配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `detectionRadius` | 3.0 | 检测半径，决定多近的代理被视为一组 |
| `minAgentsForCongestion` | 3 | 触发拥堵检测的最小代理数 |
| `defaultCapacity` | 2 | 默认区域容量：同时允许通过的代理数 |
| `waitPointDistance` | 1.5 | 等待点距离（到拥堵区域边缘） |
| `yieldSpeedMultiplier` | 0.3 | 让路时的速度倍率 (0-1) |

## NavigationSystem 处理流程

```
1. 路径规划 → 2. 流量控制 → 3. 局部避让 → 4. 碰撞解决
     ↓              ↓              ↓              ↓
  计算路径     检查通行权限    计算避让速度    验证并修正
 (静态障碍)                    (动态障碍)    (所有障碍)
```

**架构说明**：NavigationSystem 将障碍物分为静态和动态两类：
- **静态障碍物**：由路径规划器（A*/NavMesh）处理，计算绕开它们的全局路径
- **动态障碍物**：由 ORCA 处理，实时避让移动中的障碍物

## 性能优化建议

1. **调整 `neighborDist`**：减小搜索距离可以降低邻居查询开销
2. **限制 `maxNeighbors`**：通常 5-10 个邻居就足够了
3. **使用空间分区**：KD-Tree 已内置，确保代理数量较大时自动优化
4. **减少障碍物顶点**：简化静态障碍物的几何形状
5. **启用流量控制**：在狭窄通道场景中使用流量控制器避免 ORCA 无解

## 在线演示

查看 [NavigationSystem 导航演示](/examples/navigation-system-demo/) 体验 ORCA 局部避让与其他导航功能的结合使用。
