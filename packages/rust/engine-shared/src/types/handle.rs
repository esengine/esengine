//! 类型安全的资源句柄
//!
//! Type-safe resource handles.

use std::marker::PhantomData;
use std::fmt;
use std::hash::{Hash, Hasher};

/// 类型安全的资源句柄
///
/// 使用 PhantomData 区分不同资源类型，防止句柄混用。
/// 包含代数（generation）用于检测过期句柄。
///
/// Type-safe resource handle using PhantomData to distinguish resource types.
/// Includes generation for stale handle detection.
///
/// # Example
///
/// ```
/// use es_engine_shared::types::handle::*;
///
/// let texture: TextureHandle = TextureHandle::new(1, 1);
/// let buffer: BufferHandle = BufferHandle::new(1, 1);
///
/// // 编译错误：类型不匹配
/// // Compile error: type mismatch
/// // let _: TextureHandle = buffer;
/// ```
#[repr(C)]
pub struct Handle<T> {
    /// 内部 ID | Internal ID
    id: u32,
    /// 代数（用于检测过期句柄） | Generation for stale handle detection
    generation: u32,
    /// 类型标记 | Type marker
    _marker: PhantomData<T>,
}

// 手动实现 trait，因为 PhantomData 的存在
impl<T> Clone for Handle<T> {
    fn clone(&self) -> Self {
        *self
    }
}

impl<T> Copy for Handle<T> {}

impl<T> PartialEq for Handle<T> {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id && self.generation == other.generation
    }
}

impl<T> Eq for Handle<T> {}

impl<T> Hash for Handle<T> {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.id.hash(state);
        self.generation.hash(state);
    }
}

impl<T> fmt::Debug for Handle<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Handle")
            .field("id", &self.id)
            .field("generation", &self.generation)
            .finish()
    }
}

impl<T> Default for Handle<T> {
    fn default() -> Self {
        Self::null()
    }
}

impl<T> Handle<T> {
    /// 创建新句柄
    ///
    /// Create new handle.
    #[inline]
    pub const fn new(id: u32, generation: u32) -> Self {
        Self {
            id,
            generation,
            _marker: PhantomData,
        }
    }

    /// 获取原始 ID
    ///
    /// Get raw ID.
    #[inline]
    pub const fn id(&self) -> u32 {
        self.id
    }

    /// 获取代数
    ///
    /// Get generation.
    #[inline]
    pub const fn generation(&self) -> u32 {
        self.generation
    }

    /// 创建空句柄
    ///
    /// Create null handle.
    #[inline]
    pub const fn null() -> Self {
        Self::new(u32::MAX, 0)
    }

    /// 是否为空句柄
    ///
    /// Check if null handle.
    #[inline]
    pub const fn is_null(&self) -> bool {
        self.id == u32::MAX
    }

    /// 是否为有效句柄（非空）
    ///
    /// Check if valid handle (not null).
    #[inline]
    pub const fn is_valid(&self) -> bool {
        self.id != u32::MAX
    }

    /// 转换为原始值（用于序列化等）
    ///
    /// Convert to raw value (for serialization, etc.).
    #[inline]
    pub const fn to_raw(&self) -> (u32, u32) {
        (self.id, self.generation)
    }

    /// 从原始值创建（用于反序列化等）
    ///
    /// Create from raw value (for deserialization, etc.).
    #[inline]
    pub const fn from_raw(id: u32, generation: u32) -> Self {
        Self::new(id, generation)
    }
}

// ==================== 资源类型标记 | Resource Type Markers ====================

/// 缓冲区类型标记 | Buffer type marker
#[derive(Debug, Clone, Copy)]
pub struct BufferMarker;

/// 顶点数组对象类型标记 | Vertex array object type marker
#[derive(Debug, Clone, Copy)]
pub struct VertexArrayMarker;

/// 着色器程序类型标记 | Shader program type marker
#[derive(Debug, Clone, Copy)]
pub struct ShaderMarker;

/// 纹理类型标记 | Texture type marker
#[derive(Debug, Clone, Copy)]
pub struct TextureMarker;

/// 材质类型标记 | Material type marker
#[derive(Debug, Clone, Copy)]
pub struct MaterialMarker;

/// 帧缓冲区类型标记 | Framebuffer type marker
#[derive(Debug, Clone, Copy)]
pub struct FramebufferMarker;

/// 渲染缓冲区类型标记 | Renderbuffer type marker
#[derive(Debug, Clone, Copy)]
pub struct RenderbufferMarker;

/// 采样器类型标记 | Sampler type marker
#[derive(Debug, Clone, Copy)]
pub struct SamplerMarker;

// ==================== 类型别名 | Type Aliases ====================

/// 缓冲区句柄 | Buffer handle
pub type BufferHandle = Handle<BufferMarker>;

/// 顶点数组对象句柄 | Vertex array object handle
pub type VertexArrayHandle = Handle<VertexArrayMarker>;

/// 着色器程序句柄 | Shader program handle
pub type ShaderHandle = Handle<ShaderMarker>;

/// 纹理句柄 | Texture handle
pub type TextureHandle = Handle<TextureMarker>;

/// 材质句柄 | Material handle
pub type MaterialHandle = Handle<MaterialMarker>;

/// 帧缓冲区句柄 | Framebuffer handle
pub type FramebufferHandle = Handle<FramebufferMarker>;

/// 渲染缓冲区句柄 | Renderbuffer handle
pub type RenderbufferHandle = Handle<RenderbufferMarker>;

/// 采样器句柄 | Sampler handle
pub type SamplerHandle = Handle<SamplerMarker>;

// ==================== 句柄映射 | Handle Map ====================

/// 带代数的句柄映射
///
/// 用于管理资源的分配和释放，支持句柄重用和过期检测。
///
/// Handle map with generation tracking.
/// Used for managing resource allocation and deallocation,
/// supports handle reuse and stale detection.
pub struct HandleMap<T> {
    /// 存储项：(资源, 代数) | Items: (resource, generation)
    items: Vec<Option<(T, u32)>>,
    /// 空闲列表 | Free list
    free_list: Vec<u32>,
    /// 下一个代数 | Next generation
    next_generation: u32,
}

impl<T> Default for HandleMap<T> {
    fn default() -> Self {
        Self::new()
    }
}

impl<T> HandleMap<T> {
    /// 创建新的句柄映射
    ///
    /// Create new handle map.
    pub fn new() -> Self {
        Self {
            items: Vec::new(),
            free_list: Vec::new(),
            next_generation: 1,
        }
    }

    /// 创建带预分配容量的句柄映射
    ///
    /// Create handle map with pre-allocated capacity.
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            items: Vec::with_capacity(capacity),
            free_list: Vec::new(),
            next_generation: 1,
        }
    }

    /// 插入资源并返回句柄
    ///
    /// Insert resource and return handle.
    pub fn insert<M>(&mut self, item: T) -> Handle<M> {
        let generation = self.next_generation;
        self.next_generation = self.next_generation.wrapping_add(1);
        if self.next_generation == 0 {
            self.next_generation = 1; // 跳过 0，避免与空句柄混淆
        }

        let id = if let Some(id) = self.free_list.pop() {
            self.items[id as usize] = Some((item, generation));
            id
        } else {
            let id = self.items.len() as u32;
            self.items.push(Some((item, generation)));
            id
        };

        Handle::new(id, generation)
    }

    /// 获取资源引用
    ///
    /// Get resource reference.
    pub fn get<M>(&self, handle: Handle<M>) -> Option<&T> {
        self.items
            .get(handle.id() as usize)?
            .as_ref()
            .filter(|(_, gen)| *gen == handle.generation())
            .map(|(item, _)| item)
    }

    /// 获取资源可变引用
    ///
    /// Get mutable resource reference.
    pub fn get_mut<M>(&mut self, handle: Handle<M>) -> Option<&mut T> {
        self.items
            .get_mut(handle.id() as usize)?
            .as_mut()
            .filter(|(_, gen)| *gen == handle.generation())
            .map(|(item, _)| item)
    }

    /// 移除资源
    ///
    /// Remove resource.
    pub fn remove<M>(&mut self, handle: Handle<M>) -> Option<T> {
        let slot = self.items.get_mut(handle.id() as usize)?;
        if let Some((_, gen)) = slot {
            if *gen == handle.generation() {
                let item = slot.take().map(|(item, _)| item);
                self.free_list.push(handle.id());
                return item;
            }
        }
        None
    }

    /// 检查句柄是否有效
    ///
    /// Check if handle is valid.
    pub fn contains<M>(&self, handle: Handle<M>) -> bool {
        self.get(handle).is_some()
    }

    /// 获取当前资源数量
    ///
    /// Get current resource count.
    pub fn len(&self) -> usize {
        self.items.len() - self.free_list.len()
    }

    /// 是否为空
    ///
    /// Check if empty.
    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    /// 清空所有资源
    ///
    /// Clear all resources.
    pub fn clear(&mut self) {
        self.items.clear();
        self.free_list.clear();
    }

    /// 迭代所有有效资源
    ///
    /// Iterate over all valid resources.
    pub fn iter(&self) -> impl Iterator<Item = &T> {
        self.items.iter().filter_map(|opt| opt.as_ref().map(|(item, _)| item))
    }

    /// 迭代所有有效资源（可变）
    ///
    /// Iterate over all valid resources (mutable).
    pub fn iter_mut(&mut self) -> impl Iterator<Item = &mut T> {
        self.items.iter_mut().filter_map(|opt| opt.as_mut().map(|(item, _)| item))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_handle_creation() {
        let handle: TextureHandle = TextureHandle::new(1, 1);
        assert_eq!(handle.id(), 1);
        assert_eq!(handle.generation(), 1);
        assert!(handle.is_valid());
        assert!(!handle.is_null());
    }

    #[test]
    fn test_null_handle() {
        let handle: BufferHandle = BufferHandle::null();
        assert!(handle.is_null());
        assert!(!handle.is_valid());
    }

    #[test]
    fn test_handle_map() {
        let mut map: HandleMap<String> = HandleMap::new();

        let h1: TextureHandle = map.insert("texture1".to_string());
        let h2: TextureHandle = map.insert("texture2".to_string());

        assert_eq!(map.get(h1), Some(&"texture1".to_string()));
        assert_eq!(map.get(h2), Some(&"texture2".to_string()));
        assert_eq!(map.len(), 2);

        // 移除后句柄失效
        let removed = map.remove(h1);
        assert_eq!(removed, Some("texture1".to_string()));
        assert_eq!(map.get(h1), None);
        assert_eq!(map.len(), 1);

        // 重用空闲槽位
        let h3: TextureHandle = map.insert("texture3".to_string());
        assert_eq!(h3.id(), h1.id()); // 重用了 h1 的 ID
        assert_ne!(h3.generation(), h1.generation()); // 但代数不同
    }
}
