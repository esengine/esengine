/**
 * @esengine/sdk - 统一 SDK 入口
 *
 * Unified SDK entry point for user scripts.
 * 用户脚本的统一 SDK 入口。
 *
 * @example
 * ```typescript
 * // 统一导入所有引擎 API
 * // Unified import for all engine APIs
 * import { Component, Entity, Vector2, SpriteComponent } from '@esengine/sdk';
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Core ECS Framework (@esengine/ecs-framework)
// 核心 ECS 框架
// ============================================================================
export * from '@esengine/ecs-framework';

// ============================================================================
// Math Library (@esengine/ecs-framework-math)
// 数学库
// ============================================================================
export * from '@esengine/ecs-framework-math';

// ============================================================================
// Engine Core (@esengine/engine-core)
// 引擎核心
// ============================================================================
export * from '@esengine/engine-core';

// ============================================================================
// Sprite System (@esengine/sprite)
// 精灵系统
// ============================================================================
export * from '@esengine/sprite';

// ============================================================================
// FairyGUI System (@esengine/fairygui)
// FairyGUI 系统
// Note: Selective exports to avoid conflicts with ecs-framework and math
// ============================================================================
export {
    // ECS Integration
    FGUIComponent,
    FGUIRenderSystem,
    getFGUIRenderSystem,
    setFGUIRenderSystem,
    FGUIRuntimeModule,
    FGUIPlugin,
    // Core
    GObject,
    GComponent,
    GRoot,
    GGroup,
    Controller,
    Transition,
    UIConfig,
    getUIConfig,
    setUIConfig,
    UIObjectFactory,
    GObjectPool,
    DragDropManager,
    EScaleMode,
    EAlignMode,
    // Widgets
    GImage,
    GTextField,
    GGraph,
    GButton,
    GProgressBar,
    GSlider,
    GLoader,
    GList,
    GTextInput,
    EKeyboardType,
    PopupMenu,
    Window,
    // Package
    UIPackage,
    PackageItem,
    // Events
    EventDispatcher,
    FGUIEvents,
    // Render
    RenderCollector,
    RenderBridge,
    Canvas2DBackend,
    FGUIRenderDataProvider,
    createFGUIRenderDataProvider,
    // Tween
    GTween,
    GTweener,
    TweenManager,
    TweenValue,
    evaluateEase,
    // Asset
    FUIAssetLoader,
    fuiAssetLoader,
    // Field Types
    EButtonMode,
    EAutoSizeType,
    EAlignType,
    EVertAlignType,
    ELoaderFillType,
    EListLayoutType,
    EListSelectionMode,
    EOverflowType,
    EPackageItemType,
    EObjectType,
    EProgressTitleType,
    EScrollBarDisplayType,
    EScrollType,
    EFlipType,
    EChildrenRenderOrder,
    EGroupLayoutType,
    EPopupDirection,
    ERelationType,
    EFillMethod,
    EFillOrigin,
    EObjectPropID,
    EGearType,
    EEaseType,
    EBlendMode,
    ETransitionActionType,
    EGraphType,
} from '@esengine/fairygui';

// Re-export conflicting types with FGUI prefix
export {
    Timer as FGUITimer,
    Stage as FGUIStage,
    ServiceContainer as FGUIServiceContainer,
    Point as FGUIPoint,
    Rectangle as FGUIRectangle,
} from '@esengine/fairygui';

export type {
    // FairyGUI types
    IFGUIComponentData,
    RenderSubmitCallback,
    ItemRenderer,
    ItemProvider,
    IUISource,
    TypedEventListener,
    EventListener,
    FGUIEventType,
    IEventContext,
    IInputEventData,
    IFUIAsset,
    IEngineRenderData,
    IFGUIRenderDataProvider,
    TextureResolverFn,
    TweenCallback,
} from '@esengine/fairygui';

// ============================================================================
// Audio System (@esengine/audio)
// 音频系统
// ============================================================================
export * from '@esengine/audio';

// ============================================================================
// Camera System (@esengine/camera)
// 摄像机系统
// ============================================================================
export * from '@esengine/camera';

// ============================================================================
// Particle System (@esengine/particle)
// 粒子系统
// ============================================================================
export * from '@esengine/particle';

// ============================================================================
// Physics 2D System (@esengine/physics-rapier2d)
// 2D 物理系统
// ============================================================================
export * from '@esengine/physics-rapier2d';

// ============================================================================
// Tilemap System (@esengine/tilemap)
// 瓦片地图系统
// ============================================================================
export * from '@esengine/tilemap';

// ============================================================================
// Behavior Tree System (@esengine/behavior-tree)
// 行为树系统
// ============================================================================
export * from '@esengine/behavior-tree';

// ============================================================================
// Asset System (@esengine/asset-system)
// 资产系统
// ============================================================================
export * from '@esengine/asset-system';
