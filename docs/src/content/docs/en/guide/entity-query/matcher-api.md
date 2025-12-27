---
title: "Matcher API"
description: "Complete Matcher API reference"
---

## Static Creation Methods

| Method | Description | Example |
|--------|-------------|---------|
| `Matcher.all(...types)` | Must include all specified components | `Matcher.all(Position, Velocity)` |
| `Matcher.any(...types)` | Include at least one specified component | `Matcher.any(Health, Shield)` |
| `Matcher.none(...types)` | Must not include any specified components | `Matcher.none(Dead)` |
| `Matcher.byTag(tag)` | Query by tag | `Matcher.byTag(1)` |
| `Matcher.byName(name)` | Query by name | `Matcher.byName("Player")` |
| `Matcher.byComponent(type)` | Query by single component | `Matcher.byComponent(Health)` |
| `Matcher.empty()` | Create empty matcher (matches all entities) | `Matcher.empty()` |
| `Matcher.nothing()` | Match no entities | `Matcher.nothing()` |
| `Matcher.complex()` | Create complex query builder | `Matcher.complex()` |

## Chainable Methods

| Method | Description | Example |
|--------|-------------|---------|
| `.all(...types)` | Add required components | `.all(Position)` |
| `.any(...types)` | Add optional components (at least one) | `.any(Weapon, Magic)` |
| `.none(...types)` | Add excluded components | `.none(Dead)` |
| `.exclude(...types)` | Alias for `.none()` | `.exclude(Disabled)` |
| `.one(...types)` | Alias for `.any()` | `.one(Player, Enemy)` |
| `.withTag(tag)` | Add tag condition | `.withTag(1)` |
| `.withName(name)` | Add name condition | `.withName("Boss")` |
| `.withComponent(type)` | Add single component condition | `.withComponent(Health)` |

## Utility Methods

| Method | Description |
|--------|-------------|
| `.getCondition()` | Get query condition (read-only) |
| `.isEmpty()` | Check if empty condition |
| `.isNothing()` | Check if nothing matcher |
| `.clone()` | Clone matcher |
| `.reset()` | Reset all conditions |
| `.toString()` | Get string representation |

## Common Combination Examples

```typescript
// Basic movement system
Matcher.all(Position, Velocity)

// Attackable living entities
Matcher.all(Position, Health)
    .any(Weapon, Magic)
    .none(Dead, Disabled)

// All tagged enemies
Matcher.byTag(Tags.ENEMY)
    .all(AIComponent)

// System only needing lifecycle
Matcher.nothing()
```

## Query by Tag

```typescript
class PlayerSystem extends EntitySystem {
    constructor() {
        // Query entities with specific tag
        super(Matcher.empty().withTag(Tags.PLAYER));
    }

    protected process(entities: readonly Entity[]): void {
        // Only process player entities
    }
}
```

## Query by Name

```typescript
class BossSystem extends EntitySystem {
    constructor() {
        // Query entities with specific name
        super(Matcher.empty().withName('Boss'));
    }

    protected process(entities: readonly Entity[]): void {
        // Only process entities named 'Boss'
    }
}
```

## Important Notes

### Matcher is Immutable

```typescript
const matcher = Matcher.empty().all(PositionComponent);

// Chain calls return new Matcher instances
const matcher2 = matcher.any(VelocityComponent);

// Original matcher unchanged
console.log(matcher === matcher2); // false
```

### Query Results are Read-Only

```typescript
const result = querySystem.queryAll(PositionComponent);

// Don't modify returned array
result.entities.push(someEntity);  // Wrong!

// If modification needed, copy first
const mutableArray = [...result.entities];
mutableArray.push(someEntity);  // Correct
```
