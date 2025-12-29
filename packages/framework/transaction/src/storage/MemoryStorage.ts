/**
 * @zh 内存存储实现
 * @en Memory storage implementation
 *
 * @zh 用于开发和测试环境，不支持分布式
 * @en For development and testing, does not support distributed scenarios
 */

import type {
    ITransactionStorage,
    TransactionLog,
    TransactionState,
    OperationLog,
} from '../core/types.js'

/**
 * @zh 内存存储配置
 * @en Memory storage configuration
 */
export interface MemoryStorageConfig {
    /**
     * @zh 最大事务日志数量
     * @en Maximum transaction log count
     */
    maxTransactions?: number
}

/**
 * @zh 内存存储
 * @en Memory storage
 *
 * @zh 适用于单机开发和测试，数据仅保存在内存中
 * @en Suitable for single-machine development and testing, data is stored in memory only
 */
export class MemoryStorage implements ITransactionStorage {
    private _transactions: Map<string, TransactionLog> = new Map()
    private _data: Map<string, { value: unknown; expireAt?: number }> = new Map()
    private _locks: Map<string, { token: string; expireAt: number }> = new Map()
    private _maxTransactions: number

    constructor(config: MemoryStorageConfig = {}) {
        this._maxTransactions = config.maxTransactions ?? 1000
    }

    // =========================================================================
    // 分布式锁 | Distributed Lock
    // =========================================================================

    async acquireLock(key: string, ttl: number): Promise<string | null> {
        this._cleanExpiredLocks()

        const existing = this._locks.get(key)
        if (existing && existing.expireAt > Date.now()) {
            return null
        }

        const token = `lock_${Date.now()}_${Math.random().toString(36).substring(2)}`
        this._locks.set(key, {
            token,
            expireAt: Date.now() + ttl,
        })

        return token
    }

    async releaseLock(key: string, token: string): Promise<boolean> {
        const lock = this._locks.get(key)
        if (!lock || lock.token !== token) {
            return false
        }

        this._locks.delete(key)
        return true
    }

    // =========================================================================
    // 事务日志 | Transaction Log
    // =========================================================================

    async saveTransaction(tx: TransactionLog): Promise<void> {
        if (this._transactions.size >= this._maxTransactions) {
            this._cleanOldTransactions()
        }

        this._transactions.set(tx.id, { ...tx })
    }

    async getTransaction(id: string): Promise<TransactionLog | null> {
        const tx = this._transactions.get(id)
        return tx ? { ...tx } : null
    }

    async updateTransactionState(id: string, state: TransactionState): Promise<void> {
        const tx = this._transactions.get(id)
        if (tx) {
            tx.state = state
            tx.updatedAt = Date.now()
        }
    }

    async updateOperationState(
        transactionId: string,
        operationIndex: number,
        state: OperationLog['state'],
        error?: string
    ): Promise<void> {
        const tx = this._transactions.get(transactionId)
        if (tx && tx.operations[operationIndex]) {
            tx.operations[operationIndex].state = state
            if (error) {
                tx.operations[operationIndex].error = error
            }
            if (state === 'executed') {
                tx.operations[operationIndex].executedAt = Date.now()
            } else if (state === 'compensated') {
                tx.operations[operationIndex].compensatedAt = Date.now()
            }
            tx.updatedAt = Date.now()
        }
    }

    async getPendingTransactions(serverId?: string): Promise<TransactionLog[]> {
        const result: TransactionLog[] = []

        for (const tx of this._transactions.values()) {
            if (tx.state === 'pending' || tx.state === 'executing') {
                if (!serverId || tx.metadata?.serverId === serverId) {
                    result.push({ ...tx })
                }
            }
        }

        return result
    }

    async deleteTransaction(id: string): Promise<void> {
        this._transactions.delete(id)
    }

    // =========================================================================
    // 数据操作 | Data Operations
    // =========================================================================

    async get<T>(key: string): Promise<T | null> {
        this._cleanExpiredData()

        const entry = this._data.get(key)
        if (!entry) return null

        if (entry.expireAt && entry.expireAt < Date.now()) {
            this._data.delete(key)
            return null
        }

        return entry.value as T
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        this._data.set(key, {
            value,
            expireAt: ttl ? Date.now() + ttl : undefined,
        })
    }

    async delete(key: string): Promise<boolean> {
        return this._data.delete(key)
    }

    // =========================================================================
    // 辅助方法 | Helper methods
    // =========================================================================

    /**
     * @zh 清空所有数据（测试用）
     * @en Clear all data (for testing)
     */
    clear(): void {
        this._transactions.clear()
        this._data.clear()
        this._locks.clear()
    }

    /**
     * @zh 获取事务数量
     * @en Get transaction count
     */
    get transactionCount(): number {
        return this._transactions.size
    }

    private _cleanExpiredLocks(): void {
        const now = Date.now()
        for (const [key, lock] of this._locks) {
            if (lock.expireAt < now) {
                this._locks.delete(key)
            }
        }
    }

    private _cleanExpiredData(): void {
        const now = Date.now()
        for (const [key, entry] of this._data) {
            if (entry.expireAt && entry.expireAt < now) {
                this._data.delete(key)
            }
        }
    }

    private _cleanOldTransactions(): void {
        const sorted = Array.from(this._transactions.entries())
            .sort((a, b) => a[1].createdAt - b[1].createdAt)

        const toRemove = sorted
            .slice(0, Math.floor(this._maxTransactions * 0.2))
            .filter(([_, tx]) => tx.state === 'committed' || tx.state === 'rolledback')

        for (const [id] of toRemove) {
            this._transactions.delete(id)
        }
    }
}

/**
 * @zh 创建内存存储
 * @en Create memory storage
 */
export function createMemoryStorage(config: MemoryStorageConfig = {}): MemoryStorage {
    return new MemoryStorage(config)
}
