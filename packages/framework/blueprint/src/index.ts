/**
 * @esengine/blueprint - Visual scripting system for ECS Framework
 *
 * @zh 蓝图可视化脚本系统 - 与 ECS 框架深度集成
 * @en Visual scripting system - Deep integration with ECS framework
 *
 * @zh 此包提供完整的可视化脚本功能：
 * - 内置 ECS 操作节点（Entity、Component、Flow）
 * - 组件自动节点生成（使用装饰器标记）
 * - 运行时蓝图执行
 *
 * @en This package provides complete visual scripting features:
 * - Built-in ECS operation nodes (Entity, Component, Flow)
 * - Auto component node generation (using decorators)
 * - Runtime blueprint execution
 *
 * @example 基础使用 | Basic Usage:
 * ```typescript
 * import { BlueprintSystem, BlueprintComponent } from '@esengine/blueprint';
 * import { Scene, Core } from '@esengine/ecs-framework';
 *
 * // 创建场景并添加蓝图系统
 * const scene = new Scene();
 * scene.addSystem(new BlueprintSystem());
 * Core.setScene(scene);
 *
 * // 为实体添加蓝图
 * const entity = scene.createEntity('Player');
 * const blueprint = new BlueprintComponent();
 * blueprint.blueprintAsset = await loadBlueprintAsset('player.bp');
 * entity.addComponent(blueprint);
 * ```
 *
 * @example 标记组件 | Mark Components:
 * ```typescript
 * import { BlueprintExpose, BlueprintProperty, BlueprintMethod } from '@esengine/blueprint';
 * import { Component, ECSComponent } from '@esengine/ecs-framework';
 *
 * @ECSComponent('Health')
 * @BlueprintExpose({ displayName: '生命值' })
 * export class HealthComponent extends Component {
 *     @BlueprintProperty({ displayName: '当前生命值' })
 *     current: number = 100;
 *
 *     @BlueprintMethod({ displayName: '治疗' })
 *     heal(amount: number): void {
 *         this.current += amount;
 *     }
 * }
 * ```
 *
 * @packageDocumentation
 */

// Types
export * from './types';

// Runtime
export * from './runtime';

// Triggers
export * from './triggers';

// Composition
export * from './composition';

// Registry (decorators & auto-generation)
export * from './registry';

// Nodes (import to register built-in nodes)
import './nodes';

// Re-export commonly used items
export { NodeRegistry, RegisterNode } from './runtime/NodeRegistry';
export { BlueprintVM } from './runtime/BlueprintVM';
export { BlueprintComponent } from './runtime/BlueprintComponent';
export { BlueprintSystem } from './runtime/BlueprintSystem';
export { ExecutionContext } from './runtime/ExecutionContext';
export { createEmptyBlueprint, validateBlueprintAsset } from './types/blueprint';

// Component registration helper
import { ExecutionContext } from './runtime/ExecutionContext';
import type { Component } from '@esengine/ecs-framework';

/**
 * @zh 注册组件类以支持在蓝图中动态创建
 * @en Register a component class for dynamic creation in blueprints
 *
 * @example
 * ```typescript
 * import { registerComponentClass } from '@esengine/blueprint';
 * import { MyComponent } from './MyComponent';
 *
 * registerComponentClass('MyComponent', MyComponent);
 * ```
 */
export function registerComponentClass(typeName: string, componentClass: new () => Component): void {
    ExecutionContext.registerComponentClass(typeName, componentClass);
}

// Re-export registry for convenience
export {
    BlueprintExpose,
    BlueprintProperty,
    BlueprintMethod,
    registerAllComponentNodes,
    registerComponentNodes
} from './registry';
