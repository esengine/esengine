import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';
import { getTextMeasureService, type TextMeasureFont } from '../../utils/TextMeasureService';

/**
 * 输入框类型
 * Input field content type
 */
export type UIInputContentType =
    | 'standard'      // 标准文本 | Standard text
    | 'integer'       // 整数 | Integer numbers only
    | 'decimal'       // 小数 | Decimal numbers
    | 'alphanumeric'  // 字母数字 | Letters and numbers only
    | 'name'          // 姓名 | Name (capitalized)
    | 'email'         // 邮箱 | Email address
    | 'password';     // 密码 | Password (hidden)

/**
 * 输入框行类型
 * Input field line type
 */
export type UIInputLineType =
    | 'singleLine'      // 单行，回车提交 | Single line, Enter submits
    | 'multiLine'       // 多行，回车换行 | Multi-line, Enter adds newline
    | 'multiLineSubmit'; // 多行，Shift+回车换行，回车提交 | Multi-line, Shift+Enter adds newline, Enter submits

/**
 * UI 输入框组件
 * UI Input Field Component - Text input for user entry
 *
 * @example
 * ```typescript
 * // Single-line text input
 * const input = entity.addComponent(new UIInputFieldComponent());
 * input.placeholder = 'Enter your name...';
 * input.onValueChanged = (value) => console.log('Value:', value);
 *
 * // Password input
 * const password = entity.addComponent(new UIInputFieldComponent());
 * password.contentType = 'password';
 * password.placeholder = 'Enter password...';
 *
 * // Multi-line input
 * const textarea = entity.addComponent(new UIInputFieldComponent());
 * textarea.lineType = 'multiLine';
 * textarea.maxLines = 5;
 * ```
 */
@ECSComponent('UIInputField')
@Serializable({ version: 1, typeId: 'UIInputField' })
export class UIInputFieldComponent extends Component {
    // ===== 内容配置 Content Configuration =====

    /**
     * 当前文本值
     * Current text value
     */
    @Serialize()
    @Property({ type: 'string', label: 'Text / 文本' })
    public text: string = '';

    /**
     * 占位符文本
     * Placeholder text shown when empty
     */
    @Serialize()
    @Property({ type: 'string', label: 'Placeholder / 占位符' })
    public placeholder: string = '';

    /**
     * 内容类型（影响输入验证和键盘类型）
     * Content type (affects input validation and keyboard type)
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Content Type / 内容类型',
        options: ['standard', 'integer', 'decimal', 'alphanumeric', 'name', 'email', 'password']
    })
    public contentType: UIInputContentType = 'standard';

    /**
     * 行类型（单行或多行）
     * Line type (single or multi-line)
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Line Type / 行类型',
        options: ['singleLine', 'multiLine', 'multiLineSubmit']
    })
    public lineType: UIInputLineType = 'singleLine';

    /**
     * 最大字符数（0 = 无限制）
     * Maximum character count (0 = unlimited)
     */
    @Serialize()
    @Property({ type: 'integer', label: 'Character Limit / 字符限制', min: 0 })
    public characterLimit: number = 0;

    /**
     * 多行模式下的最大行数
     * Maximum lines for multi-line mode
     */
    @Serialize()
    @Property({ type: 'integer', label: 'Max Lines / 最大行数', min: 1 })
    public maxLines: number = 1;

    // ===== 字体配置 Font Configuration =====

    /**
     * 字体大小
     * Font size in pixels
     */
    @Serialize()
    @Property({ type: 'number', label: 'Font Size / 字体大小', min: 8, max: 72 })
    public fontSize: number = 14;

    /**
     * 字体系列
     * Font family
     */
    @Serialize()
    @Property({ type: 'string', label: 'Font Family / 字体系列' })
    public fontFamily: string = 'Arial, sans-serif';

    /**
     * 字体粗细
     * Font weight
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Font Weight / 字体粗细',
        options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']
    })
    public fontWeight: string = 'normal';

    // ===== 外观配置 Appearance Configuration =====
    // 注意：背景和边框由 UIRender/UIGraphic 组件配置
    // Note: Background and border are configured via UIRender/UIGraphic component

    /**
     * 文本颜色
     * Text color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Text Color / 文本颜色' })
    public textColor: number = 0x000000;

    /**
     * 占位符文本颜色
     * Placeholder text color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Placeholder Color / 占位符颜色' })
    public placeholderColor: number = 0x808080;

    /**
     * 选中文本背景颜色
     * Selection highlight color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Selection Color / 选中颜色' })
    public selectionColor: number = 0x3399FF;

    /**
     * 光标颜色
     * Caret (cursor) color
     */
    @Serialize()
    @Property({ type: 'color', label: 'Caret Color / 光标颜色' })
    public caretColor: number = 0x000000;

    /**
     * 光标宽度
     * Caret width in pixels
     */
    @Serialize()
    @Property({ type: 'number', label: 'Caret Width / 光标宽度', min: 1, max: 10 })
    public caretWidth: number = 2;

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
     * Whether the input is disabled
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Disabled / 禁用' })
    public disabled: boolean = false;

    /**
     * 是否只读
     * Whether the input is read-only
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Read Only / 只读' })
    public readOnly: boolean = false;

    // ===== 运行时状态 Runtime State (not serialized) =====

    /**
     * 是否获得焦点
     * Whether the input has focus
     */
    public focused: boolean = false;

    /**
     * 是否悬停
     * Whether mouse is hovering
     */
    public hovered: boolean = false;

    /**
     * 光标位置（字符索引）
     * Caret position (character index)
     */
    public caretPosition: number = 0;

    /**
     * 选择起始位置
     * Selection start position
     */
    public selectionStart: number = 0;

    /**
     * 选择结束位置
     * Selection end position
     */
    public selectionEnd: number = 0;

    /**
     * 光标闪烁计时器
     * Caret blink timer
     */
    public caretBlinkTimer: number = 0;

    /**
     * 光标是否可见（闪烁状态）
     * Whether caret is visible (blink state)
     */
    public caretVisible: boolean = true;

    /**
     * 光标闪烁间隔（秒）
     * Caret blink interval in seconds
     */
    public caretBlinkRate: number = 0.53;

    /**
     * 滚动偏移（用于长文本）
     * Scroll offset for long text
     */
    public scrollOffset: number = 0;

    // ===== 回调 Callbacks =====

    /**
     * 值变化回调
     * Value changed callback
     */
    public onValueChanged?: (value: string) => void;

    /**
     * 提交回调（按回车键）
     * Submit callback (on Enter key)
     */
    public onSubmit?: (value: string) => void;

    /**
     * 获得焦点回调
     * Focus callback
     */
    public onFocus?: () => void;

    /**
     * 失去焦点回调
     * Blur callback
     */
    public onBlur?: () => void;

    /**
     * 选择变化回调
     * Selection changed callback
     */
    public onSelectionChanged?: (start: number, end: number) => void;

    // ===== 方法 Methods =====

    /**
     * 设置文本值并触发回调
     * Set text value and trigger callback
     */
    public setValue(value: string): void {
        // 应用字符限制
        // Apply character limit
        if (this.characterLimit > 0 && value.length > this.characterLimit) {
            value = value.substring(0, this.characterLimit);
        }

        // 应用内容类型验证
        // Apply content type validation
        value = this.validateContent(value);

        if (this.text !== value) {
            this.text = value;
            this.onValueChanged?.(value);
        }

        // 确保光标位置有效
        // Ensure caret position is valid
        this.caretPosition = Math.min(this.caretPosition, this.text.length);
        this.selectionStart = Math.min(this.selectionStart, this.text.length);
        this.selectionEnd = Math.min(this.selectionEnd, this.text.length);
    }

    /**
     * 插入文本到光标位置
     * Insert text at caret position
     */
    public insertText(text: string): void {
        if (this.readOnly || this.disabled) return;

        // 删除选中文本
        // Delete selected text
        this.deleteSelection();

        // 插入新文本
        // Insert new text
        const before = this.text.substring(0, this.caretPosition);
        const after = this.text.substring(this.caretPosition);
        const newText = before + text + after;

        this.setValue(newText);
        this.caretPosition += text.length;
        this.selectionStart = this.caretPosition;
        this.selectionEnd = this.caretPosition;
        this.resetCaretBlink();
    }

    /**
     * 删除选中的文本
     * Delete selected text
     */
    public deleteSelection(): void {
        if (this.selectionStart === this.selectionEnd) return;

        const start = Math.min(this.selectionStart, this.selectionEnd);
        const end = Math.max(this.selectionStart, this.selectionEnd);

        const before = this.text.substring(0, start);
        const after = this.text.substring(end);

        this.setValue(before + after);
        this.caretPosition = start;
        this.selectionStart = start;
        this.selectionEnd = start;
    }

    /**
     * 删除光标前的字符
     * Delete character before caret (backspace)
     */
    public deleteBackward(): void {
        if (this.readOnly || this.disabled) return;

        if (this.hasSelection()) {
            this.deleteSelection();
        } else if (this.caretPosition > 0) {
            const before = this.text.substring(0, this.caretPosition - 1);
            const after = this.text.substring(this.caretPosition);
            this.setValue(before + after);
            this.caretPosition--;
            this.selectionStart = this.caretPosition;
            this.selectionEnd = this.caretPosition;
        }
        this.resetCaretBlink();
    }

    /**
     * 删除光标后的字符
     * Delete character after caret (delete)
     */
    public deleteForward(): void {
        if (this.readOnly || this.disabled) return;

        if (this.hasSelection()) {
            this.deleteSelection();
        } else if (this.caretPosition < this.text.length) {
            const before = this.text.substring(0, this.caretPosition);
            const after = this.text.substring(this.caretPosition + 1);
            this.setValue(before + after);
        }
        this.resetCaretBlink();
    }

    /**
     * 移动光标
     * Move caret
     */
    public moveCaret(position: number, extendSelection: boolean = false): void {
        position = Math.max(0, Math.min(position, this.text.length));

        if (extendSelection) {
            this.selectionEnd = position;
        } else {
            this.selectionStart = position;
            this.selectionEnd = position;
        }

        this.caretPosition = position;
        this.resetCaretBlink();
        this.onSelectionChanged?.(this.selectionStart, this.selectionEnd);
    }

    /**
     * 选择全部文本
     * Select all text
     */
    public selectAll(): void {
        this.selectionStart = 0;
        this.selectionEnd = this.text.length;
        this.caretPosition = this.text.length;
        this.onSelectionChanged?.(this.selectionStart, this.selectionEnd);
    }

    /**
     * 清除选择
     * Clear selection
     */
    public clearSelection(): void {
        this.selectionStart = this.caretPosition;
        this.selectionEnd = this.caretPosition;
    }

    /**
     * 是否有选中文本
     * Whether there is selected text
     */
    public hasSelection(): boolean {
        return this.selectionStart !== this.selectionEnd;
    }

    /**
     * 获取选中的文本
     * Get selected text
     */
    public getSelectedText(): string {
        if (!this.hasSelection()) return '';
        const start = Math.min(this.selectionStart, this.selectionEnd);
        const end = Math.max(this.selectionStart, this.selectionEnd);
        return this.text.substring(start, end);
    }

    /**
     * 重置光标闪烁
     * Reset caret blink
     */
    public resetCaretBlink(): void {
        this.caretBlinkTimer = 0;
        this.caretVisible = true;
    }

    /**
     * 更新光标闪烁
     * Update caret blink
     */
    public updateCaretBlink(deltaTime: number): void {
        if (!this.focused) return;

        this.caretBlinkTimer += deltaTime;
        if (this.caretBlinkTimer >= this.caretBlinkRate) {
            this.caretBlinkTimer = 0;
            this.caretVisible = !this.caretVisible;
        }
    }

    /**
     * 获取显示文本（密码模式显示圆点）
     * Get display text (dots for password mode)
     */
    public getDisplayText(): string {
        if (this.text.length === 0) return '';
        if (this.contentType === 'password') {
            return '•'.repeat(this.text.length);
        }
        return this.text;
    }

    /**
     * 验证单个字符是否可以输入
     * Validate if a single character can be input
     */
    public validateInput(char: string): boolean {
        switch (this.contentType) {
            case 'integer':
                return /^[0-9-]$/.test(char);
            case 'decimal':
                return /^[0-9.-]$/.test(char);
            case 'alphanumeric':
                return /^[a-zA-Z0-9]$/.test(char);
            default:
                return true;
        }
    }

    /**
     * 验证内容类型
     * Validate content based on content type
     */
    private validateContent(value: string): string {
        switch (this.contentType) {
            case 'integer':
                return value.replace(/[^0-9-]/g, '');
            case 'decimal':
                return value.replace(/[^0-9.-]/g, '');
            case 'alphanumeric':
                return value.replace(/[^a-zA-Z0-9]/g, '');
            case 'name':
                // 首字母大写
                // Capitalize first letter of each word
                return value.replace(/\b\w/g, char => char.toUpperCase());
            case 'email':
                return value.toLowerCase();
            default:
                return value;
        }
    }

    // ===== 文本测量方法 Text Measurement Methods =====

    /**
     * 获取字体配置
     * Get font configuration for text measurement
     */
    public getFontConfig(): TextMeasureFont {
        return {
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            fontWeight: this.fontWeight
        };
    }

    /**
     * 获取 CSS 字体字符串
     * Get CSS font string
     */
    public getCSSFont(): string {
        return `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
    }

    /**
     * 测量显示文本的宽度
     * Measure display text width
     */
    public measureDisplayTextWidth(): number {
        const service = getTextMeasureService();
        return service.measureText(this.getDisplayText(), this.getFontConfig());
    }

    /**
     * 获取光标的 X 位置
     * Get caret X position
     */
    public getCaretX(): number {
        const service = getTextMeasureService();
        const displayText = this.getDisplayText();
        return service.getXForCharIndex(displayText, this.getFontConfig(), this.caretPosition);
    }

    /**
     * 获取选择区域的 X 范围
     * Get selection X range
     */
    public getSelectionXRange(): { startX: number; endX: number; width: number } {
        const service = getTextMeasureService();
        const font = this.getFontConfig();
        const displayText = this.getDisplayText();

        const start = Math.min(this.selectionStart, this.selectionEnd);
        const end = Math.max(this.selectionStart, this.selectionEnd);

        const startX = service.getXForCharIndex(displayText, font, start);
        const endX = service.getXForCharIndex(displayText, font, end);

        return {
            startX,
            endX,
            width: endX - startX
        };
    }

    /**
     * 根据 X 位置获取字符索引
     * Get character index at X position
     *
     * @param x - X position relative to text area start | 相对于文本区域开始的 X 位置
     */
    public getCharIndexAtX(x: number): number {
        const service = getTextMeasureService();
        const displayText = this.getDisplayText();
        return service.getCharIndexAtX(displayText, this.getFontConfig(), x + this.scrollOffset);
    }

    /**
     * 获取当前行的高度
     * Get line height
     */
    public getLineHeight(): number {
        return this.fontSize * 1.2; // 默认行高系数 | Default line height factor
    }

    /**
     * 获取文本行信息（多行模式）
     * Get text line info (multi-line mode)
     */
    public getLineInfo() {
        const service = getTextMeasureService();
        return service.getLineInfo(this.getDisplayText(), this.getFontConfig());
    }

    /**
     * 获取光标所在行索引
     * Get line index for caret
     */
    public getCaretLineIndex(): number {
        const service = getTextMeasureService();
        return service.getLineIndexForChar(this.text, this.caretPosition);
    }

    /**
     * 获取光标在当前行的列位置
     * Get column position of caret in current line
     */
    public getCaretColumn(): number {
        const service = getTextMeasureService();
        return service.getColumnForChar(this.text, this.caretPosition);
    }

    /**
     * 移动光标到指定行和列
     * Move caret to specified line and column
     */
    public moveCaretToLineColumn(lineIndex: number, column: number): void {
        const service = getTextMeasureService();
        const newPosition = service.getCharIndexForLineColumn(this.text, lineIndex, column);
        this.caretPosition = newPosition;
        this.resetCaretBlink();
    }

    /**
     * 更新滚动偏移以确保光标可见
     * Update scroll offset to ensure caret is visible
     *
     * @param visibleWidth - Visible text area width | 可见文本区域宽度
     */
    public ensureCaretVisible(visibleWidth: number): void {
        const caretX = this.getCaretX();

        // 如果光标在可见区域左边
        // If caret is to the left of visible area
        if (caretX < this.scrollOffset) {
            this.scrollOffset = Math.max(0, caretX - 10);
        }

        // 如果光标在可见区域右边
        // If caret is to the right of visible area
        if (caretX > this.scrollOffset + visibleWidth) {
            this.scrollOffset = caretX - visibleWidth + 10;
        }
    }
}
