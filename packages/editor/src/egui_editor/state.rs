//! @zh 编辑器状态定义
//! @en Editor state definitions
//!
//! 包含编辑器的所有状态类型和数据结构。
//! Contains all state types and data structures for the editor.

use eframe::egui;
use std::path::PathBuf;

use crate::theme_tokens::ThemeTokens;
use super::animation::AnimationState;
use super::scene_bridge::{BridgeMode, SceneBridge};
use super::scene_data::SceneState;

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

/// @zh 编辑器启动阶段
/// @en Editor startup phase
#[derive(Clone, Copy, PartialEq, Default, Debug)]
pub enum EditorPhase {
    /// @zh 启动界面 - 选择项目
    /// @en Startup screen - select project
    #[default]
    Startup,
    /// @zh 加载中 - 启动 MCP，获取 effects
    /// @en Loading - starting MCP, fetching effects
    Loading,
    /// @zh 就绪 - 主编辑器界面
    /// @en Ready - main editor interface
    Ready,
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

    // Startup phase
    /// @zh 当前编辑器阶段
    /// @en Current editor phase
    pub phase: EditorPhase,
    /// @zh 启动状态消息
    /// @en Startup status message
    pub startup_status: String,
    /// @zh 最近打开的项目列表
    /// @en Recently opened projects
    pub recent_projects: Vec<PathBuf>,
    /// @zh CLI 路径
    /// @en CLI path
    pub cli_path: Option<PathBuf>,

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

    // Scene state (real data from WebView)
    pub scene_state: SceneState,
    pub scene_bridge: SceneBridge,

    // Context menu
    pub context_menu_open: Option<ContextMenuType>,
    pub context_menu_pos: egui::Pos2,
    pub context_menu_target: Option<usize>,
}

impl EditorState {
    /// @zh 创建 WebView 模式的编辑器状态（启动界面模式）
    /// @en Create editor state in WebView mode (startup screen mode)
    pub fn new(tokens: ThemeTokens) -> Self {
        Self {
            tokens,
            animation: AnimationState::new(),
            // Startup phase
            phase: EditorPhase::Startup,
            startup_status: String::new(),
            recent_projects: Vec::new(),
            cli_path: None,
            // Tool state
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
            scene_state: SceneState::new(),
            scene_bridge: SceneBridge::new(),
            context_menu_open: None,
            context_menu_pos: egui::Pos2::ZERO,
            context_menu_target: None,
        }
    }

    /// @zh 创建 MCP 模式的编辑器状态（直接进入加载阶段）
    /// @en Create editor state in MCP mode (directly enter loading phase)
    pub fn new_mcp(tokens: ThemeTokens, project_path: PathBuf, cli_path: PathBuf) -> Self {
        Self {
            tokens,
            animation: AnimationState::new(),
            // Startup phase - skip to Loading since project is specified
            phase: EditorPhase::Loading,
            startup_status: "正在启动 MCP 服务器...".to_string(),
            recent_projects: Vec::new(),
            cli_path: Some(cli_path.clone()),
            // Tool state
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
            project_path: Some(project_path.clone()),
            inspector: InspectorState::new(),
            content_browser: ContentBrowserState::default(),
            drawer: DrawerState::default(),
            gizmo: GizmoDragState::default(),
            scene_state: SceneState::new(),
            scene_bridge: SceneBridge::new_mcp(project_path, cli_path),
            context_menu_open: None,
            context_menu_pos: egui::Pos2::ZERO,
            context_menu_target: None,
        }
    }

    /// @zh 获取桥接模式
    /// @en Get bridge mode
    pub fn bridge_mode(&self) -> BridgeMode {
        self.scene_bridge.mode()
    }

    /// @zh 检查是否为 MCP 模式
    /// @en Check if in MCP mode
    pub fn is_mcp_mode(&self) -> bool {
        self.scene_bridge.mode() == BridgeMode::Mcp
    }

    /// @zh 打开项目并切换到 MCP 模式
    /// @en Open project and switch to MCP mode
    pub fn open_project(&mut self, project_path: PathBuf, cli_path: PathBuf) {
        // Stop existing MCP server if running
        self.scene_bridge.stop_mcp();

        // Update phase to Loading
        self.phase = EditorPhase::Loading;
        self.startup_status = "正在启动 MCP 服务器...".to_string();
        self.cli_path = Some(cli_path.clone());

        // Create new MCP bridge
        self.scene_bridge = SceneBridge::new_mcp(project_path.clone(), cli_path);
        self.project_path = Some(project_path);

        // Reset scene state
        self.scene_state = SceneState::new();
        self.scene_state.mark_hierarchy_dirty();

        // Clear selection
        self.selected_entity = None;
        self.hierarchy_items.clear();
    }

    /// @zh 关闭项目
    /// @en Close project
    pub fn close_project(&mut self) {
        self.scene_bridge.stop_mcp();
        self.scene_bridge = SceneBridge::new();
        self.project_path = None;
        self.cli_path = None;
        self.scene_state = SceneState::new();
        self.selected_entity = None;
        self.hierarchy_items.clear();
        // Return to startup phase
        self.phase = EditorPhase::Startup;
        self.startup_status.clear();
    }

    /// @zh 设置加载状态
    /// @en Set loading status
    pub fn set_loading_status(&mut self, status: impl Into<String>) {
        self.startup_status = status.into();
    }

    /// @zh 完成加载，进入就绪阶段
    /// @en Finish loading, enter ready phase
    pub fn finish_loading(&mut self) {
        self.phase = EditorPhase::Ready;
        self.startup_status.clear();
    }

    /// @zh 检查是否在启动阶段
    /// @en Check if in startup phase
    pub fn is_startup(&self) -> bool {
        self.phase == EditorPhase::Startup
    }

    /// @zh 检查是否在加载阶段
    /// @en Check if in loading phase
    pub fn is_loading(&self) -> bool {
        self.phase == EditorPhase::Loading
    }

    /// @zh 检查是否就绪
    /// @en Check if ready
    pub fn is_ready(&self) -> bool {
        self.phase == EditorPhase::Ready
    }
}
