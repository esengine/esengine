<h1 align="center">
  <img src="https://raw.githubusercontent.com/esengine/esengine/master/docs/public/logo.svg" alt="ESEngine" width="180">
  <br>
  ESEngine
</h1>

<p align="center">
  <strong>Modular Game Framework for TypeScript</strong>
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
  <a href="./examples/">Examples</a>
</p>

---

## What is ESEngine?

ESEngine is a collection of **engine-agnostic game development modules** for TypeScript. Use them with Cocos Creator, Laya, Phaser, PixiJS, or any JavaScript game engine.

The core is a high-performance **ECS (Entity-Component-System)** framework, accompanied by optional modules for AI, networking, physics, and more.

```bash
npm install @esengine/ecs-framework
```

## Features

| Module | Description | Engine Required |
|--------|-------------|:---------------:|
| **ECS Core** | Entity-Component-System framework with reactive queries | No |
| **Behavior Tree** | AI behavior trees with visual editor support | No |
| **Blueprint** | Visual scripting system | No |
| **FSM** | Finite state machine | No |
| **Timer** | Timer and cooldown systems | No |
| **Spatial** | Spatial indexing and queries (QuadTree, Grid) | No |
| **Pathfinding** | A* and navigation mesh pathfinding | No |
| **Procgen** | Procedural generation (noise, random, sampling) | No |
| **RPC** | High-performance RPC communication framework | No |
| **Server** | Game server framework with rooms, auth, rate limiting | No |
| **Network** | Client networking with prediction, AOI, delta compression | No |
| **Transaction** | Game transaction system with Redis/Memory storage | No |
| **World Streaming** | Open world chunk loading and streaming | No |

> All framework modules can be used standalone with any rendering engine.

## Quick Start

### Using CLI (Recommended)

The easiest way to add ECS to your existing project:

```bash
# In your project directory
npx @esengine/cli init
```

The CLI automatically detects your project type (Cocos Creator 2.x/3.x, LayaAir 3.x, or Node.js) and generates the necessary integration code.

### Manual Setup

```typescript
import {
    Core, Scene, Entity, Component, EntitySystem,
    Matcher, Time, ECSComponent, ECSSystem
} from '@esengine/ecs-framework';

// Define components (data only)
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

// Define system (logic)
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

// Integrate with your game loop
function gameLoop(currentTime: number) {
    Core.update(currentTime / 1000);
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

## Using with Other Engines

ESEngine's framework modules are designed to work alongside your preferred rendering engine:

### With Cocos Creator

```typescript
import { Component as CCComponent, _decorator } from 'cc';
import { Core, Scene, Matcher, EntitySystem } from '@esengine/ecs-framework';
import { BehaviorTreeExecutionSystem } from '@esengine/behavior-tree';

const { ccclass } = _decorator;

@ccclass('GameManager')
export class GameManager extends CCComponent {
    private ecsScene!: Scene;

    start() {
        Core.create();
        this.ecsScene = new Scene();

        // Add ECS systems
        this.ecsScene.addSystem(new BehaviorTreeExecutionSystem());
        this.ecsScene.addSystem(new MyGameSystem());

        Core.setScene(this.ecsScene);
    }

    update(dt: number) {
        Core.update(dt);
    }
}
```

### With Laya 3.x

```typescript
import { Core, Scene } from '@esengine/ecs-framework';
import { FSMSystem } from '@esengine/fsm';

const { regClass } = Laya;

@regClass()
export class ECSManager extends Laya.Script {
    private ecsScene = new Scene();

    onAwake(): void {
        Core.create();
        this.ecsScene.addSystem(new FSMSystem());
        Core.setScene(this.ecsScene);
    }

    onUpdate(): void {
        Core.update(Laya.timer.delta / 1000);
    }

    onDestroy(): void {
        Core.destroy();
    }
}
```

## Packages

### Framework (Engine-Agnostic)

These packages have **zero rendering dependencies** and work with any engine:

```bash
npm install @esengine/ecs-framework      # Core ECS
npm install @esengine/behavior-tree      # AI behavior trees
npm install @esengine/blueprint          # Visual scripting
npm install @esengine/fsm                # State machines
npm install @esengine/timer              # Timers & cooldowns
npm install @esengine/spatial            # Spatial indexing
npm install @esengine/pathfinding        # Pathfinding
npm install @esengine/procgen            # Procedural generation
npm install @esengine/rpc                # RPC framework
npm install @esengine/server             # Game server
npm install @esengine/network            # Client networking
npm install @esengine/transaction        # Transaction system
npm install @esengine/world-streaming    # World streaming
```

### ESEngine Runtime (Optional)

If you want a complete engine solution with rendering:

| Category | Packages |
|----------|----------|
| **Core** | `engine-core`, `asset-system`, `material-system` |
| **Rendering** | `sprite`, `tilemap`, `particle`, `camera`, `mesh-3d` |
| **Physics** | `physics-rapier2d` |
| **Platform** | `platform-web`, `platform-wechat` |

### Editor (Optional)

A visual editor built with Tauri for scene management:

- Download from [Releases](https://github.com/esengine/esengine/releases)
- [Build from source](./packages/editor/editor-app/README.md)
- Supports behavior tree editing, tilemap painting, visual scripting

## Project Structure

```
esengine/
├── packages/
│   ├── framework/          # Engine-agnostic modules (NPM publishable)
│   │   ├── core/          # ECS Framework
│   │   ├── math/          # Math utilities
│   │   ├── behavior-tree/ # AI behavior trees
│   │   ├── blueprint/     # Visual scripting
│   │   ├── fsm/           # Finite state machine
│   │   ├── timer/         # Timer system
│   │   ├── spatial/       # Spatial queries
│   │   ├── pathfinding/   # Pathfinding
│   │   ├── procgen/       # Procedural generation
│   │   ├── rpc/           # RPC framework
│   │   ├── server/        # Game server
│   │   ├── network/       # Client networking
│   │   ├── transaction/   # Transaction system
│   │   └── world-streaming/ # World streaming
│   │
│   ├── engine/            # ESEngine runtime
│   ├── rendering/         # Rendering modules
│   ├── physics/           # Physics modules
│   ├── editor/            # Visual editor
│   └── rust/              # WASM renderer
│
├── docs/                   # Documentation
└── examples/               # Examples
```

## Building from Source

```bash
git clone https://github.com/esengine/esengine.git
cd esengine

pnpm install
pnpm build

# Type check framework packages
pnpm type-check:framework

# Run tests
pnpm test
```

## Documentation

- [ECS Framework Guide](./packages/framework/core/README.md)
- [Behavior Tree Guide](./packages/framework/behavior-tree/README.md)
- [Editor Setup Guide](./packages/editor/editor-app/README.md) ([中文](./packages/editor/editor-app/README_CN.md))
- [API Reference](https://esengine.cn/api/README)

## Community

- [GitHub Issues](https://github.com/esengine/esengine/issues) - Bug reports and feature requests
- [GitHub Discussions](https://github.com/esengine/esengine/discussions) - Questions and ideas
- [Discord](https://discord.gg/gCAgzXFW) - Chat with the community

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ESEngine is licensed under the [MIT License](LICENSE). Free for personal and commercial use.

---

<p align="center">
  Made with care by the ESEngine community
</p>
