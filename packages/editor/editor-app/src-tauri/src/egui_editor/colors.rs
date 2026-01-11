//! @zh 颜色工具模块
//! @en Color utilities module
//!
//! 提供 CSS 颜色解析和主题颜色访问。
//! Provides CSS color parsing and theme color access.

use eframe::egui;
use std::str::FromStr;

use crate::theme_tokens::ThemeTokens;

/// @zh 解析 CSS 颜色字符串为 egui 颜色
/// @en Parse CSS color string to egui color
pub fn css_color(css: &str) -> egui::Color32 {
    csscolorparser::Color::from_str(css)
        .ok()
        .map(|c| {
            let [r, g, b, a] = c.to_rgba8();
            egui::Color32::from_rgba_unmultiplied(r, g, b, a)
        })
        .unwrap_or(egui::Color32::from_rgb(255, 0, 255))
}

/// @zh 主题颜色访问器
/// @en Theme color accessor
pub struct ThemeColors<'a> {
    tokens: &'a ThemeTokens,
}

impl<'a> ThemeColors<'a> {
    pub fn new(tokens: &'a ThemeTokens) -> Self {
        Self { tokens }
    }

    // Background colors
    pub fn bg_base(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.bg.base)
    }

    pub fn bg_elevated(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.bg.elevated)
    }

    pub fn bg_overlay(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.bg.overlay)
    }

    pub fn bg_input(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.bg.input)
    }

    pub fn bg_hover(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.bg.hover)
    }

    pub fn bg_active(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.bg.active)
    }

    // Text colors
    pub fn text_primary(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.text.primary)
    }

    pub fn text_secondary(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.text.secondary)
    }

    pub fn text_tertiary(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.text.tertiary)
    }

    pub fn text_inverse(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.text.inverse)
    }

    // Border colors
    pub fn border_default(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.border.default)
    }

    pub fn border_subtle(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.border.subtle)
    }

    // Accent colors
    pub fn accent(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.accent.primary)
    }

    // State colors
    pub fn success(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.state.success)
    }

    pub fn warning(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.state.warning)
    }

    pub fn error(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.state.danger)
    }

    pub fn info(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.state.info)
    }

    // Special colors
    pub fn selected(&self) -> egui::Color32 {
        css_color(&self.tokens.colors.special.selected)
    }
}

/// @zh 预定义的 UI 颜色常量
/// @en Predefined UI color constants
pub mod ui {
    use eframe::egui::Color32;

    // Axis colors
    pub const AXIS_X: Color32 = Color32::from_rgb(0xf1, 0x4c, 0x4c);
    pub const AXIS_Y: Color32 = Color32::from_rgb(0x4e, 0xc9, 0x4e);
    pub const AXIS_Z: Color32 = Color32::from_rgb(0x4c, 0x9e, 0xf1);

    // Gizmo colors
    pub const GIZMO_XY: Color32 = Color32::from_rgb(0xff, 0xd7, 0x00);
    pub const GIZMO_HIGHLIGHT: Color32 = Color32::WHITE;

    // Grid colors (need to be functions since from_rgba_unmultiplied is not const)
    pub fn grid_minor() -> Color32 { Color32::from_rgba_unmultiplied(50, 50, 50, 80) }
    pub fn grid_major() -> Color32 { Color32::from_rgba_unmultiplied(60, 60, 60, 120) }

    // Panel colors
    pub const PANEL_BG: Color32 = Color32::from_rgb(0x1e, 0x1e, 0x21);
    pub const PANEL_HEADER: Color32 = Color32::from_rgb(0x2d, 0x2d, 0x30);
    pub const PANEL_BORDER: Color32 = Color32::from_rgb(0x3c, 0x3c, 0x3c);

    // Selection
    pub const SELECTION: Color32 = Color32::from_rgb(0x4a, 0x9e, 0xff);
    pub fn selection_bg() -> Color32 { Color32::from_rgba_unmultiplied(0x4a, 0x9e, 0xff, 40) }
}
