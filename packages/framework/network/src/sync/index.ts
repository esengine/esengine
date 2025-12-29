/**
 * @zh 网络同步模块
 * @en Network Sync Module
 *
 * @zh 提供状态快照、插值和客户端预测功能
 * @en Provides state snapshot, interpolation, and client prediction functionality
 */

// =============================================================================
// 状态快照 | State Snapshot
// =============================================================================

export type {
    IStateSnapshot,
    ITransformState,
    ITransformStateWithVelocity,
    ISnapshotBufferConfig,
    ISnapshotBuffer
} from './IStateSnapshot';

export { SnapshotBuffer, createSnapshotBuffer } from './SnapshotBuffer';

// =============================================================================
// 插值器 | Interpolators
// =============================================================================

export type { IInterpolator, IExtrapolator } from './IInterpolator';
export { lerp, lerpAngle, smoothDamp } from './IInterpolator';

export {
    TransformInterpolator,
    HermiteTransformInterpolator,
    createTransformInterpolator,
    createHermiteTransformInterpolator
} from './TransformInterpolator';

// =============================================================================
// 客户端预测 | Client Prediction
// =============================================================================

export type {
    IInputSnapshot,
    IPredictedState,
    IPredictor,
    ClientPredictionConfig
} from './ClientPrediction';

export { ClientPrediction, createClientPrediction } from './ClientPrediction';

// =============================================================================
// 状态增量压缩 | State Delta Compression
// =============================================================================

export type {
    EntityDeltaState,
    DeltaSyncData,
    DeltaCompressionConfig
} from './StateDelta';

export {
    DeltaFlags,
    StateDeltaCompressor,
    createStateDeltaCompressor
} from './StateDelta';
