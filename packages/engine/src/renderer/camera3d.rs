//! 3D camera implementation.
//! 3D相机实现。
//!
//! Uses left-hand coordinate system convention (consistent with Camera2D):
//! 使用左手坐标系约定（与Camera2D一致）：
//! - X axis: positive to the right / X 轴：正方向向右
//! - Y axis: positive upward / Y 轴：正方向向上
//! - Z axis: positive into the screen / Z 轴：正方向指向屏幕内
//!
//! Supports both perspective and orthographic projection.
//! 支持透视和正交两种投影模式。

use glam::{Mat4, Quat, Vec2, Vec3};

/// Projection type for 3D camera.
/// 3D相机的投影类型。
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ProjectionType {
    /// Perspective projection with field of view.
    /// 带视野角的透视投影。
    Perspective,
    /// Orthographic projection with fixed size.
    /// 固定大小的正交投影。
    Orthographic {
        /// Half-height of the view in world units.
        /// 视图半高度（世界单位）。
        size: f32,
    },
}

impl Default for ProjectionType {
    fn default() -> Self {
        ProjectionType::Perspective
    }
}

/// 3D ray for raycasting.
/// 用于射线检测的3D射线。
#[derive(Debug, Clone, Copy)]
pub struct Ray3D {
    /// Ray origin in world space.
    /// 射线在世界空间中的起点。
    pub origin: Vec3,
    /// Ray direction (normalized).
    /// 射线方向（已归一化）。
    pub direction: Vec3,
}

impl Ray3D {
    /// Create a new ray.
    /// 创建新射线。
    pub fn new(origin: Vec3, direction: Vec3) -> Self {
        Self {
            origin,
            direction: direction.normalize(),
        }
    }

    /// Get point along the ray at distance t.
    /// 获取射线上距离为t的点。
    #[inline]
    pub fn point_at(&self, t: f32) -> Vec3 {
        self.origin + self.direction * t
    }
}

/// 3D camera supporting perspective and orthographic projection.
/// 支持透视和正交投影的3D相机。
///
/// Provides view, projection, and combined matrices for 3D rendering.
/// 提供用于3D渲染的视图、投影和组合矩阵。
#[derive(Debug, Clone)]
pub struct Camera3D {
    /// Camera position in world space.
    /// 相机在世界空间中的位置。
    pub position: Vec3,

    /// Camera rotation as quaternion.
    /// 相机旋转（四元数）。
    pub rotation: Quat,

    /// Field of view in radians (for perspective projection).
    /// 视野角（弧度，用于透视投影）。
    pub fov: f32,

    /// Near clipping plane distance.
    /// 近裁剪面距离。
    pub near: f32,

    /// Far clipping plane distance.
    /// 远裁剪面距离。
    pub far: f32,

    /// Aspect ratio (width / height).
    /// 宽高比（宽度 / 高度）。
    pub aspect: f32,

    /// Projection type (perspective or orthographic).
    /// 投影类型（透视或正交）。
    pub projection_type: ProjectionType,

    /// Viewport width in pixels.
    /// 视口宽度（像素）。
    viewport_width: f32,

    /// Viewport height in pixels.
    /// 视口高度（像素）。
    viewport_height: f32,
}

impl Camera3D {
    /// Create a new 3D perspective camera.
    /// 创建新的3D透视相机。
    ///
    /// # Arguments | 参数
    /// * `width` - Viewport width | 视口宽度
    /// * `height` - Viewport height | 视口高度
    /// * `fov` - Field of view in radians | 视野角（弧度）
    pub fn new(width: f32, height: f32, fov: f32) -> Self {
        Self {
            position: Vec3::new(0.0, 0.0, -10.0),
            rotation: Quat::IDENTITY,
            fov,
            near: 0.1,
            far: 1000.0,
            aspect: width / height,
            projection_type: ProjectionType::Perspective,
            viewport_width: width,
            viewport_height: height,
        }
    }

    /// Create a new orthographic camera.
    /// 创建新的正交相机。
    ///
    /// # Arguments | 参数
    /// * `width` - Viewport width | 视口宽度
    /// * `height` - Viewport height | 视口高度
    /// * `size` - Orthographic half-height | 正交视图半高度
    pub fn new_orthographic(width: f32, height: f32, size: f32) -> Self {
        Self {
            position: Vec3::new(0.0, 0.0, -10.0),
            rotation: Quat::IDENTITY,
            fov: std::f32::consts::FRAC_PI_4,
            near: 0.1,
            far: 1000.0,
            aspect: width / height,
            projection_type: ProjectionType::Orthographic { size },
            viewport_width: width,
            viewport_height: height,
        }
    }

    /// Update viewport size.
    /// 更新视口大小。
    pub fn set_viewport(&mut self, width: f32, height: f32) {
        self.viewport_width = width;
        self.viewport_height = height;
        self.aspect = width / height;
    }

    /// Get the view matrix.
    /// 获取视图矩阵。
    ///
    /// Transforms world coordinates to camera/view space.
    /// 将世界坐标转换为相机/视图空间。
    pub fn view_matrix(&self) -> Mat4 {
        // Camera forward is +Z in left-hand system
        // 左手系中相机前方是 +Z
        let forward = self.rotation * Vec3::Z;
        let up = self.rotation * Vec3::Y;
        let target = self.position + forward;

        Mat4::look_at_lh(self.position, target, up)
    }

    /// Get the projection matrix.
    /// 获取投影矩阵。
    ///
    /// Transforms view space coordinates to clip space.
    /// 将视图空间坐标转换为裁剪空间。
    pub fn projection_matrix(&self) -> Mat4 {
        match self.projection_type {
            ProjectionType::Perspective => {
                Mat4::perspective_lh(self.fov, self.aspect, self.near, self.far)
            }
            ProjectionType::Orthographic { size } => {
                let half_width = size * self.aspect;
                let half_height = size;
                Mat4::orthographic_lh(
                    -half_width,
                    half_width,
                    -half_height,
                    half_height,
                    self.near,
                    self.far,
                )
            }
        }
    }

    /// Get the combined view-projection matrix.
    /// 获取组合的视图-投影矩阵。
    ///
    /// Transforms world coordinates directly to clip space.
    /// 将世界坐标直接转换为裁剪空间。
    #[inline]
    pub fn view_projection_matrix(&self) -> Mat4 {
        self.projection_matrix() * self.view_matrix()
    }

    /// Convert screen coordinates to a world-space ray.
    /// 将屏幕坐标转换为世界空间射线。
    ///
    /// Screen: (0,0) at top-left, Y-down | 屏幕：(0,0)在左上角，Y向下
    /// Returns a ray from the camera through the screen point.
    /// 返回从相机穿过屏幕点的射线。
    pub fn screen_to_world_ray(&self, screen: Vec2) -> Ray3D {
        // Convert screen to NDC [-1, 1]
        // 将屏幕坐标转换为NDC [-1, 1]
        let ndc_x = (2.0 * screen.x / self.viewport_width) - 1.0;
        let ndc_y = 1.0 - (2.0 * screen.y / self.viewport_height); // Flip Y

        // Get inverse matrices
        // 获取逆矩阵
        let inv_proj = self.projection_matrix().inverse();
        let inv_view = self.view_matrix().inverse();

        match self.projection_type {
            ProjectionType::Perspective => {
                // For perspective: ray from camera through near plane point
                // 透视模式：从相机穿过近平面点的射线
                let ray_clip = glam::Vec4::new(ndc_x, ndc_y, 0.0, 1.0);
                let ray_eye = inv_proj * ray_clip;
                let ray_eye = glam::Vec4::new(ray_eye.x, ray_eye.y, 1.0, 0.0); // Forward direction
                let ray_world = inv_view * ray_eye;
                let direction = Vec3::new(ray_world.x, ray_world.y, ray_world.z).normalize();

                Ray3D::new(self.position, direction)
            }
            ProjectionType::Orthographic { size } => {
                // For orthographic: parallel rays, origin varies
                // 正交模式：平行射线，起点变化
                let half_width = size * self.aspect;
                let half_height = size;
                let local_x = ndc_x * half_width;
                let local_y = ndc_y * half_height;

                // Ray origin in world space
                // 世界空间中的射线起点
                let right = self.rotation * Vec3::X;
                let up = self.rotation * Vec3::Y;
                let forward = self.rotation * Vec3::Z;
                let origin = self.position + right * local_x + up * local_y;

                Ray3D::new(origin, forward)
            }
        }
    }

    /// Convert world coordinates to screen coordinates.
    /// 将世界坐标转换为屏幕坐标。
    ///
    /// Returns None if the point is behind the camera.
    /// 如果点在相机后面则返回None。
    pub fn world_to_screen(&self, world: Vec3) -> Option<Vec2> {
        let clip = self.view_projection_matrix() * world.extend(1.0);

        // Check if behind camera (for perspective)
        // 检查是否在相机后面（透视模式）
        if clip.w <= 0.0 {
            return None;
        }

        // Perspective divide
        // 透视除法
        let ndc = clip.truncate() / clip.w;

        // Check if outside frustum
        // 检查是否在视锥外
        if ndc.x < -1.0 || ndc.x > 1.0 || ndc.y < -1.0 || ndc.y > 1.0 {
            return None;
        }

        // Convert NDC to screen coordinates
        // 将NDC转换为屏幕坐标
        let screen_x = (ndc.x + 1.0) * 0.5 * self.viewport_width;
        let screen_y = (1.0 - ndc.y) * 0.5 * self.viewport_height; // Flip Y

        Some(Vec2::new(screen_x, screen_y))
    }

    /// Set position from Euler angles (in radians).
    /// 从欧拉角设置旋转（弧度）。
    ///
    /// Uses XYZ rotation order.
    /// 使用XYZ旋转顺序。
    pub fn set_rotation_euler(&mut self, pitch: f32, yaw: f32, roll: f32) {
        self.rotation = Quat::from_euler(glam::EulerRot::XYZ, pitch, yaw, roll);
    }

    /// Get Euler angles from current rotation (in radians).
    /// 从当前旋转获取欧拉角（弧度）。
    ///
    /// Returns (pitch, yaw, roll) in XYZ order.
    /// 返回 (pitch, yaw, roll) 以XYZ顺序。
    pub fn get_rotation_euler(&self) -> (f32, f32, f32) {
        self.rotation.to_euler(glam::EulerRot::XYZ)
    }

    /// Move camera by delta in local space.
    /// 在局部空间中按增量移动相机。
    pub fn translate_local(&mut self, delta: Vec3) {
        let world_delta = self.rotation * delta;
        self.position += world_delta;
    }

    /// Move camera by delta in world space.
    /// 在世界空间中按增量移动相机。
    #[inline]
    pub fn translate(&mut self, delta: Vec3) {
        self.position += delta;
    }

    /// Get the forward direction vector.
    /// 获取前方方向向量。
    #[inline]
    pub fn forward(&self) -> Vec3 {
        self.rotation * Vec3::Z
    }

    /// Get the right direction vector.
    /// 获取右方方向向量。
    #[inline]
    pub fn right(&self) -> Vec3 {
        self.rotation * Vec3::X
    }

    /// Get the up direction vector.
    /// 获取上方方向向量。
    #[inline]
    pub fn up(&self) -> Vec3 {
        self.rotation * Vec3::Y
    }

    /// Look at a target position.
    /// 朝向目标位置。
    pub fn look_at(&mut self, target: Vec3, up: Vec3) {
        let forward = (target - self.position).normalize();
        let right = up.cross(forward).normalize();
        let actual_up = forward.cross(right);

        // Build rotation matrix and convert to quaternion
        // 构建旋转矩阵并转换为四元数
        let rotation_matrix = Mat4::from_cols(
            right.extend(0.0),
            actual_up.extend(0.0),
            forward.extend(0.0),
            glam::Vec4::W,
        );
        self.rotation = Quat::from_mat4(&rotation_matrix);
    }

    #[inline]
    pub fn viewport_width(&self) -> f32 {
        self.viewport_width
    }

    #[inline]
    pub fn viewport_height(&self) -> f32 {
        self.viewport_height
    }
}

impl Default for Camera3D {
    fn default() -> Self {
        Self::new(800.0, 600.0, std::f32::consts::FRAC_PI_4)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_camera_creation() {
        let camera = Camera3D::new(800.0, 600.0, std::f32::consts::FRAC_PI_4);
        assert_eq!(camera.position, Vec3::new(0.0, 0.0, -10.0));
        assert!((camera.aspect - 800.0 / 600.0).abs() < 0.001);
    }

    #[test]
    fn test_view_projection() {
        let camera = Camera3D::new(800.0, 600.0, std::f32::consts::FRAC_PI_4);
        let vp = camera.view_projection_matrix();
        // Basic sanity check: matrix should not be identity
        assert_ne!(vp, Mat4::IDENTITY);
    }

    #[test]
    fn test_world_to_screen_center() {
        let mut camera = Camera3D::new(800.0, 600.0, std::f32::consts::FRAC_PI_4);
        camera.position = Vec3::new(0.0, 0.0, -10.0);
        camera.rotation = Quat::IDENTITY;

        // Point directly in front of camera should map to center
        // 相机正前方的点应该映射到中心
        let screen = camera.world_to_screen(Vec3::new(0.0, 0.0, 0.0));
        if let Some(s) = screen {
            assert!((s.x - 400.0).abs() < 1.0);
            assert!((s.y - 300.0).abs() < 1.0);
        }
    }
}
