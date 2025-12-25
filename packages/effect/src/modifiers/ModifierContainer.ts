/**
 * @zh 修改器容器
 * @en Modifier Container
 *
 * @zh 管理属性修改器并计算最终值
 * @en Manages attribute modifiers and calculates final values
 */

import type { IModifier, ModifierOperation, ModifierPriority, IAttributeCalculator } from './IModifier';

let modifierCounter = 0;

function generateModifierId(): string {
    return `mod_${Date.now()}_${++modifierCounter}`;
}

/**
 * @zh 默认数值计算器
 * @en Default numeric calculator
 */
export class NumericCalculator implements IAttributeCalculator<number> {
    calculate(baseValue: number, modifiers: IModifier<number>[]): number {
        if (modifiers.length === 0) return baseValue;

        // Sort by priority
        const sorted = [...modifiers].sort((a, b) => {
            const priorityOrder: Record<ModifierPriority, number> = {
                base: 0,
                add: 1,
                multiply: 2,
                final: 3
            };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        let value = baseValue;
        let addSum = 0;
        let multiplyProduct = 1;

        for (const mod of sorted) {
            if (!mod.isActive) continue;

            switch (mod.operation) {
                case 'add':
                    addSum += mod.value;
                    break;
                case 'multiply':
                    multiplyProduct *= mod.value;
                    break;
                case 'override':
                    value = mod.value;
                    addSum = 0;
                    multiplyProduct = 1;
                    break;
                case 'min':
                    value = Math.min(value, mod.value);
                    break;
                case 'max':
                    value = Math.max(value, mod.value);
                    break;
            }
        }

        // Apply in order: base → add → multiply
        return (value + addSum) * multiplyProduct;
    }
}

/**
 * @zh 修改器容器
 * @en Modifier container
 */
export class ModifierContainer<T = number> {
    private readonly _modifiers: Map<string, IModifier<T>> = new Map();
    private readonly _modifiersByAttribute: Map<string, Set<string>> = new Map();
    private readonly _modifiersBySource: Map<string, Set<string>> = new Map();
    private readonly _calculator: IAttributeCalculator<T>;
    private readonly _baseValues: Map<string, T> = new Map();
    private readonly _cachedValues: Map<string, T> = new Map();
    private _isDirty = false;

    /**
     * @zh 创建修改器容器
     * @en Create modifier container
     *
     * @param calculator - @zh 属性计算器 @en Attribute calculator
     */
    constructor(calculator?: IAttributeCalculator<T>) {
        this._calculator = calculator ?? new NumericCalculator() as unknown as IAttributeCalculator<T>;
    }

    /**
     * @zh 设置属性基础值
     * @en Set attribute base value
     */
    setBaseValue(attribute: string, value: T): void {
        this._baseValues.set(attribute, value);
        this._invalidateAttribute(attribute);
    }

    /**
     * @zh 获取属性基础值
     * @en Get attribute base value
     */
    getBaseValue(attribute: string): T | undefined {
        return this._baseValues.get(attribute);
    }

    /**
     * @zh 添加修改器
     * @en Add modifier
     */
    addModifier(
        attribute: string,
        operation: ModifierOperation,
        value: T,
        sourceId: string,
        priority: ModifierPriority = 'add'
    ): IModifier<T> {
        const modifier: IModifier<T> = {
            id: generateModifierId(),
            sourceId,
            attribute,
            operation,
            priority,
            value,
            isActive: true
        };

        this._modifiers.set(modifier.id, modifier);

        // Index by attribute
        if (!this._modifiersByAttribute.has(attribute)) {
            this._modifiersByAttribute.set(attribute, new Set());
        }
        this._modifiersByAttribute.get(attribute)!.add(modifier.id);

        // Index by source
        if (!this._modifiersBySource.has(sourceId)) {
            this._modifiersBySource.set(sourceId, new Set());
        }
        this._modifiersBySource.get(sourceId)!.add(modifier.id);

        this._invalidateAttribute(attribute);

        return modifier;
    }

    /**
     * @zh 移除修改器
     * @en Remove modifier
     */
    removeModifier(modifierId: string): boolean {
        const modifier = this._modifiers.get(modifierId);
        if (!modifier) return false;

        this._modifiers.delete(modifierId);
        this._modifiersByAttribute.get(modifier.attribute)?.delete(modifierId);
        this._modifiersBySource.get(modifier.sourceId)?.delete(modifierId);

        this._invalidateAttribute(modifier.attribute);

        return true;
    }

    /**
     * @zh 按来源移除修改器
     * @en Remove modifiers by source
     */
    removeBySource(sourceId: string): number {
        const ids = this._modifiersBySource.get(sourceId);
        if (!ids) return 0;

        let count = 0;
        for (const id of [...ids]) {
            if (this.removeModifier(id)) count++;
        }

        this._modifiersBySource.delete(sourceId);
        return count;
    }

    /**
     * @zh 按属性移除修改器
     * @en Remove modifiers by attribute
     */
    removeByAttribute(attribute: string): number {
        const ids = this._modifiersByAttribute.get(attribute);
        if (!ids) return 0;

        let count = 0;
        for (const id of [...ids]) {
            if (this.removeModifier(id)) count++;
        }

        return count;
    }

    /**
     * @zh 获取属性的所有修改器
     * @en Get all modifiers for an attribute
     */
    getModifiersForAttribute(attribute: string): IModifier<T>[] {
        const ids = this._modifiersByAttribute.get(attribute);
        if (!ids) return [];
        return [...ids].map(id => this._modifiers.get(id)!).filter(Boolean);
    }

    /**
     * @zh 获取来源的所有修改器
     * @en Get all modifiers from a source
     */
    getModifiersFromSource(sourceId: string): IModifier<T>[] {
        const ids = this._modifiersBySource.get(sourceId);
        if (!ids) return [];
        return [...ids].map(id => this._modifiers.get(id)!).filter(Boolean);
    }

    /**
     * @zh 计算属性最终值
     * @en Calculate attribute final value
     */
    getValue(attribute: string): T {
        // Check cache
        if (!this._isDirty && this._cachedValues.has(attribute)) {
            return this._cachedValues.get(attribute)!;
        }

        const baseValue = this._baseValues.get(attribute);
        if (baseValue === undefined) {
            throw new Error(`No base value set for attribute: ${attribute}`);
        }

        const modifiers = this.getModifiersForAttribute(attribute);
        const finalValue = this._calculator.calculate(baseValue, modifiers);

        this._cachedValues.set(attribute, finalValue);
        return finalValue;
    }

    /**
     * @zh 尝试获取属性最终值
     * @en Try to get attribute final value
     */
    tryGetValue(attribute: string, defaultValue: T): T {
        try {
            return this.getValue(attribute);
        } catch {
            return defaultValue;
        }
    }

    /**
     * @zh 检查属性是否有修改器
     * @en Check if attribute has modifiers
     */
    hasModifiers(attribute: string): boolean {
        const ids = this._modifiersByAttribute.get(attribute);
        return ids !== undefined && ids.size > 0;
    }

    /**
     * @zh 获取所有已修改的属性
     * @en Get all modified attributes
     */
    getModifiedAttributes(): string[] {
        return [...this._modifiersByAttribute.keys()];
    }

    /**
     * @zh 清除所有修改器
     * @en Clear all modifiers
     */
    clear(): void {
        this._modifiers.clear();
        this._modifiersByAttribute.clear();
        this._modifiersBySource.clear();
        this._cachedValues.clear();
        this._isDirty = true;
    }

    private _invalidateAttribute(attribute: string): void {
        this._cachedValues.delete(attribute);
        this._isDirty = true;
    }

    /**
     * @zh 标记缓存已更新
     * @en Mark cache as updated
     */
    markClean(): void {
        this._isDirty = false;
    }
}

/**
 * @zh 创建修改器容器
 * @en Create modifier container
 */
export function createModifierContainer<T = number>(
    calculator?: IAttributeCalculator<T>
): ModifierContainer<T> {
    return new ModifierContainer(calculator);
}
