/**
 * Shader class for managing GLSL shaders.
 * 用于管理GLSL着色器的类。
 */

import { ShaderDefinition, UniformValue, UniformType } from './types';

/**
 * Shader class that holds vertex and fragment shader source.
 * 持有顶点和片段着色器源代码的着色器类。
 */
export class Shader {
    /** Shader ID assigned by the engine | 引擎分配的着色器ID */
    private _id: number = -1;

    /** Shader name for reference | 着色器名称用于引用 */
    public name: string;

    /** Vertex shader GLSL source | 顶点着色器GLSL源代码 */
    public vertexSource: string;

    /** Fragment shader GLSL source | 片段着色器GLSL源代码 */
    public fragmentSource: string;

    /** Shader uniforms with default values | 着色器uniform及其默认值 */
    private uniforms: Map<string, UniformValue> = new Map();

    /** Whether the shader has been compiled | 着色器是否已编译 */
    private _compiled: boolean = false;

    constructor(name: string, vertexSource: string, fragmentSource: string) {
        this.name = name;
        this.vertexSource = vertexSource;
        this.fragmentSource = fragmentSource;
    }

    /** Get the shader ID | 获取着色器ID */
    get id(): number {
        return this._id;
    }

    /** Set the shader ID (called by ShaderManager) | 设置着色器ID（由ShaderManager调用） */
    set id(value: number) {
        this._id = value;
    }

    /** Check if shader is compiled | 检查着色器是否已编译 */
    get compiled(): boolean {
        return this._compiled;
    }

    /** Mark shader as compiled | 标记着色器为已编译 */
    markCompiled(): void {
        this._compiled = true;
    }

    /**
     * Define a uniform with default value.
     * 定义带有默认值的uniform。
     */
    defineUniform(name: string, type: UniformType, defaultValue: number | number[] | string): this {
        this.uniforms.set(name, { type, value: defaultValue });
        return this;
    }

    /**
     * Get uniform definition.
     * 获取uniform定义。
     */
    getUniform(name: string): UniformValue | undefined {
        return this.uniforms.get(name);
    }

    /**
     * Get all uniform definitions.
     * 获取所有uniform定义。
     */
    getUniforms(): Map<string, UniformValue> {
        return this.uniforms;
    }

    /**
     * Export to shader definition.
     * 导出为着色器定义。
     */
    toDefinition(): ShaderDefinition {
        const uniformsObj: Record<string, UniformValue> = {};
        for (const [key, value] of this.uniforms) {
            uniformsObj[key] = value;
        }

        return {
            name: this.name,
            vertexSource: this.vertexSource,
            fragmentSource: this.fragmentSource,
            uniforms: Object.keys(uniformsObj).length > 0 ? uniformsObj : undefined
        };
    }

    /**
     * Import from shader definition.
     * 从着色器定义导入。
     */
    static fromDefinition(def: ShaderDefinition): Shader {
        const shader = new Shader(def.name, def.vertexSource, def.fragmentSource);

        if (def.uniforms) {
            for (const [key, value] of Object.entries(def.uniforms)) {
                shader.uniforms.set(key, value);
            }
        }

        return shader;
    }
}

// ============= Built-in Shaders =============
// ============= 内置着色器 =============

/**
 * Default sprite vertex shader source.
 * 默认精灵顶点着色器源代码。
 *
 * Vertex layout (9 floats per vertex):
 * 顶点布局（每顶点 9 个浮点数）:
 * - location 0: position (2 floats)
 * - location 1: tex_coord (2 floats)
 * - location 2: color (4 floats)
 * - location 3: aspect_ratio (1 float)
 */
export const DEFAULT_VERTEX_SHADER = `#version 300 es
precision highp float;

// Vertex attributes | 顶点属性
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_texCoord;
layout(location = 2) in vec4 a_color;
layout(location = 3) in float a_aspectRatio;

// Uniforms | 统一变量
uniform mat3 u_projection;

// Outputs to fragment shader | 输出到片段着色器
out vec2 v_texCoord;
out vec4 v_color;
out float v_aspectRatio;

void main() {
    // Apply projection matrix | 应用投影矩阵
    vec3 pos = u_projection * vec3(a_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);

    // Pass through to fragment shader | 传递到片段着色器
    v_texCoord = a_texCoord;
    v_color = a_color;
    v_aspectRatio = a_aspectRatio;
}
`;

/**
 * Default sprite fragment shader source.
 * 默认精灵片段着色器源代码。
 */
export const DEFAULT_FRAGMENT_SHADER = `#version 300 es
precision highp float;

// Inputs from vertex shader | 来自顶点着色器的输入
in vec2 v_texCoord;
in vec4 v_color;
in float v_aspectRatio;

// Texture sampler | 纹理采样器
uniform sampler2D u_texture;

// Output color | 输出颜色
out vec4 fragColor;

void main() {
    // Sample texture and multiply by vertex color | 采样纹理并乘以顶点颜色
    vec4 texColor = texture(u_texture, v_texCoord);
    fragColor = texColor * v_color;

    // Discard fully transparent pixels | 丢弃完全透明的像素
    if (fragColor.a < 0.01) {
        discard;
    }
}
`;

/**
 * Grayscale fragment shader for desaturation effect.
 * 灰度片段着色器用于去饱和效果。
 */
export const GRAYSCALE_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
in vec4 v_color;
in float v_aspectRatio;

uniform sampler2D u_texture;
uniform float u_grayscale; // 0.0 = full color, 1.0 = full grayscale

out vec4 fragColor;

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);
    vec4 color = texColor * v_color;

    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 grayscaleColor = vec3(gray);

    fragColor = vec4(mix(color.rgb, grayscaleColor, u_grayscale), color.a);

    if (fragColor.a < 0.01) {
        discard;
    }
}
`;

/**
 * Color tint fragment shader.
 * 颜色着色片段着色器。
 */
export const TINT_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
in vec4 v_color;
in float v_aspectRatio;

uniform sampler2D u_texture;
uniform vec4 u_tintColor; // Tint color to apply

out vec4 fragColor;

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);
    vec4 color = texColor * v_color;

    // Apply tint by multiplying RGB and keeping alpha
    fragColor = vec4(color.rgb * u_tintColor.rgb, color.a * u_tintColor.a);

    if (fragColor.a < 0.01) {
        discard;
    }
}
`;

/**
 * Flash/hit effect fragment shader.
 * 闪白/受击效果片段着色器。
 */
export const FLASH_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
in vec4 v_color;
in float v_aspectRatio;

uniform sampler2D u_texture;
uniform vec4 u_flashColor; // Flash color
uniform float u_flashAmount; // 0.0 = no flash, 1.0 = full flash

out vec4 fragColor;

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);
    vec4 color = texColor * v_color;

    // Mix original color with flash color
    vec3 flashedColor = mix(color.rgb, u_flashColor.rgb, u_flashAmount);
    fragColor = vec4(flashedColor, color.a);

    if (fragColor.a < 0.01) {
        discard;
    }
}
`;

/**
 * Outline fragment shader.
 * 描边片段着色器。
 */
export const OUTLINE_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
in vec4 v_color;
in float v_aspectRatio;

uniform sampler2D u_texture;
uniform vec4 u_outlineColor;
uniform float u_outlineWidth;
uniform vec2 u_texelSize; // 1.0 / textureSize

out vec4 fragColor;

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);
    vec4 color = texColor * v_color;

    // Check if this pixel should be outline
    if (color.a < 0.1) {
        // Sample neighbors
        float a = 0.0;
        for (float x = -1.0; x <= 1.0; x += 1.0) {
            for (float y = -1.0; y <= 1.0; y += 1.0) {
                vec2 offset = vec2(x, y) * u_texelSize * u_outlineWidth;
                a += texture(u_texture, v_texCoord + offset).a;
            }
        }

        if (a > 0.0) {
            fragColor = u_outlineColor;
            return;
        }
    }

    fragColor = color;

    if (fragColor.a < 0.01) {
        discard;
    }
}
`;

/**
 * Shiny/Shimmer effect fragment shader.
 * 闪光效果片段着色器。
 *
 * Uses v_aspectRatio from vertex attribute for aspect-ratio-aware rotation.
 * 使用顶点属性中的 v_aspectRatio 进行宽高比感知的旋转。
 */
export const SHINY_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
in vec4 v_color;
in float v_aspectRatio;

uniform sampler2D u_texture;

// Shiny effect uniforms | 闪光效果 uniform 变量
uniform float u_shinyProgress;   // Animation progress (0-1) | 动画进度
uniform float u_shinyWidth;      // Width of shine band (0-1) | 闪光带宽度
uniform float u_shinyRotation;   // Rotation in radians | 旋转角度（弧度）
uniform float u_shinySoftness;   // Edge softness (0-1) | 边缘柔和度
uniform float u_shinyBrightness; // Brightness multiplier | 亮度倍数
uniform float u_shinyGloss;      // Gloss intensity (0=white, 1=color-tinted) | 光泽度

out vec4 fragColor;

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);
    float originAlpha = texColor.a;
    vec4 color = texColor * v_color;

    // Early discard for transparent pixels
    if (color.a < 0.01) {
        discard;
    }

    // Calculate rotated position for the sweep (0 to 1 range)
    // 计算旋转后的扫描位置（0 到 1 范围）
    //
    // 1. 计算基础方向向量 dir = (cos(θ), sin(θ))
    // 2. 宽高比校正：dir.x *= height/width = 1/aspectRatio
    // 3. 归一化方向向量
    // 4. 计算扫描位置（考虑纹理坐标 Y 轴方向）
    //
    // 1. Calculate base direction vector dir = (cos(θ), sin(θ))
    // 2. Aspect ratio correction: dir.x *= height/width = 1/aspectRatio
    // 3. Normalize direction vector
    // 4. Calculate sweep position (accounting for texture Y-axis direction)
    //
    vec2 center = v_texCoord - vec2(0.5);
    float cosR = cos(u_shinyRotation);
    float sinR = sin(u_shinyRotation);

    // Aspect ratio correction: scale X by 1/aspectRatio (height/width)
    // v_aspectRatio is passed from vertex attribute, calculated at render time
    // 宽高比校正：X 分量乘以 1/aspectRatio（即 height/width）
    // v_aspectRatio 从顶点属性传入，在渲染时计算
    float adjCosR = cosR / max(v_aspectRatio, 0.001);

    // Normalize the direction vector
    // 归一化方向向量
    float len = sqrt(adjCosR * adjCosR + sinR * sinR);
    float dirX = adjCosR / len;
    float dirY = sinR / len;

    // Sweep position: project onto perpendicular direction
    // Y-axis flip: texture coords have Y pointing up, but we want top-to-bottom sweep
    // 扫描位置：投影到垂直方向
    // Y 轴翻转：纹理坐标 Y 向上，但我们需要从上到下扫描
    float rotatedPos = (center.x * dirY - center.y * dirX) + 0.5;

    // Map progress to location (-0.5 to 1.5 range for smooth entry/exit)
    float location = u_shinyProgress * 2.0 - 0.5;

    // Calculate normalized distance (1 at center, 0 at edges)
    // 计算归一化距离（中心为1，边缘为0）
    float normalized = 1.0 - clamp(abs((rotatedPos - location) / max(u_shinyWidth, 0.001)), 0.0, 1.0);

    // Apply softness with smoothstep
    // 使用 smoothstep 应用柔和度
    float shinePower = smoothstep(0.0, u_shinySoftness * 2.0, normalized);

    // Calculate reflect color: lerp between white and bright original color
    // 计算反射颜色：在白色和明亮的原色之间插值
    vec3 reflectColor = mix(vec3(1.0), color.rgb * 10.0, u_shinyGloss);

    // Apply shine: additive blend with halved intensity
    // 应用高光：半强度加性混合
    vec3 shineAdd = originAlpha * (shinePower * 0.5) * u_shinyBrightness * reflectColor;
    vec3 finalColor = color.rgb + shineAdd;

    fragColor = vec4(finalColor, color.a);
}
`;
