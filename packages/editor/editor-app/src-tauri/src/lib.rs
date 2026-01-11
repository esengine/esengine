//! ECS Editor Library
//!
//! Exports all public modules for the Tauri application.

pub mod commands;
pub mod egui_editor;
pub mod profiler_ws;
pub mod state;
pub mod theme_egui;
pub mod theme_showcase;
pub mod theme_tokens;

// Re-export commonly used types
pub use state::{ProfilerState, ProjectPaths};

// Re-export egui editor
pub use egui_editor::{
    run_editor,
    run_editor_with_ccesengine,
    run_editor_with_webview,
    EditorApp,
    EditorState,
};
