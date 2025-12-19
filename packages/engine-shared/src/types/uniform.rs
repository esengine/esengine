//! Uniform 类型定义
//!
//! Uniform type definitions.

use glam::{Vec2, Vec3, Vec4, Mat3, Mat4};

/// Uniform 值类型
///
/// Uniform value type.
#[derive(Debug, Clone)]
pub enum UniformValue {
    /// 单精度浮点 | Single float
    Float(f32),
    /// 二维向量 | 2D vector
    Float2(Vec2),
    /// 三维向量 | 3D vector
    Float3(Vec3),
    /// 四维向量 | 4D vector
    Float4(Vec4),
    /// 有符号整数 | Signed integer
    Int(i32),
    /// 二维整数向量 | 2D integer vector
    Int2([i32; 2]),
    /// 三维整数向量 | 3D integer vector
    Int3([i32; 3]),
    /// 四维整数向量 | 4D integer vector
    Int4([i32; 4]),
    /// 无符号整数 | Unsigned integer
    UInt(u32),
    /// 3x3 矩阵 | 3x3 matrix
    Mat3(Mat3),
    /// 4x4 矩阵 | 4x4 matrix
    Mat4(Mat4),
    /// 纹理单元索引 | Texture unit index
    Texture(u32),
}

impl UniformValue {
    /// 获取类型名称
    ///
    /// Get type name.
    pub const fn type_name(&self) -> &'static str {
        match self {
            Self::Float(_) => "float",
            Self::Float2(_) => "vec2",
            Self::Float3(_) => "vec3",
            Self::Float4(_) => "vec4",
            Self::Int(_) => "int",
            Self::Int2(_) => "ivec2",
            Self::Int3(_) => "ivec3",
            Self::Int4(_) => "ivec4",
            Self::UInt(_) => "uint",
            Self::Mat3(_) => "mat3",
            Self::Mat4(_) => "mat4",
            Self::Texture(_) => "sampler2D",
        }
    }

    /// 创建颜色 uniform（vec4）
    ///
    /// Create color uniform (vec4).
    pub fn color(r: f32, g: f32, b: f32, a: f32) -> Self {
        Self::Float4(Vec4::new(r, g, b, a))
    }

    /// 创建颜色 uniform（从 u32 RGBA）
    ///
    /// Create color uniform (from u32 RGBA).
    pub fn color_from_u32(rgba: u32) -> Self {
        let r = ((rgba >> 24) & 0xFF) as f32 / 255.0;
        let g = ((rgba >> 16) & 0xFF) as f32 / 255.0;
        let b = ((rgba >> 8) & 0xFF) as f32 / 255.0;
        let a = (rgba & 0xFF) as f32 / 255.0;
        Self::color(r, g, b, a)
    }
}

// ==================== From 实现 | From Implementations ====================

impl From<f32> for UniformValue {
    fn from(v: f32) -> Self {
        Self::Float(v)
    }
}

impl From<Vec2> for UniformValue {
    fn from(v: Vec2) -> Self {
        Self::Float2(v)
    }
}

impl From<Vec3> for UniformValue {
    fn from(v: Vec3) -> Self {
        Self::Float3(v)
    }
}

impl From<Vec4> for UniformValue {
    fn from(v: Vec4) -> Self {
        Self::Float4(v)
    }
}

impl From<i32> for UniformValue {
    fn from(v: i32) -> Self {
        Self::Int(v)
    }
}

impl From<[i32; 2]> for UniformValue {
    fn from(v: [i32; 2]) -> Self {
        Self::Int2(v)
    }
}

impl From<[i32; 3]> for UniformValue {
    fn from(v: [i32; 3]) -> Self {
        Self::Int3(v)
    }
}

impl From<[i32; 4]> for UniformValue {
    fn from(v: [i32; 4]) -> Self {
        Self::Int4(v)
    }
}

impl From<u32> for UniformValue {
    fn from(v: u32) -> Self {
        Self::UInt(v)
    }
}

impl From<Mat3> for UniformValue {
    fn from(v: Mat3) -> Self {
        Self::Mat3(v)
    }
}

impl From<Mat4> for UniformValue {
    fn from(v: Mat4) -> Self {
        Self::Mat4(v)
    }
}

/// Uniform 绑定描述
///
/// Uniform binding descriptor.
#[derive(Debug, Clone)]
pub struct UniformBinding {
    /// Uniform 名称 | Uniform name
    pub name: String,
    /// Uniform 值 | Uniform value
    pub value: UniformValue,
}

impl UniformBinding {
    /// 创建新的 uniform 绑定
    ///
    /// Create new uniform binding.
    pub fn new(name: impl Into<String>, value: impl Into<UniformValue>) -> Self {
        Self {
            name: name.into(),
            value: value.into(),
        }
    }
}

/// Uniform 集合
///
/// Uniform set.
#[derive(Debug, Clone, Default)]
pub struct UniformSet {
    /// Uniform 列表 | Uniform list
    bindings: Vec<UniformBinding>,
}

impl UniformSet {
    /// 创建新的 uniform 集合
    ///
    /// Create new uniform set.
    pub fn new() -> Self {
        Self::default()
    }

    /// 创建带容量的 uniform 集合
    ///
    /// Create uniform set with capacity.
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            bindings: Vec::with_capacity(capacity),
        }
    }

    /// 设置 uniform 值
    ///
    /// Set uniform value.
    pub fn set(&mut self, name: impl Into<String>, value: impl Into<UniformValue>) {
        let name = name.into();
        let value = value.into();

        // 查找已存在的 uniform
        for binding in &mut self.bindings {
            if binding.name == name {
                binding.value = value;
                return;
            }
        }

        // 添加新的 uniform
        self.bindings.push(UniformBinding { name, value });
    }

    /// 获取 uniform 值
    ///
    /// Get uniform value.
    pub fn get(&self, name: &str) -> Option<&UniformValue> {
        self.bindings
            .iter()
            .find(|b| b.name == name)
            .map(|b| &b.value)
    }

    /// 移除 uniform
    ///
    /// Remove uniform.
    pub fn remove(&mut self, name: &str) -> Option<UniformValue> {
        if let Some(idx) = self.bindings.iter().position(|b| b.name == name) {
            Some(self.bindings.remove(idx).value)
        } else {
            None
        }
    }

    /// 清空所有 uniform
    ///
    /// Clear all uniforms.
    pub fn clear(&mut self) {
        self.bindings.clear();
    }

    /// 迭代所有 uniform
    ///
    /// Iterate over all uniforms.
    pub fn iter(&self) -> impl Iterator<Item = &UniformBinding> {
        self.bindings.iter()
    }

    /// 获取 uniform 数量
    ///
    /// Get uniform count.
    pub fn len(&self) -> usize {
        self.bindings.len()
    }

    /// 是否为空
    ///
    /// Check if empty.
    pub fn is_empty(&self) -> bool {
        self.bindings.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_uniform_set() {
        let mut set = UniformSet::new();

        set.set("u_time", 1.5f32);
        set.set("u_resolution", Vec2::new(800.0, 600.0));
        set.set("u_color", Vec4::new(1.0, 0.0, 0.0, 1.0));

        assert_eq!(set.len(), 3);

        if let Some(UniformValue::Float(v)) = set.get("u_time") {
            assert_eq!(*v, 1.5);
        } else {
            panic!("Expected Float");
        }

        // 更新已存在的 uniform
        set.set("u_time", 2.0f32);
        assert_eq!(set.len(), 3); // 数量不变

        if let Some(UniformValue::Float(v)) = set.get("u_time") {
            assert_eq!(*v, 2.0);
        } else {
            panic!("Expected Float");
        }
    }

    #[test]
    fn test_color_from_u32() {
        let color = UniformValue::color_from_u32(0xFF0000FF); // Red
        if let UniformValue::Float4(v) = color {
            assert!((v.x - 1.0).abs() < 0.001);
            assert!((v.y - 0.0).abs() < 0.001);
            assert!((v.z - 0.0).abs() < 0.001);
            assert!((v.w - 1.0).abs() < 0.001);
        } else {
            panic!("Expected Float4");
        }
    }
}
