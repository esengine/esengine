/**
 * @zh 空间查询接口
 * @en Spatial Query Interface
 *
 * @zh 提供空间查询的核心抽象
 * @en Provides core abstractions for spatial queries
 */

import type { IVector2 } from '@esengine/ecs-framework-math';

// =============================================================================
// 基础类型 | Basic Types
// =============================================================================

/**
 * @zh 空间边界框
 * @en Spatial bounding box
 */
export interface IBounds {
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
 * @zh 可定位对象接口
 * @en Positionable object interface
 */
export interface IPositionable {
    /**
     * @zh 获取对象位置
     * @en Get object position
     */
    readonly position: IVector2;
}

/**
 * @zh 可定位且有边界的对象接口
 * @en Positionable object with bounds interface
 */
export interface IBoundable extends IPositionable {
    /**
     * @zh 获取对象边界
     * @en Get object bounds
     */
    readonly bounds: IBounds;
}

/**
 * @zh 射线检测结果
 * @en Raycast hit result
 */
export interface IRaycastHit<T> {
    /**
     * @zh 命中的对象
     * @en Hit object
     */
    readonly target: T;

    /**
     * @zh 命中点
     * @en Hit point
     */
    readonly point: IVector2;

    /**
     * @zh 命中点的法线
     * @en Normal at hit point
     */
    readonly normal: IVector2;

    /**
     * @zh 距离射线起点的距离
     * @en Distance from ray origin
     */
    readonly distance: number;
}

/**
 * @zh 过滤器函数类型
 * @en Filter function type
 */
export type SpatialFilter<T> = (item: T) => boolean;

// =============================================================================
// 空间查询接口 | Spatial Query Interface
// =============================================================================

/**
 * @zh 空间查询接口
 * @en Spatial query interface
 *
 * @zh 提供空间查询能力，支持范围查询、最近邻查询和射线检测
 * @en Provides spatial query capabilities including range queries, nearest neighbor queries, and raycasting
 */
export interface ISpatialQuery<T> {
    /**
     * @zh 查找半径内的所有对象
     * @en Find all objects within radius
     *
     * @param center - @zh 中心点 @en Center point
     * @param radius - @zh 半径 @en Radius
     * @param filter - @zh 过滤函数 @en Filter function
     * @returns @zh 半径内的对象数组 @en Array of objects within radius
     */
    findInRadius(center: IVector2, radius: number, filter?: SpatialFilter<T>): T[];

    /**
     * @zh 查找矩形区域内的所有对象
     * @en Find all objects within rectangle
     *
     * @param bounds - @zh 边界框 @en Bounding box
     * @param filter - @zh 过滤函数 @en Filter function
     * @returns @zh 区域内的对象数组 @en Array of objects within bounds
     */
    findInRect(bounds: IBounds, filter?: SpatialFilter<T>): T[];

    /**
     * @zh 查找最近的对象
     * @en Find nearest object
     *
     * @param center - @zh 查询中心点 @en Query center point
     * @param maxDistance - @zh 最大搜索距离 @en Maximum search distance
     * @param filter - @zh 过滤函数 @en Filter function
     * @returns @zh 最近的对象，没有则返回 null @en Nearest object or null
     */
    findNearest(center: IVector2, maxDistance?: number, filter?: SpatialFilter<T>): T | null;

    /**
     * @zh 查找最近的 K 个对象
     * @en Find K nearest objects
     *
     * @param center - @zh 查询中心点 @en Query center point
     * @param k - @zh 返回的对象数量 @en Number of objects to return
     * @param maxDistance - @zh 最大搜索距离 @en Maximum search distance
     * @param filter - @zh 过滤函数 @en Filter function
     * @returns @zh 最近的 K 个对象数组 @en Array of K nearest objects
     */
    findKNearest(center: IVector2, k: number, maxDistance?: number, filter?: SpatialFilter<T>): T[];

    /**
     * @zh 射线检测
     * @en Raycast
     *
     * @param origin - @zh 射线起点 @en Ray origin
     * @param direction - @zh 射线方向（应归一化）@en Ray direction (should be normalized)
     * @param maxDistance - @zh 最大检测距离 @en Maximum detection distance
     * @param filter - @zh 过滤函数 @en Filter function
     * @returns @zh 命中结果数组，按距离排序 @en Array of hit results sorted by distance
     */
    raycast(origin: IVector2, direction: IVector2, maxDistance: number, filter?: SpatialFilter<T>): IRaycastHit<T>[];

    /**
     * @zh 射线检测（仅返回第一个命中）
     * @en Raycast (return first hit only)
     *
     * @param origin - @zh 射线起点 @en Ray origin
     * @param direction - @zh 射线方向（应归一化）@en Ray direction (should be normalized)
     * @param maxDistance - @zh 最大检测距离 @en Maximum detection distance
     * @param filter - @zh 过滤函数 @en Filter function
     * @returns @zh 第一个命中结果，没有则返回 null @en First hit result or null
     */
    raycastFirst(origin: IVector2, direction: IVector2, maxDistance: number, filter?: SpatialFilter<T>): IRaycastHit<T> | null;
}

// =============================================================================
// 空间索引接口 | Spatial Index Interface
// =============================================================================

/**
 * @zh 空间索引接口
 * @en Spatial index interface
 *
 * @zh 提供空间索引的管理能力
 * @en Provides spatial index management capabilities
 */
export interface ISpatialIndex<T> extends ISpatialQuery<T> {
    /**
     * @zh 插入对象
     * @en Insert object
     *
     * @param item - @zh 要插入的对象 @en Object to insert
     * @param position - @zh 对象位置 @en Object position
     */
    insert(item: T, position: IVector2): void;

    /**
     * @zh 移除对象
     * @en Remove object
     *
     * @param item - @zh 要移除的对象 @en Object to remove
     * @returns @zh 是否成功移除 @en Whether removal was successful
     */
    remove(item: T): boolean;

    /**
     * @zh 更新对象位置
     * @en Update object position
     *
     * @param item - @zh 要更新的对象 @en Object to update
     * @param newPosition - @zh 新位置 @en New position
     * @returns @zh 是否成功更新 @en Whether update was successful
     */
    update(item: T, newPosition: IVector2): boolean;

    /**
     * @zh 清空索引
     * @en Clear index
     */
    clear(): void;

    /**
     * @zh 获取索引中的对象数量
     * @en Get number of objects in index
     */
    readonly count: number;

    /**
     * @zh 获取所有对象
     * @en Get all objects
     */
    getAll(): T[];
}

// =============================================================================
// 工具函数 | Utility Functions
// =============================================================================

/**
 * @zh 创建边界框
 * @en Create bounding box
 */
export function createBounds(minX: number, minY: number, maxX: number, maxY: number): IBounds {
    return { minX, minY, maxX, maxY };
}

/**
 * @zh 从中心点和尺寸创建边界框
 * @en Create bounding box from center and size
 */
export function createBoundsFromCenter(center: IVector2, width: number, height: number): IBounds {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    return {
        minX: center.x - halfWidth,
        minY: center.y - halfHeight,
        maxX: center.x + halfWidth,
        maxY: center.y + halfHeight
    };
}

/**
 * @zh 从圆形创建边界框
 * @en Create bounding box from circle
 */
export function createBoundsFromCircle(center: IVector2, radius: number): IBounds {
    return {
        minX: center.x - radius,
        minY: center.y - radius,
        maxX: center.x + radius,
        maxY: center.y + radius
    };
}

/**
 * @zh 检查点是否在边界框内
 * @en Check if point is inside bounds
 */
export function isPointInBounds(point: IVector2, bounds: IBounds): boolean {
    return point.x >= bounds.minX && point.x <= bounds.maxX &&
           point.y >= bounds.minY && point.y <= bounds.maxY;
}

/**
 * @zh 检查两个边界框是否相交
 * @en Check if two bounding boxes intersect
 */
export function boundsIntersect(a: IBounds, b: IBounds): boolean {
    return a.minX <= b.maxX && a.maxX >= b.minX &&
           a.minY <= b.maxY && a.maxY >= b.minY;
}

/**
 * @zh 检查边界框是否与圆形相交
 * @en Check if bounds intersects with circle
 */
export function boundsIntersectsCircle(bounds: IBounds, center: IVector2, radius: number): boolean {
    const closestX = Math.max(bounds.minX, Math.min(center.x, bounds.maxX));
    const closestY = Math.max(bounds.minY, Math.min(center.y, bounds.maxY));
    const distanceX = center.x - closestX;
    const distanceY = center.y - closestY;
    return (distanceX * distanceX + distanceY * distanceY) <= (radius * radius);
}

/**
 * @zh 计算两点之间的距离平方
 * @en Calculate squared distance between two points
 */
export function distanceSquared(a: IVector2, b: IVector2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
}

/**
 * @zh 计算两点之间的距离
 * @en Calculate distance between two points
 */
export function distance(a: IVector2, b: IVector2): number {
    return Math.sqrt(distanceSquared(a, b));
}
