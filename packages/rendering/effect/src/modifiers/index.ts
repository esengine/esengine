/**
 * @zh 修改器模块
 * @en Modifier Module
 */

export type {
    ModifierOperation,
    ModifierPriority,
    IModifier,
    IAttributeCalculator
} from './IModifier';

export {
    NumericCalculator,
    ModifierContainer,
    createModifierContainer
} from './ModifierContainer';
