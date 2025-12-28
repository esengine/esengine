---
title: "World Streaming"
description: "Chunk-based world streaming for open world games"
---

`@esengine/world-streaming` provides chunk-based world streaming and management for open world games. It handles dynamic loading/unloading of world chunks based on player position.

## Installation

```bash
npm install @esengine/world-streaming
```

## Quick Start

### Basic Setup

```typescript
import {
    ChunkManager,
    ChunkStreamingSystem,
    StreamingAnchorComponent,
    ChunkLoaderComponent
} from '@esengine/world-streaming';

// Create chunk manager (512 unit chunks)
const chunkManager = new ChunkManager(512);
chunkManager.setScene(scene);

// Add streaming system
const streamingSystem = new ChunkStreamingSystem();
streamingSystem.setChunkManager(chunkManager);
scene.addSystem(streamingSystem);

// Create loader entity with config
const loaderEntity = scene.createEntity('ChunkLoader');
const loader = loaderEntity.addComponent(new ChunkLoaderComponent());
loader.chunkSize = 512;
loader.loadRadius = 2;
loader.unloadRadius = 4;

// Create player as streaming anchor
const playerEntity = scene.createEntity('Player');
const anchor = playerEntity.addComponent(new StreamingAnchorComponent());

// Update anchor position each frame
function update() {
    anchor.x = player.position.x;
    anchor.y = player.position.y;
}
```

### Procedural Generation

```typescript
import type { IChunkDataProvider, IChunkCoord, IChunkData } from '@esengine/world-streaming';

class ProceduralChunkProvider implements IChunkDataProvider {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    async loadChunkData(coord: IChunkCoord): Promise<IChunkData | null> {
        // Use deterministic random based on seed + coord
        const chunkSeed = this.hashCoord(coord);
        const rng = this.createRNG(chunkSeed);

        // Generate chunk content
        const entities = this.generateEntities(coord, rng);

        return {
            coord,
            entities,
            version: 1
        };
    }

    async saveChunkData(data: IChunkData): Promise<void> {
        // Optional: persist modified chunks
    }

    private hashCoord(coord: IChunkCoord): number {
        return this.seed ^ (coord.x * 73856093) ^ (coord.y * 19349663);
    }

    private createRNG(seed: number) {
        // Simple seeded random
        return () => {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            return seed / 0x7fffffff;
        };
    }

    private generateEntities(coord: IChunkCoord, rng: () => number) {
        // Generate resources, trees, etc.
        return [];
    }
}

// Use provider
chunkManager.setDataProvider(new ProceduralChunkProvider(12345));
```

## Core Concepts

### Chunk Lifecycle

```
Unloaded → Loading → Loaded → Unloading → Unloaded
              ↓         ↓
           Failed    (on error)
```

### Streaming Anchor

`StreamingAnchorComponent` marks entities as chunk loading anchors. The system loads chunks around all anchors and unloads chunks outside the combined range.

```typescript
// StreamingAnchorComponent implements IPositionable
interface IPositionable {
    readonly position: { x: number; y: number };
}
```

### Configuration

| Property | Default | Description |
|----------|---------|-------------|
| `chunkSize` | 512 | Chunk size in world units |
| `loadRadius` | 2 | Chunks to load around anchor |
| `unloadRadius` | 4 | Chunks to unload beyond this |
| `maxLoadsPerFrame` | 2 | Max async loads per frame |
| `unloadDelay` | 3000 | MS before unloading |
| `bEnablePrefetch` | true | Prefetch in movement direction |

## Module Setup (Optional)

For quick setup, use the module helper:

```typescript
import { worldStreamingModule } from '@esengine/world-streaming';

const chunkManager = worldStreamingModule.setup(
    scene,
    services,
    componentRegistry,
    { chunkSize: 256, bEnableCulling: true }
);
```

## Documentation

- [Chunk Manager API](./chunk-manager) - Loading queue, chunk lifecycle
- [Streaming System](./streaming-system) - Anchor-based loading
- [Serialization](./serialization) - Custom chunk serialization
- [Examples](./examples) - Procedural worlds, MMO chunks
