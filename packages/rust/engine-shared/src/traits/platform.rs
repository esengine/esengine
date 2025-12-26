//! 平台抽象 trait
//!
//! Platform abstraction trait.

use super::backend::{GraphicsBackend, GraphicsResult};
use crate::types::texture::ImageData;
use std::future::Future;

// ==================== 后端配置 | Backend Configuration ====================

/// 后端配置
///
/// Backend configuration.
#[derive(Debug, Clone)]
pub struct BackendConfig {
    /// 画布/窗口 ID
    ///
    /// Canvas/Window ID.
    pub canvas_id: Option<String>,

    /// 初始宽度
    ///
    /// Initial width.
    pub width: u32,

    /// 初始高度
    ///
    /// Initial height.
    pub height: u32,

    /// 是否启用抗锯齿
    ///
    /// Enable antialiasing.
    pub antialias: bool,

    /// 是否使用高 DPI
    ///
    /// Use high DPI.
    pub high_dpi: bool,

    /// 电源偏好
    ///
    /// Power preference.
    pub power_preference: PowerPreference,

    /// 是否保留绘制缓冲区
    ///
    /// Preserve drawing buffer.
    pub preserve_drawing_buffer: bool,

    /// Alpha 模式
    ///
    /// Alpha mode.
    pub alpha: bool,

    /// 深度缓冲区大小（0 表示禁用）
    ///
    /// Depth buffer size (0 to disable).
    pub depth_size: u8,

    /// 模板缓冲区大小（0 表示禁用）
    ///
    /// Stencil buffer size (0 to disable).
    pub stencil_size: u8,
}

impl Default for BackendConfig {
    fn default() -> Self {
        Self {
            canvas_id: None,
            width: 800,
            height: 600,
            antialias: false,
            high_dpi: true,
            power_preference: PowerPreference::HighPerformance,
            preserve_drawing_buffer: false,
            alpha: true,
            depth_size: 0,
            stencil_size: 0,
        }
    }
}

impl BackendConfig {
    /// 创建新配置
    ///
    /// Create new configuration.
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            width,
            height,
            ..Default::default()
        }
    }

    /// 设置画布 ID
    ///
    /// Set canvas ID.
    pub fn with_canvas(mut self, canvas_id: impl Into<String>) -> Self {
        self.canvas_id = Some(canvas_id.into());
        self
    }

    /// 设置抗锯齿
    ///
    /// Set antialiasing.
    pub fn with_antialias(mut self, antialias: bool) -> Self {
        self.antialias = antialias;
        self
    }

    /// 设置高 DPI
    ///
    /// Set high DPI.
    pub fn with_high_dpi(mut self, high_dpi: bool) -> Self {
        self.high_dpi = high_dpi;
        self
    }

    /// 设置电源偏好
    ///
    /// Set power preference.
    pub fn with_power_preference(mut self, preference: PowerPreference) -> Self {
        self.power_preference = preference;
        self
    }

    /// 启用深度缓冲区
    ///
    /// Enable depth buffer.
    pub fn with_depth(mut self, bits: u8) -> Self {
        self.depth_size = bits;
        self
    }

    /// 启用模板缓冲区
    ///
    /// Enable stencil buffer.
    pub fn with_stencil(mut self, bits: u8) -> Self {
        self.stencil_size = bits;
        self
    }
}

/// 电源偏好
///
/// Power preference.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum PowerPreference {
    /// 低功耗（集成显卡）
    ///
    /// Low power (integrated GPU).
    LowPower,

    /// 高性能（独立显卡，默认）
    ///
    /// High performance (discrete GPU, default).
    #[default]
    HighPerformance,
}

// ==================== 资产加载器 | Asset Loader ====================

/// 资产加载错误
///
/// Asset loading error.
#[derive(Debug, Clone)]
pub struct AssetError {
    /// 错误消息
    ///
    /// Error message.
    pub message: String,

    /// 资产路径
    ///
    /// Asset path.
    pub path: String,
}

impl std::fmt::Display for AssetError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Failed to load '{}': {}", self.path, self.message)
    }
}

impl std::error::Error for AssetError {}

/// 资产加载结果
///
/// Asset loading result.
pub type AssetResult<T> = Result<T, AssetError>;

/// 资产加载器 trait
///
/// Asset loader trait.
pub trait AssetLoader {
    /// 加载二进制数据
    ///
    /// Load binary data.
    fn load_bytes(&self, path: &str) -> impl Future<Output = AssetResult<Vec<u8>>> + Send;

    /// 加载文本
    ///
    /// Load text.
    fn load_text(&self, path: &str) -> impl Future<Output = AssetResult<String>> + Send;

    /// 加载图片（返回 RGBA 数据）
    ///
    /// Load image (returns RGBA data).
    fn load_image(&self, path: &str) -> impl Future<Output = AssetResult<ImageData>> + Send;
}

// ==================== 输入系统 | Input System ====================

/// 鼠标按钮
///
/// Mouse button.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum MouseButton {
    /// 左键 | Left button
    Left,
    /// 中键 | Middle button
    Middle,
    /// 右键 | Right button
    Right,
    /// 其他按钮 | Other button
    Other(u8),
}

/// 键盘键码（常用键）
///
/// Keyboard key code (common keys).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum KeyCode {
    // 字母键
    A, B, C, D, E, F, G, H, I, J, K, L, M,
    N, O, P, Q, R, S, T, U, V, W, X, Y, Z,

    // 数字键
    Key0, Key1, Key2, Key3, Key4,
    Key5, Key6, Key7, Key8, Key9,

    // 功能键
    F1, F2, F3, F4, F5, F6,
    F7, F8, F9, F10, F11, F12,

    // 控制键
    Escape, Tab, CapsLock, Shift, Control, Alt,
    Space, Enter, Backspace, Delete, Insert,
    Home, End, PageUp, PageDown,

    // 方向键
    Up, Down, Left, Right,

    // 符号键
    Minus, Equal, BracketLeft, BracketRight,
    Backslash, Semicolon, Quote, Comma, Period, Slash,
    Backquote,

    // 其他
    Unknown(u32),
}

/// 输入状态 trait
///
/// Input state trait.
pub trait InputState {
    /// 检查按键是否按下
    ///
    /// Check if key is pressed.
    fn is_key_down(&self, key: KeyCode) -> bool;

    /// 检查按键是否刚按下（本帧）
    ///
    /// Check if key was just pressed (this frame).
    fn is_key_just_pressed(&self, key: KeyCode) -> bool;

    /// 检查按键是否刚释放（本帧）
    ///
    /// Check if key was just released (this frame).
    fn is_key_just_released(&self, key: KeyCode) -> bool;

    /// 检查鼠标按钮是否按下
    ///
    /// Check if mouse button is pressed.
    fn is_mouse_button_down(&self, button: MouseButton) -> bool;

    /// 获取鼠标位置
    ///
    /// Get mouse position.
    fn mouse_position(&self) -> (f32, f32);

    /// 获取鼠标滚轮增量
    ///
    /// Get mouse wheel delta.
    fn mouse_wheel_delta(&self) -> f32;

    /// 更新输入状态（每帧调用）
    ///
    /// Update input state (call every frame).
    fn update(&mut self);
}

// ==================== 平台 Trait | Platform Trait ====================

/// 平台抽象 trait
///
/// 定义平台相关操作的抽象接口。
///
/// Platform abstraction trait.
/// Defines abstract interface for platform-specific operations.
pub trait Platform {
    /// 后端类型
    ///
    /// Backend type.
    type Backend: GraphicsBackend;

    /// 资产加载器类型
    ///
    /// Asset loader type.
    type AssetLoader: AssetLoader;

    /// 输入状态类型
    ///
    /// Input state type.
    type Input: InputState;

    /// 创建图形后端
    ///
    /// Create graphics backend.
    fn create_backend(&self, config: BackendConfig) -> GraphicsResult<Self::Backend>;

    /// 获取资产加载器
    ///
    /// Get asset loader.
    fn asset_loader(&self) -> &Self::AssetLoader;

    /// 获取输入状态
    ///
    /// Get input state.
    fn input(&self) -> &Self::Input;

    /// 获取输入状态（可变）
    ///
    /// Get input state (mutable).
    fn input_mut(&mut self) -> &mut Self::Input;

    /// 获取屏幕尺寸
    ///
    /// Get screen size.
    fn screen_size(&self) -> (u32, u32);

    /// 获取设备像素比
    ///
    /// Get device pixel ratio.
    fn device_pixel_ratio(&self) -> f32;

    /// 获取当前时间（秒）
    ///
    /// Get current time (seconds).
    fn time(&self) -> f64;

    /// 请求下一帧
    ///
    /// Request next frame.
    fn request_animation_frame(&self, callback: impl FnOnce(f64) + 'static);
}

// ==================== 平台类型枚举 | Platform Type Enum ====================

/// 平台类型
///
/// Platform type.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum PlatformType {
    /// Web 浏览器
    ///
    /// Web browser.
    Web,

    /// 微信小游戏
    ///
    /// WeChat Mini Game.
    WeChatMiniGame,

    /// Windows 桌面
    ///
    /// Windows desktop.
    Windows,

    /// macOS 桌面
    ///
    /// macOS desktop.
    MacOS,

    /// Linux 桌面
    ///
    /// Linux desktop.
    Linux,

    /// Android
    Android,

    /// iOS
    IOS,

    /// 未知平台
    ///
    /// Unknown platform.
    Unknown,
}

impl PlatformType {
    /// 是否为桌面平台
    ///
    /// Check if desktop platform.
    pub const fn is_desktop(&self) -> bool {
        matches!(self, Self::Windows | Self::MacOS | Self::Linux)
    }

    /// 是否为移动平台
    ///
    /// Check if mobile platform.
    pub const fn is_mobile(&self) -> bool {
        matches!(self, Self::Android | Self::IOS)
    }

    /// 是否为 Web 平台
    ///
    /// Check if web platform.
    pub const fn is_web(&self) -> bool {
        matches!(self, Self::Web | Self::WeChatMiniGame)
    }

    /// 是否为原生平台
    ///
    /// Check if native platform.
    pub const fn is_native(&self) -> bool {
        !self.is_web()
    }
}
