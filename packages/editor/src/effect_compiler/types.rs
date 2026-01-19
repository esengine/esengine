//! @zh Effect 编译器类型定义
//! @en Effect compiler type definitions

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// @zh GFX 类型枚举
/// @en GFX Type enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum GfxType {
    Unknown = 0,
    Bool = 1,
    Bool2 = 2,
    Bool3 = 3,
    Bool4 = 4,
    Int = 5,
    Int2 = 6,
    Int3 = 7,
    Int4 = 8,
    Uint = 9,
    Uint2 = 10,
    Uint3 = 11,
    Uint4 = 12,
    Float = 13,
    Float2 = 14,
    Float3 = 15,
    Float4 = 16,
    Mat2 = 17,
    Mat2x3 = 18,
    Mat2x4 = 19,
    Mat3x2 = 20,
    Mat3 = 21,
    Mat3x4 = 22,
    Mat4x2 = 23,
    Mat4x3 = 24,
    Mat4 = 25,
    Sampler1D = 26,
    Sampler1DArray = 27,
    Sampler2D = 28,
    Sampler2DArray = 29,
    Sampler3D = 30,
    SamplerCube = 31,
    Sampler = 32,
    Texture1D = 33,
    Texture1DArray = 34,
    Texture2D = 35,
    Texture2DArray = 36,
    Texture3D = 37,
    TextureCube = 38,
    Image1D = 39,
    Image1DArray = 40,
    Image2D = 41,
    Image2DArray = 42,
    Image3D = 43,
    ImageCube = 44,
    SubpassInput = 45,
}

/// @zh Shader 阶段
/// @en Shader stage
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ShaderStage {
    Vertex = 1,
    Fragment = 16,
    Compute = 32,
}

/// @zh 混合因子
/// @en Blend factor
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BlendFactor {
    Zero = 0,
    One = 1,
    SrcAlpha = 2,
    DstAlpha = 3,
    OneMinusSrcAlpha = 4,
    OneMinusDstAlpha = 5,
    SrcColor = 6,
    DstColor = 7,
    OneMinusSrcColor = 8,
    OneMinusDstColor = 9,
    SrcAlphaSaturate = 10,
    ConstantColor = 11,
    OneMinusConstantColor = 12,
    ConstantAlpha = 13,
    OneMinusConstantAlpha = 14,
}

/// @zh 混合操作
/// @en Blend operation
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BlendOp {
    Add = 0,
    Sub = 1,
    RevSub = 2,
    Min = 3,
    Max = 4,
}

/// @zh 比较函数
/// @en Compare function
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CompareFunc {
    Never = 0,
    Less = 1,
    Equal = 2,
    LessEqual = 3,
    Greater = 4,
    NotEqual = 5,
    GreaterEqual = 6,
    Always = 7,
}

/// @zh 剔除模式
/// @en Cull mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CullMode {
    None = 0,
    Front = 1,
    Back = 2,
}

/// @zh 图元类型
/// @en Primitive mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum PrimitiveMode {
    PointList = 0,
    LineList = 1,
    LineStrip = 2,
    LineLoop = 3,
    LineListAdjacency = 4,
    LineStripAdjacency = 5,
    TriangleList = 7,
    TriangleStrip = 8,
    TriangleFan = 9,
    TriangleListAdjacency = 10,
    TriangleStripAdjacency = 11,
    TrianglePatchAdjacency = 12,
    QuadPatchList = 13,
}

/// @zh Uniform 成员
/// @en Uniform member
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UniformMember {
    pub name: String,
    #[serde(rename = "type")]
    pub member_type: i32,
    #[serde(default)]
    pub count: i32,
}

/// @zh Uniform Block
/// @en Uniform block
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UniformBlock {
    pub name: String,
    #[serde(default)]
    pub defines: Vec<serde_json::Value>,
    pub members: Vec<UniformMember>,
    #[serde(default)]
    pub binding: i32,
    #[serde(default)]
    pub set: i32,
    #[serde(default, rename = "stageFlags")]
    pub stage_flags: i32,
    #[serde(default, rename = "descriptorType")]
    pub descriptor_type: Option<i32>,
}

/// @zh Sampler Texture
/// @en Sampler texture
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SamplerTexture {
    pub name: String,
    #[serde(rename = "type")]
    pub sampler_type: i32,
    #[serde(default)]
    pub defines: Vec<serde_json::Value>,
    #[serde(default)]
    pub count: i32,
    #[serde(default)]
    pub binding: i32,
    #[serde(default)]
    pub set: i32,
    #[serde(default, rename = "stageFlags")]
    pub stage_flags: i32,
}

/// @zh Shader 属性
/// @en Shader attribute
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShaderAttribute {
    pub name: String,
    #[serde(default)]
    pub defines: Vec<serde_json::Value>,
    pub format: i32,
    #[serde(default, rename = "isNormalized")]
    pub is_normalized: bool,
    #[serde(default)]
    pub stream: i32,
    #[serde(default, rename = "isInstanced")]
    pub is_instanced: bool,
    pub location: i32,
}

/// @zh Shader Define
/// @en Shader define
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShaderDefine {
    pub name: String,
    #[serde(rename = "type")]
    pub define_type: String,
    #[serde(default)]
    pub range: Option<Vec<i32>>,
    #[serde(default)]
    pub options: Option<Vec<String>>,
    #[serde(default)]
    pub default: Option<serde_json::Value>,
}

/// @zh 描述符集布局
/// @en Descriptor set layout
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct DescriptorSetLayout {
    #[serde(default)]
    pub blocks: Vec<UniformBlock>,
    #[serde(default, rename = "samplerTextures")]
    pub sampler_textures: Vec<SamplerTexture>,
    #[serde(default)]
    pub samplers: Vec<serde_json::Value>,
    #[serde(default)]
    pub textures: Vec<serde_json::Value>,
    #[serde(default)]
    pub buffers: Vec<serde_json::Value>,
    #[serde(default)]
    pub images: Vec<serde_json::Value>,
    #[serde(default, rename = "subpassInputs")]
    pub subpass_inputs: Vec<serde_json::Value>,
}

/// @zh Shader GLSL 源码
/// @en Shader GLSL source
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ShaderGlsl {
    #[serde(default)]
    pub vert: String,
    #[serde(default)]
    pub frag: String,
    #[serde(default)]
    pub compute: String,
}

/// @zh Shader 信息
/// @en Shader info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShaderInfo {
    pub name: String,
    #[serde(default)]
    pub hash: u32,
    #[serde(default)]
    pub attributes: Vec<ShaderAttribute>,
    #[serde(default)]
    pub varyings: Vec<ShaderVarying>,
    #[serde(default)]
    pub blocks: Vec<UniformBlock>,
    #[serde(default, rename = "samplerTextures")]
    pub sampler_textures: Vec<SamplerTexture>,
    #[serde(default)]
    pub samplers: Vec<serde_json::Value>,
    #[serde(default)]
    pub textures: Vec<serde_json::Value>,
    #[serde(default)]
    pub buffers: Vec<serde_json::Value>,
    #[serde(default)]
    pub images: Vec<serde_json::Value>,
    #[serde(default, rename = "subpassInputs")]
    pub subpass_inputs: Vec<serde_json::Value>,
    #[serde(default)]
    pub defines: Vec<ShaderDefine>,
    #[serde(default)]
    pub descriptors: Vec<DescriptorSetLayout>,
    #[serde(default)]
    pub glsl4: ShaderGlsl,
    #[serde(default)]
    pub glsl3: ShaderGlsl,
    #[serde(default)]
    pub glsl1: ShaderGlsl,
    #[serde(default)]
    pub builtins: ShaderBuiltins,
}

/// @zh Shader Varying
/// @en Shader varying
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShaderVarying {
    pub name: String,
    #[serde(rename = "type")]
    pub varying_type: i32,
    #[serde(default)]
    pub count: i32,
    #[serde(default)]
    pub location: i32,
}

/// @zh Shader 内置变量
/// @en Shader builtins
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ShaderBuiltins {
    #[serde(default)]
    pub globals: ShaderBuiltinGlobals,
    #[serde(default)]
    pub locals: ShaderBuiltinLocals,
    #[serde(default)]
    pub statistics: ShaderStatistics,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ShaderBuiltinGlobals {
    #[serde(default)]
    pub blocks: Vec<BuiltinBlockInfo>,
    #[serde(default, rename = "samplerTextures")]
    pub sampler_textures: Vec<BuiltinSamplerInfo>,
    #[serde(default)]
    pub images: Vec<serde_json::Value>,
    #[serde(default)]
    pub buffers: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ShaderBuiltinLocals {
    #[serde(default)]
    pub blocks: Vec<BuiltinBlockInfo>,
    #[serde(default, rename = "samplerTextures")]
    pub sampler_textures: Vec<BuiltinSamplerInfo>,
    #[serde(default)]
    pub images: Vec<serde_json::Value>,
    #[serde(default)]
    pub buffers: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct BuiltinBlockInfo {
    pub name: String,
    #[serde(default)]
    pub defines: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct BuiltinSamplerInfo {
    pub name: String,
    #[serde(default)]
    pub defines: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ShaderStatistics {
    #[serde(default, rename = "CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS")]
    pub cc_effect_used_vertex_uniform_vectors: i32,
    #[serde(default, rename = "CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS")]
    pub cc_effect_used_fragment_uniform_vectors: i32,
}

/// @zh 混合目标状态
/// @en Blend target state
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct BlendTargetState {
    #[serde(default)]
    pub blend: bool,
    #[serde(default, rename = "blendSrc")]
    pub blend_src: Option<String>,
    #[serde(default, rename = "blendDst")]
    pub blend_dst: Option<String>,
    #[serde(default, rename = "blendSrcAlpha")]
    pub blend_src_alpha: Option<String>,
    #[serde(default, rename = "blendDstAlpha")]
    pub blend_dst_alpha: Option<String>,
    #[serde(default, rename = "blendEq")]
    pub blend_eq: Option<String>,
    #[serde(default, rename = "blendAlphaEq")]
    pub blend_alpha_eq: Option<String>,
    #[serde(default, rename = "blendColorMask")]
    pub blend_color_mask: Option<i32>,
}

/// @zh 混合状态
/// @en Blend state
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct BlendState {
    #[serde(default, rename = "isA2C")]
    pub is_a2c: bool,
    #[serde(default, rename = "isIndepend")]
    pub is_independ: bool,
    #[serde(default, rename = "blendColor")]
    pub blend_color: Option<Vec<f32>>,
    #[serde(default)]
    pub targets: Vec<BlendTargetState>,
}

/// @zh 深度模板状态
/// @en Depth stencil state
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct DepthStencilState {
    #[serde(default, rename = "depthTest")]
    pub depth_test: Option<bool>,
    #[serde(default, rename = "depthWrite")]
    pub depth_write: Option<bool>,
    #[serde(default, rename = "depthFunc")]
    pub depth_func: Option<String>,
    #[serde(default, rename = "stencilTestFront")]
    pub stencil_test_front: Option<bool>,
    #[serde(default, rename = "stencilFuncFront")]
    pub stencil_func_front: Option<String>,
    #[serde(default, rename = "stencilReadMaskFront")]
    pub stencil_read_mask_front: Option<i32>,
    #[serde(default, rename = "stencilWriteMaskFront")]
    pub stencil_write_mask_front: Option<i32>,
    #[serde(default, rename = "stencilFailOpFront")]
    pub stencil_fail_op_front: Option<String>,
    #[serde(default, rename = "stencilZFailOpFront")]
    pub stencil_z_fail_op_front: Option<String>,
    #[serde(default, rename = "stencilPassOpFront")]
    pub stencil_pass_op_front: Option<String>,
    #[serde(default, rename = "stencilRefFront")]
    pub stencil_ref_front: Option<i32>,
    #[serde(default, rename = "stencilTestBack")]
    pub stencil_test_back: Option<bool>,
    #[serde(default, rename = "stencilFuncBack")]
    pub stencil_func_back: Option<String>,
    #[serde(default, rename = "stencilReadMaskBack")]
    pub stencil_read_mask_back: Option<i32>,
    #[serde(default, rename = "stencilWriteMaskBack")]
    pub stencil_write_mask_back: Option<i32>,
    #[serde(default, rename = "stencilFailOpBack")]
    pub stencil_fail_op_back: Option<String>,
    #[serde(default, rename = "stencilZFailOpBack")]
    pub stencil_z_fail_op_back: Option<String>,
    #[serde(default, rename = "stencilPassOpBack")]
    pub stencil_pass_op_back: Option<String>,
    #[serde(default, rename = "stencilRefBack")]
    pub stencil_ref_back: Option<i32>,
}

/// @zh 光栅化状态
/// @en Rasterizer state
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct RasterizerState {
    #[serde(default, rename = "isDiscard")]
    pub is_discard: Option<bool>,
    #[serde(default, rename = "polygonMode")]
    pub polygon_mode: Option<String>,
    #[serde(default, rename = "shadeModel")]
    pub shade_model: Option<String>,
    #[serde(default, rename = "cullMode")]
    pub cull_mode: Option<String>,
    #[serde(default, rename = "isFrontFaceCCW")]
    pub is_front_face_ccw: Option<bool>,
    #[serde(default, rename = "depthBiasEnabled")]
    pub depth_bias_enabled: Option<bool>,
    #[serde(default, rename = "depthBias")]
    pub depth_bias: Option<f32>,
    #[serde(default, rename = "depthBiasClamp")]
    pub depth_bias_clamp: Option<f32>,
    #[serde(default, rename = "depthBiasSlop")]
    pub depth_bias_slop: Option<f32>,
    #[serde(default, rename = "isDepthClip")]
    pub is_depth_clip: Option<bool>,
    #[serde(default, rename = "isMultisample")]
    pub is_multisample: Option<bool>,
    #[serde(default, rename = "lineWidth")]
    pub line_width: Option<f32>,
}

/// @zh Pass 定义
/// @en Pass definition
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PassDef {
    #[serde(default)]
    pub program: Option<String>,
    #[serde(default)]
    pub vert: Option<String>,
    #[serde(default)]
    pub frag: Option<String>,
    #[serde(default)]
    pub compute: Option<String>,
    #[serde(default)]
    pub priority: Option<serde_json::Value>,
    #[serde(default)]
    pub primitive: Option<String>,
    #[serde(default)]
    pub stage: Option<String>,
    #[serde(default)]
    pub phase: Option<serde_json::Value>,
    #[serde(default, rename = "propertyIndex")]
    pub property_index: Option<i32>,
    #[serde(default, rename = "embeddedMacros")]
    pub embedded_macros: Option<HashMap<String, serde_json::Value>>,
    #[serde(default)]
    pub properties: Option<HashMap<String, serde_json::Value>>,
    #[serde(default, rename = "rasterizerState")]
    pub rasterizer_state: Option<RasterizerState>,
    #[serde(default, rename = "depthStencilState")]
    pub depth_stencil_state: Option<DepthStencilState>,
    #[serde(default, rename = "blendState")]
    pub blend_state: Option<BlendState>,
    #[serde(default, rename = "dynamicStates")]
    pub dynamic_states: Option<Vec<String>>,
}

/// @zh Technique 定义
/// @en Technique definition
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TechniqueDef {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub passes: Vec<PassDef>,
}

/// @zh 编译后的 Effect
/// @en Compiled effect
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompiledEffect {
    pub name: String,
    #[serde(default)]
    pub techniques: Vec<TechniqueDef>,
    #[serde(default)]
    pub shaders: Vec<ShaderInfo>,
    #[serde(default)]
    pub combinations: Vec<serde_json::Value>,
    #[serde(default)]
    pub dependencies: Vec<String>,
}

/// @zh Effect 编辑器信息
/// @en Effect editor info
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct EffectEditorInfo {
    #[serde(default)]
    pub hide: bool,
    #[serde(default)]
    pub inspector: Option<String>,
}

/// @zh Effect 完整信息
/// @en Effect full info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EffectInfo {
    pub name: String,
    #[serde(default)]
    pub editor: EffectEditorInfo,
    #[serde(default)]
    pub techniques: Vec<TechniqueDef>,
    #[serde(default)]
    pub shaders: Vec<ShaderInfo>,
    #[serde(default)]
    pub dependencies: Vec<String>,
}
