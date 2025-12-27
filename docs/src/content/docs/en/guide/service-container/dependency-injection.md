---
title: "Dependency Injection"
description: "Decorators and automatic dependency injection"
---

ECS Framework provides decorators to simplify dependency injection.

## @Injectable Decorator

Marks a class as injectable:

```typescript
import { Injectable, IService } from '@esengine/ecs-framework';

@Injectable()
class GameService implements IService {
    constructor() {
        console.log('GameService created');
    }

    dispose(): void {
        console.log('GameService disposed');
    }
}
```

## @InjectProperty Decorator

Injects dependencies via property decorator. Injection occurs after constructor execution, before `onInitialize()` is called:

```typescript
import { Injectable, InjectProperty, IService } from '@esengine/ecs-framework';

@Injectable()
class PlayerService implements IService {
    @InjectProperty(DataService)
    private data!: DataService;

    @InjectProperty(GameService)
    private game!: GameService;

    dispose(): void {
        // Cleanup resources
    }
}
```

### Usage in EntitySystem

```typescript
@Injectable()
class CombatSystem extends EntitySystem {
    @InjectProperty(TimeService)
    private timeService!: TimeService;

    @InjectProperty(AudioService)
    private audio!: AudioService;

    constructor() {
        super(Matcher.all(Health, Attack));
    }

    onInitialize(): void {
        // Properties are injected at this point
        console.log('Delta time:', this.timeService.getDeltaTime());
    }

    processEntity(entity: Entity): void {
        this.audio.playSound('attack');
    }
}
```

> **Note**: Use `!` assertion when declaring properties (e.g., `private data!: DataService`) to indicate the property will be injected before use.

## Registering Injectable Services

Use `registerInjectable` to automatically handle dependency injection:

```typescript
import { registerInjectable } from '@esengine/ecs-framework';

// Register service (automatically resolves @InjectProperty dependencies)
registerInjectable(Core.services, PlayerService);

// Property dependencies are automatically injected on resolution
const player = Core.services.resolve(PlayerService);
```

## @Updatable Decorator

Marks a service as updatable, making it automatically called each frame:

```typescript
import { Injectable, Updatable, IService, IUpdatable } from '@esengine/ecs-framework';

@Injectable()
@Updatable()  // Default priority is 0
class PhysicsService implements IService, IUpdatable {
    update(deltaTime?: number): void {
        // Update physics simulation each frame
    }

    dispose(): void {}
}

// Specify update priority (lower values execute first)
@Injectable()
@Updatable(10)
class RenderService implements IService, IUpdatable {
    update(deltaTime?: number): void {
        // Render each frame
    }

    dispose(): void {}
}
```

Services with `@Updatable` decorator are automatically called by Core:

```typescript
function gameLoop(deltaTime: number) {
    Core.update(deltaTime);  // Automatically updates all updatable services
}
```

## Service Dependencies

Recommended to use `@InjectProperty` for service dependencies:

```typescript
@Injectable()
class ConfigService implements IService {
    private config: any = {};

    get(key: string) {
        return this.config[key];
    }

    dispose(): void {
        this.config = {};
    }
}

@Injectable()
class NetworkService implements IService {
    @InjectProperty(ConfigService)
    private config!: ConfigService;

    onInitialize(): void {
        // Use injected service in onInitialize
        const apiUrl = this.config.get('apiUrl');
    }

    dispose(): void {}
}

// Register services (in dependency order)
registerInjectable(Core.services, ConfigService);
registerInjectable(Core.services, NetworkService);
```

## @Inject Constructor Decorator

:::caution[Compatibility Warning]
The `@Inject` constructor parameter decorator may **not be supported** in **Cocos Creator** and **LayaAir**, as these engines' build tools may have issues processing constructor parameter decorators.

**Recommended**: Always use `@InjectProperty` property decorator, which works correctly on all platforms.
:::

```typescript
// ⚠️ Not recommended: Constructor injection (may not work in Cocos/Laya)
@Injectable()
class NetworkService implements IService {
    constructor(
        @Inject(ConfigService) private config: ConfigService
    ) {}
}

// ✅ Recommended: Property injection (compatible with all platforms)
@Injectable()
class NetworkService implements IService {
    @InjectProperty(ConfigService)
    private config!: ConfigService;

    onInitialize(): void {
        // Use injected service here
    }
}
```
