/**
 * @zh ESEngine 游戏服务器框架
 * @en ESEngine Game Server Framework
 *
 * @example
 * ```typescript
 * import { createServer, Room, onMessage } from '@esengine/server'
 *
 * class GameRoom extends Room {
 *     maxPlayers = 4
 *     tickRate = 20
 *
 *     onJoin(player) {
 *         this.broadcast('Joined', { id: player.id })
 *     }
 *
 *     @onMessage('Move')
 *     handleMove(data, player) {
 *         // handle move
 *     }
 * }
 *
 * const server = await createServer({ port: 3000 })
 * server.define('game', GameRoom)
 * await server.start()
 * ```
 */

// Core
export { createServer } from './core/server.js';

// Helpers
export { defineApi, defineMsg, defineHttp } from './helpers/define.js';

// Room System
export { Room, type RoomOptions } from './room/Room.js';
export { Player, type IPlayer } from './room/Player.js';
export { onMessage } from './room/decorators.js';

// Types
export type {
    ServerConfig,
    ServerConnection,
    GameServer,
    ApiContext,
    MsgContext,
    ApiDefinition,
    MsgDefinition,
    HttpDefinition,
    HttpMethod
} from './types/index.js';

// HTTP
export { createHttpRouter } from './http/router.js';
export type {
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpRoutes,
    CorsOptions
} from './http/types.js';

// Re-export useful types from @esengine/rpc
export { RpcError, ErrorCode } from '@esengine/rpc';

// Distributed Room Support
export {
    DistributedRoomManager,
    MemoryAdapter,
    RedisAdapter,
    createRedisAdapter,
    LoadBalancedRouter,
    createLoadBalancedRouter,
    type IDistributedAdapter,
    type MemoryAdapterConfig,
    type RedisAdapterConfig,
    type RedisClient,
    type RedisClientFactory,
    type ServerStatus,
    type ServerRegistration,
    type RoomRegistration,
    type RoomQuery,
    type RoomSnapshot,
    type DistributedEvent,
    type DistributedEventType,
    type DistributedEventHandler,
    type DistributedRoomManagerConfig,
    type DistributedConfig,
    type RoutingResult,
    type RoutingRequest,
    type LoadBalanceStrategy,
    type LoadBalancedRouterConfig
} from './distributed/index.js';

// Room Manager (for extension)
export { RoomManager, type RoomClass } from './room/RoomManager.js';
