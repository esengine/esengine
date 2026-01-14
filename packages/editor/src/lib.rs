//! ECS Editor Library
//!
//! Native desktop editor using egui + WebView.

pub mod egui_editor;
pub mod theme_egui;
pub mod theme_showcase;
pub mod theme_tokens;

// Re-export egui editor
pub use egui_editor::{
    run_editor,
    run_editor_with_ccesengine,
    run_editor_with_mcp,
    run_editor_with_webview,
    find_cces_cli_path,
    EditorApp,
    EditorState,
};
