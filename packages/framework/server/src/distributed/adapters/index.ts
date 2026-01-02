/**
 * @zh 分布式适配器模块导出
 * @en Distributed adapters module exports
 */

export type { IDistributedAdapter } from './IDistributedAdapter.js';
export { MemoryAdapter, type MemoryAdapterConfig } from './MemoryAdapter.js';
export {
    RedisAdapter,
    createRedisAdapter,
    type RedisAdapterConfig,
    type RedisClient,
    type RedisClientFactory
} from './RedisAdapter.js';
