/**
 * @zh 组件节点生成器 - 自动为标记的组件生成蓝图节点
 * @en Component Node Generator - Auto-generate blueprint nodes for marked components
 *
 * @zh 根据 @BlueprintExpose、@BlueprintProperty、@BlueprintMethod 装饰器
 * 自动生成对应的 Get/Set/Call 节点并注册到 NodeRegistry
 *
 * @en Based on @BlueprintExpose, @BlueprintProperty, @BlueprintMethod decorators,
 * auto-generate corresponding Get/Set/Call nodes and register to NodeRegistry
 */

import type { Component, Entity } from '@esengine/ecs-framework';
import type { BlueprintNodeTemplate, BlueprintNode } from '../types/nodes';
import type { BlueprintPinType } from '../types/pins';
import type { ExecutionContext, ExecutionResult } from '../runtime/ExecutionContext';
import type { INodeExecutor } from '../runtime/NodeRegistry';
import { NodeRegistry } from '../runtime/NodeRegistry';
import {
    getRegisteredBlueprintComponents,
    type ComponentBlueprintMetadata,
    type PropertyMetadata,
    type MethodMetadata
} from './BlueprintDecorators';

// ============================================================================
// Node Generator | 节点生成器
// ============================================================================

/**
 * @zh 为组件生成所有蓝图节点
 * @en Generate all blueprint nodes for a component
 */
export function generateComponentNodes(
    componentClass: Function,
    metadata: ComponentBlueprintMetadata
): void {
    const { componentName, properties, methods } = metadata;
    const category = metadata.category ?? 'component';
    const color = metadata.color ?? '#1e8b8b';

    // Generate Add/Get component nodes
    generateAddComponentNode(componentClass, componentName, metadata, color);
    generateGetComponentNode(componentClass, componentName, metadata, color);

    for (const prop of properties) {
        generatePropertyGetNode(componentName, prop, category, color);
        if (!prop.readonly) {
            generatePropertySetNode(componentName, prop, category, color);
        }
    }

    for (const method of methods) {
        generateMethodCallNode(componentName, method, category, color);
    }
}

/**
 * @zh 生成 Add Component 节点
 * @en Generate Add Component node
 */
function generateAddComponentNode(
    componentClass: Function,
    componentName: string,
    metadata: ComponentBlueprintMetadata,
    color: string
): void {
    const nodeType = `Add_${componentName}`;
    const displayName = metadata.displayName ?? componentName;

    // Build input pins for initial property values
    const propertyInputs: BlueprintNodeTemplate['inputs'] = [];
    const propertyDefaults: Record<string, unknown> = {};

    for (const prop of metadata.properties) {
        if (!prop.readonly) {
            propertyInputs.push({
                name: prop.propertyKey,
                type: prop.pinType,
                displayName: prop.displayName,
                defaultValue: prop.defaultValue
            });
            propertyDefaults[prop.propertyKey] = prop.defaultValue;
        }
    }

    const template: BlueprintNodeTemplate = {
        type: nodeType,
        title: `Add ${displayName}`,
        category: 'component',
        color,
        description: `Adds ${displayName} component to entity (为实体添加 ${displayName} 组件)`,
        keywords: ['add', 'component', 'create', componentName.toLowerCase()],
        menuPath: ['Components', displayName, `Add ${displayName}`],
        inputs: [
            { name: 'exec', type: 'exec', displayName: '' },
            { name: 'entity', type: 'entity', displayName: 'Entity' },
            ...propertyInputs
        ],
        outputs: [
            { name: 'exec', type: 'exec', displayName: '' },
            { name: 'component', type: 'component', displayName: displayName },
            { name: 'success', type: 'bool', displayName: 'Success' }
        ]
    };

    const propertyKeys = metadata.properties
        .filter(p => !p.readonly)
        .map(p => p.propertyKey);

    const executor: INodeExecutor = {
        execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
            const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;

            if (!entity || entity.isDestroyed) {
                return { outputs: { component: null, success: false }, nextExec: 'exec' };
            }

            // Check if component already exists
            const existing = entity.components.find(c =>
                c.constructor === componentClass ||
                c.constructor.name === componentName ||
                (c.constructor as any).__componentName__ === componentName
            );

            if (existing) {
                // Component already exists, return it
                return { outputs: { component: existing, success: false }, nextExec: 'exec' };
            }

            try {
                // Create new component instance
                const component = new (componentClass as new () => Component)();

                // Set initial property values from inputs
                for (const key of propertyKeys) {
                    const value = context.evaluateInput(node.id, key, propertyDefaults[key]);
                    if (value !== undefined) {
                        (component as any)[key] = value;
                    }
                }

                // Add to entity
                entity.addComponent(component);

                return { outputs: { component, success: true }, nextExec: 'exec' };
            } catch (error) {
                console.error(`[Blueprint] Failed to add ${componentName}:`, error);
                return { outputs: { component: null, success: false }, nextExec: 'exec' };
            }
        }
    };

    NodeRegistry.instance.register(template, executor);
}

/**
 * @zh 生成 Get Component 节点
 * @en Generate Get Component node
 */
function generateGetComponentNode(
    componentClass: Function,
    componentName: string,
    metadata: ComponentBlueprintMetadata,
    color: string
): void {
    const nodeType = `Get_${componentName}`;
    const displayName = metadata.displayName ?? componentName;

    const template: BlueprintNodeTemplate = {
        type: nodeType,
        title: `Get ${displayName}`,
        category: 'component',
        color,
        isPure: true,
        description: `Gets ${displayName} component from entity (从实体获取 ${displayName} 组件)`,
        keywords: ['get', 'component', componentName.toLowerCase()],
        menuPath: ['Components', displayName, `Get ${displayName}`],
        inputs: [
            { name: 'entity', type: 'entity', displayName: 'Entity' }
        ],
        outputs: [
            { name: 'component', type: 'component', displayName: displayName },
            { name: 'found', type: 'bool', displayName: 'Found' }
        ]
    };

    const executor: INodeExecutor = {
        execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
            const entity = context.evaluateInput(node.id, 'entity', context.entity) as Entity;

            if (!entity || entity.isDestroyed) {
                return { outputs: { component: null, found: false } };
            }

            const component = entity.components.find(c =>
                c.constructor === componentClass ||
                c.constructor.name === componentName ||
                (c.constructor as any).__componentName__ === componentName
            );

            return {
                outputs: {
                    component: component ?? null,
                    found: component != null
                }
            };
        }
    };

    NodeRegistry.instance.register(template, executor);
}

/**
 * @zh 生成属性 Get 节点
 * @en Generate property Get node
 */
function generatePropertyGetNode(
    componentName: string,
    prop: PropertyMetadata,
    category: string,
    color: string
): void {
    const nodeType = `Get_${componentName}_${prop.propertyKey}`;
    const { displayName, pinType } = prop;

    const template: BlueprintNodeTemplate = {
        type: nodeType,
        title: `Get ${displayName}`,
        subtitle: componentName,
        category: category as any,
        color,
        isPure: true,
        description: prop.description ?? `Gets ${displayName} from ${componentName} (从 ${componentName} 获取 ${displayName})`,
        keywords: ['get', 'property', componentName.toLowerCase(), prop.propertyKey.toLowerCase()],
        menuPath: ['Components', componentName, `Get ${displayName}`],
        inputs: [
            { name: 'component', type: 'component', displayName: componentName }
        ],
        outputs: [
            { name: 'value', type: pinType, displayName }
        ]
    };

    const propertyKey = prop.propertyKey;
    const defaultValue = prop.defaultValue;

    const executor: INodeExecutor = {
        execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
            const component = context.evaluateInput(node.id, 'component', null) as Component | null;

            if (!component) {
                return { outputs: { value: defaultValue ?? null } };
            }

            const value = (component as any)[propertyKey];
            return { outputs: { value } };
        }
    };

    NodeRegistry.instance.register(template, executor);
}

/**
 * @zh 生成属性 Set 节点
 * @en Generate property Set node
 */
function generatePropertySetNode(
    componentName: string,
    prop: PropertyMetadata,
    category: string,
    color: string
): void {
    const nodeType = `Set_${componentName}_${prop.propertyKey}`;
    const { displayName, pinType, defaultValue } = prop;

    const template: BlueprintNodeTemplate = {
        type: nodeType,
        title: `Set ${displayName}`,
        subtitle: componentName,
        category: category as any,
        color,
        description: prop.description ?? `Sets ${displayName} on ${componentName} (设置 ${componentName} 的 ${displayName})`,
        keywords: ['set', 'property', componentName.toLowerCase(), prop.propertyKey.toLowerCase()],
        menuPath: ['Components', componentName, `Set ${displayName}`],
        inputs: [
            { name: 'exec', type: 'exec', displayName: '' },
            { name: 'component', type: 'component', displayName: componentName },
            { name: 'value', type: pinType, displayName, defaultValue }
        ],
        outputs: [
            { name: 'exec', type: 'exec', displayName: '' }
        ]
    };

    const propertyKey = prop.propertyKey;

    const executor: INodeExecutor = {
        execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
            const component = context.evaluateInput(node.id, 'component', null) as Component | null;
            const value = context.evaluateInput(node.id, 'value', defaultValue);

            if (component) {
                (component as any)[propertyKey] = value;
            }

            return { nextExec: 'exec' };
        }
    };

    NodeRegistry.instance.register(template, executor);
}

/**
 * @zh 生成方法调用节点
 * @en Generate method call node
 */
function generateMethodCallNode(
    componentName: string,
    method: MethodMetadata,
    category: string,
    color: string
): void {
    const nodeType = `Call_${componentName}_${method.methodKey}`;
    const { displayName, isPure, params, returnType } = method;

    const inputs: BlueprintNodeTemplate['inputs'] = [];

    if (!isPure) {
        inputs.push({ name: 'exec', type: 'exec', displayName: '' });
    }

    inputs.push({ name: 'component', type: 'component', displayName: componentName });

    const paramNames: string[] = [];
    for (const param of params) {
        inputs.push({
            name: param.name,
            type: param.type ?? 'any',
            displayName: param.displayName ?? param.name,
            defaultValue: param.defaultValue
        });
        paramNames.push(param.name);
    }

    const outputs: BlueprintNodeTemplate['outputs'] = [];

    if (!isPure) {
        outputs.push({ name: 'exec', type: 'exec', displayName: '' });
    }

    if (returnType !== 'exec' && returnType !== 'any') {
        outputs.push({
            name: 'result',
            type: returnType as BlueprintPinType,
            displayName: 'Result'
        });
    }

    const template: BlueprintNodeTemplate = {
        type: nodeType,
        title: displayName,
        subtitle: componentName,
        category: category as any,
        color,
        isPure,
        description: method.description ?? `Calls ${displayName} on ${componentName} (调用 ${componentName} 的 ${displayName})`,
        keywords: ['call', 'method', componentName.toLowerCase(), method.methodKey.toLowerCase()],
        menuPath: ['Components', componentName, displayName],
        inputs,
        outputs
    };

    const methodKey = method.methodKey;

    const executor: INodeExecutor = {
        execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
            const component = context.evaluateInput(node.id, 'component', null) as Component | null;

            if (!component) {
                return isPure ? { outputs: { result: null } } : { nextExec: 'exec' };
            }

            const args: unknown[] = paramNames.map(name =>
                context.evaluateInput(node.id, name, undefined)
            );

            const fn = (component as any)[methodKey];
            if (typeof fn !== 'function') {
                console.warn(`Method ${methodKey} not found on component ${componentName}`);
                return isPure ? { outputs: { result: null } } : { nextExec: 'exec' };
            }

            const result = fn.apply(component, args);

            return isPure
                ? { outputs: { result } }
                : { outputs: { result }, nextExec: 'exec' };
        }
    };

    NodeRegistry.instance.register(template, executor);
}

// ============================================================================
// Registration | 注册
// ============================================================================

/**
 * @zh 注册所有已标记的组件节点
 * @en Register all marked component nodes
 *
 * @zh 应该在蓝图系统初始化时调用，会扫描所有使用 @BlueprintExpose 装饰的组件
 * 并自动生成对应的蓝图节点
 *
 * @en Should be called during blueprint system initialization, scans all components
 * decorated with @BlueprintExpose and auto-generates corresponding blueprint nodes
 */
export function registerAllComponentNodes(): void {
    const components = getRegisteredBlueprintComponents();

    for (const [componentClass, metadata] of components) {
        try {
            generateComponentNodes(componentClass, metadata);
            console.log(`[Blueprint] Registered component: ${metadata.componentName} (${metadata.properties.length} properties, ${metadata.methods.length} methods)`);
        } catch (error) {
            console.error(`[Blueprint] Failed to register component ${metadata.componentName}:`, error);
        }
    }

    console.log(`[Blueprint] Registered ${components.size} component(s)`);
}

/**
 * @zh 手动注册单个组件
 * @en Manually register a single component
 */
export function registerComponentNodes(componentClass: Function): void {
    const components = getRegisteredBlueprintComponents();
    const metadata = components.get(componentClass);

    if (!metadata) {
        console.warn(`[Blueprint] Component ${componentClass.name} is not marked with @BlueprintExpose`);
        return;
    }

    generateComponentNodes(componentClass, metadata);
}
