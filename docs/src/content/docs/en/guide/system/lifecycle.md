---
title: "System Lifecycle"
description: "System lifecycle callbacks, event listening and dependency injection"
---

## Lifecycle Callbacks

Systems provide complete lifecycle callbacks:

```typescript
@ECSSystem('Example')
class ExampleSystem extends EntitySystem {
  protected onInitialize(): void {
    console.log('System initialized');
    // Called when system is added to scene, for initializing resources
  }

  protected onBegin(): void {
    // Called before each frame's processing begins
  }

  protected process(entities: readonly Entity[]): void {
    // Main processing logic
    for (const entity of entities) {
      // Process each entity
      // ✅ Safe to add/remove components here without affecting current iteration
    }
  }

  protected lateProcess(entities: readonly Entity[]): void {
    // Post-processing after main process
    // ✅ Safe to add/remove components here without affecting current iteration
  }

  protected onEnd(): void {
    // Called after each frame's processing ends
  }

  protected onDestroy(): void {
    console.log('System destroyed');
    // Called when system is removed from scene, for cleaning up resources
  }
}
```

## Entity Event Listening

Systems can listen for entity add and remove events:

```typescript
@ECSSystem('EnemyManager')
class EnemyManagerSystem extends EntitySystem {
  private enemyCount = 0;

  constructor() {
    super(Matcher.all(Enemy, Health));
  }

  protected onAdded(entity: Entity): void {
    this.enemyCount++;
    console.log(`Enemy joined battle, current enemy count: ${this.enemyCount}`);

    // Can set initial state for new enemies here
    const health = entity.getComponent(Health);
    if (health) {
      health.current = health.max;
    }
  }

  protected onRemoved(entity: Entity): void {
    this.enemyCount--;
    console.log(`Enemy removed, remaining enemies: ${this.enemyCount}`);

    // Check if all enemies are defeated
    if (this.enemyCount === 0) {
      this.scene?.eventSystem.emitSync('all_enemies_defeated');
    }
  }
}
```

### Important: Timing of onAdded/onRemoved Calls

:::caution
`onAdded` and `onRemoved` callbacks are called **synchronously**, executing immediately **before** `addComponent`/`removeComponent` returns.
:::

This means:

```typescript
// ❌ Wrong: Chain assignment executes after onAdded
const comp = entity.addComponent(new ClickComponent());
comp.element = this._element;  // At this point onAdded has already executed!

// ✅ Correct: Pass initial values through constructor
const comp = entity.addComponent(new ClickComponent(this._element));

// ✅ Or use the createComponent method
const comp = entity.createComponent(ClickComponent, this._element);
```

**Why this design?**

The event-driven design ensures that `onAdded`/`onRemoved` callbacks are not affected by system registration order. When a component is added, all systems listening for that component receive notification immediately, rather than waiting until the next frame.

**Best Practices:**

1. Component initial values should be passed through the **constructor**
2. Don't rely on setting properties after `addComponent` returns
3. If you need to access component properties in `onAdded`, ensure those properties are set at construction time

### Safely Modifying Components in process/lateProcess

When iterating entities in `process` or `lateProcess`, you can safely add or remove components without affecting the current iteration:

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

        // ✅ Safe: removing component won't affect current iteration
        entity.removeComponent(damage);

        if (health.current <= 0) {
          // ✅ Safe: adding component won't affect current iteration
          entity.addComponent(new Dead());
        }
      }
    }
  }
}
```

The framework creates a snapshot of the entity list before each `process`/`lateProcess` call, ensuring that component changes during iteration won't cause entities to be skipped or processed multiple times.

## Event System Integration

Systems can conveniently listen for and send events:

```typescript
@ECSSystem('GameLogic')
class GameLogicSystem extends EntitySystem {
  protected onInitialize(): void {
    // Add event listeners (automatically cleaned up when system is destroyed)
    this.addEventListener('player_died', this.onPlayerDied.bind(this));
    this.addEventListener('level_complete', this.onLevelComplete.bind(this));
  }

  private onPlayerDied(data: any): void {
    console.log('Player died, restarting game');
    // Handle player death logic
  }

  private onLevelComplete(data: any): void {
    console.log('Level complete, loading next level');
    // Handle level completion logic
  }

  protected process(entities: readonly Entity[]): void {
    // Send events during processing
    for (const entity of entities) {
      const health = entity.getComponent(Health);
      if (health && health.current <= 0) {
        this.scene?.eventSystem.emitSync('entity_died', { entity });
      }
    }
  }
}
```

## Performance Monitoring

Systems have built-in performance monitoring:

```typescript
@ECSSystem('Performance')
class PerformanceSystem extends EntitySystem {
  protected onEnd(): void {
    // Get performance data
    const perfData = this.getPerformanceData();
    if (perfData) {
      console.log(`Execution time: ${perfData.executionTime.toFixed(2)}ms`);
    }

    // Get performance statistics
    const stats = this.getPerformanceStats();
    if (stats) {
      console.log(`Average execution time: ${stats.averageTime.toFixed(2)}ms`);
    }
  }

  public resetPerformance(): void {
    this.resetPerformanceData();
  }
}
```

## System Dependency Injection

Systems implement the `IService` interface and support obtaining other services or systems through dependency injection:

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
    // Use injected service
    this.collision.detectCollisions(entities);
  }

  // Implement IService interface dispose method
  public dispose(): void {
    // Clean up resources
  }
}

// Just pass the type when using, framework will auto-inject dependencies
class GameScene extends Scene {
  protected initialize(): void {
    // Automatic dependency injection
    this.addEntityProcessor(PhysicsSystem);
  }
}
```

Notes:
- Use `@Injectable()` decorator to mark systems that need dependency injection
- Use `@InjectProperty()` decorator to declare dependencies
- Systems must implement the `dispose()` method (IService interface requirement)
- Use `addEntityProcessor(Type)` instead of `addSystem(new Type())` to enable dependency injection
