/**
 * UI Button Render System
 * UI 按钮渲染系统
 *
 * Renders UIButtonComponent entities by submitting render primitives
 * to the shared UIRenderCollector.
 * 通过向共享的 UIRenderCollector 提交渲染原语来渲染 UIButtonComponent 实体。
 */

import { EntitySystem, Matcher, Entity, ECSSystem } from '@esengine/ecs-framework';
import { UITransformComponent } from '../../components/UITransformComponent';
import { UIButtonComponent } from '../../components/widgets/UIButtonComponent';
import { UIRenderComponent, UIRenderType } from '../../components/UIRenderComponent';
import { UIInteractableComponent } from '../../components/UIInteractableComponent';
import { getUIRenderCollector } from './UIRenderCollector';
import { getUIRenderTransform, renderBorder, getNinePatchTopLeft } from './UIRenderUtils';

/**
 * UI Button Render System
 * UI 按钮渲染系统
 *
 * Handles rendering of button components including:
 * - Background color (with state-based color changes)
 * - Texture support (normal, hover, pressed, disabled)
 * - Combined color + texture mode
 *
 * 处理按钮组件的渲染，包括：
 * - 背景颜色（带状态变化的颜色）
 * - 纹理支持（正常、悬停、按下、禁用）
 * - 颜色 + 纹理组合模式
 *
 * Note: Button text is rendered by UITextRenderSystem if UITextComponent is present.
 * 注意：如果存在 UITextComponent，按钮文本由 UITextRenderSystem 渲染。
 */
@ECSSystem('UIButtonRender', { updateOrder: 113 })
export class UIButtonRenderSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(UITransformComponent, UIButtonComponent));
    }

    protected process(entities: readonly Entity[]): void {
        const collector = getUIRenderCollector();

        for (const entity of entities) {
            const transform = entity.getComponent(UITransformComponent);
            const button = entity.getComponent(UIButtonComponent);
            const render = entity.getComponent(UIRenderComponent);

            // 空值检查 | Null check
            if (!transform || !button) continue;

            // 使用工具函数获取渲染变换数据
            // Use utility function to get render transform data
            const rt = getUIRenderTransform(transform);
            if (!rt) continue;

            // Render texture if in texture or both mode
            // 如果在纹理或两者模式下，渲染纹理
            if (button.useTexture()) {
                // 根据交互状态获取正确的纹理
                // Get correct texture based on interaction state
                const interactable = entity.getComponent(UIInteractableComponent);
                const state = interactable?.getState() ?? 'normal';
                const textureGuid = button.getStateTextureGuid(state);

                if (textureGuid) {
                    // 检查是否需要使用九宫格渲染
                    // Check if nine-patch rendering is needed
                    const isNinePatch = render &&
                        render.type === UIRenderType.NinePatch &&
                        render.textureWidth > 0 &&
                        render.textureHeight > 0;

                    // 使用按钮的当前颜色作为纹理着色（Color Tint Transition）
                    // Use button's current color as texture tint (Color Tint Transition)
                    const textureTint = button.currentColor;

                    if (isNinePatch) {
                        // Nine-patch rendering for buttons (using utility)
                        // 按钮的九宫格渲染（使用工具函数）
                        const topLeft = getNinePatchTopLeft(rt);
                        collector.addNinePatch(
                            topLeft.x, topLeft.y,
                            rt.width, rt.height,
                            render.ninePatchMargins,
                            render.textureWidth,
                            render.textureHeight,
                            textureTint,
                            rt.alpha,
                            rt.sortingLayer,
                            rt.orderInLayer,
                            {
                                rotation: rt.rotation,
                                textureGuid,
                                entityId: entity.id
                            }
                        );
                    } else {
                        // Standard texture rendering
                        // 标准纹理渲染
                        collector.addRect(
                            rt.renderX, rt.renderY,
                            rt.width, rt.height,
                            textureTint,
                            rt.alpha,
                            rt.sortingLayer,
                            rt.orderInLayer,
                            {
                                rotation: rt.rotation,
                                pivotX: rt.pivotX,
                                pivotY: rt.pivotY,
                                textureGuid,
                                entityId: entity.id
                            }
                        );
                    }
                }
            }

            // Render color background if in color or both mode
            // 如果在颜色或两者模式下，渲染颜色背景
            if (button.useColor()) {
                const bgAlpha = render?.backgroundAlpha ?? 1;
                if (bgAlpha > 0) {
                    collector.addRect(
                        rt.renderX, rt.renderY,
                        rt.width, rt.height,
                        button.currentColor,
                        bgAlpha * rt.alpha,
                        rt.sortingLayer,
                        rt.orderInLayer + (button.useTexture() ? 1 : 0),
                        {
                            rotation: rt.rotation,
                            pivotX: rt.pivotX,
                            pivotY: rt.pivotY,
                            entityId: entity.id
                        }
                    );
                }
            }

            // Render border if UIRenderComponent has border (using utility)
            // 如果 UIRenderComponent 有边框，渲染边框（使用工具函数）
            if (render && render.borderWidth > 0 && render.borderAlpha > 0) {
                renderBorder(collector, rt, {
                    borderWidth: render.borderWidth,
                    borderColor: render.borderColor,
                    borderAlpha: render.borderAlpha
                }, entity.id, 2);
            }
        }
    }
}
