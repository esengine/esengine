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

    /** Text content changed flag | 文本内容变化标记 */
    private _textChanged: boolean = true;

    /** Internal text storage | 内部文本存储 */
    private _text: string = '';

    constructor() {
        super();
    }

    /**
     * Get/set text content
     * 获取/设置文本内容
     */
    public get text(): string {
        return this._text;
    }

    public set text(value: string) {
        if (this._text !== value) {
            this._text = value;
            this._textChanged = true;
            this.ensureSizeCorrect();
        }
    }

    /**
     * Get text width
     * 获取文本宽度
     */
    public get textWidth(): number {
        if (this._textChanged) {
            this.buildLines();
        }
        return this._textWidth;
    }

    /**
     * Get text height
     * 获取文本高度
     */
    public get textHeight(): number {
        if (this._textChanged) {
            this.buildLines();
        }
        return this._textHeight;
    }

    /**
     * Ensure text size is calculated correctly
     * 确保文本尺寸正确计算
     */
    public ensureSizeCorrect(): void {
        if (this._textChanged && this.autoSize !== EAutoSizeType.None) {
            this.buildLines();
        }
    }

    /** Shared canvas context for text measurement | 共享的 Canvas 上下文用于文本测量 */
    private static _measureContext: CanvasRenderingContext2D | null = null;

    /**
     * Get or create canvas context for text measurement
     * 获取或创建用于文本测量的 canvas 上下文
     */
    private static getMeasureContext(): CanvasRenderingContext2D {
        if (!TextField._measureContext) {
            const canvas = document.createElement('canvas');
            TextField._measureContext = canvas.getContext('2d')!;
        }
        return TextField._measureContext;
    }

    /**
     * Build lines and calculate text dimensions
     * 构建行信息并计算文本尺寸
     *
     * 使用 Canvas 2D measureText 精确测量文本尺寸
     * Use Canvas 2D measureText for accurate text measurement
     */
    private buildLines(): void {
        this._textChanged = false;

        if (!this._text) {
            this._textWidth = 0;
            this._textHeight = this.fontSize;
            return;
        }

        const ctx = TextField.getMeasureContext();

        // 设置字体样式
        // Set font style
        const fontStyle = this.italic ? 'italic ' : '';
        const fontWeight = this.bold ? 'bold ' : '';
        const fontFamily = this.font || 'Arial, sans-serif';
        ctx.font = `${fontStyle}${fontWeight}${this.fontSize}px ${fontFamily}`;

        const lines = this._text.split('\n');
        const lineHeight = this.fontSize + this.leading;

        let maxWidth = 0;

        for (const line of lines) {
            // 使用 canvas measureText 获取精确宽度
            // Use canvas measureText for accurate width
            let lineWidth = ctx.measureText(line).width;

            // 添加字符间距
            // Add letter spacing
            if (this.letterSpacing !== 0 && line.length > 1) {
                lineWidth += this.letterSpacing * (line.length - 1);
            }

            if (lineWidth > maxWidth) {
                maxWidth = lineWidth;
            }
        }

        // 单行模式只取第一行
        // Single line mode only takes first line
        if (this.singleLine) {
            this._textWidth = maxWidth;
            this._textHeight = lineHeight;
        } else {
            this._textWidth = maxWidth;
            this._textHeight = lines.length * lineHeight;
        }

        // 添加 gutter 边距（参考 Unity 实现的 GUTTER_X = 2, GUTTER_Y = 2）
        // Add gutter padding (refer to Unity implementation: GUTTER_X = 2, GUTTER_Y = 2)
        this._textWidth += 4;
        this._textHeight += 4;
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
     * Parse color string to packed u32 (0xRRGGBBAA format)
     * 解析颜色字符串为打包的 u32（0xRRGGBBAA 格式）
     */
    private parseColor(color: string): number {
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            if (hex.length === 6) {
                return ((parseInt(hex, 16) << 8) | 0xFF) >>> 0;
            } else if (hex.length === 8) {
                return parseInt(hex, 16) >>> 0;
            }
        }
        return 0x000000FF;
    }

    public collectRenderData(collector: IRenderCollector): void {
        if (!this._visible || this._alpha <= 0 || !this._text) return;

        this.updateTransform();

        const primitive: IRenderPrimitive = {
            type: ERenderPrimitiveType.Text,
            sortOrder: 0,
            worldMatrix: this._worldMatrix,
            width: this._width,
            height: this._height,
            alpha: this._worldAlpha,
            grayed: this._grayed,
            text: this._text,
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
