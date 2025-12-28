import type { Entity, IScene } from '@esengine/ecs-framework';
import type { IPositionable } from '@esengine/spatial';
import type { IChunkCoord, IChunkData, ISerializedEntity, IChunkBounds } from '../types';

/**
 * 区块序列化器接口
 *
 * Interface for chunk serialization/deserialization.
 */
export interface IChunkSerializer {
    serialize(coord: IChunkCoord, entities: Entity[], bounds: IChunkBounds): IChunkData;
    deserialize(data: IChunkData, scene: IScene): Entity[];
}

/**
 * 默认区块序列化器
 *
 * Default chunk serializer implementation.
 * Override for custom serialization logic.
 */
export class ChunkSerializer implements IChunkSerializer {
    private static readonly DATA_VERSION = 1;

    /**
     * 序列化区块
     *
     * Serialize entities within a chunk.
     */
    serialize(coord: IChunkCoord, entities: Entity[], bounds: IChunkBounds): IChunkData {
        const serializedEntities: ISerializedEntity[] = [];

        for (const entity of entities) {
            const positionable = this.getPositionable(entity);
            if (!positionable) continue;

            const serialized: ISerializedEntity = {
                name: entity.name,
                localPosition: {
                    x: positionable.position.x - bounds.minX,
                    y: positionable.position.y - bounds.minY
                },
                components: this.serializeComponents(entity)
            };

            serializedEntities.push(serialized);
        }

        return {
            coord,
            entities: serializedEntities,
            version: ChunkSerializer.DATA_VERSION
        };
    }

    /**
     * 获取实体的可定位组件
     *
     * Get positionable component from entity.
     * Override to use custom position component.
     */
    protected getPositionable(entity: Entity): IPositionable | null {
        for (const component of entity.components) {
            if ('position' in component && typeof (component as IPositionable).position === 'object') {
                return component as IPositionable;
            }
        }
        return null;
    }

    /**
     * 反序列化区块
     *
     * Deserialize chunk data and create entities.
     * Override setEntityPosition to set position on your custom component.
     */
    deserialize(data: IChunkData, scene: IScene): Entity[] {
        const entities: Entity[] = [];
        const bounds = this.calculateBounds(data.coord);

        for (const entityData of data.entities) {
            const entity = scene.createEntity(entityData.name);

            const worldX = bounds.minX + entityData.localPosition.x;
            const worldY = bounds.minY + entityData.localPosition.y;
            this.setEntityPosition(entity, worldX, worldY);

            this.deserializeComponents(entity, entityData.components);
            entities.push(entity);
        }

        return entities;
    }

    /**
     * 设置实体位置
     *
     * Set entity position after deserialization.
     * Override to use your custom position component.
     */
    protected setEntityPosition(_entity: Entity, _x: number, _y: number): void {
        // Override in subclass to set position on your position component
    }

    /**
     * 序列化实体组件
     *
     * Serialize entity components.
     */
    protected serializeComponents(entity: Entity): Record<string, unknown> {
        const componentsData: Record<string, unknown> = {};

        for (const component of entity.components) {
            const componentName = component.constructor.name;

            if (this.shouldSerializeComponent(componentName)) {
                componentsData[componentName] = this.serializeComponent(component);
            }
        }

        return componentsData;
    }

    /**
     * 反序列化组件数据
     *
     * Deserialize component data to entity.
     */
    protected deserializeComponents(_entity: Entity, _components: Record<string, unknown>): void {
        // Override in subclass to handle specific component types
    }

    /**
     * 检查组件是否需要序列化
     *
     * Check if component should be serialized.
     */
    protected shouldSerializeComponent(componentName: string): boolean {
        const excludeList = ['ChunkComponent', 'StreamingAnchorComponent'];
        return !excludeList.includes(componentName);
    }

    /**
     * 序列化单个组件
     *
     * Serialize a single component.
     */
    protected serializeComponent(component: unknown): unknown {
        if (typeof component === 'object' && component !== null && 'toJSON' in component) {
            return (component as { toJSON: () => unknown }).toJSON();
        }
        return {};
    }

    /**
     * 计算区块边界
     *
     * Calculate chunk bounds from coordinates.
     */
    private calculateBounds(coord: IChunkCoord, chunkSize: number = 512): IChunkBounds {
        return {
            minX: coord.x * chunkSize,
            minY: coord.y * chunkSize,
            maxX: (coord.x + 1) * chunkSize,
            maxY: (coord.y + 1) * chunkSize
        };
    }
}
