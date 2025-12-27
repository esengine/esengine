---
title: "Event System"
description: "Type-safe event system with sync/async events, priorities, and batching"
---

The ECS framework includes a powerful type-safe event system supporting sync/async events, priorities, batching, and more advanced features. The event system is the core mechanism for inter-component and inter-system communication.

## Basic Concepts

The event system implements a publish-subscribe pattern with these core concepts:
- **Event Publisher**: Object that emits events
- **Event Listener**: Object that listens for and handles specific events
- **Event Type**: String identifier to distinguish different event types
- **Event Data**: Related information carried by the event

## Basic Usage

### Using Event System in Scene

Each scene has a built-in event system:

```typescript
class GameScene extends Scene {
  protected initialize(): void {
    // Listen for events
    this.eventSystem.on('player_died', this.onPlayerDied.bind(this));
    this.eventSystem.on('enemy_spawned', this.onEnemySpawned.bind(this));
    this.eventSystem.on('score_changed', this.onScoreChanged.bind(this));
  }

  private onPlayerDied(data: { player: Entity, cause: string }): void {
    console.log(`Player died, cause: ${data.cause}`);
  }

  private onEnemySpawned(data: { enemy: Entity, position: { x: number, y: number } }): void {
    console.log('Enemy spawned at:', data.position);
  }

  private onScoreChanged(data: { newScore: number, oldScore: number }): void {
    console.log(`Score changed: ${data.oldScore} -> ${data.newScore}`);
  }

  // Emit events in systems
  someGameLogic(): void {
    this.eventSystem.emitSync('score_changed', {
      newScore: 1000,
      oldScore: 800
    });
  }
}
```

### Using Events in Systems

Systems can conveniently listen for and send events:

```typescript
@ECSSystem('Combat')
class CombatSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Health, Combat));
  }

  protected onInitialize(): void {
    // Use system's event listener method (auto-cleanup)
    this.addEventListener('player_attack', this.onPlayerAttack.bind(this));
    this.addEventListener('enemy_death', this.onEnemyDeath.bind(this));
  }

  private onPlayerAttack(data: { damage: number, target: Entity }): void {
    const health = data.target.getComponent(Health);
    if (health) {
      health.current -= data.damage;

      if (health.current <= 0) {
        this.scene?.eventSystem.emitSync('enemy_death', {
          enemy: data.target,
          killer: 'player'
        });
      }
    }
  }

  private onEnemyDeath(data: { enemy: Entity, killer: string }): void {
    data.enemy.destroy();
    this.scene?.eventSystem.emitSync('experience_gained', {
      amount: 100,
      source: 'enemy_kill'
    });
  }
}
```

## Advanced Features

### One-Time Listeners

```typescript
// Listen only once
this.eventSystem.once('game_start', this.onGameStart.bind(this));

// Or use configuration object
this.eventSystem.on('level_complete', this.onLevelComplete.bind(this), {
  once: true
});
```

### Priority Control

```typescript
// Higher priority listeners execute first
this.eventSystem.on('damage_dealt', this.onDamageDealt.bind(this), {
  priority: 100 // High priority
});

this.eventSystem.on('damage_dealt', this.updateUI.bind(this), {
  priority: 0 // Default priority
});

this.eventSystem.on('damage_dealt', this.logDamage.bind(this), {
  priority: -100 // Low priority, executes last
});
```

### Async Event Handling

```typescript
protected initialize(): void {
  this.eventSystem.onAsync('save_game', this.onSaveGame.bind(this));
}

private async onSaveGame(data: { saveSlot: number }): Promise<void> {
  console.log(`Saving game to slot ${data.saveSlot}`);
  await this.saveGameData(data.saveSlot);
  console.log('Game saved');
}

// Emit async event
public async triggerSave(): Promise<void> {
  await this.eventSystem.emit('save_game', { saveSlot: 1 });
  console.log('All async save operations complete');
}
```

### Batch Processing

For high-frequency events, use batching to improve performance:

```typescript
protected onInitialize(): void {
  // Configure batch processing for position updates
  this.scene?.eventSystem.setBatchConfig('position_updated', {
    batchSize: 50,
    delay: 16,
    enabled: true
  });

  // Listen for batch events
  this.addEventListener('position_updated:batch', this.onPositionBatch.bind(this));
}

private onPositionBatch(batchData: any): void {
  console.log(`Batch processing ${batchData.count} position updates`);
  for (const event of batchData.events) {
    this.updateMinimap(event.entityId, event.position);
  }
}
```

## Global Event Bus

For cross-scene event communication:

```typescript
import { GlobalEventBus } from '@esengine/ecs-framework';

class GameManager {
  private eventBus = GlobalEventBus.getInstance();

  constructor() {
    this.eventBus.on('player_level_up', this.onPlayerLevelUp.bind(this));
    this.eventBus.on('achievement_unlocked', this.onAchievementUnlocked.bind(this));
  }

  private onPlayerLevelUp(data: { level: number }): void {
    console.log(`Player leveled up to ${data.level}!`);
  }
}
```

## Best Practices

### 1. Event Naming Convention

```typescript
// ✅ Good naming
this.eventSystem.emitSync('player:health_changed', data);
this.eventSystem.emitSync('enemy:spawned', data);
this.eventSystem.emitSync('ui:score_updated', data);

// ❌ Avoid
this.eventSystem.emitSync('event1', data);
this.eventSystem.emitSync('update', data);
```

### 2. Type-Safe Event Data

```typescript
interface PlayerHealthChangedEvent {
  entityId: number;
  oldHealth: number;
  newHealth: number;
  cause: 'damage' | 'healing';
}

class HealthSystem extends EntitySystem {
  private onHealthChanged(data: PlayerHealthChangedEvent): void {
    // TypeScript provides full type checking
    console.log(`Health changed: ${data.oldHealth} -> ${data.newHealth}`);
  }
}
```

### 3. Avoid Event Loops

```typescript
// ❌ Avoid: May cause infinite loop
private onScoreChanged(data: any): void {
  this.scene?.eventSystem.emitSync('score_changed', newData); // Dangerous!
}

// ✅ Correct: Use guard flag
private isProcessingScore = false;

private onScoreChanged(data: any): void {
  if (this.isProcessingScore) return;

  this.isProcessingScore = true;
  this.updateUI(data);
  this.isProcessingScore = false;
}
```

### 4. Clean Up Event Listeners

```typescript
class TemporaryUI {
  private listenerId: string;

  constructor(scene: Scene) {
    this.listenerId = scene.eventSystem.on('ui_update', this.onUpdate.bind(this));
  }

  public destroy(): void {
    if (this.listenerId) {
      scene.eventSystem.off('ui_update', this.listenerId);
    }
  }
}
```
