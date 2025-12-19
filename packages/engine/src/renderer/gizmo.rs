//! Gizmo renderer for editor overlays.

use es_engine_shared::{
    traits::backend::{GraphicsBackend, BufferUsage},
    types::{
        handle::{ShaderHandle, BufferHandle, VertexArrayHandle},
        vertex::{VertexLayout, VertexAttribute, VertexAttributeType},
        blend::BlendMode,
    },
    Vec4, Mat3,
};
use super::camera::Camera2D;
use std::f32::consts::PI;

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

const X_AXIS_COLOR: Vec4 = Vec4::new(1.0, 0.3, 0.3, 1.0);
const Y_AXIS_COLOR: Vec4 = Vec4::new(0.3, 1.0, 0.3, 1.0);
const ROTATE_COLOR: Vec4 = Vec4::new(0.3, 0.6, 1.0, 1.0);
const SCALE_COLOR: Vec4 = Vec4::new(1.0, 0.8, 0.2, 1.0);

#[derive(Clone, Copy, PartialEq, Eq, Debug, Default)]
pub enum TransformMode {
    #[default]
    Select,
    Move,
    Rotate,
    Scale,
}

pub struct GizmoRenderer {
    shader: ShaderHandle,
    vbo: BufferHandle,
    vao: VertexArrayHandle,
    rects: Vec<RectGizmo>,
    circles: Vec<CircleGizmo>,
    lines: Vec<LineGizmo>,
    capsules: Vec<CapsuleGizmo>,
    transform_mode: TransformMode,
}

struct RectGizmo {
    x: f32, y: f32, width: f32, height: f32,
    rotation: f32, origin_x: f32, origin_y: f32,
    color: Vec4, show_handles: bool,
}

struct CircleGizmo {
    x: f32, y: f32, radius: f32, color: Vec4, segments: u32,
}

struct LineGizmo {
    points: Vec<f32>, color: Vec4, closed: bool,
}

struct CapsuleGizmo {
    x: f32, y: f32, radius: f32, half_height: f32, rotation: f32, color: Vec4,
}

const MAX_GIZMO_VERTICES: usize = 4000;

impl GizmoRenderer {
    pub fn new(backend: &mut impl GraphicsBackend) -> Result<Self, String> {
        let shader = backend.compile_shader(VERTEX_SHADER, FRAGMENT_SHADER)
            .map_err(|e| format!("Gizmo shader: {:?}", e))?;

        let layout = VertexLayout {
            attributes: vec![VertexAttribute {
                name: "a_position".into(),
                attr_type: VertexAttributeType::Float2,
                offset: 0,
                normalized: false,
            }],
            stride: 8,
        };

        let buffer_size = MAX_GIZMO_VERTICES * 2 * 4;
        let vbo = backend.create_vertex_buffer_sized(buffer_size, BufferUsage::Dynamic)
            .map_err(|e| format!("Gizmo VBO: {:?}", e))?;
        let vao = backend.create_vertex_array(vbo, None, &layout)
            .map_err(|e| format!("Gizmo VAO: {:?}", e))?;

        Ok(Self {
            shader, vbo, vao,
            rects: Vec::new(),
            circles: Vec::new(),
            lines: Vec::new(),
            capsules: Vec::new(),
            transform_mode: TransformMode::default(),
        })
    }

    pub fn clear(&mut self) {
        self.rects.clear();
        self.circles.clear();
        self.lines.clear();
        self.capsules.clear();
    }

    pub fn add_rect(&mut self, x: f32, y: f32, width: f32, height: f32, rotation: f32,
                    origin_x: f32, origin_y: f32, r: f32, g: f32, b: f32, a: f32, show_handles: bool) {
        self.rects.push(RectGizmo {
            x, y, width, height, rotation, origin_x, origin_y,
            color: Vec4::new(r, g, b, a), show_handles,
        });
    }

    pub fn add_circle(&mut self, x: f32, y: f32, radius: f32, r: f32, g: f32, b: f32, a: f32) {
        self.circles.push(CircleGizmo { x, y, radius, color: Vec4::new(r, g, b, a), segments: 32 });
    }

    pub fn add_line(&mut self, points: Vec<f32>, r: f32, g: f32, b: f32, a: f32, closed: bool) {
        self.lines.push(LineGizmo { points, color: Vec4::new(r, g, b, a), closed });
    }

    pub fn add_capsule(&mut self, x: f32, y: f32, radius: f32, half_height: f32, rotation: f32,
                       r: f32, g: f32, b: f32, a: f32) {
        self.capsules.push(CapsuleGizmo { x, y, radius, half_height, rotation, color: Vec4::new(r, g, b, a) });
    }

    pub fn set_transform_mode(&mut self, mode: TransformMode) {
        self.transform_mode = mode;
    }

    pub fn get_transform_mode(&self) -> TransformMode {
        self.transform_mode
    }

    pub fn render(&mut self, backend: &mut impl GraphicsBackend, camera: &Camera2D) {
        if self.rects.is_empty() && self.circles.is_empty() && self.lines.is_empty() && self.capsules.is_empty() {
            return;
        }

        backend.bind_shader(self.shader).ok();
        backend.set_uniform_mat3("u_projection", &camera.projection_matrix()).ok();
        backend.set_blend_mode(BlendMode::Alpha);

        self.render_rects(backend, camera);
        self.render_circles(backend);
        self.render_lines(backend);
        self.render_capsules(backend);
    }

    pub fn render_axis_indicator(&mut self, backend: &mut impl GraphicsBackend, width: f32, height: f32) {
        if width < 100.0 || height < 100.0 {
            return;
        }

        backend.bind_shader(self.shader).ok();

        let half_w = width / 2.0;
        let half_h = height / 2.0;
        let projection = Mat3::from_cols_array(&[
            1.0 / half_w, 0.0, 0.0,
            0.0, 1.0 / half_h, 0.0,
            0.0, 0.0, 1.0,
        ]);
        backend.set_uniform_mat3("u_projection", &projection).ok();
        backend.set_blend_mode(BlendMode::Alpha);

        let padding = 35.0;
        let cx = -half_w + padding;
        let cy = -half_h + padding;
        let axis_len = 25.0;
        let arrow = 6.0;
        let label_off = 8.0;
        let label_sz = 3.5;

        // X axis
        let x_end = cx + axis_len;
        self.upload_and_draw_lines(backend, &[cx, cy, x_end - arrow * 0.3, cy], X_AXIS_COLOR);
        self.upload_and_draw(backend, &[x_end, cy, x_end - arrow, cy + arrow * 0.35, x_end - arrow, cy - arrow * 0.35], X_AXIS_COLOR);
        let lx = x_end + label_off;
        self.upload_and_draw_lines(backend, &[lx - label_sz, cy + label_sz, lx + label_sz, cy - label_sz,
                                              lx - label_sz, cy - label_sz, lx + label_sz, cy + label_sz], X_AXIS_COLOR);

        // Y axis
        let y_end = cy + axis_len;
        self.upload_and_draw_lines(backend, &[cx, cy, cx, y_end - arrow * 0.3], Y_AXIS_COLOR);
        self.upload_and_draw(backend, &[cx, y_end, cx - arrow * 0.35, y_end - arrow, cx + arrow * 0.35, y_end - arrow], Y_AXIS_COLOR);
        let ly = y_end + label_off;
        self.upload_and_draw_lines(backend, &[cx - label_sz, ly + label_sz, cx, ly, cx + label_sz, ly + label_sz, cx, ly,
                                              cx, ly, cx, ly - label_sz * 0.8], Y_AXIS_COLOR);
    }

    fn render_rects(&mut self, backend: &mut impl GraphicsBackend, camera: &Camera2D) {
        let rects: Vec<_> = std::mem::take(&mut self.rects);
        for rect in &rects {
            let verts = Self::calc_rect_vertices(rect.x, rect.y, rect.width, rect.height,
                                                  rect.rotation, rect.origin_x, rect.origin_y);
            self.upload_and_draw_line_loop(backend, &verts, rect.color);

            if rect.show_handles {
                match self.transform_mode {
                    TransformMode::Select => {}
                    TransformMode::Move => self.draw_move_handles(backend, rect.x, rect.y, rect.rotation, camera),
                    TransformMode::Rotate => self.draw_rotate_handles(backend, rect.x, rect.y, rect.width.max(rect.height) * 0.6),
                    TransformMode::Scale => self.draw_scale_handles(backend, &verts, camera),
                }
            }
        }
        self.rects = rects;
    }

    fn render_circles(&mut self, backend: &mut impl GraphicsBackend) {
        let circles: Vec<_> = std::mem::take(&mut self.circles);
        for circle in &circles {
            let verts = Self::build_circle(circle.x, circle.y, circle.radius, circle.segments);
            self.upload_and_draw_line_loop(backend, &verts, circle.color);
        }
        self.circles = circles;
    }

    fn render_lines(&mut self, backend: &mut impl GraphicsBackend) {
        let lines: Vec<_> = std::mem::take(&mut self.lines);
        for line in &lines {
            if line.points.len() < 4 { continue; }
            if line.closed {
                self.upload_and_draw_line_loop(backend, &line.points, line.color);
            } else {
                self.upload_and_draw_line_strip(backend, &line.points, line.color);
            }
        }
        self.lines = lines;
    }

    fn render_capsules(&mut self, backend: &mut impl GraphicsBackend) {
        const SEGMENTS: usize = 16;
        let capsules: Vec<_> = std::mem::take(&mut self.capsules);
        for cap in &capsules {
            let (cos_r, sin_r) = (cap.rotation.cos(), cap.rotation.sin());
            let mut verts = Vec::with_capacity((SEGMENTS * 2 + 2) * 2);

            for j in 0..=SEGMENTS {
                let angle = (j as f32 / SEGMENTS as f32) * PI;
                let (lx, ly) = (cap.radius * angle.cos(), cap.half_height + cap.radius * angle.sin());
                verts.push(cap.x + lx * cos_r - ly * sin_r);
                verts.push(cap.y + lx * sin_r + ly * cos_r);
            }
            for j in 0..=SEGMENTS {
                let angle = (j as f32 / SEGMENTS as f32) * PI;
                let (lx, ly) = (-cap.radius * angle.cos(), -cap.half_height - cap.radius * angle.sin());
                verts.push(cap.x + lx * cos_r - ly * sin_r);
                verts.push(cap.y + lx * sin_r + ly * cos_r);
            }
            self.upload_and_draw_line_loop(backend, &verts, cap.color);
        }
        self.capsules = capsules;
    }

    fn draw_move_handles(&mut self, backend: &mut impl GraphicsBackend, x: f32, y: f32, rotation: f32, camera: &Camera2D) {
        let len = 50.0 / camera.zoom;
        let head = 10.0 / camera.zoom;
        let (cos, sin) = (rotation.cos(), rotation.sin());

        let (xe, ye) = (x + len * cos, y + len * sin);
        let x_arrow = [x, y, xe, ye,
                       xe - head * cos + head * 0.3 * sin, ye - head * sin - head * 0.3 * cos, xe, ye,
                       xe - head * cos - head * 0.3 * sin, ye - head * sin + head * 0.3 * cos];
        self.upload_and_draw_line_strip(backend, &x_arrow, X_AXIS_COLOR);

        let (xe2, ye2) = (x - len * sin, y + len * cos);
        let y_arrow = [x, y, xe2, ye2,
                       xe2 + head * sin + head * 0.3 * cos, ye2 - head * cos + head * 0.3 * sin, xe2, ye2,
                       xe2 + head * sin - head * 0.3 * cos, ye2 - head * cos - head * 0.3 * sin];
        self.upload_and_draw_line_strip(backend, &y_arrow, Y_AXIS_COLOR);
    }

    fn draw_rotate_handles(&mut self, backend: &mut impl GraphicsBackend, x: f32, y: f32, radius: f32) {
        let verts = Self::build_circle(x, y, radius, 32);
        self.upload_and_draw_line_loop(backend, &verts, ROTATE_COLOR);
    }

    fn draw_scale_handles(&mut self, backend: &mut impl GraphicsBackend, corners: &[f32], camera: &Camera2D) {
        let sz = 6.0 / camera.zoom;
        for i in 0..4 {
            let (cx, cy) = (corners[i * 2], corners[i * 2 + 1]);
            let sq = [cx - sz, cy - sz, cx + sz, cy - sz, cx + sz, cy + sz, cx - sz, cy + sz];
            self.upload_and_draw_line_loop(backend, &sq, SCALE_COLOR);
        }
    }

    fn upload_and_draw(&mut self, backend: &mut impl GraphicsBackend, verts: &[f32], color: Vec4) {
        backend.update_buffer(self.vbo, 0, bytemuck::cast_slice(verts)).ok();
        backend.set_uniform_vec4("u_color", color).ok();
        backend.draw(self.vao, (verts.len() / 2) as u32, 0).ok();
    }

    fn upload_and_draw_lines(&mut self, backend: &mut impl GraphicsBackend, verts: &[f32], color: Vec4) {
        backend.update_buffer(self.vbo, 0, bytemuck::cast_slice(verts)).ok();
        backend.set_uniform_vec4("u_color", color).ok();
        backend.draw_lines(self.vao, (verts.len() / 2) as u32, 0).ok();
    }

    fn upload_and_draw_line_loop(&mut self, backend: &mut impl GraphicsBackend, verts: &[f32], color: Vec4) {
        backend.update_buffer(self.vbo, 0, bytemuck::cast_slice(verts)).ok();
        backend.set_uniform_vec4("u_color", color).ok();
        backend.draw_line_loop(self.vao, (verts.len() / 2) as u32, 0).ok();
    }

    fn upload_and_draw_line_strip(&mut self, backend: &mut impl GraphicsBackend, verts: &[f32], color: Vec4) {
        backend.update_buffer(self.vbo, 0, bytemuck::cast_slice(verts)).ok();
        backend.set_uniform_vec4("u_color", color).ok();
        backend.draw_line_strip(self.vao, (verts.len() / 2) as u32, 0).ok();
    }

    fn calc_rect_vertices(x: f32, y: f32, w: f32, h: f32, rot: f32, ox: f32, oy: f32) -> [f32; 8] {
        let (cos, sin) = (rot.cos(), rot.sin());
        let (oxx, oyy) = (ox * w, oy * h);
        let corners = [(-oxx, h - oyy), (w - oxx, h - oyy), (w - oxx, -oyy), (-oxx, -oyy)];
        let mut out = [0.0f32; 8];
        for (i, (lx, ly)) in corners.iter().enumerate() {
            out[i * 2] = lx * cos - ly * sin + x;
            out[i * 2 + 1] = lx * sin + ly * cos + y;
        }
        out
    }

    fn build_circle(x: f32, y: f32, r: f32, segments: u32) -> Vec<f32> {
        (0..segments).flat_map(|i| {
            let angle = (i as f32 / segments as f32) * PI * 2.0;
            [x + r * angle.cos(), y + r * angle.sin()]
        }).collect()
    }

    pub fn destroy(self, backend: &mut impl GraphicsBackend) {
        backend.destroy_vertex_array(self.vao);
        backend.destroy_buffer(self.vbo);
        backend.destroy_shader(self.shader);
    }
}
