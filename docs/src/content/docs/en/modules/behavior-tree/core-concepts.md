---
title: "Core Concepts"
description: "Understanding behavior tree fundamentals"
---

## Node Types

### Composite Nodes

Control the execution flow of child nodes.

#### Sequence

Executes children in order. Fails if any child fails.

```typescript
.sequence('AttackSequence')
    .condition('hasTarget')      // If false, sequence fails
    .action('moveToTarget')      // If fails, sequence fails
    .action('attack')            // If succeeds, sequence succeeds
.end()
```

#### Selector

Tries children until one succeeds. Fails if all children fail.

```typescript
.selector('FindTarget')
    .action('findNearestEnemy')  // Try first
    .action('findNearestItem')   // Try if first fails
    .action('wander')            // Fallback
.end()
```

#### Parallel

Executes all children simultaneously.

```typescript
.parallel('CombatActions', {
    successPolicy: 'all',    // 'all' | 'any'
    failurePolicy: 'any'     // 'all' | 'any'
})
    .action('playAttackAnimation')
    .action('dealDamage')
    .action('playSound')
.end()
```

### Leaf Nodes

#### Action

Performs a specific task.

```typescript
.action('attack', { damage: 10 })
```

#### Condition

Checks a condition without side effects.

```typescript
.condition('isHealthLow', { threshold: 30 })
```

### Decorator Nodes

Modify child behavior.

```typescript
// Invert result
.inverter()
    .condition('isEnemy')
.end()

// Repeat until failure
.repeatUntilFail()
    .action('patrol')
.end()

// Timeout
.timeout(5000)
    .action('searchForTarget')
.end()
```

## Task Status

Every node returns one of these statuses:

| Status | Description |
|--------|-------------|
| `Success` | Task completed successfully |
| `Failure` | Task failed |
| `Running` | Task still in progress |

```typescript
import { TaskStatus } from '@esengine/behavior-tree';

class MyAction implements INodeExecutor {
    execute(context: NodeExecutionContext): TaskStatus {
        if (/* completed */) return TaskStatus.Success;
        if (/* failed */) return TaskStatus.Failure;
        return TaskStatus.Running; // Still working
    }
}
```

## Blackboard System

### Local vs Global

```typescript
// Local blackboard - per behavior tree instance
runtime.setBlackboardValue('localVar', value);

// Global blackboard - shared across all trees
runtime.setGlobalBlackboardValue('globalVar', value);
```

### Variable Access in Executors

```typescript
class PatrolAction implements INodeExecutor {
    execute(context: NodeExecutionContext): TaskStatus {
        // Read from blackboard
        const target = context.runtime.getBlackboardValue('patrolTarget');
        const speed = context.runtime.getBlackboardValue('moveSpeed');

        // Write to blackboard
        context.runtime.setBlackboardValue('lastPosition', currentPos);

        return TaskStatus.Success;
    }
}
```

## Execution Context

```typescript
interface NodeExecutionContext {
    readonly node: IBehaviorTreeNode;    // Current node data
    readonly runtime: BehaviorTreeRuntimeComponent;  // Runtime state
    readonly entity: Entity;              // Owner entity
    readonly scene: Scene;                // Current scene
    readonly deltaTime: number;           // Frame delta time
}
```

## Architecture Overview

```
BehaviorTreeData (Pure Data)
    │
    ├── Serializable JSON structure
    ├── Node definitions
    └── Blackboard schema

BehaviorTreeRuntimeComponent (State)
    │
    ├── Current execution state
    ├── Blackboard values
    └── Node status cache

BehaviorTreeExecutionSystem (Logic)
    │
    ├── Drives tree execution
    ├── Manages node traversal
    └── Calls INodeExecutor.execute()

INodeExecutor (Behavior)
    │
    ├── Stateless design
    ├── Receives context
    └── Returns TaskStatus
```
