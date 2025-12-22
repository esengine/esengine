//! WebGL2 后端实现
//!
//! WebGL2 backend implementation.

use es_engine_shared::{
    traits::backend::*,
    types::{
        handle::*,
        vertex::*,
        blend::*,
        texture::*,
    },
    Vec2, Vec3, Vec4, Mat3, Mat4,
};

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{
    WebGl2RenderingContext as GL,
    WebGlProgram, WebGlShader, WebGlBuffer,
    WebGlTexture, WebGlVertexArrayObject,
    WebGlUniformLocation, HtmlCanvasElement,
};
use std::collections::HashMap;

// ==================== 内部数据结构 | Internal Data Structures ====================

/// 着色器数据
///
/// Shader data.
struct ShaderData {
    /// WebGL 程序对象 | WebGL program object
    program: WebGlProgram,
    /// Uniform 位置缓存 | Uniform location cache
    uniform_locations: HashMap<String, Option<WebGlUniformLocation>>,
}

/// 纹理数据
///
/// Texture data.
struct TextureData {
    /// WebGL 纹理对象 | WebGL texture object
    handle: WebGlTexture,
    /// 纹理宽度 | Texture width
    width: u32,
    /// 纹理高度 | Texture height
    height: u32,
}

/// VAO 数据
///
/// VAO data.
struct VertexArrayData {
    /// WebGL VAO 对象 | WebGL VAO object
    vao: WebGlVertexArrayObject,
    /// 关联的索引缓冲区类型 | Associated index buffer type
    index_type: Option<IndexType>,
}

/// 索引类型
///
/// Index type.
#[derive(Clone, Copy)]
enum IndexType {
    U16,
    U32,
}

// ==================== WebGL2Backend ====================

/// WebGL2 图形后端
///
/// 实现 `GraphicsBackend` trait，提供 WebGL2 渲染能力。
///
/// WebGL2 graphics backend.
/// Implements `GraphicsBackend` trait for WebGL2 rendering.
pub struct WebGL2Backend {
    /// WebGL2 渲染上下文 | WebGL2 rendering context
    gl: GL,

    /// 画布元素（可选，外部上下文时为 None）
    ///
    /// Canvas element (None for external context).
    #[allow(dead_code)]
    canvas: Option<HtmlCanvasElement>,

    /// 当前宽度 | Current width
    width: u32,

    /// 当前高度 | Current height
    height: u32,

    // ===== 资源管理 | Resource Management =====

    /// 缓冲区映射 | Buffer map
    buffers: HandleMap<WebGlBuffer>,

    /// 顶点数组对象映射 | VAO map
    vertex_arrays: HandleMap<VertexArrayData>,

    /// 着色器映射 | Shader map
    shaders: HandleMap<ShaderData>,

    /// 纹理映射 | Texture map
    textures: HandleMap<TextureData>,

    // ===== 当前状态 | Current State =====

    /// 当前绑定的着色器 | Currently bound shader
    current_shader: Option<ShaderHandle>,

    /// 当前渲染状态 | Current render state
    current_render_state: RenderState,

    /// 版本字符串 | Version string
    version: String,
}

impl WebGL2Backend {
    /// 从 canvas ID 创建
    ///
    /// Create from canvas ID.
    pub fn from_canvas(canvas_id: &str) -> GraphicsResult<Self> {
        let document = web_sys::window()
            .ok_or_else(|| GraphicsError::Backend("No window".into()))?
            .document()
            .ok_or_else(|| GraphicsError::Backend("No document".into()))?;

        let canvas = document
            .get_element_by_id(canvas_id)
            .ok_or_else(|| GraphicsError::Backend(format!("Canvas '{}' not found", canvas_id)))?
            .dyn_into::<HtmlCanvasElement>()
            .map_err(|_| GraphicsError::Backend("Element is not a canvas".into()))?;

        let gl = canvas
            .get_context("webgl2")
            .map_err(|e| GraphicsError::Backend(format!("Failed to get WebGL2 context: {:?}", e)))?
            .ok_or_else(|| GraphicsError::Backend("WebGL2 not supported".into()))?
            .dyn_into::<GL>()
            .map_err(|_| GraphicsError::Backend("Failed to cast to WebGL2".into()))?;

        let width = canvas.width();
        let height = canvas.height();

        let version = gl
            .get_parameter(GL::VERSION)
            .ok()
            .and_then(|v| v.as_string())
            .unwrap_or_else(|| "WebGL 2.0".to_string());

        let mut backend = Self {
            gl,
            canvas: Some(canvas),
            width,
            height,
            buffers: HandleMap::new(),
            vertex_arrays: HandleMap::new(),
            shaders: HandleMap::new(),
            textures: HandleMap::new(),
            current_shader: None,
            current_render_state: RenderState::default(),
            version,
        };

        backend.init_gl_state();
        Ok(backend)
    }

    /// 从外部 GL 上下文创建（微信小游戏等）
    ///
    /// Create from external GL context (WeChat Mini Game, etc.).
    pub fn from_external(gl_context: JsValue, width: u32, height: u32) -> GraphicsResult<Self> {
        let gl = gl_context
            .dyn_into::<GL>()
            .map_err(|_| GraphicsError::Backend("Failed to cast to WebGL2".into()))?;

        let version = gl
            .get_parameter(GL::VERSION)
            .ok()
            .and_then(|v| v.as_string())
            .unwrap_or_else(|| "WebGL 2.0".to_string());

        let mut backend = Self {
            gl,
            canvas: None,
            width,
            height,
            buffers: HandleMap::new(),
            vertex_arrays: HandleMap::new(),
            shaders: HandleMap::new(),
            textures: HandleMap::new(),
            current_shader: None,
            current_render_state: RenderState::default(),
            version,
        };

        backend.init_gl_state();
        Ok(backend)
    }

    /// 初始化 GL 状态
    ///
    /// Initialize GL state.
    fn init_gl_state(&mut self) {
        self.gl.viewport(0, 0, self.width as i32, self.height as i32);
        self.gl.enable(GL::BLEND);
        self.gl.blend_func(GL::SRC_ALPHA, GL::ONE_MINUS_SRC_ALPHA);
    }

    /// 获取 WebGL 上下文引用
    ///
    /// Get WebGL context reference.
    pub fn gl(&self) -> &GL {
        &self.gl
    }

    /// 获取或缓存 uniform 位置
    ///
    /// Get or cache uniform location.
    fn get_uniform_location(&mut self, name: &str) -> Option<WebGlUniformLocation> {
        let shader_handle = self.current_shader?;
        let shader = self.shaders.get_mut(shader_handle)?;

        if let Some(cached) = shader.uniform_locations.get(name) {
            return cached.clone();
        }

        let location = self.gl.get_uniform_location(&shader.program, name);
        shader.uniform_locations.insert(name.to_string(), location.clone());
        location
    }

    /// 编译单个着色器
    ///
    /// Compile single shader.
    fn compile_shader_stage(&self, shader_type: u32, source: &str) -> GraphicsResult<WebGlShader> {
        let shader = self.gl.create_shader(shader_type)
            .ok_or_else(|| GraphicsError::ShaderCompilation("Failed to create shader".into()))?;

        self.gl.shader_source(&shader, source);
        self.gl.compile_shader(&shader);

        if !self.gl.get_shader_parameter(&shader, GL::COMPILE_STATUS)
            .as_bool()
            .unwrap_or(false)
        {
            let log = self.gl.get_shader_info_log(&shader).unwrap_or_default();
            self.gl.delete_shader(Some(&shader));
            let stage_name = if shader_type == GL::VERTEX_SHADER { "Vertex" } else { "Fragment" };
            return Err(GraphicsError::ShaderCompilation(format!("{} shader: {}", stage_name, log)));
        }

        Ok(shader)
    }
}

// ==================== GraphicsBackend 实现 | GraphicsBackend Implementation ====================

impl GraphicsBackend for WebGL2Backend {
    fn name(&self) -> &'static str {
        "WebGL2"
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn resize(&mut self, width: u32, height: u32) {
        self.width = width;
        self.height = height;
        self.gl.viewport(0, 0, width as i32, height as i32);
    }

    fn width(&self) -> u32 {
        self.width
    }

    fn height(&self) -> u32 {
        self.height
    }

    fn begin_frame(&mut self) {
        // WebGL2 不需要显式 begin frame
    }

    fn end_frame(&mut self) {
        // WebGL2 不需要显式 end frame（自动 swap）
    }

    fn clear(&mut self, r: f32, g: f32, b: f32, a: f32) {
        self.gl.clear_color(r, g, b, a);
        self.gl.clear(GL::COLOR_BUFFER_BIT);
    }

    fn set_viewport(&mut self, x: i32, y: i32, width: u32, height: u32) {
        self.gl.viewport(x, y, width as i32, height as i32);
    }

    // ==================== 缓冲区操作 | Buffer Operations ====================

    fn create_vertex_buffer(&mut self, data: &[u8], usage: BufferUsage) -> GraphicsResult<BufferHandle> {
        let buffer = self.gl.create_buffer()
            .ok_or_else(|| GraphicsError::BufferCreation("Failed to create vertex buffer".into()))?;

        self.gl.bind_buffer(GL::ARRAY_BUFFER, Some(&buffer));

        let gl_usage = match usage {
            BufferUsage::Static => GL::STATIC_DRAW,
            BufferUsage::Dynamic => GL::DYNAMIC_DRAW,
            BufferUsage::Stream => GL::STREAM_DRAW,
        };

        if data.is_empty() {
            // Allocate empty buffer - should not happen in normal use
            self.gl.buffer_data_with_i32(GL::ARRAY_BUFFER, 0, gl_usage);
        } else {
            unsafe {
                let array = js_sys::Uint8Array::view(data);
                self.gl.buffer_data_with_array_buffer_view(GL::ARRAY_BUFFER, &array, gl_usage);
            }
        }

        Ok(self.buffers.insert(buffer))
    }

    fn create_vertex_buffer_sized(&mut self, size: usize, usage: BufferUsage) -> GraphicsResult<BufferHandle> {
        let buffer = self.gl.create_buffer()
            .ok_or_else(|| GraphicsError::BufferCreation("Failed to create vertex buffer".into()))?;

        self.gl.bind_buffer(GL::ARRAY_BUFFER, Some(&buffer));

        let gl_usage = match usage {
            BufferUsage::Static => GL::STATIC_DRAW,
            BufferUsage::Dynamic => GL::DYNAMIC_DRAW,
            BufferUsage::Stream => GL::STREAM_DRAW,
        };

        self.gl.buffer_data_with_i32(GL::ARRAY_BUFFER, size as i32, gl_usage);

        Ok(self.buffers.insert(buffer))
    }

    fn create_index_buffer(&mut self, data: &[u16], usage: BufferUsage) -> GraphicsResult<BufferHandle> {
        let buffer = self.gl.create_buffer()
            .ok_or_else(|| GraphicsError::BufferCreation("Failed to create index buffer".into()))?;

        self.gl.bind_buffer(GL::ELEMENT_ARRAY_BUFFER, Some(&buffer));

        let gl_usage = match usage {
            BufferUsage::Static => GL::STATIC_DRAW,
            BufferUsage::Dynamic => GL::DYNAMIC_DRAW,
            BufferUsage::Stream => GL::STREAM_DRAW,
        };

        unsafe {
            let array = js_sys::Uint16Array::view(data);
            self.gl.buffer_data_with_array_buffer_view(GL::ELEMENT_ARRAY_BUFFER, &array, gl_usage);
        }

        Ok(self.buffers.insert(buffer))
    }

    fn create_index_buffer_u32(&mut self, data: &[u32], usage: BufferUsage) -> GraphicsResult<BufferHandle> {
        let buffer = self.gl.create_buffer()
            .ok_or_else(|| GraphicsError::BufferCreation("Failed to create index buffer".into()))?;

        self.gl.bind_buffer(GL::ELEMENT_ARRAY_BUFFER, Some(&buffer));

        let gl_usage = match usage {
            BufferUsage::Static => GL::STATIC_DRAW,
            BufferUsage::Dynamic => GL::DYNAMIC_DRAW,
            BufferUsage::Stream => GL::STREAM_DRAW,
        };

        unsafe {
            let array = js_sys::Uint32Array::view(data);
            self.gl.buffer_data_with_array_buffer_view(GL::ELEMENT_ARRAY_BUFFER, &array, gl_usage);
        }

        Ok(self.buffers.insert(buffer))
    }

    fn update_buffer(&mut self, handle: BufferHandle, offset: usize, data: &[u8]) -> GraphicsResult<()> {
        let buffer = self.buffers.get(handle)
            .ok_or_else(|| GraphicsError::InvalidHandle("Buffer not found".into()))?;

        self.gl.bind_buffer(GL::ARRAY_BUFFER, Some(buffer));

        unsafe {
            let array = js_sys::Uint8Array::view(data);
            self.gl.buffer_sub_data_with_i32_and_array_buffer_view(
                GL::ARRAY_BUFFER,
                offset as i32,
                &array,
            );
        }

        Ok(())
    }

    fn destroy_buffer(&mut self, handle: BufferHandle) {
        if let Some(buffer) = self.buffers.remove(handle) {
            self.gl.delete_buffer(Some(&buffer));
        }
    }

    fn create_vertex_array(
        &mut self,
        vertex_buffer: BufferHandle,
        index_buffer: Option<BufferHandle>,
        layout: &VertexLayout,
    ) -> GraphicsResult<VertexArrayHandle> {
        let vao = self.gl.create_vertex_array()
            .ok_or_else(|| GraphicsError::BufferCreation("Failed to create VAO".into()))?;

        self.gl.bind_vertex_array(Some(&vao));

        // 绑定顶点缓冲区
        let vb = self.buffers.get(vertex_buffer)
            .ok_or_else(|| GraphicsError::InvalidHandle("Vertex buffer not found".into()))?;
        self.gl.bind_buffer(GL::ARRAY_BUFFER, Some(vb));

        // 设置顶点属性
        for (idx, attr) in layout.attributes.iter().enumerate() {
            let (size, type_, normalized) = match attr.attr_type {
                VertexAttributeType::Float => (1, GL::FLOAT, false),
                VertexAttributeType::Float2 => (2, GL::FLOAT, false),
                VertexAttributeType::Float3 => (3, GL::FLOAT, false),
                VertexAttributeType::Float4 => (4, GL::FLOAT, false),
                VertexAttributeType::Int => (1, GL::INT, false),
                VertexAttributeType::Int2 => (2, GL::INT, false),
                VertexAttributeType::Int3 => (3, GL::INT, false),
                VertexAttributeType::Int4 => (4, GL::INT, false),
                VertexAttributeType::UInt => (1, GL::UNSIGNED_INT, false),
                VertexAttributeType::UInt2 => (2, GL::UNSIGNED_INT, false),
                VertexAttributeType::UInt3 => (3, GL::UNSIGNED_INT, false),
                VertexAttributeType::UInt4 => (4, GL::UNSIGNED_INT, false),
                VertexAttributeType::UByte4Norm => (4, GL::UNSIGNED_BYTE, true),
            };

            self.gl.enable_vertex_attrib_array(idx as u32);

            if attr.attr_type.is_integer() && !normalized {
                self.gl.vertex_attrib_i_pointer_with_i32(
                    idx as u32,
                    size,
                    type_,
                    layout.stride as i32,
                    attr.offset as i32,
                );
            } else {
                self.gl.vertex_attrib_pointer_with_i32(
                    idx as u32,
                    size,
                    type_,
                    normalized || attr.normalized,
                    layout.stride as i32,
                    attr.offset as i32,
                );
            }
        }

        let index_type = if let Some(ib_handle) = index_buffer {
            if let Some(ib) = self.buffers.get(ib_handle) {
                self.gl.bind_buffer(GL::ELEMENT_ARRAY_BUFFER, Some(ib));
                Some(IndexType::U16)
            } else {
                self.gl.bind_buffer(GL::ELEMENT_ARRAY_BUFFER, None);
                None
            }
        } else {
            self.gl.bind_buffer(GL::ELEMENT_ARRAY_BUFFER, None);
            None
        };

        self.gl.bind_vertex_array(None);

        let data = VertexArrayData { vao, index_type };
        Ok(self.vertex_arrays.insert(data))
    }

    fn destroy_vertex_array(&mut self, handle: VertexArrayHandle) {
        if let Some(data) = self.vertex_arrays.remove(handle) {
            self.gl.delete_vertex_array(Some(&data.vao));
        }
    }

    // ==================== 着色器操作 | Shader Operations ====================

    fn compile_shader(&mut self, vertex_src: &str, fragment_src: &str) -> GraphicsResult<ShaderHandle> {
        // 编译顶点着色器
        let vert_shader = self.compile_shader_stage(GL::VERTEX_SHADER, vertex_src)?;

        // 编译片段着色器
        let frag_shader = match self.compile_shader_stage(GL::FRAGMENT_SHADER, fragment_src) {
            Ok(s) => s,
            Err(e) => {
                self.gl.delete_shader(Some(&vert_shader));
                return Err(e);
            }
        };

        // 链接程序
        let program = self.gl.create_program()
            .ok_or_else(|| GraphicsError::ShaderLinking("Failed to create program".into()))?;

        self.gl.attach_shader(&program, &vert_shader);
        self.gl.attach_shader(&program, &frag_shader);
        self.gl.link_program(&program);

        // 删除着色器对象（已链接到程序）
        self.gl.delete_shader(Some(&vert_shader));
        self.gl.delete_shader(Some(&frag_shader));

        if !self.gl.get_program_parameter(&program, GL::LINK_STATUS)
            .as_bool()
            .unwrap_or(false)
        {
            let log = self.gl.get_program_info_log(&program).unwrap_or_default();
            self.gl.delete_program(Some(&program));
            return Err(GraphicsError::ShaderLinking(log));
        }

        let shader_data = ShaderData {
            program,
            uniform_locations: HashMap::new(),
        };

        Ok(self.shaders.insert(shader_data))
    }

    fn destroy_shader(&mut self, handle: ShaderHandle) {
        if let Some(data) = self.shaders.remove(handle) {
            self.gl.delete_program(Some(&data.program));
        }

        // 如果销毁的是当前着色器，清除状态
        if self.current_shader == Some(handle) {
            self.current_shader = None;
        }
    }

    fn bind_shader(&mut self, handle: ShaderHandle) -> GraphicsResult<()> {
        let data = self.shaders.get(handle)
            .ok_or_else(|| GraphicsError::InvalidHandle("Shader not found".into()))?;

        self.gl.use_program(Some(&data.program));
        self.current_shader = Some(handle);
        Ok(())
    }

    fn set_uniform_f32(&mut self, name: &str, value: f32) -> GraphicsResult<()> {
        let location = self.get_uniform_location(name);
        self.gl.uniform1f(location.as_ref(), value);
        Ok(())
    }

    fn set_uniform_vec2(&mut self, name: &str, value: Vec2) -> GraphicsResult<()> {
        let location = self.get_uniform_location(name);
        self.gl.uniform2f(location.as_ref(), value.x, value.y);
        Ok(())
    }

    fn set_uniform_vec3(&mut self, name: &str, value: Vec3) -> GraphicsResult<()> {
        let location = self.get_uniform_location(name);
        self.gl.uniform3f(location.as_ref(), value.x, value.y, value.z);
        Ok(())
    }

    fn set_uniform_vec4(&mut self, name: &str, value: Vec4) -> GraphicsResult<()> {
        let location = self.get_uniform_location(name);
        self.gl.uniform4f(location.as_ref(), value.x, value.y, value.z, value.w);
        Ok(())
    }

    fn set_uniform_mat3(&mut self, name: &str, value: &Mat3) -> GraphicsResult<()> {
        let location = self.get_uniform_location(name);
        self.gl.uniform_matrix3fv_with_f32_array(location.as_ref(), false, &value.to_cols_array());
        Ok(())
    }

    fn set_uniform_mat4(&mut self, name: &str, value: &Mat4) -> GraphicsResult<()> {
        let location = self.get_uniform_location(name);
        self.gl.uniform_matrix4fv_with_f32_array(location.as_ref(), false, &value.to_cols_array());
        Ok(())
    }

    fn set_uniform_i32(&mut self, name: &str, value: i32) -> GraphicsResult<()> {
        let location = self.get_uniform_location(name);
        self.gl.uniform1i(location.as_ref(), value);
        Ok(())
    }

    // ==================== 纹理操作 | Texture Operations ====================

    fn create_texture(&mut self, desc: &TextureDescriptor) -> GraphicsResult<TextureHandle> {
        let texture = self.gl.create_texture()
            .ok_or_else(|| GraphicsError::TextureCreation("Failed to create texture".into()))?;

        self.gl.bind_texture(GL::TEXTURE_2D, Some(&texture));

        // 设置过滤模式
        let min_filter = texture_filter_to_gl(desc.filter_min);
        let mag_filter = texture_filter_to_gl(desc.filter_mag);
        let wrap_s = texture_wrap_to_gl(desc.wrap_s);
        let wrap_t = texture_wrap_to_gl(desc.wrap_t);

        self.gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_MIN_FILTER, min_filter as i32);
        self.gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_MAG_FILTER, mag_filter as i32);
        self.gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_WRAP_S, wrap_s as i32);
        self.gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_WRAP_T, wrap_t as i32);

        let data = TextureData {
            handle: texture,
            width: desc.width,
            height: desc.height,
        };

        Ok(self.textures.insert(data))
    }

    fn create_blank_texture(&mut self, width: u32, height: u32) -> GraphicsResult<TextureHandle> {
        let desc = TextureDescriptor::new(width, height);
        let handle = self.create_texture(&desc)?;

        // 分配空白纹理内存
        if let Some(data) = self.textures.get(handle) {
            self.gl.bind_texture(GL::TEXTURE_2D, Some(&data.handle));
            self.gl.tex_image_2d_with_i32_and_i32_and_i32_and_format_and_type_and_opt_u8_array(
                GL::TEXTURE_2D,
                0,
                GL::RGBA as i32,
                width as i32,
                height as i32,
                0,
                GL::RGBA,
                GL::UNSIGNED_BYTE,
                None,
            ).map_err(|e| GraphicsError::TextureCreation(format!("{:?}", e)))?;
        }

        Ok(handle)
    }

    fn upload_texture_data(
        &mut self,
        handle: TextureHandle,
        data: &[u8],
        width: u32,
        height: u32,
    ) -> GraphicsResult<()> {
        let tex_data = self.textures.get_mut(handle)
            .ok_or_else(|| GraphicsError::InvalidHandle("Texture not found".into()))?;

        tex_data.width = width;
        tex_data.height = height;

        self.gl.bind_texture(GL::TEXTURE_2D, Some(&tex_data.handle));

        self.gl.tex_image_2d_with_i32_and_i32_and_i32_and_format_and_type_and_opt_u8_array(
            GL::TEXTURE_2D,
            0,
            GL::RGBA as i32,
            width as i32,
            height as i32,
            0,
            GL::RGBA,
            GL::UNSIGNED_BYTE,
            Some(data),
        ).map_err(|e| GraphicsError::TextureCreation(format!("{:?}", e)))?;

        Ok(())
    }

    fn update_texture_region(
        &mut self,
        handle: TextureHandle,
        x: u32,
        y: u32,
        width: u32,
        height: u32,
        data: &[u8],
    ) -> GraphicsResult<()> {
        let tex_data = self.textures.get(handle)
            .ok_or_else(|| GraphicsError::InvalidHandle("Texture not found".into()))?;

        self.gl.bind_texture(GL::TEXTURE_2D, Some(&tex_data.handle));

        self.gl.tex_sub_image_2d_with_i32_and_i32_and_u32_and_type_and_opt_u8_array(
            GL::TEXTURE_2D,
            0,
            x as i32,
            y as i32,
            width as i32,
            height as i32,
            GL::RGBA,
            GL::UNSIGNED_BYTE,
            Some(data),
        ).map_err(|e| GraphicsError::TextureCreation(format!("{:?}", e)))?;

        Ok(())
    }

    fn destroy_texture(&mut self, handle: TextureHandle) {
        if let Some(data) = self.textures.remove(handle) {
            self.gl.delete_texture(Some(&data.handle));
        }
    }

    fn bind_texture(&mut self, handle: TextureHandle, unit: u32) -> GraphicsResult<()> {
        let data = self.textures.get(handle)
            .ok_or_else(|| GraphicsError::InvalidHandle("Texture not found".into()))?;

        self.gl.active_texture(GL::TEXTURE0 + unit);
        self.gl.bind_texture(GL::TEXTURE_2D, Some(&data.handle));
        Ok(())
    }

    fn get_texture_size(&self, handle: TextureHandle) -> Option<(u32, u32)> {
        self.textures.get(handle).map(|d| (d.width, d.height))
    }

    // ==================== 渲染状态 | Render State ====================

    fn apply_render_state(&mut self, state: &RenderState) {
        // Blend mode | 混合模式
        if self.current_render_state.blend_mode != state.blend_mode {
            self.set_blend_mode(state.blend_mode);
        }

        // Scissor | 裁剪
        if self.current_render_state.scissor != state.scissor {
            self.set_scissor(state.scissor);
        }

        // Depth test | 深度测试
        if self.current_render_state.depth_test != state.depth_test {
            self.set_depth_test(state.depth_test);
        }

        // Depth write | 深度写入
        if self.current_render_state.depth_write != state.depth_write {
            self.set_depth_write(state.depth_write);
        }

        // Depth function | 深度比较函数
        if self.current_render_state.depth_func != state.depth_func {
            self.set_depth_func(state.depth_func);
        }

        // Cull mode | 裁剪模式
        if self.current_render_state.cull_mode != state.cull_mode {
            self.set_cull_mode(state.cull_mode);
        }

        self.current_render_state = state.clone();
    }

    fn set_blend_mode(&mut self, mode: BlendMode) {
        match mode {
            BlendMode::None => {
                self.gl.disable(GL::BLEND);
            }
            BlendMode::Alpha => {
                self.gl.enable(GL::BLEND);
                self.gl.blend_func(GL::SRC_ALPHA, GL::ONE_MINUS_SRC_ALPHA);
            }
            BlendMode::Additive => {
                self.gl.enable(GL::BLEND);
                self.gl.blend_func(GL::ONE, GL::ONE);
            }
            BlendMode::Multiply => {
                self.gl.enable(GL::BLEND);
                self.gl.blend_func(GL::DST_COLOR, GL::ZERO);
            }
            BlendMode::Screen => {
                self.gl.enable(GL::BLEND);
                self.gl.blend_func(GL::ONE, GL::ONE_MINUS_SRC_COLOR);
            }
            BlendMode::PremultipliedAlpha => {
                self.gl.enable(GL::BLEND);
                self.gl.blend_func(GL::ONE, GL::ONE_MINUS_SRC_ALPHA);
            }
        }

        self.current_render_state.blend_mode = mode;
    }

    fn set_scissor(&mut self, rect: Option<ScissorRect>) {
        match rect {
            Some(r) => {
                self.gl.enable(GL::SCISSOR_TEST);
                // WebGL Y 轴翻转
                let gl_y = self.height as i32 - r.y - r.height as i32;
                self.gl.scissor(r.x, gl_y, r.width as i32, r.height as i32);
            }
            None => {
                self.gl.disable(GL::SCISSOR_TEST);
            }
        }

        self.current_render_state.scissor = rect;
    }

    // ==================== 绘制命令 | Draw Commands ====================

    fn draw_indexed(
        &mut self,
        vao: VertexArrayHandle,
        index_count: u32,
        index_offset: u32,
    ) -> GraphicsResult<()> {
        let vao_data = self.vertex_arrays.get(vao)
            .ok_or_else(|| GraphicsError::InvalidHandle("VAO not found".into()))?;

        self.gl.bind_vertex_array(Some(&vao_data.vao));
        self.gl.draw_elements_with_i32(
            GL::TRIANGLES,
            index_count as i32,
            GL::UNSIGNED_SHORT,
            (index_offset * 2) as i32, // 2 bytes per u16
        );

        Ok(())
    }

    fn draw_indexed_u32(
        &mut self,
        vao: VertexArrayHandle,
        index_count: u32,
        index_offset: u32,
    ) -> GraphicsResult<()> {
        let vao_data = self.vertex_arrays.get(vao)
            .ok_or_else(|| GraphicsError::InvalidHandle("VAO not found".into()))?;

        self.gl.bind_vertex_array(Some(&vao_data.vao));
        self.gl.draw_elements_with_i32(
            GL::TRIANGLES,
            index_count as i32,
            GL::UNSIGNED_INT,
            (index_offset * 4) as i32, // 4 bytes per u32
        );

        Ok(())
    }

    fn draw(
        &mut self,
        vao: VertexArrayHandle,
        vertex_count: u32,
        vertex_offset: u32,
    ) -> GraphicsResult<()> {
        let vao_data = self.vertex_arrays.get(vao)
            .ok_or_else(|| GraphicsError::InvalidHandle("VAO not found".into()))?;

        self.gl.bind_vertex_array(Some(&vao_data.vao));
        self.gl.draw_arrays(GL::TRIANGLES, vertex_offset as i32, vertex_count as i32);

        Ok(())
    }

    fn draw_lines(
        &mut self,
        vao: VertexArrayHandle,
        vertex_count: u32,
        vertex_offset: u32,
    ) -> GraphicsResult<()> {
        let vao_data = self.vertex_arrays.get(vao)
            .ok_or_else(|| GraphicsError::InvalidHandle("VAO not found".into()))?;

        self.gl.bind_vertex_array(Some(&vao_data.vao));
        self.gl.draw_arrays(GL::LINES, vertex_offset as i32, vertex_count as i32);

        Ok(())
    }

    fn draw_line_loop(
        &mut self,
        vao: VertexArrayHandle,
        vertex_count: u32,
        vertex_offset: u32,
    ) -> GraphicsResult<()> {
        let vao_data = self.vertex_arrays.get(vao)
            .ok_or_else(|| GraphicsError::InvalidHandle("VAO not found".into()))?;

        self.gl.bind_vertex_array(Some(&vao_data.vao));
        self.gl.draw_arrays(GL::LINE_LOOP, vertex_offset as i32, vertex_count as i32);

        Ok(())
    }

    fn draw_line_strip(
        &mut self,
        vao: VertexArrayHandle,
        vertex_count: u32,
        vertex_offset: u32,
    ) -> GraphicsResult<()> {
        let vao_data = self.vertex_arrays.get(vao)
            .ok_or_else(|| GraphicsError::InvalidHandle("VAO not found".into()))?;

        self.gl.bind_vertex_array(Some(&vao_data.vao));
        self.gl.draw_arrays(GL::LINE_STRIP, vertex_offset as i32, vertex_count as i32);

        Ok(())
    }

    // ==================== 查询 | Queries ====================

    fn max_texture_size(&self) -> u32 {
        self.gl.get_parameter(GL::MAX_TEXTURE_SIZE)
            .ok()
            .and_then(|v| v.as_f64())
            .map(|v| v as u32)
            .unwrap_or(4096)
    }

    fn supports_feature(&self, feature: GraphicsFeature) -> bool {
        match feature {
            GraphicsFeature::AnisotropicFiltering => {
                self.gl.get_extension("EXT_texture_filter_anisotropic").is_ok()
            }
            GraphicsFeature::Instancing => true, // WebGL2 支持
            GraphicsFeature::ComputeShaders => false, // WebGL2 不支持
            GraphicsFeature::MultipleRenderTargets => true, // WebGL2 支持
            GraphicsFeature::FloatTextures => {
                self.gl.get_extension("EXT_color_buffer_float").is_ok()
            }
            GraphicsFeature::WebGPU => false,
        }
    }

    fn max_texture_units(&self) -> u32 {
        self.gl.get_parameter(GL::MAX_TEXTURE_IMAGE_UNITS)
            .ok()
            .and_then(|v| v.as_f64())
            .map(|v| v as u32)
            .unwrap_or(16)
    }

    fn max_vertex_attributes(&self) -> u32 {
        self.gl.get_parameter(GL::MAX_VERTEX_ATTRIBS)
            .ok()
            .and_then(|v| v.as_f64())
            .map(|v| v as u32)
            .unwrap_or(16)
    }
}

// ==================== WebGL2-Specific Extensions ====================

impl WebGL2Backend {
    /// Bind a raw WebGlTexture to a texture unit (for TextureManager compatibility).
    pub fn bind_texture_raw(&self, texture: Option<&WebGlTexture>, unit: u32) {
        self.gl.active_texture(GL::TEXTURE0 + unit);
        self.gl.bind_texture(GL::TEXTURE_2D, texture);
    }

    /// Set depth test enabled state.
    /// 设置深度测试启用状态。
    pub fn set_depth_test(&mut self, enabled: bool) {
        if enabled {
            self.gl.enable(GL::DEPTH_TEST);
        } else {
            self.gl.disable(GL::DEPTH_TEST);
        }
        self.current_render_state.depth_test = enabled;
    }

    /// Set depth write enabled state.
    /// 设置深度写入启用状态。
    pub fn set_depth_write(&mut self, enabled: bool) {
        self.gl.depth_mask(enabled);
        self.current_render_state.depth_write = enabled;
    }

    /// Set depth comparison function.
    /// 设置深度比较函数。
    pub fn set_depth_func(&mut self, func: CompareFunc) {
        let gl_func = match func {
            CompareFunc::Never => GL::NEVER,
            CompareFunc::Less => GL::LESS,
            CompareFunc::Equal => GL::EQUAL,
            CompareFunc::LessEqual => GL::LEQUAL,
            CompareFunc::Greater => GL::GREATER,
            CompareFunc::NotEqual => GL::NOTEQUAL,
            CompareFunc::GreaterEqual => GL::GEQUAL,
            CompareFunc::Always => GL::ALWAYS,
        };
        self.gl.depth_func(gl_func);
        self.current_render_state.depth_func = func;
    }

    /// Set face culling mode.
    /// 设置面剔除模式。
    pub fn set_cull_mode(&mut self, mode: CullMode) {
        match mode {
            CullMode::None => {
                self.gl.disable(GL::CULL_FACE);
            }
            CullMode::Front => {
                self.gl.enable(GL::CULL_FACE);
                self.gl.cull_face(GL::FRONT);
            }
            CullMode::Back => {
                self.gl.enable(GL::CULL_FACE);
                self.gl.cull_face(GL::BACK);
            }
        }
        self.current_render_state.cull_mode = mode;
    }
}

// ==================== 辅助函数 | Helper Functions ====================

/// 纹理过滤转 GL 常量
///
/// Convert texture filter to GL constant.
fn texture_filter_to_gl(filter: TextureFilter) -> u32 {
    match filter {
        TextureFilter::Nearest => GL::NEAREST,
        TextureFilter::Linear => GL::LINEAR,
        TextureFilter::NearestMipmapNearest => GL::NEAREST_MIPMAP_NEAREST,
        TextureFilter::LinearMipmapNearest => GL::LINEAR_MIPMAP_NEAREST,
        TextureFilter::NearestMipmapLinear => GL::NEAREST_MIPMAP_LINEAR,
        TextureFilter::LinearMipmapLinear => GL::LINEAR_MIPMAP_LINEAR,
    }
}

/// 纹理环绕转 GL 常量
///
/// Convert texture wrap to GL constant.
fn texture_wrap_to_gl(wrap: TextureWrap) -> u32 {
    match wrap {
        TextureWrap::ClampToEdge => GL::CLAMP_TO_EDGE,
        TextureWrap::Repeat => GL::REPEAT,
        TextureWrap::MirroredRepeat => GL::MIRRORED_REPEAT,
    }
}
