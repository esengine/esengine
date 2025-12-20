import { DisplayObject } from './DisplayObject';
import { EAutoSizeType, EAlignType, EVertAlignType } from '../core/FieldTypes';
import type { IRenderCollector, IRenderPrimitive } from '../render/IRenderCollector';
import { ERenderPrimitiveType } from '../render/IRenderCollector';

/**
 * TextField
 *
 * Display object for rendering text.
 *
 * 用于渲染文本的显示对象
 */
export class TextField extends DisplayObject {
    /** Text content | 文本内容 */
    public text: string = '';

    /** Font name | 字体名称 */
    public font: string = '';

    /** Font size | 字体大小 */
    public fontSize: number = 12;

    /** Text color (hex string) | 文本颜色 */
    public color: string = '#000000';

    /** Horizontal alignment | 水平对齐 */
    public align: EAlignType = EAlignType.Left;

    /** Vertical alignment | 垂直对齐 */
    public valign: EVertAlignType = EVertAlignType.Top;

    /** Line spacing | 行间距 */
    public leading: number = 3;

    /** Letter spacing | 字符间距 */
    public letterSpacing: number = 0;

    /** Bold | 粗体 */
    public bold: boolean = false;

    /** Italic | 斜体 */
    public italic: boolean = false;

    /** Underline | 下划线 */
    public underline: boolean = false;

    /** Single line | 单行 */
    public singleLine: boolean = false;

    /** Stroke width | 描边宽度 */
    public stroke: number = 0;

    /** Stroke color | 描边颜色 */
    public strokeColor: string = '#000000';

    /** UBB enabled | UBB 标签启用 */
    public ubbEnabled: boolean = false;

    /** Auto size type | 自动尺寸类型 */
    public autoSize: EAutoSizeType = EAutoSizeType.Both;

    /** Word wrap | 自动换行 */
    public wordWrap: boolean = false;

    /** Template variables | 模板变量 */
    public templateVars: Record<string, string> | null = null;

    /** Text width after layout | 排版后文本宽度 */
    private _textWidth: number = 0;

    /** Text height after layout | 排版后文本高度 */
    private _textHeight: number = 0;

    constructor() {
        super();
    }

    /**
     * Get text width
     * 获取文本宽度
     */
    public get textWidth(): number {
        return this._textWidth;
    }

    /**
     * Get text height
     * 获取文本高度
     */
    public get textHeight(): number {
        return this._textHeight;
    }

    /**
     * Set variable
     * 设置变量
     */
    public setVar(name: string, value: string): void {
        if (!this.templateVars) {
            this.templateVars = {};
        }
        this.templateVars[name] = value;
    }

    /**
     * Parse color string to number
     * 解析颜色字符串为数字
     */
    private parseColor(color: string): number {
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            if (hex.length === 6) {
                return parseInt(hex, 16) | 0xFF000000;
            } else if (hex.length === 8) {
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                const a = parseInt(hex.slice(6, 8), 16);
                return (a << 24) | (r << 16) | (g << 8) | b;
            }
        }
        return 0xFF000000;
    }

    public collectRenderData(collector: IRenderCollector): void {
        if (!this._visible || this._alpha <= 0 || !this.text) return;

        this.updateTransform();

        const primitive: IRenderPrimitive = {
            type: ERenderPrimitiveType.Text,
            sortOrder: 0,
            worldMatrix: this._worldMatrix,
            width: this._width,
            height: this._height,
            alpha: this._worldAlpha,
            grayed: this._grayed,
            text: this.text,
            font: this.font,
            fontSize: this.fontSize,
            color: this.parseColor(this.color),
            align: this.align,
            valign: this.valign,
            leading: this.leading,
            letterSpacing: this.letterSpacing,
            bold: this.bold,
            italic: this.italic,
            underline: this.underline,
            singleLine: this.singleLine,
            wordWrap: this.wordWrap,
            clipRect: collector.getCurrentClipRect() || undefined
        };

        if (this.stroke > 0) {
            primitive.stroke = this.stroke;
            primitive.strokeColor = this.parseColor(this.strokeColor);
        }

        collector.addPrimitive(primitive);
    }
}
