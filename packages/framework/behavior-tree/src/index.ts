/**
 * @esengine/behavior-tree
 *
 * @zh AI 行为树系统，支持运行时执行和可视化编辑
 * @en AI Behavior Tree System with runtime execution and visual editor support
 *
 * @zh 此包是通用的行为树实现，可以与任何基于 @esengine/ecs-framework 的引擎集成
 * （Cocos Creator、LayaAir、Node.js 等）。
 *
 * @en This package is a generic behavior tree implementation that works with any engine
 * based on @esengine/ecs-framework (Cocos Creator, LayaAir, Node.js, etc.).
 *
 * @example
 * ```typescript
 * import { Core, Scene } from '@esengine/ecs-framework';
 * import {
 *     BehaviorTreePlugin,
 *     BehaviorTreeBuilder,
 *     BehaviorTreeStarter
 * } from '@esengine/behavior-tree';
 *
 * // 1. Initialize Core and install plugin
 * Core.create();
 * const plugin = new BehaviorTreePlugin();
 * await Core.installPlugin(plugin);
 *
 * // 2. Create scene and setup behavior tree system
 * const scene = new Scene();
 * plugin.setupScene(scene);
 * Core.setScene(scene);
 *
 * // 3. Build behavior tree
 * const tree = BehaviorTreeBuilder.create('MyAI')
 *     .selector('Root')
 *         .log('Hello!')
 *     .end()
 *     .build();
 *
 * // 4. Start behavior tree on entity
 * const entity = scene.createEntity('AIEntity');
 * BehaviorTreeStarter.start(entity, tree);
 *
 * // 5. Run game loop
 * setInterval(() => Core.update(0.016), 16);
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

// Plugin
export { BehaviorTreePlugin } from './BehaviorTreePlugin';
