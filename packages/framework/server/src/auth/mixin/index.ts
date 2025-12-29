/**
 * @zh 认证 Mixin
 * @en Authentication mixins
 */

export {
    withAuth,
    getAuthContext,
    setAuthContext,
    requireAuthentication,
    requireRole
} from './withAuth.js';

export {
    withRoomAuth,
    AuthRoomBase,
    type AuthPlayer,
    type IAuthRoom,
    type AuthRoomClass
} from './withRoomAuth.js';
