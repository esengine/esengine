//! Built-in shader source code.
//! 内置Shader源代码。

// =============================================================================
// MSDF Text Shaders
// MSDF 文本着色器
// =============================================================================

/// MSDF text vertex shader source.
/// MSDF 文本顶点着色器源代码。
pub const MSDF_TEXT_VERTEX_SHADER: &str = r#"#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_texCoord;
layout(location = 2) in vec4 a_color;
layout(location = 3) in vec4 a_outlineColor;
layout(location = 4) in float a_outlineWidth;

uniform mat3 u_projection;

out vec2 v_texCoord;
out vec4 v_color;
out vec4 v_outlineColor;
out float v_outlineWidth;

void main() {
    vec3 pos = u_projection * vec3(a_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
    v_texCoord = a_texCoord;
    v_color = a_color;
    v_outlineColor = a_outlineColor;
    v_outlineWidth = a_outlineWidth;
}
"#;

/// MSDF text fragment shader source.
/// MSDF 文本片段着色器源代码。
pub const MSDF_TEXT_FRAGMENT_SHADER: &str = r#"#version 300 es
precision highp float;

in vec2 v_texCoord;
in vec4 v_color;
in vec4 v_outlineColor;
in float v_outlineWidth;

uniform sampler2D u_msdfTexture;
uniform float u_pxRange;

out vec4 fragColor;

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

void main() {
    vec3 msdf = texture(u_msdfTexture, v_texCoord).rgb;
    float sd = median(msdf.r, msdf.g, msdf.b);

    vec2 unitRange = vec2(u_pxRange) / vec2(textureSize(u_msdfTexture, 0));
    vec2 screenTexSize = vec2(1.0) / fwidth(v_texCoord);
    float screenPxRange = max(0.5 * dot(unitRange, screenTexSize), 1.0);

    float screenPxDistance = screenPxRange * (sd - 0.5);
    float opacity = clamp(screenPxDistance + 0.5, 0.0, 1.0);

    if (v_outlineWidth > 0.0) {
        float outlineDistance = screenPxRange * (sd - 0.5 + v_outlineWidth);
        float outlineOpacity = clamp(outlineDistance + 0.5, 0.0, 1.0);
        vec4 outlineCol = vec4(v_outlineColor.rgb, v_outlineColor.a * outlineOpacity);
        vec4 fillCol = vec4(v_color.rgb, v_color.a * opacity);
        fragColor = mix(outlineCol, fillCol, opacity);
    } else {
        fragColor = vec4(v_color.rgb, v_color.a * opacity);
    }

    if (fragColor.a < 0.01) {
        discard;
    }
}
"#;

// =============================================================================
// Sprite Shaders
// 精灵着色器
// =============================================================================

/// Sprite vertex shader source.
/// 精灵顶点着色器源代码。
///
/// Handles sprite transformation with position, UV, and color attributes.
/// 处理带有位置、UV和颜色属性的精灵变换。
pub const SPRITE_VERTEX_SHADER: &str = r#"#version 300 es
precision highp float;

// Vertex attributes | 顶点属性
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_texCoord;
layout(location = 2) in vec4 a_color;

// Uniforms | 统一变量
uniform mat3 u_projection;

// Outputs to fragment shader | 输出到片段着色器
out vec2 v_texCoord;
out vec4 v_color;

void main() {
    // Apply projection matrix | 应用投影矩阵
    vec3 pos = u_projection * vec3(a_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);

    // Pass through to fragment shader | 传递到片段着色器
    v_texCoord = a_texCoord;
    v_color = a_color;
}
"#;

/// Sprite fragment shader source.
/// 精灵片段着色器源代码。
///
/// Samples texture and applies vertex color tinting.
/// 采样纹理并应用顶点颜色着色。
pub const SPRITE_FRAGMENT_SHADER: &str = r#"#version 300 es
precision highp float;

// Inputs from vertex shader | 来自顶点着色器的输入
in vec2 v_texCoord;
in vec4 v_color;

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
"#;
