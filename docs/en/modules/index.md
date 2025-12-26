# Modules

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

### Tools

| Module | Package | Description |
|--------|---------|-------------|
| [Blueprint](/en/modules/blueprint/) | `@esengine/blueprint` | Visual scripting system |
| [Procgen](/en/modules/procgen/) | `@esengine/procgen` | Noise functions, random utilities |

### Network

| Module | Package | Description |
|--------|---------|-------------|
| [Network](/en/modules/network/) | `@esengine/network` | Multiplayer game networking |

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
