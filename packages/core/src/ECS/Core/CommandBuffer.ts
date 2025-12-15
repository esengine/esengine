import { Entity } from '../Entity';
import { Component } from '../Component';
import { ComponentType, ComponentRegistry } from './ComponentStorage';
import { IScene } from '../IScene';
import { createLogger } from '../../Utils/Logger';

const logger = createLogger('CommandBuffer');

/**
 * 延迟命令类型
 * Deferred command type
 */
export enum CommandType {
    /** 添加组件 | Add component */
    ADD_COMPONENT = 'add_component',
    /** 移除组件 | Remove component */
    REMOVE_COMPONENT = 'remove_component',
    /** 销毁实体 | Destroy entity */
    DESTROY_ENTITY = 'destroy_entity',
    /** 设置实体激活状态 | Set entity active state */
    SET_ENTITY_ACTIVE = 'set_entity_active'
}

/**
 * 延迟命令接口
 * Deferred command interface
 */
export interface DeferredCommand {
    /** 命令类型 | Command type */
    type: CommandType;
    /** 目标实体 | Target entity */
    entity: Entity;
    /** 组件实例（用于 ADD_COMPONENT）| Component instance (for ADD_COMPONENT) */
    component?: Component;
    /** 组件类型（用于 REMOVE_COMPONENT）| Component type (for REMOVE_COMPONENT) */
    componentType?: ComponentType;
    /** 布尔值（用于启用/激活状态）| Boolean value (for enabled/active state) */
    value?: boolean;
}

/**
 * 每个实体的待处理操作
 * Pending operations per entity
 *
 * 使用 last-write-wins 语义进行去重。
 * Uses last-write-wins semantics for deduplication.
 */
interface PendingPerEntity {
    /** 是否销毁实体（如果为 true，忽略其他操作）| Destroy entity (if true, ignores other operations) */
    bDestroy?: boolean;
    /** 最终的激活状态 | Final active state */
    active?: boolean;
    /** 要添加的组件（typeId -> Component）| Components to add (typeId -> Component) */
    adds?: Map<number, Component>;
    /** 要移除的组件类型 ID 集合 | Component type IDs to remove */
    removes?: Set<number>;
}

/**
 * 命令缓冲区 - 用于延迟执行实体操作
 * Command Buffer - for deferred entity operations
 *
 * 在系统的 process() 方法中使用 CommandBuffer 可以避免迭代过程中修改实体列表，
 * 从而提高性能（无需每帧拷贝数组）并保证迭代安全。
 *
 * 特点：
 * - **去重**: 同一实体的多次同类操作会被合并（last-write-wins）
 * - **有序执行**: removes -> adds -> active -> destroy
 * - **冲突处理**: addComponent 会取消同类型的 removeComponent，反之亦然
 * - **销毁优先**: destroyEntity 会取消该实体的所有其他操作
 *
 * Features:
 * - **Deduplication**: Multiple operations on same entity are merged (last-write-wins)
 * - **Ordered execution**: removes -> adds -> active -> destroy
 * - **Conflict handling**: addComponent cancels same-type removeComponent and vice versa
 * - **Destroy priority**: destroyEntity cancels all other operations for that entity
 *
 * @example
 * ```typescript
 * class DamageSystem extends EntitySystem {
 *     protected process(entities: readonly Entity[]): void {
 *         for (const entity of entities) {
 *             const health = entity.getComponent(Health);
 *             if (health.value <= 0) {
 *                 // 延迟到帧末执行，不影响当前迭代
 *                 // Deferred to end of frame, doesn't affect current iteration
 *                 this.commands.addComponent(entity, new DeadMarker());
 *                 this.commands.destroyEntity(entity);
 *             }
 *         }
 *     }
 * }
 * ```
 */
export class CommandBuffer {
    /** 每个实体的待处理操作 | Pending operations per entity */
    private _pending: Map<Entity, PendingPerEntity> = new Map();

    /** 旧式命令队列（用于兼容）| Legacy command queue (for compatibility) */
    private _commands: DeferredCommand[] = [];

    /** 关联的场景 | Associated scene */
    private _scene: IScene | null = null;

    /** 是否启用调试日志 | Enable debug logging */
    private _debug: boolean = false;

    /** 是否使用去重模式 | Whether to use deduplication mode */
    private _useDeduplication: boolean = true;

    /**
     * 创建命令缓冲区
     * Create command buffer
     *
     * @param scene - 关联的场景 | Associated scene
     * @param debug - 是否启用调试 | Enable debug
     */
    constructor(scene?: IScene, debug: boolean = false) {
        this._scene = scene ?? null;
        this._debug = debug;
    }

    /**
     * 设置关联的场景
     * Set associated scene
     */
    public setScene(scene: IScene | null): void {
        this._scene = scene;
    }

    /**
     * 获取关联的场景
     * Get associated scene
     */
    public get scene(): IScene | null {
        return this._scene;
    }

    /**
     * 设置是否使用去重模式
     * Set whether to use deduplication mode
     *
     * @param enabled - 是否启用 | Whether to enable
     */
    public setDeduplication(enabled: boolean): void {
        this._useDeduplication = enabled;
    }

    /**
     * 获取待执行的命令数量
     * Get pending command count
     *
     * 返回实际的操作数量，而不是实体数量。
     * Returns actual operation count, not entity count.
     */
    public get pendingCount(): number {
        if (this._useDeduplication) {
            let count = 0;
            for (const ops of this._pending.values()) {
                if (ops.bDestroy) count++;
                if (ops.active !== undefined) count++;
                if (ops.adds) count += ops.adds.size;
                if (ops.removes) count += ops.removes.size;
            }
            return count;
        }
        return this._commands.length;
    }

    /**
     * 检查是否有待执行的命令
     * Check if there are pending commands
     */
    public get hasPending(): boolean {
        if (this._useDeduplication) {
            return this._pending.size > 0;
        }
        return this._commands.length > 0;
    }

    /**
     * 获取或创建实体的待处理操作
     * Get or create pending operations for entity
     */
    private getPending(entity: Entity): PendingPerEntity {
        let pending = this._pending.get(entity);
        if (!pending) {
            pending = {};
            this._pending.set(entity, pending);
        }
        return pending;
    }

    /**
     * 获取组件类型 ID（位索引）
     * Get component type ID (bit index)
     */
    private getTypeId(componentOrType: Component | ComponentType): number {
        if (typeof componentOrType === 'function') {
            // ComponentType
            return ComponentRegistry.getBitIndex(componentOrType);
        } else {
            // Component instance
            return ComponentRegistry.getBitIndex(componentOrType.constructor as ComponentType);
        }
    }

    /**
     * 延迟添加组件
     * Deferred add component
     *
     * 如果之前有同类型的 removeComponent，会被取消。
     * If there was a removeComponent for the same type, it will be canceled.
     *
     * @param entity - 目标实体 | Target entity
     * @param component - 要添加的组件 | Component to add
     */
    public addComponent(entity: Entity, component: Component): void {
        if (this._useDeduplication) {
            const pending = this.getPending(entity);

            // 如果实体已标记销毁，忽略
            if (pending.bDestroy) {
                if (this._debug) {
                    logger.debug(`CommandBuffer: 忽略添加组件，实体 ${entity.name} 已标记销毁`);
                }
                return;
            }

            const typeId = this.getTypeId(component);

            // 取消同类型的 remove
            pending.removes?.delete(typeId);

            // 添加（覆盖同类型的之前的 add）
            if (!pending.adds) {
                pending.adds = new Map();
            }
            pending.adds.set(typeId, component);

            if (this._debug) {
                logger.debug(`CommandBuffer: 延迟添加组件 ${component.constructor.name} 到实体 ${entity.name}`);
            }
        } else {
            // 旧模式
            this._commands.push({
                type: CommandType.ADD_COMPONENT,
                entity,
                component
            });
        }
    }

    /**
     * 延迟移除组件
     * Deferred remove component
     *
     * 如果之前有同类型的 addComponent，会被取消。
     * If there was an addComponent for the same type, it will be canceled.
     *
     * @param entity - 目标实体 | Target entity
     * @param componentType - 要移除的组件类型 | Component type to remove
     */
    public removeComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): void {
        if (this._useDeduplication) {
            const pending = this.getPending(entity);

            // 如果实体已标记销毁，忽略
            if (pending.bDestroy) {
                if (this._debug) {
                    logger.debug(`CommandBuffer: 忽略移除组件，实体 ${entity.name} 已标记销毁`);
                }
                return;
            }

            const typeId = this.getTypeId(componentType);

            // 取消同类型的 add
            pending.adds?.delete(typeId);

            // 添加到移除列表
            if (!pending.removes) {
                pending.removes = new Set();
            }
            pending.removes.add(typeId);

            if (this._debug) {
                logger.debug(`CommandBuffer: 延迟移除组件 ${componentType.name} 从实体 ${entity.name}`);
            }
        } else {
            // 旧模式
            this._commands.push({
                type: CommandType.REMOVE_COMPONENT,
                entity,
                componentType
            });
        }
    }

    /**
     * 延迟销毁实体
     * Deferred destroy entity
     *
     * 会取消该实体的所有其他待处理操作。
     * Cancels all other pending operations for this entity.
     *
     * @param entity - 要销毁的实体 | Entity to destroy
     */
    public destroyEntity(entity: Entity): void {
        if (this._useDeduplication) {
            const pending = this.getPending(entity);

            // 清除所有其他操作
            pending.adds?.clear();
            pending.removes?.clear();
            delete pending.active;

            // 标记销毁
            pending.bDestroy = true;

            if (this._debug) {
                logger.debug(`CommandBuffer: 延迟销毁实体 ${entity.name}`);
            }
        } else {
            // 旧模式
            this._commands.push({
                type: CommandType.DESTROY_ENTITY,
                entity
            });
        }
    }

    /**
     * 延迟设置实体激活状态
     * Deferred set entity active state
     *
     * @param entity - 目标实体 | Target entity
     * @param active - 激活状态 | Active state
     */
    public setEntityActive(entity: Entity, active: boolean): void {
        if (this._useDeduplication) {
            const pending = this.getPending(entity);

            // 如果实体已标记销毁，忽略
            if (pending.bDestroy) {
                if (this._debug) {
                    logger.debug(`CommandBuffer: 忽略设置激活状态，实体 ${entity.name} 已标记销毁`);
                }
                return;
            }

            // 设置（覆盖之前的设置）
            pending.active = active;

            if (this._debug) {
                logger.debug(`CommandBuffer: 延迟设置实体 ${entity.name} 激活状态为 ${active}`);
            }
        } else {
            // 旧模式
            this._commands.push({
                type: CommandType.SET_ENTITY_ACTIVE,
                entity,
                value: active
            });
        }
    }

    /**
     * 执行所有待处理的命令
     * Execute all pending commands
     *
     * 执行顺序：removes -> adds -> active -> destroy
     * Execution order: removes -> adds -> active -> destroy
     *
     * 通常在帧末由 Scene 自动调用。
     * Usually called automatically by Scene at end of frame.
     *
     * @returns 执行的命令数量 | Number of commands executed
     */
    public flush(): number {
        if (this._useDeduplication) {
            return this.flushDeduplication();
        } else {
            return this.flushLegacy();
        }
    }

    /**
     * 使用去重模式刷新
     * Flush using deduplication mode
     */
    private flushDeduplication(): number {
        if (this._pending.size === 0) {
            return 0;
        }

        const entityCount = this._pending.size;
        let commandCount = 0;

        if (this._debug) {
            logger.debug(`CommandBuffer: 开始执行 ${entityCount} 个实体的延迟命令`);
        }

        // 复制并清空，防止执行过程中有新命令加入
        const pending = this._pending;
        this._pending = new Map();

        // 分阶段执行
        // Phase 1: Removes
        for (const [entity, ops] of pending) {
            if (ops.bDestroy || !entity.scene) continue;

            if (ops.removes && ops.removes.size > 0) {
                for (const typeId of ops.removes) {
                    try {
                        const componentType = ComponentRegistry.getTypeByBitIndex(typeId);
                        if (componentType) {
                            entity.removeComponentByType(componentType);
                            commandCount++;
                        }
                    } catch (error) {
                        logger.error(`CommandBuffer: 移除组件失败`, { entity: entity.name, typeId, error });
                    }
                }
            }
        }

        // Phase 2: Adds
        for (const [entity, ops] of pending) {
            if (ops.bDestroy || !entity.scene) continue;

            if (ops.adds && ops.adds.size > 0) {
                for (const component of ops.adds.values()) {
                    try {
                        entity.addComponent(component);
                        commandCount++;
                    } catch (error) {
                        logger.error(`CommandBuffer: 添加组件失败`, {
                            entity: entity.name,
                            component: component.constructor.name,
                            error
                        });
                    }
                }
            }
        }

        // Phase 3: Active state
        for (const [entity, ops] of pending) {
            if (ops.bDestroy || !entity.scene) continue;

            if (ops.active !== undefined) {
                try {
                    entity.active = ops.active;
                    commandCount++;
                } catch (error) {
                    logger.error(`CommandBuffer: 设置激活状态失败`, { entity: entity.name, error });
                }
            }
        }

        // Phase 4: Destroy
        for (const [entity, ops] of pending) {
            if (!ops.bDestroy || !entity.scene) continue;

            try {
                entity.destroy();
                commandCount++;
            } catch (error) {
                logger.error(`CommandBuffer: 销毁实体失败`, { entity: entity.name, error });
            }
        }

        if (this._debug) {
            logger.debug(`CommandBuffer: 完成执行 ${commandCount} 个延迟命令`);
        }

        return commandCount;
    }

    /**
     * 使用旧模式刷新
     * Flush using legacy mode
     */
    private flushLegacy(): number {
        if (this._commands.length === 0) {
            return 0;
        }

        const count = this._commands.length;

        if (this._debug) {
            logger.debug(`CommandBuffer: 开始执行 ${count} 个延迟命令`);
        }

        // 复制命令列表并清空，防止执行过程中有新命令加入
        const commands = this._commands;
        this._commands = [];

        for (const cmd of commands) {
            this.executeCommand(cmd);
        }

        if (this._debug) {
            logger.debug(`CommandBuffer: 完成执行 ${count} 个延迟命令`);
        }

        return count;
    }

    /**
     * 执行单个命令（旧模式）
     * Execute single command (legacy mode)
     */
    private executeCommand(cmd: DeferredCommand): void {
        // 检查实体是否仍然有效
        if (!cmd.entity.scene) {
            if (this._debug) {
                logger.debug(`CommandBuffer: 跳过命令，实体 ${cmd.entity.name} 已无效`);
            }
            return;
        }

        try {
            switch (cmd.type) {
                case CommandType.ADD_COMPONENT:
                    if (cmd.component) {
                        cmd.entity.addComponent(cmd.component);
                    }
                    break;

                case CommandType.REMOVE_COMPONENT:
                    if (cmd.componentType) {
                        cmd.entity.removeComponentByType(cmd.componentType);
                    }
                    break;

                case CommandType.DESTROY_ENTITY:
                    cmd.entity.destroy();
                    break;

                case CommandType.SET_ENTITY_ACTIVE:
                    if (cmd.value !== undefined) {
                        cmd.entity.active = cmd.value;
                    }
                    break;
            }
        } catch (error) {
            logger.error(`CommandBuffer: 执行命令失败`, { command: cmd, error });
        }
    }

    /**
     * 清空所有待处理的命令（不执行）
     * Clear all pending commands (without executing)
     */
    public clear(): void {
        if (this._debug) {
            const count = this._useDeduplication ? this._pending.size : this._commands.length;
            if (count > 0) {
                logger.debug(`CommandBuffer: 清空 ${count} 个未执行的命令`);
            }
        }
        this._pending.clear();
        this._commands.length = 0;
    }

    /**
     * 销毁命令缓冲区
     * Dispose command buffer
     */
    public dispose(): void {
        this.clear();
        this._scene = null;
    }
}

