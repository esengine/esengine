//! Shader management system.
//! Shader管理系统。

mod program;
mod builtin;
mod manager;

pub use program::ShaderProgram;
pub use builtin::{
    // 2D shaders | 2D着色器
    SPRITE_VERTEX_SHADER, SPRITE_FRAGMENT_SHADER,
    MSDF_TEXT_VERTEX_SHADER, MSDF_TEXT_FRAGMENT_SHADER,
    // 3D shaders | 3D着色器
    MESH3D_VERTEX_SHADER, MESH3D_FRAGMENT_SHADER_UNLIT, MESH3D_FRAGMENT_SHADER_LIT,
    SIMPLE3D_VERTEX_SHADER, SIMPLE3D_FRAGMENT_SHADER,
    GRID3D_VERTEX_SHADER, GRID3D_FRAGMENT_SHADER,
};
pub use manager::{ShaderManager, SHADER_ID_DEFAULT_SPRITE};
