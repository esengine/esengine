/**
 * @zh Schema 验证系统
 * @en Schema validation system
 *
 * @zh 轻量级自定义验证系统，提供类型安全的运行时验证
 * @en Lightweight custom validation system with type-safe runtime validation
 *
 * @example
 * ```typescript
 * import { s } from '@esengine/server';
 *
 * // 定义 Schema | Define schema
 * const MoveSchema = s.object({
 *     x: s.number(),
 *     y: s.number(),
 *     speed: s.number().optional()
 * });
 *
 * // 推断类型 | Infer type
 * type Move = s.infer<typeof MoveSchema>;
 *
 * // 验证数据 | Validate data
 * const result = MoveSchema.validate(data);
 * if (result.success) {
 *     console.log(result.data); // 类型安全 | Type-safe
 * } else {
 *     console.error(result.error);
 * }
 *
 * // 与 defineApi 集成 | Integrate with defineApi
 * export default defineApi<Move, void>({
 *     schema: MoveSchema,
 *     handler(req, ctx) {
 *         // req 已验证，类型安全 | req is validated, type-safe
 *     }
 * });
 * ```
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
    Validator,
    ValidationResult,
    ValidationSuccess,
    ValidationFailure,
    ValidationError,
    Infer,
    ObjectShape,
    InferShape,
    ValidatorOptions
} from './types.js';

// ============================================================================
// Base Validator Export
// ============================================================================

export { BaseValidator } from './base.js';

// ============================================================================
// Validator Exports
// ============================================================================

export {
    StringValidator,
    NumberValidator,
    BooleanValidator,
    LiteralValidator,
    AnyValidator,
    string,
    number,
    boolean,
    literal,
    any
} from './primitives.js';

export type {
    StringValidatorOptions,
    NumberValidatorOptions
} from './primitives.js';

export {
    ObjectValidator,
    ArrayValidator,
    TupleValidator,
    UnionValidator,
    RecordValidator,
    EnumValidator,
    object,
    array,
    tuple,
    union,
    record,
    nativeEnum
} from './composites.js';

export type {
    ObjectValidatorOptions,
    ArrayValidatorOptions
} from './composites.js';

// ============================================================================
// Schema Builder (s namespace)
// ============================================================================

import type { Infer, Validator } from './types.js';
import {
    string,
    number,
    boolean,
    literal,
    any
} from './primitives.js';
import {
    object,
    array,
    tuple,
    union,
    record,
    nativeEnum
} from './composites.js';

/**
 * @zh Schema 构建器命名空间
 * @en Schema builder namespace
 *
 * @example
 * ```typescript
 * import { s } from '@esengine/server';
 *
 * const UserSchema = s.object({
 *     id: s.string(),
 *     name: s.string().min(1).max(50),
 *     age: s.number().int().min(0).max(150),
 *     email: s.string().email().optional(),
 *     role: s.enum(['admin', 'user', 'guest'] as const),
 *     tags: s.array(s.string()),
 *     metadata: s.record(s.any()).optional()
 * });
 *
 * type User = s.infer<typeof UserSchema>;
 * ```
 */
export const s = {
    // Primitives
    string,
    number,
    boolean,
    literal,
    any,

    // Composites
    object,
    array,
    tuple,
    union,
    record,

    /**
     * @zh 创建枚举验证器
     * @en Create enum validator
     *
     * @example
     * ```typescript
     * const RoleSchema = s.enum(['admin', 'user', 'guest'] as const);
     * type Role = s.infer<typeof RoleSchema>; // 'admin' | 'user' | 'guest'
     * ```
     */
    enum: nativeEnum,

    /**
     * @zh 类型推断辅助（仅用于类型层面）
     * @en Type inference helper (type-level only)
     *
     * @zh 这是一个类型辅助，用于从验证器推断类型
     * @en This is a type helper to infer types from validators
     */
    infer: undefined as unknown as <V extends Validator<unknown>>() => Infer<V>
} as const;

/**
 * @zh 类型推断辅助类型
 * @en Type inference helper type
 */
export namespace s {
    /**
     * @zh 从验证器推断类型
     * @en Infer type from validator
     */
    export type infer<V extends Validator<unknown>> = Infer<V>;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * @zh 验证数据并抛出错误
 * @en Validate data and throw error
 *
 * @param validator - @zh 验证器 @en Validator
 * @param value - @zh 待验证的值 @en Value to validate
 * @returns @zh 验证通过的数据 @en Validated data
 * @throws @zh 验证失败时抛出错误 @en Throws when validation fails
 */
export function parse<T>(validator: Validator<T>, value: unknown): T {
    const result = validator.validate(value);
    if (!result.success) {
        const pathStr = result.error.path.length > 0
            ? ` at "${result.error.path.join('.')}"`
            : '';
        throw new Error(`Validation failed${pathStr}: ${result.error.message}`);
    }
    return result.data;
}

/**
 * @zh 安全验证数据（不抛出错误）
 * @en Safely validate data (no throw)
 *
 * @param validator - @zh 验证器 @en Validator
 * @param value - @zh 待验证的值 @en Value to validate
 * @returns @zh 验证结果 @en Validation result
 */
export function safeParse<T>(validator: Validator<T>, value: unknown) {
    return validator.validate(value);
}

/**
 * @zh 创建类型守卫函数
 * @en Create type guard function
 *
 * @param validator - @zh 验证器 @en Validator
 * @returns @zh 类型守卫函数 @en Type guard function
 *
 * @example
 * ```typescript
 * const isUser = createGuard(UserSchema);
 * if (isUser(data)) {
 *     // data is User
 * }
 * ```
 */
export function createGuard<T>(validator: Validator<T>): (value: unknown) => value is T {
    return (value: unknown): value is T => validator.is(value);
}
