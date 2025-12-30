# ESEngine 编辑器

基于 Tauri 2.x + React 18 构建的跨平台桌面可视化编辑器。

## 环境要求

运行编辑器前，请确保已安装以下环境：

- **Node.js** >= 18.x
- **pnpm** >= 10.x
- **Rust** >= 1.70 (Tauri 需要)
- **平台相关依赖**：
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: 参考 [Tauri 环境配置](https://tauri.app/v1/guides/getting-started/prerequisites)

## 快速开始

### 1. 克隆并安装

```bash
git clone https://github.com/esengine/esengine.git
cd esengine
pnpm install
```

### 2. 克隆物理依赖（可选）

如果需要物理引擎支持，需要克隆 rapier.js 依赖：

```bash
git clone https://github.com/esengine/rapier.js.git packages/thirdparty/rapier.js
```

### 3. 构建依赖

在项目根目录执行：

```bash
pnpm build:editor
```

### 4. 启动编辑器

```bash
cd packages/editor/editor-app
pnpm tauri:dev
```

## 可用脚本

| 脚本 | 说明 |
|------|------|
| `pnpm tauri:dev` | 开发模式运行编辑器（支持热重载）|
| `pnpm tauri:build` | 构建生产版本应用 |
| `pnpm build:sdk` | 构建 editor-runtime SDK |

## 项目结构

```
editor-app/
├── src/                    # React 应用源码
│   ├── components/         # UI 组件
│   ├── panels/             # 编辑器面板
│   └── services/           # 核心服务
├── src-tauri/              # Tauri (Rust) 后端
├── public/                 # 静态资源
└── scripts/                # 构建脚本
```

## 常见问题

### 构建错误

```bash
pnpm clean
pnpm install
pnpm build:editor
```

### Rust/Tauri 错误

```bash
rustup update
```

## 文档

- [ESEngine 文档](https://esengine.cn/)
- [Tauri 文档](https://tauri.app/)

## 许可证

MIT License
