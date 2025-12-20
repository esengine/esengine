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
export { Image } from './display/Image';
export { TextField } from './display/TextField';
export { Graph } from './display/Graph';

// Widgets | 控件
export { GImage } from './widgets/GImage';
export { GTextField } from './widgets/GTextField';
export { GGraph } from './widgets/GGraph';
export { GButton } from './widgets/GButton';
export { GProgressBar } from './widgets/GProgressBar';
export { GSlider } from './widgets/GSlider';

// Events | 事件
export { EventDispatcher } from './events/EventDispatcher';
export { FGUIEvents } from './events/Events';
export type { IInputEventData } from './events/Events';

// Layout | 布局
export { Relations } from './layout/Relations';
export { RelationItem } from './layout/RelationItem';

// Gears | 齿轮
export { GearBase, GearTweenConfig } from './gears/GearBase';

// Scroll | 滚动
export { ScrollPane } from './scroll/ScrollPane';

// Package | 包管理
export { UIPackage } from './package/UIPackage';
export { PackageItem } from './package/PackageItem';

// Utils | 工具
export { Point, Rectangle, Margin } from './utils/MathTypes';
export type { IPoint, IRectangle } from './utils/MathTypes';
export { ByteBuffer } from './utils/ByteBuffer';

// Render | 渲染
export type {
    IRenderCollector,
    IRenderPrimitive,
    ERenderPrimitiveType,
    ETextAlign,
    ETextVAlign
} from './render/IRenderCollector';
