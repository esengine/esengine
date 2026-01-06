---
title: "Custom Nodes"
description: "Creating custom blueprint nodes"
---

## Blueprint Decorators

Use decorators to quickly expose ECS components as blueprint nodes.

### @BlueprintComponent

Mark a component class as blueprint-enabled:

```typescript
import { BlueprintComponent, BlueprintProperty } from '@esengine/blueprint';

@BlueprintComponent({
    title: 'Player Controller',
    category: 'gameplay',
    color: '#4a90d9',
    description: 'Controls player movement and interaction'
})
class PlayerController extends Component {
    @BlueprintProperty({ displayName: 'Move Speed' })
    speed: number = 100;

    @BlueprintProperty({ displayName: 'Jump Height' })
    jumpHeight: number = 200;
}
```

### @BlueprintProperty

Expose component properties as node inputs:

```typescript
@BlueprintProperty({
    displayName: 'Health',
    description: 'Current health value',
    isInput: true,
    isOutput: true
})
health: number = 100;
```

### @BlueprintArray

For array type properties, supports editing complex object arrays:

```typescript
import { BlueprintArray, Schema } from '@esengine/blueprint';

interface Waypoint {
    position: { x: number; y: number };
    waitTime: number;
    speed: number;
}

@BlueprintComponent({
    title: 'Patrol Path',
    category: 'ai'
})
class PatrolPath extends Component {
    @BlueprintArray({
        displayName: 'Waypoints',
        description: 'Points along the patrol path',
        itemSchema: Schema.object({
            position: Schema.vector2({ defaultValue: { x: 0, y: 0 } }),
            waitTime: Schema.float({ min: 0, max: 10, defaultValue: 1.0 }),
            speed: Schema.float({ min: 0, max: 500, defaultValue: 100 })
        }),
        reorderable: true,
        exposeElementPorts: true,
        portNameTemplate: 'Waypoint {index1}'
    })
    waypoints: Waypoint[] = [];
}
```

## Schema Type System

Schema defines type information for complex data structures, enabling the editor to automatically generate corresponding UI.

### Primitive Types

```typescript
import { Schema } from '@esengine/blueprint';

// Number types
Schema.float({ min: 0, max: 100, defaultValue: 50, step: 0.1 })
Schema.int({ min: 0, max: 10, defaultValue: 5 })

// String
Schema.string({ defaultValue: 'Hello', multiline: false, placeholder: 'Enter text...' })

// Boolean
Schema.boolean({ defaultValue: true })

// Vectors
Schema.vector2({ defaultValue: { x: 0, y: 0 } })
Schema.vector3({ defaultValue: { x: 0, y: 0, z: 0 } })
```

### Composite Types

```typescript
// Object
Schema.object({
    name: Schema.string({ defaultValue: '' }),
    health: Schema.float({ min: 0, max: 100 }),
    position: Schema.vector2()
})

// Array
Schema.array({
    items: Schema.float(),
    minItems: 0,
    maxItems: 10
})

// Enum
Schema.enum({
    options: ['idle', 'walk', 'run', 'jump'],
    defaultValue: 'idle'
})

// Reference
Schema.ref({ refType: 'entity' })
Schema.ref({ refType: 'asset', assetType: 'texture' })
```

### Complete Example

```typescript
@BlueprintComponent({ title: 'Enemy Config', category: 'ai' })
class EnemyConfig extends Component {
    @BlueprintArray({
        displayName: 'Attack Patterns',
        itemSchema: Schema.object({
            name: Schema.string({ defaultValue: 'Basic Attack' }),
            damage: Schema.float({ min: 0, max: 100, defaultValue: 10 }),
            cooldown: Schema.float({ min: 0, max: 10, defaultValue: 1 }),
            range: Schema.float({ min: 0, max: 500, defaultValue: 50 }),
            animation: Schema.string({ defaultValue: 'attack_01' })
        }),
        reorderable: true
    })
    attackPatterns: AttackPattern[] = [];

    @BlueprintProperty({
        displayName: 'Patrol Area',
        schema: Schema.object({
            center: Schema.vector2(),
            radius: Schema.float({ min: 0, defaultValue: 100 })
        })
    })
    patrolArea: { center: { x: number; y: number }; radius: number } = {
        center: { x: 0, y: 0 },
        radius: 100
    };
}
```

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
        const value = context.evaluateInput(node.id, 'value', 0) as number;
        const result = value * 2;
        return {
            outputs: { result },
            nextExec: 'exec'
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

const registry = NodeRegistry.instance;
const allTemplates = registry.getAllTemplates();
const mathNodes = registry.getTemplatesByCategory('math');
const results = registry.searchTemplates('add');
if (registry.has('MyCustomNode')) { ... }
```

## Pure Nodes

Pure nodes have no side effects and their outputs are cached:

```typescript
const PureNodeTemplate: BlueprintNodeTemplate = {
    type: 'GetDistance',
    title: 'Get Distance',
    category: 'math',
    isPure: true,
    inputs: [
        { name: 'a', type: 'vector2', direction: 'input' },
        { name: 'b', type: 'vector2', direction: 'input' }
    ],
    outputs: [
        { name: 'distance', type: 'number', direction: 'output' }
    ]
};
```
