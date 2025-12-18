/**
 * UI Rect Render System
 * UI 矩形渲染系统
 *
 * Renders basic UIRenderComponent entities (those without specialized widget components)
 * by submitting render primitives to the shared UIRenderCollector.
 * 通过向共享的 UIRenderCollector 提交渲染原语来渲染基础 UIRenderComponent 实体
 * （没有专门 widget 组件的实体）。
 */

import { EntitySystem, Matcher, Entity, ECSSystem } from '@esengine/ecs-framework';
import { getTextureSpriteInfo, getGlobalAssetDatabase } from '@esengine/asset-system';
import { UITransformComponent } from '../../components/UITransformComponent';
import { UIRenderComponent } from '../../components/UIRenderComponent';
import { UIWidgetMarker } from '../../components/UIWidgetMarker';
import { getDynamicAtlasService } from '../../atlas/DynamicAtlasService';
import { getUIRenderCollector } from './UIRenderCollector';
import { getUIRenderTransform, renderBorder, renderShadow, getNinePatchPosition } from './UIRenderUtils';

/**
 * UI Rect Render System
 * UI 矩形渲染系统
 *
 * Handles rendering of basic UI elements with UIRenderComponent that don't have
 * specialized widget components (like buttons, progress bars, etc.).
 *
 * This is the "catch-all" renderer for simple rectangles, images, and panels.
 *
 * 处理具有 UIRenderComponent 但没有专门 widget 组件（如按钮、进度条等）的基础 UI 元素的渲染。
 * 这是简单矩形、图像和面板的"兜底"渲染器。
 */
@ECSSystem('UIRectRender', { updateOrder: 100, runInEditMode: true })
export class UIRectRenderSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(UITransformComponent, UIRenderComponent));
    }

    protected process(entities: readonly Entity[]): void {
        const collector = getUIRenderCollector();

        for (const entity of entities) {
            // Skip if entity has UIWidgetMarker (has specialized render system)
            // 如果实体有 UIWidgetMarker 标记（有专门的渲染系统），跳过
            if (entity.hasComponent(UIWidgetMarker)) {
                continue;
            }

            const transform = entity.getComponent(UITransformComponent);
            const render = entity.getComponent(UIRenderComponent);

            // 空值检查 - 组件可能在反序列化或初始化期间尚未就绪
            // Null check - component may not be ready during deserialization or initialization
            if (!transform || !render) continue;

            // 使用工具函数获取渲染变换数据
            // Use utility function to get render transform data
            const rt = getUIRenderTransform(transform);
            if (!rt) continue;

            // Render shadow if enabled (using utility)
            // 如果启用，渲染阴影（使用工具函数）
            if (render.shadowEnabled && render.shadowAlpha > 0) {
                renderShadow(collector, rt, {
                    offsetX: render.shadowOffsetX,
                    offsetY: render.shadowOffsetY,
                    blur: render.shadowBlur,
                    color: render.shadowColor,
                    alpha: render.shadowAlpha
                }, entity.id);
            }

            // Get material data from UIRenderComponent
            // 从 UIRenderComponent 获取材质数据
            const materialId = render.getMaterialId();
            const materialOverrides = render.hasOverrides() ? render.materialOverrides : undefined;

            // Render texture if present
            // 如果有纹理，渲染纹理
            if (render.textureGuid) {
                const textureGuid = typeof render.textureGuid === 'string' ? render.textureGuid : undefined;
                const textureId = typeof render.textureGuid === 'number' ? render.textureGuid : undefined;

                // Calculate effective alpha (backgroundAlpha affects texture too)
                // 计算有效透明度（backgroundAlpha 也影响纹理）
                const effectiveAlpha = render.backgroundAlpha * rt.alpha;

                // Try to get nine-patch info from texture's sprite settings
                // 尝试从纹理的 sprite 设置获取九宫格信息
                let ninePatchMargins: [number, number, number, number] | undefined;
                let textureWidth = 0;
                let textureHeight = 0;
                let isNinePatch = false;

                // Get texture path from AssetDatabase for atlas loading
                // 从 AssetDatabase 获取纹理路径用于图集加载
                let texturePath: string | undefined;
                if (textureGuid) {
                    const assetDb = getGlobalAssetDatabase();
                    const metadata = assetDb?.getMetadata(textureGuid);
                    texturePath = metadata?.path;

                    // Get sliceBorder from asset metadata
                    // 从资产元数据获取九宫格边距
                    const spriteInfo = getTextureSpriteInfo(textureGuid);
                    if (spriteInfo?.sliceBorder) {
                        ninePatchMargins = spriteInfo.sliceBorder;
                        isNinePatch = true;
                    }

                    // Get dimensions from DynamicAtlasService (primary source for UI textures)
                    // 从动态图集服务获取尺寸（UI 纹理的主要来源）
                    const atlasService = getDynamicAtlasService();
                    const atlasEntry = atlasService?.getAtlasEntry(textureGuid);
                    if (atlasEntry) {
                        textureWidth = atlasEntry.originalWidth;
                        textureHeight = atlasEntry.originalHeight;
                    }
                }

                // Handle nine-patch rendering
                // Skip if texture is placeholder (1x1) - means texture not yet loaded
                // 处理九宫格渲染
                // 如果纹理是占位符 (1x1) 则跳过 - 表示纹理尚未加载
                if (isNinePatch && ninePatchMargins && textureWidth > 1 && textureHeight > 1) {
                    // Use utility to get position and pivot for consistent rendering
                    // 使用工具函数获取位置和 pivot 以实现一致的渲染
                    const pos = getNinePatchPosition(rt);
                    collector.addNinePatch(
                        pos.x, pos.y,
                        rt.width, rt.height,
                        ninePatchMargins,
                        textureWidth,
                        textureHeight,
                        render.textureTint,
                        effectiveAlpha,
                        rt.sortingLayer,
                        rt.orderInLayer,
                        {
                            rotation: rt.rotation,
                            pivotX: pos.pivotX,
                            pivotY: pos.pivotY,
                            textureId,
                            textureGuid,
                            texturePath,
                            materialId,
                            materialOverrides,
                            entityId: entity.id
                        }
                    );
                } else {
                    // Standard image rendering
                    // 标准图像渲染
                    collector.addRect(
                        rt.renderX, rt.renderY,
                        rt.width, rt.height,
                        render.textureTint,
                        effectiveAlpha,
                        rt.sortingLayer,
                        rt.orderInLayer,
                        {
                            rotation: rt.rotation,
                            pivotX: rt.pivotX,
                            pivotY: rt.pivotY,
                            textureId,
                            textureGuid,
                            texturePath,
                            uv: render.textureUV
                                ? [render.textureUV.u0, render.textureUV.v0, render.textureUV.u1, render.textureUV.v1]
                                : undefined,
                            materialId,
                            materialOverrides,
                            entityId: entity.id
                        }
                    );
                }
            }
            // Render background color if fill is enabled
            // 如果启用填充，渲染背景颜色
            else if (render.fillBackground && render.backgroundAlpha > 0) {
                collector.addRect(
                    rt.renderX, rt.renderY,
                    rt.width, rt.height,
                    render.backgroundColor,
                    render.backgroundAlpha * rt.alpha,
                    rt.sortingLayer,
                    rt.orderInLayer,
                    {
                        rotation: rt.rotation,
                        pivotX: rt.pivotX,
                        pivotY: rt.pivotY,
                        materialId,
                        materialOverrides,
                        entityId: entity.id
                    }
                );
            }

            // Render border if present (using utility)
            // 如果有边框，渲染边框（使用工具函数）
            if (render.borderWidth > 0 && render.borderAlpha > 0) {
                renderBorder(collector, rt, {
                    borderWidth: render.borderWidth,
                    borderColor: render.borderColor,
                    borderAlpha: render.borderAlpha
                }, entity.id, 1); // Border renders above main content
            }
        }
    }
}
