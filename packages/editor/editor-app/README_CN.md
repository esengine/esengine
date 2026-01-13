# ESEngine 编辑器

基于 Tauri 2.x + egui（Rust 原生 UI）构建的跨平台桌面可视化编辑器。

## 架构说明

编辑器采用混合架构：
- **UI 界面**：egui（Rust 原生即时模式 GUI）
- **视口渲染**：WebView + ccesengine（Cocos Creator 引擎分支）
- **系统集成**：Tauri 2.x

## 环境要求

运行编辑器前，请确保已安装以下环境：

- **Node.js** >= 18.x
- **pnpm** >= 10.x
- **Rust** >= 1.70 (Tauri 和 WASM 构建需要)
- **wasm-pack** (构建 Rapier2D 物理引擎需要)
- **平台相关依赖**：
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: 参考 [Tauri 环境配置](https://tauri.app/v1/guides/getting-started/prerequisites)

### 安装 wasm-pack

```bash
# 使用 cargo 安装
cargo install wasm-pack

# 或使用官方安装脚本 (Linux/macOS)
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

## 快速开始

### 1. 克隆并安装

```bash
git clone https://github.com/esengine/esengine.git
cd esengine
pnpm install
```

### 2. 构建 ccesengine

编辑器使用 ccesengine 进行视口渲染。同步引擎资源：

```bash
cd packages/editor/editor-app
pnpm sync:ccesengine
```

或从源码构建：

```bash
pnpm build:ccesengine
```

### 3. 构建视口

视口是运行在 WebView 中的 TypeScript 项目：

```bash
pnpm build:viewport
```

### 4. 启动编辑器

```bash
pnpm tauri:dev
```

或使用组合命令：

```bash
pnpm dev
```

## 可用脚本

| 脚本 | 说明 |
|------|------|
| `pnpm dev` | 构建视口并以开发模式运行编辑器 |
| `pnpm build` | 构建视口并创建生产版本应用 |
| `pnpm tauri:dev` | 开发模式运行编辑器 |
| `pnpm tauri:build` | 构建生产版本应用 |
| `pnpm sync:ccesengine` | 从 engine 子模块同步 ccesengine |
| `pnpm build:ccesengine` | 构建并同步 ccesengine |
| `pnpm build:viewport` | 构建视口 TypeScript 代码 |

## 项目结构

```
editor-app/
├── @types/                 # 类型定义 (cc.d.ts)
├── public/                 # 静态资源
│   ├── ccesengine/         # 引擎 ESM 模块（同步自 engine）
│   ├── engine-assets/      # 着色器块、特效、材质
│   └── esbuild.wasm        # 脚本编译 WASM
├── scripts/                # 构建脚本
│   ├── sync-ccesengine.mjs # 同步引擎
│   └── bundle-runtime.mjs  # 打包 ESEngine 运行时
├── src-tauri/              # Tauri/Rust 应用
│   ├── assets/             # 运行时资源 (viewport.js, cocos-cli)
│   ├── src/
│   │   ├── bin/            # 二进制入口
│   │   ├── commands/       # Tauri IPC 命令
│   │   └── egui_editor/    # egui UI 实现
│   └── Cargo.toml
└── viewport/               # WebView 视口 (TypeScript)
    ├── src/                # 视口源码
    └── vite.config.ts      # 构建到 src-tauri/assets/
```

## 故障排除

### 引擎资源缺失

**错误**：缺少 ccesengine 文件

**解决方案**：
```bash
# 初始化 engine 子模块
git submodule update --init engine

# 同步引擎资源
pnpm sync:ccesengine
```

### 构建错误

```bash
pnpm clean
pnpm install
pnpm build
```

### Rust/Tauri 错误

```bash
rustup update
```

## 文档

- [ESEngine 文档](https://esengine.cn/)
- [Tauri 文档](https://tauri.app/)
- [egui 文档](https://docs.rs/egui/)

## 许可证

MIT License
