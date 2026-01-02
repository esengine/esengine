/**
 * @zh 分布式房间支持模块
 * @en Distributed room support module
 *
 * @zh 提供多服务器房间管理、跨服务器路由和故障转移功能。
 * @en Provides multi-server room management, cross-server routing, and failover features.
 *
 * @example
 * ```typescript
 * import {
 *     DistributedRoomManager,
 *     MemoryAdapter,
 *     type IDistributedAdapter
 * } from '@esengine/server/distributed';
 *
 * // 单机模式（使用内存适配器）
 * const adapter = new MemoryAdapter();
 * const manager = new DistributedRoomManager(adapter, {
 *     serverId: 'server-1',
 *     serverAddress: 'localhost',
 *     serverPort: 3000
 * }, sendFn);
 *
 * await manager.start();
 * ```
 */

// 类型导出 | Type exports
export type {
    ServerStatus,
    ServerRegistration,
    RoomRegistration,
    RoomQuery,
    PlayerSnapshot,
    RoomSnapshot,
    DistributedEventType,
    DistributedEvent,
    DistributedEventHandler,
    Unsubscribe,
    DistributedRoomManagerConfig,
    DistributedConfig,
    RoutingResultType,
    RoutingResult,
    RoutingRequest
} from './types.js';

// 适配器导出 | Adapter exports
export type { IDistributedAdapter } from './adapters/index.js';
export { MemoryAdapter, type MemoryAdapterConfig } from './adapters/index.js';
export {
    RedisAdapter,
    createRedisAdapter,
    type RedisAdapterConfig,
    type RedisClient,
    type RedisClientFactory
} from './adapters/index.js';

// 路由模块 | Routing module
export {
    LoadBalancedRouter,
    createLoadBalancedRouter,
    type LoadBalanceStrategy,
    type LoadBalancedRouterConfig
} from './routing/index.js';

// 分布式房间管理器 | Distributed room manager
export { DistributedRoomManager } from './DistributedRoomManager.js';
