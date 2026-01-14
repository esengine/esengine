//! @zh Viewport 面板模块
//! @en Viewport panel module
//!
//! 包含场景视口渲染和 WebView2 集成。
//! Contains scene viewport rendering and WebView2 integration.

use eframe::egui;
use std::f32::consts::PI;

use crate::egui_editor::{
    colors::ui,
    icons::Icons,
    state::{EditorState, GizmoHandle, Tool},
};

// ============================================================================
// Viewport Panel
// ============================================================================

impl EditorState {
    /// @zh 渲染视口面板
    /// @en Render viewport panel
    pub fn viewport_panel(&mut self, ui: &mut egui::Ui) {
        let panel_width = ui.available_width();

        // Tab bar
        self.viewport_tab_bar(ui, panel_width);

        // Canvas area
        let available = ui.available_rect_before_wrap();
        ui.painter().rect_filled(available, 0.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a));

        // Draw grid
        self.draw_viewport_grid(ui, available);

        // Draw origin axes
        let viewport_center = available.center();
        self.draw_origin_axes(ui, viewport_center);

        // Calculate object position in screen space
        let zoom = 1.0; // TODO: connect to camera zoom
        let obj_screen_x = viewport_center.x + self.inspector.position[0] * zoom;
        let obj_screen_y = viewport_center.y - self.inspector.position[1] * zoom;
        let obj_pos = egui::pos2(obj_screen_x, obj_screen_y);

        // Draw selected object
        if self.selected_entity.is_some() {
            self.draw_selected_object(ui, obj_pos);
            self.draw_gizmo(ui, obj_pos);
        }

        // Camera gizmo (top-right corner)
        self.draw_camera_gizmo(ui, available);

        // Handle viewport interaction
        let response = ui.allocate_rect(available, egui::Sense::click_and_drag());
        if self.selected_entity.is_some() && self.active_tool != Tool::Select {
            self.handle_gizmo_interaction(ui, &response, obj_pos);
        }
    }

    fn viewport_tab_bar(&mut self, ui: &mut egui::Ui, panel_width: f32) {
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
        }

        // Right info
        ui.painter().text(
            egui::pos2(tab_rect.right() - 8.0, tab_rect.center().y),
            egui::Align2::RIGHT_CENTER,
            "16:9 | Free Camera",
            egui::FontId::proportional(10.0),
            egui::Color32::from_rgb(0x66, 0x66, 0x66),
        );
    }

    fn draw_viewport_grid(&self, ui: &mut egui::Ui, available: egui::Rect) {
        let viewport_center = available.center();
        let spacing = 32.0;

        for i in -30..=30 {
            let offset = i as f32 * spacing;
            let color = if i % 4 == 0 { ui::grid_major() } else { ui::grid_minor() };
            let stroke_width = if i == 0 { 1.5 } else { 0.5 };

            if viewport_center.x + offset > available.left() && viewport_center.x + offset < available.right() {
                ui.painter().line_segment(
                    [
                        egui::pos2(viewport_center.x + offset, available.top()),
                        egui::pos2(viewport_center.x + offset, available.bottom()),
                    ],
                    egui::Stroke::new(stroke_width, color),
                );
            }
            if viewport_center.y + offset > available.top() && viewport_center.y + offset < available.bottom() {
                ui.painter().line_segment(
                    [
                        egui::pos2(available.left(), viewport_center.y + offset),
                        egui::pos2(available.right(), viewport_center.y + offset),
                    ],
                    egui::Stroke::new(stroke_width, color),
                );
            }
        }
    }

    fn draw_origin_axes(&self, ui: &mut egui::Ui, center: egui::Pos2) {
        let axis_len = 80.0;

        // X axis (red, pointing right)
        ui.painter().line_segment(
            [center, center + egui::vec2(axis_len, 0.0)],
            egui::Stroke::new(2.0, ui::AXIS_X),
        );
        ui.painter().text(
            center + egui::vec2(axis_len + 10.0, 0.0),
            egui::Align2::LEFT_CENTER,
            "X",
            egui::FontId::proportional(10.0),
            ui::AXIS_X,
        );

        // Y axis (green, pointing up)
        ui.painter().line_segment(
            [center, center + egui::vec2(0.0, -axis_len)],
            egui::Stroke::new(2.0, ui::AXIS_Y),
        );
        ui.painter().text(
            center + egui::vec2(0.0, -axis_len - 10.0),
            egui::Align2::CENTER_BOTTOM,
            "Y",
            egui::FontId::proportional(10.0),
            ui::AXIS_Y,
        );
    }

    fn draw_selected_object(&self, ui: &mut egui::Ui, obj_pos: egui::Pos2) {
        let obj_size = 48.0 * self.inspector.scale[0];
        ui.painter().rect_stroke(
            egui::Rect::from_center_size(obj_pos, egui::vec2(obj_size, obj_size)),
            2.0,
            egui::Stroke::new(2.0, ui::SELECTION),
        );
        Icons::draw(ui.painter(), obj_pos, 32.0, "box", egui::Color32::from_rgb(0x88, 0x88, 0x88));
    }

    fn draw_camera_gizmo(&self, ui: &mut egui::Ui, available: egui::Rect) {
        let pos = egui::pos2(available.right() - 50.0, available.top() + 50.0);
        let size = 40.0;

        ui.painter().line_segment(
            [pos, pos + egui::vec2(size * 0.7, 0.0)],
            egui::Stroke::new(2.0, ui::AXIS_X),
        );
        ui.painter().line_segment(
            [pos, pos + egui::vec2(0.0, -size * 0.7)],
            egui::Stroke::new(2.0, ui::AXIS_Y),
        );
        ui.painter().line_segment(
            [pos, pos + egui::vec2(-size * 0.4, size * 0.4)],
            egui::Stroke::new(2.0, ui::AXIS_Z),
        );

        ui.painter().text(pos + egui::vec2(size * 0.8, 0.0), egui::Align2::LEFT_CENTER, "X", egui::FontId::proportional(11.0), ui::AXIS_X);
        ui.painter().text(pos + egui::vec2(0.0, -size * 0.8), egui::Align2::CENTER_BOTTOM, "Y", egui::FontId::proportional(11.0), ui::AXIS_Y);
        ui.painter().text(pos + egui::vec2(-size * 0.5, size * 0.5), egui::Align2::CENTER_CENTER, "Z", egui::FontId::proportional(11.0), ui::AXIS_Z);
    }

    /// @zh 绘制变换 Gizmo
    /// @en Draw transform gizmo
    pub fn draw_gizmo(&self, ui: &mut egui::Ui, center: egui::Pos2) {
        let axis_length = 60.0;
        let arrow_size = 8.0;
        let handle_size = 6.0;
        let rotate_radius = 50.0;

        let hovered = self.gizmo.handle;

        match self.active_tool {
            Tool::Move => {
                // XY plane handle
                let xy_color = if hovered == GizmoHandle::XY {
                    ui::GIZMO_XY
                } else {
                    egui::Color32::from_rgba_unmultiplied(0xff, 0xd7, 0x00, 100)
                };
                let xy_rect = egui::Rect::from_center_size(center + egui::vec2(15.0, -15.0), egui::vec2(20.0, 20.0));
                ui.painter().rect_filled(xy_rect, 0.0, xy_color);

                // X axis
                let x_color = if hovered == GizmoHandle::X {
                    egui::Color32::from_rgb(0xff, 0x80, 0x80)
                } else {
                    ui::AXIS_X
                };
                ui.painter().line_segment([center, center + egui::vec2(axis_length, 0.0)], egui::Stroke::new(2.5, x_color));
                let x_end = center + egui::vec2(axis_length, 0.0);
                let x_arrow = vec![
                    x_end,
                    x_end + egui::vec2(-arrow_size, -arrow_size * 0.5),
                    x_end + egui::vec2(-arrow_size, arrow_size * 0.5),
                ];
                ui.painter().add(egui::Shape::convex_polygon(x_arrow, x_color, egui::Stroke::NONE));

                // Y axis
                let y_color = if hovered == GizmoHandle::Y {
                    egui::Color32::from_rgb(0x80, 0xff, 0x80)
                } else {
                    ui::AXIS_Y
                };
                ui.painter().line_segment([center, center + egui::vec2(0.0, -axis_length)], egui::Stroke::new(2.5, y_color));
                let y_end = center + egui::vec2(0.0, -axis_length);
                let y_arrow = vec![
                    y_end,
                    y_end + egui::vec2(-arrow_size * 0.5, arrow_size),
                    y_end + egui::vec2(arrow_size * 0.5, arrow_size),
                ];
                ui.painter().add(egui::Shape::convex_polygon(y_arrow, y_color, egui::Stroke::NONE));
            }
            Tool::Rotate => {
                let rotate_color = if hovered == GizmoHandle::Rotate {
                    ui::GIZMO_HIGHLIGHT
                } else {
                    egui::Color32::from_rgb(0x88, 0x88, 0xff)
                };
                ui.painter().circle_stroke(center, rotate_radius, egui::Stroke::new(2.0, rotate_color));

                let angle_rad = self.inspector.rotation[2] * PI / 180.0;
                let indicator_end = center + egui::vec2(angle_rad.cos() * rotate_radius, -angle_rad.sin() * rotate_radius);
                ui.painter().line_segment([center, indicator_end], egui::Stroke::new(2.0, ui::GIZMO_XY));
                ui.painter().circle_filled(indicator_end, 4.0, ui::GIZMO_XY);
            }
            Tool::Scale => {
                let half_size = 24.0 * self.inspector.scale[0];

                // X scale handle
                let x_color = if hovered == GizmoHandle::ScaleX {
                    egui::Color32::from_rgb(0xff, 0x80, 0x80)
                } else {
                    ui::AXIS_X
                };
                ui.painter().line_segment([center, center + egui::vec2(half_size + 20.0, 0.0)], egui::Stroke::new(2.0, x_color));
                ui.painter().rect_filled(
                    egui::Rect::from_center_size(center + egui::vec2(half_size + 20.0, 0.0), egui::vec2(handle_size, handle_size)),
                    0.0,
                    x_color,
                );

                // Y scale handle
                let y_color = if hovered == GizmoHandle::ScaleY {
                    egui::Color32::from_rgb(0x80, 0xff, 0x80)
                } else {
                    ui::AXIS_Y
                };
                ui.painter().line_segment([center, center + egui::vec2(0.0, -(half_size + 20.0))], egui::Stroke::new(2.0, y_color));
                ui.painter().rect_filled(
                    egui::Rect::from_center_size(center + egui::vec2(0.0, -(half_size + 20.0)), egui::vec2(handle_size, handle_size)),
                    0.0,
                    y_color,
                );

                // XY scale handle
                let xy_color = if hovered == GizmoHandle::ScaleXY {
                    ui::GIZMO_XY
                } else {
                    egui::Color32::from_rgb(0xaa, 0xaa, 0x00)
                };
                ui.painter().rect_filled(
                    egui::Rect::from_center_size(center + egui::vec2(half_size, -half_size), egui::vec2(handle_size * 1.5, handle_size * 1.5)),
                    0.0,
                    xy_color,
                );
            }
            Tool::Select => {}
        }
    }

    /// @zh 处理 Gizmo 交互
    /// @en Handle gizmo interaction
    pub fn handle_gizmo_interaction(&mut self, ui: &mut egui::Ui, response: &egui::Response, gizmo_center: egui::Pos2) {
        let mouse_pos = ui.input(|i| i.pointer.hover_pos()).unwrap_or(egui::Pos2::ZERO);
        let axis_length = 60.0;
        let rotate_radius = 50.0;
        let hit_tolerance = 10.0;

        let dx = mouse_pos.x - gizmo_center.x;
        let dy = mouse_pos.y - gizmo_center.y;

        // Hit test
        let hit_handle = match self.active_tool {
            Tool::Move => {
                if dx > 5.0 && dx < 35.0 && dy > -35.0 && dy < -5.0 {
                    GizmoHandle::XY
                } else if dx > 10.0 && dx < axis_length + 10.0 && dy.abs() < hit_tolerance {
                    GizmoHandle::X
                } else if dy < -10.0 && dy > -(axis_length + 10.0) && dx.abs() < hit_tolerance {
                    GizmoHandle::Y
                } else {
                    GizmoHandle::None
                }
            }
            Tool::Rotate => {
                let dist = (dx * dx + dy * dy).sqrt();
                if (dist - rotate_radius).abs() < hit_tolerance {
                    GizmoHandle::Rotate
                } else {
                    GizmoHandle::None
                }
            }
            Tool::Scale => {
                let half_size = 24.0 * self.inspector.scale[0];
                let handle_hit = 12.0;

                if (dx - half_size).abs() < handle_hit && (dy + half_size).abs() < handle_hit {
                    GizmoHandle::ScaleXY
                } else if (dx - (half_size + 20.0)).abs() < handle_hit && dy.abs() < handle_hit {
                    GizmoHandle::ScaleX
                } else if dx.abs() < handle_hit && (dy + half_size + 20.0).abs() < handle_hit {
                    GizmoHandle::ScaleY
                } else {
                    GizmoHandle::None
                }
            }
            Tool::Select => GizmoHandle::None,
        };

        // Update cursor
        if !self.gizmo.active {
            self.gizmo.handle = hit_handle;
            match hit_handle {
                GizmoHandle::X | GizmoHandle::ScaleX => ui.ctx().set_cursor_icon(egui::CursorIcon::ResizeHorizontal),
                GizmoHandle::Y | GizmoHandle::ScaleY => ui.ctx().set_cursor_icon(egui::CursorIcon::ResizeVertical),
                GizmoHandle::XY | GizmoHandle::ScaleXY => ui.ctx().set_cursor_icon(egui::CursorIcon::Move),
                GizmoHandle::Rotate => ui.ctx().set_cursor_icon(egui::CursorIcon::Crosshair),
                GizmoHandle::None => {}
            }
        }

        // Start drag
        if response.drag_started() && hit_handle != GizmoHandle::None {
            self.gizmo.begin(
                hit_handle,
                mouse_pos,
                [self.inspector.position[0], self.inspector.position[1]],
                self.inspector.rotation[2],
                [self.inspector.scale[0], self.inspector.scale[1]],
            );
        }

        // Handle drag
        if self.gizmo.active && response.dragged() {
            let delta_x = mouse_pos.x - self.gizmo.start_mouse.x;
            let delta_y = mouse_pos.y - self.gizmo.start_mouse.y;

            match self.gizmo.handle {
                GizmoHandle::X => {
                    self.inspector.position[0] = self.gizmo.start_pos[0] + delta_x;
                }
                GizmoHandle::Y => {
                    self.inspector.position[1] = self.gizmo.start_pos[1] - delta_y;
                }
                GizmoHandle::XY => {
                    self.inspector.position[0] = self.gizmo.start_pos[0] + delta_x;
                    self.inspector.position[1] = self.gizmo.start_pos[1] - delta_y;
                }
                GizmoHandle::Rotate => {
                    let start_angle = (self.gizmo.start_mouse.y - gizmo_center.y)
                        .atan2(self.gizmo.start_mouse.x - gizmo_center.x);
                    let current_angle = (mouse_pos.y - gizmo_center.y)
                        .atan2(mouse_pos.x - gizmo_center.x);
                    let delta_angle = (current_angle - start_angle) * 180.0 / PI;
                    self.inspector.rotation[2] = self.gizmo.start_rotation - delta_angle;
                }
                GizmoHandle::ScaleX => {
                    let scale_factor = 1.0 + delta_x / 100.0;
                    self.inspector.scale[0] = (self.gizmo.start_scale[0] * scale_factor).max(0.1);
                }
                GizmoHandle::ScaleY => {
                    let scale_factor = 1.0 - delta_y / 100.0;
                    self.inspector.scale[1] = (self.gizmo.start_scale[1] * scale_factor).max(0.1);
                }
                GizmoHandle::ScaleXY => {
                    let scale_factor = 1.0 + (delta_x - delta_y) / 100.0;
                    self.inspector.scale[0] = (self.gizmo.start_scale[0] * scale_factor).max(0.1);
                    self.inspector.scale[1] = (self.gizmo.start_scale[1] * scale_factor).max(0.1);
                }
                GizmoHandle::None => {}
            }
            ui.ctx().request_repaint();
        }

        // End drag
        if response.drag_stopped() {
            self.gizmo.reset();
        }
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
