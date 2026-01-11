//! @zh 编辑器状态定义
//! @en Editor state definitions
//!
//! 包含编辑器的所有状态类型和数据结构。
//! Contains all state types and data structures for the editor.

use eframe::egui;
use std::path::PathBuf;

use crate::theme_tokens::ThemeTokens;
use super::animation::AnimationState;

// ============================================================================
// Enums
// ============================================================================

/// @zh 变换工具类型
/// @en Transform tool type
#[derive(Clone, Copy, PartialEq, Default)]
pub enum Tool {
    #[default]
    Select,
    Move,
    Rotate,
    Scale,
}

/// @zh 变换空间
/// @en Transform space
#[derive(Clone, Copy, PartialEq, Default)]
pub enum TransformSpace {
    #[default]
    Local,
    World,
}

/// @zh 轴心模式
/// @en Pivot mode
#[derive(Clone, Copy, PartialEq, Default)]
pub enum PivotMode {
    #[default]
    Pivot,
    Center,
}

/// @zh 视图模式（网格/列表）
/// @en View mode (grid/list)
#[derive(Clone, Copy, PartialEq, Default)]
pub enum ViewMode {
    #[default]
    Grid,
    List,
}

/// @zh Gizmo 手柄类型
/// @en Gizmo handle type
#[derive(Clone, Copy, PartialEq, Default)]
pub enum GizmoHandle {
    #[default]
    None,
    X,
    Y,
    XY,
    Rotate,
    ScaleX,
    ScaleY,
    ScaleXY,
}

/// @zh 上下文菜单类型
/// @en Context menu type
#[derive(Clone, Copy, PartialEq)]
pub enum ContextMenuType {
    Hierarchy,
    ContentBrowser,
    Viewport,
}

/// @zh 节点类型
/// @en Node type
#[derive(Clone, Copy, PartialEq)]
pub enum NodeType {
    World,
    Folder,
    Camera,
    Light,
    Script,
    Sprite,
    UI,
}

/// @zh 资源类型
/// @en Asset type
#[derive(Clone, Copy, PartialEq)]
pub enum AssetType {
    Folder,
    Scene,
    Script,
    Image,
    Json,
    Other,
}

// ============================================================================
// Data Structures
// ============================================================================

/// @zh 层级项
/// @en Hierarchy item
#[derive(Clone)]
pub struct HierarchyItem {
    pub name: String,
    pub node_type: NodeType,
    pub visible: bool,
    pub expanded: bool,
    pub children: Vec<HierarchyItem>,
}

impl HierarchyItem {
    pub fn new(name: impl Into<String>, node_type: NodeType) -> Self {
        Self {
            name: name.into(),
            node_type,
            visible: true,
            expanded: false,
            children: Vec::new(),
        }
    }

    pub fn with_children(mut self, children: Vec<HierarchyItem>) -> Self {
        self.children = children;
        self
    }

    pub fn expanded(mut self, expanded: bool) -> Self {
        self.expanded = expanded;
        self
    }
}

/// @zh 文件夹项
/// @en Folder item
#[derive(Clone)]
pub struct FolderItem {
    pub name: String,
    pub expanded: bool,
    pub children: Vec<FolderItem>,
}

impl FolderItem {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            expanded: false,
            children: Vec::new(),
        }
    }

    pub fn with_children(mut self, children: Vec<FolderItem>) -> Self {
        self.children = children;
        self
    }
}

/// @zh 资源项
/// @en Asset item
#[derive(Clone)]
pub struct AssetItem {
    pub name: String,
    pub asset_type: AssetType,
}

impl AssetItem {
    pub fn new(name: impl Into<String>, asset_type: AssetType) -> Self {
        Self {
            name: name.into(),
            asset_type,
        }
    }
}

// ============================================================================
// Gizmo State
// ============================================================================

/// @zh Gizmo 拖拽状态
/// @en Gizmo drag state
#[derive(Default)]
pub struct GizmoDragState {
    pub active: bool,
    pub handle: GizmoHandle,
    pub start_mouse: egui::Pos2,
    pub start_pos: [f32; 2],
    pub start_rotation: f32,
    pub start_scale: [f32; 2],
}

impl GizmoDragState {
    pub fn reset(&mut self) {
        self.active = false;
        self.handle = GizmoHandle::None;
    }

    pub fn begin(&mut self, handle: GizmoHandle, mouse_pos: egui::Pos2, pos: [f32; 2], rotation: f32, scale: [f32; 2]) {
        self.active = true;
        self.handle = handle;
        self.start_mouse = mouse_pos;
        self.start_pos = pos;
        self.start_rotation = rotation;
        self.start_scale = scale;
    }
}

// ============================================================================
// Inspector State
// ============================================================================

/// @zh 检视器状态
/// @en Inspector state
#[derive(Default)]
pub struct InspectorState {
    pub position: [f32; 3],
    pub rotation: [f32; 3],
    pub scale: [f32; 3],
    pub visible: bool,
    pub transform_expanded: bool,
    pub sprite_expanded: bool,
    pub script_expanded: bool,
    pub sprite_color: [f32; 4],
    pub flip_x: bool,
    pub flip_y: bool,
    pub sprite_asset: String,
    pub script_speed: f32,
    pub script_jump_force: f32,
    pub script_grounded: bool,
    pub color_picker_open: Option<String>,
}

impl InspectorState {
    pub fn new() -> Self {
        Self {
            position: [0.0, 0.0, 0.0],
            rotation: [0.0, 0.0, 0.0],
            scale: [1.0, 1.0, 1.0],
            visible: true,
            transform_expanded: true,
            sprite_expanded: true,
            script_expanded: false,
            sprite_color: [1.0, 1.0, 1.0, 1.0],
            flip_x: false,
            flip_y: false,
            sprite_asset: String::new(),
            script_speed: 5.0,
            script_jump_force: 10.0,
            script_grounded: true,
            color_picker_open: None,
        }
    }
}

// ============================================================================
// Content Browser State
// ============================================================================

/// @zh 内容浏览器状态
/// @en Content browser state
#[derive(Default)]
pub struct ContentBrowserState {
    pub view_mode: ViewMode,
    pub selected_folder: Option<usize>,
    pub selected_asset: Option<usize>,
    pub folders: Vec<FolderItem>,
    pub assets: Vec<AssetItem>,
    pub search: String,
}

// ============================================================================
// Drawer State
// ============================================================================

/// @zh 抽屉状态
/// @en Drawer state
pub struct DrawerState {
    pub content_open: bool,
    pub output_open: bool,
    pub height: f32,
    pub output_filter: usize,
}

impl Default for DrawerState {
    fn default() -> Self {
        Self {
            content_open: false,
            output_open: false,
            height: 300.0,
            output_filter: 0,
        }
    }
}

// ============================================================================
// Main Editor State
// ============================================================================

/// @zh 编辑器应用状态
/// @en Editor application state
pub struct EditorState {
    pub tokens: ThemeTokens,
    pub animation: AnimationState,

    // Tool state
    pub active_tool: Tool,
    pub transform_space: TransformSpace,
    pub pivot_mode: PivotMode,

    // Playback state
    pub is_playing: bool,
    pub is_paused: bool,

    // Selection state
    pub selected_entity: Option<usize>,
    pub hierarchy_items: Vec<HierarchyItem>,

    // Search state
    pub hierarchy_search: String,
    pub inspector_search: String,

    // UI state
    pub active_menu: Option<&'static str>,
    pub viewport_tab: usize,
    pub command_input: String,

    // Project state
    pub project_path: Option<PathBuf>,

    // Grouped states
    pub inspector: InspectorState,
    pub content_browser: ContentBrowserState,
    pub drawer: DrawerState,
    pub gizmo: GizmoDragState,

    // Context menu
    pub context_menu_open: Option<ContextMenuType>,
    pub context_menu_pos: egui::Pos2,
    pub context_menu_target: Option<usize>,
}

impl EditorState {
    pub fn new(tokens: ThemeTokens) -> Self {
        Self {
            tokens,
            animation: AnimationState::new(),
            active_tool: Tool::Select,
            transform_space: TransformSpace::Local,
            pivot_mode: PivotMode::Pivot,
            is_playing: false,
            is_paused: false,
            selected_entity: None,
            hierarchy_items: Vec::new(),
            hierarchy_search: String::new(),
            inspector_search: String::new(),
            active_menu: None,
            viewport_tab: 0,
            command_input: String::new(),
            project_path: None,
            inspector: InspectorState::new(),
            content_browser: ContentBrowserState::default(),
            drawer: DrawerState::default(),
            gizmo: GizmoDragState::default(),
            context_menu_open: None,
            context_menu_pos: egui::Pos2::ZERO,
            context_menu_target: None,
        }
    }
}
