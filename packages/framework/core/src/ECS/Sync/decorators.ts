/**
 * @zh 网络同步装饰器
 * @en Network synchronization decorators
 *
 * @zh 提供 @sync 装饰器，用于标记需要网络同步的 Component 字段
 * @en Provides @sync decorator to mark Component fields for network synchronization
 */

import type { SyncType, SyncFieldMetadata, SyncMetadata } from './types';
import { SYNC_METADATA, CHANGE_TRACKER } from './types';
import { ChangeTracker } from './ChangeTracker';
import { getComponentTypeName } from '../Core/ComponentStorage/ComponentTypeUtils';

/**
 * @zh 获取或创建组件的同步元数据
 * @en Get or create sync metadata for a component class
 *
 * @param target - @zh 组件类的原型 @en Component class prototype
 * @returns @zh 同步元数据 @en Sync metadata
 */
function getOrCreateSyncMetadata(target: any): SyncMetadata {
    const constructor = target.constructor;

    // Check if has own metadata (not inherited)
    const hasOwnMetadata = Object.prototype.hasOwnProperty.call(constructor, SYNC_METADATA);

    if (hasOwnMetadata) {
        return constructor[SYNC_METADATA];
    }

    // Check for inherited metadata
    const inheritedMetadata: SyncMetadata | undefined = constructor[SYNC_METADATA];

    // Create new metadata (copy from inherited if exists)
    // Use getComponentTypeName to get @ECSComponent decorator name, or fall back to constructor.name
    const metadata: SyncMetadata = {
        typeId: getComponentTypeName(constructor),
        fields: inheritedMetadata ? [...inheritedMetadata.fields] : [],
        fieldIndexMap: inheritedMetadata ? new Map(inheritedMetadata.fieldIndexMap) : new Map()
    };

    constructor[SYNC_METADATA] = metadata;
    return metadata;
}

/**
 * @zh 同步字段装饰器
 * @en Sync field decorator
 *
 * @zh 标记 Component 字段为可网络同步。被标记的字段会自动追踪变更，
 * 并在值修改时触发变更追踪器。
 * @en Marks a Component field for network synchronization. Marked fields
 * automatically track changes and trigger the change tracker on modification.
 *
 * @param type - @zh 字段的同步类型 @en Sync type of the field
 *
 * @example
 * ```typescript
 * import { Component, ECSComponent } from '@esengine/ecs-framework';
 * import { sync } from '@esengine/ecs-framework';
 *
 * @ECSComponent('Player')
 * class PlayerComponent extends Component {
 *     @sync("string") name: string = "";
 *     @sync("uint16") score: number = 0;
 *     @sync("float32") x: number = 0;
 *     @sync("float32") y: number = 0;
 *
 *     // 不带 @sync 的字段不会同步
 *     // Fields without @sync will not be synchronized
 *     localData: any;
 * }
 * ```
 */
export function sync(type: SyncType) {
    return function (target: any, propertyKey: string) {
        const metadata = getOrCreateSyncMetadata(target);

        // Assign field index (auto-increment based on field count)
        const fieldIndex = metadata.fields.length;

        // Create field metadata
        const fieldMeta: SyncFieldMetadata = {
            index: fieldIndex,
            name: propertyKey,
            type: type
        };

        // Register field
        metadata.fields.push(fieldMeta);
        metadata.fieldIndexMap.set(propertyKey, fieldIndex);

        // Store original property key for getter/setter
        const privateKey = `_sync_${propertyKey}`;

        // Define getter/setter to intercept value changes
        Object.defineProperty(target, propertyKey, {
            get() {
                return this[privateKey];
            },
            set(value: any) {
                const oldValue = this[privateKey];
                if (oldValue !== value) {
                    this[privateKey] = value;
                    // Trigger change tracker if exists
                    const tracker = this[CHANGE_TRACKER] as ChangeTracker | undefined;
                    if (tracker) {
                        tracker.setDirty(fieldIndex);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
    };
}

/**
 * @zh 获取组件类的同步元数据
 * @en Get sync metadata for a component class
 *
 * @param componentClass - @zh 组件类或组件实例 @en Component class or instance
 * @returns @zh 同步元数据，如果不存在则返回 null @en Sync metadata, or null if not exists
 */
export function getSyncMetadata(componentClass: any): SyncMetadata | null {
    if (!componentClass) {
        return null;
    }

    const constructor = typeof componentClass === 'function'
        ? componentClass
        : componentClass.constructor;

    return constructor[SYNC_METADATA] || null;
}

/**
 * @zh 检查组件是否有同步字段
 * @en Check if a component has sync fields
 *
 * @param component - @zh 组件类或组件实例 @en Component class or instance
 * @returns @zh 如果有同步字段返回 true @en Returns true if has sync fields
 */
export function hasSyncFields(component: any): boolean {
    const metadata = getSyncMetadata(component);
    return metadata !== null && metadata.fields.length > 0;
}

/**
 * @zh 获取组件实例的变更追踪器
 * @en Get change tracker of a component instance
 *
 * @param component - @zh 组件实例 @en Component instance
 * @returns @zh 变更追踪器，如果不存在则返回 null @en Change tracker, or null if not exists
 */
export function getChangeTracker(component: any): ChangeTracker | null {
    if (!component) {
        return null;
    }
    return component[CHANGE_TRACKER] || null;
}

/**
 * @zh 为组件实例初始化变更追踪器
 * @en Initialize change tracker for a component instance
 *
 * @zh 这个函数应该在组件首次添加到实体时调用。
 * 它会创建变更追踪器并标记所有字段为脏（用于首次同步）。
 * @en This function should be called when a component is first added to an entity.
 * It creates the change tracker and marks all fields as dirty (for initial sync).
 *
 * @param component - @zh 组件实例 @en Component instance
 * @returns @zh 变更追踪器 @en Change tracker
 */
export function initChangeTracker(component: any): ChangeTracker {
    const metadata = getSyncMetadata(component);
    if (!metadata) {
        throw new Error('Component does not have sync metadata. Use @sync decorator on fields.');
    }

    let tracker = component[CHANGE_TRACKER] as ChangeTracker | undefined;
    if (!tracker) {
        tracker = new ChangeTracker();
        component[CHANGE_TRACKER] = tracker;
    }

    // Mark all fields as dirty for initial sync
    tracker.markAllDirty(metadata.fields.length);

    return tracker;
}

/**
 * @zh 清除组件实例的变更标记
 * @en Clear change marks for a component instance
 *
 * @zh 通常在同步完成后调用，清除所有脏标记
 * @en Usually called after sync is complete, clears all dirty marks
 *
 * @param component - @zh 组件实例 @en Component instance
 */
export function clearChanges(component: any): void {
    const tracker = getChangeTracker(component);
    if (tracker) {
        tracker.clear();
    }
}

/**
 * @zh 检查组件是否有变更
 * @en Check if a component has changes
 *
 * @param component - @zh 组件实例 @en Component instance
 * @returns @zh 如果有变更返回 true @en Returns true if has changes
 */
export function hasChanges(component: any): boolean {
    const tracker = getChangeTracker(component);
    return tracker ? tracker.hasChanges() : false;
}
