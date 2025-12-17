/**
 * UI Graphic Render System
 * UI 图形渲染系统
 *
 * Renders entities with the new base components (UIGraphicComponent, UIImageComponent).
 * This system follows the new architecture pattern with clearer component separation.
 *
 * 渲染使用新基础组件（UIGraphicComponent、UIImageComponent）的实体。
 * 此系统遵循新架构模式，组件职责分离更清晰。
 */

import { EntitySystem, Matcher, Entity, ECSSystem } from '@esengine/ecs-framework';
import { UITransformComponent } from '../../components/UITransformComponent';
import { UIGraphicComponent } from '../../components/base/UIGraphicComponent';
import { UIImageComponent } from '../../components/base/UIImageComponent';
import { getUIRenderCollector } from './UIRenderCollector';
import { getUIRenderTransform, getNinePatchTopLeft, type UIRenderTransform } from './UIRenderUtils';

/**
 * UI Graphic Render System
 * UI 图形渲染系统
 *
 * Handles rendering of the new base graphic components:
 * - UIGraphicComponent: Base visual element (color rectangle)
 * - UIImageComponent: Texture display (simple, sliced, tiled, filled)
 *
 * 处理新基础图形组件的渲染：
 * - UIGraphicComponent：基础可视元素（颜色矩形）
 * - UIImageComponent：纹理显示（简单、切片、平铺、填充）
 */
@ECSSystem('UIGraphicRender', { updateOrder: 99 })
export class UIGraphicRenderSystem extends EntitySystem {
    constructor() {
        // Match entities with UITransformComponent and UIGraphicComponent
        // 匹配具有 UITransformComponent 和 UIGraphicComponent 的实体
        super(Matcher.empty().all(UITransformComponent, UIGraphicComponent));
    }

    protected process(entities: readonly Entity[]): void {
        const collector = getUIRenderCollector();

        for (const entity of entities) {
            const transform = entity.getComponent(UITransformComponent);
            const graphic = entity.getComponent(UIGraphicComponent);

            if (!transform || !graphic) continue;

            // Get render transform data
            // 获取渲染变换数据
            const rt = getUIRenderTransform(transform);
            if (!rt) continue;

            // Check if entity has UIImageComponent for texture rendering
            // 检查实体是否有 UIImageComponent 用于纹理渲染
            const image = entity.getComponent(UIImageComponent);

            if (image && image.hasTexture()) {
                this.renderImage(collector, rt, graphic, image, entity.id);
            } else {
                this.renderColorRect(collector, rt, graphic, entity.id);
            }

            // Mark graphic as rendered (clear dirty flag)
            // 标记图形已渲染（清除脏标记）
            graphic.clearDirty();
        }
    }

    /**
     * Render a color rectangle
     * 渲染颜色矩形
     */
    private renderColorRect(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: UIRenderTransform,
        graphic: UIGraphicComponent,
        entityId: number
    ): void {
        collector.addRect(
            rt.renderX, rt.renderY,
            rt.width, rt.height,
            graphic.color,
            graphic.alpha * rt.alpha,
            rt.sortingLayer,
            rt.orderInLayer,
            {
                rotation: rt.rotation,
                pivotX: rt.pivotX,
                pivotY: rt.pivotY,
                materialId: graphic.materialId > 0 ? graphic.materialId : undefined,
                entityId
            }
        );
    }

    /**
     * Render an image with various modes
     * 渲染各种模式的图像
     */
    private renderImage(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: UIRenderTransform,
        graphic: UIGraphicComponent,
        image: UIImageComponent,
        entityId: number
    ): void {
        const alpha = graphic.alpha * rt.alpha;
        const color = graphic.color;
        const materialId = graphic.materialId > 0 ? graphic.materialId : undefined;

        // Handle different image types
        // 处理不同的图像类型
        if (image.isSliced()) {
            // Nine-patch (sliced) rendering
            // 九宫格（切片）渲染
            const topLeft = getNinePatchTopLeft(rt);
            collector.addNinePatch(
                topLeft.x, topLeft.y,
                rt.width, rt.height,
                image.sliceBorder,
                image.textureWidth,
                image.textureHeight,
                color,
                alpha,
                rt.sortingLayer,
                rt.orderInLayer,
                {
                    rotation: rt.rotation,
                    textureGuid: image.textureGuid,
                    textureId: image.textureId,
                    materialId,
                    entityId
                }
            );
        } else if (image.isFilled()) {
            // Filled rendering (for progress bars, etc.)
            // 填充渲染（用于进度条等）
            this.renderFilledImage(collector, rt, graphic, image, entityId);
        } else {
            // Simple image rendering
            // 简单图像渲染
            collector.addRect(
                rt.renderX, rt.renderY,
                rt.width, rt.height,
                color,
                alpha,
                rt.sortingLayer,
                rt.orderInLayer,
                {
                    rotation: rt.rotation,
                    pivotX: rt.pivotX,
                    pivotY: rt.pivotY,
                    textureGuid: image.textureGuid,
                    textureId: image.textureId,
                    uv: image.uv,
                    materialId,
                    entityId
                }
            );
        }
    }

    /**
     * Render a filled image (horizontal/vertical fill)
     * 渲染填充图像（水平/垂直填充）
     */
    private renderFilledImage(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: UIRenderTransform,
        graphic: UIGraphicComponent,
        image: UIImageComponent,
        entityId: number
    ): void {
        const alpha = graphic.alpha * rt.alpha;
        const color = graphic.color;
        const materialId = graphic.materialId > 0 ? graphic.materialId : undefined;

        // Calculate filled dimensions based on fillAmount and fillMethod
        // 根据 fillAmount 和 fillMethod 计算填充尺寸
        let fillWidth = rt.width;
        let fillHeight = rt.height;
        let fillX = rt.renderX;
        let fillY = rt.renderY;
        let fillU0 = 0, fillV0 = 0, fillU1 = 1, fillV1 = 1;

        const fillAmount = Math.max(0, Math.min(1, image.fillAmount));

        switch (image.fillMethod) {
            case 'horizontal':
                if (image.fillOrigin === 'left' || image.fillOrigin === 'center') {
                    fillWidth = rt.width * fillAmount;
                    fillU1 = fillAmount;
                } else {
                    // Right origin
                    fillWidth = rt.width * fillAmount;
                    fillX = rt.renderX + rt.width * (1 - fillAmount) * (1 - rt.pivotX);
                    fillU0 = 1 - fillAmount;
                }
                break;

            case 'vertical':
                if (image.fillOrigin === 'bottom' || image.fillOrigin === 'center') {
                    fillHeight = rt.height * fillAmount;
                    fillV1 = fillAmount;
                } else {
                    // Top origin
                    fillHeight = rt.height * fillAmount;
                    fillY = rt.renderY + rt.height * (1 - fillAmount) * (1 - rt.pivotY);
                    fillV0 = 1 - fillAmount;
                }
                break;

            // Radial fill modes (simplified - render as simple rect for now)
            // 径向填充模式（简化 - 目前作为简单矩形渲染）
            case 'radial90':
            case 'radial180':
            case 'radial360':
                // TODO: Implement radial fill with custom shader or geometry
                break;
        }

        // Apply original UV mapping if present
        // 如果存在原始 UV 映射，应用它
        if (image.uv) {
            const [u0, v0, u1, v1] = image.uv;
            const uvWidth = u1 - u0;
            const uvHeight = v1 - v0;
            fillU0 = u0 + fillU0 * uvWidth;
            fillV0 = v0 + fillV0 * uvHeight;
            fillU1 = u0 + fillU1 * uvWidth;
            fillV1 = v0 + fillV1 * uvHeight;
        }

        collector.addRect(
            fillX, fillY,
            fillWidth, fillHeight,
            color,
            alpha,
            rt.sortingLayer,
            rt.orderInLayer,
            {
                rotation: rt.rotation,
                pivotX: rt.pivotX,
                pivotY: rt.pivotY,
                textureGuid: image.textureGuid,
                textureId: image.textureId,
                uv: [fillU0, fillV0, fillU1, fillV1],
                materialId,
                entityId
            }
        );
    }
}
