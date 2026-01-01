/**
 * @zh 房间认证 Mixin
 * @en Room authentication mixin
 */

import type { Room, Player } from '../../room/index.js';
import type { IAuthContext, AuthRoomConfig } from '../types.js';
import { createLogger } from '../../logger.js';
import { getAuthContext } from './withAuth.js';
import { createGuestContext } from '../context.js';

const logger = createLogger('AuthRoom');

/**
 * @zh 带认证的玩家
 * @en Player with authentication
 */
export interface AuthPlayer<TUser = unknown, TData = Record<string, unknown>> extends Player<TData> {
    /**
     * @zh 认证上下文
     * @en Authentication context
     */
    readonly auth: IAuthContext<TUser>;

    /**
     * @zh 用户信息（快捷访问）
     * @en User info (shortcut)
     */
    readonly user: TUser | null;
}

/**
 * @zh 带认证的房间接口
 * @en Room with authentication interface
 */
export interface IAuthRoom<TUser = unknown> {
    /**
     * @zh 认证钩子（在 onJoin 之前调用）
     * @en Auth hook (called before onJoin)
     */
    onAuth?(player: AuthPlayer<TUser>): boolean | Promise<boolean>;

    /**
     * @zh 获取带认证信息的玩家
     * @en Get player with auth info
     */
    getAuthPlayer(id: string): AuthPlayer<TUser> | undefined;

    /**
     * @zh 获取所有带认证信息的玩家
     * @en Get all players with auth info
     */
    getAuthPlayers(): AuthPlayer<TUser>[];

    /**
     * @zh 按角色获取玩家
     * @en Get players by role
     */
    getPlayersByRole(role: string): AuthPlayer<TUser>[];

    /**
     * @zh 按用户 ID 获取玩家
     * @en Get player by user ID
     */
    getPlayerByUserId(userId: string): AuthPlayer<TUser> | undefined;
}

/**
 * @zh 认证房间构造器类型
 * @en Auth room constructor type
 */
export type AuthRoomClass<TUser = unknown> = new (...args: any[]) => Room & IAuthRoom<TUser>;

/**
 * @zh 玩家认证上下文存储
 * @en Player auth context storage
 */
const playerAuthContexts = new WeakMap<Player, IAuthContext<unknown>>();

/**
 * @zh 包装玩家对象添加认证信息
 * @en Wrap player object with auth info
 */
function wrapPlayerWithAuth<TUser>(player: Player, authContext: IAuthContext<TUser>): AuthPlayer<TUser> {
    playerAuthContexts.set(player, authContext);

    Object.defineProperty(player, 'auth', {
        get: () => playerAuthContexts.get(player) ?? createGuestContext<TUser>(),
        enumerable: true,
        configurable: false
    });

    Object.defineProperty(player, 'user', {
        get: () => (playerAuthContexts.get(player) as IAuthContext<TUser> | undefined)?.user ?? null,
        enumerable: true,
        configurable: false
    });

    return player as AuthPlayer<TUser>;
}

/**
 * @zh 包装房间类添加认证功能
 * @en Wrap room class with authentication functionality
 *
 * @zh 使用 mixin 模式为房间添加认证检查，在玩家加入前验证认证状态
 * @en Uses mixin pattern to add auth checks to room, validates auth before player joins
 *
 * @example
 * ```typescript
 * import { Room, onMessage } from '@esengine/server';
 * import { withRoomAuth, type AuthPlayer } from '@esengine/server/auth';
 *
 * interface User {
 *     id: string;
 *     name: string;
 *     roles: string[];
 * }
 *
 * class GameRoom extends withRoomAuth<User>(Room, {
 *     requireAuth: true,
 *     allowedRoles: ['player', 'premium'],
 * }) {
 *     onJoin(player: AuthPlayer<User>) {
 *         console.log(`${player.user?.name} joined the game`);
 *         this.broadcast('PlayerJoined', {
 *             id: player.id,
 *             name: player.user?.name
 *         });
 *     }
 *
 *     // Optional: custom auth validation
 *     async onAuth(player: AuthPlayer<User>): Promise<boolean> {
 *         // Additional validation logic
 *         if (player.auth.hasRole('banned')) {
 *             return false;
 *         }
 *         return true;
 *     }
 *
 *     @onMessage('Chat')
 *     handleChat(data: { text: string }, player: AuthPlayer<User>) {
 *         this.broadcast('Chat', {
 *             from: player.user?.name ?? 'Guest',
 *             text: data.text
 *         });
 *     }
 * }
 * ```
 */
export function withRoomAuth<TUser = unknown, TBase extends new (...args: any[]) => Room = new (...args: any[]) => Room>(
    Base: TBase,
    config: AuthRoomConfig = {}
): TBase & (new (...args: any[]) => IAuthRoom<TUser>) {
    const {
        requireAuth = true,
        allowedRoles = [],
        roleCheckMode = 'any'
    } = config;

    abstract class AuthRoom extends (Base as new (...args: any[]) => Room) implements IAuthRoom<TUser> {
        private _originalOnJoin: ((player: Player) => void | Promise<void>) | undefined;

        constructor(...args: any[]) {
            super(...args);
            this._originalOnJoin = this.onJoin?.bind(this);
            this.onJoin = this._authOnJoin.bind(this);
        }

        /**
         * @zh 认证钩子（可覆盖）
         * @en Auth hook (can be overridden)
         */
        onAuth?(player: AuthPlayer<TUser>): boolean | Promise<boolean>;

        /**
         * @zh 包装的 onJoin 方法
         * @en Wrapped onJoin method
         */
        private async _authOnJoin(player: Player): Promise<void> {
            const conn = (player as any).connection ?? (player as any)._conn;
            const authContext = conn
                ? (getAuthContext<TUser>(conn) ?? createGuestContext<TUser>())
                : createGuestContext<TUser>();

            if (requireAuth && !authContext.isAuthenticated) {
                logger.warn(`Rejected unauthenticated player: ${player.id}`);
                this.kick(player as any, 'Authentication required');
                return;
            }

            if (allowedRoles.length > 0) {
                const hasRole = roleCheckMode === 'any'
                    ? authContext.hasAnyRole(allowedRoles)
                    : authContext.hasAllRoles(allowedRoles);

                if (!hasRole) {
                    logger.warn(`Rejected player ${player.id}: insufficient roles`);
                    this.kick(player as any, 'Insufficient permissions');
                    return;
                }
            }

            const authPlayer = wrapPlayerWithAuth<TUser>(player, authContext);

            if (typeof this.onAuth === 'function') {
                try {
                    const allowed = await this.onAuth(authPlayer);
                    if (!allowed) {
                        logger.warn(`Rejected player ${player.id}: onAuth returned false`);
                        this.kick(player as any, 'Authentication rejected');
                        return;
                    }
                } catch (error) {
                    logger.error(`Error in onAuth for player ${player.id}:`, error);
                    this.kick(player as any, 'Authentication error');
                    return;
                }
            }

            if (this._originalOnJoin) {
                await this._originalOnJoin(authPlayer as unknown as Player);
            }
        }

        /**
         * @zh 获取带认证信息的玩家
         * @en Get player with auth info
         */
        getAuthPlayer(id: string): AuthPlayer<TUser> | undefined {
            const player = this.getPlayer(id);
            return player as AuthPlayer<TUser> | undefined;
        }

        /**
         * @zh 获取所有带认证信息的玩家
         * @en Get all players with auth info
         */
        getAuthPlayers(): AuthPlayer<TUser>[] {
            return this.players as AuthPlayer<TUser>[];
        }

        /**
         * @zh 按角色获取玩家
         * @en Get players by role
         */
        getPlayersByRole(role: string): AuthPlayer<TUser>[] {
            return this.getAuthPlayers().filter((p) => p.auth?.hasRole(role));
        }

        /**
         * @zh 按用户 ID 获取玩家
         * @en Get player by user ID
         */
        getPlayerByUserId(userId: string): AuthPlayer<TUser> | undefined {
            return this.getAuthPlayers().find((p) => p.auth?.userId === userId);
        }
    }

    return AuthRoom as unknown as TBase & (new (...args: any[]) => IAuthRoom<TUser>);
}

/**
 * @zh 抽象认证房间基类
 * @en Abstract auth room base class
 *
 * @zh 如果不想使用 mixin，可以直接继承此类
 * @en If you don't want to use mixin, you can extend this class directly
 *
 * @example
 * ```typescript
 * import { AuthRoomBase } from '@esengine/server/auth';
 *
 * class GameRoom extends AuthRoomBase<User> {
 *     protected readonly authConfig = {
 *         requireAuth: true,
 *         allowedRoles: ['player']
 *     };
 *
 *     onJoin(player: AuthPlayer<User>) {
 *         // player has .auth and .user properties
 *     }
 * }
 * ```
 */
export abstract class AuthRoomBase<TUser = unknown, TState = any, TPlayerData = Record<string, unknown>>
implements IAuthRoom<TUser> {

    /**
     * @zh 认证配置（子类可覆盖）
     * @en Auth config (can be overridden by subclass)
     */
    protected readonly authConfig: AuthRoomConfig = {
        requireAuth: true,
        allowedRoles: [],
        roleCheckMode: 'any'
    };

    /**
     * @zh 认证钩子
     * @en Auth hook
     */
    onAuth?(player: AuthPlayer<TUser>): boolean | Promise<boolean>;

    getAuthPlayer(id: string): AuthPlayer<TUser> | undefined {
        return undefined;
    }

    getAuthPlayers(): AuthPlayer<TUser>[] {
        return [];
    }

    getPlayersByRole(role: string): AuthPlayer<TUser>[] {
        return [];
    }

    getPlayerByUserId(userId: string): AuthPlayer<TUser> | undefined {
        return undefined;
    }
}
