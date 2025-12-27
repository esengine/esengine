---
title: "最佳实践"
description: "实体查询优化和实际应用场景"
---

## 设计原则

### 1. 优先使用 EntitySystem

```typescript
// ✅ 推荐: 使用 EntitySystem
class GoodSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(HealthComponent));
    }

    protected process(entities: readonly Entity[]): void {
        // 自动获得符合条件的实体，每帧自动更新
    }
}

// ❌ 不推荐: 在 update 中手动查询
class BadSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty());
    }

    protected process(entities: readonly Entity[]): void {
        // 每帧手动查询，浪费性能
        const result = this.scene!.querySystem.queryAll(HealthComponent);
        for (const entity of result.entities) {
            // ...
        }
    }
}
```

### 2. 合理使用 none() 排除条件

```typescript
// 排除已死亡的敌人
class EnemyAISystem extends EntitySystem {
    constructor() {
        super(
            Matcher.empty()
                .all(EnemyTag, AIComponent)
                .none(DeadTag)  // 不处理死亡的敌人
        );
    }
}
```

### 3. 使用标签优化查询

```typescript
// ❌ 不好: 查询所有实体再过滤
const allEntities = scene.querySystem.getAllEntities();
const players = allEntities.filter(e => e.hasComponent(PlayerTag));

// ✅ 好: 直接按标签查询
const players = scene.querySystem.queryByTag(Tags.PLAYER).entities;
```

### 4. 避免过于复杂的查询条件

```typescript
// ❌ 不推荐: 过于复杂
super(
    Matcher.empty()
        .all(A, B, C, D)
        .any(E, F, G)
        .none(H, I, J)
);

// ✅ 推荐: 拆分成多个简单系统
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

## 实际应用场景

### 场景1: 物理系统

```typescript
class PhysicsSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(TransformComponent, RigidbodyComponent));
    }

    protected process(entities: readonly Entity[]): void {
        for (const entity of entities) {
            const transform = entity.getComponent(TransformComponent)!;
            const rigidbody = entity.getComponent(RigidbodyComponent)!;

            // 应用重力
            rigidbody.velocity.y -= 9.8 * Time.deltaTime;

            // 更新位置
            transform.position.x += rigidbody.velocity.x * Time.deltaTime;
            transform.position.y += rigidbody.velocity.y * Time.deltaTime;
        }
    }
}
```

### 场景2: 渲染系统

```typescript
class RenderSystem extends EntitySystem {
    constructor() {
        super(
            Matcher.empty()
                .all(TransformComponent, SpriteComponent)
                .none(InvisibleTag)  // 排除不可见实体
        );
    }

    protected process(entities: readonly Entity[]): void {
        // 按 z-order 排序
        const sorted = entities.slice().sort((a, b) => {
            const zA = a.getComponent(TransformComponent)!.z;
            const zB = b.getComponent(TransformComponent)!.z;
            return zA - zB;
        });

        // 渲染实体
        for (const entity of sorted) {
            const transform = entity.getComponent(TransformComponent)!;
            const sprite = entity.getComponent(SpriteComponent)!;

            renderer.drawSprite(sprite.texture, transform.position);
        }
    }
}
```

### 场景3: 碰撞检测

```typescript
class CollisionSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(TransformComponent, ColliderComponent));
    }

    protected process(entities: readonly Entity[]): void {
        // 简单的 O(n²) 碰撞检测
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
            // 触发碰撞事件
            scene.eventSystem.emit('collision', { entityA: a, entityB: b });
        }
    }
}
```

### 场景4: 一次性查询

```typescript
// 在系统外部执行一次性查询
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

## 性能统计

```typescript
const stats = querySystem.getStats();
console.log('总查询次数:', stats.queryStats.totalQueries);
console.log('缓存命中率:', stats.queryStats.cacheHitRate);
console.log('缓存大小:', stats.cacheStats.size);
```

## 相关 API

- [Matcher](/api/classes/Matcher/) - 查询条件描述符 API 参考
- [QuerySystem](/api/classes/QuerySystem/) - 查询系统 API 参考
- [EntitySystem](/api/classes/EntitySystem/) - 实体系统 API 参考
- [Entity](/api/classes/Entity/) - 实体 API 参考
