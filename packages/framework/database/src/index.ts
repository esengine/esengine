/**
 * @zh @esengine/database 数据库操作层
 * @en @esengine/database Database Operations Layer
 *
 * @zh 提供通用的数据库 CRUD 操作、仓库模式、用户管理等功能
 * @en Provides generic database CRUD operations, repository pattern, user management
 *
 * @example
 * ```typescript
 * import { createMongoConnection } from '@esengine/database-drivers'
 * import {
 *     Repository,
 *     UserRepository,
 *     createUserRepository,
 *     hashPassword,
 *     verifyPassword,
 * } from '@esengine/database'
 *
 * // 1. 创建连接（来自 database-drivers）
 * const mongo = createMongoConnection({
 *     uri: 'mongodb://localhost:27017',
 *     database: 'game',
 * })
 * await mongo.connect()
 *
 * // 2. 使用用户仓库
 * const userRepo = createUserRepository(mongo)
 *
 * // 注册
 * const user = await userRepo.register({
 *     username: 'player1',
 *     password: 'securePassword123',
 * })
 *
 * // 登录
 * const authUser = await userRepo.authenticate('player1', 'securePassword123')
 *
 * // 3. 自定义仓库
 * interface Player extends BaseEntity {
 *     name: string
 *     score: number
 *     level: number
 * }
 *
 * class PlayerRepository extends Repository<Player> {
 *     constructor(connection: IMongoConnection) {
 *         super(connection, 'players')
 *     }
 *
 *     async findTopPlayers(limit = 10): Promise<Player[]> {
 *         return this.findMany({
 *             sort: { score: 'desc' },
 *             limit,
 *         })
 *     }
 *
 *     async addScore(playerId: string, points: number): Promise<Player | null> {
 *         const player = await this.findById(playerId)
 *         if (!player) return null
 *         return this.update(playerId, { score: player.score + points })
 *     }
 * }
 *
 * // 4. 分页查询
 * const result = await userRepo.findPaginated(
 *     { page: 1, pageSize: 20 },
 *     { where: { isActive: true }, sort: { createdAt: 'desc' } }
 * )
 * console.log(`第 ${result.page}/${result.totalPages} 页，共 ${result.total} 条`)
 * ```
 */

// =============================================================================
// Types | 类型
// =============================================================================

export type {
    BaseEntity,
    SoftDeleteEntity,
    ComparisonOperators,
    WhereCondition,
    SortDirection,
    SortCondition,
    QueryOptions,
    PaginationParams,
    PaginatedResult,
    IRepository,
    UserEntity
} from './types.js'

// =============================================================================
// Repository | 仓库
// =============================================================================

export { Repository, createRepository } from './Repository.js'

// =============================================================================
// User Repository | 用户仓库
// =============================================================================

export {
    UserRepository,
    createUserRepository,
    type CreateUserParams,
    type SafeUser
} from './UserRepository.js'

// =============================================================================
// Password | 密码工具
// =============================================================================

export {
    hashPassword,
    verifyPassword,
    checkPasswordStrength,
    type PasswordHashConfig,
    type PasswordStrength,
    type PasswordStrengthResult
} from './password.js'

// =============================================================================
// Tokens | 服务令牌
// =============================================================================

export {
    MongoConnectionToken,
    RedisConnectionToken,
    UserRepositoryToken,
    createServiceToken,
    type ServiceToken
} from './tokens.js'

// =============================================================================
// Re-exports from database-drivers | 从 database-drivers 重新导出
// =============================================================================

export type {
    IMongoConnection,
    IRedisConnection,
    MongoConnectionConfig,
    RedisConnectionConfig,
    ConnectionState,
    DatabaseErrorCode
} from '@esengine/database-drivers'

export {
    createMongoConnection,
    createRedisConnection,
    DatabaseError,
    ConnectionError,
    DuplicateKeyError
} from '@esengine/database-drivers'
