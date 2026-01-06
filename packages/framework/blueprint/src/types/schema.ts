/**
 * @zh 蓝图属性 Schema 系统
 * @en Blueprint Property Schema System
 *
 * @zh 提供递归类型定义，支持原始类型、数组、对象、枚举等复杂数据结构
 * @en Provides recursive type definitions supporting primitives, arrays, objects, enums, etc.
 */

import { BlueprintPinType } from './pins';

// ============================================================================
// Schema Types
// ============================================================================

/**
 * @zh 属性 Schema - 递归定义数据结构
 * @en Property Schema - recursive data structure definition
 */
export type PropertySchema =
    | PrimitiveSchema
    | ArraySchema
    | ObjectSchema
    | EnumSchema
    | RefSchema;

/**
 * @zh 原始类型 Schema
 * @en Primitive type schema
 */
export interface PrimitiveSchema {
    type: 'primitive';
    primitive: BlueprintPinType;
    defaultValue?: unknown;

    // Constraints | 约束
    min?: number;
    max?: number;
    step?: number;
    multiline?: boolean;
    placeholder?: string;
}

/**
 * @zh 数组类型 Schema
 * @en Array type schema
 */
export interface ArraySchema {
    type: 'array';
    items: PropertySchema;
    defaultValue?: unknown[];

    // Constraints | 约束
    minItems?: number;
    maxItems?: number;

    // UI Behavior | UI 行为
    reorderable?: boolean;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    itemLabel?: string;
}

/**
 * @zh 对象类型 Schema
 * @en Object type schema
 */
export interface ObjectSchema {
    type: 'object';
    properties: Record<string, PropertySchema>;
    required?: string[];

    // UI Behavior | UI 行为
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    displayName?: string;
}

/**
 * @zh 枚举类型 Schema
 * @en Enum type schema
 */
export interface EnumSchema {
    type: 'enum';
    options: EnumOption[];
    defaultValue?: string | number;
}

/**
 * @zh 枚举选项
 * @en Enum option
 */
export interface EnumOption {
    value: string | number;
    label: string;
    description?: string;
    icon?: string;
}

/**
 * @zh 引用类型 Schema
 * @en Reference type schema
 *
 * @zh 引用 SchemaRegistry 中已注册的 Schema
 * @en References a schema registered in SchemaRegistry
 */
export interface RefSchema {
    type: 'ref';
    ref: string;
}

// ============================================================================
// Schema Registry
// ============================================================================

/**
 * @zh Schema 注册表
 * @en Schema Registry
 *
 * @zh 用于注册和复用常用的 Schema 定义
 * @en Used to register and reuse common Schema definitions
 */
export class SchemaRegistry {
    private static schemas = new Map<string, PropertySchema>();

    /**
     * @zh 注册 Schema
     * @en Register a schema
     */
    static register(id: string, schema: PropertySchema): void {
        this.schemas.set(id, schema);
    }

    /**
     * @zh 获取 Schema
     * @en Get a schema
     */
    static get(id: string): PropertySchema | undefined {
        return this.schemas.get(id);
    }

    /**
     * @zh 解析引用，返回实际 Schema
     * @en Resolve reference, return actual schema
     */
    static resolve(schema: PropertySchema): PropertySchema {
        if (schema.type === 'ref') {
            const resolved = this.schemas.get(schema.ref);
            if (!resolved) {
                console.warn(`[SchemaRegistry] Schema not found: ${schema.ref}`);
                return { type: 'primitive', primitive: 'any' };
            }
            return this.resolve(resolved);
        }
        return schema;
    }

    /**
     * @zh 检查 Schema 是否已注册
     * @en Check if schema is registered
     */
    static has(id: string): boolean {
        return this.schemas.has(id);
    }

    /**
     * @zh 获取所有已注册的 Schema ID
     * @en Get all registered schema IDs
     */
    static keys(): string[] {
        return Array.from(this.schemas.keys());
    }

    /**
     * @zh 清空注册表
     * @en Clear registry
     */
    static clear(): void {
        this.schemas.clear();
    }
}

// ============================================================================
// Schema Utilities
// ============================================================================

/**
 * @zh 获取 Schema 的默认值
 * @en Get default value for a schema
 */
export function getSchemaDefaultValue(schema: PropertySchema): unknown {
    const resolved = SchemaRegistry.resolve(schema);

    switch (resolved.type) {
        case 'primitive':
            if (resolved.defaultValue !== undefined) return resolved.defaultValue;
            return getPrimitiveDefaultValue(resolved.primitive);

        case 'array':
            if (resolved.defaultValue !== undefined) return [...resolved.defaultValue];
            return [];

        case 'object': {
            const obj: Record<string, unknown> = {};
            for (const [key, propSchema] of Object.entries(resolved.properties)) {
                obj[key] = getSchemaDefaultValue(propSchema);
            }
            return obj;
        }

        case 'enum':
            if (resolved.defaultValue !== undefined) return resolved.defaultValue;
            return resolved.options[0]?.value;

        default:
            return undefined;
    }
}

/**
 * @zh 获取原始类型的默认值
 * @en Get default value for primitive type
 */
export function getPrimitiveDefaultValue(primitive: BlueprintPinType): unknown {
    switch (primitive) {
        case 'bool': return false;
        case 'int': return 0;
        case 'float': return 0.0;
        case 'string': return '';
        case 'vector2': return { x: 0, y: 0 };
        case 'vector3': return { x: 0, y: 0, z: 0 };
        case 'color': return { r: 255, g: 255, b: 255, a: 255 };
        case 'entity': return null;
        case 'component': return null;
        case 'object': return null;
        case 'array': return [];
        case 'any': return null;
        case 'exec': return undefined;
        default: return null;
    }
}

/**
 * @zh 根据 Schema 获取对应的 PinType
 * @en Get corresponding PinType from Schema
 */
export function schemaToPinType(schema: PropertySchema): BlueprintPinType {
    const resolved = SchemaRegistry.resolve(schema);

    switch (resolved.type) {
        case 'primitive':
            return resolved.primitive;
        case 'array':
            return 'array';
        case 'object':
            return 'object';
        case 'enum':
            return typeof resolved.options[0]?.value === 'number' ? 'int' : 'string';
        default:
            return 'any';
    }
}

/**
 * @zh 验证数据是否符合 Schema
 * @en Validate data against schema
 */
export function validateSchema(
    schema: PropertySchema,
    data: unknown,
    path: string = ''
): ValidationResult {
    const resolved = SchemaRegistry.resolve(schema);
    const errors: ValidationError[] = [];

    switch (resolved.type) {
        case 'primitive':
            validatePrimitive(resolved, data, path, errors);
            break;

        case 'array':
            validateArray(resolved, data, path, errors);
            break;

        case 'object':
            validateObject(resolved, data, path, errors);
            break;

        case 'enum':
            validateEnum(resolved, data, path, errors);
            break;
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * @zh 验证结果
 * @en Validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

/**
 * @zh 验证错误
 * @en Validation error
 */
export interface ValidationError {
    path: string;
    message: string;
    expected?: string;
    received?: string;
}

function validatePrimitive(
    schema: PrimitiveSchema,
    data: unknown,
    path: string,
    errors: ValidationError[]
): void {
    if (data === null || data === undefined) {
        return; // Allow null/undefined for optional fields
    }

    const expectedType = getPrimitiveJsType(schema.primitive);
    const actualType = typeof data;

    if (expectedType === 'object') {
        if (typeof data !== 'object') {
            errors.push({
                path,
                message: `Expected ${schema.primitive}, got ${actualType}`,
                expected: schema.primitive,
                received: actualType
            });
        }
    } else if (expectedType !== 'any' && actualType !== expectedType) {
        errors.push({
            path,
            message: `Expected ${expectedType}, got ${actualType}`,
            expected: expectedType,
            received: actualType
        });
    }

    // Numeric constraints
    if ((schema.primitive === 'int' || schema.primitive === 'float') && typeof data === 'number') {
        if (schema.min !== undefined && data < schema.min) {
            errors.push({
                path,
                message: `Value ${data} is less than minimum ${schema.min}`
            });
        }
        if (schema.max !== undefined && data > schema.max) {
            errors.push({
                path,
                message: `Value ${data} is greater than maximum ${schema.max}`
            });
        }
    }
}

function validateArray(
    schema: ArraySchema,
    data: unknown,
    path: string,
    errors: ValidationError[]
): void {
    if (!Array.isArray(data)) {
        errors.push({
            path,
            message: `Expected array, got ${typeof data}`,
            expected: 'array',
            received: typeof data
        });
        return;
    }

    if (schema.minItems !== undefined && data.length < schema.minItems) {
        errors.push({
            path,
            message: `Array has ${data.length} items, minimum is ${schema.minItems}`
        });
    }

    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
        errors.push({
            path,
            message: `Array has ${data.length} items, maximum is ${schema.maxItems}`
        });
    }

    // Validate each item
    for (let i = 0; i < data.length; i++) {
        const itemResult = validateSchema(schema.items, data[i], `${path}[${i}]`);
        errors.push(...itemResult.errors);
    }
}

function validateObject(
    schema: ObjectSchema,
    data: unknown,
    path: string,
    errors: ValidationError[]
): void {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        errors.push({
            path,
            message: `Expected object, got ${Array.isArray(data) ? 'array' : typeof data}`,
            expected: 'object',
            received: Array.isArray(data) ? 'array' : typeof data
        });
        return;
    }

    const obj = data as Record<string, unknown>;

    // Check required fields
    if (schema.required) {
        for (const key of schema.required) {
            if (!(key in obj)) {
                errors.push({
                    path: path ? `${path}.${key}` : key,
                    message: `Missing required field: ${key}`
                });
            }
        }
    }

    // Validate each property
    for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
            const propPath = path ? `${path}.${key}` : key;
            const propResult = validateSchema(propSchema, obj[key], propPath);
            errors.push(...propResult.errors);
        }
    }
}

function validateEnum(
    schema: EnumSchema,
    data: unknown,
    path: string,
    errors: ValidationError[]
): void {
    if (data === null || data === undefined) {
        return;
    }

    const validValues = schema.options.map(o => o.value);
    if (!validValues.includes(data as string | number)) {
        errors.push({
            path,
            message: `Invalid enum value: ${data}`,
            expected: validValues.join(' | '),
            received: String(data)
        });
    }
}

function getPrimitiveJsType(primitive: BlueprintPinType): string {
    switch (primitive) {
        case 'bool': return 'boolean';
        case 'int':
        case 'float': return 'number';
        case 'string': return 'string';
        case 'vector2':
        case 'vector3':
        case 'color':
        case 'entity':
        case 'component':
        case 'object':
        case 'array': return 'object';
        case 'any': return 'any';
        case 'exec': return 'undefined';
        default: return 'any';
    }
}

/**
 * @zh 深度克隆 Schema
 * @en Deep clone schema
 */
export function cloneSchema(schema: PropertySchema): PropertySchema {
    return JSON.parse(JSON.stringify(schema));
}

/**
 * @zh 合并两个 ObjectSchema
 * @en Merge two ObjectSchemas
 */
export function mergeObjectSchemas(
    base: ObjectSchema,
    override: Partial<ObjectSchema>
): ObjectSchema {
    return {
        ...base,
        ...override,
        properties: {
            ...base.properties,
            ...(override.properties || {})
        },
        required: [
            ...(base.required || []),
            ...(override.required || [])
        ]
    };
}

// ============================================================================
// Schema Builder (Fluent API)
// ============================================================================

/**
 * @zh Schema 构建器
 * @en Schema Builder
 *
 * @example
 * ```typescript
 * const waypointSchema = Schema.object({
 *     position: Schema.vector2(),
 *     waitTime: Schema.float({ min: 0, defaultValue: 1.0 }),
 *     action: Schema.enum([
 *         { value: 'idle', label: 'Idle' },
 *         { value: 'patrol', label: 'Patrol' }
 *     ])
 * });
 *
 * const pathSchema = Schema.array(waypointSchema, {
 *     minItems: 2,
 *     reorderable: true,
 *     itemLabel: 'Point {index1}'
 * });
 * ```
 */
export const Schema = {
    // Primitives
    bool(options?: Partial<Omit<PrimitiveSchema, 'type' | 'primitive'>>): PrimitiveSchema {
        return { type: 'primitive', primitive: 'bool', ...options };
    },

    int(options?: Partial<Omit<PrimitiveSchema, 'type' | 'primitive'>>): PrimitiveSchema {
        return { type: 'primitive', primitive: 'int', ...options };
    },

    float(options?: Partial<Omit<PrimitiveSchema, 'type' | 'primitive'>>): PrimitiveSchema {
        return { type: 'primitive', primitive: 'float', ...options };
    },

    string(options?: Partial<Omit<PrimitiveSchema, 'type' | 'primitive'>>): PrimitiveSchema {
        return { type: 'primitive', primitive: 'string', ...options };
    },

    vector2(options?: Partial<Omit<PrimitiveSchema, 'type' | 'primitive'>>): PrimitiveSchema {
        return { type: 'primitive', primitive: 'vector2', ...options };
    },

    vector3(options?: Partial<Omit<PrimitiveSchema, 'type' | 'primitive'>>): PrimitiveSchema {
        return { type: 'primitive', primitive: 'vector3', ...options };
    },

    color(options?: Partial<Omit<PrimitiveSchema, 'type' | 'primitive'>>): PrimitiveSchema {
        return { type: 'primitive', primitive: 'color', ...options };
    },

    entity(options?: Partial<Omit<PrimitiveSchema, 'type' | 'primitive'>>): PrimitiveSchema {
        return { type: 'primitive', primitive: 'entity', ...options };
    },

    component(options?: Partial<Omit<PrimitiveSchema, 'type' | 'primitive'>>): PrimitiveSchema {
        return { type: 'primitive', primitive: 'component', ...options };
    },

    object_ref(options?: Partial<Omit<PrimitiveSchema, 'type' | 'primitive'>>): PrimitiveSchema {
        return { type: 'primitive', primitive: 'object', ...options };
    },

    any(options?: Partial<Omit<PrimitiveSchema, 'type' | 'primitive'>>): PrimitiveSchema {
        return { type: 'primitive', primitive: 'any', ...options };
    },

    // Complex types
    array(
        items: PropertySchema,
        options?: Partial<Omit<ArraySchema, 'type' | 'items'>>
    ): ArraySchema {
        return { type: 'array', items, ...options };
    },

    object(
        properties: Record<string, PropertySchema>,
        options?: Partial<Omit<ObjectSchema, 'type' | 'properties'>>
    ): ObjectSchema {
        return { type: 'object', properties, ...options };
    },

    enum(
        options: EnumOption[],
        extra?: Partial<Omit<EnumSchema, 'type' | 'options'>>
    ): EnumSchema {
        return { type: 'enum', options, ...extra };
    },

    ref(id: string): RefSchema {
        return { type: 'ref', ref: id };
    }
};
