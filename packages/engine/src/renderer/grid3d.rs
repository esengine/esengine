//! 3D Grid renderer for editor.
//! 编辑器 3D 网格渲染器。
//!
//! Features:
//! - Multi-level grid (major lines every 10 units, minor lines every 1 unit)
//! - Distance-based fade out for infinite grid effect
//! - RGB colored coordinate axes
//! - Origin marker
//!
//! 特性：
//! - 多层级网格（主网格每10单位，次网格每1单位）
//! - 基于距离的淡出效果，实现无限网格效果
//! - RGB 彩色坐标轴
//! - 原点标记

use es_engine_shared::{
    traits::backend::{GraphicsBackend, BufferUsage},
    types::{
        handle::{ShaderHandle, BufferHandle, VertexArrayHandle},
        vertex::{VertexLayout, VertexAttribute, VertexAttributeType},
        blend::BlendMode,
    },
    Vec3,
};
use super::camera3d::Camera3D;
use super::shader::{GRID3D_VERTEX_SHADER, GRID3D_FRAGMENT_SHADER};

/// Grid configuration.
/// 网格配置。
#[derive(Debug, Clone)]
pub struct GridConfig {
    /// Size of the grid (extends from -size/2 to +size/2).
    /// 网格大小（从 -size/2 延伸到 +size/2）。
    pub size: f32,

    /// Major grid spacing (typically 10 units).
    /// 主网格间距（通常为10单位）。
    pub major_spacing: f32,

    /// Minor grid spacing (typically 1 unit).
    /// 次网格间距（通常为1单位）。
    pub minor_spacing: f32,

    /// Major grid line alpha.
    /// 主网格线透明度。
    pub major_alpha: f32,

    /// Minor grid line alpha.
    /// 次网格线透明度。
    pub minor_alpha: f32,

    /// Distance at which fade starts.
    /// 开始淡出的距离。
    pub fade_start: f32,

    /// Distance at which grid is fully transparent.
    /// 完全透明的距离。
    pub fade_end: f32,

    /// Axis line length.
    /// 坐标轴线长度。
    pub axis_length: f32,
}

impl Default for GridConfig {
    fn default() -> Self {
        Self {
            size: 100.0,
            major_spacing: 10.0,
            minor_spacing: 1.0,
            major_alpha: 0.5,
            minor_alpha: 0.15,
            fade_start: 30.0,
            fade_end: 50.0,
            axis_length: 1000.0,
        }
    }
}

/// 3D grid renderer for displaying ground plane and axes.
/// 用于显示地面平面和坐标轴的 3D 网格渲染器。
pub struct Grid3DRenderer {
    shader: ShaderHandle,

    // Major grid (every 10 units)
    major_grid_vbo: BufferHandle,
    major_grid_vao: VertexArrayHandle,
    major_grid_vertex_count: u32,

    // Minor grid (every 1 unit)
    minor_grid_vbo: BufferHandle,
    minor_grid_vao: VertexArrayHandle,
    minor_grid_vertex_count: u32,

    // Coordinate axes
    axis_vbo: BufferHandle,
    axis_vao: VertexArrayHandle,
    axis_vertex_count: u32,

    // Origin marker
    origin_vbo: BufferHandle,
    origin_vao: VertexArrayHandle,
    origin_vertex_count: u32,

    config: GridConfig,
}

impl Grid3DRenderer {
    /// Create a new 3D grid renderer with default configuration.
    /// 使用默认配置创建新的 3D 网格渲染器。
    pub fn new(backend: &mut impl GraphicsBackend) -> Result<Self, String> {
        Self::with_config(backend, GridConfig::default())
    }

    /// Create a new 3D grid renderer with custom configuration.
    /// 使用自定义配置创建新的 3D 网格渲染器。
    pub fn with_config(backend: &mut impl GraphicsBackend, config: GridConfig) -> Result<Self, String> {
        // Compile shader
        let shader = backend.compile_shader(GRID3D_VERTEX_SHADER, GRID3D_FRAGMENT_SHADER)
            .map_err(|e| format!("3D Grid shader: {:?}", e))?;

        // Create vertex layout for 3D lines (position + color)
        let layout = VertexLayout {
            attributes: vec![
                VertexAttribute {
                    name: "a_position".into(),
                    attr_type: VertexAttributeType::Float3,
                    offset: 0,
                    normalized: false,
                },
                VertexAttribute {
                    name: "a_color".into(),
                    attr_type: VertexAttributeType::Float4,
                    offset: 12,
                    normalized: false,
                },
            ],
            stride: 28, // 3 floats position + 4 floats color = 7 * 4 = 28 bytes
        };

        // Generate major grid vertices (every 10 units)
        let major_vertices = Self::generate_grid_vertices(
            config.size,
            config.major_spacing,
            [0.5, 0.5, 0.5, config.major_alpha],
            true, // Skip center lines (will be axes)
        );
        let major_grid_vertex_count = (major_vertices.len() / 7) as u32;

        let major_grid_vbo = backend.create_vertex_buffer(
            bytemuck::cast_slice(&major_vertices),
            BufferUsage::Static,
        ).map_err(|e| format!("3D Major Grid VBO: {:?}", e))?;

        let major_grid_vao = backend.create_vertex_array(major_grid_vbo, None, &layout)
            .map_err(|e| format!("3D Major Grid VAO: {:?}", e))?;

        // Generate minor grid vertices (every 1 unit, skip major lines)
        let minor_vertices = Self::generate_minor_grid_vertices(
            config.size,
            config.minor_spacing,
            config.major_spacing,
            [0.4, 0.4, 0.4, config.minor_alpha],
        );
        let minor_grid_vertex_count = (minor_vertices.len() / 7) as u32;

        let minor_grid_vbo = backend.create_vertex_buffer(
            bytemuck::cast_slice(&minor_vertices),
            BufferUsage::Static,
        ).map_err(|e| format!("3D Minor Grid VBO: {:?}", e))?;

        let minor_grid_vao = backend.create_vertex_array(minor_grid_vbo, None, &layout)
            .map_err(|e| format!("3D Minor Grid VAO: {:?}", e))?;

        // Generate axis vertices
        let axis_vertices = Self::generate_axis_vertices(config.axis_length);
        let axis_vertex_count = (axis_vertices.len() / 7) as u32;

        let axis_vbo = backend.create_vertex_buffer(
            bytemuck::cast_slice(&axis_vertices),
            BufferUsage::Static,
        ).map_err(|e| format!("3D Axis VBO: {:?}", e))?;

        let axis_vao = backend.create_vertex_array(axis_vbo, None, &layout)
            .map_err(|e| format!("3D Axis VAO: {:?}", e))?;

        // Generate origin marker
        let origin_vertices = Self::generate_origin_marker(0.5);
        let origin_vertex_count = (origin_vertices.len() / 7) as u32;

        let origin_vbo = backend.create_vertex_buffer(
            bytemuck::cast_slice(&origin_vertices),
            BufferUsage::Static,
        ).map_err(|e| format!("3D Origin VBO: {:?}", e))?;

        let origin_vao = backend.create_vertex_array(origin_vbo, None, &layout)
            .map_err(|e| format!("3D Origin VAO: {:?}", e))?;

        Ok(Self {
            shader,
            major_grid_vbo,
            major_grid_vao,
            major_grid_vertex_count,
            minor_grid_vbo,
            minor_grid_vao,
            minor_grid_vertex_count,
            axis_vbo,
            axis_vao,
            axis_vertex_count,
            origin_vbo,
            origin_vao,
            origin_vertex_count,
            config,
        })
    }

    /// Generate grid vertices on XZ plane (Y = 0).
    /// 在 XZ 平面上生成网格顶点（Y = 0）。
    fn generate_grid_vertices(size: f32, spacing: f32, color: [f32; 4], skip_center: bool) -> Vec<f32> {
        let mut vertices = Vec::new();
        let half_size = size / 2.0;
        let line_count = (size / spacing) as i32;

        // Generate lines along X axis (varying Z)
        for i in -line_count/2..=line_count/2 {
            let z = i as f32 * spacing;

            // Skip center line if requested (will be drawn as axis)
            if skip_center && i == 0 {
                continue;
            }

            // Start point
            vertices.extend_from_slice(&[-half_size, 0.0, z]);
            vertices.extend_from_slice(&color);
            // End point
            vertices.extend_from_slice(&[half_size, 0.0, z]);
            vertices.extend_from_slice(&color);
        }

        // Generate lines along Z axis (varying X)
        for i in -line_count/2..=line_count/2 {
            let x = i as f32 * spacing;

            // Skip center line if requested (will be drawn as axis)
            if skip_center && i == 0 {
                continue;
            }

            // Start point
            vertices.extend_from_slice(&[x, 0.0, -half_size]);
            vertices.extend_from_slice(&color);
            // End point
            vertices.extend_from_slice(&[x, 0.0, half_size]);
            vertices.extend_from_slice(&color);
        }

        vertices
    }

    /// Generate minor grid vertices, skipping major grid lines.
    /// 生成次网格顶点，跳过主网格线。
    fn generate_minor_grid_vertices(
        size: f32,
        minor_spacing: f32,
        major_spacing: f32,
        color: [f32; 4]
    ) -> Vec<f32> {
        let mut vertices = Vec::new();
        let half_size = size / 2.0;
        let line_count = (size / minor_spacing) as i32;
        let epsilon = minor_spacing * 0.01; // Small tolerance for float comparison

        // Generate lines along X axis (varying Z)
        for i in -line_count/2..=line_count/2 {
            let z = i as f32 * minor_spacing;

            // Skip if this is a major line or center line
            let is_major = (z.abs() % major_spacing).abs() < epsilon
                        || (z.abs() % major_spacing - major_spacing).abs() < epsilon;
            if is_major || z.abs() < epsilon {
                continue;
            }

            // Start point
            vertices.extend_from_slice(&[-half_size, 0.0, z]);
            vertices.extend_from_slice(&color);
            // End point
            vertices.extend_from_slice(&[half_size, 0.0, z]);
            vertices.extend_from_slice(&color);
        }

        // Generate lines along Z axis (varying X)
        for i in -line_count/2..=line_count/2 {
            let x = i as f32 * minor_spacing;

            // Skip if this is a major line or center line
            let is_major = (x.abs() % major_spacing).abs() < epsilon
                        || (x.abs() % major_spacing - major_spacing).abs() < epsilon;
            if is_major || x.abs() < epsilon {
                continue;
            }

            // Start point
            vertices.extend_from_slice(&[x, 0.0, -half_size]);
            vertices.extend_from_slice(&color);
            // End point
            vertices.extend_from_slice(&[x, 0.0, half_size]);
            vertices.extend_from_slice(&color);
        }

        vertices
    }

    /// Generate axis vertices (X = red, Y = green, Z = blue).
    /// 生成坐标轴顶点（X = 红色，Y = 绿色，Z = 蓝色）。
    fn generate_axis_vertices(length: f32) -> Vec<f32> {
        let mut vertices = Vec::new();

        // X axis (red) - extends in both directions
        // X 轴（红色）- 双向延伸
        vertices.extend_from_slice(&[-length, 0.0, 0.0]);
        vertices.extend_from_slice(&[0.6, 0.2, 0.2, 0.6]); // Negative side dimmer
        vertices.extend_from_slice(&[0.0, 0.0, 0.0]);
        vertices.extend_from_slice(&[0.6, 0.2, 0.2, 0.6]);

        vertices.extend_from_slice(&[0.0, 0.0, 0.0]);
        vertices.extend_from_slice(&[1.0, 0.3, 0.3, 1.0]); // Positive side brighter
        vertices.extend_from_slice(&[length, 0.0, 0.0]);
        vertices.extend_from_slice(&[1.0, 0.3, 0.3, 1.0]);

        // Y axis (green) - extends upward and downward
        // Y 轴（绿色）- 向上和向下延伸
        vertices.extend_from_slice(&[0.0, -length, 0.0]);
        vertices.extend_from_slice(&[0.2, 0.6, 0.2, 0.6]); // Negative side dimmer
        vertices.extend_from_slice(&[0.0, 0.0, 0.0]);
        vertices.extend_from_slice(&[0.2, 0.6, 0.2, 0.6]);

        vertices.extend_from_slice(&[0.0, 0.0, 0.0]);
        vertices.extend_from_slice(&[0.3, 1.0, 0.3, 1.0]); // Positive side brighter
        vertices.extend_from_slice(&[0.0, length, 0.0]);
        vertices.extend_from_slice(&[0.3, 1.0, 0.3, 1.0]);

        // Z axis (blue) - extends in both directions
        // Z 轴（蓝色）- 双向延伸
        vertices.extend_from_slice(&[0.0, 0.0, -length]);
        vertices.extend_from_slice(&[0.2, 0.2, 0.6, 0.6]); // Negative side dimmer
        vertices.extend_from_slice(&[0.0, 0.0, 0.0]);
        vertices.extend_from_slice(&[0.2, 0.2, 0.6, 0.6]);

        vertices.extend_from_slice(&[0.0, 0.0, 0.0]);
        vertices.extend_from_slice(&[0.3, 0.3, 1.0, 1.0]); // Positive side brighter
        vertices.extend_from_slice(&[0.0, 0.0, length]);
        vertices.extend_from_slice(&[0.3, 0.3, 1.0, 1.0]);

        vertices
    }

    /// Generate origin marker (small cross at origin).
    /// 生成原点标记（原点处的小十字）。
    fn generate_origin_marker(size: f32) -> Vec<f32> {
        let mut vertices = Vec::new();
        let color = [1.0, 1.0, 1.0, 0.8]; // White

        // Small cross on XZ plane
        vertices.extend_from_slice(&[-size, 0.0, 0.0]);
        vertices.extend_from_slice(&color);
        vertices.extend_from_slice(&[size, 0.0, 0.0]);
        vertices.extend_from_slice(&color);

        vertices.extend_from_slice(&[0.0, 0.0, -size]);
        vertices.extend_from_slice(&color);
        vertices.extend_from_slice(&[0.0, 0.0, size]);
        vertices.extend_from_slice(&color);

        // Vertical line
        vertices.extend_from_slice(&[0.0, -size, 0.0]);
        vertices.extend_from_slice(&color);
        vertices.extend_from_slice(&[0.0, size, 0.0]);
        vertices.extend_from_slice(&color);

        vertices
    }

    /// Render the 3D grid (both major and minor lines).
    /// 渲染 3D 网格（主网格线和次网格线）。
    pub fn render(&mut self, backend: &mut impl GraphicsBackend, camera: &Camera3D) {
        let vp = camera.view_projection_matrix();
        let cam_pos = camera.position;

        // Calculate fade distances based on camera height for dynamic density
        // 根据相机高度计算淡出距离以实现动态密度
        let cam_height = cam_pos.y.abs().max(1.0);
        let minor_fade_start = (cam_height * 1.5).min(self.config.fade_start * 0.5);
        let minor_fade_end = (cam_height * 3.0).min(self.config.fade_start);

        // Bind shader and set common uniforms
        backend.bind_shader(self.shader).ok();
        backend.set_uniform_mat4("u_viewProjection", &vp).ok();
        backend.set_uniform_vec3("u_cameraPos", Vec3::new(cam_pos.x, cam_pos.y, cam_pos.z)).ok();
        backend.set_blend_mode(BlendMode::Alpha);

        // Render minor grid (fades out faster when camera is close)
        backend.set_uniform_f32("u_fadeStart", minor_fade_start).ok();
        backend.set_uniform_f32("u_fadeEnd", minor_fade_end).ok();
        backend.draw_lines(self.minor_grid_vao, self.minor_grid_vertex_count, 0).ok();

        // Render major grid
        backend.set_uniform_f32("u_fadeStart", self.config.fade_start).ok();
        backend.set_uniform_f32("u_fadeEnd", self.config.fade_end).ok();
        backend.draw_lines(self.major_grid_vao, self.major_grid_vertex_count, 0).ok();

        // Render origin marker (always visible, no fade)
        backend.set_uniform_f32("u_fadeStart", 1000.0).ok();
        backend.set_uniform_f32("u_fadeEnd", 2000.0).ok();
        backend.draw_lines(self.origin_vao, self.origin_vertex_count, 0).ok();
    }

    /// Render the coordinate axes.
    /// 渲染坐标轴。
    pub fn render_axes(&mut self, backend: &mut impl GraphicsBackend, camera: &Camera3D) {
        let vp = camera.view_projection_matrix();
        let cam_pos = camera.position;

        backend.bind_shader(self.shader).ok();
        backend.set_uniform_mat4("u_viewProjection", &vp).ok();
        backend.set_uniform_vec3("u_cameraPos", Vec3::new(cam_pos.x, cam_pos.y, cam_pos.z)).ok();

        // Axes fade slower than grid
        backend.set_uniform_f32("u_fadeStart", self.config.fade_end * 2.0).ok();
        backend.set_uniform_f32("u_fadeEnd", self.config.fade_end * 4.0).ok();

        backend.set_blend_mode(BlendMode::Alpha);
        backend.draw_lines(self.axis_vao, self.axis_vertex_count, 0).ok();
    }

    /// Destroy renderer resources.
    /// 销毁渲染器资源。
    pub fn destroy(self, backend: &mut impl GraphicsBackend) {
        backend.destroy_vertex_array(self.major_grid_vao);
        backend.destroy_buffer(self.major_grid_vbo);
        backend.destroy_vertex_array(self.minor_grid_vao);
        backend.destroy_buffer(self.minor_grid_vbo);
        backend.destroy_vertex_array(self.axis_vao);
        backend.destroy_buffer(self.axis_vbo);
        backend.destroy_vertex_array(self.origin_vao);
        backend.destroy_buffer(self.origin_vbo);
        backend.destroy_shader(self.shader);
    }
}
