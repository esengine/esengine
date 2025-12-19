//! Sprite batch renderer for efficient 2D rendering.

use es_engine_shared::{
    traits::backend::{GraphicsBackend, BufferUsage},
    types::{
        handle::{BufferHandle, VertexArrayHandle},
        vertex::{VertexLayout, VertexAttribute, VertexAttributeType},
    },
};
use crate::math::Color;

const VERTICES_PER_SPRITE: usize = 4;
const INDICES_PER_SPRITE: usize = 6;
const FLOATS_PER_VERTEX: usize = 9;
const TRANSFORM_STRIDE: usize = 7;
const UV_STRIDE: usize = 4;

#[derive(Hash, Eq, PartialEq, Clone, Copy, Debug)]
pub struct BatchKey {
    pub material_id: u32,
    pub texture_id: u32,
}

pub struct SpriteBatch {
    vbo: BufferHandle,
    ibo: BufferHandle,
    vao: VertexArrayHandle,
    max_sprites: usize,
    batches: Vec<(BatchKey, Vec<f32>)>,
    sprite_count: usize,
    last_batch_key: Option<BatchKey>,
}

impl SpriteBatch {
    pub fn new(backend: &mut impl GraphicsBackend, max_sprites: usize) -> Result<Self, String> {
        let vertex_buffer_size = max_sprites * VERTICES_PER_SPRITE * FLOATS_PER_VERTEX * 4;
        let vbo = backend.create_vertex_buffer(
            &vec![0u8; vertex_buffer_size],
            BufferUsage::Dynamic,
        ).map_err(|e| format!("VBO: {:?}", e))?;

        let indices = Self::generate_indices(max_sprites);
        let ibo = backend.create_index_buffer(
            bytemuck::cast_slice(&indices),
            BufferUsage::Static,
        ).map_err(|e| format!("IBO: {:?}", e))?;

        let layout = VertexLayout {
            attributes: vec![
                VertexAttribute { name: "a_position".into(), attr_type: VertexAttributeType::Float2, offset: 0, normalized: false },
                VertexAttribute { name: "a_texcoord".into(), attr_type: VertexAttributeType::Float2, offset: 8, normalized: false },
                VertexAttribute { name: "a_color".into(), attr_type: VertexAttributeType::Float4, offset: 16, normalized: false },
                VertexAttribute { name: "a_aspect".into(), attr_type: VertexAttributeType::Float, offset: 32, normalized: false },
            ],
            stride: FLOATS_PER_VERTEX * 4,
        };

        let vao = backend.create_vertex_array(vbo, Some(ibo), &layout)
            .map_err(|e| format!("VAO: {:?}", e))?;

        Ok(Self {
            vbo, ibo, vao,
            max_sprites,
            batches: Vec::new(),
            sprite_count: 0,
            last_batch_key: None,
        })
    }

    fn generate_indices(max_sprites: usize) -> Vec<u16> {
        (0..max_sprites).flat_map(|i| {
            let base = (i * VERTICES_PER_SPRITE) as u16;
            [base, base + 1, base + 2, base + 2, base + 3, base]
        }).collect()
    }

    pub fn clear(&mut self) {
        self.batches.clear();
        self.sprite_count = 0;
        self.last_batch_key = None;
    }

    pub fn add_sprites(
        &mut self,
        transforms: &[f32],
        texture_ids: &[u32],
        uvs: &[f32],
        colors: &[u32],
        material_ids: &[u32],
    ) -> Result<(), String> {
        let count = texture_ids.len();

        if transforms.len() != count * TRANSFORM_STRIDE {
            return Err(format!("Transform mismatch: {} vs {}", transforms.len(), count * TRANSFORM_STRIDE));
        }
        if uvs.len() != count * UV_STRIDE {
            return Err(format!("UV mismatch: {} vs {}", uvs.len(), count * UV_STRIDE));
        }
        if colors.len() != count || material_ids.len() != count {
            return Err("Color/material count mismatch".into());
        }
        if self.sprite_count + count > self.max_sprites {
            return Err(format!("Batch overflow: {} + {} > {}", self.sprite_count, count, self.max_sprites));
        }

        for i in 0..count {
            let t = i * TRANSFORM_STRIDE;
            let uv = i * UV_STRIDE;

            let (x, y) = (transforms[t], transforms[t + 1]);
            let rotation = transforms[t + 2];
            let (width, height) = (transforms[t + 3], transforms[t + 4]);
            let (origin_x, origin_y) = (transforms[t + 5], transforms[t + 6]);

            let (u0, v0, u1, v1) = (uvs[uv], uvs[uv + 1], uvs[uv + 2], uvs[uv + 3]);
            let color = Color::from_packed(colors[i]);
            let color_arr = [color.r, color.g, color.b, color.a];
            let aspect = if height.abs() > 0.001 { width / height } else { 1.0 };

            let key = BatchKey { material_id: material_ids[i], texture_id: texture_ids[i] };

            if self.last_batch_key != Some(key) {
                self.batches.push((key, Vec::new()));
                self.last_batch_key = Some(key);
            }

            let batch = &mut self.batches.last_mut().unwrap().1;
            Self::add_sprite_vertices(batch, x, y, width, height, rotation, origin_x, origin_y,
                                      u0, v0, u1, v1, color_arr, aspect);
        }

        self.sprite_count += count;
        Ok(())
    }

    #[inline]
    fn add_sprite_vertices(
        batch: &mut Vec<f32>,
        x: f32, y: f32, width: f32, height: f32, rotation: f32,
        origin_x: f32, origin_y: f32,
        u0: f32, v0: f32, u1: f32, v1: f32,
        color: [f32; 4], aspect: f32,
    ) {
        let (cos, sin) = (rotation.cos(), rotation.sin());
        let (ox, oy) = (origin_x * width, origin_y * height);

        let corners = [(-ox, height - oy), (width - ox, height - oy), (width - ox, -oy), (-ox, -oy)];
        let tex_coords = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];

        for i in 0..4 {
            let (lx, ly) = corners[i];
            let (rx, ry) = (lx * cos - ly * sin, lx * sin + ly * cos);
            batch.extend_from_slice(&[rx + x, ry + y]);
            batch.extend_from_slice(&tex_coords[i]);
            batch.extend_from_slice(&color);
            batch.push(aspect);
        }
    }

    pub fn batches(&self) -> &[(BatchKey, Vec<f32>)] {
        &self.batches
    }

    pub fn flush_batch(&self, backend: &mut impl GraphicsBackend, vertices: &[f32]) {
        if vertices.is_empty() { return; }

        let sprite_count = vertices.len() / (VERTICES_PER_SPRITE * FLOATS_PER_VERTEX);
        backend.update_buffer(self.vbo, 0, bytemuck::cast_slice(vertices)).ok();
        backend.draw_indexed(self.vao, (sprite_count * INDICES_PER_SPRITE) as u32, 0).ok();
    }

    pub fn flush_batch_at(&self, backend: &mut impl GraphicsBackend, index: usize) {
        if let Some((_, vertices)) = self.batches.get(index) {
            self.flush_batch(backend, vertices);
        }
    }

    #[inline]
    pub fn sprite_count(&self) -> usize {
        self.sprite_count
    }

    pub fn vao(&self) -> VertexArrayHandle {
        self.vao
    }

    pub fn destroy(self, backend: &mut impl GraphicsBackend) {
        backend.destroy_vertex_array(self.vao);
        backend.destroy_buffer(self.vbo);
        backend.destroy_buffer(self.ibo);
    }
}
