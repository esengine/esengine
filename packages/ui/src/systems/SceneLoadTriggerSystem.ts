/**
 * 场景加载触发系统
 * Scene Load Trigger System
 *
 * 处理 SceneLoadTriggerComponent，绑定 UIInteractable 点击事件到场景加载。
 * Processes SceneLoadTriggerComponent, binds UIInteractable click to scene loading.
 */

import { Entity, EntitySystem, Matcher, ECSSystem, Core } from '@esengine/ecs-framework';
import { SceneLoadTriggerComponent } from '../components/SceneLoadTriggerComponent';
import { UIInteractableComponent } from '../components/UIInteractableComponent';

/**
 * 场景加载函数类型（与 RuntimeSceneManager.loadScene 兼容）
 * Scene load function type (compatible with RuntimeSceneManager.loadScene)
 */
type SceneLoadFunction = (sceneName: string) => Promise<void>;

/**
 * 场景管理器接口（最小化，避免循环依赖）
 * Scene manager interface (minimal, avoids circular dependency)
 *
 * 包含 IService 的 dispose 方法以兼容 ServiceContainer。
 * Includes IService's dispose method for ServiceContainer compatibility.
 */
interface ISceneManager {
    loadScene(sceneName: string): Promise<void>;
    dispose(): void;
}

/**
 * 全局场景管理器服务键
 * Global scene manager service key
 *
 * 使用 Symbol.for 确保与 BrowserRuntime 中注册的键一致。
 * Uses Symbol.for to match the key registered in BrowserRuntime.
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
    private _sceneLoader: SceneLoadFunction | null = null;

    constructor() {
        super(Matcher.empty().all(SceneLoadTriggerComponent, UIInteractableComponent));
    }

    /**
     * 设置场景加载函数
     * Set scene load function
     *
     * 可以直接设置函数，或者系统会尝试从服务注册表获取 RuntimeSceneManager。
     * Can set function directly, or system will try to get RuntimeSceneManager from service registry.
     */
    public setSceneLoader(loader: SceneLoadFunction): void {
        this._sceneLoader = loader;
    }

    protected override process(entities: readonly Entity[]): void {
        // 如果没有设置场景加载器，尝试从服务注册表获取
        // If no scene loader set, try to get from service registry
        if (!this._sceneLoader) {
            this._tryGetSceneManager();
        }

        for (const entity of entities) {
            const trigger = entity.getComponent(SceneLoadTriggerComponent);
            const interactable = entity.getComponent(UIInteractableComponent);

            if (!trigger || !interactable) continue;
            if (!trigger.enabled || !trigger.targetScene) continue;

            // 只绑定一次回调
            // Only bind callback once
            if (trigger._callbackBound) continue;

            this._bindClickHandler(entity, trigger, interactable);
        }
    }

    /**
     * 尝试从全局服务获取场景管理器
     * Try to get scene manager from global services
     */
    private _tryGetSceneManager(): void {
        try {
            // 从 Core.services 获取场景管理器
            // Get scene manager from Core.services
            // RuntimeSceneManager 实现了 IService 接口
            // RuntimeSceneManager implements IService interface
            const sceneManager = Core.services.tryResolve<ISceneManager>(GlobalSceneManagerKey);
            if (sceneManager?.loadScene) {
                this._sceneLoader = (sceneName: string) => sceneManager.loadScene(sceneName);
            }
        } catch (e) {
            // 忽略错误，保持 _sceneLoader 为 null
            // Ignore error, keep _sceneLoader as null
        }
    }

    /**
     * 绑定点击处理器
     * Bind click handler
     */
    private _bindClickHandler(
        entity: Entity,
        trigger: SceneLoadTriggerComponent,
        interactable: UIInteractableComponent
    ): void {
        const targetScene = trigger.targetScene;

        // 保存原有的 onClick（如果有）
        // Save original onClick (if any)
        const originalOnClick = interactable.onClick;

        interactable.onClick = () => {
            // 调用原有回调
            // Call original callback
            originalOnClick?.();

            // 检查是否启用
            // Check if enabled
            if (!trigger.enabled) return;

            // 禁用（防止重复点击）
            // Disable (prevent double clicks)
            if (trigger.disableOnClick) {
                trigger.enabled = false;
            }

            // 尝试获取场景加载器（可能在回调绑定后才注册）
            // Try to get scene loader (may be registered after callback binding)
            if (!this._sceneLoader) {
                this._tryGetSceneManager();
            }

            // 加载场景
            // Load scene
            if (this._sceneLoader) {
                this._sceneLoader(targetScene).catch((error) => {
                    console.error(`[SceneLoadTriggerSystem] Failed to load scene "${targetScene}":`, error);
                    // 恢复启用状态
                    // Restore enabled state
                    if (trigger.disableOnClick) {
                        trigger.enabled = true;
                    }
                });
            }
            // 静默处理：编辑器预览模式下场景切换不可用
            // Silent handling: scene switching not available in editor preview mode
        };

        trigger._callbackBound = true;
    }
}
