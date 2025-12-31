/**
 * @zh 数据库驱动服务令牌
 * @en Database driver service tokens
 *
 * @zh 用于依赖注入的服务令牌定义
 * @en Service token definitions for dependency injection
 */

import type { IMongoConnection } from './drivers/MongoConnection.js'
import type { IRedisConnection } from './drivers/RedisConnection.js'

// =============================================================================
// 服务令牌类型 | Service Token Type
// =============================================================================

/**
 * @zh 服务令牌
 * @en Service token
 */
export interface ServiceToken<T> {
    readonly id: string
    readonly _type?: T
}

/**
 * @zh 创建服务令牌
 * @en Create service token
 */
export function createServiceToken<T>(id: string): ServiceToken<T> {
    return { id }
}

// =============================================================================
// 连接令牌 | Connection Tokens
// =============================================================================

/**
 * @zh MongoDB 连接令牌
 * @en MongoDB connection token
 *
 * @example
 * ```typescript
 * // 注册
 * services.register(MongoConnectionToken, mongoConnection)
 *
 * // 获取
 * const mongo = services.get(MongoConnectionToken)
 * ```
 */
export const MongoConnectionToken = createServiceToken<IMongoConnection>('database:mongo')

/**
 * @zh Redis 连接令牌
 * @en Redis connection token
 */
export const RedisConnectionToken = createServiceToken<IRedisConnection>('database:redis')
