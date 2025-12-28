---
title: "示例"
description: "世界流式加载实践示例"
---

## 无限程序化世界

无限大世界的程序化资源生成示例。

```typescript
import {
    ChunkManager,
    ChunkStreamingSystem,
    ChunkLoaderComponent,
    StreamingAnchorComponent
} from '@esengine/world-streaming';
import type { IChunkDataProvider, IChunkCoord, IChunkData } from '@esengine/world-streaming';

// 程序化世界生成器
class WorldGenerator implements IChunkDataProvider {
    private seed: number;
    private nextEntityId = 1;

    constructor(seed: number = 12345) {
        this.seed = seed;
    }

    async loadChunkData(coord: IChunkCoord): Promise<IChunkData | null> {
        const rng = this.createChunkRNG(coord);
        const entities = [];

        // 每区块生成 5-15 个资源
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
        // 程序化生成 - 无需持久化
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

// 设置
const chunkManager = new ChunkManager(512);
chunkManager.setScene(scene);
chunkManager.setDataProvider(new WorldGenerator(12345));

const streamingSystem = new ChunkStreamingSystem();
streamingSystem.setChunkManager(chunkManager);
scene.addSystem(streamingSystem);
```

## MMO 服务端区块

带数据库持久化的 MMO 服务端区块管理。

```typescript
class ServerChunkProvider implements IChunkDataProvider {
    private db: Database;
    private cache = new Map<string, IChunkData>();

    constructor(db: Database) {
        this.db = db;
    }

    async loadChunkData(coord: IChunkCoord): Promise<IChunkData | null> {
        const key = `${coord.x},${coord.y}`;

        // 检查缓存
        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }

        // 从数据库加载
        const row = await this.db.query(
            'SELECT data FROM chunks WHERE x = ? AND y = ?',
            [coord.x, coord.y]
        );

        if (row) {
            const data = JSON.parse(row.data);
            this.cache.set(key, data);
            return data;
        }

        // 生成新区块
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
        // 新区块的程序化生成
        return { coord, entities: [], version: 1 };
    }
}

// 服务端按玩家加载区块
class PlayerChunkManager {
    private chunkManager: ChunkManager;
    private playerChunks = new Map<string, Set<string>>();

    async updatePlayerPosition(playerId: string, x: number, y: number) {
        const centerCoord = this.chunkManager.worldToChunk(x, y);
        const loadRadius = 2;

        const newChunks = new Set<string>();

        // 加载玩家周围的区块
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

        // 记录玩家已加载的区块
        this.playerChunks.set(playerId, newChunks);
    }
}
```

## 瓦片地图世界

瓦片地图与区块流式加载集成。

```typescript
import { TilemapComponent } from '@esengine/tilemap';

class TilemapChunkProvider implements IChunkDataProvider {
    private tilemapData: number[][];  // 完整瓦片地图
    private tileSize = 32;
    private chunkTiles = 16;  // 每区块 16x16 瓦片

    async loadChunkData(coord: IChunkCoord): Promise<IChunkData | null> {
        const startTileX = coord.x * this.chunkTiles;
        const startTileY = coord.y * this.chunkTiles;

        // 提取此区块的瓦片
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
            return 0;  // 超出边界 = 空
        }
        return this.tilemapData[y]?.[x] ?? 0;
    }
}

// 瓦片地图自定义序列化器
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

## 动态加载事件

响应区块加载用于游戏逻辑。

```typescript
chunkManager.setEvents({
    onChunkLoaded: (coord, entities) => {
        // 启用物理
        for (const entity of entities) {
            const collider = entity.getComponent(ColliderComponent);
            collider?.enable();
        }

        // 为已加载区块生成 NPC
        npcManager.spawnForChunk(coord);

        // 更新战争迷雾
        fogOfWar.revealChunk(coord);

        // 通知客户端（服务端）
        broadcast('ChunkLoaded', { coord, entityCount: entities.length });
    },

    onChunkUnloaded: (coord) => {
        // 保存 NPC 状态
        npcManager.saveAndRemoveForChunk(coord);

        // 更新迷雾
        fogOfWar.hideChunk(coord);

        // 通知客户端
        broadcast('ChunkUnloaded', { coord });
    },

    onChunkLoadFailed: (coord, error) => {
        console.error(`加载区块 ${coord.x},${coord.y} 失败:`, error);

        // 延迟后重试
        setTimeout(() => {
            chunkManager.requestLoad(coord);
        }, 5000);
    }
});
```

## 性能优化

```typescript
// 根据设备性能调整
function configureForDevice(loader: ChunkLoaderComponent) {
    const memory = navigator.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;

    if (memory <= 2 || cores <= 2) {
        // 低端设备
        loader.loadRadius = 1;
        loader.unloadRadius = 2;
        loader.maxLoadsPerFrame = 1;
        loader.bEnablePrefetch = false;
    } else if (memory <= 4) {
        // 中端设备
        loader.loadRadius = 2;
        loader.unloadRadius = 3;
        loader.maxLoadsPerFrame = 2;
    } else {
        // 高端设备
        loader.loadRadius = 3;
        loader.unloadRadius = 5;
        loader.maxLoadsPerFrame = 4;
        loader.prefetchRadius = 2;
    }
}
```
