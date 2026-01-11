//! ESEngine Editor - egui 编辑器入口点
//! ESEngine Editor - egui editor entry point
//!
//! 纯 Rust egui 编辑器，不需要外部前端服务器。
//! Pure Rust egui editor, no external frontend server required.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Run the egui editor with embedded ccesengine
    // 运行嵌入式 ccesengine 的 egui 编辑器
    if let Err(e) = ecs_editor_lib::run_editor_with_ccesengine() {
        eprintln!("Editor error: {}", e);
        std::process::exit(1);
    }
}
