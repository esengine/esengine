/**
 * @zh 蓝图装饰器 - 用于标记可在蓝图中使用的组件、属性和方法
 * @en Blueprint Decorators - Mark components, properties and methods for blueprint use
 */

import type { BlueprintPinType } from '../types/pins';
import type { PropertySchema, ArraySchema, ObjectSchema } from '../types/schema';

// ============================================================================
// Types
// ============================================================================

export interface BlueprintParamDef {
    name: string;
    displayName?: string;
    type?: BlueprintPinType;
    defaultValue?: unknown;
}

export interface BlueprintExposeOptions {
    displayName?: string;
    description?: string;
    category?: string;
    color?: string;
    icon?: string;
}

export interface BlueprintPropertyOptions {
    displayName?: string;
    description?: string;
    type?: BlueprintPinType;
    readonly?: boolean;
    defaultValue?: unknown;
}

export interface BlueprintMethodOptions {
    displayName?: string;
    description?: string;
    isPure?: boolean;
    params?: BlueprintParamDef[];
    returnType?: BlueprintPinType;
}

/**
 * @zh 蓝图数组属性选项
 * @en Blueprint array property options
 */
export interface BlueprintArrayOptions {
    displayName?: string;
    description?: string;
    itemSchema: PropertySchema;
    reorderable?: boolean;
    collapsible?: boolean;
    minItems?: number;
    maxItems?: number;
    defaultValue?: unknown[];
    itemLabel?: string;
    exposeElementPorts?: boolean;
    portNameTemplate?: string;
}

/**
 * @zh 蓝图对象属性选项
 * @en Blueprint object property options
 */
export interface BlueprintObjectOptions {
    displayName?: string;
    description?: string;
    properties: Record<string, PropertySchema>;
    collapsible?: boolean;
}

export interface PropertyMetadata {
    propertyKey: string;
    displayName: string;
    description?: string;
    pinType: BlueprintPinType;
    readonly: boolean;
    defaultValue?: unknown;
    schema?: PropertySchema;
    isDynamicArray?: boolean;
    exposeElementPorts?: boolean;
    portNameTemplate?: string;
}

export interface MethodMetadata {
    methodKey: string;
    displayName: string;
    description?: string;
    isPure: boolean;
    params: BlueprintParamDef[];
    returnType: BlueprintPinType;
}

export interface ComponentBlueprintMetadata extends BlueprintExposeOptions {
    componentName: string;
    properties: PropertyMetadata[];
    methods: MethodMetadata[];
}

// ============================================================================
// Registry
// ============================================================================

const registeredComponents = new Map<Function, ComponentBlueprintMetadata>();

export function getRegisteredBlueprintComponents(): Map<Function, ComponentBlueprintMetadata> {
    return registeredComponents;
}

export function getBlueprintMetadata(componentClass: Function): ComponentBlueprintMetadata | undefined {
    return registeredComponents.get(componentClass);
}

export function clearRegisteredComponents(): void {
    registeredComponents.clear();
}

// ============================================================================
// Internal Helpers
// ============================================================================

function getOrCreateMetadata(constructor: Function): ComponentBlueprintMetadata {
    let metadata = registeredComponents.get(constructor);
    if (!metadata) {
        metadata = {
            componentName: (constructor as any).__componentName__ ?? constructor.name,
            properties: [],
            methods: []
        };
        registeredComponents.set(constructor, metadata);
    }
    return metadata;
}

// ============================================================================
// Decorators
// ============================================================================

export function BlueprintExpose(options: BlueprintExposeOptions = {}): ClassDecorator {
    return function (target: Function) {
        const metadata = getOrCreateMetadata(target);
        Object.assign(metadata, options);
        metadata.componentName = (target as any).__componentName__ ?? target.name;
        return target as any;
    };
}

export function BlueprintProperty(options: BlueprintPropertyOptions = {}): PropertyDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        const key = String(propertyKey);
        const metadata = getOrCreateMetadata(target.constructor);

        const propMeta: PropertyMetadata = {
            propertyKey: key,
            displayName: options.displayName ?? key,
            description: options.description,
            pinType: options.type ?? 'any',
            readonly: options.readonly ?? false,
            defaultValue: options.defaultValue
        };

        const existingIndex = metadata.properties.findIndex(p => p.propertyKey === key);
        if (existingIndex >= 0) {
            metadata.properties[existingIndex] = propMeta;
        } else {
            metadata.properties.push(propMeta);
        }
    };
}

/**
 * @zh 标记属性为蓝图数组（支持动态增删、排序）
 * @en Mark property as blueprint array (supports dynamic add/remove, reorder)
 *
 * @example
 * ```typescript
 * @BlueprintArray({
 *     displayName: '路径点',
 *     itemSchema: Schema.object({
 *         position: Schema.vector2(),
 *         waitTime: Schema.float({ min: 0, defaultValue: 1.0 })
 *     }),
 *     reorderable: true,
 *     exposeElementPorts: true,
 *     portNameTemplate: 'Point {index1}'
 * })
 * waypoints: Waypoint[] = [];
 * ```
 */
export function BlueprintArray(options: BlueprintArrayOptions): PropertyDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        const key = String(propertyKey);
        const metadata = getOrCreateMetadata(target.constructor);

        const arraySchema: ArraySchema = {
            type: 'array',
            items: options.itemSchema,
            defaultValue: options.defaultValue,
            minItems: options.minItems,
            maxItems: options.maxItems,
            reorderable: options.reorderable,
            collapsible: options.collapsible,
            itemLabel: options.itemLabel
        };

        const propMeta: PropertyMetadata = {
            propertyKey: key,
            displayName: options.displayName ?? key,
            description: options.description,
            pinType: 'array',
            readonly: false,
            defaultValue: options.defaultValue,
            schema: arraySchema,
            isDynamicArray: true,
            exposeElementPorts: options.exposeElementPorts,
            portNameTemplate: options.portNameTemplate
        };

        const existingIndex = metadata.properties.findIndex(p => p.propertyKey === key);
        if (existingIndex >= 0) {
            metadata.properties[existingIndex] = propMeta;
        } else {
            metadata.properties.push(propMeta);
        }
    };
}

/**
 * @zh 标记属性为蓝图对象（支持嵌套结构）
 * @en Mark property as blueprint object (supports nested structure)
 *
 * @example
 * ```typescript
 * @BlueprintObject({
 *     displayName: '变换',
 *     properties: {
 *         position: Schema.vector2(),
 *         rotation: Schema.float(),
 *         scale: Schema.vector2({ defaultValue: { x: 1, y: 1 } })
 *     }
 * })
 * transform: Transform;
 * ```
 */
export function BlueprintObject(options: BlueprintObjectOptions): PropertyDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        const key = String(propertyKey);
        const metadata = getOrCreateMetadata(target.constructor);

        const objectSchema: ObjectSchema = {
            type: 'object',
            properties: options.properties,
            collapsible: options.collapsible
        };

        const propMeta: PropertyMetadata = {
            propertyKey: key,
            displayName: options.displayName ?? key,
            description: options.description,
            pinType: 'object',
            readonly: false,
            schema: objectSchema
        };

        const existingIndex = metadata.properties.findIndex(p => p.propertyKey === key);
        if (existingIndex >= 0) {
            metadata.properties[existingIndex] = propMeta;
        } else {
            metadata.properties.push(propMeta);
        }
    };
}

export function BlueprintMethod(options: BlueprintMethodOptions = {}): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const key = String(propertyKey);
        const metadata = getOrCreateMetadata(target.constructor);

        const methodMeta: MethodMetadata = {
            methodKey: key,
            displayName: options.displayName ?? key,
            description: options.description,
            isPure: options.isPure ?? false,
            params: options.params ?? [],
            returnType: options.returnType ?? 'any'
        };

        const existingIndex = metadata.methods.findIndex(m => m.methodKey === key);
        if (existingIndex >= 0) {
            metadata.methods[existingIndex] = methodMeta;
        } else {
            metadata.methods.push(methodMeta);
        }

        return descriptor;
    };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function inferPinType(typeName: string): BlueprintPinType {
    const typeMap: Record<string, BlueprintPinType> = {
        'number': 'float',
        'Number': 'float',
        'string': 'string',
        'String': 'string',
        'boolean': 'bool',
        'Boolean': 'bool',
        'Entity': 'entity',
        'Component': 'component',
        'Vector2': 'vector2',
        'Vec2': 'vector2',
        'Vector3': 'vector3',
        'Vec3': 'vector3',
        'Color': 'color',
        'Array': 'array',
        'Object': 'object',
        'void': 'exec',
        'undefined': 'exec'
    };

    return typeMap[typeName] ?? 'any';
}
