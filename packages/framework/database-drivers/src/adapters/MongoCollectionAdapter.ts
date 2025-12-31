/**
 * @zh MongoDB 集合适配器
 * @en MongoDB collection adapter
 *
 * @zh 将 MongoDB 原生 Collection 适配为简化接口
 * @en Adapts native MongoDB Collection to simplified interface
 */

import type { Collection, Db } from 'mongodb'
import type {
    DeleteResult,
    FindOneAndUpdateOptions,
    FindOptions,
    IMongoCollection,
    IMongoDatabase,
    IndexOptions,
    InsertManyResult,
    InsertOneResult,
    UpdateResult
} from '../interfaces/IMongoCollection.js'

/**
 * @zh MongoDB 集合适配器
 * @en MongoDB collection adapter
 */
export class MongoCollectionAdapter<T extends object> implements IMongoCollection<T> {
    readonly name: string

    constructor(private readonly _collection: Collection<T>) {
        this.name = _collection.collectionName
    }

    // =========================================================================
    // 查询 | Query
    // =========================================================================

    async findOne(filter: object, options?: FindOptions): Promise<T | null> {
        const doc = await this._collection.findOne(
            filter as Parameters<typeof this._collection.findOne>[0],
            {
                sort: options?.sort as Parameters<typeof this._collection.findOne>[1] extends { sort?: infer S } ? S : never,
                projection: options?.projection
            }
        )
        return doc ? this._stripId(doc) : null
    }

    async find(filter: object, options?: FindOptions): Promise<T[]> {
        let cursor = this._collection.find(
            filter as Parameters<typeof this._collection.find>[0]
        )

        if (options?.sort) {
            cursor = cursor.sort(options.sort as Parameters<typeof cursor.sort>[0])
        }

        if (options?.skip) {
            cursor = cursor.skip(options.skip)
        }

        if (options?.limit) {
            cursor = cursor.limit(options.limit)
        }

        if (options?.projection) {
            cursor = cursor.project(options.projection)
        }

        const docs = await cursor.toArray()
        return docs.map(doc => this._stripId(doc))
    }

    async countDocuments(filter?: object): Promise<number> {
        return this._collection.countDocuments(
            (filter ?? {}) as Parameters<typeof this._collection.countDocuments>[0]
        )
    }

    // =========================================================================
    // 创建 | Create
    // =========================================================================

    async insertOne(doc: T): Promise<InsertOneResult> {
        const result = await this._collection.insertOne(
            doc as Parameters<typeof this._collection.insertOne>[0]
        )
        return {
            insertedId: result.insertedId,
            acknowledged: result.acknowledged
        }
    }

    async insertMany(docs: T[]): Promise<InsertManyResult> {
        const result = await this._collection.insertMany(
            docs as Parameters<typeof this._collection.insertMany>[0]
        )
        return {
            insertedCount: result.insertedCount,
            insertedIds: result.insertedIds as Record<number, unknown>,
            acknowledged: result.acknowledged
        }
    }

    // =========================================================================
    // 更新 | Update
    // =========================================================================

    async updateOne(filter: object, update: object): Promise<UpdateResult> {
        const result = await this._collection.updateOne(
            filter as Parameters<typeof this._collection.updateOne>[0],
            update as Parameters<typeof this._collection.updateOne>[1]
        )
        return {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            upsertedCount: result.upsertedCount,
            upsertedId: result.upsertedId,
            acknowledged: result.acknowledged
        }
    }

    async updateMany(filter: object, update: object): Promise<UpdateResult> {
        const result = await this._collection.updateMany(
            filter as Parameters<typeof this._collection.updateMany>[0],
            update as Parameters<typeof this._collection.updateMany>[1]
        )
        return {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            upsertedCount: result.upsertedCount,
            upsertedId: result.upsertedId,
            acknowledged: result.acknowledged
        }
    }

    async findOneAndUpdate(
        filter: object,
        update: object,
        options?: FindOneAndUpdateOptions
    ): Promise<T | null> {
        const result = await this._collection.findOneAndUpdate(
            filter as Parameters<typeof this._collection.findOneAndUpdate>[0],
            update as Parameters<typeof this._collection.findOneAndUpdate>[1],
            {
                returnDocument: options?.returnDocument ?? 'after',
                upsert: options?.upsert
            }
        )
        return result ? this._stripId(result) : null
    }

    // =========================================================================
    // 删除 | Delete
    // =========================================================================

    async deleteOne(filter: object): Promise<DeleteResult> {
        const result = await this._collection.deleteOne(
            filter as Parameters<typeof this._collection.deleteOne>[0]
        )
        return {
            deletedCount: result.deletedCount,
            acknowledged: result.acknowledged
        }
    }

    async deleteMany(filter: object): Promise<DeleteResult> {
        const result = await this._collection.deleteMany(
            filter as Parameters<typeof this._collection.deleteMany>[0]
        )
        return {
            deletedCount: result.deletedCount,
            acknowledged: result.acknowledged
        }
    }

    // =========================================================================
    // 索引 | Index
    // =========================================================================

    async createIndex(
        spec: Record<string, 1 | -1>,
        options?: IndexOptions
    ): Promise<string> {
        return this._collection.createIndex(spec, options)
    }

    // =========================================================================
    // 内部方法 | Internal Methods
    // =========================================================================

    /**
     * @zh 移除 MongoDB 的 _id 字段
     * @en Remove MongoDB's _id field
     */
    private _stripId<D extends object>(doc: D): D {
        const { _id, ...rest } = doc as { _id?: unknown } & Record<string, unknown>
        return rest as D
    }
}

/**
 * @zh MongoDB 数据库适配器
 * @en MongoDB database adapter
 */
export class MongoDatabaseAdapter implements IMongoDatabase {
    readonly name: string
    private _collections = new Map<string, MongoCollectionAdapter<object>>()

    constructor(private readonly _db: Db) {
        this.name = _db.databaseName
    }

    collection<T extends object = object>(name: string): IMongoCollection<T> {
        if (!this._collections.has(name)) {
            const nativeCollection = this._db.collection<T>(name)
            this._collections.set(
                name,
                new MongoCollectionAdapter(nativeCollection) as MongoCollectionAdapter<object>
            )
        }
        return this._collections.get(name) as IMongoCollection<T>
    }

    async listCollections(): Promise<string[]> {
        const collections = await this._db.listCollections().toArray()
        return collections.map(c => c.name)
    }

    async dropCollection(name: string): Promise<boolean> {
        try {
            await this._db.dropCollection(name)
            this._collections.delete(name)
            return true
        } catch {
            return false
        }
    }
}
