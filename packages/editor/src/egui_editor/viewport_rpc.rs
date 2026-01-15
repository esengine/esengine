//! @zh Viewport RPC 模块
//! @en Viewport RPC module
//!
//! @zh 基于 WebSocket 的 JSON-RPC 2.0 协议实现，用于编辑器与 viewport 服务通信。
//! @en JSON-RPC 2.0 protocol over WebSocket for editor-viewport communication.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{mpsc, Arc, Mutex};

// ============================================================================
// JSON-RPC 2.0 Protocol
// ============================================================================

/// @zh JSON-RPC 请求
/// @en JSON-RPC request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RpcRequest {
    pub jsonrpc: String,
    pub method: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<serde_json::Value>,
    pub id: u64,
}

/// @zh JSON-RPC 响应
/// @en JSON-RPC response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RpcResponse {
    pub jsonrpc: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<RpcError>,
    pub id: u64,
}

/// @zh JSON-RPC 错误
/// @en JSON-RPC error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RpcError {
    pub code: i32,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
}

/// @zh JSON-RPC 通知（无 id，不需要响应）
/// @en JSON-RPC notification (no id, no response needed)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RpcNotification {
    pub jsonrpc: String,
    pub method: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<serde_json::Value>,
}

// ============================================================================
// Viewport Methods (编辑器调用 viewport)
// ============================================================================

/// @zh viewport 方法定义
/// @en Viewport method definitions
pub mod methods {
    use super::*;

    // ------------------------------------------------------------------------
    // Camera Control
    // ------------------------------------------------------------------------

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SetViewModeParams {
        pub mode: ViewMode,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ResizeParams {
        pub width: u32,
        pub height: u32,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SetCameraParams {
        pub position: Vec3,
        pub target: Vec3,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub fov: Option<f32>,
    }

    // ------------------------------------------------------------------------
    // Scene Operations
    // ------------------------------------------------------------------------

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct CreateNodeParams {
        pub name: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub parent_uuid: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub position: Option<Vec3>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct CreateNodeResult {
        pub uuid: String,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SelectNodeParams {
        pub uuid: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct GetSceneInfoResult {
        pub scene_name: String,
        pub nodes: Vec<NodeInfo>,
    }

    // ------------------------------------------------------------------------
    // Playback Control
    // ------------------------------------------------------------------------

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SetEditModeParams {
        pub edit_mode: bool,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct GetStateResult {
        pub is_playing: bool,
        pub is_paused: bool,
        pub is_edit_mode: bool,
        pub view_mode: ViewMode,
    }
}

// ============================================================================
// Viewport Events (viewport 通知编辑器)
// ============================================================================

/// @zh viewport 事件定义
/// @en Viewport event definitions
pub mod events {
    use super::*;

    pub const READY: &str = "viewport.ready";
    pub const ERROR: &str = "viewport.error";
    pub const LOG: &str = "viewport.log";
    pub const VIEW_MODE_CHANGED: &str = "viewport.viewModeChanged";
    pub const PLAY_STATE_CHANGED: &str = "viewport.playStateChanged";
    pub const NODE_SELECTED: &str = "viewport.nodeSelected";
    pub const SCENE_CHANGED: &str = "viewport.sceneChanged";

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ReadyParams {
        pub version: String,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ErrorParams {
        pub message: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub stack: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct LogParams {
        pub level: LogLevel,
        pub message: String,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ViewModeChangedParams {
        pub mode: ViewMode,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct PlayStateChangedParams {
        pub state: PlayState,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct NodeSelectedParams {
        pub uuid: Option<String>,
    }
}

// ============================================================================
// Shared Types
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ViewMode {
    #[serde(rename = "2d")]
    Mode2D,
    #[serde(rename = "3d")]
    Mode3D,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PlayState {
    Playing,
    Paused,
    Stopped,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Vec3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeInfo {
    pub uuid: String,
    pub name: String,
    pub position: Vec3,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<NodeInfo>>,
}

// ============================================================================
// RPC Client (编辑器侧)
// ============================================================================

/// @zh RPC 调用结果
/// @en RPC call result
pub type RpcResult<T> = Result<T, RpcError>;

/// @zh 待处理的请求回调
/// @en Pending request callback
type PendingCallback = Box<dyn FnOnce(RpcResult<serde_json::Value>) + Send>;

/// @zh Viewport RPC 客户端
/// @en Viewport RPC client
pub struct ViewportClient {
    next_id: AtomicU64,
    pending: Arc<Mutex<HashMap<u64, PendingCallback>>>,
    sender: Option<mpsc::Sender<String>>,
    event_receiver: Option<mpsc::Receiver<RpcNotification>>,
}

impl ViewportClient {
    pub fn new() -> Self {
        Self {
            next_id: AtomicU64::new(1),
            pending: Arc::new(Mutex::new(HashMap::new())),
            sender: None,
            event_receiver: None,
        }
    }

    /// @zh 连接到 viewport 服务
    /// @en Connect to viewport server
    pub fn connect(&mut self, url: &str) -> Result<(), String> {
        // TODO: 实现 WebSocket 连接
        // 这里先用 channel 模拟
        let (tx, _rx) = mpsc::channel();
        self.sender = Some(tx);
        Ok(())
    }

    /// @zh 发送请求并等待响应
    /// @en Send request and wait for response
    pub fn call<P, R>(&self, method: &str, params: P) -> RpcResult<R>
    where
        P: Serialize,
        R: for<'de> Deserialize<'de>,
    {
        let id = self.next_id.fetch_add(1, Ordering::SeqCst);
        let request = RpcRequest {
            jsonrpc: "2.0".to_string(),
            method: method.to_string(),
            params: Some(serde_json::to_value(params).map_err(|e| RpcError {
                code: -32700,
                message: format!("Parse error: {}", e),
                data: None,
            })?),
            id,
        };

        let json = serde_json::to_string(&request).map_err(|e| RpcError {
            code: -32700,
            message: format!("Serialize error: {}", e),
            data: None,
        })?;

        if let Some(ref sender) = self.sender {
            sender.send(json).map_err(|e| RpcError {
                code: -32000,
                message: format!("Send error: {}", e),
                data: None,
            })?;
        }

        // TODO: 等待响应
        Err(RpcError {
            code: -32000,
            message: "Not implemented".to_string(),
            data: None,
        })
    }

    /// @zh 发送通知（不等待响应）
    /// @en Send notification (no response)
    pub fn notify<P: Serialize>(&self, method: &str, params: P) -> Result<(), String> {
        let notification = RpcNotification {
            jsonrpc: "2.0".to_string(),
            method: method.to_string(),
            params: Some(serde_json::to_value(params).map_err(|e| e.to_string())?),
        };

        let json = serde_json::to_string(&notification).map_err(|e| e.to_string())?;

        if let Some(ref sender) = self.sender {
            sender.send(json).map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    /// @zh 处理收到的消息
    /// @en Handle received message
    pub fn handle_message(&self, json: &str) -> Result<(), String> {
        // 尝试解析为响应
        if let Ok(response) = serde_json::from_str::<RpcResponse>(json) {
            if let Ok(mut pending) = self.pending.lock() {
                if let Some(callback) = pending.remove(&response.id) {
                    if let Some(error) = response.error {
                        callback(Err(error));
                    } else {
                        callback(Ok(response.result.unwrap_or(serde_json::Value::Null)));
                    }
                }
            }
            return Ok(());
        }

        // 尝试解析为通知
        if let Ok(_notification) = serde_json::from_str::<RpcNotification>(json) {
            // TODO: 分发到事件处理器
            return Ok(());
        }

        Err("Unknown message format".to_string())
    }

    // ------------------------------------------------------------------------
    // Typed Method Wrappers
    // ------------------------------------------------------------------------

    pub fn set_view_mode(&self, mode: ViewMode) -> RpcResult<()> {
        self.call("viewport.setViewMode", methods::SetViewModeParams { mode })
    }

    pub fn resize(&self, width: u32, height: u32) -> RpcResult<()> {
        self.call("viewport.resize", methods::ResizeParams { width, height })
    }

    pub fn play(&self) -> RpcResult<()> {
        self.call::<(), ()>("viewport.play", ())
    }

    pub fn pause(&self) -> RpcResult<()> {
        self.call::<(), ()>("viewport.pause", ())
    }

    pub fn stop(&self) -> RpcResult<()> {
        self.call::<(), ()>("viewport.stop", ())
    }

    pub fn set_edit_mode(&self, edit_mode: bool) -> RpcResult<()> {
        self.call("viewport.setEditMode", methods::SetEditModeParams { edit_mode })
    }

    pub fn get_state(&self) -> RpcResult<methods::GetStateResult> {
        self.call::<(), methods::GetStateResult>("viewport.getState", ())
    }

    pub fn get_scene_info(&self) -> RpcResult<methods::GetSceneInfoResult> {
        self.call::<(), methods::GetSceneInfoResult>("viewport.getSceneInfo", ())
    }

    pub fn create_node(&self, params: methods::CreateNodeParams) -> RpcResult<methods::CreateNodeResult> {
        self.call("viewport.createNode", params)
    }

    pub fn select_node(&self, uuid: Option<String>) -> RpcResult<()> {
        self.call("viewport.selectNode", methods::SelectNodeParams { uuid })
    }
}

impl Default for ViewportClient {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================================
// Method Names
// ============================================================================

/// @zh 方法名称常量
/// @en Method name constants
pub mod method_names {
    pub const SET_VIEW_MODE: &str = "viewport.setViewMode";
    pub const RESIZE: &str = "viewport.resize";
    pub const SET_CAMERA: &str = "viewport.setCamera";
    pub const PLAY: &str = "viewport.play";
    pub const PAUSE: &str = "viewport.pause";
    pub const STOP: &str = "viewport.stop";
    pub const SET_EDIT_MODE: &str = "viewport.setEditMode";
    pub const GET_STATE: &str = "viewport.getState";
    pub const GET_SCENE_INFO: &str = "viewport.getSceneInfo";
    pub const CREATE_NODE: &str = "viewport.createNode";
    pub const SELECT_NODE: &str = "viewport.selectNode";
    pub const RESET_CAMERA: &str = "viewport.resetCamera";
    pub const FOCUS_SELECTED: &str = "viewport.focusSelected";
}
