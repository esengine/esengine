/**
 * @zh Worley (Cellular) 噪声实现
 * @en Worley (Cellular) Noise Implementation
 *
 * @zh 基于 Voronoi 图的噪声，适合生成细胞、石头纹理
 * @en Voronoi-based noise, suitable for cellular and stone textures
 */

/**
 * @zh 距离函数类型
 * @en Distance function type
 */
export type DistanceFunction = 'euclidean' | 'manhattan' | 'chebyshev';

/**
 * @zh Worley 噪声生成器
 * @en Worley noise generator
 */
export class WorleyNoise {
    private readonly _seed: number;
    private readonly _distanceFunc: DistanceFunction;

    /**
     * @zh 创建 Worley 噪声生成器
     * @en Create Worley noise generator
     *
     * @param seed - @zh 随机种子 @en Random seed
     * @param distanceFunc - @zh 距离函数 @en Distance function
     */
    constructor(seed: number = 0, distanceFunc: DistanceFunction = 'euclidean') {
        this._seed = seed;
        this._distanceFunc = distanceFunc;
    }

    private _hash(x: number, y: number, z: number = 0): number {
        let h = this._seed;
        h ^= x * 374761393;
        h ^= y * 668265263;
        h ^= z * 1274126177;
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return h;
    }

    private _randomPoint(cellX: number, cellY: number, index: number): { x: number; y: number } {
        const h1 = this._hash(cellX, cellY, index);
        const h2 = this._hash(cellX, cellY, index + 1000);
        return {
            x: cellX + (h1 & 0xFFFF) / 65536,
            y: cellY + (h2 & 0xFFFF) / 65536
        };
    }

    private _randomPoint3D(cellX: number, cellY: number, cellZ: number, index: number): { x: number; y: number; z: number } {
        const h1 = this._hash(cellX, cellY, cellZ * 1000 + index);
        const h2 = this._hash(cellX, cellY, cellZ * 1000 + index + 1000);
        const h3 = this._hash(cellX, cellY, cellZ * 1000 + index + 2000);
        return {
            x: cellX + (h1 & 0xFFFF) / 65536,
            y: cellY + (h2 & 0xFFFF) / 65536,
            z: cellZ + (h3 & 0xFFFF) / 65536
        };
    }

    private _distance2D(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x2 - x1;
        const dy = y2 - y1;

        switch (this._distanceFunc) {
            case 'manhattan':
                return Math.abs(dx) + Math.abs(dy);
            case 'chebyshev':
                return Math.max(Math.abs(dx), Math.abs(dy));
            case 'euclidean':
            default:
                return Math.sqrt(dx * dx + dy * dy);
        }
    }

    private _distance3D(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;

        switch (this._distanceFunc) {
            case 'manhattan':
                return Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
            case 'chebyshev':
                return Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
            case 'euclidean':
            default:
                return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
    }

    /**
     * @zh 2D Worley 噪声
     * @en 2D Worley noise
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @param pointsPerCell - @zh 每个单元格的点数 @en Points per cell
     * @returns @zh 到最近点的距离 [0, ~1.4] @en Distance to nearest point [0, ~1.4]
     */
    noise2D(x: number, y: number, pointsPerCell: number = 1): number {
        const cellX = Math.floor(x);
        const cellY = Math.floor(y);

        let minDist = Infinity;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const cx = cellX + dx;
                const cy = cellY + dy;

                for (let i = 0; i < pointsPerCell; i++) {
                    const point = this._randomPoint(cx, cy, i);
                    const dist = this._distance2D(x, y, point.x, point.y);
                    minDist = Math.min(minDist, dist);
                }
            }
        }

        return minDist;
    }

    /**
     * @zh 3D Worley 噪声
     * @en 3D Worley noise
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @param z - @zh Z 坐标 @en Z coordinate
     * @param pointsPerCell - @zh 每个单元格的点数 @en Points per cell
     * @returns @zh 到最近点的距离 @en Distance to nearest point
     */
    noise3D(x: number, y: number, z: number, pointsPerCell: number = 1): number {
        const cellX = Math.floor(x);
        const cellY = Math.floor(y);
        const cellZ = Math.floor(z);

        let minDist = Infinity;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const cx = cellX + dx;
                    const cy = cellY + dy;
                    const cz = cellZ + dz;

                    for (let i = 0; i < pointsPerCell; i++) {
                        const point = this._randomPoint3D(cx, cy, cz, i);
                        const dist = this._distance3D(x, y, z, point.x, point.y, point.z);
                        minDist = Math.min(minDist, dist);
                    }
                }
            }
        }

        return minDist;
    }

    /**
     * @zh 获取到第 N 近点的距离（用于更复杂的纹理）
     * @en Get distance to Nth nearest point (for more complex textures)
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @param n - @zh 第 N 近 (1 = 最近) @en Nth nearest (1 = nearest)
     * @returns @zh 距离值 @en Distance value
     */
    nthNearest2D(x: number, y: number, n: number = 1): number {
        const cellX = Math.floor(x);
        const cellY = Math.floor(y);
        const distances: number[] = [];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const cx = cellX + dx;
                const cy = cellY + dy;
                const point = this._randomPoint(cx, cy, 0);
                distances.push(this._distance2D(x, y, point.x, point.y));
            }
        }

        distances.sort((a, b) => a - b);
        return distances[Math.min(n - 1, distances.length - 1)];
    }
}

/**
 * @zh 创建 Worley 噪声生成器
 * @en Create Worley noise generator
 */
export function createWorleyNoise(seed: number = 0, distanceFunc: DistanceFunction = 'euclidean'): WorleyNoise {
    return new WorleyNoise(seed, distanceFunc);
}
