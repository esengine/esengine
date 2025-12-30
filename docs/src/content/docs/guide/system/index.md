---
title: "系统架构"
description: "ECS 系统概述与基本概念"
---

在 ECS 架构中，系统（System）是处理业务逻辑的地方。系统负责对拥有特定组件组合的实体执行操作，是 ECS 架构的逻辑处理单元。

## 基本概念

系统是继承自 `EntitySystem` 抽象基类的具体类，用于：
- 定义实体的处理逻辑（如移动、碰撞检测、渲染等）
- 根据组件组合筛选需要处理的实体
- 提供生命周期管理和性能监控
- 管理实体的添加、移除事件

## 快速示例

```typescript
import { EntitySystem, ECSSystem, Matcher } from '@esengine/ecs-framework';

@ECSSystem('Movement')
class MovementSystem extends EntitySystem {
  constructor() {
    // 使用 Matcher 定义需要处理的实体条件
    super(Matcher.all(Position, Velocity));
  }

  protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const position = entity.getComponent(Position);
      const velocity = entity.getComponent(Velocity);

      if (position && velocity) {
        position.x += velocity.dx * Time.deltaTime;
        position.y += velocity.dy * Time.deltaTime;
      }
    }
  }
}
```

## 系统属性和方法

### 重要属性

```typescript
@ECSSystem('Example')
class ExampleSystem extends EntitySystem {
  showSystemInfo(): void {
    console.log(`系统名称: ${this.systemName}`);        // 系统名称
    console.log(`更新顺序: ${this.updateOrder}`);       // 更新时序
    console.log(`是否启用: ${this.enabled}`);            // 启用状态
    console.log(`实体数量: ${this.entities.length}`);   // 匹配的实体数量
    console.log(`所属场景: ${this.scene?.name}`);        // 所属场景
  }
}
```

### 实体访问

```typescript
protected process(entities: readonly Entity[]): void {
  // 方式1：使用参数中的实体列表
  for (const entity of entities) {
    // 处理实体
  }

  // 方式2：使用 this.entities 属性（与参数相同）
  for (const entity of this.entities) {
    // 处理实体
  }
}
```

### 控制系统执行

```typescript
@ECSSystem('Conditional')
class ConditionalSystem extends EntitySystem {
  private shouldProcess = true;

  protected onCheckProcessing(): boolean {
    // 返回 false 时跳过本次处理
    return this.shouldProcess && this.entities.length > 0;
  }

  public pause(): void {
    this.shouldProcess = false;
  }

  public resume(): void {
    this.shouldProcess = true;
  }
}
```

## 系统管理

### 添加系统到场景

框架提供了两种方式添加系统：传入实例或传入类型（自动依赖注入）。

```typescript
// 在场景子类中添加系统
class GameScene extends Scene {
  protected initialize(): void {
    // 方式1：传入实例
    this.addSystem(new MovementSystem());
    this.addSystem(new RenderSystem());

    // 方式2：传入类型（自动依赖注入）
    this.addEntityProcessor(PhysicsSystem);

    // 设置系统更新顺序
    const movementSystem = this.getSystem(MovementSystem);
    if (movementSystem) {
      movementSystem.updateOrder = 1;
    }
  }
}
```

### 系统更新顺序

系统的执行顺序由 `updateOrder` 属性决定，数值越小越先执行：

```typescript
@ECSSystem('Input')
class InputSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(InputComponent));
    this.updateOrder = -100; // 输入系统优先执行
  }
}

@ECSSystem('Physics')
class PhysicsSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(RigidBody));
    this.updateOrder = 0; // 默认顺序
  }
}

@ECSSystem('Render')
class RenderSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Sprite, Transform));
    this.updateOrder = 100; // 渲染系统最后执行
  }
}
```

#### 稳定排序：addOrder

当多个系统的 `updateOrder` 相同时，框架使用 `addOrder`（添加顺序）作为第二排序条件：

```typescript
// 这两个系统 updateOrder 都是默认值 0
scene.addSystem(new SystemA()); // addOrder = 0，先执行
scene.addSystem(new SystemB()); // addOrder = 1，后执行
```

## 运行时环境装饰器

对于网络游戏，你可以使用装饰器来控制系统方法在哪个环境下执行。

### 可用装饰器

| 装饰器 | 效果 |
|--------|------|
| `@ServerOnly()` | 方法仅在服务端执行 |
| `@ClientOnly()` | 方法仅在客户端执行 |
| `@NotServer()` | 方法在服务端跳过 |
| `@NotClient()` | 方法在客户端跳过 |

### 使用示例

```typescript
import { EntitySystem, ServerOnly, ClientOnly } from '@esengine/ecs-framework';

class GameSystem extends EntitySystem {
  @ServerOnly()
  private spawnEnemies(): void {
    // 仅在服务端运行 - 权威生成逻辑
  }

  @ClientOnly()
  private playEffects(): void {
    // 仅在客户端运行 - 视觉效果
  }
}
```

### 简单条件检查

对于简单场景，直接检查通常比装饰器更清晰：

```typescript
class CollectibleSystem extends EntitySystem {
  private checkCollections(): void {
    if (!this.scene.isServer) return;  // 客户端跳过

    // 服务端权威逻辑...
  }
}
```

参见 [场景运行时环境](/guide/scene/index#运行时环境) 了解配置详情。

## 下一步

- [系统类型](/guide/system/types) - 了解不同类型的系统基类
- [系统生命周期](/guide/system/lifecycle) - 生命周期回调和事件监听
- [命令缓冲区](/guide/system/command-buffer) - 延迟执行实体操作
- [系统调度](/guide/system/scheduling) - 声明式系统调度
- [变更检测](/guide/system/change-detection) - 帧级变更检测优化
- [最佳实践](/guide/system/best-practices) - 系统设计最佳实践
