/**
 * @zh requireAuth 装饰器
 * @en requireAuth decorator
 */

import type { RequireAuthOptions } from '../types.js';

/**
 * @zh 认证元数据键
 * @en Auth metadata key
 */
export const AUTH_METADATA_KEY = Symbol('authMetadata');

/**
 * @zh 认证元数据
 * @en Auth metadata
 */
export interface AuthMetadata {
    requireAuth: boolean;
    options?: RequireAuthOptions;
    roles?: string[];
    roleMode?: 'any' | 'all';
}

/**
 * @zh 获取方法的认证元数据
 * @en Get auth metadata for method
 */
export function getAuthMetadata(target: any, propertyKey: string): AuthMetadata | undefined {
    const metadata = target[AUTH_METADATA_KEY] as Map<string, AuthMetadata> | undefined;
    return metadata?.get(propertyKey);
}

/**
 * @zh 设置方法的认证元数据
 * @en Set auth metadata for method
 */
function setAuthMetadata(target: any, propertyKey: string, metadata: AuthMetadata): void {
    if (!target[AUTH_METADATA_KEY]) {
        target[AUTH_METADATA_KEY] = new Map<string, AuthMetadata>();
    }
    (target[AUTH_METADATA_KEY] as Map<string, AuthMetadata>).set(propertyKey, metadata);
}

/**
 * @zh 要求认证装饰器
 * @en Require authentication decorator
 *
 * @zh 标记方法需要认证才能访问，用于消息处理器
 * @en Marks method as requiring authentication, used for message handlers
 *
 * @example
 * ```typescript
 * class GameRoom extends withRoomAuth(Room) {
 *     @requireAuth()
 *     @onMessage('Trade')
 *     handleTrade(data: TradeData, player: AuthPlayer) {
 *         // Only authenticated players can trade
 *     }
 *
 *     @requireAuth({ allowGuest: true })
 *     @onMessage('Chat')
 *     handleChat(data: ChatData, player: AuthPlayer) {
 *         // Guests can also chat
 *     }
 * }
 * ```
 */
export function requireAuth(options?: RequireAuthOptions): MethodDecorator {
    return function (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const key = String(propertyKey);
        const existing = getAuthMetadata(target, key);

        setAuthMetadata(target, key, {
            ...existing,
            requireAuth: true,
            options
        });

        return descriptor;
    };
}
