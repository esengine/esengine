/**
 * @zh 种子随机数生成器
 * @en Seeded Random Number Generator
 *
 * @zh 基于 xorshift128+ 算法的确定性伪随机数生成器
 * @en Deterministic PRNG based on xorshift128+ algorithm
 */

/**
 * @zh 种子随机数生成器
 * @en Seeded random number generator
 */
export class SeededRandom {
    private _s0: number;
    private _s1: number;
    private readonly _initialS0: number;
    private readonly _initialS1: number;

    /**
     * @zh 创建种子随机数生成器
     * @en Create seeded random number generator
     *
     * @param seed - @zh 随机种子 @en Random seed
     */
    constructor(seed: number = Date.now()) {
        // Initialize with MurmurHash3 mixing
        let h = seed | 0;
        h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
        h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
        h ^= h >>> 16;

        this._s0 = h >>> 0;
        this._s1 = (h * 0x9e3779b9) >>> 0;

        // Ensure non-zero state
        if (this._s0 === 0) this._s0 = 1;
        if (this._s1 === 0) this._s1 = 1;

        this._initialS0 = this._s0;
        this._initialS1 = this._s1;

        // Warm up
        for (let i = 0; i < 10; i++) {
            this.next();
        }
    }

    /**
     * @zh 重置到初始状态
     * @en Reset to initial state
     */
    reset(): void {
        this._s0 = this._initialS0;
        this._s1 = this._initialS1;

        for (let i = 0; i < 10; i++) {
            this.next();
        }
    }

    /**
     * @zh 生成下一个随机数 [0, 1)
     * @en Generate next random number [0, 1)
     */
    next(): number {
        let s1 = this._s0;
        const s0 = this._s1;
        this._s0 = s0;
        s1 ^= s1 << 23;
        s1 ^= s1 >>> 17;
        s1 ^= s0;
        s1 ^= s0 >>> 26;
        this._s1 = s1;
        return ((this._s0 + this._s1) >>> 0) / 4294967296;
    }

    /**
     * @zh 生成整数 [min, max]
     * @en Generate integer [min, max]
     */
    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    /**
     * @zh 生成浮点数 [min, max)
     * @en Generate float [min, max)
     */
    nextFloat(min: number, max: number): number {
        return this.next() * (max - min) + min;
    }

    /**
     * @zh 生成布尔值
     * @en Generate boolean
     *
     * @param probability - @zh 为 true 的概率 [0, 1] @en Probability of true [0, 1]
     */
    nextBool(probability: number = 0.5): boolean {
        return this.next() < probability;
    }

    /**
     * @zh 生成正态分布随机数 (Box-Muller 变换)
     * @en Generate normally distributed random number (Box-Muller transform)
     *
     * @param mean - @zh 均值 @en Mean
     * @param stdDev - @zh 标准差 @en Standard deviation
     */
    nextGaussian(mean: number = 0, stdDev: number = 1): number {
        const u1 = this.next();
        const u2 = this.next();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * stdDev + mean;
    }

    /**
     * @zh 生成指数分布随机数
     * @en Generate exponentially distributed random number
     *
     * @param lambda - @zh 率参数 @en Rate parameter
     */
    nextExponential(lambda: number = 1): number {
        return -Math.log(1 - this.next()) / lambda;
    }

    /**
     * @zh 在圆内生成均匀分布的随机点
     * @en Generate uniformly distributed random point in circle
     *
     * @param radius - @zh 半径 @en Radius
     */
    nextPointInCircle(radius: number = 1): { x: number; y: number } {
        const r = Math.sqrt(this.next()) * radius;
        const theta = this.next() * 2 * Math.PI;
        return {
            x: r * Math.cos(theta),
            y: r * Math.sin(theta)
        };
    }

    /**
     * @zh 在圆环上生成随机点
     * @en Generate random point on circle
     *
     * @param radius - @zh 半径 @en Radius
     */
    nextPointOnCircle(radius: number = 1): { x: number; y: number } {
        const theta = this.next() * 2 * Math.PI;
        return {
            x: radius * Math.cos(theta),
            y: radius * Math.sin(theta)
        };
    }

    /**
     * @zh 在球内生成均匀分布的随机点
     * @en Generate uniformly distributed random point in sphere
     *
     * @param radius - @zh 半径 @en Radius
     */
    nextPointInSphere(radius: number = 1): { x: number; y: number; z: number } {
        const r = Math.cbrt(this.next()) * radius;
        const theta = this.next() * 2 * Math.PI;
        const phi = Math.acos(2 * this.next() - 1);
        return {
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi)
        };
    }

    /**
     * @zh 生成随机方向向量
     * @en Generate random direction vector
     */
    nextDirection2D(): { x: number; y: number } {
        const theta = this.next() * 2 * Math.PI;
        return {
            x: Math.cos(theta),
            y: Math.sin(theta)
        };
    }
}

/**
 * @zh 创建种子随机数生成器
 * @en Create seeded random number generator
 */
export function createSeededRandom(seed?: number): SeededRandom {
    return new SeededRandom(seed);
}
