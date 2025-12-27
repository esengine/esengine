---
title: "Event System"
description: "Scene's built-in type-safe event system"
---

Scene includes a built-in type-safe event system for decoupled communication within scenes.

## Basic Usage

### Listening to Events

```typescript
class EventScene extends Scene {
  protected initialize(): void {
    // Listen to events
    this.eventSystem.on('player_died', this.onPlayerDied.bind(this));
    this.eventSystem.on('enemy_spawned', this.onEnemySpawned.bind(this));
    this.eventSystem.on('level_complete', this.onLevelComplete.bind(this));
  }

  private onPlayerDied(data: any): void {
    console.log('Player died event');
  }

  private onEnemySpawned(data: any): void {
    console.log('Enemy spawned event');
  }

  private onLevelComplete(data: any): void {
    console.log('Level complete event');
  }
}
```

### Sending Events

```typescript
public triggerGameEvent(): void {
  // Send event (synchronous)
  this.eventSystem.emitSync('custom_event', {
    message: "This is a custom event",
    timestamp: Date.now()
  });

  // Send event (asynchronous)
  this.eventSystem.emit('async_event', {
    data: "Async event data"
  });
}
```

## API Reference

| Method | Description |
|--------|-------------|
| `on(event, callback)` | Listen to event |
| `once(event, callback)` | Listen once (auto-unsubscribe) |
| `off(event, callback)` | Stop listening |
| `emitSync(event, data)` | Send event (synchronous) |
| `emit(event, data)` | Send event (asynchronous) |
| `clear()` | Clear all event listeners |

## Event Handling Patterns

### Centralized Event Management

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
    // Pause game logic
    this.systems.forEach(system => {
      if (system instanceof GameLogicSystem) {
        system.enabled = false;
      }
    });
  }

  private onGameResume(): void {
    // Resume game logic
    this.systems.forEach(system => {
      if (system instanceof GameLogicSystem) {
        system.enabled = true;
      }
    });
  }

  private onPlayerInput(data: any): void {
    // Handle player input
  }
}
```

### Cleanup Event Listeners

Clean up event listeners on scene unload to avoid memory leaks:

```typescript
public unload(): void {
  // Clear all event listeners
  this.eventSystem.clear();
}
```

## Use Cases

| Category | Example Events |
|----------|----------------|
| Game State | `game_start`, `game_pause`, `game_over` |
| Player Actions | `player_died`, `player_jump`, `player_attack` |
| Enemy Actions | `enemy_spawned`, `enemy_killed` |
| Level Progress | `level_start`, `level_complete` |
| UI Interaction | `button_click`, `menu_open` |
