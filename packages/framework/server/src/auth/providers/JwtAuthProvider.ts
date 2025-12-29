/**
 * @zh JWT 认证提供者
 * @en JWT authentication provider
 */

import type { IAuthProvider, AuthResult, AuthErrorCode } from '../types.js';
import * as jwt from 'jsonwebtoken';

/**
 * @zh JWT 载荷
 * @en JWT payload
 */
export interface JwtPayload {
    /**
     * @zh 主题（用户 ID）
     * @en Subject (user ID)
     */
    sub?: string;

    /**
     * @zh 签发时间
     * @en Issued at
     */
    iat?: number;

    /**
     * @zh 过期时间
     * @en Expiration time
     */
    exp?: number;

    /**
     * @zh 自定义字段
     * @en Custom fields
     */
    [key: string]: unknown;
}

/**
 * @zh JWT 认证配置
 * @en JWT authentication configuration
 */
export interface JwtAuthConfig<TUser = unknown> {
    /**
     * @zh 密钥
     * @en Secret key
     */
    secret: string;

    /**
     * @zh 算法
     * @en Algorithm
     * @defaultValue 'HS256'
     */
    algorithm?: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';

    /**
     * @zh 令牌过期时间（秒）
     * @en Token expiration in seconds
     * @defaultValue 3600
     */
    expiresIn?: number;

    /**
     * @zh 从载荷获取用户信息
     * @en Get user from payload
     */
    getUser?: (payload: JwtPayload) => TUser | Promise<TUser | null> | null;

    /**
     * @zh 签发者
     * @en Issuer
     */
    issuer?: string;

    /**
     * @zh 受众
     * @en Audience
     */
    audience?: string;
}

/**
 * @zh JWT 认证提供者
 * @en JWT authentication provider
 *
 * @zh 使用 jsonwebtoken 库实现 JWT 认证
 * @en Uses jsonwebtoken library for JWT authentication
 *
 * @example
 * ```typescript
 * const jwtProvider = createJwtAuthProvider({
 *     secret: 'your-secret-key',
 *     expiresIn: 3600,
 *     getUser: async (payload) => {
 *         return await db.users.findById(payload.sub);
 *     }
 * });
 * ```
 */
export class JwtAuthProvider<TUser = unknown> implements IAuthProvider<TUser, string> {
    readonly name = 'jwt';

    private _config: Required<Pick<JwtAuthConfig<TUser>, 'secret' | 'algorithm' | 'expiresIn'>> & JwtAuthConfig<TUser>;

    constructor(config: JwtAuthConfig<TUser>) {
        this._config = {
            algorithm: 'HS256',
            expiresIn: 3600,
            ...config
        };
    }

    /**
     * @zh 验证令牌
     * @en Verify token
     */
    async verify(token: string): Promise<AuthResult<TUser>> {
        if (!token) {
            return {
                success: false,
                error: 'Token is required',
                errorCode: 'INVALID_TOKEN'
            };
        }

        try {
            const verifyOptions: jwt.VerifyOptions = {
                algorithms: [this._config.algorithm]
            };
            if (this._config.issuer) {
                verifyOptions.issuer = this._config.issuer;
            }
            if (this._config.audience) {
                verifyOptions.audience = this._config.audience;
            }
            const payload = jwt.verify(token, this._config.secret, verifyOptions) as JwtPayload;

            let user: TUser | null = null;

            if (this._config.getUser) {
                user = await this._config.getUser(payload);
                if (!user) {
                    return {
                        success: false,
                        error: 'User not found',
                        errorCode: 'USER_NOT_FOUND'
                    };
                }
            } else {
                user = payload as unknown as TUser;
            }

            return {
                success: true,
                user,
                token,
                expiresAt: payload.exp ? payload.exp * 1000 : undefined
            };
        } catch (error) {
            const err = error as Error;

            if (err.name === 'TokenExpiredError') {
                return {
                    success: false,
                    error: 'Token has expired',
                    errorCode: 'EXPIRED_TOKEN'
                };
            }

            return {
                success: false,
                error: err.message || 'Invalid token',
                errorCode: 'INVALID_TOKEN'
            };
        }
    }

    /**
     * @zh 刷新令牌
     * @en Refresh token
     */
    async refresh(token: string): Promise<AuthResult<TUser>> {
        const result = await this.verify(token);

        if (!result.success || !result.user) {
            return result;
        }

        const payload = jwt.decode(token) as JwtPayload;

        // Remove JWT standard claims that will be regenerated
        const { iat, exp, nbf, ...restPayload } = payload;

        const newToken = this.sign(restPayload);

        return {
            success: true,
            user: result.user,
            token: newToken,
            expiresAt: Date.now() + this._config.expiresIn * 1000
        };
    }

    /**
     * @zh 生成令牌
     * @en Generate token
     */
    sign(payload: Record<string, unknown>): string {
        const signOptions: jwt.SignOptions = {
            algorithm: this._config.algorithm,
            expiresIn: this._config.expiresIn
        };
        if (this._config.issuer) {
            signOptions.issuer = this._config.issuer;
        }
        if (this._config.audience) {
            signOptions.audience = this._config.audience;
        }
        return jwt.sign(payload, this._config.secret, signOptions);
    }

    /**
     * @zh 解码令牌（不验证）
     * @en Decode token (without verification)
     */
    decode(token: string): JwtPayload | null {
        return jwt.decode(token) as JwtPayload | null;
    }
}

/**
 * @zh 创建 JWT 认证提供者
 * @en Create JWT authentication provider
 *
 * @example
 * ```typescript
 * import { createJwtAuthProvider } from '@esengine/server/auth';
 *
 * const jwtProvider = createJwtAuthProvider({
 *     secret: process.env.JWT_SECRET!,
 *     expiresIn: 3600,
 *     getUser: async (payload) => {
 *         return { id: payload.sub, name: payload.name };
 *     }
 * });
 * ```
 */
export function createJwtAuthProvider<TUser = unknown>(
    config: JwtAuthConfig<TUser>
): JwtAuthProvider<TUser> {
    return new JwtAuthProvider<TUser>(config);
}
