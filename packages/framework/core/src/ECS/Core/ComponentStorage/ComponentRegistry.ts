/**
 * Component Registry Implementation.
 * 组件注册表实现。
 *
 * Manages component type bitmask allocation.
 * Each Scene has its own registry instance for isolation.
 * 管理组件类型的位掩码分配。
 * 每个 Scene 都有自己的注册表实例以实现隔离。
 */

import { Component } from '../../Component';
import { BitMask64Utils, BitMask64Data } from '../../Utils/BigIntCompatibility';
import { createLogger } from '../../../Utils/Logger';
import {
    ComponentType,
    getComponentTypeName,
    hasECSComponentDecorator
} from './ComponentTypeUtils';
import type { IComponentRegistry } from './IComponentRegistry';

const logger = createLogger('ComponentRegistry');

/**
 * Component Registry.
 * 组件注册表。
 *
 * Instance-based registry for component type management.
 * Each Scene should have its own registry.
 * 基于实例的组件类型管理注册表。
 * 每个 Scene 应有自己的注册表。
 */
export class ComponentRegistry implements IComponentRegistry {
    private _componentTypes = new Map<Function, number>();
    private _bitIndexToType = new Map<number, Function>();
    private _componentNameToType = new Map<string, Function>();
    private _componentNameToId = new Map<string, number>();
    private _maskCache = new Map<string, BitMask64Data>();
    private _nextBitIndex = 0;
    private _hotReloadEnabled = false;
    private _warnedComponents = new Set<Function>();

    /**
     * Register component type and allocate bitmask.
     * 注册组件类型并分配位掩码。
     *
     * @param componentType - Component constructor | 组件构造函数
     * @returns Allocated bit index | 分配的位索引
     */
    public register<T extends Component>(componentType: ComponentType<T>): number {
        const typeName = getComponentTypeName(componentType);

        // Check if @ECSComponent decorator is used
        // 检查是否使用了 @ECSComponent 装饰器
        if (!hasECSComponentDecorator(componentType) && !this._warnedComponents.has(componentType)) {
            this._warnedComponents.add(componentType);
            logger.warn(
                `Component "${typeName}" is missing @ECSComponent decorator. ` +
                `This may cause issues with serialization and code minification. ` +
                `Please add: @ECSComponent('${typeName}') | ` +
                `组件 "${typeName}" 缺少 @ECSComponent 装饰器，可能导致序列化和代码压缩问题`
            );
        }

        if (this._componentTypes.has(componentType)) {
            return this._componentTypes.get(componentType)!;
        }

        // Hot reload: check if same-named component exists
        // 热更新：检查是否有同名组件
        if (this._hotReloadEnabled && this._componentNameToType.has(typeName)) {
            const existingType = this._componentNameToType.get(typeName);
            if (existingType !== componentType) {
                // Reuse old bitIndex, replace class mapping
                // 复用旧的 bitIndex，替换类映射
                const existingIndex = this._componentTypes.get(existingType!)!;
                this._componentTypes.delete(existingType!);
                this._componentTypes.set(componentType, existingIndex);
                this._bitIndexToType.set(existingIndex, componentType);
                this._componentNameToType.set(typeName, componentType);

                logger.debug(`Hot reload: replaced component "${typeName}"`);
                return existingIndex;
            }
        }

        const bitIndex = this._nextBitIndex++;
        this._componentTypes.set(componentType, bitIndex);
        this._bitIndexToType.set(bitIndex, componentType);
        this._componentNameToType.set(typeName, componentType);
        this._componentNameToId.set(typeName, bitIndex);

        return bitIndex;
    }

    /**
     * Get component type's bitmask.
     * 获取组件类型的位掩码。
     */
    public getBitMask<T extends Component>(componentType: ComponentType<T>): BitMask64Data {
        const bitIndex = this._componentTypes.get(componentType);
        if (bitIndex === undefined) {
            const typeName = getComponentTypeName(componentType);
            throw new Error(`Component type ${typeName} is not registered`);
        }
        return BitMask64Utils.create(bitIndex);
    }

    /**
     * Get component type's bit index.
     * 获取组件类型的位索引。
     */
    public getBitIndex<T extends Component>(componentType: ComponentType<T>): number {
        const bitIndex = this._componentTypes.get(componentType);
        if (bitIndex === undefined) {
            const typeName = getComponentTypeName(componentType);
            throw new Error(`Component type ${typeName} is not registered`);
        }
        return bitIndex;
    }

    /**
     * Check if component type is registered.
     * 检查组件类型是否已注册。
     */
    public isRegistered<T extends Component>(componentType: ComponentType<T>): boolean {
        return this._componentTypes.has(componentType);
    }

    /**
     * Get component type by bit index.
     * 通过位索引获取组件类型。
     */
    public getTypeByBitIndex(bitIndex: number): ComponentType | null {
        return (this._bitIndexToType.get(bitIndex) as ComponentType) || null;
    }

    /**
     * Get registered component count.
     * 获取已注册的组件数量。
     */
    public getRegisteredCount(): number {
        return this._nextBitIndex;
    }

    /**
     * Get component type by name.
     * 通过名称获取组件类型。
     */
    public getComponentType(componentName: string): Function | null {
        return this._componentNameToType.get(componentName) || null;
    }

    /**
     * Get all registered component types.
     * 获取所有已注册的组件类型。
     */
    public getAllRegisteredTypes(): Map<Function, number> {
        return new Map(this._componentTypes);
    }

    /**
     * Get all component names.
     * 获取所有组件名称。
     */
    public getAllComponentNames(): Map<string, Function> {
        return new Map(this._componentNameToType);
    }

    /**
     * Get component type ID by name.
     * 通过名称获取组件类型 ID。
     */
    public getComponentId(componentName: string): number | undefined {
        return this._componentNameToId.get(componentName);
    }

    /**
     * Register component type by name.
     * 通过名称注册组件类型。
     */
    public registerComponentByName(componentName: string): number {
        if (this._componentNameToId.has(componentName)) {
            return this._componentNameToId.get(componentName)!;
        }

        const bitIndex = this._nextBitIndex++;
        this._componentNameToId.set(componentName, bitIndex);
        return bitIndex;
    }

    /**
     * Create single component mask.
     * 创建单个组件的掩码。
     */
    public createSingleComponentMask(componentName: string): BitMask64Data {
        const cacheKey = `single:${componentName}`;

        if (this._maskCache.has(cacheKey)) {
            return this._maskCache.get(cacheKey)!;
        }

        const componentId = this.getComponentId(componentName);
        if (componentId === undefined) {
            throw new Error(`Component type ${componentName} is not registered`);
        }

        const mask = BitMask64Utils.create(componentId);
        this._maskCache.set(cacheKey, mask);
        return mask;
    }

    /**
     * Create component mask for multiple components.
     * 创建多个组件的掩码。
     */
    public createComponentMask(componentNames: string[]): BitMask64Data {
        const sortedNames = [...componentNames].sort();
        const cacheKey = `multi:${sortedNames.join(',')}`;

        if (this._maskCache.has(cacheKey)) {
            return this._maskCache.get(cacheKey)!;
        }

        const mask = BitMask64Utils.clone(BitMask64Utils.ZERO);
        for (const name of componentNames) {
            const componentId = this.getComponentId(name);
            if (componentId !== undefined) {
                const componentMask = BitMask64Utils.create(componentId);
                BitMask64Utils.orInPlace(mask, componentMask);
            }
        }

        this._maskCache.set(cacheKey, mask);
        return mask;
    }

    /**
     * Clear mask cache.
     * 清除掩码缓存。
     */
    public clearMaskCache(): void {
        this._maskCache.clear();
    }

    /**
     * Enable hot reload mode.
     * 启用热更新模式。
     */
    public enableHotReload(): void {
        this._hotReloadEnabled = true;
    }

    /**
     * Disable hot reload mode.
     * 禁用热更新模式。
     */
    public disableHotReload(): void {
        this._hotReloadEnabled = false;
    }

    /**
     * Check if hot reload mode is enabled.
     * 检查热更新模式是否启用。
     */
    public isHotReloadEnabled(): boolean {
        return this._hotReloadEnabled;
    }

    /**
     * Unregister component type.
     * 注销组件类型。
     */
    public unregister(componentName: string): void {
        const componentType = this._componentNameToType.get(componentName);
        if (!componentType) {
            return;
        }

        const bitIndex = this._componentTypes.get(componentType);

        // Remove type mappings
        // 移除类型映射
        this._componentTypes.delete(componentType);
        if (bitIndex !== undefined) {
            this._bitIndexToType.delete(bitIndex);
        }
        this._componentNameToType.delete(componentName);
        this._componentNameToId.delete(componentName);

        // Clear related mask cache
        // 清除相关的掩码缓存
        this.clearMaskCache();

        logger.debug(`Component unregistered: ${componentName}`);
    }

    /**
     * Get all registered component info.
     * 获取所有已注册的组件信息。
     */
    public getRegisteredComponents(): Array<{ name: string; type: Function; bitIndex: number }> {
        const result: Array<{ name: string; type: Function; bitIndex: number }> = [];

        for (const [name, type] of this._componentNameToType) {
            const bitIndex = this._componentTypes.get(type);
            if (bitIndex !== undefined) {
                result.push({ name, type, bitIndex });
            }
        }

        return result;
    }

    /**
     * Reset registry.
     * 重置注册表。
     */
    public reset(): void {
        this._componentTypes.clear();
        this._bitIndexToType.clear();
        this._componentNameToType.clear();
        this._componentNameToId.clear();
        this._maskCache.clear();
        this._warnedComponents.clear();
        this._nextBitIndex = 0;
        this._hotReloadEnabled = false;
    }

    /**
     * Clone component types from another registry.
     * 从另一个注册表克隆组件类型。
     *
     * Used to inherit framework components when creating a new Scene.
     * 用于在创建新 Scene 时继承框架组件。
     */
    public cloneFrom(source: IComponentRegistry): void {
        const types = source.getAllRegisteredTypes();
        for (const [type, index] of types) {
            this._componentTypes.set(type, index);
            this._bitIndexToType.set(index, type);
            const typeName = getComponentTypeName(type as ComponentType);
            this._componentNameToType.set(typeName, type);
            this._componentNameToId.set(typeName, index);
        }
        this._nextBitIndex = source.getRegisteredCount();
        this._hotReloadEnabled = source.isHotReloadEnabled();
    }
}

/**
 * Global Component Registry.
 * 全局组件注册表。
 *
 * Used by framework components and decorators.
 * Scene instances clone from this registry on creation.
 * 用于框架组件和装饰器。
 * Scene 实例在创建时从此注册表克隆。
 */
export const GlobalComponentRegistry = new ComponentRegistry();
