/**
 * @zh Schema 验证类型定义
 * @en Schema validation type definitions
 */

// ============================================================================
// Validation Result
// ============================================================================

/**
 * @zh 验证错误
 * @en Validation error
 */
export interface ValidationError {
    /**
     * @zh 错误路径（如 ['user', 'name']）
     * @en Error path (e.g., ['user', 'name'])
     */
    path: string[];

    /**
     * @zh 错误消息
     * @en Error message
     */
    message: string;

    /**
     * @zh 预期类型
     * @en Expected type
     */
    expected?: string;

    /**
     * @zh 实际值
     * @en Actual value
     */
    received?: unknown;
}

/**
 * @zh 验证成功结果
 * @en Validation success result
 */
export interface ValidationSuccess<T> {
    success: true;
    data: T;
}

/**
 * @zh 验证失败结果
 * @en Validation failure result
 */
export interface ValidationFailure {
    success: false;
    error: ValidationError;
}

/**
 * @zh 验证结果
 * @en Validation result
 */
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

// ============================================================================
// Validator Interface
// ============================================================================

/**
 * @zh 验证器接口
 * @en Validator interface
 */
export interface Validator<T> {
    /**
     * @zh 类型名称（用于错误消息）
     * @en Type name (for error messages)
     */
    readonly typeName: string;

    /**
     * @zh 验证值
     * @en Validate value
     *
     * @param value - @zh 待验证的值 @en Value to validate
     * @param path - @zh 当前路径（用于错误报告）@en Current path (for error reporting)
     * @returns @zh 验证结果 @en Validation result
     */
    validate(value: unknown, path?: string[]): ValidationResult<T>;

    /**
     * @zh 类型守卫检查
     * @en Type guard check
     *
     * @param value - @zh 待检查的值 @en Value to check
     * @returns @zh 是否为指定类型 @en Whether value is of specified type
     */
    is(value: unknown): value is T;

    /**
     * @zh 标记为可选
     * @en Mark as optional
     */
    optional(): Validator<T | undefined>;

    /**
     * @zh 设置默认值
     * @en Set default value
     *
     * @param defaultValue - @zh 默认值 @en Default value
     */
    default(defaultValue: T): Validator<T>;

    /**
     * @zh 允许 null
     * @en Allow null
     */
    nullable(): Validator<T | null>;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * @zh 从验证器推断类型
 * @en Infer type from validator
 */
export type Infer<V extends Validator<unknown>> = V extends Validator<infer T> ? T : never;

/**
 * @zh 对象 Schema 定义
 * @en Object schema definition
 */
export type ObjectShape = Record<string, Validator<unknown>>;

/**
 * @zh 从对象 Shape 推断类型
 * @en Infer type from object shape
 */
export type InferShape<T extends ObjectShape> = {
    [K in keyof T]: Infer<T[K]>;
};

/**
 * @zh 验证器选项
 * @en Validator options
 */
export interface ValidatorOptions {
    /**
     * @zh 是否可选
     * @en Whether optional
     */
    isOptional?: boolean;

    /**
     * @zh 默认值
     * @en Default value
     */
    defaultValue?: unknown;

    /**
     * @zh 是否允许 null
     * @en Whether nullable
     */
    isNullable?: boolean;
}
