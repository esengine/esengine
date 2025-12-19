/**
 * UI Render Utilities
 * UI 渲染工具
 *
 * Shared utility functions for UI render systems to reduce code duplication.
 * 渲染系统共享的工具函数，减少代码重复。
 */

import type { Entity } from '@esengine/ecs-framework';
import { UITransformComponent } from '../../components/UITransformComponent';
import { UIWidgetMarker } from '../../components/UIWidgetMarker';
import type { UIRenderCollector } from './UIRenderCollector';

/**
 * Ensure entity has UIWidgetMarker component
 * 确保实体具有 UIWidgetMarker 组件
 *
 * Widget components add this marker to prevent UIRectRenderSystem from
 * rendering them, as they have their own specialized render systems.
 *
 * Widget 组件添加此标记以防止 UIRectRenderSystem 渲染它们，
 * 因为它们有自己专门的渲染系统。
 *
 * @param entity - Entity to check/mark
 */
export function ensureUIWidgetMarker(entity: Entity): void {
    if (!entity.hasComponent(UIWidgetMarker)) {
        entity.addComponent(new UIWidgetMarker());
    }
}

/**
 * Computed transform data for rendering
 * 用于渲染的计算后变换数据
 */
export interface UIRenderTransform {
    /** World X position (bottom-left corner) / 世界 X 坐标（左下角） */
    x: number;
    /** World Y position (bottom-left corner) / 世界 Y 坐标（左下角） */
    y: number;
    /** Computed width with scale / 计算后的宽度（含缩放） */
    width: number;
    /** Computed height with scale / 计算后的高度（含缩放） */
    height: number;
    /** World alpha / 世界透明度 */
    alpha: number;
    /** World rotation in radians / 世界旋转（弧度） */
    rotation: number;
    /** Pivot X (0-1) / X 轴锚点 (0-1) */
    pivotX: number;
    /** Pivot Y (0-1) / Y 轴锚点 (0-1) */
    pivotY: number;
    /** Sorting layer name / 排序层名称 */
    sortingLayer: string;
    /** Order within layer / 层内顺序 */
    orderInLayer: number;
    /** Render X position (pivot-adjusted) / 渲染 X 坐标（锚点调整后） */
    renderX: number;
    /** Render Y position (pivot-adjusted) / 渲染 Y 坐标（锚点调整后） */
    renderY: number;
}

/**
 * Extract render transform data from UITransformComponent
 * 从 UITransformComponent 提取渲染变换数据
 *
 * 使用 UILayoutSystem 计算的世界坐标。如果 layoutComputed = false，回退到本地坐标。
 * Uses world coordinates computed by UILayoutSystem. If layoutComputed = false, falls back to local coordinates.
 *
 * @param transform - UITransformComponent instance
 * @param _entity - Optional entity (unused, for API compatibility)
 * @returns Computed render transform, or null if not visible
 */
export function getUIRenderTransform(transform: UITransformComponent, _entity?: Entity): UIRenderTransform | null {
    // 如果布局还没计算，跳过渲染（等待 UILayoutSystem 计算 worldOrderInLayer）
    // Skip if layout not computed yet (wait for UILayoutSystem to calculate worldOrderInLayer)
    if (!transform.layoutComputed) return null;

    if (!transform.worldVisible) return null;

    // 使用 layoutComputed 判断是否使用世界坐标
    // Use layoutComputed to determine whether to use world coordinates
    const x = transform.layoutComputed ? transform.worldX : transform.x;
    const y = transform.layoutComputed ? transform.worldY : transform.y;
    const scaleX = transform.worldScaleX ?? transform.scaleX;
    const scaleY = transform.worldScaleY ?? transform.scaleY;
    const width = (transform.layoutComputed && transform.computedWidth > 0
        ? transform.computedWidth
        : transform.width) * scaleX;
    const height = (transform.layoutComputed && transform.computedHeight > 0
        ? transform.computedHeight
        : transform.height) * scaleY;
    const alpha = transform.worldAlpha ?? transform.alpha;
    // 角度转弧度 | Convert degrees to radians
    const rotationDegrees = transform.worldRotation ?? transform.rotation;
    const rotation = (rotationDegrees * Math.PI) / 180;
    const pivotX = transform.pivotX;
    const pivotY = transform.pivotY;
    // 使用继承自 Canvas 的排序层，如果没有则回退到组件本身的排序层
    // Use Canvas-inherited sorting layer, fallback to component's own sortingLayer
    const sortingLayer = transform.worldSortingLayer ?? transform.sortingLayer;
    const orderInLayer = transform.worldOrderInLayer;

    // Render position = bottom-left corner + pivot offset
    // 渲染位置 = 左下角 + 锚点偏移
    const renderX = x + width * pivotX;
    const renderY = y + height * pivotY;

    return {
        x,
        y,
        width,
        height,
        alpha,
        rotation,
        pivotX,
        pivotY,
        sortingLayer,
        orderInLayer,
        renderX,
        renderY
    };
}

/**
 * Border rendering options
 * 边框渲染选项
 */
export interface BorderRenderOptions {
    /** Border width in pixels / 边框宽度（像素） */
    borderWidth: number;
    /** Border color (0xRRGGBB) / 边框颜色 */
    borderColor: number;
    /** Border alpha (0-1) / 边框透明度 */
    borderAlpha: number;
}

/**
 * Render a rectangular border
 * 渲染矩形边框
 *
 * @param collector - UIRenderCollector instance
 * @param rt - Render transform data
 * @param options - Border options
 * @param entityId - Entity ID for debugging
 * @param orderOffset - Order in layer offset (default: 0)
 */
export function renderBorder(
    collector: UIRenderCollector,
    rt: UIRenderTransform,
    options: BorderRenderOptions,
    entityId: number,
    orderOffset: number = 0
): void {
    const { borderWidth, borderColor, borderAlpha } = options;
    if (borderWidth <= 0 || borderAlpha <= 0) return;

    const alpha = borderAlpha * rt.alpha;
    const orderInLayer = rt.orderInLayer + orderOffset;

    // Calculate rect boundaries relative to pivot center
    // 计算矩形边界（相对于 pivot 中心）
    const left = rt.renderX - rt.width * rt.pivotX;
    const bottom = rt.renderY - rt.height * rt.pivotY;
    const right = left + rt.width;
    const top = bottom + rt.height;
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    // Top border
    collector.addRect(
        centerX, top - borderWidth / 2,
        rt.width, borderWidth,
        borderColor, alpha, rt.sortingLayer, orderInLayer,
        { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId }
    );

    // Bottom border
    collector.addRect(
        centerX, bottom + borderWidth / 2,
        rt.width, borderWidth,
        borderColor, alpha, rt.sortingLayer, orderInLayer,
        { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId }
    );

    // Side borders (excluding corners)
    const sideBorderHeight = rt.height - borderWidth * 2;

    // Left border
    collector.addRect(
        left + borderWidth / 2, centerY,
        borderWidth, sideBorderHeight,
        borderColor, alpha, rt.sortingLayer, orderInLayer,
        { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId }
    );

    // Right border
    collector.addRect(
        right - borderWidth / 2, centerY,
        borderWidth, sideBorderHeight,
        borderColor, alpha, rt.sortingLayer, orderInLayer,
        { rotation: rt.rotation, pivotX: 0.5, pivotY: 0.5, entityId }
    );
}

/**
 * Shadow rendering options
 * 阴影渲染选项
 */
export interface ShadowRenderOptions {
    /** Shadow offset X / 阴影 X 偏移 */
    offsetX: number;
    /** Shadow offset Y / 阴影 Y 偏移 */
    offsetY: number;
    /** Shadow blur radius / 阴影模糊半径 */
    blur: number;
    /** Shadow color (0xRRGGBB) / 阴影颜色 */
    color: number;
    /** Shadow alpha (0-1) / 阴影透明度 */
    alpha: number;
}

/**
 * Render a shadow behind an element
 * 渲染元素后的阴影
 *
 * @param collector - UIRenderCollector instance
 * @param rt - Render transform data
 * @param options - Shadow options
 * @param entityId - Entity ID for debugging
 * @param orderOffset - Order in layer offset (default: -1 to render below)
 */
export function renderShadow(
    collector: UIRenderCollector,
    rt: UIRenderTransform,
    options: ShadowRenderOptions,
    entityId: number,
    orderOffset: number = -1
): void {
    if (options.alpha <= 0) return;

    collector.addRect(
        rt.renderX + options.offsetX,
        rt.renderY + options.offsetY,
        rt.width + options.blur * 2,
        rt.height + options.blur * 2,
        options.color,
        options.alpha * rt.alpha,
        rt.sortingLayer,
        rt.orderInLayer + orderOffset,
        {
            rotation: rt.rotation,
            pivotX: rt.pivotX,
            pivotY: rt.pivotY,
            entityId
        }
    );
}

/**
 * Color interpolation (linear)
 * 颜色线性插值
 *
 * @param from - Start color (0xRRGGBB)
 * @param to - End color (0xRRGGBB)
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated color
 */
export function lerpColor(from: number, to: number, t: number): number {
    const fromR = (from >> 16) & 0xFF;
    const fromG = (from >> 8) & 0xFF;
    const fromB = from & 0xFF;

    const toR = (to >> 16) & 0xFF;
    const toG = (to >> 8) & 0xFF;
    const toB = to & 0xFF;

    const r = Math.round(fromR + (toR - fromR) * t);
    const g = Math.round(fromG + (toG - fromG) * t);
    const b = Math.round(fromB + (toB - fromB) * t);

    return (r << 16) | (g << 8) | b;
}

/**
 * Pack color with alpha into ARGB format
 * 将颜色和透明度打包为 ARGB 格式
 *
 * @param color - Color (0xRRGGBB)
 * @param alpha - Alpha (0-1)
 * @returns Packed color (0xAARRGGBB)
 */
export function packColorWithAlpha(color: number, alpha: number): number {
    const a = Math.round(alpha * 255) & 0xFF;
    return (a << 24) | (color & 0xFFFFFF);
}

/**
 * Get nine-patch position and pivot for consistent rendering
 * 获取九宫格位置和 pivot 以实现一致的渲染
 *
 * NinePatch now uses the same coordinate system as regular rects:
 * - Position is the pivot point (same as renderX/renderY)
 * - Pivot values determine rotation center
 *
 * 九宫格现在使用与普通矩形相同的坐标系：
 * - 位置是 pivot 点（与 renderX/renderY 相同）
 * - pivot 值决定旋转中心
 *
 * @param rt - Render transform data
 * @returns Position and pivot for nine-patch rendering
 */
export function getNinePatchPosition(rt: UIRenderTransform): {
    x: number;
    y: number;
    pivotX: number;
    pivotY: number;
} {
    return {
        x: rt.renderX,
        y: rt.renderY,
        pivotX: rt.pivotX,
        pivotY: rt.pivotY
    };
}

