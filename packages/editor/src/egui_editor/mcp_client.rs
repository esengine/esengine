//! @zh MCP 客户端模块
//! @en MCP client module
//!
//! @zh 负责启动 cces-cli MCP 服务器并通过 HTTP 调用场景 API
//! @en Responsible for starting cces-cli MCP server and calling scene APIs via HTTP

use std::collections::HashMap;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::mpsc::{self, Receiver};
use std::sync::Arc;
use std::time::Duration;

use serde::{Deserialize, Serialize};

// ============================================================================
// MCP Protocol Types
// ============================================================================

/// @zh MCP 请求 ID 生成器
/// @en MCP request ID generator
static REQUEST_ID: AtomicU32 = AtomicU32::new(1);

fn next_request_id() -> u32 {
    REQUEST_ID.fetch_add(1, Ordering::SeqCst)
}

/// @zh MCP JSON-RPC 请求
/// @en MCP JSON-RPC request
#[derive(Debug, Serialize)]
struct McpRequest {
    jsonrpc: String,
    id: u32,
    method: String,
    params: McpParams,
}

#[derive(Debug, Serialize)]
struct McpParams {
    name: String,
    arguments: serde_json::Value,
}

/// @zh MCP JSON-RPC 响应
/// @en MCP JSON-RPC response
#[derive(Debug, Deserialize)]
struct McpResponse {
    #[allow(dead_code)]
    jsonrpc: String,
    #[allow(dead_code)]
    id: Option<u32>,
    result: Option<McpResult>,
    error: Option<McpError>,
}

#[derive(Debug, Deserialize)]
struct McpResult {
    #[allow(dead_code)]
    content: Option<Vec<McpContent>>,
    #[serde(rename = "structuredContent")]
    structured_content: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
struct McpContent {
    #[serde(rename = "type")]
    #[allow(dead_code)]
    content_type: String,
    #[allow(dead_code)]
    text: String,
}

#[derive(Debug, Deserialize)]
struct McpError {
    code: i32,
    message: String,
}

// ============================================================================
// MCP API Response Types
// ============================================================================

/// @zh MCP API 通用响应
/// @en MCP API common response
#[derive(Debug, Deserialize)]
pub struct McpApiResponse<T> {
    pub code: i32,
    pub data: Option<T>,
    pub reason: Option<String>,
}

/// @zh MCP 结构化内容包装器（服务器返回 { result: { code, data } } 格式）
/// @en MCP structured content wrapper (server returns { result: { code, data } } format)
#[derive(Debug, Deserialize)]
pub struct McpStructuredContent<T> {
    pub result: McpApiResponse<T>,
}

/// @zh Vec3 类型
/// @en Vec3 type
#[derive(Debug, Clone, Deserialize, Serialize, Default)]
pub struct Vec3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

/// @zh 四元数类型
/// @en Quaternion type
#[derive(Debug, Clone, Deserialize, Serialize, Default)]
pub struct Quat {
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub w: f32,
}

/// @zh MCP 节点属性
/// @en MCP node properties
#[derive(Debug, Clone, Deserialize, Serialize, Default)]
pub struct McpNodeProperties {
    pub position: Vec3,
    pub rotation: Quat,
    #[serde(rename = "eulerAngles")]
    pub euler_angles: Vec3,
    pub scale: Vec3,
    pub mobility: i32,
    pub layer: i32,
    pub active: bool,
}

/// @zh MCP 组件标识
/// @en MCP component identifier
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct McpComponentRef {
    #[serde(rename = "cid")]
    pub cid: Option<String>,
    pub name: String,
}

/// @zh MCP 节点数据
/// @en MCP node data
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct McpNodeData {
    /// @zh 节点路径（可选，场景根节点可能没有）
    /// @en Node path (optional, scene root may not have it)
    #[serde(default)]
    pub path: String,
    pub name: String,
    /// @zh 节点属性（场景根节点可能没有）
    /// @en Node properties (scene root may not have it)
    #[serde(default)]
    pub properties: McpNodeProperties,
    #[serde(default)]
    pub children: Vec<McpNodeData>,
    #[serde(default)]
    pub components: Vec<McpComponentRef>,
    /// @zh 场景资源名（仅场景根有）
    /// @en Scene asset name (only for scene root)
    #[serde(rename = "assetName")]
    pub asset_name: Option<String>,
    /// @zh 场景资源 UUID（仅场景根有）
    /// @en Scene asset UUID (only for scene root)
    #[serde(rename = "assetUuid")]
    pub asset_uuid: Option<String>,
    /// @zh 场景资源 URL（仅场景根有）
    /// @en Scene asset URL (only for scene root)
    #[serde(rename = "assetUrl")]
    pub asset_url: Option<String>,
}

/// @zh MCP 组件属性值
/// @en MCP component property value
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct McpPropertyValue {
    pub value: serde_json::Value,
    #[serde(rename = "type")]
    pub prop_type: Option<String>,
    pub readonly: Option<bool>,
    pub name: Option<String>,
}

/// @zh MCP 组件详情
/// @en MCP component detail
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct McpComponentData {
    pub cid: String,
    pub name: String,
    pub properties: HashMap<String, McpPropertyValue>,
}

// ============================================================================
// MCP Client
// ============================================================================

/// @zh MCP 客户端
/// @en MCP client
pub struct McpClient {
    /// @zh cces-cli 子进程
    /// @en cces-cli child process
    process: Option<Child>,

    /// @zh MCP 服务器端口
    /// @en MCP server port
    port: u16,

    /// @zh Cocos 项目路径
    /// @en Cocos project path
    project_path: PathBuf,

    /// @zh cces-cli 路径
    /// @en cces-cli path
    cli_path: PathBuf,

    /// @zh HTTP 客户端
    /// @en HTTP client
    http_client: reqwest::blocking::Client,

    /// @zh 是否已启动进程
    /// @en Whether process started
    started: bool,

    /// @zh 服务器是否就绪（原子变量，可跨线程访问）
    /// @en Whether server is ready (atomic, thread-safe)
    server_ready: Arc<AtomicBool>,

    /// @zh 健康检查结果接收器
    /// @en Health check result receiver
    health_rx: Option<Receiver<bool>>,

    /// @zh 是否正在进行健康检查
    /// @en Whether health check is in progress
    health_checking: Arc<AtomicBool>,
}

impl McpClient {
    /// @zh 创建新的 MCP 客户端
    /// @en Create new MCP client
    pub fn new(project_path: PathBuf, cli_path: PathBuf) -> Self {
        Self {
            process: None,
            port: 9527,
            project_path,
            cli_path,
            http_client: reqwest::blocking::Client::builder()
                .timeout(Duration::from_secs(30)) // Timeout for API calls
                .build()
                .expect("Failed to create HTTP client"),
            started: false,
            server_ready: Arc::new(AtomicBool::new(false)),
            health_rx: None,
            health_checking: Arc::new(AtomicBool::new(false)),
        }
    }

    /// @zh 设置端口
    /// @en Set port
    pub fn with_port(mut self, port: u16) -> Self {
        self.port = port;
        self
    }

    /// @zh 获取 MCP URL
    /// @en Get MCP URL
    fn mcp_url(&self) -> String {
        format!("http://127.0.0.1:{}/mcp", self.port)
    }

    /// @zh 启动 MCP 服务器（非阻塞）
    /// @en Start MCP server (non-blocking)
    pub fn start(&mut self) -> Result<(), String> {
        if self.started {
            return Ok(());
        }

        let cli_js = self.cli_path.join("dist/cli.js");
        if !cli_js.exists() {
            return Err(format!(
                "cces-cli not found at {:?}. Please build cces-cli first.",
                cli_js
            ));
        }

        println!(
            "[MCP] Starting server: node {} start-mcp-server --project={:?} --port={}",
            cli_js.display(),
            self.project_path,
            self.port
        );

        let child = Command::new("node")
            .arg(&cli_js)
            .arg("start-mcp-server")
            .arg(format!("--project={}", self.project_path.display()))
            .arg(format!("--port={}", self.port))
            .stdout(Stdio::inherit()) // Show output in console
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| format!("Failed to start MCP server: {}", e))?;

        self.process = Some(child);
        self.started = true;
        self.server_ready.store(false, Ordering::SeqCst);

        // Start background health check
        self.start_health_check_thread();

        println!("[MCP] Server process started, health check running in background...");
        Ok(())
    }

    /// @zh 启动后台健康检查线程
    /// @en Start background health check thread
    fn start_health_check_thread(&mut self) {
        if self.health_checking.load(Ordering::SeqCst) {
            return;
        }

        let (tx, rx) = mpsc::channel();
        self.health_rx = Some(rx);

        let port = self.port;
        let server_ready = Arc::clone(&self.server_ready);
        let health_checking = Arc::clone(&self.health_checking);

        health_checking.store(true, Ordering::SeqCst);

        std::thread::spawn(move || {
            let client = reqwest::blocking::Client::builder()
                .timeout(Duration::from_secs(2))
                .build()
                .unwrap();

            let url = format!("http://127.0.0.1:{}/mcp", port);
            // Use "tools/list" method which is a standard MCP method
            let request = serde_json::json!({
                "jsonrpc": "2.0",
                "id": 0,
                "method": "tools/list",
                "params": {}
            });

            // Try for up to 60 seconds
            for i in 0..60 {
                std::thread::sleep(Duration::from_secs(1));

                match client
                    .post(&url)
                    .header("Accept", "application/json, text/event-stream")
                    .header("Content-Type", "application/json")
                    .json(&request)
                    .send()
                {
                    Ok(response) => {
                        let status = response.status().as_u16();
                        // 200: success, 400: bad request (but server is up), 406: wrong accept (but server is up)
                        if response.status().is_success() || status == 400 || status == 406 {
                            println!("[MCP] Server is ready after {} seconds! (status: {})", i + 1, status);
                            server_ready.store(true, Ordering::SeqCst);
                            let _ = tx.send(true);
                            health_checking.store(false, Ordering::SeqCst);
                            return;
                        }
                    }
                    Err(_) => {
                        if i % 5 == 4 {
                            println!("[MCP] Still waiting for server... ({}/60)", i + 1);
                        }
                    }
                }
            }

            println!("[MCP] Timeout waiting for server after 60 seconds");
            let _ = tx.send(false);
            health_checking.store(false, Ordering::SeqCst);
        });
    }

    /// @zh 轮询检查服务器是否就绪（非阻塞）
    /// @en Poll to check if server is ready (non-blocking)
    pub fn poll_ready(&mut self) -> bool {
        // Check atomic flag first (fast path)
        if self.server_ready.load(Ordering::SeqCst) {
            return true;
        }

        if !self.started {
            return false;
        }

        // Check if background thread has sent result
        if let Some(ref rx) = self.health_rx {
            match rx.try_recv() {
                Ok(ready) => {
                    if ready {
                        return true;
                    }
                }
                Err(mpsc::TryRecvError::Empty) => {
                    // Still checking
                }
                Err(mpsc::TryRecvError::Disconnected) => {
                    // Thread finished
                }
            }
        }

        false
    }

    /// @zh 停止 MCP 服务器
    /// @en Stop MCP server
    pub fn stop(&mut self) {
        if let Some(mut process) = self.process.take() {
            let _ = process.kill();
            let _ = process.wait();
            println!("[MCP] Server stopped");
        }
        self.started = false;
        self.server_ready.store(false, Ordering::SeqCst);
        self.health_checking.store(false, Ordering::SeqCst);
        self.health_rx = None;
    }

    /// @zh 检查服务器是否运行
    /// @en Check if server is running
    /// @zh 检查进程是否已启动
    /// @en Check if process has started
    pub fn is_running(&self) -> bool {
        self.started
    }

    /// @zh 检查服务器是否就绪
    /// @en Check if server is ready
    pub fn is_ready(&self) -> bool {
        self.server_ready.load(Ordering::SeqCst)
    }

    /// @zh 调用 MCP 工具
    /// @en Call MCP tool
    pub fn call_tool<T: for<'de> Deserialize<'de>>(
        &self,
        tool_name: &str,
        arguments: serde_json::Value,
    ) -> Result<T, String> {
        let request = McpRequest {
            jsonrpc: "2.0".to_string(),
            id: next_request_id(),
            method: "tools/call".to_string(),
            params: McpParams {
                name: tool_name.to_string(),
                arguments,
            },
        };

        let response = self
            .http_client
            .post(&self.mcp_url())
            .header("Accept", "application/json, text/event-stream")
            .json(&request)
            .send()
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        let mcp_response: McpResponse = response
            .json()
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        if let Some(error) = mcp_response.error {
            return Err(format!("MCP error {}: {}", error.code, error.message));
        }

        let result = mcp_response
            .result
            .ok_or_else(|| "No result in response".to_string())?;

        // Try structured content first, then parse from content text
        if let Some(structured) = result.structured_content {
            // First try to parse as wrapped response { result: { code, data, reason } }
            // This is the format returned by MCP server
            if let Ok(wrapper) = serde_json::from_value::<McpStructuredContent<T>>(structured.clone()) {
                if wrapper.result.code != 200 {
                    return Err(wrapper.result.reason.unwrap_or_else(|| "Unknown error".to_string()));
                }
                return wrapper.result
                    .data
                    .ok_or_else(|| "No data in response (scene may not be open)".to_string());
            }

            // Fallback: try to parse as direct { code, data, reason } format
            if let Ok(api_response) = serde_json::from_value::<McpApiResponse<T>>(structured.clone()) {
                if api_response.code != 200 {
                    return Err(api_response.reason.unwrap_or_else(|| "Unknown error".to_string()));
                }
                return api_response
                    .data
                    .ok_or_else(|| "No data in response".to_string());
            }

            // Last fallback: try to parse structured content directly as T
            return serde_json::from_value(structured)
                .map_err(|e| format!("Failed to parse structured content: {}", e));
        }

        // Fallback: parse from content text
        if let Some(contents) = result.content {
            if let Some(content) = contents.first() {
                let api_response: McpApiResponse<T> = serde_json::from_str(&content.text)
                    .map_err(|e| format!("Failed to parse content: {}", e))?;

                if api_response.code != 200 {
                    return Err(api_response.reason.unwrap_or_else(|| "Unknown error".to_string()));
                }

                return api_response
                    .data
                    .ok_or_else(|| "No data in response".to_string());
            }
        }

        Err("No content in response".to_string())
    }

    // ========================================================================
    // Scene API Methods
    // ========================================================================

    /// @zh 查询当前场景
    /// @en Query current scene
    pub fn query_current_scene(&self) -> Result<McpNodeData, String> {
        self.call_tool("scene-query-current", serde_json::json!({}))
    }

    /// @zh 查询节点
    /// @en Query node
    pub fn query_node(&self, path: &str, query_children: bool) -> Result<McpNodeData, String> {
        self.call_tool(
            "scene-query-node",
            serde_json::json!({
                "path": path,
                "queryChildren": query_children
            }),
        )
    }

    /// @zh 更新节点
    /// @en Update node
    pub fn update_node(
        &self,
        path: &str,
        properties: serde_json::Value,
    ) -> Result<serde_json::Value, String> {
        self.call_tool(
            "scene-update-node",
            serde_json::json!({
                "path": path,
                "properties": properties
            }),
        )
    }

    /// @zh 创建节点
    /// @en Create node
    pub fn create_node(
        &self,
        parent_path: &str,
        name: &str,
        node_type: &str,
    ) -> Result<McpNodeData, String> {
        self.call_tool(
            "scene-create-node-by-type",
            serde_json::json!({
                "path": parent_path,
                "name": name,
                "nodeType": node_type
            }),
        )
    }

    /// @zh 删除节点
    /// @en Delete node
    pub fn delete_node(&self, path: &str) -> Result<serde_json::Value, String> {
        self.call_tool(
            "scene-delete-node",
            serde_json::json!({
                "path": path
            }),
        )
    }

    /// @zh 查询组件
    /// @en Query component
    pub fn query_component(&self, component_path: &str) -> Result<McpComponentData, String> {
        self.call_tool(
            "scene-query-component",
            serde_json::json!({
                "path": component_path
            }),
        )
    }

    /// @zh 添加组件
    /// @en Add component
    pub fn add_component(
        &self,
        node_path: &str,
        component: &str,
    ) -> Result<McpComponentData, String> {
        self.call_tool(
            "scene-add-component",
            serde_json::json!({
                "nodePath": node_path,
                "component": component
            }),
        )
    }

    /// @zh 删除组件
    /// @en Delete component
    pub fn delete_component(&self, component_path: &str) -> Result<bool, String> {
        self.call_tool(
            "scene-delete-component",
            serde_json::json!({
                "path": component_path
            }),
        )
    }

    /// @zh 设置组件属性
    /// @en Set component property
    pub fn set_component_property(
        &self,
        component_path: &str,
        properties: HashMap<String, serde_json::Value>,
    ) -> Result<bool, String> {
        self.call_tool(
            "scene-set-component-property",
            serde_json::json!({
                "componentPath": component_path,
                "properties": properties
            }),
        )
    }

    /// @zh 打开场景
    /// @en Open scene
    pub fn open_scene(&self, db_url_or_uuid: &str) -> Result<serde_json::Value, String> {
        self.call_tool(
            "scene-open",
            serde_json::json!({
                "dbURLOrUUID": db_url_or_uuid
            }),
        )
    }

    /// @zh 保存场景
    /// @en Save scene
    pub fn save_scene(&self) -> Result<serde_json::Value, String> {
        self.call_tool("scene-save", serde_json::json!({}))
    }

    /// @zh 获取内置资源（用于 viewport 初始化）
    /// @en Get builtin resources (for viewport initialization)
    pub fn get_builtin_resources(&self) -> Result<serde_json::Value, String> {
        self.call_tool("engine-get-builtin-resources", serde_json::json!({}))
    }
}

impl Drop for McpClient {
    fn drop(&mut self) {
        self.stop();
    }
}

// ============================================================================
// Conversion to Local Types
// ============================================================================

use super::scene_data::{NodeData, NodeProperties};

impl From<McpNodeData> for NodeData {
    fn from(mcp: McpNodeData) -> Self {
        // For scene root, use asset_uuid or "/" as identifier
        let uuid = if mcp.path.is_empty() {
            mcp.asset_uuid.clone().unwrap_or_else(|| "/".to_string())
        } else {
            mcp.path.clone()
        };

        NodeData {
            uuid,
            name: mcp.name,
            active: mcp.properties.active,
            children: mcp.children.into_iter().map(NodeData::from).collect(),
            components: mcp.components.iter().map(|c| c.name.clone()).collect(),
        }
    }
}

impl From<McpNodeData> for NodeProperties {
    fn from(mcp: McpNodeData) -> Self {
        // For scene root, use asset_uuid or "/" as identifier
        let uuid = if mcp.path.is_empty() {
            mcp.asset_uuid.unwrap_or_else(|| "/".to_string())
        } else {
            mcp.path
        };

        NodeProperties {
            uuid,
            name: mcp.name,
            active: mcp.properties.active,
            position: [
                mcp.properties.position.x,
                mcp.properties.position.y,
                mcp.properties.position.z,
            ],
            rotation: [
                mcp.properties.euler_angles.x,
                mcp.properties.euler_angles.y,
                mcp.properties.euler_angles.z,
            ],
            scale: [
                mcp.properties.scale.x,
                mcp.properties.scale.y,
                mcp.properties.scale.z,
            ],
            components: vec![], // Components need separate query
        }
    }
}
