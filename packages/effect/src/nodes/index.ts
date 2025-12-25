/**
 * @zh 效果蓝图节点模块
 * @en Effect Blueprint Nodes Module
 */

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
} from './EffectNodes';
