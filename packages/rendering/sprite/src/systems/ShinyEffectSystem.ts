/**
 * Shiny effect animation system.
 * 闪光效果动画系统。
 *
 * Updates ShinyEffectComponent animations and applies material overrides
 * to the associated SpriteComponent.
 * 更新 ShinyEffectComponent 动画并将材质覆盖应用到关联的 SpriteComponent。
 */

import { EntitySystem, Matcher, ECSSystem, Time, Entity } from '@esengine/ecs-framework';
import { ShinyEffectAnimator } from '@esengine/material-system';
import { ShinyEffectComponent } from '../ShinyEffectComponent';
import { SpriteComponent } from '../SpriteComponent';

/**
 * System that animates shiny effects on sprites.
 * 为精灵动画闪光效果的系统。
 */
@ECSSystem('ShinyEffect', { updateOrder: 100 })
export class ShinyEffectSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(ShinyEffectComponent));
    }

    /**
     * Process all entities with ShinyEffectComponent.
     * 处理所有带有 ShinyEffectComponent 的实体。
     */
    protected override process(entities: readonly Entity[]): void {
        const deltaTime = Time.deltaTime;

        for (const entity of entities) {
            if (!entity.enabled) continue;

            const shiny = entity.getComponent(ShinyEffectComponent);
            if (!shiny || !shiny.play) continue;

            const sprite = entity.getComponent(SpriteComponent);
            if (!sprite) continue;

            // Use shared animator logic
            // 使用共享的动画器逻辑
            ShinyEffectAnimator.processEffect(shiny, sprite, deltaTime);
        }
    }
}
