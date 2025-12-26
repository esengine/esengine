/**
 * TextBatch
 *
 * Batches text glyphs for efficient GPU rendering.
 * Converts positioned glyphs to vertex data for the MSDF shader.
 *
 * 批处理文本字形以实现高效的 GPU 渲染
 * 将定位字形转换为 MSDF 着色器的顶点数据
 */

import type { IPositionedGlyph } from './TextLayout';

/**
 * Text render batch data
 * 文本渲染批次数据
 */
export interface ITextBatchData {
    /** Vertex positions [x, y, ...] | 顶点位置 */
    positions: Float32Array;

    /** Texture coordinates [u, v, ...] | 纹理坐标 */
    texCoords: Float32Array;

    /** Fill colors [r, g, b, a, ...] | 填充颜色 */
    colors: Float32Array;

    /** Outline colors [r, g, b, a, ...] | 描边颜色 */
    outlineColors: Float32Array;

    /** Outline widths | 描边宽度 */
    outlineWidths: Float32Array;

    /** Indices for indexed drawing | 索引绘制的索引 */
    indices: Uint16Array;

    /** Number of glyphs | 字形数量 */
    glyphCount: number;

    /** Font texture ID | 字体纹理 ID */
    textureId: number;

    /** Pixel range for shader | 着色器像素范围 */
    pxRange: number;
}

/**
 * Text batch options
 * 文本批次选项
 */
export interface ITextBatchOptions {
    /** Fill color (RGBA packed) | 填充颜色 */
    color: number;

    /** Alpha | 透明度 */
    alpha: number;

    /** Outline color (RGBA packed) | 描边颜色 */
    outlineColor?: number;

    /** Outline width in pixels | 描边宽度（像素） */
    outlineWidth?: number;

    /** Offset X | X 偏移 */
    offsetX?: number;

    /** Offset Y | Y 偏移 */
    offsetY?: number;
}

/**
 * Unpack color from 32-bit packed RGBA
 * 从 32 位打包的 RGBA 解包颜色
 */
function unpackColor(packed: number): [number, number, number, number] {
    const r = ((packed >> 24) & 0xff) / 255;
    const g = ((packed >> 16) & 0xff) / 255;
    const b = ((packed >> 8) & 0xff) / 255;
    const a = (packed & 0xff) / 255;
    return [r, g, b, a];
}

/**
 * Create text batch from positioned glyphs
 * 从定位字形创建文本批次
 */
export function createTextBatch(
    glyphs: IPositionedGlyph[],
    textureId: number,
    pxRange: number,
    options: ITextBatchOptions
): ITextBatchData {
    const glyphCount = glyphs.length;

    if (glyphCount === 0) {
        return {
            positions: new Float32Array(0),
            texCoords: new Float32Array(0),
            colors: new Float32Array(0),
            outlineColors: new Float32Array(0),
            outlineWidths: new Float32Array(0),
            indices: new Uint16Array(0),
            glyphCount: 0,
            textureId,
            pxRange
        };
    }

    // 4 vertices per glyph, 2 floats per position
    const positions = new Float32Array(glyphCount * 4 * 2);
    // 4 vertices per glyph, 2 floats per texCoord
    const texCoords = new Float32Array(glyphCount * 4 * 2);
    // 4 vertices per glyph, 4 floats per color
    const colors = new Float32Array(glyphCount * 4 * 4);
    const outlineColors = new Float32Array(glyphCount * 4 * 4);
    // 4 vertices per glyph, 1 float per outline width
    const outlineWidths = new Float32Array(glyphCount * 4);
    // 6 indices per glyph (2 triangles)
    const indices = new Uint16Array(glyphCount * 6);

    const offsetX = options.offsetX ?? 0;
    const offsetY = options.offsetY ?? 0;
    const [r, g, b, a] = unpackColor(options.color);
    const finalAlpha = a * options.alpha;

    const hasOutline = (options.outlineWidth ?? 0) > 0;
    const [or, og, ob, oa] = hasOutline ? unpackColor(options.outlineColor ?? 0x000000FF) : [0, 0, 0, 0];
    const outlineWidth = options.outlineWidth ?? 0;

    for (let i = 0; i < glyphCount; i++) {
        const glyph = glyphs[i];
        const x = glyph.x + offsetX;
        const y = glyph.y + offsetY;
        const w = glyph.width;
        const h = glyph.height;
        const [u0, v0, u1, v1] = glyph.uv;

        const posIdx = i * 8;
        const texIdx = i * 8;
        const colIdx = i * 16;
        const outIdx = i * 4;
        const idxBase = i * 6;
        const vertBase = i * 4;

        // Vertex positions (quad: top-left, top-right, bottom-right, bottom-left)
        // 顶点位置（四边形：左上、右上、右下、左下）
        positions[posIdx + 0] = x;          // TL x
        positions[posIdx + 1] = y;          // TL y
        positions[posIdx + 2] = x + w;      // TR x
        positions[posIdx + 3] = y;          // TR y
        positions[posIdx + 4] = x + w;      // BR x
        positions[posIdx + 5] = y + h;      // BR y
        positions[posIdx + 6] = x;          // BL x
        positions[posIdx + 7] = y + h;      // BL y

        // Texture coordinates
        // 纹理坐标
        texCoords[texIdx + 0] = u0;  // TL u
        texCoords[texIdx + 1] = v0;  // TL v
        texCoords[texIdx + 2] = u1;  // TR u
        texCoords[texIdx + 3] = v0;  // TR v
        texCoords[texIdx + 4] = u1;  // BR u
        texCoords[texIdx + 5] = v1;  // BR v
        texCoords[texIdx + 6] = u0;  // BL u
        texCoords[texIdx + 7] = v1;  // BL v

        // Colors (same for all 4 vertices)
        // 颜色（4 个顶点相同）
        for (let v = 0; v < 4; v++) {
            const ci = colIdx + v * 4;
            colors[ci + 0] = r;
            colors[ci + 1] = g;
            colors[ci + 2] = b;
            colors[ci + 3] = finalAlpha;

            outlineColors[ci + 0] = or;
            outlineColors[ci + 1] = og;
            outlineColors[ci + 2] = ob;
            outlineColors[ci + 3] = oa;

            outlineWidths[outIdx + v] = outlineWidth;
        }

        // Indices (two triangles: 0-1-2, 2-3-0)
        // 索引（两个三角形）
        indices[idxBase + 0] = vertBase + 0;
        indices[idxBase + 1] = vertBase + 1;
        indices[idxBase + 2] = vertBase + 2;
        indices[idxBase + 3] = vertBase + 2;
        indices[idxBase + 4] = vertBase + 3;
        indices[idxBase + 5] = vertBase + 0;
    }

    return {
        positions,
        texCoords,
        colors,
        outlineColors,
        outlineWidths,
        indices,
        glyphCount,
        textureId,
        pxRange
    };
}

/**
 * Merge multiple text batches into one
 * 将多个文本批次合并为一个
 */
export function mergeTextBatches(batches: ITextBatchData[]): ITextBatchData | null {
    if (batches.length === 0) return null;
    if (batches.length === 1) return batches[0];

    // All batches must have same texture
    const textureId = batches[0].textureId;
    const pxRange = batches[0].pxRange;

    let totalGlyphs = 0;
    for (const batch of batches) {
        if (batch.textureId !== textureId) {
            console.warn('Cannot merge text batches with different textures');
            return null;
        }
        totalGlyphs += batch.glyphCount;
    }

    const positions = new Float32Array(totalGlyphs * 4 * 2);
    const texCoords = new Float32Array(totalGlyphs * 4 * 2);
    const colors = new Float32Array(totalGlyphs * 4 * 4);
    const outlineColors = new Float32Array(totalGlyphs * 4 * 4);
    const outlineWidths = new Float32Array(totalGlyphs * 4);
    const indices = new Uint16Array(totalGlyphs * 6);

    let posOffset = 0;
    let texOffset = 0;
    let colOffset = 0;
    let outOffset = 0;
    let idxOffset = 0;
    let vertOffset = 0;

    for (const batch of batches) {
        const glyphCount = batch.glyphCount;

        positions.set(batch.positions, posOffset);
        texCoords.set(batch.texCoords, texOffset);
        colors.set(batch.colors, colOffset);
        outlineColors.set(batch.outlineColors, colOffset);
        outlineWidths.set(batch.outlineWidths, outOffset);

        // Adjust indices
        for (let i = 0; i < batch.indices.length; i++) {
            indices[idxOffset + i] = batch.indices[i] + vertOffset;
        }

        posOffset += glyphCount * 4 * 2;
        texOffset += glyphCount * 4 * 2;
        colOffset += glyphCount * 4 * 4;
        outOffset += glyphCount * 4;
        idxOffset += glyphCount * 6;
        vertOffset += glyphCount * 4;
    }

    return {
        positions,
        texCoords,
        colors,
        outlineColors,
        outlineWidths,
        indices,
        glyphCount: totalGlyphs,
        textureId,
        pxRange
    };
}
