/**
 * @zh 蓝图触发器模块
 * @en Blueprint Triggers Module
 *
 * @zh 提供蓝图触发器系统的所有导出
 * @en Provides all exports for the blueprint trigger system
 */

// =============================================================================
// 触发器类型 | Trigger Types
// =============================================================================

export type {
    TriggerType,
    ITriggerContext,
    ITickTriggerContext,
    IInputTriggerContext,
    ICollisionTriggerContext,
    IMessageTriggerContext,
    ITimerTriggerContext,
    IStateTriggerContext,
    ICustomTriggerContext,
    TriggerContext
} from './TriggerTypes';

export {
    TriggerTypes,
    createTickContext,
    createInputContext,
    createCollisionContext,
    createMessageContext,
    createTimerContext,
    createStateContext,
    createCustomContext
} from './TriggerTypes';

// =============================================================================
// 触发器条件 | Trigger Conditions
// =============================================================================

export type {
    ITriggerCondition,
    ConditionLogic
} from './TriggerCondition';

export {
    CompositeCondition,
    NotCondition,
    AlwaysTrueCondition,
    AlwaysFalseCondition,
    TriggerTypeCondition,
    EntityIdCondition,
    FunctionCondition,
    InputActionCondition,
    MessageNameCondition,
    StateNameCondition,
    TimerIdCondition,
    CollisionEntityCondition,
    CustomEventCondition,
    ConditionBuilder,
    condition
} from './TriggerCondition';

// =============================================================================
// 蓝图触发器 | Blueprint Trigger
// =============================================================================

export type {
    TriggerCallback,
    IBlueprintTrigger,
    TriggerConfig,
    ITriggerRegistry
} from './BlueprintTrigger';

export {
    BlueprintTrigger,
    TriggerRegistry,
    createTrigger,
    createTickTrigger,
    createInputTrigger,
    createCollisionTrigger,
    createMessageTrigger,
    createTimerTrigger,
    createStateEnterTrigger,
    createStateExitTrigger,
    createCustomTrigger
} from './BlueprintTrigger';

// =============================================================================
// 触发器调度器 | Trigger Dispatcher
// =============================================================================

export type {
    TriggerResult,
    DispatchResult,
    ITriggerDispatcher,
    IEntityTriggerManager
} from './TriggerDispatcher';

export {
    TriggerDispatcher,
    EntityTriggerManager,
    createTriggerDispatcher,
    createEntityTriggerManager
} from './TriggerDispatcher';
