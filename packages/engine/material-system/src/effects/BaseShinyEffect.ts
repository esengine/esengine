/**
 * Base shiny effect component for ES Engine.
 * ES引擎基础闪光效果组件。
 *
 * This abstract base class provides shared shiny effect properties and methods
 * that can be extended by both SpriteShinyEffectComponent and UIShinyEffectComponent.
 * 此抽象基类提供可由 SpriteShinyEffectComponent 和 UIShinyEffectComponent 扩展的
 * 共享闪光效果属性和方法。
 *
 * @packageDocumentation
 */

/**
 * Base interface for shiny effect configuration.
 * 闪光效果配置的基础接口。
 *
 * This interface defines all properties needed for the shiny effect animation.
 * 此接口定义了闪光效果动画所需的所有属性。
 */
export interface IShinyEffect {
    // ============= Effect Parameters =============
    // ============= 效果参数 =============

    /**
     * Width of the shiny band (0.0 - 1.0).
     * 闪光带宽度 (0.0 - 1.0)。
     */
    width: number;

    /**
     * Rotation angle in degrees.
     * 旋转角度（度）。
     */
    rotation: number;

    /**
     * Edge softness (0.0 - 1.0).
     * 边缘柔和度 (0.0 - 1.0)。
     */
    softness: number;

    /**
     * Brightness multiplier.
     * 亮度倍增器。
     */
    brightness: number;

    /**
     * Gloss intensity.
     * 光泽度。
     */
    gloss: number;

    // ============= Animation Settings =============
    // ============= 动画设置 =============

    /**
     * Whether the animation is playing.
     * 动画是否正在播放。
     */
    play: boolean;

    /**
     * Whether to loop the animation.
     * 是否循环动画。
     */
    loop: boolean;

    /**
     * Animation duration in seconds.
     * 动画持续时间（秒）。
     */
    duration: number;

    /**
     * Delay between loops in seconds.
     * 循环之间的延迟（秒）。
     */
    loopDelay: number;

    /**
     * Initial delay before first play in seconds.
     * 首次播放前的初始延迟（秒）。
     */
    initialDelay: number;

    // ============= Runtime State =============
    // ============= 运行时状态 =============

    /** Current animation progress (0.0 - 1.0). | 当前动画进度。 */
    progress: number;

    /** Current elapsed time in the animation cycle. | 当前周期已用时间。 */
    elapsedTime: number;

    /** Whether currently in delay phase. | 是否处于延迟阶段。 */
    inDelay: boolean;

    /** Remaining delay time. | 剩余延迟时间。 */
    delayRemaining: number;

    /** Whether the initial delay has been processed. | 初始延迟是否已处理。 */
    initialDelayProcessed: boolean;
}

/**
 * Default values for shiny effect properties.
 * 闪光效果属性的默认值。
 */
export const SHINY_EFFECT_DEFAULTS = {
    width: 0.25,
    rotation: 129,
    softness: 1.0,
    brightness: 1.0,
    gloss: 1.0,
    play: true,
    loop: true,
    duration: 2.0,
    loopDelay: 2.0,
    initialDelay: 0,
    progress: 0,
    elapsedTime: 0,
    inDelay: false,
    delayRemaining: 0,
    initialDelayProcessed: false
} as const;

/**
 * Property metadata for shiny effect Inspector.
 * 闪光效果 Inspector 的属性元数据。
 */
export const SHINY_EFFECT_PROPERTIES = {
    width: { type: 'number', label: 'Width', min: 0, max: 1, step: 0.01 },
    rotation: { type: 'number', label: 'Rotation', min: 0, max: 360, step: 1 },
    softness: { type: 'number', label: 'Softness', min: 0, max: 1, step: 0.01 },
    brightness: { type: 'number', label: 'Brightness', min: 0, max: 2, step: 0.01 },
    gloss: { type: 'number', label: 'Gloss', min: 0, max: 2, step: 0.01 },
    play: { type: 'boolean', label: 'Play' },
    loop: { type: 'boolean', label: 'Loop' },
    duration: { type: 'number', label: 'Duration', min: 0.1, step: 0.1 },
    loopDelay: { type: 'number', label: 'Loop Delay', min: 0, step: 0.1 },
    initialDelay: { type: 'number', label: 'Initial Delay', min: 0, step: 0.1 }
} as const;

/**
 * Reset shiny effect runtime state.
 * 重置闪光效果运行时状态。
 *
 * @param effect - The shiny effect to reset | 要重置的闪光效果
 */
export function resetShinyEffect(effect: IShinyEffect): void {
    effect.progress = 0;
    effect.elapsedTime = 0;
    effect.inDelay = false;
    effect.delayRemaining = 0;
    effect.initialDelayProcessed = false;
}

/**
 * Start playing the shiny effect.
 * 开始播放闪光效果。
 *
 * @param effect - The shiny effect to start | 要开始的闪光效果
 */
export function startShinyEffect(effect: IShinyEffect): void {
    resetShinyEffect(effect);
    effect.play = true;
}

/**
 * Stop the shiny effect.
 * 停止闪光效果。
 *
 * @param effect - The shiny effect to stop | 要停止的闪光效果
 */
export function stopShinyEffect(effect: IShinyEffect): void {
    effect.play = false;
}

/**
 * Get rotation in radians for shader use.
 * 获取弧度制的旋转角度供着色器使用。
 *
 * @param effect - The shiny effect | 闪光效果
 * @returns Rotation in radians | 弧度制的旋转角度
 */
export function getShinyRotationRadians(effect: IShinyEffect): number {
    return effect.rotation * Math.PI / 180;
}
