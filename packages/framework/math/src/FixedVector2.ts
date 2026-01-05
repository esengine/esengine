import { Fixed32, type IFixed32 } from './Fixed32';
import { FixedMath } from './FixedMath';

/**
 * @zh 定点数 2D 向量数据接口
 * @en Fixed-point 2D vector data interface
 */
export interface IFixedVector2 {
    x: IFixed32;
    y: IFixed32;
}

/**
 * @zh 定点数 2D 向量类，用于确定性计算（帧同步）
 * @en Fixed-point 2D vector class for deterministic calculations (lockstep)
 *
 * @zh 所有运算返回新实例，保证不可变性
 * @en All operations return new instances, ensuring immutability
 *
 * @example
 * ```typescript
 * const a = FixedVector2.from(3, 4);
 * const b = FixedVector2.from(1, 2);
 * const c = a.add(b);  // (4, 6)
 * const len = a.length();  // 5
 * ```
 */
export class FixedVector2 {
    /** @zh X 分量 @en X component */
    readonly x: Fixed32;

    /** @zh Y 分量 @en Y component */
    readonly y: Fixed32;

    // ==================== 常量 ====================

    /** @zh 零向量 (0, 0) @en Zero vector */
    static readonly ZERO = new FixedVector2(Fixed32.ZERO, Fixed32.ZERO);

    /** @zh 单位向量 (1, 1) @en One vector */
    static readonly ONE = new FixedVector2(Fixed32.ONE, Fixed32.ONE);

    /** @zh 右方向 (1, 0) @en Right direction */
    static readonly RIGHT = new FixedVector2(Fixed32.ONE, Fixed32.ZERO);

    /** @zh 左方向 (-1, 0) @en Left direction */
    static readonly LEFT = new FixedVector2(Fixed32.NEG_ONE, Fixed32.ZERO);

    /** @zh 上方向 (0, 1) @en Up direction */
    static readonly UP = new FixedVector2(Fixed32.ZERO, Fixed32.ONE);

    /** @zh 下方向 (0, -1) @en Down direction */
    static readonly DOWN = new FixedVector2(Fixed32.ZERO, Fixed32.NEG_ONE);

    // ==================== 构造 ====================

    /**
     * @zh 创建定点数向量
     * @en Create fixed-point vector
     */
    constructor(x: Fixed32, y: Fixed32) {
        this.x = x;
        this.y = y;
    }

    /**
     * @zh 从浮点数创建向量
     * @en Create vector from floating-point numbers
     */
    static from(x: number, y: number): FixedVector2 {
        return new FixedVector2(Fixed32.from(x), Fixed32.from(y));
    }

    /**
     * @zh 从原始整数值创建向量
     * @en Create vector from raw integer values
     */
    static fromRaw(rawX: number, rawY: number): FixedVector2 {
        return new FixedVector2(Fixed32.fromRaw(rawX), Fixed32.fromRaw(rawY));
    }

    /**
     * @zh 从整数创建向量
     * @en Create vector from integers
     */
    static fromInt(x: number, y: number): FixedVector2 {
        return new FixedVector2(Fixed32.fromInt(x), Fixed32.fromInt(y));
    }

    /**
     * @zh 从普通向量接口创建
     * @en Create from plain vector interface
     */
    static fromObject(obj: { x: number; y: number }): FixedVector2 {
        return FixedVector2.from(obj.x, obj.y);
    }

    // ==================== 转换 ====================

    /**
     * @zh 转换为浮点数对象（用于渲染）
     * @en Convert to floating-point object (for rendering)
     */
    toObject(): { x: number; y: number } {
        return {
            x: this.x.toNumber(),
            y: this.y.toNumber()
        };
    }

    /**
     * @zh 转换为数组
     * @en Convert to array
     */
    toArray(): [number, number] {
        return [this.x.toNumber(), this.y.toNumber()];
    }

    /**
     * @zh 获取原始值对象（用于网络传输）
     * @en Get raw values object (for network transmission)
     */
    toRawObject(): { x: number; y: number } {
        return {
            x: this.x.toRaw(),
            y: this.y.toRaw()
        };
    }

    /**
     * @zh 转换为字符串
     * @en Convert to string
     */
    toString(): string {
        return `FixedVector2(${this.x.toNumber().toFixed(3)}, ${this.y.toNumber().toFixed(3)})`;
    }

    /**
     * @zh 克隆向量
     * @en Clone vector
     */
    clone(): FixedVector2 {
        return new FixedVector2(this.x, this.y);
    }

    // ==================== 基础运算 ====================

    /**
     * @zh 向量加法
     * @en Vector addition
     */
    add(other: FixedVector2): FixedVector2 {
        return new FixedVector2(this.x.add(other.x), this.y.add(other.y));
    }

    /**
     * @zh 向量减法
     * @en Vector subtraction
     */
    sub(other: FixedVector2): FixedVector2 {
        return new FixedVector2(this.x.sub(other.x), this.y.sub(other.y));
    }

    /**
     * @zh 标量乘法
     * @en Scalar multiplication
     */
    mul(scalar: Fixed32): FixedVector2 {
        return new FixedVector2(this.x.mul(scalar), this.y.mul(scalar));
    }

    /**
     * @zh 标量除法
     * @en Scalar division
     */
    div(scalar: Fixed32): FixedVector2 {
        return new FixedVector2(this.x.div(scalar), this.y.div(scalar));
    }

    /**
     * @zh 分量乘法
     * @en Component-wise multiplication
     */
    mulComponents(other: FixedVector2): FixedVector2 {
        return new FixedVector2(this.x.mul(other.x), this.y.mul(other.y));
    }

    /**
     * @zh 分量除法
     * @en Component-wise division
     */
    divComponents(other: FixedVector2): FixedVector2 {
        return new FixedVector2(this.x.div(other.x), this.y.div(other.y));
    }

    /**
     * @zh 取反
     * @en Negate
     */
    neg(): FixedVector2 {
        return new FixedVector2(this.x.neg(), this.y.neg());
    }

    // ==================== 向量运算 ====================

    /**
     * @zh 点积
     * @en Dot product
     */
    dot(other: FixedVector2): Fixed32 {
        return this.x.mul(other.x).add(this.y.mul(other.y));
    }

    /**
     * @zh 叉积（2D 返回标量）
     * @en Cross product (returns scalar in 2D)
     */
    cross(other: FixedVector2): Fixed32 {
        return this.x.mul(other.y).sub(this.y.mul(other.x));
    }

    /**
     * @zh 长度的平方
     * @en Length squared
     */
    lengthSquared(): Fixed32 {
        return this.dot(this);
    }

    /**
     * @zh 长度（模）
     * @en Length (magnitude)
     */
    length(): Fixed32 {
        return Fixed32.sqrt(this.lengthSquared());
    }

    /**
     * @zh 归一化（转换为单位向量）
     * @en Normalize (convert to unit vector)
     */
    normalize(): FixedVector2 {
        const len = this.length();
        if (len.isZero()) {
            return FixedVector2.ZERO;
        }
        return this.div(len);
    }

    /**
     * @zh 到另一个向量的距离平方
     * @en Distance squared to another vector
     */
    distanceSquaredTo(other: FixedVector2): Fixed32 {
        const dx = this.x.sub(other.x);
        const dy = this.y.sub(other.y);
        return dx.mul(dx).add(dy.mul(dy));
    }

    /**
     * @zh 到另一个向量的距离
     * @en Distance to another vector
     */
    distanceTo(other: FixedVector2): Fixed32 {
        return Fixed32.sqrt(this.distanceSquaredTo(other));
    }

    /**
     * @zh 获取垂直向量（顺时针旋转90度）
     * @en Get perpendicular vector (clockwise 90 degrees)
     */
    perpendicular(): FixedVector2 {
        return new FixedVector2(this.y, this.x.neg());
    }

    /**
     * @zh 获取垂直向量（逆时针旋转90度）
     * @en Get perpendicular vector (counter-clockwise 90 degrees)
     */
    perpendicularCCW(): FixedVector2 {
        return new FixedVector2(this.y.neg(), this.x);
    }

    /**
     * @zh 投影到另一个向量上
     * @en Project onto another vector
     */
    projectOnto(onto: FixedVector2): FixedVector2 {
        const dot = this.dot(onto);
        const lenSq = onto.lengthSquared();
        if (lenSq.isZero()) {
            return FixedVector2.ZERO;
        }
        return onto.mul(dot.div(lenSq));
    }

    /**
     * @zh 反射向量（关于法线）
     * @en Reflect vector (about normal)
     */
    reflect(normal: FixedVector2): FixedVector2 {
        const dot = this.dot(normal);
        const two = Fixed32.from(2);
        return this.sub(normal.mul(two.mul(dot)));
    }

    // ==================== 旋转和角度 ====================

    /**
     * @zh 旋转向量（顺时针为正，左手坐标系）
     * @en Rotate vector (clockwise positive, left-hand coordinate system)
     * @param angle - @zh 旋转角度（弧度）@en Rotation angle in radians
     */
    rotate(angle: Fixed32): FixedVector2 {
        const cos = FixedMath.cos(angle);
        const sin = FixedMath.sin(angle);
        // 顺时针旋转: x' = x*cos + y*sin, y' = -x*sin + y*cos
        return new FixedVector2(
            this.x.mul(cos).add(this.y.mul(sin)),
            this.x.neg().mul(sin).add(this.y.mul(cos))
        );
    }

    /**
     * @zh 围绕一个点旋转
     * @en Rotate around a point
     */
    rotateAround(center: FixedVector2, angle: Fixed32): FixedVector2 {
        return this.sub(center).rotate(angle).add(center);
    }

    /**
     * @zh 获取向量角度（弧度）
     * @en Get vector angle in radians
     */
    angle(): Fixed32 {
        return FixedMath.atan2(this.y, this.x);
    }

    /**
     * @zh 获取与另一个向量的夹角
     * @en Get angle between this and another vector
     */
    angleTo(other: FixedVector2): Fixed32 {
        const cross = this.cross(other);
        const dot = this.dot(other);
        return FixedMath.atan2(cross, dot);
    }

    /**
     * @zh 从极坐标创建向量
     * @en Create vector from polar coordinates
     */
    static fromPolar(length: Fixed32, angle: Fixed32): FixedVector2 {
        return new FixedVector2(
            length.mul(FixedMath.cos(angle)),
            length.mul(FixedMath.sin(angle))
        );
    }

    /**
     * @zh 从角度创建单位向量
     * @en Create unit vector from angle
     */
    static fromAngle(angle: Fixed32): FixedVector2 {
        return new FixedVector2(FixedMath.cos(angle), FixedMath.sin(angle));
    }

    // ==================== 比较运算 ====================

    /**
     * @zh 检查是否相等
     * @en Check equality
     */
    equals(other: FixedVector2): boolean {
        return this.x.eq(other.x) && this.y.eq(other.y);
    }

    /**
     * @zh 检查是否为零向量
     * @en Check if zero vector
     */
    isZero(): boolean {
        return this.x.isZero() && this.y.isZero();
    }

    // ==================== 限制和插值 ====================

    /**
     * @zh 限制长度
     * @en Clamp length
     */
    clampLength(maxLength: Fixed32): FixedVector2 {
        const lenSq = this.lengthSquared();
        const maxLenSq = maxLength.mul(maxLength);
        if (lenSq.gt(maxLenSq)) {
            return this.normalize().mul(maxLength);
        }
        return this;
    }

    /**
     * @zh 限制分量范围
     * @en Clamp components
     */
    clamp(min: FixedVector2, max: FixedVector2): FixedVector2 {
        return new FixedVector2(
            Fixed32.clamp(this.x, min.x, max.x),
            Fixed32.clamp(this.y, min.y, max.y)
        );
    }

    /**
     * @zh 线性插值
     * @en Linear interpolation
     */
    lerp(target: FixedVector2, t: Fixed32): FixedVector2 {
        return new FixedVector2(
            Fixed32.lerp(this.x, target.x, t),
            Fixed32.lerp(this.y, target.y, t)
        );
    }

    /**
     * @zh 向目标移动固定距离
     * @en Move towards target by fixed distance
     */
    moveTowards(target: FixedVector2, maxDistance: Fixed32): FixedVector2 {
        const diff = target.sub(this);
        const dist = diff.length();

        if (dist.isZero() || dist.le(maxDistance)) {
            return target;
        }

        return this.add(diff.div(dist).mul(maxDistance));
    }

    // ==================== 静态方法 ====================

    /**
     * @zh 向量加法（静态）
     * @en Vector addition (static)
     */
    static add(a: FixedVector2, b: FixedVector2): FixedVector2 {
        return a.add(b);
    }

    /**
     * @zh 向量减法（静态）
     * @en Vector subtraction (static)
     */
    static sub(a: FixedVector2, b: FixedVector2): FixedVector2 {
        return a.sub(b);
    }

    /**
     * @zh 点积（静态）
     * @en Dot product (static)
     */
    static dot(a: FixedVector2, b: FixedVector2): Fixed32 {
        return a.dot(b);
    }

    /**
     * @zh 叉积（静态）
     * @en Cross product (static)
     */
    static cross(a: FixedVector2, b: FixedVector2): Fixed32 {
        return a.cross(b);
    }

    /**
     * @zh 距离（静态）
     * @en Distance (static)
     */
    static distance(a: FixedVector2, b: FixedVector2): Fixed32 {
        return a.distanceTo(b);
    }

    /**
     * @zh 线性插值（静态）
     * @en Linear interpolation (static)
     */
    static lerp(a: FixedVector2, b: FixedVector2, t: Fixed32): FixedVector2 {
        return a.lerp(b, t);
    }

    /**
     * @zh 获取两个向量的最小分量
     * @en Get minimum components of two vectors
     */
    static min(a: FixedVector2, b: FixedVector2): FixedVector2 {
        return new FixedVector2(Fixed32.min(a.x, b.x), Fixed32.min(a.y, b.y));
    }

    /**
     * @zh 获取两个向量的最大分量
     * @en Get maximum components of two vectors
     */
    static max(a: FixedVector2, b: FixedVector2): FixedVector2 {
        return new FixedVector2(Fixed32.max(a.x, b.x), Fixed32.max(a.y, b.y));
    }
}
