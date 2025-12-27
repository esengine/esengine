---
title: "Advanced Usage"
description: "Performance optimization and debugging"
---

## Performance Optimization

### Tick Rate Control

```typescript
// Reduce update frequency for distant entities
const runtime = entity.getComponent(BehaviorTreeRuntimeComponent);
runtime.tickInterval = 100; // Update every 100ms instead of every frame
```

### Conditional Execution

```typescript
// Skip execution based on conditions
class OptimizedSystem extends BehaviorTreeExecutionSystem {
    shouldProcess(entity: Entity): boolean {
        const distance = getDistanceToPlayer(entity);
        return distance < 1000; // Only process nearby entities
    }
}
```

### Node Pooling

The framework automatically pools node execution contexts to reduce GC pressure.

## Debugging

### Runtime Inspection

```typescript
const runtime = entity.getComponent(BehaviorTreeRuntimeComponent);

// Current state
console.log('State:', runtime.state);
console.log('Current node:', runtime.currentNodeId);

// Blackboard
console.log('Health:', runtime.getBlackboardValue('health'));

// Execution history
console.log('Last nodes:', runtime.executionHistory);
```

### Event Logging

```typescript
runtime.onNodeEnter = (nodeId) => {
    console.log(`Entering: ${nodeId}`);
};

runtime.onNodeExit = (nodeId, status) => {
    console.log(`Exiting: ${nodeId} with ${status}`);
};
```

### Visual Debugging

```typescript
// Enable visual debugging
runtime.debug = true;

// Draw current execution path
BehaviorTreeDebugger.draw(entity);
```

## State Persistence

### Save State

```typescript
const state = runtime.serialize();
localStorage.setItem('ai-state', JSON.stringify(state));
```

### Restore State

```typescript
const state = JSON.parse(localStorage.getItem('ai-state'));
runtime.deserialize(state);
```

## Multi-Tree Entities

```typescript
// An entity can have multiple behavior trees
const combatAI = BehaviorTreeBuilder.create('Combat').build();
const dialogAI = BehaviorTreeBuilder.create('Dialog').build();

// Start both
BehaviorTreeStarter.start(entity, combatAI, 'combat');
BehaviorTreeStarter.start(entity, dialogAI, 'dialog');

// Control individually
const combatRuntime = entity.getComponent(BehaviorTreeRuntimeComponent, 'combat');
combatRuntime.pause();
```

## Custom Execution

Override the default execution system:

```typescript
class CustomExecutionSystem extends BehaviorTreeExecutionSystem {
    protected processEntity(entity: Entity, dt: number): void {
        // Custom pre-processing
        this.updateBlackboard(entity);

        // Standard execution
        super.processEntity(entity, dt);

        // Custom post-processing
        this.handleResults(entity);
    }
}
```
