/**
 * @zh Room 事务扩展
 * @en Room transaction extension
 */

import type {
    ITransactionStorage,
    ITransactionContext,
    TransactionOptions,
    TransactionResult
} from '../core/types.js';
import { TransactionManager } from '../core/TransactionManager.js';

/**
 * @zh 事务 Room 配置
 * @en Transaction Room configuration
 */
export interface TransactionRoomConfig {
    /**
     * @zh 存储实例
     * @en Storage instance
     */
    storage?: ITransactionStorage

    /**
     * @zh 默认超时时间（毫秒）
     * @en Default timeout in milliseconds
     */
    defaultTimeout?: number

    /**
     * @zh 服务器 ID
     * @en Server ID
     */
    serverId?: string
}

/**
 * @zh 事务 Room 接口
 * @en Transaction Room interface
 */
export interface ITransactionRoom {
    /**
     * @zh 事务管理器
     * @en Transaction manager
     */
    readonly transactions: TransactionManager

    /**
     * @zh 开始事务
     * @en Begin transaction
     */
    beginTransaction(options?: TransactionOptions): ITransactionContext

    /**
     * @zh 执行事务
     * @en Run transaction
     */
    runTransaction<T = unknown>(
        builder: (ctx: ITransactionContext) => void | Promise<void>,
        options?: TransactionOptions
    ): Promise<TransactionResult<T>>
}

/**
 * @zh 创建事务 Room mixin
 * @en Create transaction Room mixin
 *
 * @example
 * ```typescript
 * import { Room } from '@esengine/server'
 * import { withTransactions, RedisStorage } from '@esengine/transaction'
 *
 * class GameRoom extends withTransactions(Room, {
 *     storage: new RedisStorage({ client: redisClient }),
 * }) {
 *     async handleBuy(itemId: string, player: Player) {
 *         const result = await this.runTransaction((tx) => {
 *             tx.addOperation(new CurrencyOperation({
 *                 type: 'deduct',
 *                 playerId: player.id,
 *                 currency: 'gold',
 *                 amount: 100,
 *             }))
 *         })
 *
 *         if (result.success) {
 *             player.send('buy_success', { itemId })
 *         }
 *     }
 * }
 * ```
 */
export function withTransactions<TBase extends new (...args: any[]) => any>(
    Base: TBase,
    config: TransactionRoomConfig = {}
): TBase & (new (...args: any[]) => ITransactionRoom) {
    return class TransactionRoom extends Base implements ITransactionRoom {
        private _transactionManager: TransactionManager;

        constructor(...args: any[]) {
            super(...args);
            this._transactionManager = new TransactionManager({
                storage: config.storage,
                defaultTimeout: config.defaultTimeout,
                serverId: config.serverId
            });
        }

        get transactions(): TransactionManager {
            return this._transactionManager;
        }

        beginTransaction(options?: TransactionOptions): ITransactionContext {
            return this._transactionManager.begin(options);
        }

        runTransaction<T = unknown>(
            builder: (ctx: ITransactionContext) => void | Promise<void>,
            options?: TransactionOptions
        ): Promise<TransactionResult<T>> {
            return this._transactionManager.run<T>(builder, options);
        }
    };
}

/**
 * @zh 事务 Room 抽象基类
 * @en Transaction Room abstract base class
 *
 * @zh 可以直接继承使用，也可以使用 withTransactions mixin
 * @en Can be extended directly or use withTransactions mixin
 *
 * @example
 * ```typescript
 * class GameRoom extends TransactionRoom {
 *     constructor() {
 *         super({ storage: new RedisStorage({ client: redisClient }) })
 *     }
 *
 *     async handleTrade(data: TradeData, player: Player) {
 *         const result = await this.runTransaction((tx) => {
 *             // 添加交易操作
 *         })
 *     }
 * }
 * ```
 */
export abstract class TransactionRoom implements ITransactionRoom {
    private _transactionManager: TransactionManager;

    constructor(config: TransactionRoomConfig = {}) {
        this._transactionManager = new TransactionManager({
            storage: config.storage,
            defaultTimeout: config.defaultTimeout,
            serverId: config.serverId
        });
    }

    get transactions(): TransactionManager {
        return this._transactionManager;
    }

    beginTransaction(options?: TransactionOptions): ITransactionContext {
        return this._transactionManager.begin(options);
    }

    runTransaction<T = unknown>(
        builder: (ctx: ITransactionContext) => void | Promise<void>,
        options?: TransactionOptions
    ): Promise<TransactionResult<T>> {
        return this._transactionManager.run<T>(builder, options);
    }
}
