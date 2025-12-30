/**
 * @zh ECS 网络同步模块
 * @en ECS Network Synchronization Module
 *
 * @zh 提供基于 ECS Component 的网络状态同步功能：
 * - @sync 装饰器：标记需要同步的字段
 * - ChangeTracker：追踪字段级变更
 * - 二进制编解码器：高效的网络序列化
 *
 * @en Provides network state synchronization based on ECS Components:
 * - @sync decorator: Mark fields for synchronization
 * - ChangeTracker: Track field-level changes
 * - Binary encoder/decoder: Efficient network serialization
 *
 * @example
 * ```typescript
 * import { Component, ECSComponent, sync } from '@esengine/ecs-framework';
 *
 * @ECSComponent('Player')
 * class PlayerComponent extends Component {
 *     @sync("string") name: string = "";
 *     @sync("uint16") score: number = 0;
 *     @sync("float32") x: number = 0;
 *     @sync("float32") y: number = 0;
 * }
 * ```
 */

// Types
export {
    SyncType,
    SyncFieldMetadata,
    SyncMetadata,
    SyncOperation,
    TYPE_SIZES,
    SYNC_METADATA,
    CHANGE_TRACKER
} from './types';

// Change Tracker
export { ChangeTracker } from './ChangeTracker';

// Decorators
export {
    sync,
    getSyncMetadata,
    hasSyncFields,
    getChangeTracker,
    initChangeTracker,
    clearChanges,
    hasChanges
} from './decorators';

// Network Entity Decorator
export {
    NetworkEntity,
    getNetworkEntityMetadata,
    isNetworkEntity,
    NETWORK_ENTITY_METADATA,
    type NetworkEntityMetadata,
    type NetworkEntityOptions
} from './NetworkEntityDecorator';

// Encoding
export * from './encoding';
