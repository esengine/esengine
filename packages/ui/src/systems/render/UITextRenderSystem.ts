/**
 * UI Text Render System
 * UI 文本渲染系统
 *
 * Renders UITextComponent entities by generating text textures
 * and submitting them to the shared UIRenderCollector.
 * 通过生成文本纹理并提交到共享的 UIRenderCollector 来渲染 UITextComponent 实体。
 */

import { EntitySystem, Matcher, Entity, ECSSystem } from '@esengine/ecs-framework';
import { UITransformComponent } from '../../components/UITransformComponent';
import { UITextComponent } from '../../components/UITextComponent';
import { getUIRenderCollector, registerCacheInvalidationCallback, unregisterCacheInvalidationCallback } from './UIRenderCollector';
import { getUIRenderTransform } from './UIRenderUtils';

/**
 * Text texture cache entry
 * 文本纹理缓存条目
 */
interface TextTextureCache {
    textureId: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string | number;
    italic: boolean;
    color: number;
    alpha: number;
    align: string;
    verticalAlign: string;
    lineHeight: number;
    width: number;
    height: number;
    dataUrl: string;
}

/**
 * UI Text Render System
 * UI 文本渲染系统
 *
 * Handles rendering of text components by:
 * 1. Generating text textures using Canvas 2D
 * 2. Caching textures to avoid regeneration every frame
 * 3. Submitting texture render primitives to the collector
 *
 * 处理文本组件的渲染：
 * 1. 使用 Canvas 2D 生成文本纹理
 * 2. 缓存纹理以避免每帧重新生成
 * 3. 向收集器提交纹理渲染原语
 */
@ECSSystem('UITextRender', { updateOrder: 120, runInEditMode: true })
export class UITextRenderSystem extends EntitySystem {
    private textCanvas: HTMLCanvasElement | null = null;
    private textCtx: CanvasRenderingContext2D | null = null;
    private textTextureCache: Map<number, TextTextureCache> = new Map();
    private nextTextureId = 90000;
    private onTextureCreated: ((id: number, dataUrl: string) => void) | null = null;
    private cacheInvalidationBound: () => void;
    /** 检查纹理是否已就绪的回调 | Callback to check if texture is ready */
    private textureReadyChecker: ((id: number) => boolean) | null = null;
    /** 待确认就绪的纹理 ID 集合 | Set of texture IDs pending ready confirmation */
    private pendingTextures: Set<number> = new Set();

    constructor() {
        super(Matcher.empty().all(UITransformComponent, UITextComponent));
        // Bind the method for cache invalidation callback
        this.cacheInvalidationBound = this.clearTextCache.bind(this);
    }

    /**
     * Called when system is added to scene
     * 系统添加到场景时调用
     */
    public override initialize(): void {
        super.initialize();
        // Register for cache invalidation events
        registerCacheInvalidationCallback(this.cacheInvalidationBound);
    }

    /**
     * Called when system is destroyed
     * 系统销毁时调用
     */
    protected override onDestroy(): void {
        super.onDestroy();
        // Unregister cache invalidation callback
        unregisterCacheInvalidationCallback(this.cacheInvalidationBound);
    }

    /**
     * Set callback for when a new text texture is created
     * 设置创建新文本纹理时的回调
     */
    setTextureCallback(callback: (id: number, dataUrl: string) => void): void {
        this.onTextureCreated = callback;
    }

    /**
     * Set callback to check if texture is ready
     * 设置检查纹理是否就绪的回调
     *
     * This is used to verify that dynamically created textures
     * have finished loading before caching them.
     * 用于验证动态创建的纹理在缓存前已加载完成。
     */
    setTextureReadyChecker(checker: (id: number) => boolean): void {
        this.textureReadyChecker = checker;
    }

    protected process(entities: readonly Entity[]): void {
        const collector = getUIRenderCollector();

        // 检查待确认的纹理是否已就绪
        // Check if pending textures are ready
        if (this.pendingTextures.size > 0 && this.textureReadyChecker) {
            const nowReady: number[] = [];
            for (const textureId of this.pendingTextures) {
                if (this.textureReadyChecker(textureId)) {
                    nowReady.push(textureId);
                }
            }
            if (nowReady.length > 0) {
                for (const id of nowReady) {
                    this.pendingTextures.delete(id);
                }
                // 纹理就绪后不需要做任何特殊处理！
                // Rust 端的纹理已经从 1x1 占位符更新为真实内容。
                // 注意：不要调用 invalidateUIRenderCaches()，那会清除缓存导致无限循环。
                // No special action needed - Rust texture is already updated.
                // Note: Do NOT call invalidateUIRenderCaches(), it would cause infinite loop.
            }
        }

        for (const entity of entities) {
            const transform = entity.getComponent(UITransformComponent);
            const text = entity.getComponent(UITextComponent);

            // 空值检查 - 组件可能在反序列化或初始化期间尚未就绪
            // Null check - component may not be ready during deserialization or initialization
            if (!transform || !text) continue;

            // 使用工具函数获取渲染变换数据（包含 layoutComputed 检查）
            // Use utility function to get render transform data (includes layoutComputed check)
            const rt = getUIRenderTransform(transform);
            if (!rt) continue;

            // 跳过空文本 | Skip empty text
            if (!text.text) continue;

            // Generate or retrieve cached texture
            // 生成或获取缓存的纹理
            const textureId = this.getOrCreateTextTexture(
                entity.id, text, Math.ceil(rt.width), Math.ceil(rt.height)
            );

            if (textureId === null) continue;

            // 文本渲染在背景之上 | Text renders above background
            const textOrderInLayer = rt.orderInLayer + 1;

            // 使用 transform 的 pivot 值作为旋转中心
            // Use pivot position with transform's pivot values
            collector.addRect(
                rt.renderX, rt.renderY,
                rt.width, rt.height,
                0xFFFFFF,  // White tint (color is baked into texture)
                rt.alpha,
                rt.sortingLayer,
                textOrderInLayer,  // 使用调整后的 orderInLayer
                {
                    rotation: rt.rotation,
                    pivotX: rt.pivotX,
                    pivotY: rt.pivotY,
                    textureId,
                    entityId: entity.id
                }
            );
        }
    }

    /**
     * Get or create text texture
     * 获取或创建文本纹理
     */
    private getOrCreateTextTexture(
        entityId: number,
        text: UITextComponent,
        width: number,
        height: number
    ): number | null {
        const canvasData = this.getTextCanvas();
        if (!canvasData) return null;

        const { canvas, ctx } = canvasData;

        const cached = this.textTextureCache.get(entityId);

        // Check if we need to regenerate the texture
        // 检查是否需要重新生成纹理
        const needsUpdate = !cached ||
            cached.text !== text.text ||
            cached.fontSize !== text.fontSize ||
            cached.fontFamily !== text.fontFamily ||
            cached.fontWeight !== text.fontWeight ||
            cached.italic !== text.italic ||
            cached.color !== text.color ||
            cached.alpha !== text.alpha ||
            cached.align !== text.align ||
            cached.verticalAlign !== text.verticalAlign ||
            cached.lineHeight !== text.lineHeight ||
            cached.width !== width ||
            cached.height !== height;

        if (needsUpdate) {
            const canvasWidth = Math.max(1, width);
            const canvasHeight = Math.max(1, height);

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            ctx.font = text.getCSSFont();
            ctx.fillStyle = text.getCSSColor();
            ctx.textBaseline = 'top';

            // Handle horizontal alignment
            // 处理水平对齐
            let textX = 0;
            if (text.align === 'center') {
                ctx.textAlign = 'center';
                textX = canvasWidth / 2;
            } else if (text.align === 'right') {
                ctx.textAlign = 'right';
                textX = canvasWidth;
            } else {
                ctx.textAlign = 'left';
                textX = 0;
            }

            // Handle vertical alignment
            // 处理垂直对齐
            const textHeight = text.fontSize * text.lineHeight;
            let textY = 0;

            if (text.verticalAlign === 'middle') {
                textY = (canvasHeight - textHeight) / 2;
            } else if (text.verticalAlign === 'bottom') {
                textY = canvasHeight - textHeight;
            }

            // Draw text (with or without word wrap)
            // 绘制文本（带或不带自动换行）
            if (text.wordWrap) {
                this.drawWrappedText(ctx, text.text, textX, textY, canvasWidth, text.fontSize * text.lineHeight);
            } else {
                ctx.fillText(text.text, textX, textY);
            }

            // Get or create texture ID
            // 获取或创建纹理 ID
            const textureId = cached?.textureId ?? this.nextTextureId++;

            const dataUrl = canvas.toDataURL('image/png');

            // Notify callback of new texture
            // 通知回调新纹理
            if (this.onTextureCreated) {
                this.onTextureCreated(textureId, dataUrl);
                // 如果有就绪检查器，将新纹理添加到待确认列表
                // If ready checker is available, add new texture to pending list
                if (this.textureReadyChecker) {
                    this.pendingTextures.add(textureId);
                }
            } else {
                // 警告：回调未设置（只输出一次）
                // Warning: callback not set (output once only)
                console.warn('[UITextRenderSystem] onTextureCreated callback not set! Text will not render.');
            }

            // Update cache
            // 更新缓存
            this.textTextureCache.set(entityId, {
                textureId,
                text: text.text,
                fontSize: text.fontSize,
                fontFamily: text.fontFamily,
                fontWeight: text.fontWeight,
                italic: text.italic,
                color: text.color,
                alpha: text.alpha,
                align: text.align,
                verticalAlign: text.verticalAlign,
                lineHeight: text.lineHeight,
                width,
                height,
                dataUrl
            });
        }

        return this.textTextureCache.get(entityId)?.textureId ?? null;
    }

    /**
     * Get or create text canvas
     * 获取或创建文本画布
     */
    private getTextCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
        if (!this.textCanvas) {
            this.textCanvas = document.createElement('canvas');
            this.textCtx = this.textCanvas.getContext('2d');
        }
        if (!this.textCtx) return null;
        return { canvas: this.textCanvas, ctx: this.textCtx };
    }

    /**
     * Draw text with word wrapping
     * 绘制带自动换行的文本
     */
    private drawWrappedText(
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        lineHeight: number
    ): void {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line.trim(), x, currentY);
                line = word + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }

        if (line.trim()) {
            ctx.fillText(line.trim(), x, currentY);
        }
    }

    /**
     * Clear text texture cache
     * 清除文本纹理缓存
     */
    clearTextCache(): void {
        this.textTextureCache.clear();
        this.pendingTextures.clear();
    }

    /**
     * Clear cache for a specific entity
     * 清除特定实体的缓存
     */
    clearEntityTextCache(entityId: number): void {
        this.textTextureCache.delete(entityId);
    }

    /**
     * Dispose resources
     * 释放资源
     */
    dispose(): void {
        this.textCanvas = null;
        this.textCtx = null;
        this.textTextureCache.clear();
        this.pendingTextures.clear();
        this.onTextureCreated = null;
        this.textureReadyChecker = null;
    }
}
