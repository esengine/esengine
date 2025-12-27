---
title: "Entity Query System"
description: "ECS entity query core concepts and basic usage"
---

Entity querying is one of the core features of ECS architecture. This guide introduces how to use Matcher and QuerySystem to query and filter entities.

## Core Concepts

### Matcher - Query Condition Descriptor

Matcher is a chainable API used to describe entity query conditions. It doesn't execute queries itself but passes conditions to EntitySystem or QuerySystem.

### QuerySystem - Query Execution Engine

QuerySystem is responsible for actually executing queries, using reactive query mechanisms internally for automatic performance optimization.

## Using Matcher in EntitySystem

This is the most common usage. EntitySystem automatically filters and processes entities matching conditions through Matcher.

### Basic Usage

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
        // Method 1: Use Matcher.empty().all()
        super(Matcher.empty().all(PositionComponent, VelocityComponent));

        // Method 2: Use Matcher.all() directly (equivalent)
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

// Add to scene
scene.addEntityProcessor(new MovementSystem());
```

### Matcher Chainable API

#### all() - Must Include All Components

```typescript
class HealthSystem extends EntitySystem {
    constructor() {
        // Entity must have both Health and Position components
        super(Matcher.empty().all(HealthComponent, PositionComponent));
    }

    protected process(entities: readonly Entity[]): void {
        // Only process entities with both components
    }
}
```

#### any() - Include At Least One Component

```typescript
class DamageableSystem extends EntitySystem {
    constructor() {
        // Entity must have at least Health or Shield
        super(Matcher.any(HealthComponent, ShieldComponent));
    }

    protected process(entities: readonly Entity[]): void {
        // Process entities with health or shield
    }
}
```

#### none() - Must Not Include Components

```typescript
class AliveEntitySystem extends EntitySystem {
    constructor() {
        // Entity must not have DeadTag component
        super(Matcher.all(HealthComponent).none(DeadTag));
    }

    protected process(entities: readonly Entity[]): void {
        // Only process living entities
    }
}
```

#### Combined Conditions

```typescript
class CombatSystem extends EntitySystem {
    constructor() {
        super(
            Matcher.empty()
                .all(PositionComponent, HealthComponent)  // Must have position and health
                .any(WeaponComponent, MagicComponent)      // At least weapon or magic
                .none(DeadTag, FrozenTag)                  // Not dead or frozen
        );
    }

    protected process(entities: readonly Entity[]): void {
        // Process living entities that can fight
    }
}
```

#### nothing() - Match No Entities

Used for systems that only need lifecycle methods (`onBegin`, `onEnd`) but don't process entities.

```typescript
class FrameTimerSystem extends EntitySystem {
    constructor() {
        // Match no entities
        super(Matcher.nothing());
    }

    protected onBegin(): void {
        // Execute at frame start
        Performance.markFrameStart();
    }

    protected process(entities: readonly Entity[]): void {
        // Never called because no matching entities
    }

    protected onEnd(): void {
        // Execute at frame end
        Performance.markFrameEnd();
    }
}
```

#### empty() vs nothing()

| Method | Behavior | Use Case |
|--------|----------|----------|
| `Matcher.empty()` | Match **all** entities | Process all entities in scene |
| `Matcher.nothing()` | Match **no** entities | Only need lifecycle callbacks |

## Using QuerySystem Directly

If you don't need to create a system, you can use Scene's querySystem directly.

### Basic Query Methods

```typescript
// Get scene's query system
const querySystem = scene.querySystem;

// Query entities with all specified components
const result1 = querySystem.queryAll(PositionComponent, VelocityComponent);
console.log(`Found ${result1.count} moving entities`);
console.log(`Query time: ${result1.executionTime.toFixed(2)}ms`);

// Query entities with any specified component
const result2 = querySystem.queryAny(WeaponComponent, MagicComponent);
console.log(`Found ${result2.count} combat units`);

// Query entities without specified components
const result3 = querySystem.queryNone(DeadTag);
console.log(`Found ${result3.count} living entities`);
```

### Query by Tag and Name

```typescript
// Query by tag
const playerResult = querySystem.queryByTag(Tags.PLAYER);
for (const player of playerResult.entities) {
    console.log('Player:', player.name);
}

// Query by name
const bossResult = querySystem.queryByName('Boss');
if (bossResult.count > 0) {
    const boss = bossResult.entities[0];
    console.log('Found Boss:', boss);
}

// Query by single component
const healthResult = querySystem.queryByComponent(HealthComponent);
console.log(`${healthResult.count} entities have health`);
```

## Performance Optimization

### Automatic Caching

QuerySystem uses reactive queries internally with automatic caching:

```typescript
// First query, executes actual query
const result1 = querySystem.queryAll(PositionComponent);
console.log('fromCache:', result1.fromCache); // false

// Second same query, uses cache
const result2 = querySystem.queryAll(PositionComponent);
console.log('fromCache:', result2.fromCache); // true
```

### Automatic Updates on Entity Changes

Query cache updates automatically when entities add/remove components:

```typescript
// Query entities with weapons
const before = querySystem.queryAll(WeaponComponent);
console.log('Before:', before.count); // Assume 5

// Add weapon to entity
const enemy = scene.createEntity('Enemy');
enemy.addComponent(new WeaponComponent());

// Query again, automatically includes new entity
const after = querySystem.queryAll(WeaponComponent);
console.log('After:', after.count); // Now 6
```

## More Topics

- [Matcher API](/en/guide/entity-query/matcher-api) - Complete Matcher API reference
- [Compiled Query](/en/guide/entity-query/compiled-query) - CompiledQuery advanced usage
- [Best Practices](/en/guide/entity-query/best-practices) - Query optimization and practical applications
