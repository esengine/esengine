//! Main 2D renderer implementation.

use es_engine_shared::{
    traits::backend::GraphicsBackend,
    types::{
        handle::ShaderHandle,
        blend::ScissorRect,
    },
};
use std::collections::HashMap;
use crate::backend::WebGL2Backend;
use super::batch::SpriteBatch;
use super::camera::Camera2D;
use super::texture::TextureManager;
use super::material::{Material, BlendMode, UniformValue};

fn to_shared_blend_mode(mode: BlendMode) -> es_engine_shared::types::blend::BlendMode {
    match mode {
        BlendMode::None => es_engine_shared::types::blend::BlendMode::None,
        BlendMode::Alpha => es_engine_shared::types::blend::BlendMode::Alpha,
        BlendMode::Additive => es_engine_shared::types::blend::BlendMode::Additive,
        BlendMode::Multiply => es_engine_shared::types::blend::BlendMode::Multiply,
        BlendMode::Screen => es_engine_shared::types::blend::BlendMode::Screen,
        BlendMode::PremultipliedAlpha => es_engine_shared::types::blend::BlendMode::PremultipliedAlpha,
    }
}

const SPRITE_VERTEX_SHADER: &str = r#"#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_texCoord;
layout(location = 2) in vec4 a_color;
uniform mat3 u_projection;
out vec2 v_texCoord;
out vec4 v_color;
void main() {
    vec3 pos = u_projection * vec3(a_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
    v_texCoord = a_texCoord;
    v_color = a_color;
}
"#;

const SPRITE_FRAGMENT_SHADER: &str = r#"#version 300 es
precision highp float;
in vec2 v_texCoord;
in vec4 v_color;
uniform sampler2D u_texture;
out vec4 fragColor;
void main() {
    vec4 texColor = texture(u_texture, v_texCoord);
    fragColor = texColor * v_color;
    if (fragColor.a < 0.01) discard;
}
"#;

pub struct Renderer2D {
    sprite_batch: SpriteBatch,
    default_shader: ShaderHandle,
    custom_shaders: HashMap<u32, ShaderHandle>,
    next_shader_id: u32,
    materials: HashMap<u32, Material>,
    camera: Camera2D,
    clear_color: [f32; 4],
    scissor_rect: Option<ScissorRect>,
    viewport_height: f32,
}

impl Renderer2D {
    pub fn new(backend: &mut WebGL2Backend, max_sprites: usize) -> Result<Self, String> {
        let sprite_batch = SpriteBatch::new(backend, max_sprites)?;
        let default_shader = backend.compile_shader(SPRITE_VERTEX_SHADER, SPRITE_FRAGMENT_SHADER)
            .map_err(|e| format!("Default shader: {:?}", e))?;

        let (width, height) = (backend.width() as f32, backend.height() as f32);
        let camera = Camera2D::new(width, height);

        let mut materials = HashMap::new();
        materials.insert(0, Material::default());

        Ok(Self {
            sprite_batch,
            default_shader,
            custom_shaders: HashMap::new(),
            next_shader_id: 100,
            materials,
            camera,
            clear_color: [0.1, 0.1, 0.12, 1.0],
            scissor_rect: None,
            viewport_height: height,
        })
    }

    pub fn submit_batch(
        &mut self,
        transforms: &[f32],
        texture_ids: &[u32],
        uvs: &[f32],
        colors: &[u32],
        material_ids: &[u32],
    ) -> Result<(), String> {
        self.sprite_batch.add_sprites(transforms, texture_ids, uvs, colors, material_ids)
    }

    pub fn render(&mut self, backend: &mut WebGL2Backend, texture_manager: &TextureManager) -> Result<(), String> {
        if self.sprite_batch.sprite_count() == 0 {
            return Ok(());
        }

        self.apply_scissor(backend);

        let projection = self.camera.projection_matrix();
        let mut current_material_id = u32::MAX;
        let mut current_texture_id = u32::MAX;

        for batch_idx in 0..self.sprite_batch.batches().len() {
            let (batch_key, vertices) = &self.sprite_batch.batches()[batch_idx];
            if vertices.is_empty() { continue; }

            if batch_key.material_id != current_material_id {
                current_material_id = batch_key.material_id;

                let material = self.materials.get(&batch_key.material_id)
                    .cloned()
                    .unwrap_or_default();

                let shader = if material.shader_id == 0 {
                    self.default_shader
                } else {
                    self.custom_shaders.get(&material.shader_id)
                        .copied()
                        .unwrap_or(self.default_shader)
                };

                backend.bind_shader(shader).ok();
                backend.set_blend_mode(to_shared_blend_mode(material.blend_mode));
                backend.set_uniform_mat3("u_projection", &projection).ok();
                backend.set_uniform_i32("u_texture", 0).ok();

                for name in material.uniforms.names() {
                    if let Some(value) = material.uniforms.get(name) {
                        match value {
                            UniformValue::Float(v) => { backend.set_uniform_f32(name, *v).ok(); }
                            UniformValue::Vec2(v) => { backend.set_uniform_vec2(name, es_engine_shared::Vec2::new(v[0], v[1])).ok(); }
                            UniformValue::Vec3(v) => { backend.set_uniform_vec3(name, es_engine_shared::Vec3::new(v[0], v[1], v[2])).ok(); }
                            UniformValue::Vec4(v) => { backend.set_uniform_vec4(name, es_engine_shared::Vec4::new(v[0], v[1], v[2], v[3])).ok(); }
                            UniformValue::Int(v) => { backend.set_uniform_i32(name, *v).ok(); }
                            UniformValue::Mat3(v) => { backend.set_uniform_mat3(name, &es_engine_shared::Mat3::from_cols_array(v)).ok(); }
                            UniformValue::Mat4(v) => { backend.set_uniform_mat4(name, &es_engine_shared::Mat4::from_cols_array(v)).ok(); }
                            UniformValue::Sampler(v) => { backend.set_uniform_i32(name, *v).ok(); }
                        }
                    }
                }
            }

            if batch_key.texture_id != current_texture_id {
                current_texture_id = batch_key.texture_id;
                texture_manager.bind_texture_via_backend(backend, batch_key.texture_id, 0);
            }

            self.sprite_batch.flush_batch_at(backend, batch_idx);
        }

        self.sprite_batch.clear();
        Ok(())
    }

    fn apply_scissor(&self, backend: &mut WebGL2Backend) {
        if let Some(rect) = &self.scissor_rect {
            backend.set_scissor(Some(ScissorRect {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
            }));
        } else {
            backend.set_scissor(None);
        }
    }

    #[inline]
    pub fn camera_mut(&mut self) -> &mut Camera2D { &mut self.camera }

    #[inline]
    pub fn camera(&self) -> &Camera2D { &self.camera }

    pub fn set_clear_color(&mut self, r: f32, g: f32, b: f32, a: f32) {
        self.clear_color = [r, g, b, a];
    }

    pub fn get_clear_color(&self) -> [f32; 4] { self.clear_color }

    pub fn resize(&mut self, width: f32, height: f32) {
        self.camera.set_viewport(width, height);
        self.viewport_height = height;
    }

    pub fn set_scissor_rect(&mut self, x: f32, y: f32, width: f32, height: f32) {
        self.scissor_rect = Some(ScissorRect {
            x: x as i32, y: y as i32,
            width: width as u32, height: height as u32,
        });
    }

    pub fn clear_scissor_rect(&mut self) { self.scissor_rect = None; }

    pub fn compile_shader(&mut self, backend: &mut WebGL2Backend, vertex: &str, fragment: &str) -> Result<u32, String> {
        let handle = backend.compile_shader(vertex, fragment)
            .map_err(|e| format!("{:?}", e))?;
        let id = self.next_shader_id;
        self.next_shader_id += 1;
        self.custom_shaders.insert(id, handle);
        Ok(id)
    }

    pub fn compile_shader_with_id(&mut self, backend: &mut WebGL2Backend, id: u32, vertex: &str, fragment: &str) -> Result<(), String> {
        let handle = backend.compile_shader(vertex, fragment)
            .map_err(|e| format!("{:?}", e))?;
        self.custom_shaders.insert(id, handle);
        Ok(())
    }

    pub fn has_shader(&self, id: u32) -> bool {
        id == 0 || self.custom_shaders.contains_key(&id)
    }

    /// Get shader handle by ID.
    /// 按 ID 获取着色器句柄。
    ///
    /// Returns the default shader for ID 0, or custom shader for other IDs.
    /// ID 0 返回默认着色器，其他 ID 返回自定义着色器。
    pub fn get_shader_handle(&self, id: u32) -> Option<ShaderHandle> {
        if id == 0 || id == crate::renderer::shader::SHADER_ID_DEFAULT_SPRITE {
            Some(self.default_shader)
        } else {
            self.custom_shaders.get(&id).copied()
        }
    }

    pub fn remove_shader(&mut self, id: u32) -> bool {
        if id < 100 { return false; }
        self.custom_shaders.remove(&id).is_some()
    }

    pub fn register_material(&mut self, material: Material) -> u32 {
        let id = self.materials.keys().max().unwrap_or(&0) + 1;
        self.materials.insert(id, material);
        id
    }

    pub fn register_material_with_id(&mut self, id: u32, material: Material) {
        self.materials.insert(id, material);
    }

    pub fn get_material(&self, id: u32) -> Option<&Material> { self.materials.get(&id) }
    pub fn get_material_mut(&mut self, id: u32) -> Option<&mut Material> { self.materials.get_mut(&id) }
    pub fn has_material(&self, id: u32) -> bool { self.materials.contains_key(&id) }
    pub fn remove_material(&mut self, id: u32) -> bool { self.materials.remove(&id).is_some() }

    pub fn set_material_float(&mut self, id: u32, name: &str, value: f32) -> bool {
        if let Some(mat) = self.materials.get_mut(&id) {
            mat.uniforms.set_float(name, value);
            true
        } else { false }
    }

    pub fn set_material_vec4(&mut self, id: u32, name: &str, x: f32, y: f32, z: f32, w: f32) -> bool {
        if let Some(mat) = self.materials.get_mut(&id) {
            mat.uniforms.set_vec4(name, x, y, z, w);
            true
        } else { false }
    }

    pub fn destroy(self, backend: &mut WebGL2Backend) {
        self.sprite_batch.destroy(backend);
        backend.destroy_shader(self.default_shader);
        for (_, handle) in self.custom_shaders {
            backend.destroy_shader(handle);
        }
    }
}
