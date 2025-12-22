//! Batch rendering system.
//! 批处理渲染系统。

mod sprite_batch;
mod text_batch;
mod mesh_batch;
mod vertex;

pub use sprite_batch::{BatchKey, SpriteBatch};
pub use text_batch::TextBatch;
pub use mesh_batch::MeshBatch;
pub use vertex::{SpriteVertex, VERTEX_SIZE};
