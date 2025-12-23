/**
 * SkeletonBakingSystem - System for baking skeleton matrices.
 * SkeletonBakingSystem - 骨骼矩阵烘焙系统。
 */

import { EntitySystem, Matcher, ECSSystem, Entity } from '@esengine/ecs-framework';
import { SkeletonComponent, type BoneTransform } from '../SkeletonComponent';
import { MeshComponent } from '../MeshComponent';

/**
 * System for computing skeleton bone matrices.
 * 用于计算骨骼矩阵的系统。
 *
 * Runs after Animation3DSystem to compute world matrices and final skinning matrices.
 * 在 Animation3DSystem 之后运行，计算世界矩阵和最终蒙皮矩阵。
 */
@ECSSystem('SkeletonBaking', { updateOrder: 110 })
export class SkeletonBakingSystem extends EntitySystem {
    // Temporary matrix for calculations
    // 用于计算的临时矩阵
    private tempMatrix: Float32Array = new Float32Array(16);
    private tempMatrix2: Float32Array = new Float32Array(16);

    constructor() {
        super(Matcher.empty().all(SkeletonComponent).all(MeshComponent));
    }

    /**
     * Process entities each frame.
     * 每帧处理实体。
     */
    protected override process(entities: readonly Entity[]): void {
        for (const entity of entities) {
            if (!entity.enabled) continue;
            this.updateEntity(entity);
        }
    }

    /**
     * Update a single entity's skeleton matrices.
     * 更新单个实体的骨骼矩阵。
     */
    private updateEntity(entity: Entity): void {
        const skeleton = entity.getComponent(SkeletonComponent);

        if (!skeleton || !skeleton.isLoaded || !skeleton.isDirty()) {
            return;
        }

        const joints = skeleton.joints;
        const boneTransforms = skeleton.boneTransforms;

        // Phase 1: Compute world matrices (parent-to-child order)
        // 阶段1: 计算世界矩阵（父到子顺序）
        for (let i = 0; i < joints.length; i++) {
            const joint = joints[i];
            const localTransform = boneTransforms[i];

            // Build local transform matrix
            // 构建局部变换矩阵
            this.buildTransformMatrix(localTransform, this.tempMatrix);

            if (joint.parentIndex >= 0) {
                // Multiply parent world matrix by local matrix
                // 将父世界矩阵乘以局部矩阵
                const parentWorld = skeleton.getWorldMatrix(joint.parentIndex);
                if (parentWorld) {
                    this.multiplyMatrices(parentWorld, this.tempMatrix, this.tempMatrix2);
                    skeleton.setWorldMatrix(i, this.tempMatrix2);
                } else {
                    skeleton.setWorldMatrix(i, this.tempMatrix);
                }
            } else {
                // Root bone - world matrix is local matrix
                // 根骨骼 - 世界矩阵就是局部矩阵
                skeleton.setWorldMatrix(i, this.tempMatrix);
            }
        }

        // Phase 2: Compute final matrices (world * inverseBindMatrix)
        // 阶段2: 计算最终矩阵（世界矩阵 * 逆绑定矩阵）
        for (let i = 0; i < joints.length; i++) {
            const joint = joints[i];
            const worldMatrix = skeleton.getWorldMatrix(i);

            if (worldMatrix && joint.inverseBindMatrix) {
                this.multiplyMatrices(worldMatrix, joint.inverseBindMatrix, this.tempMatrix);
                skeleton.setFinalMatrix(i, this.tempMatrix);
            }
        }

        // Clear dirty flag
        // 清除脏标记
        skeleton.clearDirty();
    }

    /**
     * Build 4x4 transform matrix from BoneTransform.
     * 从 BoneTransform 构建 4x4 变换矩阵。
     */
    private buildTransformMatrix(transform: BoneTransform, out: Float32Array): void {
        const [px, py, pz] = transform.position;
        const [qx, qy, qz, qw] = transform.rotation;
        const [sx, sy, sz] = transform.scale;

        // Build rotation matrix from quaternion
        // 从四元数构建旋转矩阵
        const x2 = qx + qx;
        const y2 = qy + qy;
        const z2 = qz + qz;
        const xx = qx * x2;
        const xy = qx * y2;
        const xz = qx * z2;
        const yy = qy * y2;
        const yz = qy * z2;
        const zz = qz * z2;
        const wx = qw * x2;
        const wy = qw * y2;
        const wz = qw * z2;

        // Column 0 (with scale)
        out[0] = (1 - (yy + zz)) * sx;
        out[1] = (xy + wz) * sx;
        out[2] = (xz - wy) * sx;
        out[3] = 0;

        // Column 1 (with scale)
        out[4] = (xy - wz) * sy;
        out[5] = (1 - (xx + zz)) * sy;
        out[6] = (yz + wx) * sy;
        out[7] = 0;

        // Column 2 (with scale)
        out[8] = (xz + wy) * sz;
        out[9] = (yz - wx) * sz;
        out[10] = (1 - (xx + yy)) * sz;
        out[11] = 0;

        // Column 3 (translation)
        out[12] = px;
        out[13] = py;
        out[14] = pz;
        out[15] = 1;
    }

    /**
     * Multiply two 4x4 matrices (column-major).
     * 乘以两个 4x4 矩阵（列优先）。
     */
    private multiplyMatrices(a: Float32Array, b: Float32Array, out: Float32Array): void {
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        let b0, b1, b2, b3;

        // Column 0
        b0 = b[0]; b1 = b[1]; b2 = b[2]; b3 = b[3];
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        // Column 1
        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        // Column 2
        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        // Column 3
        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    }
}
