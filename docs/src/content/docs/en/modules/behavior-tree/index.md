---
title: "Behavior Tree System"
description: "AI behavior trees with runtime executor architecture"
---

Behavior Tree is a powerful tool for game AI and automation control. This framework provides a behavior tree system based on Runtime Executor Architecture, featuring high performance, type safety, and easy extensibility.

## What is a Behavior Tree?

A behavior tree is a hierarchical task execution structure composed of multiple nodes, each responsible for specific tasks. Behavior trees are especially suitable for:

- Game AI (enemies, NPC behavior)
- Alternative to state machines
- Complex decision logic
- Visual behavior design

## Core Features

### Runtime Executor Architecture
- Data and logic separation
- Stateless executor design
- High-performance execution
- Type safety

### Visual Editor
- Graphical node editing
- Real-time preview and debugging
- Drag-and-drop node creation
- Property connections and bindings

### Flexible Blackboard System
- Local blackboard (single behavior tree)
- Global blackboard (shared across all trees)
- Type-safe variable access
- Property binding support

## Quick Example

```typescript
import { Core, Scene } from '@esengine/ecs-framework';
import {
    BehaviorTreeBuilder,
    BehaviorTreeStarter,
    BehaviorTreePlugin
} from '@esengine/behavior-tree';

// Initialize
Core.create();
const plugin = new BehaviorTreePlugin();
await Core.installPlugin(plugin);

const scene = new Scene();
plugin.setupScene(scene);
Core.setScene(scene);

// Create behavior tree
const enemyAI = BehaviorTreeBuilder.create('EnemyAI')
    .defineBlackboardVariable('health', 100)
    .defineBlackboardVariable('target', null)
    .selector('MainBehavior')
        // If health is high, attack
        .sequence('AttackBranch')
            .blackboardCompare('health', 50, 'greater')
            .log('Attack player', 'Attack')
        .end()
        // Otherwise flee
        .log('Flee from combat', 'Flee')
    .end()
    .build();

// Start AI
const entity = scene.createEntity('Enemy');
BehaviorTreeStarter.start(entity, enemyAI);
```

## Documentation

### Getting Started
- **[Getting Started](./getting-started/)** - 5-minute quickstart
- **[Core Concepts](./core-concepts/)** - Understanding behavior tree fundamentals

### Editor
- **[Editor Guide](./editor-guide/)** - Visual behavior tree creation
- **[Editor Workflow](./editor-workflow/)** - Complete development workflow

### Advanced
- **[Asset Management](./asset-management/)** - Loading, managing, and reusing assets
- **[Custom Actions](./custom-actions/)** - Create custom behavior nodes
- **[Advanced Usage](./advanced-usage/)** - Performance optimization
- **[Best Practices](./best-practices/)** - Design patterns and tips

### Engine Integration
- **[Cocos Creator](./cocos-integration/)** - Using with Cocos Creator
- **[Laya Engine](./laya-integration/)** - Using with Laya
- **[Node.js Server](./nodejs-usage/)** - Server-side usage
