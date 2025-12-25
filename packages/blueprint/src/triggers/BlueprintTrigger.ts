/**
 * @zh 蓝图触发器
 * @en Blueprint Trigger
 *
 * @zh 定义触发器的核心实现
 * @en Defines core trigger implementation
 */

import type { TriggerType, ITriggerContext } from './TriggerTypes';
import type { ITriggerCondition } from './TriggerCondition';
import { AlwaysTrueCondition } from './TriggerCondition';

// =============================================================================
// 触发器接口 | Trigger Interface
// =============================================================================

/**
 * @zh 触发器回调函数类型
 * @en Trigger callback function type
 */
export type TriggerCallback = (context: ITriggerContext) => void;

/**
 * @zh 蓝图触发器接口
 * @en Blueprint trigger interface
 */
export interface IBlueprintTrigger {
    /**
     * @zh 触发器唯一标识
     * @en Trigger unique identifier
     */
    readonly id: string;

    /**
     * @zh 触发器类型
     * @en Trigger type
     */
    readonly type: TriggerType;

    /**
     * @zh 触发器条件
     * @en Trigger conditions
     */
    readonly condition: ITriggerCondition;

    /**
     * @zh 是否启用
     * @en Is enabled
     */
    enabled: boolean;

    /**
     * @zh 优先级（越高越先执行）
     * @en Priority (higher executes first)
     */
    readonly priority: number;

    /**
     * @zh 检查是否应该触发
     * @en Check if should fire
     */
    shouldFire(context: ITriggerContext): boolean;

    /**
     * @zh 执行触发器
     * @en Execute trigger
     */
    fire(context: ITriggerContext): void;
}

/**
 * @zh 触发器配置
 * @en Trigger configuration
 */
export interface TriggerConfig {
    /**
     * @zh 触发器 ID
     * @en Trigger ID
     */
    id?: string;

    /**
     * @zh 触发器类型
     * @en Trigger type
     */
    type: TriggerType;

    /**
     * @zh 触发条件
     * @en Trigger condition
     */
    condition?: ITriggerCondition;

    /**
     * @zh 是否启用
     * @en Is enabled
     */
    enabled?: boolean;

    /**
     * @zh 优先级
     * @en Priority
     */
    priority?: number;

    /**
     * @zh 回调函数
     * @en Callback function
     */
    callback?: TriggerCallback;
}

// =============================================================================
// 触发器实现 | Trigger Implementation
// =============================================================================

let _triggerId = 0;

/**
 * @zh 生成唯一触发器 ID
 * @en Generate unique trigger ID
 */
function generateTriggerId(): string {
    return `trigger_${++_triggerId}`;
}

/**
 * @zh 蓝图触发器实现
 * @en Blueprint trigger implementation
 */
export class BlueprintTrigger implements IBlueprintTrigger {
    readonly id: string;
    readonly type: TriggerType;
    readonly condition: ITriggerCondition;
    readonly priority: number;
    enabled: boolean;

    private readonly _callback?: TriggerCallback;
    private readonly _callbacks: Set<TriggerCallback> = new Set();

    constructor(config: TriggerConfig) {
        this.id = config.id ?? generateTriggerId();
        this.type = config.type;
        this.condition = config.condition ?? new AlwaysTrueCondition();
        this.priority = config.priority ?? 0;
        this.enabled = config.enabled ?? true;
        this._callback = config.callback;
    }

    /**
     * @zh 检查是否应该触发
     * @en Check if should fire
     */
    shouldFire(context: ITriggerContext): boolean {
        if (!this.enabled) {
            return false;
        }

        if (context.type !== this.type && this.type !== 'custom') {
            return false;
        }

        return this.condition.evaluate(context);
    }

    /**
     * @zh 执行触发器
     * @en Execute trigger
     */
    fire(context: ITriggerContext): void {
        if (this._callback) {
            this._callback(context);
        }

        for (const callback of this._callbacks) {
            callback(context);
        }
    }

    /**
     * @zh 添加回调
     * @en Add callback
     */
    addCallback(callback: TriggerCallback): void {
        this._callbacks.add(callback);
    }

    /**
     * @zh 移除回调
     * @en Remove callback
     */
    removeCallback(callback: TriggerCallback): void {
        this._callbacks.delete(callback);
    }

    /**
     * @zh 清除所有回调
     * @en Clear all callbacks
     */
    clearCallbacks(): void {
        this._callbacks.clear();
    }
}

// =============================================================================
// 触发器注册表 | Trigger Registry
// =============================================================================

/**
 * @zh 触发器注册表接口
 * @en Trigger registry interface
 */
export interface ITriggerRegistry {
    /**
     * @zh 注册触发器
     * @en Register trigger
     */
    register(trigger: IBlueprintTrigger): void;

    /**
     * @zh 注销触发器
     * @en Unregister trigger
     */
    unregister(triggerId: string): boolean;

    /**
     * @zh 获取触发器
     * @en Get trigger
     */
    get(triggerId: string): IBlueprintTrigger | undefined;

    /**
     * @zh 获取所有触发器
     * @en Get all triggers
     */
    getAll(): IBlueprintTrigger[];

    /**
     * @zh 按类型获取触发器
     * @en Get triggers by type
     */
    getByType(type: TriggerType): IBlueprintTrigger[];

    /**
     * @zh 清除所有触发器
     * @en Clear all triggers
     */
    clear(): void;
}

/**
 * @zh 触发器注册表实现
 * @en Trigger registry implementation
 */
export class TriggerRegistry implements ITriggerRegistry {
    private readonly _triggers: Map<string, IBlueprintTrigger> = new Map();
    private readonly _triggersByType: Map<TriggerType, Set<string>> = new Map();

    /**
     * @zh 注册触发器
     * @en Register trigger
     */
    register(trigger: IBlueprintTrigger): void {
        if (this._triggers.has(trigger.id)) {
            console.warn(`Trigger ${trigger.id} already registered, overwriting`);
        }

        this._triggers.set(trigger.id, trigger);

        if (!this._triggersByType.has(trigger.type)) {
            this._triggersByType.set(trigger.type, new Set());
        }
        this._triggersByType.get(trigger.type)!.add(trigger.id);
    }

    /**
     * @zh 注销触发器
     * @en Unregister trigger
     */
    unregister(triggerId: string): boolean {
        const trigger = this._triggers.get(triggerId);
        if (!trigger) {
            return false;
        }

        this._triggers.delete(triggerId);

        const typeSet = this._triggersByType.get(trigger.type);
        if (typeSet) {
            typeSet.delete(triggerId);
        }

        return true;
    }

    /**
     * @zh 获取触发器
     * @en Get trigger
     */
    get(triggerId: string): IBlueprintTrigger | undefined {
        return this._triggers.get(triggerId);
    }

    /**
     * @zh 获取所有触发器
     * @en Get all triggers
     */
    getAll(): IBlueprintTrigger[] {
        return Array.from(this._triggers.values());
    }

    /**
     * @zh 按类型获取触发器
     * @en Get triggers by type
     */
    getByType(type: TriggerType): IBlueprintTrigger[] {
        const typeSet = this._triggersByType.get(type);
        if (!typeSet) {
            return [];
        }

        const triggers: IBlueprintTrigger[] = [];
        for (const id of typeSet) {
            const trigger = this._triggers.get(id);
            if (trigger) {
                triggers.push(trigger);
            }
        }

        return triggers.sort((a, b) => b.priority - a.priority);
    }

    /**
     * @zh 清除所有触发器
     * @en Clear all triggers
     */
    clear(): void {
        this._triggers.clear();
        this._triggersByType.clear();
    }

    /**
     * @zh 获取触发器数量
     * @en Get trigger count
     */
    get count(): number {
        return this._triggers.size;
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建触发器
 * @en Create trigger
 */
export function createTrigger(config: TriggerConfig): BlueprintTrigger {
    return new BlueprintTrigger(config);
}

/**
 * @zh 创建 Tick 触发器
 * @en Create tick trigger
 */
export function createTickTrigger(
    callback?: TriggerCallback,
    options?: { id?: string; condition?: ITriggerCondition; priority?: number }
): BlueprintTrigger {
    return new BlueprintTrigger({
        id: options?.id,
        type: 'tick',
        condition: options?.condition,
        priority: options?.priority,
        callback
    });
}

/**
 * @zh 创建输入触发器
 * @en Create input trigger
 */
export function createInputTrigger(
    callback?: TriggerCallback,
    options?: { id?: string; condition?: ITriggerCondition; priority?: number }
): BlueprintTrigger {
    return new BlueprintTrigger({
        id: options?.id,
        type: 'input',
        condition: options?.condition,
        priority: options?.priority,
        callback
    });
}

/**
 * @zh 创建碰撞触发器
 * @en Create collision trigger
 */
export function createCollisionTrigger(
    callback?: TriggerCallback,
    options?: { id?: string; condition?: ITriggerCondition; priority?: number }
): BlueprintTrigger {
    return new BlueprintTrigger({
        id: options?.id,
        type: 'collision',
        condition: options?.condition,
        priority: options?.priority,
        callback
    });
}

/**
 * @zh 创建消息触发器
 * @en Create message trigger
 */
export function createMessageTrigger(
    callback?: TriggerCallback,
    options?: { id?: string; condition?: ITriggerCondition; priority?: number }
): BlueprintTrigger {
    return new BlueprintTrigger({
        id: options?.id,
        type: 'message',
        condition: options?.condition,
        priority: options?.priority,
        callback
    });
}

/**
 * @zh 创建定时器触发器
 * @en Create timer trigger
 */
export function createTimerTrigger(
    callback?: TriggerCallback,
    options?: { id?: string; condition?: ITriggerCondition; priority?: number }
): BlueprintTrigger {
    return new BlueprintTrigger({
        id: options?.id,
        type: 'timer',
        condition: options?.condition,
        priority: options?.priority,
        callback
    });
}

/**
 * @zh 创建状态进入触发器
 * @en Create state enter trigger
 */
export function createStateEnterTrigger(
    callback?: TriggerCallback,
    options?: { id?: string; condition?: ITriggerCondition; priority?: number }
): BlueprintTrigger {
    return new BlueprintTrigger({
        id: options?.id,
        type: 'stateEnter',
        condition: options?.condition,
        priority: options?.priority,
        callback
    });
}

/**
 * @zh 创建状态退出触发器
 * @en Create state exit trigger
 */
export function createStateExitTrigger(
    callback?: TriggerCallback,
    options?: { id?: string; condition?: ITriggerCondition; priority?: number }
): BlueprintTrigger {
    return new BlueprintTrigger({
        id: options?.id,
        type: 'stateExit',
        condition: options?.condition,
        priority: options?.priority,
        callback
    });
}

/**
 * @zh 创建自定义触发器
 * @en Create custom trigger
 */
export function createCustomTrigger(
    callback?: TriggerCallback,
    options?: { id?: string; condition?: ITriggerCondition; priority?: number }
): BlueprintTrigger {
    return new BlueprintTrigger({
        id: options?.id,
        type: 'custom',
        condition: options?.condition,
        priority: options?.priority,
        callback
    });
}
