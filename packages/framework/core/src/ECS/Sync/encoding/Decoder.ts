/**
 * @zh 组件状态解码器
 * @en Component state decoder
 *
 * @zh 从二进制格式解码并应用到 ECS Component
 * @en Decodes binary format and applies to ECS Components
 */

import type { Entity } from '../../Entity';
import type { Component } from '../../Component';
import type { Scene } from '../../Scene';
import type { SyncType, SyncMetadata } from '../types';
import { SyncOperation, SYNC_METADATA } from '../types';
import { BinaryReader } from './BinaryReader';
import { GlobalComponentRegistry } from '../../Core/ComponentStorage/ComponentRegistry';

/**
 * @zh 解码字段值
 * @en Decode field value
 */
function decodeFieldValue(reader: BinaryReader, type: SyncType): any {
    switch (type) {
        case 'boolean':
            return reader.readBoolean();
        case 'int8':
            return reader.readInt8();
        case 'uint8':
            return reader.readUint8();
        case 'int16':
            return reader.readInt16();
        case 'uint16':
            return reader.readUint16();
        case 'int32':
            return reader.readInt32();
        case 'uint32':
            return reader.readUint32();
        case 'float32':
            return reader.readFloat32();
        case 'float64':
            return reader.readFloat64();
        case 'string':
            return reader.readString();
    }
}

/**
 * @zh 解码并应用组件数据
 * @en Decode and apply component data
 *
 * @param component - @zh 组件实例 @en Component instance
 * @param metadata - @zh 组件同步元数据 @en Component sync metadata
 * @param reader - @zh 二进制读取器 @en Binary reader
 */
export function decodeComponent(
    component: Component,
    metadata: SyncMetadata,
    reader: BinaryReader
): void {
    const fieldCount = reader.readVarint();

    for (let i = 0; i < fieldCount; i++) {
        const fieldIndex = reader.readUint8();
        const field = metadata.fields[fieldIndex];

        if (field) {
            const value = decodeFieldValue(reader, field.type);
            // Directly set the private backing field to avoid triggering change tracking
            (component as any)[`_sync_${field.name}`] = value;
        } else {
            // Unknown field, skip based on type info in metadata
            console.warn(`Unknown sync field index: ${fieldIndex}`);
        }
    }
}

/**
 * @zh 解码实体快照结果
 * @en Decode entity snapshot result
 */
export interface DecodeEntityResult {
    /**
     * @zh 实体 ID
     * @en Entity ID
     */
    entityId: number;

    /**
     * @zh 是否为新实体
     * @en Whether it's a new entity
     */
    isNew: boolean;

    /**
     * @zh 解码的组件类型列表
     * @en List of decoded component types
     */
    componentTypes: string[];
}

/**
 * @zh 解码并应用实体数据
 * @en Decode and apply entity data
 *
 * @param scene - @zh 场景 @en Scene
 * @param reader - @zh 二进制读取器 @en Binary reader
 * @param entityMap - @zh 实体 ID 映射（可选）@en Entity ID mapping (optional)
 * @returns @zh 解码结果 @en Decode result
 */
export function decodeEntity(
    scene: Scene,
    reader: BinaryReader,
    entityMap?: Map<number, Entity>
): DecodeEntityResult {
    const entityId = reader.readUint32();
    const componentCount = reader.readVarint();
    const componentTypes: string[] = [];

    // Find or create entity
    let entity: Entity | null | undefined = entityMap?.get(entityId);
    let isNew = false;

    if (!entity) {
        entity = scene.findEntityById(entityId);
    }

    if (!entity) {
        // Entity doesn't exist, create it
        entity = scene.createEntity(`entity_${entityId}`);
        isNew = true;
        entityMap?.set(entityId, entity);
    }

    for (let i = 0; i < componentCount; i++) {
        const typeId = reader.readString();
        componentTypes.push(typeId);

        // Find component class from GlobalComponentRegistry
        const componentClass = GlobalComponentRegistry.getComponentType(typeId) as (new () => Component) | null;
        if (!componentClass) {
            console.warn(`Unknown component type: ${typeId}`);
            // Skip component data - we need to read it to advance the reader
            const fieldCount = reader.readVarint();
            for (let j = 0; j < fieldCount; j++) {
                reader.readUint8(); // fieldIndex
                // We can't skip properly without knowing the type, so this is a problem
                // For now, log error and break
                console.error(`Cannot skip unknown component type: ${typeId}`);
                break;
            }
            continue;
        }

        const metadata: SyncMetadata | undefined = (componentClass as any)[SYNC_METADATA];
        if (!metadata) {
            console.warn(`Component ${typeId} has no sync metadata`);
            continue;
        }

        // Find or add component
        let component = entity.getComponent(componentClass);
        if (!component) {
            component = entity.addComponent(new componentClass());
        }

        // Decode component data
        decodeComponent(component, metadata, reader);
    }

    return { entityId, isNew, componentTypes };
}

/**
 * @zh 解码快照结果
 * @en Decode snapshot result
 */
export interface DecodeSnapshotResult {
    /**
     * @zh 操作类型
     * @en Operation type
     */
    operation: SyncOperation;

    /**
     * @zh 解码的实体列表
     * @en List of decoded entities
     */
    entities: DecodeEntityResult[];
}

/**
 * @zh 解码状态快照
 * @en Decode state snapshot
 *
 * @param scene - @zh 场景 @en Scene
 * @param data - @zh 二进制数据 @en Binary data
 * @param entityMap - @zh 实体 ID 映射（可选）@en Entity ID mapping (optional)
 * @returns @zh 解码结果 @en Decode result
 */
export function decodeSnapshot(
    scene: Scene,
    data: Uint8Array,
    entityMap?: Map<number, Entity>
): DecodeSnapshotResult {
    const reader = new BinaryReader(data);
    const operation = reader.readUint8() as SyncOperation;
    const entityCount = reader.readVarint();
    const entities: DecodeEntityResult[] = [];

    const map = entityMap || new Map<number, Entity>();

    for (let i = 0; i < entityCount; i++) {
        const result = decodeEntity(scene, reader, map);
        entities.push(result);
    }

    return { operation, entities };
}

/**
 * @zh 解码生成消息结果
 * @en Decode spawn message result
 */
export interface DecodeSpawnResult {
    /**
     * @zh 实体
     * @en Entity
     */
    entity: Entity;

    /**
     * @zh 预制体类型
     * @en Prefab type
     */
    prefabType: string;

    /**
     * @zh 解码的组件类型列表
     * @en List of decoded component types
     */
    componentTypes: string[];
}

/**
 * @zh 解码实体生成消息
 * @en Decode entity spawn message
 *
 * @param scene - @zh 场景 @en Scene
 * @param data - @zh 二进制数据 @en Binary data
 * @param entityMap - @zh 实体 ID 映射（可选）@en Entity ID mapping (optional)
 * @returns @zh 解码结果，如果不是 SPAWN 消息则返回 null @en Decode result, or null if not a SPAWN message
 */
export function decodeSpawn(
    scene: Scene,
    data: Uint8Array,
    entityMap?: Map<number, Entity>
): DecodeSpawnResult | null {
    const reader = new BinaryReader(data);
    const operation = reader.readUint8();

    if (operation !== SyncOperation.SPAWN) {
        return null;
    }

    const entityId = reader.readUint32();
    const prefabType = reader.readString();
    const componentCount = reader.readVarint();
    const componentTypes: string[] = [];

    // Create entity
    const entity = scene.createEntity(`entity_${entityId}`);
    entityMap?.set(entityId, entity);

    for (let i = 0; i < componentCount; i++) {
        const typeId = reader.readString();
        componentTypes.push(typeId);

        const componentClass = GlobalComponentRegistry.getComponentType(typeId) as (new () => Component) | null;
        if (!componentClass) {
            console.warn(`Unknown component type: ${typeId}`);
            // Try to skip
            const fieldCount = reader.readVarint();
            for (let j = 0; j < fieldCount; j++) {
                reader.readUint8();
            }
            continue;
        }

        const metadata: SyncMetadata | undefined = (componentClass as any)[SYNC_METADATA];
        if (!metadata) {
            continue;
        }

        const component = entity.addComponent(new (componentClass as new () => Component)());
        decodeComponent(component, metadata, reader);
    }

    return { entity, prefabType, componentTypes };
}

/**
 * @zh 解码销毁消息结果
 * @en Decode despawn message result
 */
export interface DecodeDespawnResult {
    /**
     * @zh 销毁的实体 ID 列表
     * @en List of despawned entity IDs
     */
    entityIds: number[];
}

/**
 * @zh 解码实体销毁消息
 * @en Decode entity despawn message
 *
 * @param data - @zh 二进制数据 @en Binary data
 * @returns @zh 解码结果，如果不是 DESPAWN 消息则返回 null @en Decode result, or null if not a DESPAWN message
 */
export function decodeDespawn(data: Uint8Array): DecodeDespawnResult | null {
    const reader = new BinaryReader(data);
    const operation = reader.readUint8();

    if (operation !== SyncOperation.DESPAWN) {
        return null;
    }

    const entityIds: number[] = [];

    // Check if it's a single entity or batch
    if (reader.remaining === 4) {
        // Single entity
        entityIds.push(reader.readUint32());
    } else {
        // Batch
        const count = reader.readVarint();
        for (let i = 0; i < count; i++) {
            entityIds.push(reader.readUint32());
        }
    }

    return { entityIds };
}

/**
 * @zh 处理销毁消息（从场景中移除实体）
 * @en Process despawn message (remove entities from scene)
 *
 * @param scene - @zh 场景 @en Scene
 * @param data - @zh 二进制数据 @en Binary data
 * @param entityMap - @zh 实体 ID 映射（可选）@en Entity ID mapping (optional)
 * @returns @zh 移除的实体 ID 列表 @en List of removed entity IDs
 */
export function processDespawn(
    scene: Scene,
    data: Uint8Array,
    entityMap?: Map<number, Entity>
): number[] {
    const result = decodeDespawn(data);
    if (!result) {
        return [];
    }

    for (const entityId of result.entityIds) {
        const entity = entityMap?.get(entityId) || scene.findEntityById(entityId);
        if (entity) {
            entity.destroy();
            entityMap?.delete(entityId);
        }
    }

    return result.entityIds;
}
