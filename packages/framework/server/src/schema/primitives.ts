/**
 * @zh 基础类型验证器
 * @en Primitive type validators
 */

import type { ValidationResult } from './types.js';
import { BaseValidator } from './base.js';

// ============================================================================
// String Validator
// ============================================================================

/**
 * @zh 字符串验证选项
 * @en String validation options
 */
export interface StringValidatorOptions {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
}

/**
 * @zh 字符串验证器
 * @en String validator
 */
export class StringValidator extends BaseValidator<string> {
    readonly typeName = 'string';
    private _stringOptions: StringValidatorOptions = {};

    protected _validate(value: unknown, path: string[]): ValidationResult<string> {
        if (typeof value !== 'string') {
            return {
                success: false,
                error: {
                    path,
                    message: `Expected string, received ${typeof value}`,
                    expected: 'string',
                    received: value
                }
            };
        }

        const { minLength, maxLength, pattern } = this._stringOptions;

        if (minLength !== undefined && value.length < minLength) {
            return {
                success: false,
                error: {
                    path,
                    message: `String must be at least ${minLength} characters`,
                    expected: `string(minLength: ${minLength})`,
                    received: value
                }
            };
        }

        if (maxLength !== undefined && value.length > maxLength) {
            return {
                success: false,
                error: {
                    path,
                    message: `String must be at most ${maxLength} characters`,
                    expected: `string(maxLength: ${maxLength})`,
                    received: value
                }
            };
        }

        if (pattern && !pattern.test(value)) {
            return {
                success: false,
                error: {
                    path,
                    message: `String does not match pattern ${pattern}`,
                    expected: `string(pattern: ${pattern})`,
                    received: value
                }
            };
        }

        return { success: true, data: value };
    }

    protected _clone(): StringValidator {
        const clone = new StringValidator();
        clone._options = { ...this._options };
        clone._stringOptions = { ...this._stringOptions };
        return clone;
    }

    /**
     * @zh 设置最小长度
     * @en Set minimum length
     */
    min(length: number): StringValidator {
        const clone = this._clone();
        clone._stringOptions.minLength = length;
        return clone;
    }

    /**
     * @zh 设置最大长度
     * @en Set maximum length
     */
    max(length: number): StringValidator {
        const clone = this._clone();
        clone._stringOptions.maxLength = length;
        return clone;
    }

    /**
     * @zh 设置长度范围
     * @en Set length range
     */
    length(min: number, max: number): StringValidator {
        const clone = this._clone();
        clone._stringOptions.minLength = min;
        clone._stringOptions.maxLength = max;
        return clone;
    }

    /**
     * @zh 设置正则模式
     * @en Set regex pattern
     */
    regex(pattern: RegExp): StringValidator {
        const clone = this._clone();
        clone._stringOptions.pattern = pattern;
        return clone;
    }

    /**
     * @zh 邮箱格式验证
     * @en Email format validation
     */
    email(): StringValidator {
        return this.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    }

    /**
     * @zh URL 格式验证
     * @en URL format validation
     */
    url(): StringValidator {
        return this.regex(/^https?:\/\/.+/);
    }
}

// ============================================================================
// Number Validator
// ============================================================================

/**
 * @zh 数字验证选项
 * @en Number validation options
 */
export interface NumberValidatorOptions {
    min?: number;
    max?: number;
    integer?: boolean;
}

/**
 * @zh 数字验证器
 * @en Number validator
 */
export class NumberValidator extends BaseValidator<number> {
    readonly typeName = 'number';
    private _numberOptions: NumberValidatorOptions = {};

    protected _validate(value: unknown, path: string[]): ValidationResult<number> {
        if (typeof value !== 'number' || Number.isNaN(value)) {
            return {
                success: false,
                error: {
                    path,
                    message: `Expected number, received ${typeof value}`,
                    expected: 'number',
                    received: value
                }
            };
        }

        const { min, max, integer } = this._numberOptions;

        if (integer && !Number.isInteger(value)) {
            return {
                success: false,
                error: {
                    path,
                    message: 'Expected integer',
                    expected: 'integer',
                    received: value
                }
            };
        }

        if (min !== undefined && value < min) {
            return {
                success: false,
                error: {
                    path,
                    message: `Number must be >= ${min}`,
                    expected: `number(min: ${min})`,
                    received: value
                }
            };
        }

        if (max !== undefined && value > max) {
            return {
                success: false,
                error: {
                    path,
                    message: `Number must be <= ${max}`,
                    expected: `number(max: ${max})`,
                    received: value
                }
            };
        }

        return { success: true, data: value };
    }

    protected _clone(): NumberValidator {
        const clone = new NumberValidator();
        clone._options = { ...this._options };
        clone._numberOptions = { ...this._numberOptions };
        return clone;
    }

    /**
     * @zh 设置最小值
     * @en Set minimum value
     */
    min(value: number): NumberValidator {
        const clone = this._clone();
        clone._numberOptions.min = value;
        return clone;
    }

    /**
     * @zh 设置最大值
     * @en Set maximum value
     */
    max(value: number): NumberValidator {
        const clone = this._clone();
        clone._numberOptions.max = value;
        return clone;
    }

    /**
     * @zh 设置范围
     * @en Set range
     */
    range(min: number, max: number): NumberValidator {
        const clone = this._clone();
        clone._numberOptions.min = min;
        clone._numberOptions.max = max;
        return clone;
    }

    /**
     * @zh 要求为整数
     * @en Require integer
     */
    int(): NumberValidator {
        const clone = this._clone();
        clone._numberOptions.integer = true;
        return clone;
    }

    /**
     * @zh 要求为正数
     * @en Require positive
     */
    positive(): NumberValidator {
        return this.min(0);
    }

    /**
     * @zh 要求为负数
     * @en Require negative
     */
    negative(): NumberValidator {
        return this.max(0);
    }
}

// ============================================================================
// Boolean Validator
// ============================================================================

/**
 * @zh 布尔验证器
 * @en Boolean validator
 */
export class BooleanValidator extends BaseValidator<boolean> {
    readonly typeName = 'boolean';

    protected _validate(value: unknown, path: string[]): ValidationResult<boolean> {
        if (typeof value !== 'boolean') {
            return {
                success: false,
                error: {
                    path,
                    message: `Expected boolean, received ${typeof value}`,
                    expected: 'boolean',
                    received: value
                }
            };
        }

        return { success: true, data: value };
    }

    protected _clone(): BooleanValidator {
        const clone = new BooleanValidator();
        clone._options = { ...this._options };
        return clone;
    }
}

// ============================================================================
// Literal Validator
// ============================================================================

/**
 * @zh 字面量验证器
 * @en Literal validator
 */
export class LiteralValidator<T extends string | number | boolean> extends BaseValidator<T> {
    readonly typeName: string;
    private readonly _literal: T;

    constructor(literal: T) {
        super();
        this._literal = literal;
        this.typeName = `literal(${JSON.stringify(literal)})`;
    }

    protected _validate(value: unknown, path: string[]): ValidationResult<T> {
        if (value !== this._literal) {
            return {
                success: false,
                error: {
                    path,
                    message: `Expected ${JSON.stringify(this._literal)}, received ${JSON.stringify(value)}`,
                    expected: this.typeName,
                    received: value
                }
            };
        }

        return { success: true, data: value as T };
    }

    protected _clone(): LiteralValidator<T> {
        const clone = new LiteralValidator(this._literal);
        clone._options = { ...this._options };
        return clone;
    }
}

// ============================================================================
// Any Validator
// ============================================================================

/**
 * @zh 任意类型验证器
 * @en Any type validator
 */
export class AnyValidator extends BaseValidator<unknown> {
    readonly typeName = 'any';

    protected _validate(value: unknown): ValidationResult<unknown> {
        return { success: true, data: value };
    }

    protected _clone(): AnyValidator {
        const clone = new AnyValidator();
        clone._options = { ...this._options };
        return clone;
    }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * @zh 创建字符串验证器
 * @en Create string validator
 */
export function string(): StringValidator {
    return new StringValidator();
}

/**
 * @zh 创建数字验证器
 * @en Create number validator
 */
export function number(): NumberValidator {
    return new NumberValidator();
}

/**
 * @zh 创建布尔验证器
 * @en Create boolean validator
 */
export function boolean(): BooleanValidator {
    return new BooleanValidator();
}

/**
 * @zh 创建字面量验证器
 * @en Create literal validator
 */
export function literal<T extends string | number | boolean>(value: T): LiteralValidator<T> {
    return new LiteralValidator(value);
}

/**
 * @zh 创建任意类型验证器
 * @en Create any type validator
 */
export function any(): AnyValidator {
    return new AnyValidator();
}
