import type { IVector2 } from './Vector2';

/**
 * @zh 多边形工具函数
 * @en Polygon utility functions
 *
 * @zh 提供多边形顶点顺序检测、面积计算等实用函数
 * @en Provides polygon vertex order detection, area calculation and other utilities
 */
export class Polygon {
    /**
     * @zh 计算多边形的有符号面积（鞋带公式）
     * @en Calculate signed area of polygon (Shoelace formula)
     *
     * @zh 在标准坐标系（Y轴向上）中：
     * @en In standard coordinate system (Y-axis up):
     * - @zh 正值表示逆时针（CCW）顺序
     * - @en Positive value indicates counter-clockwise (CCW) order
     * - @zh 负值表示顺时针（CW）顺序
     * - @en Negative value indicates clockwise (CW) order
     *
     * @zh 在 Y 轴向下的坐标系中（如 Canvas），符号相反
     * @en In Y-axis down coordinate system (like Canvas), the sign is inverted
     *
     * @param vertices - @zh 多边形顶点数组 @en Array of polygon vertices
     * @returns @zh 有符号面积 @en Signed area
     *
     * @example
     * ```typescript
     * // CCW square in Y-up coords
     * const vertices = [
     *     { x: 0, y: 0 },
     *     { x: 1, y: 0 },
     *     { x: 1, y: 1 },
     *     { x: 0, y: 1 }
     * ];
     * const area = Polygon.signedArea(vertices); // > 0 (CCW)
     * ```
     */
    static signedArea(vertices: readonly IVector2[]): number {
        const n = vertices.length;
        if (n < 3) return 0;

        let area = 0;
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const vi = vertices[i]!;
            const vj = vertices[j]!;
            area += vi.x * vj.y;
            area -= vj.x * vi.y;
        }

        return area * 0.5;
    }

    /**
     * @zh 计算多边形的绝对面积
     * @en Calculate absolute area of polygon
     *
     * @param vertices - @zh 多边形顶点数组 @en Array of polygon vertices
     * @returns @zh 绝对面积 @en Absolute area
     */
    static area(vertices: readonly IVector2[]): number {
        return Math.abs(Polygon.signedArea(vertices));
    }

    /**
     * @zh 检查多边形顶点是否为逆时针（CCW）顺序
     * @en Check if polygon vertices are in counter-clockwise (CCW) order
     *
     * @zh 注意：这是基于标准数学坐标系（Y轴向上）
     * @en Note: This is based on standard math coordinate system (Y-axis up)
     *
     * @zh 在 Canvas/屏幕坐标系（Y轴向下）中，
     * @en In Canvas/screen coordinate system (Y-axis down),
     * @zh 视觉上的 CCW 实际上在数学上是 CW，反之亦然
     * @en visual CCW is actually mathematical CW, and vice versa
     *
     * @param vertices - @zh 多边形顶点数组 @en Array of polygon vertices
     * @param yAxisDown - @zh 是否使用 Y 轴向下的坐标系（默认 false）
     *                    @en Whether using Y-axis down coordinate system (default false)
     * @returns @zh 是否为 CCW 顺序 @en Whether in CCW order
     *
     * @example
     * ```typescript
     * // For standard Y-up coordinates (math, physics)
     * const isCCW = Polygon.isCCW(vertices);
     *
     * // For Y-down coordinates (Canvas, screen)
     * const isCCW = Polygon.isCCW(vertices, true);
     * ```
     */
    static isCCW(vertices: readonly IVector2[], yAxisDown: boolean = false): boolean {
        const area = Polygon.signedArea(vertices);
        return yAxisDown ? area < 0 : area > 0;
    }

    /**
     * @zh 检查多边形顶点是否为顺时针（CW）顺序
     * @en Check if polygon vertices are in clockwise (CW) order
     *
     * @param vertices - @zh 多边形顶点数组 @en Array of polygon vertices
     * @param yAxisDown - @zh 是否使用 Y 轴向下的坐标系（默认 false）
     *                    @en Whether using Y-axis down coordinate system (default false)
     * @returns @zh 是否为 CW 顺序 @en Whether in CW order
     */
    static isCW(vertices: readonly IVector2[], yAxisDown: boolean = false): boolean {
        return !Polygon.isCCW(vertices, yAxisDown);
    }

    /**
     * @zh 反转多边形顶点顺序
     * @en Reverse polygon vertex order
     *
     * @zh 将 CCW 转换为 CW，或将 CW 转换为 CCW
     * @en Converts CCW to CW, or CW to CCW
     *
     * @param vertices - @zh 多边形顶点数组 @en Array of polygon vertices
     * @returns @zh 反转后的新数组 @en New array with reversed order
     */
    static reverse<T extends IVector2>(vertices: readonly T[]): T[] {
        return [...vertices].reverse();
    }

    /**
     * @zh 原地反转多边形顶点顺序
     * @en Reverse polygon vertex order in place
     *
     * @param vertices - @zh 多边形顶点数组（会被修改）@en Array of polygon vertices (will be modified)
     */
    static reverseInPlace<T extends IVector2>(vertices: T[]): void {
        vertices.reverse();
    }

    /**
     * @zh 确保多边形顶点为逆时针（CCW）顺序
     * @en Ensure polygon vertices are in counter-clockwise (CCW) order
     *
     * @zh 如果顶点已经是 CCW 顺序，返回原数组的副本
     * @en If vertices are already in CCW order, returns a copy of the original array
     * @zh 如果是 CW 顺序，返回反转后的新数组
     * @en If in CW order, returns a new array with reversed order
     *
     * @param vertices - @zh 多边形顶点数组 @en Array of polygon vertices
     * @param yAxisDown - @zh 是否使用 Y 轴向下的坐标系（默认 false）
     *                    @en Whether using Y-axis down coordinate system (default false)
     * @returns @zh CCW 顺序的顶点数组 @en Array of vertices in CCW order
     *
     * @example
     * ```typescript
     * // For ORCA/RVO2 obstacle avoidance (Y-up math coordinates)
     * const ccwVertices = Polygon.ensureCCW(obstacle.vertices);
     *
     * // For Canvas rendering (Y-down screen coordinates)
     * const ccwVertices = Polygon.ensureCCW(obstacle.vertices, true);
     * ```
     */
    static ensureCCW<T extends IVector2>(vertices: readonly T[], yAxisDown: boolean = false): T[] {
        if (Polygon.isCCW(vertices, yAxisDown)) {
            return [...vertices];
        }
        return Polygon.reverse(vertices);
    }

    /**
     * @zh 确保多边形顶点为顺时针（CW）顺序
     * @en Ensure polygon vertices are in clockwise (CW) order
     *
     * @param vertices - @zh 多边形顶点数组 @en Array of polygon vertices
     * @param yAxisDown - @zh 是否使用 Y 轴向下的坐标系（默认 false）
     *                    @en Whether using Y-axis down coordinate system (default false)
     * @returns @zh CW 顺序的顶点数组 @en Array of vertices in CW order
     */
    static ensureCW<T extends IVector2>(vertices: readonly T[], yAxisDown: boolean = false): T[] {
        if (Polygon.isCW(vertices, yAxisDown)) {
            return [...vertices];
        }
        return Polygon.reverse(vertices);
    }

    /**
     * @zh 计算多边形的质心（重心）
     * @en Calculate polygon centroid (center of mass)
     *
     * @param vertices - @zh 多边形顶点数组 @en Array of polygon vertices
     * @returns @zh 质心坐标 @en Centroid coordinates
     */
    static centroid(vertices: readonly IVector2[]): IVector2 {
        const n = vertices.length;
        if (n === 0) return { x: 0, y: 0 };
        if (n === 1) return { x: vertices[0]!.x, y: vertices[0]!.y };
        if (n === 2) {
            return {
                x: (vertices[0]!.x + vertices[1]!.x) * 0.5,
                y: (vertices[0]!.y + vertices[1]!.y) * 0.5
            };
        }

        let cx = 0;
        let cy = 0;
        let signedArea = 0;

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const vi = vertices[i]!;
            const vj = vertices[j]!;
            const a = vi.x * vj.y - vj.x * vi.y;
            signedArea += a;
            cx += (vi.x + vj.x) * a;
            cy += (vi.y + vj.y) * a;
        }

        signedArea *= 0.5;
        const factor = 1 / (6 * signedArea);

        return {
            x: cx * factor,
            y: cy * factor
        };
    }

    /**
     * @zh 检查点是否在多边形内部（射线法）
     * @en Check if point is inside polygon (ray casting)
     *
     * @param point - @zh 要检查的点 @en Point to check
     * @param vertices - @zh 多边形顶点数组 @en Array of polygon vertices
     * @returns @zh 点是否在多边形内部 @en Whether point is inside polygon
     */
    static containsPoint(point: IVector2, vertices: readonly IVector2[]): boolean {
        const n = vertices.length;
        if (n < 3) return false;

        let inside = false;
        for (let i = 0, j = n - 1; i < n; j = i++) {
            const vi = vertices[i]!;
            const vj = vertices[j]!;

            if (((vi.y > point.y) !== (vj.y > point.y)) &&
                (point.x < (vj.x - vi.x) * (point.y - vi.y) / (vj.y - vi.y) + vi.x)) {
                inside = !inside;
            }
        }

        return inside;
    }

    /**
     * @zh 检查多边形是否为凸多边形
     * @en Check if polygon is convex
     *
     * @param vertices - @zh 多边形顶点数组 @en Array of polygon vertices
     * @returns @zh 是否为凸多边形 @en Whether polygon is convex
     */
    static isConvex(vertices: readonly IVector2[]): boolean {
        const n = vertices.length;
        if (n < 3) return false;
        if (n === 3) return true;

        let sign: number | null = null;

        for (let i = 0; i < n; i++) {
            const v0 = vertices[i]!;
            const v1 = vertices[(i + 1) % n]!;
            const v2 = vertices[(i + 2) % n]!;

            const dx1 = v1.x - v0.x;
            const dy1 = v1.y - v0.y;
            const dx2 = v2.x - v1.x;
            const dy2 = v2.y - v1.y;

            const cross = dx1 * dy2 - dy1 * dx2;

            if (Math.abs(cross) > 1e-10) {
                if (sign === null) {
                    sign = cross > 0 ? 1 : -1;
                } else if ((cross > 0 ? 1 : -1) !== sign) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * @zh 计算多边形的周长
     * @en Calculate polygon perimeter
     *
     * @param vertices - @zh 多边形顶点数组 @en Array of polygon vertices
     * @returns @zh 周长 @en Perimeter
     */
    static perimeter(vertices: readonly IVector2[]): number {
        const n = vertices.length;
        if (n < 2) return 0;

        let perimeter = 0;
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const vi = vertices[i]!;
            const vj = vertices[j]!;
            const dx = vj.x - vi.x;
            const dy = vj.y - vi.y;
            perimeter += Math.sqrt(dx * dx + dy * dy);
        }

        return perimeter;
    }

    /**
     * @zh 获取多边形的边界框
     * @en Get polygon bounding box
     *
     * @param vertices - @zh 多边形顶点数组 @en Array of polygon vertices
     * @returns @zh 边界框 { minX, minY, maxX, maxY } @en Bounding box
     */
    static bounds(vertices: readonly IVector2[]): { minX: number; minY: number; maxX: number; maxY: number } {
        if (vertices.length === 0) {
            return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const v of vertices) {
            if (v.x < minX) minX = v.x;
            if (v.y < minY) minY = v.y;
            if (v.x > maxX) maxX = v.x;
            if (v.y > maxY) maxY = v.y;
        }

        return { minX, minY, maxX, maxY };
    }
}
