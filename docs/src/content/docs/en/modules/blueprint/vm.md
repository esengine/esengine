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

## Execution Context

```typescript
interface ExecutionContext {
    blueprint: BlueprintAsset;  // Blueprint asset
    entity: Entity;             // Current entity
    scene: IScene;              // Current scene
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
blueprint.blueprintAsset = await loadBlueprintAsset('player.bp');
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
