/**
 * @zh MongoDB 存储实现
 * @en MongoDB storage implementation
 *
 * @zh 支持持久化事务日志和查询
 * @en Supports persistent transaction logs and queries
 */

import type {
    ITransactionStorage,
    TransactionLog,
    TransactionState,
    OperationLog,
} from '../core/types.js'

/**
 * @zh MongoDB Collection 接口
 * @en MongoDB Collection interface
 */
export interface MongoCollection<T> {
    findOne(filter: object): Promise<T | null>
    find(filter: object): {
        toArray(): Promise<T[]>
    }
    insertOne(doc: T): Promise<{ insertedId: unknown }>
    updateOne(filter: object, update: object): Promise<{ modifiedCount: number }>
    deleteOne(filter: object): Promise<{ deletedCount: number }>
    createIndex(spec: object, options?: object): Promise<string>
}

/**
 * @zh MongoDB 数据库接口
 * @en MongoDB database interface
 */
export interface MongoDb {
    collection<T = unknown>(name: string): MongoCollection<T>
}

/**
 * @zh MongoDB 存储配置
 * @en MongoDB storage configuration
 */
export interface MongoStorageConfig {
    /**
     * @zh MongoDB 数据库实例
     * @en MongoDB database instance
     */
    db: MongoDb

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

/**
 * @zh MongoDB 存储
 * @en MongoDB storage
 *
 * @zh 基于 MongoDB 的事务存储，支持持久化和复杂查询
 * @en MongoDB-based transaction storage with persistence and complex query support
 *
 * @example
 * ```typescript
 * import { MongoClient } from 'mongodb'
 *
 * const client = new MongoClient('mongodb://localhost:27017')
 * await client.connect()
 * const db = client.db('game')
 *
 * const storage = new MongoStorage({ db })
 * await storage.ensureIndexes()
 * ```
 */
export class MongoStorage implements ITransactionStorage {
    private _db: MongoDb
    private _transactionCollection: string
    private _dataCollection: string
    private _lockCollection: string

    constructor(config: MongoStorageConfig) {
        this._db = config.db
        this._transactionCollection = config.transactionCollection ?? 'transactions'
        this._dataCollection = config.dataCollection ?? 'transaction_data'
        this._lockCollection = config.lockCollection ?? 'transaction_locks'
    }

    /**
     * @zh 确保索引存在
     * @en Ensure indexes exist
     */
    async ensureIndexes(): Promise<void> {
        const txColl = this._db.collection<TransactionLog>(this._transactionCollection)
        await txColl.createIndex({ state: 1 })
        await txColl.createIndex({ 'metadata.serverId': 1 })
        await txColl.createIndex({ createdAt: 1 })

        const lockColl = this._db.collection<LockDocument>(this._lockCollection)
        await lockColl.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })

        const dataColl = this._db.collection<DataDocument>(this._dataCollection)
        await dataColl.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
    }

    // =========================================================================
    // 分布式锁 | Distributed Lock
    // =========================================================================

    async acquireLock(key: string, ttl: number): Promise<string | null> {
        const coll = this._db.collection<LockDocument>(this._lockCollection)
        const token = `${Date.now()}_${Math.random().toString(36).substring(2)}`
        const expireAt = new Date(Date.now() + ttl)

        try {
            await coll.insertOne({
                _id: key,
                token,
                expireAt,
            })
            return token
        } catch (error) {
            const existing = await coll.findOne({ _id: key })
            if (existing && existing.expireAt < new Date()) {
                const result = await coll.updateOne(
                    { _id: key, expireAt: { $lt: new Date() } },
                    { $set: { token, expireAt } }
                )
                if (result.modifiedCount > 0) {
                    return token
                }
            }
            return null
        }
    }

    async releaseLock(key: string, token: string): Promise<boolean> {
        const coll = this._db.collection<LockDocument>(this._lockCollection)
        const result = await coll.deleteOne({ _id: key, token })
        return result.deletedCount > 0
    }

    // =========================================================================
    // 事务日志 | Transaction Log
    // =========================================================================

    async saveTransaction(tx: TransactionLog): Promise<void> {
        const coll = this._db.collection<TransactionLog & { _id: string }>(this._transactionCollection)

        const existing = await coll.findOne({ _id: tx.id })
        if (existing) {
            await coll.updateOne(
                { _id: tx.id },
                { $set: { ...tx, _id: tx.id } }
            )
        } else {
            await coll.insertOne({ ...tx, _id: tx.id })
        }
    }

    async getTransaction(id: string): Promise<TransactionLog | null> {
        const coll = this._db.collection<TransactionLog & { _id: string }>(this._transactionCollection)
        const doc = await coll.findOne({ _id: id })

        if (!doc) return null

        const { _id, ...tx } = doc
        return tx as TransactionLog
    }

    async updateTransactionState(id: string, state: TransactionState): Promise<void> {
        const coll = this._db.collection(this._transactionCollection)
        await coll.updateOne(
            { _id: id },
            { $set: { state, updatedAt: Date.now() } }
        )
    }

    async updateOperationState(
        transactionId: string,
        operationIndex: number,
        state: OperationLog['state'],
        error?: string
    ): Promise<void> {
        const coll = this._db.collection(this._transactionCollection)

        const update: Record<string, unknown> = {
            [`operations.${operationIndex}.state`]: state,
            updatedAt: Date.now(),
        }

        if (error) {
            update[`operations.${operationIndex}.error`] = error
        }

        if (state === 'executed') {
            update[`operations.${operationIndex}.executedAt`] = Date.now()
        } else if (state === 'compensated') {
            update[`operations.${operationIndex}.compensatedAt`] = Date.now()
        }

        await coll.updateOne(
            { _id: transactionId },
            { $set: update }
        )
    }

    async getPendingTransactions(serverId?: string): Promise<TransactionLog[]> {
        const coll = this._db.collection<TransactionLog & { _id: string }>(this._transactionCollection)

        const filter: Record<string, unknown> = {
            state: { $in: ['pending', 'executing'] },
        }

        if (serverId) {
            filter['metadata.serverId'] = serverId
        }

        const docs = await coll.find(filter).toArray()
        return docs.map(({ _id, ...tx }) => tx as TransactionLog)
    }

    async deleteTransaction(id: string): Promise<void> {
        const coll = this._db.collection(this._transactionCollection)
        await coll.deleteOne({ _id: id })
    }

    // =========================================================================
    // 数据操作 | Data Operations
    // =========================================================================

    async get<T>(key: string): Promise<T | null> {
        const coll = this._db.collection<DataDocument>(this._dataCollection)
        const doc = await coll.findOne({ _id: key })

        if (!doc) return null

        if (doc.expireAt && doc.expireAt < new Date()) {
            await coll.deleteOne({ _id: key })
            return null
        }

        return doc.value as T
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        const coll = this._db.collection<DataDocument>(this._dataCollection)

        const doc: DataDocument = {
            _id: key,
            value,
        }

        if (ttl) {
            doc.expireAt = new Date(Date.now() + ttl)
        }

        const existing = await coll.findOne({ _id: key })
        if (existing) {
            await coll.updateOne({ _id: key }, { $set: doc })
        } else {
            await coll.insertOne(doc)
        }
    }

    async delete(key: string): Promise<boolean> {
        const coll = this._db.collection(this._dataCollection)
        const result = await coll.deleteOne({ _id: key })
        return result.deletedCount > 0
    }
}

/**
 * @zh 创建 MongoDB 存储
 * @en Create MongoDB storage
 */
export function createMongoStorage(config: MongoStorageConfig): MongoStorage {
    return new MongoStorage(config)
}
