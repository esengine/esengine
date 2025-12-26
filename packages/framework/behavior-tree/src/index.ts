/**
 * @esengine/behavior-tree
 *
 * @zh AI 行为树系统，支持运行时执行和可视化编辑
 * @en AI Behavior Tree System with runtime execution and visual editor support
 *
 * @zh 此包是通用的行为树实现，可以与任何 ECS 框架配合使用。
 * 对于 ESEngine 集成，请从 '@esengine/behavior-tree/esengine' 导入插件。
 *
 * @en This package is a generic behavior tree implementation that works with any ECS framework.
 * For ESEngine integration, import the plugin from '@esengine/behavior-tree/esengine'.
 *
 * @example Cocos/Laya/通用 ECS 使用方式:
 * ```typescript
 * import {
 *     BehaviorTreeAssetManager,
 *     BehaviorTreeExecutionSystem,
 *     BehaviorTreeRuntimeComponent
 * } from '@esengine/behavior-tree';
 *
 * // 1. Register service
 * Core.services.registerSingleton(BehaviorTreeAssetManager);
 *
 * // 2. Load behavior tree from JSON
 * const assetManager = Core.services.resolve(BehaviorTreeAssetManager);
 * assetManager.loadFromEditorJSON(jsonContent);
 *
 * // 3. Add component to entity
 * entity.addComponent(new BehaviorTreeRuntimeComponent());
 *
 * // 4. Add system to scene
 * scene.addSystem(new BehaviorTreeExecutionSystem());
 * ```
 *
 * @packageDocumentation
 */

// Constants
export { BehaviorTreeAssetType } from './constants';

// Types
export * from './Types/TaskStatus';
export type { IBTAssetManager, IBehaviorTreeAssetContent } from './Types/AssetManagerInterface';

// Execution (runtime core)
export * from './execution';

// Utilities
export * from './BehaviorTreeStarter';
export * from './BehaviorTreeBuilder';

// Serialization
export * from './Serialization/NodeTemplates';
export * from './Serialization/BehaviorTreeAsset';
export * from './Serialization/EditorFormatConverter';
export * from './Serialization/BehaviorTreeAssetSerializer';
export * from './Serialization/EditorToBehaviorTreeDataConverter';

// Services
export * from './Services/GlobalBlackboardService';

// Blackboard types (excluding BlackboardValueType which is already exported from TaskStatus)
export type { BlackboardTypeDefinition } from './Blackboard/BlackboardTypes';
export { BlackboardTypes } from './Blackboard/BlackboardTypes';

// Service tokens (using ecs-framework's createServiceToken, not engine-core)
export { BehaviorTreeSystemToken } from './tokens';
