//! Grid renderer for editor viewport.

use es_engine_shared::{
    traits::backend::{GraphicsBackend, BufferUsage},
    types::{
        handle::{ShaderHandle, BufferHandle, VertexArrayHandle},
        vertex::{VertexLayout, VertexAttribute, VertexAttributeType},
        blend::BlendMode,
    },
    Vec4,
};
use super::camera::Camera2D;

const VERTEX_SHADER: &str = r#"#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
uniform mat3 u_projection;
void main() {
    vec3 pos = u_projection * vec3(a_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}
"#;

const FRAGMENT_SHADER: &str = r#"#version 300 es
precision highp float;
uniform vec4 u_color;
out vec4 fragColor;
void main() {
    fragColor = u_color;
}
"#;

const GRID_COLOR: Vec4 = Vec4::new(0.3, 0.3, 0.35, 1.0);
const X_AXIS_COLOR: Vec4 = Vec4::new(1.0, 0.3, 0.3, 1.0);
const Y_AXIS_COLOR: Vec4 = Vec4::new(0.3, 1.0, 0.3, 1.0);

pub struct GridRenderer {
    shader: ShaderHandle,
    grid_vbo: BufferHandle,
    grid_vao: VertexArrayHandle,
    axis_vbo: BufferHandle,
    axis_vao: VertexArrayHandle,
    grid_vertex_count: u32,
    cache: GridCache,
}

#[derive(Default)]
struct GridCache {
    zoom: f32,
    width: f32,
    height: f32,
}

impl GridCache {
    fn is_dirty(&self, camera: &Camera2D) -> bool {
        (camera.zoom - self.zoom).abs() > 0.001
            || (camera.viewport_width() - self.width).abs() > 1.0
            || (camera.viewport_height() - self.height).abs() > 1.0
    }

    fn update(&mut self, camera: &Camera2D) {
        self.zoom = camera.zoom;
        self.width = camera.viewport_width();
        self.height = camera.viewport_height();
    }
}

const MAX_GRID_VERTICES: usize = 8000;

impl GridRenderer {
    pub fn new(backend: &mut impl GraphicsBackend) -> Result<Self, String> {
        let shader = backend.compile_shader(VERTEX_SHADER, FRAGMENT_SHADER)
            .map_err(|e| format!("Grid shader: {:?}", e))?;

        let layout = VertexLayout {
            attributes: vec![
                VertexAttribute {
                    name: "a_position".into(),
                    attr_type: VertexAttributeType::Float2,
                    offset: 0,
                    normalized: false,
                },
            ],
            stride: 8,
        };

        let grid_buffer_size = MAX_GRID_VERTICES * 2 * 4;
        let grid_vbo = backend.create_vertex_buffer_sized(grid_buffer_size, BufferUsage::Dynamic)
            .map_err(|e| format!("Grid VBO: {:?}", e))?;
        let grid_vao = backend.create_vertex_array(grid_vbo, None, &layout)
            .map_err(|e| format!("Grid VAO: {:?}", e))?;

        let axis_data = Self::build_axis_vertices(1000.0);
        let axis_vbo = backend.create_vertex_buffer(
            bytemuck::cast_slice(&axis_data),
            BufferUsage::Dynamic,
        ).map_err(|e| format!("Axis VBO: {:?}", e))?;
        let axis_vao = backend.create_vertex_array(axis_vbo, None, &layout)
            .map_err(|e| format!("Axis VAO: {:?}", e))?;

        Ok(Self {
            shader,
            grid_vbo,
            grid_vao,
            axis_vbo,
            axis_vao,
            grid_vertex_count: 0,
            cache: GridCache::default(),
        })
    }

    pub fn render(&mut self, backend: &mut impl GraphicsBackend, camera: &Camera2D) {
        self.update_grid_if_needed(backend, camera);

        if self.grid_vertex_count == 0 {
            return;
        }

        backend.bind_shader(self.shader).ok();
        backend.set_uniform_mat3("u_projection", &camera.projection_matrix()).ok();
        backend.set_uniform_vec4("u_color", GRID_COLOR).ok();
        backend.set_blend_mode(BlendMode::Alpha);
        backend.draw_lines(self.grid_vao, self.grid_vertex_count, 0).ok();
    }

    pub fn render_axes(&mut self, backend: &mut impl GraphicsBackend, camera: &Camera2D) {
        let axis_length = self.calculate_axis_length(camera);
        self.update_axis_buffer(backend, axis_length);

        backend.bind_shader(self.shader).ok();
        backend.set_uniform_mat3("u_projection", &camera.projection_matrix()).ok();
        backend.set_blend_mode(BlendMode::Alpha);

        backend.set_uniform_vec4("u_color", X_AXIS_COLOR).ok();
        backend.draw_lines(self.axis_vao, 2, 0).ok();

        backend.set_uniform_vec4("u_color", Y_AXIS_COLOR).ok();
        backend.draw_lines(self.axis_vao, 2, 2).ok();
    }

    fn update_grid_if_needed(&mut self, backend: &mut impl GraphicsBackend, camera: &Camera2D) {
        if !self.cache.is_dirty(camera) {
            return;
        }
        self.cache.update(camera);

        let vertices = self.build_grid_vertices(camera);
        self.grid_vertex_count = (vertices.len() / 2) as u32;

        backend.update_buffer(self.grid_vbo, 0, bytemuck::cast_slice(&vertices)).ok();
    }

    fn build_grid_vertices(&self, camera: &Camera2D) -> Vec<f32> {
        let half_w = camera.viewport_width() / (2.0 * camera.zoom);
        let half_h = camera.viewport_height() / (2.0 * camera.zoom);
        let max_size = half_w.max(half_h) * 2.0;

        let step = Self::calculate_grid_step(max_size);
        let range = max_size * 1.5;

        let mut vertices = Vec::new();
        let start = (-range / step).floor() * step;
        let end = (range / step).ceil() * step;

        let mut pos = start;
        while pos <= end {
            vertices.extend_from_slice(&[pos, -range, pos, range]);
            vertices.extend_from_slice(&[-range, pos, range, pos]);
            pos += step;
        }

        vertices
    }

    fn calculate_grid_step(max_size: f32) -> f32 {
        match max_size {
            s if s > 10000.0 => 1000.0,
            s if s > 1000.0 => 100.0,
            s if s > 100.0 => 10.0,
            s if s > 10.0 => 1.0,
            _ => 0.1,
        }
    }

    fn calculate_axis_length(&self, camera: &Camera2D) -> f32 {
        let half_w = camera.viewport_width() / (2.0 * camera.zoom);
        let half_h = camera.viewport_height() / (2.0 * camera.zoom);
        half_w.max(half_h) * 2.0
    }

    fn build_axis_vertices(length: f32) -> Vec<f32> {
        vec![
            -length, 0.0, length, 0.0,
            0.0, -length, 0.0, length,
        ]
    }

    fn update_axis_buffer(&mut self, backend: &mut impl GraphicsBackend, length: f32) {
        let data = Self::build_axis_vertices(length);
        backend.update_buffer(self.axis_vbo, 0, bytemuck::cast_slice(&data)).ok();
    }

    pub fn destroy(self, backend: &mut impl GraphicsBackend) {
        backend.destroy_vertex_array(self.grid_vao);
        backend.destroy_vertex_array(self.axis_vao);
        backend.destroy_buffer(self.grid_vbo);
        backend.destroy_buffer(self.axis_vbo);
        backend.destroy_shader(self.shader);
    }
}
