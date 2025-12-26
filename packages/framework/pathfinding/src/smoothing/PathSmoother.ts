/**
 * @zh 路径平滑算法
 * @en Path Smoothing Algorithms
 */

import type {
    IPathfindingMap,
    IPathSmoother,
    IPoint
} from '../core/IPathfinding';
import { createPoint } from '../core/IPathfinding';

// =============================================================================
// 视线检测 | Line of Sight
// =============================================================================

/**
 * @zh 使用 Bresenham 算法检测视线
 * @en Line of sight check using Bresenham algorithm
 */
export function bresenhamLineOfSight(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    map: IPathfindingMap
): boolean {
    // Round to grid coordinates
    let ix1 = Math.floor(x1);
    let iy1 = Math.floor(y1);
    const ix2 = Math.floor(x2);
    const iy2 = Math.floor(y2);

    const dx = Math.abs(ix2 - ix1);
    const dy = Math.abs(iy2 - iy1);

    const sx = ix1 < ix2 ? 1 : -1;
    const sy = iy1 < iy2 ? 1 : -1;

    let err = dx - dy;

    while (true) {
        if (!map.isWalkable(ix1, iy1)) {
            return false;
        }

        if (ix1 === ix2 && iy1 === iy2) {
            break;
        }

        const e2 = 2 * err;

        if (e2 > -dy) {
            err -= dy;
            ix1 += sx;
        }

        if (e2 < dx) {
            err += dx;
            iy1 += sy;
        }
    }

    return true;
}

/**
 * @zh 使用射线投射检测视线（更精确）
 * @en Line of sight check using ray casting (more precise)
 */
export function raycastLineOfSight(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    map: IPathfindingMap,
    stepSize: number = 0.5
): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
        return map.isWalkable(Math.floor(x1), Math.floor(y1));
    }

    const steps = Math.ceil(distance / stepSize);
    const stepX = dx / steps;
    const stepY = dy / steps;

    let x = x1;
    let y = y1;

    for (let i = 0; i <= steps; i++) {
        if (!map.isWalkable(Math.floor(x), Math.floor(y))) {
            return false;
        }
        x += stepX;
        y += stepY;
    }

    return true;
}

// =============================================================================
// 路径简化器（拐点移除）| Path Simplifier (Waypoint Removal)
// =============================================================================

/**
 * @zh 路径简化器 - 移除不必要的拐点
 * @en Path Simplifier - Removes unnecessary waypoints
 *
 * @zh 使用视线检测移除可以直接到达的中间点
 * @en Uses line of sight to remove intermediate points that can be reached directly
 */
export class LineOfSightSmoother implements IPathSmoother {
    private readonly lineOfSight: typeof bresenhamLineOfSight;

    constructor(lineOfSight: typeof bresenhamLineOfSight = bresenhamLineOfSight) {
        this.lineOfSight = lineOfSight;
    }

    smooth(path: readonly IPoint[], map: IPathfindingMap): IPoint[] {
        if (path.length <= 2) {
            return [...path];
        }

        const result: IPoint[] = [path[0]];
        let current = 0;

        while (current < path.length - 1) {
            // Find the furthest point we can see from current
            let furthest = current + 1;

            for (let i = path.length - 1; i > current + 1; i--) {
                if (this.lineOfSight(
                    path[current].x,
                    path[current].y,
                    path[i].x,
                    path[i].y,
                    map
                )) {
                    furthest = i;
                    break;
                }
            }

            result.push(path[furthest]);
            current = furthest;
        }

        return result;
    }
}

// =============================================================================
// 曲线平滑器 | Curve Smoother
// =============================================================================

/**
 * @zh Catmull-Rom 样条曲线平滑
 * @en Catmull-Rom spline smoothing
 */
export class CatmullRomSmoother implements IPathSmoother {
    private readonly segments: number;
    private readonly tension: number;

    /**
     * @param segments - @zh 每段之间的插值点数 @en Number of interpolation points per segment
     * @param tension - @zh 张力 (0-1) @en Tension (0-1)
     */
    constructor(segments: number = 5, tension: number = 0.5) {
        this.segments = segments;
        this.tension = tension;
    }

    smooth(path: readonly IPoint[], _map: IPathfindingMap): IPoint[] {
        if (path.length <= 2) {
            return [...path];
        }

        const result: IPoint[] = [];

        // Add phantom points at the ends
        const points = [
            path[0],
            ...path,
            path[path.length - 1]
        ];

        for (let i = 1; i < points.length - 2; i++) {
            const p0 = points[i - 1];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2];

            for (let j = 0; j < this.segments; j++) {
                const t = j / this.segments;
                const point = this.interpolate(p0, p1, p2, p3, t);
                result.push(point);
            }
        }

        // Add final point
        result.push(path[path.length - 1]);

        return result;
    }

    /**
     * @zh Catmull-Rom 插值
     * @en Catmull-Rom interpolation
     */
    private interpolate(
        p0: IPoint,
        p1: IPoint,
        p2: IPoint,
        p3: IPoint,
        t: number
    ): IPoint {
        const t2 = t * t;
        const t3 = t2 * t;

        const tension = this.tension;

        const x =
            0.5 *
            ((2 * p1.x) +
                (-p0.x + p2.x) * t * tension +
                (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 * tension +
                (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3 * tension);

        const y =
            0.5 *
            ((2 * p1.y) +
                (-p0.y + p2.y) * t * tension +
                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 * tension +
                (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3 * tension);

        return createPoint(x, y);
    }
}

// =============================================================================
// 组合平滑器 | Combined Smoother
// =============================================================================

/**
 * @zh 组合路径平滑器
 * @en Combined path smoother
 *
 * @zh 先简化路径，再用曲线平滑
 * @en First simplify path, then smooth with curves
 */
export class CombinedSmoother implements IPathSmoother {
    private readonly simplifier: LineOfSightSmoother;
    private readonly curveSmoother: CatmullRomSmoother;

    constructor(curveSegments: number = 5, tension: number = 0.5) {
        this.simplifier = new LineOfSightSmoother();
        this.curveSmoother = new CatmullRomSmoother(curveSegments, tension);
    }

    smooth(path: readonly IPoint[], map: IPathfindingMap): IPoint[] {
        // First simplify
        const simplified = this.simplifier.smooth(path, map);

        // Then curve smooth
        return this.curveSmoother.smooth(simplified, map);
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建视线平滑器
 * @en Create line of sight smoother
 */
export function createLineOfSightSmoother(
    lineOfSight?: typeof bresenhamLineOfSight
): LineOfSightSmoother {
    return new LineOfSightSmoother(lineOfSight);
}

/**
 * @zh 创建曲线平滑器
 * @en Create curve smoother
 */
export function createCatmullRomSmoother(
    segments?: number,
    tension?: number
): CatmullRomSmoother {
    return new CatmullRomSmoother(segments, tension);
}

/**
 * @zh 创建组合平滑器
 * @en Create combined smoother
 */
export function createCombinedSmoother(
    curveSegments?: number,
    tension?: number
): CombinedSmoother {
    return new CombinedSmoother(curveSegments, tension);
}
