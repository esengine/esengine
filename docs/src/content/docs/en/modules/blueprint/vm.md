---
title: "Virtual Machine API"
description: "BlueprintVM execution and context"
---

## BlueprintVM

The blueprint virtual machine executes blueprint graphs:

```typescript
import { BlueprintVM } from '@esengine/blueprint';

// Create VM
const vm = new BlueprintVM(blueprintAsset, entity, scene);

// Start (triggers BeginPlay)
vm.start();

// Update each frame (triggers Tick)
vm.tick(deltaTime);

// Stop (triggers EndPlay)
vm.stop();

// Pause/Resume
vm.pause();
vm.resume();

// Trigger events
vm.triggerEvent('EventCollision', { other: otherEntity });
vm.triggerCustomEvent('OnDamage', { amount: 50 });

// Debug mode
vm.debug = true;
```

## Running on a plain component (no ECS)

If the class hosting the blueprint is not an ECS component (e.g. a Cocos `cc.Component`), use `BlueprintRunner` to run the blueprint directly against that instance — no Scene, entity, or `BlueprintSystem` required:

```typescript
import { BlueprintRunner, registerAllComponentNodes } from '@esengine/blueprint';

@ccclass('Playground')
@BlueprintExpose({ displayName: 'Playground' })
export class Playground extends Component {
    @property(JsonAsset) bluePrintJson: JsonAsset = null!;

    @BlueprintProperty({ displayName: 'Current Health', type: 'float' })
    current = 100;

    @BlueprintMethod({ displayName: 'Heal', params: [{ name: 'amount', type: 'float' }] })
    heal(amount: number) { this.current += amount; }

    private runner: BlueprintRunner | null = null;

    onLoad() {
        registerAllComponentNodes();                 // generate component nodes (once per process)
        this.runner = new BlueprintRunner(this.bluePrintJson!.json as any, { self: this });
        this.runner.start();
    }
    update(dt: number) { this.runner?.tick(dt); }
    onDestroy() { this.runner?.stop(); }
}
```

- **Target defaults to Self**: when a component method/property node's `component` pin is unconnected, it targets `self` (here, this `Playground` instance) — so the `Heal` node calls `this.heal(amount)` with nothing wired, the argument flowing through the `amount` pin.
- `entity` / `scene` are `null` under `BlueprintRunner`, so pure-ECS nodes (Create Entity, Add Component, …) are unavailable; method calls, property get/set, events, flow and math nodes all work.
- For ECS integration, keep using `BlueprintComponent` + `BlueprintSystem`.

## Execution Context

```typescript
interface ExecutionContext {
    blueprint: BlueprintAsset;  // Blueprint asset
    entity: Entity | null;      // Current entity (null under BlueprintRunner)
    scene: IScene | null;       // Current scene (null under BlueprintRunner)
    self: object | null;        // Host instance the blueprint is bound to (method/property nodes target it by default)
    deltaTime: number;          // Frame delta time
    time: number;               // Total runtime

    // Get input value
    evaluateInput(nodeId: string, pinName: string, defaultValue: unknown): unknown;

    // Set output value
    setOutput(nodeId: string, pinName: string, value: unknown): void;

    // Variable access
    getVariable<T>(name: string): T;
    setVariable(name: string, value: unknown): void;
}
```

## Execution Result

```typescript
interface ExecutionResult {
    outputs?: Record<string, unknown>; // Output values
    nextExec?: string | null;          // Next execution pin
    delay?: number;                    // Delay execution (ms)
    yield?: boolean;                   // Pause until next frame
    error?: string;                    // Error message
}
```

## ECS Integration

### Using Built-in Blueprint System

```typescript
import { Scene, Core } from '@esengine/ecs-framework';
import { BlueprintSystem, BlueprintComponent } from '@esengine/blueprint';

// Add blueprint system to scene
const scene = new Scene();
scene.addSystem(new BlueprintSystem());
Core.setScene(scene);

// Add blueprint to entity
const entity = scene.createEntity('Player');
const blueprint = new BlueprintComponent();
blueprint.blueprintAsset = await loadBlueprintAsset('player.blueprint.json');
entity.addComponent(blueprint);
```

### Triggering Blueprint Events

```typescript
// Get blueprint component from entity and trigger events
const blueprint = entity.getComponent(BlueprintComponent);
if (blueprint?.vm) {
    blueprint.vm.triggerEvent('EventCollision', { other: otherEntity });
    blueprint.vm.triggerCustomEvent('OnPickup', { item: itemEntity });
}
```

## Serialization

### Saving Blueprints

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

### Loading Blueprints

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
