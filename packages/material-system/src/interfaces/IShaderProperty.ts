/**
 * Shader property interfaces for ES Engine.
 * ES引擎着色器属性接口。
 *
 * This module provides interfaces for defining shader property metadata,
 * enabling automatic Inspector UI generation for material editing.
 * 此模块提供用于定义着色器属性元数据的接口，
 * 实现材质编辑的自动 Inspector UI 生成。
 *
 * @packageDocumentation
 */

/**
 * Shader property types.
 * 着色器属性类型。
 */
export type ShaderPropertyType =
    | 'float'
    | 'int'
    | 'vec2'
    | 'vec3'
    | 'vec4'
    | 'color'
    | 'texture';

/**
 * UI hint for property display.
 * 属性显示的 UI 提示。
 */
export type ShaderPropertyHint =
    | 'range'      // Show as slider | 显示为滑块
    | 'angle'      // Show as angle picker (degrees) | 显示为角度选择器（度）
    | 'hdr'        // HDR color picker | HDR 颜色选择器
    | 'normal'     // Normal map preview | 法线贴图预览
    | 'default';   // Default input | 默认输入

/**
 * Shader property UI metadata.
 * 着色器属性 UI 元数据。
 *
 * This interface defines all metadata needed to generate an Inspector UI
 * for editing shader uniform values.
 * 此接口定义生成用于编辑着色器 uniform 值的 Inspector UI 所需的所有元数据。
 */
export interface ShaderPropertyMeta {
    /**
     * Property type.
     * 属性类型。
     */
    type: ShaderPropertyType;

    /**
     * Display label (supports i18n key format "中文 | English").
     * 显示标签（支持国际化键格式 "中文 | English"）。
     */
    label: string;

    /**
     * Property group for organization in Inspector.
     * Inspector 中用于组织的属性分组。
     *
     * Properties with the same group will be displayed together under a collapsible header.
     * 具有相同分组的属性将在可折叠标题下一起显示。
     */
    group?: string;

    /**
     * Default value.
     * 默认值。
     */
    default?: number | number[] | string;

    /**
     * Minimum value (for numeric types).
     * 最小值（用于数值类型）。
     */
    min?: number;

    /**
     * Maximum value (for numeric types).
     * 最大值（用于数值类型）。
     */
    max?: number;

    /**
     * Step value for numeric inputs.
     * 数值输入的步长值。
     */
    step?: number;

    /**
     * UI hint for specialized display.
     * 用于特殊显示的 UI 提示。
     */
    hint?: ShaderPropertyHint;

    /**
     * Tooltip description (supports i18n).
     * 工具提示描述（支持国际化）。
     */
    tooltip?: string;

    /**
     * Whether to hide in Inspector.
     * 是否在 Inspector 中隐藏。
     *
     * Hidden properties are typically controlled by scripts or systems.
     * 隐藏的属性通常由脚本或系统控制。
     */
    hidden?: boolean;

    /**
     * Texture filter options (for texture type).
     * 纹理过滤选项（用于纹理类型）。
     */
    textureFilter?: 'linear' | 'nearest';

    /**
     * Texture wrap options (for texture type).
     * 纹理包裹选项（用于纹理类型）。
     */
    textureWrap?: 'repeat' | 'clamp' | 'mirror';
}

/**
 * Extended shader definition with property metadata.
 * 带属性元数据的扩展着色器定义。
 *
 * This interface extends the basic shader definition with UI metadata
 * for Inspector generation and asset serialization.
 * 此接口使用 UI 元数据扩展基本着色器定义，
 * 用于 Inspector 生成和资产序列化。
 */
export interface ShaderAssetDefinition {
    /**
     * Shader name (unique identifier).
     * 着色器名称（唯一标识符）。
     */
    name: string;

    /**
     * Display name for UI.
     * UI 显示名称。
     */
    displayName?: string;

    /**
     * Shader description.
     * 着色器描述。
     */
    description?: string;

    /**
     * Vertex shader source (inline GLSL or relative path).
     * 顶点着色器源（内联 GLSL 或相对路径）。
     */
    vertexSource: string;

    /**
     * Fragment shader source (inline GLSL or relative path).
     * 片段着色器源（内联 GLSL 或相对路径）。
     */
    fragmentSource: string;

    /**
     * Property metadata for Inspector.
     * Inspector 属性元数据。
     *
     * Key is the uniform name (e.g., 'u_shinyProgress').
     * 键是 uniform 名称（例如 'u_shinyProgress'）。
     */
    properties?: Record<string, ShaderPropertyMeta>;

    /**
     * Render queue / order.
     * 渲染队列/顺序。
     *
     * Lower values render first. Default is 2000 (opaque).
     * 较低的值先渲染。默认为 2000（不透明）。
     */
    renderQueue?: number;

    /**
     * Preset blend mode.
     * 预设混合模式。
     */
    blendMode?: 'alpha' | 'additive' | 'multiply' | 'opaque';

    /**
     * Whether this shader requires depth testing.
     * 此着色器是否需要深度测试。
     */
    depthTest?: boolean;

    /**
     * Whether this shader writes to depth buffer.
     * 此着色器是否写入深度缓冲区。
     */
    depthWrite?: boolean;
}

/**
 * Shader asset file format (.shader).
 * 着色器资产文件格式 (.shader)。
 */
export interface ShaderAssetFile {
    /**
     * Schema version for format evolution.
     * 用于格式演进的模式版本。
     */
    version: number;

    /**
     * Shader definition.
     * 着色器定义。
     */
    shader: ShaderAssetDefinition;
}

/**
 * Built-in shader property definitions.
 * 内置着色器属性定义。
 *
 * These are the property metadata for built-in shaders.
 * 这些是内置着色器的属性元数据。
 */
export const BUILTIN_SHADER_PROPERTIES: Record<string, Record<string, ShaderPropertyMeta>> = {
    Shiny: {
        u_shinyProgress: {
            type: 'float',
            label: '进度 | Progress',
            group: 'Animation',
            default: 0,
            min: 0,
            max: 1,
            step: 0.01,
            hidden: true
        },
        u_shinyWidth: {
            type: 'float',
            label: '宽度 | Width',
            group: 'Effect',
            default: 0.25,
            min: 0,
            max: 1,
            step: 0.01,
            tooltip: '闪光带宽度 | Width of the shiny band'
        },
        u_shinyRotation: {
            type: 'float',
            label: '角度 | Rotation',
            group: 'Effect',
            default: 0.524, // 30 degrees in radians | 30度的弧度值
            min: 0,
            max: 6.28, // 360 degrees | 360度
            step: 0.01,
            hint: 'angle',
            tooltip: '闪光扫过的角度 | Angle of shine sweep'
        },
        u_shinySoftness: {
            type: 'float',
            label: '柔和度 | Softness',
            group: 'Effect',
            default: 1.0,
            min: 0,
            max: 1,
            step: 0.01
        },
        u_shinyBrightness: {
            type: 'float',
            label: '亮度 | Brightness',
            group: 'Effect',
            default: 1.0,
            min: 0,
            max: 2,
            step: 0.01
        },
        u_shinyGloss: {
            type: 'float',
            label: '光泽度 | Gloss',
            group: 'Effect',
            default: 1.0,
            min: 0,
            max: 1,
            step: 0.01,
            tooltip: '0=白色高光, 1=带颜色 | 0=white shine, 1=color-tinted'
        }
    },
    Grayscale: {
        u_grayscale: {
            type: 'float',
            label: '灰度 | Grayscale',
            default: 1.0,
            min: 0,
            max: 1,
            step: 0.01,
            hint: 'range',
            tooltip: '0=彩色, 1=完全灰度 | 0=full color, 1=full grayscale'
        }
    },
    Tint: {
        u_tintColor: {
            type: 'color',
            label: '着色 | Tint Color',
            default: [1, 1, 1, 1]
        }
    },
    Flash: {
        u_flashColor: {
            type: 'color',
            label: '闪光颜色 | Flash Color',
            default: [1, 1, 1, 1]
        },
        u_flashAmount: {
            type: 'float',
            label: '闪光强度 | Flash Amount',
            default: 0,
            min: 0,
            max: 1,
            step: 0.01,
            hint: 'range'
        }
    },
    Outline: {
        u_outlineColor: {
            type: 'color',
            label: '描边颜色 | Outline Color',
            default: [0, 0, 0, 1]
        },
        u_outlineWidth: {
            type: 'float',
            label: '描边宽度 | Outline Width',
            default: 1,
            min: 0,
            max: 10,
            step: 0.5
        },
        u_texelSize: {
            type: 'vec2',
            label: '纹素大小 | Texel Size',
            default: [0.01, 0.01],
            hidden: true
        }
    }
};

/**
 * Get shader property metadata by shader name.
 * 通过着色器名称获取着色器属性元数据。
 *
 * @param shaderName - Name of the shader | 着色器名称
 * @returns Property metadata or undefined | 属性元数据或 undefined
 */
export function getShaderProperties(shaderName: string): Record<string, ShaderPropertyMeta> | undefined {
    return BUILTIN_SHADER_PROPERTIES[shaderName];
}

/**
 * Get shader property metadata by shader ID.
 * 通过着色器 ID 获取着色器属性元数据。
 *
 * @param shaderId - ID of the shader (from BuiltInShaders) | 着色器 ID（来自 BuiltInShaders）
 * @returns Property metadata or undefined | 属性元数据或 undefined
 */
export function getShaderPropertiesById(shaderId: number): Record<string, ShaderPropertyMeta> | undefined {
    const shaderNames = ['DefaultSprite', 'Grayscale', 'Tint', 'Flash', 'Outline', 'Shiny'];
    const name = shaderNames[shaderId];
    return name ? BUILTIN_SHADER_PROPERTIES[name] : undefined;
}
