/**
 * @zh 负载均衡路由器
 * @en Load-balanced router for server selection
 */

import type { ServerRegistration } from '../types.js';

/**
 * @zh 负载均衡策略
 * @en Load balancing strategy
 */
export type LoadBalanceStrategy =
    | 'round-robin'    // 轮询
    | 'least-rooms'    // 最少房间
    | 'least-players'  // 最少玩家
    | 'random'         // 随机
    | 'weighted';      // 加权（基于剩余容量）

/**
 * @zh 负载均衡路由器配置
 * @en Load-balanced router configuration
 */
export interface LoadBalancedRouterConfig {
    /**
     * @zh 负载均衡策略
     * @en Load balancing strategy
     * @default 'least-rooms'
     */
    strategy?: LoadBalanceStrategy;

    /**
     * @zh 本地服务器优先
     * @en Prefer local server
     * @default true
     */
    preferLocal?: boolean;

    /**
     * @zh 本地服务器优先阈值（0-1之间，表示本地服务器负载低于此比例时优先使用本地）
     * @en Local server preference threshold (0-1, prefer local if load is below this ratio)
     * @default 0.8
     */
    localPreferenceThreshold?: number;
}

/**
 * @zh 负载均衡路由器
 * @en Load-balanced router for selecting optimal server
 *
 * @example
 * ```typescript
 * const router = new LoadBalancedRouter({
 *     strategy: 'least-rooms',
 *     preferLocal: true
 * });
 *
 * const bestServer = router.selectServer(servers, 'server-1');
 * ```
 */
export class LoadBalancedRouter {
    private readonly _config: Required<LoadBalancedRouterConfig>;
    private _roundRobinIndex = 0;

    constructor(config: LoadBalancedRouterConfig = {}) {
        this._config = {
            strategy: config.strategy ?? 'least-rooms',
            preferLocal: config.preferLocal ?? true,
            localPreferenceThreshold: config.localPreferenceThreshold ?? 0.8
        };
    }

    /**
     * @zh 选择最优服务器
     * @en Select optimal server
     *
     * @param servers - 可用服务器列表 | Available servers
     * @param localServerId - 本地服务器 ID | Local server ID
     * @returns 最优服务器，如果没有可用服务器返回 null | Optimal server, or null if none available
     */
    selectServer(
        servers: ServerRegistration[],
        localServerId?: string
    ): ServerRegistration | null {
        // 过滤掉不可用的服务器
        const availableServers = servers.filter(s =>
            s.status === 'online' && s.roomCount < s.capacity
        );

        if (availableServers.length === 0) {
            return null;
        }

        // 本地服务器优先检查
        if (this._config.preferLocal && localServerId) {
            const localServer = availableServers.find(s => s.serverId === localServerId);
            if (localServer) {
                const loadRatio = localServer.roomCount / localServer.capacity;
                if (loadRatio < this._config.localPreferenceThreshold) {
                    return localServer;
                }
            }
        }

        // 应用负载均衡策略
        switch (this._config.strategy) {
            case 'round-robin':
                return this._selectRoundRobin(availableServers);
            case 'least-rooms':
                return this._selectLeastRooms(availableServers);
            case 'least-players':
                return this._selectLeastPlayers(availableServers);
            case 'random':
                return this._selectRandom(availableServers);
            case 'weighted':
                return this._selectWeighted(availableServers);
            default:
                return this._selectLeastRooms(availableServers);
        }
    }

    /**
     * @zh 选择创建房间的最优服务器
     * @en Select optimal server for room creation
     */
    selectServerForCreation(
        servers: ServerRegistration[],
        localServerId?: string
    ): ServerRegistration | null {
        return this.selectServer(servers, localServerId);
    }

    /**
     * @zh 重置轮询索引
     * @en Reset round-robin index
     */
    resetRoundRobin(): void {
        this._roundRobinIndex = 0;
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    private _selectRoundRobin(servers: ServerRegistration[]): ServerRegistration {
        const server = servers[this._roundRobinIndex % servers.length];
        this._roundRobinIndex++;
        return server;
    }

    private _selectLeastRooms(servers: ServerRegistration[]): ServerRegistration {
        return servers.reduce((best, current) =>
            current.roomCount < best.roomCount ? current : best
        );
    }

    private _selectLeastPlayers(servers: ServerRegistration[]): ServerRegistration {
        return servers.reduce((best, current) =>
            current.playerCount < best.playerCount ? current : best
        );
    }

    private _selectRandom(servers: ServerRegistration[]): ServerRegistration {
        return servers[Math.floor(Math.random() * servers.length)];
    }

    private _selectWeighted(servers: ServerRegistration[]): ServerRegistration {
        // 计算每个服务器的权重（剩余容量占比）
        const weights = servers.map(s => ({
            server: s,
            weight: (s.capacity - s.roomCount) / s.capacity
        }));

        // 计算总权重
        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

        // 随机选择（加权）
        let random = Math.random() * totalWeight;
        for (const { server, weight } of weights) {
            random -= weight;
            if (random <= 0) {
                return server;
            }
        }

        // 兜底返回第一个
        return servers[0];
    }
}

/**
 * @zh 创建负载均衡路由器
 * @en Create load-balanced router
 */
export function createLoadBalancedRouter(
    config?: LoadBalancedRouterConfig
): LoadBalancedRouter {
    return new LoadBalancedRouter(config);
}
