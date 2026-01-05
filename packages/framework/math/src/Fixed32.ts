/**
 * @zh Q16.16 定点数，用于确定性计算（帧同步）
 * @en Q16.16 fixed-point number for deterministic calculations (lockstep)
 *
 * @zh 使用 16 位整数部分 + 16 位小数部分，范围 ±32767.99998
 * @en Uses 16-bit integer + 16-bit fraction, range ±32767.99998
 *
 * @example
 * ```typescript
 * const a = Fixed32.from(3.14);
 * const b = Fixed32.from(2);
 * const c = a.mul(b);  // 6.28
 * console.log(c.toNumber());
 * ```
 */
export class Fixed32 {
    /**
     * @zh 内部原始值（32位整数）
     * @en Internal raw value (32-bit integer)
     */
    readonly raw: number;

    /**
     * @zh 小数位数
     * @en Fraction bits
     */
    static readonly FRACTION_BITS = 16;

    /**
     * @zh 缩放因子 (2^16 = 65536)
     * @en Scale factor (2^16 = 65536)
     */
    static readonly SCALE = 65536;

    /**
     * @zh 最大值 (约 32767.99998)
     * @en Maximum value (approximately 32767.99998)
     */
    static readonly MAX_VALUE = 0x7FFFFFFF;

    /**
     * @zh 最小值 (约 -32768)
     * @en Minimum value (approximately -32768)
     */
    static readonly MIN_VALUE = -0x80000000;

    /**
     * @zh 精度 (1/65536 ≈ 0.0000153)
     * @en Precision (1/65536 ≈ 0.0000153)
     */
    static readonly EPSILON = 1;

    // ==================== 常量 ====================

    /** @zh 零 @en Zero */
    static readonly ZERO = new Fixed32(0);

    /** @zh 一 @en One */
    static readonly ONE = new Fixed32(Fixed32.SCALE);

    /** @zh 负一 @en Negative one */
    static readonly NEG_ONE = new Fixed32(-Fixed32.SCALE);

    /** @zh 二分之一 @en One half */
    static readonly HALF = new Fixed32(Fixed32.SCALE >> 1);

    /** @zh 圆周率 π @en Pi */
    static readonly PI = new Fixed32(205887); // π * 65536

    /** @zh 2π @en Two Pi */
    static readonly TWO_PI = new Fixed32(411775); // 2π * 65536

    /** @zh π/2 @en Pi divided by 2 */
    static readonly HALF_PI = new Fixed32(102944); // π/2 * 65536

    /** @zh 弧度转角度系数 (180/π) @en Radians to degrees factor */
    static readonly RAD_TO_DEG = new Fixed32(3754936); // (180/π) * 65536

    /** @zh 角度转弧度系数 (π/180) @en Degrees to radians factor */
    static readonly DEG_TO_RAD = new Fixed32(1144); // (π/180) * 65536

    // ==================== 构造 ====================

    /**
     * @zh 私有构造函数，使用静态方法创建实例
     * @en Private constructor, use static methods to create instances
     */
    private constructor(raw: number) {
        // 确保是 32 位有符号整数
        this.raw = raw | 0;
    }

    /**
     * @zh 从浮点数创建定点数
     * @en Create fixed-point from floating-point number
     * @param n - @zh 浮点数值 @en Floating-point value
     */
    static from(n: number): Fixed32 {
        return new Fixed32(Math.round(n * Fixed32.SCALE));
    }

    /**
     * @zh 从原始整数值创建定点数
     * @en Create fixed-point from raw integer value
     * @param raw - @zh 原始值 @en Raw value
     */
    static fromRaw(raw: number): Fixed32 {
        return new Fixed32(raw);
    }

    /**
     * @zh 从整数创建定点数（无精度损失）
     * @en Create fixed-point from integer (no precision loss)
     * @param n - @zh 整数值 @en Integer value
     */
    static fromInt(n: number): Fixed32 {
        return new Fixed32((n | 0) << Fixed32.FRACTION_BITS);
    }

    // ==================== 转换 ====================

    /**
     * @zh 转换为浮点数
     * @en Convert to floating-point number
     */
    toNumber(): number {
        return this.raw / Fixed32.SCALE;
    }

    /**
     * @zh 获取原始整数值
     * @en Get raw integer value
     */
    toRaw(): number {
        return this.raw;
    }

    /**
     * @zh 转换为整数（向下取整）
     * @en Convert to integer (floor)
     */
    toInt(): number {
        return this.raw >> Fixed32.FRACTION_BITS;
    }

    /**
     * @zh 转换为字符串
     * @en Convert to string
     */
    toString(): string {
        return `Fixed32(${this.toNumber().toFixed(5)})`;
    }

    // ==================== 基础运算 ====================

    /**
     * @zh 加法
     * @en Addition
     */
    add(other: Fixed32): Fixed32 {
        return new Fixed32(this.raw + other.raw);
    }

    /**
     * @zh 减法
     * @en Subtraction
     */
    sub(other: Fixed32): Fixed32 {
        return new Fixed32(this.raw - other.raw);
    }

    /**
     * @zh 乘法（使用 64 位中间结果防止溢出）
     * @en Multiplication (uses 64-bit intermediate to prevent overflow)
     */
    mul(other: Fixed32): Fixed32 {
        // 拆分为高低 16 位进行乘法，避免溢出
        const a = this.raw;
        const b = other.raw;

        // 使用 BigInt 确保精度（JS 数字在大数时会丢失精度）
        // 或者使用拆分法
        const aLow = a & 0xFFFF;
        const aHigh = a >> 16;
        const bLow = b & 0xFFFF;
        const bHigh = b >> 16;

        // (aHigh * 2^16 + aLow) * (bHigh * 2^16 + bLow) / 2^16
        // = aHigh * bHigh * 2^16 + aHigh * bLow + aLow * bHigh + aLow * bLow / 2^16
        const lowLow = (aLow * bLow) >>> 16;
        const lowHigh = aLow * bHigh;
        const highLow = aHigh * bLow;
        const highHigh = aHigh * bHigh;

        const result = highHigh * Fixed32.SCALE + lowHigh + highLow + lowLow;
        return new Fixed32(result | 0);
    }

    /**
     * @zh 除法
     * @en Division
     * @throws @zh 除数为零时抛出错误 @en Throws when dividing by zero
     */
    div(other: Fixed32): Fixed32 {
        if (other.raw === 0) {
            throw new Error('Fixed32: Division by zero');
        }
        // 先左移再除，保持精度
        const result = ((this.raw * Fixed32.SCALE) / other.raw) | 0;
        return new Fixed32(result);
    }

    /**
     * @zh 取模运算
     * @en Modulo operation
     */
    mod(other: Fixed32): Fixed32 {
        return new Fixed32(this.raw % other.raw);
    }

    /**
     * @zh 取反
     * @en Negation
     */
    neg(): Fixed32 {
        return new Fixed32(-this.raw);
    }

    /**
     * @zh 绝对值
     * @en Absolute value
     */
    abs(): Fixed32 {
        return this.raw >= 0 ? this : new Fixed32(-this.raw);
    }

    // ==================== 比较运算 ====================

    /**
     * @zh 等于
     * @en Equal to
     */
    eq(other: Fixed32): boolean {
        return this.raw === other.raw;
    }

    /**
     * @zh 不等于
     * @en Not equal to
     */
    ne(other: Fixed32): boolean {
        return this.raw !== other.raw;
    }

    /**
     * @zh 小于
     * @en Less than
     */
    lt(other: Fixed32): boolean {
        return this.raw < other.raw;
    }

    /**
     * @zh 小于等于
     * @en Less than or equal to
     */
    le(other: Fixed32): boolean {
        return this.raw <= other.raw;
    }

    /**
     * @zh 大于
     * @en Greater than
     */
    gt(other: Fixed32): boolean {
        return this.raw > other.raw;
    }

    /**
     * @zh 大于等于
     * @en Greater than or equal to
     */
    ge(other: Fixed32): boolean {
        return this.raw >= other.raw;
    }

    /**
     * @zh 检查是否为零
     * @en Check if zero
     */
    isZero(): boolean {
        return this.raw === 0;
    }

    /**
     * @zh 检查是否为正数
     * @en Check if positive
     */
    isPositive(): boolean {
        return this.raw > 0;
    }

    /**
     * @zh 检查是否为负数
     * @en Check if negative
     */
    isNegative(): boolean {
        return this.raw < 0;
    }

    // ==================== 数学函数 ====================

    /**
     * @zh 平方根（牛顿迭代法，确定性）
     * @en Square root (Newton's method, deterministic)
     */
    static sqrt(x: Fixed32): Fixed32 {
        if (x.raw <= 0) return Fixed32.ZERO;

        // 牛顿迭代法
        let guess = x.raw;
        let prev = 0;

        // 固定迭代次数确保确定性
        for (let i = 0; i < 16; i++) {
            prev = guess;
            guess = ((guess + ((x.raw * Fixed32.SCALE) / guess) | 0) >> 1) | 0;
            if (guess === prev) break;
        }

        return new Fixed32(guess);
    }

    /**
     * @zh 向下取整
     * @en Floor
     */
    static floor(x: Fixed32): Fixed32 {
        return new Fixed32(x.raw & ~(Fixed32.SCALE - 1));
    }

    /**
     * @zh 向上取整
     * @en Ceiling
     */
    static ceil(x: Fixed32): Fixed32 {
        const frac = x.raw & (Fixed32.SCALE - 1);
        if (frac === 0) return x;
        return new Fixed32((x.raw & ~(Fixed32.SCALE - 1)) + Fixed32.SCALE);
    }

    /**
     * @zh 四舍五入
     * @en Round
     */
    static round(x: Fixed32): Fixed32 {
        return new Fixed32((x.raw + (Fixed32.SCALE >> 1)) & ~(Fixed32.SCALE - 1));
    }

    /**
     * @zh 最小值
     * @en Minimum
     */
    static min(a: Fixed32, b: Fixed32): Fixed32 {
        return a.raw < b.raw ? a : b;
    }

    /**
     * @zh 最大值
     * @en Maximum
     */
    static max(a: Fixed32, b: Fixed32): Fixed32 {
        return a.raw > b.raw ? a : b;
    }

    /**
     * @zh 限制范围
     * @en Clamp to range
     */
    static clamp(x: Fixed32, min: Fixed32, max: Fixed32): Fixed32 {
        if (x.raw < min.raw) return min;
        if (x.raw > max.raw) return max;
        return x;
    }

    /**
     * @zh 线性插值
     * @en Linear interpolation
     * @param a - @zh 起始值 @en Start value
     * @param b - @zh 结束值 @en End value
     * @param t - @zh 插值参数 (0-1) @en Interpolation parameter (0-1)
     */
    static lerp(a: Fixed32, b: Fixed32, t: Fixed32): Fixed32 {
        // a + (b - a) * t
        return a.add(b.sub(a).mul(t));
    }

    /**
     * @zh 符号函数
     * @en Sign function
     * @returns @zh -1, 0, 或 1 @en -1, 0, or 1
     */
    static sign(x: Fixed32): Fixed32 {
        if (x.raw > 0) return Fixed32.ONE;
        if (x.raw < 0) return Fixed32.NEG_ONE;
        return Fixed32.ZERO;
    }

    // ==================== 静态运算（便捷方法） ====================

    /**
     * @zh 加法（静态）
     * @en Addition (static)
     */
    static add(a: Fixed32, b: Fixed32): Fixed32 {
        return a.add(b);
    }

    /**
     * @zh 减法（静态）
     * @en Subtraction (static)
     */
    static sub(a: Fixed32, b: Fixed32): Fixed32 {
        return a.sub(b);
    }

    /**
     * @zh 乘法（静态）
     * @en Multiplication (static)
     */
    static mul(a: Fixed32, b: Fixed32): Fixed32 {
        return a.mul(b);
    }

    /**
     * @zh 除法（静态）
     * @en Division (static)
     */
    static div(a: Fixed32, b: Fixed32): Fixed32 {
        return a.div(b);
    }
}

/**
 * @zh Fixed32 数据接口，用于序列化
 * @en Fixed32 data interface for serialization
 */
export interface IFixed32 {
    raw: number;
}
