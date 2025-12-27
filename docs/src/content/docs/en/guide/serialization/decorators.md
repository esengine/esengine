---
title: "Decorators & Inheritance"
description: "Advanced serialization decorator usage and component inheritance"
---

## Advanced Decorators

### Field Serialization Options

```typescript
@ECSComponent('Advanced')
@Serializable({ version: 1 })
class AdvancedComponent extends Component {
  // Use alias
  @Serialize({ alias: 'playerName' })
  public name: string = '';

  // Custom serializer
  @Serialize({
    serializer: (value: Date) => value.toISOString(),
    deserializer: (value: string) => new Date(value)
  })
  public createdAt: Date = new Date();

  // Ignore serialization
  @IgnoreSerialization()
  public cachedData: any = null;
}
```

### Collection Type Serialization

```typescript
@ECSComponent('Collections')
@Serializable({ version: 1 })
class CollectionsComponent extends Component {
  // Map serialization
  @SerializeAsMap()
  public inventory: Map<string, number> = new Map();

  // Set serialization
  @SerializeAsSet()
  public acquiredSkills: Set<string> = new Set();

  constructor() {
    super();
    this.inventory.set('gold', 100);
    this.inventory.set('silver', 50);
    this.acquiredSkills.add('attack');
    this.acquiredSkills.add('defense');
  }
}
```

## Component Inheritance and Serialization

The framework fully supports component class inheritance. Subclasses automatically inherit parent class serialization fields while adding their own.

### Basic Inheritance

```typescript
// Base component
@ECSComponent('Collider2DBase')
@Serializable({ version: 1, typeId: 'Collider2DBase' })
abstract class Collider2DBase extends Component {
  @Serialize()
  public friction: number = 0.5;

  @Serialize()
  public restitution: number = 0.0;

  @Serialize()
  public isTrigger: boolean = false;
}

// Subclass component - automatically inherits parent's serialization fields
@ECSComponent('BoxCollider2D')
@Serializable({ version: 1, typeId: 'BoxCollider2D' })
class BoxCollider2DComponent extends Collider2DBase {
  @Serialize()
  public width: number = 1.0;

  @Serialize()
  public height: number = 1.0;
}

// Another subclass component
@ECSComponent('CircleCollider2D')
@Serializable({ version: 1, typeId: 'CircleCollider2D' })
class CircleCollider2DComponent extends Collider2DBase {
  @Serialize()
  public radius: number = 0.5;
}
```

### Inheritance Rules

1. **Field Inheritance**: Subclasses automatically inherit all `@Serialize()` marked fields from parent
2. **Independent Metadata**: Each subclass maintains independent serialization metadata; modifying subclass doesn't affect parent or other subclasses
3. **typeId Distinction**: Use `typeId` option to specify unique identifier for each class, ensuring correct component type recognition during deserialization

### Importance of Using typeId

When using component inheritance, it's **strongly recommended** to set a unique `typeId` for each class:

```typescript
// ✅ Recommended: Explicitly specify typeId
@Serializable({ version: 1, typeId: 'BoxCollider2D' })
class BoxCollider2DComponent extends Collider2DBase { }

@Serializable({ version: 1, typeId: 'CircleCollider2D' })
class CircleCollider2DComponent extends Collider2DBase { }

// ⚠️ Not recommended: Relying on class name as typeId
// Class names may change after code minification, causing deserialization failure
@Serializable({ version: 1 })
class BoxCollider2DComponent extends Collider2DBase { }
```

### Subclass Overriding Parent Fields

Subclasses can redeclare parent fields to modify their serialization options:

```typescript
@ECSComponent('SpecialCollider')
@Serializable({ version: 1, typeId: 'SpecialCollider' })
class SpecialColliderComponent extends Collider2DBase {
  // Override parent field with different alias
  @Serialize({ alias: 'fric' })
  public override friction: number = 0.8;

  @Serialize()
  public specialProperty: string = '';
}
```

### Ignoring Inherited Fields

Use `@IgnoreSerialization()` to ignore fields inherited from parent in subclass:

```typescript
@ECSComponent('TriggerOnly')
@Serializable({ version: 1, typeId: 'TriggerOnly' })
class TriggerOnlyCollider extends Collider2DBase {
  // Ignore parent's friction and restitution fields
  // Because Trigger doesn't need physics material properties
  @IgnoreSerialization()
  public override friction: number = 0;

  @IgnoreSerialization()
  public override restitution: number = 0;
}
```

## Decorator Reference

| Decorator | Description |
|-----------|-------------|
| `@Serializable({ version, typeId })` | Mark component as serializable |
| `@Serialize()` | Mark field as serializable |
| `@Serialize({ alias })` | Serialize field with alias |
| `@Serialize({ serializer, deserializer })` | Custom serialization logic |
| `@SerializeAsMap()` | Serialize Map type |
| `@SerializeAsSet()` | Serialize Set type |
| `@IgnoreSerialization()` | Ignore field serialization |
