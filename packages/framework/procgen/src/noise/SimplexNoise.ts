/**
 * @zh Simplex 噪声实现
 * @en Simplex Noise Implementation
 *
 * @zh 比 Perlin 噪声更快且没有方向性伪影
 * @en Faster than Perlin noise with no directional artifacts
 */

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
const F3 = 1 / 3;
const G3 = 1 / 6;

/**
 * @zh Simplex 噪声生成器
 * @en Simplex noise generator
 */
export class SimplexNoise {
    private readonly _perm: Uint8Array;
    private readonly _permMod12: Uint8Array;

    private static readonly _grad3 = new Float32Array([
        1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
        1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
        0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
    ]);

    /**
     * @zh 创建 Simplex 噪声生成器
     * @en Create Simplex noise generator
     *
     * @param seed - @zh 随机种子 @en Random seed
     */
    constructor(seed: number = 0) {
        this._perm = new Uint8Array(512);
        this._permMod12 = new Uint8Array(512);
        this._seed(seed);
    }

    private _seed(seed: number): void {
        const p = new Uint8Array(256);

        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        let n = seed;
        for (let i = 255; i > 0; i--) {
            n = (n * 16807) % 2147483647;
            const j = n % (i + 1);
            [p[i], p[j]] = [p[j], p[i]];
        }

        for (let i = 0; i < 512; i++) {
            this._perm[i] = p[i & 255];
            this._permMod12[i] = this._perm[i] % 12;
        }
    }

    /**
     * @zh 2D Simplex 噪声
     * @en 2D Simplex noise
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @returns @zh 噪声值 [-1, 1] @en Noise value [-1, 1]
     */
    noise2D(x: number, y: number): number {
        const grad3 = SimplexNoise._grad3;
        let n0 = 0, n1 = 0, n2 = 0;

        const s = (x + y) * F2;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);

        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = x - X0;
        const y0 = y - Y0;

        let i1: number, j1: number;
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } else {
            i1 = 0;
            j1 = 1;
        }

        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2;
        const y2 = y0 - 1 + 2 * G2;

        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this._permMod12[ii + this._perm[jj]] * 3;
        const gi1 = this._permMod12[ii + i1 + this._perm[jj + j1]] * 3;
        const gi2 = this._permMod12[ii + 1 + this._perm[jj + 1]] * 3;

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
        }

        return 70 * (n0 + n1 + n2);
    }

    /**
     * @zh 3D Simplex 噪声
     * @en 3D Simplex noise
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @param z - @zh Z 坐标 @en Z coordinate
     * @returns @zh 噪声值 [-1, 1] @en Noise value [-1, 1]
     */
    noise3D(x: number, y: number, z: number): number {
        const grad3 = SimplexNoise._grad3;
        let n0 = 0, n1 = 0, n2 = 0, n3 = 0;

        const s = (x + y + z) * F3;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const k = Math.floor(z + s);

        const t = (i + j + k) * G3;
        const X0 = i - t;
        const Y0 = j - t;
        const Z0 = k - t;
        const x0 = x - X0;
        const y0 = y - Y0;
        const z0 = z - Z0;

        let i1: number, j1: number, k1: number;
        let i2: number, j2: number, k2: number;

        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
            } else if (x0 >= z0) {
                i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
            } else {
                i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
            }
        } else {
            if (y0 < z0) {
                i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
            } else if (x0 < z0) {
                i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
            } else {
                i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
            }
        }

        const x1 = x0 - i1 + G3;
        const y1 = y0 - j1 + G3;
        const z1 = z0 - k1 + G3;
        const x2 = x0 - i2 + 2 * G3;
        const y2 = y0 - j2 + 2 * G3;
        const z2 = z0 - k2 + 2 * G3;
        const x3 = x0 - 1 + 3 * G3;
        const y3 = y0 - 1 + 3 * G3;
        const z3 = z0 - 1 + 3 * G3;

        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;
        const gi0 = this._permMod12[ii + this._perm[jj + this._perm[kk]]] * 3;
        const gi1 = this._permMod12[ii + i1 + this._perm[jj + j1 + this._perm[kk + k1]]] * 3;
        const gi2 = this._permMod12[ii + i2 + this._perm[jj + j2 + this._perm[kk + k2]]] * 3;
        const gi3 = this._permMod12[ii + 1 + this._perm[jj + 1 + this._perm[kk + 1]]] * 3;

        let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 >= 0) {
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
        }

        let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 >= 0) {
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
        }

        let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 >= 0) {
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
        }

        let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 >= 0) {
            t3 *= t3;
            n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
        }

        return 32 * (n0 + n1 + n2 + n3);
    }
}

/**
 * @zh 创建 Simplex 噪声生成器
 * @en Create Simplex noise generator
 */
export function createSimplexNoise(seed: number = 0): SimplexNoise {
    return new SimplexNoise(seed);
}
