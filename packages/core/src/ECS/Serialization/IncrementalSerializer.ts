/**
 * @zh 增量序列化器
 * @en Incremental Serializer
 *
 * @zh 提供高性能的增量序列化支持，只序列化变更的数据。
 *     适用于网络同步、大场景存档、时间回溯等场景。
 * @en Provides high-performance incremental serialization, serializing only changed data.
 *     Suitable for network sync, large scene archiving, and time rewind scenarios.
 */

import type { IScene } from '../IScene';
import { Entity } from '../Entity';
import { ComponentSerializer, SerializedComponent } from './ComponentSerializer';
import { SerializedEntity } from './EntitySerializer';
import { ComponentType } from '../Core/ComponentStorage';
import { BinarySerializer } from '../../Utils/BinarySerializer';
import { HierarchyComponent } from '../Components/HierarchyComponent';
import { HierarchySystem } from '../Systems/HierarchySystem';

// =============================================================================
// 枚举 | Enums
// =============================================================================

/**
 * @zh 变更操作类型
 * @en Change operation type
 */
export enum ChangeOperation {
    /** @zh 添加新实体 @en Entity added */
    EntityAdded = 'entity_added',
    /** @zh 删除实体 @en Entity removed */
    EntityRemoved = 'entity_removed',
    /** @zh 实体属性更新 @en Entity updated */
    EntityUpdated = 'entity_updated',
    /** @zh 添加组件 @en Component added */
    ComponentAdded = 'component_added',
    /** @zh 删除组件 @en Component removed */
    ComponentRemoved = 'component_removed',
    /** @zh 组件数据更新 @en Component updated */
    ComponentUpdated = 'component_updated',
    /** @zh 场景数据更新 @en Scene data updated */
    SceneDataUpdated = 'scene_data_updated'
}

// =============================================================================
// 类型定义 | Type Definitions
// =============================================================================

/**
 * @zh 实体变更记录
 * @en Entity change record
 */
export interface EntityChange {
    /** @zh 操作类型 @en Operation type */
    readonly operation: ChangeOperation;
    /** @zh 实体ID @en Entity ID */
    readonly entityId: number;
    /** @zh 实体名称（用于Added操作）@en Entity name (for Added operation) */
    readonly entityName?: string;
    /** @zh 实体数据（用于Added/Updated操作）@en Entity data (for Added/Updated operation) */
    readonly entityData?: Partial<SerializedEntity>;
}

/**
 * @zh 组件变更记录
 * @en Component change record
 */
export interface ComponentChange {
    /** @zh 操作类型 @en Operation type */
    readonly operation: ChangeOperation;
    /** @zh 实体ID @en Entity ID */
    readonly entityId: number;
    /** @zh 组件类型名称 @en Component type name */
    readonly componentType: string;
    /** @zh 组件数据（用于Added/Updated操作）@en Component data (for Added/Updated operation) */
    readonly componentData?: SerializedComponent;
}

/**
 * @zh 场景数据变更记录
 * @en Scene data change record
 */
export interface SceneDataChange {
    /** @zh 操作类型 @en Operation type */
    readonly operation: ChangeOperation;
    /** @zh 变更的键 @en Changed key */
    readonly key: string;
    /** @zh 新值 @en New value */
    readonly value: unknown;
    /** @zh 是否删除 @en Whether deleted */
    readonly deleted?: boolean;
}

/**
 * @zh 增量序列化数据
 * @en Incremental snapshot data
 */
export interface IncrementalSnapshot {
    /** @zh 快照版本号 @en Snapshot version */
    readonly version: number;
    /** @zh 时间戳 @en Timestamp */
    readonly timestamp: number;
    /** @zh 场景名称 @en Scene name */
    readonly sceneName: string;
    /** @zh 基础版本号（相对于哪个快照的增量）@en Base version (incremental from which snapshot) */
    readonly baseVersion: number;
    /** @zh 实体变更列表 @en Entity changes list */
    readonly entityChanges: EntityChange[];
    /** @zh 组件变更列表 @en Component changes list */
    readonly componentChanges: ComponentChange[];
    /** @zh 场景数据变更列表 @en Scene data changes list */
    readonly sceneDataChanges: SceneDataChange[];
}

/**
 * @zh 实体快照数据
 * @en Entity snapshot data
 */
interface EntitySnapshotData {
    readonly name: string;
    readonly tag: number;
    readonly active: boolean;
    readonly enabled: boolean;
    readonly updateOrder: number;
    readonly parentId?: number;
}

/**
 * @zh 场景快照（用于对比）
 * @en Scene snapshot (for comparison)
 */
export interface SceneSnapshot {
    /** @zh 快照版本号 @en Snapshot version */
    readonly version: number;
    /** @zh 实体ID集合 @en Entity ID set */
    readonly entityIds: Set<number>;
    /** @zh 实体数据映射 @en Entity data map */
    readonly entities: Map<number, EntitySnapshotData>;
    /** @zh 组件数据映射 (entityId -> componentType -> serializedData JSON) @en Component data map */
    readonly components: Map<number, Map<string, string>>;
    /** @zh 场景自定义数据 @en Scene custom data */
    readonly sceneData: Map<string, string>;
}

/**
 * @zh 增量序列化格式
 * @en Incremental serialization format
 */
export type IncrementalSerializationFormat = 'json' | 'binary';

/**
 * @zh 增量快照统计信息
 * @en Incremental snapshot statistics
 */
export interface IIncrementalStats {
    /** @zh 总变更数 @en Total changes */
    readonly totalChanges: number;
    /** @zh 实体变更数 @en Entity changes count */
    readonly entityChanges: number;
    /** @zh 组件变更数 @en Component changes count */
    readonly componentChanges: number;
    /** @zh 场景数据变更数 @en Scene data changes count */
    readonly sceneDataChanges: number;
    /** @zh 新增实体数 @en Added entities count */
    readonly addedEntities: number;
    /** @zh 删除实体数 @en Removed entities count */
    readonly removedEntities: number;
    /** @zh 更新实体数 @en Updated entities count */
    readonly updatedEntities: number;
    /** @zh 新增组件数 @en Added components count */
    readonly addedComponents: number;
    /** @zh 删除组件数 @en Removed components count */
    readonly removedComponents: number;
    /** @zh 更新组件数 @en Updated components count */
    readonly updatedComponents: number;
}

/**
 * @zh 增量序列化选项
 * @en Incremental serialization options
 */
export interface IncrementalSerializationOptions {
    /**
     * @zh 实体过滤器 - 只快照符合条件的实体
     * @en Entity filter - only snapshot entities that match the condition
     *
     * @example
     * ```typescript
     * // 只快照玩家实体
     * const snapshot = IncrementalSerializer.createSnapshot(scene, {
     *     entityFilter: (entity) => entity.tag === PLAYER_TAG
     * });
     *
     * // 只快照有特定组件的实体
     * const snapshot = IncrementalSerializer.createSnapshot(scene, {
     *     entityFilter: (entity) => entity.hasComponent(PlayerMarker)
     * });
     * ```
     */
    entityFilter?: (entity: Entity) => boolean;

    /**
     * @zh 是否包含组件数据的深度对比，默认true
     * @en Whether to deep compare component data, default true
     */
    deepComponentComparison?: boolean;

    /**
     * @zh 是否跟踪场景数据变更，默认true
     * @en Whether to track scene data changes, default true
     */
    trackSceneData?: boolean;

    /**
     * @zh 是否压缩快照，默认false
     * @en Whether to compress snapshot, default false
     */
    compressSnapshot?: boolean;

    /**
     * @zh 序列化格式，默认 'json'
     * @en Serialization format, default 'json'
     */
    format?: IncrementalSerializationFormat;

    /**
     * @zh 是否美化JSON输出（仅在format='json'时有效），默认false
     * @en Whether to prettify JSON output (only for format='json'), default false
     */
    pretty?: boolean;
}

// =============================================================================
// 常量 | Constants
// =============================================================================

const DEFAULT_OPTIONS: Required<Omit<IncrementalSerializationOptions, 'entityFilter'>> = {
    deepComponentComparison: true,
    trackSceneData: true,
    compressSnapshot: false,
    format: 'json',
    pretty: false
};

// =============================================================================
// IncrementalSerializer
// =============================================================================

/**
 * @zh 增量序列化器类
 * @en Incremental serializer class
 *
 * @zh 提供场景快照创建、增量计算、应用和序列化功能
 * @en Provides scene snapshot creation, incremental computation, application and serialization
 */
export class IncrementalSerializer {
    /** @zh 当前快照版本号 @en Current snapshot version */
    private static snapshotVersion = 0;

    // =========================================================================
    // 快照创建 | Snapshot Creation
    // =========================================================================

    /**
     * @zh 创建场景快照
     * @en Create scene snapshot
     *
     * @param scene - @zh 要快照的场景 @en Scene to snapshot
     * @param options - @zh 序列化选项 @en Serialization options
     * @returns @zh 场景快照对象 @en Scene snapshot object
     */
    public static createSnapshot(
        scene: IScene,
        options?: IncrementalSerializationOptions
    ): SceneSnapshot {
        const opts = { ...DEFAULT_OPTIONS, ...options };

        const snapshot: SceneSnapshot = {
            version: ++this.snapshotVersion,
            entityIds: new Set(),
            entities: new Map(),
            components: new Map(),
            sceneData: new Map()
        };

        // 快照实体（支持过滤）
        for (const entity of scene.entities.buffer) {
            // 应用实体过滤器
            if (opts.entityFilter && !opts.entityFilter(entity)) {
                continue;
            }

            snapshot.entityIds.add(entity.id);

            // 获取层级信息
            const hierarchy = entity.getComponent(HierarchyComponent);
            const parentId = hierarchy?.parentId;

            // 存储实体基本信息
            snapshot.entities.set(entity.id, {
                name: entity.name,
                tag: entity.tag,
                active: entity.active,
                enabled: entity.enabled,
                updateOrder: entity.updateOrder,
                ...(parentId !== null && parentId !== undefined && { parentId })
            });

            // 快照组件
            if (opts.deepComponentComparison) {
                const componentMap = new Map<string, string>();

                for (const component of entity.components) {
                    const serialized = ComponentSerializer.serialize(component);
                    if (serialized) {
                        // 使用JSON字符串存储，便于后续对比
                        componentMap.set(
                            serialized.type,
                            JSON.stringify(serialized.data)
                        );
                    }
                }

                if (componentMap.size > 0) {
                    snapshot.components.set(entity.id, componentMap);
                }
            }
        }

        // 快照场景数据
        if (opts.trackSceneData) {
            for (const [key, value] of scene.sceneData) {
                snapshot.sceneData.set(key, JSON.stringify(value));
            }
        }

        return snapshot;
    }

    // =========================================================================
    // 增量计算 | Incremental Computation
    // =========================================================================

    /**
     * @zh 计算增量变更
     * @en Compute incremental changes
     *
     * @param scene - @zh 当前场景 @en Current scene
     * @param baseSnapshot - @zh 基础快照 @en Base snapshot
     * @param options - @zh 序列化选项 @en Serialization options
     * @returns @zh 增量快照 @en Incremental snapshot
     */
    public static computeIncremental(
        scene: IScene,
        baseSnapshot: SceneSnapshot,
        options?: IncrementalSerializationOptions
    ): IncrementalSnapshot {
        const opts = { ...DEFAULT_OPTIONS, ...options };

        const incremental: IncrementalSnapshot = {
            version: ++this.snapshotVersion,
            timestamp: Date.now(),
            sceneName: scene.name,
            baseVersion: baseSnapshot.version,
            entityChanges: [],
            componentChanges: [],
            sceneDataChanges: []
        };

        const currentEntityIds = new Set<number>();

        // 检测实体变更（支持过滤）
        for (const entity of scene.entities.buffer) {
            // 应用实体过滤器
            if (opts.entityFilter && !opts.entityFilter(entity)) {
                continue;
            }

            currentEntityIds.add(entity.id);

            // 获取层级信息
            const hierarchy = entity.getComponent(HierarchyComponent);
            const parentId = hierarchy?.parentId;

            if (!baseSnapshot.entityIds.has(entity.id)) {
                // 新增实体
                incremental.entityChanges.push({
                    operation: ChangeOperation.EntityAdded,
                    entityId: entity.id,
                    entityName: entity.name,
                    entityData: {
                        id: entity.id,
                        name: entity.name,
                        tag: entity.tag,
                        active: entity.active,
                        enabled: entity.enabled,
                        updateOrder: entity.updateOrder,
                        ...(parentId !== null && parentId !== undefined && { parentId }),
                        components: [],
                        children: []
                    }
                });

                // 新增实体的所有组件都是新增
                for (const component of entity.components) {
                    const serialized = ComponentSerializer.serialize(component);
                    if (serialized) {
                        incremental.componentChanges.push({
                            operation: ChangeOperation.ComponentAdded,
                            entityId: entity.id,
                            componentType: serialized.type,
                            componentData: serialized
                        });
                    }
                }
            } else {
                // 检查实体属性变更
                const oldData = baseSnapshot.entities.get(entity.id)!;
                const entityChanged =
                    oldData.name !== entity.name ||
                    oldData.tag !== entity.tag ||
                    oldData.active !== entity.active ||
                    oldData.enabled !== entity.enabled ||
                    oldData.updateOrder !== entity.updateOrder ||
                    oldData.parentId !== parentId;

                if (entityChanged) {
                    incremental.entityChanges.push({
                        operation: ChangeOperation.EntityUpdated,
                        entityId: entity.id,
                        entityData: {
                            name: entity.name,
                            tag: entity.tag,
                            active: entity.active,
                            enabled: entity.enabled,
                            updateOrder: entity.updateOrder,
                            ...(parentId !== null && parentId !== undefined && { parentId })
                        }
                    });
                }

                // 检查组件变更
                if (opts.deepComponentComparison) {
                    this.detectComponentChanges(
                        entity,
                        baseSnapshot,
                        incremental.componentChanges
                    );
                }
            }
        }

        // 检测删除的实体
        for (const oldEntityId of baseSnapshot.entityIds) {
            if (!currentEntityIds.has(oldEntityId)) {
                incremental.entityChanges.push({
                    operation: ChangeOperation.EntityRemoved,
                    entityId: oldEntityId
                });
            }
        }

        // 检测场景数据变更
        if (opts.trackSceneData) {
            this.detectSceneDataChanges(
                scene,
                baseSnapshot,
                incremental.sceneDataChanges
            );
        }

        return incremental;
    }

    // =========================================================================
    // 私有方法 - 变更检测 | Private Methods - Change Detection
    // =========================================================================

    /**
     * @zh 检测组件变更
     * @en Detect component changes
     */
    private static detectComponentChanges(
        entity: Entity,
        baseSnapshot: SceneSnapshot,
        componentChanges: ComponentChange[]
    ): void {
        const oldComponents = baseSnapshot.components.get(entity.id);
        const currentComponents = new Map<string, SerializedComponent>();

        // 收集当前组件
        for (const component of entity.components) {
            const serialized = ComponentSerializer.serialize(component);
            if (serialized) {
                currentComponents.set(serialized.type, serialized);
            }
        }

        // 检测新增和更新的组件
        for (const [type, serialized] of currentComponents) {
            const currentData = JSON.stringify(serialized.data);

            if (!oldComponents || !oldComponents.has(type)) {
                // 新增组件
                componentChanges.push({
                    operation: ChangeOperation.ComponentAdded,
                    entityId: entity.id,
                    componentType: type,
                    componentData: serialized
                });
            } else if (oldComponents.get(type) !== currentData) {
                // 组件数据变更
                componentChanges.push({
                    operation: ChangeOperation.ComponentUpdated,
                    entityId: entity.id,
                    componentType: type,
                    componentData: serialized
                });
            }
        }

        // 检测删除的组件
        if (oldComponents) {
            for (const oldType of oldComponents.keys()) {
                if (!currentComponents.has(oldType)) {
                    componentChanges.push({
                        operation: ChangeOperation.ComponentRemoved,
                        entityId: entity.id,
                        componentType: oldType
                    });
                }
            }
        }
    }

    /**
     * @zh 检测场景数据变更
     * @en Detect scene data changes
     */
    private static detectSceneDataChanges(
        scene: IScene,
        baseSnapshot: SceneSnapshot,
        sceneDataChanges: SceneDataChange[]
    ): void {
        const currentKeys = new Set<string>();

        // 检测新增和更新的场景数据
        for (const [key, value] of scene.sceneData) {
            currentKeys.add(key);
            const currentValue = JSON.stringify(value);
            const oldValue = baseSnapshot.sceneData.get(key);

            if (!oldValue || oldValue !== currentValue) {
                sceneDataChanges.push({
                    operation: ChangeOperation.SceneDataUpdated,
                    key,
                    value
                });
            }
        }

        // 检测删除的场景数据
        for (const oldKey of baseSnapshot.sceneData.keys()) {
            if (!currentKeys.has(oldKey)) {
                sceneDataChanges.push({
                    operation: ChangeOperation.SceneDataUpdated,
                    key: oldKey,
                    value: undefined,
                    deleted: true
                });
            }
        }
    }

    // =========================================================================
    // 增量应用 | Incremental Application
    // =========================================================================

    /**
     * @zh 应用增量变更到场景
     * @en Apply incremental changes to scene
     *
     * @param scene - @zh 目标场景 @en Target scene
     * @param incremental - @zh 增量快照 @en Incremental snapshot
     * @param componentRegistry - @zh 组件类型注册表 @en Component type registry
     */
    public static applyIncremental(
        scene: IScene,
        incremental: IncrementalSnapshot,
        componentRegistry: Map<string, ComponentType>
    ): void {
        // 应用实体变更
        for (const change of incremental.entityChanges) {
            switch (change.operation) {
                case ChangeOperation.EntityAdded:
                    this.applyEntityAdded(scene, change);
                    break;
                case ChangeOperation.EntityRemoved:
                    this.applyEntityRemoved(scene, change);
                    break;
                case ChangeOperation.EntityUpdated:
                    this.applyEntityUpdated(scene, change);
                    break;
            }
        }

        // 应用组件变更
        for (const change of incremental.componentChanges) {
            switch (change.operation) {
                case ChangeOperation.ComponentAdded:
                    this.applyComponentAdded(scene, change, componentRegistry);
                    break;
                case ChangeOperation.ComponentRemoved:
                    this.applyComponentRemoved(scene, change, componentRegistry);
                    break;
                case ChangeOperation.ComponentUpdated:
                    this.applyComponentUpdated(scene, change, componentRegistry);
                    break;
            }
        }

        // 应用场景数据变更
        for (const change of incremental.sceneDataChanges) {
            if (change.deleted) {
                scene.sceneData.delete(change.key);
            } else {
                scene.sceneData.set(change.key, change.value);
            }
        }
    }

    private static applyEntityAdded(scene: IScene, change: EntityChange): void {
        if (!change.entityData) return;

        const entity = new Entity(change.entityName || 'Entity', change.entityId);
        entity.tag = change.entityData.tag || 0;
        entity.active = change.entityData.active ?? true;
        entity.enabled = change.entityData.enabled ?? true;
        entity.updateOrder = change.entityData.updateOrder || 0;

        scene.addEntity(entity);
    }

    private static applyEntityRemoved(scene: IScene, change: EntityChange): void {
        const entity = scene.entities.findEntityById(change.entityId);
        if (entity) {
            entity.destroy();
        }
    }

    private static applyEntityUpdated(scene: IScene, change: EntityChange): void {
        if (!change.entityData) return;

        const entity = scene.entities.findEntityById(change.entityId);
        if (!entity) return;

        if (change.entityData.name !== undefined) entity.name = change.entityData.name;
        if (change.entityData.tag !== undefined) entity.tag = change.entityData.tag;
        if (change.entityData.active !== undefined) entity.active = change.entityData.active;
        if (change.entityData.enabled !== undefined) entity.enabled = change.entityData.enabled;
        if (change.entityData.updateOrder !== undefined) entity.updateOrder = change.entityData.updateOrder;

        // 使用 HierarchySystem 更新层级关系
        const hierarchySystem = scene.getSystem(HierarchySystem);
        if (hierarchySystem) {
            const hierarchy = entity.getComponent(HierarchyComponent);
            const currentParentId = hierarchy?.parentId;

            if (change.entityData.parentId !== undefined) {
                const newParent = scene.entities.findEntityById(change.entityData.parentId);
                if (newParent && currentParentId !== change.entityData.parentId) {
                    hierarchySystem.setParent(entity, newParent);
                }
            } else if (currentParentId !== null && currentParentId !== undefined) {
                hierarchySystem.setParent(entity, null);
            }
        }
    }

    private static applyComponentAdded(
        scene: IScene,
        change: ComponentChange,
        componentRegistry: Map<string, ComponentType>
    ): void {
        if (!change.componentData) return;

        const entity = scene.entities.findEntityById(change.entityId);
        if (!entity) return;

        const component = ComponentSerializer.deserialize(change.componentData, componentRegistry);
        if (component) {
            entity.addComponent(component);
        }
    }

    private static applyComponentRemoved(
        scene: IScene,
        change: ComponentChange,
        componentRegistry: Map<string, ComponentType>
    ): void {
        const entity = scene.entities.findEntityById(change.entityId);
        if (!entity) return;

        const componentClass = componentRegistry.get(change.componentType);
        if (!componentClass) return;

        entity.removeComponentByType(componentClass);
    }

    private static applyComponentUpdated(
        scene: IScene,
        change: ComponentChange,
        componentRegistry: Map<string, ComponentType>
    ): void {
        if (!change.componentData) return;

        const entity = scene.entities.findEntityById(change.entityId);
        if (!entity) return;

        const componentClass = componentRegistry.get(change.componentType);
        if (!componentClass) return;

        entity.removeComponentByType(componentClass);

        const component = ComponentSerializer.deserialize(change.componentData, componentRegistry);
        if (component) {
            entity.addComponent(component);
        }
    }

    // =========================================================================
    // 序列化与反序列化 | Serialization & Deserialization
    // =========================================================================

    /**
     * @zh 序列化增量快照
     * @en Serialize incremental snapshot
     *
     * @param incremental - @zh 增量快照 @en Incremental snapshot
     * @param options - @zh 序列化选项 @en Serialization options
     * @returns @zh 序列化后的数据 @en Serialized data
     *
     * @example
     * ```typescript
     * // JSON格式（默认）
     * const jsonData = IncrementalSerializer.serializeIncremental(snapshot);
     *
     * // 二进制格式
     * const binaryData = IncrementalSerializer.serializeIncremental(snapshot, {
     *     format: 'binary'
     * });
     * ```
     */
    public static serializeIncremental(
        incremental: IncrementalSnapshot,
        options?: { format?: IncrementalSerializationFormat; pretty?: boolean }
    ): string | Uint8Array {
        const format = options?.format ?? 'json';
        const pretty = options?.pretty ?? false;

        if (format === 'binary') {
            return BinarySerializer.encode(incremental);
        }
        return pretty ? JSON.stringify(incremental, null, 2) : JSON.stringify(incremental);
    }

    /**
     * @zh 反序列化增量快照
     * @en Deserialize incremental snapshot
     *
     * @param data - @zh 序列化的数据 @en Serialized data
     * @returns @zh 增量快照 @en Incremental snapshot
     */
    public static deserializeIncremental(data: string | Uint8Array): IncrementalSnapshot {
        if (typeof data === 'string') {
            return JSON.parse(data);
        }
        return BinarySerializer.decode(data) as IncrementalSnapshot;
    }

    // =========================================================================
    // 统计与工具 | Statistics & Utilities
    // =========================================================================

    /**
     * @zh 获取增量快照的统计信息
     * @en Get incremental snapshot statistics
     *
     * @param incremental - @zh 增量快照 @en Incremental snapshot
     * @returns @zh 统计信息 @en Statistics
     */
    public static getIncrementalStats(incremental: IncrementalSnapshot): IIncrementalStats {
        const entityStats = { added: 0, removed: 0, updated: 0 };
        const componentStats = { added: 0, removed: 0, updated: 0 };

        for (const change of incremental.entityChanges) {
            if (change.operation === ChangeOperation.EntityAdded) entityStats.added++;
            else if (change.operation === ChangeOperation.EntityRemoved) entityStats.removed++;
            else if (change.operation === ChangeOperation.EntityUpdated) entityStats.updated++;
        }

        for (const change of incremental.componentChanges) {
            if (change.operation === ChangeOperation.ComponentAdded) componentStats.added++;
            else if (change.operation === ChangeOperation.ComponentRemoved) componentStats.removed++;
            else if (change.operation === ChangeOperation.ComponentUpdated) componentStats.updated++;
        }

        return {
            totalChanges:
                incremental.entityChanges.length +
                incremental.componentChanges.length +
                incremental.sceneDataChanges.length,
            entityChanges: incremental.entityChanges.length,
            componentChanges: incremental.componentChanges.length,
            sceneDataChanges: incremental.sceneDataChanges.length,
            addedEntities: entityStats.added,
            removedEntities: entityStats.removed,
            updatedEntities: entityStats.updated,
            addedComponents: componentStats.added,
            removedComponents: componentStats.removed,
            updatedComponents: componentStats.updated
        };
    }

    /**
     * @zh 重置快照版本号（用于测试）
     * @en Reset snapshot version (for testing)
     */
    public static resetVersion(): void {
        this.snapshotVersion = 0;
    }
}
