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

// =============================================================================
// 3D Shaders
// 3D着色器
// =============================================================================

/// 3D mesh vertex shader source.
/// 3D网格顶点着色器源代码。
///
/// Handles 3D transformation with position, UV, color, and normal attributes.
/// 处理带有位置、UV、颜色和法线属性的3D变换。
pub const MESH3D_VERTEX_SHADER: &str = r#"#version 300 es
precision highp float;

// Vertex attributes | 顶点属性
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec2 a_texCoord;
layout(location = 2) in vec4 a_color;
layout(location = 3) in vec3 a_normal;

// Uniforms | 统一变量
uniform mat4 u_viewProjection;
uniform mat4 u_model;

// Outputs to fragment shader | 输出到片段着色器
out vec2 v_texCoord;
out vec4 v_color;
out vec3 v_normal;
out vec3 v_worldPos;

void main() {
    // Transform position to world space | 将位置变换到世界空间
    vec4 worldPos = u_model * vec4(a_position, 1.0);
    v_worldPos = worldPos.xyz;

    // Apply view-projection matrix | 应用视图-投影矩阵
    gl_Position = u_viewProjection * worldPos;

    // Transform normal to world space | 将法线变换到世界空间
    // Using mat3 to ignore translation, should use inverse-transpose for non-uniform scaling
    // 使用 mat3 忽略平移，非均匀缩放时应使用逆转置矩阵
    v_normal = mat3(u_model) * a_normal;

    // Pass through to fragment shader | 传递到片段着色器
    v_texCoord = a_texCoord;
    v_color = a_color;
}
"#;

/// 3D mesh fragment shader source (unlit).
/// 3D网格片段着色器源代码（无光照）。
///
/// Samples texture and applies vertex color, without lighting calculations.
/// 采样纹理并应用顶点颜色，不进行光照计算。
pub const MESH3D_FRAGMENT_SHADER_UNLIT: &str = r#"#version 300 es
precision highp float;

// Inputs from vertex shader | 来自顶点着色器的输入
in vec2 v_texCoord;
in vec4 v_color;
in vec3 v_normal;
in vec3 v_worldPos;

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

/// 3D mesh fragment shader source (basic directional lighting).
/// 3D网格片段着色器源代码（基础方向光照）。
///
/// Applies simple directional lighting with ambient term.
/// 应用带环境光的简单方向光照。
pub const MESH3D_FRAGMENT_SHADER_LIT: &str = r#"#version 300 es
precision highp float;

// Inputs from vertex shader | 来自顶点着色器的输入
in vec2 v_texCoord;
in vec4 v_color;
in vec3 v_normal;
in vec3 v_worldPos;

// Texture sampler | 纹理采样器
uniform sampler2D u_texture;

// Lighting uniforms | 光照统一变量
uniform vec3 u_lightDirection;  // Normalized direction TO light | 指向光源的归一化方向
uniform vec3 u_lightColor;      // Light color and intensity | 光源颜色和强度
uniform vec3 u_ambientColor;    // Ambient light color | 环境光颜色

// Output color | 输出颜色
out vec4 fragColor;

void main() {
    // Sample texture | 采样纹理
    vec4 texColor = texture(u_texture, v_texCoord);
    vec4 baseColor = texColor * v_color;

    // Normalize interpolated normal | 归一化插值后的法线
    vec3 normal = normalize(v_normal);

    // Lambertian diffuse lighting | 兰伯特漫反射光照
    float diffuse = max(dot(normal, u_lightDirection), 0.0);

    // Combine ambient and diffuse | 组合环境光和漫反射
    vec3 lighting = u_ambientColor + u_lightColor * diffuse;

    // Apply lighting to base color | 将光照应用到基础颜色
    fragColor = vec4(baseColor.rgb * lighting, baseColor.a);

    // Discard fully transparent pixels | 丢弃完全透明的像素
    if (fragColor.a < 0.01) {
        discard;
    }
}
"#;

/// Simple 3D vertex shader (no normal, for unlit rendering).
/// 简单3D顶点着色器（无法线，用于无光照渲染）。
pub const SIMPLE3D_VERTEX_SHADER: &str = r#"#version 300 es
precision highp float;

// Vertex attributes | 顶点属性
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec2 a_texCoord;
layout(location = 2) in vec4 a_color;

// Uniforms | 统一变量
uniform mat4 u_viewProjection;
uniform mat4 u_model;

// Outputs to fragment shader | 输出到片段着色器
out vec2 v_texCoord;
out vec4 v_color;

void main() {
    // Apply model and view-projection matrices | 应用模型和视图-投影矩阵
    gl_Position = u_viewProjection * u_model * vec4(a_position, 1.0);

    // Pass through to fragment shader | 传递到片段着色器
    v_texCoord = a_texCoord;
    v_color = a_color;
}
"#;

/// Simple 3D fragment shader (shared with unlit mesh shader).
/// 简单3D片段着色器（与无光照网格着色器共用）。
pub const SIMPLE3D_FRAGMENT_SHADER: &str = r#"#version 300 es
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

/// 3D Grid vertex shader for editor floor grid.
/// 用于编辑器地面网格的3D网格顶点着色器。
pub const GRID3D_VERTEX_SHADER: &str = r#"#version 300 es
precision highp float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec4 a_color;

uniform mat4 u_viewProjection;

out vec4 v_color;
out vec3 v_worldPos;

void main() {
    gl_Position = u_viewProjection * vec4(a_position, 1.0);
    v_color = a_color;
    v_worldPos = a_position;
}
"#;

/// 3D Grid fragment shader with distance fade.
/// 带距离淡出的3D网格片段着色器。
pub const GRID3D_FRAGMENT_SHADER: &str = r#"#version 300 es
precision highp float;

in vec4 v_color;
in vec3 v_worldPos;

uniform vec3 u_cameraPos;
uniform float u_fadeStart;  // Distance at which fade starts | 开始淡出的距离
uniform float u_fadeEnd;    // Distance at which fully transparent | 完全透明的距离

out vec4 fragColor;

void main() {
    // Calculate distance from camera | 计算到相机的距离
    float dist = length(v_worldPos - u_cameraPos);

    // Apply distance-based fade | 应用基于距离的淡出
    float fade = 1.0 - smoothstep(u_fadeStart, u_fadeEnd, dist);

    fragColor = vec4(v_color.rgb, v_color.a * fade);

    if (fragColor.a < 0.01) {
        discard;
    }
}
"#;
