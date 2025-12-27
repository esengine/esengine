---
title: "实体查询系统"
description: "ECS 实体查询核心概念和基础用法"
---

实体查询是 ECS 架构的核心功能之一。本指南将介绍如何使用 Matcher 和 QuerySystem 来查询和筛选实体。

## 核心概念

### Matcher - 查询条件描述符

Matcher 是一个链式 API，用于描述实体查询条件。它本身不执行查询，而是作为条件传递给 EntitySystem 或 QuerySystem。

### QuerySystem - 查询执行引擎

QuerySystem 负责实际执行查询，内部使用响应式查询机制自动优化性能。

## 在 EntitySystem 中使用 Matcher

这是最常见的使用方式。EntitySystem 通过 Matcher 自动筛选和处理符合条件的实体。

### 基础用法

```typescript
import { EntitySystem, Matcher, Entity, Component } from '@esengine/ecs-framework';

class PositionComponent extends Component {
    public x: number = 0;
    public y: number = 0;
}

class VelocityComponent extends Component {
    public vx: number = 0;
    public vy: number = 0;
}

class MovementSystem extends EntitySystem {
    constructor() {
        // 方式1: 使用 Matcher.empty().all()
        super(Matcher.empty().all(PositionComponent, VelocityComponent));

        // 方式2: 直接使用 Matcher.all() (等价)
        // super(Matcher.all(PositionComponent, VelocityComponent));
    }

    protected process(entities: readonly Entity[]): void {
        for (const entity of entities) {
            const pos = entity.getComponent(PositionComponent)!;
            const vel = entity.getComponent(VelocityComponent)!;

            pos.x += vel.vx;
            pos.y += vel.vy;
        }
    }
}

// 添加到场景
scene.addEntityProcessor(new MovementSystem());
```

### Matcher 链式 API

#### all() - 必须包含所有组件

```typescript
class HealthSystem extends EntitySystem {
    constructor() {
        // 实体必须同时拥有 Health 和 Position 组件
        super(Matcher.empty().all(HealthComponent, PositionComponent));
    }

    protected process(entities: readonly Entity[]): void {
        // 只处理同时拥有两个组件的实体
    }
}
```

#### any() - 至少包含一个组件

```typescript
class DamageableSystem extends EntitySystem {
    constructor() {
        // 实体至少拥有 Health 或 Shield 其中之一
        super(Matcher.any(HealthComponent, ShieldComponent));
    }

    protected process(entities: readonly Entity[]): void {
        // 处理拥有生命值或护盾的实体
    }
}
```

#### none() - 不能包含指定组件

```typescript
class AliveEntitySystem extends EntitySystem {
    constructor() {
        // 实体不能拥有 DeadTag 组件
        super(Matcher.all(HealthComponent).none(DeadTag));
    }

    protected process(entities: readonly Entity[]): void {
        // 只处理活着的实体
    }
}
```

#### 组合条件

```typescript
class CombatSystem extends EntitySystem {
    constructor() {
        super(
            Matcher.empty()
                .all(PositionComponent, HealthComponent)  // 必须有位置和生命
                .any(WeaponComponent, MagicComponent)      // 至少有武器或魔法
                .none(DeadTag, FrozenTag)                  // 不能是死亡或冰冻状态
        );
    }

    protected process(entities: readonly Entity[]): void {
        // 处理可以战斗的活着的实体
    }
}
```

#### nothing() - 不匹配任何实体

用于创建只需要生命周期方法（`onBegin`、`onEnd`）但不需要处理实体的系统。

```typescript
class FrameTimerSystem extends EntitySystem {
    constructor() {
        // 不匹配任何实体
        super(Matcher.nothing());
    }

    protected onBegin(): void {
        // 每帧开始时执行
        Performance.markFrameStart();
    }

    protected process(entities: readonly Entity[]): void {
        // 永远不会被调用，因为没有匹配的实体
    }

    protected onEnd(): void {
        // 每帧结束时执行
        Performance.markFrameEnd();
    }
}
```

#### empty() vs nothing() 的区别

| 方法 | 行为 | 使用场景 |
|------|------|----------|
| `Matcher.empty()` | 匹配**所有**实体 | 需要处理场景中所有实体 |
| `Matcher.nothing()` | 不匹配**任何**实体 | 只需要生命周期回调，不处理实体 |

## 直接使用 QuerySystem

如果不需要创建系统，可以直接使用 Scene 的 querySystem 进行查询。

### 基础查询方法

```typescript
// 获取场景的查询系统
const querySystem = scene.querySystem;

// 查询拥有所有指定组件的实体
const result1 = querySystem.queryAll(PositionComponent, VelocityComponent);
console.log(`找到 ${result1.count} 个移动实体`);
console.log(`查询耗时: ${result1.executionTime.toFixed(2)}ms`);

// 查询拥有任意指定组件的实体
const result2 = querySystem.queryAny(WeaponComponent, MagicComponent);
console.log(`找到 ${result2.count} 个战斗单位`);

// 查询不包含指定组件的实体
const result3 = querySystem.queryNone(DeadTag);
console.log(`找到 ${result3.count} 个活着的实体`);
```

### 按标签和名称查询

```typescript
// 按标签查询
const playerResult = querySystem.queryByTag(Tags.PLAYER);
for (const player of playerResult.entities) {
    console.log('玩家:', player.name);
}

// 按名称查询
const bossResult = querySystem.queryByName('Boss');
if (bossResult.count > 0) {
    const boss = bossResult.entities[0];
    console.log('找到Boss:', boss);
}

// 按单个组件查询
const healthResult = querySystem.queryByComponent(HealthComponent);
console.log(`有 ${healthResult.count} 个实体拥有生命值`);
```

## 性能优化

### 自动缓存

QuerySystem 内部使用响应式查询自动缓存结果，相同的查询条件会直接使用缓存：

```typescript
// 第一次查询，执行实际查询
const result1 = querySystem.queryAll(PositionComponent);
console.log('fromCache:', result1.fromCache); // false

// 第二次相同查询，使用缓存
const result2 = querySystem.queryAll(PositionComponent);
console.log('fromCache:', result2.fromCache); // true
```

### 实体变化自动更新

当实体添加/移除组件时，查询缓存会自动更新：

```typescript
// 查询拥有武器的实体
const before = querySystem.queryAll(WeaponComponent);
console.log('之前:', before.count); // 假设为 5

// 给实体添加武器
const enemy = scene.createEntity('Enemy');
enemy.addComponent(new WeaponComponent());

// 再次查询，自动包含新实体
const after = querySystem.queryAll(WeaponComponent);
console.log('之后:', after.count); // 现在是 6
```

## 更多主题

- [Matcher API](/guide/entity-query/matcher-api) - 完整的 Matcher API 参考
- [编译查询](/guide/entity-query/compiled-query) - CompiledQuery 高级用法
- [最佳实践](/guide/entity-query/best-practices) - 查询优化和实际应用
