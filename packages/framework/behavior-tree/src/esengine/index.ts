/**
 * @zh ESEngine 集成入口
 * @en ESEngine integration entry point
 *
 * @zh 此模块包含与 ESEngine 引擎核心集成所需的所有代码。
 * 使用 Cocos/Laya 等其他引擎时，只需导入主模块即可。
 *
 * @en This module contains all code required for ESEngine engine-core integration.
 * When using other engines like Cocos/Laya, just import the main module.
 *
 * @example ESEngine 使用方式 / ESEngine usage:
 * ```typescript
 * import { BehaviorTreePlugin } from '@esengine/behavior-tree/esengine';
 *
 * // Register with ESEngine plugin system
 * engine.registerPlugin(BehaviorTreePlugin);
 * ```
 *
 * @example Cocos/Laya 使用方式 / Cocos/Laya usage:
 * ```typescript
 * import {
 *     BehaviorTreeAssetManager,
 *     BehaviorTreeExecutionSystem
 * } from '@esengine/behavior-tree';
 *
 * // Load behavior tree from JSON
 * const assetManager = new BehaviorTreeAssetManager();
 * assetManager.loadFromEditorJSON(jsonContent);
 *
 * // Add system to your ECS world
 * world.addSystem(new BehaviorTreeExecutionSystem());
 * ```
 */

// Runtime module and plugin
export { BehaviorTreeRuntimeModule, BehaviorTreePlugin, BehaviorTreeSystemToken } from './BehaviorTreeRuntimeModule';

// Asset loader for ESEngine asset-system
export { BehaviorTreeLoader, type IBehaviorTreeAsset } from './BehaviorTreeLoader';
