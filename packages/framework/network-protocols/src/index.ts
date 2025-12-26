/**
 * @esengine/network-protocols
 *
 * 基于 TSRPC 的共享网络协议
 * TSRPC-based shared network protocols
 */

// ============================================================================
// Service Protocol | 服务协议
// ============================================================================

export { serviceProto } from './shared/protocols/serviceProto';
export type { ServiceType } from './shared/protocols/serviceProto';

// ============================================================================
// Types | 类型定义
// ============================================================================

export type { Vec2, IEntityState, IPlayerInput } from './shared/protocols/types';

// ============================================================================
// API Protocols | API 协议
// ============================================================================

export type { ReqJoin, ResJoin } from './shared/protocols/PtlJoin';

// ============================================================================
// Message Protocols | 消息协议
// ============================================================================

export type { MsgSync } from './shared/protocols/MsgSync';
export type { MsgInput } from './shared/protocols/MsgInput';
export type { MsgSpawn } from './shared/protocols/MsgSpawn';
export type { MsgDespawn } from './shared/protocols/MsgDespawn';
