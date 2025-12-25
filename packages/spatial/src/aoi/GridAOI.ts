/**
 * @zh 网格 AOI 实现
 * @en Grid AOI Implementation
 *
 * @zh 基于均匀网格的兴趣区域管理实现
 * @en Uniform grid based area of interest management implementation
 */

import type { IVector2 } from '@esengine/ecs-framework-math';
import type {
    IAOIManager,
    IAOIObserverConfig,
    IAOIEvent,
    AOIEventListener
} from './IAOI';
import { distanceSquared } from '../ISpatialQuery';

// =============================================================================
// 内部类型 | Internal Types
// =============================================================================

/**
 * @zh AOI 观察者数据
 * @en AOI observer data
 */
interface AOIObserverData<T> {
    entity: T;
    position: IVector2;
    viewRange: number;
    viewRangeSq: number;
    observable: boolean;
    cellKey: string;
    /** @zh 当前可见的实体集合 @en Currently visible entities */
    visibleEntities: Set<T>;
    /** @zh 实体特定的监听器 @en Entity-specific listeners */
    listeners: Set<AOIEventListener<T>>;
}

// =============================================================================
// 网格 AOI 配置 | Grid AOI Configuration
// =============================================================================

/**
 * @zh 网格 AOI 配置
 * @en Grid AOI configuration
 */
export interface GridAOIConfig {
    /**
     * @zh 网格单元格大小（建议设置为平均视野范围的 1-2 倍）
     * @en Grid cell size (recommended 1-2x average view range)
     */
    cellSize: number;
}

// =============================================================================
// 网格 AOI 实现 | Grid AOI Implementation
// =============================================================================

/**
 * @zh 网格 AOI 实现
 * @en Grid AOI implementation
 *
 * @zh 使用均匀网格进行空间划分，高效管理大量实体的兴趣区域
 * @en Uses uniform grid for spatial partitioning, efficiently managing AOI for many entities
 */
export class GridAOI<T> implements IAOIManager<T> {
    private readonly _cellSize: number;
    private readonly _cells: Map<string, Set<AOIObserverData<T>>> = new Map();
    private readonly _observers: Map<T, AOIObserverData<T>> = new Map();
    private readonly _globalListeners: Set<AOIEventListener<T>> = new Set();

    constructor(config: GridAOIConfig) {
        this._cellSize = config.cellSize;
    }

    // =========================================================================
    // IAOIManager 实现 | IAOIManager Implementation
    // =========================================================================

    get count(): number {
        return this._observers.size;
    }

    /**
     * @zh 添加观察者
     * @en Add observer
     */
    addObserver(entity: T, position: IVector2, config: IAOIObserverConfig): void {
        if (this._observers.has(entity)) {
            this.updatePosition(entity, position);
            this.updateViewRange(entity, config.viewRange);
            return;
        }

        const cellKey = this._getCellKey(position);
        const data: AOIObserverData<T> = {
            entity,
            position: { x: position.x, y: position.y },
            viewRange: config.viewRange,
            viewRangeSq: config.viewRange * config.viewRange,
            observable: config.observable !== false,
            cellKey,
            visibleEntities: new Set(),
            listeners: new Set()
        };

        this._observers.set(entity, data);
        this._addToCell(cellKey, data);

        // Initial visibility check
        this._updateVisibility(data);
    }

    /**
     * @zh 移除观察者
     * @en Remove observer
     */
    removeObserver(entity: T): boolean {
        const data = this._observers.get(entity);
        if (!data) {
            return false;
        }

        // Notify all observers who were watching this entity
        if (data.observable) {
            for (const [, otherData] of this._observers) {
                if (otherData !== data && otherData.visibleEntities.has(entity)) {
                    otherData.visibleEntities.delete(entity);
                    this._emitEvent({
                        type: 'exit',
                        observer: otherData.entity,
                        target: entity,
                        position: data.position
                    }, otherData);
                }
            }
        }

        // Notify this entity about all entities it was watching
        for (const visible of data.visibleEntities) {
            const visibleData = this._observers.get(visible);
            if (visibleData) {
                this._emitEvent({
                    type: 'exit',
                    observer: entity,
                    target: visible,
                    position: visibleData.position
                }, data);
            }
        }

        this._removeFromCell(data.cellKey, data);
        this._observers.delete(entity);
        return true;
    }

    /**
     * @zh 更新观察者位置
     * @en Update observer position
     */
    updatePosition(entity: T, newPosition: IVector2): boolean {
        const data = this._observers.get(entity);
        if (!data) {
            return false;
        }

        const newCellKey = this._getCellKey(newPosition);

        // Update cell if changed
        if (newCellKey !== data.cellKey) {
            this._removeFromCell(data.cellKey, data);
            data.cellKey = newCellKey;
            this._addToCell(newCellKey, data);
        }

        data.position = { x: newPosition.x, y: newPosition.y };

        // Update visibility for this observer
        this._updateVisibility(data);

        // Update visibility for others who might now see/unsee this entity
        if (data.observable) {
            this._updateObserversOfEntity(data);
        }

        return true;
    }

    /**
     * @zh 更新观察者视野范围
     * @en Update observer view range
     */
    updateViewRange(entity: T, newRange: number): boolean {
        const data = this._observers.get(entity);
        if (!data) {
            return false;
        }

        data.viewRange = newRange;
        data.viewRangeSq = newRange * newRange;

        // Recalculate visibility
        this._updateVisibility(data);

        return true;
    }

    /**
     * @zh 获取实体视野内的所有对象
     * @en Get all objects within entity's view
     */
    getEntitiesInView(entity: T): T[] {
        const data = this._observers.get(entity);
        if (!data) {
            return [];
        }
        return Array.from(data.visibleEntities);
    }

    /**
     * @zh 获取能看到指定实体的所有观察者
     * @en Get all observers who can see the specified entity
     */
    getObserversOf(entity: T): T[] {
        const data = this._observers.get(entity);
        if (!data || !data.observable) {
            return [];
        }

        const observers: T[] = [];
        for (const [, otherData] of this._observers) {
            if (otherData !== data && otherData.visibleEntities.has(entity)) {
                observers.push(otherData.entity);
            }
        }
        return observers;
    }

    /**
     * @zh 检查观察者是否能看到目标
     * @en Check if observer can see target
     */
    canSee(observer: T, target: T): boolean {
        const data = this._observers.get(observer);
        if (!data) {
            return false;
        }
        return data.visibleEntities.has(target);
    }

    /**
     * @zh 添加全局事件监听器
     * @en Add global event listener
     */
    addListener(listener: AOIEventListener<T>): void {
        this._globalListeners.add(listener);
    }

    /**
     * @zh 移除全局事件监听器
     * @en Remove global event listener
     */
    removeListener(listener: AOIEventListener<T>): void {
        this._globalListeners.delete(listener);
    }

    /**
     * @zh 为特定观察者添加事件监听器
     * @en Add event listener for specific observer
     */
    addEntityListener(entity: T, listener: AOIEventListener<T>): void {
        const data = this._observers.get(entity);
        if (data) {
            data.listeners.add(listener);
        }
    }

    /**
     * @zh 移除特定观察者的事件监听器
     * @en Remove event listener for specific observer
     */
    removeEntityListener(entity: T, listener: AOIEventListener<T>): void {
        const data = this._observers.get(entity);
        if (data) {
            data.listeners.delete(listener);
        }
    }

    /**
     * @zh 清空所有观察者
     * @en Clear all observers
     */
    clear(): void {
        this._cells.clear();
        this._observers.clear();
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

    private _addToCell(cellKey: string, data: AOIObserverData<T>): void {
        let cell = this._cells.get(cellKey);
        if (!cell) {
            cell = new Set();
            this._cells.set(cellKey, cell);
        }
        cell.add(data);
    }

    private _removeFromCell(cellKey: string, data: AOIObserverData<T>): void {
        const cell = this._cells.get(cellKey);
        if (cell) {
            cell.delete(data);
            if (cell.size === 0) {
                this._cells.delete(cellKey);
            }
        }
    }

    /**
     * @zh 更新观察者的可见实体列表
     * @en Update observer's visible entities list
     */
    private _updateVisibility(data: AOIObserverData<T>): void {
        const newVisible = new Set<T>();

        // Calculate search radius in cells
        const cellRadius = Math.ceil(data.viewRange / this._cellSize);
        const centerCell = this._getCellCoords(data.position);

        // Check all cells within range
        for (let dx = -cellRadius; dx <= cellRadius; dx++) {
            for (let dy = -cellRadius; dy <= cellRadius; dy++) {
                const cellKey = `${centerCell.x + dx},${centerCell.y + dy}`;
                const cell = this._cells.get(cellKey);
                if (!cell) continue;

                for (const otherData of cell) {
                    if (otherData === data) continue;
                    if (!otherData.observable) continue;

                    const distSq = distanceSquared(data.position, otherData.position);
                    if (distSq <= data.viewRangeSq) {
                        newVisible.add(otherData.entity);
                    }
                }
            }
        }

        // Find entities that entered view
        for (const entity of newVisible) {
            if (!data.visibleEntities.has(entity)) {
                const targetData = this._observers.get(entity);
                if (targetData) {
                    this._emitEvent({
                        type: 'enter',
                        observer: data.entity,
                        target: entity,
                        position: targetData.position
                    }, data);
                }
            }
        }

        // Find entities that exited view
        for (const entity of data.visibleEntities) {
            if (!newVisible.has(entity)) {
                const targetData = this._observers.get(entity);
                const position = targetData?.position ?? { x: 0, y: 0 };
                this._emitEvent({
                    type: 'exit',
                    observer: data.entity,
                    target: entity,
                    position
                }, data);
            }
        }

        data.visibleEntities = newVisible;
    }

    /**
     * @zh 更新其他观察者对于某个实体的可见性
     * @en Update other observers' visibility of an entity
     */
    private _updateObserversOfEntity(movedData: AOIObserverData<T>): void {
        const cellRadius = Math.ceil(this._getMaxViewRange() / this._cellSize) + 1;
        const centerCell = this._getCellCoords(movedData.position);

        for (let dx = -cellRadius; dx <= cellRadius; dx++) {
            for (let dy = -cellRadius; dy <= cellRadius; dy++) {
                const cellKey = `${centerCell.x + dx},${centerCell.y + dy}`;
                const cell = this._cells.get(cellKey);
                if (!cell) continue;

                for (const otherData of cell) {
                    if (otherData === movedData) continue;

                    const distSq = distanceSquared(otherData.position, movedData.position);
                    const wasVisible = otherData.visibleEntities.has(movedData.entity);
                    const isVisible = distSq <= otherData.viewRangeSq;

                    if (isVisible && !wasVisible) {
                        otherData.visibleEntities.add(movedData.entity);
                        this._emitEvent({
                            type: 'enter',
                            observer: otherData.entity,
                            target: movedData.entity,
                            position: movedData.position
                        }, otherData);
                    } else if (!isVisible && wasVisible) {
                        otherData.visibleEntities.delete(movedData.entity);
                        this._emitEvent({
                            type: 'exit',
                            observer: otherData.entity,
                            target: movedData.entity,
                            position: movedData.position
                        }, otherData);
                    }
                }
            }
        }
    }

    /**
     * @zh 获取最大视野范围（用于优化搜索）
     * @en Get maximum view range (for search optimization)
     */
    private _getMaxViewRange(): number {
        let max = 0;
        for (const [, data] of this._observers) {
            if (data.viewRange > max) {
                max = data.viewRange;
            }
        }
        return max;
    }

    /**
     * @zh 发送事件
     * @en Emit event
     */
    private _emitEvent(event: IAOIEvent<T>, observerData: AOIObserverData<T>): void {
        // Entity-specific listeners
        for (const listener of observerData.listeners) {
            try {
                listener(event);
            } catch (e) {
                console.error('AOI entity listener error:', e);
            }
        }

        // Global listeners
        for (const listener of this._globalListeners) {
            try {
                listener(event);
            } catch (e) {
                console.error('AOI global listener error:', e);
            }
        }
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建网格 AOI 管理器
 * @en Create grid AOI manager
 *
 * @param cellSize - @zh 网格单元格大小 @en Grid cell size
 */
export function createGridAOI<T>(cellSize: number = 100): GridAOI<T> {
    return new GridAOI<T>({ cellSize });
}
