/**
 * @zh ESEngine 行为树运行时模块
 * @en ESEngine Behavior Tree Runtime Module
 *
 * @zh 纯运行时模块，不依赖 asset-system。资产加载由编辑器在 install 时注册。
 * @en Pure runtime module, no asset-system dependency. Asset loading is registered by editor during install.
 */

import type { IScene, ServiceContainer, IComponentRegistry } from '@esengine/ecs-framework';
import type { IRuntimeModule, SystemContext } from '@esengine/engine-core';

import {
    BehaviorTreeRuntimeComponent,
    BehaviorTreeExecutionSystem,
    BehaviorTreeAssetManager,
    GlobalBlackboardService,
    BehaviorTreeSystemToken
} from '@esengine/behavior-tree';

export class BehaviorTreeRuntimeModule implements IRuntimeModule {
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
        const ecsServices = (context as { ecsServices?: ServiceContainer }).ecsServices;
        const behaviorTreeSystem = new BehaviorTreeExecutionSystem(ecsServices);

        if (context.isEditor) {
            behaviorTreeSystem.enabled = false;
        }

        scene.addSystem(behaviorTreeSystem);
        context.services.register(BehaviorTreeSystemToken, behaviorTreeSystem);
    }
}
