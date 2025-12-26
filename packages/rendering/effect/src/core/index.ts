/**
 * @zh 效果核心模块
 * @en Effect Core Module
 */

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
} from './IEffect';

export { EffectContainer, createEffectContainer } from './EffectContainer';
