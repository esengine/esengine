/**
 * @zh 基础验证器抽象类
 * @en Base validator abstract class
 *
 * @zh 所有验证器的基类，提供通用的验证逻辑
 * @en Base class for all validators, providing common validation logic
 */

import type {
    Validator,
    ValidationResult,
    ValidatorOptions
} from './types.js';

/**
 * @zh 基础验证器抽象类
 * @en Base validator abstract class
 */
export abstract class BaseValidator<T> implements Validator<T> {
    abstract readonly typeName: string;

    protected _options: ValidatorOptions = {};

    /**
     * @zh 核心验证逻辑（子类实现）
     * @en Core validation logic (implemented by subclass)
     */
    protected abstract _validate(value: unknown, path: string[]): ValidationResult<T>;

    validate(value: unknown, path: string[] = []): ValidationResult<T> {
        // Handle undefined
        if (value === undefined) {
            if (this._options.isOptional) {
                if (this._options.defaultValue !== undefined) {
                    return { success: true, data: this._options.defaultValue as T };
                }
                return { success: true, data: undefined as T };
            }
            return {
                success: false,
                error: {
                    path,
                    message: 'Required',
                    expected: this.typeName,
                    received: undefined
                }
            };
        }

        // Handle null
        if (value === null) {
            if (this._options.isNullable) {
                return { success: true, data: null as T };
            }
            return {
                success: false,
                error: {
                    path,
                    message: 'Expected non-null value',
                    expected: this.typeName,
                    received: null
                }
            };
        }

        return this._validate(value, path);
    }

    is(value: unknown): value is T {
        return this.validate(value).success;
    }

    optional(): Validator<T | undefined> {
        const clone = this._clone();
        clone._options.isOptional = true;
        return clone as unknown as Validator<T | undefined>;
    }

    default(defaultValue: T): Validator<T> {
        const clone = this._clone();
        clone._options.isOptional = true;
        clone._options.defaultValue = defaultValue;
        return clone;
    }

    nullable(): Validator<T | null> {
        const clone = this._clone();
        clone._options.isNullable = true;
        return clone as unknown as Validator<T | null>;
    }

    /**
     * @zh 克隆验证器（用于链式调用）
     * @en Clone validator (for chaining)
     */
    protected abstract _clone(): BaseValidator<T>;
}
