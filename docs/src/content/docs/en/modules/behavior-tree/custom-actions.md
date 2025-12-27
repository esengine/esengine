---
title: "Custom Actions"
description: "Create custom behavior tree nodes"
---

## Creating a Custom Executor

```typescript
import {
    INodeExecutor,
    NodeExecutionContext,
    NodeExecutorMetadata,
    TaskStatus,
    NodeType,
    BindingHelper
} from '@esengine/behavior-tree';

@NodeExecutorMetadata({
    implementationType: 'AttackAction',
    nodeType: NodeType.Action,
    displayName: 'Attack',
    description: 'Attack the target',
    category: 'Combat',
    configSchema: {
        damage: {
            type: 'number',
            default: 10,
            supportBinding: true
        },
        range: {
            type: 'number',
            default: 50
        }
    }
})
export class AttackAction implements INodeExecutor {
    execute(context: NodeExecutionContext): TaskStatus {
        const damage = BindingHelper.getValue<number>(context, 'damage', 10);
        const target = context.runtime.getBlackboardValue('target');

        if (!target) {
            return TaskStatus.Failure;
        }

        // Perform attack logic
        console.log(`Dealing ${damage} damage`);
        return TaskStatus.Success;
    }
}
```

## Decorator Metadata

```typescript
@NodeExecutorMetadata({
    implementationType: 'MoveToTarget',
    nodeType: NodeType.Action,
    displayName: 'Move To Target',
    description: 'Move entity towards target position',
    category: 'Movement',
    icon: 'move',
    color: '#4CAF50',
    configSchema: {
        speed: {
            type: 'number',
            default: 100,
            min: 0,
            max: 1000,
            supportBinding: true,
            description: 'Movement speed'
        },
        arrivalDistance: {
            type: 'number',
            default: 10,
            description: 'Distance to consider arrived'
        }
    }
})
```

## Config Schema Types

| Type | Properties |
|------|------------|
| `number` | `min`, `max`, `step`, `default` |
| `string` | `default`, `maxLength` |
| `boolean` | `default` |
| `select` | `options`, `default` |
| `vector2` | `default: { x, y }` |

```typescript
configSchema: {
    mode: {
        type: 'select',
        options: ['aggressive', 'defensive', 'passive'],
        default: 'aggressive'
    },
    offset: {
        type: 'vector2',
        default: { x: 0, y: 0 }
    }
}
```

## Using BindingHelper

```typescript
import { BindingHelper } from '@esengine/behavior-tree';

execute(context: NodeExecutionContext): TaskStatus {
    // Get value with fallback
    const speed = BindingHelper.getValue<number>(context, 'speed', 100);

    // Get bound value from blackboard
    const target = BindingHelper.getBoundValue<Entity>(context, 'target');

    // Check if value is bound
    if (BindingHelper.isBound(context, 'target')) {
        // Value comes from blackboard
    }

    return TaskStatus.Success;
}
```

## Async Actions

For actions that span multiple frames:

```typescript
@NodeExecutorMetadata({
    implementationType: 'WaitAction',
    nodeType: NodeType.Action,
    displayName: 'Wait',
    category: 'Timing',
    configSchema: {
        duration: { type: 'number', default: 1000 }
    }
})
export class WaitAction implements INodeExecutor {
    execute(context: NodeExecutionContext): TaskStatus {
        const duration = BindingHelper.getValue<number>(context, 'duration', 1000);

        // Get or initialize state
        let elapsed = context.runtime.getNodeState<number>(context.node.id, 'elapsed') ?? 0;
        elapsed += context.deltaTime;

        if (elapsed >= duration) {
            // Clear state and complete
            context.runtime.clearNodeState(context.node.id);
            return TaskStatus.Success;
        }

        // Save state and continue
        context.runtime.setNodeState(context.node.id, 'elapsed', elapsed);
        return TaskStatus.Running;
    }
}
```

## Condition Nodes

```typescript
@NodeExecutorMetadata({
    implementationType: 'IsHealthLow',
    nodeType: NodeType.Condition,
    displayName: 'Is Health Low',
    category: 'Conditions',
    configSchema: {
        threshold: { type: 'number', default: 30 }
    }
})
export class IsHealthLow implements INodeExecutor {
    execute(context: NodeExecutionContext): TaskStatus {
        const threshold = BindingHelper.getValue<number>(context, 'threshold', 30);
        const health = context.runtime.getBlackboardValue<number>('health') ?? 100;

        return health <= threshold
            ? TaskStatus.Success
            : TaskStatus.Failure;
    }
}
```

## Registering Custom Executors

Executors are auto-registered via the decorator. To manually register:

```typescript
import { NodeExecutorRegistry } from '@esengine/behavior-tree';

// Register
NodeExecutorRegistry.register('CustomAction', CustomAction);

// Get executor
const executor = NodeExecutorRegistry.get('CustomAction');
```
