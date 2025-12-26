/**
 * @zh 网络蓝图节点
 * @en Network Blueprint Nodes
 *
 * @zh 提供网络功能的蓝图节点
 * @en Provides blueprint nodes for network functionality
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';

// =============================================================================
// 执行上下文接口 | Execution Context Interface
// =============================================================================

/**
 * @zh 网络上下文
 * @en Network context
 */
interface NetworkContext {
    entity: {
        getComponent<T>(type: new (...args: unknown[]) => T): T | null;
    };
    isServer: boolean;
    localPlayerId: number;
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
    setOutputs(nodeId: string, outputs: Record<string, unknown>): void;
}

// =============================================================================
// IsLocalPlayer 节点 | IsLocalPlayer Node
// =============================================================================

/**
 * @zh IsLocalPlayer 节点模板
 * @en IsLocalPlayer node template
 */
export const IsLocalPlayerTemplate: BlueprintNodeTemplate = {
    type: 'IsLocalPlayer',
    title: 'Is Local Player',
    category: 'entity',
    description: 'Check if this entity is the local player / 检查此实体是否是本地玩家',
    keywords: ['network', 'local', 'player', 'authority', 'owner'],
    menuPath: ['Network', 'Is Local Player'],
    isPure: true,
    inputs: [],
    outputs: [
        {
            name: 'isLocal',
            displayName: 'Is Local',
            type: 'bool'
        }
    ],
    color: '#ff9800'
};

/**
 * @zh IsLocalPlayer 节点执行器
 * @en IsLocalPlayer node executor
 */
export class IsLocalPlayerExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as NetworkContext;

        // Try to get NetworkIdentity component
        let isLocal = false;
        if (ctx.entity) {
            const identity = ctx.entity.getComponent(class NetworkIdentity {
                bIsLocalPlayer: boolean = false;
            });
            if (identity) {
                isLocal = identity.bIsLocalPlayer;
            }
        }

        return {
            outputs: {
                isLocal
            }
        };
    }
}

// =============================================================================
// IsServer 节点 | IsServer Node
// =============================================================================

/**
 * @zh IsServer 节点模板
 * @en IsServer node template
 */
export const IsServerTemplate: BlueprintNodeTemplate = {
    type: 'IsServer',
    title: 'Is Server',
    category: 'entity',
    description: 'Check if running on server / 检查是否在服务器上运行',
    keywords: ['network', 'server', 'authority', 'host'],
    menuPath: ['Network', 'Is Server'],
    isPure: true,
    inputs: [],
    outputs: [
        {
            name: 'isServer',
            displayName: 'Is Server',
            type: 'bool'
        }
    ],
    color: '#ff9800'
};

/**
 * @zh IsServer 节点执行器
 * @en IsServer node executor
 */
export class IsServerExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as NetworkContext;

        return {
            outputs: {
                isServer: ctx.isServer ?? false
            }
        };
    }
}

// =============================================================================
// HasAuthority 节点 | HasAuthority Node
// =============================================================================

/**
 * @zh HasAuthority 节点模板
 * @en HasAuthority node template
 */
export const HasAuthorityTemplate: BlueprintNodeTemplate = {
    type: 'HasAuthority',
    title: 'Has Authority',
    category: 'entity',
    description: 'Check if this entity has authority / 检查此实体是否有权限控制',
    keywords: ['network', 'authority', 'control', 'owner'],
    menuPath: ['Network', 'Has Authority'],
    isPure: true,
    inputs: [],
    outputs: [
        {
            name: 'hasAuthority',
            displayName: 'Has Authority',
            type: 'bool'
        }
    ],
    color: '#ff9800'
};

/**
 * @zh HasAuthority 节点执行器
 * @en HasAuthority node executor
 */
export class HasAuthorityExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as NetworkContext;

        let hasAuthority = false;
        if (ctx.entity) {
            const identity = ctx.entity.getComponent(class NetworkIdentity {
                bHasAuthority: boolean = false;
            });
            if (identity) {
                hasAuthority = identity.bHasAuthority;
            }
        }

        return {
            outputs: {
                hasAuthority
            }
        };
    }
}

// =============================================================================
// GetNetworkId 节点 | GetNetworkId Node
// =============================================================================

/**
 * @zh GetNetworkId 节点模板
 * @en GetNetworkId node template
 */
export const GetNetworkIdTemplate: BlueprintNodeTemplate = {
    type: 'GetNetworkId',
    title: 'Get Network ID',
    category: 'entity',
    description: 'Get the network ID of this entity / 获取此实体的网络 ID',
    keywords: ['network', 'id', 'netid', 'identity'],
    menuPath: ['Network', 'Get Network ID'],
    isPure: true,
    inputs: [],
    outputs: [
        {
            name: 'netId',
            displayName: 'Net ID',
            type: 'int'
        },
        {
            name: 'ownerId',
            displayName: 'Owner ID',
            type: 'int'
        }
    ],
    color: '#ff9800'
};

/**
 * @zh GetNetworkId 节点执行器
 * @en GetNetworkId node executor
 */
export class GetNetworkIdExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as NetworkContext;

        let netId = 0;
        let ownerId = 0;

        if (ctx.entity) {
            const identity = ctx.entity.getComponent(class NetworkIdentity {
                netId: number = 0;
                ownerId: number = 0;
            });
            if (identity) {
                netId = identity.netId;
                ownerId = identity.ownerId;
            }
        }

        return {
            outputs: {
                netId,
                ownerId
            }
        };
    }
}

// =============================================================================
// GetLocalPlayerId 节点 | GetLocalPlayerId Node
// =============================================================================

/**
 * @zh GetLocalPlayerId 节点模板
 * @en GetLocalPlayerId node template
 */
export const GetLocalPlayerIdTemplate: BlueprintNodeTemplate = {
    type: 'GetLocalPlayerId',
    title: 'Get Local Player ID',
    category: 'entity',
    description: 'Get the local player ID / 获取本地玩家 ID',
    keywords: ['network', 'local', 'player', 'id'],
    menuPath: ['Network', 'Get Local Player ID'],
    isPure: true,
    inputs: [],
    outputs: [
        {
            name: 'playerId',
            displayName: 'Player ID',
            type: 'int'
        }
    ],
    color: '#ff9800'
};

/**
 * @zh GetLocalPlayerId 节点执行器
 * @en GetLocalPlayerId node executor
 */
export class GetLocalPlayerIdExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as NetworkContext;

        return {
            outputs: {
                playerId: ctx.localPlayerId ?? 0
            }
        };
    }
}

// =============================================================================
// 节点定义集合 | Node Definition Collection
// =============================================================================

/**
 * @zh 网络节点定义集合
 * @en Network node definition collection
 */
export const NetworkNodeDefinitions = {
    templates: [
        IsLocalPlayerTemplate,
        IsServerTemplate,
        HasAuthorityTemplate,
        GetNetworkIdTemplate,
        GetLocalPlayerIdTemplate
    ],
    executors: new Map<string, INodeExecutor>([
        ['IsLocalPlayer', new IsLocalPlayerExecutor()],
        ['IsServer', new IsServerExecutor()],
        ['HasAuthority', new HasAuthorityExecutor()],
        ['GetNetworkId', new GetNetworkIdExecutor()],
        ['GetLocalPlayerId', new GetLocalPlayerIdExecutor()]
    ])
};
