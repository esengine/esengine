import { DisplayObject } from './DisplayObject';
import { Rectangle } from '../utils/MathTypes';
import { EFillMethod, EFillOrigin } from '../core/FieldTypes';
import type { IRenderCollector, IRenderPrimitive } from '../render/IRenderCollector';
import { ERenderPrimitiveType } from '../render/IRenderCollector';

/**
 * Image
 *
 * Display object for rendering images/textures.
 *
 * 用于渲染图像/纹理的显示对象
 */
export class Image extends DisplayObject {
    /** Texture ID or key | 纹理 ID 或键 */
    public texture: string | number | null = null;

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
     * Parse color string to number
     * 解析颜色字符串为数字
     */
    private parseColor(color: string): number {
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            if (hex.length === 6) {
                return parseInt(hex, 16) | 0xFF000000;
            } else if (hex.length === 8) {
                // RRGGBBAA -> AARRGGBB
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                const a = parseInt(hex.slice(6, 8), 16);
                return (a << 24) | (r << 16) | (g << 8) | b;
            }
        }
        return 0xFFFFFFFF;
    }

    public collectRenderData(collector: IRenderCollector): void {
        if (!this._visible || this._alpha <= 0 || !this.texture) return;

        this.updateTransform();

        const primitive: IRenderPrimitive = {
            type: ERenderPrimitiveType.Image,
            sortOrder: 0,
            worldMatrix: this._worldMatrix,
            width: this._width,
            height: this._height,
            alpha: this._worldAlpha,
            grayed: this._grayed,
            textureId: this.texture,
            color: this.parseColor(this.color),
            clipRect: collector.getCurrentClipRect() || undefined
        };

        if (this.scale9Grid) {
            primitive.scale9Grid = this.scale9Grid;
        }

        if (this.scaleByTile) {
            primitive.tileMode = true;
        }

        collector.addPrimitive(primitive);
    }
}
