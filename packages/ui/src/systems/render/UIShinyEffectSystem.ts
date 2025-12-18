/**
 * UI 元素闪光效果动画系统
 * Shiny effect animation system for UI elements
 *
 * 两种模式 | Two modes:
 * 1. 组件控制 - UIShinyEffectComponent | Component-controlled
 * 2. 自动动画 - Shiny 材质自动播放 | Auto-animation for Shiny material
 */

import { EntitySystem, Matcher, ECSSystem, Time, Entity } from '@esengine/ecs-framework';
import { ShinyEffectAnimator, BuiltInShaders } from '@esengine/material-system';
import { UIShinyEffectComponent } from '../../components/UIShinyEffectComponent';
import { UIRenderComponent } from '../../components/UIRenderComponent';

// 默认动画参数 | Default animation settings
const AUTO_ANIMATION_DEFAULTS = {
    duration: 1.5,
    delay: 2.0,
    width: 0.15,
    rotation: 30,
    softness: 0.3,
    brightness: 1.2,
    gloss: 0.3
};

interface AutoAnimState {
    progress: number;
    waiting: boolean;
    waitTime: number;
}

/**
 * 闪光效果动画系统
 * Shiny effect animation system
 */
@ECSSystem('UIShinyEffect', { updateOrder: 98, runInEditMode: true })
export class UIShinyEffectSystem extends EntitySystem {
    private autoAnimStates: Map<number, AutoAnimState> = new Map();

    constructor() {
        super(Matcher.empty().all(UIRenderComponent));
    }

    protected override process(entities: readonly Entity[]): void {
        const deltaTime = Time.deltaTime;
        const usedEntityIds = new Set<number>();

        for (const entity of entities) {
            if (!entity.enabled) continue;

            const render = entity.getComponent(UIRenderComponent);
            if (!render) continue;

            const shinyComponent = entity.getComponent(UIShinyEffectComponent);

            // 模式1: 组件控制 | Mode 1: Component-controlled
            if (shinyComponent) {
                if (shinyComponent.play) {
                    ShinyEffectAnimator.processEffect(shinyComponent, render, deltaTime);
                }
                continue;
            }

            // 模式2: 自动动画 | Mode 2: Auto-animation
            if (render.getMaterialId() !== BuiltInShaders.Shiny) {
                continue;
            }

            usedEntityIds.add(entity.id);
            this.processAutoAnimation(entity.id, render, deltaTime);
        }

        // 清理已移除实体 | Cleanup removed entities
        for (const entityId of this.autoAnimStates.keys()) {
            if (!usedEntityIds.has(entityId)) {
                this.autoAnimStates.delete(entityId);
            }
        }
    }

    /**
     * 处理自动动画：系统控制 progress，其他属性用户可覆盖
     * Process auto-animation: system controls progress, other properties user-overridable
     */
    private processAutoAnimation(entityId: number, render: UIRenderComponent, deltaTime: number): void {
        let state = this.autoAnimStates.get(entityId);
        if (!state) {
            state = { progress: 0, waiting: false, waitTime: 0 };
            this.autoAnimStates.set(entityId, state);
        }

        const { duration, delay, width, rotation, softness, brightness, gloss } = AUTO_ANIMATION_DEFAULTS;

        // 更新动画进度 | Update progress
        if (state.waiting) {
            state.waitTime += deltaTime;
            if (state.waitTime >= delay) {
                state.waiting = false;
                state.waitTime = 0;
                state.progress = 0;
            }
        } else {
            state.progress += deltaTime / duration;
            if (state.progress >= 1) {
                state.progress = 0;
                state.waiting = true;
                state.waitTime = 0;
            }
        }

        // 系统控制 progress | System controls progress
        render.setOverrideFloat('u_shinyProgress', state.progress);

        // 其他属性：用户值优先，否则用默认值 | Other props: user value or default
        const overrides = render.materialOverrides;
        if (!overrides['u_shinyWidth']) render.setOverrideFloat('u_shinyWidth', width);
        if (!overrides['u_shinyRotation']) render.setOverrideFloat('u_shinyRotation', rotation * Math.PI / 180);
        if (!overrides['u_shinySoftness']) render.setOverrideFloat('u_shinySoftness', softness);
        if (!overrides['u_shinyBrightness']) render.setOverrideFloat('u_shinyBrightness', brightness);
        if (!overrides['u_shinyGloss']) render.setOverrideFloat('u_shinyGloss', gloss);
    }
}
