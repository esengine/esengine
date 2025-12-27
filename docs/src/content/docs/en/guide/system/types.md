---
title: "System Types"
description: "EntitySystem, ProcessingSystem, PassiveSystem, IntervalSystem and other base classes"
---

The framework provides several different system base classes for different use cases.

## EntitySystem - Base System

The most basic system class, all other systems inherit from it:

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

## ProcessingSystem - Processing System

Suitable for systems that don't need to process entities individually:

```typescript
@ECSSystem('Physics')
class PhysicsSystem extends ProcessingSystem {
  constructor() {
    super(); // No Matcher needed
  }

  public processSystem(): void {
    // Execute physics world step
    this.physicsWorld.step(Time.deltaTime);
  }
}
```

## PassiveSystem - Passive System

Passive systems don't actively process, mainly used for listening to entity add and remove events:

```typescript
@ECSSystem('EntityTracker')
class EntityTrackerSystem extends PassiveSystem {
  constructor() {
    super(Matcher.all(Health));
  }

  protected onAdded(entity: Entity): void {
    console.log(`Health entity added: ${entity.name}`);
  }

  protected onRemoved(entity: Entity): void {
    console.log(`Health entity removed: ${entity.name}`);
  }
}
```

## IntervalSystem - Interval System

Systems that execute at fixed time intervals:

```typescript
@ECSSystem('AutoSave')
class AutoSaveSystem extends IntervalSystem {
  constructor() {
    // Execute every 5 seconds
    super(5.0, Matcher.all(SaveData));
  }

  protected process(entities: readonly Entity[]): void {
    console.log('Executing auto save...');
    // Save game data
    this.saveGameData(entities);
  }

  private saveGameData(entities: readonly Entity[]): void {
    // Save logic
  }
}
```

## WorkerEntitySystem - Multi-threaded System

A Web Worker-based multi-threaded processing system, suitable for compute-intensive tasks, capable of fully utilizing multi-core CPU performance.

Worker systems provide true parallel computing capabilities, support SharedArrayBuffer optimization, and have automatic fallback support. Particularly suitable for physics simulation, particle systems, AI computation, and similar scenarios.

**For detailed content, please refer to: [Worker System](/en/guide/worker-system)**

## Entity Matcher

Matcher is used to define which entities a system needs to process. It provides flexible condition combinations:

### Basic Match Conditions

```typescript
// Must have both Position and Velocity components
const matcher1 = Matcher.all(Position, Velocity);

// Must have at least one of Health or Shield components
const matcher2 = Matcher.any(Health, Shield);

// Must not have Dead component
const matcher3 = Matcher.none(Dead);
```

### Compound Match Conditions

```typescript
// Complex combination conditions
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

### Special Match Conditions

```typescript
// Match by tag
const tagMatcher = Matcher.byTag(1); // Match entities with tag 1

// Match by name
const nameMatcher = Matcher.byName("Player"); // Match entities named "Player"

// Single component match
const componentMatcher = Matcher.byComponent(Health); // Match entities with Health component

// Match no entities
const nothingMatcher = Matcher.nothing(); // For systems that only need lifecycle callbacks
```

### Empty Matcher vs Nothing Matcher

```typescript
// empty() - Empty condition, matches all entities
const emptyMatcher = Matcher.empty();

// nothing() - Matches no entities, for systems that only need lifecycle methods
const nothingMatcher = Matcher.nothing();

// Use case: Systems that only need onBegin/onEnd lifecycle
@ECSSystem('FrameTimer')
class FrameTimerSystem extends EntitySystem {
  constructor() {
    super(Matcher.nothing()); // Process no entities
  }

  protected onBegin(): void {
    // Execute at the start of each frame
    console.log('Frame started');
  }

  protected process(entities: readonly Entity[]): void {
    // Never called because there are no matching entities
  }

  protected onEnd(): void {
    // Execute at the end of each frame
    console.log('Frame ended');
  }
}
```

:::tip
For more details on Matcher and entity queries, please refer to the [Entity Query System](/en/guide/entity-query) documentation.
:::

## System Type Selection Guide

| System Type | Use Case |
|-------------|----------|
| `EntitySystem` | General system that processes matched entities one by one |
| `ProcessingSystem` | No entity list needed, only executes global logic |
| `PassiveSystem` | Only listens for entity add/remove events |
| `IntervalSystem` | Executes at fixed time intervals |
| `WorkerEntitySystem` | Compute-intensive tasks requiring multi-threading |
