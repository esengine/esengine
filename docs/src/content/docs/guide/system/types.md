---
title: "系统类型"
description: "EntitySystem、ProcessingSystem、PassiveSystem、IntervalSystem 等系统基类"
---

框架提供了几种不同类型的系统基类，适用于不同的使用场景。

## EntitySystem - 基础系统

最基础的系统类，所有其他系统都继承自它：

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

## ProcessingSystem - 处理系统

适用于不需要逐个处理实体的系统：

```typescript
@ECSSystem('Physics')
class PhysicsSystem extends ProcessingSystem {
  constructor() {
    super(); // 不需要指定 Matcher
  }

  public processSystem(): void {
    // 执行物理世界步进
    this.physicsWorld.step(Time.deltaTime);
  }
}
```

## PassiveSystem - 被动系统

被动系统不进行主动处理，主要用于监听实体的添加和移除事件：

```typescript
@ECSSystem('EntityTracker')
class EntityTrackerSystem extends PassiveSystem {
  constructor() {
    super(Matcher.all(Health));
  }

  protected onAdded(entity: Entity): void {
    console.log(`生命值实体被添加: ${entity.name}`);
  }

  protected onRemoved(entity: Entity): void {
    console.log(`生命值实体被移除: ${entity.name}`);
  }
}
```

## IntervalSystem - 间隔系统

按固定时间间隔执行的系统：

```typescript
@ECSSystem('AutoSave')
class AutoSaveSystem extends IntervalSystem {
  constructor() {
    // 每 5 秒执行一次
    super(5.0, Matcher.all(SaveData));
  }

  protected process(entities: readonly Entity[]): void {
    console.log('执行自动保存...');
    // 保存游戏数据
    this.saveGameData(entities);
  }

  private saveGameData(entities: readonly Entity[]): void {
    // 保存逻辑
  }
}
```

## 实体匹配器 (Matcher)

Matcher 用于定义系统需要处理哪些实体。它提供了灵活的条件组合：

### 基本匹配条件

```typescript
// 必须同时拥有 Position 和 Velocity 组件
const matcher1 = Matcher.all(Position, Velocity);

// 至少拥有 Health 或 Shield 组件之一
const matcher2 = Matcher.any(Health, Shield);

// 不能拥有 Dead 组件
const matcher3 = Matcher.none(Dead);
```

### 复合匹配条件

```typescript
// 复杂的组合条件
const complexMatcher = Matcher.all(Position, Velocity)
  .any(Player, Enemy)
  .none(Dead, Disabled);

@ECSSystem('Combat')
class CombatSystem extends EntitySystem {
  constructor() {
    super(complexMatcher);
  }
}
```

### 特殊匹配条件

```typescript
// 按标签匹配
const tagMatcher = Matcher.byTag(1); // 匹配标签为 1 的实体

// 按名称匹配
const nameMatcher = Matcher.byName("Player"); // 匹配名称为 "Player" 的实体

// 单组件匹配
const componentMatcher = Matcher.byComponent(Health); // 匹配拥有 Health 组件的实体

// 不匹配任何实体
const nothingMatcher = Matcher.nothing(); // 用于只需要生命周期回调的系统
```

### 空匹配器 vs Nothing 匹配器

```typescript
// empty() - 空条件，匹配所有实体
const emptyMatcher = Matcher.empty();

// nothing() - 不匹配任何实体，用于只需要生命周期方法的系统
const nothingMatcher = Matcher.nothing();

// 使用场景：只需要 onBegin/onEnd 生命周期的系统
@ECSSystem('FrameTimer')
class FrameTimerSystem extends EntitySystem {
  constructor() {
    super(Matcher.nothing()); // 不处理任何实体
  }

  protected onBegin(): void {
    // 每帧开始时执行，例如：记录帧开始时间
    console.log('帧开始');
  }

  protected process(entities: readonly Entity[]): void {
    // 永远不会被调用，因为没有匹配的实体
  }

  protected onEnd(): void {
    // 每帧结束时执行
    console.log('帧结束');
  }
}
```

:::tip
更多关于 Matcher 和实体查询的详细用法，请参考 [实体查询系统](/guide/entity-query) 文档。
:::

## 系统类型选择指南

| 系统类型 | 适用场景 |
|----------|----------|
| `EntitySystem` | 需要逐个处理匹配实体的通用系统 |
| `ProcessingSystem` | 不需要实体列表，只执行全局逻辑 |
| `PassiveSystem` | 只监听实体添加/移除事件 |
| `IntervalSystem` | 按固定时间间隔执行 |
| `WorkerEntitySystem` | 计算密集型任务，需要多线程 |
