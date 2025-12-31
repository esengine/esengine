/**
 * @zh @esengine/database-drivers 数据库连接驱动
 * @en @esengine/database-drivers Database Connection Drivers
 *
 * @zh 提供 MongoDB、Redis 等数据库的连接管理，支持连接池、自动重连和事件通知
 * @en Provides connection management for MongoDB, Redis, etc. with pooling, auto-reconnect, and events
 *
 * @example
 * ```typescript
 * import {
 *     createMongoConnection,
 *     createRedisConnection,
 *     MongoConnectionToken,
 *     RedisConnectionToken,
 * } from '@esengine/database-drivers'
 *
 * // 创建 MongoDB 连接
 * const mongo = createMongoConnection({
 *     uri: 'mongodb://localhost:27017',
 *     database: 'game',
 *     pool: { minSize: 5, maxSize: 20 },
 *     autoReconnect: true,
 * })
 *
 * mongo.on('connected', () => console.log('MongoDB connected'))
 * mongo.on('error', (e) => console.error('Error:', e.error))
 *
 * await mongo.connect()
 *
 * // 直接使用
 * const users = mongo.collection('users')
 * await users.insertOne({ name: 'test' })
 *
 * // 或注册到服务容器供其他模块使用
 * services.register(MongoConnectionToken, mongo)
 *
 * // 创建 Redis 连接
 * const redis = createRedisConnection({
 *     host: 'localhost',
 *     port: 6379,
 *     keyPrefix: 'game:',
 * })
 *
 * await redis.connect()
 * await redis.set('session:123', 'data', 3600)
 *
 * // 断开连接
 * await mongo.disconnect()
 * await redis.disconnect()
 * ```
 */

// =============================================================================
// Types | 类型
// =============================================================================

export type {
    ConnectionState,
    IConnection,
    IEventableConnection,
    ConnectionEventType,
    ConnectionEventListener,
    ConnectionEvent,
    PoolConfig,
    MongoConnectionConfig,
    RedisConnectionConfig,
    DatabaseErrorCode
} from './types.js'

export {
    DatabaseError,
    ConnectionError,
    DuplicateKeyError
} from './types.js'

// =============================================================================
// Drivers | 驱动
// =============================================================================

export {
    MongoConnection,
    createMongoConnection,
    type IMongoConnection
} from './drivers/index.js'

export {
    RedisConnection,
    createRedisConnection,
    type IRedisConnection
} from './drivers/index.js'

// =============================================================================
// Interfaces | 接口
// =============================================================================

export type {
    IMongoCollection,
    IMongoDatabase,
    InsertOneResult,
    InsertManyResult,
    UpdateResult,
    DeleteResult,
    FindOptions,
    FindOneAndUpdateOptions,
    IndexOptions
} from './drivers/index.js'

// =============================================================================
// Tokens | 服务令牌
// =============================================================================

export {
    MongoConnectionToken,
    RedisConnectionToken,
    createServiceToken,
    type ServiceToken
} from './tokens.js'
