import type { IScene, IComponentRegistry } from '@esengine/ecs-framework';
import type { IRuntimeModule, IRuntimePlugin, ModuleManifest, SystemContext } from '@esengine/engine-core';
import { EngineBridgeToken } from '@esengine/ecs-engine-bindgen';
import { EngineIntegration } from '@esengine/asset-system';

import { initializeDynamicAtlasService, registerTexturePathMapping, AtlasExpansionStrategy, type IAtlasEngineBridge } from './atlas';
import {
    UITransformComponent,
    UIRenderComponent,
    UIInteractableComponent,
    UITextComponent,
    UILayoutComponent,
    UIButtonComponent,
    UIProgressBarComponent,
    UISliderComponent,
    UIScrollViewComponent
} from './components';
import { TextBlinkComponent } from './components/TextBlinkComponent';
import { SceneLoadTriggerComponent } from './components/SceneLoadTriggerComponent';
import { UIShinyEffectComponent } from './components/UIShinyEffectComponent';
import { UILayoutSystem } from './systems/UILayoutSystem';
import { UIInputSystem } from './systems/UIInputSystem';
import { UIAnimationSystem } from './systems/UIAnimationSystem';
import { UIRenderDataProvider } from './systems/UIRenderDataProvider';
import { TextBlinkSystem } from './systems/TextBlinkSystem';
import { SceneLoadTriggerSystem } from './systems/SceneLoadTriggerSystem';
import {
    UIRenderBeginSystem,
    UIRectRenderSystem,
    UITextRenderSystem,
    UIButtonRenderSystem,
    UIProgressBarRenderSystem,
    UISliderRenderSystem,
    UIScrollViewRenderSystem,
    UIShinyEffectSystem
} from './systems/render';
import {
    UILayoutSystemToken,
    UIInputSystemToken,
    UIRenderProviderToken,
    UITextRenderSystemToken
} from './tokens';

// 重新导出 tokens | Re-export tokens
export {
    UILayoutSystemToken,
    UIInputSystemToken,
    UIRenderProviderToken,
    UITextRenderSystemToken
} from './tokens';

class UIRuntimeModule implements IRuntimeModule {
    registerComponents(registry: IComponentRegistry): void {
        registry.register(UITransformComponent);
        registry.register(UIRenderComponent);
        registry.register(UIInteractableComponent);
        registry.register(UITextComponent);
        registry.register(UILayoutComponent);
        registry.register(UIButtonComponent);
        registry.register(UIProgressBarComponent);
        registry.register(UISliderComponent);
        registry.register(UIScrollViewComponent);
        registry.register(TextBlinkComponent);
        registry.register(SceneLoadTriggerComponent);
        registry.register(UIShinyEffectComponent);
    }

    createSystems(scene: IScene, context: SystemContext): void {
        // 从服务注册表获取依赖 | Get dependencies from service registry
        const engineBridge = context.services.get(EngineBridgeToken);

        const layoutSystem = new UILayoutSystem();
        scene.addSystem(layoutSystem);

        const animationSystem = new UIAnimationSystem();
        scene.addSystem(animationSystem);

        // 文本闪烁系统 | Text blink system
        const textBlinkSystem = new TextBlinkSystem();
        scene.addSystem(textBlinkSystem);

        // 场景加载触发系统 | Scene load trigger system
        const sceneLoadTriggerSystem = new SceneLoadTriggerSystem();
        scene.addSystem(sceneLoadTriggerSystem);

        const renderBeginSystem = new UIRenderBeginSystem();
        scene.addSystem(renderBeginSystem);

        // Shiny effect system (runs before render systems to apply material overrides)
        // 闪光效果系统（在渲染系统之前运行以应用材质覆盖）
        const shinyEffectSystem = new UIShinyEffectSystem();
        scene.addSystem(shinyEffectSystem);

        const rectRenderSystem = new UIRectRenderSystem();
        scene.addSystem(rectRenderSystem);

        const progressBarRenderSystem = new UIProgressBarRenderSystem();
        scene.addSystem(progressBarRenderSystem);

        const sliderRenderSystem = new UISliderRenderSystem();
        scene.addSystem(sliderRenderSystem);

        const scrollViewRenderSystem = new UIScrollViewRenderSystem();
        scene.addSystem(scrollViewRenderSystem);

        const buttonRenderSystem = new UIButtonRenderSystem();
        scene.addSystem(buttonRenderSystem);

        const textRenderSystem = new UITextRenderSystem();
        scene.addSystem(textRenderSystem);

        if (engineBridge) {
            textRenderSystem.setTextureCallback((id: number, dataUrl: string) => {
                engineBridge.loadTexture(id, dataUrl);
            });
        }

        const uiRenderProvider = new UIRenderDataProvider();
        const inputSystem = new UIInputSystem();
        inputSystem.setLayoutSystem(layoutSystem);
        scene.addSystem(inputSystem);

        // 注册服务到服务注册表 | Register services to service registry
        context.services.register(UILayoutSystemToken, layoutSystem);
        context.services.register(UIRenderProviderToken, uiRenderProvider);
        context.services.register(UIInputSystemToken, inputSystem);
        context.services.register(UITextRenderSystemToken, textRenderSystem);

        // 初始化动态图集服务 | Initialize dynamic atlas service
        // 需要 engineBridge 支持 createBlankTexture 和 updateTextureRegion
        // Requires engineBridge to support createBlankTexture and updateTextureRegion
        if (engineBridge?.createBlankTexture && engineBridge?.updateTextureRegion) {
            // 创建适配器将 EngineBridge 适配为 IAtlasEngineBridge
            // Create adapter to adapt EngineBridge to IAtlasEngineBridge
            const atlasBridge: IAtlasEngineBridge = {
                createBlankTexture: (width: number, height: number) => {
                    return engineBridge.createBlankTexture!(width, height);
                },
                updateTextureRegion: (
                    id: number,
                    x: number,
                    y: number,
                    width: number,
                    height: number,
                    pixels: Uint8Array
                ) => {
                    engineBridge.updateTextureRegion!(id, x, y, width, height, pixels);
                }
            };

            initializeDynamicAtlasService(atlasBridge, {
                expansionStrategy: AtlasExpansionStrategy.Fixed,  // 运行时默认使用固定模式 | Runtime defaults to fixed mode
                initialPageSize: 256,    // 动态模式起始大小 | Dynamic mode initial size
                fixedPageSize: 1024,     // 固定模式页面大小 | Fixed mode page size
                maxPageSize: 2048,       // 最大页面大小 | Max page size
                maxPages: 4,
                maxTextureSize: 512,
                padding: 1
            });

            // 注册纹理加载回调，当纹理通过 EngineIntegration 加载时自动注册路径映射
            // Register texture load callback to automatically register path mapping
            // when textures are loaded through EngineIntegration
            EngineIntegration.onTextureLoad((guid: string, path: string, _textureId: number) => {
                registerTexturePathMapping(guid, path);
            });
        }
    }
}

const manifest: ModuleManifest = {
    id: 'ui',
    name: '@esengine/ui',
    displayName: 'UI System',
    version: '1.0.0',
    description: 'ECS-based UI system',
    category: 'Rendering',
    icon: 'Layout',
    isCore: false,
    defaultEnabled: false,
    isEngineModule: true,
    canContainContent: true,
    dependencies: ['core', 'math'],
    exports: { components: ['UICanvasComponent'] },
    editorPackage: '@esengine/ui-editor'
};

export const UIPlugin: IRuntimePlugin = {
    manifest,
    runtimeModule: new UIRuntimeModule()
};

export { UIRuntimeModule };
