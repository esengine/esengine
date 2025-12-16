/**
 * 文本闪烁系统 - 实现 UI 元素的透明度脉冲动画
 *
 * Text Blink System - Implements alpha pulse animation for UI elements
 */

import { Entity, EntitySystem, Matcher, Time } from '@esengine/ecs-framework';
import { TextBlinkComponent } from '../components/TextBlinkComponent';
import { UITransformComponent } from '../components/UITransformComponent';

/**
 * 处理 TextBlinkComponent，驱动 UI 元素的透明度动画。
 * 常用于 "TAP TO START" 等需要吸引注意力的文本效果。
 *
 * Processes TextBlinkComponent to drive UI element alpha animation.
 * Commonly used for attention-grabbing text effects like "TAP TO START".
 */
export class TextBlinkSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(TextBlinkComponent, UITransformComponent));
    }

    protected override process(entities: readonly Entity[]): void {
        const deltaTime = Time.deltaTime;

        for (const entity of entities) {
            if (!entity.enabled) continue;

            const blink = entity.getComponent(TextBlinkComponent);
            const uiTransform = entity.getComponent(UITransformComponent);
            if (!blink || !uiTransform) continue;

            blink.addTime(deltaTime);
            uiTransform.alpha = blink.calculateAlpha();
        }
    }
}
