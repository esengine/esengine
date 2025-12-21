//! Mesh batch renderer for arbitrary 2D geometry.
//! 用于任意 2D 几何体的网格批处理渲染器。
//!
//! Unlike SpriteBatch which only supports quads, MeshBatch can render
//! arbitrary triangulated meshes (ellipses, polygons, rounded rectangles, etc.).
//!
//! 与仅支持四边形的 SpriteBatch 不同，MeshBatch 可以渲染
//! 任意三角化的网格（椭圆、多边形、圆角矩形等）。

use es_engine_shared::{
    traits::backend::{GraphicsBackend, BufferUsage},
    types::{
        handle::{BufferHandle, VertexArrayHandle},
        vertex::{VertexLayout, VertexAttribute, VertexAttributeType},
    },
};

/// Floats per mesh vertex: position(2) + texCoord(2) + color(4) = 8
/// 每个网格顶点的浮点数：位置(2) + 纹理坐标(2) + 颜色(4) = 8
const FLOATS_PER_VERTEX: usize = 8;

/// Mesh batch for rendering arbitrary 2D geometry.
/// 用于渲染任意 2D 几何体的网格批处理。
pub struct MeshBatch {
    vbo: BufferHandle,
    ibo: BufferHandle,
    vao: VertexArrayHandle,
    max_vertices: usize,
    max_indices: usize,
    vertex_data: Vec<f32>,
    index_data: Vec<u16>,
    vertex_count: usize,
    index_count: usize,
}

impl MeshBatch {
    /// Create a new mesh batch.
    /// 创建新的网格批处理。
    ///
    /// # Arguments | 参数
    /// * `backend` - Graphics backend
    /// * `max_vertices` - Maximum number of vertices
    /// * `max_indices` - Maximum number of indices
    pub fn new(
        backend: &mut impl GraphicsBackend,
        max_vertices: usize,
        max_indices: usize,
    ) -> Result<Self, String> {
        let vertex_buffer_size = max_vertices * FLOATS_PER_VERTEX * 4;
        let vbo = backend.create_vertex_buffer(
            &vec![0u8; vertex_buffer_size],
            BufferUsage::Dynamic,
        ).map_err(|e| format!("Mesh VBO: {:?}", e))?;

        let ibo = backend.create_index_buffer(
            bytemuck::cast_slice(&vec![0u16; max_indices]),
            BufferUsage::Dynamic,
        ).map_err(|e| format!("Mesh IBO: {:?}", e))?;

        // Mesh vertex layout:
        // a_position: vec2 (location 0)
        // a_texCoord: vec2 (location 1)
        // a_color: vec4 (location 2)
        let layout = VertexLayout {
            attributes: vec![
                VertexAttribute {
                    name: "a_position".into(),
                    attr_type: VertexAttributeType::Float2,
                    offset: 0,
                    normalized: false,
                },
                VertexAttribute {
                    name: "a_texcoord".into(),
                    attr_type: VertexAttributeType::Float2,
                    offset: 8,
                    normalized: false,
                },
                VertexAttribute {
                    name: "a_color".into(),
                    attr_type: VertexAttributeType::Float4,
                    offset: 16,
                    normalized: false,
                },
            ],
            stride: FLOATS_PER_VERTEX * 4,
        };

        let vao = backend.create_vertex_array(vbo, Some(ibo), &layout)
            .map_err(|e| format!("Mesh VAO: {:?}", e))?;

        Ok(Self {
            vbo,
            ibo,
            vao,
            max_vertices,
            max_indices,
            vertex_data: Vec::with_capacity(max_vertices * FLOATS_PER_VERTEX),
            index_data: Vec::with_capacity(max_indices),
            vertex_count: 0,
            index_count: 0,
        })
    }

    /// Clear the batch.
    /// 清除批处理。
    pub fn clear(&mut self) {
        self.vertex_data.clear();
        self.index_data.clear();
        self.vertex_count = 0;
        self.index_count = 0;
    }

    /// Add a mesh to the batch.
    /// 将网格添加到批处理。
    ///
    /// # Arguments | 参数
    /// * `positions` - Float array [x, y, ...] for each vertex
    /// * `uvs` - Float array [u, v, ...] for each vertex
    /// * `colors` - Packed RGBA colors (one per vertex)
    /// * `indices` - Triangle indices
    /// * `offset_x` - X offset to apply to all positions
    /// * `offset_y` - Y offset to apply to all positions
    pub fn add_mesh(
        &mut self,
        positions: &[f32],
        uvs: &[f32],
        colors: &[u32],
        indices: &[u16],
        offset_x: f32,
        offset_y: f32,
    ) -> Result<(), String> {
        let vertex_count = positions.len() / 2;

        if self.vertex_count + vertex_count > self.max_vertices {
            return Err(format!(
                "Mesh batch vertex overflow: {} + {} > {}",
                self.vertex_count, vertex_count, self.max_vertices
            ));
        }

        if self.index_count + indices.len() > self.max_indices {
            return Err(format!(
                "Mesh batch index overflow: {} + {} > {}",
                self.index_count, indices.len(), self.max_indices
            ));
        }

        // Validate input sizes
        if uvs.len() != positions.len() {
            return Err(format!(
                "UV size mismatch: {} vs {}",
                uvs.len(), positions.len()
            ));
        }
        if colors.len() != vertex_count {
            return Err(format!(
                "Color count mismatch: {} vs {}",
                colors.len(), vertex_count
            ));
        }

        // Build vertex data
        let base_index = self.vertex_count as u16;
        for v in 0..vertex_count {
            let pos_idx = v * 2;

            // Position with offset (2 floats)
            self.vertex_data.push(positions[pos_idx] + offset_x);
            self.vertex_data.push(positions[pos_idx + 1] + offset_y);

            // TexCoord (2 floats)
            self.vertex_data.push(uvs[pos_idx]);
            self.vertex_data.push(uvs[pos_idx + 1]);

            // Color (4 floats from packed RGBA)
            let color = colors[v];
            let r = ((color >> 24) & 0xFF) as f32 / 255.0;
            let g = ((color >> 16) & 0xFF) as f32 / 255.0;
            let b = ((color >> 8) & 0xFF) as f32 / 255.0;
            let a = (color & 0xFF) as f32 / 255.0;
            self.vertex_data.push(r);
            self.vertex_data.push(g);
            self.vertex_data.push(b);
            self.vertex_data.push(a);
        }

        // Add indices with base offset
        for &idx in indices {
            self.index_data.push(base_index + idx);
        }

        self.vertex_count += vertex_count;
        self.index_count += indices.len();

        Ok(())
    }

    /// Get the vertex count.
    /// 获取顶点数量。
    #[inline]
    pub fn vertex_count(&self) -> usize {
        self.vertex_count
    }

    /// Get the index count.
    /// 获取索引数量。
    #[inline]
    pub fn index_count(&self) -> usize {
        self.index_count
    }

    /// Get the VAO handle.
    /// 获取 VAO 句柄。
    #[inline]
    pub fn vao(&self) -> VertexArrayHandle {
        self.vao
    }

    /// Flush and render the batch.
    /// 刷新并渲染批处理。
    pub fn flush(&self, backend: &mut impl GraphicsBackend) {
        if self.vertex_data.is_empty() || self.index_data.is_empty() {
            return;
        }

        // Upload vertex data
        backend.update_buffer(self.vbo, 0, bytemuck::cast_slice(&self.vertex_data)).ok();

        // Upload index data
        backend.update_buffer(self.ibo, 0, bytemuck::cast_slice(&self.index_data)).ok();

        // Draw indexed
        backend.draw_indexed(self.vao, self.index_count as u32, 0).ok();
    }

    /// Destroy the batch resources.
    /// 销毁批处理资源。
    pub fn destroy(self, backend: &mut impl GraphicsBackend) {
        backend.destroy_vertex_array(self.vao);
        backend.destroy_buffer(self.vbo);
        backend.destroy_buffer(self.ibo);
    }
}
