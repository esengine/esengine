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
import { INodeExecutor, RegisterNode } from '@esengine/blueprint';

@RegisterNode(MyNodeTemplate)
class MyNodeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        // Get input
        const value = context.getInput<number>(node.id, 'value');

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

## Example: Input Handler Node

```typescript
const InputMoveTemplate: BlueprintNodeTemplate = {
    type: 'InputMove',
    title: 'Get Movement Input',
    category: 'input',
    inputs: [],
    outputs: [
        { name: 'direction', type: 'vector2', direction: 'output' }
    ],
    isPure: true
};

@RegisterNode(InputMoveTemplate)
class InputMoveExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const input = context.scene.services.get(InputServiceToken);
        const direction = {
            x: input.getAxis('horizontal'),
            y: input.getAxis('vertical')
        };
        return { outputs: { direction } };
    }
}
```
