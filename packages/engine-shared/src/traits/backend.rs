//! 图形后端主 trait
//!
//! Main graphics backend trait.

use crate::types::{
    handle::*,
    vertex::*,
    blend::*,
    texture::*,
    uniform::UniformValue,
};
use glam::{Vec2, Vec3, Vec4, Mat3, Mat4};
use thiserror::Error;

// ==================== 错误类型 | Error Types ====================

/// 图形后端错误
///
/// Graphics backend error.
#[derive(Debug, Error)]
pub enum GraphicsError {
    /// 着色器编译失败 | Shader compilation failed
    #[error("Shader compilation failed: {0}")]
    ShaderCompilation(String),

    /// 着色器链接失败 | Shader linking failed
    #[error("Shader linking failed: {0}")]
    ShaderLinking(String),

    /// 纹理创建失败 | Texture creation failed
    #[error("Texture creation failed: {0}")]
    TextureCreation(String),

    /// 缓冲区创建失败 | Buffer creation failed
    #[error("Buffer creation failed: {0}")]
    BufferCreation(String),

    /// 无效句柄 | Invalid handle
    #[error("Invalid handle: {0}")]
    InvalidHandle(String),

    /// 上下文丢失 | Context lost
    #[error("Context lost")]
    ContextLost,

    /// 不支持的操作 | Unsupported operation
    #[error("Unsupported operation: {0}")]
    Unsupported(String),

    /// 后端错误 | Backend error
    #[error("Backend error: {0}")]
    Backend(String),

    /// 资源不存在 | Resource not found
    #[error("Resource not found: {0}")]
    ResourceNotFound(String),

    /// 数据大小不匹配 | Data size mismatch
    #[error("Data size mismatch: expected {expected}, got {actual}")]
    DataSizeMismatch { expected: usize, actual: usize },
}

/// 图形操作结果
///
/// Graphics operation result.
pub type GraphicsResult<T> = Result<T, GraphicsError>;

// ==================== 缓冲区用途 | Buffer Usage ====================

/// 缓冲区用途
///
/// Buffer usage.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
pub enum BufferUsage {
    /// 静态数据（不常更新）| Static data (rarely updated)
    #[default]
    Static,
    /// 动态数据（经常更新）| Dynamic data (frequently updated)
    Dynamic,
    /// 流式数据（每帧更新）| Streaming data (updated every frame)
    Stream,
}

// ==================== 图形功能 | Graphics Features ====================

/// 图形功能
///
/// Graphics feature.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum GraphicsFeature {
    /// 各向异性过滤 | Anisotropic filtering
    AnisotropicFiltering,
    /// 实例化渲染 | Instanced rendering
    Instancing,
    /// 计算着色器 | Compute shaders
    ComputeShaders,
    /// 多渲染目标 | Multiple render targets
    MultipleRenderTargets,
    /// 浮点纹理 | Float textures
    FloatTextures,
    /// WebGPU | WebGPU support
    WebGPU,
}

// ==================== 图形后端 Trait | Graphics Backend Trait ====================

/// 图形后端主 trait
///
/// 定义所有图形操作的抽象接口，由具体后端（WebGL2、WGPU 等）实现。
///
/// Main graphics backend trait.
/// Defines abstract interface for all graphics operations,
/// implemented by concrete backends (WebGL2, WGPU, etc.).
pub trait GraphicsBackend: Sized {
    // ==================== 基本信息 | Basic Info ====================

    /// 后端名称
    ///
    /// Backend name.
    fn name(&self) -> &'static str;

    /// 后端版本
    ///
    /// Backend version.
    fn version(&self) -> &str;

    // ==================== 生命周期 | Lifecycle ====================

    /// 调整视口大小
    ///
    /// Resize viewport.
    fn resize(&mut self, width: u32, height: u32);

    /// 获取当前宽度
    ///
    /// Get current width.
    fn width(&self) -> u32;

    /// 获取当前高度
    ///
    /// Get current height.
    fn height(&self) -> u32;

    // ==================== 帧控制 | Frame Control ====================

    /// 开始新帧
    ///
    /// Begin new frame.
    fn begin_frame(&mut self);

    /// 结束当前帧
    ///
    /// End current frame.
    fn end_frame(&mut self);

    /// 清屏
    ///
    /// Clear screen.
    fn clear(&mut self, r: f32, g: f32, b: f32, a: f32);

    /// 设置视口
    ///
    /// Set viewport.
    fn set_viewport(&mut self, x: i32, y: i32, width: u32, height: u32);

    // ==================== 缓冲区操作 | Buffer Operations ====================

    /// 创建顶点缓冲区
    ///
    /// Create vertex buffer.
    fn create_vertex_buffer(
        &mut self,
        data: &[u8],
        usage: BufferUsage,
    ) -> GraphicsResult<BufferHandle>;

    /// 创建指定大小的顶点缓冲区（预分配）
    ///
    /// Create vertex buffer with specified size (pre-allocate).
    fn create_vertex_buffer_sized(
        &mut self,
        size: usize,
        usage: BufferUsage,
    ) -> GraphicsResult<BufferHandle>;

    /// 创建索引缓冲区
    ///
    /// Create index buffer.
    fn create_index_buffer(
        &mut self,
        data: &[u16],
        usage: BufferUsage,
    ) -> GraphicsResult<BufferHandle>;

    /// 创建索引缓冲区（u32）
    ///
    /// Create index buffer (u32).
    fn create_index_buffer_u32(
        &mut self,
        data: &[u32],
        usage: BufferUsage,
    ) -> GraphicsResult<BufferHandle>;

    /// 更新缓冲区数据
    ///
    /// Update buffer data.
    fn update_buffer(
        &mut self,
        handle: BufferHandle,
        offset: usize,
        data: &[u8],
    ) -> GraphicsResult<()>;

    /// 销毁缓冲区
    ///
    /// Destroy buffer.
    fn destroy_buffer(&mut self, handle: BufferHandle);

    /// 创建顶点数组对象
    ///
    /// Create vertex array object.
    fn create_vertex_array(
        &mut self,
        vertex_buffer: BufferHandle,
        index_buffer: Option<BufferHandle>,
        layout: &VertexLayout,
    ) -> GraphicsResult<VertexArrayHandle>;

    /// 销毁顶点数组对象
    ///
    /// Destroy vertex array object.
    fn destroy_vertex_array(&mut self, handle: VertexArrayHandle);

    // ==================== 着色器操作 | Shader Operations ====================

    /// 编译着色器程序
    ///
    /// Compile shader program.
    fn compile_shader(
        &mut self,
        vertex_src: &str,
        fragment_src: &str,
    ) -> GraphicsResult<ShaderHandle>;

    /// 销毁着色器
    ///
    /// Destroy shader.
    fn destroy_shader(&mut self, handle: ShaderHandle);

    /// 绑定着色器
    ///
    /// Bind shader.
    fn bind_shader(&mut self, handle: ShaderHandle) -> GraphicsResult<()>;

    /// 设置 Uniform（float）
    ///
    /// Set uniform (float).
    fn set_uniform_f32(&mut self, name: &str, value: f32) -> GraphicsResult<()>;

    /// 设置 Uniform（vec2）
    ///
    /// Set uniform (vec2).
    fn set_uniform_vec2(&mut self, name: &str, value: Vec2) -> GraphicsResult<()>;

    /// 设置 Uniform（vec3）
    ///
    /// Set uniform (vec3).
    fn set_uniform_vec3(&mut self, name: &str, value: Vec3) -> GraphicsResult<()>;

    /// 设置 Uniform（vec4）
    ///
    /// Set uniform (vec4).
    fn set_uniform_vec4(&mut self, name: &str, value: Vec4) -> GraphicsResult<()>;

    /// 设置 Uniform（mat3）
    ///
    /// Set uniform (mat3).
    fn set_uniform_mat3(&mut self, name: &str, value: &Mat3) -> GraphicsResult<()>;

    /// 设置 Uniform（mat4）
    ///
    /// Set uniform (mat4).
    fn set_uniform_mat4(&mut self, name: &str, value: &Mat4) -> GraphicsResult<()>;

    /// 设置 Uniform（int/sampler）
    ///
    /// Set uniform (int/sampler).
    fn set_uniform_i32(&mut self, name: &str, value: i32) -> GraphicsResult<()>;

    /// 设置 Uniform（通用）
    ///
    /// Set uniform (generic).
    fn set_uniform(&mut self, name: &str, value: &UniformValue) -> GraphicsResult<()> {
        match value {
            UniformValue::Float(v) => self.set_uniform_f32(name, *v),
            UniformValue::Float2(v) => self.set_uniform_vec2(name, *v),
            UniformValue::Float3(v) => self.set_uniform_vec3(name, *v),
            UniformValue::Float4(v) => self.set_uniform_vec4(name, *v),
            UniformValue::Int(v) => self.set_uniform_i32(name, *v),
            UniformValue::Mat3(v) => self.set_uniform_mat3(name, v),
            UniformValue::Mat4(v) => self.set_uniform_mat4(name, v),
            UniformValue::Texture(unit) => self.set_uniform_i32(name, *unit as i32),
            _ => Err(GraphicsError::Unsupported(format!(
                "Uniform type {} not supported",
                value.type_name()
            ))),
        }
    }

    // ==================== 纹理操作 | Texture Operations ====================

    /// 创建纹理
    ///
    /// Create texture.
    fn create_texture(&mut self, desc: &TextureDescriptor) -> GraphicsResult<TextureHandle>;

    /// 创建空白纹理（用于动态图集）
    ///
    /// Create blank texture (for dynamic atlas).
    fn create_blank_texture(&mut self, width: u32, height: u32) -> GraphicsResult<TextureHandle>;

    /// 上传纹理数据
    ///
    /// Upload texture data.
    fn upload_texture_data(
        &mut self,
        handle: TextureHandle,
        data: &[u8],
        width: u32,
        height: u32,
    ) -> GraphicsResult<()>;

    /// 更新纹理区域
    ///
    /// Update texture region.
    fn update_texture_region(
        &mut self,
        handle: TextureHandle,
        x: u32,
        y: u32,
        width: u32,
        height: u32,
        data: &[u8],
    ) -> GraphicsResult<()>;

    /// 销毁纹理
    ///
    /// Destroy texture.
    fn destroy_texture(&mut self, handle: TextureHandle);

    /// 绑定纹理到纹理单元
    ///
    /// Bind texture to texture unit.
    fn bind_texture(&mut self, handle: TextureHandle, unit: u32) -> GraphicsResult<()>;

    /// 获取纹理尺寸
    ///
    /// Get texture dimensions.
    fn get_texture_size(&self, handle: TextureHandle) -> Option<(u32, u32)>;

    // ==================== 渲染状态 | Render State ====================

    /// 应用渲染状态
    ///
    /// Apply render state.
    fn apply_render_state(&mut self, state: &RenderState);

    /// 设置混合模式
    ///
    /// Set blend mode.
    fn set_blend_mode(&mut self, mode: BlendMode);

    /// 设置裁剪矩形
    ///
    /// Set scissor rectangle.
    fn set_scissor(&mut self, rect: Option<ScissorRect>);

    // ==================== 绘制命令 | Draw Commands ====================

    /// 绘制（索引，u16）
    ///
    /// Draw indexed (u16).
    fn draw_indexed(
        &mut self,
        vao: VertexArrayHandle,
        index_count: u32,
        index_offset: u32,
    ) -> GraphicsResult<()>;

    /// 绘制（索引，u32）
    ///
    /// Draw indexed (u32).
    fn draw_indexed_u32(
        &mut self,
        vao: VertexArrayHandle,
        index_count: u32,
        index_offset: u32,
    ) -> GraphicsResult<()> {
        // 默认实现使用 u16 版本，后端可覆盖
        self.draw_indexed(vao, index_count, index_offset)
    }

    /// 绘制（非索引）
    ///
    /// Draw non-indexed.
    fn draw(
        &mut self,
        vao: VertexArrayHandle,
        vertex_count: u32,
        vertex_offset: u32,
    ) -> GraphicsResult<()>;

    /// 绘制线段
    ///
    /// Draw lines.
    fn draw_lines(
        &mut self,
        vao: VertexArrayHandle,
        vertex_count: u32,
        vertex_offset: u32,
    ) -> GraphicsResult<()>;

    /// 绘制闭合线条
    ///
    /// Draw line loop.
    fn draw_line_loop(
        &mut self,
        vao: VertexArrayHandle,
        vertex_count: u32,
        vertex_offset: u32,
    ) -> GraphicsResult<()>;

    /// 绘制连续线条
    ///
    /// Draw line strip.
    fn draw_line_strip(
        &mut self,
        vao: VertexArrayHandle,
        vertex_count: u32,
        vertex_offset: u32,
    ) -> GraphicsResult<()>;

    // ==================== 查询 | Queries ====================

    /// 获取最大纹理尺寸
    ///
    /// Get max texture size.
    fn max_texture_size(&self) -> u32;

    /// 是否支持某功能
    ///
    /// Check feature support.
    fn supports_feature(&self, feature: GraphicsFeature) -> bool;

    /// 获取最大纹理单元数
    ///
    /// Get max texture units.
    fn max_texture_units(&self) -> u32 {
        16 // 默认值，后端可覆盖
    }

    /// 获取最大顶点属性数
    ///
    /// Get max vertex attributes.
    fn max_vertex_attributes(&self) -> u32 {
        16 // 默认值，后端可覆盖
    }
}

// ==================== 扩展 Trait | Extension Traits ====================

/// 帧缓冲区操作扩展
///
/// Framebuffer operations extension.
pub trait FramebufferExt: GraphicsBackend {
    /// 创建帧缓冲区
    ///
    /// Create framebuffer.
    fn create_framebuffer(
        &mut self,
        color_attachment: TextureHandle,
        depth_attachment: Option<TextureHandle>,
    ) -> GraphicsResult<FramebufferHandle>;

    /// 销毁帧缓冲区
    ///
    /// Destroy framebuffer.
    fn destroy_framebuffer(&mut self, handle: FramebufferHandle);

    /// 绑定帧缓冲区
    ///
    /// Bind framebuffer.
    fn bind_framebuffer(&mut self, handle: Option<FramebufferHandle>) -> GraphicsResult<()>;
}

/// 实例化渲染扩展
///
/// Instanced rendering extension.
pub trait InstancingExt: GraphicsBackend {
    /// 绘制实例化（索引）
    ///
    /// Draw instanced (indexed).
    fn draw_indexed_instanced(
        &mut self,
        vao: VertexArrayHandle,
        index_count: u32,
        instance_count: u32,
    ) -> GraphicsResult<()>;

    /// 绘制实例化（非索引）
    ///
    /// Draw instanced (non-indexed).
    fn draw_instanced(
        &mut self,
        vao: VertexArrayHandle,
        vertex_count: u32,
        instance_count: u32,
    ) -> GraphicsResult<()>;
}
