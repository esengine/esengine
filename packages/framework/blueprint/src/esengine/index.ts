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
 * import { BlueprintPlugin } from '@esengine/blueprint/esengine';
 *
 * // Register with ESEngine plugin system
 * engine.registerPlugin(BlueprintPlugin);
 * ```
 *
 * @example Cocos/Laya 使用方式 / Cocos/Laya usage:
 * ```typescript
 * import {
 *     createBlueprintSystem,
 *     createBlueprintComponentData
 * } from '@esengine/blueprint';
 *
 * // Create blueprint system for your scene
 * const blueprintSystem = createBlueprintSystem(scene);
 *
 * // Add to your game loop
 * function update(dt) {
 *     blueprintSystem.process(blueprintEntities, dt);
 * }
 * ```
 */

// Runtime module and plugin
export { BlueprintPlugin, BlueprintRuntimeModule } from './BlueprintPlugin';
