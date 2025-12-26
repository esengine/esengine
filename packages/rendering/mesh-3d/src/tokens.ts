/**
 * Service tokens for mesh-3d module.
 * mesh-3d 模块的服务令牌。
 */

import { createServiceToken } from '@esengine/ecs-framework';
import type { MeshRenderSystem } from './systems/MeshRenderSystem';

/**
 * Token for MeshRenderSystem service.
 * MeshRenderSystem 服务的令牌。
 */
export const MeshRenderSystemToken = createServiceToken<MeshRenderSystem>('meshRenderSystem');
