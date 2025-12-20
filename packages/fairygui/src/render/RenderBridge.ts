import type { IRectangle } from '../utils/MathTypes';
import type { IRenderCollector, IRenderPrimitive } from './IRenderCollector';
import type { IRenderBackend, IRenderStats, ITextureHandle, IFontHandle } from './IRenderBackend';

/**
 * Texture cache entry
 * 纹理缓存条目
 */
interface TextureCacheEntry {
    handle: ITextureHandle;
    lastUsedFrame: number;
    refCount: number;
}

/**
 * RenderBridge
 *
 * Bridges FairyGUI render primitives to the graphics backend.
 * Provides batching, caching, and optimization.
 *
 * 将 FairyGUI 渲染图元桥接到图形后端
 * 提供批处理、缓存和优化
 *
 * Features:
 * - Automatic batching of similar primitives
 * - Texture atlas support
 * - Font caching
 * - Render statistics
 *
 * @example
 * ```typescript
 * const bridge = new RenderBridge(webgpuBackend);
 * await bridge.initialize(canvas);
 *
 * // In render loop
 * bridge.beginFrame();
 * root.collectRenderData(collector);
 * bridge.render(collector);
 * bridge.endFrame();
 * ```
 */
export class RenderBridge {
    private _backend: IRenderBackend;
    private _textureCache: Map<string, TextureCacheEntry> = new Map();
    private _fontCache: Map<string, IFontHandle> = new Map();
    private _currentFrame: number = 0;
    private _textureCacheMaxAge: number = 60; // Frames before texture is evicted
    private _clipStack: IRectangle[] = [];
    private _batchBuffer: IRenderPrimitive[] = [];

    constructor(backend: IRenderBackend) {
        this._backend = backend;
    }

    /**
     * Get the underlying backend
     * 获取底层后端
     */
    public get backend(): IRenderBackend {
        return this._backend;
    }

    /**
     * Check if bridge is initialized
     * 检查桥接是否已初始化
     */
    public get isInitialized(): boolean {
        return this._backend.isInitialized;
    }

    /**
     * Initialize the bridge with a canvas
     * 使用画布初始化桥接
     */
    public async initialize(canvas: HTMLCanvasElement): Promise<boolean> {
        return this._backend.initialize(canvas);
    }

    /**
     * Begin a new frame
     * 开始新帧
     */
    public beginFrame(): void {
        this._currentFrame++;
        this._clipStack.length = 0;
        this._batchBuffer.length = 0;
        this._backend.beginFrame();
    }

    /**
     * End the current frame
     * 结束当前帧
     */
    public endFrame(): void {
        this.flushBatch();
        this._backend.endFrame();
        this.evictOldTextures();
    }

    /**
     * Render primitives from a collector
     * 渲染收集器中的图元
     */
    public render(collector: IRenderCollector): void {
        const primitives = collector.getPrimitives();
        for (const primitive of primitives) {
            this.processPrimitive(primitive);
        }
    }

    /**
     * Render a single primitive
     * 渲染单个图元
     */
    public renderPrimitive(primitive: IRenderPrimitive): void {
        this.processPrimitive(primitive);
    }

    /**
     * Push a clip rectangle
     * 压入裁剪矩形
     */
    public pushClipRect(rect: IRectangle): void {
        if (this._clipStack.length > 0) {
            const current = this._clipStack[this._clipStack.length - 1];
            const intersected = this.intersectRects(current, rect);
            this._clipStack.push(intersected);
        } else {
            this._clipStack.push({ ...rect });
        }
        this.flushBatch();
        this._backend.setClipRect(this._clipStack[this._clipStack.length - 1]);
    }

    /**
     * Pop the current clip rectangle
     * 弹出当前裁剪矩形
     */
    public popClipRect(): void {
        if (this._clipStack.length > 0) {
            this._clipStack.pop();
            this.flushBatch();
            this._backend.setClipRect(
                this._clipStack.length > 0 ? this._clipStack[this._clipStack.length - 1] : null
            );
        }
    }

    /**
     * Load or get cached texture
     * 加载或获取缓存的纹理
     */
    public async loadTexture(
        url: string,
        source?: ImageBitmap | HTMLImageElement | HTMLCanvasElement | ImageData
    ): Promise<ITextureHandle | null> {
        // Check cache first
        const cached = this._textureCache.get(url);
        if (cached) {
            cached.lastUsedFrame = this._currentFrame;
            cached.refCount++;
            return cached.handle;
        }

        // Load or create texture
        let textureSource = source;
        if (!textureSource) {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                textureSource = await createImageBitmap(blob);
            } catch (error) {
                console.error(`Failed to load texture: ${url}`, error);
                return null;
            }
        }

        const handle = this._backend.createTexture(textureSource);
        this._textureCache.set(url, {
            handle,
            lastUsedFrame: this._currentFrame,
            refCount: 1
        });

        return handle;
    }

    /**
     * Release a texture reference
     * 释放纹理引用
     */
    public releaseTexture(url: string): void {
        const cached = this._textureCache.get(url);
        if (cached) {
            cached.refCount--;
        }
    }

    /**
     * Load or get cached font
     * 加载或获取缓存的字体
     */
    public async loadFont(family: string, url?: string): Promise<IFontHandle> {
        const cached = this._fontCache.get(family);
        if (cached) {
            return cached;
        }

        const handle = await this._backend.loadFont(family, url);
        this._fontCache.set(family, handle);
        return handle;
    }

    /**
     * Resize the render target
     * 调整渲染目标大小
     */
    public resize(width: number, height: number): void {
        this._backend.resize(width, height);
    }

    /**
     * Get render statistics
     * 获取渲染统计
     */
    public getStats(): IRenderStats & { textureCount: number; fontCount: number } {
        const backendStats = this._backend.getStats();
        return {
            ...backendStats,
            textureCount: this._textureCache.size,
            fontCount: this._fontCache.size
        };
    }

    /**
     * Dispose the bridge and all resources
     * 销毁桥接和所有资源
     */
    public dispose(): void {
        // Destroy all cached textures
        for (const entry of this._textureCache.values()) {
            this._backend.destroyTexture(entry.handle);
        }
        this._textureCache.clear();
        this._fontCache.clear();
        this._clipStack.length = 0;
        this._batchBuffer.length = 0;
        this._backend.dispose();
    }

    private processPrimitive(primitive: IRenderPrimitive): void {
        // Check if can batch with previous primitives
        if (this._batchBuffer.length > 0) {
            const last = this._batchBuffer[this._batchBuffer.length - 1];
            if (!this.canBatch(last, primitive)) {
                this.flushBatch();
            }
        }

        this._batchBuffer.push(primitive);
    }

    private canBatch(a: IRenderPrimitive, b: IRenderPrimitive): boolean {
        // Can batch if same type and texture
        if (a.type !== b.type) return false;
        if (a.textureId !== b.textureId) return false;
        if (a.blendMode !== b.blendMode) return false;
        return true;
    }

    private flushBatch(): void {
        if (this._batchBuffer.length === 0) return;

        this._backend.submitPrimitives(this._batchBuffer);
        this._batchBuffer.length = 0;
    }

    private evictOldTextures(): void {
        const minFrame = this._currentFrame - this._textureCacheMaxAge;
        const toEvict: string[] = [];

        for (const [url, entry] of this._textureCache) {
            if (entry.refCount <= 0 && entry.lastUsedFrame < minFrame) {
                toEvict.push(url);
            }
        }

        for (const url of toEvict) {
            const entry = this._textureCache.get(url);
            if (entry) {
                this._backend.destroyTexture(entry.handle);
                this._textureCache.delete(url);
            }
        }
    }

    private intersectRects(a: IRectangle, b: IRectangle): IRectangle {
        const x = Math.max(a.x, b.x);
        const y = Math.max(a.y, b.y);
        const right = Math.min(a.x + a.width, b.x + b.width);
        const bottom = Math.min(a.y + a.height, b.y + b.height);

        return {
            x,
            y,
            width: Math.max(0, right - x),
            height: Math.max(0, bottom - y)
        };
    }
}
