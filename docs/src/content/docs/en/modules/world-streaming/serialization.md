---
title: "Chunk Serialization"
description: "Custom serialization for chunk data"
---

The `ChunkSerializer` handles converting between entity data and chunk storage format.

## Default Serializer

```typescript
import { ChunkSerializer, ChunkManager } from '@esengine/world-streaming';

const serializer = new ChunkSerializer();
const chunkManager = new ChunkManager(512, serializer);
```

## Custom Serializer

Override `ChunkSerializer` for custom serialization logic:

```typescript
import { ChunkSerializer } from '@esengine/world-streaming';
import type { Entity, IScene } from '@esengine/ecs-framework';
import type { IChunkCoord, IChunkData, IChunkBounds } from '@esengine/world-streaming';

class GameChunkSerializer extends ChunkSerializer {
    /**
     * Get position from entity
     * Override to use your position component
     */
    protected getPositionable(entity: Entity) {
        const transform = entity.getComponent(TransformComponent);
        if (transform) {
            return { position: { x: transform.x, y: transform.y } };
        }
        return null;
    }

    /**
     * Set position on entity after deserialization
     */
    protected setEntityPosition(entity: Entity, x: number, y: number): void {
        const transform = entity.addComponent(new TransformComponent());
        transform.x = x;
        transform.y = y;
    }

    /**
     * Serialize components
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
     * Deserialize components
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
     * Filter which components to serialize
     */
    protected shouldSerializeComponent(componentName: string): boolean {
        const include = ['ResourceComponent', 'NPCComponent', 'BuildingComponent'];
        return include.includes(componentName);
    }
}
```

## Chunk Data Format

```typescript
interface IChunkData {
    coord: IChunkCoord;           // Chunk coordinates
    entities: ISerializedEntity[];  // Entity data
    version: number;              // Data version
}

interface ISerializedEntity {
    name: string;                           // Entity name
    localPosition: { x: number; y: number }; // Position within chunk
    components: Record<string, unknown>;     // Component data
}

interface IChunkCoord {
    x: number;  // Chunk X coordinate
    y: number;  // Chunk Y coordinate
}
```

## Data Provider with Serialization

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

## Procedural Generation with Serializer

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

        // Generate trees
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

        // Generate resources
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

## Version Migration

```typescript
class VersionedSerializer extends ChunkSerializer {
    private static readonly CURRENT_VERSION = 2;

    deserialize(data: IChunkData, scene: IScene): Entity[] {
        // Migrate old data
        if (data.version < 2) {
            data = this.migrateV1toV2(data);
        }

        return super.deserialize(data, scene);
    }

    private migrateV1toV2(data: IChunkData): IChunkData {
        // Convert old component format
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
