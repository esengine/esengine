/**
 * @zh 效果接口定义
 * @en Effect Interface Definitions
 */

// =============================================================================
// 持续时间类型 | Duration Types
// =============================================================================

/**
 * @zh 持续时间类型
 * @en Duration type
 */
export type DurationType = 'permanent' | 'timed' | 'conditional';

/**
 * @zh 持续时间配置
 * @en Duration configuration
 */
export interface IEffectDuration {
    /**
     * @zh 持续时间类型
     * @en Duration type
     */
    readonly type: DurationType;

    /**
     * @zh 持续时间（秒），仅 timed 类型有效
     * @en Duration in seconds, only valid for timed type
     */
    readonly duration?: number;

    /**
     * @zh 剩余时间（秒）
     * @en Remaining time in seconds
     */
    remainingTime?: number;

    /**
     * @zh 条件检查函数，仅 conditional 类型有效
     * @en Condition check function, only valid for conditional type
     */
    readonly condition?: () => boolean;
}

// =============================================================================
// 叠加规则 | Stacking Rules
// =============================================================================

/**
 * @zh 叠加规则类型
 * @en Stacking rule type
 */
export type StackingRule = 'refresh' | 'stack' | 'independent' | 'replace' | 'ignore';

/**
 * @zh 叠加配置
 * @en Stacking configuration
 */
export interface IStackingConfig {
    /**
     * @zh 叠加规则
     * @en Stacking rule
     */
    readonly rule: StackingRule;

    /**
     * @zh 最大叠加层数（stack 规则）
     * @en Maximum stack count (for stack rule)
     */
    readonly maxStacks?: number;

    /**
     * @zh 每层效果强度倍率（stack 规则）
     * @en Effect intensity multiplier per stack (for stack rule)
     */
    readonly stackMultiplier?: number;
}

// =============================================================================
// 效果接口 | Effect Interface
// =============================================================================

/**
 * @zh 效果定义
 * @en Effect definition
 */
export interface IEffectDefinition {
    /**
     * @zh 效果类型 ID
     * @en Effect type ID
     */
    readonly typeId: string;

    /**
     * @zh 显示名称
     * @en Display name
     */
    readonly displayName: string;

    /**
     * @zh 描述
     * @en Description
     */
    readonly description?: string;

    /**
     * @zh 图标
     * @en Icon
     */
    readonly icon?: string;

    /**
     * @zh 标签（用于分组、互斥、增强）
     * @en Tags (for grouping, exclusion, enhancement)
     */
    readonly tags: readonly string[];

    /**
     * @zh 持续时间配置
     * @en Duration configuration
     */
    readonly duration: IEffectDuration;

    /**
     * @zh 叠加配置
     * @en Stacking configuration
     */
    readonly stacking: IStackingConfig;

    /**
     * @zh 周期性触发间隔（秒），0 表示不周期触发
     * @en Periodic trigger interval in seconds, 0 means no periodic trigger
     */
    readonly tickInterval?: number;

    /**
     * @zh 互斥标签（拥有这些标签的效果会被移除）
     * @en Exclusive tags (effects with these tags will be removed)
     */
    readonly exclusiveTags?: readonly string[];

    /**
     * @zh 效果优先级（用于处理顺序）
     * @en Effect priority (for processing order)
     */
    readonly priority?: number;
}

/**
 * @zh 效果实例
 * @en Effect instance
 */
export interface IEffectInstance {
    /**
     * @zh 实例唯一 ID
     * @en Instance unique ID
     */
    readonly instanceId: string;

    /**
     * @zh 效果定义
     * @en Effect definition
     */
    readonly definition: IEffectDefinition;

    /**
     * @zh 效果来源（施加者 ID）
     * @en Effect source (applier ID)
     */
    readonly sourceId?: string;

    /**
     * @zh 当前叠加层数
     * @en Current stack count
     */
    stacks: number;

    /**
     * @zh 剩余时间（秒）
     * @en Remaining time in seconds
     */
    remainingTime: number;

    /**
     * @zh 下次触发时间（秒）
     * @en Next tick time in seconds
     */
    nextTickTime: number;

    /**
     * @zh 效果数据
     * @en Effect data
     */
    data: Record<string, unknown>;

    /**
     * @zh 效果是否激活
     * @en Whether the effect is active
     */
    isActive: boolean;

    /**
     * @zh 应用时间戳
     * @en Application timestamp
     */
    readonly appliedAt: number;
}

// =============================================================================
// 效果事件 | Effect Events
// =============================================================================

/**
 * @zh 效果事件类型
 * @en Effect event type
 */
export type EffectEventType = 'applied' | 'removed' | 'stacked' | 'refreshed' | 'ticked' | 'expired';

/**
 * @zh 效果事件
 * @en Effect event
 */
export interface IEffectEvent {
    /**
     * @zh 事件类型
     * @en Event type
     */
    readonly type: EffectEventType;

    /**
     * @zh 效果实例
     * @en Effect instance
     */
    readonly effect: IEffectInstance;

    /**
     * @zh 目标实体 ID
     * @en Target entity ID
     */
    readonly targetId: string;

    /**
     * @zh 事件时间戳
     * @en Event timestamp
     */
    readonly timestamp: number;

    /**
     * @zh 额外数据
     * @en Extra data
     */
    readonly data?: Record<string, unknown>;
}

/**
 * @zh 效果事件监听器
 * @en Effect event listener
 */
export type EffectEventListener = (event: IEffectEvent) => void;

// =============================================================================
// 效果处理器 | Effect Handler
// =============================================================================

/**
 * @zh 效果处理器接口
 * @en Effect handler interface
 */
export interface IEffectHandler<TTarget = unknown> {
    /**
     * @zh 效果应用时调用
     * @en Called when effect is applied
     */
    onApply?(effect: IEffectInstance, target: TTarget): void;

    /**
     * @zh 效果移除时调用
     * @en Called when effect is removed
     */
    onRemove?(effect: IEffectInstance, target: TTarget): void;

    /**
     * @zh 效果叠加时调用
     * @en Called when effect is stacked
     */
    onStack?(effect: IEffectInstance, target: TTarget, newStacks: number): void;

    /**
     * @zh 效果刷新时调用
     * @en Called when effect is refreshed
     */
    onRefresh?(effect: IEffectInstance, target: TTarget): void;

    /**
     * @zh 效果周期触发时调用
     * @en Called on periodic tick
     */
    onTick?(effect: IEffectInstance, target: TTarget, deltaTime: number): void;

    /**
     * @zh 效果更新时调用（每帧）
     * @en Called on update (every frame)
     */
    onUpdate?(effect: IEffectInstance, target: TTarget, deltaTime: number): void;
}
