//! Text batch renderer for MSDF text rendering.
//! MSDF 文本批处理渲染器。

use es_engine_shared::{
    traits::backend::{GraphicsBackend, BufferUsage},
    types::{
        handle::{BufferHandle, VertexArrayHandle, ShaderHandle},
        vertex::{VertexLayout, VertexAttribute, VertexAttributeType},
    },
};

/// Number of vertices per glyph (quad).
/// 每个字形的顶点数（四边形）。
const VERTICES_PER_GLYPH: usize = 4;

/// Number of indices per glyph (2 triangles).
/// 每个字形的索引数（2 个三角形）。
const INDICES_PER_GLYPH: usize = 6;

/// Floats per text vertex: position(2) + texCoord(2) + color(4) + outlineColor(4) + outlineWidth(1) = 13
/// 每个文本顶点的浮点数：位置(2) + 纹理坐标(2) + 颜色(4) + 描边颜色(4) + 描边宽度(1) = 13
const FLOATS_PER_VERTEX: usize = 13;

/// Text batch for MSDF text rendering.
/// MSDF 文本批处理。
pub struct TextBatch {
    vbo: BufferHandle,
    ibo: BufferHandle,
    vao: VertexArrayHandle,
    shader: ShaderHandle,
    max_glyphs: usize,
    vertex_data: Vec<f32>,
    glyph_count: usize,
}

impl TextBatch {
    /// Create a new text batch.
    /// 创建新的文本批处理。
    pub fn new(backend: &mut impl GraphicsBackend, max_glyphs: usize) -> Result<Self, String> {
        let vertex_buffer_size = max_glyphs * VERTICES_PER_GLYPH * FLOATS_PER_VERTEX * 4;
        let vbo = backend.create_vertex_buffer(
            &vec![0u8; vertex_buffer_size],
            BufferUsage::Dynamic,
        ).map_err(|e| format!("Text VBO: {:?}", e))?;

        let indices = Self::generate_indices(max_glyphs);
        let ibo = backend.create_index_buffer(
            bytemuck::cast_slice(&indices),
            BufferUsage::Static,
        ).map_err(|e| format!("Text IBO: {:?}", e))?;

        // MSDF text vertex layout:
        // a_position: vec2 (location 0)
        // a_texCoord: vec2 (location 1)
        // a_color: vec4 (location 2)
        // a_outlineColor: vec4 (location 3)
        // a_outlineWidth: float (location 4)
        let layout = VertexLayout {
            attributes: vec![
                VertexAttribute {
                    name: "a_position".into(),
                    attr_type: VertexAttributeType::Float2,
                    offset: 0,
                    normalized: false
                },
                VertexAttribute {
                    name: "a_texCoord".into(),
                    attr_type: VertexAttributeType::Float2,
                    offset: 8,
                    normalized: false
                },
                VertexAttribute {
                    name: "a_color".into(),
                    attr_type: VertexAttributeType::Float4,
                    offset: 16,
                    normalized: false
                },
                VertexAttribute {
                    name: "a_outlineColor".into(),
                    attr_type: VertexAttributeType::Float4,
                    offset: 32,
                    normalized: false
                },
                VertexAttribute {
                    name: "a_outlineWidth".into(),
                    attr_type: VertexAttributeType::Float,
                    offset: 48,
                    normalized: false
                },
            ],
            stride: FLOATS_PER_VERTEX * 4,
        };

        let vao = backend.create_vertex_array(vbo, Some(ibo), &layout)
            .map_err(|e| format!("Text VAO: {:?}", e))?;

        // Compile MSDF text shader
        let shader = backend.compile_shader(
            crate::renderer::shader::MSDF_TEXT_VERTEX_SHADER,
            crate::renderer::shader::MSDF_TEXT_FRAGMENT_SHADER,
        ).map_err(|e| format!("MSDF shader: {:?}", e))?;

        Ok(Self {
            vbo,
            ibo,
            vao,
            shader,
            max_glyphs,
            vertex_data: Vec::with_capacity(max_glyphs * VERTICES_PER_GLYPH * FLOATS_PER_VERTEX),
            glyph_count: 0,
        })
    }

    /// Generate indices for all glyphs.
    /// 为所有字形生成索引。
    fn generate_indices(max_glyphs: usize) -> Vec<u16> {
        (0..max_glyphs).flat_map(|i| {
            let base = (i * VERTICES_PER_GLYPH) as u16;
            // Two triangles: 0-1-2, 2-3-0
            [base, base + 1, base + 2, base + 2, base + 3, base]
        }).collect()
    }

    /// Clear the batch.
    /// 清除批处理。
    pub fn clear(&mut self) {
        self.vertex_data.clear();
        self.glyph_count = 0;
    }

    /// Add text glyphs to the batch.
    /// 将文本字形添加到批处理。
    ///
    /// # Arguments | 参数
    /// * `positions` - Float32Array [x, y, ...] for each vertex (4 per glyph)
    /// * `tex_coords` - Float32Array [u, v, ...] for each vertex (4 per glyph)
    /// * `colors` - Float32Array [r, g, b, a, ...] for each vertex (4 per glyph)
    /// * `outline_colors` - Float32Array [r, g, b, a, ...] for each vertex
    /// * `outline_widths` - Float32Array [width, ...] for each vertex
    pub fn add_glyphs(
        &mut self,
        positions: &[f32],
        tex_coords: &[f32],
        colors: &[f32],
        outline_colors: &[f32],
        outline_widths: &[f32],
    ) -> Result<(), String> {
        // Calculate glyph count from positions (2 floats per vertex, 4 vertices per glyph)
        let vertex_count = positions.len() / 2;
        let glyph_count = vertex_count / VERTICES_PER_GLYPH;

        if self.glyph_count + glyph_count > self.max_glyphs {
            return Err(format!(
                "Text batch overflow: {} + {} > {}",
                self.glyph_count, glyph_count, self.max_glyphs
            ));
        }

        // Validate input sizes
        if tex_coords.len() != positions.len() {
            return Err(format!(
                "TexCoord size mismatch: {} vs {}",
                tex_coords.len(), positions.len()
            ));
        }
        if colors.len() != vertex_count * 4 {
            return Err(format!(
                "Colors size mismatch: {} vs {}",
                colors.len(), vertex_count * 4
            ));
        }
        if outline_colors.len() != vertex_count * 4 {
            return Err(format!(
                "OutlineColors size mismatch: {} vs {}",
                outline_colors.len(), vertex_count * 4
            ));
        }
        if outline_widths.len() != vertex_count {
            return Err(format!(
                "OutlineWidths size mismatch: {} vs {}",
                outline_widths.len(), vertex_count
            ));
        }

        // Build vertex data
        for v in 0..vertex_count {
            let pos_idx = v * 2;
            let col_idx = v * 4;

            // Position (2 floats)
            self.vertex_data.push(positions[pos_idx]);
            self.vertex_data.push(positions[pos_idx + 1]);

            // TexCoord (2 floats)
            self.vertex_data.push(tex_coords[pos_idx]);
            self.vertex_data.push(tex_coords[pos_idx + 1]);

            // Color (4 floats)
            self.vertex_data.push(colors[col_idx]);
            self.vertex_data.push(colors[col_idx + 1]);
            self.vertex_data.push(colors[col_idx + 2]);
            self.vertex_data.push(colors[col_idx + 3]);

            // Outline color (4 floats)
            self.vertex_data.push(outline_colors[col_idx]);
            self.vertex_data.push(outline_colors[col_idx + 1]);
            self.vertex_data.push(outline_colors[col_idx + 2]);
            self.vertex_data.push(outline_colors[col_idx + 3]);

            // Outline width (1 float)
            self.vertex_data.push(outline_widths[v]);
        }

        self.glyph_count += glyph_count;
        Ok(())
    }

    /// Get the glyph count.
    /// 获取字形数量。
    #[inline]
    pub fn glyph_count(&self) -> usize {
        self.glyph_count
    }

    /// Get the shader handle.
    /// 获取着色器句柄。
    #[inline]
    pub fn shader(&self) -> ShaderHandle {
        self.shader
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
        if self.vertex_data.is_empty() {
            return;
        }

        // Upload vertex data
        backend.update_buffer(self.vbo, 0, bytemuck::cast_slice(&self.vertex_data)).ok();

        // Draw indexed
        let index_count = (self.glyph_count * INDICES_PER_GLYPH) as u32;
        backend.draw_indexed(self.vao, index_count, 0).ok();
    }

    /// Destroy the batch resources.
    /// 销毁批处理资源。
    pub fn destroy(self, backend: &mut impl GraphicsBackend) {
        backend.destroy_vertex_array(self.vao);
        backend.destroy_buffer(self.vbo);
        backend.destroy_buffer(self.ibo);
        backend.destroy_shader(self.shader);
    }
}
