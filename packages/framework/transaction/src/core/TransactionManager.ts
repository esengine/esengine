/**
 * @zh 事务管理器
 * @en Transaction manager
 */

import type {
    ITransactionContext,
    ITransactionStorage,
    TransactionManagerConfig,
    TransactionOptions,
    TransactionLog,
    TransactionResult
} from './types.js';
import { TransactionContext } from './TransactionContext.js';

/**
 * @zh 事务管理器
 * @en Transaction manager
 *
 * @zh 管理事务的创建、执行和恢复
 * @en Manages transaction creation, execution, and recovery
 *
 * @example
 * ```typescript
 * const manager = new TransactionManager({
 *     storage: new RedisStorage({ url: 'redis://localhost:6379' }),
 *     defaultTimeout: 10000,
 * })
 *
 * const tx = manager.begin({ timeout: 5000 })
 * tx.addOperation(new DeductCurrency({ ... }))
 * tx.addOperation(new AddItem({ ... }))
 *
 * const result = await tx.execute()
 * ```
 */
export class TransactionManager {
    private _storage: ITransactionStorage | null;
    private _defaultTimeout: number;
    private _serverId: string;
    private _autoRecover: boolean;
    private _activeTransactions: Map<string, ITransactionContext> = new Map();

    constructor(config: TransactionManagerConfig = {}) {
        this._storage = config.storage ?? null;
        this._defaultTimeout = config.defaultTimeout ?? 30000;
        this._serverId = config.serverId ?? this._generateServerId();
        this._autoRecover = config.autoRecover ?? true;
    }

    // =========================================================================
    // 只读属性 | Readonly properties
    // =========================================================================

    /**
     * @zh 服务器 ID
     * @en Server ID
     */
    get serverId(): string {
        return this._serverId;
    }

    /**
     * @zh 存储实例
     * @en Storage instance
     */
    get storage(): ITransactionStorage | null {
        return this._storage;
    }

    /**
     * @zh 活跃事务数量
     * @en Active transaction count
     */
    get activeCount(): number {
        return this._activeTransactions.size;
    }

    // =========================================================================
    // 公共方法 | Public methods
    // =========================================================================

    /**
     * @zh 开始新事务
     * @en Begin new transaction
     *
     * @param options - @zh 事务选项 @en Transaction options
     * @returns @zh 事务上下文 @en Transaction context
     */
    begin(options: TransactionOptions = {}): ITransactionContext {
        const ctx = new TransactionContext({
            timeout: options.timeout ?? this._defaultTimeout,
            storage: this._storage ?? undefined,
            metadata: {
                ...options.metadata,
                serverId: this._serverId
            },
            distributed: options.distributed
        });

        this._activeTransactions.set(ctx.id, ctx);

        return ctx;
    }

    /**
     * @zh 执行事务（便捷方法）
     * @en Execute transaction (convenience method)
     *
     * @param builder - @zh 事务构建函数 @en Transaction builder function
     * @param options - @zh 事务选项 @en Transaction options
     * @returns @zh 事务结果 @en Transaction result
     */
    async run<T = unknown>(
        builder: (ctx: ITransactionContext) => void | Promise<void>,
        options: TransactionOptions = {}
    ): Promise<TransactionResult<T>> {
        const ctx = this.begin(options);

        try {
            await builder(ctx);
            const result = await ctx.execute<T>();
            return result;
        } finally {
            this._activeTransactions.delete(ctx.id);
        }
    }

    /**
     * @zh 获取活跃事务
     * @en Get active transaction
     */
    getTransaction(id: string): ITransactionContext | undefined {
        return this._activeTransactions.get(id);
    }

    /**
     * @zh 恢复未完成的事务
     * @en Recover pending transactions
     */
    async recover(): Promise<number> {
        if (!this._storage) return 0;

        const pendingTransactions = await this._storage.getPendingTransactions(this._serverId);
        let recoveredCount = 0;

        for (const log of pendingTransactions) {
            try {
                await this._recoverTransaction(log);
                recoveredCount++;
            } catch (error) {
                console.error(`Failed to recover transaction ${log.id}:`, error);
            }
        }

        return recoveredCount;
    }

    /**
     * @zh 获取分布式锁
     * @en Acquire distributed lock
     */
    async acquireLock(key: string, ttl: number = 10000): Promise<string | null> {
        if (!this._storage) return null;
        return this._storage.acquireLock(key, ttl);
    }

    /**
     * @zh 释放分布式锁
     * @en Release distributed lock
     */
    async releaseLock(key: string, token: string): Promise<boolean> {
        if (!this._storage) return false;
        return this._storage.releaseLock(key, token);
    }

    /**
     * @zh 使用分布式锁执行
     * @en Execute with distributed lock
     */
    async withLock<T>(
        key: string,
        fn: () => Promise<T>,
        ttl: number = 10000
    ): Promise<T> {
        const token = await this.acquireLock(key, ttl);
        if (!token) {
            throw new Error(`Failed to acquire lock for key: ${key}`);
        }

        try {
            return await fn();
        } finally {
            await this.releaseLock(key, token);
        }
    }

    /**
     * @zh 清理已完成的事务日志
     * @en Clean up completed transaction logs
     */
    async cleanup(beforeTimestamp?: number): Promise<number> {
        if (!this._storage) return 0;

        const timestamp = beforeTimestamp ?? Date.now() - 24 * 60 * 60 * 1000; // 默认清理24小时前

        const pendingTransactions = await this._storage.getPendingTransactions();
        let cleanedCount = 0;

        for (const log of pendingTransactions) {
            if (
                log.createdAt < timestamp &&
                (log.state === 'committed' || log.state === 'rolledback')
            ) {
                await this._storage.deleteTransaction(log.id);
                cleanedCount++;
            }
        }

        return cleanedCount;
    }

    // =========================================================================
    // 私有方法 | Private methods
    // =========================================================================

    private _generateServerId(): string {
        return `server_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    }

    private async _recoverTransaction(log: TransactionLog): Promise<void> {
        if (log.state === 'executing') {
            const executedOps = log.operations.filter((op) => op.state === 'executed');

            if (executedOps.length > 0 && this._storage) {
                for (let i = executedOps.length - 1; i >= 0; i--) {
                    await this._storage.updateOperationState(log.id, i, 'compensated');
                }
                await this._storage.updateTransactionState(log.id, 'rolledback');
            } else {
                await this._storage?.updateTransactionState(log.id, 'failed');
            }
        }
    }
}

/**
 * @zh 创建事务管理器
 * @en Create transaction manager
 */
export function createTransactionManager(
    config: TransactionManagerConfig = {}
): TransactionManager {
    return new TransactionManager(config);
}
