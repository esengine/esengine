/**
 * @zh @esengine/timer - 定时器和冷却系统
 * @en @esengine/timer - Timer and Cooldown System
 *
 * @zh 提供定时器调度和冷却管理功能
 * @en Provides timer scheduling and cooldown management
 */

// =============================================================================
// 接口和类型 | Interfaces and Types
// =============================================================================

export type {
    TimerHandle,
    TimerInfo,
    CooldownInfo,
    TimerCallback,
    TimerCallbackWithTime,
    ITimerService
} from './ITimerService';

// =============================================================================
// 实现 | Implementations
// =============================================================================

export type { TimerServiceConfig } from './TimerService';
export { TimerService, createTimerService } from './TimerService';

// =============================================================================
// 服务令牌 | Service Tokens
// =============================================================================

export { TimerServiceToken } from './tokens';

// =============================================================================
// 蓝图节点 | Blueprint Nodes
// =============================================================================

export {
    // Templates
    StartCooldownTemplate,
    IsCooldownReadyTemplate,
    GetCooldownProgressTemplate,
    ResetCooldownTemplate,
    GetCooldownInfoTemplate,
    HasTimerTemplate,
    CancelTimerTemplate,
    GetTimerRemainingTemplate,
    // Executors
    StartCooldownExecutor,
    IsCooldownReadyExecutor,
    GetCooldownProgressExecutor,
    ResetCooldownExecutor,
    GetCooldownInfoExecutor,
    HasTimerExecutor,
    CancelTimerExecutor,
    GetTimerRemainingExecutor,
    // Collection
    TimerNodeDefinitions
} from './nodes';
