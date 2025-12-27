---
title: "事件系统"
description: "场景内置的类型安全事件系统"
---

场景内置了类型安全的事件系统，用于场景内的解耦通信。

## 基本用法

### 监听事件

```typescript
class EventScene extends Scene {
  protected initialize(): void {
    // 监听事件
    this.eventSystem.on('player_died', this.onPlayerDied.bind(this));
    this.eventSystem.on('enemy_spawned', this.onEnemySpawned.bind(this));
    this.eventSystem.on('level_complete', this.onLevelComplete.bind(this));
  }

  private onPlayerDied(data: any): void {
    console.log('玩家死亡事件');
  }

  private onEnemySpawned(data: any): void {
    console.log('敌人生成事件');
  }

  private onLevelComplete(data: any): void {
    console.log('关卡完成事件');
  }
}
```

### 发送事件

```typescript
public triggerGameEvent(): void {
  // 同步发送事件
  this.eventSystem.emitSync('custom_event', {
    message: "这是自定义事件",
    timestamp: Date.now()
  });

  // 异步发送事件
  this.eventSystem.emit('async_event', {
    data: "异步事件数据"
  });
}
```

## API 参考

| 方法 | 说明 |
|------|------|
| `on(event, callback)` | 监听事件 |
| `once(event, callback)` | 监听一次（自动取消订阅） |
| `off(event, callback)` | 取消监听 |
| `emitSync(event, data)` | 同步发送事件 |
| `emit(event, data)` | 异步发送事件 |
| `clear()` | 清除所有事件监听 |

## 事件处理规范

### 集中管理事件监听

```typescript
class EventHandlingScene extends Scene {
  protected initialize(): void {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventSystem.on('game_pause', this.onGamePause.bind(this));
    this.eventSystem.on('game_resume', this.onGameResume.bind(this));
    this.eventSystem.on('player_input', this.onPlayerInput.bind(this));
  }

  private onGamePause(): void {
    // 暂停游戏逻辑
    this.systems.forEach(system => {
      if (system instanceof GameLogicSystem) {
        system.enabled = false;
      }
    });
  }

  private onGameResume(): void {
    // 恢复游戏逻辑
    this.systems.forEach(system => {
      if (system instanceof GameLogicSystem) {
        system.enabled = true;
      }
    });
  }

  private onPlayerInput(data: any): void {
    // 处理玩家输入
  }
}
```

### 清理事件监听

在场景卸载时清理事件监听，避免内存泄漏：

```typescript
public unload(): void {
  // 清理所有事件监听
  this.eventSystem.clear();
}
```

## 使用场景

| 场景 | 示例事件 |
|------|----------|
| 游戏状态 | `game_start`, `game_pause`, `game_over` |
| 玩家行为 | `player_died`, `player_jump`, `player_attack` |
| 敌人行为 | `enemy_spawned`, `enemy_killed` |
| 关卡进度 | `level_start`, `level_complete` |
| UI 交互 | `button_click`, `menu_open` |
