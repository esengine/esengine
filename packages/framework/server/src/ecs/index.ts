/**
 * @zh @esengine/server ECS 集成模块
 * @en @esengine/server ECS integration module
 *
 * @zh 提供带 ECS World 的房间类，支持基于 @sync 装饰器的自动状态同步
 * @en Provides Room class with ECS World, supports automatic state sync based on @sync decorator
 *
 * @example
 * ```typescript
 * import { ECSRoom } from '@esengine/server/ecs';
 * import { Component, ECSComponent, sync } from '@esengine/ecs-framework';
 *
 * @ECSComponent('Player')
 * class PlayerComponent extends Component {
 *     @sync("string") name: string = "";
 *     @sync("uint16") score: number = 0;
 * }
 *
 * class GameRoom extends ECSRoom {
 *     onCreate() {
 *         this.addSystem(new MovementSystem());
 *     }
 *
 *     onJoin(player: Player) {
 *         const entity = this.createPlayerEntity(player.id);
 *         entity.addComponent(new PlayerComponent());
 *     }
 * }
 * ```
 */

export { ECSRoom } from './ECSRoom.js';
export type { ECSRoomConfig } from './ECSRoom.js';

// Re-export commonly used ECS types for convenience
export type {
    Entity,
    Component,
    EntitySystem,
    Scene,
    World,
} from '@esengine/ecs-framework';

// Re-export sync types
export {
    sync,
    getSyncMetadata,
    hasSyncFields,
    initChangeTracker,
    clearChanges,
    hasChanges,
    SyncOperation,
    type SyncType,
    type SyncFieldMetadata,
    type SyncMetadata,
} from '@esengine/ecs-framework';

// Re-export room decorators
export { onMessage } from '../room/decorators.js';
