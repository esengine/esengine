<h1 align="center">
  <img src="https://raw.githubusercontent.com/esengine/esengine/master/docs/public/logo.svg" alt="ESEngine" width="180">
  <br>
  ESEngine
</h1>

<p align="center">
  <strong>跨平台 2D 游戏引擎</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@esengine/ecs-framework"><img src="https://img.shields.io/npm/v/@esengine/ecs-framework?style=flat-square&color=blue" alt="npm"></a>
  <a href="https://github.com/esengine/esengine/actions"><img src="https://img.shields.io/github/actions/workflow/status/esengine/esengine/ci.yml?branch=master&style=flat-square" alt="build"></a>
  <a href="https://github.com/esengine/esengine/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license"></a>
  <a href="https://github.com/esengine/esengine/stargazers"><img src="https://img.shields.io/github/stars/esengine/esengine?style=flat-square" alt="stars"></a>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
</p>

<p align="center">
  <a href="./README.md">English</a> | <b>中文</b>
</p>

<p align="center">
  <a href="https://esengine.cn/">文档</a> ·
  <a href="https://esengine.cn/api/README">API 参考</a> ·
  <a href="https://github.com/esengine/esengine/releases">下载编辑器</a> ·
  <a href="./examples/">示例</a>
</p>

---

> **只需要 ECS？** 核心 ECS 框架 [`@esengine/ecs-framework`](./packages/core/) 可独立使用，支持 Cocos Creator、Laya 或任何 JS 引擎。[查看 ECS 文档](./packages/core/README_CN.md)

## 概述

ESEngine 是一款基于现代 Web 技术从零构建的跨平台 2D 游戏引擎。它提供完整的工具集，让开发者专注于游戏创作而非基础设施搭建。

一套代码即可导出到 Web 浏览器、微信小游戏等多个平台。

## 核心特性

| 特性 | 描述 |
|-----|------|
| **ECS 架构** | 数据驱动的实体-组件-系统模式，提供灵活且缓存友好的游戏逻辑 |
| **高性能渲染** | Rust/WebAssembly 2D 渲染器，支持自动精灵批处理和 WebGL 2.0 |
| **可视化编辑器** | 基于 Tauri 的跨平台桌面编辑器，支持场景管理和资源工作流 |
| **模块化设计** | 按需引入，每个功能都是独立的包 |
| **多平台导出** | 一套代码部署到 Web、微信小游戏等平台 |
| **物理集成** | 基于 Rapier 的 2D 物理，支持编辑器可视化 |
| **可视化脚本** | 行为树和蓝图系统，适合策划使用 |

## 技术栈

- **运行时**: TypeScript, Rust, WebAssembly
- **渲染器**: WebGL 2.0, WGPU (计划中)
- **编辑器**: Tauri, React, Zustand
- **物理**: Rapier2D
- **构建**: pnpm, Turborepo, Rollup

## 许可证

ESEngine **完全免费开源**，采用 [MIT 协议](LICENSE)。无版税，无附加条件。

## 安装

### npm

```bash
npm install @esengine/ecs-framework
```

### 编辑器

从 [Releases](https://github.com/esengine/esengine/releases) 页面下载预编译版本（支持 Windows、macOS）。

## 快速开始

```typescript
import {
    Core, Scene, Entity, Component, EntitySystem,
    Matcher, Time, ECSComponent, ECSSystem
} from '@esengine/ecs-framework';

@ECSComponent('Position')
class Position extends Component {
    x = 0;
    y = 0;
}

@ECSComponent('Velocity')
class Velocity extends Component {
    dx = 0;
    dy = 0;
}

@ECSSystem('Movement')
class MovementSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Position, Velocity));
    }

    protected process(entities: readonly Entity[]): void {
        for (const entity of entities) {
            const pos = entity.getComponent(Position);
            const vel = entity.getComponent(Velocity);
            pos.x += vel.dx * Time.deltaTime;
            pos.y += vel.dy * Time.deltaTime;
        }
    }
}

// 初始化
Core.create();
const scene = new Scene();
scene.addSystem(new MovementSystem());

const player = scene.createEntity('Player');
player.addComponent(new Position());
player.addComponent(new Velocity());

Core.setScene(scene);

// 游戏循环
function gameLoop(currentTime: number) {
    Core.update(currentTime / 1000);
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

## 模块

ESEngine 采用 Monorepo 组织，包含 50+ 个模块化包。按需引入即可。

### 核心安装

```bash
npm install @esengine/ecs-framework  # ECS 核心（可独立使用）
npm install @esengine/engine-core    # 完整引擎模块系统
```

### 常用模块

| 分类 | 包名 |
|------|------|
| **渲染** | `sprite`, `tilemap`, `particle`, `mesh-3d`, `fairygui` |
| **物理** | `physics-rapier2d` |
| **AI 逻辑** | `behavior-tree`, `blueprint` |
| **网络** | `network`, `network-server` |
| **平台** | `platform-web`, `platform-wechat` |

<details>
<summary><b>查看全部 50+ 个包</b></summary>

#### 核心
- `@esengine/ecs-framework` - ECS 框架核心
- `@esengine/math` - 向量、矩阵工具
- `@esengine/engine` - Rust/WASM 渲染器
- `@esengine/engine-core` - 模块生命周期

#### 运行时
- `@esengine/sprite` - 2D 精灵和动画
- `@esengine/tilemap` - 瓦片地图
- `@esengine/particle` - 粒子特效
- `@esengine/physics-rapier2d` - 2D 物理
- `@esengine/behavior-tree` - AI 行为树
- `@esengine/blueprint` - 可视化脚本
- `@esengine/camera` - 相机系统
- `@esengine/audio` - 音频播放
- `@esengine/fairygui` - FairyGUI 集成
- `@esengine/mesh-3d` - 3D 模型 (FBX/GLTF/OBJ)
- `@esengine/material-system` - 材质和着色器
- `@esengine/asset-system` - 资源管理
- `@esengine/world-streaming` - 大世界流式加载

#### 网络
- `@esengine/network` - 客户端 (TSRPC)
- `@esengine/network-server` - 服务端运行时
- `@esengine/network-protocols` - 共享协议

#### 编辑器扩展
所有运行时模块都有对应的 `-editor` 包用于可视化编辑。

#### 平台
- `@esengine/platform-common` - 平台抽象层
- `@esengine/platform-web` - Web 运行时
- `@esengine/platform-wechat` - 微信小游戏

</details>

## 编辑器

ESEngine 编辑器是基于 Tauri 和 React 构建的跨平台桌面应用。

### 功能

- 场景层级和实体管理
- 组件检视器，支持自定义属性编辑器
- 资源浏览器，支持拖放
- Tilemap 编辑器，支持绘制和填充工具
- 行为树可视化编辑器
- 蓝图可视化脚本
- 材质和着色器编辑
- 内置性能分析器
- 多语言支持（英文、中文）

### 截图

![ESEngine Editor](screenshots/main_screetshot.png)

## 平台支持

| 平台 | 运行时 | 编辑器 |
|------|:------:|:------:|
| Web 浏览器 | ✓ | - |
| Windows | - | ✓ |
| macOS | - | ✓ |
| 微信小游戏 | 开发中 | - |
| Playable 可玩广告 | 计划中 | - |
| Android | 计划中 | - |
| iOS | 计划中 | - |

## 从源码构建

### 前置要求

- Node.js 18+
- pnpm 10+
- Rust 工具链（用于 WASM 渲染器）
- wasm-pack

### 安装

```bash
git clone https://github.com/esengine/esengine.git
cd esengine

pnpm install
pnpm build

# 可选：构建 WASM 渲染器
pnpm build:wasm
```

### 运行编辑器

```bash
cd packages/editor-app
pnpm tauri:dev
```

### 项目结构

```
esengine/
├── packages/
│   ├── core/                    # ECS 框架 (@esengine/ecs-framework)
│   ├── math/                    # 数学库 (@esengine/math)
│   ├── engine-core/             # 引擎生命周期管理
│   ├── sprite/                  # 2D 精灵渲染
│   ├── tilemap/                 # Tilemap 系统
│   ├── physics-rapier2d/        # 物理引擎
│   ├── behavior-tree/           # AI 行为树
│   ├── editor-app/              # 桌面编辑器 (Tauri)
│   └── ...                      # 其他模块
├── docs/                        # 文档源码
├── examples/                    # 示例项目
├── scripts/                     # 构建工具
└── thirdparty/                  # 第三方依赖
```

> **寻找 ECS 源码？** ECS 框架位于 `packages/core/`

## 文档

- [快速入门](https://esengine.cn/guide/getting-started.html)
- [架构指南](https://esengine.cn/guide/)
- [API 参考](https://esengine.cn/api/README)

## 社区

- [Discord](https://discord.gg/gCAgzXFW) - 国际社区
- [QQ 交流群](https://jq.qq.com/?_wv=1027&k=29w1Nud6) - 中文社区
- [GitHub Issues](https://github.com/esengine/esengine/issues) - Bug 反馈和功能建议
- [GitHub Discussions](https://github.com/esengine/esengine/discussions) - 问题和想法

## 贡献

欢迎贡献代码。提交 PR 前请阅读贡献指南。

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交修改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 发起 Pull Request

## 许可证

ESEngine 基于 [MIT 协议](LICENSE) 开源。

---

<p align="center">
  由 ESEngine 团队用 ❤️ 打造
</p>
