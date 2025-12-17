/**
 * UI Widget Marker Component
 * UI 控件标记组件
 *
 * A marker component that indicates an entity has a specialized widget component
 * (Button, ProgressBar, Slider, ScrollView, etc.) with its own dedicated render system.
 *
 * This allows UIRectRenderSystem to skip entities without hardcoding widget component checks.
 *
 * 标记组件，表示实体有专门的 widget 组件（按钮、进度条、滑块、滚动视图等），
 * 并有自己的专用渲染系统。
 *
 * 这使得 UIRectRenderSystem 可以跳过这些实体，而无需硬编码 widget 组件检查。
 *
 * @example
 * ```typescript
 * // Widget components should add this marker when added to entity
 * // Widget 组件在添加到实体时应该添加此标记
 * class UIButtonComponent extends Component {
 *     onEnable(): void {
 *         if (!this.entity.hasComponent(UIWidgetMarker)) {
 *             this.entity.addComponent(UIWidgetMarker);
 *         }
 *     }
 * }
 * ```
 */

import { Component, ECSComponent, Serializable } from '@esengine/ecs-framework';

/**
 * UI Widget Marker - Empty marker component
 * UI 控件标记 - 空标记组件
 *
 * This component has no data, it's purely used for entity tagging.
 * 此组件没有数据，纯粹用于实体标记。
 */
@ECSComponent('UIWidgetMarker')
@Serializable({ version: 1, typeId: 'UIWidgetMarker' })
export class UIWidgetMarker extends Component {
    // Marker component - no data needed
    // 标记组件 - 不需要数据
}
