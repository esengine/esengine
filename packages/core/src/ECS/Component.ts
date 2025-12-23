import type { IComponent } from '../Types';
import { Int32 } from './Core/SoAStorage';

/**
 * @zh 游戏组件基类
 * @en Base class for game components
 *
 * @zh ECS架构中的组件（Component）应该是纯数据容器。
 * 所有游戏逻辑应该在 EntitySystem 中实现，而不是在组件内部。
 * @en Components in ECS architecture should be pure data containers.
 * All game logic should be implemented in EntitySystem, not inside components.
 *
 * @example
 * @zh 推荐做法：纯数据组件
 * @en Recommended: Pure data component
 * ```typescript
 * class HealthComponent extends Component {
 *     public health: number = 100;
 *     public maxHealth: number = 100;
 * }
 * ```
 *
 * @example
 * @zh 推荐做法：在 System 中处理逻辑
 * @en Recommended: Handle logic in System
 * ```typescript
 * class HealthSystem extends EntitySystem {
 *     process(entities: Entity[]): void {
 *         for (const entity of entities) {
 *             const health = entity.getComponent(HealthComponent);
 *             if (health && health.health <= 0) {
 *                 entity.destroy();
 *             }
 *         }
 *     }
 * }
 * ```
 */
export abstract class Component implements IComponent {
    /**
     * @zh 组件ID生成器，用于为每个组件分配唯一的ID
     * @en Component ID generator, used to assign unique IDs to each component
     */
    private static idGenerator: number = 0;

    /**
     * @zh 组件唯一标识符，在整个游戏生命周期中唯一
     * @en Unique identifier for the component, unique throughout the game lifecycle
     */
    public readonly id: number;

    /**
     * @zh 所属实体ID
     * @en Owner entity ID
     *
     * @zh 存储实体ID而非引用，避免循环引用，符合ECS数据导向设计
     * @en Stores entity ID instead of reference to avoid circular references, following ECS data-oriented design
     */
    @Int32
    public entityId: number | null = null;

    /**
     * @zh 最后写入的 epoch，用于帧级变更检测
     * @en Last write epoch, used for frame-level change detection
     *
     * @zh 记录组件最后一次被修改时的 epoch，0 表示从未被标记为已修改
     * @en Records the epoch when component was last modified, 0 means never marked as modified
     */
    private _lastWriteEpoch: number = 0;

    /**
     * @zh 获取最后写入的 epoch
     * @en Get last write epoch
     */
    public get lastWriteEpoch(): number {
        return this._lastWriteEpoch;
    }

    /**
     * @zh 创建组件实例，自动分配唯一ID
     * @en Create component instance, automatically assigns unique ID
     */
    constructor() {
        this.id = Component.idGenerator++;
    }

    /**
     * @zh 标记组件为已修改
     * @en Mark component as modified
     *
     * @zh 调用此方法会更新组件的 lastWriteEpoch 为当前帧的 epoch。
     * 系统可以通过比较 lastWriteEpoch 和上次检查的 epoch 来判断组件是否发生变更。
     * @en Calling this method updates the component's lastWriteEpoch to the current frame's epoch.
     * Systems can compare lastWriteEpoch with their last checked epoch to detect changes.
     *
     * @param epoch - @zh 当前帧的 epoch @en Current frame's epoch
     *
     * @example
     * ```typescript
     * // @zh 在修改组件数据后调用 | @en Call after modifying component data
     * velocity.x = 10;
     * velocity.markDirty(scene.epochManager.current);
     * ```
     */
    public markDirty(epoch: number): void {
        this._lastWriteEpoch = epoch;
    }

    /**
     * @zh 组件添加到实体时的回调
     * @en Callback when component is added to an entity
     *
     * @zh 当组件被添加到实体时调用，可以在此方法中进行初始化操作。
     * 这是一个生命周期钩子，用于组件的初始化逻辑。
     * 虽然保留此方法，但建议将复杂的初始化逻辑放在 System 中处理。
     * @en Called when component is added to an entity, can perform initialization here.
     * This is a lifecycle hook for component initialization logic.
     * While this method is available, complex initialization logic should be handled in System.
     */
    public onAddedToEntity(): void {}

    /**
     * @zh 组件从实体移除时的回调
     * @en Callback when component is removed from an entity
     *
     * @zh 当组件从实体中移除时调用，可以在此方法中进行清理操作。
     * 这是一个生命周期钩子，用于组件的清理逻辑。
     * 虽然保留此方法，但建议将复杂的清理逻辑放在 System 中处理。
     * @en Called when component is removed from an entity, can perform cleanup here.
     * This is a lifecycle hook for component cleanup logic.
     * While this method is available, complex cleanup logic should be handled in System.
     */
    public onRemovedFromEntity(): void {}

    /**
     * @zh 组件反序列化后的回调
     * @en Callback after component deserialization
     *
     * @zh 当组件从场景文件加载或快照恢复后调用，可以在此方法中恢复运行时数据。
     * 这是一个生命周期钩子，用于恢复无法序列化的运行时数据。
     * 例如：从图片路径重新加载图片尺寸信息，重建缓存等。
     * @en Called after component is loaded from scene file or restored from snapshot.
     * This is a lifecycle hook for restoring runtime data that cannot be serialized.
     * For example: reloading image dimensions from image path, rebuilding caches, etc.
     *
     * @example
     * ```typescript
     * class TilemapComponent extends Component {
     *     public tilesetImage: string = '';
     *     private _tilesetData: TilesetData | undefined;
     *
     *     public async onDeserialized(): Promise<void> {
     *         if (this.tilesetImage) {
     *             // @zh 重新加载 tileset 图片并恢复运行时数据
     *             // @en Reload tileset image and restore runtime data
     *             const img = await loadImage(this.tilesetImage);
     *             this.setTilesetInfo(img.width, img.height, ...);
     *         }
     *     }
     * }
     * ```
     */
    public onDeserialized(): void | Promise<void> {}
}
