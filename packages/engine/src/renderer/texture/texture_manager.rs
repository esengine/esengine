//! Texture loading and management.
//! 纹理加载和管理。

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{HtmlImageElement, WebGl2RenderingContext, WebGlTexture};

use crate::core::error::{EngineError, Result};
use super::Texture;

/// 纹理加载状态
/// Texture loading state
#[derive(Debug, Clone, PartialEq)]
pub enum TextureState {
    /// 正在加载中
    /// Loading in progress
    Loading,
    /// 加载完成，可以使用
    /// Loaded and ready to use
    Ready,
    /// 加载失败
    /// Load failed
    Failed(String),
}

/// Texture manager for loading and caching textures.
/// 用于加载和缓存纹理的纹理管理器。
pub struct TextureManager {
    /// WebGL context.
    /// WebGL上下文。
    gl: WebGl2RenderingContext,

    /// Loaded textures.
    /// 已加载的纹理。
    textures: HashMap<u32, Texture>,

    /// Path to texture ID mapping.
    /// 路径到纹理ID的映射。
    path_to_id: HashMap<String, u32>,

    /// Next texture ID for auto-assignment.
    /// 下一个自动分配的纹理ID。
    next_id: u32,

    /// Default white texture for untextured rendering.
    /// 用于无纹理渲染的默认白色纹理。
    default_texture: Option<WebGlTexture>,

    /// 纹理加载状态（使用 Rc<RefCell<>> 以便闭包可以修改）
    /// Texture loading states (using Rc<RefCell<>> so closures can modify)
    texture_states: Rc<RefCell<HashMap<u32, TextureState>>>,

    /// 纹理尺寸缓存（使用 Rc<RefCell<>> 以便闭包可以修改）
    /// Texture dimensions cache (using Rc<RefCell<>> so closures can modify)
    /// Key: texture ID, Value: (width, height)
    texture_dimensions: Rc<RefCell<HashMap<u32, (u32, u32)>>>,
}

impl TextureManager {
    /// Create a new texture manager.
    /// 创建新的纹理管理器。
    pub fn new(gl: WebGl2RenderingContext) -> Self {
        let mut manager = Self {
            gl,
            textures: HashMap::new(),
            path_to_id: HashMap::new(),
            next_id: 1, // Start from 1, 0 is reserved for default
            default_texture: None,
            texture_states: Rc::new(RefCell::new(HashMap::new())),
            texture_dimensions: Rc::new(RefCell::new(HashMap::new())),
        };

        // Create default white texture | 创建默认白色纹理
        manager.create_default_texture();

        manager
    }

    /// Create a 1x1 white texture as default.
    /// 创建1x1白色纹理作为默认纹理。
    fn create_default_texture(&mut self) {
        let texture = self.gl.create_texture();
        if let Some(tex) = &texture {
            self.gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(tex));

            let white_pixel: [u8; 4] = [255, 255, 255, 255];
            let _ = self.gl.tex_image_2d_with_i32_and_i32_and_i32_and_format_and_type_and_opt_u8_array(
                WebGl2RenderingContext::TEXTURE_2D,
                0,
                WebGl2RenderingContext::RGBA as i32,
                1,
                1,
                0,
                WebGl2RenderingContext::RGBA,
                WebGl2RenderingContext::UNSIGNED_BYTE,
                Some(&white_pixel),
            );

            self.gl.tex_parameteri(
                WebGl2RenderingContext::TEXTURE_2D,
                WebGl2RenderingContext::TEXTURE_MIN_FILTER,
                WebGl2RenderingContext::NEAREST as i32,
            );
            self.gl.tex_parameteri(
                WebGl2RenderingContext::TEXTURE_2D,
                WebGl2RenderingContext::TEXTURE_MAG_FILTER,
                WebGl2RenderingContext::NEAREST as i32,
            );
        }

        self.default_texture = texture;
    }

    /// Load a texture from URL.
    /// 从URL加载纹理。
    ///
    /// Note: This is an async operation. The texture will be available
    /// after the image loads. Use `get_texture_state` to check loading status.
    /// 注意：这是一个异步操作。纹理在图片加载后可用。使用 `get_texture_state` 检查加载状态。
    pub fn load_texture(&mut self, id: u32, url: &str) -> Result<()> {
        // 设置初始状态为 Loading | Set initial state to Loading
        self.texture_states.borrow_mut().insert(id, TextureState::Loading);

        // Create placeholder texture | 创建占位纹理
        let texture = self.gl
            .create_texture()
            .ok_or_else(|| EngineError::TextureLoadFailed("Failed to create texture".into()))?;

        // Set up temporary 1x1 transparent texture | 设置临时1x1透明纹理
        // 使用透明而非灰色，这样未加载完成时不会显示奇怪的颜色
        // Use transparent instead of gray, so incomplete textures don't show strange colors
        self.gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(&texture));
        let placeholder: [u8; 4] = [0, 0, 0, 0];
        let _ = self.gl.tex_image_2d_with_i32_and_i32_and_i32_and_format_and_type_and_opt_u8_array(
            WebGl2RenderingContext::TEXTURE_2D,
            0,
            WebGl2RenderingContext::RGBA as i32,
            1,
            1,
            0,
            WebGl2RenderingContext::RGBA,
            WebGl2RenderingContext::UNSIGNED_BYTE,
            Some(&placeholder),
        );

        // Clone texture handle for async loading before storing | 在存储前克隆纹理句柄用于异步加载
        let texture_for_closure = texture.clone();

        // Store texture with placeholder size | 存储带占位符尺寸的纹理
        self.textures.insert(id, Texture::new(texture, 1, 1));

        // Clone state map for closures | 克隆状态映射用于闭包
        let states_for_onload = Rc::clone(&self.texture_states);
        let states_for_onerror = Rc::clone(&self.texture_states);

        // Clone dimensions map for closure | 克隆尺寸映射用于闭包
        let dimensions_for_onload = Rc::clone(&self.texture_dimensions);

        // Load actual image asynchronously | 异步加载实际图片
        let gl = self.gl.clone();

        let image = HtmlImageElement::new()
            .map_err(|_| EngineError::TextureLoadFailed("Failed to create image element".into()))?;

        // Set crossOrigin for CORS support | 设置crossOrigin以支持CORS
        image.set_cross_origin(Some("anonymous"));

        // Clone image for use in closure | 克隆图片用于闭包
        let image_clone = image.clone();
        let texture_id = id;

        // Set up load callback | 设置加载回调
        let onload = Closure::wrap(Box::new(move || {
            gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(&texture_for_closure));

            // Use the captured image element | 使用捕获的图片元素
            let result = gl.tex_image_2d_with_u32_and_u32_and_html_image_element(
                WebGl2RenderingContext::TEXTURE_2D,
                0,
                WebGl2RenderingContext::RGBA as i32,
                WebGl2RenderingContext::RGBA,
                WebGl2RenderingContext::UNSIGNED_BYTE,
                &image_clone,
            );

            if let Err(e) = result {
                log::error!("Failed to upload texture {}: {:?} | 纹理 {} 上传失败: {:?}", texture_id, e, texture_id, e);
                states_for_onload.borrow_mut().insert(texture_id, TextureState::Failed(format!("{:?}", e)));
                return;
            }

            // Set texture parameters | 设置纹理参数
            gl.tex_parameteri(
                WebGl2RenderingContext::TEXTURE_2D,
                WebGl2RenderingContext::TEXTURE_WRAP_S,
                WebGl2RenderingContext::CLAMP_TO_EDGE as i32,
            );
            gl.tex_parameteri(
                WebGl2RenderingContext::TEXTURE_2D,
                WebGl2RenderingContext::TEXTURE_WRAP_T,
                WebGl2RenderingContext::CLAMP_TO_EDGE as i32,
            );
            gl.tex_parameteri(
                WebGl2RenderingContext::TEXTURE_2D,
                WebGl2RenderingContext::TEXTURE_MIN_FILTER,
                WebGl2RenderingContext::LINEAR as i32,
            );
            gl.tex_parameteri(
                WebGl2RenderingContext::TEXTURE_2D,
                WebGl2RenderingContext::TEXTURE_MAG_FILTER,
                WebGl2RenderingContext::LINEAR as i32,
            );

            // 存储纹理尺寸（从加载的图片获取）
            // Store texture dimensions (from loaded image)
            let width = image_clone.width();
            let height = image_clone.height();
            dimensions_for_onload.borrow_mut().insert(texture_id, (width, height));

            // 标记为就绪 | Mark as ready
            states_for_onload.borrow_mut().insert(texture_id, TextureState::Ready);

        }) as Box<dyn Fn()>);

        // Set up error callback | 设置错误回调
        let url_for_error = url.to_string();
        let onerror = Closure::wrap(Box::new(move || {
            let error_msg = format!("Failed to load image: {}", url_for_error);
            states_for_onerror.borrow_mut().insert(texture_id, TextureState::Failed(error_msg));
        }) as Box<dyn Fn()>);

        image.set_onload(Some(onload.as_ref().unchecked_ref()));
        image.set_onerror(Some(onerror.as_ref().unchecked_ref()));
        onload.forget(); // Prevent closure from being dropped | 防止闭包被销毁
        onerror.forget();

        image.set_src(url);

        Ok(())
    }

    /// Get texture by ID.
    /// 按ID获取纹理。
    #[inline]
    pub fn get_texture(&self, id: u32) -> Option<&Texture> {
        self.textures.get(&id)
    }

    /// Get texture size by ID.
    /// 按ID获取纹理尺寸。
    ///
    /// First checks the dimensions cache (updated when texture loads),
    /// then falls back to the Texture struct.
    /// 首先检查尺寸缓存（在纹理加载时更新），
    /// 然后回退到 Texture 结构体。
    #[inline]
    pub fn get_texture_size(&self, id: u32) -> Option<(f32, f32)> {
        // Check dimensions cache first (has actual loaded dimensions)
        // 首先检查尺寸缓存（有实际加载的尺寸）
        if let Some(&(w, h)) = self.texture_dimensions.borrow().get(&id) {
            return Some((w as f32, h as f32));
        }

        // Fall back to texture struct (may have placeholder dimensions)
        // 回退到纹理结构体（可能是占位符尺寸）
        self.textures
            .get(&id)
            .map(|t| (t.width as f32, t.height as f32))
    }

    /// Bind texture for rendering.
    /// 绑定纹理用于渲染。
    pub fn bind_texture(&self, id: u32, slot: u32) {
        self.gl.active_texture(WebGl2RenderingContext::TEXTURE0 + slot);

        if let Some(texture) = self.textures.get(&id) {
            self.gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(&texture.handle));
        } else if let Some(default) = &self.default_texture {
            // ID 0 is the default texture, no warning needed
            // ID 0 是默认纹理，不需要警告
            if id != 0 {
                log::warn!("Texture {} not found, using default | 未找到纹理 {}，使用默认纹理", id, id);
            }
            self.gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(default));
        } else {
            log::error!("Texture {} not found and no default texture! | 未找到纹理 {} 且没有默认纹理！", id, id);
        }
    }

    /// Check if texture is loaded.
    /// 检查纹理是否已加载。
    #[inline]
    pub fn has_texture(&self, id: u32) -> bool {
        self.textures.contains_key(&id)
    }

    /// 获取纹理加载状态
    /// Get texture loading state
    ///
    /// 返回纹理的当前加载状态：Loading、Ready 或 Failed。
    /// Returns the current loading state of the texture: Loading, Ready, or Failed.
    #[inline]
    pub fn get_texture_state(&self, id: u32) -> TextureState {
        // ID 0 是默认纹理，始终就绪
        // ID 0 is default texture, always ready
        if id == 0 {
            return TextureState::Ready;
        }

        self.texture_states
            .borrow()
            .get(&id)
            .cloned()
            .unwrap_or(TextureState::Failed("Texture not found".to_string()))
    }

    /// 检查纹理是否已就绪可用
    /// Check if texture is ready to use
    ///
    /// 这是 `get_texture_state() == TextureState::Ready` 的便捷方法。
    /// This is a convenience method for `get_texture_state() == TextureState::Ready`.
    #[inline]
    pub fn is_texture_ready(&self, id: u32) -> bool {
        // ID 0 是默认纹理，始终就绪
        // ID 0 is default texture, always ready
        if id == 0 {
            return true;
        }

        matches!(
            self.texture_states.borrow().get(&id),
            Some(TextureState::Ready)
        )
    }

    /// 获取正在加载中的纹理数量
    /// Get the number of textures currently loading
    #[inline]
    pub fn get_loading_count(&self) -> u32 {
        self.texture_states
            .borrow()
            .values()
            .filter(|s| matches!(s, TextureState::Loading))
            .count() as u32
    }

    /// Remove texture.
    /// 移除纹理。
    pub fn remove_texture(&mut self, id: u32) {
        if let Some(texture) = self.textures.remove(&id) {
            self.gl.delete_texture(Some(&texture.handle));
        }
        // Also remove from path mapping | 同时从路径映射中移除
        self.path_to_id.retain(|_, &mut v| v != id);
        // Remove state | 移除状态
        self.texture_states.borrow_mut().remove(&id);
        // Remove dimensions | 移除尺寸
        self.texture_dimensions.borrow_mut().remove(&id);
    }

    /// Load texture by path, returning texture ID.
    /// 按路径加载纹理，返回纹理ID。
    ///
    /// If the texture is already loaded, returns existing ID.
    /// 如果纹理已加载，返回现有ID。
    pub fn load_texture_by_path(&mut self, path: &str) -> Result<u32> {
        // Check if already loaded | 检查是否已加载
        if let Some(&id) = self.path_to_id.get(path) {
            return Ok(id);
        }

        // Assign new ID and load | 分配新ID并加载
        let id = self.next_id;
        self.next_id += 1;

        // Store path mapping first | 先存储路径映射
        self.path_to_id.insert(path.to_string(), id);

        // Load texture with assigned ID | 用分配的ID加载纹理
        self.load_texture(id, path)?;

        Ok(id)
    }

    /// Get texture ID by path.
    /// 按路径获取纹理ID。
    ///
    /// Returns None if texture is not loaded.
    /// 如果纹理未加载，返回None。
    #[inline]
    pub fn get_texture_id_by_path(&self, path: &str) -> Option<u32> {
        self.path_to_id.get(path).copied()
    }

    /// Get or load texture by path.
    /// 按路径获取或加载纹理。
    ///
    /// If texture is already loaded, returns existing ID.
    /// If not loaded, loads it and returns new ID.
    /// 如果纹理已加载，返回现有ID。
    /// 如果未加载，加载它并返回新ID。
    pub fn get_or_load_by_path(&mut self, path: &str) -> Result<u32> {
        // Empty path means default texture | 空路径表示默认纹理
        if path.is_empty() {
            return Ok(0);
        }

        self.load_texture_by_path(path)
    }

    /// Clear the path-to-ID cache.
    /// 清除路径到ID的缓存映射。
    ///
    /// This should be called when restoring scene snapshots to ensure
    /// textures are reloaded with correct IDs.
    /// 在恢复场景快照时应调用此方法，以确保纹理使用正确的ID重新加载。
    pub fn clear_path_cache(&mut self) {
        self.path_to_id.clear();
    }

    /// Clear all textures and reset state.
    /// 清除所有纹理并重置状态。
    ///
    /// This removes all loaded textures from GPU memory and resets
    /// the ID counter. The default texture is preserved.
    /// 这会从GPU内存中移除所有已加载的纹理并重置ID计数器。默认纹理会被保留。
    pub fn clear_all(&mut self) {
        // Delete all textures from GPU | 从GPU删除所有纹理
        for (_, texture) in self.textures.drain() {
            self.gl.delete_texture(Some(&texture.handle));
        }

        // Clear path mapping | 清除路径映射
        self.path_to_id.clear();

        // Clear texture states | 清除纹理状态
        self.texture_states.borrow_mut().clear();

        // Clear texture dimensions | 清除纹理尺寸
        self.texture_dimensions.borrow_mut().clear();

        // Reset ID counter (1 is reserved for first texture, 0 for default)
        // 重置ID计数器（1保留给第一个纹理，0给默认纹理）
        self.next_id = 1;
    }

    /// Create a blank texture with specified dimensions.
    /// 创建具有指定尺寸的空白纹理。
    ///
    /// This is used for dynamic atlas creation where textures
    /// are later filled with content using `update_texture_region`.
    /// 用于动态图集创建，之后使用 `update_texture_region` 填充内容。
    ///
    /// # Arguments | 参数
    /// * `width` - Texture width in pixels | 纹理宽度（像素）
    /// * `height` - Texture height in pixels | 纹理高度（像素）
    ///
    /// # Returns | 返回
    /// The texture ID for the created texture | 创建的纹理ID
    pub fn create_blank_texture(&mut self, width: u32, height: u32) -> Result<u32> {
        let texture = self.gl
            .create_texture()
            .ok_or_else(|| EngineError::TextureLoadFailed("Failed to create blank texture".into()))?;

        self.gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(&texture));

        // Initialize with transparent pixels
        // 使用透明像素初始化
        let _ = self.gl.tex_image_2d_with_i32_and_i32_and_i32_and_format_and_type_and_opt_u8_array(
            WebGl2RenderingContext::TEXTURE_2D,
            0,
            WebGl2RenderingContext::RGBA as i32,
            width as i32,
            height as i32,
            0,
            WebGl2RenderingContext::RGBA,
            WebGl2RenderingContext::UNSIGNED_BYTE,
            None, // NULL data - allocate but don't fill
        );

        // Set texture parameters for atlas use
        // 设置图集使用的纹理参数
        self.gl.tex_parameteri(
            WebGl2RenderingContext::TEXTURE_2D,
            WebGl2RenderingContext::TEXTURE_WRAP_S,
            WebGl2RenderingContext::CLAMP_TO_EDGE as i32,
        );
        self.gl.tex_parameteri(
            WebGl2RenderingContext::TEXTURE_2D,
            WebGl2RenderingContext::TEXTURE_WRAP_T,
            WebGl2RenderingContext::CLAMP_TO_EDGE as i32,
        );
        self.gl.tex_parameteri(
            WebGl2RenderingContext::TEXTURE_2D,
            WebGl2RenderingContext::TEXTURE_MIN_FILTER,
            WebGl2RenderingContext::LINEAR as i32,
        );
        self.gl.tex_parameteri(
            WebGl2RenderingContext::TEXTURE_2D,
            WebGl2RenderingContext::TEXTURE_MAG_FILTER,
            WebGl2RenderingContext::LINEAR as i32,
        );

        // Assign ID and store
        // 分配ID并存储
        let id = self.next_id;
        self.next_id += 1;

        self.textures.insert(id, Texture::new(texture, width, height));
        self.texture_states.borrow_mut().insert(id, TextureState::Ready);
        self.texture_dimensions.borrow_mut().insert(id, (width, height));

        log::debug!("Created blank texture {} ({}x{}) | 创建空白纹理 {} ({}x{})", id, width, height, id, width, height);

        Ok(id)
    }

    /// Update a region of an existing texture with pixel data.
    /// 使用像素数据更新现有纹理的区域。
    ///
    /// This is used for dynamic atlas to copy individual textures
    /// into the atlas texture.
    /// 用于动态图集将单个纹理复制到图集纹理中。
    ///
    /// # Arguments | 参数
    /// * `id` - The texture ID to update | 要更新的纹理ID
    /// * `x` - X offset in the texture | 纹理中的X偏移
    /// * `y` - Y offset in the texture | 纹理中的Y偏移
    /// * `width` - Width of the region to update | 要更新的区域宽度
    /// * `height` - Height of the region to update | 要更新的区域高度
    /// * `pixels` - RGBA pixel data (4 bytes per pixel) | RGBA像素数据（每像素4字节）
    ///
    /// # Returns | 返回
    /// Ok(()) on success, Err if texture not found or update failed
    /// 成功时返回 Ok(())，纹理未找到或更新失败时返回 Err
    pub fn update_texture_region(
        &self,
        id: u32,
        x: u32,
        y: u32,
        width: u32,
        height: u32,
        pixels: &[u8],
    ) -> Result<()> {
        let texture = self.textures.get(&id)
            .ok_or_else(|| EngineError::TextureLoadFailed(format!("Texture {} not found", id)))?;

        // Validate pixel data size
        // 验证像素数据大小
        let expected_size = (width * height * 4) as usize;
        if pixels.len() != expected_size {
            return Err(EngineError::TextureLoadFailed(format!(
                "Pixel data size mismatch: expected {}, got {} | 像素数据大小不匹配：预期 {}，实际 {}",
                expected_size, pixels.len(), expected_size, pixels.len()
            )));
        }

        self.gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(&texture.handle));

        // Use texSubImage2D to update a region
        // 使用 texSubImage2D 更新区域
        self.gl.tex_sub_image_2d_with_i32_and_i32_and_u32_and_type_and_opt_u8_array(
            WebGl2RenderingContext::TEXTURE_2D,
            0,
            x as i32,
            y as i32,
            width as i32,
            height as i32,
            WebGl2RenderingContext::RGBA,
            WebGl2RenderingContext::UNSIGNED_BYTE,
            Some(pixels),
        ).map_err(|e| EngineError::TextureLoadFailed(format!("texSubImage2D failed: {:?}", e)))?;

        log::trace!("Updated texture {} region ({},{}) {}x{} | 更新纹理 {} 区域 ({},{}) {}x{}",
            id, x, y, width, height, id, x, y, width, height);

        Ok(())
    }
}
