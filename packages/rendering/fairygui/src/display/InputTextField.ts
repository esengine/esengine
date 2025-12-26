import { TextField } from './TextField';

/**
 * InputTextField
 *
 * Editable text input display object.
 * Creates and manages a hidden HTML input element for text editing.
 *
 * 可编辑文本输入显示对象
 * 创建并管理隐藏的 HTML input 元素用于文本编辑
 */
export class InputTextField extends TextField {
    private _inputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
    private _password: boolean = false;
    private _keyboardType: string = 'text';
    private _editable: boolean = true;
    private _maxLength: number = 0;
    private _promptText: string = '';
    private _promptColor: string = '#999999';
    private _restrict: string = '';
    private _multiline: boolean = false;
    private _hasFocus: boolean = false;

    constructor() {
        super();
        this.touchable = true;
    }

    /**
     * Get/set password mode
     * 获取/设置密码模式
     */
    public get password(): boolean {
        return this._password;
    }

    public set password(value: boolean) {
        if (this._password !== value) {
            this._password = value;
            this.updateInputType();
        }
    }

    /**
     * Get/set keyboard type
     * 获取/设置键盘类型
     */
    public get keyboardType(): string {
        return this._keyboardType;
    }

    public set keyboardType(value: string) {
        if (this._keyboardType !== value) {
            this._keyboardType = value;
            this.updateInputType();
        }
    }

    /**
     * Get/set editable state
     * 获取/设置可编辑状态
     */
    public get editable(): boolean {
        return this._editable;
    }

    public set editable(value: boolean) {
        this._editable = value;
        if (this._inputElement) {
            if (value) {
                this._inputElement.removeAttribute('readonly');
            } else {
                this._inputElement.setAttribute('readonly', 'true');
            }
        }
    }

    /**
     * Get/set max length
     * 获取/设置最大长度
     */
    public get maxLength(): number {
        return this._maxLength;
    }

    public set maxLength(value: number) {
        this._maxLength = value;
        if (this._inputElement && value > 0) {
            this._inputElement.maxLength = value;
        }
    }

    /**
     * Get/set placeholder text
     * 获取/设置占位符文本
     */
    public get promptText(): string {
        return this._promptText;
    }

    public set promptText(value: string) {
        this._promptText = value;
        if (this._inputElement) {
            this._inputElement.placeholder = value;
        }
    }

    /**
     * Get/set placeholder color
     * 获取/设置占位符颜色
     */
    public get promptColor(): string {
        return this._promptColor;
    }

    public set promptColor(value: string) {
        this._promptColor = value;
        // Apply via CSS
    }

    /**
     * Get/set character restriction pattern
     * 获取/设置字符限制模式
     */
    public get restrict(): string {
        return this._restrict;
    }

    public set restrict(value: string) {
        this._restrict = value;
        if (this._inputElement && value && this._inputElement instanceof HTMLInputElement) {
            this._inputElement.pattern = value;
        }
    }

    /**
     * Get/set multiline mode
     * 获取/设置多行模式
     */
    public get multiline(): boolean {
        return this._multiline;
    }

    public set multiline(value: boolean) {
        if (this._multiline !== value) {
            this._multiline = value;
            this.recreateInputElement();
        }
    }

    /**
     * Request focus
     * 请求焦点
     */
    public focus(): void {
        this.ensureInputElement();
        if (this._inputElement) {
            this._inputElement.focus();
            this._hasFocus = true;
        }
    }

    /**
     * Clear focus
     * 清除焦点
     */
    public blur(): void {
        if (this._inputElement) {
            this._inputElement.blur();
            this._hasFocus = false;
        }
    }

    /**
     * Select all text
     * 选择所有文本
     */
    public selectAll(): void {
        if (this._inputElement) {
            this._inputElement.select();
        }
    }

    /**
     * Set selection range
     * 设置选择范围
     */
    public setSelection(start: number, end: number): void {
        if (this._inputElement) {
            this._inputElement.setSelectionRange(start, end);
        }
    }

    /**
     * Get text from input
     * 从输入获取文本
     */
    public getInputText(): string {
        if (this._inputElement) {
            return this._inputElement.value;
        }
        return this.text;
    }

    /**
     * Set text to input
     * 设置文本到输入
     */
    public setInputText(value: string): void {
        this.text = value;
        if (this._inputElement) {
            this._inputElement.value = value;
        }
    }

    private ensureInputElement(): void {
        if (!this._inputElement) {
            this.createInputElement();
        }
    }

    private createInputElement(): void {
        if (this._multiline) {
            this._inputElement = document.createElement('textarea');
        } else {
            this._inputElement = document.createElement('input');
            this.updateInputType();
        }

        this.applyInputStyles();
        this.bindInputEvents();

        document.body.appendChild(this._inputElement);
    }

    private recreateInputElement(): void {
        const oldValue = this._inputElement?.value || '';
        this.destroyInputElement();
        this.createInputElement();
        if (this._inputElement) {
            this._inputElement.value = oldValue;
        }
    }

    private destroyInputElement(): void {
        if (this._inputElement) {
            this._inputElement.remove();
            this._inputElement = null;
        }
    }

    private updateInputType(): void {
        if (this._inputElement && this._inputElement instanceof HTMLInputElement) {
            if (this._password) {
                this._inputElement.type = 'password';
            } else {
                this._inputElement.type = this._keyboardType;
            }
        }
    }

    private applyInputStyles(): void {
        if (!this._inputElement) return;

        const style = this._inputElement.style;
        style.position = 'absolute';
        style.border = 'none';
        style.outline = 'none';
        style.background = 'transparent';
        style.padding = '0';
        style.margin = '0';
        style.fontFamily = this.font || 'sans-serif';
        style.fontSize = `${this.fontSize}px`;
        style.color = this.color;
        style.opacity = '0'; // Hidden initially, shown when focused

        if (this._maxLength > 0) {
            this._inputElement.maxLength = this._maxLength;
        }
        if (this._promptText) {
            this._inputElement.placeholder = this._promptText;
        }
        if (this._restrict && this._inputElement instanceof HTMLInputElement) {
            this._inputElement.pattern = this._restrict;
        }
        if (!this._editable) {
            this._inputElement.setAttribute('readonly', 'true');
        }

        this._inputElement.value = this.text;
    }

    private bindInputEvents(): void {
        if (!this._inputElement) return;

        this._inputElement.addEventListener('input', () => {
            this.text = this._inputElement?.value || '';
            this.emit('input');
        });

        this._inputElement.addEventListener('focus', () => {
            this._hasFocus = true;
            if (this._inputElement) {
                this._inputElement.style.opacity = '1';
            }
            this.emit('focus');
        });

        this._inputElement.addEventListener('blur', () => {
            this._hasFocus = false;
            if (this._inputElement) {
                this._inputElement.style.opacity = '0';
            }
            this.emit('blur');
        });

        this._inputElement.addEventListener('keydown', (e: Event) => {
            if ((e as KeyboardEvent).key === 'Enter' && !this._multiline) {
                this.emit('submit');
            }
        });
    }

    /**
     * Update input element position based on display object position
     * 根据显示对象位置更新输入元素位置
     */
    public updateInputPosition(globalX: number, globalY: number): void {
        if (this._inputElement) {
            this._inputElement.style.left = `${globalX}px`;
            this._inputElement.style.top = `${globalY}px`;
            this._inputElement.style.width = `${this.width}px`;
            this._inputElement.style.height = `${this.height}px`;
        }
    }

    public dispose(): void {
        this.destroyInputElement();
        super.dispose();
    }
}
