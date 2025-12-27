---
title: "Entity Management"
description: "Entity creation, finding and destruction in scenes"
---

Scene provides complete entity management APIs for creating, finding, and destroying entities.

## Creating Entities

### Single Entity

```typescript
class EntityScene extends Scene {
  createGameEntities(): void {
    // Create named entity
    const player = this.createEntity("Player");
    player.addComponent(new Position(400, 300));
    player.addComponent(new Health(100));
  }
}
```

### Batch Creation

```typescript
class EntityScene extends Scene {
  createBullets(): void {
    // Batch create entities (high performance)
    const bullets = this.createEntities(100, "Bullet");

    // Add components to batch-created entities
    bullets.forEach((bullet, index) => {
      bullet.addComponent(new Position(index * 10, 100));
      bullet.addComponent(new Velocity(Math.random() * 200 - 100, -300));
    });
  }
}
```

## Finding Entities

### By Name

```typescript
// Find by name (returns first match)
const player = this.findEntity("Player");
const player2 = this.getEntityByName("Player"); // Alias

if (player) {
  console.log(`Found player: ${player.name}`);
}
```

### By ID

```typescript
// Find by unique ID
const entity = this.findEntityById(123);

if (entity) {
  console.log(`Found entity: ${entity.id}`);
}
```

### By Tag

```typescript
// Find by tag (returns array)
const enemies = this.findEntitiesByTag(2);
const enemies2 = this.getEntitiesByTag(2); // Alias

console.log(`Found ${enemies.length} enemies`);
```

## Destroying Entities

### Single Entity

```typescript
const enemy = this.findEntity("Enemy_1");
if (enemy) {
  enemy.destroy(); // Entity is automatically removed from scene
}
```

### All Entities

```typescript
// Destroy all entities in scene
this.destroyAllEntities();
```

## Entity Queries

Scene provides a component query system:

```typescript
class QueryScene extends Scene {
  protected initialize(): void {
    // Create test entities
    for (let i = 0; i < 10; i++) {
      const entity = this.createEntity(`Entity_${i}`);
      entity.addComponent(new Transform(i * 10, 0));
      entity.addComponent(new Velocity(1, 0));
    }
  }

  public queryEntities(): void {
    // Query through QuerySystem
    const entities = this.querySystem.query([Transform, Velocity]);
    console.log(`Found ${entities.length} entities with Transform and Velocity`);
  }
}
```

## API Reference

| Method | Returns | Description |
|--------|---------|-------------|
| `createEntity(name)` | `Entity` | Create single entity |
| `createEntities(count, prefix)` | `Entity[]` | Batch create entities |
| `findEntity(name)` | `Entity \| undefined` | Find by name |
| `findEntityById(id)` | `Entity \| undefined` | Find by ID |
| `findEntitiesByTag(tag)` | `Entity[]` | Find by tag |
| `destroyAllEntities()` | `void` | Destroy all entities |
