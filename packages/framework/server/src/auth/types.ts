/**
 * @zh 认证系统类型定义
 * @en Authentication system type definitions
 */

import type { ServerConnection, ApiContext, MsgContext, GameServer } from '../types/index.js';

// ============================================================================
// Error Codes
// ============================================================================

/**
 * @zh 认证错误代码
 * @en Authentication error codes
 */
export type AuthErrorCode =
    | 'INVALID_CREDENTIALS'
    | 'EXPIRED_TOKEN'
    | 'INVALID_TOKEN'
    | 'USER_NOT_FOUND'
    | 'ACCOUNT_DISABLED'
    | 'RATE_LIMITED'
    | 'INSUFFICIENT_PERMISSIONS';

// ============================================================================
// Auth Result
// ============================================================================

/**
 * @zh 认证结果
 * @en Authentication result
 */
export interface AuthResult<TUser = unknown> {
    /**
     * @zh 是否成功
     * @en Whether succeeded
     */
    success: boolean;

    /**
     * @zh 用户信息
     * @en User information
     */
    user?: TUser;

    /**
     * @zh 错误信息
     * @en Error message
     */
    error?: string;

    /**
     * @zh 错误代码
     * @en Error code
     */
    errorCode?: AuthErrorCode;

    /**
     * @zh 令牌
     * @en Token
     */
    token?: string;

    /**
     * @zh 令牌过期时间（时间戳）
     * @en Token expiration time (timestamp)
     */
    expiresAt?: number;
}

// ============================================================================
// Auth Provider
// ============================================================================

/**
 * @zh 认证提供者接口
 * @en Authentication provider interface
 */
export interface IAuthProvider<TUser = unknown, TCredentials = unknown> {
    /**
     * @zh 提供者名称
     * @en Provider name
     */
    readonly name: string;

    /**
     * @zh 验证凭证
     * @en Verify credentials
     *
     * @param credentials - @zh 凭证数据 @en Credential data
     * @returns @zh 验证结果 @en Verification result
     */
    verify(credentials: TCredentials): Promise<AuthResult<TUser>>;

    /**
     * @zh 刷新令牌（可选）
     * @en Refresh token (optional)
     */
    refresh?(token: string): Promise<AuthResult<TUser>>;

    /**
     * @zh 撤销令牌（可选）
     * @en Revoke token (optional)
     */
    revoke?(token: string): Promise<boolean>;
}

// ============================================================================
// Auth Context
// ============================================================================

/**
 * @zh 认证上下文接口
 * @en Authentication context interface
 */
export interface IAuthContext<TUser = unknown> {
    /**
     * @zh 是否已认证
     * @en Whether authenticated
     */
    readonly isAuthenticated: boolean;

    /**
     * @zh 用户信息
     * @en User information
     */
    readonly user: TUser | null;

    /**
     * @zh 用户 ID
     * @en User ID
     */
    readonly userId: string | null;

    /**
     * @zh 用户角色
     * @en User roles
     */
    readonly roles: ReadonlyArray<string>;

    /**
     * @zh 认证时间
     * @en Authentication timestamp
     */
    readonly authenticatedAt: number | null;

    /**
     * @zh 令牌过期时间
     * @en Token expiration time
     */
    readonly expiresAt: number | null;

    /**
     * @zh 检查是否有指定角色
     * @en Check if has specified role
     */
    hasRole(role: string): boolean;

    /**
     * @zh 检查是否有任一指定角色
     * @en Check if has any of specified roles
     */
    hasAnyRole(roles: string[]): boolean;

    /**
     * @zh 检查是否有所有指定角色
     * @en Check if has all specified roles
     */
    hasAllRoles(roles: string[]): boolean;
}

// ============================================================================
// Auth Connection
// ============================================================================

/**
 * @zh 认证连接数据
 * @en Authentication connection data
 */
export interface AuthConnectionData<TUser = unknown> {
    /**
     * @zh 认证上下文
     * @en Authentication context
     */
    auth: IAuthContext<TUser>;
}

/**
 * @zh 带认证的连接
 * @en Connection with authentication
 */
export interface AuthConnection<TUser = unknown, TData extends AuthConnectionData<TUser> = AuthConnectionData<TUser>>
    extends ServerConnection<TData> {
    /**
     * @zh 认证上下文（快捷访问）
     * @en Authentication context (shortcut)
     */
    readonly auth: IAuthContext<TUser>;
}

/**
 * @zh 带认证的 API 上下文
 * @en API context with authentication
 */
export interface AuthApiContext<TUser = unknown, TData extends AuthConnectionData<TUser> = AuthConnectionData<TUser>>
    extends ApiContext<TData> {
    /**
     * @zh 当前连接（带认证）
     * @en Current connection (with auth)
     */
    conn: AuthConnection<TUser, TData>;
}

/**
 * @zh 带认证的消息上下文
 * @en Message context with authentication
 */
export interface AuthMsgContext<TUser = unknown, TData extends AuthConnectionData<TUser> = AuthConnectionData<TUser>>
    extends MsgContext<TData> {
    /**
     * @zh 当前连接（带认证）
     * @en Current connection (with auth)
     */
    conn: AuthConnection<TUser, TData>;
}

// ============================================================================
// Auth Server Config
// ============================================================================

/**
 * @zh 连接请求信息
 * @en Connection request info
 */
export interface ConnectionRequest {
    /**
     * @zh 请求 URL
     * @en Request URL
     */
    url: string;

    /**
     * @zh 请求头
     * @en Request headers
     */
    headers: Record<string, string | string[] | undefined>;

    /**
     * @zh 客户端 IP
     * @en Client IP
     */
    ip: string;
}

/**
 * @zh 认证服务器配置
 * @en Authentication server configuration
 */
export interface AuthServerConfig<TUser = unknown> {
    /**
     * @zh 认证提供者
     * @en Authentication provider
     */
    provider: IAuthProvider<TUser>;

    /**
     * @zh 从连接请求提取凭证
     * @en Extract credentials from connection request
     */
    extractCredentials?: (req: ConnectionRequest) => unknown | Promise<unknown>;

    /**
     * @zh 连接时自动认证
     * @en Auto authenticate on connection
     * @defaultValue true
     */
    autoAuthOnConnect?: boolean;

    /**
     * @zh 未认证连接的宽限期（毫秒）
     * @en Grace period for unauthenticated connections (ms)
     * @defaultValue 30000
     */
    authGracePeriod?: number;

    /**
     * @zh 认证失败是否断开连接
     * @en Disconnect on auth failure
     * @defaultValue false
     */
    disconnectOnAuthFailure?: boolean;

    /**
     * @zh 认证成功回调
     * @en Authentication success callback
     */
    onAuthSuccess?: (conn: ServerConnection, user: TUser) => void | Promise<void>;

    /**
     * @zh 认证失败回调
     * @en Authentication failure callback
     */
    onAuthFailure?: (conn: ServerConnection, error: AuthResult<TUser>) => void | Promise<void>;
}

// ============================================================================
// Auth Game Server
// ============================================================================

/**
 * @zh 带认证的游戏服务器
 * @en Game server with authentication
 */
export interface AuthGameServer<TUser = unknown> extends GameServer {
    /**
     * @zh 认证提供者
     * @en Authentication provider
     */
    readonly authProvider: IAuthProvider<TUser>;

    /**
     * @zh 手动认证连接
     * @en Manually authenticate connection
     */
    authenticate(
        conn: ServerConnection,
        credentials: unknown
    ): Promise<AuthResult<TUser>>;

    /**
     * @zh 获取连接的认证上下文
     * @en Get auth context for connection
     */
    getAuthContext(conn: ServerConnection): IAuthContext<TUser> | null;
}

// ============================================================================
// Auth Room Config
// ============================================================================

/**
 * @zh 带认证的房间配置
 * @en Auth room configuration
 */
export interface AuthRoomConfig {
    /**
     * @zh 是否要求认证才能加入
     * @en Require authentication to join
     * @defaultValue true
     */
    requireAuth?: boolean;

    /**
     * @zh 允许的角色（空数组表示任意角色）
     * @en Allowed roles (empty array means any role)
     */
    allowedRoles?: string[];

    /**
     * @zh 角色检查模式
     * @en Role check mode
     * @defaultValue 'any'
     */
    roleCheckMode?: 'any' | 'all';
}

// ============================================================================
// Decorator Options
// ============================================================================

/**
 * @zh requireAuth 装饰器选项
 * @en requireAuth decorator options
 */
export interface RequireAuthOptions {
    /**
     * @zh 认证失败时的错误消息
     * @en Error message on auth failure
     */
    errorMessage?: string;

    /**
     * @zh 是否允许访客
     * @en Allow guest access
     */
    allowGuest?: boolean;
}

/**
 * @zh requireRole 装饰器选项
 * @en requireRole decorator options
 */
export interface RequireRoleOptions extends RequireAuthOptions {
    /**
     * @zh 角色检查模式
     * @en Role check mode
     * @defaultValue 'any'
     */
    mode?: 'any' | 'all';
}
