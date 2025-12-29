/**
 * @zh @esengine/network 网络同步模块
 * @en @esengine/network Network synchronization module
 *
 * @zh 基于 @esengine/rpc 的网络同步模块，提供类型安全的多人游戏网络通信
 * @en Network synchronization module based on @esengine/rpc for type-safe multiplayer game communication
 */

// ============================================================================
// Re-export from RPC | 从 RPC 包重新导出
// ============================================================================

export { rpc } from '@esengine/rpc'
export type {
    ProtocolDef,
    ApiDef,
    MsgDef,
    ApiInput,
    ApiOutput,
    MsgData,
    ApiNames,
    MsgNames,
    RpcError,
} from '@esengine/rpc'

// ============================================================================
// Protocol | 协议
// ============================================================================

export {
    gameProtocol,
    type GameProtocol,
    type PlayerInput,
    type EntitySyncState,
    type SyncData,
    type SpawnData,
    type DespawnData,
    type FullStateData,
    type JoinRequest,
    type JoinResponse,
    type ReconnectRequest,
    type ReconnectResponse,
} from './protocol'

// ============================================================================
// Tokens | 服务令牌
// ============================================================================

export {
    NetworkServiceToken,
    NetworkSyncSystemToken,
    NetworkSpawnSystemToken,
    NetworkInputSystemToken,
    NetworkPredictionSystemToken,
    NetworkAOISystemToken,
} from './tokens'

// ============================================================================
// Plugin | 插件
// ============================================================================

export { NetworkPlugin } from './NetworkPlugin'

// ============================================================================
// Services | 服务
// ============================================================================

export {
    RpcService,
    GameNetworkService,
    NetworkService,
    NetworkState,
    createNetworkService,
} from './services/NetworkService'
export type { NetworkServiceOptions } from './services/NetworkService'

// ============================================================================
// Components | 组件
// ============================================================================

export { NetworkIdentity } from './components/NetworkIdentity'
export { NetworkTransform } from './components/NetworkTransform'

// ============================================================================
// Systems | 系统
// ============================================================================

export { NetworkSyncSystem } from './systems/NetworkSyncSystem'
export type { SyncMessage, NetworkSyncConfig } from './systems/NetworkSyncSystem'
export { NetworkSpawnSystem } from './systems/NetworkSpawnSystem'
export type { PrefabFactory, SpawnMessage, DespawnMessage } from './systems/NetworkSpawnSystem'
export { NetworkInputSystem, createNetworkInputSystem } from './systems/NetworkInputSystem'
export type { NetworkInputConfig } from './systems/NetworkInputSystem'
export {
    NetworkPredictionSystem,
    createNetworkPredictionSystem,
} from './systems/NetworkPredictionSystem'
export type {
    NetworkPredictionConfig,
    MovementInput,
    PredictedTransform,
} from './systems/NetworkPredictionSystem'
export {
    NetworkAOISystem,
    createNetworkAOISystem,
} from './systems/NetworkAOISystem'
export type {
    NetworkAOIConfig,
    NetworkAOIEvent,
    NetworkAOIEventType,
    NetworkAOIEventListener,
} from './systems/NetworkAOISystem'

// ============================================================================
// State Sync | 状态同步
// ============================================================================

export type {
    IStateSnapshot,
    ITransformState,
    ITransformStateWithVelocity,
    ISnapshotBufferConfig,
    ISnapshotBuffer,
} from './sync'

export type {
    IInterpolator,
    IExtrapolator,
    IInputSnapshot,
    IPredictedState,
    IPredictor,
    ClientPredictionConfig,
    EntityDeltaState,
    DeltaSyncData,
    DeltaCompressionConfig,
    // Component sync types
    ComponentSyncEventType,
    ComponentSyncEvent,
    ComponentSyncEventListener,
    ComponentSyncConfig,
} from './sync'

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
    createClientPrediction,
    DeltaFlags,
    StateDeltaCompressor,
    createStateDeltaCompressor,
    // Component sync
    ComponentSyncSystem,
    createComponentSyncSystem,
} from './sync'

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
    NetworkNodeDefinitions,
} from './nodes'
