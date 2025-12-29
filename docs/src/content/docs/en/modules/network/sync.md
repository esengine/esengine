---
title: "State Sync"
description: "Component sync, interpolation, prediction and snapshot buffers"
---

## Component Sync System

ECS component state synchronization based on `@sync` decorator.

### Define Sync Component

```typescript
import { Component, ECSComponent, sync } from '@esengine/ecs-framework';

@ECSComponent('Player')
class PlayerComponent extends Component {
    @sync("string") name: string = "";
    @sync("uint16") score: number = 0;
    @sync("float32") x: number = 0;
    @sync("float32") y: number = 0;

    // Fields without @sync won't be synced
    localData: any;
}
```

### Server-side Encoding

```typescript
import { ComponentSyncSystem } from '@esengine/network';

const syncSystem = new ComponentSyncSystem({}, true);
scene.addSystem(syncSystem);

// Encode all entities (initial connection)
const fullData = syncSystem.encodeAllEntities(true);
sendToClient(fullData);

// Encode delta (only send changes)
const deltaData = syncSystem.encodeDelta();
if (deltaData) {
    broadcast(deltaData);
}
```

### Client-side Decoding

```typescript
const syncSystem = new ComponentSyncSystem();
scene.addSystem(syncSystem);

// Register component types
syncSystem.registerComponent(PlayerComponent);

// Listen for sync events
syncSystem.addSyncListener((event) => {
    if (event.type === 'entitySpawned') {
        console.log('New entity:', event.entityId);
    }
});

// Apply state
syncSystem.applySnapshot(data);
```

### Sync Types

| Type | Description | Bytes |
|------|-------------|-------|
| `"boolean"` | Boolean | 1 |
| `"int8"` / `"uint8"` | 8-bit integer | 1 |
| `"int16"` / `"uint16"` | 16-bit integer | 2 |
| `"int32"` / `"uint32"` | 32-bit integer | 4 |
| `"float32"` | 32-bit float | 4 |
| `"float64"` | 64-bit float | 8 |
| `"string"` | String | Variable |

## Snapshot Buffer

Stores server state snapshots for interpolation:

```typescript
import { createSnapshotBuffer } from '@esengine/network';

const buffer = createSnapshotBuffer({
    maxSnapshots: 30,
    interpolationDelay: 100
});

buffer.addSnapshot({ time: serverTime, entities: states });
const interpolated = buffer.getInterpolatedState(clientTime);
```

## Transform Interpolators

### Linear Interpolator

```typescript
import { createTransformInterpolator } from '@esengine/network';

const interpolator = createTransformInterpolator();
interpolator.addState(time, { x: 0, y: 0, rotation: 0 });
const state = interpolator.getInterpolatedState(currentTime);
```

### Hermite Interpolator

Smoother interpolation using Hermite splines:

```typescript
import { createHermiteTransformInterpolator } from '@esengine/network';

const interpolator = createHermiteTransformInterpolator({ bufferSize: 10 });
interpolator.addState(time, { x: 100, y: 200, rotation: 0, vx: 5, vy: 0 });
const state = interpolator.getInterpolatedState(currentTime);
```

## Client Prediction

Reduces input lag with client-side prediction and server reconciliation:

```typescript
import { createClientPrediction } from '@esengine/network';

const prediction = createClientPrediction({
    maxPredictedInputs: 60,
    reconciliationThreshold: 0.1
});

// Predict
const seq = prediction.predict(input, state, applyInput);

// Reconcile with server
const corrected = prediction.reconcile(serverState, serverSeq, applyInput);
```

## Best Practices

1. **Interpolation delay**: 100-150ms for typical networks
2. **Prediction**: Use only for local player, interpolate remote players
3. **Snapshot count**: Keep enough snapshots to handle network jitter
