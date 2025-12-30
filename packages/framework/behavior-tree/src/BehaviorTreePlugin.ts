import type { Core, ServiceContainer, IPlugin, IScene } from '@esengine/ecs-framework';
import { BehaviorTreeExecutionSystem } from './execution/BehaviorTreeExecutionSystem';
import { BehaviorTreeAssetManager } from './execution/BehaviorTreeAssetManager';
import { GlobalBlackboardService } from './Services/GlobalBlackboardService';

/**
 * @zh 行为树插件
 * @en Behavior Tree Plugin
 *
 * @zh 为 ECS 框架提供行为树支持的插件。
 * 可与任何基于 @esengine/ecs-framework 的引擎集成（Cocos、Laya、Node.js 等）。
 *
 * @en Plugin that provides behavior tree support for ECS framework.
 * Can be integrated with any engine based on @esengine/ecs-framework (Cocos, Laya, Node.js, etc.).
 *
 * @example
 * ```typescript
 * import { Core, Scene } from '@esengine/ecs-framework';
 * import { BehaviorTreePlugin, BehaviorTreeBuilder, BehaviorTreeStarter } from '@esengine/behavior-tree';
 *
 * // Initialize
 * Core.create();
 * const plugin = new BehaviorTreePlugin();
 * await Core.installPlugin(plugin);
 *
 * // Setup scene
 * const scene = new Scene();
 * plugin.setupScene(scene);
 * Core.setScene(scene);
 *
 * // Create and start behavior tree
 * const tree = BehaviorTreeBuilder.create('MyAI')
 *     .selector('Root')
 *         .log('Hello from behavior tree!')
 *     .end()
 *     .build();
 *
 * const entity = scene.createEntity('AIEntity');
 * BehaviorTreeStarter.start(entity, tree);
 * ```
 */
export class BehaviorTreePlugin implements IPlugin {
    /**
     * @zh 插件名称
     * @en Plugin name
     */
    readonly name = '@esengine/behavior-tree';

    /**
     * @zh 插件版本
     * @en Plugin version
     */
    readonly version = '1.0.0';

    /**
     * @zh 插件依赖
     * @en Plugin dependencies
     */
    readonly dependencies: readonly string[] = [];

    private _services: ServiceContainer | null = null;

    /**
     * @zh 安装插件
     * @en Install plugin
     *
     * @param _core - Core 实例
     * @param services - 服务容器
     */
    install(_core: Core, services: ServiceContainer): void {
        this._services = services;

        // Register services
        if (!services.isRegistered(GlobalBlackboardService)) {
            services.registerSingleton(GlobalBlackboardService);
        }
        if (!services.isRegistered(BehaviorTreeAssetManager)) {
            services.registerSingleton(BehaviorTreeAssetManager);
        }
    }

    /**
     * @zh 卸载插件
     * @en Uninstall plugin
     */
    uninstall(): void {
        if (this._services) {
            const assetManager = this._services.tryResolve(BehaviorTreeAssetManager);
            if (assetManager) {
                assetManager.dispose();
            }

            const blackboardService = this._services.tryResolve(GlobalBlackboardService);
            if (blackboardService) {
                blackboardService.dispose();
            }
        }
        this._services = null;
    }

    /**
     * @zh 设置场景，添加行为树执行系统
     * @en Setup scene, add behavior tree execution system
     *
     * @param scene - 要设置的场景
     *
     * @example
     * ```typescript
     * const scene = new Scene();
     * plugin.setupScene(scene);
     * Core.setScene(scene);
     * ```
     */
    setupScene(scene: IScene): void {
        const system = new BehaviorTreeExecutionSystem(this._services ?? undefined);
        scene.addSystem(system);
    }
}
