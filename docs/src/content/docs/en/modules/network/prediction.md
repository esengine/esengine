---
title: "Client Prediction"
description: "Local input prediction and server reconciliation"
---

Client prediction is a key technique in networked games to reduce input latency. By immediately applying player inputs locally while waiting for server confirmation, games feel more responsive.

## NetworkPredictionSystem

`NetworkPredictionSystem` is an ECS system dedicated to handling local player prediction.

### Basic Usage

```typescript
import { NetworkPlugin } from '@esengine/network';

const networkPlugin = new NetworkPlugin({
    enablePrediction: true,
    predictionConfig: {
        moveSpeed: 200,           // Movement speed (units/second)
        maxUnacknowledgedInputs: 60,  // Max unacknowledged inputs
        reconciliationThreshold: 0.5,  // Reconciliation threshold
        reconciliationSpeed: 10,       // Reconciliation speed
    }
});

await Core.installPlugin(networkPlugin);
```

### Setting Up Local Player

After the local player entity spawns, set its network ID:

```typescript
networkPlugin.registerPrefab('player', (scene, spawn) => {
    const entity = scene.createEntity(`player_${spawn.netId}`);

    const identity = entity.addComponent(new NetworkIdentity());
    identity.netId = spawn.netId;
    identity.ownerId = spawn.ownerId;
    identity.bHasAuthority = spawn.ownerId === networkPlugin.localPlayerId;
    identity.bIsLocalPlayer = identity.bHasAuthority;

    entity.addComponent(new NetworkTransform());

    // Set local player for prediction
    if (identity.bIsLocalPlayer) {
        networkPlugin.setLocalPlayerNetId(spawn.netId);
    }

    return entity;
});
```

### Sending Input

```typescript
// Send movement input in game loop
function onUpdate() {
    const moveX = Input.getAxis('horizontal');
    const moveY = Input.getAxis('vertical');

    if (moveX !== 0 || moveY !== 0) {
        networkPlugin.sendMoveInput(moveX, moveY);
    }

    // Send action input
    if (Input.isPressed('attack')) {
        networkPlugin.sendActionInput('attack');
    }
}
```

## Prediction Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `moveSpeed` | `number` | 200 | Movement speed (units/second) |
| `enabled` | `boolean` | true | Whether prediction is enabled |
| `maxUnacknowledgedInputs` | `number` | 60 | Max unacknowledged inputs |
| `reconciliationThreshold` | `number` | 0.5 | Position difference threshold for reconciliation |
| `reconciliationSpeed` | `number` | 10 | Reconciliation smoothing speed |

## How It Works

```
Client                              Server
   │                                   │
   ├─ 1. Capture input (seq=1)         │
   ├─ 2. Predict movement locally      │
   ├─ 3. Send input to server ─────────►
   │                                   │
   ├─ 4. Continue capturing (seq=2,3...) │
   ├─ 5. Continue predicting           │
   │                                   │
   │                                   ├─ 6. Process input (seq=1)
   │                                   │
   ◄──────── 7. Return state (ackSeq=1) ─
   │                                   │
   ├─ 8. Compare prediction with server │
   ├─ 9. Replay inputs seq=2,3...      │
   ├─ 10. Smooth correction            │
   │                                   │
```

### Step by Step

1. **Input Capture**: Capture player input and assign sequence number
2. **Local Prediction**: Immediately apply input to local state
3. **Send Input**: Send input to server
4. **Cache Input**: Save input for later reconciliation
5. **Receive Acknowledgment**: Server returns authoritative state with ack sequence
6. **State Comparison**: Compare predicted state with server state
7. **Input Replay**: Recalculate state using cached unacknowledged inputs
8. **Smooth Correction**: Interpolate smoothly to correct position

## Low-Level API

For fine-grained control, use the `ClientPrediction` class directly:

```typescript
import { createClientPrediction, type IPredictor } from '@esengine/network';

// Define state type
interface PlayerState {
    x: number;
    y: number;
    rotation: number;
}

// Define input type
interface PlayerInput {
    dx: number;
    dy: number;
}

// Define predictor
const predictor: IPredictor<PlayerState, PlayerInput> = {
    predict(state: PlayerState, input: PlayerInput, dt: number): PlayerState {
        return {
            x: state.x + input.dx * MOVE_SPEED * dt,
            y: state.y + input.dy * MOVE_SPEED * dt,
            rotation: state.rotation,
        };
    }
};

// Create client prediction
const prediction = createClientPrediction(predictor, {
    maxUnacknowledgedInputs: 60,
    reconciliationThreshold: 0.5,
    reconciliationSpeed: 10,
});

// Record input and get predicted state
const input = { dx: 1, dy: 0 };
const predictedState = prediction.recordInput(input, currentState, deltaTime);

// Get input to send
const inputToSend = prediction.getInputToSend();

// Reconcile with server state
prediction.reconcile(
    serverState,
    serverAckSeq,
    (state) => ({ x: state.x, y: state.y }),
    deltaTime
);

// Get correction offset
const offset = prediction.correctionOffset;
```

## Enable/Disable Prediction

```typescript
// Toggle prediction at runtime
networkPlugin.setPredictionEnabled(false);

// Check prediction status
if (networkPlugin.isPredictionEnabled) {
    console.log('Prediction is active');
}
```

## Best Practices

### 1. Set Appropriate Reconciliation Threshold

```typescript
// Action games: lower threshold, more precise
predictionConfig: {
    reconciliationThreshold: 0.1,
}

// Casual games: higher threshold, smoother
predictionConfig: {
    reconciliationThreshold: 1.0,
}
```

### 2. Prediction Only for Local Player

Remote players should use interpolation, not prediction:

```typescript
const identity = entity.getComponent(NetworkIdentity);

if (identity.bIsLocalPlayer) {
    // Use prediction system
} else {
    // Use NetworkSyncSystem interpolation
}
```

### 3. Handle High Latency

```typescript
// High latency network: increase buffer
predictionConfig: {
    maxUnacknowledgedInputs: 120,  // Increase buffer
    reconciliationSpeed: 5,        // Slower correction
}
```

### 4. Deterministic Prediction

Ensure client and server use the same physics calculations:

```typescript
// Use fixed timestep
const FIXED_DT = 1 / 60;

function applyInput(state: PlayerState, input: PlayerInput): PlayerState {
    // Use fixed timestep instead of actual deltaTime
    return {
        x: state.x + input.dx * MOVE_SPEED * FIXED_DT,
        y: state.y + input.dy * MOVE_SPEED * FIXED_DT,
        rotation: state.rotation,
    };
}
```

## Debugging

```typescript
// Get prediction system instance
const predictionSystem = networkPlugin.predictionSystem;

if (predictionSystem) {
    console.log('Pending inputs:', predictionSystem.pendingInputCount);
    console.log('Current sequence:', predictionSystem.inputSequence);
}
```
