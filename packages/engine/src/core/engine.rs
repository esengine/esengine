//! Main engine implementation.
//! 主引擎实现。

use wasm_bindgen::prelude::*;

use super::context::WebGLContext;
use super::error::Result;
use crate::backend::WebGL2Backend;
use crate::input::InputManager;
use crate::renderer::{
    Renderer2D, Renderer3D, GridRenderer, Grid3DRenderer, GizmoRenderer, Gizmo3DRenderer, TransformMode,
    ViewportManager, TextBatch, MeshBatch, Camera3D, ProjectionType,
};
use crate::resource::TextureManager;
use es_engine_shared::traits::backend::GraphicsBackend;

/// Render mode enumeration.
/// 渲染模式枚举。
#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum RenderMode {
    /// 2D rendering mode (orthographic camera, no depth test).
    /// 2D渲染模式（正交相机，无深度测试）。
    #[default]
    Mode2D,
    /// 3D rendering mode (perspective/orthographic camera, depth test enabled).
    /// 3D渲染模式（透视/正交相机，启用深度测试）。
    Mode3D,
}

/// Engine configuration options.
/// 引擎配置选项。
#[derive(Debug, Clone)]
pub struct EngineConfig {
    /// Maximum sprites per batch.
    /// 每批次最大精灵数。
    pub max_sprites: usize,

    /// Enable debug mode.
    /// 启用调试模式。
    pub debug: bool,
}

impl Default for EngineConfig {
    fn default() -> Self {
        Self {
            max_sprites: 10000,
            debug: false,
        }
    }
}

/// Main game engine.
/// 主游戏引擎。
///
/// Coordinates all engine subsystems including rendering, input, and resources.
/// 协调所有引擎子系统，包括渲染、输入和资源。
pub struct Engine {
    /// WebGL context.
    /// WebGL上下文。
    context: WebGLContext,

    /// Graphics backend abstraction layer.
    /// 图形后端抽象层。
    ///
    /// Provides cross-platform graphics API abstraction.
    /// Currently WebGL2, future support for wgpu/native.
    /// 提供跨平台图形 API 抽象。
    /// 当前为 WebGL2，未来支持 wgpu/原生平台。
    backend: WebGL2Backend,

    /// 2D renderer.
    /// 2D渲染器。
    renderer: Renderer2D,

    /// Grid renderer for editor.
    /// 编辑器网格渲染器。
    grid_renderer: GridRenderer,

    /// Gizmo renderer for editor overlays.
    /// 编辑器叠加层Gizmo渲染器。
    gizmo_renderer: GizmoRenderer,

    /// Texture manager.
    /// 纹理管理器。
    texture_manager: TextureManager,

    /// Input manager.
    /// 输入管理器。
    input_manager: InputManager,

    /// Engine configuration.
    /// 引擎配置。
    #[allow(dead_code)]
    config: EngineConfig,

    /// Whether to show grid.
    /// 是否显示网格。
    show_grid: bool,

    /// Viewport manager for multi-viewport rendering.
    /// 多视口渲染的视口管理器。
    viewport_manager: ViewportManager,

    /// Whether to show gizmos.
    /// 是否显示辅助工具。
    show_gizmos: bool,

    /// Whether the engine is running in editor mode.
    /// 引擎是否在编辑器模式下运行。
    ///
    /// When false (runtime mode), editor-only UI like grid, gizmos,
    /// and axis indicator are automatically hidden.
    /// 当为 false（运行时模式）时，编辑器专用 UI（如网格、gizmos、坐标轴指示器）会自动隐藏。
    is_editor: bool,

    /// Text batch renderer for MSDF text.
    /// MSDF 文本批处理渲染器。
    text_batch: TextBatch,

    /// Mesh batch renderer for arbitrary 2D geometry.
    /// 任意 2D 几何体的网格批处理渲染器。
    mesh_batch: MeshBatch,

    /// 3D renderer (lazily initialized).
    /// 3D渲染器（延迟初始化）。
    renderer_3d: Option<Renderer3D>,

    /// 3D grid renderer (lazily initialized with renderer_3d).
    /// 3D网格渲染器（与renderer_3d一起延迟初始化）。
    grid_3d_renderer: Option<Grid3DRenderer>,

    /// 3D gizmo renderer (lazily initialized with renderer_3d).
    /// 3D Gizmo渲染器（与renderer_3d一起延迟初始化）。
    gizmo_3d_renderer: Option<Gizmo3DRenderer>,

    /// Current render mode.
    /// 当前渲染模式。
    render_mode: RenderMode,
}

impl Engine {
    /// Create a new engine instance.
    /// 创建新的引擎实例。
    ///
    /// # Arguments | 参数
    /// * `canvas_id` - The HTML canvas element ID | HTML canvas元素ID
    /// * `config` - Engine configuration | 引擎配置
    ///
    /// # Returns | 返回
    /// A new Engine instance or an error | 新的Engine实例或错误
    pub fn new(canvas_id: &str, config: EngineConfig) -> Result<Self> {
        let context = WebGLContext::new(canvas_id)?;

        // Initialize WebGL state | 初始化WebGL状态
        context.set_viewport();
        context.enable_blend();

        // Create graphics backend abstraction | 创建图形后端抽象
        let backend = WebGL2Backend::from_canvas(canvas_id)
            .map_err(|e| crate::core::error::EngineError::WebGLError(
                format!("Failed to create graphics backend: {:?}", e)
            ))?;

        log::info!(
            "Graphics backend initialized: {} ({})",
            backend.name(),
            backend.version()
        );

        let texture_manager = TextureManager::new(context.gl().clone());
        let input_manager = InputManager::new();

        let mut backend = backend;
        let renderer = Renderer2D::new(&mut backend, config.max_sprites)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
        let grid_renderer = GridRenderer::new(&mut backend)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
        let gizmo_renderer = GizmoRenderer::new(&mut backend)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
        let text_batch = TextBatch::new(&mut backend, 10000)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
        let mesh_batch = MeshBatch::new(&mut backend, 10000, 30000)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;

        log::info!("Engine created successfully | 引擎创建成功");

        Ok(Self {
            context,
            backend,
            renderer,
            grid_renderer,
            gizmo_renderer,
            texture_manager,
            input_manager,
            config,
            show_grid: true,
            viewport_manager: ViewportManager::new(),
            show_gizmos: true,
            is_editor: true,
            text_batch,
            mesh_batch,
            renderer_3d: None, // Lazily initialized when switching to 3D mode
            grid_3d_renderer: None, // Lazily initialized with renderer_3d
            gizmo_3d_renderer: None, // Lazily initialized with renderer_3d
            render_mode: RenderMode::Mode2D,
        })
    }

    /// Create a new engine instance from external WebGL context.
    /// 从外部 WebGL 上下文创建引擎实例。
    ///
    /// This is designed for environments like WeChat MiniGame.
    /// 适用于微信小游戏等环境。
    pub fn from_external(
        gl_context: JsValue,
        width: u32,
        height: u32,
        config: EngineConfig,
    ) -> Result<Self> {
        let context = WebGLContext::from_external(gl_context.clone(), width, height)?;

        context.set_viewport();
        context.enable_blend();

        // Create graphics backend from external context | 从外部上下文创建图形后端
        let backend = WebGL2Backend::from_external(gl_context, width, height)
            .map_err(|e| crate::core::error::EngineError::WebGLError(
                format!("Failed to create graphics backend: {:?}", e)
            ))?;

        log::info!(
            "Graphics backend initialized: {} ({})",
            backend.name(),
            backend.version()
        );

        let texture_manager = TextureManager::new(context.gl().clone());
        let input_manager = InputManager::new();

        let mut backend = backend;
        let renderer = Renderer2D::new(&mut backend, config.max_sprites)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
        let grid_renderer = GridRenderer::new(&mut backend)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
        let gizmo_renderer = GizmoRenderer::new(&mut backend)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
        let text_batch = TextBatch::new(&mut backend, 10000)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
        let mesh_batch = MeshBatch::new(&mut backend, 10000, 30000)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;

        log::info!("Engine created from external context | 从外部上下文创建引擎");

        Ok(Self {
            context,
            backend,
            renderer,
            grid_renderer,
            gizmo_renderer,
            texture_manager,
            input_manager,
            config,
            show_grid: true,
            viewport_manager: ViewportManager::new(),
            show_gizmos: true,
            is_editor: true,
            text_batch,
            mesh_batch,
            renderer_3d: None,
            grid_3d_renderer: None,
            gizmo_3d_renderer: None,
            render_mode: RenderMode::Mode2D,
        })
    }

    /// Clear the screen with specified color.
    /// 使用指定颜色清除屏幕。
    pub fn clear(&self, r: f32, g: f32, b: f32, a: f32) {
        self.context.clear(r, g, b, a);
    }

    /// Get canvas width.
    /// 获取画布宽度。
    #[inline]
    pub fn width(&self) -> u32 {
        self.context.width()
    }

    /// Get canvas height.
    /// 获取画布高度。
    #[inline]
    pub fn height(&self) -> u32 {
        self.context.height()
    }

    // ===== Graphics Backend API =====
    // ===== 图形后端 API =====

    /// Get reference to the graphics backend.
    /// 获取图形后端的引用。
    ///
    /// Use this for low-level graphics operations through the abstraction layer.
    /// 使用此方法通过抽象层进行低级图形操作。
    #[inline]
    pub fn backend(&self) -> &WebGL2Backend {
        &self.backend
    }

    /// Get mutable reference to the graphics backend.
    /// 获取图形后端的可变引用。
    ///
    /// Use this for low-level graphics operations through the abstraction layer.
    /// 使用此方法通过抽象层进行低级图形操作。
    #[inline]
    pub fn backend_mut(&mut self) -> &mut WebGL2Backend {
        &mut self.backend
    }

    /// Get backend name (e.g., "WebGL2").
    /// 获取后端名称（如 "WebGL2"）。
    #[inline]
    pub fn backend_name(&self) -> &'static str {
        self.backend.name()
    }

    /// Get backend version string.
    /// 获取后端版本字符串。
    #[inline]
    pub fn backend_version(&self) -> &str {
        self.backend.version()
    }

    /// Get maximum texture size supported by the backend.
    /// 获取后端支持的最大纹理尺寸。
    #[inline]
    pub fn max_texture_size(&self) -> u32 {
        self.backend.max_texture_size()
    }

    /// Submit sprite batch data for rendering.
    /// 提交精灵批次数据进行渲染。
    pub fn submit_sprite_batch(
        &mut self,
        transforms: &[f32],
        texture_ids: &[u32],
        uvs: &[f32],
        colors: &[u32],
        material_ids: &[u32],
    ) -> Result<()> {
        self.renderer.submit_batch(transforms, texture_ids, uvs, colors, material_ids)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))
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
    pub fn submit_text_batch(
        &mut self,
        positions: &[f32],
        tex_coords: &[f32],
        colors: &[f32],
        outline_colors: &[f32],
        outline_widths: &[f32],
        texture_id: u32,
        px_range: f32,
    ) -> Result<()> {
        self.text_batch.add_glyphs(positions, tex_coords, colors, outline_colors, outline_widths)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;

        // Render text immediately with proper setup
        let projection = self.renderer.camera().projection_matrix();
        let shader = self.text_batch.shader();

        self.backend.bind_shader(shader).ok();
        self.backend.set_blend_mode(es_engine_shared::types::blend::BlendMode::Alpha);
        self.backend.set_uniform_mat3("u_projection", &projection).ok();
        self.backend.set_uniform_i32("u_msdfTexture", 0).ok();
        self.backend.set_uniform_f32("u_pxRange", px_range).ok();

        // Bind font atlas texture
        self.texture_manager.bind_texture_via_backend(&mut self.backend, texture_id, 0);

        // Flush and render
        self.text_batch.flush(&mut self.backend);
        self.text_batch.clear();

        Ok(())
    }

    /// Submit mesh batch for rendering arbitrary 2D geometry.
    /// 提交网格批次进行任意 2D 几何体渲染。
    ///
    /// # Arguments | 参数
    /// * `positions` - Float array [x, y, ...] for each vertex
    /// * `uvs` - Float array [u, v, ...] for each vertex
    /// * `colors` - Packed RGBA colors (one per vertex)
    /// * `indices` - Triangle indices
    /// * `texture_id` - Texture ID to use
    pub fn submit_mesh_batch(
        &mut self,
        positions: &[f32],
        uvs: &[f32],
        colors: &[u32],
        indices: &[u16],
        texture_id: u32,
    ) -> Result<()> {
        self.mesh_batch.add_mesh(positions, uvs, colors, indices, 0.0, 0.0)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;

        // Render mesh immediately with proper setup
        let projection = self.renderer.camera().projection_matrix();
        let shader_id = crate::renderer::shader::SHADER_ID_DEFAULT_SPRITE;

        if let Some(shader) = self.renderer.get_shader_handle(shader_id) {
            self.backend.bind_shader(shader).ok();
            self.backend.set_blend_mode(es_engine_shared::types::blend::BlendMode::Alpha);
            self.backend.set_uniform_mat3("u_projection", &projection).ok();

            // Bind texture
            self.texture_manager.bind_texture_via_backend(&mut self.backend, texture_id, 0);

            // Flush and render
            self.mesh_batch.flush(&mut self.backend);
        }

        self.mesh_batch.clear();

        Ok(())
    }

    pub fn render(&mut self) -> Result<()> {
        let [r, g, b, a] = self.renderer.get_clear_color();
        self.context.clear(r, g, b, a);

        // Render based on current mode | 根据当前模式渲染
        match self.render_mode {
            RenderMode::Mode2D => {
                // 2D rendering | 2D 渲染
                let camera = self.renderer.camera().clone();

                if self.is_editor && self.show_grid {
                    self.grid_renderer.render(&mut self.backend, &camera);
                    self.grid_renderer.render_axes(&mut self.backend, &camera);
                }

                self.renderer.render(&mut self.backend, &self.texture_manager)
                    .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;

                if self.is_editor && self.show_gizmos {
                    self.gizmo_renderer.render(&mut self.backend, &camera);
                    self.gizmo_renderer.render_axis_indicator(
                        &mut self.backend,
                        self.context.width() as f32,
                        self.context.height() as f32,
                    );
                }
                self.gizmo_renderer.clear();
            }
            RenderMode::Mode3D => {
                // 3D rendering | 3D 渲染
                if let Some(ref mut renderer_3d) = self.renderer_3d {
                    let camera = renderer_3d.camera().clone();

                    // Render 3D grid if in editor mode
                    // 如果在编辑器模式下渲染 3D 网格
                    if self.is_editor && self.show_grid {
                        if let Some(ref mut grid_3d) = self.grid_3d_renderer {
                            grid_3d.render(&mut self.backend, &camera);
                            grid_3d.render_axes(&mut self.backend, &camera);
                        }
                    }

                    // Render 3D content
                    // 渲染 3D 内容
                    renderer_3d.render(&mut self.backend, &self.texture_manager)
                        .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
                } else {
                    log::warn!("3D mode active but renderer not initialized | 3D 模式激活但渲染器未初始化");
                }
            }
        }

        Ok(())
    }

    /// Render sprites only without clearing the screen.
    /// 仅渲染精灵，不清除屏幕。
    ///
    /// This is used for overlay rendering (e.g., UI layer on top of world).
    /// 用于叠加渲染（例如，UI 层叠加在世界上）。
    pub fn render_overlay(&mut self) -> Result<()> {
        self.renderer.render(&mut self.backend, &self.texture_manager)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))
    }

    /// Set scissor rect for clipping (screen coordinates, Y-down).
    /// 设置裁剪矩形（屏幕坐标，Y 轴向下）。
    pub fn set_scissor_rect(&mut self, x: f32, y: f32, width: f32, height: f32) {
        self.renderer.set_scissor_rect(x, y, width, height);
    }

    /// Clear scissor rect (disable clipping).
    /// 清除裁剪矩形（禁用裁剪）。
    pub fn clear_scissor_rect(&mut self) {
        self.renderer.clear_scissor_rect();
    }

    /// Add a rectangle gizmo.
    /// 添加矩形Gizmo。
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
        self.gizmo_renderer.add_rect(x, y, width, height, rotation, origin_x, origin_y, r, g, b, a, show_handles);
    }

    /// Add a circle gizmo.
    /// 添加圆形Gizmo。
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
        self.gizmo_renderer.add_circle(x, y, radius, r, g, b, a);
    }

    /// Add a line gizmo.
    /// 添加线条Gizmo。
    pub fn add_gizmo_line(
        &mut self,
        points: Vec<f32>,
        r: f32,
        g: f32,
        b: f32,
        a: f32,
        closed: bool,
    ) {
        self.gizmo_renderer.add_line(points, r, g, b, a, closed);
    }

    /// Add a capsule gizmo.
    /// 添加胶囊Gizmo。
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
        self.gizmo_renderer.add_capsule(x, y, radius, half_height, rotation, r, g, b, a);
    }

    /// Set transform tool mode.
    /// 设置变换工具模式。
    pub fn set_transform_mode(&mut self, mode: u8) {
        let transform_mode = match mode {
            1 => TransformMode::Move,
            2 => TransformMode::Rotate,
            3 => TransformMode::Scale,
            _ => TransformMode::Select,
        };
        self.gizmo_renderer.set_transform_mode(transform_mode);

        // Also update 3D gizmo if initialized
        // 如果已初始化，也更新 3D Gizmo
        if let Some(ref mut gizmo_3d) = self.gizmo_3d_renderer {
            gizmo_3d.set_transform_mode(transform_mode);
        }
    }

    /// Render a 3D gizmo at the specified world position.
    /// 在指定的世界位置渲染 3D Gizmo。
    pub fn render_3d_gizmo(&mut self, x: f32, y: f32, z: f32, scale: f32) {
        if self.render_mode != RenderMode::Mode3D {
            return;
        }

        if let (Some(ref mut gizmo_3d), Some(ref renderer_3d)) = (&mut self.gizmo_3d_renderer, &self.renderer_3d) {
            let camera = renderer_3d.camera();
            let position = glam::Vec3::new(x, y, z);
            gizmo_3d.render(&mut self.backend, camera, position, scale);
        }
    }

    /// Load a texture from URL.
    /// 从URL加载纹理。
    pub fn load_texture(&mut self, id: u32, url: &str) -> Result<()> {
        self.texture_manager.load_texture(id, url)
    }

    /// Load texture by path, returning texture ID.
    /// 按路径加载纹理，返回纹理ID。
    pub fn load_texture_by_path(&mut self, path: &str) -> Result<u32> {
        self.texture_manager.load_texture_by_path(path)
    }

    /// Get texture ID by path.
    /// 按路径获取纹理ID。
    pub fn get_texture_id_by_path(&self, path: &str) -> Option<u32> {
        self.texture_manager.get_texture_id_by_path(path)
    }

    /// Get texture size by path.
    /// 按路径获取纹理尺寸。
    ///
    /// Returns None if texture is not loaded or path not found.
    /// 如果纹理未加载或路径未找到，返回 None。
    pub fn get_texture_size_by_path(&self, path: &str) -> Option<(f32, f32)> {
        let id = self.texture_manager.get_texture_id_by_path(path)?;
        self.texture_manager.get_texture_size(id)
    }

    /// Get or load texture by path.
    /// 按路径获取或加载纹理。
    pub fn get_or_load_by_path(&mut self, path: &str) -> Result<u32> {
        self.texture_manager.get_or_load_by_path(path)
    }

    /// Clear the texture path cache.
    /// 清除纹理路径缓存。
    ///
    /// This should be called when restoring scene snapshots to ensure
    /// textures are reloaded with correct IDs.
    /// 在恢复场景快照时应调用此方法，以确保纹理使用正确的ID重新加载。
    pub fn clear_texture_path_cache(&mut self) {
        self.texture_manager.clear_path_cache();
    }

    /// Clear all textures and reset state.
    /// 清除所有纹理并重置状态。
    ///
    /// This removes all loaded textures from GPU memory and resets the ID counter.
    /// 这会从GPU内存中移除所有已加载的纹理并重置ID计数器。
    pub fn clear_all_textures(&mut self) {
        self.texture_manager.clear_all();
    }

    /// Create a blank texture for dynamic atlas.
    /// 为动态图集创建空白纹理。
    ///
    /// This creates a texture that can be filled later using `update_texture_region`.
    /// 创建一个可以稍后使用 `update_texture_region` 填充的纹理。
    pub fn create_blank_texture(&mut self, width: u32, height: u32) -> Result<u32> {
        self.texture_manager.create_blank_texture(width, height)
    }

    /// Update a region of an existing texture.
    /// 更新现有纹理的区域。
    ///
    /// Used for dynamic atlas to copy textures into the atlas.
    /// 用于动态图集将纹理复制到图集中。
    pub fn update_texture_region(
        &self,
        id: u32,
        x: u32,
        y: u32,
        width: u32,
        height: u32,
        pixels: &[u8],
    ) -> Result<()> {
        self.texture_manager.update_texture_region(id, x, y, width, height, pixels)
    }

    /// 获取纹理加载状态
    /// Get texture loading state
    pub fn get_texture_state(&self, id: u32) -> crate::renderer::texture::TextureState {
        self.texture_manager.get_texture_state(id)
    }

    /// 检查纹理是否已就绪
    /// Check if texture is ready to use
    pub fn is_texture_ready(&self, id: u32) -> bool {
        self.texture_manager.is_texture_ready(id)
    }

    /// 获取正在加载中的纹理数量
    /// Get the number of textures currently loading
    pub fn get_texture_loading_count(&self) -> u32 {
        self.texture_manager.get_loading_count()
    }

    /// Check if a key is currently pressed.
    /// 检查某个键是否当前被按下。
    pub fn is_key_down(&self, key_code: &str) -> bool {
        self.input_manager.is_key_down(key_code)
    }

    /// Update input state.
    /// 更新输入状态。
    pub fn update_input(&mut self) {
        self.input_manager.update();
    }

    /// Resize viewport.
    /// 调整视口大小。
    pub fn resize(&mut self, width: f32, height: f32) {
        self.context.resize(width as u32, height as u32);
        self.renderer.resize(width, height);
    }

    /// Set camera position, zoom, and rotation.
    /// 设置相机位置、缩放和旋转。
    ///
    /// # Arguments | 参数
    /// * `x` - Camera X position | 相机X位置
    /// * `y` - Camera Y position | 相机Y位置
    /// * `zoom` - Zoom level | 缩放级别
    /// * `rotation` - Rotation in radians | 旋转角度（弧度）
    pub fn set_camera(&mut self, x: f32, y: f32, zoom: f32, rotation: f32) {
        let camera = self.renderer.camera_mut();
        camera.position.x = x;
        camera.position.y = y;
        camera.set_zoom(zoom);
        camera.rotation = rotation;
    }

    /// Get camera position.
    /// 获取相机位置。
    pub fn get_camera(&self) -> (f32, f32, f32, f32) {
        let camera = self.renderer.camera();
        (camera.position.x, camera.position.y, camera.zoom, camera.rotation)
    }

    /// Convert screen coordinates to world coordinates.
    /// 将屏幕坐标转换为世界坐标。
    ///
    /// # Arguments | 参数
    /// * `screen_x` - Screen X coordinate (0 = left edge of canvas)
    /// * `screen_y` - Screen Y coordinate (0 = top edge of canvas)
    ///
    /// # Returns | 返回
    /// Tuple of (world_x, world_y)
    pub fn screen_to_world(&self, screen_x: f32, screen_y: f32) -> (f32, f32) {
        let camera = self.renderer.camera();
        let world = camera.screen_to_world(crate::math::Vec2::new(screen_x, screen_y));
        (world.x, world.y)
    }

    /// Convert world coordinates to screen coordinates.
    /// 将世界坐标转换为屏幕坐标。
    ///
    /// # Arguments | 参数
    /// * `world_x` - World X coordinate
    /// * `world_y` - World Y coordinate
    ///
    /// # Returns | 返回
    /// Tuple of (screen_x, screen_y)
    pub fn world_to_screen(&self, world_x: f32, world_y: f32) -> (f32, f32) {
        let camera = self.renderer.camera();
        let screen = camera.world_to_screen(crate::math::Vec2::new(world_x, world_y));
        (screen.x, screen.y)
    }

    /// Set grid visibility.
    /// 设置网格可见性。
    pub fn set_show_grid(&mut self, show: bool) {
        self.show_grid = show;
    }

    /// Set gizmo visibility.
    /// 设置辅助工具可见性。
    pub fn set_show_gizmos(&mut self, show: bool) {
        self.show_gizmos = show;
    }

    /// Get gizmo visibility.
    /// 获取辅助工具可见性。
    pub fn show_gizmos(&self) -> bool {
        self.show_gizmos
    }

    /// Set editor mode.
    /// 设置编辑器模式。
    ///
    /// When false (runtime mode), editor-only UI like grid, gizmos,
    /// and axis indicator are automatically hidden regardless of their individual settings.
    /// 当为 false（运行时模式）时，编辑器专用 UI（如网格、gizmos、坐标轴指示器）
    /// 会自动隐藏，无论它们的单独设置如何。
    pub fn set_editor_mode(&mut self, is_editor: bool) {
        self.is_editor = is_editor;
    }

    /// Get editor mode.
    /// 获取编辑器模式。
    pub fn is_editor(&self) -> bool {
        self.is_editor
    }

    /// Set clear color for the active viewport.
    /// 设置活动视口的清除颜色。
    pub fn set_clear_color(&mut self, r: f32, g: f32, b: f32, a: f32) {
        if let Some(target) = self.viewport_manager.active_mut() {
            target.set_clear_color(r, g, b, a);
        } else {
            // Fallback to primary renderer
            self.renderer.set_clear_color(r, g, b, a);
        }
    }

    // ===== Multi-viewport API =====
    // ===== 多视口 API =====

    /// Register a new viewport.
    /// 注册新视口。
    pub fn register_viewport(&mut self, id: &str, canvas_id: &str) -> Result<()> {
        self.viewport_manager.register(id, canvas_id)
    }

    /// Unregister a viewport.
    /// 注销视口。
    pub fn unregister_viewport(&mut self, id: &str) {
        self.viewport_manager.unregister(id);
    }

    /// Set the active viewport.
    /// 设置活动视口。
    pub fn set_active_viewport(&mut self, id: &str) -> bool {
        self.viewport_manager.set_active(id)
    }

    /// Get active viewport ID.
    /// 获取活动视口ID。
    pub fn active_viewport_id(&self) -> Option<&str> {
        self.viewport_manager.active().map(|v| v.id.as_str())
    }

    /// Set camera for a specific viewport.
    /// 为特定视口设置相机。
    pub fn set_viewport_camera(&mut self, viewport_id: &str, x: f32, y: f32, zoom: f32, rotation: f32) {
        if let Some(viewport) = self.viewport_manager.get_mut(viewport_id) {
            viewport.set_camera(x, y, zoom, rotation);
        }
    }

    /// Get camera for a specific viewport.
    /// 获取特定视口的相机。
    pub fn get_viewport_camera(&self, viewport_id: &str) -> Option<(f32, f32, f32, f32)> {
        self.viewport_manager.get(viewport_id).map(|v| v.get_camera())
    }

    /// Set viewport configuration.
    /// 设置视口配置。
    pub fn set_viewport_config(&mut self, viewport_id: &str, show_grid: bool, show_gizmos: bool) {
        if let Some(viewport) = self.viewport_manager.get_mut(viewport_id) {
            viewport.config.show_grid = show_grid;
            viewport.config.show_gizmos = show_gizmos;
        }
    }

    /// Resize a specific viewport.
    /// 调整特定视口大小。
    pub fn resize_viewport(&mut self, viewport_id: &str, width: u32, height: u32) {
        if let Some(viewport) = self.viewport_manager.get_mut(viewport_id) {
            viewport.resize(width, height);
        }
    }

    pub fn render_to_viewport(&mut self, viewport_id: &str) -> Result<()> {
        let viewport = match self.viewport_manager.get(viewport_id) {
            Some(v) => v,
            None => return Ok(()),
        };

        let show_grid = viewport.config.show_grid;
        let show_gizmos = viewport.config.show_gizmos;
        let camera = viewport.camera.clone();
        let (vp_width, vp_height) = viewport.dimensions();

        viewport.bind();
        viewport.clear();

        // Render based on current mode | 根据当前模式渲染
        match self.render_mode {
            RenderMode::Mode2D => {
                // 2D rendering | 2D 渲染
                let renderer_camera = self.renderer.camera_mut();
                renderer_camera.position = camera.position;
                renderer_camera.set_zoom(camera.zoom);
                renderer_camera.rotation = camera.rotation;
                renderer_camera.set_viewport(camera.viewport_width(), camera.viewport_height());

                if self.is_editor && show_grid {
                    self.grid_renderer.render(&mut self.backend, &camera);
                    self.grid_renderer.render_axes(&mut self.backend, &camera);
                }

                self.renderer.render(&mut self.backend, &self.texture_manager)
                    .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;

                if self.is_editor && show_gizmos {
                    self.gizmo_renderer.render(&mut self.backend, &camera);
                    self.gizmo_renderer.render_axis_indicator(&mut self.backend, vp_width as f32, vp_height as f32);
                }
                self.gizmo_renderer.clear();
            }
            RenderMode::Mode3D => {
                // 3D rendering | 3D 渲染
                if let Some(ref mut renderer_3d) = self.renderer_3d {
                    // Update 3D camera viewport
                    // 更新 3D 相机视口
                    renderer_3d.camera_mut().set_viewport(vp_width as f32, vp_height as f32);
                    let camera_3d = renderer_3d.camera().clone();

                    // Render 3D grid if in editor mode
                    // 如果在编辑器模式下渲染 3D 网格
                    if self.is_editor && show_grid {
                        if let Some(ref mut grid_3d) = self.grid_3d_renderer {
                            grid_3d.render(&mut self.backend, &camera_3d);
                            grid_3d.render_axes(&mut self.backend, &camera_3d);
                        }
                    }

                    // Render 3D content
                    // 渲染 3D 内容
                    renderer_3d.render(&mut self.backend, &self.texture_manager)
                        .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
                } else {
                    log::warn!("3D mode active but renderer not initialized | 3D 模式激活但渲染器未初始化");
                }
            }
        }

        Ok(())
    }

    /// Get all registered viewport IDs.
    /// 获取所有已注册的视口ID。
    pub fn viewport_ids(&self) -> Vec<String> {
        self.viewport_manager.viewport_ids().into_iter().cloned().collect()
    }

    // ===== Shader Management =====
    // ===== 着色器管理 =====

    /// Compile and register a custom shader.
    /// 编译并注册自定义着色器。
    pub fn compile_shader(
        &mut self,
        vertex_source: &str,
        fragment_source: &str,
    ) -> Result<u32> {
        self.renderer.compile_shader(&mut self.backend, vertex_source, fragment_source)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))
    }

    /// Compile a shader with a specific ID.
    /// 使用特定ID编译着色器。
    pub fn compile_shader_with_id(
        &mut self,
        shader_id: u32,
        vertex_source: &str,
        fragment_source: &str,
    ) -> Result<()> {
        self.renderer.compile_shader_with_id(&mut self.backend, shader_id, vertex_source, fragment_source)
            .map_err(|e| crate::core::error::EngineError::WebGLError(e))
    }

    /// Check if a shader exists.
    /// 检查着色器是否存在。
    pub fn has_shader(&self, shader_id: u32) -> bool {
        self.renderer.has_shader(shader_id)
    }

    /// Remove a shader.
    /// 移除着色器。
    pub fn remove_shader(&mut self, shader_id: u32) -> bool {
        self.renderer.remove_shader(shader_id)
    }

    // ===== Material Management =====
    // ===== 材质管理 =====

    /// Create and register a new material.
    /// 创建并注册新材质。
    pub fn create_material(
        &mut self,
        name: &str,
        shader_id: u32,
        blend_mode: u8,
    ) -> u32 {
        use crate::renderer::material::{Material, BlendMode};

        let blend = match blend_mode {
            0 => BlendMode::None,
            1 => BlendMode::Alpha,
            2 => BlendMode::Additive,
            3 => BlendMode::Multiply,
            4 => BlendMode::Screen,
            5 => BlendMode::PremultipliedAlpha,
            _ => BlendMode::Alpha,
        };

        let mut material = Material::with_shader(name, shader_id);
        material.blend_mode = blend;

        self.renderer.register_material(material)
    }

    /// Create a material with a specific ID.
    /// 使用特定ID创建材质。
    pub fn create_material_with_id(
        &mut self,
        material_id: u32,
        name: &str,
        shader_id: u32,
        blend_mode: u8,
    ) {
        use crate::renderer::material::{Material, BlendMode};

        let blend = match blend_mode {
            0 => BlendMode::None,
            1 => BlendMode::Alpha,
            2 => BlendMode::Additive,
            3 => BlendMode::Multiply,
            4 => BlendMode::Screen,
            5 => BlendMode::PremultipliedAlpha,
            _ => BlendMode::Alpha,
        };

        let mut material = Material::with_shader(name, shader_id);
        material.blend_mode = blend;

        self.renderer.register_material_with_id(material_id, material);
    }

    /// Check if a material exists.
    /// 检查材质是否存在。
    pub fn has_material(&self, material_id: u32) -> bool {
        self.renderer.has_material(material_id)
    }

    /// Remove a material.
    /// 移除材质。
    pub fn remove_material(&mut self, material_id: u32) -> bool {
        self.renderer.remove_material(material_id)
    }

    /// Set a material's float uniform.
    /// 设置材质的浮点uniform。
    pub fn set_material_float(&mut self, material_id: u32, name: &str, value: f32) -> bool {
        self.renderer.set_material_float(material_id, name, value)
    }

    /// Set a material's vec2 uniform.
    /// 设置材质的vec2 uniform。
    pub fn set_material_vec2(&mut self, material_id: u32, name: &str, x: f32, y: f32) -> bool {
        if let Some(material) = self.renderer.get_material_mut(material_id) {
            material.uniforms.set_vec2(name, x, y);
            true
        } else {
            false
        }
    }

    /// Set a material's vec3 uniform.
    /// 设置材质的vec3 uniform。
    pub fn set_material_vec3(&mut self, material_id: u32, name: &str, x: f32, y: f32, z: f32) -> bool {
        if let Some(material) = self.renderer.get_material_mut(material_id) {
            material.uniforms.set_vec3(name, x, y, z);
            true
        } else {
            false
        }
    }

    /// Set a material's vec4 uniform.
    /// 设置材质的vec4 uniform。
    pub fn set_material_vec4(&mut self, material_id: u32, name: &str, x: f32, y: f32, z: f32, w: f32) -> bool {
        self.renderer.set_material_vec4(material_id, name, x, y, z, w)
    }

    /// Set a material's color uniform.
    /// 设置材质的颜色uniform。
    pub fn set_material_color(&mut self, material_id: u32, name: &str, r: f32, g: f32, b: f32, a: f32) -> bool {
        if let Some(material) = self.renderer.get_material_mut(material_id) {
            material.uniforms.set_color(name, r, g, b, a);
            true
        } else {
            false
        }
    }

    /// Set a material's blend mode.
    /// 设置材质的混合模式。
    pub fn set_material_blend_mode(&mut self, material_id: u32, blend_mode: u8) -> bool {
        use crate::renderer::material::BlendMode;

        let blend = match blend_mode {
            0 => BlendMode::None,
            1 => BlendMode::Alpha,
            2 => BlendMode::Additive,
            3 => BlendMode::Multiply,
            4 => BlendMode::Screen,
            5 => BlendMode::PremultipliedAlpha,
            _ => return false,
        };

        if let Some(material) = self.renderer.get_material_mut(material_id) {
            material.blend_mode = blend;
            true
        } else {
            false
        }
    }

    // ===== 3D Rendering Mode =====
    // ===== 3D 渲染模式 =====

    /// Get current render mode.
    /// 获取当前渲染模式。
    pub fn render_mode(&self) -> RenderMode {
        self.render_mode
    }

    /// Set render mode (2D or 3D).
    /// 设置渲染模式（2D或3D）。
    ///
    /// When switching to 3D mode, the 3D renderer is lazily initialized if not already created.
    /// 切换到3D模式时，如果3D渲染器尚未创建，则会延迟初始化。
    pub fn set_render_mode(&mut self, mode: RenderMode) -> Result<()> {
        if mode == RenderMode::Mode3D && self.renderer_3d.is_none() {
            // Initialize 3D renderer on first use
            // 首次使用时初始化3D渲染器
            let renderer_3d = Renderer3D::new(&mut self.backend)
                .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
            self.renderer_3d = Some(renderer_3d);

            // Initialize 3D grid renderer
            // 初始化3D网格渲染器
            let grid_3d = Grid3DRenderer::new(&mut self.backend)
                .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
            self.grid_3d_renderer = Some(grid_3d);

            // Initialize 3D gizmo renderer
            // 初始化3D Gizmo渲染器
            let gizmo_3d = Gizmo3DRenderer::new(&mut self.backend)
                .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
            self.gizmo_3d_renderer = Some(gizmo_3d);

            log::info!("3D renderer, grid and gizmo initialized | 3D渲染器、网格和Gizmo已初始化");
        }
        self.render_mode = mode;
        Ok(())
    }

    /// Check if 3D renderer is initialized.
    /// 检查3D渲染器是否已初始化。
    pub fn has_3d_renderer(&self) -> bool {
        self.renderer_3d.is_some()
    }

    /// Get reference to 3D renderer (if initialized).
    /// 获取3D渲染器的引用（如果已初始化）。
    pub fn renderer_3d(&self) -> Option<&Renderer3D> {
        self.renderer_3d.as_ref()
    }

    /// Get mutable reference to 3D renderer (if initialized).
    /// 获取3D渲染器的可变引用（如果已初始化）。
    pub fn renderer_3d_mut(&mut self) -> Option<&mut Renderer3D> {
        self.renderer_3d.as_mut()
    }

    /// Set 3D camera position.
    /// 设置3D相机位置。
    pub fn set_camera_3d_position(&mut self, x: f32, y: f32, z: f32) {
        if let Some(ref mut renderer) = self.renderer_3d {
            renderer.camera_mut().position = glam::Vec3::new(x, y, z);
        }
    }

    /// Get 3D camera position.
    /// 获取3D相机位置。
    pub fn get_camera_3d_position(&self) -> Option<(f32, f32, f32)> {
        self.renderer_3d.as_ref().map(|r| {
            let pos = r.camera().position;
            (pos.x, pos.y, pos.z)
        })
    }

    /// Set 3D camera rotation using Euler angles (in degrees).
    /// 使用欧拉角设置3D相机旋转（角度制）。
    pub fn set_camera_3d_rotation(&mut self, pitch: f32, yaw: f32, roll: f32) {
        if let Some(ref mut renderer) = self.renderer_3d {
            let pitch_rad = pitch.to_radians();
            let yaw_rad = yaw.to_radians();
            let roll_rad = roll.to_radians();
            renderer.camera_mut().set_rotation_euler(pitch_rad, yaw_rad, roll_rad);
        }
    }

    /// Get 3D camera rotation as Euler angles (in degrees).
    /// 获取3D相机旋转的欧拉角（角度制）。
    pub fn get_camera_3d_rotation(&self) -> Option<(f32, f32, f32)> {
        self.renderer_3d.as_ref().map(|r| {
            let (pitch, yaw, roll) = r.camera().get_rotation_euler();
            (pitch.to_degrees(), yaw.to_degrees(), roll.to_degrees())
        })
    }

    /// Set 3D camera field of view (in degrees).
    /// 设置3D相机视野角（角度制）。
    pub fn set_camera_3d_fov(&mut self, fov_degrees: f32) {
        if let Some(ref mut renderer) = self.renderer_3d {
            renderer.camera_mut().fov = fov_degrees.to_radians();
        }
    }

    /// Get 3D camera field of view (in degrees).
    /// 获取3D相机视野角（角度制）。
    pub fn get_camera_3d_fov(&self) -> Option<f32> {
        self.renderer_3d.as_ref().map(|r| r.camera().fov.to_degrees())
    }

    /// Set 3D camera projection type.
    /// 设置3D相机投影类型。
    ///
    /// 0 = Perspective, 1 = Orthographic (with size)
    pub fn set_camera_3d_projection(&mut self, projection_type: u8, ortho_size: f32) {
        if let Some(ref mut renderer) = self.renderer_3d {
            renderer.camera_mut().projection_type = match projection_type {
                0 => ProjectionType::Perspective,
                1 => ProjectionType::Orthographic { size: ortho_size },
                _ => ProjectionType::Perspective,
            };
        }
    }

    /// Make 3D camera look at a target position.
    /// 使3D相机朝向目标位置。
    pub fn camera_3d_look_at(&mut self, target_x: f32, target_y: f32, target_z: f32) {
        if let Some(ref mut renderer) = self.renderer_3d {
            let target = glam::Vec3::new(target_x, target_y, target_z);
            renderer.camera_mut().look_at(target, glam::Vec3::Y);
        }
    }

    /// Set 3D camera near and far clip planes.
    /// 设置3D相机近裁剪面和远裁剪面。
    pub fn set_camera_3d_clip_planes(&mut self, near: f32, far: f32) {
        if let Some(ref mut renderer) = self.renderer_3d {
            renderer.camera_mut().near = near;
            renderer.camera_mut().far = far;
        }
    }

    /// Resize 3D renderer viewport.
    /// 调整3D渲染器视口大小。
    pub fn resize_3d(&mut self, width: f32, height: f32) {
        if let Some(ref mut renderer) = self.renderer_3d {
            renderer.resize(width, height);
        }
    }

    /// Render 3D content.
    /// 渲染3D内容。
    pub fn render_3d(&mut self) -> Result<()> {
        if let Some(ref mut renderer) = self.renderer_3d {
            renderer.render(&mut self.backend, &self.texture_manager)
                .map_err(|e| crate::core::error::EngineError::WebGLError(e))?;
        }
        Ok(())
    }
}
