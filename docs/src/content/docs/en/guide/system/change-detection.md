---
title: "Change Detection"
description: "Frame-level change detection to optimize system performance"
---

> **v2.4.0+**

The framework provides epoch-based frame-level change detection, allowing systems to process only entities that have changed, significantly improving performance.

## Core Concepts

- **Epoch**: Global frame counter, incremented each frame
- **lastWriteEpoch**: The epoch when a component was last modified
- **Change Detection**: Determine if component changed after a specific point by comparing epochs

## Marking Components as Modified

After modifying component data, you need to mark the component as changed. There are two approaches:

### Approach 1: Via Entity Helper Method (Recommended)

```typescript
// Mark component dirty via entity.markDirty() after modification
const pos = entity.getComponent(Position)!;
pos.x = 100;
pos.y = 200;
entity.markDirty(pos);

// Can mark multiple components at once
const vel = entity.getComponent(Velocity)!;
vel.vx = 10;
entity.markDirty(pos, vel);
```

### Approach 2: Encapsulate in Component

```typescript
class VelocityComponent extends Component {
    private _vx: number = 0;
    private _vy: number = 0;

    // Provide modification method that accepts epoch parameter
    public setVelocity(vx: number, vy: number, epoch: number): void {
        this._vx = vx;
        this._vy = vy;
        this.markDirty(epoch);
    }

    public get vx(): number { return this._vx; }
    public get vy(): number { return this._vy; }
}

// Usage in system
const vel = entity.getComponent(VelocityComponent)!;
vel.setVelocity(10, 20, this.currentEpoch);
```

## Using Change Detection in Systems

EntitySystem provides several change detection helper methods:

### forEachChanged - Iterate Changed Entities

```typescript
@ECSSystem('Physics')
class PhysicsSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Position, Velocity));
    }

    protected process(entities: readonly Entity[]): void {
        // Use forEachChanged to process only changed entities
        // Automatically saves epoch checkpoint
        this.forEachChanged(entities, [Velocity], (entity) => {
            const pos = this.requireComponent(entity, Position);
            const vel = this.requireComponent(entity, Velocity);

            // Only update position when Velocity changes
            pos.x += vel.vx * Time.deltaTime;
            pos.y += vel.vy * Time.deltaTime;
        });
    }
}
```

### filterChanged - Get List of Changed Entities

```typescript
@ECSSystem('Transform')
class TransformSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Transform, RigidBody));
    }

    protected process(entities: readonly Entity[]): void {
        // Use filterChanged to get list of changed entities
        const changedEntities = this.filterChanged(entities, [RigidBody]);

        for (const entity of changedEntities) {
            // Process entities with changed physics state
            this.updatePhysics(entity);
        }

        // Manually save epoch checkpoint
        this.saveEpoch();
    }

    protected updatePhysics(entity: Entity): void {
        // Physics update logic
    }
}
```

### hasChanged - Check Single Entity

```typescript
protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
        // Check if single entity's specified components have changed
        if (this.hasChanged(entity, [Transform])) {
            this.updateRenderData(entity);
        }
    }
}
```

## Change Detection API Reference

| Method | Description |
|--------|-------------|
| `forEachChanged(entities, [Types], callback)` | Iterate entities with changed specified components, auto-saves checkpoint |
| `filterChanged(entities, [Types])` | Return array of entities with changed specified components |
| `hasChanged(entity, [Types])` | Check if single entity's specified components have changed |
| `saveEpoch()` | Manually save current epoch as checkpoint |
| `lastProcessEpoch` | Get last saved epoch checkpoint |
| `currentEpoch` | Get current scene epoch |

## Use Cases

Change detection is particularly suitable for:

### 1. Dirty Flag Optimization

Only update rendering when data changes:

```typescript
@ECSSystem('RenderUpdate')
class RenderUpdateSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Transform, Sprite));
    }

    protected process(entities: readonly Entity[]): void {
        // Only update changed sprites
        this.forEachChanged(entities, [Transform, Sprite], (entity) => {
            const transform = this.requireComponent(entity, Transform);
            const sprite = this.requireComponent(entity, Sprite);

            this.updateSpriteMatrix(sprite, transform);
        });
    }
}
```

### 2. Network Sync

Only send changed component data:

```typescript
@ECSSystem('NetworkSync')
class NetworkSyncSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(NetworkComponent, Transform));
    }

    protected process(entities: readonly Entity[]): void {
        // Only sync changed entities, greatly reducing network traffic
        this.forEachChanged(entities, [Transform], (entity) => {
            const transform = this.requireComponent(entity, Transform);
            const network = this.requireComponent(entity, NetworkComponent);

            this.sendTransformUpdate(network.id, transform);
        });
    }

    private sendTransformUpdate(id: string, transform: Transform): void {
        // Send network update
    }
}
```

### 3. Physics Sync

Only sync entities with changed position/velocity:

```typescript
@ECSSystem('PhysicsSync')
class PhysicsSyncSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Transform, RigidBody));
    }

    protected process(entities: readonly Entity[]): void {
        // Sync changed entities from physics engine
        this.forEachChanged(entities, [RigidBody], (entity) => {
            const transform = entity.getComponent(Transform)!;
            const rigidBody = entity.getComponent(RigidBody)!;

            // Update Transform
            transform.position = rigidBody.getPosition();
            transform.rotation = rigidBody.getRotation();

            // Mark Transform as changed
            entity.markDirty(transform);
        });
    }
}
```

### 4. Cache Invalidation

Only recalculate when dependent data changes:

```typescript
@ECSSystem('PathCache')
class PathCacheSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(PathFinder, Transform));
    }

    protected process(entities: readonly Entity[]): void {
        // Only recalculate path when position changes
        this.forEachChanged(entities, [Transform], (entity) => {
            const pathFinder = entity.getComponent(PathFinder)!;
            pathFinder.invalidateCache();
            pathFinder.recalculatePath();
        });
    }
}
```

## Performance Comparison

| Scenario | Without Change Detection | With Change Detection | Improvement |
|----------|--------------------------|----------------------|-------------|
| 1000 entities, 10% changed | 1000 processes | 100 processes | 10x |
| 1000 entities, 1% changed | 1000 processes | 10 processes | 100x |
| Network sync | Full send | Incremental send | 90%+ bandwidth saved |

:::tip
Change detection works best for "many entities, few changes" scenarios. If most entities change every frame, the overhead of change detection may not be worthwhile.
:::
