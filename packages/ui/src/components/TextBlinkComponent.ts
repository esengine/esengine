/**
 * 文本闪烁组件
 * Text Blink Component
 *
 * 让文本产生闪烁效果，类似 Unity 的 Animation 实现
 * Creates a blinking effect for text, similar to Unity's Animation implementation
 */

import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';

/**
 * 文本闪烁组件
 * Text Blink Component
 */
@ECSComponent('TextBlink')
@Serializable({ version: 1, typeId: 'TextBlink' })
export class TextBlinkComponent extends Component {
    /**
     * 闪烁速度（周期/秒）
     * Blink speed (cycles per second)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Speed', min: 0.1, max: 10, step: 0.1 })
    public speed: number = 1.5;

    /**
     * 最小透明度
     * Minimum alpha
     */
    @Serialize()
    @Property({ type: 'number', label: 'Min Alpha', min: 0, max: 1, step: 0.05 })
    public minAlpha: number = 0.3;

    /**
     * 最大透明度
     * Maximum alpha
     */
    @Serialize()
    @Property({ type: 'number', label: 'Max Alpha', min: 0, max: 1, step: 0.05 })
    public maxAlpha: number = 1.0;

    /**
     * 是否启用闪烁
     * Whether blinking is enabled
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Enabled' })
    public blinkEnabled: boolean = true;

    // ============= 运行时状态（不序列化）| Runtime state (not serialized) =============

    /** 当前时间 | Current time */
    private _time: number = 0;

    /**
     * 获取当前时间
     * Get current time
     */
    public get time(): number {
        return this._time;
    }

    /**
     * 更新时间
     * Update time
     */
    public addTime(deltaTime: number): void {
        this._time += deltaTime;
    }

    /**
     * 计算当前 alpha 值
     * Calculate current alpha value
     *
     * 使用正弦波实现平滑的闪烁效果
     * Uses sine wave for smooth blinking effect
     */
    public calculateAlpha(): number {
        if (!this.blinkEnabled) {
            return this.maxAlpha;
        }

        // 使用正弦波：sin 从 -1 到 1，映射到 minAlpha 到 maxAlpha
        // Using sine wave: sin from -1 to 1, mapped to minAlpha to maxAlpha
        const t = Math.sin(this._time * this.speed * Math.PI * 2);
        const normalized = (t + 1) / 2; // 0 到 1
        return this.minAlpha + normalized * (this.maxAlpha - this.minAlpha);
    }

    /**
     * 重置状态
     * Reset state
     */
    public reset(): void {
        this._time = 0;
    }

    override onRemovedFromEntity(): void {
        this.reset();
    }
}
