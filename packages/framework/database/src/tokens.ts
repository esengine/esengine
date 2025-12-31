/**
 * @zh 数据库服务令牌
 * @en Database service tokens
 */

import type { ServiceToken, createServiceToken as createToken } from '@esengine/database-drivers'
import type { UserRepository } from './UserRepository.js'

// Re-export from database-drivers for convenience
export { MongoConnectionToken, RedisConnectionToken, createServiceToken } from '@esengine/database-drivers'
export type { ServiceToken } from '@esengine/database-drivers'

/**
 * @zh 用户仓库令牌
 * @en User repository token
 */
export const UserRepositoryToken: ServiceToken<UserRepository> = { id: 'database:userRepository' }
