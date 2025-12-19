import { Component, ECSComponent, Serializable, Serialize, Property } from '@esengine/ecs-framework';
import type { IVector3 } from '@esengine/ecs-framework-math';

/**
 * 3x3 矩阵（用于 2D 变换：旋转 + 缩放）
 * 实际存储为 [a, b, c, d, tx, ty] 形式的仿射变换
 *
 * 3x3 matrix for 2D transforms (rotation + scale).
 * Stored as affine transform [a, b, c, d, tx, ty].
 */
export interface Matrix2D {
    a: number;   // scaleX * cos(rotation)
    b: number;   // scaleX * sin(rotation)
    c: number;   // scaleY * -sin(rotation)
    d: number;   // scaleY * cos(rotation)
    tx: number;  // translateX
    ty: number;  // translateY
}

/**
 * Reactive Vector3 that automatically sets dirty flag on parent transform.
 * 响应式 Vector3，在修改时自动设置父变换的脏标记。
 *
 * @internal
 */
class ReactiveVector3 implements IVector3 {
    private _x: number;
    private _y: number;
    private _z: number;
    private _owner: TransformComponent;

    constructor(owner: TransformComponent, x: number = 0, y: number = 0, z: number = 0) {
        this._owner = owner;
        this._x = x;
        this._y = y;
        this._z = z;
    }

    get x(): number { return this._x; }
    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this._owner.markDirty();
        }
    }

    get y(): number { return this._y; }
    set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this._owner.markDirty();
        }
    }

    get z(): number { return this._z; }
    set z(value: number) {
        if (this._z !== value) {
            this._z = value;
            this._owner.markDirty();
        }
    }

    /**
     * Set all components at once (more efficient than setting individually).
     * 一次性设置所有分量（比单独设置更高效）。
     */
    set(x: number, y: number, z: number = this._z): void {
        const changed = this._x !== x || this._y !== y || this._z !== z;
        this._x = x;
        this._y = y;
        this._z = z;
        if (changed) {
            this._owner.markDirty();
        }
    }

    /**
     * Copy from another vector.
     * 从另一个向量复制。
     */
    copyFrom(v: IVector3): void {
        this.set(v.x, v.y, v.z);
    }

    /**
     * Get raw values without triggering getters (for serialization).
     * 获取原始值而不触发 getter（用于序列化）。
     */
    toObject(): IVector3 {
        return { x: this._x, y: this._y, z: this._z };
    }
}

@ECSComponent('Transform')
@Serializable({ version: 1, typeId: 'Transform' })
export class TransformComponent extends Component {
    // ===== 内部响应式存储 =====
    private _position: ReactiveVector3;
    private _rotation: ReactiveVector3;
    private _scale: ReactiveVector3;

    @Serialize()
    @Property({ type: 'vector3', label: 'Position' })
    get position(): IVector3 { return this._position; }
    set position(value: IVector3) {
        if (this._position) {
            this._position.copyFrom(value);
        } else {
            this._position = new ReactiveVector3(this, value.x, value.y, value.z);
        }
    }

    /** 欧拉角，单位：度 | Euler angles in degrees */
    @Serialize()
    @Property({ type: 'vector3', label: 'Rotation' })
    get rotation(): IVector3 { return this._rotation; }
    set rotation(value: IVector3) {
        if (this._rotation) {
            this._rotation.copyFrom(value);
        } else {
            this._rotation = new ReactiveVector3(this, value.x, value.y, value.z);
        }
    }

    @Serialize()
    @Property({ type: 'vector3', label: 'Scale' })
    get scale(): IVector3 { return this._scale; }
    set scale(value: IVector3) {
        if (this._scale) {
            this._scale.copyFrom(value);
        } else {
            this._scale = new ReactiveVector3(this, value.x, value.y, value.z);
        }
    }

    // ===== 世界变换（由 TransformSystem 计算）=====

    /** 世界位置（只读，由 TransformSystem 计算） */
    worldPosition: IVector3 = { x: 0, y: 0, z: 0 };

    /** 世界旋转（只读，由 TransformSystem 计算） */
    worldRotation: IVector3 = { x: 0, y: 0, z: 0 };

    /** 世界缩放（只读，由 TransformSystem 计算） */
    worldScale: IVector3 = { x: 1, y: 1, z: 1 };

    /** 本地到世界的 2D 变换矩阵（只读，由 TransformSystem 计算） */
    localToWorldMatrix: Matrix2D = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

    /** 变换是否需要更新 | Whether transform needs update */
    bDirty: boolean = true;

    /**
     * Frame counter when last updated (for change detection).
     * 上次更新的帧计数器（用于变化检测）。
     * @internal
     */
    _lastUpdateFrame: number = -1;

    /**
     * Cached render data version (incremented when transform changes).
     * 缓存的渲染数据版本（变换改变时递增）。
     * @internal
     */
    _version: number = 0;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        super();
        this._position = new ReactiveVector3(this, x, y, z);
        this._rotation = new ReactiveVector3(this, 0, 0, 0);
        this._scale = new ReactiveVector3(this, 1, 1, 1);
        // 初始化世界变换为本地变换值（在 TransformSystem 更新前使用）
        this.worldPosition = { x, y, z };
    }

    /**
     * Mark transform as dirty and increment version.
     * 标记变换为脏并递增版本号。
     */
    markDirty(): void {
        if (!this.bDirty) {
            this.bDirty = true;
            this._version++;
        }
    }

    /**
     * Clear dirty flag (called by TransformSystem after update).
     * 清除脏标记（由 TransformSystem 更新后调用）。
     */
    clearDirty(frameNumber: number): void {
        this.bDirty = false;
        this._lastUpdateFrame = frameNumber;
    }

    setPosition(x: number, y: number, z: number = 0): this {
        this._position.set(x, y, z);
        return this;
    }

    setRotation(x: number, y: number, z: number): this {
        this._rotation.set(x, y, z);
        return this;
    }

    setScale(x: number, y: number, z: number = 1): this {
        this._scale.set(x, y, z);
        return this;
    }

    /**
     * 将本地坐标转换为世界坐标
     */
    localToWorld(localX: number, localY: number): { x: number; y: number } {
        const m = this.localToWorldMatrix;
        return {
            x: m.a * localX + m.c * localY + m.tx,
            y: m.b * localX + m.d * localY + m.ty
        };
    }

    /**
     * 将世界坐标转换为本地坐标
     */
    worldToLocal(worldX: number, worldY: number): { x: number; y: number } {
        const m = this.localToWorldMatrix;
        const det = m.a * m.d - m.b * m.c;
        if (Math.abs(det) < 1e-10) {
            return { x: 0, y: 0 };
        }

        const invDet = 1 / det;
        const dx = worldX - m.tx;
        const dy = worldY - m.ty;

        return {
            x: (m.d * dx - m.c * dy) * invDet,
            y: (-m.b * dx + m.a * dy) * invDet
        };
    }
}
