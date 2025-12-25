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
export type {
    IGameState,
    IUnitState,
    ISpawnerState,
    IZoneState,
    IResourceState,
    LogEntry
} from './vm/ServerExecutionContext';

export { CPULimiter, DEFAULT_CPU_CONFIG } from './vm/CPULimiter';
export type { CPULimiterConfig, CPUStats } from './vm/CPULimiter';

// =============================================================================
// Intent System | 意图系统
// =============================================================================

export { IntentCollector } from './intent/IntentCollector';
export type { IIntentCollector } from './intent/IntentCollector';

export type {
    IIntent,
    Intent,
    IntentType,
    // Unit intents
    UnitMoveIntent,
    UnitHarvestIntent,
    UnitBuildIntent,
    UnitRepairIntent,
    UnitAttackIntent,
    UnitTransferIntent,
    UnitPickupIntent,
    // Spawner intents
    SpawnerSpawnUnitIntent,
    SpawnerCancelIntent,
    BodyPartConstant,
    // Tower intents
    TowerAttackIntent,
    TowerRepairIntent,
    TowerHealIntent
} from './intent/IntentTypes';

// Result constants
export {
    OK,
    ERR_NOT_OWNER,
    ERR_NO_PATH,
    ERR_NAME_EXISTS,
    ERR_BUSY,
    ERR_NOT_ENOUGH_ENERGY,
    ERR_NOT_ENOUGH_RESOURCES,
    ERR_INVALID_TARGET,
    ERR_FULL,
    ERR_NOT_IN_RANGE,
    ERR_INVALID_ARGS,
    ERR_TIRED,
    ERR_NO_BODYPART,
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
