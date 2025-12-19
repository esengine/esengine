/**
 * UI InputField Render System
 * UI 输入框渲染系统
 *
 * Renders UIInputFieldComponent entities by submitting render primitives
 * to the shared UIRenderCollector.
 * 通过向共享的 UIRenderCollector 提交渲染原语来渲染 UIInputFieldComponent 实体。
 */

import { EntitySystem, Matcher, Entity, ECSSystem } from '@esengine/ecs-framework';
import { UITransformComponent } from '../../components/UITransformComponent';
import { UIInputFieldComponent } from '../../components/widgets/UIInputFieldComponent';
import { getUIRenderCollector, registerCacheInvalidationCallback, unregisterCacheInvalidationCallback } from './UIRenderCollector';
import { getUIRenderTransform } from './UIRenderUtils';

/**
 * Text texture cache entry
 * 文本纹理缓存条目
 */
interface InputTextCache {
    textureId: number;
    text: string;
    isPlaceholder: boolean;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    color: number;
    width: number;
    height: number;
    dataUrl: string;
}

/**
 * UI InputField Render System
 * UI 输入框渲染系统
 *
 * Handles rendering of input field components:
 * - Text / Placeholder display
 * - Selection highlight
 * - Caret (blinking cursor)
 *
 * Note: Background and border are rendered by UIRender/UIGraphic component.
 *
 * 处理输入框组件的渲染：
 * - 文本/占位符显示
 * - 选中高亮
 * - 光标（闪烁）
 *
 * 注意：背景和边框由 UIRender/UIGraphic 组件渲染。
 */
@ECSSystem('UIInputFieldRender', { updateOrder: 115, runInEditMode: true })
export class UIInputFieldRenderSystem extends EntitySystem {
    private textCanvas: HTMLCanvasElement | null = null;
    private textCtx: CanvasRenderingContext2D | null = null;
    private textTextureCache: Map<number, InputTextCache> = new Map();
    private nextTextureId = 91000; // Start from 91000 to avoid conflicts with UITextRenderSystem
    private onTextureCreated: ((id: number, dataUrl: string) => void) | null = null;
    private cacheInvalidationBound: () => void;
    /** 检查纹理是否已就绪的回调 | Callback to check if texture is ready */
    private textureReadyChecker: ((id: number) => boolean) | null = null;
    /** 待确认就绪的纹理 ID 集合 | Set of texture IDs pending ready confirmation */
    private pendingTextures: Set<number> = new Set();

    constructor() {
        super(Matcher.empty().all(UITransformComponent, UIInputFieldComponent));
        this.cacheInvalidationBound = this.clearTextCache.bind(this);
    }

    /**
     * Called when system is added to scene
     * 系统添加到场景时调用
     */
    public override initialize(): void {
        super.initialize();
        registerCacheInvalidationCallback(this.cacheInvalidationBound);
    }

    /**
     * Called when system is destroyed
     * 系统销毁时调用
     */
    protected override onDestroy(): void {
        super.onDestroy();
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
            const input = entity.getComponent(UIInputFieldComponent);

            // 空值检查 | Null check
            if (!transform || !input) continue;

            // 使用工具函数获取渲染变换数据
            // Use utility function to get render transform data
            const rt = getUIRenderTransform(transform);
            if (!rt) continue;

            const entityId = entity.id;

            // 注意：背景和边框由 UIRender/UIGraphic 组件渲染
            // Note: Background and border are rendered by UIRender/UIGraphic component

            // 1. 计算文本区域
            // 1. Calculate text area
            const textX = rt.renderX - rt.width * rt.pivotX + input.padding;
            const textY = rt.renderY - rt.height * rt.pivotY + input.padding;
            const textWidth = rt.width - input.padding * 2;
            const textHeight = rt.height - input.padding * 2;

            // 2. 渲染文本或占位符（在背景之上）
            // 2. Render text or placeholder (above background)
            this.renderText(collector, input, rt, textX, textY, textWidth, textHeight, entityId);

            // 3. 渲染选中高亮
            // 3. Render selection highlight
            if (input.focused && input.hasSelection()) {
                this.renderSelection(collector, input, rt, textX, textY, textHeight, entityId);
            }

            // 4. 渲染光标
            // 4. Render caret
            if (input.focused && input.caretVisible && !input.hasSelection()) {
                this.renderCaret(collector, input, rt, textX, textY, textHeight, entityId);
            }
        }
    }

    /**
     * 渲染文本或占位符
     * Render text or placeholder
     */
    private renderText(
        collector: ReturnType<typeof getUIRenderCollector>,
        input: UIInputFieldComponent,
        rt: ReturnType<typeof getUIRenderTransform>,
        textX: number,
        textY: number,
        textWidth: number,
        textHeight: number,
        entityId: number
    ): void {
        if (!rt) return;

        // 确定要显示的文本和颜色
        // Determine text to display and color
        const isPlaceholder = input.text.length === 0;
        const displayText = isPlaceholder ? input.placeholder : input.getDisplayText();

        // 如果没有文本可显示，跳过渲染
        // Skip rendering if no text to display
        if (!displayText) return;

        const color = isPlaceholder ? input.placeholderColor : input.textColor;

        // 生成或获取缓存的文本纹理
        // Generate or retrieve cached text texture
        const textureId = this.getOrCreateInputTextTexture(
            entityId,
            displayText,
            isPlaceholder,
            input,
            Math.ceil(textWidth),
            Math.ceil(textHeight),
            color
        );

        if (textureId === null) return;

        // 提交文本渲染原语（在背景之上）
        // Submit text render primitive (above background)
        collector.addRect(
            textX + textWidth / 2,  // 中心点 | Center point
            textY + textHeight / 2,
            textWidth,
            textHeight,
            0xFFFFFF,  // 白色着色（颜色已烘焙到纹理中） | White tint (color is baked into texture)
            rt.alpha,
            rt.sortingLayer,
            rt.orderInLayer + 1,  // 在背景之上 | Above background
            {
                pivotX: 0.5,
                pivotY: 0.5,
                textureId,
                entityId
            }
        );
    }

    /**
     * 获取或创建输入框文本纹理
     * Get or create input text texture
     */
    private getOrCreateInputTextTexture(
        entityId: number,
        text: string,
        isPlaceholder: boolean,
        input: UIInputFieldComponent,
        width: number,
        height: number,
        color: number
    ): number | null {
        const canvasData = this.getTextCanvas();
        if (!canvasData) return null;

        const { canvas, ctx } = canvasData;

        const cached = this.textTextureCache.get(entityId);

        // 检查是否需要重新生成纹理
        // Check if we need to regenerate the texture
        const needsUpdate = !cached ||
            cached.text !== text ||
            cached.isPlaceholder !== isPlaceholder ||
            cached.fontSize !== input.fontSize ||
            cached.fontFamily !== input.fontFamily ||
            cached.fontWeight !== input.fontWeight ||
            cached.color !== color ||
            cached.width !== width ||
            cached.height !== height;

        if (needsUpdate) {
            const canvasWidth = Math.max(1, width);
            const canvasHeight = Math.max(1, height);

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // 设置字体
            // Set font
            ctx.font = input.getCSSFont();

            // 转换颜色为 CSS 格式
            // Convert color to CSS format
            const r = (color >> 16) & 0xFF;
            const g = (color >> 8) & 0xFF;
            const b = color & 0xFF;
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';

            // 计算绘制位置（考虑滚动偏移）
            // Calculate draw position (considering scroll offset)
            const drawX = -input.scrollOffset;
            const drawY = canvasHeight / 2;

            // 绘制文本
            // Draw text
            ctx.fillText(text, drawX, drawY);

            // 获取或创建纹理 ID
            // Get or create texture ID
            const textureId = cached?.textureId ?? this.nextTextureId++;

            const dataUrl = canvas.toDataURL('image/png');

            // 通知回调新纹理
            // Notify callback of new texture
            if (this.onTextureCreated) {
                this.onTextureCreated(textureId, dataUrl);
                // 如果有就绪检查器，将新纹理添加到待确认列表
                // If ready checker is available, add new texture to pending list
                if (this.textureReadyChecker) {
                    this.pendingTextures.add(textureId);
                }
            }

            // 更新缓存
            // Update cache
            this.textTextureCache.set(entityId, {
                textureId,
                text,
                isPlaceholder,
                fontSize: input.fontSize,
                fontFamily: input.fontFamily,
                fontWeight: input.fontWeight,
                color,
                width,
                height,
                dataUrl
            });
        }

        return this.textTextureCache.get(entityId)?.textureId ?? null;
    }

    /**
     * 获取或创建文本画布
     * Get or create text canvas
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
     * 清除文本纹理缓存
     * Clear text texture cache
     */
    private clearTextCache(): void {
        this.textTextureCache.clear();
        this.pendingTextures.clear();
    }

    /**
     * 渲染选中高亮
     * Render selection highlight
     */
    private renderSelection(
        collector: ReturnType<typeof getUIRenderCollector>,
        input: UIInputFieldComponent,
        rt: ReturnType<typeof getUIRenderTransform>,
        textX: number,
        textY: number,
        textHeight: number,
        entityId: number
    ): void {
        if (!rt) return;

        const selRange = input.getSelectionXRange();
        const selX = textX + selRange.startX - input.scrollOffset;
        const selWidth = selRange.width;

        if (selWidth <= 0) return;

        collector.addRect(
            selX + selWidth / 2, // 中心点 | Center point
            textY + textHeight / 2,
            selWidth,
            textHeight,
            input.selectionColor,
            0.3 * rt.alpha,
            rt.sortingLayer,
            rt.orderInLayer + 2,
            {
                pivotX: 0.5,
                pivotY: 0.5,
                entityId
            }
        );
    }

    /**
     * 渲染光标
     * Render caret
     */
    private renderCaret(
        collector: ReturnType<typeof getUIRenderCollector>,
        input: UIInputFieldComponent,
        rt: ReturnType<typeof getUIRenderTransform>,
        textX: number,
        textY: number,
        textHeight: number,
        entityId: number
    ): void {
        if (!rt) return;

        const caretXOffset = input.getCaretX();
        const caretX = textX + caretXOffset - input.scrollOffset;

        collector.addRect(
            caretX + input.caretWidth / 2,
            textY + textHeight / 2,
            input.caretWidth,
            textHeight,
            input.caretColor,
            rt.alpha,
            rt.sortingLayer,
            rt.orderInLayer + 3,
            {
                pivotX: 0.5,
                pivotY: 0.5,
                entityId
            }
        );
    }
}
