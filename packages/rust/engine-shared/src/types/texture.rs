//! 纹理相关类型定义
//!
//! Texture-related type definitions.

/// 纹理格式
///
/// Texture format.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum TextureFormat {
    /// RGBA 8-bit（默认）| RGBA 8-bit (default)
    #[default]
    RGBA8,
    /// RGB 8-bit | RGB 8-bit
    RGB8,
    /// 单通道 8-bit | Single channel 8-bit
    R8,
    /// 双通道 8-bit | Dual channel 8-bit
    RG8,
    /// RGBA 16-bit 浮点 | RGBA 16-bit float
    RGBA16F,
    /// RGBA 32-bit 浮点 | RGBA 32-bit float
    RGBA32F,
    /// 24-bit 深度 | 24-bit depth
    Depth24,
    /// 32-bit 浮点深度 | 32-bit float depth
    Depth32F,
    /// 24-bit 深度 + 8-bit 模板 | 24-bit depth + 8-bit stencil
    Depth24Stencil8,
}

impl TextureFormat {
    /// 获取每像素字节数
    ///
    /// Get bytes per pixel.
    pub const fn bytes_per_pixel(&self) -> usize {
        match self {
            Self::R8 => 1,
            Self::RG8 => 2,
            Self::RGB8 => 3,
            Self::RGBA8 => 4,
            Self::RGBA16F => 8,
            Self::RGBA32F => 16,
            Self::Depth24 => 3,
            Self::Depth32F => 4,
            Self::Depth24Stencil8 => 4,
        }
    }

    /// 是否为深度格式
    ///
    /// Check if depth format.
    pub const fn is_depth(&self) -> bool {
        matches!(self, Self::Depth24 | Self::Depth32F | Self::Depth24Stencil8)
    }

    /// 是否为浮点格式
    ///
    /// Check if float format.
    pub const fn is_float(&self) -> bool {
        matches!(self, Self::RGBA16F | Self::RGBA32F | Self::Depth32F)
    }

    /// 获取通道数
    ///
    /// Get channel count.
    pub const fn channel_count(&self) -> u32 {
        match self {
            Self::R8 | Self::Depth24 | Self::Depth32F => 1,
            Self::RG8 | Self::Depth24Stencil8 => 2,
            Self::RGB8 => 3,
            Self::RGBA8 | Self::RGBA16F | Self::RGBA32F => 4,
        }
    }
}

/// 纹理过滤模式
///
/// Texture filter mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum TextureFilter {
    /// 最近邻（像素风格，默认）| Nearest neighbor (pixel art, default)
    #[default]
    Nearest,
    /// 线性插值（平滑）| Linear interpolation (smooth)
    Linear,
    /// 最近邻 + 最近邻 mipmap | Nearest + nearest mipmap
    NearestMipmapNearest,
    /// 线性 + 最近邻 mipmap | Linear + nearest mipmap
    LinearMipmapNearest,
    /// 最近邻 + 线性 mipmap | Nearest + linear mipmap
    NearestMipmapLinear,
    /// 线性 + 线性 mipmap（三线性过滤）| Linear + linear mipmap (trilinear)
    LinearMipmapLinear,
}

impl TextureFilter {
    /// 是否需要 mipmap
    ///
    /// Check if mipmap required.
    pub const fn requires_mipmap(&self) -> bool {
        matches!(
            self,
            Self::NearestMipmapNearest
                | Self::LinearMipmapNearest
                | Self::NearestMipmapLinear
                | Self::LinearMipmapLinear
        )
    }
}

/// 纹理环绕模式
///
/// Texture wrap mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum TextureWrap {
    /// 钳制到边缘（默认）| Clamp to edge (default)
    #[default]
    ClampToEdge,
    /// 重复 | Repeat
    Repeat,
    /// 镜像重复 | Mirrored repeat
    MirroredRepeat,
}

/// 纹理描述符
///
/// Texture descriptor.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct TextureDescriptor {
    /// 宽度 | Width
    pub width: u32,
    /// 高度 | Height
    pub height: u32,
    /// 格式 | Format
    pub format: TextureFormat,
    /// 缩小过滤 | Minification filter
    pub filter_min: TextureFilter,
    /// 放大过滤 | Magnification filter
    pub filter_mag: TextureFilter,
    /// S 方向（水平）环绕 | S (horizontal) wrap
    pub wrap_s: TextureWrap,
    /// T 方向（垂直）环绕 | T (vertical) wrap
    pub wrap_t: TextureWrap,
    /// 是否生成 mipmap | Generate mipmaps
    pub generate_mipmaps: bool,
    /// 标签（调试用）| Label (for debugging)
    pub label: Option<String>,
}

impl Default for TextureDescriptor {
    fn default() -> Self {
        Self {
            width: 1,
            height: 1,
            format: TextureFormat::RGBA8,
            filter_min: TextureFilter::Nearest,
            filter_mag: TextureFilter::Nearest,
            wrap_s: TextureWrap::ClampToEdge,
            wrap_t: TextureWrap::ClampToEdge,
            generate_mipmaps: false,
            label: None,
        }
    }
}

impl TextureDescriptor {
    /// 创建新的纹理描述符
    ///
    /// Create new texture descriptor.
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            width,
            height,
            ..Default::default()
        }
    }

    /// 设置格式
    ///
    /// Set format.
    pub fn with_format(mut self, format: TextureFormat) -> Self {
        self.format = format;
        self
    }

    /// 设置过滤模式（同时设置缩小和放大）
    ///
    /// Set filter mode (both min and mag).
    pub fn with_filter(mut self, filter: TextureFilter) -> Self {
        self.filter_min = filter;
        self.filter_mag = filter;
        self
    }

    /// 设置环绕模式（同时设置 S 和 T）
    ///
    /// Set wrap mode (both S and T).
    pub fn with_wrap(mut self, wrap: TextureWrap) -> Self {
        self.wrap_s = wrap;
        self.wrap_t = wrap;
        self
    }

    /// 启用 mipmap 生成
    ///
    /// Enable mipmap generation.
    pub fn with_mipmaps(mut self) -> Self {
        self.generate_mipmaps = true;
        self
    }

    /// 设置标签
    ///
    /// Set label.
    pub fn with_label(mut self, label: impl Into<String>) -> Self {
        self.label = Some(label.into());
        self
    }

    /// 创建像素风格纹理描述符
    ///
    /// Create pixel art texture descriptor.
    pub fn pixel_art(width: u32, height: u32) -> Self {
        Self::new(width, height)
            .with_filter(TextureFilter::Nearest)
            .with_wrap(TextureWrap::ClampToEdge)
    }

    /// 创建平滑纹理描述符
    ///
    /// Create smooth texture descriptor.
    pub fn smooth(width: u32, height: u32) -> Self {
        Self::new(width, height)
            .with_filter(TextureFilter::Linear)
            .with_wrap(TextureWrap::ClampToEdge)
    }

    /// 创建平铺纹理描述符
    ///
    /// Create tiled texture descriptor.
    pub fn tiled(width: u32, height: u32) -> Self {
        Self::new(width, height)
            .with_filter(TextureFilter::Nearest)
            .with_wrap(TextureWrap::Repeat)
    }

    /// 计算纹理数据大小（字节）
    ///
    /// Calculate texture data size (bytes).
    pub fn data_size(&self) -> usize {
        self.width as usize * self.height as usize * self.format.bytes_per_pixel()
    }
}

/// 纹理状态
///
/// Texture state.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TextureState {
    /// 加载中 | Loading
    Loading,
    /// 就绪 | Ready
    Ready,
    /// 加载失败 | Failed
    Failed(String),
}

impl TextureState {
    /// 是否就绪
    ///
    /// Check if ready.
    pub const fn is_ready(&self) -> bool {
        matches!(self, Self::Ready)
    }

    /// 是否加载中
    ///
    /// Check if loading.
    pub const fn is_loading(&self) -> bool {
        matches!(self, Self::Loading)
    }

    /// 是否失败
    ///
    /// Check if failed.
    pub const fn is_failed(&self) -> bool {
        matches!(self, Self::Failed(_))
    }
}

/// 图片数据（用于纹理上传）
///
/// Image data (for texture upload).
#[derive(Debug, Clone)]
pub struct ImageData {
    /// 宽度 | Width
    pub width: u32,
    /// 高度 | Height
    pub height: u32,
    /// 像素数据（RGBA8 格式）| Pixel data (RGBA8 format)
    pub data: Vec<u8>,
}

impl ImageData {
    /// 创建新的图片数据
    ///
    /// Create new image data.
    pub fn new(width: u32, height: u32, data: Vec<u8>) -> Self {
        debug_assert_eq!(
            data.len(),
            (width * height * 4) as usize,
            "Data size mismatch"
        );
        Self { width, height, data }
    }

    /// 创建空白图片
    ///
    /// Create blank image.
    pub fn blank(width: u32, height: u32) -> Self {
        Self {
            width,
            height,
            data: vec![0; (width * height * 4) as usize],
        }
    }

    /// 创建纯色图片
    ///
    /// Create solid color image.
    pub fn solid(width: u32, height: u32, r: u8, g: u8, b: u8, a: u8) -> Self {
        let pixel_count = (width * height) as usize;
        let mut data = Vec::with_capacity(pixel_count * 4);
        for _ in 0..pixel_count {
            data.extend_from_slice(&[r, g, b, a]);
        }
        Self { width, height, data }
    }

    /// 创建白色 1x1 纹理（默认纹理）
    ///
    /// Create white 1x1 texture (default texture).
    pub fn white_pixel() -> Self {
        Self::solid(1, 1, 255, 255, 255, 255)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_texture_descriptor_builder() {
        let desc = TextureDescriptor::new(256, 256)
            .with_format(TextureFormat::RGBA8)
            .with_filter(TextureFilter::Linear)
            .with_wrap(TextureWrap::Repeat)
            .with_label("test_texture");

        assert_eq!(desc.width, 256);
        assert_eq!(desc.height, 256);
        assert_eq!(desc.filter_min, TextureFilter::Linear);
        assert_eq!(desc.wrap_s, TextureWrap::Repeat);
        assert_eq!(desc.label, Some("test_texture".to_string()));
    }

    #[test]
    fn test_image_data_size() {
        let img = ImageData::blank(64, 64);
        assert_eq!(img.data.len(), 64 * 64 * 4);
    }

    #[test]
    fn test_texture_format_bytes() {
        assert_eq!(TextureFormat::R8.bytes_per_pixel(), 1);
        assert_eq!(TextureFormat::RGBA8.bytes_per_pixel(), 4);
        assert_eq!(TextureFormat::RGBA16F.bytes_per_pixel(), 8);
    }
}
