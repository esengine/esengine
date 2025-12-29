/**
 * @zh 组件状态编码器
 * @en Component state encoder
 *
 * @zh 将 ECS Component 的 @sync 字段编码为二进制格式
 * @en Encodes @sync fields of ECS Components to binary format
 */

import type { Entity } from '../../Entity';
import type { Component } from '../../Component';
import type { SyncType, SyncMetadata } from '../types';
import { SyncOperation, SYNC_METADATA, CHANGE_TRACKER } from '../types';
import type { ChangeTracker } from '../ChangeTracker';
import { BinaryWriter } from './BinaryWriter';

/**
 * @zh 编码单个字段值
 * @en Encode a single field value
 */
function encodeFieldValue(writer: BinaryWriter, value: any, type: SyncType): void {
    switch (type) {
        case 'boolean':
            writer.writeBoolean(value);
            break;
        case 'int8':
            writer.writeInt8(value);
            break;
        case 'uint8':
            writer.writeUint8(value);
            break;
        case 'int16':
            writer.writeInt16(value);
            break;
        case 'uint16':
            writer.writeUint16(value);
            break;
        case 'int32':
            writer.writeInt32(value);
            break;
        case 'uint32':
            writer.writeUint32(value);
            break;
        case 'float32':
            writer.writeFloat32(value);
            break;
        case 'float64':
            writer.writeFloat64(value);
            break;
        case 'string':
            writer.writeString(value ?? '');
            break;
    }
}

/**
 * @zh 编码组件的完整状态
 * @en Encode full state of a component
 *
 * @zh 格式: [fieldCount: varint] ([fieldIndex: uint8] [value])...
 * @en Format: [fieldCount: varint] ([fieldIndex: uint8] [value])...
 *
 * @param component - @zh 组件实例 @en Component instance
 * @param metadata - @zh 组件同步元数据 @en Component sync metadata
 * @param writer - @zh 二进制写入器 @en Binary writer
 */
export function encodeComponentFull(
    component: Component,
    metadata: SyncMetadata,
    writer: BinaryWriter
): void {
    const fields = metadata.fields;
    writer.writeVarint(fields.length);

    for (const field of fields) {
        writer.writeUint8(field.index);
        const value = (component as any)[field.name];
        encodeFieldValue(writer, value, field.type);
    }
}

/**
 * @zh 编码组件的增量状态（只编码脏字段）
 * @en Encode delta state of a component (only dirty fields)
 *
 * @zh 格式: [dirtyCount: varint] ([fieldIndex: uint8] [value])...
 * @en Format: [dirtyCount: varint] ([fieldIndex: uint8] [value])...
 *
 * @param component - @zh 组件实例 @en Component instance
 * @param metadata - @zh 组件同步元数据 @en Component sync metadata
 * @param tracker - @zh 变更追踪器 @en Change tracker
 * @param writer - @zh 二进制写入器 @en Binary writer
 * @returns @zh 是否有数据编码 @en Whether any data was encoded
 */
export function encodeComponentDelta(
    component: Component,
    metadata: SyncMetadata,
    tracker: ChangeTracker,
    writer: BinaryWriter
): boolean {
    if (!tracker.hasChanges()) {
        return false;
    }

    const dirtyFields = tracker.getDirtyFields();
    writer.writeVarint(dirtyFields.length);

    for (const fieldIndex of dirtyFields) {
        const field = metadata.fields[fieldIndex];
        if (field) {
            writer.writeUint8(field.index);
            const value = (component as any)[field.name];
            encodeFieldValue(writer, value, field.type);
        }
    }

    return dirtyFields.length > 0;
}

/**
 * @zh 编码实体的所有同步组件
 * @en Encode all sync components of an entity
 *
 * @zh 格式:
 * [entityId: uint32]
 * [componentCount: varint]
 * ([typeIdLength: varint] [typeId: string] [componentData])...
 *
 * @en Format:
 * [entityId: uint32]
 * [componentCount: varint]
 * ([typeIdLength: varint] [typeId: string] [componentData])...
 *
 * @param entity - @zh 实体 @en Entity
 * @param writer - @zh 二进制写入器 @en Binary writer
 * @param deltaOnly - @zh 只编码增量 @en Only encode delta
 * @returns @zh 编码的组件数量 @en Number of components encoded
 */
export function encodeEntity(
    entity: Entity,
    writer: BinaryWriter,
    deltaOnly: boolean = false
): number {
    writer.writeUint32(entity.id);

    const components = entity.components;
    const syncComponents: Array<{
        component: Component;
        metadata: SyncMetadata;
        tracker: ChangeTracker | undefined;
    }> = [];

    // Collect components with sync metadata
    for (const component of components) {
        const constructor = component.constructor as any;
        const metadata: SyncMetadata | undefined = constructor[SYNC_METADATA];
        if (metadata && metadata.fields.length > 0) {
            const tracker = (component as any)[CHANGE_TRACKER] as ChangeTracker | undefined;

            // For delta encoding, only include components with changes
            if (deltaOnly && tracker && !tracker.hasChanges()) {
                continue;
            }

            syncComponents.push({ component, metadata, tracker });
        }
    }

    writer.writeVarint(syncComponents.length);

    for (const { component, metadata, tracker } of syncComponents) {
        // Write component type ID
        writer.writeString(metadata.typeId);

        if (deltaOnly && tracker) {
            encodeComponentDelta(component, metadata, tracker, writer);
        } else {
            encodeComponentFull(component, metadata, writer);
        }
    }

    return syncComponents.length;
}

/**
 * @zh 编码状态快照（多个实体）
 * @en Encode state snapshot (multiple entities)
 *
 * @zh 格式:
 * [operation: uint8] (FULL=0, DELTA=1, SPAWN=2, DESPAWN=3)
 * [entityCount: varint]
 * (entityData)...
 *
 * @en Format:
 * [operation: uint8] (FULL=0, DELTA=1, SPAWN=2, DESPAWN=3)
 * [entityCount: varint]
 * (entityData)...
 *
 * @param entities - @zh 要编码的实体数组 @en Entities to encode
 * @param operation - @zh 同步操作类型 @en Sync operation type
 * @returns @zh 编码后的二进制数据 @en Encoded binary data
 */
export function encodeSnapshot(
    entities: Entity[],
    operation: SyncOperation = SyncOperation.FULL
): Uint8Array {
    const writer = new BinaryWriter(1024);

    writer.writeUint8(operation);
    writer.writeVarint(entities.length);

    const deltaOnly = operation === SyncOperation.DELTA;

    for (const entity of entities) {
        encodeEntity(entity, writer, deltaOnly);
    }

    return writer.toUint8Array();
}

/**
 * @zh 编码实体生成消息
 * @en Encode entity spawn message
 *
 * @param entity - @zh 生成的实体 @en Spawned entity
 * @param prefabType - @zh 预制体类型（可选）@en Prefab type (optional)
 * @returns @zh 编码后的二进制数据 @en Encoded binary data
 */
export function encodeSpawn(entity: Entity, prefabType?: string): Uint8Array {
    const writer = new BinaryWriter(256);

    writer.writeUint8(SyncOperation.SPAWN);
    writer.writeUint32(entity.id);
    writer.writeString(prefabType || '');

    // Encode all sync components for initial state
    const components = entity.components;
    const syncComponents: Array<{ component: Component; metadata: SyncMetadata }> = [];

    for (const component of components) {
        const constructor = component.constructor as any;
        const metadata: SyncMetadata | undefined = constructor[SYNC_METADATA];
        if (metadata && metadata.fields.length > 0) {
            syncComponents.push({ component, metadata });
        }
    }

    writer.writeVarint(syncComponents.length);

    for (const { component, metadata } of syncComponents) {
        writer.writeString(metadata.typeId);
        encodeComponentFull(component, metadata, writer);
    }

    return writer.toUint8Array();
}

/**
 * @zh 编码实体销毁消息
 * @en Encode entity despawn message
 *
 * @param entityId - @zh 销毁的实体 ID @en Despawned entity ID
 * @returns @zh 编码后的二进制数据 @en Encoded binary data
 */
export function encodeDespawn(entityId: number): Uint8Array {
    const writer = new BinaryWriter(8);

    writer.writeUint8(SyncOperation.DESPAWN);
    writer.writeUint32(entityId);

    return writer.toUint8Array();
}

/**
 * @zh 编码批量实体销毁消息
 * @en Encode batch entity despawn message
 *
 * @param entityIds - @zh 销毁的实体 ID 数组 @en Despawned entity IDs
 * @returns @zh 编码后的二进制数据 @en Encoded binary data
 */
export function encodeDespawnBatch(entityIds: number[]): Uint8Array {
    const writer = new BinaryWriter(8 + entityIds.length * 4);

    writer.writeUint8(SyncOperation.DESPAWN);
    writer.writeVarint(entityIds.length);

    for (const id of entityIds) {
        writer.writeUint32(id);
    }

    return writer.toUint8Array();
}
