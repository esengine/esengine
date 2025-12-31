/**
 * @zh 用户仓库
 * @en User repository
 *
 * @zh 提供用户管理的常用方法，包括注册、登录、角色管理等
 * @en Provides common user management methods including registration, login, role management
 */

import type { IMongoConnection } from '@esengine/database-drivers'
import { Repository } from './Repository.js'
import { hashPassword, verifyPassword } from './password.js'
import type { UserEntity } from './types.js'

/**
 * @zh 创建用户参数
 * @en Create user parameters
 */
export interface CreateUserParams {
    /**
     * @zh 用户名
     * @en Username
     */
    username: string

    /**
     * @zh 明文密码
     * @en Plain text password
     */
    password: string

    /**
     * @zh 邮箱
     * @en Email
     */
    email?: string

    /**
     * @zh 角色列表
     * @en Role list
     */
    roles?: string[]

    /**
     * @zh 额外数据
     * @en Additional metadata
     */
    metadata?: Record<string, unknown>
}

/**
 * @zh 用户信息（不含密码）
 * @en User info (without password)
 */
export type SafeUser = Omit<UserEntity, 'passwordHash'>

/**
 * @zh 用户仓库
 * @en User repository
 *
 * @example
 * ```typescript
 * const mongo = createMongoConnection({ uri: '...', database: 'game' })
 * await mongo.connect()
 *
 * const userRepo = new UserRepository(mongo)
 *
 * // 注册用户
 * const user = await userRepo.register({
 *     username: 'player1',
 *     password: 'securePassword123',
 *     email: 'player1@example.com',
 * })
 *
 * // 验证登录
 * const result = await userRepo.authenticate('player1', 'securePassword123')
 * if (result) {
 *     console.log('登录成功:', result.username)
 * }
 * ```
 */
export class UserRepository extends Repository<UserEntity> {
    constructor(connection: IMongoConnection, collectionName = 'users') {
        super(connection, collectionName, true)
    }

    // =========================================================================
    // 查询 | Query
    // =========================================================================

    /**
     * @zh 根据用户名查找用户
     * @en Find user by username
     */
    async findByUsername(username: string): Promise<UserEntity | null> {
        return this.findOne({ where: { username } })
    }

    /**
     * @zh 根据邮箱查找用户
     * @en Find user by email
     */
    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.findOne({ where: { email } })
    }

    /**
     * @zh 检查用户名是否存在
     * @en Check if username exists
     */
    async usernameExists(username: string): Promise<boolean> {
        return this.exists({ where: { username } })
    }

    /**
     * @zh 检查邮箱是否存在
     * @en Check if email exists
     */
    async emailExists(email: string): Promise<boolean> {
        return this.exists({ where: { email } })
    }

    // =========================================================================
    // 注册与认证 | Registration & Authentication
    // =========================================================================

    /**
     * @zh 注册新用户
     * @en Register new user
     *
     * @param params - @zh 创建用户参数 @en Create user parameters
     * @returns @zh 创建的用户（不含密码哈希）@en Created user (without password hash)
     * @throws @zh 如果用户名已存在 @en If username already exists
     */
    async register(params: CreateUserParams): Promise<SafeUser> {
        const { username, password, email, roles, metadata } = params

        if (await this.usernameExists(username)) {
            throw new Error('Username already exists')
        }

        if (email && (await this.emailExists(email))) {
            throw new Error('Email already exists')
        }

        const passwordHash = await hashPassword(password)

        const user = await this.create({
            username,
            passwordHash,
            email,
            roles: roles ?? ['user'],
            isActive: true,
            metadata
        })

        return this.toSafeUser(user)
    }

    /**
     * @zh 验证用户登录
     * @en Authenticate user login
     *
     * @param username - @zh 用户名 @en Username
     * @param password - @zh 明文密码 @en Plain text password
     * @returns @zh 验证成功返回用户信息（不含密码），失败返回 null @en Returns user info on success, null on failure
     */
    async authenticate(username: string, password: string): Promise<SafeUser | null> {
        const user = await this.findByUsername(username)
        if (!user || !user.isActive) {
            return null
        }

        const isValid = await verifyPassword(password, user.passwordHash)
        if (!isValid) {
            return null
        }

        await this.update(user.id, { lastLoginAt: new Date() })

        return this.toSafeUser(user)
    }

    // =========================================================================
    // 密码管理 | Password Management
    // =========================================================================

    /**
     * @zh 修改密码
     * @en Change password
     *
     * @param userId - @zh 用户 ID @en User ID
     * @param oldPassword - @zh 旧密码 @en Old password
     * @param newPassword - @zh 新密码 @en New password
     * @returns @zh 是否修改成功 @en Whether change was successful
     */
    async changePassword(
        userId: string,
        oldPassword: string,
        newPassword: string
    ): Promise<boolean> {
        const user = await this.findById(userId)
        if (!user) {
            return false
        }

        const isValid = await verifyPassword(oldPassword, user.passwordHash)
        if (!isValid) {
            return false
        }

        const newHash = await hashPassword(newPassword)
        const result = await this.update(userId, { passwordHash: newHash })
        return result !== null
    }

    /**
     * @zh 重置密码（管理员操作）
     * @en Reset password (admin operation)
     *
     * @param userId - @zh 用户 ID @en User ID
     * @param newPassword - @zh 新密码 @en New password
     */
    async resetPassword(userId: string, newPassword: string): Promise<boolean> {
        const user = await this.findById(userId)
        if (!user) {
            return false
        }

        const newHash = await hashPassword(newPassword)
        const result = await this.update(userId, { passwordHash: newHash })
        return result !== null
    }

    // =========================================================================
    // 角色管理 | Role Management
    // =========================================================================

    /**
     * @zh 添加角色
     * @en Add role to user
     */
    async addRole(userId: string, role: string): Promise<boolean> {
        const user = await this.findById(userId)
        if (!user) {
            return false
        }

        const roles = user.roles ?? []
        if (!roles.includes(role)) {
            roles.push(role)
            await this.update(userId, { roles })
        }
        return true
    }

    /**
     * @zh 移除角色
     * @en Remove role from user
     */
    async removeRole(userId: string, role: string): Promise<boolean> {
        const user = await this.findById(userId)
        if (!user) {
            return false
        }

        const roles = (user.roles ?? []).filter(r => r !== role)
        await this.update(userId, { roles })
        return true
    }

    /**
     * @zh 检查用户是否拥有角色
     * @en Check if user has role
     */
    async hasRole(userId: string, role: string): Promise<boolean> {
        const user = await this.findById(userId)
        return user?.roles?.includes(role) ?? false
    }

    /**
     * @zh 检查用户是否拥有任一角色
     * @en Check if user has any of the roles
     */
    async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
        const user = await this.findById(userId)
        if (!user?.roles) return false
        return roles.some(role => user.roles.includes(role))
    }

    // =========================================================================
    // 状态管理 | Status Management
    // =========================================================================

    /**
     * @zh 禁用用户
     * @en Deactivate user
     */
    async deactivate(userId: string): Promise<boolean> {
        const result = await this.update(userId, { isActive: false })
        return result !== null
    }

    /**
     * @zh 启用用户
     * @en Activate user
     */
    async activate(userId: string): Promise<boolean> {
        const result = await this.update(userId, { isActive: true })
        return result !== null
    }

    // =========================================================================
    // 内部方法 | Internal Methods
    // =========================================================================

    /**
     * @zh 移除密码哈希
     * @en Remove password hash
     */
    private toSafeUser(user: UserEntity): SafeUser {
        const { passwordHash, ...safeUser } = user
        return safeUser
    }
}

/**
 * @zh 创建用户仓库
 * @en Create user repository
 */
export function createUserRepository(
    connection: IMongoConnection,
    collectionName = 'users'
): UserRepository {
    return new UserRepository(connection, collectionName)
}
