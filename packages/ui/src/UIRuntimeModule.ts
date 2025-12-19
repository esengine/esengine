import type { IScene, IComponentRegistry } from '@esengine/ecs-framework';
import type { IRuntimeModule, IRuntimePlugin, ModuleManifest, SystemContext } from '@esengine/engine-core';
import {
    TextureServiceToken,
    DynamicAtlasServiceToken,
    type ITextureService,
    type IDynamicAtlasService
} from '@esengine/ecs-engine-bindgen';
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
    UIScrollViewComponent,
    UIToggleComponent,
    UIInputFieldComponent,
    UIDropdownComponent
} from './components';
import { TextBlinkComponent } from './components/TextBlinkComponent';
import { SceneLoadTriggerComponent } from './components/SceneLoadTriggerComponent';
import { UIShinyEffectComponent } from './components/UIShinyEffectComponent';
import { UILayoutSystem } from './systems/UILayoutSystem';
import { UIInputSystem } from './systems/UIInputSystem';
import { UIAnimationSystem } from './systems/UIAnimationSystem';
import { UISliderFillSystem } from './systems/UISliderFillSystem';
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
    UIToggleRenderSystem,
    UIInputFieldRenderSystem,
    UIDropdownRenderSystem,
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
        registry.register(UIToggleComponent);
        registry.register(UIInputFieldComponent);
        registry.register(UIDropdownComponent);
        registry.register(TextBlinkComponent);
        registry.register(SceneLoadTriggerComponent);
        registry.register(UIShinyEffectComponent);
    }

    createSystems(scene: IScene, context: SystemContext): void {
        // 从服务注册表获取依赖 | Get dependencies from service registry
        const textureService = context.services.get(TextureServiceToken);
        const dynamicAtlasService = context.services.get(DynamicAtlasServiceToken);

        // Slider fill control system (runs before layout to modify anchors)
        // 滑块填充控制系统（在布局之前运行以修改锚点）
        const sliderFillSystem = new UISliderFillSystem();
        scene.addSystem(sliderFillSystem);

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

        const toggleRenderSystem = new UIToggleRenderSystem();
        scene.addSystem(toggleRenderSystem);

        const inputFieldRenderSystem = new UIInputFieldRenderSystem();
        scene.addSystem(inputFieldRenderSystem);

        const dropdownRenderSystem = new UIDropdownRenderSystem();
        scene.addSystem(dropdownRenderSystem);

        const textRenderSystem = new UITextRenderSystem();
        scene.addSystem(textRenderSystem);

        if (textureService) {
            // 设置文本渲染系统的纹理回调
            // Set texture callback for text render system
            textRenderSystem.setTextureCallback((id: number, dataUrl: string) => {
                textureService.loadTexture(id, dataUrl);
            });

            // 设置纹理就绪检查回调，用于检测异步加载的纹理是否已就绪
            // Set texture ready checker callback to detect if async-loaded texture is ready
            textRenderSystem.setTextureReadyChecker((id: number) => {
                return textureService.isTextureReady(id);
            });

            // 设置输入框渲染系统的纹理回调
            // Set texture callback for input field render system
            inputFieldRenderSystem.setTextureCallback((id: number, dataUrl: string) => {
                textureService.loadTexture(id, dataUrl);
            });

            // 设置输入框渲染系统的纹理就绪检查回调
            // Set texture ready checker callback for input field render system
            inputFieldRenderSystem.setTextureReadyChecker((id: number) => {
                return textureService.isTextureReady(id);
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
        // 需要 dynamicAtlasService 支持 createBlankTexture 和 updateTextureRegion
        // Requires dynamicAtlasService to support createBlankTexture and updateTextureRegion
        console.log('[UIRuntimeModule] dynamicAtlasService available:', !!dynamicAtlasService);
        if (dynamicAtlasService) {
            // 创建适配器将 IDynamicAtlasService 适配为 IAtlasEngineBridge
            // Create adapter to adapt IDynamicAtlasService to IAtlasEngineBridge
            const atlasBridge: IAtlasEngineBridge = {
                createBlankTexture: (width: number, height: number) => {
                    return dynamicAtlasService.createBlankTexture(width, height);
                },
                updateTextureRegion: (
                    id: number,
                    x: number,
                    y: number,
                    width: number,
                    height: number,
                    pixels: Uint8Array
                ) => {
                    dynamicAtlasService.updateTextureRegion(id, x, y, width, height, pixels);
                }
            };

            console.log('[UIRuntimeModule] Initializing dynamic atlas service...');
            initializeDynamicAtlasService(atlasBridge, {
                expansionStrategy: AtlasExpansionStrategy.Fixed,  // 运行时默认使用固定模式 | Runtime defaults to fixed mode
                initialPageSize: 256,    // 动态模式起始大小 | Dynamic mode initial size
                fixedPageSize: 1024,     // 固定模式页面大小 | Fixed mode page size
                maxPageSize: 2048,       // 最大页面大小 | Max page size
                maxPages: 4,
                maxTextureSize: 512,
                padding: 1
            });
            console.log('[UIRuntimeModule] Dynamic atlas service initialized');

            // 注册纹理加载回调，当纹理通过 EngineIntegration 加载时自动注册路径映射
            // Register texture load callback to automatically register path mapping
            // when textures are loaded through EngineIntegration
            EngineIntegration.onTextureLoad((guid: string, path: string, _textureId: number) => {
                registerTexturePathMapping(guid, path);
            });
        } else {
            console.warn('[UIRuntimeModule] Cannot initialize dynamic atlas service: dynamicAtlasService not available');
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
    editorPackage: '@esengine/ui-editor',
    // Plugin export for runtime loading | 运行时加载的插件导出
    pluginExport: 'UIPlugin'
};

export const UIPlugin: IRuntimePlugin = {
    manifest,
    runtimeModule: new UIRuntimeModule()
};

export { UIRuntimeModule };
