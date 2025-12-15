# Entity

In ECS architecture, an Entity is the basic object in the game world. An entity itself does not contain game logic or data - it's just a container that combines different components to achieve various functionalities.

## Basic Concepts

An entity is a lightweight object mainly used for:
- Serving as a container for components
- Providing a unique identifier (ID)
- Managing component lifecycle

::: tip About Parent-Child Hierarchy
Parent-child hierarchy relationships between entities are managed through `HierarchyComponent` and `HierarchySystem`, not built-in Entity properties. This design follows ECS composition principles - only entities that need hierarchy relationships add this component.

See [Hierarchy System](./hierarchy.md) documentation.
:::

## Creating Entities

**Important: Entities must be created through Scene, manual creation is not supported!**

Entities must be created through the scene's `createEntity()` method to ensure:
- Entity is properly added to the scene's entity management system
- Entity is added to the query system for system use
- Entity gets the correct scene reference
- Related lifecycle events are triggered

```typescript
// Correct way: create entity through scene
const player = scene.createEntity("Player");

// Wrong way: manually create entity
// const entity = new Entity("MyEntity", 1); // System cannot manage such entities
```

## Adding Components

Entities gain functionality by adding components:

```typescript
import { Component, ECSComponent } from '@esengine/ecs-framework';

// Define position component
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

// Define health component
@ECSComponent('Health')
class Health extends Component {
  current: number = 100;
  max: number = 100;

  constructor(max: number = 100) {
    super();
    this.max = max;
    this.current = max;
  }
}

// Add components to entity
const player = scene.createEntity("Player");
player.addComponent(new Position(100, 200));
player.addComponent(new Health(150));
```

## Getting Components

```typescript
// Get component (pass component class, not instance)
const position = player.getComponent(Position);  // Returns Position | null
const health = player.getComponent(Health);      // Returns Health | null

// Check if component exists
if (position) {
  console.log(`Player position: x=${position.x}, y=${position.y}`);
}

// Check if entity has a component
if (player.hasComponent(Position)) {
  console.log("Player has position component");
}

// Get all component instances (read-only property)
const allComponents = player.components;  // readonly Component[]

// Get all components of specified type (supports multiple components of same type)
const allHealthComponents = player.getComponents(Health);  // Health[]

// Get or create component (creates automatically if not exists)
const position = player.getOrCreateComponent(Position, 0, 0);  // Pass constructor arguments
const health = player.getOrCreateComponent(Health, 100);       // Returns existing if present, creates new if not
```

## Removing Components

```typescript
// Method 1: Remove by component type
const removedHealth = player.removeComponentByType(Health);
if (removedHealth) {
  console.log("Health component removed");
}

// Method 2: Remove by component instance
const healthComponent = player.getComponent(Health);
if (healthComponent) {
  player.removeComponent(healthComponent);
}

// Batch remove multiple component types
const removedComponents = player.removeComponentsByTypes([Position, Health]);

// Check if component was removed
if (!player.hasComponent(Health)) {
  console.log("Health component has been removed");
}
```

## Finding Entities

Scene provides multiple ways to find entities:

### Find by Name

```typescript
// Find single entity
const player = scene.findEntity("Player");
// Or use alias method
const player2 = scene.getEntityByName("Player");

if (player) {
  console.log("Found player entity");
}
```

### Find by ID

```typescript
// Find by entity ID
const entity = scene.findEntityById(123);
```

### Find by Tag

Entities support a tag system for quick categorization and lookup:

```typescript
// Set tags
player.tag = 1; // Player tag
enemy.tag = 2;  // Enemy tag

// Find all entities by tag
const players = scene.findEntitiesByTag(1);
const enemies = scene.findEntitiesByTag(2);
// Or use alias method
const allPlayers = scene.getEntitiesByTag(1);
```

## Entity Lifecycle

```typescript
// Destroy entity
player.destroy();

// Check if entity is destroyed
if (player.isDestroyed) {
  console.log("Entity has been destroyed");
}
```

## Entity Events

Component changes on entities trigger events:

```typescript
// Listen for component added event
scene.eventSystem.on('component:added', (data) => {
  console.log('Component added:', data);
});

// Listen for entity created event
scene.eventSystem.on('entity:created', (data) => {
  console.log('Entity created:', data.entityName);
});
```

## Performance Optimization

### Batch Entity Creation

The framework provides high-performance batch creation methods:

```typescript
// Batch create 100 bullet entities (high-performance version)
const bullets = scene.createEntities(100, "Bullet");

// Add components to each bullet
bullets.forEach((bullet, index) => {
  bullet.addComponent(new Position(Math.random() * 800, Math.random() * 600));
  bullet.addComponent(new Velocity(Math.random() * 100 - 50, Math.random() * 100 - 50));
});
```

`createEntities()` method will:
- Batch allocate entity IDs
- Batch add to entity list
- Optimize query system updates
- Reduce system cache clearing times

## Best Practices

### 1. Appropriate Component Granularity

```typescript
// Good practice: single-purpose components
@ECSComponent('Position')
class Position extends Component {
  x: number = 0;
  y: number = 0;
}

@ECSComponent('Velocity')
class Velocity extends Component {
  dx: number = 0;
  dy: number = 0;
}

// Avoid: overly complex components
@ECSComponent('Player')
class Player extends Component {
  // Avoid including too many unrelated properties in one component
  x: number;
  y: number;
  health: number;
  inventory: Item[];
  skills: Skill[];
}
```

### 2. Use Decorators

Always use `@ECSComponent` decorator:

```typescript
@ECSComponent('Transform')
class Transform extends Component {
  // Component implementation
}
```

### 3. Proper Naming

```typescript
// Clear entity naming
const mainCharacter = scene.createEntity("MainCharacter");
const enemy1 = scene.createEntity("Goblin_001");
const collectible = scene.createEntity("HealthPotion");
```

### 4. Timely Cleanup

```typescript
// Destroy entities that are no longer needed
if (enemy.getComponent(Health).current <= 0) {
  enemy.destroy();
}
```

## Debugging Entities

The framework provides debugging features to help development:

```typescript
// Get entity debug info
const debugInfo = entity.getDebugInfo();
console.log('Entity info:', debugInfo);

// List all components of entity
entity.components.forEach(component => {
  console.log('Component:', component.constructor.name);
});
```

Entities are one of the core concepts in ECS architecture. Understanding how to use entities correctly will help you build efficient, maintainable game code.

## Entity Handle (EntityHandle)

Entity handles provide a safe way to reference entities, solving the "referencing destroyed entity" problem.

### Problem Scenario

Suppose your AI system needs to track a target enemy:

```typescript
// Wrong approach: directly store entity reference
class AISystem extends EntitySystem {
    private targetEnemy: Entity | null = null;

    setTarget(enemy: Entity) {
        this.targetEnemy = enemy;
    }

    process() {
        if (this.targetEnemy) {
            // Dangerous! Enemy might be destroyed, but reference still exists
            // Worse: this memory location might be reused by a new entity
            const health = this.targetEnemy.getComponent(Health);
            // Might operate on the wrong entity!
        }
    }
}
```

### Correct Approach Using Handles

Each entity is automatically assigned a handle when created, accessible via `entity.handle`:

```typescript
import { EntityHandle, NULL_HANDLE, isValidHandle } from '@esengine/ecs-framework';

class AISystem extends EntitySystem {
    // Store handle instead of entity reference
    private targetHandle: EntityHandle = NULL_HANDLE;

    setTarget(enemy: Entity) {
        // Save enemy's handle
        this.targetHandle = enemy.handle;
    }

    process() {
        if (!isValidHandle(this.targetHandle)) {
            return; // No target
        }

        // Get entity through handle (automatically checks validity)
        const enemy = this.scene.findEntityByHandle(this.targetHandle);

        if (!enemy) {
            // Enemy was destroyed, clear reference
            this.targetHandle = NULL_HANDLE;
            return;
        }

        // Safe operation
        const health = enemy.getComponent(Health);
    }
}
```

### Complete Example: Skill Target Locking

```typescript
import {
    EntitySystem, Entity, EntityHandle, NULL_HANDLE, isValidHandle
} from '@esengine/ecs-framework';

@ECSSystem('SkillTargeting')
class SkillTargetingSystem extends EntitySystem {
    // Store handles for multiple targets
    private lockedTargets: Map<Entity, EntityHandle> = new Map();

    // Lock target
    lockTarget(caster: Entity, target: Entity) {
        this.lockedTargets.set(caster, target.handle);
    }

    // Get locked target
    getLockedTarget(caster: Entity): Entity | null {
        const handle = this.lockedTargets.get(caster);

        if (!handle || !isValidHandle(handle)) {
            return null;
        }

        // findEntityByHandle checks if handle is valid
        const target = this.scene.findEntityByHandle(handle);

        if (!target) {
            // Target died, clear lock
            this.lockedTargets.delete(caster);
        }

        return target;
    }

    // Cast skill
    castSkill(caster: Entity) {
        const target = this.getLockedTarget(caster);

        if (!target) {
            console.log('Target lost, skill cancelled');
            return;
        }

        // Safely deal damage to target
        const health = target.getComponent(Health);
        if (health) {
            health.current -= 10;
        }
    }
}
```

### Handle vs Entity Reference

| Scenario | Recommended Approach |
|----------|---------------------|
| Temporary use within same frame | Use `Entity` reference directly |
| Cross-frame storage (e.g., AI target, skill target) | Use `EntityHandle` |
| Needs serialization | Use `EntityHandle` (numeric type) |
| Network synchronization | Use `EntityHandle` (can be transmitted directly) |

### API Quick Reference

```typescript
// Get entity's handle
const handle = entity.handle;

// Check if handle is non-null
if (isValidHandle(handle)) { ... }

// Get entity through handle (automatically checks validity)
const entity = scene.findEntityByHandle(handle);

// Check if entity corresponding to handle is alive
const alive = scene.handleManager.isAlive(handle);

// Null handle constant
const emptyHandle = NULL_HANDLE;
```

## Next Steps

- Learn about [Hierarchy System](./hierarchy.md) to establish parent-child relationships
- Learn about [Component System](./component.md) to add functionality to entities
- Learn about [Scene Management](./scene.md) to organize and manage entities
