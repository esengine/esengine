---
title: "EntityRef Decorator"
description: "Safe entity reference tracking mechanism"
---

The framework provides the `@EntityRef` decorator for **special scenarios** to safely store entity references. This is an advanced feature; storing IDs is recommended for most cases.

## When Do You Need EntityRef?

`@EntityRef` can simplify code in these scenarios:

1. **Parent-Child Relationships**: Need to directly access parent or child entities in components
2. **Complex Associations**: Multiple reference relationships between entities
3. **Frequent Access**: Need to access referenced entity in multiple places, ID lookup has performance overhead

## Core Features

The `@EntityRef` decorator automatically tracks references through **ReferenceTracker**:

- When the referenced entity is destroyed, all `@EntityRef` properties pointing to it are automatically set to `null`
- Prevents cross-scene references (outputs warning and refuses to set)
- Prevents references to destroyed entities (outputs warning and sets to `null`)
- Uses WeakRef to avoid memory leaks (automatic GC support)
- Automatically cleans up reference registration when component is removed

## Basic Usage

```typescript
import { Component, ECSComponent, EntityRef, Entity } from '@esengine/ecs-framework';

@ECSComponent('Parent')
class ParentComponent extends Component {
  @EntityRef()
  parent: Entity | null = null;
}

// Usage example
const scene = new Scene();
const parent = scene.createEntity('Parent');
const child = scene.createEntity('Child');

const comp = child.addComponent(new ParentComponent());
comp.parent = parent;

console.log(comp.parent); // Entity { name: 'Parent' }

// When parent is destroyed, comp.parent automatically becomes null
parent.destroy();
console.log(comp.parent); // null
```

## Multiple Reference Properties

A component can have multiple `@EntityRef` properties:

```typescript
@ECSComponent('Combat')
class CombatComponent extends Component {
  @EntityRef()
  target: Entity | null = null;

  @EntityRef()
  ally: Entity | null = null;

  @EntityRef()
  lastAttacker: Entity | null = null;
}

// Usage example
const player = scene.createEntity('Player');
const enemy = scene.createEntity('Enemy');
const npc = scene.createEntity('NPC');

const combat = player.addComponent(new CombatComponent());
combat.target = enemy;
combat.ally = npc;

// After enemy is destroyed, only target becomes null, ally remains valid
enemy.destroy();
console.log(combat.target); // null
console.log(combat.ally);   // Entity { name: 'NPC' }
```

## Safety Checks

`@EntityRef` provides multiple safety checks:

```typescript
const scene1 = new Scene();
const scene2 = new Scene();

const entity1 = scene1.createEntity('Entity1');
const entity2 = scene2.createEntity('Entity2');

const comp = entity1.addComponent(new ParentComponent());

// Cross-scene reference fails
comp.parent = entity2; // Outputs error log, comp.parent is null
console.log(comp.parent); // null

// Reference to destroyed entity fails
const entity3 = scene1.createEntity('Entity3');
entity3.destroy();
comp.parent = entity3; // Outputs warning log, comp.parent is null
console.log(comp.parent); // null
```

## Implementation Principle

`@EntityRef` uses the following mechanisms for automatic reference tracking:

1. **ReferenceTracker**: Scene holds a reference tracker that records all entity reference relationships
2. **WeakRef**: Uses weak references to store components, avoiding memory leaks from circular references
3. **Property Interception**: Intercepts getter/setter through `Object.defineProperty`
4. **Automatic Cleanup**: When entity is destroyed, ReferenceTracker traverses all references and sets them to null

```typescript
// Simplified implementation principle
class ReferenceTracker {
  // entityId -> all component records referencing this entity
  private _references: Map<number, Set<{ component: WeakRef<Component>, propertyKey: string }>>;

  // Called when entity is destroyed
  clearReferencesTo(entityId: number): void {
    const records = this._references.get(entityId);
    if (records) {
      for (const record of records) {
        const component = record.component.deref();
        if (component) {
          // Set component's reference property to null
          (component as any)[record.propertyKey] = null;
        }
      }
      this._references.delete(entityId);
    }
  }
}
```

## Performance Considerations

`@EntityRef` introduces some performance overhead:

- **Write Overhead**: Need to update ReferenceTracker each time a reference is set
- **Memory Overhead**: ReferenceTracker needs to maintain reference mapping table
- **Destroy Overhead**: Need to traverse all references and clean up when entity is destroyed

For most scenarios, this overhead is acceptable. But with **many entities and frequent reference changes**, storing IDs may be more efficient.

## Debug Support

ReferenceTracker provides debug interfaces:

```typescript
// View which components reference an entity
const references = scene.referenceTracker.getReferencesTo(entity.id);
console.log(`Entity ${entity.name} is referenced by ${references.length} components`);

// Get complete debug info
const debugInfo = scene.referenceTracker.getDebugInfo();
console.log(debugInfo);
```

## Comparison with Storing IDs

### Storing IDs (Recommended for Most Cases)

```typescript
@ECSComponent('Follower')
class Follower extends Component {
  targetId: number | null = null;
}

// Look up in System
class FollowerSystem extends EntitySystem {
  process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const follower = entity.getComponent(Follower)!;
      const target = entity.scene?.findEntityById(follower.targetId);
      if (target) {
        // Follow logic
      }
    }
  }
}
```

### Using EntityRef (For Complex Associations)

```typescript
@ECSComponent('Transform')
class Transform extends Component {
  @EntityRef()
  parent: Entity | null = null;

  position: { x: number, y: number } = { x: 0, y: 0 };

  // Can directly access parent entity's component
  getWorldPosition(): { x: number, y: number } {
    if (!this.parent) {
      return { ...this.position };
    }

    const parentTransform = this.parent.getComponent(Transform);
    if (parentTransform) {
      const parentPos = parentTransform.getWorldPosition();
      return {
        x: parentPos.x + this.position.x,
        y: parentPos.y + this.position.y
      };
    }

    return { ...this.position };
  }
}
```

## Summary

| Approach | Use Case | Pros | Cons |
|----------|----------|------|------|
| Store ID | Most cases | Simple, no extra overhead | Need to lookup in System |
| @EntityRef | Parent-child, complex associations | Auto-cleanup, cleaner code | Has performance overhead |

- **Recommended**: Use store ID + System lookup for most cases
- **EntityRef Use Cases**: Parent-child relationships, complex associations, when component needs direct access to referenced entity
- **Core Advantage**: Automatic cleanup, prevents dangling references, cleaner code
- **Considerations**: Has performance overhead, not suitable for many dynamic references
