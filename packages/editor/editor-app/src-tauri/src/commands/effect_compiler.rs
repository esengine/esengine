//! Effect Compiler Module
//! Effect 编译器模块
//!
//! Compiles .effect files into JSON format for ccesengine runtime.
//! 将 .effect 文件编译为 ccesengine 运行时使用的 JSON 格式。

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use regex::Regex;

// ============================================================================
// YAML parsing structures (for serde_yaml deserialization)
// YAML 解析结构（用于 serde_yaml 反序列化）
// ============================================================================

/// Raw YAML structure for CCEffect
/// CCEffect 的原始 YAML 结构
#[derive(Debug, Deserialize)]
struct YamlCCEffect {
    techniques: Vec<YamlTechnique>,
}

#[derive(Debug, Deserialize)]
struct YamlTechnique {
    name: Option<String>,
    passes: Vec<YamlPass>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct YamlPass {
    vert: String,
    frag: String,
    #[serde(default)]
    phase: Option<String>,
    #[serde(default)]
    property_index: Option<u32>,
    #[serde(default)]
    properties: Option<serde_yaml::Value>,
    #[serde(default)]
    blend_state: Option<YamlBlendState>,
    #[serde(default)]
    depth_stencil_state: Option<YamlDepthStencilState>,
    #[serde(default)]
    rasterizer_state: Option<YamlRasterizerState>,
}

#[derive(Debug, Deserialize)]
struct YamlBlendState {
    #[serde(default)]
    targets: Vec<YamlBlendTarget>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct YamlBlendTarget {
    #[serde(default)]
    blend: Option<bool>,
    #[serde(default)]
    blend_src: Option<String>,
    #[serde(default)]
    blend_dst: Option<String>,
    #[serde(default)]
    blend_src_alpha: Option<String>,
    #[serde(default)]
    blend_dst_alpha: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct YamlDepthStencilState {
    #[serde(default)]
    depth_test: Option<bool>,
    #[serde(default)]
    depth_write: Option<bool>,
    // Additional stencil fields (not used for now but parsed for compatibility)
    #[serde(default)]
    stencil_test_front: Option<bool>,
    #[serde(default)]
    stencil_func_front: Option<String>,
    #[serde(default)]
    stencil_pass_op_front: Option<String>,
    #[serde(default)]
    stencil_ref: Option<u32>,
    #[serde(default)]
    stencil_read_mask: Option<u32>,
    #[serde(default)]
    stencil_write_mask: Option<u32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct YamlRasterizerState {
    #[serde(default)]
    cull_mode: Option<String>,
}

/// Shader stage flags
/// 着色器阶段标志
pub mod stage_flags {
    pub const VERTEX: u32 = 1;
    pub const FRAGMENT: u32 = 16;
    pub const ALL: u32 = 17;
}

/// Uniform type constants (matching ccesengine's Type enum)
/// Uniform 类型常量（与 ccesengine 的 Type 枚举匹配）
pub mod uniform_type {
    pub const FLOAT: u32 = 13;
    pub const FLOAT2: u32 = 14;
    pub const FLOAT3: u32 = 15;
    pub const FLOAT4: u32 = 16;
    pub const MAT4: u32 = 25;
    pub const SAMPLER2D: u32 = 28;
}

/// Attribute format constants
/// 属性格式常量
pub mod attr_format {
    pub const RG32F: u32 = 21;      // vec2
    pub const RGB32F: u32 = 32;     // vec3
    pub const RGBA32F: u32 = 44;    // vec4
    pub const RGBA8: u32 = 44;      // vec4 normalized
}

/// Blend factor constants
/// 混合因子常量
pub mod blend_factor {
    pub const ZERO: u32 = 0;
    pub const ONE: u32 = 1;
    pub const SRC_ALPHA: u32 = 2;
    pub const DST_ALPHA: u32 = 3;
    pub const ONE_MINUS_SRC_ALPHA: u32 = 4;
    pub const ONE_MINUS_DST_ALPHA: u32 = 5;
}

// ============================================================================
// Output structures (JSON format for ccesengine)
// 输出结构（ccesengine 使用的 JSON 格式）
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompiledEffect {
    pub name: String,
    pub techniques: Vec<TechniqueInfo>,
    pub shaders: Vec<ShaderInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechniqueInfo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    pub passes: Vec<PassInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PassInfo {
    pub program: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub blend_state: Option<BlendStateInfo>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rasterizer_state: Option<RasterizerStateInfo>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub depth_stencil_state: Option<DepthStencilStateInfo>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub properties: Option<HashMap<String, PropertyInfo>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlendStateInfo {
    pub targets: Vec<BlendTargetInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BlendTargetInfo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub blend: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub blend_src: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub blend_dst: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub blend_src_alpha: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub blend_dst_alpha: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RasterizerStateInfo {
    pub cull_mode: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DepthStencilStateInfo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub depth_test: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub depth_write: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyInfo {
    pub value: serde_json::Value,
    #[serde(rename = "type")]
    pub prop_type: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShaderInfo {
    pub name: String,
    pub hash: u64,
    pub builtins: BuiltinsInfo,
    pub defines: Vec<DefineInfo>,
    pub attributes: Vec<AttributeInfo>,
    pub blocks: Vec<BlockInfo>,
    #[serde(rename = "samplerTextures")]
    pub sampler_textures: Vec<SamplerTextureInfo>,
    pub buffers: Vec<serde_json::Value>,
    pub images: Vec<serde_json::Value>,
    pub textures: Vec<serde_json::Value>,
    pub samplers: Vec<serde_json::Value>,
    #[serde(rename = "subpassInputs")]
    pub subpass_inputs: Vec<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub glsl4: Option<GlslSource>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub glsl3: Option<GlslSource>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub glsl1: Option<GlslSource>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlslSource {
    pub vert: String,
    pub frag: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuiltinsInfo {
    pub statistics: HashMap<String, u32>,
    pub globals: BuiltinBindingsInfo,
    pub locals: BuiltinBindingsInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BuiltinBindingsInfo {
    pub blocks: Vec<BuiltinBlockRef>,
    pub sampler_textures: Vec<BuiltinSamplerRef>,
    pub buffers: Vec<serde_json::Value>,
    pub images: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuiltinBlockRef {
    pub name: String,
    pub defines: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuiltinSamplerRef {
    pub name: String,
    pub defines: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DefineInfo {
    pub name: String,
    #[serde(rename = "type")]
    pub define_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub range: Option<Vec<i32>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AttributeInfo {
    pub name: String,
    pub defines: Vec<String>,
    pub format: u32,
    pub location: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_normalized: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_instanced: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BlockInfo {
    pub name: String,
    pub defines: Vec<String>,
    pub binding: u32,
    pub stage_flags: u32,
    pub members: Vec<UniformMember>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UniformMember {
    pub name: String,
    #[serde(rename = "type")]
    pub member_type: u32,
    pub count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SamplerTextureInfo {
    pub name: String,
    #[serde(rename = "type")]
    pub sampler_type: u32,
    pub count: u32,
    pub defines: Vec<String>,
    pub stage_flags: u32,
    pub binding: u32,
}

// ============================================================================
// Effect Compiler Implementation
// Effect 编译器实现
// ============================================================================

pub struct EffectCompiler {
    /// Chunk cache: path -> content
    /// Chunk 缓存：路径 -> 内容
    chunks: HashMap<String, String>,
    /// Engine root path (for resolving chunks)
    /// 引擎根路径（用于解析 chunks）
    engine_path: PathBuf,
}

impl EffectCompiler {
    pub fn new(engine_path: &Path) -> Self {
        Self {
            chunks: HashMap::new(),
            engine_path: engine_path.to_path_buf(),
        }
    }

    /// Load a chunk file and cache it
    /// 加载 chunk 文件并缓存
    fn load_chunk(&mut self, include_path: &str) -> Result<String, String> {
        // Check cache first
        if let Some(content) = self.chunks.get(include_path) {
            return Ok(content.clone());
        }

        // Resolve the chunk path
        // <builtin/uniforms/cc-global> -> engine/editor/assets/chunks/builtin/uniforms/cc-global.chunk
        let chunk_path = self.engine_path
            .join("editor/assets/chunks")
            .join(include_path)
            .with_extension("chunk");

        let content = fs::read_to_string(&chunk_path)
            .map_err(|e| format!("Failed to load chunk '{}': {}", include_path, e))?;

        self.chunks.insert(include_path.to_string(), content.clone());
        Ok(content)
    }

    /// Resolve #include directives in GLSL code
    /// 解析 GLSL 代码中的 #include 指令
    fn resolve_includes(&mut self, glsl: &str) -> Result<String, String> {
        let include_re = Regex::new(r#"#include\s+<([^>]+)>"#).unwrap();
        let mut result = glsl.to_string();
        let mut iterations = 0;
        const MAX_ITERATIONS: i32 = 100; // Prevent infinite loops

        while include_re.is_match(&result) && iterations < MAX_ITERATIONS {
            iterations += 1;
            let mut new_result = result.clone();

            for cap in include_re.captures_iter(&result) {
                let full_match = cap.get(0).unwrap().as_str();
                let include_path = cap.get(1).unwrap().as_str();

                let chunk_content = self.load_chunk(include_path)?;
                new_result = new_result.replace(full_match, &chunk_content);
            }

            result = new_result;
        }

        Ok(result)
    }

    /// Parse CCEffect YAML block using serde_yaml
    /// 使用 serde_yaml 解析 CCEffect YAML 块
    ///
    /// This properly handles YAML anchor/alias (&props, *props, etc.)
    /// 这正确处理 YAML 锚点/别名 (&props, *props, 等)
    fn parse_cc_effect(&self, yaml_content: &str) -> Result<Vec<TechniqueInfo>, String> {
        // Parse YAML using serde_yaml which handles anchors/aliases correctly
        let yaml_effect: YamlCCEffect = serde_yaml::from_str(yaml_content)
            .map_err(|e| format!("Failed to parse CCEffect YAML: {}", e))?;

        // Convert YAML structures to output structures
        let mut techniques = Vec::new();

        for yaml_tech in yaml_effect.techniques {
            let mut passes = Vec::new();

            for yaml_pass in yaml_tech.passes {
                // Build program name from vert and frag
                // Format: "{vert}|{frag}" e.g., "sprite-vs:vert|sprite-fs:frag"
                let program = format!("{}|{}", yaml_pass.vert, yaml_pass.frag);

                // Convert blend state
                let blend_state = yaml_pass.blend_state.map(|bs| {
                    BlendStateInfo {
                        targets: bs.targets.into_iter().map(|t| {
                            BlendTargetInfo {
                                blend: t.blend,
                                blend_src: t.blend_src.map(|s| parse_blend_factor(&s)),
                                blend_dst: t.blend_dst.map(|s| parse_blend_factor(&s)),
                                blend_src_alpha: t.blend_src_alpha.map(|s| parse_blend_factor(&s)),
                                blend_dst_alpha: t.blend_dst_alpha.map(|s| parse_blend_factor(&s)),
                            }
                        }).collect(),
                    }
                });

                // Convert depth stencil state
                let depth_stencil_state = yaml_pass.depth_stencil_state.map(|ds| {
                    DepthStencilStateInfo {
                        depth_test: ds.depth_test,
                        depth_write: ds.depth_write,
                    }
                });

                // Convert rasterizer state
                let rasterizer_state = yaml_pass.rasterizer_state.map(|rs| {
                    RasterizerStateInfo {
                        cull_mode: rs.cull_mode.map(|m| parse_cull_mode(&m)).unwrap_or(0),
                    }
                });

                passes.push(PassInfo {
                    program,
                    blend_state,
                    rasterizer_state,
                    depth_stencil_state,
                    properties: None,
                });
            }

            techniques.push(TechniqueInfo {
                name: yaml_tech.name,
                passes,
            });
        }

        Ok(techniques)
    }

    /// Extract defines from GLSL code
    /// 从 GLSL 代码中提取 defines
    fn extract_defines(&self, glsl: &str) -> Vec<DefineInfo> {
        let mut defines = Vec::new();
        let define_re = Regex::new(r"#if\s+(\w+)|#ifdef\s+(\w+)").unwrap();
        let mut seen = std::collections::HashSet::new();

        for cap in define_re.captures_iter(glsl) {
            let name = cap.get(1).or_else(|| cap.get(2)).unwrap().as_str();
            // Skip internal/reserved defines
            if name.starts_with("CC_") && !name.starts_with("CC_USE_") {
                continue;
            }
            if !seen.contains(name) {
                seen.insert(name.to_string());
                defines.push(DefineInfo {
                    name: name.to_string(),
                    define_type: "boolean".to_string(),
                    range: None,
                    options: None,
                    default: None,
                });
            }
        }

        defines
    }

    /// Extract attributes from GLSL code
    /// 从 GLSL 代码中提取属性
    fn extract_attributes(&self, glsl: &str) -> Vec<AttributeInfo> {
        let mut attrs = Vec::new();
        // Match: in vec3 a_position; or layout(location = 0) in vec3 a_position;
        let attr_re = Regex::new(r"(?:layout\s*\(\s*location\s*=\s*(\d+)\s*\)\s*)?in\s+(vec[234]|float|mat[234])\s+(\w+)\s*;").unwrap();
        let mut location = 0u32;

        for cap in attr_re.captures_iter(glsl) {
            let explicit_loc = cap.get(1).map(|m| m.as_str().parse::<u32>().unwrap_or(location));
            let attr_type = cap.get(2).unwrap().as_str();
            let name = cap.get(3).unwrap().as_str();

            let format = match attr_type {
                "float" => attr_format::RG32F,
                "vec2" => attr_format::RG32F,
                "vec3" => attr_format::RGB32F,
                "vec4" => attr_format::RGBA32F,
                _ => attr_format::RGBA32F,
            };

            let loc = explicit_loc.unwrap_or(location);
            attrs.push(AttributeInfo {
                name: name.to_string(),
                defines: Vec::new(),
                format,
                location: loc,
                is_normalized: None,
                is_instanced: None,
            });

            location = loc + 1;
        }

        attrs
    }

    /// Extract uniform blocks from GLSL code
    /// 从 GLSL 代码中提取 uniform blocks
    fn extract_blocks(&self, glsl: &str) -> Vec<BlockInfo> {
        let mut blocks = Vec::new();
        // Match: uniform BLOCK_NAME { ... };
        let block_re = Regex::new(r"uniform\s+(\w+)\s*\{([^}]*)\}").unwrap();
        let member_re = Regex::new(r"(\w+)\s+(\w+)\s*;").unwrap();

        let mut binding = 0u32;
        for cap in block_re.captures_iter(glsl) {
            let name = cap.get(1).unwrap().as_str();
            let body = cap.get(2).unwrap().as_str();

            // Skip builtin blocks (CCGlobal, CCCamera, CCLocal)
            if name.starts_with("CC") {
                continue;
            }

            let mut members = Vec::new();
            for mem_cap in member_re.captures_iter(body) {
                let mem_type = mem_cap.get(1).unwrap().as_str();
                let mem_name = mem_cap.get(2).unwrap().as_str();
                members.push(UniformMember {
                    name: mem_name.to_string(),
                    member_type: parse_uniform_type(mem_type),
                    count: 1,
                });
            }

            if !members.is_empty() {
                blocks.push(BlockInfo {
                    name: name.to_string(),
                    defines: Vec::new(),
                    binding,
                    stage_flags: stage_flags::FRAGMENT,
                    members,
                });
                binding += 1;
            }
        }

        blocks
    }

    /// Extract builtin bindings info
    /// 提取内置绑定信息
    fn extract_builtins(&self, glsl: &str) -> BuiltinsInfo {
        let mut globals = BuiltinBindingsInfo {
            blocks: Vec::new(),
            sampler_textures: Vec::new(),
            buffers: Vec::new(),
            images: Vec::new(),
        };
        let mut locals = BuiltinBindingsInfo {
            blocks: Vec::new(),
            sampler_textures: Vec::new(),
            buffers: Vec::new(),
            images: Vec::new(),
        };

        // Check for CCGlobal
        if glsl.contains("CCGlobal") || glsl.contains("cc_time") || glsl.contains("cc_screenSize") {
            globals.blocks.push(BuiltinBlockRef {
                name: "CCGlobal".to_string(),
                defines: Vec::new(),
            });
        }

        // Check for CCCamera
        if glsl.contains("CCCamera") || glsl.contains("cc_matView") || glsl.contains("cc_matProj") {
            globals.blocks.push(BuiltinBlockRef {
                name: "CCCamera".to_string(),
                defines: Vec::new(),
            });
        }

        // Check for CCLocal
        if glsl.contains("CCLocal") || glsl.contains("cc_matWorld") {
            locals.blocks.push(BuiltinBlockRef {
                name: "CCLocal".to_string(),
                defines: vec!["USE_LOCAL".to_string()],
            });
        }

        // Extract builtin(local) sampler textures
        // These samplers are marked with #pragma builtin(local) and need to be
        // added to builtins.locals.samplerTextures for proper WebGL binding
        // 提取 builtin(local) 采样器纹理
        // 这些采样器使用 #pragma builtin(local) 标记，需要添加到
        // builtins.locals.samplerTextures 以便正确的 WebGL 绑定
        self.extract_builtin_local_samplers(glsl, &mut locals.sampler_textures);

        BuiltinsInfo {
            statistics: HashMap::from([
                ("CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS".to_string(), 54),
                ("CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS".to_string(), 1),
            ]),
            globals,
            locals,
        }
    }

    /// Extract builtin(local) sampler textures from GLSL code
    /// 从 GLSL 代码中提取 builtin(local) 采样器纹理
    fn extract_builtin_local_samplers(&self, glsl: &str, samplers: &mut Vec<BuiltinSamplerRef>) {
        // Known builtin local samplers and their associated defines
        // 已知的内置本地采样器及其关联的 defines
        let builtin_samplers: &[(&str, &[&str])] = &[
            ("cc_spriteTexture", &["USE_TEXTURE"]),
            ("cc_lightingMap", &[]),
            ("cc_jointTexture", &["CC_USE_BAKED_ANIMATION"]),
            ("cc_realtimeJoint", &["CC_USE_REAL_TIME_JOINT_TEXTURE"]),
            ("cc_reflectionProbeCubemap", &[]),
            ("cc_reflectionProbePlanarMap", &[]),
            ("cc_reflectionProbeDataMap", &[]),
            ("cc_PositionDisplacements", &["CC_MORPH_TARGET_HAS_POSITION"]),
            ("cc_NormalDisplacements", &["CC_MORPH_TARGET_HAS_NORMAL"]),
            ("cc_TangentDisplacements", &["CC_MORPH_TARGET_HAS_TANGENT"]),
        ];

        for (name, defines) in builtin_samplers {
            if glsl.contains(name) {
                samplers.push(BuiltinSamplerRef {
                    name: name.to_string(),
                    defines: defines.iter().map(|s| s.to_string()).collect(),
                });
            }
        }
    }

    /// Calculate hash for shader
    /// 计算着色器哈希
    fn calculate_hash(&self, name: &str, glsl: &str) -> u64 {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        name.hash(&mut hasher);
        glsl.hash(&mut hasher);
        hasher.finish()
    }

    /// Compile a single .effect file
    /// 编译单个 .effect 文件
    pub fn compile(&mut self, effect_path: &Path) -> Result<CompiledEffect, String> {
        let content = fs::read_to_string(effect_path)
            .map_err(|e| format!("Failed to read effect file: {}", e))?;

        // Get base filename without extension
        let file_stem = effect_path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("unknown")
            .to_string();

        // Determine effect name based on path
        // - Effects in "pipeline/" folder need "pipeline/" prefix (e.g., "pipeline/skybox")
        // - Effects in "for2d/", "internal/", or root just use filename (e.g., "builtin-sprite")
        let path_str = effect_path.to_string_lossy();
        let name = if path_str.contains("pipeline/") || path_str.contains("pipeline\\") {
            format!("pipeline/{}", file_stem)
        } else {
            file_stem
        };

        // Extract CCEffect block (format: CCEffect %{ ... }%)
        let effect_re = Regex::new(r"CCEffect\s*%\{([\s\S]*?)\}%").unwrap();
        let yaml_content = effect_re
            .captures(&content)
            .and_then(|c| c.get(1))
            .map(|m| m.as_str())
            .ok_or("No CCEffect block found")?;

        let mut techniques = self.parse_cc_effect(yaml_content)?;

        // Build shader program name prefix:
        // "builtin-sprite" -> "sprite"
        // "pipeline/skybox" -> "pipeline/skybox" (keep as-is)
        let shader_prefix = if name.starts_with("builtin-") {
            name.strip_prefix("builtin-").unwrap_or(&name)
        } else {
            &name
        };

        // Update pass.program to include the effect name prefix
        // Format: "{shader_prefix}|{vert_program}:{vert_entry}|{frag_program}:{frag_entry}"
        for tech in &mut techniques {
            for pass in &mut tech.passes {
                pass.program = format!("{}|{}", shader_prefix, pass.program);
            }
        }

        // Extract CCProgram blocks
        let program_re = Regex::new(r"CCProgram\s+(\w+(?:-\w+)*)\s*%\{([\s\S]*?)\}%").unwrap();
        let mut programs: HashMap<String, String> = HashMap::new();

        for cap in program_re.captures_iter(&content) {
            let prog_name = cap.get(1).unwrap().as_str();
            let prog_code = cap.get(2).unwrap().as_str();
            programs.insert(prog_name.to_string(), prog_code.to_string());
        }

        // Build shaders
        let mut shaders = Vec::new();

        for tech in &techniques {
            for pass in &tech.passes {
                // pass.program format: "sprite-vs:vert|sprite-fs:frag"
                let parts: Vec<&str> = pass.program.split('|').collect();
                if parts.len() < 2 {
                    continue;
                }

                let mut vert_source = String::new();
                let mut frag_source = String::new();

                for part in &parts {
                    let sub: Vec<&str> = part.split(':').collect();
                    if sub.len() >= 2 {
                        let prog_name = sub[0];
                        let func_name = sub[1];
                        if let Some(code) = programs.get(prog_name) {
                            let resolved = self.resolve_includes(code)?;
                            if func_name == "vert" {
                                vert_source = self.build_glsl_source(&resolved, "vert")?;
                            } else if func_name == "frag" {
                                frag_source = self.build_glsl_source(&resolved, "frag")?;
                            }
                        }
                    }
                }

                let combined = format!("{}\n{}", vert_source, frag_source);
                // Shader name is the same as pass.program
                // Format: "{shader_prefix}|{vert_program}:{vert_entry}|{frag_program}:{frag_entry}"
                // Example: "sprite|sprite-vs:vert|sprite-fs:frag"
                let shader_name = pass.program.clone();

                shaders.push(ShaderInfo {
                    name: shader_name.clone(),
                    hash: self.calculate_hash(&shader_name, &combined),
                    builtins: self.extract_builtins(&combined),
                    defines: self.extract_defines(&combined),
                    attributes: self.extract_attributes(&vert_source),
                    blocks: self.extract_blocks(&combined),
                    sampler_textures: Vec::new(),
                    buffers: Vec::new(),
                    images: Vec::new(),
                    textures: Vec::new(),
                    samplers: Vec::new(),
                    subpass_inputs: Vec::new(),
                    glsl4: Some(GlslSource {
                        vert: vert_source.clone(),
                        frag: frag_source.clone(),
                    }),
                    glsl3: Some(GlslSource {
                        vert: vert_source.clone(),
                        frag: frag_source.clone(),
                    }),
                    glsl1: Some(GlslSource {
                        vert: vert_source,
                        frag: frag_source,
                    }),
                });
            }
        }

        Ok(CompiledEffect {
            name,
            techniques,
            shaders,
        })
    }

    /// Build final GLSL source with proper structure
    /// 构建带有正确结构的最终 GLSL 源码
    fn build_glsl_source(&self, code: &str, stage: &str) -> Result<String, String> {
        // Transform GLSL for WebGL2/GLSL ES 3.0 compatibility
        let transformed = self.transform_glsl_for_webgl2(code);

        let mut output = String::new();
        output.push_str("precision highp float;\n");

        // Add the processed code
        output.push_str(&transformed);

        // Add main function wrapper if needed
        if !transformed.contains("void main()") {
            if stage == "vert" {
                output.push_str("\nvoid main() { gl_Position = vert(); }\n");
            } else {
                output.push_str("\nlayout(location = 0) out vec4 cc_FragColor;\n");
                output.push_str("void main() { cc_FragColor = frag(); }\n");
            }
        }

        Ok(output)
    }

    /// Transform GLSL from Vulkan-style to WebGL2/GLSL ES 3.0 style
    /// 将 Vulkan 风格的 GLSL 转换为 WebGL2/GLSL ES 3.0 风格
    fn transform_glsl_for_webgl2(&self, code: &str) -> String {
        let mut result = String::new();
        let layout_re = Regex::new(r"layout\s*\(\s*set\s*=\s*\d+\s*,\s*binding\s*=\s*\d+\s*\)").unwrap();

        for line in code.lines() {
            let trimmed = line.trim();

            // Skip #pragma builtin directives - they're Vulkan/ccesengine specific
            if trimmed.starts_with("#pragma builtin") {
                continue;
            }

            // Transform layout qualifiers for WebGL2
            if trimmed.contains("layout(set =") && trimmed.contains("uniform") {
                // Check if this is a uniform block (ends with { or has { somewhere)
                // or a sampler declaration (has sampler2D, samplerCube, etc.)
                let is_sampler = trimmed.contains("sampler2D")
                    || trimmed.contains("samplerCube")
                    || trimmed.contains("sampler3D")
                    || trimmed.contains("samplerExternalOES");

                if is_sampler {
                    // For samplers, just remove the layout qualifier entirely
                    let transformed_line = layout_re.replace(line, "");
                    result.push_str(&transformed_line);
                    result.push('\n');
                } else {
                    // For uniform blocks, replace with layout(std140)
                    let transformed_line = layout_re.replace(line, "layout(std140)");
                    result.push_str(&transformed_line);
                    result.push('\n');
                }
            } else {
                result.push_str(line);
                result.push('\n');
            }
        }

        result
    }
}

// ============================================================================
// Helper functions
// 辅助函数
// ============================================================================

fn parse_blend_factor(value: &str) -> u32 {
    match value {
        "zero" => blend_factor::ZERO,
        "one" => blend_factor::ONE,
        "src_alpha" => blend_factor::SRC_ALPHA,
        "dst_alpha" => blend_factor::DST_ALPHA,
        "one_minus_src_alpha" => blend_factor::ONE_MINUS_SRC_ALPHA,
        "one_minus_dst_alpha" => blend_factor::ONE_MINUS_DST_ALPHA,
        _ => blend_factor::ONE,
    }
}

fn parse_cull_mode(value: &str) -> u32 {
    match value {
        "none" => 0,
        "front" => 1,
        "back" => 2,
        _ => 0,
    }
}

fn parse_uniform_type(type_str: &str) -> u32 {
    match type_str {
        "float" => uniform_type::FLOAT,
        "vec2" => uniform_type::FLOAT2,
        "vec3" => uniform_type::FLOAT3,
        "vec4" => uniform_type::FLOAT4,
        "mat4" => uniform_type::MAT4,
        "sampler2D" => uniform_type::SAMPLER2D,
        _ => uniform_type::FLOAT,
    }
}

// ============================================================================
// Tauri Commands
// Tauri 命令
// ============================================================================

/// Compile a single effect file
/// 编译单个效果文件
#[tauri::command]
pub async fn compile_effect(
    effect_path: String,
    engine_path: String,
) -> Result<CompiledEffect, String> {
    let mut compiler = EffectCompiler::new(Path::new(&engine_path));
    compiler.compile(Path::new(&effect_path))
}

/// Compile all builtin effects
/// 编译所有内置效果
#[tauri::command]
pub async fn compile_builtin_effects(
    engine_path: String,
) -> Result<Vec<CompiledEffect>, String> {
    let engine = Path::new(&engine_path);
    let mut compiler = EffectCompiler::new(engine);

    let builtin_effects = vec![
        // 2D/UI effects
        "editor/assets/effects/for2d/builtin-sprite.effect",
        "editor/assets/effects/internal/builtin-graphics.effect",
        "editor/assets/effects/internal/builtin-clear-stencil.effect",
        "editor/assets/effects/builtin-unlit.effect",
        // Pipeline effects (required for Skybox, etc.)
        "editor/assets/effects/pipeline/skybox.effect",
    ];

    let mut results = Vec::new();
    for effect_rel_path in builtin_effects {
        let effect_path = engine.join(effect_rel_path);
        if effect_path.exists() {
            match compiler.compile(&effect_path) {
                Ok(compiled) => results.push(compiled),
                Err(e) => {
                    eprintln!("[EffectCompiler] Warning: Failed to compile {}: {}", effect_rel_path, e);
                }
            }
        } else {
            eprintln!("[EffectCompiler] Warning: Effect file not found: {}", effect_path.display());
        }
    }

    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_blend_factor() {
        assert_eq!(parse_blend_factor("src_alpha"), blend_factor::SRC_ALPHA);
        assert_eq!(parse_blend_factor("one_minus_src_alpha"), blend_factor::ONE_MINUS_SRC_ALPHA);
    }
}
