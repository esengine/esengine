---
title: "Chunk Manager API"
description: "ChunkManager handles chunk lifecycle, loading queue, and spatial queries"
---

The `ChunkManager` is the core service responsible for managing chunk lifecycle, including loading, unloading, and spatial queries.

## Basic Usage

```typescript
import { ChunkManager } from '@esengine/world-streaming';

// Create manager with 512-unit chunks
const chunkManager = new ChunkManager(512);
chunkManager.setScene(scene);

// Set data provider for loading chunks
chunkManager.setDataProvider(myProvider);

// Set event callbacks
chunkManager.setEvents({
    onChunkLoaded: (coord, entities) => {
        console.log(`Chunk (${coord.x}, ${coord.y}) loaded with ${entities.length} entities`);
    },
    onChunkUnloaded: (coord) => {
        console.log(`Chunk (${coord.x}, ${coord.y}) unloaded`);
    },
    onChunkLoadFailed: (coord, error) => {
        console.error(`Failed to load chunk (${coord.x}, ${coord.y}):`, error);
    }
});
```

## Loading and Unloading

### Request Loading

```typescript
import { EChunkPriority } from '@esengine/world-streaming';

// Request with priority
chunkManager.requestLoad({ x: 0, y: 0 }, EChunkPriority.Immediate);
chunkManager.requestLoad({ x: 1, y: 0 }, EChunkPriority.High);
chunkManager.requestLoad({ x: 2, y: 0 }, EChunkPriority.Normal);
chunkManager.requestLoad({ x: 3, y: 0 }, EChunkPriority.Low);
chunkManager.requestLoad({ x: 4, y: 0 }, EChunkPriority.Prefetch);
```

### Priority Levels

| Priority | Value | Description |
|----------|-------|-------------|
| `Immediate` | 0 | Current chunk (player standing on) |
| `High` | 1 | Adjacent chunks |
| `Normal` | 2 | Nearby chunks |
| `Low` | 3 | Distant visible chunks |
| `Prefetch` | 4 | Movement direction prefetch |

### Request Unloading

```typescript
// Request unload with 3 second delay
chunkManager.requestUnload({ x: 5, y: 5 }, 3000);

// Cancel pending unload (player moved back)
chunkManager.cancelUnload({ x: 5, y: 5 });
```

### Process Queues

```typescript
// In your update loop or system
await chunkManager.processLoads(2);  // Load up to 2 chunks per frame
chunkManager.processUnloads(1);       // Unload up to 1 chunk per frame
```

## Spatial Queries

### Coordinate Conversion

```typescript
// World position to chunk coordinates
const coord = chunkManager.worldToChunk(1500, 2300);
// Result: { x: 2, y: 4 } for 512-unit chunks

// Get chunk bounds in world space
const bounds = chunkManager.getChunkBounds({ x: 2, y: 4 });
// Result: { minX: 1024, minY: 2048, maxX: 1536, maxY: 2560 }
```

### Chunk Queries

```typescript
// Check if chunk is loaded
if (chunkManager.isChunkLoaded({ x: 0, y: 0 })) {
    const chunk = chunkManager.getChunk({ x: 0, y: 0 });
    console.log('Entities:', chunk.entities.length);
}

// Get missing chunks in radius
const missing = chunkManager.getMissingChunks({ x: 0, y: 0 }, 2);
for (const coord of missing) {
    chunkManager.requestLoad(coord);
}

// Get chunks outside radius (for unloading)
const outside = chunkManager.getChunksOutsideRadius({ x: 0, y: 0 }, 4);
for (const coord of outside) {
    chunkManager.requestUnload(coord, 3000);
}

// Iterate all loaded chunks
chunkManager.forEachChunk((info, coord) => {
    console.log(`Chunk (${coord.x}, ${coord.y}): ${info.state}`);
});
```

## Statistics

```typescript
console.log('Loaded chunks:', chunkManager.loadedChunkCount);
console.log('Pending loads:', chunkManager.pendingLoadCount);
console.log('Pending unloads:', chunkManager.pendingUnloadCount);
console.log('Chunk size:', chunkManager.chunkSize);
```

## Chunk States

```typescript
import { EChunkState } from '@esengine/world-streaming';

// Chunk lifecycle states
EChunkState.Unloaded   // Not in memory
EChunkState.Loading    // Being loaded
EChunkState.Loaded     // Ready for use
EChunkState.Unloading  // Being removed
EChunkState.Failed     // Load failed
```

## Data Provider Interface

```typescript
import type { IChunkDataProvider, IChunkCoord, IChunkData } from '@esengine/world-streaming';

class MyChunkProvider implements IChunkDataProvider {
    async loadChunkData(coord: IChunkCoord): Promise<IChunkData | null> {
        // Load from database, file, or procedural generation
        const data = await fetchChunkFromServer(coord);
        return data;
    }

    async saveChunkData(data: IChunkData): Promise<void> {
        // Save modified chunks
        await saveChunkToServer(data);
    }
}
```

## Cleanup

```typescript
// Unload all chunks
chunkManager.clear();

// Full disposal (implements IService)
chunkManager.dispose();
```
