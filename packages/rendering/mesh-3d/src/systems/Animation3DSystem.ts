/**
 * Animation3DSystem - System for updating 3D animations.
 * Animation3DSystem - 3D 动画更新系统。
 */

import { EntitySystem, Matcher, ECSSystem, Entity, Time } from '@esengine/ecs-framework';
import { Animation3DComponent } from '../Animation3DComponent';
import { SkeletonComponent } from '../SkeletonComponent';
import { MeshComponent } from '../MeshComponent';
import { AnimationEvaluator } from '../animation/AnimationEvaluator';

/**
 * System for updating 3D animation playback.
 * 用于更新 3D 动画播放的系统。
 *
 * Queries all entities with Animation3DComponent,
 * updates animation time, and applies animation values to skeleton bones.
 * 查询所有具有 Animation3DComponent 的实体，
 * 更新动画时间，并将动画值应用到骨骼。
 */
@ECSSystem('Animation3D', { updateOrder: 100 })
export class Animation3DSystem extends EntitySystem {
    private evaluator: AnimationEvaluator;

    constructor() {
        super(Matcher.empty().all(Animation3DComponent).all(MeshComponent));
        this.evaluator = new AnimationEvaluator();
    }

    /**
     * Process entities each frame.
     * 每帧处理实体。
     */
    protected override process(entities: readonly Entity[]): void {
        const deltaTime = Time.deltaTime;

        for (const entity of entities) {
            if (!entity.enabled) continue;
            this.updateEntity(entity, deltaTime);
        }
    }

    /**
     * Update a single entity's animation.
     * 更新单个实体的动画。
     */
    private updateEntity(entity: Entity, deltaTime: number): void {
        const anim = entity.getComponent(Animation3DComponent);
        const mesh = entity.getComponent(MeshComponent);

        if (!anim || !mesh) return;

        // Initialize animation clips from mesh asset if needed
        // 如果需要，从网格资产初始化动画片段
        if (anim.clips.length === 0 && mesh.meshAsset?.animations) {
            anim.setClips(mesh.meshAsset.animations);

            // Auto-play if configured
            // 如果配置了自动播放
            if (anim.playOnAwake && anim.clips.length > 0) {
                anim.play();
            }
        }

        // Update animation time
        // 更新动画时间
        anim.updateTime(deltaTime);

        // Apply animation to skeleton
        // 将动画应用到骨骼
        if (anim.isPlaying && anim.currentClip) {
            this.applyAnimation(entity, anim);
        }
    }

    /**
     * Apply animation values to skeleton.
     * 将动画值应用到骨骼。
     */
    private applyAnimation(entity: Entity, anim: Animation3DComponent): void {
        const skeleton = entity.getComponent(SkeletonComponent);
        const clip = anim.currentClip;

        if (!clip || !skeleton?.isLoaded) return;

        // Evaluate animation at current time
        // 在当前时间评估动画
        const evaluatedValues = this.evaluator.evaluate(clip, anim.currentTime);

        // Apply values to skeleton bones
        // 将值应用到骨骼
        for (const [nodeIndex, value] of evaluatedValues) {
            if (value.path === 'translation') {
                skeleton.setBoneTransform(nodeIndex, {
                    position: value.value as [number, number, number]
                });
            } else if (value.path === 'rotation') {
                skeleton.setBoneTransform(nodeIndex, {
                    rotation: value.value as [number, number, number, number]
                });
            } else if (value.path === 'scale') {
                skeleton.setBoneTransform(nodeIndex, {
                    scale: value.value as [number, number, number]
                });
            }
        }

        // Mark skeleton as dirty for matrix update
        // 标记骨骼为脏以更新矩阵
        skeleton.markDirty();
    }
}
