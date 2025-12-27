---
title: "系统生命周期"
description: "系统生命周期回调、事件监听和依赖注入"
---

## 生命周期回调

系统提供了完整的生命周期回调：

```typescript
@ECSSystem('Example')
class ExampleSystem extends EntitySystem {
  protected onInitialize(): void {
    console.log('系统初始化');
    // 系统被添加到场景时调用，用于初始化资源
  }

  protected onBegin(): void {
    // 每帧处理开始前调用
  }

  protected process(entities: readonly Entity[]): void {
    // 主要的处理逻辑
    for (const entity of entities) {
      // 处理每个实体
      // ✅ 可以安全地在这里添加/移除组件，不会影响当前迭代
    }
  }

  protected lateProcess(entities: readonly Entity[]): void {
    // 主处理之后的后期处理
    // ✅ 可以安全地在这里添加/移除组件，不会影响当前迭代
  }

  protected onEnd(): void {
    // 每帧处理结束后调用
  }

  protected onDestroy(): void {
    console.log('系统销毁');
    // 系统从场景移除时调用，用于清理资源
  }
}
```

## 实体事件监听

系统可以监听实体的添加和移除事件：

```typescript
@ECSSystem('EnemyManager')
class EnemyManagerSystem extends EntitySystem {
  private enemyCount = 0;

  constructor() {
    super(Matcher.all(Enemy, Health));
  }

  protected onAdded(entity: Entity): void {
    this.enemyCount++;
    console.log(`敌人加入战斗，当前敌人数量: ${this.enemyCount}`);

    // 可以在这里为新敌人设置初始状态
    const health = entity.getComponent(Health);
    if (health) {
      health.current = health.max;
    }
  }

  protected onRemoved(entity: Entity): void {
    this.enemyCount--;
    console.log(`敌人被移除，剩余敌人数量: ${this.enemyCount}`);

    // 检查是否所有敌人都被消灭
    if (this.enemyCount === 0) {
      this.scene?.eventSystem.emitSync('all_enemies_defeated');
    }
  }
}
```

### 重要：onAdded/onRemoved 的调用时机

:::caution
`onAdded` 和 `onRemoved` 回调是**同步调用**的，会在 `addComponent`/`removeComponent` 返回**之前**立即执行。
:::

这意味着：

```typescript
// ❌ 错误的用法：链式赋值在 onAdded 之后才执行
const comp = entity.addComponent(new ClickComponent());
comp.element = this._element;  // 此时 onAdded 已经执行完了！

// ✅ 正确的用法：通过构造函数传入初始值
const comp = entity.addComponent(new ClickComponent(this._element));

// ✅ 或者使用 createComponent 方法
const comp = entity.createComponent(ClickComponent, this._element);
```

**为什么这样设计？**

事件驱动设计确保 `onAdded`/`onRemoved` 回调不受系统注册顺序的影响。当组件被添加时，所有监听该组件的系统都会立即收到通知，而不是等到下一帧。

**最佳实践：**

1. 组件的初始值应该通过**构造函数**传入
2. 不要依赖 `addComponent` 返回后再设置属性
3. 如果需要在 `onAdded` 中访问组件属性，确保这些属性在构造时已经设置

### 在 process/lateProcess 中安全地修改组件

在 `process` 或 `lateProcess` 中迭代实体时，可以安全地添加或移除组件，不会影响当前的迭代过程：

```typescript
@ECSSystem('Damage')
class DamageSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Health, DamageReceiver));
  }

  protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const health = entity.getComponent(Health);
      const damage = entity.getComponent(DamageReceiver);

      if (health && damage) {
        health.current -= damage.amount;

        // ✅ 安全：移除组件不会影响当前迭代
        entity.removeComponent(damage);

        if (health.current <= 0) {
          // ✅ 安全：添加组件也不会影响当前迭代
          entity.addComponent(new Dead());
        }
      }
    }
  }
}
```

框架会在每次 `process`/`lateProcess` 调用前创建实体列表的快照，确保迭代过程中的组件变化不会导致跳过实体或重复处理。

## 事件系统集成

系统可以方便地监听和发送事件：

```typescript
@ECSSystem('GameLogic')
class GameLogicSystem extends EntitySystem {
  protected onInitialize(): void {
    // 添加事件监听器（系统销毁时自动清理）
    this.addEventListener('player_died', this.onPlayerDied.bind(this));
    this.addEventListener('level_complete', this.onLevelComplete.bind(this));
  }

  private onPlayerDied(data: any): void {
    console.log('玩家死亡，重新开始游戏');
    // 处理玩家死亡逻辑
  }

  private onLevelComplete(data: any): void {
    console.log('关卡完成，加载下一关');
    // 处理关卡完成逻辑
  }

  protected process(entities: readonly Entity[]): void {
    // 在处理过程中发送事件
    for (const entity of entities) {
      const health = entity.getComponent(Health);
      if (health && health.current <= 0) {
        this.scene?.eventSystem.emitSync('entity_died', { entity });
      }
    }
  }
}
```

## 性能监控

系统内置了性能监控功能：

```typescript
@ECSSystem('Performance')
class PerformanceSystem extends EntitySystem {
  protected onEnd(): void {
    // 获取性能数据
    const perfData = this.getPerformanceData();
    if (perfData) {
      console.log(`执行时间: ${perfData.executionTime.toFixed(2)}ms`);
    }

    // 获取性能统计
    const stats = this.getPerformanceStats();
    if (stats) {
      console.log(`平均执行时间: ${stats.averageTime.toFixed(2)}ms`);
    }
  }

  public resetPerformance(): void {
    this.resetPerformanceData();
  }
}
```

## 系统依赖注入

系统实现了 `IService` 接口，支持通过依赖注入获取其他服务或系统：

```typescript
import { ECSSystem, Injectable, InjectProperty } from '@esengine/ecs-framework';

@Injectable()
@ECSSystem('Physics')
class PhysicsSystem extends EntitySystem {
  @InjectProperty(CollisionService)
  private collision!: CollisionService;

  constructor() {
    super(Matcher.all(Transform, RigidBody));
  }

  protected process(entities: readonly Entity[]): void {
    // 使用注入的服务
    this.collision.detectCollisions(entities);
  }

  // 实现 IService 接口的 dispose 方法
  public dispose(): void {
    // 清理资源
  }
}

// 使用时传入类型即可，框架会自动注入依赖
class GameScene extends Scene {
  protected initialize(): void {
    // 自动依赖注入
    this.addEntityProcessor(PhysicsSystem);
  }
}
```

注意事项：
- 使用 `@Injectable()` 装饰器标记需要依赖注入的系统
- 使用 `@InjectProperty()` 装饰器声明依赖
- 系统必须实现 `dispose()` 方法（IService 接口要求）
- 使用 `addEntityProcessor(类型)` 而不是 `addSystem(new 类型())` 来启用依赖注入
