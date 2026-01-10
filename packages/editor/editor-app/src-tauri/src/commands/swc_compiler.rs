//! SWC-based TypeScript compiler with decorator support.
//! 基于 SWC 的 TypeScript 编译器，支持装饰器。
//!
//! Uses SWC CLI (@swc/cli) for compilation, similar to how we use esbuild.
//! 使用 SWC CLI (@swc/cli) 进行编译，类似于我们使用 esbuild 的方式。

use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;
use tauri::command;

/// SWC compilation options.
/// SWC 编译选项。
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SwcCompileOptions {
    /// Source code content | 源代码内容
    pub source: String,
    /// File path (for error reporting and extension detection) | 文件路径
    pub file_path: String,
    /// Project root for finding SWC | 项目根目录
    pub project_root: String,
    /// Whether to use legacy decorators | 是否使用旧版装饰器
    #[serde(default = "default_true")]
    pub legacy_decorators: bool,
    /// Whether to generate source map | 是否生成 source map
    #[serde(default)]
    pub source_map: bool,
    /// Module output type: "es6" or "commonjs" | 模块输出类型
    #[serde(default = "default_module_type")]
    pub module_type: String,
}

fn default_module_type() -> String {
    "es6".to_string()
}

fn default_true() -> bool {
    true
}

/// SWC compilation result.
/// SWC 编译结果。
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SwcCompileResult {
    /// Whether compilation succeeded | 是否编译成功
    pub success: bool,
    /// Compiled code (if successful) | 编译后的代码
    pub code: Option<String>,
    /// Source map (if requested and successful) | Source map
    pub source_map: Option<String>,
    /// Error message (if failed) | 错误信息
    pub error: Option<String>,
}

/// Batch compilation options.
/// 批量编译选项。
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SwcBatchCompileOptions {
    /// List of files to compile | 要编译的文件列表
    pub files: Vec<SwcFileInput>,
    /// Project root for finding SWC | 项目根目录
    pub project_root: String,
    /// Whether to use legacy decorators | 是否使用旧版装饰器
    #[serde(default = "default_true")]
    pub legacy_decorators: bool,
    /// Module output type: "es6" or "commonjs" | 模块输出类型
    #[serde(default = "default_module_type")]
    pub module_type: String,
}

/// File input for batch compilation.
/// 批量编译的文件输入。
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SwcFileInput {
    /// Source code content | 源代码内容
    pub source: String,
    /// File path | 文件路径
    pub file_path: String,
}

/// Batch compilation result.
/// 批量编译结果。
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SwcBatchCompileResult {
    /// Whether all compilations succeeded | 是否全部编译成功
    pub success: bool,
    /// Individual results | 单个结果
    pub results: Vec<SwcFileResult>,
}

/// Individual file result in batch compilation.
/// 批量编译中的单个文件结果。
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SwcFileResult {
    /// File path | 文件路径
    pub file_path: String,
    /// Whether compilation succeeded | 是否编译成功
    pub success: bool,
    /// Compiled code (if successful) | 编译后的代码
    pub code: Option<String>,
    /// Error message (if failed) | 错误信息
    pub error: Option<String>,
}

/// SWC environment check result.
/// SWC 环境检测结果。
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SwcEnvironmentResult {
    /// Whether SWC is available | SWC 是否可用
    pub available: bool,
    /// SWC version | SWC 版本
    pub version: Option<String>,
    /// How SWC was found | SWC 的来源
    pub source: Option<String>,
    /// Error message if not available | 错误信息
    pub error: Option<String>,
}

/// SWC execution info.
/// SWC 执行信息。
#[derive(Debug, Clone)]
struct SwcInfo {
    cmd: String,
    prefix_args: Vec<String>,
    source: String,
    version: String,
}

/// Check if SWC is available.
/// 检查 SWC 是否可用。
#[command]
pub async fn check_swc_environment(project_root: String) -> Result<SwcEnvironmentResult, String> {
    match find_swc_with_source(Some(&project_root)) {
        Ok(info) => Ok(SwcEnvironmentResult {
            available: true,
            version: Some(info.version),
            source: Some(info.source),
            error: None,
        }),
        Err(e) => Ok(SwcEnvironmentResult {
            available: false,
            version: None,
            source: None,
            error: Some(e),
        }),
    }
}

/// Install SWC locally in the project.
/// 在项目中本地安装 SWC。
#[command]
pub async fn install_swc(project_root: String) -> Result<(), String> {
    let npm_cmd = if cfg!(windows) { "npm.cmd" } else { "npm" };

    println!("[SWC] Installing @swc/cli and @swc/core in {}", project_root);

    let output = Command::new(npm_cmd)
        .args(&["install", "--save-dev", "@swc/cli", "@swc/core"])
        .current_dir(&project_root)
        .output()
        .map_err(|e| format!("Failed to run npm install | npm install 执行失败: {}", e))?;

    if output.status.success() {
        println!("[SWC] Installation successful");
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to install SWC | 安装 SWC 失败: {}", stderr))
    }
}

/// Compile TypeScript code using SWC CLI.
/// 使用 SWC CLI 编译 TypeScript 代码。
#[command]
pub async fn compile_with_swc(
    source: String,
    file_path: String,
    project_root: String,
    legacy_decorators: Option<bool>,
    source_map: Option<bool>,
    module_type: Option<String>,
) -> Result<SwcCompileResult, String> {
    let options = SwcCompileOptions {
        source,
        file_path,
        project_root,
        legacy_decorators: legacy_decorators.unwrap_or(true),
        source_map: source_map.unwrap_or(false),
        module_type: module_type.unwrap_or_else(|| "es6".to_string()),
    };
    compile_typescript_internal(&options)
}

/// Batch compile multiple TypeScript files.
/// 批量编译多个 TypeScript 文件。
#[command]
pub async fn batch_compile_with_swc(
    options: SwcBatchCompileOptions,
) -> Result<SwcBatchCompileResult, String> {
    let mut results = Vec::new();
    let mut all_success = true;

    for file in &options.files {
        let compile_options = SwcCompileOptions {
            source: file.source.clone(),
            file_path: file.file_path.clone(),
            project_root: options.project_root.clone(),
            legacy_decorators: options.legacy_decorators,
            source_map: false,
            module_type: options.module_type.clone(),
        };

        match compile_typescript_internal(&compile_options) {
            Ok(result) => {
                if !result.success {
                    all_success = false;
                }
                results.push(SwcFileResult {
                    file_path: file.file_path.clone(),
                    success: result.success,
                    code: result.code,
                    error: result.error,
                });
            }
            Err(e) => {
                all_success = false;
                results.push(SwcFileResult {
                    file_path: file.file_path.clone(),
                    success: false,
                    code: None,
                    error: Some(e),
                });
            }
        }
    }

    Ok(SwcBatchCompileResult {
        success: all_success,
        results,
    })
}

/// Find SWC CLI with source information.
/// 查找 SWC CLI 并返回来源信息。
fn find_swc_with_source(project_root: Option<&str>) -> Result<SwcInfo, String> {
    // 1. Check local node_modules/.bin/swc
    if let Some(root) = project_root {
        let local_swc = if cfg!(windows) {
            Path::new(root).join("node_modules").join(".bin").join("swc.cmd")
        } else {
            Path::new(root).join("node_modules").join(".bin").join("swc")
        };

        if local_swc.exists() {
            let path_str = local_swc.to_string_lossy().to_string();
            if let Ok(version) = get_swc_version(&path_str, &[]) {
                println!("[SWC] Found local swc: {}", path_str);
                return Ok(SwcInfo {
                    cmd: path_str,
                    prefix_args: vec![],
                    source: "local".to_string(),
                    version,
                });
            }
        }
    }

    // 2. Try pnpm exec swc
    if let Ok(version) = try_package_manager_swc("pnpm", &["exec", "swc", "--version"], project_root) {
        let cmd = if cfg!(windows) { "pnpm.cmd" } else { "pnpm" };
        println!("[SWC] Found swc via pnpm");
        return Ok(SwcInfo {
            cmd: cmd.to_string(),
            prefix_args: vec!["exec".to_string(), "swc".to_string()],
            source: "pnpm".to_string(),
            version,
        });
    }

    // 3. Try npx swc
    if let Ok(version) = try_package_manager_swc("npx", &["swc", "--version"], project_root) {
        let cmd = if cfg!(windows) { "npx.cmd" } else { "npx" };
        println!("[SWC] Found swc via npx");
        return Ok(SwcInfo {
            cmd: cmd.to_string(),
            prefix_args: vec!["swc".to_string()],
            source: "npx".to_string(),
            version,
        });
    }

    // 4. Try global swc
    let global_swc = if cfg!(windows) { "swc.cmd" } else { "swc" };
    if let Ok(version) = get_swc_version(global_swc, &[]) {
        println!("[SWC] Found global swc");
        return Ok(SwcInfo {
            cmd: global_swc.to_string(),
            prefix_args: vec![],
            source: "global".to_string(),
            version,
        });
    }

    Err("SWC not found. Install locally (pnpm add -D @swc/cli @swc/core) | 未找到 SWC，请安装 (pnpm add -D @swc/cli @swc/core)".to_string())
}

/// Try to get SWC version via package manager.
/// 尝试通过包管理器获取 SWC 版本。
fn try_package_manager_swc(cmd: &str, args: &[&str], project_root: Option<&str>) -> Result<String, String> {
    let cmd_name = if cfg!(windows) { format!("{}.cmd", cmd) } else { cmd.to_string() };

    let mut command = Command::new(&cmd_name);
    command.args(args);

    if let Some(root) = project_root {
        command.current_dir(root);
    }

    match command.output() {
        Ok(output) if output.status.success() => {
            let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
            Ok(version)
        }
        _ => Err(format!("{} swc not available", cmd))
    }
}

/// Get SWC version.
/// 获取 SWC 版本。
fn get_swc_version(swc_path: &str, prefix_args: &[String]) -> Result<String, String> {
    let mut args = prefix_args.to_vec();
    args.push("--version".to_string());

    let output = Command::new(swc_path)
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to run swc: {}", e))?;

    if output.status.success() {
        let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(version)
    } else {
        Err("swc --version failed".to_string())
    }
}

/// Internal compilation function using SWC CLI.
/// 使用 SWC CLI 的内部编译函数。
fn compile_typescript_internal(options: &SwcCompileOptions) -> Result<SwcCompileResult, String> {
    let swc_info = find_swc_with_source(Some(&options.project_root))?;

    // Create temporary files for input and output
    // 为输入和输出创建临时文件
    let temp_dir = std::env::temp_dir();
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let file_name = Path::new(&options.file_path)
        .file_name()
        .unwrap_or_default()
        .to_string_lossy();
    let temp_input = temp_dir.join(format!("swc_input_{}_{}", timestamp, file_name));
    let temp_output = temp_dir.join(format!("swc_output_{}_{}.js", timestamp, file_name));

    // Write source to temp file
    // 将源代码写入临时文件
    std::fs::write(&temp_input, &options.source)
        .map_err(|e| format!("Failed to write temp file | 写入临时文件失败: {}", e))?;

    // Build SWC arguments
    // 构建 SWC 参数
    let mut swc_args = swc_info.prefix_args.clone();
    swc_args.push(temp_input.to_string_lossy().to_string());

    // Output to temp file instead of stdout (fixes pnpm exec issue on Windows)
    // 输出到临时文件而不是 stdout（修复 Windows 上 pnpm exec 的问题）
    swc_args.push("--out-file".to_string());
    swc_args.push(temp_output.to_string_lossy().to_string());

    // Enable decorators with legacy mode for Cocos compatibility
    // 启用装饰器（旧版模式以兼容 Cocos）
    swc_args.push("--config".to_string());
    swc_args.push("jsc.parser.syntax=typescript".to_string());
    swc_args.push("--config".to_string());
    swc_args.push("jsc.parser.decorators=true".to_string());

    if options.legacy_decorators {
        swc_args.push("--config".to_string());
        swc_args.push("jsc.transform.legacyDecorator=true".to_string());
        swc_args.push("--config".to_string());
        swc_args.push("jsc.transform.decoratorMetadata=false".to_string());
    }

    // Set target
    swc_args.push("--config".to_string());
    swc_args.push("jsc.target=es2020".to_string());

    // Set module type (es6 or commonjs)
    // 设置模块类型
    swc_args.push("--config".to_string());
    swc_args.push(format!("module.type={}", options.module_type));

    // Handle TSX if needed
    if options.file_path.ends_with(".tsx") {
        swc_args.push("--config".to_string());
        swc_args.push("jsc.parser.tsx=true".to_string());
    }

    // Source map
    if options.source_map {
        swc_args.push("--source-maps".to_string());
        swc_args.push("inline".to_string());
    }

    // Run SWC
    let output = Command::new(&swc_info.cmd)
        .args(&swc_args)
        .current_dir(&options.project_root)
        .output()
        .map_err(|e| format!("Failed to run swc | 运行 swc 失败: {}", e))?;

    // Clean up input temp file
    let _ = std::fs::remove_file(&temp_input);

    if output.status.success() {
        // Read compiled code from output file
        // 从输出文件读取编译后的代码
        let code = std::fs::read_to_string(&temp_output)
            .map_err(|e| format!("Failed to read output file | 读取输出文件失败: {}", e))?;

        // Clean up output temp file
        let _ = std::fs::remove_file(&temp_output);

        println!("[SWC] Compilation successful for: {}", options.file_path);

        Ok(SwcCompileResult {
            success: true,
            code: Some(code),
            source_map: None,
            error: None,
        })
    } else {
        // Clean up output temp file if it exists
        let _ = std::fs::remove_file(&temp_output);

        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);

        println!("[SWC] Compilation failed for: {}", options.file_path);
        println!("[SWC] stderr: {}", stderr);
        println!("[SWC] stdout: {}", stdout);

        let error = if !stderr.is_empty() {
            stderr.to_string()
        } else if !stdout.is_empty() {
            stdout.to_string()
        } else {
            "Unknown compilation error".to_string()
        };

        Ok(SwcCompileResult {
            success: false,
            code: None,
            source_map: None,
            error: Some(error),
        })
    }
}
