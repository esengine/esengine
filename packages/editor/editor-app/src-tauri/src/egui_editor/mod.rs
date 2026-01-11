//! @zh egui 编辑器模块
//! @en egui editor module
//!
//! 使用 egui 实现的编辑器界面，基于 design-tokens.json 样式。
//! Editor interface implemented with egui, based on design-tokens.json styles.

pub mod animation;
pub mod colors;
pub mod icons;
pub mod panels;
pub mod state;
pub mod webview;
pub mod widgets;

use eframe::egui;
use raw_window_handle::HasWindowHandle;
use std::path::Path;

use crate::commands::effect_compiler::EffectCompiler;
use crate::theme_egui::build_egui_theme;
use crate::theme_tokens::ThemeTokens;

pub use animation::AnimationState;
pub use colors::{css_color, ThemeColors};
pub use icons::Icons;
pub use panels::WebViewViewportConfig;
pub use state::*;
pub use webview::{protocol, webview_viewport_area, WebViewViewport};

// ============================================================================
// Editor Application
// ============================================================================

/// @zh 编辑器应用
/// @en Editor application
pub struct EditorApp {
    pub state: EditorState,
    /// @zh WebView2 视口（用于渲染 ccesengine）
    /// @en WebView2 viewport (for rendering ccesengine)
    pub webview_viewport: Option<WebViewViewport>,
    /// @zh 是否使用 WebView 渲染视口
    /// @en Whether to use WebView for viewport rendering
    pub use_webview: bool,
    /// @zh WebView 是否已初始化
    /// @en Whether WebView has been initialized
    webview_initialized: bool,
}

impl EditorApp {
    /// @zh 创建新的编辑器应用
    /// @en Create a new editor application
    pub fn new(tokens: ThemeTokens) -> Self {
        Self {
            state: EditorState::new(tokens),
            webview_viewport: None,
            use_webview: false,
            webview_initialized: false,
        }
    }

    /// @zh 创建启用 WebView 的编辑器应用
    /// @en Create editor application with WebView enabled
    pub fn with_webview(tokens: ThemeTokens, url: impl Into<String>) -> Self {
        Self {
            state: EditorState::new(tokens),
            webview_viewport: Some(WebViewViewport::new(url)),
            use_webview: true,
            webview_initialized: false,
        }
    }

    /// @zh 创建嵌入式 ccesengine 编辑器应用（使用默认路径）
    /// @en Create embedded ccesengine editor application (using default path)
    ///
    /// @zh 使用嵌入的 HTML 和自定义协议从本地文件系统加载 ccesengine 模块。
    /// @en Uses embedded HTML and custom protocol to load ccesengine modules from local filesystem.
    pub fn with_ccesengine(tokens: ThemeTokens) -> Self {
        let assets_path = crate::egui_editor::find_ccesengine_assets_path();
        Self {
            state: EditorState::new(tokens),
            webview_viewport: Some(WebViewViewport::with_embedded_ccesengine(assets_path)),
            use_webview: true,
            webview_initialized: false,
        }
    }

    /// @zh 创建连接 ccesengine 的编辑器应用（自定义服务器地址）
    /// @en Create editor application connected to ccesengine (custom server address)
    #[allow(dead_code)]
    pub fn with_ccesengine_server(tokens: ThemeTokens, vite_server: impl Into<String>) -> Self {
        Self {
            state: EditorState::new(tokens),
            webview_viewport: Some(WebViewViewport::new(vite_server)),
            use_webview: true,
            webview_initialized: false,
        }
    }

    /// @zh 创建嵌入式 ccesengine 编辑器应用
    /// @en Create embedded ccesengine editor application
    ///
    /// @zh 使用嵌入的 HTML 和自定义协议从本地文件系统加载 ccesengine 模块。
    /// @zh 不需要外部 Vite 服务器。
    /// @en Uses embedded HTML and custom protocol to load ccesengine modules from local filesystem.
    /// @en No external Vite server required.
    ///
    /// # Arguments
    /// * `assets_path` - ccesengine 资源目录路径（包含 ccesengine/ 子目录）
    pub fn with_embedded_ccesengine(tokens: ThemeTokens, assets_path: impl Into<std::path::PathBuf>) -> Self {
        Self {
            state: EditorState::new(tokens),
            webview_viewport: Some(WebViewViewport::with_embedded_ccesengine(assets_path)),
            use_webview: true,
            webview_initialized: false,
        }
    }

    /// @zh 获取主题颜色访问器
    /// @en Get theme colors accessor
    pub fn colors(&self) -> ThemeColors<'_> {
        ThemeColors::new(&self.state.tokens)
    }

    /// @zh 初始化 WebView（需要窗口句柄和边界）
    /// @en Initialize WebView (requires window handle and bounds)
    #[cfg(target_os = "windows")]
    fn initialize_webview(&mut self, frame: &eframe::Frame, bounds: egui::Rect) {
        if self.webview_initialized || !self.use_webview {
            return;
        }

        // Skip if bounds are invalid
        if bounds.width() < 10.0 || bounds.height() < 10.0 {
            return;
        }

        if let Some(ref mut viewport) = self.webview_viewport {
            if let Ok(handle) = frame.window_handle() {
                viewport.initialize(handle.as_raw(), bounds);
                if viewport.is_ready() {
                    self.webview_initialized = true;
                    println!("[WebView] Initialized successfully at {:?}", bounds);

                    // Compile and inject builtin effects for ccesengine
                    self.inject_builtin_effects();
                }
            }
        }
    }

    /// @zh 编译并注入内置 effects 到 WebView
    /// @en Compile and inject builtin effects into WebView
    fn inject_builtin_effects(&self) {
        // Get engine path relative to the project root
        // In development, the engine is at ../../engine relative to src-tauri
        let engine_path = std::env::current_dir()
            .map(|p| p.join("../../engine"))
            .unwrap_or_else(|_| Path::new("../../engine").to_path_buf());

        // Also try absolute path if relative doesn't work
        let engine_path = if engine_path.exists() {
            engine_path
        } else {
            // Try from workspace root
            Path::new("E:/ecs-framework/engine").to_path_buf()
        };

        if !engine_path.exists() {
            println!("[WebView] Warning: Engine path not found at {:?}", engine_path);
            return;
        }

        println!("[WebView] Compiling builtin effects from {:?}", engine_path);

        let mut compiler = EffectCompiler::new(&engine_path);

        // List of builtin effects needed for editor
        let builtin_effects = [
            "editor/assets/effects/for2d/builtin-sprite.effect",
            "editor/assets/effects/internal/builtin-graphics.effect",
            "editor/assets/effects/internal/builtin-clear-stencil.effect",
            "editor/assets/effects/internal/builtin-geometry-renderer.effect", // For GeometryRenderer (3D lines/gizmos)
            "editor/assets/effects/builtin-unlit.effect",
        ];

        let mut compiled_effects = Vec::new();
        for effect_rel_path in builtin_effects {
            let effect_path = engine_path.join(effect_rel_path);
            if effect_path.exists() {
                match compiler.compile(&effect_path) {
                    Ok(compiled) => {
                        println!("[WebView] Compiled effect: {}", compiled.name);
                        compiled_effects.push(compiled);
                    }
                    Err(e) => {
                        println!("[WebView] Warning: Failed to compile {}: {}", effect_rel_path, e);
                    }
                }
            } else {
                println!("[WebView] Warning: Effect file not found: {:?}", effect_path);
            }
        }

        if compiled_effects.is_empty() {
            println!("[WebView] Warning: No effects were compiled");
            return;
        }

        // Serialize to JSON and inject into WebView
        match serde_json::to_string(&compiled_effects) {
            Ok(effects_json) => {
                if let Some(ref viewport) = self.webview_viewport {
                    match viewport.inject_effects(&effects_json) {
                        Ok(_) => {
                            println!("[WebView] Injected {} builtin effects", compiled_effects.len());
                        }
                        Err(e) => {
                            println!("[WebView] Warning: Failed to inject effects: {}", e);
                        }
                    }
                }
            }
            Err(e) => {
                println!("[WebView] Warning: Failed to serialize effects: {}", e);
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    fn initialize_webview(&mut self, _frame: &eframe::Frame, _bounds: egui::Rect) {
        // WebView2 only supported on Windows
    }
}

impl eframe::App for EditorApp {
    fn update(&mut self, ctx: &egui::Context, frame: &mut eframe::Frame) {
        // Apply style settings
        ctx.style_mut(|style| {
            style.spacing.item_spacing = egui::vec2(4.0, 2.0);
            style.spacing.window_margin = egui::Margin::same(0.0);
            style.spacing.button_padding = egui::vec2(8.0, 4.0);
            style.spacing.indent = 14.0;
            style.text_styles.insert(egui::TextStyle::Body, egui::FontId::proportional(13.0));
            style.text_styles.insert(egui::TextStyle::Small, egui::FontId::proportional(11.0));
            style.text_styles.insert(egui::TextStyle::Button, egui::FontId::proportional(12.0));
            style.text_styles.insert(egui::TextStyle::Heading, egui::FontId::proportional(16.0));
        });

        // Blur WebView when any egui widget wants keyboard focus
        // This fixes the issue where WebView2 captures all keyboard input
        if self.use_webview {
            let wants_input = ctx.wants_keyboard_input();
            if wants_input {
                if let Some(ref viewport) = self.webview_viewport {
                    viewport.blur();
                }
            }
        }

        // Handle keyboard shortcuts
        self.handle_keyboard_shortcuts(ctx);

        // Render UI
        self.custom_title_bar(ctx);
        self.main_toolbar(ctx);
        self.status_bar(ctx);

        if self.state.drawer.content_open {
            self.content_browser_drawer(ctx);
        } else if self.state.drawer.output_open {
            self.output_drawer(ctx);
        }

        self.main_content(ctx, frame);

        // Render overlays (menus, etc.)
        if let Some(menu) = self.state.active_menu {
            self.render_menu_dropdown(ctx, menu);
        }

        if self.state.context_menu_open.is_some() {
            self.render_context_menu(ctx);
        }
    }
}

impl EditorApp {
    /// @zh 处理键盘快捷键
    /// @en Handle keyboard shortcuts
    fn handle_keyboard_shortcuts(&mut self, ctx: &egui::Context) {
        ctx.input(|i| {
            if !i.focused {
                // Tool shortcuts (Q/W/E/R)
                if i.key_pressed(egui::Key::Q) {
                    self.state.active_tool = Tool::Select;
                }
                if i.key_pressed(egui::Key::W) {
                    self.state.active_tool = Tool::Move;
                }
                if i.key_pressed(egui::Key::E) {
                    self.state.active_tool = Tool::Rotate;
                }
                if i.key_pressed(egui::Key::R) {
                    self.state.active_tool = Tool::Scale;
                }

                // X - Toggle transform space
                if i.key_pressed(egui::Key::X) {
                    self.state.transform_space = match self.state.transform_space {
                        TransformSpace::Local => TransformSpace::World,
                        TransformSpace::World => TransformSpace::Local,
                    };
                }

                // Z - Toggle pivot mode
                if i.key_pressed(egui::Key::Z) && !i.modifiers.ctrl {
                    self.state.pivot_mode = match self.state.pivot_mode {
                        PivotMode::Pivot => PivotMode::Center,
                        PivotMode::Center => PivotMode::Pivot,
                    };
                }

                // Delete - Delete selected
                if i.key_pressed(egui::Key::Delete) || i.key_pressed(egui::Key::Backspace) {
                    if self.state.selected_entity.is_some() {
                        self.state.selected_entity = None;
                    }
                }

                // Escape - Deselect / close menu
                if i.key_pressed(egui::Key::Escape) {
                    if self.state.active_menu.is_some() {
                        self.state.active_menu = None;
                    } else if self.state.inspector.color_picker_open.is_some() {
                        self.state.inspector.color_picker_open = None;
                    } else {
                        self.state.selected_entity = None;
                    }
                }

                // Space - Toggle play/pause
                if i.key_pressed(egui::Key::Space) {
                    if self.state.is_playing {
                        self.state.is_paused = !self.state.is_paused;
                    } else {
                        self.state.is_playing = true;
                        self.state.is_paused = false;
                    }
                }
            }

            // Ctrl shortcuts
            if i.modifiers.ctrl {
                if i.key_pressed(egui::Key::S) {
                    // TODO: Save
                }
                if i.key_pressed(egui::Key::Z) && !i.modifiers.shift {
                    // TODO: Undo
                }
                if (i.key_pressed(egui::Key::Z) && i.modifiers.shift) || i.key_pressed(egui::Key::Y) {
                    // TODO: Redo
                }
                if i.key_pressed(egui::Key::D) {
                    // TODO: Duplicate
                }
            }
        });
    }

    /// @zh 自定义标题栏
    /// @en Custom title bar
    fn custom_title_bar(&mut self, ctx: &egui::Context) {
        let height = 32.0;
        egui::TopBottomPanel::top("custom_titlebar")
            .exact_height(height)
            .frame(egui::Frame::none())
            .show(ctx, |ui| {
                let full_rect = ui.max_rect();

                // Background gradient
                for i in 0..32 {
                    let t = i as f32 / 31.0;
                    let r = ((0x3a as f32) * (1.0 - t) + (0x2d as f32) * t) as u8;
                    let g = ((0x3a as f32) * (1.0 - t) + (0x2d as f32) * t) as u8;
                    let b = ((0x3f as f32) * (1.0 - t) + (0x32 as f32) * t) as u8;
                    let line_rect = egui::Rect::from_min_size(
                        egui::pos2(full_rect.left(), full_rect.top() + i as f32),
                        egui::vec2(full_rect.width(), 1.0),
                    );
                    ui.painter().rect_filled(line_rect, 0.0, egui::Color32::from_rgb(r, g, b));
                }

                // Border bottom
                ui.painter().line_segment(
                    [egui::pos2(full_rect.left(), full_rect.bottom()), egui::pos2(full_rect.right(), full_rect.bottom())],
                    egui::Stroke::new(1.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1d)),
                );

                // Logo
                let mut left_x = full_rect.left();
                let logo_rect = egui::Rect::from_min_size(egui::pos2(left_x, full_rect.top()), egui::vec2(40.0, height));
                ui.painter().rect_filled(logo_rect, 0.0, egui::Color32::from_rgba_unmultiplied(0, 0, 0, 51));
                ui.painter().line_segment(
                    [egui::pos2(logo_rect.right(), logo_rect.top()), egui::pos2(logo_rect.right(), logo_rect.bottom())],
                    egui::Stroke::new(1.0, egui::Color32::from_rgba_unmultiplied(255, 255, 255, 13)),
                );
                ui.painter().text(
                    logo_rect.center(),
                    egui::Align2::CENTER_CENTER,
                    "ES",
                    egui::FontId::proportional(14.0),
                    egui::Color32::from_rgb(0x4a, 0x9e, 0xff),
                );
                left_x += 40.0;

                // Menu buttons
                for menu in ["File", "Edit", "View", "Help"] {
                    let text_width = 40.0;
                    let menu_rect = egui::Rect::from_min_size(egui::pos2(left_x, full_rect.top()), egui::vec2(text_width, height));
                    let menu_resp = ui.interact(menu_rect, egui::Id::new(format!("menu_{}", menu)), egui::Sense::click());

                    let is_active = self.state.active_menu == Some(menu);
                    if menu_resp.hovered() || is_active {
                        ui.painter().rect_filled(menu_rect, 0.0, egui::Color32::from_rgba_unmultiplied(255, 255, 255, if is_active { 20 } else { 15 }));
                    }
                    let text_color = if menu_resp.hovered() || is_active {
                        egui::Color32::from_rgb(0xd0, 0xd0, 0xd0)
                    } else {
                        egui::Color32::from_rgb(0xa0, 0xa0, 0xa0)
                    };
                    ui.painter().text(menu_rect.center(), egui::Align2::CENTER_CENTER, menu, egui::FontId::proportional(12.0), text_color);

                    if menu_resp.clicked() {
                        self.state.active_menu = if is_active { None } else { Some(menu) };
                    }
                    left_x += text_width;
                }

                // Window controls
                let btn_width = 46.0;
                let right_start = full_rect.right() - btn_width * 3.0;

                // Minimize
                let min_rect = egui::Rect::from_min_size(egui::pos2(right_start, full_rect.top()), egui::vec2(btn_width, height));
                let min_resp = ui.interact(min_rect, egui::Id::new("btn_min"), egui::Sense::click());
                if min_resp.hovered() {
                    ui.painter().rect_filled(min_rect, 0.0, egui::Color32::from_rgba_unmultiplied(255, 255, 255, 26));
                }
                let icon_color = if min_resp.hovered() { egui::Color32::WHITE } else { egui::Color32::from_rgb(0x80, 0x80, 0x80) };
                ui.painter().line_segment(
                    [egui::pos2(min_rect.center().x - 5.0, min_rect.center().y), egui::pos2(min_rect.center().x + 5.0, min_rect.center().y)],
                    egui::Stroke::new(1.0, icon_color),
                );
                if min_resp.clicked() {
                    ctx.send_viewport_cmd(egui::ViewportCommand::Minimized(true));
                }

                // Maximize
                let max_rect = egui::Rect::from_min_size(egui::pos2(right_start + btn_width, full_rect.top()), egui::vec2(btn_width, height));
                let max_resp = ui.interact(max_rect, egui::Id::new("btn_max"), egui::Sense::click());
                if max_resp.hovered() {
                    ui.painter().rect_filled(max_rect, 0.0, egui::Color32::from_rgba_unmultiplied(255, 255, 255, 26));
                }
                let icon_color = if max_resp.hovered() { egui::Color32::WHITE } else { egui::Color32::from_rgb(0x80, 0x80, 0x80) };
                ui.painter().rect_stroke(
                    egui::Rect::from_center_size(max_rect.center(), egui::vec2(9.0, 9.0)),
                    0.0,
                    egui::Stroke::new(1.0, icon_color),
                );
                if max_resp.clicked() {
                    ctx.send_viewport_cmd(egui::ViewportCommand::Maximized(true));
                }

                // Close
                let close_rect = egui::Rect::from_min_size(egui::pos2(right_start + btn_width * 2.0, full_rect.top()), egui::vec2(btn_width, height));
                let close_resp = ui.interact(close_rect, egui::Id::new("btn_close"), egui::Sense::click());
                if close_resp.hovered() {
                    ui.painter().rect_filled(close_rect, 0.0, egui::Color32::from_rgb(0xe8, 0x11, 0x23));
                }
                let icon_color = if close_resp.hovered() { egui::Color32::WHITE } else { egui::Color32::from_rgb(0x80, 0x80, 0x80) };
                let cx = close_rect.center();
                ui.painter().line_segment([egui::pos2(cx.x - 4.0, cx.y - 4.0), egui::pos2(cx.x + 4.0, cx.y + 4.0)], egui::Stroke::new(1.2, icon_color));
                ui.painter().line_segment([egui::pos2(cx.x + 4.0, cx.y - 4.0), egui::pos2(cx.x - 4.0, cx.y + 4.0)], egui::Stroke::new(1.2, icon_color));
                if close_resp.clicked() {
                    ctx.send_viewport_cmd(egui::ViewportCommand::Close);
                }

                // Title and drag area
                let center_rect = egui::Rect::from_min_max(egui::pos2(left_x, full_rect.top()), egui::pos2(right_start, full_rect.bottom()));
                let title = if let Some(ref path) = self.state.project_path {
                    format!("ESEngine Editor - {}", path.file_name().unwrap_or_default().to_string_lossy())
                } else {
                    "ESEngine Editor".to_string()
                };
                ui.painter().text(center_rect.center(), egui::Align2::CENTER_CENTER, &title, egui::FontId::proportional(12.0), egui::Color32::from_rgb(0xb0, 0xb0, 0xb0));

                let drag_resp = ui.interact(center_rect, egui::Id::new("title_drag"), egui::Sense::click_and_drag());
                if drag_resp.drag_started() {
                    ctx.send_viewport_cmd(egui::ViewportCommand::StartDrag);
                }
                if drag_resp.double_clicked() {
                    ctx.send_viewport_cmd(egui::ViewportCommand::Maximized(true));
                }
            });
    }

    /// @zh 主工具栏
    /// @en Main toolbar
    fn main_toolbar(&mut self, ctx: &egui::Context) {
        let height = 36.0;
        egui::TopBottomPanel::top("main_toolbar")
            .exact_height(height)
            .frame(egui::Frame::none())
            .show(ctx, |ui| {
                let full_rect = ui.max_rect();

                // Background #2d2d30 with bottom border
                ui.painter().rect_filled(full_rect, 0.0, egui::Color32::from_rgb(0x2d, 0x2d, 0x30));
                ui.painter().line_segment(
                    [egui::pos2(full_rect.left(), full_rect.bottom()), egui::pos2(full_rect.right(), full_rect.bottom())],
                    egui::Stroke::new(1.0, egui::Color32::from_rgb(0x3e, 0x3e, 0x42))
                );

                let btn_size = egui::vec2(28.0, 28.0);
                let y_center = full_rect.center().y;
                let mut x = full_rect.left() + 8.0;

                // === LEFT: File operations ===
                x = self.draw_toolbar_icon(ui, x, y_center, btn_size, "save", "Save (Ctrl+S)");
                x = self.draw_toolbar_icon(ui, x, y_center, btn_size, "undo", "Undo (Ctrl+Z)");
                x = self.draw_toolbar_icon(ui, x, y_center, btn_size, "redo", "Redo (Ctrl+Y)");

                // Separator
                x += 4.0;
                ui.painter().line_segment([egui::pos2(x, full_rect.top() + 6.0), egui::pos2(x, full_rect.bottom() - 6.0)], egui::Stroke::new(1.0, egui::Color32::from_rgb(0x3e, 0x3e, 0x42)));
                x += 8.0;

                // === Transform tools ===
                let select_active = self.state.active_tool == Tool::Select;
                let move_active = self.state.active_tool == Tool::Move;
                let rotate_active = self.state.active_tool == Tool::Rotate;
                let scale_active = self.state.active_tool == Tool::Scale;

                if self.draw_toolbar_icon_active(ui, x, y_center, btn_size, "mouse-pointer", "Select (Q)", select_active) { self.state.active_tool = Tool::Select; }
                x += btn_size.x + 2.0;
                if self.draw_toolbar_icon_active(ui, x, y_center, btn_size, "move", "Move (W)", move_active) { self.state.active_tool = Tool::Move; }
                x += btn_size.x + 2.0;
                if self.draw_toolbar_icon_active(ui, x, y_center, btn_size, "rotate-cw", "Rotate (E)", rotate_active) { self.state.active_tool = Tool::Rotate; }
                x += btn_size.x + 2.0;
                if self.draw_toolbar_icon_active(ui, x, y_center, btn_size, "maximize", "Scale (R)", scale_active) { self.state.active_tool = Tool::Scale; }
                x += btn_size.x + 4.0;

                // Separator
                ui.painter().line_segment([egui::pos2(x, full_rect.top() + 6.0), egui::pos2(x, full_rect.bottom() - 6.0)], egui::Stroke::new(1.0, egui::Color32::from_rgb(0x3e, 0x3e, 0x42)));
                x += 8.0;

                // Transform space button (Local/World) - icon + text
                let space_icon = if self.state.transform_space == TransformSpace::Local { "crosshair" } else { "globe" };
                let space_text = if self.state.transform_space == TransformSpace::Local { "Local" } else { "World" };
                let (space_clicked, space_width) = self.draw_toolbar_icon_text_btn(ui, x, y_center, space_icon, space_text, "Toggle Transform Space");
                if space_clicked {
                    self.state.transform_space = match self.state.transform_space {
                        TransformSpace::Local => TransformSpace::World,
                        TransformSpace::World => TransformSpace::Local,
                    };
                }
                x += space_width + 4.0;

                // Pivot mode button (Pivot/Center) - icon + text
                let pivot_icon = if self.state.pivot_mode == PivotMode::Pivot { "pivot" } else { "target" };
                let pivot_text = if self.state.pivot_mode == PivotMode::Pivot { "Pivot" } else { "Center" };
                let (pivot_clicked, _pivot_width) = self.draw_toolbar_icon_text_btn(ui, x, y_center, pivot_icon, pivot_text, "Toggle Pivot Mode");
                if pivot_clicked {
                    self.state.pivot_mode = match self.state.pivot_mode {
                        PivotMode::Pivot => PivotMode::Center,
                        PivotMode::Center => PivotMode::Pivot,
                    };
                }

                // === CENTER: Play controls ===
                let center_x = full_rect.center().x;
                let play_btn_size = egui::vec2(32.0, 28.0);
                let play_x = center_x - play_btn_size.x - 2.0;

                // Play/Stop button (toggle)
                let play_rect = egui::Rect::from_center_size(egui::pos2(play_x, y_center), play_btn_size);
                let play_resp = ui.interact(play_rect, egui::Id::new("play_btn"), egui::Sense::click());
                if play_resp.hovered() {
                    ui.painter().rect_filled(play_rect, 3.0, egui::Color32::from_rgba_unmultiplied(255, 255, 255, 20));
                }
                if self.state.is_playing {
                    // Show stop icon (square) - red when playing
                    Icons::draw(ui.painter(), play_rect.center(), 14.0, "square", egui::Color32::from_rgb(0xef, 0x44, 0x44));
                } else {
                    // Show play icon - green
                    Icons::draw(ui.painter(), play_rect.center(), 14.0, "play", egui::Color32::from_rgb(0x4a, 0xde, 0x80));
                }
                if play_resp.clicked() {
                    if self.state.is_playing {
                        self.state.is_playing = false;
                        self.state.is_paused = false;
                    } else {
                        self.state.is_playing = true;
                        self.state.is_paused = false;
                    }
                }

                // Pause button (only when playing)
                if self.state.is_playing {
                    let pause_rect = egui::Rect::from_center_size(egui::pos2(center_x + play_btn_size.x + 2.0, y_center), play_btn_size);
                    let pause_resp = ui.interact(pause_rect, egui::Id::new("pause_btn"), egui::Sense::click());
                    if pause_resp.hovered() || self.state.is_paused {
                        ui.painter().rect_filled(pause_rect, 3.0, egui::Color32::from_rgba_unmultiplied(255, 255, 255, if self.state.is_paused { 30 } else { 20 }));
                    }
                    let pause_color = if self.state.is_paused { egui::Color32::from_rgb(0xfb, 0xbf, 0x24) } else { egui::Color32::from_rgb(0xcc, 0xcc, 0xcc) };
                    Icons::draw(ui.painter(), pause_rect.center(), 14.0, "pause", pause_color);
                    if pause_resp.clicked() {
                        self.state.is_paused = !self.state.is_paused;
                    }
                }

                // === RIGHT: View controls ===
                let right_x = full_rect.right() - 8.0;
                self.draw_toolbar_icon(ui, right_x - 28.0, y_center, btn_size, "maximize-2", "Maximize");
                self.draw_toolbar_icon(ui, right_x - 58.0, y_center, btn_size, "grid", "Toggle Grid");
                self.draw_toolbar_icon(ui, right_x - 88.0, y_center, btn_size, "rotate-ccw", "Reset Camera");
            });
    }

    fn draw_toolbar_icon(&self, ui: &mut egui::Ui, x: f32, y: f32, size: egui::Vec2, icon: &str, _tooltip: &str) -> f32 {
        let rect = egui::Rect::from_center_size(egui::pos2(x + size.x / 2.0, y), size);
        let resp = ui.interact(rect, egui::Id::new(format!("tb_{}", icon)), egui::Sense::click());
        if resp.hovered() {
            ui.painter().rect_filled(rect, 3.0, egui::Color32::from_rgba_unmultiplied(255, 255, 255, 20));
        }
        Icons::draw(ui.painter(), rect.center(), 14.0, icon, egui::Color32::from_rgb(0xcc, 0xcc, 0xcc));
        x + size.x + 2.0
    }

    fn draw_toolbar_icon_active(&self, ui: &mut egui::Ui, x: f32, y: f32, size: egui::Vec2, icon: &str, _tooltip: &str, active: bool) -> bool {
        let rect = egui::Rect::from_center_size(egui::pos2(x + size.x / 2.0, y), size);
        let resp = ui.interact(rect, egui::Id::new(format!("tb_{}", icon)), egui::Sense::click());
        if active {
            ui.painter().rect_filled(rect, 3.0, egui::Color32::from_rgb(0x3b, 0x82, 0xf6));
        } else if resp.hovered() {
            ui.painter().rect_filled(rect, 3.0, egui::Color32::from_rgba_unmultiplied(255, 255, 255, 20));
        }
        let color = if active { egui::Color32::WHITE } else { egui::Color32::from_rgb(0xcc, 0xcc, 0xcc) };
        Icons::draw(ui.painter(), rect.center(), 14.0, icon, color);
        resp.clicked()
    }

    /// @zh 绘制带图标和文字的工具栏按钮，返回(是否点击, 按钮宽度)
    /// @en Draw toolbar button with icon and text, returns (clicked, button_width)
    fn draw_toolbar_icon_text_btn(&self, ui: &mut egui::Ui, x: f32, y: f32, icon: &str, text: &str, _tooltip: &str) -> (bool, f32) {
        // Calculate button width based on text length
        let text_width = text.len() as f32 * 6.5;
        let btn_width = (24.0 + text_width + 16.0).max(60.0);

        let rect = egui::Rect::from_min_size(egui::pos2(x, y - 12.0), egui::vec2(btn_width, 24.0));
        let resp = ui.interact(rect, egui::Id::new(format!("tb_it_{}", text)), egui::Sense::click());
        if resp.hovered() {
            ui.painter().rect_filled(rect, 3.0, egui::Color32::from_rgba_unmultiplied(255, 255, 255, 15));
        }
        ui.painter().rect_stroke(rect, 3.0, egui::Stroke::new(1.0, egui::Color32::from_rgb(0x3e, 0x3e, 0x42)));
        // Icon on left
        Icons::draw(ui.painter(), egui::pos2(rect.left() + 12.0, rect.center().y), 12.0, icon, egui::Color32::from_rgb(0xaa, 0xaa, 0xaa));
        // Text on right
        ui.painter().text(egui::pos2(rect.left() + 26.0, rect.center().y), egui::Align2::LEFT_CENTER, text, egui::FontId::proportional(11.0), egui::Color32::from_rgb(0xaa, 0xaa, 0xaa));
        (resp.clicked(), btn_width)
    }

    /// @zh 状态栏
    /// @en Status bar
    fn status_bar(&mut self, ctx: &egui::Context) {
        egui::TopBottomPanel::bottom("statusbar")
            .exact_height(24.0)
            .frame(egui::Frame::none()
                .fill(egui::Color32::from_rgb(0x2d, 0x2d, 0x2d))
                .stroke(egui::Stroke::new(1.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a))))
            .show(ctx, |ui| {
                ui.horizontal_centered(|ui| {
                    // Content drawer toggle
                    let content_active = self.state.drawer.content_open;
                    let btn_rect = egui::Rect::from_min_size(ui.cursor().min, egui::vec2(100.0, 24.0));
                    let content_resp = ui.interact(btn_rect, egui::Id::new("content_toggle"), egui::Sense::click());

                    let bg = if content_active {
                        egui::Color32::from_rgb(0x4a, 0x4a, 0x4a)
                    } else if content_resp.hovered() {
                        egui::Color32::from_rgb(0x44, 0x44, 0x44)
                    } else {
                        egui::Color32::from_rgb(0x3a, 0x3a, 0x3a)
                    };
                    ui.painter().rect_filled(btn_rect, 0.0, bg);
                    ui.painter().line_segment(
                        [egui::pos2(btn_rect.right(), btn_rect.top()), egui::pos2(btn_rect.right(), btn_rect.bottom())],
                        egui::Stroke::new(1.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a))
                    );
                    if content_active {
                        ui.painter().line_segment(
                            [egui::pos2(btn_rect.left(), btn_rect.bottom() - 2.0), egui::pos2(btn_rect.right(), btn_rect.bottom() - 2.0)],
                            egui::Stroke::new(2.0, egui::Color32::from_rgb(0x00, 0x78, 0xd4))
                        );
                    }
                    let txt_color = if content_active { egui::Color32::WHITE } else { egui::Color32::from_rgb(0xcc, 0xcc, 0xcc) };
                    Icons::draw(ui.painter(), egui::pos2(btn_rect.left() + 16.0, btn_rect.center().y), 12.0, "folder", egui::Color32::from_rgb(0xdc, 0xb6, 0x7a));
                    ui.painter().text(egui::pos2(btn_rect.left() + 32.0, btn_rect.center().y), egui::Align2::LEFT_CENTER, "Content", egui::FontId::proportional(11.0), txt_color);
                    ui.allocate_rect(btn_rect, egui::Sense::hover());

                    if content_resp.clicked() {
                        self.state.drawer.content_open = !self.state.drawer.content_open;
                        if self.state.drawer.content_open { self.state.drawer.output_open = false; }
                    }

                    // Output toggle
                    let output_active = self.state.drawer.output_open;
                    let out_rect = egui::Rect::from_min_size(ui.cursor().min, egui::vec2(80.0, 24.0));
                    let out_resp = ui.interact(out_rect, egui::Id::new("output_toggle"), egui::Sense::click());
                    let out_bg = if output_active {
                        egui::Color32::from_rgb(0x4a, 0x4a, 0x4a)
                    } else if out_resp.hovered() {
                        egui::Color32::from_rgb(0x44, 0x44, 0x44)
                    } else {
                        egui::Color32::from_rgb(0x3a, 0x3a, 0x3a)
                    };
                    ui.painter().rect_filled(out_rect, 0.0, out_bg);
                    if output_active {
                        ui.painter().line_segment(
                            [egui::pos2(out_rect.left(), out_rect.bottom() - 2.0), egui::pos2(out_rect.right(), out_rect.bottom() - 2.0)],
                            egui::Stroke::new(2.0, egui::Color32::from_rgb(0x00, 0x78, 0xd4))
                        );
                    }
                    let out_txt = if output_active { egui::Color32::WHITE } else { egui::Color32::from_rgb(0xcc, 0xcc, 0xcc) };
                    Icons::draw(ui.painter(), egui::pos2(out_rect.left() + 14.0, out_rect.center().y), 12.0, "terminal", egui::Color32::from_rgb(0x88, 0x88, 0x88));
                    ui.painter().text(egui::pos2(out_rect.left() + 30.0, out_rect.center().y), egui::Align2::LEFT_CENTER, "Output", egui::FontId::proportional(11.0), out_txt);
                    ui.allocate_rect(out_rect, egui::Sense::hover());

                    if out_resp.clicked() {
                        self.state.drawer.output_open = !self.state.drawer.output_open;
                        if self.state.drawer.output_open { self.state.drawer.content_open = false; }
                    }

                    // Divider
                    ui.add_space(2.0);
                    let (div_rect, _) = ui.allocate_exact_size(egui::vec2(1.0, 14.0), egui::Sense::hover());
                    ui.painter().rect_filled(div_rect, 0.0, egui::Color32::from_rgb(0x44, 0x44, 0x44));
                    ui.add_space(2.0);

                    // Console input
                    ui.label(egui::RichText::new(">").color(egui::Color32::from_rgb(0x6a, 0x6a, 0x6a)).size(11.0));
                    let text_edit = egui::TextEdit::singleline(&mut self.state.command_input)
                        .desired_width(200.0)
                        .font(egui::FontId::proportional(10.0))
                        .hint_text(egui::RichText::new("Type command...").color(egui::Color32::from_rgb(0x55, 0x55, 0x55)))
                        .text_color(egui::Color32::from_rgb(0xcc, 0xcc, 0xcc))
                        .frame(true);
                    let cmd_response = ui.add(text_edit);
                    // Blur WebView when text input gains focus
                    if cmd_response.gained_focus() || cmd_response.clicked() {
                        if let Some(ref viewport) = self.webview_viewport {
                            viewport.blur();
                        }
                    }

                    // Right side - version
                    ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                        ui.add_space(8.0);
                        ui.label(egui::RichText::new("v0.1.0").color(egui::Color32::from_rgb(0x66, 0x66, 0x66)).size(10.0));
                    });
                });
            });
    }

    /// @zh 主内容区域
    /// @en Main content area
    fn main_content(&mut self, ctx: &egui::Context, frame: &eframe::Frame) {
        // Left panel (Hierarchy)
        egui::SidePanel::left("hierarchy_panel")
            .default_width(240.0)
            .min_width(180.0)
            .max_width(400.0)
            .frame(egui::Frame::none().fill(colors::ui::PANEL_BG))
            .show(ctx, |ui| {
                self.hierarchy_panel(ui);
            });

        // Right panel (Inspector)
        egui::SidePanel::right("inspector_panel")
            .default_width(280.0)
            .min_width(200.0)
            .max_width(500.0)
            .frame(egui::Frame::none().fill(colors::ui::PANEL_BG))
            .show(ctx, |ui| {
                self.inspector_panel(ui);
            });

        // Central panel (Viewport)
        let central_response = egui::CentralPanel::default()
            .frame(egui::Frame::none().fill(egui::Color32::from_rgb(0x1a, 0x1a, 0x1a)))
            .show(ctx, |ui| {
                // Get the viewport bounds for WebView initialization
                let viewport_bounds = ui.available_rect_before_wrap();

                if self.use_webview {
                    // Render WebView viewport
                    self.webview_viewport_panel(ui);
                } else {
                    // Render egui placeholder viewport
                    self.state.viewport_panel(ui);
                }

                viewport_bounds
            });

        // Initialize WebView with correct bounds if not yet initialized
        if self.use_webview && !self.webview_initialized {
            let bounds = central_response.inner;
            self.initialize_webview(frame, bounds);
        }
    }

    /// @zh WebView 视口面板
    /// @en WebView viewport panel
    fn webview_viewport_panel(&mut self, ui: &mut egui::Ui) {
        let panel_width = ui.available_width();

        // Tab bar (Scene/Game)
        let (tab_rect, _) = ui.allocate_exact_size(egui::vec2(panel_width, 24.0), egui::Sense::hover());
        ui.painter().rect_filled(tab_rect, 0.0, egui::Color32::from_rgb(0x2d, 0x2d, 0x30));
        ui.painter().line_segment(
            [egui::pos2(tab_rect.left(), tab_rect.bottom()), egui::pos2(tab_rect.right(), tab_rect.bottom())],
            egui::Stroke::new(1.0, egui::Color32::from_rgb(0x3c, 0x3c, 0x3c))
        );

        // Scene tab
        let scene_rect = egui::Rect::from_min_size(egui::pos2(tab_rect.left() + 4.0, tab_rect.top() + 2.0), egui::vec2(60.0, 20.0));
        ui.painter().rect_filled(scene_rect, 2.0, egui::Color32::from_rgb(0x3c, 0x3c, 0x3c));
        ui.painter().text(scene_rect.center(), egui::Align2::CENTER_CENTER, "Scene", egui::FontId::proportional(11.0), egui::Color32::WHITE);

        // Game tab
        let game_rect = egui::Rect::from_min_size(egui::pos2(scene_rect.right() + 4.0, tab_rect.top() + 2.0), egui::vec2(60.0, 20.0));
        ui.painter().text(game_rect.center(), egui::Align2::CENTER_CENTER, "Game", egui::FontId::proportional(11.0), egui::Color32::from_rgb(0x88, 0x88, 0x88));

        // Status info
        let status_text = if let Some(ref viewport) = self.webview_viewport {
            if viewport.is_ready() {
                "WebView Ready"
            } else if let Some(err) = viewport.error() {
                err
            } else {
                "Initializing..."
            }
        } else {
            "WebView not configured"
        };
        ui.painter().text(
            egui::pos2(tab_rect.right() - 8.0, tab_rect.center().y),
            egui::Align2::RIGHT_CENTER,
            status_text,
            egui::FontId::proportional(10.0),
            egui::Color32::from_rgb(0x66, 0x66, 0x66)
        );

        // WebView area
        if let Some(ref mut viewport) = self.webview_viewport {
            webview_viewport_area(ui, viewport);
        } else {
            // Fallback placeholder
            let available = ui.available_rect_before_wrap();
            ui.painter().rect_filled(available, 0.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a));
            ui.painter().text(
                available.center(),
                egui::Align2::CENTER_CENTER,
                "WebView not initialized",
                egui::FontId::proportional(14.0),
                egui::Color32::from_rgb(0x66, 0x66, 0x66)
            );
        }
    }

    /// @zh 层级面板
    /// @en Hierarchy panel
    fn hierarchy_panel(&mut self, ui: &mut egui::Ui) {
        let panel_width = ui.available_width();
        let panel_rect = ui.max_rect();
        ui.painter().rect_filled(panel_rect, 0.0, egui::Color32::from_rgb(0x2a, 0x2a, 0x2a));

        // Tab bar
        self.panel_tab_bar(ui, "Hierarchy");

        // Toolbar (search + add button)
        ui.horizontal(|ui| {
            ui.set_min_height(28.0);
            ui.set_max_height(28.0);
            ui.add_space(6.0);

            // Search box with icon
            let search_clicked = ui.horizontal(|ui| {
                let icon_rect = ui.allocate_exact_size(egui::vec2(20.0, 22.0), egui::Sense::hover()).0;
                Icons::draw(ui.painter(), icon_rect.center(), 12.0, "search", egui::Color32::from_rgb(0x60, 0x60, 0x60));

                let text_edit = egui::TextEdit::singleline(&mut self.state.hierarchy_search)
                    .desired_width(panel_width - 76.0)
                    .font(egui::FontId::proportional(11.0))
                    .hint_text(egui::RichText::new("Search...").color(egui::Color32::from_rgb(0x55, 0x55, 0x55)))
                    .text_color(egui::Color32::from_rgb(0xcc, 0xcc, 0xcc))
                    .frame(true);
                let response = ui.add(text_edit);
                response.gained_focus() || response.clicked()
            }).inner;
            // Blur WebView when search gains focus
            if search_clicked {
                if let Some(ref viewport) = self.webview_viewport {
                    viewport.blur();
                }
            }

            ui.add_space(4.0);

            // Add button
            let (add_rect, add_response) = ui.allocate_exact_size(egui::vec2(20.0, 20.0), egui::Sense::click());
            let add_color = if add_response.hovered() {
                egui::Color32::from_rgb(0x4a, 0x4a, 0x4a)
            } else {
                egui::Color32::from_rgb(0x3a, 0x3a, 0x3a)
            };
            ui.painter().rect_filled(add_rect, 2.0, add_color);
            ui.painter().rect_stroke(add_rect, 2.0, egui::Stroke::new(1.0, egui::Color32::from_rgb(0x4a, 0x4a, 0x4a)));
            Icons::draw(ui.painter(), add_rect.center(), 12.0, "plus", egui::Color32::from_rgb(0xcc, 0xcc, 0xcc));
        });

        // Header row
        let (header_rect, _) = ui.allocate_exact_size(egui::vec2(panel_width, 20.0), egui::Sense::hover());
        ui.painter().rect_filled(header_rect, 0.0, egui::Color32::from_rgb(0x33, 0x33, 0x33));
        ui.painter().line_segment([egui::pos2(header_rect.left(), header_rect.bottom()), egui::pos2(header_rect.right(), header_rect.bottom())], egui::Stroke::new(1.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a)));
        Icons::draw(ui.painter(), egui::pos2(header_rect.left() + 12.0, header_rect.center().y), 14.0, "eye", egui::Color32::from_rgb(0x66, 0x66, 0x66));
        ui.painter().line_segment([egui::pos2(header_rect.left() + 22.0, header_rect.top() + 4.0), egui::pos2(header_rect.left() + 22.0, header_rect.bottom() - 4.0)], egui::Stroke::new(1.0, egui::Color32::from_rgb(0x44, 0x44, 0x44)));
        ui.painter().text(egui::pos2(header_rect.left() + 28.0, header_rect.center().y), egui::Align2::LEFT_CENTER, "Name", egui::FontId::proportional(10.0), egui::Color32::from_rgb(0x99, 0x99, 0x99));
        ui.painter().text(egui::pos2(header_rect.right() - 40.0, header_rect.center().y), egui::Align2::CENTER_CENTER, "Type", egui::FontId::proportional(10.0), egui::Color32::from_rgb(0x99, 0x99, 0x99));

        // Scrollable content
        egui::ScrollArea::vertical()
            .id_source("hierarchy_scroll")
            .auto_shrink([false; 2])
            .show(ui, |ui| {
                if self.state.hierarchy_items.is_empty() {
                    ui.add_space(8.0);
                    ui.label(egui::RichText::new("  No scene loaded").size(11.0).color(egui::Color32::from_rgb(0x66, 0x66, 0x66)));
                } else {
                    let items = self.state.hierarchy_items.clone();
                    let mut selected = self.state.selected_entity;
                    let mut idx = 0usize;
                    for item in &items {
                        self.render_hierarchy_node(ui, item, 0, &mut idx, &mut selected, panel_width);
                    }
                    self.state.selected_entity = selected;
                }
            });
    }

    fn panel_tab_bar(&self, ui: &mut egui::Ui, title: &str) {
        let (tab_rect, _) = ui.allocate_exact_size(egui::vec2(ui.available_width(), 24.0), egui::Sense::hover());
        ui.painter().rect_filled(tab_rect, 0.0, egui::Color32::from_rgb(0x2d, 0x2d, 0x30));
        ui.painter().line_segment(
            [egui::pos2(tab_rect.left(), tab_rect.bottom()), egui::pos2(tab_rect.right(), tab_rect.bottom())],
            egui::Stroke::new(1.0, egui::Color32::from_rgb(0x3e, 0x3e, 0x42))
        );
        // Active tab
        let tab_inner = egui::Rect::from_min_size(tab_rect.min + egui::vec2(4.0, 2.0), egui::vec2(70.0, 20.0));
        ui.painter().rect_filled(tab_inner, 0.0, egui::Color32::from_rgb(0x2a, 0x2a, 0x2a));
        ui.painter().line_segment(
            [egui::pos2(tab_inner.left(), tab_inner.bottom()), egui::pos2(tab_inner.right(), tab_inner.bottom())],
            egui::Stroke::new(2.0, egui::Color32::from_rgb(0x4a, 0x9e, 0xff))
        );
        ui.painter().text(tab_inner.center(), egui::Align2::CENTER_CENTER, title, egui::FontId::proportional(11.0), egui::Color32::WHITE);
    }

    fn render_hierarchy_node(&self, ui: &mut egui::Ui, item: &HierarchyItem, depth: usize, idx: &mut usize, selected: &mut Option<usize>, panel_width: f32) {
        let current_idx = *idx;
        *idx += 1;
        let indent = 6.0 + depth as f32 * 14.0;
        let is_selected = *selected == Some(current_idx);
        let is_world = matches!(item.node_type, NodeType::World);
        let has_children = !item.children.is_empty();
        let row_height = 24.0;

        let (row_rect, response) = ui.allocate_exact_size(egui::vec2(panel_width, row_height), egui::Sense::click());

        // Background
        if is_world {
            ui.painter().rect_filled(row_rect, 0.0, egui::Color32::from_rgb(0x33, 0x33, 0x33));
            ui.painter().line_segment(
                [egui::pos2(row_rect.left(), row_rect.bottom()), egui::pos2(row_rect.right(), row_rect.bottom())],
                egui::Stroke::new(1.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a))
            );
        } else if is_selected {
            let bg = if response.hovered() { egui::Color32::from_rgb(0x4a, 0x6a, 0x90) } else { egui::Color32::from_rgb(0x3d, 0x5a, 0x80) };
            ui.painter().rect_filled(row_rect, 0.0, bg);
        } else if response.hovered() {
            ui.painter().rect_filled(row_rect, 0.0, egui::Color32::from_rgba_unmultiplied(255, 255, 255, 13));
        }

        let mut x = row_rect.left() + indent;
        let cy = row_rect.center().y;

        // Visibility icon
        let vis_icon = if item.visible { "eye" } else { "eye-off" };
        let vis_color = if item.visible { egui::Color32::from_rgb(0x88, 0x88, 0x88) } else { egui::Color32::from_rgb(0x55, 0x55, 0x55) };
        Icons::draw(ui.painter(), egui::pos2(x + 7.0, cy), 14.0, vis_icon, vis_color);
        x += 16.0;

        // Expand arrow
        if has_children {
            let arrow_icon = if item.expanded { "chevron-down" } else { "chevron-right" };
            Icons::draw(ui.painter(), egui::pos2(x + 6.0, cy), 12.0, arrow_icon, egui::Color32::from_rgb(0x88, 0x88, 0x88));
        }
        x += 16.0;

        // Type icon
        let (icon, icon_color) = match item.node_type {
            NodeType::World => ("globe", egui::Color32::from_rgb(0x4a, 0x9e, 0xff)),
            NodeType::Folder => ("folder", egui::Color32::from_rgb(0xdc, 0xb6, 0x7a)),
            NodeType::Camera => ("camera", egui::Color32::from_rgb(0x4a, 0x9e, 0xff)),
            NodeType::Light => ("sun", egui::Color32::from_rgb(0xff, 0xd7, 0x00)),
            NodeType::Script => ("file-code", egui::Color32::from_rgb(0x9c, 0xdc, 0xfe)),
            NodeType::Sprite => ("image", egui::Color32::from_rgb(0x4e, 0xc9, 0xb0)),
            NodeType::UI => ("layout-grid", egui::Color32::from_rgb(0xdc, 0xdc, 0xaa)),
        };
        Icons::draw(ui.painter(), egui::pos2(x + 7.0, cy), 14.0, icon, icon_color);
        x += 20.0;

        // Name
        let name_color = if is_selected { egui::Color32::WHITE } else { egui::Color32::from_rgb(0xe0, 0xe0, 0xe0) };
        ui.painter().text(egui::pos2(x, cy), egui::Align2::LEFT_CENTER, &item.name, egui::FontId::proportional(12.0), name_color);

        // Type label
        let type_str = match item.node_type {
            NodeType::World => "World", NodeType::Folder => "Folder", NodeType::Camera => "Camera",
            NodeType::Light => "Light", NodeType::Script => "Script", NodeType::Sprite => "Sprite", NodeType::UI => "UI",
        };
        ui.painter().text(egui::pos2(row_rect.right() - 8.0, cy), egui::Align2::RIGHT_CENTER, type_str, egui::FontId::proportional(11.0), egui::Color32::from_rgb(0x88, 0x88, 0x88));

        // Click to select
        if response.clicked() {
            *selected = Some(current_idx);
        }

        if item.expanded {
            for child in &item.children {
                self.render_hierarchy_node(ui, child, depth + 1, idx, selected, panel_width);
            }
        }
    }

    /// @zh 检视器面板
    /// @en Inspector panel
    fn inspector_panel(&mut self, ui: &mut egui::Ui) {
        let panel_width = ui.available_width();
        let panel_rect = ui.max_rect();
        ui.painter().rect_filled(panel_rect, 0.0, egui::Color32::from_rgb(0x25, 0x25, 0x25));

        self.panel_tab_bar(ui, "Inspector");

        // Header (lock + search icons)
        let (header_rect, _) = ui.allocate_exact_size(egui::vec2(panel_width, 28.0), egui::Sense::hover());
        ui.painter().rect_filled(header_rect, 0.0, egui::Color32::from_rgb(0x2c, 0x2c, 0x2c));
        ui.painter().line_segment([egui::pos2(header_rect.left(), header_rect.bottom()), egui::pos2(header_rect.right(), header_rect.bottom())], egui::Stroke::new(1.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a)));
        Icons::draw(ui.painter(), egui::pos2(header_rect.left() + 16.0, header_rect.center().y), 14.0, "lock", egui::Color32::from_rgb(0x66, 0x66, 0x66));
        Icons::draw(ui.painter(), egui::pos2(header_rect.left() + 36.0, header_rect.center().y), 14.0, "search", egui::Color32::from_rgb(0x60, 0x60, 0x60));

        // Empty state
        if self.state.selected_entity.is_none() {
            let empty_rect = ui.available_rect_before_wrap();
            ui.painter().rect_filled(empty_rect, 0.0, egui::Color32::from_rgb(0x25, 0x25, 0x25));
            let center = empty_rect.center();
            Icons::draw(ui.painter(), center - egui::vec2(0.0, 24.0), 48.0, "box", egui::Color32::from_rgb(0x40, 0x40, 0x40));
            ui.painter().text(center + egui::vec2(0.0, 16.0), egui::Align2::CENTER_CENTER, "No Entity Selected", egui::FontId::proportional(14.0), egui::Color32::from_rgb(0x80, 0x80, 0x80));
            ui.painter().text(center + egui::vec2(0.0, 36.0), egui::Align2::CENTER_CENTER, "Select an entity in the hierarchy", egui::FontId::proportional(12.0), egui::Color32::from_rgb(0x60, 0x60, 0x60));
            return;
        }

        egui::ScrollArea::vertical()
            .id_source("inspector_scroll")
            .auto_shrink([false; 2])
            .show(ui, |ui| {
                // Entity header
                let (entity_rect, _) = ui.allocate_exact_size(egui::vec2(panel_width, 32.0), egui::Sense::hover());
                Icons::draw(ui.painter(), egui::pos2(entity_rect.left() + 16.0, entity_rect.center().y), 14.0, "check", egui::Color32::from_rgb(0x4a, 0x9e, 0xff));
                Icons::draw(ui.painter(), egui::pos2(entity_rect.left() + 36.0, entity_rect.center().y), 16.0, "box", egui::Color32::from_rgb(0x88, 0x88, 0x88));
                ui.painter().text(egui::pos2(entity_rect.left() + 52.0, entity_rect.center().y), egui::Align2::LEFT_CENTER, "Player", egui::FontId::proportional(14.0), egui::Color32::from_rgb(0xe8, 0xe8, 0xe8));

                // Transform component
                self.draw_component_section(ui, "Transform", "move", 0, panel_width);

                // Sprite Renderer
                self.draw_component_section(ui, "Sprite Renderer", "image", 1, panel_width);

                // Script
                self.draw_component_section(ui, "PlayerController", "file-code", 2, panel_width);

                ui.add_space(16.0);

                // Add Component button
                let (btn_rect, btn_resp) = ui.allocate_exact_size(egui::vec2(panel_width - 16.0, 32.0), egui::Sense::click());
                let btn_rect = egui::Rect::from_min_size(egui::pos2(btn_rect.left() + 8.0, btn_rect.top()), egui::vec2(panel_width - 24.0, 32.0));
                let btn_color = if btn_resp.hovered() { egui::Color32::from_rgb(0x25, 0x63, 0xeb) } else { egui::Color32::from_rgb(0x3b, 0x82, 0xf6) };
                ui.painter().rect_filled(btn_rect, 4.0, btn_color);
                ui.painter().text(btn_rect.center(), egui::Align2::CENTER_CENTER, "+ Add Component", egui::FontId::proportional(12.0), egui::Color32::WHITE);
            });
    }

    fn draw_component_section(&mut self, ui: &mut egui::Ui, name: &str, icon: &str, comp_idx: usize, panel_width: f32) {
        let expanded = match comp_idx {
            0 => &mut self.state.inspector.transform_expanded,
            1 => &mut self.state.inspector.sprite_expanded,
            _ => &mut self.state.inspector.script_expanded,
        };

        // Header 28px
        let (header_rect, header_resp) = ui.allocate_exact_size(egui::vec2(panel_width, 28.0), egui::Sense::click());

        let bg_color = if header_resp.hovered() {
            egui::Color32::from_rgb(0x2a, 0x2d, 0x2e)
        } else {
            egui::Color32::from_rgb(0x25, 0x25, 0x26)
        };
        ui.painter().rect_filled(header_rect, 0.0, bg_color);
        ui.painter().line_segment(
            [egui::pos2(header_rect.left(), header_rect.bottom()), egui::pos2(header_rect.right(), header_rect.bottom())],
            egui::Stroke::new(1.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a))
        );

        if header_resp.clicked() {
            *expanded = !*expanded;
        }

        let cy = header_rect.center().y;
        let arrow_icon = if *expanded { "chevron-down" } else { "chevron-right" };
        Icons::draw(ui.painter(), egui::pos2(header_rect.left() + 14.0, cy), 10.0, arrow_icon, egui::Color32::from_rgb(0x6a, 0x6a, 0x6a));

        let icon_color = if header_resp.hovered() || *expanded { egui::Color32::from_rgb(0x00, 0x7a, 0xcc) } else { egui::Color32::from_rgb(0x9d, 0x9d, 0x9d) };
        Icons::draw(ui.painter(), egui::pos2(header_rect.left() + 30.0, cy), 12.0, icon, icon_color);

        let text_color = if header_resp.hovered() || *expanded { egui::Color32::from_rgb(0xcc, 0xcc, 0xcc) } else { egui::Color32::from_rgb(0x9d, 0x9d, 0x9d) };
        ui.painter().text(egui::pos2(header_rect.left() + 46.0, cy), egui::Align2::LEFT_CENTER, name, egui::FontId::proportional(12.0), text_color);

        // Content
        if *expanded {
            match comp_idx {
                0 => {
                    widgets::property_row_vec3(ui, "Position", &mut self.state.inspector.position);
                    widgets::property_row_vec3(ui, "Rotation", &mut self.state.inspector.rotation);
                    widgets::property_row_vec3(ui, "Scale", &mut self.state.inspector.scale);
                }
                1 => {
                    widgets::property_row_asset(ui, "Sprite", &self.state.inspector.sprite_asset, "Sprite");
                    widgets::property_row_color(ui, "Color", &mut self.state.inspector.sprite_color, &mut self.state.inspector.color_picker_open);
                    widgets::property_row_bool(ui, "Flip X", &mut self.state.inspector.flip_x);
                    widgets::property_row_bool(ui, "Flip Y", &mut self.state.inspector.flip_y);
                }
                _ => {
                    widgets::property_row_number(ui, "Speed", &mut self.state.inspector.script_speed, 0.1);
                    widgets::property_row_number(ui, "Jump Force", &mut self.state.inspector.script_jump_force, 0.1);
                    widgets::property_row_bool(ui, "Grounded", &mut self.state.inspector.script_grounded);
                }
            }
        }
    }

    /// @zh 内容浏览器抽屉
    /// @en Content browser drawer
    fn content_browser_drawer(&mut self, ctx: &egui::Context) {
        egui::TopBottomPanel::bottom("content_drawer")
            .exact_height(self.state.drawer.height)
            .frame(egui::Frame::none())
            .show(ctx, |ui| {
                let full_rect = ui.max_rect();
                let panel_width = full_rect.width();

                // Background #1e1e1e with top border #3b82f6
                ui.painter().rect_filled(full_rect, 0.0, egui::Color32::from_rgb(0x1e, 0x1e, 0x1e));
                ui.painter().line_segment([egui::pos2(full_rect.left(), full_rect.top()), egui::pos2(full_rect.right(), full_rect.top())], egui::Stroke::new(2.0, egui::Color32::from_rgb(0x3b, 0x82, 0xf6)));

                // Header: 28px, bg #2d2d30
                let (header_rect, _) = ui.allocate_exact_size(egui::vec2(panel_width, 28.0), egui::Sense::hover());
                ui.painter().rect_filled(header_rect, 0.0, egui::Color32::from_rgb(0x2d, 0x2d, 0x30));
                ui.painter().line_segment([egui::pos2(header_rect.left(), header_rect.bottom()), egui::pos2(header_rect.right(), header_rect.bottom())], egui::Stroke::new(1.0, egui::Color32::from_rgb(0x3c, 0x3c, 0x3c)));
                Icons::draw(ui.painter(), egui::pos2(header_rect.left() + 16.0, header_rect.center().y), 16.0, "folder-open", egui::Color32::from_rgb(0xdc, 0xb6, 0x7a));
                ui.painter().text(egui::pos2(header_rect.left() + 36.0, header_rect.center().y), egui::Align2::LEFT_CENTER, "Content Browser", egui::FontId::proportional(12.0), egui::Color32::from_rgb(0xe0, 0xe0, 0xe0));

                // Close button
                let close_rect = egui::Rect::from_min_size(egui::pos2(header_rect.right() - 28.0, header_rect.top() + 4.0), egui::vec2(22.0, 22.0));
                let close_resp = ui.interact(close_rect, egui::Id::new("cb_close"), egui::Sense::click());
                if close_resp.hovered() {
                    ui.painter().rect_filled(close_rect, 2.0, egui::Color32::from_rgba_unmultiplied(255, 255, 255, 20));
                }
                Icons::draw(ui.painter(), close_rect.center(), 14.0, "x", egui::Color32::from_rgb(0x88, 0x88, 0x88));
                if close_resp.clicked() {
                    self.state.drawer.content_open = false;
                }

                // Main content: left folder tree (180px) + right assets
                let content_rect = ui.available_rect_before_wrap();
                let left_width = 180.0;

                // Left panel - bg #252526
                let left_rect = egui::Rect::from_min_size(content_rect.min, egui::vec2(left_width, content_rect.height()));
                ui.painter().rect_filled(left_rect, 0.0, egui::Color32::from_rgb(0x25, 0x25, 0x26));
                ui.painter().line_segment([egui::pos2(left_rect.right(), left_rect.top()), egui::pos2(left_rect.right(), left_rect.bottom())], egui::Stroke::new(1.0, egui::Color32::from_rgb(0x3c, 0x3c, 0x3c)));

                // Section header "FAVORITES"
                ui.painter().text(egui::pos2(left_rect.left() + 10.0, left_rect.top() + 14.0), egui::Align2::LEFT_CENTER, "▼ FAVORITES", egui::FontId::proportional(11.0), egui::Color32::from_rgb(0x99, 0x99, 0x99));
                ui.painter().text(egui::pos2(left_rect.left() + 20.0, left_rect.top() + 32.0), egui::Align2::LEFT_CENTER, "No favorites", egui::FontId::proportional(11.0), egui::Color32::from_rgb(0x55, 0x55, 0x55));

                // Folder items
                let mut y = left_rect.top() + 52.0;
                let mut clicked_folder: Option<usize> = None;
                for (i, folder) in self.state.content_browser.folders.iter().enumerate() {
                    let row_rect = egui::Rect::from_min_size(egui::pos2(left_rect.left(), y), egui::vec2(left_width, 24.0));
                    let is_sel = self.state.content_browser.selected_folder == Some(i);

                    let row_resp = ui.interact(row_rect, egui::Id::new(format!("cb_folder_{}", i)), egui::Sense::click());

                    if row_resp.hovered() && !is_sel {
                        ui.painter().rect_filled(row_rect, 0.0, egui::Color32::from_rgb(0x2d, 0x2d, 0x30));
                    }
                    if is_sel {
                        ui.painter().rect_filled(row_rect, 0.0, egui::Color32::from_rgb(0x09, 0x47, 0x71));
                    }

                    Icons::draw(ui.painter(), egui::pos2(left_rect.left() + 14.0, row_rect.center().y), 12.0, if folder.expanded { "chevron-down" } else { "chevron-right" }, egui::Color32::from_rgb(0x88, 0x88, 0x88));
                    Icons::draw(ui.painter(), egui::pos2(left_rect.left() + 28.0, row_rect.center().y), 14.0, "folder", egui::Color32::from_rgb(0xdc, 0xb6, 0x7a));
                    ui.painter().text(egui::pos2(left_rect.left() + 44.0, row_rect.center().y), egui::Align2::LEFT_CENTER, &folder.name, egui::FontId::proportional(12.0), egui::Color32::from_rgb(0xe0, 0xe0, 0xe0));

                    if row_resp.clicked() {
                        clicked_folder = Some(i);
                    }
                    y += 24.0;
                }
                if let Some(idx) = clicked_folder {
                    self.state.content_browser.selected_folder = Some(idx);
                }

                // Right panel - toolbar + assets
                let right_rect = egui::Rect::from_min_max(egui::pos2(left_rect.right() + 1.0, content_rect.top()), content_rect.max);

                // Toolbar (28px): bg #2d2d30
                let toolbar_rect = egui::Rect::from_min_size(right_rect.min, egui::vec2(right_rect.width(), 28.0));
                ui.painter().rect_filled(toolbar_rect, 0.0, egui::Color32::from_rgb(0x2d, 0x2d, 0x30));
                ui.painter().line_segment([egui::pos2(toolbar_rect.left(), toolbar_rect.bottom()), egui::pos2(toolbar_rect.right(), toolbar_rect.bottom())], egui::Stroke::new(1.0, egui::Color32::from_rgb(0x3c, 0x3c, 0x3c)));

                // Search box - icon
                let icon_pos = egui::pos2(toolbar_rect.left() + 22.0, toolbar_rect.center().y);
                Icons::draw(ui.painter(), icon_pos, 14.0, "search", egui::Color32::from_rgb(0x60, 0x60, 0x60));

                // Search box - text input
                let search_rect = egui::Rect::from_min_size(egui::pos2(toolbar_rect.left() + 36.0, toolbar_rect.top() + 4.0), egui::vec2(130.0, 20.0));
                let text_edit = egui::TextEdit::singleline(&mut self.state.content_browser.search)
                    .font(egui::FontId::proportional(11.0))
                    .hint_text(egui::RichText::new("Search...").color(egui::Color32::from_rgb(0x55, 0x55, 0x55)))
                    .text_color(egui::Color32::from_rgb(0xcc, 0xcc, 0xcc))
                    .frame(true);
                let search_response = ui.put(search_rect, text_edit);
                // Blur WebView when search gains focus
                if search_response.gained_focus() || search_response.clicked() {
                    if let Some(ref viewport) = self.webview_viewport {
                        viewport.blur();
                    }
                }

                // Breadcrumb
                ui.painter().text(egui::pos2(toolbar_rect.left() + 180.0, toolbar_rect.center().y), egui::Align2::LEFT_CENTER, "Assets / Textures", egui::FontId::proportional(11.0), egui::Color32::from_rgb(0x99, 0x99, 0x99));

                // Assets area
                let assets_rect = egui::Rect::from_min_max(egui::pos2(right_rect.left(), toolbar_rect.bottom() + 1.0), right_rect.max);
                let mut ax = assets_rect.left() + 12.0;
                let mut ay = assets_rect.top() + 8.0;
                let card_size = 64.0;
                let gap = 8.0;
                let mut clicked_asset: Option<usize> = None;

                for (i, asset) in self.state.content_browser.assets.iter().enumerate() {
                    if ax + card_size > assets_rect.right() - 12.0 {
                        ax = assets_rect.left() + 12.0;
                        ay += card_size + 20.0 + gap;
                    }
                    let full_card_rect = egui::Rect::from_min_size(egui::pos2(ax, ay), egui::vec2(card_size, card_size + 20.0));
                    let card_rect = egui::Rect::from_min_size(egui::pos2(ax, ay), egui::vec2(card_size, card_size));

                    let card_resp = ui.interact(full_card_rect, egui::Id::new(format!("cb_asset_{}", i)), egui::Sense::click());
                    let is_sel = self.state.content_browser.selected_asset == Some(i);

                    let bg_color = if is_sel {
                        egui::Color32::from_rgb(0x09, 0x47, 0x71)
                    } else if card_resp.hovered() {
                        egui::Color32::from_rgb(0x3a, 0x3a, 0x3d)
                    } else {
                        egui::Color32::from_rgb(0x2d, 0x2d, 0x30)
                    };
                    let border_color = if is_sel {
                        egui::Color32::from_rgb(0x3b, 0x82, 0xf6)
                    } else {
                        egui::Color32::from_rgb(0x3c, 0x3c, 0x3c)
                    };

                    ui.painter().rect_filled(card_rect, 4.0, bg_color);
                    ui.painter().rect_stroke(card_rect, 4.0, egui::Stroke::new(1.0, border_color));

                    let icon = match asset.asset_type {
                        AssetType::Scene => "file",
                        AssetType::Script => "file-code",
                        AssetType::Image => "image",
                        AssetType::Json => "file",
                        _ => "folder"
                    };
                    Icons::draw(ui.painter(), card_rect.center(), 32.0, icon, egui::Color32::from_rgb(0x88, 0x88, 0x88));
                    ui.painter().text(egui::pos2(ax + card_size / 2.0, ay + card_size + 10.0), egui::Align2::CENTER_CENTER, &asset.name, egui::FontId::proportional(11.0), egui::Color32::from_rgb(0xe0, 0xe0, 0xe0));

                    if card_resp.clicked() {
                        clicked_asset = Some(i);
                    }
                    ax += card_size + gap;
                }
                if let Some(idx) = clicked_asset {
                    self.state.content_browser.selected_asset = Some(idx);
                }
            });
    }

    /// @zh 输出抽屉
    /// @en Output drawer
    fn output_drawer(&mut self, ctx: &egui::Context) {
        egui::TopBottomPanel::bottom("output_drawer")
            .exact_height(self.state.drawer.height)
            .frame(egui::Frame::none())
            .show(ctx, |ui| {
                let full_rect = ui.max_rect();
                let panel_width = full_rect.width();

                // Background #1a1a1a with top border #3b82f6
                ui.painter().rect_filled(full_rect, 0.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a));
                ui.painter().line_segment([egui::pos2(full_rect.left(), full_rect.top()), egui::pos2(full_rect.right(), full_rect.top())], egui::Stroke::new(2.0, egui::Color32::from_rgb(0x3b, 0x82, 0xf6)));

                // Header 28px
                let (header_rect, _) = ui.allocate_exact_size(egui::vec2(panel_width, 28.0), egui::Sense::hover());
                ui.painter().rect_filled(header_rect, 0.0, egui::Color32::from_rgb(0x25, 0x25, 0x26));
                ui.painter().line_segment([egui::pos2(header_rect.left(), header_rect.bottom()), egui::pos2(header_rect.right(), header_rect.bottom())], egui::Stroke::new(1.0, egui::Color32::from_rgb(0x3c, 0x3c, 0x3c)));
                Icons::draw(ui.painter(), egui::pos2(header_rect.left() + 16.0, header_rect.center().y), 16.0, "terminal", egui::Color32::from_rgb(0x88, 0x88, 0x88));
                ui.painter().text(egui::pos2(header_rect.left() + 36.0, header_rect.center().y), egui::Align2::LEFT_CENTER, "Output", egui::FontId::proportional(12.0), egui::Color32::from_rgb(0xe0, 0xe0, 0xe0));

                // Toolbar buttons
                let btn_x = header_rect.left() + 90.0;
                let mut clicked_tab: Option<usize> = None;
                for (i, tab) in ["All", "Info", "Warn", "Error"].iter().enumerate() {
                    let tab_rect = egui::Rect::from_min_size(egui::pos2(btn_x + i as f32 * 52.0, header_rect.top() + 4.0), egui::vec2(48.0, 20.0));
                    let is_active = self.state.drawer.output_filter == i;

                    let tab_resp = ui.interact(tab_rect, egui::Id::new(format!("output_tab_{}", i)), egui::Sense::click());

                    if tab_resp.hovered() && !is_active {
                        ui.painter().rect_filled(tab_rect, 3.0, egui::Color32::from_rgb(0x3a, 0x3a, 0x3d));
                    }
                    if is_active {
                        ui.painter().rect_filled(tab_rect, 3.0, egui::Color32::from_rgb(0x3b, 0x82, 0xf6));
                    }
                    ui.painter().text(tab_rect.center(), egui::Align2::CENTER_CENTER, tab, egui::FontId::proportional(11.0), if is_active { egui::Color32::WHITE } else { egui::Color32::from_rgb(0x88, 0x88, 0x88) });

                    if tab_resp.clicked() {
                        clicked_tab = Some(i);
                    }
                }
                if let Some(idx) = clicked_tab {
                    self.state.drawer.output_filter = idx;
                }

                // Close button
                let close_rect = egui::Rect::from_min_size(egui::pos2(header_rect.right() - 28.0, header_rect.top() + 4.0), egui::vec2(22.0, 22.0));
                let close_resp = ui.interact(close_rect, egui::Id::new("output_close"), egui::Sense::click());
                if close_resp.hovered() {
                    ui.painter().rect_filled(close_rect, 3.0, egui::Color32::from_rgb(0x3a, 0x3a, 0x3d));
                }
                Icons::draw(ui.painter(), close_rect.center(), 14.0, "x", egui::Color32::from_rgb(0x88, 0x88, 0x88));
                if close_resp.clicked() {
                    self.state.drawer.output_open = false;
                }

                // Log content
                let content_rect = ui.available_rect_before_wrap();

                // Sample log entries
                let logs = [
                    (1, "[INFO] 12:34:56", "Engine initialized", egui::Color32::from_rgb(0x4a, 0xde, 0x80)),
                    (1, "[INFO] 12:34:56", "Loading scene: main.scene", egui::Color32::from_rgb(0x4a, 0xde, 0x80)),
                    (2, "[WARN] 12:34:57", "Asset not found: missing_texture.png", egui::Color32::from_rgb(0xfb, 0xbd, 0x23)),
                    (1, "[INFO] 12:34:58", "Scene loaded successfully", egui::Color32::from_rgb(0x4a, 0xde, 0x80)),
                ];

                let mut y = content_rect.top() + 4.0;
                for (log_type, time, msg, color) in logs {
                    // Filter: 0=All, 1=Info, 2=Warn, 3=Error
                    if self.state.drawer.output_filter != 0 && self.state.drawer.output_filter != log_type {
                        continue;
                    }
                    let row_rect = egui::Rect::from_min_size(egui::pos2(content_rect.left(), y), egui::vec2(content_rect.width(), 18.0));
                    let row_resp = ui.interact(row_rect, egui::Id::new(format!("log_{}", y as i32)), egui::Sense::click());
                    if row_resp.hovered() {
                        ui.painter().rect_filled(row_rect, 0.0, egui::Color32::from_rgb(0x2d, 0x2d, 0x30));
                    }
                    ui.painter().text(egui::pos2(content_rect.left() + 8.0, y + 9.0), egui::Align2::LEFT_CENTER, time, egui::FontId::monospace(10.0), color);
                    ui.painter().text(egui::pos2(content_rect.left() + 120.0, y + 9.0), egui::Align2::LEFT_CENTER, msg, egui::FontId::monospace(10.0), egui::Color32::from_rgb(0xcc, 0xcc, 0xcc));
                    y += 18.0;
                }
            });
    }

    /// @zh 渲染菜单下拉
    /// @en Render menu dropdown
    fn render_menu_dropdown(&mut self, ctx: &egui::Context, menu: &str) {
        let menu_x = 40.0 + match menu {
            "File" => 0.0,
            "Edit" => 40.0,
            "View" => 80.0,
            "Help" => 120.0,
            _ => 0.0,
        };

        let items: Vec<(&str, &str, bool)> = match menu {
            "File" => vec![
                ("Open Project...", "", true),
                ("---", "", false),
                ("New Scene", "Ctrl+N", false),
                ("Save", "Ctrl+S", false),
            ],
            "Edit" => vec![
                ("Undo", "Ctrl+Z", false),
                ("Redo", "Ctrl+Y", false),
            ],
            "View" => vec![
                ("Reset Layout", "", true),
            ],
            "Help" => vec![
                ("Documentation", "", true),
                ("About", "", true),
            ],
            _ => vec![],
        };

        let item_h = 24.0;
        let sep_h = 8.0;
        let total_h: f32 = items.iter().map(|(label, _, _)| if *label == "---" { sep_h } else { item_h }).sum();
        let menu_rect = egui::Rect::from_min_size(egui::pos2(menu_x, 32.0), egui::vec2(180.0, total_h + 8.0));
        let titlebar_menu_area = egui::Rect::from_min_size(egui::pos2(40.0, 0.0), egui::vec2(160.0, 32.0));

        // Check click outside
        if ctx.input(|i| i.pointer.any_click()) {
            if let Some(pos) = ctx.input(|i| i.pointer.interact_pos()) {
                if !menu_rect.contains(pos) && !titlebar_menu_area.contains(pos) {
                    self.state.active_menu = None;
                    return;
                }
            }
        }

        egui::Area::new(egui::Id::new("menu_dropdown"))
            .fixed_pos(egui::pos2(menu_x, 32.0))
            .order(egui::Order::Foreground)
            .show(ctx, |ui| {
                ui.allocate_rect(menu_rect, egui::Sense::click());

                // Background
                ui.painter().rect_filled(menu_rect.expand(1.0), 4.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a));
                ui.painter().rect_filled(menu_rect, 4.0, egui::Color32::from_rgb(0x2d, 0x2d, 0x30));
                ui.painter().rect_stroke(menu_rect, 4.0, egui::Stroke::new(1.0, egui::Color32::from_rgb(0x3c, 0x3c, 0x3c)));

                let mut y = menu_rect.top() + 4.0;
                let mut clicked_action: Option<&str> = None;

                for (label, shortcut, enabled) in &items {
                    if *label == "---" {
                        let sep_rect = egui::Rect::from_min_size(egui::pos2(menu_rect.left() + 8.0, y + 3.0), egui::vec2(menu_rect.width() - 16.0, 1.0));
                        ui.painter().rect_filled(sep_rect, 0.0, egui::Color32::from_rgb(0x3c, 0x3c, 0x3c));
                        y += sep_h;
                    } else {
                        let item_rect = egui::Rect::from_min_size(egui::pos2(menu_rect.left() + 4.0, y), egui::vec2(menu_rect.width() - 8.0, item_h));
                        let item_resp = ui.interact(item_rect, egui::Id::new(format!("menu_item_{}", label)), egui::Sense::click());

                        if item_resp.hovered() && *enabled {
                            ui.painter().rect_filled(item_rect, 3.0, egui::Color32::from_rgb(0x3b, 0x82, 0xf6));
                        }

                        let text_color = if !*enabled {
                            egui::Color32::from_rgb(0x55, 0x55, 0x55)
                        } else if item_resp.hovered() {
                            egui::Color32::WHITE
                        } else {
                            egui::Color32::from_rgb(0xcc, 0xcc, 0xcc)
                        };

                        ui.painter().text(egui::pos2(item_rect.left() + 10.0, item_rect.center().y), egui::Align2::LEFT_CENTER, label, egui::FontId::proportional(11.0), text_color);
                        if !shortcut.is_empty() {
                            ui.painter().text(egui::pos2(item_rect.right() - 10.0, item_rect.center().y), egui::Align2::RIGHT_CENTER, shortcut, egui::FontId::proportional(10.0), egui::Color32::from_rgb(0x66, 0x66, 0x66));
                        }

                        if item_resp.clicked() && *enabled {
                            clicked_action = Some(*label);
                        }
                        y += item_h;
                    }
                }

                if clicked_action.is_some() {
                    self.state.active_menu = None;
                }
            });
    }

    /// @zh 渲染上下文菜单
    /// @en Render context menu
    fn render_context_menu(&mut self, _ctx: &egui::Context) {
        // TODO: Implement context menu
    }
}

// ============================================================================
// Run Preview
// ============================================================================

/// @zh 运行编辑器预览
/// @en Run editor preview
pub fn run_editor() -> eframe::Result<()> {
    let tokens = ThemeTokens::from_default().expect("failed to load theme tokens");
    let theme = build_egui_theme(&tokens);

    let native_options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_title("ESEngine Editor")
            .with_inner_size([1400.0, 900.0])
            .with_decorations(false),
        ..Default::default()
    };

    eframe::run_native(
        "ESEngine Editor",
        native_options,
        Box::new(move |cc| {
            cc.egui_ctx.set_fonts(theme.fonts.clone());
            cc.egui_ctx.set_style(theme.style.clone());
            Box::new(EditorApp::new(tokens))
        }),
    )
}

/// @zh 运行编辑器（WebView 模式）
/// @en Run editor with WebView mode
///
/// @zh 使用 WebView2 渲染 ccesengine 视口
/// @en Uses WebView2 to render ccesengine viewport
///
/// @param url ccesengine 页面地址（例如 "http://localhost:5173"）
/// @param url ccesengine page URL (e.g. "http://localhost:5173")
pub fn run_editor_with_webview(url: impl Into<String>) -> eframe::Result<()> {
    let tokens = ThemeTokens::from_default().expect("failed to load theme tokens");
    let theme = build_egui_theme(&tokens);
    let webview_url = url.into();

    let native_options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_title("ESEngine Editor (WebView)")
            .with_inner_size([1400.0, 900.0])
            .with_decorations(false),
        ..Default::default()
    };

    eframe::run_native(
        "ESEngine Editor",
        native_options,
        Box::new(move |cc| {
            cc.egui_ctx.set_fonts(theme.fonts.clone());
            cc.egui_ctx.set_style(theme.style.clone());
            Box::new(EditorApp::with_webview(tokens, webview_url))
        }),
    )
}

/// @zh 运行编辑器（嵌入式 ccesengine 模式）
/// @en Run editor with embedded ccesengine mode
///
/// @zh 使用嵌入的 HTML 和自定义协议从本地文件系统加载 ccesengine 模块。
/// @zh 不需要外部 Vite 服务器。
/// @en Uses embedded HTML and custom protocol to load ccesengine modules from local filesystem.
/// @en No external Vite server required.
pub fn run_editor_with_ccesengine() -> eframe::Result<()> {
    let tokens = ThemeTokens::from_default().expect("failed to load theme tokens");
    let theme = build_egui_theme(&tokens);

    let native_options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_title("ESEngine Editor (ccesengine)")
            .with_inner_size([1400.0, 900.0])
            .with_decorations(false),
        ..Default::default()
    };

    // Find assets path - try multiple locations
    let assets_path = find_ccesengine_assets_path();
    println!("[WebView] Starting editor with embedded ccesengine");
    println!("[WebView] Assets path: {:?}", assets_path);

    eframe::run_native(
        "ESEngine Editor",
        native_options,
        Box::new(move |cc| {
            cc.egui_ctx.set_fonts(theme.fonts.clone());
            cc.egui_ctx.set_style(theme.style.clone());
            Box::new(EditorApp::with_embedded_ccesengine(tokens, assets_path))
        }),
    )
}

/// @zh 查找 ccesengine 资源路径
/// @en Find ccesengine assets path
fn find_ccesengine_assets_path() -> std::path::PathBuf {
    use std::path::Path;

    // Try paths in order of preference
    let candidates = [
        // Development: relative to src-tauri
        "../public",
        "../../editor-app/public",
        // Development: relative to workspace root
        "packages/editor/editor-app/public",
        // Absolute path fallback
        "E:/ecs-framework/packages/editor/editor-app/public",
    ];

    // Get current exe directory
    let exe_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()));

    // Get current working directory
    let cwd = std::env::current_dir().ok();

    for candidate in &candidates {
        let path = Path::new(candidate);

        // Try relative to exe directory
        if let Some(ref exe) = exe_dir {
            let full_path = exe.join(path);
            if full_path.join("ccesengine").exists() {
                println!("[WebView] Found assets at (exe-relative): {:?}", full_path);
                return full_path;
            }
        }

        // Try relative to cwd
        if let Some(ref cwd) = cwd {
            let full_path = cwd.join(path);
            if full_path.join("ccesengine").exists() {
                println!("[WebView] Found assets at (cwd-relative): {:?}", full_path);
                return full_path;
            }
        }

        // Try absolute path
        if path.join("ccesengine").exists() {
            println!("[WebView] Found assets at (absolute): {:?}", path);
            return path.to_path_buf();
        }
    }

    // Fallback to development path
    println!("[WebView] Warning: Could not find ccesengine assets, using fallback path");
    Path::new("E:/ecs-framework/packages/editor/editor-app/public").to_path_buf()
}
