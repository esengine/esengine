//! @zh 场景桥接模块
//! @en Scene bridge module
//!
//! @zh 处理 egui 与场景之间的通信，支持 WebView 和 MCP 两种模式
//! @en Handles communication between egui and scene, supports WebView and MCP modes

use std::collections::VecDeque;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU32, Ordering};

use super::mcp_client::McpClient;
use super::scene_data::{NodeData, NodeProperties, RpcRequest, SceneState};
use super::WebViewViewport;

// ============================================================================
// Bridge Mode
// ============================================================================

/// @zh 桥接模式
/// @en Bridge mode
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BridgeMode {
    /// @zh WebView 模式：通过 JS RPC 与 viewport 通信
    /// @en WebView mode: communicate with viewport via JS RPC
    WebView,
    /// @zh MCP 模式：通过 HTTP 调用 cces-cli MCP 服务器
    /// @en MCP mode: call cces-cli MCP server via HTTP
    Mcp,
}

/// @zh 请求 ID 生成器
/// @en Request ID generator
static REQUEST_ID: AtomicU32 = AtomicU32::new(0);

fn next_request_id() -> u32 {
    REQUEST_ID.fetch_add(1, Ordering::SeqCst)
}

/// @zh 场景桥接器
/// @en Scene bridge
pub struct SceneBridge {
    /// @zh 桥接模式
    /// @en Bridge mode
    mode: BridgeMode,

    /// @zh MCP 客户端（MCP 模式时使用）
    /// @en MCP client (used in MCP mode)
    mcp_client: Option<McpClient>,

    /// @zh 待处理的消息队列（WebView 模式时使用）
    /// @en Pending message queue (used in WebView mode)
    pending_messages: VecDeque<String>,

    /// @zh 是否已请求层级数据
    /// @en Whether hierarchy data has been requested
    hierarchy_requested: bool,

    /// @zh 是否已请求属性数据
    /// @en Whether properties data has been requested
    properties_requested: bool,

    /// @zh 上次请求属性的节点 UUID
    /// @en Last node UUID for which properties were requested
    last_properties_uuid: Option<String>,
}

impl Default for SceneBridge {
    fn default() -> Self {
        Self::new()
    }
}

impl SceneBridge {
    /// @zh 创建 WebView 模式的桥接器
    /// @en Create bridge in WebView mode
    pub fn new() -> Self {
        Self {
            mode: BridgeMode::WebView,
            mcp_client: None,
            pending_messages: VecDeque::new(),
            hierarchy_requested: false,
            properties_requested: false,
            last_properties_uuid: None,
        }
    }

    /// @zh 创建 MCP 模式的桥接器
    /// @en Create bridge in MCP mode
    pub fn new_mcp(project_path: PathBuf, cli_path: PathBuf) -> Self {
        let mcp_client = McpClient::new(project_path, cli_path);
        Self {
            mode: BridgeMode::Mcp,
            mcp_client: Some(mcp_client),
            pending_messages: VecDeque::new(),
            hierarchy_requested: false,
            properties_requested: false,
            last_properties_uuid: None,
        }
    }

    /// @zh 获取当前模式
    /// @en Get current mode
    pub fn mode(&self) -> BridgeMode {
        self.mode
    }

    /// @zh 设置 MCP 服务器端口
    /// @en Set MCP server port
    pub fn set_mcp_port(&mut self, port: u16) {
        if let Some(client) = self.mcp_client.take() {
            self.mcp_client = Some(client.with_port(port));
        }
    }

    /// @zh 启动 MCP 服务器（仅 MCP 模式）
    /// @en Start MCP server (MCP mode only)
    pub fn start_mcp(&mut self) -> Result<(), String> {
        if self.mode != BridgeMode::Mcp {
            return Err("Not in MCP mode".to_string());
        }
        if let Some(ref mut client) = self.mcp_client {
            client.start()
        } else {
            Err("MCP client not initialized".to_string())
        }
    }

    /// @zh 停止 MCP 服务器（仅 MCP 模式）
    /// @en Stop MCP server (MCP mode only)
    pub fn stop_mcp(&mut self) {
        if let Some(ref mut client) = self.mcp_client {
            client.stop();
        }
    }

    /// @zh 检查 MCP 服务器进程是否已启动
    /// @en Check if MCP server process has started
    pub fn is_mcp_running(&self) -> bool {
        self.mcp_client.as_ref().map_or(false, |c| c.is_running())
    }

    /// @zh 轮询 MCP 服务器是否就绪（非阻塞）
    /// @en Poll if MCP server is ready (non-blocking)
    pub fn poll_mcp_ready(&mut self) -> bool {
        if self.mode != BridgeMode::Mcp {
            return false;
        }
        if let Some(ref mut client) = self.mcp_client {
            client.poll_ready()
        } else {
            false
        }
    }

    /// @zh 检查 MCP 是否就绪（服务器运行中且可接受请求）
    /// @en Check if MCP is ready (server running and accepting requests)
    pub fn is_mcp_ready(&self) -> bool {
        if self.mode != BridgeMode::Mcp {
            return false;
        }
        self.mcp_client.as_ref().map_or(false, |c| c.is_ready())
    }

    /// @zh 请求场景层级树（MCP 模式，直接返回结果）
    /// @en Request scene hierarchy tree (MCP mode, returns result directly)
    pub fn request_hierarchy_mcp(&mut self, scene_state: &mut SceneState) {
        if self.mode != BridgeMode::Mcp {
            return;
        }

        if let Some(ref client) = self.mcp_client {
            match client.query_current_scene() {
                Ok(mcp_node) => {
                    let node_data: NodeData = mcp_node.into();
                    println!("[SceneBridge/MCP] Received scene tree: {} nodes", node_data.count_nodes());
                    scene_state.update_tree(node_data);
                }
                Err(_e) => {
                    // Scene may not be open yet - silently ignore
                }
            }
        }
    }

    /// @zh 请求场景层级树（WebView 模式，异步）
    /// @en Request scene hierarchy tree (WebView mode, async)
    pub fn request_hierarchy(&mut self, viewport: &WebViewViewport) {
        if self.hierarchy_requested {
            return;
        }

        let request = RpcRequest {
            id: next_request_id(),
            method: "scene.getTree".to_string(),
            params: None,
        };

        if let Ok(json) = serde_json::to_string(&request) {
            let script = format!("window.__EGUI_BRIDGE__.receive({})", json);
            if viewport.eval_script(&script).is_ok() {
                self.hierarchy_requested = true;
            }
        }
    }

    /// @zh 请求节点属性（MCP 模式，直接返回结果）
    /// @en Request node properties (MCP mode, returns result directly)
    pub fn request_properties_mcp(&mut self, path: &str, scene_state: &mut SceneState) {
        use super::scene_data::ComponentData;

        if self.mode != BridgeMode::Mcp {
            return;
        }

        if let Some(ref client) = self.mcp_client {
            match client.query_node(path, false) {
                Ok(mcp_node) => {
                    // Get node properties
                    let props: NodeProperties = mcp_node.clone().into();
                    println!("[SceneBridge/MCP] Received node properties: {}", props.name);
                    scene_state.update_properties(props);

                    // Query each component's details
                    let mut components: Vec<ComponentData> = Vec::new();
                    for comp_ref in &mcp_node.components {
                        // Use the component path from the MCP response (format: "nodePath/ClassName_N")
                        // This is the correct path format for querying component details
                        if !comp_ref.path.is_empty() {
                            match client.query_component(&comp_ref.path) {
                                Ok(mcp_comp) => {
                                    println!(
                                        "[SceneBridge/MCP] Loaded component: {} ({} properties)",
                                        mcp_comp.name,
                                        mcp_comp.properties.len()
                                    );
                                    components.push(mcp_comp.into());
                                }
                                Err(e) => {
                                    // Only log errors that aren't "component not found" - those are expected
                                    // for some dynamically created nodes
                                    if !e.contains("not found") && !e.contains("not fount") && !e.contains("does not exist") {
                                        println!(
                                            "[SceneBridge/MCP] Failed to query component {}: {}",
                                            comp_ref.name, e
                                        );
                                    }
                                }
                            }
                        }
                    }
                    scene_state.update_components(components);
                }
                Err(e) => {
                    println!("[SceneBridge/MCP] Failed to query node properties: {}", e);
                }
            }
        }
    }

    /// @zh 请求节点属性（WebView 模式，异步）
    /// @en Request node properties (WebView mode, async)
    pub fn request_properties(&mut self, viewport: &WebViewViewport, uuid: &str) {
        // Avoid duplicate requests for the same node
        if self.properties_requested && self.last_properties_uuid.as_deref() == Some(uuid) {
            return;
        }

        let request = RpcRequest {
            id: next_request_id(),
            method: "scene.getNodeProperties".to_string(),
            params: Some(serde_json::json!({ "uuid": uuid })),
        };

        if let Ok(json) = serde_json::to_string(&request) {
            let script = format!("window.__EGUI_BRIDGE__.receive({})", json);
            if viewport.eval_script(&script).is_ok() {
                self.properties_requested = true;
                self.last_properties_uuid = Some(uuid.to_string());
            }
        }
    }

    /// @zh 选择节点
    /// @en Select node
    pub fn select_node(&self, viewport: &WebViewViewport, uuid: Option<&str>) {
        let request = RpcRequest {
            id: next_request_id(),
            method: "scene.selectNode".to_string(),
            params: Some(serde_json::json!({ "uuid": uuid })),
        };

        if let Ok(json) = serde_json::to_string(&request) {
            let script = format!("window.__EGUI_BRIDGE__.receive({})", json);
            let _ = viewport.eval_script(&script);
        }
    }

    /// @zh 设置节点属性
    /// @en Set node property
    pub fn set_property(&self, viewport: &WebViewViewport, uuid: &str, path: &str, value: serde_json::Value) {
        let request = RpcRequest {
            id: next_request_id(),
            method: "scene.setNodeProperty".to_string(),
            params: Some(serde_json::json!({
                "uuid": uuid,
                "path": path,
                "value": value
            })),
        };

        if let Ok(json) = serde_json::to_string(&request) {
            let script = format!("window.__EGUI_BRIDGE__.receive({})", json);
            let _ = viewport.eval_script(&script);
        }
    }

    /// @zh 创建节点
    /// @en Create node
    pub fn create_node(&self, viewport: &WebViewViewport, node_type: &str, parent_uuid: Option<&str>) {
        let mut params = serde_json::json!({ "type": node_type });
        if let Some(uuid) = parent_uuid {
            params["parentUuid"] = serde_json::Value::String(uuid.to_string());
        }

        let request = RpcRequest {
            id: next_request_id(),
            method: "scene.createNode".to_string(),
            params: Some(params),
        };

        if let Ok(json) = serde_json::to_string(&request) {
            let script = format!("window.__EGUI_BRIDGE__.receive({})", json);
            let _ = viewport.eval_script(&script);
        }
    }

    /// @zh 删除节点
    /// @en Delete node
    pub fn delete_node(&self, viewport: &WebViewViewport, uuid: &str) {
        let request = RpcRequest {
            id: next_request_id(),
            method: "scene.deleteNode".to_string(),
            params: Some(serde_json::json!({ "uuid": uuid })),
        };

        if let Ok(json) = serde_json::to_string(&request) {
            let script = format!("window.__EGUI_BRIDGE__.receive({})", json);
            let _ = viewport.eval_script(&script);
        }
    }

    /// @zh 复制节点
    /// @en Duplicate node
    pub fn duplicate_node(&self, viewport: &WebViewViewport, uuid: &str) {
        let request = RpcRequest {
            id: next_request_id(),
            method: "scene.duplicateNode".to_string(),
            params: Some(serde_json::json!({ "uuid": uuid })),
        };

        if let Ok(json) = serde_json::to_string(&request) {
            let script = format!("window.__EGUI_BRIDGE__.receive({})", json);
            let _ = viewport.eval_script(&script);
        }
    }

    // ========================================================================
    // MCP Mode Methods
    // ========================================================================

    /// @zh 更新节点属性（MCP 模式）
    /// @en Update node properties (MCP mode)
    pub fn update_node_mcp(&self, path: &str, properties: serde_json::Value) -> Result<(), String> {
        if self.mode != BridgeMode::Mcp {
            return Err("Not in MCP mode".to_string());
        }

        if let Some(ref client) = self.mcp_client {
            client.update_node(path, properties)?;
            println!("[SceneBridge/MCP] Updated node: {}", path);
            Ok(())
        } else {
            Err("MCP client not initialized".to_string())
        }
    }

    /// @zh 创建节点（MCP 模式）
    /// @en Create node (MCP mode)
    pub fn create_node_mcp(
        &self,
        parent_path: &str,
        name: &str,
        node_type: &str,
    ) -> Result<NodeData, String> {
        if self.mode != BridgeMode::Mcp {
            return Err("Not in MCP mode".to_string());
        }

        if let Some(ref client) = self.mcp_client {
            let mcp_node = client.create_node(parent_path, name, node_type)?;
            let node_data: NodeData = mcp_node.into();
            println!("[SceneBridge/MCP] Created node: {} under {}", name, parent_path);
            Ok(node_data)
        } else {
            Err("MCP client not initialized".to_string())
        }
    }

    /// @zh 删除节点（MCP 模式）
    /// @en Delete node (MCP mode)
    pub fn delete_node_mcp(&self, path: &str) -> Result<(), String> {
        if self.mode != BridgeMode::Mcp {
            return Err("Not in MCP mode".to_string());
        }

        if let Some(ref client) = self.mcp_client {
            client.delete_node(path)?;
            println!("[SceneBridge/MCP] Deleted node: {}", path);
            Ok(())
        } else {
            Err("MCP client not initialized".to_string())
        }
    }

    /// @zh 保存场景（MCP 模式）
    /// @en Save scene (MCP mode)
    pub fn save_scene_mcp(&self) -> Result<(), String> {
        if self.mode != BridgeMode::Mcp {
            return Err("Not in MCP mode".to_string());
        }

        if let Some(ref client) = self.mcp_client {
            client.save_scene()?;
            println!("[SceneBridge/MCP] Scene saved");
            Ok(())
        } else {
            Err("MCP client not initialized".to_string())
        }
    }

    /// @zh 打开场景（MCP 模式）
    /// @en Open scene (MCP mode)
    pub fn open_scene_mcp(&self, db_url_or_uuid: &str) -> Result<(), String> {
        if self.mode != BridgeMode::Mcp {
            return Err("Not in MCP mode".to_string());
        }

        if let Some(ref client) = self.mcp_client {
            client.open_scene(db_url_or_uuid)?;
            println!("[SceneBridge/MCP] Opened scene: {}", db_url_or_uuid);
            Ok(())
        } else {
            Err("MCP client not initialized".to_string())
        }
    }

    /// @zh 获取内置资源（用于 viewport 初始化）
    /// @en Get builtin resources (for viewport initialization)
    ///
    /// @zh 返回编译后的 effects 数据作为 JSON 字符串
    /// @en Returns compiled effects data as JSON string
    pub fn get_builtin_resources_mcp(&self) -> Result<serde_json::Value, String> {
        if self.mode != BridgeMode::Mcp {
            return Err("Not in MCP mode".to_string());
        }

        if let Some(ref client) = self.mcp_client {
            let result = client.get_builtin_resources()?;
            println!("[SceneBridge/MCP] Fetched builtin resources");
            Ok(result)
        } else {
            Err("MCP client not initialized".to_string())
        }
    }

    // ========================================================================
    // WebView Mode Methods
    // ========================================================================

    /// @zh 接收来自 WebView 的消息
    /// @en Receive message from WebView
    pub fn receive_message(&mut self, message: &str) {
        self.pending_messages.push_back(message.to_string());
    }

    /// @zh 处理收到的消息并更新状态
    /// @en Process received messages and update state
    pub fn process_messages(&mut self, scene_state: &mut SceneState) {
        while let Some(msg) = self.pending_messages.pop_front() {
            self.handle_message(&msg, scene_state);
        }
    }

    /// @zh 处理单个消息
    /// @en Handle single message
    fn handle_message(&mut self, message: &str, scene_state: &mut SceneState) {
        // Try to parse as RPC response
        if let Ok(response) = serde_json::from_str::<serde_json::Value>(message) {
            // Check if it's a response (has "id" and "result" or "error")
            if response.get("id").is_some() {
                if let Some(result) = response.get("result") {
                    self.handle_result(result, scene_state);
                }
                return;
            }

            // Check if it's a notification (has "method")
            if let Some(method) = response.get("method").and_then(|m| m.as_str()) {
                let params = response.get("params");
                self.handle_notification(method, params, scene_state);
            }
        }
    }

    /// @zh 处理 RPC 结果
    /// @en Handle RPC result
    fn handle_result(&mut self, result: &serde_json::Value, scene_state: &mut SceneState) {
        // Try to parse as NodeData (scene.getTree result)
        if let Ok(tree) = serde_json::from_value::<NodeData>(result.clone()) {
            println!("[SceneBridge] Received scene tree: {} nodes", tree.count_nodes());
            scene_state.update_tree(tree);
            self.hierarchy_requested = false;
            return;
        }

        // Try to parse as NodeProperties (scene.getNodeProperties result)
        if let Ok(props) = serde_json::from_value::<NodeProperties>(result.clone()) {
            println!("[SceneBridge] Received node properties: {}", props.name);
            scene_state.update_properties(props);
            self.properties_requested = false;
            return;
        }
    }

    /// @zh 处理通知
    /// @en Handle notification
    fn handle_notification(&mut self, method: &str, params: Option<&serde_json::Value>, scene_state: &mut SceneState) {
        match method {
            "scene.hierarchyChanged" => {
                println!("[SceneBridge] Hierarchy changed notification");
                scene_state.mark_hierarchy_dirty();
                self.hierarchy_requested = false;
            }
            "scene.nodeSelected" => {
                if let Some(uuid) = params.and_then(|p| p.get("uuid")).and_then(|u| u.as_str()) {
                    println!("[SceneBridge] Node selected: {}", uuid);
                    scene_state.select_node(Some(uuid.to_string()));
                } else {
                    scene_state.select_node(None);
                }
            }
            "scene.loaded" => {
                println!("[SceneBridge] Scene loaded");
                scene_state.mark_hierarchy_dirty();
                self.hierarchy_requested = false;
            }
            "viewport.ready" => {
                println!("[SceneBridge] Viewport ready");
                scene_state.mark_hierarchy_dirty();
            }
            _ => {
                // Unknown notification
            }
        }
    }

    /// @zh 重置请求状态（当场景改变时）
    /// @en Reset request state (when scene changes)
    pub fn reset(&mut self) {
        self.hierarchy_requested = false;
        self.properties_requested = false;
        self.last_properties_uuid = None;
        self.pending_messages.clear();
    }
}

/// @zh 扩展 WebViewViewport 以支持 IPC 消息处理
/// @en Extend WebViewViewport to support IPC message handling
pub fn setup_ipc_handler(bridge: std::sync::Arc<std::sync::Mutex<SceneBridge>>) -> impl Fn(String) {
    move |message: String| {
        if let Ok(mut bridge) = bridge.lock() {
            bridge.receive_message(&message);
        }
    }
}
