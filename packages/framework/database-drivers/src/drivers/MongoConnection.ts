/**
 * @zh MongoDB 连接驱动
 * @en MongoDB connection driver
 *
 * @zh 提供 MongoDB 数据库的连接管理、自动重连和事件通知
 * @en Provides MongoDB connection management, auto-reconnect, and event notification
 */

import type { Db, MongoClient as MongoClientType, MongoClientOptions } from 'mongodb'
import { randomUUID } from 'crypto'
import {
    ConnectionError,
    type ConnectionEvent,
    type ConnectionEventListener,
    type ConnectionEventType,
    type ConnectionState,
    type IEventableConnection,
    type MongoConnectionConfig
} from '../types.js'
import type { IMongoCollection, IMongoDatabase } from '../interfaces/IMongoCollection.js'
import { MongoDatabaseAdapter } from '../adapters/MongoCollectionAdapter.js'

/**
 * @zh MongoDB 连接接口
 * @en MongoDB connection interface
 */
export interface IMongoConnection extends IEventableConnection {
    /**
     * @zh 获取数据库接口
     * @en Get database interface
     */
    getDatabase(): IMongoDatabase

    /**
     * @zh 获取原生客户端（高级用法）
     * @en Get native client (advanced usage)
     */
    getNativeClient(): MongoClientType

    /**
     * @zh 获取原生数据库（高级用法）
     * @en Get native database (advanced usage)
     */
    getNativeDatabase(): Db

    /**
     * @zh 获取集合
     * @en Get collection
     */
    collection<T extends object = object>(name: string): IMongoCollection<T>
}

/**
 * @zh MongoDB 连接实现
 * @en MongoDB connection implementation
 *
 * @example
 * ```typescript
 * const mongo = new MongoConnection({
 *     uri: 'mongodb://localhost:27017',
 *     database: 'game',
 *     autoReconnect: true,
 * })
 *
 * mongo.on('connected', () => console.log('Connected!'))
 * mongo.on('error', (e) => console.error('Error:', e.error))
 *
 * await mongo.connect()
 *
 * const users = mongo.collection('users')
 * await users.insertOne({ name: 'test' })
 *
 * await mongo.disconnect()
 * ```
 */
export class MongoConnection implements IMongoConnection {
    readonly id: string
    private _state: ConnectionState = 'disconnected'
    private _client: MongoClientType | null = null
    private _db: Db | null = null
    private _config: MongoConnectionConfig
    private _listeners = new Map<ConnectionEventType, Set<ConnectionEventListener>>()
    private _reconnectAttempts = 0
    private _reconnectTimer: ReturnType<typeof setTimeout> | null = null

    constructor(config: MongoConnectionConfig) {
        this.id = randomUUID()
        this._config = {
            autoReconnect: true,
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
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
            const { MongoClient } = await import('mongodb')

            const options: MongoClientOptions = {}
            if (this._config.pool) {
                if (this._config.pool.minSize) {
                    options.minPoolSize = this._config.pool.minSize
                }
                if (this._config.pool.maxSize) {
                    options.maxPoolSize = this._config.pool.maxSize
                }
                if (this._config.pool.acquireTimeout) {
                    options.waitQueueTimeoutMS = this._config.pool.acquireTimeout
                }
                if (this._config.pool.maxLifetime) {
                    options.maxIdleTimeMS = this._config.pool.maxLifetime
                }
            }

            this._client = new MongoClient(this._config.uri, options)
            await this._client.connect()
            this._db = this._client.db(this._config.database)

            this._state = 'connected'
            this._reconnectAttempts = 0
            this._emit('connected')

            this._setupClientEvents()
        } catch (error) {
            this._state = 'error'
            const connError = new ConnectionError(
                `Failed to connect to MongoDB: ${(error as Error).message}`,
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

        this._clearReconnectTimer()
        this._state = 'disconnecting'

        try {
            if (this._client) {
                await this._client.close()
                this._client = null
                this._db = null
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
        if (!this._db) {
            return false
        }

        try {
            await this._db.command({ ping: 1 })
            return true
        } catch {
            return false
        }
    }

    // =========================================================================
    // 数据库访问 | Database Access
    // =========================================================================

    private _dbAdapter: MongoDatabaseAdapter | null = null

    getDatabase(): IMongoDatabase {
        if (!this._db) {
            throw new ConnectionError('Not connected to database', 'CONNECTION_CLOSED')
        }
        if (!this._dbAdapter) {
            this._dbAdapter = new MongoDatabaseAdapter(this._db)
        }
        return this._dbAdapter
    }

    getNativeDatabase(): Db {
        if (!this._db) {
            throw new ConnectionError('Not connected to database', 'CONNECTION_CLOSED')
        }
        return this._db
    }

    getNativeClient(): MongoClientType {
        if (!this._client) {
            throw new ConnectionError('Not connected to database', 'CONNECTION_CLOSED')
        }
        return this._client
    }

    collection<T extends object = object>(name: string): IMongoCollection<T> {
        return this.getDatabase().collection<T>(name)
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

    // =========================================================================
    // 内部方法 | Internal Methods
    // =========================================================================

    private _setupClientEvents(): void {
        if (!this._client) return

        this._client.on('close', () => {
            if (this._state === 'connected') {
                this._state = 'disconnected'
                this._emit('disconnected')
                this._scheduleReconnect()
            }
        })

        this._client.on('error', (error) => {
            this._emit('error', error)
        })
    }

    private _scheduleReconnect(): void {
        if (!this._config.autoReconnect) return
        if (this._reconnectAttempts >= (this._config.maxReconnectAttempts ?? 10)) {
            return
        }

        this._clearReconnectTimer()
        this._emit('reconnecting')

        this._reconnectTimer = setTimeout(async () => {
            this._reconnectAttempts++
            try {
                await this.connect()
                this._emit('reconnected')
            } catch {
                this._scheduleReconnect()
            }
        }, this._config.reconnectInterval ?? 5000)
    }

    private _clearReconnectTimer(): void {
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer)
            this._reconnectTimer = null
        }
    }
}

/**
 * @zh 创建 MongoDB 连接
 * @en Create MongoDB connection
 *
 * @example
 * ```typescript
 * const mongo = createMongoConnection({
 *     uri: process.env.MONGODB_URI!,
 *     database: 'game',
 * })
 * await mongo.connect()
 * ```
 */
export function createMongoConnection(config: MongoConnectionConfig): MongoConnection {
    return new MongoConnection(config)
}
