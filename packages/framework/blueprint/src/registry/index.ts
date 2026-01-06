/**
 * @zh 蓝图注册系统
 * @en Blueprint Registry System
 */

// Decorators | 装饰器
export {
    BlueprintExpose,
    BlueprintProperty,
    BlueprintMethod,
    BlueprintArray,
    BlueprintObject,
    getRegisteredBlueprintComponents,
    getBlueprintMetadata,
    clearRegisteredComponents,
    inferPinType
} from './BlueprintDecorators';

export type {
    BlueprintParamDef,
    BlueprintExposeOptions,
    BlueprintPropertyOptions,
    BlueprintMethodOptions,
    BlueprintArrayOptions,
    BlueprintObjectOptions,
    PropertyMetadata,
    MethodMetadata,
    ComponentBlueprintMetadata
} from './BlueprintDecorators';

// Node Generator | 节点生成器
export {
    generateComponentNodes,
    registerAllComponentNodes,
    registerComponentNodes
} from './ComponentNodeGenerator';
