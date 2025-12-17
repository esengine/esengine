/**
 * @esengine/ui - ECS-based UI System
 *
 * 基于 ECS 架构的 UI 系统，支持 WebGL 渲染
 * ECS-based UI system with WebGL rendering support
 *
 * @example
 * ```typescript
 * import {
 *     UIBuilder,
 *     UILayoutSystem,
 *     UIInputSystem,
 *     UIAnimationSystem,
 *     // ECS Render Systems
 *     UIRectRenderSystem,
 *     UITextRenderSystem,
 *     UIButtonRenderSystem,
 *     UIProgressBarRenderSystem,
 *     UISliderRenderSystem,
 *     UIScrollViewRenderSystem,
 *     getUIRenderCollector
 * } from '@esengine/ui';
 *
 * // 创建 UI Scene
 * const uiScene = world.createScene('ui');
 *
 * // 添加 UI 系统（按 updateOrder 自动排序）
 * // Add UI systems (auto-sorted by updateOrder)
 * uiScene.addSystem(new UILayoutSystem());           // Layout first
 * uiScene.addSystem(new UIInputSystem());            // Input handling
 * uiScene.addSystem(new UIAnimationSystem());        // Animation
 *
 * // 添加渲染系统（每个组件类型一个系统）
 * // Add render systems (one per component type)
 * uiScene.addSystem(new UIRectRenderSystem());       // Basic rectangles (order: 100)
 * uiScene.addSystem(new UIProgressBarRenderSystem());// Progress bars (order: 110)
 * uiScene.addSystem(new UISliderRenderSystem());     // Sliders (order: 111)
 * uiScene.addSystem(new UIScrollViewRenderSystem()); // Scroll views (order: 112)
 * uiScene.addSystem(new UIButtonRenderSystem());     // Buttons (order: 113)
 * uiScene.addSystem(new UITextRenderSystem());       // Text (order: 120)
 *
 * // 在渲染前清除收集器
 * // Clear collector before render
 * getUIRenderCollector().clear();
 *
 * // 使用 UIBuilder 创建元素
 * const ui = new UIBuilder(uiScene);
 *
 * const button = ui.button({
 *     x: 100, y: 100,
 *     width: 120, height: 40,
 *     label: 'Click Me',
 *     onClick: () => console.log('Clicked!')
 * });
 *
 * const progressBar = ui.progressBar({
 *     x: 100, y: 160,
 *     width: 200, height: 20,
 *     value: 75,
 *     maxValue: 100
 * });
 * ```
 */

// Components - Core
export {
    UITransformComponent,
    AnchorPreset
} from './components/UITransformComponent';

export {
    UIRenderComponent,
    UIRenderType,
    type UIBorderStyle,
    type UIShadowStyle
} from './components/UIRenderComponent';

export {
    type UIMaterialPropertyOverride,
    type UIMaterialOverrides
} from './systems/render/UIRenderCollector';

export { UIShinyEffectComponent } from './components/UIShinyEffectComponent';

export {
    UIInteractableComponent,
    type UICursorType
} from './components/UIInteractableComponent';

export {
    UITextComponent,
    type UITextAlign,
    type UITextVerticalAlign,
    type UITextOverflow,
    type UIFontWeight
} from './components/UITextComponent';

export { TextBlinkComponent } from './components/TextBlinkComponent';
export { SceneLoadTriggerComponent } from './components/SceneLoadTriggerComponent';

export {
    UILayoutComponent,
    UILayoutType,
    UIJustifyContent,
    UIAlignItems,
    type UIPadding
} from './components/UILayoutComponent';

// Components - Base (new architecture)
// 基础组件（新架构）
export {
    UIGraphicComponent,
    UIImageComponent,
    UISelectableComponent,
    DEFAULT_COLOR_BLOCK,
    type UIImageType,
    type UIFillMethod,
    type UIFillOrigin,
    type UISelectableState,
    type UITransitionType,
    type UIColorBlock,
    type UISpriteState
} from './components/base';

// Components - Widgets
export {
    UIButtonComponent,
    type UIButtonStyle,
    type UIButtonDisplayMode
} from './components/widgets/UIButtonComponent';

export {
    UIProgressBarComponent,
    UIProgressDirection,
    UIProgressFillMode
} from './components/widgets/UIProgressBarComponent';

export {
    UISliderComponent,
    UISliderOrientation
} from './components/widgets/UISliderComponent';

export {
    UIScrollViewComponent,
    UIScrollbarVisibility
} from './components/widgets/UIScrollViewComponent';

// Systems - Core
export { UILayoutSystem } from './systems/UILayoutSystem';
export { UIInputSystem, type UIInputEvent } from './systems/UIInputSystem';
export { UIAnimationSystem, UIEasing, type EasingFunction, type EasingName } from './systems/UIAnimationSystem';
export { UIRenderDataProvider, type IUIRenderDataProvider } from './systems/UIRenderDataProvider';
export { TextBlinkSystem } from './systems/TextBlinkSystem';
export { SceneLoadTriggerSystem } from './systems/SceneLoadTriggerSystem';

// Systems - Render (ECS-compliant render systems)
export {
    // Collector
    UIRenderCollector,
    getUIRenderCollector,
    resetUIRenderCollector,
    invalidateUIRenderCaches,
    requestTextureForAtlas,
    clearTextureRequestCache,
    type UIRenderPrimitive,
    type ProviderRenderData,
    type BatchBreakReason,
    type BatchDebugInfo,
    // Render systems
    UIRenderBeginSystem,
    UIGraphicRenderSystem,
    UIRectRenderSystem,
    UITextRenderSystem,
    UIButtonRenderSystem,
    UIProgressBarRenderSystem,
    UISliderRenderSystem,
    UIScrollViewRenderSystem,
    UIShinyEffectSystem,
    // Render utilities
    getUIRenderTransform,
    renderBorder,
    renderShadow,
    lerpColor,
    packColorWithAlpha,
    getNinePatchTopLeft,
    type UIRenderTransform,
    type BorderRenderOptions,
    type ShadowRenderOptions
} from './systems/render';

// Rendering
export { WebGLUIRenderer } from './rendering/WebGLUIRenderer';
export { TextRenderer, type TextMeasurement, type TextRenderOptions } from './rendering/TextRenderer';

// Builder API
export {
    UIBuilder,
    type UIBaseConfig,
    type UIButtonConfig,
    type UITextConfig,
    type UIImageConfig,
    type UIProgressBarConfig,
    type UISliderConfig,
    type UIPanelConfig,
    type UIScrollViewConfig
} from './UIBuilder';

// Runtime module and plugin
export { UIRuntimeModule, UIPlugin } from './UIRuntimeModule';

// Service tokens | 服务令牌
export {
    UILayoutSystemToken,
    UIInputSystemToken,
    UIRenderProviderToken,
    UITextRenderSystemToken
} from './tokens';

// Dynamic Atlas | 动态图集
export {
    BinPacker,
    DynamicAtlasManager,
    getDynamicAtlasManager,
    setDynamicAtlasManager,
    AtlasExpansionStrategy,
    DynamicAtlasService,
    getDynamicAtlasService,
    setDynamicAtlasService,
    initializeDynamicAtlasService,
    reinitializeDynamicAtlasService,
    registerTexturePathMapping,
    getTexturePathByGuid,
    clearTexturePathMappings,
    type PackedRect,
    type AtlasEntry,
    type IAtlasEngineBridge,
    type DynamicAtlasConfig,
    type TextureInfo
} from './atlas';
