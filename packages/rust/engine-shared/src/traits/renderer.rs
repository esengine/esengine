//! 高级渲染器 trait
//!
//! High-level renderer trait.

use super::backend::{GraphicsBackend, GraphicsResult};
use crate::camera::Camera2D;

// ==================== 精灵批处理数据 | Sprite Batch Data ====================

/// 精灵批处理数据
///
/// 与现有 TypeScript 层的 RenderBatcher 数据格式兼容。
///
/// Sprite batch data.
/// Compatible with existing TypeScript RenderBatcher data format.
#[derive(Debug)]
pub struct SpriteBatchData<'a> {
    /// 变换数据：[x, y, rotation, scaleX, scaleY, originX, originY] per sprite
    ///
    /// Transform data: [x, y, rotation, scaleX, scaleY, originX, originY] per sprite.
    pub transforms: &'a [f32],

    /// 纹理 ID（每个精灵一个）
    ///
    /// Texture ID (one per sprite).
    pub texture_ids: &'a [u32],

    /// UV 坐标：[u0, v0, u1, v1] per sprite
    ///
    /// UV coordinates: [u0, v0, u1, v1] per sprite.
    pub uvs: &'a [f32],

    /// 打包的 RGBA 颜色（每个精灵一个）
    ///
    /// Packed RGBA color (one per sprite).
    pub colors: &'a [u32],

    /// 材质 ID（每个精灵一个，0 = 默认）
    ///
    /// Material ID (one per sprite, 0 = default).
    pub material_ids: &'a [u32],
}

impl<'a> SpriteBatchData<'a> {
    /// 获取精灵数量
    ///
    /// Get sprite count.
    pub fn sprite_count(&self) -> usize {
        self.texture_ids.len()
    }

    /// 验证数据一致性
    ///
    /// Validate data consistency.
    pub fn validate(&self) -> Result<(), &'static str> {
        let count = self.sprite_count();

        if self.transforms.len() != count * 7 {
            return Err("transforms length mismatch (expected count * 7)");
        }
        if self.uvs.len() != count * 4 {
            return Err("uvs length mismatch (expected count * 4)");
        }
        if self.colors.len() != count {
            return Err("colors length mismatch");
        }
        if self.material_ids.len() != count {
            return Err("material_ids length mismatch");
        }

        Ok(())
    }
}

/// 相机状态
///
/// Camera state.
#[derive(Debug, Clone, Copy, Default)]
pub struct CameraState {
    /// X 坐标 | X coordinate
    pub x: f32,
    /// Y 坐标 | Y coordinate
    pub y: f32,
    /// 缩放 | Zoom
    pub zoom: f32,
    /// 旋转（弧度）| Rotation (radians)
    pub rotation: f32,
}

impl CameraState {
    /// 创建新的相机状态
    ///
    /// Create new camera state.
    pub const fn new(x: f32, y: f32, zoom: f32, rotation: f32) -> Self {
        Self { x, y, zoom, rotation }
    }

    /// 创建默认相机状态
    ///
    /// Create default camera state.
    pub const fn identity() -> Self {
        Self {
            x: 0.0,
            y: 0.0,
            zoom: 1.0,
            rotation: 0.0,
        }
    }

    /// 转换为 Camera2D
    ///
    /// Convert to Camera2D.
    pub fn to_camera2d(&self, width: f32, height: f32) -> Camera2D {
        Camera2D::new(width, height)
            .with_position(self.x, self.y)
            .with_zoom(self.zoom)
            .with_rotation(self.rotation)
    }
}

// ==================== 2D 渲染器 Trait | 2D Renderer Trait ====================

/// 2D 渲染器 trait
///
/// 在 GraphicsBackend 基础上提供更高级的 2D 渲染 API。
///
/// 2D renderer trait.
/// Provides higher-level 2D rendering API built on top of GraphicsBackend.
pub trait Renderer2D {
    /// 后端类型
    ///
    /// Backend type.
    type Backend: GraphicsBackend;

    /// 获取底层后端
    ///
    /// Get underlying backend.
    fn backend(&self) -> &Self::Backend;

    /// 获取底层后端（可变）
    ///
    /// Get underlying backend (mutable).
    fn backend_mut(&mut self) -> &mut Self::Backend;

    /// 提交精灵批次
    ///
    /// Submit sprite batch.
    fn submit_sprite_batch(&mut self, data: SpriteBatchData) -> GraphicsResult<()>;

    /// 设置相机
    ///
    /// Set camera.
    fn set_camera(&mut self, state: CameraState);

    /// 获取相机状态
    ///
    /// Get camera state.
    fn camera(&self) -> CameraState;

    /// 渲染当前帧
    ///
    /// Render current frame.
    fn render(&mut self) -> GraphicsResult<()>;

    /// 清屏
    ///
    /// Clear screen.
    fn clear(&mut self, r: f32, g: f32, b: f32, a: f32) {
        self.backend_mut().clear(r, g, b, a);
    }

    /// 屏幕坐标转世界坐标
    ///
    /// Screen to world coordinates.
    fn screen_to_world(&self, screen_x: f32, screen_y: f32) -> (f32, f32);

    /// 世界坐标转屏幕坐标
    ///
    /// World to screen coordinates.
    fn world_to_screen(&self, world_x: f32, world_y: f32) -> (f32, f32);
}

// ==================== Gizmo 渲染器 Trait | Gizmo Renderer Trait ====================

/// Gizmo 类型
///
/// Gizmo type.
#[derive(Debug, Clone)]
pub enum GizmoShape {
    /// 矩形
    ///
    /// Rectangle.
    Rect {
        x: f32,
        y: f32,
        width: f32,
        height: f32,
        rotation: f32,
        origin_x: f32,
        origin_y: f32,
        show_handles: bool,
    },

    /// 圆形
    ///
    /// Circle.
    Circle {
        x: f32,
        y: f32,
        radius: f32,
    },

    /// 线段/多边形
    ///
    /// Line/polygon.
    Line {
        points: Vec<(f32, f32)>,
        closed: bool,
    },

    /// 胶囊体
    ///
    /// Capsule.
    Capsule {
        x: f32,
        y: f32,
        radius: f32,
        half_height: f32,
        rotation: f32,
    },
}

/// Gizmo 渲染器 trait（编辑器功能）
///
/// Gizmo renderer trait (editor feature).
pub trait GizmoRenderer {
    /// 添加 Gizmo
    ///
    /// Add gizmo.
    fn add_gizmo(&mut self, shape: GizmoShape, r: f32, g: f32, b: f32, a: f32);

    /// 清空 Gizmo
    ///
    /// Clear gizmos.
    fn clear_gizmos(&mut self);

    /// 渲染 Gizmo
    ///
    /// Render gizmos.
    fn render_gizmos(&mut self) -> GraphicsResult<()>;

    /// 是否显示 Gizmo
    ///
    /// Check if gizmos are visible.
    fn gizmos_visible(&self) -> bool;

    /// 设置 Gizmo 可见性
    ///
    /// Set gizmo visibility.
    fn set_gizmos_visible(&mut self, visible: bool);
}

// ==================== 网格渲染器 Trait | Grid Renderer Trait ====================

/// 网格渲染器 trait（编辑器功能）
///
/// Grid renderer trait (editor feature).
pub trait GridRenderer {
    /// 是否显示网格
    ///
    /// Check if grid is visible.
    fn grid_visible(&self) -> bool;

    /// 设置网格可见性
    ///
    /// Set grid visibility.
    fn set_grid_visible(&mut self, visible: bool);

    /// 渲染网格
    ///
    /// Render grid.
    fn render_grid(&mut self) -> GraphicsResult<()>;

    /// 设置网格大小
    ///
    /// Set grid size.
    fn set_grid_size(&mut self, size: f32);

    /// 设置网格颜色
    ///
    /// Set grid color.
    fn set_grid_color(&mut self, r: f32, g: f32, b: f32, a: f32);
}
