/**
 * @zh 意图处理器接口
 * @en Intent Processor Interface
 *
 * @zh 定义意图处理的抽象接口，由游戏项目实现
 * @en Defines abstract interface for intent processing, implemented by game projects
 */

import type { IIntent } from '../intent/IntentTypes';
import type { IGameState } from '../vm/ServerExecutionContext';
import type { IntentProcessingResult } from './types';

/**
 * @zh 意图处理器接口
 * @en Intent processor interface
 *
 * @zh 游戏项目实现此接口以处理玩家蓝图产生的意图
 * @en Game projects implement this interface to process intents from player blueprints
 *
 * @typeParam TGameState - @zh 游戏状态类型 @en Game state type
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 *
 * @example
 * ```typescript
 * // 游戏项目中实现 | Implement in game project
 * class MyIntentProcessor implements IIntentProcessor<MyGameState, MyIntent> {
 *     process(gameState: MyGameState, intents: MyIntent[]): IntentProcessingResult<MyGameState> {
 *         let newState = gameState;
 *         let processedCount = 0;
 *         let rejectedCount = 0;
 *         const errors: string[] = [];
 *
 *         for (const intent of intents) {
 *             const result = this.processIntent(newState, intent);
 *             if (result.success) {
 *                 newState = result.state;
 *                 processedCount++;
 *             } else {
 *                 rejectedCount++;
 *                 errors.push(result.error);
 *             }
 *         }
 *
 *         return { gameState: newState, processedCount, rejectedCount, errors };
 *     }
 * }
 * ```
 */
export interface IIntentProcessor<
    TGameState extends IGameState = IGameState,
    TIntent extends IIntent = IIntent
> {
    /**
     * @zh 处理一批意图
     * @en Process a batch of intents
     *
     * @param gameState - @zh 当前游戏状态 @en Current game state
     * @param intents - @zh 要处理的意图列表 @en Intents to process
     * @returns @zh 处理结果 @en Processing result
     */
    process(gameState: TGameState, intents: readonly TIntent[]): IntentProcessingResult<TGameState>;
}

/**
 * @zh 单个意图处理结果
 * @en Single intent processing result
 *
 * @typeParam TGameState - @zh 游戏状态类型 @en Game state type
 */
export type SingleIntentResult<TGameState extends IGameState = IGameState> =
    | { readonly success: true; readonly state: TGameState }
    | { readonly success: false; readonly error: string };

/**
 * @zh 意图处理器基类
 * @en Intent processor base class
 *
 * @zh 提供常用的意图处理模式
 * @en Provides common intent processing patterns
 *
 * @typeParam TGameState - @zh 游戏状态类型 @en Game state type
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 *
 * @example
 * ```typescript
 * class MyProcessor extends IntentProcessorBase<MyGameState, MyIntent> {
 *     protected processIntent(state: MyGameState, intent: MyIntent): SingleIntentResult<MyGameState> {
 *         switch (intent.type) {
 *             case 'unit.move':
 *                 return this.processUnitMove(state, intent);
 *             case 'unit.attack':
 *                 return this.processUnitAttack(state, intent);
 *             default:
 *                 return { success: false, error: `Unknown intent type: ${intent.type}` };
 *         }
 *     }
 * }
 * ```
 */
export abstract class IntentProcessorBase<
    TGameState extends IGameState = IGameState,
    TIntent extends IIntent = IIntent
> implements IIntentProcessor<TGameState, TIntent> {
    /**
     * @zh 处理一批意图
     * @en Process a batch of intents
     */
    process(gameState: TGameState, intents: readonly TIntent[]): IntentProcessingResult<TGameState> {
        let currentState = gameState;
        let processedCount = 0;
        let rejectedCount = 0;
        const errors: string[] = [];

        const sortedIntents = this.sortIntents(intents);

        for (const intent of sortedIntents) {
            if (!this.validateIntent(currentState, intent)) {
                rejectedCount++;
                errors.push(`Intent validation failed: ${intent.type}`);
                continue;
            }

            const result = this.processIntent(currentState, intent);

            if (result.success) {
                currentState = result.state;
                processedCount++;
            } else {
                rejectedCount++;
                errors.push(result.error);
            }
        }

        return {
            gameState: currentState,
            processedCount,
            rejectedCount,
            errors
        };
    }

    /**
     * @zh 处理单个意图
     * @en Process a single intent
     *
     * @zh 子类必须实现此方法
     * @en Subclasses must implement this method
     */
    protected abstract processIntent(
        state: TGameState,
        intent: TIntent
    ): SingleIntentResult<TGameState>;

    /**
     * @zh 验证意图是否有效
     * @en Validate whether intent is valid
     *
     * @zh 子类可以覆盖此方法添加验证逻辑
     * @en Subclasses can override this method to add validation logic
     */
    protected validateIntent(_state: TGameState, _intent: TIntent): boolean {
        return true;
    }

    /**
     * @zh 对意图进行排序
     * @en Sort intents
     *
     * @zh 子类可以覆盖此方法定义处理顺序
     * @en Subclasses can override this method to define processing order
     */
    protected sortIntents(intents: readonly TIntent[]): readonly TIntent[] {
        return intents;
    }
}

/**
 * @zh 意图处理器注册表
 * @en Intent processor registry
 *
 * @zh 按意图类型注册处理器
 * @en Register processors by intent type
 *
 * @typeParam TGameState - @zh 游戏状态类型 @en Game state type
 * @typeParam TIntent - @zh 意图类型 @en Intent type
 */
export class IntentProcessorRegistry<
    TGameState extends IGameState = IGameState,
    TIntent extends IIntent = IIntent
> implements IIntentProcessor<TGameState, TIntent> {
    private readonly _handlers = new Map<
        string,
        (state: TGameState, intent: TIntent) => SingleIntentResult<TGameState>
    >();

    /**
     * @zh 注册意图处理器
     * @en Register intent handler
     *
     * @param intentType - @zh 意图类型 @en Intent type
     * @param handler - @zh 处理函数 @en Handler function
     */
    register(
        intentType: string,
        handler: (state: TGameState, intent: TIntent) => SingleIntentResult<TGameState>
    ): this {
        this._handlers.set(intentType, handler);
        return this;
    }

    /**
     * @zh 处理一批意图
     * @en Process a batch of intents
     */
    process(gameState: TGameState, intents: readonly TIntent[]): IntentProcessingResult<TGameState> {
        let currentState = gameState;
        let processedCount = 0;
        let rejectedCount = 0;
        const errors: string[] = [];

        for (const intent of intents) {
            const handler = this._handlers.get(intent.type);

            if (!handler) {
                rejectedCount++;
                errors.push(`No handler for intent type: ${intent.type}`);
                continue;
            }

            const result = handler(currentState, intent);

            if (result.success) {
                currentState = result.state;
                processedCount++;
            } else {
                rejectedCount++;
                errors.push(result.error);
            }
        }

        return {
            gameState: currentState,
            processedCount,
            rejectedCount,
            errors
        };
    }
}
