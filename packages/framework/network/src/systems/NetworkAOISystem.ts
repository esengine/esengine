/**
 * @zh 网络 AOI 系统
 * @en Network AOI System
 *
 * @zh 集成 AOI 兴趣区域管理，过滤网络同步数据
 * @en Integrates AOI interest management to filter network sync data
 */

import { EntitySystem, Matcher, type Entity } from '@esengine/ecs-framework'
import { NetworkIdentity } from '../components/NetworkIdentity'
import { NetworkTransform } from '../components/NetworkTransform'
import type { EntitySyncState } from '../protocol'

// =============================================================================
// Types | 类型定义
// =============================================================================

/**
 * @zh AOI 事件类型
 * @en AOI event type
 */
export type NetworkAOIEventType = 'enter' | 'exit'

/**
 * @zh AOI 事件
 * @en AOI event
 */
export interface NetworkAOIEvent {
    /**
     * @zh 事件类型
     * @en Event type
     */
    type: NetworkAOIEventType

    /**
     * @zh 观察者网络 ID（玩家）
     * @en Observer network ID (player)
     */
    observerNetId: number

    /**
     * @zh 目标网络 ID（进入/离开视野的实体）
     * @en Target network ID (entity entering/exiting view)
     */
    targetNetId: number
}

/**
 * @zh AOI 事件监听器
 * @en AOI event listener
 */
export type NetworkAOIEventListener = (event: NetworkAOIEvent) => void

/**
 * @zh 网络 AOI 配置
 * @en Network AOI configuration
 */
export interface NetworkAOIConfig {
    /**
     * @zh 网格单元格大小
     * @en Grid cell size
     */
    cellSize: number

    /**
     * @zh 默认视野范围
     * @en Default view range
     */
    defaultViewRange: number

    /**
     * @zh 是否启用 AOI 过滤
     * @en Whether to enable AOI filtering
     */
    enabled: boolean
}

const DEFAULT_CONFIG: NetworkAOIConfig = {
    cellSize: 100,
    defaultViewRange: 500,
    enabled: true,
}

/**
 * @zh 观察者数据
 * @en Observer data
 */
interface ObserverData {
    netId: number
    position: { x: number; y: number }
    viewRange: number
    viewRangeSq: number
    cellKey: string
    visibleEntities: Set<number>
}

// =============================================================================
// NetworkAOISystem | 网络 AOI 系统
// =============================================================================

/**
 * @zh 网络 AOI 系统
 * @en Network AOI system
 *
 * @zh 管理网络实体的兴趣区域，过滤同步数据
 * @en Manages network entities' areas of interest and filters sync data
 */
export class NetworkAOISystem extends EntitySystem {
    private readonly _config: NetworkAOIConfig
    private readonly _observers: Map<number, ObserverData> = new Map()
    private readonly _cells: Map<string, Set<number>> = new Map()
    private readonly _listeners: Set<NetworkAOIEventListener> = new Set()
    private readonly _entityNetIdMap: Map<Entity, number> = new Map()
    private readonly _netIdEntityMap: Map<number, Entity> = new Map()

    constructor(config?: Partial<NetworkAOIConfig>) {
        super(Matcher.all(NetworkIdentity, NetworkTransform))
        this._config = { ...DEFAULT_CONFIG, ...config }
    }

    /**
     * @zh 获取配置
     * @en Get configuration
     */
    get config(): Readonly<NetworkAOIConfig> {
        return this._config
    }

    /**
     * @zh 是否启用
     * @en Is enabled
     */
    get enabled(): boolean {
        return this._config.enabled
    }

    set enabled(value: boolean) {
        this._config.enabled = value
    }

    /**
     * @zh 观察者数量
     * @en Observer count
     */
    get observerCount(): number {
        return this._observers.size
    }

    // =========================================================================
    // 观察者管理 | Observer Management
    // =========================================================================

    /**
     * @zh 添加观察者（通常是玩家实体）
     * @en Add observer (usually player entity)
     */
    addObserver(netId: number, x: number, y: number, viewRange?: number): void {
        if (this._observers.has(netId)) {
            this.updateObserverPosition(netId, x, y)
            return
        }

        const range = viewRange ?? this._config.defaultViewRange
        const cellKey = this._getCellKey(x, y)
        const data: ObserverData = {
            netId,
            position: { x, y },
            viewRange: range,
            viewRangeSq: range * range,
            cellKey,
            visibleEntities: new Set(),
        }

        this._observers.set(netId, data)
        this._addToCell(cellKey, netId)
        this._updateVisibility(data)
    }

    /**
     * @zh 移除观察者
     * @en Remove observer
     */
    removeObserver(netId: number): boolean {
        const data = this._observers.get(netId)
        if (!data) return false

        // Emit exit events for all visible entities
        for (const visibleNetId of data.visibleEntities) {
            this._emitEvent({
                type: 'exit',
                observerNetId: netId,
                targetNetId: visibleNetId,
            })
        }

        this._removeFromCell(data.cellKey, netId)
        this._observers.delete(netId)
        return true
    }

    /**
     * @zh 更新观察者位置
     * @en Update observer position
     */
    updateObserverPosition(netId: number, x: number, y: number): void {
        const data = this._observers.get(netId)
        if (!data) return

        const newCellKey = this._getCellKey(x, y)
        if (newCellKey !== data.cellKey) {
            this._removeFromCell(data.cellKey, netId)
            data.cellKey = newCellKey
            this._addToCell(newCellKey, netId)
        }

        data.position.x = x
        data.position.y = y
        this._updateVisibility(data)
    }

    /**
     * @zh 更新观察者视野范围
     * @en Update observer view range
     */
    updateObserverViewRange(netId: number, viewRange: number): void {
        const data = this._observers.get(netId)
        if (!data) return

        data.viewRange = viewRange
        data.viewRangeSq = viewRange * viewRange
        this._updateVisibility(data)
    }

    // =========================================================================
    // 实体管理 | Entity Management
    // =========================================================================

    /**
     * @zh 注册网络实体
     * @en Register network entity
     */
    registerEntity(entity: Entity, netId: number): void {
        this._entityNetIdMap.set(entity, netId)
        this._netIdEntityMap.set(netId, entity)
    }

    /**
     * @zh 注销网络实体
     * @en Unregister network entity
     */
    unregisterEntity(entity: Entity): void {
        const netId = this._entityNetIdMap.get(entity)
        if (netId !== undefined) {
            // Remove from all observers' visible sets
            for (const [, data] of this._observers) {
                if (data.visibleEntities.has(netId)) {
                    data.visibleEntities.delete(netId)
                    this._emitEvent({
                        type: 'exit',
                        observerNetId: data.netId,
                        targetNetId: netId,
                    })
                }
            }
            this._netIdEntityMap.delete(netId)
        }
        this._entityNetIdMap.delete(entity)
    }

    // =========================================================================
    // 查询接口 | Query Interface
    // =========================================================================

    /**
     * @zh 获取观察者能看到的实体网络 ID 列表
     * @en Get list of entity network IDs visible to observer
     */
    getVisibleEntities(observerNetId: number): number[] {
        const data = this._observers.get(observerNetId)
        return data ? Array.from(data.visibleEntities) : []
    }

    /**
     * @zh 获取能看到指定实体的观察者网络 ID 列表
     * @en Get list of observer network IDs that can see the entity
     */
    getObserversOf(entityNetId: number): number[] {
        const observers: number[] = []
        for (const [, data] of this._observers) {
            if (data.visibleEntities.has(entityNetId)) {
                observers.push(data.netId)
            }
        }
        return observers
    }

    /**
     * @zh 检查观察者是否能看到目标
     * @en Check if observer can see target
     */
    canSee(observerNetId: number, targetNetId: number): boolean {
        const data = this._observers.get(observerNetId)
        return data?.visibleEntities.has(targetNetId) ?? false
    }

    /**
     * @zh 过滤同步数据，只保留观察者能看到的实体
     * @en Filter sync data to only include entities visible to observer
     */
    filterSyncData(observerNetId: number, entities: EntitySyncState[]): EntitySyncState[] {
        if (!this._config.enabled) {
            return entities
        }

        const data = this._observers.get(observerNetId)
        if (!data) {
            return entities
        }

        return entities.filter(entity => {
            // Always include the observer's own entity
            if (entity.netId === observerNetId) return true
            // Include entities in view
            return data.visibleEntities.has(entity.netId)
        })
    }

    // =========================================================================
    // 事件系统 | Event System
    // =========================================================================

    /**
     * @zh 添加事件监听器
     * @en Add event listener
     */
    addListener(listener: NetworkAOIEventListener): void {
        this._listeners.add(listener)
    }

    /**
     * @zh 移除事件监听器
     * @en Remove event listener
     */
    removeListener(listener: NetworkAOIEventListener): void {
        this._listeners.delete(listener)
    }

    // =========================================================================
    // 系统生命周期 | System Lifecycle
    // =========================================================================

    protected override process(entities: readonly Entity[]): void {
        if (!this._config.enabled) return

        // Update entity positions for AOI calculations
        for (const entity of entities) {
            const identity = this.requireComponent(entity, NetworkIdentity)
            const transform = this.requireComponent(entity, NetworkTransform)

            // Register entity if not already registered
            if (!this._entityNetIdMap.has(entity)) {
                this.registerEntity(entity, identity.netId)
            }

            // If this entity is an observer (has authority), update its position
            if (identity.bHasAuthority && this._observers.has(identity.netId)) {
                this.updateObserverPosition(
                    identity.netId,
                    transform.currentX,
                    transform.currentY
                )
            }
        }

        // Update all observers' visibility based on entity positions
        this._updateAllObserversVisibility(entities)
    }

    private _updateAllObserversVisibility(entities: readonly Entity[]): void {
        for (const [, data] of this._observers) {
            const newVisible = new Set<number>()

            // Check all entities
            for (const entity of entities) {
                const identity = this.requireComponent(entity, NetworkIdentity)
                const transform = this.requireComponent(entity, NetworkTransform)

                // Skip self
                if (identity.netId === data.netId) continue

                // Check distance
                const dx = transform.currentX - data.position.x
                const dy = transform.currentY - data.position.y
                const distSq = dx * dx + dy * dy

                if (distSq <= data.viewRangeSq) {
                    newVisible.add(identity.netId)
                }
            }

            // Find entities that entered view
            for (const netId of newVisible) {
                if (!data.visibleEntities.has(netId)) {
                    this._emitEvent({
                        type: 'enter',
                        observerNetId: data.netId,
                        targetNetId: netId,
                    })
                }
            }

            // Find entities that exited view
            for (const netId of data.visibleEntities) {
                if (!newVisible.has(netId)) {
                    this._emitEvent({
                        type: 'exit',
                        observerNetId: data.netId,
                        targetNetId: netId,
                    })
                }
            }

            data.visibleEntities = newVisible
        }
    }

    /**
     * @zh 清除所有数据
     * @en Clear all data
     */
    clear(): void {
        this._observers.clear()
        this._cells.clear()
        this._entityNetIdMap.clear()
        this._netIdEntityMap.clear()
    }

    protected override onDestroy(): void {
        this.clear()
        this._listeners.clear()
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    private _getCellKey(x: number, y: number): string {
        const cellX = Math.floor(x / this._config.cellSize)
        const cellY = Math.floor(y / this._config.cellSize)
        return `${cellX},${cellY}`
    }

    private _addToCell(cellKey: string, netId: number): void {
        let cell = this._cells.get(cellKey)
        if (!cell) {
            cell = new Set()
            this._cells.set(cellKey, cell)
        }
        cell.add(netId)
    }

    private _removeFromCell(cellKey: string, netId: number): void {
        const cell = this._cells.get(cellKey)
        if (cell) {
            cell.delete(netId)
            if (cell.size === 0) {
                this._cells.delete(cellKey)
            }
        }
    }

    private _updateVisibility(data: ObserverData): void {
        // This is called when an observer moves
        // The full visibility update happens in process() with all entities
    }

    private _emitEvent(event: NetworkAOIEvent): void {
        for (const listener of this._listeners) {
            try {
                listener(event)
            } catch (e) {
                console.error('[NetworkAOISystem] Listener error:', e)
            }
        }
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建网络 AOI 系统
 * @en Create network AOI system
 */
export function createNetworkAOISystem(
    config?: Partial<NetworkAOIConfig>
): NetworkAOISystem {
    return new NetworkAOISystem(config)
}
