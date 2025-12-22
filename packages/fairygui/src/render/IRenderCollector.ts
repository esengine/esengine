import type { IRectangle } from '../utils/MathTypes';

import type { EGraphType, EAlignType, EVertAlignType } from '../core/FieldTypes';

/**
 * Render primitive type
 * 渲染图元类型
 */
export const enum ERenderPrimitiveType {
    Rect = 'rect',
    Image = 'image',
    Text = 'text',
    Mesh = 'mesh',
    Graph = 'graph',
    Ellipse = 'ellipse',
    Polygon = 'polygon'
}

/**
 * Blend mode
 * 混合模式
 */
export const enum EBlendModeType {
    Normal = 'normal',
    Add = 'add',
    Multiply = 'multiply',
    Screen = 'screen'
}

/**
 * Transform matrix (2D affine)
 * 变换矩阵（2D 仿射）
 */
export interface ITransformMatrix {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
}

/**
 * Text alignment
 * 文本对齐
 */
export const enum ETextAlign {
    Left = 'left',
    Center = 'center',
    Right = 'right'
}

/**
 * Text vertical alignment
 * 文本垂直对齐
 */
export const enum ETextVAlign {
    Top = 'top',
    Middle = 'middle',
    Bottom = 'bottom'
}

/**
 * Render primitive data
 * 渲染图元数据
 */
export interface IRenderPrimitive {
    /** Primitive type | 图元类型 */
    type: ERenderPrimitiveType;

    /** Sort order (higher = on top) | 排序顺序（越大越上层） */
    sortOrder: number;

    /** World matrix (6 elements: a, b, c, d, tx, ty) | 世界矩阵 */
    worldMatrix: Float32Array;

    /** X position | X 坐标 */
    x?: number;

    /** Y position | Y 坐标 */
    y?: number;

    /** Width | 宽度 */
    width: number;

    /** Height | 高度 */
    height: number;

    /** Alpha | 透明度 */
    alpha: number;

    /** Is grayed | 是否灰度 */
    grayed: boolean;

    /** Transform matrix | 变换矩阵 */
    transform?: ITransformMatrix;

    /** Blend mode | 混合模式 */
    blendMode?: EBlendModeType;

    /** Clip rect (in stage coordinates) | 裁剪矩形（舞台坐标） */
    clipRect?: IRectangle;

    /** Source rectangle (for image) | 源矩形（用于图像） */
    srcRect?: IRectangle;

    // Image properties | 图像属性

    /** Texture ID or key | 纹理 ID 或键 */
    textureId?: string | number;

    /** UV rect [u, v, uWidth, vHeight] | UV 矩形 */
    uvRect?: [number, number, number, number];

    /** Tint color (RGBA packed) | 着色颜色 */
    color?: number;

    /** Nine-patch grid | 九宫格 */
    scale9Grid?: IRectangle;

    /** Source width for nine-slice (original texture region width) | 九宫格源宽度（原始纹理区域宽度） */
    sourceWidth?: number;

    /** Source height for nine-slice (original texture region height) | 九宫格源高度（原始纹理区域高度） */
    sourceHeight?: number;

    /** Tile mode | 平铺模式 */
    tileMode?: boolean;

    // Text properties | 文本属性

    /** Text content | 文本内容 */
    text?: string;

    /** Font family | 字体 */
    font?: string;

    /** Font size | 字体大小 */
    fontSize?: number;

    /** Text color | 文本颜色 */
    textColor?: number;

    /** Bold | 粗体 */
    bold?: boolean;

    /** Italic | 斜体 */
    italic?: boolean;

    /** Underline | 下划线 */
    underline?: boolean;

    /** Text align | 文本对齐 */
    align?: ETextAlign | EAlignType;

    /** Text horizontal align (alias) | 文本水平对齐（别名） */
    textAlign?: ETextAlign | string;

    /** Text vertical align | 文本垂直对齐 */
    valign?: ETextVAlign | EVertAlignType;

    /** Text vertical align (alias) | 文本垂直对齐（别名） */
    textVAlign?: ETextVAlign | string;

    /** Leading (line spacing) | 行间距 */
    leading?: number;

    /** Letter spacing | 字间距 */
    letterSpacing?: number;

    /** Outline color | 描边颜色 */
    outlineColor?: number;

    /** Outline width | 描边宽度 */
    outlineWidth?: number;

    /** Shadow color | 阴影颜色 */
    shadowColor?: number;

    /** Shadow offset | 阴影偏移 */
    shadowOffset?: [number, number];

    // Rect properties | 矩形属性

    /** Fill color | 填充颜色 */
    fillColor?: number;

    /** Stroke color | 边框颜色 */
    strokeColor?: number;

    /** Stroke width | 边框宽度 */
    strokeWidth?: number;

    /** Corner radius | 圆角半径 */
    cornerRadius?: number | number[];

    /** Single line | 单行 */
    singleLine?: boolean;

    /** Word wrap | 自动换行 */
    wordWrap?: boolean;

    /** Stroke | 描边宽度 */
    stroke?: number;

    // Graph properties | 图形属性

    /** Graph type | 图形类型 */
    graphType?: EGraphType;

    /** Line size | 线宽 */
    lineSize?: number;

    /** Line color | 线颜色 */
    lineColor?: number;

    /** Polygon points | 多边形顶点 */
    polygonPoints?: number[];

    /** Points array (alias for polygonPoints) | 点数组（polygonPoints 别名） */
    points?: number[];

    /** Line width | 线宽 */
    lineWidth?: number;

    /** Sides for regular polygon | 正多边形边数 */
    sides?: number;

    /** Start angle for regular polygon | 正多边形起始角度 */
    startAngle?: number;

    /** Distance multipliers for regular polygon | 正多边形距离乘数 */
    distances?: number[];

    // Mesh properties | 网格属性

    /** Vertices [x, y, ...] | 顶点 */
    vertices?: Float32Array;

    /** UVs [u, v, ...] | UV 坐标 */
    uvs?: Float32Array;

    /** Indices | 索引 */
    indices?: Uint16Array;
}

/**
 * Render collector interface
 * 渲染收集器接口
 */
export interface IRenderCollector {
    /**
     * Add a render primitive
     * 添加渲染图元
     */
    addPrimitive(primitive: IRenderPrimitive): void;

    /**
     * Push a clip rect
     * 压入裁剪矩形
     */
    pushClipRect(rect: IRectangle): void;

    /**
     * Pop the current clip rect
     * 弹出当前裁剪矩形
     */
    popClipRect(): void;

    /**
     * Get current clip rect
     * 获取当前裁剪矩形
     */
    getCurrentClipRect(): IRectangle | null;

    /**
     * Clear all primitives
     * 清除所有图元
     */
    clear(): void;

    /**
     * Get all primitives (sorted by sortOrder)
     * 获取所有图元（按 sortOrder 排序）
     */
    getPrimitives(): readonly IRenderPrimitive[];
}
