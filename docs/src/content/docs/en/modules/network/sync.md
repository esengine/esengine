---
title: "State Sync"
description: "Component sync, interpolation, prediction and snapshot buffers"
---

## @NetworkEntity Decorator

The `@NetworkEntity` decorator marks components for automatic spawn/despawn broadcasting. When an entity containing this component is created or destroyed, ECSRoom automatically broadcasts the corresponding message to all clients.

### Basic Usage

```typescript
import { Component, ECSComponent, sync, NetworkEntity } from '@esengine/ecs-framework';

@ECSComponent('Enemy')
@NetworkEntity('Enemy')
class EnemyComponent extends Component {
    @sync('float32') x: number = 0;
    @sync('float32') y: number = 0;
    @sync('uint16') health: number = 100;
}
```

When adding this component to an entity, ECSRoom automatically broadcasts the spawn message:

```typescript
// Server-side
const entity = scene.createEntity('Enemy');
entity.addComponent(new EnemyComponent()); // Auto-broadcasts spawn

// Destroying auto-broadcasts despawn
entity.destroy(); // Auto-broadcasts despawn
```

### Configuration Options

```typescript
@NetworkEntity('Bullet', {
    autoSpawn: true,    // Auto-broadcast spawn (default true)
    autoDespawn: false  // Disable auto-broadcast despawn
})
class BulletComponent extends Component { }
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoSpawn` | `boolean` | `true` | Auto-broadcast spawn when component is added |
| `autoDespawn` | `boolean` | `true` | Auto-broadcast despawn when entity is destroyed |

### Initialization Order

When using `@NetworkEntity`, initialize data **before** adding the component:

```typescript
// ✅ Correct: Initialize first, then add
const comp = new PlayerComponent();
comp.playerId = player.id;
comp.x = 100;
comp.y = 200;
entity.addComponent(comp); // Data is correct at spawn

// ❌ Wrong: Add first, then initialize
const comp = entity.addComponent(new PlayerComponent());
comp.playerId = player.id; // Data has default values at spawn
```

### Simplified GameRoom

With `@NetworkEntity`, GameRoom becomes much cleaner:

```typescript
// No manual callbacks needed
class GameRoom extends ECSRoom {
    private setupSystems(): void {
        // Enemy spawn system (auto-broadcasts spawn)
        this.addSystem(new EnemySpawnSystem());

        // Enemy AI system
        const enemyAI = new EnemyAISystem();
        enemyAI.onDeath((enemy) => {
            enemy.destroy(); // Auto-broadcasts despawn
        });
        this.addSystem(enemyAI);
    }
}
```

### ECSRoom Configuration

You can disable the auto network entity feature in ECSRoom:

```typescript
class GameRoom extends ECSRoom {
    constructor() {
        super({
            enableAutoNetworkEntity: false // Disable auto-broadcasting
        });
    }
}
```

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

---

## Fixed-Point Sync (Lockstep)

For **Lockstep** architecture, use fixed-point numbers to ensure cross-platform determinism.

> See [Fixed-Point Numbers](/en/modules/network/fixed-point) for math basics

### FixedTransformState

Fixed-point transform state for network transmission:

```typescript
import {
    FixedTransformState,
    FixedTransformStateWithVelocity,
    type IFixedTransformStateRaw
} from '@esengine/network';

// Create state
const state = FixedTransformState.from(100, 200, Math.PI / 4);

// Serialize (sender)
const raw: IFixedTransformStateRaw = state.toRaw();
socket.send(JSON.stringify({ type: 'sync', state: raw }));

// Deserialize (receiver)
const received = FixedTransformState.fromRaw(message.state);

// Use for rendering
const { x, y, rotation } = received.toFloat();
sprite.position.set(x, y);
```

State with velocity (for extrapolation):

```typescript
const state = FixedTransformStateWithVelocity.from(
    100, 200,    // position
    0,           // rotation
    5, 3,        // velocity
    0.1          // angular velocity
);
```

### Fixed-Point Interpolators

```typescript
import {
    createFixedTransformInterpolator,
    createFixedHermiteTransformInterpolator
} from '@esengine/network';
import { Fixed32 } from '@esengine/ecs-framework-math';

// Linear interpolator
const interpolator = createFixedTransformInterpolator();

const from = FixedTransformState.from(0, 0, 0);
const to = FixedTransformState.from(100, 50, Math.PI);
const t = Fixed32.from(0.5);

const result = interpolator.interpolate(from, to, t);

// Hermite interpolator (smoother)
const hermite = createFixedHermiteTransformInterpolator(100);
```

### Fixed-Point Snapshot Buffer

Manages fixed-point state history for lockstep replay:

```typescript
import {
    FixedSnapshotBuffer,
    createFixedSnapshotBuffer
} from '@esengine/network';

// Create buffer (max 30 snapshots, 2 frame delay)
const buffer = createFixedSnapshotBuffer<FixedTransformState>(30, 2);

// Add snapshots
buffer.push({
    frame: 100,
    state: FixedTransformState.from(100, 200, 0)
});

// Get interpolation snapshots
const result = buffer.getInterpolationSnapshots(103);
if (result) {
    const { from, to, t } = result;
    const interpolated = interpolator.interpolate(from.state, to.state, t);
}

// Get latest/specific frame
const latest = buffer.getLatest();
const atFrame = buffer.getAtFrame(100);

// Rollback replay
const snapshotsToReplay = buffer.getSnapshotsAfter(98);

// Clean up old snapshots
buffer.removeSnapshotsBefore(95);
```

Sub-frame interpolation:

```typescript
// Use Fixed32 frame time (supports fractional frames)
const frameTime = Fixed32.from(102.5);
const result = buffer.getInterpolationSnapshotsFixed(frameTime);
```

### API Exports

```typescript
import {
    // State classes
    FixedTransformState,
    FixedTransformStateWithVelocity,
    type IFixedTransformStateRaw,
    type IFixedTransformStateWithVelocityRaw,

    // Interpolators
    FixedTransformInterpolator,
    FixedHermiteTransformInterpolator,
    createFixedTransformInterpolator,
    createFixedHermiteTransformInterpolator,

    // Snapshot buffer
    FixedSnapshotBuffer,
    createFixedSnapshotBuffer,
    type IFixedStateSnapshot,
    type IFixedInterpolationResult
} from '@esengine/network';
```
