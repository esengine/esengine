/**
 * @zh 认证模块
 * @en Authentication module
 *
 * @zh 为 @esengine/server 提供可插拔的认证系统
 * @en Provides pluggable authentication system for @esengine/server
 *
 * @example
 * ```typescript
 * import { createServer, Room, onMessage } from '@esengine/server';
 * import {
 *     withAuth,
 *     withRoomAuth,
 *     createJwtAuthProvider,
 *     requireAuth,
 *     requireRole,
 *     type AuthPlayer
 * } from '@esengine/server/auth';
 *
 * // 1. Create auth provider
 * const jwtProvider = createJwtAuthProvider({
 *     secret: process.env.JWT_SECRET!,
 *     expiresIn: 3600,
 * });
 *
 * // 2. Wrap server with auth
 * const server = withAuth(await createServer({ port: 3000 }), {
 *     provider: jwtProvider,
 *     extractCredentials: (req) => {
 *         const url = new URL(req.url, 'http://localhost');
 *         return url.searchParams.get('token');
 *     },
 * });
 *
 * // 3. Create auth-enabled room
 * class GameRoom extends withRoomAuth<User>(Room, {
 *     requireAuth: true,
 *     allowedRoles: ['player'],
 * }) {
 *     onJoin(player: AuthPlayer<User>) {
 *         console.log(`${player.user?.name} joined`);
 *     }
 *
 *     @requireAuth()
 *     @onMessage('Chat')
 *     handleChat(data: { text: string }, player: AuthPlayer<User>) {
 *         this.broadcast('Chat', { from: player.user?.name, text: data.text });
 *     }
 *
 *     @requireRole('admin')
 *     @onMessage('Kick')
 *     handleKick(data: { playerId: string }, player: AuthPlayer<User>) {
 *         this.kick(data.playerId);
 *     }
 * }
 *
 * server.define('game', GameRoom);
 * await server.start();
 * ```
 */

// Types
export type {
    AuthResult,
    AuthErrorCode,
    IAuthProvider,
    IAuthContext,
    AuthConnectionData,
    AuthConnection,
    AuthApiContext,
    AuthMsgContext,
    ConnectionRequest,
    AuthServerConfig,
    AuthGameServer,
    AuthRoomConfig,
    RequireAuthOptions,
    RequireRoleOptions
} from './types.js';

// Context
export {
    AuthContext,
    createGuestContext,
    createAuthContext,
    defaultUserExtractor,
    type UserInfoExtractor
} from './context.js';

// Providers
export {
    JwtAuthProvider,
    createJwtAuthProvider,
    type JwtAuthConfig,
    type JwtPayload
} from './providers/JwtAuthProvider.js';

export {
    SessionAuthProvider,
    createSessionAuthProvider,
    type SessionAuthConfig,
    type SessionData,
    type ISessionStorage
} from './providers/SessionAuthProvider.js';

// Mixins
export {
    withAuth,
    getAuthContext,
    setAuthContext,
    requireAuthentication,
    requireRole as requireRoleCheck
} from './mixin/withAuth.js';

export {
    withRoomAuth,
    AuthRoomBase,
    type AuthPlayer,
    type IAuthRoom,
    type AuthRoomClass
} from './mixin/withRoomAuth.js';

// Decorators
export {
    requireAuth,
    requireRole,
    getAuthMetadata,
    AUTH_METADATA_KEY,
    type AuthMetadata
} from './decorators/index.js';
