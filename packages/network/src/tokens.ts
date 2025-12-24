/**
 * Network 模块服务令牌
 * Network module service tokens
 */

import { createServiceToken } from '@esengine/ecs-framework';
import type { NetworkService } from './services/NetworkService';
import type { NetworkSyncSystem } from './systems/NetworkSyncSystem';
import type { NetworkSpawnSystem } from './systems/NetworkSpawnSystem';
import type { NetworkInputSystem } from './systems/NetworkInputSystem';

// ============================================================================
// Network 模块导出的令牌 | Tokens exported by Network module
// ============================================================================

/**
 * 网络服务令牌
 * Network service token
 */
export const NetworkServiceToken = createServiceToken<NetworkService>('networkService');

/**
 * 网络同步系统令牌
 * Network sync system token
 */
export const NetworkSyncSystemToken = createServiceToken<NetworkSyncSystem>('networkSyncSystem');

/**
 * 网络生成系统令牌
 * Network spawn system token
 */
export const NetworkSpawnSystemToken = createServiceToken<NetworkSpawnSystem>('networkSpawnSystem');

/**
 * 网络输入系统令牌
 * Network input system token
 */
export const NetworkInputSystemToken = createServiceToken<NetworkInputSystem>('networkInputSystem');
