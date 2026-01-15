//! @zh WebView2 视口集成模块
//! @en WebView2 viewport integration module
//!
//! @zh 提供在 egui 窗口中嵌入 WebView2 来渲染 ccesengine 内容。
//! @zh 使用本地 HTTP 服务器加载资源（ES modules 需要 HTTP 协议）。
//! @en Provides embedding WebView2 in egui window to render ccesengine content.
//! @en Uses local HTTP server to load resources (ES modules require HTTP protocol).

use eframe::egui;
use raw_window_handle::RawWindowHandle;
use serde::Serialize;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{mpsc, Arc};
use std::thread;
use wry::{WebView, WebViewBuilder};

use super::state::LogEntry;
use super::viewport_rpc::{self, RpcRequest, ViewMode};

/// @zh ccesengine 视口 HTML 模板
/// @en ccesengine viewport HTML template
const CCESENGINE_VIEWPORT_HTML_TEMPLATE: &str = include_str!("../../assets/ccesengine-viewport.html");

/// @zh 生成使用 HTTP 服务器 URL 的 HTML
/// @en Generate HTML using HTTP server URL
fn generate_viewport_html(port: u16) -> String {
    // Replace asset:// protocol with http://localhost:PORT
    CCESENGINE_VIEWPORT_HTML_TEMPLATE
        .replace("asset://localhost", &format!("http://127.0.0.1:{}", port))
}

/// @zh 本地资源服务器
/// @en Local asset server
struct AssetServer {
    port: u16,
    assets_path: Arc<PathBuf>,
    _handle: Option<thread::JoinHandle<()>>,
}

impl AssetServer {
    /// @zh 启动本地 HTTP 服务器
    /// @en Start local HTTP server
    fn start(assets_path: PathBuf) -> Result<Self, String> {
        let server = tiny_http::Server::http("127.0.0.1:0")
            .map_err(|e| format!("Failed to start HTTP server: {}", e))?;

        let port = server.server_addr().to_ip().map(|a| a.port()).unwrap_or(0);
        if port == 0 {
            return Err("Failed to get server port".to_string());
        }

        println!("[Asset Server] Started on port {}", port);

        let assets_path = Arc::new(assets_path);
        let assets_path_clone = assets_path.clone();

        // Generate viewport HTML with correct port
        let viewport_html = generate_viewport_html(port);

        let handle = thread::spawn(move || {
            for request in server.incoming_requests() {
                let path = request.url().to_string();

                // Handle index.html - serve embedded HTML with correct port
                if path == "/" || path == "/index.html" {
                    println!("[Asset Server] Request: {} -> (embedded HTML)", path);
                    let response = tiny_http::Response::from_data(viewport_html.as_bytes().to_vec())
                        .with_header(
                            tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"text/html; charset=utf-8"[..])
                                .unwrap(),
                        )
                        .with_header(
                            tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..])
                                .unwrap(),
                        );
                    let _ = request.respond(response);
                    continue;
                }

                // Handle prerequisite-imports - return empty module
                // This is used by ccesengine bundle system
                if path.starts_with("/prerequisite-imports") {
                    println!("[Asset Server] Request: {} -> (empty module)", path);
                    let response = tiny_http::Response::from_data(b"export default {};".to_vec())
                        .with_header(
                            tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/javascript"[..])
                                .unwrap(),
                        )
                        .with_header(
                            tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..])
                                .unwrap(),
                        );
                    let _ = request.respond(response);
                    continue;
                }

                // Handle engine_external WASM requests - redirect to ccesengine folder
                if path.starts_with("/engine_external/") {
                    // Parse url parameter: /engine_external/?url=assets/foo.wasm
                    if let Some(url_param) = path.split("url=").nth(1) {
                        let wasm_file = url_param.split('&').next().unwrap_or(url_param);
                        // Map assets/*.wasm to ccesengine/assets/*.wasm (keep assets/ prefix)
                        let mapped_path = format!("ccesengine/{}", wasm_file);
                        let file_path = assets_path_clone.join(&mapped_path);
                        println!("[Asset Server] Request: {} -> {:?}", path, file_path);

                        let response = match std::fs::read(&file_path) {
                            Ok(content) => {
                                tiny_http::Response::from_data(content)
                                    .with_header(
                                        tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/wasm"[..])
                                            .unwrap(),
                                    )
                                    .with_header(
                                        tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..])
                                            .unwrap(),
                                    )
                            }
                            Err(e) => {
                                eprintln!("[Asset Server] Error loading {:?}: {}", file_path, e);
                                tiny_http::Response::from_string(format!("Not found: {}", path))
                                    .with_status_code(404)
                            }
                        };
                        let _ = request.respond(response);
                        continue;
                    }
                }

                let relative_path = path.trim_start_matches('/');

                // Construct file path
                let file_path = assets_path_clone.join(relative_path);

                println!("[Asset Server] Request: {} -> {:?}", path, file_path);

                let response = match std::fs::read(&file_path) {
                    Ok(content) => {
                        let mime_type = get_mime_type(&file_path);

                        // Patch ccesengine JS files to work without cce:// protocol
                        let content = if file_path.extension().and_then(|e| e.to_str()) == Some("js")
                            && file_path.to_string_lossy().contains("ccesengine")
                        {
                            patch_ccesengine_js(content)
                        } else {
                            content
                        };

                        tiny_http::Response::from_data(content)
                            .with_header(
                                tiny_http::Header::from_bytes(&b"Content-Type"[..], mime_type.as_bytes())
                                    .unwrap(),
                            )
                            .with_header(
                                tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..])
                                    .unwrap(),
                            )
                    }
                    Err(e) => {
                        eprintln!("[Asset Server] Error loading {:?}: {}", file_path, e);
                        tiny_http::Response::from_string(format!("Not found: {}", path))
                            .with_status_code(404)
                    }
                };

                let _ = request.respond(response);
            }
        });

        Ok(Self {
            port,
            assets_path,
            _handle: Some(handle),
        })
    }
}

/// @zh WebView2 视口状态
/// @en WebView2 viewport state
pub struct WebViewViewport {
    webview: Option<WebView>,
    bounds: egui::Rect,
    url: String,
    html: Option<String>,
    assets_path: Option<PathBuf>,
    asset_server: Option<AssetServer>,
    ready: bool,
    error: Option<String>,
    /// @zh 日志接收器（从 IPC handler 接收日志）
    /// @en Log receiver (receives logs from IPC handler)
    log_receiver: Option<mpsc::Receiver<LogEntry>>,
    /// @zh RPC 请求 ID 计数器
    /// @en RPC request ID counter
    next_rpc_id: AtomicU64,
}

impl WebViewViewport {
    /// @zh 创建新的 WebView2 视口（从 URL 加载）
    /// @en Create a new WebView2 viewport (load from URL)
    pub fn new(url: impl Into<String>) -> Self {
        Self {
            webview: None,
            bounds: egui::Rect::NOTHING,
            url: url.into(),
            html: None,
            assets_path: None,
            asset_server: None,
            ready: false,
            error: None,
            log_receiver: None,
            next_rpc_id: AtomicU64::new(1),
        }
    }

    /// @zh 创建新的 WebView2 视口（使用自定义 HTML）
    /// @en Create a new WebView2 viewport (with custom HTML)
    pub fn with_html(html: impl Into<String>) -> Self {
        Self {
            webview: None,
            bounds: egui::Rect::NOTHING,
            url: String::new(),
            html: Some(html.into()),
            assets_path: None,
            asset_server: None,
            ready: false,
            error: None,
            log_receiver: None,
            next_rpc_id: AtomicU64::new(1),
        }
    }

    /// @zh 创建嵌入式 ccesengine 视口
    /// @en Create embedded ccesengine viewport
    ///
    /// @zh 使用本地 HTTP 服务器从文件系统加载 ccesengine 模块。
    /// @zh 不需要外部 Vite 服务器。
    /// @en Uses local HTTP server to load ccesengine modules from filesystem.
    /// @en No external Vite server required.
    ///
    /// # Arguments
    /// * `assets_path` - ccesengine 资源目录路径（包含 ccesengine/ 子目录）
    pub fn with_embedded_ccesengine(assets_path: impl Into<PathBuf>) -> Self {
        let assets_path = assets_path.into();

        // Start local HTTP server
        match AssetServer::start(assets_path.clone()) {
            Ok(server) => {
                let port = server.port;
                // Navigate to HTTP server URL (not about:blank) for WebGL to work
                let url = format!("http://127.0.0.1:{}/", port);
                println!("[WebView] Using HTTP server URL: {}", url);
                Self {
                    webview: None,
                    bounds: egui::Rect::NOTHING,
                    url,
                    html: None,
                    assets_path: Some(assets_path),
                    asset_server: Some(server),
                    ready: false,
                    error: None,
                    log_receiver: None,
                    next_rpc_id: AtomicU64::new(1),
                }
            }
            Err(e) => {
                eprintln!("[WebView] Failed to start asset server: {}", e);
                Self {
                    webview: None,
                    bounds: egui::Rect::NOTHING,
                    url: String::new(),
                    html: None,
                    assets_path: Some(assets_path),
                    asset_server: None,
                    ready: false,
                    error: Some(format!("Failed to start asset server: {}", e)),
                    log_receiver: None,
                    next_rpc_id: AtomicU64::new(1),
                }
            }
        }
    }

    /// @zh 初始化 WebView（需要在有窗口句柄和边界后调用）
    /// @en Initialize WebView (must be called after window handle and bounds are available)
    #[cfg(target_os = "windows")]
    pub fn initialize(&mut self, window_handle: RawWindowHandle, bounds: egui::Rect) {
        use raw_window_handle::RawWindowHandle::Win32;

        if self.webview.is_some() {
            return;
        }

        // Skip if bounds are invalid
        if bounds.width() < 10.0 || bounds.height() < 10.0 {
            return;
        }

        self.bounds = bounds;

        // Create channel for log forwarding
        let (log_sender, log_receiver) = mpsc::channel::<LogEntry>();
        self.log_receiver = Some(log_receiver);

        match window_handle {
            Win32(_handle) => {
                // Create WebView2 builder with correct bounds
                let mut builder = WebViewBuilder::new()
                    .with_transparent(true)
                    .with_visible(true)
                    .with_bounds(wry::Rect {
                        position: wry::dpi::Position::Logical(wry::dpi::LogicalPosition::new(
                            bounds.left() as f64,
                            bounds.top() as f64,
                        )),
                        size: wry::dpi::Size::Logical(wry::dpi::LogicalSize::new(
                            bounds.width() as f64,
                            bounds.height() as f64,
                        )),
                    })
                    .with_ipc_handler(move |msg| {
                        let body = msg.body();

                        // Try to parse as JSON
                        if let Ok(json) = serde_json::from_str::<serde_json::Value>(body) {
                            // Check if it's a JSON-RPC 2.0 notification
                            if json.get("jsonrpc").is_some() {
                                let method = json.get("method")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or("");
                                let params = json.get("params");

                                let entry = match method {
                                    "viewport.log" => {
                                        let level = params
                                            .and_then(|p| p.get("level"))
                                            .and_then(|v| v.as_str())
                                            .unwrap_or("info");
                                        let message = params
                                            .and_then(|p| p.get("message"))
                                            .and_then(|v| v.as_str())
                                            .unwrap_or("");
                                        match level {
                                            "error" => LogEntry::error(message),
                                            "warn" => LogEntry::warn(message),
                                            _ => LogEntry::info(message),
                                        }
                                    }
                                    "viewport.error" => {
                                        let message = params
                                            .and_then(|p| p.get("message"))
                                            .and_then(|v| v.as_str())
                                            .unwrap_or("Unknown error");
                                        LogEntry::error(format!("[Viewport Error] {}", message))
                                    }
                                    "viewport.ready" => {
                                        let version = params
                                            .and_then(|p| p.get("version"))
                                            .and_then(|v| v.as_str())
                                            .unwrap_or("unknown");
                                        LogEntry::info(format!("[Viewport Ready] v{}", version))
                                    }
                                    _ => {
                                        // Skip non-log RPC notifications
                                        return;
                                    }
                                };

                                let _ = log_sender.send(entry);
                                return;
                            }

                            // Legacy format: {"type": "...", "message": "..."}
                            let msg_type = json.get("type")
                                .and_then(|v| v.as_str())
                                .unwrap_or("");
                            let message = json.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or(body);

                            let entry = match msg_type {
                                "ConsoleError" | "Error" => LogEntry::error(message),
                                "ConsoleWarn" => LogEntry::warn(message),
                                "ConsoleLog" | "Status" => LogEntry::info(message),
                                "Ready" => LogEntry::info(format!("[Ready] {}", message)),
                                _ => LogEntry::info(format!("[{}] {}", msg_type, message)),
                            };

                            let _ = log_sender.send(entry);
                            return;
                        }

                        // Fallback for non-JSON messages
                        let _ = log_sender.send(LogEntry::info(format!("[IPC] {}", body)));
                    });

                // Use HTML content or URL
                if let Some(ref html) = self.html {
                    builder = builder.with_html(html);
                } else if !self.url.is_empty() {
                    builder = builder.with_url(&self.url);
                } else {
                    self.error = Some("No HTML or URL provided".to_string());
                    return;
                }

                let result = builder.build_as_child(unsafe {
                    &wry::raw_window_handle::WindowHandle::borrow_raw(window_handle)
                });

                match result {
                    Ok(webview) => {
                        self.webview = Some(webview);
                        self.ready = true;
                        self.error = None;
                    }
                    Err(e) => {
                        self.error = Some(format!("Failed to create WebView: {}", e));
                    }
                }
            }
            _ => {
                self.error = Some("Unsupported window handle type".to_string());
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    pub fn initialize(&mut self, _window_handle: RawWindowHandle, _bounds: egui::Rect) {
        self.error = Some("WebView2 integration is only supported on Windows".to_string());
    }

    /// @zh 更新视口边界
    /// @en Update viewport bounds
    pub fn set_bounds(&mut self, bounds: egui::Rect) {
        if self.bounds == bounds {
            return;
        }

        let size_changed = self.bounds.width() != bounds.width() || self.bounds.height() != bounds.height();
        self.bounds = bounds;

        if let Some(ref webview) = self.webview {
            let _ = webview.set_bounds(wry::Rect {
                position: wry::dpi::Position::Logical(wry::dpi::LogicalPosition::new(
                    bounds.left() as f64,
                    bounds.top() as f64,
                )),
                size: wry::dpi::Size::Logical(wry::dpi::LogicalSize::new(
                    bounds.width() as f64,
                    bounds.height() as f64,
                )),
            });

            // Notify viewport to resize via RPC
            if size_changed && self.ready {
                let _ = self.rpc_resize();
            }
        }
    }

    /// @zh 导航到 URL
    /// @en Navigate to URL
    pub fn navigate(&self, url: &str) {
        if let Some(ref webview) = self.webview {
            let _ = webview.load_url(url);
        }
    }

    /// @zh 执行 JavaScript
    /// @en Execute JavaScript
    pub fn eval_script(&self, script: &str) -> Result<(), String> {
        if let Some(ref webview) = self.webview {
            webview.evaluate_script(script).map_err(|e| e.to_string())
        } else {
            Err("WebView not initialized".to_string())
        }
    }

    /// @zh 让 WebView 失去焦点
    /// @en Make WebView lose focus
    ///
    /// @zh 调用此方法后，键盘输入将返回到宿主应用程序（egui）
    /// @en After calling this, keyboard input will return to host application (egui)
    pub fn blur(&self) {
        if let Some(ref webview) = self.webview {
            // Blur active element in WebView to release keyboard focus
            let _ = webview.evaluate_script("if(document.activeElement){document.activeElement.blur()}");
        }
    }

    /// @zh 注入编译好的 effects 数据到 WebView
    /// @en Inject compiled effects data into WebView
    ///
    /// @zh 这会设置 window.__BUILTIN_EFFECTS__ 全局变量
    /// @en This sets window.__BUILTIN_EFFECTS__ global variable
    pub fn inject_effects(&self, effects_json: &str) -> Result<(), String> {
        if let Some(ref webview) = self.webview {
            let script = format!(
                "window.__BUILTIN_EFFECTS__ = {};",
                effects_json
            );
            webview.evaluate_script(&script).map_err(|e| e.to_string())
        } else {
            Err("WebView not initialized".to_string())
        }
    }

    /// @zh 检查是否就绪
    /// @en Check if ready
    pub fn is_ready(&self) -> bool {
        self.ready
    }

    /// @zh 获取错误信息
    /// @en Get error message
    pub fn error(&self) -> Option<&str> {
        self.error.as_deref()
    }

    /// @zh 设置可见性
    /// @en Set visibility
    pub fn set_visible(&self, visible: bool) {
        if let Some(ref webview) = self.webview {
            let _ = webview.set_visible(visible);
        }
    }

    /// @zh 获取待处理的日志（非阻塞）
    /// @en Get pending logs (non-blocking)
    pub fn drain_logs(&mut self) -> Vec<LogEntry> {
        let mut logs = Vec::new();
        if let Some(ref receiver) = self.log_receiver {
            while let Ok(entry) = receiver.try_recv() {
                logs.push(entry);
            }
        }
        logs
    }

    // ========================================================================
    // RPC Methods
    // ========================================================================

    /// @zh 发送 RPC 请求到 viewport
    /// @en Send RPC request to viewport
    fn send_rpc<P: Serialize>(&self, method: &str, params: P) -> Result<(), String> {
        let id = self.next_rpc_id.fetch_add(1, Ordering::SeqCst);
        let request = RpcRequest {
            jsonrpc: "2.0".to_string(),
            method: method.to_string(),
            params: Some(serde_json::to_value(params).map_err(|e| e.to_string())?),
            id,
        };
        let json = serde_json::to_string(&request).map_err(|e| e.to_string())?;
        let script = format!("window.handleRpcMessage && window.handleRpcMessage('{}')", json.replace('\'', "\\'"));
        self.eval_script(&script)
    }

    /// @zh 发送无参数的 RPC 请求
    /// @en Send RPC request without parameters
    fn send_rpc_no_params(&self, method: &str) -> Result<(), String> {
        let id = self.next_rpc_id.fetch_add(1, Ordering::SeqCst);
        let request = RpcRequest {
            jsonrpc: "2.0".to_string(),
            method: method.to_string(),
            params: None,
            id,
        };
        let json = serde_json::to_string(&request).map_err(|e| e.to_string())?;
        let script = format!("window.handleRpcMessage && window.handleRpcMessage('{}')", json.replace('\'', "\\'"));
        self.eval_script(&script)
    }

    /// @zh 设置视图模式
    /// @en Set view mode
    pub fn rpc_set_view_mode(&self, mode: ViewMode) -> Result<(), String> {
        self.send_rpc(viewport_rpc::method_names::SET_VIEW_MODE, viewport_rpc::methods::SetViewModeParams { mode })
    }

    /// @zh 调整视口大小
    /// @en Resize viewport
    pub fn rpc_resize(&self) -> Result<(), String> {
        self.send_rpc_no_params(viewport_rpc::method_names::RESIZE)
    }

    /// @zh 播放
    /// @en Play
    pub fn rpc_play(&self) -> Result<(), String> {
        self.send_rpc_no_params(viewport_rpc::method_names::PLAY)
    }

    /// @zh 暂停
    /// @en Pause
    pub fn rpc_pause(&self) -> Result<(), String> {
        self.send_rpc_no_params(viewport_rpc::method_names::PAUSE)
    }

    /// @zh 停止
    /// @en Stop
    pub fn rpc_stop(&self) -> Result<(), String> {
        self.send_rpc_no_params(viewport_rpc::method_names::STOP)
    }

    /// @zh 重置相机
    /// @en Reset camera
    pub fn rpc_reset_camera(&self) -> Result<(), String> {
        self.send_rpc_no_params(viewport_rpc::method_names::RESET_CAMERA)
    }
}

impl Drop for WebViewViewport {
    fn drop(&mut self) {
        // WebView and asset server will be cleaned up automatically
        self.webview = None;
        self.asset_server = None;
    }
}

/// @zh 修补 ccesengine JS 文件，替换 cce:// 协议
/// @en Patch ccesengine JS files to replace cce:// protocol
fn patch_ccesengine_js(content: Vec<u8>) -> Vec<u8> {
    // Convert to string for patching
    let Ok(text) = String::from_utf8(content.clone()) else {
        return content;
    };

    let mut patched = text;

    // Patch 1: Replace cce:// protocol URLs with HTTP endpoint
    // This handles the _loadCCEScripts function which imports 'cce:/internal/x/prerequisite-imports'
    if patched.contains("cce:/internal/x/prerequisite-imports") {
        patched = patched.replace(
            "\"cce:/internal/x/prerequisite-imports\"",
            "\"/prerequisite-imports\"",
        );
        patched = patched.replace(
            "'cce:/internal/x/prerequisite-imports'",
            "'/prerequisite-imports'",
        );
    }

    // Patch 2: Replace virtual:///prerequisite-imports imports with Promise.resolve({})
    if patched.contains("virtual:///prerequisite-imports") {
        // Use regex for more flexible matching
        let re = regex::Regex::new(r#"import\s*\(\s*["']virtual:///prerequisite-imports/[^"']*["']\s*\)"#).unwrap();
        patched = re.replace_all(&patched, "Promise.resolve({})").to_string();
    }

    patched.into_bytes()
}

/// @zh 根据文件扩展名获取 MIME 类型
/// @en Get MIME type based on file extension
fn get_mime_type(path: &std::path::Path) -> &'static str {
    match path.extension().and_then(|e| e.to_str()) {
        Some("html") => "text/html; charset=utf-8",
        Some("js") => "application/javascript; charset=utf-8",
        Some("mjs") => "application/javascript; charset=utf-8",
        Some("css") => "text/css; charset=utf-8",
        Some("json") => "application/json; charset=utf-8",
        Some("wasm") => "application/wasm",
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("gif") => "image/gif",
        Some("svg") => "image/svg+xml",
        Some("woff") => "font/woff",
        Some("woff2") => "font/woff2",
        Some("ttf") => "font/ttf",
        Some("map") => "application/json",
        Some("bin") => "application/octet-stream",
        _ => "application/octet-stream",
    }
}

/// @zh 在 egui UI 中渲染 WebView 占位区域
/// @en Render WebView placeholder area in egui UI
pub fn webview_viewport_area(
    ui: &mut egui::Ui,
    viewport: &mut WebViewViewport,
) -> egui::Response {
    let available = ui.available_rect_before_wrap();
    let response = ui.allocate_rect(available, egui::Sense::hover());

    // Update WebView bounds to match the allocated area
    viewport.set_bounds(available);

    // Draw placeholder if not ready
    if !viewport.is_ready() {
        ui.painter().rect_filled(available, 0.0, egui::Color32::from_rgb(0x1a, 0x1a, 0x1a));

        if let Some(error) = viewport.error() {
            // Error state
            ui.painter().text(
                available.center(),
                egui::Align2::CENTER_CENTER,
                format!("WebView Error: {}", error),
                egui::FontId::proportional(12.0),
                egui::Color32::from_rgb(0xff, 0x66, 0x66),
            );
        } else {
            // Loading state
            ui.painter().text(
                available.center(),
                egui::Align2::CENTER_CENTER,
                "Initializing WebView...",
                egui::FontId::proportional(12.0),
                egui::Color32::from_rgb(0x88, 0x88, 0x88),
            );
        }
    }

    response
}

/// @zh ccesengine 通信协议
/// @en ccesengine communication protocol
pub mod protocol {
    use serde::{Deserialize, Serialize};

    /// @zh 从 WebView 发送到 Rust 的消息
    /// @en Message from WebView to Rust
    #[derive(Debug, Serialize, Deserialize)]
    #[serde(tag = "type")]
    pub enum FromWebView {
        /// 引擎初始化完成
        EngineReady { version: String },
        /// 场景加载完成
        SceneLoaded { path: String, node_count: usize },
        /// 节点选择变化
        SelectionChanged { node_ids: Vec<String> },
        /// 变换更新
        TransformUpdated {
            node_id: String,
            position: [f32; 3],
            rotation: [f32; 3],
            scale: [f32; 3],
        },
        /// FPS 更新
        FpsUpdate { fps: f32 },
        /// 错误
        Error { message: String },
    }

    /// @zh 从 Rust 发送到 WebView 的消息
    /// @en Message from Rust to WebView
    #[derive(Debug, Serialize, Deserialize)]
    #[serde(tag = "type")]
    pub enum ToWebView {
        /// 加载场景
        LoadScene { path: String },
        /// 选择节点
        SelectNode { node_id: Option<String> },
        /// 设置变换
        SetTransform {
            node_id: String,
            position: Option<[f32; 3]>,
            rotation: Option<[f32; 3]>,
            scale: Option<[f32; 3]>,
        },
        /// 设置视口工具
        SetTool { tool: String },
        /// 播放/暂停
        SetPlayback { playing: bool, paused: bool },
        /// 重置相机
        ResetCamera,
        /// 切换网格显示
        SetGridVisible { visible: bool },
    }

    impl ToWebView {
        /// @zh 转换为 JavaScript 调用字符串
        /// @en Convert to JavaScript call string
        pub fn to_js_call(&self) -> String {
            let json = serde_json::to_string(self).unwrap_or_default();
            format!("window.__EGUI_BRIDGE__.receive({})", json)
        }
    }
}
