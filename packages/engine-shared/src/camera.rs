//! 2D 相机（纯数学实现）
//!
//! 2D camera (pure math implementation).

use glam::{Mat3, Vec2};

/// 2D 相机
///
/// 提供正交投影、坐标转换等功能。
/// 纯数学实现，不依赖任何图形 API。
///
/// 2D camera.
/// Provides orthographic projection, coordinate conversion, etc.
/// Pure math implementation, no graphics API dependencies.
#[derive(Debug, Clone, Copy)]
pub struct Camera2D {
    /// 相机位置（世界坐标）| Camera position (world coordinates)
    position: Vec2,

    /// 旋转角度（弧度，顺时针为正）| Rotation (radians, clockwise positive)
    rotation: f32,

    /// 缩放级别 | Zoom level
    zoom: f32,

    /// 视口宽度 | Viewport width
    width: f32,

    /// 视口高度 | Viewport height
    height: f32,
}

impl Default for Camera2D {
    fn default() -> Self {
        Self {
            position: Vec2::ZERO,
            rotation: 0.0,
            zoom: 1.0,
            width: 800.0,
            height: 600.0,
        }
    }
}

impl Camera2D {
    /// 创建新相机
    ///
    /// Create new camera.
    pub fn new(width: f32, height: f32) -> Self {
        Self {
            width,
            height,
            ..Default::default()
        }
    }

    // ==================== Builder Pattern ====================

    /// 设置位置
    ///
    /// Set position.
    pub fn with_position(mut self, x: f32, y: f32) -> Self {
        self.position = Vec2::new(x, y);
        self
    }

    /// 设置缩放
    ///
    /// Set zoom.
    pub fn with_zoom(mut self, zoom: f32) -> Self {
        self.zoom = zoom.max(0.001);
        self
    }

    /// 设置旋转
    ///
    /// Set rotation.
    pub fn with_rotation(mut self, rotation: f32) -> Self {
        self.rotation = rotation;
        self
    }

    // ==================== Getters ====================

    /// 获取位置
    ///
    /// Get position.
    pub fn position(&self) -> Vec2 {
        self.position
    }

    /// 获取 X 坐标
    ///
    /// Get X coordinate.
    pub fn x(&self) -> f32 {
        self.position.x
    }

    /// 获取 Y 坐标
    ///
    /// Get Y coordinate.
    pub fn y(&self) -> f32 {
        self.position.y
    }

    /// 获取旋转
    ///
    /// Get rotation.
    pub fn rotation(&self) -> f32 {
        self.rotation
    }

    /// 获取缩放
    ///
    /// Get zoom.
    pub fn zoom(&self) -> f32 {
        self.zoom
    }

    /// 获取视口宽度
    ///
    /// Get viewport width.
    pub fn width(&self) -> f32 {
        self.width
    }

    /// 获取视口高度
    ///
    /// Get viewport height.
    pub fn height(&self) -> f32 {
        self.height
    }

    // ==================== Setters ====================

    /// 设置位置
    ///
    /// Set position.
    pub fn set_position(&mut self, x: f32, y: f32) {
        self.position = Vec2::new(x, y);
    }

    /// 设置旋转
    ///
    /// Set rotation.
    pub fn set_rotation(&mut self, rotation: f32) {
        self.rotation = rotation;
    }

    /// 设置缩放
    ///
    /// Set zoom.
    pub fn set_zoom(&mut self, zoom: f32) {
        self.zoom = zoom.max(0.001);
    }

    /// 调整视口大小
    ///
    /// Resize viewport.
    pub fn resize(&mut self, width: f32, height: f32) {
        self.width = width;
        self.height = height;
    }

    // ==================== Transform Methods ====================

    /// 移动相机
    ///
    /// Move camera.
    pub fn translate(&mut self, dx: f32, dy: f32) {
        self.position.x += dx;
        self.position.y += dy;
    }

    /// 旋转相机
    ///
    /// Rotate camera.
    pub fn rotate(&mut self, delta: f32) {
        self.rotation += delta;
    }

    /// 缩放相机
    ///
    /// Zoom camera.
    pub fn zoom_by(&mut self, factor: f32) {
        self.zoom = (self.zoom * factor).max(0.001);
    }

    // ==================== Matrix Generation ====================

    /// 获取投影矩阵
    ///
    /// 将世界坐标转换为 NDC（-1 到 1）。
    ///
    /// Get projection matrix.
    /// Transforms world coordinates to NDC (-1 to 1).
    pub fn projection_matrix(&self) -> Mat3 {
        // 计算缩放
        let scale_x = 2.0 / self.width * self.zoom;
        let scale_y = 2.0 / self.height * self.zoom;

        // 计算旋转
        let cos_r = self.rotation.cos();
        let sin_r = self.rotation.sin();

        // 计算平移（相机位置取反）
        let tx = -self.position.x;
        let ty = -self.position.y;

        // 构建变换矩阵：Scale * Rotate * Translate
        // 先平移，再旋转，最后缩放
        Mat3::from_cols_array(&[
            scale_x * cos_r,
            scale_y * sin_r,
            0.0,
            -scale_x * sin_r,
            scale_y * cos_r,
            0.0,
            scale_x * (tx * cos_r - ty * sin_r),
            scale_y * (tx * sin_r + ty * cos_r),
            1.0,
        ])
    }

    /// 获取视图矩阵
    ///
    /// Get view matrix.
    pub fn view_matrix(&self) -> Mat3 {
        let cos_r = self.rotation.cos();
        let sin_r = self.rotation.sin();

        let tx = -self.position.x;
        let ty = -self.position.y;

        Mat3::from_cols_array(&[
            cos_r,
            sin_r,
            0.0,
            -sin_r,
            cos_r,
            0.0,
            tx * cos_r - ty * sin_r,
            tx * sin_r + ty * cos_r,
            1.0,
        ])
    }

    /// 获取逆投影矩阵
    ///
    /// Get inverse projection matrix.
    pub fn inverse_projection_matrix(&self) -> Mat3 {
        self.projection_matrix().inverse()
    }

    // ==================== Coordinate Conversion ====================

    /// 屏幕坐标转世界坐标
    ///
    /// Screen to world coordinates.
    ///
    /// # Parameters
    ///
    /// - `screen_pos`: 屏幕坐标（像素，左上角为原点）| Screen coordinates (pixels, origin at top-left)
    ///
    /// # Returns
    ///
    /// 世界坐标 | World coordinates
    pub fn screen_to_world(&self, screen_pos: Vec2) -> Vec2 {
        // 屏幕坐标转 NDC
        let ndc_x = (screen_pos.x / self.width) * 2.0 - 1.0;
        let ndc_y = 1.0 - (screen_pos.y / self.height) * 2.0; // Y 轴翻转

        // NDC 转世界坐标
        let inv_proj = self.inverse_projection_matrix();
        let world = inv_proj * glam::Vec3::new(ndc_x, ndc_y, 1.0);

        Vec2::new(world.x, world.y)
    }

    /// 世界坐标转屏幕坐标
    ///
    /// World to screen coordinates.
    ///
    /// # Parameters
    ///
    /// - `world_pos`: 世界坐标 | World coordinates
    ///
    /// # Returns
    ///
    /// 屏幕坐标（像素，左上角为原点）| Screen coordinates (pixels, origin at top-left)
    pub fn world_to_screen(&self, world_pos: Vec2) -> Vec2 {
        // 世界坐标转 NDC
        let proj = self.projection_matrix();
        let ndc = proj * glam::Vec3::new(world_pos.x, world_pos.y, 1.0);

        // NDC 转屏幕坐标
        let screen_x = (ndc.x + 1.0) * 0.5 * self.width;
        let screen_y = (1.0 - ndc.y) * 0.5 * self.height; // Y 轴翻转

        Vec2::new(screen_x, screen_y)
    }

    /// 获取可见区域（世界坐标 AABB）
    ///
    /// Get visible bounds (world coordinate AABB).
    pub fn visible_bounds(&self) -> (Vec2, Vec2) {
        // 四个角的屏幕坐标
        let corners = [
            Vec2::new(0.0, 0.0),
            Vec2::new(self.width, 0.0),
            Vec2::new(self.width, self.height),
            Vec2::new(0.0, self.height),
        ];

        // 转换为世界坐标
        let world_corners: Vec<Vec2> = corners.iter().map(|c| self.screen_to_world(*c)).collect();

        // 计算 AABB
        let mut min = world_corners[0];
        let mut max = world_corners[0];

        for corner in &world_corners[1..] {
            min = min.min(*corner);
            max = max.max(*corner);
        }

        (min, max)
    }

    /// 检查点是否在可见区域内
    ///
    /// Check if point is visible.
    pub fn is_point_visible(&self, world_pos: Vec2) -> bool {
        let (min, max) = self.visible_bounds();
        world_pos.x >= min.x && world_pos.x <= max.x && world_pos.y >= min.y && world_pos.y <= max.y
    }

    /// 检查矩形是否与可见区域相交
    ///
    /// Check if rectangle intersects visible area.
    pub fn is_rect_visible(&self, pos: Vec2, size: Vec2) -> bool {
        let (min, max) = self.visible_bounds();
        let rect_max = pos + size;

        pos.x <= max.x && rect_max.x >= min.x && pos.y <= max.y && rect_max.y >= min.y
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_camera_creation() {
        let camera = Camera2D::new(800.0, 600.0);
        assert_eq!(camera.width(), 800.0);
        assert_eq!(camera.height(), 600.0);
        assert_eq!(camera.position(), Vec2::ZERO);
        assert_eq!(camera.zoom(), 1.0);
        assert_eq!(camera.rotation(), 0.0);
    }

    #[test]
    fn test_camera_builder() {
        let camera = Camera2D::new(800.0, 600.0)
            .with_position(100.0, 50.0)
            .with_zoom(2.0)
            .with_rotation(std::f32::consts::PI / 4.0);

        assert_eq!(camera.position(), Vec2::new(100.0, 50.0));
        assert_eq!(camera.zoom(), 2.0);
        assert!((camera.rotation() - std::f32::consts::PI / 4.0).abs() < 0.0001);
    }

    #[test]
    fn test_screen_to_world_identity() {
        let camera = Camera2D::new(800.0, 600.0);

        // 屏幕中心应该对应世界原点
        let center = camera.screen_to_world(Vec2::new(400.0, 300.0));
        assert!((center.x).abs() < 0.001);
        assert!((center.y).abs() < 0.001);
    }

    #[test]
    fn test_world_to_screen_identity() {
        let camera = Camera2D::new(800.0, 600.0);

        // 世界原点应该对应屏幕中心
        let center = camera.world_to_screen(Vec2::ZERO);
        assert!((center.x - 400.0).abs() < 0.001);
        assert!((center.y - 300.0).abs() < 0.001);
    }

    #[test]
    fn test_coordinate_roundtrip() {
        let camera = Camera2D::new(800.0, 600.0)
            .with_position(100.0, 50.0)
            .with_zoom(1.5)
            .with_rotation(0.3);

        let world_pos = Vec2::new(200.0, 150.0);
        let screen_pos = camera.world_to_screen(world_pos);
        let back_to_world = camera.screen_to_world(screen_pos);

        assert!((back_to_world.x - world_pos.x).abs() < 0.01);
        assert!((back_to_world.y - world_pos.y).abs() < 0.01);
    }

    #[test]
    fn test_visible_bounds() {
        let camera = Camera2D::new(800.0, 600.0);
        let (min, max) = camera.visible_bounds();

        // 默认相机应该看到 -400 到 400（水平），-300 到 300（垂直）
        assert!((min.x - (-400.0)).abs() < 0.01);
        assert!((max.x - 400.0).abs() < 0.01);
        assert!((min.y - (-300.0)).abs() < 0.01);
        assert!((max.y - 300.0).abs() < 0.01);
    }
}
