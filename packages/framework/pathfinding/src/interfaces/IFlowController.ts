/**
 * @zh 流量控制器接口
 * @en Flow Controller Interface
 *
 * @zh 管理拥堵区域的代理通行，防止死锁
 * @en Manages agent passage through congested areas, prevents deadlocks
 */

import type { IVector2 } from './IPathPlanner';

// =============================================================================
// 通行许可 | Pass Permission
// =============================================================================

/**
 * @zh 通行许可类型
 * @en Pass permission type
 */
export enum PassPermission {
    /**
     * @zh 可以通行
     * @en Can proceed
     */
    Proceed = 'proceed',

    /**
     * @zh 需要等待
     * @en Need to wait
     */
    Wait = 'wait',

    /**
     * @zh 需要让路（减速或侧移）
     * @en Need to yield (slow down or move aside)
     */
    Yield = 'yield'
}

// =============================================================================
// 拥堵区域 | Congestion Zone
// =============================================================================

/**
 * @zh 拥堵区域
 * @en Congestion zone
 */
export interface ICongestionZone {
    /**
     * @zh 区域 ID
     * @en Zone ID
     */
    id: number;

    /**
     * @zh 区域中心
     * @en Zone center
     */
    center: IVector2;

    /**
     * @zh 区域半径
     * @en Zone radius
     */
    radius: number;

    /**
     * @zh 区域内的代理 ID 列表
     * @en List of agent IDs in the zone
     */
    agentIds: number[];

    /**
     * @zh 区域容量（可同时通过的代理数）
     * @en Zone capacity (agents that can pass simultaneously)
     */
    capacity: number;

    /**
     * @zh 拥堵程度 (0-1, 1 表示完全堵塞)
     * @en Congestion level (0-1, 1 means fully blocked)
     */
    congestionLevel: number;
}

// =============================================================================
// 代理流量数据 | Agent Flow Data
// =============================================================================

/**
 * @zh 代理流量数据
 * @en Agent flow data
 */
export interface IFlowAgentData {
    /**
     * @zh 代理 ID
     * @en Agent ID
     */
    id: number;

    /**
     * @zh 当前位置
     * @en Current position
     */
    position: IVector2;

    /**
     * @zh 目标位置
     * @en Destination position
     */
    destination: IVector2 | null;

    /**
     * @zh 当前路径点
     * @en Current waypoint
     */
    currentWaypoint: IVector2 | null;

    /**
     * @zh 代理半径
     * @en Agent radius
     */
    radius: number;

    /**
     * @zh 优先级（数值越小优先级越高）
     * @en Priority (lower number = higher priority)
     */
    priority: number;

    /**
     * @zh 进入拥堵区域的时间戳
     * @en Timestamp when entered congestion zone
     */
    enterTime?: number;
}

// =============================================================================
// 流量控制结果 | Flow Control Result
// =============================================================================

/**
 * @zh 流量控制结果
 * @en Flow control result
 */
export interface IFlowControlResult {
    /**
     * @zh 通行许可
     * @en Pass permission
     */
    permission: PassPermission;

    /**
     * @zh 如果需要等待，等待位置
     * @en Wait position if waiting is required
     */
    waitPosition: IVector2 | null;

    /**
     * @zh 如果需要让路，建议的速度倍率 (0-1)
     * @en Suggested speed multiplier if yielding (0-1)
     */
    speedMultiplier: number;

    /**
     * @zh 所在的拥堵区域（如果有）
     * @en Congestion zone the agent is in (if any)
     */
    zone: ICongestionZone | null;

    /**
     * @zh 在队列中的位置（0 表示最前）
     * @en Position in queue (0 means front)
     */
    queuePosition: number;
}

// =============================================================================
// 流量控制器接口 | Flow Controller Interface
// =============================================================================

/**
 * @zh 流量控制器配置
 * @en Flow controller configuration
 */
export interface IFlowControllerConfig {
    /**
     * @zh 拥堵检测半径
     * @en Congestion detection radius
     */
    detectionRadius?: number;

    /**
     * @zh 触发拥堵的最小代理数
     * @en Minimum agents to trigger congestion
     */
    minAgentsForCongestion?: number;

    /**
     * @zh 默认区域容量
     * @en Default zone capacity
     */
    defaultCapacity?: number;

    /**
     * @zh 等待点距离（到拥堵区域边缘的距离）
     * @en Wait point distance (from congestion zone edge)
     */
    waitPointDistance?: number;

    /**
     * @zh 让路速度倍率
     * @en Yield speed multiplier
     */
    yieldSpeedMultiplier?: number;
}

/**
 * @zh 默认流量控制器配置
 * @en Default flow controller configuration
 */
export const DEFAULT_FLOW_CONTROLLER_CONFIG: Required<IFlowControllerConfig> = {
    detectionRadius: 3.0,
    minAgentsForCongestion: 3,
    defaultCapacity: 2,
    waitPointDistance: 1.5,
    yieldSpeedMultiplier: 0.3
};

/**
 * @zh 流量控制器接口
 * @en Flow controller interface
 *
 * @zh 管理代理在拥堵区域的通行顺序，防止死锁和回头现象
 * @en Manages agent passage order in congested areas, prevents deadlocks and turning back
 *
 * @example
 * ```typescript
 * const flowController = createFlowController();
 * navSystem.setFlowController(flowController);
 *
 * // 流量控制会自动：
 * // 1. 检测拥堵区域
 * // 2. 分配通行优先级
 * // 3. 管理等待队列
 * ```
 */
export interface IFlowController {
    /**
     * @zh 控制器类型标识
     * @en Controller type identifier
     */
    readonly type: string;

    /**
     * @zh 更新流量控制状态
     * @en Update flow control state
     *
     * @param agents - @zh 所有代理数据 @en All agent data
     * @param deltaTime - @zh 时间步长 @en Time step
     */
    update(agents: readonly IFlowAgentData[], deltaTime: number): void;

    /**
     * @zh 获取代理的流量控制结果
     * @en Get flow control result for an agent
     *
     * @param agentId - @zh 代理 ID @en Agent ID
     * @returns @zh 流量控制结果 @en Flow control result
     */
    getFlowControl(agentId: number): IFlowControlResult;

    /**
     * @zh 获取所有检测到的拥堵区域
     * @en Get all detected congestion zones
     *
     * @returns @zh 拥堵区域列表 @en List of congestion zones
     */
    getCongestionZones(): readonly ICongestionZone[];

    /**
     * @zh 手动标记一个区域为拥堵区域
     * @en Manually mark an area as congestion zone
     *
     * @param center - @zh 区域中心 @en Zone center
     * @param radius - @zh 区域半径 @en Zone radius
     * @param capacity - @zh 区域容量 @en Zone capacity
     * @returns @zh 区域 ID @en Zone ID
     */
    addStaticZone(center: IVector2, radius: number, capacity: number): number;

    /**
     * @zh 移除手动标记的拥堵区域
     * @en Remove manually marked congestion zone
     *
     * @param zoneId - @zh 区域 ID @en Zone ID
     */
    removeStaticZone(zoneId: number): void;

    /**
     * @zh 清除所有状态
     * @en Clear all state
     */
    clear(): void;

    /**
     * @zh 释放资源
     * @en Dispose resources
     */
    dispose(): void;
}
