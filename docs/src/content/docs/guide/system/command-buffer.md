---
title: "命令缓冲区"
description: "使用 CommandBuffer 延迟执行实体操作"
---

> **v2.3.0+**

CommandBuffer 提供了一种延迟执行实体操作的机制。当你需要在迭代过程中销毁实体或进行其他可能影响迭代的操作时，使用 CommandBuffer 可以将这些操作推迟到帧末统一执行。

## 基本用法

每个 EntitySystem 都内置了 `commands` 属性：

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

        // 使用命令缓冲区延迟移除组件
        this.commands.removeComponent(entity, DamageReceiver);

        if (health.current <= 0) {
          // 延迟添加死亡标记
          this.commands.addComponent(entity, new Dead());
          // 延迟销毁实体
          this.commands.destroyEntity(entity);
        }
      }
    }
  }
}
```

## 支持的命令

| 方法 | 说明 |
|------|------|
| `addComponent(entity, component)` | 延迟添加组件 |
| `removeComponent(entity, ComponentType)` | 延迟移除组件 |
| `destroyEntity(entity)` | 延迟销毁实体 |
| `setEntityActive(entity, active)` | 延迟设置实体激活状态 |

## 执行时机

命令缓冲区中的命令会在每帧的 `lateUpdate` 阶段之后自动执行。执行顺序与命令入队顺序一致。

```
场景更新流程:
1. onBegin()
2. process()
3. lateProcess()
4. onEnd()
5. flushCommandBuffers()  <-- 命令在这里执行
```

## 使用场景

CommandBuffer 适用于以下场景：

### 1. 在迭代中销毁实体

避免修改正在遍历的集合：

```typescript
@ECSSystem('EnemyDeath')
class EnemyDeathSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Enemy, Health));
  }

  protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const health = entity.getComponent(Health);
      if (health && health.current <= 0) {
        // 播放死亡动画、掉落物品等
        this.spawnLoot(entity);

        // 延迟销毁，不影响当前迭代
        this.commands.destroyEntity(entity);
      }
    }
  }

  private spawnLoot(entity: Entity): void {
    // 掉落物品逻辑
  }
}
```

### 2. 批量延迟操作

将多个操作合并到帧末执行：

```typescript
@ECSSystem('Cleanup')
class CleanupSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(MarkedForDeletion));
  }

  protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      // 批量收集要删除的实体
      this.commands.destroyEntity(entity);
    }
    // 所有销毁操作在帧末统一执行
  }
}
```

### 3. 跨系统协调

一个系统标记，另一个系统响应：

```typescript
@ECSSystem('Combat')
class CombatSystem extends EntitySystem {
  protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      if (this.shouldDie(entity)) {
        // 标记死亡
        this.commands.addComponent(entity, new Dead());
      }
    }
  }
}

@ECSSystem('DeathHandler')
class DeathHandlerSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Dead));
  }

  protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      // 处理死亡逻辑
      this.playDeathAnimation(entity);
      this.commands.destroyEntity(entity);
    }
  }
}
```

## 注意事项

- 命令会跳过已销毁的实体（安全检查）
- 单个命令执行失败不会影响其他命令
- 命令按入队顺序执行
- 每次 `flush()` 后命令队列会清空

## 直接修改 vs 命令缓冲区

| 操作 | 直接修改 | 命令缓冲区 |
|------|----------|------------|
| 添加组件 | ✅ 安全 | ✅ 安全 |
| 移除组件 | ✅ 安全 | ✅ 安全 |
| 销毁实体 | ⚠️ 可能有问题 | ✅ 推荐 |
| 执行时机 | 立即执行 | 帧末执行 |

:::tip
虽然在 `process` 中添加/移除组件是安全的（因为有快照机制），但如果需要销毁实体，推荐使用命令缓冲区。
:::
