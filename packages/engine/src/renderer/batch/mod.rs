//! Batch rendering system.
//! 批处理渲染系统。

mod sprite_batch;
mod text_batch;
mod mesh_batch;
mod vertex;
mod vertex3d;

pub use sprite_batch::{BatchKey, SpriteBatch};
pub use text_batch::TextBatch;
pub use mesh_batch::MeshBatch;
pub use vertex::{SpriteVertex, VERTEX_SIZE};
pub use vertex3d::{
    Vertex3D, SimpleVertex3D,
    VERTEX3D_SIZE, SIMPLE_VERTEX3D_SIZE,
    FLOATS_PER_VERTEX_3D, FLOATS_PER_SIMPLE_VERTEX_3D,
};
