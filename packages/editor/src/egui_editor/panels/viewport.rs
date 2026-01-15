//! @zh Viewport 面板模块
//! @en Viewport panel module
//!
//! @zh 视口面板只负责 tab 栏和 WebView 容器。
//! @zh 所有渲染由 WebView 中的 ccesengine 完成。
//! @en Viewport panel only handles tab bar and WebView container.
//! @en All rendering is done by ccesengine in WebView.

use eframe::egui;

use crate::egui_editor::{
    colors::ui,
    state::{EditorState, ViewportMode},
};

// ============================================================================
// Viewport Action
// ============================================================================

/// @zh 视口动作，用于通知 EditorApp 执行 WebView IPC
/// @en Viewport action for notifying EditorApp to execute WebView IPC
#[derive(Debug, Clone)]
pub enum ViewportAction {
    /// @zh 切换到场景视图
    /// @en Switch to scene view
    SwitchToScene,
    /// @zh 切换到游戏视图
    /// @en Switch to game view
    SwitchToGame,
    /// @zh 切换 2D/3D 视图模式
    /// @en Toggle 2D/3D view mode
    ToggleViewMode(ViewportMode),
}

// ============================================================================
// Viewport Panel
// ============================================================================

impl EditorState {
    /// @zh 渲染视口面板（仅 tab 栏）
    /// @en Render viewport panel (tab bar only)
    ///
    /// @zh 返回用户触发的动作（如果有）
    /// @zh WebView 占用剩余空间，由 EditorApp 处理
    /// @en Returns user-triggered action (if any)
    /// @en WebView occupies remaining space, handled by EditorApp
    pub fn viewport_panel(&mut self, ui: &mut egui::Ui) -> Option<ViewportAction> {
        let panel_width = ui.available_width();

        // Tab bar only - WebView handles the rest
        self.viewport_tab_bar(ui, panel_width)
    }

    fn viewport_tab_bar(&mut self, ui: &mut egui::Ui, panel_width: f32) -> Option<ViewportAction> {
        let mut action: Option<ViewportAction> = None;
        let (tab_rect, _) = ui.allocate_exact_size(egui::vec2(panel_width, 24.0), egui::Sense::hover());
        ui.painter().rect_filled(tab_rect, 0.0, ui::PANEL_HEADER);
        ui.painter().line_segment(
            [egui::pos2(tab_rect.left(), tab_rect.bottom()), egui::pos2(tab_rect.right(), tab_rect.bottom())],
            egui::Stroke::new(1.0, ui::PANEL_BORDER),
        );

        // Scene tab
        let scene_rect = egui::Rect::from_min_size(
            egui::pos2(tab_rect.left() + 4.0, tab_rect.top() + 2.0),
            egui::vec2(60.0, 20.0),
        );
        let scene_resp = ui.interact(scene_rect, egui::Id::new("viewport_scene_tab"), egui::Sense::click());
        let scene_active = self.viewport_tab == 0;
        let scene_bg = if scene_active {
            egui::Color32::from_rgb(0x3c, 0x3c, 0x3c)
        } else if scene_resp.hovered() {
            egui::Color32::from_rgb(0x35, 0x35, 0x35)
        } else {
            egui::Color32::TRANSPARENT
        };
        ui.painter().rect_filled(scene_rect, 2.0, scene_bg);
        let scene_color = if scene_active { egui::Color32::WHITE } else { egui::Color32::from_rgb(0x88, 0x88, 0x88) };
        ui.painter().text(scene_rect.center(), egui::Align2::CENTER_CENTER, "Scene", egui::FontId::proportional(11.0), scene_color);
        if scene_resp.clicked() {
            self.viewport_tab = 0;
            action = Some(ViewportAction::SwitchToScene);
        }

        // Game tab
        let game_rect = egui::Rect::from_min_size(
            egui::pos2(scene_rect.right() + 4.0, tab_rect.top() + 2.0),
            egui::vec2(60.0, 20.0),
        );
        let game_resp = ui.interact(game_rect, egui::Id::new("viewport_game_tab"), egui::Sense::click());
        let game_active = self.viewport_tab == 1;
        let game_bg = if game_active {
            egui::Color32::from_rgb(0x3c, 0x3c, 0x3c)
        } else if game_resp.hovered() {
            egui::Color32::from_rgb(0x35, 0x35, 0x35)
        } else {
            egui::Color32::TRANSPARENT
        };
        ui.painter().rect_filled(game_rect, 2.0, game_bg);
        let game_color = if game_active { egui::Color32::WHITE } else { egui::Color32::from_rgb(0x88, 0x88, 0x88) };
        ui.painter().text(game_rect.center(), egui::Align2::CENTER_CENTER, "Game", egui::FontId::proportional(11.0), game_color);
        if game_resp.clicked() {
            self.viewport_tab = 1;
            action = Some(ViewportAction::SwitchToGame);
        }

        // ============================================================================
        // 2D/3D Toggle (right side)
        // ============================================================================
        let toggle_width = 50.0;
        let toggle_rect = egui::Rect::from_min_size(
            egui::pos2(tab_rect.right() - toggle_width - 100.0, tab_rect.top() + 2.0),
            egui::vec2(toggle_width, 20.0),
        );
        let toggle_resp = ui.interact(toggle_rect, egui::Id::new("viewport_2d3d_toggle"), egui::Sense::click());
        let toggle_bg = if toggle_resp.hovered() {
            egui::Color32::from_rgb(0x45, 0x45, 0x45)
        } else {
            egui::Color32::from_rgb(0x35, 0x35, 0x35)
        };
        ui.painter().rect_filled(toggle_rect, 2.0, toggle_bg);
        let mode_text = match self.viewport_mode {
            ViewportMode::Mode2D => "2D",
            ViewportMode::Mode3D => "3D",
        };
        ui.painter().text(
            toggle_rect.center(),
            egui::Align2::CENTER_CENTER,
            mode_text,
            egui::FontId::proportional(11.0),
            egui::Color32::WHITE,
        );
        if toggle_resp.clicked() {
            self.viewport_mode = match self.viewport_mode {
                ViewportMode::Mode2D => ViewportMode::Mode3D,
                ViewportMode::Mode3D => ViewportMode::Mode2D,
            };
            action = Some(ViewportAction::ToggleViewMode(self.viewport_mode));
        }

        // Right info
        let mode_info = match self.viewport_mode {
            ViewportMode::Mode2D => "2D | Orthographic",
            ViewportMode::Mode3D => "3D | Perspective",
        };
        ui.painter().text(
            egui::pos2(tab_rect.right() - 8.0, tab_rect.center().y),
            egui::Align2::RIGHT_CENTER,
            mode_info,
            egui::FontId::proportional(10.0),
            egui::Color32::from_rgb(0x66, 0x66, 0x66),
        );

        action
    }
}

// ============================================================================
// WebView2 Viewport Config
// ============================================================================

/// @zh WebView2 视口配置
/// @en WebView2 viewport configuration
#[derive(Clone)]
pub struct WebViewViewportConfig {
    /// @zh 视口宽度
    /// @en Viewport width
    pub width: u32,
    /// @zh 视口高度
    /// @en Viewport height
    pub height: u32,
    /// @zh 引擎 HTML 页面 URL
    /// @en Engine HTML page URL
    pub url: String,
}

impl Default for WebViewViewportConfig {
    fn default() -> Self {
        Self {
            width: 800,
            height: 600,
            url: String::from("http://localhost:5173"), // Vite dev server
        }
    }
}

// Note: WebViewViewport implementation is in egui_editor::webview module
