/**
 * @zh 蓝图节点模块
 * @en Blueprint Nodes Module
 *
 * @zh 提供服务器端蓝图执行所需的通用节点
 * @en Provides common nodes for server-side blueprint execution
 */

import { NodeRegistry } from '@esengine/blueprint';

// Memory Nodes
export {
    GetMemoryTemplate,
    GetMemoryExecutor,
    SetMemoryTemplate,
    SetMemoryExecutor,
    HasMemoryKeyTemplate,
    HasMemoryKeyExecutor,
    DeleteMemoryTemplate,
    DeleteMemoryExecutor,
    MemoryNodeDefinitions
} from './MemoryNodes';

// Log Nodes
export {
    LogTemplate,
    LogExecutor,
    WarnTemplate,
    WarnExecutor,
    ErrorTemplate,
    ErrorExecutor,
    LogNodeDefinitions
} from './LogNodes';

// Game Info Nodes
export {
    GetTickTemplate,
    GetTickExecutor,
    GetPlayerIdTemplate,
    GetPlayerIdExecutor,
    GetDeltaTimeTemplate,
    GetDeltaTimeExecutor,
    GetGameStateTemplate,
    GetGameStateExecutor,
    GameInfoNodeDefinitions
} from './GameInfoNodes';

// =============================================================================
// 节点注册 | Node Registration
// =============================================================================

import { MemoryNodeDefinitions } from './MemoryNodes';
import { LogNodeDefinitions } from './LogNodes';
import { GameInfoNodeDefinitions } from './GameInfoNodes';

/**
 * @zh 所有节点定义
 * @en All node definitions
 */
export const AllNodeDefinitions = [
    ...MemoryNodeDefinitions,
    ...LogNodeDefinitions,
    ...GameInfoNodeDefinitions
];

/**
 * @zh 注册所有 script-runtime 节点到 NodeRegistry
 * @en Register all script-runtime nodes to NodeRegistry
 *
 * @example
 * ```typescript
 * import { registerScriptRuntimeNodes } from '@esengine/script-runtime';
 *
 * // 在应用启动时调用 | Call at application startup
 * registerScriptRuntimeNodes();
 * ```
 */
export function registerScriptRuntimeNodes(): void {
    const registry = NodeRegistry.instance;

    for (const { template, executor } of AllNodeDefinitions) {
        registry.register(template, executor);
    }
}
