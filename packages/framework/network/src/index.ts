/**
 * @esengine/network
 *
 * 基于 TSRPC 的网络同步模块（客户端）
 * TSRPC-based network synchronization module (client)
 */

// ============================================================================
// Re-export from protocols | 从协议包重新导出
// ============================================================================

export type {
    ServiceType,
    Vec2,
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
// Tokens | 服务令牌
// ============================================================================

export {
    NetworkServiceToken,
    NetworkSyncSystemToken,
    NetworkSpawnSystemToken,
    NetworkInputSystemToken
} from './tokens';

// ============================================================================
// Plugin | 插件
// ============================================================================

export { NetworkPlugin } from './NetworkPlugin';

// ============================================================================
// Services | 服务
// ============================================================================

export { NetworkService, ENetworkState } from './services/NetworkService';
export type { INetworkCallbacks } from './services/NetworkService';

// ============================================================================
// Components | 组件
// ============================================================================

export { NetworkIdentity } from './components/NetworkIdentity';
export { NetworkTransform } from './components/NetworkTransform';

// ============================================================================
// Systems | 系统
// ============================================================================

export { NetworkSyncSystem } from './systems/NetworkSyncSystem';
export { NetworkSpawnSystem } from './systems/NetworkSpawnSystem';
export type { PrefabFactory } from './systems/NetworkSpawnSystem';
export { NetworkInputSystem } from './systems/NetworkInputSystem';

// ============================================================================
// State Sync | 状态同步
// ============================================================================

export type {
    IStateSnapshot,
    ITransformState,
    ITransformStateWithVelocity,
    ISnapshotBufferConfig,
    ISnapshotBuffer
} from './sync';

export type {
    IInterpolator,
    IExtrapolator,
    IInputSnapshot,
    IPredictedState,
    IPredictor,
    ClientPredictionConfig
} from './sync';

export {
    lerp,
    lerpAngle,
    smoothDamp,
    SnapshotBuffer,
    createSnapshotBuffer,
    TransformInterpolator,
    HermiteTransformInterpolator,
    createTransformInterpolator,
    createHermiteTransformInterpolator,
    ClientPrediction,
    createClientPrediction
} from './sync';

// ============================================================================
// Blueprint Nodes | 蓝图节点
// ============================================================================

export {
    IsLocalPlayerTemplate,
    IsServerTemplate,
    HasAuthorityTemplate,
    GetNetworkIdTemplate,
    GetLocalPlayerIdTemplate,
    IsLocalPlayerExecutor,
    IsServerExecutor,
    HasAuthorityExecutor,
    GetNetworkIdExecutor,
    GetLocalPlayerIdExecutor,
    NetworkNodeDefinitions
} from './nodes';
