/**
 * @zh 分形布朗运动 (FBM)
 * @en Fractal Brownian Motion (FBM)
 *
 * @zh 通过叠加多层噪声创建更自然的效果
 * @en Creates more natural effects by layering multiple noise octaves
 */

/**
 * @zh 噪声函数接口
 * @en Noise function interface
 */
export interface INoise2D {
    noise2D(x: number, y: number): number;
}

/**
 * @zh 噪声函数接口 (3D)
 * @en Noise function interface (3D)
 */
export interface INoise3D {
    noise3D(x: number, y: number, z: number): number;
}

/**
 * @zh FBM 配置
 * @en FBM configuration
 */
export interface FBMConfig {
    /**
     * @zh 八度数（层数）
     * @en Number of octaves (layers)
     */
    octaves: number;

    /**
     * @zh 频率倍增因子
     * @en Frequency multiplier per octave
     */
    lacunarity: number;

    /**
     * @zh 振幅衰减因子
     * @en Amplitude decay per octave
     */
    persistence: number;

    /**
     * @zh 初始频率
     * @en Initial frequency
     */
    frequency: number;

    /**
     * @zh 初始振幅
     * @en Initial amplitude
     */
    amplitude: number;
}

const DEFAULT_CONFIG: FBMConfig = {
    octaves: 6,
    lacunarity: 2.0,
    persistence: 0.5,
    frequency: 1.0,
    amplitude: 1.0
};

/**
 * @zh FBM 噪声生成器
 * @en FBM noise generator
 */
export class FBM {
    private readonly _noise: INoise2D & Partial<INoise3D>;
    private readonly _config: FBMConfig;

    /**
     * @zh 创建 FBM 噪声生成器
     * @en Create FBM noise generator
     *
     * @param noise - @zh 基础噪声函数 @en Base noise function
     * @param config - @zh 配置 @en Configuration
     */
    constructor(noise: INoise2D & Partial<INoise3D>, config?: Partial<FBMConfig>) {
        this._noise = noise;
        this._config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * @zh 2D FBM 噪声
     * @en 2D FBM noise
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @returns @zh 噪声值 @en Noise value
     */
    noise2D(x: number, y: number): number {
        let value = 0;
        let frequency = this._config.frequency;
        let amplitude = this._config.amplitude;
        let maxValue = 0;

        for (let i = 0; i < this._config.octaves; i++) {
            value += this._noise.noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= this._config.persistence;
            frequency *= this._config.lacunarity;
        }

        return value / maxValue;
    }

    /**
     * @zh 3D FBM 噪声
     * @en 3D FBM noise
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @param z - @zh Z 坐标 @en Z coordinate
     * @returns @zh 噪声值 @en Noise value
     */
    noise3D(x: number, y: number, z: number): number {
        if (!this._noise.noise3D) {
            throw new Error('Base noise does not support 3D');
        }

        let value = 0;
        let frequency = this._config.frequency;
        let amplitude = this._config.amplitude;
        let maxValue = 0;

        for (let i = 0; i < this._config.octaves; i++) {
            value += this._noise.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= this._config.persistence;
            frequency *= this._config.lacunarity;
        }

        return value / maxValue;
    }

    /**
     * @zh Ridged FBM（脊状，适合山脉）
     * @en Ridged FBM (suitable for mountains)
     */
    ridged2D(x: number, y: number): number {
        let value = 0;
        let frequency = this._config.frequency;
        let amplitude = this._config.amplitude;
        let weight = 1;

        for (let i = 0; i < this._config.octaves; i++) {
            let signal = this._noise.noise2D(x * frequency, y * frequency);
            signal = 1 - Math.abs(signal);
            signal *= signal;
            signal *= weight;
            weight = Math.max(0, Math.min(1, signal * 2));
            value += signal * amplitude;
            frequency *= this._config.lacunarity;
            amplitude *= this._config.persistence;
        }

        return value;
    }

    /**
     * @zh Turbulence（湍流，使用绝对值）
     * @en Turbulence (using absolute value)
     */
    turbulence2D(x: number, y: number): number {
        let value = 0;
        let frequency = this._config.frequency;
        let amplitude = this._config.amplitude;
        let maxValue = 0;

        for (let i = 0; i < this._config.octaves; i++) {
            value += Math.abs(this._noise.noise2D(x * frequency, y * frequency)) * amplitude;
            maxValue += amplitude;
            amplitude *= this._config.persistence;
            frequency *= this._config.lacunarity;
        }

        return value / maxValue;
    }

    /**
     * @zh Billowed（膨胀，适合云朵）
     * @en Billowed (suitable for clouds)
     */
    billowed2D(x: number, y: number): number {
        let value = 0;
        let frequency = this._config.frequency;
        let amplitude = this._config.amplitude;
        let maxValue = 0;

        for (let i = 0; i < this._config.octaves; i++) {
            const n = this._noise.noise2D(x * frequency, y * frequency);
            value += (Math.abs(n) * 2 - 1) * amplitude;
            maxValue += amplitude;
            amplitude *= this._config.persistence;
            frequency *= this._config.lacunarity;
        }

        return value / maxValue;
    }
}

/**
 * @zh 创建 FBM 噪声生成器
 * @en Create FBM noise generator
 */
export function createFBM(noise: INoise2D & Partial<INoise3D>, config?: Partial<FBMConfig>): FBM {
    return new FBM(noise, config);
}
