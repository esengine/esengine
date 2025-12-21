/**
 * TextLayout
 *
 * Text layout engine for MSDF text rendering.
 * Handles line breaking, alignment, and glyph positioning.
 *
 * MSDF 文本渲染的文本布局引擎
 * 处理换行、对齐和字形定位
 */

import type { MSDFFont, IMSDFGlyph } from './MSDFFont';
import { EAlignType, EVertAlignType } from '../core/FieldTypes';

/**
 * Positioned glyph for rendering
 * 用于渲染的定位字形
 */
export interface IPositionedGlyph {
    /** Glyph data | 字形数据 */
    glyph: IMSDFGlyph;

    /** X position in pixels | X 位置（像素） */
    x: number;

    /** Y position in pixels | Y 位置（像素） */
    y: number;

    /** Glyph width in pixels | 字形宽度（像素） */
    width: number;

    /** Glyph height in pixels | 字形高度（像素） */
    height: number;

    /** UV coordinates [u0, v0, u1, v1] | UV 坐标 */
    uv: [number, number, number, number];
}

/**
 * Layout line
 * 布局行
 */
interface ILayoutLine {
    /** Glyphs in this line | 此行中的字形 */
    glyphs: IPositionedGlyph[];

    /** Line width in pixels | 行宽（像素） */
    width: number;

    /** Line start Y position | 行起始 Y 位置 */
    y: number;
}

/**
 * Text layout options
 * 文本布局选项
 */
export interface ITextLayoutOptions {
    /** Font to use | 使用的字体 */
    font: MSDFFont;

    /** Text content | 文本内容 */
    text: string;

    /** Font size in pixels | 字体大小（像素） */
    fontSize: number;

    /** Maximum width (for word wrap) | 最大宽度（用于换行） */
    maxWidth?: number;

    /** Maximum height | 最大高度 */
    maxHeight?: number;

    /** Horizontal alignment | 水平对齐 */
    align?: EAlignType;

    /** Vertical alignment | 垂直对齐 */
    valign?: EVertAlignType;

    /** Line height multiplier | 行高倍数 */
    lineHeight?: number;

    /** Letter spacing in pixels | 字间距（像素） */
    letterSpacing?: number;

    /** Word wrap enabled | 是否启用换行 */
    wordWrap?: boolean;

    /** Single line mode | 单行模式 */
    singleLine?: boolean;
}

/**
 * Text layout result
 * 文本布局结果
 */
export interface ITextLayoutResult {
    /** Positioned glyphs ready for rendering | 准备渲染的定位字形 */
    glyphs: IPositionedGlyph[];

    /** Total width of laid out text | 布局文本的总宽度 */
    width: number;

    /** Total height of laid out text | 布局文本的总高度 */
    height: number;

    /** Number of lines | 行数 */
    lineCount: number;
}

/**
 * Layout text into positioned glyphs
 * 将文本布局为定位字形
 */
export function layoutText(options: ITextLayoutOptions): ITextLayoutResult {
    const {
        font,
        text,
        fontSize,
        maxWidth = Infinity,
        maxHeight = Infinity,
        align = EAlignType.Left,
        valign = EVertAlignType.Top,
        lineHeight = 1.2,
        letterSpacing = 0,
        wordWrap = false,
        singleLine = false
    } = options;

    if (!text || !font) {
        return { glyphs: [], width: 0, height: 0, lineCount: 0 };
    }

    const metrics = font.metrics;
    const atlas = font.atlas;

    // Calculate scale from em units to pixels
    const scale = fontSize / metrics.emSize;
    const lineHeightPx = fontSize * lineHeight;

    // Atlas dimensions for UV calculation
    const atlasWidth = atlas.width;
    const atlasHeight = atlas.height;
    const yFlip = atlas.yOrigin === 'bottom';

    const lines: ILayoutLine[] = [];
    let currentLine: IPositionedGlyph[] = [];
    let currentX = 0;
    let currentY = 0;
    let maxLineWidth = 0;
    let prevCharCode = 0;

    // Process each character
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charCode = char.charCodeAt(0);

        // Handle newline
        if (char === '\n') {
            if (singleLine) continue;

            lines.push({
                glyphs: currentLine,
                width: currentX,
                y: currentY
            });
            maxLineWidth = Math.max(maxLineWidth, currentX);
            currentLine = [];
            currentX = 0;
            currentY += lineHeightPx;
            prevCharCode = 0;
            continue;
        }

        // Handle carriage return
        if (char === '\r') continue;

        // Get glyph
        const glyph = font.getGlyph(charCode);
        if (!glyph) {
            // Try space as fallback
            const spaceGlyph = font.getGlyph(32);
            if (spaceGlyph) {
                currentX += spaceGlyph.advance * scale + letterSpacing;
            }
            prevCharCode = charCode;
            continue;
        }

        // Apply kerning
        if (prevCharCode) {
            currentX += font.getKerning(prevCharCode, charCode) * scale;
        }

        // Check word wrap
        const glyphAdvance = glyph.advance * scale + letterSpacing;
        if (wordWrap && !singleLine && currentX + glyphAdvance > maxWidth && currentLine.length > 0) {
            // Word wrap - start new line
            lines.push({
                glyphs: currentLine,
                width: currentX,
                y: currentY
            });
            maxLineWidth = Math.max(maxLineWidth, currentX);
            currentLine = [];
            currentX = 0;
            currentY += lineHeightPx;

            // Check max height
            if (currentY + lineHeightPx > maxHeight) {
                break;
            }
        }

        // Position glyph if it has atlas bounds
        if (glyph.planeBounds && glyph.atlasBounds) {
            const pb = glyph.planeBounds;
            const ab = glyph.atlasBounds;

            // Calculate glyph position and size
            const glyphX = currentX + pb.left * scale;
            const glyphY = currentY + (metrics.ascender - pb.top) * scale;
            const glyphWidth = (pb.right - pb.left) * scale;
            const glyphHeight = (pb.top - pb.bottom) * scale;

            // Calculate UV coordinates
            let u0 = ab.left / atlasWidth;
            let v0 = ab.bottom / atlasHeight;
            let u1 = ab.right / atlasWidth;
            let v1 = ab.top / atlasHeight;

            // Flip V if Y origin is top
            if (!yFlip) {
                v0 = 1 - v0;
                v1 = 1 - v1;
                [v0, v1] = [v1, v0];
            }

            currentLine.push({
                glyph,
                x: glyphX,
                y: glyphY,
                width: glyphWidth,
                height: glyphHeight,
                uv: [u0, v0, u1, v1]
            });
        }

        currentX += glyphAdvance;
        prevCharCode = charCode;
    }

    // Add last line
    if (currentLine.length > 0 || lines.length === 0) {
        lines.push({
            glyphs: currentLine,
            width: currentX,
            y: currentY
        });
        maxLineWidth = Math.max(maxLineWidth, currentX);
    }

    const totalHeight = currentY + lineHeightPx;
    const lineCount = lines.length;

    // Apply horizontal alignment
    for (const line of lines) {
        let offsetX = 0;
        if (align === EAlignType.Center) {
            offsetX = (maxWidth === Infinity ? 0 : (maxWidth - line.width) / 2);
        } else if (align === EAlignType.Right) {
            offsetX = maxWidth === Infinity ? 0 : (maxWidth - line.width);
        }

        for (const glyph of line.glyphs) {
            glyph.x += offsetX;
        }
    }

    // Apply vertical alignment
    let offsetY = 0;
    if (valign === EVertAlignType.Middle) {
        offsetY = (maxHeight === Infinity ? 0 : (maxHeight - totalHeight) / 2);
    } else if (valign === EVertAlignType.Bottom) {
        offsetY = maxHeight === Infinity ? 0 : (maxHeight - totalHeight);
    }

    if (offsetY !== 0) {
        for (const line of lines) {
            for (const glyph of line.glyphs) {
                glyph.y += offsetY;
            }
        }
    }

    // Flatten glyphs
    const allGlyphs: IPositionedGlyph[] = [];
    for (const line of lines) {
        allGlyphs.push(...line.glyphs);
    }

    return {
        glyphs: allGlyphs,
        width: maxLineWidth,
        height: totalHeight,
        lineCount
    };
}

/**
 * Measure text dimensions without full layout
 * 测量文本尺寸（不进行完整布局）
 */
export function measureText(font: MSDFFont, text: string, fontSize: number, letterSpacing: number = 0): { width: number; height: number } {
    if (!text || !font) {
        return { width: 0, height: 0 };
    }

    const metrics = font.metrics;
    const scale = fontSize / metrics.emSize;

    let width = 0;
    let prevCharCode = 0;

    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const glyph = font.getGlyph(charCode);

        if (glyph) {
            if (prevCharCode) {
                width += font.getKerning(prevCharCode, charCode) * scale;
            }
            width += glyph.advance * scale + letterSpacing;
        }

        prevCharCode = charCode;
    }

    return {
        width,
        height: fontSize * 1.2
    };
}
