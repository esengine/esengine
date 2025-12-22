//! Vertex data structures for 3D rendering.
//! 用于3D渲染的顶点数据结构。

use bytemuck::{Pod, Zeroable};

/// Size of a single 3D vertex in bytes.
/// 单个3D顶点的字节大小。
pub const VERTEX3D_SIZE: usize = std::mem::size_of::<Vertex3D>();

/// Number of floats per 3D vertex.
/// 每个3D顶点的浮点数数量。
///
/// Layout: position(3) + tex_coord(2) + color(4) + normal(3) = 12
/// 布局: 位置(3) + 纹理坐标(2) + 颜色(4) + 法线(3) = 12
pub const FLOATS_PER_VERTEX_3D: usize = 12;

/// 3D vertex data.
/// 3D顶点数据。
///
/// Used for mesh rendering with optional lighting support.
/// 用于带可选光照支持的网格渲染。
#[derive(Debug, Clone, Copy, Pod, Zeroable)]
#[repr(C)]
pub struct Vertex3D {
    /// Position (x, y, z) in world or local space.
    /// 位置（世界或局部空间）。
    pub position: [f32; 3],

    /// Texture coordinates (u, v).
    /// 纹理坐标。
    pub tex_coord: [f32; 2],

    /// Color (r, g, b, a).
    /// 颜色。
    pub color: [f32; 4],

    /// Normal vector (nx, ny, nz) for lighting.
    /// 用于光照的法线向量。
    pub normal: [f32; 3],
}

impl Vertex3D {
    /// Create a new 3D vertex.
    /// 创建新的3D顶点。
    #[inline]
    pub const fn new(
        position: [f32; 3],
        tex_coord: [f32; 2],
        color: [f32; 4],
        normal: [f32; 3],
    ) -> Self {
        Self {
            position,
            tex_coord,
            color,
            normal,
        }
    }

    /// Create a simple vertex without normal (for unlit rendering).
    /// 创建不带法线的简单顶点（用于无光照渲染）。
    #[inline]
    pub const fn simple(position: [f32; 3], tex_coord: [f32; 2], color: [f32; 4]) -> Self {
        Self {
            position,
            tex_coord,
            color,
            normal: [0.0, 0.0, 1.0], // Default facing +Z
        }
    }
}

impl Default for Vertex3D {
    fn default() -> Self {
        Self {
            position: [0.0, 0.0, 0.0],
            tex_coord: [0.0, 0.0],
            color: [1.0, 1.0, 1.0, 1.0],
            normal: [0.0, 0.0, 1.0],
        }
    }
}

/// Simplified 3D vertex without normal (for unlit/billboard rendering).
/// 简化的3D顶点，不带法线（用于无光照/公告板渲染）。
///
/// Layout: position(3) + tex_coord(2) + color(4) = 9
/// 布局: 位置(3) + 纹理坐标(2) + 颜色(4) = 9
#[derive(Debug, Clone, Copy, Pod, Zeroable)]
#[repr(C)]
pub struct SimpleVertex3D {
    /// Position (x, y, z).
    /// 位置。
    pub position: [f32; 3],

    /// Texture coordinates (u, v).
    /// 纹理坐标。
    pub tex_coord: [f32; 2],

    /// Color (r, g, b, a).
    /// 颜色。
    pub color: [f32; 4],
}

/// Size of a simple 3D vertex in bytes.
/// 简单3D顶点的字节大小。
pub const SIMPLE_VERTEX3D_SIZE: usize = std::mem::size_of::<SimpleVertex3D>();

/// Number of floats per simple 3D vertex.
/// 每个简单3D顶点的浮点数数量。
pub const FLOATS_PER_SIMPLE_VERTEX_3D: usize = 9;

impl SimpleVertex3D {
    /// Create a new simple 3D vertex.
    /// 创建新的简单3D顶点。
    #[inline]
    pub const fn new(position: [f32; 3], tex_coord: [f32; 2], color: [f32; 4]) -> Self {
        Self {
            position,
            tex_coord,
            color,
        }
    }
}

impl Default for SimpleVertex3D {
    fn default() -> Self {
        Self {
            position: [0.0, 0.0, 0.0],
            tex_coord: [0.0, 0.0],
            color: [1.0, 1.0, 1.0, 1.0],
        }
    }
}

/// Convert SimpleVertex3D to Vertex3D with default normal.
/// 将SimpleVertex3D转换为带默认法线的Vertex3D。
impl From<SimpleVertex3D> for Vertex3D {
    fn from(v: SimpleVertex3D) -> Self {
        Self {
            position: v.position,
            tex_coord: v.tex_coord,
            color: v.color,
            normal: [0.0, 0.0, 1.0],
        }
    }
}
