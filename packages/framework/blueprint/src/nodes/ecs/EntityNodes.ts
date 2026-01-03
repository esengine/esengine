/**
 * @zh ECS 实体操作节点
 * @en ECS Entity Operation Nodes
 *
 * @zh 提供蓝图中对 ECS 实体的完整操作支持
 * @en Provides complete ECS entity operations in blueprint
 */

import type { Entity } from '@esengine/ecs-framework';
import { BlueprintNodeTemplate, BlueprintNode } from '../../types/nodes';
import { ExecutionContext, ExecutionResult } from '../../runtime/ExecutionContext';
import { INodeExecutor, RegisterNode } from '../../runtime/NodeRegistry';

// ============================================================================
// Self Entity | 自身实体
// ============================================================================

export const GetSelfTemplate: BlueprintNodeTemplate = {
    type: 'ECS_GetSelf',
    title: 'Get Self',
    category: 'entity',
    color: '#1e5a8b',
    isPure: true,
    description: 'Gets the entity that owns this blueprint (获取拥有此蓝图的实体)',
    keywords: ['self', 'this', 'owner', 'entity', 'me'],
    menuPath: ['ECS', 'Entity', 'Get Self'],
    inputs: [],
    outputs: [
        { name: 'entity', type: 'entity', displayName: 'Self' }
    ]
};

@RegisterNode(GetSelfTemplate)
export class GetSelfExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        return { outputs: { entity: context.entity } };
    }
}

// ============================================================================
// Create Entity | 创建实体
// ============================================================================

export const CreateEntityTemplate: BlueprintNodeTemplate = {
    type: 'ECS_CreateEntity',
    title: 'Create Entity',
    category: 'entity',
    color: '#1e5a8b',
    description: 'Creates a new entity in the scene (在场景中创建新实体)',
    keywords: ['entity', 'create', 'spawn', 'new', 'instantiate'],
    menuPath: ['ECS', 'Entity', 'Create Entity'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'name', type: 'string', displayName: 'Name', defaultValue: 'NewEntity' }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'entity', type: 'entity', displayName: 'Entity' }
    ]
};

@RegisterNode(CreateEntityTemplate)
export class CreateEntityExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const name = context.evaluateInput(node.id, 'name', 'NewEntity') as string;
        const entity = context.scene.createEntity(name);
        return { outputs: { entity }, nextExec: 'exec' };
    }
}

// ============================================================================
// Destroy Entity | 销毁实体
// ============================================================================

export const DestroyEntityTemplate: BlueprintNodeTemplate = {
    type: 'ECS_DestroyEntity',
    title: 'Destroy Entity',
    category: 'entity',
    color: '#8b1e1e',
    description: 'Destroys an entity from the scene (从场景中销毁实体)',
    keywords: ['entity', 'destroy', 'remove', 'delete', 'kill'],
    menuPath: ['ECS', 'Entity', 'Destroy Entity'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'entity', type: 'entity', displayName: 'Entity' }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: '' }
    ]
};

@RegisterNode(DestroyEntityTemplate)
export class DestroyEntityExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', null) as Entity | null;
        if (entity && !entity.isDestroyed) {
            entity.destroy();
        }
        return { nextExec: 'exec' };
    }
}

// ============================================================================
// Destroy Self | 销毁自身
// ============================================================================

export const DestroySelfTemplate: BlueprintNodeTemplate = {
    type: 'ECS_DestroySelf',
    title: 'Destroy Self',
    category: 'entity',
    color: '#8b1e1e',
    description: 'Destroys the entity that owns this blueprint (销毁拥有此蓝图的实体)',
    keywords: ['self', 'destroy', 'suicide', 'remove', 'delete'],
    menuPath: ['ECS', 'Entity', 'Destroy Self'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' }
    ],
    outputs: []
};

@RegisterNode(DestroySelfTemplate)
export class DestroySelfExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        if (!context.entity.isDestroyed) {
            context.entity.destroy();
        }
        return { nextExec: null };
    }
}

// ============================================================================
// Is Valid | 是否有效
// ============================================================================

export const IsValidTemplate: BlueprintNodeTemplate = {
    type: 'ECS_IsValid',
    title: 'Is Valid',
    category: 'entity',
    color: '#1e5a8b',
    isPure: true,
    description: 'Checks if an entity reference is valid and not destroyed (检查实体引用是否有效且未被销毁)',
    keywords: ['entity', 'valid', 'null', 'check', 'exists', 'alive'],
    menuPath: ['ECS', 'Entity', 'Is Valid'],
    inputs: [
        { name: 'entity', type: 'entity', displayName: 'Entity' }
    ],
    outputs: [
        { name: 'isValid', type: 'bool', displayName: 'Is Valid' }
    ]
};

@RegisterNode(IsValidTemplate)
export class IsValidExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', null) as Entity | null;
        const isValid = entity != null && !entity.isDestroyed;
        return { outputs: { isValid } };
    }
}

// ============================================================================
// Get Entity Name | 获取实体名称
// ============================================================================

export const GetEntityNameTemplate: BlueprintNodeTemplate = {
    type: 'ECS_GetEntityName',
    title: 'Get Entity Name',
    category: 'entity',
    color: '#1e5a8b',
    isPure: true,
    description: 'Gets the name of an entity (获取实体的名称)',
    keywords: ['entity', 'name', 'get', 'string'],
    menuPath: ['ECS', 'Entity', 'Get Name'],
    inputs: [
        { name: 'entity', type: 'entity', displayName: 'Entity' }
    ],
    outputs: [
        { name: 'name', type: 'string', displayName: 'Name' }
    ]
};

@RegisterNode(GetEntityNameTemplate)
export class GetEntityNameExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;
        return { outputs: { name: entity?.name ?? '' } };
    }
}

// ============================================================================
// Set Entity Name | 设置实体名称
// ============================================================================

export const SetEntityNameTemplate: BlueprintNodeTemplate = {
    type: 'ECS_SetEntityName',
    title: 'Set Entity Name',
    category: 'entity',
    color: '#1e5a8b',
    description: 'Sets the name of an entity (设置实体的名称)',
    keywords: ['entity', 'name', 'set', 'rename'],
    menuPath: ['ECS', 'Entity', 'Set Name'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'entity', type: 'entity', displayName: 'Entity' },
        { name: 'name', type: 'string', displayName: 'Name', defaultValue: '' }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: '' }
    ]
};

@RegisterNode(SetEntityNameTemplate)
export class SetEntityNameExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;
        const name = context.evaluateInput(node.id, 'name', '') as string;
        if (entity && !entity.isDestroyed) {
            entity.name = name;
        }
        return { nextExec: 'exec' };
    }
}

// ============================================================================
// Get Entity Tag | 获取实体标签
// ============================================================================

export const GetEntityTagTemplate: BlueprintNodeTemplate = {
    type: 'ECS_GetEntityTag',
    title: 'Get Entity Tag',
    category: 'entity',
    color: '#1e5a8b',
    isPure: true,
    description: 'Gets the tag of an entity (获取实体的标签)',
    keywords: ['entity', 'tag', 'get', 'category'],
    menuPath: ['ECS', 'Entity', 'Get Tag'],
    inputs: [
        { name: 'entity', type: 'entity', displayName: 'Entity' }
    ],
    outputs: [
        { name: 'tag', type: 'int', displayName: 'Tag' }
    ]
};

@RegisterNode(GetEntityTagTemplate)
export class GetEntityTagExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;
        return { outputs: { tag: entity?.tag ?? 0 } };
    }
}

// ============================================================================
// Set Entity Tag | 设置实体标签
// ============================================================================

export const SetEntityTagTemplate: BlueprintNodeTemplate = {
    type: 'ECS_SetEntityTag',
    title: 'Set Entity Tag',
    category: 'entity',
    color: '#1e5a8b',
    description: 'Sets the tag of an entity (设置实体的标签)',
    keywords: ['entity', 'tag', 'set', 'category'],
    menuPath: ['ECS', 'Entity', 'Set Tag'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'entity', type: 'entity', displayName: 'Entity' },
        { name: 'tag', type: 'int', displayName: 'Tag', defaultValue: 0 }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: '' }
    ]
};

@RegisterNode(SetEntityTagTemplate)
export class SetEntityTagExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;
        const tag = context.evaluateInput(node.id, 'tag', 0) as number;
        if (entity && !entity.isDestroyed) {
            entity.tag = tag;
        }
        return { nextExec: 'exec' };
    }
}

// ============================================================================
// Set Entity Active | 设置实体激活状态
// ============================================================================

export const SetEntityActiveTemplate: BlueprintNodeTemplate = {
    type: 'ECS_SetEntityActive',
    title: 'Set Active',
    category: 'entity',
    color: '#1e5a8b',
    description: 'Sets whether an entity is active (设置实体是否激活)',
    keywords: ['entity', 'active', 'enable', 'disable', 'visible'],
    menuPath: ['ECS', 'Entity', 'Set Active'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'entity', type: 'entity', displayName: 'Entity' },
        { name: 'active', type: 'bool', displayName: 'Active', defaultValue: true }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: '' }
    ]
};

@RegisterNode(SetEntityActiveTemplate)
export class SetEntityActiveExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;
        const active = context.evaluateInput(node.id, 'active', true) as boolean;
        if (entity && !entity.isDestroyed) {
            entity.active = active;
        }
        return { nextExec: 'exec' };
    }
}

// ============================================================================
// Is Entity Active | 实体是否激活
// ============================================================================

export const IsEntityActiveTemplate: BlueprintNodeTemplate = {
    type: 'ECS_IsEntityActive',
    title: 'Is Active',
    category: 'entity',
    color: '#1e5a8b',
    isPure: true,
    description: 'Checks if an entity is active (检查实体是否激活)',
    keywords: ['entity', 'active', 'enabled', 'check'],
    menuPath: ['ECS', 'Entity', 'Is Active'],
    inputs: [
        { name: 'entity', type: 'entity', displayName: 'Entity' }
    ],
    outputs: [
        { name: 'isActive', type: 'bool', displayName: 'Is Active' }
    ]
};

@RegisterNode(IsEntityActiveTemplate)
export class IsEntityActiveExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;
        return { outputs: { isActive: entity?.active ?? false } };
    }
}

// ============================================================================
// Find Entity By Name | 按名称查找实体
// ============================================================================

export const FindEntityByNameTemplate: BlueprintNodeTemplate = {
    type: 'ECS_FindEntityByName',
    title: 'Find Entity By Name',
    category: 'entity',
    color: '#1e5a8b',
    isPure: true,
    description: 'Finds an entity by name in the scene (在场景中按名称查找实体)',
    keywords: ['entity', 'find', 'name', 'search', 'get', 'lookup'],
    menuPath: ['ECS', 'Entity', 'Find By Name'],
    inputs: [
        { name: 'name', type: 'string', displayName: 'Name', defaultValue: '' }
    ],
    outputs: [
        { name: 'entity', type: 'entity', displayName: 'Entity' },
        { name: 'found', type: 'bool', displayName: 'Found' }
    ]
};

@RegisterNode(FindEntityByNameTemplate)
export class FindEntityByNameExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const name = context.evaluateInput(node.id, 'name', '') as string;
        const entity = context.scene.findEntity(name);
        return {
            outputs: {
                entity: entity ?? null,
                found: entity != null
            }
        };
    }
}

// ============================================================================
// Find Entities By Tag | 按标签查找实体
// ============================================================================

export const FindEntitiesByTagTemplate: BlueprintNodeTemplate = {
    type: 'ECS_FindEntitiesByTag',
    title: 'Find Entities By Tag',
    category: 'entity',
    color: '#1e5a8b',
    isPure: true,
    description: 'Finds all entities with a specific tag (查找所有具有特定标签的实体)',
    keywords: ['entity', 'find', 'tag', 'search', 'get', 'all'],
    menuPath: ['ECS', 'Entity', 'Find By Tag'],
    inputs: [
        { name: 'tag', type: 'int', displayName: 'Tag', defaultValue: 0 }
    ],
    outputs: [
        { name: 'entities', type: 'array', displayName: 'Entities', arrayType: 'entity' },
        { name: 'count', type: 'int', displayName: 'Count' }
    ]
};

@RegisterNode(FindEntitiesByTagTemplate)
export class FindEntitiesByTagExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const tag = context.evaluateInput(node.id, 'tag', 0) as number;
        const entities = context.scene.findEntitiesByTag(tag);
        return {
            outputs: {
                entities,
                count: entities.length
            }
        };
    }
}

// ============================================================================
// Get Entity ID | 获取实体 ID
// ============================================================================

export const GetEntityIdTemplate: BlueprintNodeTemplate = {
    type: 'ECS_GetEntityId',
    title: 'Get Entity ID',
    category: 'entity',
    color: '#1e5a8b',
    isPure: true,
    description: 'Gets the unique ID of an entity (获取实体的唯一ID)',
    keywords: ['entity', 'id', 'identifier', 'unique'],
    menuPath: ['ECS', 'Entity', 'Get ID'],
    inputs: [
        { name: 'entity', type: 'entity', displayName: 'Entity' }
    ],
    outputs: [
        { name: 'id', type: 'int', displayName: 'ID' }
    ]
};

@RegisterNode(GetEntityIdTemplate)
export class GetEntityIdExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;
        return { outputs: { id: entity?.id ?? -1 } };
    }
}

// ============================================================================
// Find Entity By ID | 按 ID 查找实体
// ============================================================================

export const FindEntityByIdTemplate: BlueprintNodeTemplate = {
    type: 'ECS_FindEntityById',
    title: 'Find Entity By ID',
    category: 'entity',
    color: '#1e5a8b',
    isPure: true,
    description: 'Finds an entity by its unique ID (通过唯一ID查找实体)',
    keywords: ['entity', 'find', 'id', 'identifier'],
    menuPath: ['ECS', 'Entity', 'Find By ID'],
    inputs: [
        { name: 'id', type: 'int', displayName: 'ID', defaultValue: 0 }
    ],
    outputs: [
        { name: 'entity', type: 'entity', displayName: 'Entity' },
        { name: 'found', type: 'bool', displayName: 'Found' }
    ]
};

@RegisterNode(FindEntityByIdTemplate)
export class FindEntityByIdExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const id = context.evaluateInput(node.id, 'id', 0) as number;
        const entity = context.scene.findEntityById(id);
        return {
            outputs: {
                entity: entity ?? null,
                found: entity != null
            }
        };
    }
}
