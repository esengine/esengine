//! ESEngine 图形后端共享库
//!
//! 本库提供跨平台图形后端抽象层，包括：
//! - 类型安全的资源句柄
//! - 图形后端 trait 定义
//! - 平台抽象 trait
//! - 共享数据结构
//!
//! ESEngine graphics backend shared library.
//! Provides cross-platform graphics backend abstraction including:
//! - Type-safe resource handles
//! - Graphics backend trait definitions
//! - Platform abstraction traits
//! - Shared data structures

pub mod types;
pub mod traits;
pub mod batch;
pub mod camera;

// Re-export commonly used items | 重新导出常用项
pub use types::{
    handle::*,
    vertex::*,
    blend::*,
    uniform::*,
    texture::*,
};

pub use traits::{
    backend::*,
    platform::*,
    renderer::*,
};

pub use batch::*;
pub use camera::*;

// Re-export glam for convenience | 方便使用，重新导出 glam
pub use glam::{Vec2, Vec3, Vec4, Mat3, Mat4};
