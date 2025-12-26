/**
 * @esengine/effect
 *
 * @zh 效果系统
 * @en Effect System
 *
 * @zh 提供 Buff/Debuff 效果管理和属性修改器
 * @en Provides Buff/Debuff effect management and attribute modifiers
 */

// =============================================================================
// Core | 核心
// =============================================================================

export type {
    DurationType,
    IEffectDuration,
    StackingRule,
    IStackingConfig,
    IEffectDefinition,
    IEffectInstance,
    EffectEventType,
    IEffectEvent,
    EffectEventListener,
    IEffectHandler
} from './core';

export { EffectContainer, createEffectContainer } from './core';

// =============================================================================
// Modifiers | 修改器
// =============================================================================

export type {
    ModifierOperation,
    ModifierPriority,
    IModifier,
    IAttributeCalculator
} from './modifiers';

export {
    NumericCalculator,
    ModifierContainer,
    createModifierContainer
} from './modifiers';

// =============================================================================
// Blueprint Nodes | 蓝图节点
// =============================================================================

export {
    // Templates
    ApplyEffectTemplate,
    RemoveEffectTemplate,
    RemoveEffectByTagTemplate,
    HasEffectTemplate,
    HasEffectTagTemplate,
    GetEffectStacksTemplate,
    GetEffectRemainingTimeTemplate,
    GetEffectCountTemplate,
    ClearAllEffectsTemplate,
    OnEffectAppliedTemplate,
    OnEffectRemovedTemplate,
    OnEffectTickTemplate,
    // Executors
    ApplyEffectExecutor,
    RemoveEffectExecutor,
    RemoveEffectByTagExecutor,
    HasEffectExecutor,
    HasEffectTagExecutor,
    GetEffectStacksExecutor,
    GetEffectRemainingTimeExecutor,
    GetEffectCountExecutor,
    ClearAllEffectsExecutor,
    OnEffectAppliedExecutor,
    OnEffectRemovedExecutor,
    OnEffectTickExecutor,
    // Collection
    EffectNodeDefinitions
} from './nodes';
