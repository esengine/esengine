/**
 * @zh 事务系统核心类型定义
 * @en Transaction system core type definitions
 */

// =============================================================================
// 事务状态 | Transaction State
// =============================================================================

/**
 * @zh 事务状态
 * @en Transaction state
 */
export type TransactionState =
    | 'pending'     // 等待执行 | Waiting to execute
    | 'executing'   // 执行中 | Executing
    | 'committed'   // 已提交 | Committed
    | 'rolledback'  // 已回滚 | Rolled back
    | 'failed'      // 失败 | Failed

// =============================================================================
// 操作结果 | Operation Result
// =============================================================================

/**
 * @zh 操作结果
 * @en Operation result
 */
export interface OperationResult<T = unknown> {
    /**
     * @zh 是否成功
     * @en Whether succeeded
     */
    success: boolean

    /**
     * @zh 返回数据
     * @en Return data
     */
    data?: T

    /**
     * @zh 错误信息
     * @en Error message
     */
    error?: string

    /**
     * @zh 错误代码
     * @en Error code
     */
    errorCode?: string
}

/**
 * @zh 事务结果
 * @en Transaction result
 */
export interface TransactionResult<T = unknown> {
    /**
     * @zh 是否成功
     * @en Whether succeeded
     */
    success: boolean

    /**
     * @zh 事务 ID
     * @en Transaction ID
     */
    transactionId: string

    /**
     * @zh 操作结果列表
     * @en Operation results
     */
    results: OperationResult[]

    /**
     * @zh 最终数据
     * @en Final data
     */
    data?: T

    /**
     * @zh 错误信息
     * @en Error message
     */
    error?: string

    /**
     * @zh 执行时间（毫秒）
     * @en Execution time in milliseconds
     */
    duration: number
}

// =============================================================================
// 事务日志 | Transaction Log
// =============================================================================

/**
 * @zh 操作日志
 * @en Operation log
 */
export interface OperationLog {
    /**
     * @zh 操作名称
     * @en Operation name
     */
    name: string

    /**
     * @zh 操作数据
     * @en Operation data
     */
    data: unknown

    /**
     * @zh 操作状态
     * @en Operation state
     */
    state: 'pending' | 'executed' | 'compensated' | 'failed'

    /**
     * @zh 执行时间
     * @en Execution timestamp
     */
    executedAt?: number

    /**
     * @zh 补偿时间
     * @en Compensation timestamp
     */
    compensatedAt?: number

    /**
     * @zh 错误信息
     * @en Error message
     */
    error?: string
}

/**
 * @zh 事务日志
 * @en Transaction log
 */
export interface TransactionLog {
    /**
     * @zh 事务 ID
     * @en Transaction ID
     */
    id: string

    /**
     * @zh 事务状态
     * @en Transaction state
     */
    state: TransactionState

    /**
     * @zh 创建时间
     * @en Creation timestamp
     */
    createdAt: number

    /**
     * @zh 更新时间
     * @en Update timestamp
     */
    updatedAt: number

    /**
     * @zh 超时时间（毫秒）
     * @en Timeout in milliseconds
     */
    timeout: number

    /**
     * @zh 操作日志列表
     * @en Operation logs
     */
    operations: OperationLog[]

    /**
     * @zh 元数据
     * @en Metadata
     */
    metadata?: Record<string, unknown>

    /**
     * @zh 是否分布式事务
     * @en Whether distributed transaction
     */
    distributed?: boolean

    /**
     * @zh 参与的服务器列表
     * @en Participating servers
     */
    participants?: string[]
}

// =============================================================================
// 事务配置 | Transaction Configuration
// =============================================================================

/**
 * @zh 事务选项
 * @en Transaction options
 */
export interface TransactionOptions {
    /**
     * @zh 超时时间（毫秒），默认 30000
     * @en Timeout in milliseconds, default 30000
     */
    timeout?: number

    /**
     * @zh 是否分布式事务
     * @en Whether distributed transaction
     */
    distributed?: boolean

    /**
     * @zh 元数据
     * @en Metadata
     */
    metadata?: Record<string, unknown>

    /**
     * @zh 重试次数，默认 0
     * @en Retry count, default 0
     */
    retryCount?: number

    /**
     * @zh 重试间隔（毫秒），默认 1000
     * @en Retry interval in milliseconds, default 1000
     */
    retryInterval?: number
}

/**
 * @zh 事务管理器配置
 * @en Transaction manager configuration
 */
export interface TransactionManagerConfig {
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
     * @zh 服务器 ID（分布式用）
     * @en Server ID for distributed transactions
     */
    serverId?: string

    /**
     * @zh 是否自动恢复未完成事务
     * @en Whether to auto-recover pending transactions
     */
    autoRecover?: boolean
}

// =============================================================================
// 存储接口 | Storage Interface
// =============================================================================

/**
 * @zh 事务存储接口
 * @en Transaction storage interface
 */
export interface ITransactionStorage {
    /**
     * @zh 关闭存储连接
     * @en Close storage connection
     *
     * @zh 释放所有资源，关闭数据库连接
     * @en Release all resources, close database connections
     */
    close?(): Promise<void>

    /**
     * @zh 获取分布式锁
     * @en Acquire distributed lock
     *
     * @param key - @zh 锁的键 @en Lock key
     * @param ttl - @zh 锁的生存时间（毫秒） @en Lock TTL in milliseconds
     * @returns @zh 锁令牌，获取失败返回 null @en Lock token, null if failed
     */
    acquireLock(key: string, ttl: number): Promise<string | null>

    /**
     * @zh 释放分布式锁
     * @en Release distributed lock
     *
     * @param key - @zh 锁的键 @en Lock key
     * @param token - @zh 锁令牌 @en Lock token
     * @returns @zh 是否成功释放 @en Whether released successfully
     */
    releaseLock(key: string, token: string): Promise<boolean>

    /**
     * @zh 保存事务日志
     * @en Save transaction log
     */
    saveTransaction(tx: TransactionLog): Promise<void>

    /**
     * @zh 获取事务日志
     * @en Get transaction log
     */
    getTransaction(id: string): Promise<TransactionLog | null>

    /**
     * @zh 更新事务状态
     * @en Update transaction state
     */
    updateTransactionState(id: string, state: TransactionState): Promise<void>

    /**
     * @zh 更新操作状态
     * @en Update operation state
     */
    updateOperationState(
        transactionId: string,
        operationIndex: number,
        state: OperationLog['state'],
        error?: string
    ): Promise<void>

    /**
     * @zh 获取待恢复的事务列表
     * @en Get pending transactions for recovery
     */
    getPendingTransactions(serverId?: string): Promise<TransactionLog[]>

    /**
     * @zh 删除事务日志
     * @en Delete transaction log
     */
    deleteTransaction(id: string): Promise<void>

    /**
     * @zh 获取数据
     * @en Get data
     */
    get<T>(key: string): Promise<T | null>

    /**
     * @zh 设置数据
     * @en Set data
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>

    /**
     * @zh 删除数据
     * @en Delete data
     */
    delete(key: string): Promise<boolean>
}

// =============================================================================
// 操作接口 | Operation Interface
// =============================================================================

/**
 * @zh 事务操作接口
 * @en Transaction operation interface
 */
export interface ITransactionOperation<TData = unknown, TResult = unknown> {
    /**
     * @zh 操作名称
     * @en Operation name
     */
    readonly name: string

    /**
     * @zh 操作数据
     * @en Operation data
     */
    readonly data: TData

    /**
     * @zh 验证前置条件
     * @en Validate preconditions
     *
     * @param ctx - @zh 事务上下文 @en Transaction context
     * @returns @zh 是否验证通过 @en Whether validation passed
     */
    validate(ctx: ITransactionContext): Promise<boolean>

    /**
     * @zh 执行操作
     * @en Execute operation
     *
     * @param ctx - @zh 事务上下文 @en Transaction context
     * @returns @zh 操作结果 @en Operation result
     */
    execute(ctx: ITransactionContext): Promise<OperationResult<TResult>>

    /**
     * @zh 补偿操作（回滚）
     * @en Compensate operation (rollback)
     *
     * @param ctx - @zh 事务上下文 @en Transaction context
     */
    compensate(ctx: ITransactionContext): Promise<void>
}

// =============================================================================
// 事务上下文接口 | Transaction Context Interface
// =============================================================================

/**
 * @zh 事务上下文接口
 * @en Transaction context interface
 */
export interface ITransactionContext {
    /**
     * @zh 事务 ID
     * @en Transaction ID
     */
    readonly id: string

    /**
     * @zh 事务状态
     * @en Transaction state
     */
    readonly state: TransactionState

    /**
     * @zh 超时时间（毫秒）
     * @en Timeout in milliseconds
     */
    readonly timeout: number

    /**
     * @zh 操作列表
     * @en Operations
     */
    readonly operations: ReadonlyArray<ITransactionOperation>

    /**
     * @zh 存储实例
     * @en Storage instance
     */
    readonly storage: ITransactionStorage | null

    /**
     * @zh 元数据
     * @en Metadata
     */
    readonly metadata: Record<string, unknown>

    /**
     * @zh 添加操作
     * @en Add operation
     */
    addOperation<T extends ITransactionOperation>(operation: T): this

    /**
     * @zh 执行事务
     * @en Execute transaction
     */
    execute<T = unknown>(): Promise<TransactionResult<T>>

    /**
     * @zh 回滚事务
     * @en Rollback transaction
     */
    rollback(): Promise<void>

    /**
     * @zh 获取上下文数据
     * @en Get context data
     */
    get<T>(key: string): T | undefined

    /**
     * @zh 设置上下文数据
     * @en Set context data
     */
    set<T>(key: string, value: T): void
}
