import { DisplayObject } from './DisplayObject';
import { Rectangle } from '../utils/MathTypes';
import { EFillMethod, EFillOrigin } from '../core/FieldTypes';
import type { IRenderCollector, IRenderPrimitive } from '../render/IRenderCollector';
import { ERenderPrimitiveType } from '../render/IRenderCollector';

/**
 * Sprite texture info from FairyGUI package
 * FairyGUI 包中的精灵纹理信息
 */
export interface ISpriteTexture {
    atlas: string;
    atlasId: string;
    rect: { x: number; y: number; width: number; height: number };
    offset: { x: number; y: number };
    originalSize: { x: number; y: number };
    rotated: boolean;
    /** Atlas width for UV calculation | 图集宽度，用于 UV 计算 */
    atlasWidth: number;
    /** Atlas height for UV calculation | 图集高度，用于 UV 计算 */
    atlasHeight: number;
}

/**
 * Image
 *
 * Display object for rendering images/textures.
 *
 * 用于渲染图像/纹理的显示对象
 */
export class Image extends DisplayObject {
    /** Texture ID, key, or sprite info | 纹理 ID、键或精灵信息 */
    public texture: string | number | ISpriteTexture | null = null;

    /** Tint color (hex string like "#FFFFFF") | 着色颜色 */
    public color: string = '#FFFFFF';

    /** Scale9 grid for 9-slice scaling | 九宫格缩放 */
    public scale9Grid: Rectangle | null = null;

    /** Scale by tile | 平铺缩放 */
    public scaleByTile: boolean = false;

    /** Tile grid indice | 平铺网格索引 */
    public tileGridIndice: number = 0;

    // Fill properties | 填充属性
    private _fillMethod: EFillMethod = EFillMethod.None;
    private _fillOrigin: EFillOrigin = EFillOrigin.Top;
    private _fillClockwise: boolean = true;
    private _fillAmount: number = 1;

    constructor() {
        super();
    }

    public get fillMethod(): EFillMethod {
        return this._fillMethod;
    }

    public set fillMethod(value: EFillMethod) {
        this._fillMethod = value;
    }

    public get fillOrigin(): EFillOrigin {
        return this._fillOrigin;
    }

    public set fillOrigin(value: EFillOrigin) {
        this._fillOrigin = value;
    }

    public get fillClockwise(): boolean {
        return this._fillClockwise;
    }

    public set fillClockwise(value: boolean) {
        this._fillClockwise = value;
    }

    public get fillAmount(): number {
        return this._fillAmount;
    }

    public set fillAmount(value: number) {
        this._fillAmount = Math.max(0, Math.min(1, value));
    }

    /**
     * Parse color string to packed u32 (0xRRGGBBAA format)
     * 解析颜色字符串为打包的 u32（0xRRGGBBAA 格式）
     */
    private parseColor(color: string): number {
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            if (hex.length === 6) {
                return ((parseInt(hex, 16) << 8) | 0xFF) >>> 0;
            } else if (hex.length === 8) {
                return parseInt(hex, 16) >>> 0;
            }
        }
        return 0xFFFFFFFF;
    }

    public collectRenderData(collector: IRenderCollector): void {
        if (!this._visible || this._alpha <= 0 || !this.texture) return;

        this.updateTransform();

        // Determine texture ID, UV rect, and draw rect based on texture type
        let textureId: string | number;
        let uvRect: [number, number, number, number] | undefined;
        let drawWidth = this._width;
        let drawHeight = this._height;
        let drawOffsetX = 0;
        let drawOffsetY = 0;

        if (typeof this.texture === 'object') {
            // ISpriteTexture - use atlas file as texture ID
            const sprite = this.texture as ISpriteTexture;
            textureId = sprite.atlas;

            // Calculate normalized UV from sprite rect and atlas dimensions
            const atlasW = sprite.atlasWidth || 1;
            const atlasH = sprite.atlasHeight || 1;
            const u0 = sprite.rect.x / atlasW;
            const v0 = sprite.rect.y / atlasH;
            const u1 = (sprite.rect.x + sprite.rect.width) / atlasW;
            const v1 = (sprite.rect.y + sprite.rect.height) / atlasH;
            uvRect = [u0, v0, u1, v1];

            // Handle trimmed sprites (offset and originalSize)
            // 处理裁剪过的精灵（偏移和原始尺寸）
            const origW = sprite.originalSize.x;
            const origH = sprite.originalSize.y;
            const regionW = sprite.rect.width;
            const regionH = sprite.rect.height;

            if (origW !== regionW || origH !== regionH) {
                // Sprite was trimmed, calculate actual draw rect
                // 精灵被裁剪过，计算实际绘制矩形
                const sx = this._width / origW;
                const sy = this._height / origH;
                drawOffsetX = sprite.offset.x * sx;
                drawOffsetY = sprite.offset.y * sy;
                drawWidth = regionW * sx;
                drawHeight = regionH * sy;
            }
        } else {
            textureId = this.texture;
        }

        // Create adjusted world matrix if there's an offset
        let worldMatrix = this._worldMatrix;
        if (drawOffsetX !== 0 || drawOffsetY !== 0) {
            // Apply offset to the world matrix translation
            // 将偏移应用到世界矩阵的平移部分
            worldMatrix = new Float32Array(this._worldMatrix);
            const m = this._worldMatrix;
            // Transform offset by rotation/scale part of matrix
            worldMatrix[4] = m[4] + drawOffsetX * m[0] + drawOffsetY * m[2];
            worldMatrix[5] = m[5] + drawOffsetX * m[1] + drawOffsetY * m[3];
        }

        const primitive: IRenderPrimitive = {
            type: ERenderPrimitiveType.Image,
            sortOrder: 0,
            worldMatrix,
            width: drawWidth,
            height: drawHeight,
            alpha: this._worldAlpha,
            grayed: this._grayed,
            textureId,
            uvRect,
            color: this.parseColor(this.color),
            clipRect: collector.getCurrentClipRect() || undefined
        };

        if (this.scale9Grid) {
            primitive.scale9Grid = this.scale9Grid;
            // Pass source dimensions for nine-slice calculation
            // 传递源尺寸用于九宫格计算
            if (typeof this.texture === 'object') {
                const sprite = this.texture as ISpriteTexture;
                primitive.sourceWidth = sprite.rect.width;
                primitive.sourceHeight = sprite.rect.height;
            } else {
                // For non-sprite textures, use the display object's original size
                // 对于非精灵纹理，使用显示对象的原始尺寸
                primitive.sourceWidth = this._width;
                primitive.sourceHeight = this._height;
            }
        }

        if (this.scaleByTile) {
            primitive.tileMode = true;
        }

        collector.addPrimitive(primitive);
    }
}
