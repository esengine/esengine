/**
 * @zh Script Runtime 模块服务令牌
 * @en Script Runtime module service tokens
 *
 * @zh 遵循"谁定义接口，谁导出 Token"原则
 * @en Following "who defines interface, who exports Token" principle
 */

import { createServiceToken } from '@esengine/ecs-framework';

import type { ServerBlueprintVM } from './vm/ServerBlueprintVM';
import type { IMemoryStore } from './persistence/IMemoryStore';

// =============================================================================
// 服务接口 | Service Interfaces
// =============================================================================

/**
 * @zh 脚本运行时服务接口
 * @en Script runtime service interface
 */
export interface IScriptRuntimeService {
    /**
     * @zh 为玩家创建 VM
     * @en Create VM for player
     */
    createPlayerVM(playerId: string, blueprintPath: string): Promise<ServerBlueprintVM>;

    /**
     * @zh 获取玩家的 VM
     * @en Get player's VM
     */
    getPlayerVM(playerId: string): ServerBlueprintVM | undefined;

    /**
     * @zh 移除玩家的 VM
     * @en Remove player's VM
     */
    removePlayerVM(playerId: string): void;

    /**
     * @zh 获取所有活跃玩家 ID
     * @en Get all active player IDs
     */
    getActivePlayerIds(): string[];
}

// =============================================================================
// 服务令牌 | Service Tokens
// =============================================================================

/**
 * @zh 脚本运行时服务令牌
 * @en Script runtime service token
 *
 * @example
 * ```typescript
 * import { ScriptRuntimeServiceToken } from '@esengine/script-runtime';
 *
 * const service = context.services.get(ScriptRuntimeServiceToken);
 * const vm = await service.createPlayerVM('player1', 'blueprints/main.bp');
 * ```
 */
export const ScriptRuntimeServiceToken = createServiceToken<IScriptRuntimeService>('scriptRuntimeService');

/**
 * @zh Memory 存储服务令牌
 * @en Memory store service token
 *
 * @example
 * ```typescript
 * import { MemoryStoreToken } from '@esengine/script-runtime';
 *
 * const store = context.services.get(MemoryStoreToken);
 * const memory = await store.loadPlayerMemory('player1');
 * ```
 */
export const MemoryStoreToken = createServiceToken<IMemoryStore>('memoryStore');
