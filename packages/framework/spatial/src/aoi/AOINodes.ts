/**
 * @zh AOI 蓝图节点
 * @en AOI Blueprint Nodes
 *
 * @zh 提供 AOI 功能的蓝图节点
 * @en Provides blueprint nodes for AOI functionality
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import type { IAOIManager } from './IAOI';

// =============================================================================
// 执行上下文接口 | Execution Context Interface
// =============================================================================

/**
 * @zh AOI 上下文
 * @en AOI context
 */
interface AOIContext {
    aoiManager: IAOIManager<unknown>;
    entity: unknown;
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
    setOutputs(nodeId: string, outputs: Record<string, unknown>): void;
}

// =============================================================================
// GetEntitiesInView 节点 | GetEntitiesInView Node
// =============================================================================

/**
 * @zh GetEntitiesInView 节点模板
 * @en GetEntitiesInView node template
 */
export const GetEntitiesInViewTemplate: BlueprintNodeTemplate = {
    type: 'GetEntitiesInView',
    title: 'Get Entities In View',
    category: 'entity',
    description: 'Get all entities within view range / 获取视野范围内的所有实体',
    keywords: ['aoi', 'view', 'entities', 'visible'],
    menuPath: ['AOI', 'Get Entities In View'],
    isPure: true,
    inputs: [
        {
            name: 'observer',
            displayName: 'Observer',
            type: 'object'
        }
    ],
    outputs: [
        {
            name: 'entities',
            displayName: 'Entities',
            type: 'array'
        },
        {
            name: 'count',
            displayName: 'Count',
            type: 'int'
        }
    ],
    color: '#9c27b0'
};

/**
 * @zh GetEntitiesInView 节点执行器
 * @en GetEntitiesInView node executor
 */
export class GetEntitiesInViewExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as AOIContext;
        const observer = ctx.evaluateInput(node.id, 'observer', ctx.entity);

        const entities = ctx.aoiManager?.getEntitiesInView(observer) ?? [];

        return {
            outputs: {
                entities,
                count: entities.length
            }
        };
    }
}

// =============================================================================
// GetObserversOf 节点 | GetObserversOf Node
// =============================================================================

/**
 * @zh GetObserversOf 节点模板
 * @en GetObserversOf node template
 */
export const GetObserversOfTemplate: BlueprintNodeTemplate = {
    type: 'GetObserversOf',
    title: 'Get Observers Of',
    category: 'entity',
    description: 'Get all observers who can see the entity / 获取能看到该实体的所有观察者',
    keywords: ['aoi', 'observers', 'watchers', 'visible'],
    menuPath: ['AOI', 'Get Observers Of'],
    isPure: true,
    inputs: [
        {
            name: 'target',
            displayName: 'Target',
            type: 'object'
        }
    ],
    outputs: [
        {
            name: 'observers',
            displayName: 'Observers',
            type: 'array'
        },
        {
            name: 'count',
            displayName: 'Count',
            type: 'int'
        }
    ],
    color: '#9c27b0'
};

/**
 * @zh GetObserversOf 节点执行器
 * @en GetObserversOf node executor
 */
export class GetObserversOfExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as AOIContext;
        const target = ctx.evaluateInput(node.id, 'target', ctx.entity);

        const observers = ctx.aoiManager?.getObserversOf(target) ?? [];

        return {
            outputs: {
                observers,
                count: observers.length
            }
        };
    }
}

// =============================================================================
// CanSee 节点 | CanSee Node
// =============================================================================

/**
 * @zh CanSee 节点模板
 * @en CanSee node template
 */
export const CanSeeTemplate: BlueprintNodeTemplate = {
    type: 'CanSee',
    title: 'Can See',
    category: 'entity',
    description: 'Check if observer can see target / 检查观察者是否能看到目标',
    keywords: ['aoi', 'visibility', 'can', 'see', 'check'],
    menuPath: ['AOI', 'Can See'],
    isPure: true,
    inputs: [
        {
            name: 'observer',
            displayName: 'Observer',
            type: 'object'
        },
        {
            name: 'target',
            displayName: 'Target',
            type: 'object'
        }
    ],
    outputs: [
        {
            name: 'canSee',
            displayName: 'Can See',
            type: 'bool'
        }
    ],
    color: '#9c27b0'
};

/**
 * @zh CanSee 节点执行器
 * @en CanSee node executor
 */
export class CanSeeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as AOIContext;
        const observer = ctx.evaluateInput(node.id, 'observer', ctx.entity);
        const target = ctx.evaluateInput(node.id, 'target', null);

        const canSee = ctx.aoiManager?.canSee(observer, target) ?? false;

        return {
            outputs: {
                canSee
            }
        };
    }
}

// =============================================================================
// OnEntityEnterView 事件节点 | OnEntityEnterView Event Node
// =============================================================================

/**
 * @zh OnEntityEnterView 事件节点模板
 * @en OnEntityEnterView event node template
 */
export const OnEntityEnterViewTemplate: BlueprintNodeTemplate = {
    type: 'EventEntityEnterView',
    title: 'On Entity Enter View',
    category: 'event',
    description: 'Triggered when an entity enters view / 当实体进入视野时触发',
    keywords: ['aoi', 'event', 'enter', 'view', 'visible'],
    menuPath: ['AOI', 'Events', 'On Entity Enter View'],
    color: '#e91e63',
    inputs: [],
    outputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'entity',
            displayName: 'Entity',
            type: 'object'
        },
        {
            name: 'positionX',
            displayName: 'Position X',
            type: 'float'
        },
        {
            name: 'positionY',
            displayName: 'Position Y',
            type: 'float'
        }
    ]
};

/**
 * @zh OnEntityEnterView 事件执行器
 * @en OnEntityEnterView event executor
 */
export class OnEntityEnterViewExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, _context: unknown): ExecutionResult {
        // Event nodes don't execute directly, they are triggered by the runtime
        return { nextExec: 'exec' };
    }
}

// =============================================================================
// OnEntityExitView 事件节点 | OnEntityExitView Event Node
// =============================================================================

/**
 * @zh OnEntityExitView 事件节点模板
 * @en OnEntityExitView event node template
 */
export const OnEntityExitViewTemplate: BlueprintNodeTemplate = {
    type: 'EventEntityExitView',
    title: 'On Entity Exit View',
    category: 'event',
    description: 'Triggered when an entity exits view / 当实体离开视野时触发',
    keywords: ['aoi', 'event', 'exit', 'view', 'invisible'],
    menuPath: ['AOI', 'Events', 'On Entity Exit View'],
    color: '#e91e63',
    inputs: [],
    outputs: [
        {
            name: 'exec',
            displayName: '',
            type: 'exec'
        },
        {
            name: 'entity',
            displayName: 'Entity',
            type: 'object'
        },
        {
            name: 'positionX',
            displayName: 'Position X',
            type: 'float'
        },
        {
            name: 'positionY',
            displayName: 'Position Y',
            type: 'float'
        }
    ]
};

/**
 * @zh OnEntityExitView 事件执行器
 * @en OnEntityExitView event executor
 */
export class OnEntityExitViewExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, _context: unknown): ExecutionResult {
        // Event nodes don't execute directly, they are triggered by the runtime
        return { nextExec: 'exec' };
    }
}

// =============================================================================
// 节点定义集合 | Node Definition Collection
// =============================================================================

/**
 * @zh AOI 节点定义集合
 * @en AOI node definition collection
 */
export const AOINodeDefinitions = {
    templates: [
        GetEntitiesInViewTemplate,
        GetObserversOfTemplate,
        CanSeeTemplate,
        OnEntityEnterViewTemplate,
        OnEntityExitViewTemplate
    ],
    executors: new Map<string, INodeExecutor>([
        ['GetEntitiesInView', new GetEntitiesInViewExecutor()],
        ['GetObserversOf', new GetObserversOfExecutor()],
        ['CanSee', new CanSeeExecutor()],
        ['EventEntityEnterView', new OnEntityEnterViewExecutor()],
        ['EventEntityExitView', new OnEntityExitViewExecutor()]
    ])
};
