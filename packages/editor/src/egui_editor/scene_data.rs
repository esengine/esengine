//! @zh 场景数据结构
//! @en Scene data structures
//!
//! @zh 与 viewport RPC 类型匹配的 Rust 数据结构
//! @en Rust data structures matching viewport RPC types

use serde::{Deserialize, Serialize};

// ============================================================================
// Scene Tree Types
// ============================================================================

/// @zh 节点数据（层级树用）
/// @en Node data for hierarchy tree
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeData {
    pub uuid: String,
    pub name: String,
    pub active: bool,
    pub children: Vec<NodeData>,
    pub components: Vec<String>,
}

impl NodeData {
    /// @zh 创建空的根节点
    /// @en Create empty root node
    pub fn empty_scene() -> Self {
        Self {
            uuid: String::new(),
            name: "Scene".to_string(),
            active: true,
            children: Vec::new(),
            components: Vec::new(),
        }
    }

    /// @zh 递归计算节点数量
    /// @en Recursively count nodes
    pub fn count_nodes(&self) -> usize {
        1 + self.children.iter().map(|c| c.count_nodes()).sum::<usize>()
    }

    /// @zh 通过 UUID 查找节点
    /// @en Find node by UUID
    pub fn find_by_uuid(&self, uuid: &str) -> Option<&NodeData> {
        if self.uuid == uuid {
            return Some(self);
        }
        for child in &self.children {
            if let Some(found) = child.find_by_uuid(uuid) {
                return Some(found);
            }
        }
        None
    }
}

// ============================================================================
// Node Properties Types
// ============================================================================

/// @zh 节点属性
/// @en Node properties
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeProperties {
    pub uuid: String,
    pub name: String,
    pub active: bool,
    pub position: [f32; 3],
    pub rotation: [f32; 3],
    pub scale: [f32; 3],
    pub components: Vec<ComponentData>,
}

impl Default for NodeProperties {
    fn default() -> Self {
        Self {
            uuid: String::new(),
            name: String::new(),
            active: true,
            position: [0.0, 0.0, 0.0],
            rotation: [0.0, 0.0, 0.0],
            scale: [1.0, 1.0, 1.0],
            components: Vec::new(),
        }
    }
}

/// @zh 组件数据
/// @en Component data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentData {
    #[serde(rename = "type")]
    pub comp_type: String,
    pub uuid: String,
    pub enabled: bool,
    pub properties: std::collections::HashMap<String, PropertyValue>,
}

/// @zh 属性值
/// @en Property value
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
pub enum PropertyValue {
    #[serde(rename = "number")]
    Number {
        value: f64,
        #[serde(skip_serializing_if = "Option::is_none")]
        min: Option<f64>,
        #[serde(skip_serializing_if = "Option::is_none")]
        max: Option<f64>,
    },
    #[serde(rename = "string")]
    String { value: String },
    #[serde(rename = "boolean")]
    Boolean { value: bool },
    #[serde(rename = "color")]
    Color { value: [f32; 4] },
    #[serde(rename = "vec2")]
    Vec2 { value: [f32; 2] },
    #[serde(rename = "vec3")]
    Vec3 { value: [f32; 3] },
    #[serde(rename = "asset")]
    Asset {
        value: Option<String>,
        #[serde(rename = "assetType")]
        asset_type: String,
    },
    #[serde(rename = "enum")]
    Enum { value: i32, options: Vec<String> },
}

// ============================================================================
// RPC Message Types
// ============================================================================

/// @zh RPC 请求
/// @en RPC Request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RpcRequest {
    pub id: u32,
    pub method: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<serde_json::Value>,
}

/// @zh RPC 响应
/// @en RPC Response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RpcResponse {
    pub id: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<RpcError>,
}

/// @zh RPC 错误
/// @en RPC Error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RpcError {
    pub code: i32,
    pub message: String,
}

/// @zh RPC 通知
/// @en RPC Notification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RpcNotification {
    pub method: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<serde_json::Value>,
}

// ============================================================================
// Scene State
// ============================================================================

/// @zh 场景状态（用于 EditorState）
/// @en Scene state (for EditorState)
#[derive(Debug, Default)]
pub struct SceneState {
    /// @zh 场景树数据
    /// @en Scene tree data
    pub tree: Option<NodeData>,

    /// @zh 选中的节点 UUID
    /// @en Selected node UUID
    pub selected_uuid: Option<String>,

    /// @zh 选中节点的属性
    /// @en Selected node properties
    pub selected_properties: Option<NodeProperties>,

    /// @zh 是否需要刷新层级
    /// @en Whether hierarchy needs refresh
    pub hierarchy_dirty: bool,

    /// @zh 是否需要刷新属性
    /// @en Whether properties need refresh
    pub properties_dirty: bool,

    /// @zh 场景是否已加载
    /// @en Whether scene is loaded
    pub scene_loaded: bool,
}

impl SceneState {
    pub fn new() -> Self {
        Self::default()
    }

    /// @zh 标记层级需要刷新
    /// @en Mark hierarchy as needing refresh
    pub fn mark_hierarchy_dirty(&mut self) {
        self.hierarchy_dirty = true;
    }

    /// @zh 标记属性需要刷新
    /// @en Mark properties as needing refresh
    pub fn mark_properties_dirty(&mut self) {
        self.properties_dirty = true;
    }

    /// @zh 设置选中的节点
    /// @en Set selected node
    pub fn select_node(&mut self, uuid: Option<String>) {
        if self.selected_uuid != uuid {
            self.selected_uuid = uuid;
            self.selected_properties = None;
            self.properties_dirty = true;
        }
    }

    /// @zh 更新场景树
    /// @en Update scene tree
    pub fn update_tree(&mut self, tree: NodeData) {
        self.tree = Some(tree);
        self.hierarchy_dirty = false;
        self.scene_loaded = true;
    }

    /// @zh 更新选中节点属性
    /// @en Update selected node properties
    pub fn update_properties(&mut self, props: NodeProperties) {
        self.selected_properties = Some(props);
        self.properties_dirty = false;
    }

    /// @zh 清空属性（选中改变时）
    /// @en Clear properties (when selection changes)
    pub fn clear_properties(&mut self) {
        self.selected_properties = None;
    }
}

// ============================================================================
// Component Type Helpers
// ============================================================================

/// @zh 获取组件图标名称
/// @en Get component icon name
pub fn get_component_icon(comp_type: &str) -> &'static str {
    match comp_type {
        "Transform" => "move",
        "Sprite" => "image",
        "Camera" => "camera",
        "Light" => "sun",
        "UITransform" => "layout-grid",
        "Label" => "type",
        "Button" => "mouse-pointer",
        "RigidBody2D" => "box",
        "Collider2D" | "BoxCollider2D" | "CircleCollider2D" => "square",
        "Animation" => "play",
        "AudioSource" => "volume-2",
        "ParticleSystem" | "ParticleSystem2D" => "sparkles",
        _ => "file-code", // Default for scripts/unknown
    }
}

/// @zh 获取节点类型图标
/// @en Get node type icon
pub fn get_node_icon(components: &[String]) -> (&'static str, [u8; 3]) {
    // Check for specific components
    if components.iter().any(|c| c == "Camera") {
        return ("camera", [0x4a, 0x9e, 0xff]);
    }
    if components.iter().any(|c| c == "Light" || c.contains("Light")) {
        return ("sun", [0xff, 0xd7, 0x00]);
    }
    if components.iter().any(|c| c == "Sprite") {
        return ("image", [0x4e, 0xc9, 0xb0]);
    }
    if components.iter().any(|c| c == "Label") {
        return ("type", [0xdc, 0xdc, 0xaa]);
    }
    if components.iter().any(|c| c == "UITransform") {
        return ("layout-grid", [0xdc, 0xdc, 0xaa]);
    }
    if components.iter().any(|c| c.contains("Collider") || c.contains("RigidBody")) {
        return ("box", [0x9c, 0xdc, 0xfe]);
    }
    if components.iter().any(|c| c == "ParticleSystem" || c == "ParticleSystem2D") {
        return ("sparkles", [0xff, 0x9e, 0x64]);
    }
    // Default node icon
    ("box", [0x88, 0x88, 0x88])
}
