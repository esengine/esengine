/**
 * 2D 向量数据接口
 *
 * 轻量级数据结构，用于组件属性和序列化。
 * Lightweight data structure for component properties and serialization.
 */
export interface IVector2 {
    x: number;
    y: number;
}

/**
 * 2D向量类
 *
 * 提供完整的2D向量运算功能，包括：
 * - 基础运算（加减乘除）
 * - 向量运算（点积、叉积、归一化）
 * - 几何运算（距离、角度、投影）
 * - 变换操作（旋转、反射、插值）
 */
export class Vector2 implements IVector2 {
    /** X分量 */
    public x: number;

    /** Y分量 */
    public y: number;

    /**
   * 创建2D向量
   * @param x X分量，默认为0
   * @param y Y分量，默认为0
   */
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    // 静态常量
    /** 零向量 (0, 0) */
    static readonly ZERO = new Vector2(0, 0);

    /** 单位向量 (1, 1) */
    static readonly ONE = new Vector2(1, 1);

    /** 右方向向量 (1, 0) */
    static readonly RIGHT = new Vector2(1, 0);

    /** 左方向向量 (-1, 0) */
    static readonly LEFT = new Vector2(-1, 0);

    /** 上方向向量 (0, 1) */
    static readonly UP = new Vector2(0, 1);

    /** 下方向向量 (0, -1) */
    static readonly DOWN = new Vector2(0, -1);

    // 基础属性

    /**
   * 获取向量长度（模）
   */
    get length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
   * 获取向量长度的平方
   */
    get lengthSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    /**
   * 获取向量角度（弧度）
   */
    get angle(): number {
        return Math.atan2(this.y, this.x);
    }

    /**
   * 检查是否为零向量
   */
    get isZero(): boolean {
        return this.x === 0 && this.y === 0;
    }

    /**
   * 检查是否为单位向量
   */
    get isUnit(): boolean {
        const lenSq = this.lengthSquared;
        return Math.abs(lenSq - 1) < Number.EPSILON;
    }

    // 基础运算

    /**
   * 设置向量分量
   * @param x X分量
   * @param y Y分量
   * @returns 当前向量实例（链式调用）
   */
    set(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
   * 复制另一个向量的值
   * @param other 源向量
   * @returns 当前向量实例（链式调用）
   */
    copy(other: Vector2): this {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    /**
   * 克隆当前向量
   * @returns 新的向量实例
   */
    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    /**
   * 向量加法
   * @param other 另一个向量
   * @returns 当前向量实例（链式调用）
   */
    add(other: Vector2): this {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
   * 向量减法
   * @param other 另一个向量
   * @returns 当前向量实例（链式调用）
   */
    subtract(other: Vector2): this {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
   * 向量数乘
   * @param scalar 标量
   * @returns 当前向量实例（链式调用）
   */
    multiply(scalar: number): this {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
   * 向量数除
   * @param scalar 标量
   * @returns 当前向量实例（链式调用）
   */
    divide(scalar: number): this {
        if (scalar === 0) {
            throw new Error('不能除以零');
        }
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }

    /**
   * 向量取反
   * @returns 当前向量实例（链式调用）
   */
    negate(): this {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    // 向量运算

    /**
   * 计算与另一个向量的点积
   * @param other 另一个向量
   * @returns 点积值
   */
    dot(other: Vector2): number {
        return this.x * other.x + this.y * other.y;
    }

    /**
   * 计算与另一个向量的叉积（2D中返回标量）
   * @param other 另一个向量
   * @returns 叉积值
   */
    cross(other: Vector2): number {
        return this.x * other.y - this.y * other.x;
    }

    /**
   * 向量归一化（转换为单位向量）
   * @returns 当前向量实例（链式调用）
   */
    normalize(): this {
        const len = this.length;
        if (len === 0) {
            return this;
        }
        return this.divide(len);
    }

    /**
   * 获取归一化后的向量（不修改原向量）
   * @returns 新的单位向量
   */
    normalized(): Vector2 {
        return this.clone().normalize();
    }

    // 几何运算

    /**
   * 计算到另一个向量的距离
   * @param other 另一个向量
   * @returns 距离值
   */
    distanceTo(other: Vector2): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
   * 计算到另一个向量的距离平方
   * @param other 另一个向量
   * @returns 距离平方值
   */
    distanceToSquared(other: Vector2): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return dx * dx + dy * dy;
    }

    /**
   * 计算与另一个向量的夹角（弧度）
   * @param other 另一个向量
   * @returns 夹角（0到π）
   */
    angleTo(other: Vector2): number {
        const dot = this.dot(other);
        const lenProduct = this.length * other.length;
        if (lenProduct === 0) return 0;
        return Math.acos(Math.max(-1, Math.min(1, dot / lenProduct)));
    }

    /**
   * 计算向量在另一个向量上的投影
   * @param onto 投影目标向量
   * @returns 新的投影向量
   */
    projectOnto(onto: Vector2): Vector2 {
        const dot = this.dot(onto);
        const lenSq = onto.lengthSquared;
        if (lenSq === 0) return new Vector2();
        return onto.clone().multiply(dot / lenSq);
    }

    /**
   * 计算向量在另一个向量上的投影长度
   * @param onto 投影目标向量
   * @returns 投影长度（带符号）
   */
    projectOntoLength(onto: Vector2): number {
        const len = onto.length;
        if (len === 0) return 0;
        return this.dot(onto) / len;
    }

    /**
     * 获取垂直向量（顺时针旋转90度）
     * Get perpendicular vector (clockwise 90 degrees)
     * @returns 新的垂直向量
     */
    perpendicular(): Vector2 {
        // Clockwise 90° rotation: (x, y) -> (y, -x)
        // 顺时针旋转 90°
        return new Vector2(this.y, -this.x);
    }

    // 变换操作

    /**
     * 向量旋转（顺时针为正）
     * Rotate vector (clockwise positive)
     *
     * 使用左手坐标系约定：正角度 = 顺时针旋转
     * Uses left-hand coordinate system: positive angle = clockwise
     *
     * @param angle 旋转角度（弧度）
     * @returns 当前向量实例（链式调用）
     */
    rotate(angle: number): this {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        // Clockwise rotation: x' = x*cos + y*sin, y' = -x*sin + y*cos
        // 顺时针旋转公式
        const x = this.x * cos + this.y * sin;
        const y = -this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
        return this;
    }

    /**
   * 获取旋转后的向量（不修改原向量）
   * @param angle 旋转角度（弧度）
   * @returns 新的旋转后向量
   */
    rotated(angle: number): Vector2 {
        return this.clone().rotate(angle);
    }

    /**
   * 围绕一个点旋转
   * @param center 旋转中心点
   * @param angle 旋转角度（弧度）
   * @returns 当前向量实例（链式调用）
   */
    rotateAround(center: Vector2, angle: number): this {
        return this.subtract(center).rotate(angle).add(center);
    }

    /**
   * 反射向量（关于法线）
   * @param normal 法线向量（应为单位向量）
   * @returns 当前向量实例（链式调用）
   */
    reflect(normal: Vector2): this {
        const dot = this.dot(normal);
        this.x -= 2 * dot * normal.x;
        this.y -= 2 * dot * normal.y;
        return this;
    }

    /**
   * 获取反射后的向量（不修改原向量）
   * @param normal 法线向量（应为单位向量）
   * @returns 新的反射向量
   */
    reflected(normal: Vector2): Vector2 {
        return this.clone().reflect(normal);
    }

    // 插值和限制

    /**
   * 线性插值
   * @param target 目标向量
   * @param t 插值参数（0到1）
   * @returns 当前向量实例（链式调用）
   */
    lerp(target: Vector2, t: number): this {
        this.x += (target.x - this.x) * t;
        this.y += (target.y - this.y) * t;
        return this;
    }

    /**
   * 限制向量长度
   * @param maxLength 最大长度
   * @returns 当前向量实例（链式调用）
   */
    clampLength(maxLength: number): this {
        const lenSq = this.lengthSquared;
        if (lenSq > maxLength * maxLength) {
            return this.normalize().multiply(maxLength);
        }
        return this;
    }

    /**
   * 限制向量分量
   * @param min 最小值向量
   * @param max 最大值向量
   * @returns 当前向量实例（链式调用）
   */
    clamp(min: Vector2, max: Vector2): this {
        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));
        return this;
    }

    // 比较操作

    /**
   * 检查两个向量是否相等
   * @param other 另一个向量
   * @param epsilon 容差，默认为Number.EPSILON
   * @returns 是否相等
   */
    equals(other: Vector2, epsilon: number = Number.EPSILON): boolean {
        return Math.abs(this.x - other.x) < epsilon &&
           Math.abs(this.y - other.y) < epsilon;
    }

    /**
   * 检查两个向量是否完全相等
   * @param other 另一个向量
   * @returns 是否完全相等
   */
    exactEquals(other: Vector2): boolean {
        return this.x === other.x && this.y === other.y;
    }

    // 静态方法

    /**
     * @zh 向量加法（静态方法）
     * @en Vector addition (static method)
     * @param a - @zh 向量a @en Vector a
     * @param b - @zh 向量b @en Vector b
     * @returns @zh 新的结果向量 @en New result vector
     */
    static add(a: IVector2, b: IVector2): Vector2 {
        return new Vector2(a.x + b.x, a.y + b.y);
    }

    /**
     * @zh 向量减法（静态方法）
     * @en Vector subtraction (static method)
     * @param a - @zh 向量a @en Vector a
     * @param b - @zh 向量b @en Vector b
     * @returns @zh 新的结果向量 @en New result vector
     */
    static subtract(a: IVector2, b: IVector2): Vector2 {
        return new Vector2(a.x - b.x, a.y - b.y);
    }

    /**
     * @zh 向量数乘（静态方法）
     * @en Scalar multiplication (static method)
     * @param vector - @zh 向量 @en Vector
     * @param scalar - @zh 标量 @en Scalar
     * @returns @zh 新的结果向量 @en New result vector
     */
    static multiply(vector: IVector2, scalar: number): Vector2 {
        return new Vector2(vector.x * scalar, vector.y * scalar);
    }

    /**
     * @zh 向量点积（静态方法）
     * @en Dot product (static method)
     * @param a - @zh 向量a @en Vector a
     * @param b - @zh 向量b @en Vector b
     * @returns @zh 点积值 @en Dot product value
     */
    static dot(a: IVector2, b: IVector2): number {
        return a.x * b.x + a.y * b.y;
    }

    /**
     * @zh 向量叉积（静态方法，返回标量）
     * @en Cross product (static method, returns scalar)
     * @param a - @zh 向量a @en Vector a
     * @param b - @zh 向量b @en Vector b
     * @returns @zh 叉积值（z分量）@en Cross product value (z component)
     */
    static cross(a: IVector2, b: IVector2): number {
        return a.x * b.y - a.y * b.x;
    }

    /**
     * @zh 行列式（等同于叉积）
     * @en Determinant (same as cross product)
     * @param a - @zh 向量a @en Vector a
     * @param b - @zh 向量b @en Vector b
     * @returns @zh 行列式值 @en Determinant value
     */
    static det(a: IVector2, b: IVector2): number {
        return a.x * b.y - a.y * b.x;
    }

    /**
     * @zh 计算向量长度的平方（静态方法）
     * @en Calculate squared length of vector (static method)
     * @param v - @zh 向量 @en Vector
     * @returns @zh 长度的平方 @en Squared length
     */
    static lengthSq(v: IVector2): number {
        return v.x * v.x + v.y * v.y;
    }

    /**
     * @zh 计算向量长度（静态方法）
     * @en Calculate length of vector (static method)
     * @param v - @zh 向量 @en Vector
     * @returns @zh 长度 @en Length
     */
    static len(v: IVector2): number {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    /**
     * @zh 归一化向量（静态方法）
     * @en Normalize vector (static method)
     * @param v - @zh 向量 @en Vector
     * @returns @zh 单位向量 @en Unit vector
     */
    static normalize(v: IVector2): Vector2 {
        const len = Math.sqrt(v.x * v.x + v.y * v.y);
        if (len < Number.EPSILON) {
            return new Vector2(0, 0);
        }
        return new Vector2(v.x / len, v.y / len);
    }

    /**
     * @zh 计算两点间距离（静态方法）
     * @en Calculate distance between two points (static method)
     * @param a - @zh 点a @en Point a
     * @param b - @zh 点b @en Point b
     * @returns @zh 距离值 @en Distance value
     */
    static distance(a: IVector2, b: IVector2): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * @zh 计算两点间距离的平方（静态方法）
     * @en Calculate squared distance between two points (static method)
     * @param a - @zh 点a @en Point a
     * @param b - @zh 点b @en Point b
     * @returns @zh 距离的平方 @en Squared distance
     */
    static distanceSq(a: IVector2, b: IVector2): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return dx * dx + dy * dy;
    }

    /**
     * @zh 线性插值（静态方法）
     * @en Linear interpolation (static method)
     * @param a - @zh 起始向量 @en Start vector
     * @param b - @zh 目标向量 @en Target vector
     * @param t - @zh 插值参数（0到1）@en Interpolation parameter (0 to 1)
     * @returns @zh 新的插值结果向量 @en New interpolated result vector
     */
    static lerp(a: IVector2, b: IVector2, t: number): Vector2 {
        return new Vector2(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t
        );
    }

    /**
     * @zh 从角度创建单位向量（静态方法）
     * @en Create unit vector from angle (static method)
     * @param angle - @zh 角度（弧度）@en Angle (radians)
     * @returns @zh 新的单位向量 @en New unit vector
     */
    static fromAngle(angle: number): Vector2 {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }

    /**
     * @zh 从极坐标创建向量（静态方法）
     * @en Create vector from polar coordinates (static method)
     * @param len - @zh 长度 @en Length
     * @param angle - @zh 角度（弧度）@en Angle (radians)
     * @returns @zh 新的向量 @en New vector
     */
    static fromPolar(len: number, angle: number): Vector2 {
        return new Vector2(len * Math.cos(angle), len * Math.sin(angle));
    }

    /**
     * @zh 获取两个向量中的最小分量向量（静态方法）
     * @en Get minimum component vector of two vectors (static method)
     * @param a - @zh 向量a @en Vector a
     * @param b - @zh 向量b @en Vector b
     * @returns @zh 新的最小分量向量 @en New minimum component vector
     */
    static min(a: IVector2, b: IVector2): Vector2 {
        return new Vector2(Math.min(a.x, b.x), Math.min(a.y, b.y));
    }

    /**
     * @zh 获取两个向量中的最大分量向量（静态方法）
     * @en Get maximum component vector of two vectors (static method)
     * @param a - @zh 向量a @en Vector a
     * @param b - @zh 向量b @en Vector b
     * @returns @zh 新的最大分量向量 @en New maximum component vector
     */
    static max(a: IVector2, b: IVector2): Vector2 {
        return new Vector2(Math.max(a.x, b.x), Math.max(a.y, b.y));
    }

    /**
     * @zh 获取左垂直向量（逆时针旋转90度）（静态方法）
     * @en Get left perpendicular vector (rotate 90 degrees counter-clockwise) (static method)
     * @param v - @zh 向量 @en Vector
     * @returns @zh 新的垂直向量 @en New perpendicular vector
     */
    static perpLeft(v: IVector2): Vector2 {
        return new Vector2(-v.y, v.x);
    }

    /**
     * @zh 获取右垂直向量（顺时针旋转90度）（静态方法）
     * @en Get right perpendicular vector (rotate 90 degrees clockwise) (static method)
     * @param v - @zh 向量 @en Vector
     * @returns @zh 新的垂直向量 @en New perpendicular vector
     */
    static perpRight(v: IVector2): Vector2 {
        return new Vector2(v.y, -v.x);
    }

    // 字符串转换

    /**
   * 转换为字符串
   * @returns 字符串表示
   */
    toString(): string {
        return `Vector2(${this.x.toFixed(3)}, ${this.y.toFixed(3)})`;
    }

    /**
   * 转换为数组
   * @returns [x, y] 数组
   */
    toArray(): [number, number] {
        return [this.x, this.y];
    }

    /**
   * 转换为普通对象
   * @returns {x, y} 对象
   */
    toObject(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }
}
