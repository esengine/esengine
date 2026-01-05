---
title: "持久实体"
---

# 持久实体

> **版本**: v2.3.0+

持久实体是一种特殊类型的实体，在场景切换时会自动迁移到新场景。适用于需要跨场景保持状态的游戏对象，如玩家、游戏管理器、音频管理器等。

## 基本概念

在 ECS 框架中，实体有两种生命周期策略：

| 策略 | 描述 | 默认 |
|------|------|------|
| `SceneLocal` | 场景局部实体，场景切换时销毁 | ✓ |
| `Persistent` | 持久实体，场景切换时自动迁移 | |

## 快速开始

### 创建持久实体

```typescript
import { Scene } from '@esengine/ecs-framework';

class GameScene extends Scene {
  protected initialize(): void {
    // 创建持久玩家实体
    const player = this.createEntity('Player').setPersistent();
    player.addComponent(new Position(100, 200));
    player.addComponent(new PlayerData('Hero', 500));

    // 创建普通敌人实体（场景切换时销毁）
    const enemy = this.createEntity('Enemy');
    enemy.addComponent(new Position(300, 200));
    enemy.addComponent(new EnemyAI());
  }
}
```

### 场景切换时的行为

```typescript
import { Core, Scene } from '@esengine/ecs-framework';

// 初始场景
class Level1Scene extends Scene {
  protected initialize(): void {
    // 玩家 - 持久实体，将迁移到下一个场景
    const player = this.createEntity('Player').setPersistent();
    player.addComponent(new Position(0, 0));
    player.addComponent(new Health(100));

    // 敌人 - 场景局部实体，场景切换时销毁
    const enemy = this.createEntity('Enemy');
    enemy.addComponent(new Position(100, 100));
  }
}

// 目标场景
class Level2Scene extends Scene {
  protected initialize(): void {
    // 新敌人
    const enemy = this.createEntity('Boss');
    enemy.addComponent(new Position(200, 200));
  }

  public onStart(): void {
    // 玩家已自动迁移到此场景
    const player = this.findEntity('Player');
    console.log(player !== null); // true

    // 位置和生命值数据完整保留
    const position = player?.getComponent(Position);
    const health = player?.getComponent(Health);
    console.log(position?.x, position?.y); // 0, 0
    console.log(health?.value); // 100
  }
}

// 切换场景
Core.create({ debug: true });
Core.setScene(new Level1Scene());

// 稍后切换到 Level2
Core.loadScene(new Level2Scene());
// 玩家实体自动迁移，敌人实体被销毁
```

## API 参考

### 实体方法

#### setPersistent()

将实体标记为持久实体，防止在场景切换时被销毁。

```typescript
public setPersistent(): this
```

**返回值**: 返回实体本身，支持链式调用

**示例**:
```typescript
const player = scene.createEntity('Player')
  .setPersistent();

player.addComponent(new Position(100, 200));
```

#### setSceneLocal()

将实体恢复为场景局部策略（默认）。

```typescript
public setSceneLocal(): this
```

**返回值**: 返回实体本身，支持链式调用

**示例**:
```typescript
// 动态取消持久性
player.setSceneLocal();
```

#### isPersistent

检查实体是否为持久实体。

```typescript
public get isPersistent(): boolean
```

**示例**:
```typescript
if (entity.isPersistent) {
  console.log('这是一个持久实体');
}
```

#### lifecyclePolicy

获取实体的生命周期策略。

```typescript
public get lifecyclePolicy(): EEntityLifecyclePolicy
```

**示例**:
```typescript
import { EEntityLifecyclePolicy } from '@esengine/ecs-framework';

if (entity.lifecyclePolicy === EEntityLifecyclePolicy.Persistent) {
  console.log('持久实体');
}
```

### 场景方法

#### findPersistentEntities()

查找场景中所有持久实体。

```typescript
public findPersistentEntities(): Entity[]
```

**返回值**: 持久实体数组

**示例**:
```typescript
const persistentEntities = scene.findPersistentEntities();
console.log(`场景中有 ${persistentEntities.length} 个持久实体`);
```

#### extractPersistentEntities()

提取并移除场景中所有持久实体（通常由框架内部调用）。

```typescript
public extractPersistentEntities(): Entity[]
```

**返回值**: 被提取的持久实体数组

#### receiveMigratedEntities()

接收迁移的实体（通常由框架内部调用）。

```typescript
public receiveMigratedEntities(entities: Entity[]): void
```

**参数**:
- `entities` - 要接收的实体数组

## 使用场景

### 1. 跨关卡的玩家实体

```typescript
class PlayerSetupScene extends Scene {
  protected initialize(): void {
    // 玩家在所有关卡中保持状态
    const player = this.createEntity('Player').setPersistent();
    player.addComponent(new Transform(0, 0));
    player.addComponent(new Health(100));
    player.addComponent(new Inventory());
    player.addComponent(new PlayerStats());
  }
}

class Level1 extends Scene { /* ... */ }
class Level2 extends Scene { /* ... */ }
class Level3 extends Scene { /* ... */ }

// 玩家实体在所有关卡之间自动迁移
Core.setScene(new PlayerSetupScene());
// ... 游戏进行
Core.loadScene(new Level1());
// ... 关卡完成
Core.loadScene(new Level2());
// 玩家数据（生命值、背包、属性）完整保留
```

### 2. 全局管理器

```typescript
class BootstrapScene extends Scene {
  protected initialize(): void {
    // 音频管理器 - 跨场景持久
    const audioManager = this.createEntity('AudioManager').setPersistent();
    audioManager.addComponent(new AudioController());

    // 成就管理器 - 跨场景持久
    const achievementManager = this.createEntity('AchievementManager').setPersistent();
    achievementManager.addComponent(new AchievementTracker());

    // 游戏设置 - 跨场景持久
    const settings = this.createEntity('GameSettings').setPersistent();
    settings.addComponent(new SettingsData());
  }
}
```

### 3. 动态切换持久性

```typescript
class GameScene extends Scene {
  protected initialize(): void {
    // 初始创建为普通实体
    const companion = this.createEntity('Companion');
    companion.addComponent(new Transform(0, 0));
    companion.addComponent(new CompanionAI());

    // 监听招募事件
    this.eventSystem.on('companion:recruited', () => {
      // 招募后变为持久实体
      companion.setPersistent();
      console.log('同伴加入队伍，将跟随玩家跨场景');
    });

    // 监听解散事件
    this.eventSystem.on('companion:dismissed', () => {
      // 解散后恢复为场景局部实体
      companion.setSceneLocal();
      console.log('同伴离开队伍，不再跨场景持久');
    });
  }
}
```

## 最佳实践

### 1. 明确标识持久实体

```typescript
// 推荐：创建时立即标记
const player = this.createEntity('Player').setPersistent();

// 不推荐：创建后再标记（容易遗忘）
const player = this.createEntity('Player');
// ... 大量代码 ...
player.setPersistent(); // 容易忘记
```

### 2. 合理使用持久性

```typescript
// ✓ 适合持久化的实体
const player = this.createEntity('Player').setPersistent();      // 玩家
const gameManager = this.createEntity('GameManager').setPersistent(); // 全局管理器
const audioManager = this.createEntity('AudioManager').setPersistent(); // 音频系统

// ✗ 不应该持久化的实体
const bullet = this.createEntity('Bullet'); // 临时对象
const enemy = this.createEntity('Enemy');   // 关卡特定敌人
const particle = this.createEntity('Particle'); // 特效粒子
```

### 3. 检查迁移的实体

```typescript
class NewScene extends Scene {
  public onStart(): void {
    // 检查预期的持久实体是否存在
    const player = this.findEntity('Player');
    if (!player) {
      console.error('玩家实体未正确迁移！');
      // 处理错误情况
    }
  }
}
```

### 4. 避免循环引用

```typescript
// ✗ 避免：持久实体引用场景局部实体
class BadScene extends Scene {
  protected initialize(): void {
    const player = this.createEntity('Player').setPersistent();
    const enemy = this.createEntity('Enemy');

    // 危险：player 是持久的但 enemy 不是
    // 场景切换后，enemy 被销毁，引用变为无效
    player.addComponent(new TargetComponent(enemy));
  }
}

// ✓ 推荐：使用 ID 引用或事件系统
class GoodScene extends Scene {
  protected initialize(): void {
    const player = this.createEntity('Player').setPersistent();
    const enemy = this.createEntity('Enemy');

    // 存储 ID 而非直接引用
    player.addComponent(new TargetComponent(enemy.id));

    // 或使用事件系统通信
  }
}
```

## 重要说明

1. **已销毁的实体不会迁移**：如果实体在场景切换前被销毁，即使标记为持久也不会迁移。

2. **组件数据完整保留**：迁移过程中所有组件及其状态都会被保留。

3. **场景引用会更新**：迁移后，实体的 `scene` 属性将指向新场景。

4. **查询系统会更新**：迁移的实体会自动注册到新场景的查询系统中。

5. **延迟切换同样有效**：使用 `Core.loadScene()` 进行延迟切换时，持久实体同样会迁移。

## 相关文档

- [场景](/guide/scene/) - 了解场景基础知识
- [场景管理器](/guide/scene-manager/) - 了解场景切换
