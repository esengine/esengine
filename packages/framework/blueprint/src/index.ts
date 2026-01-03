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
 * @example 基础使用 | Basic usage:
 * ```typescript
 * import {
 *     createBlueprintSystem,
 *     registerAllComponentNodes
 * } from '@esengine/blueprint';
 *
 * // 注册所有标记的组件节点 | Register all marked component nodes
 * registerAllComponentNodes();
 *
 * // 创建蓝图系统 | Create blueprint system
 * const blueprintSystem = createBlueprintSystem(scene);
 * ```
 *
 * @example 标记组件 | Mark components:
 * ```typescript
 * import { BlueprintExpose, BlueprintProperty, BlueprintMethod } from '@esengine/blueprint';
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
export {
    createBlueprintComponentData,
    initializeBlueprintVM,
    startBlueprint,
    stopBlueprint,
    tickBlueprint,
    cleanupBlueprint
} from './runtime/BlueprintComponent';
export {
    createBlueprintSystem,
    triggerBlueprintEvent,
    triggerCustomBlueprintEvent
} from './runtime/BlueprintSystem';
export { createEmptyBlueprint, validateBlueprintAsset } from './types/blueprint';

// Re-export registry for convenience
export {
    BlueprintExpose,
    BlueprintProperty,
    BlueprintMethod,
    registerAllComponentNodes,
    registerComponentNodes
} from './registry';
