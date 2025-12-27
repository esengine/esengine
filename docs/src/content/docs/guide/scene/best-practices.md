---
title: "最佳实践"
description: "场景设计模式和完整示例"
---

## 场景职责分离

```typescript
// 好的场景设计 - 职责清晰
class MenuScene extends Scene {
  // 只处理菜单相关逻辑
}

class GameScene extends Scene {
  // 只处理游戏玩法逻辑
}

class InventoryScene extends Scene {
  // 只处理物品栏逻辑
}

// 避免的场景设计 - 职责混乱
class MegaScene extends Scene {
  // 包含菜单、游戏、物品栏等所有逻辑 ❌
}
```

## 资源管理

```typescript
class ResourceScene extends Scene {
  private textures: Map<string, any> = new Map();
  private sounds: Map<string, any> = new Map();

  protected initialize(): void {
    this.loadResources();
  }

  private loadResources(): void {
    this.textures.set('player', this.loadTexture('player.png'));
    this.sounds.set('bgm', this.loadSound('bgm.mp3'));
  }

  public unload(): void {
    // 清理资源
    this.textures.clear();
    this.sounds.clear();
    console.log('场景资源已清理');
  }

  private loadTexture(path: string): any { return null; }
  private loadSound(path: string): any { return null; }
}
```

## 初始化顺序

```typescript
class ProperInitScene extends Scene {
  protected initialize(): void {
    // 1. 首先设置场景配置
    this.name = "GameScene";

    // 2. 然后添加系统（按依赖顺序）
    this.addSystem(new InputSystem());
    this.addSystem(new MovementSystem());
    this.addSystem(new PhysicsSystem());
    this.addSystem(new RenderSystem());

    // 3. 最后创建实体
    this.createEntities();

    // 4. 设置事件监听
    this.setupEvents();
  }

  private createEntities(): void { /* ... */ }
  private setupEvents(): void { /* ... */ }
}
```

## 完整示例

```typescript
import { Scene, EntitySystem, Entity, Matcher } from '@esengine/ecs-framework';

// 定义组件
class Transform {
  constructor(public x: number, public y: number) {}
}

class Velocity {
  constructor(public vx: number, public vy: number) {}
}

class Health {
  constructor(public value: number) {}
}

// 定义系统
class MovementSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Transform, Velocity));
  }

  process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const transform = entity.getComponent(Transform);
      const velocity = entity.getComponent(Velocity);

      if (transform && velocity) {
        transform.x += velocity.vx;
        transform.y += velocity.vy;
      }
    }
  }
}

// 定义场景
class GameScene extends Scene {
  protected initialize(): void {
    this.name = "GameScene";

    // 添加系统
    this.addSystem(new MovementSystem());

    // 创建玩家
    const player = this.createEntity("Player");
    player.addComponent(new Transform(400, 300));
    player.addComponent(new Velocity(0, 0));
    player.addComponent(new Health(100));

    // 创建敌人
    for (let i = 0; i < 5; i++) {
      const enemy = this.createEntity(`Enemy_${i}`);
      enemy.addComponent(new Transform(
        Math.random() * 800,
        Math.random() * 600
      ));
      enemy.addComponent(new Velocity(
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      ));
      enemy.addComponent(new Health(50));
    }

    // 设置事件监听
    this.eventSystem.on('player_died', () => {
      console.log('玩家死亡！');
    });
  }

  public onStart(): void {
    console.log('游戏场景启动');
  }

  public unload(): void {
    console.log('游戏场景卸载');
    this.eventSystem.clear();
  }
}

// 使用场景
import { Core, SceneManager } from '@esengine/ecs-framework';

Core.create({ debug: true });
const sceneManager = Core.services.resolve(SceneManager);
sceneManager.setScene(new GameScene());
```

## 设计原则

| 原则 | 说明 |
|------|------|
| 单一职责 | 每个场景只负责一个游戏状态 |
| 资源清理 | 在 `unload()` 中清理所有资源 |
| 系统顺序 | 按输入→逻辑→渲染顺序添加系统 |
| 事件解耦 | 使用事件系统进行场景内通信 |
| 初始化分层 | 配置→系统→实体→事件的初始化顺序 |
