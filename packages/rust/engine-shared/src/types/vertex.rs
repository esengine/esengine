//! 顶点格式定义
//!
//! Vertex format definitions.

use bytemuck::{Pod, Zeroable};

/// 顶点属性类型
///
/// Vertex attribute type.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum VertexAttributeType {
    /// 单精度浮点 | Single float
    Float,
    /// 二维向量 | 2D vector
    Float2,
    /// 三维向量 | 3D vector
    Float3,
    /// 四维向量 | 4D vector
    Float4,
    /// 有符号整数 | Signed integer
    Int,
    /// 二维整数向量 | 2D integer vector
    Int2,
    /// 三维整数向量 | 3D integer vector
    Int3,
    /// 四维整数向量 | 4D integer vector
    Int4,
    /// 无符号整数 | Unsigned integer
    UInt,
    /// 二维无符号整数向量 | 2D unsigned integer vector
    UInt2,
    /// 三维无符号整数向量 | 3D unsigned integer vector
    UInt3,
    /// 四维无符号整数向量 | 4D unsigned integer vector
    UInt4,
    /// 归一化的 4 字节颜色（RGBA） | Normalized 4-byte color (RGBA)
    UByte4Norm,
}

impl VertexAttributeType {
    /// 获取字节大小
    ///
    /// Get byte size.
    #[inline]
    pub const fn byte_size(&self) -> usize {
        match self {
            Self::Float | Self::Int | Self::UInt => 4,
            Self::Float2 | Self::Int2 | Self::UInt2 => 8,
            Self::Float3 | Self::Int3 | Self::UInt3 => 12,
            Self::Float4 | Self::Int4 | Self::UInt4 => 16,
            Self::UByte4Norm => 4,
        }
    }

    /// 获取组件数量
    ///
    /// Get component count.
    #[inline]
    pub const fn component_count(&self) -> u32 {
        match self {
            Self::Float | Self::Int | Self::UInt => 1,
            Self::Float2 | Self::Int2 | Self::UInt2 => 2,
            Self::Float3 | Self::Int3 | Self::UInt3 => 3,
            Self::Float4 | Self::Int4 | Self::UInt4 | Self::UByte4Norm => 4,
        }
    }

    /// 是否为浮点类型
    ///
    /// Check if float type.
    #[inline]
    pub const fn is_float(&self) -> bool {
        matches!(self, Self::Float | Self::Float2 | Self::Float3 | Self::Float4)
    }

    /// 是否为整数类型
    ///
    /// Check if integer type.
    #[inline]
    pub const fn is_integer(&self) -> bool {
        matches!(
            self,
            Self::Int | Self::Int2 | Self::Int3 | Self::Int4 |
            Self::UInt | Self::UInt2 | Self::UInt3 | Self::UInt4
        )
    }
}

/// 顶点属性描述
///
/// Vertex attribute descriptor.
#[derive(Debug, Clone)]
pub struct VertexAttribute {
    /// 属性名称（对应 shader 中的 attribute）
    ///
    /// Attribute name (corresponds to shader attribute).
    pub name: &'static str,

    /// 属性类型
    ///
    /// Attribute type.
    pub attr_type: VertexAttributeType,

    /// 字节偏移
    ///
    /// Byte offset in vertex.
    pub offset: usize,

    /// 是否归一化（仅对整数类型有效）
    ///
    /// Whether to normalize (only valid for integer types).
    pub normalized: bool,
}

impl VertexAttribute {
    /// 创建新的顶点属性
    ///
    /// Create new vertex attribute.
    pub const fn new(
        name: &'static str,
        attr_type: VertexAttributeType,
        offset: usize,
    ) -> Self {
        Self {
            name,
            attr_type,
            offset,
            normalized: false,
        }
    }

    /// 创建归一化的顶点属性
    ///
    /// Create normalized vertex attribute.
    pub const fn normalized(
        name: &'static str,
        attr_type: VertexAttributeType,
        offset: usize,
    ) -> Self {
        Self {
            name,
            attr_type,
            offset,
            normalized: true,
        }
    }
}

/// 顶点布局描述
///
/// Vertex layout descriptor.
#[derive(Debug, Clone)]
pub struct VertexLayout {
    /// 属性列表
    ///
    /// Attribute list.
    pub attributes: Vec<VertexAttribute>,

    /// 步幅（单个顶点字节大小）
    ///
    /// Stride (bytes per vertex).
    pub stride: usize,
}

impl VertexLayout {
    /// 创建新的顶点布局
    ///
    /// Create new vertex layout.
    pub fn new(attributes: Vec<VertexAttribute>, stride: usize) -> Self {
        Self { attributes, stride }
    }

    /// 从属性列表自动计算步幅
    ///
    /// Auto-calculate stride from attribute list.
    pub fn from_attributes(attributes: Vec<VertexAttribute>) -> Self {
        let stride = attributes
            .iter()
            .map(|attr| attr.offset + attr.attr_type.byte_size())
            .max()
            .unwrap_or(0);
        Self { attributes, stride }
    }

    /// 创建 Sprite 顶点布局
    ///
    /// 布局：position(2) + texcoord(2) + color(4) + aspect(1) = 9 floats = 36 bytes
    ///
    /// Create sprite vertex layout.
    /// Layout: position(2) + texcoord(2) + color(4) + aspect(1) = 9 floats = 36 bytes
    pub fn sprite() -> Self {
        Self {
            attributes: vec![
                VertexAttribute::new("a_position", VertexAttributeType::Float2, 0),
                VertexAttribute::new("a_texcoord", VertexAttributeType::Float2, 8),
                VertexAttribute::new("a_color", VertexAttributeType::Float4, 16),
                VertexAttribute::new("a_aspect", VertexAttributeType::Float, 32),
            ],
            stride: 36,
        }
    }

    /// 创建简单 2D 顶点布局（位置 + 颜色）
    ///
    /// Create simple 2D vertex layout (position + color).
    pub fn simple_2d() -> Self {
        Self {
            attributes: vec![
                VertexAttribute::new("a_position", VertexAttributeType::Float2, 0),
                VertexAttribute::new("a_color", VertexAttributeType::Float4, 8),
            ],
            stride: 24,
        }
    }

    /// 创建带纹理的 2D 顶点布局（位置 + 纹理坐标 + 颜色）
    ///
    /// Create textured 2D vertex layout (position + texcoord + color).
    pub fn textured_2d() -> Self {
        Self {
            attributes: vec![
                VertexAttribute::new("a_position", VertexAttributeType::Float2, 0),
                VertexAttribute::new("a_texcoord", VertexAttributeType::Float2, 8),
                VertexAttribute::new("a_color", VertexAttributeType::Float4, 16),
            ],
            stride: 32,
        }
    }
}

// ==================== 预定义顶点结构 | Predefined Vertex Structures ====================

/// 精灵顶点
///
/// Sprite vertex.
///
/// 与现有 SpriteBatch 顶点格式兼容。
/// Compatible with existing SpriteBatch vertex format.
#[repr(C)]
#[derive(Debug, Clone, Copy, Default, Pod, Zeroable)]
pub struct SpriteVertex {
    /// 位置 | Position
    pub position: [f32; 2],
    /// 纹理坐标 | Texture coordinates
    pub texcoord: [f32; 2],
    /// 颜色（RGBA） | Color (RGBA)
    pub color: [f32; 4],
    /// 宽高比（用于保持纹理比例） | Aspect ratio (for maintaining texture ratio)
    pub aspect: f32,
}

impl SpriteVertex {
    /// 顶点布局
    ///
    /// Vertex layout.
    pub fn layout() -> VertexLayout {
        VertexLayout::sprite()
    }
}

/// 简单 2D 顶点（位置 + 颜色）
///
/// Simple 2D vertex (position + color).
#[repr(C)]
#[derive(Debug, Clone, Copy, Default, Pod, Zeroable)]
pub struct Simple2DVertex {
    /// 位置 | Position
    pub position: [f32; 2],
    /// 颜色（RGBA） | Color (RGBA)
    pub color: [f32; 4],
}

impl Simple2DVertex {
    /// 创建新顶点
    ///
    /// Create new vertex.
    pub const fn new(x: f32, y: f32, r: f32, g: f32, b: f32, a: f32) -> Self {
        Self {
            position: [x, y],
            color: [r, g, b, a],
        }
    }

    /// 顶点布局
    ///
    /// Vertex layout.
    pub fn layout() -> VertexLayout {
        VertexLayout::simple_2d()
    }
}

/// 带纹理的 2D 顶点
///
/// Textured 2D vertex.
#[repr(C)]
#[derive(Debug, Clone, Copy, Default, Pod, Zeroable)]
pub struct Textured2DVertex {
    /// 位置 | Position
    pub position: [f32; 2],
    /// 纹理坐标 | Texture coordinates
    pub texcoord: [f32; 2],
    /// 颜色（RGBA） | Color (RGBA)
    pub color: [f32; 4],
}

impl Textured2DVertex {
    /// 创建新顶点
    ///
    /// Create new vertex.
    pub const fn new(x: f32, y: f32, u: f32, v: f32, r: f32, g: f32, b: f32, a: f32) -> Self {
        Self {
            position: [x, y],
            texcoord: [u, v],
            color: [r, g, b, a],
        }
    }

    /// 顶点布局
    ///
    /// Vertex layout.
    pub fn layout() -> VertexLayout {
        VertexLayout::textured_2d()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::mem;

    #[test]
    fn test_sprite_vertex_size() {
        assert_eq!(mem::size_of::<SpriteVertex>(), 36);
    }

    #[test]
    fn test_simple_2d_vertex_size() {
        assert_eq!(mem::size_of::<Simple2DVertex>(), 24);
    }

    #[test]
    fn test_textured_2d_vertex_size() {
        assert_eq!(mem::size_of::<Textured2DVertex>(), 32);
    }

    #[test]
    fn test_vertex_layout_stride() {
        let layout = VertexLayout::sprite();
        assert_eq!(layout.stride, 36);
        assert_eq!(layout.attributes.len(), 4);
    }
}
