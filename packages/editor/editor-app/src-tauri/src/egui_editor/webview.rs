//! @zh WebView2 视口集成模块
//! @en WebView2 viewport integration module
//!
//! 提供在 egui 窗口中嵌入 WebView2 来渲染 ccesengine 内容。
//! Provides embedding WebView2 in egui window to render ccesengine content.

use eframe::egui;
use raw_window_handle::RawWindowHandle;
use wry::{WebView, WebViewBuilder};

/// @zh WebView2 视口状态
/// @en WebView2 viewport state
pub struct WebViewViewport {
    webview: Option<WebView>,
    bounds: egui::Rect,
    url: String,
    ready: bool,
    error: Option<String>,
}

impl WebViewViewport {
    /// @zh 创建新的 WebView2 视口
    /// @en Create a new WebView2 viewport
    pub fn new(url: impl Into<String>) -> Self {
        Self {
            webview: None,
            bounds: egui::Rect::NOTHING,
            url: url.into(),
            ready: false,
            error: None,
        }
    }

    /// @zh 初始化 WebView（需要在有窗口句柄后调用）
    /// @en Initialize WebView (must be called after window handle is available)
    #[cfg(target_os = "windows")]
    pub fn initialize(&mut self, window_handle: RawWindowHandle) {
        use raw_window_handle::RawWindowHandle::Win32;

        if self.webview.is_some() {
            return;
        }

        match window_handle {
            Win32(handle) => {
                let _hwnd = handle.hwnd;

                // Create WebView2
                let result = WebViewBuilder::new()
                    .with_url(&self.url)
                    .with_transparent(true)
                    .with_visible(true)
                    .with_bounds(wry::Rect {
                        position: wry::dpi::Position::Logical(wry::dpi::LogicalPosition::new(
                            self.bounds.left() as f64,
                            self.bounds.top() as f64,
                        )),
                        size: wry::dpi::Size::Logical(wry::dpi::LogicalSize::new(
                            self.bounds.width() as f64,
                            self.bounds.height() as f64,
                        )),
                    })
                    .with_ipc_handler(|msg| {
                        // Handle IPC messages from the WebView
                        println!("[WebView IPC] {}", msg.body());
                    })
                    .build_as_child(unsafe { &wry::raw_window_handle::WindowHandle::borrow_raw(window_handle) });

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
    pub fn initialize(&mut self, _window_handle: RawWindowHandle) {
        self.error = Some("WebView2 integration is only supported on Windows".to_string());
    }

    /// @zh 更新视口边界
    /// @en Update viewport bounds
    pub fn set_bounds(&mut self, bounds: egui::Rect) {
        if self.bounds == bounds {
            return;
        }

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
}

impl Drop for WebViewViewport {
    fn drop(&mut self) {
        // WebView will be cleaned up automatically
        self.webview = None;
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
