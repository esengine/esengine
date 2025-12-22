/**
 * FGUIRenderDataProvider
 *
 * Converts FairyGUI render primitives to engine render data format.
 * Implements IUIRenderDataProvider for integration with the engine render system.
 *
 * 将 FairyGUI 渲染图元转换为引擎渲染数据格式
 * 实现 IUIRenderDataProvider 以与引擎渲染系统集成
 */

import type { IRenderPrimitive } from './IRenderCollector';
import { ERenderPrimitiveType } from './IRenderCollector';
import type { RenderCollector } from './RenderCollector';
import { Stage } from '../core/Stage';
import { getMSDFFontManager, MSDFFont } from '../text/MSDFFont';
import { getDynamicFontManager } from '../text/DynamicFont';
import { layoutText } from '../text/TextLayout';
import { createTextBatch } from '../text/TextBatch';
import { EAlignType, EVertAlignType, EGraphType } from '../core/FieldTypes';
import { GraphMeshGenerator, type GraphMeshData } from './GraphMeshGenerator';

/**
 * Engine render data format (matches ProviderRenderData from ecs-engine-bindgen)
 * 引擎渲染数据格式（匹配 ecs-engine-bindgen 的 ProviderRenderData）
 */
export interface IEngineRenderData {
    transforms: Float32Array;
    textureIds: Uint32Array;
    uvs: Float32Array;
    colors: Uint32Array;
    tileCount: number;
    sortingLayer: string;
    orderInLayer: number;
    textureGuid?: string;
    bScreenSpace?: boolean;
    clipRect?: { x: number; y: number; width: number; height: number };
}

/**
 * MSDF text render data format
 * MSDF 文本渲染数据格式
 */
export interface ITextRenderData {
    /** Vertex positions [x, y, ...] for each vertex (4 per glyph) | 顶点位置 */
    positions: Float32Array;

    /** Texture coordinates [u, v, ...] for each vertex | 纹理坐标 */
    texCoords: Float32Array;

    /** Colors [r, g, b, a, ...] for each vertex | 颜色 */
    colors: Float32Array;

    /** Outline colors [r, g, b, a, ...] for each vertex | 描边颜色 */
    outlineColors: Float32Array;

    /** Outline widths for each vertex | 描边宽度 */
    outlineWidths: Float32Array;

    /** Font texture ID | 字体纹理 ID */
    textureId: number;

    /** Pixel range for MSDF shader | 着色器像素范围 */
    pxRange: number;

    /** Glyph count | 字形数量 */
    glyphCount: number;
}

/**
 * Mesh render data format for arbitrary 2D geometry
 * 用于任意 2D 几何体的网格渲染数据格式
 */
export interface IMeshRenderData {
    /** Vertex positions [x, y, ...] | 顶点位置 */
    positions: Float32Array;

    /** Texture coordinates [u, v, ...] | 纹理坐标 */
    uvs: Float32Array;

    /** Vertex colors (packed RGBA) | 顶点颜色 */
    colors: Uint32Array;

    /** Triangle indices | 三角形索引 */
    indices: Uint16Array;

    /** Texture ID (0 = white pixel) | 纹理 ID */
    textureId: number;
}

/**
 * Render data provider interface (matches IRenderDataProvider from ecs-engine-bindgen)
 * 渲染数据提供者接口
 */
export interface IFGUIRenderDataProvider {
    getRenderData(): readonly IEngineRenderData[];
    getTextRenderData(): readonly ITextRenderData[];
    getMeshRenderData(): readonly IMeshRenderData[];
}

/**
 * Texture resolver callback
 * 纹理解析回调
 */
export type TextureResolverFn = (textureId: string | number) => number;

/**
 * FGUIRenderDataProvider
 *
 * Converts FairyGUI render collector data to engine render data format.
 *
 * 将 FairyGUI 渲染收集器数据转换为引擎渲染数据格式
 */
export class FGUIRenderDataProvider implements IFGUIRenderDataProvider {
    /** Sorting layer for UI | UI 排序层 */
    private _sortingLayer: string = 'UI';

    /** Order within the sorting layer | 层内排序顺序 */
    private _orderInLayer: number = 0;

    /** Render collector reference | 渲染收集器引用 */
    private _collector: RenderCollector | null = null;

    /** Texture resolver function | 纹理解析函数 */
    private _textureResolver: TextureResolverFn | null = null;

    /** Cached render data | 缓存的渲染数据 */
    private _cachedData: IEngineRenderData[] = [];

    /** Cached text render data | 缓存的文本渲染数据 */
    private _cachedTextData: ITextRenderData[] = [];

    /** Cached mesh render data | 缓存的网格渲染数据 */
    private _cachedMeshData: IMeshRenderData[] = [];

    /** Default texture ID when texture not found | 找不到纹理时的默认纹理 ID */
    private _defaultTextureId: number = 0;

    /** Canvas width for coordinate conversion | 画布宽度，用于坐标转换 */
    private _canvasWidth: number = 0;

    /** Canvas height for coordinate conversion | 画布高度，用于坐标转换 */
    private _canvasHeight: number = 0;

    /**
     * Set the render collector
     * 设置渲染收集器
     */
    public setCollector(collector: RenderCollector): void {
        this._collector = collector;
    }

    /**
     * Set sorting layer and order
     * 设置排序层和顺序
     */
    public setSorting(layer: string, order: number): void {
        this._sortingLayer = layer;
        this._orderInLayer = order;
    }

    /**
     * Set texture resolver function
     * 设置纹理解析函数
     */
    public setTextureResolver(resolver: TextureResolverFn): void {
        this._textureResolver = resolver;
    }

    /**
     * Set default texture ID
     * 设置默认纹理 ID
     */
    public setDefaultTextureId(id: number): void {
        this._defaultTextureId = id;
    }

    /**
     * Set canvas size for coordinate conversion
     * 设置画布尺寸，用于坐标转换
     *
     * FGUI uses top-left origin with Y-down coordinate system.
     * Engine uses center origin with visible area [-width/2, width/2] and [-height/2, height/2].
     *
     * FGUI 使用左上角为原点、Y 轴向下的坐标系统。
     * 引擎使用中心为原点，可见区域为 [-width/2, width/2] 和 [-height/2, height/2]。
     */
    public setCanvasSize(width: number, height: number): void {
        this._canvasWidth = width;
        this._canvasHeight = height;
    }

    /**
     * Get effective canvas size for coordinate conversion
     * Uses Stage.designWidth/designHeight as fallback if not explicitly set
     *
     * 获取坐标转换的有效画布尺寸
     * 如果未显式设置，则使用 Stage.designWidth/designHeight 作为回退
     */
    private getEffectiveCanvasSize(): { width: number; height: number } {
        if (this._canvasWidth > 0 && this._canvasHeight > 0) {
            return { width: this._canvasWidth, height: this._canvasHeight };
        }

        // Fallback to Stage design size
        // 回退到 Stage 设计尺寸
        const stage = Stage.inst;
        return {
            width: stage.designWidth,
            height: stage.designHeight
        };
    }

    /**
     * Get render data for the engine
     * 获取引擎渲染数据
     */
    public getRenderData(): readonly IEngineRenderData[] {
        if (!this._collector) {
            return [];
        }

        const primitives = this._collector.getPrimitives();

        if (primitives.length === 0) {
            return [];
        }

        this._cachedData.length = 0;

        // Group primitives by texture for batching
        const batches = this.groupByTexture(primitives);

        for (const [_textureKey, batch] of batches) {
            const renderData = this.convertBatch(batch);
            if (renderData) {
                this._cachedData.push(renderData);
            }
        }

        return this._cachedData;
    }

    /**
     * Get text render data for the engine
     * 获取引擎文本渲染数据
     *
     * Note: MSDF text rendering requires font atlas to be loaded.
     * Text primitives are converted to MSDF glyph batches.
     *
     * 注意：MSDF 文本渲染需要加载字体图集。
     * 文本图元被转换为 MSDF 字形批次。
     */
    public getTextRenderData(): readonly ITextRenderData[] {
        if (!this._collector) {
            return [];
        }

        const primitives = this._collector.getPrimitives();
        this._cachedTextData.length = 0;

        // Get canvas size for coordinate conversion
        const canvasSize = this.getEffectiveCanvasSize();
        const halfWidth = canvasSize.width / 2;
        const halfHeight = canvasSize.height / 2;

        // Get font managers
        const msdfFontManager = getMSDFFontManager();
        const dynamicFontManager = getDynamicFontManager();

        // Group text primitives by font for batching
        const textBatches = new Map<string, IRenderPrimitive[]>();

        for (const primitive of primitives) {
            if (primitive.type !== ERenderPrimitiveType.Text) continue;
            if (!primitive.text) continue;

            const fontName = primitive.font || '';
            let batch = textBatches.get(fontName);
            if (!batch) {
                batch = [];
                textBatches.set(fontName, batch);
            }
            batch.push(primitive);
        }

        // Convert each font batch to render data
        for (const [fontName, batch] of textBatches) {
            // Try MSDF font first
            let font: MSDFFont | undefined = msdfFontManager.getFont(fontName);

            // Try dynamic font if MSDF not available
            if (!font) {
                // Try exact name first, then fallback to 'default'
                let dynamicFont = dynamicFontManager.getFont(fontName);
                if (!dynamicFont && fontName !== 'default') {
                    dynamicFont = dynamicFontManager.getFont('default');
                }

                if (dynamicFont) {
                    // Request characters for all text in this batch
                    for (const primitive of batch) {
                        if (primitive.text) {
                            dynamicFont.requestCharacters(primitive.text);
                        }
                    }
                    // Register as MSDF font if not already
                    font = msdfFontManager.getFont(dynamicFont.name);
                    if (!font) {
                        font = dynamicFont.registerAsMSDFFont();
                    }
                }
            }

            if (!font) {
                // Skip if no font available - will fall back to DOM renderer
                continue;
            }

            for (const primitive of batch) {
                const textRenderData = this.convertTextPrimitive(
                    primitive,
                    font,
                    halfWidth,
                    halfHeight
                );
                if (textRenderData) {
                    this._cachedTextData.push(textRenderData);
                }
            }
        }

        return this._cachedTextData;
    }

    /**
     * Get mesh render data for the engine
     * 获取引擎网格渲染数据
     *
     * Used for rendering complex shapes like ellipses, polygons, etc.
     * 用于渲染椭圆、多边形等复杂形状
     */
    public getMeshRenderData(): readonly IMeshRenderData[] {
        if (!this._collector) {
            return [];
        }

        const primitives = this._collector.getPrimitives();
        this._cachedMeshData.length = 0;

        // Get canvas size for coordinate conversion
        const canvasSize = this.getEffectiveCanvasSize();
        const halfWidth = canvasSize.width / 2;
        const halfHeight = canvasSize.height / 2;

        for (const primitive of primitives) {
            if (primitive.type !== ERenderPrimitiveType.Graph) continue;

            const graphType = primitive.graphType;

            // Skip simple rectangles - they're handled by getRenderData using white pixel
            if (graphType === EGraphType.Rect) continue;

            // Generate mesh for complex shapes
            const meshData = this.generateGraphMesh(primitive, halfWidth, halfHeight);
            if (meshData) {
                this._cachedMeshData.push(meshData);
            }

            // Generate outline mesh if needed
            if (primitive.lineSize && primitive.lineSize > 0) {
                const outlineMesh = this.generateGraphOutlineMesh(primitive, halfWidth, halfHeight);
                if (outlineMesh) {
                    this._cachedMeshData.push(outlineMesh);
                }
            }
        }

        return this._cachedMeshData;
    }

    /**
     * Generate mesh data for a graph primitive
     * 为图形图元生成网格数据
     */
    private generateGraphMesh(
        primitive: IRenderPrimitive,
        halfWidth: number,
        halfHeight: number
    ): IMeshRenderData | null {
        const graphType = primitive.graphType;
        const width = primitive.width;
        const height = primitive.height;
        const fillColor = primitive.fillColor ?? 0xFFFFFFFF;

        let meshData: GraphMeshData | null = null;

        switch (graphType) {
            case EGraphType.Ellipse:
                meshData = GraphMeshGenerator.generateEllipse(width, height, fillColor);
                break;
            case EGraphType.Polygon:
                if (primitive.polygonPoints) {
                    meshData = GraphMeshGenerator.generatePolygon(
                        primitive.polygonPoints,
                        width,
                        height,
                        fillColor
                    );
                }
                break;
            case EGraphType.RegularPolygon:
                // Generate regular polygon points
                const sides = primitive.sides ?? 6;
                const points = this.generateRegularPolygonPoints(width, height, sides);
                meshData = GraphMeshGenerator.generatePolygon(points, width, height, fillColor);
                break;
        }

        if (!meshData || meshData.positions.length === 0) {
            return null;
        }

        // Get world position from matrix
        const m = primitive.worldMatrix;
        const baseX = m ? m[4] : 0;
        const baseY = m ? m[5] : 0;

        // Convert FGUI coordinates to engine coordinates
        const engineBaseX = baseX - halfWidth;
        const engineBaseY = halfHeight - baseY;

        // Apply coordinate transformation to positions
        const positions = new Float32Array(meshData.positions.length);
        for (let i = 0; i < meshData.positions.length; i += 2) {
            positions[i] = meshData.positions[i] + engineBaseX;
            // Flip Y for engine coordinate system
            positions[i + 1] = engineBaseY - meshData.positions[i + 1];
        }

        return {
            positions,
            uvs: new Float32Array(meshData.uvs),
            colors: new Uint32Array(meshData.colors),
            indices: new Uint16Array(meshData.indices),
            textureId: 0 // White pixel texture
        };
    }

    /**
     * Generate outline mesh data for a graph primitive
     * 为图形图元生成轮廓网格数据
     */
    private generateGraphOutlineMesh(
        primitive: IRenderPrimitive,
        halfWidth: number,
        halfHeight: number
    ): IMeshRenderData | null {
        const graphType = primitive.graphType;
        const width = primitive.width;
        const height = primitive.height;
        const lineWidth = primitive.lineSize ?? 1;
        const lineColor = primitive.lineColor ?? 0x000000FF;

        let meshData: GraphMeshData | null = null;

        switch (graphType) {
            case EGraphType.Ellipse:
                meshData = GraphMeshGenerator.generateEllipseOutline(width, height, lineWidth, lineColor);
                break;
            case EGraphType.Polygon:
                if (primitive.polygonPoints) {
                    meshData = GraphMeshGenerator.generateOutline(
                        primitive.polygonPoints,
                        lineWidth,
                        lineColor,
                        true
                    );
                }
                break;
            case EGraphType.RegularPolygon:
                const sides = primitive.sides ?? 6;
                const points = this.generateRegularPolygonPoints(width, height, sides);
                meshData = GraphMeshGenerator.generateOutline(points, lineWidth, lineColor, true);
                break;
        }

        if (!meshData || meshData.positions.length === 0) {
            return null;
        }

        // Get world position from matrix
        const m = primitive.worldMatrix;
        const baseX = m ? m[4] : 0;
        const baseY = m ? m[5] : 0;

        // Convert FGUI coordinates to engine coordinates
        const engineBaseX = baseX - halfWidth;
        const engineBaseY = halfHeight - baseY;

        // Apply coordinate transformation to positions
        const positions = new Float32Array(meshData.positions.length);
        for (let i = 0; i < meshData.positions.length; i += 2) {
            positions[i] = meshData.positions[i] + engineBaseX;
            positions[i + 1] = engineBaseY - meshData.positions[i + 1];
        }

        return {
            positions,
            uvs: new Float32Array(meshData.uvs),
            colors: new Uint32Array(meshData.colors),
            indices: new Uint16Array(meshData.indices),
            textureId: 0 // White pixel texture
        };
    }

    /**
     * Generate points for a regular polygon
     * 生成正多边形的点
     */
    private generateRegularPolygonPoints(width: number, height: number, sides: number): number[] {
        const points: number[] = [];
        const centerX = width / 2;
        const centerY = height / 2;
        const radiusX = width / 2;
        const radiusY = height / 2;
        const angleStep = (Math.PI * 2) / sides;
        const startAngle = -Math.PI / 2; // Start from top

        for (let i = 0; i < sides; i++) {
            const angle = startAngle + angleStep * i;
            points.push(
                centerX + Math.cos(angle) * radiusX,
                centerY + Math.sin(angle) * radiusY
            );
        }

        return points;
    }

    /**
     * Convert a text primitive to MSDF render data
     * 将文本图元转换为 MSDF 渲染数据
     */
    private convertTextPrimitive(
        primitive: IRenderPrimitive,
        font: MSDFFont,
        halfWidth: number,
        halfHeight: number
    ): ITextRenderData | null {
        const text = primitive.text;
        if (!text) return null;

        // Get text properties
        const fontSize = primitive.fontSize ?? 12;
        const maxWidth = primitive.width;
        const maxHeight = primitive.height;

        // Convert alignment types
        let align = EAlignType.Left;
        if (primitive.align !== undefined) {
            align = typeof primitive.align === 'string'
                ? this.parseHAlign(primitive.align)
                : primitive.align;
        } else if (primitive.textAlign !== undefined) {
            align = this.parseHAlign(primitive.textAlign as string);
        }

        let valign = EVertAlignType.Top;
        if (primitive.valign !== undefined) {
            valign = typeof primitive.valign === 'string'
                ? this.parseVAlign(primitive.valign)
                : primitive.valign;
        } else if (primitive.textVAlign !== undefined) {
            valign = this.parseVAlign(primitive.textVAlign as string);
        }

        // Layout text
        const layoutResult = layoutText({
            font,
            text,
            fontSize,
            maxWidth,
            maxHeight,
            align,
            valign,
            lineHeight: 1.2,
            letterSpacing: primitive.letterSpacing ?? 0,
            wordWrap: primitive.wordWrap ?? false,
            singleLine: primitive.singleLine ?? false
        });

        if (layoutResult.glyphs.length === 0) {
            return null;
        }

        // Get world position from matrix
        const m = primitive.worldMatrix;
        const baseX = m ? m[4] : (primitive.x ?? 0);
        const baseY = m ? m[5] : (primitive.y ?? 0);

        // Convert FGUI coordinates to engine coordinates
        // FGUI: top-left origin, Y-down
        // Engine: center origin, Y-up
        const engineBaseX = baseX - halfWidth;
        const engineBaseY = halfHeight - baseY;

        // Get text color
        const textColor = primitive.textColor ?? primitive.color ?? 0xFFFFFFFF;

        // Create text batch with coordinate offset
        const batchData = createTextBatch(
            layoutResult.glyphs,
            font.textureId,
            font.pxRange,
            {
                color: textColor,
                alpha: primitive.alpha,
                outlineColor: primitive.outlineColor,
                outlineWidth: primitive.outlineWidth ?? primitive.stroke,
                offsetX: engineBaseX,
                offsetY: engineBaseY
            }
        );

        // Convert Y coordinates (flip for engine coordinate system)
        // The batch was created in FGUI Y-down space, need to flip
        this.flipTextYCoordinates(batchData.positions, engineBaseY);

        return {
            positions: batchData.positions,
            texCoords: batchData.texCoords,
            colors: batchData.colors,
            outlineColors: batchData.outlineColors,
            outlineWidths: batchData.outlineWidths,
            textureId: batchData.textureId,
            pxRange: batchData.pxRange,
            glyphCount: batchData.glyphCount
        };
    }

    /**
     * Flip Y coordinates for engine coordinate system
     * 翻转 Y 坐标以适配引擎坐标系
     */
    private flipTextYCoordinates(positions: Float32Array, baseY: number): void {
        // Each glyph has 4 vertices, each vertex has 2 floats (x, y)
        // Flip Y: newY = baseY - (y - baseY) = 2 * baseY - y
        // But since we already offset, we just negate the Y relative to base
        for (let i = 1; i < positions.length; i += 2) {
            // Y is at odd indices
            // Convert from Y-down to Y-up by negating the local Y offset
            positions[i] = baseY - (positions[i] - baseY);
        }
    }

    /**
     * Parse horizontal alignment string
     * 解析水平对齐字符串
     */
    private parseHAlign(align: string): EAlignType {
        switch (align.toLowerCase()) {
            case 'center': return EAlignType.Center;
            case 'right': return EAlignType.Right;
            default: return EAlignType.Left;
        }
    }

    /**
     * Parse vertical alignment string
     * 解析垂直对齐字符串
     */
    private parseVAlign(align: string): EVertAlignType {
        switch (align.toLowerCase()) {
            case 'middle': return EVertAlignType.Middle;
            case 'bottom': return EVertAlignType.Bottom;
            default: return EVertAlignType.Top;
        }
    }

    /**
     * Group primitives by texture for batching
     * 按纹理分组图元以进行批处理
     */
    private groupByTexture(primitives: readonly IRenderPrimitive[]): Map<string | number | undefined, IRenderPrimitive[]> {
        const batches = new Map<string | number | undefined, IRenderPrimitive[]>();

        for (const primitive of primitives) {
            // Handle image primitives
            // 处理图像图元
            if (primitive.type === ERenderPrimitiveType.Image) {
                const key = primitive.textureId ?? 'none';
                let batch = batches.get(key);
                if (!batch) {
                    batch = [];
                    batches.set(key, batch);
                }

                // Expand nine-slice primitives into 9 sub-primitives
                // 将九宫格图元展开为 9 个子图元
                if (primitive.scale9Grid) {
                    const subPrimitives = this.expandScale9Grid(primitive);
                    batch.push(...subPrimitives);
                } else {
                    batch.push(primitive);
                }
            }
            // Handle graph primitives (rect, ellipse, polygon)
            // 处理图形图元（矩形、椭圆、多边形）
            else if (primitive.type === ERenderPrimitiveType.Graph) {
                // Use special key for graph primitives (white pixel texture)
                // 为图形图元使用特殊键（白色像素纹理）
                const key = '__fgui_white_pixel__';
                let batch = batches.get(key);
                if (!batch) {
                    batch = [];
                    batches.set(key, batch);
                }

                // Convert graph fill to primitive for rendering
                // 将图形填充转换为图元进行渲染
                const fillPrimitive = this.convertGraphToPrimitive(primitive);
                if (fillPrimitive) {
                    batch.push(fillPrimitive);
                }

                // Generate outline (stroke) if lineSize > 0
                // 如果 lineSize > 0，生成轮廓线（描边）
                if (primitive.lineSize && primitive.lineSize > 0) {
                    const outlinePrimitives = this.convertGraphOutlineToPrimitive(primitive);
                    batch.push(...outlinePrimitives);
                }
            }
        }

        return batches;
    }

    /**
     * Convert a graph primitive to image-like primitives for rendering
     * 将图形图元转换为类似图像的图元进行渲染
     *
     * Currently supports only filled rectangles using a white pixel texture.
     * Ellipse, polygon, and rounded rectangles require mesh rendering support
     * which needs to be added to the engine.
     *
     * 目前只支持使用白色像素纹理的填充矩形
     * 椭圆、多边形和圆角矩形需要网格渲染支持，需要在引擎中添加
     */
    private convertGraphToPrimitive(primitive: IRenderPrimitive): IRenderPrimitive | null {
        const graphType = primitive.graphType;

        // Only support simple filled rectangles for now
        // Other shapes (ellipse, polygon, rounded rect) need mesh rendering support in the engine
        // 目前只支持简单填充矩形
        // 其他形状（椭圆、多边形、圆角矩形）需要引擎中的网格渲染支持
        if (graphType !== EGraphType.Rect) {
            // TODO: Add mesh batch rendering to engine for complex shapes
            // TODO: 在引擎中添加网格批处理渲染以支持复杂形状
            return null;
        }

        // Simple filled rectangle - use white pixel texture with fillColor
        // 简单填充矩形 - 使用白色像素纹理配合 fillColor
        return {
            type: ERenderPrimitiveType.Image,
            sortOrder: primitive.sortOrder,
            worldMatrix: primitive.worldMatrix,
            width: primitive.width,
            height: primitive.height,
            alpha: primitive.alpha,
            grayed: primitive.grayed,
            blendMode: primitive.blendMode,
            clipRect: primitive.clipRect,
            textureId: '__fgui_white_pixel__',
            uvRect: [0, 0, 1, 1],
            color: primitive.fillColor ?? 0xFFFFFFFF
        };
    }

    /**
     * Convert graph outline to primitive for rendering
     * 将图形轮廓线转换为图元进行渲染
     *
     * Currently only supports rectangle outlines (rendered as 4 thin rectangles).
     * Other shapes need mesh rendering support in the engine.
     *
     * 目前只支持矩形轮廓（渲染为 4 个细矩形）
     * 其他形状需要引擎中的网格渲染支持
     */
    private convertGraphOutlineToPrimitive(primitive: IRenderPrimitive): IRenderPrimitive[] {
        const graphType = primitive.graphType;

        // Only support rectangle outlines for now
        // 目前只支持矩形轮廓
        if (graphType !== EGraphType.Rect) {
            return [];
        }

        const lineWidth = primitive.lineSize ?? 1;
        const lineColor = primitive.lineColor ?? 0x000000FF;
        const width = primitive.width;
        const height = primitive.height;

        // Get position from world matrix
        const m = primitive.worldMatrix;
        const baseX = m ? m[4] : 0;
        const baseY = m ? m[5] : 0;

        const result: IRenderPrimitive[] = [];

        // Create 4 thin rectangles for the outline
        // Top edge
        result.push(this.createOutlineRect(baseX, baseY, width, lineWidth, lineColor, primitive));
        // Bottom edge
        result.push(this.createOutlineRect(baseX, baseY + height - lineWidth, width, lineWidth, lineColor, primitive));
        // Left edge (excluding corners already covered by top/bottom)
        result.push(this.createOutlineRect(baseX, baseY + lineWidth, lineWidth, height - lineWidth * 2, lineColor, primitive));
        // Right edge
        result.push(this.createOutlineRect(baseX + width - lineWidth, baseY + lineWidth, lineWidth, height - lineWidth * 2, lineColor, primitive));

        return result;
    }

    /**
     * Create a single outline rectangle primitive
     * 创建单个轮廓矩形图元
     */
    private createOutlineRect(
        x: number,
        y: number,
        width: number,
        height: number,
        color: number,
        source: IRenderPrimitive
    ): IRenderPrimitive {
        // Create new world matrix with the position
        const matrix = new Float32Array(6);
        matrix[0] = 1;
        matrix[1] = 0;
        matrix[2] = 0;
        matrix[3] = 1;
        matrix[4] = x;
        matrix[5] = y;

        return {
            type: ERenderPrimitiveType.Image,
            sortOrder: source.sortOrder + 0.1,
            worldMatrix: matrix,
            width,
            height,
            alpha: source.alpha,
            grayed: source.grayed,
            blendMode: source.blendMode,
            clipRect: source.clipRect,
            textureId: '__fgui_white_pixel__',
            uvRect: [0, 0, 1, 1],
            color
        };
    }

    /**
     * Expand a nine-slice primitive into 9 sub-primitives
     * 将九宫格图元展开为 9 个子图元
     *
     * Nine-slice grid divides the image into 9 regions:
     * +-------+---------------+-------+
     * |   0   |       1       |   2   |  (top row)
     * | (TL)  |     (TC)      |  (TR) |
     * +-------+---------------+-------+
     * |   3   |       4       |   5   |  (middle row)
     * | (ML)  |    (center)   |  (MR) |
     * +-------+---------------+-------+
     * |   6   |       7       |   8   |  (bottom row)
     * | (BL)  |     (BC)      |  (BR) |
     * +-------+---------------+-------+
     *
     * Corners (0,2,6,8): Keep original size
     * Edges (1,3,5,7): Stretch in one direction
     * Center (4): Stretch in both directions
     */
    private expandScale9Grid(primitive: IRenderPrimitive): IRenderPrimitive[] {
        const grid = primitive.scale9Grid!;
        const result: IRenderPrimitive[] = [];

        // Source dimensions (original texture region)
        // 源尺寸（原始纹理区域）
        const srcWidth = primitive.sourceWidth ?? primitive.width;
        const srcHeight = primitive.sourceHeight ?? primitive.height;

        // Grid boundaries in source space
        // 源空间中的九宫格边界
        const left = grid.x;
        const top = grid.y;
        const right = grid.x + grid.width;
        const bottom = grid.y + grid.height;

        // Target dimensions (stretched)
        // 目标尺寸（拉伸后）
        const targetWidth = primitive.width;
        const targetHeight = primitive.height;

        // Calculate stretched middle section sizes
        const cornerLeftWidth = left;
        const cornerRightWidth = srcWidth - right;
        const cornerTopHeight = top;
        const cornerBottomHeight = srcHeight - bottom;

        // Middle section in target space
        const middleWidth = Math.max(0, targetWidth - cornerLeftWidth - cornerRightWidth);
        const middleHeight = Math.max(0, targetHeight - cornerTopHeight - cornerBottomHeight);

        // UV coordinates from primitive
        const uvRect = primitive.uvRect || [0, 0, 1, 1];
        const u0 = uvRect[0];
        const v0 = uvRect[1];
        const u1 = uvRect[2];
        const v1 = uvRect[3];

        // Calculate UV deltas per pixel
        const uPerPixel = (u1 - u0) / srcWidth;
        const vPerPixel = (v1 - v0) / srcHeight;

        // UV boundaries for nine-slice
        const uLeft = u0 + left * uPerPixel;
        const uRight = u0 + right * uPerPixel;
        const vTop = v0 + top * vPerPixel;
        const vBottom = v0 + bottom * vPerPixel;

        // World matrix for positioning
        const m = primitive.worldMatrix;
        const baseX = m ? m[4] : (primitive.x ?? 0);
        const baseY = m ? m[5] : (primitive.y ?? 0);

        // Extract scale from matrix
        const matrixScaleX = m ? Math.sqrt(m[0] * m[0] + m[1] * m[1]) : 1;
        const matrixScaleY = m ? Math.sqrt(m[2] * m[2] + m[3] * m[3]) : 1;

        // Helper to create a sub-primitive
        const createSubPrimitive = (
            offsetX: number,
            offsetY: number,
            width: number,
            height: number,
            uvX0: number,
            uvY0: number,
            uvX1: number,
            uvY1: number
        ): IRenderPrimitive | null => {
            if (width <= 0 || height <= 0) return null;

            // Create new world matrix with offset position
            const subMatrix = new Float32Array(6);
            if (m) {
                subMatrix[0] = m[0];
                subMatrix[1] = m[1];
                subMatrix[2] = m[2];
                subMatrix[3] = m[3];
                // Apply offset in local space, then transform
                subMatrix[4] = baseX + offsetX * matrixScaleX;
                subMatrix[5] = baseY + offsetY * matrixScaleY;
            } else {
                subMatrix[0] = 1;
                subMatrix[1] = 0;
                subMatrix[2] = 0;
                subMatrix[3] = 1;
                subMatrix[4] = baseX + offsetX;
                subMatrix[5] = baseY + offsetY;
            }

            return {
                type: primitive.type,
                sortOrder: primitive.sortOrder,
                worldMatrix: subMatrix,
                width: width,
                height: height,
                alpha: primitive.alpha,
                grayed: primitive.grayed,
                blendMode: primitive.blendMode,
                clipRect: primitive.clipRect,
                textureId: primitive.textureId,
                uvRect: [uvX0, uvY0, uvX1, uvY1],
                color: primitive.color
            };
        };

        // Row positions (Y offsets)
        const rowY = [0, cornerTopHeight, cornerTopHeight + middleHeight];
        // Row heights
        const rowH = [cornerTopHeight, middleHeight, cornerBottomHeight];
        // Row UV Y coordinates
        const rowUV = [
            [v0, vTop],
            [vTop, vBottom],
            [vBottom, v1]
        ];

        // Column positions (X offsets)
        const colX = [0, cornerLeftWidth, cornerLeftWidth + middleWidth];
        // Column widths
        const colW = [cornerLeftWidth, middleWidth, cornerRightWidth];
        // Column UV X coordinates
        const colUV = [
            [u0, uLeft],
            [uLeft, uRight],
            [uRight, u1]
        ];

        // Generate 9 sub-primitives
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const sub = createSubPrimitive(
                    colX[col],
                    rowY[row],
                    colW[col],
                    rowH[row],
                    colUV[col][0],
                    rowUV[row][0],
                    colUV[col][1],
                    rowUV[row][1]
                );
                if (sub) {
                    result.push(sub);
                }
            }
        }

        return result;
    }

    /**
     * Convert a batch of primitives to engine render data
     * 将一批图元转换为引擎渲染数据
     */
    private convertBatch(batch: IRenderPrimitive[]): IEngineRenderData | null {
        if (batch.length === 0) return null;

        const tileCount = batch.length;

        // Allocate arrays
        // Transform: [x, y, rotation, scaleX, scaleY, originX, originY] per tile (7 floats)
        const transforms = new Float32Array(tileCount * 7);
        const textureIds = new Uint32Array(tileCount);
        const uvs = new Float32Array(tileCount * 4); // [u, v, uWidth, vHeight] per tile
        const colors = new Uint32Array(tileCount);

        let clipRect: { x: number; y: number; width: number; height: number } | undefined;

        // Get effective canvas size for coordinate conversion
        // 获取坐标转换的有效画布尺寸
        const canvasSize = this.getEffectiveCanvasSize();
        const halfWidth = canvasSize.width / 2;
        const halfHeight = canvasSize.height / 2;

        for (let i = 0; i < tileCount; i++) {
            const primitive = batch[i];
            const baseTransformIdx = i * 7;
            const baseUvIdx = i * 4;

            // Extract transform from world matrix
            // Convert from FGUI coordinate system (top-left origin, Y-down)
            // to engine coordinate system (center origin, Y-up)
            //
            // FGUI: (0, 0) = top-left, Y increases downward
            // Engine: (0, 0) = center, Y increases upward
            //
            // Conversion formula:
            //   engineX = fguiX - canvasWidth/2
            //   engineY = canvasHeight/2 - fguiY  (flip Y and offset)
            //
            // 从 FGUI 坐标系（左上角原点，Y 向下）转换到引擎坐标系（中心原点，Y 向上）

            const m = primitive.worldMatrix;
            if (m) {
                // Convert position from FGUI to engine coordinates
                // 将位置从 FGUI 坐标转换为引擎坐标
                transforms[baseTransformIdx + 0] = m[4] - halfWidth;
                transforms[baseTransformIdx + 1] = halfHeight - m[5];  // Flip Y: halfHeight - fguiY

                // Extract rotation from matrix (negate for Y-flip)
                // 从矩阵提取旋转（因 Y 翻转而取反）
                transforms[baseTransformIdx + 2] = -Math.atan2(m[1], m[0]);

                // Extract scale from matrix and multiply by sprite dimensions
                const matrixScaleX = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
                const matrixScaleY = Math.sqrt(m[2] * m[2] + m[3] * m[3]);
                transforms[baseTransformIdx + 3] = matrixScaleX * primitive.width;
                transforms[baseTransformIdx + 4] = matrixScaleY * primitive.height;

                // Origin: In FGUI, position refers to top-left corner of the sprite
                // In engine Y-up system: origin (0, 1) = top-left corner
                // The sprite extends from position downward (negative Y in engine)
                // 原点：在 FGUI 中，位置指精灵的左上角
                // 在引擎 Y 向上坐标系中：origin (0, 1) = 左上角
                // 精灵从位置点向下延伸（引擎中 Y 负方向）
                transforms[baseTransformIdx + 5] = 0;   // originX: left
                transforms[baseTransformIdx + 6] = 1;   // originY: top
            } else {
                // Use position and dimensions directly (fallback path)
                // 直接使用位置和尺寸（回退路径）
                const x = primitive.x ?? 0;
                const y = primitive.y ?? 0;
                transforms[baseTransformIdx + 0] = x - halfWidth;
                transforms[baseTransformIdx + 1] = halfHeight - y;  // Flip Y
                transforms[baseTransformIdx + 2] = 0;
                transforms[baseTransformIdx + 3] = primitive.width;
                transforms[baseTransformIdx + 4] = primitive.height;
                transforms[baseTransformIdx + 5] = 0;   // originX: left
                transforms[baseTransformIdx + 6] = 1;   // originY: top
            }

            // Resolve texture ID
            if (this._textureResolver && primitive.textureId !== undefined) {
                textureIds[i] = this._textureResolver(primitive.textureId);
            } else {
                textureIds[i] = this._defaultTextureId;
            }

            // UVs - engine expects [u0, v0, u1, v1] format in image coordinate system
            // Engine vertex layout maps tex_coords as:
            //   vertex 0 (top-left)     -> [u0, v0]
            //   vertex 1 (top-right)    -> [u1, v0]
            //   vertex 2 (bottom-right) -> [u1, v1]
            //   vertex 3 (bottom-left)  -> [u0, v1]
            // This means v0 = top, v1 = bottom (image coordinate system, NOT OpenGL)
            // FGUI sprite.rect uses image coordinates (y=0 at top), so no flip needed
            //
            // UV 格式：引擎期望图片坐标系的 [u0, v0, u1, v1]
            // 引擎顶点布局将纹理坐标映射为：v0 = 顶部，v1 = 底部（图片坐标系）
            // FGUI 的 sprite.rect 使用图片坐标（y=0 在顶部），所以不需要翻转
            if (primitive.uvRect) {
                uvs[baseUvIdx + 0] = primitive.uvRect[0];  // u0
                uvs[baseUvIdx + 1] = primitive.uvRect[1];  // v0 (top)
                uvs[baseUvIdx + 2] = primitive.uvRect[2];  // u1
                uvs[baseUvIdx + 3] = primitive.uvRect[3];  // v1 (bottom)
            } else {
                // Default full UV
                uvs[baseUvIdx + 0] = 0;
                uvs[baseUvIdx + 1] = 0;
                uvs[baseUvIdx + 2] = 1;
                uvs[baseUvIdx + 3] = 1;
            }

            // Color (0xRRGGBBAA format)
            if (primitive.color !== undefined) {
                colors[i] = primitive.color;
            } else {
                // White with alpha (0xRRGGBBAA)
                const alpha = Math.floor(primitive.alpha * 255);
                colors[i] = (255 << 24) | (255 << 16) | (255 << 8) | alpha;
            }

            // Clip rect (use first primitive's clip rect for the batch)
            if (!clipRect && primitive.clipRect) {
                clipRect = {
                    x: primitive.clipRect.x,
                    y: primitive.clipRect.y,
                    width: primitive.clipRect.width,
                    height: primitive.clipRect.height
                };
            }
        }

        return {
            transforms,
            textureIds,
            uvs,
            colors,
            tileCount,
            sortingLayer: this._sortingLayer,
            orderInLayer: this._orderInLayer,
            bScreenSpace: true, // FairyGUI always renders in screen space
            clipRect
        };
    }
}

/**
 * Create a default FGUI render data provider
 * 创建默认的 FGUI 渲染数据提供者
 */
export function createFGUIRenderDataProvider(): FGUIRenderDataProvider {
    return new FGUIRenderDataProvider();
}
