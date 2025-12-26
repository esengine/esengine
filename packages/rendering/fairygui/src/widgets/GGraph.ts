import { GObject } from '../core/GObject';
import { Graph } from '../display/Graph';
import { EGraphType, EObjectPropID } from '../core/FieldTypes';
import type { ByteBuffer } from '../utils/ByteBuffer';

/**
 * GGraph - FairyGUI 图形显示对象
 *
 * Supports rect, ellipse, polygon, and regular polygon shapes.
 * 支持矩形、椭圆、多边形和正多边形
 */
export class GGraph extends GObject {
    private _graph!: Graph;
    private _type: EGraphType = EGraphType.Empty;
    private _lineSize: number = 1;
    private _lineColor: string = '#000000';
    private _fillColor: string = '#FFFFFF';
    private _cornerRadius: number[] | null = null;
    private _sides: number = 3;
    private _startAngle: number = 0;
    private _polygonPoints: number[] | null = null;
    private _distances: number[] | null = null;

    constructor() {
        super();
        this.ensureGraph();
    }

    private ensureGraph(): void {
        if (!this._graph) {
            this.createDisplayObject();
        }
    }

    protected createDisplayObject(): void {
        this._displayObject = this._graph = new Graph();
        this._graph.touchable = false;
        this._displayObject.gOwner = this;
    }

    public get type(): EGraphType {
        return this._type;
    }

    public get polygonPoints(): number[] | null {
        return this._polygonPoints;
    }

    public get fillColor(): string {
        return this._fillColor;
    }

    public set fillColor(value: string) {
        if (value === this._fillColor) return;
        this._fillColor = value;
        this.updateGraph();
    }

    public get lineColor(): string {
        return this._lineColor;
    }

    public set lineColor(value: string) {
        if (value === this._lineColor) return;
        this._lineColor = value;
        this.updateGraph();
    }

    public get color(): string {
        return this._fillColor;
    }

    public set color(value: string) {
        this._fillColor = value;
        this.updateGear(4);
        if (this._type !== EGraphType.Empty) {
            this.updateGraph();
        }
    }

    public get distances(): number[] | null {
        return this._distances;
    }

    public set distances(value: number[] | null) {
        this._distances = value;
        if (this._type === EGraphType.RegularPolygon) {
            this.updateGraph();
        }
    }

    public drawRect(
        lineSize: number,
        lineColor: string,
        fillColor: string,
        cornerRadius?: number[]
    ): void {
        this._type = EGraphType.Rect;
        this._lineSize = lineSize;
        this._lineColor = lineColor;
        this._fillColor = fillColor;
        this._cornerRadius = cornerRadius || null;
        this.updateGraph();
    }

    public drawEllipse(lineSize: number, lineColor: string, fillColor: string): void {
        this._type = EGraphType.Ellipse;
        this._lineSize = lineSize;
        this._lineColor = lineColor;
        this._fillColor = fillColor;
        this.updateGraph();
    }

    public drawRegularPolygon(
        lineSize: number,
        lineColor: string,
        fillColor: string,
        sides: number,
        startAngle?: number,
        distances?: number[]
    ): void {
        this._type = EGraphType.RegularPolygon;
        this._lineSize = lineSize;
        this._lineColor = lineColor;
        this._fillColor = fillColor;
        this._sides = sides;
        this._startAngle = startAngle || 0;
        this._distances = distances || null;
        this.updateGraph();
    }

    public drawPolygon(
        lineSize: number,
        lineColor: string,
        fillColor: string,
        points: number[]
    ): void {
        this._type = EGraphType.Polygon;
        this._lineSize = lineSize;
        this._lineColor = lineColor;
        this._fillColor = fillColor;
        this._polygonPoints = points;
        this.updateGraph();
    }

    private updateGraph(): void {
        this.ensureGraph();
        if (!this._graph) return;

        this._graph.touchable = this.touchable;

        const w = this.width;
        const h = this.height;
        if (w === 0 || h === 0) {
            this._graph.clear();
            return;
        }

        switch (this._type) {
            case EGraphType.Rect:
                this._graph.drawRect(
                    this._lineSize,
                    this._lineColor,
                    this._fillColor,
                    this._cornerRadius || undefined
                );
                break;
            case EGraphType.Ellipse:
                this._graph.drawEllipse(this._lineSize, this._lineColor, this._fillColor);
                break;
            case EGraphType.Polygon:
                if (this._polygonPoints) {
                    this._graph.drawPolygon(
                        this._lineSize,
                        this._lineColor,
                        this._fillColor,
                        this._polygonPoints
                    );
                }
                break;
            case EGraphType.RegularPolygon:
                this.generateRegularPolygonPoints();
                if (this._polygonPoints) {
                    this._graph.drawPolygon(
                        this._lineSize,
                        this._lineColor,
                        this._fillColor,
                        this._polygonPoints
                    );
                }
                break;
            default:
                this._graph.clear();
                break;
        }

        this._graph.width = w;
        this._graph.height = h;
    }

    private generateRegularPolygonPoints(): void {
        const radius = Math.min(this._width, this._height) / 2;
        this._polygonPoints = [];
        const angle = (this._startAngle * Math.PI) / 180;
        const deltaAngle = (2 * Math.PI) / this._sides;

        for (let i = 0; i < this._sides; i++) {
            let dist = 1;
            if (this._distances && this._distances[i] !== undefined) {
                dist = this._distances[i];
                if (isNaN(dist)) dist = 1;
            }

            const xv = radius + radius * dist * Math.cos(angle + deltaAngle * i);
            const yv = radius + radius * dist * Math.sin(angle + deltaAngle * i);
            this._polygonPoints.push(xv, yv);
        }
    }

    public replaceMe(target: GObject): void {
        if (!this._parent) {
            throw new Error('parent not set');
        }

        target.name = this.name;
        target.alpha = this.alpha;
        target.rotation = this.rotation;
        target.visible = this.visible;
        target.touchable = this.touchable;
        target.grayed = this.grayed;
        target.setXY(this.x, this.y);
        target.setSize(this.width, this.height);

        const index = this._parent.getChildIndex(this);
        this._parent.addChildAt(target, index);
        target.relations.copyFrom(this.relations);

        this._parent.removeChild(this, true);
    }

    public addBeforeMe(target: GObject): void {
        if (!this._parent) {
            throw new Error('parent not set');
        }

        const index = this._parent.getChildIndex(this);
        this._parent.addChildAt(target, index);
    }

    /**
     * Add target after this object
     * 在此对象后添加目标
     */
    public addAfterMe(target: GObject): void {
        if (!this._parent) {
            throw new Error('parent not set');
        }

        const index = this._parent.getChildIndex(this);
        this._parent.addChildAt(target, index + 1);
    }

    public getProp(index: number): any {
        if (index === EObjectPropID.Color) {
            return this.color;
        }
        return super.getProp(index);
    }

    public setProp(index: number, value: any): void {
        if (index === EObjectPropID.Color) {
            this.color = value;
        } else {
            super.setProp(index, value);
        }
    }

    protected handleSizeChanged(): void {
        super.handleSizeChanged();

        if (this._type !== EGraphType.Empty) {
            this.updateGraph();
        }
    }

    public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_beforeAdd(buffer, beginPos);

        buffer.seek(beginPos, 5);

        this._type = buffer.readByte();
        if (this._type !== EGraphType.Empty) {
            this._lineSize = buffer.getInt32();
            this._lineColor = buffer.readColorS(true);
            this._fillColor = buffer.readColorS(true);
            if (buffer.readBool()) {
                this._cornerRadius = [];
                for (let i = 0; i < 4; i++) {
                    this._cornerRadius[i] = buffer.getFloat32();
                }
            }

            if (this._type === EGraphType.Polygon) {
                const cnt = buffer.getInt16();
                this._polygonPoints = [];
                for (let i = 0; i < cnt; i++) {
                    this._polygonPoints[i] = buffer.getFloat32();
                }
            } else if (this._type === EGraphType.RegularPolygon) {
                this._sides = buffer.getInt16();
                this._startAngle = buffer.getFloat32();
                const cnt = buffer.getInt16();
                if (cnt > 0) {
                    this._distances = [];
                    for (let i = 0; i < cnt; i++) {
                        this._distances[i] = buffer.getFloat32();
                    }
                }
            }
        }
    }

    public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_afterAdd(buffer, beginPos);

        if (this._type !== EGraphType.Empty) {
            this.updateGraph();
        }
    }
}
