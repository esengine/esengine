/**
 * UI Image Component - Displays textures/sprites
 * UI 图像组件 - 显示纹理/精灵
 *
 * Extends UIGraphicComponent to add texture display capabilities.
 * Supports multiple image types: simple, sliced (9-patch), tiled, filled.
 *
 * 扩展 UIGraphicComponent 添加纹理显示功能。
 * 支持多种图像类型：简单、切片（九宫格）、平铺、填充。
 */

import { ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';
import { UIGraphicComponent } from './UIGraphicComponent';
import { UIDirtyFlags } from '../../utils/UIDirtyFlags';

/**
 * Image display type
 * 图像显示类型
 */
export type UIImageType = 'simple' | 'sliced' | 'tiled' | 'filled';

/**
 * Fill method for filled images
 * 填充图像的填充方法
 */
export type UIFillMethod = 'horizontal' | 'vertical' | 'radial90' | 'radial180' | 'radial360';

/**
 * Fill origin for horizontal/vertical fill
 * 水平/垂直填充的填充起点
 */
export type UIFillOrigin = 'left' | 'right' | 'top' | 'bottom' | 'center';

/**
 * UI Image Component
 * UI 图像组件
 *
 * @example
 * ```typescript
 * // Simple image
 * const image = entity.addComponent(UIImageComponent);
 * image.textureGuid = 'asset-guid-here';  // marks dirty automatically
 *
 * // 9-slice image for buttons/panels
 * image.imageType = 'sliced';
 * image.sliceBorder = [10, 10, 10, 10]; // top, right, bottom, left
 *
 * // Progress bar fill
 * image.imageType = 'filled';
 * image.fillMethod = 'horizontal';
 * image.fillAmount = 0.75; // 75% filled
 * ```
 */
@ECSComponent('UIImage')
@Serializable({ version: 1, typeId: 'UIImage' })
export class UIImageComponent extends UIGraphicComponent {
    // ===== Private backing fields =====
    private _textureGuid?: string;
    private _textureId?: number;
    private _imageType: UIImageType = 'simple';
    private _sliceBorder: [number, number, number, number] = [0, 0, 0, 0];
    private _preserveAspect: boolean = false;
    private _fillMethod: UIFillMethod = 'horizontal';
    private _fillOrigin: UIFillOrigin = 'left';
    private _fillAmount: number = 1;
    private _fillClockwise: boolean = true;
    private _textureWidth: number = 0;
    private _textureHeight: number = 0;

    /**
     * Texture GUID from asset system
     * 来自资产系统的纹理 GUID
     */
    @Serialize()
    @Property({ type: 'asset', assetType: 'texture', label: 'Texture / 纹理' })
    get textureGuid(): string | undefined {
        return this._textureGuid;
    }
    set textureGuid(value: string | undefined) {
        if (this._textureGuid !== value) {
            this._textureGuid = value;
            this.markDirty(UIDirtyFlags.Visual);
        }
    }

    /**
     * Direct texture ID (for generated textures)
     * 直接纹理 ID（用于生成的纹理）
     */
    get textureId(): number | undefined {
        return this._textureId;
    }
    set textureId(value: number | undefined) {
        if (this._textureId !== value) {
            this._textureId = value;
            this.markDirty(UIDirtyFlags.Visual);
        }
    }

    /**
     * Image display type
     * 图像显示类型
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Image Type / 图像类型',
        options: ['simple', 'sliced', 'tiled', 'filled']
    })
    get imageType(): UIImageType {
        return this._imageType;
    }
    set imageType(value: UIImageType) {
        if (this._imageType !== value) {
            this._imageType = value;
            this.markDirty(UIDirtyFlags.Visual);
        }
    }

    /**
     * Border for sliced (9-patch) images [top, right, bottom, left]
     * 切片（九宫格）图像的边框 [上, 右, 下, 左]
     */
    @Serialize()
    @Property({ type: 'vector4', label: 'Slice Border / 九宫格边距' })
    get sliceBorder(): [number, number, number, number] {
        return this._sliceBorder;
    }
    set sliceBorder(value: [number, number, number, number]) {
        if (this._sliceBorder[0] !== value[0] ||
            this._sliceBorder[1] !== value[1] ||
            this._sliceBorder[2] !== value[2] ||
            this._sliceBorder[3] !== value[3]) {
            this._sliceBorder = [...value] as [number, number, number, number];
            this.markDirty(UIDirtyFlags.Visual);
        }
    }

    /**
     * Whether to preserve aspect ratio
     * 是否保持纵横比
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Preserve Aspect / 保持比例' })
    get preserveAspect(): boolean {
        return this._preserveAspect;
    }
    set preserveAspect(value: boolean) {
        if (this._preserveAspect !== value) {
            this._preserveAspect = value;
            this.markDirty(UIDirtyFlags.Layout);
        }
    }

    // ===== Fill mode properties (imageType = 'filled') =====

    /**
     * Fill method for filled images
     * 填充图像的填充方法
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Fill Method / 填充方法',
        options: ['horizontal', 'vertical', 'radial90', 'radial180', 'radial360']
    })
    get fillMethod(): UIFillMethod {
        return this._fillMethod;
    }
    set fillMethod(value: UIFillMethod) {
        if (this._fillMethod !== value) {
            this._fillMethod = value;
            this.markDirty(UIDirtyFlags.Visual);
        }
    }

    /**
     * Fill origin
     * 填充起点
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Fill Origin / 填充起点',
        options: ['left', 'right', 'top', 'bottom', 'center']
    })
    get fillOrigin(): UIFillOrigin {
        return this._fillOrigin;
    }
    set fillOrigin(value: UIFillOrigin) {
        if (this._fillOrigin !== value) {
            this._fillOrigin = value;
            this.markDirty(UIDirtyFlags.Visual);
        }
    }

    /**
     * Fill amount (0-1)
     * 填充量 (0-1)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Fill Amount / 填充量', min: 0, max: 1, step: 0.01 })
    get fillAmount(): number {
        return this._fillAmount;
    }
    set fillAmount(value: number) {
        if (this._fillAmount !== value) {
            this._fillAmount = value;
            this.markDirty(UIDirtyFlags.Visual);
        }
    }

    /**
     * Whether fill is clockwise (for radial fill)
     * 填充是否顺时针（用于径向填充）
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Clockwise / 顺时针' })
    get fillClockwise(): boolean {
        return this._fillClockwise;
    }
    set fillClockwise(value: boolean) {
        if (this._fillClockwise !== value) {
            this._fillClockwise = value;
            this.markDirty(UIDirtyFlags.Visual);
        }
    }

    // ===== UV mapping =====

    /**
     * Custom UV coordinates [u0, v0, u1, v1]
     * 自定义 UV 坐标 [u0, v0, u1, v1]
     */
    uv?: [number, number, number, number];

    /**
     * Source texture width (for 9-patch calculations)
     * 源纹理宽度（用于九宫格计算）
     */
    get textureWidth(): number {
        return this._textureWidth;
    }
    set textureWidth(value: number) {
        if (this._textureWidth !== value) {
            this._textureWidth = value;
            this.markDirty(UIDirtyFlags.Visual);
        }
    }

    /**
     * Source texture height (for 9-patch calculations)
     * 源纹理高度（用于九宫格计算）
     */
    get textureHeight(): number {
        return this._textureHeight;
    }
    set textureHeight(value: number) {
        if (this._textureHeight !== value) {
            this._textureHeight = value;
            this.markDirty(UIDirtyFlags.Visual);
        }
    }

    /**
     * Check if this image uses sliced (9-patch) rendering
     * 检查此图像是否使用切片（九宫格）渲染
     */
    isSliced(): boolean {
        return this._imageType === 'sliced' &&
            this._textureWidth > 0 &&
            this._textureHeight > 0 &&
            this._sliceBorder.some(v => v > 0);
    }

    /**
     * Check if this image uses filled rendering
     * 检查此图像是否使用填充渲染
     */
    isFilled(): boolean {
        return this._imageType === 'filled';
    }

    /**
     * Check if this image has a valid texture
     * 检查此图像是否有有效的纹理
     */
    hasTexture(): boolean {
        return !!(this._textureGuid || this._textureId);
    }
}
