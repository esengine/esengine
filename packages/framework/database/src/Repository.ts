/**
 * @zh MongoDB 仓库实现
 * @en MongoDB repository implementation
 *
 * @zh 基于 MongoDB 的通用仓库，支持 CRUD、分页、软删除
 * @en Generic MongoDB repository with CRUD, pagination, and soft delete support
 */

import { randomUUID } from 'crypto'
import type { IMongoConnection, IMongoCollection } from '@esengine/database-drivers'
import type {
    BaseEntity,
    IRepository,
    PaginatedResult,
    PaginationParams,
    QueryOptions,
    WhereCondition
} from './types.js'

/**
 * @zh MongoDB 仓库基类
 * @en MongoDB repository base class
 *
 * @example
 * ```typescript
 * interface Player extends BaseEntity {
 *     name: string
 *     score: number
 * }
 *
 * class PlayerRepository extends Repository<Player> {
 *     constructor(connection: IMongoConnection) {
 *         super(connection, 'players')
 *     }
 *
 *     async findTopPlayers(limit: number): Promise<Player[]> {
 *         return this.findMany({
 *             sort: { score: 'desc' },
 *             limit,
 *         })
 *     }
 * }
 * ```
 */
export class Repository<T extends BaseEntity> implements IRepository<T> {
    protected readonly _collection: IMongoCollection<T>

    constructor(
        protected readonly connection: IMongoConnection,
        public readonly collectionName: string,
        protected readonly enableSoftDelete: boolean = false
    ) {
        this._collection = connection.collection<T>(collectionName)
    }

    // =========================================================================
    // 查询 | Query
    // =========================================================================

    async findById(id: string): Promise<T | null> {
        const filter = this._buildFilter({ where: { id } as WhereCondition<T> })
        return this._collection.findOne(filter)
    }

    async findOne(options?: QueryOptions<T>): Promise<T | null> {
        const filter = this._buildFilter(options)
        const sort = this._buildSort(options)
        return this._collection.findOne(filter, { sort })
    }

    async findMany(options?: QueryOptions<T>): Promise<T[]> {
        const filter = this._buildFilter(options)
        const sort = this._buildSort(options)
        return this._collection.find(filter, {
            sort,
            skip: options?.offset,
            limit: options?.limit
        })
    }

    async findPaginated(
        pagination: PaginationParams,
        options?: Omit<QueryOptions<T>, 'limit' | 'offset'>
    ): Promise<PaginatedResult<T>> {
        const { page, pageSize } = pagination
        const offset = (page - 1) * pageSize

        const [data, total] = await Promise.all([
            this.findMany({ ...options, limit: pageSize, offset }),
            this.count(options)
        ])

        const totalPages = Math.ceil(total / pageSize)

        return {
            data,
            total,
            page,
            pageSize,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    }

    async count(options?: QueryOptions<T>): Promise<number> {
        const filter = this._buildFilter(options)
        return this._collection.countDocuments(filter)
    }

    async exists(options: QueryOptions<T>): Promise<boolean> {
        const count = await this.count({ ...options, limit: 1 })
        return count > 0
    }

    // =========================================================================
    // 创建 | Create
    // =========================================================================

    async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<T> {
        const now = new Date()
        const entity = {
            ...data,
            id: data.id || randomUUID(),
            createdAt: now,
            updatedAt: now
        } as T

        await this._collection.insertOne(entity)
        return entity
    }

    async createMany(
        data: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }>
    ): Promise<T[]> {
        if (data.length === 0) return []

        const now = new Date()
        const entities = data.map(item => ({
            ...item,
            id: item.id || randomUUID(),
            createdAt: now,
            updatedAt: now
        })) as T[]

        await this._collection.insertMany(entities)
        return entities
    }

    // =========================================================================
    // 更新 | Update
    // =========================================================================

    async update(
        id: string,
        data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<T | null> {
        const filter = this._buildFilter({ where: { id } as WhereCondition<T> })
        return this._collection.findOneAndUpdate(
            filter,
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        )
    }

    // =========================================================================
    // 删除 | Delete
    // =========================================================================

    async delete(id: string): Promise<boolean> {
        if (this.enableSoftDelete) {
            const result = await this._collection.updateOne(
                { id },
                { $set: { deletedAt: new Date(), updatedAt: new Date() } }
            )
            return result.modifiedCount > 0
        }

        const result = await this._collection.deleteOne({ id })
        return result.deletedCount > 0
    }

    async deleteMany(options: QueryOptions<T>): Promise<number> {
        const filter = this._buildFilter(options)

        if (this.enableSoftDelete) {
            const result = await this._collection.updateMany(filter, {
                $set: { deletedAt: new Date(), updatedAt: new Date() }
            })
            return result.modifiedCount
        }

        const result = await this._collection.deleteMany(filter)
        return result.deletedCount
    }

    // =========================================================================
    // 软删除恢复 | Soft Delete Recovery
    // =========================================================================

    /**
     * @zh 恢复软删除的记录
     * @en Restore soft deleted record
     */
    async restore(id: string): Promise<T | null> {
        if (!this.enableSoftDelete) {
            throw new Error('Soft delete is not enabled for this repository')
        }

        return this._collection.findOneAndUpdate(
            { id, deletedAt: { $ne: null } },
            { $set: { deletedAt: null, updatedAt: new Date() } },
            { returnDocument: 'after' }
        )
    }

    // =========================================================================
    // 内部方法 | Internal Methods
    // =========================================================================

    /**
     * @zh 构建过滤条件
     * @en Build filter
     */
    protected _buildFilter(options?: QueryOptions<T>): object {
        const filter: Record<string, unknown> = {}

        if (this.enableSoftDelete && !options?.includeSoftDeleted) {
            filter['deletedAt'] = null
        }

        if (!options?.where) {
            return filter
        }

        return { ...filter, ...this._convertWhere(options.where) }
    }

    /**
     * @zh 转换 where 条件
     * @en Convert where condition
     */
    protected _convertWhere(where: WhereCondition<T>): object {
        const result: Record<string, unknown> = {}

        for (const [key, value] of Object.entries(where)) {
            if (key === '$or' && Array.isArray(value)) {
                result['$or'] = value.map(v => this._convertWhere(v as WhereCondition<T>))
                continue
            }

            if (key === '$and' && Array.isArray(value)) {
                result['$and'] = value.map(v => this._convertWhere(v as WhereCondition<T>))
                continue
            }

            if (value === undefined) continue

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const ops = value as Record<string, unknown>
                const mongoOps: Record<string, unknown> = {}

                if ('$eq' in ops) mongoOps['$eq'] = ops.$eq
                if ('$ne' in ops) mongoOps['$ne'] = ops.$ne
                if ('$gt' in ops) mongoOps['$gt'] = ops.$gt
                if ('$gte' in ops) mongoOps['$gte'] = ops.$gte
                if ('$lt' in ops) mongoOps['$lt'] = ops.$lt
                if ('$lte' in ops) mongoOps['$lte'] = ops.$lte
                if ('$in' in ops) mongoOps['$in'] = ops.$in
                if ('$nin' in ops) mongoOps['$nin'] = ops.$nin
                if ('$like' in ops) {
                    const pattern = (ops.$like as string).replace(/%/g, '.*').replace(/_/g, '.')
                    mongoOps['$regex'] = new RegExp(`^${pattern}$`, 'i')
                }
                if ('$regex' in ops) {
                    mongoOps['$regex'] = new RegExp(ops.$regex as string, 'i')
                }

                result[key] = Object.keys(mongoOps).length > 0 ? mongoOps : value
            } else {
                result[key] = value
            }
        }

        return result
    }

    /**
     * @zh 构建排序条件
     * @en Build sort condition
     */
    protected _buildSort(options?: QueryOptions<T>): Record<string, 1 | -1> | undefined {
        if (!options?.sort) return undefined

        const result: Record<string, 1 | -1> = {}
        for (const [key, direction] of Object.entries(options.sort)) {
            result[key] = direction === 'desc' ? -1 : 1
        }
        return result
    }
}

/**
 * @zh 创建仓库实例
 * @en Create repository instance
 */
export function createRepository<T extends BaseEntity>(
    connection: IMongoConnection,
    collectionName: string,
    enableSoftDelete = false
): Repository<T> {
    return new Repository<T>(connection, collectionName, enableSoftDelete)
}
