/**
 * Gizmo Interaction Service
 * Gizmo 交互服务
 *
 * Manages gizmo hover detection, highlighting, and click selection.
 * 管理 Gizmo 的悬停检测、高亮显示和点击选择。
 */

import { Core } from '@esengine/ecs-framework';
import type { Entity, ComponentType } from '@esengine/ecs-framework';
import { GizmoHitTester } from '../Gizmos/GizmoHitTester';
import { GizmoRegistry } from '../Gizmos/GizmoRegistry';
import type { IGizmoRenderData, GizmoColor } from '../Gizmos/IGizmoProvider';

/**
 * Gizmo hit result
 * Gizmo 命中结果
 */
export interface GizmoHitResult {
    /** Hit gizmo data | 命中的 Gizmo 数据 */
    gizmo: IGizmoRenderData;
    /** Associated entity ID | 关联的实体 ID */
    entityId: number;
    /** Distance from hit point to gizmo center | 命中点到 Gizmo 中心的距离 */
    distance: number;
}

/**
 * Gizmo interaction service interface
 * Gizmo 交互服务接口
 */
export interface IGizmoInteractionService {
    /**
     * Get currently hovered entity ID
     * 获取当前悬停的实体 ID
     */
    getHoveredEntityId(): number | null;

    /**
     * Update mouse position and perform hit test
     * 更新鼠标位置并执行命中测试
     *
     * @param worldX World X coordinate | 世界 X 坐标
     * @param worldY World Y coordinate | 世界 Y 坐标
     * @param zoom Current viewport zoom level | 当前视口缩放级别
     */
    updateMousePosition(worldX: number, worldY: number, zoom: number): void;

    /**
     * Get highlight color for entity (applies hover effect if applicable)
     * 获取实体的高亮颜色（如果适用则应用悬停效果）
     *
     * @param entityId Entity ID | 实体 ID
     * @param baseColor Base gizmo color | 基础 Gizmo 颜色
     * @param isSelected Whether entity is selected | 实体是否被选中
     * @returns Adjusted color | 调整后的颜色
     */
    getHighlightColor(entityId: number, baseColor: GizmoColor, isSelected: boolean): GizmoColor;

    /**
     * Handle click at position, return hit entity ID
     * 处理位置点击，返回命中的实体 ID
     *
     * @param worldX World X coordinate | 世界 X 坐标
     * @param worldY World Y coordinate | 世界 Y 坐标
     * @param zoom Current viewport zoom level | 当前视口缩放级别
     * @returns Hit entity ID or null | 命中的实体 ID 或 null
     */
    handleClick(worldX: number, worldY: number, zoom: number): number | null;

    /**
     * Clear hover state
     * 清除悬停状态
     */
    clearHover(): void;
}

/**
 * Gizmo Interaction Service
 * Gizmo 交互服务
 *
 * Manages gizmo hover detection, highlighting, and click selection.
 * 管理 Gizmo 的悬停检测、高亮显示和点击选择。
 */
export class GizmoInteractionService implements IGizmoInteractionService {
    private hoveredEntityId: number | null = null;
    private hoveredGizmo: IGizmoRenderData | null = null;

    /** Hover color multiplier for RGB channels | 悬停时 RGB 通道的颜色倍增 */
    private static readonly HOVER_COLOR_MULTIPLIER = 1.3;
    /** Hover alpha boost | 悬停时 Alpha 增量 */
    private static readonly HOVER_ALPHA_BOOST = 0.3;

    // ===== Click cycling state | 点击循环状态 =====
    /** Last click position | 上次点击位置 */
    private lastClickPos: { x: number; y: number } | null = null;
    /** Last click time | 上次点击时间 */
    private lastClickTime: number = 0;
    /** All hit entities at current click position | 当前点击位置的所有命中实体 */
    private hitEntitiesAtClick: number[] = [];
    /** Current cycle index | 当前循环索引 */
    private cycleIndex: number = 0;
    /** Position tolerance for same-position detection | 判断相同位置的容差 */
    private static readonly CLICK_POSITION_TOLERANCE = 5;
    /** Time tolerance for cycling (ms) | 循环的时间容差（毫秒） */
    private static readonly CLICK_TIME_TOLERANCE = 1000;

    /**
     * Get currently hovered entity ID
     * 获取当前悬停的实体 ID
     */
    getHoveredEntityId(): number | null {
        return this.hoveredEntityId;
    }

    /**
     * Get currently hovered gizmo data
     * 获取当前悬停的 Gizmo 数据
     */
    getHoveredGizmo(): IGizmoRenderData | null {
        return this.hoveredGizmo;
    }

    /**
     * Update mouse position and perform hit test
     * 更新鼠标位置并执行命中测试
     */
    updateMousePosition(worldX: number, worldY: number, zoom: number): void {
        const scene = Core.scene;
        if (!scene) {
            this.hoveredEntityId = null;
            this.hoveredGizmo = null;
            return;
        }

        let closestHit: GizmoHitResult | null = null;
        let closestDistance = Infinity;

        // Iterate all entities and collect gizmo data for hit testing
        // 遍历所有实体，收集 gizmo 数据进行命中测试
        for (const entity of scene.entities.buffer) {
            // Skip entities without gizmo providers
            // 跳过没有 gizmo 提供者的实体
            if (!GizmoRegistry.hasAnyGizmoProvider(entity)) {
                continue;
            }

            for (const component of entity.components) {
                const componentType = component.constructor as ComponentType;
                if (!GizmoRegistry.hasProvider(componentType)) {
                    continue;
                }

                const gizmos = GizmoRegistry.getGizmoData(component, entity, false);
                for (const gizmo of gizmos) {
                    if (GizmoHitTester.hitTest(worldX, worldY, gizmo, zoom)) {
                        // Calculate distance to gizmo center for sorting
                        // 计算到 gizmo 中心的距离用于排序
                        const center = GizmoHitTester.getGizmoCenter(gizmo);
                        const distance = Math.sqrt(
                            (worldX - center.x) ** 2 + (worldY - center.y) ** 2
                        );

                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestHit = {
                                gizmo,
                                entityId: entity.id,
                                distance
                            };
                        }
                    }
                }
            }
        }

        this.hoveredEntityId = closestHit?.entityId ?? null;
        this.hoveredGizmo = closestHit?.gizmo ?? null;
    }

    /**
     * Get highlight color for entity
     * 获取实体的高亮颜色
     */
    getHighlightColor(entityId: number, baseColor: GizmoColor, isSelected: boolean): GizmoColor {
        const isHovered = entityId === this.hoveredEntityId;

        if (!isHovered) {
            return baseColor;
        }

        // Apply hover highlight: brighten color and increase alpha
        // 应用悬停高亮：提亮颜色并增加透明度
        return {
            r: Math.min(1, baseColor.r * GizmoInteractionService.HOVER_COLOR_MULTIPLIER),
            g: Math.min(1, baseColor.g * GizmoInteractionService.HOVER_COLOR_MULTIPLIER),
            b: Math.min(1, baseColor.b * GizmoInteractionService.HOVER_COLOR_MULTIPLIER),
            a: Math.min(1, baseColor.a + GizmoInteractionService.HOVER_ALPHA_BOOST)
        };
    }

    /**
     * Handle click at position, return hit entity ID
     * Supports cycling through overlapping entities on repeated clicks
     * 处理位置点击，返回命中的实体 ID
     * 支持重复点击时循环选择重叠的实体
     */
    handleClick(worldX: number, worldY: number, zoom: number): number | null {
        const now = Date.now();
        const isSamePosition = this.lastClickPos !== null &&
            Math.abs(worldX - this.lastClickPos.x) < GizmoInteractionService.CLICK_POSITION_TOLERANCE / zoom &&
            Math.abs(worldY - this.lastClickPos.y) < GizmoInteractionService.CLICK_POSITION_TOLERANCE / zoom;
        const isWithinTimeWindow = (now - this.lastClickTime) < GizmoInteractionService.CLICK_TIME_TOLERANCE;

        // If clicking at same position within time window, cycle to next entity
        // 如果在时间窗口内点击相同位置，循环到下一个实体
        if (isSamePosition && isWithinTimeWindow && this.hitEntitiesAtClick.length > 1) {
            this.cycleIndex = (this.cycleIndex + 1) % this.hitEntitiesAtClick.length;
            this.lastClickTime = now;
            const selectedId = this.hitEntitiesAtClick[this.cycleIndex];
            this.hoveredEntityId = selectedId;
            return selectedId;
        }

        // New position or timeout - collect all hit entities
        // 新位置或超时 - 收集所有命中的实体
        this.hitEntitiesAtClick = this.collectAllHitEntities(worldX, worldY, zoom);
        this.cycleIndex = 0;
        this.lastClickPos = { x: worldX, y: worldY };
        this.lastClickTime = now;

        if (this.hitEntitiesAtClick.length > 0) {
            const selectedId = this.hitEntitiesAtClick[0];
            this.hoveredEntityId = selectedId;
            return selectedId;
        }

        return null;
    }

    /**
     * Collect all entities hit at the given position, sorted by distance
     * 收集给定位置命中的所有实体，按距离排序
     */
    private collectAllHitEntities(worldX: number, worldY: number, zoom: number): number[] {
        const scene = Core.scene;
        if (!scene) return [];

        const hits: GizmoHitResult[] = [];

        for (const entity of scene.entities.buffer) {
            if (!GizmoRegistry.hasAnyGizmoProvider(entity)) {
                continue;
            }

            let entityHit = false;
            let minDistance = Infinity;

            for (const component of entity.components) {
                const componentType = component.constructor as ComponentType;
                if (!GizmoRegistry.hasProvider(componentType)) {
                    continue;
                }

                const gizmos = GizmoRegistry.getGizmoData(component, entity, false);
                for (const gizmo of gizmos) {
                    if (GizmoHitTester.hitTest(worldX, worldY, gizmo, zoom)) {
                        entityHit = true;
                        const center = GizmoHitTester.getGizmoCenter(gizmo);
                        const distance = Math.sqrt(
                            (worldX - center.x) ** 2 + (worldY - center.y) ** 2
                        );
                        minDistance = Math.min(minDistance, distance);
                    }
                }
            }

            if (entityHit) {
                hits.push({
                    gizmo: {} as IGizmoRenderData, // Not needed for sorting
                    entityId: entity.id,
                    distance: minDistance
                });
            }
        }

        // Sort by distance (closest first)
        // 按距离排序（最近的在前）
        hits.sort((a, b) => a.distance - b.distance);

        return hits.map(hit => hit.entityId);
    }

    /**
     * Clear hover state
     * 清除悬停状态
     */
    clearHover(): void {
        this.hoveredEntityId = null;
        this.hoveredGizmo = null;
    }
}
