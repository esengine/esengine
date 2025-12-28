---
title: "区块序列化"
description: "自定义区块数据序列化"
---

`ChunkSerializer` 负责实体数据与区块存储格式之间的转换。

## 默认序列化器

```typescript
import { ChunkSerializer, ChunkManager } from '@esengine/world-streaming';

const serializer = new ChunkSerializer();
const chunkManager = new ChunkManager(512, serializer);
```

## 自定义序列化器

继承 `ChunkSerializer` 实现自定义序列化逻辑：

```typescript
import { ChunkSerializer } from '@esengine/world-streaming';
import type { Entity, IScene } from '@esengine/ecs-framework';
import type { IChunkCoord, IChunkData, IChunkBounds } from '@esengine/world-streaming';

class GameChunkSerializer extends ChunkSerializer {
    /**
     * 获取实体位置
     * 重写以使用你的位置组件
     */
    protected getPositionable(entity: Entity) {
        const transform = entity.getComponent(TransformComponent);
        if (transform) {
            return { position: { x: transform.x, y: transform.y } };
        }
        return null;
    }

    /**
     * 反序列化后设置实体位置
     */
    protected setEntityPosition(entity: Entity, x: number, y: number): void {
        const transform = entity.addComponent(new TransformComponent());
        transform.x = x;
        transform.y = y;
    }

    /**
     * 序列化组件
     */
    protected serializeComponents(entity: Entity): Record<string, unknown> {
        const data: Record<string, unknown> = {};

        const resource = entity.getComponent(ResourceComponent);
        if (resource) {
            data.ResourceComponent = {
                type: resource.type,
                amount: resource.amount,
                maxAmount: resource.maxAmount
            };
        }

        const npc = entity.getComponent(NPCComponent);
        if (npc) {
            data.NPCComponent = {
                id: npc.id,
                state: npc.state
            };
        }

        return data;
    }

    /**
     * 反序列化组件
     */
    protected deserializeComponents(entity: Entity, components: Record<string, unknown>): void {
        if (components.ResourceComponent) {
            const data = components.ResourceComponent as any;
            const resource = entity.addComponent(new ResourceComponent());
            resource.type = data.type;
            resource.amount = data.amount;
            resource.maxAmount = data.maxAmount;
        }

        if (components.NPCComponent) {
            const data = components.NPCComponent as any;
            const npc = entity.addComponent(new NPCComponent());
            npc.id = data.id;
            npc.state = data.state;
        }
    }

    /**
     * 过滤需要序列化的组件
     */
    protected shouldSerializeComponent(componentName: string): boolean {
        const include = ['ResourceComponent', 'NPCComponent', 'BuildingComponent'];
        return include.includes(componentName);
    }
}
```

## 区块数据格式

```typescript
interface IChunkData {
    coord: IChunkCoord;             // 区块坐标
    entities: ISerializedEntity[];  // 实体数据
    version: number;                // 数据版本
}

interface ISerializedEntity {
    name: string;                           // 实体名称
    localPosition: { x: number; y: number }; // 区块内位置
    components: Record<string, unknown>;     // 组件数据
}

interface IChunkCoord {
    x: number;  // 区块 X 坐标
    y: number;  // 区块 Y 坐标
}
```

## 带序列化的数据提供器

```typescript
class DatabaseChunkProvider implements IChunkDataProvider {
    async loadChunkData(coord: IChunkCoord): Promise<IChunkData | null> {
        const key = `chunk_${coord.x}_${coord.y}`;
        const json = await database.get(key);

        if (!json) return null;
        return JSON.parse(json) as IChunkData;
    }

    async saveChunkData(data: IChunkData): Promise<void> {
        const key = `chunk_${data.coord.x}_${data.coord.y}`;
        await database.set(key, JSON.stringify(data));
    }
}
```

## 程序化生成与序列化器

```typescript
class ProceduralProvider implements IChunkDataProvider {
    private serializer: GameChunkSerializer;

    async loadChunkData(coord: IChunkCoord): Promise<IChunkData | null> {
        const entities = this.generateEntities(coord);

        return {
            coord,
            entities,
            version: 1
        };
    }

    private generateEntities(coord: IChunkCoord): ISerializedEntity[] {
        const entities: ISerializedEntity[] = [];
        const rng = this.createRNG(coord);

        // 生成树木
        const treeCount = Math.floor(rng() * 10);
        for (let i = 0; i < treeCount; i++) {
            entities.push({
                name: `Tree_${coord.x}_${coord.y}_${i}`,
                localPosition: {
                    x: rng() * 512,
                    y: rng() * 512
                },
                components: {
                    TreeComponent: { type: 'oak', health: 100 }
                }
            });
        }

        // 生成资源
        if (rng() > 0.7) {
            entities.push({
                name: `Resource_${coord.x}_${coord.y}`,
                localPosition: { x: 256, y: 256 },
                components: {
                    ResourceComponent: {
                        type: 'iron',
                        amount: 500,
                        maxAmount: 500
                    }
                }
            });
        }

        return entities;
    }
}
```

## 版本迁移

```typescript
class VersionedSerializer extends ChunkSerializer {
    private static readonly CURRENT_VERSION = 2;

    deserialize(data: IChunkData, scene: IScene): Entity[] {
        // 迁移旧数据
        if (data.version < 2) {
            data = this.migrateV1toV2(data);
        }

        return super.deserialize(data, scene);
    }

    private migrateV1toV2(data: IChunkData): IChunkData {
        // 转换旧组件格式
        for (const entity of data.entities) {
            if (entity.components.OldResource) {
                entity.components.ResourceComponent = entity.components.OldResource;
                delete entity.components.OldResource;
            }
        }

        data.version = 2;
        return data;
    }
}
```
