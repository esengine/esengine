/**
 * @zh 触发器调度器
 * @en Trigger Dispatcher
 *
 * @zh 负责分发触发器事件到订阅者
 * @en Responsible for dispatching trigger events to subscribers
 */

import type { TriggerType, ITriggerContext } from './TriggerTypes';
import type { IBlueprintTrigger, ITriggerRegistry, TriggerCallback } from './BlueprintTrigger';
import { TriggerRegistry } from './BlueprintTrigger';

// =============================================================================
// 调度器接口 | Dispatcher Interface
// =============================================================================

/**
 * @zh 触发结果
 * @en Trigger result
 */
export interface TriggerResult {
    /**
     * @zh 触发器 ID
     * @en Trigger ID
     */
    triggerId: string;

    /**
     * @zh 是否成功
     * @en Is successful
     */
    success: boolean;

    /**
     * @zh 错误信息
     * @en Error message
     */
    error?: string;
}

/**
 * @zh 调度结果
 * @en Dispatch result
 */
export interface DispatchResult {
    /**
     * @zh 上下文
     * @en Context
     */
    context: ITriggerContext;

    /**
     * @zh 触发的触发器数量
     * @en Number of triggers fired
     */
    triggeredCount: number;

    /**
     * @zh 各触发器结果
     * @en Results of each trigger
     */
    results: TriggerResult[];
}

/**
 * @zh 触发器调度器接口
 * @en Trigger dispatcher interface
 */
export interface ITriggerDispatcher {
    /**
     * @zh 调度触发器
     * @en Dispatch trigger
     */
    dispatch(context: ITriggerContext): DispatchResult;

    /**
     * @zh 异步调度触发器
     * @en Async dispatch trigger
     */
    dispatchAsync(context: ITriggerContext): Promise<DispatchResult>;

    /**
     * @zh 订阅触发器类型
     * @en Subscribe to trigger type
     */
    subscribe(type: TriggerType, callback: TriggerCallback): () => void;

    /**
     * @zh 取消订阅
     * @en Unsubscribe
     */
    unsubscribe(type: TriggerType, callback: TriggerCallback): void;

    /**
     * @zh 获取注册表
     * @en Get registry
     */
    readonly registry: ITriggerRegistry;
}

// =============================================================================
// 调度器实现 | Dispatcher Implementation
// =============================================================================

/**
 * @zh 触发器调度器实现
 * @en Trigger dispatcher implementation
 */
export class TriggerDispatcher implements ITriggerDispatcher {
    private readonly _registry: ITriggerRegistry;
    private readonly _typeSubscribers: Map<TriggerType, Set<TriggerCallback>> = new Map();
    private readonly _globalSubscribers: Set<TriggerCallback> = new Set();
    private _isDispatching: boolean = false;
    private _pendingContexts: ITriggerContext[] = [];

    constructor(registry?: ITriggerRegistry) {
        this._registry = registry ?? new TriggerRegistry();
    }

    get registry(): ITriggerRegistry {
        return this._registry;
    }

    /**
     * @zh 调度触发器
     * @en Dispatch trigger
     */
    dispatch(context: ITriggerContext): DispatchResult {
        if (this._isDispatching) {
            this._pendingContexts.push(context);
            return {
                context,
                triggeredCount: 0,
                results: []
            };
        }

        this._isDispatching = true;

        try {
            const result = this._doDispatch(context);

            while (this._pendingContexts.length > 0) {
                const pendingContext = this._pendingContexts.shift()!;
                this._doDispatch(pendingContext);
            }

            return result;
        } finally {
            this._isDispatching = false;
        }
    }

    /**
     * @zh 执行调度
     * @en Do dispatch
     */
    private _doDispatch(context: ITriggerContext): DispatchResult {
        const results: TriggerResult[] = [];
        let triggeredCount = 0;

        const triggers = this._registry.getByType(context.type);

        for (const trigger of triggers) {
            if (trigger.shouldFire(context)) {
                try {
                    trigger.fire(context);
                    triggeredCount++;
                    results.push({
                        triggerId: trigger.id,
                        success: true
                    });
                } catch (error) {
                    results.push({
                        triggerId: trigger.id,
                        success: false,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
        }

        this._notifySubscribers(context);

        return {
            context,
            triggeredCount,
            results
        };
    }

    /**
     * @zh 通知订阅者
     * @en Notify subscribers
     */
    private _notifySubscribers(context: ITriggerContext): void {
        const typeSubscribers = this._typeSubscribers.get(context.type);
        if (typeSubscribers) {
            for (const callback of typeSubscribers) {
                try {
                    callback(context);
                } catch (error) {
                    console.error(`Trigger subscriber error: ${error}`);
                }
            }
        }

        for (const callback of this._globalSubscribers) {
            try {
                callback(context);
            } catch (error) {
                console.error(`Global trigger subscriber error: ${error}`);
            }
        }
    }

    /**
     * @zh 异步调度触发器
     * @en Async dispatch trigger
     */
    async dispatchAsync(context: ITriggerContext): Promise<DispatchResult> {
        return new Promise((resolve) => {
            queueMicrotask(() => {
                resolve(this.dispatch(context));
            });
        });
    }

    /**
     * @zh 订阅触发器类型
     * @en Subscribe to trigger type
     */
    subscribe(type: TriggerType, callback: TriggerCallback): () => void {
        if (!this._typeSubscribers.has(type)) {
            this._typeSubscribers.set(type, new Set());
        }

        this._typeSubscribers.get(type)!.add(callback);

        return () => this.unsubscribe(type, callback);
    }

    /**
     * @zh 取消订阅
     * @en Unsubscribe
     */
    unsubscribe(type: TriggerType, callback: TriggerCallback): void {
        const subscribers = this._typeSubscribers.get(type);
        if (subscribers) {
            subscribers.delete(callback);
        }
    }

    /**
     * @zh 订阅所有触发器
     * @en Subscribe to all triggers
     */
    subscribeAll(callback: TriggerCallback): () => void {
        this._globalSubscribers.add(callback);
        return () => this.unsubscribeAll(callback);
    }

    /**
     * @zh 取消订阅所有
     * @en Unsubscribe from all
     */
    unsubscribeAll(callback: TriggerCallback): void {
        this._globalSubscribers.delete(callback);
    }

    /**
     * @zh 清除所有订阅
     * @en Clear all subscriptions
     */
    clearSubscriptions(): void {
        this._typeSubscribers.clear();
        this._globalSubscribers.clear();
    }
}

// =============================================================================
// 实体触发器管理器 | Entity Trigger Manager
// =============================================================================

/**
 * @zh 实体触发器管理器接口
 * @en Entity trigger manager interface
 */
export interface IEntityTriggerManager {
    /**
     * @zh 为实体注册触发器
     * @en Register trigger for entity
     */
    registerForEntity(entityId: string, trigger: IBlueprintTrigger): void;

    /**
     * @zh 注销实体的触发器
     * @en Unregister trigger from entity
     */
    unregisterFromEntity(entityId: string, triggerId: string): boolean;

    /**
     * @zh 获取实体的所有触发器
     * @en Get all triggers for entity
     */
    getEntityTriggers(entityId: string): IBlueprintTrigger[];

    /**
     * @zh 清除实体的所有触发器
     * @en Clear all triggers for entity
     */
    clearEntityTriggers(entityId: string): void;

    /**
     * @zh 调度器
     * @en Dispatcher
     */
    readonly dispatcher: ITriggerDispatcher;
}

/**
 * @zh 实体触发器管理器实现
 * @en Entity trigger manager implementation
 */
export class EntityTriggerManager implements IEntityTriggerManager {
    private readonly _dispatcher: ITriggerDispatcher;
    private readonly _entityTriggers: Map<string, Set<string>> = new Map();

    constructor(dispatcher?: ITriggerDispatcher) {
        this._dispatcher = dispatcher ?? new TriggerDispatcher();
    }

    get dispatcher(): ITriggerDispatcher {
        return this._dispatcher;
    }

    /**
     * @zh 为实体注册触发器
     * @en Register trigger for entity
     */
    registerForEntity(entityId: string, trigger: IBlueprintTrigger): void {
        this._dispatcher.registry.register(trigger);

        if (!this._entityTriggers.has(entityId)) {
            this._entityTriggers.set(entityId, new Set());
        }

        this._entityTriggers.get(entityId)!.add(trigger.id);
    }

    /**
     * @zh 注销实体的触发器
     * @en Unregister trigger from entity
     */
    unregisterFromEntity(entityId: string, triggerId: string): boolean {
        const entitySet = this._entityTriggers.get(entityId);
        if (!entitySet) {
            return false;
        }

        if (!entitySet.has(triggerId)) {
            return false;
        }

        entitySet.delete(triggerId);
        return this._dispatcher.registry.unregister(triggerId);
    }

    /**
     * @zh 获取实体的所有触发器
     * @en Get all triggers for entity
     */
    getEntityTriggers(entityId: string): IBlueprintTrigger[] {
        const entitySet = this._entityTriggers.get(entityId);
        if (!entitySet) {
            return [];
        }

        const triggers: IBlueprintTrigger[] = [];
        for (const triggerId of entitySet) {
            const trigger = this._dispatcher.registry.get(triggerId);
            if (trigger) {
                triggers.push(trigger);
            }
        }

        return triggers;
    }

    /**
     * @zh 清除实体的所有触发器
     * @en Clear all triggers for entity
     */
    clearEntityTriggers(entityId: string): void {
        const entitySet = this._entityTriggers.get(entityId);
        if (!entitySet) {
            return;
        }

        for (const triggerId of entitySet) {
            this._dispatcher.registry.unregister(triggerId);
        }

        this._entityTriggers.delete(entityId);
    }

    /**
     * @zh 调度触发器到实体
     * @en Dispatch trigger to entity
     */
    dispatchToEntity(entityId: string, context: ITriggerContext): DispatchResult {
        const entityTriggers = this.getEntityTriggers(entityId);
        const results: TriggerResult[] = [];
        let triggeredCount = 0;

        for (const trigger of entityTriggers) {
            if (trigger.shouldFire(context)) {
                try {
                    trigger.fire(context);
                    triggeredCount++;
                    results.push({
                        triggerId: trigger.id,
                        success: true
                    });
                } catch (error) {
                    results.push({
                        triggerId: trigger.id,
                        success: false,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
        }

        return {
            context,
            triggeredCount,
            results
        };
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建触发器调度器
 * @en Create trigger dispatcher
 */
export function createTriggerDispatcher(registry?: ITriggerRegistry): TriggerDispatcher {
    return new TriggerDispatcher(registry);
}

/**
 * @zh 创建实体触发器管理器
 * @en Create entity trigger manager
 */
export function createEntityTriggerManager(dispatcher?: ITriggerDispatcher): EntityTriggerManager {
    return new EntityTriggerManager(dispatcher);
}
