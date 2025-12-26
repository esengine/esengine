/**
 * @zh Perlin 噪声实现
 * @en Perlin Noise Implementation
 *
 * @zh 基于 Ken Perlin 的改进版噪声算法
 * @en Based on Ken Perlin's improved noise algorithm
 */

/**
 * @zh Perlin 噪声生成器
 * @en Perlin noise generator
 */
export class PerlinNoise {
    private readonly _perm: Uint8Array;
    private readonly _gradP: Float32Array;

    /**
     * @zh 创建 Perlin 噪声生成器
     * @en Create Perlin noise generator
     *
     * @param seed - @zh 随机种子 @en Random seed
     */
    constructor(seed: number = 0) {
        this._perm = new Uint8Array(512);
        this._gradP = new Float32Array(512 * 3);
        this._seed(seed);
    }

    private _seed(seed: number): void {
        const p = new Uint8Array(256);

        // Initialize permutation array
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        // Shuffle using seed
        let n = seed;
        for (let i = 255; i > 0; i--) {
            n = (n * 16807) % 2147483647;
            const j = n % (i + 1);
            [p[i], p[j]] = [p[j], p[i]];
        }

        // Duplicate permutation array
        for (let i = 0; i < 512; i++) {
            this._perm[i] = p[i & 255];
        }

        // Precompute gradient vectors
        const grad3 = [
            1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
            1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
            0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
        ];

        for (let i = 0; i < 512; i++) {
            const gi = (this._perm[i] % 12) * 3;
            this._gradP[i * 3] = grad3[gi];
            this._gradP[i * 3 + 1] = grad3[gi + 1];
            this._gradP[i * 3 + 2] = grad3[gi + 2];
        }
    }

    private _fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private _lerp(a: number, b: number, t: number): number {
        return a + t * (b - a);
    }

    private _dot2(gi: number, x: number, y: number): number {
        return this._gradP[gi * 3] * x + this._gradP[gi * 3 + 1] * y;
    }

    private _dot3(gi: number, x: number, y: number, z: number): number {
        return this._gradP[gi * 3] * x + this._gradP[gi * 3 + 1] * y + this._gradP[gi * 3 + 2] * z;
    }

    /**
     * @zh 2D Perlin 噪声
     * @en 2D Perlin noise
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @returns @zh 噪声值 [-1, 1] @en Noise value [-1, 1]
     */
    noise2D(x: number, y: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this._fade(x);
        const v = this._fade(y);

        const A = this._perm[X] + Y;
        const B = this._perm[X + 1] + Y;

        return this._lerp(
            this._lerp(this._dot2(this._perm[A], x, y), this._dot2(this._perm[B], x - 1, y), u),
            this._lerp(this._dot2(this._perm[A + 1], x, y - 1), this._dot2(this._perm[B + 1], x - 1, y - 1), u),
            v
        );
    }

    /**
     * @zh 3D Perlin 噪声
     * @en 3D Perlin noise
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @param z - @zh Z 坐标 @en Z coordinate
     * @returns @zh 噪声值 [-1, 1] @en Noise value [-1, 1]
     */
    noise3D(x: number, y: number, z: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this._fade(x);
        const v = this._fade(y);
        const w = this._fade(z);

        const A = this._perm[X] + Y;
        const AA = this._perm[A] + Z;
        const AB = this._perm[A + 1] + Z;
        const B = this._perm[X + 1] + Y;
        const BA = this._perm[B] + Z;
        const BB = this._perm[B + 1] + Z;

        return this._lerp(
            this._lerp(
                this._lerp(this._dot3(this._perm[AA], x, y, z), this._dot3(this._perm[BA], x - 1, y, z), u),
                this._lerp(this._dot3(this._perm[AB], x, y - 1, z), this._dot3(this._perm[BB], x - 1, y - 1, z), u),
                v
            ),
            this._lerp(
                this._lerp(this._dot3(this._perm[AA + 1], x, y, z - 1), this._dot3(this._perm[BA + 1], x - 1, y, z - 1), u),
                this._lerp(this._dot3(this._perm[AB + 1], x, y - 1, z - 1), this._dot3(this._perm[BB + 1], x - 1, y - 1, z - 1), u),
                v
            ),
            w
        );
    }
}

/**
 * @zh 创建 Perlin 噪声生成器
 * @en Create Perlin noise generator
 */
export function createPerlinNoise(seed: number = 0): PerlinNoise {
    return new PerlinNoise(seed);
}
