/**
 * Shiny effect component for UI elements.
 * UI 元素的闪光效果组件。
 *
 * This component configures a sweeping highlight animation that moves across
 * the UI element's texture.
 * 此组件配置一个扫过 UI 元素纹理的高光动画。
 */

import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';
import type { IShinyEffect } from '@esengine/material-system';
import {
    resetShinyEffect,
    startShinyEffect,
    stopShinyEffect,
    getShinyRotationRadians
} from '@esengine/material-system';

/**
 * UI Shiny effect component.
 * UI 闪光效果组件。
 *
 * Adds a sweeping highlight animation to UI elements with UIRenderComponent.
 * 为带有 UIRenderComponent 的 UI 元素添加扫光动画效果。
 *
 * @example
 * ```typescript
 * // Add shiny effect to an entity with UIRenderComponent
 * const shiny = entity.addComponent(UIShinyEffectComponent);
 * shiny.play = true;
 * shiny.loop = true;
 * shiny.duration = 2.0;
 * shiny.loopDelay = 2.0;
 * ```
 */
@ECSComponent('UIShinyEffect', { requires: ['UIRender'] })
@Serializable({ version: 1, typeId: 'UIShinyEffect' })
export class UIShinyEffectComponent extends Component implements IShinyEffect {
    // ============= Effect Parameters =============
    // ============= 效果参数 =============

    /**
     * Width of the shiny band (0.0 - 1.0).
     * 闪光带宽度 (0.0 - 1.0)。
     */
    @Serialize()
    @Property({ type: 'number', label: 'Width', min: 0, max: 1, step: 0.01 })
    public width: number = 0.25;

    /**
     * Rotation angle in degrees.
     * 旋转角度（度）。
     */
    @Serialize()
    @Property({ type: 'number', label: 'Rotation', min: 0, max: 360, step: 1 })
    public rotation: number = 129;

    /**
     * Edge softness (0.0 - 1.0).
     * 边缘柔和度 (0.0 - 1.0)。
     */
    @Serialize()
    @Property({ type: 'number', label: 'Softness', min: 0, max: 1, step: 0.01 })
    public softness: number = 1.0;

    /**
     * Brightness multiplier.
     * 亮度倍增器。
     */
    @Serialize()
    @Property({ type: 'number', label: 'Brightness', min: 0, max: 2, step: 0.01 })
    public brightness: number = 1.0;

    /**
     * Gloss intensity (0=white shine, 1=color-tinted shine).
     * 光泽度 (0=白色高光, 1=带颜色的高光)。
     */
    @Serialize()
    @Property({ type: 'number', label: 'Gloss', min: 0, max: 1, step: 0.01 })
    public gloss: number = 0;

    // ============= Animation Settings =============
    // ============= 动画设置 =============

    /**
     * Whether the animation is playing.
     * 动画是否正在播放。
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Play' })
    public play: boolean = true;

    /**
     * Whether to loop the animation.
     * 是否循环动画。
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Loop' })
    public loop: boolean = true;

    /**
     * Animation duration in seconds.
     * 动画持续时间（秒）。
     */
    @Serialize()
    @Property({ type: 'number', label: 'Duration', min: 0.1, step: 0.1 })
    public duration: number = 2.0;

    /**
     * Delay between loops in seconds.
     * 循环之间的延迟（秒）。
     */
    @Serialize()
    @Property({ type: 'number', label: 'Loop Delay', min: 0, step: 0.1 })
    public loopDelay: number = 2.0;

    /**
     * Initial delay before first play in seconds.
     * 首次播放前的初始延迟（秒）。
     */
    @Serialize()
    @Property({ type: 'number', label: 'Initial Delay', min: 0, step: 0.1 })
    public initialDelay: number = 0;

    // ============= Runtime State (not serialized) =============
    // ============= 运行时状态（不序列化）=============

    /** Current animation progress (0.0 - 1.0). | 当前动画进度。 */
    public progress: number = 0;

    /** Current elapsed time in the animation cycle. | 当前周期已用时间。 */
    public elapsedTime: number = 0;

    /** Whether currently in delay phase. | 是否处于延迟阶段。 */
    public inDelay: boolean = false;

    /** Remaining delay time. | 剩余延迟时间。 */
    public delayRemaining: number = 0;

    /** Whether the initial delay has been processed. | 初始延迟是否已处理。 */
    public initialDelayProcessed: boolean = false;

    /**
     * Reset the animation to the beginning.
     * 重置动画到开始状态。
     */
    reset(): void {
        resetShinyEffect(this);
    }

    /**
     * Start playing the animation.
     * 开始播放动画。
     */
    start(): void {
        startShinyEffect(this);
    }

    /**
     * Stop the animation.
     * 停止动画。
     */
    stop(): void {
        stopShinyEffect(this);
    }

    /**
     * Get rotation in radians for shader use.
     * 获取弧度制的旋转角度供着色器使用。
     */
    getRotationRadians(): number {
        return getShinyRotationRadians(this);
    }
}
