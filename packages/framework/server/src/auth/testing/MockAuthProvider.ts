/**
 * @zh 模拟认证提供者
 * @en Mock authentication provider
 */

import type { IAuthProvider, AuthResult, AuthErrorCode } from '../types.js';

/**
 * @zh 模拟用户
 * @en Mock user
 */
export interface MockUser {
    id: string;
    name?: string;
    roles?: string[];
    [key: string]: unknown;
}

/**
 * @zh 模拟认证配置
 * @en Mock authentication configuration
 */
export interface MockAuthConfig {
    /**
     * @zh 预设用户列表
     * @en Preset user list
     */
    users?: MockUser[];

    /**
     * @zh 默认用户（无 token 时返回）
     * @en Default user (returned when no token)
     */
    defaultUser?: MockUser;

    /**
     * @zh 模拟延迟（毫秒）
     * @en Simulated delay (ms)
     */
    delay?: number;

    /**
     * @zh 是否自动创建用户
     * @en Auto create users
     */
    autoCreate?: boolean;

    /**
     * @zh 验证令牌格式
     * @en Token format validator
     */
    validateToken?: (token: string) => boolean;
}

/**
 * @zh 模拟认证提供者
 * @en Mock authentication provider
 *
 * @zh 用于测试的认证提供者，不需要真实的 JWT 或数据库
 * @en Authentication provider for testing, no real JWT or database required
 *
 * @example
 * ```typescript
 * import { createMockAuthProvider } from '@esengine/server/auth/testing';
 *
 * const mockProvider = createMockAuthProvider({
 *     users: [
 *         { id: '1', name: 'Alice', roles: ['player'] },
 *         { id: '2', name: 'Bob', roles: ['admin'] },
 *     ],
 *     autoCreate: true, // Unknown tokens create guest users
 * });
 *
 * // Verify with user ID as token
 * const result = await mockProvider.verify('1');
 * // result.user = { id: '1', name: 'Alice', roles: ['player'] }
 * ```
 */
export class MockAuthProvider<TUser extends MockUser = MockUser>
    implements IAuthProvider<TUser, string> {

    readonly name = 'mock';

    private _users: Map<string, TUser>;
    private _config: MockAuthConfig;
    private _revokedTokens: Set<string> = new Set();

    constructor(config: MockAuthConfig = {}) {
        this._config = config;
        this._users = new Map();

        if (config.users) {
            for (const user of config.users) {
                this._users.set(user.id, user as TUser);
            }
        }
    }

    /**
     * @zh 模拟延迟
     * @en Simulate delay
     */
    private async _delay(): Promise<void> {
        if (this._config.delay && this._config.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, this._config.delay));
        }
    }

    /**
     * @zh 验证令牌
     * @en Verify token
     */
    async verify(token: string): Promise<AuthResult<TUser>> {
        await this._delay();

        if (!token) {
            if (this._config.defaultUser) {
                return {
                    success: true,
                    user: this._config.defaultUser as TUser,
                    token: 'default'
                };
            }
            return {
                success: false,
                error: 'Token is required',
                errorCode: 'INVALID_TOKEN'
            };
        }

        if (this._revokedTokens.has(token)) {
            return {
                success: false,
                error: 'Token has been revoked',
                errorCode: 'INVALID_TOKEN'
            };
        }

        if (this._config.validateToken && !this._config.validateToken(token)) {
            return {
                success: false,
                error: 'Invalid token format',
                errorCode: 'INVALID_TOKEN'
            };
        }

        const user = this._users.get(token);

        if (user) {
            return {
                success: true,
                user,
                token,
                expiresAt: Date.now() + 3600000
            };
        }

        if (this._config.autoCreate) {
            const newUser = {
                id: token,
                name: `User_${token}`,
                roles: ['guest']
            } as TUser;

            this._users.set(token, newUser);

            return {
                success: true,
                user: newUser,
                token,
                expiresAt: Date.now() + 3600000
            };
        }

        return {
            success: false,
            error: 'User not found',
            errorCode: 'USER_NOT_FOUND'
        };
    }

    /**
     * @zh 刷新令牌
     * @en Refresh token
     */
    async refresh(token: string): Promise<AuthResult<TUser>> {
        return this.verify(token);
    }

    /**
     * @zh 撤销令牌
     * @en Revoke token
     */
    async revoke(token: string): Promise<boolean> {
        this._revokedTokens.add(token);
        return true;
    }

    /**
     * @zh 添加用户
     * @en Add user
     */
    addUser(user: TUser): void {
        this._users.set(user.id, user);
    }

    /**
     * @zh 移除用户
     * @en Remove user
     */
    removeUser(id: string): boolean {
        return this._users.delete(id);
    }

    /**
     * @zh 获取用户
     * @en Get user
     */
    getUser(id: string): TUser | undefined {
        return this._users.get(id);
    }

    /**
     * @zh 获取所有用户
     * @en Get all users
     */
    getUsers(): TUser[] {
        return Array.from(this._users.values());
    }

    /**
     * @zh 清空所有状态
     * @en Clear all state
     */
    clear(): void {
        this._users.clear();
        this._revokedTokens.clear();

        if (this._config.users) {
            for (const user of this._config.users) {
                this._users.set(user.id, user as TUser);
            }
        }
    }

    /**
     * @zh 生成测试令牌
     * @en Generate test token
     */
    generateToken(userId: string): string {
        return userId;
    }
}

/**
 * @zh 创建模拟认证提供者
 * @en Create mock authentication provider
 *
 * @example
 * ```typescript
 * const provider = createMockAuthProvider({
 *     users: [
 *         { id: 'admin', name: 'Admin', roles: ['admin'] }
 *     ]
 * });
 *
 * // Use in tests
 * const server = withAuth(await createServer({ port: 0 }), {
 *     provider,
 *     extractCredentials: (req) => req.headers['x-token']
 * });
 * ```
 */
export function createMockAuthProvider<TUser extends MockUser = MockUser>(
    config?: MockAuthConfig
): MockAuthProvider<TUser> {
    return new MockAuthProvider<TUser>(config);
}
