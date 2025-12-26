/**
 * Component Registry Interface.
 * 组件注册表接口。
 *
 * Defines the contract for component type registration and lookup.
 * Each Scene has its own ComponentRegistry instance for isolation.
 * 定义组件类型注册和查找的契约。
 * 每个 Scene 都有自己的 ComponentRegistry 实例以实现隔离。
 */

import type { Component } from '../../Component';
import type { BitMask64Data } from '../../Utils/BigIntCompatibility';
import type { ComponentType } from './ComponentTypeUtils';

/**
 * Component Registry Interface.
 * 组件注册表接口。
 */
export type IComponentRegistry = {
    /**
     * Register component type and allocate bitmask.
     * 注册组件类型并分配位掩码。
     *
     * @param componentType - Component constructor | 组件构造函数
     * @returns Allocated bit index | 分配的位索引
     */
    register<T extends Component>(componentType: ComponentType<T>): number;

    /**
     * Get component type's bitmask.
     * 获取组件类型的位掩码。
     *
     * @param componentType - Component constructor | 组件构造函数
     * @returns Bitmask | 位掩码
     */
    getBitMask<T extends Component>(componentType: ComponentType<T>): BitMask64Data;

    /**
     * Get component type's bit index.
     * 获取组件类型的位索引。
     *
     * @param componentType - Component constructor | 组件构造函数
     * @returns Bit index | 位索引
     */
    getBitIndex<T extends Component>(componentType: ComponentType<T>): number;

    /**
     * Check if component type is registered.
     * 检查组件类型是否已注册。
     *
     * @param componentType - Component constructor | 组件构造函数
     * @returns Whether registered | 是否已注册
     */
    isRegistered<T extends Component>(componentType: ComponentType<T>): boolean;

    /**
     * Get component type by bit index.
     * 通过位索引获取组件类型。
     *
     * @param bitIndex - Bit index | 位索引
     * @returns Component constructor or null | 组件构造函数或 null
     */
    getTypeByBitIndex(bitIndex: number): ComponentType | null;

    /**
     * Get component type by name.
     * 通过名称获取组件类型。
     *
     * @param componentName - Component name | 组件名称
     * @returns Component constructor or null | 组件构造函数或 null
     */
    getComponentType(componentName: string): Function | null;

    /**
     * Get component type ID by name.
     * 通过名称获取组件类型 ID。
     *
     * @param componentName - Component name | 组件名称
     * @returns Component type ID or undefined | 组件类型 ID 或 undefined
     */
    getComponentId(componentName: string): number | undefined;

    /**
     * Get all registered component types.
     * 获取所有已注册的组件类型。
     *
     * @returns Map of component type to bit index | 组件类型到位索引的映射
     */
    getAllRegisteredTypes(): Map<Function, number>;

    /**
     * Get all component names.
     * 获取所有组件名称。
     *
     * @returns Map of name to component type | 名称到组件类型的映射
     */
    getAllComponentNames(): Map<string, Function>;

    /**
     * Get registered component count.
     * 获取已注册的组件数量。
     *
     * @returns Count | 数量
     */
    getRegisteredCount(): number;

    /**
     * Register component type by name.
     * 通过名称注册组件类型。
     *
     * @param componentName - Component name | 组件名称
     * @returns Allocated component ID | 分配的组件 ID
     */
    registerComponentByName(componentName: string): number;

    /**
     * Create single component mask.
     * 创建单个组件的掩码。
     *
     * @param componentName - Component name | 组件名称
     * @returns Component mask | 组件掩码
     */
    createSingleComponentMask(componentName: string): BitMask64Data;

    /**
     * Create component mask for multiple components.
     * 创建多个组件的掩码。
     *
     * @param componentNames - Component names | 组件名称数组
     * @returns Combined mask | 组合掩码
     */
    createComponentMask(componentNames: string[]): BitMask64Data;

    /**
     * Unregister component type.
     * 注销组件类型。
     *
     * @param componentName - Component name | 组件名称
     */
    unregister(componentName: string): void;

    /**
     * Enable hot reload mode.
     * 启用热更新模式。
     */
    enableHotReload(): void;

    /**
     * Disable hot reload mode.
     * 禁用热更新模式。
     */
    disableHotReload(): void;

    /**
     * Check if hot reload mode is enabled.
     * 检查热更新模式是否启用。
     *
     * @returns Whether enabled | 是否启用
     */
    isHotReloadEnabled(): boolean;

    /**
     * Clear mask cache.
     * 清除掩码缓存。
     */
    clearMaskCache(): void;

    /**
     * Reset registry.
     * 重置注册表。
     */
    reset(): void;

    /**
     * Get all registered component info.
     * 获取所有已注册的组件信息。
     *
     * @returns Array of component info | 组件信息数组
     */
    getRegisteredComponents(): Array<{ name: string; type: Function; bitIndex: number }>;

    /**
     * Clone component types from another registry.
     * 从另一个注册表克隆组件类型。
     *
     * Used to inherit framework components when creating a new Scene.
     * 用于在创建新 Scene 时继承框架组件。
     *
     * @param source - Source registry | 源注册表
     */
    cloneFrom(source: IComponentRegistry): void;
}
