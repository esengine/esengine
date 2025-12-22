//! 3D Gizmo renderer for editor overlays.
//! 编辑器 3D Gizmo 渲染器。
//!
//! Provides transform handles for 3D editing:
//! - Translation: XYZ axis arrows with plane handles
//! - Rotation: XYZ rotation circles
//! - Scale: XYZ axis with cube handles
//!
//! 提供 3D 编辑的变换手柄：
//! - 平移：XYZ 轴箭头和平面手柄
//! - 旋转：XYZ 旋转圆环
//! - 缩放：XYZ 轴和立方体手柄

use es_engine_shared::{
    traits::backend::{GraphicsBackend, BufferUsage},
    types::{
        handle::{ShaderHandle, BufferHandle, VertexArrayHandle},
        vertex::{VertexLayout, VertexAttribute, VertexAttributeType},
        blend::BlendMode,
    },
    Vec3, Mat4,
};
use super::camera3d::Camera3D;
use super::gizmo::TransformMode;
use std::f32::consts::PI;

const GIZMO3D_VERTEX_SHADER: &str = r#"#version 300 es
precision highp float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec4 a_color;

uniform mat4 u_viewProjection;
uniform mat4 u_model;

out vec4 v_color;

void main() {
    gl_Position = u_viewProjection * u_model * vec4(a_position, 1.0);
    v_color = a_color;
}
"#;

const GIZMO3D_FRAGMENT_SHADER: &str = r#"#version 300 es
precision highp float;

in vec4 v_color;
out vec4 fragColor;

void main() {
    fragColor = v_color;
}
"#;

// Axis colors | 轴颜色
const X_AXIS_COLOR: [f32; 4] = [1.0, 0.3, 0.3, 1.0]; // Red
const Y_AXIS_COLOR: [f32; 4] = [0.3, 1.0, 0.3, 1.0]; // Green
const Z_AXIS_COLOR: [f32; 4] = [0.3, 0.3, 1.0, 1.0]; // Blue
const XY_PLANE_COLOR: [f32; 4] = [1.0, 1.0, 0.3, 0.5]; // Yellow (XY plane)
const XZ_PLANE_COLOR: [f32; 4] = [1.0, 0.3, 1.0, 0.5]; // Magenta (XZ plane)
const YZ_PLANE_COLOR: [f32; 4] = [0.3, 1.0, 1.0, 0.5]; // Cyan (YZ plane)
const CENTER_COLOR: [f32; 4] = [1.0, 1.0, 1.0, 1.0]; // White center

/// 3D Gizmo renderer for transform handles.
/// 用于变换手柄的 3D Gizmo 渲染器。
pub struct Gizmo3DRenderer {
    shader: ShaderHandle,

    // Translation gizmo
    translate_vbo: BufferHandle,
    translate_vao: VertexArrayHandle,
    translate_line_count: u32,
    translate_arrow_vbo: BufferHandle,
    translate_arrow_vao: VertexArrayHandle,
    translate_arrow_count: u32,

    // Rotation gizmo
    rotate_vbo: BufferHandle,
    rotate_vao: VertexArrayHandle,
    rotate_vertex_count: u32,

    // Scale gizmo
    scale_vbo: BufferHandle,
    scale_vao: VertexArrayHandle,
    scale_line_count: u32,
    scale_cube_vbo: BufferHandle,
    scale_cube_vao: VertexArrayHandle,
    scale_cube_count: u32,

    // Center sphere
    center_vbo: BufferHandle,
    center_vao: VertexArrayHandle,
    center_vertex_count: u32,

    // Plane handles for translation
    plane_vbo: BufferHandle,
    plane_vao: VertexArrayHandle,
    plane_vertex_count: u32,

    /// Current transform mode
    transform_mode: TransformMode,

    /// Gizmo size (in world units at distance 1)
    gizmo_size: f32,
}

impl Gizmo3DRenderer {
    /// Create a new 3D gizmo renderer.
    /// 创建新的 3D Gizmo 渲染器。
    pub fn new(backend: &mut impl GraphicsBackend) -> Result<Self, String> {
        let shader = backend.compile_shader(GIZMO3D_VERTEX_SHADER, GIZMO3D_FRAGMENT_SHADER)
            .map_err(|e| format!("3D Gizmo shader: {:?}", e))?;

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
            stride: 28,
        };

        let gizmo_size = 1.0;

        // Translation axis lines
        let translate_verts = Self::generate_axis_lines(gizmo_size);
        let translate_line_count = (translate_verts.len() / 7) as u32;
        let translate_vbo = backend.create_vertex_buffer(
            bytemuck::cast_slice(&translate_verts),
            BufferUsage::Static,
        ).map_err(|e| format!("Translate VBO: {:?}", e))?;
        let translate_vao = backend.create_vertex_array(translate_vbo, None, &layout)
            .map_err(|e| format!("Translate VAO: {:?}", e))?;

        // Translation arrow cones
        let arrow_verts = Self::generate_arrow_cones(gizmo_size, 16);
        let translate_arrow_count = (arrow_verts.len() / 7) as u32;
        let translate_arrow_vbo = backend.create_vertex_buffer(
            bytemuck::cast_slice(&arrow_verts),
            BufferUsage::Static,
        ).map_err(|e| format!("Arrow VBO: {:?}", e))?;
        let translate_arrow_vao = backend.create_vertex_array(translate_arrow_vbo, None, &layout)
            .map_err(|e| format!("Arrow VAO: {:?}", e))?;

        // Rotation circles
        let rotate_verts = Self::generate_rotation_circles(gizmo_size * 0.8, 48);
        let rotate_vertex_count = (rotate_verts.len() / 7) as u32;
        let rotate_vbo = backend.create_vertex_buffer(
            bytemuck::cast_slice(&rotate_verts),
            BufferUsage::Static,
        ).map_err(|e| format!("Rotate VBO: {:?}", e))?;
        let rotate_vao = backend.create_vertex_array(rotate_vbo, None, &layout)
            .map_err(|e| format!("Rotate VAO: {:?}", e))?;

        // Scale axis lines (same as translate for now)
        let scale_verts = Self::generate_axis_lines(gizmo_size);
        let scale_line_count = (scale_verts.len() / 7) as u32;
        let scale_vbo = backend.create_vertex_buffer(
            bytemuck::cast_slice(&scale_verts),
            BufferUsage::Static,
        ).map_err(|e| format!("Scale VBO: {:?}", e))?;
        let scale_vao = backend.create_vertex_array(scale_vbo, None, &layout)
            .map_err(|e| format!("Scale VAO: {:?}", e))?;

        // Scale cubes at end of axes
        let cube_verts = Self::generate_scale_cubes(gizmo_size, 0.08);
        let scale_cube_count = (cube_verts.len() / 7) as u32;
        let scale_cube_vbo = backend.create_vertex_buffer(
            bytemuck::cast_slice(&cube_verts),
            BufferUsage::Static,
        ).map_err(|e| format!("Scale cube VBO: {:?}", e))?;
        let scale_cube_vao = backend.create_vertex_array(scale_cube_vbo, None, &layout)
            .map_err(|e| format!("Scale cube VAO: {:?}", e))?;

        // Center sphere
        let center_verts = Self::generate_center_sphere(0.08, 12);
        let center_vertex_count = (center_verts.len() / 7) as u32;
        let center_vbo = backend.create_vertex_buffer(
            bytemuck::cast_slice(&center_verts),
            BufferUsage::Static,
        ).map_err(|e| format!("Center VBO: {:?}", e))?;
        let center_vao = backend.create_vertex_array(center_vbo, None, &layout)
            .map_err(|e| format!("Center VAO: {:?}", e))?;

        // Plane handles
        let plane_verts = Self::generate_plane_handles(gizmo_size * 0.3);
        let plane_vertex_count = (plane_verts.len() / 7) as u32;
        let plane_vbo = backend.create_vertex_buffer(
            bytemuck::cast_slice(&plane_verts),
            BufferUsage::Static,
        ).map_err(|e| format!("Plane VBO: {:?}", e))?;
        let plane_vao = backend.create_vertex_array(plane_vbo, None, &layout)
            .map_err(|e| format!("Plane VAO: {:?}", e))?;

        Ok(Self {
            shader,
            translate_vbo,
            translate_vao,
            translate_line_count,
            translate_arrow_vbo,
            translate_arrow_vao,
            translate_arrow_count,
            rotate_vbo,
            rotate_vao,
            rotate_vertex_count,
            scale_vbo,
            scale_vao,
            scale_line_count,
            scale_cube_vbo,
            scale_cube_vao,
            scale_cube_count,
            center_vbo,
            center_vao,
            center_vertex_count,
            plane_vbo,
            plane_vao,
            plane_vertex_count,
            transform_mode: TransformMode::Move,
            gizmo_size,
        })
    }

    /// Generate XYZ axis lines.
    fn generate_axis_lines(length: f32) -> Vec<f32> {
        let mut verts = Vec::new();

        // X axis
        verts.extend_from_slice(&[0.0, 0.0, 0.0]);
        verts.extend_from_slice(&X_AXIS_COLOR);
        verts.extend_from_slice(&[length, 0.0, 0.0]);
        verts.extend_from_slice(&X_AXIS_COLOR);

        // Y axis
        verts.extend_from_slice(&[0.0, 0.0, 0.0]);
        verts.extend_from_slice(&Y_AXIS_COLOR);
        verts.extend_from_slice(&[0.0, length, 0.0]);
        verts.extend_from_slice(&Y_AXIS_COLOR);

        // Z axis
        verts.extend_from_slice(&[0.0, 0.0, 0.0]);
        verts.extend_from_slice(&Z_AXIS_COLOR);
        verts.extend_from_slice(&[0.0, 0.0, length]);
        verts.extend_from_slice(&Z_AXIS_COLOR);

        verts
    }

    /// Generate arrow cones for translation gizmo.
    fn generate_arrow_cones(axis_length: f32, segments: u32) -> Vec<f32> {
        let mut verts = Vec::new();
        let cone_length = 0.15;
        let cone_radius = 0.05;

        // Generate cone for each axis
        for axis in 0..3 {
            let color = match axis {
                0 => X_AXIS_COLOR,
                1 => Y_AXIS_COLOR,
                _ => Z_AXIS_COLOR,
            };

            let tip = match axis {
                0 => [axis_length + cone_length, 0.0, 0.0],
                1 => [0.0, axis_length + cone_length, 0.0],
                _ => [0.0, 0.0, axis_length + cone_length],
            };

            let base_center = match axis {
                0 => [axis_length, 0.0, 0.0],
                1 => [0.0, axis_length, 0.0],
                _ => [0.0, 0.0, axis_length],
            };

            // Generate cone triangles (as lines for wireframe)
            for i in 0..segments {
                let angle1 = (i as f32) * 2.0 * PI / (segments as f32);
                let angle2 = ((i + 1) as f32) * 2.0 * PI / (segments as f32);

                let (p1, p2) = match axis {
                    0 => (
                        [base_center[0], cone_radius * angle1.cos(), cone_radius * angle1.sin()],
                        [base_center[0], cone_radius * angle2.cos(), cone_radius * angle2.sin()],
                    ),
                    1 => (
                        [cone_radius * angle1.cos(), base_center[1], cone_radius * angle1.sin()],
                        [cone_radius * angle2.cos(), base_center[1], cone_radius * angle2.sin()],
                    ),
                    _ => (
                        [cone_radius * angle1.cos(), cone_radius * angle1.sin(), base_center[2]],
                        [cone_radius * angle2.cos(), cone_radius * angle2.sin(), base_center[2]],
                    ),
                };

                // Line from tip to base edge
                verts.extend_from_slice(&tip);
                verts.extend_from_slice(&color);
                verts.extend_from_slice(&p1);
                verts.extend_from_slice(&color);

                // Base circle segment
                verts.extend_from_slice(&p1);
                verts.extend_from_slice(&color);
                verts.extend_from_slice(&p2);
                verts.extend_from_slice(&color);
            }
        }

        verts
    }

    /// Generate rotation circles for each axis.
    fn generate_rotation_circles(radius: f32, segments: u32) -> Vec<f32> {
        let mut verts = Vec::new();

        // X axis rotation (YZ plane) - Red
        for i in 0..segments {
            let angle1 = (i as f32) * 2.0 * PI / (segments as f32);
            let angle2 = ((i + 1) as f32) * 2.0 * PI / (segments as f32);

            verts.extend_from_slice(&[0.0, radius * angle1.cos(), radius * angle1.sin()]);
            verts.extend_from_slice(&X_AXIS_COLOR);
            verts.extend_from_slice(&[0.0, radius * angle2.cos(), radius * angle2.sin()]);
            verts.extend_from_slice(&X_AXIS_COLOR);
        }

        // Y axis rotation (XZ plane) - Green
        for i in 0..segments {
            let angle1 = (i as f32) * 2.0 * PI / (segments as f32);
            let angle2 = ((i + 1) as f32) * 2.0 * PI / (segments as f32);

            verts.extend_from_slice(&[radius * angle1.cos(), 0.0, radius * angle1.sin()]);
            verts.extend_from_slice(&Y_AXIS_COLOR);
            verts.extend_from_slice(&[radius * angle2.cos(), 0.0, radius * angle2.sin()]);
            verts.extend_from_slice(&Y_AXIS_COLOR);
        }

        // Z axis rotation (XY plane) - Blue
        for i in 0..segments {
            let angle1 = (i as f32) * 2.0 * PI / (segments as f32);
            let angle2 = ((i + 1) as f32) * 2.0 * PI / (segments as f32);

            verts.extend_from_slice(&[radius * angle1.cos(), radius * angle1.sin(), 0.0]);
            verts.extend_from_slice(&Z_AXIS_COLOR);
            verts.extend_from_slice(&[radius * angle2.cos(), radius * angle2.sin(), 0.0]);
            verts.extend_from_slice(&Z_AXIS_COLOR);
        }

        verts
    }

    /// Generate scale cubes at end of axes.
    fn generate_scale_cubes(axis_length: f32, cube_size: f32) -> Vec<f32> {
        let mut verts = Vec::new();
        let half = cube_size / 2.0;

        // Generate cube wireframe for each axis
        for axis in 0..3 {
            let color = match axis {
                0 => X_AXIS_COLOR,
                1 => Y_AXIS_COLOR,
                _ => Z_AXIS_COLOR,
            };

            let center = match axis {
                0 => [axis_length, 0.0, 0.0],
                1 => [0.0, axis_length, 0.0],
                _ => [0.0, 0.0, axis_length],
            };

            // 12 edges of cube
            let edges = [
                // Bottom face
                ([-half, -half, -half], [half, -half, -half]),
                ([half, -half, -half], [half, -half, half]),
                ([half, -half, half], [-half, -half, half]),
                ([-half, -half, half], [-half, -half, -half]),
                // Top face
                ([-half, half, -half], [half, half, -half]),
                ([half, half, -half], [half, half, half]),
                ([half, half, half], [-half, half, half]),
                ([-half, half, half], [-half, half, -half]),
                // Vertical edges
                ([-half, -half, -half], [-half, half, -half]),
                ([half, -half, -half], [half, half, -half]),
                ([half, -half, half], [half, half, half]),
                ([-half, -half, half], [-half, half, half]),
            ];

            for (p1, p2) in edges {
                verts.extend_from_slice(&[center[0] + p1[0], center[1] + p1[1], center[2] + p1[2]]);
                verts.extend_from_slice(&color);
                verts.extend_from_slice(&[center[0] + p2[0], center[1] + p2[1], center[2] + p2[2]]);
                verts.extend_from_slice(&color);
            }
        }

        verts
    }

    /// Generate center sphere wireframe.
    fn generate_center_sphere(radius: f32, segments: u32) -> Vec<f32> {
        let mut verts = Vec::new();

        // Three circles for sphere wireframe
        // XY plane
        for i in 0..segments {
            let angle1 = (i as f32) * 2.0 * PI / (segments as f32);
            let angle2 = ((i + 1) as f32) * 2.0 * PI / (segments as f32);

            verts.extend_from_slice(&[radius * angle1.cos(), radius * angle1.sin(), 0.0]);
            verts.extend_from_slice(&CENTER_COLOR);
            verts.extend_from_slice(&[radius * angle2.cos(), radius * angle2.sin(), 0.0]);
            verts.extend_from_slice(&CENTER_COLOR);
        }

        // XZ plane
        for i in 0..segments {
            let angle1 = (i as f32) * 2.0 * PI / (segments as f32);
            let angle2 = ((i + 1) as f32) * 2.0 * PI / (segments as f32);

            verts.extend_from_slice(&[radius * angle1.cos(), 0.0, radius * angle1.sin()]);
            verts.extend_from_slice(&CENTER_COLOR);
            verts.extend_from_slice(&[radius * angle2.cos(), 0.0, radius * angle2.sin()]);
            verts.extend_from_slice(&CENTER_COLOR);
        }

        // YZ plane
        for i in 0..segments {
            let angle1 = (i as f32) * 2.0 * PI / (segments as f32);
            let angle2 = ((i + 1) as f32) * 2.0 * PI / (segments as f32);

            verts.extend_from_slice(&[0.0, radius * angle1.cos(), radius * angle1.sin()]);
            verts.extend_from_slice(&CENTER_COLOR);
            verts.extend_from_slice(&[0.0, radius * angle2.cos(), radius * angle2.sin()]);
            verts.extend_from_slice(&CENTER_COLOR);
        }

        verts
    }

    /// Generate plane handles for translation.
    fn generate_plane_handles(size: f32) -> Vec<f32> {
        let mut verts = Vec::new();
        let offset = size * 0.3;

        // XY plane handle (Blue)
        let xy = [
            [offset, offset, 0.0],
            [offset + size, offset, 0.0],
            [offset + size, offset + size, 0.0],
            [offset, offset + size, 0.0],
        ];
        for i in 0..4 {
            verts.extend_from_slice(&xy[i]);
            verts.extend_from_slice(&XY_PLANE_COLOR);
            verts.extend_from_slice(&xy[(i + 1) % 4]);
            verts.extend_from_slice(&XY_PLANE_COLOR);
        }

        // XZ plane handle (Magenta)
        let xz = [
            [offset, 0.0, offset],
            [offset + size, 0.0, offset],
            [offset + size, 0.0, offset + size],
            [offset, 0.0, offset + size],
        ];
        for i in 0..4 {
            verts.extend_from_slice(&xz[i]);
            verts.extend_from_slice(&XZ_PLANE_COLOR);
            verts.extend_from_slice(&xz[(i + 1) % 4]);
            verts.extend_from_slice(&XZ_PLANE_COLOR);
        }

        // YZ plane handle (Cyan)
        let yz = [
            [0.0, offset, offset],
            [0.0, offset + size, offset],
            [0.0, offset + size, offset + size],
            [0.0, offset, offset + size],
        ];
        for i in 0..4 {
            verts.extend_from_slice(&yz[i]);
            verts.extend_from_slice(&YZ_PLANE_COLOR);
            verts.extend_from_slice(&yz[(i + 1) % 4]);
            verts.extend_from_slice(&YZ_PLANE_COLOR);
        }

        verts
    }

    /// Set the current transform mode.
    pub fn set_transform_mode(&mut self, mode: TransformMode) {
        self.transform_mode = mode;
    }

    /// Get the current transform mode.
    pub fn get_transform_mode(&self) -> TransformMode {
        self.transform_mode
    }

    /// Render the gizmo at a specific position.
    /// 在指定位置渲染 Gizmo。
    pub fn render(
        &mut self,
        backend: &mut impl GraphicsBackend,
        camera: &Camera3D,
        position: Vec3,
        scale: f32,
    ) {
        let vp = camera.view_projection_matrix();

        // Calculate distance-based scale to keep gizmo constant screen size
        let cam_pos = camera.position;
        let distance = (position - cam_pos).length().max(0.1);
        let screen_scale = distance * 0.15 * scale;

        // Create model matrix (translation + uniform scale)
        let model = Mat4::from_translation(position) * Mat4::from_scale(Vec3::splat(screen_scale));

        backend.bind_shader(self.shader).ok();
        backend.set_uniform_mat4("u_viewProjection", &vp).ok();
        backend.set_uniform_mat4("u_model", &model).ok();
        backend.set_blend_mode(BlendMode::Alpha);

        // Render center
        backend.draw_lines(self.center_vao, self.center_vertex_count, 0).ok();

        match self.transform_mode {
            TransformMode::Select => {
                // Just render center
            }
            TransformMode::Move => {
                // Render translation handles
                backend.draw_lines(self.translate_vao, self.translate_line_count, 0).ok();
                backend.draw_lines(self.translate_arrow_vao, self.translate_arrow_count, 0).ok();
                backend.draw_lines(self.plane_vao, self.plane_vertex_count, 0).ok();
            }
            TransformMode::Rotate => {
                // Render rotation handles
                backend.draw_lines(self.rotate_vao, self.rotate_vertex_count, 0).ok();
            }
            TransformMode::Scale => {
                // Render scale handles
                backend.draw_lines(self.scale_vao, self.scale_line_count, 0).ok();
                backend.draw_lines(self.scale_cube_vao, self.scale_cube_count, 0).ok();
            }
        }
    }

    /// Destroy renderer resources.
    pub fn destroy(self, backend: &mut impl GraphicsBackend) {
        backend.destroy_vertex_array(self.translate_vao);
        backend.destroy_buffer(self.translate_vbo);
        backend.destroy_vertex_array(self.translate_arrow_vao);
        backend.destroy_buffer(self.translate_arrow_vbo);
        backend.destroy_vertex_array(self.rotate_vao);
        backend.destroy_buffer(self.rotate_vbo);
        backend.destroy_vertex_array(self.scale_vao);
        backend.destroy_buffer(self.scale_vbo);
        backend.destroy_vertex_array(self.scale_cube_vao);
        backend.destroy_buffer(self.scale_cube_vbo);
        backend.destroy_vertex_array(self.center_vao);
        backend.destroy_buffer(self.center_vbo);
        backend.destroy_vertex_array(self.plane_vao);
        backend.destroy_buffer(self.plane_vbo);
        backend.destroy_shader(self.shader);
    }
}
