/**
 * @zh ESEngine 集成模块
 * @en ESEngine integration module
 *
 * @zh 此文件包含与 ESEngine 引擎核心集成的代码。
 * 使用 Cocos/Laya 等其他引擎时不需要此文件。
 *
 * @en This file contains code for integrating with ESEngine engine-core.
 * Not needed when using other engines like Cocos/Laya.
 */

import type { IScene, ServiceContainer, IComponentRegistry } from '@esengine/ecs-framework';
import type { IRuntimeModule, IRuntimePlugin, ModuleManifest, SystemContext } from '@esengine/engine-core';
import { AssetManagerToken } from '@esengine/asset-system';

import { BehaviorTreeRuntimeComponent } from '../execution/BehaviorTreeRuntimeComponent';
import { BehaviorTreeExecutionSystem } from '../execution/BehaviorTreeExecutionSystem';
import { BehaviorTreeAssetManager } from '../execution/BehaviorTreeAssetManager';
import { GlobalBlackboardService } from '../Services/GlobalBlackboardService';
import { BehaviorTreeLoader } from './BehaviorTreeLoader';
import { BehaviorTreeAssetType } from '../constants';
import { BehaviorTreeSystemToken } from '../tokens';

// Re-export tokens for ESEngine users
export { BehaviorTreeSystemToken } from '../tokens';

class BehaviorTreeRuntimeModule implements IRuntimeModule {
    private _loaderRegistered = false;

    registerComponents(registry: IComponentRegistry): void {
        registry.register(BehaviorTreeRuntimeComponent);
    }

    registerServices(services: ServiceContainer): void {
        if (!services.isRegistered(GlobalBlackboardService)) {
            services.registerSingleton(GlobalBlackboardService);
        }
        if (!services.isRegistered(BehaviorTreeAssetManager)) {
            services.registerSingleton(BehaviorTreeAssetManager);
        }
    }

    createSystems(scene: IScene, context: SystemContext): void {
        // Get dependencies from service registry
        const assetManager = context.services.get(AssetManagerToken);

        if (!this._loaderRegistered && assetManager) {
            assetManager.registerLoader(BehaviorTreeAssetType, new BehaviorTreeLoader());
            this._loaderRegistered = true;
        }

        // Use ECS service container from context.services
        const ecsServices = (context as { ecsServices?: ServiceContainer }).ecsServices;
        const behaviorTreeSystem = new BehaviorTreeExecutionSystem(ecsServices);

        if (assetManager) {
            behaviorTreeSystem.setAssetManager(assetManager);
        }

        if (context.isEditor) {
            behaviorTreeSystem.enabled = false;
        }

        scene.addSystem(behaviorTreeSystem);

        // Register service to service registry
        context.services.register(BehaviorTreeSystemToken, behaviorTreeSystem);
    }
}

const manifest: ModuleManifest = {
    id: 'behavior-tree',
    name: '@esengine/behavior-tree',
    displayName: 'Behavior Tree',
    version: '1.0.0',
    description: 'AI behavior tree system',
    category: 'AI',
    icon: 'GitBranch',
    isCore: false,
    defaultEnabled: false,
    isEngineModule: true,
    canContainContent: true,
    dependencies: ['core'],
    exports: { components: ['BehaviorTreeComponent'] },
    editorPackage: '@esengine/behavior-tree-editor'
};

export const BehaviorTreePlugin: IRuntimePlugin = {
    manifest,
    runtimeModule: new BehaviorTreeRuntimeModule()
};

export { BehaviorTreeRuntimeModule };
