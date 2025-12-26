/**
 * Gizmo Hit Tester
 * Gizmo 命中测试器
 *
 * Implements hit testing algorithms for various gizmo types in TypeScript.
 * 在 TypeScript 端实现各种 Gizmo 类型的命中测试算法。
 */

import type {
    IGizmoRenderData,
    IRectGizmoData,
    ICircleGizmoData,
    ILineGizmoData,
    ICapsuleGizmoData
} from './IGizmoProvider';

/**
 * Gizmo Hit Tester
 * Gizmo 命中测试器
 *
 * Provides static methods for testing if a point intersects with various gizmo shapes.
 * 提供静态方法来测试点是否与各种 gizmo 形状相交。
 */
export class GizmoHitTester {
    /** Line hit tolerance in world units (adjusted by zoom) | 线条命中容差（世界单位，根据缩放调整） */
    private static readonly BASE_LINE_TOLERANCE = 8;

    /**
     * Test if point is inside a rect gizmo (considers rotation and origin)
     * 测试点是否在矩形 gizmo 内（考虑旋转和原点）
     *
     * @param worldX World X coordinate | 世界 X 坐标
     * @param worldY World Y coordinate | 世界 Y 坐标
     * @param rect Rect gizmo data | 矩形 gizmo 数据
     * @returns True if point is inside | 如果点在内部返回 true
     */
    static hitTestRect(worldX: number, worldY: number, rect: IRectGizmoData): boolean {
        const cx = rect.x;
        const cy = rect.y;
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        const rotation = rect.rotation || 0;

        // Transform point to rect's local coordinate system (inverse rotation)
        // 将点转换到矩形的本地坐标系（逆旋转）
        const cos = Math.cos(-rotation);
        const sin = Math.sin(-rotation);
        const dx = worldX - cx;
        const dy = worldY - cy;
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        // Adjust for origin offset
        // 根据原点偏移调整
        const originOffsetX = (rect.originX - 0.5) * rect.width;
        const originOffsetY = (rect.originY - 0.5) * rect.height;
        const adjustedX = localX + originOffsetX;
        const adjustedY = localY + originOffsetY;

        return adjustedX >= -halfW && adjustedX <= halfW &&
               adjustedY >= -halfH && adjustedY <= halfH;
    }

    /**
     * Test if point is inside a circle gizmo
     * 测试点是否在圆形 gizmo 内
     *
     * @param worldX World X coordinate | 世界 X 坐标
     * @param worldY World Y coordinate | 世界 Y 坐标
     * @param circle Circle gizmo data | 圆形 gizmo 数据
     * @returns True if point is inside | 如果点在内部返回 true
     */
    static hitTestCircle(worldX: number, worldY: number, circle: ICircleGizmoData): boolean {
        const dx = worldX - circle.x;
        const dy = worldY - circle.y;
        const distSq = dx * dx + dy * dy;
        return distSq <= circle.radius * circle.radius;
    }

    /**
     * Test if point is near a line gizmo
     * 测试点是否在线条 gizmo 附近
     *
     * @param worldX World X coordinate | 世界 X 坐标
     * @param worldY World Y coordinate | 世界 Y 坐标
     * @param line Line gizmo data | 线条 gizmo 数据
     * @param tolerance Hit tolerance in world units | 命中容差（世界单位）
     * @returns True if point is within tolerance of line | 如果点在线条容差范围内返回 true
     */
    static hitTestLine(worldX: number, worldY: number, line: ILineGizmoData, tolerance: number): boolean {
        const points = line.points;
        if (points.length < 2) return false;

        const count = line.closed ? points.length : points.length - 1;

        for (let i = 0; i < count; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];

            if (this.pointToSegmentDistance(worldX, worldY, p1.x, p1.y, p2.x, p2.y) <= tolerance) {
                return true;
            }
        }

        return false;
    }

    /**
     * Test if point is inside a capsule gizmo
     * 测试点是否在胶囊 gizmo 内
     *
     * @param worldX World X coordinate | 世界 X 坐标
     * @param worldY World Y coordinate | 世界 Y 坐标
     * @param capsule Capsule gizmo data | 胶囊 gizmo 数据
     * @returns True if point is inside | 如果点在内部返回 true
     */
    static hitTestCapsule(worldX: number, worldY: number, capsule: ICapsuleGizmoData): boolean {
        const cx = capsule.x;
        const cy = capsule.y;
        const rotation = capsule.rotation || 0;

        // Transform point to capsule's local coordinate system
        // 将点转换到胶囊的本地坐标系
        const cos = Math.cos(-rotation);
        const sin = Math.sin(-rotation);
        const dx = worldX - cx;
        const dy = worldY - cy;
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        // Capsule = two half-circles + middle rectangle
        // 胶囊 = 两个半圆 + 中间矩形
        const topCircleY = capsule.halfHeight;
        const bottomCircleY = -capsule.halfHeight;

        // Check if inside middle rectangle
        // 检查是否在中间矩形内
        if (Math.abs(localY) <= capsule.halfHeight && Math.abs(localX) <= capsule.radius) {
            return true;
        }

        // Check if inside top half-circle
        // 检查是否在上半圆内
        const distToTopSq = localX * localX + (localY - topCircleY) * (localY - topCircleY);
        if (distToTopSq <= capsule.radius * capsule.radius) {
            return true;
        }

        // Check if inside bottom half-circle
        // 检查是否在下半圆内
        const distToBottomSq = localX * localX + (localY - bottomCircleY) * (localY - bottomCircleY);
        if (distToBottomSq <= capsule.radius * capsule.radius) {
            return true;
        }

        return false;
    }

    /**
     * Generic hit test for any gizmo type
     * 通用命中测试，适用于任何 gizmo 类型
     *
     * @param worldX World X coordinate | 世界 X 坐标
     * @param worldY World Y coordinate | 世界 Y 坐标
     * @param gizmo Gizmo data | Gizmo 数据
     * @param zoom Current viewport zoom level | 当前视口缩放级别
     * @returns True if point hits the gizmo | 如果点命中 gizmo 返回 true
     */
    static hitTest(worldX: number, worldY: number, gizmo: IGizmoRenderData, zoom: number = 1): boolean {
        // Convert screen pixel tolerance to world units
        // 将屏幕像素容差转换为世界单位
        const lineTolerance = this.BASE_LINE_TOLERANCE / zoom;

        switch (gizmo.type) {
            case 'rect':
                return this.hitTestRect(worldX, worldY, gizmo);
            case 'circle':
                return this.hitTestCircle(worldX, worldY, gizmo);
            case 'line':
                return this.hitTestLine(worldX, worldY, gizmo, lineTolerance);
            case 'capsule':
                return this.hitTestCapsule(worldX, worldY, gizmo);
            case 'grid':
                // Grid typically doesn't need hit testing
                // 网格通常不需要命中测试
                return false;
            default:
                return false;
        }
    }

    /**
     * Calculate distance from point to line segment
     * 计算点到线段的距离
     *
     * @param px Point X | 点 X
     * @param py Point Y | 点 Y
     * @param x1 Segment start X | 线段起点 X
     * @param y1 Segment start Y | 线段起点 Y
     * @param x2 Segment end X | 线段终点 X
     * @param y2 Segment end Y | 线段终点 Y
     * @returns Distance from point to segment | 点到线段的距离
     */
    private static pointToSegmentDistance(
        px: number, py: number,
        x1: number, y1: number,
        x2: number, y2: number
    ): number {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSq = dx * dx + dy * dy;

        if (lengthSq === 0) {
            // Segment degenerates to a point
            // 线段退化为点
            return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
        }

        // Calculate projection parameter t
        // 计算投影参数 t
        let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
        t = Math.max(0, Math.min(1, t));

        // Nearest point on segment
        // 线段上最近的点
        const nearestX = x1 + t * dx;
        const nearestY = y1 + t * dy;

        return Math.sqrt((px - nearestX) * (px - nearestX) + (py - nearestY) * (py - nearestY));
    }

    /**
     * Get the center point of any gizmo
     * 获取任意 gizmo 的中心点
     *
     * @param gizmo Gizmo data | Gizmo 数据
     * @returns Center point { x, y } | 中心点 { x, y }
     */
    static getGizmoCenter(gizmo: IGizmoRenderData): { x: number; y: number } {
        switch (gizmo.type) {
            case 'rect':
            case 'circle':
            case 'capsule':
                return { x: gizmo.x, y: gizmo.y };
            case 'line':
                if (gizmo.points.length === 0) return { x: 0, y: 0 };
                const sumX = gizmo.points.reduce((sum, p) => sum + p.x, 0);
                const sumY = gizmo.points.reduce((sum, p) => sum + p.y, 0);
                return {
                    x: sumX / gizmo.points.length,
                    y: sumY / gizmo.points.length
                };
            case 'grid':
                return {
                    x: gizmo.x + gizmo.width / 2,
                    y: gizmo.y + gizmo.height / 2
                };
            default:
                return { x: 0, y: 0 };
        }
    }
}
