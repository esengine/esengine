---
title: "Modules"
---

ESEngine provides a rich set of modules that can be imported as needed.

## Module List

### AI Modules

| Module | Package | Description |
|--------|---------|-------------|
| [Behavior Tree](/en/modules/behavior-tree/) | `@esengine/behavior-tree` | AI behavior tree with visual editor |
| [State Machine](/en/modules/fsm/) | `@esengine/fsm` | Finite state machine for character/AI states |

### Gameplay

| Module | Package | Description |
|--------|---------|-------------|
| [Timer](/en/modules/timer/) | `@esengine/timer` | Timer and cooldown system |
| [Spatial](/en/modules/spatial/) | `@esengine/spatial` | Spatial queries, AOI management |
| [Pathfinding](/en/modules/pathfinding/) | `@esengine/pathfinding` | A* pathfinding, NavMesh navigation |
| [World Streaming](/en/modules/world-streaming/) | `@esengine/world-streaming` | Chunk-based world streaming for open worlds |

### Tools

| Module | Package | Description |
|--------|---------|-------------|
| [Blueprint](/en/modules/blueprint/) | `@esengine/blueprint` | Visual scripting system |
| [Procgen](/en/modules/procgen/) | `@esengine/procgen` | Noise functions, random utilities |

### Network

| Module | Package | Description |
|--------|---------|-------------|
| [Network](/en/modules/network/) | `@esengine/network` | Multiplayer game networking |
| [Transaction](/en/modules/transaction/) | `@esengine/transaction` | Game transactions with distributed support |

### Database

| Module | Package | Description |
|--------|---------|-------------|
| [Database Drivers](/en/modules/database-drivers/) | `@esengine/database-drivers` | MongoDB, Redis connection management |
| [Database Repository](/en/modules/database/) | `@esengine/database` | Repository pattern data operations |

## Installation

All modules can be installed independently:

```bash
# Install a single module
npm install @esengine/behavior-tree

# Or use CLI to add to existing project
npx @esengine/cli add behavior-tree
```

## Platform Compatibility

All modules are pure TypeScript and compatible with:

- Cocos Creator 3.x
- Laya 3.x
- Node.js
- Browser
