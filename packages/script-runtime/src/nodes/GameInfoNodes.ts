/**
 * @zh 游戏信息节点
 * @en Game Info Nodes
 *
 * @zh 提供获取游戏状态信息的能力
 * @en Provides access to game state information
 */

import type { BlueprintNodeTemplate, BlueprintNode } from '@esengine/blueprint';
import type { INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import type { IGameState } from '../vm/ServerExecutionContext';

// =============================================================================
// 扩展的执行上下文接口 | Extended Execution Context Interface
// =============================================================================

interface ServerContext {
    gameState: IGameState | null;
    playerId: string;
    deltaTime: number;
}

// =============================================================================
// GetTick Node | 获取 Tick 节点
// =============================================================================

/**
 * @zh 获取 Tick 节点模板
 * @en Get Tick node template
 */
export const GetTickTemplate: BlueprintNodeTemplate = {
    type: 'GetTick',
    title: 'Get Tick',
    category: 'time',
    description: 'Get the current game tick / 获取当前游戏 tick',
    keywords: ['tick', 'time', 'frame', 'turn'],
    menuPath: ['Game', 'Get Tick'],
    isPure: true,
    inputs: [],
    outputs: [
        {
            name: 'tick',
            displayName: 'Tick',
            type: 'int'
        }
    ],
    color: '#1e6b8b'
};

/**
 * @zh 获取 Tick 节点执行器
 * @en Get Tick node executor
 */
export class GetTickExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ServerContext;
        const tick = ctx.gameState?.tick ?? 0;

        return {
            outputs: { tick }
        };
    }
}

// =============================================================================
// GetPlayerId Node | 获取玩家 ID 节点
// =============================================================================

/**
 * @zh 获取玩家 ID 节点模板
 * @en Get Player ID node template
 */
export const GetPlayerIdTemplate: BlueprintNodeTemplate = {
    type: 'GetPlayerId',
    title: 'Get Player ID',
    category: 'entity',
    description: 'Get the current player ID / 获取当前玩家 ID',
    keywords: ['player', 'id', 'owner', 'me'],
    menuPath: ['Game', 'Get Player ID'],
    isPure: true,
    inputs: [],
    outputs: [
        {
            name: 'playerId',
            displayName: 'Player ID',
            type: 'string'
        }
    ],
    color: '#1e5a8b'
};

/**
 * @zh 获取玩家 ID 节点执行器
 * @en Get Player ID node executor
 */
export class GetPlayerIdExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ServerContext;

        return {
            outputs: { playerId: ctx.playerId }
        };
    }
}

// =============================================================================
// GetDeltaTime Node | 获取增量时间节点
// =============================================================================

/**
 * @zh 获取增量时间节点模板
 * @en Get Delta Time node template
 */
export const GetDeltaTimeTemplate: BlueprintNodeTemplate = {
    type: 'GetDeltaTime',
    title: 'Get Delta Time',
    category: 'time',
    description: 'Get the time since last tick (seconds) / 获取距上次 tick 的时间（秒）',
    keywords: ['delta', 'time', 'dt', 'interval'],
    menuPath: ['Game', 'Get Delta Time'],
    isPure: true,
    inputs: [],
    outputs: [
        {
            name: 'deltaTime',
            displayName: 'Delta Time',
            type: 'float'
        }
    ],
    color: '#1e6b8b'
};

/**
 * @zh 获取增量时间节点执行器
 * @en Get Delta Time node executor
 */
export class GetDeltaTimeExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ServerContext;

        return {
            outputs: { deltaTime: ctx.deltaTime }
        };
    }
}

// =============================================================================
// GetGameState Node | 获取游戏状态节点
// =============================================================================

/**
 * @zh 获取游戏状态节点模板
 * @en Get Game State node template
 */
export const GetGameStateTemplate: BlueprintNodeTemplate = {
    type: 'GetGameState',
    title: 'Get Game State',
    category: 'entity',
    description: 'Get the current game state object / 获取当前游戏状态对象',
    keywords: ['game', 'state', 'world', 'data'],
    menuPath: ['Game', 'Get Game State'],
    isPure: true,
    inputs: [],
    outputs: [
        {
            name: 'state',
            displayName: 'State',
            type: 'object'
        }
    ],
    color: '#1e5a8b'
};

/**
 * @zh 获取游戏状态节点执行器
 * @en Get Game State node executor
 */
export class GetGameStateExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ServerContext;

        return {
            outputs: { state: ctx.gameState }
        };
    }
}

// =============================================================================
// 节点定义集合 | Node Definition Collection
// =============================================================================

/**
 * @zh 游戏信息节点定义
 * @en Game info node definitions
 */
export const GameInfoNodeDefinitions = [
    { template: GetTickTemplate, executor: new GetTickExecutor() },
    { template: GetPlayerIdTemplate, executor: new GetPlayerIdExecutor() },
    { template: GetDeltaTimeTemplate, executor: new GetDeltaTimeExecutor() },
    { template: GetGameStateTemplate, executor: new GetGameStateExecutor() }
];
