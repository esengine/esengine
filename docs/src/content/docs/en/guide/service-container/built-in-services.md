---
title: "Built-in Services"
description: "Services automatically registered by Core"
---

Core automatically registers the following built-in services during initialization:

## TimerManager

Timer manager responsible for managing all game timers:

```typescript
const timerManager = Core.services.resolve(TimerManager);

// Create a timer
timerManager.schedule(1.0, false, null, (timer) => {
    console.log('Executed after 1 second');
});
```

## PerformanceMonitor

Performance monitor for tracking game performance:

```typescript
const monitor = Core.services.resolve(PerformanceMonitor);

// Enable performance monitoring
monitor.enable();

// Get performance data
const fps = monitor.getFPS();
```

## SceneManager

Scene manager for single-scene application lifecycle:

```typescript
const sceneManager = Core.services.resolve(SceneManager);

// Set current scene
sceneManager.setScene(new GameScene());

// Get current scene
const currentScene = sceneManager.currentScene;

// Delayed scene switch
sceneManager.loadScene(new MenuScene());
```

## WorldManager

World manager for managing multiple independent World instances (advanced use case):

```typescript
const worldManager = Core.services.resolve(WorldManager);

// Create independent game worlds
const gameWorld = worldManager.createWorld('game_room_001', {
  name: 'GameRoom',
  maxScenes: 5
});

// Create scene in World
const scene = gameWorld.createScene('battle', new BattleScene());
gameWorld.setSceneActive('battle', true);

// Update all Worlds
worldManager.updateAll();
```

**Use Cases**:
- **SceneManager**: Suitable for 95% of games (single-player, simple multiplayer)
- **WorldManager**: Suitable for MMO servers, game room systems requiring complete isolation

## PoolManager

Object pool manager:

```typescript
const poolManager = Core.services.resolve(PoolManager);

// Create object pool
const bulletPool = poolManager.createPool('bullets', () => new Bullet(), 100);
```

## PluginManager

Plugin manager for installing and uninstalling plugins:

```typescript
const pluginManager = Core.services.resolve(PluginManager);

// Get all installed plugins
const plugins = pluginManager.getAllPlugins();
```
