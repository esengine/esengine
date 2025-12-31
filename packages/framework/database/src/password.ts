/**
 * @zh 密码加密工具
 * @en Password hashing utilities
 *
 * @zh 使用 Node.js 内置的 crypto 模块实现安全的密码哈希
 * @en Uses Node.js built-in crypto module for secure password hashing
 */

import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

/**
 * @zh 密码哈希配置
 * @en Password hash configuration
 */
export interface PasswordHashConfig {
    /**
     * @zh 盐的字节长度（默认 16）
     * @en Salt length in bytes (default 16)
     */
    saltLength?: number

    /**
     * @zh scrypt 密钥长度（默认 64）
     * @en scrypt key length (default 64)
     */
    keyLength?: number
}

const DEFAULT_CONFIG: Required<PasswordHashConfig> = {
    saltLength: 16,
    keyLength: 64
}

/**
 * @zh 对密码进行哈希处理
 * @en Hash a password
 *
 * @param password - @zh 明文密码 @en Plain text password
 * @param config - @zh 哈希配置 @en Hash configuration
 * @returns @zh 格式为 "salt:hash" 的哈希字符串 @en Hash string in "salt:hash" format
 *
 * @example
 * ```typescript
 * const hashedPassword = await hashPassword('myPassword123')
 * // 存储 hashedPassword 到数据库
 * ```
 */
export async function hashPassword(
    password: string,
    config?: PasswordHashConfig
): Promise<string> {
    const { saltLength, keyLength } = { ...DEFAULT_CONFIG, ...config }

    const salt = randomBytes(saltLength).toString('hex')
    const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer

    return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * @zh 验证密码是否正确
 * @en Verify if a password is correct
 *
 * @param password - @zh 明文密码 @en Plain text password
 * @param hashedPassword - @zh 存储的哈希密码 @en Stored hashed password
 * @param config - @zh 哈希配置 @en Hash configuration
 * @returns @zh 密码是否匹配 @en Whether the password matches
 *
 * @example
 * ```typescript
 * const isValid = await verifyPassword('myPassword123', storedHash)
 * if (isValid) {
 *     // 登录成功
 * }
 * ```
 */
export async function verifyPassword(
    password: string,
    hashedPassword: string,
    config?: PasswordHashConfig
): Promise<boolean> {
    const { keyLength } = { ...DEFAULT_CONFIG, ...config }

    const [salt, storedHash] = hashedPassword.split(':')
    if (!salt || !storedHash) {
        return false
    }

    try {
        const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer
        const storedBuffer = Buffer.from(storedHash, 'hex')

        return timingSafeEqual(derivedKey, storedBuffer)
    } catch {
        return false
    }
}

/**
 * @zh 密码强度等级
 * @en Password strength level
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

/**
 * @zh 密码强度检查结果
 * @en Password strength check result
 */
export interface PasswordStrengthResult {
    /**
     * @zh 强度分数 (0-6)
     * @en Strength score (0-6)
     */
    score: number

    /**
     * @zh 强度等级
     * @en Strength level
     */
    level: PasswordStrength

    /**
     * @zh 改进建议
     * @en Improvement suggestions
     */
    feedback: string[]
}

/**
 * @zh 检查密码强度
 * @en Check password strength
 *
 * @param password - @zh 明文密码 @en Plain text password
 * @returns @zh 密码强度信息 @en Password strength information
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) {
        score += 1
    } else {
        feedback.push('Password should be at least 8 characters')
    }

    if (password.length >= 12) {
        score += 1
    }

    if (/[a-z]/.test(password)) {
        score += 1
    } else {
        feedback.push('Password should contain lowercase letters')
    }

    if (/[A-Z]/.test(password)) {
        score += 1
    } else {
        feedback.push('Password should contain uppercase letters')
    }

    if (/[0-9]/.test(password)) {
        score += 1
    } else {
        feedback.push('Password should contain numbers')
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
        score += 1
    } else {
        feedback.push('Password should contain special characters')
    }

    let level: PasswordStrength
    if (score <= 2) {
        level = 'weak'
    } else if (score <= 3) {
        level = 'fair'
    } else if (score <= 4) {
        level = 'good'
    } else {
        level = 'strong'
    }

    return { score, level, feedback }
}
