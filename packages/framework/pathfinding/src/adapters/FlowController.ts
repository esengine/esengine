/**
 * @zh 流量控制器实现
 * @en Flow Controller Implementation
 *
 * @zh 管理拥堵区域的代理通行，使用 FIFO + 优先级策略防止死锁
 * @en Manages agent passage through congested areas using FIFO + priority to prevent deadlocks
 */

import type { IVector2 } from '../interfaces/IPathPlanner';
import type {
    IFlowController,
    IFlowControllerConfig,
    IFlowAgentData,
    IFlowControlResult,
    ICongestionZone
} from '../interfaces/IFlowController';
import {
    PassPermission,
    DEFAULT_FLOW_CONTROLLER_CONFIG
} from '../interfaces/IFlowController';

// =============================================================================
// 内部类型 | Internal Types
// =============================================================================

/**
 * @zh 代理队列项
 * @en Agent queue item
 */
interface QueueEntry {
    agentId: number;
    enterTime: number;
    priority: number;
}

/**
 * @zh 区域状态
 * @en Zone state
 */
interface ZoneState {
    zone: ICongestionZone;
    queue: QueueEntry[];
    passingAgents: Set<number>;
    isStatic: boolean;
}

// =============================================================================
// 流量控制器 | Flow Controller
// =============================================================================

/**
 * @zh 流量控制器
 * @en Flow Controller
 *
 * @zh 检测拥堵区域并管理代理通行顺序
 * @en Detects congestion zones and manages agent passage order
 *
 * @example
 * ```typescript
 * const flowController = createFlowController({
 *     detectionRadius: 3.0,
 *     minAgentsForCongestion: 3,
 *     defaultCapacity: 2
 * });
 *
 * // 每帧更新
 * flowController.update(agents, deltaTime);
 *
 * // 获取代理的流量控制
 * const result = flowController.getFlowControl(agentId);
 * if (result.permission === PassPermission.Wait) {
 *     // 移动到等待位置
 *     agent.setDestination(result.waitPosition);
 * }
 * ```
 */
export class FlowController implements IFlowController {
    readonly type = 'fifo-priority';

    private config: Required<IFlowControllerConfig>;
    private zoneStates: Map<number, ZoneState> = new Map();
    private agentZoneMap: Map<number, number> = new Map();
    private agentResults: Map<number, IFlowControlResult> = new Map();
    private nextZoneId: number = 1;
    private currentTime: number = 0;

    constructor(config: IFlowControllerConfig = {}) {
        this.config = { ...DEFAULT_FLOW_CONTROLLER_CONFIG, ...config };
    }

    /**
     * @zh 更新流量控制状态
     * @en Update flow control state
     */
    update(agents: readonly IFlowAgentData[], deltaTime: number): void {
        this.currentTime += deltaTime;
        this.agentResults.clear();

        // Step 1: 检测动态拥堵区域
        this.detectDynamicCongestion(agents);

        // Step 2: 更新每个区域的队列
        this.updateZoneQueues(agents);

        // Step 3: 计算每个代理的流量控制结果
        this.computeFlowControlResults(agents);

        // Step 4: 清理空的动态区域
        this.cleanupEmptyZones();
    }

    /**
     * @zh 获取代理的流量控制结果
     * @en Get flow control result for an agent
     */
    getFlowControl(agentId: number): IFlowControlResult {
        return this.agentResults.get(agentId) ?? {
            permission: PassPermission.Proceed,
            waitPosition: null,
            speedMultiplier: 1.0,
            zone: null,
            queuePosition: 0
        };
    }

    /**
     * @zh 获取所有拥堵区域
     * @en Get all congestion zones
     */
    getCongestionZones(): readonly ICongestionZone[] {
        return Array.from(this.zoneStates.values()).map(s => s.zone);
    }

    /**
     * @zh 添加静态拥堵区域
     * @en Add static congestion zone
     */
    addStaticZone(center: IVector2, radius: number, capacity: number): number {
        const zoneId = this.nextZoneId++;
        const zone: ICongestionZone = {
            id: zoneId,
            center: { x: center.x, y: center.y },
            radius,
            agentIds: [],
            capacity,
            congestionLevel: 0
        };

        this.zoneStates.set(zoneId, {
            zone,
            queue: [],
            passingAgents: new Set(),
            isStatic: true
        });

        return zoneId;
    }

    /**
     * @zh 移除静态拥堵区域
     * @en Remove static congestion zone
     */
    removeStaticZone(zoneId: number): void {
        const state = this.zoneStates.get(zoneId);
        if (state?.isStatic) {
            for (const agentId of state.zone.agentIds) {
                this.agentZoneMap.delete(agentId);
            }
            this.zoneStates.delete(zoneId);
        }
    }

    /**
     * @zh 清除所有状态
     * @en Clear all state
     */
    clear(): void {
        this.zoneStates.clear();
        this.agentZoneMap.clear();
        this.agentResults.clear();
        this.currentTime = 0;
    }

    /**
     * @zh 释放资源
     * @en Dispose resources
     */
    dispose(): void {
        this.clear();
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    /**
     * @zh 检测动态拥堵区域
     * @en Detect dynamic congestion zones
     */
    private detectDynamicCongestion(agents: readonly IFlowAgentData[]): void {
        const clusters = this.clusterAgents(agents);

        for (const cluster of clusters) {
            if (cluster.length < this.config.minAgentsForCongestion) {
                continue;
            }

            const center = this.computeClusterCenter(cluster);
            const radius = this.computeClusterRadius(cluster, center);

            const existingZone = this.findZoneContaining(center);
            if (existingZone && !existingZone.isStatic) {
                this.updateDynamicZone(existingZone, cluster, center, radius);
            } else if (!existingZone) {
                this.createDynamicZone(cluster, center, radius);
            }
        }
    }

    /**
     * @zh 聚类代理
     * @en Cluster agents
     */
    private clusterAgents(agents: readonly IFlowAgentData[]): IFlowAgentData[][] {
        const clusters: IFlowAgentData[][] = [];
        const visited = new Set<number>();
        const detectionRadiusSq = this.config.detectionRadius * this.config.detectionRadius;

        for (const agent of agents) {
            if (visited.has(agent.id) || !agent.destination) {
                continue;
            }

            const cluster: IFlowAgentData[] = [agent];
            visited.add(agent.id);

            const queue = [agent];
            while (queue.length > 0) {
                const current = queue.shift()!;

                for (const other of agents) {
                    if (visited.has(other.id) || !other.destination) {
                        continue;
                    }

                    const dx = other.position.x - current.position.x;
                    const dy = other.position.y - current.position.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq <= detectionRadiusSq) {
                        visited.add(other.id);
                        cluster.push(other);
                        queue.push(other);
                    }
                }
            }

            if (cluster.length >= this.config.minAgentsForCongestion) {
                clusters.push(cluster);
            }
        }

        return clusters;
    }

    /**
     * @zh 计算聚类中心
     * @en Compute cluster center
     */
    private computeClusterCenter(cluster: readonly IFlowAgentData[]): IVector2 {
        let sumX = 0, sumY = 0;
        for (const agent of cluster) {
            sumX += agent.position.x;
            sumY += agent.position.y;
        }
        return {
            x: sumX / cluster.length,
            y: sumY / cluster.length
        };
    }

    /**
     * @zh 计算聚类半径
     * @en Compute cluster radius
     */
    private computeClusterRadius(cluster: readonly IFlowAgentData[], center: IVector2): number {
        let maxDistSq = 0;
        for (const agent of cluster) {
            const dx = agent.position.x - center.x;
            const dy = agent.position.y - center.y;
            const distSq = dx * dx + dy * dy;
            maxDistSq = Math.max(maxDistSq, distSq);
        }
        return Math.sqrt(maxDistSq) + this.config.detectionRadius * 0.5;
    }

    /**
     * @zh 查找包含点的区域
     * @en Find zone containing point
     */
    private findZoneContaining(point: IVector2): ZoneState | null {
        for (const state of this.zoneStates.values()) {
            const dx = point.x - state.zone.center.x;
            const dy = point.y - state.zone.center.y;
            const distSq = dx * dx + dy * dy;
            if (distSq <= state.zone.radius * state.zone.radius) {
                return state;
            }
        }
        return null;
    }

    /**
     * @zh 更新动态区域
     * @en Update dynamic zone
     */
    private updateDynamicZone(
        state: ZoneState,
        cluster: readonly IFlowAgentData[],
        center: IVector2,
        radius: number
    ): void {
        state.zone.center = center;
        state.zone.radius = Math.max(state.zone.radius, radius);
        state.zone.agentIds = cluster.map(a => a.id);
        state.zone.congestionLevel = Math.min(1, cluster.length / (state.zone.capacity * 2));
    }

    /**
     * @zh 创建动态区域
     * @en Create dynamic zone
     */
    private createDynamicZone(
        cluster: readonly IFlowAgentData[],
        center: IVector2,
        radius: number
    ): void {
        const zoneId = this.nextZoneId++;

        const capacityEstimate = Math.max(
            this.config.defaultCapacity,
            Math.floor((Math.PI * radius * radius) / (Math.PI * 0.5 * 0.5 * 4))
        );

        const zone: ICongestionZone = {
            id: zoneId,
            center,
            radius,
            agentIds: cluster.map(a => a.id),
            capacity: capacityEstimate,
            congestionLevel: Math.min(1, cluster.length / (capacityEstimate * 2))
        };

        this.zoneStates.set(zoneId, {
            zone,
            queue: [],
            passingAgents: new Set(),
            isStatic: false
        });
    }

    /**
     * @zh 更新区域队列
     * @en Update zone queues
     */
    private updateZoneQueues(agents: readonly IFlowAgentData[]): void {
        const agentMap = new Map(agents.map(a => [a.id, a]));

        for (const state of this.zoneStates.values()) {
            const zone = state.zone;
            const newAgentIds: number[] = [];

            for (const agent of agents) {
                if (!agent.destination) continue;

                const dx = agent.position.x - zone.center.x;
                const dy = agent.position.y - zone.center.y;
                const distSq = dx * dx + dy * dy;
                const expandedRadius = zone.radius + this.config.waitPointDistance;

                if (distSq <= expandedRadius * expandedRadius) {
                    newAgentIds.push(agent.id);

                    const existingEntry = state.queue.find(e => e.agentId === agent.id);
                    if (!existingEntry) {
                        state.queue.push({
                            agentId: agent.id,
                            enterTime: agent.enterTime ?? this.currentTime,
                            priority: agent.priority
                        });
                        this.agentZoneMap.set(agent.id, zone.id);
                    }
                }
            }

            state.queue = state.queue.filter(entry => {
                const agent = agentMap.get(entry.agentId);
                if (!agent || !agent.destination) {
                    state.passingAgents.delete(entry.agentId);
                    this.agentZoneMap.delete(entry.agentId);
                    return false;
                }

                const dx = agent.position.x - zone.center.x;
                const dy = agent.position.y - zone.center.y;
                const distSq = dx * dx + dy * dy;
                const expandedRadius = zone.radius + this.config.waitPointDistance * 2;

                if (distSq > expandedRadius * expandedRadius) {
                    state.passingAgents.delete(entry.agentId);
                    this.agentZoneMap.delete(entry.agentId);
                    return false;
                }

                return true;
            });

            state.queue.sort((a, b) => {
                if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                return a.enterTime - b.enterTime;
            });

            zone.agentIds = state.queue.map(e => e.agentId);
            zone.congestionLevel = Math.min(1, zone.agentIds.length / (zone.capacity * 2));
        }
    }

    /**
     * @zh 计算流量控制结果
     * @en Compute flow control results
     */
    private computeFlowControlResults(agents: readonly IFlowAgentData[]): void {
        const agentMap = new Map(agents.map(a => [a.id, a]));

        for (const state of this.zoneStates.values()) {
            const zone = state.zone;
            const capacity = zone.capacity;

            let passingCount = 0;
            for (const entry of state.queue) {
                const agent = agentMap.get(entry.agentId);
                if (!agent) continue;

                const dx = agent.position.x - zone.center.x;
                const dy = agent.position.y - zone.center.y;
                const distSq = dx * dx + dy * dy;
                const isInsideZone = distSq <= zone.radius * zone.radius;

                const queuePosition = state.queue.findIndex(e => e.agentId === entry.agentId);

                if (passingCount < capacity) {
                    state.passingAgents.add(entry.agentId);
                    passingCount++;

                    const speedMult = isInsideZone && zone.congestionLevel > 0.5
                        ? 1.0 - (zone.congestionLevel - 0.5)
                        : 1.0;

                    this.agentResults.set(entry.agentId, {
                        permission: PassPermission.Proceed,
                        waitPosition: null,
                        speedMultiplier: speedMult,
                        zone,
                        queuePosition
                    });
                } else if (state.passingAgents.has(entry.agentId) && isInsideZone) {
                    this.agentResults.set(entry.agentId, {
                        permission: PassPermission.Yield,
                        waitPosition: null,
                        speedMultiplier: this.config.yieldSpeedMultiplier,
                        zone,
                        queuePosition
                    });
                } else {
                    const waitPos = this.computeWaitPosition(agent, zone);
                    this.agentResults.set(entry.agentId, {
                        permission: PassPermission.Wait,
                        waitPosition: waitPos,
                        speedMultiplier: 0,
                        zone,
                        queuePosition
                    });
                }
            }
        }
    }

    /**
     * @zh 计算等待位置
     * @en Compute wait position
     */
    private computeWaitPosition(agent: IFlowAgentData, zone: ICongestionZone): IVector2 {
        const dx = agent.position.x - zone.center.x;
        const dy = agent.position.y - zone.center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.001) {
            return {
                x: zone.center.x + zone.radius + this.config.waitPointDistance,
                y: zone.center.y
            };
        }

        const dirX = dx / dist;
        const dirY = dy / dist;
        const waitDist = zone.radius + this.config.waitPointDistance;

        return {
            x: zone.center.x + dirX * waitDist,
            y: zone.center.y + dirY * waitDist
        };
    }

    /**
     * @zh 清理空的动态区域
     * @en Cleanup empty dynamic zones
     */
    private cleanupEmptyZones(): void {
        const toRemove: number[] = [];

        for (const [zoneId, state] of this.zoneStates) {
            if (!state.isStatic && state.queue.length === 0) {
                toRemove.push(zoneId);
            }
        }

        for (const zoneId of toRemove) {
            this.zoneStates.delete(zoneId);
        }
    }
}

/**
 * @zh 创建流量控制器
 * @en Create flow controller
 *
 * @param config - @zh 配置参数 @en Configuration
 * @returns @zh 流量控制器实例 @en Flow controller instance
 */
export function createFlowController(config?: IFlowControllerConfig): FlowController {
    return new FlowController(config);
}
