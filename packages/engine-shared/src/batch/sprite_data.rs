//! 精灵批处理数据结构
//!
//! Sprite batch data structures.
//!
//! 本模块提供纯数据结构，不包含任何渲染调用。
//! This module provides pure data structures without any rendering calls.

use crate::types::vertex::SpriteVertex;

/// 批处理键
///
/// 用于区分不同批次（按材质和纹理分组）。
///
/// Batch key.
/// Used to distinguish different batches (grouped by material and texture).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct BatchKey {
    /// 材质 ID | Material ID
    pub material_id: u32,
    /// 纹理 ID | Texture ID
    pub texture_id: u32,
}

impl BatchKey {
    /// 创建新的批处理键
    ///
    /// Create new batch key.
    pub const fn new(material_id: u32, texture_id: u32) -> Self {
        Self { material_id, texture_id }
    }

    /// 默认批处理键（默认材质和纹理）
    ///
    /// Default batch key (default material and texture).
    pub const fn default_key() -> Self {
        Self::new(0, 0)
    }
}

impl Default for BatchKey {
    fn default() -> Self {
        Self::default_key()
    }
}

/// 精灵批处理数据（纯数据，无渲染调用）
///
/// 预分配的数组用于存储精灵顶点数据，避免每帧分配。
///
/// Sprite batch data (pure data, no rendering calls).
/// Pre-allocated arrays for storing sprite vertex data, avoiding per-frame allocation.
#[derive(Debug)]
pub struct SpriteBatchBuffer {
    /// 顶点数据 | Vertex data
    vertices: Vec<SpriteVertex>,

    /// 索引数据 | Index data
    indices: Vec<u16>,

    /// 批次列表：(BatchKey, 起始索引, 索引数量) | Batch list: (BatchKey, start index, index count)
    batches: Vec<(BatchKey, u32, u32)>,

    /// 最大精灵数 | Max sprite count
    max_sprites: usize,

    /// 当前精灵数 | Current sprite count
    sprite_count: usize,

    /// 上一个批处理键 | Last batch key
    last_batch_key: Option<BatchKey>,
}

impl SpriteBatchBuffer {
    /// 每个精灵的顶点数 | Vertices per sprite
    pub const VERTICES_PER_SPRITE: usize = 4;

    /// 每个精灵的索引数 | Indices per sprite
    pub const INDICES_PER_SPRITE: usize = 6;

    /// 创建新的批处理缓冲区
    ///
    /// Create new batch buffer.
    pub fn new(max_sprites: usize) -> Self {
        let max_vertices = max_sprites * Self::VERTICES_PER_SPRITE;
        let max_indices = max_sprites * Self::INDICES_PER_SPRITE;

        // 预生成索引
        let mut indices = Vec::with_capacity(max_indices);
        for i in 0..max_sprites {
            let base = (i * Self::VERTICES_PER_SPRITE) as u16;
            indices.extend_from_slice(&[
                base,
                base + 1,
                base + 2,
                base + 2,
                base + 3,
                base,
            ]);
        }

        Self {
            vertices: Vec::with_capacity(max_vertices),
            indices,
            batches: Vec::with_capacity(64),
            max_sprites,
            sprite_count: 0,
            last_batch_key: None,
        }
    }

    /// 清空缓冲区（为下一帧准备）
    ///
    /// Clear buffer (prepare for next frame).
    pub fn clear(&mut self) {
        self.vertices.clear();
        self.batches.clear();
        self.sprite_count = 0;
        self.last_batch_key = None;
    }

    /// 添加精灵
    ///
    /// Add sprite.
    ///
    /// # Parameters
    ///
    /// - `x`, `y`: 位置 | Position
    /// - `width`, `height`: 尺寸 | Size
    /// - `rotation`: 旋转（弧度）| Rotation (radians)
    /// - `origin_x`, `origin_y`: 原点（0-1）| Origin (0-1)
    /// - `u0`, `v0`, `u1`, `v1`: UV 坐标 | UV coordinates
    /// - `color`: 打包的 RGBA 颜色 | Packed RGBA color
    /// - `texture_id`: 纹理 ID | Texture ID
    /// - `material_id`: 材质 ID | Material ID
    #[allow(clippy::too_many_arguments)]
    pub fn add_sprite(
        &mut self,
        x: f32,
        y: f32,
        width: f32,
        height: f32,
        rotation: f32,
        origin_x: f32,
        origin_y: f32,
        u0: f32,
        v0: f32,
        u1: f32,
        v1: f32,
        color: u32,
        texture_id: u32,
        material_id: u32,
    ) -> bool {
        if self.sprite_count >= self.max_sprites {
            return false;
        }

        // 解包颜色
        let r = ((color >> 24) & 0xFF) as f32 / 255.0;
        let g = ((color >> 16) & 0xFF) as f32 / 255.0;
        let b = ((color >> 8) & 0xFF) as f32 / 255.0;
        let a = (color & 0xFF) as f32 / 255.0;
        let color_arr = [r, g, b, a];

        // 计算宽高比
        let aspect = if height != 0.0 { width / height } else { 1.0 };

        // 计算顶点位置（考虑原点和旋转）
        let ox = origin_x * width;
        let oy = origin_y * height;

        let cos_r = rotation.cos();
        let sin_r = rotation.sin();

        // 四个角的局部坐标
        let corners = [
            (-ox, -oy),           // 左上
            (width - ox, -oy),    // 右上
            (width - ox, height - oy), // 右下
            (-ox, height - oy),   // 左下
        ];

        // UV 坐标
        let uvs = [
            [u0, v0], // 左上
            [u1, v0], // 右上
            [u1, v1], // 右下
            [u0, v1], // 左下
        ];

        // 添加四个顶点
        for i in 0..4 {
            let (lx, ly) = corners[i];
            let rx = lx * cos_r - ly * sin_r + x;
            let ry = lx * sin_r + ly * cos_r + y;

            self.vertices.push(SpriteVertex {
                position: [rx, ry],
                texcoord: uvs[i],
                color: color_arr,
                aspect,
            });
        }

        // 更新批次
        let key = BatchKey::new(material_id, texture_id);
        if self.last_batch_key != Some(key) {
            // 开始新批次
            let start_index = (self.sprite_count * Self::INDICES_PER_SPRITE) as u32;
            self.batches.push((key, start_index, Self::INDICES_PER_SPRITE as u32));
            self.last_batch_key = Some(key);
        } else {
            // 扩展当前批次
            if let Some((_, _, count)) = self.batches.last_mut() {
                *count += Self::INDICES_PER_SPRITE as u32;
            }
        }

        self.sprite_count += 1;
        true
    }

    /// 从 SoA 数据添加精灵（与现有 API 兼容）
    ///
    /// Add sprites from SoA data (compatible with existing API).
    ///
    /// # Parameters
    ///
    /// - `transforms`: [x, y, rotation, scaleX, scaleY, originX, originY] per sprite
    /// - `texture_ids`: 纹理 ID | Texture IDs
    /// - `uvs`: [u0, v0, u1, v1] per sprite
    /// - `colors`: 打包的 RGBA 颜色 | Packed RGBA colors
    /// - `material_ids`: 材质 ID | Material IDs
    /// - `texture_sizes`: 纹理尺寸映射函数 | Texture size lookup function
    pub fn add_sprites_soa<F>(
        &mut self,
        transforms: &[f32],
        texture_ids: &[u32],
        uvs: &[f32],
        colors: &[u32],
        material_ids: &[u32],
        texture_sizes: F,
    ) -> usize
    where
        F: Fn(u32) -> (f32, f32),
    {
        let count = texture_ids.len();
        let mut added = 0;

        for i in 0..count {
            let t_offset = i * 7;
            let uv_offset = i * 4;

            if t_offset + 6 >= transforms.len() || uv_offset + 3 >= uvs.len() {
                break;
            }

            let x = transforms[t_offset];
            let y = transforms[t_offset + 1];
            let rotation = transforms[t_offset + 2];
            let scale_x = transforms[t_offset + 3];
            let scale_y = transforms[t_offset + 4];
            let origin_x = transforms[t_offset + 5];
            let origin_y = transforms[t_offset + 6];

            let texture_id = texture_ids[i];
            let (tex_width, tex_height) = texture_sizes(texture_id);

            let width = tex_width * scale_x;
            let height = tex_height * scale_y;

            let u0 = uvs[uv_offset];
            let v0 = uvs[uv_offset + 1];
            let u1 = uvs[uv_offset + 2];
            let v1 = uvs[uv_offset + 3];

            let color = colors[i];
            let material_id = material_ids[i];

            if self.add_sprite(
                x, y, width, height, rotation, origin_x, origin_y,
                u0, v0, u1, v1, color, texture_id, material_id,
            ) {
                added += 1;
            } else {
                break;
            }
        }

        added
    }

    /// 获取顶点数据
    ///
    /// Get vertex data.
    pub fn vertices(&self) -> &[SpriteVertex] {
        &self.vertices
    }

    /// 获取顶点数据（字节）
    ///
    /// Get vertex data as bytes.
    pub fn vertices_as_bytes(&self) -> &[u8] {
        bytemuck::cast_slice(&self.vertices)
    }

    /// 获取索引数据
    ///
    /// Get index data.
    pub fn indices(&self) -> &[u16] {
        &self.indices[..self.sprite_count * Self::INDICES_PER_SPRITE]
    }

    /// 获取批次列表
    ///
    /// Get batch list.
    pub fn batches(&self) -> &[(BatchKey, u32, u32)] {
        &self.batches
    }

    /// 获取精灵数量
    ///
    /// Get sprite count.
    pub fn sprite_count(&self) -> usize {
        self.sprite_count
    }

    /// 获取最大精灵数
    ///
    /// Get max sprite count.
    pub fn max_sprites(&self) -> usize {
        self.max_sprites
    }

    /// 是否为空
    ///
    /// Check if empty.
    pub fn is_empty(&self) -> bool {
        self.sprite_count == 0
    }

    /// 是否已满
    ///
    /// Check if full.
    pub fn is_full(&self) -> bool {
        self.sprite_count >= self.max_sprites
    }
}

impl Default for SpriteBatchBuffer {
    fn default() -> Self {
        Self::new(10000)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_batch_buffer_creation() {
        let buffer = SpriteBatchBuffer::new(100);
        assert_eq!(buffer.max_sprites(), 100);
        assert_eq!(buffer.sprite_count(), 0);
        assert!(buffer.is_empty());
    }

    #[test]
    fn test_add_sprite() {
        let mut buffer = SpriteBatchBuffer::new(100);

        let result = buffer.add_sprite(
            100.0, 100.0,   // position
            64.0, 64.0,     // size
            0.0,            // rotation
            0.5, 0.5,       // origin
            0.0, 0.0, 1.0, 1.0, // uvs
            0xFFFFFFFF,     // color (white)
            1,              // texture_id
            0,              // material_id
        );

        assert!(result);
        assert_eq!(buffer.sprite_count(), 1);
        assert_eq!(buffer.vertices().len(), 4);
        assert_eq!(buffer.batches().len(), 1);
    }

    #[test]
    fn test_batch_grouping() {
        let mut buffer = SpriteBatchBuffer::new(100);

        // 添加两个相同纹理/材质的精灵（应该合并到一个批次）
        buffer.add_sprite(0.0, 0.0, 32.0, 32.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0xFFFFFFFF, 1, 0);
        buffer.add_sprite(50.0, 0.0, 32.0, 32.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0xFFFFFFFF, 1, 0);

        assert_eq!(buffer.batches().len(), 1);
        assert_eq!(buffer.batches()[0].2, 12); // 2 sprites * 6 indices

        // 添加不同纹理的精灵（应该创建新批次）
        buffer.add_sprite(100.0, 0.0, 32.0, 32.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0xFFFFFFFF, 2, 0);

        assert_eq!(buffer.batches().len(), 2);
    }

    #[test]
    fn test_clear() {
        let mut buffer = SpriteBatchBuffer::new(100);

        buffer.add_sprite(0.0, 0.0, 32.0, 32.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0xFFFFFFFF, 1, 0);
        assert_eq!(buffer.sprite_count(), 1);

        buffer.clear();
        assert_eq!(buffer.sprite_count(), 0);
        assert!(buffer.is_empty());
        assert!(buffer.batches().is_empty());
    }
}
