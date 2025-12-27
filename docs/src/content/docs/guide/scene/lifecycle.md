---
title: "场景生命周期"
description: "场景的生命周期方法和执行顺序"
---

场景提供了完整的生命周期管理，确保资源正确初始化和清理。

## 生命周期方法

```typescript
class ExampleScene extends Scene {
  protected initialize(): void {
    // 1. 场景初始化：设置系统和初始实体
    console.log("场景初始化");
  }

  public onStart(): void {
    // 2. 场景开始运行：游戏逻辑开始执行
    console.log("场景开始运行");
  }

  public update(deltaTime: number): void {
    // 3. 每帧更新（由场景管理器调用）
  }

  public unload(): void {
    // 4. 场景卸载：清理资源
    console.log("场景卸载");
  }
}
```

## 执行顺序

| 阶段 | 方法 | 说明 |
|------|------|------|
| 初始化 | `initialize()` | 设置系统和初始实体 |
| 开始 | `begin()` / `onStart()` | 场景开始运行 |
| 更新 | `update()` | 每帧更新（框架自动调用） |
| 结束 | `end()` / `unload()` | 场景卸载，清理资源 |

## 生命周期示例

```typescript
class GameScene extends Scene {
  private resourcesLoaded = false;

  protected initialize(): void {
    this.name = "GameScene";

    // 1. 添加系统（按依赖顺序）
    this.addSystem(new InputSystem());
    this.addSystem(new MovementSystem());
    this.addSystem(new RenderSystem());

    // 2. 创建初始实体
    this.createPlayer();
    this.createEnemies();

    // 3. 设置事件监听
    this.setupEvents();
  }

  public onStart(): void {
    this.resourcesLoaded = true;
    console.log("场景资源加载完成，游戏开始");
  }

  public unload(): void {
    // 清理事件监听
    this.eventSystem.clear();

    // 清理其他资源
    this.resourcesLoaded = false;
    console.log("场景资源已清理");
  }

  private createPlayer(): void {
    const player = this.createEntity("Player");
    player.addComponent(new Position(400, 300));
  }

  private createEnemies(): void {
    for (let i = 0; i < 5; i++) {
      const enemy = this.createEntity(`Enemy_${i}`);
      enemy.addComponent(new Position(Math.random() * 800, Math.random() * 600));
    }
  }

  private setupEvents(): void {
    this.eventSystem.on('player_died', () => {
      console.log('玩家死亡');
    });
  }
}
```

## 注意事项

1. **initialize() 只调用一次** - 用于设置初始状态
2. **onStart() 在场景激活时调用** - 可能多次调用（如场景切换）
3. **unload() 必须清理资源** - 避免内存泄漏
4. **update() 由框架管理** - 不需要手动调用
