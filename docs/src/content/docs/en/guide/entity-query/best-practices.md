---
title: "Best Practices"
description: "Entity query optimization and practical applications"
---

## Design Principles

### 1. Prefer EntitySystem

```typescript
// ✅ Recommended: Use EntitySystem
class GoodSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(HealthComponent));
    }

    protected process(entities: readonly Entity[]): void {
        // Automatically get matching entities, updated each frame
    }
}

// ❌ Not recommended: Manual query in update
class BadSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty());
    }

    protected process(entities: readonly Entity[]): void {
        // Manual query each frame wastes performance
        const result = this.scene!.querySystem.queryAll(HealthComponent);
        for (const entity of result.entities) {
            // ...
        }
    }
}
```

### 2. Use none() for Exclusions

```typescript
// Exclude dead enemies
class EnemyAISystem extends EntitySystem {
    constructor() {
        super(
            Matcher.empty()
                .all(EnemyTag, AIComponent)
                .none(DeadTag)  // Don't process dead enemies
        );
    }
}
```

### 3. Use Tags for Query Optimization

```typescript
// ❌ Bad: Query all entities then filter
const allEntities = scene.querySystem.getAllEntities();
const players = allEntities.filter(e => e.hasComponent(PlayerTag));

// ✅ Good: Query directly by tag
const players = scene.querySystem.queryByTag(Tags.PLAYER).entities;
```

### 4. Avoid Overly Complex Query Conditions

```typescript
// ❌ Not recommended: Too complex
super(
    Matcher.empty()
        .all(A, B, C, D)
        .any(E, F, G)
        .none(H, I, J)
);

// ✅ Recommended: Split into multiple simple systems
class SystemAB extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(A, B));
    }
}

class SystemCD extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(C, D));
    }
}
```

## Practical Applications

### Scenario 1: Physics System

```typescript
class PhysicsSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(TransformComponent, RigidbodyComponent));
    }

    protected process(entities: readonly Entity[]): void {
        for (const entity of entities) {
            const transform = entity.getComponent(TransformComponent)!;
            const rigidbody = entity.getComponent(RigidbodyComponent)!;

            // Apply gravity
            rigidbody.velocity.y -= 9.8 * Time.deltaTime;

            // Update position
            transform.position.x += rigidbody.velocity.x * Time.deltaTime;
            transform.position.y += rigidbody.velocity.y * Time.deltaTime;
        }
    }
}
```

### Scenario 2: Render System

```typescript
class RenderSystem extends EntitySystem {
    constructor() {
        super(
            Matcher.empty()
                .all(TransformComponent, SpriteComponent)
                .none(InvisibleTag)  // Exclude invisible entities
        );
    }

    protected process(entities: readonly Entity[]): void {
        // Sort by z-order
        const sorted = entities.slice().sort((a, b) => {
            const zA = a.getComponent(TransformComponent)!.z;
            const zB = b.getComponent(TransformComponent)!.z;
            return zA - zB;
        });

        // Render entities
        for (const entity of sorted) {
            const transform = entity.getComponent(TransformComponent)!;
            const sprite = entity.getComponent(SpriteComponent)!;

            renderer.drawSprite(sprite.texture, transform.position);
        }
    }
}
```

### Scenario 3: Collision Detection

```typescript
class CollisionSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(TransformComponent, ColliderComponent));
    }

    protected process(entities: readonly Entity[]): void {
        // Simple O(n²) collision detection
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                this.checkCollision(entities[i], entities[j]);
            }
        }
    }

    private checkCollision(a: Entity, b: Entity): void {
        const transA = a.getComponent(TransformComponent)!;
        const transB = b.getComponent(TransformComponent)!;
        const colliderA = a.getComponent(ColliderComponent)!;
        const colliderB = b.getComponent(ColliderComponent)!;

        if (this.isOverlapping(transA, colliderA, transB, colliderB)) {
            // Trigger collision event
            scene.eventSystem.emit('collision', { entityA: a, entityB: b });
        }
    }
}
```

### Scenario 4: One-Time Query

```typescript
// Execute one-time query outside of systems
class GameManager {
    private scene: Scene;

    public countEnemies(): number {
        const result = this.scene.querySystem.queryByTag(Tags.ENEMY);
        return result.count;
    }

    public findNearestEnemy(playerPos: Vector2): Entity | null {
        const enemies = this.scene.querySystem.queryByTag(Tags.ENEMY);

        let nearest: Entity | null = null;
        let minDistance = Infinity;

        for (const enemy of enemies.entities) {
            const transform = enemy.getComponent(TransformComponent);
            if (!transform) continue;

            const distance = Vector2.distance(playerPos, transform.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        }

        return nearest;
    }
}
```

## Performance Statistics

```typescript
const stats = querySystem.getStats();
console.log('Total queries:', stats.queryStats.totalQueries);
console.log('Cache hit rate:', stats.queryStats.cacheHitRate);
console.log('Cache size:', stats.cacheStats.size);
```

## Related APIs

- [Matcher](/api/classes/Matcher/) - Query condition descriptor API reference
- [QuerySystem](/api/classes/QuerySystem/) - Query system API reference
- [EntitySystem](/api/classes/EntitySystem/) - Entity system API reference
- [Entity](/api/classes/Entity/) - Entity API reference
