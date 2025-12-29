/**
 * @zh 认证装饰器
 * @en Authentication decorators
 */

export {
    requireAuth,
    getAuthMetadata,
    AUTH_METADATA_KEY,
    type AuthMetadata
} from './requireAuth.js';

export { requireRole } from './requireRole.js';
