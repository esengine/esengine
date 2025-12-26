import type { IRectangle } from '../utils/MathTypes';
import type { IRenderPrimitive } from './IRenderCollector';

/**
 * Texture handle
 * 纹理句柄
 */
export interface ITextureHandle {
    /** Unique identifier | 唯一标识 */
    readonly id: number;
    /** Texture width | 纹理宽度 */
    readonly width: number;
    /** Texture height | 纹理高度 */
    readonly height: number;
    /** Is texture valid | 纹理是否有效 */
    readonly isValid: boolean;
}

/**
 * Font handle
 * 字体句柄
 */
export interface IFontHandle {
    /** Font family name | 字体名称 */
    readonly family: string;
    /** Is font loaded | 字体是否已加载 */
    readonly isLoaded: boolean;
}

/**
 * Render statistics
 * 渲染统计
 */
export interface IRenderStats {
    /** Draw call count | 绘制调用数 */
    drawCalls: number;
    /** Triangle count | 三角形数量 */
    triangles: number;
    /** Texture switches | 纹理切换次数 */
    textureSwitches: number;
    /** Batch count | 批次数量 */
    batches: number;
    /** Frame time in ms | 帧时间（毫秒） */
    frameTime: number;
}

/**
 * Render backend interface
 *
 * Abstract interface for graphics backend (WebGPU, WebGL, Canvas2D).
 *
 * 图形后端抽象接口（WebGPU、WebGL、Canvas2D）
 */
export interface IRenderBackend {
    /** Backend name | 后端名称 */
    readonly name: string;

    /** Is backend initialized | 后端是否已初始化 */
    readonly isInitialized: boolean;

    /** Canvas width | 画布宽度 */
    readonly width: number;

    /** Canvas height | 画布高度 */
    readonly height: number;

    /**
     * Initialize the backend
     * 初始化后端
     */
    initialize(canvas: HTMLCanvasElement): Promise<boolean>;

    /**
     * Begin a new frame
     * 开始新帧
     */
    beginFrame(): void;

    /**
     * End the current frame
     * 结束当前帧
     */
    endFrame(): void;

    /**
     * Submit render primitives for rendering
     * 提交渲染图元进行渲染
     */
    submitPrimitives(primitives: readonly IRenderPrimitive[]): void;

    /**
     * Set clip rectangle
     * 设置裁剪矩形
     */
    setClipRect(rect: IRectangle | null): void;

    /**
     * Create a texture from image data
     * 从图像数据创建纹理
     */
    createTexture(
        source: ImageBitmap | HTMLImageElement | HTMLCanvasElement | ImageData
    ): ITextureHandle;

    /**
     * Destroy a texture
     * 销毁纹理
     */
    destroyTexture(texture: ITextureHandle): void;

    /**
     * Load a font
     * 加载字体
     */
    loadFont(family: string, url?: string): Promise<IFontHandle>;

    /**
     * Resize the backend
     * 调整后端大小
     */
    resize(width: number, height: number): void;

    /**
     * Get render statistics
     * 获取渲染统计
     */
    getStats(): IRenderStats;

    /**
     * Dispose the backend
     * 销毁后端
     */
    dispose(): void;
}

/**
 * Backend factory function type
 * 后端工厂函数类型
 */
export type RenderBackendFactory = () => IRenderBackend;
