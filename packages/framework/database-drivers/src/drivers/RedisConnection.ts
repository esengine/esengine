/**
 * @zh Redis 连接驱动
 * @en Redis connection driver
 *
 * @zh 提供 Redis 数据库的连接管理、自动重连和事件通知
 * @en Provides Redis connection management, auto-reconnect, and event notification
 */

import type { Redis as RedisClientType, RedisOptions } from 'ioredis'
import { randomUUID } from 'crypto'
import {
    ConnectionError,
    type ConnectionEvent,
    type ConnectionEventListener,
    type ConnectionEventType,
    type ConnectionState,
    type IEventableConnection,
    type RedisConnectionConfig
} from '../types.js'

/**
 * @zh Redis 连接接口
 * @en Redis connection interface
 */
export interface IRedisConnection extends IEventableConnection {
    /**
     * @zh 获取原生客户端
     * @en Get native client
     */
    getClient(): RedisClientType

    /**
     * @zh 获取键值
     * @en Get value by key
     */
    get(key: string): Promise<string | null>

    /**
     * @zh 设置键值
     * @en Set key value
     */
    set(key: string, value: string, ttl?: number): Promise<void>

    /**
     * @zh 删除键
     * @en Delete key
     */
    del(key: string): Promise<boolean>

    /**
     * @zh 检查键是否存在
     * @en Check if key exists
     */
    exists(key: string): Promise<boolean>
}

/**
 * @zh Redis 连接实现
 * @en Redis connection implementation
 *
 * @example
 * ```typescript
 * const redis = new RedisConnection({
 *     host: 'localhost',
 *     port: 6379,
 *     keyPrefix: 'game:',
 * })
 *
 * await redis.connect()
 *
 * await redis.set('player:1:score', '100', 3600)
 * const score = await redis.get('player:1:score')
 *
 * await redis.disconnect()
 * ```
 */
export class RedisConnection implements IRedisConnection {
    readonly id: string
    private _state: ConnectionState = 'disconnected'
    private _client: RedisClientType | null = null
    private _config: RedisConnectionConfig
    private _listeners = new Map<ConnectionEventType, Set<ConnectionEventListener>>()

    constructor(config: RedisConnectionConfig) {
        this.id = randomUUID()
        this._config = {
            host: 'localhost',
            port: 6379,
            autoReconnect: true,
            ...config
        }
    }

    // =========================================================================
    // 状态 | State
    // =========================================================================

    get state(): ConnectionState {
        return this._state
    }

    isConnected(): boolean {
        return this._state === 'connected' && this._client !== null
    }

    // =========================================================================
    // 连接管理 | Connection Management
    // =========================================================================

    async connect(): Promise<void> {
        if (this._state === 'connected') {
            return
        }

        if (this._state === 'connecting') {
            throw new ConnectionError('Connection already in progress')
        }

        this._state = 'connecting'

        try {
            const Redis = (await import('ioredis')).default

            const options: RedisOptions = {
                host: this._config.host,
                port: this._config.port,
                password: this._config.password,
                db: this._config.db,
                keyPrefix: this._config.keyPrefix,
                retryStrategy: this._config.autoReconnect
                    ? (times) => Math.min(times * 100, 3000)
                    : () => null,
                lazyConnect: true
            }

            if (this._config.url) {
                this._client = new Redis(this._config.url, options)
            } else {
                this._client = new Redis(options)
            }

            this._setupClientEvents()
            await this._client.connect()

            this._state = 'connected'
            this._emit('connected')
        } catch (error) {
            this._state = 'error'
            const connError = new ConnectionError(
                `Failed to connect to Redis: ${(error as Error).message}`,
                'CONNECTION_FAILED',
                error as Error
            )
            this._emit('error', connError)
            throw connError
        }
    }

    async disconnect(): Promise<void> {
        if (this._state === 'disconnected') {
            return
        }

        this._state = 'disconnecting'

        try {
            if (this._client) {
                await this._client.quit()
                this._client = null
            }

            this._state = 'disconnected'
            this._emit('disconnected')
        } catch (error) {
            this._state = 'error'
            throw new ConnectionError(
                `Failed to disconnect: ${(error as Error).message}`,
                'CONNECTION_FAILED',
                error as Error
            )
        }
    }

    async ping(): Promise<boolean> {
        if (!this._client) {
            return false
        }

        try {
            const result = await this._client.ping()
            return result === 'PONG'
        } catch {
            return false
        }
    }

    // =========================================================================
    // 数据操作 | Data Operations
    // =========================================================================

    getClient(): RedisClientType {
        if (!this._client) {
            throw new ConnectionError('Not connected to Redis', 'CONNECTION_CLOSED')
        }
        return this._client
    }

    async get(key: string): Promise<string | null> {
        return this.getClient().get(key)
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        const client = this.getClient()
        if (ttl) {
            await client.setex(key, ttl, value)
        } else {
            await client.set(key, value)
        }
    }

    async del(key: string): Promise<boolean> {
        const result = await this.getClient().del(key)
        return result > 0
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.getClient().exists(key)
        return result > 0
    }

    // =========================================================================
    // 事件 | Events
    // =========================================================================

    on(event: ConnectionEventType, listener: ConnectionEventListener): void {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set())
        }
        this._listeners.get(event)!.add(listener)
    }

    off(event: ConnectionEventType, listener: ConnectionEventListener): void {
        this._listeners.get(event)?.delete(listener)
    }

    once(event: ConnectionEventType, listener: ConnectionEventListener): void {
        const wrapper: ConnectionEventListener = (e) => {
            this.off(event, wrapper)
            listener(e)
        }
        this.on(event, wrapper)
    }

    private _emit(type: ConnectionEventType, error?: Error): void {
        const event: ConnectionEvent = {
            type,
            connectionId: this.id,
            timestamp: Date.now(),
            error
        }

        const listeners = this._listeners.get(type)
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(event)
                } catch {
                    // Ignore listener errors
                }
            }
        }
    }

    private _setupClientEvents(): void {
        if (!this._client) return

        this._client.on('close', () => {
            if (this._state === 'connected') {
                this._state = 'disconnected'
                this._emit('disconnected')
            }
        })

        this._client.on('error', (error) => {
            this._emit('error', error)
        })

        this._client.on('reconnecting', () => {
            this._emit('reconnecting')
        })
    }
}

/**
 * @zh 创建 Redis 连接
 * @en Create Redis connection
 */
export function createRedisConnection(config: RedisConnectionConfig): RedisConnection {
    return new RedisConnection(config)
}
