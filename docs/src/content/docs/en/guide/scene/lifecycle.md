---
title: "Scene Lifecycle"
description: "Scene lifecycle methods and execution order"
---

Scene provides complete lifecycle management for proper resource initialization and cleanup.

## Lifecycle Methods

```typescript
class ExampleScene extends Scene {
  protected initialize(): void {
    // 1. Scene initialization: setup systems and initial entities
    console.log("Scene initializing");
  }

  public onStart(): void {
    // 2. Scene starts running: game logic begins execution
    console.log("Scene starting");
  }

  public update(deltaTime: number): void {
    // 3. Per-frame update (called by scene manager)
  }

  public unload(): void {
    // 4. Scene unloading: cleanup resources
    console.log("Scene unloading");
  }
}
```

## Execution Order

| Phase | Method | Description |
|-------|--------|-------------|
| Initialize | `initialize()` | Setup systems and initial entities |
| Start | `begin()` / `onStart()` | Scene starts running |
| Update | `update()` | Per-frame update (auto-called) |
| End | `end()` / `unload()` | Cleanup resources |

## Lifecycle Example

```typescript
class GameScene extends Scene {
  private resourcesLoaded = false;

  protected initialize(): void {
    this.name = "GameScene";

    // 1. Add systems (by dependency order)
    this.addSystem(new InputSystem());
    this.addSystem(new MovementSystem());
    this.addSystem(new RenderSystem());

    // 2. Create initial entities
    this.createPlayer();
    this.createEnemies();

    // 3. Setup event listeners
    this.setupEvents();
  }

  public onStart(): void {
    this.resourcesLoaded = true;
    console.log("Scene resources loaded, game starting");
  }

  public unload(): void {
    // Cleanup event listeners
    this.eventSystem.clear();

    // Cleanup other resources
    this.resourcesLoaded = false;
    console.log("Scene resources cleaned up");
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
      console.log('Player died');
    });
  }
}
```

## Notes

1. **initialize() called once** - For initial state setup
2. **onStart() on scene activation** - May be called multiple times
3. **unload() must cleanup resources** - Avoid memory leaks
4. **update() managed by framework** - No manual calls needed
