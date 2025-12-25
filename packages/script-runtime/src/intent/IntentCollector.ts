/**
 * @zh 意图收集器
 * @en Intent Collector
 *
 * @zh 收集玩家蓝图执行过程中产生的所有意图
 * @en Collects all intents generated during player blueprint execution
 */

import type { IIntent, Intent, IntentType } from './IntentTypes';

/**
 * @zh 意图收集器接口
 * @en Intent collector interface
 */
export interface IIntentCollector {
    /**
     * @zh 添加一个意图
     * @en Add an intent
     */
    addIntent(intent: Intent): void;

    /**
     * @zh 获取所有收集的意图
     * @en Get all collected intents
     */
    getIntents(): Intent[];

    /**
     * @zh 按类型获取意图
     * @en Get intents by type
     */
    getIntentsByType<T extends Intent>(type: T['type']): T[];

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
 * @zh 在蓝图执行过程中收集玩家的操作意图，
 * @en Collects player operation intents during blueprint execution,
 *
 * @zh 执行完成后由服务器统一处理
 * @en processed by server after execution completes
 *
 * @example
 * ```typescript
 * const collector = new IntentCollector('player1');
 *
 * // 在节点执行中添加意图 | Add intent in node execution
 * collector.addIntent({
 *     type: 'creep.move',
 *     creepId: 'creep1',
 *     direction: 1
 * });
 *
 * // 获取所有意图 | Get all intents
 * const intents = collector.getIntents();
 * ```
 */
export class IntentCollector implements IIntentCollector {
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
    private _intents: Intent[] = [];

    /**
     * @zh 按类型索引的意图
     * @en Intents indexed by type
     */
    private _intentsByType: Map<IntentType, Intent[]> = new Map();

    /**
     * @zh 每个对象每个动作只能有一个意图（防止重复）
     * @en Each object can only have one intent per action (prevent duplicates)
     */
    private _intentKeys: Set<string> = new Set();

    constructor(playerId: string) {
        this._playerId = playerId;
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
    addIntent(intent: Intent): boolean {
        // 生成唯一键以防止重复 | Generate unique key to prevent duplicates
        const key = this._getIntentKey(intent);

        if (this._intentKeys.has(key)) {
            // 同一对象同一动作已有意图，忽略后续的 | Same object same action already has intent, ignore subsequent
            return false;
        }

        // 添加元数据 | Add metadata
        const intentWithMeta: Intent = {
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
    getIntents(): Intent[] {
        return [...this._intents];
    }

    /**
     * @zh 按类型获取意图
     * @en Get intents by type
     */
    getIntentsByType<T extends Intent>(type: T['type']): T[] {
        return (this._intentsByType.get(type) as T[]) ?? [];
    }

    /**
     * @zh 检查对象是否已有指定类型的意图
     * @en Check if object already has intent of specified type
     */
    hasIntent(objectId: string, intentType: IntentType): boolean {
        const key = `${intentType}:${objectId}`;
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

    /**
     * @zh 生成意图的唯一键
     * @en Generate unique key for intent
     */
    private _getIntentKey(intent: Intent): string {
        // 根据意图类型提取对象 ID | Extract object ID based on intent type
        switch (intent.type) {
            case 'unit.move':
            case 'unit.harvest':
            case 'unit.build':
            case 'unit.repair':
            case 'unit.attack':
            case 'unit.transfer':
            case 'unit.pickup':
                return `${intent.type}:${intent.unitId}`;

            case 'spawner.spawnUnit':
            case 'spawner.cancel':
                return `${intent.type}:${intent.spawnerId}`;

            case 'tower.attack':
            case 'tower.repair':
            case 'tower.heal':
                return `${intent.type}:${intent.towerId}`;

            default: {
                // 处理未知类型 | Handle unknown types
                const unknownIntent = intent as IIntent;
                return `${unknownIntent.type}:unknown`;
            }
        }
    }
}
