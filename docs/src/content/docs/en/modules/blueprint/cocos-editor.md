---
title: "Cocos Creator Blueprint Editor"
description: "Using the blueprint visual scripting system in Cocos Creator"
---

This document explains how to install and use the blueprint visual scripting editor extension in Cocos Creator projects.

## Installation

### 1. Copy Extension to Project

Copy the `cocos-node-editor` extension to your Cocos Creator project's `extensions` directory:

```
your-project/
├── assets/
├── extensions/
│   └── cocos-node-editor/    # Blueprint editor extension
└── ...
```

### 2. Install Dependencies

Install dependencies in the extension directory:

```bash
cd extensions/cocos-node-editor
npm install
```

### 3. Enable Extension

1. Open Cocos Creator
2. Go to **Extensions → Extension Manager**
3. Find `cocos-node-editor` and enable it

## Opening the Blueprint Editor

Open the blueprint editor panel via menu **Panel → Node Editor**.

## Editor Interface

### Toolbar

| Button | Shortcut | Function |
|--------|----------|----------|
| New | - | Create empty blueprint |
| Load | - | Load blueprint from file |
| Save | `Ctrl+S` | Save blueprint to file |
| Undo | `Ctrl+Z` | Undo last operation |
| Redo | `Ctrl+Shift+Z` | Redo operation |
| Cut | `Ctrl+X` | Cut selected nodes |
| Copy | `Ctrl+C` | Copy selected nodes |
| Paste | `Ctrl+V` | Paste nodes |
| Delete | `Delete` | Delete selected items |
| Rescan | - | Rescan project for blueprint nodes |

### Canvas Operations

- **Right-click on canvas**: Open node addition menu
- **Drag nodes**: Move node position
- **Click node**: Select node
- **Ctrl+Click**: Multi-select nodes
- **Drag pin to pin**: Create connection
- **Scroll wheel**: Zoom canvas
- **Middle-click drag**: Pan canvas

### Node Menu

Right-clicking on canvas shows the node menu:

- Search box at top for quick node search
- Nodes grouped by category
- Press `Enter` to quickly add first search result
- Press `Esc` to close menu

## Blueprint File Format

Blueprints are saved as `.blueprint.json` files, fully compatible with runtime:

```json
{
  "version": 1,
  "type": "blueprint",
  "metadata": {
    "name": "My Blueprint",
    "createdAt": 1704307200000,
    "modifiedAt": 1704307200000
  },
  "variables": [],
  "nodes": [
    {
      "id": "node-1",
      "type": "PrintString",
      "position": { "x": 100, "y": 200 },
      "data": {}
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "fromNodeId": "node-1",
      "fromPin": "exec",
      "toNodeId": "node-2",
      "toPin": "exec"
    }
  ]
}
```

## Running Blueprints in Game

Use ECS system to manage and execute blueprints.

### 1. Define Blueprint Component

```typescript
import { Component, ECSComponent, Property, Serialize } from '@esengine/ecs-framework';
import type { BlueprintAsset } from '@esengine/blueprint';

@ECSComponent('Blueprint')
export class BlueprintComponent extends Component {
    @Serialize()
    @Property({ type: 'asset', label: 'Blueprint Asset' })
    blueprintPath: string = '';

    @Serialize()
    @Property({ type: 'boolean', label: 'Auto Start' })
    autoStart: boolean = true;

    // Runtime data (not serialized)
    blueprintAsset: BlueprintAsset | null = null;
    vm: BlueprintVM | null = null;
    isStarted: boolean = false;
}
```

### 2. Create Blueprint Execution System

```typescript
import { EntitySystem, Matcher, Entity } from '@esengine/ecs-framework';
import {
    BlueprintVM,
    validateBlueprintAsset
} from '@esengine/blueprint';
import { BlueprintComponent } from './BlueprintComponent';

export class BlueprintExecutionSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(BlueprintComponent));
    }

    protected override process(entities: readonly Entity[]): void {
        const dt = Time.deltaTime;

        for (const entity of entities) {
            const bp = entity.getComponent(BlueprintComponent)!;

            // Skip entities without blueprint asset
            if (!bp.blueprintAsset) continue;

            // Initialize VM
            if (!bp.vm) {
                bp.vm = new BlueprintVM(bp.blueprintAsset, entity, this.scene!);
            }

            // Auto start
            if (bp.autoStart && !bp.isStarted) {
                bp.vm.start();
                bp.isStarted = true;
            }

            // Update blueprint
            if (bp.isStarted) {
                bp.vm.tick(dt);
            }
        }
    }

    protected override onRemoved(entity: Entity): void {
        const bp = entity.getComponent(BlueprintComponent);
        if (bp?.vm && bp.isStarted) {
            bp.vm.stop();
            bp.vm = null;
            bp.isStarted = false;
        }
    }
}
```

### 3. Load Blueprint and Add to Entity

```typescript
import { resources, JsonAsset } from 'cc';
import { validateBlueprintAsset } from '@esengine/blueprint';

// Load blueprint asset
async function loadBlueprint(path: string): Promise<BlueprintAsset | null> {
    return new Promise((resolve) => {
        resources.load(path, JsonAsset, (err, asset) => {
            if (err || !asset) {
                console.error('Failed to load blueprint:', err);
                resolve(null);
                return;
            }

            const data = asset.json;
            if (validateBlueprintAsset(data)) {
                resolve(data as BlueprintAsset);
            } else {
                console.error('Invalid blueprint format');
                resolve(null);
            }
        });
    });
}

// Create entity with blueprint
async function createBlueprintEntity(scene: IScene, blueprintPath: string): Promise<Entity> {
    const entity = scene.createEntity('BlueprintEntity');

    const bpComponent = entity.addComponent(BlueprintComponent);
    bpComponent.blueprintPath = blueprintPath;
    bpComponent.blueprintAsset = await loadBlueprint(blueprintPath);

    return entity;
}
```

### 4. Register System to Scene

```typescript
// During scene initialization
scene.addSystem(new BlueprintExecutionSystem());
```

## Creating Custom Nodes

### Using Decorators for Components

Use decorators to automatically generate blueprint nodes from components:

```typescript
import { Component, ECSComponent } from '@esengine/ecs-framework';
import { BlueprintExpose, BlueprintProperty, BlueprintMethod } from '@esengine/blueprint';

@ECSComponent('Health')
@BlueprintExpose({ displayName: 'Health Component' })
export class HealthComponent extends Component {
    @BlueprintProperty({ displayName: 'Current Health', category: 'number' })
    current: number = 100;

    @BlueprintProperty({ displayName: 'Max Health', category: 'number' })
    max: number = 100;

    @BlueprintMethod({ displayName: 'Heal', isExec: true })
    heal(amount: number): void {
        this.current = Math.min(this.current + amount, this.max);
    }

    @BlueprintMethod({ displayName: 'Take Damage', isExec: true })
    takeDamage(amount: number): void {
        this.current = Math.max(this.current - amount, 0);
    }

    @BlueprintMethod({ displayName: 'Is Dead' })
    isDead(): boolean {
        return this.current <= 0;
    }
}
```

### Register Component Nodes

```typescript
import { registerAllComponentNodes } from '@esengine/blueprint';

// Register all decorated components at application startup
registerAllComponentNodes();
```

### Manual Node Definition (Advanced)

For fully custom node logic:

```typescript
import {
    BlueprintNodeTemplate,
    INodeExecutor,
    RegisterNode,
    ExecutionContext,
    ExecutionResult
} from '@esengine/blueprint';

const MyNodeTemplate: BlueprintNodeTemplate = {
    type: 'MyCustomNode',
    title: 'My Custom Node',
    category: 'custom',
    description: 'Custom node example',
    inputs: [
        { name: 'exec', type: 'exec', direction: 'input', isExec: true },
        { name: 'value', type: 'number', direction: 'input', defaultValue: 0 }
    ],
    outputs: [
        { name: 'exec', type: 'exec', direction: 'output', isExec: true },
        { name: 'result', type: 'number', direction: 'output' }
    ]
};

@RegisterNode(MyNodeTemplate)
class MyNodeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = context.getInput<number>(node.id, 'value');
        return {
            outputs: { result: value * 2 },
            nextExec: 'exec'
        };
    }
}
```

## Node Categories

| Category | Description | Color |
|----------|-------------|-------|
| `event` | Event nodes | Red |
| `flow` | Flow control | Gray |
| `entity` | Entity operations | Blue |
| `component` | Component access | Cyan |
| `math` | Math operations | Green |
| `logic` | Logic operations | Red |
| `variable` | Variable access | Purple |
| `time` | Time utilities | Cyan |
| `debug` | Debug utilities | Gray |
| `custom` | Custom nodes | Blue-gray |

## Best Practices

1. **File Organization**
   - Place blueprint files in `assets/blueprints/` directory
   - Use meaningful file names like `player-controller.blueprint.json`

2. **Component Design**
   - Use `@BlueprintExpose` to mark components that should be exposed to blueprints
   - Provide clear `displayName` for properties and methods
   - Mark execution methods with `isExec: true`

3. **Performance Considerations**
   - Avoid heavy computation in Tick events
   - Use variables to cache intermediate results
   - Pure function nodes automatically cache outputs

4. **Debugging Tips**
   - Use Print nodes to output intermediate values
   - Enable `vm.debug = true` to view execution logs

## FAQ

### Q: Node menu is empty?

A: Click the **Rescan** button to scan for blueprint node classes in your project. Make sure you have called `registerAllComponentNodes()`.

### Q: Blueprint doesn't execute?

A: Check:
1. Entity has `BlueprintComponent` added
2. `BlueprintExecutionSystem` is registered to scene
3. `blueprintAsset` is correctly loaded
4. `autoStart` is `true`

### Q: How to trigger custom events?

A: Trigger through VM:
```typescript
const bp = entity.getComponent(BlueprintComponent);
bp.vm?.triggerCustomEvent('OnPickup', { item: itemEntity });
```

## Related Documentation

- [Blueprint Runtime API](/en/modules/blueprint/) - BlueprintVM and core API
- [Custom Nodes](/en/modules/blueprint/custom-nodes) - Detailed node creation guide
- [Built-in Nodes](/en/modules/blueprint/nodes) - Built-in node reference
