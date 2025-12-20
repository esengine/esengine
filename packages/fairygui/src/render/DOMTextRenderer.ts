/**
 * DOMTextRenderer
 *
 * Renders FGUI text primitives using HTML DOM elements.
 * This provides text rendering when the engine doesn't support native text rendering.
 *
 * 使用 HTML DOM 元素渲染 FGUI 文本图元
 * 当引擎不支持原生文本渲染时提供文本渲染能力
 */

import type { IRenderPrimitive } from './IRenderCollector';
import { ERenderPrimitiveType } from './IRenderCollector';
import { EAlignType, EVertAlignType } from '../core/FieldTypes';

/**
 * Text element pool entry
 * 文本元素池条目
 */
interface TextElement {
    element: HTMLDivElement;
    inUse: boolean;
    primitiveHash: string;
}

/**
 * DOMTextRenderer
 *
 * Manages a pool of HTML elements for text rendering.
 * 管理用于文本渲染的 HTML 元素池
 */
export class DOMTextRenderer {
    /** Container element | 容器元素 */
    private _container: HTMLDivElement | null = null;

    /** Text element pool | 文本元素池 */
    private _elementPool: TextElement[] = [];

    /** Current frame elements in use | 当前帧使用的元素数量 */
    private _elementsInUse: number = 0;

    /** Canvas reference for coordinate conversion | 画布引用，用于坐标转换 */
    private _canvas: HTMLCanvasElement | null = null;

    /** Design width | 设计宽度 */
    private _designWidth: number = 1920;

    /** Design height | 设计高度 */
    private _designHeight: number = 1080;

    /** Whether initialized | 是否已初始化 */
    private _initialized: boolean = false;

    /**
     * Initialize the renderer
     * 初始化渲染器
     */
    public initialize(canvas: HTMLCanvasElement): void {
        if (this._initialized) return;

        this._canvas = canvas;

        // Create container overlay
        this._container = document.createElement('div');
        this._container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 1;
        `;

        // Insert after canvas
        if (canvas.parentElement) {
            // Make parent relative if not already
            const parentStyle = window.getComputedStyle(canvas.parentElement);
            if (parentStyle.position === 'static') {
                canvas.parentElement.style.position = 'relative';
            }
            canvas.parentElement.appendChild(this._container);
        }

        this._initialized = true;
    }

    /**
     * Set design size for coordinate conversion
     * 设置设计尺寸，用于坐标转换
     */
    public setDesignSize(width: number, height: number): void {
        this._designWidth = width;
        this._designHeight = height;
    }

    /**
     * Begin a new frame
     * 开始新的一帧
     */
    public beginFrame(): void {
        // Mark all elements as not in use
        for (const entry of this._elementPool) {
            entry.inUse = false;
        }
        this._elementsInUse = 0;
    }

    /**
     * Render text primitives
     * 渲染文本图元
     */
    public renderPrimitives(primitives: readonly IRenderPrimitive[]): void {
        if (!this._container || !this._canvas) return;

        const canvasRect = this._canvas.getBoundingClientRect();
        const scaleX = canvasRect.width / this._designWidth;
        const scaleY = canvasRect.height / this._designHeight;

        for (const primitive of primitives) {
            if (primitive.type !== ERenderPrimitiveType.Text) continue;
            if (!primitive.text) continue;

            this.renderTextPrimitive(primitive, scaleX, scaleY);
        }
    }

    /**
     * End frame - hide unused elements
     * 结束帧 - 隐藏未使用的元素
     */
    public endFrame(): void {
        for (const entry of this._elementPool) {
            if (!entry.inUse) {
                entry.element.style.display = 'none';
            }
        }
    }

    /**
     * Render a single text primitive
     * 渲染单个文本图元
     */
    private renderTextPrimitive(primitive: IRenderPrimitive, scaleX: number, scaleY: number): void {
        const element = this.getOrCreateElement();

        // Calculate position from world matrix
        const m = primitive.worldMatrix;
        let x = m ? m[4] : 0;
        let y = m ? m[5] : 0;

        // Apply scale
        x *= scaleX;
        y *= scaleY;
        const width = primitive.width * scaleX;
        const height = primitive.height * scaleY;
        const fontSize = (primitive.fontSize ?? 12) * Math.min(scaleX, scaleY);

        // Build style
        const style = element.style;
        style.display = 'block';
        style.position = 'absolute';
        style.left = `${x}px`;
        style.top = `${y}px`;
        style.width = `${width}px`;
        style.height = `${height}px`;
        style.fontSize = `${fontSize}px`;
        style.fontFamily = primitive.font || 'Arial, sans-serif';
        style.color = this.colorToCSS(primitive.color ?? 0xFFFFFFFF);
        style.opacity = String(primitive.alpha ?? 1);
        style.overflow = 'hidden';
        style.whiteSpace = primitive.singleLine ? 'nowrap' : (primitive.wordWrap ? 'normal' : 'pre');
        style.lineHeight = `${fontSize + (primitive.leading ?? 0) * Math.min(scaleX, scaleY)}px`;
        style.letterSpacing = `${(primitive.letterSpacing ?? 0) * scaleX}px`;

        // Text decoration
        const decorations: string[] = [];
        if (primitive.underline) decorations.push('underline');
        style.textDecoration = decorations.join(' ') || 'none';

        // Font style
        style.fontWeight = primitive.bold ? 'bold' : 'normal';
        style.fontStyle = primitive.italic ? 'italic' : 'normal';

        // Text alignment
        style.textAlign = this.mapHAlign(primitive.align as EAlignType);
        style.display = 'flex';
        style.alignItems = this.mapVAlignFlex(primitive.valign as EVertAlignType);
        style.justifyContent = this.mapHAlignFlex(primitive.align as EAlignType);

        // Text stroke (using text-shadow for approximation)
        if (primitive.stroke && primitive.stroke > 0) {
            const strokeColor = this.colorToCSS(primitive.strokeColor ?? 0xFF000000);
            const strokeWidth = primitive.stroke;
            style.textShadow = `
                -${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
                ${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
                -${strokeWidth}px ${strokeWidth}px 0 ${strokeColor},
                ${strokeWidth}px ${strokeWidth}px 0 ${strokeColor}
            `;
        } else {
            style.textShadow = 'none';
        }

        // Set text content
        element.textContent = primitive.text ?? '';
    }

    /**
     * Get or create a text element
     * 获取或创建文本元素
     */
    private getOrCreateElement(): HTMLDivElement {
        // Find unused element
        for (const entry of this._elementPool) {
            if (!entry.inUse) {
                entry.inUse = true;
                this._elementsInUse++;
                return entry.element;
            }
        }

        // Create new element
        const element = document.createElement('div');
        element.style.pointerEvents = 'none';
        this._container!.appendChild(element);

        const entry: TextElement = {
            element,
            inUse: true,
            primitiveHash: ''
        };
        this._elementPool.push(entry);
        this._elementsInUse++;

        return element;
    }

    /**
     * Convert color number to CSS string
     * 将颜色数字转换为 CSS 字符串
     */
    private colorToCSS(color: number): string {
        const a = ((color >> 24) & 0xff) / 255;
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        return `rgba(${r},${g},${b},${a})`;
    }

    /**
     * Map horizontal alignment to CSS
     * 将水平对齐映射到 CSS
     */
    private mapHAlign(align: EAlignType | undefined): string {
        switch (align) {
            case EAlignType.Center:
                return 'center';
            case EAlignType.Right:
                return 'right';
            default:
                return 'left';
        }
    }

    /**
     * Map horizontal alignment to flexbox
     * 将水平对齐映射到 flexbox
     */
    private mapHAlignFlex(align: EAlignType | undefined): string {
        switch (align) {
            case EAlignType.Center:
                return 'center';
            case EAlignType.Right:
                return 'flex-end';
            default:
                return 'flex-start';
        }
    }

    /**
     * Map vertical alignment to flexbox
     * 将垂直对齐映射到 flexbox
     */
    private mapVAlignFlex(align: EVertAlignType | undefined): string {
        switch (align) {
            case EVertAlignType.Middle:
                return 'center';
            case EVertAlignType.Bottom:
                return 'flex-end';
            default:
                return 'flex-start';
        }
    }

    /**
     * Dispose the renderer
     * 释放渲染器
     */
    public dispose(): void {
        if (this._container && this._container.parentElement) {
            this._container.parentElement.removeChild(this._container);
        }
        this._container = null;
        this._elementPool = [];
        this._initialized = false;
    }
}

/**
 * Default DOM text renderer instance
 * 默认 DOM 文本渲染器实例
 */
let _defaultRenderer: DOMTextRenderer | null = null;

/**
 * Get default DOM text renderer
 * 获取默认 DOM 文本渲染器
 */
export function getDOMTextRenderer(): DOMTextRenderer {
    if (!_defaultRenderer) {
        _defaultRenderer = new DOMTextRenderer();
    }
    return _defaultRenderer;
}

/**
 * Set default DOM text renderer
 * 设置默认 DOM 文本渲染器
 */
export function setDOMTextRenderer(renderer: DOMTextRenderer | null): void {
    _defaultRenderer = renderer;
}
