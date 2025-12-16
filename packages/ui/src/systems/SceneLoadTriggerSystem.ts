/**
 * 场景加载触发系统
 * Scene Load Trigger System
 *
 * 处理 SceneLoadTriggerComponent，绑定 UIInteractable 点击事件到场景加载。
 * Processes SceneLoadTriggerComponent, binds UIInteractable click to scene loading.
 *
 * 设计说明 | Design Notes:
 * - 每次点击时动态从服务容器获取 RuntimeSceneManager
 * - 不缓存服务引用，避免 Play/Stop 切换时引用失效
 * - Dynamically resolves RuntimeSceneManager from service container on each click
 * - Avoids caching service references to handle Play/Stop lifecycle correctly
 */

import { Entity, EntitySystem, Matcher, ECSSystem, Core } from '@esengine/ecs-framework';
import { SceneLoadTriggerComponent } from '../components/SceneLoadTriggerComponent';
import { UIInteractableComponent } from '../components/UIInteractableComponent';

/**
 * 场景管理器接口（最小化，避免循环依赖）
 * Scene manager interface (minimal, avoids circular dependency)
 *
 * 包含 IService 所需方法以满足 tryResolve 类型约束。
 * Includes IService required methods to satisfy tryResolve type constraint.
 */
interface ISceneManager {
    loadScene(sceneName: string): Promise<void>;
    dispose(): void;
}

/**
 * 全局场景管理器服务键
 * Global scene manager service key
 *
 * 使用 Symbol.for 确保与 BrowserRuntime/Viewport 中注册的键一致。
 * Uses Symbol.for to match the key registered in BrowserRuntime/Viewport.
 */
const GlobalSceneManagerKey = Symbol.for('@esengine/service:runtimeSceneManager');

/**
 * 场景加载触发系统
 * Scene Load Trigger System
 *
 * 自动将 SceneLoadTriggerComponent 的配置连接到 UIInteractable 的点击事件。
 * Automatically connects SceneLoadTriggerComponent config to UIInteractable click events.
 */
@ECSSystem('SceneLoadTrigger')
export class SceneLoadTriggerSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(SceneLoadTriggerComponent, UIInteractableComponent));
    }

    protected override process(entities: readonly Entity[]): void {
        for (const entity of entities) {
            const trigger = entity.getComponent(SceneLoadTriggerComponent);
            const interactable = entity.getComponent(UIInteractableComponent);

            if (!trigger || !interactable) continue;
            if (!trigger.enabled || !trigger.targetScene) continue;

            // 只绑定一次回调 | Only bind callback once
            if (trigger._callbackBound) continue;

            this._bindClickHandler(trigger, interactable);
        }
    }

    /**
     * 绑定点击处理器
     * Bind click handler
     *
     * 关键设计：不缓存 sceneManager 引用，每次点击时动态获取。
     * Key design: Don't cache sceneManager reference, resolve dynamically on each click.
     */
    private _bindClickHandler(
        trigger: SceneLoadTriggerComponent,
        interactable: UIInteractableComponent
    ): void {
        const targetScene = trigger.targetScene;
        const originalOnClick = interactable.onClick;

        interactable.onClick = () => {
            originalOnClick?.();

            if (!trigger.enabled) return;

            if (trigger.disableOnClick) {
                trigger.enabled = false;
            }

            // 每次点击时动态获取场景管理器
            // Resolve scene manager dynamically on each click
            const sceneManager = Core.services.tryResolve<ISceneManager>(GlobalSceneManagerKey);
            if (!sceneManager?.loadScene) {
                // 编辑器预览模式下可能未注册，静默处理
                // May not be registered in editor preview mode, handle silently
                return;
            }

            sceneManager.loadScene(targetScene).catch((error) => {
                console.error(`[SceneLoadTriggerSystem] Failed to load scene "${targetScene}":`, error);
                if (trigger.disableOnClick) {
                    trigger.enabled = true;
                }
            });
        };

        trigger._callbackBound = true;
    }
}
