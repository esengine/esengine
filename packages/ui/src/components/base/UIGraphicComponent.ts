/**
 * UI Graphic Component - Base for all visual UI elements
 * UI 图形组件 - 所有可视 UI 元素的基类
 *
 * This is the foundation for any UI element that can be rendered.
 * 这是所有可渲染 UI 元素的基础。
 */

import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';

/**
 * UI Graphic Component
 * UI 图形组件
 *
 * Base component for all visual UI elements. Provides:
 * - Color tinting
 * - Raycast target flag (for input detection)
 * - Material reference
 *
 * 所有可视 UI 元素的基础组件。提供：
 * - 颜色着色
 * - 射线检测目标标志（用于输入检测）
 * - 材质引用
 *
 * @example
 * ```typescript
 * const graphic = entity.addComponent(UIGraphicComponent);
 * graphic.color = 0xFF0000; // Red tint
 * graphic.raycastTarget = true;
 * ```
 */
@ECSComponent('UIGraphic')
@Serializable({ version: 1, typeId: 'UIGraphic' })
export class UIGraphicComponent extends Component {
    /**
     * Tint color (0xRRGGBB format)
     * 着色颜色（0xRRGGBB 格式）
     *
     * This color is multiplied with the texture/content color.
     * White (0xFFFFFF) means no tinting.
     * 此颜色与纹理/内容颜色相乘。
     * 白色 (0xFFFFFF) 表示不着色。
     */
    @Serialize()
    @Property({ type: 'color', label: 'Color / 颜色' })
    color: number = 0xFFFFFF;

    /**
     * Alpha transparency (0-1)
     * 透明度 (0-1)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Alpha / 透明度', min: 0, max: 1, step: 0.1 })
    alpha: number = 1;

    /**
     * Whether this graphic should be considered for raycasting (input detection)
     * 此图形是否应参与射线检测（输入检测）
     *
     * Set to false for decorative elements that shouldn't block input.
     * 对于不应阻挡输入的装饰性元素，设置为 false。
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Raycast Target / 射线目标' })
    raycastTarget: boolean = true;

    /**
     * Material ID for custom rendering
     * 自定义渲染的材质 ID
     *
     * 0 = default UI material
     * 0 = 默认 UI 材质
     */
    @Serialize()
    @Property({ type: 'number', label: 'Material ID / 材质 ID' })
    materialId: number = 0;

    /**
     * Internal dirty flag - set when visual properties change
     * 内部脏标记 - 当视觉属性改变时设置
     */
    _isDirty: boolean = true;

    /**
     * Mark this graphic as needing re-render
     * 标记此图形需要重新渲染
     */
    setDirty(): void {
        this._isDirty = true;
    }

    /**
     * Clear the dirty flag
     * 清除脏标记
     */
    clearDirty(): void {
        this._isDirty = false;
    }

    /**
     * Get the packed color with alpha (0xAARRGGBB)
     * 获取带透明度的打包颜色 (0xAARRGGBB)
     */
    getPackedColor(): number {
        const a = Math.round(this.alpha * 255) & 0xFF;
        return (a << 24) | (this.color & 0xFFFFFF);
    }
}
