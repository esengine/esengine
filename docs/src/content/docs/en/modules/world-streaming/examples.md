---
title: "Examples"
description: "Practical examples of world streaming"
---

## Infinite Procedural World

An infinite world with procedural resource generation.

```typescript
import {
    ChunkManager,
    ChunkStreamingSystem,
    ChunkLoaderComponent,
    StreamingAnchorComponent
} from '@esengine/world-streaming';
import type { IChunkDataProvider, IChunkCoord, IChunkData } from '@esengine/world-streaming';

// Procedural world generator
class WorldGenerator implements IChunkDataProvider {
    private seed: number;
    private nextEntityId = 1;

    constructor(seed: number = 12345) {
        this.seed = seed;
    }

    async loadChunkData(coord: IChunkCoord): Promise<IChunkData | null> {
        const rng = this.createChunkRNG(coord);
        const entities = [];

        // Generate 5-15 resources per chunk
        const resourceCount = 5 + Math.floor(rng() * 10);

        for (let i = 0; i < resourceCount; i++) {
            const type = this.randomResourceType(rng);

            entities.push({
                name: `Resource_${this.nextEntityId++}`,
                localPosition: {
                    x: rng() * 512,
                    y: rng() * 512
                },
                components: {
                    ResourceNode: {
                        type,
                        amount: this.getResourceAmount(type, rng),
                        regenRate: this.getRegenRate(type)
                    }
                }
            });
        }

        return { coord, entities, version: 1 };
    }

    async saveChunkData(_data: IChunkData): Promise<void> {
        // Procedural - no persistence needed
    }

    private createChunkRNG(coord: IChunkCoord) {
        let seed = this.seed ^ (coord.x * 73856093) ^ (coord.y * 19349663);
        return () => {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            return seed / 0x7fffffff;
        };
    }

    private randomResourceType(rng: () => number) {
        const types = ['energyWell', 'oreVein', 'crystalDeposit'];
        const weights = [0.5, 0.35, 0.15];

        let random = rng();
        for (let i = 0; i < types.length; i++) {
            random -= weights[i];
            if (random <= 0) return types[i];
        }
        return types[0];
    }

    private getResourceAmount(type: string, rng: () => number) {
        switch (type) {
            case 'energyWell': return 300 + Math.floor(rng() * 200);
            case 'oreVein': return 500 + Math.floor(rng() * 300);
            case 'crystalDeposit': return 100 + Math.floor(rng() * 100);
            default: return 100;
        }
    }

    private getRegenRate(type: string) {
        switch (type) {
            case 'energyWell': return 2;
            case 'oreVein': return 1;
            case 'crystalDeposit': return 0.2;
            default: return 1;
        }
    }
}

// Setup
const chunkManager = new ChunkManager(512);
chunkManager.setScene(scene);
chunkManager.setDataProvider(new WorldGenerator(12345));

const streamingSystem = new ChunkStreamingSystem();
streamingSystem.setChunkManager(chunkManager);
scene.addSystem(streamingSystem);
```

## MMO Server Chunks

Server-side chunk management for MMO with database persistence.

```typescript
class ServerChunkProvider implements IChunkDataProvider {
    private db: Database;
    private cache = new Map<string, IChunkData>();

    constructor(db: Database) {
        this.db = db;
    }

    async loadChunkData(coord: IChunkCoord): Promise<IChunkData | null> {
        const key = `${coord.x},${coord.y}`;

        // Check cache
        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }

        // Load from database
        const row = await this.db.query(
            'SELECT data FROM chunks WHERE x = ? AND y = ?',
            [coord.x, coord.y]
        );

        if (row) {
            const data = JSON.parse(row.data);
            this.cache.set(key, data);
            return data;
        }

        // Generate new chunk
        const data = this.generateChunk(coord);
        await this.saveChunkData(data);
        this.cache.set(key, data);
        return data;
    }

    async saveChunkData(data: IChunkData): Promise<void> {
        const key = `${data.coord.x},${data.coord.y}`;
        this.cache.set(key, data);

        await this.db.query(
            `INSERT INTO chunks (x, y, data) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE data = VALUES(data)`,
            [data.coord.x, data.coord.y, JSON.stringify(data)]
        );
    }

    private generateChunk(coord: IChunkCoord): IChunkData {
        // Procedural generation for new chunks
        return { coord, entities: [], version: 1 };
    }
}

// Per-player chunk loading on server
class PlayerChunkManager {
    private chunkManager: ChunkManager;
    private playerChunks = new Map<string, Set<string>>();

    async updatePlayerPosition(playerId: string, x: number, y: number) {
        const centerCoord = this.chunkManager.worldToChunk(x, y);
        const loadRadius = 2;

        const newChunks = new Set<string>();

        // Load chunks around player
        for (let dx = -loadRadius; dx <= loadRadius; dx++) {
            for (let dy = -loadRadius; dy <= loadRadius; dy++) {
                const coord = { x: centerCoord.x + dx, y: centerCoord.y + dy };
                const key = `${coord.x},${coord.y}`;
                newChunks.add(key);

                if (!this.chunkManager.isChunkLoaded(coord)) {
                    await this.chunkManager.requestLoad(coord);
                }
            }
        }

        // Track player's loaded chunks
        this.playerChunks.set(playerId, newChunks);
    }
}
```

## Tile-Based World

Tilemap integration with chunk streaming.

```typescript
import { TilemapComponent } from '@esengine/tilemap';

class TilemapChunkProvider implements IChunkDataProvider {
    private tilemapData: number[][];  // Full tilemap
    private tileSize = 32;
    private chunkTiles = 16;  // 16x16 tiles per chunk

    async loadChunkData(coord: IChunkCoord): Promise<IChunkData | null> {
        const startTileX = coord.x * this.chunkTiles;
        const startTileY = coord.y * this.chunkTiles;

        // Extract tiles for this chunk
        const tiles: number[][] = [];
        for (let y = 0; y < this.chunkTiles; y++) {
            const row: number[] = [];
            for (let x = 0; x < this.chunkTiles; x++) {
                const tileX = startTileX + x;
                const tileY = startTileY + y;
                row.push(this.getTile(tileX, tileY));
            }
            tiles.push(row);
        }

        return {
            coord,
            entities: [{
                name: `TileChunk_${coord.x}_${coord.y}`,
                localPosition: { x: 0, y: 0 },
                components: {
                    TilemapChunk: { tiles }
                }
            }],
            version: 1
        };
    }

    private getTile(x: number, y: number): number {
        if (x < 0 || y < 0 || y >= this.tilemapData.length) {
            return 0;  // Out of bounds = empty
        }
        return this.tilemapData[y]?.[x] ?? 0;
    }
}

// Custom serializer for tilemap
class TilemapSerializer extends ChunkSerializer {
    protected deserializeComponents(entity: Entity, components: Record<string, unknown>): void {
        if (components.TilemapChunk) {
            const data = components.TilemapChunk as { tiles: number[][] };
            const tilemap = entity.addComponent(new TilemapComponent());
            tilemap.loadTiles(data.tiles);
        }
    }
}
```

## Dynamic Loading Events

React to chunk loading for gameplay.

```typescript
chunkManager.setEvents({
    onChunkLoaded: (coord, entities) => {
        // Enable physics
        for (const entity of entities) {
            const collider = entity.getComponent(ColliderComponent);
            collider?.enable();
        }

        // Spawn NPCs for loaded chunks
        npcManager.spawnForChunk(coord);

        // Update fog of war
        fogOfWar.revealChunk(coord);

        // Notify clients (server)
        broadcast('ChunkLoaded', { coord, entityCount: entities.length });
    },

    onChunkUnloaded: (coord) => {
        // Save NPC states
        npcManager.saveAndRemoveForChunk(coord);

        // Update fog
        fogOfWar.hideChunk(coord);

        // Notify clients
        broadcast('ChunkUnloaded', { coord });
    },

    onChunkLoadFailed: (coord, error) => {
        console.error(`Failed to load chunk ${coord.x},${coord.y}:`, error);

        // Retry after delay
        setTimeout(() => {
            chunkManager.requestLoad(coord);
        }, 5000);
    }
});
```

## Performance Optimization

```typescript
// Adjust based on device performance
function configureForDevice(loader: ChunkLoaderComponent) {
    const memory = navigator.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;

    if (memory <= 2 || cores <= 2) {
        // Low-end device
        loader.loadRadius = 1;
        loader.unloadRadius = 2;
        loader.maxLoadsPerFrame = 1;
        loader.bEnablePrefetch = false;
    } else if (memory <= 4) {
        // Mid-range
        loader.loadRadius = 2;
        loader.unloadRadius = 3;
        loader.maxLoadsPerFrame = 2;
    } else {
        // High-end
        loader.loadRadius = 3;
        loader.unloadRadius = 5;
        loader.maxLoadsPerFrame = 4;
        loader.prefetchRadius = 2;
    }
}
```
