/**
 * UI Toggle Render System
 * UI Toggle 渲染系统
 *
 * Renders UIToggleComponent as checkbox or switch.
 * 将 UIToggleComponent 渲染为复选框或开关。
 */

import { EntitySystem, Matcher, Entity, ECSSystem } from '@esengine/ecs-framework';
import { UITransformComponent } from '../../components/UITransformComponent';
import { UIToggleComponent } from '../../components/widgets/UIToggleComponent';
import { getUIRenderCollector } from './UIRenderCollector';
import { ensureUIWidgetMarker, getUIRenderTransform, lerpColor, type UIRenderTransform } from './UIRenderUtils';

/**
 * UI Toggle Render System
 * UI Toggle 渲染系统
 *
 * Handles rendering of toggle/checkbox/switch components.
 * 处理开关/复选框/切换组件的渲染。
 */
@ECSSystem('UIToggleRender', { updateOrder: 114, runInEditMode: true })
export class UIToggleRenderSystem extends EntitySystem {
    constructor() {
        // Match entities with both UITransformComponent and UIToggleComponent
        // 匹配具有 UITransformComponent 和 UIToggleComponent 的实体
        super(Matcher.empty().all(UITransformComponent, UIToggleComponent));
    }

    protected process(entities: readonly Entity[]): void {
        const collector = getUIRenderCollector();

        for (const entity of entities) {
            // Ensure entity has UIWidgetMarker for proper render system handling
            // 确保实体有 UIWidgetMarker 以便正确处理渲染系统
            ensureUIWidgetMarker(entity);

            const transform = entity.getComponent(UITransformComponent);
            const toggle = entity.getComponent(UIToggleComponent);

            if (!transform || !toggle) continue;

            // Get render transform data
            // 获取渲染变换数据
            const rt = getUIRenderTransform(transform);
            if (!rt) continue;

            // Render based on style
            // 根据样式渲染
            switch (toggle.style) {
                case 'checkbox':
                    this.renderCheckbox(collector, rt, toggle, entity.id);
                    break;
                case 'switch':
                    this.renderSwitch(collector, rt, toggle, entity.id);
                    break;
                case 'custom':
                    this.renderCustom(collector, rt, toggle, entity.id);
                    break;
            }
        }
    }

    /**
     * Render checkbox style toggle
     * 渲染复选框样式的开关
     */
    private renderCheckbox(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: UIRenderTransform,
        toggle: UIToggleComponent,
        entityId: number
    ): void {
        const size = toggle.checkboxSize;
        const bgColor = toggle.getCurrentBackgroundColor();
        const alpha = toggle.alpha * rt.alpha;

        // Calculate checkbox position (centered vertically in transform area)
        // 计算复选框位置（在变换区域内垂直居中）
        const boxX = rt.renderX;
        const boxY = rt.renderY + (rt.height - size) / 2 * (rt.pivotY * 2 - 1);

        // Render checkbox background/border
        // 渲染复选框背景/边框
        if (toggle.borderWidth > 0) {
            // Border (slightly larger)
            collector.addRect(
                boxX, boxY,
                size, size,
                toggle.borderColor,
                alpha,
                rt.sortingLayer,
                rt.orderInLayer,
                {
                    rotation: rt.rotation,
                    pivotX: rt.pivotX,
                    pivotY: rt.pivotY,
                    entityId
                }
            );

            // Inner background
            const innerSize = size - toggle.borderWidth * 2;
            collector.addRect(
                boxX, boxY,
                innerSize, innerSize,
                toggle.isOn ? toggle.onColor : toggle.offColor,
                alpha,
                rt.sortingLayer,
                rt.orderInLayer + 1,
                {
                    rotation: rt.rotation,
                    pivotX: rt.pivotX,
                    pivotY: rt.pivotY,
                    entityId
                }
            );
        } else {
            // Just background
            collector.addRect(
                boxX, boxY,
                size, size,
                bgColor,
                alpha,
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

        // Render checkmark if on
        // 如果开启则渲染勾选标记
        if (toggle.isOn || toggle.displayProgress > 0) {
            const checkAlpha = alpha * toggle.displayProgress;
            const checkSize = size * toggle.checkmarkRatio;

            if (toggle.checkmarkTextureGuid) {
                // Use texture for checkmark
                collector.addRect(
                    boxX, boxY,
                    checkSize, checkSize,
                    toggle.markColor,
                    checkAlpha,
                    rt.sortingLayer,
                    rt.orderInLayer + 2,
                    {
                        rotation: rt.rotation,
                        pivotX: rt.pivotX,
                        pivotY: rt.pivotY,
                        textureGuid: toggle.checkmarkTextureGuid,
                        entityId
                    }
                );
            } else {
                // Simple checkmark using two rotated rectangles
                // 使用两个旋转的矩形简单勾选标记
                const strokeWidth = Math.max(2, size * 0.15);
                const shortArm = checkSize * 0.4;
                const longArm = checkSize * 0.7;

                // Short arm (bottom-left to center)
                collector.addRect(
                    boxX - checkSize * 0.15, boxY - checkSize * 0.05,
                    shortArm, strokeWidth,
                    toggle.markColor,
                    checkAlpha,
                    rt.sortingLayer,
                    rt.orderInLayer + 2,
                    {
                        rotation: rt.rotation + Math.PI / 4, // 45 degrees
                        pivotX: 0,
                        pivotY: 0.5,
                        entityId
                    }
                );

                // Long arm (center to top-right)
                collector.addRect(
                    boxX + checkSize * 0.05, boxY + checkSize * 0.05,
                    longArm, strokeWidth,
                    toggle.markColor,
                    checkAlpha,
                    rt.sortingLayer,
                    rt.orderInLayer + 2,
                    {
                        rotation: rt.rotation - Math.PI / 4, // -45 degrees
                        pivotX: 0,
                        pivotY: 0.5,
                        entityId
                    }
                );
            }
        }
    }

    /**
     * Render switch style toggle
     * 渲染开关样式的开关
     */
    private renderSwitch(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: UIRenderTransform,
        toggle: UIToggleComponent,
        entityId: number
    ): void {
        const width = toggle.switchWidth;
        const height = toggle.switchHeight;
        const alpha = toggle.alpha * rt.alpha;

        // Calculate switch position (centered in transform area)
        // 计算开关位置（在变换区域内居中）
        const switchX = rt.renderX;
        const switchY = rt.renderY + (rt.height - height) / 2 * (rt.pivotY * 2 - 1);

        // Background color interpolation based on progress
        // 根据进度插值背景颜色
        const bgColor = lerpColor(toggle.offColor, toggle.onColor, toggle.displayProgress);

        // Render switch track (background)
        // 渲染开关轨道（背景）
        collector.addRect(
            switchX, switchY,
            width, height,
            toggle.disabled ? toggle.disabledColor : bgColor,
            alpha,
            rt.sortingLayer,
            rt.orderInLayer,
            {
                rotation: rt.rotation,
                pivotX: rt.pivotX,
                pivotY: rt.pivotY,
                entityId
            }
        );

        // Calculate knob position
        // 计算滑块位置
        const knobSize = toggle.getKnobSize();
        const knobTravel = width - knobSize - toggle.knobPadding * 2;
        const knobOffset = toggle.knobPadding + knobTravel * toggle.displayProgress;

        // Knob position relative to switch
        const knobX = switchX - width * rt.pivotX + knobOffset + knobSize / 2;
        const knobY = switchY;

        // Render knob
        // 渲染滑块
        collector.addRect(
            knobX, knobY,
            knobSize, knobSize,
            toggle.markColor,
            alpha,
            rt.sortingLayer,
            rt.orderInLayer + 1,
            {
                rotation: rt.rotation,
                pivotX: 0.5,
                pivotY: rt.pivotY,
                entityId
            }
        );
    }

    /**
     * Render custom style toggle (texture-based)
     * 渲染自定义样式的开关（基于纹理）
     */
    private renderCustom(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: UIRenderTransform,
        toggle: UIToggleComponent,
        entityId: number
    ): void {
        const alpha = toggle.alpha * rt.alpha;
        const textureGuid = toggle.getCurrentTextureGuid();

        if (textureGuid) {
            collector.addRect(
                rt.renderX, rt.renderY,
                rt.width, rt.height,
                toggle.disabled ? toggle.disabledColor : 0xFFFFFF,
                alpha,
                rt.sortingLayer,
                rt.orderInLayer,
                {
                    rotation: rt.rotation,
                    pivotX: rt.pivotX,
                    pivotY: rt.pivotY,
                    textureGuid,
                    entityId
                }
            );
        } else {
            // Fallback to checkbox style
            this.renderCheckbox(collector, rt, toggle, entityId);
        }
    }
}
