/**
 * @zh 数据库核心类型定义
 * @en Database core type definitions
 */

// =============================================================================
// 实体类型 | Entity Types
// =============================================================================

/**
 * @zh 基础实体接口
 * @en Base entity interface
 */
export interface BaseEntity {
    /**
     * @zh 实体唯一标识
     * @en Entity unique identifier
     */
    id: string

    /**
     * @zh 创建时间
     * @en Creation timestamp
     */
    createdAt?: Date

    /**
     * @zh 更新时间
     * @en Update timestamp
     */
    updatedAt?: Date
}

/**
 * @zh 软删除实体接口
 * @en Soft delete entity interface
 */
export interface SoftDeleteEntity extends BaseEntity {
    /**
     * @zh 删除时间（null 表示未删除）
     * @en Deletion timestamp (null means not deleted)
     */
    deletedAt?: Date | null
}

// =============================================================================
// 查询类型 | Query Types
// =============================================================================

/**
 * @zh 比较操作符
 * @en Comparison operators
 */
export interface ComparisonOperators<T> {
    $eq?: T
    $ne?: T
    $gt?: T
    $gte?: T
    $lt?: T
    $lte?: T
    $in?: T[]
    $nin?: T[]
    $like?: string
    $regex?: string
}

/**
 * @zh 查询条件
 * @en Query condition
 */
export type WhereCondition<T> = {
    [K in keyof T]?: T[K] | ComparisonOperators<T[K]>
} & {
    $or?: WhereCondition<T>[]
    $and?: WhereCondition<T>[]
}

/**
 * @zh 排序方向
 * @en Sort direction
 */
export type SortDirection = 'asc' | 'desc'

/**
 * @zh 排序条件
 * @en Sort condition
 */
export type SortCondition<T> = {
    [K in keyof T]?: SortDirection
}

/**
 * @zh 查询选项
 * @en Query options
 */
export interface QueryOptions<T> {
    /**
     * @zh 过滤条件
     * @en Filter conditions
     */
    where?: WhereCondition<T>

    /**
     * @zh 排序条件
     * @en Sort conditions
     */
    sort?: SortCondition<T>

    /**
     * @zh 限制返回数量
     * @en Limit number of results
     */
    limit?: number

    /**
     * @zh 跳过记录数
     * @en Number of records to skip
     */
    offset?: number

    /**
     * @zh 是否包含软删除记录
     * @en Whether to include soft deleted records
     */
    includeSoftDeleted?: boolean
}

// =============================================================================
// 分页类型 | Pagination Types
// =============================================================================

/**
 * @zh 分页参数
 * @en Pagination parameters
 */
export interface PaginationParams {
    /**
     * @zh 页码（从 1 开始）
     * @en Page number (starts from 1)
     */
    page: number

    /**
     * @zh 每页数量
     * @en Items per page
     */
    pageSize: number
}

/**
 * @zh 分页结果
 * @en Pagination result
 */
export interface PaginatedResult<T> {
    /**
     * @zh 数据列表
     * @en Data list
     */
    data: T[]

    /**
     * @zh 总记录数
     * @en Total count
     */
    total: number

    /**
     * @zh 当前页码
     * @en Current page
     */
    page: number

    /**
     * @zh 每页数量
     * @en Page size
     */
    pageSize: number

    /**
     * @zh 总页数
     * @en Total pages
     */
    totalPages: number

    /**
     * @zh 是否有下一页
     * @en Whether has next page
     */
    hasNext: boolean

    /**
     * @zh 是否有上一页
     * @en Whether has previous page
     */
    hasPrev: boolean
}

// =============================================================================
// 仓库接口 | Repository Interface
// =============================================================================

/**
 * @zh 仓库接口
 * @en Repository interface
 */
export interface IRepository<T extends BaseEntity> {
    /**
     * @zh 集合名称
     * @en Collection name
     */
    readonly collectionName: string

    /**
     * @zh 根据 ID 查找
     * @en Find by ID
     */
    findById(id: string): Promise<T | null>

    /**
     * @zh 查找单条记录
     * @en Find one record
     */
    findOne(options?: QueryOptions<T>): Promise<T | null>

    /**
     * @zh 查找多条记录
     * @en Find many records
     */
    findMany(options?: QueryOptions<T>): Promise<T[]>

    /**
     * @zh 分页查询
     * @en Paginated query
     */
    findPaginated(
        pagination: PaginationParams,
        options?: Omit<QueryOptions<T>, 'limit' | 'offset'>
    ): Promise<PaginatedResult<T>>

    /**
     * @zh 统计记录数
     * @en Count records
     */
    count(options?: QueryOptions<T>): Promise<number>

    /**
     * @zh 检查记录是否存在
     * @en Check if record exists
     */
    exists(options: QueryOptions<T>): Promise<boolean>

    /**
     * @zh 创建记录
     * @en Create record
     */
    create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<T>

    /**
     * @zh 批量创建
     * @en Bulk create
     */
    createMany(data: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }>): Promise<T[]>

    /**
     * @zh 更新记录
     * @en Update record
     */
    update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T | null>

    /**
     * @zh 删除记录
     * @en Delete record
     */
    delete(id: string): Promise<boolean>

    /**
     * @zh 批量删除
     * @en Bulk delete
     */
    deleteMany(options: QueryOptions<T>): Promise<number>
}

// =============================================================================
// 用户实体 | User Entity
// =============================================================================

/**
 * @zh 用户实体
 * @en User entity
 */
export interface UserEntity extends SoftDeleteEntity {
    /**
     * @zh 用户名
     * @en Username
     */
    username: string

    /**
     * @zh 密码哈希
     * @en Password hash
     */
    passwordHash: string

    /**
     * @zh 邮箱
     * @en Email
     */
    email?: string

    /**
     * @zh 用户角色
     * @en User roles
     */
    roles: string[]

    /**
     * @zh 是否启用
     * @en Is active
     */
    isActive: boolean

    /**
     * @zh 最后登录时间
     * @en Last login timestamp
     */
    lastLoginAt?: Date

    /**
     * @zh 额外数据
     * @en Additional metadata
     */
    metadata?: Record<string, unknown>
}
