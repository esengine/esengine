/**
 * @esengine/blueprint - Visual scripting system for ECS Framework
 *
 * @zh 蓝图可视化脚本系统 - 可与任何 ECS 框架配合使用
 * @en Visual scripting system - works with any ECS framework
 *
 * @zh 此包是通用的可视化脚本实现，可以与任何 ECS 框架配合使用。
 * 对于 ESEngine 集成，请从 '@esengine/blueprint/esengine' 导入插件。
 *
 * @en This package is a generic visual scripting implementation that works with any ECS framework.
 * For ESEngine integration, import the plugin from '@esengine/blueprint/esengine'.
 *
 * @example Cocos/Laya/通用 ECS 使用方式:
 * ```typescript
 * import {
 *     createBlueprintSystem,
 *     createBlueprintComponentData
 * } from '@esengine/blueprint';
 *
 * // Create blueprint system for your scene
 * const blueprintSystem = createBlueprintSystem(scene);
 *
 * // Create component data
 * const componentData = createBlueprintComponentData();
 * componentData.blueprintAsset = loadedAsset;
 *
 * // Add to your game loop
 * function update(dt) {
 *     blueprintSystem.process(blueprintEntities, dt);
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

// Nodes (import to register)
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
