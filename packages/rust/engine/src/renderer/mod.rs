//! 2D and 3D rendering system with batch optimization.
//! 带批处理优化的2D和3D渲染系统。

pub mod batch;
pub mod shader;
pub mod texture;
pub mod material;

mod renderer2d;
mod renderer3d;
mod camera;
mod camera3d;
mod grid;
mod grid3d;
mod gizmo;
mod gizmo3d;
mod viewport;

pub use renderer2d::Renderer2D;
pub use renderer3d::{Renderer3D, MeshSubmission};
pub use camera::Camera2D;
pub use camera3d::{Camera3D, ProjectionType, Ray3D};
pub use batch::{SpriteBatch, TextBatch, MeshBatch};
pub use batch::{Vertex3D, SimpleVertex3D, VERTEX3D_SIZE, FLOATS_PER_VERTEX_3D};
pub use texture::{Texture, TextureManager};
pub use grid::GridRenderer;
pub use grid3d::Grid3DRenderer;
pub use gizmo::{GizmoRenderer, TransformMode};
pub use gizmo3d::Gizmo3DRenderer;
pub use viewport::{RenderTarget, ViewportManager, ViewportConfig};
pub use shader::{ShaderManager, ShaderProgram, SHADER_ID_DEFAULT_SPRITE};
pub use shader::{
    MESH3D_VERTEX_SHADER, MESH3D_FRAGMENT_SHADER_UNLIT, MESH3D_FRAGMENT_SHADER_LIT,
    SIMPLE3D_VERTEX_SHADER, SIMPLE3D_FRAGMENT_SHADER,
    GRID3D_VERTEX_SHADER, GRID3D_FRAGMENT_SHADER,
};
pub use material::{Material, MaterialManager, BlendMode, CullMode, UniformValue, MaterialUniforms};
