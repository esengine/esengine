/**
 * UI Canvas Component
 * UI 画布组件
 *
 * Defines a UI Canvas root that groups UI elements for rendering.
 * All child UI elements inherit the Canvas's rendering settings.
 * 定义一个 UI 画布根节点，用于分组渲染 UI 元素。
 * 所有子 UI 元素继承画布的渲染设置。
 */

import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';

/**
 * Canvas render mode
 * 画布渲染模式
 */
export enum UICanvasRenderMode {
    /**
     * Screen Space - Overlay: UI renders on top of everything
     * 屏幕空间 - 覆盖：UI 渲染在所有内容之上
     */
    ScreenSpaceOverlay = 'screen-space-overlay',

    /**
     * Screen Space - Camera: UI rendered by a specific camera
     * 屏幕空间 - 相机：UI 由特定相机渲染
     */
    ScreenSpaceCamera = 'screen-space-camera',

    /**
     * World Space: UI exists in 3D/2D world space
     * 世界空间：UI 存在于 3D/2D 世界空间中
     */
    WorldSpace = 'world-space'
}

/**
 * UI Canvas Component
 * UI 画布组件
 *
 * A Canvas groups UI elements and defines rendering properties.
 * UI elements look up their nearest ancestor Canvas to determine render settings.
 * 画布将 UI 元素分组并定义渲染属性。
 * UI 元素查找最近的祖先画布来确定渲染设置。
 *
 * @example
 * ```typescript
 * // Create a Canvas root
 * const canvasEntity = scene.createEntity('UICanvas');
 * canvasEntity.addComponent(new UICanvasComponent());
 * canvasEntity.addComponent(new UITransformComponent());
 *
 * // Create child UI element - inherits Canvas settings
 * const button = scene.createEntity('Button');
 * button.addComponent(new UITransformComponent());
 * button.addComponent(new UIButtonComponent());
 * button.getComponent(UITransformComponent).setParent(canvasEntity);
 * ```
 */
@ECSComponent('UICanvas')
@Serializable({ version: 1, typeId: 'UICanvas' })
export class UICanvasComponent extends Component {
    // ===== Render Mode | 渲染模式 =====

    /**
     * Canvas render mode
     * 画布渲染模式
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Render Mode',
        options: [
            { value: 'screen-space-overlay', label: 'Screen Space - Overlay' },
            { value: 'screen-space-camera', label: 'Screen Space - Camera' },
            { value: 'world-space', label: 'World Space' }
        ]
    })
    public renderMode: UICanvasRenderMode = UICanvasRenderMode.ScreenSpaceOverlay;

    // ===== Sorting | 排序 =====

    /**
     * Sorting layer name
     * 排序层名称
     */
    @Serialize()
    @Property({ type: 'string', label: 'Sorting Layer' })
    public sortingLayerName: string = 'UI';

    /**
     * Base order in layer (children add their own orderInLayer to this)
     * 层内基础顺序（子元素在此基础上添加自己的 orderInLayer）
     */
    @Serialize()
    @Property({ type: 'number', label: 'Sort Order' })
    public sortOrder: number = 0;

    // ===== Pixel Perfect | 像素完美 =====

    /**
     * Enable pixel-perfect rendering (snaps to integer pixels)
     * 启用像素完美渲染（对齐到整数像素）
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Pixel Perfect' })
    public pixelPerfect: boolean = false;

    // ===== Clipping | 裁剪 =====

    /**
     * Enable clipping to Canvas bounds
     * 启用画布边界裁剪
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Enable Clipping' })
    public enableClipping: boolean = false;

    // ===== Runtime State | 运行时状态 =====

    /**
     * Cached Canvas ID (for quick lookup)
     * 缓存的画布 ID（用于快速查找）
     */
    public canvasId: number = 0;

    /**
     * Flag indicating Canvas settings changed
     * 标记画布设置已更改
     */
    public dirty: boolean = true;

    /**
     * Set render mode
     * 设置渲染模式
     */
    public setRenderMode(mode: UICanvasRenderMode): this {
        if (this.renderMode !== mode) {
            this.renderMode = mode;
            this.dirty = true;
        }
        return this;
    }

    /**
     * Set sorting layer
     * 设置排序层
     */
    public setSortingLayer(layerName: string, order?: number): this {
        if (this.sortingLayerName !== layerName) {
            this.sortingLayerName = layerName;
            this.dirty = true;
        }
        if (order !== undefined && this.sortOrder !== order) {
            this.sortOrder = order;
            this.dirty = true;
        }
        return this;
    }

    /**
     * Set pixel perfect mode
     * 设置像素完美模式
     */
    public setPixelPerfect(enabled: boolean): this {
        if (this.pixelPerfect !== enabled) {
            this.pixelPerfect = enabled;
            this.dirty = true;
        }
        return this;
    }

    /**
     * Set clipping enabled
     * 设置裁剪启用
     */
    public setClipping(enabled: boolean): this {
        if (this.enableClipping !== enabled) {
            this.enableClipping = enabled;
            this.dirty = true;
        }
        return this;
    }

    /**
     * Check if this Canvas uses screen space rendering
     * 检查此画布是否使用屏幕空间渲染
     */
    public isScreenSpace(): boolean {
        return this.renderMode === UICanvasRenderMode.ScreenSpaceOverlay ||
               this.renderMode === UICanvasRenderMode.ScreenSpaceCamera;
    }

    /**
     * Check if this Canvas uses world space rendering
     * 检查此画布是否使用世界空间渲染
     */
    public isWorldSpace(): boolean {
        return this.renderMode === UICanvasRenderMode.WorldSpace;
    }
}
