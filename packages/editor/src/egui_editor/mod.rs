//! @zh egui 编辑器模块
//! @en egui editor module
//!
//! 使用 egui 实现的编辑器界面，基于 design-tokens.json 样式。
//! Editor interface implemented with egui, based on design-tokens.json styles.

pub mod animation;
pub mod colors;
pub mod icons;
pub mod mcp_client;
pub mod panels;
pub mod scene_bridge;
pub mod scene_data;
pub mod state;
pub mod viewport_rpc;
pub mod webview;
pub mod widgets;

use eframe::egui;
use raw_window_handle::HasWindowHandle;

use crate::effect_compiler::EffectCompiler;
use crate::theme_egui::build_egui_theme;
use crate::theme_tokens::ThemeTokens;

pub use animation::AnimationState;
pub use colors::{css_color, ThemeColors};
pub use icons::Icons;
pub use mcp_client::McpClient;
pub use panels::WebViewViewportConfig;
pub use scene_bridge::{BridgeMode, SceneBridge};
pub use scene_data::{ComponentData, NodeData, NodeProperties, PropertyValue, SceneState};
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
    /// @zh 待注入的 effects JSON（等待 WebView 就绪）
    /// @en Pending effects JSON to inject (waiting for WebView ready)
    pending_effects_json: Option<String>,
    /// @zh 待配置 viewport 项目路径
    /// @en Pending viewport project configuration
    pending_viewport_config: bool,
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
            pending_effects_json: None,
            pending_viewport_config: false,
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
            pending_effects_json: None,
            pending_viewport_config: false,
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
            pending_effects_json: None,
            pending_viewport_config: false,
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
            pending_effects_json: None,
            pending_viewport_config: false,
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
            pending_effects_json: None,
            pending_viewport_config: false,
        }
    }

    /// @zh 创建 MCP 模式的编辑器应用
    /// @en Create editor application in MCP mode
    ///
    /// @zh 通过 cces-cli MCP 服务器访问场景数据，不使用 WebView。
    /// @en Access scene data through cces-cli MCP server, without WebView.
    ///
    /// # Arguments
    /// * `tokens` - 主题配置
    /// * `project_path` - Cocos Creator 项目路径
    /// * `cli_path` - cces-cli 路径
    pub fn with_mcp(
        tokens: ThemeTokens,
        project_path: std::path::PathBuf,
        cli_path: std::path::PathBuf,
    ) -> Self {
        Self {
            state: EditorState::new_mcp(tokens, project_path, cli_path),
            webview_viewport: None,
            use_webview: false,
            webview_initialized: false,
            pending_effects_json: None,
            pending_viewport_config: false,
        }
    }

    /// @zh 获取主题颜色访问器
    /// @en Get theme colors accessor
    pub fn colors(&self) -> ThemeColors<'_> {
        ThemeColors::new(&self.state.tokens)
    }

    /// @zh 处理来自 viewport 的场景通知
    /// @en Process scene notifications from viewport
    fn process_scene_notifications(&mut self) {
        let mut hierarchy_updated = false;

        if let Some(ref mut viewport) = self.webview_viewport {
            for notification in viewport.drain_scene_notifications() {
                match notification {
                    webview::SceneNotification::HierarchyChanged(tree) => {
                        let node_count = tree.count_nodes();
                        println!("[Editor] Received hierarchy update: {} nodes", node_count);
                        self.state.scene_state.update_tree(tree);
                        hierarchy_updated = true;
                    }
                    webview::SceneNotification::SceneLoaded { name } => {
                        println!("[Editor] Scene loaded: {}", name);
                        self.state.scene_state.scene_loaded = true;
                        self.state.scene_state.mark_hierarchy_dirty();
                    }
                    webview::SceneNotification::NodePropertiesReceived { uuid, properties } => {
                        // Only update if this matches the currently selected node
                        if self.state.scene_state.selected_uuid.as_ref() == Some(&uuid) {
                            println!("[Editor] Received properties for selected node: {}", properties.name);
                            // Convert components to ComponentData
                            let components: Vec<scene_data::ComponentData> = properties.components.clone();
                            self.state.scene_state.update_properties(properties);
                            self.state.scene_state.update_components(components);
                        }
                    }
                }
            }
        }

        // Sync hierarchy items from scene state if tree was updated
        if hierarchy_updated {
            self.state.sync_hierarchy_from_scene();
            println!("[Editor] Hierarchy items synced: {} items", self.state.hierarchy_items.len());
        }
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

        // Skip if bounds.top() is too small (WebView would overlap titlebar)
        // Titlebar is 32px, toolbar is 36px, so top should be at least 60px
        if bounds.top() < 60.0 {
            println!("[WebView] Skipping init: bounds.top()={} is too small", bounds.top());
            return;
        }

        if let Some(ref mut viewport) = self.webview_viewport {
            if let Ok(handle) = frame.window_handle() {
                viewport.initialize(handle.as_raw(), bounds);
                if viewport.is_ready() {
                    self.webview_initialized = true;
                    println!("[WebView] Initialized successfully at {:?}", bounds);

                    // Inject effects immediately after WebView is ready
                    if let Some(effects_json) = self.pending_effects_json.take() {
                        match viewport.inject_effects(&effects_json) {
                            Ok(()) => {
                                println!("[WebView] Effects injected immediately after init");
                            }
                            Err(e) => {
                                println!("[WebView] Failed to inject effects: {}", e);
                                self.pending_effects_json = Some(effects_json);
                            }
                        }
                    }
                }
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    fn initialize_webview(&mut self, _frame: &eframe::Frame, _bounds: egui::Rect) {
        // WebView2 only supported on Windows
    }

    /// @zh 将场景数据同步到 WebView viewport
    /// @en Sync scene data to WebView viewport
    fn sync_scene_to_viewport(&self, tree: &NodeData) {
        if let Some(ref viewport) = self.webview_viewport {
            // Convert NodeData to JSON for the viewport
            if let Ok(json) = serde_json::to_string(tree) {
                let script = format!(
                    "if (window.esengine && window.esengine.syncSceneFromData) {{ window.esengine.syncSceneFromData({}); }}",
                    json
                );
                if let Err(e) = viewport.eval_script(&script) {
                    println!("[Viewport] Failed to sync scene: {}", e);
                } else {
                    println!("[Viewport] Scene synced to viewport");
                }
            }
        }
    }

    /// @zh 将选中节点同步到 WebView viewport（用于高亮显示并请求属性）
    /// @en Sync selected node to WebView viewport (for highlighting and request properties)
    fn sync_selection_to_viewport(&self, uuid: Option<&str>) {
        if let Some(ref viewport) = self.webview_viewport {
            // Use the new select_node method which also requests properties
            if let Err(e) = viewport.select_node(uuid) {
                println!("[Viewport] Failed to sync selection: {}", e);
            }
        }
    }

    /// @zh 配置 viewport 使用项目资源服务器
    /// @en Configure viewport to use project resource server
    fn configure_viewport_project(&self) {
        println!("[Viewport] configure_viewport_project called");
        if let Some(ref viewport) = self.webview_viewport {
            if let Some(port) = viewport.get_server_port() {
                let server_url = format!("http://127.0.0.1:{}", port);
                println!("[Viewport] Server URL: {}", server_url);
                // Use the early setter that works before window.esengine is ready
                // This sets projectLibraryUrl immediately, then also calls esengine.setProjectConfig
                // if it's available for full configuration
                let script = format!(
                    r#"(function() {{
                        var config = {{ serverUrl: '{}' }};
                        console.log('[viewport] Rust called setProjectConfig with:', config);
                        if (window._setProjectConfigEarly) {{
                            window._setProjectConfigEarly(config);
                        }}
                        if (window.esengine && window.esengine.setProjectConfig) {{
                            window.esengine.setProjectConfig(config);
                        }}
                    }})()"#,
                    server_url
                );
                if let Err(e) = viewport.eval_script(&script) {
                    println!("[Viewport] Failed to configure project: {}", e);
                } else {
                    println!("[Viewport] Project configured with server: {}", server_url);
                }
            } else {
                println!("[Viewport] No server port available!");
            }
        } else {
            println!("[Viewport] No webview_viewport!");
        }
    }

    /// @zh 在 viewport 中加载场景
    /// @en Load scene in viewport
    ///
    /// @param scene_url - 场景资源 URL（如 db://assets/scenes/login.scene）
    pub fn load_scene_in_viewport(&self, scene_url: &str) {
        if let Some(ref viewport) = self.webview_viewport {
            match viewport.load_scene(scene_url) {
                Ok(()) => {
                    println!("[Viewport] Loading scene: {}", scene_url);
                }
                Err(e) => {
                    println!("[Viewport] Failed to load scene: {}", e);
                }
            }
        }
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

        // Render based on current phase
        match self.state.phase {
            EditorPhase::Startup => {
                self.startup_screen(ctx);
            }
            EditorPhase::Loading => {
                self.loading_screen(ctx);
            }
            EditorPhase::Ready => {
                self.ready_screen(ctx, frame);
            }
        }
    }
}

impl EditorApp {
    /// @zh 就绪阶段 - 主编辑器界面
    /// @en Ready phase - main editor interface
    fn ready_screen(&mut self, ctx: &egui::Context, frame: &mut eframe::Frame) {
        // Process scene notifications from viewport
        self.process_scene_notifications();

        // Drain WebView logs and add to Output panel
        if let Some(ref mut viewport) = self.webview_viewport {
            for entry in viewport.drain_logs() {
                self.state.drawer.add_log(entry);
            }
        }

        // Try to inject pending effects if WebView is now ready
        self.try_inject_pending_effects();

        // Blur WebView when any egui widget wants keyboard focus
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

    /// @zh 启动界面标题栏
    /// @en Startup screen title bar
    fn startup_title_bar(&self, ctx: &egui::Context) {
        let height = 32.0;
        egui::TopBottomPanel::top("startup_titlebar")
            .exact_height(height)
            .frame(egui::Frame::none())
            .show(ctx, |ui| {
                let full_rect = ui.max_rect();

                // Background - dark color matching startup screen
                ui.painter().rect_filled(full_rect, 0.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a));

                // Border bottom
                ui.painter().line_segment(
                    [egui::pos2(full_rect.left(), full_rect.bottom()), egui::pos2(full_rect.right(), full_rect.bottom())],
                    egui::Stroke::new(1.0, egui::Color32::from_rgb(0x2a, 0x2a, 0x2a)),
                );

                // Logo area
                let logo_rect = egui::Rect::from_min_size(full_rect.min, egui::vec2(40.0, height));
                ui.painter().text(
                    logo_rect.center(),
                    egui::Align2::CENTER_CENTER,
                    "ES",
                    egui::FontId::proportional(14.0),
                    egui::Color32::from_rgb(0x4a, 0x9e, 0xff),
                );

                // Window controls
                let btn_width = 46.0;
                let right_start = full_rect.right() - btn_width * 3.0;

                // Minimize
                let min_rect = egui::Rect::from_min_size(egui::pos2(right_start, full_rect.top()), egui::vec2(btn_width, height));
                let min_resp = ui.interact(min_rect, egui::Id::new("startup_btn_min"), egui::Sense::click());
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
                let max_resp = ui.interact(max_rect, egui::Id::new("startup_btn_max"), egui::Sense::click());
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
                let close_resp = ui.interact(close_rect, egui::Id::new("startup_btn_close"), egui::Sense::click());
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

                // Drag area (between logo and window controls)
                let drag_rect = egui::Rect::from_min_max(egui::pos2(40.0, full_rect.top()), egui::pos2(right_start, full_rect.bottom()));
                ui.painter().text(drag_rect.center(), egui::Align2::CENTER_CENTER, "ESEngine Editor", egui::FontId::proportional(12.0), egui::Color32::from_rgb(0x80, 0x80, 0x80));

                let drag_resp = ui.interact(drag_rect, egui::Id::new("startup_title_drag"), egui::Sense::click_and_drag());
                if drag_resp.drag_started() {
                    ctx.send_viewport_cmd(egui::ViewportCommand::StartDrag);
                }
                if drag_resp.double_clicked() {
                    ctx.send_viewport_cmd(egui::ViewportCommand::Maximized(true));
                }
            });
    }

    /// @zh 启动界面 - 选择项目
    /// @en Startup screen - select project
    fn startup_screen(&mut self, ctx: &egui::Context) {
        // Render title bar first
        self.startup_title_bar(ctx);

        // Extract colors before entering closures to avoid borrow conflicts
        let colors = ThemeColors::new(&self.state.tokens);
        let bg_color = colors.bg_base();
        let text_primary = colors.text_primary();
        let text_secondary = colors.text_secondary();
        let text_tertiary = colors.text_tertiary();
        let text_inverse = colors.text_inverse();
        let accent_color = colors.accent();
        let bg_elevated = colors.bg_elevated();
        let warning_color = colors.warning();
        drop(colors);

        // Clone data needed in closures
        let recent_projects = self.state.recent_projects.clone();
        let cli_path_display = self.state.cli_path.as_ref().map(|p| p.display().to_string());

        // Track which project was selected (if any)
        let mut selected_project: Option<std::path::PathBuf> = None;
        let mut open_dialog = false;

        egui::CentralPanel::default()
            .frame(egui::Frame::none().fill(bg_color))
            .show(ctx, |ui| {
                let available = ui.available_size();
                let center_x = available.x / 2.0;
                let center_y = available.y / 2.0;

                ui.allocate_ui_at_rect(
                    egui::Rect::from_center_size(
                        egui::pos2(center_x, center_y),
                        egui::vec2(400.0, 500.0),
                    ),
                    |ui| {
                        ui.vertical_centered(|ui| {
                            ui.add_space(20.0);

                            // Logo / Title
                            ui.heading(egui::RichText::new("ESEngine Editor")
                                .size(32.0)
                                .color(text_primary));

                            ui.add_space(10.0);
                            ui.label(egui::RichText::new("v1.0.0")
                                .size(14.0)
                                .color(text_secondary));

                            ui.add_space(40.0);

                            // Open Project button
                            let open_btn = egui::Button::new(
                                egui::RichText::new("  Open Project  ")
                                    .size(16.0)
                                    .color(text_inverse)
                            )
                            .fill(accent_color)
                            .min_size(egui::vec2(200.0, 40.0));

                            if ui.add(open_btn).clicked() {
                                open_dialog = true;
                            }

                            ui.add_space(20.0);

                            // Recent projects section
                            if !recent_projects.is_empty() {
                                ui.add_space(20.0);
                                ui.separator();
                                ui.add_space(10.0);

                                ui.label(egui::RichText::new("Recent Projects")
                                    .size(14.0)
                                    .color(text_secondary));

                                ui.add_space(10.0);

                                for project in &recent_projects {
                                    let name = project
                                        .file_name()
                                        .and_then(|n| n.to_str())
                                        .unwrap_or("Unknown");

                                    let project_btn = egui::Button::new(
                                        egui::RichText::new(name)
                                            .size(13.0)
                                            .color(text_primary)
                                    )
                                    .fill(bg_elevated)
                                    .min_size(egui::vec2(300.0, 32.0));

                                    if ui.add(project_btn).clicked() {
                                        selected_project = Some(project.clone());
                                    }
                                }
                            }

                            ui.add_space(40.0);

                            // CLI path info
                            if let Some(ref path_str) = cli_path_display {
                                ui.label(egui::RichText::new(format!("CLI: {}", path_str))
                                    .size(11.0)
                                    .color(text_tertiary));
                            } else {
                                ui.label(egui::RichText::new("CLI not found - searching...")
                                    .size(11.0)
                                    .color(warning_color));
                            }
                        });
                    },
                );
            });

        // Handle actions after UI rendering (outside of closures)
        if open_dialog {
            self.open_project_dialog();
        }

        if let Some(project) = selected_project {
            self.open_recent_project(&project);
        }

        // Try to find CLI path if not set
        if self.state.cli_path.is_none() {
            if let Some(cli) = find_cces_cli_path() {
                self.state.cli_path = Some(cli);
            }
        }
    }

    /// @zh 加载界面 - 启动 MCP，获取 effects
    /// @en Loading screen - starting MCP, fetching effects
    fn loading_screen(&mut self, ctx: &egui::Context) {
        // Render title bar first (same as startup)
        self.startup_title_bar(ctx);

        // No longer need MCP - viewport loads scenes directly via ccesengine
        // Just proceed to ready state after a brief delay for viewport init
        self.state.set_loading_status("Initializing viewport...");

        let colors = ThemeColors::new(&self.state.tokens);
        let bg_color = colors.bg_base();

        egui::CentralPanel::default()
            .frame(egui::Frame::none().fill(bg_color))
            .show(ctx, |ui| {
                let available = ui.available_size();
                let center_x = available.x / 2.0;
                let center_y = available.y / 2.0;

                ui.allocate_ui_at_rect(
                    egui::Rect::from_center_size(
                        egui::pos2(center_x, center_y),
                        egui::vec2(400.0, 200.0),
                    ),
                    |ui| {
                        let colors = ThemeColors::new(&self.state.tokens);
                        ui.vertical_centered(|ui| {
                            ui.add_space(20.0);

                            // Loading spinner (simple animation)
                            let time = ui.input(|i| i.time);
                            let angle = time * 2.0;
                            let spinner_text = match ((angle * 4.0) as usize) % 4 {
                                0 => "|",
                                1 => "/",
                                2 => "-",
                                _ => "\\",
                            };

                            ui.label(egui::RichText::new(spinner_text)
                                .size(32.0)
                                .color(colors.accent()));

                            ui.add_space(20.0);

                            // Status message
                            ui.label(egui::RichText::new(&self.state.startup_status)
                                .size(14.0)
                                .color(colors.text_primary()));

                            ui.add_space(10.0);

                            // Project path
                            if let Some(ref project) = self.state.project_path {
                                ui.label(egui::RichText::new(project.display().to_string())
                                    .size(11.0)
                                    .color(colors.text_tertiary()));
                            }
                        });
                    },
                );

                // Request repaint for animation
                ctx.request_repaint();
            });

        // Check if MCP is ready and transition to Ready phase
        self.check_loading_complete();
    }

    /// @zh 打开项目对话框
    /// @en Open project dialog
    fn open_project_dialog(&mut self) {
        if let Some(path) = rfd::FileDialog::new()
            .set_title("Select Cocos Creator Project")
            .pick_folder()
        {
            // Check if it's a valid Cocos project (has assets folder)
            let assets_dir = path.join("assets");
            if assets_dir.exists() && assets_dir.is_dir() {
                // Try to get CLI path from state or find it
                let cli_path = self.state.cli_path.clone().or_else(|| {
                    let found = find_cces_cli_path();
                    if found.is_some() {
                        self.state.cli_path = found.clone();
                    }
                    found
                });

                if let Some(cli) = cli_path {
                    println!("[Editor] Opening project: {:?}", path);
                    println!("[Editor] Using CLI: {:?}", cli);
                    self.state.open_project(path, cli);
                    self.initialize_webview_for_project();
                } else {
                    println!("[Editor] Error: CLI not found, cannot open project");
                }
            } else {
                println!("[Editor] Invalid project: {:?} (no assets folder)", path);
            }
        }
    }

    /// @zh 打开最近的项目
    /// @en Open recent project
    fn open_recent_project(&mut self, project_path: &std::path::Path) {
        if project_path.exists() {
            if let Some(ref cli_path) = self.state.cli_path.clone() {
                self.state.open_project(project_path.to_path_buf(), cli_path.clone());
                self.initialize_webview_for_project();
            }
        }
    }

    /// @zh 为项目初始化 WebView
    /// @en Initialize WebView for project
    fn initialize_webview_for_project(&mut self) {
        if self.webview_viewport.is_none() {
            let assets_path = find_ccesengine_assets_path();
            self.webview_viewport = Some(WebViewViewport::with_embedded_ccesengine(assets_path));
            self.use_webview = true;
            self.webview_initialized = false;
        }
        // Set project path for viewport to access library resources
        if let Some(ref project_path) = self.state.project_path {
            if let Some(ref mut viewport) = self.webview_viewport {
                viewport.set_project_path(project_path.clone());
            }
        }
        // Compile effects using Rust effect compiler
        self.compile_effects_for_viewport();
        // Configure viewport to use project server (will be called after viewport is ready)
        self.pending_viewport_config = true;
    }

    /// @zh 使用 Rust effect compiler 编译 effects
    /// @en Compile effects using Rust effect compiler
    fn compile_effects_for_viewport(&mut self) {
        let cli_path = match &self.state.cli_path {
            Some(p) => p.clone(),
            None => {
                println!("[EditorApp] CLI path not set, cannot compile effects");
                return;
            }
        };

        // Engine path is relative to CLI: packages/engine
        let engine_path = cli_path.join("packages").join("engine");
        let chunks_dir = engine_path.join("editor").join("assets").join("chunks");
        let effects_dir = engine_path.join("editor").join("assets").join("effects");

        if !chunks_dir.exists() {
            println!("[EditorApp] Chunks directory not found: {:?}", chunks_dir);
            return;
        }

        if !effects_dir.exists() {
            println!("[EditorApp] Effects directory not found: {:?}", effects_dir);
            return;
        }

        println!("[EditorApp] Loading chunks from: {:?}", chunks_dir);
        println!("[EditorApp] Loading effects from: {:?}", effects_dir);

        let mut compiler = EffectCompiler::new();

        // Load chunks first
        match compiler.load_chunks_from_dir(&chunks_dir) {
            Ok(count) => println!("[EditorApp] Loaded {} chunks", count),
            Err(e) => {
                println!("[EditorApp] Failed to load chunks: {}", e);
                return;
            }
        }

        // Compile effects
        match compiler.load_effects_from_dir(&effects_dir) {
            Ok(effects) => {
                println!("[EditorApp] Compiled {} effects", effects.len());
                for effect in &effects {
                    println!("[EditorApp]   - {}", effect.name);
                }

                // The HTML expects an array of effects directly, not wrapped in an object
                match serde_json::to_string(&effects) {
                    Ok(json) => {
                        println!("[EditorApp] Effects JSON ready ({} bytes)", json.len());
                        // Set effects on viewport for initialization script injection
                        if let Some(ref mut viewport) = self.webview_viewport {
                            viewport.set_pending_effects(json.clone());
                            println!("[EditorApp] Effects set on viewport for pre-injection");
                        }
                        // Also keep a copy for fallback injection
                        self.pending_effects_json = Some(json);
                    }
                    Err(e) => {
                        println!("[EditorApp] Failed to serialize effects: {}", e);
                    }
                }
            }
            Err(e) => {
                println!("[EditorApp] Failed to compile effects: {}", e);
            }
        }
    }

    /// @zh 检查加载是否完成
    /// @en Check if loading is complete
    fn check_loading_complete(&mut self) {
        // No longer need MCP - just transition to ready state
        // Viewport will load scenes directly using ccesengine
        self.state.set_loading_status("Ready");
        self.state.finish_loading();
    }

    /// @zh 尝试注入待处理的 effects
    /// @en Try to inject pending effects
    fn try_inject_pending_effects(&mut self) {
        // Only inject if we have pending effects and WebView is initialized
        if self.pending_effects_json.is_some() && self.webview_initialized {
            if let Some(effects_json) = self.pending_effects_json.take() {
                if let Some(ref webview) = self.webview_viewport {
                    match webview.inject_effects(&effects_json) {
                        Ok(()) => {
                            println!("[EditorApp] Successfully injected pending effects into WebView");
                        }
                        Err(e) => {
                            println!("[EditorApp] Failed to inject pending effects: {}", e);
                            // Put it back for retry
                            self.pending_effects_json = Some(effects_json);
                        }
                    }
                }
            }
        }

        // Configure viewport project after initialization
        if self.pending_viewport_config && self.webview_initialized {
            self.configure_viewport_project();
            self.pending_viewport_config = false;
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
                    let mode = if self.state.is_mcp_mode() { " [MCP]" } else { "" };
                    format!("ESEngine Editor - {}{}", path.file_name().unwrap_or_default().to_string_lossy(), mode)
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
                    let action = self.state.viewport_panel(ui);
                    if let Some(action) = action {
                        self.handle_viewport_action(action);
                    }
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
        // Render viewport panel with tab bar and controls
        let action = self.state.viewport_panel(ui);

        // Handle viewport actions with WebView IPC
        if let Some(action) = action {
            self.handle_viewport_action(action);
        }

        // WebView area - pass dropdown overlay rect if camera settings is open
        // The dropdown panel is 200x160 and appears below the tab bar
        let dropdown_overlay = if self.state.camera_settings_open {
            // Calculate dropdown position relative to viewport area
            // The dropdown appears at the left side of the viewport, below the tab bar
            let available = ui.available_rect_before_wrap();
            Some(egui::Rect::from_min_size(
                egui::pos2(available.left(), available.top()),
                egui::vec2(200.0, 160.0),
            ))
        } else {
            None
        };
        if let Some(ref mut viewport) = self.webview_viewport {
            webview_viewport_area(ui, viewport, dropdown_overlay);
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

    /// @zh 处理视口动作
    /// @en Handle viewport action
    fn handle_viewport_action(&mut self, action: panels::ViewportAction) {
        use panels::ViewportAction;

        match action {
            ViewportAction::SwitchToScene => {
                if let Some(ref viewport) = self.webview_viewport {
                    let _ = viewport.eval_script("if (window.esengine) { window.esengine.setEditMode(true); }");
                }
            }
            ViewportAction::SwitchToGame => {
                if let Some(ref viewport) = self.webview_viewport {
                    let _ = viewport.eval_script("if (window.esengine) { window.esengine.setEditMode(false); }");
                }
            }
            ViewportAction::ToggleViewMode(mode) => {
                let mode_str = match mode {
                    state::ViewportMode::Mode2D => "2d",
                    state::ViewportMode::Mode3D => "3d",
                };
                if let Some(ref viewport) = self.webview_viewport {
                    let script = format!("if (window.setViewMode) {{ window.setViewMode('{}'); }}", mode_str);
                    let _ = viewport.eval_script(&script);
                }
            }
            ViewportAction::ToggleGrid(visible) => {
                if let Some(ref viewport) = self.webview_viewport {
                    let script = format!("if (window.setGridVisible) {{ window.setGridVisible({}); }}", visible);
                    let _ = viewport.eval_script(&script);
                }
            }
            ViewportAction::ToggleSnap(enabled) => {
                if let Some(ref viewport) = self.webview_viewport {
                    let script = format!("if (window.setSnapEnabled) {{ window.setSnapEnabled({}); }}", enabled);
                    let _ = viewport.eval_script(&script);
                }
            }
            ViewportAction::UpdateCameraSettings { near, far, fov } => {
                if let Some(ref viewport) = self.webview_viewport {
                    let script = format!(
                        r#"
                        if (window.esengine) {{
                            if (window.esengine.setCameraNearPlane) window.esengine.setCameraNearPlane({});
                            if (window.esengine.setCameraFarPlane) window.esengine.setCameraFarPlane({});
                            if (window.esengine.setCameraFOV) window.esengine.setCameraFOV({});
                        }}
                        "#,
                        near, far, fov
                    );
                    let _ = viewport.eval_script(&script);
                }
            }
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
                    let mut selected_uuid: Option<String> = None;
                    let mut selected_path: Option<String> = None;
                    let mut idx = 0usize;
                    for item in &items {
                        self.render_hierarchy_node(ui, item, 0, &mut idx, &mut selected, &mut selected_uuid, &mut selected_path, panel_width);
                    }
                    // If selection changed, also update scene_state and viewport
                    if self.state.selected_entity != selected {
                        self.state.selected_entity = selected;
                        // Clone uuid for viewport sync before moving into scene_state
                        let uuid_for_viewport = selected_uuid.clone();
                        self.state.scene_state.select_node_with_path(selected_uuid, selected_path);
                        // Sync selection to viewport for highlighting
                        self.sync_selection_to_viewport(uuid_for_viewport.as_deref());
                    }
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

    fn render_hierarchy_node(&self, ui: &mut egui::Ui, item: &HierarchyItem, depth: usize, idx: &mut usize, selected: &mut Option<usize>, selected_uuid: &mut Option<String>, selected_path: &mut Option<String>, panel_width: f32) {
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

        // Type icon - use components to determine icon if available
        let (icon, icon_color) = if !item.components.is_empty() {
            let (icon_name, rgb) = scene_data::get_node_icon(&item.components);
            (icon_name, egui::Color32::from_rgb(rgb[0], rgb[1], rgb[2]))
        } else {
            match item.node_type {
                NodeType::World => ("globe", egui::Color32::from_rgb(0x4a, 0x9e, 0xff)),
                NodeType::Folder => ("folder", egui::Color32::from_rgb(0xdc, 0xb6, 0x7a)),
                NodeType::Camera => ("camera", egui::Color32::from_rgb(0x4a, 0x9e, 0xff)),
                NodeType::Light => ("sun", egui::Color32::from_rgb(0xff, 0xd7, 0x00)),
                NodeType::Script => ("file-code", egui::Color32::from_rgb(0x9c, 0xdc, 0xfe)),
                NodeType::Sprite => ("image", egui::Color32::from_rgb(0x4e, 0xc9, 0xb0)),
                NodeType::UI => ("layout-grid", egui::Color32::from_rgb(0xdc, 0xdc, 0xaa)),
                NodeType::Node => ("box", egui::Color32::from_rgb(0x88, 0x88, 0x88)),
            }
        };
        Icons::draw(ui.painter(), egui::pos2(x + 7.0, cy), 14.0, icon, icon_color);
        x += 20.0;

        // Type label - show first component if available, otherwise node type
        let type_str = if !item.components.is_empty() {
            item.components.first().map(|s| s.as_str()).unwrap_or("Node")
        } else {
            match item.node_type {
                NodeType::World => "World", NodeType::Folder => "Folder", NodeType::Camera => "Camera",
                NodeType::Light => "Light", NodeType::Script => "Script", NodeType::Sprite => "Sprite",
                NodeType::UI => "UI", NodeType::Node => "Node",
            }
        };

        // Fonts
        let name_font = egui::FontId::proportional(12.0);
        let type_font = egui::FontId::proportional(10.0);

        // Calculate available space
        let right_margin = 8.0;
        let spacing = 8.0;
        let available_width = row_rect.right() - x - right_margin;

        // Calculate actual text widths
        let name_full_width = ui.fonts(|f| f.layout_no_wrap(item.name.clone(), name_font.clone(), egui::Color32::WHITE).rect.width());
        let type_full_width = ui.fonts(|f| f.layout_no_wrap(type_str.to_string(), type_font.clone(), egui::Color32::WHITE).rect.width());

        // Decide on truncation strategy based on available width
        let min_type_width = 40.0;
        let min_name_width = 40.0;

        // Calculate how much space each element gets
        let (display_name, display_type, type_x) = if available_width < min_name_width + min_type_width + spacing {
            // Very narrow: just show truncated name, hide type
            let name_max = available_width.max(20.0);
            let truncated_name = self.truncate_text(ui, &item.name, &name_font, name_max);
            (truncated_name, String::new(), 0.0)
        } else {
            // Normal case: allocate space proportionally
            // Type gets up to 40% of available width, rest goes to name
            let type_max_width = (available_width * 0.4).min(type_full_width).max(min_type_width);
            let name_max_width = available_width - type_max_width - spacing;

            let truncated_name = if name_full_width > name_max_width {
                self.truncate_text(ui, &item.name, &name_font, name_max_width)
            } else {
                item.name.clone()
            };

            let truncated_type = if type_full_width > type_max_width {
                self.truncate_text(ui, type_str, &type_font, type_max_width)
            } else {
                type_str.to_string()
            };

            let type_x = row_rect.right() - right_margin;
            (truncated_name, truncated_type, type_x)
        };

        // Draw name
        let name_color = if is_selected { egui::Color32::WHITE } else { egui::Color32::from_rgb(0xe0, 0xe0, 0xe0) };
        ui.painter().text(egui::pos2(x, cy), egui::Align2::LEFT_CENTER, &display_name, name_font, name_color);

        // Draw type label (right aligned) if not hidden
        if !display_type.is_empty() {
            ui.painter().text(egui::pos2(type_x, cy), egui::Align2::RIGHT_CENTER, &display_type, type_font, egui::Color32::from_rgb(0x66, 0x66, 0x66));
        }

        // Click to select
        if response.clicked() {
            *selected = Some(current_idx);
            *selected_uuid = Some(item.uuid.clone());
            *selected_path = Some(item.path.clone());
        }

        if item.expanded {
            for child in &item.children {
                self.render_hierarchy_node(ui, child, depth + 1, idx, selected, selected_uuid, selected_path, panel_width);
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

        // Get node properties from scene state
        let props = self.state.scene_state.selected_properties.clone();
        let node_name = props.as_ref().map(|p| p.name.as_str()).unwrap_or("Node");
        let node_active = props.as_ref().map(|p| p.active).unwrap_or(true);

        // Sync inspector state with real data
        if let Some(ref p) = props {
            self.state.inspector.position = p.position;
            self.state.inspector.rotation = p.rotation;
            self.state.inspector.scale = p.scale;
            self.state.inspector.visible = p.active;
        }

        // Get component list from scene state
        let components = self.state.scene_state.selected_components.clone();

        egui::ScrollArea::vertical()
            .id_source("inspector_scroll")
            .auto_shrink([false; 2])
            .show(ui, |ui| {
                // Entity header with real node name
                let (entity_rect, _) = ui.allocate_exact_size(egui::vec2(panel_width, 32.0), egui::Sense::hover());
                let check_color = if node_active { egui::Color32::from_rgb(0x4a, 0x9e, 0xff) } else { egui::Color32::from_rgb(0x66, 0x66, 0x66) };
                Icons::draw(ui.painter(), egui::pos2(entity_rect.left() + 16.0, entity_rect.center().y), 14.0, "check", check_color);
                Icons::draw(ui.painter(), egui::pos2(entity_rect.left() + 36.0, entity_rect.center().y), 16.0, "box", egui::Color32::from_rgb(0x88, 0x88, 0x88));
                ui.painter().text(egui::pos2(entity_rect.left() + 52.0, entity_rect.center().y), egui::Align2::LEFT_CENTER, node_name, egui::FontId::proportional(14.0), egui::Color32::from_rgb(0xe8, 0xe8, 0xe8));

                // Transform component (always present with node properties)
                self.draw_component_section(ui, "Transform", "move", 0, panel_width);

                // Render each component from MCP
                for (idx, comp) in components.iter().enumerate() {
                    // Get component display name (strip "cc." prefix if present)
                    let display_name = comp.comp_type.strip_prefix("cc.").unwrap_or(&comp.comp_type);
                    let icon = scene_data::get_component_icon(display_name);
                    self.draw_dynamic_component_section(ui, display_name, icon, idx + 1, &comp.properties, panel_width);
                }

                // Show loading state if properties not yet loaded
                if props.is_none() {
                    let (loading_rect, _) = ui.allocate_exact_size(egui::vec2(panel_width, 40.0), egui::Sense::hover());
                    ui.painter().text(
                        loading_rect.center(),
                        egui::Align2::CENTER_CENTER,
                        "Loading properties...",
                        egui::FontId::proportional(11.0),
                        egui::Color32::from_rgb(0x66, 0x66, 0x66),
                    );
                }

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

    /// @zh 绘制动态组件区段（来自 MCP 的组件属性）
    /// @en Draw dynamic component section (from MCP component properties)
    fn draw_dynamic_component_section(
        &mut self,
        ui: &mut egui::Ui,
        name: &str,
        icon: &str,
        comp_idx: usize,
        properties: &std::collections::HashMap<String, PropertyValue>,
        panel_width: f32,
    ) {
        // Use a stable ID for expansion state
        let id = egui::Id::new(format!("comp_expanded_{}", comp_idx));
        let expanded = ui.memory_mut(|mem| *mem.data.get_temp_mut_or_insert_with(id, || true));

        // Header 28px
        let (header_rect, header_resp) =
            ui.allocate_exact_size(egui::vec2(panel_width, 28.0), egui::Sense::click());

        let bg_color = if header_resp.hovered() {
            egui::Color32::from_rgb(0x2a, 0x2d, 0x2e)
        } else {
            egui::Color32::from_rgb(0x25, 0x25, 0x26)
        };
        ui.painter().rect_filled(header_rect, 0.0, bg_color);
        ui.painter().line_segment(
            [
                egui::pos2(header_rect.left(), header_rect.bottom()),
                egui::pos2(header_rect.right(), header_rect.bottom()),
            ],
            egui::Stroke::new(1.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a)),
        );

        if header_resp.clicked() {
            ui.memory_mut(|mem| {
                let val = mem.data.get_temp_mut_or_insert_with(id, || true);
                *val = !*val;
            });
        }

        let cy = header_rect.center().y;
        let arrow_icon = if expanded {
            "chevron-down"
        } else {
            "chevron-right"
        };
        Icons::draw(
            ui.painter(),
            egui::pos2(header_rect.left() + 14.0, cy),
            10.0,
            arrow_icon,
            egui::Color32::from_rgb(0x6a, 0x6a, 0x6a),
        );

        let icon_color = if header_resp.hovered() || expanded {
            egui::Color32::from_rgb(0x00, 0x7a, 0xcc)
        } else {
            egui::Color32::from_rgb(0x9d, 0x9d, 0x9d)
        };
        Icons::draw(
            ui.painter(),
            egui::pos2(header_rect.left() + 30.0, cy),
            12.0,
            icon,
            icon_color,
        );

        let text_color = if header_resp.hovered() || expanded {
            egui::Color32::from_rgb(0xcc, 0xcc, 0xcc)
        } else {
            egui::Color32::from_rgb(0x9d, 0x9d, 0x9d)
        };
        ui.painter().text(
            egui::pos2(header_rect.left() + 46.0, cy),
            egui::Align2::LEFT_CENTER,
            name,
            egui::FontId::proportional(12.0),
            text_color,
        );

        // Property count badge
        let prop_count = properties.len();
        if prop_count > 0 {
            let count_text = format!("{}", prop_count);
            ui.painter().text(
                egui::pos2(header_rect.right() - 16.0, cy),
                egui::Align2::RIGHT_CENTER,
                &count_text,
                egui::FontId::proportional(10.0),
                egui::Color32::from_rgb(0x66, 0x66, 0x66),
            );
        }

        // Content - render properties
        if expanded {
            // Sort properties by name for consistent display
            let mut prop_list: Vec<_> = properties.iter().collect();
            prop_list.sort_by(|a, b| a.0.cmp(b.0));

            for (prop_name, prop_value) in prop_list {
                self.draw_property_row(ui, prop_name, prop_value, panel_width);
            }
        }
    }

    /// @zh 绘制属性行（使用统一的 widget 样式）
    /// @en Draw property row (using unified widget style)
    fn draw_property_row(&self, ui: &mut egui::Ui, name: &str, value: &PropertyValue, _panel_width: f32) {
        // Use the unified dynamic property row widget
        widgets::property_row_dynamic(ui, name, value);
    }

    /// @zh 截断文本以适应指定宽度
    /// @en Truncate text to fit within specified width
    fn truncate_text(&self, ui: &egui::Ui, text: &str, font: &egui::FontId, max_width: f32) -> String {
        let ellipsis = "...";
        let ellipsis_width = ui.fonts(|f| f.layout_no_wrap(ellipsis.to_string(), font.clone(), egui::Color32::WHITE).rect.width());

        if max_width < ellipsis_width + 10.0 {
            return ellipsis.to_string();
        }

        let full_width = ui.fonts(|f| f.layout_no_wrap(text.to_string(), font.clone(), egui::Color32::WHITE).rect.width());
        if full_width <= max_width {
            return text.to_string();
        }

        // Binary search for the right length
        let chars: Vec<char> = text.chars().collect();
        let mut left = 0;
        let mut right = chars.len();

        while left < right {
            let mid = (left + right + 1) / 2;
            let truncated: String = chars[..mid].iter().collect();
            let test = format!("{}{}", truncated, ellipsis);
            let test_width = ui.fonts(|f| f.layout_no_wrap(test.clone(), font.clone(), egui::Color32::WHITE).rect.width());

            if test_width <= max_width {
                left = mid;
            } else {
                right = mid - 1;
            }
        }

        if left == 0 {
            ellipsis.to_string()
        } else {
            let truncated: String = chars[..left].iter().collect();
            format!("{}{}", truncated, ellipsis)
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

                // Current path display
                let path_display = self.state.content_browser.current_path_display();
                ui.painter().text(egui::pos2(left_rect.left() + 10.0, left_rect.top() + 14.0), egui::Align2::LEFT_CENTER, &path_display, egui::FontId::proportional(11.0), egui::Color32::from_rgb(0x99, 0x99, 0x99));

                // Back button (if not at root)
                let can_go_up = self.state.content_browser.current_path != self.state.content_browser.root_path;
                let mut go_up = false;
                if can_go_up {
                    let back_rect = egui::Rect::from_min_size(egui::pos2(left_rect.left() + 4.0, left_rect.top() + 28.0), egui::vec2(left_width - 8.0, 22.0));
                    let back_resp = ui.interact(back_rect, egui::Id::new("cb_back"), egui::Sense::click());
                    if back_resp.hovered() {
                        ui.painter().rect_filled(back_rect, 2.0, egui::Color32::from_rgb(0x35, 0x35, 0x38));
                    }
                    Icons::draw(ui.painter(), egui::pos2(back_rect.left() + 12.0, back_rect.center().y), 12.0, "chevron-left", egui::Color32::from_rgb(0x88, 0x88, 0x88));
                    ui.painter().text(egui::pos2(back_rect.left() + 26.0, back_rect.center().y), egui::Align2::LEFT_CENTER, "..", egui::FontId::proportional(11.0), egui::Color32::from_rgb(0xaa, 0xaa, 0xaa));
                    if back_resp.clicked() {
                        go_up = true;
                    }
                }

                // Folder items
                let start_y = if can_go_up { left_rect.top() + 52.0 } else { left_rect.top() + 32.0 };
                let mut y = start_y;
                let mut clicked_folder: Option<usize> = None;
                let mut double_clicked_folder: Option<usize> = None;
                let folder_text_max_width = left_width - 40.0; // Account for icon and padding

                for (i, folder) in self.state.content_browser.folders.iter().enumerate() {
                    // Stop if we've exceeded the visible area
                    if y > left_rect.bottom() {
                        break;
                    }

                    let row_rect = egui::Rect::from_min_size(egui::pos2(left_rect.left(), y), egui::vec2(left_width, 24.0));
                    let is_sel = self.state.content_browser.selected_folder == Some(i);

                    let row_resp = ui.interact(row_rect, egui::Id::new(format!("cb_folder_{}", i)), egui::Sense::click());

                    if row_resp.hovered() && !is_sel {
                        ui.painter().rect_filled(row_rect, 0.0, egui::Color32::from_rgb(0x2d, 0x2d, 0x30));
                    }
                    if is_sel {
                        ui.painter().rect_filled(row_rect, 0.0, egui::Color32::from_rgb(0x09, 0x47, 0x71));
                    }

                    Icons::draw(ui.painter(), egui::pos2(left_rect.left() + 14.0, row_rect.center().y), 14.0, "folder", egui::Color32::from_rgb(0xdc, 0xb6, 0x7a));

                    // Truncate folder name if too long
                    let folder_font = egui::FontId::proportional(12.0);
                    let display_name = truncate_text(&folder.name, folder_text_max_width, &folder_font, ui);
                    ui.painter().text(egui::pos2(left_rect.left() + 32.0, row_rect.center().y), egui::Align2::LEFT_CENTER, &display_name, folder_font, egui::Color32::from_rgb(0xe0, 0xe0, 0xe0));

                    // Show tooltip with full name if truncated
                    if display_name != folder.name && row_resp.hovered() {
                        egui::show_tooltip_at_pointer(ui.ctx(), egui::Id::new(format!("folder_tip_{}", i)), |ui| {
                            ui.label(&folder.name);
                        });
                    }

                    if row_resp.clicked() {
                        clicked_folder = Some(i);
                    }
                    if row_resp.double_clicked() {
                        double_clicked_folder = Some(i);
                    }
                    y += 24.0;
                }
                if let Some(idx) = clicked_folder {
                    self.state.content_browser.selected_folder = Some(idx);
                }
                // Handle double-click to enter folder
                if let Some(idx) = double_clicked_folder {
                    self.state.content_browser.enter_folder(idx);
                }
                // Handle back button
                if go_up {
                    self.state.content_browser.go_up();
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

                // Breadcrumb - clickable path segments
                let breadcrumb_segments = self.state.content_browser.get_breadcrumb_segments();
                let mut bx = toolbar_rect.left() + 180.0;
                let breadcrumb_font = egui::FontId::proportional(11.0);
                let separator = " / ";
                let mut clicked_segment: Option<usize> = None;

                for (idx, segment) in breadcrumb_segments.iter().enumerate() {
                    // Draw separator (except for first segment)
                    if idx > 0 {
                        ui.painter().text(egui::pos2(bx, toolbar_rect.center().y), egui::Align2::LEFT_CENTER, separator, breadcrumb_font.clone(), egui::Color32::from_rgb(0x66, 0x66, 0x66));
                        let sep_galley = ui.fonts(|f| f.layout_no_wrap(separator.to_string(), breadcrumb_font.clone(), egui::Color32::WHITE));
                        bx += sep_galley.rect.width();
                    }

                    // Calculate segment width
                    let seg_galley = ui.fonts(|f| f.layout_no_wrap(segment.clone(), breadcrumb_font.clone(), egui::Color32::WHITE));
                    let seg_width = seg_galley.rect.width();
                    let seg_rect = egui::Rect::from_min_size(egui::pos2(bx, toolbar_rect.top() + 4.0), egui::vec2(seg_width, 20.0));

                    let seg_resp = ui.interact(seg_rect, egui::Id::new(format!("breadcrumb_{}", idx)), egui::Sense::click());
                    let text_color = if seg_resp.hovered() {
                        egui::Color32::from_rgb(0x3b, 0x82, 0xf6) // Blue on hover
                    } else if idx == breadcrumb_segments.len() - 1 {
                        egui::Color32::from_rgb(0xcc, 0xcc, 0xcc) // Current segment brighter
                    } else {
                        egui::Color32::from_rgb(0x99, 0x99, 0x99)
                    };

                    ui.painter().text(egui::pos2(bx, toolbar_rect.center().y), egui::Align2::LEFT_CENTER, segment, breadcrumb_font.clone(), text_color);

                    if seg_resp.clicked() && idx < breadcrumb_segments.len() - 1 {
                        clicked_segment = Some(idx);
                    }

                    bx += seg_width;
                }

                // Handle breadcrumb click
                if let Some(idx) = clicked_segment {
                    self.state.content_browser.navigate_to_segment(idx);
                }

                // Assets area
                let assets_rect = egui::Rect::from_min_max(egui::pos2(right_rect.left(), toolbar_rect.bottom() + 1.0), right_rect.max);
                let mut ax = assets_rect.left() + 12.0;
                let mut ay = assets_rect.top() + 8.0;
                let card_size = 64.0;
                let gap = 8.0;
                let mut clicked_asset: Option<usize> = None;
                let mut double_clicked_asset: Option<usize> = None;
                let asset_font = egui::FontId::proportional(11.0);

                for (i, asset) in self.state.content_browser.assets.iter().enumerate() {
                    // Stop if we've exceeded the visible area
                    if ay > assets_rect.bottom() {
                        break;
                    }

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
                        AssetType::Folder => "folder",
                        _ => "file"
                    };
                    Icons::draw(ui.painter(), card_rect.center(), 32.0, icon, egui::Color32::from_rgb(0x88, 0x88, 0x88));

                    // Truncate asset name if too long (max width = card_size - padding)
                    let display_name = truncate_text(&asset.name, card_size - 8.0, &asset_font, ui);
                    let text_y = ay + card_size + 10.0;

                    // Draw text background for better visibility
                    let text_rect = egui::Rect::from_min_size(
                        egui::pos2(ax, ay + card_size + 2.0),
                        egui::vec2(card_size, 16.0),
                    );
                    let text_bg = if is_sel {
                        egui::Color32::from_rgb(0x09, 0x47, 0x71)
                    } else {
                        egui::Color32::from_rgb(0x1e, 0x1e, 0x20)
                    };
                    ui.painter().rect_filled(text_rect, 2.0, text_bg);

                    // Draw text with higher contrast
                    let text_color = if is_sel {
                        egui::Color32::WHITE
                    } else {
                        egui::Color32::from_rgb(0xcc, 0xcc, 0xcc)
                    };
                    ui.painter().text(egui::pos2(ax + card_size / 2.0, text_y), egui::Align2::CENTER_CENTER, &display_name, asset_font.clone(), text_color);

                    // Show tooltip with full name if truncated or on hover for longer names
                    if (display_name != asset.name || asset.name.len() > 10) && card_resp.hovered() {
                        egui::show_tooltip_at_pointer(ui.ctx(), egui::Id::new(format!("asset_tip_{}", i)), |ui| {
                            ui.label(&asset.name);
                        });
                    }

                    if card_resp.clicked() {
                        clicked_asset = Some(i);
                    }
                    if card_resp.double_clicked() {
                        double_clicked_asset = Some(i);
                    }
                    ax += card_size + gap;
                }
                if let Some(idx) = clicked_asset {
                    self.state.content_browser.selected_asset = Some(idx);
                }
                // Handle double-click on asset
                if let Some(idx) = double_clicked_asset {
                    self.handle_asset_double_click(idx);
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

                // Copy All button
                let copy_rect = egui::Rect::from_min_size(egui::pos2(header_rect.right() - 130.0, header_rect.top() + 4.0), egui::vec2(44.0, 20.0));
                let copy_resp = ui.interact(copy_rect, egui::Id::new("output_copy"), egui::Sense::click());
                if copy_resp.hovered() {
                    ui.painter().rect_filled(copy_rect, 3.0, egui::Color32::from_rgb(0x3a, 0x3a, 0x3d));
                }
                ui.painter().text(copy_rect.center(), egui::Align2::CENTER_CENTER, "Copy", egui::FontId::proportional(11.0), egui::Color32::from_rgb(0x88, 0x88, 0x88));
                if copy_resp.clicked() {
                    let all_text: String = self.state.drawer.logs.iter()
                        .map(|e| {
                            let lvl = match e.level {
                                state::LogLevel::Info => "[INFO]",
                                state::LogLevel::Warn => "[WARN]",
                                state::LogLevel::Error => "[ERROR]",
                            };
                            let cnt = if e.count > 1 { format!("(x{}) ", e.count) } else { String::new() };
                            format!("{} {} {}{}", lvl, e.time, cnt, e.message)
                        })
                        .collect::<Vec<_>>()
                        .join("\n");
                    ui.output_mut(|o| o.copied_text = all_text);
                }

                // Clear button
                let clear_rect = egui::Rect::from_min_size(egui::pos2(header_rect.right() - 80.0, header_rect.top() + 4.0), egui::vec2(48.0, 20.0));
                let clear_resp = ui.interact(clear_rect, egui::Id::new("output_clear"), egui::Sense::click());
                if clear_resp.hovered() {
                    ui.painter().rect_filled(clear_rect, 3.0, egui::Color32::from_rgb(0x3a, 0x3a, 0x3d));
                }
                ui.painter().text(clear_rect.center(), egui::Align2::CENTER_CENTER, "Clear", egui::FontId::proportional(11.0), egui::Color32::from_rgb(0x88, 0x88, 0x88));
                if clear_resp.clicked() {
                    self.state.drawer.clear_logs();
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

                // Log content with scroll
                let content_rect = ui.available_rect_before_wrap();
                ui.allocate_ui_at_rect(content_rect, |ui| {
                    // Filter logs first
                    let filtered_logs: Vec<_> = self.state.drawer.logs.iter().enumerate().filter(|(_, entry)| {
                        let log_type = match entry.level {
                            state::LogLevel::Info => 1,
                            state::LogLevel::Warn => 2,
                            state::LogLevel::Error => 3,
                        };
                        self.state.drawer.output_filter == 0 || self.state.drawer.output_filter == log_type
                    }).collect();

                    if filtered_logs.is_empty() {
                        ui.centered_and_justified(|ui| {
                            ui.label(egui::RichText::new("No logs yet").color(egui::Color32::from_rgb(0x66, 0x66, 0x66)));
                        });
                        return;
                    }

                    egui::ScrollArea::vertical()
                        .auto_shrink([false, false])
                        .scroll_bar_visibility(egui::scroll_area::ScrollBarVisibility::AlwaysVisible)
                        .show(ui, |ui| {
                            ui.set_min_width(content_rect.width() - 16.0);
                            ui.spacing_mut().item_spacing.y = 2.0;

                            for (i, entry) in filtered_logs {
                                let color = match entry.level {
                                    state::LogLevel::Info => egui::Color32::from_rgb(0x4e, 0xc9, 0xb0),
                                    state::LogLevel::Warn => egui::Color32::from_rgb(0xdc, 0xdc, 0xaa),
                                    state::LogLevel::Error => egui::Color32::from_rgb(0xf1, 0x4c, 0x4c),
                                };

                                let level_str = match entry.level {
                                    state::LogLevel::Info => "[INFO]",
                                    state::LogLevel::Warn => "[WARN]",
                                    state::LogLevel::Error => "[ERROR]",
                                };

                                let count_str = if entry.count > 1 {
                                    format!(" (x{})", entry.count)
                                } else {
                                    String::new()
                                };

                                let full_text = format!("{} {}{} {}", level_str, entry.time, count_str, entry.message);

                                let response = ui.add(
                                    egui::Label::new(
                                        egui::RichText::new(&full_text)
                                            .monospace()
                                            .size(11.0)
                                            .color(color)
                                    ).sense(egui::Sense::click())
                                );

                                if response.clicked() {
                                    ui.output_mut(|o| o.copied_text = entry.message.clone());
                                }

                                response.on_hover_text_at_pointer(format!("Click to copy (log #{})", i));
                            }
                        });
                });
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

                // Handle menu actions
                if let Some(action) = clicked_action {
                    self.handle_menu_action(action);
                    self.state.active_menu = None;
                }
            });
    }

    /// @zh 处理资源双击事件
    /// @en Handle asset double-click event
    fn handle_asset_double_click(&mut self, index: usize) {
        let asset = match self.state.content_browser.assets.get(index) {
            Some(a) => a.clone(),
            None => return,
        };

        match asset.asset_type {
            AssetType::Folder => {
                // Enter folder (shouldn't happen in assets, but handle anyway)
            }
            AssetType::Scene => {
                // Open scene directly via viewport (no MCP needed)
                if let Some(ref root_path) = self.state.content_browser.root_path {
                    if let Some(db_url) = asset.get_db_url(root_path) {
                        println!("[ContentBrowser] Opening scene: {}", db_url);

                        // Load scene directly in viewport using ccesengine
                        self.load_scene_in_viewport(&db_url);

                        // Update UI state
                        self.state.scene_state.select_node(None);
                        self.state.drawer.add_log(state::LogEntry::info(format!("Loading scene: {}", asset.name)));
                    }
                }
            }
            AssetType::Script => {
                // TODO: Open script in external editor
                println!("[ContentBrowser] Script: {:?}", asset.path);
            }
            AssetType::Image => {
                // TODO: Preview image
                println!("[ContentBrowser] Image: {:?}", asset.path);
            }
            _ => {
                // Other asset types
                println!("[ContentBrowser] Asset: {:?}", asset.path);
            }
        }
    }

    /// @zh 处理菜单动作
    /// @en Handle menu action
    fn handle_menu_action(&mut self, action: &str) {
        match action {
            "Open Project..." => {
                self.open_project_dialog();
            }
            "Save" => {
                // TODO: Implement scene saving via viewport/ccesengine
                println!("[Menu] Save not yet implemented without MCP");
                self.state.drawer.add_log(state::LogEntry::warn("Save not yet implemented".to_string()));
            }
            _ => {}
        }
    }

    /// @zh 渲染上下文菜单
    /// @en Render context menu
    fn render_context_menu(&mut self, _ctx: &egui::Context) {
        // TODO: Implement context menu
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

/// @zh 截断文本以适应指定宽度，添加省略号
/// @en Truncate text to fit specified width, adding ellipsis
fn truncate_text(text: &str, max_width: f32, font: &egui::FontId, ui: &egui::Ui) -> String {
    let galley = ui.fonts(|f| f.layout_no_wrap(text.to_string(), font.clone(), egui::Color32::WHITE));
    if galley.rect.width() <= max_width {
        return text.to_string();
    }

    // Binary search for the right length
    let ellipsis = "…";
    let ellipsis_galley = ui.fonts(|f| f.layout_no_wrap(ellipsis.to_string(), font.clone(), egui::Color32::WHITE));
    let target_width = max_width - ellipsis_galley.rect.width();

    let chars: Vec<char> = text.chars().collect();
    let mut left = 0;
    let mut right = chars.len();

    while left < right {
        let mid = (left + right + 1) / 2;
        let substr: String = chars[..mid].iter().collect();
        let galley = ui.fonts(|f| f.layout_no_wrap(substr, font.clone(), egui::Color32::WHITE));
        if galley.rect.width() <= target_width {
            left = mid;
        } else {
            right = mid - 1;
        }
    }

    if left == 0 {
        ellipsis.to_string()
    } else {
        let truncated: String = chars[..left].iter().collect();
        format!("{}{}", truncated, ellipsis)
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
///
/// @zh 查找顺序：
/// @zh 1. 环境变量 `ECS_EDITOR_ASSETS_PATH`
/// @zh 2. 编译时 Cargo.toml 所在目录的 `public/` 子目录
/// @zh 3. 当前工作目录的 `packages/editor/public/`
/// @en Search order:
/// @en 1. Environment variable `ECS_EDITOR_ASSETS_PATH`
/// @en 2. `public/` subdirectory relative to Cargo.toml at compile time
/// @en 3. `packages/editor/public/` relative to current working directory
pub fn find_ccesengine_assets_path() -> std::path::PathBuf {
    use std::path::{Path, PathBuf};

    // 1. Check environment variable
    if let Ok(path) = std::env::var("ECS_EDITOR_ASSETS_PATH") {
        let path = PathBuf::from(&path);
        if path.join("ccesengine").exists() {
            println!("[WebView] Found assets at (env): {:?}", path);
            return path;
        }
    }

    // 2. Use compile-time path (relative to Cargo.toml)
    let manifest_dir = Path::new(env!("CARGO_MANIFEST_DIR"));
    let public_path = manifest_dir.join("public");
    if public_path.join("ccesengine").exists() {
        println!("[WebView] Found assets at (manifest): {:?}", public_path);
        return public_path;
    }

    // 3. Try relative to cwd (for workspace root execution)
    if let Ok(cwd) = std::env::current_dir() {
        let workspace_path = cwd.join("packages/editor/public");
        if workspace_path.join("ccesengine").exists() {
            println!("[WebView] Found assets at (cwd): {:?}", workspace_path);
            return workspace_path;
        }
    }

    // Fallback to manifest dir (even if ccesengine doesn't exist yet)
    println!("[WebView] Warning: ccesengine not found, using default path");
    public_path
}

/// @zh 运行 MCP 模式编辑器
/// @en Run editor in MCP mode
///
/// @zh 通过 cces-cli MCP 服务器访问场景数据。
/// @en Access scene data through cces-cli MCP server.
///
/// # Arguments
/// * `project_path` - Cocos Creator 项目路径
/// * `cli_path` - cces-cli 路径
pub fn run_editor_with_mcp(
    project_path: impl Into<std::path::PathBuf>,
    cli_path: impl Into<std::path::PathBuf>,
) -> eframe::Result<()> {
    let tokens = ThemeTokens::from_default().expect("failed to load theme tokens");
    let theme = build_egui_theme(&tokens);

    let project_path = project_path.into();
    let cli_path = cli_path.into();

    let native_options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_title("ESEngine Editor (MCP)")
            .with_inner_size([1400.0, 900.0])
            .with_decorations(false),
        ..Default::default()
    };

    println!("[MCP] Starting editor in MCP mode");
    println!("[MCP] Project path: {:?}", project_path);
    println!("[MCP] CLI path: {:?}", cli_path);

    eframe::run_native(
        "ESEngine Editor",
        native_options,
        Box::new(move |cc| {
            cc.egui_ctx.set_fonts(theme.fonts.clone());
            cc.egui_ctx.set_style(theme.style.clone());
            Box::new(EditorApp::with_mcp(tokens, project_path, cli_path))
        }),
    )
}

/// @zh 查找 cces-cli 路径
/// @en Find cces-cli path
pub fn find_cces_cli_path() -> Option<std::path::PathBuf> {
    use std::path::{Path, PathBuf};

    // 1. Check environment variable first
    if let Ok(path) = std::env::var("CCES_CLI_PATH") {
        let cli_path = PathBuf::from(&path);
        if cli_path.join("dist/cli.js").exists() {
            println!("[CLI] Found cces-cli via CCES_CLI_PATH: {:?}", cli_path);
            return Some(cli_path);
        }
    }

    // 2. Try compile-time path (relative to editor package)
    let manifest_dir = Path::new(env!("CARGO_MANIFEST_DIR"));
    let sibling_cli = manifest_dir.parent().and_then(|p| Some(p.join("cces-cli")));
    if let Some(ref cli_path) = sibling_cli {
        if cli_path.join("dist/cli.js").exists() {
            println!("[CLI] Found cces-cli (sibling): {:?}", cli_path);
            return Some(cli_path.clone());
        }
    }

    // 3. Try paths relative to cwd
    let candidates = [
        "packages/cces-cli",
        "../cces-cli",
        "cces-cli",
    ];

    let cwd = std::env::current_dir().ok();

    for candidate in &candidates {
        let path = Path::new(candidate);

        if let Some(ref cwd) = cwd {
            let full_path = cwd.join(path);
            if full_path.join("dist/cli.js").exists() {
                println!("[CLI] Found cces-cli at: {:?}", full_path);
                return Some(full_path);
            }
        }
    }

    // Check if cces-cli exists but not built
    if let Some(ref cli_path) = sibling_cli {
        if cli_path.join("package.json").exists() {
            println!("[MCP] Warning: cces-cli found at {:?} but not built (missing dist/cli.js)", cli_path);
            println!("[MCP] Please run 'npm run build' in cces-cli directory first");
            return None;
        }
    }

    println!("[MCP] Warning: Could not find cces-cli");
    println!("[MCP] Set CCES_CLI_PATH environment variable or ensure cces-cli is built");
    None
}
