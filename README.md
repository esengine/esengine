<h1 align="center">
  <img src="https://raw.githubusercontent.com/esengine/esengine/master/docs/public/logo.svg" alt="ESEngine" width="180">
  <br>
  ESEngine
</h1>

<p align="center">
  <strong>Cross-platform 2D Game Engine</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@esengine/ecs-framework"><img src="https://img.shields.io/npm/v/@esengine/ecs-framework?style=flat-square&color=blue" alt="npm"></a>
  <a href="https://github.com/esengine/esengine/actions"><img src="https://img.shields.io/github/actions/workflow/status/esengine/esengine/ci.yml?branch=master&style=flat-square" alt="build"></a>
  <a href="https://github.com/esengine/esengine/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license"></a>
  <a href="https://github.com/esengine/esengine/stargazers"><img src="https://img.shields.io/github/stars/esengine/esengine?style=flat-square" alt="stars"></a>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
</p>

<p align="center">
  <b>English</b> | <a href="./README_CN.md">中文</a>
</p>

<p align="center">
  <a href="https://esengine.cn/">Documentation</a> ·
  <a href="https://esengine.cn/api/README">API Reference</a> ·
  <a href="https://github.com/esengine/esengine/releases">Download Editor</a> ·
  <a href="./examples/">Examples</a>
</p>

---

> **Just need ECS?** The core ECS framework [`@esengine/ecs-framework`](./packages/framework/core/) can be used standalone with Cocos Creator, Laya, or any JS engine. [View ECS Documentation](./packages/framework/core/README.md)

## Overview

ESEngine is a cross-platform 2D game engine built from the ground up with modern web technologies. It provides a comprehensive toolset that enables developers to focus on creating games rather than building infrastructure.

Export your games to multiple platforms including web browsers, WeChat Mini Games, and other mini-game platforms from a single codebase.

## Key Features

| Feature | Description |
|---------|-------------|
| **ECS Architecture** | Data-driven Entity-Component-System pattern for flexible and cache-friendly game logic |
| **High-Performance Rendering** | Rust/WebAssembly 2D renderer with automatic sprite batching and WebGL 2.0 backend |
| **Visual Editor** | Cross-platform desktop editor built with Tauri for scene management and asset workflows |
| **Modular Design** | Import only what you need - each feature is a standalone package |
| **Multi-Platform Export** | Deploy to Web, WeChat Mini Games, and more from one codebase |
| **Physics Integration** | 2D physics powered by Rapier with editor visualization |
| **Visual Scripting** | Behavior trees and blueprint system for designers |

## Tech Stack

- **Runtime**: TypeScript, Rust, WebAssembly
- **Renderer**: WebGL 2.0, WGPU (planned)
- **Editor**: Tauri, React, Zustand
- **Physics**: Rapier2D
- **Build**: pnpm, Turborepo, Rollup

## License

ESEngine is **free and open source** under the [MIT License](LICENSE). No royalties, no strings attached.

## Installation

### npm

```bash
npm install @esengine/ecs-framework
```

### Editor

Download pre-built binaries from the [Releases](https://github.com/esengine/esengine/releases) page (Windows, macOS).

## Quick Start

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

// Initialize
Core.create();
const scene = new Scene();
scene.addSystem(new MovementSystem());

const player = scene.createEntity('Player');
player.addComponent(new Position());
player.addComponent(new Velocity());

Core.setScene(scene);

// Game loop
function gameLoop(currentTime: number) {
    Core.update(currentTime / 1000);
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

## Packages

ESEngine is organized as a monorepo with 50+ modular packages. Install only what you need.

### Essential

```bash
npm install @esengine/ecs-framework  # Core ECS (can be used standalone)
npm install @esengine/engine-core    # Full engine with module system
```

### Popular Modules

| Category | Packages |
|----------|----------|
| **Rendering** | `sprite`, `tilemap`, `particle`, `mesh-3d`, `fairygui` |
| **Physics** | `physics-rapier2d` |
| **AI & Logic** | `behavior-tree`, `blueprint` |
| **Network** | `network`, `network-server` |
| **Platform** | `platform-web`, `platform-wechat` |

<details>
<summary><b>View all 50+ packages</b></summary>

#### Core
- `@esengine/ecs-framework` - ECS framework core
- `@esengine/math` - Vector, matrix utilities
- `@esengine/engine` - Rust/WASM renderer
- `@esengine/engine-core` - Module lifecycle

#### Runtime
- `@esengine/sprite` - 2D sprites & animation
- `@esengine/tilemap` - Tile-based maps
- `@esengine/particle` - Particle effects
- `@esengine/physics-rapier2d` - 2D physics
- `@esengine/behavior-tree` - AI behavior trees
- `@esengine/blueprint` - Visual scripting
- `@esengine/camera` - Camera system
- `@esengine/audio` - Audio playback
- `@esengine/fairygui` - FairyGUI integration
- `@esengine/mesh-3d` - 3D mesh (FBX/GLTF/OBJ)
- `@esengine/material-system` - Materials & shaders
- `@esengine/asset-system` - Asset management
- `@esengine/world-streaming` - Large world streaming

#### Network
- `@esengine/network` - Client (TSRPC)
- `@esengine/network-server` - Server runtime
- `@esengine/network-protocols` - Shared protocols

#### Editor Extensions
All runtime modules have corresponding `-editor` packages for visual editing.

#### Platform
- `@esengine/platform-common` - Platform abstraction
- `@esengine/platform-web` - Web runtime
- `@esengine/platform-wechat` - WeChat Mini Game

</details>

## Editor

The ESEngine Editor is a cross-platform desktop application built with Tauri and React.

### Features

- Scene hierarchy and entity management
- Component inspector with custom property editors
- Asset browser with drag-and-drop
- Tilemap editor with paint and fill tools
- Behavior tree visual editor
- Blueprint visual scripting
- Material and shader editing
- Built-in performance profiler
- Localization (English, Chinese)

### Screenshot

![ESEngine Editor](screenshots/main_screetshot.png)

## Platform Support

| Platform | Runtime | Editor |
|----------|:-------:|:------:|
| Web Browser | ✓ | - |
| Windows | - | ✓ |
| macOS | - | ✓ |
| WeChat Mini Game | In Progress | - |
| Playable Ads | Planned | - |
| Android | Planned | - |
| iOS | Planned | - |

## Building from Source

### Prerequisites

- Node.js 18+
- pnpm 10+
- Rust toolchain (for WASM renderer)
- wasm-pack

### Setup

```bash
git clone https://github.com/esengine/esengine.git
cd esengine

pnpm install
pnpm build

# Optional: Build WASM renderer
pnpm build:wasm
```

### Run Editor

```bash
cd packages/editor/editor-app
pnpm tauri:dev
```

### Project Structure

```
esengine/
├── packages/
│   ├── framework/               # Generic frameworks (use with Laya/Cocos/etc.)
│   │   ├── core/               # ECS Framework (@esengine/ecs-framework)
│   │   ├── math/               # Math library
│   │   ├── behavior-tree/      # AI behavior trees
│   │   ├── blueprint/          # Visual scripting
│   │   ├── fsm/                # Finite state machine
│   │   └── ...                 # More standalone modules
│   │
│   ├── engine/                  # ESEngine runtime (requires WASM renderer)
│   │   ├── engine-core/        # Engine lifecycle
│   │   ├── asset-system/       # Asset management
│   │   └── ...
│   │
│   ├── rendering/               # Rendering modules
│   │   ├── sprite/             # 2D sprites
│   │   ├── tilemap/            # Tilemaps
│   │   └── ...
│   │
│   ├── physics/                 # Physics modules
│   │   └── physics-rapier2d/   # Rapier2D physics
│   │
│   ├── editor/                  # Editor (Tauri + React)
│   │   ├── editor-app/         # Desktop app
│   │   ├── editor-core/        # Editor framework
│   │   └── plugins/            # Editor plugins
│   │
│   └── rust/                    # Rust/WASM engine
│       └── engine/             # Rendering engine
│
├── docs/                        # Documentation
├── examples/                    # Examples
└── scripts/                     # Build utilities
```

> **Looking for ECS source code?** The ECS framework is in `packages/framework/core/`

## Documentation

- [Getting Started](https://esengine.cn/guide/getting-started.html)
- [Architecture Guide](https://esengine.cn/guide/)
- [API Reference](https://esengine.cn/api/README)

## Community

- [Discord](https://discord.gg/gCAgzXFW) - Chat with the community
- [GitHub Issues](https://github.com/esengine/esengine/issues) - Bug reports and feature requests
- [GitHub Discussions](https://github.com/esengine/esengine/discussions) - Questions and ideas

## Contributing

Contributions are welcome. Please read the contributing guidelines before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ESEngine is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by the ESEngine team
</p>
