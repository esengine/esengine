use std::{fs, path::Path};

use serde::Deserialize;

/// Embedded default theme json for egui desktop.
pub const DEFAULT_THEME_JSON: &str = include_str!("styles/design-tokens.json");

#[derive(Debug, thiserror::Error)]
pub enum ThemeLoadError {
    #[error("failed to read theme tokens: {0}")]
    Io(#[from] std::io::Error),
    #[error("failed to parse theme tokens: {0}")]
    Parse(#[from] serde_json::Error),
}

#[derive(Debug, Deserialize, Clone)]
pub struct ThemeTokens {
    pub colors: Colors,
    pub font: Font,
    pub spacing: Spacing,
    pub radius: Radius,
    pub shadow: Shadow,
    pub transition: Transition,
    pub z: Layers,
    pub size: Size,
    pub layout: Layout,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Colors {
    pub bg: Background,
    pub text: Text,
    pub border: Border,
    pub accent: Accent,
    pub state: State,
    pub special: Special,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Background {
    pub base: String,
    pub elevated: String,
    pub overlay: String,
    pub input: String,
    pub inset: String,
    pub hover: String,
    pub active: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Text {
    pub primary: String,
    pub secondary: String,
    pub tertiary: String,
    pub disabled: String,
    pub inverse: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Border {
    pub default: String,
    pub subtle: String,
    pub strong: String,
}

#[derive(Debug, Deserialize, Clone)]
#[allow(non_snake_case)]
pub struct Accent {
    #[serde(rename = "primary")]
    pub primary: String,
    pub primaryHover: String,
    pub primaryActive: String,
    pub primarySubtle: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct State {
    pub success: String,
    pub warning: String,
    pub error: String,
    pub danger: String,
    pub info: String,
}

#[derive(Debug, Deserialize, Clone)]
#[allow(non_snake_case)]
pub struct Special {
    pub selected: String,
    pub selectedHover: String,
    pub focus: String,
    pub shadow: String,
}

#[derive(Debug, Deserialize, Clone)]
#[allow(non_snake_case)]
pub struct Font {
    pub family: FontFamily,
    pub size: FontSize,
    pub weight: FontWeight,
    pub lineHeight: LineHeight,
}

#[derive(Debug, Deserialize, Clone)]
pub struct FontFamily {
    pub base: String,
    pub mono: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct FontSize {
    pub xs: f32,
    pub sm: f32,
    #[serde(rename = "base")]
    pub base_size: f32,
    pub md: f32,
    pub lg: f32,
    pub xl: f32,
}

#[derive(Debug, Deserialize, Clone)]
pub struct FontWeight {
    pub normal: u16,
    pub medium: u16,
    pub semibold: u16,
    pub bold: u16,
}

#[derive(Debug, Deserialize, Clone)]
pub struct LineHeight {
    pub tight: f32,
    #[serde(rename = "base")]
    pub base_height: f32,
    pub relaxed: f32,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Spacing {
    pub xs: f32,
    pub sm: f32,
    pub md: f32,
    pub lg: f32,
    pub xl: f32,
    #[serde(rename = "xxl")]
    pub xxl: f32,
    #[serde(rename = "xxxl")]
    pub xxxl: f32,
    #[serde(rename = "xxxxl")]
    pub xxxxl: f32,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Radius {
    pub none: f32,
    pub sm: f32,
    pub md: f32,
    pub lg: f32,
    pub xl: f32,
    pub full: f32,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Shadow {
    pub xs: String,
    pub sm: String,
    pub md: String,
    pub lg: String,
    pub xl: String,
    pub inner: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Transition {
    pub fast: f32,
    pub base: f32,
    pub slow: f32,
    pub bounce: f32,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Layers {
    pub base: i32,
    pub above: i32,
    pub dropdown: i32,
    pub sticky: i32,
    pub header: i32,
    pub overlay: i32,
    pub modal: i32,
    pub popover: i32,
    pub tooltip: i32,
    pub toast: i32,
    pub max: i32,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Size {
    pub icon: IconSize,
    pub input: ControlSize,
    pub button: ControlSize,
}

#[derive(Debug, Deserialize, Clone)]
pub struct IconSize {
    pub sm: f32,
    pub md: f32,
    pub lg: f32,
    pub xl: f32,
}

#[derive(Debug, Deserialize, Clone)]
pub struct ControlSize {
    pub sm: f32,
    pub md: f32,
    pub lg: f32,
}

#[derive(Debug, Deserialize, Clone)]
#[allow(non_snake_case)]
pub struct Layout {
    pub sidebarMin: f32,
    pub sidebarDefault: f32,
    pub sidebarMax: f32,
    pub header: f32,
    pub footer: f32,
    pub panelHeader: f32,
}

impl ThemeTokens {
    pub fn from_default() -> Result<Self, ThemeLoadError> {
        Self::from_str(DEFAULT_THEME_JSON)
    }

    pub fn from_reader(path: impl AsRef<Path>) -> Result<Self, ThemeLoadError> {
        let data = fs::read_to_string(path)?;
        Ok(serde_json::from_str(&data)?)
    }

    pub fn from_str(data: &str) -> Result<Self, ThemeLoadError> {
        Ok(serde_json::from_str(data)?)
    }
}
