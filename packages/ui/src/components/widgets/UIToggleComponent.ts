import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';
import { lerpColor } from '../../systems/render/UIRenderUtils';

/**
 * Toggle 显示样式
 * Toggle display style
 */
export type UIToggleStyle = 'checkbox' | 'switch' | 'custom';

/**
 * UI Toggle 组件
 * UI Toggle Component - Checkbox/Switch for boolean values
 *
 * @example
 * ```typescript
 * // Checkbox style
 * const toggle = entity.addComponent(UIToggleComponent);
 * toggle.isOn = true;
 * toggle.onChange = (value) => console.log('Toggle:', value);
 *
 * // Switch style
 * toggle.style = 'switch';
 * toggle.switchWidth = 50;
 * toggle.switchHeight = 26;
 * ```
 */
@ECSComponent('UIToggle')
@Serializable({ version: 1, typeId: 'UIToggle' })
export class UIToggleComponent extends Component {
    // ===== 状态 State =====

    /**
     * 当前开关状态
     * Current toggle state
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Is On' })
    public isOn: boolean = false;

    /**
     * 是否禁用
     * Whether toggle is disabled
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Disabled' })
    public disabled: boolean = false;

    // ===== 显示样式 Display Style =====

    /**
     * 显示样式：复选框、开关、自定义
     * Display style: checkbox, switch, or custom
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Style',
        options: ['checkbox', 'switch', 'custom']
    })
    public style: UIToggleStyle = 'checkbox';

    // ===== Checkbox 样式配置 =====

    /**
     * 复选框大小
     * Checkbox size
     */
    @Serialize()
    @Property({ type: 'number', label: 'Checkbox Size', min: 8 })
    public checkboxSize: number = 20;

    /**
     * 复选框边框宽度
     * Checkbox border width
     */
    @Serialize()
    @Property({ type: 'number', label: 'Border Width', min: 0 })
    public borderWidth: number = 2;

    /**
     * 复选框圆角
     * Checkbox corner radius
     */
    @Serialize()
    @Property({ type: 'number', label: 'Corner Radius', min: 0 })
    public cornerRadius: number = 4;

    /**
     * 勾选标记大小比例（相对于复选框）
     * Checkmark size ratio (relative to checkbox)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Checkmark Ratio', min: 0.3, max: 1, step: 0.1 })
    public checkmarkRatio: number = 0.6;

    // ===== Switch 样式配置 =====

    /**
     * 开关宽度
     * Switch width
     */
    @Serialize()
    @Property({ type: 'number', label: 'Switch Width', min: 20 })
    public switchWidth: number = 44;

    /**
     * 开关高度
     * Switch height
     */
    @Serialize()
    @Property({ type: 'number', label: 'Switch Height', min: 12 })
    public switchHeight: number = 24;

    /**
     * 开关滑块边距
     * Switch knob padding
     */
    @Serialize()
    @Property({ type: 'number', label: 'Knob Padding', min: 0 })
    public knobPadding: number = 2;

    // ===== 颜色配置 Color Configuration =====

    /**
     * 关闭状态背景颜色
     * Off state background color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Off Color' })
    public offColor: number = 0xCCCCCC;

    /**
     * 开启状态背景颜色
     * On state background color
     */
    @Serialize()
    @Property({ type: 'color', label: 'On Color' })
    public onColor: number = 0x4CD964;

    /**
     * 悬停颜色偏移（叠加）
     * Hover color tint
     */
    @Serialize()
    @Property({ type: 'color', label: 'Hover Tint' })
    public hoverTint: number = 0xFFFFFF;

    /**
     * 按下颜色偏移
     * Pressed color tint
     */
    @Serialize()
    @Property({ type: 'color', label: 'Pressed Tint' })
    public pressedTint: number = 0xDDDDDD;

    /**
     * 禁用状态颜色
     * Disabled state color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Disabled Color' })
    public disabledColor: number = 0xEEEEEE;

    /**
     * 边框颜色
     * Border color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Border Color' })
    public borderColor: number = 0x999999;

    /**
     * 勾选标记/滑块颜色
     * Checkmark/Knob color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Mark Color' })
    public markColor: number = 0xFFFFFF;

    /**
     * 背景透明度
     * Background alpha
     */
    @Serialize()
    @Property({ type: 'number', label: 'Alpha', min: 0, max: 1, step: 0.1 })
    public alpha: number = 1;

    // ===== 纹理配置 Texture Configuration =====

    /**
     * 关闭状态纹理 GUID
     * Off state texture GUID
     */
    @Serialize()
    @Property({ type: 'asset', label: 'Off Texture', assetType: 'texture' })
    public offTextureGuid: string = '';

    /**
     * 开启状态纹理 GUID
     * On state texture GUID
     */
    @Serialize()
    @Property({ type: 'asset', label: 'On Texture', assetType: 'texture' })
    public onTextureGuid: string = '';

    /**
     * 勾选标记纹理 GUID
     * Checkmark texture GUID
     */
    @Serialize()
    @Property({ type: 'asset', label: 'Checkmark Texture', assetType: 'texture' })
    public checkmarkTextureGuid: string = '';

    // ===== 动画配置 Animation Configuration =====

    /**
     * 过渡时长（秒）
     * Transition duration in seconds
     */
    @Serialize()
    @Property({ type: 'number', label: 'Transition Duration', min: 0, step: 0.01 })
    public transitionDuration: number = 0.15;

    // ===== 运行时状态 Runtime State =====

    /**
     * 当前显示进度（0=关闭，1=开启，用于动画）
     * Current display progress (0=off, 1=on, for animation)
     */
    public displayProgress: number = 0;

    /**
     * 目标进度
     * Target progress
     */
    public targetProgress: number = 0;

    /**
     * 是否悬停
     * Whether hovered
     */
    public hovered: boolean = false;

    /**
     * 是否按下
     * Whether pressed
     */
    public pressed: boolean = false;

    // ===== 回调 Callbacks =====

    /**
     * 值改变回调
     * Value change callback
     */
    public onChange?: (isOn: boolean) => void;

    // ===== 方法 Methods =====

    /**
     * 切换状态
     * Toggle state
     */
    public toggle(): void {
        if (this.disabled) return;
        this.setOn(!this.isOn);
    }

    /**
     * 设置开关状态
     * Set toggle state
     *
     * @param value - New state | 新状态
     * @param animate - Whether to animate transition | 是否动画过渡
     */
    public setOn(value: boolean, animate: boolean = true): void {
        if (this.isOn === value) return;
        this.isOn = value;
        this.targetProgress = value ? 1 : 0;
        if (!animate) {
            this.displayProgress = this.targetProgress;
        }
        this.onChange?.(value);
    }

    /**
     * 获取当前背景颜色
     * Get current background color based on state
     */
    public getCurrentBackgroundColor(): number {
        if (this.disabled) return this.disabledColor;

        // 基础颜色：根据开关状态插值
        const baseColor = this.isOn ? this.onColor : this.offColor;

        // 如果有悬停或按下状态，可以应用色调
        // 这里简化处理，直接返回基础颜色
        if (this.pressed) return lerpColor(baseColor, this.pressedTint, 0.2);
        if (this.hovered) return lerpColor(baseColor, this.hoverTint, 0.1);

        return baseColor;
    }

    /**
     * 获取当前纹理 GUID
     * Get current texture GUID based on state
     */
    public getCurrentTextureGuid(): string {
        return this.isOn ? this.onTextureGuid : this.offTextureGuid;
    }

    /**
     * 是否使用纹理渲染
     * Whether to use texture rendering
     */
    public useTexture(): boolean {
        return !!(this.offTextureGuid || this.onTextureGuid);
    }

    /**
     * 计算滑块位置（Switch 样式）
     * Calculate knob position for switch style
     *
     * @returns Normalized position 0-1 | 归一化位置
     */
    public getKnobPosition(): number {
        return this.displayProgress;
    }

    /**
     * 计算滑块尺寸（Switch 样式）
     * Calculate knob size for switch style
     */
    public getKnobSize(): number {
        return this.switchHeight - this.knobPadding * 2;
    }
}
