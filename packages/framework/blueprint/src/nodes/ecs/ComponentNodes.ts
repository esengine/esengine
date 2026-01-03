/**
 * @zh ECS 组件操作节点
 * @en ECS Component Operation Nodes
 *
 * @zh 提供蓝图中对 ECS 组件的完整操作支持
 * @en Provides complete ECS component operations in blueprint
 */

import type { Entity, Component } from '@esengine/ecs-framework';
import { BlueprintNodeTemplate, BlueprintNode } from '../../types/nodes';
import { ExecutionContext, ExecutionResult } from '../../runtime/ExecutionContext';
import { INodeExecutor, RegisterNode } from '../../runtime/NodeRegistry';

// ============================================================================
// Has Component | 是否有组件
// ============================================================================

export const HasComponentTemplate: BlueprintNodeTemplate = {
    type: 'ECS_HasComponent',
    title: 'Has Component',
    category: 'component',
    color: '#1e8b8b',
    isPure: true,
    description: 'Checks if an entity has a component of the specified type (检查实体是否拥有指定类型的组件)',
    keywords: ['component', 'has', 'check', 'exists', 'contains'],
    menuPath: ['ECS', 'Component', 'Has Component'],
    inputs: [
        { name: 'entity', type: 'entity', displayName: 'Entity' },
        { name: 'componentType', type: 'string', displayName: 'Component Type', defaultValue: '' }
    ],
    outputs: [
        { name: 'hasComponent', type: 'bool', displayName: 'Has Component' }
    ]
};

@RegisterNode(HasComponentTemplate)
export class HasComponentExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;
        const componentType = context.evaluateInput(node.id, 'componentType', '') as string;

        if (!entity || entity.isDestroyed || !componentType) {
            return { outputs: { hasComponent: false } };
        }

        const hasIt = entity.components.some(c =>
            c.constructor.name === componentType ||
            (c.constructor as any).__componentName__ === componentType
        );

        return { outputs: { hasComponent: hasIt } };
    }
}

// ============================================================================
// Get Component | 获取组件
// ============================================================================

export const GetComponentTemplate: BlueprintNodeTemplate = {
    type: 'ECS_GetComponent',
    title: 'Get Component',
    category: 'component',
    color: '#1e8b8b',
    isPure: true,
    description: 'Gets a component from an entity by type name (按类型名称从实体获取组件)',
    keywords: ['component', 'get', 'find', 'access'],
    menuPath: ['ECS', 'Component', 'Get Component'],
    inputs: [
        { name: 'entity', type: 'entity', displayName: 'Entity' },
        { name: 'componentType', type: 'string', displayName: 'Component Type', defaultValue: '' }
    ],
    outputs: [
        { name: 'component', type: 'component', displayName: 'Component' },
        { name: 'found', type: 'bool', displayName: 'Found' }
    ]
};

@RegisterNode(GetComponentTemplate)
export class GetComponentExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;
        const componentType = context.evaluateInput(node.id, 'componentType', '') as string;

        if (!entity || entity.isDestroyed || !componentType) {
            return { outputs: { component: null, found: false } };
        }

        const component = entity.components.find(c =>
            c.constructor.name === componentType ||
            (c.constructor as any).__componentName__ === componentType
        );

        return {
            outputs: {
                component: component ?? null,
                found: component != null
            }
        };
    }
}

// ============================================================================
// Get All Components | 获取所有组件
// ============================================================================

export const GetAllComponentsTemplate: BlueprintNodeTemplate = {
    type: 'ECS_GetAllComponents',
    title: 'Get All Components',
    category: 'component',
    color: '#1e8b8b',
    isPure: true,
    description: 'Gets all components from an entity (获取实体的所有组件)',
    keywords: ['component', 'get', 'all', 'list'],
    menuPath: ['ECS', 'Component', 'Get All Components'],
    inputs: [
        { name: 'entity', type: 'entity', displayName: 'Entity' }
    ],
    outputs: [
        { name: 'components', type: 'array', displayName: 'Components', arrayType: 'component' },
        { name: 'count', type: 'int', displayName: 'Count' }
    ]
};

@RegisterNode(GetAllComponentsTemplate)
export class GetAllComponentsExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;

        if (!entity || entity.isDestroyed) {
            return { outputs: { components: [], count: 0 } };
        }

        const components = [...entity.components];
        return {
            outputs: {
                components,
                count: components.length
            }
        };
    }
}

// ============================================================================
// Remove Component | 移除组件
// ============================================================================

export const RemoveComponentTemplate: BlueprintNodeTemplate = {
    type: 'ECS_RemoveComponent',
    title: 'Remove Component',
    category: 'component',
    color: '#8b1e1e',
    description: 'Removes a component from an entity (从实体移除组件)',
    keywords: ['component', 'remove', 'delete', 'destroy'],
    menuPath: ['ECS', 'Component', 'Remove Component'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'entity', type: 'entity', displayName: 'Entity' },
        { name: 'componentType', type: 'string', displayName: 'Component Type', defaultValue: '' }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'removed', type: 'bool', displayName: 'Removed' }
    ]
};

@RegisterNode(RemoveComponentTemplate)
export class RemoveComponentExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;
        const componentType = context.evaluateInput(node.id, 'componentType', '') as string;

        if (!entity || entity.isDestroyed || !componentType) {
            return { outputs: { removed: false }, nextExec: 'exec' };
        }

        const component = entity.components.find(c =>
            c.constructor.name === componentType ||
            (c.constructor as any).__componentName__ === componentType
        );

        if (component) {
            entity.removeComponent(component);
            return { outputs: { removed: true }, nextExec: 'exec' };
        }

        return { outputs: { removed: false }, nextExec: 'exec' };
    }
}

// ============================================================================
// Get Component Property | 获取组件属性
// ============================================================================

export const GetComponentPropertyTemplate: BlueprintNodeTemplate = {
    type: 'ECS_GetComponentProperty',
    title: 'Get Component Property',
    category: 'component',
    color: '#1e8b8b',
    isPure: true,
    description: 'Gets a property value from a component (从组件获取属性值)',
    keywords: ['component', 'property', 'get', 'value', 'field'],
    menuPath: ['ECS', 'Component', 'Get Property'],
    inputs: [
        { name: 'component', type: 'component', displayName: 'Component' },
        { name: 'propertyName', type: 'string', displayName: 'Property Name', defaultValue: '' }
    ],
    outputs: [
        { name: 'value', type: 'any', displayName: 'Value' },
        { name: 'found', type: 'bool', displayName: 'Found' }
    ]
};

@RegisterNode(GetComponentPropertyTemplate)
export class GetComponentPropertyExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const component = context.evaluateInput(node.id, 'component', null) as Component | null;
        const propertyName = context.evaluateInput(node.id, 'propertyName', '') as string;

        if (!component || !propertyName) {
            return { outputs: { value: null, found: false } };
        }

        if (propertyName in component) {
            return {
                outputs: {
                    value: (component as any)[propertyName],
                    found: true
                }
            };
        }

        return { outputs: { value: null, found: false } };
    }
}

// ============================================================================
// Set Component Property | 设置组件属性
// ============================================================================

export const SetComponentPropertyTemplate: BlueprintNodeTemplate = {
    type: 'ECS_SetComponentProperty',
    title: 'Set Component Property',
    category: 'component',
    color: '#1e8b8b',
    description: 'Sets a property value on a component (设置组件的属性值)',
    keywords: ['component', 'property', 'set', 'value', 'field', 'modify'],
    menuPath: ['ECS', 'Component', 'Set Property'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'component', type: 'component', displayName: 'Component' },
        { name: 'propertyName', type: 'string', displayName: 'Property Name', defaultValue: '' },
        { name: 'value', type: 'any', displayName: 'Value' }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'success', type: 'bool', displayName: 'Success' }
    ]
};

@RegisterNode(SetComponentPropertyTemplate)
export class SetComponentPropertyExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const component = context.evaluateInput(node.id, 'component', null) as Component | null;
        const propertyName = context.evaluateInput(node.id, 'propertyName', '') as string;
        const value = context.evaluateInput(node.id, 'value', null);

        if (!component || !propertyName) {
            return { outputs: { success: false }, nextExec: 'exec' };
        }

        if (propertyName in component) {
            (component as any)[propertyName] = value;
            return { outputs: { success: true }, nextExec: 'exec' };
        }

        return { outputs: { success: false }, nextExec: 'exec' };
    }
}

// ============================================================================
// Get Component Type Name | 获取组件类型名称
// ============================================================================

export const GetComponentTypeNameTemplate: BlueprintNodeTemplate = {
    type: 'ECS_GetComponentTypeName',
    title: 'Get Component Type',
    category: 'component',
    color: '#1e8b8b',
    isPure: true,
    description: 'Gets the type name of a component (获取组件的类型名称)',
    keywords: ['component', 'type', 'name', 'class'],
    menuPath: ['ECS', 'Component', 'Get Type Name'],
    inputs: [
        { name: 'component', type: 'component', displayName: 'Component' }
    ],
    outputs: [
        { name: 'typeName', type: 'string', displayName: 'Type Name' }
    ]
};

@RegisterNode(GetComponentTypeNameTemplate)
export class GetComponentTypeNameExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const component = context.evaluateInput(node.id, 'component', null) as Component | null;

        if (!component) {
            return { outputs: { typeName: '' } };
        }

        const typeName = (component.constructor as any).__componentName__ ?? component.constructor.name;
        return { outputs: { typeName } };
    }
}

// ============================================================================
// Get Entity From Component | 从组件获取实体
// ============================================================================

export const GetEntityFromComponentTemplate: BlueprintNodeTemplate = {
    type: 'ECS_GetEntityFromComponent',
    title: 'Get Owner Entity',
    category: 'component',
    color: '#1e8b8b',
    isPure: true,
    description: 'Gets the entity that owns a component (获取拥有组件的实体)',
    keywords: ['component', 'entity', 'owner', 'parent'],
    menuPath: ['ECS', 'Component', 'Get Owner Entity'],
    inputs: [
        { name: 'component', type: 'component', displayName: 'Component' }
    ],
    outputs: [
        { name: 'entity', type: 'entity', displayName: 'Entity' },
        { name: 'found', type: 'bool', displayName: 'Found' }
    ]
};

@RegisterNode(GetEntityFromComponentTemplate)
export class GetEntityFromComponentExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const component = context.evaluateInput(node.id, 'component', null) as Component | null;

        if (!component || component.entityId == null) {
            return { outputs: { entity: null, found: false } };
        }

        const entity = context.scene.findEntityById(component.entityId);
        return {
            outputs: {
                entity: entity ?? null,
                found: entity != null
            }
        };
    }
}
