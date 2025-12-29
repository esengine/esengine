/**
 * @zh requireRole 装饰器
 * @en requireRole decorator
 */

import type { RequireRoleOptions } from '../types.js';
import { AUTH_METADATA_KEY, getAuthMetadata, type AuthMetadata } from './requireAuth.js';

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
 * @zh 要求角色装饰器
 * @en Require role decorator
 *
 * @zh 标记方法需要特定角色才能访问
 * @en Marks method as requiring specific role(s)
 *
 * @example
 * ```typescript
 * class AdminRoom extends withRoomAuth(Room) {
 *     @requireRole('admin')
 *     @onMessage('Ban')
 *     handleBan(data: BanData, player: AuthPlayer) {
 *         // Only admins can ban
 *     }
 *
 *     @requireRole(['moderator', 'admin'])
 *     @onMessage('Mute')
 *     handleMute(data: MuteData, player: AuthPlayer) {
 *         // Moderators or admins can mute
 *     }
 *
 *     @requireRole(['verified', 'premium'], { mode: 'all' })
 *     @onMessage('SpecialFeature')
 *     handleSpecial(data: any, player: AuthPlayer) {
 *         // Requires both verified AND premium roles
 *     }
 * }
 * ```
 */
export function requireRole(
    roles: string | string[],
    options?: RequireRoleOptions
): MethodDecorator {
    return function (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const key = String(propertyKey);
        const existing = getAuthMetadata(target, key);
        const roleArray = Array.isArray(roles) ? roles : [roles];

        setAuthMetadata(target, key, {
            ...existing,
            requireAuth: true,
            roles: roleArray,
            roleMode: options?.mode ?? 'any',
            options
        });

        return descriptor;
    };
}
