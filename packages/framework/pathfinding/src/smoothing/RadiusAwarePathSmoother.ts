/**
 * @zh 半径感知路径平滑器
 * @en Radius-Aware Path Smoother
 *
 * @zh 通用的路径后处理器，确保路径与障碍物保持安全距离
 * @en Generic path post-processor that ensures paths maintain safe distance from obstacles
 */

import type { IPathfindingMap, IPathSmoother, IPoint } from '../core/IPathfinding';
import { createPoint } from '../core/IPathfinding';

// =============================================================================
// 配置 | Configuration
// =============================================================================

/**
 * @zh 半径感知平滑器配置
 * @en Radius-aware smoother configuration
 */
export interface IRadiusAwareSmootherConfig {
    /**
     * @zh 代理半径
     * @en Agent radius
     */
    agentRadius: number;

    /**
     * @zh 额外安全边距
     * @en Extra safety margin
     * @default 0.1
     */
    safetyMargin?: number;

    /**
     * @zh 采样方向数量（用于检测周围障碍物）
     * @en Number of sample directions (for detecting nearby obstacles)
     * @default 8
     */
    sampleDirections?: number;

    /**
     * @zh 最大偏移尝试次数
     * @en Maximum offset attempts
     * @default 8
     */
    maxOffsetAttempts?: number;

    /**
     * @zh 是否处理拐点（角落）
     * @en Whether to process turning points (corners)
     * @default true
     */
    processCorners?: boolean;
}

/**
 * @zh 默认配置
 * @en Default configuration
 */
const DEFAULT_CONFIG: Required<Omit<IRadiusAwareSmootherConfig, 'agentRadius'>> = {
    safetyMargin: 0.1,
    sampleDirections: 8,
    maxOffsetAttempts: 8,
    processCorners: true
};

// =============================================================================
// 半径感知路径平滑器 | Radius-Aware Path Smoother
// =============================================================================

/**
 * @zh 半径感知路径平滑器
 * @en Radius-Aware Path Smoother
 *
 * @zh 对任意寻路算法输出的路径进行后处理，确保路径点与障碍物保持足够距离
 * @en Post-processes paths from any pathfinding algorithm to ensure path points maintain sufficient distance from obstacles
 *
 * @example
 * ```typescript
 * // 创建平滑器
 * const smoother = new RadiusAwarePathSmoother({ agentRadius: 0.5 });
 *
 * // 处理路径
 * const safePath = smoother.smooth(rawPath, map);
 *
 * // 与其他平滑器组合使用
 * const combined = new CombinedRadiusAwareSmoother(
 *     new LineOfSightSmoother(),
 *     { agentRadius: 0.5 }
 * );
 * ```
 */
export class RadiusAwarePathSmoother implements IPathSmoother {
    private readonly config: Required<IRadiusAwareSmootherConfig>;
    private readonly sampleAngles: number[];

    constructor(config: IRadiusAwareSmootherConfig) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...config
        };

        // 预计算采样角度
        this.sampleAngles = [];
        const step = (Math.PI * 2) / this.config.sampleDirections;
        for (let i = 0; i < this.config.sampleDirections; i++) {
            this.sampleAngles.push(i * step);
        }
    }

    /**
     * @zh 平滑路径，确保与障碍物保持安全距离
     * @en Smooth path, ensuring safe distance from obstacles
     *
     * @param path - @zh 原始路径 @en Original path
     * @param map - @zh 地图 @en Map
     * @returns @zh 处理后的安全路径 @en Processed safe path
     */
    smooth(path: readonly IPoint[], map: IPathfindingMap): IPoint[] {
        if (path.length <= 1) {
            return [...path];
        }

        const result: IPoint[] = [];
        const clearance = this.config.agentRadius + this.config.safetyMargin;

        for (let i = 0; i < path.length; i++) {
            const point = path[i]!;
            const isCorner = this.config.processCorners && i > 0 && i < path.length - 1;

            let safePoint: IPoint;

            if (isCorner) {
                // 处理拐点
                const prev = path[i - 1]!;
                const next = path[i + 1]!;
                safePoint = this.offsetCornerPoint(point, prev, next, clearance, map);
            } else {
                // 处理普通点
                safePoint = this.offsetPointFromObstacles(point, clearance, map);
            }

            result.push(safePoint);
        }

        return result;
    }

    /**
     * @zh 将点从障碍物偏移
     * @en Offset point away from obstacles
     */
    private offsetPointFromObstacles(
        point: IPoint,
        clearance: number,
        map: IPathfindingMap
    ): IPoint {
        // 检测周围障碍物
        const obstacleDirections = this.detectNearbyObstacles(point, clearance, map);

        if (obstacleDirections.length === 0) {
            // 没有障碍物在范围内
            return point;
        }

        // 计算平均障碍物方向
        let avgDirX = 0;
        let avgDirY = 0;
        for (const dir of obstacleDirections) {
            avgDirX += dir.x;
            avgDirY += dir.y;
        }

        const len = Math.sqrt(avgDirX * avgDirX + avgDirY * avgDirY);
        if (len < 0.0001) {
            // 障碍物方向相互抵消，保持原位
            return point;
        }

        // 反方向偏移（远离障碍物）
        const offsetDirX = -avgDirX / len;
        const offsetDirY = -avgDirY / len;

        // 尝试不同的偏移距离
        for (let attempt = 1; attempt <= this.config.maxOffsetAttempts; attempt++) {
            const offsetDist = clearance * attempt / this.config.maxOffsetAttempts;
            const newX = point.x + offsetDirX * offsetDist;
            const newY = point.y + offsetDirY * offsetDist;

            if (map.isWalkable(Math.floor(newX), Math.floor(newY))) {
                // 检查新位置是否有足够的clearance
                const newObstacles = this.detectNearbyObstacles(
                    createPoint(newX, newY),
                    clearance,
                    map
                );

                if (newObstacles.length === 0) {
                    return createPoint(newX, newY);
                }
            }
        }

        // 无法找到更好的位置，返回原点
        return point;
    }

    /**
     * @zh 偏移拐点（角落）
     * @en Offset corner point
     */
    private offsetCornerPoint(
        corner: IPoint,
        prev: IPoint,
        next: IPoint,
        clearance: number,
        map: IPathfindingMap
    ): IPoint {
        // 计算进入方向和离开方向
        const inDirX = corner.x - prev.x;
        const inDirY = corner.y - prev.y;
        const inLen = Math.sqrt(inDirX * inDirX + inDirY * inDirY);

        const outDirX = next.x - corner.x;
        const outDirY = next.y - corner.y;
        const outLen = Math.sqrt(outDirX * outDirX + outDirY * outDirY);

        if (inLen < 0.0001 || outLen < 0.0001) {
            return this.offsetPointFromObstacles(corner, clearance, map);
        }

        // 标准化方向
        const inNormX = inDirX / inLen;
        const inNormY = inDirY / inLen;
        const outNormX = outDirX / outLen;
        const outNormY = outDirY / outLen;

        // 计算角平分线方向（指向角的内侧）
        // 角平分线 = 入射方向 + 出射方向的反方向
        const bisectX = inNormX - outNormX;
        const bisectY = inNormY - outNormY;
        const bisectLen = Math.sqrt(bisectX * bisectX + bisectY * bisectY);

        if (bisectLen < 0.0001) {
            // 直线，不需要特殊处理
            return this.offsetPointFromObstacles(corner, clearance, map);
        }

        // 标准化角平分线
        const bisectNormX = bisectX / bisectLen;
        const bisectNormY = bisectY / bisectLen;

        // 计算转角角度
        const dotProduct = inNormX * outNormX + inNormY * outNormY;
        const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct)));

        // 计算需要的偏移距离
        // 在角落处，需要偏移 clearance / sin(angle/2) 才能保持与两边的距离
        const halfAngle = angle / 2;
        const sinHalfAngle = Math.sin(halfAngle);

        if (sinHalfAngle < 0.1) {
            // 角度太小（几乎是直线），使用普通偏移
            return this.offsetPointFromObstacles(corner, clearance, map);
        }

        const offsetDist = clearance / sinHalfAngle;

        // 限制最大偏移距离
        const maxOffset = clearance * 3;
        const actualOffset = Math.min(offsetDist, maxOffset);

        // 沿角平分线偏移
        const newX = corner.x + bisectNormX * actualOffset;
        const newY = corner.y + bisectNormY * actualOffset;

        // 验证新位置是否可行
        if (map.isWalkable(Math.floor(newX), Math.floor(newY))) {
            return createPoint(newX, newY);
        }

        // 如果角平分线方向不可行，尝试反方向
        const altX = corner.x - bisectNormX * actualOffset;
        const altY = corner.y - bisectNormY * actualOffset;

        if (map.isWalkable(Math.floor(altX), Math.floor(altY))) {
            return createPoint(altX, altY);
        }

        // 回退到普通偏移
        return this.offsetPointFromObstacles(corner, clearance, map);
    }

    /**
     * @zh 检测附近的障碍物方向
     * @en Detect nearby obstacle directions
     */
    private detectNearbyObstacles(
        point: IPoint,
        clearance: number,
        map: IPathfindingMap
    ): IPoint[] {
        const obstacles: IPoint[] = [];

        for (const angle of this.sampleAngles) {
            const dirX = Math.cos(angle);
            const dirY = Math.sin(angle);

            // 沿该方向采样
            const sampleX = point.x + dirX * clearance;
            const sampleY = point.y + dirY * clearance;

            if (!map.isWalkable(Math.floor(sampleX), Math.floor(sampleY))) {
                // 该方向有障碍物
                obstacles.push(createPoint(dirX, dirY));
            }
        }

        return obstacles;
    }
}

// =============================================================================
// 组合平滑器 | Combined Smoother
// =============================================================================

/**
 * @zh 组合半径感知平滑器
 * @en Combined radius-aware smoother
 *
 * @zh 先使用其他平滑器（如 LOS、Catmull-Rom），再应用半径感知处理
 * @en First applies other smoother (like LOS, Catmull-Rom), then applies radius-aware processing
 *
 * @example
 * ```typescript
 * const smoother = new CombinedRadiusAwareSmoother(
 *     new LineOfSightSmoother(),
 *     { agentRadius: 0.5 }
 * );
 * const path = smoother.smooth(rawPath, map);
 * ```
 */
export class CombinedRadiusAwareSmoother implements IPathSmoother {
    private readonly baseSmoother: IPathSmoother;
    private readonly radiusAwareSmoother: RadiusAwarePathSmoother;

    constructor(
        baseSmoother: IPathSmoother,
        config: IRadiusAwareSmootherConfig
    ) {
        this.baseSmoother = baseSmoother;
        this.radiusAwareSmoother = new RadiusAwarePathSmoother(config);
    }

    smooth(path: readonly IPoint[], map: IPathfindingMap): IPoint[] {
        // 先用基础平滑器处理
        const smoothed = this.baseSmoother.smooth(path, map);

        // 再应用半径感知处理
        return this.radiusAwareSmoother.smooth(smoothed, map);
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建半径感知平滑器
 * @en Create radius-aware smoother
 *
 * @param agentRadius - @zh 代理半径 @en Agent radius
 * @param options - @zh 额外配置 @en Additional options
 *
 * @example
 * ```typescript
 * const smoother = createRadiusAwareSmoother(0.5);
 * const safePath = smoother.smooth(path, map);
 * ```
 */
export function createRadiusAwareSmoother(
    agentRadius: number,
    options?: Omit<IRadiusAwareSmootherConfig, 'agentRadius'>
): RadiusAwarePathSmoother {
    return new RadiusAwarePathSmoother({
        agentRadius,
        ...options
    });
}

/**
 * @zh 创建组合半径感知平滑器
 * @en Create combined radius-aware smoother
 *
 * @param baseSmoother - @zh 基础平滑器 @en Base smoother
 * @param agentRadius - @zh 代理半径 @en Agent radius
 * @param options - @zh 额外配置 @en Additional options
 *
 * @example
 * ```typescript
 * const smoother = createCombinedRadiusAwareSmoother(
 *     new LineOfSightSmoother(),
 *     0.5
 * );
 * ```
 */
export function createCombinedRadiusAwareSmoother(
    baseSmoother: IPathSmoother,
    agentRadius: number,
    options?: Omit<IRadiusAwareSmootherConfig, 'agentRadius'>
): CombinedRadiusAwareSmoother {
    return new CombinedRadiusAwareSmoother(baseSmoother, {
        agentRadius,
        ...options
    });
}
