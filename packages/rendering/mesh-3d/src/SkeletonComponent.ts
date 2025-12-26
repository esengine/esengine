/**
 * SkeletonComponent - 3D skeleton data component for skinned meshes.
 * SkeletonComponent - 用于蒙皮网格的 3D 骨骼数据组件。
 */

import { Component, ECSComponent, Serializable } from '@esengine/ecs-framework';
import type { ISkeletonData, ISkeletonJoint } from '@esengine/asset-system';

/**
 * Local transform for a bone/joint.
 * 骨骼/关节的局部变换。
 */
export interface BoneTransform {
    /** Position XYZ. | 位置 XYZ。 */
    position: [number, number, number];
    /** Rotation quaternion XYZW. | 旋转四元数 XYZW。 */
    rotation: [number, number, number, number];
    /** Scale XYZ. | 缩放 XYZ。 */
    scale: [number, number, number];
}

/**
 * 3D Skeleton component for skeletal animation.
 * 用于骨骼动画的 3D 骨骼组件。
 *
 * Requires MeshComponent for skeleton data source.
 * 需要 MeshComponent 作为骨骼数据来源。
 */
@ECSComponent('Skeleton', { requires: ['Mesh', 'Animation3D'] })
@Serializable({ version: 1, typeId: 'Skeleton' })
export class SkeletonComponent extends Component {
    // ===== Runtime Data | 运行时数据 =====

    /**
     * 骨骼数据（从 MeshAsset 加载）
     * Skeleton data (loaded from MeshAsset)
     */
    private _skeletonData: ISkeletonData | null = null;

    /**
     * 烘烤的骨骼矩阵（输出给渲染器）
     * Baked bone matrices (output for renderer)
     *
     * Each matrix is a 4x4 column-major matrix (16 floats).
     * 每个矩阵是 4x4 列优先矩阵（16 个浮点数）。
     */
    private _boneMatrices: Float32Array = new Float32Array(0);

    /**
     * 当前帧的骨骼局部变换
     * Current frame's bone local transforms
     */
    private _boneTransforms: BoneTransform[] = [];

    /**
     * 骨骼世界变换矩阵缓存
     * Bone world transform matrix cache
     */
    private _worldMatrices: Float32Array = new Float32Array(0);

    /**
     * 是否需要更新骨骼矩阵
     * Whether bone matrices need update
     */
    private _dirty: boolean = true;

    // ===== Public Getters | 公共获取器 =====

    /**
     * 获取骨骼数据
     * Get skeleton data
     */
    public get skeletonData(): ISkeletonData | null {
        return this._skeletonData;
    }

    /**
     * 获取关节数量
     * Get joint count
     */
    public get jointCount(): number {
        return this._skeletonData?.joints.length ?? 0;
    }

    /**
     * 获取烘烤的骨骼矩阵
     * Get baked bone matrices
     */
    public get boneMatrices(): Float32Array {
        return this._boneMatrices;
    }

    /**
     * 获取骨骼局部变换
     * Get bone local transforms
     */
    public get boneTransforms(): readonly BoneTransform[] {
        return this._boneTransforms;
    }

    /**
     * 骨骼是否已加载
     * Whether skeleton is loaded
     */
    public get isLoaded(): boolean {
        return this._skeletonData !== null && this._skeletonData.joints.length > 0;
    }

    /**
     * 获取关节列表
     * Get joint list
     */
    public get joints(): readonly ISkeletonJoint[] {
        return this._skeletonData?.joints ?? [];
    }

    // ===== Public Methods | 公共方法 =====

    /**
     * 设置骨骼数据（由系统调用）
     * Set skeleton data (called by system)
     */
    public setSkeletonData(data: ISkeletonData): void {
        this._skeletonData = data;

        const jointCount = data.joints.length;

        // Initialize bone matrices (each joint has a 4x4 matrix = 16 floats)
        // 初始化骨骼矩阵（每个关节有 4x4 矩阵 = 16 个浮点数）
        this._boneMatrices = new Float32Array(jointCount * 16);
        this._worldMatrices = new Float32Array(jointCount * 16);

        // Initialize bone transforms with identity
        // 用单位变换初始化骨骼变换
        this._boneTransforms = [];
        for (let i = 0; i < jointCount; i++) {
            this._boneTransforms.push({
                position: [0, 0, 0],
                rotation: [0, 0, 0, 1], // Identity quaternion
                scale: [1, 1, 1]
            });
        }

        // Initialize bone matrices to identity
        // 将骨骼矩阵初始化为单位矩阵
        for (let i = 0; i < jointCount; i++) {
            this.setIdentityMatrix(this._boneMatrices, i * 16);
            this.setIdentityMatrix(this._worldMatrices, i * 16);
        }

        this._dirty = true;
    }

    /**
     * 设置指定骨骼的局部变换
     * Set local transform for a bone
     */
    public setBoneTransform(jointIndex: number, transform: Partial<BoneTransform>): void {
        if (jointIndex < 0 || jointIndex >= this._boneTransforms.length) {
            return;
        }

        const bone = this._boneTransforms[jointIndex];
        if (transform.position) {
            bone.position = [...transform.position];
        }
        if (transform.rotation) {
            bone.rotation = [...transform.rotation];
        }
        if (transform.scale) {
            bone.scale = [...transform.scale];
        }

        this._dirty = true;
    }

    /**
     * 标记骨骼矩阵需要更新
     * Mark bone matrices as dirty
     */
    public markDirty(): void {
        this._dirty = true;
    }

    /**
     * 检查是否需要更新
     * Check if update is needed
     */
    public isDirty(): boolean {
        return this._dirty;
    }

    /**
     * 清除脏标记（由系统在更新后调用）
     * Clear dirty flag (called by system after update)
     */
    public clearDirty(): void {
        this._dirty = false;
    }

    /**
     * 获取指定骨骼的世界矩阵
     * Get world matrix for a bone
     */
    public getWorldMatrix(jointIndex: number): Float32Array | null {
        if (jointIndex < 0 || jointIndex >= this.jointCount) {
            return null;
        }
        return this._worldMatrices.subarray(jointIndex * 16, (jointIndex + 1) * 16);
    }

    /**
     * 设置指定骨骼的世界矩阵（由 SkeletonBakingSystem 调用）
     * Set world matrix for a bone (called by SkeletonBakingSystem)
     */
    public setWorldMatrix(jointIndex: number, matrix: Float32Array): void {
        if (jointIndex < 0 || jointIndex >= this.jointCount) {
            return;
        }
        const offset = jointIndex * 16;
        for (let i = 0; i < 16; i++) {
            this._worldMatrices[offset + i] = matrix[i];
        }
    }

    /**
     * 设置指定骨骼的最终矩阵（由 SkeletonBakingSystem 调用）
     * Set final matrix for a bone (called by SkeletonBakingSystem)
     */
    public setFinalMatrix(jointIndex: number, matrix: Float32Array): void {
        if (jointIndex < 0 || jointIndex >= this.jointCount) {
            return;
        }
        const offset = jointIndex * 16;
        for (let i = 0; i < 16; i++) {
            this._boneMatrices[offset + i] = matrix[i];
        }
    }

    /**
     * 按名称查找骨骼索引
     * Find bone index by name
     */
    public findBoneIndex(name: string): number {
        if (!this._skeletonData) return -1;

        for (let i = 0; i < this._skeletonData.joints.length; i++) {
            if (this._skeletonData.joints[i].name === name) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 重置组件
     * Reset component
     */
    reset(): void {
        this._skeletonData = null;
        this._boneMatrices = new Float32Array(0);
        this._worldMatrices = new Float32Array(0);
        this._boneTransforms = [];
        this._dirty = true;
    }

    // ===== Private Methods | 私有方法 =====

    /**
     * Set identity matrix at offset in array.
     * 在数组的偏移位置设置单位矩阵。
     */
    private setIdentityMatrix(arr: Float32Array, offset: number): void {
        arr[offset] = 1; arr[offset + 1] = 0; arr[offset + 2] = 0; arr[offset + 3] = 0;
        arr[offset + 4] = 0; arr[offset + 5] = 1; arr[offset + 6] = 0; arr[offset + 7] = 0;
        arr[offset + 8] = 0; arr[offset + 9] = 0; arr[offset + 10] = 1; arr[offset + 11] = 0;
        arr[offset + 12] = 0; arr[offset + 13] = 0; arr[offset + 14] = 0; arr[offset + 15] = 1;
    }
}
