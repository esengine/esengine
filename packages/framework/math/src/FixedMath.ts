import { Fixed32 } from './Fixed32';

/**
 * @zh 定点数数学函数库，使用查表法确保确定性
 * @en Fixed-point math functions using lookup tables for determinism
 *
 * @zh 所有三角函数使用预计算的查找表，确保在所有平台上结果一致
 * @en All trigonometric functions use precomputed lookup tables to ensure consistent results across all platforms
 */
export class FixedMath {
    /**
     * @zh 正弦表大小（每 90 度的采样点数）
     * @en Sine table size (samples per 90 degrees)
     */
    private static readonly SIN_TABLE_SIZE = 1024;

    /**
     * @zh 正弦查找表（0 到 90 度）
     * @en Sine lookup table (0 to 90 degrees)
     */
    private static readonly SIN_TABLE: Int32Array = FixedMath.generateSinTable();

    /**
     * @zh 生成正弦查找表
     * @en Generate sine lookup table
     */
    private static generateSinTable(): Int32Array {
        const table = new Int32Array(FixedMath.SIN_TABLE_SIZE + 1);
        for (let i = 0; i <= FixedMath.SIN_TABLE_SIZE; i++) {
            const angle = (i * Math.PI) / (2 * FixedMath.SIN_TABLE_SIZE);
            table[i] = Math.round(Math.sin(angle) * Fixed32.SCALE);
        }
        return table;
    }

    /**
     * @zh 正弦函数（确定性）
     * @en Sine function (deterministic)
     * @param angle - @zh 角度（弧度，定点数） @en Angle in radians (fixed-point)
     */
    static sin(angle: Fixed32): Fixed32 {
        // 将角度规范化到 [0, 2π)
        let raw = angle.raw % Fixed32.TWO_PI.raw;
        if (raw < 0) raw += Fixed32.TWO_PI.raw;

        const halfPi = Fixed32.HALF_PI.raw;
        const pi = Fixed32.PI.raw;
        const threeHalfPi = halfPi * 3;

        let tableAngle: number;
        let negative = false;

        if (raw <= halfPi) {
            // 第一象限: [0, π/2]
            tableAngle = raw;
        } else if (raw <= pi) {
            // 第二象限: (π/2, π]
            tableAngle = pi - raw;
        } else if (raw <= threeHalfPi) {
            // 第三象限: (π, 3π/2]
            tableAngle = raw - pi;
            negative = true;
        } else {
            // 第四象限: (3π/2, 2π)
            tableAngle = Fixed32.TWO_PI.raw - raw;
            negative = true;
        }

        // 计算表索引 (tableAngle 范围是 [0, π/2])
        const tableIndex = Math.min(
            ((tableAngle * FixedMath.SIN_TABLE_SIZE) / halfPi) | 0,
            FixedMath.SIN_TABLE_SIZE
        );

        const result = FixedMath.SIN_TABLE[tableIndex];
        return Fixed32.fromRaw(negative ? -result : result);
    }

    /**
     * @zh 余弦函数（确定性）
     * @en Cosine function (deterministic)
     * @param angle - @zh 角度（弧度，定点数） @en Angle in radians (fixed-point)
     */
    static cos(angle: Fixed32): Fixed32 {
        // cos(x) = sin(x + π/2)
        return FixedMath.sin(angle.add(Fixed32.HALF_PI));
    }

    /**
     * @zh 正切函数（确定性）
     * @en Tangent function (deterministic)
     * @param angle - @zh 角度（弧度，定点数） @en Angle in radians (fixed-point)
     */
    static tan(angle: Fixed32): Fixed32 {
        const cosVal = FixedMath.cos(angle);
        if (cosVal.isZero()) {
            // 返回最大值表示无穷大
            return Fixed32.fromRaw(Fixed32.MAX_VALUE);
        }
        return FixedMath.sin(angle).div(cosVal);
    }

    /**
     * @zh 反正切函数 atan2（确定性）
     * @en Arc tangent of y/x (deterministic)
     * @param y - @zh Y 坐标 @en Y coordinate
     * @param x - @zh X 坐标 @en X coordinate
     * @returns @zh 角度（弧度，范围 -π 到 π）@en Angle in radians (range -π to π)
     */
    static atan2(y: Fixed32, x: Fixed32): Fixed32 {
        const yRaw = y.raw;
        const xRaw = x.raw;

        if (xRaw === 0 && yRaw === 0) {
            return Fixed32.ZERO;
        }

        // 使用 CORDIC 算法的简化版本
        const absY = Math.abs(yRaw);
        const absX = Math.abs(xRaw);

        let angle: number;

        if (absX >= absY) {
            // |y/x| <= 1，使用泰勒展开近似
            angle = FixedMath.atanApprox(absY, absX);
        } else {
            // |y/x| > 1，使用恒等式 atan(y/x) = π/2 - atan(x/y)
            angle = Fixed32.HALF_PI.raw - FixedMath.atanApprox(absX, absY);
        }

        // 根据象限调整
        if (xRaw < 0) {
            angle = Fixed32.PI.raw - angle;
        }
        if (yRaw < 0) {
            angle = -angle;
        }

        return Fixed32.fromRaw(angle);
    }

    /**
     * @zh atan 近似计算（内部使用）
     * @en Approximate atan calculation (internal use)
     */
    private static atanApprox(num: number, den: number): number {
        if (den === 0) return Fixed32.HALF_PI.raw;

        // 使用多项式近似: atan(x) ≈ x - x³/3 + x⁵/5
        // 对于 |x| <= 1 精度足够
        const ratio = ((num * Fixed32.SCALE) / den) | 0;

        // 简化的多项式: atan(x) ≈ x * (1 - x²/3)
        // 更精确的版本: atan(x) ≈ x / (1 + 0.28125 * x²)
        const x2 = ((ratio * ratio) / Fixed32.SCALE) | 0;
        const factor = Fixed32.SCALE + ((x2 * 18432) / Fixed32.SCALE | 0); // 0.28125 * 65536 ≈ 18432
        const result = ((ratio * Fixed32.SCALE) / factor) | 0;

        return result;
    }

    /**
     * @zh 反正弦函数（确定性）
     * @en Arc sine function (deterministic)
     * @param x - @zh 值（范围 -1 到 1）@en Value (range -1 to 1)
     */
    static asin(x: Fixed32): Fixed32 {
        // asin(x) = atan2(x, sqrt(1 - x²))
        const one = Fixed32.ONE;
        const x2 = x.mul(x);
        const sqrt = Fixed32.sqrt(one.sub(x2));
        return FixedMath.atan2(x, sqrt);
    }

    /**
     * @zh 反余弦函数（确定性）
     * @en Arc cosine function (deterministic)
     * @param x - @zh 值（范围 -1 到 1）@en Value (range -1 to 1)
     */
    static acos(x: Fixed32): Fixed32 {
        // acos(x) = π/2 - asin(x)
        return Fixed32.HALF_PI.sub(FixedMath.asin(x));
    }

    /**
     * @zh 角度规范化到 [-π, π]
     * @en Normalize angle to [-π, π]
     */
    static normalizeAngle(angle: Fixed32): Fixed32 {
        let raw = angle.raw % Fixed32.TWO_PI.raw;

        if (raw > Fixed32.PI.raw) {
            raw -= Fixed32.TWO_PI.raw;
        } else if (raw < -Fixed32.PI.raw) {
            raw += Fixed32.TWO_PI.raw;
        }

        return Fixed32.fromRaw(raw);
    }

    /**
     * @zh 角度差值（最短路径）
     * @en Angle difference (shortest path)
     */
    static angleDelta(from: Fixed32, to: Fixed32): Fixed32 {
        return FixedMath.normalizeAngle(to.sub(from));
    }

    /**
     * @zh 角度线性插值（最短路径）
     * @en Angle linear interpolation (shortest path)
     */
    static lerpAngle(from: Fixed32, to: Fixed32, t: Fixed32): Fixed32 {
        const delta = FixedMath.angleDelta(from, to);
        return from.add(delta.mul(t));
    }

    /**
     * @zh 弧度转角度
     * @en Radians to degrees
     */
    static radToDeg(rad: Fixed32): Fixed32 {
        return rad.mul(Fixed32.RAD_TO_DEG);
    }

    /**
     * @zh 角度转弧度
     * @en Degrees to radians
     */
    static degToRad(deg: Fixed32): Fixed32 {
        return deg.mul(Fixed32.DEG_TO_RAD);
    }

    /**
     * @zh 幂函数（整数次幂）
     * @en Power function (integer exponent)
     */
    static pow(base: Fixed32, exp: number): Fixed32 {
        if (exp === 0) return Fixed32.ONE;
        if (exp < 0) {
            base = Fixed32.ONE.div(base);
            exp = -exp;
        }

        let result = Fixed32.ONE;
        while (exp > 0) {
            if (exp & 1) {
                result = result.mul(base);
            }
            base = base.mul(base);
            exp >>= 1;
        }

        return result;
    }

    /**
     * @zh 指数函数近似（e^x）
     * @en Exponential function approximation (e^x)
     */
    static exp(x: Fixed32): Fixed32 {
        // 使用泰勒展开: e^x ≈ 1 + x + x²/2 + x³/6 + x⁴/24
        const one = Fixed32.ONE;
        const x2 = x.mul(x);
        const x3 = x2.mul(x);
        const x4 = x3.mul(x);

        return one
            .add(x)
            .add(x2.div(Fixed32.from(2)))
            .add(x3.div(Fixed32.from(6)))
            .add(x4.div(Fixed32.from(24)));
    }

    /**
     * @zh 自然对数近似
     * @en Natural logarithm approximation
     */
    static ln(x: Fixed32): Fixed32 {
        if (x.raw <= 0) {
            throw new Error('FixedMath.ln: argument must be positive');
        }

        // 使用牛顿迭代法: y_{n+1} = y_n + 2 * (x - exp(y_n)) / (x + exp(y_n))
        let y = Fixed32.ZERO;
        const two = Fixed32.from(2);

        for (let i = 0; i < 10; i++) {
            const expY = FixedMath.exp(y);
            const diff = x.sub(expY);
            const sum = x.add(expY);
            y = y.add(two.mul(diff).div(sum));
        }

        return y;
    }
}
