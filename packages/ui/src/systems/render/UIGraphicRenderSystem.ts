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
import { getUIRenderTransform, getNinePatchPosition, type UIRenderTransform } from './UIRenderUtils';
import { isValidTextureGuid, defaultUV } from '../../utils/UITextureUtils';

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
@ECSSystem('UIGraphicRender', { updateOrder: 102, runInEditMode: true })
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
            graphic.clearDirtyFlags();
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

        // Get validated texture GUID
        // 获取验证后的纹理 GUID
        const textureGuid = isValidTextureGuid(image.textureGuid) ? image.textureGuid : undefined;

        // Handle different image types
        // 处理不同的图像类型
        if (image.isSliced()) {
            // Nine-patch (sliced) rendering
            // 九宫格（切片）渲染
            const pos = getNinePatchPosition(rt);
            collector.addNinePatch(
                pos.x, pos.y,
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
                    pivotX: pos.pivotX,
                    pivotY: pos.pivotY,
                    textureGuid,
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
                    textureGuid,
                    textureId: image.textureId,
                    uv: image.uv ?? defaultUV(),
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
        const textureGuid = isValidTextureGuid(image.textureGuid) ? image.textureGuid : undefined;

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
                    fillY = rt.renderY + rt.height * (1 - fillAmount) * rt.pivotY;
                    fillV0 = 1 - fillAmount;
                }
                break;

            // Radial fill modes - approximate with multiple segments
            // 径向填充模式 - 使用多个分段近似
            case 'radial90':
            case 'radial180':
            case 'radial360':
                this.renderRadialFill(collector, rt, graphic, image, entityId);
                return; // Early return - radial fill handles its own rendering
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
                textureGuid,
                textureId: image.textureId,
                uv: [fillU0, fillV0, fillU1, fillV1],
                materialId,
                entityId
            }
        );
    }

    /**
     * Render radial fill using multiple quad segments
     * 使用多个矩形分段渲染径向填充
     *
     * This approximates a pie-shaped fill by rendering multiple narrow quads
     * that fan out from the center.
     * 通过渲染多个从中心扇形展开的窄矩形来近似饼形填充。
     */
    private renderRadialFill(
        collector: ReturnType<typeof getUIRenderCollector>,
        rt: UIRenderTransform,
        graphic: UIGraphicComponent,
        image: UIImageComponent,
        entityId: number
    ): void {
        const alpha = graphic.alpha * rt.alpha;
        const color = graphic.color;
        const materialId = graphic.materialId > 0 ? graphic.materialId : undefined;
        const textureGuid = isValidTextureGuid(image.textureGuid) ? image.textureGuid : undefined;
        const fillAmount = Math.max(0, Math.min(1, image.fillAmount));

        if (fillAmount <= 0) return;

        // Determine the total angle range based on fill method
        // 根据填充方法确定总角度范围
        let totalAngle: number;
        switch (image.fillMethod) {
            case 'radial90': totalAngle = Math.PI / 2; break;
            case 'radial180': totalAngle = Math.PI; break;
            case 'radial360': totalAngle = Math.PI * 2; break;
            default: return;
        }

        // Calculate fill angle
        // 计算填充角度
        const fillAngle = totalAngle * fillAmount;

        // Determine start angle based on origin
        // 根据起点确定起始角度
        let startAngle: number;
        switch (image.fillOrigin) {
            case 'top': startAngle = -Math.PI / 2; break;
            case 'right': startAngle = 0; break;
            case 'bottom': startAngle = Math.PI / 2; break;
            case 'left': startAngle = Math.PI; break;
            default: startAngle = -Math.PI / 2; break; // Default: top
        }

        // Direction: clockwise or counter-clockwise
        // 方向：顺时针或逆时针
        const direction = image.fillClockwise ? 1 : -1;

        // Calculate center and radius
        // 计算中心和半径
        const centerX = rt.x + rt.width / 2;
        const centerY = rt.y + rt.height / 2;
        const radiusX = rt.width / 2;
        const radiusY = rt.height / 2;

        // Number of segments for smooth appearance (more segments = smoother)
        // 分段数量（更多分段 = 更平滑）
        const numSegments = Math.max(4, Math.ceil(fillAngle * 16 / Math.PI));

        // Render segments as quads from center
        // 从中心渲染分段为矩形
        const angleStep = fillAngle / numSegments;

        for (let i = 0; i < numSegments; i++) {
            const angle1 = startAngle + direction * angleStep * i;
            const angle2 = startAngle + direction * angleStep * (i + 1);

            // Calculate quad corners
            // 计算矩形角点
            const cos1 = Math.cos(angle1);
            const sin1 = Math.sin(angle1);
            const cos2 = Math.cos(angle2);
            const sin2 = Math.sin(angle2);

            // For each segment, render a triangle-like quad
            // 对于每个分段，渲染一个类似三角形的矩形
            // We approximate by rendering a small rect at the outer edge
            // 我们通过在外边缘渲染一个小矩形来近似

            // Calculate midpoint of the arc segment
            // 计算弧段的中点
            const midAngle = (angle1 + angle2) / 2;
            const midCos = Math.cos(midAngle);
            const midSin = Math.sin(midAngle);

            // Segment width and position
            // 分段宽度和位置
            const segmentWidth = Math.abs(radiusX * (cos2 - cos1)) + Math.abs(radiusY * (sin2 - sin1));
            const segmentHeight = Math.sqrt(radiusX * radiusX + radiusY * radiusY);

            // Position at the midpoint direction from center
            // 从中心沿中点方向定位
            const segX = centerX + midCos * radiusX * 0.5;
            const segY = centerY + midSin * radiusY * 0.5;

            // Calculate UV for this segment
            // 计算此分段的 UV
            const u0 = 0.5 + midCos * 0.5 * fillAmount;
            const v0 = 0.5 + midSin * 0.5 * fillAmount;

            collector.addRect(
                segX, segY,
                Math.max(2, segmentWidth + 2), // Ensure minimum width with overlap
                segmentHeight * 0.55, // Slightly more than half to ensure coverage
                color,
                alpha,
                rt.sortingLayer,
                rt.orderInLayer,
                {
                    rotation: midAngle + Math.PI / 2, // Rotate to face outward
                    pivotX: 0.5,
                    pivotY: 0,
                    textureGuid,
                    textureId: image.textureId,
                    uv: [u0 - 0.1, v0 - 0.1, u0 + 0.1, v0 + 0.1],
                    materialId,
                    entityId
                }
            );
        }
    }
}
