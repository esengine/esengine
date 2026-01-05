/**
 * @zh 定点数网络同步模块
 * @en Fixed-point network sync module
 *
 * @zh 用于帧同步确定性计算的网络同步类型和工具
 * @en Network sync types and utilities for deterministic lockstep calculations
 */

// =============================================================================
// 变换状态 | Transform State
// =============================================================================

export {
    FixedTransformState,
    FixedTransformStateWithVelocity,
    createZeroFixedTransformState,
    createZeroFixedTransformStateWithVelocity,
    type IFixedTransformStateRaw,
    type IFixedTransformStateWithVelocityRaw,
} from './FixedTransformState';

// =============================================================================
// 插值器 | Interpolators
// =============================================================================

export {
    FixedTransformInterpolator,
    FixedHermiteTransformInterpolator,
    createFixedTransformInterpolator,
    createFixedHermiteTransformInterpolator,
    type IFixedInterpolator,
    type IFixedExtrapolator,
} from './FixedTransformInterpolator';

// =============================================================================
// 快照缓冲区 | Snapshot Buffer
// =============================================================================

export {
    FixedSnapshotBuffer,
    createFixedSnapshotBuffer,
    type IFixedStateSnapshot,
    type IFixedSnapshotBufferConfig,
    type IFixedInterpolationResult,
} from './FixedSnapshotBuffer';

// =============================================================================
// 客户端预测 | Client Prediction
// =============================================================================

export {
    FixedClientPrediction,
    createFixedClientPrediction,
    createFixedMovementPredictor,
    createFixedMovementPositionExtractor,
    type IFixedInputSnapshot,
    type IFixedPredictedState,
    type IFixedPredictor,
    type IFixedStatePositionExtractor,
    type FixedClientPredictionConfig,
    type IFixedMovementInput,
    type IFixedMovementState,
} from './FixedClientPrediction';
