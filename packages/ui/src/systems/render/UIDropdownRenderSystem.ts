/**
 * UI Dropdown Render System
 * UI 下拉菜单渲染系统
 *
 * Renders UIDropdownComponent entities by submitting render primitives
 * to the shared UIRenderCollector.
 * 通过向共享的 UIRenderCollector 提交渲染原语来渲染 UIDropdownComponent 实体。
 */

import { EntitySystem, Matcher, Entity, ECSSystem } from '@esengine/ecs-framework';
import { UITransformComponent } from '../../components/UITransformComponent';
import { UIDropdownComponent } from '../../components/widgets/UIDropdownComponent';
import { getUIRenderCollector } from './UIRenderCollector';
import { ensureUIWidgetMarker, getUIRenderTransform, renderBorder } from './UIRenderUtils';

/**
 * UI Dropdown Render System
 * UI 下拉菜单渲染系统
 *
 * Handles rendering of dropdown components including:
 * - Button background with current selection
 * - Dropdown arrow indicator
 * - Expanded option list (when open)
 * - Option hover states
 *
 * 处理下拉菜单组件的渲染，包括：
 * - 带当前选择的按钮背景
 * - 下拉箭头指示器
 * - 展开的选项列表（打开时）
 * - 选项悬停状态
 */
@ECSSystem('UIDropdownRender', { updateOrder: 116, runInEditMode: true })
export class UIDropdownRenderSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(UITransformComponent, UIDropdownComponent));
    }

    protected process(entities: readonly Entity[]): void {
        const collector = getUIRenderCollector();

        for (const entity of entities) {
            const transform = entity.getComponent(UITransformComponent);
            const dropdown = entity.getComponent(UIDropdownComponent);

            // 空值检查 | Null check
            if (!transform || !dropdown) continue;

            // 确保添加 UIWidgetMarker
            // Ensure UIWidgetMarker is added
            ensureUIWidgetMarker(entity);

            // 使用工具函数获取渲染变换数据
            // Use utility function to get render transform data
            const rt = getUIRenderTransform(transform);
            if (!rt) continue;

            const entityId = entity.id;

            // 1. 渲染按钮背景
            // 1. Render button background
            collector.addRect(
                rt.renderX, rt.renderY,
                rt.width, rt.height,
                dropdown.currentColor,
                rt.alpha,
                rt.sortingLayer,
                rt.orderInLayer,
                {
                    rotation: rt.rotation,
                    pivotX: rt.pivotX,
                    pivotY: rt.pivotY,
                    entityId
                }
            );

            // 2. 渲染边框
            // 2. Render border
            if (dropdown.borderWidth > 0) {
                renderBorder(collector, rt, {
                    borderWidth: dropdown.borderWidth,
                    borderColor: dropdown.borderColor,
                    borderAlpha: rt.alpha
                }, entityId, 1);
            }

            // 3. 渲染下拉箭头
            // 3. Render dropdown arrow
            this.renderArrow(collector, rt, dropdown, entityId);

            // 4. 如果打开，渲染下拉列表
            // 4. If open, render dropdown list
            if (dropdown.isOpen) {
                this.renderDropdownList(collector, rt, dropdown, entityId);
            }

            // Note: Text rendering is handled by UITextRenderSystem
            // 注意：文本渲染由 UITextRenderSystem 处理
        }
    }

    /**
     * 渲染下拉箭头
     * Render dropdown arrow
     */
    private renderArrow(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: NonNullable<ReturnType<typeof getUIRenderTransform>>,
        dropdown: UIDropdownComponent,
        entityId: number
    ): void {
        const arrowSize = 8;
        const arrowX = rt.renderX + rt.width * (1 - rt.pivotX) - dropdown.padding - arrowSize / 2;
        const arrowY = rt.renderY + rt.height * (0.5 - rt.pivotY);

        // 简化的箭头渲染（使用小矩形模拟）
        // Simplified arrow rendering (using small rectangles)
        // 向下箭头由两条斜线组成
        // Down arrow made of two lines

        // 左斜线 | Left line
        collector.addRect(
            arrowX - 2, arrowY,
            arrowSize * 0.7, 2,
            dropdown.arrowColor,
            rt.alpha,
            rt.sortingLayer,
            rt.orderInLayer + 2,
            {
                rotation: dropdown.isOpen ? -0.785 : 0.785, // 45 degrees
                pivotX: 0,
                pivotY: 0.5,
                entityId
            }
        );

        // 右斜线 | Right line
        collector.addRect(
            arrowX + 2, arrowY,
            arrowSize * 0.7, 2,
            dropdown.arrowColor,
            rt.alpha,
            rt.sortingLayer,
            rt.orderInLayer + 2,
            {
                rotation: dropdown.isOpen ? 0.785 : -0.785, // -45 degrees
                pivotX: 1,
                pivotY: 0.5,
                entityId
            }
        );
    }

    /**
     * 渲染下拉列表
     * Render dropdown list
     */
    private renderDropdownList(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: NonNullable<ReturnType<typeof getUIRenderTransform>>,
        dropdown: UIDropdownComponent,
        entityId: number
    ): void {
        const listHeight = dropdown.getListHeight();
        const listY = rt.renderY - rt.height * rt.pivotY - listHeight;

        // 列表背景
        // List background
        collector.addRect(
            rt.renderX, listY + listHeight / 2,
            rt.width, listHeight,
            dropdown.listBackgroundColor,
            rt.alpha,
            rt.sortingLayer,
            rt.orderInLayer + 10,
            {
                pivotX: rt.pivotX,
                pivotY: 0.5,
                entityId
            }
        );

        // 列表边框
        // List border
        if (dropdown.borderWidth > 0) {
            const listRt = {
                ...rt,
                renderX: rt.renderX,
                renderY: listY + listHeight / 2,
                height: listHeight,
                pivotY: 0.5
            };
            renderBorder(collector, listRt as typeof rt, {
                borderWidth: dropdown.borderWidth,
                borderColor: dropdown.borderColor,
                borderAlpha: rt.alpha
            }, entityId, 11);
        }

        // 渲染可见选项
        // Render visible options
        const visibleCount = Math.min(dropdown.options.length, dropdown.maxVisibleOptions);
        const startIndex = Math.floor(dropdown.scrollOffset / dropdown.optionHeight);

        for (let i = 0; i < visibleCount; i++) {
            const optionIndex = startIndex + i;
            if (optionIndex >= dropdown.options.length) break;

            const option = dropdown.options[optionIndex];
            const optionY = listY + listHeight - (i + 0.5) * dropdown.optionHeight;

            // 选项背景色
            // Option background color
            let bgColor = dropdown.listBackgroundColor;
            if (optionIndex === dropdown.selectedIndex) {
                bgColor = dropdown.selectedOptionColor;
            } else if (optionIndex === dropdown.hoveredOptionIndex) {
                bgColor = dropdown.optionHoverColor;
            }

            if (bgColor !== dropdown.listBackgroundColor) {
                collector.addRect(
                    rt.renderX, optionY,
                    rt.width - dropdown.borderWidth * 2, dropdown.optionHeight,
                    bgColor,
                    rt.alpha,
                    rt.sortingLayer,
                    rt.orderInLayer + 12,
                    {
                        pivotX: rt.pivotX,
                        pivotY: 0.5,
                        entityId
                    }
                );
            }

            // Note: Option text is rendered by UITextRenderSystem
            // 注意：选项文本由 UITextRenderSystem 渲染
        }
    }
}
