/**
 * @zh MongoDB 集合简化接口
 * @en MongoDB collection simplified interface
 *
 * @zh 提供与 MongoDB 解耦的类型安全接口
 * @en Provides type-safe interface decoupled from MongoDB
 */

// =============================================================================
// 查询结果 | Query Results
// =============================================================================

/**
 * @zh 插入结果
 * @en Insert result
 */
export interface InsertOneResult {
    insertedId: unknown
    acknowledged: boolean
}

/**
 * @zh 批量插入结果
 * @en Insert many result
 */
export interface InsertManyResult {
    insertedCount: number
    insertedIds: Record<number, unknown>
    acknowledged: boolean
}

/**
 * @zh 更新结果
 * @en Update result
 */
export interface UpdateResult {
    matchedCount: number
    modifiedCount: number
    upsertedCount: number
    upsertedId?: unknown
    acknowledged: boolean
}

/**
 * @zh 删除结果
 * @en Delete result
 */
export interface DeleteResult {
    deletedCount: number
    acknowledged: boolean
}

// =============================================================================
// 查询选项 | Query Options
// =============================================================================

/**
 * @zh 排序方向
 * @en Sort direction
 */
export type SortDirection = 1 | -1 | 'asc' | 'desc'

/**
 * @zh 排序定义
 * @en Sort definition
 */
export type Sort = Record<string, SortDirection>

/**
 * @zh 查找选项
 * @en Find options
 */
export interface FindOptions {
    sort?: Sort
    limit?: number
    skip?: number
    projection?: Record<string, 0 | 1>
}

/**
 * @zh 查找并更新选项
 * @en Find and update options
 */
export interface FindOneAndUpdateOptions {
    returnDocument?: 'before' | 'after'
    upsert?: boolean
}

/**
 * @zh 索引选项
 * @en Index options
 */
export interface IndexOptions {
    unique?: boolean
    sparse?: boolean
    expireAfterSeconds?: number
    name?: string
}

// =============================================================================
// 集合接口 | Collection Interface
// =============================================================================

/**
 * @zh MongoDB 集合接口
 * @en MongoDB collection interface
 *
 * @zh 简化的集合操作接口，与 MongoDB 原生类型解耦
 * @en Simplified collection interface, decoupled from MongoDB native types
 */
export interface IMongoCollection<T extends object> {
    /**
     * @zh 集合名称
     * @en Collection name
     */
    readonly name: string

    // =========================================================================
    // 查询 | Query
    // =========================================================================

    /**
     * @zh 查找单条记录
     * @en Find one document
     */
    findOne(filter: object, options?: FindOptions): Promise<T | null>

    /**
     * @zh 查找多条记录
     * @en Find documents
     */
    find(filter: object, options?: FindOptions): Promise<T[]>

    /**
     * @zh 统计记录数
     * @en Count documents
     */
    countDocuments(filter?: object): Promise<number>

    // =========================================================================
    // 创建 | Create
    // =========================================================================

    /**
     * @zh 插入单条记录
     * @en Insert one document
     */
    insertOne(doc: T): Promise<InsertOneResult>

    /**
     * @zh 批量插入
     * @en Insert many documents
     */
    insertMany(docs: T[]): Promise<InsertManyResult>

    // =========================================================================
    // 更新 | Update
    // =========================================================================

    /**
     * @zh 更新单条记录
     * @en Update one document
     */
    updateOne(filter: object, update: object): Promise<UpdateResult>

    /**
     * @zh 批量更新
     * @en Update many documents
     */
    updateMany(filter: object, update: object): Promise<UpdateResult>

    /**
     * @zh 查找并更新
     * @en Find one and update
     */
    findOneAndUpdate(
        filter: object,
        update: object,
        options?: FindOneAndUpdateOptions
    ): Promise<T | null>

    // =========================================================================
    // 删除 | Delete
    // =========================================================================

    /**
     * @zh 删除单条记录
     * @en Delete one document
     */
    deleteOne(filter: object): Promise<DeleteResult>

    /**
     * @zh 批量删除
     * @en Delete many documents
     */
    deleteMany(filter: object): Promise<DeleteResult>

    // =========================================================================
    // 索引 | Index
    // =========================================================================

    /**
     * @zh 创建索引
     * @en Create index
     */
    createIndex(spec: Record<string, 1 | -1>, options?: IndexOptions): Promise<string>
}

/**
 * @zh MongoDB 数据库接口
 * @en MongoDB database interface
 */
export interface IMongoDatabase {
    /**
     * @zh 数据库名称
     * @en Database name
     */
    readonly name: string

    /**
     * @zh 获取集合
     * @en Get collection
     */
    collection<T extends object = object>(name: string): IMongoCollection<T>

    /**
     * @zh 列出所有集合
     * @en List all collections
     */
    listCollections(): Promise<string[]>

    /**
     * @zh 删除集合
     * @en Drop collection
     */
    dropCollection(name: string): Promise<boolean>
}
