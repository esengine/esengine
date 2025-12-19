/**
 * UI ProgressBar Render System
 * UI 进度条渲染系统
 *
 * Renders UIProgressBarComponent entities by submitting render primitives
 * to the shared UIRenderCollector.
 * 通过向共享的 UIRenderCollector 提交渲染原语来渲染 UIProgressBarComponent 实体。
 */

import { EntitySystem, Matcher, Entity, ECSSystem } from '@esengine/ecs-framework';
import { UITransformComponent } from '../../components/UITransformComponent';
import { UIProgressBarComponent, UIProgressDirection } from '../../components/widgets/UIProgressBarComponent';
import { getUIRenderCollector } from './UIRenderCollector';
import { ensureUIWidgetMarker, getUIRenderTransform, renderBorder, lerpColor, type UIRenderTransform } from './UIRenderUtils';

/**
 * UI ProgressBar Render System
 * UI 进度条渲染系统
 *
 * Handles rendering of progress bar components including:
 * - Background rectangle
 * - Fill rectangle (based on progress value)
 * - Support for different directions (LTR, RTL, TTB, BTT)
 * - Segmented display
 *
 * 处理进度条组件的渲染，包括：
 * - 背景矩形
 * - 填充矩形（基于进度值）
 * - 支持不同方向（左到右、右到左、上到下、下到上）
 * - 分段显示
 */
@ECSSystem('UIProgressBarRender', { updateOrder: 110, runInEditMode: true })
export class UIProgressBarRenderSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(UITransformComponent, UIProgressBarComponent));
    }

    protected process(entities: readonly Entity[]): void {
        const collector = getUIRenderCollector();

        for (const entity of entities) {
            const transform = entity.getComponent(UITransformComponent);
            const progressBar = entity.getComponent(UIProgressBarComponent);

            // 空值检查 | Null check
            if (!transform || !progressBar) continue;

            // 确保添加 UIWidgetMarker
            // Ensure UIWidgetMarker is added
            ensureUIWidgetMarker(entity);

            // 使用工具函数获取渲染变换数据
            // Use utility function to get render transform data
            const rt = getUIRenderTransform(transform);
            if (!rt) continue;

            // Render background
            // 渲染背景
            if (progressBar.backgroundAlpha > 0) {
                collector.addRect(
                    rt.renderX, rt.renderY, rt.width, rt.height,
                    progressBar.backgroundColor,
                    progressBar.backgroundAlpha * rt.alpha,
                    rt.sortingLayer,
                    rt.orderInLayer,
                    {
                        rotation: rt.rotation,
                        pivotX: rt.pivotX,
                        pivotY: rt.pivotY,
                        entityId: entity.id
                    }
                );
            }

            // Render border (using utility)
            // 渲染边框（使用工具函数）
            if (progressBar.borderWidth > 0) {
                renderBorder(collector, rt, {
                    borderWidth: progressBar.borderWidth,
                    borderColor: progressBar.borderColor,
                    borderAlpha: 1
                }, entity.id, 2);
            }

            // Render fill
            // 渲染填充
            const progress = progressBar.getProgress();
            if (progress > 0 && progressBar.fillAlpha > 0) {
                if (progressBar.showSegments) {
                    this.renderSegmentedFill(collector, rt, progress, progressBar, entity.id);
                } else {
                    this.renderSolidFill(collector, rt, progress, progressBar, entity.id);
                }
            }
        }
    }

    /**
     * Render solid fill rectangle
     * 渲染实心填充矩形
     */
    private renderSolidFill(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: UIRenderTransform,
        progress: number,
        progressBar: UIProgressBarComponent,
        entityId: number
    ): void {
        // 计算进度条的边界（相对于 pivot 中心）
        const left = rt.renderX - rt.width * rt.pivotX;
        const bottom = rt.renderY - rt.height * rt.pivotY;

        let fillX: number;
        let fillY: number;
        let fillWidth = rt.width;
        let fillHeight = rt.height;

        // Calculate fill dimensions based on direction
        // 根据方向计算填充尺寸
        switch (progressBar.direction) {
            case UIProgressDirection.LeftToRight:
                fillWidth = rt.width * progress;
                fillX = left + fillWidth / 2;
                fillY = bottom + rt.height / 2;
                break;

            case UIProgressDirection.RightToLeft:
                fillWidth = rt.width * progress;
                fillX = left + rt.width - fillWidth / 2;
                fillY = bottom + rt.height / 2;
                break;

            case UIProgressDirection.BottomToTop:
                fillHeight = rt.height * progress;
                fillX = left + rt.width / 2;
                fillY = bottom + fillHeight / 2;
                break;

            case UIProgressDirection.TopToBottom:
                fillHeight = rt.height * progress;
                fillX = left + rt.width / 2;
                fillY = bottom + rt.height - fillHeight / 2;
                break;

            default:
                fillX = left + fillWidth / 2;
                fillY = bottom + rt.height / 2;
        }

        // Determine fill color (gradient or solid, using utility)
        // 确定填充颜色（渐变或实心，使用工具函数）
        let fillColor = progressBar.fillColor;
        if (progressBar.useGradient) {
            fillColor = lerpColor(
                progressBar.gradientStartColor,
                progressBar.gradientEndColor,
                progress
            );
        }

        collector.addRect(
            fillX, fillY, fillWidth, fillHeight,
            fillColor,
            progressBar.fillAlpha * rt.alpha,
            rt.sortingLayer,
            rt.orderInLayer + 1,
            {
                rotation: rt.rotation,
                pivotX: 0.5,
                pivotY: 0.5,
                entityId
            }
        );
    }

    /**
     * Render segmented fill
     * 渲染分段填充
     */
    private renderSegmentedFill(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: UIRenderTransform,
        progress: number,
        progressBar: UIProgressBarComponent,
        entityId: number
    ): void {
        const segments = progressBar.segments;
        const gap = progressBar.segmentGap;
        const filledSegments = Math.ceil(progress * segments);

        const isHorizontal = progressBar.direction === UIProgressDirection.LeftToRight ||
                            progressBar.direction === UIProgressDirection.RightToLeft;

        // 计算进度条的边界（相对于 pivot 中心）
        const left = rt.renderX - rt.width * rt.pivotX;
        const bottom = rt.renderY - rt.height * rt.pivotY;

        // Calculate segment dimensions
        // 计算段尺寸
        let segmentWidth: number;
        let segmentHeight: number;

        if (isHorizontal) {
            segmentWidth = (rt.width - gap * (segments - 1)) / segments;
            segmentHeight = rt.height;
        } else {
            segmentWidth = rt.width;
            segmentHeight = (rt.height - gap * (segments - 1)) / segments;
        }

        for (let i = 0; i < filledSegments && i < segments; i++) {
            let segCenterX: number;
            let segCenterY: number;

            // Calculate segment center position based on direction
            // 根据方向计算段中心位置
            switch (progressBar.direction) {
                case UIProgressDirection.LeftToRight:
                    segCenterX = left + i * (segmentWidth + gap) + segmentWidth / 2;
                    segCenterY = bottom + rt.height / 2;
                    break;

                case UIProgressDirection.RightToLeft:
                    segCenterX = left + rt.width - i * (segmentWidth + gap) - segmentWidth / 2;
                    segCenterY = bottom + rt.height / 2;
                    break;

                case UIProgressDirection.TopToBottom:
                    segCenterX = left + rt.width / 2;
                    segCenterY = bottom + rt.height - i * (segmentHeight + gap) - segmentHeight / 2;
                    break;

                case UIProgressDirection.BottomToTop:
                    segCenterX = left + rt.width / 2;
                    segCenterY = bottom + i * (segmentHeight + gap) + segmentHeight / 2;
                    break;

                default:
                    segCenterX = left + i * (segmentWidth + gap) + segmentWidth / 2;
                    segCenterY = bottom + rt.height / 2;
            }

            // Determine segment color (using utility)
            // 确定段颜色（使用工具函数）
            let segmentColor = progressBar.fillColor;
            if (progressBar.useGradient) {
                const t = segments > 1 ? i / (segments - 1) : 0;
                segmentColor = lerpColor(
                    progressBar.gradientStartColor,
                    progressBar.gradientEndColor,
                    t
                );
            }

            collector.addRect(
                segCenterX, segCenterY,
                segmentWidth,
                segmentHeight,
                segmentColor,
                progressBar.fillAlpha * rt.alpha,
                rt.sortingLayer,
                rt.orderInLayer + 1,
                {
                    rotation: rt.rotation,
                    pivotX: 0.5,
                    pivotY: 0.5,
                    entityId
                }
            );
        }
    }
}
