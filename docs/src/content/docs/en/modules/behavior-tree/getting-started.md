---
title: "Getting Started"
description: "Quick start guide for behavior trees"
---

## Installation

```bash
npm install @esengine/behavior-tree
```

## Basic Setup

```typescript
import { Core, Scene } from '@esengine/ecs-framework';
import { BehaviorTreePlugin } from '@esengine/behavior-tree';

// Initialize Core
Core.create();

// Install behavior tree plugin
const plugin = new BehaviorTreePlugin();
await Core.installPlugin(plugin);

// Create and setup scene
const scene = new Scene();
plugin.setupScene(scene);
Core.setScene(scene);
```

## Creating Your First Behavior Tree

### Using Builder API

```typescript
import { BehaviorTreeBuilder, BehaviorTreeStarter } from '@esengine/behavior-tree';

// Build behavior tree
const patrolAI = BehaviorTreeBuilder.create('PatrolAI')
    .defineBlackboardVariable('targetPosition', null)
    .sequence('PatrolSequence')
        .log('Start patrol', 'Patrol')
        .wait(2000)
        .log('Move to next point', 'Patrol')
    .end()
    .build();

// Attach to entity
const entity = scene.createEntity('Guard');
BehaviorTreeStarter.start(entity, patrolAI);
```

### Node Types

| Node Type | Description |
|-----------|-------------|
| **Sequence** | Executes children in order until one fails |
| **Selector** | Tries children until one succeeds |
| **Parallel** | Executes all children simultaneously |
| **Action** | Performs a specific action |
| **Condition** | Checks a condition |
| **Decorator** | Modifies child behavior |

## Blackboard Variables

The blackboard is a shared data store for behavior tree nodes:

```typescript
const tree = BehaviorTreeBuilder.create('EnemyAI')
    // Define variables
    .defineBlackboardVariable('health', 100)
    .defineBlackboardVariable('target', null)
    .defineBlackboardVariable('isAlert', false)

    .selector('Main')
        // Use blackboard in conditions
        .sequence('AttackBranch')
            .blackboardCompare('health', 30, 'greater')
            .blackboardCondition('target', (t) => t !== null)
            .log('Attacking', 'Combat')
        .end()
        .log('Retreating', 'Combat')
    .end()
    .build();
```

## Running the Behavior Tree

```typescript
// The behavior tree runs automatically via ECS system
// Just create the entity and start the tree

const enemy = scene.createEntity('Enemy');
BehaviorTreeStarter.start(enemy, patrolAI);

// Access runtime for debugging
const runtime = enemy.getComponent(BehaviorTreeRuntimeComponent);
console.log('Current state:', runtime.state);
```

## Next Steps

- [Core Concepts](/en/modules/behavior-tree/core-concepts/) - Understand nodes and execution
- [Custom Actions](/en/modules/behavior-tree/custom-actions/) - Create your own nodes
- [Editor Guide](/en/modules/behavior-tree/editor-guide/) - Visual tree creation
