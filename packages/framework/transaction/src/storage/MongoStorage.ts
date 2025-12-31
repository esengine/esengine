/**
 * @zh MongoDB 存储实现
 * @en MongoDB storage implementation
 *
 * @zh 基于共享连接的事务存储，使用 @esengine/database-drivers 提供的连接
 * @en Transaction storage based on shared connection from @esengine/database-drivers
 */

import type { IMongoConnection, IMongoCollection } from '@esengine/database-drivers';
import type {
    ITransactionStorage,
    TransactionLog,
    TransactionState,
    OperationLog
} from '../core/types.js';

// =============================================================================
// 配置类型 | Configuration Types
// =============================================================================

/**
 * @zh MongoDB 存储配置
 * @en MongoDB storage configuration
 */
export interface MongoStorageConfig {
    /**
     * @zh MongoDB 连接（来自 @esengine/database-drivers）
     * @en MongoDB connection (from @esengine/database-drivers)
     */
    connection: IMongoConnection

    /**
     * @zh 事务日志集合名称
     * @en Transaction log collection name
     */
    transactionCollection?: string

    /**
     * @zh 数据集合名称
     * @en Data collection name
     */
    dataCollection?: string

    /**
     * @zh 锁集合名称
     * @en Lock collection name
     */
    lockCollection?: string
}

// =============================================================================
// 内部类型 | Internal Types
// =============================================================================

interface LockDocument {
    _id: string
    token: string
    expireAt: Date
}

interface DataDocument {
    _id: string
    value: unknown
    expireAt?: Date
}

// =============================================================================
// 实现 | Implementation
// =============================================================================

/**
 * @zh MongoDB 存储
 * @en MongoDB storage
 *
 * @zh 基于 MongoDB 的事务存储，使用 @esengine/database-drivers 的共享连接
 * @en MongoDB-based transaction storage using shared connection from @esengine/database-drivers
 *
 * @example
 * ```typescript
 * import { createMongoConnection } from '@esengine/database-drivers'
 * import { MongoStorage } from '@esengine/transaction'
 *
 * const mongo = createMongoConnection({
 *     uri: 'mongodb://localhost:27017',
 *     database: 'game'
 * })
 * await mongo.connect()
 *
 * const storage = new MongoStorage({ connection: mongo })
 * ```
 */
export class MongoStorage implements ITransactionStorage {
    private readonly _connection: IMongoConnection;
    private readonly _transactionCollection: string;
    private readonly _dataCollection: string;
    private readonly _lockCollection: string;
    private _closed: boolean = false;

    constructor(config: MongoStorageConfig) {
        this._connection = config.connection;
        this._transactionCollection = config.transactionCollection ?? 'transactions';
        this._dataCollection = config.dataCollection ?? 'transaction_data';
        this._lockCollection = config.lockCollection ?? 'transaction_locks';
    }

    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    /**
     * @zh 获取集合
     * @en Get collection
     */
    private _getCollection<T extends object>(name: string): IMongoCollection<T> {
        if (this._closed) {
            throw new Error('MongoStorage is closed');
        }

        if (!this._connection.isConnected()) {
            throw new Error('MongoDB connection is not connected');
        }

        return this._connection.collection<T>(name);
    }

    /**
     * @zh 关闭存储
     * @en Close storage
     *
     * @zh 不会关闭共享连接，只标记存储为已关闭
     * @en Does not close shared connection, only marks storage as closed
     */
    async close(): Promise<void> {
        this._closed = true;
    }

    /**
     * @zh 支持 await using 语法
     * @en Support await using syntax
     */
    async [Symbol.asyncDispose](): Promise<void> {
        await this.close();
    }

    /**
     * @zh 确保索引存在
     * @en Ensure indexes exist
     */
    async ensureIndexes(): Promise<void> {
        const txColl = this._getCollection<TransactionLog & { _id: string }>(this._transactionCollection);
        await txColl.createIndex({ state: 1 });
        await txColl.createIndex({ 'metadata.serverId': 1 });
        await txColl.createIndex({ createdAt: 1 });

        const lockColl = this._getCollection<LockDocument>(this._lockCollection);
        await lockColl.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });

        const dataColl = this._getCollection<DataDocument>(this._dataCollection);
        await dataColl.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
    }

    // =========================================================================
    // 分布式锁 | Distributed Lock
    // =========================================================================

    async acquireLock(key: string, ttl: number): Promise<string | null> {
        const coll = this._getCollection<LockDocument>(this._lockCollection);
        const token = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const expireAt = new Date(Date.now() + ttl);

        try {
            await coll.insertOne({ _id: key, token, expireAt } as LockDocument);
            return token;
        } catch {
            const existing = await coll.findOne({ _id: key });
            if (existing && existing.expireAt < new Date()) {
                const result = await coll.updateOne(
                    { _id: key, expireAt: { $lt: new Date() } },
                    { $set: { token, expireAt } }
                );
                if (result.modifiedCount > 0) {
                    return token;
                }
            }
            return null;
        }
    }

    async releaseLock(key: string, token: string): Promise<boolean> {
        const coll = this._getCollection<LockDocument>(this._lockCollection);
        const result = await coll.deleteOne({ _id: key, token });
        return result.deletedCount > 0;
    }

    // =========================================================================
    // 事务日志 | Transaction Log
    // =========================================================================

    async saveTransaction(tx: TransactionLog): Promise<void> {
        const coll = this._getCollection<TransactionLog & { _id: string }>(this._transactionCollection);

        const existing = await coll.findOne({ _id: tx.id });
        if (existing) {
            await coll.updateOne(
                { _id: tx.id },
                { $set: { ...tx, _id: tx.id } }
            );
        } else {
            await coll.insertOne({ ...tx, _id: tx.id } as TransactionLog & { _id: string });
        }
    }

    async getTransaction(id: string): Promise<TransactionLog | null> {
        const coll = this._getCollection<TransactionLog & { _id: string }>(this._transactionCollection);
        const doc = await coll.findOne({ _id: id });

        if (!doc) return null;

        const { _id, ...tx } = doc;
        return tx as TransactionLog;
    }

    async updateTransactionState(id: string, state: TransactionState): Promise<void> {
        const coll = this._getCollection<TransactionLog & { _id: string }>(this._transactionCollection);
        await coll.updateOne(
            { _id: id },
            { $set: { state, updatedAt: Date.now() } }
        );
    }

    async updateOperationState(
        transactionId: string,
        operationIndex: number,
        state: OperationLog['state'],
        error?: string
    ): Promise<void> {
        const coll = this._getCollection<TransactionLog & { _id: string }>(this._transactionCollection);

        const update: Record<string, unknown> = {
            [`operations.${operationIndex}.state`]: state,
            updatedAt: Date.now()
        };

        if (error) {
            update[`operations.${operationIndex}.error`] = error;
        }

        if (state === 'executed') {
            update[`operations.${operationIndex}.executedAt`] = Date.now();
        } else if (state === 'compensated') {
            update[`operations.${operationIndex}.compensatedAt`] = Date.now();
        }

        await coll.updateOne(
            { _id: transactionId },
            { $set: update }
        );
    }

    async getPendingTransactions(serverId?: string): Promise<TransactionLog[]> {
        const coll = this._getCollection<TransactionLog & { _id: string }>(this._transactionCollection);

        const filter: Record<string, unknown> = {
            state: { $in: ['pending', 'executing'] }
        };

        if (serverId) {
            filter['metadata.serverId'] = serverId;
        }

        const docs = await coll.find(filter);
        return docs.map(({ _id, ...tx }) => tx as TransactionLog);
    }

    async deleteTransaction(id: string): Promise<void> {
        const coll = this._getCollection<TransactionLog & { _id: string }>(this._transactionCollection);
        await coll.deleteOne({ _id: id });
    }

    // =========================================================================
    // 数据操作 | Data Operations
    // =========================================================================

    async get<T>(key: string): Promise<T | null> {
        const coll = this._getCollection<DataDocument>(this._dataCollection);
        const doc = await coll.findOne({ _id: key });

        if (!doc) return null;

        if (doc.expireAt && doc.expireAt < new Date()) {
            await coll.deleteOne({ _id: key });
            return null;
        }

        return doc.value as T;
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        const coll = this._getCollection<DataDocument>(this._dataCollection);

        const doc: DataDocument = { _id: key, value };

        if (ttl) {
            doc.expireAt = new Date(Date.now() + ttl);
        }

        const existing = await coll.findOne({ _id: key });
        if (existing) {
            await coll.updateOne({ _id: key }, { $set: doc });
        } else {
            await coll.insertOne(doc);
        }
    }

    async delete(key: string): Promise<boolean> {
        const coll = this._getCollection<DataDocument>(this._dataCollection);
        const result = await coll.deleteOne({ _id: key });
        return result.deletedCount > 0;
    }
}

/**
 * @zh 创建 MongoDB 存储
 * @en Create MongoDB storage
 *
 * @example
 * ```typescript
 * import { createMongoConnection } from '@esengine/database-drivers'
 * import { createMongoStorage } from '@esengine/transaction'
 *
 * const mongo = createMongoConnection({
 *     uri: 'mongodb://localhost:27017',
 *     database: 'game'
 * })
 * await mongo.connect()
 *
 * const storage = createMongoStorage(mongo)
 * ```
 */
export function createMongoStorage(
    connection: IMongoConnection,
    options?: Omit<MongoStorageConfig, 'connection'>
): MongoStorage {
    return new MongoStorage({ connection, ...options });
}
