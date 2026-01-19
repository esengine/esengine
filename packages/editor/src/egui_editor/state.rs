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

/// @zh 视口模式（2D/3D）
/// @en Viewport mode (2D/3D)
#[derive(Clone, Copy, PartialEq, Default, Debug)]
pub enum ViewportMode {
    /// @zh 2D 视图（正交相机，XY 平面网格）
    /// @en 2D view (orthographic camera, XY plane grid)
    Mode2D,
    /// @zh 3D 视图（透视相机，XZ 平面网格）
    /// @en 3D view (perspective camera, XZ plane grid)
    #[default]
    Mode3D,
}

/// @zh 播放状态
/// @en Play state
#[derive(Clone, Copy, PartialEq, Default)]
pub enum PlayState {
    /// @zh 停止（编辑模式）
    /// @en Stopped (edit mode)
    #[default]
    Stopped,
    /// @zh 播放中
    /// @en Playing
    Playing,
    /// @zh 暂停
    /// @en Paused
    Paused,
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
    /// @zh 通用节点
    /// @en Generic node
    Node,
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
    pub uuid: String,
    /// @zh 节点路径（如 "Canvas/Node1"）
    /// @en Node path (e.g., "Canvas/Node1")
    pub path: String,
    pub node_type: NodeType,
    pub visible: bool,
    pub expanded: bool,
    pub children: Vec<HierarchyItem>,
    /// @zh 组件列表（用于图标显示）
    /// @en Component list (for icon display)
    pub components: Vec<String>,
}

impl HierarchyItem {
    pub fn new(name: impl Into<String>, node_type: NodeType) -> Self {
        Self {
            name: name.into(),
            uuid: String::new(),
            path: String::new(),
            node_type,
            visible: true,
            expanded: false,
            children: Vec::new(),
            components: Vec::new(),
        }
    }

    pub fn with_uuid(mut self, uuid: impl Into<String>) -> Self {
        self.uuid = uuid.into();
        self
    }

    pub fn with_path(mut self, path: impl Into<String>) -> Self {
        self.path = path.into();
        self
    }

    pub fn with_components(mut self, components: Vec<String>) -> Self {
        self.components = components;
        self
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
    /// @zh 资源的完整路径
    /// @en Full path to the asset
    pub path: PathBuf,
}

impl AssetItem {
    pub fn new(name: impl Into<String>, asset_type: AssetType, path: PathBuf) -> Self {
        Self {
            name: name.into(),
            asset_type,
            path,
        }
    }

    /// @zh 获取资源的 db:// URL（相对于 assets 目录）
    /// @en Get db:// URL for the asset (relative to assets directory)
    pub fn get_db_url(&self, root_path: &PathBuf) -> Option<String> {
        self.path.strip_prefix(root_path)
            .ok()
            .map(|rel| format!("db://assets/{}", rel.display().to_string().replace('\\', "/")))
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
pub struct ContentBrowserState {
    pub view_mode: ViewMode,
    pub selected_folder: Option<usize>,
    pub selected_asset: Option<usize>,
    pub folders: Vec<FolderItem>,
    pub assets: Vec<AssetItem>,
    pub search: String,
    /// @zh 项目根目录
    /// @en Project root path
    pub root_path: Option<PathBuf>,
    /// @zh 当前浏览的路径
    /// @en Current browsing path
    pub current_path: Option<PathBuf>,
}

impl Default for ContentBrowserState {
    fn default() -> Self {
        Self {
            view_mode: ViewMode::default(),
            selected_folder: None,
            selected_asset: None,
            folders: Vec::new(),
            assets: Vec::new(),
            search: String::new(),
            root_path: None,
            current_path: None,
        }
    }
}

impl ContentBrowserState {
    /// @zh 设置项目根目录并扫描内容
    /// @en Set project root and scan content
    pub fn set_root(&mut self, path: PathBuf) {
        self.root_path = Some(path.clone());
        self.current_path = Some(path.clone());
        self.scan_directory(&path);
    }

    /// @zh 扫描目录
    /// @en Scan directory
    pub fn scan_directory(&mut self, path: &PathBuf) {
        self.folders.clear();
        self.assets.clear();
        self.selected_folder = None;
        self.selected_asset = None;

        if let Ok(entries) = std::fs::read_dir(path) {
            let mut folders = Vec::new();
            let mut assets = Vec::new();

            for entry in entries.filter_map(|e| e.ok()) {
                let file_name = entry.file_name().to_string_lossy().to_string();

                // Skip hidden files and common non-asset directories
                if file_name.starts_with('.') || file_name == "node_modules" || file_name == "target" {
                    continue;
                }

                if entry.path().is_dir() {
                    folders.push(FolderItem::new(&file_name));
                } else {
                    // Determine asset type from extension
                    let ext = entry.path().extension()
                        .map(|e| e.to_string_lossy().to_lowercase())
                        .unwrap_or_default();

                    let asset_type = match ext.as_str() {
                        "scene" => AssetType::Scene,
                        "ts" | "js" => AssetType::Script,
                        "png" | "jpg" | "jpeg" | "webp" | "gif" => AssetType::Image,
                        "json" => AssetType::Json,
                        _ => AssetType::Other,
                    };

                    assets.push(AssetItem::new(&file_name, asset_type, entry.path()));
                }
            }

            // Sort: folders first (alphabetically), then assets (alphabetically)
            folders.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
            assets.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

            self.folders = folders;
            self.assets = assets;
        }
    }

    /// @zh 进入子目录
    /// @en Enter subdirectory
    pub fn enter_folder(&mut self, index: usize) {
        if let (Some(current), Some(folder)) = (self.current_path.clone(), self.folders.get(index)) {
            let new_path = current.join(&folder.name);
            if new_path.is_dir() {
                self.current_path = Some(new_path.clone());
                self.scan_directory(&new_path);
            }
        }
    }

    /// @zh 返回上级目录
    /// @en Go to parent directory
    pub fn go_up(&mut self) {
        if let Some(current) = self.current_path.clone() {
            if let Some(root) = &self.root_path {
                // Don't go above root
                if current != *root {
                    if let Some(parent) = current.parent() {
                        self.current_path = Some(parent.to_path_buf());
                        self.scan_directory(&parent.to_path_buf());
                    }
                }
            }
        }
    }

    /// @zh 获取当前路径的显示名称
    /// @en Get display name for current path
    pub fn current_path_display(&self) -> String {
        if let (Some(current), Some(root)) = (&self.current_path, &self.root_path) {
            if current == root {
                "assets".to_string()
            } else {
                current.strip_prefix(root)
                    .map(|p| format!("assets/{}", p.display()))
                    .unwrap_or_else(|_| current.display().to_string())
            }
        } else {
            "No project".to_string()
        }
    }

    /// @zh 获取面包屑导航路径段
    /// @en Get breadcrumb navigation path segments
    pub fn get_breadcrumb_segments(&self) -> Vec<String> {
        let mut segments = vec!["Assets".to_string()];

        if let (Some(current), Some(root)) = (&self.current_path, &self.root_path) {
            if current != root {
                if let Ok(rel_path) = current.strip_prefix(root) {
                    for component in rel_path.components() {
                        if let std::path::Component::Normal(name) = component {
                            segments.push(name.to_string_lossy().to_string());
                        }
                    }
                }
            }
        }

        segments
    }

    /// @zh 导航到指定的路径段
    /// @en Navigate to specified path segment
    pub fn navigate_to_segment(&mut self, segment_index: usize) {
        if let Some(root) = &self.root_path.clone() {
            if segment_index == 0 {
                // Navigate to root
                self.current_path = Some(root.clone());
                self.scan_directory(root);
            } else if let Some(current) = &self.current_path.clone() {
                if let Ok(rel_path) = current.strip_prefix(root) {
                    // Build path up to segment_index
                    let mut new_path = root.clone();
                    for (idx, component) in rel_path.components().enumerate() {
                        if idx >= segment_index {
                            break;
                        }
                        if let std::path::Component::Normal(name) = component {
                            new_path = new_path.join(name);
                        }
                    }
                    if new_path.is_dir() {
                        self.current_path = Some(new_path.clone());
                        self.scan_directory(&new_path);
                    }
                }
            }
        }
    }
}

// ============================================================================
// Drawer State
// ============================================================================

/// @zh 日志级别
/// @en Log level
#[derive(Clone, Copy, PartialEq)]
pub enum LogLevel {
    Info,
    Warn,
    Error,
}

/// @zh 日志条目
/// @en Log entry
#[derive(Clone)]
pub struct LogEntry {
    pub level: LogLevel,
    pub time: String,
    pub message: String,
    pub count: usize,
}

impl LogEntry {
    pub fn info(message: impl Into<String>) -> Self {
        Self {
            level: LogLevel::Info,
            time: chrono::Local::now().format("%H:%M:%S").to_string(),
            message: message.into(),
            count: 1,
        }
    }

    pub fn warn(message: impl Into<String>) -> Self {
        Self {
            level: LogLevel::Warn,
            time: chrono::Local::now().format("%H:%M:%S").to_string(),
            message: message.into(),
            count: 1,
        }
    }

    pub fn error(message: impl Into<String>) -> Self {
        Self {
            level: LogLevel::Error,
            time: chrono::Local::now().format("%H:%M:%S").to_string(),
            message: message.into(),
            count: 1,
        }
    }
}

/// @zh 抽屉状态
/// @en Drawer state
pub struct DrawerState {
    pub content_open: bool,
    pub output_open: bool,
    pub height: f32,
    pub output_filter: usize,
    pub logs: Vec<LogEntry>,
    pub max_logs: usize,
}

impl Default for DrawerState {
    fn default() -> Self {
        Self {
            content_open: false,
            output_open: false,
            height: 300.0,
            output_filter: 0,
            logs: Vec::new(),
            max_logs: 1000,
        }
    }
}

impl DrawerState {
    pub fn add_log(&mut self, entry: LogEntry) {
        // 检查是否与最后一条日志相同（相同级别和消息）
        if let Some(last) = self.logs.last_mut() {
            if last.level == entry.level && last.message == entry.message {
                last.count += 1;
                last.time = entry.time; // 更新时间为最新
                return;
            }
        }

        self.logs.push(entry);
        if self.logs.len() > self.max_logs {
            self.logs.remove(0);
        }
    }

    pub fn clear_logs(&mut self) {
        self.logs.clear();
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
    pub play_state: PlayState,

    // Viewport state
    pub viewport_mode: ViewportMode,
    pub show_grid: bool,
    pub snap_enabled: bool,
    pub snap_size: f32,

    // Camera settings
    /// @zh 相机近裁剪面距离
    /// @en Camera near clipping plane distance
    pub camera_near_plane: f32,
    /// @zh 相机远裁剪面距离
    /// @en Camera far clipping plane distance
    pub camera_far_plane: f32,
    /// @zh 相机视野角度
    /// @en Camera field of view
    pub camera_fov: f32,
    /// @zh 相机设置面板是否打开
    /// @en Whether camera settings panel is open
    pub camera_settings_open: bool,

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
            play_state: PlayState::Stopped,
            viewport_mode: ViewportMode::Mode3D,
            show_grid: true,
            snap_enabled: false,
            snap_size: 1.0,
            camera_near_plane: 0.1,
            camera_far_plane: 100000.0,
            camera_fov: 60.0,
            camera_settings_open: false,
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
            play_state: PlayState::Stopped,
            viewport_mode: ViewportMode::Mode3D,
            show_grid: true,
            snap_enabled: false,
            snap_size: 1.0,
            camera_near_plane: 0.1,
            camera_far_plane: 100000.0,
            camera_fov: 60.0,
            camera_settings_open: false,
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
        self.project_path = Some(project_path.clone());

        // Initialize Content Browser with project assets folder
        let assets_path = project_path.join("assets");
        if assets_path.exists() {
            self.content_browser.set_root(assets_path);
        } else {
            // Fallback to project root if no assets folder
            self.content_browser.set_root(project_path);
        }

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

    /// @zh 从场景状态同步层级数据
    /// @en Sync hierarchy data from scene state
    pub fn sync_hierarchy_from_scene(&mut self) {
        use super::scene_data::NodeData;

        fn convert_node(node: &NodeData, parent_path: &str) -> HierarchyItem {
            // Build the path for this node
            let node_path = if parent_path.is_empty() {
                node.name.clone()
            } else {
                format!("{}/{}", parent_path, node.name)
            };

            let children: Vec<HierarchyItem> = node.children.iter()
                .map(|child| convert_node(child, &node_path))
                .collect();

            HierarchyItem::new(&node.name, NodeType::Node)
                .with_uuid(&node.uuid)
                .with_path(&node_path)
                .with_components(node.components.clone())
                .with_children(children)
                .expanded(true)
        }

        if let Some(ref tree) = self.scene_state.tree {
            // Convert the tree to hierarchy items
            // The root node's children are the top-level items (use empty parent path)
            self.hierarchy_items = tree.children.iter()
                .map(|child| convert_node(child, ""))
                .collect();
        } else {
            self.hierarchy_items.clear();
        }
    }

    /// @zh 根据 UUID 查找并选中节点
    /// @en Find and select node by UUID
    pub fn select_node_by_uuid(&mut self, uuid: Option<String>) {
        self.scene_state.select_node(uuid.clone());

        // Also find and set selected_entity index for the hierarchy panel
        if let Some(ref uuid) = uuid {
            fn find_index(items: &[HierarchyItem], uuid: &str, start_idx: &mut usize) -> Option<usize> {
                for item in items {
                    if item.uuid == uuid {
                        return Some(*start_idx);
                    }
                    *start_idx += 1;
                    if let Some(found) = find_index(&item.children, uuid, start_idx) {
                        return Some(found);
                    }
                }
                None
            }
            let mut idx = 0;
            self.selected_entity = find_index(&self.hierarchy_items, uuid, &mut idx);
        } else {
            self.selected_entity = None;
        }
    }
}
