import { GTextField } from './GTextField';
import { InputTextField } from '../display/InputTextField';
import { FGUIEvents } from '../events/Events';
import type { ByteBuffer } from '../utils/ByteBuffer';

/**
 * Keyboard type constants
 * 键盘类型常量
 */
export const enum EKeyboardType {
    Default = 'text',
    Number = 'number',
    Url = 'url',
    Email = 'email',
    Tel = 'tel',
    Password = 'password'
}

/**
 * GTextInput
 *
 * Editable text input component.
 *
 * 可编辑的文本输入组件
 *
 * Features:
 * - Text input with IME support
 * - Password mode
 * - Character restriction
 * - Max length
 * - Placeholder text
 */
export class GTextInput extends GTextField {
    protected declare _displayObject: InputTextField;

    constructor() {
        super();
    }

    protected createDisplayObject(): void {
        const inputField = new InputTextField();
        // Set both _displayObject and _textField since parent class uses _textField for color etc.
        this._displayObject = inputField;
        this._textField = inputField;
        this._displayObject.gOwner = this;

        // Forward events
        inputField.on('input', () => {
            this.emit(FGUIEvents.TEXT_CHANGED);
        });
        inputField.on('submit', () => {
            this.emit(FGUIEvents.TEXT_SUBMIT);
        });
    }

    /**
     * Get native input element
     * 获取原生输入元素
     */
    public get nativeInput(): InputTextField {
        return this._displayObject;
    }

    /**
     * Get/set password mode
     * 获取/设置密码模式
     */
    public get password(): boolean {
        return this._displayObject.password;
    }

    public set password(value: boolean) {
        if (this._displayObject) {
            this._displayObject.password = value;
        }
    }

    /**
     * Get/set keyboard type
     * 获取/设置键盘类型
     */
    public get keyboardType(): string {
        return this._displayObject.keyboardType;
    }

    public set keyboardType(value: string) {
        if (this._displayObject) {
            this._displayObject.keyboardType = value;
        }
    }

    /**
     * Get/set editable state
     * 获取/设置可编辑状态
     */
    public get editable(): boolean {
        return this._displayObject.editable;
    }

    public set editable(value: boolean) {
        if (this._displayObject) {
            this._displayObject.editable = value;
        }
    }

    /**
     * Get/set max length
     * 获取/设置最大长度
     */
    public get maxLength(): number {
        return this._displayObject.maxLength;
    }

    public set maxLength(value: number) {
        if (this._displayObject) {
            this._displayObject.maxLength = value;
        }
    }

    /**
     * Get/set placeholder text
     * 获取/设置占位符文本
     */
    public get promptText(): string {
        return this._displayObject.promptText;
    }

    public set promptText(value: string) {
        if (this._displayObject) {
            this._displayObject.promptText = value;
        }
    }

    /**
     * Get/set placeholder color
     * 获取/设置占位符颜色
     */
    public get promptColor(): string {
        return this._displayObject.promptColor;
    }

    public set promptColor(value: string) {
        if (this._displayObject) {
            this._displayObject.promptColor = value;
        }
    }

    /**
     * Get/set character restriction pattern
     * 获取/设置字符限制模式
     */
    public get restrict(): string {
        return this._displayObject.restrict;
    }

    public set restrict(value: string) {
        if (this._displayObject) {
            this._displayObject.restrict = value;
        }
    }

    /**
     * Get/set single line mode
     * 获取/设置单行模式
     */
    public get singleLine(): boolean {
        return this._singleLine;
    }

    public set singleLine(value: boolean) {
        this._singleLine = value;
        if (this._displayObject) {
            this._displayObject.multiline = !value;
        }
    }

    /**
     * Request focus
     * 请求焦点
     */
    public requestFocus(): void {
        this._displayObject.focus();
        super.requestFocus();
    }

    /**
     * Clear focus
     * 清除焦点
     */
    public clearFocus(): void {
        this._displayObject.blur();
    }

    /**
     * Select all text
     * 选择所有文本
     */
    public selectAll(): void {
        this._displayObject.selectAll();
    }

    public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_beforeAdd(buffer, beginPos);

        buffer.seek(beginPos, 4);

        let str = buffer.readS();
        if (str) {
            this.promptText = str;
        }

        str = buffer.readS();
        if (str) {
            this.restrict = str;
        }

        const iv = buffer.getInt32();
        if (iv !== 0) {
            this.maxLength = iv;
        }

        const keyboardTypeValue = buffer.getInt32();
        if (keyboardTypeValue !== 0) {
            if (keyboardTypeValue === 4) {
                this.keyboardType = EKeyboardType.Number;
            } else if (keyboardTypeValue === 3) {
                this.keyboardType = EKeyboardType.Url;
            }
        }

        if (buffer.readBool()) {
            this.password = true;
        }
    }
}
