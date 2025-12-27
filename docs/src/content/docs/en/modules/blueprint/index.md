---
title: "Blueprint Visual Scripting"
---

`@esengine/blueprint` provides a full-featured visual scripting system supporting node-based programming, event-driven execution, and blueprint composition.

## Installation

```bash
npm install @esengine/blueprint
```

## Quick Start

```typescript
import {
    createBlueprintSystem,
    createBlueprintComponentData,
    NodeRegistry,
    RegisterNode
} from '@esengine/blueprint';

// Create blueprint system
const blueprintSystem = createBlueprintSystem(scene);

// Load blueprint asset
const blueprint = await loadBlueprintAsset('player.bp');

// Create blueprint component data
const componentData = createBlueprintComponentData();
componentData.blueprintAsset = blueprint;

// Update in game loop
function gameLoop(dt: number) {
    blueprintSystem.process(entities, dt);
}
```

## Core Concepts

### Blueprint Asset Structure

Blueprints are saved as `.bp` files:

```typescript
interface BlueprintAsset {
    version: number;             // Format version
    type: 'blueprint';           // Asset type
    metadata: BlueprintMetadata; // Metadata
    variables: BlueprintVariable[]; // Variable definitions
    nodes: BlueprintNode[];      // Node instances
    connections: BlueprintConnection[]; // Connections
}
```

### Node Categories

| Category | Description | Color |
|----------|-------------|-------|
| `event` | Event nodes (entry points) | Red |
| `flow` | Flow control | Gray |
| `entity` | Entity operations | Blue |
| `component` | Component access | Cyan |
| `math` | Math operations | Green |
| `logic` | Logic operations | Red |
| `variable` | Variable access | Purple |
| `time` | Time utilities | Cyan |
| `debug` | Debug utilities | Gray |

### Pin Types

Nodes connect through pins:

```typescript
interface BlueprintPinDefinition {
    name: string;        // Pin name
    type: PinDataType;   // Data type
    direction: 'input' | 'output';
    isExec?: boolean;    // Execution pin
    defaultValue?: unknown;
}

type PinDataType =
    | 'exec'      // Execution flow
    | 'boolean'   // Boolean
    | 'number'    // Number
    | 'string'    // String
    | 'vector2'   // 2D vector
    | 'vector3'   // 3D vector
    | 'entity'    // Entity reference
    | 'component' // Component reference
    | 'any';      // Any type
```

### Variable Scopes

```typescript
type VariableScope =
    | 'local'     // Per execution
    | 'instance'  // Per entity
    | 'global';   // Shared globally
```

## Virtual Machine API

### BlueprintVM

The virtual machine executes blueprint graphs:

```typescript
import { BlueprintVM } from '@esengine/blueprint';

const vm = new BlueprintVM(blueprintAsset, entity, scene);

vm.start();           // Start (triggers BeginPlay)
vm.tick(deltaTime);   // Update (triggers Tick)
vm.stop();            // Stop (triggers EndPlay)

vm.pause();
vm.resume();

// Trigger events
vm.triggerEvent('EventCollision', { other: otherEntity });
vm.triggerCustomEvent('OnDamage', { amount: 50 });

// Debug mode
vm.debug = true;
```

### Execution Context

```typescript
interface ExecutionContext {
    blueprint: BlueprintAsset;
    entity: Entity;
    scene: IScene;
    deltaTime: number;
    time: number;

    getInput<T>(nodeId: string, pinName: string): T;
    setOutput(nodeId: string, pinName: string, value: unknown): void;
    getVariable<T>(name: string): T;
    setVariable(name: string, value: unknown): void;
}
```

### Execution Result

```typescript
interface ExecutionResult {
    outputs?: Record<string, unknown>; // Output values
    nextExec?: string | null;          // Next exec pin
    delay?: number;                    // Delay execution (ms)
    yield?: boolean;                   // Pause until next frame
    error?: string;                    // Error message
}
```

## Custom Nodes

### Define Node Template

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

### Implement Node Executor

```typescript
import { INodeExecutor, RegisterNode } from '@esengine/blueprint';

@RegisterNode(MyNodeTemplate)
class MyNodeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = context.getInput<number>(node.id, 'value');
        const result = value * 2;

        return {
            outputs: { result },
            nextExec: 'exec'
        };
    }
}
```

### Registration Methods

```typescript
// Method 1: Decorator
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

## Built-in Nodes

### Event Nodes
| Node | Description |
|------|-------------|
| `EventBeginPlay` | Triggered on blueprint start |
| `EventTick` | Triggered every frame |
| `EventEndPlay` | Triggered on blueprint stop |
| `EventCollision` | Triggered on collision |
| `EventInput` | Triggered on input |
| `EventTimer` | Triggered by timer |

### Time Nodes
| Node | Description |
|------|-------------|
| `Delay` | Delay execution |
| `GetDeltaTime` | Get frame delta |
| `GetTime` | Get total runtime |

### Math Nodes
| Node | Description |
|------|-------------|
| `Add`, `Subtract`, `Multiply`, `Divide` | Basic operations |
| `Abs`, `Clamp`, `Lerp`, `Min`, `Max` | Utility functions |

### Debug Nodes
| Node | Description |
|------|-------------|
| `Print` | Print to console |

## Blueprint Composition

### Blueprint Fragments

Encapsulate reusable logic as fragments:

```typescript
import { createFragment } from '@esengine/blueprint';

const healthFragment = createFragment('HealthSystem', {
    inputs: [
        { name: 'damage', type: 'number', internalNodeId: 'input1', internalPinName: 'value' }
    ],
    outputs: [
        { name: 'isDead', type: 'boolean', internalNodeId: 'output1', internalPinName: 'value' }
    ],
    graph: { nodes: [...], connections: [...], variables: [...] }
});
```

### Compose Blueprints

```typescript
import { createComposer, FragmentRegistry } from '@esengine/blueprint';

// Register fragments
FragmentRegistry.instance.register('health', healthFragment);
FragmentRegistry.instance.register('movement', movementFragment);

// Create composer
const composer = createComposer('PlayerBlueprint');

// Add fragments to slots
composer.addFragment(healthFragment, 'slot1', { position: { x: 0, y: 0 } });
composer.addFragment(movementFragment, 'slot2', { position: { x: 400, y: 0 } });

// Connect slots
composer.connect('slot1', 'onDeath', 'slot2', 'disable');

// Validate
const validation = composer.validate();
if (!validation.isValid) {
    console.error(validation.errors);
}

// Compile to blueprint
const blueprint = composer.compile();
```

## Trigger System

### Define Trigger Conditions

```typescript
import { TriggerCondition, TriggerDispatcher } from '@esengine/blueprint';

const lowHealthCondition: TriggerCondition = {
    type: 'comparison',
    left: { type: 'variable', name: 'health' },
    operator: '<',
    right: { type: 'constant', value: 20 }
};
```

### Use Trigger Dispatcher

```typescript
const dispatcher = new TriggerDispatcher();

dispatcher.register('lowHealth', lowHealthCondition, (context) => {
    context.triggerEvent('OnLowHealth');
});

dispatcher.evaluate(context);
```

## ECS Integration

### Using Blueprint System

```typescript
import { createBlueprintSystem } from '@esengine/blueprint';

class GameScene {
    private blueprintSystem: BlueprintSystem;

    initialize() {
        this.blueprintSystem = createBlueprintSystem(this.scene);
    }

    update(dt: number) {
        this.blueprintSystem.process(this.entities, dt);
    }
}
```

### Triggering Blueprint Events

```typescript
import { triggerBlueprintEvent, triggerCustomBlueprintEvent } from '@esengine/blueprint';

triggerBlueprintEvent(entity, 'Collision', { other: otherEntity });
triggerCustomBlueprintEvent(entity, 'OnPickup', { item: itemEntity });
```

## Serialization

### Save Blueprint

```typescript
import { validateBlueprintAsset } from '@esengine/blueprint';

function saveBlueprint(blueprint: BlueprintAsset, path: string): void {
    if (!validateBlueprintAsset(blueprint)) {
        throw new Error('Invalid blueprint structure');
    }
    const json = JSON.stringify(blueprint, null, 2);
    fs.writeFileSync(path, json);
}
```

### Load Blueprint

```typescript
async function loadBlueprint(path: string): Promise<BlueprintAsset> {
    const json = await fs.readFile(path, 'utf-8');
    const asset = JSON.parse(json);

    if (!validateBlueprintAsset(asset)) {
        throw new Error('Invalid blueprint file');
    }

    return asset;
}
```

## Best Practices

1. **Use fragments for reusable logic**
2. **Choose appropriate variable scopes**
   - `local`: Temporary calculations
   - `instance`: Entity state (e.g., health)
   - `global`: Game-wide state
3. **Avoid infinite loops** - VM has max steps per frame (default 1000)
4. **Debug techniques**
   - Enable `vm.debug = true` for execution logs
   - Use Print nodes for intermediate values
5. **Performance optimization**
   - Pure nodes (`isPure: true`) cache outputs
   - Avoid heavy computation in Tick

## Documentation

- [Virtual Machine API](./vm) - BlueprintVM execution and context
- [Custom Nodes](./custom-nodes) - Creating custom nodes
- [Built-in Nodes](./nodes) - Built-in node reference
- [Blueprint Composition](./composition) - Fragments and composer
- [Examples](./examples) - ECS integration and best practices
