/**
 * @zh 复合类型验证器
 * @en Composite type validators
 */

import type {
    Validator,
    ValidationResult,
    ObjectShape,
    InferShape
} from './types.js';
import { BaseValidator } from './base.js';

// ============================================================================
// Object Validator
// ============================================================================

/**
 * @zh 对象验证选项
 * @en Object validation options
 */
export interface ObjectValidatorOptions {
    strict?: boolean;
}

/**
 * @zh 对象验证器
 * @en Object validator
 */
export class ObjectValidator<T extends ObjectShape> extends BaseValidator<InferShape<T>> {
    readonly typeName = 'object';
    private readonly _shape: T;
    private _objectOptions: ObjectValidatorOptions = {};

    constructor(shape: T) {
        super();
        this._shape = shape;
    }

    protected _validate(value: unknown, path: string[]): ValidationResult<InferShape<T>> {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            return {
                success: false,
                error: {
                    path,
                    message: `Expected object, received ${Array.isArray(value) ? 'array' : typeof value}`,
                    expected: 'object',
                    received: value
                }
            };
        }

        const result: Record<string, unknown> = {};
        const obj = value as Record<string, unknown>;

        // Validate each field in shape
        for (const [key, validator] of Object.entries(this._shape)) {
            const fieldValue = obj[key];
            const fieldPath = [...path, key];
            const fieldResult = validator.validate(fieldValue, fieldPath);

            if (!fieldResult.success) {
                return fieldResult as ValidationResult<InferShape<T>>;
            }

            result[key] = fieldResult.data;
        }

        // Strict mode: check for unknown keys
        if (this._objectOptions.strict) {
            const knownKeys = new Set(Object.keys(this._shape));
            for (const key of Object.keys(obj)) {
                if (!knownKeys.has(key)) {
                    return {
                        success: false,
                        error: {
                            path: [...path, key],
                            message: `Unknown key "${key}"`,
                            expected: 'known key',
                            received: key
                        }
                    };
                }
            }
        }

        return { success: true, data: result as InferShape<T> };
    }

    protected _clone(): ObjectValidator<T> {
        const clone = new ObjectValidator(this._shape);
        clone._options = { ...this._options };
        clone._objectOptions = { ...this._objectOptions };
        return clone;
    }

    /**
     * @zh 严格模式（不允许额外字段）
     * @en Strict mode (no extra fields allowed)
     */
    strict(): ObjectValidator<T> {
        const clone = this._clone();
        clone._objectOptions.strict = true;
        return clone;
    }

    /**
     * @zh 部分模式（所有字段可选）
     * @en Partial mode (all fields optional)
     */
    partial(): ObjectValidator<{
        [K in keyof T]: ReturnType<T[K]['optional']>;
    }> {
        const partialShape: Record<string, Validator<unknown>> = {};
        for (const [key, validator] of Object.entries(this._shape)) {
            partialShape[key] = validator.optional();
        }
        return new ObjectValidator(partialShape) as any;
    }

    /**
     * @zh 选择部分字段
     * @en Pick specific fields
     */
    pick<K extends keyof T>(...keys: K[]): ObjectValidator<Pick<T, K>> {
        const pickedShape: Record<string, Validator<unknown>> = {};
        for (const key of keys) {
            pickedShape[key as string] = this._shape[key];
        }
        return new ObjectValidator(pickedShape) as any;
    }

    /**
     * @zh 排除部分字段
     * @en Omit specific fields
     */
    omit<K extends keyof T>(...keys: K[]): ObjectValidator<Omit<T, K>> {
        const keySet = new Set(keys as string[]);
        const omittedShape: Record<string, Validator<unknown>> = {};
        for (const [key, validator] of Object.entries(this._shape)) {
            if (!keySet.has(key)) {
                omittedShape[key] = validator;
            }
        }
        return new ObjectValidator(omittedShape) as any;
    }

    /**
     * @zh 扩展对象 Schema
     * @en Extend object schema
     */
    extend<U extends ObjectShape>(shape: U): ObjectValidator<T & U> {
        const extendedShape = { ...this._shape, ...shape };
        return new ObjectValidator(extendedShape) as any;
    }
}

// ============================================================================
// Array Validator
// ============================================================================

/**
 * @zh 数组验证选项
 * @en Array validation options
 */
export interface ArrayValidatorOptions {
    minLength?: number;
    maxLength?: number;
}

/**
 * @zh 数组验证器
 * @en Array validator
 */
export class ArrayValidator<T> extends BaseValidator<T[]> {
    readonly typeName = 'array';
    private readonly _element: Validator<T>;
    private _arrayOptions: ArrayValidatorOptions = {};

    constructor(element: Validator<T>) {
        super();
        this._element = element;
    }

    protected _validate(value: unknown, path: string[]): ValidationResult<T[]> {
        if (!Array.isArray(value)) {
            return {
                success: false,
                error: {
                    path,
                    message: `Expected array, received ${typeof value}`,
                    expected: 'array',
                    received: value
                }
            };
        }

        const { minLength, maxLength } = this._arrayOptions;

        if (minLength !== undefined && value.length < minLength) {
            return {
                success: false,
                error: {
                    path,
                    message: `Array must have at least ${minLength} items`,
                    expected: `array(minLength: ${minLength})`,
                    received: value
                }
            };
        }

        if (maxLength !== undefined && value.length > maxLength) {
            return {
                success: false,
                error: {
                    path,
                    message: `Array must have at most ${maxLength} items`,
                    expected: `array(maxLength: ${maxLength})`,
                    received: value
                }
            };
        }

        const result: T[] = [];
        for (let i = 0; i < value.length; i++) {
            const itemPath = [...path, String(i)];
            const itemResult = this._element.validate(value[i], itemPath);

            if (!itemResult.success) {
                return itemResult as ValidationResult<T[]>;
            }

            result.push(itemResult.data);
        }

        return { success: true, data: result };
    }

    protected _clone(): ArrayValidator<T> {
        const clone = new ArrayValidator(this._element);
        clone._options = { ...this._options };
        clone._arrayOptions = { ...this._arrayOptions };
        return clone;
    }

    /**
     * @zh 设置最小长度
     * @en Set minimum length
     */
    min(length: number): ArrayValidator<T> {
        const clone = this._clone();
        clone._arrayOptions.minLength = length;
        return clone;
    }

    /**
     * @zh 设置最大长度
     * @en Set maximum length
     */
    max(length: number): ArrayValidator<T> {
        const clone = this._clone();
        clone._arrayOptions.maxLength = length;
        return clone;
    }

    /**
     * @zh 设置长度范围
     * @en Set length range
     */
    length(min: number, max: number): ArrayValidator<T> {
        const clone = this._clone();
        clone._arrayOptions.minLength = min;
        clone._arrayOptions.maxLength = max;
        return clone;
    }

    /**
     * @zh 要求非空数组
     * @en Require non-empty array
     */
    nonempty(): ArrayValidator<T> {
        return this.min(1);
    }
}

// ============================================================================
// Tuple Validator
// ============================================================================

/**
 * @zh 元组验证器
 * @en Tuple validator
 */
export class TupleValidator<T extends readonly Validator<unknown>[]> extends BaseValidator<{
    [K in keyof T]: T[K] extends Validator<infer U> ? U : never;
}> {
    readonly typeName = 'tuple';
    private readonly _elements: T;

    constructor(elements: T) {
        super();
        this._elements = elements;
    }

    protected _validate(value: unknown, path: string[]): ValidationResult<{
        [K in keyof T]: T[K] extends Validator<infer U> ? U : never;
    }> {
        if (!Array.isArray(value)) {
            return {
                success: false,
                error: {
                    path,
                    message: `Expected tuple, received ${typeof value}`,
                    expected: 'tuple',
                    received: value
                }
            };
        }

        if (value.length !== this._elements.length) {
            return {
                success: false,
                error: {
                    path,
                    message: `Expected tuple of length ${this._elements.length}, received length ${value.length}`,
                    expected: `tuple(length: ${this._elements.length})`,
                    received: value
                }
            };
        }

        const result: unknown[] = [];
        for (let i = 0; i < this._elements.length; i++) {
            const itemPath = [...path, String(i)];
            const itemResult = this._elements[i].validate(value[i], itemPath);

            if (!itemResult.success) {
                return itemResult as any;
            }

            result.push(itemResult.data);
        }

        return { success: true, data: result as any };
    }

    protected _clone(): TupleValidator<T> {
        const clone = new TupleValidator(this._elements);
        clone._options = { ...this._options };
        return clone;
    }
}

// ============================================================================
// Union Validator
// ============================================================================

/**
 * @zh 联合类型验证器
 * @en Union type validator
 */
export class UnionValidator<T extends readonly Validator<unknown>[]> extends BaseValidator<
    T[number] extends Validator<infer U> ? U : never
> {
    readonly typeName: string;
    private readonly _variants: T;

    constructor(variants: T) {
        super();
        this._variants = variants;
        this.typeName = `union(${variants.map(v => v.typeName).join(' | ')})`;
    }

    protected _validate(value: unknown, path: string[]): ValidationResult<
        T[number] extends Validator<infer U> ? U : never
    > {
        const errors: string[] = [];

        for (const variant of this._variants) {
            const result = variant.validate(value, path);
            if (result.success) {
                return result as any;
            }
            errors.push(variant.typeName);
        }

        return {
            success: false,
            error: {
                path,
                message: `Expected one of: ${errors.join(', ')}`,
                expected: this.typeName,
                received: value
            }
        };
    }

    protected _clone(): UnionValidator<T> {
        const clone = new UnionValidator(this._variants);
        clone._options = { ...this._options };
        return clone;
    }
}

// ============================================================================
// Record Validator
// ============================================================================

/**
 * @zh 记录类型验证器
 * @en Record type validator
 */
export class RecordValidator<T> extends BaseValidator<Record<string, T>> {
    readonly typeName = 'record';
    private readonly _valueValidator: Validator<T>;

    constructor(valueValidator: Validator<T>) {
        super();
        this._valueValidator = valueValidator;
    }

    protected _validate(value: unknown, path: string[]): ValidationResult<Record<string, T>> {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            return {
                success: false,
                error: {
                    path,
                    message: `Expected object, received ${Array.isArray(value) ? 'array' : typeof value}`,
                    expected: 'record',
                    received: value
                }
            };
        }

        const result: Record<string, T> = {};
        const obj = value as Record<string, unknown>;

        for (const [key, val] of Object.entries(obj)) {
            const fieldPath = [...path, key];
            const fieldResult = this._valueValidator.validate(val, fieldPath);

            if (!fieldResult.success) {
                return fieldResult as ValidationResult<Record<string, T>>;
            }

            result[key] = fieldResult.data;
        }

        return { success: true, data: result };
    }

    protected _clone(): RecordValidator<T> {
        const clone = new RecordValidator(this._valueValidator);
        clone._options = { ...this._options };
        return clone;
    }
}

// ============================================================================
// Enum Validator
// ============================================================================

/**
 * @zh 枚举验证器
 * @en Enum validator
 */
export class EnumValidator<T extends readonly (string | number)[]> extends BaseValidator<T[number]> {
    readonly typeName: string;
    private readonly _values: Set<string | number>;
    private readonly _valuesArray: T;

    constructor(values: T) {
        super();
        this._valuesArray = values;
        this._values = new Set(values);
        this.typeName = `enum(${values.map(v => JSON.stringify(v)).join(', ')})`;
    }

    protected _validate(value: unknown, path: string[]): ValidationResult<T[number]> {
        if (!this._values.has(value as string | number)) {
            return {
                success: false,
                error: {
                    path,
                    message: `Expected one of: ${this._valuesArray.map(v => JSON.stringify(v)).join(', ')}`,
                    expected: this.typeName,
                    received: value
                }
            };
        }

        return { success: true, data: value as T[number] };
    }

    protected _clone(): EnumValidator<T> {
        const clone = new EnumValidator(this._valuesArray);
        clone._options = { ...this._options };
        return clone;
    }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * @zh 创建对象验证器
 * @en Create object validator
 */
export function object<T extends ObjectShape>(shape: T): ObjectValidator<T> {
    return new ObjectValidator(shape);
}

/**
 * @zh 创建数组验证器
 * @en Create array validator
 */
export function array<T>(element: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator(element);
}

/**
 * @zh 创建元组验证器
 * @en Create tuple validator
 */
export function tuple<T extends readonly Validator<unknown>[]>(
    elements: T
): TupleValidator<T> {
    return new TupleValidator(elements);
}

/**
 * @zh 创建联合类型验证器
 * @en Create union type validator
 */
export function union<T extends readonly Validator<unknown>[]>(
    variants: T
): UnionValidator<T> {
    return new UnionValidator(variants);
}

/**
 * @zh 创建记录类型验证器
 * @en Create record type validator
 */
export function record<T>(valueValidator: Validator<T>): RecordValidator<T> {
    return new RecordValidator(valueValidator);
}

/**
 * @zh 创建枚举验证器
 * @en Create enum validator
 */
export function nativeEnum<T extends readonly (string | number)[]>(
    values: T
): EnumValidator<T> {
    return new EnumValidator(values);
}
