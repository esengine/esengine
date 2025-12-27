---
title: "Command Buffer"
description: "Use CommandBuffer for deferred entity operations"
---

> **v2.3.0+**

CommandBuffer provides a mechanism for deferred execution of entity operations. When you need to destroy entities or perform other operations that might affect iteration during processing, CommandBuffer allows you to defer these operations to the end of the frame.

## Basic Usage

Every EntitySystem has a built-in `commands` property:

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

        // Use command buffer to defer component removal
        this.commands.removeComponent(entity, DamageReceiver);

        if (health.current <= 0) {
          // Defer adding death marker
          this.commands.addComponent(entity, new Dead());
          // Defer entity destruction
          this.commands.destroyEntity(entity);
        }
      }
    }
  }
}
```

## Supported Commands

| Method | Description |
|--------|-------------|
| `addComponent(entity, component)` | Defer adding component |
| `removeComponent(entity, ComponentType)` | Defer removing component |
| `destroyEntity(entity)` | Defer destroying entity |
| `setEntityActive(entity, active)` | Defer setting entity active state |

## Execution Timing

Commands in the buffer are automatically executed after the `lateUpdate` phase of each frame. Execution order matches the order commands were queued.

```
Scene Update Flow:
1. onBegin()
2. process()
3. lateProcess()
4. onEnd()
5. flushCommandBuffers()  <-- Commands execute here
```

## Use Cases

CommandBuffer is suitable for:

### 1. Destroying Entities During Iteration

Avoid modifying collection being traversed:

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
        // Play death animation, spawn loot, etc.
        this.spawnLoot(entity);

        // Defer destruction, doesn't affect current iteration
        this.commands.destroyEntity(entity);
      }
    }
  }

  private spawnLoot(entity: Entity): void {
    // Loot spawning logic
  }
}
```

### 2. Batch Deferred Operations

Merge multiple operations to execute at end of frame:

```typescript
@ECSSystem('Cleanup')
class CleanupSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(MarkedForDeletion));
  }

  protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      // Batch collect entities to delete
      this.commands.destroyEntity(entity);
    }
    // All destruction operations execute at frame end
  }
}
```

### 3. Cross-System Coordination

One system marks, another system responds:

```typescript
@ECSSystem('Combat')
class CombatSystem extends EntitySystem {
  protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      if (this.shouldDie(entity)) {
        // Mark as dead
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
      // Handle death logic
      this.playDeathAnimation(entity);
      this.commands.destroyEntity(entity);
    }
  }
}
```

## Notes

- Commands skip already destroyed entities (safety check)
- Single command failure doesn't affect other commands
- Commands execute in queue order
- Command queue clears after each `flush()`

## Direct Modification vs Command Buffer

| Operation | Direct Modification | Command Buffer |
|-----------|---------------------|----------------|
| Add component | ✅ Safe | ✅ Safe |
| Remove component | ✅ Safe | ✅ Safe |
| Destroy entity | ⚠️ May cause issues | ✅ Recommended |
| Execution timing | Immediate | End of frame |

:::tip
While adding/removing components in `process` is safe (due to snapshot mechanism), if you need to destroy entities, using command buffer is recommended.
:::
