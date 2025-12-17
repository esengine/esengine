/**
 * UI ScrollView Render System
 * UI 滚动视图渲染系统
 *
 * Renders UIScrollViewComponent entities by submitting render primitives
 * to the shared UIRenderCollector.
 * 通过向共享的 UIRenderCollector 提交渲染原语来渲染 UIScrollViewComponent 实体。
 */

import { EntitySystem, Matcher, Entity, ECSSystem } from '@esengine/ecs-framework';
import { UITransformComponent } from '../../components/UITransformComponent';
import { UIScrollViewComponent } from '../../components/widgets/UIScrollViewComponent';
import { getUIRenderCollector } from './UIRenderCollector';
import { getUIRenderTransform, type UIRenderTransform } from './UIRenderUtils';

/**
 * UI ScrollView Render System
 * UI 滚动视图渲染系统
 *
 * Handles rendering of scrollview components including:
 * - Vertical scrollbar track and handle
 * - Horizontal scrollbar track and handle
 * - Scrollbar hover states
 *
 * 处理滚动视图组件的渲染，包括：
 * - 垂直滚动条轨道和手柄
 * - 水平滚动条轨道和手柄
 * - 滚动条悬停状态
 *
 * Note: The scrollview content area and clipping is handled by the layout system.
 * 注意：滚动视图内容区域和裁剪由布局系统处理。
 */
@ECSSystem('UIScrollViewRender', { updateOrder: 112 })
export class UIScrollViewRenderSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(UITransformComponent, UIScrollViewComponent));
    }

    protected process(entities: readonly Entity[]): void {
        const collector = getUIRenderCollector();

        for (const entity of entities) {
            const transform = entity.getComponent(UITransformComponent);
            const scrollView = entity.getComponent(UIScrollViewComponent);

            // 空值检查 | Null check
            if (!transform || !scrollView) continue;

            // 使用工具函数获取渲染变换数据
            // Use utility function to get render transform data
            const rt = getUIRenderTransform(transform);
            if (!rt) continue;

            // 计算边界（左下角）
            // Calculate bounds (bottom-left corner)
            const baseX = rt.renderX - rt.width * rt.pivotX;
            const baseY = rt.renderY - rt.height * rt.pivotY;

            // Render vertical scrollbar
            // 渲染垂直滚动条
            if (scrollView.needsVerticalScrollbar(rt.height)) {
                this.renderVerticalScrollbar(collector, rt, baseX, baseY, scrollView, entity.id);
            }

            // Render horizontal scrollbar
            // 渲染水平滚动条
            if (scrollView.needsHorizontalScrollbar(rt.width)) {
                this.renderHorizontalScrollbar(collector, rt, baseX, baseY, scrollView, entity.id);
            }
        }
    }

    /**
     * Render vertical scrollbar
     * 渲染垂直滚动条
     */
    private renderVerticalScrollbar(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: UIRenderTransform,
        baseX: number,
        baseY: number,
        scrollView: UIScrollViewComponent,
        entityId: number
    ): void {
        const scrollbarWidth = scrollView.scrollbarWidth;
        const hasHorizontal = scrollView.needsHorizontalScrollbar(rt.width);
        const trackHeight = hasHorizontal ? rt.height - scrollbarWidth : rt.height;

        // Track position (right side of viewport)
        // 轨道位置（视口右侧）
        const trackX = baseX + rt.width - scrollbarWidth / 2;
        const trackY = baseY + trackHeight / 2;

        // Render track
        // 渲染轨道
        if (scrollView.scrollbarTrackAlpha > 0) {
            collector.addRect(
                trackX, trackY,
                scrollbarWidth, trackHeight,
                scrollView.scrollbarTrackColor,
                scrollView.scrollbarTrackAlpha * rt.alpha,
                rt.sortingLayer,
                rt.orderInLayer + 5,
                { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId }
            );
        }

        // Calculate handle metrics
        // 计算手柄尺寸
        const metrics = scrollView.getVerticalScrollbarMetrics(rt.height);
        const handleY = baseY + metrics.position + metrics.size / 2;

        // Handle alpha (different when hovered)
        // 手柄透明度（悬停时不同）
        const handleAlpha = scrollView.verticalScrollbarHovered
            ? scrollView.scrollbarHoverAlpha
            : scrollView.scrollbarAlpha;

        // Render handle
        // 渲染手柄
        collector.addRect(
            trackX, handleY,
            scrollbarWidth - 2, metrics.size,
            scrollView.scrollbarColor,
            handleAlpha * rt.alpha,
            rt.sortingLayer,
            rt.orderInLayer + 6,
            { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId }
        );
    }

    /**
     * Render horizontal scrollbar
     * 渲染水平滚动条
     */
    private renderHorizontalScrollbar(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: UIRenderTransform,
        baseX: number,
        baseY: number,
        scrollView: UIScrollViewComponent,
        entityId: number
    ): void {
        const scrollbarWidth = scrollView.scrollbarWidth;
        const hasVertical = scrollView.needsVerticalScrollbar(rt.height);
        const trackWidth = hasVertical ? rt.width - scrollbarWidth : rt.width;

        // Track position (bottom of viewport)
        // 轨道位置（视口底部）
        const trackX = baseX + trackWidth / 2;
        const trackY = baseY + rt.height - scrollbarWidth / 2;

        // Render track
        // 渲染轨道
        if (scrollView.scrollbarTrackAlpha > 0) {
            collector.addRect(
                trackX, trackY,
                trackWidth, scrollbarWidth,
                scrollView.scrollbarTrackColor,
                scrollView.scrollbarTrackAlpha * rt.alpha,
                rt.sortingLayer,
                rt.orderInLayer + 5,
                { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId }
            );
        }

        // Calculate handle metrics
        // 计算手柄尺寸
        const metrics = scrollView.getHorizontalScrollbarMetrics(rt.width);
        const handleX = baseX + metrics.position + metrics.size / 2;

        // Handle alpha (different when hovered)
        // 手柄透明度（悬停时不同）
        const handleAlpha = scrollView.horizontalScrollbarHovered
            ? scrollView.scrollbarHoverAlpha
            : scrollView.scrollbarAlpha;

        // Render handle
        // 渲染手柄
        collector.addRect(
            handleX, trackY,
            metrics.size, scrollbarWidth - 2,
            scrollView.scrollbarColor,
            handleAlpha * rt.alpha,
            rt.sortingLayer,
            rt.orderInLayer + 6,
            { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId }
        );
    }
}
