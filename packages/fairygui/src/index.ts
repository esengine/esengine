/**
 * @esengine/fairygui
 *
 * FairyGUI ECS integration package.
 * Provides a complete UI system compatible with FairyGUI Editor.
 *
 * FairyGUI ECS 集成包，提供与 FairyGUI 编辑器兼容的完整 UI 系统
 */

// Core classes | 核心类
export { GObject } from './core/GObject';
export { GComponent } from './core/GComponent';
export { GRoot } from './core/GRoot';
export { GGroup } from './core/GGroup';
export { Controller } from './core/Controller';
export { Transition } from './core/Transition';
export { Timer } from './core/Timer';
export { Stage, EScaleMode, EAlignMode } from './core/Stage';
export { UIConfig, getUIConfig, setUIConfig } from './core/UIConfig';
export { UIObjectFactory } from './core/UIObjectFactory';
export { GObjectPool } from './core/GObjectPool';
export { DragDropManager } from './core/DragDropManager';
export {
    ServiceContainer,
    getGlobalContainer,
    setGlobalContainer,
    EServiceLifecycle,
    Inject
} from './core/ServiceContainer';
export type { ServiceIdentifier, ServiceFactory } from './core/ServiceContainer';

// Field types | 字段类型
export {
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
    EGraphType
} from './core/FieldTypes';

// Display objects | 显示对象
export { DisplayObject } from './display/DisplayObject';
export { Container } from './display/Container';
export { Image } from './display/Image';
export { TextField } from './display/TextField';
export { Graph } from './display/Graph';
export { MovieClip } from './display/MovieClip';
export type { IFrame, SimpleHandler } from './display/MovieClip';
export { InputTextField } from './display/InputTextField';

// Widgets | 控件
export { GImage } from './widgets/GImage';
export { GTextField } from './widgets/GTextField';
export { GGraph } from './widgets/GGraph';
export { GButton } from './widgets/GButton';
export { GProgressBar } from './widgets/GProgressBar';
export { GSlider } from './widgets/GSlider';
export { GLoader } from './widgets/GLoader';
export { GMovieClip } from './widgets/GMovieClip';
export { GList } from './widgets/GList';
export type { ItemRenderer, ItemProvider } from './widgets/GList';
export { GTextInput, EKeyboardType } from './widgets/GTextInput';
export { PopupMenu } from './widgets/PopupMenu';
export { Window } from './widgets/Window';
export type { IUISource } from './widgets/Window';

// Events | 事件
export { EventDispatcher } from './events/EventDispatcher';
export type { TypedEventListener, EventListener, FGUIEventType, IEventContext } from './events/EventDispatcher';
export { FGUIEvents } from './events/Events';
export type { IInputEventData } from './events/Events';

// Layout | 布局
export { Relations } from './layout/Relations';
export { RelationItem } from './layout/RelationItem';

// Gears | 齿轮
export {
    GearBase,
    GearTweenConfig,
    GearDisplay,
    GearDisplay2,
    GearXY,
    GearSize,
    GearLook,
    GearColor,
    GearText,
    GearIcon,
    GearFontSize,
    GearAnimation
} from './gears';

// Scroll | 滚动
export { ScrollPane } from './scroll/ScrollPane';

// Package | 包管理
export { UIPackage } from './package/UIPackage';
export { PackageItem } from './package/PackageItem';

// Utils | 工具
export { Point, Rectangle, Margin } from './utils/MathTypes';
export type { IPoint, IRectangle } from './utils/MathTypes';
export { ByteBuffer } from './utils/ByteBuffer';

// Binding | 绑定
export {
    ObservableProperty,
    ComputedProperty,
    PropertyBinder
} from './binding/PropertyBinding';
export type {
    IObservableProperty,
    IWritableProperty,
    IPropertySubscription,
    PropertyChangeCallback
} from './binding/PropertyBinding';

// Render | 渲染
export { RenderCollector } from './render/RenderCollector';
export { RenderBridge } from './render/RenderBridge';
export { Canvas2DBackend } from './render/Canvas2DBackend';
export {
    FGUIRenderDataProvider,
    createFGUIRenderDataProvider
} from './render/FGUIRenderDataProvider';
export type {
    IEngineRenderData,
    IFGUIRenderDataProvider,
    TextureResolverFn
} from './render/FGUIRenderDataProvider';
export type {
    IRenderCollector,
    IRenderPrimitive,
    ERenderPrimitiveType,
    ETextAlign,
    ETextVAlign
} from './render/IRenderCollector';
export type {
    IRenderBackend,
    IRenderStats,
    ITextureHandle,
    IFontHandle,
    RenderBackendFactory
} from './render/IRenderBackend';

// Tween | 补间动画
export { GTween } from './tween/GTween';
export { GTweener } from './tween/GTweener';
export type { TweenCallback } from './tween/GTweener';
export { TweenManager } from './tween/TweenManager';
export { TweenValue } from './tween/TweenValue';
export { evaluateEase } from './tween/EaseType';

// Asset | 资产
export {
    FUIAssetLoader,
    fuiAssetLoader,
    FGUITextureManager,
    getFGUITextureManager,
    createTextureResolver,
    setGlobalTextureService,
    getGlobalTextureService
} from './asset';
export type {
    IFUIAsset,
    IAssetLoader,
    IAssetContent,
    IAssetParseContext,
    ITextureService
} from './asset';

// ECS Integration | ECS 集成
export {
    FGUIComponent,
    FGUIRenderSystem,
    FGUIRenderSystemToken,
    getFGUIRenderSystem,
    setFGUIRenderSystem,
    FGUIRuntimeModule,
    FGUIPlugin
} from './ecs';
export type { IFGUIComponentData, RenderSubmitCallback } from './ecs';

// Internal wiring (breaks circular dependencies)
import './core/init';
