---
title: "Editor Workflow"
description: "Complete development workflow with the editor"
---

## Workflow Overview

1. **Design** - Plan your AI behavior
2. **Create** - Build the tree in the editor
3. **Configure** - Set up blackboard and properties
4. **Test** - Debug in the editor
5. **Export** - Generate runtime assets
6. **Integrate** - Use in your game

## Design Phase

Before opening the editor, plan your AI:

```
Enemy AI Design:
├── If health > 50%
│   ├── Find target
│   ├── Move to target
│   └── Attack
└── Else
    └── Flee to safety
```

## Create Phase

Translate your design to nodes:

1. Start with a Selector (main decision)
2. Add Sequences for each branch
3. Add Conditions and Actions
4. Configure node properties

## Configure Phase

### Blackboard Setup

Define variables your tree needs:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| health | number | 100 | Current health |
| target | Entity | null | Attack target |
| homePosition | Vector2 | (0,0) | Safe position |

### Property Bindings

Connect node properties to blackboard:

```
Attack Node:
  damage: @blackboard.attackPower
  target: @blackboard.target
```

## Test Phase

1. Click Play in the editor
2. Watch node execution
3. Monitor blackboard values
4. Step through execution
5. Fix issues and repeat

## Export Phase

Export your tree for runtime use:

```typescript
// The exported JSON can be loaded at runtime
const treeData = await loadBehaviorTree('assets/enemy-ai.json');
```

## Integration Phase

```typescript
import { BehaviorTreeLoader, BehaviorTreeStarter } from '@esengine/behavior-tree';

// Load exported tree
const treeData = await BehaviorTreeLoader.load('enemy-ai.json');

// Attach to entity
const enemy = scene.createEntity('Enemy');
BehaviorTreeStarter.start(enemy, treeData);
```
