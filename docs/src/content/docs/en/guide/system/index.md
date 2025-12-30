---
title: "System Architecture"
description: "ECS System Overview and Basic Concepts"
---

In ECS architecture, Systems are where business logic is processed. Systems are responsible for performing operations on entities that have specific component combinations, serving as the logic processing units of ECS architecture.

## Basic Concepts

Systems are concrete classes that inherit from the `EntitySystem` abstract base class, used for:
- Defining entity processing logic (such as movement, collision detection, rendering, etc.)
- Filtering entities based on component combinations
- Providing lifecycle management and performance monitoring
- Managing entity add/remove events

## Quick Example

```typescript
import { EntitySystem, ECSSystem, Matcher } from '@esengine/ecs-framework';

@ECSSystem('Movement')
class MovementSystem extends EntitySystem {
  constructor() {
    // Use Matcher to define entity conditions to process
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

## System Properties and Methods

### Important Properties

```typescript
@ECSSystem('Example')
class ExampleSystem extends EntitySystem {
  showSystemInfo(): void {
    console.log(`System name: ${this.systemName}`);        // System name
    console.log(`Update order: ${this.updateOrder}`);      // Update order
    console.log(`Is enabled: ${this.enabled}`);            // Enabled state
    console.log(`Entity count: ${this.entities.length}`);  // Number of matched entities
    console.log(`Scene: ${this.scene?.name}`);             // Parent scene
  }
}
```

### Entity Access

```typescript
protected process(entities: readonly Entity[]): void {
  // Method 1: Use entity list from parameter
  for (const entity of entities) {
    // Process entity
  }

  // Method 2: Use this.entities property (same as parameter)
  for (const entity of this.entities) {
    // Process entity
  }
}
```

### Controlling System Execution

```typescript
@ECSSystem('Conditional')
class ConditionalSystem extends EntitySystem {
  private shouldProcess = true;

  protected onCheckProcessing(): boolean {
    // Return false to skip this processing
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

## System Management

### Adding Systems to Scene

The framework provides two ways to add systems: pass an instance or pass a type (automatic dependency injection).

```typescript
// Add systems in scene subclass
class GameScene extends Scene {
  protected initialize(): void {
    // Method 1: Pass instance
    this.addSystem(new MovementSystem());
    this.addSystem(new RenderSystem());

    // Method 2: Pass type (automatic dependency injection)
    this.addEntityProcessor(PhysicsSystem);

    // Set system update order
    const movementSystem = this.getSystem(MovementSystem);
    if (movementSystem) {
      movementSystem.updateOrder = 1;
    }
  }
}
```

### System Update Order

System execution order is determined by the `updateOrder` property. Lower values execute first:

```typescript
@ECSSystem('Input')
class InputSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(InputComponent));
    this.updateOrder = -100; // Input system executes first
  }
}

@ECSSystem('Physics')
class PhysicsSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(RigidBody));
    this.updateOrder = 0; // Default order
  }
}

@ECSSystem('Render')
class RenderSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Sprite, Transform));
    this.updateOrder = 100; // Render system executes last
  }
}
```

#### Stable Sorting: addOrder

When multiple systems have the same `updateOrder`, the framework uses `addOrder` (add order) as a secondary sorting criterion:

```typescript
// Both systems have default updateOrder of 0
scene.addSystem(new SystemA()); // addOrder = 0, executes first
scene.addSystem(new SystemB()); // addOrder = 1, executes second
```

## Runtime Environment Decorators

For networked games, you can use decorators to control which environment a system method runs in.

### Available Decorators

| Decorator | Effect |
|-----------|--------|
| `@ServerOnly()` | Method only executes on server |
| `@ClientOnly()` | Method only executes on client |
| `@NotServer()` | Method skipped on server |
| `@NotClient()` | Method skipped on client |

### Usage Example

```typescript
import { EntitySystem, ServerOnly, ClientOnly } from '@esengine/ecs-framework';

class GameSystem extends EntitySystem {
  @ServerOnly()
  private spawnEnemies(): void {
    // Only runs on server - authoritative spawn logic
  }

  @ClientOnly()
  private playEffects(): void {
    // Only runs on client - visual effects
  }
}
```

### Simple Conditional Check

For simple cases, a direct check is often clearer than decorators:

```typescript
class CollectibleSystem extends EntitySystem {
  private checkCollections(): void {
    if (!this.scene.isServer) return;  // Skip on client

    // Server-authoritative logic...
  }
}
```

See [Scene Runtime Environment](/en/guide/scene/index#runtime-environment) for configuration details.

## Next Steps

- [System Types](/en/guide/system/types) - Learn about different system base classes
- [System Lifecycle](/en/guide/system/lifecycle) - Lifecycle callbacks and event listening
- [Command Buffer](/en/guide/system/command-buffer) - Deferred entity operations
- [System Scheduling](/en/guide/system/scheduling) - Declarative system scheduling
- [Change Detection](/en/guide/system/change-detection) - Frame-level change detection optimization
- [Best Practices](/en/guide/system/best-practices) - System design best practices
