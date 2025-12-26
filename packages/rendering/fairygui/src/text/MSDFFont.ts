/**
 * MSDFFont
 *
 * MSDF (Multi-channel Signed Distance Field) font data structures and loader.
 * Compatible with msdf-atlas-gen output format.
 *
 * MSDF 字体数据结构和加载器
 * 兼容 msdf-atlas-gen 输出格式
 */

/**
 * Glyph metrics from MSDF atlas
 * MSDF 图集中的字形度量
 */
export interface IMSDFGlyph {
    /** Unicode code point | Unicode 码点 */
    unicode: number;

    /** Advance width (how much to move cursor after this glyph) | 前进宽度 */
    advance: number;

    /** Plane bounds (position in em units) | 平面边界（em单位） */
    planeBounds?: {
        left: number;
        bottom: number;
        right: number;
        top: number;
    };

    /** Atlas bounds (position in atlas texture, pixels) | 图集边界（图集纹理中的位置，像素） */
    atlasBounds?: {
        left: number;
        bottom: number;
        right: number;
        top: number;
    };
}

/**
 * Kerning pair
 * 字偶距对
 */
export interface IMSDFKerning {
    /** First character unicode | 第一个字符 Unicode */
    unicode1: number;

    /** Second character unicode | 第二个字符 Unicode */
    unicode2: number;

    /** Kerning advance adjustment | 字偶距调整值 */
    advance: number;
}

/**
 * MSDF font atlas metadata
 * MSDF 字体图集元数据
 */
export interface IMSDFFontAtlas {
    /** Atlas type (msdf, mtsdf, sdf) | 图集类型 */
    type: 'msdf' | 'mtsdf' | 'sdf';

    /** Distance field range in pixels | 距离场范围（像素） */
    distanceRange: number;

    /** Distance field range in pixels (alias) | 距离场范围（像素，别名） */
    distanceRangeMiddle?: number;

    /** Font size used for generation | 生成时使用的字体大小 */
    size: number;

    /** Atlas texture width | 图集纹理宽度 */
    width: number;

    /** Atlas texture height | 图集纹理高度 */
    height: number;

    /** Y origin (top or bottom) | Y 轴原点 */
    yOrigin: 'top' | 'bottom';
}

/**
 * MSDF font metrics
 * MSDF 字体度量
 */
export interface IMSDFFontMetrics {
    /** Em size (units per em) | Em 大小 */
    emSize: number;

    /** Line height | 行高 */
    lineHeight: number;

    /** Ascender (above baseline) | 上升部（基线以上） */
    ascender: number;

    /** Descender (below baseline, usually negative) | 下降部（基线以下，通常为负） */
    descender: number;

    /** Underline Y position | 下划线 Y 位置 */
    underlineY?: number;

    /** Underline thickness | 下划线粗细 */
    underlineThickness?: number;
}

/**
 * Complete MSDF font data (matches msdf-atlas-gen JSON output)
 * 完整的 MSDF 字体数据（匹配 msdf-atlas-gen JSON 输出）
 */
export interface IMSDFFontData {
    /** Atlas metadata | 图集元数据 */
    atlas: IMSDFFontAtlas;

    /** Font metrics | 字体度量 */
    metrics: IMSDFFontMetrics;

    /** Glyphs array | 字形数组 */
    glyphs: IMSDFGlyph[];

    /** Kerning pairs (optional) | 字偶距对（可选） */
    kerning?: IMSDFKerning[];
}

/**
 * MSDFFont
 *
 * Loaded MSDF font with fast glyph lookup.
 * 加载的 MSDF 字体，支持快速字形查找
 */
export class MSDFFont {
    /** Font name | 字体名称 */
    public readonly name: string;

    /** Atlas texture ID | 图集纹理 ID */
    public textureId: number = 0;

    /** Font data | 字体数据 */
    private _data: IMSDFFontData;

    /** Glyph map for fast lookup | 字形映射用于快速查找 */
    private _glyphMap: Map<number, IMSDFGlyph> = new Map();

    /** Kerning map (key: unicode1 << 16 | unicode2) | 字偶距映射 */
    private _kerningMap: Map<number, number> = new Map();

    constructor(name: string, data: IMSDFFontData) {
        this.name = name;
        this._data = data;

        // Build glyph lookup map
        for (const glyph of data.glyphs) {
            this._glyphMap.set(glyph.unicode, glyph);
        }

        // Build kerning lookup map
        if (data.kerning) {
            for (const kern of data.kerning) {
                const key = (kern.unicode1 << 16) | kern.unicode2;
                this._kerningMap.set(key, kern.advance);
            }
        }
    }

    /**
     * Get atlas metadata
     * 获取图集元数据
     */
    public get atlas(): IMSDFFontAtlas {
        return this._data.atlas;
    }

    /**
     * Get font metrics
     * 获取字体度量
     */
    public get metrics(): IMSDFFontMetrics {
        return this._data.metrics;
    }

    /**
     * Get pixel range for shader
     * 获取着色器使用的像素范围
     */
    public get pxRange(): number {
        return this._data.atlas.distanceRange;
    }

    /**
     * Get glyph for a character
     * 获取字符的字形
     */
    public getGlyph(charCode: number): IMSDFGlyph | undefined {
        return this._glyphMap.get(charCode);
    }

    /**
     * Get kerning between two characters
     * 获取两个字符之间的字偶距
     */
    public getKerning(charCode1: number, charCode2: number): number {
        const key = (charCode1 << 16) | charCode2;
        return this._kerningMap.get(key) ?? 0;
    }

    /**
     * Check if font has a glyph for a character
     * 检查字体是否有某字符的字形
     */
    public hasGlyph(charCode: number): boolean {
        return this._glyphMap.has(charCode);
    }

    /**
     * Get all glyphs
     * 获取所有字形
     */
    public get glyphs(): readonly IMSDFGlyph[] {
        return this._data.glyphs;
    }
}

/**
 * MSDF Font Manager
 * MSDF 字体管理器
 */
export class MSDFFontManager {
    /** Loaded fonts | 已加载的字体 */
    private _fonts: Map<string, MSDFFont> = new Map();

    /** Default font name | 默认字体名称 */
    private _defaultFontName: string = '';

    /**
     * Register a font
     * 注册字体
     */
    public registerFont(font: MSDFFont): void {
        this._fonts.set(font.name, font);
        if (!this._defaultFontName) {
            this._defaultFontName = font.name;
        }
    }

    /**
     * Get a font by name
     * 按名称获取字体
     */
    public getFont(name: string): MSDFFont | undefined {
        return this._fonts.get(name) ?? this._fonts.get(this._defaultFontName);
    }

    /**
     * Set default font
     * 设置默认字体
     */
    public setDefaultFont(name: string): void {
        if (this._fonts.has(name)) {
            this._defaultFontName = name;
        }
    }

    /**
     * Get default font
     * 获取默认字体
     */
    public get defaultFont(): MSDFFont | undefined {
        return this._fonts.get(this._defaultFontName);
    }

    /**
     * Load font from JSON data and texture
     * 从 JSON 数据和纹理加载字体
     */
    public loadFont(name: string, jsonData: IMSDFFontData, textureId: number): MSDFFont {
        const font = new MSDFFont(name, jsonData);
        font.textureId = textureId;
        this.registerFont(font);
        return font;
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
        this._defaultFontName = '';
    }
}

/** Global font manager instance | 全局字体管理器实例 */
let _fontManager: MSDFFontManager | null = null;

/**
 * Get global MSDF font manager
 * 获取全局 MSDF 字体管理器
 */
export function getMSDFFontManager(): MSDFFontManager {
    if (!_fontManager) {
        _fontManager = new MSDFFontManager();
    }
    return _fontManager;
}
