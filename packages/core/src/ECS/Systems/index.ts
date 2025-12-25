/**
 * @zh ECS 系统模块导出
 * @en ECS Systems Module Exports
 */

// =============================================================================
// 系统类 | System Classes
// =============================================================================

export { EntitySystem } from './EntitySystem';
export { ProcessingSystem } from './ProcessingSystem';
export { PassiveSystem } from './PassiveSystem';
export { IntervalSystem } from './IntervalSystem';
export { WorkerEntitySystem } from './WorkerEntitySystem';
export { HierarchySystem } from './HierarchySystem';
export { PlatformWorkerPool } from './PlatformWorkerPool';
export type { IWorkerPoolStatus } from './PlatformWorkerPool';

// =============================================================================
// Worker 系统类型导出 | Worker System Type Exports
// =============================================================================

export type {
    WorkerProcessFunction,
    SharedArrayBufferProcessFunction,
    IWorkerSystemConfig,
    ProcessingMode,
    // 向后兼容 | Backward compatibility
    WorkerSystemConfig
} from './WorkerEntitySystem';
