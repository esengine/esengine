import { DisplayObject } from './DisplayObject';
import { EGraphType } from '../core/FieldTypes';
import type { IRenderCollector, IRenderPrimitive } from '../render/IRenderCollector';
import { ERenderPrimitiveType } from '../render/IRenderCollector';

/**
 * Graph
 *
 * Display object for rendering geometric shapes.
 *
 * 用于渲染几何图形的显示对象
 */
export class Graph extends DisplayObject {
    /** Graph type | 图形类型 */
    private _type: EGraphType = EGraphType.Empty;

    /** Line width | 线宽 */
    public lineSize: number = 1;

    /** Line color | 线颜色 */
    public lineColor: string = '#000000';

    /** Fill color | 填充颜色 */
    public fillColor: string = '#FFFFFF';

    /** Corner radius for rect | 矩形圆角半径 */
    public cornerRadius: number[] | null = null;

    /** Polygon points | 多边形顶点 */
    public polygonPoints: number[] | null = null;

    /** Number of sides for regular polygon | 正多边形边数 */
    public sides: number = 3;

    /** Start angle for regular polygon | 正多边形起始角度 */
    public startAngle: number = 0;

    /** Distance multipliers for regular polygon | 正多边形距离乘数 */
    public distances: number[] | null = null;

    constructor() {
        super();
    }

    /**
     * Get graph type
     * 获取图形类型
     */
    public get type(): EGraphType {
        return this._type;
    }

    /**
     * Draw rectangle
     * 绘制矩形
     */
    public drawRect(lineSize: number, lineColor: string, fillColor: string, cornerRadius?: number[]): void {
        this._type = EGraphType.Rect;
        this.lineSize = lineSize;
        this.lineColor = lineColor;
        this.fillColor = fillColor;
        this.cornerRadius = cornerRadius || null;
    }

    /**
     * Draw ellipse
     * 绘制椭圆
     */
    public drawEllipse(lineSize: number, lineColor: string, fillColor: string): void {
        this._type = EGraphType.Ellipse;
        this.lineSize = lineSize;
        this.lineColor = lineColor;
        this.fillColor = fillColor;
    }

    /**
     * Draw polygon
     * 绘制多边形
     */
    public drawPolygon(lineSize: number, lineColor: string, fillColor: string, points: number[]): void {
        this._type = EGraphType.Polygon;
        this.lineSize = lineSize;
        this.lineColor = lineColor;
        this.fillColor = fillColor;
        this.polygonPoints = points;
    }

    /**
     * Draw regular polygon
     * 绘制正多边形
     */
    public drawRegularPolygon(
        lineSize: number,
        lineColor: string,
        fillColor: string,
        sides: number,
        startAngle?: number,
        distances?: number[]
    ): void {
        this._type = EGraphType.RegularPolygon;
        this.lineSize = lineSize;
        this.lineColor = lineColor;
        this.fillColor = fillColor;
        this.sides = sides;
        this.startAngle = startAngle || 0;
        this.distances = distances || null;
    }

    /**
     * Clear graph
     * 清除图形
     */
    public clear(): void {
        this._type = EGraphType.Empty;
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
        if (!this._visible || this._alpha <= 0 || this._type === EGraphType.Empty) return;

        this.updateTransform();

        const fillColorNum = this.parseColor(this.fillColor);

        const primitive: IRenderPrimitive = {
            type: ERenderPrimitiveType.Graph,
            sortOrder: 0,
            worldMatrix: this._worldMatrix,
            width: this._width,
            height: this._height,
            alpha: this._worldAlpha,
            grayed: this._grayed,
            graphType: this._type,
            lineSize: this.lineSize,
            lineColor: this.parseColor(this.lineColor),
            fillColor: fillColorNum,
            clipRect: collector.getCurrentClipRect() || undefined
        };

        if (this.cornerRadius) {
            primitive.cornerRadius = this.cornerRadius;
        }

        if (this._type === EGraphType.Polygon && this.polygonPoints) {
            primitive.polygonPoints = this.polygonPoints;
        }

        if (this._type === EGraphType.RegularPolygon) {
            primitive.sides = this.sides;
            primitive.startAngle = this.startAngle;
            if (this.distances) {
                primitive.distances = this.distances;
            }
        }

        collector.addPrimitive(primitive);
    }
}
