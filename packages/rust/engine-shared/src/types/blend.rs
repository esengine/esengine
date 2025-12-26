//! 混合模式与渲染状态
//!
//! Blend modes and render state.

/// 混合模式
///
/// Blend mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum BlendMode {
    /// 无混合（禁用 alpha 混合）
    ///
    /// No blending (disable alpha blending).
    None,

    /// Alpha 混合（默认）
    ///
    /// srcRGB * srcAlpha + dstRGB * (1 - srcAlpha)
    ///
    /// Alpha blending (default).
    #[default]
    Alpha,

    /// 加法混合（发光效果）
    ///
    /// srcRGB + dstRGB
    ///
    /// Additive blending (glow effects).
    Additive,

    /// 乘法混合（阴影效果）
    ///
    /// srcRGB * dstRGB
    ///
    /// Multiply blending (shadow effects).
    Multiply,

    /// 屏幕混合（提亮效果）
    ///
    /// 1 - (1 - srcRGB) * (1 - dstRGB)
    ///
    /// Screen blending (lighten effects).
    Screen,

    /// 预乘 Alpha
    ///
    /// srcRGB + dstRGB * (1 - srcAlpha)
    ///
    /// Premultiplied alpha.
    PremultipliedAlpha,
}

impl BlendMode {
    /// 获取所有混合模式
    ///
    /// Get all blend modes.
    pub const fn all() -> &'static [BlendMode] {
        &[
            BlendMode::None,
            BlendMode::Alpha,
            BlendMode::Additive,
            BlendMode::Multiply,
            BlendMode::Screen,
            BlendMode::PremultipliedAlpha,
        ]
    }

    /// 获取混合模式名称
    ///
    /// Get blend mode name.
    pub const fn name(&self) -> &'static str {
        match self {
            Self::None => "None",
            Self::Alpha => "Alpha",
            Self::Additive => "Additive",
            Self::Multiply => "Multiply",
            Self::Screen => "Screen",
            Self::PremultipliedAlpha => "PremultipliedAlpha",
        }
    }
}

/// 裁剪模式（背面剔除）
///
/// Cull mode (backface culling).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum CullMode {
    /// 无裁剪（双面渲染）
    ///
    /// No culling (double-sided rendering).
    #[default]
    None,

    /// 裁剪正面
    ///
    /// Cull front faces.
    Front,

    /// 裁剪背面
    ///
    /// Cull back faces.
    Back,
}

/// 比较函数（深度/模板测试）
///
/// Comparison function (depth/stencil test).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum CompareFunc {
    /// 永不通过 | Never pass
    Never,
    /// 小于时通过 | Pass if less
    Less,
    /// 等于时通过 | Pass if equal
    Equal,
    /// 小于等于时通过 | Pass if less or equal
    LessEqual,
    /// 大于时通过 | Pass if greater
    Greater,
    /// 不等于时通过 | Pass if not equal
    NotEqual,
    /// 大于等于时通过 | Pass if greater or equal
    GreaterEqual,
    /// 总是通过（默认） | Always pass (default)
    #[default]
    Always,
}

/// 裁剪矩形
///
/// Scissor rectangle.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct ScissorRect {
    /// X 坐标 | X coordinate
    pub x: i32,
    /// Y 坐标 | Y coordinate
    pub y: i32,
    /// 宽度 | Width
    pub width: u32,
    /// 高度 | Height
    pub height: u32,
}

impl ScissorRect {
    /// 创建新的裁剪矩形
    ///
    /// Create new scissor rectangle.
    pub const fn new(x: i32, y: i32, width: u32, height: u32) -> Self {
        Self { x, y, width, height }
    }

    /// 从位置和尺寸创建
    ///
    /// Create from position and size.
    pub const fn from_pos_size(x: i32, y: i32, width: u32, height: u32) -> Self {
        Self::new(x, y, width, height)
    }
}

/// 视口
///
/// Viewport.
#[derive(Debug, Clone, Copy, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct Viewport {
    /// X 坐标 | X coordinate
    pub x: f32,
    /// Y 坐标 | Y coordinate
    pub y: f32,
    /// 宽度 | Width
    pub width: f32,
    /// 高度 | Height
    pub height: f32,
    /// 最小深度 | Min depth
    pub min_depth: f32,
    /// 最大深度 | Max depth
    pub max_depth: f32,
}

impl Default for Viewport {
    fn default() -> Self {
        Self {
            x: 0.0,
            y: 0.0,
            width: 1.0,
            height: 1.0,
            min_depth: 0.0,
            max_depth: 1.0,
        }
    }
}

impl Viewport {
    /// 创建新的视口
    ///
    /// Create new viewport.
    pub const fn new(x: f32, y: f32, width: f32, height: f32) -> Self {
        Self {
            x,
            y,
            width,
            height,
            min_depth: 0.0,
            max_depth: 1.0,
        }
    }
}

/// 渲染状态描述
///
/// Render state descriptor.
#[derive(Debug, Clone, Default)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct RenderState {
    /// 混合模式 | Blend mode
    pub blend_mode: BlendMode,

    /// 裁剪模式 | Cull mode
    pub cull_mode: CullMode,

    /// 是否启用深度测试 | Enable depth test
    pub depth_test: bool,

    /// 是否启用深度写入 | Enable depth write
    pub depth_write: bool,

    /// 深度比较函数 | Depth comparison function
    pub depth_func: CompareFunc,

    /// 裁剪矩形（None 表示禁用） | Scissor rect (None to disable)
    pub scissor: Option<ScissorRect>,
}

impl RenderState {
    /// 创建默认 2D 渲染状态
    ///
    /// Create default 2D render state.
    pub fn default_2d() -> Self {
        Self {
            blend_mode: BlendMode::Alpha,
            cull_mode: CullMode::None,
            depth_test: false,
            depth_write: false,
            depth_func: CompareFunc::Always,
            scissor: None,
        }
    }

    /// 创建不透明 2D 渲染状态
    ///
    /// Create opaque 2D render state.
    pub fn opaque_2d() -> Self {
        Self {
            blend_mode: BlendMode::None,
            cull_mode: CullMode::None,
            depth_test: false,
            depth_write: false,
            depth_func: CompareFunc::Always,
            scissor: None,
        }
    }

    /// 创建加法混合状态
    ///
    /// Create additive blend state.
    pub fn additive() -> Self {
        Self {
            blend_mode: BlendMode::Additive,
            ..Self::default_2d()
        }
    }
}

/// 清除标志
///
/// Clear flags.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct ClearFlags {
    bits: u8,
}

impl ClearFlags {
    /// 无清除 | No clear
    pub const NONE: Self = Self { bits: 0 };
    /// 清除颜色缓冲 | Clear color buffer
    pub const COLOR: Self = Self { bits: 1 };
    /// 清除深度缓冲 | Clear depth buffer
    pub const DEPTH: Self = Self { bits: 2 };
    /// 清除模板缓冲 | Clear stencil buffer
    pub const STENCIL: Self = Self { bits: 4 };
    /// 清除所有缓冲 | Clear all buffers
    pub const ALL: Self = Self { bits: 7 };

    /// 是否包含颜色清除 | Contains color clear
    pub const fn has_color(&self) -> bool {
        self.bits & Self::COLOR.bits != 0
    }

    /// 是否包含深度清除 | Contains depth clear
    pub const fn has_depth(&self) -> bool {
        self.bits & Self::DEPTH.bits != 0
    }

    /// 是否包含模板清除 | Contains stencil clear
    pub const fn has_stencil(&self) -> bool {
        self.bits & Self::STENCIL.bits != 0
    }
}

impl std::ops::BitOr for ClearFlags {
    type Output = Self;

    fn bitor(self, rhs: Self) -> Self::Output {
        Self { bits: self.bits | rhs.bits }
    }
}

impl std::ops::BitAnd for ClearFlags {
    type Output = Self;

    fn bitand(self, rhs: Self) -> Self::Output {
        Self { bits: self.bits & rhs.bits }
    }
}

impl Default for ClearFlags {
    fn default() -> Self {
        Self::COLOR
    }
}
