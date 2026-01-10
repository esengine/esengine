/**
 * @zh 内置效果数据 - 精简版
 * @en Built-in effects data - Minimal version
 *
 * This file contains pre-compiled effect data required for materials to work.
 * The data is extracted from ccesengine test fixtures.
 *
 * Essential effects for UI rendering:
 * - builtin-sprite: Used by Sprite components
 * - builtin-graphics: Used by Graphics/vector drawing
 * - builtin-clear-stencil: Used for stencil buffer clearing
 * - builtin-unlit: Simple unlit effect for fallback materials
 */

// Effect metadata types
interface ShaderDefine {
    name: string;
    type: string;
    range?: number[];
    options?: string[];
    default?: string;
}

interface ShaderAttribute {
    name: string;
    defines: string[];
    format: number;
    location: number;
    isNormalized?: boolean;
    stream?: number;
    isInstanced?: boolean;
}

interface UniformMember {
    name: string;
    type: number;
    count: number;
}

interface ShaderBlock {
    name: string;
    defines: string[];
    binding: number;
    stageFlags: number;
    members: UniformMember[];
}

interface SamplerTextureInfo {
    name: string;
    type: number;
    count: number;
    defines: string[];
    stageFlags: number;
    binding: number;
}

interface BuiltinInfo {
    blocks: Array<{ name: string; defines: string[] }>;
    samplerTextures: Array<{ name: string; defines: string[] }>;
    buffers: unknown[];
    images: unknown[];
}

interface ShaderInfo {
    name: string;
    hash: number;
    builtins: {
        statistics: Record<string, number>;
        globals: BuiltinInfo;
        locals: BuiltinInfo;
    };
    defines: ShaderDefine[];
    attributes: ShaderAttribute[];
    blocks: ShaderBlock[];
    samplerTextures: SamplerTextureInfo[];
    buffers: unknown[];
    images: unknown[];
    textures: unknown[];
    samplers: unknown[];
    subpassInputs: unknown[];
    glsl4?: { vert: string; frag: string };
    glsl3?: { vert: string; frag: string };
    glsl1?: { vert: string; frag: string };
}

interface PassInfo {
    blendState?: {
        targets: Array<{
            blend?: boolean;
            blendSrc?: number;
            blendDst?: number;
            blendSrcAlpha?: number;
            blendDstAlpha?: number;
            blendColorMask?: number;
        }>;
    };
    rasterizerState?: { cullMode: number };
    program: string;
    depthStencilState?: {
        depthTest?: boolean;
        depthWrite?: boolean;
        depthFunc?: number;
    };
    properties?: Record<string, { value?: unknown; type: number }>;
    primitive?: number;
    priority?: number;
    phase?: string | number;
    propertyIndex?: number;
    embeddedMacros?: Record<string, unknown>;
}

interface TechniqueInfo {
    name?: string;
    passes: PassInfo[];
}

interface EffectData {
    name: string;
    techniques: TechniqueInfo[];
    shaders: ShaderInfo[];
}

// Sprite shader GLSL source (GLSL ES 3.0 for WebGL2)
// Uniform blocks must match engine's definitions exactly for buffer size compatibility
const spriteVertGLSL3 = `
precision highp float;
layout(std140) uniform CCGlobal {
    highp vec4 cc_time;
    mediump vec4 cc_screenSize;
    mediump vec4 cc_nativeSize;
    mediump vec4 cc_probeInfo;
    mediump vec4 cc_debug_view_mode;
};
layout(std140) uniform CCCamera {
    highp mat4 cc_matView;
    highp mat4 cc_matViewInv;
    highp mat4 cc_matProj;
    highp mat4 cc_matProjInv;
    highp mat4 cc_matViewProj;
    highp mat4 cc_matViewProjInv;
    highp vec4 cc_cameraPos;
    mediump vec4 cc_surfaceTransform;
    mediump vec4 cc_screenScale;
    mediump vec4 cc_exposure;
    mediump vec4 cc_mainLitDir;
    mediump vec4 cc_mainLitColor;
    mediump vec4 cc_ambientSky;
    mediump vec4 cc_ambientGround;
    mediump vec4 cc_fogColor;
    mediump vec4 cc_fogBase;
    mediump vec4 cc_fogAdd;
    mediump vec4 cc_nearFar;
    mediump vec4 cc_viewPort;
};
#if USE_LOCAL
layout(std140) uniform CCLocal {
    highp mat4 cc_matWorld;
    highp mat4 cc_matWorldIT;
    highp vec4 cc_lightingMapUVParam;
    highp vec4 cc_localShadowBias;
    highp vec4 cc_reflectionProbeData1;
    highp vec4 cc_reflectionProbeData2;
    highp vec4 cc_reflectionProbeBlendData1;
    highp vec4 cc_reflectionProbeBlendData2;
};
#endif
in vec3 a_position;
in vec2 a_texCoord;
in vec4 a_color;
out vec2 v_uv;
out vec4 v_color;
vec4 vert() {
    vec4 pos = vec4(a_position, 1.0);
    #if USE_LOCAL
        pos = cc_matWorld * pos;
    #endif
    #if USE_PIXEL_ALIGNMENT
        pos = cc_matViewProj * pos;
        pos.xyz = floor(pos.xyz);
    #else
        pos = cc_matViewProj * pos;
    #endif
    v_uv = a_texCoord;
    #if SAMPLE_FROM_RT
        v_uv = cc_cameraPos.w > 0.0 ? vec2(v_uv.x, 1.0 - v_uv.y) : v_uv;
    #endif
    v_color = a_color;
    return pos;
}
void main() { gl_Position = vert(); }
`;

const spriteFragGLSL3 = `
precision highp float;
in vec2 v_uv;
in vec4 v_color;
#if USE_TEXTURE
uniform sampler2D cc_spriteTexture;
#endif
#if USE_ALPHA_TEST
layout(std140) uniform ALPHA_TEST_DATA {
    float alphaThreshold;
};
#endif
out vec4 cc_FragColor;
vec4 frag() {
    vec4 color = v_color;
    #if USE_TEXTURE
        vec4 texColor = texture(cc_spriteTexture, v_uv);
        #if CC_USE_EMBEDDED_ALPHA
            texColor.a *= texColor.r;
            texColor.rgb = vec3(1.0);
        #endif
        color *= texColor;
    #endif
    #if IS_GRAY
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = vec3(gray);
    #endif
    #if USE_ALPHA_TEST
        if (color.a < alphaThreshold) discard;
    #endif
    return color;
}
void main() { cc_FragColor = frag(); }
`;

// Sprite shader GLSL source (GLSL 4 for Vulkan/Desktop)
const spriteVertGLSL4 = `
precision highp float;
layout(set = 0, binding = 0) uniform CCGlobal {
    highp vec4 cc_time;
    mediump vec4 cc_screenSize;
    mediump vec4 cc_nativeSize;
    mediump vec4 cc_debug_view_mode;
    mediump vec4 cc_debug_view_composite_pack_1;
    mediump vec4 cc_debug_view_composite_pack_2;
    mediump vec4 cc_debug_view_composite_pack_3;
};
layout(set = 0, binding = 1) uniform CCCamera {
    highp mat4 cc_matView;
    highp mat4 cc_matViewInv;
    highp mat4 cc_matProj;
    highp mat4 cc_matProjInv;
    highp mat4 cc_matViewProj;
    highp mat4 cc_matViewProjInv;
    highp vec4 cc_cameraPos;
    mediump vec4 cc_surfaceTransform;
    mediump vec4 cc_screenScale;
    mediump vec4 cc_exposure;
    mediump vec4 cc_mainLitDir;
    mediump vec4 cc_mainLitColor;
    mediump vec4 cc_ambientSky;
    mediump vec4 cc_ambientGround;
    mediump vec4 cc_fogColor;
    mediump vec4 cc_fogBase;
    mediump vec4 cc_fogAdd;
    mediump vec4 cc_nearFar;
    mediump vec4 cc_viewPort;
};
#if USE_LOCAL
layout(set = 2, binding = 0) uniform CCLocal {
    highp mat4 cc_matWorld;
    highp mat4 cc_matWorldIT;
    highp vec4 cc_lightingMapUVParam;
    highp vec4 cc_localShadowBias;
};
#endif
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec2 a_texCoord;
layout(location = 2) in vec4 a_color;
layout(location = 0) out vec2 v_uv;
layout(location = 1) out vec4 v_color;
vec4 vert() {
    vec4 pos = vec4(a_position, 1.0);
    #if USE_LOCAL
        pos = cc_matWorld * pos;
    #endif
    #if USE_PIXEL_ALIGNMENT
        pos = cc_matViewProj * pos;
        pos.xyz = floor(pos.xyz);
    #else
        pos = cc_matViewProj * pos;
    #endif
    v_uv = a_texCoord;
    #if SAMPLE_FROM_RT
        v_uv = cc_cameraPos.w > 0.0 ? vec2(v_uv.x, 1.0 - v_uv.y) : v_uv;
    #endif
    v_color = a_color;
    return pos;
}
void main() { gl_Position = vert(); }
`;

const spriteFragGLSL4 = `
precision highp float;
layout(location = 0) in vec2 v_uv;
layout(location = 1) in vec4 v_color;
#if USE_TEXTURE
layout(set = 2, binding = 1) uniform sampler2D cc_spriteTexture;
#endif
#if USE_ALPHA_TEST
layout(set = 1, binding = 0) uniform ALPHA_TEST_DATA {
    float alphaThreshold;
};
#endif
vec4 frag() {
    vec4 color = v_color;
    #if USE_TEXTURE
        vec4 texColor = texture(cc_spriteTexture, v_uv);
        #if CC_USE_EMBEDDED_ALPHA
            texColor.a *= texColor.r;
            texColor.rgb = vec3(1.0);
        #endif
        color *= texColor;
    #endif
    #if IS_GRAY
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = vec3(gray);
    #endif
    #if USE_ALPHA_TEST
        if (color.a < alphaThreshold) discard;
    #endif
    return color;
}
layout(location = 0) out vec4 cc_FragColor;
void main() { cc_FragColor = frag(); }
`;

// Graphics shader GLSL source (GLSL ES 3.0 for WebGL2)
const graphicsVertGLSL3 = `
precision highp float;
layout(std140) uniform CCGlobal {
    highp vec4 cc_time;
    mediump vec4 cc_screenSize;
    mediump vec4 cc_nativeSize;
    mediump vec4 cc_probeInfo;
    mediump vec4 cc_debug_view_mode;
};
layout(std140) uniform CCCamera {
    highp mat4 cc_matView;
    highp mat4 cc_matViewInv;
    highp mat4 cc_matProj;
    highp mat4 cc_matProjInv;
    highp mat4 cc_matViewProj;
    highp mat4 cc_matViewProjInv;
    highp vec4 cc_cameraPos;
    mediump vec4 cc_surfaceTransform;
    mediump vec4 cc_screenScale;
    mediump vec4 cc_exposure;
    mediump vec4 cc_mainLitDir;
    mediump vec4 cc_mainLitColor;
    mediump vec4 cc_ambientSky;
    mediump vec4 cc_ambientGround;
    mediump vec4 cc_fogColor;
    mediump vec4 cc_fogBase;
    mediump vec4 cc_fogAdd;
    mediump vec4 cc_nearFar;
    mediump vec4 cc_viewPort;
};
layout(std140) uniform CCLocal {
    highp mat4 cc_matWorld;
    highp mat4 cc_matWorldIT;
    highp vec4 cc_lightingMapUVParam;
    highp vec4 cc_localShadowBias;
    highp vec4 cc_reflectionProbeData1;
    highp vec4 cc_reflectionProbeData2;
    highp vec4 cc_reflectionProbeBlendData1;
    highp vec4 cc_reflectionProbeBlendData2;
};
in vec3 a_position;
in vec4 a_color;
in float a_dist;
out vec4 v_color;
out float v_dist;
vec4 vert() {
    vec4 pos = vec4(a_position, 1.0);
    pos = cc_matViewProj * cc_matWorld * pos;
    v_color = a_color;
    v_dist = a_dist;
    return pos;
}
void main() { gl_Position = vert(); }
`;

const graphicsFragGLSL3 = `
precision highp float;
in vec4 v_color;
in float v_dist;
out vec4 cc_FragColor;
vec4 frag() {
    vec4 o = v_color;
    float aa = fwidth(v_dist);
    float alpha = 1.0 - smoothstep(-aa, 0.0, abs(v_dist) - 1.0);
    o.rgb *= o.a;
    o *= alpha;
    return o;
}
void main() { cc_FragColor = frag(); }
`;

// Graphics shader GLSL source (GLSL 4 for Vulkan/Desktop)
const graphicsVertGLSL4 = `
precision highp float;
layout(set = 0, binding = 0) uniform CCGlobal {
    highp vec4 cc_time;
    mediump vec4 cc_screenSize;
    mediump vec4 cc_nativeSize;
    mediump vec4 cc_debug_view_mode;
    mediump vec4 cc_debug_view_composite_pack_1;
    mediump vec4 cc_debug_view_composite_pack_2;
    mediump vec4 cc_debug_view_composite_pack_3;
};
layout(set = 0, binding = 1) uniform CCCamera {
    highp mat4 cc_matView;
    highp mat4 cc_matViewInv;
    highp mat4 cc_matProj;
    highp mat4 cc_matProjInv;
    highp mat4 cc_matViewProj;
    highp mat4 cc_matViewProjInv;
    highp vec4 cc_cameraPos;
    mediump vec4 cc_surfaceTransform;
    mediump vec4 cc_screenScale;
    mediump vec4 cc_exposure;
    mediump vec4 cc_mainLitDir;
    mediump vec4 cc_mainLitColor;
    mediump vec4 cc_ambientSky;
    mediump vec4 cc_ambientGround;
    mediump vec4 cc_fogColor;
    mediump vec4 cc_fogBase;
    mediump vec4 cc_fogAdd;
    mediump vec4 cc_nearFar;
    mediump vec4 cc_viewPort;
};
layout(set = 2, binding = 0) uniform CCLocal {
    highp mat4 cc_matWorld;
    highp mat4 cc_matWorldIT;
    highp vec4 cc_lightingMapUVParam;
    highp vec4 cc_localShadowBias;
};
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec4 a_color;
layout(location = 2) in float a_dist;
layout(location = 0) out vec4 v_color;
layout(location = 1) out float v_dist;
vec4 vert() {
    vec4 pos = vec4(a_position, 1.0);
    pos = cc_matViewProj * cc_matWorld * pos;
    v_color = a_color;
    v_dist = a_dist;
    return pos;
}
void main() { gl_Position = vert(); }
`;

const graphicsFragGLSL4 = `
precision highp float;
layout(location = 0) in vec4 v_color;
layout(location = 1) in float v_dist;
vec4 frag() {
    vec4 o = v_color;
    float aa = fwidth(v_dist);
    float alpha = 1.0 - smoothstep(-aa, 0.0, abs(v_dist) - 1.0);
    o.rgb *= o.a;
    o *= alpha;
    return o;
}
layout(location = 0) out vec4 cc_FragColor;
void main() { cc_FragColor = frag(); }
`;

// Clear stencil shader GLSL source (GLSL ES 3.0 for WebGL2)
const clearStencilVertGLSL3 = `
precision highp float;
in vec3 a_position;
vec4 vert() {
    return vec4(a_position, 1.0);
}
void main() { gl_Position = vert(); }
`;

const clearStencilFragGLSL3 = `
precision highp float;
out vec4 cc_FragColor;
vec4 frag() {
    return vec4(1.0);
}
void main() { cc_FragColor = frag(); }
`;

// Clear stencil shader GLSL source (GLSL 4 for Vulkan/Desktop)
const clearStencilVertGLSL4 = `
precision highp float;
layout(location = 0) in vec3 a_position;
vec4 vert() {
    return vec4(a_position, 1.0);
}
void main() { gl_Position = vert(); }
`;

const clearStencilFragGLSL4 = `
precision highp float;
vec4 frag() {
    return vec4(1.0);
}
layout(location = 0) out vec4 cc_FragColor;
void main() { cc_FragColor = frag(); }
`;

// Unlit shader GLSL source (GLSL ES 3.0 for WebGL2) - minimal version
const unlitVertGLSL3 = `
precision highp float;
layout(std140) uniform CCGlobal {
    highp vec4 cc_time;
    mediump vec4 cc_screenSize;
    mediump vec4 cc_nativeSize;
    mediump vec4 cc_probeInfo;
    mediump vec4 cc_debug_view_mode;
};
layout(std140) uniform CCCamera {
    highp mat4 cc_matView;
    highp mat4 cc_matViewInv;
    highp mat4 cc_matProj;
    highp mat4 cc_matProjInv;
    highp mat4 cc_matViewProj;
    highp mat4 cc_matViewProjInv;
    highp vec4 cc_cameraPos;
    mediump vec4 cc_surfaceTransform;
    mediump vec4 cc_screenScale;
    mediump vec4 cc_exposure;
    mediump vec4 cc_mainLitDir;
    mediump vec4 cc_mainLitColor;
    mediump vec4 cc_ambientSky;
    mediump vec4 cc_ambientGround;
    mediump vec4 cc_fogColor;
    mediump vec4 cc_fogBase;
    mediump vec4 cc_fogAdd;
    mediump vec4 cc_nearFar;
    mediump vec4 cc_viewPort;
};
layout(std140) uniform CCLocal {
    highp mat4 cc_matWorld;
    highp mat4 cc_matWorldIT;
    highp vec4 cc_lightingMapUVParam;
    highp vec4 cc_localShadowBias;
    highp vec4 cc_reflectionProbeData1;
    highp vec4 cc_reflectionProbeData2;
    highp vec4 cc_reflectionProbeBlendData1;
    highp vec4 cc_reflectionProbeBlendData2;
};
in vec3 a_position;
in vec2 a_texCoord;
in vec4 a_color;
out vec2 v_uv;
out vec4 v_color;
vec4 vert() {
    vec4 pos = vec4(a_position, 1.0);
    pos = cc_matViewProj * cc_matWorld * pos;
    v_uv = a_texCoord;
    v_color = a_color;
    return pos;
}
void main() { gl_Position = vert(); }
`;

const unlitFragGLSL3 = `
precision highp float;
in vec2 v_uv;
in vec4 v_color;
#if USE_COLOR
layout(std140) uniform MainColor {
    vec4 mainColor;
};
#endif
#if USE_TEXTURE
uniform sampler2D mainTexture;
#endif
out vec4 cc_FragColor;
vec4 frag() {
    vec4 color = vec4(1.0);
    #if USE_COLOR
        color *= mainColor;
    #endif
    #if USE_TEXTURE
        color *= texture(mainTexture, v_uv);
    #endif
    return color * v_color;
}
void main() { cc_FragColor = frag(); }
`;

// Unlit shader GLSL source (GLSL 4 for Vulkan/Desktop) - minimal version
const unlitVertGLSL4 = `
precision highp float;
layout(set = 0, binding = 0) uniform CCGlobal {
    highp vec4 cc_time;
    mediump vec4 cc_screenSize;
    mediump vec4 cc_nativeSize;
    mediump vec4 cc_debug_view_mode;
    mediump vec4 cc_debug_view_composite_pack_1;
    mediump vec4 cc_debug_view_composite_pack_2;
    mediump vec4 cc_debug_view_composite_pack_3;
};
layout(set = 0, binding = 1) uniform CCCamera {
    highp mat4 cc_matView;
    highp mat4 cc_matViewInv;
    highp mat4 cc_matProj;
    highp mat4 cc_matProjInv;
    highp mat4 cc_matViewProj;
    highp mat4 cc_matViewProjInv;
    highp vec4 cc_cameraPos;
    mediump vec4 cc_surfaceTransform;
    mediump vec4 cc_screenScale;
    mediump vec4 cc_exposure;
    mediump vec4 cc_mainLitDir;
    mediump vec4 cc_mainLitColor;
    mediump vec4 cc_ambientSky;
    mediump vec4 cc_ambientGround;
    mediump vec4 cc_fogColor;
    mediump vec4 cc_fogBase;
    mediump vec4 cc_fogAdd;
    mediump vec4 cc_nearFar;
    mediump vec4 cc_viewPort;
};
layout(set = 2, binding = 0) uniform CCLocal {
    highp mat4 cc_matWorld;
    highp mat4 cc_matWorldIT;
    highp vec4 cc_lightingMapUVParam;
    highp vec4 cc_localShadowBias;
};
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec2 a_texCoord;
layout(location = 2) in vec4 a_color;
layout(location = 0) out vec2 v_uv;
layout(location = 1) out vec4 v_color;
vec4 vert() {
    vec4 pos = vec4(a_position, 1.0);
    pos = cc_matViewProj * cc_matWorld * pos;
    v_uv = a_texCoord;
    v_color = a_color;
    return pos;
}
void main() { gl_Position = vert(); }
`;

const unlitFragGLSL4 = `
precision highp float;
layout(location = 0) in vec2 v_uv;
layout(location = 1) in vec4 v_color;
#if USE_COLOR
layout(set = 1, binding = 0) uniform MainColor {
    vec4 mainColor;
};
#endif
#if USE_TEXTURE
layout(set = 1, binding = 1) uniform sampler2D mainTexture;
#endif
vec4 frag() {
    vec4 color = vec4(1.0);
    #if USE_COLOR
        color *= mainColor;
    #endif
    #if USE_TEXTURE
        color *= texture(mainTexture, v_uv);
    #endif
    return color * v_color;
}
layout(location = 0) out vec4 cc_FragColor;
void main() { cc_FragColor = frag(); }
`;

/**
 * @zh 内置效果数据
 * @en Built-in effects data
 *
 * Note: Effects are ordered from simplest to most complex.
 * builtin-clear-stencil has empty builtins and should register without errors.
 * If that works, we can try more complex effects.
 */
export const builtinEffects: EffectData[] = [
    // builtin-clear-stencil (FIRST - simplest, no builtins)
    {
        name: 'builtin-clear-stencil',
        techniques: [
            {
                passes: [{
                    blendState: { targets: [{ blend: true }] },
                    rasterizerState: { cullMode: 0 },
                    program: 'clear-stencil|sprite-vs:vert|sprite-fs:frag',
                    depthStencilState: { depthTest: false, depthWrite: false }
                }]
            }
        ],
        shaders: [{
            name: 'clear-stencil|sprite-vs:vert|sprite-fs:frag',
            hash: 3507038093,
            builtins: {
                statistics: { CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS: 0, CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS: 0 },
                globals: { blocks: [], samplerTextures: [], buffers: [], images: [] },
                locals: { blocks: [], samplerTextures: [], buffers: [], images: [] }
            },
            defines: [],
            attributes: [
                { name: 'a_position', defines: [], format: 32, location: 0 }
            ],
            blocks: [],
            samplerTextures: [],
            buffers: [],
            images: [],
            textures: [],
            samplers: [],
            subpassInputs: [],
            glsl3: { vert: clearStencilVertGLSL3, frag: clearStencilFragGLSL3 },
            glsl4: { vert: clearStencilVertGLSL4, frag: clearStencilFragGLSL4 }
        }]
    },

    // builtin-sprite
    {
        name: 'builtin-sprite',
        techniques: [
            {
                passes: [{
                    blendState: {
                        targets: [{
                            blend: true,
                            blendSrc: 2, // SRC_ALPHA
                            blendDst: 4, // ONE_MINUS_SRC_ALPHA
                            blendDstAlpha: 4
                        }]
                    },
                    rasterizerState: { cullMode: 0 }, // NONE
                    program: 'sprite|sprite-vs:vert|sprite-fs:frag',
                    depthStencilState: { depthTest: false, depthWrite: false },
                    properties: { alphaThreshold: { value: [0.5], type: 13 } }
                }]
            }
        ],
        shaders: [{
            name: 'sprite|sprite-vs:vert|sprite-fs:frag',
            hash: 3438030836,
            builtins: {
                statistics: { CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS: 54, CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS: 1 },
                globals: {
                    blocks: [{ name: 'CCGlobal', defines: [] }, { name: 'CCCamera', defines: [] }],
                    samplerTextures: [],
                    buffers: [],
                    images: []
                },
                locals: {
                    blocks: [{ name: 'CCLocal', defines: ['USE_LOCAL'] }],
                    // NOTE: cc_spriteTexture removed from builtins to avoid ccesengine initialization order issue
                    // The texture is still bound through the material's texture properties
                    // 注意：从 builtins 中移除 cc_spriteTexture 以避免 ccesengine 初始化顺序问题
                    // 纹理仍然通过材质的纹理属性绑定
                    samplerTextures: [],
                    buffers: [],
                    images: []
                }
            },
            defines: [
                { name: 'USE_LOCAL', type: 'boolean' },
                { name: 'SAMPLE_FROM_RT', type: 'boolean' },
                { name: 'USE_PIXEL_ALIGNMENT', type: 'boolean' },
                { name: 'CC_USE_EMBEDDED_ALPHA', type: 'boolean' },
                { name: 'USE_ALPHA_TEST', type: 'boolean' },
                { name: 'USE_TEXTURE', type: 'boolean' },
                { name: 'IS_GRAY', type: 'boolean' }
            ],
            attributes: [
                { name: 'a_position', defines: [], format: 32, location: 0 },
                { name: 'a_texCoord', defines: [], format: 21, location: 1 },
                { name: 'a_color', defines: [], format: 44, location: 2 }
            ],
            blocks: [{
                name: 'ALPHA_TEST_DATA',
                defines: ['USE_ALPHA_TEST'],
                binding: 0,
                stageFlags: 16,
                members: [{ name: 'alphaThreshold', type: 13, count: 1 }]
            }],
            samplerTextures: [{
                name: 'cc_spriteTexture',
                type: 28, // SAMPLER2D
                count: 1,
                defines: ['USE_TEXTURE'],
                stageFlags: 16, // FRAGMENT
                binding: 1
            }],
            buffers: [],
            images: [],
            textures: [],
            samplers: [],
            subpassInputs: [],
            glsl3: { vert: spriteVertGLSL3, frag: spriteFragGLSL3 },
            glsl4: { vert: spriteVertGLSL4, frag: spriteFragGLSL4 }
        }]
    },

    // builtin-graphics
    {
        name: 'builtin-graphics',
        techniques: [
            {
                passes: [{
                    blendState: {
                        targets: [{
                            blend: true,
                            blendSrc: 1, // ONE
                            blendDst: 4, // ONE_MINUS_SRC_ALPHA
                            blendSrcAlpha: 1,
                            blendDstAlpha: 4
                        }]
                    },
                    rasterizerState: { cullMode: 0 },
                    program: 'graphics|vs:vert|fs:frag',
                    depthStencilState: { depthTest: false, depthWrite: false }
                }]
            }
        ],
        shaders: [{
            name: 'graphics|vs:vert|fs:frag',
            hash: 3387382926,
            builtins: {
                statistics: { CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS: 54, CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS: 0 },
                globals: {
                    blocks: [{ name: 'CCGlobal', defines: [] }, { name: 'CCCamera', defines: [] }],
                    samplerTextures: [],
                    buffers: [],
                    images: []
                },
                locals: {
                    blocks: [{ name: 'CCLocal', defines: [] }],
                    samplerTextures: [],
                    buffers: [],
                    images: []
                }
            },
            defines: [],
            attributes: [
                { name: 'a_position', defines: [], format: 32, location: 0 },
                { name: 'a_color', defines: [], format: 44, location: 1 },
                { name: 'a_dist', defines: [], format: 11, location: 2 }
            ],
            blocks: [],
            samplerTextures: [],
            buffers: [],
            images: [],
            textures: [],
            samplers: [],
            subpassInputs: [],
            glsl3: { vert: graphicsVertGLSL3, frag: graphicsFragGLSL3 },
            glsl4: { vert: graphicsVertGLSL4, frag: graphicsFragGLSL4 }
        }]
    },

    // builtin-unlit
    {
        name: 'builtin-unlit',
        techniques: [
            {
                passes: [{
                    rasterizerState: { cullMode: 2 }, // BACK
                    program: 'unlit|unlit-vs:vert|unlit-fs:frag',
                    properties: {
                        mainColor: { value: [1, 1, 1, 1], type: 16 },
                        mainTexture: { value: 'white', type: 28 }
                    }
                }]
            }
        ],
        shaders: [{
            name: 'unlit|unlit-vs:vert|unlit-fs:frag',
            hash: 2847392847,
            builtins: {
                statistics: { CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS: 54, CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS: 1 },
                globals: {
                    blocks: [{ name: 'CCGlobal', defines: [] }, { name: 'CCCamera', defines: [] }],
                    samplerTextures: [],
                    buffers: [],
                    images: []
                },
                locals: {
                    blocks: [{ name: 'CCLocal', defines: [] }],
                    samplerTextures: [],
                    buffers: [],
                    images: []
                }
            },
            defines: [
                { name: 'USE_COLOR', type: 'boolean' },
                { name: 'USE_TEXTURE', type: 'boolean' }
            ],
            attributes: [
                { name: 'a_position', defines: [], format: 32, location: 0 },
                { name: 'a_texCoord', defines: [], format: 21, location: 1 },
                { name: 'a_color', defines: [], format: 44, location: 2 }
            ],
            blocks: [{
                name: 'MainColor',
                defines: ['USE_COLOR'],
                binding: 0,
                stageFlags: 16,
                members: [{ name: 'mainColor', type: 16, count: 1 }]
            }],
            samplerTextures: [{
                name: 'mainTexture',
                type: 28,
                count: 1,
                defines: ['USE_TEXTURE'],
                stageFlags: 16,
                binding: 1
            }],
            buffers: [],
            images: [],
            textures: [],
            samplers: [],
            subpassInputs: [],
            glsl3: { vert: unlitVertGLSL3, frag: unlitFragGLSL3 },
            glsl4: { vert: unlitVertGLSL4, frag: unlitFragGLSL4 }
        }]
    }
];

export type { EffectData, ShaderInfo, TechniqueInfo, PassInfo };
