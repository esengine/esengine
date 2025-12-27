---
title: "组件系统"
description: "ECS 组件基础概念和创建方法"
---

在 ECS 架构中，组件（Component）是数据和行为的载体。组件定义了实体具有的属性和功能，是 ECS 架构的核心构建块。

## 基本概念

组件是继承自 `Component` 抽象基类的具体类，用于：
- 存储实体的数据（如位置、速度、健康值等）
- 定义与数据相关的行为方法
- 提供生命周期回调钩子
- 支持序列化和调试

## 创建组件

### 基础组件定义

```typescript
import { Component, ECSComponent } from '@esengine/ecs-framework';

@ECSComponent('Position')
class Position extends Component {
  x: number = 0;
  y: number = 0;

  constructor(x: number = 0, y: number = 0) {
    super();
    this.x = x;
    this.y = y;
  }
}

@ECSComponent('Health')
class Health extends Component {
  current: number;
  max: number;

  constructor(max: number = 100) {
    super();
    this.max = max;
    this.current = max;
  }

  // 组件可以包含行为方法
  takeDamage(damage: number): void {
    this.current = Math.max(0, this.current - damage);
  }

  heal(amount: number): void {
    this.current = Math.min(this.max, this.current + amount);
  }

  isDead(): boolean {
    return this.current <= 0;
  }
}
```

## @ECSComponent 装饰器

`@ECSComponent` 是组件类必须使用的装饰器，它为组件提供了类型标识和元数据管理。

### 为什么必须使用

| 功能 | 说明 |
|------|------|
| **类型识别** | 提供稳定的类型名称，代码混淆后仍能正确识别 |
| **序列化支持** | 序列化/反序列化时使用该名称作为类型标识 |
| **组件注册** | 自动注册到 ComponentRegistry，分配唯一的位掩码 |
| **调试支持** | 在调试工具和日志中显示可读的组件名称 |

### 基本语法

```typescript
@ECSComponent(typeName: string)
```

- `typeName`: 组件的类型名称，建议使用与类名相同或相近的名称

### 使用示例

```typescript
// ✅ 正确的用法
@ECSComponent('Velocity')
class Velocity extends Component {
  dx: number = 0;
  dy: number = 0;
}

// ✅ 推荐：类型名与类名保持一致
@ECSComponent('PlayerController')
class PlayerController extends Component {
  speed: number = 5;
}

// ❌ 错误的用法 - 没有装饰器
class BadComponent extends Component {
  // 这样定义的组件可能在生产环境出现问题：
  // 1. 代码压缩后类名变化，无法正确序列化
  // 2. 组件未注册到框架，查询和匹配可能失效
}
```

### 与 @Serializable 配合使用

当组件需要支持序列化时，`@ECSComponent` 和 `@Serializable` 需要一起使用：

```typescript
import { Component, ECSComponent, Serializable, Serialize } from '@esengine/ecs-framework';

@ECSComponent('Player')
@Serializable({ version: 1 })
class PlayerComponent extends Component {
  @Serialize()
  name: string = '';

  @Serialize()
  level: number = 1;

  // 不使用 @Serialize() 的字段不会被序列化
  private _cachedData: any = null;
}
```

> **注意**：`@ECSComponent` 的 `typeName` 和 `@Serializable` 的 `typeId` 可以不同。如果 `@Serializable` 没有指定 `typeId`，则默认使用 `@ECSComponent` 的 `typeName`。

### 组件类型名的唯一性

每个组件的类型名应该是唯一的：

```typescript
// ❌ 错误：两个组件使用相同的类型名
@ECSComponent('Health')
class HealthComponent extends Component { }

@ECSComponent('Health')  // 冲突！
class EnemyHealthComponent extends Component { }

// ✅ 正确：使用不同的类型名
@ECSComponent('PlayerHealth')
class PlayerHealthComponent extends Component { }

@ECSComponent('EnemyHealth')
class EnemyHealthComponent extends Component { }
```

## 组件属性

每个组件都有一些内置属性：

```typescript
@ECSComponent('ExampleComponent')
class ExampleComponent extends Component {
  someData: string = "example";

  onAddedToEntity(): void {
    console.log(`组件ID: ${this.id}`);           // 唯一的组件ID
    console.log(`所属实体ID: ${this.entityId}`); // 所属实体的ID
  }
}
```

## 组件与实体的关系

组件存储了所属实体的ID (`entityId`)，而不是直接引用实体对象。这是ECS数据导向设计的体现，避免了循环引用。

在实际使用中，**应该在 System 中处理实体和组件的交互**，而不是在组件内部：

```typescript
@ECSComponent('Health')
class Health extends Component {
  current: number;
  max: number;

  constructor(max: number = 100) {
    super();
    this.max = max;
    this.current = max;
  }

  isDead(): boolean {
    return this.current <= 0;
  }
}

@ECSComponent('Damage')
class Damage extends Component {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

// 推荐：在 System 中处理逻辑
class DamageSystem extends EntitySystem {
  constructor() {
    super(new Matcher().all(Health, Damage));
  }

  process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const health = entity.getComponent(Health)!;
      const damage = entity.getComponent(Damage)!;

      health.current -= damage.value;

      if (health.isDead()) {
        entity.destroy();
      }

      // 应用伤害后移除 Damage 组件
      entity.removeComponent(damage);
    }
  }
}
```

## 更多主题

- [生命周期](/guide/component/lifecycle) - 组件生命周期钩子
- [EntityRef 装饰器](/guide/component/entity-ref) - 安全的实体引用
- [最佳实践](/guide/component/best-practices) - 组件设计模式和示例
