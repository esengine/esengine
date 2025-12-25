/**
 * @zh AOI (Area of Interest) 兴趣区域接口
 * @en AOI (Area of Interest) Interface
 *
 * @zh 提供 MMO 游戏中的兴趣区域管理能力
 * @en Provides area of interest management for MMO games
 */

import type { IVector2 } from '@esengine/ecs-framework-math';

// =============================================================================
// AOI 事件类型 | AOI Event Types
// =============================================================================

/**
 * @zh AOI 事件类型
 * @en AOI event type
 */
export type AOIEventType = 'enter' | 'exit' | 'update';

/**
 * @zh AOI 事件
 * @en AOI event
 */
export interface IAOIEvent<T> {
    /**
     * @zh 事件类型
     * @en Event type
     */
    readonly type: AOIEventType;

    /**
     * @zh 观察者（谁看到了变化）
     * @en Observer (who saw the change)
     */
    readonly observer: T;

    /**
     * @zh 目标（发生变化的对象）
     * @en Target (the object that changed)
     */
    readonly target: T;

    /**
     * @zh 目标位置
     * @en Target position
     */
    readonly position: IVector2;
}

/**
 * @zh AOI 事件监听器
 * @en AOI event listener
 */
export type AOIEventListener<T> = (event: IAOIEvent<T>) => void;

// =============================================================================
// AOI 观察者接口 | AOI Observer Interface
// =============================================================================

/**
 * @zh AOI 观察者配置
 * @en AOI observer configuration
 */
export interface IAOIObserverConfig {
    /**
     * @zh 视野范围
     * @en View range
     */
    viewRange: number;

    /**
     * @zh 是否是可被观察的对象（默认 true）
     * @en Whether this observer can be observed by others (default true)
     */
    observable?: boolean;
}

// =============================================================================
// AOI 管理器接口 | AOI Manager Interface
// =============================================================================

/**
 * @zh AOI 管理器接口
 * @en AOI manager interface
 *
 * @zh 管理兴趣区域，追踪对象的进入/离开事件
 * @en Manages areas of interest, tracking enter/exit events for objects
 *
 * @typeParam T - @zh 被管理对象的类型 @en Type of managed objects
 */
export interface IAOIManager<T> {
    /**
     * @zh 添加观察者
     * @en Add observer
     *
     * @param entity - @zh 实体对象 @en Entity object
     * @param position - @zh 初始位置 @en Initial position
     * @param config - @zh 观察者配置 @en Observer configuration
     */
    addObserver(entity: T, position: IVector2, config: IAOIObserverConfig): void;

    /**
     * @zh 移除观察者
     * @en Remove observer
     *
     * @param entity - @zh 实体对象 @en Entity object
     * @returns @zh 是否成功移除 @en Whether removal was successful
     */
    removeObserver(entity: T): boolean;

    /**
     * @zh 更新观察者位置
     * @en Update observer position
     *
     * @param entity - @zh 实体对象 @en Entity object
     * @param newPosition - @zh 新位置 @en New position
     * @returns @zh 是否成功更新 @en Whether update was successful
     */
    updatePosition(entity: T, newPosition: IVector2): boolean;

    /**
     * @zh 更新观察者视野范围
     * @en Update observer view range
     *
     * @param entity - @zh 实体对象 @en Entity object
     * @param newRange - @zh 新视野范围 @en New view range
     * @returns @zh 是否成功更新 @en Whether update was successful
     */
    updateViewRange(entity: T, newRange: number): boolean;

    /**
     * @zh 获取实体视野内的所有对象
     * @en Get all objects within entity's view
     *
     * @param entity - @zh 观察者实体 @en Observer entity
     * @returns @zh 视野内的对象数组 @en Array of objects within view
     */
    getEntitiesInView(entity: T): T[];

    /**
     * @zh 获取能看到指定实体的所有观察者
     * @en Get all observers who can see the specified entity
     *
     * @param entity - @zh 目标实体 @en Target entity
     * @returns @zh 能看到目标的观察者数组 @en Array of observers who can see target
     */
    getObserversOf(entity: T): T[];

    /**
     * @zh 检查观察者是否能看到目标
     * @en Check if observer can see target
     *
     * @param observer - @zh 观察者 @en Observer
     * @param target - @zh 目标 @en Target
     * @returns @zh 是否在视野内 @en Whether target is in view
     */
    canSee(observer: T, target: T): boolean;

    /**
     * @zh 添加事件监听器
     * @en Add event listener
     *
     * @param listener - @zh 监听器函数 @en Listener function
     */
    addListener(listener: AOIEventListener<T>): void;

    /**
     * @zh 移除事件监听器
     * @en Remove event listener
     *
     * @param listener - @zh 监听器函数 @en Listener function
     */
    removeListener(listener: AOIEventListener<T>): void;

    /**
     * @zh 为特定观察者添加事件监听器
     * @en Add event listener for specific observer
     *
     * @param entity - @zh 观察者实体 @en Observer entity
     * @param listener - @zh 监听器函数 @en Listener function
     */
    addEntityListener(entity: T, listener: AOIEventListener<T>): void;

    /**
     * @zh 移除特定观察者的事件监听器
     * @en Remove event listener for specific observer
     *
     * @param entity - @zh 观察者实体 @en Observer entity
     * @param listener - @zh 监听器函数 @en Listener function
     */
    removeEntityListener(entity: T, listener: AOIEventListener<T>): void;

    /**
     * @zh 清空所有观察者
     * @en Clear all observers
     */
    clear(): void;

    /**
     * @zh 获取观察者数量
     * @en Get observer count
     */
    readonly count: number;
}
