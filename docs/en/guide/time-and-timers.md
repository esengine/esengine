# Time and Timer System

The ECS framework provides a complete time management and timer system, including time scaling, frame time calculation, and flexible timer scheduling.

## Time Class

The Time class is the core of the framework's time management, providing all game time-related functionality.

### Basic Time Properties

```typescript
import { Time } from '@esengine/ecs-framework';

class GameSystem extends EntitySystem {
  protected process(entities: readonly Entity[]): void {
    // Get frame time (seconds)
    const deltaTime = Time.deltaTime;

    // Get unscaled frame time
    const unscaledDelta = Time.unscaledDeltaTime;

    // Get total game time
    const totalTime = Time.totalTime;

    // Get current frame count
    const frameCount = Time.frameCount;

    console.log(`Frame ${frameCount}, delta: ${deltaTime}s, total: ${totalTime}s`);
  }
}
```

### Game Pause

The framework provides two pause methods for different scenarios:

#### Core.paused (Recommended)

`Core.paused` is a **true pause** - when set, the entire game loop stops:

```typescript
import { Core } from '@esengine/ecs-framework';

class PauseMenuSystem extends EntitySystem {
  public pauseGame(): void {
    // True pause - all systems stop executing
    Core.paused = true;
    console.log('Game paused');
  }

  public resumeGame(): void {
    // Resume game
    Core.paused = false;
    console.log('Game resumed');
  }

  public togglePause(): void {
    Core.paused = !Core.paused;
    console.log(Core.paused ? 'Game paused' : 'Game resumed');
  }
}
```

#### Time.timeScale = 0

`Time.timeScale = 0` only makes `deltaTime` become 0, **systems still execute**:

```typescript
class SlowMotionSystem extends EntitySystem {
  public freezeTime(): void {
    // Time freeze - systems still execute, just deltaTime = 0
    Time.timeScale = 0;
  }
}
```

#### Comparison

| Feature | `Core.paused = true` | `Time.timeScale = 0` |
|---------|---------------------|---------------------|
| System Execution | Completely stopped | Still running |
| CPU Overhead | Zero | Normal overhead |
| Time Updates | Stopped | Continues (deltaTime=0) |
| Timers | Stopped | Continues (but time doesn't advance) |
| Use Cases | Pause menu, game pause | Slow motion, bullet time effects |

**Recommendations**:
- Pause menu, true game pause → Use `Core.paused = true`
- Slow motion, bullet time effects → Use `Time.timeScale`

### Time Scaling

The Time class supports time scaling for slow motion, fast forward, and other effects:

```typescript
class TimeControlSystem extends EntitySystem {
  public enableSlowMotion(): void {
    // Set to slow motion (50% speed)
    Time.timeScale = 0.5;
    console.log('Slow motion enabled');
  }

  public enableFastForward(): void {
    // Set to fast forward (200% speed)
    Time.timeScale = 2.0;
    console.log('Fast forward enabled');
  }

  public enableBulletTime(): void {
    // Bullet time effect (10% speed)
    Time.timeScale = 0.1;
    console.log('Bullet time enabled');
  }

  public resumeNormalSpeed(): void {
    // Resume normal speed
    Time.timeScale = 1.0;
    console.log('Normal speed resumed');
  }

  protected process(entities: readonly Entity[]): void {
    // deltaTime is affected by timeScale
    const scaledDelta = Time.deltaTime; // Affected by time scale
    const realDelta = Time.unscaledDeltaTime; // Not affected by time scale

    for (const entity of entities) {
      const movement = entity.getComponent(Movement);
      if (movement) {
        // Use scaled time for game logic updates
        movement.update(scaledDelta);
      }

      const ui = entity.getComponent(UIComponent);
      if (ui) {
        // UI animations use real time, not affected by game time scale
        ui.update(realDelta);
      }
    }
  }
}
```

### Time Check Utilities

```typescript
class CooldownSystem extends EntitySystem {
  private lastAttackTime = 0;
  private lastSpawnTime = 0;

  constructor() {
    super(Matcher.all(Weapon));
  }

  protected process(entities: readonly Entity[]): void {
    // Check attack cooldown
    if (Time.checkEvery(1.5, this.lastAttackTime)) {
      this.performAttack();
      this.lastAttackTime = Time.totalTime;
    }

    // Check spawn interval
    if (Time.checkEvery(3.0, this.lastSpawnTime)) {
      this.spawnEnemy();
      this.lastSpawnTime = Time.totalTime;
    }
  }

  private performAttack(): void {
    console.log('Performing attack!');
  }

  private spawnEnemy(): void {
    console.log('Spawning enemy!');
  }
}
```

## Core.schedule Timer System

Core provides powerful timer scheduling functionality for creating one-time or repeating timers.

### Basic Timer Usage

```typescript
import { Core } from '@esengine/ecs-framework';

class GameScene extends Scene {
  protected initialize(): void {
    // Create one-time timers
    this.createOneTimeTimers();

    // Create repeating timers
    this.createRepeatingTimers();

    // Create timers with context
    this.createContextTimers();
  }

  private createOneTimeTimers(): void {
    // Execute once after 2 seconds
    Core.schedule(2.0, false, null, (timer) => {
      console.log('Executed after 2 second delay');
    });

    // Show tip after 5 seconds
    Core.schedule(5.0, false, this, (timer) => {
      const scene = timer.getContext<GameScene>();
      scene.showTip('Game tip: 5 seconds have passed!');
    });
  }

  private createRepeatingTimers(): void {
    // Execute every second
    const heartbeatTimer = Core.schedule(1.0, true, null, (timer) => {
      console.log(`Game heartbeat - Total time: ${Time.totalTime.toFixed(1)}s`);
    });

    // Save timer reference for later control
    this.saveTimerReference(heartbeatTimer);
  }

  private createContextTimers(): void {
    const gameData = { score: 0, level: 1 };

    // Add score every 2 seconds
    Core.schedule(2.0, true, gameData, (timer) => {
      const data = timer.getContext<typeof gameData>();
      data.score += 10;
      console.log(`Score increased! Current score: ${data.score}`);
    });
  }

  private saveTimerReference(timer: any): void {
    // Can stop timer later
    setTimeout(() => {
      timer.stop();
      console.log('Timer stopped');
    }, 10000); // Stop after 10 seconds
  }

  private showTip(message: string): void {
    console.log('Tip:', message);
  }
}
```

### Timer Control

```typescript
class TimerControlExample {
  private attackTimer: any;
  private spawnerTimer: any;

  public startCombat(): void {
    // Start attack timer
    this.attackTimer = Core.schedule(0.5, true, this, (timer) => {
      const self = timer.getContext<TimerControlExample>();
      self.performAttack();
    });

    // Start enemy spawn timer
    this.spawnerTimer = Core.schedule(3.0, true, null, (timer) => {
      this.spawnEnemy();
    });
  }

  public stopCombat(): void {
    // Stop all combat-related timers
    if (this.attackTimer) {
      this.attackTimer.stop();
      console.log('Attack timer stopped');
    }

    if (this.spawnerTimer) {
      this.spawnerTimer.stop();
      console.log('Spawn timer stopped');
    }
  }

  public resetAttackTimer(): void {
    // Reset attack timer
    if (this.attackTimer) {
      this.attackTimer.reset();
      console.log('Attack timer reset');
    }
  }

  private performAttack(): void {
    console.log('Performing attack');
  }

  private spawnEnemy(): void {
    console.log('Spawning enemy');
  }
}
```

## Best Practices

### 1. Use Appropriate Time Types

```typescript
class MovementSystem extends EntitySystem {
  protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const movement = entity.getComponent(Movement);

      // Use scaled time for game logic
      movement.position.x += movement.velocity.x * Time.deltaTime;

      // Use real time for UI animations (not affected by game pause)
      const ui = entity.getComponent(UIAnimation);
      if (ui) {
        ui.update(Time.unscaledDeltaTime);
      }
    }
  }
}
```

### 2. Timer Management

```typescript
class TimerManager {
  private timers: any[] = [];

  public createManagedTimer(duration: number, repeats: boolean, callback: () => void): any {
    const timer = Core.schedule(duration, repeats, null, callback);
    this.timers.push(timer);
    return timer;
  }

  public stopAllTimers(): void {
    for (const timer of this.timers) {
      timer.stop();
    }
    this.timers = [];
  }

  public cleanupCompletedTimers(): void {
    this.timers = this.timers.filter(timer => !timer.isDone);
  }
}
```

### 3. Avoid Too Many Timers

```typescript
// Avoid: Creating a timer for each entity
class BadExample extends EntitySystem {
  protected onAdded(entity: Entity): void {
    Core.schedule(1.0, true, entity, (timer) => {
      // One timer per entity - poor performance
    });
  }
}

// Recommended: Manage time uniformly in the system
class GoodExample extends EntitySystem {
  private lastUpdateTime = 0;

  protected process(entities: readonly Entity[]): void {
    // Execute logic once per second
    if (Time.checkEvery(1.0, this.lastUpdateTime)) {
      this.processAllEntities(entities);
      this.lastUpdateTime = Time.totalTime;
    }
  }

  private processAllEntities(entities: readonly Entity[]): void {
    // Batch process all entities
  }
}
```

### 4. Timer Context Usage

```typescript
interface TimerContext {
  entityId: number;
  duration: number;
  onComplete: () => void;
}

class ContextualTimerExample {
  public createEntityTimer(entityId: number, duration: number, onComplete: () => void): void {
    const context: TimerContext = {
      entityId,
      duration,
      onComplete
    };

    Core.schedule(duration, false, context, (timer) => {
      const ctx = timer.getContext<TimerContext>();
      console.log(`Timer for entity ${ctx.entityId} completed`);
      ctx.onComplete();
    });
  }
}
```

The time and timer system is an essential tool in game development. Using these features correctly will make your game logic more precise and controllable.
