import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';

/**
 * 下拉选项
 * Dropdown option item
 */
export interface UIDropdownOption {
    /** 显示文本 | Display text */
    label: string;
    /** 选项值 | Option value */
    value: string | number;
    /** 是否禁用 | Whether disabled */
    disabled?: boolean;
    /** 图标 GUID（可选）| Icon GUID (optional) */
    iconGuid?: string;
}

/**
 * UI 下拉菜单组件
 * UI Dropdown Component - Selection from a list of options
 *
 * @example
 * ```typescript
 * const dropdown = entity.addComponent(new UIDropdownComponent());
 * dropdown.options = [
 *     { label: 'Option 1', value: 1 },
 *     { label: 'Option 2', value: 2 },
 *     { label: 'Option 3', value: 3 }
 * ];
 * dropdown.selectedIndex = 0;
 * dropdown.onValueChanged = (value, index) => {
 *     console.log('Selected:', value, 'at index:', index);
 * };
 * ```
 */
@ECSComponent('UIDropdown')
@Serializable({ version: 1, typeId: 'UIDropdown' })
export class UIDropdownComponent extends Component {
    // ===== 选项配置 Options Configuration =====

    /**
     * 下拉选项列表
     * List of dropdown options
     */
    public options: UIDropdownOption[] = [];

    /**
     * 当前选中的索引
     * Currently selected index
     */
    @Serialize()
    @Property({ type: 'integer', label: 'Selected Index / 选中索引', min: -1 })
    public selectedIndex: number = -1;

    /**
     * 占位符文本（未选中时显示）
     * Placeholder text shown when nothing is selected
     */
    @Serialize()
    @Property({ type: 'string', label: 'Placeholder / 占位符' })
    public placeholder: string = 'Select...';

    // ===== 外观配置 Appearance Configuration =====

    /**
     * 按钮背景颜色
     * Button background color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Button Color / 按钮颜色' })
    public buttonColor: number = 0xFFFFFF;

    /**
     * 按钮悬停颜色
     * Button hover color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Hover Color / 悬停颜色' })
    public hoverColor: number = 0xF0F0F0;

    /**
     * 按钮按下颜色
     * Button pressed color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Pressed Color / 按下颜色' })
    public pressedColor: number = 0xE0E0E0;

    /**
     * 禁用时的颜色
     * Disabled color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Disabled Color / 禁用颜色' })
    public disabledColor: number = 0xCCCCCC;

    /**
     * 文本颜色
     * Text color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Text Color / 文本颜色' })
    public textColor: number = 0x333333;

    /**
     * 占位符文本颜色
     * Placeholder text color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Placeholder Color / 占位符颜色' })
    public placeholderColor: number = 0x999999;

    /**
     * 边框颜色
     * Border color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Border Color / 边框颜色' })
    public borderColor: number = 0xCCCCCC;

    /**
     * 边框宽度
     * Border width in pixels
     */
    @Serialize()
    @Property({ type: 'number', label: 'Border Width / 边框宽度', min: 0, max: 10, step: 1 })
    public borderWidth: number = 1;

    /**
     * 下拉箭头颜色
     * Arrow color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Arrow Color / 箭头颜色' })
    public arrowColor: number = 0x666666;

    /**
     * 下拉列表背景颜色
     * Dropdown list background color
     */
    @Serialize()
    @Property({ type: 'color', label: 'List Background / 列表背景' })
    public listBackgroundColor: number = 0xFFFFFF;

    /**
     * 选项悬停颜色
     * Option hover color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Option Hover / 选项悬停' })
    public optionHoverColor: number = 0xE8F0FE;

    /**
     * 选中选项颜色
     * Selected option color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Selected Option / 选中选项' })
    public selectedOptionColor: number = 0xD0E0FF;

    /**
     * 选项高度
     * Option item height
     */
    @Serialize()
    @Property({ type: 'number', label: 'Option Height / 选项高度', min: 20, max: 100 })
    public optionHeight: number = 32;

    /**
     * 最大显示选项数（超出时显示滚动条）
     * Max visible options (scrollbar shown if exceeded)
     */
    @Serialize()
    @Property({ type: 'integer', label: 'Max Visible Options / 最大可见选项', min: 1, max: 20 })
    public maxVisibleOptions: number = 5;

    /**
     * 内边距
     * Padding in pixels
     */
    @Serialize()
    @Property({ type: 'number', label: 'Padding / 内边距', min: 0 })
    public padding: number = 8;

    // ===== 状态 State =====

    /**
     * 是否禁用
     * Whether the dropdown is disabled
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Disabled / 禁用' })
    public disabled: boolean = false;

    // ===== 运行时状态 Runtime State (not serialized) =====

    /**
     * 下拉列表是否展开
     * Whether dropdown list is expanded
     */
    public isOpen: boolean = false;

    /**
     * 是否悬停在按钮上
     * Whether mouse is hovering over button
     */
    public hovered: boolean = false;

    /**
     * 是否按下
     * Whether button is pressed
     */
    public pressed: boolean = false;

    /**
     * 当前悬停的选项索引
     * Currently hovered option index
     */
    public hoveredOptionIndex: number = -1;

    /**
     * 列表滚动偏移
     * List scroll offset
     */
    public scrollOffset: number = 0;

    /**
     * 当前显示颜色（用于动画）
     * Current display color (for animation)
     */
    public currentColor: number = 0xFFFFFF;

    /**
     * 目标颜色
     * Target color
     */
    public targetColor: number = 0xFFFFFF;

    /**
     * 颜色过渡时长
     * Color transition duration
     */
    @Serialize()
    @Property({ type: 'number', label: 'Transition Duration / 过渡时长', min: 0, step: 0.01 })
    public transitionDuration: number = 0.1;

    // ===== 回调 Callbacks =====

    /**
     * 值变化回调
     * Value changed callback
     */
    public onValueChanged?: (value: string | number, index: number) => void;

    /**
     * 下拉列表打开回调
     * Dropdown opened callback
     */
    public onOpen?: () => void;

    /**
     * 下拉列表关闭回调
     * Dropdown closed callback
     */
    public onClose?: () => void;

    // ===== 方法 Methods =====

    /**
     * 获取当前选中的选项
     * Get currently selected option
     */
    public getSelectedOption(): UIDropdownOption | undefined {
        if (this.selectedIndex >= 0 && this.selectedIndex < this.options.length) {
            return this.options[this.selectedIndex];
        }
        return undefined;
    }

    /**
     * 获取当前选中的值
     * Get currently selected value
     */
    public getSelectedValue(): string | number | undefined {
        return this.getSelectedOption()?.value;
    }

    /**
     * 获取当前显示文本
     * Get current display text
     */
    public getDisplayText(): string {
        const option = this.getSelectedOption();
        return option?.label ?? this.placeholder;
    }

    /**
     * 设置选中索引
     * Set selected index
     */
    public setSelectedIndex(index: number): void {
        if (index === this.selectedIndex) return;
        if (index < -1 || index >= this.options.length) return;

        const option = this.options[index];
        if (option?.disabled) return;

        this.selectedIndex = index;
        this.onValueChanged?.(option?.value ?? '', index);
    }

    /**
     * 根据值设置选中项
     * Set selected by value
     */
    public setSelectedValue(value: string | number): void {
        const index = this.options.findIndex(opt => opt.value === value);
        if (index >= 0) {
            this.setSelectedIndex(index);
        }
    }

    /**
     * 添加选项
     * Add option
     */
    public addOption(label: string, value: string | number, disabled: boolean = false): void {
        this.options.push({ label, value, disabled });
    }

    /**
     * 移除选项
     * Remove option by index
     */
    public removeOption(index: number): void {
        if (index < 0 || index >= this.options.length) return;
        this.options.splice(index, 1);

        // 调整选中索引
        // Adjust selected index
        if (this.selectedIndex === index) {
            this.selectedIndex = -1;
        } else if (this.selectedIndex > index) {
            this.selectedIndex--;
        }
    }

    /**
     * 清除所有选项
     * Clear all options
     */
    public clearOptions(): void {
        this.options = [];
        this.selectedIndex = -1;
    }

    /**
     * 打开下拉列表
     * Open dropdown list
     */
    public open(): void {
        if (this.disabled || this.isOpen) return;
        this.isOpen = true;
        this.hoveredOptionIndex = this.selectedIndex;
        this.onOpen?.();
    }

    /**
     * 关闭下拉列表
     * Close dropdown list
     */
    public close(): void {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.hoveredOptionIndex = -1;
        this.onClose?.();
    }

    /**
     * 切换下拉列表
     * Toggle dropdown list
     */
    public toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * 获取当前背景颜色
     * Get current background color based on state
     */
    public getCurrentBackgroundColor(): number {
        if (this.disabled) return this.disabledColor;
        if (this.pressed || this.isOpen) return this.pressedColor;
        if (this.hovered) return this.hoverColor;
        return this.buttonColor;
    }

    /**
     * 获取下拉列表高度
     * Get dropdown list height
     */
    public getListHeight(): number {
        const visibleCount = Math.min(this.options.length, this.maxVisibleOptions);
        return visibleCount * this.optionHeight;
    }

    /**
     * 是否需要滚动条
     * Whether scrollbar is needed
     */
    public needsScrollbar(): boolean {
        return this.options.length > this.maxVisibleOptions;
    }

    /**
     * 获取最大滚动偏移
     * Get maximum scroll offset
     */
    public getMaxScrollOffset(): number {
        const totalHeight = this.options.length * this.optionHeight;
        const visibleHeight = this.getListHeight();
        return Math.max(0, totalHeight - visibleHeight);
    }
}
