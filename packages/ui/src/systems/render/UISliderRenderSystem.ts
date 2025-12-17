/**
 * UI Slider Render System
 * UI 滑块渲染系统
 *
 * Renders UISliderComponent entities by submitting render primitives
 * to the shared UIRenderCollector.
 * 通过向共享的 UIRenderCollector 提交渲染原语来渲染 UISliderComponent 实体。
 */

import { EntitySystem, Matcher, Entity, ECSSystem } from '@esengine/ecs-framework';
import { UITransformComponent } from '../../components/UITransformComponent';
import { UISliderComponent, UISliderOrientation } from '../../components/widgets/UISliderComponent';
import { UIWidgetMarker } from '../../components/UIWidgetMarker';
import { getUIRenderCollector } from './UIRenderCollector';
import { getUIRenderTransform, type UIRenderTransform } from './UIRenderUtils';

/**
 * UI Slider Render System
 * UI 滑块渲染系统
 *
 * Handles rendering of slider components including:
 * - Track (background bar)
 * - Fill (progress portion)
 * - Handle (draggable knob)
 * - Optional ticks
 *
 * 处理滑块组件的渲染，包括：
 * - 轨道（背景条）
 * - 填充（进度部分）
 * - 手柄（可拖动的旋钮）
 * - 可选刻度
 */
@ECSSystem('UISliderRender', { updateOrder: 111 })
export class UISliderRenderSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(UITransformComponent, UISliderComponent));
    }

    protected process(entities: readonly Entity[]): void {
        const collector = getUIRenderCollector();

        for (const entity of entities) {
            const transform = entity.getComponent(UITransformComponent);
            const slider = entity.getComponent(UISliderComponent);

            // 空值检查 | Null check
            if (!transform || !slider) continue;

            // 确保添加 UIWidgetMarker
            // Ensure UIWidgetMarker is added
            if (!entity.hasComponent(UIWidgetMarker)) {
                entity.addComponent(new UIWidgetMarker());
            }

            // 使用工具函数获取渲染变换数据
            // Use utility function to get render transform data
            const rt = getUIRenderTransform(transform);
            if (!rt) continue;

            const isHorizontal = slider.orientation === UISliderOrientation.Horizontal;
            const progress = slider.getProgress();

            // Calculate track dimensions
            // 计算轨道尺寸
            const trackLength = isHorizontal ? rt.width : rt.height;
            const trackThickness = slider.trackThickness;

            // Render track (using center position with pivot 0.5)
            // 渲染轨道（使用中心位置，pivot 0.5）
            if (slider.trackAlpha > 0) {
                collector.addRect(
                    rt.renderX, rt.renderY,
                    isHorizontal ? trackLength : trackThickness,
                    isHorizontal ? trackThickness : trackLength,
                    slider.trackColor,
                    slider.trackAlpha * rt.alpha,
                    rt.sortingLayer,
                    rt.orderInLayer,
                    { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId: entity.id }
                );
            }

            // Render fill
            // 渲染填充
            if (progress > 0 && slider.fillAlpha > 0) {
                const fillLength = trackLength * progress;

                if (isHorizontal) {
                    // Fill from left
                    const fillX = rt.renderX - trackLength / 2 + fillLength / 2;
                    collector.addRect(
                        fillX, rt.renderY,
                        fillLength, trackThickness,
                        slider.fillColor,
                        slider.fillAlpha * rt.alpha,
                        rt.sortingLayer,
                        rt.orderInLayer + 1,
                        { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId: entity.id }
                    );
                } else {
                    // Fill from bottom
                    const fillY = rt.renderY + trackLength / 2 - fillLength / 2;
                    collector.addRect(
                        rt.renderX, fillY,
                        trackThickness, fillLength,
                        slider.fillColor,
                        slider.fillAlpha * rt.alpha,
                        rt.sortingLayer,
                        rt.orderInLayer + 1,
                        { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId: entity.id }
                    );
                }
            }

            // Render ticks
            // 渲染刻度
            if (slider.showTicks && slider.tickCount > 0) {
                this.renderTicks(collector, rt, trackLength, trackThickness, slider, isHorizontal, entity.id);
            }

            // Render handle
            // 渲染手柄
            const handleColor = slider.getCurrentHandleColor();
            const handleX = isHorizontal
                ? rt.renderX - trackLength / 2 + trackLength * progress
                : rt.renderX;
            const handleY = isHorizontal
                ? rt.renderY
                : rt.renderY + trackLength / 2 - trackLength * progress;

            // Handle shadow (if enabled)
            // 手柄阴影（如果启用）
            if (slider.handleShadow) {
                collector.addRect(
                    handleX + 1, handleY + 2,
                    slider.handleWidth, slider.handleHeight,
                    0x000000,
                    0.3 * rt.alpha,
                    rt.sortingLayer,
                    rt.orderInLayer + 2,
                    { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId: entity.id }
                );
            }

            // Handle body
            // 手柄主体
            collector.addRect(
                handleX, handleY,
                slider.handleWidth, slider.handleHeight,
                handleColor,
                rt.alpha,
                rt.sortingLayer,
                rt.orderInLayer + 3,
                { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId: entity.id }
            );

            // Handle border (if any)
            // 手柄边框（如果有）
            if (slider.handleBorderWidth > 0) {
                this.renderHandleBorder(
                    collector,
                    handleX, handleY,
                    slider.handleWidth, slider.handleHeight,
                    slider.handleBorderWidth,
                    slider.handleBorderColor,
                    rt.alpha,
                    rt.sortingLayer,
                    rt.orderInLayer + 4,
                    rt.rotation,
                    entity.id
                );
            }
        }
    }

    /**
     * Render ticks along the slider track
     * 沿滑块轨道渲染刻度
     */
    private renderTicks(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: UIRenderTransform,
        trackLength: number,
        trackThickness: number,
        slider: UISliderComponent,
        isHorizontal: boolean,
        entityId: number
    ): void {
        const tickCount = slider.tickCount + 2; // Include start and end ticks
        const tickSize = slider.tickSize;

        for (let i = 0; i < tickCount; i++) {
            const t = i / (tickCount - 1);

            let tickX: number;
            let tickY: number;
            let tickWidth: number;
            let tickHeight: number;

            if (isHorizontal) {
                tickX = rt.renderX - trackLength / 2 + trackLength * t;
                tickY = rt.renderY + trackThickness / 2 + tickSize / 2 + 2;
                tickWidth = 2;
                tickHeight = tickSize;
            } else {
                tickX = rt.renderX + trackThickness / 2 + tickSize / 2 + 2;
                tickY = rt.renderY + trackLength / 2 - trackLength * t;
                tickWidth = tickSize;
                tickHeight = 2;
            }

            collector.addRect(
                tickX, tickY,
                tickWidth, tickHeight,
                slider.tickColor,
                rt.alpha,
                rt.sortingLayer,
                rt.orderInLayer,
                { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId }
            );
        }
    }

    /**
     * Render handle border
     * 渲染手柄边框
     */
    private renderHandleBorder(
        collector: ReturnType<typeof getUIRenderCollector>,
        x: number, y: number,
        width: number, height: number,
        borderWidth: number,
        borderColor: number,
        alpha: number,
        sortingLayer: string,
        orderInLayer: number,
        rotation: number,
        entityId: number
    ): void {
        const halfW = width / 2;
        const halfH = height / 2;
        const halfB = borderWidth / 2;

        // Top
        collector.addRect(
            x, y - halfH + halfB,
            width, borderWidth,
            borderColor, alpha, sortingLayer, orderInLayer,
            { rotation, pivotX: 0.5, pivotY: 0.5, entityId }
        );

        // Bottom
        collector.addRect(
            x, y + halfH - halfB,
            width, borderWidth,
            borderColor, alpha, sortingLayer, orderInLayer,
            { rotation, pivotX: 0.5, pivotY: 0.5, entityId }
        );

        // Left
        collector.addRect(
            x - halfW + halfB, y,
            borderWidth, height - borderWidth * 2,
            borderColor, alpha, sortingLayer, orderInLayer,
            { rotation, pivotX: 0.5, pivotY: 0.5, entityId }
        );

        // Right
        collector.addRect(
            x + halfW - halfB, y,
            borderWidth, height - borderWidth * 2,
            borderColor, alpha, sortingLayer, orderInLayer,
            { rotation, pivotX: 0.5, pivotY: 0.5, entityId }
        );
    }
}
