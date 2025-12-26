/**
 * DynamicFont
 *
 * Runtime dynamic font atlas generator using Canvas 2D.
 * Similar to Unity's Font.RequestCharactersInTexture approach.
 *
 * 使用 Canvas 2D 的运行时动态字体图集生成器
 * 类似于 Unity 的 Font.RequestCharactersInTexture 方法
 *
 * This is the fallback solution when MSDF fonts are not available.
 * Characters are rendered to a texture atlas on demand.
 *
 * 当 MSDF 字体不可用时的备选方案。
 * 字符按需渲染到纹理图集。
 */

import { MSDFFont, getMSDFFontManager } from './MSDFFont';
import type { IMSDFFontData, IMSDFGlyph } from './MSDFFont';

/**
 * Glyph info in the dynamic atlas
 * 动态图集中的字形信息
 */
interface IDynamicGlyph {
    /** Character code | 字符码 */
    charCode: number;
    /** X position in atlas | 图集中的 X 位置 */
    x: number;
    /** Y position in atlas | 图集中的 Y 位置 */
    y: number;
    /** Glyph width | 字形宽度 */
    width: number;
    /** Glyph height | 字形高度 */
    height: number;
    /** Horizontal advance | 水平前进量 */
    advance: number;
    /** Baseline offset | 基线偏移 */
    baseline: number;
}

/**
 * Dynamic font configuration
 * 动态字体配置
 */
export interface IDynamicFontConfig {
    /** Font family (e.g., "Arial", "Microsoft YaHei") | 字体家族 */
    fontFamily: string;
    /** Font size for atlas generation | 图集生成的字体大小 */
    fontSize?: number;
    /** Atlas width | 图集宽度 */
    atlasWidth?: number;
    /** Atlas height | 图集高度 */
    atlasHeight?: number;
    /** Padding around glyphs | 字形周围的边距 */
    padding?: number;
    /** Pre-render common characters | 预渲染常用字符 */
    preloadChars?: string;
}

/**
 * Texture upload callback
 * 纹理上传回调
 */
export type TextureUploadCallback = (
    imageData: ImageData,
    x: number,
    y: number,
    width: number,
    height: number
) => void;

/**
 * DynamicFont
 *
 * Generates font atlas dynamically using Canvas 2D.
 * Implements character-on-demand rendering similar to Unity.
 *
 * 使用 Canvas 2D 动态生成字体图集
 * 实现类似 Unity 的按需字符渲染
 */
export class DynamicFont {
    /** Font name | 字体名称 */
    public readonly name: string;

    /** Texture ID assigned by engine | 引擎分配的纹理 ID */
    public textureId: number = 0;

    /** Font family | 字体家族 */
    private _fontFamily: string;

    /** Base font size | 基础字体大小 */
    private _fontSize: number;

    /** Atlas dimensions | 图集尺寸 */
    private _atlasWidth: number;
    private _atlasHeight: number;

    /** Padding around glyphs | 字形边距 */
    private _padding: number;

    /** Canvas for rendering | 渲染用画布 */
    private _canvas: HTMLCanvasElement | OffscreenCanvas;
    private _ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    /** Glyph cache | 字形缓存 */
    private _glyphs: Map<number, IDynamicGlyph> = new Map();

    /** Current position in atlas | 图集中的当前位置 */
    private _cursorX: number = 0;
    private _cursorY: number = 0;
    private _rowHeight: number = 0;

    /** Line height metrics | 行高度量 */
    private _lineHeight: number = 0;
    private _ascent: number = 0;

    /** Texture needs upload | 纹理需要上传 */
    private _dirty: boolean = false;

    /** Dirty region for partial upload | 部分上传的脏区域 */
    private _dirtyRegion: { x: number; y: number; width: number; height: number } | null = null;

    /** Texture upload callback | 纹理上传回调 */
    private _onTextureUpload: TextureUploadCallback | null = null;

    /** Version number (increments on atlas rebuild) | 版本号 */
    public version: number = 0;

    constructor(name: string, config: IDynamicFontConfig) {
        this.name = name;
        this._fontFamily = config.fontFamily;
        this._fontSize = config.fontSize ?? 32;
        this._atlasWidth = config.atlasWidth ?? 1024;
        this._atlasHeight = config.atlasHeight ?? 1024;
        this._padding = config.padding ?? 2;

        // Create canvas
        if (typeof OffscreenCanvas !== 'undefined') {
            this._canvas = new OffscreenCanvas(this._atlasWidth, this._atlasHeight);
        } else {
            this._canvas = document.createElement('canvas');
            this._canvas.width = this._atlasWidth;
            this._canvas.height = this._atlasHeight;
        }

        const ctx = this._canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to create canvas context');
        }
        this._ctx = ctx;

        // Initialize canvas
        this.initCanvas();

        // Measure font metrics
        this.measureMetrics();

        // Preload common characters
        if (config.preloadChars) {
            this.requestCharacters(config.preloadChars);
        }
    }

    /**
     * Set texture upload callback
     * 设置纹理上传回调
     */
    public setTextureUploadCallback(callback: TextureUploadCallback): void {
        this._onTextureUpload = callback;
    }

    /**
     * Get atlas width
     * 获取图集宽度
     */
    public get atlasWidth(): number {
        return this._atlasWidth;
    }

    /**
     * Get atlas height
     * 获取图集高度
     */
    public get atlasHeight(): number {
        return this._atlasHeight;
    }

    /**
     * Get line height
     * 获取行高
     */
    public get lineHeight(): number {
        return this._lineHeight;
    }

    /**
     * Get font size
     * 获取字体大小
     */
    public get fontSize(): number {
        return this._fontSize;
    }

    /**
     * Initialize canvas state
     * 初始化画布状态
     */
    private initCanvas(): void {
        const ctx = this._ctx;

        // Clear to transparent
        ctx.clearRect(0, 0, this._atlasWidth, this._atlasHeight);

        // Set font
        ctx.font = `${this._fontSize}px "${this._fontFamily}"`;
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'white';
    }

    /**
     * Measure font metrics
     * 测量字体度量
     */
    private measureMetrics(): void {
        const ctx = this._ctx;
        ctx.font = `${this._fontSize}px "${this._fontFamily}"`;

        // Measure using a reference character
        const metrics = ctx.measureText('Mgy');

        // Estimate ascent and descent
        this._ascent = this._fontSize * 0.8;
        this._lineHeight = this._fontSize * 1.2;

        // Try to use actual metrics if available
        if ('actualBoundingBoxAscent' in metrics) {
            this._ascent = metrics.actualBoundingBoxAscent;
            const descent = metrics.actualBoundingBoxDescent;
            this._lineHeight = this._ascent + descent + this._padding * 2;
        }
    }

    /**
     * Request characters to be available in the atlas
     * 请求字符在图集中可用
     *
     * Similar to Unity's Font.RequestCharactersInTexture
     */
    public requestCharacters(text: string): void {
        let hasNew = false;

        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);

            // Skip if already cached
            if (this._glyphs.has(charCode)) continue;

            // Skip control characters
            if (charCode < 32 && charCode !== 9 && charCode !== 10 && charCode !== 13) continue;

            // Render the character
            if (this.renderCharacter(charCode)) {
                hasNew = true;
            }
        }

        // Upload texture if needed
        if (hasNew && this._onTextureUpload && this._dirtyRegion) {
            this.uploadTexture();
        }
    }

    /**
     * Render a character to the atlas
     * 将字符渲染到图集
     */
    private renderCharacter(charCode: number): boolean {
        const ctx = this._ctx;
        const char = String.fromCharCode(charCode);

        // Measure character
        ctx.font = `${this._fontSize}px "${this._fontFamily}"`;
        const metrics = ctx.measureText(char);
        const charWidth = Math.ceil(metrics.width);
        const charHeight = Math.ceil(this._lineHeight);

        // Check if we need a new row
        if (this._cursorX + charWidth + this._padding * 2 > this._atlasWidth) {
            this._cursorX = 0;
            this._cursorY += this._rowHeight + this._padding;
            this._rowHeight = 0;
        }

        // Check if we're out of space
        if (this._cursorY + charHeight + this._padding * 2 > this._atlasHeight) {
            console.warn(`[DynamicFont] Atlas full, cannot add character: ${char}`);
            return false;
        }

        const x = this._cursorX + this._padding;
        const y = this._cursorY + this._padding;

        // Render character
        ctx.fillStyle = 'white';
        ctx.fillText(char, x, y);

        // Create glyph info
        const glyph: IDynamicGlyph = {
            charCode,
            x,
            y,
            width: charWidth,
            height: charHeight,
            advance: charWidth,
            baseline: this._ascent
        };

        this._glyphs.set(charCode, glyph);

        // Update cursor
        this._cursorX += charWidth + this._padding * 2;
        this._rowHeight = Math.max(this._rowHeight, charHeight);

        // Mark dirty region
        this.markDirty(x, y, charWidth, charHeight);

        return true;
    }

    /**
     * Mark a region as dirty
     * 标记区域为脏
     */
    private markDirty(x: number, y: number, width: number, height: number): void {
        this._dirty = true;

        if (!this._dirtyRegion) {
            this._dirtyRegion = { x, y, width, height };
        } else {
            const r = this._dirtyRegion;
            const newX = Math.min(r.x, x);
            const newY = Math.min(r.y, y);
            const newWidth = Math.max(r.x + r.width, x + width) - newX;
            const newHeight = Math.max(r.y + r.height, y + height) - newY;
            this._dirtyRegion = { x: newX, y: newY, width: newWidth, height: newHeight };
        }
    }

    /**
     * Upload texture to GPU
     * 上传纹理到 GPU
     */
    private uploadTexture(): void {
        if (!this._dirty || !this._onTextureUpload || !this._dirtyRegion) return;

        const r = this._dirtyRegion;
        const imageData = this._ctx.getImageData(r.x, r.y, r.width, r.height);
        this._onTextureUpload(imageData, r.x, r.y, r.width, r.height);

        this._dirty = false;
        this._dirtyRegion = null;
        this.version++;
    }

    /**
     * Get full canvas image data (for initial upload)
     * 获取完整画布图像数据（用于初始上传）
     */
    public getFullImageData(): ImageData {
        return this._ctx.getImageData(0, 0, this._atlasWidth, this._atlasHeight);
    }

    /**
     * Get glyph info for a character
     * 获取字符的字形信息
     */
    public getGlyph(charCode: number): IDynamicGlyph | undefined {
        return this._glyphs.get(charCode);
    }

    /**
     * Check if character is available
     * 检查字符是否可用
     */
    public hasGlyph(charCode: number): boolean {
        return this._glyphs.has(charCode);
    }

    /**
     * Convert to MSDF-compatible font data
     * 转换为 MSDF 兼容的字体数据
     */
    public toMSDFFontData(): IMSDFFontData {
        const glyphs: IMSDFGlyph[] = [];

        for (const [charCode, glyph] of this._glyphs) {
            glyphs.push({
                unicode: charCode,
                advance: glyph.advance / this._fontSize,
                planeBounds: {
                    left: 0,
                    bottom: -(glyph.height - glyph.baseline) / this._fontSize,
                    right: glyph.width / this._fontSize,
                    top: glyph.baseline / this._fontSize
                },
                atlasBounds: {
                    left: glyph.x,
                    bottom: glyph.y + glyph.height,
                    right: glyph.x + glyph.width,
                    top: glyph.y
                }
            });
        }

        return {
            atlas: {
                type: 'sdf',
                distanceRange: 0, // 0 = bitmap mode
                size: this._fontSize,
                width: this._atlasWidth,
                height: this._atlasHeight,
                yOrigin: 'top'
            },
            metrics: {
                emSize: this._fontSize,
                lineHeight: this._lineHeight / this._fontSize,
                ascender: this._ascent / this._fontSize,
                descender: (this._lineHeight - this._ascent) / this._fontSize
            },
            glyphs
        };
    }

    /**
     * Create and register as MSDFFont
     * 创建并注册为 MSDFFont
     */
    public registerAsMSDFFont(): MSDFFont {
        const fontData = this.toMSDFFontData();
        const font = new MSDFFont(this.name, fontData);
        font.textureId = this.textureId;
        getMSDFFontManager().registerFont(font);
        return font;
    }

    /**
     * Clear atlas and reset
     * 清除图集并重置
     */
    public clear(): void {
        this._glyphs.clear();
        this._cursorX = 0;
        this._cursorY = 0;
        this._rowHeight = 0;
        this.initCanvas();
        this.version++;
    }

    /**
     * Dispose resources
     * 释放资源
     */
    public dispose(): void {
        this._glyphs.clear();
        this._onTextureUpload = null;
    }
}

/**
 * Dynamic Font Manager
 * 动态字体管理器
 */
export class DynamicFontManager {
    /** Managed fonts | 管理的字体 */
    private _fonts: Map<string, DynamicFont> = new Map();

    /**
     * Create a dynamic font
     * 创建动态字体
     */
    public createFont(name: string, config: IDynamicFontConfig): DynamicFont {
        const font = new DynamicFont(name, config);
        this._fonts.set(name, font);
        return font;
    }

    /**
     * Get a font by name
     * 按名称获取字体
     */
    public getFont(name: string): DynamicFont | undefined {
        return this._fonts.get(name);
    }

    /**
     * Remove a font
     * 移除字体
     */
    public removeFont(name: string): void {
        const font = this._fonts.get(name);
        if (font) {
            font.dispose();
            this._fonts.delete(name);
        }
    }

    /**
     * Clear all fonts
     * 清除所有字体
     */
    public clear(): void {
        for (const font of this._fonts.values()) {
            font.dispose();
        }
        this._fonts.clear();
    }
}

/** Global dynamic font manager | 全局动态字体管理器 */
let _dynamicFontManager: DynamicFontManager | null = null;

/**
 * Get global dynamic font manager
 * 获取全局动态字体管理器
 */
export function getDynamicFontManager(): DynamicFontManager {
    if (!_dynamicFontManager) {
        _dynamicFontManager = new DynamicFontManager();
    }
    return _dynamicFontManager;
}

/**
 * Common CJK characters for preloading
 * 常用中日韩字符用于预加载
 */
export const COMMON_CJK_CHARS = '的一是不了在人有我他这个们中来上大为和国地到以说时要就出会可也你对生能而子那得于着下自之年过发后作里用道行所然家种事成方多经么去法学如都同现当没动面起看定天分还进好小部其些主样理心她本前开但因只从想实日军者意无力它与长把机十民第公此已工使情明性知全三又关点正业外将两高间由问很最重并物手应战向头文体政美相见被利什二等产或新己制身果加西斯月话合回特代内信表化老给世位次度门任常先海通教儿原东声提立及比员解水名真论处走义各入几口认条平系气题活尔更别打女变四神总何电数安少报才结反受目太量再感建务做接必场件计管期市直德资命山金指克许统区保至队形社便空决治展马科司五基眼书非则听白却界达光放强即像难且权思王象完设式色路记南品住告类求据程北边死张该交规万取拉格望觉术领共确传师观清今切院让识候带导争运笑飞风步改收根干造言联持组每济车亲极林服快办议往元英士证近失转夫令准布始怎呢存未远叫台单影具罗字爱击流备兵连调深商算质团集百需价花党华城石级整府离况亚请技际约示复病息究线似官火断精满支视消越器容照须九增研写称企八功吗包片史委乎查轻易早曾除农找装广显吧阿李标谈吃图念六引历首医局突专费号尽另周较注语仅考落青随选列武红响虽推势参希古众构房半节土投某案黑维革划敌致陈律足态护七兴派孩验责营星够章音跟志底站严巴例防族供效续施留讲型料终答紧黄绝奇察母京段依批群项故按河米围江织害斗双境客纪采举杀攻父苏密低朝友诉止细愿千值胜责秘倒注';

/**
 * Common ASCII characters for preloading
 * 常用 ASCII 字符用于预加载
 */
export const COMMON_ASCII_CHARS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
