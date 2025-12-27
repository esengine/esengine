---
title: "场景"
description: "ECS框架的核心容器，管理实体、系统和组件的生命周期"
---

在 ECS 架构中，场景（Scene）是游戏世界的容器，负责管理实体、系统和组件的生命周期。场景提供了完整的 ECS 运行环境。

## 核心功能

场景是 ECS 框架的核心容器，提供：
- 实体的创建、管理和销毁
- 系统的注册和执行调度
- 组件的存储和查询
- 事件系统支持
- 性能监控和调试信息

## 场景管理方式

ECS Framework 提供了两种场景管理方式：

| 管理器 | 适用场景 | 特点 |
|--------|----------|------|
| **SceneManager** | 95% 的游戏应用 | 轻量级，支持场景切换 |
| **WorldManager** | MMO 服务器、房间系统 | 多 World 管理，完全隔离 |

## 快速开始

### 继承 Scene 类

```typescript
import { Scene, EntitySystem } from '@esengine/ecs-framework';

class GameScene extends Scene {
  protected initialize(): void {
    this.name = "GameScene";

    // 添加系统
    this.addSystem(new MovementSystem());
    this.addSystem(new RenderSystem());

    // 创建初始实体
    const player = this.createEntity("Player");
    player.addComponent(new Position(400, 300));
    player.addComponent(new Health(100));
  }

  public onStart(): void {
    console.log("游戏场景已启动");
  }

  public unload(): void {
    console.log("游戏场景已卸载");
  }
}
```

### 使用场景配置

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

### 运行场景

```typescript
import { Core, SceneManager } from '@esengine/ecs-framework';

Core.create({ debug: true });
const sceneManager = Core.services.resolve(SceneManager);
sceneManager.setScene(new GameScene());
```

## 下一步

- [生命周期](./lifecycle/) - 场景生命周期方法
- [实体管理](./entity-management/) - 创建、查找、销毁实体
- [系统管理](./system-management/) - 系统添加与控制
- [事件系统](./events/) - 场景内事件通信
- [调试与监控](./debugging/) - 性能分析和调试
- [最佳实践](./best-practices/) - 场景设计模式
