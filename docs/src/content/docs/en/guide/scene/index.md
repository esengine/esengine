---
title: "Scene"
description: "Core container of ECS framework, managing entity, system and component lifecycles"
---

In the ECS architecture, a Scene is a container for the game world, responsible for managing the lifecycle of entities, systems, and components.

## Core Features

Scene is the core container of the ECS framework, providing:
- Entity creation, management, and destruction
- System registration and execution scheduling
- Component storage and querying
- Event system support
- Performance monitoring and debugging information

## Scene Management Options

ECS Framework provides two scene management approaches:

| Manager | Use Case | Features |
|---------|----------|----------|
| **SceneManager** | 95% of games | Lightweight, scene transitions |
| **WorldManager** | MMO servers, room systems | Multi-World, full isolation |

## Quick Start

### Inherit Scene Class

```typescript
import { Scene, EntitySystem } from '@esengine/ecs-framework';

class GameScene extends Scene {
  protected initialize(): void {
    this.name = "GameScene";

    // Add systems
    this.addSystem(new MovementSystem());
    this.addSystem(new RenderSystem());

    // Create initial entities
    const player = this.createEntity("Player");
    player.addComponent(new Position(400, 300));
    player.addComponent(new Health(100));
  }

  public onStart(): void {
    console.log("Game scene started");
  }

  public unload(): void {
    console.log("Game scene unloaded");
  }
}
```

### Using Scene Configuration

```typescript
import { ISceneConfig } from '@esengine/ecs-framework';

const config: ISceneConfig = {
  name: "MainGame",
  enableEntityDirectUpdate: false
};

class ConfiguredScene extends Scene {
  constructor() {
    super(config);
  }
}
```

### Running a Scene

```typescript
import { Core, SceneManager } from '@esengine/ecs-framework';

Core.create({ debug: true });
const sceneManager = Core.services.resolve(SceneManager);
sceneManager.setScene(new GameScene());
```

## Next Steps

- [Lifecycle](./lifecycle/) - Scene lifecycle methods
- [Entity Management](./entity-management/) - Create, find, destroy entities
- [System Management](./system-management/) - System control
- [Events](./events/) - Scene event communication
- [Debugging](./debugging/) - Performance and debugging
- [Best Practices](./best-practices/) - Scene design patterns
