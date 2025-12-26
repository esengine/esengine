/**
 * @esengine/network-server
 *
 * 基于 TSRPC 的网络服务器模块
 * TSRPC-based network server module
 */

// ============================================================================
// Re-export from protocols | 从协议包重新导出
// ============================================================================

export type {
    ServiceType,
    IEntityState,
    IPlayerInput,
    MsgSync,
    MsgInput,
    MsgSpawn,
    MsgDespawn,
    ReqJoin,
    ResJoin
} from '@esengine/network-protocols';

export { serviceProto } from '@esengine/network-protocols';

// ============================================================================
// Server | 服务器
// ============================================================================

export { GameServer, type IServerConfig } from './services/GameServer';
export { Room, type IPlayer, type IRoomConfig } from './services/Room';
