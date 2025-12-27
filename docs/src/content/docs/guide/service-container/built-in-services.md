---
title: "内置服务"
description: "Core 自动注册的内置服务"
---

Core 在初始化时自动注册了以下内置服务：

## TimerManager

定时器管理器，负责管理所有游戏定时器：

```typescript
const timerManager = Core.services.resolve(TimerManager);

// 创建定时器
timerManager.schedule(1.0, false, null, (timer) => {
    console.log('1秒后执行');
});
```

## PerformanceMonitor

性能监控器，监控游戏性能：

```typescript
const monitor = Core.services.resolve(PerformanceMonitor);

// 启用性能监控
monitor.enable();

// 获取性能数据
const fps = monitor.getFPS();
```

## SceneManager

场景管理器，管理单场景应用的场景生命周期：

```typescript
const sceneManager = Core.services.resolve(SceneManager);

// 设置当前场景
sceneManager.setScene(new GameScene());

// 获取当前场景
const currentScene = sceneManager.currentScene;

// 延迟切换场景
sceneManager.loadScene(new MenuScene());
```

## WorldManager

世界管理器，管理多个独立的 World 实例（高级用例）：

```typescript
const worldManager = Core.services.resolve(WorldManager);

// 创建独立的游戏世界
const gameWorld = worldManager.createWorld('game_room_001', {
  name: 'GameRoom',
  maxScenes: 5
});

// 在World中创建场景
const scene = gameWorld.createScene('battle', new BattleScene());
gameWorld.setSceneActive('battle', true);

// 更新所有World
worldManager.updateAll();
```

**适用场景**:
- **SceneManager**: 适用于 95% 的游戏（单人游戏、简单多人游戏）
- **WorldManager**: 适用于 MMO 服务器、游戏房间系统等需要完全隔离的多世界应用

## PoolManager

对象池管理器：

```typescript
const poolManager = Core.services.resolve(PoolManager);

// 创建对象池
const bulletPool = poolManager.createPool('bullets', () => new Bullet(), 100);
```

## PluginManager

插件管理器，管理插件的安装和卸载：

```typescript
const pluginManager = Core.services.resolve(PluginManager);

// 获取所有已安装的插件
const plugins = pluginManager.getAllPlugins();
```
