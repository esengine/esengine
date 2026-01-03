/**
 * @zh 蓝图注册系统
 * @en Blueprint Registry System
 *
 * @zh 提供组件自动节点生成功能，用户只需使用装饰器标记组件，
 * 即可自动在蓝图编辑器中生成对应的 Get/Set/Call 节点
 *
 * @en Provides automatic node generation for components. Users only need to
 * mark components with decorators, and corresponding Get/Set/Call nodes
 * will be auto-generated in the blueprint editor
 *
 * @example
 * ```typescript
 * // 1. 定义组件时使用装饰器 | Define component with decorators
 * @ECSComponent('Health')
 * @BlueprintExpose({ displayName: '生命值', category: 'gameplay' })
 * export class HealthComponent extends Component {
 *     @BlueprintProperty({ displayName: '当前生命值', type: 'float' })
 *     current: number = 100;
 *
 *     @BlueprintMethod({
 *         displayName: '治疗',
 *         params: [{ name: 'amount', type: 'float' }]
 *     })
 *     heal(amount: number): void {
 *         this.current = Math.min(this.current + amount, 100);
 *     }
 * }
 *
 * // 2. 初始化蓝图系统时注册 | Register when initializing blueprint system
 * import { registerAllComponentNodes } from '@esengine/blueprint';
 * registerAllComponentNodes();
 *
 * // 3. 现在蓝图编辑器中会出现以下节点：
 * //    Now these nodes appear in blueprint editor:
 * //    - Get Health（获取组件）
 * //    - Get 当前生命值（获取属性）
 * //    - Set 当前生命值（设置属性）
 * //    - 治疗（调用方法）
 * ```
 */

// Decorators | 装饰器
export {
    BlueprintExpose,
    BlueprintProperty,
    BlueprintMethod,
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
