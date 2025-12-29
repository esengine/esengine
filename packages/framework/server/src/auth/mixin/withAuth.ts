/**
 * @zh 服务器认证 Mixin
 * @en Server authentication mixin
 */

import type { ServerConnection, GameServer } from '../../types/index.js';
import type {
    IAuthProvider,
    AuthResult,
    AuthServerConfig,
    AuthGameServer,
    IAuthContext,
    ConnectionRequest
} from '../types.js';
import { AuthContext, createGuestContext } from '../context.js';

/**
 * @zh 认证数据键
 * @en Auth data key
 */
const AUTH_CONTEXT_KEY = Symbol('authContext');

/**
 * @zh 获取连接的认证上下文
 * @en Get auth context for connection
 */
export function getAuthContext<TUser = unknown>(conn: ServerConnection): IAuthContext<TUser> | null {
    const data = conn.data as Record<symbol, unknown>;
    return (data[AUTH_CONTEXT_KEY] as IAuthContext<TUser>) ?? null;
}

/**
 * @zh 设置连接的认证上下文
 * @en Set auth context for connection
 */
export function setAuthContext<TUser = unknown>(conn: ServerConnection, context: IAuthContext<TUser>): void {
    const data = conn.data as Record<symbol, unknown>;
    data[AUTH_CONTEXT_KEY] = context;
}

/**
 * @zh 包装服务器添加认证功能
 * @en Wrap server with authentication functionality
 *
 * @zh 使用 mixin 模式为服务器添加认证能力，不修改原始服务器
 * @en Uses mixin pattern to add authentication to server without modifying original
 *
 * @example
 * ```typescript
 * import { createServer } from '@esengine/server';
 * import { withAuth, createJwtAuthProvider } from '@esengine/server/auth';
 *
 * const jwtProvider = createJwtAuthProvider({
 *     secret: 'your-secret-key',
 *     expiresIn: 3600,
 * });
 *
 * const server = withAuth(await createServer({ port: 3000 }), {
 *     provider: jwtProvider,
 *     extractCredentials: (req) => {
 *         const url = new URL(req.url, 'http://localhost');
 *         return url.searchParams.get('token');
 *     },
 *     onAuthSuccess: (conn, user) => {
 *         console.log(`User ${user.name} authenticated`);
 *     },
 *     onAuthFailure: (conn, error) => {
 *         console.log(`Auth failed: ${error.error}`);
 *     }
 * });
 *
 * await server.start();
 * ```
 */
export function withAuth<TUser = unknown>(
    server: GameServer,
    config: AuthServerConfig<TUser>
): AuthGameServer<TUser> {
    const {
        provider,
        extractCredentials,
        autoAuthOnConnect = true,
        disconnectOnAuthFailure = false,
        onAuthSuccess,
        onAuthFailure
    } = config;

    const originalConnections = server.connections;
    const connectionAuthMap = new WeakMap<ServerConnection, AuthContext<TUser>>();

    const authServer: AuthGameServer<TUser> = {
        ...server,

        get authProvider(): IAuthProvider<TUser> {
            return provider;
        },

        async authenticate(
            conn: ServerConnection,
            credentials: unknown
        ): Promise<AuthResult<TUser>> {
            const result = await provider.verify(credentials as never);

            let authContext = connectionAuthMap.get(conn);
            if (!authContext) {
                authContext = new AuthContext<TUser>();
                connectionAuthMap.set(conn, authContext);
                setAuthContext(conn, authContext);
            }

            if (result.success) {
                authContext.setAuthenticated(result);
                await onAuthSuccess?.(conn, result.user!);
            } else {
                authContext.clear();
                await onAuthFailure?.(conn, result);
            }

            return result;
        },

        getAuthContext(conn: ServerConnection): IAuthContext<TUser> | null {
            return connectionAuthMap.get(conn) ?? null;
        },

        get connections(): ReadonlyArray<ServerConnection> {
            return originalConnections;
        }
    };

    const originalOnConnect = (server as any)._onConnect;
    (server as any)._onConnect = async (conn: ServerConnection, req?: unknown) => {
        const authContext = new AuthContext<TUser>();
        connectionAuthMap.set(conn, authContext);
        setAuthContext(conn, authContext);

        if (autoAuthOnConnect && extractCredentials && req) {
            try {
                const connReq = req as ConnectionRequest;
                const credentials = await extractCredentials(connReq);

                if (credentials) {
                    const result = await provider.verify(credentials as never);

                    if (result.success) {
                        authContext.setAuthenticated(result);
                        await onAuthSuccess?.(conn, result.user!);
                    } else {
                        await onAuthFailure?.(conn, result);

                        if (disconnectOnAuthFailure) {
                            (conn as any).close?.();
                            return;
                        }
                    }
                }
            } catch (error) {
                console.error('[Auth] Error during auto-authentication:', error);
            }
        }

        if (originalOnConnect) {
            await originalOnConnect(conn, req);
        }
    };

    const originalOnDisconnect = (server as any)._onDisconnect;
    (server as any)._onDisconnect = async (conn: ServerConnection) => {
        connectionAuthMap.delete(conn);

        if (originalOnDisconnect) {
            await originalOnDisconnect(conn);
        }
    };

    return authServer;
}

/**
 * @zh 创建认证中间件
 * @en Create authentication middleware
 *
 * @zh 用于在 API 处理器中检查认证状态
 * @en Used to check authentication status in API handlers
 */
export function requireAuthentication<TUser = unknown>(
    conn: ServerConnection,
    options?: { errorMessage?: string }
): IAuthContext<TUser> {
    const auth = getAuthContext<TUser>(conn);

    if (!auth || !auth.isAuthenticated) {
        throw new Error(options?.errorMessage ?? 'Authentication required');
    }

    return auth;
}

/**
 * @zh 创建角色检查中间件
 * @en Create role check middleware
 */
export function requireRole<TUser = unknown>(
    conn: ServerConnection,
    roles: string | string[],
    options?: { mode?: 'any' | 'all'; errorMessage?: string }
): IAuthContext<TUser> {
    const auth = requireAuthentication<TUser>(conn);
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const mode = options?.mode ?? 'any';

    const hasRole = mode === 'any'
        ? auth.hasAnyRole(roleArray)
        : auth.hasAllRoles(roleArray);

    if (!hasRole) {
        throw new Error(options?.errorMessage ?? 'Insufficient permissions');
    }

    return auth;
}
