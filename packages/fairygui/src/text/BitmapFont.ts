/**
 * BitmapFont
 *
 * Bitmap font support for FairyGUI.
 * Handles BMFont format from FairyGUI Editor exports.
 *
 * 位图字体支持
 * 处理 FairyGUI 编辑器导出的 BMFont 格式
 */

import type { MSDFFont, IMSDFFontData, IMSDFGlyph } from './MSDFFont';

/**
 * FairyGUI bitmap font glyph
 * FairyGUI 位图字体字形
 */
export interface IBitmapGlyph {
    /** X offset in the glyph | 字形内 X 偏移 */
    x: number;
    /** Y offset in the glyph | 字形内 Y 偏移 */
    y: number;
    /** Glyph width | 字形宽度 */
    width: number;
    /** Glyph height | 字形高度 */
    height: number;
    /** Horizontal advance | 水平前进量 */
    advance: number;
    /** Source texture region (if from atlas) | 源纹理区域 */
    textureRegion?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** Texture ID for this glyph | 此字形的纹理 ID */
    textureId?: number;
}

/**
 * FairyGUI bitmap font data (from UIPackage)
 * FairyGUI 位图字体数据（来自 UIPackage）
 */
export interface IBitmapFontData {
    /** Is TTF (dynamic font) | 是否是 TTF（动态字体） */
    ttf: boolean;
    /** Can be tinted | 可以着色 */
    tint: boolean;
    /** Font size | 字体大小 */
    fontSize: number;
    /** Line height | 行高 */
    lineHeight: number;
    /** Glyphs map (charCode -> glyph) | 字形映射 */
    glyphs: Map<number, IBitmapGlyph>;
    /** Texture ID for the font atlas | 字体图集纹理 ID */
    textureId?: number;
}

/**
 * BitmapFont
 *
 * Adapter for FairyGUI bitmap fonts.
 * Can be used for rendering when MSDF fonts are not available.
 *
 * FairyGUI 位图字体适配器
 * 当 MSDF 字体不可用时可用于渲染
 */
export class BitmapFont {
    /** Font name | 字体名称 */
    public readonly name: string;

    /** Texture ID | 纹理 ID */
    public textureId: number = 0;

    /** Font data | 字体数据 */
    private _data: IBitmapFontData;

    constructor(name: string, data: IBitmapFontData) {
        this.name = name;
        this._data = data;
        if (data.textureId !== undefined) {
            this.textureId = data.textureId;
        }
    }

    /**
     * Is this a TTF (dynamic) font
     * 是否是 TTF（动态）字体
     */
    public get isTTF(): boolean {
        return this._data.ttf;
    }

    /**
     * Can the font be tinted
     * 字体是否可以着色
     */
    public get canTint(): boolean {
        return this._data.tint;
    }

    /**
     * Font size | 字体大小
     */
    public get fontSize(): number {
        return this._data.fontSize;
    }

    /**
     * Line height | 行高
     */
    public get lineHeight(): number {
        return this._data.lineHeight;
    }

    /**
     * Get glyph for a character
     * 获取字符的字形
     */
    public getGlyph(charCode: number): IBitmapGlyph | undefined {
        return this._data.glyphs.get(charCode);
    }

    /**
     * Check if font has a glyph
     * 检查字体是否有字形
     */
    public hasGlyph(charCode: number): boolean {
        return this._data.glyphs.has(charCode);
    }

    /**
     * Get all glyphs
     * 获取所有字形
     */
    public get glyphs(): Map<number, IBitmapGlyph> {
        return this._data.glyphs;
    }
}

/**
 * Bitmap Font Manager
 * 位图字体管理器
 */
export class BitmapFontManager {
    /** Loaded fonts | 已加载的字体 */
    private _fonts: Map<string, BitmapFont> = new Map();

    /**
     * Register a bitmap font
     * 注册位图字体
     */
    public registerFont(font: BitmapFont): void {
        this._fonts.set(font.name, font);
    }

    /**
     * Get a font by name
     * 按名称获取字体
     */
    public getFont(name: string): BitmapFont | undefined {
        return this._fonts.get(name);
    }

    /**
     * Check if a font is registered
     * 检查字体是否已注册
     */
    public hasFont(name: string): boolean {
        return this._fonts.has(name);
    }

    /**
     * Unload a font
     * 卸载字体
     */
    public unloadFont(name: string): void {
        this._fonts.delete(name);
    }

    /**
     * Clear all fonts
     * 清除所有字体
     */
    public clear(): void {
        this._fonts.clear();
    }

    /**
     * Create from FairyGUI package font data
     * 从 FairyGUI 包字体数据创建
     */
    public createFromPackageData(name: string, data: IBitmapFontData): BitmapFont {
        const font = new BitmapFont(name, data);
        this.registerFont(font);
        return font;
    }
}

/** Global bitmap font manager | 全局位图字体管理器 */
let _bitmapFontManager: BitmapFontManager | null = null;

/**
 * Get global bitmap font manager
 * 获取全局位图字体管理器
 */
export function getBitmapFontManager(): BitmapFontManager {
    if (!_bitmapFontManager) {
        _bitmapFontManager = new BitmapFontManager();
    }
    return _bitmapFontManager;
}

/**
 * Convert bitmap font to MSDF-compatible format
 * 将位图字体转换为 MSDF 兼容格式
 *
 * Note: This creates a "fake" MSDF font that uses bitmap rendering.
 * The pxRange is set to 0 to disable MSDF processing in the shader.
 *
 * 注意：这会创建一个使用位图渲染的"伪" MSDF 字体。
 * pxRange 设置为 0 以在着色器中禁用 MSDF 处理。
 */
export function convertBitmapToMSDFFormat(
    bitmapFont: BitmapFont,
    atlasWidth: number,
    atlasHeight: number
): IMSDFFontData {
    const glyphs: IMSDFGlyph[] = [];

    for (const [charCode, glyph] of bitmapFont.glyphs) {
        const region = glyph.textureRegion;
        if (!region) continue;

        glyphs.push({
            unicode: charCode,
            advance: glyph.advance / bitmapFont.fontSize,
            planeBounds: {
                left: glyph.x / bitmapFont.fontSize,
                bottom: -(glyph.y + glyph.height) / bitmapFont.fontSize,
                right: (glyph.x + glyph.width) / bitmapFont.fontSize,
                top: -glyph.y / bitmapFont.fontSize
            },
            atlasBounds: {
                left: region.x,
                bottom: region.y,
                right: region.x + region.width,
                top: region.y + region.height
            }
        });
    }

    return {
        atlas: {
            type: 'sdf', // Use simple SDF mode for bitmap
            distanceRange: 0, // 0 = disable MSDF processing, use as regular texture
            size: bitmapFont.fontSize,
            width: atlasWidth,
            height: atlasHeight,
            yOrigin: 'top'
        },
        metrics: {
            emSize: bitmapFont.fontSize,
            lineHeight: bitmapFont.lineHeight / bitmapFont.fontSize,
            ascender: 1,
            descender: 0
        },
        glyphs
    };
}
