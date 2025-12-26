/**
 * @zh 修改器接口定义
 * @en Modifier Interface Definitions
 */

// =============================================================================
// 修改器类型 | Modifier Types
// =============================================================================

/**
 * @zh 修改器操作类型
 * @en Modifier operation type
 */
export type ModifierOperation = 'add' | 'multiply' | 'override' | 'min' | 'max';

/**
 * @zh 修改器优先级
 * @en Modifier priority
 */
export type ModifierPriority = 'base' | 'add' | 'multiply' | 'final';

/**
 * @zh 修改器接口
 * @en Modifier interface
 */
export interface IModifier<T = number> {
    /**
     * @zh 修改器 ID
     * @en Modifier ID
     */
    readonly id: string;

    /**
     * @zh 修改器来源（效果实例 ID）
     * @en Modifier source (effect instance ID)
     */
    readonly sourceId: string;

    /**
     * @zh 修改的属性名
     * @en Modified attribute name
     */
    readonly attribute: string;

    /**
     * @zh 操作类型
     * @en Operation type
     */
    readonly operation: ModifierOperation;

    /**
     * @zh 优先级
     * @en Priority
     */
    readonly priority: ModifierPriority;

    /**
     * @zh 修改值
     * @en Modifier value
     */
    value: T;

    /**
     * @zh 是否激活
     * @en Whether active
     */
    isActive: boolean;
}

/**
 * @zh 属性值计算器
 * @en Attribute value calculator
 */
export interface IAttributeCalculator<T = number> {
    /**
     * @zh 计算最终属性值
     * @en Calculate final attribute value
     *
     * @param baseValue - @zh 基础值 @en Base value
     * @param modifiers - @zh 修改器列表 @en Modifier list
     * @returns @zh 最终值 @en Final value
     */
    calculate(baseValue: T, modifiers: IModifier<T>[]): T;
}
