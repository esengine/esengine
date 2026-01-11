use crate::theme_tokens::ThemeTokens;
use csscolorparser::Color as CssColor;
use egui::{epaint::Shadow, style::ScrollStyle, style::WidgetVisuals, Color32, FontDefinitions, FontId, Margin, Rounding, Stroke, Style, Vec2, Visuals};
use std::str::FromStr;

pub struct EguiTheme {
    pub style: Style,
    pub fonts: FontDefinitions,
}

pub fn build_egui_theme(tokens: &ThemeTokens) -> EguiTheme {
    let fonts = FontDefinitions::default();

    let visuals = Visuals {
        dark_mode: true,
        window_fill: color(&tokens.colors.bg.base),
        panel_fill: color(&tokens.colors.bg.elevated),
        faint_bg_color: color(&tokens.colors.bg.overlay),
        widgets: egui::style::Widgets {
            noninteractive: widget(
                &tokens.colors.bg.inset,
                &tokens.colors.border.subtle,
                tokens.radius.md,
                &tokens.shadow.xs,
            ),
            inactive: widget(
                &tokens.colors.bg.input,
                &tokens.colors.border.default,
                tokens.radius.md,
                &tokens.shadow.xs,
            ),
            hovered: widget(
                &tokens.colors.bg.hover,
                &tokens.colors.accent.primaryHover,
                tokens.radius.md,
                &tokens.shadow.sm,
            ),
            active: widget(
                &tokens.colors.bg.active,
                &tokens.colors.accent.primaryActive,
                tokens.radius.md,
                &tokens.shadow.sm,
            ),
            open: widget(
                &tokens.colors.bg.active,
                &tokens.colors.border.default,
                tokens.radius.md,
                &tokens.shadow.sm,
            ),
        },
        selection: egui::style::Selection {
            bg_fill: color(&tokens.colors.special.selected),
            stroke: Stroke {
                width: 1.0,
                color: color(&tokens.colors.special.focus),
            },
        },
        window_shadow: shadow(&tokens.shadow.md),
        popup_shadow: shadow(&tokens.shadow.md),
        ..Default::default()
    };

    let mut style = Style::default();
    style.visuals = visuals;
    style.spacing.item_spacing = vec2(tokens.spacing.sm, tokens.spacing.sm);
    style.spacing.window_margin = Margin::same(tokens.spacing.md);
    style.spacing.button_padding = vec2(tokens.spacing.sm, (tokens.size.button.md - tokens.font.size.base_size) / 2.0);
    style.spacing.menu_margin = Margin::same(tokens.spacing.sm);
    style.spacing.indent = tokens.spacing.md;
    style.spacing.scroll = ScrollStyle {
        bar_width: tokens.spacing.sm,
        handle_min_length: tokens.spacing.xl,
        ..Default::default()
    };
    style.spacing.icon_spacing = tokens.spacing.xs;

    style.text_styles.insert(
        egui::TextStyle::Body,
        FontId::proportional(tokens.font.size.base_size),
    );
    style.text_styles.insert(egui::TextStyle::Small, FontId::proportional(tokens.font.size.sm));
    style.text_styles.insert(egui::TextStyle::Button, FontId::proportional(tokens.font.size.base_size));
    style.text_styles.insert(egui::TextStyle::Heading, FontId::proportional(tokens.font.size.lg));
    style.text_styles.insert(egui::TextStyle::Monospace, FontId::monospace(tokens.font.size.base_size));

    EguiTheme { style, fonts }
}

fn widget(bg: &str, stroke: &str, radius: f32, _shadow_css: &str) -> WidgetVisuals {
    WidgetVisuals {
        bg_fill: color(bg),
        fg_stroke: Stroke {
            width: 1.0,
            color: color(stroke),
        },
        rounding: Rounding::same(radius),
        expansion: 0.0,
        weak_bg_fill: Color32::TRANSPARENT,
        bg_stroke: Stroke::NONE,
    }
}

fn color(s: &str) -> Color32 {
    css_to_color32(s).unwrap_or(Color32::LIGHT_GRAY)
}

fn css_to_color32(s: &str) -> Option<Color32> {
    CssColor::from_str(s).ok().map(|c| {
        let [r, g, b, a] = c.to_rgba8();
        Color32::from_rgba_unmultiplied(r, g, b, a)
    })
}

fn shadow(s: &str) -> Shadow {
    parse_css_shadow(s).unwrap_or_else(|| Shadow {
        offset: Vec2::ZERO,
        blur: 0.0,
        spread: 0.0,
        color: Color32::from_rgba_unmultiplied(0, 0, 0, 128),
    })
}

fn parse_css_shadow(s: &str) -> Option<Shadow> {
    // Very small parser: picks the first shadow entry "x y blur [spread] color".
    let first = s.split(',').next()?.trim();
    let mut parts = first.split_whitespace();
    let x = parts.next()?.trim_end_matches("px").parse::<f32>().ok()?;
    let y = parts.next()?.trim_end_matches("px").parse::<f32>().ok()?;
    let blur = parts.next()?.trim_end_matches("px").parse::<f32>().ok()?;

    // spread is optional
    let mut color_str = String::new();
    if let Some(next) = parts.next() {
        if let Ok(spread) = next.trim_end_matches("px").parse::<f32>() {
            // spread present, next is color
            color_str = parts.collect::<Vec<_>>().join(" ");
            return Some(Shadow {
                offset: Vec2::new(x, y),
                blur,
                spread,
                color: css_to_color32(if color_str.is_empty() { "rgba(0,0,0,0.4)" } else { &color_str })?,
            });
        } else {
            // no spread, treat next and rest as color tokens
            color_str.push_str(next);
            if parts.clone().count() > 0 {
                color_str.push(' ');
                color_str.push_str(&parts.collect::<Vec<_>>().join(" "));
            }
            return Some(Shadow {
                offset: Vec2::new(x, y),
                blur,
                spread: 0.0,
                color: css_to_color32(&color_str)?,
            });
        }
    }

    None
}

fn vec2(x: f32, y: f32) -> Vec2 {
    Vec2::new(x, y)
}
