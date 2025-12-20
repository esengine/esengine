import type { IRectangle } from '../utils/MathTypes';
import type { IRenderPrimitive, ETextAlign, ETextVAlign } from './IRenderCollector';
import { ERenderPrimitiveType } from './IRenderCollector';
import type { IRenderBackend, IRenderStats, ITextureHandle, IFontHandle } from './IRenderBackend';

/**
 * Canvas2D texture handle
 * Canvas2D 纹理句柄
 */
class Canvas2DTexture implements ITextureHandle {
    private static _nextId = 1;

    public readonly id: number;
    public readonly width: number;
    public readonly height: number;
    public readonly source: ImageBitmap | HTMLImageElement | HTMLCanvasElement;
    private _valid: boolean = true;

    constructor(source: ImageBitmap | HTMLImageElement | HTMLCanvasElement) {
        this.id = Canvas2DTexture._nextId++;
        this.source = source;
        this.width = source.width;
        this.height = source.height;
    }

    public get isValid(): boolean {
        return this._valid;
    }

    public invalidate(): void {
        this._valid = false;
    }
}

/**
 * Canvas2D font handle
 * Canvas2D 字体句柄
 */
class Canvas2DFont implements IFontHandle {
    public readonly family: string;
    private _loaded: boolean = false;

    constructor(family: string) {
        this.family = family;
    }

    public get isLoaded(): boolean {
        return this._loaded;
    }

    public setLoaded(): void {
        this._loaded = true;
    }
}

/**
 * Canvas2DBackend
 *
 * Canvas 2D rendering backend for FairyGUI.
 * Provides fallback rendering when WebGPU is not available.
 *
 * Canvas 2D 渲染后端
 * 在 WebGPU 不可用时提供回退渲染
 */
export class Canvas2DBackend implements IRenderBackend {
    public readonly name = 'Canvas2D';

    private _canvas: HTMLCanvasElement | null = null;
    private _ctx: CanvasRenderingContext2D | null = null;
    private _width: number = 0;
    private _height: number = 0;
    private _initialized: boolean = false;
    private _textures: Map<number, Canvas2DTexture> = new Map();
    private _clipRect: IRectangle | null = null;
    private _stats: IRenderStats = {
        drawCalls: 0,
        triangles: 0,
        textureSwitches: 0,
        batches: 0,
        frameTime: 0
    };
    private _frameStartTime: number = 0;
    private _lastTextureId: number = -1;

    public get isInitialized(): boolean {
        return this._initialized;
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public async initialize(canvas: HTMLCanvasElement): Promise<boolean> {
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d', {
            alpha: true,
            desynchronized: true
        });

        if (!this._ctx) {
            console.error('Failed to get Canvas 2D context');
            return false;
        }

        this._width = canvas.width;
        this._height = canvas.height;
        this._initialized = true;

        return true;
    }

    public beginFrame(): void {
        if (!this._ctx) return;

        this._frameStartTime = performance.now();
        this._stats.drawCalls = 0;
        this._stats.triangles = 0;
        this._stats.textureSwitches = 0;
        this._stats.batches = 0;
        this._lastTextureId = -1;

        // Clear canvas
        this._ctx.setTransform(1, 0, 0, 1, 0, 0);
        this._ctx.clearRect(0, 0, this._width, this._height);
    }

    public endFrame(): void {
        this._stats.frameTime = performance.now() - this._frameStartTime;
    }

    public submitPrimitives(primitives: readonly IRenderPrimitive[]): void {
        if (!this._ctx || primitives.length === 0) return;

        this._stats.batches++;

        for (const primitive of primitives) {
            this.renderPrimitive(primitive);
        }
    }

    public setClipRect(rect: IRectangle | null): void {
        if (!this._ctx) return;

        this._clipRect = rect;

        this._ctx.restore();
        this._ctx.save();

        if (rect) {
            this._ctx.beginPath();
            this._ctx.rect(rect.x, rect.y, rect.width, rect.height);
            this._ctx.clip();
        }
    }

    public createTexture(
        source: ImageBitmap | HTMLImageElement | HTMLCanvasElement | ImageData
    ): ITextureHandle {
        let textureSource: ImageBitmap | HTMLImageElement | HTMLCanvasElement;

        if (source instanceof ImageData) {
            // Convert ImageData to canvas
            const canvas = document.createElement('canvas');
            canvas.width = source.width;
            canvas.height = source.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.putImageData(source, 0, 0);
            }
            textureSource = canvas;
        } else {
            textureSource = source;
        }

        const texture = new Canvas2DTexture(textureSource);
        this._textures.set(texture.id, texture);
        return texture;
    }

    public destroyTexture(texture: ITextureHandle): void {
        const cached = this._textures.get(texture.id);
        if (cached) {
            cached.invalidate();
            this._textures.delete(texture.id);
        }
    }

    public async loadFont(family: string, url?: string): Promise<IFontHandle> {
        const font = new Canvas2DFont(family);

        if (url) {
            try {
                const fontFace = new FontFace(family, `url(${url})`);
                await fontFace.load();
                // Use type assertion for FontFaceSet.add which exists in browsers
                (document.fonts as unknown as { add(font: FontFace): void }).add(fontFace);
                font.setLoaded();
            } catch (error) {
                console.error(`Failed to load font: ${family}`, error);
            }
        } else {
            // Assume system font is available
            font.setLoaded();
        }

        return font;
    }

    public resize(width: number, height: number): void {
        if (!this._canvas) return;

        this._canvas.width = width;
        this._canvas.height = height;
        this._width = width;
        this._height = height;
    }

    public getStats(): IRenderStats {
        return { ...this._stats };
    }

    public dispose(): void {
        for (const texture of this._textures.values()) {
            texture.invalidate();
        }
        this._textures.clear();
        this._ctx = null;
        this._canvas = null;
        this._initialized = false;
    }

    private renderPrimitive(primitive: IRenderPrimitive): void {
        if (!this._ctx) return;

        const ctx = this._ctx;
        const textureId = typeof primitive.textureId === 'number' ? primitive.textureId : -1;

        // Track texture switches
        if (textureId !== -1 && textureId !== this._lastTextureId) {
            this._stats.textureSwitches++;
            this._lastTextureId = textureId;
        }

        // Apply transform
        ctx.save();
        ctx.globalAlpha = primitive.alpha ?? 1;

        if (primitive.transform) {
            const t = primitive.transform;
            ctx.setTransform(t.a, t.b, t.c, t.d, t.tx, t.ty);
        }

        switch (primitive.type) {
            case ERenderPrimitiveType.Image:
                this.renderImage(primitive);
                break;
            case ERenderPrimitiveType.Text:
                this.renderText(primitive);
                break;
            case ERenderPrimitiveType.Rect:
                this.renderRect(primitive);
                break;
            case ERenderPrimitiveType.Ellipse:
                this.renderEllipse(primitive);
                break;
            case ERenderPrimitiveType.Polygon:
                this.renderPolygon(primitive);
                break;
            case ERenderPrimitiveType.Graph:
                // Handle graph type based on graphType property
                this.renderGraph(primitive);
                break;
        }

        ctx.restore();
        this._stats.drawCalls++;
    }

    private renderImage(primitive: IRenderPrimitive): void {
        if (!this._ctx) return;

        const textureId = typeof primitive.textureId === 'number' ? primitive.textureId : -1;
        if (textureId === -1) return;

        const texture = this._textures.get(textureId);
        if (!texture || !texture.isValid) return;

        const x = primitive.x ?? 0;
        const y = primitive.y ?? 0;
        const width = primitive.width ?? texture.width;
        const height = primitive.height ?? texture.height;
        const srcRect = primitive.srcRect;

        if (srcRect) {
            this._ctx.drawImage(
                texture.source,
                srcRect.x,
                srcRect.y,
                srcRect.width,
                srcRect.height,
                x,
                y,
                width,
                height
            );
        } else {
            this._ctx.drawImage(texture.source, x, y, width, height);
        }

        this._stats.triangles += 2;
    }

    private renderText(primitive: IRenderPrimitive): void {
        if (!this._ctx || !primitive.text) return;

        const ctx = this._ctx;
        const x = primitive.x ?? 0;
        const y = primitive.y ?? 0;
        const text = primitive.text;
        const font = primitive.font ?? 'Arial';
        const fontSize = primitive.fontSize ?? 14;
        const color = primitive.color ?? 0x000000;
        const textAlign = primitive.textAlign ?? primitive.align ?? 'left';
        const textVAlign = primitive.textVAlign ?? primitive.valign ?? 'top';
        const width = primitive.width;
        const height = primitive.height;

        ctx.font = `${fontSize}px ${font}`;
        ctx.fillStyle = this.colorToCSS(color);
        ctx.textBaseline = this.mapVAlign(String(textVAlign));
        ctx.textAlign = this.mapHAlign(String(textAlign));

        let drawX = x;
        let drawY = y;

        if (width !== undefined) {
            if (textAlign === 'center') drawX = x + width / 2;
            else if (textAlign === 'right') drawX = x + width;
        }

        if (height !== undefined) {
            if (textVAlign === 'middle') drawY = y + height / 2;
            else if (textVAlign === 'bottom') drawY = y + height;
        }

        ctx.fillText(text, drawX, drawY);
    }

    private renderRect(primitive: IRenderPrimitive): void {
        if (!this._ctx) return;

        const ctx = this._ctx;
        const x = primitive.x ?? 0;
        const y = primitive.y ?? 0;
        const width = primitive.width ?? 0;
        const height = primitive.height ?? 0;
        const color = primitive.color ?? primitive.fillColor;
        const lineColor = primitive.lineColor ?? primitive.strokeColor;
        const lineWidth = primitive.lineWidth ?? primitive.strokeWidth ?? 1;

        if (color !== undefined) {
            ctx.fillStyle = this.colorToCSS(color);
            ctx.fillRect(x, y, width, height);
        }

        if (lineColor !== undefined) {
            ctx.strokeStyle = this.colorToCSS(lineColor);
            ctx.lineWidth = lineWidth;
            ctx.strokeRect(x, y, width, height);
        }

        this._stats.triangles += 2;
    }

    private renderEllipse(primitive: IRenderPrimitive): void {
        if (!this._ctx) return;

        const ctx = this._ctx;
        const x = primitive.x ?? 0;
        const y = primitive.y ?? 0;
        const width = primitive.width ?? 0;
        const height = primitive.height ?? 0;
        const color = primitive.color ?? primitive.fillColor;
        const lineColor = primitive.lineColor ?? primitive.strokeColor;
        const lineWidth = primitive.lineWidth ?? primitive.strokeWidth ?? 1;

        const cx = x + width / 2;
        const cy = y + height / 2;
        const rx = width / 2;
        const ry = height / 2;

        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

        if (color !== undefined) {
            ctx.fillStyle = this.colorToCSS(color);
            ctx.fill();
        }

        if (lineColor !== undefined) {
            ctx.strokeStyle = this.colorToCSS(lineColor);
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }

        // Approximate triangle count for ellipse
        this._stats.triangles += 32;
    }

    private renderPolygon(primitive: IRenderPrimitive): void {
        const points = primitive.points ?? primitive.polygonPoints;
        if (!this._ctx || !points || points.length < 4) return;

        const ctx = this._ctx;
        const color = primitive.color ?? primitive.fillColor;
        const lineColor = primitive.lineColor ?? primitive.strokeColor;
        const lineWidth = primitive.lineWidth ?? primitive.strokeWidth ?? 1;

        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);

        for (let i = 2; i < points.length; i += 2) {
            ctx.lineTo(points[i], points[i + 1]);
        }

        ctx.closePath();

        if (color !== undefined) {
            ctx.fillStyle = this.colorToCSS(color);
            ctx.fill();
        }

        if (lineColor !== undefined) {
            ctx.strokeStyle = this.colorToCSS(lineColor);
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }

        this._stats.triangles += Math.max(0, points.length / 2 - 2);
    }

    private renderGraph(primitive: IRenderPrimitive): void {
        // Render based on graphType
        const graphType = primitive.graphType;
        if (graphType === undefined) return;

        // For now, delegate to rect/ellipse/polygon based on type
        switch (graphType) {
            case 0: // Rect
                this.renderRect(primitive);
                break;
            case 1: // Ellipse
                this.renderEllipse(primitive);
                break;
            case 2: // Polygon
                this.renderPolygon(primitive);
                break;
            case 3: // Regular Polygon
                this.renderRegularPolygon(primitive);
                break;
        }
    }

    private renderRegularPolygon(primitive: IRenderPrimitive): void {
        if (!this._ctx) return;

        const ctx = this._ctx;
        const x = primitive.x ?? 0;
        const y = primitive.y ?? 0;
        const width = primitive.width ?? 0;
        const height = primitive.height ?? 0;
        const sides = primitive.sides ?? 6;
        const startAngle = (primitive.startAngle ?? 0) * Math.PI / 180;
        const color = primitive.color ?? primitive.fillColor;
        const lineColor = primitive.lineColor ?? primitive.strokeColor;
        const lineWidth = primitive.lineWidth ?? primitive.strokeWidth ?? 1;

        const cx = x + width / 2;
        const cy = y + height / 2;
        const rx = width / 2;
        const ry = height / 2;

        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = startAngle + (i * 2 * Math.PI) / sides;
            const px = cx + Math.cos(angle) * rx;
            const py = cy + Math.sin(angle) * ry;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();

        if (color !== undefined) {
            ctx.fillStyle = this.colorToCSS(color);
            ctx.fill();
        }

        if (lineColor !== undefined) {
            ctx.strokeStyle = this.colorToCSS(lineColor);
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }

        this._stats.triangles += sides;
    }

    private colorToCSS(color: number): string {
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        return `rgb(${r},${g},${b})`;
    }

    private mapHAlign(align: ETextAlign | string | undefined): CanvasTextAlign {
        switch (align) {
            case 'center':
                return 'center';
            case 'right':
                return 'right';
            default:
                return 'left';
        }
    }

    private mapVAlign(align: ETextVAlign | string | undefined): CanvasTextBaseline {
        switch (align) {
            case 'middle':
                return 'middle';
            case 'bottom':
                return 'bottom';
            default:
                return 'top';
        }
    }
}
