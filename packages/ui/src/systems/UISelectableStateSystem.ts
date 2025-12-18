/**
 * UI Selectable State System
 * UI 可选择状态系统
 *
 * Manages interaction states and color transitions for entities with UISelectableComponent.
 * Provides unified state management for all interactive UI elements.
 *
 * 管理带有 UISelectableComponent 实体的交互状态和颜色过渡。
 * 为所有交互式 UI 元素提供统一的状态管理。
 *
 * @example
 * ```typescript
 * // Add system to scene
 * scene.addSystem(new UISelectableStateSystem());
 *
 * // Create selectable element
 * const entity = scene.createEntity('myButton');
 * entity.addComponent(new UITransformComponent());
 * entity.addComponent(new UIInteractableComponent());
 * const selectable = entity.addComponent(new UISelectableComponent());
 * selectable.transition = 'colorTint';
 * selectable.highlightedColor = 0xFFFF00;
 *
 * // In render system, use selectable.currentColor for rendering
 * ```
 */

import { EntitySystem, Matcher, Entity, Time, ECSSystem } from '@esengine/ecs-framework';
import { UISelectableComponent } from '../components/base';
import { UIInteractableComponent } from '../components/UIInteractableComponent';

/**
 * UI Selectable State System
 * UI 可选择状态系统
 *
 * Handles:
 * - Syncing UISelectableComponent state with UIInteractableComponent
 * - Color transitions for colorTint mode
 * - State change detection and callbacks
 *
 * 处理：
 * - 将 UISelectableComponent 状态与 UIInteractableComponent 同步
 * - colorTint 模式的颜色过渡
 * - 状态变化检测和回调
 */
@ECSSystem('UISelectableState', { updateOrder: 45 })
export class UISelectableStateSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(UISelectableComponent, UIInteractableComponent));
    }

    protected process(entities: readonly Entity[]): void {
        const dt = Time.deltaTime;

        for (const entity of entities) {
            const selectable = entity.getComponent(UISelectableComponent);
            const interactable = entity.getComponent(UIInteractableComponent);

            if (!selectable || !interactable) continue;

            // Sync state from UIInteractableComponent
            // 从 UIInteractableComponent 同步状态
            this.syncState(selectable, interactable);

            // Update color transition
            // 更新颜色过渡
            selectable.updateTransition(dt);
        }
    }

    /**
     * Sync selectable state with interactable state
     * 将可选择状态与可交互状态同步
     */
    private syncState(selectable: UISelectableComponent, interactable: UIInteractableComponent): void {
        // Update interactable (disabled) state based on enabled flag
        // 根据 enabled 标志更新可交互（禁用）状态
        selectable.interactable = interactable.enabled;

        // Update pointer over state
        // 更新指针悬停状态
        selectable.setPointerOver(interactable.hovered);

        // Update pressed state
        // 更新按下状态
        selectable.setPressed(interactable.pressed);

        // Update selected state (keyboard navigation / focus)
        // 更新选中状态（键盘导航/焦点）
        selectable.setSelected(interactable.focused);
    }
}
