/**
 * @zh 路径验证器
 * @en Path Validator
 */

import type { IPoint, IPathfindingMap } from './IPathfinding';
import type { IPathValidator, IPathValidationResult } from './IIncrementalPathfinding';

// =============================================================================
// 路径验证器 | Path Validator
// =============================================================================

/**
 * @zh 路径验证器
 * @en Path Validator
 *
 * @zh 用于检查现有路径在地图变化后是否仍然有效
 * @en Used to check if an existing path is still valid after map changes
 *
 * @example
 * ```typescript
 * const validator = new PathValidator();
 * const result = validator.validatePath(path, 0, path.length, map);
 *
 * if (!result.valid) {
 *     console.log('Path invalid at index:', result.invalidIndex);
 *     // Trigger replanning from current position
 * }
 * ```
 */
export class PathValidator implements IPathValidator {
    /**
     * @zh 验证路径段的有效性
     * @en Validate path segment validity
     *
     * @param path - @zh 要验证的路径 @en Path to validate
     * @param fromIndex - @zh 起始索引 @en Start index
     * @param toIndex - @zh 结束索引 @en End index
     * @param map - @zh 地图实例 @en Map instance
     * @returns @zh 验证结果 @en Validation result
     */
    validatePath(
        path: readonly IPoint[],
        fromIndex: number,
        toIndex: number,
        map: IPathfindingMap
    ): IPathValidationResult {
        const end = Math.min(toIndex, path.length);

        for (let i = fromIndex; i < end; i++) {
            const point = path[i];
            const x = Math.floor(point.x);
            const y = Math.floor(point.y);

            if (!map.isWalkable(x, y)) {
                return { valid: false, invalidIndex: i };
            }

            if (i > fromIndex) {
                const prev = path[i - 1];
                if (!this.checkLineOfSight(prev.x, prev.y, point.x, point.y, map)) {
                    return { valid: false, invalidIndex: i };
                }
            }
        }

        return { valid: true, invalidIndex: -1 };
    }

    /**
     * @zh 检查两点之间的视线（使用 Bresenham 算法）
     * @en Check line of sight between two points (using Bresenham algorithm)
     *
     * @param x1 - @zh 起点 X @en Start X
     * @param y1 - @zh 起点 Y @en Start Y
     * @param x2 - @zh 终点 X @en End X
     * @param y2 - @zh 终点 Y @en End Y
     * @param map - @zh 地图实例 @en Map instance
     * @returns @zh 是否有视线 @en Whether there is line of sight
     */
    private checkLineOfSight(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        map: IPathfindingMap
    ): boolean {
        const ix1 = Math.floor(x1);
        const iy1 = Math.floor(y1);
        const ix2 = Math.floor(x2);
        const iy2 = Math.floor(y2);

        let dx = Math.abs(ix2 - ix1);
        let dy = Math.abs(iy2 - iy1);
        let x = ix1;
        let y = iy1;

        const sx = ix1 < ix2 ? 1 : -1;
        const sy = iy1 < iy2 ? 1 : -1;

        if (dx > dy) {
            let err = dx / 2;
            while (x !== ix2) {
                if (!map.isWalkable(x, y)) {
                    return false;
                }
                err -= dy;
                if (err < 0) {
                    y += sy;
                    err += dx;
                }
                x += sx;
            }
        } else {
            let err = dy / 2;
            while (y !== iy2) {
                if (!map.isWalkable(x, y)) {
                    return false;
                }
                err -= dx;
                if (err < 0) {
                    x += sx;
                    err += dy;
                }
                y += sy;
            }
        }

        return map.isWalkable(ix2, iy2);
    }
}

// =============================================================================
// 障碍物变化管理器 | Obstacle Change Manager
// =============================================================================

/**
 * @zh 障碍物变化记录
 * @en Obstacle change record
 */
export interface IObstacleChange {
    /**
     * @zh X 坐标
     * @en X coordinate
     */
    readonly x: number;

    /**
     * @zh Y 坐标
     * @en Y coordinate
     */
    readonly y: number;

    /**
     * @zh 变化前是否可通行
     * @en Was walkable before change
     */
    readonly wasWalkable: boolean;

    /**
     * @zh 变化时间戳
     * @en Change timestamp
     */
    readonly timestamp: number;
}

/**
 * @zh 障碍物变化区域
 * @en Obstacle change region
 */
export interface IChangeRegion {
    /**
     * @zh 最小 X 坐标
     * @en Minimum X coordinate
     */
    readonly minX: number;

    /**
     * @zh 最小 Y 坐标
     * @en Minimum Y coordinate
     */
    readonly minY: number;

    /**
     * @zh 最大 X 坐标
     * @en Maximum X coordinate
     */
    readonly maxX: number;

    /**
     * @zh 最大 Y 坐标
     * @en Maximum Y coordinate
     */
    readonly maxY: number;
}

/**
 * @zh 障碍物变化管理器
 * @en Obstacle Change Manager
 *
 * @zh 跟踪地图障碍物变化，用于触发动态重规划
 * @en Tracks map obstacle changes, used to trigger dynamic replanning
 *
 * @example
 * ```typescript
 * const manager = new ObstacleChangeManager();
 *
 * // Record change when obstacle is added/removed
 * manager.recordChange(10, 20, true);  // Was walkable, now blocked
 *
 * // Get affected region for notification
 * const region = manager.getAffectedRegion();
 * if (region) {
 *     pathfinder.notifyObstacleChange(
 *         region.minX, region.minY,
 *         region.maxX, region.maxY
 *     );
 * }
 *
 * // Clear after notification
 * manager.flush();
 * ```
 */
export class ObstacleChangeManager {
    private readonly changes: Map<string, IObstacleChange> = new Map();
    private epoch: number = 0;

    /**
     * @zh 记录障碍物变化
     * @en Record obstacle change
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @param wasWalkable - @zh 变化前是否可通行 @en Was walkable before change
     */
    recordChange(x: number, y: number, wasWalkable: boolean): void {
        const key = `${x},${y}`;
        this.changes.set(key, {
            x,
            y,
            wasWalkable,
            timestamp: Date.now()
        });
    }

    /**
     * @zh 获取影响区域
     * @en Get affected region
     *
     * @returns @zh 影响区域或 null（如果没有变化）@en Affected region or null if no changes
     */
    getAffectedRegion(): IChangeRegion | null {
        if (this.changes.size === 0) {
            return null;
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const change of this.changes.values()) {
            minX = Math.min(minX, change.x);
            minY = Math.min(minY, change.y);
            maxX = Math.max(maxX, change.x);
            maxY = Math.max(maxY, change.y);
        }

        return { minX, minY, maxX, maxY };
    }

    /**
     * @zh 获取所有变化
     * @en Get all changes
     *
     * @returns @zh 变化列表 @en List of changes
     */
    getChanges(): IObstacleChange[] {
        return Array.from(this.changes.values());
    }

    /**
     * @zh 检查是否有变化
     * @en Check if there are changes
     *
     * @returns @zh 是否有变化 @en Whether there are changes
     */
    hasChanges(): boolean {
        return this.changes.size > 0;
    }

    /**
     * @zh 获取当前 epoch
     * @en Get current epoch
     *
     * @returns @zh 当前 epoch @en Current epoch
     */
    getEpoch(): number {
        return this.epoch;
    }

    /**
     * @zh 清空变化记录并推进 epoch
     * @en Clear changes and advance epoch
     */
    flush(): void {
        this.changes.clear();
        this.epoch++;
    }

    /**
     * @zh 清空所有状态
     * @en Clear all state
     */
    clear(): void {
        this.changes.clear();
        this.epoch = 0;
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建路径验证器
 * @en Create path validator
 *
 * @returns @zh 路径验证器实例 @en Path validator instance
 */
export function createPathValidator(): PathValidator {
    return new PathValidator();
}

/**
 * @zh 创建障碍物变化管理器
 * @en Create obstacle change manager
 *
 * @returns @zh 障碍物变化管理器实例 @en Obstacle change manager instance
 */
export function createObstacleChangeManager(): ObstacleChangeManager {
    return new ObstacleChangeManager();
}
