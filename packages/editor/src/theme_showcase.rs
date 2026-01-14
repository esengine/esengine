use std::str::FromStr;

use csscolorparser::Color as CssColor;
use egui::{Color32, Context, RichText, Ui, Window};
use egui_extras::TableBuilder;

use crate::{theme_egui::build_egui_theme, theme_tokens::ThemeTokens};

/// Render a simple theme showcase to visually verify token映射。
/// Call this from an egui frame (desktop preview) after loading tokens.
#[allow(dead_code)]
pub fn render_theme_showcase(ctx: &Context, tokens: &ThemeTokens) {
    let theme = build_egui_theme(tokens);
    ctx.set_fonts(theme.fonts.clone());
    ctx.set_style(theme.style.clone());

    Window::new("Theme Showcase").show(ctx, |ui| {
        ui.heading(RichText::new("Colors / Buttons / Inputs").color(Color32::WHITE));
        ui.separator();
        color_swatches(ui, tokens);
        ui.separator();
        controls(ui);
        ui.separator();
        layout_blocks(ui);
    });
}

fn color_swatches(ui: &mut Ui, tokens: &ThemeTokens) {
    ui.label("Background");
    ui.horizontal(|ui| {
        swatch(ui, "base", &tokens.colors.bg.base);
        swatch(ui, "elevated", &tokens.colors.bg.elevated);
        swatch(ui, "overlay", &tokens.colors.bg.overlay);
        swatch(ui, "input", &tokens.colors.bg.input);
    });

    ui.label("Text");
    ui.horizontal(|ui| {
        swatch(ui, "primary", &tokens.colors.text.primary);
        swatch(ui, "secondary", &tokens.colors.text.secondary);
        swatch(ui, "tertiary", &tokens.colors.text.tertiary);
        swatch(ui, "disabled", &tokens.colors.text.disabled);
    });

    ui.label("Accent / State");
    ui.horizontal(|ui| {
        swatch(ui, "primary", &tokens.colors.accent.primary);
        swatch(ui, "hover", &tokens.colors.accent.primaryHover);
        swatch(ui, "active", &tokens.colors.accent.primaryActive);
        swatch(ui, "success", &tokens.colors.state.success);
        swatch(ui, "warning", &tokens.colors.state.warning);
        swatch(ui, "error", &tokens.colors.state.error);
    });
}

fn controls(ui: &mut Ui) {
    ui.horizontal(|ui| {
        let _ = ui.button("Button");
        let _ = ui.add_enabled(false, egui::Button::new("Disabled"));
        ui.toggle_value(&mut true, "Toggle");
        ui.checkbox(&mut true, "Checkbox");
    });

    ui.horizontal(|ui| {
        let mut text = String::from("Sample input");
        ui.text_edit_singleline(&mut text);
        ui.add(egui::Slider::new(&mut 42.0f32, 0.0..=100.0).text("Slider"));
        ui.add(egui::DragValue::new(&mut 3.14f32).speed(0.1));
    });

    ui.horizontal(|ui| {
        ui.selectable_value(&mut 1, 1, "Tab A");
        ui.selectable_value(&mut 1, 2, "Tab B");
        ui.selectable_value(&mut 1, 3, "Tab C");
    });
}

fn layout_blocks(ui: &mut Ui) {
    ui.collapsing("List", |ui| {
        egui::ScrollArea::vertical()
            .max_height(120.0)
            .show(ui, |ui| {
                for i in 0..5 {
                    ui.horizontal(|ui| {
                        ui.label(format!("Row {}", i + 1));
                        ui.separator();
                        ui.monospace("monospace");
                    });
                }
            });
    });

    ui.collapsing("Table", |ui| {
        TableBuilder::new(ui)
            .column(egui_extras::Column::auto())
            .column(egui_extras::Column::remainder())
            .body(|mut body| {
                for i in 0..3 {
                    body.row(24.0, |mut row| {
                        row.col(|ui| {
                            ui.label(format!("#{}", i + 1));
                        });
                        row.col(|ui| {
                            ui.label("Lorem ipsum dolor sit amet");
                        });
                    });
                }
            });
    });
}

fn swatch(ui: &mut Ui, name: &str, css: &str) {
    let parsed = CssColor::from_str(css).ok().map(|c| {
        let [r, g, b, a] = c.to_rgba8();
        Color32::from_rgba_unmultiplied(r, g, b, a)
    });
    let c = parsed.unwrap_or(Color32::LIGHT_GRAY);
    ui.vertical(|ui| {
        let (rect, _) = ui.allocate_exact_size(egui::vec2(40.0, 20.0), egui::Sense::hover());
        let painter = ui.painter();
        painter.rect_filled(rect, ui.style().visuals.widgets.inactive.rounding, c);
        ui.small(RichText::new(name).color(Color32::WHITE));
    });
}
