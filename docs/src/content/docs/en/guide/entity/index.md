---
title: "Entity Overview"
description: "Basic concepts and usage of entities in ECS architecture"
---

In ECS architecture, an Entity is a fundamental object in the game world. Entities contain no game logic or data themselves—they are simply containers that combine different components to achieve various functionalities.

## Basic Concepts

An entity is a lightweight object primarily used for:
- Acting as a container for components
- Providing unique identifiers (ID and persistentId)
- Managing component lifecycles

:::tip[About Parent-Child Hierarchy]
Parent-child relationships between entities are managed through `HierarchyComponent` and `HierarchySystem`, not built-in Entity properties. This design follows ECS composition principles—only entities that need hierarchy relationships add this component.

See the [Hierarchy System](/en/guide/hierarchy/) documentation for details.
:::

## Creating Entities

**Entities must be created through the scene, not manually.**

```typescript
// Correct: Create entity through scene
const player = scene.createEntity("Player");

// ❌ Wrong: Manual creation
// const entity = new Entity("MyEntity", 1);
```

Creating through the scene ensures:
- Entity is properly added to the scene's entity management system
- Entity is added to the query system for use by systems
- Entity gets the correct scene reference
- Related lifecycle events are triggered

### Batch Creation

The framework provides high-performance batch creation:

```typescript
// Batch create 100 bullet entities
const bullets = scene.createEntities(100, "Bullet");

bullets.forEach((bullet, index) => {
    bullet.createComponent(Position, Math.random() * 800, Math.random() * 600);
    bullet.createComponent(Velocity, Math.random() * 100, Math.random() * 100);
});
```

`createEntities()` batches ID allocation, optimizes query system updates, and reduces system cache clearing.

## Entity Identifiers

Each entity has three types of identifiers:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Runtime unique identifier for fast lookups |
| `persistentId` | `string` | GUID for maintaining reference consistency during serialization |
| `handle` | `EntityHandle` | Lightweight handle, see [Entity Handle](/en/guide/entity/entity-handle/) |

```typescript
const entity = scene.createEntity("Player");

console.log(entity.id);           // 1
console.log(entity.persistentId); // "a1b2c3d4-..."
console.log(entity.handle);       // Numeric handle
```

## Entity Properties

### Name and Tag

```typescript
// Name - for debugging and lookup
entity.name = "Player";

// Tag - for fast categorization and querying
entity.tag = 1;  // Player tag
enemy.tag = 2;   // Enemy tag
```

### State Control

```typescript
// Enable/disable state
entity.enabled = false;

// Active state
entity.active = false;

// Update order (lower values have higher priority)
entity.updateOrder = 10;
```

## Finding Entities

The scene provides multiple ways to find entities:

```typescript
// Find by name
const player = scene.findEntity("Player");
// Or use alias
const player2 = scene.getEntityByName("Player");

// Find by ID
const entity = scene.findEntityById(123);

// Find all entities by tag
const enemies = scene.findEntitiesByTag(2);
// Or use alias
const allEnemies = scene.getEntitiesByTag(2);

// Find by handle
const entity = scene.findEntityByHandle(handle);
```

## Entity Events

Entity changes trigger events:

```typescript
// Listen for component additions
scene.eventSystem.on('component:added', (data) => {
    console.log(`${data.entityName} added ${data.componentType}`);
});

// Listen for component removals
scene.eventSystem.on('component:removed', (data) => {
    console.log(`${data.entityName} removed ${data.componentType}`);
});

// Listen for entity creation
scene.eventSystem.on('entity:created', (data) => {
    console.log(`Entity created: ${data.entityName}`);
});

// Listen for active state changes
scene.eventSystem.on('entity:activeChanged', (data) => {
    console.log(`${data.entity.name} active: ${data.active}`);
});
```

## Debugging

```typescript
// Get entity debug info
const debugInfo = entity.getDebugInfo();
console.log(debugInfo);
// {
//   name: "Player",
//   id: 1,
//   persistentId: "a1b2c3d4-...",
//   enabled: true,
//   active: true,
//   destroyed: false,
//   componentCount: 3,
//   componentTypes: ["Position", "Health", "Velocity"],
//   ...
// }

// Entity string representation
console.log(entity.toString());
// "Entity[Player:1:a1b2c3d4]"
```

## Next Steps

- [Component Operations](/en/guide/entity/component-operations/) - Add, get, and remove components
- [Entity Handle](/en/guide/entity/entity-handle/) - Safe entity reference method
- [Lifecycle](/en/guide/entity/lifecycle/) - Destruction and persistence
