/**
 * FairyGUI ECS Integration
 *
 * ECS components, systems, and runtime module for FairyGUI integration.
 *
 * FairyGUI 的 ECS 组件、系统和运行时模块
 */

export { FGUIComponent } from './FGUIComponent';
export type { IFGUIComponentData } from './FGUIComponent';

export {
    FGUIRenderSystem,
    FGUIRenderSystemToken,
    getFGUIRenderSystem,
    setFGUIRenderSystem
} from './FGUIRenderSystem';
export type { RenderSubmitCallback } from './FGUIRenderSystem';

export { FGUIUpdateSystem } from './FGUIUpdateSystem';
export { FGUIRuntimeModule, FGUIPlugin } from './FGUIRuntimeModule';
