/**
 * UI Base Components
 * UI 基础组件
 *
 * These are the foundation components for the UI system:
 * - UIGraphicComponent: Base for all visual elements
 * - UIImageComponent: Texture/sprite display
 * - UISelectableComponent: Base for interactive elements
 *
 * 这些是 UI 系统的基础组件：
 * - UIGraphicComponent: 所有可视元素的基础
 * - UIImageComponent: 纹理/精灵显示
 * - UISelectableComponent: 可交互元素的基础
 */

export { UIGraphicComponent } from './UIGraphicComponent';
export {
    UIImageComponent,
    type UIImageType,
    type UIFillMethod,
    type UIFillOrigin
} from './UIImageComponent';
export {
    UISelectableComponent,
    type UISelectableState,
    type UITransitionType,
    type UIColorBlock,
    type UISpriteState,
    DEFAULT_COLOR_BLOCK
} from './UISelectableComponent';
