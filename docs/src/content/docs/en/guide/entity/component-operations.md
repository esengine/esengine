---
title: "Component Operations"
description: "Detailed guide to adding, getting, and removing entity components"
---

Entities gain functionality by adding components. This section details all component operation APIs.

## Adding Components

### addComponent

Add an already-created component instance:

```typescript
import { Component, ECSComponent } from '@esengine/ecs-framework';

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

const player = scene.createEntity("Player");
const position = new Position(100, 200);
player.addComponent(position);
```

### createComponent

Pass the component type and constructor arguments directly—the entity creates the instance (recommended):

```typescript
// Create and add component
const position = player.createComponent(Position, 100, 200);
const health = player.createComponent(Health, 150);

// Equivalent to:
// const position = new Position(100, 200);
// player.addComponent(position);
```

### addComponents

Add multiple components at once:

```typescript
const components = player.addComponents([
    new Position(100, 200),
    new Health(150),
    new Velocity(0, 0)
]);
```

:::note[Important Notes]
- An entity cannot have two components of the same type—an exception will be thrown
- The entity must be added to a scene before adding components
:::

## Getting Components

### getComponent

Get a component of a specific type:

```typescript
// Returns Position | null
const position = player.getComponent(Position);

if (position) {
    position.x += 10;
    position.y += 20;
}
```

### hasComponent

Check if an entity has a specific component type:

```typescript
if (player.hasComponent(Position)) {
    const position = player.getComponent(Position)!;
    // Use ! because we confirmed it exists
}
```

### getComponents

Get all components of a specific type (for multi-component scenarios):

```typescript
const allHealthComponents = player.getComponents(Health);
```

### getComponentByType

Get components with inheritance support using `instanceof` checking:

```typescript
// Find CompositeNodeComponent or any subclass
const composite = entity.getComponentByType(CompositeNodeComponent);
if (composite) {
    // composite could be SequenceNode, SelectorNode, etc.
}
```

Difference from `getComponent()`:

| Method | Lookup Method | Performance | Use Case |
|--------|---------------|-------------|----------|
| `getComponent` | Exact type match (bitmask) | High | Known exact type |
| `getComponentByType` | `instanceof` check | Lower | Need inheritance support |

### getOrCreateComponent

Get or create a component—automatically creates if it doesn't exist:

```typescript
// Ensure entity has Position component
const position = player.getOrCreateComponent(Position, 0, 0);
position.x = 100;

// If exists, returns existing component
// If not, creates new component with (0, 0) args
```

### components Property

Get all entity components (read-only):

```typescript
const allComponents = player.components;  // readonly Component[]

allComponents.forEach(component => {
    console.log(component.constructor.name);
});
```

## Removing Components

### removeComponent

Remove by component instance:

```typescript
const healthComponent = player.getComponent(Health);
if (healthComponent) {
    player.removeComponent(healthComponent);
}
```

### removeComponentByType

Remove by component type:

```typescript
const removedHealth = player.removeComponentByType(Health);
if (removedHealth) {
    console.log("Health component removed");
}
```

### removeComponentsByTypes

Remove multiple component types at once:

```typescript
const removedComponents = player.removeComponentsByTypes([
    Position,
    Health,
    Velocity
]);
```

### removeAllComponents

Remove all components:

```typescript
player.removeAllComponents();
```

## Change Detection

### markDirty

Mark components as modified for frame-level change detection:

```typescript
const pos = entity.getComponent(Position)!;
pos.x = 100;
entity.markDirty(pos);

// Or mark multiple components
const vel = entity.getComponent(Velocity)!;
entity.markDirty(pos, vel);
```

Use with reactive queries:

```typescript
// Query for components modified this frame
const changedQuery = scene.createReactiveQuery({
    all: [Position],
    changed: [Position]  // Only match modified this frame
});

for (const entity of changedQuery.getEntities()) {
    // Handle entities with position changes
}
```

## Component Mask

Each entity maintains a component bitmask for efficient `hasComponent` checks:

```typescript
// Get component mask (internal use)
const mask = entity.componentMask;
```

## Complete Example

```typescript
import { Component, ECSComponent, Scene } from '@esengine/ecs-framework';

@ECSComponent('Position')
class Position extends Component {
    constructor(public x = 0, public y = 0) { super(); }
}

@ECSComponent('Health')
class Health extends Component {
    constructor(public current = 100, public max = 100) { super(); }
}

// Create entity and add components
const player = scene.createEntity("Player");
player.createComponent(Position, 100, 200);
player.createComponent(Health, 150, 150);

// Get and modify component
const position = player.getComponent(Position);
if (position) {
    position.x += 10;
    player.markDirty(position);
}

// Get or create component
const velocity = player.getOrCreateComponent(Velocity, 0, 0);

// Check component existence
if (player.hasComponent(Health)) {
    const health = player.getComponent(Health)!;
    health.current -= 10;
}

// Remove component
player.removeComponentByType(Velocity);

// List all components
console.log(player.components.map(c => c.constructor.name));
```

## Next Steps

- [Entity Handle](/en/guide/entity/entity-handle/) - Safe cross-frame entity references
- [Component System](/en/guide/component/) - Component definition and lifecycle
