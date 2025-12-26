/**
 * @zh 网格空间索引
 * @en Grid Spatial Index
 *
 * @zh 基于均匀网格的空间索引实现
 * @en Uniform grid based spatial index implementation
 */

import type { IVector2 } from '@esengine/ecs-framework-math';
import type {
    ISpatialIndex,
    IBounds,
    IRaycastHit,
    SpatialFilter
} from './ISpatialQuery';
import {
    createBoundsFromCircle,
    boundsIntersectsCircle,
    distanceSquared,
    distance
} from './ISpatialQuery';

// =============================================================================
// 网格项 | Grid Item
// =============================================================================

/**
 * @zh 网格中的项
 * @en Item in grid
 */
interface GridItem<T> {
    item: T;
    position: IVector2;
    cellKey: string;
}

// =============================================================================
// 网格空间索引 | Grid Spatial Index
// =============================================================================

/**
 * @zh 网格空间索引配置
 * @en Grid spatial index configuration
 */
export interface GridSpatialIndexConfig {
    /**
     * @zh 网格单元格大小
     * @en Grid cell size
     */
    cellSize: number;
}

/**
 * @zh 网格空间索引实现
 * @en Grid spatial index implementation
 *
 * @zh 使用均匀网格进行空间划分，适合对象分布均匀的场景
 * @en Uses uniform grid for spatial partitioning, suitable for evenly distributed objects
 */
export class GridSpatialIndex<T> implements ISpatialIndex<T> {
    private readonly _cellSize: number;
    private readonly _cells: Map<string, Set<GridItem<T>>> = new Map();
    private readonly _itemMap: Map<T, GridItem<T>> = new Map();

    constructor(config: GridSpatialIndexConfig) {
        this._cellSize = config.cellSize;
    }

    // =========================================================================
    // ISpatialIndex 实现 | ISpatialIndex Implementation
    // =========================================================================

    get count(): number {
        return this._itemMap.size;
    }

    /**
     * @zh 插入对象
     * @en Insert object
     */
    insert(item: T, position: IVector2): void {
        if (this._itemMap.has(item)) {
            this.update(item, position);
            return;
        }

        const cellKey = this._getCellKey(position);
        const gridItem: GridItem<T> = { item, position: { x: position.x, y: position.y }, cellKey };

        this._itemMap.set(item, gridItem);
        this._addToCell(cellKey, gridItem);
    }

    /**
     * @zh 移除对象
     * @en Remove object
     */
    remove(item: T): boolean {
        const gridItem = this._itemMap.get(item);
        if (!gridItem) {
            return false;
        }

        this._removeFromCell(gridItem.cellKey, gridItem);
        this._itemMap.delete(item);
        return true;
    }

    /**
     * @zh 更新对象位置
     * @en Update object position
     */
    update(item: T, newPosition: IVector2): boolean {
        const gridItem = this._itemMap.get(item);
        if (!gridItem) {
            return false;
        }

        const newCellKey = this._getCellKey(newPosition);

        if (newCellKey !== gridItem.cellKey) {
            this._removeFromCell(gridItem.cellKey, gridItem);
            gridItem.cellKey = newCellKey;
            this._addToCell(newCellKey, gridItem);
        }

        gridItem.position = { x: newPosition.x, y: newPosition.y };
        return true;
    }

    /**
     * @zh 清空索引
     * @en Clear index
     */
    clear(): void {
        this._cells.clear();
        this._itemMap.clear();
    }

    /**
     * @zh 获取所有对象
     * @en Get all objects
     */
    getAll(): T[] {
        return Array.from(this._itemMap.keys());
    }

    // =========================================================================
    // ISpatialQuery 实现 | ISpatialQuery Implementation
    // =========================================================================

    /**
     * @zh 查找半径内的所有对象
     * @en Find all objects within radius
     */
    findInRadius(center: IVector2, radius: number, filter?: SpatialFilter<T>): T[] {
        const results: T[] = [];
        const radiusSq = radius * radius;
        const bounds = createBoundsFromCircle(center, radius);

        this._forEachInBounds(bounds, (gridItem) => {
            const distSq = distanceSquared(center, gridItem.position);
            if (distSq <= radiusSq) {
                if (!filter || filter(gridItem.item)) {
                    results.push(gridItem.item);
                }
            }
        });

        return results;
    }

    /**
     * @zh 查找矩形区域内的所有对象
     * @en Find all objects within rectangle
     */
    findInRect(bounds: IBounds, filter?: SpatialFilter<T>): T[] {
        const results: T[] = [];

        this._forEachInBounds(bounds, (gridItem) => {
            const pos = gridItem.position;
            if (pos.x >= bounds.minX && pos.x <= bounds.maxX &&
                pos.y >= bounds.minY && pos.y <= bounds.maxY) {
                if (!filter || filter(gridItem.item)) {
                    results.push(gridItem.item);
                }
            }
        });

        return results;
    }

    /**
     * @zh 查找最近的对象
     * @en Find nearest object
     */
    findNearest(center: IVector2, maxDistance?: number, filter?: SpatialFilter<T>): T | null {
        let nearest: T | null = null;
        let nearestDistSq = maxDistance !== undefined ? maxDistance * maxDistance : Infinity;

        const searchRadius = maxDistance ?? this._cellSize * 10;
        const bounds = createBoundsFromCircle(center, searchRadius);

        this._forEachInBounds(bounds, (gridItem) => {
            const distSq = distanceSquared(center, gridItem.position);
            if (distSq < nearestDistSq) {
                if (!filter || filter(gridItem.item)) {
                    nearest = gridItem.item;
                    nearestDistSq = distSq;
                }
            }
        });

        return nearest;
    }

    /**
     * @zh 查找最近的 K 个对象
     * @en Find K nearest objects
     */
    findKNearest(center: IVector2, k: number, maxDistance?: number, filter?: SpatialFilter<T>): T[] {
        if (k <= 0) return [];

        const candidates: Array<{ item: T; distSq: number }> = [];
        const maxDistSq = maxDistance !== undefined ? maxDistance * maxDistance : Infinity;
        const searchRadius = maxDistance ?? this._cellSize * 10;
        const bounds = createBoundsFromCircle(center, searchRadius);

        this._forEachInBounds(bounds, (gridItem) => {
            const distSq = distanceSquared(center, gridItem.position);
            if (distSq <= maxDistSq) {
                if (!filter || filter(gridItem.item)) {
                    candidates.push({ item: gridItem.item, distSq });
                }
            }
        });

        candidates.sort((a, b) => a.distSq - b.distSq);
        return candidates.slice(0, k).map(c => c.item);
    }

    /**
     * @zh 射线检测
     * @en Raycast
     */
    raycast(origin: IVector2, direction: IVector2, maxDistance: number, filter?: SpatialFilter<T>): IRaycastHit<T>[] {
        const hits: IRaycastHit<T>[] = [];
        const rayBounds = this._getRayBounds(origin, direction, maxDistance);

        this._forEachInBounds(rayBounds, (gridItem) => {
            const hit = this._rayIntersectsPoint(origin, direction, gridItem.position, maxDistance);
            if (hit && hit.distance <= maxDistance) {
                if (!filter || filter(gridItem.item)) {
                    hits.push({
                        target: gridItem.item,
                        point: hit.point,
                        normal: hit.normal,
                        distance: hit.distance
                    });
                }
            }
        });

        hits.sort((a, b) => a.distance - b.distance);
        return hits;
    }

    /**
     * @zh 射线检测（仅返回第一个命中）
     * @en Raycast (return first hit only)
     */
    raycastFirst(origin: IVector2, direction: IVector2, maxDistance: number, filter?: SpatialFilter<T>): IRaycastHit<T> | null {
        const hits = this.raycast(origin, direction, maxDistance, filter);
        return hits.length > 0 ? hits[0] : null;
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    private _getCellKey(position: IVector2): string {
        const cellX = Math.floor(position.x / this._cellSize);
        const cellY = Math.floor(position.y / this._cellSize);
        return `${cellX},${cellY}`;
    }

    private _getCellCoords(position: IVector2): { x: number; y: number } {
        return {
            x: Math.floor(position.x / this._cellSize),
            y: Math.floor(position.y / this._cellSize)
        };
    }

    private _addToCell(cellKey: string, gridItem: GridItem<T>): void {
        let cell = this._cells.get(cellKey);
        if (!cell) {
            cell = new Set();
            this._cells.set(cellKey, cell);
        }
        cell.add(gridItem);
    }

    private _removeFromCell(cellKey: string, gridItem: GridItem<T>): void {
        const cell = this._cells.get(cellKey);
        if (cell) {
            cell.delete(gridItem);
            if (cell.size === 0) {
                this._cells.delete(cellKey);
            }
        }
    }

    private _forEachInBounds(bounds: IBounds, callback: (item: GridItem<T>) => void): void {
        const minCell = this._getCellCoords({ x: bounds.minX, y: bounds.minY });
        const maxCell = this._getCellCoords({ x: bounds.maxX, y: bounds.maxY });

        for (let x = minCell.x; x <= maxCell.x; x++) {
            for (let y = minCell.y; y <= maxCell.y; y++) {
                const cell = this._cells.get(`${x},${y}`);
                if (cell) {
                    for (const gridItem of cell) {
                        callback(gridItem);
                    }
                }
            }
        }
    }

    private _getRayBounds(origin: IVector2, direction: IVector2, maxDistance: number): IBounds {
        const endX = origin.x + direction.x * maxDistance;
        const endY = origin.y + direction.y * maxDistance;

        return {
            minX: Math.min(origin.x, endX),
            minY: Math.min(origin.y, endY),
            maxX: Math.max(origin.x, endX),
            maxY: Math.max(origin.y, endY)
        };
    }

    private _rayIntersectsPoint(
        origin: IVector2,
        direction: IVector2,
        point: IVector2,
        _maxDistance: number,
        hitRadius: number = 0.5
    ): { point: IVector2; normal: IVector2; distance: number } | null {
        const toPoint = { x: point.x - origin.x, y: point.y - origin.y };
        const projection = toPoint.x * direction.x + toPoint.y * direction.y;

        if (projection < 0) {
            return null;
        }

        const closestX = origin.x + direction.x * projection;
        const closestY = origin.y + direction.y * projection;
        const distToLine = Math.sqrt(
            (point.x - closestX) * (point.x - closestX) +
            (point.y - closestY) * (point.y - closestY)
        );

        if (distToLine <= hitRadius) {
            const hitDist = projection - Math.sqrt(hitRadius * hitRadius - distToLine * distToLine);
            if (hitDist >= 0) {
                const hitPoint = {
                    x: origin.x + direction.x * hitDist,
                    y: origin.y + direction.y * hitDist
                };
                const normal = {
                    x: hitPoint.x - point.x,
                    y: hitPoint.y - point.y
                };
                const normalLen = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
                if (normalLen > 0) {
                    normal.x /= normalLen;
                    normal.y /= normalLen;
                }
                return { point: hitPoint, normal, distance: hitDist };
            }
        }

        return null;
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建网格空间索引
 * @en Create grid spatial index
 */
export function createGridSpatialIndex<T>(cellSize: number = 100): GridSpatialIndex<T> {
    return new GridSpatialIndex<T>({ cellSize });
}
