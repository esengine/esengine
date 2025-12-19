/**
 * Text Measure Service
 * 文本测量服务
 *
 * Provides text measurement utilities for UI components.
 * 为 UI 组件提供文本测量工具。
 */

/**
 * Font configuration for text measurement
 * 文本测量的字体配置
 */
export interface TextMeasureFont {
    fontSize: number;
    fontFamily: string;
    fontWeight: string | number;
}

/**
 * Character position info
 * 字符位置信息
 */
export interface CharacterPosition {
    /** Character index | 字符索引 */
    index: number;
    /** X position from text start | 从文本开始的 X 位置 */
    x: number;
    /** Character width | 字符宽度 */
    width: number;
}

/**
 * Line info for multi-line text
 * 多行文本的行信息
 */
export interface LineInfo {
    /** Line index | 行索引 */
    lineIndex: number;
    /** Start character index | 起始字符索引 */
    startIndex: number;
    /** End character index (exclusive) | 结束字符索引（不包含） */
    endIndex: number;
    /** Line text content | 行文本内容 */
    text: string;
    /** Line width in pixels | 行宽度（像素） */
    width: number;
}

/**
 * Text Measure Service
 * 文本测量服务
 *
 * Uses Canvas 2D API for accurate text measurement.
 * 使用 Canvas 2D API 进行精确的文本测量。
 */
class TextMeasureServiceImpl {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private currentFont: string = '';

    /**
     * Get or create canvas context
     * 获取或创建 canvas 上下文
     */
    private getContext(): CanvasRenderingContext2D | null {
        if (!this.canvas) {
            if (typeof document === 'undefined') return null;
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
        }
        return this.ctx;
    }

    /**
     * Set font for measurement
     * 设置测量用的字体
     */
    private setFont(font: TextMeasureFont): void {
        const ctx = this.getContext();
        if (!ctx) return;

        const fontString = `${font.fontWeight} ${font.fontSize}px ${font.fontFamily}`;
        if (this.currentFont !== fontString) {
            this.currentFont = fontString;
            ctx.font = fontString;
        }
    }

    /**
     * Measure text width
     * 测量文本宽度
     */
    public measureText(text: string, font: TextMeasureFont): number {
        const ctx = this.getContext();
        if (!ctx) return text.length * font.fontSize * 0.6; // Fallback estimate

        this.setFont(font);
        return ctx.measureText(text).width;
    }

    /**
     * Measure single character width
     * 测量单个字符宽度
     */
    public measureChar(char: string, font: TextMeasureFont): number {
        return this.measureText(char, font);
    }

    /**
     * Get character positions for a text string
     * 获取文本字符串中每个字符的位置
     */
    public getCharacterPositions(text: string, font: TextMeasureFont): CharacterPosition[] {
        const ctx = this.getContext();
        if (!ctx) {
            // Fallback: estimate with average character width
            const avgWidth = font.fontSize * 0.6;
            return text.split('').map((_, i) => ({
                index: i,
                x: i * avgWidth,
                width: avgWidth
            }));
        }

        this.setFont(font);
        const positions: CharacterPosition[] = [];
        let currentX = 0;

        for (let i = 0; i < text.length; i++) {
            const char = text[i]!;
            const charWidth = ctx.measureText(char).width;
            positions.push({
                index: i,
                x: currentX,
                width: charWidth
            });
            currentX += charWidth;
        }

        return positions;
    }

    /**
     * Get character index at x position
     * 获取 x 位置处的字符索引
     *
     * @param text - Text string | 文本字符串
     * @param font - Font configuration | 字体配置
     * @param x - X position relative to text start | 相对于文本开始的 X 位置
     * @returns Character index (0 to text.length) | 字符索引（0 到 text.length）
     */
    public getCharIndexAtX(text: string, font: TextMeasureFont, x: number): number {
        if (text.length === 0 || x <= 0) return 0;

        const positions = this.getCharacterPositions(text, font);
        const totalWidth = positions.length > 0
            ? positions[positions.length - 1]!.x + positions[positions.length - 1]!.width
            : 0;

        if (x >= totalWidth) return text.length;

        // Find the character at position x
        // 找到位置 x 处的字符
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i]!;
            const charCenter = pos.x + pos.width / 2;

            if (x < charCenter) {
                return i;
            }
        }

        return text.length;
    }

    /**
     * Get x position for character index
     * 获取字符索引的 x 位置
     */
    public getXForCharIndex(text: string, font: TextMeasureFont, index: number): number {
        if (index <= 0) return 0;
        if (index >= text.length) {
            return this.measureText(text, font);
        }

        const substring = text.substring(0, index);
        return this.measureText(substring, font);
    }

    /**
     * Get line info for multi-line text
     * 获取多行文本的行信息
     */
    public getLineInfo(text: string, font: TextMeasureFont): LineInfo[] {
        const lines: LineInfo[] = [];
        const textLines = text.split('\n');
        let charIndex = 0;

        for (let i = 0; i < textLines.length; i++) {
            const lineText = textLines[i]!;
            const width = this.measureText(lineText, font);

            lines.push({
                lineIndex: i,
                startIndex: charIndex,
                endIndex: charIndex + lineText.length,
                text: lineText,
                width
            });

            // +1 for the newline character (except last line)
            charIndex += lineText.length + (i < textLines.length - 1 ? 1 : 0);
        }

        return lines;
    }

    /**
     * Get line index for character position
     * 获取字符位置所在的行索引
     */
    public getLineIndexForChar(text: string, charIndex: number): number {
        const lines = text.split('\n');
        let currentIndex = 0;

        for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i]!.length;
            if (charIndex <= currentIndex + lineLength) {
                return i;
            }
            currentIndex += lineLength + 1; // +1 for newline
        }

        return lines.length - 1;
    }

    /**
     * Get character index for line and column
     * 获取行和列对应的字符索引
     */
    public getCharIndexForLineColumn(text: string, lineIndex: number, column: number): number {
        const lines = text.split('\n');
        let charIndex = 0;

        for (let i = 0; i < lineIndex && i < lines.length; i++) {
            charIndex += lines[i]!.length + 1; // +1 for newline
        }

        if (lineIndex < lines.length) {
            const line = lines[lineIndex]!;
            charIndex += Math.min(column, line.length);
        }

        return Math.min(charIndex, text.length);
    }

    /**
     * Get column (x offset) for character in its line
     * 获取字符在其所在行的列位置（x 偏移）
     */
    public getColumnForChar(text: string, charIndex: number): number {
        const lineIndex = this.getLineIndexForChar(text, charIndex);
        const lines = text.split('\n');
        let lineStartIndex = 0;

        for (let i = 0; i < lineIndex; i++) {
            lineStartIndex += lines[i]!.length + 1;
        }

        return charIndex - lineStartIndex;
    }

    /**
     * Dispose resources
     * 释放资源
     */
    public dispose(): void {
        this.canvas = null;
        this.ctx = null;
        this.currentFont = '';
    }
}

// Global singleton instance
// 全局单例实例
let globalTextMeasureService: TextMeasureServiceImpl | null = null;

/**
 * Get the global text measure service
 * 获取全局文本测量服务
 */
export function getTextMeasureService(): TextMeasureServiceImpl {
    if (!globalTextMeasureService) {
        globalTextMeasureService = new TextMeasureServiceImpl();
    }
    return globalTextMeasureService;
}

/**
 * Dispose the global text measure service
 * 释放全局文本测量服务
 */
export function disposeTextMeasureService(): void {
    if (globalTextMeasureService) {
        globalTextMeasureService.dispose();
        globalTextMeasureService = null;
    }
}
