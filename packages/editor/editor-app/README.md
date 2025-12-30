# ESEngine Editor

ESEngine 可视化编辑器，基于 Tauri 2.x + React 18 构建的跨平台桌面应用。

A cross-platform desktop visual editor built with Tauri 2.x + React 18.

## Prerequisites | 前置条件

Before running the editor, ensure you have the following installed:

运行编辑器前，请确保已安装以下环境：

- **Node.js** >= 18.x
- **pnpm** >= 10.x
- **Rust** >= 1.70 (for Tauri)
- **Platform-specific dependencies**:
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: `webkit2gtk`, `libgtk-3-dev`, `libappindicator3-dev` (see [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))

## Quick Start | 快速启动

### 1. Clone and Install | 克隆并安装

```bash
git clone https://github.com/esengine/esengine.git
cd esengine
pnpm install
```

### 2. Build Dependencies | 构建依赖

Build the required packages before running the editor:

在运行编辑器前，先构建所需的依赖包：

```bash
# Build all editor dependencies
pnpm --filter @esengine/editor-app... build
```

### 3. Run in Development Mode | 开发模式运行

```bash
cd packages/editor/editor-app
pnpm tauri:dev
```

This will:
1. Build the editor SDK (`@esengine/editor-runtime`)
2. Copy engine modules to the editor
3. Start Tauri in development mode with hot-reload

这将会：
1. 构建编辑器 SDK (`@esengine/editor-runtime`)
2. 复制引擎模块到编辑器
3. 以热重载的开发模式启动 Tauri

### 4. Build for Production | 生产构建

```bash
cd packages/editor/editor-app
pnpm tauri:build
```

The built application will be in `src-tauri/target/release/`.

构建的应用程序将位于 `src-tauri/target/release/` 目录。

## Available Scripts | 可用脚本

| Script | Description |
|--------|-------------|
| `pnpm tauri:dev` | Run editor in development mode with hot-reload |
| `pnpm tauri:build` | Build production application |
| `pnpm build` | Build web assets only (without Tauri) |
| `pnpm build:sdk` | Build editor-runtime SDK |
| `pnpm copy-modules` | Copy engine modules to editor |
| `pnpm bundle:runtime` | Bundle runtime for production |

## Project Structure | 项目结构

```
editor-app/
├── src/                    # React application source
│   ├── components/         # UI components
│   ├── panels/             # Editor panels (Hierarchy, Inspector, etc.)
│   ├── services/           # Core services
│   └── styles/             # CSS styles
├── src-tauri/              # Tauri (Rust) backend
│   ├── src/                # Rust source code
│   └── tauri.conf.json     # Tauri configuration
├── public/                 # Static assets
├── scripts/                # Build scripts
├── index.html              # Entry HTML
├── vite.config.ts          # Vite configuration
└── package.json
```

## Troubleshooting | 故障排除

### Build Errors | 构建错误

If you encounter build errors, try:

如果遇到构建错误，请尝试：

```bash
# Clean and rebuild all packages
pnpm clean
pnpm install
pnpm --filter @esengine/editor-app... build
```

### Rust/Tauri Errors | Rust/Tauri 错误

Ensure Rust toolchain is up to date:

确保 Rust 工具链是最新的：

```bash
rustup update
```

### Module Not Found | 模块未找到

If engine modules are not found, manually copy them:

如果找不到引擎模块，手动复制它们：

```bash
cd packages/editor/editor-app
pnpm copy-modules
```

## Documentation | 文档

- [ESEngine Documentation](https://esengine.cn/)
- [Tauri Documentation](https://tauri.app/)
- [React Documentation](https://react.dev/)

## License | 许可证

MIT License - see [LICENSE](../../../LICENSE) for details.
