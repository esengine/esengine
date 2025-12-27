---
title: "System Scheduling"
description: "Declarative system scheduling and execution stages"
---

> **v2.4.0+**

In addition to manually controlling execution order with `updateOrder`, the framework provides a declarative system scheduling mechanism that lets you define execution order through dependencies.

## Scheduling Decorators

```typescript
import { EntitySystem, ECSSystem, Stage, Before, After, InSet } from '@esengine/ecs-framework';

// Use decorators to declare system scheduling
@ECSSystem('Movement')
@Stage('update')           // Execute in update stage
@After('InputSystem')      // Execute after InputSystem
@Before('RenderSystem')    // Execute before RenderSystem
class MovementSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Position, Velocity));
    }

    protected process(entities: readonly Entity[]): void {
        // Movement logic
    }
}

// Use system sets for grouping
@ECSSystem('Physics')
@Stage('update')
@InSet('CoreSystems')      // Belongs to CoreSystems set
class PhysicsSystem extends EntitySystem {
    // ...
}

@ECSSystem('Collision')
@Stage('update')
@After('set:CoreSystems')  // Execute after all systems in CoreSystems set
class CollisionSystem extends EntitySystem {
    // ...
}
```

## System Execution Stages

The framework defines the following system execution stages, executed in order:

| Stage | Description | Typical Usage |
|-------|-------------|---------------|
| `startup` | Startup stage | One-time initialization |
| `preUpdate` | Pre-update stage | Input handling, state preparation |
| `update` | Main update stage (default) | Core game logic |
| `postUpdate` | Post-update stage | Physics, collision detection |
| `cleanup` | Cleanup stage | Resource cleanup, state reset |

### Stage Usage Example

```typescript
@ECSSystem('Input')
@Stage('preUpdate')  // Handle input in pre-update stage
class InputSystem extends EntitySystem {
    protected process(entities: readonly Entity[]): void {
        // Read input, update input components
    }
}

@ECSSystem('Movement')
@Stage('update')  // Handle movement in main update stage
class MovementSystem extends EntitySystem {
    protected process(entities: readonly Entity[]): void {
        // Move entities based on input
    }
}

@ECSSystem('Physics')
@Stage('postUpdate')  // Handle physics in post-update stage
class PhysicsSystem extends EntitySystem {
    protected process(entities: readonly Entity[]): void {
        // Physics simulation and collision detection
    }
}

@ECSSystem('Cleanup')
@Stage('cleanup')  // Reset state in cleanup stage
class CleanupSystem extends EntitySystem {
    protected process(entities: readonly Entity[]): void {
        // Clean up temporary data
    }
}
```

## Fluent API Configuration

If you prefer not to use decorators, you can configure scheduling at runtime using the Fluent API:

```typescript
@ECSSystem('Movement')
class MovementSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Position, Velocity));

        // Configure scheduling using Fluent API
        this.stage('update')
            .after('InputSystem')
            .before('RenderSystem')
            .inSet('CoreSystems');
    }
}
```

## System Sets

System sets allow you to group related systems, then define dependencies based on the entire set:

```typescript
// Define core systems set
@ECSSystem('Movement')
@InSet('CoreSystems')
class MovementSystem extends EntitySystem { }

@ECSSystem('Physics')
@InSet('CoreSystems')
class PhysicsSystem extends EntitySystem { }

@ECSSystem('AI')
@InSet('CoreSystems')
class AISystem extends EntitySystem { }

// Execute after core systems set
@ECSSystem('Render')
@After('set:CoreSystems')
class RenderSystem extends EntitySystem { }

// Execute before core systems set
@ECSSystem('Input')
@Before('set:CoreSystems')
class InputSystem extends EntitySystem { }
```

## Cycle Dependency Detection

The framework automatically detects cyclic dependencies and throws clear errors:

```typescript
// This will cause a cycle dependency error
@ECSSystem('SystemA')
@Before('SystemB')
class SystemA extends EntitySystem { }

@ECSSystem('SystemB')
@Before('SystemA')  // Error: A -> B -> A forms a cycle
class SystemB extends EntitySystem { }

// Error message: Cyclic dependency detected: SystemA -> SystemB -> SystemA
```

## Scheduling Decorator Reference

| Decorator | Description | Example |
|-----------|-------------|---------|
| `@Stage(name)` | Specify execution stage | `@Stage('update')` |
| `@Before(system)` | Execute before specified system | `@Before('RenderSystem')` |
| `@After(system)` | Execute after specified system | `@After('InputSystem')` |
| `@InSet(name)` | Join system set | `@InSet('CoreSystems')` |
| `@Before('set:name')` | Execute before set | `@Before('set:UI')` |
| `@After('set:name')` | Execute after set | `@After('set:Physics')` |

## updateOrder vs Declarative Scheduling

| Feature | updateOrder | Declarative Scheduling |
|---------|-------------|------------------------|
| Configuration | Manually set values | Declare dependencies |
| Readability | Need to remember value meanings | Directly express intent |
| Cycle detection | None | Automatic |
| Refactor-friendly | Manually adjust values | Auto-handles ordering |
| Use case | Simple projects | Complex dependencies |

:::tip
For small projects, `updateOrder` is sufficient. When system count increases and dependencies become complex, declarative scheduling is recommended.
:::
