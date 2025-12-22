//! Main 3D renderer implementation.
//! 主3D渲染器实现。
//!
//! Provides perspective and orthographic 3D rendering with depth testing.
//! 提供带深度测试的透视和正交3D渲染。

use es_engine_shared::{
    traits::backend::GraphicsBackend,
    types::{
        handle::ShaderHandle,
        blend::{RenderState, CompareFunc, CullMode, BlendMode as SharedBlendMode},
    },
    Mat4,
};
use std::collections::HashMap;
use crate::backend::WebGL2Backend;
use super::camera3d::Camera3D;
use super::batch::{SimpleVertex3D, FLOATS_PER_SIMPLE_VERTEX_3D};
use super::texture::TextureManager;
use super::material::{Material, BlendMode, UniformValue};
use super::shader::{SIMPLE3D_VERTEX_SHADER, SIMPLE3D_FRAGMENT_SHADER};

/// Convert local BlendMode to shared BlendMode.
/// 将本地 BlendMode 转换为共享 BlendMode。
fn to_shared_blend_mode(mode: BlendMode) -> SharedBlendMode {
    match mode {
        BlendMode::None => SharedBlendMode::None,
        BlendMode::Alpha => SharedBlendMode::Alpha,
        BlendMode::Additive => SharedBlendMode::Additive,
        BlendMode::Multiply => SharedBlendMode::Multiply,
        BlendMode::Screen => SharedBlendMode::Screen,
        BlendMode::PremultipliedAlpha => SharedBlendMode::PremultipliedAlpha,
    }
}

/// Mesh submission data for batched 3D rendering.
/// 用于批处理3D渲染的网格提交数据。
#[derive(Debug, Clone)]
pub struct MeshSubmission {
    /// Vertex data (position, uv, color).
    /// 顶点数据（位置、UV、颜色）。
    pub vertices: Vec<SimpleVertex3D>,
    /// Index data.
    /// 索引数据。
    pub indices: Vec<u32>,
    /// Model transformation matrix.
    /// 模型变换矩阵。
    pub transform: Mat4,
    /// Material ID.
    /// 材质 ID。
    pub material_id: u32,
    /// Texture ID.
    /// 纹理 ID。
    pub texture_id: u32,
}

/// 3D Renderer with perspective/orthographic camera support.
/// 支持透视/正交相机的3D渲染器。
pub struct Renderer3D {
    /// 3D camera.
    /// 3D相机。
    camera: Camera3D,

    /// Default 3D shader.
    /// 默认3D着色器。
    default_shader: ShaderHandle,

    /// Custom shaders by ID.
    /// 按ID存储的自定义着色器。
    custom_shaders: HashMap<u32, ShaderHandle>,

    /// Next shader ID for auto-assignment.
    /// 自动分配的下一个着色器ID。
    next_shader_id: u32,

    /// Materials by ID.
    /// 按ID存储的材质。
    materials: HashMap<u32, Material>,

    /// Pending mesh submissions for this frame.
    /// 本帧待渲染的网格提交。
    mesh_queue: Vec<MeshSubmission>,

    /// Clear color.
    /// 清除颜色。
    clear_color: [f32; 4],

    /// Whether depth test is enabled.
    /// 是否启用深度测试。
    depth_test_enabled: bool,

    /// Whether depth write is enabled.
    /// 是否启用深度写入。
    depth_write_enabled: bool,
}

impl Renderer3D {
    /// Create a new 3D renderer.
    /// 创建新的3D渲染器。
    pub fn new(backend: &mut WebGL2Backend) -> Result<Self, String> {
        // Compile default 3D shader
        // 编译默认3D着色器
        let default_shader = backend
            .compile_shader(SIMPLE3D_VERTEX_SHADER, SIMPLE3D_FRAGMENT_SHADER)
            .map_err(|e| format!("Failed to compile 3D shader: {:?}", e))?;

        let (width, height) = (backend.width() as f32, backend.height() as f32);
        let camera = Camera3D::new(width, height, std::f32::consts::FRAC_PI_4);

        let mut materials = HashMap::new();
        materials.insert(0, Material::default());

        Ok(Self {
            camera,
            default_shader,
            custom_shaders: HashMap::new(),
            next_shader_id: 100,
            materials,
            mesh_queue: Vec::new(),
            clear_color: [0.1, 0.1, 0.12, 1.0],
            depth_test_enabled: true,
            depth_write_enabled: true,
        })
    }

    /// Submit a mesh for rendering.
    /// 提交网格进行渲染。
    pub fn submit_mesh(&mut self, submission: MeshSubmission) {
        self.mesh_queue.push(submission);
    }

    /// Submit a simple textured quad at position.
    /// 在指定位置提交一个简单的纹理四边形。
    pub fn submit_quad(
        &mut self,
        position: [f32; 3],
        size: [f32; 2],
        texture_id: u32,
        color: [f32; 4],
        material_id: u32,
    ) {
        let half_w = size[0] / 2.0;
        let half_h = size[1] / 2.0;

        let vertices = vec![
            SimpleVertex3D::new([-half_w, -half_h, 0.0], [0.0, 1.0], color),
            SimpleVertex3D::new([half_w, -half_h, 0.0], [1.0, 1.0], color),
            SimpleVertex3D::new([half_w, half_h, 0.0], [1.0, 0.0], color),
            SimpleVertex3D::new([-half_w, half_h, 0.0], [0.0, 0.0], color),
        ];

        let indices = vec![0, 1, 2, 2, 3, 0];

        let transform = Mat4::from_translation(glam::Vec3::new(
            position[0],
            position[1],
            position[2],
        ));

        self.mesh_queue.push(MeshSubmission {
            vertices,
            indices,
            transform,
            material_id,
            texture_id,
        });
    }

    /// Render all submitted meshes.
    /// 渲染所有已提交的网格。
    pub fn render(
        &mut self,
        backend: &mut WebGL2Backend,
        texture_manager: &TextureManager,
    ) -> Result<(), String> {
        if self.mesh_queue.is_empty() {
            return Ok(());
        }

        // Apply 3D render state (depth test enabled)
        // 应用3D渲染状态（启用深度测试）
        let render_state = RenderState {
            blend_mode: SharedBlendMode::Alpha,
            cull_mode: CullMode::Back,
            depth_test: self.depth_test_enabled,
            depth_write: self.depth_write_enabled,
            depth_func: CompareFunc::LessEqual,
            scissor: None,
        };
        backend.apply_render_state(&render_state);

        // Get view-projection matrix
        // 获取视图-投影矩阵
        let view_projection = self.camera.view_projection_matrix();

        let mut current_material_id = u32::MAX;
        let mut current_texture_id = u32::MAX;

        for submission in &self.mesh_queue {
            // Bind material/shader if changed
            // 如果材质/着色器变化则绑定
            if submission.material_id != current_material_id {
                current_material_id = submission.material_id;

                let material = self
                    .materials
                    .get(&submission.material_id)
                    .cloned()
                    .unwrap_or_default();

                let shader = if material.shader_id == 0 {
                    self.default_shader
                } else {
                    self.custom_shaders
                        .get(&material.shader_id)
                        .copied()
                        .unwrap_or(self.default_shader)
                };

                backend.bind_shader(shader).ok();
                backend.set_blend_mode(to_shared_blend_mode(material.blend_mode));

                // Set view-projection matrix
                // 设置视图-投影矩阵
                backend
                    .set_uniform_mat4("u_viewProjection", &view_projection)
                    .ok();
                backend.set_uniform_i32("u_texture", 0).ok();

                // Apply custom uniforms
                // 应用自定义 uniforms
                for name in material.uniforms.names() {
                    if let Some(value) = material.uniforms.get(name) {
                        match value {
                            UniformValue::Float(v) => {
                                backend.set_uniform_f32(name, *v).ok();
                            }
                            UniformValue::Vec2(v) => {
                                backend
                                    .set_uniform_vec2(
                                        name,
                                        es_engine_shared::Vec2::new(v[0], v[1]),
                                    )
                                    .ok();
                            }
                            UniformValue::Vec3(v) => {
                                backend
                                    .set_uniform_vec3(
                                        name,
                                        es_engine_shared::Vec3::new(v[0], v[1], v[2]),
                                    )
                                    .ok();
                            }
                            UniformValue::Vec4(v) => {
                                backend
                                    .set_uniform_vec4(
                                        name,
                                        es_engine_shared::Vec4::new(v[0], v[1], v[2], v[3]),
                                    )
                                    .ok();
                            }
                            UniformValue::Int(v) => {
                                backend.set_uniform_i32(name, *v).ok();
                            }
                            UniformValue::Mat3(v) => {
                                backend
                                    .set_uniform_mat3(name, &es_engine_shared::Mat3::from_cols_array(v))
                                    .ok();
                            }
                            UniformValue::Mat4(v) => {
                                backend
                                    .set_uniform_mat4(name, &es_engine_shared::Mat4::from_cols_array(v))
                                    .ok();
                            }
                            UniformValue::Sampler(v) => {
                                backend.set_uniform_i32(name, *v).ok();
                            }
                        }
                    }
                }
            }

            // Bind texture if changed
            // 如果纹理变化则绑定
            if submission.texture_id != current_texture_id {
                current_texture_id = submission.texture_id;
                texture_manager.bind_texture_via_backend(backend, submission.texture_id, 0);
            }

            // Set model matrix for this mesh
            // 设置此网格的模型矩阵
            backend
                .set_uniform_mat4("u_model", &submission.transform)
                .ok();

            // TODO: For now, we'll render each mesh individually
            // In the future, implement proper mesh batching
            // 目前我们逐个渲染网格，未来实现正确的网格批处理

            // Create temporary vertex buffer and VAO for this mesh
            // 为此网格创建临时顶点缓冲区和VAO
            self.render_mesh_immediate(backend, &submission.vertices, &submission.indices)?;
        }

        // Reset to 2D render state
        // 重置为2D渲染状态
        let default_state = RenderState::default();
        backend.apply_render_state(&default_state);

        self.mesh_queue.clear();
        Ok(())
    }

    /// Render a mesh immediately (no batching).
    /// 立即渲染网格（无批处理）。
    fn render_mesh_immediate(
        &self,
        backend: &mut WebGL2Backend,
        vertices: &[SimpleVertex3D],
        indices: &[u32],
    ) -> Result<(), String> {
        use es_engine_shared::types::vertex::{VertexLayout, VertexAttribute, VertexAttributeType};
        use es_engine_shared::BufferUsage;

        // Create vertex layout for SimpleVertex3D
        // 为SimpleVertex3D创建顶点布局
        let layout = VertexLayout {
            attributes: vec![
                VertexAttribute {
                    name: "a_position",
                    attr_type: VertexAttributeType::Float3,
                    offset: 0,
                    normalized: false,
                },
                VertexAttribute {
                    name: "a_texCoord",
                    attr_type: VertexAttributeType::Float2,
                    offset: 12, // 3 * 4 bytes
                    normalized: false,
                },
                VertexAttribute {
                    name: "a_color",
                    attr_type: VertexAttributeType::Float4,
                    offset: 20, // 3 * 4 + 2 * 4 bytes
                    normalized: false,
                },
            ],
            stride: FLOATS_PER_SIMPLE_VERTEX_3D * 4, // 9 * 4 = 36 bytes
        };

        // Convert vertices to bytes
        // 将顶点转换为字节
        let vertex_data: &[u8] = bytemuck::cast_slice(vertices);

        // Create buffers
        // 创建缓冲区
        let vertex_buffer = backend
            .create_vertex_buffer(vertex_data, BufferUsage::Dynamic)
            .map_err(|e| format!("Failed to create vertex buffer: {:?}", e))?;

        let index_buffer = backend
            .create_index_buffer_u32(indices, BufferUsage::Dynamic)
            .map_err(|e| format!("Failed to create index buffer: {:?}", e))?;

        // Create VAO
        // 创建VAO
        let vao = backend
            .create_vertex_array(vertex_buffer, Some(index_buffer), &layout)
            .map_err(|e| format!("Failed to create VAO: {:?}", e))?;

        // Draw
        // 绘制
        backend
            .draw_indexed_u32(vao, indices.len() as u32, 0)
            .map_err(|e| format!("Failed to draw: {:?}", e))?;

        // Cleanup
        // 清理
        backend.destroy_vertex_array(vao);
        backend.destroy_buffer(vertex_buffer);
        backend.destroy_buffer(index_buffer);

        Ok(())
    }

    /// Get mutable reference to camera.
    /// 获取相机的可变引用。
    #[inline]
    pub fn camera_mut(&mut self) -> &mut Camera3D {
        &mut self.camera
    }

    /// Get reference to camera.
    /// 获取相机的引用。
    #[inline]
    pub fn camera(&self) -> &Camera3D {
        &self.camera
    }

    /// Set clear color.
    /// 设置清除颜色。
    pub fn set_clear_color(&mut self, r: f32, g: f32, b: f32, a: f32) {
        self.clear_color = [r, g, b, a];
    }

    /// Get clear color.
    /// 获取清除颜色。
    pub fn get_clear_color(&self) -> [f32; 4] {
        self.clear_color
    }

    /// Resize viewport.
    /// 调整视口大小。
    pub fn resize(&mut self, width: f32, height: f32) {
        self.camera.set_viewport(width, height);
    }

    /// Enable or disable depth testing.
    /// 启用或禁用深度测试。
    pub fn set_depth_test(&mut self, enabled: bool) {
        self.depth_test_enabled = enabled;
    }

    /// Enable or disable depth writing.
    /// 启用或禁用深度写入。
    pub fn set_depth_write(&mut self, enabled: bool) {
        self.depth_write_enabled = enabled;
    }

    /// Compile a custom shader.
    /// 编译自定义着色器。
    pub fn compile_shader(
        &mut self,
        backend: &mut WebGL2Backend,
        vertex: &str,
        fragment: &str,
    ) -> Result<u32, String> {
        let handle = backend
            .compile_shader(vertex, fragment)
            .map_err(|e| format!("{:?}", e))?;
        let id = self.next_shader_id;
        self.next_shader_id += 1;
        self.custom_shaders.insert(id, handle);
        Ok(id)
    }

    /// Register a material.
    /// 注册材质。
    pub fn register_material(&mut self, material: Material) -> u32 {
        let id = self.materials.keys().max().unwrap_or(&0) + 1;
        self.materials.insert(id, material);
        id
    }

    /// Register material with specific ID.
    /// 使用特定ID注册材质。
    pub fn register_material_with_id(&mut self, id: u32, material: Material) {
        self.materials.insert(id, material);
    }

    /// Get material by ID.
    /// 按ID获取材质。
    pub fn get_material(&self, id: u32) -> Option<&Material> {
        self.materials.get(&id)
    }

    /// Get mutable material by ID.
    /// 按ID获取可变材质。
    pub fn get_material_mut(&mut self, id: u32) -> Option<&mut Material> {
        self.materials.get_mut(&id)
    }

    /// Clean up resources.
    /// 清理资源。
    pub fn destroy(self, backend: &mut WebGL2Backend) {
        backend.destroy_shader(self.default_shader);
        for (_, handle) in self.custom_shaders {
            backend.destroy_shader(handle);
        }
    }
}
