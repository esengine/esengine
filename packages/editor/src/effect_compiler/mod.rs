//! @zh Effect 编译器模块
//! @en Effect compiler module
//!
//! 将 .effect 文件编译为 ccesengine 可用的格式。
//! Compiles .effect files into a format usable by ccesengine.

mod mappings;
mod parser;
mod types;

pub use parser::EffectCompiler;
pub use types::*;
