import { Component } from '../Component';
import { ComponentType } from './ComponentStorage';
import {
    SoATypeRegistry,
    SupportedTypedArray,
    TypedArrayTypeName
} from './SoATypeRegistry';
import { SoASerializer } from './SoASerializer';
import type { IComponentTypeMetadata, ComponentTypeWithMetadata } from '../../Types';

// 重新导出类型，保持向后兼容
export type { SupportedTypedArray, TypedArrayTypeName } from './SoATypeRegistry';
export { SoATypeRegistry } from './SoATypeRegistry';
export { SoASerializer } from './SoASerializer';

/**
 * @zh SoA 字段统计信息
 * @en SoA field statistics
 */
export interface ISoAFieldStats {
    size: number;
    capacity: number;
    type: string;
    memory: number;
}

/**
 * @zh SoA 存储统计信息
 * @en SoA storage statistics
 */
export interface ISoAStorageStats {
    size: number;
    capacity: number;
    totalSlots: number;
    usedSlots: number;
    freeSlots: number;
    fragmentation: number;
    memoryUsage: number;
    fieldStats: Map<string, ISoAFieldStats>;
}

/**
 * @zh 启用 SoA 优化装饰器 - 默认关闭，只在大规模批量操作场景下建议开启
 * @en Enable SoA optimization decorator - disabled by default, recommended only for large-scale batch operations
 */
export function EnableSoA<T extends ComponentType>(target: T): T {
    (target as ComponentType & IComponentTypeMetadata).__enableSoA = true;
    return target;
}


/**
 * @zh 组件字段元数据键（仅 Set<string> 类型的字段）
 * @en Component field metadata keys (only Set<string> type fields)
 */
type ComponentFieldMetadataKey = Exclude<keyof IComponentTypeMetadata, '__enableSoA'>;

/**
 * @zh 装饰器目标原型接口
 * @en Decorator target prototype interface
 */
interface IDecoratorTarget {
    constructor: IComponentTypeMetadata & Function;
}

/**
 * @zh 辅助函数：获取或创建字段集合
 * @en Helper function: get or create field set
 */
function getOrCreateFieldSet(
    target: IDecoratorTarget,
    fieldName: ComponentFieldMetadataKey
): Set<string> {
    const ctor = target.constructor as IComponentTypeMetadata;
    let fieldSet = ctor[fieldName];
    if (!fieldSet) {
        fieldSet = new Set<string>();
        ctor[fieldName] = fieldSet;
    }
    return fieldSet;
}

/**
 * @zh 64位浮点数装饰器 - 标记字段使用 Float64Array 存储（更高精度但更多内存）
 * @en Float64 decorator - marks field to use Float64Array storage (higher precision but more memory)
 */
export function Float64(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__float64Fields').add(String(propertyKey));
}

/**
 * @zh 32位浮点数装饰器 - 标记字段使用 Float32Array 存储（默认类型，平衡性能和精度）
 * @en Float32 decorator - marks field to use Float32Array storage (default, balanced performance and precision)
 */
export function Float32(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__float32Fields').add(String(propertyKey));
}

/**
 * @zh 32位整数装饰器 - 标记字段使用 Int32Array 存储（适用于整数值）
 * @en Int32 decorator - marks field to use Int32Array storage (for integer values)
 */
export function Int32(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__int32Fields').add(String(propertyKey));
}

/**
 * @zh 32位无符号整数装饰器 - 标记字段使用 Uint32Array 存储
 * @en Uint32 decorator - marks field to use Uint32Array storage
 */
export function Uint32(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__uint32Fields').add(String(propertyKey));
}

/**
 * @zh 16位整数装饰器 - 标记字段使用 Int16Array 存储
 * @en Int16 decorator - marks field to use Int16Array storage
 */
export function Int16(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__int16Fields').add(String(propertyKey));
}

/**
 * @zh 16位无符号整数装饰器 - 标记字段使用 Uint16Array 存储
 * @en Uint16 decorator - marks field to use Uint16Array storage
 */
export function Uint16(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__uint16Fields').add(String(propertyKey));
}

/**
 * @zh 8位整数装饰器 - 标记字段使用 Int8Array 存储
 * @en Int8 decorator - marks field to use Int8Array storage
 */
export function Int8(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__int8Fields').add(String(propertyKey));
}

/**
 * @zh 8位无符号整数装饰器 - 标记字段使用 Uint8Array 存储
 * @en Uint8 decorator - marks field to use Uint8Array storage
 */
export function Uint8(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__uint8Fields').add(String(propertyKey));
}

/**
 * @zh 8位夹紧整数装饰器 - 标记字段使用 Uint8ClampedArray 存储（适用于颜色值）
 * @en Uint8Clamped decorator - marks field to use Uint8ClampedArray storage (for color values)
 */
export function Uint8Clamped(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__uint8ClampedFields').add(String(propertyKey));
}

/**
 * @zh 序列化 Map 装饰器 - 标记 Map 字段需要序列化/反序列化存储
 * @en SerializeMap decorator - marks Map field for serialization/deserialization
 */
export function SerializeMap(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__serializeMapFields').add(String(propertyKey));
}

/**
 * @zh 序列化 Set 装饰器 - 标记 Set 字段需要序列化/反序列化存储
 * @en SerializeSet decorator - marks Set field for serialization/deserialization
 */
export function SerializeSet(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__serializeSetFields').add(String(propertyKey));
}

/**
 * @zh 序列化 Array 装饰器 - 标记 Array 字段需要序列化/反序列化存储
 * @en SerializeArray decorator - marks Array field for serialization/deserialization
 */
export function SerializeArray(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__serializeArrayFields').add(String(propertyKey));
}

/**
 * @zh 深拷贝装饰器 - 标记字段需要深拷贝处理（适用于嵌套对象）
 * @en DeepCopy decorator - marks field for deep copy handling (for nested objects)
 */
export function DeepCopy(target: object, propertyKey: string | symbol): void {
    getOrCreateFieldSet(target as IDecoratorTarget, '__deepCopyFields').add(String(propertyKey));
}


/**
 * SoA存储器（需要装饰器启用）
 * 使用Structure of Arrays存储模式，在大规模批量操作时提供优异性能
 */
export class SoAStorage<T extends Component> {
    private fields = new Map<string, SupportedTypedArray>();
    private stringFields = new Map<string, Array<string | undefined>>();
    private serializedFields = new Map<string, Array<string | undefined>>();
    private complexFields = new Map<number, Map<string, unknown>>();
    private entityToIndex = new Map<number, number>();
    private indexToEntity: number[] = [];
    private freeIndices: number[] = [];
    private _size = 0;
    private _capacity = 1000;
    public readonly type: ComponentType<T>;

    // 缓存字段类型信息，避免重复创建实例
    private fieldTypes = new Map<string, string>();
    // 缓存装饰器元数据
    private serializeMapFields: Set<string> = new Set();
    private serializeSetFields: Set<string> = new Set();
    private serializeArrayFields: Set<string> = new Set();

    constructor(componentType: ComponentType<T>) {
        this.type = componentType;
        this.initializeFields(componentType);
    }

    private initializeFields(componentType: ComponentType<T>): void {
        const instance = new componentType();
        const typeWithMeta = componentType as ComponentType<T> & {
            __float64Fields?: Set<string>;
            __float32Fields?: Set<string>;
            __int32Fields?: Set<string>;
            __uint32Fields?: Set<string>;
            __int16Fields?: Set<string>;
            __uint16Fields?: Set<string>;
            __int8Fields?: Set<string>;
            __uint8Fields?: Set<string>;
            __uint8ClampedFields?: Set<string>;
            __serializeMapFields?: Set<string>;
            __serializeSetFields?: Set<string>;
            __serializeArrayFields?: Set<string>;
        };

        const float64Fields = typeWithMeta.__float64Fields || new Set<string>();
        const float32Fields = typeWithMeta.__float32Fields || new Set<string>();
        const int32Fields = typeWithMeta.__int32Fields || new Set<string>();
        const uint32Fields = typeWithMeta.__uint32Fields || new Set<string>();
        const int16Fields = typeWithMeta.__int16Fields || new Set<string>();
        const uint16Fields = typeWithMeta.__uint16Fields || new Set<string>();
        const int8Fields = typeWithMeta.__int8Fields || new Set<string>();
        const uint8Fields = typeWithMeta.__uint8Fields || new Set<string>();
        const uint8ClampedFields = typeWithMeta.__uint8ClampedFields || new Set<string>();

        // 缓存装饰器元数据
        this.serializeMapFields = typeWithMeta.__serializeMapFields || new Set<string>();
        this.serializeSetFields = typeWithMeta.__serializeSetFields || new Set<string>();
        this.serializeArrayFields = typeWithMeta.__serializeArrayFields || new Set<string>();

        // 先收集所有有装饰器的字段，避免重复遍历
        const decoratedFields = new Map<string, string>(); // fieldName -> arrayType

        // 处理各类型装饰器标记的字段
        for (const key of float64Fields) decoratedFields.set(key, 'float64');
        for (const key of float32Fields) decoratedFields.set(key, 'float32');
        for (const key of int32Fields) decoratedFields.set(key, 'int32');
        for (const key of uint32Fields) decoratedFields.set(key, 'uint32');
        for (const key of int16Fields) decoratedFields.set(key, 'int16');
        for (const key of uint16Fields) decoratedFields.set(key, 'uint16');
        for (const key of int8Fields) decoratedFields.set(key, 'int8');
        for (const key of uint8Fields) decoratedFields.set(key, 'uint8');
        for (const key of uint8ClampedFields) decoratedFields.set(key, 'uint8clamped');

        // 只遍历实例自身的属性（不包括原型链），跳过 id
        const instanceKeys = Object.keys(instance).filter((key) => key !== 'id');

        for (const key of instanceKeys) {
            const value = (instance as Record<string, unknown>)[key];
            const type = typeof value;

            // 跳过函数（通常不会出现在 Object.keys 中，但以防万一）
            if (type === 'function') continue;

            // 检查装饰器类型
            const decoratorType = decoratedFields.get(key);
            const effectiveType = decoratorType ? 'number' : type;
            this.fieldTypes.set(key, effectiveType);

            if (decoratorType) {
                // 有装饰器标记的数字字段
                const ArrayConstructor = SoATypeRegistry.getConstructor(decoratorType as TypedArrayTypeName);
                this.fields.set(key, new ArrayConstructor(this._capacity));
            } else if (type === 'number') {
                // 无装饰器的数字字段，默认使用 Float32Array
                this.fields.set(key, new Float32Array(this._capacity));
            } else if (type === 'boolean') {
                // 布尔值使用 Uint8Array 存储为 0/1
                this.fields.set(key, new Uint8Array(this._capacity));
            } else if (type === 'string') {
                // 字符串专门处理
                this.stringFields.set(key, new Array(this._capacity));
            } else if (type === 'object' && value !== null) {
                // 处理集合类型
                if (this.serializeMapFields.has(key) || this.serializeSetFields.has(key) || this.serializeArrayFields.has(key)) {
                    // 序列化存储
                    this.serializedFields.set(key, new Array(this._capacity));
                }
                // 其他对象类型会在updateComponentAtIndex中作为复杂对象处理
            }
        }
    }

    public addComponent(entityId: number, component: T): void {
        if (this.entityToIndex.has(entityId)) {
            const index = this.entityToIndex.get(entityId)!;
            this.updateComponentAtIndex(index, component);
            return;
        }

        let index: number;
        if (this.freeIndices.length > 0) {
            index = this.freeIndices.pop()!;
        } else {
            index = this._size;
            if (index >= this._capacity) {
                this.resize(this._capacity * 2);
            }
        }

        this.entityToIndex.set(entityId, index);
        this.indexToEntity[index] = entityId;
        this.updateComponentAtIndex(index, component);
        this._size++;
    }

    private updateComponentAtIndex(index: number, component: T): void {
        const entityId = this.indexToEntity[index]!;
        const complexFieldMap = new Map<string, unknown>();
        const typeWithMeta = this.type as ComponentTypeWithMetadata<T>;
        const highPrecisionFields = typeWithMeta.__highPrecisionFields || new Set<string>();
        const serializeMapFields = typeWithMeta.__serializeMapFields || new Set<string>();
        const serializeSetFields = typeWithMeta.__serializeSetFields || new Set<string>();
        const serializeArrayFields = typeWithMeta.__serializeArrayFields || new Set<string>();
        const deepCopyFields = typeWithMeta.__deepCopyFields || new Set<string>();

        const componentRecord = component as Record<string, unknown>;
        for (const key in component) {
            if (Object.prototype.hasOwnProperty.call(component, key) && key !== 'id') {
                const value = componentRecord[key];
                const type = typeof value;

                if (type === 'number') {
                    const numValue = value as number;
                    if (highPrecisionFields.has(key) || !this.fields.has(key)) {
                        complexFieldMap.set(key, numValue);
                    } else {
                        const array = this.fields.get(key)!;
                        array[index] = numValue;
                    }
                } else if (type === 'boolean' && this.fields.has(key)) {
                    const array = this.fields.get(key)!;
                    array[index] = value ? 1 : 0;
                } else if (this.stringFields.has(key)) {
                    // 字符串字段专门处理
                    const stringArray = this.stringFields.get(key)!;
                    stringArray[index] = String(value);
                } else if (this.serializedFields.has(key)) {
                    // 序列化字段处理
                    const serializedArray = this.serializedFields.get(key)!;
                    serializedArray[index] = SoASerializer.serialize(value, key, {
                        isMap: serializeMapFields.has(key),
                        isSet: serializeSetFields.has(key),
                        isArray: serializeArrayFields.has(key)
                    });
                } else {
                    // 复杂字段单独存储
                    if (deepCopyFields.has(key)) {
                        // 深拷贝处理
                        complexFieldMap.set(key, SoASerializer.deepClone(value));
                    } else {
                        complexFieldMap.set(key, value);
                    }
                }
            }
        }

        // 存储复杂字段
        if (complexFieldMap.size > 0) {
            this.complexFields.set(entityId, complexFieldMap);
        }
    }


    public getComponent(entityId: number): T | null {
        const index = this.entityToIndex.get(entityId);
        if (index === undefined) {
            return null;
        }

        // 返回 Proxy，直接操作底层 TypedArray
        return this.createProxyView(entityId, index);
    }

    /**
     * 创建组件的 Proxy 视图
     * 读写操作直接映射到底层 TypedArray，无数据复制
     */
    private createProxyView(entityId: number, index: number): T {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;

        // Proxy handler 类型定义
        const handler: ProxyHandler<Record<string, unknown>> = {
            get(_, prop: string | symbol) {
                const propStr = String(prop);

                // TypedArray 字段
                const array = self.fields.get(propStr);
                if (array) {
                    const fieldType = self.getFieldType(propStr);
                    if (fieldType === 'boolean') {
                        return array[index] === 1;
                    }
                    return array[index];
                }

                // 字符串字段
                const stringArray = self.stringFields.get(propStr);
                if (stringArray) {
                    return stringArray[index];
                }

                // 序列化字段
                const serializedArray = self.serializedFields.get(propStr);
                if (serializedArray) {
                    const serialized = serializedArray[index];
                    if (serialized) {
                        return SoASerializer.deserialize(serialized, propStr, {
                            isMap: self.serializeMapFields.has(propStr),
                            isSet: self.serializeSetFields.has(propStr),
                            isArray: self.serializeArrayFields.has(propStr)
                        });
                    }
                    return undefined;
                }

                // 复杂字段
                const complexFieldMap = self.complexFields.get(entityId);
                if (complexFieldMap?.has(propStr)) {
                    return complexFieldMap.get(propStr);
                }

                return undefined;
            },

            set(_, prop: string | symbol, value) {
                const propStr = String(prop);

                // entityId 是只读的
                if (propStr === 'entityId') {
                    return false;
                }

                // TypedArray 字段
                const array = self.fields.get(propStr);
                if (array) {
                    const fieldType = self.getFieldType(propStr);
                    if (fieldType === 'boolean') {
                        array[index] = value ? 1 : 0;
                    } else {
                        array[index] = value;
                    }
                    return true;
                }

                // 字符串字段
                const stringArray = self.stringFields.get(propStr);
                if (stringArray) {
                    stringArray[index] = String(value);
                    return true;
                }

                // 序列化字段
                if (self.serializedFields.has(propStr)) {
                    const serializedArray = self.serializedFields.get(propStr)!;
                    serializedArray[index] = SoASerializer.serialize(value, propStr, {
                        isMap: self.serializeMapFields.has(propStr),
                        isSet: self.serializeSetFields.has(propStr),
                        isArray: self.serializeArrayFields.has(propStr)
                    });
                    return true;
                }

                // 复杂字段
                let complexFieldMap = self.complexFields.get(entityId);
                if (!complexFieldMap) {
                    complexFieldMap = new Map();
                    self.complexFields.set(entityId, complexFieldMap);
                }
                complexFieldMap.set(propStr, value);
                return true;
            },

            has(_, prop) {
                const propStr = String(prop);
                return self.fields.has(propStr) ||
                       self.stringFields.has(propStr) ||
                       self.serializedFields.has(propStr) ||
                       self.complexFields.get(entityId)?.has(propStr) || false;
            },

            ownKeys() {
                const keys: string[] = [];
                for (const key of self.fields.keys()) keys.push(key);
                for (const key of self.stringFields.keys()) keys.push(key);
                for (const key of self.serializedFields.keys()) keys.push(key);
                const complexFieldMap = self.complexFields.get(entityId);
                if (complexFieldMap) {
                    for (const key of complexFieldMap.keys()) keys.push(key);
                }
                return keys;
            },

            getOwnPropertyDescriptor(_, prop) {
                const propStr = String(prop);
                if (self.fields.has(propStr) ||
                    self.stringFields.has(propStr) ||
                    self.serializedFields.has(propStr) ||
                    self.complexFields.get(entityId)?.has(propStr)) {
                    return {
                        enumerable: true,
                        configurable: true,
                        // entityId 是只读的
                        writable: propStr !== 'entityId'
                    };
                }
                return undefined;
            }
        };

        return new Proxy({} as Record<string, unknown>, handler) as unknown as T;
    }

    /**
     * @zh 获取组件的快照副本（用于序列化等需要独立副本的场景）
     * @en Get a snapshot copy of the component (for serialization scenarios)
     */
    public getComponentSnapshot(entityId: number): T | null {
        const index = this.entityToIndex.get(entityId);
        if (index === undefined) {
            return null;
        }

        const component = new this.type();
        const componentRecord = component as unknown as Record<string, unknown>;

        // 恢复数值字段
        for (const [fieldName, array] of this.fields.entries()) {
            const value = array[index];
            const fieldType = this.getFieldType(fieldName);
            componentRecord[fieldName] = fieldType === 'boolean' ? value === 1 : value;
        }

        // 恢复字符串字段
        for (const [fieldName, stringArray] of this.stringFields.entries()) {
            componentRecord[fieldName] = stringArray[index];
        }

        // 恢复序列化字段
        for (const [fieldName, serializedArray] of this.serializedFields.entries()) {
            const serialized = serializedArray[index];
            if (serialized) {
                componentRecord[fieldName] = SoASerializer.deserialize(serialized, fieldName, {
                    isMap: this.serializeMapFields.has(fieldName),
                    isSet: this.serializeSetFields.has(fieldName),
                    isArray: this.serializeArrayFields.has(fieldName)
                });
            }
        }

        // 恢复复杂字段
        const complexFieldMap = this.complexFields.get(entityId);
        if (complexFieldMap) {
            for (const [fieldName, value] of complexFieldMap.entries()) {
                componentRecord[fieldName] = value;
            }
        }

        return component;
    }

    private getFieldType(fieldName: string): string {
        // 使用缓存的字段类型
        return this.fieldTypes.get(fieldName) || 'unknown';
    }

    public hasComponent(entityId: number): boolean {
        return this.entityToIndex.has(entityId);
    }

    public removeComponent(entityId: number): T | null {
        const index = this.entityToIndex.get(entityId);
        if (index === undefined) {
            return null;
        }

        // 获取组件副本以便返回
        const component = this.getComponent(entityId);

        // 清理复杂字段
        this.complexFields.delete(entityId);

        this.entityToIndex.delete(entityId);
        this.freeIndices.push(index);
        this._size--;
        return component;
    }

    private resize(newCapacity: number): void {
        // 调整数值字段的TypedArray
        for (const [fieldName, oldArray] of this.fields.entries()) {
            const newArray = SoATypeRegistry.createSameType(oldArray, newCapacity);
            newArray.set(oldArray);
            this.fields.set(fieldName, newArray);
        }

        // 调整字符串字段的数组
        for (const [fieldName, oldArray] of this.stringFields.entries()) {
            const newArray = new Array(newCapacity);
            for (let i = 0; i < oldArray.length; i++) {
                newArray[i] = oldArray[i];
            }
            this.stringFields.set(fieldName, newArray);
        }

        // 调整序列化字段的数组
        for (const [fieldName, oldArray] of this.serializedFields.entries()) {
            const newArray = new Array(newCapacity);
            for (let i = 0; i < oldArray.length; i++) {
                newArray[i] = oldArray[i];
            }
            this.serializedFields.set(fieldName, newArray);
        }

        this._capacity = newCapacity;
    }

    public getActiveIndices(): number[] {
        return Array.from(this.entityToIndex.values());
    }

    public getFieldArray(fieldName: string): SupportedTypedArray | null {
        return this.fields.get(fieldName) || null;
    }

    public getTypedFieldArray<K extends keyof T>(fieldName: K): SupportedTypedArray | null {
        return this.fields.get(String(fieldName)) || null;
    }

    public getEntityIndex(entityId: number): number | undefined {
        return this.entityToIndex.get(entityId);
    }

    public getEntityIdByIndex(index: number): number | undefined {
        return this.indexToEntity[index];
    }

    public size(): number {
        return this._size;
    }

    public clear(): void {
        this.entityToIndex.clear();
        this.indexToEntity = [];
        this.freeIndices = [];
        this.complexFields.clear();
        this._size = 0;

        // 重置数值字段数组
        for (const array of this.fields.values()) {
            array.fill(0);
        }

        // 重置字符串字段数组
        for (const stringArray of this.stringFields.values()) {
            for (let i = 0; i < stringArray.length; i++) {
                stringArray[i] = undefined;
            }
        }

        // 重置序列化字段数组
        for (const serializedArray of this.serializedFields.values()) {
            for (let i = 0; i < serializedArray.length; i++) {
                serializedArray[i] = undefined;
            }
        }
    }

    public compact(): void {
        if (this.freeIndices.length === 0) {
            return;
        }

        const activeEntries = Array.from(this.entityToIndex.entries())
            .sort((a, b) => a[1] - b[1]);

        // 重新映射索引
        const newEntityToIndex = new Map<number, number>();
        const newIndexToEntity: number[] = [];

        for (let newIndex = 0; newIndex < activeEntries.length; newIndex++) {
            const entry = activeEntries[newIndex];
            if (!entry) continue;

            const [entityId, oldIndex] = entry;

            newEntityToIndex.set(entityId, newIndex);
            newIndexToEntity[newIndex] = entityId;

            // 移动字段数据
            if (newIndex !== oldIndex) {
                // 移动数值字段
                for (const [, array] of this.fields.entries()) {
                    const value = array[oldIndex];
                    if (value !== undefined) {
                        array[newIndex] = value;
                    }
                }

                // 移动字符串字段
                for (const [, stringArray] of this.stringFields.entries()) {
                    const value = stringArray[oldIndex];
                    if (value !== undefined) {
                        stringArray[newIndex] = value;
                    }
                }

                // 移动序列化字段
                for (const [, serializedArray] of this.serializedFields.entries()) {
                    const value = serializedArray[oldIndex];
                    if (value !== undefined) {
                        serializedArray[newIndex] = value;
                    }
                }
            }
        }

        this.entityToIndex = newEntityToIndex;
        this.indexToEntity = newIndexToEntity;
        this.freeIndices = [];
        this._size = activeEntries.length;
    }

    /**
     * @zh 获取 SoA 存储统计信息
     * @en Get SoA storage statistics
     */
    public getStats(): ISoAStorageStats {
        let totalMemory = 0;
        const fieldStats = new Map<string, ISoAFieldStats>();

        for (const [fieldName, array] of this.fields.entries()) {
            const typeName = SoATypeRegistry.getTypeName(array);
            const bytesPerElement = SoATypeRegistry.getBytesPerElement(typeName);
            const memory = array.length * bytesPerElement;
            totalMemory += memory;

            fieldStats.set(fieldName, {
                size: this._size,
                capacity: array.length,
                type: typeName,
                memory: memory
            });
        }

        return {
            size: this._size,
            capacity: this._capacity,
            totalSlots: this._capacity,
            usedSlots: this._size,
            freeSlots: this._capacity - this._size,
            fragmentation: this.freeIndices.length / this._capacity,
            memoryUsage: totalMemory,
            fieldStats: fieldStats
        };
    }

    /**
     * 执行向量化批量操作
     * @param operation 操作函数，接收字段数组和活跃索引
     */
    public performVectorizedOperation(operation: (fieldArrays: Map<string, SupportedTypedArray>, activeIndices: number[]) => void): void {
        const activeIndices = this.getActiveIndices();
        operation(this.fields, activeIndices);
    }

}
