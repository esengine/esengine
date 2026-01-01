/**
 * @zh 认证上下文实现
 * @en Authentication context implementation
 */

import type { IAuthContext, AuthResult } from './types.js';

/**
 * @zh 用户信息提取器
 * @en User info extractor
 */
export interface UserInfoExtractor<TUser> {
    /**
     * @zh 提取用户 ID
     * @en Extract user ID
     */
    getId(user: TUser): string;

    /**
     * @zh 提取用户角色
     * @en Extract user roles
     */
    getRoles(user: TUser): string[];
}

/**
 * @zh 默认用户信息提取器
 * @en Default user info extractor
 */
export const defaultUserExtractor: UserInfoExtractor<unknown> = {
    getId(user: unknown): string {
        if (user && typeof user === 'object') {
            const u = user as Record<string, unknown>;
            if (typeof u.id === 'string') return u.id;
            if (typeof u.id === 'number') return String(u.id);
            if (typeof u.userId === 'string') return u.userId;
            if (typeof u.userId === 'number') return String(u.userId);
            if (typeof u.sub === 'string') return u.sub;
        }
        return '';
    },

    getRoles(user: unknown): string[] {
        if (user && typeof user === 'object') {
            const u = user as Record<string, unknown>;
            if (Array.isArray(u.roles)) {
                return u.roles.filter((r): r is string => typeof r === 'string');
            }
            if (typeof u.role === 'string') {
                return [u.role];
            }
        }
        return [];
    }
};

/**
 * @zh 认证上下文
 * @en Authentication context
 *
 * @zh 存储连接的认证状态
 * @en Stores authentication state for a connection
 */
export class AuthContext<TUser = unknown> implements IAuthContext<TUser> {
    private _isAuthenticated: boolean = false;
    private _user: TUser | null = null;
    private _userId: string | null = null;
    private _roles: string[] = [];
    private _authenticatedAt: number | null = null;
    private _expiresAt: number | null = null;
    private _extractor: UserInfoExtractor<TUser>;

    constructor(extractor?: UserInfoExtractor<TUser>) {
        this._extractor = (extractor ?? defaultUserExtractor) as UserInfoExtractor<TUser>;
    }

    /**
     * @zh 是否已认证
     * @en Whether authenticated
     */
    get isAuthenticated(): boolean {
        if (this._expiresAt && Date.now() > this._expiresAt) {
            return false;
        }
        return this._isAuthenticated;
    }

    /**
     * @zh 用户信息
     * @en User information
     */
    get user(): TUser | null {
        return this._user;
    }

    /**
     * @zh 用户 ID
     * @en User ID
     */
    get userId(): string | null {
        return this._userId;
    }

    /**
     * @zh 用户角色
     * @en User roles
     */
    get roles(): ReadonlyArray<string> {
        return this._roles;
    }

    /**
     * @zh 认证时间
     * @en Authentication timestamp
     */
    get authenticatedAt(): number | null {
        return this._authenticatedAt;
    }

    /**
     * @zh 令牌过期时间
     * @en Token expiration time
     */
    get expiresAt(): number | null {
        return this._expiresAt;
    }

    /**
     * @zh 检查是否有指定角色
     * @en Check if has specified role
     */
    hasRole(role: string): boolean {
        return this._roles.includes(role);
    }

    /**
     * @zh 检查是否有任一指定角色
     * @en Check if has any of specified roles
     */
    hasAnyRole(roles: string[]): boolean {
        return roles.some((role) => this._roles.includes(role));
    }

    /**
     * @zh 检查是否有所有指定角色
     * @en Check if has all specified roles
     */
    hasAllRoles(roles: string[]): boolean {
        return roles.every((role) => this._roles.includes(role));
    }

    /**
     * @zh 设置认证结果
     * @en Set authentication result
     */
    setAuthenticated(result: AuthResult<TUser>): void {
        if (result.success && result.user) {
            this._isAuthenticated = true;
            this._user = result.user;
            this._userId = this._extractor.getId(result.user);
            this._roles = this._extractor.getRoles(result.user);
            this._authenticatedAt = Date.now();
            this._expiresAt = result.expiresAt ?? null;
        } else {
            this.clear();
        }
    }

    /**
     * @zh 清除认证状态
     * @en Clear authentication state
     */
    clear(): void {
        this._isAuthenticated = false;
        this._user = null;
        this._userId = null;
        this._roles = [];
        this._authenticatedAt = null;
        this._expiresAt = null;
    }
}

/**
 * @zh 创建访客认证上下文
 * @en Create guest auth context
 */
export function createGuestContext<TUser = unknown>(): IAuthContext<TUser> {
    return new AuthContext<TUser>();
}

/**
 * @zh 从认证结果创建认证上下文
 * @en Create auth context from auth result
 */
export function createAuthContext<TUser = unknown>(
    result: AuthResult<TUser>,
    extractor?: UserInfoExtractor<TUser>
): AuthContext<TUser> {
    const context = new AuthContext<TUser>(extractor);
    context.setAuthenticated(result);
    return context;
}
