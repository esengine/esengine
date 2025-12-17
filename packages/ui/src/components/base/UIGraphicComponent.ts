/**
 * UI Graphic Component - Base for all visual UI elements
 * UI 图形组件 - 所有可视 UI 元素的基类
 *
 * This is the foundation for any UI element that can be rendered.
 * 这是所有可渲染 UI 元素的基础。
 */

import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';
import { UIDirtyFlags, type IDirtyTrackable, markFrameDirty } from '../../utils/UIDirtyFlags';

/**
 * UI Graphic Component
 * UI 图形组件
 *
 * Base component for all visual UI elements. Provides:
 * - Color tinting
 * - Raycast target flag (for input detection)
 * - Material reference
 * - Dirty tracking for render optimization
 *
 * 所有可视 UI 元素的基础组件。提供：
 * - 颜色着色
 * - 射线检测目标标志（用于输入检测）
 * - 材质引用
 * - 渲染优化的脏追踪
 *
 * @example
 * ```typescript
 * const graphic = entity.addComponent(UIGraphicComponent);
 * graphic.color = 0xFF0000; // Red tint (marks dirty automatically)
 * graphic.raycastTarget = true;
 * ```
 */
@ECSComponent('UIGraphic')
@Serializable({ version: 1, typeId: 'UIGraphic' })
export class UIGraphicComponent extends Component implements IDirtyTrackable {
    // ===== Private backing fields =====
    private _color: number = 0xFFFFFF;
    private _alpha: number = 1;
    private _raycastTarget: boolean = true;
    private _materialId: number = 0;

    /**
     * Dirty flags for change tracking
     * 变更追踪的脏标记
     */
    _dirtyFlags: UIDirtyFlags = UIDirtyFlags.Visual;

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
    get color(): number {
        return this._color;
    }
    set color(value: number) {
        if (this._color !== value) {
            this._color = value;
            this.markDirty(UIDirtyFlags.Visual);
        }
    }

    /**
     * Alpha transparency (0-1)
     * 透明度 (0-1)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Alpha / 透明度', min: 0, max: 1, step: 0.1 })
    get alpha(): number {
        return this._alpha;
    }
    set alpha(value: number) {
        if (this._alpha !== value) {
            this._alpha = value;
            this.markDirty(UIDirtyFlags.Visual);
        }
    }

    /**
     * Whether this graphic should be considered for raycasting (input detection)
     * 此图形是否应参与射线检测（输入检测）
     *
     * Set to false for decorative elements that shouldn't block input.
     * 对于不应阻挡输入的装饰性元素，设置为 false。
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Raycast Target / 射线目标' })
    get raycastTarget(): boolean {
        return this._raycastTarget;
    }
    set raycastTarget(value: boolean) {
        this._raycastTarget = value;
    }

    /**
     * Material ID for custom rendering
     * 自定义渲染的材质 ID
     *
     * 0 = default UI material
     * 0 = 默认 UI 材质
     */
    @Serialize()
    @Property({ type: 'number', label: 'Material ID / 材质 ID' })
    get materialId(): number {
        return this._materialId;
    }
    set materialId(value: number) {
        if (this._materialId !== value) {
            this._materialId = value;
            this.markDirty(UIDirtyFlags.Material);
        }
    }

    // ===== IDirtyTrackable implementation =====

    /**
     * Check if component has any dirty flags
     * 检查组件是否有任何脏标记
     */
    isDirty(): boolean {
        return this._dirtyFlags !== UIDirtyFlags.None;
    }

    /**
     * Check if specific dirty flags are set
     * 检查是否设置了特定的脏标记
     */
    hasDirtyFlag(flags: UIDirtyFlags): boolean {
        return (this._dirtyFlags & flags) !== 0;
    }

    /**
     * Mark component as dirty with specific flags
     * 使用特定标记将组件标记为脏
     */
    markDirty(flags: UIDirtyFlags): void {
        this._dirtyFlags |= flags;
        markFrameDirty();
    }

    /**
     * Clear all dirty flags
     * 清除所有脏标记
     */
    clearDirtyFlags(): void {
        this._dirtyFlags = UIDirtyFlags.None;
    }

    /**
     * Clear specific dirty flags
     * 清除特定的脏标记
     */
    clearDirtyFlag(flags: UIDirtyFlags): void {
        this._dirtyFlags &= ~flags;
    }

    // ===== Legacy compatibility =====

    /**
     * Internal dirty flag - set when visual properties change
     * 内部脏标记 - 当视觉属性改变时设置
     * @deprecated Use isDirty() instead | 请使用 isDirty() 代替
     */
    get _isDirty(): boolean {
        return this.isDirty();
    }
    set _isDirty(value: boolean) {
        if (value) {
            this.markDirty(UIDirtyFlags.Visual);
        } else {
            this.clearDirtyFlags();
        }
    }

    /**
     * Mark this graphic as needing re-render
     * 标记此图形需要重新渲染
     * @deprecated Use markDirty(UIDirtyFlags.Visual) instead | 请使用 markDirty(UIDirtyFlags.Visual) 代替
     */
    setDirty(): void {
        this.markDirty(UIDirtyFlags.Visual);
    }

    /**
     * Clear the dirty flag
     * 清除脏标记
     * @deprecated Use clearDirtyFlags() instead | 请使用 clearDirtyFlags() 代替
     */
    clearDirty(): void {
        this.clearDirtyFlags();
    }

    /**
     * Get the packed color with alpha (0xAARRGGBB)
     * 获取带透明度的打包颜色 (0xAARRGGBB)
     */
    getPackedColor(): number {
        const a = Math.round(this._alpha * 255) & 0xFF;
        return (a << 24) | (this._color & 0xFFFFFF);
    }
}
