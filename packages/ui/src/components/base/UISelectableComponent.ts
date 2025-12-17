/**
 * UI Selectable Component - Base for all interactive UI elements
 * UI 可选择组件 - 所有可交互 UI 元素的基类
 *
 * Provides common interaction handling for buttons, sliders, toggles, etc.
 * 为按钮、滑块、开关等提供通用交互处理。
 */

import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';

/**
 * Interaction state
 * 交互状态
 */
export type UISelectableState = 'normal' | 'highlighted' | 'pressed' | 'selected' | 'disabled';

/**
 * Transition type for state changes
 * 状态变化的过渡类型
 */
export type UITransitionType = 'none' | 'colorTint' | 'spriteSwap' | 'animation';

/**
 * Color block for state colors
 * 状态颜色块
 */
export interface UIColorBlock {
    normalColor: number;
    highlightedColor: number;
    pressedColor: number;
    selectedColor: number;
    disabledColor: number;
    colorMultiplier: number;
    fadeDuration: number;
}

/**
 * Sprite state for sprite swap transition
 * 精灵切换过渡的精灵状态
 */
export interface UISpriteState {
    highlightedSprite?: string;
    pressedSprite?: string;
    selectedSprite?: string;
    disabledSprite?: string;
}

/**
 * Default color block
 * 默认颜色块
 */
export const DEFAULT_COLOR_BLOCK: UIColorBlock = {
    normalColor: 0xFFFFFF,
    highlightedColor: 0xF5F5F5,
    pressedColor: 0xC8C8C8,
    selectedColor: 0xF5F5F5,
    disabledColor: 0x787878,
    colorMultiplier: 1,
    fadeDuration: 0.1
};

/**
 * UI Selectable Component
 * UI 可选择组件
 *
 * Base component for interactive UI elements. Handles:
 * - Interaction state management (normal, highlighted, pressed, disabled)
 * - Visual transitions (color tint, sprite swap, animation)
 * - Navigation between selectables
 *
 * 可交互 UI 元素的基础组件。处理：
 * - 交互状态管理（正常、高亮、按下、禁用）
 * - 视觉过渡（颜色着色、精灵切换、动画）
 * - 可选择元素之间的导航
 *
 * @example
 * ```typescript
 * const selectable = entity.addComponent(UISelectableComponent);
 * selectable.interactable = true;
 * selectable.transition = 'colorTint';
 * selectable.colors.highlightedColor = 0xFFFF00;
 * ```
 */
@ECSComponent('UISelectable')
@Serializable({ version: 1, typeId: 'UISelectable' })
export class UISelectableComponent extends Component {
    /**
     * Whether the selectable is interactable
     * 可选择元素是否可交互
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Interactable / 可交互' })
    interactable: boolean = true;

    /**
     * Transition type for visual feedback
     * 视觉反馈的过渡类型
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Transition / 过渡',
        options: ['none', 'colorTint', 'spriteSwap', 'animation']
    })
    transition: UITransitionType = 'colorTint';

    /**
     * Normal state color
     * 正常状态颜色
     */
    @Serialize()
    @Property({ type: 'color', label: 'Normal Color / 正常颜色' })
    normalColor: number = 0xFFFFFF;

    /**
     * Highlighted state color
     * 高亮状态颜色
     */
    @Serialize()
    @Property({ type: 'color', label: 'Highlighted Color / 高亮颜色' })
    highlightedColor: number = 0xF5F5F5;

    /**
     * Pressed state color
     * 按下状态颜色
     */
    @Serialize()
    @Property({ type: 'color', label: 'Pressed Color / 按下颜色' })
    pressedColor: number = 0xC8C8C8;

    /**
     * Selected state color
     * 选中状态颜色
     */
    @Serialize()
    @Property({ type: 'color', label: 'Selected Color / 选中颜色' })
    selectedColor: number = 0xF5F5F5;

    /**
     * Disabled state color
     * 禁用状态颜色
     */
    @Serialize()
    @Property({ type: 'color', label: 'Disabled Color / 禁用颜色' })
    disabledColor: number = 0x787878;

    /**
     * Color multiplier
     * 颜色乘数
     */
    @Serialize()
    @Property({ type: 'number', label: 'Color Multiplier / 颜色乘数', min: 0, max: 2, step: 0.1 })
    colorMultiplier: number = 1;

    /**
     * Fade duration in seconds
     * 淡入淡出持续时间（秒）
     */
    @Serialize()
    @Property({ type: 'number', label: 'Fade Duration / 过渡时长', min: 0, max: 2, step: 0.05 })
    fadeDuration: number = 0.1;

    /**
     * Sprite swap settings
     * 精灵切换设置
     */
    sprites: UISpriteState = {};

    /**
     * Animation trigger name
     * 动画触发器名称
     */
    @Serialize()
    @Property({ type: 'string', label: 'Animation Trigger / 动画触发器' })
    animationTrigger: string = '';

    // ===== Runtime state (not serialized) =====

    /**
     * Current interaction state
     * 当前交互状态
     */
    private _currentState: UISelectableState = 'normal';

    /**
     * Current interpolated color (for smooth transitions)
     * 当前插值颜色（用于平滑过渡）
     */
    private _currentColor: number = 0xFFFFFF;

    /**
     * Target color for transition
     * 过渡的目标颜色
     */
    private _targetColor: number = 0xFFFFFF;

    /**
     * Transition progress (0-1)
     * 过渡进度 (0-1)
     */
    private _transitionProgress: number = 1;

    /**
     * Whether the pointer is over this element
     * 指针是否在此元素上
     */
    private _isPointerOver: boolean = false;

    /**
     * Whether this element is being pressed
     * 此元素是否正在被按下
     */
    private _isPressed: boolean = false;

    /**
     * Whether this element is selected (for navigation)
     * 此元素是否被选中（用于导航）
     */
    private _isSelected: boolean = false;

    /**
     * Get current interaction state
     * 获取当前交互状态
     */
    get currentState(): UISelectableState {
        return this._currentState;
    }

    /**
     * Get current display color (interpolated)
     * 获取当前显示颜色（插值后）
     */
    get currentColor(): number {
        return this._currentColor;
    }

    /**
     * Get the color for a specific state
     * 获取特定状态的颜色
     */
    getStateColor(state: UISelectableState): number {
        switch (state) {
            case 'normal': return this.normalColor;
            case 'highlighted': return this.highlightedColor;
            case 'pressed': return this.pressedColor;
            case 'selected': return this.selectedColor;
            case 'disabled': return this.disabledColor;
            default: return this.normalColor;
        }
    }

    /**
     * Get the sprite for a specific state
     * 获取特定状态的精灵
     */
    getStateSprite(state: UISelectableState): string | undefined {
        switch (state) {
            case 'highlighted': return this.sprites.highlightedSprite;
            case 'pressed': return this.sprites.pressedSprite;
            case 'selected': return this.sprites.selectedSprite;
            case 'disabled': return this.sprites.disabledSprite;
            default: return undefined;
        }
    }

    /**
     * Update interaction state based on input
     * 根据输入更新交互状态
     */
    updateState(): void {
        let newState: UISelectableState;

        if (!this.interactable) {
            newState = 'disabled';
        } else if (this._isPressed) {
            newState = 'pressed';
        } else if (this._isSelected) {
            newState = 'selected';
        } else if (this._isPointerOver) {
            newState = 'highlighted';
        } else {
            newState = 'normal';
        }

        if (newState !== this._currentState) {
            this._currentState = newState;
            this._targetColor = this.getStateColor(newState);
            this._transitionProgress = 0;
        }
    }

    /**
     * Update color transition
     * 更新颜色过渡
     *
     * @param deltaTime - Time since last update in seconds
     */
    updateTransition(deltaTime: number): void {
        if (this.transition !== 'colorTint' || this._transitionProgress >= 1) {
            this._currentColor = this._targetColor;
            return;
        }

        const duration = this.fadeDuration;
        if (duration <= 0) {
            this._currentColor = this._targetColor;
            this._transitionProgress = 1;
            return;
        }

        this._transitionProgress = Math.min(1, this._transitionProgress + deltaTime / duration);
        this._currentColor = this.lerpColor(
            this._currentColor,
            this._targetColor,
            this._transitionProgress
        );
    }

    /**
     * Set pointer over state
     * 设置指针悬停状态
     */
    setPointerOver(isOver: boolean): void {
        this._isPointerOver = isOver;
        this.updateState();
    }

    /**
     * Set pressed state
     * 设置按下状态
     */
    setPressed(isPressed: boolean): void {
        this._isPressed = isPressed;
        this.updateState();
    }

    /**
     * Set selected state
     * 设置选中状态
     */
    setSelected(isSelected: boolean): void {
        this._isSelected = isSelected;
        this.updateState();
    }

    /**
     * Check if pointer is over this element
     * 检查指针是否在此元素上
     */
    get isPointerOver(): boolean {
        return this._isPointerOver;
    }

    /**
     * Check if this element is pressed
     * 检查此元素是否被按下
     */
    get isPressed(): boolean {
        return this._isPressed;
    }

    /**
     * Check if this element is selected
     * 检查此元素是否被选中
     */
    get isSelected(): boolean {
        return this._isSelected;
    }

    /**
     * Linear interpolation between two colors
     * 两个颜色之间的线性插值
     */
    private lerpColor(from: number, to: number, t: number): number {
        const fromR = (from >> 16) & 0xFF;
        const fromG = (from >> 8) & 0xFF;
        const fromB = from & 0xFF;

        const toR = (to >> 16) & 0xFF;
        const toG = (to >> 8) & 0xFF;
        const toB = to & 0xFF;

        const r = Math.round(fromR + (toR - fromR) * t);
        const g = Math.round(fromG + (toG - fromG) * t);
        const b = Math.round(fromB + (toB - fromB) * t);

        return (r << 16) | (g << 8) | b;
    }

    /**
     * Reset to initial state
     * 重置到初始状态
     */
    reset(): void {
        this._currentState = 'normal';
        this._currentColor = this.normalColor;
        this._targetColor = this.normalColor;
        this._transitionProgress = 1;
        this._isPointerOver = false;
        this._isPressed = false;
        this._isSelected = false;
    }
}
