/**
 * @zh 服务器端模块
 * @en Server-side Module
 */

// Types
export type {
    PlayerTickResult,
    TickExecutionResult,
    IntentProcessingResult,
    GameLoopConfig,
    GameLoopState,
    GameLoopEvents
} from './types';

// PlayerSession
export { PlayerSession } from './PlayerSession';
export type { PlayerSessionConfig, PlayerSessionState } from './PlayerSession';

// TickScheduler
export { TickScheduler } from './TickScheduler';
export type { TickSchedulerConfig, SchedulerStats } from './TickScheduler';

// IntentProcessor
export type { IIntentProcessor, SingleIntentResult } from './IIntentProcessor';
export { IntentProcessorBase, IntentProcessorRegistry } from './IIntentProcessor';

// GameLoop
export { GameLoop, DEFAULT_GAME_LOOP_CONFIG } from './GameLoop';
export type { GameLoopStats } from './GameLoop';
