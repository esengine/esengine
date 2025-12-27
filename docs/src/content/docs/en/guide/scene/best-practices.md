---
title: "Best Practices"
description: "Scene design patterns and complete examples"
---

## Scene Responsibility Separation

```typescript
// Good scene design - clear responsibilities
class MenuScene extends Scene {
  // Only handles menu-related logic
}

class GameScene extends Scene {
  // Only handles gameplay logic
}

class InventoryScene extends Scene {
  // Only handles inventory logic
}

// Avoid this design - mixed responsibilities
class MegaScene extends Scene {
  // Contains menu, game, inventory, and all other logic
}
```

## Resource Management

```typescript
class ResourceScene extends Scene {
  private textures: Map<string, any> = new Map();
  private sounds: Map<string, any> = new Map();

  protected initialize(): void {
    this.loadResources();
  }

  private loadResources(): void {
    this.textures.set('player', this.loadTexture('player.png'));
    this.sounds.set('bgm', this.loadSound('bgm.mp3'));
  }

  public unload(): void {
    // Cleanup resources
    this.textures.clear();
    this.sounds.clear();
    console.log('Scene resources cleaned up');
  }

  private loadTexture(path: string): any { return null; }
  private loadSound(path: string): any { return null; }
}
```

## Initialization Order

```typescript
class ProperInitScene extends Scene {
  protected initialize(): void {
    // 1. First set scene configuration
    this.name = "GameScene";

    // 2. Then add systems (by dependency order)
    this.addSystem(new InputSystem());
    this.addSystem(new MovementSystem());
    this.addSystem(new PhysicsSystem());
    this.addSystem(new RenderSystem());

    // 3. Create entities last
    this.createEntities();

    // 4. Setup event listeners
    this.setupEvents();
  }

  private createEntities(): void { /* ... */ }
  private setupEvents(): void { /* ... */ }
}
```

## Complete Example

```typescript
import { Scene, EntitySystem, Entity, Matcher } from '@esengine/ecs-framework';

// Define components
class Transform {
  constructor(public x: number, public y: number) {}
}

class Velocity {
  constructor(public vx: number, public vy: number) {}
}

class Health {
  constructor(public value: number) {}
}

// Define system
class MovementSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Transform, Velocity));
  }

  process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const transform = entity.getComponent(Transform);
      const velocity = entity.getComponent(Velocity);

      if (transform && velocity) {
        transform.x += velocity.vx;
        transform.y += velocity.vy;
      }
    }
  }
}

// Define scene
class GameScene extends Scene {
  protected initialize(): void {
    this.name = "GameScene";

    // Add systems
    this.addSystem(new MovementSystem());

    // Create player
    const player = this.createEntity("Player");
    player.addComponent(new Transform(400, 300));
    player.addComponent(new Velocity(0, 0));
    player.addComponent(new Health(100));

    // Create enemies
    for (let i = 0; i < 5; i++) {
      const enemy = this.createEntity(`Enemy_${i}`);
      enemy.addComponent(new Transform(
        Math.random() * 800,
        Math.random() * 600
      ));
      enemy.addComponent(new Velocity(
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      ));
      enemy.addComponent(new Health(50));
    }

    // Setup event listeners
    this.eventSystem.on('player_died', () => {
      console.log('Player died!');
    });
  }

  public onStart(): void {
    console.log('Game scene started');
  }

  public unload(): void {
    console.log('Game scene unloaded');
    this.eventSystem.clear();
  }
}

// Use scene
import { Core, SceneManager } from '@esengine/ecs-framework';

Core.create({ debug: true });
const sceneManager = Core.services.resolve(SceneManager);
sceneManager.setScene(new GameScene());
```

## Design Principles

| Principle | Description |
|-----------|-------------|
| Single Responsibility | Each scene handles one game state |
| Resource Cleanup | Clean up all resources in `unload()` |
| System Order | Add systems: Input → Logic → Render |
| Event Decoupling | Use event system for scene communication |
| Layered Initialization | Config → Systems → Entities → Events |
