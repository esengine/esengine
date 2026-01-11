//! @zh 可复用 UI 组件
//! @en Reusable UI widgets
//!
//! 提供编辑器中使用的各种自定义 UI 组件。
//! Provides various custom UI widgets used in the editor.

use eframe::egui;
use super::colors::ui;

// ============================================================================
// Drag Value
// ============================================================================

/// @zh 可拖拽数值输入框
/// @en Draggable value input field
pub fn drag_value(
    ui: &mut egui::Ui,
    _id: egui::Id,
    value: &mut f32,
    speed: f32,
    axis_color: egui::Color32,
) -> egui::Response {
    let width = 52.0;
    let height = 20.0;
    let (rect, response) = ui.allocate_exact_size(egui::vec2(width, height), egui::Sense::click_and_drag());

    let bg_color = if response.dragged() {
        egui::Color32::from_rgb(0x3a, 0x3a, 0x3a)
    } else if response.hovered() {
        egui::Color32::from_rgb(0x2a, 0x2a, 0x2a)
    } else {
        egui::Color32::from_rgb(0x1c, 0x1c, 0x1c)
    };

    // Background
    ui.painter().rect_filled(rect, 2.0, bg_color);
    ui.painter().rect_stroke(rect, 2.0, egui::Stroke::new(1.0, egui::Color32::from_rgb(0x38, 0x38, 0x38)));

    // Axis color indicator (left edge)
    let indicator_rect = egui::Rect::from_min_size(rect.min, egui::vec2(2.0, height));
    ui.painter().rect_filled(
        indicator_rect,
        egui::Rounding { nw: 2.0, sw: 2.0, ne: 0.0, se: 0.0 },
        axis_color,
    );

    // Handle drag
    if response.dragged() {
        let delta = response.drag_delta();
        *value += delta.x * speed;
        ui.ctx().request_repaint();
    }

    // Value text
    let text_color = if response.dragged() {
        egui::Color32::WHITE
    } else {
        egui::Color32::from_rgb(0xdd, 0xdd, 0xdd)
    };
    ui.painter().text(
        rect.center(),
        egui::Align2::CENTER_CENTER,
        format!("{:.2}", value),
        egui::FontId::monospace(11.0),
        text_color,
    );

    // Cursor hint
    if response.hovered() {
        ui.ctx().set_cursor_icon(egui::CursorIcon::ResizeHorizontal);
    }

    response
}

// ============================================================================
// Property Rows
// ============================================================================

/// @zh Vec3 属性行
/// @en Vec3 property row
pub fn property_row_vec3(ui: &mut egui::Ui, label: &str, values: &mut [f32; 3]) {
    let row_height = 22.0;
    let (row_rect, _) = ui.allocate_exact_size(egui::vec2(ui.available_width(), row_height), egui::Sense::hover());

    // Label (left side, 100px)
    ui.painter().text(
        egui::pos2(row_rect.left() + 8.0, row_rect.center().y),
        egui::Align2::LEFT_CENTER,
        label,
        egui::FontId::proportional(11.0),
        egui::Color32::from_rgb(0xaa, 0xaa, 0xaa),
    );

    // Values (right side)
    let value_start = row_rect.left() + 100.0;
    let value_width = 56.0;
    let spacing = 4.0;

    // X
    let x_rect = egui::Rect::from_min_size(
        egui::pos2(value_start, row_rect.top() + 1.0),
        egui::vec2(value_width, row_height - 2.0),
    );
    let x_id = ui.id().with(format!("{}_x", label));
    ui.allocate_ui_at_rect(x_rect, |ui| {
        drag_value(ui, x_id, &mut values[0], 0.1, ui::AXIS_X);
    });

    // Y
    let y_rect = egui::Rect::from_min_size(
        egui::pos2(value_start + value_width + spacing, row_rect.top() + 1.0),
        egui::vec2(value_width, row_height - 2.0),
    );
    let y_id = ui.id().with(format!("{}_y", label));
    ui.allocate_ui_at_rect(y_rect, |ui| {
        drag_value(ui, y_id, &mut values[1], 0.1, ui::AXIS_Y);
    });

    // Z
    let z_rect = egui::Rect::from_min_size(
        egui::pos2(value_start + (value_width + spacing) * 2.0, row_rect.top() + 1.0),
        egui::vec2(value_width, row_height - 2.0),
    );
    let z_id = ui.id().with(format!("{}_z", label));
    ui.allocate_ui_at_rect(z_rect, |ui| {
        drag_value(ui, z_id, &mut values[2], 0.1, ui::AXIS_Z);
    });
}

/// @zh 数值属性行
/// @en Number property row
pub fn property_row_number(ui: &mut egui::Ui, label: &str, value: &mut f32, speed: f32) {
    let row_height = 22.0;
    let (row_rect, _) = ui.allocate_exact_size(egui::vec2(ui.available_width(), row_height), egui::Sense::hover());

    // Label
    ui.painter().text(
        egui::pos2(row_rect.left() + 8.0, row_rect.center().y),
        egui::Align2::LEFT_CENTER,
        label,
        egui::FontId::proportional(11.0),
        egui::Color32::from_rgb(0xaa, 0xaa, 0xaa),
    );

    // Value
    let value_start = row_rect.left() + 100.0;
    let value_rect = egui::Rect::from_min_size(
        egui::pos2(value_start, row_rect.top() + 1.0),
        egui::vec2(80.0, row_height - 2.0),
    );
    let id = ui.id().with(label);
    ui.allocate_ui_at_rect(value_rect, |ui| {
        drag_value(ui, id, value, speed, egui::Color32::from_rgb(0x55, 0x55, 0x55));
    });
}

/// @zh 布尔属性行
/// @en Boolean property row
pub fn property_row_bool(ui: &mut egui::Ui, label: &str, value: &mut bool) {
    let row_height = 22.0;
    let (row_rect, _) = ui.allocate_exact_size(egui::vec2(ui.available_width(), row_height), egui::Sense::hover());

    // Label
    ui.painter().text(
        egui::pos2(row_rect.left() + 8.0, row_rect.center().y),
        egui::Align2::LEFT_CENTER,
        label,
        egui::FontId::proportional(11.0),
        egui::Color32::from_rgb(0xaa, 0xaa, 0xaa),
    );

    // Checkbox
    let checkbox_x = row_rect.left() + 100.0;
    let checkbox_rect = egui::Rect::from_center_size(
        egui::pos2(checkbox_x + 8.0, row_rect.center().y),
        egui::vec2(16.0, 16.0),
    );

    let response = ui.interact(checkbox_rect, ui.id().with(label), egui::Sense::click());

    let bg_color = if *value {
        ui::SELECTION
    } else if response.hovered() {
        egui::Color32::from_rgb(0x3a, 0x3a, 0x3a)
    } else {
        egui::Color32::from_rgb(0x2a, 0x2a, 0x2a)
    };

    ui.painter().rect_filled(checkbox_rect, 2.0, bg_color);
    ui.painter().rect_stroke(checkbox_rect, 2.0, egui::Stroke::new(1.0, egui::Color32::from_rgb(0x48, 0x48, 0x48)));

    if *value {
        // Checkmark
        let c = checkbox_rect.center();
        let stroke = egui::Stroke::new(2.0, egui::Color32::WHITE);
        ui.painter().line_segment([c + egui::vec2(-4.0, 0.0), c + egui::vec2(-1.0, 3.0)], stroke);
        ui.painter().line_segment([c + egui::vec2(-1.0, 3.0), c + egui::vec2(4.0, -3.0)], stroke);
    }

    if response.clicked() {
        *value = !*value;
    }
}

/// @zh 资源属性行
/// @en Asset property row
pub fn property_row_asset(ui: &mut egui::Ui, label: &str, value: &str, asset_type: &str) {
    let row_height = 22.0;
    let (row_rect, _) = ui.allocate_exact_size(egui::vec2(ui.available_width(), row_height), egui::Sense::hover());

    // Label
    ui.painter().text(
        egui::pos2(row_rect.left() + 8.0, row_rect.center().y),
        egui::Align2::LEFT_CENTER,
        label,
        egui::FontId::proportional(11.0),
        egui::Color32::from_rgb(0xaa, 0xaa, 0xaa),
    );

    // Asset field
    let field_start = row_rect.left() + 100.0;
    let field_rect = egui::Rect::from_min_max(
        egui::pos2(field_start, row_rect.top() + 1.0),
        egui::pos2(row_rect.right() - 8.0, row_rect.bottom() - 1.0),
    );

    ui.painter().rect_filled(field_rect, 2.0, egui::Color32::from_rgb(0x1c, 0x1c, 0x1c));
    ui.painter().rect_stroke(field_rect, 2.0, egui::Stroke::new(1.0, egui::Color32::from_rgb(0x38, 0x38, 0x38)));

    let display_text = if value.is_empty() {
        format!("None ({})", asset_type)
    } else {
        value.to_string()
    };

    ui.painter().text(
        egui::pos2(field_rect.left() + 8.0, field_rect.center().y),
        egui::Align2::LEFT_CENTER,
        display_text,
        egui::FontId::proportional(11.0),
        if value.is_empty() {
            egui::Color32::from_rgb(0x66, 0x66, 0x66)
        } else {
            egui::Color32::from_rgb(0xcc, 0xcc, 0xcc)
        },
    );
}

/// @zh 颜色属性行
/// @en Color property row
pub fn property_row_color(
    ui: &mut egui::Ui,
    label: &str,
    value: &mut [f32; 4],
    _picker_open: &mut Option<String>,
) {
    let row_height = 22.0;
    let (row_rect, _) = ui.allocate_exact_size(egui::vec2(ui.available_width(), row_height), egui::Sense::hover());

    // Label
    ui.painter().text(
        egui::pos2(row_rect.left() + 8.0, row_rect.center().y),
        egui::Align2::LEFT_CENTER,
        label,
        egui::FontId::proportional(11.0),
        egui::Color32::from_rgb(0xaa, 0xaa, 0xaa),
    );

    // Color swatch
    let swatch_rect = egui::Rect::from_min_size(
        egui::pos2(row_rect.left() + 100.0, row_rect.top() + 3.0),
        egui::vec2(row_height - 6.0, row_height - 6.0),
    );

    let color = egui::Color32::from_rgba_unmultiplied(
        (value[0] * 255.0) as u8,
        (value[1] * 255.0) as u8,
        (value[2] * 255.0) as u8,
        (value[3] * 255.0) as u8,
    );

    // Checkerboard for alpha
    let checker = egui::Color32::from_rgb(0x40, 0x40, 0x40);
    ui.painter().rect_filled(swatch_rect, 2.0, checker);
    ui.painter().rect_filled(swatch_rect, 2.0, color);
    ui.painter().rect_stroke(swatch_rect, 2.0, egui::Stroke::new(1.0, egui::Color32::from_rgb(0x48, 0x48, 0x48)));

    // Hex value
    let hex = format!(
        "#{:02X}{:02X}{:02X}{:02X}",
        (value[0] * 255.0) as u8,
        (value[1] * 255.0) as u8,
        (value[2] * 255.0) as u8,
        (value[3] * 255.0) as u8
    );
    ui.painter().text(
        egui::pos2(swatch_rect.right() + 8.0, row_rect.center().y),
        egui::Align2::LEFT_CENTER,
        hex,
        egui::FontId::monospace(10.0),
        egui::Color32::from_rgb(0x88, 0x88, 0x88),
    );
}

// ============================================================================
// Buttons
// ============================================================================

/// @zh 图标按钮
/// @en Icon button
pub fn icon_button(
    ui: &mut egui::Ui,
    icon: &str,
    tooltip: &str,
    size: f32,
) -> egui::Response {
    let (rect, response) = ui.allocate_exact_size(egui::vec2(size, size), egui::Sense::click());

    let color = if response.hovered() {
        egui::Color32::WHITE
    } else {
        egui::Color32::from_rgb(0x88, 0x88, 0x88)
    };

    if response.hovered() {
        ui.painter().rect_filled(rect, 2.0, egui::Color32::from_rgba_unmultiplied(255, 255, 255, 20));
    }

    super::icons::Icons::draw(ui.painter(), rect.center(), size * 0.6, icon, color);

    if !tooltip.is_empty() {
        response.clone().on_hover_text(tooltip);
    }

    response
}

/// @zh 工具按钮（带激活状态）
/// @en Tool button (with active state)
pub fn tool_button(
    ui: &mut egui::Ui,
    icon: &str,
    tooltip: &str,
    active: bool,
    size: f32,
) -> egui::Response {
    let (rect, response) = ui.allocate_exact_size(egui::vec2(size, size), egui::Sense::click());

    let (bg_color, icon_color) = if active {
        (egui::Color32::from_rgb(0x3b, 0x82, 0xf6), egui::Color32::WHITE)
    } else if response.hovered() {
        (egui::Color32::from_rgba_unmultiplied(255, 255, 255, 20), egui::Color32::WHITE)
    } else {
        (egui::Color32::TRANSPARENT, egui::Color32::from_rgb(0x88, 0x88, 0x88))
    };

    ui.painter().rect_filled(rect, 4.0, bg_color);
    super::icons::Icons::draw(ui.painter(), rect.center(), size * 0.5, icon, icon_color);

    if !tooltip.is_empty() {
        response.clone().on_hover_text(tooltip);
    }

    response
}

/// @zh 文本按钮
/// @en Text button
pub fn text_button(
    ui: &mut egui::Ui,
    text: &str,
    tooltip: &str,
) -> egui::Response {
    let text_width = text.len() as f32 * 7.0 + 16.0;
    let (rect, response) = ui.allocate_exact_size(egui::vec2(text_width, 24.0), egui::Sense::click());

    let (bg_color, text_color) = if response.hovered() {
        (egui::Color32::from_rgba_unmultiplied(255, 255, 255, 20), egui::Color32::WHITE)
    } else {
        (egui::Color32::TRANSPARENT, egui::Color32::from_rgb(0x88, 0x88, 0x88))
    };

    ui.painter().rect_filled(rect, 4.0, bg_color);
    ui.painter().text(
        rect.center(),
        egui::Align2::CENTER_CENTER,
        text,
        egui::FontId::proportional(11.0),
        text_color,
    );

    if !tooltip.is_empty() {
        response.clone().on_hover_text(tooltip);
    }

    response
}

// ============================================================================
// Separators
// ============================================================================

/// @zh 工具栏分隔线
/// @en Toolbar separator
pub fn toolbar_separator(ui: &mut egui::Ui, height: f32) {
    let (rect, _) = ui.allocate_exact_size(egui::vec2(9.0, height), egui::Sense::hover());
    ui.painter().line_segment(
        [egui::pos2(rect.center().x, rect.top() + 4.0), egui::pos2(rect.center().x, rect.bottom() - 4.0)],
        egui::Stroke::new(1.0, egui::Color32::from_rgb(0x44, 0x44, 0x44)),
    );
}

/// @zh 面板分隔线
/// @en Panel separator
pub fn panel_separator(ui: &mut egui::Ui) {
    let (rect, _) = ui.allocate_exact_size(egui::vec2(ui.available_width(), 1.0), egui::Sense::hover());
    ui.painter().line_segment(
        [egui::pos2(rect.left(), rect.center().y), egui::pos2(rect.right(), rect.center().y)],
        egui::Stroke::new(1.0, ui::PANEL_BORDER),
    );
}
