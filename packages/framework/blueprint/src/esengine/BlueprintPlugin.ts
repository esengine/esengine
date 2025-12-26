/**
 * @zh ESEngine 蓝图插件
 * @en ESEngine Blueprint Plugin
 *
 * @zh 此文件包含与 ESEngine 引擎核心集成的代码。
 * 使用 Cocos/Laya 等其他引擎时不需要此文件。
 *
 * @en This file contains code for integrating with ESEngine engine-core.
 * Not needed when using other engines like Cocos/Laya.
 */

import type { IRuntimePlugin, ModuleManifest, IRuntimeModule } from '@esengine/engine-core';

/**
 * @zh 蓝图运行时模块
 * @en Blueprint Runtime Module
 *
 * @zh 注意：蓝图使用自定义系统 (IBlueprintSystem) 而非 EntitySystem，
 * 因此这里不实现 createSystems。蓝图系统应使用 createBlueprintSystem(scene) 手动创建。
 *
 * @en Note: Blueprint uses a custom system (IBlueprintSystem) instead of EntitySystem,
 * so createSystems is not implemented here. Blueprint systems should be created
 * manually using createBlueprintSystem(scene).
 */
class BlueprintRuntimeModule implements IRuntimeModule {
    async onInitialize(): Promise<void> {
        // Blueprint system initialization
    }

    onDestroy(): void {
        // Cleanup
    }
}

/**
 * @zh 蓝图的插件清单
 * @en Plugin manifest for Blueprint
 */
const manifest: ModuleManifest = {
    id: 'blueprint',
    name: '@esengine/blueprint',
    displayName: 'Blueprint',
    version: '1.0.0',
    description: '可视化脚本系统',
    category: 'AI',
    icon: 'Workflow',
    isCore: false,
    defaultEnabled: false,
    isEngineModule: true,
    dependencies: ['core'],
    exports: {
        components: ['BlueprintComponent'],
        systems: ['BlueprintSystem']
    },
    requiresWasm: false
};

/**
 * @zh 蓝图插件
 * @en Blueprint Plugin
 */
export const BlueprintPlugin: IRuntimePlugin = {
    manifest,
    runtimeModule: new BlueprintRuntimeModule()
};

export { BlueprintRuntimeModule };
