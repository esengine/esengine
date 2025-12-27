---
title: "Entity Handle"
description: "Using EntityHandle to safely reference entities and avoid referencing destroyed entities"
---

Entity handles (EntityHandle) provide a safe way to reference entities, solving the "referencing destroyed entities" problem.

## The Problem

Imagine your AI system needs to track a target enemy:

```typescript
// ❌ Wrong: Storing entity reference directly
class AISystem extends EntitySystem {
    private targetEnemy: Entity | null = null;

    setTarget(enemy: Entity) {
        this.targetEnemy = enemy;
    }

    process() {
        if (this.targetEnemy) {
            // Danger! Enemy might be destroyed but reference still exists
            // Worse: This memory location might be reused by a new entity
            const health = this.targetEnemy.getComponent(Health);
            // Might operate on wrong entity!
        }
    }
}
```

## What is EntityHandle

EntityHandle is a numeric entity identifier containing:
- **Index**: Entity's position in the array
- **Generation**: Number of times the entity slot has been reused

When an entity is destroyed, even if its index is reused by a new entity, the generation increases, invalidating old handles.

```typescript
import { EntityHandle, NULL_HANDLE, isValidHandle } from '@esengine/ecs-framework';

// Each entity gets a handle when created
const handle: EntityHandle = entity.handle;

// Null handle constant
const emptyHandle = NULL_HANDLE;

// Check if handle is non-null
if (isValidHandle(handle)) {
    // Handle is valid
}
```

## The Correct Approach

```typescript
import { EntityHandle, NULL_HANDLE, isValidHandle } from '@esengine/ecs-framework';

class AISystem extends EntitySystem {
    // ✅ Store handle instead of entity reference
    private targetHandle: EntityHandle = NULL_HANDLE;

    setTarget(enemy: Entity) {
        this.targetHandle = enemy.handle;
    }

    process() {
        if (!isValidHandle(this.targetHandle)) {
            return; // No target
        }

        // Get entity via handle (auto-validates)
        const enemy = this.scene.findEntityByHandle(this.targetHandle);

        if (!enemy) {
            // Enemy destroyed, clear reference
            this.targetHandle = NULL_HANDLE;
            return;
        }

        // Safe operation
        const health = enemy.getComponent(Health);
        if (health) {
            // Deal damage to enemy
        }
    }
}
```

## API Reference

### Getting Handle

```typescript
// Get handle from entity
const handle = entity.handle;
```

### Validating Handle

```typescript
import { isValidHandle, NULL_HANDLE } from '@esengine/ecs-framework';

// Check if handle is non-null
if (isValidHandle(handle)) {
    // ...
}

// Check if entity is alive
const alive = scene.handleManager.isAlive(handle);
```

### Getting Entity by Handle

```typescript
// Returns Entity | null
const entity = scene.findEntityByHandle(handle);

if (entity) {
    // Entity exists and is valid
}
```

## Complete Example: Skill Target Locking

```typescript
import {
    EntitySystem,
    Entity,
    EntityHandle,
    NULL_HANDLE,
    isValidHandle
} from '@esengine/ecs-framework';

@ECSSystem('SkillTargeting')
class SkillTargetingSystem extends EntitySystem {
    // Store multiple target handles
    private lockedTargets: Map<number, EntityHandle> = new Map();

    // Lock target
    lockTarget(casterId: number, target: Entity) {
        this.lockedTargets.set(casterId, target.handle);
    }

    // Get locked target
    getLockedTarget(casterId: number): Entity | null {
        const handle = this.lockedTargets.get(casterId);

        if (!handle || !isValidHandle(handle)) {
            return null;
        }

        const target = this.scene.findEntityByHandle(handle);

        if (!target) {
            // Target dead, clear lock
            this.lockedTargets.delete(casterId);
        }

        return target;
    }

    // Cast skill
    castSkill(caster: Entity) {
        const target = this.getLockedTarget(caster.id);

        if (!target) {
            console.log('Target lost, skill cancelled');
            return;
        }

        const health = target.getComponent(Health);
        if (health) {
            health.current -= 10;
        }
    }

    // Clear target for specific caster
    clearTarget(casterId: number) {
        this.lockedTargets.delete(casterId);
    }
}
```

## Usage Guidelines

| Scenario | Recommended Approach |
|----------|---------------------|
| Same-frame temporary use | Direct `Entity` reference |
| Cross-frame storage (AI target, skill target) | Use `EntityHandle` |
| Serialization/save | Use `EntityHandle` (numeric type) |
| Network sync | Use `EntityHandle` (directly transferable) |

## Performance Considerations

- EntityHandle is a numeric type with small memory footprint
- `findEntityByHandle` is O(1) operation
- Safer and more reliable than checking `entity.isDestroyed` every frame

## Common Patterns

### Optional Target Reference

```typescript
class FollowComponent extends Component {
    private _targetHandle: EntityHandle = NULL_HANDLE;

    setTarget(target: Entity | null) {
        this._targetHandle = target?.handle ?? NULL_HANDLE;
    }

    getTarget(scene: IScene): Entity | null {
        if (!isValidHandle(this._targetHandle)) {
            return null;
        }
        return scene.findEntityByHandle(this._targetHandle);
    }

    hasTarget(): boolean {
        return isValidHandle(this._targetHandle);
    }
}
```

### Multi-Target Tracking

```typescript
class MultiTargetComponent extends Component {
    private targets: EntityHandle[] = [];

    addTarget(target: Entity) {
        this.targets.push(target.handle);
    }

    removeTarget(target: Entity) {
        const index = this.targets.indexOf(target.handle);
        if (index >= 0) {
            this.targets.splice(index, 1);
        }
    }

    getValidTargets(scene: IScene): Entity[] {
        const valid: Entity[] = [];
        const stillValid: EntityHandle[] = [];

        for (const handle of this.targets) {
            const entity = scene.findEntityByHandle(handle);
            if (entity) {
                valid.push(entity);
                stillValid.push(handle);
            }
        }

        // Clean up invalid handles
        this.targets = stillValid;
        return valid;
    }
}
```

## Next Steps

- [Lifecycle](/en/guide/entity/lifecycle/) - Entity destruction and persistence
- [Entity Reference](/en/guide/component/entity-ref/) - Entity reference decorators in components
