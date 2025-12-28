---
title: "Streaming System"
description: "ChunkStreamingSystem manages automatic chunk loading based on anchor positions"
---

The `ChunkStreamingSystem` automatically manages chunk loading and unloading based on `StreamingAnchorComponent` positions.

## Setup

```typescript
import {
    ChunkManager,
    ChunkStreamingSystem,
    ChunkLoaderComponent,
    StreamingAnchorComponent
} from '@esengine/world-streaming';

// Create and configure chunk manager
const chunkManager = new ChunkManager(512);
chunkManager.setScene(scene);
chunkManager.setDataProvider(myProvider);

// Create streaming system
const streamingSystem = new ChunkStreamingSystem();
streamingSystem.setChunkManager(chunkManager);
scene.addSystem(streamingSystem);

// Create loader entity with configuration
const loaderEntity = scene.createEntity('ChunkLoader');
const loader = loaderEntity.addComponent(new ChunkLoaderComponent());
loader.chunkSize = 512;
loader.loadRadius = 2;
loader.unloadRadius = 4;
```

## Streaming Anchor

The `StreamingAnchorComponent` marks entities as chunk loading anchors. Chunks are loaded around all anchors.

```typescript
// Create player as streaming anchor
const playerEntity = scene.createEntity('Player');
const anchor = playerEntity.addComponent(new StreamingAnchorComponent());

// Update position each frame
function update() {
    anchor.x = player.worldX;
    anchor.y = player.worldY;
}
```

### Anchor Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `x` | number | 0 | World X position |
| `y` | number | 0 | World Y position |
| `weight` | number | 1.0 | Load radius multiplier |
| `bEnablePrefetch` | boolean | true | Enable prefetch for this anchor |

### Multiple Anchors

```typescript
// Main player - full load radius
const playerAnchor = player.addComponent(new StreamingAnchorComponent());
playerAnchor.weight = 1.0;

// Camera preview - smaller radius
const cameraAnchor = camera.addComponent(new StreamingAnchorComponent());
cameraAnchor.weight = 0.5;  // Half the load radius
cameraAnchor.bEnablePrefetch = false;
```

## Loader Configuration

The `ChunkLoaderComponent` configures streaming behavior.

```typescript
const loader = entity.addComponent(new ChunkLoaderComponent());

// Chunk dimensions
loader.chunkSize = 512;         // World units per chunk

// Loading radius
loader.loadRadius = 2;          // Load chunks within 2 chunks of anchor
loader.unloadRadius = 4;        // Unload beyond 4 chunks

// Performance tuning
loader.maxLoadsPerFrame = 2;    // Max async loads per frame
loader.maxUnloadsPerFrame = 1;  // Max unloads per frame
loader.unloadDelay = 3000;      // MS before unloading

// Prefetch
loader.bEnablePrefetch = true;  // Enable movement-based prefetch
loader.prefetchRadius = 1;      // Extra chunks to prefetch
```

### Coordinate Helpers

```typescript
// Convert world position to chunk coordinates
const coord = loader.worldToChunk(1500, 2300);

// Get chunk bounds
const bounds = loader.getChunkBounds(coord);
```

## Prefetch System

When enabled, the system prefetches chunks in the movement direction:

```
Movement Direction →

    [ ][ ][ ]      [ ][P][P]    P = Prefetch
    [L][L][L]  →   [L][L][L]    L = Loaded
    [ ][ ][ ]      [ ][ ][ ]
```

```typescript
// Enable prefetch
loader.bEnablePrefetch = true;
loader.prefetchRadius = 2;  // Prefetch 2 chunks ahead

// Per-anchor prefetch control
anchor.bEnablePrefetch = true;  // Enable for main player
cameraAnchor.bEnablePrefetch = false;  // Disable for camera
```

## System Processing

The system runs each frame and:

1. Updates anchor velocities
2. Requests loads for chunks in range
3. Cancels unloads for chunks back in range
4. Requests unloads for chunks outside range
5. Processes load/unload queues

```typescript
// Access the chunk manager from system
const system = scene.getSystem(ChunkStreamingSystem);
const manager = system?.chunkManager;

if (manager) {
    console.log('Loaded:', manager.loadedChunkCount);
}
```

## Priority-Based Loading

Chunks are loaded with priority based on distance:

| Distance | Priority | Description |
|----------|----------|-------------|
| 0 | Immediate | Player's current chunk |
| 1 | High | Adjacent chunks |
| 2-4 | Normal | Nearby chunks |
| 5+ | Low | Distant chunks |
| Prefetch | Prefetch | Movement direction |

## Events

```typescript
chunkManager.setEvents({
    onChunkLoaded: (coord, entities) => {
        // Chunk ready - spawn NPCs, enable collision
        for (const entity of entities) {
            entity.getComponent(ColliderComponent)?.enable();
        }
    },
    onChunkUnloaded: (coord) => {
        // Cleanup - save state, release resources
    }
});
```
