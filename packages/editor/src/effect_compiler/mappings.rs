//! @zh Effect 编译器映射表
//! @en Effect compiler mappings

use std::collections::HashMap;
use once_cell::sync::Lazy;

/// @zh GLSL 类型到 GFX 类型的映射
/// @en GLSL type to GFX type mapping
pub static TYPE_MAP: Lazy<HashMap<&'static str, i32>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert("bool", 1);
    m.insert("bvec2", 2);
    m.insert("bvec3", 3);
    m.insert("bvec4", 4);
    m.insert("int", 5);
    m.insert("ivec2", 6);
    m.insert("ivec3", 7);
    m.insert("ivec4", 8);
    m.insert("uint", 9);
    m.insert("uvec2", 10);
    m.insert("uvec3", 11);
    m.insert("uvec4", 12);
    m.insert("float", 13);
    m.insert("vec2", 14);
    m.insert("vec3", 15);
    m.insert("vec4", 16);
    m.insert("mat2", 17);
    m.insert("mat2x3", 18);
    m.insert("mat2x4", 19);
    m.insert("mat3x2", 20);
    m.insert("mat3", 21);
    m.insert("mat3x4", 22);
    m.insert("mat4x2", 23);
    m.insert("mat4x3", 24);
    m.insert("mat4", 25);
    m.insert("sampler1D", 26);
    m.insert("sampler1DArray", 27);
    m.insert("sampler2D", 28);
    m.insert("sampler2DArray", 29);
    m.insert("sampler3D", 30);
    m.insert("samplerCube", 31);
    m.insert("sampler", 32);
    m.insert("texture1D", 33);
    m.insert("texture1DArray", 34);
    m.insert("texture2D", 35);
    m.insert("texture2DArray", 36);
    m.insert("texture3D", 37);
    m.insert("textureCube", 38);
    m.insert("image1D", 39);
    m.insert("image1DArray", 40);
    m.insert("image2D", 41);
    m.insert("image2DArray", 42);
    m.insert("image3D", 43);
    m.insert("imageCube", 44);
    m.insert("subpassInput", 45);
    m
});

/// @zh 顶点格式映射
/// @en Vertex format mapping
pub static FORMAT_MAP: Lazy<HashMap<&'static str, i32>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert("float", 11);   // R32F
    m.insert("vec2", 21);    // RG32F
    m.insert("vec3", 32);    // RGB32F
    m.insert("vec4", 44);    // RGBA32F
    m.insert("int", 13);     // R32I
    m.insert("ivec2", 23);   // RG32I
    m.insert("ivec3", 34);   // RGB32I
    m.insert("ivec4", 46);   // RGBA32I
    m.insert("uint", 12);    // R32UI
    m.insert("uvec2", 22);   // RG32UI
    m.insert("uvec3", 33);   // RGB32UI
    m.insert("uvec4", 45);   // RGBA32UI
    m
});

/// @zh 类型大小映射（以字节为单位）
/// @en Type size mapping (in bytes)
pub fn get_type_size(t: i32) -> i32 {
    match t {
        1 => 4,        // bool
        2 => 8,        // bvec2
        3 => 12,       // bvec3
        4 => 16,       // bvec4
        5 => 4,        // int
        6 => 8,        // ivec2
        7 => 12,       // ivec3
        8 => 16,       // ivec4
        9 => 4,        // uint
        10 => 8,       // uvec2
        11 => 12,      // uvec3
        12 => 16,      // uvec4
        13 => 4,       // float
        14 => 8,       // vec2
        15 => 12,      // vec3
        16 => 16,      // vec4
        17 => 16,      // mat2
        18 => 24,      // mat2x3
        19 => 32,      // mat2x4
        20 => 24,      // mat3x2
        21 => 36,      // mat3
        22 => 48,      // mat3x4
        23 => 32,      // mat4x2
        24 => 48,      // mat4x3
        25 => 64,      // mat4
        _ => 0,
    }
}

/// @zh 检查是否为采样器类型
/// @en Check if type is a sampler
pub fn is_sampler(t: i32) -> bool {
    t >= 26 && t <= 32
}

/// @zh Shader 阶段位标志
/// @en Shader stage bit flags
pub const VERTEX_STAGE: i32 = 1;
pub const FRAGMENT_STAGE: i32 = 16;
pub const COMPUTE_STAGE: i32 = 32;

/// @zh 获取 shader 阶段位
/// @en Get shader stage bit
pub fn get_shader_stage(stage: &str) -> i32 {
    match stage {
        "vertex" | "vert" => VERTEX_STAGE,
        "fragment" | "frag" => FRAGMENT_STAGE,
        "compute" => COMPUTE_STAGE,
        _ => 0,
    }
}

/// @zh 混合因子字符串到枚举值映射
/// @en Blend factor string to enum mapping
pub static BLEND_FACTOR_MAP: Lazy<HashMap<&'static str, i32>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert("zero", 0);
    m.insert("one", 1);
    m.insert("src_alpha", 2);
    m.insert("dst_alpha", 3);
    m.insert("one_minus_src_alpha", 4);
    m.insert("one_minus_dst_alpha", 5);
    m.insert("src_color", 6);
    m.insert("dst_color", 7);
    m.insert("one_minus_src_color", 8);
    m.insert("one_minus_dst_color", 9);
    m.insert("src_alpha_saturate", 10);
    m.insert("constant_color", 11);
    m.insert("one_minus_constant_color", 12);
    m.insert("constant_alpha", 13);
    m.insert("one_minus_constant_alpha", 14);
    m
});

/// @zh 比较函数映射
/// @en Compare function mapping
pub static COMPARE_FUNC_MAP: Lazy<HashMap<&'static str, i32>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert("never", 0);
    m.insert("less", 1);
    m.insert("equal", 2);
    m.insert("less_equal", 3);
    m.insert("lequal", 3);
    m.insert("greater", 4);
    m.insert("not_equal", 5);
    m.insert("notequal", 5);
    m.insert("greater_equal", 6);
    m.insert("gequal", 6);
    m.insert("always", 7);
    m
});

/// @zh 剔除模式映射
/// @en Cull mode mapping
pub static CULL_MODE_MAP: Lazy<HashMap<&'static str, i32>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert("none", 0);
    m.insert("front", 1);
    m.insert("back", 2);
    m
});

/// @zh MurmurHash2 32位哈希算法
/// @en MurmurHash2 32-bit hash algorithm
pub fn murmurhash2_32_gc(data: &str, seed: u32) -> u32 {
    let bytes = data.as_bytes();
    let len = bytes.len();
    let m: u32 = 0x5bd1e995;
    let r: i32 = 24;

    let mut h = seed ^ (len as u32);
    let mut i = 0;

    while i + 4 <= len {
        let mut k = u32::from_le_bytes([bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]]);
        k = k.wrapping_mul(m);
        k ^= k >> r;
        k = k.wrapping_mul(m);
        h = h.wrapping_mul(m);
        h ^= k;
        i += 4;
    }

    match len - i {
        3 => {
            h ^= (bytes[i + 2] as u32) << 16;
            h ^= (bytes[i + 1] as u32) << 8;
            h ^= bytes[i] as u32;
            h = h.wrapping_mul(m);
        }
        2 => {
            h ^= (bytes[i + 1] as u32) << 8;
            h ^= bytes[i] as u32;
            h = h.wrapping_mul(m);
        }
        1 => {
            h ^= bytes[i] as u32;
            h = h.wrapping_mul(m);
        }
        _ => {}
    }

    h ^= h >> 13;
    h = h.wrapping_mul(m);
    h ^= h >> 15;

    h
}

/// @zh 内置 uniform block 名称
/// @en Builtin uniform block names
pub static BUILTIN_BLOCKS: Lazy<HashMap<&'static str, (i32, i32)>> = Lazy::new(|| {
    let mut m = HashMap::new();
    // (set, binding)
    m.insert("CCGlobal", (0, 0));
    m.insert("CCCamera", (0, 1));
    m.insert("CCShadow", (0, 2));
    m.insert("CCCSM", (0, 3));
    // SetIndex.LOCAL = 2, bindings from ModelLocalBindings enum
    m.insert("CCLocal", (2, 0));           // UBO_LOCAL = 0
    m.insert("CCLocalBatched", (2, 0));    // shares UBO_LOCAL
    m.insert("CCWorldBound", (2, 0));      // shares UBO_LOCAL
    m.insert("CCForwardLight", (2, 1));    // UBO_FORWARD_LIGHTS = 1
    m.insert("CCSkinningAnimation", (2, 2)); // UBO_SKINNING_ANIMATION = 2
    m.insert("CCSkinningTexture", (2, 3)); // UBO_SKINNING_TEXTURE = 3
    m.insert("CCSkinning", (2, 3));        // shares UBO_SKINNING_TEXTURE
    m.insert("CCMorph", (2, 4));           // UBO_MORPH = 4
    m.insert("CCUILocal", (2, 5));         // UBO_UI_LOCAL = 5
    m.insert("CCSH", (2, 6));              // UBO_SH = 6
    m
});

/// @zh 内置 sampler texture 名称
/// @en Builtin sampler texture names
pub static BUILTIN_SAMPLERS: Lazy<HashMap<&'static str, (i32, i32)>> = Lazy::new(|| {
    let mut m = HashMap::new();
    // (set, binding) - SetIndex.GLOBAL = 0, SetIndex.LOCAL = 2
    // Global samplers (set=0)
    m.insert("cc_shadowMap", (0, 4));
    m.insert("cc_spotShadowMap", (0, 5));
    m.insert("cc_environment", (0, 6));
    m.insert("cc_diffuseMap", (0, 7));
    // Local samplers (set=2) - from ModelLocalBindings enum
    m.insert("cc_jointTexture", (2, 7));        // SAMPLER_JOINTS = 7
    m.insert("cc_realtimeJoint", (2, 7));       // shares SAMPLER_JOINTS
    m.insert("cc_PositionDisplacements", (2, 8)); // SAMPLER_MORPH_POSITION = 8
    m.insert("cc_NormalDisplacements", (2, 9));   // SAMPLER_MORPH_NORMAL = 9
    m.insert("cc_TangentDisplacements", (2, 10)); // SAMPLER_MORPH_TANGENT = 10
    m
});
