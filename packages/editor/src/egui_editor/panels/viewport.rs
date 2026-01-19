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
    /// @zh 切换网格显示
    /// @en Toggle grid visibility
    ToggleGrid(bool),
    /// @zh 切换网格吸附
    /// @en Toggle grid snap
    ToggleSnap(bool),
    /// @zh 更新相机设置
    /// @en Update camera settings
    UpdateCameraSettings {
        near: f32,
        far: f32,
        fov: f32,
    },
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

        let btn_height = 20.0;
        let spacing = 4.0;

        // ============================================================================
        // Left side: Scene, Game tabs and Camera Settings
        // ============================================================================

        // Scene tab
        let scene_rect = egui::Rect::from_min_size(
            egui::pos2(tab_rect.left() + 4.0, tab_rect.top() + 2.0),
            egui::vec2(50.0, btn_height),
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
            egui::pos2(scene_rect.right() + 2.0, tab_rect.top() + 2.0),
            egui::vec2(50.0, btn_height),
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

        // Separator line
        ui.painter().line_segment(
            [egui::pos2(game_rect.right() + 6.0, tab_rect.top() + 4.0), egui::pos2(game_rect.right() + 6.0, tab_rect.bottom() - 4.0)],
            egui::Stroke::new(1.0, egui::Color32::from_rgb(0x50, 0x50, 0x50)),
        );

        // Camera settings button (dropdown trigger)
        let cam_btn_rect = egui::Rect::from_min_size(
            egui::pos2(game_rect.right() + 12.0, tab_rect.top() + 2.0),
            egui::vec2(60.0, btn_height),
        );
        let cam_btn_resp = ui.interact(cam_btn_rect, egui::Id::new("viewport_camera_settings_btn"), egui::Sense::click());
        let cam_btn_bg = if self.camera_settings_open {
            egui::Color32::from_rgb(0x3b, 0x82, 0xf6) // Active blue
        } else if cam_btn_resp.hovered() {
            egui::Color32::from_rgb(0x45, 0x45, 0x45)
        } else {
            egui::Color32::from_rgb(0x35, 0x35, 0x35)
        };
        ui.painter().rect_filled(cam_btn_rect, 2.0, cam_btn_bg);
        // Camera icon (simple camera shape)
        let cam_color = if self.camera_settings_open { egui::Color32::WHITE } else { egui::Color32::from_rgb(0xaa, 0xaa, 0xaa) };
        let cc = cam_btn_rect.left_center() + egui::vec2(12.0, 0.0);
        // Camera body
        ui.painter().rect_filled(
            egui::Rect::from_center_size(cc, egui::vec2(10.0, 7.0)),
            1.0,
            cam_color,
        );
        // Camera lens
        ui.painter().circle_filled(cc + egui::vec2(6.0, 0.0), 3.0, cam_color);
        // Dropdown arrow (drawn triangle)
        let arrow_center = cam_btn_rect.right_center() - egui::vec2(10.0, 0.0);
        let arrow_size = 4.0;
        if self.camera_settings_open {
            // Up arrow
            ui.painter().add(egui::Shape::convex_polygon(
                vec![
                    egui::pos2(arrow_center.x, arrow_center.y - arrow_size),
                    egui::pos2(arrow_center.x - arrow_size, arrow_center.y + arrow_size * 0.5),
                    egui::pos2(arrow_center.x + arrow_size, arrow_center.y + arrow_size * 0.5),
                ],
                cam_color,
                egui::Stroke::NONE,
            ));
        } else {
            // Down arrow
            ui.painter().add(egui::Shape::convex_polygon(
                vec![
                    egui::pos2(arrow_center.x - arrow_size, arrow_center.y - arrow_size * 0.5),
                    egui::pos2(arrow_center.x + arrow_size, arrow_center.y - arrow_size * 0.5),
                    egui::pos2(arrow_center.x, arrow_center.y + arrow_size),
                ],
                cam_color,
                egui::Stroke::NONE,
            ));
        }
        if cam_btn_resp.clicked() {
            self.camera_settings_open = !self.camera_settings_open;
        }

        // ============================================================================
        // Right side: Controls (Grid, Snap, 2D/3D, Mode info)
        // ============================================================================
        let right_margin = 8.0;
        let info_width = 80.0;
        let btn_width = 32.0;

        // Mode info text (rightmost)
        let mode_info = match self.viewport_mode {
            ViewportMode::Mode2D => "2D | Ortho",
            ViewportMode::Mode3D => "3D | Persp",
        };
        ui.painter().text(
            egui::pos2(tab_rect.right() - right_margin, tab_rect.center().y),
            egui::Align2::RIGHT_CENTER,
            mode_info,
            egui::FontId::proportional(10.0),
            egui::Color32::from_rgb(0x66, 0x66, 0x66),
        );

        // 2D/3D Toggle button
        let toggle_width = 36.0;
        let toggle_x = tab_rect.right() - right_margin - info_width - toggle_width;
        let toggle_rect = egui::Rect::from_min_size(
            egui::pos2(toggle_x, tab_rect.top() + 2.0),
            egui::vec2(toggle_width, btn_height),
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

        // Grid toggle button
        let grid_x = toggle_x - spacing - btn_width;
        let grid_rect = egui::Rect::from_min_size(
            egui::pos2(grid_x, tab_rect.top() + 2.0),
            egui::vec2(btn_width, btn_height),
        );
        let grid_resp = ui.interact(grid_rect, egui::Id::new("viewport_grid_toggle"), egui::Sense::click());
        let grid_bg = if self.show_grid {
            egui::Color32::from_rgb(0x3b, 0x82, 0xf6)
        } else if grid_resp.hovered() {
            egui::Color32::from_rgb(0x45, 0x45, 0x45)
        } else {
            egui::Color32::from_rgb(0x35, 0x35, 0x35)
        };
        ui.painter().rect_filled(grid_rect, 2.0, grid_bg);
        let icon_color = if self.show_grid { egui::Color32::WHITE } else { egui::Color32::from_rgb(0x88, 0x88, 0x88) };
        let gc = grid_rect.center();
        let gs = 5.0;
        ui.painter().line_segment([egui::pos2(gc.x - gs, gc.y - gs), egui::pos2(gc.x - gs, gc.y + gs)], egui::Stroke::new(1.0, icon_color));
        ui.painter().line_segment([egui::pos2(gc.x, gc.y - gs), egui::pos2(gc.x, gc.y + gs)], egui::Stroke::new(1.0, icon_color));
        ui.painter().line_segment([egui::pos2(gc.x + gs, gc.y - gs), egui::pos2(gc.x + gs, gc.y + gs)], egui::Stroke::new(1.0, icon_color));
        ui.painter().line_segment([egui::pos2(gc.x - gs, gc.y - gs), egui::pos2(gc.x + gs, gc.y - gs)], egui::Stroke::new(1.0, icon_color));
        ui.painter().line_segment([egui::pos2(gc.x - gs, gc.y), egui::pos2(gc.x + gs, gc.y)], egui::Stroke::new(1.0, icon_color));
        ui.painter().line_segment([egui::pos2(gc.x - gs, gc.y + gs), egui::pos2(gc.x + gs, gc.y + gs)], egui::Stroke::new(1.0, icon_color));
        if grid_resp.clicked() {
            self.show_grid = !self.show_grid;
            action = Some(ViewportAction::ToggleGrid(self.show_grid));
        }

        // Snap toggle button
        let snap_x = grid_x - spacing - btn_width;
        let snap_rect = egui::Rect::from_min_size(
            egui::pos2(snap_x, tab_rect.top() + 2.0),
            egui::vec2(btn_width, btn_height),
        );
        let snap_resp = ui.interact(snap_rect, egui::Id::new("viewport_snap_toggle"), egui::Sense::click());
        let snap_bg = if self.snap_enabled {
            egui::Color32::from_rgb(0x3b, 0x82, 0xf6)
        } else if snap_resp.hovered() {
            egui::Color32::from_rgb(0x45, 0x45, 0x45)
        } else {
            egui::Color32::from_rgb(0x35, 0x35, 0x35)
        };
        ui.painter().rect_filled(snap_rect, 2.0, snap_bg);
        let snap_color = if self.snap_enabled { egui::Color32::WHITE } else { egui::Color32::from_rgb(0x88, 0x88, 0x88) };
        let sc = snap_rect.center();
        ui.painter().line_segment([egui::pos2(sc.x - 4.0, sc.y - 5.0), egui::pos2(sc.x - 4.0, sc.y + 2.0)], egui::Stroke::new(2.0, snap_color));
        ui.painter().line_segment([egui::pos2(sc.x + 4.0, sc.y - 5.0), egui::pos2(sc.x + 4.0, sc.y + 2.0)], egui::Stroke::new(2.0, snap_color));
        ui.painter().line_segment([egui::pos2(sc.x - 4.0, sc.y + 2.0), egui::pos2(sc.x + 4.0, sc.y + 2.0)], egui::Stroke::new(2.0, snap_color));
        if snap_resp.clicked() {
            self.snap_enabled = !self.snap_enabled;
            action = Some(ViewportAction::ToggleSnap(self.snap_enabled));
        }

        // ============================================================================
        // Camera Settings Dropdown Panel (rendered as popup Area)
        // ============================================================================
        // Store cam_btn_rect position for Area positioning
        let dropdown_pos = egui::pos2(cam_btn_rect.left(), tab_rect.bottom() + 2.0);

        if self.camera_settings_open {
            // Use Area with Order::Foreground to render on top of WebView
            egui::Area::new(egui::Id::new("camera_settings_popup"))
                .order(egui::Order::Foreground)
                .fixed_pos(dropdown_pos)
                .show(ui.ctx(), |ui| {
                    let panel_width = 200.0;
                    let panel_height = 160.0;

                    egui::Frame::none()
                        .fill(egui::Color32::from_rgb(0x2d, 0x2d, 0x30))
                        .stroke(egui::Stroke::new(1.0, egui::Color32::from_rgb(0x50, 0x50, 0x50)))
                        .rounding(4.0)
                        .shadow(egui::epaint::Shadow {
                            offset: egui::vec2(0.0, 2.0),
                            blur: 8.0,
                            spread: 0.0,
                            color: egui::Color32::from_black_alpha(100),
                        })
                        .show(ui, |ui| {
                            ui.set_min_size(egui::vec2(panel_width, panel_height));
                            ui.set_max_size(egui::vec2(panel_width, panel_height));

                            ui.vertical(|ui| {
                                ui.add_space(4.0);
                                ui.horizontal(|ui| {
                                    ui.add_space((panel_width - 90.0) / 2.0);
                                    ui.label(egui::RichText::new("Camera Settings").color(egui::Color32::from_rgb(0x88, 0x88, 0x88)).size(11.0));
                                });
                                ui.add_space(4.0);

                                // Near Plane
                                ui.horizontal(|ui| {
                                    ui.add_space(8.0);
                                    ui.label(egui::RichText::new("Near").color(egui::Color32::from_rgb(0xaa, 0xaa, 0xaa)).size(11.0));
                                    ui.add_space(20.0);
                                    for preset in [0.01_f32, 0.1, 1.0, 10.0] {
                                        let is_active = (self.camera_near_plane - preset).abs() < 0.001;
                                        if ui.add(egui::Button::new(
                                            egui::RichText::new(format!("{}", preset)).size(9.0)
                                        ).fill(if is_active { egui::Color32::from_rgb(0x3b, 0x82, 0xf6) } else { egui::Color32::from_rgb(0x38, 0x38, 0x38) })
                                        .min_size(egui::vec2(28.0, 18.0))).clicked() {
                                            self.camera_near_plane = preset;
                                            action = Some(ViewportAction::UpdateCameraSettings {
                                                near: self.camera_near_plane,
                                                far: self.camera_far_plane,
                                                fov: self.camera_fov,
                                            });
                                        }
                                    }
                                });

                                // Far Plane
                                ui.horizontal(|ui| {
                                    ui.add_space(8.0);
                                    ui.label(egui::RichText::new("Far").color(egui::Color32::from_rgb(0xaa, 0xaa, 0xaa)).size(11.0));
                                    ui.add_space(28.0);
                                    for (preset, label) in [(1000.0_f32, "1K"), (10000.0, "10K"), (100000.0, "100K"), (1000000.0, "1M")] {
                                        let is_active = (self.camera_far_plane - preset).abs() < 1.0;
                                        if ui.add(egui::Button::new(
                                            egui::RichText::new(label).size(9.0)
                                        ).fill(if is_active { egui::Color32::from_rgb(0x3b, 0x82, 0xf6) } else { egui::Color32::from_rgb(0x38, 0x38, 0x38) })
                                        .min_size(egui::vec2(28.0, 18.0))).clicked() {
                                            self.camera_far_plane = preset;
                                            action = Some(ViewportAction::UpdateCameraSettings {
                                                near: self.camera_near_plane,
                                                far: self.camera_far_plane,
                                                fov: self.camera_fov,
                                            });
                                        }
                                    }
                                });

                                // FOV
                                ui.horizontal(|ui| {
                                    ui.add_space(8.0);
                                    ui.label(egui::RichText::new("FOV").color(egui::Color32::from_rgb(0xaa, 0xaa, 0xaa)).size(11.0));
                                    ui.add_space(24.0);
                                    for preset in [45.0_f32, 60.0, 75.0, 90.0] {
                                        let is_active = (self.camera_fov - preset).abs() < 0.1;
                                        if ui.add(egui::Button::new(
                                            egui::RichText::new(format!("{}°", preset as i32)).size(9.0)
                                        ).fill(if is_active { egui::Color32::from_rgb(0x3b, 0x82, 0xf6) } else { egui::Color32::from_rgb(0x38, 0x38, 0x38) })
                                        .min_size(egui::vec2(28.0, 18.0))).clicked() {
                                            self.camera_fov = preset;
                                            action = Some(ViewportAction::UpdateCameraSettings {
                                                near: self.camera_near_plane,
                                                far: self.camera_far_plane,
                                                fov: self.camera_fov,
                                            });
                                        }
                                    }
                                });

                                ui.add_space(4.0);
                                ui.separator();
                                ui.add_space(2.0);

                                // Current values display
                                let info_text = format!(
                                    "Near: {}  Far: {}  FOV: {}°",
                                    self.camera_near_plane,
                                    if self.camera_far_plane >= 1000000.0 { format!("{}M", (self.camera_far_plane / 1000000.0) as i32) }
                                    else if self.camera_far_plane >= 1000.0 { format!("{}K", (self.camera_far_plane / 1000.0) as i32) }
                                    else { format!("{}", self.camera_far_plane as i32) },
                                    self.camera_fov as i32,
                                );
                                ui.horizontal(|ui| {
                                    ui.add_space((panel_width - 140.0) / 2.0);
                                    ui.label(egui::RichText::new(info_text).color(egui::Color32::from_rgb(0x66, 0x66, 0x66)).size(9.0));
                                });
                            });
                        });
                });

            // Close panel if clicked outside
            let panel_rect = egui::Rect::from_min_size(dropdown_pos, egui::vec2(200.0, 160.0));
            if ui.ctx().input(|i| i.pointer.any_click()) {
                if let Some(pos) = ui.ctx().pointer_interact_pos() {
                    if !panel_rect.expand(10.0).contains(pos) && !cam_btn_rect.contains(pos) {
                        self.camera_settings_open = false;
                    }
                }
            }
        }

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
