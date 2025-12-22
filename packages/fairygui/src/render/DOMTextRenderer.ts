/**
 * DOMTextRenderer
 *
 * Renders FGUI text primitives using HTML DOM elements.
 * This provides text rendering when the engine doesn't support native text rendering.
 *
 * 使用 HTML DOM 元素渲染 FGUI 文本图元
 * 当引擎不支持原生文本渲染时提供文本渲染能力
 *
 * Coordinate systems:
 * - FGUI coordinate: top-left origin (0,0), Y-down
 * - Engine world coordinate: center origin (0,0), Y-up
 * - DOM coordinate: top-left origin, Y-down
 *
 * Editor mode: UI renders in world space, follows editor camera
 * Preview mode: UI renders in screen space, fixed overlay
 *
 * 坐标系：
 * - FGUI 坐标：左上角原点 (0,0)，Y 向下
 * - 引擎世界坐标：中心原点 (0,0)，Y 向上
 * - DOM 坐标：左上角原点，Y 向下
 *
 * 编辑器模式：UI 在世界空间渲染，跟随编辑器相机
 * 预览模式：UI 在屏幕空间渲染，固定覆盖层
 */

import type { IRenderPrimitive } from './IRenderCollector';
import { ERenderPrimitiveType } from './IRenderCollector';
import { EAlignType, EVertAlignType } from '../core/FieldTypes';

/**
 * Camera state for coordinate conversion
 * 相机状态，用于坐标转换
 */
export interface ICameraState {
    x: number;
    y: number;
    zoom: number;
    rotation?: number;
}

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

    /** Preview mode (screen space) vs Editor mode (world space) | 预览模式（屏幕空间）vs 编辑器模式（世界空间） */
    private _previewMode: boolean = false;

    /** Camera state for editor mode | 编辑器模式的相机状态 */
    private _camera: ICameraState = { x: 0, y: 0, zoom: 1 };

    /**
     * Initialize the renderer
     * 初始化渲染器
     */
    public initialize(canvas: HTMLCanvasElement): void {
        if (this._initialized) return;

        this._canvas = canvas;

        // Create container overlay that matches canvas exactly
        // 使用 fixed 定位，这样可以直接使用 getBoundingClientRect 的坐标
        // Use fixed positioning so we can directly use getBoundingClientRect coordinates
        this._container = document.createElement('div');
        this._container.id = 'fgui-text-container';
        this._container.style.cssText = `
            position: fixed;
            pointer-events: none;
            overflow: hidden;
            z-index: 9999;
        `;

        // Append to body for fixed positioning
        // 附加到 body 以使用 fixed 定位
        document.body.appendChild(this._container);

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
     * Set preview mode
     * 设置预览模式
     *
     * In preview mode (true): UI uses screen space overlay, fixed on screen
     * In editor mode (false): UI renders in world space, follows editor camera
     *
     * 预览模式（true）：UI 使用屏幕空间叠加，固定在屏幕上
     * 编辑器模式（false）：UI 在世界空间渲染，跟随编辑器相机
     */
    public setPreviewMode(mode: boolean): void {
        this._previewMode = mode;
    }

    /**
     * Set camera state for editor mode
     * 设置编辑器模式的相机状态
     */
    public setCamera(camera: ICameraState): void {
        this._camera = camera;
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
        if (!this._container || !this._canvas) {
            // Try to auto-initialize if not done yet
            // 如果尚未初始化，尝试自动初始化
            if (!this._initialized) {
                const canvas = document.querySelector('canvas') as HTMLCanvasElement;
                if (canvas) {
                    this.initialize(canvas);
                }
            }
            if (!this._container || !this._canvas) return;
        }

        // Get canvas position and size
        // 获取 canvas 位置和尺寸
        const canvasRect = this._canvas.getBoundingClientRect();

        // Update container to match canvas position
        // 更新容器以匹配 canvas 位置
        this._container.style.left = `${canvasRect.left}px`;
        this._container.style.top = `${canvasRect.top}px`;
        this._container.style.width = `${canvasRect.width}px`;
        this._container.style.height = `${canvasRect.height}px`;

        for (const primitive of primitives) {
            if (primitive.type !== ERenderPrimitiveType.Text) continue;
            if (!primitive.text) continue;

            if (this._previewMode) {
                // Preview mode: Screen space rendering
                // 预览模式：屏幕空间渲染
                this.renderTextPrimitiveScreenSpace(primitive, canvasRect);
            } else {
                // Editor mode: World space rendering with camera transform
                // 编辑器模式：应用相机变换的世界空间渲染
                this.renderTextPrimitiveWorldSpace(primitive, canvasRect);
            }
        }
    }

    /**
     * Render text in screen space (preview mode)
     * 在屏幕空间渲染文本（预览模式）
     */
    private renderTextPrimitiveScreenSpace(primitive: IRenderPrimitive, canvasRect: DOMRect): void {
        // Calculate scale from design resolution to actual canvas size
        // 计算从设计分辨率到实际画布尺寸的缩放
        const scaleX = canvasRect.width / this._designWidth;
        const scaleY = canvasRect.height / this._designHeight;
        const scale = Math.min(scaleX, scaleY);

        // Calculate offset to center the UI (when aspect ratios don't match)
        // 计算居中 UI 的偏移量（当宽高比不匹配时）
        const offsetX = (canvasRect.width - this._designWidth * scale) / 2;
        const offsetY = (canvasRect.height - this._designHeight * scale) / 2;

        this.renderTextPrimitive(primitive, scale, offsetX, offsetY, scale);
    }

    /**
     * Render text in world space (editor mode)
     * 在世界空间渲染文本（编辑器模式）
     *
     * Coordinate conversion:
     * 1. FGUI coordinates (top-left origin, Y-down) -> Engine world coordinates (center origin, Y-up)
     * 2. Apply camera transform (pan and zoom)
     * 3. Engine screen coordinates -> DOM coordinates (top-left origin, Y-down)
     *
     * 坐标转换：
     * 1. FGUI 坐标（左上角原点，Y向下） -> 引擎世界坐标（中心原点，Y向上）
     * 2. 应用相机变换（平移和缩放）
     * 3. 引擎屏幕坐标 -> DOM 坐标（左上角原点，Y向下）
     */
    private renderTextPrimitiveWorldSpace(primitive: IRenderPrimitive, canvasRect: DOMRect): void {
        const element = this.getOrCreateElement();

        // Get FGUI position from world matrix
        // FGUI coordinates: top-left origin, Y-down
        const m = primitive.worldMatrix;
        const fguiX = m ? m[4] : 0;
        const fguiY = m ? m[5] : 0;

        // Extract scale from matrix (same as FGUIRenderDataProvider)
        // 从矩阵提取缩放（与 FGUIRenderDataProvider 相同）
        const matrixScaleX = m ? Math.sqrt(m[0] * m[0] + m[1] * m[1]) : 1;
        const matrixScaleY = m ? Math.sqrt(m[2] * m[2] + m[3] * m[3]) : 1;

        // Convert FGUI coordinates to engine world coordinates (same as FGUIRenderDataProvider)
        // FGUI: (0,0) = top-left, Y-down
        // Engine: (0,0) = center, Y-up
        // 使用与 FGUIRenderDataProvider 相同的坐标转换逻辑
        const halfDesignWidth = this._designWidth / 2;
        const halfDesignHeight = this._designHeight / 2;

        // Engine world coordinates
        // 引擎世界坐标
        const worldX = fguiX - halfDesignWidth;
        const worldY = halfDesignHeight - fguiY;

        // Apply camera transform (pan and zoom)
        // The engine applies camera to sprites; we need to do the same for DOM text
        // 应用相机变换（平移和缩放）
        // 引擎对精灵应用相机变换；我们需要对 DOM 文本做同样处理
        const viewX = (worldX - this._camera.x) * this._camera.zoom;
        const viewY = (worldY - this._camera.y) * this._camera.zoom;

        // Convert to DOM screen coordinates
        // Screen center is at (canvasWidth/2, canvasHeight/2)
        // Engine Y-up -> DOM Y-down
        // 转换为 DOM 屏幕坐标
        const screenX = canvasRect.width / 2 + viewX;
        const screenY = canvasRect.height / 2 - viewY;

        // Calculate size with matrix scale and camera zoom
        // 使用矩阵缩放和相机缩放计算尺寸
        const width = primitive.width * matrixScaleX * this._camera.zoom;
        const height = primitive.height * matrixScaleY * this._camera.zoom;
        const fontSize = (primitive.fontSize ?? 12) * matrixScaleY * this._camera.zoom;

        // Build style
        const style = element.style;
        style.display = 'block';
        style.position = 'absolute';
        style.left = `${screenX}px`;
        style.top = `${screenY}px`;
        style.width = `${width}px`;
        style.height = `${height}px`;
        style.fontSize = `${fontSize}px`;
        style.fontFamily = primitive.font || 'Arial, sans-serif';
        style.color = this.colorToCSS(primitive.color ?? 0xFFFFFFFF);
        style.opacity = String(primitive.alpha ?? 1);
        style.overflow = 'hidden';

        // Text wrapping (world space mode):
        // - singleLine: no wrap at all (nowrap)
        // - wordWrap: wrap at word boundaries when exceeding width (pre-wrap)
        // - neither: preserve whitespace but no auto-wrap (pre)
        // 文本换行（世界空间模式）：
        // - singleLine: 完全不换行 (nowrap)
        // - wordWrap: 超出宽度时在单词边界换行 (pre-wrap)
        // - 都不是: 保留空白但不自动换行 (pre)
        if (primitive.singleLine) {
            style.whiteSpace = 'nowrap';
            style.wordBreak = 'normal';
        } else if (primitive.wordWrap) {
            style.whiteSpace = 'pre-wrap';
            style.wordBreak = 'break-word';
        } else {
            style.whiteSpace = 'pre';
            style.wordBreak = 'normal';
        }

        // Combined scale factor for consistent sizing
        // 统一的缩放因子以保持一致性
        const sizeScale = matrixScaleY * this._camera.zoom;
        style.lineHeight = `${fontSize + (primitive.leading ?? 0) * sizeScale}px`;
        style.letterSpacing = `${(primitive.letterSpacing ?? 0) * sizeScale}px`;

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
            const strokeColor = this.colorToCSS(primitive.strokeColor ?? 0x000000FF);
            const strokeWidth = primitive.stroke * sizeScale;
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
     * Render a single text primitive (screen space mode)
     * 渲染单个文本图元（屏幕空间模式）
     *
     * @param primitive - Text primitive to render
     * @param scale - Uniform scale factor for position
     * @param offsetX - X offset for centering
     * @param offsetY - Y offset for centering
     * @param sizeScale - Scale factor for size and font (can differ from position scale)
     */
    private renderTextPrimitive(primitive: IRenderPrimitive, scale: number, offsetX: number, offsetY: number, sizeScale: number): void {
        const element = this.getOrCreateElement();

        // Calculate position from world matrix
        // FGUI coordinates: top-left origin, Y-down
        const m = primitive.worldMatrix;
        let x = m ? m[4] : 0;
        let y = m ? m[5] : 0;

        // Apply scale and offset
        x = x * scale + offsetX;
        y = y * scale + offsetY;
        const width = primitive.width * sizeScale;
        const height = primitive.height * sizeScale;
        const fontSize = (primitive.fontSize ?? 12) * sizeScale;

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

        // Text wrapping (screen space mode):
        // 文本换行（屏幕空间模式）
        if (primitive.singleLine) {
            style.whiteSpace = 'nowrap';
            style.wordBreak = 'normal';
        } else if (primitive.wordWrap) {
            style.whiteSpace = 'pre-wrap';
            style.wordBreak = 'break-word';
        } else {
            style.whiteSpace = 'pre';
            style.wordBreak = 'normal';
        }

        style.lineHeight = `${fontSize + (primitive.leading ?? 0) * sizeScale}px`;
        style.letterSpacing = `${(primitive.letterSpacing ?? 0) * sizeScale}px`;

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
            const strokeColor = this.colorToCSS(primitive.strokeColor ?? 0x000000FF);
            const strokeWidth = primitive.stroke * sizeScale;
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
     * Convert packed color (0xRRGGBBAA) to CSS rgba string
     * 将打包颜色（0xRRGGBBAA）转换为 CSS rgba 字符串
     */
    private colorToCSS(color: number): string {
        const r = (color >> 24) & 0xff;
        const g = (color >> 16) & 0xff;
        const b = (color >> 8) & 0xff;
        const a = (color & 0xff) / 255;
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
