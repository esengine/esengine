---
title: "Component System"
description: "ECS component basics and creation methods"
---

In ECS architecture, Components are carriers of data and behavior. Components define the properties and functionality that entities possess, and are the core building blocks of ECS architecture.

## Basic Concepts

Components are concrete classes that inherit from the `Component` abstract base class, used for:
- Storing entity data (such as position, velocity, health, etc.)
- Defining behavior methods related to the data
- Providing lifecycle callback hooks
- Supporting serialization and debugging

## Creating Components

### Basic Component Definition

```typescript
import { Component, ECSComponent } from '@esengine/ecs-framework';

@ECSComponent('Position')
class Position extends Component {
  x: number = 0;
  y: number = 0;

  constructor(x: number = 0, y: number = 0) {
    super();
    this.x = x;
    this.y = y;
  }
}

@ECSComponent('Health')
class Health extends Component {
  current: number;
  max: number;

  constructor(max: number = 100) {
    super();
    this.max = max;
    this.current = max;
  }

  // Components can contain behavior methods
  takeDamage(damage: number): void {
    this.current = Math.max(0, this.current - damage);
  }

  heal(amount: number): void {
    this.current = Math.min(this.max, this.current + amount);
  }

  isDead(): boolean {
    return this.current <= 0;
  }
}
```

## @ECSComponent Decorator

`@ECSComponent` is a required decorator for component classes, providing type identification and metadata management.

### Why It's Required

| Feature | Description |
|---------|-------------|
| **Type Identification** | Provides stable type name that remains correct after code obfuscation |
| **Serialization Support** | Uses this name as type identifier during serialization/deserialization |
| **Component Registration** | Auto-registers to ComponentRegistry, assigns unique bitmask |
| **Debug Support** | Shows readable component names in debug tools and logs |

### Basic Syntax

```typescript
@ECSComponent(typeName: string)
```

- `typeName`: Component's type name, recommended to use same or similar name as class name

### Usage Examples

```typescript
// ✅ Correct usage
@ECSComponent('Velocity')
class Velocity extends Component {
  dx: number = 0;
  dy: number = 0;
}

// ✅ Recommended: Keep type name consistent with class name
@ECSComponent('PlayerController')
class PlayerController extends Component {
  speed: number = 5;
}

// ❌ Wrong usage - no decorator
class BadComponent extends Component {
  // Components defined this way may have issues in production:
  // 1. Class name changes after minification, can't serialize correctly
  // 2. Component not registered to framework, queries may fail
}
```

### Using with @Serializable

When components need serialization support, use `@ECSComponent` and `@Serializable` together:

```typescript
import { Component, ECSComponent, Serializable, Serialize } from '@esengine/ecs-framework';

@ECSComponent('Player')
@Serializable({ version: 1 })
class PlayerComponent extends Component {
  @Serialize()
  name: string = '';

  @Serialize()
  level: number = 1;

  // Fields without @Serialize() won't be serialized
  private _cachedData: any = null;
}
```

> **Note**: `@ECSComponent`'s `typeName` and `@Serializable`'s `typeId` can differ. If `@Serializable` doesn't specify `typeId`, it defaults to `@ECSComponent`'s `typeName`.

### Type Name Uniqueness

Each component's type name should be unique:

```typescript
// ❌ Wrong: Two components using the same type name
@ECSComponent('Health')
class HealthComponent extends Component { }

@ECSComponent('Health')  // Conflict!
class EnemyHealthComponent extends Component { }

// ✅ Correct: Use different type names
@ECSComponent('PlayerHealth')
class PlayerHealthComponent extends Component { }

@ECSComponent('EnemyHealth')
class EnemyHealthComponent extends Component { }
```

## Component Properties

Each component has some built-in properties:

```typescript
@ECSComponent('ExampleComponent')
class ExampleComponent extends Component {
  someData: string = "example";

  onAddedToEntity(): void {
    console.log(`Component ID: ${this.id}`);        // Unique component ID
    console.log(`Entity ID: ${this.entityId}`);     // Owning entity's ID
  }
}
```

## Component and Entity Relationship

Components store the owning entity's ID (`entityId`), not a direct entity reference. This is a reflection of ECS's data-oriented design, avoiding circular references.

In practice, **entity and component interactions should be handled in Systems**, not within components:

```typescript
@ECSComponent('Health')
class Health extends Component {
  current: number;
  max: number;

  constructor(max: number = 100) {
    super();
    this.max = max;
    this.current = max;
  }

  isDead(): boolean {
    return this.current <= 0;
  }
}

@ECSComponent('Damage')
class Damage extends Component {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

// Recommended: Handle logic in System
class DamageSystem extends EntitySystem {
  constructor() {
    super(new Matcher().all(Health, Damage));
  }

  process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const health = entity.getComponent(Health)!;
      const damage = entity.getComponent(Damage)!;

      health.current -= damage.value;

      if (health.isDead()) {
        entity.destroy();
      }

      // Remove Damage component after applying damage
      entity.removeComponent(damage);
    }
  }
}
```

## More Topics

- [Lifecycle](/en/guide/component/lifecycle) - Component lifecycle hooks
- [EntityRef Decorator](/en/guide/component/entity-ref) - Safe entity references
- [Best Practices](/en/guide/component/best-practices) - Component design patterns and examples
