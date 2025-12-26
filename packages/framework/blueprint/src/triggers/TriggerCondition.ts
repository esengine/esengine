/**
 * @zh 触发器条件系统
 * @en Trigger Condition System
 *
 * @zh 提供触发器触发前的条件检查能力
 * @en Provides condition checking before trigger fires
 */

import type {
    ITriggerContext,
    TriggerType,
    IInputTriggerContext,
    IMessageTriggerContext,
    IStateTriggerContext,
    ITimerTriggerContext,
    ICollisionTriggerContext,
    ICustomTriggerContext
} from './TriggerTypes';

// =============================================================================
// 条件接口 | Condition Interface
// =============================================================================

/**
 * @zh 触发器条件接口
 * @en Trigger condition interface
 */
export interface ITriggerCondition {
    /**
     * @zh 条件类型标识
     * @en Condition type identifier
     */
    readonly type: string;

    /**
     * @zh 评估条件是否满足
     * @en Evaluate if condition is met
     *
     * @param context - @zh 触发器上下文 @en Trigger context
     * @returns @zh 条件是否满足 @en Whether condition is met
     */
    evaluate(context: ITriggerContext): boolean;
}

/**
 * @zh 条件组合逻辑
 * @en Condition combination logic
 */
export type ConditionLogic = 'and' | 'or';

// =============================================================================
// 复合条件 | Composite Conditions
// =============================================================================

/**
 * @zh 复合条件 - 组合多个条件
 * @en Composite condition - combines multiple conditions
 */
export class CompositeCondition implements ITriggerCondition {
    readonly type = 'composite';

    constructor(
        private readonly _conditions: ITriggerCondition[],
        private readonly _logic: ConditionLogic = 'and'
    ) {}

    evaluate(context: ITriggerContext): boolean {
        if (this._conditions.length === 0) {
            return true;
        }

        if (this._logic === 'and') {
            return this._conditions.every(c => c.evaluate(context));
        } else {
            return this._conditions.some(c => c.evaluate(context));
        }
    }
}

/**
 * @zh 非条件 - 取反
 * @en Not condition - negates
 */
export class NotCondition implements ITriggerCondition {
    readonly type = 'not';

    constructor(private readonly _condition: ITriggerCondition) {}

    evaluate(context: ITriggerContext): boolean {
        return !this._condition.evaluate(context);
    }
}

// =============================================================================
// 通用条件 | Generic Conditions
// =============================================================================

/**
 * @zh 始终为真的条件
 * @en Always true condition
 */
export class AlwaysTrueCondition implements ITriggerCondition {
    readonly type = 'alwaysTrue';

    evaluate(_context: ITriggerContext): boolean {
        return true;
    }
}

/**
 * @zh 始终为假的条件
 * @en Always false condition
 */
export class AlwaysFalseCondition implements ITriggerCondition {
    readonly type = 'alwaysFalse';

    evaluate(_context: ITriggerContext): boolean {
        return false;
    }
}

/**
 * @zh 触发器类型条件
 * @en Trigger type condition
 */
export class TriggerTypeCondition implements ITriggerCondition {
    readonly type = 'triggerType';

    constructor(private readonly _allowedTypes: TriggerType[]) {}

    evaluate(context: ITriggerContext): boolean {
        return this._allowedTypes.includes(context.type);
    }
}

/**
 * @zh 实体 ID 条件
 * @en Entity ID condition
 */
export class EntityIdCondition implements ITriggerCondition {
    readonly type = 'entityId';

    constructor(
        private readonly _entityId: string,
        private readonly _checkSource: boolean = true
    ) {}

    evaluate(context: ITriggerContext): boolean {
        if (this._checkSource) {
            return context.sourceEntityId === this._entityId;
        }
        return false;
    }
}

/**
 * @zh 自定义函数条件
 * @en Custom function condition
 */
export class FunctionCondition implements ITriggerCondition {
    readonly type = 'function';

    constructor(
        private readonly _predicate: (context: ITriggerContext) => boolean
    ) {}

    evaluate(context: ITriggerContext): boolean {
        return this._predicate(context);
    }
}

// =============================================================================
// 特定类型条件 | Type-Specific Conditions
// =============================================================================

/**
 * @zh 输入动作条件
 * @en Input action condition
 */
export class InputActionCondition implements ITriggerCondition {
    readonly type = 'inputAction';

    constructor(
        private readonly _action: string,
        private readonly _checkPressed?: boolean,
        private readonly _checkReleased?: boolean
    ) {}

    evaluate(context: ITriggerContext): boolean {
        if (context.type !== 'input') {
            return false;
        }

        const inputContext = context as unknown as IInputTriggerContext;

        if (inputContext.action !== this._action) {
            return false;
        }

        if (this._checkPressed !== undefined && inputContext.pressed !== this._checkPressed) {
            return false;
        }

        if (this._checkReleased !== undefined && inputContext.released !== this._checkReleased) {
            return false;
        }

        return true;
    }
}

/**
 * @zh 消息名称条件
 * @en Message name condition
 */
export class MessageNameCondition implements ITriggerCondition {
    readonly type = 'messageName';

    constructor(private readonly _messageName: string) {}

    evaluate(context: ITriggerContext): boolean {
        if (context.type !== 'message') {
            return false;
        }

        const messageContext = context as unknown as IMessageTriggerContext;
        return messageContext.messageName === this._messageName;
    }
}

/**
 * @zh 状态名称条件
 * @en State name condition
 */
export class StateNameCondition implements ITriggerCondition {
    readonly type = 'stateName';

    constructor(
        private readonly _stateName: string,
        private readonly _checkCurrent: boolean = true
    ) {}

    evaluate(context: ITriggerContext): boolean {
        if (context.type !== 'stateEnter' && context.type !== 'stateExit') {
            return false;
        }

        const stateContext = context as unknown as IStateTriggerContext;

        if (this._checkCurrent) {
            return stateContext.currentState === this._stateName;
        } else {
            return stateContext.previousState === this._stateName;
        }
    }
}

/**
 * @zh 定时器 ID 条件
 * @en Timer ID condition
 */
export class TimerIdCondition implements ITriggerCondition {
    readonly type = 'timerId';

    constructor(private readonly _timerId: string) {}

    evaluate(context: ITriggerContext): boolean {
        if (context.type !== 'timer') {
            return false;
        }

        const timerContext = context as unknown as ITimerTriggerContext;
        return timerContext.timerId === this._timerId;
    }
}

/**
 * @zh 碰撞实体条件
 * @en Collision entity condition
 */
export class CollisionEntityCondition implements ITriggerCondition {
    readonly type = 'collisionEntity';

    constructor(
        private readonly _otherEntityId?: string,
        private readonly _checkEnter?: boolean,
        private readonly _checkExit?: boolean
    ) {}

    evaluate(context: ITriggerContext): boolean {
        if (context.type !== 'collision') {
            return false;
        }

        const collisionContext = context as unknown as ICollisionTriggerContext;

        if (this._otherEntityId !== undefined && collisionContext.otherEntityId !== this._otherEntityId) {
            return false;
        }

        if (this._checkEnter !== undefined && collisionContext.isEnter !== this._checkEnter) {
            return false;
        }

        if (this._checkExit !== undefined && collisionContext.isExit !== this._checkExit) {
            return false;
        }

        return true;
    }
}

/**
 * @zh 自定义事件名称条件
 * @en Custom event name condition
 */
export class CustomEventCondition implements ITriggerCondition {
    readonly type = 'customEvent';

    constructor(private readonly _eventName: string) {}

    evaluate(context: ITriggerContext): boolean {
        if (context.type !== 'custom') {
            return false;
        }

        const customContext = context as unknown as ICustomTriggerContext;
        return customContext.eventName === this._eventName;
    }
}

// =============================================================================
// 条件构建器 | Condition Builder
// =============================================================================

/**
 * @zh 条件构建器 - 链式 API
 * @en Condition builder - fluent API
 */
export class ConditionBuilder {
    private _conditions: ITriggerCondition[] = [];
    private _logic: ConditionLogic = 'and';

    /**
     * @zh 设置组合逻辑为 AND
     * @en Set combination logic to AND
     */
    and(): this {
        this._logic = 'and';
        return this;
    }

    /**
     * @zh 设置组合逻辑为 OR
     * @en Set combination logic to OR
     */
    or(): this {
        this._logic = 'or';
        return this;
    }

    /**
     * @zh 添加触发器类型条件
     * @en Add trigger type condition
     */
    ofType(...types: TriggerType[]): this {
        this._conditions.push(new TriggerTypeCondition(types));
        return this;
    }

    /**
     * @zh 添加实体 ID 条件
     * @en Add entity ID condition
     */
    fromEntity(entityId: string): this {
        this._conditions.push(new EntityIdCondition(entityId));
        return this;
    }

    /**
     * @zh 添加输入动作条件
     * @en Add input action condition
     */
    onInput(action: string, options?: { pressed?: boolean; released?: boolean }): this {
        this._conditions.push(new InputActionCondition(action, options?.pressed, options?.released));
        return this;
    }

    /**
     * @zh 添加消息条件
     * @en Add message condition
     */
    onMessage(messageName: string): this {
        this._conditions.push(new MessageNameCondition(messageName));
        return this;
    }

    /**
     * @zh 添加状态条件
     * @en Add state condition
     */
    onState(stateName: string, checkCurrent: boolean = true): this {
        this._conditions.push(new StateNameCondition(stateName, checkCurrent));
        return this;
    }

    /**
     * @zh 添加定时器条件
     * @en Add timer condition
     */
    onTimer(timerId: string): this {
        this._conditions.push(new TimerIdCondition(timerId));
        return this;
    }

    /**
     * @zh 添加碰撞条件
     * @en Add collision condition
     */
    onCollision(options?: { entityId?: string; isEnter?: boolean; isExit?: boolean }): this {
        this._conditions.push(new CollisionEntityCondition(
            options?.entityId,
            options?.isEnter,
            options?.isExit
        ));
        return this;
    }

    /**
     * @zh 添加自定义事件条件
     * @en Add custom event condition
     */
    onCustomEvent(eventName: string): this {
        this._conditions.push(new CustomEventCondition(eventName));
        return this;
    }

    /**
     * @zh 添加自定义函数条件
     * @en Add custom function condition
     */
    where(predicate: (context: ITriggerContext) => boolean): this {
        this._conditions.push(new FunctionCondition(predicate));
        return this;
    }

    /**
     * @zh 添加取反条件
     * @en Add negated condition
     */
    not(condition: ITriggerCondition): this {
        this._conditions.push(new NotCondition(condition));
        return this;
    }

    /**
     * @zh 构建条件
     * @en Build condition
     */
    build(): ITriggerCondition {
        if (this._conditions.length === 0) {
            return new AlwaysTrueCondition();
        }

        if (this._conditions.length === 1) {
            return this._conditions[0];
        }

        return new CompositeCondition(this._conditions, this._logic);
    }
}

/**
 * @zh 创建条件构建器
 * @en Create condition builder
 */
export function condition(): ConditionBuilder {
    return new ConditionBuilder();
}
