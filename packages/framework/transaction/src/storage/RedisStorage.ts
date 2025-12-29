/**
 * @zh Redis 存储实现
 * @en Redis storage implementation
 *
 * @zh 支持分布式锁和快速缓存
 * @en Supports distributed locking and fast caching
 */

import type {
    ITransactionStorage,
    TransactionLog,
    TransactionState,
    OperationLog
} from '../core/types.js';

/**
 * @zh Redis 客户端接口（兼容 ioredis）
 * @en Redis client interface (compatible with ioredis)
 */
export interface RedisClient {
    get(key: string): Promise<string | null>
    set(key: string, value: string, ...args: string[]): Promise<string | null>
    del(...keys: string[]): Promise<number>
    eval(script: string, numkeys: number, ...args: (string | number)[]): Promise<unknown>
    hget(key: string, field: string): Promise<string | null>
    hset(key: string, ...args: (string | number)[]): Promise<number>
    hdel(key: string, ...fields: string[]): Promise<number>
    hgetall(key: string): Promise<Record<string, string>>
    keys(pattern: string): Promise<string[]>
    expire(key: string, seconds: number): Promise<number>
    quit(): Promise<string>
}

/**
 * @zh Redis 连接工厂
 * @en Redis connection factory
 */
export type RedisClientFactory = () => RedisClient | Promise<RedisClient>

/**
 * @zh Redis 存储配置
 * @en Redis storage configuration
 */
export interface RedisStorageConfig {
    /**
     * @zh Redis 客户端工厂（惰性连接）
     * @en Redis client factory (lazy connection)
     *
     * @example
     * ```typescript
     * import Redis from 'ioredis'
     * const storage = new RedisStorage({
     *     factory: () => new Redis('redis://localhost:6379')
     * })
     * ```
     */
    factory: RedisClientFactory

    /**
     * @zh 键前缀
     * @en Key prefix
     */
    prefix?: string

    /**
     * @zh 事务日志过期时间（秒）
     * @en Transaction log expiration time in seconds
     */
    transactionTTL?: number
}

const LOCK_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
`;

/**
 * @zh Redis 存储
 * @en Redis storage
 *
 * @zh 基于 Redis 的分布式事务存储，支持分布式锁和惰性连接
 * @en Redis-based distributed transaction storage with distributed locking and lazy connection
 *
 * @example
 * ```typescript
 * import Redis from 'ioredis'
 *
 * // 创建存储（惰性连接，首次操作时才连接）
 * const storage = new RedisStorage({
 *     factory: () => new Redis('redis://localhost:6379')
 * })
 *
 * // 使用后手动关闭
 * await storage.close()
 *
 * // 或使用 await using 自动关闭 (TypeScript 5.2+)
 * await using storage = new RedisStorage({
 *     factory: () => new Redis('redis://localhost:6379')
 * })
 * // 作用域结束时自动关闭
 * ```
 */
export class RedisStorage implements ITransactionStorage {
    private _client: RedisClient | null = null;
    private _factory: RedisClientFactory;
    private _prefix: string;
    private _transactionTTL: number;
    private _closed: boolean = false;

    constructor(config: RedisStorageConfig) {
        this._factory = config.factory;
        this._prefix = config.prefix ?? 'tx:';
        this._transactionTTL = config.transactionTTL ?? 86400; // 24 hours
    }

    // =========================================================================
    // 生命周期 | Lifecycle
    // =========================================================================

    /**
     * @zh 获取 Redis 客户端（惰性连接）
     * @en Get Redis client (lazy connection)
     */
    private async _getClient(): Promise<RedisClient> {
        if (this._closed) {
            throw new Error('RedisStorage is closed');
        }

        if (!this._client) {
            this._client = await this._factory();
        }

        return this._client;
    }

    /**
     * @zh 关闭存储连接
     * @en Close storage connection
     */
    async close(): Promise<void> {
        if (this._closed) return;

        this._closed = true;

        if (this._client) {
            await this._client.quit();
            this._client = null;
        }
    }

    /**
     * @zh 支持 await using 语法
     * @en Support await using syntax
     */
    async [Symbol.asyncDispose](): Promise<void> {
        await this.close();
    }

    // =========================================================================
    // 分布式锁 | Distributed Lock
    // =========================================================================

    async acquireLock(key: string, ttl: number): Promise<string | null> {
        const client = await this._getClient();
        const lockKey = `${this._prefix}lock:${key}`;
        const token = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const ttlSeconds = Math.ceil(ttl / 1000);

        const result = await client.set(lockKey, token, 'NX', 'EX', String(ttlSeconds));

        return result === 'OK' ? token : null;
    }

    async releaseLock(key: string, token: string): Promise<boolean> {
        const client = await this._getClient();
        const lockKey = `${this._prefix}lock:${key}`;

        const result = await client.eval(LOCK_SCRIPT, 1, lockKey, token);
        return result === 1;
    }

    // =========================================================================
    // 事务日志 | Transaction Log
    // =========================================================================

    async saveTransaction(tx: TransactionLog): Promise<void> {
        const client = await this._getClient();
        const key = `${this._prefix}tx:${tx.id}`;

        await client.set(key, JSON.stringify(tx));
        await client.expire(key, this._transactionTTL);

        if (tx.metadata?.serverId) {
            const serverKey = `${this._prefix}server:${tx.metadata.serverId}:txs`;
            await client.hset(serverKey, tx.id, String(tx.createdAt));
        }
    }

    async getTransaction(id: string): Promise<TransactionLog | null> {
        const client = await this._getClient();
        const key = `${this._prefix}tx:${id}`;
        const data = await client.get(key);

        return data ? JSON.parse(data) : null;
    }

    async updateTransactionState(id: string, state: TransactionState): Promise<void> {
        const tx = await this.getTransaction(id);
        if (tx) {
            tx.state = state;
            tx.updatedAt = Date.now();
            await this.saveTransaction(tx);
        }
    }

    async updateOperationState(
        transactionId: string,
        operationIndex: number,
        state: OperationLog['state'],
        error?: string
    ): Promise<void> {
        const tx = await this.getTransaction(transactionId);
        if (tx && tx.operations[operationIndex]) {
            tx.operations[operationIndex].state = state;
            if (error) {
                tx.operations[operationIndex].error = error;
            }
            if (state === 'executed') {
                tx.operations[operationIndex].executedAt = Date.now();
            } else if (state === 'compensated') {
                tx.operations[operationIndex].compensatedAt = Date.now();
            }
            tx.updatedAt = Date.now();
            await this.saveTransaction(tx);
        }
    }

    async getPendingTransactions(serverId?: string): Promise<TransactionLog[]> {
        const client = await this._getClient();
        const result: TransactionLog[] = [];

        if (serverId) {
            const serverKey = `${this._prefix}server:${serverId}:txs`;
            const txIds = await client.hgetall(serverKey);

            for (const id of Object.keys(txIds)) {
                const tx = await this.getTransaction(id);
                if (tx && (tx.state === 'pending' || tx.state === 'executing')) {
                    result.push(tx);
                }
            }
        } else {
            const pattern = `${this._prefix}tx:*`;
            const keys = await client.keys(pattern);

            for (const key of keys) {
                const data = await client.get(key);
                if (data) {
                    const tx: TransactionLog = JSON.parse(data);
                    if (tx.state === 'pending' || tx.state === 'executing') {
                        result.push(tx);
                    }
                }
            }
        }

        return result;
    }

    async deleteTransaction(id: string): Promise<void> {
        const client = await this._getClient();
        const key = `${this._prefix}tx:${id}`;
        const tx = await this.getTransaction(id);

        await client.del(key);

        if (tx?.metadata?.serverId) {
            const serverKey = `${this._prefix}server:${tx.metadata.serverId}:txs`;
            await client.hdel(serverKey, id);
        }
    }

    // =========================================================================
    // 数据操作 | Data Operations
    // =========================================================================

    async get<T>(key: string): Promise<T | null> {
        const client = await this._getClient();
        const fullKey = `${this._prefix}data:${key}`;
        const data = await client.get(fullKey);

        return data ? JSON.parse(data) : null;
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        const client = await this._getClient();
        const fullKey = `${this._prefix}data:${key}`;

        if (ttl) {
            const ttlSeconds = Math.ceil(ttl / 1000);
            await client.set(fullKey, JSON.stringify(value), 'EX', String(ttlSeconds));
        } else {
            await client.set(fullKey, JSON.stringify(value));
        }
    }

    async delete(key: string): Promise<boolean> {
        const client = await this._getClient();
        const fullKey = `${this._prefix}data:${key}`;
        const result = await client.del(fullKey);
        return result > 0;
    }
}

/**
 * @zh 创建 Redis 存储
 * @en Create Redis storage
 */
export function createRedisStorage(config: RedisStorageConfig): RedisStorage {
    return new RedisStorage(config);
}
