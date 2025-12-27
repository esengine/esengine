---
title: "Services & Systems"
description: "Register services and add systems in plugins"
---

## Registering Services

Plugins can register their own services to the service container:

```typescript
import { IService } from '@esengine/ecs-framework';

class NetworkService implements IService {
  connect(url: string) {
    console.log(`Connecting to ${url}`);
  }

  dispose(): void {
    console.log('Network service disposed');
  }
}

class NetworkPlugin implements IPlugin {
  readonly name = 'network-plugin';
  readonly version = '1.0.0';

  install(core: Core, services: ServiceContainer): void {
    // Register network service
    services.registerSingleton(NetworkService);

    // Resolve and use service
    const network = services.resolve(NetworkService);
    network.connect('ws://localhost:8080');
  }

  uninstall(): void {
    // Service container will auto-call service's dispose method
  }
}
```

## Service Registration Methods

| Method | Description |
|--------|-------------|
| `registerSingleton(Type)` | Register singleton service |
| `registerInstance(Type, instance)` | Register existing instance |
| `registerTransient(Type)` | Create new instance per resolve |

## Adding Systems

Plugins can add custom systems to scenes:

```typescript
import { EntitySystem, Matcher } from '@esengine/ecs-framework';

class PhysicsSystem extends EntitySystem {
  constructor() {
    super(Matcher.empty().all(PhysicsBody));
  }

  protected process(entities: readonly Entity[]): void {
    // Physics simulation logic
  }
}

class PhysicsPlugin implements IPlugin {
  readonly name = 'physics-plugin';
  readonly version = '1.0.0';
  private physicsSystem?: PhysicsSystem;

  install(core: Core, services: ServiceContainer): void {
    const scene = core.scene;
    if (scene) {
      this.physicsSystem = new PhysicsSystem();
      scene.addSystem(this.physicsSystem);
    }
  }

  uninstall(): void {
    // Remove system
    if (this.physicsSystem) {
      const scene = Core.scene;
      if (scene) {
        scene.removeSystem(this.physicsSystem);
      }
      this.physicsSystem = undefined;
    }
  }
}
```

## Combined Usage

```typescript
class GamePlugin implements IPlugin {
  readonly name = 'game-plugin';
  readonly version = '1.0.0';
  private systems: EntitySystem[] = [];

  install(core: Core, services: ServiceContainer): void {
    // 1. Register services
    services.registerSingleton(ScoreService);
    services.registerSingleton(AudioService);

    // 2. Add systems
    const scene = core.scene;
    if (scene) {
      const systems = [
        new InputSystem(),
        new MovementSystem(),
        new ScoringSystem()
      ];

      systems.forEach(system => {
        scene.addSystem(system);
        this.systems.push(system);
      });
    }
  }

  uninstall(): void {
    // Remove all systems
    const scene = Core.scene;
    if (scene) {
      this.systems.forEach(system => {
        scene.removeSystem(system);
      });
    }
    this.systems = [];
  }
}
```
