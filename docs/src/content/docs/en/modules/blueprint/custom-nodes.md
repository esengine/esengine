---
title: "Custom Nodes"
description: "Creating custom blueprint nodes"
---

## Defining Node Template

```typescript
import { BlueprintNodeTemplate } from '@esengine/blueprint';

const MyNodeTemplate: BlueprintNodeTemplate = {
    type: 'MyCustomNode',
    title: 'My Custom Node',
    category: 'custom',
    description: 'A custom node example',
    keywords: ['custom', 'example'],
    inputs: [
        { name: 'exec', type: 'exec', direction: 'input', isExec: true },
        { name: 'value', type: 'number', direction: 'input', defaultValue: 0 }
    ],
    outputs: [
        { name: 'exec', type: 'exec', direction: 'output', isExec: true },
        { name: 'result', type: 'number', direction: 'output' }
    ]
};
```

## Implementing Node Executor

```typescript
import { INodeExecutor, RegisterNode, BlueprintNode, ExecutionContext, ExecutionResult } from '@esengine/blueprint';

@RegisterNode(MyNodeTemplate)
class MyNodeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        // Get input (using evaluateInput)
        const value = context.evaluateInput(node.id, 'value', 0) as number;

        // Execute logic
        const result = value * 2;

        // Return result
        return {
            outputs: { result },
            nextExec: 'exec'  // Continue execution
        };
    }
}
```

## Registration Methods

```typescript
// Method 1: Using decorator
@RegisterNode(MyNodeTemplate)
class MyNodeExecutor implements INodeExecutor { ... }

// Method 2: Manual registration
NodeRegistry.instance.register(MyNodeTemplate, new MyNodeExecutor());
```

## Node Registry

```typescript
import { NodeRegistry } from '@esengine/blueprint';

// Get singleton
const registry = NodeRegistry.instance;

// Get all templates
const allTemplates = registry.getAllTemplates();

// Get by category
const mathNodes = registry.getTemplatesByCategory('math');

// Search nodes
const results = registry.searchTemplates('add');

// Check existence
if (registry.has('MyCustomNode')) { ... }
```

## Pure Nodes

Pure nodes have no side effects and their outputs are cached:

```typescript
const PureNodeTemplate: BlueprintNodeTemplate = {
    type: 'GetDistance',
    title: 'Get Distance',
    category: 'math',
    isPure: true,  // Mark as pure node
    inputs: [
        { name: 'a', type: 'vector2', direction: 'input' },
        { name: 'b', type: 'vector2', direction: 'input' }
    ],
    outputs: [
        { name: 'distance', type: 'number', direction: 'output' }
    ]
};
```

## Example: ECS Component Operation Node

```typescript
import type { Entity } from '@esengine/ecs-framework';
import { BlueprintNodeTemplate, BlueprintNode } from '@esengine/blueprint';
import { ExecutionContext, ExecutionResult } from '@esengine/blueprint';
import { INodeExecutor, RegisterNode } from '@esengine/blueprint';

// Custom heal node
const HealEntityTemplate: BlueprintNodeTemplate = {
    type: 'HealEntity',
    title: 'Heal Entity',
    category: 'gameplay',
    color: '#22aa22',
    description: 'Heal an entity with HealthComponent',
    keywords: ['heal', 'health', 'restore'],
    menuPath: ['Gameplay', 'Combat', 'Heal Entity'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'entity', type: 'entity', displayName: 'Target' },
        { name: 'amount', type: 'float', displayName: 'Amount', defaultValue: 10 }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'newHealth', type: 'float', displayName: 'New Health' }
    ]
};

@RegisterNode(HealEntityTemplate)
class HealEntityExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;
        const amount = context.evaluateInput(node.id, 'amount', 10) as number;

        if (!entity || entity.isDestroyed) {
            return { outputs: { newHealth: 0 }, nextExec: 'exec' };
        }

        // Get HealthComponent
        const health = entity.components.find(c =>
            (c.constructor as any).__componentName__ === 'Health'
        ) as any;

        if (health) {
            health.current = Math.min(health.current + amount, health.max);
            return {
                outputs: { newHealth: health.current },
                nextExec: 'exec'
            };
        }

        return { outputs: { newHealth: 0 }, nextExec: 'exec' };
    }
}
```
