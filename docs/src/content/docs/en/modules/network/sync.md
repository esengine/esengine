---
title: "State Sync"
description: "Interpolation, prediction and snapshot buffers"
---

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
