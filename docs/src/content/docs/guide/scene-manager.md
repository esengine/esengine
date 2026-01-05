---
title: "场景管理器"
---

# SceneManager

SceneManager 是 ECS Framework 提供的轻量级场景管理器，适用于 95% 的游戏应用。它提供简单直观的 API，支持场景切换和延迟加载。

## 适用场景

SceneManager 适用于：
- 单人游戏
- 简单多人游戏
- 移动游戏
- 需要场景切换的游戏（菜单、游戏、暂停等）
- 不需要多 World 隔离的项目

## 功能特性

- 轻量级，零额外开销
- 简单直观的 API
- 支持延迟场景切换（避免在帧中途切换）
- 自动 ECS 流式 API 管理
- 自动场景生命周期处理
- 与 Core 集成，自动更新
- 支持 [持久实体](/guide/persistent-entity/) 跨场景迁移（v2.3.0+）

## 基本用法

### 推荐：使用 Core 的静态方法

这是最简单且推荐的方式，适用于大多数应用：

```typescript
import { Core, Scene } from '@esengine/ecs-framework';

// 1. 初始化 Core
Core.create({ debug: true });

// 2. 创建并设置场景
class GameScene extends Scene {
  protected initialize(): void {
    this.name = "GameScene";

    // 添加系统
    this.addSystem(new MovementSystem());
    this.addSystem(new RenderSystem());

    // 创建初始实体
    const player = this.createEntity("Player");
    player.addComponent(new Transform(400, 300));
    player.addComponent(new Health(100));
  }

  public onStart(): void {
    console.log("游戏场景已启动");
  }
}

// 3. 设置场景
Core.setScene(new GameScene());

// 4. 游戏循环（Core.update 自动更新场景）
function gameLoop(deltaTime: number) {
  Core.update(deltaTime);  // 自动更新所有服务和场景
}

// Laya 引擎集成
Laya.timer.frameLoop(1, this, () => {
  const deltaTime = Laya.timer.delta / 1000;
  Core.update(deltaTime);
});

// Cocos Creator 集成
update(deltaTime: number) {
  Core.update(deltaTime);
}
```

### 进阶：直接使用 SceneManager

如果需要更多控制，可以直接使用 SceneManager：

```typescript
import { Core, SceneManager, Scene } from '@esengine/ecs-framework';

// 初始化 Core
Core.create({ debug: true });

// 获取 SceneManager（已由 Core 自动创建并注册）
const sceneManager = Core.services.resolve(SceneManager);

// 设置场景
const gameScene = new GameScene();
sceneManager.setScene(gameScene);

// 游戏循环（仍然使用 Core.update）
function gameLoop(deltaTime: number) {
  Core.update(deltaTime);  // Core 自动调用 sceneManager.update()
}
```

**重要提示**：无论使用哪种方式，在游戏循环中只需调用 `Core.update()`。它会自动更新 SceneManager 和场景。无需手动调用 `sceneManager.update()`。

## 场景切换

### 立即切换

使用 `Core.setScene()` 或 `sceneManager.setScene()` 立即切换场景：

```typescript
// 方法 1：使用 Core（推荐）
Core.setScene(new MenuScene());

// 方法 2：使用 SceneManager
const sceneManager = Core.services.resolve(SceneManager);
sceneManager.setScene(new MenuScene());
```

### 延迟切换

使用 `Core.loadScene()` 或 `sceneManager.loadScene()` 进行延迟场景切换，在下一帧生效：

```typescript
// 方法 1：使用 Core（推荐）
Core.loadScene(new GameOverScene());

// 方法 2：使用 SceneManager
const sceneManager = Core.services.resolve(SceneManager);
sceneManager.loadScene(new GameOverScene());
```

在 System 中切换场景时，使用延迟切换：

```typescript
class GameOverSystem extends EntitySystem {
  process(entities: readonly Entity[]): void {
    const player = entities.find(e => e.name === 'Player');
    const health = player?.getComponent(Health);

    if (health && health.value <= 0) {
      // 延迟切换到游戏结束场景（下一帧生效）
      Core.loadScene(new GameOverScene());
      // 当前帧继续执行，不会中断当前系统处理
    }
  }
}
```

## API 参考

### Core 静态方法（推荐）

#### Core.setScene()

立即切换场景。

```typescript
public static setScene<T extends IScene>(scene: T): T
```

**参数**:
- `scene` - 要设置的场景实例

**返回值**:
- 返回设置的场景实例

**示例**:
```typescript
const gameScene = Core.setScene(new GameScene());
console.log(gameScene.name);
```

#### Core.loadScene()

延迟场景加载（下一帧切换）。

```typescript
public static loadScene<T extends IScene>(scene: T): void
```

**参数**:
- `scene` - 要加载的场景实例

**示例**:
```typescript
Core.loadScene(new GameOverScene());
```

#### Core.scene

获取当前活动场景。

```typescript
public static get scene(): IScene | null
```

**返回值**:
- 当前场景实例，如果没有场景则返回 null

**示例**:
```typescript
const currentScene = Core.scene;
if (currentScene) {
  console.log(`当前场景: ${currentScene.name}`);
}
```

### SceneManager 方法（进阶）

如果需要直接使用 SceneManager，通过服务容器获取：

```typescript
const sceneManager = Core.services.resolve(SceneManager);
```

#### setScene()

立即切换场景。

```typescript
public setScene<T extends IScene>(scene: T): T
```

#### loadScene()

延迟场景加载。

```typescript
public loadScene<T extends IScene>(scene: T): void
```

#### currentScene

获取当前场景。

```typescript
public get currentScene(): IScene | null
```

#### hasScene

检查是否有活动场景。

```typescript
public get hasScene(): boolean
```

#### hasPendingScene

检查是否有待处理的场景切换。

```typescript
public get hasPendingScene(): boolean
```

## 最佳实践

### 1. 使用 Core 的静态方法

```typescript
// 推荐：使用 Core 的静态方法
Core.setScene(new GameScene());
Core.loadScene(new MenuScene());
const currentScene = Core.scene;

// 不推荐：除非有特殊需求，否则不要直接使用 SceneManager
const sceneManager = Core.services.resolve(SceneManager);
sceneManager.setScene(new GameScene());
```

### 2. 只调用 Core.update()

```typescript
// 正确：只调用 Core.update()
function gameLoop(deltaTime: number) {
  Core.update(deltaTime);  // 自动更新所有服务和场景
}

// 错误：不要手动调用 sceneManager.update()
function gameLoop(deltaTime: number) {
  Core.update(deltaTime);
  sceneManager.update();  // 重复更新，会导致问题！
}
```

### 3. 使用延迟切换避免问题

在 System 中切换场景时，使用 `loadScene()` 而不是 `setScene()`：

```typescript
// 推荐：延迟切换
class HealthSystem extends EntitySystem {
  process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const health = entity.getComponent(Health);
      if (health.value <= 0) {
        Core.loadScene(new GameOverScene());
        // 当前帧继续处理其他实体
      }
    }
  }
}

// 不推荐：立即切换可能导致问题
class HealthSystem extends EntitySystem {
  process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const health = entity.getComponent(Health);
      if (health.value <= 0) {
        Core.setScene(new GameOverScene());
        // 场景立即切换，当前帧其他实体可能无法正确处理
      }
    }
  }
}
```

### 4. 场景职责分离

每个场景应该只负责一个特定的游戏状态：

```typescript
// 好的设计 - 职责清晰
class MenuScene extends Scene {
  // 只处理菜单相关逻辑
}

class GameScene extends Scene {
  // 只处理游戏逻辑
}

class PauseScene extends Scene {
  // 只处理暂停界面逻辑
}

// 避免这种设计 - 职责混杂
class MegaScene extends Scene {
  // 包含菜单、游戏、暂停和所有其他逻辑
}
```

### 5. 资源管理

在场景的 `unload()` 方法中清理资源：

```typescript
class GameScene extends Scene {
  private textures: Map<string, any> = new Map();
  private sounds: Map<string, any> = new Map();

  protected initialize(): void {
    this.loadResources();
  }

  private loadResources(): void {
    this.textures.set('player', loadTexture('player.png'));
    this.sounds.set('bgm', loadSound('bgm.mp3'));
  }

  public unload(): void {
    // 清理资源
    this.textures.clear();
    this.sounds.clear();
    console.log('场景资源已清理');
  }
}
```

### 6. 事件驱动的场景切换

使用事件系统触发场景切换，保持代码解耦：

```typescript
class GameScene extends Scene {
  protected initialize(): void {
    // 监听场景切换事件
    this.eventSystem.on('goto:menu', () => {
      Core.loadScene(new MenuScene());
    });

    this.eventSystem.on('goto:gameover', (data) => {
      Core.loadScene(new GameOverScene());
    });
  }
}

// 在 System 中触发事件
class GameLogicSystem extends EntitySystem {
  process(entities: readonly Entity[]): void {
    if (levelComplete) {
      this.scene.eventSystem.emitSync('goto:gameover', {
        score: 1000,
        level: 5
      });
    }
  }
}
```

## 架构概览

SceneManager 在 ECS Framework 中的位置：

```
Core（全局服务）
  └── SceneManager（场景管理，自动更新）
      └── Scene（当前场景）
          ├── EntitySystem（系统）
          ├── Entity（实体）
          └── Component（组件）
```

## 与 WorldManager 的比较

| 特性 | SceneManager | WorldManager |
|------|--------------|--------------|
| 适用场景 | 95% 的游戏应用 | 高级多世界隔离场景 |
| 复杂度 | 简单 | 复杂 |
| 场景数量 | 单场景（可切换） | 多个 World，每个包含多个场景 |
| 性能开销 | 最小 | 较高 |
| 使用方式 | `Core.setScene()` | `worldManager.createWorld()` |

**何时使用 SceneManager**：
- 单人游戏
- 简单多人游戏
- 移动游戏
- 需要切换但不需要同时运行的场景

**何时使用 WorldManager**：
- MMO 游戏服务器（每个房间一个 World）
- 游戏大厅系统（每个游戏房间完全隔离）
- 需要运行多个完全独立的游戏实例

## 相关文档

- [持久实体](/guide/persistent-entity/) - 了解如何在场景切换时保持实体

SceneManager 为大多数游戏提供了简单而强大的场景管理能力。通过 Core 的静态方法，你可以轻松管理场景切换。
