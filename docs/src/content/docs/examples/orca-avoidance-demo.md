---
title: "ORCA 局部避让演示"
description: "使用 ECS 架构实现的多代理碰撞避让交互式演示"
---

这是一个展示 ORCA (Optimal Reciprocal Collision Avoidance) 算法的交互式演示，使用 ECS 架构实现。

## 在线演示

<div style="text-align: center; margin: 30px 0;">
  <a href="/esengine/demos/orca-avoidance/index.html" target="_blank" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4); transition: all 0.3s ease;">
    🤖 打开 ORCA 避让演示
  </a>
</div>

> **提示**: 演示将在新窗口中打开。可以尝试不同的场景预设，调整参数观察代理行为变化。

## 演示功能

### 场景预设

| 场景 | 说明 |
|------|------|
| **圆形交换** | 代理从圆周出发，移动到对面位置 |
| **十字路口** | 四组代理从不同方向穿过中心 |
| **漏斗通道** | 大量代理通过狭窄通道 |
| **随机漫游** | 代理随机分布，各自前往随机目标 |

### 可调参数

| 参数 | 说明 | 建议值 |
|------|------|--------|
| 代理数量 | 场景中的代理总数 | 50-100 |
| 代理半径 | 代理的碰撞半径 | 6-12 |
| 最大速度 | 代理的移动速度上限 | 80-150 |
| 邻居距离 | 代理考虑避让的范围 | 60-100 |
| 时间视野 | 预测碰撞的时间范围 | 1.5-3.0 |

## ECS 架构代码

以下是演示中使用的核心 ECS 代码结构：

### 组件定义

```typescript
// 变换组件 - 存储位置
class TransformComponent {
    position = { x: 0, y: 0 };
}

// 避让代理组件 - 存储避让相关数据
class AvoidanceAgentComponent {
    velocity = { x: 0, y: 0 };           // 当前速度
    preferredVelocity = { x: 0, y: 0 };  // 期望速度
    targetPosition = null;                // 目标位置
    radius = 8;                           // 代理半径
    maxSpeed = 100;                       // 最大速度
    neighborDist = 80;                    // 邻居检测距离
    maxNeighbors = 10;                    // 最大邻居数
    timeHorizon = 2;                      // 时间视野

    // 设置朝向目标的期望速度
    setPreferredVelocityTowards(targetX, targetY) {
        const transform = this.entity.getComponent(TransformComponent);
        const dx = targetX - transform.position.x;
        const dy = targetY - transform.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            this.preferredVelocity = {
                x: (dx / dist) * this.maxSpeed,
                y: (dy / dist) * this.maxSpeed
            };
        } else {
            this.preferredVelocity = { x: 0, y: 0 };
        }
    }
}

// 渲染组件
class RenderComponent {
    color = '#00d4ff';
}
```

### 系统定义

```typescript
// 目标跟随系统 - 更新每个代理的期望速度
class TargetFollowSystem {
    update(entities, dt) {
        for (const entity of entities) {
            const avoidance = entity.getComponent(AvoidanceAgentComponent);
            if (!avoidance || !avoidance.targetPosition) continue;

            avoidance.setPreferredVelocityTowards(
                avoidance.targetPosition.x,
                avoidance.targetPosition.y
            );
        }
    }
}

// 局部避让系统 - ORCA 核心
class LocalAvoidanceSystem {
    constructor() {
        this.kdTree = new KDTree();
        this.solver = new ORCASolver();
    }

    update(entities, dt) {
        // 1. 收集所有代理数据
        const agents = [];
        for (const entity of entities) {
            const transform = entity.getComponent(TransformComponent);
            const avoidance = entity.getComponent(AvoidanceAgentComponent);
            if (!transform || !avoidance) continue;

            agents.push({
                id: entity.id,
                entity,
                position: transform.position,
                velocity: avoidance.velocity,
                preferredVelocity: avoidance.preferredVelocity,
                radius: avoidance.radius,
                maxSpeed: avoidance.maxSpeed,
                neighborDist: avoidance.neighborDist,
                maxNeighbors: avoidance.maxNeighbors,
                timeHorizon: avoidance.timeHorizon
            });
        }

        // 2. 构建 KDTree 用于邻居查询
        this.kdTree.build(agents);

        // 3. 为每个代理计算避让速度
        const newVelocities = new Map();
        for (const agent of agents) {
            const neighbors = this.kdTree.queryNeighbors(
                agent.position,
                agent.neighborDist,
                agent.maxNeighbors,
                agent.id
            ).map(r => r.agent);

            const newVel = this.solver.computeNewVelocity(agent, neighbors, []);
            newVelocities.set(agent.entity, newVel);
        }

        // 4. 应用速度并更新位置
        for (const [entity, newVel] of newVelocities) {
            const transform = entity.getComponent(TransformComponent);
            const avoidance = entity.getComponent(AvoidanceAgentComponent);

            avoidance.velocity = newVel;
            transform.position.x += newVel.x * dt;
            transform.position.y += newVel.y * dt;
        }
    }
}
```

### 创建和运行

```typescript
// 创建世界
const world = new World();

// 添加系统（顺序很重要）
world.addSystem(new TargetFollowSystem());
world.addSystem(new LocalAvoidanceSystem());
world.addSystem(new RenderSystem(ctx));

// 创建代理实体
function createAgent(x, y, targetX, targetY) {
    const entity = world.createEntity();
    entity.addComponent(new TransformComponent(x, y));

    const avoidance = entity.addComponent(new AvoidanceAgentComponent());
    avoidance.targetPosition = { x: targetX, y: targetY };

    entity.addComponent(new RenderComponent());
    return entity;
}

// 圆形交换场景
const count = 50;
const radius = 200;
for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const targetX = centerX - Math.cos(angle) * radius;
    const targetY = centerY - Math.sin(angle) * radius;
    createAgent(x, y, targetX, targetY);
}

// 游戏循环
function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    world.update(dt);
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

## 使用实际包

在实际项目中，直接使用 `@esengine/pathfinding` 包：

```typescript
import {
    AvoidanceWorldComponent,
    AvoidanceAgentComponent,
    LocalAvoidanceSystem
} from '@esengine/pathfinding/ecs';

// 场景设置
const worldEntity = scene.createEntity();
const world = worldEntity.addComponent(new AvoidanceWorldComponent());

// 创建代理
const agentEntity = scene.createEntity();
const agent = agentEntity.addComponent(new AvoidanceAgentComponent());
agent.radius = 0.5;
agent.maxSpeed = 5;

// 添加系统
scene.addSystem(new LocalAvoidanceSystem());

// 每帧更新目标
agent.setPreferredVelocityTowards(targetX, targetY);
```

## 相关文档

- [ORCA 局部避让 API](/modules/pathfinding/local-avoidance) - 完整 API 文档
- [寻路系统](/modules/pathfinding) - 寻路模块概述
