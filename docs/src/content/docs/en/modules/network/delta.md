---
title: "State Delta Compression"
description: "Reduce network bandwidth with incremental sync"
---

State delta compression reduces network bandwidth by only sending fields that have changed. For frequently synchronized game state, this can significantly reduce data transmission.

## StateDeltaCompressor

The `StateDeltaCompressor` class is used to compress and decompress state deltas.

### Basic Usage

```typescript
import { createStateDeltaCompressor, type SyncData } from '@esengine/network';

// Create compressor
const compressor = createStateDeltaCompressor({
    positionThreshold: 0.01,      // Position change threshold
    rotationThreshold: 0.001,     // Rotation change threshold (radians)
    velocityThreshold: 0.1,       // Velocity change threshold
    fullSnapshotInterval: 60,     // Full snapshot interval (frames)
});

// Compress sync data
const syncData: SyncData = {
    frame: 100,
    timestamp: Date.now(),
    entities: [
        { netId: 1, pos: { x: 100, y: 200 }, rot: 0 },
        { netId: 2, pos: { x: 300, y: 400 }, rot: 1.5 },
    ],
};

const deltaData = compressor.compress(syncData);
// deltaData only contains changed fields

// Decompress delta data
const fullData = compressor.decompress(deltaData);
```

## Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `positionThreshold` | `number` | 0.01 | Position change threshold |
| `rotationThreshold` | `number` | 0.001 | Rotation change threshold (radians) |
| `velocityThreshold` | `number` | 0.1 | Velocity change threshold |
| `fullSnapshotInterval` | `number` | 60 | Full snapshot interval (frames) |

## Delta Flags

Bit flags indicate which fields have changed:

```typescript
import { DeltaFlags } from '@esengine/network';

// Flag definitions
DeltaFlags.NONE           // 0 - No change
DeltaFlags.POSITION       // 1 - Position changed
DeltaFlags.ROTATION       // 2 - Rotation changed
DeltaFlags.VELOCITY       // 4 - Velocity changed
DeltaFlags.ANGULAR_VELOCITY // 8 - Angular velocity changed
DeltaFlags.CUSTOM         // 16 - Custom data changed
```

## Data Format

### Full State

```typescript
interface EntitySyncState {
    netId: number;
    pos?: { x: number; y: number };
    rot?: number;
    vel?: { x: number; y: number };
    angVel?: number;
    custom?: Record<string, unknown>;
}
```

### Delta State

```typescript
interface EntityDeltaState {
    netId: number;
    flags: number;        // Change flags
    pos?: { x: number; y: number };   // Only present when POSITION flag set
    rot?: number;         // Only present when ROTATION flag set
    vel?: { x: number; y: number };   // Only present when VELOCITY flag set
    angVel?: number;      // Only present when ANGULAR_VELOCITY flag set
    custom?: Record<string, unknown>; // Only present when CUSTOM flag set
}
```

## How It Works

```
Frame 1 (full snapshot):
  Entity 1: pos=(100, 200), rot=0

Frame 2 (delta):
  Entity 1: flags=POSITION, pos=(101, 200)  // Only X changed

Frame 3 (delta):
  Entity 1: flags=0  // No change, not sent

Frame 4 (delta):
  Entity 1: flags=POSITION|ROTATION, pos=(105, 200), rot=0.5

Frame 60 (forced full snapshot):
  Entity 1: pos=(200, 300), rot=1.0, vel=(5, 0)
```

## Server-Side Usage

```typescript
import { createStateDeltaCompressor } from '@esengine/network';

class GameServer {
    private compressor = createStateDeltaCompressor();

    // Broadcast state updates
    broadcastState(entities: EntitySyncState[]) {
        const syncData: SyncData = {
            frame: this.currentFrame,
            timestamp: Date.now(),
            entities,
        };

        // Compress data
        const deltaData = this.compressor.compress(syncData);

        // Send delta data
        this.broadcast('sync', deltaData);
    }

    // Cleanup when player leaves
    onPlayerLeave(netId: number) {
        this.compressor.removeEntity(netId);
    }
}
```

## Client-Side Usage

```typescript
class GameClient {
    private compressor = createStateDeltaCompressor();

    // Receive delta data
    onSyncReceived(deltaData: DeltaSyncData) {
        // Decompress to full state
        const fullData = this.compressor.decompress(deltaData);

        // Apply state
        for (const entity of fullData.entities) {
            this.applyEntityState(entity);
        }
    }
}
```

## Bandwidth Savings Example

Assume each entity has the following data:

| Field | Size (bytes) |
|-------|-------------|
| netId | 4 |
| pos.x | 8 |
| pos.y | 8 |
| rot | 8 |
| vel.x | 8 |
| vel.y | 8 |
| angVel | 8 |
| **Total** | **52** |

With delta compression:

| Scenario | Original | Compressed | Savings |
|----------|----------|------------|---------|
| Only position changed | 52 | 4+1+16 = 21 | 60% |
| Only rotation changed | 52 | 4+1+8 = 13 | 75% |
| Stationary | 52 | 0 | 100% |
| Position + rotation changed | 52 | 4+1+24 = 29 | 44% |

## Forcing Full Snapshot

Some situations require sending full snapshots:

```typescript
// When new player joins
compressor.forceFullSnapshot();
const data = compressor.compress(syncData);
// This will send full state

// On reconnection
compressor.clear();  // Clear history
compressor.forceFullSnapshot();
```

## Custom Data

Support for syncing custom game data:

```typescript
const syncData: SyncData = {
    frame: 100,
    timestamp: Date.now(),
    entities: [
        {
            netId: 1,
            pos: { x: 100, y: 200 },
            custom: {
                health: 80,
                mana: 50,
                buffs: ['speed', 'shield'],
            },
        },
    ],
};

// Custom data is also delta compressed
const deltaData = compressor.compress(syncData);
```

## Best Practices

### 1. Set Appropriate Thresholds

```typescript
// High precision games (e.g., competitive)
const compressor = createStateDeltaCompressor({
    positionThreshold: 0.001,
    rotationThreshold: 0.0001,
});

// Casual games
const compressor = createStateDeltaCompressor({
    positionThreshold: 0.1,
    rotationThreshold: 0.01,
});
```

### 2. Adjust Full Snapshot Interval

```typescript
// High reliability (unstable network)
fullSnapshotInterval: 30,  // Full snapshot every 30 frames

// Low bandwidth priority
fullSnapshotInterval: 120, // Full snapshot every 120 frames
```

### 3. Combine with AOI

```typescript
// Filter with AOI first, then delta compress
const filteredEntities = aoiSystem.filterSyncData(playerId, allEntities);
const syncData = { frame, timestamp, entities: filteredEntities };
const deltaData = compressor.compress(syncData);
```

### 4. Handle Entity Removal

```typescript
// Clean up compressor state when entity despawns
function onEntityDespawn(netId: number) {
    compressor.removeEntity(netId);
}
```

## Integration with Other Features

```
                    ┌─────────────────┐
                    │   Game State    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   AOI Filter    │  ← Only process entities in view
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Delta Compress  │  ← Only send changed fields
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Network Send    │
                    └─────────────────┘
```

## Debugging

```typescript
const compressor = createStateDeltaCompressor();

// Check compression efficiency
const original = syncData;
const compressed = compressor.compress(original);

console.log('Original entities:', original.entities.length);
console.log('Compressed entities:', compressed.entities.length);
console.log('Is full snapshot:', compressed.isFullSnapshot);

// View each entity's changes
for (const delta of compressed.entities) {
    console.log(`Entity ${delta.netId}:`, {
        hasPosition: !!(delta.flags & DeltaFlags.POSITION),
        hasRotation: !!(delta.flags & DeltaFlags.ROTATION),
        hasVelocity: !!(delta.flags & DeltaFlags.VELOCITY),
        hasCustom: !!(delta.flags & DeltaFlags.CUSTOM),
    });
}
```
