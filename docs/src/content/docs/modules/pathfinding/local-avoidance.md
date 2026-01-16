---
title: "局部避让 (ORCA)"
description: "多代理碰撞避让算法，用于处理运行时的动态障碍物避让"
---

## 概述

局部避让系统基于 **ORCA (Optimal Reciprocal Collision Avoidance)** 算法实现，用于解决多个移动代理（如怪物、NPC）之间的实时碰撞避让问题。

ORCA 是 RVO (Reciprocal Velocity Obstacles) 的改进版本，被广泛应用于游戏和仿真领域。

### 特性

- 高效的多代理碰撞避让
- 支持静态障碍物
- 基于 KD-Tree 的空间索引加速邻居查询
- 与 ECS 框架无缝集成
- 可配置的避让参数

## 基本用法

### 1. 创建避让世界

```typescript
import { AvoidanceWorldComponent } from '@esengine/pathfinding/ecs';
import { Polygon } from '@esengine/ecs-framework-math';

// 创建场景中的避让世界实体
const worldEntity = scene.createEntity('AvoidanceWorld');
const world = worldEntity.addComponent(new AvoidanceWorldComponent());

// 可选：添加静态障碍物（如墙壁）
// 注意：障碍物顶点必须按逆时针（CCW）顺序排列
world.addRectObstacle(0, 0, 100, 10);  // 矩形障碍物
world.addObstacle({
    // 使用 Polygon.ensureCCW 确保正确顺序
    // Y 轴向下的坐标系（如 Canvas）需要传入 true
    vertices: Polygon.ensureCCW([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
    ], true)  // Canvas 坐标系用 true
});
```

### 2. 创建避让代理

```typescript
import { AvoidanceAgentComponent } from '@esengine/pathfinding/ecs';

// 为每个需要避让的实体添加组件
const agentEntity = scene.createEntity('Agent');
const agent = agentEntity.addComponent(new AvoidanceAgentComponent());

// 配置代理参数
agent.radius = 0.5;           // 代理半径
agent.maxSpeed = 5;           // 最大速度
agent.neighborDist = 10;      // 邻居搜索距离
agent.maxNeighbors = 10;      // 最大邻居数量
agent.timeHorizon = 2;        // 时间视野（代理）
agent.timeHorizonObst = 1;    // 时间视野（障碍物）
```

### 3. 添加系统

```typescript
import { LocalAvoidanceSystem } from '@esengine/pathfinding/ecs';

// 添加局部避让系统
scene.addSystem(new LocalAvoidanceSystem());
```

### 4. 设置期望速度

```typescript
// 每帧更新代理的期望速度（会使用代理当前位置计算方向）
agent.setPreferredVelocityTowards(targetX, targetY);

// 或指定当前位置
agent.setPreferredVelocityTowards(targetX, targetY, currentX, currentY);

// 或直接设置
agent.preferredVelocityX = 3;
agent.preferredVelocityY = 2;

// 其他有用的方法
agent.stop();              // 停止代理
agent.applyNewVelocity();  // 手动应用 ORCA 计算的新速度
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

// KD-Tree 其他方法
kdTree.clear();              // 清空索引
console.log(kdTree.agentCount); // 获取代理数量

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

### 代理参数 (AvoidanceAgentComponent)

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `radius` | 0.5 | 代理碰撞半径 |
| `maxSpeed` | 5.0 | 最大移动速度 |
| `neighborDist` | 15.0 | 邻居搜索距离 |
| `maxNeighbors` | 10 | 最大邻居数量 |
| `timeHorizon` | 2.0 | 对其他代理的预测时间 |
| `timeHorizonObst` | 1.0 | 对障碍物的预测时间 |
| `enabled` | true | 是否启用避让 |
| `autoApplyVelocity` | true | 是否自动应用计算的新速度 |

### 代理方法 (AvoidanceAgentComponent)

| 方法 | 说明 |
|------|------|
| `setPosition(x, y)` | 设置代理位置 |
| `setVelocity(x, y)` | 设置当前速度 |
| `setPreferredVelocity(x, y)` | 设置期望速度 |
| `setPreferredVelocityTowards(targetX, targetY, currentX?, currentY?)` | 设置朝向目标的期望速度 |
| `applyNewVelocity()` | 手动应用 ORCA 计算的新速度 |
| `getNewSpeed()` | 获取新速度的大小（标量） |
| `getCurrentSpeed()` | 获取当前速度的大小（标量） |
| `stop()` | 停止代理（清零所有速度） |
| `reset()` | 重置组件所有状态 |

### 世界参数 (AvoidanceWorldComponent)

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `defaultTimeHorizon` | 2.0 | 默认代理时间视野 |
| `defaultTimeHorizonObst` | 1.0 | 默认障碍物时间视野 |
| `timeStep` | 1/60 | 仿真时间步长 |

### 世界方法 (AvoidanceWorldComponent)

| 方法 | 说明 |
|------|------|
| `addObstacle(obstacle)` | 添加静态障碍物（顶点需 CCW 顺序） |
| `addRectObstacle(x, y, width, height)` | 添加矩形障碍物 |
| `clearObstacles()` | 移除所有障碍物 |
| `resetStats()` | 重置统计信息 |
| `getConfig()` | 获取 ORCA 配置对象 |

### 求解器配置 (IORCASolverConfig)

直接使用 ORCA 求解器时的配置参数：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `defaultTimeHorizon` | 2.0 | 默认代理时间视野 |
| `defaultTimeHorizonObst` | 1.0 | 默认障碍物时间视野 |
| `timeStep` | 1/60 | 仿真时间步长 |
| `epsilon` | 0.00001 | 数值精度阈值 |

## 与寻路系统集成

ORCA 可以与寻路系统配合使用，实现完整的导航方案：

```typescript
import {
    PathfindingAgentComponent,
    PathfindingSystem,
    AvoidanceAgentComponent,
    LocalAvoidanceSystem
} from '@esengine/pathfinding/ecs';

// 同一实体添加两个组件
const entity = scene.createEntity('NavigatingAgent');
entity.addComponent(new PathfindingAgentComponent());
entity.addComponent(new AvoidanceAgentComponent());

// 寻路系统计算路径，局部避让系统处理动态避让
scene.addSystem(new PathfindingSystem());
scene.addSystem(new LocalAvoidanceSystem());
```

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

## 性能优化建议

1. **调整 `neighborDist`**：减小搜索距离可以降低邻居查询开销
2. **限制 `maxNeighbors`**：通常 5-10 个邻居就足够了
3. **使用空间分区**：KD-Tree 已内置，确保代理数量较大时自动优化
4. **减少障碍物顶点**：简化静态障碍物的几何形状

## 统计信息

获取运行时统计信息：

```typescript
const world = entity.getComponent(AvoidanceWorldComponent);

// 获取统计信息
console.log('代理数量:', world.agentCount);
console.log('本帧处理数:', world.agentsProcessedThisFrame);
console.log('计算耗时:', world.computeTimeMs, 'ms');
```

## 在线演示

查看 [ORCA 局部避让交互式演示](/esengine/examples/orca-avoidance-demo/) 体验不同场景和参数配置的效果。
