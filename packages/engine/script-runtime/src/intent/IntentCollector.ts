/**
 * @zh 意图收集器
 * @en Intent Collector
 *
 * @zh 收集玩家蓝图执行过程中产生的所有意图
 * @en Collects all intents generated during player blueprint execution
 */

import type { IIntent, IntentKeyExtractor } from './IntentTypes';
import { defaultIntentKeyExtractor } from './IntentTypes';

/**
 * @zh 意图收集器接口
 * @en Intent collector interface
 */
export interface IIntentCollector<T extends IIntent = IIntent> {
    /**
     * @zh 添加一个意图
     * @en Add an intent
     */
    addIntent(intent: T): boolean;

    /**
     * @zh 获取所有收集的意图
     * @en Get all collected intents
     */
    getIntents(): T[];

    /**
     * @zh 按类型获取意图
     * @en Get intents by type
     */
    getIntentsByType(type: string): T[];

    /**
     * @zh 清除所有意图
     * @en Clear all intents
     */
    clear(): void;

    /**
     * @zh 获取意图数量
     * @en Get intent count
     */
    readonly count: number;
}

/**
 * @zh 意图收集器
 * @en Intent Collector
 *
 * @zh 在蓝图执行过程中收集玩家的操作意图，执行完成后由服务器统一处理
 * @en Collects player operation intents during blueprint execution, processed by server after execution
 *
 * @typeParam T - @zh 意图类型，必须继承 IIntent @en Intent type, must extend IIntent
 *
 * @example
 * ```typescript
 * // 游戏项目中定义意图类型 | Define intent types in game project
 * interface MyGameIntent extends IIntent {
 *     readonly type: 'unit.move' | 'unit.attack';
 *     unitId: string;
 * }
 *
 * // 创建收集器时提供键提取器 | Provide key extractor when creating collector
 * const collector = new IntentCollector<MyGameIntent>('player1', {
 *     keyExtractor: (intent) => `${intent.type}:${intent.unitId}`
 * });
 *
 * collector.addIntent({ type: 'unit.move', unitId: 'unit1' });
 * ```
 */
export class IntentCollector<T extends IIntent = IIntent> implements IIntentCollector<T> {
    /**
     * @zh 玩家 ID
     * @en Player ID
     */
    private readonly _playerId: string;

    /**
     * @zh 当前 tick
     * @en Current tick
     */
    private _currentTick: number = 0;

    /**
     * @zh 收集的意图列表
     * @en Collected intents list
     */
    private _intents: T[] = [];

    /**
     * @zh 按类型索引的意图
     * @en Intents indexed by type
     */
    private _intentsByType: Map<string, T[]> = new Map();

    /**
     * @zh 已添加的意图键（防止重复）
     * @en Added intent keys (prevent duplicates)
     */
    private _intentKeys: Set<string> = new Set();

    /**
     * @zh 意图键提取器
     * @en Intent key extractor
     */
    private readonly _keyExtractor: IntentKeyExtractor<T>;

    /**
     * @param playerId - @zh 玩家 ID @en Player ID
     * @param options - @zh 配置选项 @en Configuration options
     */
    constructor(
        playerId: string,
        options: {
            keyExtractor?: IntentKeyExtractor<T>;
        } = {}
    ) {
        this._playerId = playerId;
        this._keyExtractor = options.keyExtractor ?? (defaultIntentKeyExtractor as IntentKeyExtractor<T>);
    }

    /**
     * @zh 获取意图数量
     * @en Get intent count
     */
    get count(): number {
        return this._intents.length;
    }

    /**
     * @zh 获取玩家 ID
     * @en Get player ID
     */
    get playerId(): string {
        return this._playerId;
    }

    /**
     * @zh 设置当前 tick
     * @en Set current tick
     */
    setTick(tick: number): void {
        this._currentTick = tick;
    }

    /**
     * @zh 添加一个意图
     * @en Add an intent
     *
     * @param intent - @zh 要添加的意图 @en Intent to add
     * @returns @zh 是否添加成功（重复意图返回 false）@en Whether added successfully (duplicate returns false)
     */
    addIntent(intent: T): boolean {
        const key = this._keyExtractor(intent);

        if (this._intentKeys.has(key)) {
            return false;
        }

        // 添加元数据 | Add metadata
        const intentWithMeta: T = {
            ...intent,
            playerId: this._playerId,
            tick: this._currentTick
        };

        this._intents.push(intentWithMeta);
        this._intentKeys.add(key);

        // 按类型索引 | Index by type
        if (!this._intentsByType.has(intent.type)) {
            this._intentsByType.set(intent.type, []);
        }
        this._intentsByType.get(intent.type)!.push(intentWithMeta);

        return true;
    }

    /**
     * @zh 获取所有收集的意图
     * @en Get all collected intents
     */
    getIntents(): T[] {
        return [...this._intents];
    }

    /**
     * @zh 按类型获取意图
     * @en Get intents by type
     */
    getIntentsByType(type: string): T[] {
        return [...(this._intentsByType.get(type) ?? [])];
    }

    /**
     * @zh 检查是否已有指定键的意图
     * @en Check if intent with specified key exists
     */
    hasIntentKey(key: string): boolean {
        return this._intentKeys.has(key);
    }

    /**
     * @zh 清除所有意图
     * @en Clear all intents
     */
    clear(): void {
        this._intents = [];
        this._intentsByType.clear();
        this._intentKeys.clear();
    }
}
