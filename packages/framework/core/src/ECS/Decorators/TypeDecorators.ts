/**
 * Type Decorators for ECS Components and Systems
 * ECS 组件和系统的类型装饰器
 *
 * Provides decorators to mark component/system types with stable names
 * that survive code minification.
 *
 * 提供装饰器为组件/系统类型标记稳定的名称，使其在代码混淆后仍然有效。
 */

import type { Component } from '../Component';
import type { EntitySystem } from '../Systems';
import { GlobalComponentRegistry } from '../Core/ComponentStorage/ComponentRegistry';
import {
    COMPONENT_TYPE_NAME,
    COMPONENT_DEPENDENCIES,
    COMPONENT_EDITOR_OPTIONS,
    getWritableComponentTypeMetadata,
    type ComponentEditorOptions,
    type ComponentType
} from '../Core/ComponentStorage/ComponentTypeUtils';
import { SYNC_METADATA, type SyncMetadata } from '../Sync/types';

/**
 * 存储系统类型名称的Symbol键
 * Symbol key for storing system type name
 */
export const SYSTEM_TYPE_NAME = Symbol('SystemTypeName');

/**
 * 系统类型元数据接口
 * System type metadata interface
 */
export type SystemTypeMetadata = {
    readonly [SYSTEM_TYPE_NAME]?: string;
    readonly __systemMetadata__?: SystemMetadata;
}

/**
 * 可写的系统类型元数据
 * Writable system type metadata
 */
interface WritableSystemTypeMetadata {
    [SYSTEM_TYPE_NAME]?: string;
    __systemMetadata__?: SystemMetadata;
}

/**
 * 获取系统类型元数据
 * Get system type metadata
 */
function getSystemTypeMetadata(systemType: SystemConstructor): SystemTypeMetadata {
    return systemType as unknown as SystemTypeMetadata;
}

/**
 * 获取可写的系统类型元数据
 * Get writable system type metadata
 */
function getWritableSystemTypeMetadata(systemType: SystemConstructor): WritableSystemTypeMetadata {
    return systemType as unknown as WritableSystemTypeMetadata;
}

/**
 * 系统构造函数类型
 * System constructor type
 *
 * 注意：构造函数参数使用 any[] 是必要的，因为系统可以有各种不同签名的构造函数
 * Note: Constructor args use any[] because systems can have various constructor signatures
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SystemConstructor<T extends EntitySystem = EntitySystem> = new (...args: any[]) => T;

/**
 * 组件装饰器配置选项
 * Component decorator options
 */
export type ComponentOptions = {
    /** 依赖的其他组件名称列表 | List of required component names */
    requires?: string[];

    /**
     * 编辑器相关选项
     * Editor-related options
     */
    editor?: ComponentEditorOptions;
}

/**
 * 组件类型装饰器
 * Component type decorator
 *
 * 用于为组件类指定固定的类型名称，避免在代码混淆后失效。
 * 装饰器执行时会自动注册到 ComponentRegistry，使组件可以通过名称反序列化。
 *
 * Assigns a stable type name to component classes that survives minification.
 * The decorator automatically registers to ComponentRegistry, enabling deserialization by name.
 *
 * @param typeName 组件类型名称 | Component type name
 * @param options 组件配置选项 | Component options
 * @example
 * ```typescript
 * @ECSComponent('Position')
 * class PositionComponent extends Component {
 *     x: number = 0;
 *     y: number = 0;
 * }
 *
 * // 带依赖声明 | With dependency declaration
 * @ECSComponent('SpriteAnimator', { requires: ['Sprite'] })
 * class SpriteAnimatorComponent extends Component {
 *     // ...
 * }
 * ```
 */
export function ECSComponent(typeName: string, options?: ComponentOptions) {
    return function <T extends ComponentType<Component>>(target: T): T {
        if (!typeName || typeof typeName !== 'string') {
            throw new Error('ECSComponent装饰器必须提供有效的类型名称');
        }

        // 获取可写的元数据对象
        // Get writable metadata object
        const metadata = getWritableComponentTypeMetadata(target);

        // 在构造函数上存储类型名称
        // Store type name on constructor
        metadata[COMPONENT_TYPE_NAME] = typeName;

        // 存储依赖关系
        // Store dependencies
        if (options?.requires) {
            metadata[COMPONENT_DEPENDENCIES] = options.requires;
        }

        // 存储编辑器选项
        // Store editor options
        if (options?.editor) {
            metadata[COMPONENT_EDITOR_OPTIONS] = options.editor;
        }

        // 更新 @sync 装饰器创建的 SYNC_METADATA.typeId（如果存在）
        // Update SYNC_METADATA.typeId created by @sync decorator (if exists)
        // Property decorators execute before class decorators, so @sync may have used constructor.name
        const syncMeta = (target as any)[SYNC_METADATA] as SyncMetadata | undefined;
        if (syncMeta) {
            syncMeta.typeId = typeName;
        }

        // 自动注册到全局 ComponentRegistry，使组件可以通过名称查找
        // Auto-register to GlobalComponentRegistry, enabling lookup by name
        GlobalComponentRegistry.register(target);

        return target;
    };
}

/**
 * System 元数据配置
 * System metadata configuration
 */
export type SystemMetadata = {
    /**
     * 更新顺序（数值越小越先执行，默认0）
     * Update order (lower values execute first, default 0)
     */
    updateOrder?: number;

    /**
     * 是否默认启用（默认true）
     * Whether enabled by default (default true)
     */
    enabled?: boolean;

    /**
     * 是否在编辑模式下运行（默认 true）
     * Whether to run in edit mode (default true)
     *
     * 默认情况下，所有系统在编辑模式下都会运行。
     * 当设置为 false 时，此系统在编辑模式（非 Play 状态）下不会执行。
     * 适用于物理系统、AI 系统等只应在游戏运行时执行的系统。
     *
     * By default, all systems run in edit mode.
     * When set to false, this system will NOT execute during edit mode
     * (when not playing). Useful for physics, AI, and other systems
     * that should only run during gameplay.
     */
    runInEditMode?: boolean;
}

/**
 * 系统类型装饰器
 * System type decorator
 *
 * 用于为系统类指定固定的类型名称，避免在代码混淆后失效。
 * Assigns a stable type name to system classes that survives minification.
 *
 * @param typeName 系统类型名称 | System type name
 * @param metadata 系统元数据配置 | System metadata configuration
 * @example
 * ```typescript
 * @ECSSystem('Movement')
 * class MovementSystem extends EntitySystem {
 *     protected process(entities: Entity[]): void {
 *         // 系统逻辑
 *     }
 * }
 *
 * @ECSSystem('Physics', { updateOrder: 10 })
 * class PhysicsSystem extends EntitySystem {
 *     // ...
 * }
 * ```
 */
export function ECSSystem(typeName: string, metadata?: SystemMetadata) {
    return function <T extends SystemConstructor>(target: T): T {
        if (!typeName || typeof typeName !== 'string') {
            throw new Error('ECSSystem装饰器必须提供有效的类型名称');
        }

        // 获取可写的元数据对象
        // Get writable metadata object
        const meta = getWritableSystemTypeMetadata(target);

        // 在构造函数上存储类型名称
        // Store type name on constructor
        meta[SYSTEM_TYPE_NAME] = typeName;

        // 存储元数据
        // Store metadata
        if (metadata) {
            meta.__systemMetadata__ = metadata;
        }

        return target;
    };
}

/**
 * 获取 System 的元数据
 * Get System metadata
 */
export function getSystemMetadata(systemType: SystemConstructor): SystemMetadata | undefined {
    const meta = getSystemTypeMetadata(systemType);
    return meta.__systemMetadata__;
}

/**
 * 从系统实例获取元数据
 * Get metadata from system instance
 *
 * @param system 系统实例 | System instance
 * @returns 系统元数据 | System metadata
 */
export function getSystemInstanceMetadata(system: EntitySystem): SystemMetadata | undefined {
    return getSystemMetadata(system.constructor as SystemConstructor);
}

/**
 * 获取系统类型的名称，优先使用装饰器指定的名称
 * Get system type name, preferring decorator-specified name
 *
 * @param systemType 系统构造函数 | System constructor
 * @returns 系统类型名称 | System type name
 */
export function getSystemTypeName<T extends EntitySystem>(
    systemType: SystemConstructor<T>
): string {
    const meta = getSystemTypeMetadata(systemType);
    const decoratorName = meta[SYSTEM_TYPE_NAME];
    if (decoratorName) {
        return decoratorName;
    }
    return systemType.name || 'UnknownSystem';
}

/**
 * 从系统实例获取类型名称
 * Get type name from system instance
 *
 * @param system 系统实例 | System instance
 * @returns 系统类型名称 | System type name
 */
export function getSystemInstanceTypeName(system: EntitySystem): string {
    return getSystemTypeName(system.constructor as SystemConstructor);
}
