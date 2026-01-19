//! @zh Effect 文件解析器
//! @en Effect file parser

use std::collections::{HashMap, HashSet};
use std::path::Path;
use std::fs;
use regex::Regex;
use once_cell::sync::Lazy;

use super::mappings::*;
use super::types::*;

/// @zh 正则表达式
/// @en Regular expressions
static EFFECT_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"CCEffect\s*%\{([\s\S]*?)(?:\}%|%\})").unwrap()
});

static PROGRAM_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"CCProgram\s+([\w-]+)\s*%\{([\s\S]*?)(?:\}%|%\})").unwrap()
});

static INCLUDE_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r#"^(.*)#include\s+[<"]([^>"]+)[>"](.*)$"#).unwrap()
});

static IN_DECL_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"(?:layout\s*\((.*?)\)\s*)?in\s+((?:\w+\s+)?\w+\s+(\w+)\s*(?:\[[\d\s]+\])?)\s*;").unwrap()
});

static OUT_DECL_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"(?:layout\s*\((.*?)\)\s*)?out\s+((?:\w+\s+)?\w+\s+(\w+)\s*(?:\[[\d\s]+\])?)\s*;").unwrap()
});

static UNIFORM_BLOCK_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"(?:layout\s*\(([^)]*)\)\s*)?uniform\s+(\w+)\s*\{([^}]*)\}\s*(\w*)\s*;").unwrap()
});

static UNIFORM_SAMPLER_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"(?:layout\s*\(([^)]*)\)\s*)?uniform\s+(sampler\w*|texture\w*|image\w*)\s+(\w+)\s*;").unwrap()
});

static PRAGMA_DEFINE_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"#pragma\s+define\s+(\w+)\s+(.*)\n").unwrap()
});

static PRAGMA_RATE_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"#pragma\s+rate\s+(\w+)\s+(\w+)").unwrap()
});

static LOCATION_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"location\s*=\s*(\d+)").unwrap()
});

static BINDING_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"binding\s*=\s*(\d+)").unwrap()
});

static SET_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"set\s*=\s*(\d+)").unwrap()
});

static BLOCK_COMMENTS_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"/\*[\s\S]*?\*/").unwrap()
});

static LINE_COMMENTS_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"(?m)\s*//.*$").unwrap()
});

/// @zh Effect 编译器
/// @en Effect compiler
pub struct EffectCompiler {
    /// @zh 全局 chunks
    /// @en Global chunks
    chunks: HashMap<String, String>,
    /// @zh Effect 名称
    /// @en Effect name
    effect_name: String,
}

impl EffectCompiler {
    /// @zh 创建新的编译器实例
    /// @en Create a new compiler instance
    pub fn new() -> Self {
        Self {
            chunks: HashMap::new(),
            effect_name: String::new(),
        }
    }

    /// @zh 添加 chunk
    /// @en Add a chunk
    pub fn add_chunk(&mut self, name: &str, content: &str) {
        let stripped = self.strip_comments(content);
        self.chunks.insert(name.to_string(), stripped);
    }

    /// @zh 从目录加载所有 chunks
    /// @en Load all chunks from a directory
    pub fn load_chunks_from_dir(&mut self, dir: &Path) -> Result<usize, String> {
        let mut count = 0;
        self.load_chunks_recursive(dir, "", &mut count)?;
        Ok(count)
    }

    fn load_chunks_recursive(&mut self, dir: &Path, base_path: &str, count: &mut usize) -> Result<(), String> {
        if !dir.exists() || !dir.is_dir() {
            return Ok(());
        }

        let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;

        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();

            if path.is_dir() {
                let dir_name = path.file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("");
                let sub_path = if base_path.is_empty() {
                    dir_name.to_string()
                } else {
                    format!("{}/{}", base_path, dir_name)
                };
                self.load_chunks_recursive(&path, &sub_path, count)?;
            } else if path.extension().map_or(false, |e| e == "chunk") {
                let file_name = path.file_stem()
                    .and_then(|n| n.to_str())
                    .unwrap_or("");
                let chunk_name = if base_path.is_empty() {
                    file_name.to_string()
                } else {
                    format!("{}/{}", base_path, file_name)
                };

                let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
                self.add_chunk(&chunk_name, &content);
                *count += 1;
            }
        }

        Ok(())
    }

    /// @zh 从目录预加载所有 effect 文件的 CCProgram 模板
    /// @en Pre-load all CCProgram templates from effect files in a directory
    pub fn preload_templates_from_dir(&mut self, dir: &Path) -> Result<usize, String> {
        let mut count = 0;
        self.preload_templates_recursive(dir, &mut count)?;
        Ok(count)
    }

    fn preload_templates_recursive(&mut self, dir: &Path, count: &mut usize) -> Result<(), String> {
        if !dir.exists() || !dir.is_dir() {
            return Ok(());
        }

        let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;

        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();

            if path.is_dir() {
                self.preload_templates_recursive(&path, count)?;
            } else if path.extension().map_or(false, |e| e == "effect") {
                if let Ok(content) = fs::read_to_string(&path) {
                    let stripped = self.strip_comments(&content);
                    for cap in PROGRAM_RE.captures_iter(&stripped) {
                        let name = cap.get(1).map_or("", |m| m.as_str());
                        let code = cap.get(2).map_or("", |m| m.as_str());
                        let processed = self.dedent(code);
                        if !self.chunks.contains_key(name) {
                            self.chunks.insert(name.to_string(), processed);
                            *count += 1;
                        }
                    }
                }
            }
        }

        Ok(())
    }

    /// @zh 从目录加载并编译所需的 effects
    /// @en Load and compile required effects from a directory
    pub fn load_effects_from_dir(&mut self, dir: &Path) -> Result<Vec<CompiledEffect>, String> {
        // First, preload all CCProgram templates from all effect files
        let template_count = self.preload_templates_from_dir(dir)?;
        eprintln!("[EffectCompiler] Preloaded {} CCProgram templates", template_count);

        let required_effects = vec![
            "for2d/builtin-sprite",
            "internal/builtin-graphics",
            "internal/builtin-geometry-renderer",
            "internal/builtin-clear-stencil",
            "builtin-unlit",
            "pipeline/skybox",
        ];

        let mut effects = Vec::new();

        for effect_name in &required_effects {
            let effect_path = dir.join(format!("{}.effect", effect_name));
            if effect_path.exists() {
                match self.compile_file(&effect_path) {
                    Ok(effect) => {
                        effects.push(effect);
                    }
                    Err(e) => {
                        eprintln!("[EffectCompiler] Failed to compile {}: {}", effect_name, e);
                    }
                }
            }
        }

        // Also load internal/* and for2d/* effects
        self.load_effects_recursive(dir, "", &mut effects)?;

        Ok(effects)
    }

    fn load_effects_recursive(&mut self, dir: &Path, base_path: &str, effects: &mut Vec<CompiledEffect>) -> Result<(), String> {
        if !dir.exists() || !dir.is_dir() {
            return Ok(());
        }

        let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;

        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();

            if path.is_dir() {
                let dir_name = path.file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("");
                let sub_path = if base_path.is_empty() {
                    dir_name.to_string()
                } else {
                    format!("{}/{}", base_path, dir_name)
                };

                // Only process internal and for2d directories
                if dir_name == "internal" || dir_name == "for2d" || base_path.starts_with("internal") || base_path.starts_with("for2d") {
                    self.load_effects_recursive(&path, &sub_path, effects)?;
                }
            } else if path.extension().map_or(false, |e| e == "effect") {
                // Check if already compiled
                let file_name = path.file_stem()
                    .and_then(|n| n.to_str())
                    .unwrap_or("");
                let effect_name = if base_path.is_empty() {
                    file_name.to_string()
                } else {
                    format!("{}/{}", base_path, file_name)
                };

                if !effects.iter().any(|e| e.name == effect_name) {
                    match self.compile_file(&path) {
                        Ok(effect) => {
                            effects.push(effect);
                        }
                        Err(e) => {
                            eprintln!("[EffectCompiler] Failed to compile {}: {}", effect_name, e);
                        }
                    }
                }
            }
        }

        Ok(())
    }

    /// @zh 编译 effect 文件
    /// @en Compile an effect file
    pub fn compile_file(&mut self, path: &Path) -> Result<CompiledEffect, String> {
        let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
        let name = path.file_stem()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        // Extract relative name from path if possible
        let effect_name = if let Some(parent) = path.parent() {
            if let Some(parent_name) = parent.file_name().and_then(|n| n.to_str()) {
                if parent_name == "internal" || parent_name == "for2d" || parent_name == "pipeline" {
                    format!("{}/{}", parent_name, name)
                } else {
                    name
                }
            } else {
                name
            }
        } else {
            name
        };

        self.compile(&effect_name, &content)
    }

    /// @zh 编译 effect 内容
    /// @en Compile effect content
    pub fn compile(&mut self, name: &str, content: &str) -> Result<CompiledEffect, String> {
        self.effect_name = name.to_string();

        // Parse effect file
        let (effect_yaml, templates) = self.parse_effect(content)?;

        // Parse techniques from YAML
        let techniques: Vec<TechniqueDef> = match serde_yaml::from_str(&effect_yaml) {
            Ok(yaml) => {
                let yaml_value: serde_yaml::Value = yaml;
                self.parse_techniques(&yaml_value)?
            }
            Err(e) => return Err(format!("Failed to parse YAML: {}", e)),
        };

        // Merge templates with global chunks
        let mut all_chunks = self.chunks.clone();
        for (k, v) in templates {
            all_chunks.insert(k, v);
        }

        // Build shaders for each pass
        let mut shaders: Vec<ShaderInfo> = Vec::new();
        let mut processed_techniques = techniques.clone();

        for tech in &mut processed_techniques {
            for pass in &mut tech.passes {
                let stage_names = self.extract_stage_names(pass);
                if stage_names.is_empty() {
                    continue;
                }

                let program_name = self.build_program_name(name, &stage_names);
                pass.program = Some(program_name.clone());

                // Check if shader already exists
                if !shaders.iter().any(|s| s.name == program_name) {
                    match self.build_shader(&program_name, &stage_names, &all_chunks) {
                        Ok(shader) => shaders.push(shader),
                        Err(e) => eprintln!("[EffectCompiler] Shader build failed for '{}': {}", program_name, e),
                    }
                }
            }
        }

        // Debug: log effect compilation result
        if shaders.is_empty() {
            eprintln!("[EffectCompiler] Warning: {} has no shaders", name);
        } else {
            eprintln!("[EffectCompiler] Compiled {}: {} techniques, {} shaders",
                name, processed_techniques.len(), shaders.len());
            for shader in &shaders {
                let vert_len = shader.glsl3.vert.len();
                let frag_len = shader.glsl3.frag.len();
                eprintln!("  - shader '{}': vert={} bytes, frag={} bytes",
                    shader.name, vert_len, frag_len);
            }
        }

        Ok(CompiledEffect {
            name: name.to_string(),
            techniques: processed_techniques,
            shaders,
            combinations: Vec::new(),
            dependencies: Vec::new(),
        })
    }

    /// @zh 解析 effect 文件，提取 CCEffect 和 CCProgram 块
    /// @en Parse effect file, extract CCEffect and CCProgram blocks
    fn parse_effect(&self, content: &str) -> Result<(String, HashMap<String, String>), String> {
        // Replace tabs with spaces
        let content = content.replace('\t', "  ");

        // Extract CCEffect block
        let effect_yaml = if let Some(cap) = EFFECT_RE.captures(&content) {
            cap.get(1).map_or("", |m| m.as_str()).to_string()
        } else {
            return Err("CCEffect block not found".to_string());
        };

        // Extract CCProgram blocks
        let mut templates = HashMap::new();
        let stripped = self.strip_comments(&content);

        for cap in PROGRAM_RE.captures_iter(&stripped) {
            let name = cap.get(1).map_or("", |m| m.as_str());
            let code = cap.get(2).map_or("", |m| m.as_str());

            // Remove leading whitespace from each line
            let processed = self.dedent(code);
            templates.insert(name.to_string(), processed);
        }

        Ok((effect_yaml, templates))
    }

    /// @zh 解析 techniques
    /// @en Parse techniques
    fn parse_techniques(&self, yaml: &serde_yaml::Value) -> Result<Vec<TechniqueDef>, String> {
        let techniques = yaml.get("techniques")
            .and_then(|t| t.as_sequence())
            .ok_or("No techniques found in effect")?;

        let mut result = Vec::new();

        for tech_yaml in techniques {
            let mut tech = TechniqueDef::default();

            if let Some(name) = tech_yaml.get("name").and_then(|n| n.as_str()) {
                tech.name = Some(name.to_string());
            }

            if let Some(passes) = tech_yaml.get("passes").and_then(|p| p.as_sequence()) {
                for pass_yaml in passes {
                    let pass: PassDef = serde_yaml::from_value(pass_yaml.clone())
                        .unwrap_or_default();
                    tech.passes.push(pass);
                }
            }

            result.push(tech);
        }

        Ok(result)
    }

    /// @zh 提取 shader 阶段名称
    /// @en Extract shader stage names
    fn extract_stage_names(&self, pass: &PassDef) -> HashMap<String, String> {
        let mut stages = HashMap::new();

        if let Some(ref vert) = pass.vert {
            stages.insert("vert".to_string(), vert.clone());
        }
        if let Some(ref frag) = pass.frag {
            stages.insert("frag".to_string(), frag.clone());
        }
        if let Some(ref compute) = pass.compute {
            stages.insert("compute".to_string(), compute.clone());
        }

        stages
    }

    /// @zh 构建 program 名称
    /// @en Build program name
    fn build_program_name(&self, effect_name: &str, stage_names: &HashMap<String, String>) -> String {
        let mut name = effect_name.to_string();

        if let Some(vert) = stage_names.get("vert") {
            name = format!("{}|{}", name, vert);
        }
        if let Some(frag) = stage_names.get("frag") {
            name = format!("{}|{}", name, frag);
        }
        if let Some(compute) = stage_names.get("compute") {
            name = format!("{}|{}", name, compute);
        }

        name
    }

    /// @zh 构建 shader
    /// @en Build shader
    fn build_shader(
        &self,
        name: &str,
        stage_names: &HashMap<String, String>,
        chunks: &HashMap<String, String>,
    ) -> Result<ShaderInfo, String> {
        let mut shader = ShaderInfo {
            name: name.to_string(),
            hash: 0,
            attributes: Vec::new(),
            varyings: Vec::new(),
            blocks: Vec::new(),
            sampler_textures: Vec::new(),
            samplers: Vec::new(),
            textures: Vec::new(),
            buffers: Vec::new(),
            images: Vec::new(),
            subpass_inputs: Vec::new(),
            defines: Vec::new(),
            descriptors: vec![
                DescriptorSetLayout::default(),
                DescriptorSetLayout::default(),
                DescriptorSetLayout::default(),
                DescriptorSetLayout::default(),
            ],
            glsl4: ShaderGlsl::default(),
            glsl3: ShaderGlsl::default(),
            glsl1: ShaderGlsl::default(),
            builtins: ShaderBuiltins::default(),
        };

        // Process each stage
        for (stage, stage_ref) in stage_names {
            let (template_name, entry_point) = self.parse_stage_ref(stage_ref);

            let template = chunks.get(&template_name)
                .ok_or_else(|| format!("Template '{}' not found", template_name))?;

            // Unwind includes
            let mut included = HashSet::new();
            let source = self.unwind_includes(template, chunks, &mut included);

            // Extract shader info
            self.extract_shader_info(&source, stage, &mut shader)?;

            // Generate GLSL for different versions
            let glsl3 = self.generate_glsl(&source, &entry_point, stage, 300);
            let glsl1 = self.generate_glsl(&source, &entry_point, stage, 100);

            match stage.as_str() {
                "vert" => {
                    shader.glsl3.vert = glsl3;
                    shader.glsl1.vert = glsl1;
                }
                "frag" => {
                    shader.glsl3.frag = glsl3;
                    shader.glsl1.frag = glsl1;
                }
                "compute" => {
                    shader.glsl3.compute = glsl3;
                }
                _ => {}
            }
        }

        // Assign sequential bindings
        let mut binding_idx = 0;
        for block in &mut shader.blocks {
            block.binding = binding_idx;
            binding_idx += 1;
        }
        for sampler in &mut shader.sampler_textures {
            sampler.binding = binding_idx;
            binding_idx += 1;
        }
        for (_set_idx, set) in shader.descriptors.iter_mut().enumerate() {
            let mut set_binding = 0;
            for block in &mut set.blocks {
                block.binding = set_binding;
                set_binding += 1;
            }
            for sampler in &mut set.sampler_textures {
                sampler.binding = set_binding;
                set_binding += 1;
            }
        }

        // Assign sequential locations
        for (idx, attr) in shader.attributes.iter_mut().enumerate() {
            attr.location = idx as i32;
        }
        for (idx, varying) in shader.varyings.iter_mut().enumerate() {
            varying.location = idx as i32;
        }

        // Hash
        let hash_input = format!(
            "{}{}{}{}",
            shader.glsl3.vert,
            shader.glsl3.frag,
            shader.glsl1.vert,
            shader.glsl1.frag
        );
        shader.hash = murmurhash2_32_gc(&hash_input, 666);

        Ok(shader)
    }

    /// @zh 解析阶段引用（例如 "line-vs:vert"）
    /// @en Parse stage reference (e.g., "line-vs:vert")
    fn parse_stage_ref(&self, stage_ref: &str) -> (String, String) {
        if let Some(pos) = stage_ref.find(':') {
            (
                stage_ref[..pos].to_string(),
                stage_ref[pos + 1..].to_string(),
            )
        } else {
            (stage_ref.to_string(), "main".to_string())
        }
    }

    /// @zh 展开 #include 指令
    /// @en Unwind #include directives
    fn unwind_includes(
        &self,
        source: &str,
        chunks: &HashMap<String, String>,
        included: &mut HashSet<String>,
    ) -> String {
        let mut result = source.to_string();

        loop {
            let mut changed = false;
            let mut new_result = String::new();

            for line in result.lines() {
                if let Some(cap) = INCLUDE_RE.captures(line) {
                    let prefix = cap.get(1).map_or("", |m| m.as_str());
                    let mut include_name = cap.get(2).map_or("", |m| m.as_str()).trim().to_string();
                    let suffix = cap.get(3).map_or("", |m| m.as_str());

                    // Remove .chunk extension if present
                    if include_name.ends_with(".chunk") {
                        include_name = include_name[..include_name.len() - 6].to_string();
                    }

                    if included.contains(&include_name) {
                        new_result.push('\n');
                        continue;
                    }

                    if let Some(chunk_content) = chunks.get(&include_name) {
                        included.insert(include_name.clone());

                        // Apply prefix/suffix to each line
                        let processed = if !prefix.is_empty() || !suffix.is_empty() {
                            chunk_content
                                .lines()
                                .map(|l| format!("{}{}{}", prefix, l, suffix))
                                .collect::<Vec<_>>()
                                .join("\n")
                        } else {
                            chunk_content.clone()
                        };

                        new_result.push_str(&processed);
                        new_result.push('\n');
                        changed = true;
                    } else {
                        // Keep original line if chunk not found
                        new_result.push_str(line);
                        new_result.push('\n');
                    }
                } else {
                    new_result.push_str(line);
                    new_result.push('\n');
                }
            }

            result = new_result;
            if !changed {
                break;
            }
        }

        result
    }

    /// @zh 提取 shader 信息
    /// @en Extract shader info
    fn extract_shader_info(
        &self,
        source: &str,
        stage: &str,
        shader: &mut ShaderInfo,
    ) -> Result<(), String> {
        let stage_flag = get_shader_stage(stage);

        // Extract input attributes (vertex stage only)
        if stage == "vert" {
            for cap in IN_DECL_RE.captures_iter(source) {
                let layout = cap.get(1).map_or("", |m| m.as_str());
                let decl = cap.get(2).map_or("", |m| m.as_str());
                let name = cap.get(3).map_or("", |m| m.as_str());

                // Parse location from layout
                let location = LOCATION_RE.captures(layout)
                    .and_then(|c| c.get(1))
                    .and_then(|m| m.as_str().parse().ok())
                    .unwrap_or(shader.attributes.len() as i32);

                // Parse type from declaration
                let type_name = decl.split_whitespace()
                    .find(|s| TYPE_MAP.contains_key(*s) || FORMAT_MAP.contains_key(*s))
                    .unwrap_or("vec4");

                let format = *FORMAT_MAP.get(type_name).unwrap_or(&44); // default RGBA32F

                shader.attributes.push(ShaderAttribute {
                    name: name.to_string(),
                    defines: Vec::new(),
                    format,
                    is_normalized: false,
                    stream: 0,
                    is_instanced: false,
                    location,
                });
            }
        }

        // Extract uniform blocks
        for cap in UNIFORM_BLOCK_RE.captures_iter(source) {
            let layout = cap.get(1).map_or("", |m| m.as_str());
            let block_name = cap.get(2).map_or("", |m| m.as_str());
            let members_str = cap.get(3).map_or("", |m| m.as_str());

            // Parse binding and set from layout
            let binding = BINDING_RE.captures(layout)
                .and_then(|c| c.get(1))
                .and_then(|m| m.as_str().parse().ok())
                .unwrap_or(0);
            let set = SET_RE.captures(layout)
                .and_then(|c| c.get(1))
                .and_then(|m| m.as_str().parse().ok())
                .unwrap_or(0);

            // Check if builtin
            if let Some(&(builtin_set, _builtin_binding)) = BUILTIN_BLOCKS.get(block_name) {
                let builtin_info = BuiltinBlockInfo {
                    name: block_name.to_string(),
                    defines: Vec::new(),
                };
                if builtin_set == 0 {
                    shader.builtins.globals.blocks.push(builtin_info);
                } else {
                    shader.builtins.locals.blocks.push(builtin_info);
                }
                continue;
            }

            // Parse members
            let members = self.parse_uniform_members(members_str);

            let block = UniformBlock {
                name: block_name.to_string(),
                defines: Vec::new(),
                members,
                binding,
                set,
                stage_flags: stage_flag,
                descriptor_type: None,
            };

            // Add to appropriate descriptor set
            if (set as usize) < shader.descriptors.len() {
                shader.descriptors[set as usize].blocks.push(block.clone());
            }
            shader.blocks.push(block);
        }

        // Extract sampler textures
        for cap in UNIFORM_SAMPLER_RE.captures_iter(source) {
            let layout = cap.get(1).map_or("", |m| m.as_str());
            let sampler_type = cap.get(2).map_or("", |m| m.as_str());
            let name = cap.get(3).map_or("", |m| m.as_str());

            let binding = BINDING_RE.captures(layout)
                .and_then(|c| c.get(1))
                .and_then(|m| m.as_str().parse().ok())
                .unwrap_or(0);
            let set = SET_RE.captures(layout)
                .and_then(|c| c.get(1))
                .and_then(|m| m.as_str().parse().ok())
                .unwrap_or(0);

            // Check if builtin
            if let Some(&(builtin_set, _builtin_binding)) = BUILTIN_SAMPLERS.get(name) {
                let builtin_info = BuiltinSamplerInfo {
                    name: name.to_string(),
                    defines: Vec::new(),
                };
                if builtin_set == 0 {
                    shader.builtins.globals.sampler_textures.push(builtin_info);
                } else {
                    shader.builtins.locals.sampler_textures.push(builtin_info);
                }
                continue;
            }

            let type_val = *TYPE_MAP.get(sampler_type).unwrap_or(&28); // default sampler2D

            let sampler = SamplerTexture {
                name: name.to_string(),
                sampler_type: type_val,
                defines: Vec::new(),
                count: 1,
                binding,
                set,
                stage_flags: stage_flag,
            };

            if (set as usize) < shader.descriptors.len() {
                shader.descriptors[set as usize].sampler_textures.push(sampler.clone());
            }
            shader.sampler_textures.push(sampler);
        }

        // Extract defines from #pragma define and #pragma define-meta
        let define_re = Regex::new(r"#pragma\s+define\s+(\w+)\s+(\d+)").unwrap();
        let define_meta_re = Regex::new(r"#pragma\s+define-meta\s+(\w+)(?:\s+(.*))?").unwrap();

        let mut define_map: HashMap<String, ShaderDefine> = HashMap::new();

        // First pass: extract constant defines (e.g., #pragma define CC_FOG_NONE 0)
        for cap in define_re.captures_iter(source) {
            let name = cap.get(1).map_or("", |m| m.as_str());
            let value = cap.get(2).map_or("0", |m| m.as_str());

            if !define_map.contains_key(name) {
                define_map.insert(name.to_string(), ShaderDefine {
                    name: name.to_string(),
                    define_type: "number".to_string(),
                    range: Some(vec![value.parse().unwrap_or(0), value.parse().unwrap_or(0)]),
                    options: None,
                    default: Some(serde_json::Value::Number(value.parse::<i64>().unwrap_or(0).into())),
                });
            }
        }

        // Second pass: extract meta defines (e.g., #pragma define-meta CC_USE_FOG range([0, 4]))
        for cap in define_meta_re.captures_iter(source) {
            let name = cap.get(1).map_or("", |m| m.as_str());
            let meta = cap.get(2).map_or("", |m| m.as_str()).trim();

            let (define_type, range, options) = if meta.starts_with("range(") {
                // Parse range([min, max])
                let range_re = Regex::new(r"range\s*\(\s*\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]").unwrap();
                if let Some(range_cap) = range_re.captures(meta) {
                    let min: i32 = range_cap.get(1).and_then(|m| m.as_str().parse().ok()).unwrap_or(0);
                    let max: i32 = range_cap.get(2).and_then(|m| m.as_str().parse().ok()).unwrap_or(4);
                    ("number".to_string(), Some(vec![min, max]), None)
                } else {
                    ("number".to_string(), Some(vec![0, 4]), None)
                }
            } else if meta.starts_with("options(") {
                // Parse options([opt1, opt2, ...])
                let options_re = Regex::new(r"options\s*\(\s*\[(.*?)\]").unwrap();
                if let Some(opts_cap) = options_re.captures(meta) {
                    let opts_str = opts_cap.get(1).map_or("", |m| m.as_str());
                    let opts: Vec<String> = opts_str.split(',')
                        .map(|s| s.trim().trim_matches(|c| c == '\'' || c == '"').to_string())
                        .filter(|s| !s.is_empty())
                        .collect();
                    ("string".to_string(), None, Some(opts))
                } else {
                    ("string".to_string(), None, Some(vec!["default".to_string()]))
                }
            } else {
                // Boolean define (no range/options)
                ("boolean".to_string(), None, None)
            };

            define_map.insert(name.to_string(), ShaderDefine {
                name: name.to_string(),
                define_type,
                range,
                options,
                default: None,
            });
        }

        // Add all defines to shader
        for (_, define) in define_map {
            if !shader.defines.iter().any(|d| d.name == define.name) {
                shader.defines.push(define);
            }
        }

        Ok(())
    }

    /// @zh 解析 uniform block 成员
    /// @en Parse uniform block members
    fn parse_uniform_members(&self, members_str: &str) -> Vec<UniformMember> {
        let mut members = Vec::new();
        let member_re = Regex::new(r"(\w+)\s+(\w+)\s*(?:\[(\d+)\])?\s*;").unwrap();

        for cap in member_re.captures_iter(members_str) {
            let type_name = cap.get(1).map_or("", |m| m.as_str());
            let name = cap.get(2).map_or("", |m| m.as_str());
            let count = cap.get(3)
                .and_then(|m| m.as_str().parse().ok())
                .unwrap_or(1);

            let type_val = *TYPE_MAP.get(type_name).unwrap_or(&0);

            members.push(UniformMember {
                name: name.to_string(),
                member_type: type_val,
                count,
            });
        }

        members
    }

    /// @zh 生成 GLSL 代码
    /// @en Generate GLSL code
    fn generate_glsl(&self, source: &str, entry_point: &str, stage: &str, version: i32) -> String {
        self.process_glsl_source(source, entry_point, stage, version)
    }

    /// @zh 从源码提取 define 并生成默认值字符串
    /// @en Extract defines from source and generate default values string
    fn generate_define_defaults(&self, source: &str) -> String {
        let mut defines = String::new();
        let mut seen = HashSet::new();

        // Extract defines from #pragma define
        let pragma_define_re = Regex::new(r"#pragma\s+define(?:-meta)?\s+(\w+)(?:\s+(.*))?").unwrap();
        for cap in pragma_define_re.captures_iter(source) {
            let name = cap.get(1).map_or("", |m| m.as_str());
            let value_str = cap.get(2).map_or("", |m| m.as_str()).trim();

            if seen.contains(name) {
                continue;
            }
            seen.insert(name.to_string());

            // Determine default value based on value hint
            let default_value = if value_str.is_empty() {
                // Boolean switch, default to 1
                "1".to_string()
            } else if value_str.starts_with("range(") {
                // Number with range, use first value
                let range_re = Regex::new(r"range\s*\(\s*\[(\d+)").unwrap();
                range_re.captures(value_str)
                    .and_then(|c| c.get(1))
                    .map_or("0".to_string(), |m| m.as_str().to_string())
            } else if value_str.starts_with("options(") {
                // String with options, use first option
                let options_re = Regex::new(r"options\s*\(\s*\[([^\],]+)").unwrap();
                options_re.captures(value_str)
                    .and_then(|c| c.get(1))
                    .map_or("0".to_string(), |m| m.as_str().trim().to_string())
            } else if let Ok(n) = value_str.parse::<i32>() {
                // Constant number
                n.to_string()
            } else if value_str == "true" {
                "1".to_string()
            } else if value_str == "false" {
                "0".to_string()
            } else {
                // Default boolean
                "1".to_string()
            };

            defines.push_str(&format!("#define {} {}\n", name, default_value));
        }

        // Extract all macros used in preprocessor conditionals
        let macro_name_re = Regex::new(r"[A-Z_][A-Z0-9_]*").unwrap();
        let conditional_re = Regex::new(r"#(?:if|elif|ifdef|ifndef)\s+(.+)$").unwrap();

        for line in source.lines() {
            if let Some(cap) = conditional_re.captures(line.trim()) {
                let expr = cap.get(1).map_or("", |m| m.as_str());
                for name_match in macro_name_re.find_iter(expr) {
                    let name = name_match.as_str();
                    if !seen.contains(name) && !name.starts_with("GL_") && name != "defined" {
                        seen.insert(name.to_string());
                        defines.push_str(&format!("#define {} 0\n", name));
                    }
                }
            }
        }

        // Also check for macros used in defined() operator
        let defined_macro_re = Regex::new(r"defined\s*\(\s*(\w+)\s*\)").unwrap();
        for cap in defined_macro_re.captures_iter(source) {
            let name = cap.get(1).map_or("", |m| m.as_str());
            if !seen.contains(name) && !name.starts_with("GL_") {
                seen.insert(name.to_string());
                defines.push_str(&format!("#define {} 0\n", name));
            }
        }

        defines
    }

    /// @zh 处理 GLSL 源码，移除不兼容的构造并包装入口函数
    /// @en Process GLSL source, remove incompatible constructs and wrap entry points
    fn process_glsl_source(&self, source: &str, entry_point: &str, stage: &str, _version: i32) -> String {
        // Generate define defaults first (before removing pragmas)
        let define_defaults = self.generate_define_defaults(source);

        let mut result = source.to_string();

        // Remove #pragma
        let pragma_re = Regex::new(r"^\s*#pragma\s+.*$").unwrap();
        result = result.lines()
            .filter(|l| !pragma_re.is_match(l))
            .collect::<Vec<_>>()
            .join("\n");

        // Remove Vulkan-style layout qualifiers (not valid for GLSL ES)
        let layout_set_binding_re = Regex::new(r"layout\s*\(\s*set\s*=\s*\d+\s*,\s*binding\s*=\s*\d+\s*\)\s*").unwrap();
        result = layout_set_binding_re.replace_all(&result, "").to_string();

        let layout_binding_set_re = Regex::new(r"layout\s*\(\s*binding\s*=\s*\d+\s*,\s*set\s*=\s*\d+\s*\)\s*").unwrap();
        result = layout_binding_set_re.replace_all(&result, "").to_string();

        let layout_binding_only_re = Regex::new(r"layout\s*\(\s*binding\s*=\s*\d+\s*\)\s*").unwrap();
        result = layout_binding_only_re.replace_all(&result, "").to_string();

        let layout_set_only_re = Regex::new(r"layout\s*\(\s*set\s*=\s*\d+\s*\)\s*").unwrap();
        result = layout_set_only_re.replace_all(&result, "").to_string();

        // Add std140 to uniform blocks for WebGL2
        let uniform_block_re = Regex::new(r"uniform\s+(\w+)\s*\{").unwrap();
        result = uniform_block_re.replace_all(&result, "layout(std140) uniform $1 {").to_string();

        // Remove #version (engine adds it with platform defines)
        let version_re = Regex::new(r"#version\s+\d+(\s+es)?\s*\n?").unwrap();
        result = version_re.replace_all(&result, "").to_string();

        // Prepend define defaults at the beginning
        if !define_defaults.is_empty() {
            result = format!("{}\n{}", define_defaults, result);
        }

        // Wrap entry point with main()
        if entry_point != "main" {
            let wrapper = match stage {
                "vert" => format!("\nvoid main() {{ gl_Position = {}(); }}\n", entry_point),
                "frag" => format!("\nout vec4 cc_FragColor;\nvoid main() {{ cc_FragColor = {}(); }}\n", entry_point),
                _ => format!("\nvoid main() {{ {}(); }}\n", entry_point),
            };
            result.push_str(&wrapper);
        }

        result
    }

    /// @zh 去除注释
    /// @en Strip comments
    fn strip_comments(&self, code: &str) -> String {
        let mut result = BLOCK_COMMENTS_RE.replace_all(code, "").to_string();
        result = LINE_COMMENTS_RE.replace_all(&result, "").to_string();
        result = result.replace("\r\n", "\n");
        result
    }

    /// @zh 去除前导空格
    /// @en Dedent code
    fn dedent(&self, code: &str) -> String {
        let lines: Vec<&str> = code.lines().collect();
        if lines.is_empty() {
            return String::new();
        }

        // Find minimum indentation
        let min_indent = lines.iter()
            .filter(|l| !l.trim().is_empty())
            .map(|l| l.len() - l.trim_start().len())
            .min()
            .unwrap_or(0);

        // Remove minimum indentation from all lines
        lines.iter()
            .map(|l| {
                if l.len() >= min_indent {
                    &l[min_indent..]
                } else {
                    l.trim_start()
                }
            })
            .collect::<Vec<_>>()
            .join("\n")
    }
}

impl Default for EffectCompiler {
    fn default() -> Self {
        Self::new()
    }
}
