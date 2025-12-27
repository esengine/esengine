---
title: "Lifecycle"
description: "Entity lifecycle management, destruction, and persistence"
---

Entity lifecycle includes three phases: creation, runtime, and destruction. This section covers how to properly manage entity lifecycles.

## Destroying Entities

### Basic Destruction

```typescript
// Destroy entity
player.destroy();

// Check if entity is destroyed
if (player.isDestroyed) {
    console.log("Entity has been destroyed");
}
```

When destroying an entity:
1. All components are removed (triggering `onRemovedFromEntity` callbacks)
2. Entity is removed from query systems
3. Entity is removed from scene entity list
4. All reference tracking is cleaned up

### Conditional Destruction

```typescript
// Common pattern: Destroy when health depleted
const health = enemy.getComponent(Health);
if (health && health.current <= 0) {
    enemy.destroy();
}
```

### Destruction Safety

Destruction is idempotent—multiple calls won't cause errors:

```typescript
player.destroy();
player.destroy();  // Safe, no error
```

## Persistent Entities

By default, entities are destroyed during scene transitions. Persistence allows entities to survive across scenes.

### Setting Persistence

```typescript
// Method 1: Chain call
const player = scene.createEntity('Player')
    .setPersistent()
    .createComponent(PlayerComponent);

// Method 2: Separate call
player.setPersistent();

// Check persistence
if (player.isPersistent) {
    console.log("This is a persistent entity");
}
```

### Removing Persistence

```typescript
// Restore to scene-local entity
player.setSceneLocal();
```

### Lifecycle Policies

Entities have two lifecycle policies:

| Policy | Description |
|--------|-------------|
| `SceneLocal` | Default, destroyed with scene |
| `Persistent` | Survives scene transitions |

```typescript
import { EEntityLifecyclePolicy } from '@esengine/ecs-framework';

// Get current policy
const policy = entity.lifecyclePolicy;

if (policy === EEntityLifecyclePolicy.Persistent) {
    // Persistent entity
}
```

### Use Cases

Persistent entities are suitable for:
- Player characters
- Global managers
- UI entities
- Game state that needs to survive scene transitions

```typescript
// Player character
const player = scene.createEntity('Player')
    .setPersistent();

// Game manager
const gameManager = scene.createEntity('GameManager')
    .setPersistent()
    .createComponent(GameStateComponent);

// Score manager
const scoreManager = scene.createEntity('ScoreManager')
    .setPersistent()
    .createComponent(ScoreComponent);
```

## Scene Transition Behavior

```typescript
// Scene manager switches scenes
sceneManager.loadScene('Level2');

// During transition:
// 1. SceneLocal entities are destroyed
// 2. Persistent entities migrate to new scene
// 3. New scene entities are created
```

:::caution[Note]
Persistent entities automatically migrate to the new scene during transitions, but other non-persistent entities they reference may be destroyed. Use [EntityHandle](/en/guide/entity/entity-handle/) to safely handle this situation.
:::

## Reference Cleanup

The framework provides reference tracking that automatically cleans up references when entities are destroyed:

```typescript
// Reference tracker cleans up all references to this entity on destruction
scene.referenceTracker?.clearReferencesTo(entity.id);
```

Using the `@entityRef` decorator handles this automatically:

```typescript
class FollowComponent extends Component {
    @entityRef()
    targetId: number | null = null;
}

// When target is destroyed, targetId is automatically set to null
```

See [Component References](/en/guide/component/entity-ref/) for details.

## Best Practices

### 1. Destroy Unneeded Entities Promptly

```typescript
// Destroy bullets that fly off screen
if (position.x < 0 || position.x > screenWidth) {
    bullet.destroy();
}
```

### 2. Use Object Pools Instead of Frequent Create/Destroy

```typescript
class BulletPool {
    private pool: Entity[] = [];

    acquire(scene: Scene): Entity {
        if (this.pool.length > 0) {
            const bullet = this.pool.pop()!;
            bullet.enabled = true;
            return bullet;
        }
        return scene.createEntity('Bullet');
    }

    release(bullet: Entity) {
        bullet.enabled = false;
        this.pool.push(bullet);
    }
}
```

### 3. Use Persistence Sparingly

Only use persistence for entities that truly need to survive scene transitions—too many persistent entities increase memory usage.

### 4. Clean Up References Before Destruction

```typescript
// Notify related systems before destruction
const aiSystem = scene.getSystem(AISystem);
aiSystem?.clearTarget(enemy.id);

enemy.destroy();
```

## Lifecycle Events

You can listen to entity destruction events:

```typescript
// Method 1: Through event system
scene.eventSystem.on('entity:destroyed', (data) => {
    console.log(`Entity ${data.entityName} destroyed`);
});

// Method 2: In component
class MyComponent extends Component {
    onRemovedFromEntity() {
        console.log('Component removed, entity may be destroying');
        // Clean up resources
    }
}
```

## Debugging

```typescript
// Get entity status
const debugInfo = entity.getDebugInfo();
console.log({
    destroyed: debugInfo.destroyed,
    enabled: debugInfo.enabled,
    active: debugInfo.active
});
```

## Next Steps

- [Component Operations](/en/guide/entity/component-operations/) - Adding and removing components
- [Scene Management](/en/guide/scene/) - Scene switching and management
