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
import { getUIRenderCollector } from './UIRenderCollector';
import { ensureUIWidgetMarker, getUIRenderTransform, renderBorder } from './UIRenderUtils';

/**
 * UI InputField Render System
 * UI 输入框渲染系统
 *
 * Handles rendering of input field components including:
 * - Background rectangle
 * - Border (normal and focused state)
 * - Text or placeholder text
 * - Selection highlight
 * - Caret (blinking cursor)
 *
 * 处理输入框组件的渲染，包括：
 * - 背景矩形
 * - 边框（正常和聚焦状态）
 * - 文本或占位符文本
 * - 选中高亮
 * - 光标（闪烁）
 */
@ECSSystem('UIInputFieldRender', { updateOrder: 115, runInEditMode: true })
export class UIInputFieldRenderSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(UITransformComponent, UIInputFieldComponent));
    }

    protected process(entities: readonly Entity[]): void {
        const collector = getUIRenderCollector();

        for (const entity of entities) {
            const transform = entity.getComponent(UITransformComponent);
            const input = entity.getComponent(UIInputFieldComponent);

            // 空值检查 | Null check
            if (!transform || !input) continue;

            // 确保添加 UIWidgetMarker
            // Ensure UIWidgetMarker is added
            ensureUIWidgetMarker(entity);

            // 使用工具函数获取渲染变换数据
            // Use utility function to get render transform data
            const rt = getUIRenderTransform(transform);
            if (!rt) continue;

            const entityId = entity.id;

            // 1. 渲染背景
            // 1. Render background
            if (input.backgroundAlpha > 0) {
                const bgColor = input.disabled ? 0xEEEEEE : input.backgroundColor;
                collector.addRect(
                    rt.renderX, rt.renderY,
                    rt.width, rt.height,
                    bgColor,
                    input.backgroundAlpha * rt.alpha,
                    rt.sortingLayer,
                    rt.orderInLayer,
                    {
                        rotation: rt.rotation,
                        pivotX: rt.pivotX,
                        pivotY: rt.pivotY,
                        entityId
                    }
                );
            }

            // 2. 渲染边框
            // 2. Render border
            if (input.borderWidth > 0) {
                renderBorder(collector, rt, {
                    borderWidth: input.borderWidth,
                    borderColor: input.getCurrentBorderColor(),
                    borderAlpha: rt.alpha
                }, entityId, 1);
            }

            // 3. 计算文本区域
            // 3. Calculate text area
            const textX = rt.renderX - rt.width * rt.pivotX + input.padding;
            const textY = rt.renderY - rt.height * rt.pivotY + input.padding;
            const textWidth = rt.width - input.padding * 2;
            const textHeight = rt.height - input.padding * 2;

            // 4. 渲染选中高亮
            // 4. Render selection highlight
            if (input.focused && input.hasSelection()) {
                this.renderSelection(collector, input, rt, textX, textY, textHeight, entityId);
            }

            // 5. 渲染光标
            // 5. Render caret
            if (input.focused && input.caretVisible && !input.hasSelection()) {
                this.renderCaret(collector, input, rt, textX, textY, textHeight, entityId);
            }

            // Note: Text rendering is handled by UITextRenderSystem if UITextComponent is present
            // 注意：如果存在 UITextComponent，文本渲染由 UITextRenderSystem 处理
        }
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

        // 简化实现：假设等宽字体，每个字符宽度相同
        // Simplified: assume monospace, equal character width
        const charWidth = 8; // 需要从字体计算 | Should be calculated from font
        const start = Math.min(input.selectionStart, input.selectionEnd);
        const end = Math.max(input.selectionStart, input.selectionEnd);

        const selX = textX + start * charWidth - input.scrollOffset;
        const selWidth = (end - start) * charWidth;

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

        // 简化实现：假设等宽字体
        // Simplified: assume monospace
        const charWidth = 8; // 需要从字体计算 | Should be calculated from font
        const caretX = textX + input.caretPosition * charWidth - input.scrollOffset;

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
