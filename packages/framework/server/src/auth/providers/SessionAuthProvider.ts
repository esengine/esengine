/**
 * @zh Session 认证提供者
 * @en Session authentication provider
 */

import type { IAuthProvider, AuthResult } from '../types.js';

/**
 * @zh Session 存储接口（兼容 ITransactionStorage）
 * @en Session storage interface (compatible with ITransactionStorage)
 */
export interface ISessionStorage {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
}

/**
 * @zh Session 数据
 * @en Session data
 */
export interface SessionData<TUser = unknown> {
    /**
     * @zh 用户信息
     * @en User information
     */
    user: TUser;

    /**
     * @zh 创建时间
     * @en Created at
     */
    createdAt: number;

    /**
     * @zh 最后活跃时间
     * @en Last active at
     */
    lastActiveAt: number;

    /**
     * @zh 自定义数据
     * @en Custom data
     */
    data?: Record<string, unknown>;
}

/**
 * @zh Session 认证配置
 * @en Session authentication configuration
 */
export interface SessionAuthConfig<TUser = unknown> {
    /**
     * @zh Session 存储
     * @en Session storage
     */
    storage: ISessionStorage;

    /**
     * @zh Session 过期时间（毫秒）
     * @en Session expiration in milliseconds
     * @defaultValue 86400000 (24h)
     */
    sessionTTL?: number;

    /**
     * @zh Session 键前缀
     * @en Session key prefix
     * @defaultValue 'session:'
     */
    prefix?: string;

    /**
     * @zh 验证用户（可选额外验证）
     * @en Validate user (optional extra validation)
     */
    validateUser?: (user: TUser) => boolean | Promise<boolean>;

    /**
     * @zh 是否自动续期
     * @en Auto renew session
     * @defaultValue true
     */
    autoRenew?: boolean;
}

/**
 * @zh Session 认证提供者
 * @en Session authentication provider
 *
 * @zh 基于存储的会话认证，支持 Redis、MongoDB 等后端
 * @en Storage-based session authentication, supports Redis, MongoDB, etc.
 *
 * @example
 * ```typescript
 * import { createSessionAuthProvider } from '@esengine/server/auth';
 * import { createRedisStorage } from '@esengine/transaction';
 *
 * const sessionProvider = createSessionAuthProvider({
 *     storage: createRedisStorage({ factory: () => new Redis() }),
 *     sessionTTL: 86400000, // 24 hours
 * });
 * ```
 */
export class SessionAuthProvider<TUser = unknown> implements IAuthProvider<TUser, string> {
    readonly name = 'session';

    private _config: Required<Pick<SessionAuthConfig<TUser>, 'sessionTTL' | 'prefix' | 'autoRenew'>> & SessionAuthConfig<TUser>;

    constructor(config: SessionAuthConfig<TUser>) {
        this._config = {
            sessionTTL: 86400000,
            prefix: 'session:',
            autoRenew: true,
            ...config
        };
    }

    /**
     * @zh 获取存储键
     * @en Get storage key
     */
    private _getKey(sessionId: string): string {
        return `${this._config.prefix}${sessionId}`;
    }

    /**
     * @zh 验证 Session
     * @en Verify session
     */
    async verify(sessionId: string): Promise<AuthResult<TUser>> {
        if (!sessionId) {
            return {
                success: false,
                error: 'Session ID is required',
                errorCode: 'INVALID_TOKEN'
            };
        }

        const key = this._getKey(sessionId);
        const session = await this._config.storage.get<SessionData<TUser>>(key);

        if (!session) {
            return {
                success: false,
                error: 'Session not found or expired',
                errorCode: 'EXPIRED_TOKEN'
            };
        }

        if (this._config.validateUser) {
            const isValid = await this._config.validateUser(session.user);
            if (!isValid) {
                return {
                    success: false,
                    error: 'User validation failed',
                    errorCode: 'ACCOUNT_DISABLED'
                };
            }
        }

        if (this._config.autoRenew) {
            session.lastActiveAt = Date.now();
            await this._config.storage.set(key, session, this._config.sessionTTL);
        }

        return {
            success: true,
            user: session.user,
            token: sessionId,
            expiresAt: session.createdAt + this._config.sessionTTL
        };
    }

    /**
     * @zh 刷新 Session
     * @en Refresh session
     */
    async refresh(sessionId: string): Promise<AuthResult<TUser>> {
        const result = await this.verify(sessionId);

        if (!result.success) {
            return result;
        }

        const key = this._getKey(sessionId);
        const session = await this._config.storage.get<SessionData<TUser>>(key);

        if (session) {
            session.lastActiveAt = Date.now();
            await this._config.storage.set(key, session, this._config.sessionTTL);
        }

        return {
            ...result,
            expiresAt: Date.now() + this._config.sessionTTL
        };
    }

    /**
     * @zh 撤销 Session
     * @en Revoke session
     */
    async revoke(sessionId: string): Promise<boolean> {
        const key = this._getKey(sessionId);
        return await this._config.storage.delete(key);
    }

    /**
     * @zh 创建 Session
     * @en Create session
     */
    async createSession(user: TUser, data?: Record<string, unknown>): Promise<string> {
        const sessionId = this._generateSessionId();
        const key = this._getKey(sessionId);

        const session: SessionData<TUser> = {
            user,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
            data
        };

        await this._config.storage.set(key, session, this._config.sessionTTL);

        return sessionId;
    }

    /**
     * @zh 获取 Session 数据
     * @en Get session data
     */
    async getSession(sessionId: string): Promise<SessionData<TUser> | null> {
        const key = this._getKey(sessionId);
        return await this._config.storage.get<SessionData<TUser>>(key);
    }

    /**
     * @zh 更新 Session 数据
     * @en Update session data
     */
    async updateSession(sessionId: string, data: Record<string, unknown>): Promise<boolean> {
        const key = this._getKey(sessionId);
        const session = await this._config.storage.get<SessionData<TUser>>(key);

        if (!session) {
            return false;
        }

        session.data = { ...session.data, ...data };
        session.lastActiveAt = Date.now();
        await this._config.storage.set(key, session, this._config.sessionTTL);

        return true;
    }

    /**
     * @zh 生成 Session ID
     * @en Generate session ID
     */
    private _generateSessionId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        const random2 = Math.random().toString(36).substring(2, 15);
        return `${timestamp}${random}${random2}`;
    }
}

/**
 * @zh 创建 Session 认证提供者
 * @en Create session authentication provider
 *
 * @example
 * ```typescript
 * import { createSessionAuthProvider } from '@esengine/server/auth';
 * import { MemoryStorage } from '@esengine/transaction';
 *
 * const sessionProvider = createSessionAuthProvider({
 *     storage: new MemoryStorage(),
 *     sessionTTL: 3600000, // 1 hour
 * });
 *
 * // Create a session
 * const sessionId = await sessionProvider.createSession({ id: '1', name: 'Alice' });
 *
 * // Verify session
 * const result = await sessionProvider.verify(sessionId);
 * ```
 */
export function createSessionAuthProvider<TUser = unknown>(
    config: SessionAuthConfig<TUser>
): SessionAuthProvider<TUser> {
    return new SessionAuthProvider<TUser>(config);
}
