//! 图形后端实现
//!
//! Graphics backend implementations.
//!
//! 本模块提供 `GraphicsBackend` trait 的具体实现。
//! This module provides concrete implementations of the `GraphicsBackend` trait.

mod webgl2;

pub use webgl2::WebGL2Backend;
