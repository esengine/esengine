import { Entity, Component } from '@esengine/ecs-framework';
import { MessageHub } from '@esengine/editor-core';
import { TransformComponent } from '@esengine/engine-core';
import { BaseCommand } from '../BaseCommand';
import { ICommand } from '../ICommand';

/**
 * Transform 状态快照
 * Transform state snapshot
 */
export interface TransformState {
    positionX?: number;
    positionY?: number;
    positionZ?: number;
    rotationX?: number;
    rotationY?: number;
    rotationZ?: number;
    scaleX?: number;
    scaleY?: number;
    scaleZ?: number;
}

/**
 * 变换操作类型
 * Transform operation type
 */
export type TransformOperationType = 'move' | 'rotate' | 'scale';

/**
 * 变换命令
 * Transform command for undo/redo support
 */
export class TransformCommand extends BaseCommand {
    private readonly timestamp: number;

    constructor(
        private readonly messageHub: MessageHub,
        private readonly entity: Entity,
        private readonly component: TransformComponent,
        private readonly operationType: TransformOperationType,
        private readonly oldState: TransformState,
        private newState: TransformState
    ) {
        super();
        this.timestamp = Date.now();
    }

    execute(): void {
        this.applyState(this.newState);
        this.notifyChange();
    }

    undo(): void {
        this.applyState(this.oldState);
        this.notifyChange();
    }

    getDescription(): string {
        const opNames: Record<TransformOperationType, string> = {
            move: '移动',
            rotate: '旋转',
            scale: '缩放'
        };
        return `${opNames[this.operationType]} ${this.entity.name || 'Entity'}`;
    }

    /**
     * 检查是否可以与另一个命令合并
     * 只有相同实体、相同操作类型、且在短时间内的命令可以合并
     */
    canMergeWith(other: ICommand): boolean {
        if (!(other instanceof TransformCommand)) return false;

        // 相同实体、相同组件、相同操作类型
        if (this.entity !== other.entity) return false;
        if (this.component !== other.component) return false;
        if (this.operationType !== other.operationType) return false;

        // 时间间隔小于 500ms 才能合并（连续拖动）
        const timeDiff = other.timestamp - this.timestamp;
        return timeDiff < 500;
    }

    mergeWith(other: ICommand): ICommand {
        if (!(other instanceof TransformCommand)) {
            throw new Error('无法合并不同类型的命令');
        }

        // 保留原始 oldState，使用新命令的 newState
        return new TransformCommand(
            this.messageHub,
            this.entity,
            this.component,
            this.operationType,
            this.oldState,
            other.newState
        );
    }

    /**
     * 应用变换状态
     * Apply transform state
     */
    private applyState(state: TransformState): void {
        const transform = this.component;
        if (state.positionX !== undefined) transform.position.x = state.positionX;
        if (state.positionY !== undefined) transform.position.y = state.positionY;
        if (state.positionZ !== undefined) transform.position.z = state.positionZ;
        if (state.rotationX !== undefined) transform.rotation.x = state.rotationX;
        if (state.rotationY !== undefined) transform.rotation.y = state.rotationY;
        if (state.rotationZ !== undefined) transform.rotation.z = state.rotationZ;
        if (state.scaleX !== undefined) transform.scale.x = state.scaleX;
        if (state.scaleY !== undefined) transform.scale.y = state.scaleY;
        if (state.scaleZ !== undefined) transform.scale.z = state.scaleZ;
    }

    /**
     * 通知属性变更
     * Notify property change
     */
    private notifyChange(): void {
        const propertyName = this.operationType === 'move'
            ? 'position'
            : this.operationType === 'rotate'
                ? 'rotation'
                : 'scale';

        this.messageHub.publish('component:property:changed', {
            entity: this.entity,
            component: this.component,
            propertyName,
            value: this.component[propertyName as keyof TransformComponent]
        });

        // 通知 Inspector 刷新 | Notify Inspector to refresh
        this.messageHub.publish('entity:select', { entityId: this.entity.id });
    }

    /**
     * 从 TransformComponent 捕获状态
     * Capture state from TransformComponent
     */
    static captureTransformState(transform: TransformComponent): TransformState {
        return {
            positionX: transform.position.x,
            positionY: transform.position.y,
            positionZ: transform.position.z,
            rotationX: transform.rotation.x,
            rotationY: transform.rotation.y,
            rotationZ: transform.rotation.z,
            scaleX: transform.scale.x,
            scaleY: transform.scale.y,
            scaleZ: transform.scale.z
        };
    }
}
