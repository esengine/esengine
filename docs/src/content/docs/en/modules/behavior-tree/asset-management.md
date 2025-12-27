---
title: "Asset Management"
description: "Loading, managing, and reusing behavior tree assets"
---

## Loading Trees

### From JSON

```typescript
import { BehaviorTreeLoader } from '@esengine/behavior-tree';

// Load from URL
const tree = await BehaviorTreeLoader.load('assets/enemy-ai.json');

// Load from object
const tree = BehaviorTreeLoader.fromData(jsonData);
```

### Using Asset Manager

```typescript
import { AssetManager } from '@esengine/asset-system';

// Register loader
AssetManager.registerLoader('btree', BehaviorTreeLoader);

// Load asset
const tree = await AssetManager.load<BehaviorTreeData>('enemy-ai.btree');
```

## Subtrees

Reuse behavior trees as subtrees:

```typescript
// Create a reusable patrol behavior
const patrolTree = BehaviorTreeBuilder.create('PatrolBehavior')
    .sequence('Patrol')
        .action('moveToWaypoint')
        .wait(2000)
        .action('nextWaypoint')
    .end()
    .build();

// Use as subtree in main AI
const enemyAI = BehaviorTreeBuilder.create('EnemyAI')
    .selector('Main')
        .sequence('Combat')
            .condition('hasTarget')
            .action('attack')
        .end()
        // Include patrol subtree
        .subtree(patrolTree)
    .end()
    .build();
```

## Asset References

Reference external trees by ID:

```typescript
const tree = BehaviorTreeBuilder.create('MainAI')
    .selector('Root')
        .subtreeRef('combat-behavior')  // References another tree
        .subtreeRef('patrol-behavior')
    .end()
    .build();
```

## Caching

```typescript
// Trees are cached automatically
const cache = BehaviorTreeLoader.getCache();

// Clear specific tree
cache.remove('enemy-ai');

// Clear all
cache.clear();
```

## Hot Reloading

During development:

```typescript
// Enable hot reload
BehaviorTreeLoader.enableHotReload();

// Trees will automatically update when files change
```
