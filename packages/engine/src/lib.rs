//! ES Engine - High-performance 2D game engine for web and mobile platforms.
//! ES引擎 - 高性能2D游戏引擎，支持Web和移动平台。
//!
//! # Architecture | 架构
//!
//! The engine is designed with a modular architecture:
//! 引擎采用模块化架构设计：
//!
//! - `core` - Engine lifecycle and context management | 引擎生命周期和上下文管理
//! - `renderer` - 2D rendering with batch optimization | 2D渲染与批处理优化
//! - `math` - Mathematical primitives (vectors, matrices) | 数学基元（向量、矩阵）
//! - `resource` - Asset loading and management | 资源加载和管理
//! - `input` - Keyboard, mouse, and touch input | 键盘、鼠标和触摸输入
//! - `platform` - Platform abstraction layer | 平台抽象层
//!
//! # Example | 示例
//!
//! ```typescript
//! import { GameEngine } from 'es-engine';
//!
//! const engine = new GameEngine('canvas');
//! engine.loadTexture('player', 'assets/player.png');
//!
//! function gameLoop() {
//!     engine.clear(0.0, 0.0, 0.0, 1.0);
//!     engine.submitSpriteBatch(transforms, textureIds, uvs, colors);
//!     engine.render();
//!     requestAnimationFrame(gameLoop);
//! }
//! ```

#![warn(missing_docs)]
#![warn(rustdoc::missing_crate_level_docs)]

use wasm_bindgen::prelude::*;

// Module declarations | 模块声明
pub mod backend;
pub mod core;
pub mod math;
pub mod platform;
pub mod renderer;
pub mod resource;
pub mod input;

// Re-exports | 重新导出
pub use crate::core::{Engine, EngineConfig};
pub use crate::core::error::{EngineError, Result};
pub use crate::backend::WebGL2Backend;

// Re-export shared types for convenience | 重新导出共享类型以方便使用
pub use es_engine_shared::{
    traits::backend::{GraphicsBackend, GraphicsError, GraphicsResult, GraphicsFeature, BufferUsage},
    types::{
        handle::{Handle, HandleMap, BufferHandle, TextureHandle, ShaderHandle, VertexArrayHandle},
        vertex::{VertexLayout, VertexAttribute, VertexAttributeType, SpriteVertex},
        blend::{BlendMode, RenderState, ScissorRect},
        texture::{TextureDescriptor, TextureFormat, TextureFilter, TextureWrap},
    },
};

/// Initialize panic hook for better error messages in console.
/// 初始化panic hook以在控制台显示更好的错误信息。
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();

    // Initialize logger | 初始化日志
    console_log::init_with_level(log::Level::Debug)
        .expect("Failed to initialize logger | 日志初始化失败");

    log::info!("ES Engine initialized | ES引擎初始化完成");
}

/// Game engine main interface exposed to JavaScript.
/// 暴露给JavaScript的游戏引擎主接口。
///
/// This is the primary entry point for the engine from TypeScript/JavaScript.
/// 这是从TypeScript/JavaScript访问引擎的主要入口点。
#[wasm_bindgen]
pub struct GameEngine {
    engine: Engine,
}

#[wasm_bindgen]
impl GameEngine {
    /// Create a new game engine instance.
    /// 创建新的游戏引擎实例。
    ///
    /// # Arguments | 参数
    /// * `canvas_id` - The HTML canvas element ID | HTML canvas元素ID
    ///
    /// # Returns | 返回
    /// A new GameEngine instance or an error | 新的GameEngine实例或错误
    #[wasm_bindgen(constructor)]
    pub fn new(canvas_id: &str) -> std::result::Result<GameEngine, JsValue> {
        let config = EngineConfig::default();
        let engine = Engine::new(canvas_id, config)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        Ok(GameEngine { engine })
    }

    /// Create a new game engine from external WebGL context.
    /// 从外部 WebGL 上下文创建引擎。
    ///
    /// This is designed for WeChat MiniGame and similar environments.
    /// 适用于微信小游戏等环境。
    #[wasm_bindgen(js_name = fromExternal)]
    pub fn from_external(
        gl_context: JsValue,
        width: u32,
        height: u32,
    ) -> std::result::Result<GameEngine, JsValue> {
        let config = EngineConfig::default();
        let engine = Engine::from_external(gl_context, width, height, config)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        Ok(GameEngine { engine })
    }

    /// Clear the screen with specified color.
    /// 使用指定颜色清除屏幕。
    ///
    /// # Arguments | 参数
    /// * `r` - Red component (0.0-1.0) | 红色分量
    /// * `g` - Green component (0.0-1.0) | 绿色分量
    /// * `b` - Blue component (0.0-1.0) | 蓝色分量
    /// * `a` - Alpha component (0.0-1.0) | 透明度分量
    pub fn clear(&self, r: f32, g: f32, b: f32, a: f32) {
        self.engine.clear(r, g, b, a);
    }

    /// Get canvas width.
    /// 获取画布宽度。
    #[wasm_bindgen(getter)]
    pub fn width(&self) -> u32 {
        self.engine.width()
    }

    /// Get canvas height.
    /// 获取画布高度。
    #[wasm_bindgen(getter)]
    pub fn height(&self) -> u32 {
        self.engine.height()
    }

    /// Submit sprite batch data for rendering.
    /// 提交精灵批次数据进行渲染。
    ///
    /// # Arguments | 参数
    /// * `transforms` - Float32Array [x, y, rotation, scaleX, scaleY, originX, originY] per sprite
    ///                  每个精灵的变换数据
    /// * `texture_ids` - Uint32Array of texture IDs | 纹理ID数组
    /// * `uvs` - Float32Array [u0, v0, u1, v1] per sprite | 每个精灵的UV坐标
    /// * `colors` - Uint32Array of packed RGBA colors | 打包的RGBA颜色数组
    /// * `material_ids` - Uint32Array of material IDs (0 = default) | 材质ID数组（0 = 默认）
    #[wasm_bindgen(js_name = submitSpriteBatch)]
    pub fn submit_sprite_batch(
        &mut self,
        transforms: &[f32],
        texture_ids: &[u32],
        uvs: &[f32],
        colors: &[u32],
        material_ids: &[u32],
    ) -> std::result::Result<(), JsValue> {
        self.engine
            .submit_sprite_batch(transforms, texture_ids, uvs, colors, material_ids)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Submit MSDF text batch for rendering.
    /// 提交 MSDF 文本批次进行渲染。
    ///
    /// # Arguments | 参数
    /// * `positions` - Float32Array [x, y, ...] for each vertex (4 per glyph)
    /// * `tex_coords` - Float32Array [u, v, ...] for each vertex
    /// * `colors` - Float32Array [r, g, b, a, ...] for each vertex
    /// * `outline_colors` - Float32Array [r, g, b, a, ...] for each vertex
    /// * `outline_widths` - Float32Array [width, ...] for each vertex
    /// * `texture_id` - Font atlas texture ID
    /// * `px_range` - Pixel range for MSDF shader
    #[wasm_bindgen(js_name = submitTextBatch)]
    pub fn submit_text_batch(
        &mut self,
        positions: &[f32],
        tex_coords: &[f32],
        colors: &[f32],
        outline_colors: &[f32],
        outline_widths: &[f32],
        texture_id: u32,
        px_range: f32,
    ) -> std::result::Result<(), JsValue> {
        self.engine
            .submit_text_batch(positions, tex_coords, colors, outline_colors, outline_widths, texture_id, px_range)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Submit mesh batch for rendering arbitrary 2D geometry.
    /// 提交网格批次进行任意 2D 几何体渲染。
    ///
    /// Used for rendering ellipses, polygons, and other complex shapes.
    /// 用于渲染椭圆、多边形和其他复杂形状。
    ///
    /// # Arguments | 参数
    /// * `positions` - Float32Array [x, y, ...] for each vertex
    /// * `uvs` - Float32Array [u, v, ...] for each vertex
    /// * `colors` - Uint32Array of packed RGBA colors (one per vertex)
    /// * `indices` - Uint16Array of triangle indices
    /// * `texture_id` - Texture ID to use (0 for white pixel)
    #[wasm_bindgen(js_name = submitMeshBatch)]
    pub fn submit_mesh_batch(
        &mut self,
        positions: &[f32],
        uvs: &[f32],
        colors: &[u32],
        indices: &[u16],
        texture_id: u32,
    ) -> std::result::Result<(), JsValue> {
        self.engine
            .submit_mesh_batch(positions, uvs, colors, indices, texture_id)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Render the current frame.
    /// 渲染当前帧。
    pub fn render(&mut self) -> std::result::Result<(), JsValue> {
        self.engine
            .render()
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Render sprites as overlay (without clearing screen).
    /// 渲染精灵作为叠加层（不清除屏幕）。
    ///
    /// This is used for UI rendering on top of the world content.
    /// 用于在世界内容上渲染 UI。
    #[wasm_bindgen(js_name = renderOverlay)]
    pub fn render_overlay(&mut self) -> std::result::Result<(), JsValue> {
        self.engine
            .render_overlay()
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Set scissor rect for clipping (screen coordinates, Y-down).
    /// 设置裁剪矩形（屏幕坐标，Y 轴向下）。
    ///
    /// Content outside this rect will be clipped.
    /// 此矩形外的内容将被裁剪。
    ///
    /// # Arguments | 参数
    /// * `x` - Left edge in screen coordinates | 屏幕坐标中的左边缘
    /// * `y` - Top edge in screen coordinates (Y-down) | 屏幕坐标中的上边缘（Y 向下）
    /// * `width` - Rect width | 矩形宽度
    /// * `height` - Rect height | 矩形高度
    #[wasm_bindgen(js_name = setScissorRect)]
    pub fn set_scissor_rect(&mut self, x: f32, y: f32, width: f32, height: f32) {
        self.engine.set_scissor_rect(x, y, width, height);
    }

    /// Clear scissor rect (disable clipping).
    /// 清除裁剪矩形（禁用裁剪）。
    #[wasm_bindgen(js_name = clearScissorRect)]
    pub fn clear_scissor_rect(&mut self) {
        self.engine.clear_scissor_rect();
    }

    /// Load a texture from URL.
    /// 从URL加载纹理。
    ///
    /// # Arguments | 参数
    /// * `id` - Unique texture identifier | 唯一纹理标识符
    /// * `url` - Image URL to load | 要加载的图片URL
    #[wasm_bindgen(js_name = loadTexture)]
    pub fn load_texture(&mut self, id: u32, url: &str) -> std::result::Result<(), JsValue> {
        self.engine
            .load_texture(id, url)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Load texture by path, returning texture ID.
    /// 按路径加载纹理，返回纹理ID。
    ///
    /// # Arguments | 参数
    /// * `path` - Image path/URL to load | 要加载的图片路径/URL
    #[wasm_bindgen(js_name = loadTextureByPath)]
    pub fn load_texture_by_path(&mut self, path: &str) -> std::result::Result<u32, JsValue> {
        self.engine
            .load_texture_by_path(path)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Get texture ID by path.
    /// 按路径获取纹理ID。
    ///
    /// # Arguments | 参数
    /// * `path` - Image path to lookup | 要查找的图片路径
    #[wasm_bindgen(js_name = getTextureIdByPath)]
    pub fn get_texture_id_by_path(&self, path: &str) -> Option<u32> {
        self.engine.get_texture_id_by_path(path)
    }

    /// Get texture size by path.
    /// 按路径获取纹理尺寸。
    ///
    /// Returns an array [width, height] or null if not found.
    /// 返回数组 [width, height]，如果未找到则返回 null。
    ///
    /// # Arguments | 参数
    /// * `path` - Image path to lookup | 要查找的图片路径
    #[wasm_bindgen(js_name = getTextureSizeByPath)]
    pub fn get_texture_size_by_path(&self, path: &str) -> Option<js_sys::Float32Array> {
        self.engine.get_texture_size_by_path(path).map(|(w, h)| {
            let arr = js_sys::Float32Array::new_with_length(2);
            arr.set_index(0, w);
            arr.set_index(1, h);
            arr
        })
    }

    /// Get or load texture by path.
    /// 按路径获取或加载纹理。
    ///
    /// # Arguments | 参数
    /// * `path` - Image path/URL | 图片路径/URL
    #[wasm_bindgen(js_name = getOrLoadTextureByPath)]
    pub fn get_or_load_by_path(&mut self, path: &str) -> std::result::Result<u32, JsValue> {
        self.engine
            .get_or_load_by_path(path)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// 获取纹理加载状态
    /// Get texture loading state
    ///
    /// # Arguments | 参数
    /// * `id` - Texture ID | 纹理ID
    ///
    /// # Returns | 返回
    /// State string: "loading", "ready", or "failed:reason"
    /// 状态字符串："loading"、"ready" 或 "failed:原因"
    #[wasm_bindgen(js_name = getTextureState)]
    pub fn get_texture_state(&self, id: u32) -> String {
        use crate::renderer::texture::TextureState;
        match self.engine.get_texture_state(id) {
            TextureState::Loading => "loading".to_string(),
            TextureState::Ready => "ready".to_string(),
            TextureState::Failed(reason) => format!("failed:{}", reason),
        }
    }

    /// 检查纹理是否已就绪
    /// Check if texture is ready to use
    ///
    /// # Arguments | 参数
    /// * `id` - Texture ID | 纹理ID
    #[wasm_bindgen(js_name = isTextureReady)]
    pub fn is_texture_ready(&self, id: u32) -> bool {
        self.engine.is_texture_ready(id)
    }

    /// 获取正在加载中的纹理数量
    /// Get the number of textures currently loading
    #[wasm_bindgen(js_name = getTextureLoadingCount)]
    pub fn get_texture_loading_count(&self) -> u32 {
        self.engine.get_texture_loading_count()
    }

    /// Check if a key is currently pressed.
    /// 检查某个键是否当前被按下。
    ///
    /// # Arguments | 参数
    /// * `key_code` - The key code to check | 要检查的键码
    #[wasm_bindgen(js_name = isKeyDown)]
    pub fn is_key_down(&self, key_code: &str) -> bool {
        self.engine.is_key_down(key_code)
    }

    /// Update input state. Should be called once per frame.
    /// 更新输入状态。应该每帧调用一次。
    #[wasm_bindgen(js_name = updateInput)]
    pub fn update_input(&mut self) {
        self.engine.update_input();
    }

    /// Resize viewport.
    /// 调整视口大小。
    ///
    /// # Arguments | 参数
    /// * `width` - New viewport width | 新视口宽度
    /// * `height` - New viewport height | 新视口高度
    pub fn resize(&mut self, width: u32, height: u32) {
        self.engine.resize(width as f32, height as f32);
    }

    /// Set camera position, zoom, and rotation.
    /// 设置相机位置、缩放和旋转。
    ///
    /// # Arguments | 参数
    /// * `x` - Camera X position | 相机X位置
    /// * `y` - Camera Y position | 相机Y位置
    /// * `zoom` - Zoom level | 缩放级别
    /// * `rotation` - Rotation in radians | 旋转角度（弧度）
    #[wasm_bindgen(js_name = setCamera)]
    pub fn set_camera(&mut self, x: f32, y: f32, zoom: f32, rotation: f32) {
        self.engine.set_camera(x, y, zoom, rotation);
    }

    /// Get camera state.
    /// 获取相机状态。
    ///
    /// # Returns | 返回
    /// Array of [x, y, zoom, rotation] | 数组 [x, y, zoom, rotation]
    #[wasm_bindgen(js_name = getCamera)]
    pub fn get_camera(&self) -> Vec<f32> {
        let (x, y, zoom, rotation) = self.engine.get_camera();
        vec![x, y, zoom, rotation]
    }

    /// Convert screen coordinates to world coordinates.
    /// 将屏幕坐标转换为世界坐标。
    ///
    /// # Arguments | 参数
    /// * `screen_x` - Screen X coordinate (0 = left edge of canvas)
    /// * `screen_y` - Screen Y coordinate (0 = top edge of canvas)
    ///
    /// # Returns | 返回
    /// Array of [world_x, world_y] | 数组 [world_x, world_y]
    #[wasm_bindgen(js_name = screenToWorld)]
    pub fn screen_to_world(&self, screen_x: f32, screen_y: f32) -> Vec<f32> {
        let (x, y) = self.engine.screen_to_world(screen_x, screen_y);
        vec![x, y]
    }

    /// Convert world coordinates to screen coordinates.
    /// 将世界坐标转换为屏幕坐标。
    ///
    /// # Arguments | 参数
    /// * `world_x` - World X coordinate
    /// * `world_y` - World Y coordinate
    ///
    /// # Returns | 返回
    /// Array of [screen_x, screen_y] | 数组 [screen_x, screen_y]
    #[wasm_bindgen(js_name = worldToScreen)]
    pub fn world_to_screen(&self, world_x: f32, world_y: f32) -> Vec<f32> {
        let (x, y) = self.engine.world_to_screen(world_x, world_y);
        vec![x, y]
    }

    /// Set grid visibility.
    /// 设置网格可见性。
    #[wasm_bindgen(js_name = setShowGrid)]
    pub fn set_show_grid(&mut self, show: bool) {
        self.engine.set_show_grid(show);
    }

    /// Set clear color (background color).
    /// 设置清除颜色（背景颜色）。
    ///
    /// # Arguments | 参数
    /// * `r`, `g`, `b`, `a` - Color components (0.0-1.0) | 颜色分量 (0.0-1.0)
    #[wasm_bindgen(js_name = setClearColor)]
    pub fn set_clear_color(&mut self, r: f32, g: f32, b: f32, a: f32) {
        self.engine.set_clear_color(r, g, b, a);
    }

    /// Add a rectangle gizmo outline.
    /// 添加矩形Gizmo边框。
    ///
    /// # Arguments | 参数
    /// * `x` - Center X position | 中心X位置
    /// * `y` - Center Y position | 中心Y位置
    /// * `width` - Rectangle width | 矩形宽度
    /// * `height` - Rectangle height | 矩形高度
    /// * `rotation` - Rotation in radians | 旋转角度（弧度）
    /// * `origin_x` - Origin X (0-1) | 原点X (0-1)
    /// * `origin_y` - Origin Y (0-1) | 原点Y (0-1)
    /// * `r`, `g`, `b`, `a` - Color (0.0-1.0) | 颜色
    /// * `show_handles` - Whether to show transform handles | 是否显示变换手柄
    #[wasm_bindgen(js_name = addGizmoRect)]
    pub fn add_gizmo_rect(
        &mut self,
        x: f32,
        y: f32,
        width: f32,
        height: f32,
        rotation: f32,
        origin_x: f32,
        origin_y: f32,
        r: f32,
        g: f32,
        b: f32,
        a: f32,
        show_handles: bool,
    ) {
        self.engine.add_gizmo_rect(x, y, width, height, rotation, origin_x, origin_y, r, g, b, a, show_handles);
    }

    /// Add a circle gizmo outline.
    /// 添加圆形Gizmo边框。
    #[wasm_bindgen(js_name = addGizmoCircle)]
    pub fn add_gizmo_circle(
        &mut self,
        x: f32,
        y: f32,
        radius: f32,
        r: f32,
        g: f32,
        b: f32,
        a: f32,
    ) {
        self.engine.add_gizmo_circle(x, y, radius, r, g, b, a);
    }

    /// Add a line gizmo.
    /// 添加线条Gizmo。
    #[wasm_bindgen(js_name = addGizmoLine)]
    pub fn add_gizmo_line(
        &mut self,
        points: Vec<f32>,
        r: f32,
        g: f32,
        b: f32,
        a: f32,
        closed: bool,
    ) {
        self.engine.add_gizmo_line(points, r, g, b, a, closed);
    }

    /// Add a capsule gizmo outline.
    /// 添加胶囊Gizmo边框。
    #[wasm_bindgen(js_name = addGizmoCapsule)]
    pub fn add_gizmo_capsule(
        &mut self,
        x: f32,
        y: f32,
        radius: f32,
        half_height: f32,
        rotation: f32,
        r: f32,
        g: f32,
        b: f32,
        a: f32,
    ) {
        self.engine.add_gizmo_capsule(x, y, radius, half_height, rotation, r, g, b, a);
    }

    /// Set transform tool mode.
    /// 设置变换工具模式。
    ///
    /// # Arguments | 参数
    /// * `mode` - 0=Select, 1=Move, 2=Rotate, 3=Scale
    #[wasm_bindgen(js_name = setTransformMode)]
    pub fn set_transform_mode(&mut self, mode: u8) {
        self.engine.set_transform_mode(mode);
    }

    /// Set gizmo visibility.
    /// 设置辅助工具可见性。
    #[wasm_bindgen(js_name = setShowGizmos)]
    pub fn set_show_gizmos(&mut self, show: bool) {
        self.engine.set_show_gizmos(show);
    }

    /// Set editor mode.
    /// 设置编辑器模式。
    ///
    /// When false (runtime mode), editor-only UI like grid, gizmos,
    /// and axis indicator are automatically hidden.
    /// 当为 false（运行时模式）时，编辑器专用 UI（如网格、gizmos、坐标轴指示器）会自动隐藏。
    #[wasm_bindgen(js_name = setEditorMode)]
    pub fn set_editor_mode(&mut self, is_editor: bool) {
        self.engine.set_editor_mode(is_editor);
    }

    /// Get editor mode.
    /// 获取编辑器模式。
    #[wasm_bindgen(js_name = isEditorMode)]
    pub fn is_editor_mode(&self) -> bool {
        self.engine.is_editor()
    }

    // ===== Multi-viewport API =====
    // ===== 多视口 API =====

    /// Register a new viewport.
    /// 注册新视口。
    ///
    /// # Arguments | 参数
    /// * `id` - Unique viewport identifier | 唯一视口标识符
    /// * `canvas_id` - HTML canvas element ID | HTML canvas元素ID
    #[wasm_bindgen(js_name = registerViewport)]
    pub fn register_viewport(&mut self, id: &str, canvas_id: &str) -> std::result::Result<(), JsValue> {
        self.engine
            .register_viewport(id, canvas_id)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Unregister a viewport.
    /// 注销视口。
    #[wasm_bindgen(js_name = unregisterViewport)]
    pub fn unregister_viewport(&mut self, id: &str) {
        self.engine.unregister_viewport(id);
    }

    /// Set the active viewport.
    /// 设置活动视口。
    #[wasm_bindgen(js_name = setActiveViewport)]
    pub fn set_active_viewport(&mut self, id: &str) -> bool {
        self.engine.set_active_viewport(id)
    }

    /// Set camera for a specific viewport.
    /// 为特定视口设置相机。
    #[wasm_bindgen(js_name = setViewportCamera)]
    pub fn set_viewport_camera(&mut self, viewport_id: &str, x: f32, y: f32, zoom: f32, rotation: f32) {
        self.engine.set_viewport_camera(viewport_id, x, y, zoom, rotation);
    }

    /// Get camera for a specific viewport.
    /// 获取特定视口的相机。
    #[wasm_bindgen(js_name = getViewportCamera)]
    pub fn get_viewport_camera(&self, viewport_id: &str) -> Option<Vec<f32>> {
        self.engine
            .get_viewport_camera(viewport_id)
            .map(|(x, y, zoom, rotation)| vec![x, y, zoom, rotation])
    }

    /// Set viewport configuration.
    /// 设置视口配置。
    #[wasm_bindgen(js_name = setViewportConfig)]
    pub fn set_viewport_config(&mut self, viewport_id: &str, show_grid: bool, show_gizmos: bool) {
        self.engine.set_viewport_config(viewport_id, show_grid, show_gizmos);
    }

    /// Resize a specific viewport.
    /// 调整特定视口大小。
    #[wasm_bindgen(js_name = resizeViewport)]
    pub fn resize_viewport(&mut self, viewport_id: &str, width: u32, height: u32) {
        self.engine.resize_viewport(viewport_id, width, height);
    }

    /// Render to a specific viewport.
    /// 渲染到特定视口。
    #[wasm_bindgen(js_name = renderToViewport)]
    pub fn render_to_viewport(&mut self, viewport_id: &str) -> std::result::Result<(), JsValue> {
        self.engine
            .render_to_viewport(viewport_id)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Get all registered viewport IDs.
    /// 获取所有已注册的视口ID。
    #[wasm_bindgen(js_name = getViewportIds)]
    pub fn get_viewport_ids(&self) -> Vec<String> {
        self.engine.viewport_ids()
    }

    // ===== Shader API =====
    // ===== 着色器 API =====

    /// Compile and register a custom shader.
    /// 编译并注册自定义着色器。
    ///
    /// # Arguments | 参数
    /// * `vertex_source` - Vertex shader GLSL source | 顶点着色器GLSL源代码
    /// * `fragment_source` - Fragment shader GLSL source | 片段着色器GLSL源代码
    ///
    /// # Returns | 返回
    /// The shader ID for referencing this shader | 用于引用此着色器的ID
    #[wasm_bindgen(js_name = compileShader)]
    pub fn compile_shader(
        &mut self,
        vertex_source: &str,
        fragment_source: &str,
    ) -> std::result::Result<u32, JsValue> {
        self.engine
            .compile_shader(vertex_source, fragment_source)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Compile a shader with a specific ID.
    /// 使用特定ID编译着色器。
    #[wasm_bindgen(js_name = compileShaderWithId)]
    pub fn compile_shader_with_id(
        &mut self,
        shader_id: u32,
        vertex_source: &str,
        fragment_source: &str,
    ) -> std::result::Result<(), JsValue> {
        self.engine
            .compile_shader_with_id(shader_id, vertex_source, fragment_source)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Check if a shader exists.
    /// 检查着色器是否存在。
    #[wasm_bindgen(js_name = hasShader)]
    pub fn has_shader(&self, shader_id: u32) -> bool {
        self.engine.has_shader(shader_id)
    }

    /// Remove a shader.
    /// 移除着色器。
    #[wasm_bindgen(js_name = removeShader)]
    pub fn remove_shader(&mut self, shader_id: u32) -> bool {
        self.engine.remove_shader(shader_id)
    }

    // ===== Material API =====
    // ===== 材质 API =====

    /// Create and register a new material.
    /// 创建并注册新材质。
    ///
    /// # Arguments | 参数
    /// * `name` - Material name for debugging | 材质名称（用于调试）
    /// * `shader_id` - Shader ID to use | 使用的着色器ID
    /// * `blend_mode` - Blend mode: 0=None, 1=Alpha, 2=Additive, 3=Multiply, 4=Screen, 5=PremultipliedAlpha
    ///
    /// # Returns | 返回
    /// The material ID for referencing this material | 用于引用此材质的ID
    #[wasm_bindgen(js_name = createMaterial)]
    pub fn create_material(
        &mut self,
        name: &str,
        shader_id: u32,
        blend_mode: u8,
    ) -> u32 {
        self.engine.create_material(name, shader_id, blend_mode)
    }

    /// Create a material with a specific ID.
    /// 使用特定ID创建材质。
    #[wasm_bindgen(js_name = createMaterialWithId)]
    pub fn create_material_with_id(
        &mut self,
        material_id: u32,
        name: &str,
        shader_id: u32,
        blend_mode: u8,
    ) {
        self.engine.create_material_with_id(material_id, name, shader_id, blend_mode);
    }

    /// Check if a material exists.
    /// 检查材质是否存在。
    #[wasm_bindgen(js_name = hasMaterial)]
    pub fn has_material(&self, material_id: u32) -> bool {
        self.engine.has_material(material_id)
    }

    /// Remove a material.
    /// 移除材质。
    #[wasm_bindgen(js_name = removeMaterial)]
    pub fn remove_material(&mut self, material_id: u32) -> bool {
        self.engine.remove_material(material_id)
    }

    /// Set a material's float uniform.
    /// 设置材质的浮点uniform。
    #[wasm_bindgen(js_name = setMaterialFloat)]
    pub fn set_material_float(&mut self, material_id: u32, name: &str, value: f32) -> bool {
        self.engine.set_material_float(material_id, name, value)
    }

    /// Set a material's vec2 uniform.
    /// 设置材质的vec2 uniform。
    #[wasm_bindgen(js_name = setMaterialVec2)]
    pub fn set_material_vec2(&mut self, material_id: u32, name: &str, x: f32, y: f32) -> bool {
        self.engine.set_material_vec2(material_id, name, x, y)
    }

    /// Set a material's vec3 uniform.
    /// 设置材质的vec3 uniform。
    #[wasm_bindgen(js_name = setMaterialVec3)]
    pub fn set_material_vec3(&mut self, material_id: u32, name: &str, x: f32, y: f32, z: f32) -> bool {
        self.engine.set_material_vec3(material_id, name, x, y, z)
    }

    /// Set a material's vec4 uniform (also used for colors).
    /// 设置材质的vec4 uniform（也用于颜色）。
    #[wasm_bindgen(js_name = setMaterialVec4)]
    pub fn set_material_vec4(&mut self, material_id: u32, name: &str, x: f32, y: f32, z: f32, w: f32) -> bool {
        self.engine.set_material_vec4(material_id, name, x, y, z, w)
    }

    /// Set a material's color uniform (RGBA, 0.0-1.0).
    /// 设置材质的颜色uniform（RGBA，0.0-1.0）。
    #[wasm_bindgen(js_name = setMaterialColor)]
    pub fn set_material_color(&mut self, material_id: u32, name: &str, r: f32, g: f32, b: f32, a: f32) -> bool {
        self.engine.set_material_color(material_id, name, r, g, b, a)
    }

    /// Set a material's blend mode.
    /// 设置材质的混合模式。
    ///
    /// # Arguments | 参数
    /// * `blend_mode` - 0=None, 1=Alpha, 2=Additive, 3=Multiply, 4=Screen, 5=PremultipliedAlpha
    #[wasm_bindgen(js_name = setMaterialBlendMode)]
    pub fn set_material_blend_mode(&mut self, material_id: u32, blend_mode: u8) -> bool {
        self.engine.set_material_blend_mode(material_id, blend_mode)
    }

    // ===== Texture Cache API =====
    // ===== 纹理缓存 API =====

    /// Clear the texture path cache.
    /// 清除纹理路径缓存。
    ///
    /// This should be called when restoring scene snapshots to ensure
    /// textures are reloaded with correct IDs.
    /// 在恢复场景快照时应调用此方法，以确保纹理使用正确的ID重新加载。
    #[wasm_bindgen(js_name = clearTexturePathCache)]
    pub fn clear_texture_path_cache(&mut self) {
        self.engine.clear_texture_path_cache();
    }

    /// Clear all textures and reset state.
    /// 清除所有纹理并重置状态。
    ///
    /// This removes all loaded textures from GPU memory and resets
    /// the ID counter. Use with caution as all texture references
    /// will become invalid.
    /// 这会从GPU内存中移除所有已加载的纹理并重置ID计数器。
    /// 请谨慎使用，因为所有纹理引用都将变得无效。
    #[wasm_bindgen(js_name = clearAllTextures)]
    pub fn clear_all_textures(&mut self) {
        self.engine.clear_all_textures();
    }

    // ===== Dynamic Atlas API =====
    // ===== 动态图集 API =====

    /// Create a blank texture for dynamic atlas.
    /// 为动态图集创建空白纹理。
    ///
    /// This creates a texture that can be filled later using `updateTextureRegion`.
    /// Used for runtime atlas generation to batch UI elements with different textures.
    /// 创建一个可以稍后使用 `updateTextureRegion` 填充的纹理。
    /// 用于运行时图集生成，以批处理使用不同纹理的 UI 元素。
    ///
    /// # Arguments | 参数
    /// * `width` - Texture width in pixels (recommended: 2048) | 纹理宽度（推荐：2048）
    /// * `height` - Texture height in pixels (recommended: 2048) | 纹理高度（推荐：2048）
    ///
    /// # Returns | 返回
    /// The texture ID for the created blank texture | 创建的空白纹理ID
    #[wasm_bindgen(js_name = createBlankTexture)]
    pub fn create_blank_texture(
        &mut self,
        width: u32,
        height: u32,
    ) -> std::result::Result<u32, JsValue> {
        self.engine
            .create_blank_texture(width, height)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Update a region of an existing texture with pixel data.
    /// 使用像素数据更新现有纹理的区域。
    ///
    /// This is used for dynamic atlas to copy individual textures into the atlas.
    /// 用于动态图集将单个纹理复制到图集纹理中。
    ///
    /// # Arguments | 参数
    /// * `id` - The texture ID to update | 要更新的纹理ID
    /// * `x` - X offset in the texture | 纹理中的X偏移
    /// * `y` - Y offset in the texture | 纹理中的Y偏移
    /// * `width` - Width of the region to update | 要更新的区域宽度
    /// * `height` - Height of the region to update | 要更新的区域高度
    /// * `pixels` - RGBA pixel data (Uint8Array, 4 bytes per pixel) | RGBA像素数据（每像素4字节）
    #[wasm_bindgen(js_name = updateTextureRegion)]
    pub fn update_texture_region(
        &self,
        id: u32,
        x: u32,
        y: u32,
        width: u32,
        height: u32,
        pixels: &[u8],
    ) -> std::result::Result<(), JsValue> {
        self.engine
            .update_texture_region(id, x, y, width, height, pixels)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    // ===== Graphics Backend Info API =====
    // ===== 图形后端信息 API =====

    /// Get the graphics backend name (e.g., "WebGL2").
    /// 获取图形后端名称（如 "WebGL2"）。
    #[wasm_bindgen(js_name = getBackendName)]
    pub fn get_backend_name(&self) -> String {
        self.engine.backend_name().to_string()
    }

    /// Get the graphics backend version string.
    /// 获取图形后端版本字符串。
    #[wasm_bindgen(js_name = getBackendVersion)]
    pub fn get_backend_version(&self) -> String {
        self.engine.backend_version().to_string()
    }

    /// Get maximum texture size supported by the backend.
    /// 获取后端支持的最大纹理尺寸。
    #[wasm_bindgen(js_name = getMaxTextureSize)]
    pub fn get_max_texture_size(&self) -> u32 {
        self.engine.max_texture_size()
    }
}
