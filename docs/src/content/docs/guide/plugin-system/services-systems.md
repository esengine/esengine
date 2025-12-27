---
title: "服务与系统"
description: "在插件中注册服务和添加系统"
---

## 注册服务

插件可以向服务容器注册自己的服务：

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
    // 注册网络服务
    services.registerSingleton(NetworkService);

    // 解析并使用服务
    const network = services.resolve(NetworkService);
    network.connect('ws://localhost:8080');
  }

  uninstall(): void {
    // 服务容器会自动调用服务的dispose方法
  }
}
```

## 服务注册方式

| 方法 | 说明 |
|------|------|
| `registerSingleton(Type)` | 注册单例服务 |
| `registerInstance(Type, instance)` | 注册现有实例 |
| `registerTransient(Type)` | 每次解析创建新实例 |

## 添加系统

插件可以向场景添加自定义系统：

```typescript
import { EntitySystem, Matcher } from '@esengine/ecs-framework';

class PhysicsSystem extends EntitySystem {
  constructor() {
    super(Matcher.empty().all(PhysicsBody));
  }

  protected process(entities: readonly Entity[]): void {
    // 物理模拟逻辑
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
    // 移除系统
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

## 组合使用

```typescript
class GamePlugin implements IPlugin {
  readonly name = 'game-plugin';
  readonly version = '1.0.0';
  private systems: EntitySystem[] = [];

  install(core: Core, services: ServiceContainer): void {
    // 1. 注册服务
    services.registerSingleton(ScoreService);
    services.registerSingleton(AudioService);

    // 2. 添加系统
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
    // 移除所有系统
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
