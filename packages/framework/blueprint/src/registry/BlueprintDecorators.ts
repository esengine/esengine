/**
 * @zh 蓝图装饰器 - 用于标记可在蓝图中使用的组件、属性和方法
 * @en Blueprint Decorators - Mark components, properties and methods for blueprint use
 *
 * @example
 * ```typescript
 * import { BlueprintExpose, BlueprintProperty, BlueprintMethod } from '@esengine/blueprint';
 *
 * @ECSComponent('Health')
 * @BlueprintExpose({ displayName: '生命值组件', category: 'gameplay' })
 * export class HealthComponent extends Component {
 *
 *     @BlueprintProperty({ displayName: '当前生命值', type: 'float' })
 *     current: number = 100;
 *
 *     @BlueprintProperty({ displayName: '最大生命值', type: 'float', readonly: true })
 *     max: number = 100;
 *
 *     @BlueprintMethod({
 *         displayName: '治疗',
 *         params: [{ name: 'amount', type: 'float' }]
 *     })
 *     heal(amount: number): void {
 *         this.current = Math.min(this.current + amount, this.max);
 *     }
 *
 *     @BlueprintMethod({
 *         displayName: '受伤',
 *         params: [{ name: 'amount', type: 'float' }],
 *         returnType: 'bool'
 *     })
 *     takeDamage(amount: number): boolean {
 *         this.current -= amount;
 *         return this.current <= 0;
 *     }
 * }
 * ```
 */

import type { BlueprintPinType } from '../types/pins';

// ============================================================================
// Types | 类型定义
// ============================================================================

/**
 * @zh 参数定义
 * @en Parameter definition
 */
export interface BlueprintParamDef {
    /** @zh 参数名称 @en Parameter name */
    name: string;
    /** @zh 显示名称 @en Display name */
    displayName?: string;
    /** @zh 引脚类型 @en Pin type */
    type?: BlueprintPinType;
    /** @zh 默认值 @en Default value */
    defaultValue?: unknown;
}

/**
 * @zh 蓝图暴露选项
 * @en Blueprint expose options
 */
export interface BlueprintExposeOptions {
    /** @zh 组件显示名称 @en Component display name */
    displayName?: string;
    /** @zh 组件描述 @en Component description */
    description?: string;
    /** @zh 组件分类 @en Component category */
    category?: string;
    /** @zh 组件颜色 @en Component color */
    color?: string;
    /** @zh 组件图标 @en Component icon */
    icon?: string;
}

/**
 * @zh 蓝图属性选项
 * @en Blueprint property options
 */
export interface BlueprintPropertyOptions {
    /** @zh 属性显示名称 @en Property display name */
    displayName?: string;
    /** @zh 属性描述 @en Property description */
    description?: string;
    /** @zh 引脚类型 @en Pin type */
    type?: BlueprintPinType;
    /** @zh 是否只读（不生成 Set 节点）@en Readonly (no Set node generated) */
    readonly?: boolean;
    /** @zh 默认值 @en Default value */
    defaultValue?: unknown;
}

/**
 * @zh 蓝图方法选项
 * @en Blueprint method options
 */
export interface BlueprintMethodOptions {
    /** @zh 方法显示名称 @en Method display name */
    displayName?: string;
    /** @zh 方法描述 @en Method description */
    description?: string;
    /** @zh 是否是纯函数（无副作用）@en Is pure function (no side effects) */
    isPure?: boolean;
    /** @zh 参数列表 @en Parameter list */
    params?: BlueprintParamDef[];
    /** @zh 返回值类型 @en Return type */
    returnType?: BlueprintPinType;
}

/**
 * @zh 属性元数据
 * @en Property metadata
 */
export interface PropertyMetadata {
    propertyKey: string;
    displayName: string;
    description?: string;
    pinType: BlueprintPinType;
    readonly: boolean;
    defaultValue?: unknown;
}

/**
 * @zh 方法元数据
 * @en Method metadata
 */
export interface MethodMetadata {
    methodKey: string;
    displayName: string;
    description?: string;
    isPure: boolean;
    params: BlueprintParamDef[];
    returnType: BlueprintPinType;
}

/**
 * @zh 组件蓝图元数据
 * @en Component blueprint metadata
 */
export interface ComponentBlueprintMetadata extends BlueprintExposeOptions {
    componentName: string;
    properties: PropertyMetadata[];
    methods: MethodMetadata[];
}

// ============================================================================
// Registry | 注册表
// ============================================================================

/**
 * @zh 已注册的蓝图组件
 * @en Registered blueprint components
 */
const registeredComponents = new Map<Function, ComponentBlueprintMetadata>();

/**
 * @zh 获取所有已注册的蓝图组件
 * @en Get all registered blueprint components
 */
export function getRegisteredBlueprintComponents(): Map<Function, ComponentBlueprintMetadata> {
    return registeredComponents;
}

/**
 * @zh 获取组件的蓝图元数据
 * @en Get blueprint metadata for a component
 */
export function getBlueprintMetadata(componentClass: Function): ComponentBlueprintMetadata | undefined {
    return registeredComponents.get(componentClass);
}

/**
 * @zh 清除所有注册的蓝图组件（用于测试）
 * @en Clear all registered blueprint components (for testing)
 */
export function clearRegisteredComponents(): void {
    registeredComponents.clear();
}

// ============================================================================
// Internal Helpers | 内部辅助函数
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
// Decorators | 装饰器
// ============================================================================

/**
 * @zh 标记组件可在蓝图中使用
 * @en Mark component as usable in blueprint
 *
 * @example
 * ```typescript
 * @ECSComponent('Player')
 * @BlueprintExpose({ displayName: '玩家', category: 'gameplay' })
 * export class PlayerComponent extends Component { }
 * ```
 */
export function BlueprintExpose(options: BlueprintExposeOptions = {}): ClassDecorator {
    return function (target: Function) {
        const metadata = getOrCreateMetadata(target);
        Object.assign(metadata, options);
        metadata.componentName = (target as any).__componentName__ ?? target.name;
        return target as any;
    };
}

/**
 * @zh 标记属性可在蓝图中访问
 * @en Mark property as accessible in blueprint
 *
 * @example
 * ```typescript
 * @BlueprintProperty({ displayName: '生命值', type: 'float' })
 * health: number = 100;
 *
 * @BlueprintProperty({ displayName: '名称', type: 'string', readonly: true })
 * name: string = 'Player';
 * ```
 */
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
 * @zh 标记方法可在蓝图中调用
 * @en Mark method as callable in blueprint
 *
 * @example
 * ```typescript
 * @BlueprintMethod({
 *     displayName: '攻击',
 *     params: [
 *         { name: 'target', type: 'entity' },
 *         { name: 'damage', type: 'float' }
 *     ],
 *     returnType: 'bool'
 * })
 * attack(target: Entity, damage: number): boolean { }
 *
 * @BlueprintMethod({ displayName: '获取速度', isPure: true, returnType: 'float' })
 * getSpeed(): number { return this.speed; }
 * ```
 */
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
// Utility Functions | 工具函数
// ============================================================================

/**
 * @zh 从 TypeScript 类型名推断蓝图引脚类型
 * @en Infer blueprint pin type from TypeScript type name
 */
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
