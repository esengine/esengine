import { GObject } from '../core/GObject';
import { TextField } from '../display/TextField';
import {
    EAutoSizeType,
    EAlignType,
    EVertAlignType,
    EObjectPropID
} from '../core/FieldTypes';
import type { ByteBuffer } from '../utils/ByteBuffer';

/**
 * GTextField
 *
 * Text field display object for FairyGUI.
 *
 * FairyGUI 文本字段显示对象
 */
export class GTextField extends GObject {
    protected _textField!: TextField;
    protected _text: string = '';
    protected _autoSize: EAutoSizeType = EAutoSizeType.Both;
    protected _widthAutoSize: boolean = true;
    protected _heightAutoSize: boolean = true;
    protected _color: string = '#000000';
    protected _singleLine: boolean = false;

    constructor() {
        super();
    }

    protected createDisplayObject(): void {
        this._displayObject = this._textField = new TextField();
        this._textField.touchable = false;
        (this._displayObject as any)['$owner'] = this;
    }

    /**
     * Get the internal text field display object
     * 获取内部文本字段显示对象
     */
    public get textField(): TextField {
        return this._textField;
    }

    /**
     * Get/set text content
     * 获取/设置文本内容
     */
    public get text(): string {
        return this._text;
    }

    public set text(value: string) {
        this._text = value;
        this._textField.text = value;
        this.updateSize();
    }

    /**
     * Get/set font
     * 获取/设置字体
     */
    public get font(): string {
        return this._textField.font;
    }

    public set font(value: string) {
        this._textField.font = value;
    }

    /**
     * Get/set font size
     * 获取/设置字体大小
     */
    public get fontSize(): number {
        return this._textField.fontSize;
    }

    public set fontSize(value: number) {
        this._textField.fontSize = value;
    }

    /**
     * Get/set text color
     * 获取/设置文本颜色
     */
    public get color(): string {
        return this._color;
    }

    public set color(value: string) {
        if (this._color !== value) {
            this._color = value;
            this.updateGear(4);

            if (this.grayed) {
                this._textField.color = '#AAAAAA';
            } else {
                this._textField.color = this._color;
            }
        }
    }

    /**
     * Get/set horizontal alignment
     * 获取/设置水平对齐
     */
    public get align(): EAlignType {
        return this._textField.align;
    }

    public set align(value: EAlignType) {
        this._textField.align = value;
    }

    /**
     * Get/set vertical alignment
     * 获取/设置垂直对齐
     */
    public get valign(): EVertAlignType {
        return this._textField.valign;
    }

    public set valign(value: EVertAlignType) {
        this._textField.valign = value;
    }

    /**
     * Get/set leading (line spacing)
     * 获取/设置行间距
     */
    public get leading(): number {
        return this._textField.leading;
    }

    public set leading(value: number) {
        this._textField.leading = value;
    }

    /**
     * Get/set letter spacing
     * 获取/设置字间距
     */
    public get letterSpacing(): number {
        return this._textField.letterSpacing;
    }

    public set letterSpacing(value: number) {
        this._textField.letterSpacing = value;
    }

    /**
     * Get/set bold
     * 获取/设置粗体
     */
    public get bold(): boolean {
        return this._textField.bold;
    }

    public set bold(value: boolean) {
        this._textField.bold = value;
    }

    /**
     * Get/set italic
     * 获取/设置斜体
     */
    public get italic(): boolean {
        return this._textField.italic;
    }

    public set italic(value: boolean) {
        this._textField.italic = value;
    }

    /**
     * Get/set underline
     * 获取/设置下划线
     */
    public get underline(): boolean {
        return this._textField.underline;
    }

    public set underline(value: boolean) {
        this._textField.underline = value;
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
        this._textField.singleLine = value;
        this._textField.wordWrap = !this._widthAutoSize && !this._singleLine;
    }

    /**
     * Get/set stroke width
     * 获取/设置描边宽度
     */
    public get stroke(): number {
        return this._textField.stroke;
    }

    public set stroke(value: number) {
        this._textField.stroke = value;
    }

    /**
     * Get/set stroke color
     * 获取/设置描边颜色
     */
    public get strokeColor(): string {
        return this._textField.strokeColor;
    }

    public set strokeColor(value: string) {
        if (this._textField.strokeColor !== value) {
            this._textField.strokeColor = value;
            this.updateGear(4);
        }
    }

    /**
     * Get/set UBB enabled
     * 获取/设置 UBB 标签启用
     */
    public get ubbEnabled(): boolean {
        return this._textField.ubbEnabled;
    }

    public set ubbEnabled(value: boolean) {
        this._textField.ubbEnabled = value;
    }

    /**
     * Get/set auto size type
     * 获取/设置自动尺寸类型
     */
    public get autoSize(): EAutoSizeType {
        return this._autoSize;
    }

    public set autoSize(value: EAutoSizeType) {
        if (this._autoSize !== value) {
            this._autoSize = value;
            this._widthAutoSize = this._autoSize === EAutoSizeType.Both;
            this._heightAutoSize =
                this._autoSize === EAutoSizeType.Both ||
                this._autoSize === EAutoSizeType.Height;
            this.updateAutoSize();
        }
    }

    protected updateAutoSize(): void {
        this._textField.wordWrap = !this._widthAutoSize && !this._singleLine;
        this._textField.autoSize = this._autoSize;
        if (!this._underConstruct) {
            if (!this._heightAutoSize) {
                this._textField.width = this._width;
                this._textField.height = this._height;
            } else if (!this._widthAutoSize) {
                this._textField.width = this._width;
            }
        }
    }

    /**
     * Get text width
     * 获取文本宽度
     */
    public get textWidth(): number {
        return this._textField.textWidth;
    }

    /**
     * Get/set template variables
     * 获取/设置模板变量
     */
    public get templateVars(): Record<string, string> | null {
        return this._textField.templateVars;
    }

    public set templateVars(value: Record<string, string> | null) {
        this._textField.templateVars = value;
    }

    /**
     * Set a template variable
     * 设置模板变量
     */
    public setVar(name: string, value: string): GTextField {
        this._textField.setVar(name, value);
        return this;
    }

    /**
     * Flush template variables
     * 刷新模板变量
     */
    public flushVars(): void {
        // Auto flush, nothing needed
    }

    public ensureSizeCorrect(): void {
        // Force layout if needed
    }

    private updateSize(): void {
        if (this._widthAutoSize) {
            this.setSize(this._textField.textWidth, this._textField.textHeight);
        } else if (this._heightAutoSize) {
            this.height = this._textField.textHeight;
        }
    }

    protected handleSizeChanged(): void {
        super.handleSizeChanged();
        this._textField.width = this._width;
        this._textField.height = this._height;
    }

    protected handleGrayedChanged(): void {
        super.handleGrayedChanged();

        if (this.grayed) {
            this._textField.color = '#AAAAAA';
        } else {
            this._textField.color = this._color;
        }
    }

    public getProp(index: number): any {
        switch (index) {
            case EObjectPropID.Color:
                return this.color;
            case EObjectPropID.OutlineColor:
                return this.strokeColor;
            case EObjectPropID.FontSize:
                return this.fontSize;
            default:
                return super.getProp(index);
        }
    }

    public setProp(index: number, value: any): void {
        switch (index) {
            case EObjectPropID.Color:
                this.color = value;
                break;
            case EObjectPropID.OutlineColor:
                this.strokeColor = value;
                break;
            case EObjectPropID.FontSize:
                this.fontSize = value;
                break;
            default:
                super.setProp(index, value);
                break;
        }
    }

    public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_beforeAdd(buffer, beginPos);

        buffer.seek(beginPos, 5);

        this.font = buffer.readS();
        this.fontSize = buffer.getInt16();
        this.color = buffer.readS();
        const alignValue = buffer.readByte();
        this.align =
            alignValue === 0
                ? EAlignType.Left
                : alignValue === 1
                  ? EAlignType.Center
                  : EAlignType.Right;
        const valignValue = buffer.readByte();
        this.valign =
            valignValue === 0
                ? EVertAlignType.Top
                : valignValue === 1
                  ? EVertAlignType.Middle
                  : EVertAlignType.Bottom;
        this.leading = buffer.getInt16();
        this.letterSpacing = buffer.getInt16();
        this.ubbEnabled = buffer.readBool();
        this.autoSize = buffer.readByte();
        this.underline = buffer.readBool();
        this.italic = buffer.readBool();
        this.bold = buffer.readBool();
        this.singleLine = buffer.readBool();
        if (buffer.readBool()) {
            this.strokeColor = buffer.readS();
            this.stroke = buffer.getFloat32() + 1;
        }

        if (buffer.readBool()) {
            // Shadow - skip for now
            buffer.skip(12);
        }

        if (buffer.readBool()) {
            this._textField.templateVars = {};
        }
    }

    public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
        super.setup_afterAdd(buffer, beginPos);

        buffer.seek(beginPos, 6);

        const str = buffer.readS();
        if (str) {
            this.text = str;
        }
    }
}
