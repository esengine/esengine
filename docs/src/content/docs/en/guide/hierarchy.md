---
title: "Hierarchy System"
description: "Parent-child entity relationships using component-based design"
---

In game development, parent-child hierarchy relationships between entities are common requirements. ECS Framework manages hierarchy relationships through a component-based approach using `HierarchyComponent` and `HierarchySystem`, fully adhering to ECS composition principles.

## Design Philosophy

### Why Not Built-in Hierarchy in Entity?

Traditional game object models build hierarchy into entities. ECS Framework chose a component-based approach because:

1. **ECS Composition Principle**: Hierarchy is a "feature" that should be added through components, not inherent to all entities
2. **On-Demand Usage**: Only entities that need hierarchy add `HierarchyComponent`
3. **Data-Logic Separation**: `HierarchyComponent` stores data, `HierarchySystem` handles logic
4. **Serialization-Friendly**: Hierarchy as component data can be easily serialized/deserialized

## Basic Concepts

### HierarchyComponent

Component storing hierarchy relationship data:

```typescript
import { HierarchyComponent } from '@esengine/ecs-framework';

interface HierarchyComponent {
    parentId: number | null;      // Parent entity ID, null means root
    childIds: number[];           // Child entity ID list
    depth: number;                // Depth in hierarchy (maintained by system)
    bActiveInHierarchy: boolean;  // Active in hierarchy (maintained by system)
}
```

### HierarchySystem

System handling hierarchy logic, provides all hierarchy operation APIs:

```typescript
import { HierarchySystem } from '@esengine/ecs-framework';

const hierarchySystem = scene.getEntityProcessor(HierarchySystem);
```

## Quick Start

### Add System to Scene

```typescript
import { Scene, HierarchySystem } from '@esengine/ecs-framework';

class GameScene extends Scene {
    protected initialize(): void {
        this.addSystem(new HierarchySystem());
    }
}
```

### Establish Parent-Child Relationships

```typescript
const parent = scene.createEntity("Parent");
const child1 = scene.createEntity("Child1");
const child2 = scene.createEntity("Child2");

const hierarchySystem = scene.getEntityProcessor(HierarchySystem);

// Set parent-child relationship (auto-adds HierarchyComponent)
hierarchySystem.setParent(child1, parent);
hierarchySystem.setParent(child2, parent);
```

### Query Hierarchy

```typescript
// Get parent entity
const parentEntity = hierarchySystem.getParent(child1);

// Get all children
const children = hierarchySystem.getChildren(parent);

// Get child count
const count = hierarchySystem.getChildCount(parent);

// Check if has children
const hasKids = hierarchySystem.hasChildren(parent);

// Get depth in hierarchy
const depth = hierarchySystem.getDepth(child1);  // Returns 1
```

## API Reference

### Parent-Child Operations

```typescript
// Set parent
hierarchySystem.setParent(child, parent);

// Move to root (no parent)
hierarchySystem.setParent(child, null);

// Insert child at position
hierarchySystem.insertChildAt(parent, child, 0);

// Remove child (becomes root)
hierarchySystem.removeChild(parent, child);

// Remove all children
hierarchySystem.removeAllChildren(parent);
```

### Hierarchy Queries

```typescript
// Get root of entity
const root = hierarchySystem.getRoot(deepChild);

// Get all root entities
const roots = hierarchySystem.getRootEntities();

// Check ancestor/descendant relationships
const isAncestor = hierarchySystem.isAncestorOf(grandparent, child);
const isDescendant = hierarchySystem.isDescendantOf(child, grandparent);
```

### Hierarchy Traversal

```typescript
// Find child by name
const child = hierarchySystem.findChild(parent, "ChildName");

// Recursive search
const deepChild = hierarchySystem.findChild(parent, "DeepChild", true);

// Find children by tag
const tagged = hierarchySystem.findChildrenByTag(parent, TAG_ENEMY, true);

// Iterate children
hierarchySystem.forEachChild(parent, (child) => {
    console.log(child.name);
}, true); // true for recursive
```

### Hierarchy State

```typescript
// Check if active in hierarchy (considers all ancestors)
const activeInHierarchy = hierarchySystem.isActiveInHierarchy(child);

// Get depth (root = 0)
const depth = hierarchySystem.getDepth(entity);
```

## Complete Example

```typescript
class GameScene extends Scene {
    private hierarchySystem!: HierarchySystem;

    protected initialize(): void {
        this.hierarchySystem = new HierarchySystem();
        this.addSystem(this.hierarchySystem);
        this.createPlayerHierarchy();
    }

    private createPlayerHierarchy(): void {
        const player = this.createEntity("Player");
        player.addComponent(new Transform(0, 0));

        const body = this.createEntity("Body");
        body.addComponent(new Sprite("body.png"));
        this.hierarchySystem.setParent(body, player);

        const weapon = this.createEntity("Weapon");
        weapon.addComponent(new Sprite("sword.png"));
        this.hierarchySystem.setParent(weapon, body);

        console.log(`Player depth: ${this.hierarchySystem.getDepth(player)}`);  // 0
        console.log(`Weapon depth: ${this.hierarchySystem.getDepth(weapon)}`);  // 2
    }
}
```

## Best Practices

1. **Avoid Deep Nesting**: System limits max depth to 32 levels
2. **Batch Operations**: Set up all parent-child relationships at once when building complex hierarchies
3. **On-Demand Addition**: Only add `HierarchyComponent` to entities that truly need hierarchy
4. **Cache System Reference**: Avoid getting `HierarchySystem` on every call

```typescript
// Good practice
class MySystem extends EntitySystem {
    private hierarchySystem!: HierarchySystem;

    onAddedToScene() {
        this.hierarchySystem = this.scene!.getEntityProcessor(HierarchySystem)!;
    }
}
```
