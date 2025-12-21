/**
 * MSDFFontLoader
 *
 * Utility for loading MSDF fonts from JSON and texture files.
 * Compatible with msdf-atlas-gen output format.
 *
 * MSDF 字体加载工具
 * 兼容 msdf-atlas-gen 输出格式
 *
 * @example
 * ```typescript
 * // Load font with texture service
 * const font = await loadMSDFFont(
 *     'NotoSans',
 *     '/fonts/NotoSans.json',
 *     '/fonts/NotoSans.png',
 *     textureService
 * );
 *
 * // Or use the loader class for more control
 * const loader = new MSDFFontLoader(textureService);
 * const font = await loader.load('NotoSans', jsonUrl, textureUrl);
 * ```
 */

import { MSDFFont, getMSDFFontManager } from './MSDFFont';
import type { IMSDFFontData } from './MSDFFont';
import type { ITextureService } from '../asset/FGUITextureManager';

/**
 * Font load result
 * 字体加载结果
 */
export interface IFontLoadResult {
    /** Loaded font | 加载的字体 */
    font: MSDFFont;

    /** Font texture ID | 字体纹理 ID */
    textureId: number;

    /** Font name | 字体名称 */
    name: string;
}

/**
 * MSDF Font Loader
 * MSDF 字体加载器
 */
export class MSDFFontLoader {
    private _textureService: ITextureService;
    private _fontCache: Map<string, MSDFFont> = new Map();

    constructor(textureService: ITextureService) {
        this._textureService = textureService;
    }

    /**
     * Load MSDF font from JSON and texture URLs
     * 从 JSON 和纹理 URL 加载 MSDF 字体
     *
     * @param name Font name for registration | 注册用的字体名称
     * @param jsonUrl URL to font JSON file | 字体 JSON 文件 URL
     * @param textureUrl URL to font atlas texture | 字体图集纹理 URL
     * @param bRegisterGlobal Register to global font manager | 是否注册到全局字体管理器
     */
    public async load(
        name: string,
        jsonUrl: string,
        textureUrl: string,
        bRegisterGlobal: boolean = true
    ): Promise<IFontLoadResult> {
        // Check cache
        const cached = this._fontCache.get(name);
        if (cached) {
            return {
                font: cached,
                textureId: cached.textureId,
                name
            };
        }

        // Load JSON first
        const fontData = await this.loadFontData(jsonUrl);

        // Load texture (synchronous API - returns ID immediately, loading happens async internally)
        const textureId = this._textureService.loadTextureByPath(textureUrl);

        // Create font
        const font = new MSDFFont(name, fontData);
        font.textureId = textureId;

        // Cache
        this._fontCache.set(name, font);

        // Register to global manager
        if (bRegisterGlobal) {
            const manager = getMSDFFontManager();
            manager.registerFont(font);
        }

        return { font, textureId, name };
    }

    /**
     * Load font data from JSON URL
     * 从 JSON URL 加载字体数据
     */
    private async loadFontData(jsonUrl: string): Promise<IMSDFFontData> {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`Failed to load font JSON: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Preload multiple fonts
     * 预加载多个字体
     */
    public async preloadFonts(
        fonts: Array<{ name: string; jsonUrl: string; textureUrl: string }>
    ): Promise<IFontLoadResult[]> {
        return Promise.all(
            fonts.map(f => this.load(f.name, f.jsonUrl, f.textureUrl))
        );
    }

    /**
     * Get cached font
     * 获取缓存的字体
     */
    public getFont(name: string): MSDFFont | undefined {
        return this._fontCache.get(name);
    }

    /**
     * Clear font cache
     * 清除字体缓存
     */
    public clearCache(): void {
        this._fontCache.clear();
    }
}

/**
 * Load MSDF font (convenience function)
 * 加载 MSDF 字体（便捷函数）
 */
export async function loadMSDFFont(
    name: string,
    jsonUrl: string,
    textureUrl: string,
    textureService: ITextureService
): Promise<MSDFFont> {
    const loader = new MSDFFontLoader(textureService);
    const result = await loader.load(name, jsonUrl, textureUrl);
    return result.font;
}

/**
 * Create font data from raw glyph information
 * Useful for creating fonts programmatically or from custom formats
 *
 * 从原始字形信息创建字体数据
 * 用于程序化创建字体或从自定义格式创建
 */
export function createFontData(params: {
    atlasWidth: number;
    atlasHeight: number;
    fontSize: number;
    pxRange: number;
    lineHeight: number;
    ascender: number;
    descender: number;
    glyphs: Array<{
        unicode: number;
        advance: number;
        planeBounds?: { left: number; bottom: number; right: number; top: number };
        atlasBounds?: { left: number; bottom: number; right: number; top: number };
    }>;
    kerning?: Array<{ unicode1: number; unicode2: number; advance: number }>;
}): IMSDFFontData {
    return {
        atlas: {
            type: 'msdf',
            distanceRange: params.pxRange,
            size: params.fontSize,
            width: params.atlasWidth,
            height: params.atlasHeight,
            yOrigin: 'bottom'
        },
        metrics: {
            emSize: params.fontSize,
            lineHeight: params.lineHeight,
            ascender: params.ascender,
            descender: params.descender
        },
        glyphs: params.glyphs,
        kerning: params.kerning
    };
}
