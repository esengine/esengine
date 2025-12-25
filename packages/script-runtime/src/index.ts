/**
 * @esengine/script-runtime
 *
 * Server-side blueprint execution for programmable strategy games
 * 服务器端蓝图执行，用于可编程策略游戏
 *
 * @packageDocumentation
 */

// =============================================================================
// VM | Virtual Machine
// =============================================================================

export { ServerBlueprintVM } from './vm/ServerBlueprintVM';
export type { ServerVMConfig, TickResult } from './vm/ServerBlueprintVM';

export { ServerExecutionContext } from './vm/ServerExecutionContext';
export type { IGameState, LogEntry } from './vm/ServerExecutionContext';

export { CPULimiter, DEFAULT_CPU_CONFIG } from './vm/CPULimiter';
export type { CPULimiterConfig, CPUStats } from './vm/CPULimiter';

// =============================================================================
// Intent System | 意图系统
// =============================================================================

export { IntentCollector } from './intent/IntentCollector';
export type { IIntentCollector } from './intent/IntentCollector';

export type { IIntent, IntentKeyExtractor, Direction } from './intent/IntentTypes';

export { defaultIntentKeyExtractor } from './intent/IntentTypes';

// Result constants
export {
    OK,
    ERR_GENERIC,
    ERR_NOT_OWNER,
    ERR_INVALID_TARGET,
    ERR_NOT_IN_RANGE,
    ERR_NOT_ENOUGH_RESOURCES,
    ERR_BUSY,
    ERR_INVALID_ARGS,
    // Direction constants
    TOP,
    TOP_RIGHT,
    RIGHT,
    BOTTOM_RIGHT,
    BOTTOM,
    BOTTOM_LEFT,
    LEFT,
    TOP_LEFT
} from './intent/IntentTypes';

// =============================================================================
// Persistence | 持久化
// =============================================================================

export { FileMemoryStore } from './persistence/FileMemoryStore';
export type { FileMemoryStoreConfig } from './persistence/FileMemoryStore';

export type {
    IMemoryStore,
    PlayerMemory,
    WorldState,
    MemoryStoreStats
} from './persistence/IMemoryStore';

// =============================================================================
// Service Tokens | 服务令牌
// =============================================================================

export {
    ScriptRuntimeServiceToken,
    MemoryStoreToken
} from './tokens';

export type { IScriptRuntimeService } from './tokens';

// =============================================================================
// Server | 服务器端
// =============================================================================

export {
    // PlayerSession
    PlayerSession,
    // TickScheduler
    TickScheduler,
    // IntentProcessor
    IntentProcessorBase,
    IntentProcessorRegistry,
    // GameLoop
    GameLoop,
    DEFAULT_GAME_LOOP_CONFIG
} from './server';

export type {
    // Types
    PlayerTickResult,
    TickExecutionResult,
    IntentProcessingResult,
    GameLoopConfig,
    GameLoopState,
    GameLoopEvents,
    // PlayerSession
    PlayerSessionConfig,
    PlayerSessionState,
    // TickScheduler
    TickSchedulerConfig,
    SchedulerStats,
    // IntentProcessor
    IIntentProcessor,
    SingleIntentResult,
    // GameLoop
    GameLoopStats
} from './server';
